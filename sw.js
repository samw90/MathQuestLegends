// Offline support. Same-site files are fetched from the network first (so new
// uploads show up right away) and fall back to the cache when offline.
// Bump CACHE (v1 -> v2 ...) when files are renamed or removed.
const CACHE = 'mql-v1';
const ASSETS = [
  './', './index.html', './style.css', './manifest.webmanifest',
  './js/data.js', './js/art.js', './js/math.js', './js/game.js',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function save(req, resp) {
  if (resp && (resp.ok || resp.type === 'opaque')) {
    const copy = resp.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  }
  return resp;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameSite = new URL(req.url).origin === self.location.origin;
  if (sameSite) {
    e.respondWith(
      fetch(req).then((resp) => save(req, resp))
        .catch(() => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
  } else {
    // Fonts: cache first, they never change.
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((resp) => save(req, resp))));
  }
});
