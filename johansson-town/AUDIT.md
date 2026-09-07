# Johansson Town — Living Quality Audit

This file is the continuing engineering audit for the project. A visual improvement is not considered complete merely because it looks better in source; it must also preserve collision, interaction, mobile stability and predictable rendering.

## Quality target

An original late-Shōwa Japanese street/harbour adventure with the grounded density and readability of a commercial third-person game. The target is not literal reproduction of Shenmue or Yakuza assets/UI. Period authenticity, human scale, stable touch rendering and coherent art direction take priority over decorative effects.

## Resolved in the September 2026 professionalisation pass

### Procedural-only final characters — resolved
The old human-proportioned procedural rigs are no longer the intended final visual layer. `characters-aaa.js` preloads realistic rigged MakeHuman / MPFB 2 CC0 adults with authored skin/clothing textures and named `idle`, `walk`, `run` and `wave` clips. Three.js `AnimationMixer` blends states from measured actor speed and conversation gestures. The procedural system remains only as a deterministic fallback.

### Character sameness — substantially reduced
Five explicit identity profiles are retained: player, Aiko, Kenji, Mrs Sato and harbour master. They differ in source body, height, horizontal build, hair silhouette, posture and period-role accessories. The player uses a fitted skinned suit source; Aiko uses the female source; Kenji a broad male source; Mrs Sato an alternate speaker/morph source; the harbour master deliberately exaggerates the male base into a broader silhouette. Hair, work/peaked caps, scarf, apron and satchel provide further silhouette separation.

### Character pop-in risk — controlled
High-detail sources are loaded on the opening screen before the gameplay module is imported. There is no intentional in-play procedural-to-HD swap. Each source load has a timeout and per-source failure handling; failure selects the local procedural human instead of preventing the game from starting. The title-screen watchdog has been extended to accommodate the larger mobile preload.

### Character accessory coordinate-space error — resolved before release
The first high-detail implementation derived hair/cap positions from a world-space model box after attachment to an NPC. That would have made accessory placement depend on the actor's town position. The corrected implementation stores normalized model bounds before attachment and uses those local-space bounds for skeletal accessory placement.

### Harbour traversal mismatch — resolved
The harbour scenery extended well beyond the old `z ≈ -62` movement boundary. The collision envelope now follows three real playable zones: the narrow shopping street, broad harbour apron and a central outer pier extending to approximately `z = -79`. The professional world layer builds matching pier geometry so collision and visible ground agree.

### One-pixel overhead cable shimmer — resolved
The base scene generated utility wires using `THREE.Line`/`LineBasicMaterial`. The professional world layer removes those runtime line objects and converts their polyline segments into one instanced batch of dark cylindrical cables. This avoids sub-pixel raster-line crawling while reducing cable draw-call cost.

### Road/quay bright-line z-fighting — resolved
Road paint uses dedicated non-depth-writing decal planes with polygon offset. Harbour edges are separated solid geometry rather than overlapping near-coplanar strips.

### Animated cel water lacked changing normals — resolved
The professional layer refreshes moving-water vertex normals at a deliberately limited rate, producing readable stepped-light changes without recomputing normals every rendered frame.

### Regression coverage — expanded
The deterministic/static tests cover harbour traversal, swept camera collision, NPC collision, anti-shimmer cable requirements, moving-water normals, professional minimap coverage and the new character requirements: the AAA module must exist, retain all five named profiles, use `AnimationMixer`, retain `idle`/`walk`/`run`/`wave`, preserve the local fallback and preload before gameplay.

## Current strengths

- Deterministic movement sub-stepping prevents ordinary collision tunnelling.
- Player/NPC collision is active.
- Third-person camera uses swept collision rather than endpoint-only checks.
- High-detail characters preload before play and retain a deterministic local fallback.
- Realistic character sources use proper skinned human anatomy and authored motion clips rather than cylinders/boxes as their final body layer.
- Five cast profiles preserve distinct height/build/hair/accessory silhouettes.
- AgX tone mapping and conservative touch-device DPR limits are in place.
- iPad/iOS has a dedicated fullscreen dark-backplane/compositor guard.
- Unverified Archive.org/Sketchfab material is not hot-linked into gameplay.

## Remaining technical debt, in priority order

### P0 — vendor and optimise character GLBs locally
The MakeHuman sources are CC0, but the current implementation fetches the GLBs from the public `kunalkushwaha/vsim` GitHub library because the available repository text-write path cannot copy binary GLBs. This reintroduces a network dependency at the opening screen. The production solution is local vendoring with texture/mesh optimisation (Meshopt/Draco where appropriate) and a character asset manifest with explicit memory budgets.

### P0 — bespoke Asian/age-specific cast generation
The free MakeHuman bases are a realism improvement but are not bespoke Japanese actors. MakeHuman's CC0 system-asset pack includes young/middle-aged/old Asian male/female skins, hair and work/casual clothing. Generate a separate body/face/age/wardrobe export for each Johansson resident rather than continuing to derive multiple identities from a small free base set. Mrs Sato in particular should use a genuinely older female phenotype rather than relying principally on posture, bun and accessory cues.

### P0 — real-device visual validation
Source inspection and deterministic regression tests cannot prove absence of a device-specific WebKit/GPU artefact. iPad Safari/fullscreen should be treated as a release platform with an explicit visual test matrix: portrait/landscape, fullscreen transition, camera near geometry, rain, afternoon/night, all five character profiles, conversation animation and repeated app background/foreground transitions.

### P1 — facial animation and gaze
The `speaker` source exposes a `mouthOpen` morph, but ordinary residents currently rely mainly on skeletal idle/wave animation. Add blink, gaze targeting, subtle facial motion and speech-driven mouth shapes. Avoid exaggerated anime expressions; the visual target is restrained early-3D-adventure naturalism with modern rendering quality.

### P1 — height-aware camera collision
Current camera collision is conservative 2D XZ collision. Low benches and props therefore block the camera as though infinitely tall. Future colliders should carry vertical ranges or use a true 3D sphere/capsule cast.

### P1 — NPC navigation
Residents still follow simple scheduled sinusoidal movement. Replace this with waypoint/navmesh navigation, idle states, destination selection and local avoidance before increasing NPC population.

### P1 — shadow stability
The directional shadow volume is broad and static. A production pass should use a camera/player-following quantised shadow anchor or cascaded strategy so shadow resolution remains stable from the shrine to the outer pier without texel crawl.

### P1 — interior/exterior material parity
Exterior world geometry retains stepped cel lighting while realistic characters now keep their authored textured/PBR materials. This contrast should be art-directed deliberately: either move the environment toward richer grounded PBR or create a shared restrained character/environment grading pipeline rather than reverting high-detail skin to flat toon shading.

### P2 — richer environmental material data
The current Poly Haven usage is principally diffuse texture data. Add verified local normal/roughness/AO maps for asphalt, timber, plaster, ceramic roofing and corrugated metal, with mobile memory budgets and texture-size tiers.

### P2 — performance instrumentation
Add a development-only profiler for draw calls, triangles, texture count, renderer memory, character skinning cost and frame-time percentiles. The new human meshes make this more important on iPad-class GPUs.

## Rule for future passes

Every substantial graphics pass should contain at least one measurable stability/performance improvement or regression check alongside the visual work. New third-party assets require licence verification before entering the runtime. New thin raster lines, near-coplanar surfaces, unbounded transparent layers and asynchronous in-play model swaps are presumed unsafe until proven otherwise.
