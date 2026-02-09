## `script.js` Core App Critique

### High-level overview

`script.js` (~4,200 lines) is a **monolithic core** for the “Cruise Companion” app. It centralizes:

- Global configuration (`CONFIG`), storage keys, ports, and cruise metadata.
- Cross-cutting utilities: `ErrorHandler`, `StorageManager`, search indexer, navigation manager, weather service, etc.
- Page and feature orchestration: navigation between sections, indexing content, syncing, weather, offline/deck-plans, and more.

It’s thoughtfully structured in sections and uses modern JS features, but its size and coupling now conflict with the newer per-page scripts (`index.js`, `itinerary.js`, `rooms.js`).

---

### Strengths

- **Centralized configuration**: `CONFIG` bundles cruise details, ports, storage keys, breakpoints, and placeholder API endpoints in one place.
- **Robust error handling**:
  - `ErrorHandler` class captures errors with metadata (timestamp, user agent, URL).
  - Optional integration paths for Google Analytics (`gtag`) and Sentry are guarded with `typeof` checks.
  - `showUserFriendlyError()` surfaces UI-level error toasts.
- **Resilient storage abstraction**:
  - `StorageManager` wraps `localStorage` with availability checks and try/catch protection.
  - Provides app-specific helpers (`savePreferences`, `loadPreferences`, etc.) keyed off `CONFIG.STORAGE_KEYS`.
- **Search & navigation sophistication**:
  - Search indexer escapes HTML and regex safely (`escapeHtml`, `escapeRegExp`) and supports highlighted results.
  - `NavigationManager` tracks current/previous section, maintains a small history, updates hash, scrolls smoothly, and notifies observers.
- **Weather service abstraction**:
  - Supports both mock and real weather sources (`getMockWeather` vs `fetchApiWeather`).
  - Uses Open-Meteo API with per-port forecast and mapping from codes to friendly labels/icons.
  - Utility for converting °C→°F and deriving forecast data for each cruise day.
- **Defensive coding patterns**:
  - Frequent option objects and default values.
  - Many methods handle invalid states with early returns and error logging.

---

### Key issues & risks

#### 1. Monolithic, multi-responsibility module
- **Issue**: One 4k+ line file houses **configuration, domain models, services, UI logic, and navigation**.
- **Impact**:
  - Difficult to reason about and test in isolation.
  - Harder to tree-shake or share only what each page needs.
  - Increases regression risk when touching unrelated features.
- **Recommendation**:
  - Break into **modules by concern**, e.g.:
    - `config.js` (CONFIG, storage keys, cruise metadata)
    - `errors.js` (`ErrorHandler`)
    - `storage.js` (`StorageManager`)
    - `search.js` (index + highlighter)
    - `navigation.js` (`NavigationManager`)
    - `weather.js` (weather fetching/mapping)
  - Then import only what each page needs (or bundle separate entrypoints).

#### 2. Divergence from new per-page scripts
- **Context**: You now have `index.js`, `itinerary.js`, and `rooms.js` with **page-local logic and constants** (e.g. embarkation dates, toast handling, storage keys).
- **Issue**:
  - Cruise constants and behaviors (countdown dates, embarkation times, muster station, ports) exist here **and** in per-page files.
  - Potential for subtle mismatches: a date or port list change may only be updated in one place.
- **Recommendation**:
  - Move **authoritative cruise metadata** into a small, shared `config.js` (or a `CRUISE` export) that all scripts consume.
  - Clearly distinguish **core utilities** (kept in this module family) from **page-specific behavior** (lives alongside each HTML file).

#### 3. Global side effects / DOM coupling
- **Issue**:
  - Many classes assume direct access to `document`, `window`, and exact selectors (e.g. `section[id]`, `.nav-day-btn[data-day]`, etc.).
  - This couples classes to specific markup and makes them harder to reuse across pages or in tests.
- **Impact**:
  - Code may run on pages that don’t have the expected structure, requiring defensive checks everywhere.
  - Harder to migrate to a component-based or module-based architecture later.
- **Recommendation**:
  - Parameterize DOM dependencies: pass in root elements, selectors, or callbacks from the page script that instantiates these services.
  - Where feasible, **lazily initialize** features only when relevant containers/elements exist.

#### 4. Implicit initialization order & lifecycle
- **Issue**:
  - The file registers managers and listeners in sequence without a clear “bootstrap” abstraction.
  - Complex classes (navigation, search, weather) may depend on each other’s side effects or on DOM that may not have fully loaded (depending on how/when `script.js` is included).
- **Impact**:
  - Harder to know the correct initialization order.
  - Increases risk of race conditions when pages are loaded differently or scripts are split.
- **Recommendation**:
  - Introduce a small `init()` or `bootstrap()` function that wires up managers in one place.
  - Consider separate bootstrap per page/section, e.g. `initDashboardFeatures()`, `initItineraryFeatures()`, etc., invoked conditionally based on `data-page` or presence of specific DOM roots.

#### 5. API placeholder vs. actual usage
- **Issue**:
  - `CONFIG.API_ENDPOINTS` lists generic endpoints (`WEATHER`, `UPDATES`, `SYNC`), but much of the weather logic uses Open-Meteo directly instead.
- **Impact**:
  - Future developers may be confused which endpoint is authoritative or actually in use.
- **Recommendation**:
  - Either:
    - Wire the weather service to consume `CONFIG.API_ENDPOINTS.WEATHER`, or
    - Clearly mark unused endpoints as placeholders in comments (or remove them until needed).

#### 6. Limited environment/config separation
- **Issue**:
  - All config (dates, ports, API URLs, SAILING_NUMBER, etc.) is hard-coded in this file.
- **Impact**:
  - Switching to a different sailing or reusing the hub for another cruise requires editing code, not a config file.
- **Recommendation**:
  - Extract **cruise-specific data** into a separate JSON or module (`cruise-config.js`) so the app logic remains generic.

#### 7. Potential duplication of utility logic
- **Context**: Newer per-page scripts already implement:
  - Toast helpers
  - localStorage wrappers
  - Date constants and countdown logic
- **Issue**:
  - Similar helpers exist here (`StorageManager`, error toasts, etc.), meaning logic is now split between old core and new per-page modules.
- **Recommendation**:
  - Decide on a **single source of truth** for:
    - Storage utilities
    - Toast/notification helpers
    - Date/time/countdown utilities
  - Refactor per-page code to import from shared modules instead of duplicating.

---

### Suggested refactor strategy (incremental)

Because `script.js` is large and interwoven, refactoring should be **incremental** rather than a single “big bang”:

1. **Phase 1 – Identify live usage**
   - Grep the codebase for each class (`ErrorHandler`, `StorageManager`, `NavigationManager`, `SearchIndex`, `WeatherService`, etc.).
   - Mark which are **still used** versus which have been effectively replaced by the new page-specific scripts.

2. **Phase 2 – Extract stable utilities**
   - Move `ErrorHandler` and `StorageManager` (and their `CONFIG` dependencies) into separate modules.
   - Update any referencing code (including new `index.js`/`itinerary.js`/`rooms.js` where appropriate) to import from these modules.

3. **Phase 3 – Split feature services**
   - Extract `WeatherService` into `weather.js`.
   - Extract search/indexing into `search.js`.
   - Extract navigation into `navigation.js`.

4. **Phase 4 – Trim unused / legacy code**
   - Once pages are no longer importing from the monolithic `script.js`, remove or archive any sections that are truly unused.

5. **Phase 5 – Replace global `script.js` include**
   - Stop including `script.js` globally.
   - Instead, load only the page-specific bundles (`index.js`, `itinerary.js`, `rooms.js`, plus shared modules they import).

---

### Recommended immediate actions (low-risk)

If you want to improve things without a full rewrite right now:

1. **Document module boundaries inside `script.js`**  
   Add clear comment headers that identify which blocks can be safely reused (errors, storage, weather) vs. which are tightly coupled to old pages.

2. **Create a small `config.js`**  
   Extract `CONFIG` into its own module and import it both from this file and from your newer per-page scripts so that:
   - Cruise dates, ports, and storage keys are defined only once.

3. **Stop adding new features to `script.js`**  
   For any new behavior, follow the pattern you’ve started:
   - Put page-specific logic in `index.js`/`itinerary.js`/`rooms.js`.
   - Add shared helpers in small, focused shared modules (not this monolith).

This will keep `script.js` stable and reduce the risk surface while you gradually migrate functionality into a more modular structure.

