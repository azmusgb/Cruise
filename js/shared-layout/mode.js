/**
 * Shared layout mode helpers.
 */
(() => {
  "use strict";

  function getCruiseModeContext() {
    const now = new Date();
    const cruiseStart = new Date("2026-02-14T00:00:00-05:00");
    const embarkation = new Date("2026-02-14T14:00:00-05:00");
    const disembarkation = new Date("2026-02-20T09:00:00-05:00");
    const cruiseEnd = new Date("2026-02-20T23:59:59-05:00");
    const portDays = new Set([3, 4, 6]);

    let mode = "before";
    let modeLabel = "Before Sail";
    let modeClass = "mode-before";
    let day = 1;

    if (now < cruiseStart) {
      mode = "before";
    } else if (now > cruiseEnd) {
      mode = "post";
      modeLabel = "Memories";
      modeClass = "mode-post";
      day = 7;
    } else {
      day = Math.max(
        1,
        Math.min(
          7,
          Math.floor((now - cruiseStart) / (1000 * 60 * 60 * 24)) + 1,
        ),
      );
      if (day === 1) {
        mode = "boarding";
        modeLabel = "Boarding Day";
        modeClass = "mode-boarding";
      } else if (portDays.has(day)) {
        mode = "port";
        modeLabel = "Port Day";
        modeClass = "mode-port";
      } else {
        mode = "sea";
        modeLabel = "Sea Day";
        modeClass = "mode-sea";
      }
    }

    return {
      nowIso: now.toISOString(),
      mode,
      modeLabel,
      modeClass,
      day,
      isPortDay: mode === "port",
      isBeforeCruise: mode === "before",
      isAfterCruise: mode === "post",
      isOnboardNow: now >= embarkation && now <= disembarkation,
    };
  }

  function cruiseStatusText(now, embarkation) {
    const diff = embarkation.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days >= 2) return `${days}d ${hours}h to sail away`;
    return "Boarding soon · lock final details";
  }

  function getDayPart(now) {
    const hour = now.getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  window.CruiseLayoutMode = {
    getCruiseModeContext,
    cruiseStatusText,
    getDayPart,
  };
})();
