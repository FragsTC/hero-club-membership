// Hero Club offline support.
// Pages are fetched fresh when online and served from cache when not,
// so a new deploy always reaches the rep's phone.
var CACHE = 'hero-club-v40';
var SHELL = ["./", "referral.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "fonts/barlow-latin-500-italic.woff2", "fonts/barlow-latin-600-normal.woff2", "fonts/barlow-latin-700-normal.woff2", "fonts/barlow-latin-700-italic.woff2", "fonts/noto-sans-latin-400-normal.woff2", "fonts/noto-sans-latin-500-normal.woff2", "fonts/noto-sans-latin-600-normal.woff2", "fonts/noto-sans-latin-700-normal.woff2", "photos/01-window-inside.jpg", "photos/02-softwash-house.jpg", "photos/03-gutter.jpg", "photos/04-pole-brush.jpg", "photos/05-porch-wash.jpg", "photos/06-interior-window.jpg", "photos/07-pressure-wash.jpg", "photos/08-squeegee.jpg", "photos/09-window-pole.jpg", "photos/10-pool-deck.jpg", "photos/11-rinse.jpg", "photos/12-glass-brush.jpg", "photos/13-pole-team.jpg", "photos/14-squeegee-ladder.jpg", "photos/15-team.jpg", "photos/16-house-wash.jpg", "photos/17-window-detail.jpg", "photos/18-squeegee-storefront.jpg", "photos/19-driveway.jpg", "photos/bg-addons.jpg", "photos/bg-details-v2.jpg", "photos/bg-sent.jpg", "photos/plan-bronze-v5.jpg", "photos/plan-gold-v5.jpg", "photos/plan-silver-v5.jpg"];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

// True for the signup page: the folder this worker lives in, or its index.html.
function isHome(url) {
  var path = new URL(url).pathname, scope = new URL('./', self.location).pathname;
  return path === scope || path === scope + 'index.html';
}

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function(res) {
        // Only the signup page itself is kept as the offline copy. Other pages
        // (the referral terms, the link maker) must not replace it.
        if (res.ok && isHome(req.url)) { var copy = res.clone(); caches.open(CACHE).then(function(c) { c.put('./', copy); }); }
        return res;
      }).catch(function() { return caches.match('./'); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function(hit) {
      return hit || fetch(req).then(function(res) {
        if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function(c) { c.put(req, copy); }); }
        return res;
      });
    })
  );
});
