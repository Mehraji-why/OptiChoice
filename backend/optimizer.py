"""
optimizer.py — Layer 2: Deterministic Optimization Engine.

Philosophy: same inputs → same outputs, always.
AI has no role here. Mathematics makes all decisions.

Pipeline (8 subsystems in order):
  2a. Normalization          — context-aware utility curves per factor
  2b. Interaction Effects    — component conflict/synergy adjustments  
  2c. Budget Feasibility     — continuous quadratic penalty, not hard filter
  2d. Utility Computation    — weighted utility with full traceability
  2e. Pareto Filtering       — dominance analysis across all dimensions
  2f. TOPSIS Ranking         — distance-from-ideal relative ranking
  2g. Regret Analysis        — opportunity cost per option
  2h. Sensitivity Analysis   — marginal utility from constraint relaxation
  +   Tradeoff Pressure      — constraint conflict intensity
  +   Hybrid Ranking         — utility + TOPSIS + regret combined

Every intermediate artifact is preserved — nothing is collapsed until the end.

Design principles:
  - Modular: each subsystem is a pure function, independently swappable
  - Inspectable: PipelineDebugArtifact captures everything
  - Research mode: full debug artifacts available for experimentation
  - Uncertainty-aware: equivalence groups surface when scores are too close
  - Swappable: TOPSIS, utility aggregation, and regret can be replaced
    by swapping the function called in run_optimization()
"""

import math
import uuid
from copy import deepcopy
from typing import Any, Dict, List, Optional, Tuple

from models import (
    AnalysisResult,
    HardConstraint,
    HardConstraintResult,
    InteractionEvent,
    NormalizedProduct,
    ParetoArtifact,
    PipelineDebugArtifact,
    PreferenceModel,
    RankedProduct,
    RegretArtifact,
    SensitivitySuggestion,
    TOPSISArtifact,
    TradeoffPressureArtifact,
    UtilityArtifact,
)
from profiles.base_profile import BaseProfile


# ═══════════════════════════════════════════════
# 2a-PRE. HARD CATEGORICAL CONSTRAINT ENFORCEMENT
#
# Runs BEFORE normalization. Products that violate hard constraints
# are either disqualified (penalty=0.0) or heavily penalized before
# any utility scoring begins.
#
# This is separate from the budget penalty model because:
#   - Budget is continuous and has a two-tier model
#   - Categorical constraints are binary (matches or doesn't)
#   - The enforcement logic differs fundamentally
#
# A disqualified product still flows through the pipeline with a
# score of 0.0 — it appears in debug artifacts and can surface in
# the UI with a "does not meet your requirements" label, rather than
# disappearing silently.
# ═══════════════════════════════════════════════

def _normalize_string(v: Any) -> str:
    """Lowercase + strip for case-insensitive catalog field matching."""
    return str(v).lower().strip()


def _eval_constraint(
    product: Dict[str, Any],
    constraint: HardConstraint,
) -> HardConstraintResult:
    """
    Evaluate a single HardConstraint against a single product.

    Returns a HardConstraintResult with:
      - passed: whether the product satisfies the constraint
      - penalty_applied: score multiplier (1.0 = no penalty, 0.0 = disqualified)
      - disqualified: True when penalty_applied == 0.0
      - reason: human-readable explanation

    Missing field behavior:
      If the product catalog doesn't have the required field, we treat it as
      an unknown rather than a violation — the product is not penalized but
      is flagged. This prevents good products from being eliminated due to
      incomplete catalog data.
    """
    product_id = str(product.get("id", product.get("name", "unknown")))
    field = constraint.field
    mt = constraint.match_type
    actual = product.get(field)

    # ── Missing field: flag but do not penalize ──
    if actual is None:
        return HardConstraintResult(
            product_id=product_id,
            constraint_field=field,
            match_type=mt,
            required=constraint.value or constraint.values,
            actual=None,
            passed=False,
            penalty_applied=0.5,  # moderate penalty, not disqualification
            disqualified=False,
            source=constraint.source,
            reason=f"Field '{field}' not present in catalog — cannot verify constraint. Moderate penalty applied.",
        )

    # ── EXACT match ──
    if mt == "exact":
        required = constraint.value
        passed = _normalize_string(actual) == _normalize_string(required)
        if passed:
            return HardConstraintResult(
                product_id=product_id, constraint_field=field, match_type=mt,
                required=required, actual=actual, passed=True,
                penalty_applied=1.0, disqualified=False, source=constraint.source,
                reason=f"'{field}' = '{actual}' matches required '{required}'.",
            )
        return HardConstraintResult(
            product_id=product_id, constraint_field=field, match_type=mt,
            required=required, actual=actual, passed=False,
            penalty_applied=constraint.violation_penalty, disqualified=constraint.violation_penalty == 0.0,
            source=constraint.source,
            reason=f"'{field}' = '{actual}' does not match required '{required}'.",
        )

    # ── ONE_OF match ──
    if mt == "one_of":
        required_values = [_normalize_string(v) for v in (constraint.values or [])]
        passed = _normalize_string(actual) in required_values
        if passed:
            return HardConstraintResult(
                product_id=product_id, constraint_field=field, match_type=mt,
                required=constraint.values, actual=actual, passed=True,
                penalty_applied=1.0, disqualified=False, source=constraint.source,
                reason=f"'{field}' = '{actual}' is in required set {constraint.values}.",
            )
        return HardConstraintResult(
            product_id=product_id, constraint_field=field, match_type=mt,
            required=constraint.values, actual=actual, passed=False,
            penalty_applied=constraint.violation_penalty, disqualified=constraint.violation_penalty == 0.0,
            source=constraint.source,
            reason=f"'{field}' = '{actual}' is not in required set {constraint.values}.",
        )

    # ── MINIMUM (numeric) ──
    if mt == "minimum":
        try:
            actual_num = float(actual)
            required_num = float(constraint.value)
        except (TypeError, ValueError):
            return HardConstraintResult(
                product_id=product_id, constraint_field=field, match_type=mt,
                required=constraint.value, actual=actual, passed=False,
                penalty_applied=0.5, disqualified=False, source=constraint.source,
                reason=f"Cannot compare '{field}': actual='{actual}' or required='{constraint.value}' is not numeric.",
            )
        passed = actual_num >= required_num
        if passed:
            return HardConstraintResult(
                product_id=product_id, constraint_field=field, match_type=mt,
                required=required_num, actual=actual_num, passed=True,
                penalty_applied=1.0, disqualified=False, source=constraint.source,
                reason=f"'{field}' = {actual_num} meets minimum {required_num}.",
            )
        # Proportional penalty: severe shortfall = heavy penalty
        ratio = actual_num / required_num if required_num > 0 else 0.0
        proportional_penalty = max(constraint.violation_penalty, ratio ** 2)
        # If violation_penalty is 0.0 (hard), disqualify regardless of ratio
        final_penalty = 0.0 if constraint.violation_penalty == 0.0 else proportional_penalty
        return HardConstraintResult(
            product_id=product_id, constraint_field=field, match_type=mt,
            required=required_num, actual=actual_num, passed=False,
            penalty_applied=final_penalty,
            disqualified=final_penalty == 0.0,
            source=constraint.source,
            reason=f"'{field}' = {actual_num} is below minimum {required_num} (shortfall: {required_num - actual_num:.1f}).",
        )

    # ── MAXIMUM (numeric) ──
    if mt == "maximum":
        try:
            actual_num = float(actual)
            required_num = float(constraint.value)
        except (TypeError, ValueError):
            return HardConstraintResult(
                product_id=product_id, constraint_field=field, match_type=mt,
                required=constraint.value, actual=actual, passed=False,
                penalty_applied=0.5, disqualified=False, source=constraint.source,
                reason=f"Cannot compare '{field}': non-numeric value.",
            )
        passed = actual_num <= required_num
        if passed:
            return HardConstraintResult(
                product_id=product_id, constraint_field=field, match_type=mt,
                required=required_num, actual=actual_num, passed=True,
                penalty_applied=1.0, disqualified=False, source=constraint.source,
                reason=f"'{field}' = {actual_num} is within maximum {required_num}.",
            )
        ratio = required_num / actual_num if actual_num > 0 else 0.0
        final_penalty = 0.0 if constraint.violation_penalty == 0.0 else max(constraint.violation_penalty, ratio ** 2)
        return HardConstraintResult(
            product_id=product_id, constraint_field=field, match_type=mt,
            required=required_num, actual=actual_num, passed=False,
            penalty_applied=final_penalty,
            disqualified=final_penalty == 0.0,
            source=constraint.source,
            reason=f"'{field}' = {actual_num} exceeds maximum {required_num} (excess: {actual_num - required_num:.2f}).",
        )

    # ── EXCLUDES ──
    if mt == "excludes":
        excluded = [_normalize_string(v) for v in (constraint.values or ([constraint.value] if constraint.value else []))]
        passed = _normalize_string(actual) not in excluded
        if passed:
            return HardConstraintResult(
                product_id=product_id, constraint_field=field, match_type=mt,
                required=f"not in {excluded}", actual=actual, passed=True,
                penalty_applied=1.0, disqualified=False, source=constraint.source,
                reason=f"'{field}' = '{actual}' is not in excluded set.",
            )
        return HardConstraintResult(
            product_id=product_id, constraint_field=field, match_type=mt,
            required=f"not in {excluded}", actual=actual, passed=False,
            penalty_applied=constraint.violation_penalty, disqualified=constraint.violation_penalty == 0.0,
            source=constraint.source,
            reason=f"'{field}' = '{actual}' is explicitly excluded by user requirement.",
        )

    # ── Unknown match_type — warn but don't penalize ──
    return HardConstraintResult(
        product_id=product_id, constraint_field=field, match_type=mt,
        required=constraint.value, actual=actual, passed=True,
        penalty_applied=1.0, disqualified=False, source=constraint.source,
        reason=f"Unknown match_type '{mt}' — constraint not enforced.",
    )


def apply_hard_constraints(
    products: List[Dict[str, Any]],
    preference: PreferenceModel,
) -> Tuple[Dict[str, float], Dict[str, List[HardConstraintResult]]]:
    """
    Evaluate all categorical constraints against all products.

    Returns:
      constraint_multipliers: Dict[product_id → combined score multiplier]
        1.0 = no violations
        0.0 = disqualified (at least one hard violation)
        0.x = partial penalties combined multiplicatively

      all_results: Dict[product_id → List[HardConstraintResult]]
        Full evaluation trace for every product/constraint pair.

    Combination logic:
      Penalties from multiple constraints multiply together.
      One 0.0 penalty anywhere → product multiplier = 0.0 (disqualified).
      This is correct: "must be Intel AND must have 16GB RAM" — failing either is fatal.
    """
    constraints = preference.categorical_constraints
    if not constraints:
        product_ids = [str(p.get("id", p.get("name", "unknown"))) for p in products]
        return {pid: 1.0 for pid in product_ids}, {}

    multipliers: Dict[str, float] = {}
    all_results: Dict[str, List[HardConstraintResult]] = {}

    for product in products:
        pid = str(product.get("id", product.get("name", "unknown")))
        results = [_eval_constraint(product, c) for c in constraints]
        all_results[pid] = results

        # Multiply all penalties together
        combined = 1.0
        for r in results:
            combined *= r.penalty_applied
            if combined == 0.0:
                break  # Short-circuit: already disqualified

        multipliers[pid] = round(combined, 6)

    return multipliers, all_results


# ═══════════════════════════════════════════════
# 2a. NORMALIZATION
# Context-aware utility curves per factor.
# ═══════════════════════════════════════════════

def normalize_products(
    products: List[Dict[str, Any]],
    profile: BaseProfile,
) -> List[NormalizedProduct]:
    """
    Apply per-factor utility curves from the domain profile.
    
    Each factor gets its own human-perception-approximating transform.
    Raw catalog values → normalized utility values [0, 1].
    Missing factors → 0.0 with completeness penalty.
    """
    expected = profile.expected_factors
    normalized_list = []

    for product in products:
        raw_factors: Dict[str, float] = {}
        normalized_factors: Dict[str, float] = {}
        curve_applied: Dict[str, str] = {}
        missing_factors: List[str] = []

        for factor in expected:
            raw_val = product.get(factor)
            if raw_val is None:
                missing_factors.append(factor)
                normalized_factors[factor] = 0.0
                curve_applied[factor] = "missing"
            else:
                raw_val = float(raw_val)
                raw_factors[factor] = raw_val
                normalized_factors[factor] = profile.utility_curve(factor, raw_val)
                curve_applied[factor] = profile.curve_name(factor)

        completeness = (len(expected) - len(missing_factors)) / len(expected) if expected else 1.0

        normalized_list.append(NormalizedProduct(
            product_id=str(product.get("id", product.get("name", "unknown"))),
            name=str(product.get("name", "Unknown")),
            price=float(product.get("price", 0.0)),
            raw_factors=raw_factors,
            normalized_factors=normalized_factors,
            curve_applied=curve_applied,
            data_completeness=round(completeness, 4),
            missing_factors=missing_factors,
        ))

    return normalized_list


# ═══════════════════════════════════════════════
# 2b. INTERACTION EFFECTS
# Penalties and boosts for conflicting/synergizing components.
# ═══════════════════════════════════════════════

def apply_interactions(
    normalized: NormalizedProduct,
    profile: BaseProfile,
) -> Tuple[Dict[str, float], List[InteractionEvent]]:
    """
    Evaluate interaction rules against normalized factor values.
    Returns adjusted factor values and a log of every rule that fired.
    
    Rules are applied to a mutable copy — earlier rules DO affect later ones.
    """
    adjusted = dict(normalized.normalized_factors)
    fired_events: List[InteractionEvent] = []

    for rule in profile.interaction_rules:
        did_fire, adjustment = rule.evaluate(adjusted)
        if not did_fire:
            continue

        before = adjusted.get(rule.affected_factor, 0.0)
        after = max(0.0, min(1.0, before + adjustment))
        adjusted[rule.affected_factor] = after

        fired_events.append(InteractionEvent(
            rule_id=rule.rule_id,
            description=rule.description,
            condition=f"{rule.condition_factor} {rule.condition_op} {rule.condition_threshold} AND {rule.and_factor} {rule.and_op} {rule.and_threshold}",
            affected_factor=rule.affected_factor,
            effect_type=rule.effect_type,
            magnitude=rule.magnitude,
            before_value=round(before, 4),
            after_value=round(after, 4),
        ))

    return adjusted, fired_events


# ═══════════════════════════════════════════════
# 2c. BUDGET FEASIBILITY MODEL
# Two-tier enforcement model.
#
# Tier 1 — Hard elimination (sensitivity >= HARD_BUDGET_THRESHOLD):
#   Products beyond the stretch ceiling are scored 0.0 and cannot rank.
#   This is the correct behavior when the user says "under ₹70k" or "strict budget."
#
# Tier 2 — Continuous penalty (sensitivity < HARD_BUDGET_THRESHOLD):
#   Quadratic penalty that scales with overage and sensitivity.
#   Products slightly over budget survive as visible "stretch options."
#   Used when user says "around ₹X" or "roughly ₹X."
#
# The threshold and stretch ceiling are explicit constants — inspectable and tunable.
# ═══════════════════════════════════════════════

# At or above this sensitivity value, hard-tier enforcement activates.
# Gemini assigns ~0.95 for "under X", "strict", "cannot exceed" language.
HARD_BUDGET_THRESHOLD = 0.88

# Even in hard mode, products up to this % over budget survive (at steep penalty).
# Beyond this they score 0. Models the real-world "I said ₹70k but might do ₹73k."
HARD_MODE_STRETCH_CEILING = 0.06   # 6% over budget maximum in hard mode

# In soft mode, how steeply does penalty grow with overage?
# Higher = steeper cliff. Current value: 30% over budget → ~full penalty at sensitivity=0.75
SOFT_MODE_QUADRATIC_SCALE = 8.0


def budget_penalty(
    price: float,
    budget: float,
    sensitivity: float,
    lambda_scale: float = 1.0,
) -> Tuple[float, float]:
    """
    Returns (penalty: float, overage_pct: float).

    Two-tier model:

    HARD TIER (sensitivity >= 0.88 — user said "under X", "strict", "max X"):
      - Within budget:                      penalty = 0.0
      - 0–6% over budget (stretch zone):    penalty = sensitivity × (overage/ceiling)^1.5
                                            steep but not disqualifying
      - Beyond 6% over budget:              penalty = 1.0  (effectively eliminates from ranking)

    SOFT TIER (sensitivity < 0.88 — user said "around X", "roughly X", or no qualifier):
      - Within budget:                      penalty = 0.0
      - Over budget:                        penalty = scale × sensitivity × overage²
                                            moderate, products remain discoverable

    Why not a literal hard filter (remove from results entirely)?
      Products eliminated silently create a confusing UX — the user sees fewer results
      with no explanation. A penalty of 1.0 keeps the product in the artifact trail
      and lets the explainability layer say "excluded: 18% over your strict budget."
    """
    if price <= budget:
        return 0.0, 0.0

    overage_fraction = (price - budget) / budget
    overage_pct = round(overage_fraction * 100, 2)

    if sensitivity >= HARD_BUDGET_THRESHOLD:
        # Hard tier
        if overage_fraction > HARD_MODE_STRETCH_CEILING:
            # Beyond stretch ceiling — effectively eliminated
            return 1.0, overage_pct
        # Inside stretch zone: steep convex penalty
        stretch_progress = overage_fraction / HARD_MODE_STRETCH_CEILING
        penalty = sensitivity * (stretch_progress ** 1.5)
        return round(min(penalty, 0.98), 6), overage_pct

    else:
        # Soft tier: quadratic penalty
        penalty = lambda_scale * SOFT_MODE_QUADRATIC_SCALE * sensitivity * (overage_fraction ** 2)
        return round(min(penalty, 1.0), 6), overage_pct


# ═══════════════════════════════════════════════
# 2d. UTILITY COMPUTATION
# Weighted sum + penalties + interaction adjustments, fully traced.
# ═══════════════════════════════════════════════

def _imbalance_penalty(adjusted_factors: Dict[str, float], weights: Dict[str, float]) -> float:
    """
    Penalizes extreme imbalance: a product that excels on one axis but
    fails on all others that the user cares about.
    
    High-weight factors with near-zero values → mild penalty.
    This prevents single-factor dominance gaming.
    """
    penalty = 0.0
    for factor, weight in weights.items():
        val = adjusted_factors.get(factor, 0.0)
        if weight > 0.15 and val < 0.20:
            penalty += weight * (0.20 - val) * 0.5
    return min(penalty, 0.3)


def compute_utility(
    normalized: NormalizedProduct,
    adjusted_factors: Dict[str, float],
    fired_events: List[InteractionEvent],
    preference: PreferenceModel,
    profile: BaseProfile,
) -> UtilityArtifact:
    """
    Compute full utility score with complete traceability.
    
    U(x) = Σ wi·fi(x)  [raw utility]
          - λ_budget · budget_penalty
          - λ_imbalance · imbalance_penalty
          + net_interaction_adjustment
    """
    weights = preference.inferred_weights

    # Weighted factor contributions
    raw_utility = 0.0
    positive_contributors = []
    penalty_contributors_list = []

    for factor, weight in weights.items():
        val = adjusted_factors.get(factor, 0.0)
        contribution = weight * val
        raw_utility += contribution

        entry = {
            "factor": factor,
            "weight": round(weight, 4),
            "normalized_value": round(val, 4),
            "contribution": round(contribution, 4),
            "curve": normalized.curve_applied.get(factor, "unknown"),
        }

        if contribution >= 0.01:
            positive_contributors.append(entry)
        elif contribution <= -0.01 or val < 0.25 and weight > 0.1:
            penalty_contributors_list.append(entry)

    positive_contributors.sort(key=lambda x: x["contribution"], reverse=True)
    penalty_contributors_list.sort(key=lambda x: x["contribution"])

    # Budget penalty
    b_penalty, overage_pct = budget_penalty(
        normalized.price,
        preference.hard_constraints.get("budget", float("inf")),
        preference.budget_sensitivity,
        profile.budget_penalty_lambda,
    )
    within_budget = overage_pct == 0.0

    # Imbalance penalty
    imb_penalty = _imbalance_penalty(adjusted_factors, weights)

    # Net interaction adjustment (sum of all magnitudes that fired)
    interaction_adjustment = sum(
        e.after_value - e.before_value for e in fired_events
    )

    # Final utility
    final_utility = raw_utility - b_penalty - imb_penalty
    final_utility = max(0.0, min(1.0, final_utility))

    # Constraint violations
    violations = []
    hard = preference.hard_constraints
    if "max_weight_kg" in hard and hard["max_weight_kg"] is not None:
        raw_weight = normalized.raw_factors.get("portability")
        if raw_weight is not None:
            violations.append("Weight constraint check: verify against catalog weight spec")

    if b_penalty >= 1.0:
        violations.append(
            f"Excluded: {overage_pct:.1f}% over strict budget ceiling "
            f"(>{HARD_MODE_STRETCH_CEILING*100:.0f}% stretch limit)"
        )
    elif b_penalty > 0.3:
        violations.append(f"Significantly over budget (+{overage_pct:.1f}%)")

    if not within_budget:
        penalty_contributors_list.append({
            "factor": "budget",
            "weight": preference.budget_sensitivity,
            "normalized_value": 0.0,
            "contribution": round(-b_penalty, 4),
            "curve": "quadratic_penalty",
            "reason": f"+{overage_pct:.1f}% above budget",
        })

    return UtilityArtifact(
        product_id=normalized.product_id,
        name=normalized.name,
        raw_utility=round(raw_utility, 6),
        budget_penalty=round(b_penalty, 6),
        imbalance_penalty=round(imb_penalty, 6),
        interaction_adjustment=round(interaction_adjustment, 6),
        final_utility=round(final_utility, 6),
        positive_contributors=positive_contributors[:5],
        penalty_contributors=penalty_contributors_list[:5],
        interactions_fired=fired_events,
        constraint_violations=violations,
        within_budget=within_budget,
        budget_overage_pct=overage_pct,
    )


# ═══════════════════════════════════════════════
# 2e. PARETO FILTERING
# Strict multi-dimensional dominance analysis.
# ═══════════════════════════════════════════════

def pareto_filter(
    utilities: List[UtilityArtifact],
    normalized_products: List[NormalizedProduct],
    adjusted_factors_map: Dict[str, Dict[str, float]],
) -> List[ParetoArtifact]:
    """
    For every pair A, B: if A beats B on every dimension where B doesn't beat A,
    B is Pareto-dominated.
    
    Uses normalized adjusted factor values (post-interaction) as the dimensions.
    Products on the Pareto frontier can never be strictly worse than any other.
    """
    product_ids = [u.product_id for u in utilities]
    factors_per_product = {pid: adjusted_factors_map[pid] for pid in product_ids}

    dominated_by: Dict[str, List[str]] = {pid: [] for pid in product_ids}
    dominates: Dict[str, List[str]] = {pid: [] for pid in product_ids}

    for i, pid_a in enumerate(product_ids):
        for j, pid_b in enumerate(product_ids):
            if i == j:
                continue
            factors_a = factors_per_product[pid_a]
            factors_b = factors_per_product[pid_b]
            all_factors = set(factors_a.keys()) | set(factors_b.keys())

            # A dominates B if A >= B on all factors AND A > B on at least one
            a_gte_b_all = all(factors_a.get(f, 0) >= factors_b.get(f, 0) for f in all_factors)
            a_gt_b_one = any(factors_a.get(f, 0) > factors_b.get(f, 0) for f in all_factors)

            if a_gte_b_all and a_gt_b_one:
                dominates[pid_a].append(pid_b)
                dominated_by[pid_b].append(pid_a)

    results = []
    frontier_rank = 1
    for pid in product_ids:
        is_optimal = len(dominated_by[pid]) == 0
        elimination_reason = None
        if not is_optimal:
            dominators = dominated_by[pid]
            elimination_reason = f"Dominated by: {', '.join(dominators[:3])}"

        results.append(ParetoArtifact(
            product_id=pid,
            is_pareto_optimal=is_optimal,
            dominated_by=dominated_by[pid] if dominated_by[pid] else None,
            dominates=dominates[pid],
            pareto_frontier_rank=frontier_rank if is_optimal else None,
            elimination_reason=elimination_reason,
        ))
        if is_optimal:
            frontier_rank += 1

    return results


# ═══════════════════════════════════════════════
# 2f. TOPSIS RANKING
# Measure distance from ideal best and ideal worst.
# ═══════════════════════════════════════════════

def topsis_rank(
    utilities: List[UtilityArtifact],
    adjusted_factors_map: Dict[str, Dict[str, float]],
    weights: Dict[str, float],
) -> List[TOPSISArtifact]:
    """
    TOPSIS: Technique for Order of Preference by Similarity to Ideal Solution.
    
    Steps:
      1. Build weighted normalized decision matrix
      2. Identify ideal best (A+) and ideal worst (A-)
      3. Compute Euclidean distance from each product to A+ and A-
      4. Closeness = d⁻ / (d⁺ + d⁻) — higher means closer to ideal
    
    Swappable: replace this function with vikor_rank() or electre_rank()
    without touching anything else.
    """
    product_ids = [u.product_id for u in utilities]
    all_factors = list(weights.keys())

    # Step 1: Weighted normalized matrix
    # Each entry: w_j * f_ij (already normalized 0→1)
    weighted_matrix: Dict[str, Dict[str, float]] = {}
    for pid in product_ids:
        factors = adjusted_factors_map[pid]
        weighted_matrix[pid] = {
            f: weights.get(f, 0.0) * factors.get(f, 0.0)
            for f in all_factors
        }

    # Step 2: Ideal best and worst per factor
    ideal_best: Dict[str, float] = {}
    ideal_worst: Dict[str, float] = {}
    for f in all_factors:
        vals = [weighted_matrix[pid].get(f, 0.0) for pid in product_ids]
        ideal_best[f] = max(vals)
        ideal_worst[f] = min(vals)

    # Step 3: Distances
    results = []
    for pid in product_ids:
        wm = weighted_matrix[pid]
        d_plus = math.sqrt(sum((wm.get(f, 0.0) - ideal_best.get(f, 0.0)) ** 2 for f in all_factors))
        d_minus = math.sqrt(sum((wm.get(f, 0.0) - ideal_worst.get(f, 0.0)) ** 2 for f in all_factors))

        # Step 4: Closeness
        total = d_plus + d_minus
        closeness = d_minus / total if total > 1e-10 else 0.5

        # Per-factor distance contributions (for explainability)
        factor_distances = {
            f: round((wm.get(f, 0.0) - ideal_best.get(f, 0.0)) ** 2, 6)
            for f in all_factors
        }

        results.append(TOPSISArtifact(
            product_id=pid,
            distance_to_ideal=round(d_plus, 6),
            distance_to_nadir=round(d_minus, 6),
            topsis_closeness=round(closeness, 6),
            ideal_solution={f: round(v, 4) for f, v in ideal_best.items()},
            nadir_solution={f: round(v, 4) for f, v in ideal_worst.items()},
            factor_distances=factor_distances,
        ))

    return results


# ═══════════════════════════════════════════════
# 2g. REGRET ANALYSIS
# Opportunity cost of choosing each option.
# ═══════════════════════════════════════════════

def regret_analysis(
    utilities: List[UtilityArtifact],
) -> List[RegretArtifact]:
    """
    For each product, compute utility sacrifice vs the best available option.
    
    regret_score = (top_utility - this_utility) / top_utility
    
    Swappable: replace with minimax_regret() for different regret formulation.
    """
    if not utilities:
        return []

    top_utility = max(u.final_utility for u in utilities)

    def psychological_label(regret: float) -> str:
        if regret < 0.05:
            return "Optimal choice"
        if regret < 0.12:
            return "Excellent — negligible tradeoff"
        if regret < 0.22:
            return "Good — reasonable tradeoff"
        if regret < 0.38:
            return "Moderate compromise"
        return "Significant sacrifice"

    results = []
    for u in utilities:
        gap = top_utility - u.final_utility
        regret = gap / top_utility if top_utility > 1e-10 else 0.0
        regret = max(0.0, min(1.0, regret))

        results.append(RegretArtifact(
            product_id=u.product_id,
            regret_score=round(regret, 6),
            utility_gap=round(gap, 6),
            utility_gap_pct=round(regret * 100, 2),
            psychological_label=psychological_label(regret),
        ))

    return results


# ═══════════════════════════════════════════════
# TRADEOFF PRESSURE
# Constraint conflict intensity — a first-class system.
# ═══════════════════════════════════════════════

def compute_tradeoff_pressure(
    products: List[Dict[str, Any]],
    preference: PreferenceModel,
    utilities: List[UtilityArtifact],
    profile: BaseProfile,
) -> TradeoffPressureArtifact:
    """
    Compute how much the user's requirements conflict with each other
    and with the available product catalog.
    
    Three components:
      1. Weight conflict: do high-weight factors typically anti-correlate?
      2. Feasibility ratio: how many products survive hard constraints?
      3. Utility distribution: is top utility very low? (impossible requirements)
    """
    weights = preference.inferred_weights
    budget = preference.hard_constraints.get("budget", float("inf"))

    # Feasibility: products within budget
    feasible = [p for p in products if float(p.get("price", float("inf"))) <= budget]
    feasibility_ratio = len(feasible) / len(products) if products else 0.0

    # Known conflicting weight pairs (domain-specific heuristic)
    conflict_pairs = [
        ("gaming_score", "portability", "gaming vs portability"),
        ("gaming_score", "battery", "gaming vs battery life"),
        ("gpu_score", "portability", "GPU performance vs weight"),
        ("cpu_score", "battery", "CPU performance vs battery"),
        ("build_quality", "budget_sensitivity", "premium build vs tight budget"),
    ]

    conflict_axes = []
    conflict_score = 0.0

    for factor_a, factor_b, label in conflict_pairs:
        w_a = weights.get(factor_a, 0.0)
        w_b = weights.get(factor_b, 0.0)
        # Both factors weighted significantly → real tension
        if w_a > 0.12 and w_b > 0.12:
            tension = w_a * w_b * 12.0  # scale to 0→1 range approximately
            conflict_score += tension
            conflict_axes.append(label)

    # Normalize conflict score
    conflict_score = min(1.0, conflict_score)

    # Budget pressure component
    budget_pressure = 0.0
    if len(feasible) < len(products) * 0.4:
        budget_pressure = 0.35
    elif len(feasible) < len(products) * 0.7:
        budget_pressure = 0.15

    # Utility ceiling pressure: if even best option has low utility, requirements are harsh
    top_utility = max((u.final_utility for u in utilities), default=0.5)
    utility_pressure = max(0.0, 0.5 - top_utility) * 1.2  # 0→0.6 range

    pressure_score = min(1.0, conflict_score * 0.5 + budget_pressure + utility_pressure * 0.5)

    # Determine resolution
    if pressure_score < 0.25:
        resolution = "satisfied"
        banner = None
    elif pressure_score < 0.55:
        resolution = "compromise"
        if conflict_axes:
            banner = f"Your requirements create tension on {len(conflict_axes)} dimension(s): {'; '.join(conflict_axes[:2])}. Showing best available compromise."
        else:
            banner = "Some tradeoffs were necessary. Results reflect the best available balance."
    else:
        resolution = "compromise" if feasible else "infeasible"
        if conflict_axes:
            banner = f"High constraint conflict detected: {'; '.join(conflict_axes[:3])}. Perfect satisfaction is not achievable — results show the optimal compromise."
        else:
            banner = "Requirements are difficult to satisfy simultaneously. Showing best available options."

    return TradeoffPressureArtifact(
        pressure_score=round(pressure_score, 4),
        feasibility_ratio=round(feasibility_ratio, 4),
        feasible_count=len(feasible),
        total_count=len(products),
        conflict_axes=conflict_axes,
        resolution=resolution,
        conflict_banner=banner,
    )


# ═══════════════════════════════════════════════
# 2h. SENSITIVITY ANALYSIS
# Marginal utility from constraint relaxation — mathematical, not heuristic.
# ═══════════════════════════════════════════════

def sensitivity_analysis(
    products: List[Dict[str, Any]],
    preference: PreferenceModel,
    profile: BaseProfile,
    current_ranked: List[UtilityArtifact],
    budget_delta_pct: float = 0.12,
) -> List[SensitivitySuggestion]:
    """
    Compute marginal utility improvement from relaxing each constraint.
    
    Tests:
      - Budget increase by delta%: which products become accessible?
      - Portability relaxation: would accepting heavier products help?
      - Battery sacrifice: what if user needs less battery?
    
    Each suggestion has a real marginal_utility_gain — not a heuristic string.
    
    Swappable: delta, variables tested, and reranking function are all configurable.
    """
    if not current_ranked:
        return []

    budget = preference.hard_constraints.get("budget", float("inf"))
    weights = preference.inferred_weights
    current_top_utility = current_ranked[0].final_utility if current_ranked else 0.0
    suggestions = []

    # ── Budget relaxation ──
    new_budget = budget * (1.0 + budget_delta_pct)
    previously_excluded = [
        p for p in products
        if float(p.get("price", 0)) > budget and float(p.get("price", 0)) <= new_budget
    ]

    if previously_excluded:
        # Estimate the best utility gain from newly accessible products
        best_new_utility = 0.0
        unlocked_names = []
        for p in previously_excluded:
            raw_utility_est = sum(
                weights.get(f, 0.0) * profile.utility_curve(f, float(p.get(f, 0)))
                for f in profile.expected_factors
                if f in p
            )
            if raw_utility_est > best_new_utility:
                best_new_utility = raw_utility_est
                unlocked_names = [str(p.get("name", ""))]
            elif raw_utility_est > best_new_utility * 0.9:
                unlocked_names.append(str(p.get("name", "")))

        marginal_gain = max(0.0, best_new_utility - current_top_utility)
        budget_increase = budget * budget_delta_pct

        suggestions.append(SensitivitySuggestion(
            variable="budget",
            change_description=f"+{budget_increase:,.0f} budget ({budget_delta_pct*100:.0f}% increase)",
            marginal_utility_gain=round(marginal_gain, 4),
            rank_improvement=len(previously_excluded),
            unlocks_products=unlocked_names[:3],
            confidence=0.85,
        ))

    # ── Portability relaxation (accept heavier laptops) ──
    portability_weight = weights.get("portability", 0.0)
    if portability_weight > 0.08:
        # Simulate reducing portability weight by 50%
        relaxed_weights = dict(weights)
        relaxed_weights["portability"] = portability_weight * 0.5
        total = sum(relaxed_weights.values())
        relaxed_weights = {k: v / total for k, v in relaxed_weights.items()}

        # Find top utility with relaxed portability
        best_relaxed = 0.0
        for p in products:
            if float(p.get("price", float("inf"))) <= budget:
                u = sum(
                    relaxed_weights.get(f, 0.0) * profile.utility_curve(f, float(p.get(f, 0)))
                    for f in profile.expected_factors
                    if f in p
                )
                best_relaxed = max(best_relaxed, u)

        marginal_gain = max(0.0, best_relaxed - current_top_utility)
        if marginal_gain > 0.02:
            suggestions.append(SensitivitySuggestion(
                variable="portability_requirement",
                change_description="Accept slightly heavier laptops (−0.3kg tolerance)",
                marginal_utility_gain=round(marginal_gain, 4),
                rank_improvement=0,  # Rank position doesn't change, utility improves
                unlocks_products=[],
                confidence=0.70,
            ))

    # ── Battery expectation relaxation ──
    battery_weight = weights.get("battery", 0.0)
    if battery_weight > 0.1:
        relaxed_weights = dict(weights)
        relaxed_weights["battery"] = battery_weight * 0.6
        total = sum(relaxed_weights.values())
        relaxed_weights = {k: v / total for k, v in relaxed_weights.items()}

        best_relaxed = 0.0
        for p in products:
            if float(p.get("price", float("inf"))) <= budget:
                u = sum(
                    relaxed_weights.get(f, 0.0) * profile.utility_curve(f, float(p.get(f, 0)))
                    for f in profile.expected_factors
                    if f in p
                )
                best_relaxed = max(best_relaxed, u)

        marginal_gain = max(0.0, best_relaxed - current_top_utility)
        if marginal_gain > 0.02:
            suggestions.append(SensitivitySuggestion(
                variable="battery_expectation",
                change_description="Accept 1–2 hours less battery life",
                marginal_utility_gain=round(marginal_gain, 4),
                rank_improvement=0,
                unlocks_products=[],
                confidence=0.70,
            ))

    # Sort by marginal utility gain
    suggestions.sort(key=lambda s: s.marginal_utility_gain, reverse=True)
    return suggestions[:4]


# ═══════════════════════════════════════════════
# HYBRID RANKING + EQUIVALENCE GROUPING
# ═══════════════════════════════════════════════

def compute_hybrid_scores(
    utilities: List[UtilityArtifact],
    topsis_artifacts: List[TOPSISArtifact],
    regret_artifacts: List[RegretArtifact],
    profile: BaseProfile,
) -> Dict[str, float]:
    """
    Combine three independent scores into final_rank_score.
    
    Weights come from profile — different domains may weight differently.
    Scores are NOT collapsed — all three remain independently accessible.
    
    final_rank_score = w_u·utility + w_t·topsis + w_r·(1 - regret)
    """
    hw = profile.hybrid_weights
    w_u, w_t, w_r = hw["utility"], hw["topsis"], hw["regret"]

    utility_map = {u.product_id: u.final_utility for u in utilities}
    topsis_map = {t.product_id: t.topsis_closeness for t in topsis_artifacts}
    regret_map = {r.product_id: r.regret_score for r in regret_artifacts}

    scores = {}
    for pid in utility_map:
        u = utility_map.get(pid, 0.0)
        t = topsis_map.get(pid, 0.0)
        r = regret_map.get(pid, 1.0)
        scores[pid] = round(w_u * u + w_t * t + w_r * (1.0 - r), 6)

    return scores


def assign_equivalence_groups(
    ranked_products: List["RankedProduct"],
    threshold: float,
) -> List[List[str]]:
    """
    Group products whose final_rank_score differs by less than threshold.
    Products in the same group are statistically equivalent — "pick either."
    
    Returns list of groups (as product_id lists). Singleton groups omitted.
    """
    groups: List[List[str]] = []
    current_group: List[str] = []
    current_score: Optional[float] = None

    for product in ranked_products:
        score = product.final_rank_score
        if current_score is None or abs(score - current_score) < threshold:
            current_group.append(product.product_id)
            current_score = score
        else:
            if len(current_group) > 1:
                groups.append(current_group)
            current_group = [product.product_id]
            current_score = score

    if len(current_group) > 1:
        groups.append(current_group)

    return groups


def compute_ranking_confidence(ranked_products: List["RankedProduct"]) -> float:
    """
    How confident are we in the ranking?
    High confidence: scores are well-separated.
    Low confidence: top scores are clustered — ranking could go either way.
    """
    if len(ranked_products) < 2:
        return 1.0
    top = ranked_products[0].final_rank_score
    second = ranked_products[1].final_rank_score
    gap = top - second
    # Gap of 0.05+ = confident. Gap < 0.02 = very uncertain.
    return round(min(1.0, gap / 0.05), 4)


# ═══════════════════════════════════════════════
# MAIN ENTRY POINT
# Orchestrates all 8 subsystems.
# ═══════════════════════════════════════════════

def run_optimization(
    products: List[Dict[str, Any]],
    preference: PreferenceModel,
    profile: BaseProfile,
    research_mode: bool = False,
) -> Tuple[List[RankedProduct], TradeoffPressureArtifact, List[SensitivitySuggestion], Optional[PipelineDebugArtifact]]:
    """
    Run the full 8-stage optimization pipeline.
    
    Parameters:
        products: raw product catalog dicts
        preference: structured output from Layer 1 (inference.py)
        profile: loaded domain profile
        research_mode: if True, preserve full PipelineDebugArtifact
    
    Returns:
        (ranked_products, tradeoff_pressure, global_sensitivity, debug_artifact)
    
    Swappable subsystems:
        Replace topsis_rank() → vikor_rank() or electre_rank()
        Replace regret_analysis() → minimax_regret() or ranked_regret()
        Replace sensitivity_analysis() → bayesian_sensitivity() in research mode
    """
    request_id = str(uuid.uuid4())[:8]
    pipeline_stages = []
    warnings = []

    # ── 2a-PRE. Hard Categorical Constraint Enforcement ──
    # Runs before everything else. Disqualified products get multiplier=0.0
    # and cannot rank first regardless of their utility score.
    constraint_multipliers, all_constraint_results = apply_hard_constraints(products, preference)
    pipeline_stages.append("2a_pre_hard_constraints")

    disqualified_count = sum(1 for m in constraint_multipliers.values() if m == 0.0)
    if disqualified_count > 0:
        warnings.append(
            f"{disqualified_count} product(s) disqualified by hard categorical constraints "
            f"({', '.join(c.field for c in preference.categorical_constraints)})."
        )

    # Flatten all constraint results for debug artifact
    flat_constraint_results = [r for results in all_constraint_results.values() for r in results]

    # ── 2a. Normalization ──
    normalized_products = normalize_products(products, profile)
    pipeline_stages.append("2a_normalization")

    # Data quality check
    for np_ in normalized_products:
        if np_.data_completeness < profile.low_data_completeness_threshold:
            warnings.append(f"{np_.name}: low data completeness ({np_.data_completeness:.0%})")

    # ── 2b. Interaction Effects ──
    adjusted_factors_map: Dict[str, Dict[str, float]] = {}
    all_fired_events: Dict[str, List[InteractionEvent]] = {}

    for np_ in normalized_products:
        adjusted, fired = apply_interactions(np_, profile)
        adjusted_factors_map[np_.product_id] = adjusted
        all_fired_events[np_.product_id] = fired

    pipeline_stages.append("2b_interactions")

    # ── 2c + 2d. Budget Feasibility + Utility Computation ──
    utility_artifacts = [
        compute_utility(np_, adjusted_factors_map[np_.product_id], all_fired_events[np_.product_id], preference, profile)
        for np_ in normalized_products
    ]
    pipeline_stages.append("2c_budget_feasibility")
    pipeline_stages.append("2d_utility_computation")

    # ── Tradeoff Pressure (needs utilities for ceiling check) ──
    tradeoff_pressure = compute_tradeoff_pressure(products, preference, utility_artifacts, profile)
    pipeline_stages.append("tradeoff_pressure")

    # ── 2e. Pareto Filtering ──
    pareto_artifacts = pareto_filter(utility_artifacts, normalized_products, adjusted_factors_map)
    pareto_map = {p.product_id: p for p in pareto_artifacts}
    pipeline_stages.append("2e_pareto_filtering")

    # ── 2f. TOPSIS Ranking ──
    topsis_artifacts = topsis_rank(utility_artifacts, adjusted_factors_map, preference.inferred_weights)
    topsis_map = {t.product_id: t for t in topsis_artifacts}
    pipeline_stages.append("2f_topsis")

    # ── 2g. Regret Analysis ──
    regret_artifacts = regret_analysis(utility_artifacts)
    regret_map = {r.product_id: r for r in regret_artifacts}
    pipeline_stages.append("2g_regret")

    # ── Hybrid Ranking ──
    hybrid_scores = compute_hybrid_scores(utility_artifacts, topsis_artifacts, regret_artifacts, profile)
    pipeline_stages.append("hybrid_ranking")

    # ── Assemble RankedProduct objects ──
    utility_map = {u.product_id: u for u in utility_artifacts}
    norm_map = {np_.product_id: np_ for np_ in normalized_products}

    ranked_products_unsorted = []
    for pid, hybrid_score in hybrid_scores.items():
        u = utility_map[pid]
        np_ = norm_map[pid]
        t = topsis_map.get(pid)
        r = regret_map.get(pid)
        pa = pareto_map.get(pid)

        # ── Apply categorical constraint multiplier ──
        c_multiplier = constraint_multipliers.get(pid, 1.0)
        constrained_score = round(hybrid_score * c_multiplier, 6)
        is_disqualified = c_multiplier == 0.0

        # Constraint result details for this product
        product_constraint_results = all_constraint_results.get(pid, [])
        constraint_violations = [r_.reason for r_ in product_constraint_results if not r_.passed]
        constraint_penalty_multiplier = c_multiplier

        data_flag = None
        if np_.data_completeness < profile.low_data_completeness_threshold:
            data_flag = f"Limited data ({np_.data_completeness:.0%} complete)"
        if is_disqualified:
            data_flag = (data_flag or "") + " | Disqualified: does not meet hard requirements"

        ranked_products_unsorted.append(RankedProduct(
            product_id=pid,
            name=u.name,
            price=np_.price,
            rank=0,
            image=None,
            url=None,
            utility_score=u.final_utility,
            topsis_closeness=t.topsis_closeness if t else 0.0,
            regret_score=r.regret_score if r else 1.0,
            final_rank_score=constrained_score,
            ranking_confidence=0.0,
            is_statistically_equivalent=False,
            equivalence_group=None,
            hard_constraint_results=product_constraint_results,
            hard_constraint_violations=constraint_violations,
            is_disqualified=is_disqualified,
            constraint_penalty_multiplier=constraint_penalty_multiplier,
            is_pareto_optimal=pa.is_pareto_optimal if pa else False,
            pareto_frontier_rank=pa.pareto_frontier_rank if pa else None,
            positive_contributors=u.positive_contributors,
            penalty_contributors=u.penalty_contributors,
            interactions_fired=u.interactions_fired,
            constraint_violations=u.constraint_violations + constraint_violations,
            sensitivity_suggestions=[],
            data_completeness=np_.data_completeness,
            data_quality_flag=data_flag,
            normalized_factors=adjusted_factors_map[pid],
            factor_contributions={
                f: round(preference.inferred_weights.get(f, 0.0) * adjusted_factors_map[pid].get(f, 0.0), 4)
                for f in profile.expected_factors
            },
            within_budget=u.within_budget,
            budget_overage_pct=u.budget_overage_pct,
            explanation=None,
            regret_framing=r.psychological_label if r else None,
            tradeoff_summary=None,
        ))

    # Sort by hybrid score descending, Pareto-optimal products never buried
    ranked_products_unsorted.sort(
        key=lambda p: (p.is_pareto_optimal, p.final_rank_score),
        reverse=True
    )

    # Assign ranks
    for i, rp in enumerate(ranked_products_unsorted):
        rp.rank = i + 1

    # ── Equivalence Grouping ──
    eq_groups = assign_equivalence_groups(ranked_products_unsorted, profile.equivalence_threshold)
    eq_lookup: Dict[str, int] = {}
    for group_idx, group in enumerate(eq_groups):
        for pid in group:
            eq_lookup[pid] = group_idx

    ranking_conf = compute_ranking_confidence(ranked_products_unsorted)
    for rp in ranked_products_unsorted:
        rp.ranking_confidence = ranking_conf
        if rp.product_id in eq_lookup:
            rp.equivalence_group = eq_lookup[rp.product_id]
            rp.is_statistically_equivalent = True

    # Restore image/url from original catalog
    catalog_meta = {str(p.get("id", p.get("name", ""))): p for p in products}
    for rp in ranked_products_unsorted:
        src = catalog_meta.get(rp.product_id, {})
        rp.image = src.get("image")
        rp.url = src.get("url")

    pipeline_stages.append("assembly")

    # ── 2h. Sensitivity Analysis ──
    global_sensitivity = sensitivity_analysis(
        products, preference, profile, utility_artifacts
    )
    pipeline_stages.append("2h_sensitivity")

    # ── Debug Artifact ──
    debug_artifact = None
    if research_mode:
        debug_artifact = PipelineDebugArtifact(
            request_id=request_id,
            preference_model=preference,
            hard_constraint_results=flat_constraint_results,
            normalized_products=normalized_products,
            utility_artifacts=utility_artifacts,
            pareto_artifacts=pareto_artifacts,
            topsis_artifacts=topsis_artifacts,
            regret_artifacts=regret_artifacts,
            tradeoff_pressure=tradeoff_pressure,
            sensitivity_suggestions=global_sensitivity,
            pipeline_stages_completed=pipeline_stages,
            warnings=warnings,
        )

    return ranked_products_unsorted, tradeoff_pressure, global_sensitivity, debug_artifact