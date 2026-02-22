/**
 * operations.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("operationsSearchInput");
  const status = document.getElementById("operationsSearchStatus");
  const empty = document.getElementById("operationsSearchEmpty");
  const cards = Array.from(document.querySelectorAll("#tasks .deck-card"));
  const total = cards.length;
  const remainingCountEl = document.getElementById("operationsRemainingCount");
  const totalCountEl = document.getElementById("operationsTotalCount");
  const STORAGE_KEY = "operations-completed-v1";
  const SEARCH_DELAY_MS = 120;
  let searchTimer;

  if (!input || !status || !empty || total === 0) return;

  function readCompletionSet() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (_e) {
      return new Set();
    }
  }

  function writeCompletionSet(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
  }

  function applyCompletionState(card, checkbox, done) {
    card.classList.toggle("is-complete", done);
    checkbox.checked = done;
  }

  function updateTaskCounts() {
    const done = cards.filter((card) =>
      card.classList.contains("is-complete"),
    ).length;
    const remaining = Math.max(total - done, 0);
    if (remainingCountEl) remainingCountEl.textContent = String(remaining);
    if (totalCountEl) totalCountEl.textContent = String(total);
  }

  function updateSearch() {
    const q = input.value.toLowerCase().trim();
    let shown = 0;
    status.classList.add("search-status-loading");
    status.textContent = "Filtering checklist...";
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      cards.forEach((card) => {
        const match = !q || card.textContent.toLowerCase().includes(q);
        card.hidden = !match;
        if (match) shown += 1;
      });
      status.textContent = shown ? "Tasks filtered." : "No tasks match.";
      status.classList.remove("search-status-loading");
      empty.hidden = shown !== 0;
    }, SEARCH_DELAY_MS);
  }

  const completed = readCompletionSet();
  cards.forEach((card) => {
    const taskId = card.getAttribute("data-task-id");
    const checkbox = card.querySelector(".task-checkbox");
    if (!taskId || !checkbox) return;

    applyCompletionState(card, checkbox, completed.has(taskId));

    checkbox.addEventListener("change", function () {
      const done = this.checked;
      applyCompletionState(card, checkbox, done);
      if (done) {
        completed.add(taskId);
      } else {
        completed.delete(taskId);
      }
      writeCompletionSet(completed);
      updateTaskCounts();
      status.textContent = done
        ? "Task marked complete."
        : "Task marked incomplete.";
    });
  });

  input.addEventListener("input", updateSearch);

  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobileViewport) {
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && e.target !== input) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  updateTaskCounts();
  updateSearch();
});
