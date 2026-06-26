#!/usr/bin/env python
"""Generate the hero gap-heatmap PNG (T28/Phase-C, storyboard S22).

A calendar grid — one cell per day per collection — rendered big enough for a full slide,
*derived from the demo's seed window* (vendored in `seed_constants`) so the hero image and the live
`rung4-report` clip tell the same story. Colour-blind-safe with shape redundancy: a day that
landed is a filled cell with a drawn check; a gap is an outlined cell with a diagonal slash
(shapes drawn as line segments — font glyphs tofu in PDF renderers).

Run: ``python scripts/make_heatmap_png.py`` → ``public/heatmap.png``.
"""

from __future__ import annotations

import io
from datetime import timedelta
from pathlib import Path

from _svg_util import out_dir
from PIL import Image, ImageDraw, ImageFont

from seed_constants import DEFAULT_START, DEFAULT_WINDOW, GAP_OFFSETS, present_offsets

OUT = out_dir(Path(__file__).resolve().parents[1] / "public") / "heatmap.png"

_PAPER = (252, 252, 249)
_NEUTRAL = (68, 63, 63)  # DevSeed text
_PRESENT = (77, 161, 103)  # DevSeed success green — the day landed
_GAP = (207, 63, 2)  # DevSeed primary orange — the slash on a missing day

_CELL, _GUTTER = 92, 14
_LABEL_W, _TOP, _MARGIN = 470, 150, 40
_LEGEND_H = 110


def build_grid() -> dict[str, list[bool]]:
    """Per collection: one bool per window day — True if the seed ingested it (no gap)."""
    return {
        collection: [
            o in set(present_offsets(collection, DEFAULT_WINDOW)) for o in range(DEFAULT_WINDOW)
        ]
        for collection in GAP_OFFSETS
    }


def _cell(draw: ImageDraw.ImageDraw, x: int, y: int, present: bool) -> None:
    box = (x, y, x + _CELL, y + _CELL)
    if present:
        draw.rounded_rectangle(box, radius=12, fill=_PRESENT)
        # a check, drawn as two strokes (shape redundancy, no font glyph)
        draw.line([(x + 22, y + 50), (x + 40, y + 68)], fill=_PAPER, width=9)
        draw.line([(x + 40, y + 68), (x + 72, y + 26)], fill=_PAPER, width=9)
    else:
        draw.rounded_rectangle(box, radius=12, outline=_NEUTRAL, width=3)
        draw.line([(x + 18, y + _CELL - 18), (x + _CELL - 18, y + 18)], fill=_GAP, width=9)


def build_png() -> bytes:
    grid = build_grid()
    rows = sorted(grid)
    width = _LABEL_W + DEFAULT_WINDOW * (_CELL + _GUTTER) + _MARGIN
    height = _TOP + len(rows) * (_CELL + 2 * _GUTTER) + _LEGEND_H

    img = Image.new("RGB", (width, height), _PAPER)
    draw = ImageDraw.Draw(img)
    f_title = ImageFont.load_default(size=44)
    f_label = ImageFont.load_default(size=30)
    f_day = ImageFont.load_default(size=26)

    start, end = DEFAULT_START, DEFAULT_START + timedelta(days=DEFAULT_WINDOW - 1)
    draw.text(
        (_MARGIN, _MARGIN),
        f"Did every day land?  {start.isoformat()} to {end.isoformat()}",
        font=f_title,
        fill=_NEUTRAL,
    )

    for col in range(DEFAULT_WINDOW):
        day = start + timedelta(days=col)
        x = _LABEL_W + col * (_CELL + _GUTTER)
        draw.text(
            (x + _CELL // 2, _TOP - 24), f"{day.day:02d}", font=f_day, fill=_NEUTRAL, anchor="mm"
        )

    for r, collection in enumerate(rows):
        y = _TOP + r * (_CELL + 2 * _GUTTER)
        draw.text((_MARGIN, y + _CELL // 2), collection, font=f_label, fill=_NEUTRAL, anchor="lm")
        for col, present in enumerate(grid[collection]):
            _cell(draw, _LABEL_W + col * (_CELL + _GUTTER), y, present)

    # legend: the shapes explained in words (never colour alone)
    ly = height - _LEGEND_H + 18
    _cell(draw, _MARGIN, ly, True)
    draw.text(
        (_MARGIN + _CELL + 18, ly + _CELL // 2), "landed", font=f_label, fill=_NEUTRAL, anchor="lm"
    )
    lx2 = _MARGIN + _CELL + 240
    _cell(draw, lx2, ly, False)
    draw.text(
        (lx2 + _CELL + 18, ly + _CELL // 2),
        "gap: nothing ingested",  # plain colon — em dash/arrow tofu in the embedded font
        font=f_label,
        fill=_NEUTRAL,
        anchor="lm",
    )

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def main() -> int:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(build_png())
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
