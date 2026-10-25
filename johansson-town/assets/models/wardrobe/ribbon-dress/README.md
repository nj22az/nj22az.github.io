# Thao's ribbon dress and side-part waves

Original Blender assets for the shared Johansson avatar system, 25 October 2026.

- `ribbon-dress.blend`: editable separate garment pieces in documented fitting coordinates.
- `sidepart-waves.blend`: editable crown, side part, swept ridges, continuous rear curtain and face-framing waves, in head-radius coordinates.
- `Thao-ribbon-dress.blend`: complete, metre-scale Thao with the actual shared skeleton, weights and packed face textures. Neutral pose; no earrings. The floor, camera and studio lights are preview fixtures.

The photograph supplies the upper garment: pale pink, wide straps, fitted bodice, eyelet ribbon band and a black bow. Its hem is outside the image. The matching short A-line skirt and concealed back are original completion choices, not claimed photographic reconstruction. Long, dark side-parted waves follow the reference's general silhouette while retaining Thao's cartoon identity.

Build from the repository root with Blender 4.5:

```sh
blender -b --python johansson-town/tools/blender/build-ribbon-dress.py
blender -b --python johansson-town/tools/blender/build-sidepart-waves.py
TOWN_CANVAS_MODULE=/path/to/node_modules/@napi-rs/canvas node johansson-town/tools/export-thao-review.mjs /absolute/repo/johansson-town/docs/qa/thao-dress
blender -b --python johansson-town/tools/blender/render-thao-dress.py
```

The native canvas module is an authoring dependency only, not an application dependency. The last two commands regenerate intermediate mesh JSON and texture PNGs, the complete editable model, a portable rigged GLB and the Blender review renders. Intermediate full JSON/GLB are reproducible and need not be committed.

The game reads the evaluated Blender topology from `src/avatars/ribbon-dress-data.js` and `sidepart-waves-data.js`. `ribbon-dress.js` fits the bodice/flat straps to each wearer's torso; the matching skirt uses the existing drape, hem and cloth-clearance path. Hair uses the shared head and secondary-motion bones. There is no new character engine, cloth solver or visitor Blender dependency.

Creator: Top → **Ribbon dress bodice**; Outfit sets → **Pink ribbon dress**; Hair → **Long side-part waves**. The new garments and hair are shared choices; Thao wears this combination by default in this development integration. Existing personalised looks are retained.
