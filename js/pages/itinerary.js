/**
 * itinerary.html page behavior.
 * Extracted from inline script for maintainability and testability.
 */
document.addEventListener("DOMContentLoaded", function () {
  const ui = window.CruiseUI;
  const dayButtons = Array.from(document.querySelectorAll(".day-btn"));
  const daySections = Array.from(document.querySelectorAll(".itinerary-day"));

  // Wrap day details into a body container for smooth collapse
  daySections.forEach((section) => {
    const header = section.querySelector(".itinerary-day__header");
    if (!header) return;
    const body = document.createElement("div");
    body.className = "itinerary-day__body";
    const toMove = [];
    let node = header.nextElementSibling;
    while (node) {
      toMove.push(node);
      node = node.nextElementSibling;
    }
    toMove.forEach((n) => body.appendChild(n));
    section.appendChild(body);
  });

  const shareButton = document.getElementById("shareItineraryBtn");
  const printButton = document.getElementById("printItineraryBtn");
  const savePdfButton = document.getElementById("savePDFBtn");
  const calendarButton = document.getElementById("addToCalendarBtn");
  const emailButton = document.getElementById("emailItineraryBtn");
  const openLegendButton = document.getElementById("openLegendBtn");
  const legendModal = document.getElementById("itineraryLegendModal");
  const itineraryStatus = document.getElementById("itineraryStatus");
  const cruiseModeLine = document.getElementById("cruiseModeLine");
  let currentDay = 1;
  let todayDay = "1";

  function setStatus(message) {
    if (!itineraryStatus) return;
    ui?.setStatus(itineraryStatus, message, "info");
  }

  function getCruiseDayContext() {
    const cruiseStart = new Date("2026-02-14T00:00:00");
    const cruiseEnd = new Date("2026-02-20T23:59:59");
    const now = new Date();
    if (now < cruiseStart) {
      return { day: 1, label: "Pre-cruise view: showing Day 1 by default." };
    }
    if (now > cruiseEnd) {
      return { day: 7, label: "Sailing complete: showing Day 7 wrap-up." };
    }
    const diffDays =
      Math.floor((now - cruiseStart) / (1000 * 60 * 60 * 24)) + 1;
    const day = Math.max(1, Math.min(7, diffDays));
    return { day, label: `Current sailing day: Day ${day}.` };
  }

  function showDay(day) {
    const normalizedDay = String(day);
    // Determine tomorrow/next relative to 'todayDay'
    const tomorrow = Math.min(7, Number(todayDay) + 1);
    const next = Math.min(7, Number(todayDay) + 2);

    daySections.forEach((section) => {
      const d = Number(section.dataset.day);
      const isCurrent = section.dataset.day === normalizedDay;
      const isToday = section.dataset.day === todayDay;

      section.setAttribute("data-today", isToday ? "true" : "false");
      section.classList.toggle("itinerary-day--today", isToday);
      section.classList.toggle("itinerary-day--tomorrow", d === tomorrow);
      section.classList.toggle("itinerary-day--next", d === next);

      // Collapse non-selected days; expand selected
      section.classList.toggle("is-collapsed", !isCurrent);

      // Maintain today anchor id for pulse/scroll
      if (isToday) {
        section.id = "today-card";
      } else if (section.id === "today-card") {
        section.removeAttribute("id");
      }

      // Today badge management
      const badgeContainer = section.querySelector(".itinerary-day__badges");
      if (badgeContainer) {
        const existingTodayBadge =
          badgeContainer.querySelector(".badge--today");
        if (isToday && !existingTodayBadge) {
          badgeContainer.insertAdjacentHTML(
            "afterbegin",
            '<span class="badge badge--today">Today</span>',
          );
        } else if (!isToday && existingTodayBadge) {
          existingTodayBadge.remove();
        }
      }

      // Port/Sea subtle classification
      const badgesText = (
        section.querySelector(".itinerary-day__badges")?.textContent || ""
      ).toLowerCase();
      section.classList.toggle("is-port", badgesText.includes("port day"));
      section.classList.toggle("is-sea", badgesText.includes("sea day"));
    });

    dayButtons.forEach((btn) => {
      const isActive = btn.dataset.day === normalizedDay;
      btn.classList.toggle("day-btn--active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      if (isActive) {
        btn.setAttribute("aria-current", "true");
      } else {
        btn.removeAttribute("aria-current");
      }
    });
    currentDay = Number(day);
  }

  function scrollToDay(day, behavior = "smooth") {
    const target = document.querySelector(
      `.itinerary-day[data-day="${String(day)}"]`,
    );
    if (!target) return;
    target.scrollIntoView({ behavior, block: "start" });
  }

  function pulseTodayTarget() {
    const target =
      document.getElementById("today-card") ||
      document.querySelector('.itinerary-day[data-today="true"]');
    if (!target) return;
    target.classList.remove("itinerary-day--today-pulse");
    window.requestAnimationFrame(() => {
      target.classList.add("itinerary-day--today-pulse");
    });
    window.setTimeout(() => {
      target.classList.remove("itinerary-day--today-pulse");
    }, 1250);
  }

  dayButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const nextDay = Number(this.dataset.day);
      if (!Number.isNaN(nextDay)) {
        showDay(nextDay);
        setStatus(`Viewing Day ${nextDay}.`);
        const target = document.querySelector(
          `.itinerary-day[data-day="${this.dataset.day}"]`,
        );
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Royal Caribbean Itinerary",
            text: "Check out our cruise itinerary.",
            url: window.location.href,
          });
          setStatus("Shared successfully.");
        } catch (err) {
          setStatus("Share cancelled.");
        }
      } else {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => setStatus("Link copied to clipboard."))
          .catch(() => setStatus("Unable to copy link."));
      }
    });
  }

  if (printButton) {
    printButton.addEventListener("click", () => {
      window.print();
    });
  }

  if (savePdfButton) {
    savePdfButton.addEventListener("click", () => {
      window.print();
    });
  }

  if (calendarButton) {
    calendarButton.addEventListener("click", () => {
      setStatus("Add to calendar is coming next.");
    });
  }

  if (emailButton) {
    emailButton.addEventListener("click", () => {
      window.location.href = `mailto:?subject=${encodeURIComponent("Cruise Itinerary")}&body=${encodeURIComponent(window.location.href)}`;
    });
  }

  if (openLegendButton && legendModal) {
    openLegendButton.addEventListener("click", () => {
      legendModal.setAttribute("aria-hidden", "false");
      legendModal.classList.add("is-open");
    });
  }

  ui?.wireModalModel({ modal: legendModal });

  const context = getCruiseDayContext();
  todayDay = String(context.day);
  showDay(context.day);

  // Collapse all non-selected days on load
  daySections.forEach((s) => {
    if (Number(s.dataset.day) !== context.day) s.classList.add("is-collapsed");
  });

  // Make day headers toggle expansion
  daySections.forEach((section) => {
    const header = section.querySelector(".itinerary-day__header");
    if (!header) return;
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.addEventListener("click", () =>
      showDay(Number(section.dataset.day)),
    );
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showDay(Number(section.dataset.day));
      }
    });
  });

  setStatus(context.label);
  if (cruiseModeLine) {
    if (context.day <= 1) {
      cruiseModeLine.textContent =
        "Embark day is close. Keep timing simple and stress-free.";
    } else if (context.day >= 7) {
      cruiseModeLine.textContent =
        "Final day flow. Keep transfers and documents ready.";
    } else {
      cruiseModeLine.textContent = `Sea/port rhythm for Day ${context.day}. Relaxed pace, clear timing.`;
    }
  }

  if (window.location.hash === "#today") {
    window.setTimeout(() => {
      scrollToDay(context.day, "smooth");
      pulseTodayTarget();
    }, 120);
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash !== "#today") return;
    scrollToDay(context.day, "smooth");
    pulseTodayTarget();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentDay > 1) {
      showDay(currentDay - 1);
    } else if (e.key === "ArrowRight" && currentDay < 7) {
      showDay(currentDay + 1);
    } else {
      return;
    }
    setStatus(`Viewing Day ${currentDay}.`);
  });
});
