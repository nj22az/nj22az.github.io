# Johansson Town resource sources

Johansson Town uses [Fasani/three-js-resources](https://github.com/Fasani/three-js-resources) as the approved discovery catalogue for external Three.js resources.

## Current use

- **Poly Haven / Texture Haven** — CC0 surface photography used for road, plaster, timber and roof materials.
- **Three.js** — rendering engine.
- **glTF / Draco references** — retained as the preferred future pipeline for compressed authored props and character assets.
- **Kenney** — approved CC0 source for future environment props where a local procedural equivalent is not preferable.

## Runtime policy

Johansson Town currently keeps street furniture and interior props local/procedural where possible. This avoids fragile remote model loading on iOS and keeps collision/interactivity deterministic. External assets should only be added when their licence is verified and their visual/technical quality exceeds the local fallback.

## Character policy

Do not use generic downloaded characters merely as palette swaps. Each resident must remain structurally individual in body proportions, wardrobe, hair silhouette and movement cadence. Imported characters must pass the same stability checks before replacing a local rig.
