/**
 * operations.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const ui = window.CruiseUI;
  const input = document.getElementById("operationsSearchInput");
  const clearButton = document.getElementById("operationsSearchClear");
  const status = document.getElementById("operationsSearchStatus");
  const empty = document.getElementById("operationsSearchEmpty");
  const cards = Array.from(document.querySelectorAll("#tasks .deck-card"));
  const total = cards.length;
  const remainingCountEl = document.getElementById("operationsRemainingCount");
  const totalCountEl = document.getElementById("operationsTotalCount");
  const STORAGE_KEY = "operations-completed-v1";

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

  const searchModel = ui?.wireSearchModel({
    input,
    status,
    items: cards,
    empty,
    clearButton,
    loadingText: "Filtering checklist...",
    emptyText: "No checklist items match this search.",
    countText: (shown, all) => `Showing ${shown} of ${all} results`,
  });

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
      if (ui) {
        ui.setStatus(
          status,
          done ? "Task marked complete." : "Task marked incomplete.",
          done ? "success" : "info",
        );
      }
    });
  });

  updateTaskCounts();
  searchModel?.run();
});
