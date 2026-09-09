# Japanese Town — complete supplied overworld

Author: [Nazareno_rojas](https://sketchfab.com/Nazareno_rojas).
Source: [Japanese Town](https://sketchfab.com/3d-models/japanese-town-6f58f3bdef404321b8850aab870e110f).
Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), from the embedded source metadata.

The complete user-supplied scene is retained: all 1,230 pieces and 96,308 triangles, including the original buildings, canal, bridge, roads, vegetation and props. Original transforms are baked; the main pavement is moved to height zero. Four material batches share compressed embedded textures, resized to 1,024 pixels. Foliage uses alpha cut-outs. No buildings are extracted or rearranged in this version.

Johansson Town adds gameplay entrances, residents, navigation, signs and an adjoining quay connecting the previously supplied park. The original 41 MB upload is not modified. The runtime GLB is 7.4 MB. The packing script requires Node.js and Python with Pillow; run `node tools/pack-full-town.mjs /path/to/japanese_town.glb` from the game directory.

## Street-clearance adaptation (9 September 2026)

The stored GLB above remains unchanged. At runtime, a reproducible index mask hides 2,332 small-prop triangles and removes their 40 collision entries before cloning the city into two adjoining quarters. The two copies share the cleaned geometry and original materials/textures. Original buildings, all 15 annotated doors, road surfaces, canal and bridge are retained. The second quarter is translated 44 metres east and joined by a 4.5-metre paved connection. The harbour walk is also 4.5 metres wide, with activity props moved to its outer edge. Navigation and the visitor map use the same two section offsets.

Run `node tools/prepare-street-clearance.mjs` to regenerate `street-clearance.json` from the packed GLB and navigation data. The mask removes whole connected components contained in small-prop collision boxes, never triangles cut out of a larger floor or wall. Annotated doors are explicitly excluded. All clearance entries validate before any geometry changes are applied.

Validation: `npm test` passes 77 tests, including the complete game smoke, both bridges and canals, original shop entrances, resident routes, touch sprint, the clear connector and quay lane, shared geometry, and both map sections. Browser/WebGL visual verification was unavailable in the editing environment; no frame-rate claim is made.
