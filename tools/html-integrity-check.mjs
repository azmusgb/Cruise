#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const htmlFiles = readdirSync(cwd)
  .filter((name) => name.endsWith('.html'))
  .sort();

function listHtmlFiles(dir) {
  return htmlFiles.map((file) => path.join(dir, file));
}

function extractIds(content) {
  return [...content.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map((match) => match[1]);
}

function extractHrefs(content) {
  return [...content.matchAll(/href\s*=\s*"([^"]+)"/g)].map((match) => match[1]);
}

function isExternal(href) {
  return /^(https?:|mailto:|tel:|javascript:)/i.test(href);
}

const idMap = new Map();
const duplicateIds = [];
const missingFiles = [];
const missingAnchors = [];

for (const file of listHtmlFiles(cwd)) {
  const content = readFileSync(file, 'utf8');
  const ids = extractIds(content);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) duplicateIds.push(`${path.basename(file)}: duplicate id "${id}"`);
    seen.add(id);
  }
  idMap.set(path.basename(file), new Set(ids));
}

for (const file of listHtmlFiles(cwd)) {
  const content = readFileSync(file, 'utf8');
  const hrefs = extractHrefs(content);
  for (const href of hrefs) {
    if (!href || href.startsWith('#') || isExternal(href)) continue;

    const [targetRaw, anchor] = href.split('#');
    const target = (targetRaw || '').split('?')[0];
    if (!target) continue;

    if (target.endsWith('.html')) {
      const fullTarget = path.join(cwd, target);
      if (!idMap.has(target) || !statSync(fullTarget).isFile()) {
        missingFiles.push(`${path.basename(file)}: target file missing "${target}" (from "${href}")`);
        continue;
      }
      if (anchor && !idMap.get(target)?.has(anchor)) {
        missingAnchors.push(`${path.basename(file)}: missing id "#${anchor}" in "${target}" (from "${href}")`);
      }
    }
  }
}

const allIssues = [...duplicateIds, ...missingFiles, ...missingAnchors];

if (allIssues.length === 0) {
  console.log(`OK: ${htmlFiles.length} HTML files passed integrity checks.`);
  process.exit(0);
}

console.error('HTML integrity check failed:\n');
for (const issue of allIssues) {
  console.error(`- ${issue}`);
}
process.exit(1);
