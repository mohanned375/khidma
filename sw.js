const CACHE_NAME = 'khidma-app-v1';
const OFFLINE_URL = 'index.html';
const assetsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
];

// install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assetsToCache)).then(()=>self.skipWaiting())
  );
});

// activate
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// fetch
self.addEventListener('fetch', event => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(response => {
        // optionally cache GET responses
        if (req.method === 'GET' && response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, copy);
          });
        }
        return response;
      }).catch(()=> caches.match(OFFLINE_URL));
    })
  );
});
