/**
 * offline.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const ui = window.CruiseUI;
  const lastSync = document.getElementById("lastSyncLabel");
  const refreshOfflineStatus = document.getElementById("refreshOfflineStatus");
  function updateSyncLabel() {
    if (!lastSync) return;
    const stored = localStorage.getItem("offline_last_sync_at");
    if (stored) {
      const at = new Date(stored);
      lastSync.textContent = at.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      return;
    }
    lastSync.textContent = "Unknown";
  }
  if (refreshOfflineStatus) {
    refreshOfflineStatus.addEventListener("click", function () {
      localStorage.setItem("offline_last_sync_at", new Date().toISOString());
      updateSyncLabel();
      ui?.setStatus(null, "Offline status refreshed.", "success");
    });
  }
  updateSyncLabel();

  const input = document.getElementById("offlineSearchInput");
  const clearButton = document.getElementById("offlineSearchClear");
  const status = document.getElementById("offlineSearchStatus");
  const empty = document.getElementById("offlineSearchEmpty");
  const cards = Array.from(
    document.querySelectorAll("#offline-grid .deck-card"),
  );
  const total = cards.length;
  if (!input || !status || !empty || total === 0) return;

  function update() {
    const q = input.value.toLowerCase().trim();
    let shown = 0;
    cards.forEach((card) => {
      const match = !q || card.textContent.toLowerCase().includes(q);
      card.hidden = !match;
      if (match) shown += 1;
    });
    status.textContent = `Showing ${shown} of ${total} results`;
    empty.textContent = "No results found.";
    empty.hidden = shown !== 0;
  }

  input.addEventListener("input", update);
  ui?.installSlashFocus(input);
  ui?.attachClearButton(input, clearButton, update);
  update();
});
