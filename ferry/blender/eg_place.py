"""
Where the emergency generator room stands in the ship, as plain numbers: read by eg_room.py (Blender), which builds it
there, by the register (ferry/systems/bridge.py) and by assemble.py, which names the room for the page.

She stands on the 68 m ship's top deck since 11 November 2026, where the general arrangement puts her (ga.py: 29.8 to 37.8 m
from the transom, on the centreline): the block is 7.96 m by 4.66 m over its 80 mm walls.
"""
import lines as L
import spec as S

LENGTH, WIDTH, HEIGHT = 7.80, 4.50, 3.20
# The forward wall's inner face (metres from the transom), the port wall's inner face (metres to port of the centreline), the
# room's deck over the waterline, and how far that is over the deck it stands on (the top deck).
PLACE = dict(yard=37.70, x=2.25, deck=round(S.TOP_DECK + 0.05, 4), under=0.05)


def R(p, q, h):
    """A place in the room (p aft from the forward wall, q to starboard from the port wall, h up from its deck), in the ship."""
    return (PLACE['x'] - q, PLACE['deck'] + h, L.Z(PLACE['yard'] - p))


_a, _b = R(0.0, 0.0, 0.0), R(LENGTH, WIDTH, HEIGHT)
BOX = ([round(min(u, v), 4) for u, v in zip(_a, _b)], [round(max(u, v), 4) for u, v in zip(_a, _b)])
STAND = [round(v, 4) for v in R(7.22, 2.0, 0.0)]          # on the escape route, before the door
