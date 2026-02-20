/* =========================================================
   RCCL Deck Navigator
   Stable GitHub Pages Version
   No JSON dependency
   No inline SVG parsing
   Production hardened
========================================================= */

(() => {
  'use strict';

  /* =========================================================
     CONFIG
  ========================================================= */

const BASE_PATH = './decks/';


  const DECK_NUMBERS = [
    "02","03","04","05","06","07",
    "08","09","10","11","12","13","14"
  ];

  /* =========================================================
     STATE
  ========================================================= */

  let decks = [];
  let currentIndex = 0;
  let zoom = 1;

  /* =========================================================
     DOM
  ========================================================= */

  const grid = document.getElementById('deckGrid');
  const searchInput = document.getElementById('deckSearch');
  const searchClear = document.getElementById('deckSearchClear');
  const deckCount = document.getElementById('deckCount');

  const modal = document.getElementById('deckModal');
  const modalClose = document.getElementById('modalClose');
  const modalDeckNumber = document.getElementById('modalDeckNumber');
  const modalDeckTitle = document.getElementById('modalDeckTitle');
  const modalDeckSub = document.getElementById('modalDeckSub');
  const deckStage = document.getElementById('deckStage');

  const deckPrev = document.getElementById('deckPrev');
  const deckNext = document.getElementById('deckNext');

  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');
  const fitBtn = document.getElementById('fitBtn');
  const zoomDisplay = document.getElementById('zoomDisplay');

  const statusBar = document.getElementById('deckStatus');

  /* =========================================================
     BUILD DATA
  ========================================================= */

  function buildDeckList() {
    return DECK_NUMBERS.map(n => ({
      n,
      name: `Deck ${n}`,
      sub: 'Interactive deck plan',
      svg: `${BASE_PATH}deck-${n}-final.min.svg`,
      img: `${BASE_PATH}deck-${n}.png`
    }));
  }

  /* =========================================================
     RENDER GRID
  ========================================================= */

  function renderGrid(list) {
    grid.innerHTML = '';

    list.forEach((deck, index) => {
      const card = document.createElement('div');
      card.className = 'deck-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('tabindex', '0');

      card.innerHTML = `
        <div class="deck-card-title">${deck.name}</div>
        <div class="deck-card-sub">${deck.sub}</div>
      `;

      card.addEventListener('click', () => openDeck(index));
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') openDeck(index);
      });

      grid.appendChild(card);
    });

    deckCount.textContent = `${list.length} / ${decks.length} decks`;
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  function filterDecks(query) {
    const q = query.trim().toLowerCase();

    if (!q) {
      renderGrid(decks);
      return;
    }

    const filtered = decks.filter(d =>
      d.name.toLowerCase().includes(q)
    );

    renderGrid(filtered);
  }

  /* =========================================================
     MODAL
  ========================================================= */

  function openDeck(index) {
    currentIndex = index;
    showDeck();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    deckStage.innerHTML = '';
  }

  /* =========================================================
     LOAD DECK IMAGE (Stable Method)
  ========================================================= */

  function showDeck() {
    const deck = decks[currentIndex];

    modalDeckNumber.textContent = deck.n;
    modalDeckTitle.textContent = deck.name;
    modalDeckSub.textContent = deck.sub;

    deckStage.innerHTML = '';
    statusBar.textContent = 'Loading deck...';

    const img = new Image();
    img.src = deck.svg;
    img.alt = deck.name;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.transformOrigin = 'center center';

    img.onload = () => {
      zoom = 1;
      updateZoom();
      statusBar.textContent = '';
    };

    img.onerror = () => {
      // fallback to PNG
      const fallback = new Image();
      fallback.src = deck.img;
      fallback.alt = deck.name;
      fallback.style.maxWidth = '100%';
      fallback.style.height = 'auto';
      fallback.style.display = 'block';

      fallback.onload = () => {
        zoom = 1;
        updateZoom();
        statusBar.textContent = '';
      };

      fallback.onerror = () => {
        statusBar.textContent = 'Failed to load deck image.';
      };

      deckStage.appendChild(fallback);
    };

    deckStage.appendChild(img);
  }

  /* =========================================================
     NAVIGATION
  ========================================================= */

  function prevDeck() {
    if (currentIndex > 0) {
      currentIndex--;
      showDeck();
    }
  }

  function nextDeck() {
    if (currentIndex < decks.length - 1) {
      currentIndex++;
      showDeck();
    }
  }

  /* =========================================================
     ZOOM
  ========================================================= */

  function updateZoom() {
    const img = deckStage.querySelector('img');
    if (!img) return;

    img.style.transform = `scale(${zoom})`;
    zoomDisplay.textContent = `${Math.round(zoom * 100)}%`;
  }

  function zoomIn() {
    zoom = Math.min(zoom + 0.1, 3);
    updateZoom();
  }

  function zoomOut() {
    zoom = Math.max(zoom - 0.1, 0.5);
    updateZoom();
  }

  function resetZoom() {
    zoom = 1;
    updateZoom();
  }

  function fitToScreen() {
    zoom = 1;
    updateZoom();
  }

  /* =========================================================
     INIT
  ========================================================= */

  function init() {
    if (!grid) return;
    if (grid.dataset.initialized === 'true') return;
    grid.dataset.initialized = 'true';

    decks = buildDeckList();
    renderGrid(decks);

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchClear.hidden = !e.target.value;
        filterDecks(e.target.value);
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.hidden = true;
        renderGrid(decks);
      });
    }

    modalClose?.addEventListener('click', closeModal);
    deckPrev?.addEventListener('click', prevDeck);
    deckNext?.addEventListener('click', nextDeck);

    zoomInBtn?.addEventListener('click', zoomIn);
    zoomOutBtn?.addEventListener('click', zoomOut);
    zoomResetBtn?.addEventListener('click', resetZoom);
    fitBtn?.addEventListener('click', fitToScreen);


    const deckViewer = document.querySelector('.deck-viewer');
    if (deckViewer && deckViewer.dataset.initialized !== 'true') {
      deckViewer.dataset.initialized = 'true';
      deckViewer.addEventListener('click', (event) => {
        const target = event.target.closest('[data-room]');
        if (!target) return;
        target.classList.toggle('room-selected');
      });
    }

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (modal.hidden) return;

      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prevDeck();
      if (e.key === 'ArrowRight') nextDeck();
    });
  }

  document.addEventListener('DOMContentLoaded', init);

})();