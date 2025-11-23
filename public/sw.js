const CACHE_NAME = "anas-fragrances-v3";
const urlsToCache = [
  "/",
  "/shop",
  "/about",
  "/contact",
  "/faq",
  "/ANAS-FRAGRANCES.ico",
  "/ANAS-FRAGRANCES.png",
];

// Install event
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return (
        response ||
        fetch(event.request).then((response) => {
          // Cache important assets (CSS, JS, images, favicons)
          if (
            response.status === 200 &&
            (event.request.destination === "script" ||
              event.request.destination === "style" ||
              event.request.destination === "image" ||
              event.request.destination === "manifest")
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
      );
    })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
