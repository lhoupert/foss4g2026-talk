// Playwright recording — rung-1 "retries" TEACHING clip (Argo UI graph), STAGED PROGRESSION.
//
// Why the UI (not the terminal): the Argo graph maps 1:1 onto the mental model — a workflow is a
// graph of steps, one attempt failed (red ✗), Argo's automatic retry succeeded (green ✓).
//
// Why a staged loop (not a sped-up recording): the live run has long dead time while pods schedule,
// so we don't record the video. Instead we POLL the workflow and grab one clean screenshot each time
// the set of node phases changes, capturing the KEY visual states:
//   0  workflow starts          — ensure-collection pending
//   1  collection ready         — ingest step begins (ingest(0) pending)
//   2  first attempt FAILED ✗   — ingest(0) red, Argo schedules ingest(1) (the retry)
//   3  retry SUCCEEDED ✓        — all nodes green, workflow Succeeded
// Then ffmpeg assembles those stills into a smooth <10s loop: each stage is held ~1.6s with a short
// crossfade between stages and a longer hold on the all-green end. A coloured caption bar (rendered
// in-browser, because this ffmpeg has no drawtext/libfreetype) names each stage.
//
// Prereqs: a cluster with the rung-1 retry marker FRESH so attempt 0 fails (see companion repo;
// `make demo STAGE=01` / the make_screencast_data helper sets this up), the Argo UI port-forwarded
// (http://localhost:2746), Playwright chromium, and ffmpeg. Run from the deck repo root:
//   node playwright/argo-clip-rung1.mjs
// Env:
//   REUSE=1   record the latest existing rung1 workflow instead of submitting a new one. The retry
//             children still show ✗→✓, but the early "running/pending" stages won't reproduce on an
//             already-finished workflow — submit a fresh run for the full 4-stage progression.
//   OUT=...   output gif path (default public/clips/rung1-retry.gif)
import { chromium } from "playwright-chromium";
import { execSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ARGO = process.env.ARGO_UI || "http://localhost:2746";
const NS = process.env.NS || "eo";
// Companion repo (sibling dir) holds the cluster + stage manifests; this deck holds the assets.
const WF = process.env.WF || "../argo-stac-eo-pipeline/stages/01-argo-retries/workflows/ingest.yaml";
const OUT = process.env.OUT || "public/clips/rung1-retry.gif";
const TMP = mkdtempSync(join(tmpdir(), "rung1-clip-"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argo = (a) => execSync(`argo ${a} -n ${NS}`, { encoding: "utf8" });
const status = (name) => { try { return JSON.parse(argo(`get ${name} -o json`)).status || {}; } catch { return {}; } };
const sig = (st) => Object.values(st.nodes || {}).map((n) => `${n.displayName}:${n.phase}`).sort().join("|");

// Caption bar per stage (Okabe-Ito brand palette). text colour chosen for contrast on the bar.
const CAPS = [
  { t: "Workflow starts — ensure the collection exists", bar: "#56B4E9" },
  { t: "Collection ready ✓ — ingest step begins",        bar: "#56B4E9" },
  { t: "First attempt failed ✗ — Argo retries it ↻",     bar: "#D55E00" },
  { t: "Retry succeeded ✓ — no day lost",                bar: "#009E73" },
];
// Classify a captured state into a stage index from its phase/signature (robust to extra states).
const stageOf = (phase, s) =>
  /Succeeded/.test(phase) ? 3 : /:Failed/.test(s) ? 2 : /(^|\|)ingest:/.test(s) ? 1 : 0;

// 1) pick the workflow: reuse the latest rung1 run, or submit a fresh one
const name = process.env.REUSE
  ? argo(`list -o name`).split("\n").find((l) => l.startsWith("rung1-ingest")).trim()
  : argo(`submit ${WF} -o name`).trim();
console.log(process.env.REUSE ? "reusing" : "submitted", name);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(`${ARGO}/workflows/${NS}/${name}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2000);
// Hide Argo's first-run popups (survey + "vX.Y installed" changelog) — both render in a div.modal.
await page.addStyleTag({ content: ".modal{display:none !important}" });

// 2) poll the workflow; screenshot once per change in the set of node phases. Keep the retry group
//    expanded (the toolbar's "Expand all nodes" button is idempotent) so ingest(0)/ingest(1) show.
const states = [];
let last = "", i = 0, doneAt = 0;
for (let poll = 0; poll < 200; poll++) {
  try { const e = page.locator('[title="Expand all nodes"]'); if (await e.count()) await e.first().click({ timeout: 500 }); } catch {}
  const st = status(name);
  const s = sig(st), phase = st.phase || "";
  if (s && s !== last) {
    await page.waitForTimeout(450); // let the graph settle and node colours render
    // root = topmost graph node; its centre anchors the crop so the chain is framed identically
    const bbox = await page.evaluate(() => {
      const ns = [...document.querySelectorAll(".graph .node")].map((n) => n.getBoundingClientRect()).filter((r) => r.width);
      if (!ns.length) return null;
      const top = ns.reduce((a, r) => (r.top < a.top ? r : a));
      return { rootCx: (top.left + top.right) / 2, rootCy: (top.top + top.bottom) / 2 };
    });
    const file = join(TMP, `state-${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: file });
    states.push({ file, phase, stage: stageOf(phase, s), bbox });
    console.log(`[poll ${poll}] stage ${stageOf(phase, s)} (${phase || "Running"}):`, s.replace(/\|/g, "  "));
    last = s; i++;
  }
  if (/Succeeded|Failed|Error/.test(phase)) { if (!doneAt) doneAt = poll; if (poll - doneAt >= 3) break; }
  await sleep(700);
}

// 3) render a caption-bar PNG per stage in the browser (perfect glyphs; ffmpeg here lacks drawtext)
const capPage = await ctx.newPage();
await capPage.setViewportSize({ width: 980, height: 60 });
for (let k = 0; k < CAPS.length; k++) {
  const c = CAPS[k], fg = c.bar === "#D55E00" ? "#ffffff" : "#10141a";
  await capPage.setContent(`<body style="margin:0"><div style="width:980px;height:60px;background:${c.bar};
    color:${fg};font:800 27px/60px 'Helvetica Neue',Arial,sans-serif;padding:0 26px;box-sizing:border-box;
    white-space:nowrap;overflow:hidden">${c.t}</div></body>`);
  await capPage.screenshot({ path: join(TMP, `capbar-${k}.png`), clip: { x: 0, y: 0, width: 980, height: 60 } });
}
await browser.close();

if (!states.length) throw new Error("captured no states — is the workflow name/UI reachable?");

// 4) crop+caption each state into a 980-wide frame. Crop is anchored on the root-node centre so every
//    stage is framed identically (600x360 window → scaled to 980x588). A drawbox of the canvas bg
//    colour erases the Argo toolbar's residual border line that intrudes at top-left. A 60px top bar
//    receives the caption overlay.
const BARH = 60, W = 980, IH = 588, H = IH + BARH;
const cx = Math.round((states.at(-1).bbox?.rootCx ?? 662));
const cropL = Math.max(0, cx - 300), cropT = Math.max(0, Math.round((states.at(-1).bbox?.rootCy ?? 183) - 15));
const drawW = Math.max(0, Math.round(((588 - cropL) / 600) * W) + 16); // cover toolbar remnant if any
const frames = states.map((s, k) => {
  const out = join(TMP, `frame-${String(k).padStart(2, "0")}.png`);
  const capbar = join(TMP, `capbar-${Math.min(s.stage, 3)}.png`);
  const box = drawW > 0 ? `,drawbox=x=0:y=0:w=${drawW}:h=16:color=0xDEE6EB:t=fill` : "";
  execSync(`ffmpeg -y -loglevel error -i "${s.file}" -i "${capbar}" -filter_complex ` +
    `"[0:v]crop=600:360:${cropL}:${cropT},scale=${W}:${IH}${box},pad=${W}:${H}:0:${BARH}:color=0x10141a[bg];` +
    `[bg][1:v]overlay=0:0" "${out}"`);
  return out;
});

// 5) xfade the frames into a smooth loop (hold each ~1.6s, 0.45s crossfade, longer hold on the end),
//    then palettegen/paletteuse for a clean small GIF.
const last2 = frames.length - 1;
const durs = frames.map((_, k) => (k === last2 ? 2.6 : 1.6));
const XF = 0.45;
const inputs = frames.map((f, k) => `-loop 1 -t ${durs[k]} -i "${f}"`).join(" ");
let filt = "", prev = "0:v", off = 0;
for (let k = 1; k < frames.length; k++) {
  off += durs[k - 1] - XF;
  const o = k === last2 ? "vx" : `v${k}`;
  filt += `[${prev}][${k}:v]xfade=transition=fade:duration=${XF}:offset=${off.toFixed(2)}[${o}];`;
  prev = o;
}
filt += frames.length === 1
  ? `[0:v]fps=12,split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3[g]`
  : `[vx]fps=12,split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3[g]`;
const total = durs.reduce((a, b) => a + b, 0) - (frames.length - 1) * XF;
mkdirSync(OUT.replace(/\/[^/]+$/, ""), { recursive: true });
execSync(`ffmpeg -y -loglevel error ${inputs} -filter_complex "${filt}" -map "[g]" -loop 0 "${OUT}"`, { stdio: "inherit" });
console.log(`wrote ${OUT}  (~${total.toFixed(2)}s, ${frames.length} stages)`);
