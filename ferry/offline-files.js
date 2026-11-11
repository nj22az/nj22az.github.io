// What the page needs to open without a connection: read by the page (offline.js) and by its service worker (sw.js).
// A file the page loads that is not listed here is not saved: add it here when the page gains one.
self.CHISUM_OFFLINE = {
  cache: 'chisum-offline-v2',
  files: [
    '/ferry/', '/ferry/app.js', '/ferry/systems.js', '/ferry/offline.js', '/ferry/offline-files.js', '/ferry/manifest.webmanifest',
    '/ferry/data/ferry.bin.gz', '/ferry/data/systems.json', '/ferry/data/chisum-atlas.webp',
    '/ferry/icon-180.png', '/ferry/icon-192.png', '/ferry/icon-512.png',
    '/motor-90l/vendor/three.module.min.js', '/motor-90l/vendor/OrbitControls.js',
  ],
};
