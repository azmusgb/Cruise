# Styling Inventory (Desktop + Mobile)

Generated inventory of styling-related assets and usage patterns across tracked source files (excluding `node_modules/` and `.git/`).

## 1) Stylesheet Sources

- `css/styles.css`: 3574 lines, 27 `@media` blocks, 138 CSS custom property definitions.
- `css/styles.css.bak`: 4345 lines, 44 `@media` blocks, 155 CSS custom property definitions.

## 2) HTML files linking stylesheets

- `decks.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`
- `dining.html`:
  - `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap`
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css`
  - `css/styles.css`
- `index.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`
- `itinerary.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`
- `offline.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`
- `operations.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`
- `rooms.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`
- `svg-crop.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`
- `tips.html`:
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap`
  - `css/styles.css`

## 3) Inline styling in HTML

- `itinerary.html`: `<style>` blocks=0, `style="..."` attributes=4

## 4) Responsive/mobile breakpoints (`@media`)

- `css/styles.css`: 26 total
  - `max-width: 768px`
  - `min-width: 640px`
  - `min-width: 768px`
  - `min-width: 1024px`
  - `max-width: 1024px`
  - `max-width: 640px`
  - `max-width: 480px`
  - `prefers-reduced-motion: reduce`
  - `prefers-color-scheme: dark`
- `css/styles.css.bak`: 43 total
  - `prefers-reduced-motion: reduce`
  - `max-width: 767px`
  - `min-width: 768px`
  - `min-width: 1024px`
  - `max-width: 768px`
  - `max-width: 480px`
  - `hover: none`
  - `hover: hover`
  - `max-width: 380px`
  - `max-width: 900px`
  - `min-width: 1200px`
  - `min-width: 769px`

## 5) JS-driven styling behavior

- `js/errors.js`: classList=3
- `js/index.js`: classList=4, style property writes=2
- `js/itinerary-experience.js`: style property writes=2, setProperty=1
- `js/itinerary.js`: classList=15, style property writes=19
- `js/rooms.js`: classList=2
- `js/script.js`: classList=67, style property writes=44
- `js/shared-layout.js`: classList=8, style property writes=17, matchMedia=2

## 6) CSS class usage volume in HTML

- `decks.html`: 100 class tokens, 73 unique classes
- `dining.html`: 152 class tokens, 49 unique classes
- `index.html`: 114 class tokens, 47 unique classes
- `itinerary.html`: 105 class tokens, 79 unique classes
- `offline.html`: 110 class tokens, 42 unique classes
- `operations.html`: 103 class tokens, 42 unique classes
- `rooms.html`: 92 class tokens, 42 unique classes
- `svg-crop.html`: 82 class tokens, 38 unique classes
- `tips.html`: 137 class tokens, 47 unique classes
