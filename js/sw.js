const SW_VERSION = '2026-02-10-v1';
const STATIC_CACHE = `cruise-static-${SW_VERSION}`;
const RUNTIME_CACHE = `cruise-runtime-${SW_VERSION}`;
const OFFLINE_URL = '../offline.html';

const CORE_ASSETS = [
  '../',
  '../index.html',
  '../itinerary.html',
  '../operations.html',
  '../rooms.html',
  '../decks.html',
  '../dining.html',
  '../contacts.html',
  '../tips.html',
  '../offline.html',
  '../manifest.json',
  '../manifest.json?v=2',
  '../css/base.css',
  '../css/utilities.css',
  '../css/components.css',
  '../css/mobile-first.css',
  '../css/feature-modules.css',
  './shared-layout.js',
  '../icons/icon-192.png',
  '../icons/icon-512.png',
  '../icons/apple-touch-icon.png',
  '../icons/icon-192.svg',
  '../icons/icon-512.svg',
];

const CACHEABLE_EXTERNAL_ORIGINS = new Set([
  'https://cdnjs.cloudflare.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      await self.clients.claim();
      await notifyClients({ type: 'CACHE_UPDATED', version: SW_VERSION, at: new Date().toISOString() });
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!isHttpOrHttps(url)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event));
    return;
  }

  if (CACHEABLE_EXTERNAL_ORIGINS.has(url.origin)) {
    event.respondWith(staleWhileRevalidate(event.request, RUNTIME_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    const destination = event.request.destination;
    if (destination === 'script' || destination === 'style' || destination === 'font') {
      event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
      return;
    }

    if (destination === 'image') {
      event.respondWith(cacheFirst(event.request, RUNTIME_CACHE));
      return;
    }
  }
});

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data.type === 'PING') {
    event.source?.postMessage({ type: 'PONG', version: SW_VERSION });
  }
});

async function handleNavigationRequest(event) {
  try {
    const preloadResponse = await event.preloadResponse;
    if (preloadResponse) {
      cacheResponse(event.request, preloadResponse.clone(), RUNTIME_CACHE);
      return preloadResponse;
    }

    const networkResponse = await fetch(event.request);
    cacheResponse(event.request, networkResponse.clone(), RUNTIME_CACHE);
    return networkResponse;
  } catch (_error) {
    const cachedPage = await caches.match(event.request, { ignoreSearch: true });
    if (cachedPage) return cachedPage;

    const offlineResponse = await caches.match(OFFLINE_URL, { ignoreSearch: true });
    if (offlineResponse) return offlineResponse;

    return new Response(
      '<!DOCTYPE html><html lang="en"><meta charset="utf-8"><title>Offline</title><body><h1>Offline</h1><p>This page is unavailable without a connection.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  const network = await networkFetch;
  return network || new Response('', { status: 504 });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    return new Response('', { status: 504 });
  }
}

function cacheResponse(request, response, cacheName) {
  if (!response || !response.ok) return;
  caches.open(cacheName).then((cache) => cache.put(request, response).catch(() => {})).catch(() => {});
}

function isHttpOrHttps(url) {
  return url.protocol === 'http:' || url.protocol === 'https:';
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  clients.forEach((client) => client.postMessage(message));
}
