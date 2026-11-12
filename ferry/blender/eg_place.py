"""
Where the emergency generator room stands in the ship, as plain numbers: read by eg_room.py (Blender), which builds it
there, by the register (ferry/systems/bridge.py) and by assemble.py, which names the room for the page.

She stands on the officers' deck abaft the house since revision D of the general arrangement (ga.py: 80.1 to 88.06 m from
the transom, on the centreline): above the bulkhead deck, entered from the open deck, 2.9 m clear of the house's after
wall, through which her air does not have to come. The block is 7.96 m by 4.66 m over its 80 mm walls.
"""
import lines as L
import spec as S
import ga

LENGTH, WIDTH, HEIGHT = 7.80, 4.50, 3.20
GROUP = 'officers'               # the viewer's part she is drawn with: the deck she stands on
_room = next(s for s in ga.SPACES if s['id'] == 'eg-room')
# The forward wall's inner face (metres from the transom), the port wall's inner face (metres to port of the centreline), the
# room's deck over the waterline, and how far that is over the deck it stands on (the officers' deck).
PLACE = dict(yard=round(_room['yard'][1] - 0.08, 4), x=2.25, deck=round(S.OFFICERS_DECK + 0.05, 4), under=0.05)


def R(p, q, h):
    """A place in the room (p aft from the forward wall, q to starboard from the port wall, h up from its deck), in the ship."""
    return (PLACE['x'] - q, PLACE['deck'] + h, L.Z(PLACE['yard'] - p))


_a, _b = R(0.0, 0.0, 0.0), R(LENGTH, WIDTH, HEIGHT)
BOX = ([round(min(u, v), 4) for u, v in zip(_a, _b)], [round(max(u, v), 4) for u, v in zip(_a, _b)])
STAND = [round(v, 4) for v in R(7.22, 2.0, 0.0)]          # on the escape route, before the door
