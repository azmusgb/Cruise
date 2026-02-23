#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlFiles = readdirSync(root)
  .filter((f) => f.endsWith(".html"))
  .sort((a, b) => a.localeCompare(b));
const skipFiles = new Set(["deck-debug.html"]);

const issues = [];

function strip(text) {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

for (const file of htmlFiles) {
  if (skipFiles.has(file)) continue;
  const content = readFileSync(path.join(root, file), "utf8");

  const headingMatches = [...content.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) =>
    Number(m[1]),
  );
  if (!headingMatches.length) {
    issues.push(`${file}: no headings found`);
  } else {
    if (!headingMatches.includes(1)) {
      issues.push(`${file}: missing h1`);
    }
    for (let i = 1; i < headingMatches.length; i += 1) {
      if (headingMatches[i] - headingMatches[i - 1] > 1) {
        issues.push(
          `${file}: heading level jump h${headingMatches[i - 1]} -> h${headingMatches[i]}`,
        );
        break;
      }
    }
  }

  for (const match of content.matchAll(
    /<button\b([^>]*)>([\s\S]*?)<\/button>/gi,
  )) {
    const attrs = match[1] || "";
    const body = strip(match[2] || "");
    const hasAria = /aria-label\s*=\s*['"][^'"]+['"]/i.test(attrs);
    const hasTitle = /title\s*=\s*['"][^'"]+['"]/i.test(attrs);
    if (!body && !hasAria && !hasTitle) {
      issues.push(`${file}: button without accessible name`);
      break;
    }
  }
}

if (!issues.length) {
  console.log(
    `OK: heading and control semantics checks passed for ${htmlFiles.length} HTML files.`,
  );
  process.exit(0);
}

console.error("A11y structure check failed:\n");
for (const issue of issues) console.error(`- ${issue}`);
process.exit(1);
