# Johansson Studio: 3D scenes and comics

The standalone `/avatar-creator/` has three modes: Edit character, Build scene and Make comic. Build scene guides the author through location, characters, poses and placement, dialogue, and export.

The preview now uses the actual town and room geometry, rather than location photographs with avatar sprites painted over them. Avatar meshes, furniture and architecture share one Three.js scene, perspective camera, lighting and depth buffer. Location photographs are only thumbnails. PNGs and comic panels capture this same 3D render; speech bubbles and captions are added on a separate transparent layer, anchored to projected character positions. Hidden characters do not display floating dialogue.

Dragging raycasts a character mesh and moves it across the ground in metres. Left/right and near/far sliders and arrow keys provide alternatives. Movement follows the town's walking routes and drawn floor slabs, stops at furniture, walls, other characters and ground boundaries, and samples the full movement path to prevent crossing thin walls. Characters remain grounded. The furniture selector uses authored seat positions, facing directions and seat heights; occupied seats cannot be selected twice. Standing or moving leaves the seat. Camera turn, height and distance controls compose a shared perspective view; camera rays shorten the camera path at solid scenery.

The twelve locations reuse the original world builders and dining-room asset. The exterior town is retained across outdoor location changes. Original game simulation is not started. The standalone page's base URL points asset requests to the existing game assets, while Studio scripts and styles use absolute paths. The game source and saved-game format are unchanged.

Scene schema version 2 stores X/Z placement in metres, physical scale, seat identity and camera controls. Version 1 imports preserve recipes, poses and text, resetting old flat-image placement to safe ground positions. The existing scene storage key remains compatible. Captured comic panels stay as PNGs, including older imported panels; recomposing a panel produces a new 3D capture. Downloadable projects preserve scene state and up to four panels.

## Verification

Node checks cover save/import migration, limits, collision sampling, floor/overhead exclusions, all forty Johansson/Thuận pose combinations, and the actual twelve location builders. Location checks load shipped local assets, verify perspective cameras, ground placement, six non-overlapping characters, and authored seating. Syntax and local import/asset paths are checked. Browser acceptance includes the camera/depth controls and PNG/comic/project workflows, but was not executed because the managed browser capability required by the Sites skill is unavailable. Mobile Safari appearance, WebGL performance and touch handling still need device verification.
