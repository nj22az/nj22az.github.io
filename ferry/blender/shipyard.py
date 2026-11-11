"""
The yard's tools: what every part of the Chisum is made with in Blender.

A part is drawn in the ship's own axes (x to port, y up from the laden waterline, z forward from amidships, metres) and
handed to Blender, which is Z-up: Blender's X is her length (forward), Y her breadth (to port), Z her height.

Run inside Blender (bpy). The lines themselves (lines.py) need no Blender.
"""
import math
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
    'Screen picture': dict(metalness=0.0, roughness=0.3, shading='basic', textured=True, atlas=1, offset=[-2, -4]),
    'Panel face': dict(metalness=0.0, roughness=0.55, textured=True, atlas=1, offset=[-2, -4]),
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
        Part.made.append(self)
        # The name of the motion this part takes part in (the rudder's, a ram's): the viewer moves it as one piece.
        self.mover = mover

    def vert(self, p, n=None):
        self.v.append((float(p[0]), float(p[1]), float(p[2])))
        self.n.append(n)
        return len(self.v) - 1

    def face(self, idx, colour, uv=None):
        self.f.append(tuple(idx))
        self.c.append(colour)
        self.t.append(uv)

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
        """A round bar or cone from a to b, closed at its ends. Its faces look outward whichever way it runs."""
        rb = ra if rb is None else rb
        a, b = Vector(a), Vector(b)
        axis = (b - a).normalized()
        u = axis.orthogonal().normalized()
        w = axis.cross(u)
        ring = lambda c, r: [tuple(c + (u * math.cos(t) + w * math.sin(t)) * r) for t in
                             (2 * math.pi * k / sides for k in range(sides))]
        start = len(self.f)
        base = self.grid([ring(a, ra), ring(b, rb)], colour, close=True)
        self.orient(start, lambda c: (c - a) - axis * (c - a).dot(axis))
        for wanted, centre, first, away in ((caps[0] and ra > 0, a, base, -axis), (caps[1] and rb > 0, b, base + sides, axis)):
            if not wanted:
                continue
            start = len(self.f)
            c = self.vert(tuple(centre))
            for k in range(sides):
                self.face((c, first + k, first + (k + 1) % sides), colour)
            self.orient(start, tuple(away))

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
            n = Vector((0, 0, 0))
            for a, b in zip(pts, pts[1:] + pts[:1]):
                n += a.cross(b)
            if n.length_squared < 1e-18:
                continue
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
        for f, c, t in zip(other.f, other.c, other.t):
            self.face(tuple(base + i for i in f), c, t)

    def mirrored(self):
        """The same part on the other side of the centreline (x → -x), its faces turned to look out again."""
        out = Part(self.name, self.look, self.smooth, self.angle)
        out.v = [(-x, y, z) for x, y, z in self.v]
        out.n = [None if n is None else (-n[0], n[1], n[2]) for n in self.n]
        out.f = [tuple(reversed(f)) for f in self.f]
        out.c = list(self.c)
        out.t = [None if t is None else list(reversed(t)) for t in self.t]
        return out

    def build(self, coll):
        """Make the Blender object."""
        if not self.f:
            return None
        me = bpy.data.meshes.new(self.name)
        me.from_pydata([to_blender(p) for p in self.v], [], self.f)
        me.update()
        for poly in me.polygons:
            poly.use_smooth = self.smooth
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
        me.use_auto_smooth = True
        me.auto_smooth_angle = math.radians(self.angle)
        if self.smooth and any(n is not None for n in self.n):
            own = [to_blender(n) if n is not None else tuple(me.vertices[i].normal) for i, n in enumerate(self.n)]
            me.normals_split_custom_set_from_vertices(own)
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
