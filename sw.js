const CACHE = 'recomp-v2';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // allSettled, not addAll: one missing asset must not brick the install.
      .then(c => Promise.allSettled(SHELL.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const keep = res => res && res.ok;

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;

  // The page is network-first so a deploy reaches a phone that already has the
  // app installed; offline still falls back to the cached shell.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (keep(res)) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Everything else stays cache-first and instant.
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => {
        if (keep(res)) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
