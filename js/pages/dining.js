/**
 * dining.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const ui = window.CruiseUI;
  const searchInput = document.getElementById("diningSearchInput");
  const clearButton = document.getElementById("diningSearchClear");
  const searchStatus = document.getElementById("diningSearchStatus");
  const emptyState = document.getElementById("diningSearchEmpty");
  const cards = Array.from(
    document.querySelectorAll(".deck-card[data-venue-type]"),
  );
  const filterButtons = Array.from(
    document.querySelectorAll(".main-navigation__filters button[data-filter]"),
  );
  const countChipValue = document.querySelector(".count-chip span");
  const contextCard = document.getElementById("diningContext");
  const contextTitle = document.getElementById("diningContextTitle");
  const contextBody = document.getElementById("diningContextBody");
  const contextAction = document.getElementById("diningContextAction");
  const contextActionText = document.getElementById("diningContextActionText");
  const spotlightTitle = document.getElementById("diningSpotlightTitle");
  const spotlightBody = document.getElementById("diningSpotlightBody");
  const spotlightAction = document.getElementById("diningSpotlightAction");
  const spotlightActionText = document.getElementById(
    "diningSpotlightActionText",
  );
  const total = cards.length;
  let activeFilter = "all";
  let searchTimer;
  const SEARCH_DELAY_MS = 120;
  const deepLinkPick = new URLSearchParams(window.location.search).get("pick");

  if (!searchInput || !searchStatus || !emptyState || total === 0) {
    return;
  }

  function getCruiseContext() {
    const shared = window.RCCLModeContext;
    const now = new Date();
    const hour = now.getHours();
    const sharedDay = shared && typeof shared.day === "number" ? shared.day : 1;

    if (shared?.mode === "before") {
      return {
        title: "Pre-Cruise Dining Setup",
        body: "Start with specialty reservations before sail day to secure premium evening windows.",
        target: "#venue-chops",
        actionLabel: "Open Chops Grille",
      };
    }

    if (shared?.mode === "post") {
      return {
        title: "Post-Cruise Recap",
        body: "Save your favorite dining picks for the next sailing plan.",
        target: "#specialty-group",
        actionLabel: "Review specialty venues",
      };
    }

    if (hour >= 16 && hour <= 21) {
      return {
        title: `Tonight's Pick · Day ${sharedDay}`,
        body: "Dinner booking window is active. Specialty tables tighten quickly after 7:00 PM.",
        target: "#venue-chops",
        actionLabel: "Book Chops tonight",
      };
    }

    if (shared?.mode === "port") {
      return {
        title: `Port Day Fuel Plan · Day ${sharedDay}`,
        body: "Favor quick service before and after shore time to avoid missing all-aboard buffers.",
        target: "#venue-cafe",
        actionLabel: "Open Café Promenade",
      };
    }

    return {
      title: `${shared?.mode === "boarding" ? "Boarding Day Dining Rhythm" : `Sea Day Dining Rhythm · Day ${sharedDay}`}`,
      body: "Use Windjammer earlier in the day, then lock a dinner slot before evening venue peaks.",
      target: "#venue-windjammer",
      actionLabel: "Open Windjammer",
    };
  }

  function applyDiningContext() {
    if (
      !contextCard ||
      !contextTitle ||
      !contextBody ||
      !contextAction ||
      !contextActionText
    )
      return;
    const context = getCruiseContext();
    contextTitle.textContent = context.title;
    contextBody.textContent = context.body;
    contextAction.setAttribute("href", context.target);
    contextActionText.textContent = context.actionLabel;
    if (
      spotlightTitle &&
      spotlightBody &&
      spotlightAction &&
      spotlightActionText
    ) {
      spotlightTitle.textContent = context.title;
      spotlightBody.textContent = context.body;
      spotlightAction.setAttribute("href", context.target);
      spotlightActionText.textContent = context.actionLabel;
    }

    cards.forEach((card) => card.classList.remove("deck-card--context-pick"));
    const targetCard = document.querySelector(context.target);
    targetCard?.classList.add("deck-card--context-pick");
  }

  function applyPickFromDeepLink() {
    if (!deepLinkPick) return;
    const pickMap = {
      chops: "#venue-chops",
      windjammer: "#venue-windjammer",
      cafe: "#venue-cafe",
      giovanni: "#venue-giovanni",
      izumi: "#venue-izumi",
      "main-dining": "#venue-main-dining",
    };
    const targetSelector = pickMap[deepLinkPick.toLowerCase()];
    if (!targetSelector) return;
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const targetType = target.dataset.venueType || "all";
    activeFilter = targetType;
    filterButtons.forEach((button) => {
      const isActive = (button.dataset.filter || "") === activeFilter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", String(isActive));
    });

    searchInput.value = "";
    updateDiningView();
    cards.forEach((card) => card.classList.remove("deck-card--context-pick"));
    target.classList.add("deck-card--context-pick");

    if (contextTitle && contextBody && contextAction && contextActionText) {
      contextTitle.textContent = "Tonight's Pick from Home";
      contextBody.textContent =
        "Opened from dashboard shortcut with this venue preselected.";
      contextAction.setAttribute("href", targetSelector);
      contextActionText.textContent = `Jump to ${target.querySelector("h3")?.textContent || "venue"}`;
    }

    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function updateDiningView() {
    const term = searchInput.value.toLowerCase().trim();
    let visible = 0;

    searchStatus.classList.add("search-status-loading");
    searchStatus.textContent = "Filtering dining options...";
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      cards.forEach((card) => {
        const venueType = card.dataset.venueType || "";
        const searchableText =
          `${card.dataset.search || ""} ${card.textContent || ""}`.toLowerCase();
        const matchesFilter =
          activeFilter === "all" || venueType === activeFilter;
        const matchesSearch = !term || searchableText.includes(term);
        const shouldShow = matchesFilter && matchesSearch;

        card.hidden = !shouldShow;
        if (shouldShow) visible += 1;
      });

      searchStatus.textContent = visible
        ? `Showing ${visible} of ${total} results`
        : "Showing 0 of 0 results";
      searchStatus.classList.remove("search-status-loading");
      emptyState.textContent = "No results found.";
      emptyState.hidden = visible !== 0;
      if (countChipValue) {
        countChipValue.textContent = String(visible);
      }
    }, SEARCH_DELAY_MS);
  }

  document.addEventListener("rccl:filter-change", function (event) {
    if (!event.detail || event.detail.group !== "diningType") return;
    activeFilter = event.detail.value || "all";
    filterButtons.forEach((item) => {
      item.classList.toggle(
        "is-active",
        (item.dataset.filter || "") === activeFilter,
      );
    });
    updateDiningView();
  });

  searchInput.addEventListener("input", updateDiningView);
  ui?.installSlashFocus(searchInput);
  ui?.attachClearButton(searchInput, clearButton, updateDiningView);

  updateDiningView();
  applyDiningContext();
  applyPickFromDeepLink();

  document.addEventListener("rccl:mode-change", function () {
    applyDiningContext();
    if (deepLinkPick) applyPickFromDeepLink();
  });
});
