# Johansson Town resource sources

Johansson Town uses [Fasani/three-js-resources](https://github.com/Fasani/three-js-resources) as the approved discovery catalogue for external Three.js resources.

## Current live use

- **Poly Haven / Texture Haven** — CC0 asphalt, plaster, timber and roof photography is stored locally in `assets/` and used by the environment/prop pipeline.
- **Three.js** — rendering engine.
- **`resource-catalog.js`** — records provenance, licence and runtime policy for sourced assets.
- **`prop-factory.js`** — creates deterministic interactive street and harbour props while applying the locally stored sourced textures.
- **glTF / Draco references** — preferred future pipeline for compressed authored props.

## Approved curated model sources

- **Quaternius Sushi Restaurant Kit (CC0)** — approved for individual Japanese interior props after scale, style and performance validation.
- **Quaternius Universal Base Characters / Universal Animation Library 2 (CC0)** — approved only for a future controlled character/animation pipeline; they must not replace the stable cast until retargeting and visual validation pass.
- **Kenney** — approved CC0 source for environment props where a local procedural equivalent is not preferable.

See `assets/late-showa/ASSETS.md` for the detailed intake rules and reference-only sources.

## Runtime policy

Johansson Town does **not** hot-link third-party model hosts. Runtime assets must be served locally from this repository. Important gameplay props keep deterministic procedural geometry, collision and interaction anchors so the game remains functional if a future authored replacement is removed or fails validation.

The current resource-backed prop layer includes benches, postbox, newspaper rack, delivery trolley, harbour notice board, utility cabinet, bicycle rack, convex traffic mirror, exterior air-conditioning units, noren, awnings, crate stacks, bait station, pier winch and ramen menu board.

## Character policy

Do not use generic downloaded characters merely as palette swaps. Each resident must remain structurally individual in body proportions, wardrobe, hair silhouette and movement cadence. Imported characters must pass the same stability checks before replacing a local rig.
