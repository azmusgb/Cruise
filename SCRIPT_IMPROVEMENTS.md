# Script.js Improvements Summary

## Changes Made

### 1. **Extracted Shared Modules** ✅

Created three new ES module files that can be imported by any page script:

- **`config.js`**: 
  - Centralized `CONFIG` object with cruise metadata, ports, storage keys, breakpoints
  - Exports `CRUISE_METADATA` for convenience
  - Single source of truth for cruise-specific data

- **`errors.js`**: 
  - `ErrorHandler` class extracted
  - Handles error logging, analytics integration (Google Analytics, Sentry)
  - User-friendly error toast display

- **`storage.js`**: 
  - `StorageManager` class extracted
  - Wraps localStorage with availability checks and error handling
  - App-specific convenience methods (preferences, search history, deck plans)

### 2. **Updated script.js** ✅

- **Removed duplicate code**: Deleted inline `CONFIG`, `ErrorHandler`, and `StorageManager` definitions
- **Added ES module imports**: Now imports from `config.js`, `errors.js`, `storage.js`
- **Backward compatibility**: Re-exports classes to `window` for legacy code that expects globals
- **Improved documentation**: Added header comments explaining module structure
- **Better initialization**: Added `bootstrapCruiseApp()` function that:
  - Detects current page context
  - Only initializes legacy app if needed (skips for pages with new scripts)
  - Provides clearer error handling

### 3. **Clarified API Endpoint Usage** ✅

- Added comment in `WeatherManager` noting that it uses Open-Meteo directly
- Documented that `CONFIG.API_ENDPOINTS.WEATHER` is a placeholder for future use

## Benefits

1. **Reduced duplication**: Cruise metadata now defined once in `config.js`
2. **Better organization**: Core utilities separated from application logic
3. **Easier maintenance**: Changes to cruise dates/ports only need to happen in one place
4. **Reusability**: New page scripts (`index.js`, `itinerary.js`, `rooms.js`) can import shared modules
5. **Backward compatible**: Legacy code still works via `window` exports

## Migration Path

### For New Pages
Use the extracted modules:
```javascript
import { CONFIG, CRUISE_METADATA } from './config.js';
import { ErrorHandler } from './errors.js';
import { StorageManager } from './storage.js';
```

### For Legacy Pages
`script.js` still works but should be loaded as an ES module:
```html
<script type="module" src="script.js"></script>
```

The bootstrap function will detect if the page needs the legacy app or can skip it.

## Next Steps (Future Improvements)

1. **Extract more modules**: Consider extracting `SearchManager`, `NavigationManager`, `WeatherManager` into separate modules
2. **Remove global exports**: Once all code is migrated to ES modules, remove `window.*` exports
3. **Page-specific bundles**: Create separate entry points for different pages to reduce bundle size
4. **TypeScript**: Consider migrating to TypeScript for better type safety

## Files Changed

- ✅ Created: `config.js`
- ✅ Created: `errors.js`
- ✅ Created: `storage.js`
- ✅ Updated: `script.js` (removed ~280 lines of duplicate code, added imports and bootstrap)
- ✅ Created: `SCRIPT_IMPROVEMENTS.md` (this file)

## Testing Notes

- All files pass linting with no errors
- Backward compatibility maintained via `window` exports
- ES module syntax requires `type="module"` when loading `script.js` in HTML
