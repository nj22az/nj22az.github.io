# Pocket Camera: Ball, with your face — 5 November 2026

The owner (5 November 2026, from the Game Boy Camera study): "I would like 2 also but it seems difficult?", then
"start ball". The Game & Watch juggle with the photographer's own face on the juggler, as the Game Boy Camera's Ball
had the Game Face.

## State

**Published and verified on 5 November 2026.** The owner: "Push to main". Main fast-forwarded to
[`188c0d273`](https://github.com/nj22az/nj22az.github.io/commit/188c0d2739872d668aadd84a140404ddd1b846a9); Pages run
1629 deployed it (success); **16/16 public files match main byte for byte** (SHA-256, cache-busted: the page, `app.js`,
`ball.js`, `unlocks.js`, `camera.css`, `offline.json`, `sw.js`, the four tests, the README, the two notes, a qa
picture, HANDOVER.md). On the live page (headless Chromium, 390 × 844): visible version `v2026.11.05.2`, `app.js` at
`20261105ball1`, the Game Room offering Memory, Blackjack, Solitaire and Ball, Ball's setup with its Pocket face, the
LCD drawn, and sixty ticks of the live game played perfectly by hand: 22 catches, 220 points, three balls in the air,
no drop; no page errors. Release `v2026.11.05.2`, key `20261105ball1`; the offline bundle is **376 files, 37.61 MB**.

## What was built

1. **The game** (`ball.js createBallGame`, pure): two hands, each in or out; balls on two arcs, a low one landing in
   the hand held in, a high one over the head landing in the hand held out; the balls step one segment a tick across
   seven segments; they join from the left hand three segments apart and never while a ball has just left that hand,
   so no two share a segment going the same way; a catch is ten points and shortens the tick (420 ms × 0.975 a catch,
   floor 170 ms); a drop ends the game; a third ball joins at a hundred; five hundred is reported once.
2. **The screen** (`createBall`): the setup (a Pocket face as the juggler until a face is chosen, the album's photos
   with a face found, "Choose a photo" through the face pack, the best score, Play); the LCD on a canvas (the paper,
   every segment faintly, the figure with its arms in or out, the balls on their segments, seven-segment digits, the
   dropped ball on the ground); the two hand buttons and a live status line; the game over with the score, the
   catches, the best, Play again, Other games and a result to share. The clock stops while the page is hidden.
   `step()` ticks once with the clock stopped, for the checks.
3. **Your face** (`cropFace`): the found face's oval from a photo, cut out with a soft edge on a 192-pixel square, a
   PNG data URL kept in the settings (`gameFace`, with where it came from); worn in a ring as the juggler's head.
4. **Five hundred** (`app.js ballWon`): `gameWon('ball')` opens the secret sheet (`unlocks.js`: Ball joins Memory and
   Solitaire; the hint reads "Win a game of Memory or Solitaire, or score 500 in Ball"), and the juggler is drawn alone
   on nothing and added to Mine as a sticker, once per face (`jugglerStickers`), with its own toast after the unlock's.
5. **The Game Room**: Ball is the hub's fourth choice (`#chooseBall`), `openCardGame('ball')` builds it with the
   album's faces and a file picker (`#ballFile`).

Release `v2026.11.05.2`, key `20261105ball1` (the page, `app.js`, `camera.css`, `looks-gl.js`'s address, `ball.js`).

## Verification

`ball.test.mjs` (the game alone: launches three segments apart, the arcs and the hands, a catch's ten points and the
quickening, the drop, the third ball at a hundred, five hundred once, the tempo floor, no two balls on one segment the
same way) and `ball.browser.mjs` 5/5 (Playwright's own Chromium, 390 × 844): the hub's fourth choice, the setup with
a Pocket face and Play; the LCD drawn, the hands moved by a tap on the left half, the right arrow and the Left button;
played perfectly by stepping the game, the score passes five hundred with three balls in the air, the secret sheet
opens, `wins.ball` and `jugglerStickers` are kept and the two toasts come; a drop ends it with "Five hundred!", the
score and catches, the best kept, Play again, Other games and the two share buttons; the test portrait saved to the
album is offered, its face cut out (a 192-pixel PNG, opaque in the middle, clear at the corners, skin-coloured) and
worn on the LCD. Looked at (`qa/2026-11-05-ball/`): the setup, the LCD, five hundred with the sticker's toast, the
photograph as the head, the juggler sticker alone.

The whole regression, as the workflow runs it: every `tests/*.test.mjs` passes (21 files); camera 56/56, crop 33/33,
enhance 22/22, save-share-layout 14/14, paper 5/5, integration 9/9, sticker-contour 4/4, ui 82/82, audit 59/59, smart
14/14, offline 13/13, retouch 40/40, screens 5/5, face-stamps 12/12, backup 7/7, pop 5/5, zoom 13/13, face-pack 4/4,
auto 5/5, theme 5/5, defaults 4/4, background 3/3, comic 4/4, album 3/3, faces 7/7, ball 5/5. Crop failed its "dot at
the crop position" check inside the run, as it did in the Pocket faces run, both times while another browser job of
mine ran beside the regression; alone it passed 33/33 again (and offline 13/13 against the final bundle). That check
is timing-sensitive under load, not a change in the crop.

## After publication: finding Ball, and the earlier version showing first (`v2026.11.05.3`)

The owner, with the release live: "I can't find the ball game and the loading of the app loads a different screen ui
first what happens". Two things:

1. **Where Ball was.** Only on the Game Room card under the album's photos; the round button in the album's bar opened
   Memory alone. The button now opens the Game Room (`#openGames`, `openCardsHub`), with Memory, Blackjack, Solitaire
   and Ball one tap away; the empty album's Play still opens Memory.
2. **The earlier version first.** The installed app is served from its offline bundle, so the first launch after a
   release shows the previous version while the new bundle (37 MB) downloads in the background; it then said "Update
   available" in Settings and waited for a tap, or for the next launch. Now a ready update refreshes the app by itself
   while nothing is going on (`offline.js autoReload`: the first screen before the camera runs, or the album; never
   while shooting, editing, viewing or playing, and never over an open edit), and the refreshed app says "Pocket
   Camera updated to v…" once. `offline-update.test.mjs` covers it (an open edit is kept, a busy screen waits, idle
   refreshes). The first paint of the previous version cannot be avoided in an offline app; it now lasts the download.

Key `20261105games1` (the page, `app.js`, `offline.js`, `camera.css`, `camera-ui.css`, `looks-gl.js`'s address);
release `v2026.11.05.3`. **Verification:** the whole regression again, every `tests/*.test.mjs` (21 files, the update
test now 8 cases) and all 25 browser suites passing; the camera suite failed once inside the run on its own
expectation (Memory opened from the Game Room closes back to the room, not the album) and passed 56/56 alone once the
test followed that path. **Published** on the owner's "Push to main": main fast-forwarded to
[`1191fee7e`](https://github.com/nj22az/nj22az.github.io/commit/1191fee7ee5982118ad7348acea866d6675be868), Pages run 1631
(success), **12/12 public files match main byte for byte**; on the live page (headless Chromium, 390 × 844): visible
version `v2026.11.05.3`, `app.js` at `20261105games1`, the album bar's round button labelled "Game Room: Memory,
Blackjack, Solitaire and Ball" opening the room with its four games, Memory's Back reading "Games" and closing back to
the room, Ball opening; no page errors.

## Rebuilt on the owner's notes: four frames, and the hands as the original's (`v2026.11.06.1`)

The owner, 6 November 2026: "The ball game should have four frames and the ball game doesn't quite work as you made
it". The Game Boy Camera's Ball took four photographs of the player in four blank ovals and showed them in turn on the
juggler; its hands move together to the side pressed. So:

1. **The hands swing together** (`createBallGame`): `hands` is a side, `moveHands(side)` puts both there; a tap on a
   half of the LCD, the arrows, A and D, or the two buttons choose the side (no more in-and-out toggles per hand). One
   path over the head, seven segments; a ball is caught when the hands are on its side as it comes down and is thrown
   straight back. The balls set out on their own ticks of the crossing (the first from the left on tick 1, the second
   from the right on tick 4, the third from the left on a tick ≡ 2 modulo 6), so no two ever come down on the same
   tick: a perfect player is never asked for both sides at once (`ball.test.mjs` proves it over a three-thousand-tick
   perfect game). Two balls at first, the third at a hundred; every hundred points gives a breather (the tempo eased by
   a quarter, as the original slowed after each hundred), every catch quickens it to a floor; five hundred once.
2. **Four frames** (`createBall` booth, `cropOval`, `boothOval`): "Take four faces" opens the front camera in a square
   view with a dashed oval to hold the face in; each tap of Take cuts the oval out of the mirrored frame with a soft edge
   (160-pixel PNGs); four of them are kept as `gameFace.frames` (`from:'booth'`), shown as thumbnails with Use these or
   Again; the juggler's head changes between the frames every other tick. A photo's face is one frame; an older
   `gameFace.url` is read as one frame. The main camera is stopped while the Game Room is open, so the booth has the
   camera to itself; a refused camera is said in the booth and the photo choices remain.
3. **Verification**: `ball.test.mjs` (the hands' side, the launches, a catch thrown straight back, the drop, no two
   balls coming down on one tick, the third ball, breathers, five hundred once, the tempo floor) and `ball.browser.mjs`
   6/6 with Chromium's fake camera: the hub, the swing by tap, arrow and button, five hundred and its rewards, the drop,
   the booth's four distinct frames (each opaque in the middle and clear at the corners) and the head changing between
   ticks, the album's face worn.

Release `v2026.11.06.1`, key `20261106ball2` (the page, `app.js`, `ball.js`, `camera.css`, `looks-gl.js`'s address).
**The whole regression:** every `tests/*.test.mjs` (21 files) and all 25 browser suites pass, ball 6/6 among them; crop
failed once more inside the run on its "dot at the crop position" check and passed 33/33 alone, so that check now waits
for the eraser's fill itself rather than for the Undo button, which the worker's fill can trail under load.
**Published** on the owner's "Push to main": main fast-forwarded to
[`cb65a356e`](https://github.com/nj22az/nj22az.github.io/commit/cb65a356e45eea1c667ae62bf8f24c54dded6275), Pages run
1633 (success), **13/13 public files match main byte for byte**; on the live page (headless Chromium with a fake camera,
390 × 844): visible version `v2026.11.06.1`, `app.js` at `20261106ball2`, Ball's setup offering a Pocket face, the
booth and a photo, the live booth taking four distinct faces, and sixty perfect ticks of the live game: 22 catches, 220
points, three balls in the air, the head on its third frame; no page errors.

## Open

- The LCD figure is drawn in code; a Game & Watch body round it (the silver case, the two buttons as real ones)
  would be the next look.
- Game A of the original (one point a catch, two balls) is not offered: one game, two balls then three.
- The juggler sticker is one per face; a new face earns a new one.

## How to pick this up

```bash
node camera/tests/ball.test.mjs                  # the game alone
node camera/tests/ball.browser.mjs               # the screen, five hundred, the drop, your face
node tools/build-camera-offline.mjs              # after any camera file changes
```
