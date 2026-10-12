// ============================================================
// Service Worker – JL Sports Club 360 (SportsHub360)
// Versión de Caché PWA: jl-sports-hub-v12
// Módulos: NetworkFirst para HTML/API/Logos + Bypass Absoluto Supabase Realtime + Desahuciado Inmediato de Caché
// ============================================================

const CACHE_NAME = 'jl-sports-hub-v12';

const STATIC_ASSETS = [
  './',
  './manifest.json',
  './logo.png',
  './icon.png',
  './favicon.ico',
  './favicon.svg',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './maskable-icon.png',
  './apple-touch-icon.png'
];

// ── 1. INSTALL: Precacheo mínimo & Skip Waiting inmediato ─────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[SW] Cache precache warning:', err);
      });
    })
  );
});

// ── 2. ACTIVATE: Purgar automáticamente todas las cachés obsoletas y tomar control de clientes ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Notificar de inmediato a todas las pestañas/clientes móviles abiertos
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', version: CACHE_NAME });
        });
      });
    })
  );
});

// Escuchar mensaje SKIP_WAITING desde los clientes para activación forzada
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── 3. FETCH: Bypass Absoluto Supabase/Realtime Directo + NetworkFirst para HTML/Vistas ────
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // BYPASS TOTAL Y NATIVO DE SUPABASE, WEBSOCKETS Y APIS
  // IMPORTANTE: NO interceptar con event.respondWith. Dejar que el navegador realice la conexión nativa con CORS
  try {
    const urlObj = new URL(url);
    if (
      urlObj.origin.includes('supabase.co') ||
      urlObj.origin.includes('supabase.in') ||
      urlObj.hostname.includes('supabase') ||
      url.includes('/rest/v1/') ||
      url.includes('/realtime/') ||
      url.includes('/api/') ||
      url.startsWith('ws:') ||
      url.startsWith('wss:')
    ) {
      return;
    }
  } catch (e) {
    if (url.includes('supabase.co') || url.includes('/realtime/')) {
      return;
    }
  }

  // Solo interceptar peticiones GET
  if (req.method !== 'GET') return;

  // ESTRATEGIA 1: NetworkFirst para Navegación / HTML (Siempre obtener la versión viva)
  if (req.mode === 'navigate' || (req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(req);
          if (cachedResponse) return cachedResponse;
          const fallback = await caches.match('./') || await caches.match('/');
          return fallback || new Response('Sin conexión a Internet', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // ESTRATEGIA 2: NetworkFirst con fallback a Caché para scripts y estilos actualizados
  if (url.includes('/_next/') || url.includes('.js') || url.includes('.css')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ESTRATEGIA 3: NetworkFirst para imágenes y logos (Garantiza que logos actualizados se muestren de inmediato en móviles)
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(req);
        if (cachedResponse) return cachedResponse;
        if (url.includes('logo.png')) {
          const fallback = (await caches.match('./logo.png')) || (await caches.match('/logo.png')) || (await caches.match('./icon.png'));
          if (fallback) return fallback;
        }
        return new Response('', { status: 404, statusText: 'Imagen no disponible sin conexión' });
      })
  );
});

// ── 4. PUSH NOTIFICATIONS ───────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'JL Sports Club 360', body: 'Marcador en vivo actualizado', icon: './logo.png' };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (_) {}

  const options = {
    body: data.body,
    icon: data.icon || './logo.png',
    badge: './pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'jl-sports-update',
    renotify: true,
    data: { url: data.url || './' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── 5. NOTIFICATION CLICK ───────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : './';

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
