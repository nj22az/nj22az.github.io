"""
The measures of the wheelhouse's glass, taken from the builder's own tables without Blender: the builder (wheelhouse.py)
imports Blender's modules, so its constants are read from its source here and its `view_from_helm` is run on them.
"""
import math, os, re

SRC = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'blender', 'wheelhouse.py')).read()


def const(name):
    return float(re.search(rf'^{name}\s*=\s*([0-9.]+)', SRC, re.M).group(1))


m = re.search(r'^SILL, HEAD, RAKE = ([0-9.]+), ([0-9.]+), tan\(radians\(([0-9.]+)\)\)', SRC, re.M)
SILL, HEAD, RAKE_DEG = float(m.group(1)), float(m.group(2)), float(m.group(3))
RAKE = math.tan(math.radians(RAKE_DEG))
m = re.search(r'^X_IN, X_OUT = ([0-9.]+), ([0-9.]+)', SRC, re.M)
X_IN = float(m.group(1))
m = re.search(r'^AFT, FRONT_IN, FRONT_OUT = ([0-9.]+), ([0-9.]+), ([0-9.]+)', SRC, re.M)
FRONT_IN = float(m.group(2))
CORNER = const('CORNER')
FRAME_T = 0.05
STILE = 0.06
m = re.search(r'^HELM = \(([0-9.]+), ([0-9.]+), ([0-9.]+)\)', SRC, re.M)
HELM = tuple(float(v) for v in m.groups())
m = re.search(r'^DOOR_GLASS = \(([0-9.]+), ([0-9.]+)\)', SRC, re.M)
DOOR_GLASS = (float(m.group(1)), float(m.group(2)))
HEAD_ROOM, CEIL = const('HEAD_ROOM'), const('CEIL')
GLASS_FOOT, GLASS_TOP = SILL + 0.045, HEAD - 0.045
_pane = (2 * X_IN - 2 * 0.06 - 4 * 0.10) / 5
PANES = [(-X_IN + 0.06 + k * (_pane + 0.10), -X_IN + 0.06 + k * (_pane + 0.10) + _pane) for k in range(5)]
PANE_NEXT = PANES[3]
m = re.search(r"side: \[(.*?)\]\n\s+for side in", SRC, re.S)
SIDE = [tuple(float(v) if i < 4 else v.strip(" '") for i, v in enumerate(t.split(','))) for t in re.findall(r'\(([^()]*)\)', m.group(1).replace('CORNER', str(CORNER)))]


def fwd(h):
    return (min(max(h, SILL), HEAD) - SILL) * RAKE


def glass_distance():
    """From the conning eye to the top of the forward glass, along her length."""
    return FRONT_IN + 0.045 + fwd(GLASS_TOP) - HELM[1]


def view(limit=112.5, mullion=6.0, eye=None):
    ex, ey, eh = HELM
    eh = eye if eye is not None else eh
    front = FRONT_IN + 0.045 + fwd(eh)
    spans = [(math.degrees(math.atan2(a + FRAME_T - 0.005, front - ey)), math.degrees(math.atan2(b - FRAME_T + 0.005, front - ey))) for a, b in PANES if b > 0]
    spans[0] = (0.0, spans[0][1])
    for yd0, yd1, h0, h1, what in SIDE:
        if what == 'window' and h0 + FRAME_T < eh < h1 - FRAME_T:
            a, b = yd0 + FRAME_T, yd1 - FRAME_T
        elif what == 'door' and DOOR_GLASS[0] < eh < DOOR_GLASS[1]:
            a, b = yd0 + 0.04 + STILE, yd1 - 0.04 - STILE
        else:
            continue
        spans.append(tuple(sorted((math.degrees(math.atan2(2.965, b - ey)), math.degrees(math.atan2(2.965, a - ey))))))
    spans.sort()
    merged = [list(spans[0])]
    for a, b in spans[1:]:
        if a - merged[-1][1] < mullion:
            merged[-1][1] = max(merged[-1][1], b)
        else:
            merged.append([a, b])
    seen = 2 * sum(max(0.0, min(b, limit) - min(a, limit)) for a, b in merged)
    return seen, [(round(merged[i][1], 1), round(merged[i + 1][0], 1)) for i in range(len(merged) - 1)], round(merged[-1][1], 1)
