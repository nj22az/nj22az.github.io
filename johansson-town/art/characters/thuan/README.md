# Thuan — Sakura's shopkeeper, on the full skeleton

The runtime file is `assets/characters/thuan/thuan.glb` (about 4.4 MB, everything embedded),
loaded as the `thuan-mh` source in `src/people/models.js`. It replaces the Meshy-merged rig,
which had no fingers, toes or face shapes to speak of.

## What is in it

- **Body and look**: the MakeHuman build of Yui (`../yui/yui.blend`, `construction.json`)
  for her body and fitted clothes. Her head is built on a second MakeHuman human, a young
  woman in her twenties with ideal proportions, and carried over above the neck (the head
  bones are refitted to it): a soft, rounded face with slightly larger eyes, a small nose,
  full cheeks, a short chin and the corners of her mouth turned up, so she rests with a
  smile; light makeup painted into the skin (rose lips, blush, a warm eyeshadow and fine
  liner), lashes and warm brown brows. Her long dark hair is built in the script as one
  surface of strands that spring from a side part over her left brow and sweep back, lying
  close over the skull, thinning into the skin at the hairline, falling beside her cheeks
  from the temples and down her back to below the shoulder blades, clear of her top. She
  wears a short-sleeved top and loose trousers in yellow cotton printed with small white
  flowers; loafers. 1.64 m.
- **Skeleton**: MPFB's 163-bone default rig, the same one Johansson uses — twist bones, five
  fingers with metacarpals, five toes per foot, jaw, tongue, eyes and lips. The hair is
  skinned from the skin under it (head at the crown, neck and back below); the eyes ride
  their own bones.
- **Face**: seventeen shape keys named the ARKit way on the head and brows (`eyeBlinkLeft`,
  `eyeBlinkRight`, `eyeWideLeft`, `eyeWideRight`, `eyeSquint`, `browOuterUpLeft`,
  `browOuterUpRight`, `browInnerUp`, `browDown`, `jawOpen`, `mouthSmileLeft`,
  `mouthSmileRight`, `mouthFunnel`, `mouthPucker`, `mouthFrown`, `mouthStretch`,
  `mouthPress`), so `thuan-face-controller.js` drives them unchanged. Her smile is a soft
  closed one, not MakeHuman's full corner-puller.
- **Swimwear**: the skin the clothes cover is its own mesh (`Thuan.SkinUnder`) with a red
  one-piece over it (`Thuan.Swimsuit`: high-cut legs, straps). Both are hidden until the
  onsen asks for them (`entity.userData.outfit = 'swim'`).
- **Actions** (57, listed in `actions.json`): everything Johansson has, in a lighter,
  narrower walk, plus her own day — three takes each of `Idle_Neutral` and `CounterIdle`
  that keep her feet planted, `Use`, `Type`, `Read`, `Wake`, `Sleep`, `CarryIdle`,
  `CarryWalk`, `Stroll`, `Rest`, `Ride` (pedalling), standing `DrinkStanding` and
  `EatStanding`, and the names the town already asks for (`Greet`, `Fish`, `Eat`, `Drink`).
  For the storage-room game to come: `Sweep` (brush), `Spray` (bottle, index finger on the
  trigger), `Wipe` (rag in circles) and `Stock` (carton to shelf). These are first drafts, to
  be tuned once the props exist.

## Rebuild

Blender 4.2 LTS (or the `bpy` 4.2 module) and MPFB source at revision
`7fcc8df56f26776923e0a825f4551c3c3779befe`. From `johansson-town/`:

```sh
python tools/blender/build-thuan.py -- --mpfb /path/to/mpfb2/src/mpfb --root "$PWD"
python tools/blender/animate-johansson.py -- --root "$PWD" --character thuan
```

The first writes `thuan.blend`; the second adds the actions, writes `thuan-animated.blend`
and `actions.json`, and exports the GLB. The blends are reproducible and not tracked.
Shared steps live in `tools/blender/mh_character.py`.

## Licences

MakeHuman base mesh, targets, skeleton, weights, skin, eyes, eyebrows, hair and clothing:
CC0 1.0 (MakeHuman / Data Collection AB). MPFB is GPL and an authoring tool only; none of its
code is distributed. The swimsuit, the repainting, the poses and actions are original to
Johansson Town.
