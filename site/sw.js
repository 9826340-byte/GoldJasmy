// Caches only the app shell. Price requests (other origins) are never intercepted or cached.
const CACHE = 'gold-shell-v7';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'calc.js', 'vault-art.js', 'brand/jasmy-mark.png',
               'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).origin !== location.origin) return;
  // network first so updates land; cached shell only when offline
  e.respondWith(fetch(e.request)
    .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request)));
});
