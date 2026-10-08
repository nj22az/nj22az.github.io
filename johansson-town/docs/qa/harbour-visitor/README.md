# Harbour visitor and shared polo outfit

The five supplied photographs were inspected locally. Photographs are not committed.
The original game recipe represents a blonde adult with an original swept low ponytail, arched eyebrows,
lash eyes and berry lips. `Harbour visitor` is an editable placeholder name.

Open `creator/?preset=harbour-visitor`, or choose **Harbour visitor** on the creator's
first step. This is an editable/playable character preset, not a new scheduled NPC.
The wardrobe's **Harbour polo and cream pleats** outfit set is available to residents
independently of their face, hair, age or body. Individual parts remain editable.

The new **Contrast-collar polo** uses a collar authored with Blender 4.5.3 LTS.
`tools/blender/build-contrast-polo.py` produces `art/avatars/contrast-polo-collar.blend`
and `src/avatars/contrast-polo-mesh.js`. The shared body fitter maps that topology onto
each chest and binds it into the existing skinned body. Ivory collar/placket/cuffs use
the editable accent colour. The existing pleated skirt and shoes are reused. The hairstyle is now an original
Blender asset, not the original cap-and-ball ponytail.
No additional runtime model request is needed.

Player recipe save/load now applies outfit restrictions to the selected character's
name rather than applying Johansson's restrictions to all avatars. Johansson's own
skirt/dress restriction and older unnamed saves retain their previous handling.

Validation:
- 57 avatar, wardrobe, animation, bath outfit and visitor tests passed.
- Runtime build completed and source hash regenerated.
- Real Chromium WebGL checks passed at 1280×800 and 390×844 with touch enabled.
- Standalone creator save and reload kept the complete outfit.
- Thuan received the shared outfit while retaining her original face and hair.
- The new hairstyle was selected through desktop and phone creator controls, saved
  for Thuan, and kept her head and outfit unchanged.
- Idle, walking, seated, wave and rear previews were captured; zero page errors.

`results.json` and the accompanying PNGs record the browser checks. The existing
pleated skirt's seated folding remains the shared avatar system's stylised drape.


Follow-up: sleeve coverage and hairstyle
---------------------------------------
The raised-arm skin patch under the polo sleeve is covered by continuous upper-arm
cloth and an underarm bridge. The neckline also has a continuous knit band.
The **Swept low ponytail** is independently selectable for anyone in the creator.
`tools/blender/build-swept-ponytail.py` authors the scalp, swept fringe, visible side
part and tapered ponytail in Blender. Its exported mesh parts are fitted to head
forms, recoloured from the hair palette and mirrored by the existing parting control.
The tail uses the shared hair spring bones. Clothing and hair are independent.
All ages, head forms and both part directions are covered by fitting tests; the
existing hair/hat combination tests include this style.

See `tomodachi-resource-analysis.md` for the bounded Ghidra/ROM study. The supplied
ROM, extracted resources, decompiled game code and Ghidra database are not included
in this repository. The new Blender hairstyle is original to Johansson World.
