"""
The yard's tools: what every part of the Chisum is made with in Blender.

A part is drawn in the ship's own axes (x to port, y up from the laden waterline, z forward from amidships, metres) and
handed to Blender, which is Z-up: Blender's X is her length (forward), Y her breadth (to port), Z her height.

Run inside Blender (bpy). The lines themselves (lines.py) need no Blender.
"""
import math
from math import pi
import bpy
from mathutils import Vector
from mathutils.geometry import tessellate_polygon


def to_blender(p):
    """Ship (x port, y up, z forward) → Blender (X forward, Y port, Z up)."""
    return (p[2], p[0], p[1])


def srgb(hexv):
    return ((hexv >> 16) & 255) / 255, ((hexv >> 8) & 255) / 255, (hexv & 255) / 255


def tint(colour, k):
    """A colour made lighter or darker by the factor k, as one plate of the same paint differs from its neighbour."""
    return tuple(max(0.0, min(1.0, c * k)) for c in colour)


def plate_shade(a, b, spread=0.03):
    """A repeatable factor near 1 for plate (a, b): no two neighbouring plates take the light quite alike."""
    h = math.sin(a * 127.1 + b * 311.7) * 43758.5453
    return 1 + spread * (2 * (h - math.floor(h)) - 1)


# ---------- materials ----------
# How each is to be drawn by the viewer (the JMF1 material record). The colour itself travels on the vertices.
LOOKS = {
    # Gloss enamel over fair plating: the topsides, the sheer band, the bulwarks.
    'Topside paint': dict(metalness=0.05, roughness=0.42),
    # The bulwark is one plate standing above the deck: seen from both sides.
    'Topside plate': dict(metalness=0.05, roughness=0.42, side='double'),
    # Antifouling is flat and a little chalky.
    'Antifouling': dict(metalness=0.0, roughness=0.82),
    # Shop primer on the inside of the shell and on her structure. Plates are drawn as one surface, seen from both sides.
    # A plate stands square to the shell 12 mm behind it. Seen exactly edge-on its depth is not to be trusted, and it
    # shows through the plating as a hairline: so plates are drawn a hair further away, the more so the more edge-on.
    'Primer': dict(metalness=0.0, roughness=0.74),
    'Primer plate': dict(metalness=0.0, roughness=0.74, side='double', offset=[1, 1]),
    'Deck paint': dict(metalness=0.0, roughness=0.7),
    # Machinery in its enamel, and the floor plates that are walked on (one surface, seen from above and below).
    'Machinery paint': dict(metalness=0.1, roughness=0.5),
    'Floor plate': dict(metalness=0.05, roughness=0.62, side='double', offset=[1, 1]),
    'Bronze': dict(metalness=0.9, roughness=0.28),
    'Shaft steel': dict(metalness=0.85, roughness=0.34),
    'Zinc': dict(metalness=0.6, roughness=0.5),
    # Lamp glasses, searchlight and compass domes: smooth, pale, not see-through (the viewer's day has no lamps lit).
    'Lens': dict(metalness=0.0, roughness=0.12),
    # Marks painted on the plating: drawn a hair in front of it.
    'Marking': dict(metalness=0.0, roughness=0.5, offset=[-2, -4]),
    # The wheelhouse: satin enamel on the consoles, varnished wood, leather, the dark glass of a display, window glass.
    'Console paint': dict(metalness=0.05, roughness=0.5),
    'Varnished wood': dict(metalness=0.0, roughness=0.38),
    'Upholstery': dict(metalness=0.0, roughness=0.9),
    'Screen': dict(metalness=0.2, roughness=0.1),
    'Window glass': dict(metalness=0.2, roughness=0.15, side='double', transparent=True, opacity=0.38, depthWrite=False),
    # Pictures from her own sheet (atlas.py). A screen shines by itself and is drawn without light; the face of a panel, a
    # dial or a chart takes the light like the thing it is printed on. Both lie on a surface and are drawn a hair in front of it.
    'Screen picture': dict(metalness=0.0, roughness=0.3, shading='basic', textured=True, atlas=0, offset=[-2, -4]),
    'Panel face': dict(metalness=0.0, roughness=0.55, textured=True, atlas=0, offset=[-2, -4]),
    # Linings, deck coverings and deckhead panels: matt.
    'Lining': dict(metalness=0.0, roughness=0.8),
    # The other ship's walls and casings are drawn in this: what of hers stands in line with them takes the light the same way.
    'Bulkhead paint': dict(metalness=0.05, roughness=0.58),
    'Deck covering': dict(metalness=0.0, roughness=0.85),
    'Plastic': dict(metalness=0.0, roughness=0.45),
    # The owner's drinks machine (vending.py), in the finishes its own file gives it: stoved enamel, chrome, printed cans;
    # glass and plastics one sees through as they are (`clear`: the page draws window glass dark, as from outside by day,
    # and these as clear as they say); and what shines by itself, which glows in its own colour by day too.
    'Vending enamel': dict(metalness=0.0, roughness=0.34),
    'Chrome': dict(metalness=1.0, roughness=0.1),
    'Drinks can': dict(metalness=0.5, roughness=0.28),
    'Clear glass': dict(metalness=0.0, roughness=0.04, transparent=True, opacity=0.14, depthWrite=False, clear=True),
    'Clear plastic': dict(metalness=0.0, roughness=0.08, transparent=True, opacity=0.42, depthWrite=False, clear=True),
    'Smoked plastic': dict(metalness=0.0, roughness=0.1, transparent=True, opacity=0.72, depthWrite=False, clear=True),
    'Lit panel': dict(metalness=0.0, roughness=0.5, emissive='#fff4e2', emissiveIntensity=0.6),
    'Lit blue': dict(metalness=0.0, roughness=0.4, emissive='#1450ff', emissiveIntensity=0.9),
    'Lit red': dict(metalness=0.0, roughness=0.4, emissive='#ff2412', emissiveIntensity=0.9),
    'Lit green': dict(metalness=0.0, roughness=0.4, emissive='#3cf058', emissiveIntensity=0.7),
    # The wheelhouse as refitted (12 November 2026; yard/design/wheelhouse-refit.md): a real bridge's materials, each its own.
    # Gloss marine enamel on the consoles; matt black instrument fields and desk tops; hammer-finish and black anodised
    # equipment cases; laminate linings and deckhead strips; a sheet vinyl deck, a little glossy; rubber (mats, window
    # gaskets, cords); brushed stainless (rails, screws); light varnished wood (mullions, sills); leather and woven cloth;
    # the glass over a dial; coffee; and lamps that are lit (a lit lamp is a lamp to the light that is traced through her).
    'Marine enamel': dict(metalness=0.04, roughness=0.34),
    'Matt black': dict(metalness=0.0, roughness=0.8),
    'Hammer finish': dict(metalness=0.3, roughness=0.46),
    'Black anodised': dict(metalness=0.55, roughness=0.42),
    'Laminate': dict(metalness=0.0, roughness=0.4),
    'Deckhead strip': dict(metalness=0.0, roughness=0.55),
    'Vinyl deck': dict(metalness=0.0, roughness=0.3),
    'Rubber': dict(metalness=0.0, roughness=0.93),
    'Stainless': dict(metalness=0.95, roughness=0.27),
    'Light wood': dict(metalness=0.0, roughness=0.3),
    'Leather': dict(metalness=0.0, roughness=0.5),
    'Cloth': dict(metalness=0.0, roughness=0.96),
    'Dial glass': dict(metalness=0.0, roughness=0.03, transparent=True, opacity=0.1, depthWrite=False, clear=True),
    'Blind film': dict(metalness=0.0, roughness=0.3, side='double', transparent=True, opacity=0.9, depthWrite=False, clear=True),
    'Coffee': dict(metalness=0.0, roughness=0.06),
    'Lit lamp': dict(metalness=0.0, roughness=0.4, emissive='#fff1dc', emissiveIntensity=2.4),
    'Lit amber': dict(metalness=0.0, roughness=0.4, emissive='#ffb020', emissiveIntensity=0.9),
    'Lit white': dict(metalness=0.0, roughness=0.4, emissive='#f4f6ff', emissiveIntensity=0.8),
    # a red night light: so dim that it spoils no night vision (and, being out by day, must not redden the deckhead in the traced light)
    'Lit night red': dict(metalness=0.0, roughness=0.4, emissive='#ff2412', emissiveIntensity=0.15),
}
# What each look's surface is: the page gives each kind its own grain, sheen and unevenness (ferry/look.js), so that paint,
# deck coating, wood, metal, leather and laminate are told apart by more than their colour (JSY-STD-404, rule 11).
SURFACES = {
    'Topside paint': 'paint', 'Topside plate': 'paint', 'Bulkhead paint': 'paint', 'Machinery paint': 'paint', 'Console paint': 'paint',
    'Vending enamel': 'paint', 'Antifouling': 'matt', 'Primer': 'primer', 'Primer plate': 'primer', 'Deck paint': 'deck', 'Floor plate': 'deck',
    'Bronze': 'metal', 'Shaft steel': 'metal', 'Zinc': 'metal', 'Chrome': 'metal', 'Drinks can': 'metal', 'Varnished wood': 'wood',
    'Upholstery': 'leather', 'Lining': 'laminate', 'Deck covering': 'vinyl', 'Plastic': 'plastic',
    'Marine enamel': 'paint', 'Matt black': 'matt', 'Hammer finish': 'hammer', 'Black anodised': 'metal', 'Laminate': 'laminate',
    'Deckhead strip': 'laminate', 'Vinyl deck': 'vinyl', 'Rubber': 'rubber', 'Stainless': 'metal', 'Light wood': 'wood', 'Leather': 'leather',
    'Cloth': 'cloth',
}
_materials = {}


def material(name):
    if name in _materials:
        return _materials[name]
    look = LOOKS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']
    attr = nt.nodes.new('ShaderNodeVertexColor')
    attr.layer_name = 'Col'
    nt.links.new(attr.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Metallic'].default_value = look['metalness']
    bsdf.inputs['Roughness'].default_value = look['roughness']
    m.use_backface_culling = look.get('side') != 'double'
    m['jmf'] = {'metalness': look['metalness'], 'roughness': look['roughness'], 'side': look.get('side', 'front'),
                'offset': look.get('offset') or []}
    if name in SURFACES:
        m['jmf']['surface'] = SURFACES[name]
    for key in ('transparent', 'opacity', 'depthWrite', 'shading', 'textured', 'atlas', 'emissive', 'emissiveIntensity', 'clear'):
        if key in look:
            m['jmf'][key] = look[key]
    _materials[name] = m
    return m


def collection(name, parent=None):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(c)
    return c


def round_rect(x0, y0, x1, y1, r, z, n=4):
    """A rectangle with rounded corners, upright in the plane z (ship's axes): its points, counter-clockwise seen from forward."""
    pts = []
    for cx, cy, a0 in ((x1 - r, y1 - r, 0), (x0 + r, y1 - r, 90), (x0 + r, y0 + r, 180), (x1 - r, y0 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), z))
    return pts


# ---------- her pictures ----------
_tiles = None


def tile(name):
    """Where a picture lies on her sheet (u0, v0, u1, v1), from atlas.json (written by atlas.py)."""
    global _tiles
    if _tiles is None:
        import json, os
        _tiles = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'atlas.json')))['tiles']
    return _tiles[name]


# ---------- runs ----------
# The centre line of every pipe, cable, conduit and wire that a builder lays as a run (a line of points): the part it is drawn
# in, its radius and its points in the ship's axes. Written with the part file; spans.py checks that each is carried along
# its whole length (the owner, 11 November 2026: "too much floating objects ... why aren't you working according to Spec?").
RUNS = []


def round_sides(r):
    """How many sides a round thing of this radius is drawn with (JSY-STD-404: round is round, at arm's length)."""
    return 14 if r < 0.004 else 20 if r < 0.012 else 28 if r < 0.035 else 40 if r < 0.10 else 56 if r < 0.30 else 72


# ---------- components ----------
# What is drawn between `with component(tag):` and its end belongs to that component of the register (ferry/systems/):
# the box round it is written with the part file, and the page finds the component under a tap by it.
COMPONENTS = {}


class component:
    def __init__(self, tag):
        self.tag = tag

    def __enter__(self):
        self.before = {id(p): len(p.v) for p in Part.made}
        return self

    def __exit__(self, *exc):
        lo, hi = None, None
        where = {}
        for p in Part.made:
            new = p.v[self.before.get(id(p), 0):]
            if not new:
                continue
            g = getattr(p, 'group', 'hull')
            where[g] = where.get(g, 0) + len(new)
            xs, ys, zs = zip(*new)
            a, b = (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))
            lo = a if lo is None else tuple(map(min, lo, a))
            hi = b if hi is None else tuple(map(max, hi, b))
        if lo is not None:
            if self.tag in COMPONENTS:
                lo = tuple(map(min, lo, COMPONENTS[self.tag][0]))
                hi = tuple(map(max, hi, COMPONENTS[self.tag][1]))
            # the viewer's part most of it was drawn in: its box lifts with that part when she is taken apart
            COMPONENTS[self.tag] = (lo, hi, max(where, key=where.get))
        return False


# ---------- a part ----------
class Part:
    """
    Vertices, faces and a colour for each face, in the ship's axes. `smooth` parts are shaded round; a vertex may carry
    its own normal (the shell knows its normals from the lines); others are rounded by Blender up to `angle` degrees.
    """

    made = []          # every part made in this build, for `component`

    def __init__(self, name, look, smooth=False, angle=35.0, mover=None):
        self.name, self.look, self.smooth, self.angle = name, look, smooth, angle
        self.v, self.n, self.f, self.c = [], [], [], []
        # Where each corner of a face lies on her sheet of pictures, for the faces that carry one (else None).
        self.t = []
        # Whether each face is lit smooth (True), flat (False) or as the part is (None). A round bar's side is always smooth
        # and a chamfer always blends, whatever the part they are drawn in (JSY-STD-404).
        self.s = []
        Part.made.append(self)
        # The name of the motion this part takes part in (the rudder's, a ram's): the viewer moves it as one piece.
        self.mover = mover

    def vert(self, p, n=None):
        self.v.append((float(p[0]), float(p[1]), float(p[2])))
        self.n.append(n)
        return len(self.v) - 1

    def face(self, idx, colour, uv=None, smooth=None):
        self.f.append(tuple(idx))
        self.c.append(colour)
        self.t.append(uv)
        self.s.append(smooth)

    def picture(self, corners, name, colour=(1.0, 1.0, 1.0), turns=0):
        """
        A picture from her sheet on a flat four-cornered face. The corners are given as the picture is looked at: bottom left,
        bottom right, top right, top left (so the face looks at whoever reads it). `turns` turns the picture by quarter turns.
        """
        u0, v0, u1, v1 = tile(name)['uv']
        uv = [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]
        uv = uv[-turns % 4:] + uv[:-turns % 4]
        self.face([self.vert(p) for p in corners], colour, uv)

    def quad(self, a, b, c, d, colour):
        self.face((a, b, c, d), colour)

    def grid(self, rows, colour, flip=False, close=False, normals=None):
        """
        A sheet from rows of points (each row the same length). `colour` is one colour or a function of (row, column).
        The face looks toward rows × columns; `flip` turns it over.
        """
        base = len(self.v)
        m = len(rows[0])
        for i, row in enumerate(rows):
            for j, p in enumerate(row):
                self.vert(p, normals[i][j] if normals else None)
        for i in range(len(rows) - 1):
            for j in range(m - 1 if not close else m):
                a, b = base + i * m + j, base + i * m + (j + 1) % m
                d, c = base + (i + 1) * m + j, base + (i + 1) * m + (j + 1) % m
                col = colour(i, j) if callable(colour) else colour
                self.face((a, d, c, b) if flip else (a, b, c, d), col)
        return base

    def polygon(self, outline, colour, holes=(), flip=False):
        """A flat plate from its outline (and holes), any shape: cut into triangles by Blender."""
        loops = [list(outline)] + [list(h) for h in holes]
        base = len(self.v)
        for loop in loops:
            for p in loop:
                self.vert(p)
        for a, b, c in tessellate_polygon([[Vector(p) for p in loop] for loop in loops]):
            self.face((base + a, base + c, base + b) if flip else (base + a, base + b, base + c), colour)

    def tube(self, a, b, ra, rb=None, colour=(1, 1, 1), sides=16, caps=(True, True)):
        """A round bar or cone from a to b, closed at its ends. Its faces look outward whichever way it runs. It is drawn
        round: with as many sides as its size asks (`round_sides`), its side lit smooth, its ends flat and sharp."""
        rb = ra if rb is None else rb
        sides = max(sides, round_sides(max(ra, rb)))
        a, b = Vector(a), Vector(b)
        length = (b - a).length
        axis = (b - a).normalized()
        u = axis.orthogonal().normalized()
        w = axis.cross(u)
        lean = (ra - rb) / length if length > 1e-9 else 0.0                      # a cone's side leans toward its small end
        out = [u * math.cos(t) + w * math.sin(t) for t in (2 * math.pi * k / sides for k in range(sides))]
        normals = [tuple((d + axis * lean).normalized()) for d in out]
        ia = [self.vert(tuple(a + d * ra), n) for d, n in zip(out, normals)]
        ib = [self.vert(tuple(b + d * rb), n) for d, n in zip(out, normals)]
        start = len(self.f)
        for k in range(sides):
            j = (k + 1) % sides
            self.face((ia[k], ia[j], ib[j], ib[k]), colour, smooth=True)
        self.orient(start, lambda c: (c - a) - axis * (c - a).dot(axis))
        for wanted, centre, r, away in ((caps[0] and ra > 0, a, ra, -axis), (caps[1] and rb > 0, b, rb, axis)):
            if not wanted:
                continue
            start = len(self.f)
            c = self.vert(tuple(centre))
            ring = [self.vert(tuple(centre + d * r)) for d in out]
            for k in range(sides):
                self.face((c, ring[k], ring[(k + 1) % sides]), colour, smooth=False)
            self.orient(start, tuple(away))

    def ball(self, centre, r, colour, squash=1.0):
        """A ball (or, squashed along the upward axis, a button's dome), lit smooth."""
        n = max(12, round_sides(r))
        m = max(6, n // 2)
        c = Vector(centre)
        rows = []
        for i in range(m + 1):
            lat = math.pi * i / m - math.pi / 2
            row = []
            for k in range(n):
                d = Vector((math.cos(lat) * math.cos(2 * math.pi * k / n), math.sin(lat) * squash, math.cos(lat) * math.sin(2 * math.pi * k / n)))
                nn = Vector((d.x, d.y / max(squash, 1e-6) ** 2, d.z)).normalized()
                row.append(self.vert(tuple(c + d * r), tuple(nn)))
            rows.append(row)
        start = len(self.f)
        for i in range(m):
            for k in range(n):
                j = (k + 1) % n
                self.face((rows[i][k], rows[i][j], rows[i + 1][j], rows[i + 1][k]), colour, smooth=True)
        self.orient(start, lambda q: q - c)

    def ring(self, centre, axis, big, small, colour, n=None, m=None, sweep=(0.0, 2 * math.pi)):
        """A ring of round section about `axis` (a lifebuoy, a handwheel's rim, a grommet), or a part of one between two
        angles; lit smooth."""
        n = n or max(24, round_sides(big))
        m = m or max(10, round_sides(small))
        c, ax = Vector(centre), Vector(axis).normalized()
        a1 = ax.orthogonal().normalized()
        a2 = ax.cross(a1)
        whole = abs(sweep[1] - sweep[0]) >= 2 * math.pi - 1e-9
        steps = n if whole else max(2, int(round(n * abs(sweep[1] - sweep[0]) / (2 * math.pi))))
        rows = []
        for i in range(steps + (0 if whole else 1)):
            t = sweep[0] + (sweep[1] - sweep[0]) * i / steps
            out = a1 * math.cos(t) + a2 * math.sin(t)
            mid = c + out * big
            rows.append([self.vert(tuple(mid + (out * math.cos(q) + ax * math.sin(q)) * small), tuple(out * math.cos(q) + ax * math.sin(q)))
                         for q in (2 * math.pi * k / m for k in range(m))])
        start = len(self.f)
        for i in range(steps if whole else steps):
            ra, rb = rows[i], rows[(i + 1) % len(rows)]
            for k in range(m):
                j = (k + 1) % m
                self.face((ra[k], ra[j], rb[j], rb[k]), colour, smooth=True)

        def away(q):
            v = Vector(q) - c
            v -= ax * v.dot(ax)
            v.normalize()
            return Vector(q) - (c + v * big)
        self.orient(start, away)
        if not whole:
            for row, t in ((rows[0], sweep[0]), (rows[-1], sweep[1])):
                out = a1 * math.cos(t) + a2 * math.sin(t)
                mid = c + out * big
                start = len(self.f)
                cc = self.vert(tuple(mid))
                ends = [self.vert(self.v[i]) for i in row]
                for k in range(m):
                    self.face((cc, ends[k], ends[(k + 1) % m]), colour, smooth=False)
                self.orient(start, tuple(ax.cross(out) * (-1 if row is rows[0] else 1) * (1 if sweep[1] > sweep[0] else -1)))

    def rod(self, points, r, colour, ends=(True, True)):
        """A round bar, a rope, a hose or a cable along a line of points: round lengths with a ball at each bend."""
        pts = [Vector(q) for q in points]
        for k, (a, b) in enumerate(zip(pts, pts[1:])):
            if (b - a).length > 1e-6:
                self.tube(tuple(a), tuple(b), r, None, colour=colour, caps=(k == 0 and ends[0], k == len(pts) - 2 and ends[1]))
        for q in pts[1:-1]:
            self.ball(tuple(q), r, colour)

    def block(self, lo, hi, colour, r=0.003):
        """A made thing's box: its twelve edges chamfered by r and lit as rounded, its six faces flat (each corner of a
        face carries that face's own direction, so the light runs smoothly round an edge and not across a face). The
        chamfer is never more than a quarter of the box's least measure; a plate thinner than 4 mm is a plain box."""
        x0, y0, z0 = (min(a, b) for a, b in zip(lo, hi))
        x1, y1, z1 = (max(a, b) for a, b in zip(lo, hi))
        r = min(r, (x1 - x0) / 4, (y1 - y0) / 4, (z1 - z0) / 4)
        if r < 0.001:
            return self.box((x0, y0, z0), (x1, y1, z1), colour)
        lo3, hi3 = (x0, y0, z0), (x1, y1, z1)
        corner = {}                                              # (axis, side, sign of the two other axes) → vertex
        for ax in range(3):
            b, c = (ax + 1) % 3, (ax + 2) % 3
            for side in (0, 1):
                n = [0.0, 0.0, 0.0]
                n[ax] = 1.0 if side else -1.0
                for sb in (0, 1):
                    for sc in (0, 1):
                        q = [0.0, 0.0, 0.0]
                        q[ax] = hi3[ax] if side else lo3[ax]
                        q[b] = (hi3[b] - r) if sb else (lo3[b] + r)
                        q[c] = (hi3[c] - r) if sc else (lo3[c] + r)
                        corner[(ax, side, sb, sc)] = self.vert(tuple(q), tuple(n))
        mid = Vector(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
        start = len(self.f)
        for ax in range(3):
            for side in (0, 1):                                  # the six faces
                self.face((corner[(ax, side, 0, 0)], corner[(ax, side, 1, 0)], corner[(ax, side, 1, 1)], corner[(ax, side, 0, 1)]), colour, smooth=True)
        key = lambda ax, side, sgn: corner[(ax, side, sgn[(ax + 1) % 3], sgn[(ax + 2) % 3])]
        for ax in range(3):                                      # the twelve edges: each runs along ax, between the faces of the two other axes
            b, c = (ax + 1) % 3, (ax + 2) % 3
            for sb in (0, 1):
                for sc in (0, 1):
                    quad = []
                    for along in (0, 1):
                        sgn = [0, 0, 0]
                        sgn[ax], sgn[b], sgn[c] = along, sb, sc
                        quad.append((key(b, sb, sgn), key(c, sc, sgn)))
                    self.face((quad[0][0], quad[0][1], quad[1][1], quad[1][0]), colour, smooth=True)
        for sx in (0, 1):                                        # the eight corners
            for sy in (0, 1):
                for sz in (0, 1):
                    sgn = (sx, sy, sz)
                    self.face((key(0, sx, sgn), key(1, sy, sgn), key(2, sz, sgn)), colour, smooth=True)
        self.orient(start, lambda q: q - mid)

    def pillow(self, lo, hi, r, colour, segs=5):
        """A box rounded all round by r: a cushion, a pad, a moulded case, a button's cap. Its flats are flat and its
        rounds are lit smooth: every corner carries the direction of the ball it lies on. r is never more than half the
        box's least measure."""
        x0, y0, z0 = (min(a, b) for a, b in zip(lo, hi))
        x1, y1, z1 = (max(a, b) for a, b in zip(lo, hi))
        r = min(r, (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2)
        if r < 0.0008:
            return self.box((x0, y0, z0), (x1, y1, z1), colour)
        c = Vector(((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
        hx, hy, hz = (x1 - x0) / 2 - r, (y1 - y0) / 2 - r, (z1 - z0) / 2 - r
        # a ball cut into eight and moved apart: rows of latitude in each half, columns of longitude in each quarter
        lats = [(-pi / 2 + (pi / 2) * i / segs, -1) for i in range(segs + 1)] + [((pi / 2) * i / segs, 1) for i in range(segs + 1)]
        lons = []
        for q, (sx, sz) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
            lons += [(q * pi / 2 + (pi / 2) * k / segs, sx, sz) for k in range(segs + 1)]
        rows = []
        for lat, sy in lats:
            row = []
            for lon, sx, sz in lons:
                n = Vector((math.cos(lat) * math.cos(lon), math.sin(lat), math.cos(lat) * math.sin(lon)))
                row.append(self.vert(tuple(c + Vector((sx * hx, sy * hy, sz * hz)) + n * r), tuple(n)))
            rows.append(row)
        start = len(self.f)
        m = len(lons)
        for i in range(len(rows) - 1):
            for k in range(m):
                j = (k + 1) % m
                quad = (rows[i][k], rows[i][j], rows[i + 1][j], rows[i + 1][k])
                if len({self.v[q] for q in quad}) >= 3:
                    self.face(quad, colour, smooth=True)
        for row, n in ((rows[0], (0.0, -1.0, 0.0)), (rows[-1], (0.0, 1.0, 0.0))):       # the two flats the poles opened into
            corners = [row[0], row[segs + 1], row[2 * (segs + 1)], row[3 * (segs + 1)]]
            self.face(tuple(self.vert(self.v[q], n) for q in corners), colour, smooth=True)
        self.orient(start, lambda q: q - c)

    def lathe(self, origin, axis, profile, colour, crease=40.0):
        """A turned body: `profile` is a list of (distance along the axis, radius) from one end to the other. Round its axis
        it is lit smooth; along the profile it is smooth where two lengths meet at less than `crease` degrees and sharp
        where they meet at more (a knob's shoulder, a flange's edge). A radius of 0 closes an end."""
        ax = Vector(axis).normalized()
        e1 = ax.orthogonal().normalized()
        e2 = ax.cross(e1)
        o = Vector(origin)
        n = round_sides(max(r for _, r in profile))
        ring = [e1 * math.cos(2 * pi * k / n) + e2 * math.sin(2 * pi * k / n) for k in range(n)]
        profile = list(profile)
        # A turned body is a closed solid: a profile that does not come back to where it began, or end on the axis at both
        # ends, is closed from its last place to its first (the inside of a ring, the underside of a dome on a plate).
        open_ends = abs(profile[0][0] - profile[-1][0]) + abs(profile[0][1] - profile[-1][1]) > 1e-9
        if open_ends and (profile[0][1] > 1e-9 or profile[-1][1] > 1e-9):
            profile.append(profile[0])
        segs = [(a, b) for a, b in zip(profile, profile[1:]) if abs(a[0] - b[0]) + abs(a[1] - b[1]) > 1e-9]
        # each length's own direction in the (along, out) plane, turned to look away from the axis
        nrm = []
        for (xa, ra), (xb, rb) in segs:
            dx, dr = xb - xa, rb - ra
            ln = math.hypot(dx, dr)
            nrm.append((-dr / ln, dx / ln))
        # the outside is to the left of the way the profile runs when it goes round its section clockwise (along the axis
        # at its greatest radius); a profile given the other way round is turned
        area = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(profile, profile[1:] + profile[:1]))
        if area > 0:
            nrm = [(-nx, -nr) for nx, nr in nrm]

        def blend(i, j):
            a, b = nrm[i], nrm[j]
            if a[0] * b[0] + a[1] * b[1] < math.cos(math.radians(crease)):
                return None
            sx, sr = a[0] + b[0], a[1] + b[1]
            ln = math.hypot(sx, sr) or 1.0
            return (sx / ln, sr / ln)
        start = len(self.f)
        for i, ((xa, ra), (xb, rb)) in enumerate(segs):
            na = (blend(i - 1, i) if i > 0 else None) or nrm[i]
            nb = (blend(i, i + 1) if i + 1 < len(segs) else None) or nrm[i]
            rows = []
            for (x, r, nn) in ((xa, ra, na), (xb, rb, nb)):
                rows.append([self.vert(tuple(o + ax * x + d * r), tuple((ax * nn[0] + d * nn[1]).normalized())) for d in ring])
            for k in range(n):
                j = (k + 1) % n
                if ra < 1e-9:
                    self.face((rows[0][k], rows[1][j], rows[1][k]), colour, smooth=True)
                elif rb < 1e-9:
                    self.face((rows[0][k], rows[0][j], rows[1][k]), colour, smooth=True)
                else:
                    self.face((rows[0][k], rows[0][j], rows[1][j], rows[1][k]), colour, smooth=True)
        self.orient(start, None)

    def box(self, lo, hi, colour):
        x0, y0, z0 = lo
        x1, y1, z1 = hi
        p = [self.vert(q) for q in ((x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
                                    (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1))]
        for f in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)):
            self.face(tuple(p[i] for i in f), colour)

    def orient(self, start, direction):
        """
        Turn the faces made since `start` (a count of faces) so each looks the way `direction` says: a vector, or a
        function of the face's middle. With `direction` None, the faces follow their vertices' own normals.
        """
        for k in range(start, len(self.f)):
            f = self.f[k]
            pts = [Vector(self.v[i]) for i in f]
            # The way the face looks by its winding, worked out about its own first corner and in whole precision: a face a
            # millimetre across (a screw's head, a chamfer's corner) 20 m from the ship's middle is lost in the rounding of
            # single-precision vectors taken about the origin, and was turned at random.
            o = self.v[f[0]]
            nx = ny = nz = 0.0
            for i, j in zip(f[1:], f[2:]):
                a, b = self.v[i], self.v[j]
                ax, ay, az, bx, by, bz = a[0] - o[0], a[1] - o[1], a[2] - o[2], b[0] - o[0], b[1] - o[1], b[2] - o[2]
                nx, ny, nz = nx + ay * bz - az * by, ny + az * bx - ax * bz, nz + ax * by - ay * bx
            n = Vector((nx, ny, nz))
            if nx * nx + ny * ny + nz * nz < 1e-24:
                continue
            n.normalize()
            if direction is None:
                want = Vector((0, 0, 0))
                for i in f:
                    if self.n[i] is not None:
                        want += Vector(self.n[i])
            elif callable(direction):
                want = Vector(direction(sum(pts, Vector((0, 0, 0))) / len(pts)))
            else:
                want = Vector(direction)
            if n.dot(want) < 0:
                self.f[k] = tuple(reversed(f))
                if self.t[k] is not None:
                    self.t[k] = list(reversed(self.t[k]))

    def add(self, other):
        """Another part's geometry, taken into this part."""
        base = len(self.v)
        for p, n in zip(other.v, other.n):
            self.vert(p, n)
        for f, c, t, sm in zip(other.f, other.c, other.t, other.s):
            self.face(tuple(base + i for i in f), c, t, sm)

    def mirrored(self):
        """The same part on the other side of the centreline (x → -x), its faces turned to look out again."""
        out = Part(self.name, self.look, self.smooth, self.angle)
        out.v = [(-x, y, z) for x, y, z in self.v]
        out.n = [None if n is None else (-n[0], n[1], n[2]) for n in self.n]
        out.f = [tuple(reversed(f)) for f in self.f]
        out.c = list(self.c)
        out.t = [None if t is None else list(reversed(t)) for t in self.t]
        out.s = list(self.s)
        return out

    def build(self, coll):
        """Make the Blender object."""
        if not self.f:
            return None
        me = bpy.data.meshes.new(self.name)
        me.from_pydata([to_blender(p) for p in self.v], [], self.f)
        me.update()
        flags = self.s + [None] * (len(self.f) - len(self.s))
        for poly, sm in zip(me.polygons, flags):
            poly.use_smooth = self.smooth if sm is None else sm
        col = me.color_attributes.new('Col', 'BYTE_COLOR', 'CORNER')
        flat = []
        for poly, c in zip(me.polygons, self.c):
            for _ in range(poly.loop_total):
                flat.extend((c[0], c[1], c[2], 1.0))
        col.data.foreach_set('color_srgb', flat)
        if any(t is not None for t in self.t):
            layer = me.uv_layers.new(name='UV')
            flat = []
            for poly, t in zip(me.polygons, self.t):
                for k in range(poly.loop_total):
                    flat.extend(t[k] if t is not None else (0.0, 0.0))
            layer.data.foreach_set('uv', flat)
        # an edge is sharp where its faces meet at more than the part's angle (Blender 4.1 and later mark it on the edge;
        # 4.0 kept it as the mesh's auto smooth)
        if hasattr(me, 'set_sharp_from_angle'):
            me.set_sharp_from_angle(angle=math.radians(self.angle))
        else:
            me.use_auto_smooth = True
            me.auto_smooth_angle = math.radians(self.angle)
        if any(n is not None for n in self.n):
            # a corner with a direction of its own keeps it; every other corner is left to the angle between its faces
            own = [(0.0, 0.0, 0.0)] * len(me.loops)
            for poly in me.polygons:
                if not poly.use_smooth:
                    continue
                for li in poly.loop_indices:
                    n = self.n[me.loops[li].vertex_index]
                    if n is not None:
                        own[li] = to_blender(n)
            me.normals_split_custom_set(own)
        me.materials.append(material(self.look))
        ob = bpy.data.objects.new(self.name, me)
        if self.mover:
            ob['mover'] = self.mover
        coll.objects.link(ob)
        return ob


# ---------- lettering ----------
_font_cache = {}


def lettering(text, height, resolution=3):
    """
    The outline of a line of lettering as flat triangles: a list of (u, v) points and triangles, u along the line from
    0, v up from the foot of the letters, in metres. `height` is the height of a capital.
    """
    key = (text, round(height, 4), resolution)
    if key in _font_cache:
        return _font_cache[key]
    cu = bpy.data.curves.new('lettering', 'FONT')
    cu.body = text
    cu.resolution_u = resolution
    cu.fill_mode = 'FRONT'
    ob = bpy.data.objects.new('lettering', cu)
    bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    me = ob.evaluated_get(dg).to_mesh()
    me.calc_loop_triangles()
    pts = [(v.co.x, v.co.y) for v in me.vertices]
    tris = [tuple(t.vertices) for t in me.loop_triangles]
    ob.evaluated_get(dg).to_mesh_clear()
    bpy.data.objects.remove(ob)
    bpy.data.curves.remove(cu)
    # A capital's height is measured from this line's own letters (they stand on the line, v = 0).
    top = max(p[1] for p in pts)
    left = min(p[0] for p in pts)
    k = height / top if top > 0 else 1.0
    out = ([((p[0] - left) * k, p[1] * k) for p in pts], tris, (max(p[0] for p in pts) - left) * k)
    _font_cache[key] = out
    return out
