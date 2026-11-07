# Blender equipment library

Four original illustrative models: centrifugal pump, compressor/receiver, generator and temperature probe/readout. Each is an editable collection in **equipment-library.blend**, with matching GLB and rendered thumbnail. Metre units, ground at Z=0, centred around X/Y=0. The geometry is generic; it is not a manufacturer drawing, pressure design or statement about a real asset.

The source opens with the pump visible and selected. Enable another equipment collection in the Blender Outliner to edit it; hide the previous collection to inspect one assembly at a time. The assemblies share a consistent origin for export.

## Use in the app

Open **Objects**, choose **Add to inventory**, then enter the physical item's name, unique tag, location and actual source data. An existing asset has a **Visual model** selector. Visual selection changes no classification, evidence, maintenance interval, inspection date or hold. Multiple inventory records can use the same model. Existing records without a model remain supported.

## Rebuild the supplied models

Use Blender 4.2 LTS or later:

```sh
python3 maintenance-demo/blender/draw-plan.py
blender --background --threads 6 --python maintenance-demo/blender/build-equipment.py
python3 maintenance-demo/blender/prepare-web-images.py
```

The build creates the editable library, GLBs, PNG renders, geometry review and generated object-catalogue.mjs. The last command makes smaller WebP images and the app's catalogue entries. It requires Pillow. All asset files are local to this site; no rendering service or external model dependency is used by the app.

## Add a new object in Blender

1. Open the library. Create a new top-level collection with a unique lowercase name, such as `filter-unit`. Place its meshes/curves at the origin in metre units, with the lowest point at Z=0. Name meaningful components and use ordinary Principled BSDF materials.
2. Save as your edited `.blend` file. Add an entry to `catalogue.json` with `id`, `label`, `collection`, `kind: "custom"` and an illustrative `envelopeMm` [width, depth, height]. Use a lowercase ID with letters, digits or hyphens. Labels are visual descriptions, not technical specifications.
3. Export the edited collections instead of rebuilding the four source recipes:

```sh
blender --background --threads 6 --python maintenance-demo/blender/build-equipment.py -- --from-blend /absolute/path/to/edited-library.blend
python3 maintenance-demo/blender/prepare-web-images.py
node --test maintenance-demo/tests/*.test.mjs
```

4. Inspect every changed render and the exported geometry review. Confirm units, bounds, ground contact, connected components, camera framing and material/part visibility. Review actual equipment identity separately. Commit the catalogue, Blender source, exports, images and generated object-catalogue.mjs together. The new entry appears automatically in the library and asset selector; app code needs no new switch case.

Keep an independent copy of a hand-edited library: the default build reconstructs the four procedural recipes, whereas `--from-blend` preserves edited collection geometry. The exporter replaces the studio rig and saves the resulting source as equipment-library.blend. It does not turn a browser form into a CAD editor. New shapes are authored in Blender, while physical inventory items are added in the app.
