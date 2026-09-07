# Johansson Town — Harbour Edition

An original, explorable 1988 Japanese harbour neighbourhood inspired by the grounded everyday atmosphere of late-1980s Japan and classic street-level adventure games. It retains all eight existing project destinations and their interiors.

## Play

- Desktop: click the scene for mouse look; WASD/arrows move, Shift jogs, E interacts, Q opens the directory, B opens the notebook, V changes camera, N changes time. Escape releases the mouse or closes a panel.
- Touch: a floating left thumbstick handles movement and the right side handles camera look; the contextual action button changes with the nearby interaction. Touch-native QTE swipes/taps are supported at Star Port.
- Talk to Aiko to start the Tama errand. Fish at the harbour, sell catches to the harbour master, play Star Port, buy drinks, order ramen, use the phone, or visit the shrine.
- The notebook, money, items, visited shops and quest progress save on the current device. Clearing browser data removes this save.

## Characters

The live game uses original procedural human-proportioned residents rather than the old Kenney Mini Character runtime. The player, Aiko, Kenji, Mrs Sato and the harbour master have separate heights, builds, ages, wardrobes, hairstyles and silhouettes. Faces, hands, layered clothing, shoes, collars and individual hair shapes are modelled from local Three.js geometry.

Walking, jogging, breathing, head movement and conversational gestures are animated procedurally and created synchronously, so there is no delayed model swap or character pop-in. The cel compatibility layer converts the stable visible rigs to the same stepped lighting used by the town while leaving their animation hierarchy unchanged. Hidden fallback meshes are skipped during cel-material conversion to avoid unnecessary GPU materials. Legacy Kenney CC0 files remain in `assets/characters/` only for licence/history reference and are not loaded by the current character system.

## Professional harbour pass

The waterfront is a working late-Shōwa harbour rather than a single quay slab. It includes two warehouses, rolling shutters, fishing crates, rope coils, bollards, tyre fenders, a net-drying rack, ice cabinet, drums, harbour lamps, an original unbranded kei service truck, a detailed fishing boat, breakwater beacons, distant industrial sheds and crane silhouettes.

A further professionalisation layer now makes the outer harbour genuinely playable. The collision envelope follows three visible zones — narrow shopping street, broad harbour apron and central outer pier — and the scene builds matching pier geometry out to approximately `z = -79`. The pier has mooring bollards, safety rails, a ladder, service cabinet, rope, lighting and a second fishing interaction point. The minimap projection has been expanded to include the same area, so the player marker no longer leaves the map when walking onto the pier.

The road and quay markings were rebuilt specifically to eliminate bright-line shimmer. They are dedicated non-depth-writing decal planes with polygon offset and muted paint colours instead of very thin bright boxes sitting almost coplanar with the asphalt. The quay edge is built from separated solid geometry rather than overlapping strips.

The previous overhead utility cables still used raster-thin `THREE.Line` geometry. The professional world layer removes those lines at startup and reconstructs their curved segments as one instanced batch of dark cylindrical cables. This both removes another likely source of high-DPI shimmer and reduces cable draw-call overhead.

The harbour water is cel shaded and animated with low-amplitude geometry waves. The professional layer refreshes water normals at a deliberately limited rate so the stepped lighting follows the moving surface without recomputing normals every rendered frame. Rain still changes road roughness, puddles and water colour without replacing the stable collision geometry.

## Assets and rendering

Four local 1K CC0 Poly Haven diffuse textures currently provide road, plaster, timber and roofing surfaces. Original buildings, vehicles and harbour props use local geometry, while the controlled asset-intake folder records approved or reference-only third-party sources before they can enter the runtime.

Three.js r169 is served locally. The renderer uses AgX tone mapping, hardware antialiasing, conservative device-pixel-ratio limits and soft shadows on desktop/iPad-class hardware. Most exterior town surfaces and visible characters use a stepped toon light ramp; physically rendered materials are reserved for glass, wet asphalt and other surfaces where specular response contributes useful depth.

The iPad fullscreen guard uses a permanently dark page/backplane plus an overscanned WebGL surface. The current guard removes the previous paint-containment boundary and adds a dark overscan shadow so WebKit has no light page layer to expose during fullscreen/visual-viewport transitions.

Day/evening/night, rain, four camera views and a live minimap remain available. No external asset host is required for the game to start.

## Third-party asset policy

Runtime assets must have a verified licence and are served locally rather than hot-linked. Quaternius CC0 character/animation packs, Quaternius' CC0 Sushi Restaurant Kit, Poly Haven and ambientCG are approved sources. Keshi Corner's Internet Archive scans are documented as reference-only unless an exact item has both redistribution permission and safe underlying IP; franchise character scans are not imported simply because they are downloadable.

Credits and original licences: `assets/ATTRIBUTION.md`, `assets/late-showa/ASSETS.md`, `assets/characters/ATTRIBUTION.md`, `assets/characters/LICENSE-KENNEY.txt`, `vendor/LICENSE-THREE.txt`.

## Validation and audit

`AUDIT.md` is the living engineering audit for the project. It records resolved defects, remaining technical debt and the rule that substantial graphics work should carry a measurable stability/performance improvement or regression check alongside it.

The deterministic stability test now covers the shopping-street envelope, harbour apron, walkable outer pier, pier water boundaries, room boundaries, NPC collision and camera sweep. Static quality checks also require the professional cable replacement to remain instanced and free of new `THREE.Line`/`LineBasicMaterial` usage, require moving-water normal refresh, and require the minimap projection to include the outer pier.

The source modules introduced in this pass were syntax-checked independently. Existing movement sub-stepping, swept third-person camera collision, player/NPC collision and startup stability checks remain in place.

The largest remaining visual limitation is still asset fidelity: buildings, vehicles and humans are primarily procedural. The next generational graphics improvement should be a locally packaged, licence-verified glTF/GLB asset pipeline with optimised character rigs, period architecture, richer harbour props and normal/roughness/AO texture data, while preserving the current deterministic collision and mobile stability work.
