/**
 * contacts.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const statusEl = document.getElementById("contactsStatus");
  const BACKUP_STORAGE_KEY = "contacts-backup-v1";
  const contextCard = document.getElementById("contactContext");
  const contextTitle = document.getElementById("contactContextTitle");
  const contextBody = document.getElementById("contactContextBody");
  const contextAction = document.getElementById("contactContextAction");
  const contextActionText = document.getElementById("contactContextActionText");

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function getCruiseContext() {
    const shared = window.RCCLModeContext;
    if (
      shared &&
      typeof shared === "object" &&
      typeof shared.mode === "string"
    ) {
      if (shared.mode === "before") {
        return {
          mode: "prep",
          title: "Pre-Cruise Contact Prep",
          body: "Save port agent and insurance numbers now so they are ready before embarkation day.",
          target: "#backup",
          actionLabel: "Open Backup & Recovery",
        };
      }
      if (shared.mode === "post") {
        return {
          mode: "post",
          title: "Post-Cruise Support Mode",
          body: "Use shore support and guest relations for follow-up, claims, and service issues.",
          target: "#shore-support",
          actionLabel: "Open Shore Support",
        };
      }
      if (shared.mode === "port") {
        return {
          mode: "port",
          title: `Port Day Mode · Day ${shared.day || 1}`,
          body: "Local emergency services and port contacts become priority while ashore.",
          target: "#ports",
          actionLabel: "Open Port-Day Contacts",
        };
      }
      return {
        mode: "sea",
        title: `${shared.mode === "boarding" ? "Boarding Day" : "Sea Day"} Mode · Day ${shared.day || 1}`,
        body: "Route urgent issues through onboard channels first, starting with ship Security or Guest Services.",
        target: "#urgent",
        actionLabel: "Open Immediate Emergency",
      };
    }

    const cruiseStart = new Date("2026-02-14T00:00:00");
    const cruiseEnd = new Date("2026-02-20T23:59:59");
    const now = new Date();
    if (now < cruiseStart) {
      return {
        mode: "prep",
        title: "Pre-Cruise Contact Prep",
        body: "Save port agent and insurance numbers now so they are ready before embarkation day.",
        target: "#backup",
        actionLabel: "Open Backup & Recovery",
      };
    }
    if (now > cruiseEnd) {
      return {
        mode: "post",
        title: "Post-Cruise Support Mode",
        body: "Use shore support and guest relations for follow-up, claims, and service issues.",
        target: "#shore-support",
        actionLabel: "Open Shore Support",
      };
    }

    const diffDays =
      Math.floor((now - cruiseStart) / (1000 * 60 * 60 * 24)) + 1;
    const day = Math.max(1, Math.min(7, diffDays));
    const portDays = new Set([3, 4, 6]);
    if (portDays.has(day)) {
      return {
        mode: "port",
        title: `Port Day Mode · Day ${day}`,
        body: "Local emergency services and port contacts become priority while ashore.",
        target: "#ports",
        actionLabel: "Open Port-Day Contacts",
      };
    }
    return {
      mode: "sea",
      title: `Sea Day Mode · Day ${day}`,
      body: "Route urgent issues through onboard channels first, starting with ship Security or Guest Services.",
      target: "#urgent",
      actionLabel: "Open Immediate Emergency",
    };
  }

  function applyCruiseContext() {
    if (
      !contextCard ||
      !contextTitle ||
      !contextBody ||
      !contextAction ||
      !contextActionText
    )
      return;
    const context = getCruiseContext();
    contextCard.classList.remove(
      "contact-context--sea",
      "contact-context--port",
    );
    contextCard.classList.add(
      context.mode === "port"
        ? "contact-context--port"
        : "contact-context--sea",
    );
    contextTitle.textContent = context.title;
    contextBody.textContent = context.body;
    contextAction.setAttribute("href", context.target);
    contextActionText.textContent = context.actionLabel;

    document.querySelectorAll(".contact-section").forEach((section) => {
      section.classList.toggle(
        "contact-section--priority",
        `#${section.id}` === context.target,
      );
    });
  }

  function flashCopySuccess(button) {
    button.classList.add("copy-success");
    const original = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>Copied';
    window.setTimeout(function () {
      button.classList.remove("copy-success");
      button.innerHTML = original;
    }, 900);
  }

  function readBackupState() {
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function writeBackupState(state) {
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(state));
  }

  const backupState = readBackupState();
  document.querySelectorAll("[data-edit-value]").forEach((node) => {
    const key = node.getAttribute("data-edit-value");
    if (!key) return;
    const value = String(backupState[key] || "").trim();
    if (value) node.textContent = value;
  });

  document.querySelectorAll("[data-edit-key]").forEach((button) => {
    button.addEventListener("click", function () {
      const key = this.getAttribute("data-edit-key");
      if (!key) return;
      const current = String(backupState[key] || "").trim();
      const next = window.prompt(
        "Enter verified contact details for quick access:",
        current,
      );
      if (next === null) return;
      const clean = String(next).trim();
      backupState[key] = clean;
      writeBackupState(backupState);
      const valueNode = document.querySelector(`[data-edit-value="${key}"]`);
      if (valueNode) valueNode.textContent = clean || "Not saved";
      setStatus(clean ? "Contact saved." : "Saved contact cleared.");
    });
  });

  document.querySelectorAll(".copy-btn").forEach((button) => {
    button.addEventListener("click", async function () {
      const fromKey = this.getAttribute("data-copy-from");
      const value = fromKey
        ? String(backupState[fromKey] || "").trim()
        : this.getAttribute("data-copy") || "";
      if (!value) {
        setStatus("Nothing saved to copy yet.");
        return;
      }
      try {
        await navigator.clipboard.writeText(value);
        setStatus("Copied to clipboard.");
        flashCopySuccess(this);
      } catch (error) {
        setStatus("Copy failed.");
      }
    });
  });

  document
    .querySelectorAll('.main-navigation__filters a[href^="#"]')
    .forEach((link) => {
      link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");
        const target = targetId ? document.querySelector(targetId) : null;
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.focus({ preventScroll: true });
        history.replaceState(null, "", targetId);
      });
    });

  applyCruiseContext();
  document.addEventListener("rccl:mode-change", applyCruiseContext);
});
