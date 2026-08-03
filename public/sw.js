const CACHE_NAME = 'kleenology-v6';
// Precache only shell and public static assets; do NOT cache source files
const urlsToCache = [
  '/',
  '/index.html',
  '/logobg.png',
  '/logo.png',
  '/favicon.ico',
  '/favicon-96x96.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install event - cache resources and activate immediately
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-http(s) schemes and browser extensions
  if (
    url.protocol !== 'http:' &&
    url.protocol !== 'https:' ||
    url.href.startsWith('chrome-extension://') ||
    url.href.startsWith('moz-extension://') ||
    url.href.startsWith('safari-extension://')
  ) {
    return;
  }

  // Network-first for navigation requests (HTML) to avoid serving stale blank pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(new Request('/'), cloned));
          return response;
        })
        .catch(() => caches.match('/index.html').then(r => r || caches.match('/').then(r2 => r2 || new Response('', { status: 504 }))))
    );
    return;
  }

  // Cache-first for same-origin static assets under /assets and images in /public
  if (url.origin === self.location.origin && (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/public/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.ico') || url.pathname.endsWith('.css') || url.pathname.endsWith('.js'))) {
    event.respondWith(
      caches.match(request).then(cached => {
        return (
          cached ||
          fetch(request).then(response => {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
            return response;
          })
        );
      })
    );
    return;
  }

  // Default: passthrough with safe fallback
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then(r => r || new Response('', { status: 504 }))
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Enable navigation preload for faster navigations
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }

    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );

    await self.clients.claim();
  })());
});