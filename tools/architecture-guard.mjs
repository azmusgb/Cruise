import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const htmlFiles = [
  "index.html",
  "plan.html",
  "itinerary.html",
  "decks.html",
  "rooms.html",
  "dining.html",
  "operations.html",
  "contacts.html",
  "tips.html",
  "photos.html",
  "ports.html",
  "offline.html",
];

const allowedStylesheetPrefixes = [
  "css/base.css",
  "css/utilities.css",
  "css/components.css",
  "css/mobile-first.css",
  "css/feature-modules.css",
  "css/pages/",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/",
  "https://fonts.googleapis.com/",
];

const bannedStylesheetPrefixes = [
  "css/features.css",
  "css/features/",
  "css/shared-layout.css",
];

const sharedLayoutConfigScript = "js/shared-layout.config.js";
const sharedLayoutModeScript = "js/shared-layout/mode.js";
const sharedLayoutPwaScript = "js/shared-layout/pwa.js";
const sharedLayoutScript = "js/shared-layout.js";
const sharedInteractionsScript = "js/pages/shared-interactions.js";

function collectMatches(text, regex) {
  const values = [];
  let match = regex.exec(text);
  while (match) {
    values.push(match[1]);
    match = regex.exec(text);
  }
  return values;
}

function isAllowedStyle(href) {
  return allowedStylesheetPrefixes.some((prefix) => href.startsWith(prefix));
}

function isBannedStyle(href) {
  return bannedStylesheetPrefixes.some((prefix) => href.startsWith(prefix));
}

const failures = [];

for (const file of htmlFiles) {
  const abs = path.join(ROOT, file);
  const html = await fs.readFile(abs, "utf8");

  const styles = collectMatches(
    html,
    /<link\s+rel="stylesheet"\s+href="([^"]+)"/g,
  );
  const scripts = collectMatches(html, /<script\s+src="([^"]+)"/g);

  for (const href of styles) {
    if (isBannedStyle(href)) {
      failures.push(`${file}: banned stylesheet reference \`${href}\``);
    }
    if (!isAllowedStyle(href)) {
      failures.push(`${file}: unexpected stylesheet reference \`${href}\``);
    }
  }

  if (!scripts.some((src) => src.startsWith(sharedLayoutConfigScript))) {
    failures.push(
      `${file}: missing shared layout config script \`${sharedLayoutConfigScript}\``,
    );
  }

  if (!scripts.some((src) => src.startsWith(sharedLayoutModeScript))) {
    failures.push(
      `${file}: missing shared layout mode script \`${sharedLayoutModeScript}\``,
    );
  }

  if (!scripts.some((src) => src.startsWith(sharedLayoutPwaScript))) {
    failures.push(
      `${file}: missing shared layout pwa script \`${sharedLayoutPwaScript}\``,
    );
  }

  if (!scripts.some((src) => src.startsWith(sharedLayoutScript))) {
    failures.push(
      `${file}: missing shared layout script \`${sharedLayoutScript}\``,
    );
  }

  if (file !== "plan.html" && file !== "ports.html") {
    if (!scripts.some((src) => src.startsWith(sharedInteractionsScript))) {
      failures.push(
        `${file}: missing shared interactions script \`${sharedInteractionsScript}\``,
      );
    }
  }

  if (scripts.some((src) => src === "js/global.js")) {
    failures.push(`${file}: legacy global script should not be loaded`);
  }
}

if (failures.length) {
  console.error("Architecture guard failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `OK: architecture guard passed across ${htmlFiles.length} HTML files.`,
);
