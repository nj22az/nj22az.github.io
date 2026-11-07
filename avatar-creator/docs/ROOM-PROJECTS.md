# Editable room projects — Studio MCP 1.4

## What is implemented

**Edit room** creates a portable static composition, separate from the playable town. Start empty, import static GLBs,
or use **World furniture starter** (the game's own tansu, andon, plant and cushion builders). Select by clicking a model
or its object-list entry; drag on the horizontal plane, or edit position, rotation and uniform scale. Grid snapping,
duplication, replacement, deletion and removing unused assets are undoable. Replacement keeps the instance ID and
transform. The starter is a furniture study, not a furnished house with walls or working doors.

Projects have stable object IDs, reusable asset IDs and asset version numbers. The shared command reducer supports
updating one instance or all instances of a shared asset. The UI currently replaces one instance; shared-asset updates
and numerical connector placement are available through MCP commands. Authored connector handles and drag-to-connect
UI are still pending. Connector source points must be expressed in the floor-centred asset frame used by the room
loader; target frames are room coordinates. The workshop's raw-source frame is a different coordinate system.

Local IndexedDB autosave reports success only after transaction completion. Reload restores the last active project;
Undo/Redo history is session-only. Saving from an outdated tab is refused rather than overwriting a newer revision.
Download the project if storage is unavailable or a conflict is reported. **Open project** imports a new local copy;
**Download project** preserves embedded assets and editable placements; **Export room GLB** exports visible static
geometry and materials. The guide grid and selection box are excluded. GLB does not encode game behaviours or the
preview's custom cel shader. GLB import/export and validation use the previous model-workshop implementation.

Limits: 64 assets, 64 instances, 24 MiB per GLB and 40 MiB total embedded base64 content (41 MiB project file maximum).
Only static, self-contained GLBs are supported. Animated/skinned and unsupported compressed assets are refused.
Duplicate instances share parsed geometry/materials during rendering. This is not a mesh sculpting or retopology tool.

**Check room surfaces** scans across visible static objects, including overlaps between separate instances. It reports
bounded/partial coverage; it cannot certify zero z-fighting throughout the island. See [MODEL-WORKSHOP.md](MODEL-WORKSHOP.md)
for budgets and the surface ownership rule. Rooms currently do not publish to World or validate doors, seats, NPC routes,
collisions or interactions.

## Claude and other MCP clients

Use the existing `johansson-studio` server described in [STUDIO-MCP.md](STUDIO-MCP.md). All room edits use the same
`src/studio/room-project.js` commands as the UI. Agent drafts live in ignored
`johansson-town/data/studio/projects/<id>.room.json`, separate from preview output eviction. Keep a portable backup.
No room tool commits, pushes or changes the live town.

| Tool | Purpose |
| --- | --- |
| `room_create` | New empty draft; dry run by default |
| `room_open` | Import repository-local `.room.json` under a new ID; never overwrite |
| `room_get` | Read revision, objects and asset usages without large base64 data |
| `room_import_model` | Import repository-local GLB; add an object or replace one instance |
| `room_edit` | Atomic command batch with required `expectedRevision`; dry run by default |
| `room_export` | Portable project or combined GLB |
| `room_check` | Bounded surface audit across room instances |
| `room_render` | PNG preview for inspection |

Browser and MCP storage are separate. Exchange files explicitly:

1. In Studio, **Download project**. Copy that `.room.json` inside the agent's repository checkout.
2. `room_open({id:"island-study",file:"incoming/study.room.json"})`; review, then repeat with `dryRun:false`.
3. `room_get({id:"island-study"})` supplies the current revision and stable IDs.
4. `room_edit({id:"island-study",expectedRevision:0,commands:[{op:"object.update",id:"tansu",set:{position:[-2,0,-1]}}]})`;
   review, then repeat with `dryRun:false`. A successful batch increments the revision once. Stale batches fail atomically.
5. Use `room_render` and `room_check`. `room_export({id:"island-study",format:"project"})` makes an editable file;
   open that file in Studio. `format:"glb"` makes an interchange model instead.

Additional commands: `title`, `asset.add/update/remove`, `object.add/update/replace/duplicate/delete/snap`.
`asset.update` takes `id,name,glb` and increments that asset's version, affecting every instance which uses it.
`object.snap` accepts `mode:"grid",step` or `mode:"connector",source,target,clearance`. Inspect asset `usedBy` before
shared updates. Referenced assets cannot be removed. Invalid command batches never save a partial edit.

## Remaining implementation order

1. **World placement adapter:** stable IDs for code-built town geometry; reference-aware instance changes; collisions,
   seats, doors and routes; draft preview/diff; publish and rollback. This is required before a room can update the town.
2. **Modular building:** authored named connector frames, dimensions and surface ownership; UI handles and connector
   snapping; geometry audits by island cell, instancing coverage, actionable findings and publish gates.
3. **Content projects:** durable editable scene/comic documents, reusable character/pose/camera states, panel/poster
   typography and layers, lighting/effects and high-resolution output. Room projects do not yet feed Build scene.
4. **Movie proof of concept:** the [Remotion integration plan](REMOTION-PLAN.md), starting with a short animatic and
   deterministic frames before full character animation or a production timeline.

## Verification

```bash
node --test avatar-creator/tests/room-project.test.mjs
node avatar-creator/tests/room-editor.browser.mjs
(cd johansson-town && node --test tests/studio-mcp.test.mjs tests/runtime-package.test.mjs)
```

The browser check exercises desktop/phone layouts, replacement, Undo/Redo, local reload recovery, cross-tab stale-save
rejection, MCP GLB/PNG/project export, inter-object overlap detection and reopening an agent-edited project in the UI.
Physical Safari/iPad interactions and share-sheet delivery still need device testing.

## Native World room: the workshop

The workshop now has its first checked World publication adapter. Open it with **Open World workshop**; its fixed
services keep their World builders, while selected floor assemblies and imported GLB props are editable. Use the
**Allow floating** switch for an intentional hover. Read [WORKSHOP-ROUNDTRIP.md](WORKSHOP-ROUNDTRIP.md) for the protected
boundaries, explicit publication/rollback tools and verification limits. Generic room drafts still cannot publish World.
