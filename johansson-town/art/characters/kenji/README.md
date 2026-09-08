# Kenji — Blender-authored resident

`kenji.blend` is the editable, packed Blender 4.2 LTS scene: anatomical body, fitted shirt/jeans, hair, eyes, eyebrows, shoes, skeleton, six original actions and a CPU render studio. Mesh reduction stays non-destructive in this source. `kenji-full.png`, `kenji-face.png` and `kenji-walk.png` are actual renders of the reduced export geometry, not generated concept images or game screenshots.

The game loads `assets/characters/realistic/kenji.glb` for Kenji. All texture pixels, meshes and animation clips are embedded. Other residents still use the existing interim bases. Missing Kenji data falls back to the local worker body, then the existing procedural fallback. The new model bypasses the old vertex-colour wardrobe and normal-smoothing conversion.

## Reproduce

Install Blender 4.2 LTS, obtain the MPFB source revision and MakeHuman CC0 system asset pack recorded in `assets/characters/realistic/provenance.json`, then extract both locally. From the game directory:

```sh
blender -b --factory-startup -t 4 --python tools/blender/build-resident.py -- --mpfb /path/to/mpfb/src/mpfb --assets /path/to/system-assets --root "$PWD"
blender -b --factory-startup -t 4 --python tools/blender/export-resident.py -- --root "$PWD"
```

The first script fits and masks the anatomical base; the second creates portable PBR materials, trims overlapping sock cuffs, authors original animation, reduces geometry, embeds texture data and renders reviews. Temporary source/review files and Blender backup files are ignored by git; the final packed source is tracked. The asset pack and add-on are authoring dependencies and are not runtime downloads.

The animation is an original scripted first pass, not motion capture. It needs further walk-cycle and gesture polish. The renders establish anatomical proportions, material detail and export integrity; they do not demonstrate browser frame rate or final game lighting. The remaining cast and city still need substantial art work to reach the requested reference quality.

## Validation

`npm test` parses the six local bases, clones independent skeletons, drives Kenji through every exported action at multiple times and samples deformed vertices for invalid positions or exploding limbs. Texture decoding is stubbed in this CPU test; actual texture appearance is checked in the Blender renders. `npm run build` validates the module build. Browser WebGL/device performance validation remains outstanding in this environment.

Exact mesh counts, texture dimensions and file size are in `export-report.json`. The licence ledger includes the original CC0 terms and hashes of the selected source files. No Shenmue or Yakuza model, logo or texture is distributed.
