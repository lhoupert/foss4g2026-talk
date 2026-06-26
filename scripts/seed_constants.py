"""Seed window + planted gaps — vendored from the companion demo repo's ``eo_ingest.seed``.

The gap heatmap (``make_heatmap_png.py``) is *derived from the seeded demo state* so the hero
image and the live ``rung4-report`` clip tell the same story. These four values are the only thing
the heatmap needs from the demo, so they are vendored here (verbatim) to keep this talk repo
self-sufficient — no import back into ``argo-stac-eo-pipeline``. If the demo's seed window or
planted gaps ever change, update these to match.
"""

from __future__ import annotations

from datetime import date

DEFAULT_START = date(2026, 3, 1)
DEFAULT_WINDOW = 14  # days in the seeded window

# Planted, reproducible gaps per collection (offsets from DEFAULT_START that are NOT ingested).
GAP_OFFSETS: dict[str, frozenset[int]] = {
    "synthetic-aurora-veil": frozenset({3, 4, 9}),
    "synthetic-tidal-glass": frozenset({1, 7, 8, 12}),
}


def present_offsets(collection: str, window: int) -> list[int]:
    """Window offsets that ARE seeded for ``collection`` (the planted gaps removed)."""
    gaps = GAP_OFFSETS.get(collection, frozenset())
    return [o for o in range(window) if o not in gaps]
