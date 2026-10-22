# Handoff, 22 October 2026 (afternoon)

Read first: `CLAUDE.md`, `AGENTS.md`, `johansson-town/AGENTS.md`, then `HANDOFF-2026-10-22.md` (this morning's) and the
two of 21 October it points to (the morning one has the working recipe). This note says what was done since.

## Checked at the start
#342 (benches), #340 (Linux 0.2.16, into `codex/johansson-world-steam-deck`) and #346 (handoff) were all merged already.
Nothing to finish there.

## The owner's three jobs of 22 October

| Job | PR | State when written |
|---|---|---|
| 1. Seated poses for chairs, stools and cushions; two places on the indoor benches; the clinic bench's facing | **#351** `claude/seated-chairs` | Open. CI green (guard, linux). **Visual: merge only on the owner's word**, after the before/after photos (sent; also in `docs/qa/seated-interiors/`). |
| 2. Comic backdrops for the town hall, the school and the clinic | **#352** `claude/civic-backdrops` | Open, **stacked on #351** (base `claude/seated-chairs`). Retarget it to `main` once #351 is merged, merge main in with the runtime recipe, rebuild. Visual: owner's word. Sample comics in `docs/qa/civic-backdrops/`. |
| 3. One group of the already-failing tests, into the CI guard | **#353** `claude/tests-retired-cast` | Open. Tests only (no game change); the guard is 63 files. |

### 1. What #351 does
- Every seat a player or resident sits on says where its front edge is (`front`, seat-slots.js), measured on its own
  mesh: the home table seats (`tableSeatFront` on every home layout, read by `home-seats.js` and `home-residents.js`),
  Minato and Sato Ramen (`SHARED_DINING_SEAT_FRONT`; residents via `indoor-residents.js`), the onsen's wash stools,
  tatami edge and massage chair, the ferry hall, office, classroom, Sakura's office, Front-Row's chair, the beach chairs,
  and Higa Liquor's bench and crate stools and the laundry bench (`stand-seat.js`). Comics carry it too.
- Domestic arrivals (three), the clinic, the police lobby and Umi-no-yu's changing bench seat two (`benchSeat`).
- The clinic bench faces the waiting room (its back is to the partition): `yaw: Math.PI`.
- Tests: `tests/seat-edge.mjs` measures a seat's front edge, back and thickness by rays and builds the rooms
  (`seatRooms()`); `seat-layouts.test.mjs` checks every seat's `front` against its mesh (1 cm); `seated-pose.test.mjs`
  sits the eleven bodies on eight real seats from the rooms as well (57 s). Without the data, feet go 7–20 cm into them.
- Photo harness: `node tools/seated-interior-photos.mjs <out> [--site=<main worktree>]`.

### 2. What #352 does
- `shot.camera` for `town-hall` (room `community-kitchen`), `school` and `clinic` in `src/feed/places.js`; all three
  are `captured:true`. The school is shot at noon on 22 October (`time:294*1440+720`): the blackboard prints the day,
  and the renderer's default day is 1 January.
- Run: `TOWN_CHROMIUM_PATH=/opt/pw-browsers/chromium node tools/render-feed-backdrops.mjs town-hall school clinic`
  (about 4 minutes a place, alone).

## Found on the way (not done)
- **The Community Hall kitchen is bare**: the booking sheet is a blank cream box, the back wall has a large plain grey
  board, nothing on the request box. Comics there look empty. A dressing pass (writing on the sheet, the register, the
  petitions) would serve the stories; recapture `town-hall` after it.
- **Two Dr Kakazus**: the cast's resident (short dark hair, white sweater) and the clinic room's `DOCTOR_RECIPE`
  (ponytail, white coat) differ. Comics use the cast's.
- The clinic's comic view has no seat in it (the bench is in the waiting room behind the camera), so everyone stands
  there; the patient's stool is not a seat record.
- Higa Liquor's yuntaku bench says `front` 0.19; its drawn slats end about 0.16 ahead of the mark (#342's number).
- Still posing without `front`: the fixed-pose people (the clinic doctor, the school figures, Higa at the bandai,
  Ganaha at the port hall, Fujita's chair), and comic backdrops captured before #351 (`render-feed-backdrops.mjs
  --seats-only` refreshes only the seat records, cheaply).
- Umi-no-yu's outdoor bench ("Cool off on the bench") is a GLB streamed in later; it still has one place and no `front`.

## The Linux controller
Not touched. The owner asked to be asked first, before the controller code changes again: **which Bluetooth pad and
which Linux distribution** (Steam Deck desktop mode or another PC). See `HANDOVER-LINUX-JOYSTICK-2026-10-22.md`.

## Still open from earlier handoffs
English signs, the gajumaru crown, the park keepers' routines, Higa's evening bench, the other failing-test groups
(about 36 files: see the morning handoff of 21 October; the "undefined property" group is #353), performance.

## Working notes
- Worktrees this session: `scratchpad/{seats,backdrops,tests3,handoff,main}` of session bbcdc04d. Leave them alone.
- Run the guard and any browser one at a time: each takes 6–7 minutes alone, much longer together.
