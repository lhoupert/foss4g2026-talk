"""Contrast guard for the generators' ink picker (_svg_util.fg).

The ladder/flow diagrams carry meaning by colour AND label, but where text sits on a coloured rung
fill, fg() must pick an ink that clears WCAG AA (4.5:1). This restores the a11y invariant the
retired Marp theme test (test_slides_theme) used to cover.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from _svg_util import fg, palette, relative_luminance  # noqa: E402


def _contrast(a: str, b: str) -> float:
    """WCAG contrast ratio between two #RRGGBB colours."""
    lo, hi = sorted((relative_luminance(a), relative_luminance(b)))
    return (hi + 0.05) / (lo + 0.05)


def test_fg_clears_AA_on_every_rung_fill() -> None:
    for fill in palette()["rungs"]:
        ink = fg(fill)
        assert _contrast(fill, ink) >= 4.5, f"ink {ink} on rung fill {fill} fails WCAG AA (4.5:1)"
