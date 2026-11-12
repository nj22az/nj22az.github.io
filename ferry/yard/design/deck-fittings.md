# The Chisum's deck fittings: a library, and its demonstration quay

Johansson Shipyard · design record · 12 November 2026 · branch `claude/chisum-fittings`

The owner: "it needs life boats"; "there needs to be walkways on deck, helipad, etc"; "I dont want any part of the ship non
functional, I want every mechanical part to work"; "you have no budget on the 3d model, focus on photorealism and reality";
"I am an old marine engineer and a ship-o- file, I want to be able to explore the ship when we are done and feel happy and
nostalgic".

The hull is being rebuilt at 125 m in another checkout, and gives every fitting its place (`spec.OUTFIT`). This record is of
the fittings themselves: **25 kinds**, each a function, drawn to JSY-STD-404 (its parts listed, then each drawn), standing on
what carries it (JSY-STD-402) with no two faces in one plane (JSY-STD-403). None of it knows the ship's arrangement. It was
built overnight with nobody to ask; what was decided alone is in section 6.

## 1. The files

| File | What |
|---|---|
| `ferry/blender/fittings.py` | The door: `FITTINGS`, `build(kind, at, heading, group, name, **options)`, `lashing_grid(...)` |
| `ferry/blender/fittings_kit.py` | The tools: a fitting drawn about its own origin (`Kit`), carried aboard with its motions, cuts and clear box (`Kit.place`); `lathe`, `sweep`, `prism`, `band`, `bar`, `bolt`, `gusset`, `letter`, `label`, `turned`; the looks the fittings add |
| `fittings_lifeboat.py`, `fittings_boats.py` | The lifeboat; the station (davits, frames, winch, falls, gripes, ladder, light) |
| `fittings_liferaft.py` | The liferaft in its canister on its cradle |
| `fittings_mooring.py` | Windlass, chain stopper and hawse pipe mouth, stud-link cable, mooring winch, capstan, bitts, panama chock, roller fairlead, rope reel, rope coil |
| `fittings_cargo.py` | Lashing pot and `lashing_grid`, lashing rack, trailer trestle, wheel chocks |
| `fittings_deck.py` | Mushroom and gooseneck ventilators, air pipe head, sounding pipe, bench, floodlight, foam monitor, bulkhead light, loudspeaker, waste bin |
| `ferry/blender/fittings_demo.py` | The demonstration quay: a builder module that stands every fitting on a 60 x 14 m deck. **Not part of the ship** (`build.py` does not list it; nothing in `build.py` was changed) |
| `ferry/tools/fitting_still.py` | A Cycles still of what `build.py` saved, with the moving parts put where one says (it moves them as `app.js` `moveParts` does) |

`shipyard.py` is not edited: the nine looks the fittings need (`Galvanised steel`, `Wire rope`, `Chain`, `Rope`, `Canvas`,
`Rubber`, `GRP gelcoat`, `Bare teak`, `Cast iron`) are added to `shipyard.LOOKS` and `SURFACES` by `fittings_kit.py` when it is
imported (`setdefault`: none changes a look that was there), so two sessions do not edit one list.

## 2. How the placer calls it

```python
import fittings
got = fittings.build('bitts', (x, y, z), heading=90, group='car', name='B-AFT-1')      # at = the deck under its origin, ship's axes
made += got['parts']          # each Part has .group (and .mover)
inputs += got['inputs']; movers += got['movers']       # for the module's motion()
got['cuts']                   # openings to cut: dict(kind='deck'|'bulwark', box=(lo, hi), outline=[points], round=dict(centre, radius, axis)?)
got['clear']                  # (lo, hi): keep this box clear (and leave rails out where it crosses them)
got['parts_known_by']         # its row for JSY-STD-404 section 3
```

The contract as given is kept. What is added to it, or must be known:

- **A cut carries its own outline.** Besides `kind` and `box`, every cut has `outline`: the opening's corners on the face it is
  cut in (the deck's top, the bulwark's inboard face), in the ship's axes; a round one also has `round`. Cut to `outline`
  and the fitting's own collar, lip or casting covers the edge.
- **`name` makes every motion's and input's id** (`<name>-davit`, `<name>-run` ...): give each fitting the id it has in
  `spec.OUTFIT`. Without a name the library numbers them (`bitts-1`).
- **Handed fittings.** Only the lifeboat station is handed: `side=+1` to port, `-1` to starboard. The starboard one is the port
  one seen in a mirror, its motions turned over with it and its lettering laid the other way so that it reads.
- **Where the origin is** is in `FITTINGS[kind]['note']`, and in the table below. Three conventions: a fitting that stands on
  the deck has its origin under its middle; one that is **fastened to a bulkhead or a bulwark** has its origin on the deck at
  the wall's face, the wall behind it (its front, +z, looks out from the wall: `heading` 90 on a wall that looks to port);
  the **lifeboat station's** origin is on the deck's edge abreast the boat's middle, x outboard.
- **A wall drawn as one two-sided sheet** (the look `Topside plate`) fights with a foot laid on it: the fittings expect a wall
  with thickness, seen from one side, as `steel.py` draws houses.
- `FITTINGS[kind]['build']` is the fitting's own drawing function and takes a `Kit`: call `fittings.build`, not it.
- `fittings.lashing_grid(at, nx, nz, dx, dz, heading=0, group='car', name=None, sunk=True)` returns what `build` returns.

| Kind | Size (along, across, high) m | Origin and front | Options |
|---|---|---|---|
| `lifeboat-station` | 8.8 x 6.8 x 5.65 (3.85 inboard of the edge, 2.95 outboard when out) | deck's edge abreast the boat's middle; x outboard; the bow to +z | `side`, `height` (deck over the water), `rescue`, `cover`, `number`, `ship`, `port`, `label`, `embark` |
| `liferaft` | 1.6 x 0.95 x 1.55 | under the canister, which lies along x; +z inboard (heading 270 to port, 90 to starboard) | `persons` |
| `windlass` | 2.95 x 1.5 x 1.45 | under the cable lifter; shaft along x; the cable leaves toward +z | `lead` (to the stopper, 1.9) |
| `chain-stopper` | 1.0 x 0.62 x 0.55 | under its roller; cable along z | `hawse` (to the hawse pipe mouth, 1.5), `aft` |
| `mooring-winch` | 2.4 x 1.3 x 1.45 | under the drum; shaft along x | |
| `capstan` | 0.9 x 0.9 x 1.05 | under the barrel; its pedestal 1.1 m toward -x | |
| `bitts` | 1.25 x 0.48 x 0.60 | under the bedplate's middle; posts in line along z | `nominal` |
| `panama-chock` | 0.90 x 0.30 x 0.95 | deck, at the bulwark's inboard face | `t` (bulwark thickness) |
| `roller-fairlead` | 0.95 x 0.55 x 1.0 | under its middle; the rope passes along z | |
| `rope-reel` | 1.35 x 1.2 x 1.35 | under its middle; axle along x | |
| `rope-coil` | 1.5 x 1.5 x 0.4 | under the grating's middle | |
| `lashing-pot` | 0.23 across | on the pot | `sunk` |
| `lashing-rack`, `wheel-chocks` | 1.5 x 0.35 x 1.7; 1.3 x 0.4 x 1.0 | deck, at the wall's face | `n` |
| `trailer-trestle` | 1.0 x 0.8 x 1.2 | under its middle; saddle along x | |
| `ventilator-mushroom` | 0.95 x 0.95 x 1.25 (for 0.6) | under it | `dia`, `coaming`, `serves` |
| `ventilator-gooseneck`, `air-pipe` | 0.55 x 0.3 x 1.0; 0.3 x 0.3 x 0.95 | under the pipe; the gooseneck's mouth toward +z | `dia`, `coaming`, `serves` |
| `sounding-pipe` | 0.25 across | on the cap | `serves` |
| `bench` | 1.8 x 0.62 x 0.86 | under its middle; one sits looking to +z | `length` |
| `floodlight`, `waste-bin` | 0.5 x 0.45 x 1.75; 0.45 x 0.45 x 0.8 | deck, under the rail's line (rail along x); +z inboard | `rails`, `aim`; `rail` |
| `foam-monitor` | 1.3 x 0.5 x 1.6 | under its riser; it throws toward +z | |
| `bulkhead-light`, `loudspeaker` | small | deck, at the wall's face | `h` |

## 3. Each fitting: its parts, its sizes, what works, what it was compared with, what is not right

The row for JSY-STD-404 section 3 is each builder's own `known_by` (returned as `parts_known_by`); it is repeated here.
Sources: **[R]** the yard's reference files, **[M]** a maker's sheet or a standard as recalled tonight, not read, **[Y]** the
yard's own estimate. Photograph rows are those of `owner-photographs-2026-11-11.md`.

### 3.1 Lifeboat station (`lifeboat-station`): done to the standard, with the limits named

**What it is.** An open glass-fibre lifeboat under a pair of **pivot gravity davits** of the Schat and Welin kind, as a ship of
the middle 1970s carried it. Each davit is an arm of box section hinged on a pin in a frame on the deck; the boat hangs
from the arms' heads by wire falls and sits with her keel on a horn of each arm. Lift the winch's brake and the boat's own
weight carries the arms outboard until they land on their stops; then the boat goes down on the falls.

**Parts (station).** Two arms: box girder with flanges, a boss on a pin between two frame cheeks with keep plates, bolts,
grease nipple and brackets on a doubler; head sheave on an axle between two bolted cheeks with the wire over it, a becket under
it; keel horn with a wooden pad, rubber and a cleat; belly pad; fairlead in the heel; eight rungs; load plate. The stop post
with a rubber head each arm lands on turned out; the stop frame with a rubber pad it leans on stowed; the red harbour pin
through three lugs on its lanyard; lead sheave and flat sheave on each frame. Falls of 16 mm wire in two parts to a floating
block (cheeks, sheave, pins, long link) on each of the boat's hooks. Winch: bedplate on two bearers, split drum with the wire
on it and the wire's clamps, two pedestal bearings with grease nipples, gearbox with cover, filler and level glass, flange
motor with fins, terminal box, gland and cable in a cleat to a deck gland, band brake with band, link and weighted lever, the
crank's square and the crank in its clips, push-button box on a post with the brake's notice, a yellow guard bar. Gripes: eye
plate, shackle, bottle screw, slip, pendant, gunwale hook. Span wire with two lifelines made up in hanks. Coaming bar, end
rails, the embarkation ladder rolled in a cradle and lashed, the station's light on a post with its cable clipped down to a
deck gland, two bowsing tackles, the instruction placard.

**Parts (boat).** Skin and inner skin, moulded gunwale, rubber rubbing strake, keel with its shoe strip, stem bands, bilge grab
rails on blocks, grab lines in bights with wooden floats on beckets; side benches over the buoyancy tanks, end decks and
their bulkheads, four thwarts with knees and pillars, bottom boards on bearers and chocks; crutches hanging on their chains
by their sockets; the engine in its casing with lid, handles and clips, starting handle's dog, decompression lever, gear
lever, throttle, lagged exhaust out through her side, fuel tank on feet with filler and pipe, shaft and stern tube boss,
three-bladed screw in a guard hoop on a shoe, rudder on its stock with the tiller unshipped and stowed; lifting hooks fore and
aft on keel plates between cheeks, release cables, the release handle with its safety pin and notice; mast, eight oars and a
boat hook lashed along the thwarts, two water breakers on chocks, a bucket, the painter coiled on the forward end deck from a
ring bolt in the stem; lettered each side (ship, port, number, persons, size), reflective tape. A cover of orange canvas over
a ridge spar on two crutches, laced down under the strake, with a sleeve where each hook's link comes through.

**Sizes.** Boat 7.30 x 2.60 x 1.10 m: 7.3 m is the least length the rules of her time allowed [R classic-ferries, section 4];
breadth and depth as the 7.3 m glass-fibre boats of the period [M]. Davits: reach 1.60 m beyond the side with the pins 2.15 m
inboard, 5.6 m high, 3.85 m of deck with the winch, against the table of gravity davits for boats of 6.5 to 7.0 m [R
comparable-ferries, section 3: reach 2.2 m, footprint 3.1 m, height 6.0 m]. Arms 5.2 m apart, in line with the boat's hooks.
Falls 16 mm wire, two parts; drum 360 mm; lowering 0.6 m a second; turning out 3 degrees a second [M, Y].

**What works** (two inputs with keys, `keys`, `stops`, `rate`):

| Input | Range | What moves, and by which kind of mover |
|---|---|---|
| `<name>-davit` (In, Stop, Out) | 0 to 46 degrees | The arms turn about their pins (`turn`). The boat, the falls, the lifelines and the becket keep upright and go with the head sheave's axle (`carry`). The standing part of each fall, from the lead sheave on the frame up into the arm's heel, swings to follow the heel (`aim`): it is drawn as long as it is when the arm is out, and the arm hides the rest. The gripes' bottle screws and slips fall flat on the deck as the boat leaves (`turn`, 88 degrees for 46) |
| `<name>-falls` (Hoist, Stop, Lower) | 0 to the water in metres (`height` + 0.12) | The boat goes down (`slide`, riding `on` the head's `carry`). Each fall is drawn in lengths that lie inside one another, each 0.45 mm thinner than the one above, and draw out like a telescope (`slide` at a share of the boat's run): 7 lengths for 10 m. The winch's drum turns as the wire leaves it (`turn`, 610 degrees a metre) |

At 46 degrees the boat hangs with her gunwale 0.77 m over the deck and 0.26 m off the side: that is the embarkation position
(`embark` adds a stop lower down, for a ship that boards from the deck below). Looked at stowed, at 12, 23 and 46 degrees and
lowered 5 m and to the water: the boat clears the arms, the horns, the stop posts and the deck's edge all the way.

**Compared with** photograph E9 (a lifeboat in a gravity davit: frame of box sections with rungs, falls and sheaves, the
boat's propeller in a guard, grab lines, liferaft canisters, covered ladder) and the owner's choice of a classic ship ("open
or half-covered lifeboats under gravity davits").

**Not right yet.** (1) The two inputs are not interlocked: the falls can be lowered with the davits in, and the boat then goes
down through the deck. The page has no way to say one input waits on another. (2) The cover cannot be taken off on the page:
the boat already rides on the head's `carry`, a mover rides one deep, so a cover with a motion of its own would be left
behind when the davit turns. It is a build option instead (`cover=False`), and the rescue boat (`rescue=True`) lies
uncovered, so one boat of each pair shows her inside. (3) The falls taper from 16 to about 11 mm at the boat. (4) The drum
does not turn while the davits turn out (0.65 m of wire); the brake lever does not lift. (5) No guard is drawn across the
opening under the stowed boat. (6) The gripes are short ones to the inboard gunwale; tricing pendants, skates, and a sea
painter led forward are not drawn; the lifelines stay made up. (7) The starboard boat is the port boat in a mirror: her
exhaust comes out on the other side. (8) Nothing in the boat works (engine, rudder, release handle).

### 3.2 Liferaft (`liferaft`): done

Parts: canister of white glass fibre in two halves with domed ends, four moulded ribs, flange and rubber seal, three packing
bands with buckles; lettering round the shell (LIFERAFT, 25 PERSONS, SOLAS A PACK, DO NOT ROLL, THIS WAY UP) laid over the
ribs, the maker's label; the painter out through a grommet. Cradle: two saddles of bent flat bar lined with rubber, two
rails, four legs on bolted pads, ties, braces, an outrigger with an eye. Lashing: webbing round the low rail and over the
canister to a ring, slip hook, hydrostatic release unit with its rope loop and red weak link, wire strop to the eye; the
painter made fast to the weak link. Instruction placard. Sizes [M]: canister 1.45 x 0.70 m; cradle 0.75 m over the deck on a
slope of 12 degrees to the side. Compared with D1 to D4 (a canister in a cradle) and E9. Nothing moves. Not right: no rail
gate is drawn under it; the maker is the yard's own (JSY MARINE).

### 3.3 Mooring and anchoring

| Kind | Parts, each drawn | Sizes | Works | Compared with; not right |
|---|---|---|---|---|
| `windlass` | Bedplate on two bearers with holding-down bolts, opened for the spurling pipe; cable lifter with five snugs a side and a groove, its band brake (drum, band, eye, spindle, red handwheel on a post); dog clutch with fork, fulcrum and lever; gear case with inspection cover and ten bolts, filler, level glass, maker's plate; hydraulic motor with flange bolts, control valve and lever, two 84 mm pipes to bolted deck flanges; three pedestal bearings with caps, bolts and grease nipples; shaft; mooring drum with rope and its own band brake; warping end with six whelps; spurling pipe with bell mouth and collar; **stud-link cable in real links** over the lifter and down the pipe | 48 mm cable for a 4 t anchor [Y]; lifter of five snugs, 0.61 m across the cable's line; 10 t, 15 m a minute [M] | `<name>-run` (Heave, Stop, Veer), 0 to 12 m of rope: the shaft with mooring drum, its brake drum and the warping end turn | E6, C3, C6. **The cable lifter does not turn**: a chain cannot run in a file of rigid parts, so she is drawn as in port, lifter out of clutch and braked, cable in the stopper. No anchor, no devil's claw; the brakes' handwheels do not turn |
| `chain-stopper` | Bedplate on a seat with bolts; two cheeks with brackets; grooved roller on its axle; red locking bar on a hinge pin, dropped across a flat link, its locking pin on a chain; the hawse pipe's mouth with a chafing lip and the pipe going down and forward; the cable through it | For 48 mm cable [Y] | Nothing moves | The bar does not lift; no buckler plate on the hawse pipe |
| `mooring-winch` | Bedplate, gear case, motor, valve, lever, pipes, two pedestals, drum with rope, band brake with handwheel, warping end | As the windlass's mooring side | `<name>-run`: drum and warping end turn | E6 |
| `capstan` | Base with eight bolts; waisted barrel with six whelps; brass cap; four pawls on pins; control pedestal with lever, notice and two pipes to deck flanges | 0.6 m barrel [Y] | `<name>-run`: the barrel turns | C3. The whelps are straight bars across the waist |
| `bitts` | Bedplate with its fillet weld; two tube posts, weld collars, four foot brackets each, head plates with a rope lip; black, head and one band yellow | DIN 82607 size 315 as recalled [M] | | E6: the banding is the photograph's |
| `panama-chock` | One casting, an oval ring with fat lips through the bulwark; a doubler; SWL lettered | Opening 0.33 x 0.26 m [M, JIS as recalled] | | E8, C6. Needs its cut (`outline`) |
| `roller-fairlead` | Bedplate with bolts; pedestal with brackets; frame of two cheeks and two bars; two upright and two level rollers, waisted, each on its pin with a grease nipple; lugs | Opening 0.39 m wide by 0.20 m high [Y] | | C6. The rollers do not turn; the opening is low for a 64 mm rope with an eye |
| `rope-reel` | Two A-frames on bolted feet with a tie; axle in two bearings; drum; two flanges of rim, eight spokes and hub; rope in three layers; handwheel | 1.1 m flanges [Y] | Turns once to a tap | E6 (a wire reel) |
| `rope-coil` | Grating of thirteen teak slats on two bearers; a 64 mm three-strand rope coiled down in three layers, its eye on top | | | C3 (rope coiled down) |

Ropes are lines through points with bends (`sweep`, the strands shown as winding bands of shade); a rope on a drum is a turned
shape of coils, each layer in the grooves of the one under it.

### 3.4 Vehicle deck

| Kind | Parts | Sizes | Not right |
|---|---|---|---|
| `lashing-pot`, `lashing_grid` | Top plate with a cloverleaf opening, yellow, 4 mm proud of the deck; the cup welded into the plating under it; a bar across the cup. A grid is one fitting of few parts with one round cut for each pot | 230 mm plate; spacing is the placer's (not more than 2.5 m by 3.0 m [R roro-freight-ships, Lashing]) | About 760 triangles a pot: 600 pots are 0.46 million. `sunk=False` stands the plate on an uncut deck with the opening painted black |
| `lashing-rack` | Flat bar on two bolted brackets; six hooks; on each a 13 mm long-link chain hung doubled, an elephant's foot on one end, a red lever tensioner with its hook on the other; a notice | 120 kN lashings [R] | 39,000 triangles, nearly all chain. The tensioner is a plain lever |
| `trailer-trestle` | Saddle of channel with a wooden pad; four splayed legs on foot plates; ties; a lashing eye each end; a handle; load lettered | 1.12 m to the saddle [Y] | Not adjustable |
| `wheel-chocks` | Two shelves on bolted brackets with keep bars; six rubber wedges with ribbed faces and rope beckets | | |

Compared with E6 and E11 (rows of yellow lashing pots on a green deck) and F5 (lashing chains hung on a hook).

### 3.5 Ventilation and pipes

| Kind | Parts | Works |
|---|---|---|
| `ventilator-mushroom` | Coaming with a bolted deck flange, weld collar and four brackets; rubber seat; a spider and a screwed spindle; a wire screen clamped by a band; the mushroom head with its boss; a red handwheel; a brass tally on two studs | A tap screws the head down on its seat: the head slides, the handwheel turns on it (`slide`, and `turn` riding `on` it) |
| `ventilator-gooseneck` | Pipe from a bolted flange with a weld collar, bent over; a flange and gauze in its mouth; a flap on a hinge with a rubber joint and a wing nut; a brass tally | A tap shuts the flap |
| `air-pipe` | Pipe from a bolted flange; the head's flanged body with bolts; a cage of ten bars with gauze round it; the float ball on its seat; the hood; a tally on a band | |
| `sounding-pipe` | Socket ring welded on the deck; brass screw cap with a square for the key; its chain to an eye; a brass tally on the deck | |

Coamings 760 mm [M, the load line rules' height as recalled; `coaming=0.9` forward]. The mushroom ventilator asks for a round
cut under it and is drawn open below.

### 3.6 Deck furniture and lights

| Kind | Parts | Works; not right |
|---|---|---|
| `bench` | Two cast-iron ends (foot bar with two deck bolts, front leg, back leg and standard, seat bearer, arm rest with a knob); five teak seat slats and three back slats, two brass coach bolts through each at each end | Photograph E7. The ends are built of flat bar, not an ornamental casting |
| `floodlight` | Flat-bar stanchion on a welded foot with a bracket, U-bolted to two courses of the rail with packing pieces; stirrup with two wing nuts; body with fins, glass in a frame with four clips; cable from a gland in five clips, through a junction box, to a deck gland | E5, E10, B7. It does not light (the page has no night) |
| `foam-monitor` | Riser on a bolted flange; butterfly valve between flanges with its lever; training joint, worm box and handwheel; the body's bend; elevating joint and handwheel; barrel; foam branch with six air holes; red, lettered F | Two inputs with keys: train 120 degrees each way, elevate -15 to 60 (the barrel riding `on` the training). D5. Its handwheels do not turn; no foam main is drawn to it |
| `bulkhead-light` | Cast base on four screws; well-glass; a guard of two wire hoops and two rings; cable in three clips to a gland through the bulkhead | B5 |
| `loudspeaker` | Foot on four screws; stirrup with two pivot screws; horn with driver and re-entrant cone; cable gland to gland | |
| `waste-bin` | Galvanised bin with two swaged hoops and a rolled rim on three feet; two handles; a lid with a handle; lettered; lashed to the rail | E6 (bins on deck) |

## 4. Checks actually run

On the demonstration quay, built alone:

```
blender -b -P ferry/blender/build.py -- --only fittings_demo --part /tmp/chisum-f.npz --blend /tmp/chisum-f.blend
python3 ferry/blender/zfight.py --part /tmp/chisum-f.npz
python3 ferry/blender/afloat.py --part /tmp/chisum-f.npz --allow ferry/blender/afloat-known.json
python3 ferry/blender/spans.py  --part /tmp/chisum-f.npz
```

| Check | Result, as printed (12 November 2026, Blender 5.2, the last build of the night) |
|---|---|
| The quay | 248 parts, 13 inputs, 37 motions, 26 openings cut; 874,912 triangles (two lifeboat stations are 451,000 of them) |
| `zfight.py` | 248 pieces, 863,083 triangles: **0 pairs of faces lie in one plane over each other**; 0 coverings come through a surface |
| `afloat.py` | 4,352 pieces: **4,352 are held, 0 things are afloat** (`afloat-known.json` is empty and was not added to) |
| `spans.py` | **14 runs of pipe, cable, conduit and wire (14 m): every one is carried** |
| Motions and parts | `Kit.place` stops if a fitting's moving parts and motions do not agree; the quay stops if two inputs share a name. Both pass |

What the checks found on the way, and what was done: the stop frame's posts stood in the flat sheave's seat (moved apart); the
arm's knees were drawn to a radius of one metre by a slip in the tool that rounds a path (mathutils' `slerp` gives a
direction, not a length); a thwart's corner came out through the skin; winch drums, a warping end and a reel were bored
10 mm larger than their shafts and so held by nothing; the bench's back slats touched their standards only face to face,
which the check cannot see, and were given bolts through into the iron, as they have. An input worked by a tap gives no
`normal`: the page takes that for the way through a doorway.

**Not checked.** (1) **The page itself.** The library was never put into `ferry.bin.gz` and opened in the page: there is no
ship to put it on in this checkout. The motions were worked in Blender by `tools/fitting_still.py`, which follows `app.js`
`moveParts` (turn, slide, carry, aim, extend, `on` one deep). No page check (`ferry/checks/*.cjs`) was written. (2) A
moving part in any position but the one it is drawn in is not seen by `zfight.py`; the lifeboat's were looked at in six
positions. (3) Sizes marked [M] are recalled, not read. (4) `make.sh` was not run (the brief forbade it).

## 5. Pictures

`/Users/nilsjohansson/Developer/chisum-screens/2026-11-12/9-fittings/`, 30 Cycles stills of the quay, 1600 x 1000, each looked
at (most also close, at 1280 px, while they were built): two overviews (01, 02), the lifeboat station in eight (03 stowed, 04 turned out, 05 lowering, 06 her inside, 07 the
winch, 08 a davit's foot, 09 screw and rudder, 10 the starboard station), 11 the liferaft, 12 to 19 the mooring gear, 20 to
22 the vehicle deck's gear, 23 and 24 ventilators and pipes, 25 to 29 furniture and lights, 30 a ventilator open beside one
screwed shut. What the last look found and put right: shut, the mushroom ventilator's head came down through its own wire
screen; the screen now stands only as high as the open head's rim.

## 6. Decided alone, with the reason

| | Decision | Reason |
|---|---|---|
| 1 | The worktree's branch was begun from `02154d9`, where the hull's and the wheelhouse's sessions stand, not from `main` | The standards and references the brief names are only there |
| 2 | Pivot gravity davits, not roller trackways | Both are of the period. With the fall led into the arm's heel beside the pin, a pivot davit's every motion can be said exactly with the file's movers; a trackway's fall changes length and direction between frame and cradle. The boat stows low at the side and leaves the deck inboard clear |
| 3 | **The boat is lettered 44 persons, not 60** | By the rule of her time (0.6 x L x B x D, 0.283 cubic metres a person) a boat of 7.30 x 2.60 x 1.10 m carries 44. Sixty asks for about 8.0 x 2.9 x 1.22 m. The size the brief gave was kept, since the hull's places depend on it; the figure is `fittings_lifeboat.PERSONS` |
| 4 | The windlass's cable lifter is still; shaft, mooring drum and warping end turn | A chain cannot run in a file of rigid parts; drawn as a ship lies in port |
| 5 | The boat's cover is a build option, not a motion | Section 3.1, not right yet, (2) |
| 6 | The fittings' looks are added from `fittings_kit.py`, not written into `shipyard.py` | No two sessions edit one list |
| 7 | The library is seven files behind one door | A file of 3,000 lines is rewritten whole for every change; the door (`fittings.py`) is the contract |
| 8 | Eight kinds beyond the contract's seventeen (`rope-coil`, `lashing-rack`, `trailer-trestle`, `wheel-chocks`, `sounding-pipe`, `bulkhead-light`, `loudspeaker`, `waste-bin`) | The brief's list of fittings names them |

## 7. Owed

1. A page check that works the davits, the falls, a winch and a ventilator on the real page, once a ship carries them.
2. An interlock between a station's two inputs (the page's to give).
3. The boat's cover taken off on the page; the guard under the stowed boat; skates, tricing pendants, sea painter.
4. The anchor, and a cable that runs.
5. Surfaces: every fitting is flat paint; no wear, rust or grease is drawn.
6. Sizes marked [M] read against their makers' sheets and standards.
7. Each fitting's row copied into JSY-STD-404 section 3 by whoever owns that file (they are in section 3 above and in
   `parts_known_by`); the register entries for the working ones.
