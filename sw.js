/**
 * MediOnTime Web App Service Worker
 * Handles Web Push notifications and notification click actions
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Web Push notification events
self.addEventListener('push', (event) => {
  let title = '약챙겨먹기 알림';
  let body = '약 챙겨드실 시간입니다!';
  let clickUrl = '/';

  if (event.data) {
    try {
      const json = event.data.json();
      title = json.title || title;
      body = json.message || json.body || body;
      clickUrl = json.click || json.url || clickUrl;
    } catch (e) {
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: '/apple-touch-icon.png',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: clickUrl },
    tag: 'mediontime-alarm-' + Date.now(),
    renotify: true,
    actions: [
      { action: 'open', title: '약챙겨먹기 열기' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
