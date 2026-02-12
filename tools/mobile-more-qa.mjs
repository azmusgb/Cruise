#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { webkit, devices } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const rootDir = process.cwd();
const pageFileUrl = pathToFileURL(path.join(rootDir, 'index.html')).toString();
const reportsDir = path.join(rootDir, 'reports', 'visual');
const baselineDir = path.join(rootDir, 'tests', 'visual-baseline');
const snapshotName = 'more-drawer-iphone.png';
const currentSnapshotPath = path.join(reportsDir, snapshotName);
const baselineSnapshotPath = path.join(baselineDir, snapshotName);
const diffSnapshotPath = path.join(reportsDir, 'diff-' + snapshotName);
const diffThreshold = Number(process.env.QA_VISUAL_DIFF_THRESHOLD || 0.015);
const updateBaseline = process.argv.includes('--update-baseline');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function compareSnapshots() {
  const baseline = PNG.sync.read(fs.readFileSync(baselineSnapshotPath));
  const current = PNG.sync.read(fs.readFileSync(currentSnapshotPath));

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
  fs.writeFileSync(diffSnapshotPath, PNG.sync.write(diff));

  if (ratio > diffThreshold) {
    throw new Error(
      `Visual diff ratio ${ratio.toFixed(4)} exceeded threshold ${diffThreshold}. See ${path.relative(rootDir, diffSnapshotPath)}`,
    );
  }

  console.log(`OK: visual snapshot diff ${ratio.toFixed(4)} within threshold ${diffThreshold}`);
}

async function run() {
  ensureDir(reportsDir);
  ensureDir(baselineDir);

  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 390, height: 844 },
  });

  const page = await context.newPage();
  await page.goto(pageFileUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(100);
  const beforeY = await page.evaluate(() => window.scrollY);

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
      `Background scroll lock failed while drawer open: touchmoveBlocked=${touchmoveBlocked}, before=${beforeY}, locked=${lockedY}, after=${afterY}`,
    );
  }
  console.log('OK: mobile More drawer scroll lock verified');

  await page.screenshot({ path: currentSnapshotPath, fullPage: false });
  console.log(`Saved snapshot: ${path.relative(rootDir, currentSnapshotPath)}`);

  if (updateBaseline || !fs.existsSync(baselineSnapshotPath)) {
    fs.copyFileSync(currentSnapshotPath, baselineSnapshotPath);
    console.log(`Baseline ${updateBaseline ? 'updated' : 'created'}: ${path.relative(rootDir, baselineSnapshotPath)}`);
  } else {
    compareSnapshots();
  }

  await page.keyboard.press('Escape');
  await page.waitForSelector('#moreDrawer', { state: 'hidden' });
  console.log('OK: mobile More drawer close verified');

  await context.close();
  await browser.close();
}

run().catch((error) => {
  console.error(`QA failed: ${error.message}`);
  process.exit(1);
});
