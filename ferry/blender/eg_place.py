"""
Where the emergency generator room stands in the ship, as plain numbers: read by eg_room.py (Blender), which builds it
there, and by assemble.py, which names the room for the page. To move the block (to the 68 m ship's top deck), change PLACE.
"""
import lines as L

LENGTH, WIDTH, HEIGHT = 7.80, 4.50, 3.20
# The forward wall's inner face (metres from the transom), the port wall's inner face (metres to port of the centreline), the
# room's deck over the waterline, and how far that is over the deck it stands on (the present ship's house top, 11.50 m).
PLACE = dict(yard=16.50, x=2.70, deck=11.55, under=0.05)


def R(p, q, h):
    """A place in the room (p aft from the forward wall, q to starboard from the port wall, h up from its deck), in the ship."""
    return (PLACE['x'] - q, PLACE['deck'] + h, L.Z(PLACE['yard'] - p))


_a, _b = R(0.0, 0.0, 0.0), R(LENGTH, WIDTH, HEIGHT)
BOX = ([round(min(u, v), 4) for u, v in zip(_a, _b)], [round(max(u, v), 4) for u, v in zip(_a, _b)])
STAND = [round(v, 4) for v in R(7.22, 2.0, 0.0)]          # on the escape route, before the door
