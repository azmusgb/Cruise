# UI Wiring Audit Report

> Historical note (updated February 23, 2026): this report includes references from an earlier snapshot that mentioned `css/features.css` and `css/features/*`. That path has been decommissioned. Current active styling uses `css/pages/*`, `css/feature-modules.css`, and `css/shared-layout.entry.css`.

Scanned 15 HTML, 38 CSS, 16 JS files.

## Summary

Overall status: **ISSUES FOUND**
Strict fail mode: **ON**
Config file: `tools/ui-wiring-audit.config.json`
Unsuppressed page-scoped issues: **0**

## IDs in HTML but unused by CSS/JS (62)

- `allSetTitle` (e.g. rooms.html)
- `assistanceActionsTitle` (e.g. rooms.html)
- `backup` (e.g. contacts.html)
- `backup-title` (e.g. contacts.html)
- `check-task-day-of-arrival` (e.g. operations.html)
- `check-task-luggage-tags` (e.g. operations.html)
- `check-task-online-checkin` (e.g. operations.html)
- `check-task-passports-photos` (e.g. operations.html)
- `check-task-payment-insurance` (e.g. operations.html)
- `checklist` (e.g. offline.html)
- `contacts` (e.g. offline.html)
- `contacts-grid` (e.g. contacts.html)
- `daySelector` (e.g. itinerary.html)
- `deck-directory` (e.g. decks.html)
- `dining-grid` (e.g. dining.html)
- `diningSpotlightActionText` (e.g. dining.html)
- `embark-sequence` (e.g. plan.html)
- `included-group` (e.g. dining.html)
- `itinerary` (e.g. offline.html)
- `legendTitle` (e.g. itinerary.html)
- `main` (e.g. contacts.html, decks.html, dining.html, index.html, itinerary.html, offline.html, operations.html, plan.html, ports.html, tips.html)
- `modalCloseBtn` (e.g. rooms.html)
- `onboard` (e.g. contacts.html)
- `onboard-title` (e.g. contacts.html)
- `orderingActionsTitle` (e.g. rooms.html)
- `overviewTitle` (e.g. rooms.html)
- `packing-checks` (e.g. tips.html)
- `pill-entertainment` (e.g. decks.html)
- `pill-essential` (e.g. decks.html)
- `pill-wellness` (e.g. decks.html)
- `policy-reminders` (e.g. tips.html)
- `portday` (e.g. tips.html)
- `ports` (e.g. contacts.html)
- `ports-title` (e.g. contacts.html)
- `pro-moves-carryon-ids` (e.g. tips.html)
- `pro-moves-habit-arrive-early` (e.g. tips.html)
- `pro-moves-habit-muster` (e.g. tips.html)
- `pro-moves-habit-water-bottle` (e.g. tips.html)
- `pro-moves-health-kit` (e.g. tips.html)
- `pro-moves-money-docs` (e.g. tips.html)
- `pro-moves-outfit-matrix` (e.g. tips.html)
- `pro-moves-tech-setup` (e.g. tips.html)
- `quick-actions` (e.g. rooms.html)
- `rooms-content` (e.g. rooms.html)
- `shore-support` (e.g. contacts.html)
- `shore-title` (e.g. contacts.html)
- `smart-habits` (e.g. tips.html)
- `specialty-group` (e.g. dining.html)
- `task-day-of-arrival` (e.g. operations.html)
- `task-luggage-tags` (e.g. operations.html)
- `task-online-checkin` (e.g. operations.html)
- `task-passports-photos` (e.g. operations.html)
- `task-payment-insurance` (e.g. operations.html)
- `todayFocusTitle` (e.g. rooms.html)
- `urgent` (e.g. contacts.html)
- `urgent-title` (e.g. contacts.html)
- `venue-cafe` (e.g. dining.html)
- `venue-chops` (e.g. dining.html)
- `venue-giovanni` (e.g. dining.html)
- `venue-izumi` (e.g. dining.html)
- `venue-main-dining` (e.g. dining.html)
- `venue-windjammer` (e.g. dining.html)

## IDs referenced in JS but not found in HTML (6)

- `deckPlanCanvas` (e.g. js/pages/decks.js)
- `deckPlanStage` (e.g. js/pages/decks.js)
- `globalStatusFeedback` (e.g. js/pages/shared-interactions.js)
- `moreDrawer` (e.g. js/shared-layout.js)
- `moreDrawerBackdrop` (e.g. js/shared-layout.js)
- `today-card` (e.g. js/pages/itinerary.js, js/shared-layout.js)

## IDs referenced in CSS but not found in HTML (4)

- `ocean` (e.g. css/index-dashboard.css)
- `today-card` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `zoomIn` (e.g. css/features/\_shared.css)
- `zoomOut` (e.g. css/features/\_shared.css)

## Classes in HTML but unused by CSS/JS (92)

- `contact-context__title` (e.g. contacts.html)
- `contact-section--emergency` (e.g. contacts.html)
- `dining-context__title` (e.g. dining.html)
- `fa-address-card` (e.g. plan.html)
- `fa-arrow-left` (e.g. rooms.html)
- `fa-arrow-right` (e.g. contacts.html, dining.html, index.html)
- `fa-bed` (e.g. index.html, photos.html, rooms.html)
- `fa-bolt` (e.g. plan.html, ports.html, rooms.html)
- `fa-calendar-day` (e.g. plan.html, ports.html)
- `fa-calendar-plus` (e.g. itinerary.html)
- `fa-chart-column` (e.g. rooms.html)
- `fa-check-circle` (e.g. rooms.html)
- `fa-chevron-left` (e.g. decks.html, photos.html)
- `fa-chevron-right` (e.g. decks.html, photos.html)
- `fa-circle-check` (e.g. index.html)
- `fa-circle-info` (e.g. itinerary.html)
- `fa-clipboard-check` (e.g. index.html, operations.html, plan.html)
- `fa-clock` (e.g. itinerary.html)
- `fa-compass` (e.g. decks.html, index.html, plan.html)
- `fa-concierge-bell` (e.g. rooms.html)
- `fa-copy` (e.g. contacts.html)
- `fa-crown` (e.g. photos.html)
- `fa-database` (e.g. offline.html)
- `fa-door-closed` (e.g. rooms.html)
- `fa-door-open` (e.g. decks.html)
- `fa-download` (e.g. photos.html)
- `fa-elevator` (e.g. rooms.html)
- `fa-envelope` (e.g. contacts.html, itinerary.html)
- `fa-exclamation-circle` (e.g. itinerary.html)
- `fa-expand` (e.g. rooms.html)
- `fa-file-pdf` (e.g. decks.html, itinerary.html)
- `fa-filter` (e.g. photos.html, rooms.html)
- `fa-hand-paper` (e.g. decks.html)
- `fa-hashtag` (e.g. photos.html)
- `fa-images` (e.g. photos.html)
- `fa-info-circle` (e.g. rooms.html)
- `fa-key` (e.g. rooms.html)
- `fa-layer-group` (e.g. photos.html, rooms.html)
- `fa-list` (e.g. photos.html)
- `fa-location-dot` (e.g. decks.html)
- `fa-map` (e.g. photos.html, plan.html, rooms.html)
- `fa-map-location-dot` (e.g. plan.html, ports.html)
- `fa-map-marked-alt` (e.g. rooms.html)
- `fa-map-pin` (e.g. itinerary.html)
- `fa-masks-theater` (e.g. decks.html)
- `fa-minus` (e.g. decks.html)
- `fa-moon` (e.g. rooms.html)
- `fa-mountain` (e.g. itinerary.html)
- `fa-phone` (e.g. contacts.html, ports.html)
- `fa-plus` (e.g. decks.html)
- `fa-print` (e.g. itinerary.html)
- `fa-rotate` (e.g. offline.html)
- `fa-rotate-left` (e.g. decks.html, photos.html)
- `fa-route` (e.g. index.html, itinerary.html, plan.html, ports.html)
- `fa-search` (e.g. decks.html, dining.html, offline.html, operations.html, photos.html, rooms.html, tips.html)
- `fa-share-alt` (e.g. itinerary.html)
- `fa-spa` (e.g. decks.html)
- `fa-star` (e.g. dining.html, ports.html)
- `fa-suitcase-rolling` (e.g. itinerary.html, tips.html)
- `fa-sun` (e.g. itinerary.html)
- `fa-swimming-pool` (e.g. itinerary.html)
- `fa-th-large` (e.g. photos.html)
- `fa-times` (e.g. decks.html, itinerary.html, rooms.html)
- `fa-triangle-exclamation` (e.g. index.html, plan.html)
- `fa-umbrella-beach` (e.g. itinerary.html)
- `fa-up-right-from-square` (e.g. photos.html)
- `fa-user-friends` (e.g. rooms.html)
- `fa-user-headset` (e.g. rooms.html)
- `fa-users` (e.g. plan.html, rooms.html)
- `fa-utensils` (e.g. dining.html, index.html, itinerary.html, photos.html, plan.html)
- `fa-water` (e.g. itinerary.html, rooms.html)
- `fa-wifi` (e.g. offline.html, plan.html)
- `fa-wine-glass` (e.g. dining.html)
- `fa-xmark` (e.g. photos.html)
- `far` (e.g. itinerary.html)
- `fas` (e.g. contacts.html, decks.html, dining.html, index.html, itinerary.html, offline.html, operations.html, photos.html, plan.html, ports.html, rooms.html, tips.html)
- `focus-grid` (e.g. rooms.html)
- `link-button` (e.g. offline.html)
- `plan-band__content` (e.g. plan.html)
- `port-band` (e.g. ports.html)
- `port-band__content` (e.g. ports.html)
- `port-band__header` (e.g. ports.html)
- `pro-moves-grid` (e.g. tips.html)
- `rccl-filter-option` (e.g. rooms.html)
- `rccl-filter-panel` (e.g. rooms.html)
- `rccl-modal` (e.g. itinerary.html, rooms.html)
- `rccl-modal__header` (e.g. itinerary.html, rooms.html)
- `rccl-tooltip-target` (e.g. rooms.html)
- `tip-card__controls` (e.g. tips.html)
- `tip-card__meta` (e.g. tips.html)
- `tip-checkbox-wrap` (e.g. tips.html)
- `tip-policy` (e.g. tips.html)

## Classes referenced in JS but not found in HTML (48)

- `badge--today` (e.g. js/pages/itinerary.js)
- `compare-toggle-btn` (e.g. js/pages/rooms.js)
- `contact-context--port` (e.g. js/pages/contacts.js)
- `contact-section--priority` (e.g. js/pages/contacts.js)
- `copy-success` (e.g. js/pages/contacts.js)
- `deck-card--context-pick` (e.g. js/pages/dining.js)
- `deck-focuschip` (e.g. js/pages/decks.js)
- `deck-hotspot` (e.g. js/pages/decks.js)
- `deck-plan-legend-item` (e.g. js/pages/decks.js)
- `deck-quickbtn` (e.g. js/pages/decks.js)
- `env-depth-0` (e.g. js/pages/decks.js)
- `fa-chevron-up` (e.g. js/pages/rooms.js)
- `filter-btn--active` (e.g. js/pages/rooms.js)
- `gallery-list-view` (e.g. js/pages/photos.js)
- `img-shimmer` (e.g. js/pages/photos.js)
- `is-collapsed` (e.g. js/pages/index.js, js/pages/itinerary.js)
- `is-complete` (e.g. js/pages/operations.js, js/pages/tips.js)
- `is-cruise-mode` (e.g. js/pages/index.js)
- `is-embark-glow` (e.g. js/pages/decks.js)
- `is-mobile-open` (e.g. js/shared-layout.js)
- `is-open` (e.g. js/pages/decks.js, js/pages/itinerary.js, js/pages/rooms.js, js/shared-layout.js)
- `is-port` (e.g. js/pages/itinerary.js)
- `is-ready` (e.g. js/pages/index.js)
- `is-reveal-pending` (e.g. js/pages/rooms.js)
- `is-revealed` (e.g. js/shared-layout.js)
- `is-sea` (e.g. js/pages/itinerary.js)
- `is-swapping` (e.g. js/pages/decks.js)
- `is-transitioning` (e.g. js/pages/decks.js)
- `is-visible` (e.g. js/pages/decks.js, js/pages/index.js)
- `itinerary-day--next` (e.g. js/pages/itinerary.js)
- `itinerary-day--today` (e.g. js/pages/itinerary.js)
- `itinerary-day--today-pulse` (e.g. js/pages/itinerary.js)
- `itinerary-day--tomorrow` (e.g. js/pages/itinerary.js)
- `mobile-collapse-toggle` (e.g. js/pages/index.js)
- `modal-continue-room` (e.g. js/pages/rooms.js)
- `modal-next-room` (e.g. js/pages/rooms.js)
- `modal-open` (e.g. js/pages/shared-interactions.js)
- `modal-prev-room` (e.g. js/pages/rooms.js)
- `more-drawer-open` (e.g. js/shared-layout.js)
- `photos-lightbox-open` (e.g. js/pages/photos.js)
- `port` (e.g. js/pages/contacts.js)
- `rccl-modal--open` (e.g. js/shared-layout.js)
- `room-card__status-bar` (e.g. js/pages/rooms.js)
- `room-card__status-line` (e.g. js/pages/rooms.js)
- `room-card--person-match` (e.g. js/pages/rooms.js)
- `room-modal--open` (e.g. js/pages/rooms.js)
- `search-status-loading` (e.g. js/pages/dining.js, js/pages/operations.js, js/pages/shared-interactions.js, js/pages/tips.js)
- `status-feedback--info` (e.g. js/pages/shared-interactions.js)

## Classes referenced in CSS but not found in HTML (568)

- `absolute` (e.g. css/utilities.css)
- `accent` (e.g. css/index-dashboard.css)
- `action-buttons` (e.g. css/mobile-first.css)
- `action-row` (e.g. css/index-dashboard.css)
- `admin-btn` (e.g. css/features/photos.css, css/pages/photos.css)
- `admin-card` (e.g. css/features/photos.css, css/pages/photos.css)
- `admin-card__title` (e.g. css/features/photos.css, css/pages/photos.css)
- `admin-field` (e.g. css/features/photos.css, css/pages/photos.css)
- `admin-stat` (e.g. css/features/photos.css, css/pages/photos.css)
- `admin-stat__label` (e.g. css/features/photos.css, css/pages/photos.css)
- `admin-stat__value` (e.g. css/features/photos.css, css/pages/photos.css)
- `admin-tool-row` (e.g. css/features/photos.css, css/pages/photos.css)
- `alert--critical` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `alert--warning` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `app-footer--minimal` (e.g. css/shared-layout.css, css/shared-layout/core.css)
- `app-footer--rccl-site` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `app-header` (e.g. css/layout.css)
- `app-header--minimal` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `app-header--rccl-site` (e.g. css/mobile-first.css, css/shared-layout.css, css/shared-layout/theming.css)
- `avatar` (e.g. css/features/\_shared.css)
- `back-to-top` (e.g. css/index-dashboard.css)
- `badge--info` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `badge--today` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `badge--warning` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `bg-accent` (e.g. css/utilities.css)
- `bg-danger` (e.g. css/utilities.css)
- `bg-dark` (e.g. css/utilities.css)
- `bg-gradient-danger` (e.g. css/utilities.css)
- `bg-gradient-primary` (e.g. css/utilities.css)
- `bg-gradient-secondary` (e.g. css/utilities.css)
- `bg-gradient-success` (e.g. css/utilities.css)
- `bg-gradient-warning` (e.g. css/utilities.css)
- `bg-gray` (e.g. css/utilities.css)
- `bg-info` (e.g. css/utilities.css)
- `bg-light` (e.g. css/utilities.css)
- `bg-primary` (e.g. css/utilities.css)
- `bg-secondary` (e.g. css/utilities.css)
- `bg-success` (e.g. css/utilities.css)
- `bg-transparent` (e.g. css/utilities.css)
- `bg-warning` (e.g. css/utilities.css)
- `bg-white` (e.g. css/utilities.css)
- `big` (e.g. css/index-dashboard.css)
- `block` (e.g. css/utilities.css)
- `border` (e.g. css/utilities.css)
- `border-accent` (e.g. css/utilities.css)
- `border-b` (e.g. css/utilities.css)
- `border-danger` (e.g. css/utilities.css)
- `border-gray` (e.g. css/utilities.css)
- `border-l` (e.g. css/utilities.css)
- `border-primary` (e.g. css/utilities.css)
- `border-r` (e.g. css/utilities.css)
- `border-secondary` (e.g. css/utilities.css)
- `border-success` (e.g. css/utilities.css)
- `border-t` (e.g. css/utilities.css)
- `border-warning` (e.g. css/utilities.css)
- `bottom-0` (e.g. css/utilities.css)
- `bottom-item` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `bottom-nav` (e.g. css/features/decks.css, css/pages/decks.css, css/shared-layout.css, css/shared-layout/theming.css)
- `bottom-nav__item` (e.g. css/features/decks.css, css/pages/decks.css, css/shared-layout.css, css/shared-layout/theming.css)
- `bottom-nav-shell` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `brand` (e.g. css/index-dashboard.css)
- `brand-sub` (e.g. css/index-dashboard.css)
- `brand-text` (e.g. css/index-dashboard.css)
- `brand-title` (e.g. css/index-dashboard.css)
- `btn--accent` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `btn--icon` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `btn--nautical` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `btn-group` (e.g. css/mobile-first.css)
- `btn-primary` (e.g. css/components.css)
- `cabin-selected` (e.g. css/decks.css)
- `card` (e.g. css/components.css, css/index-dashboard.css, css/shared-layout.css, css/shared-layout/core.css)
- `card-actions` (e.g. css/index-dashboard.css)
- `card-head` (e.g. css/index-dashboard.css)
- `card-kicker` (e.g. css/index-dashboard.css)
- `card-title` (e.g. css/index-dashboard.css)
- `checklist-card` (e.g. css/shared-layout.css, css/shared-layout/core.css)
- `chip` (e.g. css/mobile-first.css, css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `collection-admin` (e.g. css/features/photos.css, css/pages/photos.css)
- `collection-admin__stats` (e.g. css/features/photos.css, css/pages/photos.css)
- `collection-admin__tools` (e.g. css/features/photos.css, css/pages/photos.css)
- `comment` (e.g. css/features/\_shared.css)
- `comment-avatar` (e.g. css/features/\_shared.css)
- `comment-card` (e.g. css/components.css, css/features/\_shared.css)
- `comment-item` (e.g. css/features/\_shared.css)
- `compare-toggle-btn` (e.g. css/features/rooms.css, css/pages/rooms.css)
- `comparison-column` (e.g. css/features/rooms.css, css/pages/rooms.css)
- `comparison-list` (e.g. css/features/rooms.css, css/pages/rooms.css)
- `contact-context--port` (e.g. css/features/contacts.css, css/pages/contacts.css)
- `contact-section--priority` (e.g. css/features/contacts.css, css/pages/contacts.css)
- `container-fluid` (e.g. css/utilities.css)
- `container-lg` (e.g. css/utilities.css)
- `container-md` (e.g. css/utilities.css)
- `container-sm` (e.g. css/utilities.css)
- `copy-success` (e.g. css/features/contacts.css, css/pages/contacts.css)
- `count-chip--strong` (e.g. css/features/decks.css, css/pages/decks.css)
- `countdown` (e.g. css/index-dashboard.css)
- `countdown-unit` (e.g. css/features/index.css, css/pages/index.css)
- `css` (e.g. css/base.css, css/features.css, css/features/\_shared.css, css/mobile-first.css)
- `cursor-default` (e.g. css/utilities.css)
- `cursor-not-allowed` (e.g. css/utilities.css)
- `cursor-pointer` (e.g. css/utilities.css)
- `cursor-wait` (e.g. css/utilities.css)
- `day-btn--today` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `day-card` (e.g. css/features/\_shared.css, css/shared-layout.css, css/shared-layout/theming.css)
- `day-navigation__description` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `day-navigation__tools` (e.g. css/features/itinerary.css, css/pages/itinerary.css)
- `deck-card--context-pick` (e.g. css/features/dining.css, css/pages/dining.css)
- `deck-card--entertainment` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-card--essential` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-card--urgent` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `deck-card--wellness` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-container` (e.g. css/decks.css)
- `deck-focuschip` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-hero__accent` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-hotspot` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-link-pill` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `deck-page` (e.g. css/decks.css)
- `deck-plan-canvas` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-plan-hotspots` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-plan-legend` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-plan-legend-item` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-plan-media` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-plan-skeleton` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-plan-stage` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-quickbtn` (e.g. css/features/decks.css, css/pages/decks.css, css/shared-layout/theming.css)
- `deck-quickbtn__num` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-quickbtn__sub` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-title` (e.g. css/features/decks.css, css/pages/decks.css)
- `deck-tooltip` (e.g. css/decks.css)
- `deck-viewer` (e.g. css/decks.css)
- `description` (e.g. css/mobile-first.css)
- `dining-hero` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `dining-spine__item` (e.g. css/features/dining.css, css/pages/dining.css)
- `divider` (e.g. css/pages/rooms.css)
- `dot` (e.g. css/index-dashboard.css)
- `drawer` (e.g. css/index-dashboard.css)
- `drawer-backdrop` (e.g. css/index-dashboard.css)
- `drawer-foot` (e.g. css/index-dashboard.css)
- `drawer-head` (e.g. css/index-dashboard.css)
- `drop-zone` (e.g. css/features/photos.css, css/pages/photos.css)
- `drop-zone__input` (e.g. css/features/photos.css, css/pages/photos.css)
- `drop-zone__meta` (e.g. css/features/photos.css, css/pages/photos.css)
- `drop-zone__title` (e.g. css/features/photos.css, css/pages/photos.css)
- `env-depth-0` (e.g. css/pages/decks.css)
- `env-depth-1` (e.g. css/pages/decks.css)
- `env-depth-2` (e.g. css/pages/decks.css)
- `env-depth-3` (e.g. css/pages/decks.css)
- `env-depth-4` (e.g. css/pages/decks.css)
- `family-finder__quick-btn` (e.g. css/features/rooms.css, css/pages/rooms.css)
- `family-finder__quick-btn--favorite` (e.g. css/features/rooms.css, css/pages/rooms.css)
- `featured-card` (e.g. css/features/photos.css, css/pages/photos.css, css/shared-layout.css, css/shared-layout/theming.css)
- `featured-card__chips` (e.g. css/features/photos.css, css/pages/photos.css)
- `featured-card__img` (e.g. css/features/photos.css, css/pages/photos.css, css/shared-layout.css)
- `featured-card__meta` (e.g. css/features/photos.css, css/pages/photos.css)
- `featured-card__name` (e.g. css/features/photos.css, css/pages/photos.css)
- `featured-card__overlay` (e.g. css/features/photos.css, css/pages/photos.css)
- `filter-btn--active` (e.g. css/features/rooms.css, css/pages/rooms.css)
- `fixed` (e.g. css/utilities.css)
- `flex` (e.g. css/utilities.css)
- `flex-1` (e.g. css/utilities.css)
- `flex-auto` (e.g. css/utilities.css)
- `flex-col` (e.g. css/utilities.css)
- `flex-none` (e.g. css/utilities.css)
- `flex-wrap` (e.g. css/utilities.css)
- `font-bold` (e.g. css/utilities.css)
- `font-extrabold` (e.g. css/utilities.css)
- `font-medium` (e.g. css/utilities.css)
- `font-normal` (e.g. css/utilities.css)
- `font-semibold` (e.g. css/utilities.css)
- `footer-actions` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-brand` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-brand-mark` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `footer-brands` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `footer-columns` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-container` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css, css/shared-layout/theming.css)
- `footer-copyright` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `footer-country` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `footer-country__btn` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `footer-cta` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-cta--secondary` (e.g. css/shared-layout.css, css/shared-layout/core.css)
- `footer-essentials` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-heading` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-legal` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-legal__link` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/theming.css)
- `footer-legal__text` (e.g. css/shared-layout.css, css/shared-layout/core.css)
- `footer-legal-links` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `footer-logo` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-meta` (e.g. css/mobile-first.css, css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-nav` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-nav__link` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-panel` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-panel__meta` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-panel__title` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-primary` (e.g. css/mobile-first.css, css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-separator` (e.g. css/shared-layout.css, css/shared-layout/core.css)
- `footer-social` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-social__link` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css, css/shared-layout/theming.css)
- `footer-social-row` (e.g. css/shared-layout.css, css/shared-layout/theming.css)
- `footer-subheading` (e.g. css/shared-layout.css, css/shared-layout/core.css, css/shared-layout/responsive.css)
- `footer-tagline` (e.g. css/shared-layout.css, css/shared-layout/core.css)
- ... 368 more

## Page Entrypoint Mapping (HTML -> JS)

- contacts.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/contacts.js
  - Inline script blocks: 0
- deck-debug.html
  - JS entrypoints: js/global.js
  - Inline script blocks: 0
- decks.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/decks.js
  - Inline script blocks: 0
- dining.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/dining.js
  - Inline script blocks: 0
- index.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/index.js
  - Inline script blocks: 0
- itinerary.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/itinerary.js
  - Inline script blocks: 0
- offline.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/offline.js
  - Inline script blocks: 0
- operations.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/operations.js
  - Inline script blocks: 0
- photos.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/photos.js
  - Inline script blocks: 0
- plan.html
  - JS entrypoints: js/shared-layout.js
  - Inline script blocks: 0
- ports.html
  - JS entrypoints: js/shared-layout.js
  - Inline script blocks: 0
- rooms.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/rooms.js
  - Inline script blocks: 0
- tips.html
  - JS entrypoints: js/shared-layout.js, js/pages/shared-interactions.js, js/pages/tips.js
  - Inline script blocks: 0
- tools/\_archive/pages/dashboard.html
  - JS entrypoints: (none)
  - Inline script blocks: 1
- tools/\_archive/pages/svg-crop.html
  - JS entrypoints: (none)
  - Inline script blocks: 1

## Page-Scoped JS Selector Mismatches

### contacts.html

- DOM: 21 ids, 53 classes
- JS refs (entrypoints + inline): 7 ids, 10 classes
- Missing IDs: 1
- Missing classes: 2
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `modal-open`, `port`

### deck-debug.html

- DOM: 0 ids, 0 classes
- JS refs (entrypoints + inline): 0 ids, 0 classes
- Missing IDs: 0
- Missing classes: 0
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0

### decks.html

- DOM: 25 ids, 74 classes
- JS refs (entrypoints + inline): 20 ids, 18 classes
- Missing IDs: 3
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `deckPlanCanvas`, `deckPlanStage`, `globalStatusFeedback`
- Missing class examples: `modal-open`

### dining.html

- DOM: 27 ids, 67 classes
- JS refs (entrypoints + inline): 13 ids, 8 classes
- Missing IDs: 1
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `modal-open`

### index.html

- DOM: 12 ids, 55 classes
- JS refs (entrypoints + inline): 5 ids, 13 classes
- Missing IDs: 1
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `modal-open`

### itinerary.html

- DOM: 17 ids, 79 classes
- JS refs (entrypoints + inline): 11 ids, 17 classes
- Missing IDs: 2
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`, `today-card`
- Missing class examples: `modal-open`

### offline.html

- DOM: 14 ids, 57 classes
- JS refs (entrypoints + inline): 8 ids, 4 classes
- Missing IDs: 1
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `modal-open`

### operations.html

- DOM: 21 ids, 40 classes
- JS refs (entrypoints + inline): 8 ids, 6 classes
- Missing IDs: 1
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `modal-open`

### photos.html

- DOM: 26 ids, 70 classes
- JS refs (entrypoints + inline): 25 ids, 10 classes
- Missing IDs: 1
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `modal-open`

### plan.html

- DOM: 5 ids, 43 classes
- JS refs (entrypoints + inline): 0 ids, 0 classes
- Missing IDs: 0
- Missing classes: 0
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0

### ports.html

- DOM: 4 ids, 36 classes
- JS refs (entrypoints + inline): 0 ids, 0 classes
- Missing IDs: 0
- Missing classes: 0
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0

### rooms.html

- DOM: 41 ids, 143 classes
- JS refs (entrypoints + inline): 30 ids, 34 classes
- Missing IDs: 1
- Missing classes: 5
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `fa-chevron-up`, `modal-continue-room`, `modal-next-room`, `modal-open`, `modal-prev-room`

### tips.html

- DOM: 22 ids, 42 classes
- JS refs (entrypoints + inline): 7 ids, 5 classes
- Missing IDs: 1
- Missing classes: 1
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
- Missing ID examples: `globalStatusFeedback`
- Missing class examples: `modal-open`

### tools/\_archive/pages/dashboard.html

- DOM: 0 ids, 0 classes
- JS refs (entrypoints + inline): 0 ids, 0 classes
- Missing IDs: 0
- Missing classes: 0
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0

### tools/\_archive/pages/svg-crop.html

- DOM: 0 ids, 0 classes
- JS refs (entrypoints + inline): 0 ids, 0 classes
- Missing IDs: 0
- Missing classes: 0
- Unsuppressed missing IDs: 0
- Unsuppressed missing classes: 0
