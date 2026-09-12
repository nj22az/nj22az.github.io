# Japanese street at night

By [AFX/CGMotion 3DModel Maker](https://sketchfab.com/afx_cgmotion).

[Original model](https://sketchfab.com/3d-models/japanese-street-at-night-fb1bdcd71a5544d699379d2d13dd1171), supplied by the user. The embedded source metadata declares [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); original authorship and links remain embedded in `night-lane.glb`.

The eight approach buildings, shop signs, lights, vending machines and pavement are retained. The studio backdrop, two buildings closing the end, and the central pole/cables were removed to connect the lane to the existing Minato Izakaya and Inakaya/Sato Ramen façades. Retained geometry and UVs are unchanged. Transforms were baked and identical vertices compacted; static geometry was batched by material. Colour textures are capped at 768 pixels, emission maps at 512 pixels, and PBR detail maps at 256 pixels, using embedded JPEGs. Runtime emission follows the town's day/night cycle.

Reproduce with:

```sh
node tools/pack-dining-street.mjs /path/to/japanese_street_at_night.glb
```

`manifest.json` records the source hash, dimensions, retained/removed pieces and texture settings. The packer also generates `src/world/dining-footprints.js` from pedestrian-height parts for consistent navigation before and after the visual model loads.
