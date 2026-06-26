#!/usr/bin/env bash
# Narrated wrapper around `make demo STAGE=NN` for the screencast clips (T28).
#
# The bare demos are just `argo submit --watch` — accurate but "dry": an audience member can't tell
# what they're seeing. This prints short, colour-blind-safe step captions (bold + an ASCII marker,
# never colour alone) BEFORE and AFTER the real commands, so the recorded GIF is followable on its
# own. The underlying commands are unchanged — UI-parity with a fresh clone holds.
#
# Used by scripts/record_clip.sh as the recorded command. Preview directly with:
#   scripts/clip_demo.sh rung1-retry
#
# Captions are kept short (≤ ~80 cols) so they fit the recorder's reduced width (agg --cols 92) on
# one line. argo's --watch table repaints in place (and clears the screen), so a caption shows as a
# brief "title card" before the command takes over: it's printed as a discrete line, then a sleep 3
# holds it on screen (record_clip.sh records at --idle-time-limit 3, so the full 3s is kept).
set -euo pipefail
cd "$(dirname "$0")/.."

clip="${1:-}"
NS="${NS:-eo}"

B="$(tput bold 2>/dev/null || true)"
RST="$(tput sgr0 2>/dev/null || true)"

# say <text> [marker]   — marker defaults to ">>" (a step); use "OK:" for a result, "--" for info.
say() {
  printf '\n%s%s %s%s\n' "$B" "${2:->>}" "$1" "$RST"
  sleep 3
}

# Only the terminal clips run through this wrapper. Rung 1 is recorded from the Argo UI graph
# (docs/slides/playwright/argo-clip-rung1.mjs) — the 2-leaf retry graph teaches that concept best.
# (Rung 2 stays terminal: the Argo graph COLLAPSES a big fan-out to "N hidden nodes", whereas the
# `argo --watch` table shows the parallel backfill rows running at once — the actual point.)
case "$clip" in
  rung2-fanout)
    say "Rung 2 - fan-out: one workflow backfills 30 days, capped at 10 running at once."
    make demo STAGE=02
    say "A month of backfill, ten polite requests at a time - never a stampede at the source." "OK:"
    ;;
  rung3-gapclose)
    say "Rung 3 - self-repair: ask the logbook which days are missing, then fetch ONLY those."
    make demo STAGE=03
    # The centerpiece: surface find_gaps' answer (the missing days it detected). The fan-out above
    # ingested exactly these and nothing else.
    gaps=$(argo logs @latest -n "$NS" 2>/dev/null | grep -oE '\["2026[^]]*\]' | tail -n1)
    echo
    say "find_gaps → the logbook reports these days missing:" "OK:"
    echo "    ${gaps:-[]}"
    echo "    → the run above ingested ONLY those; every other day was already present (idempotent)."
    ;;
  rung4-report)
    say "Rung 4 - observability: build the daily report from Argo's own run history."
    make demo STAGE=04
    # The gap heatmap + retry summary is the payoff; let it be the final (frozen) frame.
    argo logs @latest -n "$NS" | tail -n 30
    ;;
  *)
    echo "usage: scripts/clip_demo.sh <rung2-fanout|rung3-gapclose|rung4-report>"
    exit 2
    ;;
esac
