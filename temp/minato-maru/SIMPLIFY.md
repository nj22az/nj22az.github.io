# Minato Maru: what can go, what stays, what both ships share

The owner, 11 November 2026, after the 68 m Chisum was published: "I'm thinking the Minato Maru can be simplified , this
is an additional ship", then: "So let's see what can be removed from Minato Maru and what can be cross used".

**This changes the plan.** Until now the Chisum was to be the lead ship and the Minato Maru was to be "rebuilt later from
what she teaches" (the owner, 9 November). Now the Chisum is a ship of her own beside the Minato Maru, and the realistic
engineering has a home in her. The Minato Maru is free to be what Johansson World needs: the town's cartoon ferry, which
sails, is boarded, is worked by her crew and makes stories.

**Later the same day the owner settled two things**: "Minato Maru only needs a crew of two an engineer and a skipper", and
"Chisums is a real ship"; "make a plan on how to proceed here". The plan is [`ferry/PLAN.md`](../../ferry/PLAN.md); where this
file spoke of her crew of eight it has been brought into line with it (sections 2 and 3).

**This file is the stock-take. Nothing has been removed.** It was made by reading the Town
(`nj22az/johansson-town`) at commit `f0b2973`: the Town's `main` of 9 November (`fc7281f`) plus the four ferry commits
kept in this folder. The Town's `main` has had 22 files changed since (to `8a9b2e0`), none of them the ferry's. "Used by"
below was read from the modules' import lines, not from the running game. The cloud session cannot push to the Town.

## 1. The Minato Maru today

| | |
|---|---|
| Code in the game | 39 modules, about 7,400 lines (`src/world/ferry*.js`, `minato-berth.js`, `airport-ferry.js`, `src/people/ferry-*.js`, `src/render/ferry-*.js`, `src/ui/ferry-*.js`). The modules named `minato-compact-*`, `minato-bar`, `minato-facade` are the bar ashore, not the ship |
| Tests | 35 files, about 3,500 lines |
| Tools | 23 that are the ship's, about 3,900 lines (drawings, CAD, audit, picture-taking, the Blender builders of her engine room and bridge fittings, the viewer export) |
| Drawings and papers | `docs/minato-maru/`: 25 MB in 174 files (12.6 MB of it Rev C, which is in this folder only and was never merged into the Town) |
| Art and models | `art/ferry-*`: 11.8 MB in 21 files; `assets/models/ferry-engine-room/`: one 3.4 MB model the game loads |

## 2. What can go

### Level 1: no one playing would notice (recommended now)

| What | Where | Size | Why it can go |
|---|---|---|---|
| The working drawings, Rev B and Rev C, and the exterior sheets | `docs/minato-maru/cad-revb/`, `rev-c/`, `exterior/` | 24 MB | A yard's drawings of a ship that is no longer to be rebuilt as a real one. The Chisum has her own (`ferry/yard/`) |
| The design book and CAD tools | `tools/ferry-drawings.mjs`, `ferry-cad.mjs`, `ferry-cad-core.mjs`, `ferry-exterior-cad.mjs`, `ferry-engine-room-cad-h1.py`, `ferry-audit.mjs`, `ferry-status.mjs` | 2,000 lines | They draw and audit the sheets above |
| The engine room's renders, CAD and evidence | `art/ferry-engine-room/renders/`, `cad/`, `docs/qa/ferry-engine-room-*` | 11 MB | Evidence for a model, not the model |
| Two modules nothing in the game uses | `src/world/ferry-engineering-hydrostatics.js` (198 lines), `ferry-machinery-design.js` (219) | 417 lines | Only their own tests and `ferry-status.mjs` read them |
| The viewer export | `tools/ferry-viewer-export.mjs`, `ferry-viewer-export.page.js` | 431 lines | It wrote the first Chisum's data from the Minato Maru. The Chisum starts from nothing now |
| The tests of all the above | `ferry-cad-rev-c`, `ferry-design-book`, `ferry-engineering-hydrostatics`, `ferry-machinery-design`, `ferry-status` | 5 files, 320 lines | They go with what they test. `ferry-exterior.test.mjs` stays: it guards faults of the ship in the game (mooring lines, the name board, the ramp) |
| In the Office (this repository) | `release-evidence/minato-engine-*` (6.7 MB, on `main`); this folder (17.7 MB) and `ferry/design/` (8.6 MB), both on the work branch only | 33 MB | The bridge survey did its work: the Chisum's bridge is built from it. This folder is only a carrier for Town work (see 5) |

In the Town that is about 23 MB and 3,200 lines off `main`, and 12.6 MB of Rev C that never has to go in; in the Office 33 MB. No change to what is seen or played.

### Level 2: seen aboard, but small (the owner's call)

| What | Where | What changes aboard |
|---|---|---|
| Her pipes, cables and tags as a yard draws them | `ferry-kks.js` (117), `ferry-electrical.js` (281), `ferry-piping.js` (242), `ferry-pipe-routes.js` (132) | The engine room loses its routed pipe runs in system colours. **The plant depends on two of these** (`ferry-plant.js` reads the piping and the feeder list), so the plant must first get a short list of its own: two engines, three generators, the pumps that matter |
| The Blender engine room | `assets/models/ferry-engine-room/*.glb` (3.4 MB), `ferry-engine-room-asset.js`, `ferry-engine-room-plan.js`, `tools/blender/build-ferry-engine-room-h1.py`, and `src/render/ferry-fixed-camera.js` with its test, which only look at that model | The engine room is drawn by the game's own simple shapes again (the fallback it already has), in the World's cartoon style. One less download on a phone |
| The posted safety plan | `ferry-safety-plan.js` (133) | The plan on the wall in the lobby, the saloon, the corridor and the booth becomes a plain poster, or goes |
| The bridge's small machinery | `ferry-bridge-wipers*.js`, `ferry-bridge-lantern*.js`, their three Blender builders, `assets/models/ferry-bridge/` | Wipers and the lantern's wiring become simple shapes |

### Her crew, from eight to two (the owner's decision; `ferry/PLAN.md`, phase D)

This is the one removal that changes the town, so the plan sets it out step by step: who the two are, what becomes of
the six who sign off (nobody leaves the cast by this file), the bosun's rota that half the town's trade reads, who does
the work of eight, and the save's migration. In files: `FERRY_MANNING` (`ferry-ship.js`), `SHIP_POSTS` (`people/roster.js`),
`people/ferry-crew.js`, `ferry-crew-aboard.js`, `ferry-operations.js`, `ferry-vehicle-securing.js`, and their tests.

### Her rooms

With two aboard she needs two cabins and a small mess; the other crew cabins and the galley for eight can go or become
stores. The saloon, the car deck, the bridge and the engine room stay: they are where the stories are, and Johansson is
her engineer. `ferry-interior.js` (1,383 lines) loses its engineering dressing and the rooms nobody lives in any more.

## 3. What stays

| What | Where |
|---|---|
| She sails: her paths in the harbour, her timetable, the departure work, both berths, the crossing for passengers and cars, the quick crossing | `ferry.js`, `ferry-paths.js`, `ferry-timetable.js`, `ferry-sailing-profile.js`, `ferry-operations.js`, `minato-berth.js`, `airport-ferry.js`, `ferry-quick-crossing.js`, `ferry-vehicle-securing.js` |
| Her crew: a skipper and an engineer, their work aboard, and the line hands ashore as now | `src/people/ferry-crew.js`, `ferry-crew-aboard.js`, `ferry-crew-walk.js`, `ferry-shore-crew.js` (read by the fish market, the trade round, the laundry, the kissa, the canonical day) |
| She is boarded and walked | `ferry-model.js`, `ferry-interior.js`, `ferry-walk.js`, `ferry-boards.js`, the exploration view |
| Things to look at, and the words they give | `ferry-inspect.js` |
| The chief engineer's work: stop an engine, start a generator, a blackout | `ferry-plant.js`, `ferry-plant-controls.js`, and the ship's own figures in `ferry-ship.js` (loads, scenarios, manning, her day) |

## 4. What both ships can share

### From the Minato Maru to the Chisum (her engineering finds its home)

| What | Use aboard the Chisum |
|---|---|
| The plant and its rules, the load list and the five conditions (sea, arrival, loading, night, blackout) | The pattern for the Chisum's machinery section and her load balance (yard documents JS6-601, JS8-852), which are next to be built |
| Piping system by system, KKS tags, the feeder and cable rules | The start of her system diagrams (JS7-701 to 706, JS8-801, JS8-851). Her register already carries a KKS column and already sizes circuits by the Minato Maru's rule |
| The hydrostatics screening and the machinery design basis | The method for her hydrostatics and first stability check (JS1-104, JS1-107), neither made yet; the engine "on the pattern of the Scania DSI 11" (JS6-603) |
| The safety plan's pen and symbols | Her fire control and safety plan (JS4-411), which is to do |
| The Blender engine room's machines | A library to start her engine room from: engines, gearboxes, generators, pumps. Her gearbox flanges are waiting |
| The departure sequence, the timetable, the crew's posts | Hers the day she sails in the World |

### From the Chisum to the Minato Maru

| What | Use aboard the Minato Maru |
|---|---|
| The line's mark and name (Johansson Line, the J on the funnel) | Two ships of one line: the same mark on her funnel |
| The defects found in her while the Chisum was built (this folder's README lists about a dozen: a ladder trunk through the hull's bottom, shafts that join nothing, the lobby floor over the stairwells, 15 doors on walls with no opening, rooms with no way in, a stair with 1.55 m of headroom) | A list to put right, or to make moot: a room nobody can reach can simply go |
| The three yard standards and their checks (stairs, nothing in the air, no z-fighting) | The rules for whatever of her is redrawn. The Town's own `z-fighting.mjs` was fixed in this work and is worth keeping |
| The drinks machine | The same machine in her saloon. It came from the World in the first place |
| The viewer (`/ferry/`: lift her decks, cut her, walk aboard) | A second ship in the same viewer, if the owner wants the Minato Maru shown there |
| The Chisum herself, as a simple outside shape | A second ship seen in Minato's harbour. She is 68 m and the berth is built for 34.5 m, so where she lies is a decision |

## 5. This folder

It holds the Town work of 9 November for bringing back "at the weekend". With the Minato Maru simplified, most of it need
not go back at all:

| Bring back to the Town | Leave behind |
|---|---|
| The fixes in `src/world/ferry-interior.js` (49 lines in, 31 out); `tests/ferry-z-fighting.test.mjs` and `tools/z-fighting.mjs`; the engine room model that no longer flickers, if the Blender engine room stays (level 2) | The Rev C drawings (12.6 MB), the CAD tools and their test, the viewer export, the handover brief for Rev C |

Then this folder is deleted, as its README always said.

## 6. For the owner to decide

0. **The crew of two**: who they are, and what becomes of the other six (`ferry/PLAN.md`, section 6, questions 1 and 2).
1. **How far.** Level 1 only, or level 2 as well? Level 1 is safe and could be done in one sitting in the Town. Level 2
   changes what is seen in the engine room and should be looked at before it is kept.
2. **Whether the Chisum enters Johansson World** as a second ship of the line, and where she lies and sails.
3. **Whether the Rev C work is dropped** rather than brought back (section 5).

## 7. How to do level 1 (when the owner says so)

In a clone of the Town, on a branch: remove the paths of the level 1 table; remove their tests' lines from
`tests/ci-guard.txt`; run `npm run build:runtime`, `node --test tests/`, `node tools/ci-guard.mjs`; load the
game and cross on her once. Nothing in `src/` that the game imports is touched at level 1, so the built game should be
the same but for its size. That has not been tried: this file is a reading, not a rehearsal.
