# Johansson Town — Harbour Edition

An original, explorable 1988 Japanese harbour neighbourhood inspired by the grounded everyday atmosphere of late-1980s Japan and classic street-level adventure games. It retains all eight existing project destinations and their interiors.

## Play

- Desktop: click the scene for mouse look; WASD/arrows move, Shift jogs, E interacts, Q opens the directory, B opens the notebook, V changes camera, N changes time. Escape releases the mouse or closes a panel.
- Touch: left side moves, right side looks; use INTERACT and the bottom controls. iPhone full-screen standalone mode uses Share → Add to Home Screen.
- Talk to Aiko to start the Tama errand. Fish at the harbour, sell catches to the harbour master, play Star Port, buy drinks, order ramen, use the phone, or visit the shrine.
- The notebook, money, items, visited shops and quest progress save on the current device. Clearing browser data removes this save.
- The bus stop is a readable timetable; buses and interiors beyond the eight project buildings are not simulated.

## Characters

The live game now uses original procedural human-proportioned residents instead of the previous Kenney Mini Character layer. The player, Aiko, Kenji, Mrs Sato and the harbour master have separate heights, builds, ages, clothing palettes, hairstyles and silhouettes. Faces, hands, layered clothing, shoes, collars and individual hair shapes are modelled from local Three.js geometry.

Walking, jogging, breathing, head movement and conversational gestures are animated procedurally. Characters are created synchronously, so there is no delayed GLB model swap, skeleton cloning or character pop-in during play. Legacy Kenney CC0 files remain in `assets/characters/` only for licence/history reference and are not loaded by the current character system.

## Assets and rendering

Four local 1K CC0 Poly Haven diffuse textures provide road, plaster, timber and roofing surfaces. These free public-domain materials remain the principal external visual assets; original buildings, props and scenery use instanced geometry.

`preflight.js` raises touch-device rendering resolution conservatively and requests hardware antialiasing before the existing Three.js renderer is created. Larger tablets target up to 1.6 device-pixel ratio, smaller touch devices up to 1.35, and desktop up to 2. The UI polish layer removes the previous scanline treatment and keeps a restrained vignette, improving clarity without changing gameplay or collision logic.

Day/evening/night, rain, four camera views and a live minimap remain available. No external asset host is required at runtime. Three.js r169 is served from this repository.

Credits and original licences: `assets/ATTRIBUTION.md`, `assets/characters/ATTRIBUTION.md`, `assets/characters/LICENSE-KENNEY.txt`, `vendor/LICENSE-THREE.txt`. Source manifests retain original download details; the four Poly Haven textures have been renamed locally to asphalt.jpg, plaster.jpg, timber.jpg and roof.jpg.

## Validation

New character and preflight modules were syntax-checked before commit. Existing gameplay, collision, activities and world geometry remain isolated from the character replacement. The entry point cache-busts the new renderer/UI revision and remaps the previous character module URL to the current human-character revision.
