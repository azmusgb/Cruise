# UI data-attribute contracts

These attributes are treated as stable contracts between HTML and JS page runtimes.

## Action contracts

- `data-action`: command routing token for delegated click handlers (`contacts`, `itinerary`).
  - Allowed values currently in use: `copy`, `security-call`, `toggle`, `jump`, `excursion`.
  - Contract: rename only with coordinated updates in HTML and page runtime handlers.

## Identity contracts

- `data-task-id`: stable identity key for operations checklist persistence.
  - Consumer: `js/pages/operations.js`.
  - Contract: values must remain deterministic and unique per task card.
- `data-check-id`: stable identity key for tips checklist persistence.
  - Consumer: `js/pages/tips.js`.

## Filtering contracts

- `data-filter`: dining filter button key.
- `data-venue-type`: dining card category value.
- `data-search-item`: tips card inclusion in search index.

## Deck contracts

- `data-n`: deck number key used by the deck navigator card/chip controls.
- `data-spot-idx`: deck hotspot + legend mapping index.
- `data-room`: venue-room lookup token in deck modal details.

## Change policy

Before changing any contract attribute:

1. Update producer HTML.
2. Update all page runtime consumers.
3. Run:
   - `npm run qa:html`
   - `npm run qa:nav`
   - `npm run qa:core-matrix`
4. Update this document with new/removed contract keys.
