/**
 * Shared layout PWA helpers.
 */
(() => {
  "use strict";

  let deferredInstallPromptEvent = null;

  function initInstallPrompt({ installButton, showToast }) {
    const installBtn = installButton;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    const setInstallButtonVisible = (visible) => {
      if (!installBtn) return;
      installBtn.hidden = !visible;
      installBtn.setAttribute("aria-hidden", String(!visible));
    };

    if (installBtn && isStandalone) {
      setInstallButtonVisible(false);
    }

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPromptEvent = event;
      if (!isStandalone) {
        setInstallButtonVisible(true);
      }
    });

    window.addEventListener("appinstalled", () => {
      deferredInstallPromptEvent = null;
      setInstallButtonVisible(false);
      localStorage.setItem("pwa_installed_at", new Date().toISOString());
      showToast("App installed successfully.");
    });

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (!deferredInstallPromptEvent) {
          showToast("Install option is not available yet on this device.");
          return;
        }

        deferredInstallPromptEvent.prompt();
        const choice = await deferredInstallPromptEvent.userChoice.catch(
          () => null,
        );
        if (choice && choice.outcome === "accepted") {
          showToast("Install started.");
          setInstallButtonVisible(false);
        } else {
          showToast("Install dismissed. You can try again anytime.");
          setInstallButtonVisible(true);
        }
      });
    }
  }

  function initServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) {
      console.info(
        "Service worker skipped: secure context required (HTTPS or localhost).",
      );
      return;
    }
    if (location.protocol === "file:") {
      console.info(
        "Service worker skipped: file:// previews are not supported.",
      );
      return;
    }

    window.addEventListener("load", () => {
      let refreshing = false;

      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => {
          registrations.forEach((registration) => {
            const scriptUrl =
              registration.active?.scriptURL ||
              registration.installing?.scriptURL ||
              registration.waiting?.scriptURL ||
              "";
            if (scriptUrl.includes("/js/sw.js")) {
              registration.unregister().catch(() => {});
            }
          });
        })
        .catch(() => {});

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      navigator.serviceWorker.addEventListener("message", (event) => {
        const data = event.data;
        if (!data || typeof data !== "object") return;
        if (data.type === "CACHE_UPDATED") {
          localStorage.setItem(
            "offline_last_sync_at",
            data.at || new Date().toISOString(),
          );
          localStorage.setItem("offline_sw_version", data.version || "unknown");
        }
      });

      navigator.serviceWorker
        .register("./sw.js")
        .then((registration) => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          registration.addEventListener("updatefound", () => {
            const nextWorker = registration.installing;
            if (!nextWorker) return;
            nextWorker.addEventListener("statechange", () => {
              if (
                nextWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                nextWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          });

          window.setInterval(
            () => {
              registration.update().catch(() => {});
            },
            60 * 60 * 1000,
          );
        })
        .catch((error) => {
          const name = error && error.name ? String(error.name) : "";
          const message =
            error && error.message ? error.message : String(error);
          if (
            name === "SecurityError" ||
            /Scope URL should start with the given script URL/i.test(message)
          ) {
            console.info(
              "Service worker skipped: host scope policy rejected registration.",
            );
            return;
          }
          console.info(`Service worker skipped: ${message}`);
        });
    });
  }

  window.CruiseLayoutPWA = {
    initInstallPrompt,
    initServiceWorker,
  };
})();
