self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Zone Elite', body: event.data.text() };
  }

  const title = data.title || 'Zone Elite';
  const options = {
    body: data.body || 'Don\'t forget to complete your missions today!',
    icon: 'https://picsum.photos/seed/zone/192/192',
    badge: 'https://picsum.photos/seed/zone/72/72',
    data: data.url || '/',
    vibrate: [100, 50, 100],
    tag: 'zone-mission-reminder',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // If a window is already open, focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data || '/');
      }
    })
  );
});

// For local reminders (when the app is in background but SW is alive)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
      });
    }, delay);
  }
});
