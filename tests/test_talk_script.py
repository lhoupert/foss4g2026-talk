"""Phase A — content contract for the talk *script* (docs/slides/script.md).

`script.md` is the single source for the spoken talk track (the plan's "Work order — A").
This guards its *structure* — every narrative beat present, minute-markers, an explicit cut-list,
and the ladder said at open/middle/close — without policing the author's wording, which they
rewrite in their own voice.

The spoken track is carried in Markdown blockquote lines (`> …`); everything else is director
notes / minute-markers / the cut-list. That lets us word-count the spoken track as an *automated
proxy* for the SPEC timing gate (≈26½ min content). The real gate is a timed read-through
(plan §Verification); this band only catches a script that is grossly too long or too thin.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[1] / "docs" / "script.md"
TEXT = SCRIPT.read_text()
LOWER = TEXT.lower()

# Spoken track = blockquote lines (drop the "> " marker). Director notes / headings are excluded.
SPOKEN = "\n".join(line[1:].strip() for line in TEXT.splitlines() if line.lstrip().startswith(">"))
SPOKEN_WORDS = len(SPOKEN.split())


def test_script_exists_and_titles_the_talk() -> None:
    assert SCRIPT.exists(), "docs/slides/script.md is the single source for the talk track"
    assert "self-healing pipeline" in LOWER


@pytest.mark.parametrize(
    "beat",
    [
        "hook",  # 1. shared pain
        "reframe",  # 2. thesis → the ladder
        "two promises",  # 3. no K8s; Workflows != CD
        "rung 0",  # 4. climb
        "rung 1",
        "rung 2",
        "rung 3",
        "rung 4",
        "self-correction",  # 5. payoff — the two loops
        "locate yourself",  # 6. the mental model in use
        "run it tonight",  # 7. it's real + clone-and-run
        "q&a",  # 8.
    ],
)
def test_covers_every_narrative_beat(beat: str) -> None:
    assert beat in LOWER, f"script is missing the narrative beat: {beat!r}"


def test_has_minute_markers_open_and_close() -> None:
    markers = re.findall(r"\b\d{1,2}:\d{2}\b", TEXT)
    assert len(markers) >= 8, "each beat needs a minute-marker"
    assert "0:00" in markers, "the script must start at 0:00"
    assert any(m.startswith(("26:", "27:", "28:", "29:", "30:")) for m in markers), (
        "the content track must reach the ~26½-min hand-off to Q&A"
    )


def test_has_an_explicit_cut_list() -> None:
    # The plan requires an explicit "if running long, cut X" list.
    assert "if running long" in LOWER or "cut-list" in LOWER or "cut list" in LOWER
    assert "cut" in LOWER


def test_says_the_ladder_at_open_middle_and_close() -> None:
    # The through-line is reinforced thrice (plan §Verification).
    assert LOWER.count("ladder") >= 3
    assert "the unit of work never changes" in LOWER


def test_states_both_promises() -> None:
    assert "argo workflows" in LOWER and "argo cd" in LOWER  # promise 2
    assert "kubernetes" in LOWER and "docker" in LOWER  # promise 1


def test_names_a_neighbour_for_why_argo() -> None:
    assert any(n in LOWER for n in ("cirrus", "openeo", "airflow", "stactools", "veda"))


def test_lands_the_real_eo_and_clone_and_run_close() -> None:
    assert "sentinel-2" in LOWER
    assert "make up" in LOWER
    assert "qr" in LOWER


def test_spoken_track_fits_the_time_budget() -> None:
    # ≈26½ min of spoken content at a conference pace (~110–160 wpm) → ~2900–4200 words.
    # A wide band: this is a proxy, the real gate is the timed read-through.
    assert 2800 <= SPOKEN_WORDS <= 4300, (
        f"spoken track is {SPOKEN_WORDS} words; expected ~2900–4200 for a ≈26½-min talk"
    )


def test_no_scaffold_or_todo_markers_remain() -> None:
    assert "TODO" not in TEXT
    assert "SCAFFOLD" not in TEXT
