# Thuan — Sakura's shopkeeper, on the full skeleton

The runtime file is `assets/characters/thuan/thuan.glb` (about 4.4 MB, everything embedded),
loaded as the `thuan-mh` source in `src/people/models.js`. It replaces the Meshy-merged rig,
which had no fingers, toes or face shapes to speak of.

## What is in it

- **Body and look**: the MakeHuman build of Yui (`../yui/yui.blend`, `construction.json`)
  for her body and fitted clothes. Her head is built on a second MakeHuman human, a young
  woman in her twenties with ideal proportions, and carried over above the neck (the head
  bones are refitted to it): a soft, rounded face with big bright eyes, a small nose, full
  cheeks, a short chin and the corners of her mouth turned up, so she rests with a smile;
  makeup painted into the skin (a rose-red lipstick, blush, a warm eyeshadow and fine liner),
  lashes and warm brown brows. Her hair is built in the script: a close surface of strands
  from a clear side part over her left brow (a fine line of scalp shows along it), thinning
  into the skin at the hairline, over the tops of her ears and gathered behind them into two
  plaits that come forward over her shoulders onto the top of her chest, tied in yellow with
  a short brushed end. Each plait is a column of plump, tilted lobes that alternate side to side, so
  the town's ink draws a plait's chevrons and scalloped edge. The scalp is darkened only
  where the hair covers it. Round glasses with thin rose frames (no lenses, which would only
  catch ink) sit in front of her brows and cheeks, their arms along her temples and under
  her hair; they ride the head bone. She wears a short-sleeved top and loose trousers in yellow
  cotton printed with small white flowers; loafers. 1.64 m.
- **Skeleton**: MPFB's 163-bone default rig, the same one Johansson uses — twist bones, five
  fingers with metacarpals, five toes per foot, jaw, tongue, eyes and lips. The hair is
  skinned from the skin under it (head at the crown, neck and back below); the eyes ride
  their own bones.
- **Face**: seventeen shape keys named the ARKit way on the head and brows (`eyeBlinkLeft`,
  `eyeBlinkRight`, `eyeWideLeft`, `eyeWideRight`, `eyeSquint`, `browOuterUpLeft`,
  `browOuterUpRight`, `browInnerUp`, `browDown`, `jawOpen`, `mouthSmileLeft`,
  `mouthSmileRight`, `mouthFunnel`, `mouthPucker`, `mouthFrown`, `mouthStretch`,
  `mouthPress`), so `thuan-face-controller.js` drives them unchanged. Her smile is a soft
  closed one, not MakeHuman's full corner-puller. The brows, lashes and a pair of blush
  patches over her cheeks (`Thuan.Blush`, shipped clear) carry the same shapes, and the
  controller drives every one of them. Her moods are presets on those shapes: neutral,
  smile, concern, surprise, and happy (a smile that reaches the eyes), sad (inner brows up,
  corners down), angry (brows down, lips pressed) and shy (a small smile and a flush, the
  blush patches fading in with a radial alpha). Her lines in `src/dialogue/sakura.json`
  carry a `mood`, and her face follows it while the line is on screen.
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
