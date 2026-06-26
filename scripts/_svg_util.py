"""Shared helpers for the deck's deterministic SVG/PNG generators (make_flow_svg, make_heatmap_png).

Tiny and dependency-free so each generator can ``import _svg_util`` when run as
``python scripts/<gen>.py`` (Python puts the script's own directory on sys.path).

The deck uses one palette — the Development Seed brand ramp (the color-blind-safe Okabe-Ito variant
lived in the now-retired Marp deck in the companion repo). Meaning is always carried by a text label
or shape, never colour alone, and per-label contrast comes from :func:`fg`.
"""

from __future__ import annotations

from pathlib import Path


def relative_luminance(hex_color: str) -> float:
    """WCAG relative luminance of a ``#RRGGBB`` colour."""

    def _lin(c: float) -> float:
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (int(hex_color[i : i + 2], 16) / 255 for i in (1, 3, 5))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def fg(fill: str) -> str:
    """The higher-contrast label colour for a fill — white on dark fills, near-black on light ones.

    Luminance-based, so it's correct for any fill (including the grey "queued" lane), not a
    hand-maintained list.
    """
    lum = relative_luminance(fill)
    return "#ffffff" if 1.05 / (lum + 0.05) >= (lum + 0.05) / 0.05 else "#111111"


# Development Seed brand palette — a cohesive ramp ending in the signature orange at the top rung.
_PALETTE: dict[str, object] = {
    "rungs": ["#565b65", "#2e86ab", "#4da167", "#e2c044", "#cf3f02"],
    "neutral": "#443f3f",
    "queued": "#9aa0a6",
    "highlight_stroke": "#443f3f",
    "highlight_mark": "#cf3f02",
    "font": "Roboto, system-ui, sans-serif",
}


def palette_name() -> str:
    """The active palette name (only the DevSeed brand palette ships in this repo)."""
    return "devseed"


def palette() -> dict[str, object]:
    """The active palette mapping."""
    return _PALETTE


def out_dir(base: Path) -> Path:
    """Generator output dir — the deck reads assets straight from ``public/``."""
    return base
