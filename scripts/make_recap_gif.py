#!/usr/bin/env python
"""Assemble the recap clip from the ladder SVG family (T28.3).

The recap (rungs 0→4 lighting up) is built by rendering each `ladder-rung{0..4}.svg` to PNG and
stitching an animated GIF. Deterministic; the SVGs are the source of truth (regenerate them with
`gen-ladders.py`). Needs `cairosvg` (opt-in: `uv pip install cairosvg` + system `cairo`) and Pillow.
"""

from __future__ import annotations

import io
from pathlib import Path

from _svg_util import out_dir

SLIDES = Path(__file__).resolve().parents[1] / "public"
SRC = out_dir(SLIDES)  # reads the brand-palette ladder SVGs straight from public/
FRAME_MS = 1100  # hold per rung
OUT = SRC / "clips" / "recap.gif"
_BG = (252, 252, 249)  # paper background to match the deck's light slides


def main() -> int:
    try:
        import cairosvg  # type: ignore
    except ImportError:
        print("cairosvg not installed — run `uv pip install cairosvg` (see `make tools-record`).")
        return 1
    from PIL import Image

    frames = []
    for rung in range(5):
        svg = SRC / f"ladder-rung{rung}.svg"
        png = cairosvg.svg2png(url=str(svg), output_width=1000)
        # Flatten the transparent SVG render onto the paper background.
        rgba = Image.open(io.BytesIO(png)).convert("RGBA")
        bg = Image.new("RGB", rgba.size, _BG)
        bg.paste(rgba, mask=rgba.split()[3])
        frames.append(bg)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(OUT, save_all=True, append_images=frames[1:], duration=FRAME_MS, loop=0)
    print(f"wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
