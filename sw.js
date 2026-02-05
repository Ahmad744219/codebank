const CACHE_NAME = "v15.2.1"; // Change version when updating

self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                "/",
                "/index.html",
                "/calc.html",
                "/logo.png",
                "/m.jpg",
                "/icons/manifest-icon-192.maskable.png",
                "/icons/manifest-icon-512.maskable.png",
            ]);
        })
    );
    self.skipWaiting(); // Forces the new service worker to activate immediately
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activating...");
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log(`Deleting old cache: ${key}`); // ✅ fixed
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Ensures all pages use the new service worker
});


// ✅ Add this fetch event listener BELOW activate
self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone()); // Update cache with latest response
                    return response;
                });
            })
            .catch(() => caches.match(event.request)) // Use cache if offline
    );
});