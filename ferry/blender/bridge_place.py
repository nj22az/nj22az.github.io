"""
Where the navigation bridge stands in the ship, as plain numbers.

The bridge (wheelhouse.py, compass_deck.py and its register, ferry/systems/bridge.py) was designed aboard the first Chisum,
34.5 m long, and is measured in that ship's terms: metres from her transom (her wheelhouse lay from 19.5 to 23.0 m) and
heights over her bridge deck, which stood 9.1 m over her waterline. It is landed whole on the 68 m ship's bridge deck, as
the general arrangement asks ("her navigation bridge, moved aboard with what is fitted in it"), and this file is the
placing: every builder and the register turn the bridge's own measures into the ship's through it, so that none of the
bridge's components had to be measured again.

  - SHIFT: how far forward of its old place the block stands. Its after wall's outer face (19.495 m) lands on the forward
    end of the accommodation, 50.0 m from the transom (ga.py).
  - DECK: the bridge deck it stands on, over the waterline. RISE: how much higher that is than the old one.

No Blender here: plain Python.
"""
import lines as L
import spec as S

OLD_DECK = 9.1                       # the first Chisum's bridge deck over her waterline
OLD_AFT = 19.495                     # her wheelhouse's after wall, outer face, from her transom
SHIFT = S.BRIDGE_SHIFT               # 30.505 m: 50.0 less 19.495 (spec.py holds it, for the stair that comes up into the wheelhouse)
DECK = S.BRIDGE_DECK
RISE = round(DECK - OLD_DECK, 4)
# The wings are carried out to the ship's side (ga.py: "the wings are carried out to the side so the berth is seen from the
# wing console"). The first Chisum's wing ended in a bulwark whose inner face stood 4.10 m off the centreline; hers stands
# at WING, and what stood at the wing's outer end went out with it by WING_OUT.
WING_OLD = 4.10
WING = 6.44
WING_OUT = round(WING - WING_OLD, 3)


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
