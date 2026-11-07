# One World library, with a reason for each asset

World library inventories the same repository assets used by Johansson World: registered model builders, home/street
furniture, resident cast, current Studio locations, asset files and exported scenery builders. Rebuild the committed
inventory after source changes:

```sh
node avatar-creator/scripts/build-world-library.mjs
```

Every entry exposes its source, access capability, documented purpose and static source-reference evidence. Search and
filter by kind, missing purpose details or review decision. Missing descriptions are shown as missing; they are never
invented from a filename. No source references does **not** establish that an asset is unused. Runtime-generated and
merged/inline geometry, per-instance placements, costumes/hair parameters and synthesised sound still need individual
adapters; the inventory is not a complete census of every mesh or every placement on the island.

For each entry document: **who uses it**, **why it exists**, **where it belongs**, and review notes. Mark keep, review,
merge or remove as a proposed decision. Those decisions do not delete geometry, characters, houses or gameplay.
The browser keeps a local review and can download/open a portable review JSON. `world_asset_list`, `world_asset_get`,
`world_asset_review` (revision checked, dry run by default) and `world_asset_review_export` provide the agent workflow.
Agent review metadata lives in `johansson-town/data/studio/world-library-review.json`; its publication is a repository
change, not an automatic edit of the island. Exchange review files explicitly with the browser.

Registered catalogue/prop models open the existing model workshop and can be copied into Edit room. Home furniture is
exported from the game's own builders into the room project. Standalone static GLB files can be imported subject to
workshop validation; some World GLBs contain compression or animation the current workshop refuses. Characters can be
added to Build scene; locations open the corresponding existing scene. Other source assets expose their source/access
gap. This does not imply every code-built building is independently editable yet.

Purpose reviews must precede consolidation: inspect actual references, NPC routines, interactions, saves and collision
ownership before removing a redundant object. The next World adapter must expose these dependencies and publish a
reviewable placement diff with rollback.

## Support and gravity

Room objects default to resting on a surface. Mark deliberately attached or suspended props explicitly in the inspector.
**Drop onto support** (`room_drop` through MCP) lowers the object until its bounding bottom contacts a support below five
footprint samples, or the explicit room floor at y=0. It accounts for the transformed bounding box; an unsupported or
oversized geometry query refuses to certify placement. `room_check` includes a support report for resting objects.

This is a static contact rule, not rigid-body simulation: it does not prove balance, exact mesh contact, collision-free
motion, stability on sloping surfaces or that a suspended prop has a valid attachment. The guide floor is not exported
geometry. Rotation, overhangs, penetrations and complex/instanced meshes need further checks before World publication.
No claim of whole-island gravity clearance or zero z-fighting is made.

A verified defect was corrected in this milestone: Sato Ramen's runtime coffee urn/jug/cups had a base at y=.92 with only
the tiled floor at y=.04 below. The new World-authored drinks stand provides a top at y=.92 and a collision footprint,
keeping the cook's existing drinks approach clear. The stand is also in Studio's registered model library with a purpose.
