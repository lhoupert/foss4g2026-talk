# Talk script — "From Cron Job to Self-Healing Pipeline"

**FOSS4G Europe 2026 · 30-minute slot (≈26½ min content + ~3½ min live Q&A).**

This is the **single source** for the spoken talk track. The deck's presenter notes (`talk.md`) are
condensed cue cards derived from *this* file — don't let the two diverge.

**How to read this file.** Every line in a `>` blockquote is the **spoken track** — drafted prose,
in plain language, in a calm first-person voice you can make your own. Everything else — the `##`
headings with `(m:ss–m:ss)` markers, the _italic director notes_, the cut-list — is for you, not the
audience. The blockquote word-count is what the contract test bands against the time budget; the
**real gate is a timed read-through** (plan §Verification): aim to land the content at **≈26:30**,
leaving ~3½ min for Q&A. If you run long, work the **cut-list** at the bottom in order.

The through-line, said three times (open, middle, close): **"the unit of work never changes; only
the ladder around it grows."** If the audience leaves able to draw the ladder and place their own
pipeline on it — knowing the next rung — the talk worked.

**Voice note (2026-06-22):** this draft is in Loïc's own register — earnest and explanatory rather
than punchy; flowing sentences over dramatic fragments; gentle hedges ("a bit", "I think",
"genuinely") kept; jargon introduced plainly; edgy/colloquial metaphors avoided. See the
`user-writing-style` memory.

---

## 1. Opening hook — my own story (0:00–2:00)

_Rung colour: none yet (neutral title). Open purely on your own story — plainly, the way you'd write it,
not a performance. No shared-pain device, no dramatized 3 a.m. scene, no invented incident; the fragility
comes through honestly from your own oceanography years. This now also does the job of the old "who's
telling you this" slide (folded in here), and the recent-Argo credibility is woven in — guardrail: new to
**Argo specifically**, not to engineering ("only the tool was new"). The RabbitMQ story stays in Q&A only.
Save the paper's numbers (13 dbs, 140,083 profiles) for the §4a Rung-0 reveal. Cards in `anecdote-cheatsheet.md`._

> My path into Earth observation has been a bit unusual. I started as a physical oceanographer, and I
> spent years turning measurements collected at sea into research datasets. I built them the fragile way —
> scripts on a schedule, held together by hand with cron and MATLAB. They worked, but only because I was
> the one watching them.

> A few years ago I moved into cloud engineering, curious about the systems behind the data. And what
> surprised me was how approachable the modern tooling is: earlier this year I went from "What is Argo
> Workflows?" to a working pipeline in five days!

> So that is what this talk is about: the distance between a script on your laptop and a pipeline you can
> trust — and how you close it, one step at a time.

---

## 2. Reframe → the thesis slide (2:00–4:00)

_Rung colour: the full ladder, all five rungs. **This is the slide worth pausing on** — it's the one
people tend to photograph, so give it a quiet moment and stop talking for a second. The ladder is the
takeaway; everything else serves it._

> The way I came to think about that distance is as a ladder. Five rungs. At the bottom, rung zero: a
> script on a laptop, fingers crossed — where I started. At the top, a pipeline that notices its own gaps
> and fills them before you wake up. Each rung between is one concrete, affordable step.

> What I like about seeing it this way is that nothing gets thrown away as you climb. The unit of work
> never changes; only the ladder around it grows — the little function that fetches one day of data is the
> same at the bottom and at the top.

> And it is not really a question of whether you have a pipeline — everyone has one, somewhere on here. It
> is just which rung, and what the next one is.

---

## 3. Two promises before we start (4:00–5:30)

_Rung colour: neutral. This beat is permission to relax — both for the room and, honestly, for you.
An EO audience that's been told Kubernetes is somebody else's job will exhale here. Say it once,
plainly, and move on._

> Before we start, two quick promises: 

> First: you do not need to know Kubernetes to follow this talk — not a word of it. The first rung does
> not even touch a cluster; it is one line in a crontab. To run the companion repository later you need
> Docker, and that is all. If you have ever been told that doing this properly means learning Kubernetes
> first, that wall is exactly what this talk is built to get you over.

> Second, and this saves us a tangent: when I say Argo, I mean Argo Workflows — an engine that runs steps
> in order and retries them. Not Argo CD, the GitOps tool; same logo family, different job. When I say
> "Argo" today, I mean Workflows.

> That is the bracing out of the way. Let's climb.

---

## 4a. Rung 0 — the *actual* cron job (5:30–6:30)

_Rung colour: blue (rung 0). The crontab line is on the slide. Tone: affectionate, not mocking — this
is us, including you, so let it feel like recognition rather than a roast. This is the **payoff of the
hook**: the ocean-data gap reveals its real numbers here (Houpert et al. 2015): 13 databases,
190k→140,083 profiles, 44 years. "cron + MATLAB / by hand" is your own memory, not a claim from the paper._

> Rung zero is the honest baseline: one line in a laptop crontab. At three in the morning, run the ingest
> script and append the output to a log file. No Kubernetes, no catalog, no interface — just that. I have
> shipped exactly this more than once, and I suspect most of us have.

> During my PhD, I built a consolidated database for the first scientific article I authored. I had to ingest data
> from thirteen separate databases, around 2 hundred thousands ocean profiles, across forty-four years of
> measurements — all stitched together by hand, with cron jobs and MATLAB. The scientific analysis of these data 
> became a my first scientific paper. But building this condolidated database took me a lot of time and effort
> it only worked because I was the one watching over it.

> Because here is the catch: it works, right up until it doesn't. Did it run last night? I couldn't tell
> you without opening the log. Did it fail? Often I couldn't tell at all — a blip would lose a day quietly,
> and by the time I thought to check, the log had scrolled past it. The laptop had been asleep, or the wifi
> had dropped, and the only monitoring was me — and I was asleep.

> So keep that crontab line in mind, because we are not going to throw it away. The next rung wraps this
> exact script — and finally gives you somewhere to look.

---

## 4b. Rung 1 — Argo CronWorkflow: retries + a logbook (6:30–11:00)

_Rung colour: sky-blue (rung 1). **Clip: `rung1-retry`** — the **Argo UI workflow graph** (recorded
via `playwright/argo-clip-rung1.mjs`): `ingest(0)` red ✖ → its automatic retry `ingest(1)` green ✔,
with labelled callouts. The graph teaches the model (steps as nodes, a failed one, a retry) better
than a terminal table; this is the **teaching clip** — let it land in silence first. Two **example
stills** also ride this beat for anyone who's never opened these tools: the **Argo UI** (on "a place
to look" — the red failed step + the log panel) and **stac-browser** (on the logbook line — the
collection list / item metadata). Both via `make stills`; the stac-browser one shows metadata +
footprint, not thumbnails (FU-2)._

> Rung one. We take that same script — the same unit of work, unchanged — and hand it to Argo Workflows
> instead of cron. Same code, same job; what changes is everything around it. Three things show up the
> moment you do, and you write no extra lines to get them.

> One quick note on what is on screen. The demos run in a tiny synthetic world — made-up missions,
> laptop-sized data — so every clip is reproducible on your own machine. Real satellite data shows up at
> the end, I promise.

> First, retries. A step fails — the API hiccupped — and instead of losing the day, Argo runs it again.
> In the clip, the first attempt fails, marked with a cross, and the second succeeds. A three a.m. blip
> that used to silently eat a whole day becomes a day that recovered while you slept. The first time I saw
> that in my own logs, it changed how I felt about going to bed.

> Second, you are no longer the only one watching. There is a web interface now, with a full history of
> every run, every step, every log line. When something breaks in a way retries cannot fix, there is
> finally a place to look — not a log file on a sleeping laptop. I think this matters most for a team:
> with a laptop crontab, only the person who wrote it can debug it; now a colleague can open the
> interface, see the failed step in red, read the logs, and understand — without touching your machine.

> And it is not theoretical for me. On one of our platforms, moving exactly this kind of job onto a
> two-hour Argo schedule removed two to four hours a week I had spent babysitting batch runs by hand. Same
> script; I just wrapped a schedule around it.

> Third, and this matters more than it sounds: every item we ingest is written into a catalog — a STAC
> catalog — you can browse. For now it feels like a record of what landed, a logbook. Hold onto that
> word: a few rungs from now, that logbook wakes up.

> It is worth being plain about this jump, because it is smaller than it sounds. Rung zero to rung one is
> not "I learned Kubernetes." It is "I moved one script from cron to something that retries it and
> remembers what it did." That is an afternoon's work: you write a small YAML file — run this container,
> on this schedule — point it at the image you already have, and Argo does the rest. The code in that
> container is byte-for-byte the code you ran under cron, and the repository's tests enforce that, so
> nobody can quietly "improve" it between rungs and lose the point.

> And in the interest of honesty, before anyone asks: yes, Argo does run on a Kubernetes cluster
> underneath. But the repository brings one up inside Docker with a single command — you use it, you do
> not operate it. So the promise holds: this rung does not mean learning Kubernetes.

> _(beat — let the clip finish its loop)_ And notice what we did not do. We never touched the ingest
> function itself; we only changed what surrounds it. That is the pattern for the rest of the climb.

---

## 4c. Rung 2 — fan-out backfill, politely (11:00–14:30)

_Rung colour: green (rung 2). **Clip: `rung2-fanout`** — the burst of parallel pods. Expand "fan-out"
on first use. The feeling here is capability, but the honest, capped kind — not a flex. **Two numbers,
kept apart on purpose:** the **30h→<4h** is the real production job (the 30h is an *estimate* — say
so); the **~6× (50 s vs 311 s)** is the reproducible demo on kind. Don't merge them. And the cap `10`
is concurrent workflows (the prod number); the upstream HDA limit was a separate `20 req/s` — keep
that for Q&A, don't stack both numbers on stage. Cards in `anecdote-cheatsheet.md`._

> Rung two. A problem I keep running into: backfill. You do not only need last night's data; often you
> need the last three years of it, because someone wants a time series with a hole in it the size of a
> mission.

> One day at a time is slow. A month ingested sequentially is a coffee break; three years is a weekend you
> do not get back. So we fan it out.

> Fan-out is simpler than it sounds: instead of one step working through thirty days in a row, we ask for
> thirty steps and run them side by side. In Argo that is a one-line change — `withItems`: give it a list,
> it runs the same step once per item. Same unit of work; we just asked for a lot at once.

> This is the rung I felt most directly in production. I once had a reprocessing job I had estimated at
> more than thirty hours — days of watching a progress bar. I split it the way I just described — query
> once, then fan out with one item per worker — and it came in under four hours. The ingest function never
> changed; I simply stopped running the days one after another.

> But there is a caveat EO people feel instinctively: fast must not mean rude. Fan-out without a cap is a
> denial-of-service attack with good intentions — three hundred parallel requests is no longer backfilling,
> it is overwhelming the service you depend on. So we cap it: a parallelism limit of,
> say, ten in flight at a time. And ten is not a slide number; it is the cap I set in production, sized to
> what the source could take, not my cluster. You tell Argo to fan out across all thirty days but never
> more than ten at once, and it queues the rest.

> And here is a number you can reproduce tonight on a single laptop: the capped fan-out ran the backfill
> about six times faster than sequential — fifty seconds instead of five minutes. To be clear, the
> thirty-hours-to-four was the production job; this six-times is the laptop version, same shape, smaller
> world. It works on one machine because ingestion is mostly waiting — on the network, the API, the object
> store — so while one step waits, another works. The cap is not a throughput promise; it is a courtesy,
> and the speed-up is the reward for not being rude.

> _(let the clip run)_ So that is a month of backfill in about a minute, ten polite requests at a time.
> And once again, the function that ingests each day never changed.

---

## 4d. Rung 3 — STAC as a logbook (the heart) (14:30–20:30)

_Rung colour: orange (rung 3). **Clip: `rung3-gapclose`** — terminal, and it **leads with the
detected gaps**: the clip surfaces `find_gaps`' answer (e.g. `["2026-03-04","2026-03-05",…]`) and the
fan-out closing only those days. (Terminal, not the UI graph: the gap *list* is the point, and a
graph would hide "4 of 14".) This is the centre of the talk. Slow your **delivery** all the way down;
you don't need energy here, you need stillness. The on-slide `find_gaps` is trimmed; the full, tested
version is in the repo. The feeling is a quiet "oh" — the click of understanding._

> Rung three is the heart of the talk. Remember that logbook from rung one — the catalog where every
> ingested item was written down? Up to now it has been completely passive. It is a record; you could
> browse it, but it just sat there.

> At rung three, the logbook wakes up. It stops being a record of what happened, and it starts telling
> you what to do next.

> The whole idea is a single question we ask the catalog: across this window of dates, which days do you
> actually have? That gives us a set — the days that landed. We compare it against the days we expected,
> and anything expected but missing is a gap. That is all `find_gaps` is.

> And notice how cheap that question is. We are not re-downloading anything, not diffing files in a
> bucket; we are just asking the catalog — a database query over metadata we already wrote down. It is
> fast, it is exact, and it scales to years of history across every collection. The expensive part,
> actually fetching the data, only happens for the days that are genuinely missing.

> _(the trimmed code is on the slide)_ The real version lives in the repository, fully tested, edge cases
> and all. But conceptually it is just this: what should be here, minus what is here, equals what to fetch.

> One honest caveat for the STAC-literate people in the room. Real missions do not image every place every
> day — revisit cycles and cloud cover mean some gaps are entirely legitimate. So production gap detection
> models the acquisition cadence rather than the calendar. The demo uses a simple daily cadence so the
> idea stays visible, but the principle is the same.

> And then comes the part I find genuinely lovely. We feed exactly those missing days back into the
> fan-out from rung two. We do not re-ingest the whole window, and we do not redo work that is already
> done; we ingest only the gaps. You can watch it in the clip: the catalog has holes, `find_gaps` finds
> them, and the pipeline fills precisely those days and nothing else.

> Two properties fall out of this. The first is that it is idempotent — a fancy word for a simple idea:
> run it again when nothing is missing, and it does nothing, so it is safe to run on a schedule forever.
> The second is that it is self-correcting. A day that does not land — the kind that used to slip past me
> unnoticed — does not stay missing: the next scheduled run asks the logbook what is gone, sees the hole,
> and quietly fills it before anyone wakes up.

> That is the reframe made real. We did not write a smarter ingest function — it is still the one from
> rung zero. We gave the pipeline a memory, and taught it to compare that memory against what it expected.
> The intelligence is not in the code that fetches the data; it is in the catalog knowing what it ought to
> contain.

> And I will be honest about why this is the rung I love most. On one of our platforms I had been tracking
> what was ingested with little "done" marker files in storage — and they lied to me; a marker only tells
> you a process thought it had finished. So I tore that out and asked the catalog directly instead: is
> this item there? — something answerable from any machine, at any time, with no shared state. And I had
> done exactly this before, at sea: the glider archive I worked on never used markers either. The catalog
> itself was the record — a file there with the right name had been processed; if not, that was a gap. The
> same idea, fifteen years and an entire change of career apart. That is the moment I stopped feeling like
> a beginner.

> And because the catalog is per-collection, this works across missions independently — each mission,
> each region, gets its gaps found and filled on its own. The logbook is not watching one stream; it is
> watching all of them.

> Let me bring us back to where we started. As an oceanographer, my datasets only worked because I was the
> one watching them. On this rung, you no longer have to be: a day does not land, and nothing dramatic
> happens — the next morning's run asks the logbook what is missing, sees the hole, and fills it. The gap
> lasts a few hours and closes itself, with nobody watching. For me, that is the difference between a
> pipeline you have to babysit and one you can trust.

---

## 4e. Rung 4 — observability, it keeps climbing (20:30–22:30)

_Rung colour: vermillion (rung 4). **Clip: `rung4-report`** — the rich gap heatmap + retry summary.
Keep this brisk — "and it keeps climbing." Don't linger; the payoff beat is next. Honesty guard on the
W9 story: the **on-screen** artifact is a *coverage* gap heatmap (the demo); the report that taught the
lesson was a daily *error* report — and the **auth fix** dropped the rate, the report only surfaced it.
Say "showed me what to fix," not "the report fixed it." Card in `anecdote-cheatsheet.md`._

> Rung four — and here I will speed up, because the hard conceptual work is now behind us. The logbook is
> already self-healing; this last rung simply makes the healing visible.

> The centrepiece is a daily report, with a gap heatmap at its heart: a calendar grid, one cell per day,
> per collection. A filled cell means the day landed; an empty one means it did not. It is
> colour-blind-safe — the shape carries the meaning, not the colour alone. At a glance you see the health
> of the whole window, every collection side by side, plus a short retry summary of how often things
> failed and recovered on their own.

> I learned to value this the hard way, and at the time it was not even a gap heatmap — it was a daily
> error report. One morning it arrived in my inbox showing more than thirteen hundred failures in
> twenty-four hours. That number did not fix anything by itself, but it pointed me straight at the cause:
> an authentication bug hammering the upstream service. One fix later, the error rate fell from around
> fourteen percent to under one. The report did not heal the pipeline — but it showed me exactly where to.

> _(the heatmap clip is running)_ This is built from the workflow history Argo already keeps, so there is
> no extra metrics stack in the core. In the production profile you would wire in Prometheus and Grafana
> for live dashboards, but you do not need any of that to see your gaps — only the logbook you have had
> since rung one, drawn as a grid.

> And the ladder keeps going beyond here — production deployments, real tiling, coverage maps — but by now
> the shape is set. Every further rung is the same move: the same unit of work, with a little more
> capability around it.

---

## 5. Payoff — two levels of self-correction (22:30–24:15)

_Rung colour: gradient across all rungs. This is the conceptual gift they take home — name the two
loops plainly and let them be the thing people remember. No need to push it; the clarity does the
work._

> What we have built is really two different things, and they are easy to blur together.

> There are two levels of self-correction here. The first is item-level, and automatic: a single run
> fails transiently, Argo retries it, the day recovers, nobody is involved. That is rung one.

> The second is system-level, and surfaced for a human. A whole day — or a week — never landed at all, so
> there is no run to retry, just a hole. The logbook detects it and the next run refills it; the daily
> report makes the pattern visible, so if something is systematically wrong, a person sees it and steps
> in. That is rungs three and four together.

> So the item level is something the machine fixes on its own, while the system level is something the
> machine finds and a human decides on. It is a pipeline that fixes the small things itself, and shows you
> the big things before a user has to.

> One honest edge, because I do not want to oversell the phrase "self-healing": it only refills what should
> have been there in the first place. A day the satellite genuinely never acquired is not a missed retry —
> knowing that is the cadence model's job, and surfacing anything systemic is the report's job. It heals
> the predictable, and it shows you the rest; it never invents data.

> And that distinction matters in practice: it is the difference between a pager that goes off for
> everything and one that only goes off when it should. The machine handling the transient blips on its
> own is what earns your attention for the genuine problems — a pipeline that fired at every hiccup would
> just get muted, no better than the silent crontab we started with.

---

## 6. Locate yourself (24:15–25:30)

_Rung colour: back to the full ladder. This is the takeaway **in use** — the mental model doing its
job. Make it an honest invitation, not a demand; you're asking, not pushing._

> So that is the ladder. The reason I keep coming back to it is that it is diagnostic, not aspirational —
> you can place your own work on it. When I place my own past work on it, almost all of it sat at rung zero
> or rung one: a script, a cron job, something half-wrapped. That is where I started. And the encouraging
> thing is how close the next rung usually turns out to be — about an afternoon, not a rewrite, and not
> learning Kubernetes.

> What I really hope is that you leave able to sketch these five rungs on the back of a napkin, point at
> one, and think "I am here — and that is my next afternoon." If that happens, this talk has done its job.

> Because the through-line holds the whole way up: the unit of work never changes; only the ladder around
> it grows. You do not have to become a different kind of engineer; you only have to take the next step.

> I climbed this ladder twice — once at sea, with cron and MATLAB, and once again this year, new to all of
> it. You only have to climb it once. So: which rung are you on, and what is your next afternoon?

---

## 7. It's real, and you can run it tonight (25:30–26:30)

_Rung colour: neutral close. **Sentinel-2 still** on screen, then the **QR**. On the why-Argo /
neighbours slide, say the **one-line thesis out loud** (it's the talk's whole positioning); the
neighbours/orchestrator *detail* rides **silently by default** (the storyboard's pre-applied cut3) —
Q&A insurance, narrated only if you're ahead of time. Recap clip can play under this beat._

> Two last things, quickly.

> The first is that this is not a toy that only works on made-up data. The exact same frozen ingest
> function, pointed at Earth Search, pulls real Sentinel-2 — and here is a real catalog record, with the
> granule's true footprint on the map. The same pipeline, now pointed at real Copernicus data. Production
> is not a rewrite; it is simply a profile: `make up PROFILE=prod` runs the very same workflows against the
> real stack.

> I also want to be honest about one boundary, because the title promises analysis-ready data. Everything
> I have shown gets the data ready for the algorithm; the science itself — the cloud-masking, the spectral
> indices, the datacubes — begins where ingestion leaves off. The good news is that it does not stop here
> either: the same orchestration moves wrap those steps too.

> The second thing is that you can clone all of this tonight. Everything I have shown — all five rungs —
> lives in a single repository. `make up` brings the whole thing up on your laptop with Docker, and the QR
> code on screen takes you straight to it.

> And there is one positioning line I do want to say out loud, because it is the whole thesis. None of
> these pieces are new on their own — Argo, STAC, retries, gap detection all already exist, and there is
> excellent neighbouring work in projects like cirrus-geo, stactools, VEDA, and openEO. The contribution
> here is not a better framework; it is the ladder itself — a climbable path that a solo researcher can
> actually walk, one afternoon at a time.

_(The rest of the why-Argo slide stays up but **un-narrated** unless you're ahead of time: this ladder
is orchestrator-agnostic — Airflow or Prefect could climb it too; Argo specifically buys you
Kubernetes-native, container-per-step, first-class fan-out, and no separate scheduler database.)_

> So: find your rung, and climb one. The repository is right there. Thank you — and I would genuinely love
> to take your questions.

---

## 8. Live Q&A (26:30–30:00)

_Leave the QR + repo slide up. Repo open in a backup tab; never depend on a live cluster. The most
likely opener is "why not Airflow?" — the silent why-Argo slide is your answer, so you can be brief and
generous. Other likely ones: where ingestion ends and ARD begins; how the synthetic world maps to real
missions; cost/ops of running Argo. The RabbitMQ silent-loss story (2,700 events, 43 ran) lives here if
someone asks for a war story — it's the purest "no second place to look," and literally the Rung-1 lesson._

_For production-scale Argo questions (ops cost, workflow archiving, volume), you've already positioned
yourself as a recent climber — so the honest answer is graceful and on-message: "I've run this at
laptop scale; the repo's prod profile is where I'd start, but I won't pretend to have war stories at
volume." Don't bluff depth you don't have — the positioning in §3 is your cover._

> _(No script — this is live. Breathe. It's fine to pause before you answer. Repeat the question back
> so the room hears it, and so you have a moment to think.)_

---

## If running long — the cut-list (apply in this order)

Each cut is chosen to lose the *least* of the ladder through-line. Work top-down until you fit ≈26:30.

1. **Rung 4 detail (4e).** Drop to a single sentence: "and rung four just makes the healing visible —
   a gap heatmap." Saves ~60–75s. The payoff beat (5) still names the two loops.
2. **Rung 2 speed-up explanation (4c).** Cut the "why it works on one machine" aside; keep the 6×
   number and the politeness cap. Saves ~45s.
3. **The why-Argo / neighbours line (7) — already applied.** It rides as a silent slide / Q&A
   insurance by default. Nothing left to cut here; conversely it's the first beat to *add back*
   (~30s) if you're running short.
4. **Opening (1).** If the AV ran over, cut the cloud-engineering middle paragraph and go from the
   oceanographer line straight to the thesis ("a script on your laptop vs a pipeline you can trust"). Saves ~25s.
5. **Payoff (5) → fold into Locate (6).** Last resort: name the two loops in one sentence on the way
   into "find your rung." Saves ~45s but costs clarity — avoid unless badly over.

**Never cut:** the ladder thesis (2), the two promises (3), the rung-1 delta (4b), the rung-3 "aha"
(4d), or "find your rung, climb one" (6). Those are the talk.
