// ============================================================
// Service Worker – JL Sports Club 360 (SportsHub360)
// Versión de Caché PWA: jl-sports-hub-v8
// Módulos: Cache & Offline Support + Push Notifications + App Icons & Logo
// ============================================================

const CACHE_NAME = 'jl-sports-hub-v8';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/icon.png',
  '/favicon.ico',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png'
];

// ── INSTALL ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── FETCH ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── PUSH NOTIFICATIONS ──────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'JL Sports Club 360', body: 'Actualización deportiva disponible', icon: '/logo.png' };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (_) {
    // Default fallback
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'jl-sports-update',
    renotify: true,
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── NOTIFICATIONCLICK ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
