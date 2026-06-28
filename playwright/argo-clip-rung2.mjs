// Playwright recording — rung-2 "fan-out" TEACHING clip.
//
// Side-by-side: left = Argo workflow graph (30 days fanned out, capped at 10); right = STAC browser
// showing items appearing in the collection as each day is ingested.
//
// Why dual-capture: the script narration (foss4g2026-talk-private/docs/script.md) calls out both
// places: "On the left, the Argo interface showing the backfill as a single fan of parallel steps;
// On the right, the STAC catalog, now holding a full grid of thirty freshly ingested days."
//
// Prereqs:
//   - kind cluster up (make up in argo-stac-eo-pipeline)
//   - All four port-forwards running in the same shell:
//       kubectl -n eo port-forward svc/argo-server 2746:2746 &
//       kubectl -n eo port-forward svc/stac-api 8081:80 &
//       kubectl -n eo port-forward svc/minio 9100:9000 &
//       kubectl -n eo port-forward svc/stac-browser 8082:80 &
//   - playwright-chromium installed (npx playwright install chromium)
//   - ffmpeg on PATH
// Run from the foss4g2026-talk repo root:
//   node playwright/argo-clip-rung2.mjs
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argo  = (a) => execSync(`argo ${a} -n ${NS}`, { encoding: "utf8" });
const phase = (name) => {
  try { return JSON.parse(argo(`get ${name} -o json`)).status?.phase || ""; }
  catch { return ""; }
};

const addBanner = (page, text, bg) => page.evaluate(
  ([text, bg]) => {
    if (document.getElementById("clip-banner")) return;
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

mkdirSync(RAW, { recursive: true });

// 1) Submit the backfill and immediately start recording — the workflow runs while we're capturing.
const name = argo(`submit ${WF} -o name`).trim();
console.log("submitted", name);

// 2) Two separate contexts so ffmpeg gets two independent video files.
const browser = await chromium.launch();

const ctxArgo = await browser.newContext({
  ignoreHTTPSErrors: true,
  viewport: { width: 860, height: 640 },
  recordVideo: { dir: RAW, size: { width: 860, height: 640 } },
});
const ctxStac = await browser.newContext({
  viewport: { width: 860, height: 640 },
  recordVideo: { dir: RAW, size: { width: 860, height: 640 } },
});

const argoPage = await ctxArgo.newPage();
const stacPage = await ctxStac.newPage();

// 3) Open Argo workflow detail page
await argoPage.goto(`${ARGO}/workflows/${NS}/${name}`, {
  waitUntil: "domcontentloaded",
  timeout: 30000,
});
await argoPage.waitForTimeout(2500);
await argoPage.addStyleTag({ content: ".modal{display:none !important}" });
await addBanner(argoPage, "Rung 2 — 30 days fanned out at once, 10 running in parallel.", "#E69F00");

// 4) Open stac-browser, wait for it to load, then navigate into the collection
await stacPage.goto(SB, { waitUntil: "domcontentloaded", timeout: 30000 });
await stacPage.waitForTimeout(4000);
await addBanner(stacPage, "STAC logbook — items appear as each day is ingested.", "#56B4E9");
// Try to click into the collection so we see individual items appearing.
// Fall back to staying on the collections-overview page if the link isn't there yet.
try {
  // stac-browser shows collection cards; click the first one that matches our collection.
  const collLink = stacPage.locator(`a:has-text("${COLLECTION}"), a:has-text("aurora"), a:has-text("synthetic")`).first();
  await collLink.click({ timeout: 5000 });
  await stacPage.waitForTimeout(3000);
  await addBanner(stacPage, "STAC logbook — items appear as each day is ingested.", "#56B4E9");
} catch {
  // Stay on the overview — it still shows item count per collection.
  console.log("Could not navigate into collection — staying on overview.");
}

// 5) Poll the workflow; reload stac-browser every ~10 s to show items accumulating.
const TIMEOUT_MS  = 120_000;
const POLL_MS     = 4_000;
const STAC_RELOAD = 10_000;
let elapsed = 0;
let nextReload = STAC_RELOAD;

while (elapsed < TIMEOUT_MS) {
  await sleep(POLL_MS);
  elapsed += POLL_MS;

  const p = phase(name);
  console.log(`[${Math.round(elapsed / 1000)}s] phase: ${p}`);
  if (/Succeeded|Failed|Error/.test(p)) break;

  if (elapsed >= nextReload) {
    nextReload += STAC_RELOAD;
    try {
      await stacPage.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
      await stacPage.waitForTimeout(2500);
      await addBanner(stacPage, "STAC logbook — items appear as each day is ingested.", "#56B4E9");
    } catch { /* reload errors are non-fatal */ }
  }
}

// 6) Final settle: give both pages a moment with the completed/final state visible.
await sleep(5000);

// 7) Close and retrieve video paths.
const argoVid = argoPage.video();
const stacVid = stacPage.video();
await ctxArgo.close();
await ctxStac.close();
await browser.close();

const argoSrc = await argoVid.path();
const stacSrc = await stacVid.path();
console.log("argo video:", argoSrc);
console.log("stac video:", stacSrc);

// 8) ffmpeg: scale both to 450 px tall, hstack side by side, convert to GIF at 6 fps.
//    -ss 3 trims the page-load head so the clip opens on live content.
execSync(
  `ffmpeg -y -ss 3 -i "${argoSrc}" -ss 3 -i "${stacSrc}" ` +
  `-filter_complex ` +
  `"[0:v]scale=-2:450:flags=lanczos[a];` +
  `[1:v]scale=-2:450:flags=lanczos[b];` +
  `[a][b]hstack[stacked];` +
  `[stacked]fps=6,split[s0][s1];` +
  `[s0]palettegen[p];` +
  `[s1][p]paletteuse" ` +
  `-loop 0 "${OUT}"`,
  { stdio: "inherit" }
);
console.log("wrote", OUT);
