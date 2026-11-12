// What the page needs to open without a connection: read by the page (offline.js) and by its service worker (sw.js).
// A file the page loads that is not listed here is not saved: add it here when the page gains one.
self.CHISUM_OFFLINE = {
  cache: 'chisum-offline-v4',
  files: [
    '/ferry/', '/ferry/app.js', '/ferry/systems.js', '/ferry/look.js', '/ferry/offline.js', '/ferry/offline-files.js', '/ferry/manifest.webmanifest',
    '/ferry/data/ferry.bin.gz', '/ferry/data/light.bin.gz', '/ferry/data/systems.json', '/ferry/data/chisum-atlas.webp',
    '/ferry/icon-180.png', '/ferry/icon-192.png', '/ferry/icon-512.png',
    '/motor-90l/vendor/three.module.min.js', '/motor-90l/vendor/OrbitControls.js',
    // what look.js draws a frame with (three.js r170 add-ons, unchanged)
    '/ferry/vendor/three/postprocessing/EffectComposer.js', '/ferry/vendor/three/postprocessing/RenderPass.js', '/ferry/vendor/three/postprocessing/ShaderPass.js',
    '/ferry/vendor/three/postprocessing/MaskPass.js', '/ferry/vendor/three/postprocessing/Pass.js', '/ferry/vendor/three/postprocessing/OutputPass.js',
    '/ferry/vendor/three/postprocessing/GTAOPass.js', '/ferry/vendor/three/shaders/CopyShader.js', '/ferry/vendor/three/shaders/OutputShader.js',
    '/ferry/vendor/three/shaders/GTAOShader.js', '/ferry/vendor/three/shaders/PoissonDenoiseShader.js', '/ferry/vendor/three/math/SimplexNoise.js',
    '/ferry/vendor/three/postprocessing/UnrealBloomPass.js', '/ferry/vendor/three/shaders/LuminosityHighPassShader.js',
  ],
};
