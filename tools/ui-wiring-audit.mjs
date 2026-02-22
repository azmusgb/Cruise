import fs from 'fs';
import path from 'path';

const root = process.cwd();
const includeExt = new Set(['.html', '.css', '.js']);
const ignoreDirs = new Set(['node_modules', '.git']);
const configPath = path.join(root, 'tools', 'ui-wiring-audit.config.json');
const strictFail = process.env.UI_WIRING_STRICT === '1' || process.argv.includes('--strict');
const pageScopedJsExcludes = new Set(['js/shared-layout.js', 'js/sw.js', 'sw.js']);

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    return { defaults: {}, pages: {} };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return {
      defaults: parsed.defaults || {},
      pages: parsed.pages || {},
    };
  } catch (error) {
    console.error(`Failed to parse ${path.relative(root, configPath)}: ${error.message}`);
    return { defaults: {}, pages: {} };
  }
}

const config = loadConfig();

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (includeExt.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

const files = walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const cssFiles = files.filter((f) => f.endsWith('.css'));
const jsFiles = files.filter((f) => f.endsWith('.js'));

function rel(file) {
  return path.relative(root, file);
}

function addRef(map, key, file) {
  if (!key) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(rel(file));
}

function stripHtmlComments(txt) {
  return txt.replace(/<!--[\s\S]*?-->/g, '');
}

function extractSimpleSelectorRefs(selector, idsMap, classesMap, file) {
  for (const idMatch of selector.matchAll(/#([A-Za-z_][\w-]*)/g)) addRef(idsMap, idMatch[1], file);
  for (const classMatch of selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) addRef(classesMap, classMatch[1], file);
}

function extractRefsFromCode(code, idsMap, classesMap, file) {
  for (const m of code.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)) addRef(idsMap, m[1], file);

  // Supports local helpers like const $ = (id) => document.getElementById(id);
  for (const m of code.matchAll(/\$\(\s*["']([^"']+)["']\s*\)/g)) addRef(idsMap, m[1], file);

  for (const m of code.matchAll(/querySelector(?:All)?\(\s*["']([^"']+)["']\s*\)/g)) {
    extractSimpleSelectorRefs(m[1], idsMap, classesMap, file);
  }

  for (const m of code.matchAll(/classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g)) {
    const rawArgs = m[1] || '';
    const classArgOnly = rawArgs.split(',')[0] || '';
    for (const arg of classArgOnly.matchAll(/["']([^"']+)["']/g)) {
      arg[1]
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => addRef(classesMap, name, file));
    }
  }
}

function sorted(arr) {
  return [...arr].sort((a, b) => a.localeCompare(b));
}

function applyIgnoreList(items, ignore = []) {
  const exact = new Set();
  const prefixes = [];
  for (const rule of ignore) {
    if (typeof rule !== 'string') continue;
    if (rule.endsWith('*')) {
      prefixes.push(rule.slice(0, -1));
    } else {
      exact.add(rule);
    }
  }
  return items.filter((item) => !exact.has(item) && !prefixes.some((prefix) => item.startsWith(prefix)));
}

function shouldIncludeInPageScopedJs(normalizedScriptPath) {
  return !pageScopedJsExcludes.has(normalizedScriptPath.replace(/\\/g, '/'));
}

// Repo-wide HTML/CSS/JS selector inventory
const htmlIds = new Map();
const htmlClasses = new Map();

for (const f of htmlFiles) {
  const txt = stripHtmlComments(fs.readFileSync(f, 'utf8'));

  for (const m of txt.matchAll(/(?:^|[\s<])id\s*=\s*["']([^"']+)["']/gm)) {
    const id = m[1].trim();
    if (/^[A-Za-z][\w:-]*$/.test(id)) addRef(htmlIds, id, f);
  }

  for (const m of txt.matchAll(/(?:^|[\s<])class\s*=\s*["']([^"']+)["']/gm)) {
    m[1]
      .split(/\s+/)
      .filter(Boolean)
      .forEach((c) => {
        if (/^[A-Za-z][\w:-]*$/.test(c)) addRef(htmlClasses, c, f);
      });
  }
}

const cssIdSelectors = new Map();
const cssClassSelectors = new Map();
for (const f of cssFiles) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/(^|[^0-9A-Fa-f])#([A-Za-z_][\w-]*)/g)) {
    const id = m[2];
    if (!/^[0-9a-fA-F]{3,6}$/.test(id)) addRef(cssIdSelectors, id, f);
  }
  for (const m of txt.matchAll(/\.([A-Za-z_][\w-]*)/g)) addRef(cssClassSelectors, m[1], f);
}

const jsIdRefs = new Map();
const jsClassRefs = new Map();
for (const f of jsFiles) {
  const txt = fs.readFileSync(f, 'utf8');
  extractRefsFromCode(txt, jsIdRefs, jsClassRefs, f);
}

const idsOnlyHtml = sorted([...htmlIds.keys()].filter((k) => !cssIdSelectors.has(k) && !jsIdRefs.has(k)));
const idsJsMissingHtml = sorted([...jsIdRefs.keys()].filter((k) => !htmlIds.has(k)));
const idsCssMissingHtml = sorted([...cssIdSelectors.keys()].filter((k) => !htmlIds.has(k)));

const classesOnlyHtml = sorted([...htmlClasses.keys()].filter((k) => !cssClassSelectors.has(k) && !jsClassRefs.has(k)));
const classesJsMissingHtml = sorted([...jsClassRefs.keys()].filter((k) => !htmlClasses.has(k)));
const classesCssMissingHtml = sorted([...cssClassSelectors.keys()].filter((k) => !htmlClasses.has(k)));

// Page entrypoint mapping + page-scoped mismatch checks
function htmlSelectorSet(html, attr) {
  const out = new Set();
  const re = attr === 'id'
    ? /(?:^|[\s<])id\s*=\s*["']([^"']+)["']/gm
    : /(?:^|[\s<])class\s*=\s*["']([^"']+)["']/gm;

  for (const m of html.matchAll(re)) {
    if (attr === 'id') out.add(m[1].trim());
    else m[1].split(/\s+/).filter(Boolean).forEach((c) => out.add(c));
  }
  return out;
}

function extractScriptSrcs(html) {
  const out = [];
  for (const m of html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gim)) {
    const src = m[1].trim();
    if (src && !/^https?:\/\//i.test(src)) out.push(src.replace(/^\.\//, ''));
  }
  return out;
}

function extractInlineScriptRefs(htmlFile, htmlCode) {
  const idRefs = new Set();
  const classRefs = new Set();
  for (const m of htmlCode.matchAll(/<script\b(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gim)) {
    const code = m[1] || '';
    const ids = new Map();
    const classes = new Map();
    extractRefsFromCode(code, ids, classes, htmlFile);
    for (const key of ids.keys()) idRefs.add(key);
    for (const key of classes.keys()) classRefs.add(key);
  }
  return { idRefs, classRefs };
}

const pageResults = [];
for (const file of htmlFiles) {
  const html = stripHtmlComments(fs.readFileSync(file, 'utf8'));
  const page = rel(file);
  const pageIds = htmlSelectorSet(html, 'id');
  const pageClasses = htmlSelectorSet(html, 'class');

  const scriptSrcs = extractScriptSrcs(html);
  const entrypoints = scriptSrcs
    .map((s) => s.split(/[?#]/)[0])
    .map((s) => s.replace(/^\//, ''))
    .map((s) => path.normalize(s))
    .filter((s) => s.endsWith('.js'));

  const loadedJs = entrypoints
    .map((s) => path.resolve(root, s))
    .filter((abs) => fs.existsSync(abs));

  const pageJsIds = new Map();
  const pageJsClasses = new Map();
  for (const abs of loadedJs) {
    const normalized = rel(abs).replace(/\\/g, '/');
    if (!shouldIncludeInPageScopedJs(normalized)) continue;
    extractRefsFromCode(fs.readFileSync(abs, 'utf8'), pageJsIds, pageJsClasses, abs);
  }

  const inlineRefs = extractInlineScriptRefs(file, html);
  for (const id of inlineRefs.idRefs) addRef(pageJsIds, id, file);
  for (const cls of inlineRefs.classRefs) addRef(pageJsClasses, cls, file);

  const missingIds = sorted([...pageJsIds.keys()].filter((k) => !pageIds.has(k)));
  const missingClasses = sorted([...pageJsClasses.keys()].filter((k) => !pageClasses.has(k) && !cssClassSelectors.has(k)));

  const pageConfig = config.pages?.[page] || {};
  const ignoreIds = [...(config.defaults?.ignoreIds || []), ...(pageConfig.ignoreIds || [])];
  const ignoreClasses = [...(config.defaults?.ignoreClasses || []), ...(pageConfig.ignoreClasses || [])];
  const unsuppressedMissingIds = applyIgnoreList(missingIds, ignoreIds);
  const unsuppressedMissingClasses = applyIgnoreList(missingClasses, ignoreClasses);

  pageResults.push({
    page,
    entrypoints,
    inlineScriptCount: [...html.matchAll(/<script\b(?![^>]*\bsrc\b)[^>]*>/gim)].length,
    missingIds,
    missingClasses,
    unsuppressedMissingIds,
    unsuppressedMissingClasses,
    pageIdsCount: pageIds.size,
    pageClassesCount: pageClasses.size,
    jsIdsCount: pageJsIds.size,
    jsClassesCount: pageJsClasses.size,
  });
}

const unsuppressedIssues = pageResults.reduce(
  (sum, page) => sum + page.unsuppressedMissingIds.length + page.unsuppressedMissingClasses.length,
  0
);

const lines = [];
lines.push('# UI Wiring Audit Report');
lines.push('');
lines.push(`Scanned ${htmlFiles.length} HTML, ${cssFiles.length} CSS, ${jsFiles.length} JS files.`);
lines.push('');
lines.push('## Summary');
const status =
  idsOnlyHtml.length === 0 &&
  idsJsMissingHtml.length === 0 &&
  idsCssMissingHtml.length === 0 &&
  classesOnlyHtml.length === 0 &&
  classesJsMissingHtml.length === 0 &&
  classesCssMissingHtml.length === 0
    ? 'PASS'
    : 'ISSUES FOUND';
lines.push(`Overall status: **${status}**`);
lines.push(`Strict fail mode: **${strictFail ? 'ON' : 'OFF'}**`);
lines.push(`Config file: \`${path.relative(root, configPath)}\`${fs.existsSync(configPath) ? '' : ' (not found; using defaults)'}`);
lines.push(`Unsuppressed page-scoped issues: **${unsuppressedIssues}**`);
lines.push('');

function section(title, list, map) {
  lines.push(`## ${title} (${list.length})`);
  if (list.length === 0) {
    lines.push('- None');
    lines.push('');
    return;
  }
  for (const key of list.slice(0, 200)) {
    const refs = map?.get(key) ? sorted(map.get(key)).join(', ') : '';
    lines.push(`- \`${key}\`${refs ? ` (e.g. ${refs})` : ''}`);
  }
  if (list.length > 200) lines.push(`- ... ${list.length - 200} more`);
  lines.push('');
}

section('IDs in HTML but unused by CSS/JS', idsOnlyHtml, htmlIds);
section('IDs referenced in JS but not found in HTML', idsJsMissingHtml, jsIdRefs);
section('IDs referenced in CSS but not found in HTML', idsCssMissingHtml, cssIdSelectors);
section('Classes in HTML but unused by CSS/JS', classesOnlyHtml, htmlClasses);
section('Classes referenced in JS but not found in HTML', classesJsMissingHtml, jsClassRefs);
section('Classes referenced in CSS but not found in HTML', classesCssMissingHtml, cssClassSelectors);

lines.push('## Page Entrypoint Mapping (HTML -> JS)');
for (const page of pageResults.sort((a, b) => a.page.localeCompare(b.page))) {
  lines.push(`- ${page.page}`);
  lines.push(`  - JS entrypoints: ${page.entrypoints.length ? page.entrypoints.join(', ') : '(none)'}`);
  lines.push(`  - Inline script blocks: ${page.inlineScriptCount}`);
}
lines.push('');

lines.push('## Page-Scoped JS Selector Mismatches');
for (const page of pageResults.sort((a, b) => a.page.localeCompare(b.page))) {
  lines.push(`### ${page.page}`);
  lines.push(`- DOM: ${page.pageIdsCount} ids, ${page.pageClassesCount} classes`);
  lines.push(`- JS refs (entrypoints + inline): ${page.jsIdsCount} ids, ${page.jsClassesCount} classes`);
  lines.push(`- Missing IDs: ${page.missingIds.length}`);
  lines.push(`- Missing classes: ${page.missingClasses.length}`);
  lines.push(`- Unsuppressed missing IDs: ${page.unsuppressedMissingIds.length}`);
  lines.push(`- Unsuppressed missing classes: ${page.unsuppressedMissingClasses.length}`);
  if (page.missingIds.length) {
    lines.push(`- Missing ID examples: ${page.missingIds.slice(0, 8).map((id) => `\`${id}\``).join(', ')}`);
  }
  if (page.missingClasses.length) {
    lines.push(`- Missing class examples: ${page.missingClasses.slice(0, 8).map((c) => `\`${c}\``).join(', ')}`);
  }
  if (page.unsuppressedMissingIds.length) {
    lines.push(
      `- Unsuppressed ID examples: ${page.unsuppressedMissingIds
        .slice(0, 8)
        .map((id) => `\`${id}\``)
        .join(', ')}`
    );
  }
  if (page.unsuppressedMissingClasses.length) {
    lines.push(
      `- Unsuppressed class examples: ${page.unsuppressedMissingClasses
        .slice(0, 8)
        .map((c) => `\`${c}\``)
        .join(', ')}`
    );
  }
  lines.push('');
}

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'ui-wiring-audit.md'), lines.join('\n'));
console.log('Wrote reports/ui-wiring-audit.md');

if (strictFail && unsuppressedIssues > 0) {
  console.error(`Unsuppressed page-scoped wiring issues found: ${unsuppressedIssues}`);
  process.exitCode = 1;
}
