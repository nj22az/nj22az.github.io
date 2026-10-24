# World ↔ Studio: Dock Electrical & Repair Workshop

The first native room adapter. Edit room → **Open World workshop** builds the real room from World's builders, not a
baked copy of its machinery. Stable identities connect each assembly, its collision rectangles and its prompts.
Build scene → **Chin & Tetsuo Repairs** uses the same published room and is available for comics and existing jojo
film staging. There is no second film renderer.

## Editing

- The pattern/calculation table (including its content objects), pump motor/test bench and Star Port cabinet can move,
  turn in 90° steps, or be removed. Native models retain their builders and cannot be duplicated or replaced by a
  static mesh. Fixed services, walls, door, lights, electrical controls, printer and Chin's wall are protected.
- Up to eight extra static GLB props can be imported, positioned, scaled, duplicated, replaced or removed. Published
  embedded assets have a combined 4 MiB budget; generic room projects retain their existing larger draft budget.
- **Allow floating (intentional)** explicitly exempts an editable object from floor contact and enables its Y position.
  Turning it off in a native workshop draft returns it to Y=0. Floating objects still need room clearance and collision
  checks. This is a static hover setting, not an implemented flight path or dynamic gravity simulation. Generic room
  projects also expose the switch; existing attached/suspended support modes remain readable.
- Preview is a cutaway. The GLB export and playable World retain the actual walls and ceiling. GLB contains geometry,
  not executable machinery or game behaviour. Save `.room.json` to retain native bindings, revision and editable props.

## Publication

**Check and prepare World update** validates the draft, then **Download World update** supplies a `.room.json` proposal.
A static website does not silently commit to GitHub. Claude/Codex opens that file with `room_open` under a new draft ID,
reads `room_get`, and calls the tools below. Plain generic rooms cannot publish through this adapter.

| MCP tool | Purpose |
| --- | --- |
| `world_room_open` | Open `room:"dock-workshop"` as a new native draft; `id` and `dryRun:false` save it locally |
| `world_room_check` | Validate a draft by `id` using the actual workshop builders |
| `world_room_publish` | Write checked World data; requires `id`, `expectedWorldRevision`, `expectedProjectRevision`, `note`; dry run by default |
| `world_room_rollback` | Restore a retained `revision` as a new revision; requires `room`, `expectedWorldRevision`, `note`; dry run by default |

The shared reducer and strict schemas reject edits to protected assemblies. Source fingerprints include the adapter,
room builders and the motor GLB. Publication refuses stale World/draft revisions or changed source. It checks actual
collision rectangles, new prop bounds and internal coplanar triangles, floor contact, doorway clearance, staff paths and
prompt proximity. A 15 cm grid with a 35 cm body tests static routes; it does not simulate a whole performance.

`world_room_publish` writes exactly:

- `johansson-town/data/studio/rooms/dock-workshop.json` — history, last ten releases retained.
- `johansson-town/src/world/interiors/workshop-publication.js` — generated runtime data.

Both must match. Rollback rechecks the retained layout against current builders and advances the revision; it never
rewinds git. Build the runtime, inspect the changed room, commit the data/module/runtime together, and deploy. Reload
World and Studio after deployment. Build scene shows the published version, not another device's unsent draft.

New static props preload before the game admits the player through the workshop door. Their checked colliders are
installed with the geometry. Failed preloads retain the normal retry-at-door behaviour. Shared prop/motor templates
survive a room closing; preview disposal keeps cached motor resources alive.

## Checks and limits

`node --test johansson-town/tests/workshop-room.test.mjs` covers native identities, protected/atomic edits, explicit
floating and undo, prompt/collider movement and removal. Existing Tetsuo/Chin/shop/navigation tests remain applicable.
`node avatar-creator/tests/workshop-room.browser.mjs` tests desktop/phone, proposal exchange, an added GLB, whole-room
GLB export, actual runtime and scene builders consuming the published module, dry runs, stale source/revision refusal,
blocked doorway refusal, and monotonic rollback. Publication tests write only a throwaway data checkout.

This is one adapter, not an arbitrary island editor. Electrical rewiring, per-component edits inside protected merged
assemblies, animated flight, character physics, wall-mounted imports, seats, other rooms and a full animation timeline
remain future work. No full-island or all-camera z-fighting guarantee is claimed. Physical iPhone/iPad Safari remains
unverified. The full-island first-frame check times out on SwiftShader on both this build and unchanged main; the
compiled room is verified separately by `node avatar-creator/tests/workshop-world.browser.mjs`.
