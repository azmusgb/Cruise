# UX Audit (Structured)

## Scope
This audit is limited to:
- `index.html`
- `css/tokens.css`
- `css/components.css`
- `css/mobile-first.css`

---

## SECTION 1 — High-Impact UX Issues (prioritized)

1. **Primary action hierarchy is diluted by broad button selectors**
   - `css/components.css` styles all `button` elements with the same high-emphasis treatment as `.btn-primary`, which can flatten primary/secondary intent and create visual competition.
2. **Token system is bypassed by page-local color and type primitives**
   - `index.html` defines its own `:root` palette, spacing, and heavy weight scale (e.g., 900+), diverging from `css/tokens.css` and reducing consistency across screens.
3. **Touch target regression risk at small breakpoints**
   - `css/mobile-first.css` lowers target sizes (`--mf-touch-target: 40px`, compact controls down to 30px min-height in places), which is below common mobile ergonomic guidance.
4. **Over-emphasis in hero/header typography**
   - Multiple ultra-heavy weights (`850`, `900`, `950`) are used in high-density areas of `index.html`, increasing visual noise and reducing focal clarity.
5. **Focus-state inconsistency across layers**
   - `:focus-visible` is defined in both `index.html` and `css/components.css` with different color language, resulting in inconsistent keyboard affordance depending on cascade context.

---

## SECTION 2 — Structural Design Inconsistencies

- **Dual token authorities**: global tokens in `css/tokens.css` vs page-specific variables in `index.html`.
- **Button system ambiguity**: class-based button architecture exists, but element-wide selectors (`button`, `button:hover`) override semantic hierarchy.
- **Responsive rhythm drift**: spacing and control heights are reduced aggressively in narrow breakpoints, while base components assume larger spacing/touch areas.
- **Heading scale mismatch**: tokenized font scale is present, but `index.html` uses independent clamps/weights that are not tied to global scales.
- **Interaction styling split**: global components layer and page-local inline style both define interaction cues (hover/focus/active), creating maintenance and predictability overhead.

---

## SECTION 3 — Minimal, High-Leverage Improvements

1. Restrict strong CTA styling to semantic classes (`.btn-primary`) and give neutral defaults to generic `button`.
2. Normalize focus ring to one tokenized rule (`--focus-ring`/single accent) used by all pages.
3. Keep mobile touch targets at **44px minimum** for all tappable controls, with no sub-44 overrides.
4. Reduce heading/button weight variants to 2–3 levels (e.g., 600/700/800) to restore emphasis contrast.
5. Replace page-local color primitives in `index.html` with aliases to global tokens to preserve theme direction while tightening system coherence.

### Recommended patch-style diffs (not a redesign)

```diff
diff --git a/css/components.css b/css/components.css
@@
-.btn-primary,
-button,
-.btn,
+.btn-primary,
+.btn,
 .deck-card__cta,
 .view-deck-btn,
 .pill-btn {
@@
 }
+
+button {
+  border-radius: var(--radius-md);
+  border: 1px solid var(--border-subtle);
+  background: var(--surface-card);
+  color: var(--color-text-primary);
+}
@@
-.btn-primary:hover,
-button:hover,
-.btn:hover,
+.btn-primary:hover,
+.btn:hover,
 .deck-card__cta:hover,
 .view-deck-btn:hover,
 .pill-btn:hover {
@@
 }
+
+button:hover {
+  background: color-mix(in srgb, var(--surface-card) 92%, var(--color-ocean-500));
+  transform: translateY(-1px);
+}
```

```diff
diff --git a/css/mobile-first.css b/css/mobile-first.css
@@
 @media (width <= 767px) {
   :root {
     --mf-gutter: 14px;
     --mf-gap: 10px;
-    --mf-touch-target: 40px;
-    --mf-touch-target-compact: 34px;
+    --mf-touch-target: 44px;
+    --mf-touch-target-compact: 40px;
   }
@@
-  :where(.pill-btn, .filter-btn, .room-type-filter) {
-    min-height: 30px;
+  :where(.pill-btn, .filter-btn, .room-type-filter) {
+    min-height: 40px;
     font-size: 0.8rem;
     line-height: 1.2;
     padding: 0.22rem 0.56rem;
   }
 }
```

```diff
diff --git a/index.html b/index.html
@@
-    :focus-visible { outline: 3px solid rgba(0,180,230,.45); outline-offset: 2px; border-radius: 12px; }
+    :focus-visible { outline: 3px solid var(--color-sun-500); outline-offset: 2px; border-radius: 12px; }
@@
-      --accent:#00b4e6;
-      --gold:#ffd740;
+      --accent: var(--color-ocean-500);
+      --gold: var(--color-sun-500);
@@
-      font-weight: 950;
+      font-weight: 800;
@@
-      font-weight: 850;
+      font-weight: 700;
```

---

## SECTION 4 — Optional Polish (non-critical)

- Standardize card vertical rhythm by mapping ad-hoc paddings in `index.html` to `--space-*` tokens.
- Harmonize border-radius values (`18`, `22`, `28`, pill) into a reduced tokenized set for calmer visual rhythm.
- Add explicit disabled-state styling in the shared button system (`opacity`, cursor, contrast-safe backgrounds).
- Consider a lightweight `prefers-reduced-motion` path for hover transforms and parallax-adjacent decorative motion.
