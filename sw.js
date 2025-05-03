const CACHE_NAME = 'flappy-fish-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/assets/fish.png',
  '/assets/pipe-top.png',
  '/assets/pipe-bottom.png',
  '/assets/background.png',
  '/assets/splash.mp3',
  '/assets/point.mp3',
  '/assets/flap.mp3',
  '/assets/background-music.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});