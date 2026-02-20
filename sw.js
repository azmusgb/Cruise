const VERSION = 'v4.0.0';
const STATIC = `static-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC).then(cache =>
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
        '/js/shared-layout.js'
      ])
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => !k.includes(VERSION))
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        return caches.open(RUNTIME).then(cache => {
          cache.put(e.request, resp.clone());
          return resp;
        });
      });
    })
  );
});
