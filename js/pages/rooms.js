/**
 * rooms.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("roomSearchInput");
  const searchClearButton = document.getElementById("roomSearchClear");
  const guestFinderInput = document.getElementById("guestFinderInput");
  const guestFinderList = document.getElementById("guestFinderList");
  const guestFinderQuick = document.getElementById("guestFinderQuick");
  const guestFinderStatus = document.getElementById("guestFinderStatus");
  const guestFinderFavorite = document.getElementById("guestFinderFavorite");
  const guestFinderFavorites = document.getElementById("guestFinderFavorites");
  const guestFinderClear = document.getElementById("guestFinderClear");
  const roomCards = Array.from(
    document.querySelectorAll("#roomsGridSource .room-card"),
  );
  const focusGrid = document.getElementById("focusGrid");
  const allSetGrid = document.getElementById("allSetGrid");
  const todayFocusSection = document.getElementById("todayFocusSection");
  const allSetSection = document.getElementById("allSetSection");
  const searchSummary = document.getElementById("searchSummary");
  const noSearchResults = document.getElementById("noSearchResults");
  const roomsCountValue = document.querySelector(".rooms-count__number");
  const roomsCount = document.querySelector(".rooms-count");
  const filterToggle = document.getElementById("filterToggle");
  const filterPanel = document.getElementById("filterPanel");
  const mobileStatsToggle = document.getElementById("mobileStatsToggle");
  const statsGridWrap = document.getElementById("statsGridWrap");
  const roomModal = document.getElementById("roomModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalBody = document.getElementById("modalBody");
  const comparisonRail = document.getElementById("roomComparisonRail");
  const compareCount = document.getElementById("compareCount");
  const comparisonGrid = document.getElementById("comparisonGrid");
  const clearComparisonBtn = document.getElementById("clearComparisonBtn");
  const keyboardHint = document.getElementById("keyboardHint");
  const totalRooms = roomCards.length;

  let activeType = "all";
  let currentVisibleCards = [];
  let keyboardRoomIndex = 0;
  let currentModalRoomIndex = -1;
  const compareSet = new Set();
  const guestToCards = new Map();
  const GUEST_FAVORITES_KEY = "rooms-favorite-guests-v1";
  let favoriteGuests = [];

  function computeRoomPriority(card) {
    const musterComplete = card.dataset.musterComplete === "true";
    const explicitPriority = card.dataset.roomPriority || "";
    if (!musterComplete || explicitPriority === "urgent") return 3;
    if (card.dataset.linkedRoom || explicitPriority === "attention") return 2;
    return 1;
  }

  function clearPersonHighlights() {
    roomCards.forEach((card) =>
      card.classList.remove("room-card--person-match"),
    );
  }

  function setGuestFinderStatus(message) {
    if (guestFinderStatus) {
      guestFinderStatus.textContent = message;
    }
  }

  function normalizeGuestName(name) {
    return String(name || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function toDisplayGuestName(name) {
    return String(name || "")
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function readFavoriteGuests() {
    try {
      const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.map(normalizeGuestName).filter(Boolean)
        : [];
    } catch (_error) {
      return [];
    }
  }

  function writeFavoriteGuests(names) {
    localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(names));
  }

  function renderFavoriteGuests() {
    if (!guestFinderFavorites) return;
    if (!favoriteGuests.length) {
      guestFinderFavorites.innerHTML = "";
      return;
    }

    guestFinderFavorites.innerHTML = favoriteGuests
      .map(
        (name) =>
          `<button type="button" class="family-finder__quick-btn family-finder__quick-btn--favorite" data-favorite-name="${toDisplayGuestName(name)}">★ ${toDisplayGuestName(name)}</button>`,
      )
      .join("");

    guestFinderFavorites
      .querySelectorAll("[data-favorite-name]")
      .forEach((button) => {
        button.addEventListener("click", function () {
          const name = this.getAttribute("data-favorite-name") || "";
          guestFinderInput.value = name;
          runGuestLookup(name);
        });
      });
  }

  function collectGuestsFromCard(card) {
    return Array.from(card.querySelectorAll(".guest-pill"))
      .map((pill) => (pill.textContent || "").trim())
      .filter(Boolean);
  }

  function indexGuests() {
    roomCards.forEach((card) => {
      collectGuestsFromCard(card).forEach((name) => {
        const key = name.toLowerCase();
        const cards = guestToCards.get(key) || [];
        cards.push(card);
        guestToCards.set(key, cards);
      });
    });
  }

  function setRoomTypeFilterAll() {
    activeType = "all";
    document.querySelectorAll(".room-type-filter").forEach((button) => {
      const isAll = (button.dataset.roomType || "") === "all";
      button.classList.toggle("is-active", isAll);
      button.setAttribute("aria-checked", String(isAll));
    });
    filterToggle?.classList.remove("filter-btn--active");
    closeFilterPanel();
  }

  function runGuestLookup(rawValue, options = {}) {
    const value = String(rawValue || "").trim();
    if (!value) {
      clearPersonHighlights();
      setGuestFinderStatus("");
      if (options.clearSearch) {
        searchInput.value = "";
        updateRoomVisibility();
      }
      return;
    }

    setRoomTypeFilterAll();
    searchInput.value = value;
    updateRoomVisibility();

    const normalized = value.toLowerCase();
    const matches = guestToCards.get(normalized) || [];
    const visibleMatches = matches.filter((card) =>
      currentVisibleCards.includes(card),
    );
    const targetCard = visibleMatches[0];

    clearPersonHighlights();
    if (!targetCard) {
      setGuestFinderStatus(`No room match found for "${value}".`);
      return;
    }

    targetCard.classList.add("room-card--person-match");
    targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
    targetCard.setAttribute("tabindex", "-1");
    targetCard.focus({ preventScroll: true });
    const roomNumber = targetCard.dataset.room || "";
    setGuestFinderStatus(`${value} is in room ${roomNumber}.`);
  }

  function initGuestFinder() {
    if (!guestFinderInput || !guestFinderList) return;

    const allGuestNames = Array.from(guestToCards.keys())
      .map((key) => toDisplayGuestName(key))
      .sort((a, b) => a.localeCompare(b));

    guestFinderList.innerHTML = allGuestNames
      .map((name) => `<option value="${name}"></option>`)
      .join("");

    if (guestFinderQuick) {
      guestFinderQuick.innerHTML = allGuestNames
        .slice(0, 8)
        .map(
          (name) =>
            `<button type="button" class="family-finder__quick-btn" data-guest-name="${name}">${name}</button>`,
        )
        .join("");
      guestFinderQuick
        .querySelectorAll("[data-guest-name]")
        .forEach((button) => {
          button.addEventListener("click", function () {
            const name = this.getAttribute("data-guest-name") || "";
            guestFinderInput.value = name;
            runGuestLookup(name);
          });
        });
    }

    guestFinderInput.addEventListener("change", function () {
      runGuestLookup(this.value);
    });

    guestFinderInput.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      runGuestLookup(this.value);
    });

    guestFinderClear?.addEventListener("click", function () {
      guestFinderInput.value = "";
      runGuestLookup("", { clearSearch: true });
      guestFinderInput.focus();
    });

    favoriteGuests = readFavoriteGuests().filter((name) =>
      guestToCards.has(name),
    );
    writeFavoriteGuests(favoriteGuests);
    renderFavoriteGuests();

    guestFinderFavorite?.addEventListener("click", function () {
      const normalized = normalizeGuestName(guestFinderInput.value);
      if (!normalized) {
        setGuestFinderStatus("Enter a guest name before saving a favorite.");
        return;
      }
      if (!guestToCards.has(normalized)) {
        setGuestFinderStatus(
          `"${guestFinderInput.value.trim()}" is not in the guest list.`,
        );
        return;
      }
      if (!favoriteGuests.includes(normalized)) {
        favoriteGuests.unshift(normalized);
        favoriteGuests = favoriteGuests.slice(0, 8);
        writeFavoriteGuests(favoriteGuests);
        renderFavoriteGuests();
      }
      setGuestFinderStatus(
        `${toDisplayGuestName(normalized)} saved to favorites.`,
      );
    });
  }

  function getRoomFacts(card) {
    const roomNumber = card.dataset.room || "";
    const roomType = card.dataset.roomType || "stateroom";
    const location =
      card.querySelector(".room-location")?.textContent?.trim() ||
      "Unknown location";
    const guestCount = card.querySelectorAll(".guest-pill").length;
    const muster =
      Array.from(card.querySelectorAll(".feature-tag"))
        .map((t) => t.textContent.trim())
        .find((text) => /muster/i.test(text)) || "Not listed";
    return { roomNumber, roomType, location, guestCount, muster };
  }

  function renderStatusBadges(card) {
    const header = card.querySelector(".room-card__header");
    if (!header) return;

    // Remove any previous status UI
    const existingBar = card.querySelector(".room-card__status-bar");
    if (existingBar) existingBar.remove();
    const existingLine = card.querySelector(".room-card__status-line");
    if (existingLine) existingLine.remove();

    const musterComplete = card.dataset.musterComplete === "true";
    const linked = card.dataset.linkedRoom;
    const note = card.dataset.roomNote;

    const parts = [];
    parts.push(
      `<i class="fas ${musterComplete ? "fa-check-circle" : "fa-life-ring"}" aria-hidden="true"></i> ${musterComplete ? "Muster complete" : "Muster not completed"}`,
    );
    if (linked) parts.push(`Linked to ${linked}`);
    if (note) parts.push(note);

    const line = document.createElement("p");
    line.className = "room-card__status-line";
    line.innerHTML = parts.join(" • ");
    header.insertAdjacentElement("beforebegin", line);
  }

  function ensureCompareButton(card) {
    const actions = card.querySelector(".room-card__actions");
    if (!actions || actions.querySelector(".compare-toggle-btn")) return;
    const roomNumber = card.dataset.room || "";
    const compareBtn = document.createElement("button");
    compareBtn.type = "button";
    compareBtn.className = "compare-toggle-btn";
    compareBtn.dataset.compareRoom = roomNumber;
    compareBtn.innerHTML =
      '<i class="fas fa-columns" aria-hidden="true"></i><span>Compare room</span>';
    actions.appendChild(compareBtn);
  }

  function renderComparisonRail() {
    const selected = roomCards.filter((card) =>
      compareSet.has(card.dataset.room),
    );
    compareCount.textContent = String(selected.length);

    if (!selected.length) {
      comparisonRail.hidden = true;
      comparisonGrid.innerHTML = "";
      return;
    }

    comparisonGrid.innerHTML = selected
      .map((card) => {
        const facts = getRoomFacts(card);
        return `
                        <div class="comparison-column">
                            <h4>${facts.roomNumber} · ${facts.roomType.replace("-", " ")}</h4>
                            <ul class="comparison-list">
                                <li><span>Guests:</span> ${facts.guestCount}</li>
                                <li><span>Location:</span> ${facts.location}</li>
                                <li><span>Muster:</span> ${facts.muster}</li>
                            </ul>
                        </div>
                    `;
      })
      .join("");

    comparisonRail.hidden = false;
  }

  roomCards.forEach((card) => {
    renderStatusBadges(card);
    ensureCompareButton(card);
  });
  indexGuests();
  initGuestFinder();

  function updateRoomVisibility() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;
    const visibleCards = [];

    roomCards.forEach((card) => {
      const roomNumber = card.dataset.room || "";
      const roomName =
        card.querySelector(".room-type__name")?.textContent || "";
      const roomLocation =
        card.querySelector(".room-location")?.textContent || "";
      const roomFeatures =
        card.querySelector(".room-features")?.textContent || "";
      const roomGuests = collectGuestsFromCard(card).join(" ");
      const roomType = card.dataset.roomType || "all";
      const searchableText =
        `${roomNumber} ${roomName} ${roomLocation} ${roomFeatures} ${roomGuests}`.toLowerCase();

      const matchesSearch = !searchTerm || searchableText.includes(searchTerm);
      const matchesType = activeType === "all" || roomType === activeType;
      const shouldShow = matchesSearch && matchesType;

      if (shouldShow) {
        visibleCount += 1;
        visibleCards.push(card);
      }
    });

    visibleCards.sort(
      (a, b) => computeRoomPriority(b) - computeRoomPriority(a),
    );
    currentVisibleCards = visibleCards;
    keyboardRoomIndex = Math.min(
      keyboardRoomIndex,
      Math.max(visibleCards.length - 1, 0),
    );

    if (focusGrid) focusGrid.innerHTML = "";
    if (allSetGrid) allSetGrid.innerHTML = "";

    visibleCards.forEach((card) => {
      card.hidden = false;
      const priority = computeRoomPriority(card);
      const compareBtn = card.querySelector(".compare-toggle-btn");
      const isCompared = compareSet.has(card.dataset.room);
      compareBtn?.classList.toggle("is-active", isCompared);
      if (compareBtn) {
        compareBtn.querySelector("span").textContent = isCompared
          ? "Selected for compare"
          : "Compare room";
      }
      if (priority >= 2 && focusGrid) {
        focusGrid.appendChild(card);
      } else if (allSetGrid) {
        allSetGrid.appendChild(card);
      }
    });

    if (todayFocusSection) {
      todayFocusSection.hidden = !focusGrid || focusGrid.children.length === 0;
    }
    if (allSetSection) {
      allSetSection.hidden = !allSetGrid || allSetGrid.children.length === 0;
    }

    if (searchSummary) {
      searchSummary.hidden = true;
      searchSummary.textContent = "";
    }
    if (roomsCount) {
      roomsCount.hidden = true;
    }

    noSearchResults.hidden = visibleCount !== 0;
    renderComparisonRail();
  }

  function closeFilterPanel() {
    if (!filterPanel) return;
    filterPanel.classList.remove("is-open");
    filterToggle.setAttribute("aria-expanded", "false");
  }

  document.addEventListener("rccl:filter-change", function (event) {
    if (!event.detail || event.detail.group !== "roomType") return;
    activeType = event.detail.value || "all";
    filterToggle.classList.toggle("filter-btn--active", activeType !== "all");
    closeFilterPanel();
    clearPersonHighlights();
    updateRoomVisibility();
  });

  searchInput.addEventListener("input", function () {
    clearPersonHighlights();
    setGuestFinderStatus("");
    updateRoomVisibility();
  });

  window.CruiseUI?.attachClearButton(searchInput, searchClearButton, () => {
    clearPersonHighlights();
    setGuestFinderStatus("");
    updateRoomVisibility();
  });

  function focusedRoomCard() {
    return currentVisibleCards[keyboardRoomIndex] || null;
  }

  function focusRoomAt(index) {
    if (!currentVisibleCards.length) return;
    keyboardRoomIndex =
      (index + currentVisibleCards.length) % currentVisibleCards.length;
    const card = focusedRoomCard();
    card?.setAttribute("tabindex", "-1");
    card?.focus({ preventScroll: false });
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function showKeyboardHintTemporarily() {
    if (!keyboardHint) return;
    keyboardHint.hidden = false;
    window.clearTimeout(showKeyboardHintTemporarily._timer);
    showKeyboardHintTemporarily._timer = window.setTimeout(() => {
      keyboardHint.hidden = true;
    }, 3800);
  }

  function focusedRoomAction(type) {
    const card = focusedRoomCard();
    if (!card) return;
    if (type === "details") {
      card.querySelector("[data-room-details]")?.click();
      return;
    }
    if (type === "deck") {
      const deckLink = card.querySelector(".view-deck-btn");
      if (deckLink) window.location.href = deckLink.href;
    }
  }

  // Keyboard power mode
  document.addEventListener("keydown", function (e) {
    const target = e.target;
    const typingContext =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);

    if (e.key === "/" && !typingContext && e.target !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      return;
    }

    if (e.key === "?") {
      e.preventDefault();
      showKeyboardHintTemporarily();
      return;
    }

    if (typingContext) return;

    if (e.key === "Escape") {
      closeRoomModal();
      if (compareSet.size) {
        compareSet.clear();
        roomCards.forEach((card) => {
          const compareBtn = card.querySelector(".compare-toggle-btn");
          compareBtn?.classList.remove("is-active");
          if (compareBtn)
            compareBtn.querySelector("span").textContent = "Compare room";
        });
        renderComparisonRail();
      }
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === "j") {
      e.preventDefault();
      focusRoomAt(keyboardRoomIndex + 1);
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      focusRoomAt(keyboardRoomIndex - 1);
      return;
    }

    if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      focusedRoomAction("details");
      return;
    }

    if (e.key.toLowerCase() === "d") {
      e.preventDefault();
      focusedRoomAction("deck");
    }
  });

  if (filterToggle && filterPanel) {
    filterToggle.addEventListener("click", function () {
      const shouldOpen = !filterPanel.classList.contains("is-open");
      filterPanel.classList.toggle("is-open", shouldOpen);
      filterToggle.setAttribute("aria-expanded", String(shouldOpen));
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-filter-root]")) {
        closeFilterPanel();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeFilterPanel();
      }
    });
  }

  if (mobileStatsToggle && statsGridWrap) {
    mobileStatsToggle.addEventListener("click", function () {
      const isOpen = statsGridWrap.classList.toggle("is-open");
      mobileStatsToggle.setAttribute("aria-expanded", String(isOpen));
      const label = mobileStatsToggle.querySelector("span");
      const icon = mobileStatsToggle.querySelector("i");
      if (label) {
        label.textContent = isOpen ? "Hide summary" : "Show summary";
      }
      if (icon) {
        icon.classList.toggle("fa-chevron-down", !isOpen);
        icon.classList.toggle("fa-chevron-up", isOpen);
      }
      if (isOpen) {
        const firstStat = statsGridWrap.querySelector(".stat-card");
        if (firstStat) {
          firstStat.setAttribute("tabindex", "-1");
          firstStat.focus();
        }
      }
    });
  }

  // Explicit room details button handler to avoid card-level action ambiguity
  roomCards.forEach((card) => {
    const detailsBtn = card.querySelector("[data-room-details]");
    if (!detailsBtn) return;

    detailsBtn.addEventListener("click", function () {
      const roomNumber = card.dataset.room;
      const roomName = card.querySelector(".room-type__name").textContent;
      const roomLocation = card.querySelector(".room-location").textContent;
      showRoomModal(roomNumber, roomName, roomLocation);
    });

    const compareBtn = card.querySelector(".compare-toggle-btn");
    compareBtn?.addEventListener("click", function () {
      const roomNumber = card.dataset.room;
      if (!roomNumber) return;
      if (compareSet.has(roomNumber)) {
        compareSet.delete(roomNumber);
      } else {
        compareSet.add(roomNumber);
      }
      compareBtn.classList.toggle("is-active", compareSet.has(roomNumber));
      compareBtn.querySelector("span").textContent = compareSet.has(roomNumber)
        ? "Selected for compare"
        : "Compare room";
      renderComparisonRail();
    });
  });

  // Room modal functions
  function showRoomModal(roomNumber, roomName, location) {
    const roomCard = roomCards.find((card) => card.dataset.room === roomNumber);
    const guestCount = roomCard
      ? roomCard.querySelectorAll(".guest-pill").length
      : 2;
    const featureTags = roomCard
      ? Array.from(roomCard.querySelectorAll(".feature-tag"))
      : [];
    const sqftTag = featureTags.find((tag) =>
      /sq\s*ft/i.test(tag.textContent || ""),
    );
    const sqftText = sqftTag
      ? (sqftTag.textContent || "").trim()
      : "Size varies";
    const hasBalcony = roomCard
      ? roomCard.dataset.roomType === "balcony"
      : roomName.includes("Balcony");
    const roomTypeName = roomCard
      ? (roomCard.dataset.roomType || "stateroom").replace("-", " ")
      : "stateroom";
    const roomDescription = roomCard
      ? (roomCard.querySelector(".room-meta-details")?.textContent || "").trim()
      : "";
    const highlights = featureTags
      .map((tag) => (tag.textContent || "").trim())
      .filter(Boolean)
      .filter((text) => !/sq\s*ft/i.test(text))
      .slice(0, 2);
    modalTitle.textContent = `Room ${roomNumber}`;
    modalDescription.textContent = `${roomTypeName.charAt(0).toUpperCase()}${roomTypeName.slice(1)} details and deck placement.`;
    closeFilterPanel();
    currentModalRoomIndex = currentVisibleCards.findIndex(
      (card) => card.dataset.room === roomNumber,
    );

    modalBody.innerHTML = `
                    <div class="modal-room-location">
                        <i class="fas fa-layer-group" aria-hidden="true"></i>
                        <span>${location}</span>
                    </div>

                    <div class="room-highlights-grid">
                        <span class="highlight-badge">
                            <i class="fas fa-user" aria-hidden="true"></i>
                            <span>${guestCount} ${guestCount === 1 ? "guest" : "guests"}</span>
                        </span>
                        <span class="highlight-badge">
                            <i class="fas fa-expand" aria-hidden="true"></i>
                            <span>${sqftText}</span>
                        </span>
                        ${
                          hasBalcony
                            ? `
                        <span class="highlight-badge">
                            <i class="fas fa-wind" aria-hidden="true"></i>
                            <span>Private balcony</span>
                        </span>
                        `
                            : ""
                        }
                        ${highlights
                          .map(
                            (text) => `
                        <span class="highlight-badge">
                            <i class="fas fa-check-circle" aria-hidden="true"></i>
                            <span>${text}</span>
                        </span>
                        `,
                          )
                          .join("")}
                    </div>

                    <p class="modal-body-copy">${roomDescription || "Use deck view to confirm nearby elevators and venue access before arrival."}</p>
                    <p class="modal-hint">Opens deck plan focused on room ${roomNumber}.</p>

                    <div class="modal-actions">
                        <button type="button" class="modal-secondary-btn modal-prev-room">
                            <i class="fas fa-chevron-left" aria-hidden="true"></i>
                            <span>Previous room</span>
                        </button>
                        <button type="button" class="modal-secondary-btn modal-next-room">
                            <i class="fas fa-chevron-right" aria-hidden="true"></i>
                            <span>Next room</span>
                        </button>
                        <a href="decks.html?room=${roomNumber}" class="modal-primary-btn">
                            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                            <span>Show on deck plan</span>
                        </a>
                        <button type="button" class="modal-secondary-btn modal-continue-room">
                            <i class="fas fa-arrow-left" aria-hidden="true"></i>
                            <span>Continue browsing</span>
                        </button>
                    </div>
                `;

    if (window.RCCLModal && typeof window.RCCLModal.open === "function") {
      window.RCCLModal.open("roomModal");
    } else {
      roomModal.classList.add("room-modal--open");
    }
    const modalContinue = modalBody.querySelector(".modal-continue-room");
    modalContinue?.focus();
    modalContinue?.addEventListener("click", closeRoomModal, { once: true });
    modalBody
      .querySelector(".modal-prev-room")
      ?.addEventListener("click", function () {
        moveModalRoom(-1);
      });
    modalBody
      .querySelector(".modal-next-room")
      ?.addEventListener("click", function () {
        moveModalRoom(1);
      });
  }

  function moveModalRoom(step) {
    if (!currentVisibleCards.length) return;
    if (currentModalRoomIndex < 0) {
      currentModalRoomIndex = 0;
    } else {
      currentModalRoomIndex =
        (currentModalRoomIndex + step + currentVisibleCards.length) %
        currentVisibleCards.length;
    }
    const card = currentVisibleCards[currentModalRoomIndex];
    if (!card) return;
    const roomNumber = card.dataset.room;
    const roomName =
      card.querySelector(".room-type__name")?.textContent || roomNumber;
    const roomLocation =
      card.querySelector(".room-location")?.textContent || "Unknown location";
    showRoomModal(roomNumber, roomName, roomLocation);
  }

  function closeRoomModal() {
    if (window.RCCLModal && typeof window.RCCLModal.close === "function") {
      window.RCCLModal.close("roomModal");
    } else {
      roomModal.classList.remove("room-modal--open");
    }
  }

  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-link");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (this.getAttribute("href").startsWith("#")) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Initialize animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("is-reveal-pending");
        entry.target.classList.add("animate-fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".stat-card, .room-card, .action-item")
    .forEach((el) => {
      el.classList.remove("animate-fade-in");
      el.classList.add("is-reveal-pending");
      observer.observe(el);
    });

  updateRoomVisibility();

  clearComparisonBtn?.addEventListener("click", function () {
    compareSet.clear();
    roomCards.forEach((card) => {
      const compareBtn = card.querySelector(".compare-toggle-btn");
      compareBtn?.classList.remove("is-active");
      if (compareBtn)
        compareBtn.querySelector("span").textContent = "Compare room";
    });
    renderComparisonRail();
  });

  let modalTouchStartX = 0;
  let modalTouchStartY = 0;
  roomModal?.addEventListener(
    "touchstart",
    function (e) {
      const touch = e.touches[0];
      if (!touch) return;
      modalTouchStartX = touch.clientX;
      modalTouchStartY = touch.clientY;
    },
    { passive: true },
  );

  roomModal?.addEventListener("touchend", function (e) {
    const touch = e.changedTouches[0];
    const modalIsOpen =
      roomModal.getAttribute("aria-hidden") === "false" ||
      roomModal.classList.contains("room-modal--open");
    if (!touch || !modalIsOpen) return;
    const dx = touch.clientX - modalTouchStartX;
    const dy = touch.clientY - modalTouchStartY;
    if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    moveModalRoom(dx > 0 ? -1 : 1);
  });

  // Floating toasts removed per UX update.
});
