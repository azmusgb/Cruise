const APP_VERSION = 'v2.0.0';
const STATIC_CACHE = `cruise-static-${APP_VERSION}`;
const RUNTIME_CACHE = `cruise-runtime-${APP_VERSION}`;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/css/tokens.css',
        '/css/base.css',
        '/css/utilities.css',
        '/css/layout.css',
        '/css/components.css',
        '/css/features.css',
        '/css/mobile-first.css',
        '/js/global.js',
        '/js/shared-layout.js',
        '/js/decks.js',
      ])
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => !key.includes(APP_VERSION)).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) =>
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          })
        )
    )
  );
});
