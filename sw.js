/* UBI Tune-Up v4 service worker — caches everything for true offline use.
 * After first load, the app works fully offline forever (or until you clear data).
 */
const CACHE = 'ubi-v4-cache-2026-04-25-r1';
const ASSETS = [
  './',
  './index.html',
  './glossary.js',
  './scenarios_v3.js',
  './wheels_v4.js',
  './game_v4.js',
  './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Cache successful responses for the same origin
        try {
          const url = new URL(event.request.url);
          if (url.origin === location.origin && response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((c) => c.put(event.request, clone));
          }
        } catch (e) {}
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
