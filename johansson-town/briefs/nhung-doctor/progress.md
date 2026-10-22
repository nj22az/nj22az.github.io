# Progress: Nhung becomes the island doctor

## Task
See `sources/task.md`. Started on `claude/laughing-rubin-6p25x2`; finished on `claude/clever-ride-qdpo8s` (the same
commits, then the finishing ones; nj22az.github.io). The owner's finishing brief of 22 October (evening): fix the tests
that fail only because of this change, give Nhung's red car a doctor's purpose out of surgery, render her portraits and
look at them, rebuild the runtime last, the CI guard alone, a separate review, a PR to main (merged only on the owner's
word), then the queued Higa Liquor step.

## Outputs
- The change on `claude/clever-ride-qdpo8s`, PR to main (see HANDOVER.md for its number and state).
- Portraits: `assets/images/residents/07.webp` (Nhung), the shoot's `nhung-1`, `nhung-2` and `koji-2` (Kōji's photo with
  her); `guide/portraits.json`, `resident-guide.js`.
- The before/after sheet: sent to the owner in the session, not committed (scratchpad `nhung-before-after.png`).

## Completed
- Audit of the two doctors (clinic look chosen).
- Roster: `dr-ken` retired into `nhung`; the doctor's flat retired; people/cast.js Nhung's day, pairs, keepers.
- Avatars: Nhung = the clinic doctor's look; `FORMER_NHUNG_RECIPE` kept; Dr Kakazu in RETIRED_RECIPES.
- `people/clinic-hours.js`; social.js (surgery, evening paper at Front-Row, Saturday afternoon off, Sunday at Sakura);
  schedules.js place `paper` (indoors at Front-Row); workplaces.js (clinic, OWN_STAFF_ROOMS).
- Sakura: shut on Saturdays (rota, signs 土曜定休, paperwork, small office, staff board); Higa's Sakura drop on Friday.
- Merchandising: Front-Row's stationery trade to Sakura; the Front-Row invoice gone.
- Front-Row room text: honesty tin, reading copies stay; bookshop visits stopped.
- Dr Kakazu's references moved to Nhung (laundry, parking bay, places, belongings, products, guide).
- Guide: Nhung's article rewritten; Dr Kakazu's moved to RETIRED_ARTICLES; residents.json regenerated.
- Docs: root CLAUDE.md trade line; johansson-town/AGENTS.md owner's decision section.
- Finishing session (22 October, evening; `claude/clever-ride-qdpo8s`):
  - The eleven tests that failed only with this change, updated where they stated the old arrangement: lot-dressing
    (bay 2 is Nhung's), island-businesses (Nhung's work is the clinic, nobody keeps Front-Row's floor; the old shop's
    worker is Nhung at the paper at 19:40), resident-belongings (Front-Row's stationery is Sakura's: the five things
    bought there now come `from:'sakura'`), retired-recipes (eleven retired, nine drawn, the live 25), ship-posts (the
    roster is 25), sakura-evening-guests (her errand at Sakura is 17:00–18:00, after surgery), town-talk (her role).
  - Front-Row draws Nhung at the back bench while her plan says `paper` (`workplaces.js` EVENING_DESKS, `workRoomOf`;
    `workplace-residents.js`): before, the room was empty while she was "indoors" there. Her bookshop mornings
    (`stand-sequences.js` frontrow-morning) are gone; frontrow-paper's words are the evening's.
  - Her red car (`town-traffic.js`): the clinic's medicines from the airport freight, Mondays and Thursdays on the
    21:38 boat in and the 22:15 out (`weekdays` on an appointment), never in surgery; Wednesday evening is her laundry.
  - The clinic room draws her at her desk only when her own day has her at work there, read at the door (`buildClinic`
    `doctorIn`, game.js), with "Talk to Dr Nhung" (her conversation, so the cookery-book favour's "call in at the
    clinic" can be done); out of hours the stool and the scales say the doctor is out. Before, the room drew the doctor
    at all hours (as it did Dr Kakazu), so on a Sunday she was at her desk and behind Sakura's counter at once.
  - The avatar's open front (jacket, cardigan) is chosen by angle round the body, not distance across it
    (`avatars/build.js` torsoColour): on a narrow-waisted body the next column's triangles came in and the shirt was a
    jagged zigzag (Nhung's sage shirt; the old bookseller jacket too). Neutral bodies draw exactly as before.
  - Leftover old-canon text: Sakura's flyer ("closed Saturdays"), the town papers regenerated (the clinic notice said
    the doctor lives behind the clinic), the small office's calendar writes both marks on the 31st (Higa and pay), the
    wardrobe notes, a chat clue, the doctor's bag ("on foot or by car", she has the bay-2 car).
  - The sisters test no longer passes without looking: there is no play day (see Open issues), so it reports a todo.

## Decisions
- ~~Sakura on Saturday opens at 13:00~~ (first considered; superseded by the owner's Saturday closing below).
- `clinic` is in `RETIRED_HOMES` landing on itself: the id also names the clinic, which stays, so a saved `clinic` or
  `home-clinic` lands at the clinic (`retiredHomeFallback` keeps it; the registry shows no fallback).
- Saturday (the owner, 22 October, asked): Sakura shuts on Saturdays; Higa's Sakura delivery moves to Friday; Nhung's
  day off is Saturday afternoon. (Supersedes the 13:00 opening first considered.)
- The clinic room keeps drawing the doctor at her desk itself; Nhung's walking body is never borrowed into the clinic.
- The sisters' jan-ken-pon in the park (14:40) does not happen while the clinic is open, so on weekdays Thuan takes her
  walk instead; the game survives only if the clinic is shut at that time.
- The red car keeps its home at the airport yard (the fleet's model); its run is on the timetable's evening boats so no
  surgery and no laundry evening is touched. The fleet's other appointments (10:00, 13:00) do not match the timetable
  either; that is the fleet's, not this change's (all five owned-vehicles tests fail on the base commit).
- Front-Row's door hours in `town.js` isOpen (closed at weekends, 9:00–18:30) only set a flag nothing reads; rooms open
  at any hour, so the player can walk in on Nhung at the paper. Left as it is.

## Open issues
- The owner (22 October): texts written before the consolidation still count the old island. Fixed in the clinic (the
  couch: Vy, Riku and Mai, and Kōji the one fisherman; the X-ray: Fujita, not the retired Ōshiro). Still open, not part
  of this change: the classroom's pupil list (`world/interiors/classroom.js`: Kinjo Yui, Higa Kenta, Oshiro Sakura, none
  in the cast; the island has three pupils) and the countryside's Ōshiro farm ("three generations", `world/countryside.js`).
- The game calls the player "Mayor" (the clinic's check-up and scales, mail/letters.js greetings), although the roster's
  Nils is the chief engineer and the mayor's office went on 21 October. A game-wide wording, left for the owner.
- **For the owner: the sisters' jan-ken-pon has no day now.** It is in Thuan's afternoon break (14:40), which is
  afternoon surgery on weekdays, and Thuan spends Saturday and Sunday on Kitano-jima, so over any fortnight it never
  happens (checked day by day; `tests/sisters.test.mjs` reports it as a todo rather than passing without looking).
  Where should it go: their lunch, the cones outside Sakura at eight, or a Sunday Thuan comes over?
- Sakura sells the books by order at the till (Front-Row's note: "ask Thuan at the till"); no book shelf was added
  (no new geometry). If the owner wants books on Sakura's shelves, that is a merchandising and layout job.
- The clinic room's lines still call the player "Mayor" (open issue above).
## Queued (the owner, 22 October, answered; not started)
- "The sisters basically run commerce and healthcare on the island … maybe we don't need a liquor store, Sakura can sell
  liquor too." Answers: close Higa Liquor; Sakura sells all alcohol over the counter and supplies Minato, Sato Ramen and
  the Coral Bay Bar from its depot; Kōji's round becomes Sakura Trading's delivery round; Gran Higa keeps only the
  bathhouse; the Higa Liquor building stands shut, a notice on the shutter saying liquor is at Sakura (no new geometry).
  Do it as its own step after this change is green.

## Next action
Signed off for handover (22 October, evening): work in progress on `claude/laughing-rubin-6p25x2`, not merged, no PR.
The tree is committed and pushed; `node_modules` is not (run `npm ci` in `johansson-town/` first).
1. Tests updated so far and passing: roster, cast, housing-consolidation, sisters, kitano-residents, sakura-small-office,
   paperwork, sakura-merchandising, products-move, higa-liquor-laundry, afterbath-outfit, bookkeeper-return-route,
   bookshop-customers (rewritten for the closed shop floor).
2. Baseline (the same 131 affected files on the base commit 84baf00): 761 pass, 27 fail. Failing there too, so not
   this change's: building circuits, stair flights, old saved visits, Fujita's bedtime, fun-poses, no-z-fighting
   (environment), Minato/ramen dining surfaces, the Obon eisa, interior release, resident groups/Studio pickers, all
   five owned-vehicles tests, retired-layout dialogue, photo articles' portraits, Kōji's journeys, shelving islands,
   shopfronts' staff, Thuan's bench break (two), Sato Ramen points, the Studio refusals and products, ground/pier edges,
   resident paths, the whole-day run.
3. Failing only with this change and not yet fixed (from the run before the test fixes above): lot-dressing "the parked
   cars are the traffic's family" (bay 2 is Nhung's now), island-businesses "published businesses have reachable real
   doors" and "bookshop and dock workshop keep distinct content … their own workers" (Nhung works at the clinic), boot
   "Published island boots" (runtime not rebuilt), "every thing has a purpose, a real source and a home", "the retired
   keep a buildable drawing …" and "every live list is exactly the 26" (now 25), "all eight posts are held by the
   roster's holders", sakura-evening-guests "Nhung buys during her real evening errand at 60 Hz" and the two after it
   (her evening is 17:00–18:00 at Sakura now; this file is in the CI guard), "the model is told who each person is".
   Also give Nhung's red car (town-traffic.js, "airport book orders", 16:00) a purpose and time that fit the doctor.
4. Then: `node tools/render-resident-guide.mjs` and `node tools/render-resident-shoot.mjs Nhung` (portraits and
   guide/portraits.json hash), a look at the stills, `npm run build:runtime` last, `node tools/ci-guard.mjs`, a separate
   review, then the queued Higa Liquor step.
