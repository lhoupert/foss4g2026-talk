#!/usr/bin/env python
"""Generate the recap-slide QR for the repo (T28.4).

Scripted so the QR is regenerable and always matches the real URL. Needs `qrcode` (opt-in:
`uv pip install 'qrcode[pil]'`; see `make tools-record`). Default URL is the repo; --url overrides.
"""

from __future__ import annotations

import argparse
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "repo-qr.png"
REPO_URL = "https://github.com/lhoupert/argo-stac-eo-pipeline"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="make_qr", description=__doc__)
    parser.add_argument("--url", default=REPO_URL)
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args(argv)
    try:
        import qrcode  # type: ignore
    except ImportError:
        print("qrcode not installed — `uv pip install 'qrcode[pil]'` (see `make tools-record`).")
        return 1
    args.out.parent.mkdir(parents=True, exist_ok=True)
    qrcode.make(args.url).save(args.out)
    print(f"wrote {args.out} → {args.url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
