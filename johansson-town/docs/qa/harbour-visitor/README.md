# Harbour visitor and shared polo outfit

The five supplied photographs were inspected locally. Photographs are not committed.
The original game recipe represents a blonde adult with tied hair, arched eyebrows,
lash eyes and berry lips. `Harbour visitor` is an editable placeholder name.

Open `creator/?preset=harbour-visitor`, or choose **Harbour visitor** on the creator's
first step. This is an editable/playable character preset, not a new scheduled NPC.
The wardrobe's **Harbour polo and cream pleats** outfit set is available to residents
independently of their face, hair, age or body. Individual parts remain editable.

The new **Contrast-collar polo** uses a collar authored with Blender 4.5.3 LTS.
`tools/blender/build-contrast-polo.py` produces `art/avatars/contrast-polo-collar.blend`
and `src/avatars/contrast-polo-mesh.js`. The shared body fitter maps that topology onto
each chest and binds it into the existing skinned body. Ivory collar/placket/cuffs use
the editable accent colour. The existing pleated skirt, ponytail and shoes are reused.
No additional runtime model request is needed.

Player recipe save/load now applies outfit restrictions to the selected character's
name rather than applying Johansson's restrictions to all avatars. Johansson's own
skirt/dress restriction and older unnamed saves retain their previous handling.

Validation:
- 56 avatar, wardrobe, animation, bath outfit and visitor tests passed.
- Runtime build completed and source hash regenerated.
- Real Chromium WebGL checks passed at 1280×800 and 390×844 with touch enabled.
- Standalone creator save and reload kept the complete outfit.
- Thuan received the shared outfit while retaining her original face and hair.
- Idle, walking, seated, wave and rear previews were captured; zero page errors.

`results.json` and the accompanying PNGs record the browser checks. The existing
pleated skirt's seated folding remains the shared avatar system's stylised drape.
