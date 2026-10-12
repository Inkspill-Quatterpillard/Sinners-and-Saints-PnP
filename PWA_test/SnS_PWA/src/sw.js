self.addEventListener('install', event => {
  self.skipWaiting(); // Activate the new service worker immediately
});

self.addEventListener('activate', event => {
  clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', event => {
  // ...existing fetch handling logic if any...
});
