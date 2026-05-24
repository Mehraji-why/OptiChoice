"""
explainer.py — Layer 3: Explanation Generation Engine.

Gemini's ONLY job on the output side:
  Convert structured mathematical results → human-readable explanations.

Gemini receives:
  - computed scores (not raw data)
  - identified tradeoffs (not the algorithm)
  - sensitivity analysis results (not product specs)
  - interaction effects that fired (not catalog values)

Gemini NEVER sees:
  - raw product catalog
  - user's original text
  - the optimization algorithm internals

This ensures explanations are mathematically traceable — not hallucinated.

Design:
  - Explanations are generated per product for top N only (cost efficiency)
  - Structured prompt → structured output → attach to RankedProduct
  - Fallback: structural explanation from math artifacts if Gemini fails
  - All explanations are deterministic in content — Gemini only adds language
"""

import json
import os
import re
from typing import Any, Dict, List, Optional

from google import genai
from models import RankedProduct, TradeoffPressureArtifact, SensitivitySuggestion, AnalysisResult


# ─────────────────────────────────────────────
# GEMINI CLIENT
# ─────────────────────────────────────────────

def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in environment")
    return genai.Client(api_key=api_key)


# ─────────────────────────────────────────────
# STRUCTURAL FALLBACK EXPLANATION
# (Generated from math artifacts when Gemini is unavailable)
# ─────────────────────────────────────────────

def _structural_explanation(product: RankedProduct) -> str:
    """
    Generate a factual explanation from the optimization artifacts alone.
    No AI needed — just structured math output translated to sentences.
    """
    parts = []

    # Top contributors
    if product.positive_contributors:
        top = product.positive_contributors[:2]
        factor_names = [c["factor"].replace("_", " ") for c in top]
        parts.append(f"Ranked highest due to strong performance in {' and '.join(factor_names)}.")

    # Penalties
    if product.penalty_contributors:
        penalty = product.penalty_contributors[0]
        reason = penalty.get("reason", "")
        factor = penalty["factor"].replace("_", " ")
        if reason:
            parts.append(f"Penalized for {factor}: {reason}.")
        else:
            parts.append(f"Lower score on {factor} created some drag on overall utility.")

    # Interactions
    if product.interactions_fired:
        for event in product.interactions_fired[:1]:
            parts.append(f"Note: {event.description}.")

    # Pareto status
    if product.is_pareto_optimal:
        parts.append("This option is Pareto-optimal — no other option is strictly better on every dimension.")

    # Regret framing
    if product.regret_framing:
        parts.append(product.regret_framing + ".")

    return " ".join(parts) if parts else "Scored well across your key priorities."


def _structural_tradeoff_summary(product: RankedProduct) -> str:
    """Structural tradeoff summary from math artifacts."""
    if not product.penalty_contributors and not product.interactions_fired:
        return "No significant tradeoffs identified."
    parts = []
    for penalty in product.penalty_contributors[:2]:
        f = penalty["factor"].replace("_", " ")
        parts.append(f"{f} is a limiting factor")
    for event in product.interactions_fired[:1]:
        if event.effect_type == "penalty":
            parts.append(event.description)
    return "; ".join(parts) + "." if parts else "Minor tradeoffs exist."


# ─────────────────────────────────────────────
# PER-PRODUCT EXPLANATION PROMPT
# ─────────────────────────────────────────────

def _build_product_explanation_prompt(
    product: RankedProduct,
    rank_context: Dict[str, Any],
) -> str:
    contributors_text = "\n".join(
        f"  - {c['factor'].replace('_',' ')}: contributed {c['contribution']:.3f} utility (weight={c['weight']:.2f}, normalized_value={c['normalized_value']:.2f})"
        for c in (product.positive_contributors or [])[:4]
    )
    penalties_text = "\n".join(
        f"  - {p['factor'].replace('_',' ')}: reduced utility by {abs(p['contribution']):.3f}"
        for p in (product.penalty_contributors or [])[:3]
    )
    interactions_text = "\n".join(
        f"  - [{e.effect_type}] {e.description} (magnitude: {e.magnitude:.2f})"
        for e in (product.interactions_fired or [])[:3]
    )
    sensitivity_text = "\n".join(
        f"  - {s.change_description} → +{s.marginal_utility_gain:.3f} utility"
        for s in (product.sensitivity_suggestions or [])[:2]
    )

    return f"""You are generating a precise, mathematically grounded explanation for a decision engine.

─── OPTIMIZATION RESULT ───
Product: {product.name}
Rank: #{product.rank}
Utility score: {product.utility_score:.3f} / 1.000
TOPSIS closeness: {product.topsis_closeness:.3f} / 1.000
Regret score: {product.regret_score:.3f} (0=no sacrifice, 1=maximum regret)
Final hybrid score: {product.final_rank_score:.3f}
Pareto optimal: {product.is_pareto_optimal}
Within budget: {product.within_budget} ({f"+{product.budget_overage_pct:.1f}% over" if not product.within_budget else "within limit"})
Data completeness: {product.data_completeness:.0%}
Statistically equivalent to adjacent rank: {product.is_statistically_equivalent}

─── POSITIVE CONTRIBUTORS ───
{contributors_text or "  None identified"}

─── PENALTIES ───
{penalties_text or "  None significant"}

─── INTERACTION EFFECTS THAT FIRED ───
{interactions_text or "  None fired"}

─── SENSITIVITY (what would improve this) ───
{sensitivity_text or "  No improvements computed"}

─── CONTEXT ───
Ranking confidence: {rank_context.get('ranking_confidence', 1.0):.2f}
Tradeoff pressure: {rank_context.get('pressure_score', 0.0):.2f}

─── YOUR TASK ───
Write 2–3 sentences (no lists, no headers) explaining:
1. Why this product ranked where it did — cite the dominant contributors specifically
2. What tradeoffs or penalties exist — be specific about what fired
3. What the regret score means for this user

Tone: precise, factual, confident. Do NOT use phrases like "based on my analysis" or "the algorithm suggests."
Write as if explaining a mathematical result to an informed adult.
Maximum 3 sentences. Output only the explanation text — no JSON, no labels.
"""


# ─────────────────────────────────────────────
# GLOBAL CONTEXT EXPLANATION PROMPT
# ─────────────────────────────────────────────

def _build_global_explanation_prompt(
    result: "AnalysisResult",
    tradeoff: TradeoffPressureArtifact,
    global_sensitivity: List[SensitivitySuggestion],
) -> str:
    top = result.ranked_products[0] if result.ranked_products else None
    weights_text = "\n".join(
        f"  {factor}: {weight:.3f}"
        for factor, weight in sorted(result.inferred_weights.items(), key=lambda x: x[1], reverse=True)[:5]
    )
    sensitivity_text = "\n".join(
        f"  - {s.change_description} → +{s.marginal_utility_gain:.3f} utility gain"
        for s in global_sensitivity[:3]
    )
    eq_groups_text = f"{len(result.equivalence_groups)} group(s) of statistically equivalent options" if result.equivalence_groups else "All options are meaningfully differentiated"

    return f"""You are writing the introductory explanation for a decision optimization result.

─── SYSTEM ANALYSIS ───
Domain: {result.category}
Products evaluated: {result.products_evaluated}
Products within budget: {result.products_in_budget}
Inference confidence: {result.inference_confidence:.2f}
Ranking confidence: {result.ranking_confidence:.2f}
Tradeoff pressure: {tradeoff.pressure_score:.2f} ({tradeoff.resolution})
Conflict axes: {', '.join(tradeoff.conflict_axes) if tradeoff.conflict_axes else 'none identified'}
Equivalence: {eq_groups_text}
Pareto-optimal options: {len(result.pareto_optimal_ids)}

─── INFERRED WEIGHTS (what the user cares about most) ───
{weights_text}

─── TOP RECOMMENDATION ───
{top.name if top else 'N/A'} — hybrid score {top.final_rank_score:.3f}, utility {top.utility_score:.3f}

─── SENSITIVITY (what would improve results) ───
{sensitivity_text or '  No significant improvements found'}

─── YOUR TASK ───
Write 2–3 sentences (no lists, no headers):
1. Briefly validate what was inferred from the user's priorities
2. Explain what the tradeoff pressure means for these results
3. If ranking confidence is low, note that top options are close and either could be chosen

Tone: authoritative, helpful, precise. Do NOT use "I" or "the algorithm."
Output only the explanation text.
"""


# ─────────────────────────────────────────────
# MAIN EXPLANATION FUNCTION
# ─────────────────────────────────────────────

def generate_explanations(
    result: AnalysisResult,
    top_n: int = 3,
) -> AnalysisResult:
    """
    Layer 3: Attach human language explanations to optimization results.
    
    Generates:
      - Per-product explanation for top N products
      - Global context explanation for the overall result
      - Constraint conflict summary if tradeoff pressure is high
    
    On failure: falls back to structural explanations from math artifacts.
    Returns the same AnalysisResult with explanations populated.
    """
    result = result.model_copy(deep=True)

    try:
        client = _get_client()
    except RuntimeError:
        # No API key — use structural fallbacks throughout
        for product in result.ranked_products[:top_n]:
            product.explanation = _structural_explanation(product)
            product.tradeoff_summary = _structural_tradeoff_summary(product)
        result.global_explanation = "Results generated using deterministic optimization. AI explanation unavailable."
        return result

    rank_context = {
        "ranking_confidence": result.ranking_confidence,
        "pressure_score": result.tradeoff_pressure.pressure_score,
    }

    # ── Per-product explanations ──
    for product in result.ranked_products[:top_n]:
        try:
            prompt = _build_product_explanation_prompt(product, rank_context)
            response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
            product.explanation = response.text.strip()
        except Exception:
            product.explanation = _structural_explanation(product)

        product.tradeoff_summary = _structural_tradeoff_summary(product)

    # ── Global context explanation ──
    try:
        global_prompt = _build_global_explanation_prompt(
            result, result.tradeoff_pressure, result.global_sensitivity
        )
        response = client.models.generate_content(model="gemini-2.5-flash", contents=global_prompt)
        result.global_explanation = response.text.strip()
    except Exception:
        top = result.ranked_products[0] if result.ranked_products else None
        if top:
            result.global_explanation = (
                f"Optimization complete. {top.name} ranked first with a hybrid score of {top.final_rank_score:.3f}. "
                f"Tradeoff pressure: {result.tradeoff_pressure.resolution}."
            )

    # ── Constraint conflict summary ──
    if result.tradeoff_pressure.conflict_banner:
        result.constraint_conflict_summary = result.tradeoff_pressure.conflict_banner

    return result
