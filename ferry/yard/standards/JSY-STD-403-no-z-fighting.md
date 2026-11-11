# JSY-STD-403 · No two faces in one plane: designing against z-fighting

Johansson Shipyard · yard standard and working instruction · revision 0 · 11 November 2026 · applies to newbuilding No. 1,
the Chisum, and to every model built in this repository

The owner, 11 November 2026: "Z fighting is not allowed." Then, while the 68 m ship's steel was being drawn: "Design with
anti z fighting measures", and: "Write it in the repo , as a working instruction."

This is that instruction. It is read **before** a section is drawn, not after: a check that finds flicker afterwards is the
last line, and the design is the first.

## 1. What it is

Where two faces lie in the same plane, look the same way and overlap, the page cannot tell which is in front. The two
flicker as the view moves. The same happens to two faces that are not quite in one plane but nearer to each other than the
picture can tell apart at that distance.

How near is too near depends on how far away one stands. The page's depth has 24 bits; on foot its nearest plane is 0.07 m
(`app.js`). By the usual estimate (distance squared, over the near plane times 2²⁴) it tells faces apart to about 0.8 mm
at 30 m and about 3 mm at 60 m. She is 68 m long and her car deck is seen from end to end. **That figure is the yard's
estimate; it has not been measured on a device.** It is why the distances below are in whole millimetres and not in tenths.

## 2. The rules

A builder (a file under `ferry/blender/`) keeps all of these. `steel.py` is the first written to them and names each in
its own header.

| | Rule | How it is kept |
|---|---|---|
| 1 | **A surface is drawn once.** A wall that two rooms share is one wall, a deck over two spaces one deck. | Rooms give their edges; edges on one line are merged before anything is built (`steel.wall_lines`). Never one box per room. |
| 2 | **At a corner one part takes the corner and the other butts against it.** | The wall across the ship is carried to the outer face of the wall along her, which begins half a thickness short (`steel._corners`). A wall that ends against the middle of another ends inside it. |
| 3 | **An opening is cut, not covered.** A well, a hatch, a doorway or a window is a hole in the one plate. | Decks are one polygon with holes (`steel._plate`); a wall is drawn in lengths round its openings. No second plate is laid over a hole, and no "patch" is laid on a plate to change its colour. |
| 4 | **Nothing lies flush on a surface it looks the same way as.** What stands on a deck or against a wall meets it face to face (their faces look opposite ways), or stands off it. | A thing's foot is a solid whose underside meets the deck's top. A covering, a mat or a floor plate is a solid with thickness, or stands 4 mm and more over what it lies on. |
| 5 | **Faces that look the same way are never nearer than 10 mm**, unless one is paint (rule 6). | A wall is 10 mm; a deck's plate 12 mm; the shell's two faces 12 mm; a house's side stands 4 mm inside the deck's edge and the bulwark ends where the house begins. |
| 6 | **Paint, marks and pictures are told apart by the page, not by distance.** | They are drawn in a look that carries an `offset` (`shipyard.LOOKS`: `Marking`, `Panel face`, `Screen picture`, `Floor plate`), 0.5 to 4 mm off what they are on. Two things with the same offset on one surface must not overlap. |
| 7 | **A skin is seen from one side; a thin plate is one surface seen from both.** | Shell, walls and decks are closed solids or one-sided sheets (the look's `side` is `front`). A frame, a floor, a beam or a bulkhead is a single sheet drawn from both sides (`Primer plate`): never two sheets back to back. |
| 8 | **A two-sided sheet never lies in the plane of another face.** | A beam is left out where a bulkhead or a wall stands in its plane (`steel._beams`: `skip`); a stiffener stands on the plate's far side, not in it. |
| 9 | **Curved and raked surfaces follow one set of numbers.** Two parts that should meet along a curve are drawn from the same function at the same stations. | The shell and everything fitted to it read `lines.py`; a part fitted to the shell stands 12 mm and more inside the moulded line. `build.py` measures the structure against the plating and stops if a corner comes within 4 mm. |
| 10 | **A moving part is clear of what it passes** in every position, by 3 mm and more, and never shares a plane with its frame when shut. | A door's leaf lies 4 mm off its frame's face; a flush hatch cover's top is 4 mm over the deck's. |

## 3. How to work

1. **Before drawing a section, list its surfaces** and say for each pair that could meet which of the rules keeps them
   apart. If a pair has no rule, the design is not finished.
2. **Take every measure from one place** (`ga.py`, `spec.py`, `lines.py`, a block's own `*_place.py`). Two builders that
   each write down "6.50" will one day disagree by a millimetre, and that is the worst case: almost one plane.
3. **Draw a thing as what it is**: a plate with thickness, a bar, a box. Not a picture of a surface laid on another.
4. **Run the check after every build** (section 4) and treat any pair it names as a design fault: move the thing or make
   it one piece. Do not move one face by a fraction of a millimetre to quiet the check.
5. **Look at it**: from the far end of the longest space, low along every deck, and from outside with the sun behind, in
   the page itself. The check does not see near-misses (section 5).
6. **When a new kind of fault is found, add a rule here** and say where it was found.

## 4. How it is checked

- `python3 ferry/blender/zfight.py --part <the part file>` goes through every triangle of the model, sorted by the plane
  it lies in (to 0.4 mm), and names every pair of different pieces whose faces overlap by more than a square centimetre in
  one plane, looking the same way, or opposite ways when either is drawn from both sides. Two kinds of pair pass: paint on
  a surface (different `offset`), and two faces bedded on a third that covers them.
- The build is not called built while it names a pair. On the 68 m ship nothing is another ship's any longer, so there is
  no list of excused pairs.
- `ferry/blender/build.py` stops by itself if the shell's inner face comes through the outer, or structure through the
  plating.

## 5. What the check does not see

| | |
|---|---|
| 1 | Two faces 0.5 to 10 mm apart looking the same way: not one plane to the check, but one plane to the eye at 60 m. Rule 5 is kept by design and by looking. |
| 2 | Curved faces drawn from different stations, which cross and recross each other without ever sharing a triangle's plane. Rule 9. |
| 3 | A moving part in any position but the one it is drawn in. Rule 10. |
| 4 | The depth figure of section 1 on a real phone. Not measured. |

## 6. Open points

| | |
|---|---|
| 1 | The bridge, the emergency generator room and the drinks machine were built before this standard and passed `zfight.py` on the first Chisum. They are held to it as they are refitted on the 68 m ship. |
| 2 | A check for near-misses (faces within 10 mm, looking the same way, overlapping) would make rule 5 a program's and not the eye's. Not written. |
