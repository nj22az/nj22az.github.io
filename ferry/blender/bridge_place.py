"""
Where the navigation bridge stands in the ship, as plain numbers.

The bridge (wheelhouse.py, compass_deck.py and its register, ferry/systems/bridge.py) was designed aboard the first Chisum,
34.5 m long, and is measured in that ship's terms: metres from her transom (her wheelhouse lay from 19.5 to 23.0 m) and
heights over her bridge deck, which stood 9.1 m over her waterline. It is landed whole on the 124.8 m ship's bridge deck,
as the general arrangement asks ("her navigation bridge, landed whole with what is fitted in it"), and this file is the
placing: every builder and the register turn the bridge's own measures into the ship's through it, so that none of the
bridge's components had to be measured again.

  - SHIFT: how far forward of its old place the block stands. Its after wall's outer face (19.495 m) lands 100.0 m from
    the transom, where the chart room ends (ga.py); its front stands 0.5 m inside the front of the house.
  - DECK: the bridge deck it stands on, over the waterline. RISE: how much higher that is than the old one.

No Blender here: plain Python.
"""
import lines as L
import spec as S

OLD_DECK = 9.1                       # the first Chisum's bridge deck over her waterline
OLD_AFT = 19.495                     # her wheelhouse's after wall, outer face, from her transom
SHIFT = S.BRIDGE_SHIFT               # 80.505 m: 100.0 less 19.495 (spec.py holds it, for the stair that comes up into the wheelhouse)
DECK = S.BRIDGE_DECK
RISE = round(DECK - OLD_DECK, 4)
# The wings are carried out to her full breadth (ga.py: "the wings are carried out to her full breadth so the berth is seen
# from the wing console"): the wheelhouse is 6.0 m wide and she is 19.6 m, so each wing is 6.7 m long, and its outer 2.3 m
# stands out beyond the officers' house on knees (steel.py). The first Chisum's wing ended in a bulwark whose inner face
# stood 4.10 m off the centreline; hers stands at WING (its wooden rail's outer edge is then her moulded breadth), and
# what stood at the wing's outer end went out with it by WING_OUT.
WING_OLD = 4.10
WING = round(L.HB - 0.09, 3)
WING_OUT = round(WING - WING_OLD, 3)


# ---- The forward bay (the wheelhouse's refit, stage 6: yard/design/wheelhouse-refit.md). The owner, 12 November 2026, with
# a photograph of the ro-pax Finnarrow from her bow: "I mean that protruding part forward on the bridge"; and a chief
# constructor's remark on the console block, which stood against the forward bulkhead: it must be reached from its other
# side for electrical work and maintenance. The middle of the bridge front stands BAY forward of the wings' fronts, with a
# canted corner each side; the block keeps its place and so stands free, with a way BAY wide before it.
#
# In plan, in the bridge's own measures (x to port, metres from the first Chisum's transom), at the sill: the bay's forward
# face is BAY_XO each side of the centreline outside; from its ends a cant runs aft and outboard at 45 degrees to the
# house's forward corner (HOUSE_X, FRONT), where the wing's front begins. Its walls are WALL thick, as the old front was.
# The whole front leans forward 10 degrees as one (bridge_kit.py says why): at any height its outline in plan is this one
# moved forward.
FRONT = 23.00                        # the old front's outer face, and the wings': the line the bay stands out from
HOUSE_X = 3.00                       # the house side's outer face
SIDE_IN = 2.92                       # and its inner face (the lining)
WALL = 0.08                          # the front's thickness, lining to plating
BAY = 1.00                           # how far the bay stands forward: the way before the console block
BAY_XO = HOUSE_X - BAY               # the half breadth of its forward face, outside: the cants are at 45 degrees
_R2 = 2 ** 0.5
BAY_XI = round(BAY_XO - WALL * (_R2 - 1.0), 5)        # the half breadth of the forward face, inside
BAY_OUT, BAY_IN = FRONT + BAY, FRONT + BAY - WALL      # the forward face, outside and inside
CANT_AT = round(BAY_XI + BAY_IN - SIDE_IN, 5)          # where a cant's inner face meets the house side's lining, along her
CANT_LEN = round((SIDE_IN - BAY_XI) * _R2, 5)          # a cant's inner face, from the lining to the forward face


def bay_walls():
    """The bay's three walls as (name, a, b): the two ends of each inner face at the sill, (x, yard), going round from port
    to starboard: along a to b the room is on the right hand and the sea on the left, seen from above with her bow up."""
    return (('port', (SIDE_IN, CANT_AT), (BAY_XI, BAY_IN)), ('front', (BAY_XI, BAY_IN), (-BAY_XI, BAY_IN)), ('starboard', (-BAY_XI, BAY_IN), (-SIDE_IN, CANT_AT)))


def on_wall(name, s, q=0.0, lean=0.0):
    """A place on one of the bay's walls, (x, yard): s metres along its inner face from its `a` end, q metres out through
    the wall from the inner face (less than nothing is into the room), where the front has leaned `lean` forward."""
    a, b = next((a, b) for n, a, b in bay_walls() if n == name)
    length = ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2) ** 0.5
    ux, uy = (b[0] - a[0]) / length, (b[1] - a[1]) / length
    nx, ny = uy, -ux                                    # outward: the sea is on the left hand going a to b
    return (round(a[0] + ux * s + nx * q, 5), round(a[1] + uy * s + ny * q + lean, 5))


# Its five windows, numbered from starboard as the old front's five were: the starboard cant's, the three of the forward
# face, the port cant's. Each is (its wall, s from, s to). A post of POST_J stands each side of a forward corner, one of
# POST_K where a cant meets the house side, a MULLION between two panes of the forward face.
POST_J, POST_K, MULLION = 0.06, 0.08, 0.10
_FACE = 2 * BAY_XI
PANE_F = (_FACE - 2 * POST_J - 2 * MULLION) / 3
PANE_C = CANT_LEN - POST_K - POST_J
PANES = [('starboard', POST_J, POST_J + PANE_C)] + [('front', _FACE - POST_J - k * (PANE_F + MULLION) - PANE_F, _FACE - POST_J - k * (PANE_F + MULLION)) for k in range(3)] \
    + [('port', POST_K, POST_K + PANE_C)]
SILL_H, HEAD_H, RAKE_T = 0.95, 2.10, 0.17632698         # the glass's sill and head over the deck, and the tangent of its 10 degrees
LEAN = round((HEAD_H - SILL_H) * RAKE_T, 5)              # how far the front has leaned forward at its head
# A wiper hangs from a spindle in the head at one side of its pane, and is parked upright there, beside the post: the
# cants' at their after ends, the middle window's to port. (wiper's name, pane, s of its spindle)
WIPER_IN = 0.112
WIPERS = dict(starboard=(0, PANES[0][2] - WIPER_IN), centre=(2, PANES[2][1] + WIPER_IN), port=(4, PANES[4][1] + WIPER_IN))


def wiper_at(name, q=WALL):
    """Where a wiper's spindle stands in plan at the head, (x, yard)."""
    pane, s = WIPERS[name]
    return on_wall(PANES[pane][0], s, q, LEAN)


# The doors from the wings out onto the deck before the bridge. The owner, 12 November 2026, of the gallery under the bay,
# which nothing led to: "Of course needs doors to the deck outside the bridge". A weathertight door in each wing's forward
# wall, at its inboard end beside the house's corner, where the gallery is widest: it opens outward, as a door in an
# exposed front does, hinged on its inboard edge, and the gallery is GALLERY wide so that its leaf swings clear of the
# rail (yard/drawings/bay_drawing.py draws the swing and writes the clearance on the sheet).
FORE_DOOR = (3.10, 3.90)             # the doorway, x from and to, jamb to jamb (the wing's forward wall begins at HOUSE_X)
FORE_POST = 4.10                     # the wing's first pane, which the door's bay takes, ended here: a post fills from the doorway to it
DOOR_JAMB = 0.04                     # a door frame's jamb: the leaf is the doorway less two of these
GALLERY = 1.10                       # the gallery beyond the bay's front, all round (0.75 m before the doors were asked for): the leaf clears the rail by 0.2 m

# The console block's outline, for whoever draws it without the builder (yard/drawings/bay_drawing.py); bridge_console.py
# builds it from these: its half breadth; the desk's after edge and the cabinet's after face; its back, which is the old
# front's inner face (it stood against it, and stands free of the bay's front now); the top of its doors; the sloping
# desk from its after edge to the level strip, as (yard, height); the upstand's foot and top outboard and in its low
# middle; half the breadth of that middle.
BLOCK = dict(half=1.85, nose=22.12, face=22.20, back=FRONT - WALL, apron=0.60, desk=((22.14, 0.932), (22.50, 1.000)),
             up=(22.52, 1.315), mid=(22.72, 1.225), saddle=0.78)


def yard(old):
    """The bridge's own measure along the ship → metres from this ship's transom."""
    return old + SHIFT


def Z(old):
    """The bridge's own measure along the ship → the model's z."""
    return L.Z(old + SHIFT)


def Y(old_y):
    """A height over the first Chisum's waterline → over this ship's."""
    return old_y + RISE


def wing_x(x):
    """Where a fitting of a wing stands now: what stood beyond the old wing's middle went outboard with the bulwark."""
    return round(x + (WING_OUT if x >= 3.5 else -WING_OUT if x <= -3.5 else 0.0), 3)
