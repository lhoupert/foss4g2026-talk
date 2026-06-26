"""Contract for the per-rung flow diagrams (scripts/make_flow_svg.py).

Three minimal SVGs replace bullet walls in the deck (storyboard S10/S15/S18): the rung-1
"same script, Argo-wrapped" flow, the rung-2 capped fan-out, and the rung-3 `find_gaps` loop.
Deterministic output, the rung's DevSeed accent, and every meaning carried by a label, never
colour alone.
"""

from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

from make_flow_svg import FLOWS, build_svgs, main  # noqa: E402

EXPECTED = {
    "flow-rung1.svg": "#2e86ab",  # blue — wrap the same script
    "flow-rung2.svg": "#4da167",  # green — fan-out with a parallelism cap
    "flow-rung3.svg": "#e2c044",  # gold — the find_gaps loop
}


def test_builds_exactly_the_three_storyboard_diagrams() -> None:
    assert set(build_svgs()) == set(EXPECTED) == set(FLOWS)


def test_output_is_deterministic() -> None:
    assert build_svgs() == build_svgs()


@pytest.mark.parametrize(("name", "accent"), sorted(EXPECTED.items()))
def test_each_diagram_is_valid_svg_with_its_rung_accent(name: str, accent: str) -> None:
    svg = build_svgs()[name]
    root = ET.fromstring(svg)  # well-formed XML
    assert root.tag.endswith("svg")
    assert accent in svg, f"{name} must use its rung's accent {accent}"
    assert 'role="img"' in svg and "aria-label" in svg, "a11y: needs role + aria-label"


@pytest.mark.parametrize(
    ("name", "labels"),
    [
        # rung 1: the unchanged unit of work, wrapped — retries / UI / logbook appear around it
        ("flow-rung1.svg", ["same unit of work", "retries", "logbook"]),
        # rung 2: fan-out with the politeness cap as a labelled number, not just an arrow burst
        ("flow-rung2.svg", ["withItems", "parallelism"]),
        # rung 3: the loop reads expected - present = gaps, feeding back into ingest
        ("flow-rung3.svg", ["expected", "present", "gaps", "find_gaps"]),
    ],
)
def test_meaning_is_carried_by_text_labels(name: str, labels: list[str]) -> None:
    svg = build_svgs()[name].lower()
    for label in labels:
        assert label.lower() in svg, f"{name} must label {label!r} (never colour alone)"


def test_main_writes_the_files(tmp_path, monkeypatch) -> None:
    import make_flow_svg as mod

    monkeypatch.setattr(mod, "OUT", tmp_path)
    assert main() == 0
    for name, svg in build_svgs().items():
        assert (tmp_path / name).read_text() == svg
