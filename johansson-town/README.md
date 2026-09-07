# Johansson Town — Harbour Edition

An original, explorable 1988 Japanese harbour neighbourhood inspired by the grounded everyday atmosphere of late-1980s Japan and classic street-level adventure games. It retains all eight existing project destinations and their interiors.

## Play

- Desktop: click the scene for mouse look; WASD/arrows move, Shift jogs, E interacts, Q opens the directory, B opens the notebook, V changes camera, N changes time. Escape releases the mouse or closes a panel.
- Touch: a floating left thumbstick handles movement and the right side handles camera look; the contextual action button changes with the nearby interaction. Touch-native QTE swipes/taps are supported at Star Port.
- Talk to Aiko to start the Tama errand. Fish at the harbour, sell catches to the harbour master, play Star Port, buy drinks, order ramen, use the phone, or visit the shrine.
- The notebook, money, items, visited shops and quest progress save on the current device. Clearing browser data removes this save.

## High-detail characters

The normal runtime now uses realistic rigged MakeHuman / MPFB 2 CC0 humans rather than presenting the procedural rigs as the final visual layer. Four authored source files supply a realistic female body, adult male body, alternate speaker body and a male body with real fitted, skin-weighted suit/shoe geometry. Each source carries named `idle`, `walk`, `run` and `wave` clips, which Johansson Town blends through Three.js `AnimationMixer` according to actual movement speed and conversation gestures.

The player, Aiko, Kenji, Mrs Sato and the harbour master remain separate characters rather than recolours of one prefab. Their live profiles specify different heights, horizontal proportions, hair silhouettes, posture and accessories: the player retains his side-part and satchel; Aiko has a bob and scarf; Kenji has a close crop and work cap; Mrs Sato has a grey bun, apron and slight stoop; the harbour master is broader with receding hair and a peaked cap. These additions are attached to the character skeleton/head where possible so they follow animation rather than floating independently.

The cast is preloaded on the opening screen before the gameplay module starts. This avoids a deliberate low-detail-to-high-detail pop after play begins. If a high-detail model fails to load, the existing local procedural human system remains available as a deterministic fallback, so character-network failure does not make the town unplayable.

The current MakeHuman GLBs are fetched from the public `kunalkushwaha/vsim` GitHub library because the available repository write connector cannot yet transfer binary GLB payloads directly. The assets themselves are documented as CC0. Local vendoring and per-resident age/ethnicity/wardrobe-specific MakeHuman exports are the next character-pipeline optimisation.

## Professional harbour pass

The waterfront is a working late-Shōwa harbour rather than a single quay slab. It includes two warehouses, rolling shutters, fishing crates, rope coils, bollards, tyre fenders, a net-drying rack, ice cabinet, drums, harbour lamps, an original unbranded kei service truck, a detailed fishing boat, breakwater beacons, distant industrial sheds and crane silhouettes.

A further professionalisation layer makes the outer harbour genuinely playable. The collision envelope follows three visible zones — narrow shopping street, broad harbour apron and central outer pier — and the scene builds matching pier geometry out to approximately `z = -79`. The pier has mooring bollards, safety rails, a ladder, service cabinet, rope, lighting and a second fishing interaction point. The minimap projection includes the same area.

Road and quay markings use dedicated non-depth-writing decal planes with polygon offset and muted paint colours rather than very thin bright boxes sitting almost coplanar with asphalt. Overhead utility wires are reconstructed as an instanced batch of cylindrical cables rather than one-pixel raster lines. The harbour water is cel shaded and animated with limited-rate normal refresh so its stepped lighting follows the wave geometry.

## Assets and rendering

Four local 1K CC0 Poly Haven diffuse textures currently provide road, plaster, timber and roofing surfaces. Original buildings, vehicles and harbour props use local geometry, while the controlled asset-intake folder records approved or reference-only third-party sources before they can enter the runtime.

Three.js r169 is served locally. The renderer uses AgX tone mapping, hardware antialiasing, conservative device-pixel-ratio limits and soft shadows on desktop/iPad-class hardware. Exterior town geometry retains the restrained stepped-light treatment while the new character sources keep their authored textured/PBR materials so skin and clothing retain more surface information than the former primitive cel rigs.

The iPad fullscreen guard uses a permanently dark page/backplane plus an overscanned WebGL surface. Day/evening/night, rain, four camera views and a live minimap remain available.

## Third-party asset policy

Runtime assets require verified licence provenance. Quaternius CC0 character/animation packs, MakeHuman/MPFB CC0 graphical assets and output, Poly Haven and ambientCG are approved source families. Keshi Corner's Internet Archive scans remain reference-only unless an exact item has both redistribution permission and safe underlying IP; franchise character scans are not imported simply because they are downloadable.

Character provenance is recorded in `assets/characters/ATTRIBUTION.md`. Other credits and original licences: `assets/ATTRIBUTION.md`, `assets/late-showa/ASSETS.md`, `assets/characters/LICENSE-KENNEY.txt`, `vendor/LICENSE-THREE.txt`.

## Validation and audit

`AUDIT.md` is the living engineering audit for the project. It records resolved defects, remaining technical debt and the rule that substantial graphics work should carry a measurable stability/performance improvement or regression check alongside it.

The deterministic stability test covers the shopping-street envelope, harbour apron, walkable outer pier, pier water boundaries, room boundaries, NPC collision and camera sweep. Static quality checks also require the professional cable replacement to remain instanced, moving water to refresh normals, the minimap to include the outer pier, and the high-detail character system to retain preload-before-play, four named locomotion/conversation clips, five explicit identity profiles and the deterministic local fallback.

The high-detail character module was syntax-checked independently before activation. Existing movement sub-stepping, swept third-person camera collision, player/NPC collision and startup stability checks remain in place.

The largest remaining visual limitations are bespoke asset fidelity and character specificity rather than basic human anatomy. Buildings and vehicles remain primarily procedural, while the new humans are high-detail free-source bases rather than custom-scanned actors. The next generational graphics step is to vendor optimised GLBs locally, generate separate age/Asian-phenotype/wardrobe MakeHuman characters for the cast, add richer facial animation, and continue replacing procedural architecture with licence-verified authored assets.
