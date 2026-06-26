#!/usr/bin/env python3
"""Regenerate ladder-rung{0..4}.svg so only the CURRENT rung is coloured; the others
are ghosted in grey. Used by the rung dividers and the per-slide corner ladders.
The full ladder.svg (overview on slides 4/27) is left untouched."""
import sys

COLORS = ["#565b65", "#2e86ab", "#4da167", "#e2c044", "#cf3f02"]
TEXT_ACTIVE = ["#ffffff", "#111111", "#111111", "#111111", "#ffffff"]
LABELS = ["cron", "retries + logbook", "fan-out", "self-repair", "observability"]

# ghosted (inactive) rung styling
GREY_FILL = "#e6e6e0"
GREY_STROKE = "#c2c2b9"
GREY_TEXT = "#9a9a90"
ACTIVE_STROKE = "#443f3f"
MARK = "#cf3f02"

LINES = [(270, 384, 290, 306), (520, 306, 540, 228),
         (770, 228, 790, 150), (1020, 150, 1040, 72)]
FONT = "Roboto, system-ui, sans-serif"


def rung_xy(i):
    return (40 + 250 * i, 352 - 78 * i)


def gen(current):
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1310 456" role="img" '
         'aria-label="EO ingestion maturity ladder, rungs 0 to 4">',
         '  <title>Maturity ladder (rungs 0–4)</title>']
    for (x1, y1, x2, y2) in LINES:
        o.append(f'  <line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                 f'stroke="#CFCFC6" stroke-width="10" stroke-linecap="round"/>')
    o.append('  <polyline points="1139,30 1155,10 1171,30" fill="none" stroke="#999990" '
             'stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>')
    for i in range(5):
        x, y = rung_xy(i)
        active = (i == current)
        fill = COLORS[i] if active else GREY_FILL
        stroke = ACTIVE_STROKE if active else GREY_STROKE
        sw = 5 if active else 2
        tcol = TEXT_ACTIVE[i] if active else GREY_TEXT
        nx, ny, lx, ly = x + 16, y + 41, x + 48, y + 41
        o.append(
            f'  <g><rect x="{x}" y="{y}" width="230" height="64" rx="10" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}"/>'
            f'<text x="{nx}" y="{ny}" font-family="{FONT}" font-size="26" font-weight="700" '
            f'fill="{tcol}">{i}</text>'
            f'<text x="{lx}" y="{ly}" font-family="{FONT}" font-size="20" fill="{tcol}">{LABELS[i]}</text>')
        if active:
            cx = x + 115
            poly = f'{cx-9},{y-16} {cx+9},{y-16} {cx},{y-3}'
            o.append(f'  <polygon points="{poly}" fill="{MARK}"/>'
                     f'<text x="{cx}" y="{y-22}" text-anchor="middle" font-family="{FONT}" '
                     f'font-size="17" font-weight="700" fill="{MARK}">you are here</text>')
        o.append('  </g>')
    o.append('</svg>')
    return "\n".join(o) + "\n"


outdir = sys.argv[1].rstrip("/")
for n in range(5):
    with open(f"{outdir}/ladder-rung{n}.svg", "w") as f:
        f.write(gen(n))
print("regenerated ladder-rung0..4.svg in", outdir)
