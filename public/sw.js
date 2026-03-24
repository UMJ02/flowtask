const CACHE_NAME = 'flowtask-v6-2-7';
const STATIC_CACHE = [
  '/manifest.webmanifest',
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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return new Response('Offline', {
        status: 503,
        statusText: 'Offline',
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    })
  );
});
