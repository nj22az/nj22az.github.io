# Private course entrance

The homepage uses a 16 KB transparent WebP rendered from Johansson World’s original Johansson rig and `Shush` animation pose. The course URL still requires sign-in.

To reproduce from the recorded source commit, install `@napi-rs/canvas` (or set `CANVAS_MODULE` to its module path), Blender 4.5.3 and Python Pillow. Run from the repository root:

```sh
node tools/private-course-link/pose-johansson.mjs
blender -b --python tools/private-course-link/render-whisper.py -- "$PWD"
python tools/private-course-link/finish-whisper.py
```

The render script keeps a packed, editable `.blend` locally. Generated GLB, Blender and PNG intermediates are ignored; the source recipe, scripts, provenance and final WebP are versioned. No game runtime is loaded for this homepage link.
