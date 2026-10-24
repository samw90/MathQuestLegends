// Offline support. Same-site files are fetched from the network first (so new
// uploads show up right away) and fall back to the cache when offline.
// Bump CACHE (v1 -> v2 ...) when files are renamed or removed.
const CACHE = 'mql-v7';
const ASSETS = [
  './', './index.html', './progress.html', './style.css', './manifest.webmanifest',
  './js/version.js', './js/data.js', './js/art.js', './js/math.js', './js/game.js',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png',
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
    // cache: 'no-cache' makes the browser check the server instead of reusing
    // its own HTTP cache, so every file comes from the same (newest) version.
    const fresh = req.mode === 'navigate'
      ? fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
      : fetch(req, { cache: 'no-cache' });
    // A server error (the Mac's server down behind Tailscale answers 502) counts
    // as offline too: use the saved copy if there is one.
    const saved = () => caches.match(req).then((hit) => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
    const net = fresh.then((resp) => (resp.ok || resp.type === 'opaque' ? save(req, resp) : saved().then((hit) => hit || resp)))
      .catch(saved);
    // A network that hangs instead of failing (the Retroid's VPN still "connected"
    // with no internet behind it) counts as offline after 4 s if there's a saved
    // copy. The download carries on, so the copy is still brought up to date.
    const slow = new Promise((res) => setTimeout(res, 4000)).then(saved).then((hit) => hit || net);
    e.waitUntil(net.catch(() => {}));
    e.respondWith(Promise.race([net, slow]));
  } else {
    // Fonts: cache first, they never change.
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((resp) => save(req, resp))));
  }
});
