# Image Asset Organization

The image library is organized by content type so pages can reference stable, descriptive paths.

## Core placeholder sets

- `heroes/`
  - `hero-adventure-exterior.jpg`
  - `hero-cococay.jpg`
  - `hero-port-canaveral.jpg`
- `venues/`
  - `cafe-promenade-card.jpg`
  - `cafe-promenade-thumb.jpg`
  - `windjammer-card.jpg`
  - `windjammer-thumb.jpg`
  - `main-dining-card.jpg`
  - `main-dining-thumb.jpg`
- `rooms/`
  - `interior-card.jpg`
  - `interior-thumb.jpg`
  - `promenade-view-card.jpg`
  - `promenade-view-thumb.jpg`
- `ports/`
  - `cococay-card.jpg`
  - `cococay-thumb.jpg`
  - `grand-cayman-card.jpg`
  - `grand-cayman-thumb.jpg`
  - `falmouth-card.jpg`
  - `falmouth-thumb.jpg`

## Reorganized source imagery

Additional Royal Caribbean photos were moved out of the `images/` root and grouped into:

- `ship/` for ship-wide exterior/deck visuals
- `venues/` for onboard venue and dining visuals
- `ports/` for destination-specific visuals

This keeps the root directory clean and makes HTML wiring easier to maintain.
