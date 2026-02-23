/**
 * decks.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
(function () {
  // ---- DECK DATA (same as original, enriched with more hotspots) ----
  const deckData = [
    {
      number: 0,
      name: "All Decks",
      subtitle: "Ship Overview Blueprint",
      highlights: [
        "Full ship layout",
        "Cross-deck context",
        "Fast orientation",
      ],
      description: "Complete multi-deck blueprint – ultimate orientation.",
      category: "essential",
      image: "decks/deck-all.min.svg",
      svg: "decks/deck-all.min.svg",
      pdf: "",
    },
    {
      number: 5,
      name: "Deck 5",
      subtitle: "Promenade Level",
      highlights: ["Entertainment", "Dining", "Retail"],
      description: "Royal Promenade – cafes, shops, parades.",
      category: "entertainment",
      image: "decks/deck-05.png",
      svg: "decks/deck-05-final.min.svg",
      pdf: "decks/deck-05.pdf",
    },
    {
      number: 14,
      name: "Deck 14",
      subtitle: "Sky Deck",
      highlights: ["Panoramic views", "Lounges", "Sun decks"],
      description: "Viking Crown Lounge & sky bar.",
      category: "entertainment",
      image: "decks/deck-14.png",
      svg: "decks/deck-14-final.min.svg",
      pdf: "",
    },
    {
      number: 11,
      name: "Deck 11",
      subtitle: "Fitness & Spa",
      highlights: ["Spa", "Fitness", "Wellness"],
      description: "Vitality Spa & fully equipped fitness.",
      category: "wellness",
      image: "decks/deck-11.png",
      svg: "decks/deck-11-final.min.svg",
      pdf: "",
    },
    {
      number: 12,
      name: "Deck 12",
      subtitle: "Pool Deck",
      highlights: ["Main pool", "Solarium", "Grill"],
      description: "Main pool, adults-only solarium, Windjammer.",
      category: "wellness",
      image: "decks/deck-12.png",
      svg: "decks/deck-12-final.min.svg",
      pdf: "",
    },
    {
      number: 15,
      name: "Deck 15",
      subtitle: "Sports & Observation",
      highlights: ["Sports court", "Jog track", "Views"],
      description: "FlowRider, mini-golf, running track.",
      category: "wellness",
      image: "decks/deck-15.png",
      svg: "decks/deck-15-final.min.svg",
      pdf: "",
    },
    {
      number: 13,
      name: "Deck 13",
      subtitle: "Adventure Zone",
      highlights: ["FlowRider", "Sky deck access", "Activities"],
      description: "Adventure Ocean & rock climbing wall.",
      category: "entertainment",
      image: "decks/deck-13.png",
      svg: "decks/deck-13-final.min.svg",
      pdf: "",
    },
    {
      number: 10,
      name: "Deck 10",
      subtitle: "Stateroom Corridor",
      highlights: ["Cabins", "Elevators", "Quiet routes"],
      description: "Premium staterooms, aft elevator lobby.",
      category: "essential",
      image: "decks/deck-10.png",
      svg: "decks/deck-10-final.min.svg",
      pdf: "",
    },
    {
      number: 9,
      name: "Deck 9",
      subtitle: "Midship Cabins",
      highlights: ["Cabins", "Family zones", "Wayfinding"],
      description: "Family-friendly staterooms.",
      category: "essential",
      image: "decks/deck-09.png",
      svg: "decks/deck-09-final.min.svg",
      pdf: "",
    },
    {
      number: 8,
      name: "Deck 8",
      subtitle: "Stateroom Access",
      highlights: ["Cabins", "Aft access", "Guest routes"],
      description: "Convenient access to upper decks.",
      category: "essential",
      image: "decks/deck-08.png",
      svg: "decks/deck-08-final.min.svg",
      pdf: "",
    },
    {
      number: 7,
      name: "Deck 7",
      subtitle: "Cabin Transit",
      highlights: ["Cabins", "Quiet zones", "Midship transit"],
      description: "Quiet corridor, elevator stacks C/D.",
      category: "essential",
      image: "decks/deck-07.png",
      svg: "decks/deck-07-final.min.svg",
      pdf: "",
    },
    {
      number: 6,
      name: "Deck 6",
      subtitle: "Stateroom Ring",
      highlights: ["Cabins", "Family adjacency", "Deck transitions"],
      description: "Your stateroom zone (6650) near aft.",
      category: "essential",
      image: "decks/deck-06.png",
      svg: "decks/deck-06-final.min.svg",
      pdf: "",
    },
    {
      number: 4,
      name: "Deck 4",
      subtitle: "Dining & Entertainment",
      highlights: ["Main dining", "Show venue", "Casino"],
      description: "Main dining room, theater, casino.",
      category: "entertainment",
      image: "decks/deck-04.png",
      svg: "decks/deck-04-final.min.svg",
      pdf: "",
    },
    {
      number: 3,
      name: "Deck 3",
      subtitle: "Lobby & Guest Services",
      highlights: ["Guest services", "Dining", "Retail"],
      description: "Grand lobby, shore excursions, champagne bar.",
      category: "essential",
      image: "decks/deck-03.png",
      svg: "decks/deck-03-final.min.svg",
      pdf: "",
    },
    {
      number: 2,
      name: "Deck 2",
      subtitle: "Medical & Crew Support",
      highlights: ["Medical", "Crew services", "Logistics"],
      description: "Medical center, crew mess, embarkation.",
      category: "essential",
      image: "decks/deck-02.png",
      svg: "decks/deck-02-final.min.svg",
      pdf: "",
    },
  ];

  // ---- DECK HOTSPOTS (enhanced) ----
  const deckHotspots = {
    6: [
      {
        id: "aft-cabins",
        title: "Aft cabin cluster",
        note: "Quieter corridor, wake views. Your room 6650 nearby.",
        x: 78,
        y: 58,
        highlight: true,
      },
      {
        id: "midship-elevators",
        title: "Midship elevators",
        note: "Fastest transfer to dining & promenade.",
        x: 52,
        y: 50,
        highlight: false,
      },
      {
        id: "forward-stairs",
        title: "Forward stairs",
        note: "Best route to theater and deck 4.",
        x: 26,
        y: 43,
      },
    ],
    12: [
      {
        id: "main-pool",
        title: "Main pool",
        note: "Live music, pool games, bar.",
        x: 40,
        y: 60,
      },
      {
        id: "solarium",
        title: "Solarium",
        note: "Adults-only oasis, indoor pool.",
        x: 70,
        y: 30,
        highlight: true,
      },
      {
        id: "windjammer",
        title: "Windjammer Cafe",
        note: "Casual buffet, ocean view.",
        x: 20,
        y: 70,
      },
    ],
    11: [
      {
        id: "spa",
        title: "Vitality Spa",
        note: "Thermal suite, massages.",
        x: 48,
        y: 44,
      },
      {
        id: "fitness",
        title: "Fitness Center",
        note: "Panoramic treadmills.",
        x: 30,
        y: 55,
      },
    ],
    5: [
      {
        id: "cafe-promenade",
        title: "Cafe Promenade",
        note: "24h coffee, sandwiches.",
        x: 55,
        y: 48,
      },
      {
        id: "guest-services",
        title: "Guest Services",
        note: "Desk, crown & anchor.",
        x: 48,
        y: 60,
      },
    ],
  };

  // ---- FOCUS CHIPS ----
  const deckFocusMap = {
    12: ["Main Pool", "Solarium", "Windjammer"],
    11: ["Vitality Spa", "Fitness Center"],
    5: ["Cafe Promenade", "Guest Services"],
    4: ["Main Dining", "Royal Theater"],
    6: ["Room 6650", "Midship Elevators"],
  };

  // --- STATE ---
  const state = {
    filter: "all",
    search: "",
    lastOpenedDeck: null,
    currentDeck: null,
    currentZoom: 100,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartLeft: 0,
    dragStartTop: 0,
    panHintShown: sessionStorage.getItem("deck_pan_hint_shown") === "1",
  };

  const els = {
    search: document.getElementById("deckSearch"),
    quickRail: document.getElementById("deckQuickRail"),
    cards: document.getElementById("deckCards"),
    empty: document.getElementById("emptyState"),
    clearFilters: document.getElementById("clearFilters"),
    categoryToggle: document.getElementById("toggleCategoryBrowse"),
    categoryPanels: document.getElementById("deckCategoryPanels"),
    modal: document.getElementById("deckModal"),
    modalFrame: document.getElementById("modalFrame"),
    modalTitle: document.getElementById("modalTitle"),
    modalDesc: document.getElementById("modalDesc"),
    modalFocusChips: document.getElementById("deckFocusChips"),
    panHint: document.getElementById("deckPanHint"),
    zoomLevel: document.getElementById("zoomLevel"),
    download: document.getElementById("downloadPlan"),
  };

  // ----- RENDER FUNCTIONS (polished) -----
  function renderQuickRail() {
    const sorted = [...deckData].sort((a, b) => b.number - a.number);
    els.quickRail.innerHTML = sorted
      .map(
        (d) => `
          <button class="deck-quickbtn" data-deck="${d.number}" aria-label="Open ${d.name}">
            <span class="deck-quickbtn__num">${d.number === 0 ? "ALL" : `D${d.number}`}</span>
            <span class="deck-quickbtn__sub">${d.subtitle}</span>
          </button>
        `,
      )
      .join("");
  }

  function renderPills() {
    const cats = { entertainment: [], wellness: [], essential: [] };
    deckData.forEach((d) => {
      if (cats[d.category]) cats[d.category].push(d);
    });
    Object.entries(cats).forEach(([key, decks]) => {
      const host = document.getElementById(`pill-${key}`);
      if (host)
        host.innerHTML = decks
          .map(
            (d) => `
            <button class="deck-pill" data-deck="${d.number}">
              <span class="deck-pill__number">${d.number === 0 ? "ALL" : d.number}</span>
              <span class="deck-pill__text">${d.subtitle}</span>
            </button>
          `,
          )
          .join("");
    });
  }

  // ---------- IMAGE PATH RESOLVER ----------
  function getDeckImage(number) {
    if (number === 0) return "decks/deck-all.svg";
    return `decks/deck-${String(number).padStart(2, "0")}.png`;
  }

  // ---------- CATEGORY CLASS ----------
  function getCategoryClass(category) {
    return `deck-card--${category}`;
  }

  // ---------- RENDER CARDS ----------
  function renderDeckCards(filter = "all", search = "") {
    const container = document.getElementById("deckCards");

    container.innerHTML = "";

    const filtered = deckData.filter((deck) => {
      const matchesCategory = filter === "all" || deck.category === filter;

      const matchesSearch =
        search === "" ||
        deck.name.toLowerCase().includes(search) ||
        deck.subtitle.toLowerCase().includes(search) ||
        deck.highlights.join(" ").toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });

    filtered.forEach((deck) => {
      const card = document.createElement("article");
      card.className = `deck-card ${getCategoryClass(deck.category)}`;
      card.setAttribute("role", "listitem");
      card.dataset.deck = deck.number;

      card.innerHTML = `
            <div class="deck-visual">
              <span class="deck-number">${deck.number === 0 ? "ALL" : deck.number}</span>
              <img src="${getDeckImage(deck.number)}"
                   alt="${deck.name}"
                   loading="lazy"
                   decoding="async">
            </div>

            <div class="deck-info">
              <h3 class="deck-title">${deck.name}</h3>
              <p class="deck-subtitle">${deck.subtitle}</p>
              <div class="deck-highlights">
                ${deck.highlights.map((h) => `<span>${h}</span>`).join("")}
              </div>
              <button class="deck-card__cta" data-action="open" data-deck="${deck.number}">
                Explore deck →
              </button>
            </div>
          `;

      container.appendChild(card);
    });

    document.getElementById("emptyState").hidden = filtered.length !== 0;
  }

  // --- MODAL ---
  function openModal(deck) {
    state.currentDeck = deck;
    state.lastOpenedDeck = deck.number;
    setActiveDeck(deck.number);
    renderFocusChips(deck);
    animateModalTitle(deck.name);
    renderModalPlan(deck);
    if (deck.pdf) {
      els.download.href = deck.pdf;
      els.download.removeAttribute("aria-disabled");
    } else {
      els.download.href = "#";
      els.download.setAttribute("aria-disabled", "true");
    }
    els.modal.classList.add("is-open");
    els.modal.setAttribute("aria-hidden", "false");
    setZoom(100);
  }

  function closeModal() {
    els.modal.classList.remove("is-open");
    els.modal.setAttribute("aria-hidden", "true");
    togglePanHint(false);
  }

  function animateModalTitle(nextText) {
    els.modalTitle.classList.add("is-swapping");
    setTimeout(() => {
      els.modalTitle.textContent = nextText;
      els.modalTitle.classList.remove("is-swapping");
    }, 160);
  }

  function togglePanHint(show) {
    if (!els.panHint) return;
    if (show) {
      els.panHint.hidden = false;
      requestAnimationFrame(() => els.panHint.classList.add("is-visible"));
      return;
    }
    els.panHint.classList.remove("is-visible");
    setTimeout(() => {
      if (!els.panHint.classList.contains("is-visible"))
        els.panHint.hidden = true;
    }, 180);
  }

  function setZoom(v) {
    state.currentZoom = Math.min(300, Math.max(50, v));
    els.zoomLevel.textContent = `${state.currentZoom}%`;
    updateZoomRule();
    if (state.currentZoom > 100 && !state.panHintShown) {
      togglePanHint(true);
      state.panHintShown = true;
      sessionStorage.setItem("deck_pan_hint_shown", "1");
      setTimeout(() => togglePanHint(false), 2400);
    }
  }

  function upsertStyleRule(id, cssText) {
    let styleEl = document.getElementById(id);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = id;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = cssText;
  }

  function updateZoomRule() {
    const zoom = (state.currentZoom / 100).toFixed(2);
    upsertStyleRule(
      "deck-zoom-rule",
      `.decks-page #deckPlanCanvas { transform: scale(${zoom}); }`,
    );
  }

  function updateHotspotRules(hotspots) {
    const hotspotCss = hotspots
      .map((spot) => {
        return `.decks-page .deck-hotspot[data-hotspot-id="${spot.id}"] { left: ${spot.x}%; top: ${spot.y}%; }`;
      })
      .join("\n");
    upsertStyleRule("deck-hotspot-rule", hotspotCss);
  }

  function renderModalPlan(deck) {
    const existingCanvas = document.getElementById("deckPlanCanvas");

    if (existingCanvas) {
      existingCanvas.classList.add("is-transitioning");
    }
    els.modalFrame.innerHTML = `<div class="deck-plan-skeleton" aria-hidden="true"></div>`;

    setTimeout(() => {
      const hotspots = deckHotspots[deck.number] || [];
      const chips = deckFocusMap[deck.number] || [];
      els.modalFocusChips.innerHTML = chips
        .map((l) => `<button class="deck-focuschip">${l}</button>`)
        .join("");
      const hotspotButtons = hotspots
        .map(
          (s, i) => `
            <button class="deck-hotspot" data-hotspot-id="${s.id}" data-title="${s.title}" data-note="${s.note}" data-highlight="${s.highlight ? "true" : "false"}">${i + 1}</button>
          `,
        )
        .join("");

      els.modalFrame.innerHTML = `
            <div class="deck-plan-stage" id="deckPlanStage">
              <div class="deck-plan-canvas is-transitioning" id="deckPlanCanvas">
                <img class="deck-plan-media" src="${deck.svg || "deck-plans/deck-12.png"}" alt="${deck.name}">
                ${hotspots.length ? `<div class="deck-plan-hotspots">${hotspotButtons}</div>` : ""}
              </div>
            </div>
            ${hotspots.length ? `<div class="deck-plan-legend">${hotspots.map((s, i) => `<button class="deck-plan-legend-item" data-hotspot-id="${s.id}"><strong>${i + 1}. ${s.title}</strong><span>${s.note}</span></button>`).join("")}</div>` : ""}
          `;
      updateHotspotRules(hotspots);
      updateZoomRule();
      attachPan();

      const newCanvas = document.getElementById("deckPlanCanvas");
      if (newCanvas) {
        requestAnimationFrame(() => {
          newCanvas.classList.remove("is-transitioning");
        });
      }
    }, 180);
  }

  function renderFocusChips(deck) {
    /* already in renderModalPlan */
  }

  function selectHotspotById(hotspotId) {
    const target = els.modalFrame.querySelector(
      `.deck-hotspot[data-hotspot-id="${hotspotId}"]`,
    );
    if (!target) return;
    els.modalFrame.querySelectorAll(".deck-hotspot").forEach((btn) => {
      btn.dataset.selected =
        btn.dataset.hotspotId === hotspotId ? "true" : "false";
    });
    els.modalFrame.querySelectorAll(".deck-plan-legend-item").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.hotspotId === hotspotId);
    });
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
    els.modalDesc.textContent =
      target.dataset.note || target.dataset.title || "";
  }

  function attachPan() {
    const stage = document.getElementById("deckPlanStage");
    if (!stage) return;
    stage.addEventListener("pointerdown", (e) => {
      if (state.currentZoom <= 100) return;
      state.dragging = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      state.dragStartLeft = stage.scrollLeft;
      state.dragStartTop = stage.scrollTop;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!state.dragging) return;
      stage.scrollLeft = state.dragStartLeft - (e.clientX - state.dragStartX);
      stage.scrollTop = state.dragStartTop - (e.clientY - state.dragStartY);
    });
    stage.addEventListener("pointerup", () => (state.dragging = false));
    stage.addEventListener("pointercancel", () => (state.dragging = false));
  }

  function setActiveDeck(num) {
    document
      .querySelectorAll(".deck-quickbtn")
      .forEach((b) =>
        b.classList.toggle("is-active", Number(b.dataset.deck) === num),
      );
    document
      .querySelectorAll(".deck-pill")
      .forEach((b) =>
        b.classList.toggle("is-active", Number(b.dataset.deck) === num),
      );
    document
      .querySelectorAll("#deckVerticalIndicator button")
      .forEach((b) =>
        b.classList.toggle("active", Number(b.dataset.deck) === num),
      );
  }

  // --- EVENT LISTENERS (luxe) ---
  function bindEvents() {
    const ui = window.CruiseUI;
    const searchInput = document.getElementById("deckSearch");
    const clearButton = document.getElementById("deckSearchClear");

    // Filter buttons
    document.querySelectorAll(".pill-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".pill-btn")
          .forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filter = btn.dataset.filter;

        renderDeckCards(btn.dataset.filter, searchInput.value.toLowerCase());
      });
    });

    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value;
      renderDeckCards(
        document.querySelector(".pill-btn.is-active").dataset.filter,
        e.target.value.toLowerCase(),
      );
    });

    // global key
    ui?.installSlashFocus(searchInput);
    ui?.attachClearButton(searchInput, clearButton, () => {
      state.search = "";
      renderDeckCards(
        document.querySelector(".pill-btn.is-active").dataset.filter,
        "",
      );
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // open card
    els.cards.addEventListener("click", (e) => {
      const card = e.target.closest(".deck-card");
      if (!card) return;
      const deck = deckData.find((d) => d.number === Number(card.dataset.deck));
      if (deck) openModal(deck);
    });

    // quick rail
    els.quickRail.addEventListener("click", (e) => {
      const btn = e.target.closest(".deck-quickbtn");
      if (btn) {
        const deck = deckData.find(
          (d) => d.number === Number(btn.dataset.deck),
        );
        if (deck) openModal(deck);
      }
    });

    // category pills
    document.addEventListener("click", (e) => {
      const pill = e.target.closest(".deck-pill");
      if (pill) {
        const deck = deckData.find(
          (d) => d.number === Number(pill.dataset.deck),
        );
        if (deck) openModal(deck);
      }
    });

    document
      .getElementById("deckVerticalIndicator")
      .addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const deck = deckData.find(
          (d) => d.number === Number(btn.dataset.deck),
        );
        if (deck) openModal(deck);
      });

    // modal actions
    els.modal.addEventListener("click", (e) => {
      const disabledDownload = e.target.closest(
        '#downloadPlan[aria-disabled="true"]',
      );
      if (disabledDownload) {
        e.preventDefault();
        return;
      }
      const hotspot = e.target.closest(".deck-hotspot");
      if (hotspot) {
        selectHotspotById(hotspot.dataset.hotspotId);
        return;
      }
      const legend = e.target.closest(".deck-plan-legend-item");
      if (legend) {
        selectHotspotById(legend.dataset.hotspotId);
        return;
      }
      const focusChip = e.target.closest(".deck-focuschip");
      if (focusChip) {
        els.modalFocusChips
          .querySelectorAll(".deck-focuschip")
          .forEach((btn) => btn.classList.remove("is-active"));
        focusChip.classList.add("is-active");
        const needle = (focusChip.textContent || "").toLowerCase();
        const match = [
          ...els.modalFrame.querySelectorAll(".deck-hotspot"),
        ].find((btn) =>
          (btn.dataset.title || "").toLowerCase().includes(needle),
        );
        if (match) {
          selectHotspotById(match.dataset.hotspotId);
        }
        return;
      }
      const trigger = e.target.closest("[data-action]");
      const act = trigger?.dataset.action;
      if (act === "close-modal") closeModal();
      if (act === "zoom-in") setZoom(state.currentZoom + 25);
      if (act === "zoom-out") setZoom(state.currentZoom - 25);
      if (act === "zoom-reset") setZoom(100);
      if (act === "prev-deck") {
        const sorted = deckData
          .filter((d) => d.number !== 0)
          .sort((a, b) => a.number - b.number);
        const idx = sorted.findIndex(
          (d) => d.number === state.currentDeck?.number,
        );
        if (idx > 0) openModal(sorted[idx - 1]);
      }
      if (act === "next-deck") {
        const sorted = deckData
          .filter((d) => d.number !== 0)
          .sort((a, b) => a.number - b.number);
        const idx = sorted.findIndex(
          (d) => d.number === state.currentDeck?.number,
        );
        if (idx < sorted.length - 1) openModal(sorted[idx + 1]);
      }
      if (act === "center-me" && state.currentDeck?.number === 6) {
        const aft = document.querySelector('[data-hotspot-id="aft-cabins"]');
        if (aft) {
          aft.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }
    });

    els.clearFilters?.addEventListener("click", () => {
      state.search = "";
      els.search.value = "";
      state.filter = "all";
      document
        .querySelectorAll(".pill-btn")
        .forEach((b) =>
          b.classList.toggle("is-active", b.dataset.filter === state.filter),
        );
      renderDeckCards();
    });

    if (els.categoryToggle && els.categoryPanels) {
      els.categoryToggle.addEventListener("click", () => {
        const expanded =
          els.categoryToggle.getAttribute("aria-expanded") === "true";
        const next = !expanded;
        els.categoryToggle.setAttribute("aria-expanded", String(next));
        els.categoryPanels.hidden = !next;
        els.categoryToggle.innerHTML = `${next ? "Hide categories" : "Show categories"} <i class="fas fa-chevron-down" aria-hidden="true"></i>`;
      });
    }
  }

  function init() {
    renderQuickRail();
    renderPills();
    renderDeckCards();
    bindEvents();

    if (window.matchMedia("(max-width: 900px)").matches) {
      setTimeout(() => {
        const btn = document.querySelector('.deck-quickbtn[data-deck="6"]');
        if (btn) btn.scrollIntoView({ inline: "center", behavior: "smooth" });
      }, 300);
    }

    if (!localStorage.getItem("embarkationSeen")) {
      const hero = document.querySelector(".deck-hero");
      if (hero) hero.classList.add("is-embark-glow");
      localStorage.setItem("embarkationSeen", "true");
    }

    // Subtle environment depth on scroll
    const updateDepth = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const d = Math.min(0.08, (y / 2000) * 0.08);
      const depthIndex = Math.min(4, Math.max(0, Math.round((d / 0.08) * 4)));
      document.body.classList.remove(
        "env-depth-0",
        "env-depth-1",
        "env-depth-2",
        "env-depth-3",
        "env-depth-4",
      );
      document.body.classList.add(`env-depth-${depthIndex}`);
    };
    updateDepth();
    window.addEventListener("scroll", updateDepth, { passive: true });
  }
  init();
})();
