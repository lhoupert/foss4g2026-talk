#!/usr/bin/env bash
# Record one screencast clip end-to-end (T28). Resets the clip's start state, then captures it.
# Clips are MAINTAINER-recorded (needs the opt-in tools — `make tools-record`), not run in CI.
#
# Medium matches message (panel review):
#   rung1-retry, rung2-fanout → the Argo UI workflow graph (Playwright → ffmpeg GIF). The coloured
#                               node graph teaches "a failed step, retried" / "many days in parallel"
#                               far better than a terminal table.
#   rung3-gapclose, rung4-report → terminal (asciinema → agg), then a guiding band composited on top
#                               (scripts/annotate_clip.py). Their payload is text — the detected gap
#                               list, the gap heatmap — which a graph would hide.
#   recap → assembled from the ladder SVGs.
set -euo pipefail
cd "$(dirname "$0")/.."

clip="${1:-}"
[ -n "$clip" ] || { echo "usage: scripts/record_clip.sh <clip>"; exit 2; }
gif="docs/slides/clips/$clip.gif"

case "$clip" in
  rung1-retry)
    command -v node >/dev/null && command -v ffmpeg >/dev/null || {
      echo "node + ffmpeg needed for the UI clip — see 'make tools-record' (+ 'npx playwright install chromium')"; exit 1; }
    echo "[1/2] reset state for $clip"          # a fresh cluster so the retry fires
    uv run python scripts/make_screencast_data.py "$clip" --run
    echo "[2/2] capture $clip from the Argo UI"  # the .mjs submits, records the graph, runs ffmpeg
    pkill -f "port-forward svc/argo-server 2746" 2>/dev/null || true; sleep 1
    kubectl -n eo port-forward svc/argo-server 2746:2746 >/dev/null 2>&1 & pf=$!
    trap 'kill $pf 2>/dev/null || true' EXIT
    sleep 4
    node docs/slides/playwright/argo-clip-rung1.mjs
    ;;

  rung2-fanout | rung3-gapclose | rung4-report)
    command -v asciinema >/dev/null && command -v agg >/dev/null || {
      echo "asciinema/agg missing — run 'make tools-record'"; exit 1; }
    echo "[1/2] reset state for $clip"
    uv run python scripts/make_screencast_data.py "$clip" --run
    echo "[2/2] capture $clip (terminal + guiding band)"
    cast="docs/slides/clips/$clip.cast"
    # --cols 92 (down from 110) → larger, back-row-legible type once scaled; --rows 22 → a wide aspect
    # that fits the slide at h:450. annotate_clip.py then composites the persistent header/legend band.
    # rung 2's 30-day backfill runs long, so play it 2x (the parallel burst is the point; the on-slide
    # caption carries the words); rung 3/4 stay 1x so their gap list / heatmap can be read.
    speed=1; [ "$clip" = "rung2-fanout" ] && speed=2
    asciinema rec --overwrite --idle-time-limit 3 --command "scripts/clip_demo.sh $clip" "$cast"
    agg --cols 92 --rows 22 --speed "$speed" "$cast" "$gif"
    rm -f "$cast"
    uv run python scripts/annotate_clip.py "$clip" "$gif"
    ;;

  recap)
    echo "[1/1] assemble recap from the ladder SVGs"
    DYLD_FALLBACK_LIBRARY_PATH="${DYLD_FALLBACK_LIBRARY_PATH:-}:/opt/homebrew/lib" \
      uv run python scripts/make_recap_gif.py
    ;;

  *)
    echo "unknown clip: $clip (rung1-retry|rung2-fanout|rung3-gapclose|rung4-report|recap)"; exit 2
    ;;
esac
echo "done → $gif"
