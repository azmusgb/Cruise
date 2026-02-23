#!/usr/bin/env node
import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();

function pageUrl(file) {
  return pathToFileURL(path.join(root, file)).toString();
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1366, height: 900 },
});

try {
  {
    const page = await context.newPage();
    await page.goto(pageUrl("rooms.html"), { waitUntil: "load" });
    await page.fill("#roomSearchInput", "6650");
    await page.waitForTimeout(250);
    const visibleCards = await page
      .locator("#focusGrid .room-card:not([hidden])")
      .count();
    if (visibleCards < 1)
      throw new Error(
        "find room flow failed: no visible room card after search",
      );
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(pageUrl("dining.html"), { waitUntil: "load" });
    await page.click('button[data-filter="specialty"]');
    await page.waitForTimeout(250);
    const hiddenMismatch = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll(".deck-card[data-venue-type]"),
      );
      return cards.some(
        (card) =>
          !card.hidden && card.getAttribute("data-venue-type") !== "specialty",
      );
    });
    if (hiddenMismatch)
      throw new Error(
        "filter dining flow failed: non-specialty card remained visible",
      );
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(`${pageUrl("itinerary.html")}#today`, {
      waitUntil: "load",
    });
    await page.click('.day-btn[data-day="3"]');
    await page.waitForTimeout(200);
    const ok = await page.evaluate(() => {
      const target = document.querySelector('.itinerary-day[data-day="3"]');
      return !!target && !target.classList.contains("is-collapsed");
    });
    if (!ok)
      throw new Error("toggle itinerary day flow failed: day 3 did not expand");
    await page.close();
  }

  {
    const page = await context.newPage();
    await page.goto(pageUrl("operations.html"), { waitUntil: "load" });
    await page.evaluate(() =>
      localStorage.removeItem("operations-completed-v1"),
    );
    const first = page.locator("#tasks .deck-card .task-checkbox").first();
    await first.check();
    await page.waitForTimeout(150);
    const completed = await page
      .locator("#tasks .deck-card.is-complete")
      .count();
    if (completed < 1)
      throw new Error(
        "complete checklist flow failed: card did not enter complete state",
      );
    await page.close();
  }

  console.log(
    "OK: UX critical flows passed (rooms, dining, itinerary, operations).",
  );
} finally {
  await context.close();
  await browser.close();
}
