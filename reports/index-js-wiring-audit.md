# CSS_JS_WIRING_AUDIT — Homepage (MODE: WIRING, STRICTNESS: high)

## 1) Wiring Map (selector/event/state linkage)

### Runtime entrypoints for homepage
- `index.html` runs a single inline script block; it does not load any `js/**/*.js` file via `<script src="...">`.
- The inline script wires homepage UI controls by ID (menu drawer, copy buttons, status pills, countdown, toast, back-to-top, ocean canvas).

### Selector linkage
- `index.html` declares 40 IDs and 78 classes in markup.
- `js/**/*.js` contains references to 62 IDs and 22 classes overall.
- Of those JS references, only a small subset map to homepage DOM; most selectors target other pages (`plan`, `decks`, `dining`, etc.).

### Event linkage
- Across `js/**/*.js`, observed event types: `DOMContentLoaded`, `activate`, `change`, `click`, `fetch`, `input`, `install`, `keydown`, `keypress`, `message`, `offline`, `online`, `pointercancel`, `pointerdown`, `pointerleave`, `pointerup`, `resize`, `scroll`, `storage`, `touchend`, `touchstart`, `visibilitychange`.
- Homepage inline script specifically wires: `click`, `keydown`, `online`, `offline`, `scroll`, and `resize`.

### State linkage
- Homepage state sources in inline script:
  - Static config state (`SAILING`, `DEFAULT_ROOMS`, `ITINERARY`)
  - Browser online status (`navigator.onLine`)
  - Local persistence (`localStorage` keys `rccl.rooms.notes.v1`, `rccl.rooms.data.v1`)
  - Render state via class toggles (`open`, `show`, `offline`, `visible`) and text updates.

## 2) Broken or Risky Links

### Confirmed selector mismatches in scope (`index.html` + `js/**/*.js`)
- IDs referenced by JS but not present in homepage HTML: **54**.
  - Examples: `dayNav`, `dayContent` (`js/modules/plan.js`), `deckGrid`, `deckModal`, `deckSearch` (`js/modules/decks.js`), `diningContextTitle` (`js/modules/dining.js`).
- Classes referenced by JS but not present in homepage HTML: **19**.
  - Examples: `deck-card`, `deck-viewer`, `dining-nav__filters`, `is-loading`, `room-selected`.

### Risk classification
- **Low runtime risk on homepage today** for those 54/19 mismatches, because homepage currently does not import `js/**/*.js`.
- **Medium maintenance risk**: selectors can silently drift between the inline homepage script and `js/modules/index.js` (duplicated logic), causing future regressions when/if module wiring is switched.

## 3) Load/Initialization Risks

1. **Entrypoint split risk (confirmed)**
   - Homepage uses inline script only, while a near-duplicate homepage implementation exists in `js/modules/index.js`.
   - This creates dual sources of truth and drift risk for selector/event/state wiring.

2. **Future import-order risk (high if refactor occurs)**
   - Several page modules assume page-specific DOM exists and register listeners without universal null-guards.
   - If these modules are accidentally included on homepage, null dereference failures are likely at initialization.

3. **Global bootstrap coupling risk (medium)**
   - `js/global.js` uses a global singleton guard (`window.__CRUISE_APP__`) and attaches `DOMContentLoaded` listener for SW registration.
   - If homepage later adds this script plus additional inline bootstraps, initialization ordering should be explicitly documented to avoid duplicate/conflicting startup behavior.

## 4) Fix Recommendations

1. **Choose one homepage JS source of truth**
   - Either keep inline script and remove `js/modules/index.js`, or migrate homepage to `js/modules/index.js` and remove inline duplicate.

2. **Add page-to-entrypoint wiring manifest for audits**
   - Audit `index.html` only against scripts actually loaded by index.
   - Keep cross-page selector mismatch report as a separate global signal.

3. **Harden module startup guards**
   - For modules that may be shared/reused, bail early when required root elements are absent before attaching listeners.

4. **Add lightweight wiring check in CI**
   - Verify every selector referenced by a page entrypoint exists in that page HTML.
   - Fail build only for page-scoped mismatches, not whole-repo cross-page references.

## 5) Post-fix Verification Steps

1. Verify homepage entrypoint choice:
   - If modularized: ensure `index.html` includes `<script src="js/modules/index.js" defer></script>` (or module equivalent) and remove inline duplicate.
   - If inline-only: remove unused module copy.

2. Re-run global mismatch scan:
   - `node tools/ui-wiring-audit.mjs`

3. Re-run homepage-scoped wiring scan:
   - Check selector parity between homepage DOM and the selected homepage entrypoint.

4. Browser smoke on homepage:
   - Menu open/close + focus trap
   - Copy buttons + toast
   - Online/offline badge transitions
   - Countdown and room/itinerary renders
   - Back-to-top behavior
