const CACHE_NAME = 'flowtask-v58-8';
const STATIC_CACHE = [
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function isCacheableStatic(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/_next/')) return false;
  if (request.mode === 'navigate') return false;
  return /\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$/i.test(url.pathname) || url.pathname === '/manifest.webmanifest';
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match('/app/dashboard').then((response) => response || caches.match('/')))
    );
    return;
  }

  if (!isCacheableStatic(request)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone)).catch(() => undefined);
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
