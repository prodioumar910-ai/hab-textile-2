// Clean Service Worker Uninstaller to prevent cache corruption & "Load failed" errors
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames.map((c) => caches.delete(c))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

