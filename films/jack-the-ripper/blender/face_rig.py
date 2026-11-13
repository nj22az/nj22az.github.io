"""The singer's face rig: she is the voice of the song, so her mouth has to make its words.

    blender -b cast.blend -P face_rig.py          (adds the rig to the singer in cast.blend and saves it)

Meshy's skeleton stops at the head, and her mouth and eyes are painted on one closed surface. The rig is built on
that surface, measured from front and side pictures of her head at rest (metres, the character's own axes):

  open    the jaw: everything under the line of the lips, in front of the ears, comes down and a little back, most
          at the middle and nothing at the corners, so the mouth opens as a lens;
  wide    the corners of the mouth draw apart (EE);
  pucker  the corners come in and the lips forward (OO);
  mouth   the mouth's inside (the dark, a band of upper teeth): a smooth oval folded flat on the lip line and let
          down like a blind as the jaw opens, about a millimetre in front of the skin: never in its plane;
  lids    an upper eyelid for each eye, folded on the lid line; `blink` draws it down over the painted eye.

film.py drives the five values from lipsync.json (made by lipsync.py from the sung words' own times).
"""
import bpy, bmesh, math
from mathutils import Vector
from mathutils.bvhtree import BVHTree

D = bpy.data
arm = D.objects['singer']; body = D.objects['singer-mesh']
bpy.context.view_layer.update()
MW = body.matrix_world.copy(); MWI = MW.inverted(); R3I = MW.to_3x3().inverted()

# measured on her head at rest
Z_LIP, LIP_CURVE, MOUTH_HALF = 1.4587, 6.4, 0.0235          # the lip line at the middle, how it rises to the corners
EYES = ((-0.0375, 1.517), (0.0375, 1.517)); EYE_HALF, EYE_UP, EYE_DOWN = 0.0195, 0.0145, 0.0120
GAP = 0.0008                                                 # how far a decal stands off the skin


def sstep(a, b, v):
    u = max(0.0, min(1.0, (v - a) / (b - a))); return u * u * (3 - 2 * u)


def lip(x): return Z_LIP + LIP_CURVE * x * x


def shapes(p):
    """What each mouth shape does to a point of the head at rest: {name: Vector}."""
    x, y, z = p
    front = 1.0 - sstep(-0.045, -0.015, y)                   # 1 on the face, 0 behind the cheeks
    d = lip(x) - z                                           # how far under the lip line
    out = {'open': Vector(), 'wide': Vector(), 'pucker': Vector()}
    if front <= 0 or d < -0.03 or d > 0.07 or abs(x) > 0.09: return out
    if d >= 0:
        hw = MOUTH_HALF + max(0.0, d - 0.004) * 2.2
        w = front * sstep(0.0, 0.005, d) * (1.0 - sstep(0.55 * hw, hw, abs(x))) * (1.0 - sstep(0.036, 0.06, d))
        out['open'] = Vector((0, 0.003, -0.0150)) * w
    else:
        w = front * sstep(-0.008, 0.0, d) * (1.0 - sstep(0.012, MOUTH_HALF, abs(x)))
        out['open'] = Vector((0, 0, 0.0018)) * w             # the upper lip lifts a little
    s = 1 if x >= 0 else -1
    wc = front * math.exp(-(((abs(x) - 0.024) ** 2) + d * d) / (2 * 0.012 ** 2))
    wm = front * math.exp(-((x * x) + d * d) / (2 * 0.014 ** 2))
    out['wide'] = Vector((s * 0.0042, 0.0006, 0.0016)) * wc
    out['pucker'] = Vector((-s * 0.0075, -0.0030, 0)) * wc + Vector((0, -0.0042, 0)) * wm
    return out


# ---- the skin
if body.data.shape_keys:
    # Run on a fresh cast.blend. Taking the Basis away while other keys remain makes the next key the mesh's rest
    # shape, which bends the face for good; so if keys are found, they go last to first, the Basis last of all.
    for k in reversed(list(body.data.shape_keys.key_blocks)): body.shape_key_remove(k)
body.shape_key_add(name='Basis')
keys = {n: body.shape_key_add(name=n) for n in ('open', 'wide', 'pucker')}
moved = 0
for v in body.data.vertices:
    p = MW @ v.co
    if p.z < 1.38 or p.z > 1.50 or p.y > 0.0: continue
    sh = shapes(p)
    for n, dv in sh.items():
        if dv.length > 1e-6: keys[n].data[v.index].co = v.co + R3I @ dv; moved += 1
print('skin: vertex moves', moved)

# the head at rest, to lay the decals on
bm = bmesh.new(); bm.from_mesh(body.data); bm.transform(MW)
tree = BVHTree.FromBMesh(bm)


def surf(x, z):
    hit = tree.ray_cast(Vector((x, -1.0, z)), Vector((0, 1, 0)))
    return (hit[0].y - GAP) if hit[0] else None


def colour_mat(name, rough):
    m = D.materials.new(name); m.use_nodes = True; nt = m.node_tree
    a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Col'
    b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = rough
    nt.links.new(a.outputs['Color'], b.inputs['Base Color']); return m


def decal(name, grid, material):
    """grid: rows of (basis point, {key: target point}, colour); builds the object, keyed and skinned to the head."""
    for old in [o for o in D.objects if o.name == name]: D.objects.remove(old)
    me = D.meshes.new(name); rows, cols = len(grid), len(grid[0])
    verts = [MWI @ grid[r][c][0] for r in range(rows) for c in range(cols)]
    faces = [(r * cols + c, r * cols + c + 1, (r + 1) * cols + c + 1, (r + 1) * cols + c) for r in range(rows - 1) for c in range(cols - 1)]
    me.from_pydata(verts, [], faces); me.update()
    ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    for r in range(rows):
        for c in range(cols): ca.data[r * cols + c].color = (*grid[r][c][2], 1.0)
    for p in me.polygons: p.use_smooth = True
    ob = D.objects.new(name, me); arm.users_collection[0].objects.link(ob)
    ob.parent = body.parent; ob.matrix_parent_inverse = body.matrix_parent_inverse.copy(); ob.matrix_local = body.matrix_local.copy()
    ob.shape_key_add(name='Basis')
    for kn in grid[0][0][1]:
        k = ob.shape_key_add(name=kn)
        for r in range(rows):
            for c in range(cols): k.data[r * cols + c].co = MWI @ grid[r][c][1][kn]
    g = ob.vertex_groups.new(name='Head'); g.add(range(len(verts)), 1.0, 'REPLACE')
    md = ob.modifiers.new('Armature', 'ARMATURE'); md.object = arm
    me.materials.append(material); ob.visible_shadow = False
    return ob


# ---- the mouth's inside: a smooth dark oval with a band of upper teeth. Shut, it is folded flat on the lip
# line; `open` lets it down from that line like a blind, to the depth the jaw has dropped; `wide` and `pucker`
# make it broader or narrower with the lips. Its outline is an ellipse, so the open mouth always has a clean edge.
TEETH, DARK = (0.80, 0.77, 0.72), (0.022, 0.003, 0.005)
HALF_W, DEPTH = 0.0192, 0.0178
NU, NV = 28, 10
grid = []
for r in range(NV + 1):
    v = r / NV; row = []
    for c in range(NU + 1):
        u = -1 + 2 * c / NU; x = HALF_W * u; arc = math.sqrt(max(0.0, 1 - u * u))
        fold = Vector((x, surf(x, lip(x)), lip(x)))
        z = lip(x) + 0.0012 - v * DEPTH * arc
        opened = Vector((x, min(surf(x, z), fold.y) - 0.0004, z))
        tg = {'open': opened, 'wide': fold + Vector((x * 0.2, 0, 0.0012 * abs(u))), 'pucker': fold + Vector((-x * 0.36, -0.0034, 0))}
        row.append((fold, tg, TEETH if (v < 0.24 and abs(u) < 0.86) else DARK))
    grid.append(row)
decal('singer-mouth', grid, colour_mat('singer-mouth', 0.7))

# ---- the eyelids
LID, LASH = (0.84, 0.56, 0.50), (0.03, 0.012, 0.012)
grid = None
for i, (cx, cz) in enumerate(EYES):
    g = []
    for r in range(7):
        fr = r / 6; row = []
        for c in range(15):
            dx = -EYE_HALF + 2 * EYE_HALF * c / 14; arc = math.sqrt(max(0.0, 1 - (dx / EYE_HALF) ** 2))
            zt = cz + EYE_UP * arc; zb = cz - EYE_DOWN * arc; x = cx + dx
            fold = Vector((x, surf(x, zt), zt)); z = zt + fr * (zb - zt)
            row.append((fold, {'blink': Vector((x, surf(x, z), z))}, LASH if r == 6 and abs(dx) < EYE_HALF * 0.8 else LID))
        g.append(row)
    decal(f'singer-lid-{i}', g, colour_mat(f'singer-lid-{i}', 0.5))

bpy.ops.wm.save_mainfile()
print('face rig saved')
