#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, devices } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const root = process.cwd();
const baselineDir = path.join(root, "tests", "visual-baseline-core");
const currentDir = path.join(root, "reports", "visual-core");
const diffDir = path.join(root, "reports", "visual-core-diff");
const updateBaseline = process.argv.includes("--update-baseline");
const threshold = Number(process.env.QA_VISUAL_DIFF_THRESHOLD || 0.03);
const fixedTime = process.env.QA_FIXED_TIME || "2026-02-20T15:00:00.000Z";

const cases = [
  { name: "index-desktop.png", file: "index.html", device: null },
  { name: "itinerary-desktop.png", file: "itinerary.html#today", device: null },
  { name: "decks-mobile.png", file: "decks.html", device: "iPhone 13" },
  { name: "rooms-mobile.png", file: "rooms.html", device: "iPhone 13" },
  { name: "index-mobile.png", file: "index.html", device: "iPhone 13" },
  {
    name: "itinerary-mobile.png",
    file: "itinerary.html#today",
    device: "iPhone 13",
  },
  { name: "decks-desktop.png", file: "decks.html", device: null },
  { name: "rooms-desktop.png", file: "rooms.html", device: null },
];

const caseThresholds = new Map([["decks-mobile.png", 0.06]]);

for (const dir of [baselineDir, currentDir, diffDir])
  fs.mkdirSync(dir, { recursive: true });

function readPng(fp) {
  return PNG.sync.read(fs.readFileSync(fp));
}

function compare(basePath, currentPath, diffPath) {
  const base = readPng(basePath);
  const current = readPng(currentPath);
  if (base.width !== current.width || base.height !== current.height) {
    throw new Error(
      `size mismatch ${path.basename(basePath)} (${base.width}x${base.height}) vs current (${current.width}x${current.height})`,
    );
  }
  const diff = new PNG({ width: base.width, height: base.height });
  const mismatch = pixelmatch(
    base.data,
    current.data,
    diff.data,
    base.width,
    base.height,
    { threshold: 0.12 },
  );
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  return mismatch / (base.width * base.height);
}

const browser = await chromium.launch({ headless: true });
try {
  for (const c of cases) {
    const ctx = await browser.newContext(
      c.device
        ? { ...devices[c.device], viewport: { width: 390, height: 844 } }
        : { viewport: { width: 1440, height: 960 } },
    );
    await ctx.addInitScript(({ nowIso }) => {
      const fixedNow = new Date(nowIso).valueOf();
      const NativeDate = Date;
      class FixedDate extends NativeDate {
        constructor(...args) {
          if (args.length === 0) {
            super(fixedNow);
            return;
          }
          super(...args);
        }
        static now() {
          return fixedNow;
        }
      }
      FixedDate.UTC = NativeDate.UTC;
      FixedDate.parse = NativeDate.parse;
      window.Date = FixedDate;
    }, { nowIso: fixedTime });
    const page = await ctx.newPage();
    const [file, hash] = c.file.split("#");
    const url = `${pathToFileURL(path.join(root, file)).toString()}${hash ? `#${hash}` : ""}`;
    await page.goto(url, { waitUntil: "load" });
    try {
      await page.waitForFunction(
        () => Array.from(document.images).every((img) => img.complete),
        { timeout: 5000 },
      );
    } catch (_error) {
      // Continue even if a late image never settles.
    }
    try {
      await page.waitForFunction(
        () => !document.fonts || document.fonts.status === "loaded",
        { timeout: 5000 },
      );
    } catch (_error) {
      // Continue even if font readiness cannot be observed.
    }
    await page.waitForTimeout(900);
    await page.addStyleTag({
      content: "*{animation:none !important;transition:none !important;}",
    });

    const currentPath = path.join(currentDir, c.name);
    const baselinePath = path.join(baselineDir, c.name);
    const diffPath = path.join(diffDir, `diff-${c.name}`);
    await page.screenshot({ path: currentPath, fullPage: false });

    if (updateBaseline) {
      fs.copyFileSync(currentPath, baselinePath);
      console.log(`Baseline updated: ${path.relative(root, baselinePath)}`);
    } else {
      if (!fs.existsSync(baselinePath)) {
        throw new Error(
          `missing baseline ${path.relative(root, baselinePath)} (run with --update-baseline)`,
        );
      }
      const ratio = compare(baselinePath, currentPath, diffPath);
      const allowed = caseThresholds.get(c.name) ?? threshold;
      if (ratio > allowed) {
        throw new Error(
          `visual diff ${c.name} ratio ${ratio.toFixed(4)} > ${allowed}`,
        );
      }
      console.log(`OK: ${c.name} diff ${ratio.toFixed(4)}`);
    }

    await ctx.close();
  }

  console.log(`OK: visual core QA passed (${cases.length} snapshots).`);
} finally {
  await browser.close();
}
