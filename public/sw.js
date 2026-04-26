const CACHE_NAME = 'zone-elite-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/privacy.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and Firebase/external API calls that shouldn't be cached
  if (request.method !== 'GET' || 
      url.hostname.includes('firestore.googleapis.com') || 
      url.hostname.includes('identitytoolkit.googleapis.com')) {
    return;
  }

  // Navigation requests: Network First, falling back to Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Other requests: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        // Only cache successful responses from our own origin or specific CDNs
        if (networkResponse.ok && (
          url.origin === self.location.origin || 
          url.hostname.includes('fonts.googleapis.com') || 
          url.hostname.includes('fonts.gstatic.com') ||
          url.hostname.includes('picsum.photos')
        )) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails, we already returned cachedResponse if it exists
      });

      return cachedResponse || fetchPromise;
    })
  );
});

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
  console.log('[Service Worker] Notification click Received.', event.notification.data);
  event.notification.close();

  // Get the target URL, ensuring it's an absolute URL
  const targetUrl = new URL(event.notification.data || '/', self.location.origin).href;
  console.log('[Service Worker] Target URL:', targetUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      console.log('[Service Worker] Found clients:', windowClients.length);
      
      // Check if there is already a window open with the target URL or any app window
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        console.log('[Service Worker] Checking client:', client.url);
        
        // If the client URL starts with our origin, it's our app
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          console.log('[Service Worker] Focusing existing app client');
          // If we have a specific sub-path, navigate to it
          if (event.notification.data && event.notification.data !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        console.log('[Service Worker] Opening new window for:', targetUrl);
        return clients.openWindow(targetUrl);
      }
    }).catch(error => {
      console.error('[Service Worker] Error in notificationclick:', error);
    })
  );
});

// For local reminders (when the app is in background but SW is alive)
const scheduledNotifications = new Map();

self.addEventListener('message', (event) => {
  console.log('Service Worker: Received message', event.data);
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay, tag } = event.data;
    console.log(`Service Worker: Scheduling notification "${title}" in ${delay}ms with tag ${tag}`);
    
    // Cancel existing notification with same tag if any
    if (tag && scheduledNotifications.has(tag)) {
      clearTimeout(scheduledNotifications.get(tag));
    }

    const timeoutId = setTimeout(() => {
      console.log(`Service Worker: Showing scheduled notification "${title}"`);
      self.registration.showNotification(title, {
        body: body,
        icon: 'https://picsum.photos/seed/zone/192/192',
        badge: 'https://picsum.photos/seed/zone/72/72',
        tag: tag || 'scheduled-notification',
        vibrate: [100, 50, 100],
        data: '/',
        requireInteraction: true
      });
      if (tag) scheduledNotifications.delete(tag);
    }, delay);

    if (tag) scheduledNotifications.set(tag, timeoutId);
  }

  if (event.data && event.data.type === 'CANCEL_NOTIFICATION') {
    const { tag } = event.data;
    if (tag && scheduledNotifications.has(tag)) {
      console.log(`Service Worker: Cancelling notification with tag ${tag}`);
      clearTimeout(scheduledNotifications.get(tag));
      scheduledNotifications.delete(tag);
    }
  }
});
