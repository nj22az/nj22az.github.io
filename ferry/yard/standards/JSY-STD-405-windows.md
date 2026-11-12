# JSY-STD-405 · Nothing is built over a window

Johansson Shipyard · yard standard and working instruction · revision 0 · 12 November 2026 · applies to newbuilding No. 1,
the Chisum, and to every model built in this repository

The owner, 12 November 2026, with a picture of the gallery under the wheelhouse's new forward bay, two of whose knees came
down the house's front across two cabin windows of the deck below: "check the quality please you cant cover the windows
like that, you need make the drawing, and make sure you dont build over a window, do you have the specs of the hull ?"

The yard had the specification: the windows of that front are in `ferry/blender/steel.py`, written from the general
arrangement, and the knees were set at round figures without being put beside them. This is the instruction that follows
from it. Like JSY-STD-403 and 404 it is read **before** a thing is drawn against a wall.

## 1. The rules

| | Rule | How it is kept |
|---|---|---|
| 1 | **The drawing comes before the steel.** What is to stand on a wall, a deck's edge or a house's front is first laid over what is already there: its windows, doors, lights and fittings, on both sides of the plate. | A sheet under `ferry/yard/drawings/`, made by a program from the builders' own numbers, with the measure from the new thing to each opening written on it. The first: `JS2-211`, the bay and its gallery (`bay_drawing.py`). |
| 2 | **A knee, a bracket or a stiffener is welded where there is something behind the plating to take it**: in line with a bulkhead, a deck or a frame, never at a round figure. | The builder asks the arrangement where the bulkheads are (`steel.bay_knees`: the bulkheads between the rooms that reach the house's front) and sets its knees there. |
| 3 | **Nothing stands nearer a window's opening than 0.30 m along the wall**, and a knee's foot ends above the windows' heads even though none is over one. | `steel.KNEE_CLEAR`, `KNEE_OVER`. The builder tries each knee against every window of the wall, from the same list the wall is cut from, and **stops the build** if one is nearer. |
| 4 | **Where a knee cannot stand, the support goes no lower than the window's head.** Between two knees far apart the deck has a beam under its plate, which comes no lower than the face bar. | `steel.bay_gallery`: `beams`. |
| 5 | **When a window is moved or widened, what was fastened where it comes is moved first.** | The check below; and the register entry of whatever moved says so. Found the same day: the side window forward of each wing door was carried forward 0.12 m under a bulkhead light and a talkback station. |
| 6 | **What properly stands before a pane is written down with its reason**: a wiper, a blind, a clear-view screen's motor, a wing station's dials. Anything else is a fault. | `windows.py`: `ALLOW`. A new entry is a decision, and says why. |

## 2. How it is checked

`python3 ferry/blender/windows.py --part <the part file>` is part of the gate (`make.sh`), after `afloat.py`. It goes
through every still pane of window glass aboard (87 on 12 November 2026) and keeps the space 0.30 m before and behind its
glass clear, less the outermost 5 cm of the pane and less 3 cm at the glass itself, which is the window's own frame.
Every other piece near is tried by points 4 cm apart over its surface; a piece that stands over four squares of 4 cm of a
pane or more, and is not in the list of what may, is named and the build stops.

On its first run, on the build of the bay as first drawn, it named what the owner had seen (the bay gallery's knees over
the office's and the pilot cabin's windows) **and one thing nobody had seen**: the middle knee of each bridge wing, drawn
on 12 November's night at 101.8 m, stood across a side window of the officers' deck. Both are put right by rule 2 and 3.

## 3. What the check does not see

| | |
|---|---|
| 1 | A thing farther from the glass than 0.30 m: a rail a pace off is looked through, as a rail is. Whether a window's *view* is spoiled is a matter for the eye and for the sight-line calculations. |
| 2 | A thing over the outermost 5 cm of a pane. So a rail at the height of a sill passes (the engine room platform's rail runs along the foot of the control room's two windows: listed, not judged a fault by this check). |
| 3 | Glass of another look than `Window glass`: the clear-view discs, instrument glasses, a door's own glass (it moves with its door). |
| 4 | Doors. Nothing checks yet that a door's swing and its opening are clear of what is built near them. |

## 4. Open points

| | |
|---|---|
| 1 | The same rule for doors, ladders and hatches: an opening is an opening. Not written. (The doors from the wings onto the gallery were drawn first, with their leaves' swing against the rail, on JS2-211: rule 1 kept by hand.) |
| 2 | The wings' knees are two a side where there were three: where the side's windows leave room. Their sizes, like the bay gallery's, are drawn and not calculated. |
