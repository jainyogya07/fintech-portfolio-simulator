/**
 * Service Worker Cleaner
 * This replaces the previous SW to unregister it and clean up caches
 */

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    console.log('[SW Cleaning] Deleting cache:', name);
                    return caches.delete(name);
                })
            );
        })
    );
    self.registration.unregister();
    self.clients.claim();
});
