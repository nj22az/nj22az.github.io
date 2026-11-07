# Animation integration: reuse jojo/remotion

The creator identified the existing film engine on 20 October 2026. This supersedes the earlier proposal to install
another Remotion renderer under avatar-creator. No second renderer or React dependency is delivered by this integration.

The existing engine is `nj22az/jojo/remotion`. Its `scripts/film.mjs`, `FILM.md`, `src/Film.tsx`, `src/stage.ts`, existing
MCP server and sync-town tool were inspected. It already implements animated cast blocking, walking/running, poses and
gestures, moving/following cameras, dialogue timing/lip sync, staged comic panels, fingerprinted retakes, cached segments,
body/lens/walk collisions and look checks. Studio should expose and extend those capabilities rather than duplicate them.

## Implemented bridge

**Build scene → Prepare film staging → Download film staging** exports a clean World plate (without the cast or captions),
the actual camera position/target/FOV/frame size, room origin, original editable scene and cast recipes/marks. The scene
is restored afterwards. `scene_export_film` provides the same operation through MCP from a saved Studio scene project;
`film_pipeline_info` describes the existing engine and its commands. The export is a staging packet, not a native
approved episode. An agent maps the plate and camera into the existing episode's views and maps cast marks into its
blocking. Depth/occlusion, elevated supports, custom scales and performance-take mappings still need validation.

## Existing production workflow to preserve

Run these in the existing jojo/remotion checkout:

```sh
node scripts/film.mjs <id> draft-comic
node scripts/film.mjs <id> check
node scripts/film.mjs <id> preview en
node scripts/film.mjs <id> collide en
node scripts/film.mjs <id> look en
node scripts/film.mjs <id> render en --segments
```

Use its staged panels (`art/panels`), script/voice work and fingerprints. Re-shoot changed parts only. The existing
creator approvals remain in force: never approve a storyboard, casting, review or final video on the creator's behalf.
Nothing here renders or publishes a final film or claims those approvals were given.

## Full animation editor: outstanding work

1. A shared, versioned episode/animation contract read by jojo and Studio, including camera/actor/prop/audio tracks and
   asset revisions. Import an existing episode before designing a new schema.
2. Visual track editing, keyframes, exact-frame scrubbing, curve controls, shot transitions and editable dialogue timing.
   Evaluate the existing frame-driven engine at arbitrary frames; preserve preview/export parity.
3. Expose existing body gestures, facial/lip-sync controls and camera paths in Studio. Add skeletal/rig import and
   per-bone animation only with explicit format and retargeting support; static GLB workshop currently refuses rigs.
4. Support/contact/attachment constraints and World collision validation during staging and publishing; round-trip room
   edits into playable World with reference-aware doors/seats/routes and rollback.
5. Connect the existing render job/cache interface to the visual editor, with progress/cancellation and the same gates.

Full visual animation capability is required by the owner and remains incomplete. A still-shot animatic is not a
substitute. Physical iPad/Safari preview, performance and exported-film parity need device evidence.
