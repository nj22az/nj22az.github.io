# Maintenance planner — Blender object library

2 November 2026, release `2026.11.02.7`. Owner request: “Use Blender to build the objets so we can also add new objects”. Prior production and AFS behaviour: [guided risk handover](HANDOVER-RISK-USABILITY-2026-11-02.md).

## What changed

Four original, generic Blender equipment collections: pump (38 parts), compressor/receiver (69), generator (36), temperature probe/readout (9). PNG intermediate renders are reproducible from the retained source and ignored by git. The `.blend` source, procedural recipes, catalogue, dimension-envelope drawing, geometry report, GLB exports, small WebP app images and a contact sheet are retained. Blender 4.2.3 LTS ran headlessly with CPU Cycles; these are actual Blender renders, not generated or stock photographs.

The app has an **Objects** library with an **Add to inventory** button per model. The form pre-fills only a visual model and a descriptive name; unique tag, technical data and assessments must be entered for the real item. Existing assets have an optional model selector and preview. Illustrations appear in inventory tiles and asset details. Only the explicit fictional demo IDs receive visual defaults; actual inventory is never guessed from a name or type. An explicit “No illustration” choice is retained. Backups retain model IDs, including future or unavailable catalogue IDs, while arbitrary URLs/path traversal are rejected.

Visual changes do not invalidate technical classification evidence, alter technical specifications, create pressure assessments, set inspection dates or clear holds. These are identification aids, not engineering replicas, manufacturer dimensions, technical acceptance or safety decisions. No new classifications or AFS rules were added. Browser forms register physical inventory; new geometry is authored in Blender.

## Adding further objects

See [Blender authoring instructions](blender/README.md). Add a named collection and a catalogue entry, then run the exporter with `--from-blend` and prepare-web-images.py. The generated catalogue automatically supplies the app library and selector; adding a custom collection requires no application switch case. Default rebuilding reconstructs the four procedural recipes; hand-edited files must use `--from-blend`. Keep a separate source copy. The exporter replaces the studio rig and saves the resulting edited library.

## Checks actually run

- Full maintenance suite: **306/306 passed**, including all previous AFS boundary/evidence/risk checks, visual-only asset registration, unchanged classification revision, backup compatibility, explicit demo defaults/clearing, render file signatures, GLB container integrity, mesh presence, catalogue completeness, envelope bounds and export/image size budgets.
- Blender 4.2.3 generated all four collections and exports. All four renders and the contact sheet were visually inspected. A stale dependency-bound computation initially made the generator too small; updating the dependency graph before envelope fitting corrected it to 1.500 × 0.7275 × 1.067m, inside its declared illustrative envelope.
- WebP images are approximately 8–20KB each. GLBs are approximately 134–729KB. Runtime uses the images, with downloadable GLB/Blender source; it does not load an additional 3D runtime or spin an animation in the maintenance workspace.
- A separate temporary QA collection passed the edited-Blender/custom-catalogue export path: reopening the edited source exported all four retained models plus an independently authored custom collection (0.3 × 0.2 × 0.4m, 1,872-byte GLB). The fifth model appeared in the generated catalogue without changing app code. QA geometry never enters the shipped catalogue.
- New JS passes `node --check`; `git diff --check` passes.

Publication and actual browser acceptance are recorded below when complete. Physical Safari, real equipment/model resemblance and first-time-user acceptance remain unverified. The generic models do not replace measurements or source documents.
