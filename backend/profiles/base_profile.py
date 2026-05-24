"""
profiles/base_profile.py — Abstract domain profile interface.

The optimizer core is generic. All domain-specific knowledge lives here.
New domains (phones, careers, investments) implement this interface.
The optimizer never imports from concrete profiles directly — only from base.

Design principles:
  - Utility curves approximate human perception, not raw math
  - Interaction rules encode "components that conflict with each other"
  - Profiles are stateless configuration objects, not runtime state
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple
import math


# ─────────────────────────────────────────────
# UTILITY CURVE FUNCTIONS
# (Library of perception-approximating transforms)
# ─────────────────────────────────────────────

def curve_linear(x: float, lo: float = 0.0, hi: float = 10.0) -> float:
    """Linear normalization. Perception is proportional to value."""
    if hi == lo:
        return 0.0
    return max(0.0, min(1.0, (x - lo) / (hi - lo)))


def curve_logarithmic(x: float, lo: float = 0.0, hi: float = 10.0) -> float:
    """
    Logarithmic utility. Models diminishing returns.
    Use when: early gains matter much more than late gains.
    Example: battery life — 3h→6h matters far more than 12h→15h.
    """
    if hi == lo or x <= lo:
        return 0.0
    x_shifted = x - lo
    hi_shifted = hi - lo
    return max(0.0, min(1.0, math.log1p(x_shifted) / math.log1p(hi_shifted)))


def curve_sigmoid(x: float, lo: float = 0.0, hi: float = 10.0,
                  midpoint: float = 0.5, steepness: float = 6.0) -> float:
    """
    Sigmoid utility. Models threshold effects.
    Use when: value jumps at a threshold, then plateaus.
    Example: CPU score — mediocre CPU feels bad, good CPU feels great, elite CPU offers little extra.
    midpoint: where the inflection occurs (0→1 normalized)
    steepness: how sharp the transition is
    """
    if hi == lo:
        return 0.0
    x_norm = (x - lo) / (hi - lo)
    return max(0.0, min(1.0, 1.0 / (1.0 + math.exp(-steepness * (x_norm - midpoint)))))


def curve_diminishing(x: float, lo: float = 0.0, hi: float = 10.0,
                      power: float = 0.6) -> float:
    """
    Power-law diminishing returns. Between linear and log.
    Use when: returns diminish but not as sharply as log.
    Example: display quality, build premium feel.
    power < 1.0: concave (diminishing), power > 1.0: convex (accelerating)
    """
    if hi == lo or x <= lo:
        return 0.0
    x_norm = (x - lo) / (hi - lo)
    return max(0.0, min(1.0, x_norm ** power))


# ─────────────────────────────────────────────
# INTERACTION RULE STRUCTURE
# ─────────────────────────────────────────────

class InteractionRule:
    """
    Defines a conditional boost or penalty when factor combinations conflict or synergize.
    
    Example: High GPU + weak thermals → penalize effective GPU utility
    because hot throttling makes that GPU performance unreachable.
    """

    def __init__(
        self,
        rule_id: str,
        description: str,
        condition_factor: str,
        condition_op: str,       # ">" | "<" | ">=" | "<="
        condition_threshold: float,
        and_factor: str,
        and_op: str,
        and_threshold: float,
        affected_factor: str,
        effect_type: str,        # "penalty" | "boost"
        magnitude: float,        # 0→1, how much to adjust
    ):
        self.rule_id = rule_id
        self.description = description
        self.condition_factor = condition_factor
        self.condition_op = condition_op
        self.condition_threshold = condition_threshold
        self.and_factor = and_factor
        self.and_op = and_op
        self.and_threshold = and_threshold
        self.affected_factor = affected_factor
        self.effect_type = effect_type
        self.magnitude = magnitude

    def _eval(self, value: float, op: str, threshold: float) -> bool:
        if op == ">":  return value > threshold
        if op == "<":  return value < threshold
        if op == ">=": return value >= threshold
        if op == "<=": return value <= threshold
        return False

    def evaluate(self, normalized: Dict[str, float]) -> Tuple[bool, float]:
        """
        Returns (fired: bool, adjustment: float).
        adjustment is positive for boost, negative for penalty.
        """
        v1 = normalized.get(self.condition_factor, 0.0)
        v2 = normalized.get(self.and_factor, 0.0)
        fired = self._eval(v1, self.condition_op, self.condition_threshold) and \
                self._eval(v2, self.and_op, self.and_threshold)
        if not fired:
            return False, 0.0
        adjustment = self.magnitude if self.effect_type == "boost" else -self.magnitude
        return True, adjustment


# ─────────────────────────────────────────────
# ABSTRACT PROFILE INTERFACE
# ─────────────────────────────────────────────

class BaseProfile(ABC):
    """
    Abstract base that every domain profile must implement.
    The optimizer core depends ONLY on this interface.
    """

    @property
    @abstractmethod
    def domain(self) -> str:
        """Domain identifier: 'laptop' | 'phone' | 'career' | ..."""
        ...

    @property
    @abstractmethod
    def expected_factors(self) -> List[str]:
        """All factor names this domain understands."""
        ...

    @property
    @abstractmethod
    def factor_ranges(self) -> Dict[str, Tuple[float, float]]:
        """
        (min, max) for each factor in its raw catalog units.
        Used for normalization before curve application.
        Example: {"battery": (2.0, 20.0), "cpu_score": (0.0, 10.0)}
        """
        ...

    @abstractmethod
    def utility_curve(self, factor: str, value: float) -> float:
        """
        Apply the domain-appropriate utility curve to a single factor value.
        Returns normalized utility 0→1.
        Must encode human perception, not raw math.
        """
        ...

    @abstractmethod
    def curve_name(self, factor: str) -> str:
        """Return the curve type applied to this factor (for explainability)."""
        ...

    @property
    @abstractmethod
    def interaction_rules(self) -> List[InteractionRule]:
        """
        Ordered list of interaction rules to evaluate after normalization.
        Rules fire in order; earlier rules may affect later ones.
        """
        ...

    @property
    def hybrid_weights(self) -> Dict[str, float]:
        """
        How to combine utility, TOPSIS, and regret into final_rank_score.
        Overridable per profile. Defaults to research-validated weights.
        """
        return {
            "utility": 0.45,
            "topsis": 0.35,
            "regret": 0.20,
        }

    @property
    def budget_penalty_lambda(self) -> float:
        """
        Quadratic budget penalty scaling factor.
        Higher = stricter budget enforcement.
        """
        return 1.0

    @property
    def equivalence_threshold(self) -> float:
        """
        Minimum final_rank_score difference to be considered meaningfully different.
        Below this → products are in the same equivalence group.
        """
        return 0.025

    @property
    def low_data_completeness_threshold(self) -> float:
        """Products below this data completeness get a quality warning."""
        return 0.70

    def validate_product(self, product: Dict[str, Any]) -> List[str]:
        """
        Returns a list of warnings for a product (missing fields, out-of-range values, etc.)
        Subclasses can extend this.
        """
        warnings = []
        for f in self.expected_factors:
            if f not in product:
                warnings.append(f"Missing factor: {f}")
            else:
                lo, hi = self.factor_ranges.get(f, (0.0, 10.0))
                val = float(product[f])
                if val < lo or val > hi:
                    warnings.append(f"Factor '{f}' value {val} outside expected range [{lo}, {hi}]")
        return warnings

    def describe(self) -> Dict[str, Any]:
        """Self-description for debug and API metadata."""
        return {
            "domain": self.domain,
            "expected_factors": self.expected_factors,
            "factor_ranges": self.factor_ranges,
            "hybrid_weights": self.hybrid_weights,
            "interaction_rules_count": len(self.interaction_rules),
            "equivalence_threshold": self.equivalence_threshold,
        }
