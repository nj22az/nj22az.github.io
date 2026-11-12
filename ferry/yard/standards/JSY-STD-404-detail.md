# JSY-STD-404 · Drawn as it is: the level of detail

Johansson Shipyard · yard standard and working instruction · revision 0 · 11 November 2026 · applies to newbuilding No. 1,
the Chisum, and to every model built in this repository that is walked through

The owner, 11 November 2026, standing on her port bridge wing with the page on a tablet, in front of a bearing repeater
that was a brown cone on a white post and a lifebuoy of twelve flat lengths: "This low quality of detail is not acceptable
I can't even see what I'm looking at , don't use triangle budgets , this vessel becomes its own world when we are on it, so
it needs to be as detailed as possible".

This is the instruction that follows from it. Like JSY-STD-403 it is read **before** a thing is drawn.

## 1. The test

Stand where a person stands and look at the thing from arm's length. **Can you say what it is, how it is made, how it is
fastened and how it is worked, from the drawing alone?** If not, it is not drawn yet. A shape that only stands where the
thing would stand is a placeholder, and a placeholder is a fault to be listed, not a finished fitting.

## 2. The rules

| | Rule | How it is kept |
|---|---|---|
| 1 | **There is no triangle budget.** What a thing needs to be recognised, it gets. | `check.py` says what the model weighs and limits nothing. How a phone fetches and draws her is the page's problem to solve (section 5), never the drawing's to pay for. |
| 2 | **Round is round.** A bar, a pipe, a wheel, a ring or a lens has as many sides as its size asks, and its curved face is lit smooth with sharp ends. | `shipyard.round_sides` (14 sides under 8 mm across, 72 over 600 mm); `Part.tube`, `ball`, `ring` and `rod` do it whatever number a builder passes and whatever part they are drawn in. |
| 3 | **A made thing has made edges.** Nothing fitted aboard ends in a knife-edge corner: its edges are chamfered or rounded and catch the light, which is what lets the eye read its shape. | `Part.block`: a box with its twelve edges chamfered (3 mm unless said), its faces flat, the light carried round each edge. Plate (walls, decks, linings) stays square: `Part.box`. |
| 4 | **A thing has the parts it is known by.** Before it is drawn, its parts are listed (section 3), and each is drawn. | The builder's own description of the fitting names them; the list is the review's checklist. |
| 5 | **What is fastened shows its fastening.** A flange has its bolts, a door its hinges and catch, a box its lid's screws, a pipe its clamp, a cable its gland at each end. | A fitting stands on a foot, a flange, a bracket or a clamp that is itself drawn, and that meets what it is fixed to (JSY-STD-402 still holds: nothing hangs in the air). |
| 6 | **What can be read is lettered.** Names, plates, scales, signs. On a flat face it is a picture from her sheet; on a curved one it is paint laid on in pieces small enough to follow the curve. | `atlas.py` for pictures; `wheelhouse.in_pieces` for lettering on a ring (no piece longer than 5 mm). |
| 7 | **What works, works.** A door opens, a lid lifts, a lever moves, a wheel turns, and what is inside is there. | The part is drawn as a mover with its hinge; the file's `inputs` and `movers` carry it; a page check works it. Nothing is drawn shut that would be empty if opened. |
| 8 | **Materials are told apart.** Painted steel, bare steel, brass, rubber, canvas, rope, glass and wood each have their own look. | `shipyard.LOOKS`; a new material gets a look of its own, not a neighbour's colour. |
| 9 | **Soft things are soft.** A rope, a hose or a cable is a round line through points with a bend at each, not a straight bar. | `Part.rod`. |
| 10 | **It is looked at close before it is called built.** | A still from one metre, and the page itself from where a person stands, in the record. |

Rules 1 to 3 are kept by the tools for everything aboard at once. Rules 4 to 10 are kept one fitting at a time.

**Sculpted things may be made with Meshy.** The owner, 11 November 2026: "Use meshy for making assets for the ship if needed",
"Use credits freely on meshy", "use meshy if needed for instance for the products in the cooler". A thing that is better
sculpted than drawn from measurements (a chair's upholstery, a bottle, a mug, a pair of binoculars) may be generated there and
brought in as the drinks machine was (`blender/glb.py`). It is then measured, set to its real size, fastened and put through the
same gate as everything else; what works (a lid, a lever) is still drawn as a part of its own.

## 3. The parts a thing is known by: the first four

| Fitting | Its parts, each drawn |
|---|---|
| Bearing repeater on a pelorus stand | Deck flange with six bolts and washers; welded collar; tapered column; junction box with lid, four screws, gland and the cable up from a deck gland; dimmer; brass fork; gimbal ring on two pivots; weighted bowl on two pivots at right angles; compass card under glass; bezel; azimuth circle with far vane (a wire in a frame), near vane (a slit) with its prism housing, two knobs |
| Lifebuoy with light and smoke | Oval-sectioned ring; four reflective bands; her name over the top and her port under it, following the ring; grab line in four bights; bracket of flat bar bolted to the bulwark, a clip over the top, a hook under each lower quarter; the float's canister with its foot, instruction band and lamp; two clamps with catches; the lanyard from float to ring |
| Fire hydrant | Deck flange with four bolts; riser; clamp to the house side; valve body, bonnet flange, bonnet, gland nut, stem, handwheel with four spokes and its nut; outlet; hose coupling with two lugs; cap on a chain |
| Pantry unit, cooler and coffee maker | Carcass of panels on a set-back plinth, wooden top; cupboard with door, knob, hinges, shelf, four mugs, coffee tin, tea, sugar jar; the cooler on four feet with insulated cabinet, cold plate, two wire shelves (frame and wires), bottles, cans, milk, the watch's box, a door with gasket, door shelf and rail, two bottles in it, handle; the coffee maker with base, four feet, hot plate, column with water window, head, filter basket, switch, glass jug with collar, lid, handle and coffee; a rail across the niche; a double socket with both plugs and leads. The cooler and the cupboard open to a tap |
| Fire hose box | Cabinet of sheet steel on two wall brackets; door with stiffening rim, two hinges, quarter-turn catch and the sign; inside: the hose rolled flat on a peg with an end plate, its coupling, the nozzle upright in two clips on a shelf, the hydrant's spanner on a hook. The door opens to a tap |
| Console block (the wheelhouse's refit, 12 November 2026) | Cabinet of five bays on a set-back plinth: bottom, back, ends, partitions, stiles, a shelf or two in each bay, a slotted cable duct across the back; in each bay two doors, each a leaf on two barrel hinges (knuckles, leaves, screws) with a quarter-turn lock, four pressed louvres and (the port leaf) the bay's engraved nameplate; over the doors an apron with the builder's plate; the desk's nose with a stainless grab rail on six brackets with rosettes; a desk sloping 11° with a dark field; a level strip; an upstand leaning 20°, lower in the middle, with a dark field on each face; blanking plates where a place is not taken. Each door opens to a tap |
| A flush panel in a desk or a face | Rubber gasket; anodised plate; its picture; a screw in each corner with a cross in its head; each key a raised cap carrying its own legend; each lamp a domed lens in a chromed ring (lit, it gives light); each rotary knob with skirt, body, cap and pointer; a glass over each display window; the guarded keys as flaps; the big round pushes as turned heads |
| A display in the upstand or overhead | Rubber gasket; four bezel bars; the screen sunk under a glass; a row of keys, a brilliance knob and a lamp on the lower bar; a screw in each corner; (the radar) a sun hood; a film that darkens it when the instruments are turned down |
| Control head (engine and thruster levers) | Flange on a gasket with four screws; housing in four blocks round the slot; steel lips; the scale; inside, the drum on its shaft; the arm with its boss; the grip with rounded ends |
| Telephone handset in its cradle | Base plate with four screws; two forks; the handset (mouthpiece, grip, earpiece); a coiled cord from its low end to a gland in the desk. It lifts to a tap |
| Sound-powered telephone | Cased wall set with four screws and its engraved name; selector on an escutcheon; calling crank with its handle; the handset hung on a hook, on a coiled cord to a gland; the set's cable into the console through a gland |
| Binocular box | Varnished box: back, bottom, ends, front, a division; two brass screws; a hinged lid with a lip and a brass knob on two hinge pins; in it two 7 × 50 glasses, each two barrels with rubber eyecups and a bridge with its focusing wheel. The lid lifts to a tap |
| Pilot chair on its rail | In a slot cut in the deck covering: a base plate, two stainless rails with their countersunk screws, a stop with a rubber buffer at each end. The carriage: a plate on four shoes with four bolts, a pedestal with its foot, a rubber gaiter, the top bearing, the lock's pedal. The seat: mechanism with its height lever; seat cushion with side bolsters; a back that leans 11° with side wings, a lumbar pad, seams and a shell behind it; a headrest on two stalks; an armrest each side on a bent bar; a footrest of two bent bars and a ribbed tread. It runs on its rail and turns on its pedestal, each to a tap |
| Steering stand (rebuilt) | Hammer-finish pedestal on a foot with six holding-down bolts; an inspection plate each side with a screw in each corner and louvres; its nameplate; a dark top; the helm unit with its lid's screws and the rudder-order dial under glass in a brass bezel; the bearing's flange with six bolts and its boss; the shaft; the wheel: rim, hub, eight turned spokes with their handles, the king spoke's brass cap and band |
| Settee | Base on a recessed plinth with two flush pulls; two seat cushions; two back cushions leaning on the lining, each with a seam; an arm at each end; piping along the seat's front |
| Watchkeeper's table | A top of light wood with a round hole through it and a stainless cup hung in the hole (the cup well); a fiddle on its two free edges; her profile and her name engraved and filled; an apron; two turned legs, each on a flange with four bolts; a cleat on each lining; a drawer (front, bottom, sides, back, a brass pull, a spare log in it) that runs out to a tap; the deck log, a pencil; a lamp (base, flexible neck, shade, lit glass) |
| Chart table (rebuilt) | Mahogany carcass on a plinth: sides, back, a rail under each drawer, a top with a fiddle round three sides; three drawers, each a front with a brass pull and a label holder, a bottom, sides and a back, with folded charts in it, each running out to a tap; the chart; dividers on their pivot; a parallel rule with its two links |
| Flag locker | Mahogany case: back, five uprights, eleven shelves; forty pigeonholes, in each a flag rolled in its two colours with its wooden toggle outward |
| Locker under the boards | Carcass on a plinth: bottom, back, ends and three divisions, a mahogany top; four doors, each on two hinges with a bow pull, opening to a tap; in it four lifejackets with their tape, the flares' drum with its lid, the line-thrower's case |
| Distribution board, fire panel, first-aid box | Hammer-finish case; a door plate on a gasket with its lettering; (the boards) two barrel hinges, two quarter-turn locks, the lamps and switches of its face as shapes, four glands on its top with their cables up into a covered trunk that runs along the wall and up to the deckhead |
| Brass bulkhead instrument (clock, barometer, clinometer) | Flanged brass case with three screws; its face; a glass; the bezel |
| Fire extinguisher | Cylinder with rounded shoulder and foot; label band; brass valve; carrying handle, lever and its pivot; pressure gauge; hose with nozzle (or the CO2 horn); a wall bracket with back plate, foot cup, strap and toggle |
| Overhead console and round instruments | Two enamelled boxes with a dark field, each on a flange screwed to the deckhead; between them four round instruments, each a black case with a brass bezel and its face under glass, hung in a yoke of flat bar from a deckhead plate with a clamping knob each side, its cable up through a gland |
| Deckhead fittings | Downlight: trim ring and lit glass. Night light: black ring, red glass, a lit glass that is there only while its dimmer is up. Loudspeaker: ring, grille of rings over the dark of the cone, three screws. Smoke detector: base, body with twelve slots, lamp. Sprinkler head: escutcheon, body, two frame arms, the glass bulb, the deflector. Cable transit: steel frame with eight packed cables and four screws |
| Sun blind | Cassette with end caps on the window's head; two guide wires to eyes on the lower rail; the bottom bar with its pull cord and acorn; the film, which is drawn out of the cassette as the bar goes down. Drawn down and let up by a tap |
| Window wiper | Outside: the spindle's boss on the head's plating with three bolts; the arm's head, a cranked arm, the holder's clip, the spring strip, the rubber blade. Inside: the motor's case with four screws, its name and its cable. Parked upright beside the mullion; it sweeps when tapped, or when its switch on the console is turned |
| Clear-view screen | A round hole in the window's glass; a stainless ring in a rubber gasket with eight bolts; the glass disc with three rim clips, a driving flange with four screws and a cap outside; the motor's housing at the middle with its name, switch and lamp; the tube that carries it from the rail under the window, on a flange with two screws. The disc spins when tapped |
| Handrail under the sills | Stainless tube with eased corners; a rosette where each end meets the lining; brackets: a rosette on the lining and an arm out and up under the tube |
| Window (forward and side) | Glass in a black rubber section; a painted steel frame outside; inside, mullions, rails and a sill board of light varnished wood (forward) or a wooden casing and sill board (side) |
| Whistle pull | Hardwood pad; brass valve with its solenoid and the air pipe each way; a lever; a wire through an eye to a sheave's housing; the pull: wire, a turned wooden toggle with a brass ferrule. Drawn by a tap, and the lever goes over |
| Coffee maker (rebuilt) | Base with four feet and hot plate; column with the water's window; head; filter basket; a rocker switch with a lamp that is lit while it is on; the jug of clear glass with a glass bottom, collar, lid with its knob, and handle; the coffee in it, which rises while the machine is on and falls while the jug is lifted and poured |

Every fitting rebuilt to this standard adds its row here.

## 4. How to work

1. **Name the thing and list its parts** from what one knows of the real thing. If one does not know how it is made, find
   out before drawing; do not guess a shape.
2. **Draw the parts with the yard's tools** (rules 2, 3 and 9 come with them): `tube`, `ball`, `ring`, `rod`, `block`.
3. **Fasten it** (rule 5) and **let it work** (rule 7).
4. **Run the whole gate**: `ferry/blender/make.sh`. Finer shapes find old faults: three tags in the generator room had
   been held only by the corner of a ten-sided pipe, and hung in the air once the pipes were round.
5. **Look**: a still from one metre, then the page on foot.

## 5. What it costs, said plainly

| | Before | After the tools and the first four fittings |
|---|---|---|
| Triangles in the model | 237,141 | 579,821 (with the pantry) |
| The file a visitor fetches | 1.77 MB | 3.88 MB |
| The whole build and its checks | under a minute | about a minute |

- The page keeps the file for use offline, so it is fetched once.
- **Not measured: how a real phone draws her.** The checks run in a browser with software drawing. If she becomes heavy to
  walk through on a phone as her outfit grows, the answer is in the page (one file for each deck, fetched as one comes to
  it; a plainer copy of what is far away), not in drawing less.

## 6. What is not yet to this standard

**The owner's verdict on the first step, the same evening: "It still looks like Lego create a realistic bridge"; "Use the highest
possible form of quality you can".** Parts and round shapes are not enough: what reads as plastic bricks is flat colour under flat
light. So this standard is to grow two more rules, which are not kept anywhere yet: **surfaces** (paint, brushed metal, wood,
rubber and deck coating each with its own grain and sheen, not one flat colour) and **light** (contact shadow where things
meet, the room lit as a room). They are the next work, on the bridge first.

**Since 12 November 2026 the two rules are kept, for everything aboard at once:**

| | Rule | How it is kept |
|---|---|---|
| 11 | **A place has the light of that place.** A room is lit by its windows and its lamps and by what its own deck and walls throw back; it is darker in its corners, and dark where it has neither window nor lamp. | `blender/light.py` traces it through her as built, at the end of `make.sh`; the page lights every surface from it (`look.js`). **So a lamp is a part like any other, and a room without one is a fault to be listed:** a fitting whose material gives out light lights its room. The sun, with its sharp shadows, is the page's own. |
| 12 | **A surface is what it is made of.** Paint on plate shows the plate under it (it dishes between its stiffeners, its seams stand a little proud, water leaves its streaks); wood has its grain, metal its brush, a deck coating its grit. | `look.js` `SURFACES`, by the `surface` a look names in `shipyard.LOOKS`. A new material names its kind; a kind that does not exist yet is added there, not painted over with a neighbour's. |

Not yet kept by them: pictures of real surfaces (the grain and the plating are worked out, not photographed); wear where hands and feet go;
rust where water stands. They are next when her shapes are right.

Almost all of her is still to be drawn to rules 4 to 10. On 11 November 2026 rules 1 to 3 hold everywhere; rules 4 to 10 hold for the four fittings of section
3. The rest of the bridge is next, then each section as it is fitted. A fitting that is still a placeholder is to be said
so in its register entry rather than passed over.
