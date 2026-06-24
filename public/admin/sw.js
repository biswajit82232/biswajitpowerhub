/* BPH Admin PWA v3 — icons + installable manifest */
const CACHE = 'bph-admin-v3';
const PRECACHE = [
  '/',
  '/admin/',
  '/admin/manifest.webmanifest',
  '/admin/icon-192.png',
  '/admin/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const url of PRECACHE) {
        try {
          await cache.add(url);
        } catch (_) { /* dev server may differ */ }
      }
      await self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isAdmin = url.pathname === '/admin' || url.pathname.startsWith('/admin/');

  // Navigation under /admin — SPA shell (required for installable PWA)
  if (request.mode === 'navigate' && isAdmin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  if (!isAdmin) return;

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
