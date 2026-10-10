# Johansson Studio: scenes and comics

The standalone `/avatar-creator/` now has three named modes: Edit character, Build scene and Make comic. The character editor retains its templates, saved character key, appearance controls, preview controls, transparent PNG, portable designs and model export. Its numbered game onboarding footer is hidden; Share and 3D model download are in Files. Use in scene transfers a copy of the current recipe. Edit appearance on a scene character and Apply to scene updates that copy without altering other characters.

Build scene has five named steps: choose location, add characters, pose and position, add text, export. Twelve existing game-captured location backdrops are reused, with up to six independently posed copies of shared avatar models. Dragging and arrow keys move the selected character; labelled sliders provide placement, size and rotation. Twenty poses, thirteen expressions, speech bubbles, meme text and comic captions are available. Output is a 1200-pixel-wide PNG in landscape, square or portrait format, without selection outlines.

Make comic collects up to four captured panels, supports removal and reordering, and exports a page or horizontal strip as PNG. Captured panels are session-only unless downloaded in an editable project. Project JSON includes the scene and panel images; import validates formats, bounds, recipes and PNG data URLs before replacing current work. Scene state autosaves under `nj-studio-scene-v1`; character storage and game keys remain separate.

Location captures are fixed camera backdrops, not navigable 3D rooms. Characters are composited in front of the capture; this version does not put them behind captured tables or other furniture. The preview redraws on changes, caches bounded avatar sprites and disposes temporary meshes.

## Verification

- Syntax checks passed for all new/modified modules and the browser acceptance script.
- Seven Node checks passed: scene save/import round trip, bounds and limits, ordering, every Johansson/Thuận scene pose (40 model/camera combinations), and existing accessory geometry/attachment/disposal regressions.
- All twelve referenced backdrop paths and local module imports resolve in the current main tree.
- Browser acceptance was updated for the three modes, scene composition, PNG dimensions, two-panel comics, project download/import, reload and isolated game storage at six viewport sizes. It was not executed: the managed browser capability required by the Sites workflow is unavailable. No rendered appearance or Safari/device acceptance is claimed.
- No shared game source, saved-game format or built game runtime was modified; the standalone imports the existing avatar engine.
