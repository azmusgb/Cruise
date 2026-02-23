/**
 * tips.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const ui = window.CruiseUI;
  const input = document.getElementById("proMovesSearchInput");
  const clearButton = document.getElementById("proMovesSearchClear");
  const status = document.getElementById("proMovesSearchStatus");
  const empty = document.getElementById("proMovesSearchEmpty");
  const items = Array.from(document.querySelectorAll("[data-search-item]"));
  const cardsWithChecks = Array.from(
    document.querySelectorAll("[data-check-id]"),
  );
  const remainingCountEl = document.getElementById("proMovesRemainingCount");
  const totalCountEl = document.getElementById("proMovesTotalCount");
  const STORAGE_KEY = "pro-moves-completed-v1";
  const LEGACY_STORAGE_KEY = "tips-completed-v1";
  const SEARCH_DELAY_MS = 120;
  let searchTimer;

  if (!input || !status || !empty || items.length === 0) return;

  function normalizeLegacyId(id) {
    if (typeof id !== "string") return "";
    if (id.startsWith("tips-")) {
      return id.replace(/^tips-/, "pro-moves-");
    }
    return id;
  }

  function readCompletionSet() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }

      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      const legacyParsed = legacyRaw ? JSON.parse(legacyRaw) : [];
      const migrated = Array.isArray(legacyParsed)
        ? legacyParsed.map(normalizeLegacyId).filter(Boolean)
        : [];
      if (migrated.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
      return new Set(migrated);
    } catch (_e) {
      return new Set();
    }
  }

  function writeCompletionSet(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  }

  function applyCompleteState(card, checked) {
    card.classList.toggle("is-complete", checked);
    const box = card.querySelector(".tip-checkbox");
    if (box) box.checked = checked;
  }

  function updateCounts() {
    const total = cardsWithChecks.length;
    const done = cardsWithChecks.filter((card) =>
      card.classList.contains("is-complete"),
    ).length;
    const remaining = Math.max(total - done, 0);
    if (remainingCountEl) remainingCountEl.textContent = String(remaining);
    if (totalCountEl) totalCountEl.textContent = String(total);
  }

  function updateSearch() {
    const q = input.value.toLowerCase().trim();
    let shown = 0;
    const total = items.length;
    status.classList.add("search-status-loading");
    status.textContent = "Filtering pro moves...";
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      items.forEach((item) => {
        const match = !q || item.textContent.toLowerCase().includes(q);
        item.hidden = !match;
        if (match) shown += 1;
      });
      status.textContent = `Showing ${shown} of ${total} pro moves`;
      status.classList.remove("search-status-loading");
      empty.textContent = "No results found.";
      empty.hidden = shown !== 0;
    }, SEARCH_DELAY_MS);
  }

  const completed = readCompletionSet();
  cardsWithChecks.forEach((card) => {
    const id = card.getAttribute("data-check-id");
    const checkbox = card.querySelector(".tip-checkbox");
    if (!id || !checkbox) return;

    applyCompleteState(card, completed.has(id));

    checkbox.addEventListener("change", function () {
      const checked = this.checked;
      applyCompleteState(card, checked);
      if (checked) completed.add(id);
      else completed.delete(id);
      writeCompletionSet(completed);
      updateCounts();
      ui?.setStatus(
        status,
        checked ? "Pro move marked complete." : "Pro move marked incomplete.",
        checked ? "success" : "info",
      );
    });
  });

  input.addEventListener("input", updateSearch);
  ui?.installSlashFocus(input);
  ui?.attachClearButton(input, clearButton, updateSearch);

  updateCounts();
  updateSearch();
});
