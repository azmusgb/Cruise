#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const htmlFiles = readdirSync(cwd).filter((name) => name.endsWith('.html')).sort();
const sharedLayoutPath = path.join(cwd, 'js', 'shared-layout.js');
const itineraryModulePath = path.join(cwd, 'js', 'modules', 'itinerary.js');

const issues = [];

const pagesWithoutSharedLayout = new Set(['deck-debug.html', 'index.html']);
const allowedDataPages = new Set(['offline', 'ports', 'tips']);

const expectedSharedHeaderPages = new Map([
  ['offline.html', 'offline'],
  ['ports.html', 'ports'],
  ['tips.html', 'tips'],
]);

const sharedLayoutScriptPattern = /<script[^>]+src=["']js\/shared-layout\.js["'][^>]*>/i;
const sharedHeaderMountPattern = /<[^>]+id=["']sharedHeader["']([^>]*)>/i;
const dataPagePattern = /\sdata-page=["']([^"']+)["']/i;

for (const file of htmlFiles) {
  const content = readFileSync(path.join(cwd, file), 'utf8');
  const hasSharedLayout = /src="js\/shared-layout\.js"/i.test(content);
  const shouldIncludeSharedLayout = expectedSharedLayoutPages.has(file);

  const hasSharedLayout = /src="js\/shared-layout\.js"/i.test(content);
  if (!hasSharedLayout && !pagesWithoutSharedLayout.has(file)) {
    issues.push(`${file}: missing shared-layout.js include`);
  }

  if (!shouldIncludeSharedLayout && hasSharedLayout) {
    issues.push(`${file}: unexpected shared-layout.js include`);
  }

  const headerMatch = content.match(/<div\s+id="sharedHeader"([^>]*)>/i);
  if (!headerMatch) continue;

  const attrs = headerMatch[1] || '';
  const pageMatch = attrs.match(/data-page="([^"]+)"/i);
  if (!pageMatch) {
    issues.push(`${file}: #sharedHeader missing data-page`);
    continue;
  }

  if (!allowedDataPages.has(pageMatch[1])) {
    issues.push(`${file}: #sharedHeader data-page "${pageMatch[1]}" is not in allowed set`);
  }
}

const sharedLayout = readFileSync(sharedLayoutPath, 'utf8');
const requiredSharedLayoutTokens = [
  "document.getElementById('sharedHeader')",
  "container.dataset.loaded = 'true'",
  'document.addEventListener(\'DOMContentLoaded\', injectHeader)',
  'class="app-header--minimal"',
];

for (const token of requiredSharedLayoutTokens) {
  if (!sharedLayout.includes(token)) {
    issues.push(`js/shared-layout.js: missing required token: ${token}`);
  }
}

const itineraryPath = path.join(cwd, 'itinerary.html');
const itinerary = readFileSync(itineraryPath, 'utf8');
const itineraryTokens = [
  'id="todayBtn"',
  'id="timeline"',
  'src="js/modules/itinerary.js"',
  'class="bottom-nav"',
];

for (const token of itineraryTokens) {
  if (!itinerary.includes(token)) {
    issues.push(`itinerary.html: missing required token ${token}`);
  }
}

if (!issues.length) {
  console.log(`OK: nav regression checks passed across ${htmlFiles.length} HTML files.`);
  process.exit(0);
}

console.error('Navigation regression check failed:\n');
for (const issue of issues) {
  console.error(`- ${issue}`);
}
process.exit(1);
