const CACHE_NAME = 'sentimony-pwa-v1'
const OFFLINE_URL = '/offline.html'
const PRECACHE_URLS = [
  OFFLINE_URL,
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/site.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        return cache.match(OFFLINE_URL)
      }),
    )
    return
  }

  if (request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request)
    }),
  )
})
