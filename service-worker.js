const CACHE_NAME = 'casa-jasmim-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/BG.jpg',
  '/Jasmim.jpg',
  '/1.jpg','/2.jpg','/3.jpg','/4.jpg','/5.jpg','/6.jpg',
  '/7.jpg','/8.jpg','/9.jpg','/10.jpg','/11.jpg','/12.jpg'
];

// Instala e faz cache dos ativos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// Intercepta requisições: responde do cache ou faz fetch e atualiza cache
self.addEventListener('fetch', event => {
  const req = event.request;
  // Apenas GET
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(networkRes => {
        // opcional: cachear imagens e documentos estáticos
        if (networkRes && networkRes.status === 200 && req.url.startsWith(self.location.origin)) {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return networkRes;
      }).catch(() => {
        // fallback simples: se for imagem, retornar uma imagem placeholder (opcional)
        if (req.destination === 'image') {
          return caches.match('/Jasmim.jpg');
        }
      });
    })
  );
});
