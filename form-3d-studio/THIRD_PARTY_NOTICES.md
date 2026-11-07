# Third-party notices

## JSCAD

Form 3D Studio includes a browser bundle built from `@jscad/modeling` 2.13.0.

- Project: https://github.com/jscad/OpenJSCAD.org
- Licence: MIT
- Copyright: JSCAD contributors

The MIT licence permits use, copying, modification, distribution, sublicensing,
and sale, provided the copyright and permission notice are retained. The full
upstream licence text is retained at `vendor/JSCAD-LICENSE.txt`.

The parametric recipes in `src/open-models.mjs` are original Form 3D Studio
code, released under the MIT licence in `OPEN_MODELS_LICENSE.txt`. They remain
visible in this public repository so the bundled models are inspectable,
reusable, and reproducible.

## Image → SVG Studio

The client-side vector studio contains the following open-source components:

- VTracer (`@visioncortex/vtracer` 1.0.0-alpha.3), MIT OR Apache-2.0: https://github.com/visioncortex/vtracer
- Potrace (`esm-potrace-wasm` 0.5.0), GPL-2.0: https://github.com/tomayac/esm-potrace-wasm
- ImageTracer.js 1.2.6, Unlicense: https://github.com/jankovicsandras/imagetracerjs
- SVGO 4.0.2, MIT: https://github.com/svg/svgo
- fflate 0.8.3, MIT: https://github.com/101arrowz/fflate

Attributions are retained in the generated worker banner and package lock. The
browser application performs no remote processing; these libraries execute on
the visitor's device.
