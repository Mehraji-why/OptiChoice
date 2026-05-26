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
  "categorical_constraints": [
    {{
      "field": "chip_brand",
      "value": "Apple",
      "values": null,
      "match_type": "exact",
      "violation_penalty": 0.0,
      "source": "explicit"
    }}
  ],
  "soft_constraints": {{
    "factor_name": 0.0_to_1.0_importance
  }},
  "inferred_weights": {{
    "factor_name": 0.0_to_1.0_weight
  }},
  "tradeoff_tolerance": 0.0_to_1.0,
  "budget_sensitivity": 0.0_to_1.0,
  "strict_budget": true,
  "future_proofing_intent": true_or_false,
  "use_case_tags": ["tag1", "tag2"],
  "inference_confidence": 0.0_to_1.0,
  "inference_notes": "brief explanation of what you inferred and why"
}}

─── CATEGORICAL CONSTRAINT RULES ───
Categorical constraints are NON-NEGOTIABLE requirements on specific product attributes.
They are checked before any scoring. Violations disqualify the product entirely.

Extract a categorical constraint whenever the user:
  - Names a chip, brand, or platform explicitly ("only Apple", "must be Intel", "M3 chip")
  - Names an OS ("Windows only", "needs MacOS", "no ChromeOS")
  - States a minimum spec ("at least 16GB RAM", "minimum 512GB storage", "RTX 4060 or better")
  - States a maximum physical attribute ("under 1.5kg", "must fit in a bag")
  - Excludes something ("no AMD", "not Qualcomm", "avoid gaming laptops")

Field names to use (match your catalog schema):
  chip_brand     — "Apple" | "Intel" | "AMD" | "Qualcomm" | "MediaTek"
  chip_series    — "M3" | "M3 Pro" | "Snapdragon X Elite" | "Core Ultra 7" etc.
  os             — "Windows" | "macOS" | "ChromeOS" | "Linux"
  ram_gb         — numeric, use match_type "minimum"
  storage_gb     — numeric, use match_type "minimum"
  weight_kg      — numeric, use match_type "maximum"
  gpu_brand      — "NVIDIA" | "AMD" | "Intel" | "Apple"
  gpu_model      — specific model e.g. "RTX 4060"

match_type rules:
  "exact"    — field must equal value exactly (case-insensitive). Use for brand/OS/chip.
  "one_of"   — field must be in values list. Use when user names multiple acceptable options.
  "minimum"  — field >= value (numeric). Use for RAM, storage, RAM.
  "maximum"  — field <= value (numeric). Use for weight, price (budget handled separately).
  "excludes" — field must NOT equal value. Use for "no AMD", "not Windows".

violation_penalty:
  0.0 — complete disqualification. Use when user says "only", "must", "need", "require", "no X".
  0.1 — heavy penalty but survives. Use when user says "prefer", "ideally", "if possible".

source:
  "explicit" — user stated this directly in clear language.
  "inferred" — derived from context (e.g. "for Final Cut Pro workflow" → chip_brand=Apple, os=macOS).

If no categorical constraints exist, set "categorical_constraints": [].
Do NOT invent constraints the user did not state or strongly imply.

─── NUMERIC HARD CONSTRAINTS ───
hard_constraints handles budget and numeric physical limits:
  budget        — always set from the input budget value
  max_weight_kg — only if user stated a weight requirement (else null)
  min_ram_gb    — only if user stated RAM requirement (numeric min)
  min_storage_gb — only if user stated storage requirement

─── OTHER RULES ───
1. inferred_weights MUST cover all relevant factors from the available list.
   Include ALL factors — even low-priority ones get a small non-zero weight.
   Weights do NOT need to sum to 1.0 — the engine normalizes them.
2. Do NOT assign equal weights to everything. Differentiate clearly.
3. soft_constraints: things the user wants but could trade.
4. tradeoff_tolerance: 0 = wants perfect match, 1 = accepts heavy compromise.
5. budget_sensitivity rules:
   - "under ₹X", "max ₹X", "strict", "cannot exceed", "hard limit" → 0.95
   - "around ₹X", "roughly", "approximately" → 0.65
   - "flexible", "willing to stretch", "if needed" → 0.30
   - No qualifier → 0.75 (default firm)
   - true if user says:
     "strictly under", "cannot exceed", "hard limit", "max", "under no circumstances"
   - false if user says:
     "around", "approximately", "can stretch", "flexible"
6. inference_confidence: 1.0 = user was very clear, 0.0 = highly ambiguous.
7. use_case_tags: from [student, gaming, creator, travel, professional, general].
8. inference_notes: explain what categorical constraints you extracted and why,
   and what budget_sensitivity you set and why.
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
            factors = profile.expected_factors
            raw_data["inferred_weights"] = {f: 1.0 / len(factors) for f in factors}
            raw_data["inference_confidence"] = min(
                raw_data.get("inference_confidence", 1.0), 0.4
            )

        # Ensure budget is always in hard_constraints
        if "hard_constraints" not in raw_data:
            raw_data["hard_constraints"] = {}
        raw_data["hard_constraints"]["budget"] = budget

        # Ensure categorical_constraints is always a list (Gemini may omit it)
        if "categorical_constraints" not in raw_data:
            raw_data["categorical_constraints"] = []

        # Validate each categorical constraint has required fields; drop malformed ones
        valid_constraints = []
        for c in raw_data["categorical_constraints"]:
            if not isinstance(c, dict):
                continue
            if "field" not in c or "match_type" not in c:
                continue
            # Ensure at least value or values is present
            if c.get("value") is None and not c.get("values"):
                continue
            # Default violation_penalty to 0.0 (disqualify) if missing
            c.setdefault("violation_penalty", 0.0)
            c.setdefault("source", "explicit")
            valid_constraints.append(c)
        raw_data["categorical_constraints"] = valid_constraints

        preference_model = PreferenceModel(**raw_data)
        return preference_model

    except Exception as e:
        fallback = _fallback_preference_model(profile, budget)
        fallback.inference_notes = (
            f"Preference model validation failed ({str(e)[:120]}). Using fallback."
        )
        return fallback