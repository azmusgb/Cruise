# Sparse page audit: `plan.html` and `rooms.html`

## Findings addressed

### `plan.html`
- Added `<noscript>` fallback section with static day summary content.
- Added loading-status semantics to `#dayContent`:
  - `role="status"`
  - `aria-live="polite"`
  - `aria-busy` toggled by JS during render

### `rooms.html`
- Added `<noscript>` fallback section listing room assignments.
- Added loading-status semantics to `#manifestContainer`:
  - `role="status"`
  - `aria-live="polite"`
  - `aria-busy` toggled by JS during room/guest render

## Validation
- Run `npm run qa:html` and `npm run qa:core-matrix`.
