/* BPH Admin PWA v6 — network-first shell + Web Push */
const CACHE = 'bph-admin-v6';
const PRECACHE = [
  '/admin/manifest.webmanifest',
  '/admin/icon-192.png',
  '/admin/icon-512.png',
  '/admin/icon-96.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const url of PRECACHE) {
        try {
          await cache.add(url);
        } catch (_) { /* ignore */ }
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
  if (!isAdmin && request.mode !== 'navigate') return;

  // Always network-first for navigations / JS / CSS so deploys aren't sticky
  const isShell =
    request.mode === 'navigate'
    || url.pathname.startsWith('/assets/')
    || url.pathname.endsWith('.js')
    || url.pathname.endsWith('.css')
    || url.pathname === '/'
    || url.pathname === '/index.html';

  if (request.mode === 'navigate' && isAdmin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put('/admin/', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('/admin/') || caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  if (!isAdmin) return;

  if (isShell) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Icons / manifest — cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
      }
      return res;
    }))
  );
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'BPH Admin',
    body: 'New activity in your dealership inbox.',
    url: '/admin/',
    tag: 'bph-admin',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (_) {
    try {
      const text = event.data?.text();
      if (text) data.body = text;
    } catch (__) { /* ignore */ }
  }

  const options = {
    body: data.body || 'New activity in your dealership inbox.',
    icon: '/admin/icon-192.png',
    badge: '/admin/icon-96.png',
    tag: data.tag || 'bph-admin',
    renotify: true,
    data: { url: data.url || '/admin/' },
    vibrate: [120, 60, 120],
  };

  event.waitUntil(self.registration.showNotification(data.title || 'BPH Admin', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.url || '/admin/';
  const abs = new URL(target, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientsList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          await client.focus();
          if ('navigate' in client) {
            try {
              await client.navigate(abs);
            } catch (_) { /* older browsers */ }
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(abs);
      }
    })()
  );
});
