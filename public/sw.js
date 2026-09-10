// Toku POS Service Worker
const CACHE_NAME = 'toku-pos-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/pesanan';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Push notification event listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Pesanan Baru Masuk - Toku POS';
    const options = {
      body: data.body || 'Ada pesanan baru siap disiapkan.',
      icon: data.icon || '/favicon/favicon-96x96.png',
      badge: data.badge || '/favicon/favicon-96x96.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: data.tag || 'new-order',
      renotify: true,
      data: {
        url: data.url || '/pesanan',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});
