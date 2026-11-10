"""Plan and section cuts of the Christina's own model (ferry/data/ferry.bin.gz), for the bridge drawings.

The model is read exactly as the page reads it (assemble.read_jmf / decode); a cut is the intersection of every
triangle of a group with a plane, returned as line segments. Axes are the model's: x to port, y up from the laden
waterline, z forward from amidships. Yard = z + 17.25 (metres from the transom); height above keel = y + 1.9.
"""
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'ferry', 'blender'))
import assemble as A  # noqa: E402

YARD = 17.25
KEEL = 1.9


def group_triangles(path=None, group='bridge'):
    """Every triangle of one group: (N,3,3) vertices, plus the material index of each."""
    header, block = A.read_jmf(path or os.path.join(ROOT, 'ferry', 'data', 'ferry.bin.gz'))
    g = [g for g in header['views'][0]['groups'] if g['id'] == group][0]
    tris, mats = [], []
    for rec in g['meshes']:
        m = A.decode(header, block, rec)
        tris.append(m['pos'][m['idx']])
        mats.append(np.full(len(m['idx']), rec['material']))
    return np.concatenate(tris), np.concatenate(mats), header, g


def cut_plane_y(tris, y):
    """Segments (M,2,2) of (x, z) where the horizontal plane at height y meets the triangles."""
    d = tris[:, :, 1] - y
    segs = []
    for a, b in ((0, 1), (1, 2), (2, 0)):
        pass
    # for each triangle find the edges that straddle the plane and join the two crossing points
    s = np.sign(d)
    straddle = (s.min(axis=1) < 0) & (s.max(axis=1) >= 0)
    t = tris[straddle]
    dd = d[straddle]
    out = []
    for tri, di in zip(t, dd):
        pts = []
        for a, b in ((0, 1), (1, 2), (2, 0)):
            if (di[a] < 0) != (di[b] < 0):
                k = di[a] / (di[a] - di[b])
                p = tri[a] + k * (tri[b] - tri[a])
                pts.append((p[0], p[2]))
        if len(pts) == 2:
            out.append(pts)
    return np.array(out).reshape(-1, 2, 2) if out else np.zeros((0, 2, 2))


def cut_plane_z(tris, z):
    """Segments (M,2,2) of (x, y) where the vertical plane at z meets the triangles (a section across the ship)."""
    d = tris[:, :, 2] - z
    s = np.sign(d)
    straddle = (s.min(axis=1) < 0) & (s.max(axis=1) >= 0)
    out = []
    for tri, di in zip(tris[straddle], d[straddle]):
        pts = []
        for a, b in ((0, 1), (1, 2), (2, 0)):
            if (di[a] < 0) != (di[b] < 0):
                k = di[a] / (di[a] - di[b])
                p = tri[a] + k * (tri[b] - tri[a])
                pts.append((p[0], p[1]))
        if len(pts) == 2:
            out.append(pts)
    return np.array(out).reshape(-1, 2, 2) if out else np.zeros((0, 2, 2))


def cut_plane_x(tris, x):
    """Segments (M,2,2) of (z, y) where the vertical plane at x meets the triangles (a section along the ship)."""
    d = tris[:, :, 0] - x
    s = np.sign(d)
    straddle = (s.min(axis=1) < 0) & (s.max(axis=1) >= 0)
    out = []
    for tri, di in zip(tris[straddle], d[straddle]):
        pts = []
        for a, b in ((0, 1), (1, 2), (2, 0)):
            if (di[a] < 0) != (di[b] < 0):
                k = di[a] / (di[a] - di[b])
                p = tri[a] + k * (tri[b] - tri[a])
                pts.append((p[2], p[1]))
        if len(pts) == 2:
            out.append(pts)
    return np.array(out).reshape(-1, 2, 2) if out else np.zeros((0, 2, 2))


def wall_gaps(segs, axis, c, lo, hi, band=0.06):
    """Openings along one wall line of a plan cut (segs from cut_plane_y): `axis` 'x' for a wall running along z at x=c,
    'z' for a wall running along x at z=c. Returns [(from, to)] along the wall, in the model's z (or x) metres."""
    a = 0 if axis == 'x' else 1
    o = 1 - a
    iv = []
    for s in segs:
        if abs(s[0, a] - c) <= band and abs(s[1, a] - c) <= band and abs(s[1, o] - s[0, o]) > 0.01:
            iv.append(tuple(sorted((float(s[0, o]), float(s[1, o])))))
    iv.sort()
    m = []
    for p, q in iv:
        if m and p <= m[-1][1] + 0.02:
            m[-1][1] = max(m[-1][1], q)
        else:
            m.append([p, q])
    out, cur = [], lo
    for p, q in m:
        if p > cur + 0.05:
            out.append((round(cur, 2), round(min(p, hi), 2)))
        cur = max(cur, q)
    if cur < hi - 0.05:
        out.append((round(cur, 2), round(hi, 2)))
    return [g for g in out if g[1] - g[0] > 0.1]
