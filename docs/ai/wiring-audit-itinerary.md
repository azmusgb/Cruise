# CSS_JS_WIRING_AUDIT (WIRING)

## Scope

- `itinerary.html`
- `js/global.js`
- `js/shared-layout.js`
- `js/pages/itinerary.js`

## 1) Wiring Map (selector/event/state linkage)

### Script load and initialization chain

- `itinerary.html` loads `js/shared-layout.js` and the page runtime `js/pages/itinerary.js`.
- `js/global.js` registers the service worker on `DOMContentLoaded`.
- `js/shared-layout.js` attempts to inject a shared header into `#sharedHeader` on `DOMContentLoaded`.
- `js/pages/itinerary.js` wires day navigation/actions, restores day state from date context, and updates status messaging.

### Primary DOM-to-JS bindings

- Timeline render target: `#timeline`.
- Feedback/status nodes: `#toast`, `#live`, `#sailaway`, `#sailPill`, `#confetti`.
- Drawer controls: `#menuBtn`, `#moreBtn`, `#drawerBackdrop`, `#drawer`, `#closeDrawerBtn`.
- Preferences/actions: `#animToggle`, `#resetBtn`.
- Day navigation controls: `#prevDayBtn`, `#nextDayBtn`, `#todayBtn`.
- Scroll utility: `#backToTop`.

### Event wiring map

- Timeline interactions
  - `click` on `#timeline` delegates via `button[data-action]` (`toggle`, `jump`, `excursion`, `copy`).
  - `keydown` on `#timeline` toggles a card on `Enter`/`Space` when focus is on non-interactive card surface.
  - `touchstart`/`touchend` on `#timeline` performs day-swipe navigation.
  - `pointerdown` on copy buttons is used for long-press hint behavior.
- Drawer interactions
  - `click` on `#menuBtn` and `#moreBtn` opens drawer.
  - `click` on `#closeDrawerBtn` closes drawer.
  - `click` on `#drawerBackdrop` closes on backdrop hit.
  - Global `keydown` handles `Escape` and focus trap when drawer is open.
- Day controls and utility actions
  - `click` on prev/next/today buttons updates open day.
  - `click` on reset clears excursion/open/active-day local storage keys.
  - `change` on animation toggle updates persisted animation preference.
  - `scroll` updates back-to-top visibility; `click` scrolls to top.

### State sources and sinks

- `localStorage`
  - `rccl.itin.excursions.v2`
  - `rccl.itin.openDay.v2`
  - `rccl.itin.activeDay.v2`
  - `rccl.itin.anim.v1`
- Runtime state
  - Open day index (from rendered `.card.open` / persisted storage)
  - Active visual theme index
  - Confetti particle queue and RAF lifecycle
  - Sail-away lock/cooldown flags

## 2) Broken or Risky Links

### Confirmed

1. **Unwired shared-header injection on this page**
   - `itinerary.html` does not include a `#sharedHeader` container, but still loads `js/shared-layout.js`.
   - Result: `injectHeader()` exits early every load on this route (dead script work for itinerary page).
   - Impact: low functional risk, but unnecessary script execution and maintenance ambiguity.

### Potential / hardening opportunities

1. **Mandatory-node assumptions for controls without null guards**
   - `prevDayBtn`, `nextDayBtn`, `todayBtn`, and `backToTopBtn` are used without conditional checks.
   - It works with current markup, but refactors/partial embeds would throw before init completes.
2. **Mixed ownership of header/drawer patterns across pages**
   - Project contains both inline header markup and shared-header injection patterns.
   - Risk is drift in selector contracts across routes over time.

## 3) Load/Initialization Risks

- All scripts are `defer`, so DOM order is stable and current initialization timing is sound.
- `itinerary.js` does not wait for `DOMContentLoaded`, relying on defer semantics; this is correct for current page load strategy.
- Service worker registration uses absolute `/sw.js`, which is correct for root-served app but can fail in subpath hosting scenarios.

## 4) Fix Recommendations

1. **Route-gate or remove `js/shared-layout.js` from `itinerary.html`**
   - Preferred: remove script include from pages that do not render `#sharedHeader`.
   - Alternative: keep include but add a fast route guard in `shared-layout.js` to skip non-shared-header pages with explicit logging only in debug.
2. **Add defensive null checks for non-critical controls in `itinerary.js`**
   - Guard event bindings for `prevDayBtn`, `nextDayBtn`, `todayBtn`, and `backToTopBtn` to improve resilience.
3. **Standardize one header/drawer contract**
   - Either shared injected header everywhere or static header everywhere; avoid mixed mode to reduce selector drift.

## 5) Post-fix Verification Steps

1. Open `itinerary.html` and validate no console errors at load.
2. Verify drawer open/close via both `#menuBtn` and `#moreBtn`, including `Escape` close and focus trap loop.
3. Verify timeline actions per card:
   - toggle expand/collapse
   - set active day (`jump`)
   - toggle excursion planned state and persistence after reload
   - copy summary button behavior
4. Verify swipe left/right on timeline changes day.
5. Verify animation toggle persists after reload and confetti obeys reduced-motion/pref toggle.
6. Verify back-to-top visibility threshold and scroll-to-top click action.
