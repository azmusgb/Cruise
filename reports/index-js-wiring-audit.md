# Index + JS Wiring Audit (MODE: WIRING)

## Scope
- HTML: `index.html`
- JavaScript: `16` files under `js/`
- Method: static selector/event wiring audit aligned to `CSS_JS_WIRING_AUDIT` mode.

## 1) Wiring Map
- `index.html` defines **40 IDs** and **78 classes**.
- JS files reference **62 unique IDs**, **22 unique classes**, and **22 event types**.
- Common event types: DOMContentLoaded, activate, change, click, fetch, input, install, keydown, keypress, message

## 2) Broken or Risky Links
- IDs referenced in JS but missing from `index.html`: **54**
  - `dayContent` → js/modules/plan.js
  - `dayNav` → js/modules/plan.js
  - `deckCount` → js/modules/decks.js
  - `deckGrid` → js/modules/decks.js
  - `deckModal` → js/modules/decks.js
  - `deckNext` → js/modules/decks.js
  - `deckPrev` → js/modules/decks.js
  - `deckSearch` → js/modules/decks.js
  - `deckSearchClear` → js/modules/decks.js
  - `deckStage` → js/modules/decks.js
  - `deckStatus` → js/modules/decks.js
  - `diningContextAction` → js/modules/dining.js
  - `diningContextActionText` → js/modules/dining.js
  - `diningContextBody` → js/modules/dining.js
  - `diningContextTitle` → js/modules/dining.js
  - … 39 more
- Classes referenced in JS but missing from `index.html`: **19**
  - `deck-card` → js/modules/dining.js, js/modules/offline.js, js/modules/operations.js
  - `deck-card--context-pick` → js/modules/dining.js
  - `deck-viewer` → js/modules/decks.js
  - `dining-nav__filters` → js/modules/dining.js
  - `is-active` → js/modules/dining.js, js/modules/itinerary.js
  - `is-complete` → js/modules/operations.js, js/modules/tips.js
  - `is-live` → js/modules/itinerary.js
  - `is-loading` → js/modules/dining.js
  - `is-today` → js/modules/itinerary.js
  - `no-anim` → js/modules/itinerary.js
  - `offline` → js/index-dashboard.js, js/modules/index.js
  - `on` → js/modules/itinerary.js
  - … 7 more

## 3) Load/Initialization Risks
- `index.html` uses an inline script and does **not** import files from `js/`; therefore wiring between `js/` selectors and `index.html` is currently indirect/non-runtime for this page.
- Cross-page JS modules increase false-positive selector mismatches when audited against a single page.

## 4) Fix Recommendations
1. Add a per-page manifest (page -> JS entrypoints) and run wiring audits only against those entrypoints.
2. Guard selector lookups in shared modules (`if (!el) return;`) to prevent null access when scripts are reused cross-page.
3. If any `js/` file is intended for `index.html`, explicitly load it with `<script type="module" src="...">` and retest.

## 5) Post-fix Verification Steps
1. Re-run `node tools/ui-wiring-audit.mjs` for global regressions.
2. Re-run this scoped audit for `index.html` + assigned JS entrypoints.
3. Manual browser smoke: open index, menu toggle, copy actions, toast visibility, and offline badge behavior.
