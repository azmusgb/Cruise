/**
 * photos.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
const photoData = [
  {
    id: 1,
    title: "Adventure Exterior at Sea",
    src: "images/ship/rccl-adventure-of-the-seas-exterior-at-sea.webp",
    category: "decks",
    deck: "topside",
    source: "official",
    description: "Wide exterior view of Adventure of the Seas underway.",
    tags: ["ship", "exterior", "hero"],
  },
  {
    id: 2,
    title: "Pool Deck",
    src: "images/ship/rccl-adventure-of-the-seas-pool-deck.webp",
    category: "decks",
    deck: "11",
    source: "official",
    description: "Main pool deck setup with lounge seating.",
    tags: ["pool", "deck-11"],
  },
  {
    id: 3,
    title: "Family Deck Activities",
    src: "images/ship/rccl-adventure-of-the-seas-family-deck-activities.jpeg",
    category: "activities",
    deck: "12",
    source: "official",
    description: "Family-friendly activity area on upper deck.",
    tags: ["family", "deck-12"],
  },
  {
    id: 4,
    title: "Main Dining Room",
    src: "images/venues/rccl-adventure-of-the-seas-main-dining-room.webp",
    category: "dining",
    deck: "3",
    source: "official",
    description: "Formal dining room interior with multi-level seating.",
    tags: ["dining", "formal"],
  },
  {
    id: 5,
    title: "Windjammer Buffet",
    src: "images/venues/rccl-adventure-of-the-seas-windjammer-buffet.jpeg",
    category: "dining",
    deck: "11",
    source: "official",
    description: "Windjammer buffet seating and serving stations.",
    tags: ["buffet", "casual"],
  },
  {
    id: 6,
    title: "Windjammer Buffet (Alternate)",
    src: "images/venues/rccl-adventure-of-the-seas-windjammer-buffet-2.jpeg",
    category: "dining",
    deck: "11",
    source: "official",
    description: "Alternate view of Windjammer buffet seating.",
    tags: ["buffet", "alternate"],
  },
  {
    id: 7,
    title: "Johnny Rockets",
    src: "images/venues/rccl-adventure-of-the-seas-johnny-rockets.jpeg",
    category: "dining",
    deck: "12",
    source: "official",
    description: "Classic diner styling and casual bites.",
    tags: ["deck-12", "casual"],
  },
  {
    id: 8,
    title: "Specialty Dining Entree",
    src: "images/venues/rccl-adventure-of-the-seas-specialty-dining-entree.jpeg",
    category: "dining",
    deck: "",
    source: "official",
    description: "Specialty dining plated entree presentation.",
    tags: ["specialty", "entree"],
  },
  {
    id: 9,
    title: "Royal Promenade Arch",
    src: "images/venues/rccl-adventure-of-the-seas-royal-promenade-arch.jpeg",
    category: "decks",
    deck: "5",
    source: "official",
    description: "Promenade focal-point arch and social space.",
    tags: ["promenade"],
  },
  {
    id: 10,
    title: "Royal Promenade Classic Car",
    src: "images/venues/rccl-adventure-of-the-seas-royal-promenade-classic-car.webp",
    category: "decks",
    deck: "5",
    source: "official",
    description: "Classic car centerpiece on the Royal Promenade.",
    tags: ["promenade", "landmark"],
  },
  {
    id: 11,
    title: "Ice Skating Rink",
    src: "images/venues/rccl-adventure-of-the-seas-ice-skating-rink.jpeg",
    category: "activities",
    deck: "3",
    source: "official",
    description: "Studio B ice rink used for shows and open skate.",
    tags: ["shows", "ice"],
  },
  {
    id: 12,
    title: "Main Theater Stage",
    src: "images/venues/rccl-adventure-of-the-seas-main-theater-stage.webp",
    category: "activities",
    deck: "3",
    source: "official",
    description: "Main theater stage setup for production shows.",
    tags: ["theater", "shows"],
  },
  {
    id: 13,
    title: "Main Theater Stage (Alternate)",
    src: "images/venues/rccl-adventure-of-the-seas-main-theater-stage-2.webp",
    category: "activities",
    deck: "3",
    source: "official",
    description: "Alternate angle of the main theater stage.",
    tags: ["theater", "alternate"],
  },
  {
    id: 14,
    title: "Main Theater Seating",
    src: "images/venues/rccl-adventure-of-the-seas-main-theater-seating.webp",
    category: "activities",
    deck: "3",
    source: "official",
    description: "Seating layout in the ship's main theater.",
    tags: ["theater", "seating"],
  },
  {
    id: 15,
    title: "Spa Treatment",
    src: "images/venues/rccl-adventure-of-the-seas-spa-treatment.webp",
    category: "activities",
    deck: "12",
    source: "official",
    description: "Spa treatment room setup and amenities.",
    tags: ["spa", "wellness"],
  },
  {
    id: 16,
    title: "Spa Treatment (Alternate)",
    src: "images/venues/rccl-adventure-of-the-seas-spa-treatment-2.webp",
    category: "activities",
    deck: "12",
    source: "official",
    description: "Alternate spa treatment area view.",
    tags: ["spa", "alternate"],
  },
  {
    id: 17,
    title: "Ben & Jerry's",
    src: "images/venues/rccl-adventure-of-the-seas-ben-and-jerrys.webp",
    category: "dining",
    deck: "5",
    source: "official",
    description: "Ice cream counter on the Royal Promenade.",
    tags: ["ice-cream", "promenade"],
  },
  {
    id: 18,
    title: "Perfect Day at CocoCay Aerial Balloon",
    src: "images/ports/rccl-perfect-day-cococay-aerial-balloon.jpeg",
    category: "ports",
    deck: "",
    source: "official",
    description: "Aerial balloon view of Perfect Day at CocoCay.",
    tags: ["cococay", "aerial", "hero"],
  },
  {
    id: 19,
    title: "Perfect Day Thrill Tower",
    src: "images/ports/rccl-perfect-day-cococay-thrill-tower.jpeg",
    category: "ports",
    deck: "",
    source: "official",
    description: "Thrill tower close-up with slide complex.",
    tags: ["thrill", "slides"],
  },
  {
    id: 20,
    title: "Perfect Day Thrill Waterpark Aerial",
    src: "images/ports/rccl-perfect-day-cococay-thrill-waterpark-aerial.webp",
    category: "ports",
    deck: "",
    source: "official",
    description: "Aerial perspective of Thrill Waterpark at CocoCay.",
    tags: ["waterpark", "aerial"],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const PHOTO_API = "/api/photos";
  const ui = window.CruiseUI;
  const galleryGrid = document.getElementById("photoGrid");
  const galleryList = document.getElementById("photoList");
  const searchInput = document.getElementById("gallerySearch");
  const filterButtons = Array.from(
    document.querySelectorAll(".filter-btn[data-filter]"),
  );
  const viewButtons = Array.from(document.querySelectorAll(".view-btn"));
  const sortSelect = document.getElementById("sortSelect");
  const photoCount = document.getElementById("photoCount");
  const emptyState = document.getElementById("emptyState");
  const resetButton = document.getElementById("resetFilters");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const activeFilterPill = document.getElementById("activeFilterPill");
  const featuredRail = document.getElementById("featuredRail");
  const featuredStrip = featuredRail.closest(".featured-strip");
  const heroTotal = document.getElementById("heroTotal");
  const heroCats = document.getElementById("heroCats");
  const heroOfficial = document.getElementById("heroOfficial");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxDescription = document.getElementById("lightboxDescription");
  const lightboxCounter = document.getElementById("lightboxCounter");
  const lightboxCounterText = document.getElementById("lightboxCounterText");
  const openOriginal = document.getElementById("openOriginal");
  const downloadImage = document.getElementById("downloadImage");
  const prevButton = document.getElementById("prevPhoto");
  const nextButton = document.getElementById("nextPhoto");
  const closeButton = document.getElementById("closeLightbox");

  const requiredElements = [
    galleryGrid,
    galleryList,
    searchInput,
    sortSelect,
    photoCount,
    emptyState,
    resetButton,
    clearSearchBtn,
    activeFilterPill,
    featuredRail,
    featuredStrip,
    heroTotal,
    heroCats,
    heroOfficial,
    lightbox,
    lightboxImage,
    lightboxTitle,
    lightboxDescription,
    lightboxCounter,
    lightboxCounterText,
    openOriginal,
    downloadImage,
    prevButton,
    nextButton,
    closeButton,
  ];

  if (requiredElements.some((element) => !element)) {
    console.error(
      "Photo library initialization aborted: missing required DOM element.",
    );
    return;
  }

  let currentFilter = "all";
  let currentView = "grid";
  let currentSearch = "";
  let currentSort = "name";
  let currentIndex = 0;
  let filteredPhotos = [];

  function canonicalDeck(deck) {
    const value = String(deck || "").trim();
    if (!value) return "";
    if (/^\d+$/.test(value)) return value;
    return "topside";
  }

  function deckLabel(deck) {
    const value = canonicalDeck(deck);
    if (!value) return "";
    if (/^\d+$/.test(value)) return `Deck ${value}`;
    return "Topside";
  }

  function deckSortKey(deck) {
    const value = canonicalDeck(deck);
    if (!value || value === "topside") return 999;
    return Number(value);
  }

  function normalizeCategory(category) {
    const value = String(category || "").toLowerCase();
    return value || "decks";
  }

  function normalizeSource(source) {
    return String(source || "official").toLowerCase() === "user"
      ? "user"
      : "official";
  }

  function normalizePhotoRecord(photo, idx) {
    const src = String(photo.src || "").trim();
    if (
      !src ||
      (!src.startsWith("images/") &&
        !src.startsWith("/images/") &&
        !src.startsWith("/uploads/") &&
        !src.startsWith("uploads/"))
    ) {
      return null;
    }

    return {
      id: String(photo.id || idx + 1),
      title: String(photo.title || "Untitled photo"),
      src,
      category: normalizeCategory(photo.category),
      deck: canonicalDeck(photo.deck),
      source: normalizeSource(photo.source),
      description: String(photo.description || ""),
      tags: Array.isArray(photo.tags) ? photo.tags : [],
    };
  }

  let normalizedPhotos = photoData
    .map((photo, idx) => normalizePhotoRecord(photo, idx))
    .filter(Boolean);

  const uploadForm = document.getElementById("photoUploadForm");
  const uploadSubmit = document.getElementById("photoUploadSubmit");
  const uploadStatus = document.getElementById("photoUploadStatus");
  const uploadProgress = document.getElementById("photoUploadProgress");
  const uploadProgressBar = document.getElementById("photoUploadProgressBar");
  const uploadDropZone = document.getElementById("photoUploadDropZone");
  const uploadFileInput = document.getElementById("photoUploadFile");
  const uploadPreview = document.getElementById("photoUploadPreview");
  const uploadPreviewImage = document.getElementById("photoUploadPreviewImage");
  const uploadPreviewMeta = document.getElementById("photoUploadPreviewMeta");
  const uploadClear = document.getElementById("photoUploadClear");

  const MAX_UPLOAD_SIZE_MB = 12;
  const LOCAL_UPLOAD_STORAGE_KEY = "cruisePhotoLocalUploads.v1";
  let uploadApiAvailable = false;

  function updateHeroStats() {
    const categories = new Set(normalizedPhotos.map((photo) => photo.category));
    heroTotal.textContent = String(normalizedPhotos.length);
    heroCats.textContent = String(categories.size);
    heroOfficial.textContent = String(
      normalizedPhotos.filter((photo) => photo.source === "official").length,
    );
  }

  function prettyFilterLabel(filter) {
    if (filter === "all") return "All";
    if (filter === "official") return "Official";
    if (filter === "heroes") return "Hero Angles";
    return filter.charAt(0).toUpperCase() + filter.slice(1);
  }

  function matchesFilter(photo) {
    if (currentFilter === "all") return true;
    if (currentFilter === "official") return photo.source === "official";
    if (currentFilter === "user") return photo.source === "user";
    if (currentFilter === "heroes") return photo.tags.includes("hero");
    return photo.category === currentFilter;
  }

  function matchesSearch(photo, term) {
    if (!term) return true;
    const haystack = [
      photo.title,
      photo.description,
      photo.category,
      deckLabel(photo.deck),
      ...photo.tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  }

  function sortPhotos(photos) {
    photos.sort((a, b) => {
      if (currentSort === "category") {
        return (
          a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
        );
      }
      if (currentSort === "deck") {
        return (
          deckSortKey(a.deck) - deckSortKey(b.deck) ||
          a.title.localeCompare(b.title)
        );
      }
      return a.title.localeCompare(b.title);
    });
    return photos;
  }

  function applyFilters() {
    const term = currentSearch.trim().toLowerCase();
    filteredPhotos = sortPhotos(
      normalizedPhotos
        .filter((photo) => matchesFilter(photo))
        .filter((photo) => matchesSearch(photo, term)),
    );
  }

  function renderMeta(photo) {
    const deck = deckLabel(photo.deck)
      ? `<span class="meta-tag"><i class="fas fa-layer-group"></i> ${deckLabel(photo.deck)}</span>`
      : "";
    return `
            <span class="meta-tag"><i class="fas fa-folder"></i> ${photo.category}</span>
            ${deck}
            <span class="meta-tag"><i class="fas ${photo.source === "user" ? "fa-user" : "fa-crown"}"></i> ${photo.source}</span>
          `;
  }

  function injectShimmer(img) {
    img.classList.add("img-shimmer");
    const done = () => img.classList.remove("img-shimmer");
    if (img.complete) done();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
  }

  function buildFeatured() {
    if (!filteredPhotos.length) {
      featuredRail.innerHTML = "";
      featuredStrip.hidden = true;
      return;
    }
    featuredStrip.hidden = false;

    const heroish = filteredPhotos.filter(
      (photo) =>
        photo.tags.includes("hero") ||
        photo.category === "ports" ||
        photo.category === "decks",
    );
    const pool = heroish.length ? heroish : filteredPhotos;
    const picks = pool.slice(0, 6);

    featuredRail.innerHTML = picks
      .map((photo) => {
        const chips = `<span class="mini-chip"><i class="fas fa-folder"></i> ${photo.category}</span>`;
        const featuredTitle =
          photo.title.length > 34
            ? `${photo.title.slice(0, 34).trim()}...`
            : photo.title;
        return `
              <article class="featured-card" role="listitem" tabindex="0" data-photo-id="${photo.id}">
                <img class="featured-card__img" src="${photo.src}" alt="${photo.title}" loading="lazy" decoding="async" />
                <div class="featured-card__overlay" aria-hidden="true"></div>
                <div class="featured-card__meta">
                  <p class="featured-card__name">${featuredTitle}</p>
                  <div class="featured-card__chips">${chips}</div>
                </div>
              </article>
            `;
      })
      .join("");
    featuredRail.querySelectorAll("img").forEach(injectShimmer);
  }

  function renderCards() {
    if (!filteredPhotos.length) {
      galleryGrid.innerHTML = "";
      galleryList.innerHTML = "";
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    galleryGrid.innerHTML = filteredPhotos
      .map(
        (photo, idx) => `
            <article class="photo-card" role="listitem" tabindex="0" data-index="${idx}" data-id="${photo.id}" data-category="${photo.category}">
              <span class="source-badge"><i class="fas ${photo.source === "user" ? "fa-user" : "fa-crown"}"></i> ${photo.source}</span>
              <img class="photo-card__image" src="${photo.src}" alt="${photo.title}" loading="lazy" decoding="async" />
              <div class="photo-card__content">
                <h3 class="photo-card__title">${photo.title}</h3>
                <div class="photo-card__meta">${renderMeta(photo)}</div>
                <p class="photo-card__description">${photo.description}</p>
              </div>
            </article>
          `,
      )
      .join("");

    galleryList.innerHTML = filteredPhotos
      .map(
        (photo, idx) => `
            <article class="list-item" role="listitem" tabindex="0" data-index="${idx}" data-id="${photo.id}" data-category="${photo.category}">
              <span class="source-badge"><i class="fas ${photo.source === "user" ? "fa-user" : "fa-crown"}"></i> ${photo.source}</span>
              <img class="list-item__image" src="${photo.src}" alt="${photo.title}" loading="lazy" decoding="async" />
              <div class="list-item__content">
                <h3 class="photo-card__title">${photo.title}</h3>
                <div class="photo-card__meta">${renderMeta(photo)}</div>
                <p class="photo-card__description">${photo.description}</p>
              </div>
            </article>
          `,
      )
      .join("");

    document
      .querySelectorAll("#photoGrid img, #photoList img")
      .forEach(injectShimmer);
  }

  function render() {
    applyFilters();
    buildFeatured();
    renderCards();
    photoCount.textContent = String(filteredPhotos.length);
    activeFilterPill.innerHTML = `<i class="fas fa-filter" aria-hidden="true"></i> ${prettyFilterLabel(currentFilter)}`;
  }

  function syncToggleStates() {
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === currentFilter;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    viewButtons.forEach((button) => {
      const isActive = button.dataset.view === currentView;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function openLightbox(index) {
    if (!filteredPhotos.length) return;
    currentIndex = index;
    const photo = filteredPhotos[currentIndex];
    if (!photo) return;

    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.title;
    lightboxTitle.textContent = photo.title;
    lightboxDescription.textContent = photo.description;
    lightboxCounterText.textContent = `${currentIndex + 1} of ${filteredPhotos.length}`;
    openOriginal.href = photo.src;
    downloadImage.href = photo.src;
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    lightbox.classList.add("active");
    document.body.classList.add("photos-lightbox-open");
    lightbox.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.classList.remove("active");
    document.body.classList.remove("photos-lightbox-open");
  }

  function moveLightbox(step) {
    if (!filteredPhotos.length) return;
    currentIndex =
      (currentIndex + step + filteredPhotos.length) % filteredPhotos.length;
    openLightbox(currentIndex);
  }

  function activateCard(event) {
    const card = event.target.closest("[data-index]");
    if (!card) return;
    openLightbox(Number(card.dataset.index));
  }

  featuredRail.addEventListener("click", (event) => {
    const card = event.target.closest("[data-photo-id]");
    if (!card) return;
    const id = String(card.dataset.photoId || "");
    const index = filteredPhotos.findIndex((photo) => String(photo.id) === id);
    if (index < 0) return;
    openLightbox(index);
  });

  featuredRail.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-photo-id]");
    if (!card) return;
    event.preventDefault();
    const id = String(card.dataset.photoId || "");
    const index = filteredPhotos.findIndex((photo) => String(photo.id) === id);
    if (index < 0) return;
    openLightbox(index);
  });

  [galleryGrid, galleryList].forEach((container) => {
    container.addEventListener("click", activateCard);
    container.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activateCard(event);
    });
  });

  let touchStartX = 0;
  let touchStartY = 0;
  lightbox.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true },
  );

  lightbox.addEventListener("touchend", (event) => {
    if (lightbox.hidden) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if (Math.abs(dx) < 90 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    moveLightbox(dx > 0 ? -1 : 1);
  });

  searchInput.addEventListener("input", (event) => {
    currentSearch = event.target.value;
    render();
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = String(button.dataset.filter || "all");
      filterButtons.forEach((entry) => {
        const sameFilter = entry.dataset.filter === currentFilter;
        entry.classList.toggle("active", sameFilter);
        entry.setAttribute("aria-pressed", sameFilter ? "true" : "false");
      });
      render();
    });
  });

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentView = button.dataset.view;
      document.body.classList.toggle(
        "gallery-grid-view",
        currentView === "grid",
      );
      document.body.classList.toggle(
        "gallery-list-view",
        currentView === "list",
      );
      viewButtons.forEach((entry) => {
        const isActive = entry === button;
        entry.classList.toggle("active", isActive);
        entry.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    });
  });

  sortSelect.addEventListener("change", (event) => {
    currentSort = String(event.target.value || "name");
    render();
  });

  resetButton.addEventListener("click", () => {
    currentFilter = "all";
    currentSearch = "";
    currentSort = "name";
    searchInput.value = "";
    sortSelect.value = "name";
    filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === "all";
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    render();
  });

  ui?.installSlashFocus(searchInput);
  ui?.attachClearButton(searchInput, clearSearchBtn, () => {
    currentSearch = "";
    render();
  });
  ui?.wireModalModel({
    modal: lightbox,
    closeSelectors: ["#closeLightbox"],
    isOpenClass: "active",
  });

  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", () => moveLightbox(-1));
  nextButton.addEventListener("click", () => moveLightbox(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox(-1);
    if (event.key === "ArrowRight") moveLightbox(1);
  });

  function setUploadStatus(message, state = "info") {
    if (!uploadStatus) return;
    uploadStatus.textContent = message;
    uploadStatus.dataset.state = state;
  }

  function setUploadProgress(percent) {
    if (!uploadProgress || !uploadProgressBar) return;
    const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
    uploadProgress.hidden = clamped <= 0 || clamped >= 100;
    uploadProgressBar.style.width = `${clamped}%`;
    uploadProgressBar.setAttribute(
      "aria-valuenow",
      String(Math.round(clamped)),
    );
  }

  function readLocalUploads() {
    try {
      const raw = window.localStorage.getItem(LOCAL_UPLOAD_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function writeLocalUploads(records) {
    try {
      window.localStorage.setItem(
        LOCAL_UPLOAD_STORAGE_KEY,
        JSON.stringify(records.slice(0, 40)),
      );
    } catch (_error) {
      // No-op if storage quota is reached.
    }
  }

  function showPreviewFromFile(file) {
    if (!uploadPreview || !uploadPreviewImage || !uploadPreviewMeta) return;
    if (!file) {
      uploadPreview.hidden = true;
      uploadPreviewImage.removeAttribute("src");
      uploadPreviewMeta.textContent = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    uploadPreview.hidden = false;
    uploadPreviewImage.src = objectUrl;
    uploadPreviewImage.alt = file.name || "Photo preview";
    const kb = Math.max(1, Math.round(file.size / 1024));
    uploadPreviewMeta.textContent = `${file.name} · ${kb} KB`;
    uploadPreviewImage.addEventListener(
      "load",
      () => {
        URL.revokeObjectURL(objectUrl);
      },
      { once: true },
    );
  }

  function validateUploadFile(file) {
    if (!file) return "Select a photo file first.";
    if (!String(file.type || "").startsWith("image/")) {
      return "Please choose an image file (jpg, png, webp, heic).";
    }
    if (file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      return `Image is too large. Max size is ${MAX_UPLOAD_SIZE_MB} MB.`;
    }
    return "";
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () =>
        reject(new Error("Failed to read selected image."));
      reader.readAsDataURL(file);
    });
  }

  function normalizeUploadedCategory(value) {
    const normalized = normalizeCategory(value);
    return normalized === "heroes" ? "decks" : normalized;
  }

  async function saveUploadLocally(formData, file) {
    const tags = String(formData.get("tags") || "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 12);
    const categoryInput = String(formData.get("category") || "").toLowerCase();
    if (categoryInput === "heroes") tags.push("hero");

    const photo = {
      id: `local-${Date.now()}`,
      title:
        String(formData.get("title") || "Guest photo").trim() || "Guest photo",
      src: await fileToDataUrl(file),
      category: normalizeUploadedCategory(categoryInput),
      deck: String(formData.get("deck") || "").trim(),
      source: "user",
      description:
        String(formData.get("description") || "").trim() || "Uploaded photo.",
      tags: tags.length ? tags : ["uploaded"],
      uploadedAt: new Date().toISOString(),
    };

    const records = readLocalUploads();
    records.unshift(photo);
    writeLocalUploads(records);
    return photo;
  }

  async function detectUploadApi() {
    try {
      const response = await fetch(`${PHOTO_API}`, { method: "GET" });
      uploadApiAvailable = response.ok;
    } catch (_error) {
      uploadApiAvailable = false;
    }

    if (uploadApiAvailable) {
      setUploadStatus(
        "Connected to upload API. New photos will be posted to the server.",
        "success",
      );
      return;
    }

    setUploadStatus(
      "Server upload API unavailable. Local upload mode is active for this device.",
      "warning",
    );
  }

  async function loadServerPhotos() {
    try {
      const response = await fetch(`${PHOTO_API}`);
      if (!response.ok) return;
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.photos)) return;
      const incoming = payload.photos
        .map((photo, idx) => normalizePhotoRecord(photo, idx))
        .filter(Boolean);
      if (!incoming.length) return;

      const seen = new Set(normalizedPhotos.map((photo) => photo.src));
      incoming.forEach((photo) => {
        if (seen.has(photo.src)) return;
        seen.add(photo.src);
        normalizedPhotos.unshift(photo);
      });
    } catch (_error) {
      // API not available on static hosts; keep local catalog only.
    }
  }

  function mergeLocalPhotos() {
    const incoming = readLocalUploads()
      .map((photo, idx) => normalizePhotoRecord(photo, idx))
      .filter(Boolean);
    if (!incoming.length) return;

    const seen = new Set(normalizedPhotos.map((photo) => photo.src));
    incoming.forEach((photo) => {
      if (seen.has(photo.src)) return;
      seen.add(photo.src);
      normalizedPhotos.unshift(photo);
    });
  }

  async function uploadViaApi(formData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${PHOTO_API}/upload`);
      xhr.responseType = "json";
      xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;
        const percent = (event.loaded / event.total) * 100;
        setUploadProgress(percent);
      });
      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed due to network error."));
      });
      xhr.addEventListener("load", () => {
        const payload = xhr.response || {};
        if (
          xhr.status < 200 ||
          xhr.status >= 300 ||
          !payload?.ok ||
          !payload?.photo
        ) {
          reject(
            new Error(payload?.message || "Upload failed. Please try again."),
          );
          return;
        }
        resolve(payload.photo);
      });
      xhr.send(formData);
    });
  }

  if (uploadForm) {
    uploadFileInput?.addEventListener("change", () => {
      const file = uploadFileInput.files?.[0];
      const validationError = validateUploadFile(file);
      if (validationError) {
        setUploadStatus(validationError, "error");
        showPreviewFromFile(null);
        return;
      }
      showPreviewFromFile(file);
      setUploadStatus(
        uploadApiAvailable
          ? "Ready to upload."
          : "Ready to save locally on this device.",
        "info",
      );
    });

    uploadDropZone?.addEventListener("dragover", (event) => {
      event.preventDefault();
      uploadDropZone.classList.add("is-dragover");
    });

    uploadDropZone?.addEventListener("dragleave", () => {
      uploadDropZone.classList.remove("is-dragover");
    });

    uploadDropZone?.addEventListener("drop", (event) => {
      event.preventDefault();
      uploadDropZone.classList.remove("is-dragover");
      const file = event.dataTransfer?.files?.[0];
      if (!file || !uploadFileInput) return;
      const transfer = new DataTransfer();
      transfer.items.add(file);
      uploadFileInput.files = transfer.files;
      uploadFileInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    uploadClear?.addEventListener("click", () => {
      uploadForm.reset();
      showPreviewFromFile(null);
      setUploadProgress(0);
      setUploadStatus("Upload form cleared.", "info");
    });

    uploadForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(uploadForm);
      const file = uploadFileInput?.files?.[0];
      const validationError = validateUploadFile(file);
      if (validationError) {
        setUploadStatus(validationError, "error");
        return;
      }

      try {
        if (uploadSubmit) uploadSubmit.disabled = true;
        setUploadProgress(1);
        setUploadStatus(
          uploadApiAvailable
            ? "Uploading photo to server..."
            : "Saving photo in local gallery...",
          "info",
        );

        const uploadedPhoto = uploadApiAvailable
          ? await uploadViaApi(formData)
          : await saveUploadLocally(formData, file);
        setUploadProgress(100);

        const normalized = normalizePhotoRecord(uploadedPhoto, Date.now());
        if (normalized) {
          normalizedPhotos.unshift(normalized);
          updateHeroStats();
          render();
        }
        uploadForm.reset();
        showPreviewFromFile(null);
        setTimeout(() => setUploadProgress(0), 500);
        setUploadStatus(
          uploadApiAvailable
            ? "Upload complete. Photo posted to server and added to the shared gallery."
            : "Saved locally. Photo added to this device's gallery.",
          "success",
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.";
        setUploadStatus(message, "error");
        setUploadProgress(0);
      } finally {
        if (uploadSubmit) uploadSubmit.disabled = false;
      }
    });
  }

  (async () => {
    await detectUploadApi();
    await loadServerPhotos();
    mergeLocalPhotos();
    updateHeroStats();
    sortSelect.value = "name";
    syncToggleStates();
    render();
  })();
});
