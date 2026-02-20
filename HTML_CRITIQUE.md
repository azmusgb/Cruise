# HTML File Critique (one-by-one)

This review covers every `*.html` file in the repository and focuses on semantics, accessibility, maintainability, and resilience.

## 1) `index.html`
- **What’s good**: Has `<!doctype html>`, `lang="en"`, viewport meta, and a clear page-level heading.
- **Concerns**: Uses a large inline `<style>` and inline `<script>`, which makes caching and maintenance harder over time.
- **Recommendation**: Move page CSS/JS into versioned external files (as done on some other pages) for consistency and performance.

## 2) `itinerary.html`
- **What’s good**: Good document scaffolding (`doctype`, `lang`, `title`, viewport) and a visible `<h1>`.
- **Concerns**: Inline style/script blocks are large; one control uses inline style attributes.
- **Recommendation**: Consolidate styles into shared CSS tokens/components and remove inline style attributes from form controls.

## 3) `operations.html`
- **What’s good**: Strong checklist semantics with many explicit `<label for>` + checkbox pairings.
- **Concerns**: One control appears unlabeled in markup pattern checks; heavy inline CSS/JS increases coupling.
- **Recommendation**: Ensure every non-hidden form control has an explicit label (or robust `aria-label`) and externalize page scripts.

## 4) `tips.html`
- **What’s good**: Good accessible checklist pattern (labels tied to checkboxes) and shared layout script usage.
- **Concerns**: Form-control count and label count are close but not equal (likely search input relying on aria-label).
- **Recommendation**: Keep `aria-label` for search but add visible/helper label where practical for consistency and clarity.

## 5) `ports.html`
- **What’s good**: Uses shared script, has strong head metadata and clean structure.
- **Concerns**: Minimal script inline is good, but still has page-specific style block.
- **Recommendation**: Consider extracting page styles to a ports-specific stylesheet for reuse and easier theming.

## 6) `offline.html`
- **What’s good**: Uses shared layout JS and includes accessible search labeling.
- **Concerns**: Mixes external + inline scripts/styles, which can fragment behavior patterns.
- **Recommendation**: Continue migration to shared modules (UI and storage behavior), reducing inline logic.

## 7) `contacts.html`
- **What’s good**: Semantic heading present and content is easy to scan.
- **Concerns**: Multiple inline `onclick` handlers create tight coupling between markup and behavior.
- **Recommendation**: Replace inline handlers with delegated JS event listeners and data attributes for actions.

## 8) `rooms.html`
- **What’s good**: Correct base document metadata and straightforward structure.
- **Concerns**: Mostly inline CSS/JS, making the page less modular.
- **Recommendation**: Externalize style/script and align with shared layout architecture used by other pages.

## 9) `plan.html`
- **What’s good**: Basic semantics and metadata are present.
- **Concerns**: Inputs/textarea appear to rely on placeholders rather than explicit labels; inline event assignments are used.
- **Recommendation**: Add explicit `<label>` elements for form controls and move JS into external modules.

## 10) `decks.html`
- **What’s good**: Rich page structure, accessible search `aria-label`, and complete metadata.
- **Concerns**: Multiple navigation links use `href="#"`, which is not ideal for keyboard/history semantics and can confuse assistive tech if JS fails.
- **Recommendation**: Use real destination URLs (or `<button>` when action-only), plus progressive enhancement for JS behaviors.

## 11) `dining.html`
- **What’s good**: Good metadata and meaningful main heading.
- **Concerns**: Search input appears without explicit `<label>` (likely placeholder-driven).
- **Recommendation**: Add visible or sr-only label for the search field and continue reducing inline script/style.

## 12) `photos.html`
- **What’s good**: Strong page structure and clear heading.
- **Concerns**: Missing `<!doctype html>` can trigger browser quirks mode risks.
- **Recommendation**: Add HTML5 doctype at top of file and standardize with the rest of the app.

## 13) `deck-debug.html`
- **What’s good**: Purpose is clearly scoped for debugging.
- **Concerns**: `<html>` is missing a `lang` attribute; no `<h1>`; debug utilities can still benefit from minimal semantics.
- **Recommendation**: Add `lang="en"` and optional heading for consistency/accessibility even in debug pages.

## 14) `tools/_archive/pages/dashboard.html`
- **What’s good**: Minimal redirect file with valid metadata.
- **Concerns**: JavaScript-only redirect can fail in noscript contexts.
- **Recommendation**: Add `<meta http-equiv="refresh">` or a visible fallback link for non-JS environments.

## 15) `tools/_archive/pages/svg-crop.html`
- **What’s good**: Minimal and clear redirect intent.
- **Concerns**: Same JS-only redirect limitation as other archive redirect page.
- **Recommendation**: Provide a fallback link and optional meta refresh for resilience.

---

## Cross-cutting priorities (suggested order)
1. **Accessibility baseline**: add explicit labels where placeholders are used as primary labels.
2. **Navigation semantics**: remove `href="#"` placeholders in primary nav/actions.
3. **Progressive enhancement**: add non-JS fallback for redirect-only pages.
4. **Maintainability**: move inline scripts/styles to shared external assets.
5. **Consistency**: add missing doctype/lang items (`photos.html`, `deck-debug.html`).
