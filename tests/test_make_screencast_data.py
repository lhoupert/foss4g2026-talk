"""T28.2 — the screencast state-reset orchestrator.

Each clip must record from a deterministic start; `make_screencast_data.py <clip> --run` puts the
cluster there by invoking the existing `make` targets (it re-implements no pipeline logic). The
`make`-running is injected here so the contract is testable without a cluster.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from make_screencast_data import CLIPS, main  # noqa: E402

ALL_CLIPS = ["rung1-retry", "rung2-fanout", "rung3-gapclose", "rung4-report", "recap"]


def test_every_clip_has_a_reset_recipe() -> None:
    assert sorted(CLIPS) == sorted(ALL_CLIPS)


def test_dry_run_executes_nothing() -> None:
    calls: list[list[str]] = []
    rc = main(["rung1-retry"], runner=lambda cmd, **kw: calls.append(cmd))  # no --run
    assert rc == 0
    assert calls == []  # printed only


def test_run_resets_a_fresh_cluster_for_the_retry_clip() -> None:
    calls: list[list[str]] = []

    class _OK:
        returncode = 0

    main(["rung1-retry", "--run"], runner=lambda cmd, **kw: calls.append(cmd) or _OK())
    # Fresh cluster => the FAIL_ONCE marker is absent => the retry fires on camera.
    assert calls == [["make", "down"], ["make", "up"]]


def test_run_seeds_gaps_for_the_gapclose_clip() -> None:
    calls: list[list[str]] = []

    class _OK:
        returncode = 0

    main(["rung3-gapclose", "--run"], runner=lambda cmd, **kw: calls.append(cmd) or _OK())
    assert ["make", "seed"] in calls


def test_run_stops_on_first_failure() -> None:
    class _Fail:
        returncode = 2

    rc = main(["rung1-retry", "--run"], runner=lambda cmd, **kw: _Fail())
    assert rc == 2


def test_recap_needs_no_cluster_state() -> None:
    calls: list[list[str]] = []
    rc = main(["recap", "--run"], runner=lambda cmd, **kw: calls.append(cmd))
    assert rc == 0
    assert calls == []  # pure diagram clip


def test_unknown_clip_is_rejected() -> None:
    with pytest.raises(SystemExit):
        main(["not-a-clip"])
