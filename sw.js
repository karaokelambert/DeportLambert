const CACHE_NAME = 'jl-sports-hub-v3';

// Solo cachear assets estáticos de terceros y shell de la app
// El HTML principal y manifest se pre-cachean para instalación offline ultra-rápida
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Dejar pasar sin interceptar: Supabase, WebSockets, y peticiones no-GET
  if (
    url.includes('supabase') ||
    url.includes('realtime') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Para el HTML principal (index.html y raíz): Network-First siempre
  // Esto garantiza que la PC y el teléfono siempre vean los datos más recientes
  const isMainApp = url.endsWith('/') || url.includes('index.html');
  if (isMainApp) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Actualizar caché con la versión más reciente
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)) // Fallback al caché si no hay red
    );
    return;
  }

  // Para assets estáticos de terceros (CDN): Cache-First para rendimiento
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
