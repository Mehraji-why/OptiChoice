"""
models.py — Canonical data contracts for the optimization pipeline.

Design principles:
  - Every intermediate artifact is a typed model, not a raw dict.
  - Schemas are forward-compatible: new fields are Optional with defaults.
  - Frontend visualization fields are pre-allocated even if not yet rendered.
  - Nothing is collapsed prematurely — three scores stay three scores.
"""

from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


# ─────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    """Thin entry point. Raw human language + product catalog."""
    user_needs: str = Field(..., description="Free-text description of user intent")
    budget: float = Field(..., gt=0, description="Hard budget ceiling in local currency")
    products: List[Dict[str, Any]] = Field(..., min_length=1)
    constraints: Optional[List[str]] = Field(default=None, description="Explicit hard constraints e.g. 'must be under 1.5kg'")
    category: str = Field(default="laptop", description="Domain profile to load: laptop | phone | career | ...")


# ─────────────────────────────────────────────
# LAYER 1 OUTPUT — Structured Preference Model
# (Gemini NLP → this. Math engine consumes this.)
# ─────────────────────────────────────────────

class PreferenceModel(BaseModel):
    """
    Structured intent extracted from raw user language.
    This is the ONLY thing Gemini produces on the input side.
    All downstream math is deterministic from this point.
    """
    hard_constraints: Dict[str, Any] = Field(
        default_factory=dict,
        description="Non-negotiable filters: budget ceiling, max weight, OS requirement, etc."
    )
    soft_constraints: Dict[str, float] = Field(
        default_factory=dict,
        description="Desirable but flexible. Scored 0→1 importance."
    )
    inferred_weights: Dict[str, float] = Field(
        ...,
        description="Per-factor importance weights. Sum should equal 1.0."
    )
    tradeoff_tolerance: float = Field(
        default=0.5,
        ge=0.0, le=1.0,
        description="0=wants perfect match, 1=accepts heavy compromise"
    )
    budget_sensitivity: float = Field(
        default=0.7,
        ge=0.0, le=1.0,
        description="How painful is going over budget? 0=flexible, 1=hard limit"
    )
    future_proofing_intent: bool = Field(
        default=False,
        description="Does user care about longevity over current value?"
    )
    use_case_tags: List[str] = Field(
        default_factory=list,
        description="Inferred use cases: ['student', 'gaming', 'creator', 'travel']"
    )
    inference_confidence: float = Field(
        default=1.0,
        ge=0.0, le=1.0,
        description="How clearly Gemini could extract intent from ambiguous input"
    )
    inference_notes: Optional[str] = Field(
        default=None,
        description="Gemini's reasoning about what it inferred and why"
    )


# ─────────────────────────────────────────────
# LAYER 2 INTERMEDIATE ARTIFACTS
# (Preserved for full pipeline inspectability)
# ─────────────────────────────────────────────

class NormalizedProduct(BaseModel):
    """Product after context-aware normalization. All factors mapped 0→1 via per-factor curves."""
    product_id: str
    name: str
    price: float
    raw_factors: Dict[str, float] = Field(description="Original values from catalog")
    normalized_factors: Dict[str, float] = Field(description="After per-factor utility curve applied")
    curve_applied: Dict[str, str] = Field(description="Which curve was used per factor: linear|log|sigmoid|diminishing")
    data_completeness: float = Field(ge=0.0, le=1.0, description="Fraction of expected factors present")
    missing_factors: List[str] = Field(default_factory=list)


class InteractionEvent(BaseModel):
    """A single interaction rule that fired during evaluation."""
    rule_id: str
    description: str
    condition: str  # e.g. "gpu_score > 0.7 AND thermals < 0.5"
    affected_factor: str
    effect_type: str  # "penalty" | "boost"
    magnitude: float
    before_value: float
    after_value: float


class UtilityArtifact(BaseModel):
    """Per-product utility computation with full traceability."""
    product_id: str
    name: str

    # Component scores — never collapsed early
    raw_utility: float = Field(description="Weighted sum before penalties")
    budget_penalty: float = Field(description="λ * quadratic budget overrun")
    imbalance_penalty: float = Field(description="Penalty for extreme factor imbalance")
    interaction_adjustment: float = Field(description="Net effect of all interaction rules")
    final_utility: float = Field(description="After all penalties and adjustments")

    # Explainability breakdowns
    positive_contributors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Factors that increased utility, ranked by contribution"
    )
    penalty_contributors: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Factors/rules that reduced utility"
    )
    interactions_fired: List[InteractionEvent] = Field(default_factory=list)
    constraint_violations: List[str] = Field(default_factory=list)
    within_budget: bool
    budget_overage_pct: float = Field(default=0.0, description="% above budget, 0 if within")


class ParetoArtifact(BaseModel):
    """Pareto dominance analysis output."""
    product_id: str
    is_pareto_optimal: bool
    dominated_by: Optional[List[str]] = Field(
        default=None,
        description="Product IDs that dominate this option on all dimensions"
    )
    dominates: List[str] = Field(
        default_factory=list,
        description="Product IDs this option dominates"
    )
    pareto_frontier_rank: Optional[int] = None
    elimination_reason: Optional[str] = None


class TOPSISArtifact(BaseModel):
    """Full TOPSIS computation trace."""
    product_id: str
    distance_to_ideal: float = Field(description="Euclidean distance from ideal best solution")
    distance_to_nadir: float = Field(description="Euclidean distance from ideal worst solution")
    topsis_closeness: float = Field(description="d⁻ / (d⁺ + d⁻), higher is better")
    ideal_solution: Dict[str, float] = Field(description="The theoretical best value per factor")
    nadir_solution: Dict[str, float] = Field(description="The theoretical worst value per factor")
    factor_distances: Dict[str, float] = Field(description="Per-factor distance contribution")


class RegretArtifact(BaseModel):
    """Regret analysis — opportunity cost of choosing this option."""
    product_id: str
    regret_score: float = Field(
        ge=0.0, le=1.0,
        description="0=no regret (this IS optimal), 1=maximum regret"
    )
    utility_gap: float = Field(description="Absolute utility difference from top option")
    utility_gap_pct: float = Field(description="% utility sacrifice vs top option")
    psychological_label: str = Field(
        description="Human-readable regret framing: 'Safe choice' | 'Reasonable tradeoff' | 'Significant compromise'"
    )


class SensitivitySuggestion(BaseModel):
    """A single mathematically computed sensitivity suggestion."""
    variable: str  # e.g. "budget", "max_weight_kg", "battery_hours"
    change_description: str  # e.g. "+₹8,000 budget"
    marginal_utility_gain: float
    rank_improvement: int = Field(description="Positions gained in ranking")
    unlocks_products: List[str] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)


class TradeoffPressureArtifact(BaseModel):
    """Constraint conflict intensity analysis."""
    pressure_score: float = Field(
        ge=0.0, le=1.0,
        description="0=no tension, 1=near-impossible requirements"
    )
    feasibility_ratio: float = Field(
        ge=0.0, le=1.0,
        description="Fraction of catalog satisfying hard constraints"
    )
    feasible_count: int
    total_count: int
    conflict_axes: List[str] = Field(
        description="Which requirement pairs are in tension e.g. ['gaming vs portability']"
    )
    resolution: str = Field(
        description="'satisfied' | 'compromise' | 'infeasible'"
    )
    conflict_banner: Optional[str] = Field(
        default=None,
        description="Human-readable warning for high-pressure scenarios"
    )


# ─────────────────────────────────────────────
# FINAL RANKED PRODUCT — all scores preserved
# ─────────────────────────────────────────────

class RankedProduct(BaseModel):
    """
    Final output per product.
    Three independent scores deliberately NOT collapsed into one number.
    Frontend can visualize any dimension independently.
    """
    # Identity
    product_id: str
    name: str
    price: float
    rank: int
    image: Optional[str] = None
    url: Optional[str] = None

    # ── The three independent scores ──
    utility_score: float = Field(description="Absolute goodness score 0→1")
    topsis_closeness: float = Field(description="Relative position score 0→1")
    regret_score: float = Field(description="Opportunity cost 0→1 (lower is better)")
    final_rank_score: float = Field(description="Hybrid: 0.45·utility + 0.35·topsis + 0.20·(1-regret)")

    # ── Uncertainty / equivalence ──
    ranking_confidence: float = Field(
        ge=0.0, le=1.0,
        description="How separated this product is from adjacent ranks"
    )
    is_statistically_equivalent: bool = Field(
        default=False,
        description="True if score margin from adjacent rank is below significance threshold"
    )
    equivalence_group: Optional[int] = Field(
        default=None,
        description="Products in the same equivalence group are effectively identical"
    )

    # ── Pareto status ──
    is_pareto_optimal: bool
    pareto_frontier_rank: Optional[int] = None

    # ── Explainability (pre-LLM) ──
    positive_contributors: List[Dict[str, Any]] = Field(default_factory=list)
    penalty_contributors: List[Dict[str, Any]] = Field(default_factory=list)
    interactions_fired: List[InteractionEvent] = Field(default_factory=list)
    constraint_violations: List[str] = Field(default_factory=list)

    # ── Sensitivity ──
    sensitivity_suggestions: List[SensitivitySuggestion] = Field(default_factory=list)

    # ── Data quality ──
    data_completeness: float = Field(ge=0.0, le=1.0)
    data_quality_flag: Optional[str] = Field(
        default=None,
        description="Warning if data_completeness < 0.7"
    )

    # ── Normalized factor values (for frontend visualization) ──
    normalized_factors: Dict[str, float] = Field(default_factory=dict)
    factor_contributions: Dict[str, float] = Field(
        default_factory=dict,
        description="Per-factor weighted contribution to utility"
    )

    # ── Budget ──
    within_budget: bool
    budget_overage_pct: float = Field(default=0.0)

    # ── LLM explanation (added in Layer 3) ──
    explanation: Optional[str] = Field(default=None)
    regret_framing: Optional[str] = Field(default=None)
    tradeoff_summary: Optional[str] = Field(default=None)


# ─────────────────────────────────────────────
# FULL PIPELINE DEBUG ARTIFACT
# (Preserved internally; not sent to client by default)
# ─────────────────────────────────────────────

class PipelineDebugArtifact(BaseModel):
    """
    Complete intermediate state from every pipeline stage.
    Enables full inspection without re-running.
    """
    request_id: str
    preference_model: PreferenceModel
    normalized_products: List[NormalizedProduct]
    utility_artifacts: List[UtilityArtifact]
    pareto_artifacts: List[ParetoArtifact]
    topsis_artifacts: List[TOPSISArtifact]
    regret_artifacts: List[RegretArtifact]
    tradeoff_pressure: TradeoffPressureArtifact
    sensitivity_suggestions: List[SensitivitySuggestion]
    pipeline_stages_completed: List[str]
    warnings: List[str] = Field(default_factory=list)


# ─────────────────────────────────────────────
# FINAL API RESPONSE
# ─────────────────────────────────────────────

class AnalysisResult(BaseModel):
    """
    Complete response. Richly structured for current and future UI needs.
    
    Frontend visualization targets:
      - ranked_products[*].factor_contributions → bar chart
      - ranked_products[*].utility_score / topsis_closeness / regret_score → radar or trio display
      - tradeoff_pressure → constraint conflict banner
      - sensitivity_suggestions → "what if" panel
      - pareto_products → Pareto frontier visualization
      - equivalence_groups → "these are effectively the same" UX
    """
    # Core results
    ranked_products: List[RankedProduct]

    # Preference model (for display + debug)
    inferred_weights: Dict[str, float]
    preference_model: PreferenceModel

    # System-level analysis
    tradeoff_pressure: TradeoffPressureArtifact
    global_sensitivity: List[SensitivitySuggestion] = Field(
        default_factory=list,
        description="Top-level constraint relaxations that most improve the result set"
    )

    # Confidence signals
    inference_confidence: float = Field(ge=0.0, le=1.0)
    ranking_confidence: float = Field(ge=0.0, le=1.0)

    # Equivalence groups (for "these are effectively the same" UX)
    equivalence_groups: List[List[str]] = Field(
        default_factory=list,
        description="Lists of product_ids that are statistically equivalent"
    )

    # Pareto frontier summary
    pareto_optimal_ids: List[str] = Field(default_factory=list)

    # LLM-generated global context (Layer 3)
    global_explanation: Optional[str] = None
    constraint_conflict_summary: Optional[str] = None

    # Meta
    category: str
    products_evaluated: int
    products_in_budget: int
    debug_available: bool = Field(
        default=False,
        description="Set true in research mode to include full PipelineDebugArtifact"
    )
    debug_artifact: Optional[PipelineDebugArtifact] = Field(
        default=None,
        description="Only populated in research/debug mode"
    )
    warnings: List[str] = Field(default_factory=list)
