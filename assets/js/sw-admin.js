/* Service worker del panel de administración. Solo existe para dos cosas:
   1) que Chrome/Android/iOS permitan instalarlo como app en la pantalla de inicio;
   2) mostrar la notificación cuando llega un pedido nuevo por confirmar.
   No cachea nada de la tienda pública ni cambia cómo funciona el resto del sitio. */
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });

self.addEventListener('push', e => {
  let data = {};
  try{ data = e.data ? e.data.json() : {}; }catch{}
  const title = data.title || 'miperfumeria';
  const body = data.body || 'Tienes un pedido nuevo por confirmar.';
  const url = data.url || '/admin.html';
  e.waitUntil(self.registration.showNotification(title, {
    body,
    icon: '/assets/img/icons/icon-192.png',
    badge: '/assets/img/icons/icon-192.png',
    data: { url },
    tag: data.tag || 'pedido-nuevo'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/admin.html';
  e.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for(const c of clientsList){ if(c.url.includes('admin.html')){ c.focus(); return; } }
    await self.clients.openWindow(url);
  })());
});
