document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const DECKS = Array.from({ length: 14 }, (_, i) => {
    const n = 15 - i;
    return {
      number: n,
      title: `Deck ${n}`,
      sub: "Adventure of the Seas",
      svg: `decks/deck-${String(n).padStart(2, "0")}-final.min.svg`
    };
  });

  const $ = id => document.getElementById(id);

  const grid = $("deckGrid");
  const search = $("deckSearch");
  const searchClear = $("deckSearchClear");
  const count = $("deckCount");

  const modal = $("deckModal");
  const modalNumber = $("modalDeckNumber");
  const modalTitle = $("modalDeckTitle");
  const modalSub = $("modalDeckSub");
  const modalClose = $("modalClose");

  const canvas = $("deckCanvas");
  const stage = $("deckPlanStage");

  const zoomInBtn = $("zoomIn");
  const zoomOutBtn = $("zoomOut");
  const zoomResetBtn = $("zoomReset");
  const zoomDisplay = $("zoomDisplay");

  const prevBtn = $("deckPrev");
  const nextBtn = $("deckNext");

  let currentIndex = -1;
  let zoom = 1;

  if (!grid) {
    console.error("Deck grid missing.");
    return;
  }

  function render(list = DECKS) {
    grid.innerHTML = "";
    list.forEach((deck, index) => {
      const card = document.createElement("div");
      card.className = "deck-card";
      card.innerHTML = `<strong>Deck ${deck.number}</strong><div>${deck.sub}</div>`;
      card.addEventListener("click", () => openDeck(index));
      grid.appendChild(card);
    });
    count.textContent = `${list.length} decks`;
  }

  function openDeck(index) {
    const deck = DECKS[index];
    if (!deck) return;

    currentIndex = index;
    modalNumber.textContent = deck.number;
    modalTitle.textContent = deck.title;
    modalSub.textContent = deck.sub;

    loadSVG(deck.svg);

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeDeck() {
    modal.hidden = true;
    stage.innerHTML = "";
    document.body.style.overflow = "";
  }

  function loadSVG(src) {
    stage.innerHTML = "Loading...";
    const img = new Image();
    img.src = src;
    img.alt = "Deck Plan";
    img.onload = () => {
      stage.innerHTML = "";
      stage.appendChild(img);
      setZoom(1);
    };
    img.onerror = () => {
      stage.innerHTML = "Unable to load deck plan.";
      console.error("Failed to load:", src);
    };
  }

  function setZoom(value) {
    zoom = Math.min(3, Math.max(0.5, value));
    stage.style.transform = `scale(${zoom})`;
    zoomDisplay.textContent = `${Math.round(zoom * 100)}%`;
  }

  search?.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    searchClear.hidden = !q;
    render(DECKS.filter(d =>
      d.title.toLowerCase().includes(q)
    ));
  });

  searchClear?.addEventListener("click", () => {
    search.value = "";
    searchClear.hidden = true;
    render();
  });

  modalClose?.addEventListener("click", closeDeck);
  modal?.addEventListener("click", e => {
    if (e.target === modal) closeDeck();
  });

  zoomInBtn?.addEventListener("click", () => setZoom(zoom + 0.25));
  zoomOutBtn?.addEventListener("click", () => setZoom(zoom - 0.25));
  zoomResetBtn?.addEventListener("click", () => setZoom(1));

  prevBtn?.addEventListener("click", () => {
    if (currentIndex > 0) openDeck(currentIndex - 1);
  });

  nextBtn?.addEventListener("click", () => {
    if (currentIndex < DECKS.length - 1) openDeck(currentIndex + 1);
  });

  render();
});
