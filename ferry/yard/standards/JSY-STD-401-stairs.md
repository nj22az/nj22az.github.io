# JSY-STD-401 · Stairs and inclined ladders

Johansson Shipyard · yard standard · revision 0 · 11 November 2026 · applies to newbuilding No. 1, the Chisum

The owner, 11 November 2026: "All stairs need to be traversable and fully realistic and standardised."

Every stair aboard is one of three classes and is built from one line of `ferry/blender/spec.py` (`STAIRS`) by one builder
(`ferry/blender/stairs.py`). The build stops if a stair is outside its class, and `ferry/checks/stairs.cjs` walks each one
up and down in the model. The figures in this document are the ones in `spec.STAIR_CLASS`; if the two differ, the build's
are in force and this document is out of date.

## 1. The three classes

| | P · passenger stair | C · crew stair | L · inclined ladder |
|---|---|---|---|
| Where | Wherever passengers go | Inside the ship, crew only | On deck and in the machinery spaces, crew only |
| Pitch, at most | 45° | 45° | 55° |
| Step height (rise) | 170 to 200 mm | 180 to 200 mm | 190 to 208 mm |
| Going, at least | 220 mm | 200 mm | 150 mm |
| Clear width, at least | 0.90 m | 0.70 m | 0.55 m |
| Steps in one flight, at most | 12 | 14 | 16 |
| Treads | Closed, under a floor covering, with risers and a closed underside | The same | Open grating with a nosing bar |
| Step edges | Marked yellow, every step | Marked yellow, every step | The nosing bar |
| Handrails | Both sides, 0.90 m over the line of the step edges | One side at least | Both sides, with a knee rail on an open side |
| Handrail at the head | Runs on 0.30 m over the deck above, to a newel | The same, unless a gate stands there | The same, 0.10 m where a door stands close |

All steps of one stair are equal. A flight of n steps has n − 1 treads; the deck above and the deck below are the first and
the last step. A landing is at least as long as 0.90 m and as wide as the stair.

## 2. Where each figure comes from

Each line says whether the text was read for this standard or is recalled. **None was read in this revision:** every outside
requirement below is recalled and is a lead until its text has been checked (class comment to follow on the stair plan).

| Figure | Basis | Read or recalled |
|---|---|---|
| Passenger stair not steeper than 45°; a landing at least every 3.5 m of rise; clear width at least 900 mm; a handrail each side | Fire Safety Systems Code, chapter 13 (means of escape, passenger ships), as referred to by SOLAS II-2 regulation 13 | Recalled |
| Step height and going together: twice the rise plus the going between 600 and 660 mm for a stair that is walked, not climbed | The stride rule used in building and ship joinery practice (Blondel) | Recalled |
| Handrail 0.90 m over the pitch line; stairs 20° to 45°, step ladders steeper | ISO 14122-3 (fixed means of access to machinery: stairs, stepladders and guard-rails) | Recalled |
| Guard at an open edge at least 1.0 m high | Load Line Convention, regulation 25 (guard rails on exposed decks); carried inside as the yard's own rule | Recalled |
| At most 12 steps in a passenger flight, 14 in a crew flight | The yard's own figure, inside the 3.5 m above (12 steps of 200 mm are 2.4 m) | Yard |
| No step higher than 208 mm | The yard's own figure. Two steps together must stay under 0.42 m, which is where the page's walker takes a thing for an obstacle; a real foot wants no more either | Yard |
| Class L, 55° | The yard's own figure for crew ladders on deck and in machinery spaces, between a stair and a vertical ladder | Yard |

Class P and class C are both held to 45°. The yard would rather build a passenger stair at 38° to 40° (twice the rise plus the
going at 640 mm). Where the ship leaves room for it, that is what is to be drawn; section 4 says why the two main stairs
could not have it.

## 3. The stairs aboard

| Stair | Class | Steps | Rise | Going | Pitch | Clear width | From | To |
|---|---|---|---|---|---|---|---|---|
| Main stair, port | P | 22, in flights of 12 and 10 with a landing of 0.95 m | 200 mm | 220 mm | 42.3° | 1.18 m | Passenger deck lobby, 6.95 m from the transom | Car deck, foot lobby in the port casing, 12.30 m |
| Main stair, starboard | P | 22, in flights of 12 and 10 with a landing of 0.95 m | 200 mm | 220 mm | 42.3° | 1.18 m | Passenger deck lobby, 6.95 m | Car deck, foot lobby in the starboard casing, 12.30 m |
| Crew stair to the wheelhouse | C | 13 | 200 mm | 200 mm | 45.0° | 0.76 m | Wheelhouse, 20.15 m | Passenger deck, 17.75 m |
| Engine room | L | 16 | 194 mm | 150 mm | 52.3° | 0.82 m | Car deck, port casing, 6.50 m | Engine room floor, 8.75 m |
| Port wing | L | 13 | 200 mm | 152 mm | 52.8° | 0.56 m | Bridge wing, 19.50 m | Side walkway, 17.68 m |
| Starboard wing | L | 13 | 200 mm | 152 mm | 52.8° | 0.56 m | Bridge wing, 19.50 m | Side walkway, 17.68 m |
| After landing, port | L | 13 | 200 mm | 152 mm | 52.8° | 0.56 m | Bridge deck's after landing, 4.80 m | Open deck, 2.98 m |
| After landing, starboard | L | 13 | 200 mm | 152 mm | 52.8° | 0.56 m | Bridge deck's after landing, 4.80 m | Open deck, 2.98 m |

The stairs she was given were the other ship's: 45° to 60°, steps 150 to 200 mm deep, thin plates on two bars with one
slanted bar for a handrail. The two main stairs were 48° with a going of 177 mm, in one flight of 22 steps, 4.4 m of rise
without a landing.

## 4. The main stairs: why 42° and not 40°

The rise from the car deck to the passenger deck is 4.40 m: 22 steps of 200 mm, and a landing, since it is more than 3.5 m.

- **At the head.** The passenger deck's lobby ends at its after wall, 6.04 m from the transom (the funnel casing stands
  behind it). A stair's head wants at least 0.90 m of floor before the first step: the first step is at 6.95 m.
- **Under the deck.** The lobby's forward wall stands at 9.46 m and the deck is closed forward of 9.40 m (toilets and the
  side walkway are over it). Under the deck's underside, 6.25 m above the waterline, a person needs 2.0 m: so by 9.40 m the
  stair must have come down to its landing at 4.10 m, 12 steps. The upper flight has 9.40 − 6.95 = 2.45 m for its 11 treads:
  a going of 220 mm (2.42 m), not the 240 mm that 40° would take (2.64 m).
- **So:** 12 steps to a landing at 4.10 m under 2.15 m of headroom, 0.95 m of landing, 10 steps to the car deck. The stair
  is 5.35 m long, 1.6 m longer than the other ship's, and its foot is at 12.30 m.
- **At the foot.** The other ship's doorway from the lower lobby (11.35 to 12.55 m) now lies beside the lower flight's last
  steps and is plated in. Each stair ends in a foot lobby forward of it, 2.1 m long (to port it is the foyer from the
  gangway), and the door from the car deck is in the casing's inboard wall there: a sliding fire door, 0.90 m clear, its leaf
  running inside the lobby. A hinged leaf would swing into the vehicle lane outside or across the lobby inside. Before it on
  the car deck a hatched zone 1.0 m deep is kept clear of vehicles.
- **What it costs.** The stairs are no longer entered from the lower lobby but from the lanes, a metre forward of the lower
  lobby's own fire doors: a driver walks from the car to the stair directly; someone waiting in the lower lobby goes out
  through its fire door first. Foot passengers from the gangway still reach the port stair through the foyer without
  setting foot on a lane.

## 5. Open points

| | |
|---|---|
| 1 | The outside requirements of section 2 are recalled. The texts are to be read and the standard reissued with what they say. |
| 2 | The crew stair to the wheelhouse is at the limit of its class (45°), in the other ship's trunk. It is to be looked at again with the internal stair trunk from the bridge to the engine room (the owner's list). |
| 3 | The main stairs' enclosures and doors are drawn as steel; their fire class (the car deck is a vehicle space) is to be set in the structural fire protection plan, which is not yet drawn. |
| 4 | The port main stair's under-stair space, aft of its lower flight, is reached from the engine room entrance and has no use yet. |
