## `rooms.html` Staterooms Page Critique

### Strengths

- **Clear content structure**: Uses `main`, `section`, semantic headings, and a well-structured `room-card` pattern that’s easy to scan.
- **Good accessibility baseline**:
  - Skip link (`.skip-to-content`) to jump to `#mainContent`.
  - ARIA labels on copy buttons and `aria-label` on the room grid.
  - Screen-reader live region (`#liveAnnouncement`) to announce copy success.
- **Print-friendly intent**: Custom `@media print` styles tailored for stateroom lists.
- **Consistent design language**: Reuses shared `styles.css` tokens, icons, and button styles, keeping the page visually aligned with the rest of the hub.

### Issues & Risks

1. **Inline print `<style>` block**
   - **Location**: Lines 10–42.
   - **Issue**: Page-specific `@media print` rules live directly in the HTML head, while the rest of the app’s print rules live in `styles.css`.
   - **Impact**: Split styling concerns and harder maintenance; duplication with the existing global print block.
   - **Recommendation**: Merge these print rules into the central `@media print` in `styles.css` and remove the inline `<style>`.

2. **Inline JavaScript block**
   - **Location**: Lines 325–374.
   - **Issue**: All behavior (copy-to-clipboard, toast, equalizing feature list heights) is embedded as an inline `<script>`.
   - **Impact**: Mirrors earlier issues on `index.html`/`itinerary.html`: harder to reuse, test, lint, and cache.
   - **Recommendation**: Move to `rooms.js` and load with `defer`.

3. **Clipboard API feature detection**
   - **Location**: Lines 337–345.
   - **Issue**: Assumes `navigator.clipboard.writeText` is available; older browsers and some privacy modes will throw or reject.
   - **Impact**: Copy interaction may silently fail or throw errors without a clear fallback.
   - **Recommendation**: Check for `navigator.clipboard && navigator.clipboard.writeText`; if unavailable, show a friendly message suggesting manual copy.

4. **Minimal error feedback to assistive tech**
   - **Location**: Copy error path (lines 343–345).
   - **Issue**: On failure, only the visual toast is updated; `#liveAnnouncement` is not updated with an error message.
   - **Impact**: Screen-reader users won’t get feedback that copy failed.
   - **Recommendation**: Mirror both success and error messages into `#liveAnnouncement`.

5. **Redundant `preventDefault()` on buttons**
   - **Location**: Line 333.
   - **Issue**: `e.preventDefault()` is used on a `<button type="button">`; there is no default navigation or form submission to prevent.
   - **Impact**: Not harmful, but unnecessary; it slightly obscures intent.
   - **Recommendation**: Remove or justify if later converted to a non-button element.

6. **Print styles partially duplicated with global styles**
   - **Location**: Inline `@media print` body, `.app-hero__title`, and `.guest-list` tweaks.
   - **Issue**: Global `styles.css` already defines print rules for `body`, `.app-hero`, `.app-hero__title`, etc.
   - **Impact**: Increases risk of conflicting rules if future changes happen only in the global file.
   - **Recommendation**: Extend the existing global print block with room-specific selectors (`.action-buttons`, `.copy-quick`, `.room-tag`, `.important-notes`, `.room-card`, `.guest-list li::before`) instead of having a second block here.

7. **Feature-list equal-height logic is dead code**
   - **Location**: Lines 359–373.
   - **Issue**: JS computes `maxHeight` for `.features-list` but the actual application of `minHeight` is commented out.
   - **Impact**: Extra layout reads/writes for no user-visible effect.
   - **Recommendation**: Either remove this logic entirely or finish it in CSS (e.g., by using flexbox) instead of JS.

### Planned Fixes (Implementation Plan)

1. **Extract behaviors to `rooms.js`**
   - Move the DOMContentLoaded handler into a new `rooms.js`.
   - Load it with `<script src="rooms.js" defer></script>` at the bottom of `rooms.html`.

2. **Harden copy-to-clipboard behavior**
   - Add feature detection for `navigator.clipboard.writeText`.
   - On success: show toast and announce via `#liveAnnouncement`.
   - On failure / unsupported: show a clear error toast and also update `#liveAnnouncement`.

3. **Clean up JS logic**
   - Remove unnecessary `preventDefault()` on button clicks.
   - Drop the unused equal-height `features-list` logic (or leave a short comment explaining why it’s intentionally omitted).

4. **Unify print styling**
   - Move the rooms-specific print rules into the global `@media print` block in `styles.css`:
     - Hide `.action-buttons`, `.copy-quick`, `.room-tag`, `.room-header button`, `.important-notes`.
     - Add print tweaks for `.room-card` and `.guest-list li::before`.
   - Remove the inline `<style>` block from the head of `rooms.html`.

These changes will bring `rooms.html` in line with the refactored `index.html` and `itinerary.html`, improving maintainability, robustness, and accessibility while preserving the existing UX. 

