const VERSION = "v4.3.0";
const STATIC = `static-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches
      .open(STATIC)
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/offline.html",
          "/css/tokens.css",
          "/css/base.css",
          "/css/utilities.css",
          "/css/layout.css",
          "/css/components.css",
          "/css/feature-modules.css",
          "/css/shared-layout.entry.css",
          "/css/shared-layout.css",
          "/css/shared-layout/nav-consistency.css",
          "/js/shared-layout.config.js",
          "/js/shared-layout/mode.js",
          "/js/shared-layout/pwa.js",
          "/css/mobile-first.css",
          "/js/global.js",
          "/js/shared-layout.js",
          "/js/pages/shared-interactions.js",
          "/js/pages/index.js",
          "/js/pages/itinerary.js",
          "/js/pages/decks.js",
          "/js/pages/rooms.js",
          "/js/pages/dining.js",
          "/js/pages/operations.js",
          "/js/pages/tips.js",
          "/js/pages/photos.js",
          "/js/pages/offline.js",
          "/js/pages/contacts.js",
        ]),
      ),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !k.includes(VERSION)).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const requestURL = new URL(e.request.url);
  if (requestURL.protocol !== "http:" && requestURL.protocol !== "https:")
    return;

  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/offline.html")));
    return;
  }

  e.respondWith(
    (async () => {
      const cached = await caches.match(e.request);
      if (cached) return cached;

      const resp = await fetch(e.request);
      if (resp && resp.ok) {
        try {
          const cache = await caches.open(RUNTIME);
          await cache.put(e.request, resp.clone());
        } catch (_err) {
          // Ignore cache write failures (opaque responses, unsupported schemes, etc.).
        }
      }
      return resp;
    })(),
  );
});
