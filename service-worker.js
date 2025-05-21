//Offline Cache Variables:
const CACHE_NAME = 'offline';
const OFFLINE_URL = '/offline.html';

//Installation Event:
self.addEventListener('install', function(event) {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
  })());
  
  self.skipWaiting();
});

//Activation Event:
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    //Enables Preload:
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());

  //Client Claim:
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  //Checks the Navigator:
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })());
  }
});