# Deck runtime entrypoint

## Canonical script

`js/pages/decks.js` is the canonical deck runtime and is loaded directly by `decks.html`.

## Rule for contributors

- New deck behavior changes go in `js/pages/decks.js`.
- Keep deck-specific styles in `css/pages/decks.css`.
- Do not reintroduce compatibility shims or duplicate deck runtimes.

## Validation

After deck behavior changes, run:

- `npm run -s qa:html`
- `npm run -s qa:nav`
- `npm run -s qa:core-matrix`
- `npm run -s qa:mobile-more`
