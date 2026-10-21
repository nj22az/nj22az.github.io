# Studio consolidation and first complete workflow

20 October 2026. This integrates the existing workshop branch into current main, preserving the classroom comic,
character motion and newer Sakura work. No repository split or additional editor is introduced.

## Architecture and audit findings

| Responsibility | Implementation to retain | Consolidation decision |
| --- | --- | --- |
| Character, modelling, room, scene and comic editing | Website `avatar-creator/` | One browser workspace, also usable from the desktop server's `/avatar-creator/` route |
| GLB preparation, placement documents and history | `src/studio/model-workbench.js`, `room-project.js`, `room-render.js` | UI and MCP use the same validation and reducer; assets have stable IDs, versions and multiple instances |
| Native World integration | Workshop contract, adapter and generated publication module | Reference-aware changes; preserve machinery, prompts, collisions and staff access |
| Drafts and content publication | `johansson-studio` MCP | Dry runs first; explicit file exchange; local publication is distinct from deployment |
| Desktop host, script projects and deployment | `jojo/town-studio` | Preserve Qt host, film scripts, downloads and confirmed test/build/deploy workflow |
| Animated films | `jojo/remotion` | Retain its existing renderer, episode checks, cached segments and creator approvals |

Inspected desktop sources: `town-studio/README.md`, `modeller/build.js`, `townstudio/app.py`, `server.py`, `assets.py`
and `mcp_server.py` on jojo main. Desktop already serves the website checkout and supports GLB recipes. Its window
still has Play/Build/Films navigation; an embedded Studio navigation entry and Qt acceptance are outstanding. This
change does not claim that the native desktop app was launched or that two stores are automatically synchronised.
Its asset-card/catalogue workflow and the website's imported room assets have different purposes: retain both until
versioned interchange covers card metadata, geometric checks, source recipes and dependencies without loss.

The prior room/library work is already on main. Native publication was on PR #284, with conflicts against newer
comics and runtime files. Those source changes are integrated here and the runtime is rebuilt from the combined source.
The main MCP configuration previously registered only `johansson-town-audit`; it now also registers
`johansson-studio`. Restart the client after updating. `studio_workflow_info` is the read-only discovery entry point;
the protocol test verifies that every tool it names is registered.

## Practical workflow

1. Open **Edit room → Open World workshop**. Alternatively create a generic room; it cannot publish as a native workshop.
2. **Import model** accepts an embedded static GLB. Inspect the selected object, edit its name, position, rotation and
   scale, and use **Frame selected**. Protected native assemblies retain their builders and restrictions.
3. Imported models appear in **Reusable assets**. **Add** creates another instance sharing the same asset, rather than
   embedding another copy. Search the object list by name or stable ID. Select by list or viewport; the outline and
   inspector refer to that instance. **Duplicate** selects the newly created object. Undo/Redo use the shared reducer
   and monotonically increasing revisions; history lasts for the current session.
4. **Download project** preserves source models, IDs, properties and native bindings. **Export room GLB** exports the
   combined static geometry, without editor guides or game behaviours. Reopen the GLB to inspect geometry; retain the
   editable project to continue authoring. **Build a scene here** uses the published workshop for comics/film staging.
5. **Check and prepare World update** checks contact, collisions, doorway and staff access. Download the proposal and
   copy it inside the agent's checkout. Selecting another object now preserves the checked proposal; editing, Undo,
   Redo or opening another project invalidates it.
6. Agent: `room_open` imports the proposal under a new ID; `room_get` gives its revision; `world_room_check` validates it;
   `room_render` provides a preview; `world_room_publish` defaults to a dry run. Show the exact diff and visual evidence.
7. Only after the creator approves the concrete change, repeat publication with `dryRun:false` and both expected
   revisions. Rebuild runtime, run relevant checks, commit the generated module/data/runtime together and deploy by the
   existing reviewed git workflow or desktop host. A local publication result does not establish a successful deployment.
8. `world_room_rollback` validates a retained layout and publishes it as a newer revision. It does not rewind git.

Example discoverable CLI (same handlers as MCP), from the website repository root:

```sh
node johansson-town/tools/studio/cli.mjs studio_workflow_info '{}'
node johansson-town/tools/studio/cli.mjs world_room_open '{"room":"dock-workshop","id":"workshop-review","dryRun":false}'
node johansson-town/tools/studio/cli.mjs room_get '{"id":"workshop-review"}'
node johansson-town/tools/studio/cli.mjs world_room_check '{"id":"workshop-review"}'
```

`dryRun:false` on a draft operation is not permission to publish. Keep `town-studio` connected from its existing jojo
checkout for desktop status/scripts/deployment; do not rename it or route its publish operation to an unchecked editor.
The website server configuration runs from the website repository root. Dependencies: `npm ci` in `johansson-town`,
plus the matching Playwright Chromium for render/export operations.

## UI assessment and changes

The previous room header combined project actions and editing instructions without grouping. The left panel listed
instances but provided no way to reuse an imported asset without duplicating an object. Tablet widths put the inspector
below the canvas while leaving another column unused. Selection changes incorrectly discarded a prepared proposal.

This batch groups file actions; provides named object search, counts, reusable assets and usage counts; adds empty
selection guidance, visible keyboard focus and Frame selected; selects duplicates; retains proposal validity across
selection; and keeps object list, canvas and inspector side by side at tablet landscape widths. Phone layout remains
stacked with the preview first. The existing 44 px controls and Undo/Redo are retained. This is an incremental
professional-authoring improvement, not a claim of Apple/Nintendo quality or a finished design system.

## Prioritised roadmap

| Priority | Deliverable | Acceptance criterion |
| --- | --- | --- |
| P0 | Review and approve this workshop workflow; physical iPad/Safari and Qt checks | Import/edit/reuse/export survives a device round trip; doorway, staff and machinery remain usable after an approved deployment |
| P0 | Desktop navigation points to the shared browser Studio; shared content test fixtures | Qt uses the existing `/avatar-creator/` page; desktop and web validate identical asset packages; no second editor |
| P1 | Durable project browser, preview thumbnails and asset metadata | Reopen any saved project, see source/version/usage, replace one or every instance with explicit confirmation and undo |
| P1 | A second native room adapter | Open, edit, validate, review, publish and roll back one real shop while preserving its doors, seats, routes and interactions |
| P1 | Unified command history and direct manipulation | Named undo actions, frame/zoom/orbit, keyboard nudging, transform handles, clear locked/hidden states; keyboard and touch acceptance |
| P2 | Comics and memes | Durable editable panel projects, bubble/lettering layers and measured typography, reusable camera/pose states, print-size output; preserve the current classroom and running examples |
| P2 | Versioned scene-to-episode interchange with existing Remotion | Import one existing episode; round-trip actual camera/cast/prop revisions and timing without hand reconstruction; validate occlusion and collisions |
| P3 | Animation authoring | Exact-frame tracks, keyframes, gesture/face/lip-sync and camera paths; deterministic preview/render parity; rig support only after a documented retargeting contract |
| P3 | Film jobs and delivery | Existing segmented renderer exposes progress/cancel/retry/cache; preview and final approval stay separate and creator-controlled |

## Verification and remaining limits

See `qa/studio-workflow/` for this run's report and images. Repeatable checks:

```sh
node --test avatar-creator/tests/room-project.test.mjs avatar-creator/tests/model-workbench.test.mjs avatar-creator/tests/support.test.mjs avatar-creator/tests/classroom-comic.test.mjs avatar-creator/tests/scene-motion.test.mjs johansson-town/tests/workshop-room.test.mjs johansson-town/tests/studio-mcp.test.mjs
node avatar-creator/tests/model-workshop.browser.mjs
node avatar-creator/tests/room-editor.browser.mjs
node avatar-creator/tests/workshop-room.browser.mjs
(cd johansson-town && npm run build:runtime && node --test tests/runtime-package.test.mjs)
node avatar-creator/tests/workshop-world.browser.mjs
```

Publication/rollback browser checks use an isolated data checkout. The included branch carries the pre-existing workshop
proposal (calculation table 15 cm east); no approval is inferred and no live World change is deployed by this audit.
Only the Dock Workshop has a native adapter. Static GLB limits remain explicit; no arbitrary animated GLB editing,
whole-island physics/surface guarantee, full animation timeline, native desktop launch or physical Safari test is claimed.
A further 33 scene/share/workshop regression checks produced 32 passes and one Sakura till-surface failure (expected face at x=5.06). The identical failure was reproduced on unchanged main 42f4ef85 in a separate worktree. Full repository suite is not run. Runtime compilation retains existing upstream Three.js shader whitespace.
