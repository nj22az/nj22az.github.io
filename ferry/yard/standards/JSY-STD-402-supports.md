# JSY-STD-402 · Supports: pipes, cables, ducts and what stands on a deck

Johansson Shipyard · yard standard · revision 0 · 11 November 2026 · applies to newbuilding No. 1, the Chisum

The owner, 11 November 2026, of the emergency generator room as it was first built: "There looks like too much floating
objects in the emergency generator room why aren't you working according to Spec?"

They were right. The room had been passed by a check that asked only whether each thing touched something somewhere. A
cable stood 1.4 m up from the alternator to a tray under the deckhead; another crossed the room in the air in front of a
duct's label; the ducts hung on rods 8 mm thick that could not be seen; fuel lines ran 0.3 m off a wall with no bracket.
Each touched something at an end. None of it is how a ship is built, and none of it is in the owner's drawing.

## 1. The rule

**Nothing runs through the air.** What is fitted aboard is carried by steel that can be seen to carry it.

| What | How it is carried | Longest unsupported length |
|---|---|---|
| Pipes up to 35 mm, conduit | Clamped to a rack, a bracket, a deck or the machine's own frame | 1.5 m |
| Cables | Laid in a ladder, a tray, a conduit or a covered duct on the deck, or cleated to a surface | 0.6 m |
| A cable's free loop to a machine on rubber mounts | Free, so the machine can move | 0.6 m, and only there |
| Wire (a remote pull) | Led through an eye on each stiffener | 0.7 m |
| Ducts | On trapeze hangers: an angle bar down each side from the deckhead and an angle across under the duct | 2.0 m; one at each damper |
| Hangers, brackets, stays | Sections of 40 mm or more; a strut no thinner than 24 mm | |
| Cabinets, tanks, racks | On a plinth, a stand or their own feet on the deck; a wall cabinet on the stiffeners or the plating | |
| A line laid on the deck where one walks | Under a step-over plate marked yellow | |

A hanger, bracket or clamp is placed clear of labels, of a duct's joints, of the wall's stiffeners and of the deckhead's
beams, and never where a lever swings.

## 2. Where the figures come from

**None was read for this revision.** Each is the yard's own or recalled, and is a lead until its text is checked.

| Figure | Basis | Read or recalled |
|---|---|---|
| Small-bore steel pipe supported about every 1.5 m | Pipe support spacing tables in shipbuilding practice and class guidance for piping | Recalled |
| Cables carried continuously; cleats a few hundred millimetres apart on a ladder | IEC 60092-352 (installation of cables in ships) | Recalled |
| A free loop at a resiliently mounted machine | Makers' installation practice for generator sets | Recalled |
| Duct hangers about 2 m apart | Ventilation trunking practice | Recalled |
| 40 mm sections, 0.6 m and 0.7 m | The yard's own: what can be seen on the page from across a room, and the stiffener spacing of 0.65 m | Yard |

## 3. How it is checked

- `ferry/blender/spans.py` follows every pipe, cable, conduit and wire that a builder lays as a run (its centre line is
  written with the part file) and every long thin piece of a part named for one, and asks every 5 cm whether something of
  another part is within a centimetre of it. It fails if two carried places along a run are further apart than the table
  allows, or an end is not carried.
- `ferry/blender/afloat.py` still asks that every piece touches something.
- **Not checked by a program:** the spacing and size of duct hangers, and that a support is of a visible size. Those are
  looked at in pictures of each room before it is called built.

## 4. Open points

| | |
|---|---|
| 1 | The outside figures of section 2 are recalled. The texts are to be read and the standard reissued. |
| 2 | The check covers runs laid with `eg_room.run` and parts named for pipes, cables, conduit or wire. The wheelhouse's and the hull's fittings were built before it and are to be gone through as the 68 m ship is built. |
