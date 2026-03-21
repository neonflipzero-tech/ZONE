self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Zone Reminder';
  const options = {
    body: data.body || 'Don\'t forget to complete your missions today!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.url || '/'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
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
