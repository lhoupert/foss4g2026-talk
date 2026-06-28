// Playwright recording — rung-2 "fan-out" TEACHING clip.
//
// Side-by-side: left = Argo workflow graph with the 30-day fan-out EXPANDED so you can watch the
// children go pending (waiting) -> running (10 at a time) -> succeeded; right = STAC browser zoomed
// out to ~70% showing the ITEM LIST of the collection filling up as each day is ingested.
//
// Why dual-capture: the script narration (foss4g2026-talk-private/docs/script.md) calls out both
// places: "On the left, the Argo interface showing the backfill as a single fan of parallel steps;
// On the right, the STAC catalog, now holding a full grid of thirty freshly ingested days."
//
// Prereqs:
//   - kind cluster up (make up in argo-stac-eo-pipeline) with a CLEAN collection so items visibly
//     accumulate (make clean, or at least an empty synthetic-aurora-veil collection)
//   - All four port-forwards running in the same shell:
//       kubectl -n eo port-forward svc/argo-server 2746:2746 &
//       kubectl -n eo port-forward svc/stac-api 8081:80 &
//       kubectl -n eo port-forward svc/minio 9100:9000 &
//       kubectl -n eo port-forward svc/stac-browser 8082:80 &
//   - playwright-chromium installed (npx playwright install chromium)
//   - ffmpeg on PATH
// Run from the foss4g2026-talk repo root, pointing at the SLOW backfill so the parallel waves are
// visible on camera (the real INGEST_SLEEP=2 backfill finishes too fast to see "10 in parallel"):
//   cd ../argo-stac-eo-pipeline && make clean    # reset to an empty collection (items fill 0->30)
//   WF=playwright/backfill-rung2-slow.yaml node playwright/argo-clip-rung2.mjs
// The ffmpeg window/speed at the end (START/DUR/SPEED env) is tuned for that ~43 s run.
import { chromium } from "playwright-chromium";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const ARGO = process.env.ARGO_UI  || "http://localhost:2746";
const SB   = process.env.SB       || "http://localhost:8082";
const NS   = process.env.NS       || "eo";
const WF   = process.env.WF       || "../argo-stac-eo-pipeline/stages/02-fanout/workflows/backfill.yaml";
const OUT  = process.env.OUT      || "public/clips/rung2-fanout.gif";
const RAW  = process.env.RAW      || "public/clips/_raw";
const COLLECTION = "synthetic-aurora-veil";
// stac-browser renders amd64 under qemu here -> slow; give it generous timeouts.
const STAC_ZOOM = process.env.STAC_ZOOM || "0.4";    // full-width items at ~0.4 => ~6 cols x 5 rows, all 30 in view

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argo  = (a) => execSync(`argo ${a} -n ${NS}`, { encoding: "utf8" });
const phase = (name) => {
  try { return JSON.parse(argo(`get ${name} -o json`)).status?.phase || ""; }
  catch { return ""; }
};

const addBanner = (page, text, bg) => page.evaluate(
  ([text, bg]) => {
    const old = document.getElementById("clip-banner");
    if (old) { old.textContent = text; return; }
    const b = document.createElement("div");
    b.id = "clip-banner";
    b.textContent = text;
    Object.assign(b.style, {
      position: "fixed", left: "0", right: "0", top: "0", zIndex: "99999",
      background: bg, color: "#1a1a1a", font: "700 18px/1.2 sans-serif",
      padding: "10px 16px", textAlign: "center",
    });
    document.body.appendChild(b);
  },
  [text, bg]
);

// Argo collapses a withItems fan-out (it shows a few children + an "N hidden nodes" summary) and
// never auto-fits the graph. Two toolbar actions fix it, with EXACT titles confirmed against this
// Argo build (v4.0.6): "Expand all nodes" (idempotent — always expands; not a toggle) and
// "Zoom out" (incremental). So we click expand ONCE and zoom-out a FIXED number of times — calling
// this repeatedly per poll would keep zooming out, so it is invoked exactly once after the fan-out
// children exist.
const ZOOM_OUT_CLICKS = Number(process.env.ZOOM_OUT_CLICKS || 5);
const expandAll = (page) => page.locator('[title="Expand all nodes"]').click({ timeout: 3000 });
const hiddenSummaryCount = (page) => page.locator("text=/hidden node/i").count().catch(() => 0);
const expandAndFitArgoGraph = async (page) => {
  try { await expandAll(page); console.log("expanded all nodes"); }
  catch { console.log("expand-all button not found"); }
  await page.waitForTimeout(800);
  for (let i = 0; i < ZOOM_OUT_CLICKS; i++) {
    await page.locator('[title="Zoom out"]').click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(600);
};

mkdirSync(RAW, { recursive: true });

// 1) Submit the backfill and immediately start recording — the workflow runs while we're capturing,
//    so the fan-out animates from pending -> running -> succeeded on camera.
const name = argo(`submit ${WF} -o name`).trim();
console.log("submitted", name);

// 2) Two separate contexts so ffmpeg gets two independent video files. Argo is wide (the fan spans
//    horizontally); STAC is the item list. Both 900 tall so they composite cleanly side by side.
const browser = await chromium.launch();

const ARGO_VP = { width: 1280, height: 900 };
const STAC_VP = { width: 1100, height: 900 };
const ctxArgo = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: ARGO_VP,
  recordVideo: { dir: RAW, size: ARGO_VP },
});
// STAC is captured as clean SCREENSHOTS (not video): a recorded reload-video blinks white on every
// refresh, so instead we snapshot settled states and crossfade them in ffmpeg for a smooth fill.
const ctxStac = await browser.newContext({ viewport: STAC_VP });

const argoPage = await ctxArgo.newPage();
const stacPage = await ctxStac.newPage();
const tVideo0 = Date.now();   // ~Argo video t=0; used to auto-compute the compose window later

// 3) Open Argo workflow detail page and prep the graph.
await argoPage.goto(`${ARGO}/workflows/${NS}/${name}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await argoPage.waitForTimeout(2500);
await argoPage.addStyleTag({ content: ".modal{display:none !important}" });
await addBanner(argoPage, "Rung 2 — 30 days fanned out at once, 10 running in parallel.", "#E69F00");

// 4) Open stac-browser directly on the collection page (robust — no card-click race). To show MORE
//    items per row, hide the whole `.meta` column (Description + footprint map) so `.items-container`
//    takes the FULL width — that reflows the 50/50 split into a ~4-column item grid. Plus zoom out.
//    addStyleTag must be applied AFTER load (stac-browser uses vue-meta, which strips styles injected
//    at document_start), so we re-apply it on every (re)load.
const COLLECTION_URL = `${SB}/collections/${COLLECTION}`;
const STAC_STYLE =
  ".meta{display:none !important}" +                                          // drop Description + map column
  ".items-container{flex:0 0 100% !important;max-width:100% !important}" +    // Items spans full width => more cols
  `body{zoom:${STAC_ZOOM}}`;
const loadStac = async (page) => {
  await page.goto(COLLECTION_URL, { waitUntil: "domcontentloaded", timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.addStyleTag({ content: STAC_STYLE }).catch(() => {});
  await page.waitForTimeout(1600);
  await addBanner(page, "STAC logbook — items appear as each day is ingested.", "#56B4E9").catch(() => {});
};
// Count items via the STAC API (drives WHEN to snapshot the filling catalog).
const itemCount = async () => {
  try {
    const r = await fetch(`http://localhost:8081/collections/${COLLECTION}/items?limit=100`);
    const j = await r.json();
    return (j.features || []).length;
  } catch { return 0; }
};
// Snapshot the current settled STAC page to a numbered PNG (these become the crossfade frames).
const stacShots = [];
const takeStacShot = async () => {
  const p = `${RAW}/stac-shot-${String(stacShots.length).padStart(2, "0")}.png`;
  await stacPage.screenshot({ path: p }).catch(() => {});
  stacShots.push(p);
  console.log(`stac shot ${stacShots.length - 1} (items≈${await itemCount()})`);
};
// stac-browser paginates at 12 items/page, so items beyond 12 would never show. Intercept the STAC
// API items request and bump its `limit` so ALL items render on a single page — the catalog then
// visibly fills past 12 (up to 30) as the backfill runs.
await stacPage.route("**/items*", async (route) => {
  try {
    const u = new URL(route.request().url());
    u.searchParams.set("limit", "40");
    await route.continue({ url: u.toString() });
  } catch { await route.continue(); }
});
await loadStac(stacPage);
await takeStacShot();   // empty / first state

// 5) Expand + fit the Argo graph the moment the fan-out stage is on screen. Argo shows the fan-out
//    COLLAPSED ("N hidden nodes" summary), so the hidden children are NOT in the DOM — gating on a
//    child *count* never fires while collapsed. Instead we trigger as soon as the collapsed summary
//    (or a visible child) appears, then expand + zoom ONCE.
for (let i = 0; i < 40; i++) {
  const fanUp = (await hiddenSummaryCount(argoPage))
              + (await argoPage.locator("text=/backfill\\(\\d+/").count().catch(() => 0));
  if (fanUp > 0) { console.log("fan-out stage detected"); break; }
  await argoPage.waitForTimeout(1000);
}
await expandAndFitArgoGraph(argoPage);
await addBanner(argoPage, "Rung 2 — 30 days fanned out at once, 10 running in parallel.", "#E69F00");
const tExpand = Date.now();   // fan is expanded + first wave running => good clip START reference

// 6) Poll the workflow. Re-expand the Argo fan-out if it re-collapses (idempotent; never re-zoom).
//    Every ~5 s, reload stac-browser and snapshot the settled grid — these evenly-spaced clean
//    screenshots become crossfade frames, so the right pane fills SMOOTHLY with no reload-flash.
const TIMEOUT_MS  = 150_000;
const POLL_MS     = 2_500;
const SHOT_EVERY  = 5_000;
let elapsed = 0;
let lastShotAt = 0;
let tDone = 0;   // wall-clock when the workflow finished => good clip END reference

while (elapsed < TIMEOUT_MS) {
  await sleep(POLL_MS);
  elapsed += POLL_MS;

  const p = phase(name);
  console.log(`[${Math.round(elapsed / 1000)}s] phase: ${p}`);
  if (await hiddenSummaryCount(argoPage) > 0) { await expandAll(argoPage).catch(() => {}); }

  if (elapsed - lastShotAt >= SHOT_EVERY) {
    lastShotAt = elapsed;
    await loadStac(stacPage).catch(() => {});
    await takeStacShot();
  }

  if (/Succeeded|Failed|Error/.test(p)) { tDone = Date.now(); break; }
}

// 7) Final settle: reload once more so the last frame shows the full grid, then snapshot it.
await loadStac(stacPage).catch(() => {});
await takeStacShot();
await sleep(2000);

// 8) Close and retrieve the Argo video path (STAC is a list of screenshot paths in stacShots).
const argoVid = argoPage.video();
await ctxArgo.close();
await ctxStac.close();
await browser.close();

const argoSrc = await argoVid.path();
console.log("argo video:", argoSrc);
console.log("stac shots:", stacShots.length);

// 9) Compose → side-by-side looping GIF. LEFT = Argo fan VIDEO (the liked panel): crop the wide-short
//    graph band and PAD to panel height (gray = Argo's real canvas), sped up to a tight loop. RIGHT =
//    STAC built from the clean screenshots, CROSSFADED together (no reload-flash) and stretched to the
//    SAME duration as the Argo window so both fill in sync. START/DUR/SPEED tuned for the ~43 s slow
//    backfill; override via env if the run length differs.
// Auto-window from recorded wall-clock marks — robust to qemu-variable run length (the poll "elapsed"
// counter is NOT wall time: ~30 s of setup runs before it starts, and pod scheduling staggers the
// waves, so a fixed window mis-times the loop). Open ~3 s before the first expanded wave, close ~4 s
// after the workflow finished (so the graph is fully green). Override any of these via env.
const TARGET_LOOP = Number(process.env.TARGET_LOOP || 9);   // desired gif length (s)
const autoStart = Math.max(0, (tExpand - tVideo0) / 1000 - 3);
const autoEnd   = ((tDone || Date.now()) - tVideo0) / 1000 + 4;
const START  = process.env.START || autoStart.toFixed(1);
const DUR    = Number(process.env.DUR || Math.max(8, autoEnd - autoStart).toFixed(1));
const SPEED  = Number(process.env.SPEED || Math.max(3, DUR / TARGET_LOOP).toFixed(2));
const OUTDUR = DUR / SPEED;                       // STAC clip length must match the Argo window length
const PANEL_H = 680;
const XF = 0.6;                                   // crossfade seconds between STAC states

const shots = stacShots.slice();
if (shots.length < 2) shots.push(shots[0]);      // need >=2 for an xfade chain
const N = shots.length;
const seg = (OUTDUR + (N - 1) * XF) / N;          // per-image length so the chain totals OUTDUR

// Build: argo video (input 0) + each STAC screenshot as a looping image input.
const inputs =
  `-ss ${START} -t ${DUR} -i "${argoSrc}" ` +
  shots.map((p) => `-loop 1 -t ${seg.toFixed(3)} -i "${p}"`).join(" ");

// Argo panel.
let fc =
  `[0:v]crop=1180:300:100:0,scale=900:-2,pad=900:${PANEL_H}:(ow-iw)/2:0:color=0xDDE3E8,` +
  `setpts=PTS/${SPEED}[a];`;
// STAC: scale every screenshot to the panel height, then xfade them into one smooth clip [b].
shots.forEach((_, i) => { fc += `[${i + 1}:v]scale=-2:${PANEL_H},setsar=1[c${i}];`; });
let prev = "c0";
for (let i = 1; i < N; i++) {
  const out = i === N - 1 ? "b" : `x${i}`;
  const offset = (i * (seg - XF)).toFixed(3);
  fc += `[${prev}][c${i}]xfade=transition=fade:duration=${XF}:offset=${offset}[${out}];`;
  prev = out;
}
fc +=
  `[a][b]hstack=inputs=2[v];` +
  `[v]fps=10,scale=1360:-2:flags=lanczos,split[s0][s1];` +
  `[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`;

execSync(`ffmpeg -y ${inputs} -filter_complex "${fc}" -loop 0 "${OUT}"`, { stdio: "inherit" });
console.log("wrote", OUT, `(${N} STAC frames, ~${OUTDUR.toFixed(1)}s loop)`);
