"""
inference.py — Layer 1: Semantic Inference Engine.

Gemini's ONLY job on the input side:
  Convert vague human language → typed PreferenceModel.

Gemini does NOT score products. Does NOT rank. Does NOT suggest.
It extracts structured mathematical intent from language.

Output is a PreferenceModel — deterministic optimization consumes this.

Design:
  - Strict JSON output from Gemini, validated by Pydantic
  - Fallback extraction if JSON is malformed
  - inference_confidence reflects ambiguity in the user's language
  - All weights are normalized to sum to 1.0 before leaving this layer
"""

import json
import re
import os
from typing import Any, Dict, List, Optional

from google import genai
from models import PreferenceModel
from profiles import BaseProfile


# ─────────────────────────────────────────────
# GEMINI CLIENT
# ─────────────────────────────────────────────

def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in environment")
    return genai.Client(api_key=api_key)


# ─────────────────────────────────────────────
# PROMPT CONSTRUCTION
# ─────────────────────────────────────────────

def _build_inference_prompt(
    user_needs: str,
    budget: float,
    profile: BaseProfile,
    constraints: Optional[List[str]] = None,
) -> str:
    factors = profile.expected_factors
    constraints_text = (
        "\n".join(f"  - {c}" for c in constraints)
        if constraints else "  None stated"
    )

    return f"""You are a precision semantic parser for a decision optimization engine.

Your ONLY job: convert the user's natural language into a structured preference model.
You do NOT rank products. You do NOT make recommendations. You extract mathematical intent.

─── USER INPUT ───
User needs: "{user_needs}"
Budget: {budget} (local currency)
Domain: {profile.domain}
Explicit constraints: 
{constraints_text}

─── AVAILABLE FACTORS ───
{', '.join(factors)}

─── YOUR OUTPUT ───
Return ONLY valid JSON. No markdown. No explanation. No preamble.

The JSON must have exactly this structure:

{{
  "hard_constraints": {{
    "budget": {budget},
    "max_weight_kg": null
  }},
  "soft_constraints": {{
    "factor_name": 0.0_to_1.0_importance
  }},
  "inferred_weights": {{
    "factor_name": 0.0_to_1.0_weight
  }},
  "tradeoff_tolerance": 0.0_to_1.0,
  "budget_sensitivity": 0.0_to_1.0,
  "future_proofing_intent": true_or_false,
  "use_case_tags": ["tag1", "tag2"],
  "inference_confidence": 0.0_to_1.0,
  "inference_notes": "brief explanation of what you inferred and why"
}}

─── RULES ───
1. inferred_weights MUST cover all relevant factors from the available list.
   Include ALL factors — even low-priority ones get a small non-zero weight.
   Weights do NOT need to sum to 1.0 — the engine normalizes them.
2. Do NOT assign equal weights to everything. Differentiate clearly.
3. hard_constraints: only things the user CANNOT compromise on.
4. soft_constraints: things the user wants but could trade.
5. tradeoff_tolerance: 0 = wants perfect match, 1 = accepts heavy compromise.
6. budget_sensitivity: 0 = budget is flexible, 1 = hard ceiling.
7. inference_confidence: 1.0 = user was very clear, 0.0 = highly ambiguous input.
8. use_case_tags: from [student, gaming, creator, travel, professional, general].
9. inference_notes: 1–2 sentences explaining your reasoning.
"""


# ─────────────────────────────────────────────
# JSON EXTRACTION
# ─────────────────────────────────────────────

def _extract_json(text: str) -> Dict[str, Any]:
    """
    Robustly extract JSON from Gemini output.
    Handles markdown fences, preamble text, trailing content.
    """
    # Strip markdown fences
    text = re.sub(r"```(?:json)?", "", text).strip()
    text = text.rstrip("`").strip()

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from Gemini output: {text[:300]}")


# ─────────────────────────────────────────────
# WEIGHT NORMALIZATION
# ─────────────────────────────────────────────

def _normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    """Normalize weights to sum to 1.0. Handles zero-sum edge case."""
    total = sum(abs(v) for v in weights.values())
    if total == 0:
        n = len(weights)
        return {k: 1.0 / n for k in weights}
    return {k: v / total for k, v in weights.items()}


# ─────────────────────────────────────────────
# FALLBACK PREFERENCE MODEL
# (Used when Gemini output is unusable)
# ─────────────────────────────────────────────

def _fallback_preference_model(
    profile: BaseProfile,
    budget: float,
) -> PreferenceModel:
    """
    Produce a uniform-weight preference model when inference fails.
    Flags low inference_confidence so downstream can warn the user.
    """
    factors = profile.expected_factors
    equal_weight = 1.0 / len(factors)
    return PreferenceModel(
        hard_constraints={"budget": budget},
        soft_constraints={},
        inferred_weights={f: equal_weight for f in factors},
        tradeoff_tolerance=0.5,
        budget_sensitivity=0.7,
        future_proofing_intent=False,
        use_case_tags=["general"],
        inference_confidence=0.15,
        inference_notes="Fallback: could not reliably extract preferences from user input. Using equal weights.",
    )


# ─────────────────────────────────────────────
# MAIN INFERENCE FUNCTION
# ─────────────────────────────────────────────

def infer_preferences(
    user_needs: str,
    budget: float,
    profile: BaseProfile,
    constraints: Optional[List[str]] = None,
) -> PreferenceModel:
    """
    Layer 1: Convert raw user language to structured PreferenceModel.
    
    This is the ONLY Gemini call on the input side.
    Returns a fully validated PreferenceModel.
    
    On failure: returns a fallback model with low inference_confidence
    rather than raising — the optimizer can still run, just with degraded input.
    """
    client = _get_client()
    prompt = _build_inference_prompt(user_needs, budget, profile, constraints)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        raw_text = response.text.strip()
        raw_data = _extract_json(raw_text)

    except Exception as e:
        # Network failure, API error, or JSON extraction failure
        fallback = _fallback_preference_model(profile, budget)
        fallback.inference_notes = (
            f"Inference failed ({type(e).__name__}: {str(e)[:120]}). Using fallback weights."
        )
        return fallback

    try:
        # Normalize weights before handing to optimizer
        weights = raw_data.get("inferred_weights", {})
        if weights:
            raw_data["inferred_weights"] = _normalize_weights(weights)
        else:
            # If Gemini omitted weights, build equal fallback
            factors = profile.expected_factors
            raw_data["inferred_weights"] = {f: 1.0 / len(factors) for f in factors}
            raw_data["inference_confidence"] = min(
                raw_data.get("inference_confidence", 1.0), 0.4
            )

        # Ensure budget is always in hard_constraints
        if "hard_constraints" not in raw_data:
            raw_data["hard_constraints"] = {}
        raw_data["hard_constraints"]["budget"] = budget

        preference_model = PreferenceModel(**raw_data)
        return preference_model

    except Exception as e:
        # Pydantic validation failed — Gemini returned structurally wrong data
        fallback = _fallback_preference_model(profile, budget)
        fallback.inference_notes = (
            f"Preference model validation failed ({str(e)[:120]}). Using fallback."
        )
        return fallback
