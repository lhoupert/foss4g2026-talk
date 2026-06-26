// Playwright capture — STAC "logbook" still for the deck (rung-1 STAC-logbook slide). A real
// stac-browser screenshot so first-timers recognise the catalog the talk calls a "logbook".
// Maintainer-run; same pattern as argo-clip-rung1.mjs.
//
// NOTE (todo.md FU-2): asset *thumbnails* render blank in stac-browser — the hrefs are `s3://…`,
// unreachable by a client browser (this is also why sentinel2-still.png shows the metadata/footprint
// page, not a preview). So we capture the COLLECTION / ITEM-METADATA view — the logbook as a
// queryable record (collections, item list, temporal/spatial extent) — NOT a gallery of blank tiles.
//
// Prereqs: `make up` + `make seed` (so the catalog has content) + `make browse`
// (http://localhost:8082; the browser fetches the API at http://localhost:8081).
// Run: node docs/slides/playwright/stac-logbook.mjs   → docs/slides/stac-logbook-still.png
import { chromium } from "playwright";

const SB = process.env.STAC_BROWSER || "http://localhost:8082";
const OUT = "docs/slides/stac-logbook-still.png";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
// stac-browser is a client-side SPA; "networkidle" can hang, so wait for the DOM + a render beat.
await page.goto(SB, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

// Capture the catalog landing — the collections overview (titles + temporal extents). It's the
// cleanest "logbook" shot AND sidesteps FU-2: drilling into a collection would show item tiles whose
// thumbnails render blank (asset hrefs are s3://, unreachable by a client browser). The collections
// overview communicates "a queryable record of what landed" without any blank previews.
await page.screenshot({ path: OUT });
await browser.close();
console.log(`wrote ${OUT}`);
