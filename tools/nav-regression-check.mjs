#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const htmlFiles = readdirSync(cwd).filter((name) => name.endsWith('.html')).sort();
const sharedLayoutPath = path.join(cwd, 'js', 'shared-layout.js');

const issues = [];

const allowedDataPages = new Set([
  'index',
  'plan',
  'itinerary',
  'decks',
  'dining',
  'rooms',
  'operations',
  'tips',
  'photos',
  'contacts',
  'offline',
  'ports',
]);

for (const file of htmlFiles) {
  const fullPath = path.join(cwd, file);
  const content = readFileSync(fullPath, 'utf8');

  if (!/src="js\/shared-layout\.js\?v=\d+"/i.test(content) && !/src="js\/shared-layout\.js"/i.test(content)) {
    issues.push(`${file}: missing shared-layout.js include`);
  }

  const headerMatch = content.match(/<div\s+id="sharedHeader"([^>]*)>/i);
  if (!headerMatch) {
    issues.push(`${file}: missing #sharedHeader mount`);
  } else {
    const attrs = headerMatch[1] || '';
    const pageMatch = attrs.match(/data-page="([^"]+)"/i);
    if (!pageMatch) {
      issues.push(`${file}: #sharedHeader missing data-page`);
    } else if (!allowedDataPages.has(pageMatch[1])) {
      issues.push(`${file}: #sharedHeader data-page "${pageMatch[1]}" is not in allowed set`);
    }
  }
}

const sharedLayout = readFileSync(sharedLayoutPath, 'utf8');

const requiredSharedLayoutTokens = [
  '#moreDrawer',
  '#moreDrawerBackdrop',
  '#moreDrawerClose',
  '#headerMoreButton',
  'data-bottom-action="open-more-drawer"',
  'data-nav="',
  "navKey: 'home'",
  "navKey: 'plan'",
  "navKey: 'today'",
  "navKey: 'map'",
  "navKey: 'food'",
  "navKey: 'family'",
];

for (const token of requiredSharedLayoutTokens) {
  if (!sharedLayout.includes(token)) {
    issues.push(`js/shared-layout.js: missing required nav token: ${token}`);
  }
}

const itineraryPath = path.join(cwd, 'itinerary.html');
const itinerary = readFileSync(itineraryPath, 'utf8');
if (!itinerary.includes("window.location.hash === '#today'")) {
  issues.push('itinerary.html: missing #today deep-link handling logic');
}
if (!/class="[^"]*day-btn[^"]*"[^>]*data-day="1"/i.test(itinerary)) {
  issues.push('itinerary.html: day selector buttons not detected');
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
