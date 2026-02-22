#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const htmlFiles = readdirSync(cwd)
  .filter((name) => name.endsWith('.html'))
  .sort((a, b) => a.localeCompare(b));

const sharedLayoutPath = path.join(cwd, 'js', 'shared-layout.js');
const excludedPages = new Set(['deck-debug.html']);
const issues = [];

const sharedLayoutScriptPattern = /<script[^>]+src=["']js\/shared-layout\.js(?:\?[^"']*)?["'][^>]*>/i;

function getMountAttrs(content, id) {
  const match = content.match(new RegExp(`<[^>]+id=["']${id}["']([^>]*)>`, 'i'));
  return match ? match[1] || '' : null;
}

function getDataPage(attrs) {
  if (!attrs) return null;
  const match = attrs.match(/\sdata-page=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

for (const file of htmlFiles) {
  const pageName = file.replace(/\.html$/i, '');
  const content = readFileSync(path.join(cwd, file), 'utf8');

  if (excludedPages.has(file)) {
    continue;
  }

  if (!sharedLayoutScriptPattern.test(content)) {
    issues.push(`${file}: missing shared-layout.js include`);
  }

  const headerAttrs = getMountAttrs(content, 'sharedHeader');
  if (headerAttrs == null) {
    issues.push(`${file}: missing #sharedHeader mount`);
  } else {
    const dataPage = getDataPage(headerAttrs);
    if (!dataPage) {
      issues.push(`${file}: #sharedHeader missing data-page`);
    } else if (dataPage !== pageName) {
      issues.push(`${file}: #sharedHeader data-page "${dataPage}" does not match page "${pageName}"`);
    }
  }

  for (const mountId of ['sharedFooter', 'sharedBottomNav']) {
    const attrs = getMountAttrs(content, mountId);
    if (attrs == null) continue;
    const dataPage = getDataPage(attrs);
    if (dataPage && dataPage !== pageName) {
      issues.push(`${file}: #${mountId} data-page "${dataPage}" does not match page "${pageName}"`);
    }
  }
}

if (!existsSync(sharedLayoutPath)) {
  issues.push('js/shared-layout.js: file missing');
} else {
  const sharedLayout = readFileSync(sharedLayoutPath, 'utf8');
  const requiredSharedLayoutTokens = [
    "safeMount('#sharedHeader'",
    "safeMount('#sharedFooter'",
    "safeMount('#sharedBottomNav'",
    'const NAV_ITEMS = [',
    'const BOTTOM_NAV_ITEMS = [',
  ];

  for (const token of requiredSharedLayoutTokens) {
    if (!sharedLayout.includes(token)) {
      issues.push(`js/shared-layout.js: missing required token ${token}`);
    }
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
