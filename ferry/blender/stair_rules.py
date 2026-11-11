"""
What a stair is, in numbers: its flights and landings, whether it keeps to its class, and what is said of it. No Blender
here: stairs.py builds from it, assemble.py writes it into the model for the page, and the checks walk what it says.
"""
from math import atan2, degrees
import spec as S


def flights(st):
    """The stair as its flights and landings, from the top down: each flight (yard at its top, height at its top, steps),
    each landing (yard it begins at, height, length), and where and at what level it arrives."""
    yard, y = st['top']
    d, r, g = st['down'], st['rise'], st['going']
    out = []
    for leg in st['legs']:
        if isinstance(leg, tuple):
            out.append(('landing', yard, y, leg[1]))
            yard += d * leg[1]
        else:
            out.append(('flight', yard, y, leg))
            yard += d * (leg - 1) * g
            y -= leg * r
    return out, (yard, y)


def check(st):
    """Hold a stair to its class. Returns what is wrong with it, or nothing."""
    c = S.STAIR_CLASS[st['cls']]
    wrong = []
    pitch = degrees(atan2(st['rise'], st['going']))
    if pitch > c['pitch'] + 0.05:
        wrong.append(f"pitch {pitch:.1f}° (a {c['name']} is {c['pitch']:g}° at most)")
    if not c['rise'][0] - 1e-6 <= st['rise'] <= c['rise'][1] + 1e-6:
        wrong.append(f"steps {st['rise'] * 1000:.0f} mm high ({c['rise'][0] * 1000:.0f} to {c['rise'][1] * 1000:.0f})")
    if st['going'] < c['going'] - 1e-6:
        wrong.append(f"going {st['going'] * 1000:.0f} mm ({c['going'] * 1000:.0f} at least)")
    if abs(st['x'][1] - st['x'][0]) < c['width'] - 1e-6:
        wrong.append(f"{abs(st['x'][1] - st['x'][0]):.2f} m wide ({c['width']:.2f} at least)")
    for leg in st['legs']:
        if not isinstance(leg, tuple) and leg > c['flight']:
            wrong.append(f'a flight of {leg} steps ({c["flight"]} at most before a landing)')
    _, (yard, y) = flights(st)
    if abs(y - st['foot']) > 0.002:
        wrong.append(f"its steps bring it to {y:.3f} m, not to the deck at {st['foot']:.3f} m")
    return wrong


def facts(st):
    """What is said of a stair: for the build's report, the page and the yard's standard."""
    _, (yard, y) = flights(st)
    steps = sum(leg for leg in st['legs'] if not isinstance(leg, tuple))
    return dict(id=st['id'], cls=st['cls'], name=st['name'], steps=steps, rise=round(st['rise'], 4), going=st['going'],
                pitch=round(degrees(atan2(st['rise'], st['going'])), 1), width=round(abs(st['x'][1] - st['x'][0]), 2),
                top=list(st['top']), foot=[round(yard, 3), round(y, 3)], down=st['down'], part=st['part'], x=[min(st['x']), max(st['x'])])
