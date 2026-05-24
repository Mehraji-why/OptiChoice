"""
profiles/__init__.py — Profile registry.

Add new domain profiles here. The optimizer core uses get_profile() to
load the correct profile without importing concrete classes directly.
"""

from .base_profile import BaseProfile
from .laptop_profile import LaptopProfile

_REGISTRY = {
    "laptop": LaptopProfile,
}


def get_profile(category: str) -> BaseProfile:
    """
    Load a domain profile by category name.
    Raises ValueError for unknown categories so errors are loud and early.
    """
    cls = _REGISTRY.get(category.lower())
    if cls is None:
        supported = list(_REGISTRY.keys())
        raise ValueError(
            f"Unknown category '{category}'. Supported: {supported}. "
            f"Add a new profile class to profiles/ and register it here."
        )
    return cls()


def list_supported_categories() -> list:
    return list(_REGISTRY.keys())
