# Supplied protagonist and exploration progression

The owner supplied the floral-shirt Meshy character with its own merged animations through Drive (file ID in asset-report.json). The original is 7,006,164 bytes; the runtime asset is 1,678,468 bytes. Repacking embedded JPEG maps to 1024px leaves mesh vertices, UVs, skin weights, inverse bind matrices and original animation buffers byte-for-byte unchanged. The source remains in the owner’s Drive.

`prepareProtagonistAnimations` maps the supplied Walking/Running clips into the game’s locomotion states. It holds horizontal hip translation at the bind origin because the collision controller owns movement. A small breathing idle uses the opening stance of the supplied heart gesture. Character height is uniformly normalised to 1.82m. Yuri’s geometry, rig and animation module are unchanged.

Reproduce packing and pose previews:

```sh
python tools/compact-yuri-rig.py /path/to/Meshy_AI_Meshy_Merged_Animations.glb assets/characters/protagonist/johansson.glb
node tools/review-protagonist-geometry.mjs /tmp/protagonist-geometry.json
blender -b --python tools/blender/review-protagonist.py -- --root . --poses /tmp/protagonist-geometry.json
```

The PNGs render Three.js-skinned runtime coordinates and the packed material in Blender. They are asset reviews, not browser screenshots.

The new HUD view button, menu view button and V key toggle first and third person. New saves begin in third person; chosen view persists. Indoors, third person uses the cutaway diorama and first person restores the hidden walls and ceiling. Movement follows the selected camera and the player skin is hidden in first person while its animation stays current.

Quick travel requires both completed favours: return Tama to Aiko (`quest === 3`) and complete Kenji’s workshop escort (`kenjiEscort === 'done'`). Star Port’s perfect run enables that escort. Previously completed saves qualify automatically; notification flags and visited places cannot grant access. Before unlocking, destination buttons mark a map pin and a bearing/distance cue without moving the player, including while inside a room. The cue points toward the destination; it is not a pathfinding overlay. WebMCP travel uses the same gate and returns a locked result. Replaying Star Port cannot reset a finished escort.

Validation: 48 CPU tests pass, plus the new WebMCP travel test (49 checks total). This covers switching views outdoors and in every interior, entry/exit, locked and unlocked destination behaviour, task progress/save migration, and skinning through every supplied animation. Production Vite build passes with the existing chunk-size warning. Browser interaction and mobile GPU performance were not measured in this environment.
