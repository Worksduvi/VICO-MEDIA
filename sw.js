// HEMOS CAMBIADO A V6 PARA FORZAR LA ACTUALIZACIÓN
const CACHE_NAME = "vicomedia-v6";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png",
  "https://unpkg.com/lucide@latest",
  "https://cdn.jsdelivr.net/npm/hls.js@latest",
  "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400&display=swap"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // Obliga a instalar inmediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim(); // Obliga a tomar el control inmediatamente
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
