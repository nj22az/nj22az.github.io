# Pocket Camera: Makeup and Face stickers audit — the app does the job (3 November 2026)

The owner (3 November 2026), after the zoom release: "No this is not right, it needs to be extremely polished and the
app should do the job, not sliders and manual adjustment. Manual sliders are a last resort, audit as a makeup sales
boss's and pocket camera designer at Nintendo."

This is an audit and a plan. **No runtime file was changed.** Main at the time: `78675eb4` (Camera `v2026.11.03.1`,
key `20261103zoom1`). Scope: the Adjust tab (Makeup, Face stickers, Enhance, Pop, the six adjusters), face finding, and
the zoom's Find face. Two chairs sit in judgement throughout: **the counter** (the person who runs a beauty brand's
counters and its try-on app: what makes a customer buy and come back) and **the pocket camera** (the designer of
Nintendo's little cameras, from the Game Boy Camera through the DSi/3DS camera and Mii Maker's face photo: what makes a
device a toy people love). Nothing of any beauty app's art or code is used; only how they behave is compared.

## Verdict

**The Adjust tab is a workbench, not a product.** It is honest and well engineered underneath (non-destructive recipe,
everything on the device, nothing uploaded, a real face detector, World's own face painter, hats measured in Blender),
but it hands the customer the artist's job:

- **Makeup opens at zero.** Skin, Lips and Blush all start at 0%: opening Makeup changes nothing. The customer has to
  find the face, check the guide "sits on the eyes", drag five handles if it does not, raise three sliders, then pick a
  shade. The counter's verdict: a try-on that shows you nothing has not tried anything on. The pocket camera's verdict:
  the DSi camera never asked you to calibrate before it made you laugh.
- **The app does not know where the lips, eyes and brows are.** The detector (`pico.js`) gives one box for the largest
  face; the eyes and mouth inside it are *template guesses* (`normaliseFace`: eyes at 31%/69% across, 40% down; mouth
  at 50%, 75%). On iPhone there is no native landmark fallback, so every face needs checking by hand. That single gap is
  why "Align face", the five handles and the Angle / Lip width / Lip height sliders exist at all.
- **Sixteen sliders in one tab.** Skin, Lips, Blush, Angle, Lip width, Lip height; Mood, Size, Height (brows), Size
  (eyes), Shine, Size, Height (hat); Enhance strength; Pop strength; and the adjustment slider behind six adjusters.
  Up to seven are on the screen at once. The copy is a manual: "Find a face, or align the guide manually.", "Check eye
  and lip alignment before adding colour.", "Drag the oval, eyes and lips into place. Resize from the corner."
- **Nothing is matched to the person.** Three fixed lip shades (Rose, Peach, Berry) applied as the same chroma to every
  complexion; a parabola lip template; two blush ovals at a fixed height; one skin-smoothing scale. A counter never
  sells a shade without looking at the skin first.
- **Two switches do one job.** Enhance and Pop both make the photo good, both start off, each hides a strength slider.

What is right and must be kept: the Looks strip. It is already the model this tab needs: named looks, thumbnails drawn
on *your own photo*, one tap, one Strength slider after the result. Makeup and Face stickers should be strips of that
kind. The guide and its handles are the right **last resort** and should survive, hidden behind "Not quite right?".

## The two chairs

**The counter.** What sells is the result on her face in one tap, with a name, not a number: "Fresh", "Evening", not
"lips 65%". Time to "would I post this?" under three seconds. Natural first, drama one tap away. It must never make her
look worse: plastic skin, colour on the teeth, blush on the nose, a lip that misses the lip. The brand picks the shade
for her skin; she chooses the mood. A slider on the counter means the product has not done its job yet. And she must be
able to put it back: Original, one touch, always.

**The pocket camera.** The device is a toy that knows a few tricks and does each one instantly and completely. Choices
are few, strong and named (the Game Boy Camera's frames and stamps; the DSi camera's Merge, Mirror, Distortion, Funny
Mouth: one tap each). Mii Maker photographed your face and *had already built* the Mii before it let you tweak. Tap
again for the next variant; the fun is in the result, never in the controls. No slider on the play screen; settings live
behind a door. Failure is gentle and quick ("I can't see a face. Tap the face?"), never a form. Every landing has a
sound, a little animation, a haptic. Charm is in the names and the flourish, not in the feature count.

## What the app does today (facts, from the code)

| Part | Today | Where |
| --- | --- | --- |
| Face finding | Largest frontal face as a **box**; Chrome Android's `FaceDetector` adds eye/mouth centres, iPhone gets none | `face-detect.js`, `makeup.js detectMakeupFace` |
| Eyes, mouth, angle | Template positions in the box; corrected by hand with five handles, Angle, Lip width, Lip height | `makeup.js normaliseFace`, `makeup-guide.js`, `index.html` 164–174 |
| Skin | One-scale (3 × 3, step ≈ 0.6% of the face) colour-selective blur inside an ellipse, eyes/mouth/nose protected by ellipses; max 52% | `makeup.js` 51–68 |
| Blush | Two feathered ovals 19% of the face below the eye line | `makeup.js` 69–72 |
| Lips | Parabola template of `mouth.w × mouth.h`; teeth guessed by brightness/greyness | `makeup.js` 73–81 |
| Shades | Rose, Peach, Berry; one chroma added to every complexion | `MAKEUP_SHADES` |
| Defaults | Everything 0%; the tab opens and nothing happens | `normaliseMakeup` |
| Face stickers | Good parts (World's 12 brows and 8 eyes, shine, 3 Blender hats); chosen part by part with 1–3 sliders each; Drawn/Sticker toggle; its own Find face / Align face / Reset row | `face-stamps.js`, `app.js renderFun`, `FUN_SLIDERS` |
| Enhance, Pop | Two switches, both off, each with a hidden strength | `index.html` 186–196 |
| Adjusters | Light, Contrast, Colour, Warmth, Pattern, Detail through one slider | `ADJUSTMENTS` |
| After a find | The face is zoomed to about two thirds of the photo area (yesterday's zoom work): good, keep | `app.js showFace` |

## Findings

**Blocker** means it ships nothing until fixed; **Major** is what separates this from a product; **Minor** is polish.

### Blockers

- **B1 — Makeup opens at zero.** Opening Makeup must show a made-up face: a default look at a tuned, natural strength,
  with Original one hold away. *Counter:* a try-on that tries nothing on. *Pocket camera:* the trick must happen on the
  first tap.
- **B2 — No facial landmarks.** With a box only, the lip mask, blush, brows, catchlights and hats are all guesses, so
  the customer corrects them. Everything in this audit stands on fixing this one thing (see "The face pack").
- **B3 — "Align face" on the play screen.** A row of three buttons (Find face, Align face, Reset), five handles, and
  three geometry sliders, shown before any result. The handles survive as "Not quite right?" after the result; the
  Angle / Lip width / Lip height sliders go away entirely (landmarks give the angle and the lips).

### Major

- **M1 — No shade matching.** Lip and blush colours are fixed and the same for every skin. Derive the shade from the
  face itself: the lips' own colour deepened or shifted per look (so "Rose" on a cool complexion is not "Rose" on a
  warm one); blush from the cheek's undertone. *Counter rule:* never a colour the face could not wear.
- **M2 — The masks are templates.** A parabola lip, two blush ovals, ellipses to protect the eyes. With landmarks: the
  real outer and inner lip polygons (teeth protected by geometry, not by a brightness guess), blush on the cheekbone
  line between the eye's outer corner and the nose wing, under-eye only within its band, brows under or over the real
  brows.
- **M3 — Skin smoothing is one blur at one scale.** It can go plastic on a large face. Industry practice: split
  frequencies (keep pores and fine texture, even out the mid-scale blotches), lift only blemishes and the under-eye,
  strength from the face's pixel size, a hard cap. Teeth whitening and eye brightening are missing; a counter's "clean
  skin" look is mostly these.
- **M4 — Face stickers are parts with sliders, not characters.** Brows, eyes, shine and hat are set one at a time with
  Mood, Size and Height sliders. The pocket camera sells **characters**: Evil, Shocked, In love, Manga, Witch, Cat —
  one tap puts the whole face on; tap again for the next variant. Sizes and heights come from the landmarks (the brow
  line, the eye size, the head's crown), never from a slider.
- **M5 — Enhance and Pop are two switches, both off.** Every photo should open already good: one **Auto** the app sets
  from the photo itself (exposure, colour cast, how much skin there is), on by default at a tuned level, with Original
  to compare. Enhance and Pop remain the engines and the fine-tune.
- **M6 — No flourish.** The look lands silently; the finding reads "Finding a face on this device…". The pocket camera
  sweeps a glint over the face while it looks, lands the look with a soft pop and a haptic, and draws the strip's
  thumbnails on your face while you watch.
- **M7 — One face only.** A group photo gets one made-up person. Every face should get the look; tapping a face picks
  it for the stickers.
- **M8 — The copy.** "Check eye and lip alignment before adding colour." and "No clear face found. Use Align face to
  place the guide manually." are instructions to do the app's job. The play screen carries names only; failure is one
  short line with one action: "I can't see a face here. Tap the face?"

### Minor

- **m1 — The six adjusters and the strengths sit at the same level as the one-tap things.** They belong behind a
  **Fine-tune** door at the bottom of the tab.
- **m2 — Two "Find face / Align face / Reset" rows** (Makeup's and Face stickers') for one face.
- **m3 — "On / Off"** under Makeup and Face stickers says nothing; the strip shows which look is on, as Looks does.
- **m4 — Hats are sized by a slider**; the head's crown and width are in the landmarks.

## The design: what "the app does the job" looks like

**Principle.** One tap is a finished result on your own face. Names, not numbers. At most one Strength slider, after
the result, exactly as the Looks strip works today. Handles and numeric sliders exist for the one photo in twenty, behind
"Not quite right?" and "Fine-tune", below the fold.

### 1. The face pack: the whole face, found automatically

- **MediaPipe Face Landmarker** (Apache-2.0): 478 landmarks including the irises, the lip and eye contours, the brow
  lines, the face oval and head pose, plus 52 expression scores. **The repository already ships the model** for the
  Studio's Actor's desk (`avatar-creator/acting/vendor/face_landmarker.task`, 3.7 MB) and runs it in a worker
  (`acting/tracking-worker.js`), so the camera reuses one model and one loader, as it reuses `face.js` for the brows.
- Runs **once, silently, when a photo opens in the editor**, in a worker, image mode, every face, before the customer
  reaches Adjust (about 100–300 ms on a recent phone). The recipe keeps about 24 source-normalised points per face
  (the previous audit's `faces[]` plan), so a save and a re-edit draw exactly what was previewed, and the points stay
  correctable.
- **Cost, honestly:** the runtime is `vision_wasm_internal.wasm` **9.6 MB** (SIMD; Safari 16.4+ and all current Chrome
  have SIMD, so the 9.4 MB no-SIMD file is not needed), its loader 0.2 MB, the bundle 0.14 MB, the model 3.7 MB: about
  **13.6 MB more in the offline bundle** (23.5 → about 37 MB), downloaded once and hash-verified like everything else.
  The Actor's desk fetches the runtime from jsDelivr; the camera must not (offline rule), so it is vendored. The lighter
  alternative, a 68-point TF.js landmarker (about 1.3 MB), has no irises, no inner-lip precision and an unmaintained
  stack; not recommended.
- **Failure path:** no face → "I can't see a face here. Tap the face?"; one tap sets a centre and the landmarker runs
  again on a crop around it; still nothing → the handles ("Not quite right?") placed at the tap, which is today's guide
  as the last resort. Strongly turned or profile faces degrade the same way.

### 2. Makeup as Looks: named, one tap, on your face

- A strip like the Looks strip, thumbnails of your own face with each makeup look, one tap, one **Strength** after it
  (default 100% of a tuned, natural level). First set of eight:
  **Natural** (even skin, own lip colour lifted, clean), **Fresh** (peach cheeks, a gloss, bright eyes), **Clean** (skin
  only: blemishes, under-eye, teeth, no colour), **Soft glam**, **Evening** (defined lip, warm contour), **Bold lip**
  (red or berry, matched), **Sun-kissed** (bronze across the cheeks and nose, warm), **Rose** (one tone throughout).
  Each is a recipe: skin {even, blemish, under-eye}, lips {shade derived from the own lips, finish matte/gloss, define},
  blush {placement, tone}, brows {tidy, fill}, eyes {brighten, catchlight, liner}, teeth {whiten}. "Off" is the first
  tile, as Looks has "none".
- **Shade matching:** the lips' and cheeks' own colour is sampled inside the landmark masks and shifted per look in a
  perceptual space, so every look is one the face can wear. Shade chips (Rose, Peach, Berry and more) move under
  Fine-tune.
- **Sells-the-result rules:** colour exactly inside the lip polygon, teeth protected by the inner lip, nothing on the
  philtrum; blush on the cheekbone line; frequency-split smoothing with pores kept, strength from the face's size,
  capped; under-eye lightened in its band only; eye whites no more than 10% brighter plus a catchlight lift; teeth
  de-yellowed only when the mouth is open. Anything that reads as plastic, bleeding or doubled is a bug, not a setting.
- **Fine-tune** (disclosure, below): Skin, Lips, Blush, Eyes, Teeth strengths and the shade chips.

### 3. Face stickers as characters

- One-tap sets, each a whole face: **Evil** (scheming brows, narrowed eyes), **Shocked**, **In love** (heart eyes, a
  blush), **Manga** (sparkle eyes, shine, drawn finish), **Dizzy**, **Witch** (hat, evil brows, witch ink), **Cat**
  (ears, doe eyes), **Pumpkin**. Tap again → the next variant of the same mood (the Game Boy Camera's cycling). Sizes,
  heights and tilt from the landmarks: the brow line, the eye size and corners, the face oval's crown for hats.
- **Cover the real brows** before drawing drawn-on brows (skin filled from the forehead's own texture inside the brow
  polygon), so Evil brows read as the face's own, not as stickers over it. This is the "Hide my brows" item from the
  previous audit, now possible.
- Finish chosen by the app: drawn for ink Looks (Manga, Pencil), sticker otherwise; the toggle lives under Fine-tune.

### 4. Auto: the good photo first

- Every photo opens with **Auto** on: the app measures the photo (histogram, colour cast, skin share) and sets Enhance
  and Pop to levels that suit it. One switch, one Strength, Original to compare. Enhance and Pop stay as the engines
  and as Fine-tune rows.

### 5. Feel, copy and the tab

- Opening Makeup or Face: a glint sweeps the face while the landmarks run, the look lands with a soft pop and a haptic,
  the strip's thumbnails draw on the face. Names only on the play screen. One-line failures with one action.
- The Adjust tab becomes: **Auto** (switch, Strength) · **Makeup** strip · **Face** strip · **Fine-tune** (door:
  the six adjusters, Enhance, Pop, Skin/Lips/Blush/Eyes/Teeth, the shade chips, Drawn/Sticker, "Not quite right?").
  Two "Find face / Align face / Reset" rows go away; sixteen sliders become one visible (Strength) and the rest behind
  the door.

### 6. Later: live

- The same landmarker in video mode on the viewfinder (the Actor's desk already runs it live): stickers that follow the
  face, makeup live, expression triggers. After the still path is right, and measured on the owner's iPhone first.

## Risks

- **Bundle size** +13.6 MB (above). Worth saying in the offline sheet ("includes the face model").
- **iPhone Safari**: the worker runs the wasm with SIMD (Safari 16.4+); the Actor's desk has not been verified on an
  iPhone either. The first task of step 1 is a 20-line check page on the owner's phone before anything is built on it.
- **Makeup pass speed**: today's per-pixel CPU pass runs on the whole photo at every change; thumbnails for eight looks
  need it at 144 px on the face crop (cheap), but a 16 MP save with five masks is seconds on a phone. Moving masks into
  the GL first pass as textures (as Pop and Enhance are) is the right place; plan it in step 2, not after.
- **Many faces**: the recipe grows per face and the crop mapping exists for one; extend, do not special-case.
- **Nothing unnatural**: the owner's rule for World applies here: bleeding colour, swimming masks or plastic skin are
  bugs, and the browser tests must measure them (lip colour outside the lip polygon = 0 px; smoothing keeps a texture
  measure above a floor; shade within a hue band of the own lip).

## Plan (in order, each step shippable on its own)

1. **Face pack** (2 sessions): the landmarker vendored and in a worker, every face, recipe points, the iPhone check
   page, "Not quite right?" handles derived from landmarks, the three geometry sliders removed, "I can't see a face"
   with tap-to-place. Alone this removes "Align face" from almost every photo.
2. **Makeup Looks** (2–3 sessions): the strip on your face, eight looks, shade matching, real lip/blush/under-eye/eye/
   teeth masks, frequency-split skin, Strength, Fine-tune door; tests that measure the masks.
3. **Face characters** (1–2 sessions): one-tap sets, cycling variants, landmark sizing, brow cover, finish by Look.
4. **Auto** (1 session): per-photo Enhance and Pop levels, on by default, one switch.
5. **Feel** (1 session): glint, pop, haptic, copy, the reorganised tab, the offline sheet's size note.
6. **Live** (later, after the owner's phone measurement).
