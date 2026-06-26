#!/usr/bin/env python
"""Composite a persistent guiding band onto a terminal screencast GIF (rung 3, rung 4).

The terminal clips are dense; this adds a colour-blind-safe header band (rung accent + a one-line
"what you're seeing") and an optional bottom legend, so the audience can follow them. The band is
the same on every frame — it can't be repainted away the way an in-terminal caption is.

Run after agg produces the GIF (wired into scripts/record_clip.sh):
    python scripts/annotate_clip.py <clip> docs/slides/clips/<clip>.gif
"""

from __future__ import annotations

import sys

from _svg_util import fg  # higher-contrast ink for a given fill (WCAG: dark on the light accents)
from PIL import Image, ImageDraw, ImageFont, ImageSequence

# Per-clip guidance: header accent (the rung colour), header text, optional bottom legend.
CLIPS: dict[str, tuple[str, str, str]] = {
    "rung2-fanout": (
        "#009E73",  # rung 2 green
        "Rung 2 - fan-out: one workflow, many days at once",
        "each row is a day's ingest - up to 10 run in parallel, capped (fast but polite)",
    ),
    "rung3-gapclose": (
        "#E69F00",  # rung 3 orange
        "Rung 3 - find the missing days, then fetch ONLY those",
        "the run lists the gaps it found, then ingests just them",
    ),
    "rung4-report": (
        "#D55E00",  # rung 4 vermillion
        "Rung 4 - the daily gap report, per collection",
        "checked cell = day landed    slashed/empty cell = a gap",
    ),
}

_PAPER = (252, 252, 249)
_NEUTRAL = (51, 51, 51)
_BAND_H = 56
_LEG_H = 44


def _font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.load_default(size=size)  # Pillow >= 10 scalable default (no font dep)
    except TypeError:
        return ImageFont.load_default()


def annotate(clip: str, path: str) -> None:
    accent, title, legend = CLIPS[clip]
    accent_rgb = tuple(int(accent[i : i + 2], 16) for i in (1, 3, 5))
    ink = (17, 17, 17) if fg(accent) == "#111111" else (255, 255, 255)
    f_title, f_leg = _font(26), _font(22)
    leg_h = _LEG_H if legend else 0

    src = Image.open(path)
    frames: list[Image.Image] = []
    durations: list[int] = []
    for frame in ImageSequence.Iterator(src):
        durations.append(frame.info.get("duration", 80))
        term = frame.convert("RGB")
        w, h = term.size
        canvas = Image.new("RGB", (w, _BAND_H + h + leg_h), _PAPER)
        draw = ImageDraw.Draw(canvas)
        draw.rectangle([0, 0, w, _BAND_H], fill=accent_rgb)
        draw.text((w // 2, _BAND_H // 2), title, font=f_title, fill=ink, anchor="mm")
        canvas.paste(term, (0, _BAND_H))
        if legend:
            ly = _BAND_H + h + leg_h // 2
            draw.text((w // 2, ly), legend, font=f_leg, fill=_NEUTRAL, anchor="mm")
        frames.append(canvas)

    frames[0].save(
        path,
        save_all=True,
        append_images=frames[1:],
        loop=0,
        duration=durations,
        disposal=2,
        optimize=True,
    )
    print(f"annotated {path}: {len(frames)} frames, +{_BAND_H + leg_h}px band")


if __name__ == "__main__":
    annotate(sys.argv[1], sys.argv[2])
