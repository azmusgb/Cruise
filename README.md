# Cruise Companion

Cruise planning dashboard for the Rahe Family Caribbean trip.

## PWA support

This project now includes a basic Progressive Web App setup:

- Web app manifest (`manifest.json`)
- Service worker (`sw.js`) with offline-friendly caching
- Offline fallback page (`offline.html`)
- App icons in `/icons`

## Local run

You can run this as static files from the repo root, for example:

```bash
python3 -m http.server 8080
```

## GitHub Pages (mobile-friendly deploy)

This app is configured to work from a project subpath (for example `https://<user>.github.io/Cruise/`) using relative PWA paths.

- Enable Pages in repository settings (deploy from branch root).
- Open `https://<user>.github.io/<repo>/index.html` once online to prime the cache.
- Then install from mobile browser (`Add to Home Screen`).

## Shared deck plans on GitHub Pages

Deck plans can now be shared with every user by committing images to the repo and listing them in `deck-plans/index.json`.

- Put image files in `deck-plans/` (for example `deck-plans/deck-6-staterooms.png`).
- Update `deck-plans/index.json` with each plan's `name`, `src`, and optional `updatedAt`.
- Push to the branch that deploys GitHub Pages so everyone sees the same deck images.

Users can still upload device-only deck plans in the UI; those are local and not shared.

## Merge inline CSS programmatically

If you have styles spread across `<style>` blocks in multiple HTML files, use:

```bash
./merge-inline-styles.sh css/inline-merged.css '*.html'
```

The script will:

- scan matching HTML files for `<style>` blocks,
- parse top-level CSS blocks from inline `<style>` tags,
- de-duplicate identical selector blocks,
- detect selector conflicts (same selector, different declaration body),
- write only non-conflicting blocks to the output CSS file,
- print conflicting selectors so they can be resolved manually.

## GitHub Actions CI

This repository now includes:

- `.github/workflows/pwa-ci.yml` for validation on push/PR (manifest JSON, JS syntax, static PWA wiring checks, and local smoke tests).
- `.github/workflows/pages.yml` for GitHub Pages deployment from the `main` branch.

If your default branch is not `main`, update `pages.yml` accordingly.

## Design System Foundation

This project now uses shared primitives so pages behave like one system, not isolated templates.

### Core primitives

- `card`: base container language used by `.deck-card`, `.room-card`, and `.itinerary-day`
- `pill`: base token language used by badges/tags/features/priorities
- Shared focus-visible treatment for links, buttons, summary toggles, and form controls

### Mobile hero rule (system-wide)

For viewport `< 768px`, heroes are condensed to context + title:

- hide descriptive/support blocks: `.hero__description`, `.hero__highlights`, `.hero__actions`, `.page-spine`
- hide deck-hero equivalents: `.deck-hero__subtitle`, `.deck-hero__highlights`, `.deck-hero__actions`
- keep title visible and tighten hero spacing

### Interaction standards

- Room cards: explicit primary/secondary buttons only (no card-level click trap)
- Dashboard cards: CTA link pattern
- Itinerary cards: day selector drives content; day cards are display-first

### Naming direction

Use `card-*` and `pill-*` as canonical patterns for new work. Existing legacy names (`deck-card`, `tag`, `badge`, `priority-badge`, etc.) are currently mapped to these primitives for compatibility.

## Deck entrypoint + UI contracts

- Canonical deck runtime: `js/pages/decks.js`.
- Page runtimes now live in `js/pages/*.js` and are loaded directly by each HTML file.
- UI data-attribute contracts are documented in `docs/architecture/ui-data-attribute-contracts.md`.

## CSS modularization

Large stylesheets are now composition entry files:

- `css/features.css` imports feature-scoped chunks from `css/features/`
- `css/shared-layout.css` imports scoped chunks from `css/shared-layout/`

## Regression matrix

A targeted matrix for shared components on high-impact pages is available at:

- `docs/qa/core-regression-matrix.md`
- `npm run qa:core-matrix`
