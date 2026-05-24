"""
profiles/laptop_profile.py — Laptop domain profile.

Contains ALL laptop-specific knowledge:
  - Per-factor utility curves (approximating human perception)
  - Interaction rules (components that conflict or synergize)
  - Domain-specific penalty weights

The optimizer core has zero laptop knowledge. All of it lives here.

Utility curve rationale per factor:
  battery       → logarithmic: 3→6h is transformative, 12→15h barely noticeable
  cpu_score     → sigmoid: mediocre CPU feels bad, good CPU feels great, elite offers little extra
  gpu_score     → sigmoid: clear threshold between "can't game" and "games well", then plateau
  portability   → linear + diminishing: weight reduction feels proportional but with slight concavity
  display       → logarithmic: perceptual quality plateaus; 60→90Hz huge, 144→165Hz barely felt
  thermals      → sigmoid: "runs cool" matters, extreme cooling returns very little
  build_quality → sigmoid: cheap feels cheap, premium feels premium, ultra-premium barely noticed
  student_score → linear: direct value proposition, no strong curve needed
  gaming_score  → sigmoid: below threshold = can't game, above = can game, ceiling hits fast
  creator_score → sigmoid: similar threshold behavior to gaming
"""

from typing import Any, Dict, List, Tuple
from .base_profile import (
    BaseProfile, InteractionRule,
    curve_linear, curve_logarithmic, curve_sigmoid, curve_diminishing
)


# ─────────────────────────────────────────────
# FACTOR CONFIGURATION
# ─────────────────────────────────────────────

# Raw catalog ranges (in catalog units, not normalized)
LAPTOP_FACTOR_RANGES: Dict[str, Tuple[float, float]] = {
    "battery":       (2.0, 20.0),   # hours of use
    "cpu_score":     (0.0, 10.0),   # benchmark-normalized 0–10
    "gpu_score":     (0.0, 10.0),   # benchmark-normalized 0–10
    "portability":   (0.0, 10.0),   # inverse of weight, 10 = ultralight
    "display":       (0.0, 10.0),   # composite display quality 0–10
    "thermals":      (0.0, 10.0),   # thermal management quality 0–10
    "build_quality": (0.0, 10.0),   # subjective build premium 0–10
    "student_score": (0.0, 10.0),   # student value composite 0–10
    "gaming_score":  (0.0, 10.0),   # gaming capability composite 0–10
    "creator_score": (0.0, 10.0),   # creator workflow composite 0–10
}

# Curve assignment per factor
LAPTOP_CURVES: Dict[str, str] = {
    "battery":       "logarithmic",
    "cpu_score":     "sigmoid",
    "gpu_score":     "sigmoid",
    "portability":   "diminishing",
    "display":       "logarithmic",
    "thermals":      "sigmoid",
    "build_quality": "sigmoid",
    "student_score": "linear",
    "gaming_score":  "sigmoid",
    "creator_score": "sigmoid",
}

# Sigmoid curve parameters per factor (midpoint, steepness)
# midpoint: where the inflection is (0→1 normalized input)
# steepness: how sharp the S-curve is
LAPTOP_SIGMOID_PARAMS: Dict[str, Tuple[float, float]] = {
    "cpu_score":     (0.45, 7.0),  # inflects around mid-range, sharp transition
    "gpu_score":     (0.55, 8.0),  # gaming threshold is high
    "thermals":      (0.5,  6.0),
    "build_quality": (0.4,  6.0),  # premium feel kicks in early
    "gaming_score":  (0.5,  8.0),
    "creator_score": (0.5,  7.0),
}


# ─────────────────────────────────────────────
# INTERACTION RULES
# Encode: "good components that conflict with each other"
# ─────────────────────────────────────────────

LAPTOP_INTERACTIONS: List[InteractionRule] = [
    InteractionRule(
        rule_id="gpu_thermal_conflict",
        description="High GPU performance undermined by poor thermals — throttling makes GPU utility unreachable",
        condition_factor="gpu_score",
        condition_op=">",
        condition_threshold=0.65,
        and_factor="thermals",
        and_op="<",
        and_threshold=0.45,
        affected_factor="gpu_score",
        effect_type="penalty",
        magnitude=0.22,
    ),
    InteractionRule(
        rule_id="cpu_battery_portability_conflict",
        description="High-performance CPU with poor battery undermines portability utility for mobile users",
        condition_factor="cpu_score",
        condition_op=">",
        condition_threshold=0.72,
        and_factor="battery",
        and_op="<",
        and_threshold=0.45,
        affected_factor="portability",
        effect_type="penalty",
        magnitude=0.14,
    ),
    InteractionRule(
        rule_id="battery_portability_student_boost",
        description="Long battery + lightweight = ideal student machine — synergy boost",
        condition_factor="battery",
        condition_op=">",
        condition_threshold=0.65,
        and_factor="portability",
        and_op=">",
        and_threshold=0.65,
        affected_factor="student_score",
        effect_type="boost",
        magnitude=0.10,
    ),
    InteractionRule(
        rule_id="gaming_portability_conflict",
        description="High gaming performance and high portability are physically incompatible — thermal mass required",
        condition_factor="gaming_score",
        condition_op=">",
        condition_threshold=0.70,
        and_factor="portability",
        and_op=">",
        and_threshold=0.72,
        affected_factor="gaming_score",
        effect_type="penalty",
        magnitude=0.18,
    ),
    InteractionRule(
        rule_id="creator_display_synergy",
        description="High creator workflow value boosted by excellent display — they reinforce each other",
        condition_factor="creator_score",
        condition_op=">",
        condition_threshold=0.68,
        and_factor="display",
        and_op=">",
        and_threshold=0.68,
        affected_factor="creator_score",
        effect_type="boost",
        magnitude=0.08,
    ),
    InteractionRule(
        rule_id="poor_build_display_conflict",
        description="Poor build quality undermines high display value — structural flex degrades panel experience",
        condition_factor="build_quality",
        condition_op="<",
        condition_threshold=0.35,
        and_factor="display",
        and_op=">",
        and_threshold=0.65,
        affected_factor="display",
        effect_type="penalty",
        magnitude=0.10,
    ),
]


# ─────────────────────────────────────────────
# PROFILE CLASS
# ─────────────────────────────────────────────

class LaptopProfile(BaseProfile):

    @property
    def domain(self) -> str:
        return "laptop"

    @property
    def expected_factors(self) -> List[str]:
        return list(LAPTOP_FACTOR_RANGES.keys())

    @property
    def factor_ranges(self) -> Dict[str, Tuple[float, float]]:
        return LAPTOP_FACTOR_RANGES

    def utility_curve(self, factor: str, value: float) -> float:
        """Apply per-factor perception-approximating utility curve."""
        lo, hi = LAPTOP_FACTOR_RANGES.get(factor, (0.0, 10.0))
        curve = LAPTOP_CURVES.get(factor, "linear")

        if curve == "logarithmic":
            return curve_logarithmic(value, lo, hi)
        elif curve == "sigmoid":
            midpoint, steepness = LAPTOP_SIGMOID_PARAMS.get(factor, (0.5, 6.0))
            return curve_sigmoid(value, lo, hi, midpoint, steepness)
        elif curve == "diminishing":
            return curve_diminishing(value, lo, hi, power=0.65)
        else:
            return curve_linear(value, lo, hi)

    def curve_name(self, factor: str) -> str:
        return LAPTOP_CURVES.get(factor, "linear")

    @property
    def interaction_rules(self) -> List[InteractionRule]:
        return LAPTOP_INTERACTIONS

    @property
    def hybrid_weights(self) -> Dict[str, float]:
        # Laptops: slightly more utility-weighted since absolute specs matter
        return {"utility": 0.45, "topsis": 0.35, "regret": 0.20}

    @property
    def budget_penalty_lambda(self) -> float:
        # Moderate penalty — stretch options should survive at modest premium
        return 0.85

    @property
    def equivalence_threshold(self) -> float:
        # Laptops are similar enough that 2.5% margin means "pick either"
        return 0.025
