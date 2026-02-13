/* decks.js
   ============================================================
   RCCL Cruise Hub — Decks (SVG) Viewer
   - Loads SVGs as real DOM (accessible + interactive)
   - Pan/Zoom (mouse wheel / trackpad + drag)
   - Keyboard navigation (Tab + Enter/Space)
   - Search highlighting
   - Tooltip + optional details panel
   - Defensive: works even if some controls are missing

   Assumptions / Expected (but optional) DOM hooks:
   ------------------------------------------------------------
   Container (required):
     - #deckStage   OR   [data-deck-stage]

   Deck selector (optional, any one):
     - <select id="deckSelect">
     - Buttons/links with [data-deck-src] and optional [data-deck-name]

   Search (optional):
     - <input id="deckSearch">

   Zoom controls (optional):
     - #zoomInBtn, #zoomOutBtn, #zoomResetBtn
     - #fitBtn (fit-to-view)

   Info panel (optional):
     - #deckInfoPanel
     - #deckInfoTitle
     - #deckInfoBody
     - #deckInfoClose

   Progress/status (optional):
     - #deckStatus

   ============================================================
*/

(() => {
  'use strict';

  /** -----------------------------
   *  Utilities
   *  ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function safeText(s) {
    if (s == null) return '';
    return String(s).replace(/\s+/g, ' ').trim();
  }

  function humanizeId(id) {
    const s = safeText(id)
      .replace(/^#+/, '')
      .replace(/[_\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Location';
  }

  function setStatus(el, msg) {
    if (!el) return;
    el.textContent = msg;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** -----------------------------
   *  Tooltip
   *  ----------------------------- */
  function createTooltip() {
    const tip = document.createElement('div');
    tip.className = 'deck-tooltip';
    tip.setAttribute('role', 'status');
    tip.setAttribute('aria-live', 'polite');
    tip.style.position = 'fixed';
    tip.style.zIndex = '9999';
    tip.style.pointerEvents = 'none';
    tip.style.opacity = '0';
    tip.style.transform = 'translate3d(0,0,0)';
    tip.style.maxWidth = 'min(320px, 70vw)';
    tip.style.padding = '10px 12px';
    tip.style.borderRadius = '12px';
    tip.style.backdropFilter = 'blur(10px)';
    tip.style.webkitBackdropFilter = 'blur(10px)';
    tip.style.border = '1px solid rgba(255,255,255,0.12)';
    tip.style.background = 'rgba(10, 18, 30, 0.75)';
    tip.style.color = '#fff';
    tip.style.font = '500 13px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif';
    tip.style.boxShadow = '0 12px 35px rgba(0,0,0,0.35)';
    tip.style.transition = prefersReducedMotion()
      ? 'opacity 0.01s linear'
      : 'opacity 0.12s ease';
    document.body.appendChild(tip);

    let visible = false;

    function show(text, x, y) {
      const t = safeText(text);
      if (!t) return hide();
      tip.textContent = t;
      position(x, y);
      if (!visible) {
        visible = true;
        tip.style.opacity = '1';
      }
    }

    function position(x, y) {
      const pad = 14;
      const rect = tip.getBoundingClientRect();
      let nx = x + 14;
      let ny = y + 14;

      if (nx + rect.width + pad > window.innerWidth) nx = x - rect.width - 14;
      if (ny + rect.height + pad > window.innerHeight) ny = y - rect.height - 14;

      nx = clamp(nx, pad, window.innerWidth - rect.width - pad);
      ny = clamp(ny, pad, window.innerHeight - rect.height - pad);

      tip.style.left = `${nx}px`;
      tip.style.top = `${ny}px`;
    }

    function hide() {
      if (!visible) return;
      visible = false;
      tip.style.opacity = '0';
    }

    return { show, position, hide, el: tip };
  }

  /** -----------------------------
   *  Deck Viewer (SVG)
   *  ----------------------------- */
  class DeckViewer {
    constructor(options) {
      this.stage = options.stage;
      this.statusEl = options.statusEl || null;

      this.searchEl = options.searchEl || null;
      this.selectEl = options.selectEl || null;

      this.zoomInBtn = options.zoomInBtn || null;
      this.zoomOutBtn = options.zoomOutBtn || null;
      this.zoomResetBtn = options.zoomResetBtn || null;
      this.fitBtn = options.fitBtn || null;

      this.infoPanel = options.infoPanel || null;
      this.infoTitle = options.infoTitle || null;
      this.infoBody = options.infoBody || null;
      this.infoClose = options.infoClose || null;

      this.tooltip = createTooltip();

      // Pan/zoom state
      this.svg = null;
      this.viewportG = null;
      this.tx = 0;
      this.ty = 0;
      this.scale = 1;

      this.minScale = 0.35;
      this.maxScale = 6;

      this._panning = false;
      this._panPointerId = null;
      this._panStart = { x: 0, y: 0, tx: 0, ty: 0 };

      // Selection state
      this._selectedEl = null;

      // Search cache
      this._focusables = [];
      this._labels = new Map(); // el -> label string

      this._bindUI();
    }

    _bindUI() {
      // Defensive: don’t crash if missing elements
      if (this.searchEl) {
        this.searchEl.addEventListener('input', () => {
          const q = safeText(this.searchEl.value);
          this.applySearch(q);
        });
        this.searchEl.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.searchEl.value = '';
            this.applySearch('');
            this.searchEl.blur();
          }
        });
      }

      if (this.selectEl) {
        this.selectEl.addEventListener('change', () => {
          const opt = this.selectEl.selectedOptions?.[0];
          const src = opt?.value || '';
          const name = opt?.dataset?.deckName || opt?.textContent || 'Deck';
          if (src) this.load(src, name);
        });
      }

      if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => this.zoomBy(1.18));
      if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => this.zoomBy(1 / 1.18));
      if (this.zoomResetBtn) this.zoomResetBtn.addEventListener('click', () => this.resetView());
      if (this.fitBtn) this.fitBtn.addEventListener('click', () => this.fitToStage());

      if (this.infoClose && this.infoPanel) {
        this.infoClose.addEventListener('click', () => this.hideInfo());
      }

      // Support click-to-load buttons/links anywhere:
      document.addEventListener('click', (e) => {
        const t = e.target instanceof Element ? e.target.closest('[data-deck-src]') : null;
        if (!t) return;
        const src = t.getAttribute('data-deck-src');
        if (!src) return;
        e.preventDefault();
        const name = t.getAttribute('data-deck-name') || t.textContent || 'Deck';
        this.load(src, name);
      });

      // Stage should be focusable for keyboard panning hints
      if (!this.stage.hasAttribute('tabindex')) this.stage.setAttribute('tabindex', '0');
      this.stage.setAttribute('role', 'region');
      this.stage.setAttribute('aria-label', 'Interactive deck plan viewer');

      // Prevent broken scroll on wheel zoom (we’ll handle it)
      this.stage.addEventListener('wheel', (e) => {
        if (!this.svg) return;
        // Always handle wheel when over stage (trackpad/scroll wheel)
        e.preventDefault();
        const delta = e.deltaY;
        const factor = delta > 0 ? 1 / 1.12 : 1.12;
        this.zoomAt(factor, e.clientX, e.clientY);
      }, { passive: false });

      // Pan: pointer drag
      this.stage.addEventListener('pointerdown', (e) => {
        if (!this.svg) return;
        // Only primary button for mouse; touch is ok
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        // Don’t start panning if user is starting on a focusable location (let them click)
        const el = e.target instanceof Element ? e.target : null;
        if (el && (el.matches('[data-deck-focusable="1"]') || el.closest('[data-deck-focusable="1"]'))) return;

        this._panning = true;
        this._panPointerId = e.pointerId;
        this.stage.setPointerCapture(e.pointerId);
        this._panStart = { x: e.clientX, y: e.clientY, tx: this.tx, ty: this.ty };
      });

      this.stage.addEventListener('pointermove', (e) => {
        if (!this._panning || this._panPointerId !== e.pointerId) {
          // tooltip follow if visible
          if (this.svg && this.tooltip && this.tooltip.el.style.opacity === '1') {
            this.tooltip.position(e.clientX, e.clientY);
          }
          return;
        }
        const dx = e.clientX - this._panStart.x;
        const dy = e.clientY - this._panStart.y;
        this.tx = this._panStart.tx + dx;
        this.ty = this._panStart.ty + dy;
        this._applyTransform();
      });

      const endPan = (e) => {
        if (!this._panning || this._panPointerId !== e.pointerId) return;
        this._panning = false;
        this._panPointerId = null;
        try { this.stage.releasePointerCapture(e.pointerId); } catch (_) {}
      };

      this.stage.addEventListener('pointerup', endPan);
      this.stage.addEventListener('pointercancel', endPan);
      this.stage.addEventListener('pointerleave', () => {
        // Don’t hard-stop panning here; pointer capture should manage it
        // Just hide tooltip if leaving stage
        this.tooltip.hide();
      });
    }

    async load(src, deckName = 'Deck') {
      const url = safeText(src);
      if (!url) return;

      setStatus(this.statusEl, `Loading ${deckName}…`);
      this.stage.setAttribute('aria-busy', 'true');

      // Clear previous
      this.stage.innerHTML = '';
      this.svg = null;
      this.viewportG = null;
      this._focusables = [];
      this._labels.clear();
      this._selectedEl = null;
      this.hideInfo();

      // Loading UI
      const loading = document.createElement('div');
      loading.style.padding = '18px';
      loading.style.borderRadius = '16px';
      loading.style.border = '1px solid rgba(255,255,255,0.12)';
      loading.style.background = 'rgba(10, 18, 30, 0.35)';
      loading.style.color = '#fff';
      loading.style.font = '600 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif';
      loading.textContent = `Loading ${deckName}…`;
      this.stage.appendChild(loading);

      try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        const text = await res.text();

        const svg = this._parseSVG(text);
        if (!svg) throw new Error('SVG parse failed');

        this._installSVG(svg, deckName);

        setStatus(this.statusEl, `${deckName} loaded`);
      } catch (err) {
        console.error('[DeckViewer] load error:', err);
        setStatus(this.statusEl, `Failed to load ${deckName}`);
        this.stage.innerHTML = '';
        const box = document.createElement('div');
        box.style.padding = '18px';
        box.style.borderRadius = '16px';
        box.style.border = '1px solid rgba(255,255,255,0.12)';
        box.style.background = 'rgba(10, 18, 30, 0.35)';
        box.style.color = '#fff';
        box.style.font = '600 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif';
        box.innerHTML = `
          <div style="font-size:15px; margin-bottom:6px;">Deck plan failed to load</div>
          <div style="opacity:0.9; font-weight:500; margin-bottom:10px;">${safeText(err?.message || 'Unknown error')}</div>
          <div style="opacity:0.85; font-weight:500;">
            Check that the SVG path is correct and the file is served by your web server (not blocked by iOS file:// restrictions).
          </div>
        `;
        this.stage.appendChild(box);
      } finally {
        this.stage.removeAttribute('aria-busy');
      }
    }

    _parseSVG(svgText) {
      const text = safeText(svgText);
      if (!text || !text.includes('<svg')) return null;

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      const svg = doc.documentElement;

      // Parser errors
      const perr = doc.querySelector('parsererror');
      if (perr) {
        console.error('[DeckViewer] SVG parsererror:', perr.textContent);
        return null;
      }

      // Import into current document so CSS applies cleanly
      const imported = document.importNode(svg, true);

      // Ensure namespace
      if (!imported.getAttribute('xmlns')) imported.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      return imported;
    }

    _installSVG(svg, deckName) {
      // Clear loading
      this.stage.innerHTML = '';

      // Make SVG responsive
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.display = 'block';
      svg.style.touchAction = 'none'; // so pan gestures behave
      svg.setAttribute('focusable', 'false');

      // Accessibility: title/desc
      const titleId = `deckTitle_${Math.random().toString(16).slice(2)}`;
      const descId = `deckDesc_${Math.random().toString(16).slice(2)}`;

      // Avoid duplicates if SVG already has a title/desc
      const existingTitle = svg.querySelector('title');
      const existingDesc = svg.querySelector('desc');

      if (!existingTitle) {
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        t.setAttribute('id', titleId);
        t.textContent = `${deckName} layout`;
        svg.insertBefore(t, svg.firstChild);
      }
      if (!existingDesc) {
        const d = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
        d.setAttribute('id', descId);
        d.textContent = 'Interactive deck plan. Use mouse wheel to zoom, drag to pan, Tab to focus locations, and Enter to select.';
        svg.insertBefore(d, svg.firstChild?.nextSibling || null);
      }

      const tRef = (existingTitle?.getAttribute('id') || titleId);
      const dRef = (existingDesc?.getAttribute('id') || descId);

      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-labelledby', `${tRef} ${dRef}`);

      // Ensure viewBox exists (important for predictable scaling)
      if (!svg.getAttribute('viewBox')) {
        // Try to infer from width/height
        const w = parseFloat(svg.getAttribute('width') || '0');
        const h = parseFloat(svg.getAttribute('height') || '0');
        if (w > 0 && h > 0) {
          svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        } else {
          // As a fallback, we’ll compute bounding box after insertion
        }
      }

      // Wrap contents into viewport group so we can transform cleanly
      const ns = 'http://www.w3.org/2000/svg';
      const viewport = document.createElementNS(ns, 'g');
      viewport.setAttribute('id', '__deckViewport');
      viewport.setAttribute('vector-effect', 'non-scaling-stroke'); // helps line crispness in some SVGs

      // Move all nodes except title/desc/defs into viewport
      const preserved = new Set(['title', 'desc', 'defs', 'metadata']);
      const children = Array.from(svg.childNodes);
      for (const node of children) {
        if (node.nodeType !== 1) continue; // element
        const tag = node.nodeName.toLowerCase();
        if (preserved.has(tag)) continue;
        viewport.appendChild(node);
      }
      svg.appendChild(viewport);

      this.stage.appendChild(svg);
      this.svg = svg;
      this.viewportG = viewport;

      // If no viewBox, infer from bbox now that it’s in DOM
      if (!svg.getAttribute('viewBox')) {
        try {
          const bb = viewport.getBBox();
          const pad = Math.max(8, Math.min(bb.width, bb.height) * 0.02);
          const x = Math.max(0, bb.x - pad);
          const y = Math.max(0, bb.y - pad);
          const w = bb.width + pad * 2;
          const h = bb.height + pad * 2;
          if (w > 0 && h > 0) svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
        } catch (e) {
          // Not fatal
          console.warn('[DeckViewer] Could not infer viewBox:', e);
        }
      }

      // Default view
      this.resetView(true);
      this._decorateInteractivity();
      this._wireSVGEvents();
      this.fitToStage();

      // If there is a search query already, apply it
      if (this.searchEl) this.applySearch(safeText(this.searchEl.value));
    }

    _decorateInteractivity() {
      if (!this.svg) return;

      // Strategy:
      // - Identify likely interactive nodes:
      //   - any element with id
      //   - any element with class containing "room", "stateroom", "venue", "elevator"
      //   - any element with data-name or aria-label already
      // - Promote them to focusable targets with tabindex=0
      // - Add CSS-friendly attributes for consistent highlighting
      //
      // Note: Some exported SVGs have thousands of paths. We cap promotion to avoid making a tab-trap.
      const candidates = [];

      // 1) Elements that already have aria-label or data-name
      candidates.push(...$$('[aria-label], [data-name]', this.svg));

      // 2) IDs that look meaningful
      candidates.push(...$$('[id]', this.svg).filter(el => {
        const id = el.getAttribute('id') || '';
        // Filter out common junk ids from editors
        if (!id) return false;
        if (/^(svg|layer|g|path|rect|circle|ellipse|line|polyline|polygon)\d*$/i.test(id)) return false;
        if (/^XMLID_/i.test(id)) return false;
        return true;
      }));

      // 3) Class heuristics
      candidates.push(...$$('[class]', this.svg).filter(el => {
        const c = (el.getAttribute('class') || '').toLowerCase();
        return /(room|stateroom|venue|elevator|stairs|bar|cafe|pool|theater|casino|suite)/.test(c);
      }));

      // Unique + prune
      const uniq = [];
      const seen = new Set();
      for (const el of candidates) {
        if (!(el instanceof SVGElement)) continue;
        if (seen.has(el)) continue;
        seen.add(el);
        uniq.push(el);
      }

      // Promote up to N focusables. If the SVG is noisy, focusables should be “groups” not “every path”.
      // Prefer <g> and <a> if possible, otherwise keep paths but cap aggressively.
      const score = (el) => {
        let s = 0;
        const tag = el.tagName.toLowerCase();
        if (tag === 'a') s += 6;
        if (tag === 'g') s += 4;
        if (tag === 'path' || tag === 'rect' || tag === 'polygon') s += 2;
        const id = el.getAttribute('id') || '';
        if (id && !/^XMLID_/i.test(id)) s += 3;
        const aria = el.getAttribute('aria-label');
        if (aria) s += 5;
        const dn = el.getAttribute('data-name');
        if (dn) s += 5;
        const cls = (el.getAttribute('class') || '').toLowerCase();
        if (/(room|venue|elevator|stairs)/.test(cls)) s += 2;
        return s;
      };

      uniq.sort((a, b) => score(b) - score(a));

      const MAX_FOCUSABLES = 220;
      const focusables = uniq.slice(0, MAX_FOCUSABLES);

      for (const el of focusables) {
        // Set a stable label
        const label =
          safeText(el.getAttribute('aria-label')) ||
          safeText(el.getAttribute('data-name')) ||
          humanizeId(el.getAttribute('id')) ||
          'Location';

        el.setAttribute('data-deck-focusable', '1');
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', label);

        // Improve touch target slightly by promoting to group if tiny
        this._labels.set(el, label);
        this._focusables.push(el);
      }

      // Inject minimal in-SVG highlight styles (does not require external CSS)
      this._ensureStyleBlock();
    }

    _ensureStyleBlock() {
      if (!this.svg) return;
      const ns = 'http://www.w3.org/2000/svg';

      let style = this.svg.querySelector('style[data-deck-style="1"]');
      if (style) return;

      style = document.createElementNS(ns, 'style');
      style.setAttribute('data-deck-style', '1');

      // Avoid fixed colors across your site? This is inside SVG only.
      // Use subtle, neutral highlight that works on most deck exports.
      style.textContent = `
        [data-deck-focusable="1"] { cursor: pointer; outline: none; }
        [data-deck-focusable="1"][data-deck-hit="1"] { opacity: 1; }
        [data-deck-focusable="1"][data-deck-muted="1"] { opacity: 0.15; }

        /* Focus ring for keyboard users */
        [data-deck-focusable="1"]:focus {
          filter: drop-shadow(0 0 8px rgba(255, 215, 64, 0.55));
        }

        /* Selected state */
        [data-deck-focusable="1"][data-deck-selected="1"] {
          filter: drop-shadow(0 0 12px rgba(0, 190, 255, 0.55)) drop-shadow(0 0 22px rgba(0, 190, 255, 0.25));
        }

        /* Hover state */
        [data-deck-focusable="1"]:hover {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.35));
        }
      `;

      // Put style early
      const first = this.svg.firstChild;
      this.svg.insertBefore(style, first);
    }

    _wireSVGEvents() {
      if (!this.svg) return;

      // Delegate interactions
      this.svg.addEventListener('click', (e) => {
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;
        const hit = target.closest?.('[data-deck-focusable="1"]');
        if (!hit) return;
        e.preventDefault();
        this.select(hit);
      });

      // Keyboard activation
      this.svg.addEventListener('keydown', (e) => {
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;
        if (!target.matches?.('[data-deck-focusable="1"]')) return;

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.select(target);
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          this.clearSelection();
          this.hideInfo();
        }
      });

      // Tooltip hover/focus
      this.svg.addEventListener('pointerover', (e) => {
        const t = e.target instanceof Element ? e.target : null;
        const hit = t?.closest?.('[data-deck-focusable="1"]');
        if (!hit) return;
        const label = safeText(hit.getAttribute('aria-label')) || this._labels.get(hit) || 'Location';
        this.tooltip.show(label, e.clientX, e.clientY);
      });

      this.svg.addEventListener('pointermove', (e) => {
        if (this.tooltip.el.style.opacity !== '1') return;
        this.tooltip.position(e.clientX, e.clientY);
      });

      this.svg.addEventListener('pointerout', (e) => {
        const related = e.relatedTarget instanceof Element ? e.relatedTarget : null;
        if (related && related.closest?.('[data-deck-focusable="1"]')) return;
        this.tooltip.hide();
      });

      // Focus tooltip
      this.svg.addEventListener('focusin', (e) => {
        const t = e.target instanceof Element ? e.target : null;
        if (!t || !t.matches('[data-deck-focusable="1"]')) return;
        const label = safeText(t.getAttribute('aria-label')) || this._labels.get(t) || 'Location';
        // Place tooltip near center of stage for keyboard (no pointer coords)
        const rect = this.stage.getBoundingClientRect();
        this.tooltip.show(label, rect.left + rect.width * 0.55, rect.top + rect.height * 0.22);
      });

      this.svg.addEventListener('focusout', () => {
        this.tooltip.hide();
      });
    }

    select(el) {
      if (!el) return;

      // Clear previous
      if (this._selectedEl) this._selectedEl.removeAttribute('data-deck-selected');
      this._selectedEl = el;
      el.setAttribute('data-deck-selected', '1');

      // Ensure it is visible (basic center-on)
      this.centerOn(el);

      // Update info panel (optional)
      const label = safeText(el.getAttribute('aria-label')) || this._labels.get(el) || 'Location';
      const id = safeText(el.getAttribute('id'));
      const cls = safeText(el.getAttribute('class'));
      const dn = safeText(el.getAttribute('data-name'));

      if (this.infoPanel && this.infoTitle && this.infoBody) {
        this.infoTitle.textContent = label;
        const lines = [];

        if (dn && dn !== label) lines.push(`Name: ${dn}`);
        if (id) lines.push(`ID: ${id}`);
        if (cls) lines.push(`Class: ${cls}`);

        // Try to extract any data-* metadata
        const dataPairs = [];
        for (const attr of Array.from(el.attributes)) {
          if (!attr.name.startsWith('data-')) continue;
          if (attr.name === 'data-deck-focusable' || attr.name === 'data-deck-selected') continue;
          dataPairs.push(`${attr.name}: ${attr.value}`);
        }
        if (dataPairs.length) lines.push(...dataPairs.slice(0, 10));

        if (!lines.length) lines.push('Tap around the deck to explore. Search to highlight locations.');

        this.infoBody.textContent = lines.join('\n');
        this.showInfo();
      } else {
        // If no panel, at least announce status (optional)
        setStatus(this.statusEl, `Selected: ${label}`);
      }
    }

    clearSelection() {
      if (this._selectedEl) {
        this._selectedEl.removeAttribute('data-deck-selected');
        this._selectedEl = null;
      }
    }

    showInfo() {
      if (!this.infoPanel) return;
      this.infoPanel.removeAttribute('hidden');
      this.infoPanel.setAttribute('aria-hidden', 'false');
    }

    hideInfo() {
      if (!this.infoPanel) return;
      this.infoPanel.setAttribute('hidden', 'true');
      this.infoPanel.setAttribute('aria-hidden', 'true');
    }

    applySearch(query) {
      const q = safeText(query).toLowerCase();

      if (!this.svg || !this._focusables.length) return;

      if (!q) {
        // Reset muting
        for (const el of this._focusables) {
          el.removeAttribute('data-deck-muted');
          el.removeAttribute('data-deck-hit');
        }
        setStatus(this.statusEl, 'Search cleared');
        return;
      }

      let hits = 0;
      for (const el of this._focusables) {
        const label = (safeText(el.getAttribute('aria-label')) || this._labels.get(el) || '').toLowerCase();
        const id = safeText(el.getAttribute('id')).toLowerCase();
        const cls = safeText(el.getAttribute('class')).toLowerCase();

        const match = label.includes(q) || id.includes(q) || cls.includes(q);
        if (match) {
          hits++;
          el.setAttribute('data-deck-hit', '1');
          el.removeAttribute('data-deck-muted');
        } else {
          el.removeAttribute('data-deck-hit');
          el.setAttribute('data-deck-muted', '1');
        }
      }

      setStatus(this.statusEl, `${hits} match${hits === 1 ? '' : 'es'} for "${query}"`);

      // Auto-focus first hit for quick keyboard use
      if (hits > 0) {
        const firstHit = this._focusables.find(el => el.getAttribute('data-deck-hit') === '1');
        if (firstHit) {
          try { firstHit.focus({ preventScroll: true }); } catch (_) {}
        }
      }
    }

    /** -----------------------------
     *  Transform (pan/zoom)
     *  ----------------------------- */
    _applyTransform() {
      if (!this.viewportG) return;
      this.viewportG.setAttribute('transform', `translate(${this.tx} ${this.ty}) scale(${this.scale})`);
    }

    zoomBy(factor) {
      const rect = this.stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.zoomAt(factor, cx, cy);
    }

    zoomAt(factor, clientX, clientY) {
      if (!this.svg || !this.viewportG) return;

      const nextScale = clamp(this.scale * factor, this.minScale, this.maxScale);
      if (Math.abs(nextScale - this.scale) < 1e-6) return;

      // Convert client point into stage-local point
      const stageRect = this.stage.getBoundingClientRect();
      const px = clientX - stageRect.left;
      const py = clientY - stageRect.top;

      // Adjust translate so zoom focuses around pointer
      // Formula: newT = p - (p - oldT) * (newS / oldS)
      const ratio = nextScale / this.scale;
      this.tx = px - (px - this.tx) * ratio;
      this.ty = py - (py - this.ty) * ratio;
      this.scale = nextScale;

      this._applyTransform();
      setStatus(this.statusEl, `Zoom: ${Math.round(this.scale * 100)}%`);
    }

    resetView(silent = false) {
      this.tx = 0;
      this.ty = 0;
      this.scale = 1;
      this._applyTransform();
      if (!silent) setStatus(this.statusEl, 'View reset');
    }

    fitToStage() {
      if (!this.svg || !this.viewportG) return;

      // Fit viewport bbox into stage
      try {
        const bb = this.viewportG.getBBox();
        const rect = this.stage.getBoundingClientRect();
        const pad = 24;

        const availableW = Math.max(1, rect.width - pad * 2);
        const availableH = Math.max(1, rect.height - pad * 2);

        const sx = availableW / Math.max(1, bb.width);
        const sy = availableH / Math.max(1, bb.height);

        // Choose scale, clamp
        const s = clamp(Math.min(sx, sy), this.minScale, this.maxScale);

        // Center
        const cx = bb.x + bb.width / 2;
        const cy = bb.y + bb.height / 2;

        // Translate so (cx,cy) ends up in the center of stage
        this.scale = s;
        this.tx = (rect.width / 2) - (cx * s);
        this.ty = (rect.height / 2) - (cy * s);

        this._applyTransform();
        setStatus(this.statusEl, `Fit view (${Math.round(this.scale * 100)}%)`);
      } catch (e) {
        console.warn('[DeckViewer] fitToStage failed:', e);
      }
    }

    centerOn(el) {
      if (!el || !this.viewportG) return;

      try {
        const bb = el.getBBox();
        const rect = this.stage.getBoundingClientRect();

        const cx = bb.x + bb.width / 2;
        const cy = bb.y + bb.height / 2;

        // Move so it centers in stage
        this.tx = (rect.width / 2) - (cx * this.scale);
        this.ty = (rect.height / 2) - (cy * this.scale);

        this._applyTransform();
      } catch (_) {
        // ignore
      }
    }
  }

  /** -----------------------------
   *  Bootstrap
   *  ----------------------------- */
  function initDecks() {
    const stage = $('#deckStage') || $('[data-deck-stage]');
    if (!stage) {
      console.warn('[DeckViewer] Missing #deckStage / [data-deck-stage]. Deck viewer not initialized.');
      return;
    }

    const viewer = new DeckViewer({
      stage,
      statusEl: $('#deckStatus'),
      searchEl: $('#deckSearch'),
      selectEl: $('#deckSelect'),
      zoomInBtn: $('#zoomInBtn'),
      zoomOutBtn: $('#zoomOutBtn'),
      zoomResetBtn: $('#zoomResetBtn'),
      fitBtn: $('#fitBtn'),
      infoPanel: $('#deckInfoPanel'),
      infoTitle: $('#deckInfoTitle'),
      infoBody: $('#deckInfoBody'),
      infoClose: $('#deckInfoClose')
    });

    // Auto-load:
    // Priority:
    // 1) stage data-default-deck
    // 2) selected option in select
    // 3) first [data-deck-src] in DOM
    const defaultDeck = stage.getAttribute('data-default-deck');
    if (defaultDeck) {
      viewer.load(defaultDeck, stage.getAttribute('data-default-deck-name') || 'Deck');
      return;
    }

    const sel = $('#deckSelect');
    if (sel && sel.value) {
      const opt = sel.selectedOptions?.[0];
      const name = opt?.dataset?.deckName || opt?.textContent || 'Deck';
      viewer.load(sel.value, name);
      return;
    }

    const first = $('[data-deck-src]');
    if (first) {
      const src = first.getAttribute('data-deck-src');
      if (src) viewer.load(src, first.getAttribute('data-deck-name') || first.textContent || 'Deck');
    }
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDecks, { once: true });
  } else {
    initDecks();
  }
})();
