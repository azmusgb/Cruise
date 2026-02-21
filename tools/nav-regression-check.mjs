#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const htmlFiles = readdirSync(cwd).filter((name) => name.endsWith('.html')).sort();
const sharedLayoutPath = path.join(cwd, 'js', 'shared-layout.js');
const itineraryModulePath = path.join(cwd, 'js', 'modules', 'itinerary.js');

const issues = [];

const expectedSharedLayoutPages = new Set([
  'contacts.html',
  'decks.html',
  'dining.html',
  'itinerary.html',
  'offline.html',
  'operations.html',
  'photos.html',
  'plan.html',
  'ports.html',
  'rooms.html',
  'tips.html',
]);

const expectedSharedHeaderPages = new Map([
  ['offline.html', 'offline'],
  ['ports.html', 'ports'],
  ['tips.html', 'tips'],
]);

for (const file of htmlFiles) {
  const content = readFileSync(path.join(cwd, file), 'utf8');
  const hasSharedLayout = /src="js\/shared-layout\.js"/i.test(content);
  const shouldIncludeSharedLayout = expectedSharedLayoutPages.has(file);

  if (shouldIncludeSharedLayout && !hasSharedLayout) {
    issues.push(`${file}: missing shared-layout.js include`);
  }

  if (!shouldIncludeSharedLayout && hasSharedLayout) {
    issues.push(`${file}: unexpected shared-layout.js include`);
  }

  const headerMatch = content.match(/<div\s+id="sharedHeader"([^>]*)>/i);
  const expectedDataPage = expectedSharedHeaderPages.get(file);

  if (expectedDataPage && !headerMatch) {
    issues.push(`${file}: missing #sharedHeader mount`);
    continue;
  }

  if (!expectedDataPage && headerMatch) {
    issues.push(`${file}: unexpected #sharedHeader mount`);
    continue;
  }

  if (!expectedDataPage || !headerMatch) {
    continue;
  }

  const attrs = headerMatch[1] || '';
  const pageMatch = attrs.match(/data-page="([^"]+)"/i);
  if (!pageMatch) {
    issues.push(`${file}: #sharedHeader missing data-page`);
    continue;
  }

  if (pageMatch[1] !== expectedDataPage) {
    issues.push(
      `${file}: #sharedHeader data-page "${pageMatch[1]}" does not match expected "${expectedDataPage}"`
    );
  }
}

const sharedLayout = readFileSync(sharedLayoutPath, 'utf8');
for (const token of [
  'function injectHeader()',
  "document.getElementById('sharedHeader')",
  "container.dataset.loaded = 'true'",
  'container.innerHTML = `',
  "document.addEventListener('DOMContentLoaded', injectHeader)",
]) {
  if (!sharedLayout.includes(token)) {
    issues.push(`js/shared-layout.js: missing required token: ${token}`);
  }
}

const itineraryHtml = readFileSync(path.join(cwd, 'itinerary.html'), 'utf8');
for (const token of ['id="today"', 'id="todayBtn"', 'id="timeline"', 'src="js/modules/itinerary.js"']) {
  if (!itineraryHtml.includes(token)) {
    issues.push(`itinerary.html: missing required token ${token}`);
  }
}

const itineraryModule = readFileSync(itineraryModulePath, 'utf8');
for (const token of ["const timeline = $('#timeline');", "const todayBtn = $('#todayBtn');", "todayBtn.addEventListener('click'"]) {
  if (!itineraryModule.includes(token)) {
    issues.push(`js/modules/itinerary.js: missing itinerary wiring token: ${token}`);
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
