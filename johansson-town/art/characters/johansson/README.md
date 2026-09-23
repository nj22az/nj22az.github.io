# Johansson — the player, seen from outside

Johansson is a bald, hairy Swede in his sixties: broad round face, heavy grey brows, a grey
fringe round the back of the head, forehead furrows and laugh lines, clean-shaven, in a
kariyushi shirt and khaki shorts. His face follows a reference photograph supplied by the
user; nothing from the photograph is embedded in the asset.

The runtime file is `assets/characters/johansson/johansson.glb` (about 3.5 MB, everything
embedded). It is used only by the third-person view (`src/people/johansson.js`, key V).

## What is in it

- **Body**: a MakeHuman base mesh built with MPFB (caucasian male, age ~64, heavier build),
  shaped with MakeHuman face targets for the round face, jowls, double chin, large nose,
  thin lips and hooded eyes.
- **Skeleton**: MPFB's 163-bone default rig — clavicles, twist bones, five fingers with
  metacarpals, five toes per foot, jaw, tongue, eyes, lids and lip bones.
- **Face**: fifteen shape keys from the MakeHuman expression units, on the head and on the
  brows: `blinkL blinkR squint eyesWide browUp browDown browSad jawOpen smile frown pucker
  mouthWide lipsPress sneer lipUp`. Blinks, gaze (eye bones), speech and expressions are
  driven at runtime.
- **Actions** (31): Idle, Walk, Run, Jump, Fall, Sit, SitEat, Soak, Wave, Bow, Nod,
  HeadShake, Point, Shrug, Talk, PickUp, Drink, Eat, Give, Clap, Stretch, LookAround,
  Think, Laugh, Phone, Crouch, Cast, FishIdle, Reel, Kachashi, Fist. Stride lengths are
  measured in Blender and written to `actions.json`, so walking and running keep the
  planted foot still at the game's speeds.
- **Clothes**: Kenji's fitted CC0 MakeHuman shirt, jeans and shoes (`../kenji/kenji.blend`),
  moved onto Johansson's frame; sleeves and legs are cut square with a bisect, and the
  textures are repainted as a kariyushi print and khaki.
- **Skin**: the MakeHuman light-skinned texture, repainted: bald sun-caught crown, stubble
  shadow, chest/arm/leg hair drawn stroke by stroke in UV space from 3D regions, forehead
  furrows, frown lines, crow's feet, laugh lines, under-eye bags, ruddy cheeks and a few sun
  spots. The grey fringe is a thin shell over the scalp with its own alpha texture.

## Rebuild

Needs Blender 4.2 LTS (or the `bpy` 4.2 module) and MPFB source at revision
`7fcc8df56f26776923e0a825f4551c3c3779befe` (https://github.com/makehumancommunity/mpfb2).
From `johansson-town/`:

```sh
python tools/blender/build-johansson.py -- --mpfb /path/to/mpfb2/src/mpfb --root "$PWD"
python tools/blender/animate-johansson.py -- --root "$PWD"
```

The first writes `johansson.blend`; the second adds the actions, writes
`johansson-animated.blend` and `actions.json`, and exports the GLB. Both blends are
reproducible intermediates (about 13 MB each) and are not tracked; the scripts are seeded,
so a rebuild gives the same textures.

## Licences

MakeHuman base mesh, targets, skeleton, weights, skin, eye, eyebrow and clothing assets:
CC0 1.0 (MakeHuman / Data Collection AB, Joel Palmius, Jonas Hauquier). MPFB is GPL and is
an authoring tool only; none of its code is distributed. Everything else — the shaping, the
painted skin, the fringe, the print, the poses and actions — is original to Johansson Town.
