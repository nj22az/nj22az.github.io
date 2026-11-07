# Pocket Camera: the Pocket faces, the secret sheet and the dancing greeter — 5 November 2026

The owner, on 5 November 2026, after asking for a look at TCRF's pages on the Game Boy Camera ("see if it can make our
app more fun in any way"): "Build 1, 3 and 4, I would like 2 also but it seems difficult?". This is 1, 3 and 4: the
error faces with captions, a secret sticker sheet unlocked by a game win, the dancing greeter. 2 (Ball with your face)
is the next round.

## State

**Published and verified on 5 November 2026.** The owner: "Push to main". Main fast-forwarded to
[`035ff8744`](https://github.com/nj22az/nj22az.github.io/commit/035ff87445d9332126a10b8ee43ac4f5121fc560); Pages run
1628 deployed it (success); **19/19 public files match main byte for byte** (SHA-256, cache-busted: the page, `app.js`,
`stickers.js`, `memory.js`, `solitaire.js`, the two new modules, the two stylesheets, `offline.json`, `sw.js`, the
sheet's manifest and two of its pictures, the two new tests, the README, this note, HANDOVER.md). On the live page
(headless Chromium, 390 × 844): visible version `v2026.11.05.1`, `app.js` at `20261105fun1`, the greeter dancing
(`welcome-dance`), the sheet served with its eight faces and their lines, a non-picture met by the oops face beside
"That is not a picture", the Faces tab a lock in the editor with its hint; no page errors. Release `v2026.11.05.1`,
key `20261105fun1`; the offline bundle is **375 files, 37.58 MB** (the sheet's 16 pictures and its manifest joined it).

## What was built

1. **The faces** (`tools/draw-pocket-faces.mjs` → `camera/stickers/pocket-faces/*.png` and `pocket-faces.json`). The
   residents' heads are found by the camera's own face pack on their Pixar sticker sheets (looked for in a window
   round where a standing figure's head is, then the whole sticker), cropped with room for the hair, drawn on a grey
   wall through the Pocket Look at 256 × 224 (the Camera's 128 × 112 in two-pixel cells), then scribbled over on the
   landmarks in the darkest green with a hand's wobble, the marks sized to the eye distance (the iris is small on a
   drawn face) and haloed in the lightest green where they fall on hair. Eight faces, each with its line: run (Thuan
   fuming: "Who are you running from?"), hide (Thao shushing: "Who are you hiding from?"), oops (Thuan, jaw dropped),
   silly (Johansson huffing: "Don't be so silly!"), full (Johansson aghast: the thirtieth photo), secret (Thao, ta-da:
   the sheet won), wait (Thuan rolling her eyes) and nope (Johansson thinking). The sheet is `kind:'secret'`,
   `locked:'game'`, with a `note`; its stickers carry the lines as their balloon lines.
2. **Where they appear** (`pocket-faces.js`, `app.js`): `toast(text,{face})` puts the face beside the message;
   every failure toast (not a picture, could not be opened, saved, erased, shared, made into a sticker, pasted, the
   hat, the stickers, graphics restarted, the dice) takes `errorFace()`: one of oops, nope and wait, and one time in
   eight the rare silly. "The Looks are still getting ready" takes wait. `showWelcome(note)` meets a refused or
   missing camera with the hide face and its line in italics above the explanation. Cancel in the editor after a
   change says the run face's line (`editFingerprint`: layers, adjust, stickers, frame, crop, paper, stamps, enhance,
   pop, trick, the makeup's look, strength, shade and tune, a new cut-out, an erased picture; the found faces, the
   guide and a saved cut-out coming back do not count). The thirtieth photo in the album (`keep()`) says the full
   face's line after the save's own message.
3. **The unlock** (`unlocks.js`): `recordWin(saved,game)` counts wins per game and opens what the game opens
   (`UNLOCKS`: the Pocket faces by Memory or Solitaire; a Blackjack win counts and opens nothing); `isUnlocked`,
   `unlockHint`. `memory.js` and `solitaire.js` take `onWin` (Solitaire reports once per game); `app.js gameWon` writes
   the settings, says the secret face's line, and re-draws the picker if it is open. The picker shows a locked sheet's
   tab with a lock and an aria label, and its panel with the sheet's note and the hint; `residentSets` leaves secret
   sheets out of the greetings and the cheer, `secretSets` adds the won ones to Memory's decks.
4. **The greeter dances** (`camera-ui.css`, `app.js`): `.welcome-sticker.dancing` hops and sways at `--dance`;
   `setDance` steps among three tempos (1.1 s, 0.72 s, 0.46 s), a tap on the hero steps round, Up and Down step up and
   down while the welcome is up; reduced motion keeps the animation off and the tap and keys quiet.

Release `v2026.11.05.1`, key `20261105fun1` (the page, `app.js`, `camera.css`, `camera-ui.css`, `stickers.js`,
`memory.js`, `solitaire.js`, `looks-gl.js`'s address, the two new modules); the offline bundle picks the new sheet up
from `camera/stickers/`.

## Verification

`unlocks.test.mjs` (12 asserts) and `faces.browser.mjs` 7/7 pass (Playwright's own Chromium, 390 × 844): the greeter
dances and the tap and arrows step the tempo; the refused camera shows the hide face and its line; a failure's toast
carries a face; Cancel after a change says "Who are you running from?" and Cancel without one is quiet; the secret
sheet's tab is a lock with the hint and no stickers; a Memory win (six pairs of the cartoon Thuan) brings the secret
face's toast, `unlocked` and `wins` in the settings, the eight faces in the picker, one placed on the photo, and a Memory
deck of them on "Other cards". Looked at: the contact sheet (`qa/2026-11-05-faces/pocket-faces-sheet.png`), the refused
camera, the Cancel toast on the welcome, the lock tab's note in the editor, the unlock toast over Memory.

The whole regression, as the workflow runs it: every `tests/*.test.mjs` passes (20 files); camera 56/56, crop 33/33,
enhance 22/22, save-share-layout 14/14, paper 5/5, integration 9/9, sticker-contour 4/4, ui 82/82, audit 59/59, smart
14/14, offline 13/13, retouch 40/40, screens 5/5, face-stamps 12/12, backup 7/7, pop 5/5, zoom 13/13, face-pack 4/4,
auto 5/5, theme 5/5, defaults 4/4, background 3/3, comic 4/4, album 3/3, faces 7/7. Three suites first failed on the
new tab: camera and ui counted seven sticker tabs (the row squeezed eight named tabs and clipped them, so the secret
sheet's tab is the lock alone until it is won, "Faces" after), and sticker-contour, smart, zoom and offline imported
`stickers.js` at the old key (a second copy of the module with no sheets loaded); crop failed once under the load of a
parallel run and passed twice alone. The eight touched suites were run again after the fixes, every one passing.

## Open

- **Ball with your face** (the owner: "I would like 2 also"): a Game & Watch juggle in the game room with the
  photographer's cut-out face as the juggler's head, 500 points opening more. Next round.
- The faces are the residents'; the owner's own scribbled staff photographs, as the Game Boy Camera had, would need
  the owner's photographs.
- A Blackjack win counts in `wins` but opens nothing; a second secret sheet could hang on it later.

## How to pick this up

```bash
node tools/draw-pocket-faces.mjs --sheet         # redraw the faces (and a contact sheet beside the folder)
node camera/tests/unlocks.test.mjs               # what a win opens
node camera/tests/faces.browser.mjs              # the greeter, the refused camera, the toasts, Cancel, the lock, the win
node tools/build-camera-offline.mjs              # after any camera file changes
```
