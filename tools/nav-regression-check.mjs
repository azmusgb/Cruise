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

const sharedLayoutScriptPattern = /<script[^>]+src=["']js\/shared-layout\.js["'][^>]*>/i;
const sharedHeaderMountPattern = /<[^>]+id=["']sharedHeader["']([^>]*)>/i;
const dataPagePattern = /\sdata-page=["']([^"']+)["']/i;

for (const file of htmlFiles) {
  const content = readFileSync(path.join(cwd, file), 'utf8');
  const hasSharedLayout = sharedLayoutScriptPattern.test(content);
  const shouldIncludeSharedLayout = expectedSharedLayoutPages.has(file);

  if (shouldIncludeSharedLayout && !hasSharedLayout) {
    issues.push(`${file}: missing shared-layout.js include`);
  }

  if (!shouldIncludeSharedLayout && hasSharedLayout) {
    issues.push(`${file}: unexpected shared-layout.js include`);
  }

  const headerMatch = content.match(sharedHeaderMountPattern);
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
  const pageMatch = attrs.match(dataPagePattern);
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
const sharedLayoutContracts = [
  {
    label: 'injectHeader function definition',
    test: /function\s+injectHeader\s*\(/,
  },
  {
    label: 'sharedHeader mount lookup',
    test: /getElementById\(\s*["']sharedHeader["']\s*\)/,
  },
  {
    label: 'loaded guard',
    test: /dataset\.loaded\s*=\s*["']true["']/,
  },
  {
    label: 'header HTML injection',
    test: /container\.innerHTML\s*=\s*`/,
  },
  {
    label: 'DOMContentLoaded injector hook',
    test: /addEventListener\(\s*["']DOMContentLoaded["']\s*,\s*injectHeader\s*\)/,
  },
];

for (const contract of sharedLayoutContracts) {
  if (!contract.test.test(sharedLayout)) {
    issues.push(`js/shared-layout.js: missing required contract: ${contract.label}`);
  }
}

const itineraryHtml = readFileSync(path.join(cwd, 'itinerary.html'), 'utf8');
for (const token of ['id="today"', 'id="todayBtn"', 'id="timeline"', 'src="js/modules/itinerary.js"']) {
  if (!itineraryHtml.includes(token)) {
    issues.push(`itinerary.html: missing required token ${token}`);
  }
}

const itineraryModule = readFileSync(itineraryModulePath, 'utf8');
const itineraryContracts = [
  {
    label: 'timeline DOM lookup',
    test: /const\s+timeline\s*=\s*\$\(\s*["']#timeline["']\s*\)\s*;/,
  },
  {
    label: 'today button DOM lookup',
    test: /const\s+todayBtn\s*=\s*\$\(\s*["']#todayBtn["']\s*\)\s*;/,
  },
  {
    label: 'today button click handler',
    test: /todayBtn\.addEventListener\(\s*["']click["']/,
  },
];

for (const contract of itineraryContracts) {
  if (!contract.test.test(itineraryModule)) {
    issues.push(`js/modules/itinerary.js: missing itinerary wiring contract: ${contract.label}`);
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
