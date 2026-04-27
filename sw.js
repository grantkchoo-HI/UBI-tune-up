/* UBI Tune-Up v5 service worker — caches everything for true offline use.
 * After first load, the app works fully offline forever (or until you clear data).
 *
 * Bump CACHE name on every release to force clients to refresh.
 */
const CACHE = 'ubi-v5-cache-2026-04-26-r4-confirm-flow';
const ASSETS = [
  './',
  './index.html',
  './glossary.js',
  './randomization_v5.js',
  './scenarios_v5.js',
  './wheels_v5.js',
  './appendix_v5.js',
  './suspension_v5.js',
  './wrench_path_v5.js',
  './game_v5.js',
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
