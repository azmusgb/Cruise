/* decks.js
   ============================================================
   RCCL Cruise Hub — Deck Navigator (Stable iOS / GitHub Pages)
   - Renders deck list into #deckGrid from index.json
   - Opens modal (#deckModal) with a zoomable/pannable plan viewer
   - Loads SVG as <img> (Safari-safe) with PNG fallback
   - Zoom uses CSS transform on an inner canvas (not on the flex container)
   - Defensive: no null crashes, robust URL resolution, graceful fallbacks

   Expected DOM (from your decks.html):
     #deckSearch, #deckSearchClear, #deckCount, #deckGrid
     #deckModal, #modalClose, #deckPrev, #deckNext
     #modalDeckNumber, #modalDeckTitle, #modalDeckSub
     #deckStage (data-deck-stage), #deckStatus
     #zoomInBtn, #zoomOutBtn, #zoomResetBtn, #fitBtn, #zoomDisplay

   Deck index JSON:
     Tries (in order):
       1) deck-plans/index.json
       2) decks/index.json
     Supports flexible entry shapes. It will infer:
       - deck number (n / deck / number)
       - name/title
       - svg path
       - png path
       - pdf path (optional)
*/

(() => {
  'use strict';

  /* -----------------------------
   * Utilities
   * ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function safeText(v) {
    if (v == null) return '';
    return String(v).replace(/\s+/g, ' ').trim();
  }

  function resolveUrl(path) {
    // Robust on GitHub Pages project paths
    try {
      return new URL(path, document.baseURI).toString();
    } catch {
      return path;
    }
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) el.setAttribute('hidden', 'true');
    else el.removeAttribute('hidden');
  }

  function setStatus(el, msg) {
    if (!el) return;
    el.textContent = safeText(msg);
  }

  function isPrintableCharKey(e) {
    return e.key && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
  }

  /* -----------------------------
   * Deck data normalization
   * ----------------------------- */
  function normalizeDeckEntry(raw) {
    const r = raw || {};

    // number / deck id
    const n =
      safeText(r.n) ||
      safeText(r.deck) ||
      safeText(r.number) ||
      safeText(r.id) ||
      '';

    // title/name
    const name =
      safeText(r.name) ||
      safeText(r.title) ||
      (n ? `Deck ${n}` : 'Deck');

    // asset paths (try common keys)
    const svg =
      safeText(r.svg) ||
      safeText(r.svgPath) ||
      safeText(r.svg_url) ||
      safeText(r.svgUrl) ||
      safeText(r.planSvg) ||
      '';

    const img =
      safeText(r.img) ||
      safeText(r.png) ||
      safeText(r.image) ||
      safeText(r.imagePath) ||
      safeText(r.planImg) ||
      '';

    const pdf =
      safeText(r.pdf) ||
      safeText(r.pdfPath) ||
      safeText(r.planPdf) ||
      '';

    // subtitle/meta
    const sub =
      safeText(r.sub) ||
      safeText(r.subtitle) ||
      safeText(r.meta) ||
      (svg ? 'SVG (vector)' : (img ? 'Image (fallback)' : ''));

    return {
      n,
      name,
      sub,
      svg,
      img,
      pdf,
      raw: r
    };
  }

  async function fetchJsonMaybe(url) {
    const res = await fetch(resolveUrl(url), { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  }

  function buildDeckList() {
  const deckNumbers = [
    "02","03","04","05","06","07","08","09","10","11","12","13","14"
  ];

  return deckNumbers.map(n => ({
    n,
    name: `Deck ${n}`,
    sub: "Interactive deck plan",
    svg: `./decks/deck-${n}-final.min.svg`,
    img: `./decks/deck-${n}.png`
  }));
}
  /* -----------------------------
   * Viewer (stable SVG-as-IMG)
   * ----------------------------- */
  class DeckPlanViewer {
    constructor(opts) {
      this.stage = opts.stage;               // #deckStage
      this.statusEl = opts.statusEl || null; // #deckStatus
      this.zoomDisplay = opts.zoomDisplay || null;

      this.zoomInBtn = opts.zoomInBtn || null;
      this.zoomOutBtn = opts.zoomOutBtn || null;
      this.zoomResetBtn = opts.zoomResetBtn || null;
      this.fitBtn = opts.fitBtn || null;

      // Internal stage structure
      this.scroll = null;    // scroll container
      this.canvas = null;    // scaled element
      this.img = null;

      // Transform
      this.zoom = 1;
      this.minZoom = 0.45;
      this.maxZoom = 5.0;

      // Pan dragging (within scroll container)
      this._drag = { on: false, x: 0, y: 0, sl: 0, st: 0 };

      this._ensureStage();
      this._bindControls();
    }

    _ensureStage() {
      if (!this.stage) return;

      // Clear and build stable structure:
      // stage (focusable) -> scroll container -> canvas (scaled) -> img
      this.stage.innerHTML = '';

      const scroll = document.createElement('div');
      scroll.className = 'deck-plan-scroll';
      scroll.style.width = '100%';
      scroll.style.height = '100%';
      scroll.style.overflow = 'auto';
      scroll.style.webkitOverflowScrolling = 'touch';
      scroll.style.position = 'relative';
      scroll.style.borderRadius = '14px';
      scroll.style.background = 'rgba(255,255,255,0.98)';

      const canvas = document.createElement('div');
      canvas.className = 'deck-plan-canvas';
      canvas.style.display = 'inline-block';
      canvas.style.transformOrigin = '0 0';
      canvas.style.willChange = 'transform';

      scroll.appendChild(canvas);
      this.stage.appendChild(scroll);

      this.scroll = scroll;
      this.canvas = canvas;

      // Pointer drag to pan
      scroll.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this._drag.on = true;
        this._drag.x = e.clientX;
        this._drag.y = e.clientY;
        this._drag.sl = scroll.scrollLeft;
        this._drag.st = scroll.scrollTop;
        scroll.setPointerCapture(e.pointerId);
      });

      scroll.addEventListener('pointermove', (e) => {
        if (!this._drag.on) return;
        const dx = e.clientX - this._drag.x;
        const dy = e.clientY - this._drag.y;
        scroll.scrollLeft = this._drag.sl - dx;
        scroll.scrollTop = this._drag.st - dy;
      });

      const end = (e) => {
        if (!this._drag.on) return;
        this._drag.on = false;
        try { scroll.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      scroll.addEventListener('pointerup', end);
      scroll.addEventListener('pointercancel', end);

      // Wheel zoom (desktop trackpad/mouse)
      scroll.addEventListener('wheel', (e) => {
        if (!this.img) return;
        // Zoom only when ctrlKey (trackpad pinch) OR when user scrolls with altKey (optional)
        // But on many browsers, pinch sets ctrlKey=true.
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        const factor = e.deltaY > 0 ? (1 / 1.12) : 1.12;
        this.zoomAt(factor, e.clientX, e.clientY);
      }, { passive: false });
    }

    _bindControls() {
      if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => this.setZoom(this.zoom * 1.18, { keepCenter: true }));
      if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => this.setZoom(this.zoom / 1.18, { keepCenter: true }));
      if (this.zoomResetBtn) this.zoomResetBtn.addEventListener('click', () => this.setZoom(1, { fit: false, keepCenter: true }));
      if (this.fitBtn) this.fitBtn.addEventListener('click', () => this.fit());
    }

    _applyTransform() {
      if (!this.canvas) return;
      this.canvas.style.transform = `scale(${this.zoom})`;
      if (this.zoomDisplay) this.zoomDisplay.textContent = `${Math.round(this.zoom * 100)}%`;
    }

    setZoom(next, opts = {}) {
      if (!this.scroll || !this.canvas) return;
      const prev = this.zoom;
      const z = clamp(next, this.minZoom, this.maxZoom);
      if (Math.abs(z - prev) < 1e-6) return;

      // Keep center stable in scroll coordinates if requested
      let cx = null;
      let cy = null;
      if (opts.keepCenter) {
        cx = this.scroll.scrollLeft + this.scroll.clientWidth / 2;
        cy = this.scroll.scrollTop + this.scroll.clientHeight / 2;
      }

      this.zoom = z;
      this._applyTransform();

      if (opts.keepCenter && cx != null && cy != null) {
        const ratio = this.zoom / prev;
        this.scroll.scrollLeft = cx * ratio - this.scroll.clientWidth / 2;
        this.scroll.scrollTop = cy * ratio - this.scroll.clientHeight / 2;
      }

      setStatus(this.statusEl, `Zoom: ${Math.round(this.zoom * 100)}%`);
    }

    zoomAt(factor, clientX, clientY) {
      if (!this.scroll) return;

      const prev = this.zoom;
      const next = clamp(this.zoom * factor, this.minZoom, this.maxZoom);
      if (Math.abs(next - prev) < 1e-6) return;

      // Anchor zoom around pointer position in scroll container
      const rect = this.scroll.getBoundingClientRect();
      const px = clientX - rect.left + this.scroll.scrollLeft;
      const py = clientY - rect.top + this.scroll.scrollTop;

      this.zoom = next;
      this._applyTransform();

      const ratio = this.zoom / prev;
      this.scroll.scrollLeft = px * ratio - (clientX - rect.left);
      this.scroll.scrollTop = py * ratio - (clientY - rect.top);

      setStatus(this.statusEl, `Zoom: ${Math.round(this.zoom * 100)}%`);
    }

    fit() {
      if (!this.scroll || !this.img) return;

      const pad = 24;
      const vw = Math.max(1, this.scroll.clientWidth - pad * 2);
      const vh = Math.max(1, this.scroll.clientHeight - pad * 2);

      const iw = this.img.naturalWidth || this.img.width || 1;
      const ih = this.img.naturalHeight || this.img.height || 1;

      const s = clamp(Math.min(vw / iw, vh / ih), this.minZoom, this.maxZoom);
      this.zoom = s;
      this._applyTransform();

      // Center
      requestAnimationFrame(() => {
        const cx = (this.scroll.scrollWidth - this.scroll.clientWidth) / 2;
        const cy = (this.scroll.scrollHeight - this.scroll.clientHeight) / 2;
        this.scroll.scrollLeft = Math.max(0, cx);
        this.scroll.scrollTop = Math.max(0, cy);
      });

      setStatus(this.statusEl, `Fit view (${Math.round(this.zoom * 100)}%)`);
    }

    async showDeck(deck) {
      if (!this.canvas) return;

      this.canvas.innerHTML = '';
      this.img = null;

      // Skeleton
      const sk = document.createElement('div');
      sk.style.width = 'min(92vw, 1200px)';
      sk.style.height = 'min(70vh, 780px)';
      sk.style.borderRadius = '14px';
      sk.style.background = 'linear-gradient(90deg, #f2f7fb 25%, #e8f2f8 50%, #f2f7fb 75%)';
      sk.style.backgroundSize = '200% 100%';
      sk.style.animation = 'deckShimmer 1.4s infinite';
      this.canvas.appendChild(sk);

      // Ensure keyframes exist once (inline)
      if (!document.getElementById('__deckShimmerKF')) {
        const style = document.createElement('style');
        style.id = '__deckShimmerKF';
        style.textContent = `
          @keyframes deckShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        `;
        document.head.appendChild(style);
      }

      // Reset zoom before placing new image
      this.setZoom(1, { keepCenter: false });

      const svgUrl = deck.svg ? resolveUrl(deck.svg) : '';
      const pngUrl = deck.img ? resolveUrl(deck.img) : '';

      // Load SVG as image first (stable on iOS), then PNG fallback if SVG fails
      const img = new Image();
      img.alt = `${safeText(deck.name || 'Deck')} plan`;
      img.decoding = 'async';
      img.loading = 'eager';
      img.referrerPolicy = 'no-referrer-when-downgrade';
      img.style.cssText =
        'max-width:100%; height:auto; border-radius:14px; ' +
        'box-shadow:0 6px 22px rgba(10,46,74,0.18); background:#fff; ' +
        'user-select:none; display:block;';

      const mount = () => {
        this.canvas.innerHTML = '';
        this.canvas.appendChild(img);
        this.img = img;
        // Fit by default for first render (feels premium)
        this.fit();
      };

      const failToPng = () => {
        if (!pngUrl) {
          this.canvas.innerHTML = `
            <div style="padding:18px; font:600 14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif; color:#0A2E4A;">
              Deck plan failed to load.
              <div style="opacity:.8; font-weight:500; margin-top:8px;">Missing fallback PNG path.</div>
            </div>
          `;
          setStatus(this.statusEl, 'Deck plan failed to load (no PNG fallback).');
          return;
        }

        const fb = new Image();
        fb.alt = img.alt;
        fb.decoding = 'async';
        fb.loading = 'eager';
        fb.referrerPolicy = img.referrerPolicy;
        fb.style.cssText = img.style.cssText;

        fb.onload = () => {
          this.canvas.innerHTML = '';
          this.canvas.appendChild(fb);
          this.img = fb;
          this.fit();
          setStatus(this.statusEl, 'Loaded PNG fallback.');
        };

        fb.onerror = () => {
          this.canvas.innerHTML = `
            <div style="padding:18px; font:600 14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif; color:#0A2E4A;">
              Deck plan failed to load.
              <div style="opacity:.8; font-weight:500; margin-top:8px;">SVG and PNG both failed.</div>
            </div>
          `;
          setStatus(this.statusEl, 'Deck plan failed to load (SVG + PNG).');
        };

        fb.src = pngUrl;
      };

      img.onload = () => {
        mount();
        setStatus(this.statusEl, 'Deck plan loaded.');
      };

      img.onerror = () => {
        failToPng();
      };

      if (svgUrl) {
        img.src = svgUrl;
      } else if (pngUrl) {
        img.src = pngUrl;
      } else {
        this.canvas.innerHTML = `
          <div style="padding:18px; font:600 14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif; color:#0A2E4A;">
            Deck plan not configured.
            <div style="opacity:.8; font-weight:500; margin-top:8px;">No SVG or PNG path available for this deck.</div>
          </div>
        `;
        setStatus(this.statusEl, 'No deck asset paths found.');
      }
    }
  }

  /* -----------------------------
   * Modal controller + page wiring
   * ----------------------------- */
  function init() {
    const searchEl = $('#deckSearch');
    const searchClear = $('#deckSearchClear');
    const countEl = $('#deckCount');
    const grid = $('#deckGrid');

    const modal = $('#deckModal');
    const closeBtn = $('#modalClose');
    const prevBtn = $('#deckPrev');
    const nextBtn = $('#deckNext');

    const modalDeckNumber = $('#modalDeckNumber');
    const modalDeckTitle = $('#modalDeckTitle');
    const modalDeckSub = $('#modalDeckSub');

    const stage = $('#deckStage') || $('[data-deck-stage]');
    const statusEl = $('#deckStatus');
    const zoomDisplay = $('#zoomDisplay');

    const viewer = new DeckPlanViewer({
      stage,
      statusEl,
      zoomDisplay,
      zoomInBtn: $('#zoomInBtn'),
      zoomOutBtn: $('#zoomOutBtn'),
      zoomResetBtn: $('#zoomResetBtn'),
      fitBtn: $('#fitBtn')
    });

    // Defensive null guards
    if (!grid) {
      console.warn('[decks] Missing #deckGrid. Nothing to render.');
      return;
    }
    if (!modal) {
      console.warn('[decks] Missing #deckModal. Modal features disabled.');
    }

    let decks = [];
    let filtered = [];
    let activeIndex = -1;

    const updateCount = () => {
      if (!countEl) return;
      const total = decks.length;
      const shown = filtered.length;
      countEl.textContent = total
        ? `${shown} / ${total} decks`
        : '';
    };

    const isOpen = () => modal && !modal.hasAttribute('hidden');

    const openModal = async (idx) => {
      if (!modal) return;
      activeIndex = clamp(idx, 0, filtered.length - 1);
      const d = filtered[activeIndex];
      if (!d) return;

      modal.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';

      if (modalDeckNumber) modalDeckNumber.textContent = d.n ? `DECK ${d.n}` : 'DECK';
      if (modalDeckTitle) modalDeckTitle.textContent = d.name || 'Deck';
      if (modalDeckSub) modalDeckSub.textContent = d.sub || '';

      setStatus(statusEl, `Loading ${d.name}…`);
      await viewer.showDeck(d);

      // Focus close for keyboard
      requestAnimationFrame(() => closeBtn?.focus?.());
    };

    const closeModal = () => {
      if (!modal) return;
      modal.setAttribute('hidden', 'true');
      document.body.style.overflow = '';
      setStatus(statusEl, '');
      // Clear stage content (optional)
      // viewer._ensureStage(); // keep it as-is to avoid reflows
    };

    const goto = async (dir) => {
      if (!filtered.length) return;
      const next = (activeIndex + dir + filtered.length) % filtered.length;
      await openModal(next);
    };

    const renderGrid = () => {
      grid.innerHTML = '';

      const frag = document.createDocumentFragment();
      for (let i = 0; i < filtered.length; i++) {
        const d = filtered[i];

        const card = document.createElement('article');
        card.className = 'deck-card';
        card.setAttribute('role', 'listitem');
        card.tabIndex = 0;

        const n = document.createElement('div');
        n.style.fontWeight = '800';
        n.style.letterSpacing = '0.04em';
        n.style.opacity = '0.9';
        n.textContent = d.n ? `DECK ${d.n}` : 'DECK';

        const title = document.createElement('div');
        title.style.fontFamily = '"Plus Jakarta Sans", system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif';
        title.style.fontWeight = '900';
        title.style.fontSize = '1.25rem';
        title.style.marginTop = '8px';
        title.textContent = d.name || 'Deck';

        const sub = document.createElement('div');
        sub.style.marginTop = '6px';
        sub.style.opacity = '0.8';
        sub.style.fontWeight = '600';
        sub.style.fontSize = '0.92rem';
        sub.textContent = d.sub || 'Tap to view plan';

        const hint = document.createElement('div');
        hint.style.marginTop = '14px';
        hint.style.display = 'flex';
        hint.style.alignItems = 'center';
        hint.style.gap = '10px';
        hint.style.opacity = '0.9';

        const pill = document.createElement('span');
        pill.style.display = 'inline-flex';
        pill.style.alignItems = 'center';
        pill.style.gap = '8px';
        pill.style.padding = '8px 12px';
        pill.style.borderRadius = '999px';
        pill.style.background = 'rgba(0,180,230,0.10)';
        pill.style.color = '#0A2E4A';
        pill.style.fontWeight = '800';
        pill.style.fontSize = '0.82rem';
        pill.innerHTML = `<i class="fas fa-map"></i><span>Open plan</span>`;

        hint.appendChild(pill);

        card.appendChild(n);
        card.appendChild(title);
        card.appendChild(sub);
        card.appendChild(hint);

        const activate = () => openModal(i);

        card.addEventListener('click', activate);
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activate();
          }
        });

        frag.appendChild(card);
      }

      grid.appendChild(frag);
      updateCount();
    };

    const applyFilter = (q) => {
      const query = safeText(q).toLowerCase();

      if (!query) {
        filtered = decks.slice();
        setHidden(searchClear, true);
        renderGrid();
        return;
      }

      setHidden(searchClear, false);

      filtered = decks.filter(d => {
        const hay = `${d.n} ${d.name} ${d.sub} ${d.svg} ${d.img}`.toLowerCase();
        return hay.includes(query);
      });

      renderGrid();
    };

    // Search wiring
    if (searchEl) {
      searchEl.addEventListener('input', () => {
        applyFilter(searchEl.value);
      });

      searchEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchEl.value = '';
          applyFilter('');
          searchEl.blur();
        }
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchEl) searchEl.value = '';
        applyFilter('');
        searchEl?.focus?.();
      });
    }

    // Modal wiring
    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    prevBtn?.addEventListener('click', () => goto(-1));
    nextBtn?.addEventListener('click', () => goto(+1));

    document.addEventListener('keydown', (e) => {
      // If modal open, handle nav + close
      if (isOpen()) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeModal();
          return;
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goto(-1);
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goto(+1);
          return;
        }
      } else {
        // Quick focus search on typing
        if (searchEl && isPrintableCharKey(e) && document.activeElement === document.body) {
          searchEl.focus();
        }
      }
    });

    // Global safety: surface masked errors into #deckStatus
    window.addEventListener('error', (ev) => {
      const msg = safeText(ev?.message || 'Script error');
      if (statusEl) setStatus(statusEl, `Error: ${msg}`);
    });

    window.addEventListener('unhandledrejection', (ev) => {
      const msg = safeText(ev?.reason?.message || ev?.reason || 'Unhandled promise rejection');
      if (statusEl) setStatus(statusEl, `Error: ${msg}`);
    });

    // Load deck index and render
    (async () => {
      try {
        setStatus(statusEl, 'Loading deck index…');
decks = buildDeckList();
        filtered = decks.slice();
        renderGrid();
        setStatus(statusEl, '');
      } catch (err) {
        console.error('[decks] index load failed:', err);
        setStatus(statusEl, `Deck index failed: ${safeText(err?.message || err)}`);
        grid.innerHTML = `
          <div style="padding:18px; border-radius:16px; background:rgba(255,255,255,0.75); border:1px solid rgba(0,0,0,0.06);">
            <div style="font-weight:900; font-size:1.05rem; color:#0A2E4A;">Decks unavailable</div>
            <div style="margin-top:8px; opacity:.85; font-weight:600;">
              Could not load deck index.json. Ensure <code>deck-plans/index.json</code> or <code>decks/index.json</code> exists on the site.
            </div>
          </div>
        `;
        updateCount();
      }
    })();
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
