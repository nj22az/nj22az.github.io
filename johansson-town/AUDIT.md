# Johansson Town — Living Quality Audit

This file is the continuing engineering audit for the project. A visual improvement is not considered complete merely because it looks better in source; it must also preserve collision, interaction, mobile stability and predictable rendering.

## Quality target

An original late-Shōwa Japanese street/harbour adventure with the grounded density and readability of a commercial third-person game. The target is not literal reproduction of Shenmue or Yakuza assets/UI. Period authenticity, human scale, stable touch rendering and coherent art direction take priority over decorative effects.

## Resolved in the September 2026 professionalisation pass

### Harbour traversal mismatch — resolved
The harbour scenery extended well beyond the old `z ≈ -62` movement boundary. The collision envelope now follows three real playable zones: the narrow shopping street, broad harbour apron and a central outer pier extending to approximately `z = -79`. The professional world layer builds matching pier geometry so collision and visible ground agree.

### One-pixel overhead cable shimmer — resolved
The base scene still generated utility wires using `THREE.Line`/`LineBasicMaterial`. The professional world layer removes those runtime line objects and converts their polyline segments into one instanced batch of dark cylindrical cables. This avoids sub-pixel raster-line crawling while reducing cable draw-call cost.

### Road/quay bright-line z-fighting — resolved in v12
Road paint uses dedicated non-depth-writing decal planes with polygon offset. Harbour edges are separated solid geometry rather than overlapping near-coplanar strips.

### Animated cel water lacked changing normals — resolved
The base water vertices moved but retained static plane normals. The professional layer refreshes vertex normals at a deliberately limited rate, producing readable stepped-light changes without recomputing normals every render frame.

### Hidden fallback character material conversion — resolved
The cel adapter now ignores hidden legacy fallback meshes, reducing unnecessary material creation while preserving the synchronous stable rig hierarchy.

### Stale browser module risk — controlled
The entry point cache-busts the professional world, cel-character and collision revisions through explicit module mappings and a new main-module version.

### Regression coverage — expanded
The deterministic tests now cover the harbour apron, playable outer pier, pier side/water boundary, pier end boundary, swept camera collision, NPC collision and static anti-shimmer requirements for the professional cable layer.

## Current strengths

- Deterministic movement sub-stepping prevents ordinary collision tunnelling.
- Player/NPC collision is active.
- Third-person camera uses swept collision rather than endpoint-only checks.
- Character construction is local and synchronous, avoiding delayed model pop-in.
- Town, characters and harbour use stepped cel-lighting for a coherent exterior style.
- AgX tone mapping and conservative touch-device DPR limits are in place.
- iPad/iOS has a dedicated fullscreen dark-backplane/compositor guard.
- Runtime-critical assets are local; unverified Archive.org/Sketchfab material is not hot-linked into gameplay.

## Remaining technical debt, in priority order

### P0 — true production asset pipeline
The largest visual limitation remains asset fidelity. Buildings, vehicles and people are still primarily procedural geometry. A proper locally packaged glTF/GLB pipeline is required for a genuine generational graphics jump. Preferred sources remain verified CC0 or otherwise clearly redistributable assets. Binary assets should be optimised offline with Meshopt/Draco and served locally rather than from third-party hosts.

### P0 — real-device visual validation
Source inspection and deterministic regression tests cannot prove absence of a device-specific WebKit/GPU artefact. iPad Safari/fullscreen should be treated as a release platform with an explicit visual test matrix: portrait/landscape, fullscreen transition, camera near geometry, rain, afternoon/night and repeated app background/foreground transitions.

### P1 — height-aware camera collision
Current camera collision is conservative 2D XZ collision. Low benches and props therefore block the camera as though infinitely tall. Future colliders should carry vertical ranges or use a true 3D sphere/capsule cast.

### P1 — NPC navigation
Residents still follow simple scheduled sinusoidal movement. Replace this with waypoint/navmesh navigation, idle states, destination selection and local avoidance before increasing NPC population.

### P1 — shadow stability
The directional shadow volume is broad and static. A production pass should use a camera/player-following quantised shadow anchor or cascaded strategy so shadow resolution remains stable from the shrine to the outer pier without texel crawl.

### P1 — interior/exterior material parity
Exterior world and characters are now cel shaded, but some interior helper geometry in `main.js` still uses standard materials. Interiors should move to the same shared toon ramp instead of maintaining parallel material logic.

### P2 — richer material data
The current Poly Haven usage is principally diffuse texture data. Add verified local normal/roughness/AO maps for asphalt, timber, plaster, ceramic roofing and corrugated metal, with mobile memory budgets and texture-size tiers.

### P2 — performance instrumentation
Add a small development-only profiler for draw calls, triangles, texture count, frame time percentiles and renderer memory. Quality decisions should be based on measured iPad and desktop budgets rather than visual intuition alone.

## Rule for future passes

Every substantial graphics pass should contain at least one measurable stability/performance improvement or regression check alongside the visual work. New third-party assets require licence verification before entering the runtime. New thin raster lines, near-coplanar surfaces, unbounded transparent layers and asynchronous model swaps are presumed unsafe until proven otherwise.
