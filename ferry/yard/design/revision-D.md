# The Chisum, revision D: design basis

12 November 2026. Johansson Shipyard, newbuilding No. 1.

This is what she is built to at revision D of her general arrangement, why, and where each figure comes from. The numbers
themselves live in three files and nowhere else: `ferry/blender/ga.py` (her arrangement, her particulars, every space, her
stations), `ferry/blender/lines.py` (her form) and `ferry/blender/spec.py` (her steel, her stairs, the places of her deck
fittings). The drawing `ferry/yard/drawings/JS1-102-general-arrangement.svg` is made from them. What was compared with what
after she was built, and what matched, is in `revision-D-audit.md` beside this file.

## 1. What she is

A **ro-ro freight ferry of 124.8 m**: a classic of the 1970s, kept in service and refitted. Built in 1974 for Johansson
Line's island service, Minato to Kitano-jima; refitted since (modern instruments in the original wheelhouse, a helicopter
deck added aft). Until this revision she was a car and passenger ferry of 68.4 m (revision C).

The owner, 11 and 12 November 2026: "I think the decks needs to be more spacious try to make the ship more realistic in
proportions"; "maybe 69 meters is too small ? maybe we need it bigger? and several cargo decks?"; "maybe a Cargo ship is more
fun ?"; then chose a ro-ro freight ferry of about 125 m. Also: "exterior needs to be more realistic too, now it looks like a
bunch of boxes on top of each other"; "there needs to be walkways on deck, helipad, etc"; "the pilot door should also be
mechanical of course, not an open door , the ship needs to be seaworthy"; "The chimney needs to be functional".

## 2. Her pattern

The **Mashala class** (Rickmers Werft, Bremerhaven, 1977; later Riverdance): 116.30 x 17.40 m, 5.70 m to the main trailer
deck and 12.20 m to the upper deck, two medium-speed engines through gears to two controllable-pitch propellers, twin spade
rudders, a bow thruster, a bulbous bow, the accommodation forward, a lower hold forward of the engine room, a fixed ramp
from the main deck to the upper deck, a motor lifeboat each side. Her general arrangement at 1:200 (figure 1 of MAIB report
18/2009) was looked at and measured; `ferry/yard/reference/roro-freight-ships.md`, section 1b, is the reading of it. She is
stretched and widened toward the **Bison class** (J.J. Sietas, 1975: 125.0 x 19.05 m). Nothing is traced or copied: what a
real ship has, in what order and how large, is taken; every line is the yard's own.

## 3. Principal particulars

| | Chisum, revision D | The pattern (Mashala class) | From |
|---|---|---|---|
| Length over all | 124.8 m (208 frames of 0.6 m) | 116.30 m | the yard's, between the pattern and the Bison class |
| Length between perpendiculars | 114.0 m | not noted | the yard's |
| Breadth moulded | 19.6 m | 17.40 m | the yard's (Bison 19.05) |
| Depth to the main deck | 6.6 m | 5.70 m | the yard's |
| Depth to the upper deck | 13.2 m | 12.20 m | the yard's: 6.6 m between the two decks (the pattern: 6.50 m) |
| Design draught | 5.6 m | 5.379 m | the yard's |
| Displacement at that draught | 8,472 t by her lines (block coefficient 0.661) | not read | lines.py |
| Service speed | 17.5 knots | 15 to 16 knots | the yard's (the Bison class: 18.5 knots on 8,825 kW) |
| Main engines | two of about 4,000 kW, each to a controllable-pitch propeller of 3.0 m | two MaK 8M453AK, 4,413 kW in all, gears, two CPP | the pattern's arrangement; the power is the yard's, for her size and speed |
| Rudders, thruster, bow | two spade rudders, a 600 kW bow thruster, a bulbous bow | the same | the pattern |
| Crew | 25 | 19 on board in 2008 | the yard's |
| Drivers and passengers | 50 (eight berths, the others in the lounge) | 12 | the owner's brief: so she is a passenger ship by rule |

Her lines (lines.py, checked by `ga.check_lines` and `check.py`): 8,265 m³ under the design waterline; block coefficient
0.661 on the length between perpendiculars, midship coefficient 0.947, waterplane coefficient 0.888, centre of buoyancy
4.6 % of her length abaft amidships, half angle of entrance 18 to 19 degrees. A bulbous bow 10.1 m long whose tail ends in
the fore peak; a stem raked 32.7 degrees from upright with a forefoot of 3.0 m radius; a transom stern; the run rising
from 46 m to a keel 4.5 m above the base at the transom. Sheer: 1.5 m at the stem head, beginning at the front of the house
(104 m), not at three quarters of her length as first asked: the house stands on a level deck. Bulwarks 1.2 m high from
the transom to the house and on the forecastle, flared with the topsides forward.

## 4. Her decks, above the keel

| Deck | Height | What is on it |
|---|---|---|
| Tank top | 1.6 m | the engine room, the auxiliary engine room, the lower hold (46.8 to 86.4 m, 11.8 m wide between wing tanks), the pump room, the thruster room |
| Platform | 4.0 m | in the engine room: control room, switchboard room, workshop, store; a gallery each side of the engines |
| After flat | 4.7 m | the steering gear room, the after passage |
| **Main deck** | 6.6 m | the bulkhead deck. Five trailer lanes of 3.0 m between side casings, from the stern door to 110 m; the cargo lift (16.0 x 3.6 m); the fixed ramp along the starboard casing; the casings' rooms; the pilot doors |
| **Upper deck** | 13.2 m | the weather deck: trailers in the open (23 to 80 m), the fixed ramp's opening, a walkway each side, the helicopter deck over it aft, the two funnels, the house's lowest tier (galley, messes, lounges, hospital), the forecastle |
| Helicopter deck | 14.2 m | an octagon 19 m across its flats, 1.0 m over the upper deck |
| Boat deck | 16.0 m | cabins for the ratings and the drivers; a lifeboat and three liferafts each side |
| Officers' deck | 18.8 m | the officers' cabins; open abaft the house, where the emergency generator room stands |
| Bridge deck | 21.6 m | the wheelhouse with its wings to her side; chart room, battery room, lobby abaft it |
| Compass deck | 24.3 m | the wheelhouse's top: mast, radar, compass |

Seven watertight bulkheads below the main deck, at frames 12, 28, 64, 78, 144, 164 and 184 (the collision bulkhead, 7.8 m
abaft the forward perpendicular: 6.8 % of her length). 133 spaces on seven plans; 17 stairs to JSY-STD-401; two ladders.

## 5. How a vehicle and a person go through her

- **Vehicles** come aboard over the stern ramp (9.4 m wide, 11 m long, a box girder that is also the stern door) onto the
  main deck. From there: forward along five lanes; down to the lower hold on the cargo lift, whose platform is the hold's
  hatch cover when it is up; up the fixed ramp (1 in 8, 3.6 m wide, starboard side) to the upper deck.
- **Drivers** leave the main deck by a main stair in each casing (72 to 85 m), which comes up inside the house at the
  upper deck: the lounge, the mess and the stair trunk to the cabins are there.
- **The crew** have the house's stair trunk from the upper deck to the officers' deck, the crew stair from the officers'
  deck into the wheelhouse, the engine room's entrance stair from the port casing, the lower hold's stair from the port
  casing through the wing tank, and inclined ladders outside between the open decks.

## 6. Decisions taken while building her, and why

1. **The house stands on the upper deck itself**, where the pattern's stands one deck higher over a garage: the owner
   asked for spacious decks and real rooms, and a tier of public rooms at the weather deck gives both.
2. **Two funnels on the side casings**, as the European Gateway class has them, where the pattern has one casing to
   starboard: the uptakes rise in the casings beside the lanes and take no lane.
3. **The fixed ramp runs along the starboard side** (the pattern's is on the centre): it leaves the middle lanes and the
   lift clear, and the casing wall carries its outboard edge.
4. **A cargo lift to the lower hold**, where the pattern has a ramp: the owner's words ("ramps and a cargo lift").
5. **The stern ramp in one length of 11 m**, as the pattern's profile shows hers: raised, it stands 4.4 m over the upper
   deck at the stern. Its hinge line is 45 mm abaft the transom and 15 mm under the main deck, so that its roadway comes
   down level with the deck. Its outer skin is plated smooth and carries her name whole.
6. **The lower hold is one compartment of 39.6 m**, as ships of her time had it. A ship built today is not allowed that;
   it is the first of the questions on JS1-102.
7. **The wheelhouse, the compass deck, the emergency generator room and the drinks machine are the first Chisum's**, landed
   aboard as blocks (`bridge_place.py`, `eg_place.py`, `vending.py`). The wheelhouse is 6.0 m wide and she is 19.6 m: the
   wings are carried out to her side on knees.
8. **The boat deck's house is 11.8 m wide abaft 91 m** (it was 12.4 m in the first draft of this revision): a lifeboat
   under gravity davits wants 3.6 m of deck inboard of her side, and she has it now along the whole station.
9. **The anchors hang 115.2 m from the transom** (they were first drawn at 113.4 m): their chain pipes must go down forward
   of the collision bulkhead at 110.4 m, and the windlasses stand at 112.0 m for that.
10. **The room first drawn as the engine room's escape trunk is the CO2 room**: it stood over the fresh water tanks, not
    over the engine room. A second way of escape from the engine room is owed.
11. **Every enclosed room has light** (`lighting.py`): a marine fluorescent fitting, one to about 10.5 m² of deck, hung to
    JSY-STD-402 between the beams. The light of her rooms is worked out with each lamp by itself (`light.py`): found by
    chance among a hundred rays, 390 small lamps gave blotches.
12. **The places of her deck fittings are a list** (`spec.OUTFIT`, 89 places): the fittings themselves come from the yard's
    library of deck fittings, and the deck is left clear for each. `ga.STATIONS` says what each station is.

13. **Her decks' paint and her own outfit steel are `deck_outfit.py`**: lane lines on the main and upper decks, a walkway
    1.1 m wide each side of the upper deck between two yellow lines, the helicopter deck's edge line, circle and H; a hawse
    pipe and a chain pipe for each anchor; the foremast. The fittings that stand on the decks stay the library's.
14. **The helicopter deck's middle is 10.0 m from the transom** (it was 10.5 m): at 10.5 m its forward corners' edges cut
    0.2 m into the funnels' after inboard corners.
15. **The bulwarks are plated in five strakes**, so that openings can be left in them: a freeing port 0.6 m long every
    3.6 m along the upper deck and every 2.4 m on the forecastle, and an eye for each panama chock.
16. **The foremast carries the anchor light and the bell, and no masthead light.** Her forward masthead light is on the
    bridge's mast, as her pattern's profile shows hers; the rule as the yard recalls it wants the second one half her
    length abaft it and 4.5 m higher, which the pattern carries on a tall mast at its funnel. With a funnel at each side
    hers wants a mast on her centre line between them: not built, and a question for the owner.
17. **Each funnel is a casing round three uptakes of their own bores** (the machinery design basis: a main engine's 0.7 m,
    a generating set's 0.25 m, the boiler's 0.4 m): lagged pipes standing from the main deck up through the casing's room
    and the funnel and out of its head, an exhaust gas economiser on each main engine's in the casing's room; louvres low
    in the funnel's sides, a bar round its head, a platform with a ladder on its inboard side (the helicopter deck lies
    under its after face), the whistle on the port one.
18. **Every outside window has a frame and a rain eyebrow; every door of the house to a weather deck stands over a coaming
    of 0.20 m.** The fixed ramp's opening has a coaming of 0.25 m along its outboard side and across its after end.

## 7. What is not in her yet

Her machinery (engines, gears, generators, boiler, switchboards) and the uptakes' runs to it below the main deck; the
fitting out of every room (linings, furniture, doors' leaves other than the watertight doors, the pilot doors and the
wheelhouse's own); the cargo lift's hoisting gear (the platform is drawn raised and does not move); the ramp cover over the
fixed ramp's opening (the opening is railed and has its coaming); the chain lockers; a second escape from the engine room;
a mast for her after masthead light; the house's shape (a raked front, rounded corners, tiers set back); the deck fittings
themselves (the library); and everything on the audit's open list.

## 8. For the owner

The questions on JS1-102 (`ga.QUESTIONS`), in short: the lower hold in one compartment; the berths; where the sheer begins;
the funnels before the helicopter deck; hinged watertight doors; the mast's height and the foremast; the emergency
generator's size; the raised ramp over the helicopter deck's after edge; the engine room's second escape; the CO2 room's
entrance; the trunks without doors in the starboard casing.
