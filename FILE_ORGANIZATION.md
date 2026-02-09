# File Organization - Directory Structure

## Overview

All JavaScript and CSS files have been organized into dedicated subdirectories following web development best practices.

## Directory Structure

```
Cruise/
├── js/                          # JavaScript files
│   ├── config.js               # Shared configuration
│   ├── errors.js               # ErrorHandler class
│   ├── storage.js              # StorageManager class
│   ├── script.js               # Main application orchestrator
│   ├── index.js                # Dashboard page script
│   ├── itinerary.js            # Itinerary page script
│   ├── rooms.js                # Rooms page script
│   ├── shared-layout.js        # Shared layout component
│   ├── service-worker-registration.js  # SW registration
│   └── sw.js                   # Service worker
│
├── css/                         # Stylesheet files
│   ├── styles.css              # Main stylesheet
│   └── styles.css.bak          # Backup (can be removed)
│
├── icons/                       # App icons
├── deck-plans/                  # Deck plan images
├── decks/                       # Deck plan assets
└── *.html                       # HTML pages (root level)
```

## Updated File References

### HTML Files
All HTML files have been updated to reference the new paths:

- **CSS**: `css/styles.css` (was `styles.css`)
- **JS**: `js/[filename].js` (was `[filename].js`)

### JavaScript Imports
ES module imports within the `js/` directory use relative paths:
- `import { CONFIG } from './config.js'`
- `import { ErrorHandler } from './errors.js'`
- `import { StorageManager } from './storage.js'`

### Service Worker
- Updated to cache assets from `js/` and `css/` directories
- Registration path: `js/sw.js` (was `sw.js`)

## Files Updated

### HTML Files (9 files)
- ✅ `index.html`
- ✅ `itinerary.html`
- ✅ `rooms.html`
- ✅ `tips.html`
- ✅ `decks.html`
- ✅ `dining.html`
- ✅ `offline.html`
- ✅ `operations.html`
- ✅ `svg-crop.html`

### JavaScript Files
- ✅ `js/sw.js` - Updated cache paths
- ✅ `js/service-worker-registration.js` - Updated SW path
- ✅ `js/script.js` - Updated SW registration paths

## Benefits

1. **Better Organization**: Clear separation of concerns
2. **Easier Maintenance**: Related files grouped together
3. **Industry Standard**: Follows common web project structure
4. **Scalability**: Easy to add more JS/CSS files without cluttering root
5. **Build Tools**: Easier to configure bundlers/build tools if needed later

## Migration Notes

- All relative paths in HTML have been updated
- ES module imports use relative paths within `js/` directory
- Service worker cache paths updated
- No breaking changes to functionality

## Next Steps (Optional)

1. **Remove backup file**: `css/styles.css.bak` can be deleted
2. **Add .gitignore entries**: Consider ignoring `*.bak` files
3. **Build process**: If adding a build step, configure it to output to `js/` and `css/`
