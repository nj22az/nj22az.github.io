"""
The chief engineer's day room: where the desk, the chair, the maintenance computer and the calendar are, as plain numbers.

The owner, 12 November 2026: "Build a functional Maintenance PC and add it to the chief engineers cabin"; and "Use I create
api to make a calendar in the chief engineers office with cute manga ladies". Design record: yard/design/maintenance-computer.md.

One file for everything that reads it: the drawing JS5-511 (yard/drawings/cabin_drawing.py) is made from it before anything is
built; the builder (blender/cabin_ce.py) stands the furniture from it; her register (systems/accommodation.py) takes the
places of its components from it.

The room. The chief engineer's suite (ga.py: `chief-engineer`) is on the officers' deck, port side, under the wheelhouse.
Its door is in its after wall; it has two windows in her side and two in the house front (steel.py; the builder asks steel
itself and stops if these are not the same). Nothing else stands in it yet: the bedroom and the wet unit that the
arrangement names are not partitioned off, and no cabin aboard is lined.

**Where the desk stands is the owner's own drawing's.** The owner's package for a chief engineer's suite (blender/assets/
ce-suite/: CE-SUITE-GA-001 and the method statement MS-CE-001, kept since 11 November 2026) has the day room's desk **at the
ship's side beside a window, the chair inboard of it**, its sockets 0.30 m over the deck on circuit S1 of the suite's own
board DB-CE, in skirting trunking, and DB-CE by the door. That suite is 7.2 by 5.0 m on the starboard side of a 190 m ship;
this one is 4.5 by 5.95 m to port, so the arrangement is hers and the measures are this room's. (The desk was first placed
against the after wall, without the package having been looked at: found before anything was built, and moved.)

  - The desk stands along her side, at the after end of the room. Its forward half metre is under the first side window
    (its top is 0.31 m under the sill); the screen stands on its after part, 0.2 m clear of the window's edge, so nothing
    stands before a pane (JSY-STD-405).
  - The twin socket and the data outlet are on her side under the desk, 0.30 m up, beside the system unit.
  - Skirting trunking runs from them aft along her side and inboard along the after wall to the place of DB-CE beside the
    door. **DB-CE is not installed**: its place is marked, and both cables end there, tagged.
  - The calendar hangs on the after wall, to the left of whoever sits at the desk.

Places are (x to port, metres from the transom, metres over the officers' deck). What is on or before her side is given as
(u, v, h): u metres from the transom, v out from the wall's face into the room; `side()` turns that into a place. What is
on the after wall is (x, w, h): w out from that wall's face; `aft()`.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'systems'))
import ga

_room = next(s for s in ga.SPACES if s['id'] == 'chief-engineer')
ROOM = dict(x=tuple(_room['x']), yard=tuple(_room['yard']), name=_room['name'])
DECK = 'officers'
T = 0.010                                  # a wall's thickness as drawn (steel.T): its face in the room is half of it inside the room's edge
AFT = ROOM['yard'][0] + T / 2              # the after wall's face
SIDE = ROOM['x'][1] - T / 2                # her side's face in the room
HEIGHT = ga.DECKS['bridge'] - ga.DECKS['officers']        # deck to deck: 2.8 m
DOOR = (3.6, 4.4)                          # the doorway in the after wall, to port of the centreline (steel.py)
WINDOWS = dict(side=((99.4, 100.3), (101.6, 102.5)), front=((3.6, 4.5), (5.6, 6.5)), sill=1.05, head=1.68)      # steel.py: CABIN


def side(u, v, h):
    """A place on or before her side: u from the transom, v out from the wall's face."""
    return (SIDE - v, u, h)


def aft(x, w, h):
    """A place on or before the after wall: w out from its face."""
    return (x, AFT + w, h)


# ---- The desk, along her side: a top on two end panels with a back panel between them; a pedestal of three drawers at its
# forward end. Whoever sits at it faces her side: forward is at their right hand. The back panel hangs from the top down to
# `back` over the deck: the system unit's cables pass under it to her side, where they are clipped.
DESK = dict(u=(98.30, 99.90), v=(0.025, 0.775), top=0.740, thick=0.030, panel=0.030, back=0.450)
DRAWERS = dict(u=(99.40, 99.87), v=(0.085, 0.755), h=(0.10, 0.71), count=3)
CHAIR = dict(u=98.92, v=DESK['v'][1] + 0.42, seat=0.46, wide=0.46, deep=0.44, back=0.50, base=0.30)
# ---- The computer.
SCREEN = dict(u=98.92, wide=0.540, high=0.310, foot=0.885, face=DESK['v'][0] + 0.300, thick=0.035, bezel=0.014)
KEYS = dict(u=(98.70, 99.14), v=(DESK['v'][0] + 0.46, DESK['v'][0] + 0.60), high=0.022)
MOUSE = dict(u=(99.27, 99.33), v=(DESK['v'][0] + 0.48, DESK['v'][0] + 0.58), high=0.030)        # at the right hand
UNIT = dict(u=(98.38, 98.56), v=(DESK['v'][0] + 0.14, DESK['v'][0] + 0.56), foot=0.020, high=0.400)         # the system unit, on the deck under the desk's after end
# ---- On her side under the desk, 0.30 m up (MS-CE-001, section 7: back boxes for sockets at +0.30 m): a twin socket, a data outlet.
SOCKET = dict(u=(98.62, 98.77), h=(0.26, 0.34), proud=0.012)
DATA = dict(u=(98.84, 98.92), h=(0.26, 0.34), proud=0.012)
# ---- Skirting trunking (MS-CE-001, cable schedule: circuit S1, "Skirting trunking"): along her side from the outlets aft,
# inboard along the after wall, and up to the place of the suite's distribution board DB-CE beside the door.
TRUNK = dict(h=(0.03, 0.09), deep=0.020, to=DATA['u'][1] + 0.02, up=4.64)
BOARD = dict(x=(4.52, 4.82), h=(1.48, 1.80), box=(4.55, 4.73, 1.36, 1.44))      # DB-CE's place on the after wall: an outline, a sign, and the box where the cables end
# ---- The calendar, on the after wall (cabin_pictures.py makes its page).
CALENDAR = dict(x=(6.00, 6.42), h=(1.18, 1.78))
# ---- What the computer draws, and what feeds it (systems/accommodation.py).
WATTS = 180
TAGS = dict(computer='ADM-01', data='ADM-02', socket='ELD-71', board='ELD-72', desk='OUT-51', chair='OUT-52', calendar='OUT-53')
INPUT = 'ce-computer'                      # what a tap on the computer works: the page opens the maintenance program


def screen_centre():
    return side(SCREEN['u'], SCREEN['face'], SCREEN['foot'] + SCREEN['high'] / 2)


def wrong():
    """What would stand where it cannot: an empty list when the room holds."""
    bad = []
    (x0, x1), (y0, y1) = ROOM['x'], ROOM['yard']
    (u0, u1), (v0, v1) = DESK['u'], DESK['v']
    if not (AFT + 0.2 <= u0 and u1 <= y1 - 2.0 and v0 >= 0.02 and SIDE - v1 >= x0 + 2.0):
        bad.append('the desk does not stand along her side at the room\'s after end, with the room left before it')
    if SIDE - (CHAIR['v'] + CHAIR['base']) < DOOR[1] + 0.5:
        bad.append('the chair stands in the way in from the door')
    # nothing before a pane: what stands along her side under a window is under its sill, and what is higher is clear of it
    high = [('the screen', SCREEN['u'] - SCREEN['wide'] / 2 - SCREEN['bezel'], SCREEN['u'] + SCREEN['wide'] / 2 + SCREEN['bezel'], SCREEN['foot'] + SCREEN['high'] + SCREEN['bezel'])]
    low = [('the desk', u0, u1, DESK['top']), ('the keyboard', KEYS['u'][0], KEYS['u'][1], DESK['top'] + KEYS['high']), ('the mouse', MOUSE['u'][0], MOUSE['u'][1], DESK['top'] + MOUSE['high'])]
    for a, b in WINDOWS['side']:
        for name, p, q, top in high + low:
            if q > a - 0.15 and p < b + 0.15 and top > WINDOWS['sill'] - 0.10:
                bad.append(f'{name} stands before the side window from {a} to {b} m: nothing is built over a window')
    if SCREEN['foot'] < DESK['top'] + 0.10:
        bad.append('the screen does not stand over the desk\'s top')
    for name, o in (('socket', SOCKET), ('data outlet', DATA)):
        if not (UNIT['u'][1] + 0.04 <= o['u'][0] and o['u'][1] <= DRAWERS['u'][0] - 0.3 and o['h'][0] >= TRUNK['h'][1] + 0.10 and o['h'][1] <= 0.40):
            bad.append(f'the {name} is not on her side under the desk, between the system unit and the knees, 0.30 m up')
    if DATA['u'][0] - SOCKET['u'][1] < 0.05:
        bad.append('the socket and the data outlet stand less than 50 mm apart')
    if UNIT['u'][0] < u0 + DESK['panel'] + 0.03 or UNIT['foot'] + UNIT['high'] > DESK['top'] - DESK['thick'] - 0.05:
        bad.append('the system unit does not stand under the desk, clear of its end panel and its top')
    if UNIT['foot'] + UNIT['high'] > DESK['back'] - 0.02 or SOCKET['h'][1] > DESK['back'] - 0.10:
        bad.append('the desk\'s back panel comes down over the system unit\'s cables or the outlets: they pass under it')
    knee = DRAWERS['u'][0] - UNIT['u'][1]
    if knee < 0.60:
        bad.append(f'only {knee:.2f} m is left for the knees between the system unit and the drawers')
    if abs(CHAIR['u'] - SCREEN['u']) > 0.05:
        bad.append('the chair is not before the screen')
    (bx0, bx1), (bh0, bh1) = BOARD['x'], BOARD['h']
    if bx0 - DOOR[1] < 0.10 or bx1 > CALENDAR['x'][0] - 0.3 or bh1 > 2.0:
        bad.append('the place of DB-CE is not on the after wall beside the door, clear of the calendar')
    (cx0, cx1), (ch0, ch1) = CALENDAR['x'], CALENDAR['h']
    if cx1 > SIDE - 0.6 or ch0 < 1.0 or ch1 > 2.0:
        bad.append('the calendar does not hang on the after wall at the height of the eye, clear of the corner')
    return bad


if __name__ == '__main__':
    for line in wrong() or ['the chief engineer\'s day room holds']:
        print(line)
    print(f"desk {DESK['u'][1] - DESK['u'][0]:.2f} by {DESK['v'][1] - DESK['v'][0]:.2f} m along her side, {DESK['u'][0] - AFT:.2f} m from the after wall; "
          f"knee room {DRAWERS['u'][0] - UNIT['u'][1]:.2f} m; the screen ends {WINDOWS['side'][0][0] - (SCREEN['u'] + SCREEN['wide'] / 2 + SCREEN['bezel']):.2f} m short of the window; "
          f"its middle {screen_centre()[2]:.2f} m over the deck")
