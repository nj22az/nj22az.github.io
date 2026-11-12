"""
The yard's library of deck fittings: the one door to it (12 November 2026).

    import fittings
    got = fittings.build('bitts', (x, y, z), heading=90, group='car', name='B-AFT-1')
    got['parts'], got['inputs'], got['movers'], got['cuts'], got['clear'], got['parts_known_by']

    Every fitting is drawn about its own origin, standing on the deck at y = 0:
    x to port, y up, z forward (the ship's axes); metres. Its FRONT faces +z unless said.

FITTINGS  kind -> dict(build, size=(along its length, across, height), front, note, title, handed)
build     builds one fitting where it stands aboard (fittings_kit.build: the contract is written there)
lashing_grid  many lashing pots as few parts

The tools every fitting is drawn with are in fittings_kit.py; the fittings themselves, by where they are found aboard:
fittings_boats.py (the lifeboat station, the liferaft), fittings_mooring.py (windlass, chain stopper, winch, capstan, bitts,
chocks, fairleads, reel, rope), fittings_cargo.py (lashing pots, lashings, trestle, chocks) and fittings_deck.py (ventilators,
air and sounding pipes, bench, lights, monitor, loudspeaker, bin). None of them knows the ship's arrangement.
"""
import importlib
from fittings_kit import FITTINGS, build, Kit, prism, lathe, sweep, bar, turned       # noqa: F401  (the door's own names)

for _name in ('fittings_boats', 'fittings_liferaft', 'fittings_mooring', 'fittings_cargo', 'fittings_deck'):
    try:
        _mod = importlib.import_module(_name)
    except ModuleNotFoundError as e:
        if e.name != _name:
            raise
        continue
    if hasattr(_mod, 'lashing_grid'):
        lashing_grid = _mod.lashing_grid


def rows():
    """The library's rows for JSY-STD-404 section 3: (kind, what it is known by), from the builders' own words."""
    out = []
    for kind in sorted(FITTINGS):
        out.append((kind, FITTINGS[kind].get('known_by', '')))
    return out
