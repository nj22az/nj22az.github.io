const CACHE_NAME = "form-3d-studio-v22";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css?v=15",
  "./open-models.js?v=8",
  "./monochrome-svg.js?v=13",
  "./image-to-svg/keychain-bridge.js?v=2",
  "./image-to-svg/?embed=1",
  "./image-to-svg/index.html",
  "./image-to-svg/styles.css?v=2",
  "./image-to-svg/app.js?v=3",
  "./image-to-svg/vector-worker.js",
  "./image-to-svg/vtracer_wasm_bg.wasm",
  "./image-to-svg/POTRACE-GPL-2.0.txt",
  "./cover-latch-geometry.js?v=1",
  "./app.js?v=18",
  "./form-icon.svg",
  "./manifest.webmanifest"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    return cache.addAll(APP_FILES);
  }).then(function () {
    return self.skipWaiting();
  }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.startsWith("form-3d-studio-") && key !== CACHE_NAME;
    }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/form-3d-studio/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) { return cached || caches.match("./"); });
    }));
    return;
  }

  event.respondWith(caches.match(event.request).then(function (cached) {
    if (cached) return cached;
    return fetch(event.request).then(function (response) {
      if (response.ok) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      }
      return response;
    });
  }));
});
