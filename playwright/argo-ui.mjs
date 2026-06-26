// Playwright capture — Argo UI still for the deck (rung-1 "a place to look" slide). A real
// screenshot of the workflow list/graph so first-timers who've never opened Argo recognise the UI.
// Maintainer-run (needs the cluster); same pattern as argo-clip-rung1.mjs.
//
// Prereqs: `make up` + `make ui` (https://localhost:2746, self-signed cert) and a prior
// `make demo`/clip so there's a workflow to show — ideally one with a failed→retried step.
// Playwright chromium: `npx playwright install chromium`.
// Run: node docs/slides/playwright/argo-ui.mjs   → docs/slides/argo-ui-still.png
import { chromium } from "playwright";

const ARGO = process.env.ARGO_UI || "https://localhost:2746";
const OUT = "docs/slides/argo-ui-still.png";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  ignoreHTTPSErrors: true, // argo-server uses a self-signed cert (local demo)
  viewport: { width: 1280, height: 800 },
});
const page = await ctx.newPage();
// NB: the Argo UI keeps live connections open, so "networkidle" never settles — wait for the DOM,
// then give the SPA a moment to render the workflow list/graph.
await page.goto(`${ARGO}/workflows/eo`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(5000);

// Dismiss Argo's first-run "Tell us what you want to use Argo for" survey modal if it pops (it
// otherwise covers the whole list). Try a few close strategies; ignore if none apply.
for (const close of [
  () => page.getByText("×", { exact: true }).first().click({ timeout: 1500 }),
  () => page.locator("i.fa-times, .fa-times, [class*='close']").first().click({ timeout: 1500 }),
  () => page.keyboard.press("Escape"),
]) {
  try {
    await close();
    await page.waitForTimeout(600);
    break; // stop at the first strategy that works
  } catch {
    /* try the next strategy */
  }
}

// Open a workflow that shows a failed→retried step (rung1) so the graph matches the slide caption;
// fall back to the newest workflow, then to the list view — each is a recognisable "this is Argo" shot.
try {
  await page.getByText(/rung1-ingest/).first().click({ timeout: 4000 });
  await page.waitForTimeout(3000);
} catch {
  try {
    await page.locator("a[href*='/workflows/eo/']").first().click({ timeout: 3000 });
    await page.waitForTimeout(3000);
  } catch {
    /* keep the list view */
  }
}

await page.screenshot({ path: OUT });
await browser.close();
console.log(`wrote ${OUT}`);
