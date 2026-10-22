# Progress: Nhung becomes the island doctor

## Task
See `sources/task.md`. Branch `claude/laughing-rubin-6p25x2` (nj22az.github.io).

## Outputs
(in progress)

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

## Decisions
- Sakura on Saturday opens at 13:00, after Nhung's morning surgery and lunch: Thuan's weekend stays on Kitano-jima
  (addendum 4) and nobody else is invented for the counter. The owner may overrule.
- `clinic` is in `RETIRED_HOMES` landing on itself: the id also names the clinic, which stays, so a saved `clinic` or
  `home-clinic` lands at the clinic (`retiredHomeFallback` keeps it; the registry shows no fallback).
- Saturday (the owner, 22 October, asked): Sakura shuts on Saturdays; Higa's Sakura delivery moves to Friday; Nhung's
  day off is Saturday afternoon. (Supersedes the 13:00 opening first considered.)
- The clinic room keeps drawing the doctor at her desk itself; Nhung's walking body is never borrowed into the clinic.
- The sisters' jan-ken-pon in the park (14:40) does not happen while the clinic is open, so on weekdays Thuan takes her
  walk instead; the game survives only if the clinic is shut at that time.

## Open issues
- The owner (22 October): texts written before the consolidation still count the old island. Fixed in the clinic (the
  couch: Vy, Riku and Mai, and Kōji the one fisherman; the X-ray: Fujita, not the retired Ōshiro). Still open, not part
  of this change: the classroom's pupil list (`world/interiors/classroom.js`: Kinjo Yui, Higa Kenta, Oshiro Sakura, none
  in the cast; the island has three pupils) and the countryside's Ōshiro farm ("three generations", `world/countryside.js`).
- The game calls the player "Mayor" (the clinic's check-up and scales, mail/letters.js greetings), although the roster's
  Nils is the chief engineer and the mayor's office went on 21 October. A game-wide wording, left for the owner.
## Queued (the owner, 22 October, answered; not started)
- "The sisters basically run commerce and healthcare on the island … maybe we don't need a liquor store, Sakura can sell
  liquor too." Answers: close Higa Liquor; Sakura sells all alcohol over the counter and supplies Minato, Sato Ramen and
  the Coral Bay Bar from its depot; Kōji's round becomes Sakura Trading's delivery round; Gran Higa keeps only the
  bathhouse; the Higa Liquor building stands shut, a notice on the shutter saying liquor is at Sakura (no new geometry).
  Do it as its own step after this change is green.

## Next action
Committed as work in progress (22 October, evening) on `claude/laughing-rubin-6p25x2`, not merged, no PR.
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
