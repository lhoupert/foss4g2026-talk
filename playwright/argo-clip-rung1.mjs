// Playwright recording — rung-1 "retries" TEACHING clip (Argo UI graph).
//
// Why the UI (not the terminal): the Argo graph maps 1:1 onto the mental model — a workflow is a
// graph of steps, one failed (red ✗), Argo made a retry that succeeded (green ✓). We run the
// workflow to completion, then record the *finished* graph with persistent callout labels
// introducing the elements, and convert the webm to a short looping GIF with ffmpeg.
//
// Prereqs: a FRESH cluster so the retry fires (`python scripts/make_screencast_data.py rung1-retry
// --run`), the Argo UI port-forwarded (`make ui` → https://localhost:2746, self-signed), Playwright
// chromium, and ffmpeg. Run from the repo root:
//   node docs/slides/playwright/argo-clip-rung1.mjs
// Set REUSE=1 to record the latest existing rung1 workflow instead of submitting a new one (fast
// iteration; no fresh cluster needed — the finished graph still shows ✗→✓).
import { chromium } from "playwright-chromium";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const ARGO = process.env.ARGO_UI || "http://localhost:2746";
const NS = process.env.NS || "eo";
// Companion repo (sibling dir) holds the cluster + stage manifests; this deck holds the assets.
const WF = process.env.WF || "../argo-stac-eo-pipeline/stages/01-argo-retries/workflows/ingest.yaml";
const OUT = process.env.OUT || "public/clips/rung1-retry.gif";
const RAW = process.env.RAW || "public/clips/_raw";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argo = (a) => execSync(`argo ${a} -n ${NS}`, { encoding: "utf8" });
const phase = (name) => {
  try {
    return JSON.parse(argo(`get ${name} -o json`)).status?.phase || "";
  } catch {
    return "";
  }
};

// 1) pick the workflow: reuse the latest rung1 run, or submit a fresh one and wait for it to finish
let name;
if (process.env.REUSE) {
  name = argo(`list -o name`).split("\n").find((l) => l.startsWith("rung1-ingest"));
  console.log("reusing", name);
} else {
  name = argo(`submit ${WF} -o name`).trim();
  console.log("submitted", name, "— waiting for it to finish…");
  for (let i = 0; i < 60; i++) {
    if (/Succeeded|Failed|Error/.test(phase(name))) break;
    await sleep(1000);
  }
}

// 2) record only the finished graph (short clip): launch the browser now, after completion
mkdirSync(RAW, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true, // argo-server self-signed cert (local demo)
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: RAW, size: { width: 1280, height: 800 } },
});
const page = await ctx.newPage();
await page.goto(`${ARGO}/workflows/${NS}/${name}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(2500);

// 3) kill Argo's first-run popups (the survey + the "vX.Y has just been installed" changelog): both
//    render in a `div.modal` (position:fixed, confirmed by DOM probe). A stylesheet rule hides any
//    that appear, now or on re-render.
await page.addStyleTag({ content: ".modal{display:none !important}" });
await page.waitForTimeout(600);

// 4) persistent guidance banner + node-anchored callouts (skip any node not found)
await page.evaluate(() => {
  const banner = document.createElement("div");
  banner.textContent = "Rung 1 — a workflow is a graph of steps. One failed; Argo retried it automatically.";
  Object.assign(banner.style, {
    position: "fixed", left: "0", right: "0", top: "0", zIndex: "99999",
    background: "#56B4E9", color: "#1a1a1a", font: "800 22px sans-serif",
    padding: "12px 20px", textAlign: "center",
  });
  document.body.appendChild(banner);

  const style = document.createElement("style");
  style.textContent = "@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,158,115,.6)}50%{box-shadow:0 0 0 10px rgba(0,158,115,0)}}";
  document.head.appendChild(style);

  const label = (text, x, y, color, pulse) => {
    const d = document.createElement("div");
    d.textContent = text;
    Object.assign(d.style, {
      position: "fixed", left: `${Math.max(8, x)}px`, top: `${y}px`, zIndex: "99999",
      background: "#FCFCF9", color: "#1a1a1a", border: `3px solid ${color}`,
      borderRadius: "8px", padding: "6px 10px", font: "700 18px sans-serif", maxWidth: "300px",
      boxShadow: "0 2px 8px rgba(0,0,0,.3)",
    });
    if (pulse) d.style.animation = "pulse 1.6s infinite";
    document.body.appendChild(d);
  };
  const box = (re) => {
    const el = [...document.querySelectorAll("text, tspan, div, span")].find(
      (e) => e.children.length === 0 && re.test((e.textContent || "").trim())
    );
    return el ? el.getBoundingClientRect() : null;
  };
  const i0 = box(/^ingest\(0\)$/); // first attempt — fails (red ✗)
  const i1 = box(/^ingest\(1\)$/); // automatic retry — succeeds (green ✓)
  if (i0 && i1) {
    // Argo lays the two leaf nodes side by side; place each label on its node's OUTWARD side so the
    // two callouts don't cross (which node is left vs right isn't fixed, so derive it).
    const W = 270;
    const zeroOnLeft = i0.left < i1.left;
    const failX = zeroOnLeft ? i0.left - W : i0.right + 20;
    const retX = zeroOnLeft ? i1.right + 20 : i1.left - W;
    const y = Math.max(i0.top, i1.top) + 26;
    label("✗ first attempt failed (a 3 a.m. API hiccup)", failX, y, "#D55E00");
    label("↻ Argo's automatic retry — succeeded ✓", retX, y, "#009E73", true);
  }
});

await page.waitForTimeout(6000); // record ~6s of the labelled graph (the pulse gives gentle motion)

const video = page.video();
await ctx.close();
await browser.close();
const src = await video.path();

// 5) webm → short looping GIF. -ss trims the page-load head (so it opens on the labelled graph);
//    crop includes the top banner (y=0) and skips the left nav; fps 6 keeps the file small.
execSync(
  `ffmpeg -y -ss 4.5 -i "${src}" ` +
    `-vf "fps=6,crop=1060:520:120:0,scale=980:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ` +
    `-loop 0 "${OUT}"`,
  { stdio: "inherit" }
);
console.log("wrote", OUT);
