const CACHE_NAME = "form-3d-studio-v1";
const ROOT = new URL("./", self.location.href);
const CORE = [
  ROOT.href,
  new URL("manifest.webmanifest", ROOT).href,
  new URL("form-icon.svg", ROOT).href,
];

async function cacheApplicationShell() {
  const cache = await caches.open(CACHE_NAME);
  const page = await fetch(ROOT.href, { cache: "reload" });
  if (page.ok) {
    const clone = page.clone();
    await cache.put(ROOT.href, clone);
    const html = await page.text();
    const assetUrls = new Set(CORE);
    const matcher = /(?:src|href)=["']([^"'#]+)["']/g;
    let match;
    while ((match = matcher.exec(html))) {
      try {
        const asset = new URL(match[1], ROOT);
        if (asset.origin === ROOT.origin) assetUrls.add(asset.href);
      } catch {
        // Ignore malformed or unsupported document links.
      }
    }
    await Promise.allSettled(
      [...assetUrls].map(async (url) => {
        const response = await fetch(url, { cache: "reload" });
        if (response.ok) await cache.put(url, response);
      }),
    );
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheApplicationShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== ROOT.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(ROOT.href, response.clone());
          }
          return response;
        })
        .catch(async () => (await caches.match(ROOT.href)) || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      });
    }),
  );
});
