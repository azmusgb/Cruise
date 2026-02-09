## `index.html` Dashboard Critique

### Strengths
- **Clear structure**: Logical sections (`Plan`, `Stay`, `Explore`, sidebar) with good semantic tags (`main`, `section`, `aside`).
- **Consistent design language**: Reuses shared `card`, `badge`, `timeline`, `stats` components from the design system.
- **Minimal JS complexity**: Only two behaviors (save contacts + countdown + task buttons) and both are easy to follow.
- **Responsive-friendly layout**: Uses the same container and grid system as other pages, likely already tuned in `styles.css`.

### Issues & Risks

1. **Inline JavaScript in the HTML**
   - **Location**: Lines 493–588.
   - **Issue**: Large `<script>` block embedded directly in the HTML hurts maintainability and makes reuse/testing harder.
   - **Impact**: Harder to share logic, to lint, and to cache separately from markup.
   - **Recommendation**: Move to a dedicated `index.js` file loaded with `defer`, mirroring what we did for `itinerary.html`.

2. **No skip link for keyboard users**
   - **Location**: Top of `<body>`.
   - **Issue**: There is no “Skip to main content” link, so keyboard users must tab through header and hero content each time.
   - **Impact**: Worse accessibility and UX, especially given this is a navigation-heavy dashboard.
   - **Recommendation**: Add a `skip-link` anchored to `#main-content` and give the `main` element an `id`.

3. **Countdown edge case when cruise has started**
   - **Location**: Lines 518–523 and 537–542.
   - **Issue**: When `timeDiff <= 0`, only elements with class `.countdown__value` are set to `00`. Sidebar values use `.countdown-display__value`, so they keep stale values once embarkation passes.
   - **Impact**: Inaccurate sidebar countdown after cruise start.
   - **Recommendation**: Explicitly set both hero and sidebar countdown elements to `00`, and optionally clear the interval.

4. **Magic numbers / hardcoded timings**
   - **Location**:
     - Line 515: `new Date('2026-02-14T15:00:00')`
     - Line 547: `setInterval(updateCountdown, 60000)`
     - Lines 504–508: `setTimeout(..., 2000)`
     - Lines 581–585: `setTimeout(..., 3000)`
   - **Issue**: Multiple magic numbers sprinkled in the script.
   - **Impact**: Harder to adjust behavior (embarkation time, refresh intervals, animation delays) from a single place.
   - **Recommendation**: Extract to named constants at the top of the JS module.

5. **Limited accessibility feedback for interactive actions**
   - **Location**: Save-to-phone button and task buttons.
   - **Issue**:
     - Save button only changes label visually to “Saved!”; there is no ARIA live region to announce status.
     - Task buttons give visual feedback but no programmatic status update.
   - **Impact**: Screen reader users might not realize actions succeeded.
   - **Recommendation**: Either hook into the global toast system (if used on this page) or add a small `aria-live="polite"` region for inline status.

6. **Fragile parsing of the “3 Urgent” badge**
   - **Location**: Lines 569–577.
   - **Issue**: Uses `parseInt(urgentBadge.textContent)` against a string like `"3 Urgent"`. This works today, but will break if copy changes (e.g., “3 urgent tasks”).
   - **Impact**: Urgent count might become NaN and stop updating silently.
   - **Recommendation**: Extract the number via regex or keep the count in a data attribute / JS variable.

7. **No shared constants for embarkation metadata**
   - **Location**: Countdown function and sidebar note text.
   - **Issue**: Embarkation date/time is hard-coded in JS (`2026-02-14T15:00:00`) and in the sidebar copy (“Feb 14, 3:00 PM”).
   - **Impact**: Easy to get out of sync if you tweak sailing details in one place.
   - **Recommendation**: Centralize cruise metadata (date, time, ports) either in `shared-layout.js` or a small config object in `index.js`.

8. **No `type="button"` on interactive buttons**
   - **Location**: All `<button>` elements.
   - **Issue**: They default to `type="submit"`. This is harmless now (no forms), but brittle if a button is ever moved into a `<form>`.
   - **Recommendation**: Add `type="button"` consistently to non-submit buttons (e.g., `#saveContacts`, task buttons).

### Recommended Fixes (What I’ll Implement)

1. **Extract inline script to `index.js`**
   - Move all DOMContentLoaded logic into a new `index.js`.
   - Load it with `<script src="index.js" defer></script>` at the bottom of the page.

2. **Add accessibility improvements**
   - Add a skip link and `id="main-content"` to `main`.
   - Add `type="button"` to interactive buttons.

3. **Harden countdown logic**
   - Introduce constants for embarkation date/time and intervals.
   - Ensure both hero and sidebar countdowns show `00` after embarkation and clear the interval.

4. **Make urgent-badge updates robust**
   - Parse the numerical part of the urgent count via regex before decrementing.
   - Hide the badge when the count reaches zero.

5. **Optional a11y enhancement**
   - Add a small `aria-live="polite"` region in the sidebar to announce “Contacts saved” or “Task completed” if desired, or integrate with the existing toast system later.

All of these changes will be applied directly to `index.html` and the new `index.js` so the dashboard matches the quality and structure of the updated itinerary page.

