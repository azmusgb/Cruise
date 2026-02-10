import fs from 'fs';
import path from 'path';

const root = process.cwd();
const includeExt = new Set(['.html', '.css', '.js']);
const ignoreDirs = new Set(['node_modules', '.git']);

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

const htmlIds = new Map();
const htmlClasses = new Map();

function addRef(map, key, file) {
  if (!key) return;
  if (!map.has(key)) map.set(key, new Set());
  map.get(key).add(path.relative(root, file));
}

function stripHtmlComments(txt) {
  return txt.replace(/<!--[\s\S]*?-->/g, '');
}

for (const f of htmlFiles) {
  const txt = stripHtmlComments(fs.readFileSync(f, 'utf8'));

  // Match only actual id/class attributes and avoid data-ship-class style false positives.
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

function extractSimpleSelectorRefs(selector, idsMap, classesMap, file) {
  for (const idMatch of selector.matchAll(/#([A-Za-z_][\w-]*)/g)) addRef(idsMap, idMatch[1], file);
  for (const classMatch of selector.matchAll(/\.([A-Za-z_][\w-]*)/g)) addRef(classesMap, classMatch[1], file);
}

const jsIdRefs = new Map();
const jsClassRefs = new Map();
for (const f of jsFiles) {
  const txt = fs.readFileSync(f, 'utf8');

  for (const m of txt.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)) addRef(jsIdRefs, m[1], f);

  for (const m of txt.matchAll(/querySelector(?:All)?\(\s*["']([^"']+)["']\s*\)/g)) {
    extractSimpleSelectorRefs(m[1], jsIdRefs, jsClassRefs, f);
  }

  for (const m of txt.matchAll(/classList\.(?:add|remove|toggle|contains)\(([^)]*)\)/g)) {
    for (const arg of m[1].matchAll(/["']([^"']+)["']/g)) {
      arg[1]
        .split(/\s+/)
        .filter(Boolean)
        .forEach((name) => addRef(jsClassRefs, name, f));
    }
  }
}

function sorted(arr) {
  return [...arr].sort((a, b) => a.localeCompare(b));
}

const idsOnlyHtml = sorted([...htmlIds.keys()].filter((k) => !cssIdSelectors.has(k) && !jsIdRefs.has(k)));
const idsJsMissingHtml = sorted([...jsIdRefs.keys()].filter((k) => !htmlIds.has(k)));
const idsCssMissingHtml = sorted([...cssIdSelectors.keys()].filter((k) => !htmlIds.has(k)));

const classesOnlyHtml = sorted([...htmlClasses.keys()].filter((k) => !cssClassSelectors.has(k) && !jsClassRefs.has(k)));
const classesJsMissingHtml = sorted([...jsClassRefs.keys()].filter((k) => !htmlClasses.has(k)));
const classesCssMissingHtml = sorted([...cssClassSelectors.keys()].filter((k) => !htmlClasses.has(k)));

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

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'reports', 'ui-wiring-audit.md'), lines.join('\n'));
console.log('Wrote reports/ui-wiring-audit.md');
