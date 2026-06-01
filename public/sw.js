// BEASTMODE Service Worker — Cache-First + CDN Caching for True Offline PWA
// Cache version — bump this when deploying new builds
const CACHE_VERSION = 'beastmode-v4';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const CDN_CACHE = `${CACHE_VERSION}-cdn`;

// Core same-origin assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
];

// CDN origins whose responses should be cached (cross-origin runtime deps)
const CACHEABLE_CDN_ORIGINS = [
  'https://cdn.tailwindcss.com',
  'https://esm.sh',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// Install: pre-cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: purge old caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('beastmode-') && name !== STATIC_CACHE && name !== CDN_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isCacheableCDN = CACHEABLE_CDN_ORIGINS.some(origin => request.url.startsWith(origin));

  // ── Navigation requests: always serve the SPA shell ───────────────────────
  // The app uses Zustand in-memory routing (setActiveView), not URL-based
  // routing. Any navigate request must resolve to index.html so React can
  // boot and handle the view. This prevents blank screens on offline refresh
  // or hard navigation to any path on the domain.
  if (isSameOrigin && request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Online: serve fresh shell and update cache
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Offline: always return the cached index.html — never a blank page
          caches.match('/index.html').then((shell) => {
            if (shell) return shell;
            // Last resort: bare minimal response to prevent a browser error page
            return new Response('<html><body><div id="root"></div></body></html>', {
              headers: { 'Content-Type': 'text/html' },
            });
          })
        )
    );
    return;
  }

  // ── Same-origin static assets: Cache-First with background refresh ─────────
  if (isSameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => null);

        // Return cached immediately; fall back to network; never return null
        return cached || networkFetch || caches.match('/index.html');
      })
    );
    return;
  }

  // ── Cross-origin CDN deps: Cache-First (opaque-safe) ──────────────────────
  // Cache esm.sh, Tailwind CDN, Google Fonts — serve instantly from cache
  // after first online visit; app works fully offline on repeat visits.
  if (isCacheableCDN) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          // Only cache valid responses (status 0 = opaque, also store those)
          if (response && (response.ok || response.type === 'opaque')) {
            const clone = response.clone();
            caches.open(CDN_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Offline and not yet cached — return nothing; React Error Boundary handles UI
          return new Response('', { status: 408, statusText: 'Offline - resource not cached yet' });
        });
      })
    );
    return;
  }

  // All other cross-origin requests (analytics, etc.) pass through unmodified
});
