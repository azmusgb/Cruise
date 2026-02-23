# Frontend Centralization Rules

## Source of Truth

- Shared app shell styling is loaded via `css/shared-layout.entry.css`.
- `css/shared-layout.entry.css` imports:
  - `css/shared-layout.css`
  - `css/shared-layout/nav-consistency.css`
- Shared shell config is loaded via `js/shared-layout.config.js`.
- Shared shell runtime is `js/shared-layout.js`.
- Shared interaction primitives (search/modal/status) are `js/pages/shared-interactions.js`.

## Page Styling Strategy

- Page-specific CSS lives in `css/pages/*.css`.
- Shared feature utilities stay in `css/feature-modules.css`.
- The legacy `css/features.css` and `css/features/*` path is decommissioned.

## Navigation Strategy

- Header, bottom nav, and More drawer behavior are owned by `js/shared-layout.js`.
- Avoid page-level scripts modifying shared nav state directly.
- Use shared CSS classes for nav state and focus/active behavior.

## Guardrails

- Run `npm run qa:architecture` to enforce stylesheet/script structure.
- CI workflows should run architecture, nav, and HTML integrity checks.

## Offline/PWA

- Service worker core assets include shared layout entry + imported nav consistency stylesheet.
- Bump `SW_VERSION` when changing shell-critical assets.

## Planned Next Refactor

- Split `js/shared-layout.js` into smaller modules by concern:
  - `nav`
  - `drawer`
  - `mode`
  - `pwa`
  - `mount`
- Keep exported behavior stable while moving internals.
