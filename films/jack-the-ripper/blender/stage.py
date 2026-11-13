"""The music hall: one stage set, built from nothing, that every shot of the film is photographed on.

    blender -b -P stage.py -- --assets <dir with the Meshy .glb files> --out stage.blend

Measures are metres. The audience looks along +Y; the stage floor is z = 0, x from -9 to 9, y from 0 to 11.
The exterior (the corner pub under the moon, the clock tower and the dome behind) stands on the same axis far behind the camera side, at y = -60,
so that it never shares a frame with the stage. Nothing here is animated: film.py poses everything by time.

No two faces share a plane: every layer that lies on another is lifted or set back by a stated gap.
"""
import bpy, bmesh, math, sys, os, random
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
ASSETS = arg('--assets'); OUT = arg('--out')
rnd = random.Random(1888)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
D = bpy.data


def coll(name):
    c = D.collections.new(name); scene.collection.children.link(c); return c
SET, EXT, FX, LIGHTS = coll('set'), coll('exterior'), coll('fx'), coll('lights')


def link(ob, c):
    for u in list(ob.users_collection): u.objects.unlink(ob)
    c.objects.link(ob); return ob


# ---------------------------------------------------------------- materials
def mat(name):
    m = D.materials.new(name); m.use_nodes = True
    n = m.node_tree.nodes; n.remove(n['Principled BSDF'])
    return m, m.node_tree.nodes, m.node_tree.links


def principled(name, color, rough=0.6, metal=0.0, emit=None, emit_s=0.0, sheen=0.0):
    m = D.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if sheen: b.inputs['Sheen Weight'].default_value = sheen
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1)
        b.inputs['Emission Strength'].default_value = emit_s
    return m


def cobbles():
    """Wet cobblestones: Voronoi cells give each stone its own tone and a rounded bump; low roughness so
    the lamps and the moon lie in the street."""
    m = D.materials.new('cobbles'); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (3.2, 4.4, 1)
    vor = nt.nodes.new('ShaderNodeTexVoronoi'); vor.feature = 'F1'; vor.inputs['Scale'].default_value = 1.0
    vor.inputs['Randomness'].default_value = 0.75
    edge = nt.nodes.new('ShaderNodeTexVoronoi'); edge.feature = 'DISTANCE_TO_EDGE'
    edge.inputs['Randomness'].default_value = 0.75
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (0, 0, 0, 1)
    ramp.color_ramp.elements[1].position = 0.12; ramp.color_ramp.elements[1].color = (1, 1, 1, 1)
    col = nt.nodes.new('ShaderNodeValToRGB')
    col.color_ramp.elements[0].color = (0.035, 0.04, 0.06, 1); col.color_ramp.elements[1].color = (0.11, 0.105, 0.12, 1)
    mul = nt.nodes.new('ShaderNodeMixRGB'); mul.blend_type = 'MULTIPLY'; mul.inputs['Fac'].default_value = 0.85
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.9; bump.inputs['Distance'].default_value = 0.04
    rr = nt.nodes.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = 0.55; rr.inputs['To Max'].default_value = 0.16
    L = nt.links.new
    L(tc.outputs['Object'], mp.inputs['Vector'])
    L(mp.outputs['Vector'], vor.inputs['Vector']); L(mp.outputs['Vector'], edge.inputs['Vector'])
    L(vor.outputs['Color'], col.inputs['Fac']); L(edge.outputs['Distance'], ramp.inputs['Fac'])
    L(col.outputs['Color'], mul.inputs['Color1']); L(ramp.outputs['Color'], mul.inputs['Color2'])
    L(mul.outputs['Color'], b.inputs['Base Color'])
    L(ramp.outputs['Color'], bump.inputs['Height']); L(bump.outputs['Normal'], b.inputs['Normal'])
    L(ramp.outputs['Color'], rr.inputs['Value']); L(rr.outputs['Result'], b.inputs['Roughness'])
    return m


def velvet(name, color):
    m = principled(name, color, rough=0.85, sheen=1.0)
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Sheen Roughness'].default_value = 0.35
    b.inputs['Sheen Tint'].default_value = (1.0, 0.35, 0.3, 1)
    return m


def emission(name, color, strength):
    m, n, l = mat(name)
    e = n.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    l.new(e.outputs[0], n['Material Output'].inputs['Surface']); return m


def sky_mat():
    """The painted night: deep blue at the top, a sick green-gold glow over the roofs, stars."""
    m, n, l = mat('sky')
    tc = n.new('ShaderNodeTexCoord'); sep = n.new('ShaderNodeSeparateXYZ')
    ramp = n.new('ShaderNodeValToRGB'); e = ramp.color_ramp.elements
    e[0].position = 0.05; e[0].color = (0.16, 0.09, 0.07, 1)
    e[1].position = 0.9; e[1].color = (0.004, 0.008, 0.035, 1)
    mid = ramp.color_ramp.elements.new(0.38); mid.color = (0.02, 0.035, 0.09, 1)
    star = n.new('ShaderNodeTexVoronoi'); star.inputs['Scale'].default_value = 90
    sr = n.new('ShaderNodeValToRGB'); sr.color_ramp.elements[0].position = 0.0; sr.color_ramp.elements[0].color = (1, 1, 1, 1)
    sr.color_ramp.elements[1].position = 0.035; sr.color_ramp.elements[1].color = (0, 0, 0, 1)
    hi = n.new('ShaderNodeMath'); hi.operation = 'MULTIPLY'
    add = n.new('ShaderNodeMixRGB'); add.blend_type = 'ADD'; add.inputs['Fac'].default_value = 1
    em = n.new('ShaderNodeEmission'); em.inputs['Strength'].default_value = 1.0
    l.new(tc.outputs['UV'], sep.inputs[0]); l.new(sep.outputs['Y'], ramp.inputs['Fac'])
    l.new(tc.outputs['UV'], star.inputs['Vector']); l.new(star.outputs['Distance'], sr.inputs['Fac'])
    l.new(sr.outputs['Color'], hi.inputs[0]); l.new(sep.outputs['Y'], hi.inputs[1])
    l.new(ramp.outputs['Color'], add.inputs['Color1']); l.new(hi.outputs[0], add.inputs['Color2'])
    l.new(add.outputs[0], em.inputs['Color']); l.new(em.outputs[0], n['Material Output'].inputs['Surface'])
    return m


def soft_card(name, color, strength, radial=True, noise=0.0):
    """An unlit translucent card: a glow, a beam of light or a bank of fog. Never casts a shadow."""
    m, n, l = mat(name)
    tc = n.new('ShaderNodeTexCoord')
    if radial:
        g = n.new('ShaderNodeTexGradient'); g.gradient_type = 'SPHERICAL'
        mp = n.new('ShaderNodeMapping'); mp.inputs['Location'].default_value = (-1, -1, 0); mp.inputs['Scale'].default_value = (2, 2, 1)
        l.new(tc.outputs['UV'], mp.inputs[0]); l.new(mp.outputs[0], g.inputs[0]); fac = g.outputs['Fac']
        p = n.new('ShaderNodeMath'); p.operation = 'POWER'; p.inputs[1].default_value = 1.6
        l.new(fac, p.inputs[0]); fac = p.outputs[0]
    else:
        # a beam: bright along its axis (u = 0.5) and near its source (v = 1), gone at the edges and the floor
        sep = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['UV'], sep.inputs[0])
        a = n.new('ShaderNodeMath'); a.operation = 'SUBTRACT'; a.inputs[1].default_value = 0.5; l.new(sep.outputs['X'], a.inputs[0])
        ab = n.new('ShaderNodeMath'); ab.operation = 'ABSOLUTE'; l.new(a.outputs[0], ab.inputs[0])
        inv = n.new('ShaderNodeMapRange'); inv.inputs['From Min'].default_value = 0.0; inv.inputs['From Max'].default_value = 0.5
        inv.inputs['To Min'].default_value = 1.0; inv.inputs['To Max'].default_value = 0.0; l.new(ab.outputs[0], inv.inputs['Value'])
        sq = n.new('ShaderNodeMath'); sq.operation = 'POWER'; sq.inputs[1].default_value = 2.0; l.new(inv.outputs[0], sq.inputs[0])
        v = n.new('ShaderNodeMapRange'); v.inputs['To Min'].default_value = 0.25; v.inputs['To Max'].default_value = 1.0; l.new(sep.outputs['Y'], v.inputs['Value'])
        mu = n.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; l.new(sq.outputs[0], mu.inputs[0]); l.new(v.outputs[0], mu.inputs[1])
        fac = mu.outputs[0]
    if noise:
        nz = n.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = noise; nz.inputs['Detail'].default_value = 5
        nz.name = 'drift'
        mp2 = n.new('ShaderNodeMapping'); mp2.name = 'driftmap'
        l.new(tc.outputs['Object'], mp2.inputs[0]); l.new(mp2.outputs[0], nz.inputs['Vector'])
        cr = n.new('ShaderNodeMapRange'); cr.inputs['From Min'].default_value = 0.35; cr.inputs['From Max'].default_value = 0.75
        l.new(nz.outputs['Fac'], cr.inputs['Value'])
        mu2 = n.new('ShaderNodeMath'); mu2.operation = 'MULTIPLY'; l.new(fac, mu2.inputs[0]); l.new(cr.outputs[0], mu2.inputs[1]); fac = mu2.outputs[0]
    st = n.new('ShaderNodeMath'); st.operation = 'MULTIPLY'; st.name = 'level'; st.inputs[1].default_value = 1.0
    l.new(fac, st.inputs[0])
    em = n.new('ShaderNodeEmission'); em.name = 'glow'; em.inputs['Color'].default_value = (*color, 1); em.inputs['Strength'].default_value = strength
    tr = n.new('ShaderNodeBsdfTransparent'); mix = n.new('ShaderNodeMixShader')
    l.new(st.outputs[0], mix.inputs['Fac']); l.new(tr.outputs[0], mix.inputs[1]); l.new(em.outputs[0], mix.inputs[2])
    l.new(mix.outputs[0], n['Material Output'].inputs['Surface'])
    m.blend_method = 'BLEND'
    return m


def sight(n, l):
    """How far the line of sight passes from the middle of the object, in the object's own measure (1 is the rim of
    a ball built 1 in radius, or the middle of a side of a card built 2 across). Light measured this way is round
    from wherever it is seen: a card measured across its own face is an oval to any camera not square in front of it."""
    tc = n.new('ShaderNodeTexCoord'); geo = n.new('ShaderNodeNewGeometry')
    vt = n.new('ShaderNodeVectorTransform'); vt.vector_type = 'VECTOR'; vt.convert_from = 'WORLD'; vt.convert_to = 'OBJECT'
    nr = n.new('ShaderNodeVectorMath'); nr.operation = 'NORMALIZE'
    cr = n.new('ShaderNodeVectorMath'); cr.operation = 'CROSS_PRODUCT'; ln = n.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
    l.new(geo.outputs['Incoming'], vt.inputs[0]); l.new(vt.outputs[0], nr.inputs[0])
    l.new(tc.outputs['Object'], cr.inputs[0]); l.new(nr.outputs[0], cr.inputs[1]); l.new(cr.outputs[0], ln.inputs[0])
    return ln.outputs['Value'], geo


def glow(name, color, strength, power=3.0, ball=False, core=0.0, core_r=0.2):
    """Light hanging in the haze round a flame or round the moon. It only ever ADDS its light to what is behind
    it (a clear film that also shines), so it cannot paint over a lantern, a post or the moon's own disc, and the
    haze of the plate, which is laid by distance, goes straight through it. It is brightest at its middle and
    thins to nothing well inside its own border, with no level stretch and no step that could read as a rim.
    The fourth cut's review found every glow a flat disc with an edge, and the moon a ring with a dark middle:
    those were soft_card, which covers what is behind it at its centre.

    It fades with how far the line of sight passes from its middle (sight()), on a ball (a lamp) or on a card (the
    moon's halo, which must lie flat against the sky). Of a ball only the side towards the lens shines, or the
    light would be counted twice. `core` is a second, small light on top of the haze's, `core_r` of the way out:
    the flame itself, behind the lantern's glass."""
    m, n, l = mat(name)
    u, geo = sight(n, l)
    # 1 at the middle, 0 at `reach` of the way out. A ball is drawn with flat faces, and its last tenth is theirs; a
    # card seen from below or from the side is short in that direction, and three tenths cover any camera of the film
    reach = 0.9 if ball else 0.7
    fall = n.new('ShaderNodeMapRange'); fall.inputs['From Max'].default_value = reach; fall.inputs['To Min'].default_value = 1.0; fall.inputs['To Max'].default_value = 0.0
    p = n.new('ShaderNodeMath'); p.operation = 'POWER'; p.inputs[1].default_value = power
    l.new(u, fall.inputs['Value']); l.new(fall.outputs['Result'], p.inputs[0]); fac = p.outputs[0]
    if core:
        cf = n.new('ShaderNodeMapRange'); cf.interpolation_type = 'SMOOTHSTEP'; cf.inputs['From Max'].default_value = core_r
        cf.inputs['To Min'].default_value = core / strength; cf.inputs['To Max'].default_value = 0.0
        both_ = n.new('ShaderNodeMath'); both_.operation = 'ADD'
        l.new(u, cf.inputs['Value']); l.new(fac, both_.inputs[0]); l.new(cf.outputs['Result'], both_.inputs[1]); fac = both_.outputs[0]
    if ball:
        front = n.new('ShaderNodeMath'); front.operation = 'SUBTRACT'; front.inputs[0].default_value = 1.0
        side = n.new('ShaderNodeMath'); side.operation = 'MULTIPLY'
        l.new(geo.outputs['Backfacing'], front.inputs[1]); l.new(fac, side.inputs[0]); l.new(front.outputs[0], side.inputs[1]); fac = side.outputs[0]
    st = n.new('ShaderNodeMath'); st.operation = 'MULTIPLY'; st.name = 'level'; st.inputs[1].default_value = 1.0     # film.py turns a lamp down here
    l.new(fac, st.inputs[0])
    amt = n.new('ShaderNodeMath'); amt.operation = 'MULTIPLY'; amt.inputs[1].default_value = strength; l.new(st.outputs[0], amt.inputs[0])
    em = n.new('ShaderNodeEmission'); em.name = 'glow'; em.inputs['Color'].default_value = (*color, 1); l.new(amt.outputs[0], em.inputs['Strength'])
    tr = n.new('ShaderNodeBsdfTransparent'); add = n.new('ShaderNodeAddShader')
    l.new(tr.outputs[0], add.inputs[0]); l.new(em.outputs[0], add.inputs[1]); l.new(add.outputs[0], n['Material Output'].inputs['Surface'])
    m.blend_method = 'BLEND'
    return m


MOON_LIGHT, MOON_LIMB = 6.0, 0.55     # the disc's light at its middle, and the part of it left at the limb
HALO_POWER = 1.6                      # how fast the moon's halo thins: the same for the stage's moon and the street's
def moon_mat():
    """The moon's own disc: brightest at its middle, a little dimmer towards its limb, and its edge soft over a
    twentieth of its width, so that it sits in the haze and is not a cut-out. It is drawn by the line of sight
    (sight()), so it is a round moon from under it as from in front of it. Its halo is a glow() in front of it."""
    m, n, l = mat('moon-disc')
    r, _ = sight(n, l)
    edge = n.new('ShaderNodeMapRange'); edge.interpolation_type = 'SMOOTHSTEP'    # the disc reaches 0.42 of the way out, as it always did
    edge.inputs['From Min'].default_value = 0.40; edge.inputs['From Max'].default_value = 0.44; edge.inputs['To Min'].default_value = 1.0; edge.inputs['To Max'].default_value = 0.0
    sq = n.new('ShaderNodeMath'); sq.operation = 'POWER'; sq.inputs[1].default_value = 2.0
    limb = n.new('ShaderNodeMapRange'); limb.inputs['From Max'].default_value = 0.42 ** 2          # from the middle to the limb, by the square
    limb.inputs['To Min'].default_value = MOON_LIGHT; limb.inputs['To Max'].default_value = MOON_LIGHT * MOON_LIMB
    l.new(r, edge.inputs['Value']); l.new(r, sq.inputs[0]); l.new(sq.outputs[0], limb.inputs['Value'])
    em = n.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (1.0, 0.93, 0.74, 1); l.new(limb.outputs['Result'], em.inputs['Strength'])
    tr = n.new('ShaderNodeBsdfTransparent'); mix = n.new('ShaderNodeMixShader')
    l.new(edge.outputs['Result'], mix.inputs['Fac']); l.new(tr.outputs[0], mix.inputs[1]); l.new(em.outputs[0], mix.inputs[2])
    l.new(mix.outputs[0], n['Material Output'].inputs['Surface'])
    m.blend_method = 'BLEND'
    return m


# ---------------------------------------------------------------- mesh helpers
def box(name, size, loc, material, c=SET):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.object; ob.name = name; ob.scale = size
    bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(material); return link(ob, c)


def plane(name, w, h, loc, rot, material, c=SET):
    """A card w wide, h high, with UV 0..1; before rotation it lies in XY."""
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc, rotation=rot)
    ob = bpy.context.object; ob.name = name; ob.scale = (w, h, 1)
    bpy.ops.object.transform_apply(scale=True)
    ob.data.materials.append(material); return link(ob, c)


def card(name, size, loc, material, c=SET):
    """A square card `size` across, standing up to face the house, with its own middle as its origin and 1 as the
    measure from there to the middle of a side: what sight() needs, and what lets film.py hang it elsewhere."""
    bpy.ops.mesh.primitive_plane_add(size=2, location=loc, rotation=(math.radians(90), 0, 0))
    ob = bpy.context.object; ob.name = name; ob.scale = (size / 2,) * 3
    ob.data.materials.append(material); return link(ob, c)


def no_shadow(ob):
    ob.visible_shadow = False; ob.visible_diffuse = False; ob.visible_glossy = False
    return ob


def drape(name, width, height, folds, depth, material, c=SET, origin_x=0.0, swag=0.0):
    """A hanging curtain: a sheet whose folds deepen towards the hem. Its origin is the top edge at
    x = origin_x of its own width, so that scaling it in X gathers it towards that side."""
    nx, nz = folds * 8, 14
    bm = bmesh.new(); rows = []
    for j in range(nz + 1):
        v = j / nz; row = []
        for i in range(nx + 1):
            u = i / nx
            amp = depth * (0.35 + 0.65 * v)
            y = amp * math.sin(u * folds * 2 * math.pi) + 0.25 * amp * math.sin(u * folds * 4.7 * math.pi + 1.3)
            z = -v * height - swag * math.sin(u * math.pi) * v
            row.append(bm.verts.new(((u - origin_x) * width, y, z)))
        rows.append(row)
    for j in range(nz):
        for i in range(nx):
            bm.faces.new((rows[j][i], rows[j + 1][i], rows[j + 1][i + 1], rows[j][i + 1]))
    me = D.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    ob = D.objects.new(name, me); c.objects.link(ob); me.materials.append(material)
    return ob


def load_glb(name, height=None, c=SET, faces=120000, weld=False):
    """Bring in one Meshy model as a single object standing on z = 0, `height` tall, thinned to about
    `faces` triangles: the sculpts come with over half a million, which no shot here can show.

    `weld` joins the model's faces to each other before it is thinned. Meshy's files give every patch of the
    texture its own corners, so the surface is closed to the eye but not joined, and thinning it unjoined tears it
    open along every such seam: the dome came out with 61 665 open edges and the night showed through it as white
    slivers and a hole (the fourth cut's review, a04_moon). Welded first, it thins to a closed skin: no open edge.
    Only the skyline's pieces are welded: the houses, the pub and the lamps stay exactly as the cast was
    photographed among them."""
    before = set(D.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS, name + '.glb'))
    new = [o for o in D.objects if o not in before]
    meshes = [o for o in new if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes: o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.object
    bpy.ops.object.parent_clear(type='CLEAR_KEEP_TRANSFORM')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for o in new:
        if o != ob and o.name in D.objects: D.objects.remove(o)
    bb = [Vector(v) for v in ob.bound_box]
    zmin = min(v.z for v in bb); zmax = max(v.z for v in bb)
    cx = (min(v.x for v in bb) + max(v.x for v in bb)) / 2; cy = (min(v.y for v in bb) + max(v.y for v in bb)) / 2
    s = (height / (zmax - zmin)) if height else 1.0
    for v in ob.data.vertices:
        v.co = Vector(((v.co.x - cx) * s, (v.co.y - cy) * s, (v.co.z - zmin) * s))
    ob.name = name
    if weld:
        bm = bmesh.new(); bm.from_mesh(ob.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bm.to_mesh(ob.data); bm.free()
    if len(ob.data.polygons) > faces:
        md = ob.modifiers.new('thin', 'DECIMATE'); md.ratio = faces / len(ob.data.polygons)
        bpy.context.view_layer.objects.active = ob; bpy.ops.object.modifier_apply(modifier='thin')
    for p in ob.data.polygons: p.use_smooth = True
    return link(ob, c)


def instance(src, name, loc, rot_z=0.0, scale=(1, 1, 1), lean=0.0, c=SET):
    ob = D.objects.new(name, src.data); c.objects.link(ob)
    ob.location = loc; ob.rotation_euler = (0, lean, rot_z); ob.scale = scale
    return ob


# ================================================================= the stage
M_COB = cobbles()
M_WOOD = principled('boards', (0.09, 0.045, 0.025), rough=0.5)
M_GOLD = principled('gilt', (0.83, 0.55, 0.17), rough=0.32, metal=1.0)
M_RED = velvet('velvet', (0.42, 0.012, 0.02))
M_DARKRED = velvet('velvet-dark', (0.16, 0.006, 0.012))
M_BLACK = principled('masking', (0.004, 0.004, 0.006), rough=0.95)
M_SKY = sky_mat()

# the street the show is played on; one slab, its top at z = 0
box('street', (30, 15.5, 0.4), (0, 6.25, -0.2), M_COB)
# the apron in front of the curtain line: boards, 12 mm proud of nothing: it is its own slab, in front of the street
box('apron', (26, 3.0, 0.4), (0, -3.0, -0.2), M_WOOD)

# the painted night behind everything, and black masking at the sides
sky = plane('sky', 48, 22, (0, 14.2, 9.5), (math.radians(90), 0, 0), M_SKY)
box('mask-L', (0.3, 16, 20), (-14.8, 6.5, 9), M_BLACK); box('mask-R', (0.3, 16, 20), (14.8, 6.5, 9), M_BLACK)
box('mask-top', (30, 16, 0.3), (0, 6.5, 13.5), M_BLACK)

# the moon: a disc of light 0.15 m in front of the sky, and its halo in the haze 0.05 m in front of that. The halo
# only adds light, so the disc shines through it and the moon is brightest at its middle (it used to cover the
# middle of the disc with its own dim blue: the "doughnut" of the fourth cut's review)
# (the halo's card is 16 m for a halo that reaches 5.6 m: see glow())
moon = card('moon', 3.4, (3.6, 14.05, 9.6), moon_mat(), FX)
halo = card('moon-halo', 16, (3.6, 14.0, 9.6), glow('moon-halo', (0.55, 0.7, 1.0), 1.6, power=HALO_POWER), FX)
no_shadow(moon); no_shadow(halo)

# the proscenium: gilt frame with an opening 16 m wide and 8.6 m high, 0.6 m deep, standing at y = -1.2 .. -0.6
PW, PH = 16.0, 8.6
box('pros-L', (2.2, 0.6, PH + 2.6), (-(PW / 2 + 1.1), -0.9, (PH + 2.6) / 2), M_GOLD)
box('pros-R', (2.2, 0.6, PH + 2.6), ((PW / 2 + 1.1), -0.9, (PH + 2.6) / 2), M_GOLD)
box('pros-top', (PW + 4.4, 0.6, 2.6), (0, -0.9, PH + 1.3), M_GOLD)
# a row of bulbs round the opening, each a small sphere of light standing 0.06 m off the gilt
bulb_mat = emission('bulb', (1.0, 0.72, 0.32), 14.0)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.085, segments=10, ring_count=6)
bulb0 = bpy.context.object; bulb0.name = 'bulb'; bulb0.data.materials.append(bulb_mat); link(bulb0, FX)
bulb0.location = (0, -200, 0)
k = 0
for i in range(33):
    x = -PW / 2 + i * PW / 32
    b = instance(bulb0, f'bulb-top-{i}', (x, -1.29, PH + 0.28), c=FX); b['chase'] = k; k += 1
for side in (-1, 1):
    for i in range(18):
        b = instance(bulb0, f'bulb-{"L" if side < 0 else "R"}-{i}', (side * (PW / 2 + 0.28), -1.29, 0.4 + i * (PH - 0.3) / 17), c=FX); b['chase'] = k; k += 1

# the valance: a short fixed drape across the top of the opening, behind the frame
val = drape('valance', PW + 1.0, 1.7, 14, 0.16, M_DARKRED, origin_x=0.5, swag=0.0)
val.location = (0, -0.42, PH + 0.25)
# the house curtain: two halves that part. Scale X = 1 is closed (each covers half the opening and 0.4 m more)
for side, nm in ((-1, 'curtain-L'), (1, 'curtain-R')):
    c_ = drape(nm, PW / 2 + 0.45, PH + 0.4, 9, 0.22, M_RED, origin_x=0.0)
    c_.location = (side * (PW / 2 + 0.35), -0.15, PH + 0.3)
    c_.rotation_euler = (0, 0, math.pi if side > 0 else 0)
    if side > 0: c_.location.y = -0.10       # the halves overlap at the middle and are 0.05 m apart in depth
# tormentors: narrow fixed drapes that hide the wings
for side in (-1, 1):
    t = drape(f'leg-{side}', 2.4, PH + 1.0, 4, 0.2, M_DARKRED, origin_x=0.5)
    t.location = (side * 9.6, 1.6, PH + 0.9)

# footlights: a brass trough along the front of the stage with shell reflectors
box('trough', (PW - 1.0, 0.28, 0.16), (0, -1.75, 0.08), M_GOLD)
for i in range(15):
    instance(bulb0, f'foot-{i}', (-(PW - 2.2) / 2 + i * (PW - 2.2) / 14, -1.62, 0.2), c=FX)

# ---------------------------------------------------------------- Whitechapel
house = load_glb('house', 9.0); house.location = (0, -200, 0)
lamp = load_glb('lamp', 3.6); lamp.location = (0, -200, 0)
# a crooked terrace along the back of the street, each house its own size and lean; then two nearer ones
# at the sides to make an alley mouth at the centre, under the moon
# The street must be clear to walk: the collision check of film.py (--pass qc) found the cast inside these houses
# when the terrace stood 1.4 m nearer and the pub and the side house stood in the lanes. Nothing of the set now
# stands nearer than y = 9.3 in the middle of the stage or inside x = -9.5 .. 9.5 below y = 6.
row = [(-11.0, 11.6, 1.05, 0.10, 0.03), (-6.3, 12.0, 0.92, -0.06, -0.04), (-1.6, 12.3, 0.80, 3.20, 0.02),
       (3.2, 12.1, 0.88, 0.12, 0.05), (7.8, 11.8, 1.0, 3.05, -0.03), (12.0, 11.5, 1.1, -0.1, 0.04)]
for i, (x, y, s, rz, lean) in enumerate(row):
    instance(house, f'house-back-{i}', (x, y, 0), rz, (s, s, s * rnd.uniform(0.95, 1.12)), lean)
pub = load_glb('pub', 9.5); pub.location = (0, -200, 0)
clock = load_glb('clocktower', 14.0, faces=60000, weld=True); clock.location = (0, -200, 0)
dome = load_glb('dome', 7.0, faces=60000, weld=True); dome.location = (0, -200, 0)
PUB_TURN = math.radians(-40)
instance(pub, 'pub-L', (-15.0, 9.0, 0), PUB_TURN, (1.0, 1.0, 1.0))
# the skyline, between the terrace and the painted night: the clock tower and the cathedral's dome on its drum
instance(clock, 'skyline-clock', (-3.9, 13.3, 0), 0.0, (1.1, 1.1, 1.1))
instance(dome, 'skyline-dome', (7.2, 13.4, 5.6), 0.0, (1.1, 1.1, 1.1))


def drum(name, at, scale, c=SET):
    """The drum the dome stands on. The model is a dome on a ring of columns with nothing inside the ring and nothing
    under it, and it hangs above the roofs: from below, the night showed between and under the columns as a torn
    pale hole in the middle of the building (the fourth cut's review, a04_moon). The drum is plain dark stone, 2.2
    of the model's measures in radius: 0.25 inside the columns' inner faces (2.45 at the nearest), so no face of it
    lies in a face of theirs. It stands from the ground to 3.0 measures up the model: the columns end at 1.45 and
    the dome's skin above them is nowhere nearer its middle than 2.5 before 3.7, so the drum's top is shut inside
    the dome, and a line of sight that climbs between the columns from below meets the drum and not the night."""
    r, top = 2.2 * scale, at[2] + 3.0 * scale
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=top, location=(at[0], at[1], top / 2))
    ob = bpy.context.object; ob.name = name; ob.data.materials.append(M_DRUM)
    for p in ob.data.polygons: p.use_smooth = len(p.vertices) == 4
    return link(ob, c)
M_DRUM = principled('drum', (0.045, 0.045, 0.05), rough=0.9)
drum('skyline-dome-drum', (7.2, 13.4, 5.6), 1.1)


def sign(name, text, loc, rot_z, c=SET, width=3.0, post=True):
    """A hanging pub sign lettered here, in English, on an iron post: board, gilt letters 6 mm proud of it.
    Without the post it is the same board to be fixed flat to a wall."""
    post_m = principled(name + '-iron', (0.01, 0.01, 0.012), rough=0.5, metal=1.0)
    board_m = principled(name + '-board', (0.02, 0.09, 0.05), rough=0.45)
    root = D.objects.new(name, None); c.objects.link(root); root.location = loc; root.rotation_euler.z = rot_z
    def part(ob): ob.parent = root; return ob
    if post:
        part(box(name + '-post', (0.12, 0.12, 4.4), (0, 0, 2.2), post_m, c))
        part(box(name + '-arm', (width + 0.5, 0.08, 0.08), (width / 2 + 0.1, 0, 4.2), post_m, c))
    part(box(name + '-board', (width, 0.08, 1.15), (width / 2 + 0.25, 0, 3.5), board_m, c))
    part(box(name + '-frame-t', (width + 0.1, 0.12, 0.07), (width / 2 + 0.25, 0, 4.09), M_GOLD, c))
    part(box(name + '-frame-b', (width + 0.1, 0.12, 0.07), (width / 2 + 0.25, 0, 2.91), M_GOLD, c))
    for k, (line_, size, z) in enumerate(text):
        cu = D.curves.new(f'{name}-text-{k}', 'FONT'); cu.body = line_; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
        cu.size = size; cu.extrude = 0.004
        cu.font = D.fonts.load('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf', check_existing=True)
        t = D.objects.new(f'{name}-text-{k}', cu); c.objects.link(t); cu.materials.append(M_GOLD)
        t.parent = root; t.location = (width / 2 + 0.25, -0.046, z); t.rotation_euler = (math.radians(90), 0, 0)
    return root
SIGN = [('THE', 0.24, 3.84), ('BLACK LANTERN', 0.30, 3.50), ('ALES  &  STOUT', 0.17, 3.14)]
sign('sign', SIGN, (-9.9, 7.4, 0), math.radians(8))
instance(house, 'house-R', (14.2, 8.4, 0), -0.6 + math.pi, (1.1, 1.1, 1.25), -0.05)

# A gas lamp's glow in the fog: a ball of added light round the flame (glow()). The flame burns behind the lantern's
# glass, which on this model is from 2.42 to 2.87 m up (measured on the mesh; above it are the hood, with a small
# finial at each corner, and the cap), so the glow's middle is at 2.65 m and the glass is the brightest thing in it.
# The fourth cut had a flat card here, 0.35 m in front of the lamp and centred on the hood at 3.0 m: it covered the
# lantern, one of the hood's corner finials stood through it as a black speck, and a camera to the side saw an oval.
FLAME_Z, GLOW_R, GLOW_LIGHT, GLOW_POWER = 2.65, 1.7, 0.55, 3.5
FLAME, FLAME_R = 0.5, 0.3                                 # the flame's own light, and how far from its middle it reaches (m)
def gas_glow(name, radius): return glow(name, (1.0, 0.6, 0.22), GLOW_LIGHT, GLOW_POWER, ball=True, core=FLAME, core_r=FLAME_R / radius)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=24, ring_count=12)
ball0 = bpy.context.object; ball0.name = 'glow-ball'; link(ball0, FX); ball0.location = (0, -200, 0); no_shadow(ball0)
ball0.data.materials.append(gas_glow('glow-ball', GLOW_R * 1.3))                  # the street lamps outside the pub share this one


def lamp_glow(name, loc, radius, c, material=None):
    """One lamp's glow; with its own material where film.py turns that lamp up and down by itself."""
    g = instance(ball0, name, loc, scale=(radius,) * 3, c=c); no_shadow(g)
    if material: g.data = ball0.data.copy(); g.data.materials[0] = material
    return g


LAMPS = [(-5.2, 6.4), (5.6, 7.2), (-1.4, 9.2)]            # the cast's lanes in film.py are laid to pass each by 0.6 m or more
for i, (x, y) in enumerate(LAMPS):
    instance(lamp, f'lamp-{i}', (x, y, 0), rnd.uniform(0, 3))
    L = D.lights.new(f'gas-{i}', 'POINT'); L.energy = 520; L.color = (1.0, 0.62, 0.25); L.shadow_soft_size = 0.18
    lo = D.objects.new(f'gas-{i}', L); LIGHTS.objects.link(lo); lo.location = (x, y - 0.02, 3.02)
    lamp_glow(f'gas-glow-{i}', (x, y, FLAME_Z), GLOW_R, FX, gas_glow(f'gas-glow-{i}', GLOW_R))

# ---------------------------------------------------------------- fog and beams (cards; no volumes)
for i, (y, z, s, lv) in enumerate([(9.4, 1.5, 0.050, 0.55), (7.4, 1.2, 0.07, 0.42), (5.0, 0.9, 0.09, 0.34), (2.6, 0.7, 0.12, 0.26), (0.8, 0.55, 0.15, 0.2)]):
    f = plane(f'fog-{i}', 34, 4.2 + i * 0.3, (0, y, z), (math.radians(90), 0, 0), soft_card(f'fog-{i}', (0.42, 0.55, 0.72), 0.5, radial=False, noise=0.22 + s), FX)
    f.data.materials[0].node_tree.nodes['level'].inputs[1].default_value = lv
    f['fog'] = lv
    # a fog bank is densest at the ground: flip V so that the "source" of the beam shader is the bottom
    for uv in f.data.uv_layers[0].data: uv.uv.y = 1 - uv.uv.y
    no_shadow(f)

# three follow-spot beams: a tall card each, pivoting at its top; film.py aims them and sets their level
for i in range(3):
    bm_ = plane(f'beam-{i}', 3.4, 13.0, (0, 0, -6.5), (math.radians(90), 0, 0), soft_card(f'beam-{i}', (1.0, 0.92, 0.75), 2.4, radial=False), FX)
    bpy.context.view_layer.objects.active = bm_
    # move the origin to the top of the card
    for v in bm_.data.vertices: v.co.z += 0.0
    piv = D.objects.new(f'beam-pivot-{i}', None); FX.objects.link(piv); piv.location = (-5 + 5 * i, 2.0, 12.5)
    bm_.parent = piv; no_shadow(bm_)
    bm_.data.materials[0].node_tree.nodes['level'].inputs[1].default_value = 0.0

# petals: 140 small red cards; film.py lets them fall
pm = principled('petal', (0.55, 0.01, 0.02), rough=0.5, emit=(0.5, 0.0, 0.01), emit_s=0.6)
bpy.ops.mesh.primitive_plane_add(size=0.13); p0 = bpy.context.object; p0.name = 'petal'; p0.data.materials.append(pm); link(p0, FX)
p0.location = (0, -200, 0)
for i in range(140):
    instance(p0, f'petal-{i:03d}', (0, -210, 0), c=FX)

# ---------------------------------------------------------------- lights
def light(name, kind, energy, color, loc, rot=(0, 0, 0), size=1.0, spot=None, blend=0.3):
    L = D.lights.new(name, kind); L.energy = energy; L.color = color
    if kind == 'AREA': L.size = size
    if kind == 'SPOT': L.spot_size = spot; L.spot_blend = blend; L.shadow_soft_size = 0.12
    if kind == 'SUN': L.angle = math.radians(3)
    ob = D.objects.new(name, L); LIGHTS.objects.link(ob); ob.location = loc; ob.rotation_euler = rot
    return ob

light('moonlight', 'SUN', 1.6, (0.45, 0.6, 1.0), (4, 11, 12), (math.radians(-62), 0, math.radians(18)))   # from behind: a blue rim
light('footlight', 'AREA', 900, (1.0, 0.72, 0.42), (0, -2.2, 0.5), (math.radians(68), 0, 0), size=13)
light('wash', 'AREA', 0, (1.0, 0.05, 0.04), (0, 3.5, 11.5), (0, 0, 0), size=14)                              # the red of the chorus
light('front', 'AREA', 0, (1.0, 0.9, 0.8), (0, -9, 7.5), (math.radians(58), 0, 0), size=9)
for i in range(3):
    s = light(f'spot-{i}', 'SPOT', 0, (1.0, 0.94, 0.82), (-5 + 5 * i, -7.5, 10.5), spot=math.radians(13))
    t = D.objects.new(f'spot-target-{i}', None); LIGHTS.objects.link(t); t.location = (0, 3, 1.2)
    c_ = s.constraints.new('TRACK_TO'); c_.target = t; c_.track_axis = 'TRACK_NEGATIVE_Z'; c_.up_axis = 'UP_Y'

# ================================================================= the exterior, 60 m in front
EX = Vector((0, -60, 0))
PUB_FACE = math.radians(8)
instance(pub, 'ext-pub', EX + Vector((0, 0, 0)), PUB_FACE, (1.3, 1.3, 1.3), c=EXT)
# The clock tower, 22.4 m (it was 32 m): from the pub's pavement its clock and spire were above the picture and only
# its shaft was left, a dark slab with a ruler's edge down the left of s00_pub (the fourth cut's review). At this
# height its top is inside that picture, even when the edit has pushed in, and it reads as a tower as the dome
# reads as a dome; 1.2 m further right so that the push-in does not cut it.
instance(clock, 'ext-clock', EX + Vector((-16.3, 19, 0)), 0.2, (1.6, 1.6, 1.6), c=EXT)
instance(dome, 'ext-dome', EX + Vector((21, 21, 9)), 0.0, (2.6, 2.6, 2.6), c=EXT)
drum('ext-dome-drum', EX + Vector((21, 21, 9)), 2.6, EXT)
# The pub's name, on the pub: the board fixed flat over the shop front of its left house, over the door. It was on a
# post 7.6 m out in the street, on the lens's line to the left lamp: the glow hid the post and the first letter, and
# the board hung in the air beside the house ("LACK LANTERN", the fourth cut's review). There is no room for a post
# sign to stand clear on that side inside the part of the picture the edit keeps.
# Measured on the model: that front is 6 m wide, 1.0 to 7.0 m left of the pub's middle, and its foremost part between
# 2.7 and 4.0 m up is the cornice over the shop front, 6.54 m in front of the pub's middle. The board's back is 0.06 m
# in front of that cornice, its foot at 2.8 m, its middle 4.0 m left of the pub's middle.
_along, _into = Vector((math.cos(PUB_FACE), math.sin(PUB_FACE), 0)), Vector((-math.sin(PUB_FACE), math.cos(PUB_FACE), 0))
SIGN_W = 3.4
sign('ext-sign', SIGN, EX + _along * (-4.0 - SIGN_W / 2 - 0.25) - _into * (6.54 + 0.06 + 0.04) + Vector((0, 0, -0.12)), PUB_FACE, EXT, width=SIGN_W, post=False)
box('ext-street', (120, 60, 0.4), EX + Vector((0, -6, -0.2)), M_COB, EXT)
esky = plane('ext-sky', 150, 60, EX + Vector((0, 26, 22)), (math.radians(90), 0, 0), M_SKY, EXT)
# the same moon as the stage's, and its halo the same way: 0.1 m in front of the disc, adding light only
emoon = card('ext-moon', 9, EX + Vector((7, 25.6, 21)), moon.data.materials[0], EXT); no_shadow(emoon)
ehalo = card('ext-moon-halo', 32, EX + Vector((7, 25.5, 21)), glow('ext-halo', (0.55, 0.7, 1.0), 0.7, power=HALO_POWER), EXT); no_shadow(ehalo)
for i, (x, y, s, rz) in enumerate([(-19, 6, 1.15, 0.2), (-28, 2, 1.3, 3.3), (17, 7, 1.1, 3.0), (26, 3, 1.35, -0.2), (-37, 8, 1.5, 0.1), (36, 9, 1.5, 3.2), (-10, 13, 1.0, 3.1), (10, 14, 1.0, 0.1)]):
    instance(house, f'ext-house-{i}', EX + Vector((x, y, 0)), rz, (s, s, s), c=EXT)
for i, x in enumerate((-8.5, 8.5, -15, 15)):
    instance(lamp, f'ext-lamp-{i}', EX + Vector((x, -9.5 - (i // 2) * 3, 0)), c=EXT)
    L = D.lights.new(f'ext-gas-{i}', 'POINT'); L.energy = 700; L.color = (1.0, 0.62, 0.25); L.shadow_soft_size = 0.2
    lo = D.objects.new(f'ext-gas-{i}', L); EXT.objects.link(lo); lo.location = EX + Vector((x, -9.5 - (i // 2) * 3 - 0.02, 3.02))
    lamp_glow(f'ext-gas-glow-{i}', EX + Vector((x, -9.5 - (i // 2) * 3, FLAME_Z)), GLOW_R * 1.3, EXT)       # seen from further off, so a little wider
for i, (y, z, lv) in enumerate([(14, 3, 0.5), (4, 2.2, 0.35), (-8, 1.4, 0.3)]):
    f = plane(f'ext-fog-{i}', 130, 9, EX + Vector((0, y, z)), (math.radians(90), 0, 0), soft_card(f'ext-fog-{i}', (0.42, 0.55, 0.72), 0.5, radial=False, noise=0.12), EXT)
    f.data.materials[0].node_tree.nodes['level'].inputs[1].default_value = lv
    for uv in f.data.uv_layers[0].data: uv.uv.y = 1 - uv.uv.y
    no_shadow(f)
L = D.lights.new('ext-moonlight', 'SUN'); L.energy = 2.2; L.color = (0.45, 0.6, 1.0); L.angle = math.radians(3)
lo = D.objects.new('ext-moonlight', L); EXT.objects.link(lo); lo.rotation_euler = (math.radians(-60), 0, math.radians(-25))
L = D.lights.new('ext-red', 'AREA'); L.energy = 2600; L.color = (1.0, 0.55, 0.22); L.size = 12
lo = D.objects.new('ext-red', L); EXT.objects.link(lo); lo.location = EX + Vector((0, -14, 1.0)); lo.rotation_euler = (math.radians(75), 0, 0)

# ---------------------------------------------------------------- world, camera, render settings
w = D.worlds.new('night'); scene.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.004, 0.006, 0.014, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
cam = D.objects.new('camera', D.cameras.new('camera')); scene.collection.objects.link(cam); scene.camera = cam
cam.location = (0, -15, 3.2); cam.rotation_euler = (math.radians(88), 0, 0); cam.data.lens = 35; cam.data.sensor_width = 36
aim = D.objects.new('aim', None); scene.collection.objects.link(aim); aim.location = (0, 4, 2.5)
tr = cam.constraints.new('TRACK_TO'); tr.target = aim; tr.track_axis = 'TRACK_NEGATIVE_Z'; tr.up_axis = 'UP_Y'

bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('stage built:', OUT, len(D.objects), 'objects')
