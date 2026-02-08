# Style Inventory

This repository’s styling is sourced from a combination of global CSS, external libraries, and runtime style mutations in JavaScript. Below is a consolidated inventory of those style sources.

## 1) Global Stylesheets
- **`styles.css`** is the primary stylesheet and contains design tokens (CSS variables), reset/base styles, layout primitives, component styles, page-specific sections, utilities, and print styles.

## 2) External Stylesheets (CDN)
- **Font Awesome** is loaded across the HTML pages for iconography.
- **Google Fonts** are loaded across the HTML pages for typography (Montserrat for display/heading styles and Inter for body text).

## 3) Inline Styles in HTML
- **`rooms.html`** includes an inline `style` attribute to hide the room skeleton grid before it is shown by JavaScript.

## 4) JavaScript Style Mutations
Runtime styling is applied in JavaScript to manage interactive UI behaviors. These mutations occur in:
- **`script.js`** for shared UI behaviors (e.g., accordions, tooltips, filters, overlays, and state-driven visual updates).
- **Page-specific scripts embedded in HTML** (e.g., `tips.html`, `rooms.html`, `itinerary.html`, `dining.html`, `operations.html`, `decks.html`) for animations, reveal effects, and component interactions.

## 5) Service Worker & Asset Handling
- **`sw.js`** does not define styles directly but references `style` in request destination handling for caching logic.
