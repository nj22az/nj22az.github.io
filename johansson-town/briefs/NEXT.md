# Next session: the brief (written 2026-10-10 at the end of a long session)

Read the repo's CLAUDE.md first. Game work: small batches, check each in the game, never ground/lighting/characters together.
Pushing `claude/sjoskolan-youtube-strategy-gofi3o` deploys the live game: test and look before pushing.

## 1. The Minato–Kitano-jima ferry (the creator, 2026-10-10)

**Status (2026-10-10, later):** audited and the first batch built: `docs/FERRY-AUDIT.md`. The Minato Maru (22 m, three
cars) is modelled whole, hull and underwater body; her particulars, machinery, load balance and scenarios are data
(`src/world/ferry-ship.js`); her crew is allocated (`src/people/ferry-crew.js`). Next: the open list in the audit, §5.

> "the ferry , I think it's easier if you audit it as marine ship construction engineer in Japan in the 1990's now it
> looks like a floating toy, it needs to be a realistic functional ship with loading decks, passenger waiting spaces, a
> realistic functional engine room with realistic engine electrical distribution and supply for all common systems found
> on a real ferry , and have a crew (some of our NPCs can be the crew and invent a new one if needed. Maybe a mess room
> or a small can time and crew accommodation places on the ship and fully functional propulsion and hydraulic systems
> what more did I miss , I'm sure a ship building auditor would find it"

Audit first, as a 1990s Japanese ship-construction engineer (a small island car-and-passenger ferry, フェリー, about
40–60 m, built to JG / NK rules, of the kind that ran between Okinawa's islands). Write the audit and a plan, then build
in batches (hull and decks; interiors; machinery; systems; crew and routines), each one checked in the game.

What a real ship of that kind has, so nothing is a toy (the creator's list, plus what an auditor adds):
- **Hull and decks:** a real hull form with draft marks and a load line; a car deck with a bow or stern ramp (hydraulic),
  lane markings, lashing points, car-deck ventilation fans and drainage scuppers; a passenger deck; a bridge deck.
- **Passengers:** a waiting cabin (carpet area to sit and lie on, as on Japanese ferries, and seats), a purser's window
  and ticket check, toilets, a vending corner, an open deck with benches, safety notices, life-jacket lockers.
- **Bridge:** wheel and autopilot, radar, magnetic and gyro compass, engine telegraph or bridge throttle, VHF and GMDSS
  radio, the paper chart table (1990s: no ECDIS), echo sounder, navigation lights panel, whistle, searchlight.
- **Engine room:** main diesel engines (two, for two shafts), reduction gears, shafts and controllable or fixed-pitch
  propellers, a bow thruster; two diesel generators and an emergency generator with batteries; the main switchboard
  (440 V) and the 100 V lighting board through a transformer; shore-power connection; the engine control room.
- **Systems the switchboard feeds:** fuel (bunkering, settling and service tanks, purifier), lubricating oil, sea-water and
  fresh-water cooling, bilge and ballast pumps, fire pumps and fire main, fixed CO₂ for the engine room, fire detection,
  fresh-water tank and hydrophore, sewage holding tank, ventilation and air conditioning, galley power, steering gear
  (hydraulic rams in the steering-gear room aft), the ramp's hydraulic power pack, the anchor windlass and mooring
  winches (fore and aft), navigation and emergency lighting.
- **Safety:** liferafts in cradles (hydrostatic release), a rescue boat and its davit, lifebuoys, life jackets, muster
  stations and their signs, fire extinguishers and fire stations, emergency escape routes marked.
- **Crew** (some from the existing residents, one or two new): master (船長), chief officer, chief engineer (機関長), an
  engine oiler, bosun and deckhands for the ramp and mooring lines, the purser who sells tickets, a cook. Each with a
  watch routine (in port: ramp, lines, tickets; at sea: bridge watch, engine-room rounds) that the storyteller can use.
- **Crew spaces:** a mess room (a small canteen), a galley, crew cabins, a changing room by the engine room.
- **Port side of it:** the linkspan or ramp at the berth, fenders, bollards the lines go to, the ticket office, the
  queue for cars and the passengers' walk to the gangway.
- **Behaviour:** docking against fenders, lines out, ramp down, cars and passengers off then on, ramp up, lines in,
  away; engine sound and wake; the timetable the town already has.

Everything must stay light enough for phones, and usable by the storyteller (stories about the crew, a blackout at
sea, a fouled propeller, a broken ramp…). The engine room's electrics should be as real as the onsen's (see
`src/world/interiors/onsen-electrics.js` for the house style: real numbers, a source, tests).

## 2. "Fujita's Back" comic (studio repo /home/user/jojo, content/onsen-breaker/)

- **The massage chair must read clearly** (the creator, 2026-10-10: "The chair needs to be clearer in the comic it's a
  bit blurry we don't see what Fujita is wanting to sit on"). Build a recognisable 1990s coin massage chair in the game
  (a props batch: a padded seat with a back and headrest, armrests with the coin box and a control panel, lighter
  upholstery than the walls), then rephotograph 2c, 4b, 4d, 5b, 6i, 7c with the chair large and sharp.
- Game characters batch: the carry (Fujita level like a plank, hands under him), Mrs Higa reaching back for the breaker
  without looking, Tetsuo's paper lower so his pocket torch shows, Nhung's half-dried hair stronger. Then draft 5.
- The studio's rule: simple panels, one subject, no grey blurs or foreground masses (`.claude/agents/cinematographer.md`).

## 3. Smaller game items

- Turn the ferry-canopy bench (src/world/port-building.js) to face the berth; move the post box off the neighbourhood
  bench (src/world/town.js:167). Look at both in the game first.
- The camera in very tight spots shows only the top of his head: pull it to an over-the-shoulder view.
- `kit.rect` in src/world/okinawa/kit.js makes colliders too small for small positive rotations: check other objects.
- Questions for the creator: Thuan's Wednesday off? A loading screen until interiors are ready? Town book rows that
  show where a resident is?
- The town's on-screen name is now Minato Machi: change it in the studio's comics and stories when next working there.

## 4. Modular comics in Johansson Studio (the creator, 2026-10-10)

> "I mean here in the comic, is it a way to enhance and make the comics modular, I'm thinking if it can be incorporated
> into the Johansson Studio?" (about page 2's bottom panel: the massage chair reads as a brown slab.)

Two causes: the game's chair is a plain box, and the comic shot it as a wide set photo. Plan:
- **Prop hero shots:** every important prop in the town gets a "hero" render: the model alone, lit, on a plain
  background, at a fixed three-quarter angle, with its name and purpose from the data (who it's for, why it's there).
  Rendered once by a tool from the game's own model, stored in a prop library the studio reads.
- **Panel modules:** the comic engine gets reusable panel types, picked per panel in the storyboard instead of
  hand-coded per story: `set` (a room photo), `cast` (people on a plain background), `insert` (a prop hero shot,
  big, optionally with a label or a coin/hand), `dark` (eyes and voices), `explainer` (diagram + presenter),
  `sfx` (a sound filling the panel). Each module has the simplicity rule built in.
- **In Johansson Studio** (the Town Studio app): a storyboard editor where each panel picks a module and its subject
  (a resident, a place, a prop from the library), previews it, and the comic builds from that. The same modules feed
  the film's shots.
- First use: page 2's chair as an `insert`, after the massage chair is rebuilt as a real 1990s coin massage chair.

## 5. Studio's 3D modelling section: build assets in Studio, assemble them in World (the creator, 2026-10-10)

> "I would like to build assets in studio and assemble them in world , I would like to implement a 3d modelling section ,
> that can make assets in code or by drawing"

Studio is the Python app in `jojo/town-studio` (`python3 -m townstudio`, a local web page). The modeller is a new page in
it, using World's own vendored three.js and toon look, so what you model is exactly what World shows.

- **One asset = one folder** (`jojo/town-studio/assets/<id>/`): `asset.json` (name; purpose: who it is for, why, where
  it belongs, per the "nothing is random" rule; real size in metres; colours from World's palette; collider; seats,
  standing spots and the action label; phone budget) plus its shape as either a **code recipe** (a small JS module using
  the same kit World uses: boxes, cylinders, lathe, extrude, rounded boxes) or a **GLB**.
- **Two ways to make one, same result:**
  - *Code*: an editor beside a live 3D preview; edit numbers, see the model change.
  - *Drawing*: sketch on a grid with a finger or mouse: draw a side profile and spin it (lathe: pots, bottles, lamps),
    draw an outline and give it depth (extrude: signs, panels, a chair's side), or stack and snap blocks (furniture,
    machines). Drawings are saved as the same code recipe, so they can be refined in code later.
- **Checks before publishing:** stands on the floor (no floating), real-world size next to a 1.6 m resident, under the
  phone budget (triangles, materials), collider generated and sensible, purpose filled in, no real brands.
- **Outputs:** a GLB + `asset.json` published into World's catalogue (`johansson-town/assets/catalog/`), and a hero
  render for the comic prop library (section 4).
- **World side:** a catalogue loader that places assets by id (from a place's layout file or the Build page), with the
  collider and interaction points from `asset.json`. Existing hand-coded props move over gradually.
- **First batch:** the asset format + the code mode + publishing one asset end to end: the 1990s coin massage chair
  (section 2), shown in the onsen and as the comic's insert. Then the drawing mode. Then the ferry's parts (section 1)
  are built in Studio this way.

## 6. Studio as "Mario Maker for Johansson World": the island builder (the creator, 2026-10-10)

> "I would like a sim city kind of mode where I can build the island from my assets and build the houses and rooms and
> streets with my assets in studio and then choose to update Johansson World with it, with my studio setup the studio
> should sort of be Mario maker for Johansson World"

Studio already has a Build page (place things, save them into the town) and Publish (tests, build, then the online
town). Grow it into a builder with zoom levels, all made of the asset catalogue (section 5):
- **Island view** (SimCity-like, top-down): shape the coast and ground, lay streets and paths (with pavements, kerbs,
  crossings), zone plots (shop, home, harbour, park), place whole buildings from the catalogue, set the ferry berth.
- **Building view:** pick a building, set its floors and footprint, draw its rooms on a grid (walls, doors, windows,
  stairs), choose the facade, sign and roof from the catalogue.
- **Room view:** furnish a room from the catalogue with snapping to walls and floor; each asset brings its collider,
  seats and actions; give the room its purpose and who uses it (residents' routines, shop merchandising).
- **Play-test inside Studio** at any time (walk it as the player, see residents walk their routes), with the World
  rules checked live: walkways at least 1.4 m, nothing floating or clipping, no spawn inside anything, phone budget,
  every item has a purpose.
- **Update World:** a single button that shows what changed (a before/after map and a list), runs World's tests and
  build, and only then publishes. Nothing goes live without the creator choosing it.
- **Data, not code:** the island, buildings and rooms are saved as layout files (JSON) that World loads, so World becomes
  the player for what Studio makes. Existing hand-coded places are converted to layout files gradually; each
  conversion must look and play the same (photographs before and after).
- **Order:** section 5's asset format and modeller first; then the room view (smallest, proves the idea, e.g. the
  onsen's lobby); then the building view; then the island view; then converting existing places.
