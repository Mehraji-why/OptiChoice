"""
main.py — API entry point. Routes only.

This file has NO business logic. Its only job is:
  1. Accept requests
  2. Call the three layers in order
  3. Return structured responses

Architecture flow:
  Request
    → Layer 1: inference.py     (Gemini: language → preference model)
    → Layer 2: optimizer.py     (Python: preference model → ranked results)
    → Layer 3: explainer.py     (Gemini: math results → explanations)
  → Response

Research mode: enabled via query param ?research=true
  Returns full PipelineDebugArtifact with every intermediate artifact preserved.
"""

import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import AnalysisRequest, AnalysisResult
from inference import infer_preferences
from optimizer import run_optimization
from explainer import generate_explanations
from profiles import get_profile, list_supported_categories

load_dotenv()

app = FastAPI(
    title="OptiChoice — Computational Decision Intelligence Engine",
    description=(
        "Three-layer optimization engine: "
        "AI semantic inference → deterministic mathematical optimization → AI explanation. "
        "Same inputs always produce same outputs."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# MAIN OPTIMIZATION ENDPOINT
# ─────────────────────────────────────────────

@app.post("/analyze", response_model=AnalysisResult)
async def analyze(
    request: AnalysisRequest,
    research: bool = Query(default=False, description="Enable full pipeline debug artifacts"),
    explain_top_n: int = Query(default=3, ge=1, le=10, description="Generate AI explanations for top N results"),
):
    """
    Full optimization pipeline.
    
    Layer 1 — Semantic Inference (Gemini):
        Converts user language to structured PreferenceModel.
    
    Layer 2 — Deterministic Optimization (Python):
        Normalization → Interactions → Utility → Pareto → TOPSIS → Regret → Sensitivity
        Same inputs → same outputs, always.
    
    Layer 3 — Explanation Generation (Gemini):
        Converts mathematical results to human-readable explanations.
        Gemini never sees raw data — only computed scores and artifacts.
    """
    # Validate category
    try:
        profile = get_profile(request.category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not request.products:
        raise HTTPException(status_code=400, detail="Provide at least 1 product in the catalog.")

    # ── Layer 1: Semantic Inference ──
    preference = infer_preferences(
        user_needs=request.user_needs,
        budget=request.budget,
        profile=profile,
        constraints=request.constraints,
    )

    # ── Layer 2: Deterministic Optimization ──
    ranked_products, tradeoff_pressure, global_sensitivity, debug_artifact = run_optimization(
        products=request.products,
        preference=preference,
        profile=profile,
        research_mode=research,
    )

    # Equivalence groups (product_id lists)
    from optimizer import assign_equivalence_groups
    eq_groups = assign_equivalence_groups(ranked_products, profile.equivalence_threshold)

    # Ranking confidence
    from optimizer import compute_ranking_confidence
    ranking_confidence = compute_ranking_confidence(ranked_products)

    # Pareto frontier
    pareto_optimal_ids = [rp.product_id for rp in ranked_products if rp.is_pareto_optimal]

    # Products in budget
    budget = preference.hard_constraints.get("budget", float("inf"))
    in_budget_count = sum(1 for rp in ranked_products if rp.within_budget)

    # Warnings
    warnings = []
    if preference.inference_confidence < 0.5:
        warnings.append("Low inference confidence — user input was ambiguous. Consider refining your description.")
    if ranking_confidence < 0.4:
        warnings.append("Top-ranked options are very close in score. These may be effectively equivalent choices.")
    for rp in ranked_products[:3]:
        if rp.data_quality_flag:
            warnings.append(f"{rp.name}: {rp.data_quality_flag}")

    # Assemble pre-explanation result
    result = AnalysisResult(
        ranked_products=ranked_products,
        inferred_weights=preference.inferred_weights,
        preference_model=preference,
        tradeoff_pressure=tradeoff_pressure,
        global_sensitivity=global_sensitivity,
        inference_confidence=preference.inference_confidence,
        ranking_confidence=ranking_confidence,
        equivalence_groups=eq_groups,
        pareto_optimal_ids=pareto_optimal_ids,
        global_explanation=None,
        constraint_conflict_summary=None,
        category=request.category,
        products_evaluated=len(request.products),
        products_in_budget=in_budget_count,
        debug_available=research,
        debug_artifact=debug_artifact,
        warnings=warnings,
    )

    # ── Layer 3: Explanation Generation ──
    result = generate_explanations(result, top_n=explain_top_n)

    return result


# ─────────────────────────────────────────────
# UTILITY ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/categories")
def list_categories():
    """List supported optimization domains."""
    return {
        "supported_categories": list_supported_categories(),
        "note": "New domains: implement BaseProfile → register in profiles/__init__.py"
    }


@app.get("/profile/{category}")
def describe_profile(category: str):
    """Describe a domain profile: factors, curves, interaction rules, hybrid weights."""
    try:
        profile = get_profile(category)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return profile.describe()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "version": "2.0.0",
        "engine": "deterministic",
        "philosophy": "AI interprets humans. Mathematics makes decisions. AI explains mathematics.",
        "layers": ["inference (gemini)", "optimizer (python)", "explainer (gemini)"],
    }


@app.get("/")
def root():
    return {
        "name": "OptiChoice — Computational Decision Intelligence Engine",
        "version": "2.0.0",
        "endpoints": {
            "POST /analyze": "Full optimization pipeline (Layer 1 → 2 → 3)",
            "GET /categories": "List supported domains",
            "GET /profile/{category}": "Inspect domain profile configuration",
            "GET /health": "Engine status",
        },
        "query_params": {
            "research=true": "Include full PipelineDebugArtifact in response",
            "explain_top_n=N": "Generate AI explanations for top N results (default: 3)",
        },
        "philosophy": "Same inputs → same outputs. Always.",
    }
