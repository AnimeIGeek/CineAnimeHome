// ============================================
// CineAnime - Service Worker com Runtime Cache para imagens externas
// ============================================

const CACHE_NAME = 'cineanime-v3';  // Mude a versão sempre que alterar o cache fixo
const ASSETS_TO_CACHE = [
  './',
  './CineAnimeHome.html',
  './estilo.css',
  './script.js'
  // Se você tiver arquivos locais de imagens, pode adicionar aqui
];

// Instala o Service Worker e faz o cache inicial (HTML, CSS, JS local)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Cache inicial sendo feito...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativa o Service Worker e remove caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Intercepta todas as requisições
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Se for uma imagem externa do Postimages
  if (url.origin.includes('i.postimg.cc')) {
    event.respondWith(
      caches.open('anime-images-cache').then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            // Se já tiver no cache, retorna do cache
            return response;
          }
          // Se não tiver, busca da internet, guarda e devolve
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // Em caso de erro (ex: offline e sem cache), pode devolver uma imagem padrão se quiser
            return caches.match('./imgs/placeholder.jpg');
          });
        });
      })
    );
    return; // Para não cair no cache padrão
  }

  // Para todos os outros arquivos (HTML, CSS, JS locais)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
