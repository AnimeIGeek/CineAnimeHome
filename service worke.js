self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache dinâmico para imagens externas (Postimages)
  if (url.origin.includes('i.postimg.cc')) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async cache => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());

          // Limitar o cache de imagens a 300 itens
          const keys = await cache.keys();
          if (keys.length > MAX_IMAGES) {
            console.log('🧹 Limpeza automática: Excluindo imagem mais antiga do cache...');
            await cache.delete(keys[0]);
          }

          return networkResponse;
        } catch (error) {
          console.error('❌ Erro ao carregar imagem:', error);
          return new Response('Imagem indisponível', { status: 404 });
        }
      })
    );
    return; // Para evitar que continue para o cache normal
  }

  // ✅ Aqui é exatamente onde entra o código que você perguntou:
  // Para os outros arquivos locais (HTML, CSS, JS)
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() => {
          // Se estiver offline e o recurso não estiver no cache, mostra a página offline
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
        })
      );
    })
  );
});
