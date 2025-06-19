// ================================================
// CineAnime - Service Worker com Limite de Cache de Imagens
// ================================================

const CACHE_NAME = 'cineanime-v4';  // Mude o número da versão sempre que atualizar
const IMAGE_CACHE_NAME = 'anime-images-cache';
const MAX_IMAGES = 300;  // Limite máximo de imagens no cache

// Arquivos locais que vão pro cache fixo (HTML, CSS, JS)
const ASSETS_TO_CACHE = [
  './',
  './CineAnimeHome.html',
  './estilo.css',
  './script.js'
  // Adicione aqui se tiver mais arquivos locais
];

// Instalação do Service Worker - Faz cache dos arquivos principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Fazendo cache inicial dos arquivos fixos...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ativação do Service Worker - Limpa caches antigos se tiver
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== IMAGE_CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Intercepta todas as requisições da página
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Se for imagem do Postimages
  if (url.origin.includes('i.postimg.cc')) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async cache => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // Já tem no cache, retorna do cache
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());

          // Limite de imagens no cache (máximo 300)
          const keys = await cache.keys();
          if (keys.length > MAX_IMAGES) {
            console.log('🧹 Limpando imagem mais antiga do cache de imagens...');
            await cache.delete(keys[0]);  // Remove a imagem mais antiga
          }

          return networkResponse;
        } catch (error) {
          console.error('❌ Erro ao buscar imagem:', error);
          // Opcional: Retorna uma imagem de placeholder se quiser
          // return caches.match('./imgs/placeholder.jpg');
          return new Response('Imagem não disponível', { status: 404 });
        }
      })
    );
    return; // Evita que o fetch continue para outras regras
  }

  // Para todos os outros arquivos locais (HTML, CSS, JS)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
