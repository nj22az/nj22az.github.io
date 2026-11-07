"""The Pocket Camera's Halloween sticker sheet, modelled and rendered in Blender, then cut out as stickers.

    python3 tools/blender/render-halloween-stickers.py [--only key,key] [--work DIR] [--preview] [--finish-only]
    (Python with Blender as a module, `pip install bpy`, and Pillow, NumPy and SciPy for the cut)

Eight parts of the children's Halloween walk on Sakura Street, 1997 (johansson-town/src/world/halloween.js), in World's
chunky-toy look and colours, so the town and the camera show the same things:

    pumpkin-lantern  World's paper pumpkin lantern (halloween-props.js buildPumpkinLantern), lit from inside
    jack-o-lantern   World's plastic jack-o'-lantern (buildJackOLantern): closed, the stem on top, its face lit inside
    obake            World's plush obake (buildObake)
    witch-hat        the costume witch hat (avatars/story-props.js buildCostume witchHat)          a hat
    cat-ears         a black cat-ear headband for the walk (new)                                    a hat
    pumpkin-cap      the pumpkin suit's stem cap (buildCostume pumpkinSuit)                         a hat
    paper-bat        the black-card bat Sakura hangs between the lanterns: World's catalogue halloween-paper-bat
    sweets           the twist-wrapped sweets the children collect: World's catalogue halloween-sweets

The bat and the sweets are built by their World catalogue builders (johansson-town/assets/catalog/halloween-*/source/),
imported here, at the sticker's finer detail. Everything else is modelled below from World's numbers. World's
jack-o'-lantern stem once stood 3.6 cm clear of the pumpkin (found here, 2 November 2026); World now seats it in the
dimple between the lobes, as this sticker does.

Render: Cycles, 1536 x 1536, a transparent film, soft key, fill and rim area lights, the Standard view transform (true
colours), a Freestyle outline in World's face-line ink #2b2623. The stickers from a three-quarter view; the hats
front-on, as on a person facing the camera at eye level (so slightly from below), because the camera puts them on a
detected face. Each hat's head is measured in the render: where the top centre of the head lands (`crown`) and how wide
the head is (`width`, temple to temple), as fractions of the finished sticker.

Cut: a thin white die-cut contour like the residents' stickers (tools/camera_sticker_contours.py contour(): a rounded
Euclidean rim of 0.45 % of the long side and a quiet contact shadow), trimmed to the sticker, long side 1024.

Writes camera/stickers/halloween/<key>.webp and <key>.thumb.webp (long side 256), and camera/stickers/halloween.json.
The renders, the measurements and a contact sheet stay in --work (default: a folder in the system's temporary folder).
"""
import argparse, hashlib, importlib.util, io, json, math, sys, tempfile
from pathlib import Path

sys.dont_write_bytecode = True                   # importing the catalogue's builders leaves nothing in their folders

import bpy, bmesh
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from mathutils.geometry import tessellate_polygon
from bpy_extras.object_utils import world_to_camera_view

ROOT = Path(__file__).resolve().parents[2]
STICKERS = ROOT / 'camera' / 'stickers'
CATALOG = ROOT / 'johansson-town' / 'assets' / 'catalog'
SOURCE = 'tools/blender/render-halloween-stickers.py'
SIZE, LONG, THUMB = 1536, 1024, 256
INK = '#2b2623'                      # World's face line (src/avatars/face.js)
INK_RIM = 0.00065                    # a cut face's ink rim (radius, metres): Freestyle's line at the pumpkins' scale

# World's colours (halloween-props.js, story-props.js)
ORANGE_PAPER, PAPER_MID, PAPER_EDGE = '#cc6e1a', (1.0, .62, .14), (.88, .30, .02)
SKIN_MID, SKIN_EDGE = (1.0, .68, .24), (.93, .42, .08)
LANTERN_FACE = (1.0, .93, .58)                 # the cut face lit from inside (World's lit face, warmed)
PAIL_GLOW = (1.0, .92, .52)                    # World's lit face, 0xfff4b0, warmed so it reads as light
CAP_DARK, STEM_GREEN = '#2a2522', '#4f7a32'
GHOST_INK, GHOST_PINK = '#1d1b1a', '#f2a3a8'   # World's plush is #fbfaf6: a shade darker here, so it keeps its form
HAT_BLACK, HAT_BAND = '#24222a', '#7d4fa8'

# The head the hats are made for: the town's default adult (avatars/build.js measure(); the trucker cap's head)
RH, HEAD_SX, HEAD_SY = 0.240555, 0.94, 1.08
HEAD_X, HEAD_Y = RH * HEAD_SX, RH * HEAD_SY
LIGHTS = {'key': 34.0, 'fill': 7.0, 'rim': 26.0}   # area lights' power per square metre of their distance
SELFIE = 1.45                        # the camera's distance from the face: a phone at arm's length (3.2 head widths)


def lin(c):
    """sRGB (hex or 0-1 triple) to linear."""
    if isinstance(c, str):
        c = [int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)


def mix(a, b, t):
    return tuple(x + (y - x) * t for x, y in zip(a, b))


def smoothstep(e0, e1, x):
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def blender(v):
    """World (x, y up, z front) to Blender (x, -y front, z up), as the catalogue builders do."""
    return Vector((v[0], -v[2], v[1]))


def load_builder(key):
    path = CATALOG / f'halloween-{key}' / 'source' / f'build-halloween-{key}.py'
    spec = importlib.util.spec_from_file_location(f'build_halloween_{key.replace("-", "_")}', path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# ---- Materials ---------------------------------------------------------------------------------------------------------
def material(name, colour, rough=0.6, spec=0.5, sheen=0.0, coat=0.0, sss=0.0, emit=None, strength=0.0,
             base_attr=None, emit_attr=None, bump=None):
    """A Principled material. base_attr / emit_attr: a colour attribute that paints the base / the glow;
    bump: (scale, strength) of horizontal pleats (the paper lantern's)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value = (*lin(colour), 1.0)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Specular IOR Level'].default_value = spec
    b.inputs['Sheen Weight'].default_value = sheen
    b.inputs['Sheen Roughness'].default_value = 0.45
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Coat Roughness'].default_value = 0.06
    b.inputs['Subsurface Weight'].default_value = sss
    if emit is not None:
        b.inputs['Emission Color'].default_value = (*lin(emit), 1.0)
        b.inputs['Emission Strength'].default_value = strength
    for attr, socket in ((base_attr, 'Base Color'), (emit_attr, 'Emission Color')):
        if attr:
            a = nt.nodes.new('ShaderNodeAttribute')
            a.attribute_name = attr
            nt.links.new(a.outputs['Color'], b.inputs[socket])
    if emit_attr:
        b.inputs['Emission Strength'].default_value = strength
    if bump:
        tc = nt.nodes.new('ShaderNodeTexCoord')
        wave = nt.nodes.new('ShaderNodeTexWave')
        wave.wave_type = 'BANDS'
        wave.bands_direction = 'Z'
        wave.wave_profile = 'SIN'
        wave.inputs['Scale'].default_value = bump[0]
        wave.inputs['Distortion'].default_value = 0.0
        nt.links.new(tc.outputs['Object'], wave.inputs['Vector'])
        bn = nt.nodes.new('ShaderNodeBump')
        bn.inputs['Strength'].default_value = bump[1]
        bn.inputs['Distance'].default_value = 0.002
        nt.links.new(wave.outputs['Fac'], bn.inputs['Height'])
        nt.links.new(bn.outputs['Normal'], b.inputs['Normal'])
    return m


def ink_material():
    """World's face-line ink as a surface (an ink line built as geometry)."""
    return material('ink', INK, rough=0.9, spec=0.0)


def glow_material(name, colour, strength=0.97):
    """Light from inside a cut face: its own colour, nothing of the lamps on it."""
    return material(name, '#140c06', rough=1.0, spec=0.0, emit=colour, strength=strength)


# ---- Meshes (built in World's frame, stored in Blender's) --------------------------------------------------------------
class Part:
    """Vertices (World frame), faces, and per-vertex colour attributes; made into one object."""

    def __init__(self):
        self.v, self.f, self.attrs = [], [], {}

    def add(self, verts, faces, attrs=None):
        base = len(self.v)
        self.v += [tuple(p) for p in verts]
        self.f += [tuple(base + i for i in face) for face in faces]
        for k, vals in (attrs or {}).items():
            self.attrs.setdefault(k, [(1, 1, 1)] * base)
            self.attrs[k] += list(vals)
        for k in self.attrs:
            if len(self.attrs[k]) < len(self.v):
                self.attrs[k] += [(1, 1, 1)] * (len(self.v) - len(self.attrs[k]))
        return base

    def object(self, name, mat, smooth=True, col=None):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata([blender(p) for p in self.v], [], self.f)
        mesh.update()
        for k, vals in self.attrs.items():
            a = mesh.color_attributes.new(k, 'FLOAT_COLOR', 'POINT')
            for i, c in enumerate(vals):
                a.data[i].color = (*c, 1.0)
        bm = bmesh.new()
        bm.from_mesh(mesh)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(mesh)
        bm.free()
        for p in mesh.polygons:
            p.use_smooth = smooth
        mesh.materials.append(mat)
        obj = bpy.data.objects.new(name, mesh)
        (col or bpy.context.scene.collection).objects.link(obj)
        return obj

    def bvh(self):
        return BVHTree.FromPolygons([Vector(p) for p in self.v], self.f)


def rings_mesh(rings, start=None, end=None):
    """Quads between closed rings of equal length; optional pole points closing the first and last ring."""
    n = len(rings[0])
    verts = [p for r in rings for p in r]
    faces = []
    for r in range(len(rings) - 1):
        for i in range(n):
            j = (i + 1) % n
            faces.append((r * n + i, r * n + j, (r + 1) * n + j, (r + 1) * n + i))
    if start is not None:
        s = len(verts)
        verts.append(start)
        faces += [(s, (i + 1) % n, i) for i in range(n)]
    if end is not None:
        e = len(verts)
        verts.append(end)
        last = (len(rings) - 1) * n
        faces += [(e, last + i, last + (i + 1) % n) for i in range(n)]
    return verts, faces


def frames_along(points):
    """Rotation-minimising frames (tangent, normal, binormal) along a polyline."""
    pts = [Vector(p) for p in points]
    tans = []
    for i in range(len(pts)):
        a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
        tans.append((b - a).normalized())
    ref = Vector((0, 1, 0)) if abs(tans[0].y) < 0.9 else Vector((1, 0, 0))
    nrm = (ref - tans[0] * ref.dot(tans[0])).normalized()
    out = []
    for i, t in enumerate(tans):
        if i:
            nrm = (nrm - t * nrm.dot(t)).normalized()
        out.append((t, nrm, t.cross(nrm)))
    return pts, out


def tube(points, radius, seg=16, caps=True, profile=None, ends=(1.0, 1.0)):
    """A tube along points: radius a number or a function of 0..1 along, profile(0..1 round) its cross-section's
    shape (flutes), with rounded ends (ends: how far each end's dome stands, in radii; 1 a hemisphere)."""
    pts, frames = frames_along(points)
    rad = radius if callable(radius) else (lambda s: radius)
    shape = profile or (lambda u: 1.0)

    def ring(p, frame, r, scale=1.0):
        t, nr, bn = frame
        return [p + (nr * math.cos(2 * math.pi * k / seg) + bn * math.sin(2 * math.pi * k / seg)) * r * scale * shape(k / seg)
                for k in range(seg)]

    n = len(pts)
    rings = [ring(p, fr, rad(i / (n - 1))) for i, (p, fr) in enumerate(zip(pts, frames))]
    if not caps:
        return rings_mesh(rings)
    head, tail = [], []
    for e in range(1, 6):
        a = math.pi / 2 * e / 6
        for end, store, sign, idx, k in ((pts[0], head, -1, 0, ends[0]), (pts[-1], tail, 1, -1, ends[1])):
            r = rad(0 if idx == 0 else 1)
            store.append(ring(end + frames[idx][0] * sign * r * k * math.sin(a), frames[idx], r, math.cos(a)))
    r0, r1 = rad(0), rad(1)
    allr = list(reversed(head)) + rings + tail
    return rings_mesh(allr, start=tuple(pts[0] - frames[0][0] * r0 * ends[0]), end=tuple(pts[-1] + frames[-1][0] * r1 * ends[1]))


def ellipsoid(c, r, seg=32, rings=16, rot=None):
    """An ellipsoid at c with radii r (rot: a 3x3 Matrix turning it)."""
    rr = []
    for j in range(1, rings):
        b = math.pi * j / rings
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            p = Vector((r[0] * math.sin(b) * math.cos(a), r[1] * math.cos(b), r[2] * math.sin(b) * math.sin(a)))
            ring.append(Vector(c) + (rot @ p if rot else p))
        rr.append(ring)
    top = Vector(c) + (rot @ Vector((0, r[1], 0)) if rot else Vector((0, r[1], 0)))
    bot = Vector(c) + (rot @ Vector((0, -r[1], 0)) if rot else Vector((0, -r[1], 0)))
    return rings_mesh(rr, start=tuple(top), end=tuple(bot))


def surface_point(bvh, x, y, z_from=2.0):
    """The front surface (+z) of a shape at (x, y): (location, normal)."""
    hit = bvh.ray_cast(Vector((x, y, z_from)), Vector((0, 0, -1)))
    if hit[0] is None:
        raise ValueError(f'nothing at ({x:.3f}, {y:.3f})')
    n = hit[1]
    return hit[0], (n if n.z > 0 else -n)


def subdivide(tris, verts, n):
    """Each triangle split into n x n smaller ones (so a decal can follow a curved surface)."""
    out_v, out_f, index = [], [], {}

    def vid(p):
        key = (round(p[0], 7), round(p[1], 7))
        if key not in index:
            index[key] = len(out_v)
            out_v.append(p)
        return index[key]

    for a, b, c in tris:
        A, B, C = (Vector(verts[i]) for i in (a, b, c))
        grid = {}
        for i in range(n + 1):
            for j in range(n + 1 - i):
                p = A + (B - A) * (i / n) + (C - A) * (j / n)
                grid[i, j] = vid((p.x, p.y))
        for i in range(n):
            for j in range(n - i):
                out_f.append((grid[i, j], grid[i + 1, j], grid[i, j + 1]))
                if i + j < n - 1:
                    out_f.append((grid[i + 1, j], grid[i + 1, j + 1], grid[i, j + 1]))
    return out_v, out_f


def decal(bvh, shapes, centre, lift=0.0006, n=6):
    """Flat 2D shapes (lists of (x, y) around the centre) laid on the front surface of a shape (projected along -z),
    lift metres in front of it."""
    verts, faces = [], []
    for shape in shapes:
        pts = [(centre[0] + x, centre[1] + y) for x, y in shape]
        tris = tessellate_polygon([[Vector((x, y, 0)) for x, y in pts]])
        sv, sf = subdivide([tuple(t) for t in tris], pts, n)
        base = len(verts)
        for x, y in sv:
            loc, nrm = surface_point(bvh, x, y)
            verts.append(tuple(loc + Vector((0, 0, lift))))     # lifted towards the front, the way it was laid: it
                                                                # never folds over a groove as a normal would
        faces += [tuple(base + i for i in f) for f in sf]
    return weld(verts, faces)


def ink_rims(bvh, shapes, centre, lift, radius, step=0.0015):
    """The ink line round each cut shape of a face, as geometry lying on the shape's edge (Freestyle would also draw
    where the face folds over a rib): one tube per side, so every corner is a round join."""
    verts, faces = [], []
    for shape in shapes:
        pts = [(centre[0] + x, centre[1] + y) for x, y in shape]
        n = len(pts)
        corners = []
        for i in range(n):                        # split the outline where it turns sharply
            a, b, c = Vector(pts[i - 1]), Vector(pts[i]), Vector(pts[(i + 1) % n])
            if (b - a).length > 1e-9 and (c - b).length > 1e-9 and (b - a).normalized().dot((c - b).normalized()) < 0.75:
                corners.append(i)
        corners = corners or [0]
        for k, i0 in enumerate(corners):
            i1 = corners[(k + 1) % len(corners)]
            idx = [i0]
            j = i0
            while True:
                j = (j + 1) % n
                idx.append(j)
                if j == i1:
                    break
            path = []
            for u, v in zip(idx, idx[1:]):
                p, q = Vector(pts[u]), Vector(pts[v])
                m = max(1, int((q - p).length / step))
                path += [p + (q - p) * (t / m) for t in range(m)]
            path.append(Vector(pts[idx[-1]]))
            line = []
            for p in path:
                loc, _ = surface_point(bvh, p.x, p.y)
                line.append(tuple(loc + Vector((0, 0, lift))))
            if len(line) >= 2:
                v, f = tube(line, radius, seg=8)
                base = len(verts)
                verts += [tuple(x) for x in v]
                faces += [tuple(base + i for i in fc) for fc in f]
    return verts, faces


def pumpkin_face(s):
    """World's jack-o'-lantern face (halloween-props.js pumpkinFace), about s across, facing +z: two triangle eyes, a
    triangle nose, and a wide grin with two square teeth hanging from its top lip."""
    def tri(cx, cy, w, h):
        return [(cx - w / 2, cy - h / 2), (cx + w / 2, cy - h / 2), (cx, cy + h / 2)]

    def quad(p0, c, p1, k):
        return [((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0],
                 (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]) for t in (i / k for i in range(1, k))]

    w = 0.36 * s
    top_y, low = -0.1 * s, -0.56 * s
    mouth = [(-w, top_y)] + quad((-w, top_y), (0, low), (w, top_y), 24) + [(w, top_y)]
    # the top lip, right to left: a gentle curve with two teeth hanging from it
    lip = lambda x: top_y - 0.045 * s * (1 - (x / w) ** 2)
    tooth_d = 0.085 * s
    xs = [0.82 * w, 0.62 * w, 0.42 * w, 0.42 * w, 0.18 * w, 0.18 * w, 0.0, -0.18 * w, -0.18 * w, -0.42 * w, -0.42 * w, -0.62 * w, -0.82 * w]
    drop = [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0]
    mouth += [(x, lip(x) - d * tooth_d) for x, d in zip(xs, drop)]
    eyes = [tri(-0.22 * s, 0.12 * s, 0.2 * s, 0.17 * s), tri(0.22 * s, 0.12 * s, 0.2 * s, 0.17 * s)]
    nose = tri(0, -0.02 * s, 0.09 * s, 0.08 * s)
    return eyes + [nose, mouth]


# ---- The parts ---------------------------------------------------------------------------------------------------------
def lobed(theta, lobes, depth):
    """A pumpkin's lobes round its axis: 1 at a lobe's middle, 1 - depth in the groove between two lobes (one lobe faces
    the front, +z, at theta = 0)."""
    u = (theta * lobes / (2 * math.pi) + 0.5) % 1.0
    return 1 - depth * (1 - math.sin(math.pi * u) ** 0.7)


def build_pumpkin_lantern():
    """World's paper pumpkin lantern (buildPumpkinLantern, r = 0.19), lit: six paper lobes, the dark cap, the stem, its
    hanging loop, the cut face glowing pale yellow. Origin on the lantern's axis at its bottom."""
    r = 0.19
    R, H = 1.04 * r, 1.46 * r                    # six lobes of radius .62r round a ring of .42r, stretched 1.18 high
    cy = H / 2
    N, M = 192, 96
    rings, glow, base = [], [], []
    for j in range(1, M):
        s = j / M
        y = cy - H / 2 * math.cos(math.pi * s)
        prof = math.sin(math.pi * s) ** 0.8
        ring, gl, bc = [], [], []
        for i in range(N):
            th = 2 * math.pi * i / N
            k = lobed(th, 6, 0.10 * math.sin(math.pi * s) ** 0.5)
            rho = R * prof * k
            ring.append((rho * math.sin(th), y, rho * math.cos(th)))
            t = min(1.0, abs(y - cy) / (H / 2))
            lobe = (k - (1 - 0.10)) / 0.10 if k < 1 else 1
            shade = 0.72 + 0.28 * max(0.0, min(1.0, lobe)) ** 0.7       # the paper doubled in the grooves: darker
            gl.append(tuple(c * shade for c in lin(mix(PAPER_MID, PAPER_EDGE, t * t))))
            bc.append(lin(mix((1.0, .55, .12), (.85, .32, .05), t)))
        rings.append(ring)
        glow.append(gl)
        base.append(bc)
    body = Part()
    v, f = rings_mesh(rings, start=(0, 0, 0), end=(0, H, 0))
    ga = [c for g in glow for c in g] + [lin(PAPER_EDGE)] * 2
    ba = [c for g in base for c in g] + [lin((.85, .32, .05))] * 2
    body.add(v, f, {'glow': ga, 'base': ba})
    paper = material('lantern paper', ORANGE_PAPER, rough=0.85, spec=0.2, sss=0.0, base_attr='base', emit_attr='glow',
                     strength=0.62, bump=(55.0, 0.18))
    objs = [body.object('Pumpkin lantern paper', paper)]
    bvh = body.bvh()
    # the face, cut on the front lobe and glowing from the bulb inside
    face, rims = Part(), Part()
    shapes, at = pumpkin_face(1.05 * r), (0.0, cy - 0.04 * r)
    face.add(*decal(bvh, shapes, at, lift=0.0012, n=14))
    rims.add(*ink_rims(bvh, shapes, at, 0.0012, INK_RIM))
    for part, name, mat in ((face, 'Pumpkin lantern face', glow_material('lantern face', LANTERN_FACE)),
                            (rims, 'Pumpkin lantern face ink', ink_material())):
        o = part.object(name, mat)
        o['no_ink'] = True
        objs.append(o)
    # the cap: a dark paper-board cap over the top opening, its edges rounded
    cap = Part()
    ctop, cbot = H + 0.02 * r, H - 0.12 * r
    prof = [(0.0, ctop), (0.26 * r, ctop), (0.31 * r, ctop - 0.012 * r), (0.33 * r, ctop - 0.035 * r),
            (0.38 * r, cbot + 0.03 * r), (0.375 * r, cbot + 0.008 * r), (0.35 * r, cbot)]
    rr = [[(rho * math.sin(2 * math.pi * i / 96), y, rho * math.cos(2 * math.pi * i / 96)) for i in range(96)] for rho, y in prof[1:]]
    v, f = rings_mesh(rr, start=(0, ctop, 0), end=(0, cbot + 0.01 * r, 0))
    cap.add(v, f)
    objs.append(cap.object('Pumpkin lantern cap', material('cap', CAP_DARK, rough=0.85, spec=0.12)))
    # the stem, a little curved, fluted
    stem = Part()
    spine = [(0.012 * r * (t ** 2), ctop - 0.03 * r + 0.32 * r * t, 0.0) for t in (i / 24 for i in range(25))]
    v, f = tube(spine, lambda t: (0.09 - 0.03 * t) * r, seg=48, profile=lambda u: 1 + 0.07 * math.cos(2 * math.pi * 6 * u))
    stem.add(v, f)
    objs.append(stem.object('Pumpkin lantern stem', material('stem', STEM_GREEN, rough=0.6, spec=0.3)))
    return objs, {}


def build_jack_o_lantern():
    """World's plastic jack-o'-lantern (buildJackOLantern, r = 0.16), lit inside by a little torch: a closed pumpkin of
    seven ribs, its carved face glowing, the green stem in the dimple on top. Origin on the floor under its middle."""
    r = 0.16
    R, Hh = 1.02 * r, 0.57 * r                   # seven lobes of radius .6r round a ring of .42r, squashed .95 high
    N, M = 224, 120
    dimple_top, dimple_bottom = 0.10 * r, 0.05 * r
    prof = []
    for j in range(M + 1):
        a = -math.pi / 2 + math.pi * j / M
        rho = R * max(0.0, math.cos(a)) ** 0.82
        y = Hh * math.sin(a)
        near = math.pi / 2 - abs(a)                   # the stalk's dimple on top, a shallow one underneath
        y -= (dimple_top if a > 0 else -dimple_bottom) * math.exp(-(near / 0.42) ** 2)
        prof.append((rho, y))
    low = min(y for _, y in prof)
    prof = [(rho, y - low) for rho, y in prof]
    H = max(y for _, y in prof)
    cy = max(prof)[1]                                # the middle of the lobes: where they are widest
    cy0 = cy - 0.06 * r                              # the middle of the face
    rings, glow, base = [], [], []
    for rho, y in prof[1:-1]:
        ring, gl, bc = [], [], []
        hk = math.sin(math.pi * min(1.0, max(0.0, y / H))) ** 0.5
        for i in range(N):
            th = 2 * math.pi * i / N
            calm = 0.6 * smoothstep(0.95, 0.55, abs(math.atan2(math.sin(th), math.cos(th)))) * smoothstep(0.75 * Hh, 0.35 * Hh, abs(y - cy0))
            k = lobed(th, 7, 0.10 * hk * (1 - calm))            # the ribs moulded shallower where the face is cut
            ring.append((rho * k * math.sin(th), y, rho * k * math.cos(th)))
            t = min(1.0, abs(y - cy) / Hh)
            lobe = (k - (1 - 0.10 * hk * (1 - calm))) / (0.10 * hk * (1 - calm) + 1e-9)
            shade = 0.8 + 0.2 * max(0.0, min(1.0, lobe))
            gl.append(tuple(c * shade for c in lin(mix(SKIN_MID, SKIN_EDGE, t * t))))
            bc.append(lin(mix((1.0, .56, .14), (.93, .40, .06), t)))
        rings.append(ring)
        glow.append(gl)
        base.append(bc)
    body = Part()
    v, f = rings_mesh(rings, start=(0, prof[0][1], 0), end=(0, prof[-1][1], 0))
    body.add(v, f, {'glow': [c for g in glow for c in g] + [lin(SKIN_EDGE)] * 2,
                    'base': [c for g in base for c in g] + [lin((.93, .40, .06))] * 2})
    plastic = material('pumpkin plastic', '#f08a24', rough=0.55, spec=0.2, base_attr='base', emit_attr='glow', strength=0.3)
    objs = [body.object('Jack-o-lantern body', plastic)]
    bvh = body.bvh()
    face, rims = Part(), Part()
    shapes = pumpkin_face(1.35 * r)
    face.add(*decal(bvh, shapes, (0.0, cy), lift=0.0014, n=18))
    rims.add(*ink_rims(bvh, shapes, (0.0, cy), 0.0014, INK_RIM))
    for part, name, mat in ((face, 'Jack-o-lantern face', glow_material('pumpkin face', PAIL_GLOW)),
                            (rims, 'Jack-o-lantern face ink', ink_material())):
        o = part.object(name, mat)
        o['no_ink'] = True
        objs.append(o)
    # the stem: green, fluted, a little curved, set in the dimple (World's: .35r tall, .1r at its foot, .07r at its top)
    stem = Part()
    foot = prof[-1][1] - 0.01 * r
    spine = [(0.03 * r * t ** 2, foot + 0.4 * r * t, -0.01 * r * t) for t in (i / 30 for i in range(31))]
    v, f = tube(spine, lambda t: (0.10 + 0.05 * (1 - smoothstep(0.0, 0.3, t)) - 0.03 * t) * r, seg=48,
                profile=lambda u: 1 + 0.08 * math.cos(2 * math.pi * 6 * u))
    stem.add(v, f)
    objs.append(stem.object('Jack-o-lantern stem', material('stem', STEM_GREEN, rough=0.6, spec=0.3)))
    return objs, {}


def build_obake():
    """World's plush obake (buildObake, h = 0.42): a round head running into a flared body with a scalloped hem, two
    little arms, bead eyes, pink felt cheeks and a small smile. Origin on the floor under its middle."""
    h = 0.42
    R = h * 0.62 / 2
    N = 192
    A = 0.028                                    # how far the hem lifts between its eight scallops
    profile = []
    for j in range(1, 41):                       # the dome of the head, from the top to its equator
        b = math.pi / 2 * j / 40
        profile.append((R * math.sin(b), h - R + R * math.cos(b), 0.0))
    for j in range(1, 41):                       # the body, flaring to the hem
        t = j / 40
        profile.append((R * (1.0 + 0.17 * t ** 1.3), (h - R) * (1 - t) + 0.016 * t, t))
    hem = profile[-1][0]
    curl = [(hem - 0.004, 0.006, 1.0), (hem - 0.012, 0.0005, 1.0), (hem - 0.024, 0.0, 1.0), (hem * 0.82, 0.003, 1.0)]
    profile += curl
    rings = []
    for rho, y, t in profile:
        ring = []
        for i in range(N):
            th = 2 * math.pi * i / N
            u = (th * 8 / (2 * math.pi)) % 1.0
            lobe = math.sin(math.pi * u) ** 0.6
            w = smoothstep(0.55, 1.0, t)
            rr = rho * (1 + 0.04 * lobe * w)
            yy = y + A * (1 - lobe) * w
            ring.append((rr * math.sin(th), yy, rr * math.cos(th)))
        rings.append(ring)
    body = Part()
    v, f = rings_mesh(rings, start=(0, h, 0), end=(0, A + 0.004, 0))
    body.add(v, f)
    plush = material('plush', '#e9e5dd', rough=0.9, spec=0.2, sheen=0.25, sss=0.05)
    objs = [body.object('Obake body', plush)]
    bvh = body.bvh()
    arms = Part()
    for sx in (-1, 1):
        rot = Matrix.Rotation(sx * -0.5, 3, 'Z') @ Matrix.Rotation(sx * 0.35, 3, 'Y')
        v, f = ellipsoid((sx * 0.97 * R, 0.42 * h, 0.33 * R), (0.24 * R * 1.3, 0.24 * R * 0.8, 0.24 * R * 0.9), seg=48, rings=24, rot=rot)
        arms.add(v, f)
    objs.append(arms.object('Obake arms', plush))
    eyes = Part()
    for sx in (-1, 1):
        loc, nrm = surface_point(bvh, sx * 0.33 * R, h - 1.02 * R)
        c = loc - nrm * 0.004
        rot = Vector((0, 0, 1)).rotation_difference(nrm).to_matrix()
        v, f = ellipsoid(tuple(c), (0.032 * h * 0.82, 0.032 * h * 1.08, 0.032 * h * 0.62), seg=32, rings=16, rot=rot)
        eyes.add(v, f)
    objs.append(eyes.object('Obake eyes', material('bead', GHOST_INK, rough=0.12, spec=0.8, coat=0.6)))
    cheeks = Part()
    disc = lambda r_: [(r_ * math.cos(2 * math.pi * i / 48), r_ * math.sin(2 * math.pi * i / 48)) for i in range(48)]
    for sx in (-1, 1):
        cheeks.add(*decal(bvh, [disc(0.042 * h)], (sx * 0.58 * R, h - 1.3 * R), lift=0.0010, n=5))
    blush = cheeks.object('Obake cheeks', material('felt', GHOST_PINK, rough=0.95, spec=0.15, sheen=0.2))
    blush['no_ink'] = True                       # a blush, not a shape: no ink line round it
    objs.append(blush)
    smile = Part()
    pts = []
    for i in range(33):
        a = math.pi * (1.15 + 0.7 * i / 32)       # the lower half of a little circle: a smile
        x, y = 0.04 * h * math.cos(a), h - 1.15 * R + 0.04 * h * math.sin(a) * 0.9
        loc, nrm = surface_point(bvh, x, y)
        pts.append(tuple(loc + nrm * 0.0008))
    v, f = tube(pts, 0.0034, seg=12)
    smile.add(v, f)
    objs.append(smile.object('Obake smile', material('thread', GHOST_INK, rough=0.7, spec=0.2)))
    return objs, {}


def hat_points():
    """The wearer's head, crown at the origin: the top centre of the head and its two sides (temple to temple)."""
    return {'crown': (0.0, 0.0, 0.0), 'left': (HEAD_X, -HEAD_Y, 0.0), 'right': (-HEAD_X, -HEAD_Y, 0.0),
            'eye': (0.0, -HEAD_Y, 0.0)}


def build_witch_hat():
    """The costume witch hat (story-props.js witchHat) on the town's adult head, its crown at the origin: a black felt
    cone with a purple band and a wide brim, tipped a little forward as the costume wears it."""
    Rr = RH * max(HEAD_SX, 1.0)
    k = 1.0
    brim_y, brim_r, cone_r, cone_h = -0.03 * k, 1.45 * Rr, 0.78 * Rr, 2.2 * Rr
    tip = Matrix.Rotation(0.12, 4, 'X')         # World's hat.rotation.x = .12: tipped a little forward, towards the camera
    N = 160
    felt = material('felt', HAT_BLACK, rough=0.85, spec=0.15, sheen=0.1)
    objs = []
    # the brim: a disc 12 mm thick with a rounded edge, rising a little towards its edge
    brim = Part()
    rr = []
    th = 0.012 * k
    lift = lambda rho: 0.022 * smoothstep(cone_r, brim_r, rho) ** 2
    prof = [(cone_r * 0.96, th / 2)] + [(cone_r + (brim_r - cone_r) * t, th / 2) for t in (i / 30 for i in range(1, 31))]
    edge = [(brim_r + th / 2 * math.sin(a), th / 2 * math.cos(a)) for a in (math.pi * i / 10 for i in range(1, 10))]
    prof += edge + [(cone_r + (brim_r - cone_r) * t, -th / 2) for t in (i / 30 for i in range(30, -1, -1))] + [(cone_r * 0.96, -th / 2)]
    for rho, dy in prof:
        rr.append([(rho * math.sin(2 * math.pi * i / N), brim_y + dy + lift(min(rho, brim_r)), rho * math.cos(2 * math.pi * i / N)) for i in range(N)])
    v, f = rings_mesh(rr)
    v += [(0, brim_y + th / 2, 0), (0, brim_y - th / 2, 0)]
    c0, c1 = len(v) - 2, len(v) - 1
    f += [(c0, i, (i + 1) % N) for i in range(N)] + [(c1, len(rr) * N - N + (i + 1) % N, len(rr) * N - N + i) for i in range(N)]
    brim.add(v, f)
    # the cone: felt, softly concave, its tip rounded and bending a little to one side
    cone = Part()
    rings = []
    M = 80
    for j in range(M + 1):
        t = j / M
        rho = cone_r * (1 - t) * (1 - 0.10 * math.sin(math.pi * t)) + 0.006 * t
        bend = 0.07 * cone_h * smoothstep(0.45, 1.0, t) ** 2
        y = brim_y + th / 2 + cone_h * t - 0.02 * cone_h * smoothstep(0.6, 1.0, t)
        rings.append([(rho * math.sin(2 * math.pi * i / N) + bend, y, rho * math.cos(2 * math.pi * i / N)) for i in range(N)])
    rings[0] = [(x, y - 0.002, z) for x, y, z in rings[0]]          # its foot sunk 2 mm into the brim
    v, f = rings_mesh(rings, start=(0, brim_y + th / 2 - 0.002, 0), end=(0.07 * cone_h, brim_y + th / 2 + cone_h * 0.98 + 0.004, 0))
    cone.add(v, f)
    # the band: purple ribbon round the foot of the cone
    band = Part()
    bh, b0 = 0.064 * k, brim_y + th / 2 + 0.002       # World's band is 5 cm; a little deeper so it reads on a phone
    rb = []
    for y, out in ((b0, 0.0), (b0 + 0.004, 0.0045), (b0 + bh - 0.004, 0.0045), (b0 + bh, 0.0)):
        t = (y - brim_y - th / 2) / cone_h
        rho = cone_r * (1 - t) * (1 - 0.10 * math.sin(math.pi * t)) + 0.006 * t + out + 0.001
        rb.append([(rho * math.sin(2 * math.pi * i / N), y, rho * math.cos(2 * math.pi * i / N)) for i in range(N)])
    v, f = rings_mesh(rb)
    band.add(v, f)
    for part, name, mat in ((brim, 'Witch hat brim', felt), (cone, 'Witch hat crown', felt),
                            (band, 'Witch hat band', material('band', HAT_BAND, rough=0.5, spec=0.4, sheen=0.15))):
        part.v = [tuple(tip @ Vector(p)) for p in part.v]
        objs.append(part.object(name, mat))
    return objs, hat_points()


def chaikin(points, rounds=4):
    """A closed outline smoothed (corner cutting): the quadratic B-spline of its points."""
    pts = [Vector(p) for p in points]
    for _ in range(rounds):
        out = []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            out += [a * 0.75 + b * 0.25, a * 0.25 + b * 0.75]
        pts = out
    return [(p.x, p.y) for p in pts]


def pillow(outline, depth, edge, rounds=6, steps=8):
    """A felt pillow: a closed outline (x, y) given depth along z (front +depth/2), its edge rounded by `edge`, and its
    flat faces filled with rings shrinking to the middle (so it can be bent afterwards): verts, faces."""
    pts = [Vector((x, y, 0)) for x, y in outline]
    m = len(pts)
    cx, cy = sum(p.x for p in pts) / m, sum(p.y for p in pts) / m
    normals = []
    for i in range(m):
        t = (pts[(i + 1) % m] - pts[i - 1]).normalized()
        nrm = Vector((t.y, -t.x, 0))
        if nrm.dot(pts[i] - Vector((cx, cy, 0))) < 0:
            nrm = -nrm
        normals.append(nrm)
    edge_rings = []
    for k in range(-rounds, rounds + 1):
        a = math.pi / 2 * k / rounds
        inset = edge * (1 - math.cos(a))
        z = math.copysign(depth / 2 - edge, k) + edge * math.sin(a) if k else 0.0
        edge_rings.append([(p.x - nr.x * inset, p.y - nr.y * inset, z) for p, nr in zip(pts, normals)])

    def towards_middle(ring):
        z = ring[0][2]
        return [[(cx + (x - cx) * (1 - s), cy + (y - cy) * (1 - s), z) for x, y, _ in ring] for s in (i / steps for i in range(1, steps))]

    back = list(reversed(towards_middle(edge_rings[0])))
    front = towards_middle(edge_rings[-1])
    return rings_mesh(back + edge_rings + front, start=(cx, cy, edge_rings[0][0][2]), end=(cx, cy, edge_rings[-1][0][2]))


def weld(verts, faces, eps=1e-6):
    """Merges vertices closer than eps (a pillow's faces and its edge, a decal's triangles: one smooth skin, no cracks)."""
    from mathutils.kdtree import KDTree
    tree = KDTree(len(verts))
    for i, p in enumerate(verts):
        tree.insert(p, i)
    tree.balance()
    remap, out, first = [None] * len(verts), [], {}
    for i, p in enumerate(verts):
        if remap[i] is not None:
            continue
        k = len(out)
        out.append(tuple(p))
        for _, j, _ in tree.find_range(p, eps):
            if remap[j] is None:
                remap[j] = k
    faces = [tuple(remap[i] for i in fc) for fc in faces]
    return out, [fc for fc in faces if len(set(fc)) == len(fc)]


def build_cat_ears():
    """A black cat-ear headband for the walk (new): a black satin band over the head, two black felt ears with pink felt
    insides clipped on it, on the town's adult head (crown at the origin), its band over the hair."""
    cyh = -HEAD_Y                                 # the head's centre
    hair = 1.07
    z0 = 0.012                                    # the band sits a little in front of the ears' line
    a_, b_ = HEAD_X * hair + 0.009, HEAD_Y * hair + 0.009
    objs = []
    # the band: a flat strip 30 mm wide (front to back) and 16 mm thick over the hair, its edges and ends rounded
    path = [(a_ * math.sin(al), cyh + b_ * math.cos(al), z0) for al in (math.radians(-74 + 148 * i / 120) for i in range(121))]
    P, F = frames_along(path)
    W, T, seg = 0.030, 0.016, 48
    sq = lambda u: math.copysign(abs(u) ** 0.5, u)
    rings = []
    for p in P:
        radial = Vector((p.x / a_ ** 2, (p.y - cyh) / b_ ** 2, 0)).normalized()
        rings.append([p + Vector((0, 0, 1)) * (W / 2) * sq(math.cos(2 * math.pi * k / seg)) + radial * (T / 2) * sq(math.sin(2 * math.pi * k / seg))
                      for k in range(seg)])
    for end in (0, -1):
        t = F[end][0] * (-1 if end == 0 else 1)
        cap = [[P[end] + (q - P[end]) * math.cos(math.pi / 2 * e / 6) + t * (T / 2) * math.sin(math.pi / 2 * e / 6) for q in rings[end]]
               for e in range(1, 6)]
        rings = (list(reversed(cap)) + rings) if end == 0 else (rings + cap)
    band = Part()
    band.add(*rings_mesh(rings, start=tuple(P[0] - F[0][0] * T / 2), end=tuple(P[-1] + F[-1][0] * T / 2)))
    objs.append(band.object('Headband', material('band satin', '#1c1b20', rough=0.38, spec=0.5, sheen=0.1)))
    # the ears: felt pillows over a card frame, clipped on the band (it passes inside their feet), cupped a little,
    # leaning out with the head, pink felt inside
    eh, eb = 0.205, 0.185
    ear = chaikin([(-eb / 2, -0.03), (-eb * 0.52, 0.02), (-eb * 0.36, eh * 0.55), (-0.012, eh * 1.02), (0.014, eh * 1.0),
                   (eb * 0.40, eh * 0.52), (eb * 0.52, 0.02), (eb / 2, -0.03), (0.0, -0.045)], 5)
    pink = chaikin([(-eb * 0.27, 0.035), (-eb * 0.20, eh * 0.50), (-0.004, eh * 0.84), (0.012, eh * 0.83),
                    (eb * 0.24, eh * 0.48), (eb * 0.29, 0.035), (0.0, 0.02)], 5)
    D = 0.034
    ears, inner = Part(), Part()
    for sx in (-1, 1):
        al = math.radians(sx * 36)
        base = Vector((a_ * math.sin(al), cyh + b_ * math.cos(al), z0))
        turn = Matrix.Rotation(math.radians(sx * -24), 3, 'Z') @ Matrix.Rotation(math.radians(sx * -6), 3, 'Y')
        flip = -1 if sx > 0 else 1                # mirror so each ear's tip leans the same way out

        def place(p):
            x, y, z = p[0] * flip, p[1], p[2]
            z += 1.6 * x * x                      # cupped: its sides come forward
            return tuple(base + turn @ Vector((x, y - 0.012, z + 0.004)))

        v, f = pillow(ear, D, 0.011)
        ears.add([place(q) for q in v], f)
        v, f = pillow(pink, 0.004, 0.0018, rounds=3)
        inner.add([place((q[0], q[1], q[2] + D / 2 + 0.0004)) for q in v], f)
    objs.append(ears.object('Cat ears', material('ear felt', '#1f1d24', rough=0.92, spec=0.12, sheen=0.12)))
    objs.append(inner.object('Cat ears inside', material('ear pink', '#dc7896', rough=0.95, spec=0.1, sheen=0.1)))
    return objs, hat_points()


def frame_of(direction, normal):
    """A rotation taking +x to `direction` and +z as near `normal` as it can be."""
    d = Vector(direction).normalized()
    n = Vector(normal)
    n = (n - d * n.dot(d)).normalized()
    return Matrix((d, n.cross(d), n)).transposed()


def build_pumpkin_cap():
    """The pumpkin suit's stem cap (story-props.js pumpkinSuit: a green stem and a leaf on the crown), on the town's
    adult head (crown at the origin): the stem fluted, a little bent, its cut end paler; the leaf out to the wearer's
    left and turned up to show; a curl of tendril to the right."""
    objs = []
    stem = Part()
    spine = [(0.016 * t ** 2, -0.008 + 0.098 * t, -0.004 * t) for t in (i / 48 for i in range(49))]
    radius = lambda t: 0.025 - 0.005 * t + 0.005 * (1 - smoothstep(0.0, 0.14, t)) ** 2
    v, f = tube(spine, radius, seg=96, profile=lambda u: 0.95 + 0.11 * abs(math.cos(math.pi * 6 * u)) ** 0.7, ends=(0.35, 0.3))
    y0, y1 = min(p[1] for p in v), max(p[1] for p in v)
    top = lambda p: smoothstep(0.93, 1.0, (p[1] - y0) / (y1 - y0))
    cols = [mix(mix(lin('#3d6627'), lin('#6c9a44'), (p[1] - y0) / (y1 - y0)), lin('#b7c48a'), top(p)) for p in v]
    stem.add(v, f, {'base': cols})
    objs.append(stem.object('Pumpkin stem', material('stem', STEM_GREEN, rough=0.6, spec=0.3, base_attr='base')))
    leaf = Part()
    L, Wd, lift, curl = 0.15, 0.13, 0.014, 0.016
    rows, cols_ = 40, 24
    surf = lambda u, sv: (u * L, sv * half(u), lift * abs(sv) ** 1.25 - curl * u * u)
    half = lambda u: Wd / 2 * math.sin(math.pi * min(1.0, u * 1.03)) ** 0.5 * (1 - 0.18 * u) + 0.002
    grid = [surf(j / rows, i / (cols_ / 2) - 1) for j in range(rows + 1) for i in range(cols_ + 1)]
    w = cols_ + 1
    faces = [(j * w + i, j * w + i + 1, (j + 1) * w + i + 1, (j + 1) * w + i) for j in range(rows) for i in range(cols_)]
    n = len(grid)
    verts = grid + [(x, y, z - 0.0022) for x, y, z in grid]
    faces += [tuple(n + i for i in reversed(fc)) for fc in faces]
    for j in range(rows):
        faces += [(j * w, (j + 1) * w, n + (j + 1) * w, n + j * w), (j * w + cols_, n + j * w + cols_, n + (j + 1) * w + cols_, (j + 1) * w + cols_)]
    for i in range(cols_):
        faces += [(i, n + i, n + i + 1, i + 1), (rows * w + i, rows * w + i + 1, n + rows * w + i + 1, n + rows * w + i)]
    rot = frame_of((1.0, 0.12, 0.30), (-0.10, 0.50, 0.86))
    at = Vector((0.018, 0.004, 0.012))
    put = lambda p: tuple(at + rot @ Vector(p))
    leaf.add(*weld([put(p) for p in verts], faces))
    objs.append(leaf.object('Pumpkin leaf', material('leaf', '#4e7f2e', rough=0.5, spec=0.3)))
    # its veins, paler, raised a hair off its face (no ink: they are drawn in the leaf, not cut out)
    veins = Part()
    on = lambda u, sv: put(tuple(c + d for c, d in zip(surf(u, sv), (0, 0, 0.0007))))
    veins.add(*tube([on(u, 0.0) for u in (0.02 + 0.9 * i / 30 for i in range(31))], lambda t: 0.0026 * (1 - 0.6 * t), seg=10))
    for u0 in (0.22, 0.42, 0.62):
        for side in (-1, 1):
            veins.add(*tube([on(u0 + 0.16 * t, side * 0.72 * t) for t in (i / 12 for i in range(13))], lambda t: 0.0018 * (1 - 0.5 * t), seg=8))
    vein = veins.object('Pumpkin leaf veins', material('veins', '#9cc46a', rough=0.55, spec=0.3))
    vein['no_ink'] = True
    objs.append(vein)
    tendril = Part()
    pts = []
    for i in range(141):
        t = i / 140
        a = 3.4 * math.pi * t
        rad = 0.026 * (1 - 0.65 * t)
        pts.append((-0.022 - 0.055 * t - rad * math.sin(a), 0.006 + rad * (1 - math.cos(a)) + 0.028 * t, 0.016 + 0.006 * t))
    tendril.add(*tube(pts, lambda t: 0.0045 * (1 - 0.5 * t), seg=12))
    objs.append(tendril.object('Pumpkin tendril', material('tendril', '#5a8a34', rough=0.55, spec=0.3)))
    return objs, hat_points()


def build_paper_bat(bat):
    made = bat.build('render')
    return made['objects'], {}


def build_sweets(sweets, plan):
    made = sweets.build('render', plan=plan)
    return made['objects'], {}


# ---- Camera, lights, render --------------------------------------------------------------------------------------------
def all_points(objs):
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in objs:
        if o.type != 'MESH':
            continue
        ev = o.evaluated_get(dg)
        m = ev.matrix_world
        pts += [m @ v.co for v in ev.data.vertices]
    return pts


def setup_render(scene, preview):
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 24 if preview else 112
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPENIMAGEDENOISE'
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.max_bounces = 8
    scene.render.film_transparent = True
    scene.render.resolution_x = scene.render.resolution_y = 512 if preview else SIZE
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = 0.0
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    scene.render.use_freestyle = True
    scene.render.line_thickness_mode = 'ABSOLUTE'
    scene.render.line_thickness = 4.2 * scene.render.resolution_x / SIZE
    fs = scene.view_layers[0].freestyle_settings
    fs.crease_angle = math.radians(120)
    ls = fs.linesets[0]
    ls.select_by_visibility = True
    ls.visibility = 'VISIBLE'
    ls.select_by_edge_types = True
    ls.select_silhouette = True
    ls.select_border = True
    ls.select_crease = False
    ls.select_material_boundary = True
    ls.select_external_contour = True
    ls.linestyle = ls.linestyle or bpy.data.linestyles.new('ink')
    ls.linestyle.color = lin(INK)
    ls.linestyle.thickness = 1.0
    ls.linestyle.caps = 'ROUND'
    world = bpy.data.worlds.new('studio')
    world.use_nodes = True
    bg = world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (*lin('#e8e2d8'), 1.0)
    bg.inputs['Strength'].default_value = 0.16
    scene.world = world


def look_at(obj, target, up=Vector((0, 0, 1))):
    d = (Vector(target) - obj.location).normalized()
    obj.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def add_light(scene, name, loc, target, power, size):
    l = bpy.data.lights.new(name, 'AREA')
    l.shape = 'DISK'
    l.size = size
    l.energy = power
    o = bpy.data.objects.new(name, l)
    scene.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    return o


def frame_camera(scene, objs, view, hat):
    """A camera that shows the part whole: three-quarter (view = azimuth, elevation in degrees, the World frame), or a
    hat's front-on view from eye level at a selfie's distance, the picture shifted up to the hat."""
    cam_data = bpy.data.cameras.new('camera')
    cam = bpy.data.objects.new('camera', cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    pts = all_points(objs)
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centre = (lo + hi) / 2
    radius = max((p - centre).length for p in pts)
    if hat:
        eye = blender(hat['eye'])
        cam.location = eye + Vector((0, -SELFIE, 0))
        cam.rotation_euler = (math.pi / 2, 0, 0)          # level, looking along +y (towards the face)
        cam_data.lens = 50
    else:
        az, el = (math.radians(a) for a in view)
        d = Vector((math.sin(az) * math.cos(el), math.sin(el), math.cos(az) * math.cos(el)))   # World frame
        cam.location = centre + blender(d) * radius * 6
        look_at(cam, centre)
        cam_data.lens = 85
    cam_data.sensor_fit = 'HORIZONTAL'
    cam_data.sensor_width = 36
    for _ in range(6):
        cam_data.shift_x = cam_data.shift_y = 0.0
        bpy.context.view_layer.update()
        uv = [world_to_camera_view(scene, cam, p) for p in pts]
        u0, u1 = min(c.x for c in uv), max(c.x for c in uv)
        v0, v1 = min(c.y for c in uv), max(c.y for c in uv)
        ext = max(u1 - u0, v1 - v0)
        cam_data.lens *= 0.86 / ext
        bpy.context.view_layer.update()
        uv = [world_to_camera_view(scene, cam, p) for p in pts]
        u0, u1 = min(c.x for c in uv), max(c.x for c in uv)
        v0, v1 = min(c.y for c in uv), max(c.y for c in uv)
        cam_data.shift_x = (u0 + u1) / 2 - 0.5
        cam_data.shift_y = (v0 + v1) / 2 - 0.5
    bpy.context.view_layer.update()
    # lights round the camera: key above left, fill right, rim behind
    fwd = (centre - cam.location).normalized()
    right = fwd.cross(Vector((0, 0, 1))).normalized()
    up = right.cross(fwd).normalized()
    D = radius * 4.5
    add_light(scene, 'key', centre + (-right * 0.75 + up * 0.85 - fwd * 0.9).normalized() * D, centre, LIGHTS['key'] * D * D, radius * 3)
    add_light(scene, 'fill', centre + (right * 1.0 + up * 0.05 - fwd * 0.6).normalized() * D, centre, LIGHTS['fill'] * D * D, radius * 4)
    add_light(scene, 'rim', centre + (right * 0.35 + up * 0.9 + fwd * 1.0).normalized() * D, centre, LIGHTS['rim'] * D * D, radius * 2)
    return cam


PARTS = [
    # key, gloss, view (azimuth, elevation) or 'hat'
    ('pumpkin-lantern', 'Paper pumpkin lantern', (-8, 13)),
    ('jack-o-lantern', "Jack-o'-lantern", (-8, 15)),
    ('obake', 'Obake ghost', (-24, 12)),
    ('witch-hat', 'Witch hat', 'hat'),
    ('cat-ears', 'Cat ears', 'hat'),
    ('pumpkin-cap', 'Pumpkin stem', 'hat'),
    ('paper-bat', 'Paper bat', (-30, 10)),
    ('sweets', 'Wrapped sweets', (-28, 38)),
]


def render_part(key, view, work, preview, ctx):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    setup_render(scene, preview)
    builders = {
        'pumpkin-lantern': build_pumpkin_lantern,
        'jack-o-lantern': build_jack_o_lantern,
        'obake': build_obake,
        'witch-hat': build_witch_hat,
        'cat-ears': build_cat_ears,
        'pumpkin-cap': build_pumpkin_cap,
        'paper-bat': lambda: build_paper_bat(ctx['bat']),
        'sweets': lambda: build_sweets(ctx['sweets'], ctx['plan']),
    }
    objs, points = builders[key]()
    # a blush and the like are not shapes, and a cut face carries its own ink rim: Freestyle leaves them out (where a
    # face folds into a rib it would draw the fold)
    no_ink = bpy.data.collections.new('no ink')
    scene.collection.children.link(no_ink)
    for o in objs:
        if o.get('no_ink'):
            no_ink.objects.link(o)
            scene.collection.objects.unlink(o)
    ls = scene.view_layers[0].freestyle_settings.linesets[0]
    ls.select_by_collection = True
    ls.collection = no_ink
    ls.collection_negation = 'EXCLUSIVE'
    hat = points if view == 'hat' else None
    cam = frame_camera(scene, objs, view, hat)
    scene.render.filepath = str(work / f'{key}.png')
    bpy.ops.render.render(write_still=True)
    W = scene.render.resolution_x
    measured = {}
    for name, p in (points or {}).items():
        c = world_to_camera_view(scene, cam, blender(p))
        measured[name] = [round(c.x * W, 2), round((1 - c.y) * W, 2)]
    return {'render': str(work / f'{key}.png'), 'size': W, 'points': measured}


# ---- The cut -----------------------------------------------------------------------------------------------------------
def cut(path, points):
    """The rendered part as a sticker: a rounded white die-cut rim and a quiet contact shadow round the subject (as
    tools/camera_sticker_contours.py contour() does for the residents), trimmed, long side LONG. Returns the sticker
    and the measured points carried into it."""
    import numpy as np
    from PIL import Image, ImageFilter
    from scipy.ndimage import distance_transform_edt

    im = Image.open(path).convert('RGBA')
    alpha = np.array(im.getchannel('A'))
    ys, xs = np.nonzero(alpha > 8)
    x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
    long_side = max(x1 - x0, y1 - y0)
    scale = LONG / long_side                          # about: the rim and its shadow are added before the final size
    radius = float(LONG * 0.0045 / scale)             # the residents' rim (0.45 % of the long side), at this size
    pad = int(math.ceil(radius * 3 + 4))
    box = (x0 - pad, y0 - pad, x1 + pad, y1 + pad)
    canvas = Image.new('RGBA', (box[2] - box[0], box[3] - box[1]))
    canvas.paste(im, (-box[0], -box[1]))
    rgba = np.array(canvas)
    solid = rgba[:, :, 3] >= 128
    distance = distance_transform_edt(~solid)
    rim = np.clip(radius + .5 - distance, 0, 1)
    rim_alpha = Image.fromarray(np.uint8(rim * 255))
    paper = Image.new('RGBA', canvas.size, (255, 255, 255, 255))
    paper.putalpha(rim_alpha)
    shadow = Image.new('RGBA', canvas.size, (0, 0, 0, 255))
    shadow.putalpha(rim_alpha.filter(ImageFilter.GaussianBlur(max(1, radius * .35))).point(lambda v: round(v * .14)))
    out = Image.new('RGBA', canvas.size)
    out.alpha_composite(shadow)
    out.alpha_composite(paper)
    out.alpha_composite(canvas)
    bb = out.getchannel('A').getbbox()
    out = out.crop(bb)
    k = LONG / max(out.size)
    size = (max(1, round(out.width * k)), max(1, round(out.height * k)))
    final = out.resize(size, Image.Resampling.LANCZOS)
    moved = {}
    for name, (px, py) in points.items():
        fx = (px - box[0] - bb[0]) * size[0] / out.width
        fy = (py - box[1] - bb[1]) * size[1] / out.height
        moved[name] = (fx, fy)
    return final, moved


def webp(image, path, quality=92):
    from PIL import Image
    buf = io.BytesIO()
    image.save(buf, 'WEBP', quality=quality, alpha_quality=100, method=6, exact=True)
    data = buf.getvalue()
    with Image.open(io.BytesIO(data)) as check:
        check.load()
        assert check.size == image.size
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_bytes(data)
    tmp.replace(path)
    return data


def finish(work, renders):
    from PIL import Image
    out_dir = STICKERS / 'halloween'
    out_dir.mkdir(parents=True, exist_ok=True)
    entries, sheet = [], []
    for key, gloss, view in PARTS:
        info = renders[key]
        sticker, pts = cut(info['render'], info['points'])
        data = webp(sticker, out_dir / f'{key}.webp')
        thumb = sticker.copy()
        thumb.thumbnail((THUMB, THUMB), Image.Resampling.LANCZOS)
        webp(thumb, out_dir / f'{key}.thumb.webp')
        stamp = hashlib.sha1(data).hexdigest()[:8]
        entry = {'id': f'halloween/{key}', 'src': f'halloween/{key}.webp?v={stamp}', 'thumb': f'halloween/{key}.thumb.webp?v={stamp}',
                 'width': sticker.width, 'height': sticker.height, 'line': '', 'gloss': gloss}
        if view == 'hat':
            cx, cy = pts['crown']
            width = abs(pts['left'][0] - pts['right'][0])
            entry['hat'] = {'crown': [round(cx / sticker.width, 4), round(cy / sticker.height, 4)],
                            'width': round(width / sticker.width, 4)}
        entries.append(entry)
        sheet.append((key, sticker, pts if view == 'hat' else None))
    manifest = {'id': 'halloween', 'name': 'Halloween', 'tab': 'Season', 'who': '', 'kind': 'season',
                'source': SOURCE, 'stickers': entries}
    (STICKERS / 'halloween.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    contact_sheet(work, sheet)
    return manifest


def contact_sheet(work, sheet):
    """The stickers on a mid-tone ground, each with its 96 px size beside it, the hats' crown and head width marked."""
    from PIL import Image, ImageDraw
    cell = 300
    W, H = cell * 4, (cell + 110) * 2
    img = Image.new('RGBA', (W, H), (96, 118, 150, 255))
    d = ImageDraw.Draw(img)
    for n, (key, st, pts) in enumerate(sheet):
        cx, cy = (n % 4) * cell, (n // 4) * (cell + 110)
        big = st.copy()
        big.thumbnail((cell - 20, cell - 20), Image.Resampling.LANCZOS)
        k = big.width / st.width
        ox, oy = cx + (cell - big.width) // 2, cy + (cell - big.height) // 2
        img.alpha_composite(big, (ox, oy))
        if pts:
            px, py = pts['crown']
            d.ellipse((ox + px * k - 4, oy + py * k - 4, ox + px * k + 4, oy + py * k + 4), outline=(255, 40, 40, 255), width=2)
            ly = oy + pts['left'][1] * k
            d.line((ox + pts['right'][0] * k, ly, ox + pts['left'][0] * k, ly), fill=(255, 40, 40, 255), width=2)
        small = st.copy()
        small.thumbnail((96, 96), Image.Resampling.LANCZOS)
        img.alpha_composite(small, (cx + (cell - small.width) // 2, cy + cell + 4))
        d.text((cx + 8, cy + cell + 96), key, fill=(255, 255, 255, 255))
    img.save(work / 'contact-sheet.png')


def main():
    ap = argparse.ArgumentParser(description='Render and cut the Pocket Camera Halloween stickers.')
    ap.add_argument('--only', default='', help='comma-separated keys to render (default all)')
    ap.add_argument('--work', default=str(Path(tempfile.gettempdir()) / 'halloween-stickers'))
    ap.add_argument('--preview', action='store_true', help='small, quick renders (nothing written to the camera)')
    ap.add_argument('--finish-only', action='store_true', help='cut the stickers from the renders already in --work')
    a = ap.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:])
    work = Path(a.work)
    work.mkdir(parents=True, exist_ok=True)
    log = work / 'renders.json'
    renders = json.loads(log.read_text()) if log.is_file() else {}
    if not a.finish_only:
        keys = [k for k in a.only.split(',') if k] or [p[0] for p in PARTS]
        ctx = {}
        if 'sweets' in keys:
            ctx['sweets'] = load_builder('sweets')
            ctx['plan'] = ctx['sweets'].plan_from_report()       # the mound World's model was built with
        if 'paper-bat' in keys:
            ctx['bat'] = load_builder('paper-bat')
        for key, gloss, view in PARTS:
            if key in keys:
                renders[key] = render_part(key, view, work, a.preview, ctx)
                log.write_text(json.dumps(renders, indent=1) + '\n')
                print('rendered', key, renders[key]['points'])
    if a.preview:
        return
    missing = [p[0] for p in PARTS if p[0] not in renders]
    if missing:
        print('not cut: no render yet for', ', '.join(missing))
        return
    manifest = finish(work, renders)
    for e in manifest['stickers']:
        print(e['id'], e['width'], 'x', e['height'], e.get('hat', ''))


if __name__ == '__main__':
    main()
