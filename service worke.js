// ============================================
// CineAnime - Service Worker (Cache Básico)
// Este código vai armazenar os arquivos principais no cache do navegador.
// ============================================

// Nome da versão do cache (se mudar algo nos arquivos, aumente esse número)
const CACHE_NAME = 'cineanime-v1';

// Lista de arquivos que vamos guardar no cache
const ASSETS_TO_CACHE = [
  './', // Página principal
  './CineAnimeHome.html',
  './estilo.css',          // Exemplo: seu arquivo CSS
  './script.js',           // Exemplo: seu arquivo JS
  './imgs/anime1.jpg',     // Exemplo: suas imagens
  './imgs/anime2.jpg',
  './imgs/anime3.jpg',
  './imgs/anime4.jpg'
  // Adicione aqui o caminho de outras imagens e arquivos que quiser cachear
];

// Instala o Service Worker e faz o cache inicial
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Cache inicializado com sucesso!');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativa o Service Worker (limpa caches antigos, se tiver)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Intercepta requisições e serve os arquivos do cache quando possível
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});