---
theme: ./theme
title: From Cron Job to Self-Healing Pipeline
info: |
  FOSS4G Europe 2026. My journey up the maturity ladder for Earth-observation ingestion.
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
My journey up the maturity ladder for Earth-observation ingestion

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
Breathe
-->

---
layout: image-right
image: /images/theme/lena-delta.jpg
---

# I built my first datasets the fragile way. They only worked because I was watching.

<LogoHorPos position="top-left" height="30px" />

<!--
"My path into Earth observation has been a bit unusual. I started as a physical oceanographer, and I spent years turning measurements collected at sea into research datasets."
- Built them the fragile way: scripts on a schedule, cron + MATLAB, held together by hand. Mostly worked because I was the one watching them
- Pivot: moved into cloud engineering, curious about the systems behind the data.
- Surprise by how approachable the modern tooling is. Earlier this year I went from "What is Argo Workflows?" → working pipeline in five days. 

- Main goal of this talk: close the distance between a script on your laptop and a pipeline you can trust.
-->

---
layout: center
class: text-center
---

# A five-rung ladder

<div flex justify-center my-2>
  <img :src="'./ladder.svg'" class="h-100 w-auto object-contain" alt="The maturity ladder, rungs 0 to 4" />
</div>

Five rungs, the path I climbed, from a laptop cron job at the bottom to a pipeline that fills its own gaps at the top.

<LogoHorPos position="top-left" height="30px" />

<!--
**"The way I came to think about that distance is as a ladder. Five rungs."**
- PAUSE photographed slide; stop talking and let it land.
- Bottom = rung 0, script on a laptop 🤞. Top = fills its own gaps before you wake.
- Nothing thrown away as you climb: unit of work never changes; only the ladder grows- the little function that fetches one day of data is the same at the bottom and at the top.
-->

---
layout: default
class: promises-slide
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


<div class="mt-auto flex justify-center">
  <div class="flex items-center gap-5 px-6 py-3 rounded-xl" style="background:#f4f1ee; border:1px solid #e4ddd5">
    <img :src="'./repo-qr.png'" class="h-24 w-auto" alt="QR code linking to the companion repository" />
    <div class="text-left">
      <p class="text-l font-700 uppercase tracking-wide m-0" style="color:var(--slidev-theme-primary)">Follow along — the companion repo</p>
     <div flex items-center gap-2>
      <GitHubIcon size="18" />  <p class="text-normal font-700 m-0 mt-1"><a href="https://github.com/lhoupert/argo-stac-eo-pipeline">github.com/lhoupert/argo-stac-eo-pipeline</a></p>
     </div>
      <p class="text-normal m-0 mt-1" style="color:#565b65">Every rung runs on your laptop with Docker:</p>
<p class="text-normal m-0 mt-1" style="color:#565b65"> <code>make up && make demo STAGE=01</code></p>
    </div>
  </div>
</div>

<LogoHorPos position="top-left" height="30px" />

<style>
.slidev-layout.default.promises-slide { justify-content: flex-start; }
</style>

<!--
**"Before we start, two quick promises."**

- Promise 1: first rung is one line in a crontab; to run the repo you need Docker, that's it. "If you've been told doing-it-properly means learn K8s first, that wall is what this talk will try help you get over."
- Promise 2: Argo = Argo Workflows. Not Argo CD. Same logo family, different job.

- Companion repo: "everything I show is one repo, QR's here, also on the closing slide."
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
**"Rung zero is the honest baseline: one line in a laptop crontab."**
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
- Example of simple cron tab that run a simple ingestion script every morning at 3am and append the output to a log file. This example is very similar to the first ingestion/processing script I ran.
- PhD: 13 separate databases, ~190k ocean profiles, 44 years — stitched by hand, cron + MATLAB. Scientific analysis of these data led to my 1st scientifc paper. Building this -> looot of time and effort and it worked mostly because I was constantly watching over it
- It is the problem: it works right up until it doesn't: quiet errors drop data, network connection dropped, log scrolled past. I was the only monitoring, the only alerting, and the only recovery.
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
- So that was rung 0, now we're going up one step, without rewriting anything from our ingestion script.
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
**"We take that same script — the same unit of work, unchanged — and instead of handing it to cron, we hand it to Argo Workflows."**

- Three things appear without touching the processing script: retries, a web UI, a STAC logbook.
- Under the hood Argo runs on K8s underneath. The companion repo brings a simple k8s cluster up inside Docker with one command. But you don't operate it
-->

---
layout: default
class: text-center
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# A failed run, recovered automatically

<img :src="'./ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

<div class="flex justify-center my-2">
  <img :src="'./clips/rung1-retry.gif'" class="h-80 w-auto object-contain rounded" alt="Argo UI workflow graph: ingest(0) failed (red), the automatic retry ingest(1) succeeded (green); the day is recovered, unattended" />
</div>

_ingest(0) ✗ → ingest(1) ✓ · recovered, unattended_

<div class="absolute top-1/2 right-[20%] -translate-y-1/2 z-20 text-base bg-white/80 px-3 py-1 rounded shadow-sm whitespace-nowrap"><code>make demo STAGE=01</code></div>

<LogoHorPos position="top-left" height="30px" />

<!--
**"A step fails or the network let you down, and instead of losing hours until you realise, Argo runs it again."**

- Here you can see the graph of steps in Argo based on yaml file created in the demo repo. _--Let a bit of silence for the clip to run.--_ You can see that the ingest step has two events: the first attempt fails, marked with a cross, and the second succeeds.  
- ingest(0) ✗ → ingest(1) ✓: a blip that used to silently eat a day, now recovered while you slept.
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
**"You are no longer the only one watching."**

- When retries can't fix it, there's finally a place to look: full history of every run, every step, every log line.
- Not a log file on a sleeping laptop or remote server.
- Team angle: crontab = only its author can debug it. Now a colleague opens the UI, reads the logs, understands — without touching your machine.
- Point at the red step + the log panel.
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
**"Every item we ingest is written into a catalog — a STAC catalog — you can browse."**

- One quick note on what is on screen. The companion repo I mentioned run synthetic  missions,laptop-sized data. 
- For now this catalogue feels like a record of what landed, a logbook. But in a few rungs from now, that logbook wakes up.
-->

---
layout: default
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# Two small YAML files, not a rewrite

<img :src="'./ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

```yaml
# 1) wrap your image as a workflow: ensure-collection → ingest, with retries
kind: Workflow
spec:
  templates:
    - name: ingest
      retryStrategy: {limit: "2", retryPolicy: Always}  # the new safety net
      container: {image: eo-ingest:dev, command: ["python","-m","eo_ingest.ingest"]}
# 2) put that workflow on the 3 a.m. schedule
kind: CronWorkflow
spec:
  schedule: "0 3 * * *"   # the same line your crontab had
  workflowSpec: { ... }   # the workflow above
```

Same image as rung 0, byte-for-byte. One file adds retries and the logbook; one puts it on the schedule.

<LogoHorPos position="top-left" height="30px" />

<!--
**"In this first part we moved one script from cron to something that retries it and remembers what it did.'"**

- In the companion repo that is two small YAML files: one wraps the image you already have as a workflow — make sure the catalog exists, then run the ingest with retries, and another short yaml puts that workflow on the same three a.m. schedule, creating a cronworfklow 

- Code in the container is the rung-0 code, byte-for-byte.

- Notice what we did NOT do never touched the ingest function, only what surrounds it. That's the pattern for the rest of the presentation.
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
**"Everything we have done so far protects a single run with retries, accessibility, and discovery."**

- But sooner or later, we need more that ingesting real-time data, we need to ingest historical data. 

- Backfilling is a different problem: someone needs months or years of data. Once we have a pipeline similar to rung1 stage, it is very easy to run historical backfilling pipeline in Argo workflows.

- Instead of working through the scene or days in sequence, we fan them out.
-->

---
layout: default
---

<div class="rung-kicker rung2">Rung 2 · Fan-out</div>

# Fan-out: the same step, side by side

<img :src="'./ladder-rung2.svg'" class="corner-ladder" alt="you are here: rung 2" />

<div class="grid gap-8 items-start mt-4" style="grid-template-columns: 1fr 1fr">


<div class="flex flex-col items-center gap-3">
  <img :src="'./flow-rung2.svg'" class="max-h-65 w-auto object-contain" alt="withItems fans the same step across thirty days, capped at ten in flight by the parallelism limit" />
  <div class="text-xl text-center">

Instead of one step doing 30 days in a row, ask for 30 steps at once. In Argo that's <strong><code>withItems</code></strong>, one line.

  </div>
</div>

<div class="flex flex-col items-center gap-1">
    <img :src="'./clips/rung2-fanout-still.png'" class="max-h-55 w-auto object-contain rounded shadow" alt="Argo UI showing a month of backfill fanned out in parallel" />
  <p class="text-base opacity-70 m-0"><code>make demo STAGE=02</code></p>
</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
**"For example, instead of one step working through thirty days in a row, we ask for thirty steps and run them side by side."**

- `withItems`: give Argo a list, it runs the same step once per item. One-line change.
- Same unit of work, we just asked for many at once.

- If you want to watch this happen, the rung-two stage in the demo repo runs it for you: `make demo STAGE=02`. You can see in the terminal all thirty days submitted at once and Argo working through them in waves of ten
-->

---
layout: default
class: text-center
---

<div class="rung-kicker rung2">Rung 2 · Fan-out</div>

# A month of backfill

<img :src="'./ladder-rung2.svg'" class="corner-ladder" alt="you are here: rung 2" />

<div class="flex justify-center mt-4">
  <img :src="'./clips/rung2-fanout.gif'" class="max-h-72 w-auto object-contain rounded shadow" alt="Side-by-side: left Argo UI showing 30 days fanned out in parallel (10 at a time); right STAC browser showing the MOI AV synthetic collection filling with item footprints as each day is ingested" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
**And on this next slide the are two places where you can visualise what is happening:** 

- On the left, the Argo interface showing the backfill as a single fan of parallel steps;
- On the right, the STAC catalog, now holding a full grid of thirty freshly ingested days where a moment ago there was nothing.


**"This is a rung that I felt most directly in production.""** I once had a reprocessing job I had estimated at more than thirty hours. I split it the way I just described: query once, then fan out with one item per worker; and it came in under four hours.
-->

---
layout: cover
background: /images/theme/blue-white-red-abstract-painting.jpg
dim: true
class: text-center
---

<div class="rung-kicker rung2" style="color:#6fd38c">Rung 2 · Fan-out</div>

# Fast must not mean rude

Fan-out without a cap is a denial-of-service attack with good intentions 😅. 300 parallel requests is no longer backfilling it is overwhelming the upstream services you depend on . 

`parallelism: 10` -> most of the time constrained by what the upstream service can handle



<LogoHorNegMono position="bottom-right" height="30px" />

<!--
**"But there is a caveat EO people feel instinctively: Fan-out without a cap is a denial-of-service attack with good intentions . **

- Three hundred parallel requests is no longer backfilling it is overwhelming the upstream services you depend on . 
- `parallelism: 10` can be sized to what the upstream service can handle, not our cluster.
- By doing that you tell Argo to fan out across all thirty days but never more than ten at once, and it queues the rest.
- If you run the rung2 stage in the companion repo you should find that the capped fan-out ran the backfill about six times faster than if you were processing the items sequentially. On my laptop, I got fifty seconds instead of five minutes.: ~6× faster;
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
- _SLOW DOWN_

- Notice that everything in rung two assumed we already knew which days or scene to fetch, we handed Argo the list. A question we have not asked yet is the useful one: which days are actually missing? 

- And that is where the logbook from rung one, the catalog where every ingested item was written down, is going to be maximise.
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

**Where _"should"_ comes from:** the cleanest source is an upstream **source catalog** : diff source vs target and the gaps are exact, item by item. With no upstream (e.g. the demo's case), modeling the **acquisition cadence** can be a good idea, since some gaps are genuinely _legitimate_.

<LogoHorPos position="top-left" height="30px" />

<!--
**"At rung three, the logbook wakes up. It stops being a passive record of what happened, and it starts telling you what to do next."**

- In the companion repo, we created a small function that will `find_gaps` . It will look across the window of dates we want to ingest, find the data we already have by querying STAC and anything expected but missing is a gap.

- Cheap: We are not re-downloading anything, not diffing files in a bucket; we are just asking the catalog, through a database query over metadata we already wrote down. It is  fast and exact, and scale well. The expensive part, actually fetching the data, only happens for the days that are genuinely missing.

- "What should be here" can come from two places. The best case is when there is an authoritative *source* catalog upstream, then you diff source against target, and the gaps are exact, item by item, with the real acquisition cadence already baked in; you never have to model anything. That is essentially STAC-to-STAC reconciliation, and it is how I used it in the my current project.

- When you are instead the *first* catalog for the data, as in the companion repo there is no upstream to diff against, so you have to model what should exist.
-->

---
layout: default
---

<div class="rung-kicker rung3">Rung 3 · Self-repair</div>

# Feeding the gaps back into the fan-out

<img :src="'./ladder-rung3.svg'" class="corner-ladder" alt="you are here: rung 3" />

<div class="grid gap-10 items-center mt-6" style="grid-template-columns: 4fr 3fr">

<div class="flex flex-col items-center gap-5">
  <img :src="'./flow-rung3.svg'" class="max-h-72 w-auto object-contain" alt="find_gaps subtracts the logbook's present days from the expected days and feeds only the gaps back into the fan-out" />
  <div class="text-xl text-center">

Exactly those missing days go back into rung 2's fan-out. We don't re-ingest the whole window; we re-fetch **only the gaps**.

  </div>
</div>

<div class="flex flex-col items-center gap-1">
  <img :src="'./clips/rung3-gapclose-still.png'" class="w-full object-contain rounded shadow" alt="Terminal output of make demo STAGE=03: the logbook names the missing days (2026-03-04, -05, -10) and the pipeline fills only those, nothing else" />
  <p class="text-base opacity-70 m-0"><code>make demo STAGE=03</code></p>
</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
**"And then comes the part I really like. We feed exactly those missing days back into the fan-out from rung two."** 

- We do not re-ingest the whole window, and we do not redo work that is already done; we ingest only the gaps.
-->

---
layout: cover
background: /images/theme/satellite-image-body-of-water.jpg
dim: true
class: text-center
---

<div class="rung-kicker rung3" style="color:#ffd24a">Rung 3 · Self-repair</div>

# Idempotent + self-correcting

_Idempotent: run it again with nothing missing, and nothing happens. Safe to run on a schedule forever._

A day that used to slip past unnoticed now **gets caught and refilled on the next run**.

Same processing script. The pipeline around it now tracks what landed.

<LogoHorNegMono position="bottom-right" height="30px" />

<!--
**"Two properties fall out of this, idempotent and self-correcting"**

The first, idempotent means that if you run it again when nothing is missing, it does nothing, so it is safe to run on a schedule forever.

By self-correcting, I mean that a day of data or some scene are not processed during a day for a reason or another, they do not stay missing: the next scheduled run asks the logbook what is gone, sees the hole, and fill them
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
**Rung four. The pipeline already heals itself; what it cannot yet do is show you that it did. So this last rung simply give an example of how to make the healing visible.**
-->

---
layout: center
class: text-center
---

<div class="rung-kicker rung4">Rung 4 · Observability</div>

# A gap heatmap

<div flex justify-center mt-4>
  <img :src="'./heatmap.png'" class="h-44 w-auto object-contain" alt="The gap heatmap: one cell per day per collection; filled = landed, slashed = gap" />
</div>

<div class="flex items-center justify-center gap-8 mt-6">
  <p class="text-lg m-0 max-w-xl text-left">One cell per day, per collection: filled = landed, slashed = gap, the shape carries the meaning. <strong>Built from the workflow history Argo already keeps</strong> -> no extra metrics stack to see your gaps.</p>
  <div class="flex flex-col items-center gap-1 shrink-0">
    <img :src="'./clips/rung4-report-still.png'" class="max-h-44 w-auto object-contain rounded shadow" alt="Terminal output of make demo STAGE=04: the daily gap report Argo renders from its own run history" />
    <p class="text-base opacity-70 m-0"><code>make demo STAGE=04</code></p>
  </div>
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
**"The centrepiece is a daily report, with a gap heatmap at its heart: a calendar grid, one cell per day, per collection."**

- In the companion repo I used filled cells to indicate that the day landed while slashed cells indicate gaps. In this example you see the health of the whole window, every collection side by side.

- Provenance: This is all built from the workflow history Argo already keeps, so there is no extra metrics stack in the core. In a production environment you would certainly want to wire this in Prometheus and Grafana for live dashboards, but **you do not need any of that to see your gaps** only the logbook you have had since rung one, drawn as a grid.
-->

---
layout: default
---

<div class="rung-kicker rung4">Rung 4 · Observability · in production</div>

# A real pipeline, reporting on itself

<img :src="'./ladder-rung4.svg'" class="corner-ladder" alt="you are here: rung 4" />

<div class="flex flex-row gap-6 items-start mt-4">

  <div class="text-x flex-1" style="text-align:left">

  Same Rung 4 move but on a **real multi-mission EO pipeline** and adding automation from a scheduled GitHub Action. Every morning it:
  1. scraped the new item metrics that our Argo pods were writing to S3,
  2. rendered a self-contained HTML report with Plotly charts,
  3. and packaged this report as a labelled issue in a "monitoring" repo

  </div>

  <div class="text-normal rounded-lg p-2 flex-1" style="background:#0d1117; color:#c9d1d9; border:1px solid #30363d; font-family:var(--slidev-code-font,monospace)">
    <p class="m-0 font-700 text-base">📡 Daily Metrics Report — 2026-03-06</p>
    <p class="m-0 mt-1 text-xs" style="color:#8b949e">opened by github-actions · label: <span style="background:#5a1e1e;color:#ffb4b4;border-radius:3px;padding:0 4px">daily-metrics-report</span></p>
    <p class="mt-4 mb-4 text-xs font-700" style="color:#ffb4b4">🔴 ALERT — errors or failed items detected</p>
    <div class="text-xs" style="color:#c9d1d9">
      <div class="flex flex-wrap gap-x-4 gap-y-1 leading-6">
        <span><span style="color:#8b949e">Workflows</span> 31</span>
        <span><span style="color:#8b949e">Collections</span> 4</span>
        <span><span style="color:#8b949e">Expected</span> 6,247</span>
        <span style="color:#ffa657">Failed 24 ⚠</span>
        <span style="color:#ff7b72">HTTP errors 1,308 ⚠</span>
        <span style="color:#ffa657">Retries 1,914 ⚠</span>
        <span>Downloaded 2.8 TB</span>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 leading-6 mt-4">
        <span><span style="color:#8b949e">geo-imager · IR</span> 142 err</span>
        <span><span style="color:#8b949e">geo-imager · FD</span> 487 err</span>
        <span><span style="color:#8b949e">geo-imager · HR</span> 263 err</span>
        <span><span style="color:#8b949e">polar · ocean-colour</span> 416 err</span>
      </div>
      <div class="mt-4" style="color:#8b949e">auth-svc · 09:59 UTC · HTTP 500 ×9 · 9 retries · 0 MB &nbsp;<span style="color:#58a6ff">[logs ↗]</span></div>
    </div>
  </div>

</div>
<!-- 
::right::

<div class="flex flex-col justify-center h-full gap-6 pl-4">

<div class="p-5 rounded-xl" style="background:#1e293b; color:white; border-left:4px solid #E69F00">
  <p class="text-xs font-700 uppercase tracking-wide m-0" style="color:#E69F00;">The morning it earned its keep</p>
  <p class="text-base m-0 mt-3">One report showed <strong>1,308 HTTP errors in 24 h.</strong> It didn't fix anything — it pointed me at an <strong>auth bug</strong>: every parallel pod was re-authenticating on start instead of reusing its token. One fix later: <strong>~14% → under 1%</strong> error rate.</p>
  <p class="text-sm m-0 mt-3" style="color:#94a3b8;">The report didn't heal the pipeline. It showed me <em>where</em> to.</p>
</div>

</div> -->

<LogoHorPos position="top-left" height="30px" />

<!--
**"Here is a more advanced version of the demo's heatmap gap I showed you on the precedent slide."**

- I built it mostly because I wanted to understand what was the reasons for the workflows failures I could observed and have an easy way to share these findings with the upstream data services.

- On a recent project I worked on data ingestion pipelines for multiples EO missions. Early one I encountered a lot of network issues when trying to stream the data from upstream servies so I added a lot of metrics in my processing script and wired up a scheduled GitHub Action. 
Every morning it: 
1. scraped the new item metrics that our Argo pods were writing to S3, 
2. rendered a self-contained HTML report with Plotly charts, 
3. and package this report as a labelled issue in a "monitoring" repository. 

No heavy observability stack was needed. The report came to me, with direct links to each failing pod's archived logs.


- Once it was running, it proved its value very quickly. One morning the report showed one thousand, three hundred and eight HTTP errors in twenty-four hours. That report did not fix anything by itself but it pointed me straight at the cause: a bug that had been introduce in a recent code change.
In this bug, every one of the twenty parallel pods was re-authenticating from scratch on startup, hammering the upstream authentication service, instead of reusing a valid token. One
fix later, the error rate went from around fourteen percent to under one percent.

This report did not heal the pipeline. It showed me exactly where to look to fix it.

> _(beat)_ That is the thing about observability: it is not decoration. You build it before you need it —
> and when something breaks in a way retries cannot catch, there is already a place to look.
-->

---
layout: image-right
image: /images/theme/sentinel2a-southern-tibetan-plateau.jpg
---

# That's the whole ladder

The same ingest step at every rung. What grew was how much the pipeline heals on its own.

There are two distinct levels of that healing, and it is worth separating them out.


| Level | Failure | Who fixes it | Rung |
|-------|---------|--------------|------|
| **Item** | a run fails transiently | Argo **retries** it, automatically | 1 |
| **System** | a whole day never landed | the logbook **detects + refills**; the report **surfaces** it | 3 + 4 |


<LogoHorPos position="top-left" height="30px" />

<!--
**"So: that is the whole ladder. The same unit of work, unchanged, at every rung. What grew was how much the pipeline heals on its own."**

**"What we have built in term of self-healing is really two different things, and I think they are worth distinguishing."**

- Item-level (rung 1): a run fails transiently → Argo retries → nobody involved. Machine fixes alone.
- System-level (rungs 3+4): a whole day never landed → logbook detects + refills → report surfaces the pattern → human steps in.
-->

---
layout: two-cols
---

# The same patterns, at production scale

<div class="text-xl mt-6">

The exact same patterns: Argo orchestrating an ingest function, a STAC catalog as the logbook, but deployed at Copernicus scale.

<div flex items-center gap-3 my-2>
  <img :src="'./eopf-explorer-logo.png'" class="h-10" alt="EOPF Explorer logo" />
  <strong><a href="https://explorer.eopf.copernicus.eu/">explorer.eopf.copernicus.eu</a></strong>
</div>

_Ingestion feeds a catalog; the visualisation and analysis layers come next : and the same orchestration moves wrap those steps too._

</div>

::right::

<div h-full flex items-center justify-center pr-2>
  <img :src="'./eopf-sentinel-explorer.png'" class="w-full object-contain rounded shadow-lg" alt="EOPF Sentinel Explorer STAC API: Sentinel-2 Level-2A collection page showing items grid" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
**"The demos run synthetic missions. For real satellite data you can visit the EOPF Copernicus Explorer website."**

- Same patterns: Argo orchestrating an ingest function, STAC catalog as the logbook, at Copernicus scale.
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
**"And if you want to go hands-on with exactly this ecosystem, two workshops at this conference dive right into it."**

- Thursday 2 Jul · 9:00 · Room A13: eoAPI + STAC for Earth Data at Scale (Felix Delattre).
- Friday 3 Jul · 9:00 · Room 059: EOPF Zarr Explorer — GeoZarr, TiTiler (Ahmed Behairi, EOX).
- Say room and day clearly — people will want to add it to their schedule.
-->

---
layout: image-right
image: /images/theme/landsat8-klyuchevskaya-kamchatka.jpg
---

# Questions?

_Give it a try:_

<div flex items-center gap-6 mt-4>
  <img :src="'/repo-qr.png'" class="h-34 w-auto shrink-0" alt="QR code linking to the talk's GitHub repository" />
  <div flex items-center gap-2>
    <GitHubIcon size="18" />
    <span class="text-base font-600"><a href="https://github.com/lhoupert/argo-stac-eo-pipeline">github.com/lhoupert/argo-stac-eo-pipeline</a> </span>
  </div>
</div>

<LogoHorPos position="top-left" height="30px" />

And run 
`make up && make demo STAGE=01` 

-> you will get the whole ladder running on your laptop or through a _`.devcontainer`_

<!--
Any questions? 

As I mentioned several time in this talk, **you can find everything I have shown in the companion repository below.**
-->

---
layout: default
---

# Why Argo, and the related projects

The ladder is **orchestrator-agnostic**: Airflow or Prefect could climb it too. Argo buys K8s-native
**container-per-step**, first-class **fan-out**, no separate scheduler DB.

**Related projects:**

- **cirrus-geo** — AWS-native STAC pipeline framework (serverless orchestration on Lambda/Batch).
- **stactools / stac-task** — item builders: turn raw assets into well-formed STAC items.
- **VEDA** — NASA's open EO data platform for science and analysis at scale.
- **openEO** — standard API for EO _processing_ across back-ends (the compute side, not ingestion).

<LogoHorPos position="top-left" height="30px" />

<!--
- Ladder is orchestrator-agnostic; Argo wins: container-per-step isolation, first-class fan-out (`withItems`), no separate scheduler DB.
- Neighbours: cirrus-geo (AWS-native), stactools / stac-task (item builders), VEDA (NASA), openEO (processing).
- Close: none of these pieces are new — the contribution is a path a solo researcher can actually walk.
-->
