# UI Deep + Wide Analysis (HTML/CSS/JS)

## Scope covered
- **HTML (root):** `index.html`, `itinerary.html`, `rooms.html`, `decks.html`, `contacts.html`, `operations.html`, `photos.html`, `plan.html`, `tips.html`, `ports.html`, `dining.html`, `offline.html`, `deck-debug.html`.
- **HTML (archive):** `tools/_archive/pages/dashboard.html`, `tools/_archive/pages/svg-crop.html`.
- **CSS:** all files in `css/` (`tokens`, `base`, `utilities`, `layout`, `components`, `features`, `shared-layout`, `mobile-first`, plus page-specific styles).
- **JS:** all files in `js/` and `js/modules/`, including service workers.

## 1) UI architecture overview
- The product uses a **shared-shell model**: most pages import the same CSS stack (`tokens/base/utilities/layout/components/features/shared-layout/mobile-first`) and bind page behavior from `js/modules/*.js`.
- Page-level differentiation happens mostly via:
  - body/page classes (e.g. `page-contacts`, `page-offline`, etc.),
  - unique section containers and IDs,
  - per-page module scripts (`contacts.js`, `operations.js`, `tips.js`, etc.).
- There are two styling “gravity wells”:
  - `css/features.css` (largest single surface, 5,745 lines, 907 rule blocks),
  - `css/shared-layout.css` (3,962 lines, 583 rule blocks, dense variable usage).

## 2) HTML surface inventory and complexity signals
Using static tag-level analysis, the highest-density interaction surfaces are:
- `decks.html`: 29 buttons, 2 inputs, 39 IDs, 113 classes (most complex interaction/page state topology).
- `operations.html`: 24 links, 6 inputs, 26 IDs, checklist-heavy UX.
- `tips.html`: 5 sections, 9 checkbox inputs, card-list behavior with completion state.
- `offline.html`: 5 sections with many card/article blocks and status/backup interaction patterns.

Low-interaction pages:
- `ports.html` (content-first cards/lists, no buttons).
- `deck-debug.html` and archived redirect pages (diagnostic/utility only).

## 3) Interaction model (JavaScript)
### Event density by module
- **Highest click-driven modules:** `js/decks.js` and `js/modules/decks.js` (11 click handlers + keyboard/search support).
- **Touch/pointer-rich module:** `js/modules/itinerary.js` (pointer/touch/visibility/storage listeners) indicating timeline/day-state gesture handling.
- **Checklist/search modules:** `operations.js`, `tips.js`, `dining.js`, `offline.js` combine search/filter/input patterns with click or change persistence.

### Selector and data-attribute usage patterns
- Data-driven UI is established through attributes such as:
  - `data-action` (contacts/itinerary actions),
  - `data-task-id` (operations checklist identity),
  - `data-check-id` + `data-search-item` (tips completion + filtering),
  - `data-filter`/`data-venue-type` (dining filtering),
  - `data-room` (deck-room mapping).
- This is a positive sign for extensibility because behavior is tied to semantic hooks rather than only class names.

### Duplication note
- Both `js/decks.js` and `js/modules/decks.js` exist with similar selector/event footprints, suggesting either:
  - intentional legacy compatibility, or
  - refactor residue that could drift.
- Recommend a single source of truth with explicit import/usage policy.

## 4) CSS system analysis
### Layering
- **Design tokens:** `css/tokens.css` defines foundational variables.
- **Structural baseline:** `base`, `layout`, `components`, `utilities`.
- **Feature overlays:** `features.css`, `shared-layout.css`, `mobile-first.css`.

### Risk/maintainability indicators
- Very large “global” files (`features.css`, `shared-layout.css`) imply risk of:
  - selector collision,
  - cascade side effects across pages,
  - harder root-cause debugging.
- Opportunity: split by **feature + page** (e.g., cards, drawers, checklists, timeline, forms) and reduce global specificity.

### Responsive posture
- `mobile-first.css` exists and multiple files include media queries, indicating deliberate responsive handling.
- Because most pages import identical stacks, responsive regressions can propagate quickly; visual regression checks should focus on shared components (header, drawer, cards, action bars, back-to-top).

## 5) Page-by-page UI element analysis
- **Dashboard (`index.html`)**
  - High navigational density (16 links, 7 buttons) and many IDs imply dashboard acts as interaction hub.
- **Itinerary (`itinerary.html`)**
  - Mixed nav + controls with module support for day navigation/countdowns and gesture input.
- **Rooms (`rooms.html`)**
  - Lightweight shell + module-driven rendering, low static element count.
- **Decks (`decks.html`)**
  - Most control-heavy page; likely the primary complexity and regression hotspot.
- **Contacts (`contacts.html`)**
  - Task-oriented contact rows with copy/call actions and emergency hierarchy sections.
- **Operations (`operations.html`)**
  - Checklist-centric with multiple input controls and deep linking.
- **Photos (`photos.html`)**
  - Gallery/navigation shell with module initialization pattern.
- **Plan (`plan.html`)**
  - Very sparse static HTML, likely almost entirely JS-constructed view.
- **Tips (`tips.html`)**
  - Dense card/checklist UX; strong use of semantic grouping with completion controls.
- **Ports (`ports.html`)**
  - Content/reference heavy with article/list emphasis and fewer direct controls.
- **Dining (`dining.html`)**
  - Multi-section venue cards and filter/search interaction hooks.
- **Offline (`offline.html`)**
  - Recovery/backup-oriented UX with status panels and action links.
- **Debug/Archive pages**
  - `deck-debug.html` diagnostic-only; `tools/_archive/pages/*.html` are redirect wrappers.

## 6) Accessibility and UX consistency observations
Strengths:
- Widespread use of semantic landmarks (`main`, `section`, `article`, `nav`) and explicit labels in many controls.
- Repeated shell patterns (header, drawer, pills, back-to-top) provide predictable navigation.

Concerns to validate in manual QA:
- Ensure keyboard focus order and visible focus states across drawer/search/filter/checklist controls.
- Ensure icon-only buttons always include accurate `aria-label` (many appear to, but should be audited end-to-end).
- Validate color contrast after token overrides in high-density files.

## 7) Priority recommendations
1. **Consolidate duplicate deck scripts** (`js/decks.js` vs `js/modules/decks.js`) and document canonical entrypoint.
2. **Modularize giant CSS files** into feature-scoped chunks; introduce lint rules for max selector depth/specificity.
3. **Create UI contracts for data attributes** (`data-action`, `data-task-id`, etc.) so modules can evolve safely.
4. **Add targeted regression matrix** for core shared components across high-impact pages (`index`, `decks`, `operations`, `tips`, `itinerary`, `offline`).
5. **Audit sparse pages** (`plan`, `rooms`) for no-JS fallback and loading-state accessibility.

## 8) Suggested next-step execution plan
- Build an automated static UI inventory script (DOM + selector map + event hooks) and commit generated JSON snapshots.
- Add Playwright smoke checks for shared layout + one critical flow per module page.
- Add lightweight accessibility smoke test pass (focusability + ARIA + color contrast checks) to CI.
