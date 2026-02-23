#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { webkit, devices } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const rootDir = process.cwd();
const reportsDir = path.join(rootDir, 'reports', 'visual');
const baselineDir = path.join(rootDir, 'tests', 'visual-baseline');
const diffThreshold = Number(process.env.QA_VISUAL_DIFF_THRESHOLD || 0.015);
const caseThresholds = new Map([
  ['itinerary-today-iphone.png', 0.02],
]);
const updateBaseline = process.argv.includes('--update-baseline');
const fixedTime = process.env.QA_FIXED_TIME || '2026-02-20T15:00:00.000Z';

const snapshotCases = [
  {
    name: 'more-drawer-iphone.png',
    page: 'index.html',
    setup: async (page) => {
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, 900));
      await page.waitForTimeout(120);

      const moreButton = page.locator('#moreBtnMobile, [data-bottom-action="open-more-drawer"]').first();
      await moreButton.click();
      await page.waitForSelector('#moreDrawer.is-open', { state: 'visible' });
      await page.waitForTimeout(180);

      const lockedY = await page.evaluate(() => window.scrollY);
      const touchmoveBlocked = await page.evaluate(() => {
        const event = new Event('touchmove', { bubbles: true, cancelable: true });
        const notCancelled = document.body.dispatchEvent(event);
        return notCancelled === false;
      });
      const afterY = await page.evaluate(() => window.scrollY);
      if (!touchmoveBlocked || Math.abs(afterY - lockedY) > 2) {
        throw new Error(
          `Scroll lock failed while drawer open: touchmoveBlocked=${touchmoveBlocked}, locked=${lockedY}, after=${afterY}`,
        );
      }
      console.log('OK: mobile More drawer scroll lock verified');
    },
    teardown: async (page) => {
      await page.keyboard.press('Escape');
      await page.waitForSelector('#moreDrawer', { state: 'hidden' });
      console.log('OK: mobile More drawer close verified');
    },
  },
  {
    name: 'itinerary-today-iphone.png',
    page: 'itinerary.html#today',
    setup: async (page) => {
      await page.waitForSelector('#today-card', { state: 'visible', timeout: 5000 });
      await page.waitForTimeout(450);
      const todayBadgeExists = await page.locator('#today-card .badge--today').count();
      if (!todayBadgeExists) {
        throw new Error('Today badge not found on #today-card.');
      }
      console.log('OK: itinerary #today target and badge verified');
    },
  },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readPng(filePath) {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function compareSnapshots(baselinePath, currentPath, diffPath, snapshotName) {
  const baseline = readPng(baselinePath);
  const current = readPng(currentPath);

  if (baseline.width !== current.width || baseline.height !== current.height) {
    throw new Error(
      `Snapshot size mismatch. baseline=${baseline.width}x${baseline.height}, current=${current.width}x${current.height}`,
    );
  }

  const diff = new PNG({ width: baseline.width, height: baseline.height });
  const mismatchedPixels = pixelmatch(
    baseline.data,
    current.data,
    diff.data,
    baseline.width,
    baseline.height,
    { threshold: 0.12 },
  );

  const ratio = mismatchedPixels / (baseline.width * baseline.height);
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const allowed = caseThresholds.get(snapshotName) ?? diffThreshold;
  if (ratio > allowed) {
    throw new Error(
      `Visual diff ratio ${ratio.toFixed(4)} exceeded threshold ${allowed}. See ${path.relative(rootDir, diffPath)}`,
    );
  }

  console.log(`OK: visual snapshot diff ${ratio.toFixed(4)} within threshold ${allowed}`);
}

async function runCase(browser, testCase) {
  const [pageFile, pageHash] = String(testCase.page).split('#');
  const pageUrl = `${pathToFileURL(path.join(rootDir, pageFile)).toString()}${pageHash ? `#${pageHash}` : ''}`;
  const currentSnapshotPath = path.join(reportsDir, testCase.name);
  const baselineSnapshotPath = path.join(baselineDir, testCase.name);
  const diffSnapshotPath = path.join(reportsDir, `diff-${testCase.name}`);

  const context = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
  });
  await context.addInitScript(({ nowIso }) => {
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
  const page = await context.newPage();
  await page.goto(pageUrl, { waitUntil: 'load' });
  try {
    await page.waitForFunction(
      () => !document.fonts || document.fonts.status === 'loaded',
      { timeout: 5000 },
    );
  } catch (_error) {
    // Continue if font readiness cannot be observed in this browser context.
  }
  await page.waitForTimeout(120);

  if (typeof testCase.setup === 'function') {
    await testCase.setup(page);
  }

  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
  await page.waitForTimeout(60);

  await page.screenshot({ path: currentSnapshotPath, fullPage: false });
  console.log(`Saved snapshot: ${path.relative(rootDir, currentSnapshotPath)}`);

  if (updateBaseline) {
    fs.copyFileSync(currentSnapshotPath, baselineSnapshotPath);
    console.log(`Baseline updated: ${path.relative(rootDir, baselineSnapshotPath)}`);
  } else {
    if (!fs.existsSync(baselineSnapshotPath)) {
      throw new Error(
        `Missing baseline snapshot ${path.relative(rootDir, baselineSnapshotPath)}. Run with --update-baseline locally.`,
      );
    }
    compareSnapshots(baselineSnapshotPath, currentSnapshotPath, diffSnapshotPath, testCase.name);
  }

  if (typeof testCase.teardown === 'function') {
    await testCase.teardown(page);
  }

  await context.close();
}

async function run() {
  ensureDir(reportsDir);
  ensureDir(baselineDir);

  const browser = await webkit.launch({ headless: true });
  try {
    for (const testCase of snapshotCases) {
      console.log(`\nRunning mobile visual case: ${testCase.name}`);
      await runCase(browser, testCase);
    }
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(`QA failed: ${error.message}`);
  process.exit(1);
});
