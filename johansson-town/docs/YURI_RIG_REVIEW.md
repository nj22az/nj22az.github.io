# Yuri: illustrated biped revision

The user's `Meshy_AI_Thoughtful_Girl_in_Pi_biped.zip` supplies the new textured design, a 28-joint rig, and walking/running exports. This is a deliberately illustrated character direction: larger expressive face, rounded proportions, painted glasses and pink clothing. It suits the playful Sakura dialogue treatment. It is not the earlier realistic Shenmue character pipeline; the remaining cast has not been restyled yet.

## Repairs

- Welded 2,058 coincident vertices at split mesh seams while retaining per-corner UVs and bone weights. Boundary edges decreased from 3,516 to 66 before subdivision. Remaining open clothing/accessory edges are retained rather than blindly capped.
- Recalculated surface normals, cleared inconsistent imported custom normals, enabled smooth shading and reduced the normal-map strength to 0.35.
- Added one geometry subdivision pass to soften angular silhouettes and interpolate weights. No texture repainting or generated replacement image is used.
- Corrected 886 head-region vertex weights so the face, hair, hat and ribbon follow the head consistently. Bound the white collar cloth to the chest to remove stray auto-rig influences.
- Removed duplicate animation takes, retained one Walk and one Run, and removed horizontal hip translation so the game's controller owns movement.
- Added an original subtle breathing Idle_Neutral pose. Unsupported gestures safely fall back to idle rather than throwing an error. This revision does not claim a waving or facial-animation clip.

The updated local `assets/characters/realistic/yuri-meshy.glb` retains Yuri's larger 1.88 m total visual height and her dedicated Sakura conversations. The MakeHuman model remains the local load fallback. Fog remains disabled.

## Evidence and limits

`art/characters/yuri-biped/` contains the packed editable Blender source and actual asset renders. These are Blender renders, not WebGL screenshots. Walk/run poses and idle were visually reviewed, and the runtime tests sample exported skeletal deformation across each clip. The supplied biped weights still approximate dress movement: there is no cloth simulation or facial rig. No claim that all possible pose intersections or device rendering defects have been eliminated is made.

Reproduce with Blender 4.2:

```sh
blender -b --python tools/blender/repair-yuri-biped.py -- --root /path/to/johansson-town --zip /path/to/Meshy_AI_Thoughtful_Girl_in_Pi_biped.zip
```

The user supplied the mesh, textures, skeleton and locomotion files for use in this project. They are not labelled CC0. See assets/ATTRIBUTION.md.
