/**
 * Shared interaction primitives for all page scripts.
 * Keeps search, modal, and status behavior consistent across routes.
 */
(() => {
  "use strict";

  const DEFAULT_SEARCH_DELAY_MS = 120;
  const DEFAULT_STATUS_TIMEOUT_MS = 2400;
  const STATUS_TIMEOUT_BY_TYPE = {
    success: 1800,
    info: DEFAULT_STATUS_TIMEOUT_MS,
    error: 3600,
  };

  function ensureGlobalStatusNode() {
    let node = document.getElementById("globalStatusFeedback");
    if (node) return node;

    node = document.createElement("div");
    node.id = "globalStatusFeedback";
    node.className = "status-feedback status-feedback--info";
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.setAttribute("aria-atomic", "true");
    node.hidden = true;
    document.body.appendChild(node);
    return node;
  }

  function setStatus(
    target,
    message,
    type = "info",
    timeoutMs,
  ) {
    const node = target || ensureGlobalStatusNode();
    node.textContent = message;
    node.classList.remove(
      "status-feedback--info",
      "status-feedback--success",
      "status-feedback--error",
    );
    node.classList.add(`status-feedback--${type}`);
    node.hidden = false;

    if (node._statusTimer) {
      window.clearTimeout(node._statusTimer);
    }

    const resolvedTimeout =
      typeof timeoutMs === "number"
        ? timeoutMs
        : STATUS_TIMEOUT_BY_TYPE[type] || DEFAULT_STATUS_TIMEOUT_MS;
    node._statusTimer = window.setTimeout(() => {
      node.hidden = true;
    }, resolvedTimeout);
  }

  function installSlashFocus(input) {
    if (!input) return;
    document.addEventListener("keydown", (event) => {
      if (event.key !== "/") return;
      if (event.target === input) return;

      const tagName = event.target?.tagName?.toLowerCase();
      const typingContext =
        tagName === "input" ||
        tagName === "textarea" ||
        event.target?.isContentEditable;
      if (typingContext) return;

      event.preventDefault();
      input.focus();
      input.select?.();
    });
  }

  function attachClearButton(input, clearButton, onClear) {
    if (!input || !clearButton) return;
    if (!clearButton.getAttribute("aria-label")) {
      clearButton.setAttribute("aria-label", "Clear search");
    }

    const syncVisibility = () => {
      clearButton.hidden = !input.value.trim();
    };

    clearButton.addEventListener("click", () => {
      input.value = "";
      syncVisibility();
      onClear?.();
      input.focus();
    });

    input.addEventListener("input", syncVisibility);
    syncVisibility();
  }

  function wireSearchModel({
    input,
    status,
    items,
    empty,
    clearButton,
    getText = (item) => item.textContent || "",
    isMatch,
    searchDelayMs = DEFAULT_SEARCH_DELAY_MS,
    loadingText = "Filtering results...",
    emptyText = "No results found.",
    countText = (shown, total) => `Showing ${shown} of ${total} results`,
    onRendered,
  }) {
    if (!input || !status || !empty || !Array.isArray(items) || !items.length) {
      return { run: () => 0 };
    }
    status.setAttribute("aria-live", "polite");
    empty.setAttribute("role", "status");

    const matcher =
      isMatch ||
      ((item, query) => !query || getText(item).toLowerCase().includes(query));
    let timer;

    const run = () => {
      const query = input.value.toLowerCase().trim();
      status.classList.add("search-status-loading");
      status.textContent = loadingText;
      window.clearTimeout(timer);

      timer = window.setTimeout(() => {
        let shown = 0;
        items.forEach((item) => {
          const match = matcher(item, query);
          item.hidden = !match;
          if (match) shown += 1;
        });

        status.classList.remove("search-status-loading");
        status.textContent = countText(shown, items.length);
        empty.textContent = emptyText;
        empty.hidden = shown !== 0;
        onRendered?.(shown, items.length, query);
      }, searchDelayMs);

      return items.length;
    };

    input.addEventListener("input", run);
    installSlashFocus(input);
    attachClearButton(input, clearButton, run);

    run();
    return { run };
  }

  function wireModalModel({
    modal,
    closeSelectors = ["[data-modal-close]"],
    isOpenClass = "is-open",
  }) {
    if (!modal) return;
    let returnFocusEl = null;

    const close = () => {
      modal.setAttribute("aria-hidden", "true");
      modal.classList.remove(isOpenClass);
      document.body.classList.remove("modal-open");
      if (returnFocusEl && document.contains(returnFocusEl)) {
        returnFocusEl.focus();
      }
    };

    const getFocusable = () =>
      Array.from(
        modal.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("hidden"));

    const trapTabKey = (event) => {
      if (event.key !== "Tab") return;
      if (modal.getAttribute("aria-hidden") === "true") return;
      const focusable = getFocusable();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    closeSelectors.forEach((selector) => {
      modal.querySelectorAll(selector).forEach((button) => {
        button.addEventListener("click", close);
      });
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        close();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (
        modal.getAttribute("aria-hidden") === "false" ||
        modal.classList.contains(isOpenClass)
      ) {
        close();
      }
    });

    document.addEventListener("keydown", trapTabKey);

    modal.querySelectorAll('[data-modal-open]').forEach((trigger) => {
      trigger.addEventListener("click", () => {
        returnFocusEl = trigger;
      });
    });
  }

  window.CruiseUI = {
    setStatus,
    installSlashFocus,
    attachClearButton,
    wireSearchModel,
    wireModalModel,
  };
})();
