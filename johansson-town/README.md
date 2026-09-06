# Johansson Town — Harbour Edition

An original, explorable 1988 Japanese harbour neighbourhood inspired by the grounded everyday atmosphere of late-1980s Japan and classic street-level adventure games. It retains all eight existing project destinations and their interiors.

## Play

- Desktop: click the scene for mouse look; WASD/arrows move, Shift jogs, E interacts, Q opens the directory, B opens the notebook, V changes camera, N changes time. Escape releases the mouse or closes a panel.
- Touch: a floating left thumbstick handles movement and the right side handles camera look; the contextual action button changes with the nearby interaction. Touch-native QTE swipes/taps are supported at Star Port.
- Talk to Aiko to start the Tama errand. Fish at the harbour, sell catches to the harbour master, play Star Port, buy drinks, order ramen, use the phone, or visit the shrine.
- The notebook, money, items, visited shops and quest progress save on the current device. Clearing browser data removes this save.

## Characters

The live game uses original procedural human-proportioned residents rather than the old Kenney Mini Character runtime. The player, Aiko, Kenji, Mrs Sato and the harbour master have separate heights, builds, ages, wardrobes, hairstyles and silhouettes. Faces, hands, layered clothing, shoes, collars and individual hair shapes are modelled from local Three.js geometry.

Walking, jogging, breathing, head movement and conversational gestures are animated procedurally and created synchronously, so there is no delayed model swap or character pop-in. A v12 compatibility layer converts those stable rigs to the same stepped cel-lighting treatment used by the town while leaving their animation hierarchy unchanged. Legacy Kenney CC0 files remain in `assets/characters/` only for licence/history reference and are not loaded by the current character system.

## Harbour v12

The waterfront is now a working late-Shōwa harbour rather than a single quay slab. It includes two warehouses, rolling shutters, fishing crates, rope coils, bollards, tyre fenders, a net-drying rack, ice cabinet, drums, harbour lamps, an original unbranded kei service truck, a more detailed fishing boat, breakwater beacons, distant industrial sheds and crane silhouettes.

The road and quay markings were rebuilt specifically to eliminate bright-line shimmer. They are dedicated non-depth-writing decal planes with polygon offset and muted paint colours instead of very thin bright boxes sitting almost coplanar with the asphalt. The quay edge is built from separated solid geometry rather than overlapping strips.

The harbour water is cel shaded and animated with low-amplitude geometry waves. Rain still changes road roughness, puddles and water colour without replacing the stable collision geometry.

## Assets and rendering

Four local 1K CC0 Poly Haven diffuse textures currently provide road, plaster, timber and roofing surfaces. Original buildings, vehicles and harbour props use local geometry, while the controlled asset-intake folder records approved or reference-only third-party sources before they can enter the runtime.

Three.js r169 is served locally. The renderer uses AgX tone mapping, hardware antialiasing, conservative device-pixel-ratio limits and soft shadows on desktop/iPad-class hardware. Most town surfaces now use a five-band `MeshToonMaterial` light ramp; physically rendered materials are reserved for glass, wet asphalt and other surfaces where specular response contributes useful depth.

The iPad fullscreen guard uses a permanently dark page/backplane plus an overscanned WebGL surface. v14 removes the previous paint-containment boundary and adds a dark overscan shadow so WebKit has no light page layer to expose during fullscreen/visual-viewport transitions.

Day/evening/night, rain, four camera views and a live minimap remain available. No external asset host is required for the game to start.

## Third-party asset policy

Runtime assets must have a verified licence and are served locally rather than hot-linked. Quaternius CC0 character/animation packs, Quaternius' CC0 Sushi Restaurant Kit, Poly Haven and ambientCG are approved sources. Keshi Corner's Internet Archive scans are documented as reference-only unless an exact item has both redistribution permission and safe underlying IP; franchise character scans are not imported simply because they are downloadable.

Credits and original licences: `assets/ATTRIBUTION.md`, `assets/late-showa/ASSETS.md`, `assets/characters/ATTRIBUTION.md`, `assets/characters/LICENSE-KENNEY.txt`, `vendor/LICENSE-THREE.txt`.

## Validation

The v12 harbour world and cel-character compatibility module were syntax-checked before deployment. Existing swept camera collision, player/NPC collision, movement sub-stepping and startup stability checks remain in place. The entry point cache-busts the current renderer revision and uses an import map to force the new harbour/cel-character modules rather than relying on stale v11 browser cache entries.
