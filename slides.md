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
      <p class="text-xs font-700 uppercase tracking-wide m-0" style="color:var(--slidev-theme-primary)">Follow along — the companion repo</p>
      <p class="text-xl font-700 m-0 mt-1">github.com/lhoupert/argo-stac-eo-pipeline</p>
      <p class="text-sm m-0 mt-1" style="color:#565b65">Every rung runs on your laptop with Docker — <code>make up && make demo STAGE=01</code></p>
    </div>
  </div>
</div>

<LogoHorPos position="top-left" height="30px" />

<style>
.slidev-layout.default.promises-slide { justify-content: flex-start; }
</style>

<!--
- Promise 1, permission to relax: "if you've been told doing-it-properly means learn K8s first, that
  wall is what this ladder gets you over, one rung at a time."
- Promise 2, saves a Q&A tangent: "when I say Argo today, I mean Workflows."
- The honesty beat (and the best evidence for the talk): "I'm not an Argo veteran; I climbed this ladder
  myself, this year. The next rung being an afternoon away is a recent memory, not a pitch."
- The repo banner is a soft early plant: "everything I show is one repo you can clone — QR's here, and
  it's on the closing slide too if you want to grab it then." Don't dwell; it reassures the doers.
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
- Payoff of the hook (your own memory, the paper's numbers): during the PhD you built a consolidated
  database for your first paper — 13 separate databases, ~140k ocean profiles (from ~190k), 44 years —
  all stitched together by hand with cron + MATLAB. It worked only because you were watching it.
- It works most of the time, and then quietly stops. Quiet errors drop data unnoticed; the laptop slept,
  the wifi dropped, the log scrolled past. You're the only one watching, and you were asleep.
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
layout: default
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# Two small YAML files — not a rewrite

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
- Two files, not one: the Workflow wraps the image with retries and ensures the collection exists for
  the logbook; the CronWorkflow just puts that workflow on the 3 a.m. schedule.
- The code in the container is the rung-0 code, byte-for-byte; the repo's tests enforce that.
- "I moved one script from cron to something that retries it and remembers what it did." That's it.
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

<div class="flex flex-col items-center gap-1">
  <img :src="'./clips/rung2-fanout-still.png'" class="max-h-85 w-auto object-contain rounded shadow" alt="Argo UI showing a month of backfill fanned out in parallel" />
  <p class="text-base opacity-70 m-0"><code>make demo STAGE=02</code></p>
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
- The rung you felt most directly in production: a reprocessing job you'd *estimated* at more than 30h
  (say "estimated"), split the way just described — query once, then fan out one item per worker — came
  in under 4h. Keep this number apart from the demo's ~6× (50 s vs 311 s); don't merge the two.
-->

---
layout: cover
background: /images/theme/blue-white-red-abstract-painting.jpg
dim: true
class: text-center
---

<div class="rung-kicker rung2" style="color:#6fd38c">Rung 2 · Fan-out</div>

# Fast must not mean rude

Running the days in parallel is what makes it faster — about 6× in the demo (50 s vs 311 s). 
The **`parallelism: 10`** cap is what keeps it responsible: sized to what the upstream service can handle, not to what our cluster could throw at it.

<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Uncapped fan-out can overwhelm the upstream even with good intentions: three hundred parallel
  requests is more than the thing you depend on can take. The cap is just being considerate.
- Why parallel helps at all on one laptop: ingestion is mostly *waiting* on the network and object
  store. While one day waits for a response, another runs — that is where the time saving comes from.
  (cut2: drop this 'why it works' aside if running long; keep the number and the cap.)
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

**Where _"should"_ comes from:** the cleanest source is an upstream **source catalog** : diff source vs target and the gaps are exact, item by item. With no upstream (e.g. the demo's case), modeling the **acquisition cadence** can be a good idea, since some gaps are genuinely _legitimate_.

<LogoHorPos position="top-left" height="30px" />

<!--
- Notice how cheap the question is: a metadata query over what we already wrote down, with no
  re-downloading and no diffing buckets. The expensive thing only happens for days actually missing.
- Two sources of truth for "should", same algorithm: (1) best case — an upstream source catalog you
  diff against (exact, item-level, real cadence baked in; STAC-to-STAC reconciliation, e.g. a real
  Sentinel/EOPF mirror); (2) when you ARE the first catalog (the demo), model acquisition cadence.
- Cadence caveat, before the STAC-literate raise it: real missions don't image every place daily;
  revisit cycles and clouds make some gaps legitimate — so model cadence, not the calendar. The demo
  uses daily cadence so the idea stays visible. Algorithm identical: expected − present = fetch.
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
- The lovely part: exactly those missing days go back into rung 2's fan-out. No re-ingesting the window,
  no redoing finished work, only the gaps.
- The terminal still on the right is the demo repo's own output (`make demo STAGE=03`): the catalog has
  holes, find_gaps names them, the pipeline fills precisely those days and nothing else.
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
- Why this is the rung you love most: you used to track ingestion with "done" marker files in storage —
  and they lied (a marker only says a process *thought* it finished). You tore them out and asked the
  catalog directly: is the item there? Answerable from any machine, any time, no shared state. You'd done
  exactly this at sea — the glider archive used the catalog as the record, no markers. Same idea ~15 years
  and a career apart; that's the moment you stopped feeling like a beginner. The intelligence isn't in the
  fetch code (still the rung-0 one) — it's in the catalog knowing what it ought to contain.
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
- One glance: the health of the whole window, every collection side by side. Filled cell = landed;
  slashed cell = gap. The shape carries it too, so it reads even without colour. (The still shows the
  seeded demo window; the live report scales the same grid wider; don't claim "months" over a two-week still.)
- Provenance, said once: this is rendered from the workflow history Argo already keeps — no Prometheus
  in core. Grafana / coverage maps are the prod profile; you don't need them to SEE your gaps. The
  ladder keeps going past here, but the shape is set: same unit of work, more capability around it.
- The small terminal thumbnail (labelled `make demo STAGE=04`) is just the demo-repo anchor: "the
  pretty grid is rendered straight from that command's output." Point at it once; don't read it.
-->

---
layout: two-cols
---

<div class="rung-kicker rung4">Rung 4 · Observability · in production</div>

# A real pipeline, reporting on itself

<img :src="'./ladder-rung4.svg'" class="corner-ladder" alt="you are here: rung 4" />

<div class="text-sm rounded-lg p-4 mt-4" style="background:#0d1117; color:#c9d1d9; border:1px solid #30363d; font-family:var(--slidev-code-font,monospace)">
  <p class="m-0 font-700 text-base">📡 Daily Metrics Report — 2026-03-06</p>
  <p class="m-0 text-xs" style="color:#8b949e">opened by github-actions · label: <span style="background:#5a1e1e;color:#ffb4b4;border-radius:3px;padding:0 4px">daily-metrics-report</span></p>
  <p class="mt-2 mb-3 text-xs font-700" style="color:#ffb4b4">🔴 ALERT — errors or failed items detected</p>
  <div class="text-xs leading-5" style="color:#c9d1d9">
    <span style="color:#8b949e">Workflows</span> 31 &nbsp;·&nbsp; <span style="color:#8b949e">Collections</span> 4 &nbsp;·&nbsp; <span style="color:#8b949e">Expected</span> 6,247 &nbsp;·&nbsp; <span style="color:#ffa657">Failed 24 ⚠</span> &nbsp;·&nbsp; <span style="color:#ff7b72">HTTP errors 1,308 ⚠</span> &nbsp;·&nbsp; <span style="color:#ffa657">Retries 1,914 ⚠</span> &nbsp;·&nbsp; Downloaded 2.8 TB<br/>
    <div class="mt-1"><span style="color:#8b949e">geo-imager · IR</span> 142 err &nbsp;·&nbsp; <span style="color:#8b949e">geo-imager · FD</span> 487 err &nbsp;·&nbsp; <span style="color:#8b949e">geo-imager · HR</span> 263 err &nbsp;·&nbsp; <span style="color:#8b949e">polar · ocean-colour</span> 416 err</div>
    <div class="mt-1" style="color:#8b949e">auth-svc · 09:59 UTC · HTTP 500 ×9 · 9 retries · 0 MB &nbsp;<span style="color:#58a6ff">[logs ↗]</span></div>
  </div>
</div>

::right::

<div class="flex flex-col justify-center h-full gap-6 pl-4">

<div class="text-xl">

Same Rung 4 move, on a **real multi-mission EO pipeline**: built from the **metrics the Argo workflows already write to S3** — the production version of the demo's gap report.

</div>

<div class="p-5 rounded-xl" style="background:#1e293b; color:white; border-left:4px solid #E69F00">
  <p class="text-xs font-700 uppercase tracking-wide m-0" style="color:#E69F00;">The morning it earned its keep</p>
  <p class="text-base m-0 mt-3">One report showed <strong>1,308 HTTP errors in 24 h.</strong> It didn't fix anything — it pointed me at an <strong>auth bug</strong>: every parallel pod was re-authenticating on start instead of reusing its token. One fix later: <strong>~14% → under 1%</strong> error rate.</p>
  <p class="text-sm m-0 mt-3" style="color:#94a3b8;">The report didn't heal the pipeline. It showed me <em>where</em> to.</p>
</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- This is the production version of the heatmap pattern: same provenance ("built from the workflow
  history the Argo pods already write, just to S3 instead of the Argo UI"), but on a real multi-collection
  EO ingest pipeline (geostationary imagers + a polar ocean-colour mission). Don't name the operator/project.
- How it worked: a GitHub Action ran on a daily cron, scraped the per-item metrics each Argo pod had
  written to S3, rendered a self-contained HTML/Plotly report, and opened it as a labelled issue —
  no dashboard to log into, the report came to you. Same ladder; much larger world.
- The payoff story (the numbers are safe to quote — W9 `2026-W9.md`):
  "One morning it showed 1,308 HTTP errors in 24 hours. That number pointed me straight at the
  cause: every one of the twenty parallel pods was re-authenticating from scratch instead of reusing
  a valid token. One fix later, the error rate went from around 14% to under 1%."
- CAUTION — the causal chain: report *surfaced* → found auth bug → fixed → 14%→<1%.
  NEVER say "the report fixed it" or "the report dropped the error rate." The auth fix was decisive.
- This bridges synthetic→real without duplicating the EOPF production reveal in §7 — that one is
  about satellite-data catalog scale; this one is about operational monitoring. Different angle.
- Keep past tense: the daily schedule is now on-demand (the need passed). "It ran every morning on
  a schedule" — not "it posts every morning."
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

`make up && make demo STAGE=01` ->  the whole ladder, on your laptop, with Docker.

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
