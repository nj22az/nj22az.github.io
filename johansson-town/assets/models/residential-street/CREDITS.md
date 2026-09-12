# Stylized Little Japanese Town Street

By [Michał Solarek](https://sketchfab.com/misiek13).

[Original model](https://sketchfab.com/3d-models/stylized-little-japanese-town-street-200fc33b8a2b4da98e71590feeb255a8), supplied by the user. The embedded source metadata declares [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Original authorship and source links are retained in the runtime GLB.

Changes: baked scene transforms at a uniform scale of 0.015; aligned the street with the town ground; simplified meshes with an 18 mm error bound; quantised positions and normals; reduced base-colour textures to 1024 pixels and PBR detail textures to 512 pixels with JPEG compression. All seven buildings, the canal, bridge, plants and street details remain in the scene. No external decoder or texture host is required.

`willow-street.glb` replaces the repeated Willow Alley homes. Its original doors serve the residents' shared entrances; the book and flower shops retain their authored appearances. The original file is unchanged.

Reproduce with:

```sh
node tools/pack-residential-street.mjs /path/to/stylized_little_japanese_town_street.glb
```

`manifest.json` records the source SHA-256, geometry measurements and optimisation settings. The same tool generates the bridge height profile in `src/world/residential-surface.js` for player and resident navigation.
