/**
 * index.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const hero = document.querySelector(".hero--cinematic");
  const countdown = document.getElementById("countdown");
  const phaseBanner = document.getElementById("phaseBanner");
  const statusStrip = document.querySelector(".hero-status-strip");
  const heroEyebrow = document.querySelector(".hero__eyebrow");
  const heroTitle = document.querySelector(".hero__title");
  const heroDescription = document.querySelector(".hero__description");
  const heroPrimaryAction = document.querySelector(".hero__actions .btn--primary");
  const heroSecondaryAction = document.querySelector(
    ".hero__actions .btn--secondary",
  );
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const sailDate = new Date("2026-02-14T16:00:00-05:00");
  const cruiseEnd = new Date("2026-02-20T23:59:59-05:00");

  function getHomeportStatus(now) {
    const dayMs = 1000 * 60 * 60 * 24;
    if (now < sailDate) {
      const daysToSail = Math.max(0, Math.ceil((sailDate - now) / dayMs));
      return `Departing in ${daysToSail} Day${daysToSail === 1 ? "" : "s"}`;
    }

    const sameDay =
      now.getFullYear() === sailDate.getFullYear() &&
      now.getMonth() === sailDate.getMonth() &&
      now.getDate() === sailDate.getDate();
    if (sameDay) {
      return "Boarding Day. Let's Go.";
    }

    if (now > cruiseEnd) {
      return "Cruise complete. See trip memories.";
    }

    const locations = [
      "At Sea",
      "Grand Cayman",
      "Falmouth",
      "At Sea",
      "Perfect Day at CocoCay",
      "Return to Port",
    ];
    const dayIndex = Math.max(
      1,
      Math.min(7, Math.floor((now - sailDate) / dayMs) + 1),
    );
    const location =
      locations[Math.min(locations.length - 1, Math.max(0, dayIndex - 1))];
    return `Day ${dayIndex} – ${location}`;
  }

  function syncStatusStripState(now) {
    const isComplete = now > cruiseEnd;
    if (statusStrip) {
      statusStrip.classList.toggle("is-complete", isComplete);
    }
  }

  function createCountdownUnit(value, label) {
    const unit = document.createElement("div");
    unit.className = "countdown-unit";
    unit.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    return unit;
  }

  function renderCountdownSequence(now) {
    if (!countdown) return;
    if (now > cruiseEnd) {
      countdown.replaceChildren();
      return;
    }

    const diffMs = Math.max(0, sailDate.getTime() - now.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const units = [
      createCountdownUnit(days, "Days"),
      createCountdownUnit(hours, "Hours"),
      createCountdownUnit(minutes, "Minutes"),
    ];

    countdown.replaceChildren(...units);
    const reveal = (index) => {
      if (units[index]) {
        units[index].classList.add("is-visible");
      }
    };

    if (reducedMotion) {
      units.forEach((unit) => unit.classList.add("is-visible"));
      return;
    }

    window.setTimeout(function () {
      reveal(0);
    }, 900);
    window.setTimeout(function () {
      reveal(1);
    }, 1050);
    window.setTimeout(function () {
      reveal(2);
    }, 1200);
  }

  function maybePlayEmbarkTone(now) {
    const cruiseModeContext = window.RCCLModeContext || {};
    const cruiseModeEnabled = Boolean(
      localStorage.getItem("cruise-mode") === "on" ||
      (cruiseModeContext.mode && cruiseModeContext.mode !== "before"),
    );
    const soundOn =
      localStorage.getItem("sound-enabled") === "true" ||
      localStorage.getItem("cruise-sound") === "on";
    const within24Hours =
      Math.abs(now.getTime() - sailDate.getTime()) <= 24 * 60 * 60 * 1000;
    const alreadyPlayed =
      localStorage.getItem("home-embark-tone-played") === "1";
    const hasInteracted =
      localStorage.getItem("cruise-user-interacted") === "1";

    if (
      !cruiseModeEnabled ||
      !soundOn ||
      !within24Hours ||
      alreadyPlayed ||
      !hasInteracted ||
      reducedMotion
    ) {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        262,
        audioContext.currentTime + 0.2,
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        329,
        audioContext.currentTime + 0.4,
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        392,
        audioContext.currentTime + 0.62,
      );
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.06,
        audioContext.currentTime + 0.08,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.65,
      );
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.65);
      localStorage.setItem("home-embark-tone-played", "1");
    } catch (error) {
      console.warn("Embark tone unavailable:", error);
    }
  }

  function initCinematicHero() {
    if (!hero) return;
    const now = new Date();
    const mode = (window.RCCLModeContext && window.RCCLModeContext.mode) || "before";

    if (mode === "post") {
      if (heroEyebrow) {
        heroEyebrow.innerHTML =
          '<i class="fas fa-camera-retro" aria-hidden="true"></i> Memories mode';
      }
      if (heroTitle) heroTitle.textContent = "Adventure of the Seas · Memories";
      if (heroDescription) {
        heroDescription.textContent =
          "Relive every port, dinner, and deck sunset from your sailing.";
      }
      if (heroPrimaryAction) {
        heroPrimaryAction.href = "photos.html";
        heroPrimaryAction.innerHTML =
          '<i class="fas fa-images" aria-hidden="true"></i> Browse photos';
      }
      if (heroSecondaryAction) {
        heroSecondaryAction.href = "itinerary.html";
        heroSecondaryAction.innerHTML =
          '<i class="fas fa-route" aria-hidden="true"></i> Open trip recap';
      }
    }

    if (phaseBanner) {
      phaseBanner.textContent = getHomeportStatus(now);
    }
    syncStatusStripState(now);

    if (
      (window.RCCLModeContext &&
        window.RCCLModeContext.mode &&
        window.RCCLModeContext.mode !== "before") ||
      localStorage.getItem("cruise-mode") === "on"
    ) {
      hero.classList.add("is-cruise-mode");
    }

    if (reducedMotion) {
      hero.classList.add("is-ready");
      renderCountdownSequence(now);
    } else {
      window.setTimeout(function () {
        hero.classList.add("is-ready");
      }, 150);
      renderCountdownSequence(now);
    }
    maybePlayEmbarkTone(now);
  }

  const captureInteraction = function () {
    localStorage.setItem("cruise-user-interacted", "1");
    document.removeEventListener("pointerdown", captureInteraction);
    document.removeEventListener("keydown", captureInteraction);
  };

  document.addEventListener("pointerdown", captureInteraction, { once: true });
  document.addEventListener("keydown", captureInteraction, { once: true });
  initCinematicHero();

  // One-time gentle pulse for Today card
  const todayCard = document.querySelector(".card--today");
  if (todayCard) {
    const pulseShown = localStorage.getItem("today-pulse-shown") === "1";
    if (!pulseShown && !reducedMotion) {
      requestAnimationFrame(() => {
        todayCard.setAttribute("data-pulse", "on");
        setTimeout(() => {
          todayCard.removeAttribute("data-pulse");
          localStorage.setItem("today-pulse-shown", "1");
        }, 1200);
      });
    }
  }

  const tour = document.getElementById("dashboardTour");
  const dismissTour = document.getElementById("dismissDashboardTour");
  const collapsibleSections = Array.from(
    document.querySelectorAll(".mobile-collapsible"),
  );

  if (tour && dismissTour) {
    const dismissed = localStorage.getItem("dashboard-tour-dismissed") === "1";
    if (!dismissed) {
      tour.hidden = false;
    }
    dismissTour.addEventListener("click", function () {
      localStorage.setItem("dashboard-tour-dismissed", "1");
      tour.hidden = true;
    });
  }

  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
  if (isMobileViewport) {
    collapsibleSections.forEach((section) => {
      const header = section.querySelector(".deck-grid__header");
      if (!header) return;
      const storageKey = `dashboard-collapsed-${section.getAttribute("aria-label") || "section"}`;
      const persistedCollapsed = sessionStorage.getItem(storageKey) === "1";
      let toggle = header.querySelector(".mobile-collapse-toggle");
      if (!toggle) {
        toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "mobile-collapse-toggle";
        header.appendChild(toggle);
      }

      if (persistedCollapsed) {
        section.classList.add("is-collapsed");
      }

      function syncToggleState() {
        const collapsed = section.classList.contains("is-collapsed");
        const region = section.querySelector(".deck-cards");
        if (region) {
          if (!region.id) {
            region.id = `mobile-collapsible-${Math.random().toString(36).slice(2, 10)}`;
          }
          toggle.setAttribute("aria-controls", region.id);
        }
        toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
        toggle.innerHTML = collapsed
          ? '<i class="fas fa-chevron-right" aria-hidden="true"></i> Expand'
          : '<i class="fas fa-chevron-down" aria-hidden="true"></i> Collapse';
      }
      syncToggleState();

      toggle.addEventListener("click", function () {
        section.classList.toggle("is-collapsed");
        const collapsed = section.classList.contains("is-collapsed");
        sessionStorage.setItem(storageKey, collapsed ? "1" : "0");
        syncToggleState();
      });
    });
  }
});
