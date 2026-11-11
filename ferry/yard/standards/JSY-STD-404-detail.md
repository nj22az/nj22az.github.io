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

Almost all of her. On 11 November 2026 rules 1 to 3 hold everywhere; rules 4 to 10 hold for the four fittings of section
3. The rest of the bridge is next, then each section as it is fitted. A fitting that is still a placeholder is to be said
so in its register entry rather than passed over.
