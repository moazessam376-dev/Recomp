const CACHE = 'recomp-v3';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/app.js', './js/state.js', './js/ui.js', './js/data.js', './js/logic.js',
  './js/today.js', './js/train.js', './js/food.js', './js/body.js', './js/plan.js',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png'
];
/* Form photos are precached too: the gym is where there is no signal. */
const PHOTOS = ['./img/ex/back-extension-0.jpg','./img/ex/back-extension-1.jpg','./img/ex/bulgarian-split-0.jpg','./img/ex/bulgarian-split-1.jpg','./img/ex/cable-crunch-0.jpg','./img/ex/cable-crunch-1.jpg','./img/ex/cable-pushdown-0.jpg','./img/ex/cable-pushdown-1.jpg','./img/ex/db-shoulder-press-0.jpg','./img/ex/db-shoulder-press-1.jpg','./img/ex/farmers-carry-0.jpg','./img/ex/farmers-carry-1.jpg','./img/ex/hammer-curl-0.jpg','./img/ex/hammer-curl-1.jpg','./img/ex/hip-thrust-0.jpg','./img/ex/hip-thrust-1.jpg','./img/ex/hs-chest-press-0.jpg','./img/ex/hs-chest-press-1.jpg','./img/ex/incline-db-curl-0.jpg','./img/ex/incline-db-curl-1.jpg','./img/ex/incline-db-press-0.jpg','./img/ex/incline-db-press-1.jpg','./img/ex/lat-pulldown-0.jpg','./img/ex/lat-pulldown-1.jpg','./img/ex/lateral-raise-0.jpg','./img/ex/lateral-raise-1.jpg','./img/ex/leg-extension-0.jpg','./img/ex/leg-extension-1.jpg','./img/ex/leg-press-0.jpg','./img/ex/leg-press-1.jpg','./img/ex/leg-press-calf-0.jpg','./img/ex/leg-press-calf-1.jpg','./img/ex/lying-leg-curl-0.jpg','./img/ex/lying-leg-curl-1.jpg','./img/ex/lying-leg-raise-0.jpg','./img/ex/lying-leg-raise-1.jpg','./img/ex/neck-extension-0.jpg','./img/ex/neck-extension-1.jpg','./img/ex/neck-flexion-0.jpg','./img/ex/neck-flexion-1.jpg','./img/ex/neutral-pulldown-0.jpg','./img/ex/neutral-pulldown-1.jpg','./img/ex/oh-tri-ext-0.jpg','./img/ex/oh-tri-ext-1.jpg','./img/ex/pallof-press-0.jpg','./img/ex/pallof-press-1.jpg','./img/ex/pec-deck-0.jpg','./img/ex/pec-deck-1.jpg','./img/ex/rdl-0.jpg','./img/ex/rdl-1.jpg','./img/ex/rear-delt-fly-0.jpg','./img/ex/rear-delt-fly-1.jpg','./img/ex/sa-lat-row-0.jpg','./img/ex/sa-lat-row-1.jpg','./img/ex/seated-leg-curl-0.jpg','./img/ex/seated-leg-curl-1.jpg','./img/ex/smith-squat-0.jpg','./img/ex/smith-squat-1.jpg','./img/ex/standing-calf-0.jpg','./img/ex/standing-calf-1.jpg','./img/ex/tbar-row-0.jpg','./img/ex/tbar-row-1.jpg','./img/ex/wrist-curl-0.jpg','./img/ex/wrist-curl-1.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // allSettled, not addAll: one missing asset must not brick the install.
      .then(c => Promise.allSettled(SHELL.concat(PHOTOS).map(u => c.add(u))))
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
/* Network-first must not mean network-only-slower. With one bar of signal in
   the gym a fetch can hang for the OS timeout; after 2.5 s use the cache. */
const net = req => Promise.race([
  fetch(req),
  new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 2500))
]);
const save = (e, key, res) => {
  if (keep(res)) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(key, copy))); }
  return res;
};

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;

  // The page is network-first so a deploy reaches a phone that already has the
  // app installed; offline still falls back to the cached shell.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      net(e.request)
        .then(res => save(e, './index.html', res))
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./') || fetch(e.request)))
    );
    return;
  }

  /* Code is network-first as well. The page and its modules have to come from
     the same deploy: a new index.html running last week's cached JS would
     break, and the old single-file app never had this problem. */
  if (/\.(js|css|webmanifest)$/.test(new URL(e.request.url).pathname)) {
    e.respondWith(
      net(e.request)
        .then(res => save(e, e.request, res))
        .catch(() => caches.match(e.request).then(hit => hit || fetch(e.request)))
    );
    return;
  }

  // Photos and icons stay cache-first and instant.
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(res => save(e, e.request, res)).catch(() => caches.match('./index.html'))
    )
  );
});
