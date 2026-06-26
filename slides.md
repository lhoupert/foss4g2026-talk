---
theme: ./theme
title: From Cron Job to Self-Healing Pipeline
info: |
  FOSS4G Europe 2026. A maturity ladder for Earth-observation ingestion.
  Talk by Loïc Houpert (Development Seed).
  Companion repo: github.com/lhoupert/argo-stac-eo-pipeline
highlighter: shiki
mdc: true
favicon: /meta/favicon.png
addons:
  - slidev-addon-qrcode
layout: title
image: /images/theme/landsat9-kangerdlugssuaq-greenland.jpg
---

# From Cron Job to Self-Healing Pipeline

::subtitle::
A maturity ladder for Earth-observation ingestion, one I climbed twice

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
- The pivot: moved into cloud engineering, curious about the systems behind the data. Credibility woven
  in. New to Argo specifically: "What is Argo Workflows?" to a working pipeline in five days; only the
  tool was new (you'd built pipelines for years).
- Land the thesis: the distance between a script on your laptop and a pipeline you can trust, and how
  you close it, one step at a time.
-->

---
layout: center
class: text-center
---

# A five-rung ladder

<div flex justify-center my-2>
  <img :src="'/ladder.svg'" class="h-100 w-auto object-contain" alt="The maturity ladder, rungs 0 to 4" />
</div>

Five rungs, from a laptop cron job at the bottom to a pipeline that fills its own gaps at the top.

<LogoHorPos position="top-left" height="30px" />

<!--
- THE slide, the one they photograph. Stop talking for a second; let it land.
- Five rungs: laptop cron at the bottom, a pipeline that fills its own gaps at the top.
- It's diagnostic: you can place your own work on it, and the question is just which rung you're on
  and what the next one is.
- The heart, first telling: the unit of work never changes; only the ladder around it grows.
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

<img :src="'/ladder-rung0.svg'" class="mini-ladder" alt="you are here: rung 0 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Keep it warm: this is us. "I've shipped this, more than once."
-->

---
layout: default
---

<div class="rung-kicker rung0">Rung 0 · Cron</div>

# Where I started

<img :src="'/ladder-rung0.svg'" class="corner-ladder" alt="you are here: rung 0" />

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

<img :src="'/ladder-rung1.svg'" class="mini-ladder" alt="you are here: rung 1 of the maturity ladder" />
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
  <img :src="'/flow-rung1.svg'" class="max-h-90 w-auto object-contain" alt="The unchanged ingest unit of work, wrapped by an Argo CronWorkflow that adds retries, a web UI, and a STAC logbook" />
</div>

<div class="text-xl">

The ingest function is **unchanged**; Argo wraps it with **retries**, a **web UI**, and a **STAC logbook**.

</div>

</div>

<img :src="'/ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />
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

<img :src="'/ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

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
- The reassurance beat (panel review: this is the slide a rung-0 listener screenshots). Point at the
  schedule line ("that's your crontab") and the image line ("that's the script you already have").
- There's no Kubernetes on screen, just a schedule and an image, and that's the whole on-ramp.
-->

---
layout: default
class: text-center
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# Retries: a 3 a.m. blip, recovered

<img :src="'/ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

<div flex justify-center my-2>
  <img :src="'/clips/rung1-retry.gif'" class="h-80 w-auto object-contain rounded" alt="Argo UI workflow graph: ingest(0) failed (red), the automatic retry ingest(1) succeeded (green); the day is recovered, unattended" />
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
  <img :src="'/argo-ui-still.png'" class="max-h-100 w-auto object-contain rounded shadow-lg" alt="The Argo Workflows web UI: a workflow step graph with the failed step marked red and logs one click away" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The team angle: with a laptop crontab only its author can debug it. Now a colleague can open the UI,
  see the failed step, read the logs, and understand what happened, without touching your machine.
- Point at the red step + the log panel so anyone who's never opened it knows what "a place to look" means.
-->

---
layout: default
---

<div class="rung-kicker rung1">Rung 1 · Retries + logbook</div>

# Every item lands in a **STAC logbook** you can browse

<img :src="'/ladder-rung1.svg'" class="corner-ladder" alt="you are here: rung 1" />

<div class="grid gap-10 items-center mt-6" style="grid-template-columns: 2fr 3fr">

<div class="text-xl">

A queryable catalog of everything that landed: the collections and their temporal extents.

_(Hold that thought.)_ In a few rungs this logbook wakes up and starts deciding what to fetch.

</div>

<div flex justify-center>
  <img :src="'/stac-logbook-tight.png'" class="w-full object-contain rounded shadow-lg" alt="stac-browser showing the ingested collections and their temporal extents; the catalog as a queryable logbook" />
</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- Today it just feels like a record of what landed. In a few rungs this logbook wakes up.
- Zero extra lines for all three: retries, the UI, the logbook. The ingest code in the container is
  byte-for-byte the cron one, enforced by the repo's tests.
-->

---
layout: cover
background: /images/theme/landsat8-ord-river-australia.jpg
dim: true
---

# Rung 2
## Three years, not just last night

<img :src="'/ladder-rung2.svg'" class="mini-ladder" alt="you are here: rung 2 of the maturity ladder" />
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

<img :src="'/ladder-rung2.svg'" class="corner-ladder" alt="you are here: rung 2" />

<div class="grid gap-10 items-center mt-6" style="grid-template-columns: 3fr 2fr">

<div flex justify-center>
  <img :src="'/flow-rung2.svg'" class="max-h-90 w-auto object-contain" alt="withItems fans the same step across thirty days, capped at ten in flight by the parallelism limit" />
</div>

<div class="text-xl">

Instead of one step doing 30 days in a row, ask for 30 steps at once. In Argo that's **`withItems`**, one line.

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

# A month of backfill, politely

<img :src="'/ladder-rung2.svg'" class="corner-ladder" alt="you are here: rung 2" />

<div flex justify-center my-2>
  <img :src="'/clips/rung2-fanout-still.png'" class="max-h-85 w-auto object-contain rounded shadow" alt="A month of backfill fanned out in parallel, never more than ten ingests running at once" />
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

<img :src="'/ladder-rung3.svg'" class="mini-ladder" alt="you are here: rung 3 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- The heart of the talk. Slow right down here and let it be still. It stops being a record of what
  happened and starts telling you what to do next.
-->

---
layout: default
---

<div class="rung-kicker rung3">Rung 3 · Self-repair</div>

# What should be here − what is here = what to fetch

<img :src="'/ladder-rung3.svg'" class="corner-ladder" alt="you are here: rung 3" />

```python
def find_gaps(config, collection, start, end):
    present = {day(f) for f in query(collection, start, end)}  # what the logbook HAS
    return [d for d in window(start, end) if d not in present] # what it's MISSING
```

_(Trimmed; the full, adversarial-tested version is in the repo.)_

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

<img :src="'/ladder-rung3.svg'" class="corner-ladder" alt="you are here: rung 3" />

<div class="grid gap-10 items-center mt-6" style="grid-template-columns: 3fr 2fr">

<div flex justify-center>
  <img :src="'/flow-rung3.svg'" class="max-h-90 w-auto object-contain" alt="find_gaps subtracts the logbook's present days from the expected days and feeds only the gaps back into the fan-out" />
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

<img :src="'/ladder-rung3.svg'" class="corner-ladder" alt="you are here: rung 3" />

<div flex justify-center my-2>
  <img :src="'/clips/rung3-gapclose-still.png'" class="max-h-85 w-auto object-contain rounded shadow" alt="The logbook names the missing days (2026-03-04, -05, -10) and the pipeline fills only those, nothing else" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The clip: the catalog has holes, find_gaps finds them, the pipeline fills precisely those days and
  nothing else. Let it land; this is the quiet "oh".
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

**The unit of work never changed. Now it remembers what it has already done.**

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

<img :src="'/ladder-rung4.svg'" class="mini-ladder" alt="you are here: rung 4 of the maturity ladder" />
<LogoHorNegMono position="bottom-right" height="30px" />

<!--
- Brisk now; the hard conceptual work is behind us. "And it keeps climbing."
-->

---
layout: center
class: text-center
---

<div class="rung-kicker rung4">Rung 4 · Observability</div>

# The gap heatmap

<div flex justify-center my-2>
  <img :src="'/heatmap.png'" class="h-90 w-auto object-contain" alt="The gap heatmap: one cell per day per collection; filled = landed, slashed = gap" />
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

<img :src="'/ladder-rung4.svg'" class="corner-ladder" alt="you are here: rung 4" />

<div flex justify-center my-2>
  <img :src="'/clips/rung4-report-still.png'" class="max-h-85 w-auto object-contain rounded shadow" alt="The daily report: a colour-blind-safe gap grid plus a retry summary, built from Argo's own history" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The live version: daily report from the Argo Workflows API, with no Prometheus in core. Grafana /
  coverage maps are the prod profile; you don't need them to SEE your gaps.
- The ladder keeps going past here (prod deployments, real tiling), but the shape is set: same unit of
  work, more capability around it.
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
-->

---
layout: center
class: text-center
---

# Which rung are you on?

<div flex justify-center my-2>
  <img :src="'/ladder.svg'" class="h-100 w-auto object-contain" alt="The maturity ladder again: which rung are you on?" />
</div>

The next rung is usually about an **afternoon** away. For most people it isn't a rewrite, and it doesn't mean learning Kubernetes.

<LogoHorPos position="top-left" height="30px" />

<!--
- §6: frame it as something you noticed, not a rule you're handing down. The ladder is diagnostic, and
  you can place your own work on it. When you place your own past work on it, most of it sat at rung 0
  or 1; that's where you started.
- The encouraging part: the next rung is usually about an afternoon away; for most people it isn't a
  rewrite or learning K8s.
- Through-line, third telling: the unit of work never changes; only the ladder around it grows.
-->

---
layout: default
---

# The same pipeline, on real **Sentinel-2**

<div class="grid gap-10 items-center mt-6" style="grid-template-columns: 2fr 3fr">

<div class="text-xl">

Same frozen ingest, pointed at Earth Search. Production is a profile: **`make up PROFILE=prod`**.

_This gets data **ready for** analysis; the science (cloud-mask, indices) starts where ingestion leaves off._

</div>

<div flex justify-center>
  <img :src="'/sentinel2-still.png'" class="w-full object-contain rounded shadow-lg" alt="A real Sentinel-2 STAC record open in stac-browser: the granule's footprint drawn on the map" />
</div>

</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- The credibility moment: a real catalog record, the granule's true footprint on the map (it's a STAC
  record, not a rendered scene; say it that way). Same ladder, real Copernicus data ("contains modified
  Copernicus Sentinel data").
- The honest scope line (panel review / SPEC §ingestion-vs-ARD): pre-empts "you stopped before the hard
  part." Ingestion ends, ARD begins, and the same orchestration moves wrap those steps too.
-->

---
layout: default
---

# Why Argo, and the neighbours

The ladder is **orchestrator-agnostic**: Airflow or Prefect could climb it too. Argo buys K8s-native
**container-per-step**, first-class **fan-out**, no separate scheduler DB.

**Neighbours:** cirrus-geo · stactools / stac-task · VEDA · openEO _(processing side)_

<div mt-10 p-5 rounded bg-primary text-center>
  <p text-2xl font-500 m-0 text-white>None of these pieces are new. The contribution is <strong>a ladder you can climb</strong>.</p>
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- Say the THESIS line out loud (~12s, panel review): none of these pieces are new; the contribution is
  a *climbable path* a solo researcher can walk. It's the strongest skeptic-disarmer in the deck.
- The orchestrator/neighbours DETAIL stays silent by default (cut3); it's Q&A insurance for "why not
  Airflow?"; narrate the detail only if ahead of time.
-->

---
layout: center
class: text-center
---

# Clone & run tonight

<div flex justify-center my-3>
  <img :src="'/repo-qr.png'" class="h-60" alt="QR code linking to the talk's GitHub repository" />
</div>

**github.com/lhoupert/argo-stac-eo-pipeline**

`make up && make demo STAGE=01` runs the whole ladder, on your laptop, with Docker.

<LogoHorPos position="top-left" height="30px" />

<!--
- "Have a look at where your own work sits, and maybe climb one rung. The repo's right there, and I'd genuinely love your questions."
-->

---
layout: two-cols
---

# Questions?

_one rung at a time_

**github.com/lhoupert/argo-stac-eo-pipeline**

<div mt-6>
  <img :src="'/repo-qr.png'" class="h-44" alt="QR code linking to the talk's GitHub repository" />
</div>

::right::

<div h-full flex items-center justify-center pr-2>
  <img :src="'/clips/recap.gif'" class="max-h-90 w-auto object-contain" alt="Recap animation: the five-rung ladder highlighting rung 0 up through rung 4 in turn" />
</div>

<LogoHorPos position="top-left" height="30px" />

<!--
- Leave this up for Q&A (~3.5 min). Repo open in a backup tab; never depend on a live cluster.
- Pause before answering; repeat the question back so the room hears it (and you get a beat).
- Production-scale Argo questions: you positioned as a recent climber: "I've run this at laptop scale;
  the prod profile is where I'd start; no war stories at volume." Don't bluff depth.
- Other likely ones: ingestion vs ARD boundary; how the synthetic world maps to real missions;
  cost/ops of running Argo.
-->
