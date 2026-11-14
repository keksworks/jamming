// Network-first for pages, cache-first for hashed assets, so that the app opens even with a flaky connection
const cacheName = 'jamming'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  if (e.request.method != 'GET' || url.origin != location.origin || /^\/(api|oauth)\//.test(url.pathname)) return
  e.respondWith(caches.open(cacheName).then(async cache => {
    if (url.pathname.startsWith('/assets/')) return await cache.match(e.request) ?? fetchAndCache(cache, e.request)
    return fetchAndCache(cache, e.request).catch(async () => await cache.match(e.request) ?? cache.match('/'))
  }))
})

async function fetchAndCache(cache, request) {
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}
