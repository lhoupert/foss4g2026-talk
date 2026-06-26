"""Contract for the hero gap heatmap (scripts/make_heatmap_png.py).

The storyboard's S22 hero: a calendar grid, one cell per day per collection, big enough to read
from the back row. It must be *truthful* — derived from the demo's seed window (vendored in
`seed_constants`), not hand-drawn — and colour-blind-safe with shape redundancy (filled cell vs
outlined-and-slashed cell), matching the report's ✅/⬜ semantics.
"""

from __future__ import annotations

import io
import sys
from datetime import timedelta
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from make_heatmap_png import build_grid, build_png, main  # noqa: E402
from seed_constants import DEFAULT_START, DEFAULT_WINDOW, GAP_OFFSETS  # noqa: E402


def test_grid_matches_the_seeded_demo_state() -> None:
    grid = build_grid()
    assert set(grid) == set(GAP_OFFSETS), "one row per seeded collection"
    for collection, days in grid.items():
        assert len(days) == DEFAULT_WINDOW, "one cell per day of the seeded window"
        gaps = {i for i, present in enumerate(days) if not present}
        assert gaps == set(GAP_OFFSETS[collection]), f"{collection}: gaps must match the seed"


def test_png_is_deterministic() -> None:
    assert build_png() == build_png()


def test_png_is_hero_sized_and_labelled_by_date() -> None:
    img = Image.open(io.BytesIO(build_png()))
    assert img.format == "PNG"
    assert img.width >= 1200, "hero slide asset — must beat the terminal rendering"
    # the window's start date must be exposed for the caption/labels
    assert (DEFAULT_START + timedelta(days=DEFAULT_WINDOW - 1)).year == 2026


def test_committed_asset_is_current() -> None:
    # Drift guard: if GAP_OFFSETS / the window change, the committed hero must be regenerated.
    # Byte-stable because Pillow is pinned via uv.lock.
    committed = Path(__file__).resolve().parents[1] / "public" / "heatmap.png"
    assert committed.read_bytes() == build_png(), (
        "public/heatmap.png is stale — regenerate: uv run python scripts/make_heatmap_png.py"
    )


def test_main_writes_the_file(tmp_path, monkeypatch) -> None:
    import make_heatmap_png as mod

    monkeypatch.setattr(mod, "OUT", tmp_path / "heatmap.png")
    assert main() == 0
    assert (tmp_path / "heatmap.png").read_bytes() == build_png()
