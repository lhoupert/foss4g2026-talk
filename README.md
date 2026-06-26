# From Cron Job to Self-Healing Pipeline — FOSS4G Europe 2026

The presentation deck for the talk **"From Cron Job to Self-Healing Pipeline: the maturity ladder for
Earth-observation ingestion"** (Loïc Houpert · Development Seed), built with
[Slidev](https://sli.dev/) on Development Seed's Slidev theme.

This repo is **self-contained**: the deck, its spoken script, the asset generators, and all rendered
assets live here. The companion code repo
[`argo-stac-eo-pipeline`](https://github.com/lhoupert/argo-stac-eo-pipeline) holds the demo pipeline
the talk walks through; you only need it to **re-record** the screencast clips and UI stills against a
live cluster (the recordings themselves are committed here, so the deck always builds standalone).

## Run, build, export

This repo uses **npm**.

```bash
npm install        # install dependencies
npm run dev        # live preview at http://localhost:3030
npm run build      # static SPA into dist/
npm run export     # PDF fallback (foss4g-2026-talk.pdf, via playwright-chromium)
```

## Regenerating the assets

The deck's diagrams and gap heatmap are produced by deterministic scripts in [`scripts/`](./scripts)
that write straight into [`public/`](./public). They use a small Python toolchain managed with
[uv](https://docs.astral.sh/uv/):

```bash
uv sync                                    # one-time: build the env from pyproject.toml
uv run python scripts/make_flow_svg.py     # flow-rung{1,2,3}.svg
uv run python scripts/make_heatmap_png.py  # heatmap.png
uv run python scripts/make_qr.py           # repo-qr.png
uv run python scripts/gen-ladders.py 0     # ladder-rung{0..4}.svg ("you are here" per rung)
```

Re-running them reproduces the committed assets byte-for-byte. The heatmap is derived from the demo's
seed window + planted gaps, **vendored** in [`scripts/seed_constants.py`](./scripts/seed_constants.py),
so nothing imports back into the code repo. (`uv run pytest` runs the content + generator contract tests.)

The **screencast clips** (`public/clips/*.gif`), the **UI stills** and the **recap** are recordings, so
they need the companion demo running. Re-recording uses the tooling in `scripts/` + `playwright/` against
a live `argo-stac-eo-pipeline` cluster; the recorded results are committed here.

## Where things live

- **Slides:** [`slides.md`](./slides.md) — content + per-slide layout/notes.
- **Theme:** [`theme/`](./theme) — Development Seed's Slidev theme (layouts, components, brand styles).
- **Assets:** [`public/`](./public) — diagrams (`*.svg`, `heatmap.png`), screencast clips
  (`clips/*.gif`), UI stills, the repo QR, and cover/divider imagery under `public/images/theme/`.
  All committed; diagrams are *generated* by [`scripts/`](./scripts), clips/stills are recordings.
- **Generators + tooling:** [`scripts/`](./scripts) — diagram generators (`make_*.py`,
  `gen-ladders.py`, `seed_constants.py`), clip/still recording scripts, and [`playwright/`](./playwright).
  See *Regenerating the assets* above. Tests in [`tests/`](./tests).
- **Imagery provenance:** [`recommended-images.yaml`](./recommended-images.yaml) — source + description
  for each theme image (vetted for a public repo).
- **Fonts:** [`public/fonts/`](./public/fonts) — Roboto + Roboto Mono self-hosted as `woff2`
  (SIL OFL 1.1, licences vendored); no Google Fonts network call. Antarctica (proprietary) not included.
- **Spoken script:** [`docs/script.md`](./docs/script.md) — the single source for the spoken track; the
  deck's presenter notes are derived cue cards. The storyboard, screencast scripts, anecdote cheatsheet,
  and the build plan/todo are speaker-only and live in the private companion repo `foss4g2026-talk-private`.

## Licence

- **Code, scripts, and configuration** — [MIT](./LICENSE).
- **Presentation content** (slides, spoken script, generated diagrams) —
  [CC BY 4.0](./LICENSE-content.md).
- **Theme, imagery, and fonts** keep their own terms — see *Credits* below.

## Credits

Theme by [Development Seed](https://developmentseed.org/) — see [`theme/README.md`](./theme/README.md).
Built on [Slidev](https://sli.dev/).

### Image credits

Cover and divider imagery is inherited from the
[`ds-slidev-template`](https://github.com/developmentseed/ds-slidev-template); full per-image sources
are in [`recommended-images.yaml`](./recommended-images.yaml). In short:

- **Landsat / satellite scenes** — sourced from [Unsplash](https://unsplash.com/license) (free to use,
  no attribution required): the Greenland fjords, Ord River (Australia), Apostle Islands, Bangladesh
  coast, Kangerdlugssuaq glacier, Taklimakan desert, western Guinea-Bissau, and the abstract
  body-of-water frames.
- **Lena River Delta** (`lena-delta.jpg`) — Landsat 7 "Earth as Art" scene, 27 July 2000, **USGS/NASA
  EROS**, public domain ([Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Lena_River_Delta_-_Landsat_2000.jpg)).
