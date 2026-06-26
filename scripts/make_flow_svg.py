#!/usr/bin/env python
"""Generate the three per-rung flow diagrams (T28/Phase-C, storyboard S10/S15/S18).

Minimal, deterministic SVGs that replace bullet walls in the deck:

- ``flow-rung1.svg`` — the *same unit of work*, Argo-wrapped: retries, UI, logbook around it.
- ``flow-rung2.svg`` — fan-out (``withItems``) with the ``parallelism`` politeness cap labelled.
- ``flow-rung3.svg`` — the ``find_gaps`` loop: expected − present = gaps → ingest only those.

Deterministic SVGs on the DevSeed palette, rounded boxes, and every meaning carried by a text
label, never colour alone. Run: ``python scripts/make_flow_svg.py``.
"""

from __future__ import annotations

from pathlib import Path

from _svg_util import fg as _fg
from _svg_util import out_dir, palette

_PAL = palette()
OUT = out_dir(Path(__file__).resolve().parents[1] / "public")

_NEUTRAL = _PAL["neutral"]
_QUEUED = _PAL["queued"]
_FONTNAME = _PAL["font"]
_W, _H = 1180, 420
_FONT = f'font-family="{_FONTNAME}"'


def _box(x: int, y: int, w: int, h: int, label: str, fill: str, *, sub: str = "") -> str:
    cx = x + w // 2
    fg = _fg(fill)
    text = (
        f'<text x="{cx}" y="{y + (h // 2) + (0 if sub else 8)}" text-anchor="middle" {_FONT} '
        f'font-size="24" font-weight="700" fill="{fg}">{label}</text>'
    )
    if sub:
        text += (
            f'<text x="{cx}" y="{y + h // 2 + 30}" text-anchor="middle" {_FONT} '
            f'font-size="19" fill="{fg}">{sub}</text>'
        )
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" '
        f'stroke="{_NEUTRAL}" stroke-width="2"/>{text}'
    )


def _arrow(x1: int, y1: int, x2: int, y2: int, *, label: str = "") -> str:
    parts = [
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{_NEUTRAL}" '
        f'stroke-width="4" marker-end="url(#arr)"/>'
    ]
    if label:
        parts.append(
            f'<text x="{(x1 + x2) // 2}" y="{min(y1, y2) - 12}" text-anchor="middle" {_FONT} '
            f'font-size="20" fill="{_NEUTRAL}">{label}</text>'
        )
    return "".join(parts)


def _svg(body: str, aria: str) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_W} {_H}" role="img" '
        f'aria-label="{aria}">\n'
        f"  <title>{aria}</title>\n"
        f'  <defs><marker id="arr" markerWidth="10" markerHeight="10" refX="8" refY="3" '
        f'orient="auto"><path d="M0,0 L9,3 L0,6 z" fill="{_NEUTRAL}"/></marker></defs>\n'
        f"  {body}\n</svg>\n"
    )


def _rung1() -> str:
    accent = _PAL["rungs"][1]
    rows = [
        # the Argo wrapper, drawn first so the unit of work sits visually inside it
        f'<rect x="330" y="60" width="520" height="300" rx="16" fill="none" '
        f'stroke="{accent}" stroke-width="5" stroke-dasharray="14 8"/>',
        # label in charcoal for contrast on white; the dashed accent box carries the rung colour
        f'<text x="590" y="100" text-anchor="middle" {_FONT} font-size="24" font-weight="700" '
        f'fill="{_NEUTRAL}">Argo CronWorkflow</text>',
        _box(80, 170, 190, 80, "cron @ 3 a.m.", _NEUTRAL),
        _arrow(270, 210, 420, 210, label="same schedule"),
        _box(430, 170, 320, 80, "same unit of work", accent, sub="eo_ingest.ingest — unchanged"),
        _arrow(850, 210, 980, 210),
        _box(990, 170, 170, 80, "bucket", _NEUTRAL),
        # what the wrapper adds, as labelled tags (not colour-only decoration)
        f'<text x="590" y="300" text-anchor="middle" {_FONT} font-size="22" '
        f'fill="{_NEUTRAL}">+ retries &#183; + web UI &#183; + STAC logbook</text>',
    ]
    aria = (
        "Rung 1 flow: the same ingest unit of work, wrapped by an Argo CronWorkflow "
        "that adds retries, a web UI, and a STAC logbook"
    )
    return _svg("".join(rows), aria)


def _rung2() -> str:
    accent = _PAL["rungs"][2]
    rows = [
        _box(60, 160, 250, 90, "30 days to backfill", _NEUTRAL, sub="withItems: one per day"),
        f'<text x="590" y="400" text-anchor="middle" {_FONT} font-size="22" font-weight="700" '
        f'fill="{_NEUTRAL}">parallelism: 10 — the politeness cap</text>',
    ]
    # the fan: three running lanes + a queued lane, labelled rather than colour-coded
    for i, (label, fill) in enumerate(
        [("day 01", accent), ("day 02", accent), ("day 03", accent), ("…queued", _QUEUED)]
    ):
        y = 60 + i * 80
        rows.append(_arrow(310, 205, 560, y + 35))
        rows.append(_box(570, y, 180, 70, label, fill))
        rows.append(_arrow(750, y + 35, 950, 205))
    rows.append(_box(960, 160, 170, 90, "catalog", _NEUTRAL, sub="fills in bulk"))
    aria = (
        "Rung 2 flow: withItems fans one step out across thirty days, "
        "capped by a parallelism limit of ten"
    )
    return _svg("".join(rows), aria)


def _rung3() -> str:
    accent = _PAL["rungs"][3]
    rows = [
        _box(60, 60, 270, 90, "logbook (STAC)", accent, sub="what actually landed"),
        _arrow(330, 105, 470, 105, label="present"),
        _box(480, 60, 330, 90, "find_gaps", _NEUTRAL, sub="expected &#8722; present"),
        _arrow(810, 105, 950, 105, label="gaps"),
        _box(960, 60, 170, 90, "only the gaps", accent),
        # the feedback edge back into ingestion: down, left, and into the logbook again
        f'<path d="M 1045 150 L 1045 300 L 330 300" stroke="{_NEUTRAL}" stroke-width="4" '
        f'fill="none" marker-end="url(#arr)"/>',
        _box(120, 260, 200, 80, "ingest", accent, sub="rung-2 fan-out"),
        f'<path d="M 220 260 L 220 150" stroke="{_NEUTRAL}" stroke-width="4" fill="none" '
        f'marker-end="url(#arr)"/>',
        f'<text x="640" y="280" text-anchor="middle" {_FONT} font-size="22" '
        # plain comma phrasing: arrow glyphs rasterize to tofu in cairosvg (see recap-GIF notes)
        f'fill="{_NEUTRAL}">idempotent: nothing missing, nothing to do</text>',
    ]
    aria = (
        "Rung 3 flow: find_gaps compares expected days with the logbook's present days "
        "and feeds only the gaps back into the fan-out ingest"
    )
    return _svg("".join(rows), aria)


FLOWS = {
    "flow-rung1.svg": _rung1,
    "flow-rung2.svg": _rung2,
    "flow-rung3.svg": _rung3,
}


def build_svgs() -> dict[str, str]:
    return {name: build for name, build in ((n, f()) for n, f in FLOWS.items())}


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, svg in build_svgs().items():
        (OUT / name).write_text(svg)
    print(f"wrote {len(FLOWS)} flow diagrams to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
