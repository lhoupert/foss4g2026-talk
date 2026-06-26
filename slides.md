---
theme: ./theme
title: From Cron Job to Self-Healing Pipeline
info: |
  FOSS4G Europe 2026. A maturity ladder for Earth-observation ingestion.
  Talk by Loïc Houpert (Development Seed).
  Companion repo: github.com/lhoupert/argo-stac-eo-pipeline
highlighter: shiki
mdc: true
routerMode: hash
favicon: /meta/favicon.png
addons:
  - slidev-addon-qrcode
layout: title
image: /images/theme/landsat9-kangerdlugssuaq-greenland.jpg
---

# From Cron Job to Self-Healing Pipeline

::subtitle::
An example of a maturity ladder for Earth-observation ingestion

<DecorativeRectangle
  width="46%"
  height="38%"
  :zIndex="20"
  :position="{ bottom: '3%', right: '3%' }"
  :customStyle="{ mixBlendMode: 'multiply' }"
>
  <div w-full h-full relative flex flex-col items-end justify-end p-4 text-white text-right>
    <p text-3xl font-300>FOSS4G Europe 2026</p>
    <h5 text-sm><code text-primary>Loïc Houpert · Development Seed</code></h5>
  </div>
</DecorativeRectangle>
<LogoHorPos position="top-left" height="34px" />

<!--
- The band along the bottom is the synthetic world's own art: clearly stylised, never passed off as real EO.
- Open on your own story, plainly, not as a performance. Tell the oceanographer → cloud-engineer arc;
  the fragility comes through honestly, no shared-pain device.
-->

---
layout: image-right
image: /images/theme/lena-delta.jpg
---

# I built my first datasets the fragile way. They only worked because I was watching.

<LogoHorPos position="top-left" height="30px" />

<!--
- Your own story: physical oceanographer → years building research datasets by hand (cron + MATLAB).
  They worked, but only because you were the monitoring, the alerting and the recovery, all at once.
- The pivot: moved into cloud engineering, curious about the systems behind the data. New to Argo
  specifically: "What is Argo Workflows?" to a working pipeline in five days; only the tool was new.
- The distance between a script on your laptop and a pipeline you can trust, and how you close it,
  one step at a time.
-->

---
layout: center
class: text-center
---

# A five-rung ladder

<div flex justify-center my-2>
  <img :src="'./ladder.svg'" class="h-100 w-auto object-contain" alt="The maturity ladder, rungs 0 to 4" />
</div>

Five rungs, from a laptop cron job at the bottom to a pipeline that fills its own gaps at the top.

<LogoHorPos position="top-left" height="30px" />

<!--
- Stop talking for a second; let it land.
- Five rungs: laptop cron at the bottom, a pipeline that fills its own gaps at the top.
- It's diagnostic: you can place your own work on it, and the question is just which rung you're on
  and what the next one is.
- The unit of work never changes; only the ladder around it grows.
-->

---
layout: default
---

# Two promises before we climb

<div grid grid-cols-2 gap-12 mt-8>
<div>

## Promise 1: you do not need Kubernetes

Rung 0 is a line in a crontab. To run the repo later you need **Docker**, and that's it. You do
**not** need a word of Kubernetes.

</div>
<div>

## Promise 2: Argo Workflows ≠ Argo CD

A workflow engine: it runs your steps in order and retries them. It isn't Argo CD, the GitOps
tool. Same logo family, completely different job.

</div>
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- Promise 1, permission to relax: "if you've been told doing-it-properly means learn K8s first, that
  wall is what this ladder gets you over, one rung at a time."
- Promise 2, saves a Q&A tangent: "when I say Argo today, I mean Workflows."
- The honesty beat (and the best evidence for the talk): "I'm not an Argo veteran; I climbed this ladder
  myself, this year. The next rung being an afternoon away is a recent memory, not a pitch."
-->

---
layout: cover
background: /images/theme/landsat9-taklimakan-desert-china.jpg
dim: true
---

# Rung 0
## The _actual_ cron job

<img :src="'./ladder-rung0.svg'" class="mini-ladder" alt="you are here: rung 0 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Keep it warm: this is us. "I've shipped this, more than once."
-->

---
layout: default
---

<div class="rung-kicker rung0">Rung 0 · Cron</div>

# Where I started

<img :src="'./ladder-rung0.svg'" class="corner-ladder" alt="you are here: rung 0" />

```bash
# laptop crontab, fires at 03:00; nowhere to look when it fails
0 3 * * *  python -m eo_ingest.ingest >> /tmp/eo.log 2>&1
```

**Did it run last night? I couldn't tell without opening the log. Did it fail? Often I couldn't tell at all.**

<LogoHorPos position="top-left" height="30px" />

<!--
- It works most of the time, and then quietly stops. The laptop slept, the wifi dropped, the log
  scrolled past a week ago. You're the only one watching, and you were asleep.
- Keep the crontab line in mind: we never throw it away. The next rung wraps this exact script.
-->

---
layout: cover
background: /images/theme/landsat9-bangladesh-coast.jpg
dim: true
---

# Rung 1
## Wrapping the **same script** in Argo

<img :src="'./ladder-rung1.svg'" class="mini-ladder" alt="you are here: rung 1 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Same unit of work, unchanged. What changes is everything around it.
-->

---
layout: default
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# Same unit of work: everything around it changes

<div class="grid gap-10 items-center mt-6" style="grid-template-columns: 3fr 2fr">

<div flex justify-center>
  <img :src="'./flow-rung1.svg'" class="max-h-90 w-auto object-contain" alt="The unchanged ingest unit of work, wrapped by an Argo CronWorkflow that adds retries, a web UI, and a STAC logbook" />
</div>

<div class="text-xl">

The ingest function is **unchanged**; Argo wraps it with **retries**, a **web UI**, and a **STAC logbook**.

</div>

</div>

<img :src="'./ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />
<LogoHorPos position="top-left" height="30px" />

<!--
- Heads-up on what's on screen from here: a tiny synthetic world (made-up missions, laptop-sized), so
  every clip is reproducible on your machine. Real Sentinel-2 at the end, promise.
- Full honesty before anyone asks: Argo runs ON a Kubernetes cluster; the repo brings one up inside
  Docker with one command. You use it, you don't operate it. The promise stands.
- The 0→1 delta, plainly: it isn't "I learned Kubernetes"; it's "I moved one script to a thing that
  retries it and remembers what it did." That's about an afternoon of work, and it's the on-ramp.
-->

---
layout: default
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# It's this little: a schedule plus the image you already have

<img :src="'./ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

```yaml
kind: CronWorkflow          # Argo: cron, but supervised
spec:
  schedule: "0 3 * * *"     # the same 3 a.m. line
  workflowSpec:
    templates:
      - container:
          image: eo-ingest  # the rung-0 code, byte-for-byte
```

<LogoHorPos position="top-left" height="30px" />

<!--
- Point at the schedule line ("that's your crontab") and the image line ("that's the script you already have").
- There's no Kubernetes on screen, just a schedule and an image, and that's the whole on-ramp.
-->

---
layout: default
class: text-center
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# Retries: a 3 a.m. blip, recovered

<img :src="'./ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

<div flex justify-center my-2>
  <img :src="'./clips/rung1-retry.gif'" class="h-80 w-auto object-contain rounded" alt="Argo UI workflow graph: ingest(0) failed (red), the automatic retry ingest(1) succeeded (green); the day is recovered, unattended" />
</div>

_ingest(0) ✗ → ingest(1) ✓ · recovered, unattended_

<LogoHorPos position="top-left" height="30px" />

<!--
- Let the clip's first loop land in silence; you don't have to fill the gap.
- ingest(0) ✖ → ingest(1) ✔: a blip that used to eat a day silently is now a recovered day, and you
  slept through the recovery. "It changed how I felt about going to bed."
-->

---
layout: two-cols
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# A place to look, and not just you

A web UI keeps **every run, every step, every log line**. Open it and the failed step glows red.

With a laptop crontab, only its author could debug it. Now a colleague opens the UI, reads the logs
and understands what happened, without touching your machine.

::right::

<div h-full flex items-center justify-center pr-2>
  <img :src="'./argo-ui-still.png'" class="max-h-100 w-auto object-contain rounded shadow-lg" alt="The Argo Workflows web UI: a workflow step graph with the failed step marked red and logs one click away" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The team angle: with a laptop crontab only its author can debug it. Now a colleague can open the UI,
  see the failed step, read the logs, and understand what happened, without touching your machine.
- Point at the red step + the log panel so anyone who's never opened it knows what "a place to look" means.
-->

---
layout: two-cols
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# Every item lands in a **STAC logbook** you can browse

<img :src="'./ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

<div class="text-xl mt-6">

A queryable catalog of everything that landed: browse collections, inspect items, and read their metadata.

_(Hold that thought.)_ In a few rungs this logbook wakes up and starts deciding what to fetch.

</div>

::right::

<div class="flex flex-col gap-3 h-full justify-center pr-2">
  <img :src="'./stac-collection-view.png'" class="w-full max-h-58 object-cover object-top rounded shadow-lg" alt="stac-fastapi browser showing the MOI AV (synthetic) collection with its spatial extent on a map and a thumbnail item" />
  <img :src="'./stac-item-detail.png'" class="w-full max-h-58 object-cover object-top rounded shadow-lg" alt="stac-fastapi browser showing the MOI-AV_20260314 item detail: map, assets, and metadata including GSD, mission, platform, and instruments" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- Today it just feels like a record of what landed. In a few rungs this logbook wakes up.
- Very few extra lines for all three: retries, the UI, the logbook. The ingest code in the container
  is the same cron one, enforced by the repo's tests.
-->

---
layout: cover
background: /images/theme/landsat8-ord-river-australia.jpg
dim: true
---

# Rung 2
## Three years, not just last night

<img :src="'./ladder-rung2.svg'" class="mini-ladder" alt="you are here: rung 2 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Backfill: someone wants a time series and there's a hole the size of a mission. Doing it one day
  at a time can cost you a whole weekend.
-->

---
layout: default
---

<div class="rung-kicker rung2">Rung 2 · Fan-out</div>

# Fan-out: the same step, side by side

<img :src="'./ladder-rung2.svg'" class="corner-ladder" alt="you are here: rung 2" />

<div class="grid gap-8 items-start mt-4" style="grid-template-columns: 1fr 1fr">

<div class="flex flex-col items-center gap-3">
  <img :src="'./flow-rung2.svg'" class="max-h-80 w-auto object-contain" alt="withItems fans the same step across thirty days, capped at ten in flight by the parallelism limit" />
  <p class="text-xl text-center">Instead of one step doing 30 days in a row, ask for 30 steps at once. In Argo that's <strong><code>withItems</code></strong>, one line.</p>
</div>

<div flex justify-center>
  <img :src="'./clips/rung2-fanout-still.png'" class="max-h-90 w-auto object-contain rounded shadow" alt="Argo UI showing a month of backfill fanned out in parallel" />
</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- "Fan-out" expanded on first use: instead of one step doing 30 days in a row, ask for 30 steps at once.
  In Argo that's `withItems`, one line. Same unit of work; we just asked for many.
-->

---
layout: default
class: text-center
---

<div class="rung-kicker rung2">Rung 2 · Fan-out</div>

# A month of backfill

<img :src="'./ladder-rung2.svg'" class="corner-ladder" alt="you are here: rung 2" />

<div class="grid gap-6 mt-4" style="grid-template-columns: 1fr 1fr">
  <img :src="'./argo-rung2-fanout.png'" class="w-full max-h-72 object-cover object-top rounded shadow" alt="Argo workflow details showing the rung2-backfill DAG: ensure-collection then parallel backfill steps" />
  <img :src="'./stac-rung2-items.png'" class="w-full max-h-72 object-cover object-top rounded shadow" alt="STAC browser showing the MOI AV synthetic collection with a grid of 30 ingested items" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- Let the burst of parallel pods play; the cap is visible as the queue drains.
-->

---
layout: cover
background: /images/theme/blue-white-red-abstract-painting.jpg
dim: true
class: text-center
---

<div class="rung-kicker rung2" style="color:#6fd38c">Rung 2 · Fan-out</div>

# About 6× faster on one laptop

50 s vs 311 s on a single node. The **`parallelism: 10`** cap keeps us polite to the upstream service; the speed-up is a side effect.

<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Uncapped fan-out can overwhelm the upstream service even when you mean well; three hundred parallel
  requests is more than the thing you depend on can take. The cap is simply us being considerate.
- Why it works on one machine: ingestion is mostly waiting (network, API, object store). While one step
  waits, another uses the CPU. The speed-up is really a side effect of staying polite. (cut2 drops this
  aside if running long; keep the number and the cap.)
-->

---
layout: cover
background: /images/theme/landsat9-apostle-islands-lake-superior.jpg
dim: true
---

# Rung 3
## The logbook _wakes up_

<img :src="'./ladder-rung3.svg'" class="mini-ladder" alt="you are here: rung 3 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Slow down here. It stops being a record of what happened and starts telling you what to do next.
-->

---
layout: default
---

<div class="rung-kicker rung3">Rung 3 · Self-repair</div>

# What should be here − what is here = what to fetch

<img :src="'./ladder-rung3.svg'" class="corner-ladder" alt="you are here: rung 3" />

```python
def find_gaps(config, collection, start, end):
    present = {day(f) for f in query(collection, start, end)}  # what the logbook HAS
    return [d for d in window(start, end) if d not in present] # what it's MISSING
```

_(Trimmed for clarity; the full, edge-case-hardened version is in the repo.)_

**Real missions:** the code models acquisition cadence rather than calendar days, since some gaps are genuinely _legitimate_.

<LogoHorPos position="top-left" height="30px" />

<!--
- Notice how cheap the question is: a metadata query over what we already wrote down, with no
  re-downloading and no diffing buckets. The expensive thing only happens for days actually missing.
- Cadence caveat, before the STAC-literate raise it: real missions don't image every place daily;
  revisit cycles and clouds make some gaps legitimate. Production models acquisition cadence; the demo
  uses daily cadence so the idea stays visible. Principle identical.
-->

---
layout: default
---

<div class="rung-kicker rung3">Rung 3 · Self-repair</div>

# Feeding the gaps back into the fan-out

<img :src="'./ladder-rung3.svg'" class="corner-ladder" alt="you are here: rung 3" />

<div class="grid gap-10 items-center mt-6" style="grid-template-columns: 3fr 2fr">

<div flex justify-center>
  <img :src="'./flow-rung3.svg'" class="max-h-90 w-auto object-contain" alt="find_gaps subtracts the logbook's present days from the expected days and feeds only the gaps back into the fan-out" />
</div>

<div class="text-xl">

Exactly those missing days go back into rung 2's fan-out. We don't re-ingest the whole window; we re-fetch **only the gaps**.

</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The lovely part: exactly those missing days go back into rung 2's fan-out. No re-ingesting the window,
  no redoing finished work, only the gaps.
-->

---
layout: default
class: text-center
---

<div class="rung-kicker rung3">Rung 3 · Self-repair</div>

# Only the gaps

<img :src="'./ladder-rung3.svg'" class="corner-ladder" alt="you are here: rung 3" />

<div flex justify-center my-2>
  <img :src="'./clips/rung3-gapclose-still.png'" class="max-h-85 w-auto object-contain rounded shadow" alt="The logbook names the missing days (2026-03-04, -05, -10) and the pipeline fills only those, nothing else" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The catalog has holes, find_gaps finds them, the pipeline fills precisely those days and nothing else.
-->

---
layout: cover
background: /images/theme/satellite-image-body-of-water.jpg
dim: true
class: text-center
---

<div class="rung-kicker rung3" style="color:#ffd24a">Rung 3 · Self-repair</div>

# Idempotent + self-correcting

A day that used to slip past unnoticed now **gets caught and refilled on the next run**.

_Idempotent: run it again with nothing missing, and nothing happens. Safe to run on a schedule forever._

**Same script. The pipeline around it now tracks what landed.**

<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Idempotent, plainly: nothing missing → nothing happens. Safe to run on a schedule forever.
- Tie back to the opening: a day that used to slip past now gets refilled on the next run, with no email
  and no scramble. That's the difference between a pipeline you babysit and one you can trust.
- Per-collection: every mission, every region, watched independently. Through-line, second telling.
-->

---
layout: cover
background: /images/theme/landsat9-western-guinea-bissau.jpg
dim: true
---

# Rung 4
## Making the healing _visible_

<img :src="'./ladder-rung4.svg'" class="mini-ladder" alt="you are here: rung 4 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Keep it brief; the main ideas are already in place.
-->

---
layout: center
class: text-center
---

<div class="rung-kicker rung4">Rung 4 · Observability</div>

# The gap heatmap

<div flex justify-center my-2>
  <img :src="'./heatmap.png'" class="h-90 w-auto object-contain" alt="The gap heatmap: one cell per day per collection; filled = landed, slashed = gap" />
</div>

One cell per day, per collection: filled = landed, slashed = gap. The fill and the slash carry the meaning, so it reads even without colour.

<LogoHorPos position="top-left" height="30px" />

<!--
- One glance: the health of the whole window, every collection side by side. Filled cell = landed;
  slashed cell = gap. The shape carries it too, so it reads even without colour. (The still shows the
  seeded demo window; the live report scales the same grid wider; don't claim "months" over a two-week still.)
-->

---
layout: default
class: text-center
---

<div class="rung-kicker rung4">Rung 4 · Observability</div>

# Built from history Argo already keeps

<img :src="'./ladder-rung4.svg'" class="corner-ladder" alt="you are here: rung 4" />

<div flex justify-center my-2>
  <img :src="'./clips/rung4-report-still.png'" class="max-h-85 w-auto object-contain rounded shadow" alt="The daily report: a colour-blind-safe gap grid plus a retry summary, built from Argo's own history" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The live version: daily report from the Argo Workflows API, with no Prometheus in core. Grafana /
  coverage maps are the prod profile; you don't need them to SEE your gaps.
- The ladder keeps going past here (prod deployments, real tiling), but the shape is set: same unit of
  work, more capability around it.
-->

---
layout: image-right
image: /images/theme/sentinel2a-southern-tibetan-plateau.jpg
---

# That's the whole ladder

The same ingest step at every rung. What grew was how much the pipeline heals on its own.

There are two distinct levels of that healing, and it is worth separating them out.

<LogoHorPos position="top-left" height="30px" />

<!--
- Before naming the two levels: invite the diagnostic. "This ladder is not aspirational — you can
  place your own work on it. When I place my past work on it, most of it sat at rung 0 or 1. And the
  next rung is usually an afternoon away. So: which rung are you on?"
- Then pivot: "Two distinct kinds of healing — let me name them separately, because they are easy to blur."
-->

---
layout: default
---

# Two levels of self-**correction**

| Level | Failure | Who fixes it | Rung |
|-------|---------|--------------|------|
| **Item** | a run fails transiently | Argo **retries** it, automatically | 1 |
| **System** | a whole day never landed | the logbook **detects + refills**; the report **surfaces** it | 3 + 4 |

> It heals the predictable; genuinely-absent data and systemic faults are **surfaced** for a human to judge. The pipeline never invents data.

<LogoHorPos position="top-left" height="30px" />

<!--
- The conceptual point: name the two loops plainly, and let the clarity do the work.
- The honest edge (panel review): "self-healing" refills only what *should* have been there; a day
  never acquired isn't a missed retry. The cadence model knows that; the report shows a human anything
  systemic. We don't invent data.
- Item-level the machine fixes alone. System-level the machine finds and a human decides.
- Why the split matters: the machine absorbing blips is what *earns* your attention for genuine problems.
  A pipeline that fired at every hiccup would just get muted, no better than silent cron.
- §5 outro (spoken before advancing to EOPF slide): "The unit of work never changes; only the ladder
  around it grows. I climbed this ladder twice — once at sea, with cron and MATLAB, and once again
  this year. You only have to climb it once."
-->

---
layout: two-cols
---

# The same patterns, at production scale

<div class="text-xl mt-6">

The exact same patterns — Argo orchestrating an ingest function, a STAC catalog as the logbook — deployed at Copernicus scale.

<div flex items-center gap-3 my-2>
  <img :src="'./eopf-explorer-logo.png'" class="h-10" alt="EOPF Explorer logo" />
  <strong><a href="https://explorer.eopf.copernicus.eu/">explorer.eopf.copernicus.eu</a></strong>
</div>

_Ingestion feeds a catalog; the visualisation and analysis layers come next — and the same orchestration moves wrap those steps too._

</div>

::right::

<div h-full flex items-center justify-center pr-2>
  <img :src="'./eopf-sentinel-explorer.png'" class="w-full object-contain rounded shadow-lg" alt="EOPF Sentinel Explorer STAC API: Sentinel-2 Level-2A collection page showing items grid" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The credibility beat: the demos ran in a synthetic world — this is what the same patterns look like at
  Copernicus scale. A real deployed catalog for Sentinel-2 data. Same ladder; much larger world.
- Honest scope: ingestion gets data ready for the algorithm; ARD / cloud-mask / indices start where it
  ends. The same orchestration moves wrap those steps too.
-->

---
layout: default
---

# Go deeper this week

<div class="grid gap-8 mt-8" style="grid-template-columns: 1fr 1fr">

<div class="p-6 rounded-lg" style="background: #1e293b; color: white;">
  <p class="text-sm font-600 uppercase tracking-wide mb-1" style="color: #56B4E9;">Thursday 2 July · 9:00 · Room A13</p>
  <h3 class="text-xl font-700 mt-0 mb-3">eoAPI + STAC for Earth Data at Scale</h3>
  <p class="text-base m-0">Catalog, discover, visualize, and analyze Earth observation data efficiently. Hands-on with <strong>Felix Delattre</strong> (Development Seed).</p>
</div>

<div class="p-6 rounded-lg" style="background: #1e293b; color: white;">
  <p class="text-sm font-600 uppercase tracking-wide mb-1" style="color: #E69F00;">Friday 3 July · 9:00 · Room 059</p>
  <h3 class="text-xl font-700 mt-0 mb-3">EOPF Zarr Explorer: GeoZarr on the Web</h3>
  <p class="text-base m-0">GeoZarr, TiTiler, eodash, Jupyter EOxElements — cloud-native EO visualization, hands-on with <strong>Ahmed Behairi</strong> (EOX).</p>
</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The community is here, this week. Two workshops dive exactly into this ecosystem.
- Say the room and day clearly — people will want to add it to their schedule.
-->

---
layout: image-right
image: /images/theme/landsat8-klyuchevskaya-kamchatka.jpg
---

# Questions?

_one rung at a time_

**github.com/lhoupert/argo-stac-eo-pipeline**

`make up && make demo STAGE=01` — the whole ladder, on your laptop, with Docker.

<div mt-6>
  <img :src="'./repo-qr.png'" class="h-44" alt="QR code linking to the talk's GitHub repository" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- Leave this up for Q&A. Repo open in a backup tab; never depend on a live cluster.
- Pause before answering; repeat the question so the room hears it.
- On production-scale Argo: be honest — "I've run this at laptop scale; I'd start from the prod
  profile but don't have war stories at volume."
- Likely questions: ingestion vs ARD boundary; how the synthetic world maps to real missions;
  cost/ops of running Argo; why not Airflow? (→ advance to the next slide if that comes up).
-->

---
layout: default
---

# Why Argo, and the neighbours

The ladder is **orchestrator-agnostic**: Airflow or Prefect could climb it too. Argo buys K8s-native
**container-per-step**, first-class **fan-out**, no separate scheduler DB.

**Neighbours:** cirrus-geo · stactools / stac-task · VEDA · openEO _(processing side)_

<LogoHorPos position="top-left" height="30px" />

<!--
  [BACKUP — advance here only if "why not Airflow / Prefect?" comes up in Q&A]
- The ladder is orchestrator-agnostic; Argo wins on three concrete points: container-per-step
  isolation, first-class fan-out (withItems), no separate scheduler database to operate.
- Neighbours worth naming: cirrus-geo for the AWS-native path; stactools / stac-task for item
  builders; VEDA for the NASA deployment; openEO on the processing side.
- Close with the through-line: none of these pieces are new — the contribution is a path a solo
  researcher can walk.
-->
