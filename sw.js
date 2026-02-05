const CACHE_NAME = 'cruise_companion_offline_v3';
const CORE_ASSETS = [
  './',
  'index.html',
  'itinerary.html',
  'operations.html',
  'rooms.html',
  'dining.html',
  'tips.html',
  'styles.css',
  'script.js',
  'offline.html',
  'manifest.json',
  'deck-plans/index.json',
  'icons/icon-192.svg',
  'icons/icon-512.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Source+Sans+Pro:wght@300;400;600&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  event.respondWith(handleAssetRequest(event.request));
});

async function handleNavigationRequest(event) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const preload = await event.preloadResponse;
    if (preload) return preload;

    const networkResponse = await fetch(event.request);
    if (networkResponse && networkResponse.ok) {
      cache.put(event.request, networkResponse.clone()).catch(() => {});
    }
    return networkResponse;
  } catch (_) {
    const cachedPage = await cache.match(event.request, { ignoreSearch: true });
    if (cachedPage) return cachedPage;

    const offlinePage = await cache.match('offline.html');
    if (offlinePage) return offlinePage;

    return new Response('<h1>Offline</h1><p>Please reconnect and try again.</p>', {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });

  if (cached) {
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          cache.put(request, response.clone()).catch(() => {});
        }
      })
      .catch(() => {});

    return cached;
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (_) {
    return new Response('', { status: 404, statusText: 'Not Found' });
  }
}
