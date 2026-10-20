# Model workshop: first implementation, 20 October 2026

Johansson Studio is the authoring tool for Johansson World. The owner wants any model selectable, improvable,
replaceable or removable; GLB import and export; Lego-like snapping; no z-fighting; comics, memes, posters and later
films. The UI and MCP must use the same operations. This batch starts that foundation with **static model preparation**.

## What works now

Open **Make model → Import GLB**, or open a catalogue/registry model and choose **Adjust / export a copy**.
The workshop can:

- Load an embedded, uncompressed static GLB up to 24 MiB. External resource URLs, rigs and animation are explicitly
  refused rather than silently lost. Unsupported compressed inputs need an uncompressed re-export.
- Preview the model in Studio lighting; correct uniform scale, XYZ orientation (degrees), floor origin and position
  (metres); undo up to 30 adjustments.
- Snap the position to a grid, or align a source connector to a target connector. Each connector has a point, a normal
  and an optional up vector. Normals face each other; up vectors resolve roll. Clearance is intentional and explicit.
- Check visible static depth-writing triangles for near-coplanar overlap (1 mm tolerance). The check intersects
  projected triangles; merely sharing an edge is not an overlap. Reports name the meshes and triangle indices.
- Export the adjusted copy as GLB, plus a JSON preparation report. Geometry, embedded textures, supported materials,
  hierarchy and transforms use the existing Three.js loader/exporter. Studio's preview shader is not baked into GLB.

An import is held only for this open session. Keep the exported GLB. Opening that GLB again preserves the exported
geometry and transforms, without applying the old scale twice. The report records the preparation options and results;
it is not a source model package or an importable project on its own.

## Claude / another MCP client

The work branch's `.mcp.json` already registers **johansson-studio**:

```json
{"command":"node","args":["johansson-town/tools/studio/server.mjs"]}
```

Run that command with the repository as the working directory. For clients that ignore `.mcp.json`, add the equivalent
stdio server configuration. After updating this branch, restart the server/client connection so it discovers the new
tools. Setup: `(cd johansson-town && npm ci)`; install the matching Chromium with
`(cd johansson-town && npx playwright install chromium)` if it is not already installed.

| Tool | Result |
| --- | --- |
| `model_inspect` | Model dimensions, mesh/material counts and surface-conflict report; no writes. |
| `model_prepare` | Same adjustments as the UI. A dry run by default; `dryRun:false` saves GLB and JSON under `output/studio-mcp/models/`. |
| `model_snap` | Grid or connector transform, including quaternion and Euler degrees; no writes. |

Files must be `.glb` paths inside this checkout with no symlinks or traversal. Put a user-supplied GLB there first.
The same tools are available when an MCP connection is unavailable:

```bash
node johansson-town/tools/studio/cli.mjs model_inspect '{"file":"johansson-town/assets/catalog/johansson-trucker-display/model.glb"}'
node johansson-town/tools/studio/cli.mjs model_prepare '{"file":"johansson-town/assets/catalog/johansson-trucker-display/model.glb","transform":{"scale":2,"ground":true},"output":"display-double","dryRun":true}'
node johansson-town/tools/studio/cli.mjs model_prepare '{"file":"johansson-town/assets/catalog/johansson-trucker-display/model.glb","transform":{"scale":2,"ground":true},"output":"display-double","dryRun":false}'
node johansson-town/tools/studio/cli.mjs model_snap '{"mode":"grid","position":[0.123,0,0.27],"step":0.05}'
node johansson-town/tools/studio/cli.mjs model_snap '{"mode":"connector","source":{"point":[0,0,0],"normal":[0,-1,0],"up":[0,0,1]},"target":{"point":[1,0,2],"normal":[0,1,0],"up":[0,0,1]}}'
```

For connector placement, use the returned `position`, `rotation`, `scale` and **ground:false** in `model_prepare`.
Connector source coordinates are in the original GLB frame, before scale and rotation; target coordinates are in the
destination frame. Independent modelling software can reopen the exported GLB. No source asset is overwritten.

## Geometry rule: avoid new surface conflicts

Grid alignment alone does not prevent z-fighting. Modular pieces need authored joins and a surface ownership rule:
one owner per exposed floor, wall, roof or road face. Neighbours should meet at shared boundaries; duplicated exposed
faces must be removed, not stacked. Overlays such as posters need a deliberate offset or a suitable decal/depth policy.
Do not scatter tiny offsets throughout the island as a general repair.

The scanner flags near-coplanar overlapping triangle area, even if a material has polygon offset (reported separately).
It deliberately does not auto-delete geometry: it cannot decide which surface is intended. It has bounded budgets
(50,000 triangles, 250,000 candidate pairs, 100 findings) and marks a partial scan `complete:false`, `ok:false`.
Skinned/instanced meshes and non-finite triangles are reported as unsupported, never counted as a clean pass.

A clean **model** scan is not a whole-island clearance certificate. Camera depth precision, transparent materials,
animated/instanced geometry and the relationship between separately placed models still require checks and rendered
views. Existing island z-fighting has not been declared fixed by this batch.

## Next batches

1. Stable instance IDs and selectable World hierarchy, including code-built geometry; shared asset versus one-instance
   replacement; undoable deletion with references to seats, interactions and routines.
2. Authored named connector frames and modular dimensions in asset cards; direct drag-to-connector placement in World.
   The shared snapping maths in this batch is the foundation, not yet a live island placement tool.
3. Cell/room geometry audits with instancing support and saved findings across the whole island; fix existing conflicts
   at their source and verify multiple camera distances on real devices. A publish check must expose incomplete coverage.
4. Versioned asset packages, placement drafts, preview, publish and rollback. Imported workshop copies do not yet flow
   through `asset_draft`/`asset_publish`; those existing tools continue to handle checked Studio-made asset packages.
5. Editable scene/panel projects and poster layers, lights and effects; GLB scene/group export; animatics and films.

## Verification

```bash
node --test avatar-creator/tests/model-workbench.test.mjs
node avatar-creator/tests/model-workshop.browser.mjs
(cd johansson-town && node --test tests/studio-mcp.test.mjs)
```

The workshop browser check imports a real catalogue GLB, changes scale/position, snaps, undoes, exports and reopens it at
1280 and 390 px. It also inspects and prepares a file through the actual shared tool handlers. Physical Safari and the
iOS share sheet still require device testing. This batch does not change player saves or publish any World data.
