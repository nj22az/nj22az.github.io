# RG CubeXX design contract

The primary platform is the Linux RG CubeXX, not the Android RG Cube. Verified against [Anbernic's specification](https://win.anbernic.com/product/486.html) on 2026-10-17: H700, four Cortex-A53 cores at 1.5 GHz, Mali-G31 MP2 GPU, 1 GB LPDDR4 shared system memory, 64-bit Linux and a 3.95-inch 720 x 720 display.

The following are engineering budgets and design decisions, not measured handheld results.

| Area | Budget / decision |
|---|---|
| Combat and input | Fixed 60 Hz; full move timing and contact logic at every tick |
| Presentation | Target 60 fps, 16.67 ms per frame, including frame pacing |
| CPU work | Aim for simulation/input below 1 ms and CPU frame preparation below 6 ms; GPU work overlaps CPU work |
| GPU work | Aim below 10 ms, leaving pacing and driver headroom |
| Display | Native 720 x 720 square composition; readable HUD at the physical screen size |
| Main scene | Two fighters, one bounded ferry car-deck arena; no town simulation or unrelated NPC systems |
| Geometry | Initial ceiling 110,000 scene triangles including outline passes; current scene 106,682. HUD geometry is additional |
| Submission | At most 12 draw calls in normal play; current renderer uses 11, including HUD and effects |
| Texture memory | At most 24 MiB uncompressed atlases; current characters and ferry total 20 MiB, plus a 4-byte white texture |
| Process memory | Aim below 128 MiB resident including driver allocation; verify on firmware rather than treating file size as RAM use |
| Art | Shared Studio faces, hair, clothing and accessories; preserve identity when making lower-detail exports |
| Lighting | Fixed inexpensive vertex lighting; flat contact shadows; no shadow maps, bloom, screen-space effects or dynamic light arrays |
| Animation | 28-bone fighters; calculate matching skin inputs once and reuse across triangle corners |
| Stage | Upload the original ferry arena geometry once; batch textures into one atlas; omit hidden below-deck assets |
| Loading | Local compressed assets; load before the round; no downloads or allocations for per-frame skinning |
| Controls | Stick/D-pad movement and sidestep; four face-button actions, Start/Select and shoulder shortcuts |
| Linux | C99, SDL2 runtime and GLES2 baseline; ARM64 Cortex-A53 build; firmware-specific launcher/dependency validation |

## Changes applied for the A53 CPU and shared memory

The Studio export stores triangle corners separately to preserve UVs, colours and material seams. Performing identical bone transforms at every copy was wasteful. The runtime now builds a deformation map once at load time. It hashes only position, normal, bone indices, skin weights and outline expansion, so UV or colour differences remain intact.

- Thao: 49,914 triangle corners share 9,353 deformation inputs.
- Thuan: 59,478 triangle corners share 11,314 deformation inputs.
- Together: 20,667 instead of 109,392 deformations per rendered frame, a reduction of **81.1% in deformation evaluations**. This is an operation-count reduction, not a claim of an 81.1% frame-time improvement.
- Pose caches are compacted to the unique input count. No cache allocation occurs during a frame.
- Facing and fall trigonometry are evaluated once per fighter, rather than per triangle corner. Light direction is normalised once per fighter.
- Shader uniform locations are resolved during initialisation.
- Character texture pixels are released from CPU memory after GPU upload, removing 4 MiB of redundant retained CPU texture storage.

The positions, normals and outline vectors from the cache are tested for exact equality against the uncached reference calculation, across both fighters' attack and dodge poses. These changes preserve the original Studio mesh and appearance.

## Performance policy

Keep 60 Hz combat regardless of rendering cadence. Hardware profiling validates the budgets and identifies the next bottleneck; it does not determine the game's basic scope. GPU skinning, indexed geometry and source-derived mesh LOD are next options if CPU preparation or vertex cost exceeds budget. Prefer mesh and effect reductions that preserve the faces, silhouette and readability before reducing render resolution. If needed, add a lower-resolution 3D pass with a native-resolution HUD; it is not implemented yet.

Do not infer sustained performance from the CPU core count, supported emulators or desktop Mesa timings. Final acceptance records frame-time percentiles, controls, audio, memory and thermals on the actual CubeXX firmware. The display's refresh capability and the game's sustained rendering rate are separate measurements.
