// The ferry page's service worker: it lets the page open without a connection once it has been saved (offline.js).
//
// With a connection the page is always the newest: every request goes to the network first, and what comes back also
// renews the saved copy. Only when the network does not answer (no connection, or none within four seconds and a saved
// copy is there) is the saved copy given. A query on the address (?t=…) is ignored when a saved file is looked for.
importScripts('./offline-files.js');
const { cache: CACHE, files: FILES } = self.CHISUM_OFFLINE;
const LISTED = new Set(FILES);

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const name of await caches.keys()) if (name.startsWith('chisum-offline-') && name !== CACHE) await caches.delete(name);
  await self.clients.claim();
})()));

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin || !LISTED.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = url.origin + url.pathname;
    const saved = await cache.match(key);
    const fresh = fetch(request).then(response => {
      if (response.ok && saved) cache.put(key, response.clone());      // a saved copy is kept up to date; nothing is saved unasked
      return response;
    });
    if (!saved) return fresh;
    const late = new Promise(resolve => setTimeout(() => resolve(saved), 4000));
    return Promise.race([fresh.catch(() => saved), late]);
  })());
});
