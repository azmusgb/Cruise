#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const skippedDirs = new Set(['.git', 'node_modules']);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function listFilesRecursive(dir, extension) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skippedDirs.has(entry.name)) continue;
      files.push(...listFilesRecursive(path.join(dir, entry.name), extension));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(path.join(dir, entry.name));
    }
  }

  return files;
}

const allHtmlFiles = listFilesRecursive(cwd, '.html').sort((a, b) => a.localeCompare(b));
const allJsFiles = listFilesRecursive(cwd, '.js').sort((a, b) => a.localeCompare(b));
const rootHtmlFiles = readdirSync(cwd)
  .filter((name) => name.endsWith('.html'))
  .map((name) => path.join(cwd, name))
  .sort((a, b) => a.localeCompare(b));

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
const missingViewport = [];
const missingMobileFirstStylesheet = [];
const missingEmbeddedHtmlViewport = [];
const missingEmbeddedHtmlMobileFirstStylesheet = [];
const disallowedInlineCssInEmbeddedHtml = [];

for (const file of allHtmlFiles) {
  const content = readFileSync(file, 'utf8');
  const relativeFile = toPosixPath(path.relative(cwd, file));

  if (!/<meta[^>]+name=["']viewport["']/i.test(content)) {
    missingViewport.push(`${relativeFile}: missing viewport meta tag`);
  }

  if (!/href=["'][^"']*css\/mobile-first\.css["']/i.test(content)) {
    missingMobileFirstStylesheet.push(`${relativeFile}: missing mobile-first stylesheet include`);
  }
}

for (const file of allJsFiles) {
  const content = readFileSync(file, 'utf8');
  const relativeFile = toPosixPath(path.relative(cwd, file));
  const hasEmbeddedHtml = /<(?:div|span|header|section|article|main|nav|button|p|a|ul|li|h[1-6])\b/i.test(content);

  if (hasEmbeddedHtml && (/<style\b/i.test(content) || /<[^>\n]*\sstyle\s*=/i.test(content))) {
    disallowedInlineCssInEmbeddedHtml.push(`${relativeFile}: embedded HTML should avoid inline CSS/style attributes`);
  }

  if (!/<!DOCTYPE html>/i.test(content)) continue;

  if (!/<meta[^>]+name=["']viewport["']/i.test(content)) {
    missingEmbeddedHtmlViewport.push(`${relativeFile}: embedded HTML missing viewport meta tag`);
  }

  if (!/mobile-first\.css/i.test(content)) {
    missingEmbeddedHtmlMobileFirstStylesheet.push(
      `${relativeFile}: embedded HTML missing mobile-first stylesheet include`
    );
  }
}

for (const file of rootHtmlFiles) {
  const content = readFileSync(file, 'utf8');
  const relativeFile = toPosixPath(path.relative(cwd, file));
  const ids = extractIds(content);
  const seen = new Set();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicateIds.push(`${relativeFile}: duplicate id "${id}"`);
    }
    seen.add(id);
  }

  idMap.set(relativeFile, new Set(ids));
}

for (const file of rootHtmlFiles) {
  const content = readFileSync(file, 'utf8');
  const hrefs = extractHrefs(content);
  const relativeFile = toPosixPath(path.relative(cwd, file));

  for (const href of hrefs) {
    if (!href || href.startsWith('#') || isExternal(href)) continue;

    const [targetRaw, anchor] = href.split('#');
    const target = (targetRaw || '').split('?')[0];
    if (!target || !target.endsWith('.html')) continue;

    const fullTarget = path.resolve(cwd, target);
    const relativeTarget = toPosixPath(path.relative(cwd, fullTarget));

    if (!idMap.has(relativeTarget) || !statSync(fullTarget).isFile()) {
      missingFiles.push(`${relativeFile}: target file missing "${relativeTarget}" (from "${href}")`);
      continue;
    }

    if (anchor && !idMap.get(relativeTarget)?.has(anchor)) {
      missingAnchors.push(`${relativeFile}: missing id "#${anchor}" in "${relativeTarget}" (from "${href}")`);
    }
  }
}

const allIssues = [
  ...missingViewport,
  ...missingMobileFirstStylesheet,
  ...missingEmbeddedHtmlViewport,
  ...missingEmbeddedHtmlMobileFirstStylesheet,
  ...disallowedInlineCssInEmbeddedHtml,
  ...duplicateIds,
  ...missingFiles,
  ...missingAnchors,
];

if (allIssues.length === 0) {
  console.log(`OK: ${allHtmlFiles.length} HTML files and ${allJsFiles.length} JS files passed integrity checks.`);
  process.exit(0);
}

console.error('HTML integrity check failed:\n');
for (const issue of allIssues) {
  console.error(`- ${issue}`);
}
process.exit(1);
