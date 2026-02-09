const CACHE_NAME = 'cruise_companion_offline_v5';
const CORE_ASSETS = [
  './',
  'index.html',
  'itinerary.html',
  'operations.html',
  'rooms.html',
  'rooms-detail.html',
  'decks.html',
  'dining.html',
  'tips.html',
  'js/shared-layout.js',
  'js/service-worker-registration.js',
  'css/styles.css',
  'offline.html',
  'manifest.json',
  'icons/icon-192.svg',
  'icons/icon-512.svg',
  'decks/deck-02.svg',
  'decks/deck-03.svg',
  'decks/deck-05.svg',
  'decks/deck-11.svg',
  'decks/deck-12.svg',
  'decks/deck-14.svg'
];

// External domains that should be cached (fonts, icons)
const EXTERNAL_CACHE_DOMAINS = [
  'cdnjs.cloudflare.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Skip caching for these domains (external images, APIs)
const SKIP_CACHE_DOMAINS = [
  'images.unsplash.com',
  'api.unsplash.com'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v5');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cache core assets
        await cache.addAll(CORE_ASSETS).catch(error => {
          console.warn('[SW] Failed to cache some assets:', error);
        });
        
        // Pre-cache essential external assets
        await cache.addAll([
          'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
          'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap'
        ]).catch(error => {
          console.warn('[SW] Failed to cache external assets:', error);
        });
        
        await self.skipWaiting();
        console.log('[SW] Installation complete');
      } catch (error) {
        console.error('[SW] Installation failed:', error);
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    (async () => {
      // Enable navigation preload if supported
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
        console.log('[SW] Navigation preload enabled');
      }
      
      // Clean up old caches
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => {
              console.log(`[SW] Deleting old cache: ${key}`);
              return caches.delete(key);
            })
        );
        console.log('[SW] Old caches cleaned up');
      } catch (error) {
        console.error('[SW] Failed to clean up old caches:', error);
      }
      
      // Claim clients immediately
      await self.clients.claim();
      console.log('[SW] Ready to handle fetches');
    })()
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  const requestUrl = url.href;
  
  // Skip caching for certain domains
  const shouldSkipCache = SKIP_CACHE_DOMAINS.some(domain => 
    requestUrl.includes(domain)
  );
  
  if (shouldSkipCache) {
    // Let external images pass through without caching
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event));
    return;
  }
  
  // Handle image requests separately
  if (event.request.destination === 'image') {
    event.respondWith(handleImageRequest(event));
    return;
  }
  
  // Handle all other asset requests
  event.respondWith(handleAssetRequest(event.request));
});

async function handleNavigationRequest(event) {
  const cache = await caches.open(CACHE_NAME);
  const request = event.request;
  
  try {
    // Try to use preload response first
    let response;
    if (event.preloadResponse) {
      response = await event.preloadResponse;
    }
    
    // If no preload, try network
    if (!response) {
      response = await fetch(request);
    }
    
    // Cache the successful response
    if (response && response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache).catch(error => {
        console.warn('[SW] Failed to cache navigation response:', error);
      });
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', error);
    
    // Try to get from cache
    const cachedResponse = await cache.match(request, { ignoreSearch: true });
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    const offlinePage = await cache.match('offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Ultimate fallback
    return new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>',
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 200
      }
    );
  }
}

async function handleImageRequest(event) {
  const cache = await caches.open(CACHE_NAME);
  const request = event.request;
  const url = new URL(request.url);
  
  // For Unsplash and other external images, don't cache
  if (SKIP_CACHE_DOMAINS.some(domain => url.href.includes(domain))) {
    try {
      return await fetch(request);
    } catch (error) {
      // Return a placeholder if offline
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="#f5f7fb"/>
          <text x="50%" y="50%" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="16">
            Image not available offline
          </text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
  }
  
  // For local images, try cache first
  const cached = await cache.match(request);
  
  if (cached) {
    // Update cache in background
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          cache.put(request, response).catch(() => {});
        }
      })
      .catch(() => {}); // Silent fail
    return cached;
  }
  
  // Not in cache, try network
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache).catch(() => {});
    }
    return response;
  } catch (error) {
    // Return placeholder for missing images
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#f7f9fc"/>
        <circle cx="200" cy="150" r="50" fill="#d8e1ee"/>
        <text x="200" y="150" text-anchor="middle" fill="#6b7280" dy=".3em" font-family="Arial" font-size="14">
          No image
        </text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const url = new URL(request.url);
  
  // Check if it's an external domain we should cache (fonts, etc.)
  const isCacheableExternal = EXTERNAL_CACHE_DOMAINS.some(domain => 
    url.hostname.includes(domain)
  );
  
  // For cacheable externals, use cache-first strategy
  if (isCacheableExternal) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const responseToCache = response.clone();
        cache.put(request, responseToCache).catch(() => {});
      }
      return response;
    } catch (error) {
      return new Response('', { status: 404 });
    }
  }
  
  // For critical local assets, try network first
  const isCriticalAsset = ['document', 'script', 'style'].includes(request.destination);
  
  if (isCriticalAsset) {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const responseToCache = response.clone();
        cache.put(request, responseToCache).catch(() => {});
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      return new Response('', { status: 404 });
    }
  }
  
  // For non-critical assets, try cache first
  const cached = await cache.match(request);
  if (cached) {
    // Update cache in background
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          cache.put(request, response).catch(() => {});
        }
      })
      .catch(() => {});
    return cached;
  }
  
  // Not in cache, try network
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache).catch(() => {});
    }
    return response;
  } catch (error) {
    return new Response('', { status: 404 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodically clean up old data
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupOldCacheEntries());
  }
});

async function cleanupOldCacheEntries() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const fetchedDate = new Date(dateHeader).getTime();
        if (fetchedDate < oneWeekAgo) {
          await cache.delete(request);
        }
      }
    }
  }
}
