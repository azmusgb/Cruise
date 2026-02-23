#!/usr/bin/env node
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const pages = ["index.html", "itinerary.html", "decks.html", "rooms.html"];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
});
const violations = [];

for (const file of pages) {
  const page = await context.newPage();
  const url = pathToFileURL(path.join(root, file)).toString();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(400);

  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    // Color contrast is audited separately in design review due gradient/image overlays.
    .disableRules(["color-contrast"])
    .analyze();
  if (result.violations.length) {
    violations.push({ file, violations: result.violations });
  }

  await page.close();
}

await context.close();
await browser.close();

if (!violations.length) {
  console.log(`OK: accessibility smoke passed on ${pages.length} pages.`);
  process.exit(0);
}

console.error("Accessibility smoke failed:\n");
for (const pageResult of violations) {
  console.error(`- ${pageResult.file}`);
  for (const v of pageResult.violations) {
    console.error(`  - [${v.id}] ${v.help} (${v.nodes.length} nodes)`);
  }
}
process.exit(1);
