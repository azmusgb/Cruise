#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';

const pages = {
  'index.html': ['id="menuBtn"', 'id="countdown"', 'id="cardCountdown"'],
  'decks.html': ['id="deckSearch"', 'id="content"', 'id="modal"'],
  'operations.html': ['id="operationsSearchInput"', 'id="tasks"', 'data-task-id="task-online-checkin"'],
  'tips.html': ['id="proMovesSearchInput"', 'id="packing-checks"', 'data-check-id="pro-moves-carryon-ids"'],
  'itinerary.html': ['id="today"', 'id="timeline"', 'id="todayBtn"'],
  'offline.html': ['id="offlineSearchInput"', 'id="offline-grid"', 'id="refreshOfflineStatus"'],
};

const issues = [];
for (const [file, tokens] of Object.entries(pages)) {
  const html = readFileSync(path.join(process.cwd(), file), 'utf8');
  for (const token of tokens) {
    if (!html.includes(token)) {
      issues.push(`${file}: missing required token ${token}`);
    }
  }
}

if (issues.length) {
  console.error('Core regression matrix failed:\n');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log(`OK: core regression matrix passed for ${Object.keys(pages).length} pages.`);
