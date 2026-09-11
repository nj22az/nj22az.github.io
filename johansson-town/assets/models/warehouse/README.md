# Old Warehouse

"Old Warehouse" by [aswin.baskaran](https://sketchfab.com/aswin4550), supplied by the user as `old_warehouse.glb`.

- Source: https://sketchfab.com/3d-models/old-warehouse-5ca553c34c524a85b3d72ce64da95e41
- Licence recorded in the supplied asset: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Changes: removed the detached presentation ground plane; merged geometry by original material; capped textures at 1024 pixels and recompressed photographic maps. Building details, UVs, awning, ladder, pipes and loading props are retained. Source metadata is also embedded in the GLB and recorded in `manifest.json`.
- Runtime placement: western harbour shed, facing the main street, with a separate concrete footing, warehouse signs and stable collision. The unobstructed northern street door opens the dedicated fishing-gear interior at all hours; its exit returns to the same western-quay doorway.

Rebuild with `python tools/pack-warehouse.py /path/to/old_warehouse.glb` from `johansson-town` (NumPy and Pillow).
