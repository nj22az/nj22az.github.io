# Nishi seawall portrait overlook

Owner-approved option A, JW-PH-001 revision C. The source-reviewed concept is implemented on `development`, opt-in with `?seawall-photo`.

## Use

Open `/johansson-town/?seawall-photo`. In Photo Studio choose **Places > Nishi seawall portrait**. Alternatively walk to the landward verge beside Gran Higa's garden (X -35.30, Z -6.65) and choose **Take a seawall portrait**. The preset sets a square frame and the reference camera; the existing cast, poses and PNG export remain editable. Close Photo Studio to return to the original player position.

## Build assets

From `johansson-town/`:

```sh
blender -b --factory-startup --python tools/blender/build-seawall-photo.py
npm run build:runtime
NODE_OPTIONS=--max-old-space-size=6144 node tools/ci-guard.mjs
```

- `design.json`: editable corrected CAD dimensions in world metres.
- `cad-rev-c.svg`: readable corrected plan. The historical concept PDF is revision A; its camera-right basis is superseded by C.
- `Nishi_Photo_Overlook.blend`: editable original Blender model, metric units and reference camera.
- `../../assets/models/harbour/nishi-photo-overlook.glb`: portable standalone asset.
- `../../src/world/seawall-photo-mesh.js`: actual evaluated Blender triangles/normals, grouped by material, read synchronously only when the prototype flag is on.
- `game-review/`: six actual compiled-game captures and two browser reports, including the clean 1200 x 1200 PNG export.

The runtime deck is drawn once by the shared ground-plan builder at +40 mm; the Blender preview's matching slab is deliberately omitted from the runtime mesh. The model adds 5,594 triangles in six material meshes. All ordinary-world geometry and collisions retain their previous paths with the prototype flag off.

## Reference scope

This delivers the place and framing. The reference photograph's dress, shawl and straw hat are not new wardrobe assets in this implementation. Screenshot Thuận uses her existing shared character and outfit. The pier is a usable public lookout with a level entrance; it does not change the working ferry or cargo berths.

See `AUDIT.md` and the linked repository handover for checks actually run and device limits.
