"""Thuan, the Sakura shopkeeper, rebuilt on the same skeleton as Johansson.

Blender 4.2 LTS. Stage one of two (animate-johansson.py --character thuan is the second):

  python tools/blender/build-thuan.py -- --mpfb /path/to/mpfb2/src/mpfb --root "$PWD"

She starts from the Yui source (art/characters/yui/yui.blend), the MakeHuman build of the
shopkeeper: phenotype, face targets, the fitted suit and loafers. Her look follows a
reference photographs supplied by the user (nothing from them is embedded): a slimmer oval
face with a narrow chin, warm brown eyes and rosy lips; her long dark hair; a short-sleeved
top and loose trousers in yellow cotton printed with small white flowers. Underneath: MPFB's 163-bone default skeleton (fingers, toes, jaw,
eyes), face shapes named the ARKit way so her face controller drives them, and a one-piece
swimsuit over the skin the clothes cover, for the family bath at Umi-no-yu.
"""
import bpy, sys, argparse, json
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
import mh_character as mh

parser = argparse.ArgumentParser()
parser.add_argument('--mpfb', required=True)
parser.add_argument('--root', required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
root = Path(args.root).resolve()

bpy.ops.wm.open_mainfile(filepath=str(root / 'art/characters/yui/yui.blend'))
for obj in list(bpy.data.objects):
    if obj.type == 'MESH' and obj.name.startswith('Yui.'):
        obj.parent = None
        obj.matrix_world.identity()  # Yui's objects carry a 1.207 scale; their mesh data is in MPFB space.
        bpy.context.view_layer.objects.active = obj
        for mod in list(obj.modifiers):
            if mod.type == 'ARMATURE':
                obj.modifiers.remove(mod)
    elif obj.type in ('MESH', 'ARMATURE'):
        bpy.data.objects.remove(obj, do_unlink=True)
for action in list(bpy.data.actions):
    bpy.data.actions.remove(action)

HumanService, TargetService, TARGETS = mh.load_mpfb(args.mpfb)
construction = json.loads((root / 'art/characters/yui/construction.json').read_text())
body = HumanService.create_human(macro_detail_dict=construction['phenotype'])
body.name = 'Thuan.Body'

# Her face as Yui was built, including the gentle smile and softened eyes baked in.
for target, weight in construction['faceTargets'].items():
    TargetService.load_target(body, str(TARGETS / (target + '.target.gz')), weight=weight, name='feature.' + target.split('/')[-1])
UNITS = TARGETS / 'expression/units/asian'
unit_names = ['eye-left-closure', 'eye-right-closure', 'eye-left-opened-up', 'eye-right-opened-up', 'eye-left-slit', 'eye-right-slit',
              'eyebrows-left-extern-up', 'eyebrows-right-extern-up', 'eyebrows-left-inner-up', 'eyebrows-right-inner-up',
              'eyebrows-left-down', 'eyebrows-right-down', 'mouth-open', 'mouth-corner-puller', 'mouth-pursing', 'mouth-protusion',
              'mouth-depression', 'mouth-retraction', 'mouth-compression']
base_keys = [b.name for b in body.data.shape_keys.key_blocks]
for unit in unit_names:
    TargetService.load_target(body, str(UNITS / (unit + '.target.gz')), weight=0.0, name='unit.' + unit)
basis = mh.coords(body, base_keys[0])
unit_delta = {u: mh.coords(body, 'unit.' + u) - basis for u in unit_names}
for u in unit_names:
    body.shape_key_remove(body.data.shape_keys.key_blocks['unit.' + u])
pos = mh.mixed(body)
# Her own face, from the reference photograph (nothing from it is embedded): a slimmer oval
# with a narrow, softly pointed chin, higher cheekbones and less cheek, eyes a touch larger,
# a finer nose and fuller lips with a clear cupid's bow. Measured here, applied once Yui's
# visible skin has been matched, and only in front of the ears so the hair still fits.
PRETTY = {'head/head-oval': .85, 'head/head-scale-horiz-decr': .25, 'chin/chin-width-decr': .65, 'chin/chin-triangle': .35, 'chin/chin-prominent-incr': .15,
          'cheek/l-cheek-volume-decr': .85, 'cheek/r-cheek-volume-decr': .85, 'cheek/l-cheek-bones-incr': .25, 'cheek/r-cheek-bones-incr': .25,
          'eyes/l-eye-scale-incr': .1, 'eyes/r-eye-scale-incr': .1, 'head/head-invertedtriangular': .25, 'mouth/mouth-scale-horiz-decr': .3, 'nose/nose-scale-horiz-decr': .22, 'nose/nose-point-width-decr': .3,
          'nose/nose-volume-decr': .18, 'mouth/mouth-upperlip-volume-incr': .22, 'mouth/mouth-lowerlip-volume-incr': .12,
          'mouth/mouth-cupidsbow-incr': .3, 'neck/neck-scale-horiz-decr': .15}
for target, weight in PRETTY.items():
    TargetService.load_target(body, str(TARGETS / (target + '.target.gz')), weight=weight, name='pretty.' + target.split('/')[-1])
pretty_delta = mh.mixed(body) - pos
for key in [k for k in body.data.shape_keys.key_blocks if k.name.startswith('pretty.')]:
    body.shape_key_remove(key)
mh.bake_shape(body, pos)
for mod in list(body.modifiers):
    body.modifiers.remove(mod)
rig = HumanService.add_builtin_rig(body, 'default')
rig.name = 'Thuan.Rig'
rig.data.name = 'Thuan.Skeleton'
bones = {b.name: (np.array(b.head_local), np.array(b.tail_local)) for b in rig.data.bones}
for mod in list(body.modifiers):
    if mod.type != 'ARMATURE':
        body.modifiers.remove(mod)
segs = mh.segments(bones)

# ARKit-named face shapes, so createThuanFaceController drives them by name. Left is hers.
side = lambda delta, sign: delta * ((pos[:, 0] * sign) > -.004)[:, None]
FACE = {
    'eyeBlinkLeft': unit_delta['eye-left-closure'], 'eyeBlinkRight': unit_delta['eye-right-closure'],
    'eyeWideLeft': unit_delta['eye-left-opened-up'], 'eyeWideRight': unit_delta['eye-right-opened-up'],
    'eyeSquint': unit_delta['eye-left-slit'] + unit_delta['eye-right-slit'],
    'browOuterUpLeft': unit_delta['eyebrows-left-extern-up'], 'browOuterUpRight': unit_delta['eyebrows-right-extern-up'],
    'browInnerUp': unit_delta['eyebrows-left-inner-up'] + unit_delta['eyebrows-right-inner-up'],
    'browDown': unit_delta['eyebrows-left-down'] + unit_delta['eyebrows-right-down'],
    'jawOpen': unit_delta['mouth-open'],
    'mouthSmileLeft': side(unit_delta['mouth-corner-puller'], 1), 'mouthSmileRight': side(unit_delta['mouth-corner-puller'], -1),
    'mouthFunnel': unit_delta['mouth-protusion'] * .7 + unit_delta['mouth-pursing'] * .5,
    'mouthPucker': unit_delta['mouth-pursing'], 'mouthFrown': unit_delta['mouth-depression'],
    'mouthStretch': unit_delta['mouth-retraction'], 'mouthPress': unit_delta['mouth-compression'],
}

body_verts = mh.group_members(body, ['body'])
eye_l, eye_r = mh.group_members(body, ['helper-l-eye']), mh.group_members(body, ['helper-r-eye'])
teeth = mh.group_members(body, ['helper-upper-teeth', 'helper-lower-teeth'])
tongue = mh.group_members(body, ['helper-tongue'])
yui_body = bpy.data.objects['Yui.Body']
yui_tree = mh.tree(mh.coords(yui_body), range(len(yui_body.data.vertices)))
gaps = np.array([yui_tree.find(pos[i])[2] for i in range(len(pos))])
visible_on_yui = gaps < 2e-3
print('YUI MATCH', int(visible_on_yui[body_verts].sum()), 'of', len(yui_body.data.vertices), 'worst kept gap', float(gaps[body_verts][visible_on_yui[body_verts]].max()), flush=True)

# The face region: in front of the ears and below the brow line, fading out over 3 cm.
eye_mid = (bones['eye.L'][0] + bones['eye.R'][0]) / 2
front = np.clip((eye_mid[1] + .045 - pos[:, 1]) / .03, 0, 1)
below = np.clip((eye_mid[2] + .05 - pos[:, 2]) / .03, 0, 1)
above_chest = np.clip((pos[:, 2] - (bones['neck01'][0][2] - .02)) / .03, 0, 1)
face_delta = pretty_delta * (front * below * np.maximum(above_chest, (pos[:, 2] > bones['neck01'][0][2] - .05)))[:, None]
face_tree = mh.tree(pos, range(len(pos)))
old_pos = pos.copy()
pos = pos + face_delta
body.data.vertices.foreach_set('co', pos.ravel())
body.data.update()
print('FACE moved up to', float(np.linalg.norm(face_delta, axis=1).max()), flush=True)

objs = {o.name[4:]: o for o in bpy.data.objects if o.name.startswith('Yui.') and o.name != 'Yui.Body'}
for name, obj in objs.items():
    obj.name = 'Thuan.' + name
suit = objs['female_elegantsuit01']
# Her look now: no beret, glasses, collar or bow.
for name in [n for n in objs if n.startswith(('Glasses', 'CreamBeret', 'Ribbon', 'Collar', 'SewnCollar', 'CottonTie'))]:
    bpy.data.objects.remove(objs.pop(name), do_unlink=True)


def follow_face(obj):
    co = mh.coords(obj)
    for i, p in enumerate(co):
        idx, w = mh.weighted(face_tree, p, 4)
        co[i] = p + (w[:, None] * face_delta[idx]).sum(0)
    obj.data.vertices.foreach_set('co', co.ravel())
    obj.data.update()


for name in ('eyebrow001', 'low-poly'):
    follow_face(objs[name])
for obj in objs.values():
    bpy.context.view_layer.objects.active = obj
    for mod in list(obj.modifiers):
        if mod.type == 'DECIMATE':
            bpy.ops.object.modifier_apply(modifier=mod.name)

# Puff sleeves: the jacket cut a little above the elbow; the arms show below.
mh.trim(suit, {'arm.' + s: (.46, ['fore.' + s, 'hand.' + s]) for s in 'LR'}, bones, segs)

# Her everyday set: a short-sleeved top and loose trousers in yellow cotton printed with
# small white flowers (red centres, green leaves), as in the reference photographs.
import bmesh
waist_z = (bones['spine04'][0][2] + bones['spine05'][0][2]) / 2
hip_z = bones['upperleg01.L'][0][2]
hem_z = bones['foot.L'][0][2] + .045


def floral_image(name, size=512, seed=1997, step=44, scale=1.):
    """Yellow cotton with scattered five-petal white flowers."""
    rng = np.random.default_rng(seed)
    img = np.zeros((size, size, 3), dtype=np.float32)
    img[:] = (.93, .7, .2)
    yy, xx = np.mgrid[0:size, 0:size]
    # Jittered grid, so flowers are spread evenly but not in rows; tiles seamlessly.
    for gy in range(0, size, step):
        for gx in range(0, size, step):
            cx, cy = gx + rng.uniform(6, step - 6), gy + rng.uniform(6, step - 6)
            turn = rng.uniform(0, 2 * np.pi)
            for dxw in (-size, 0, size):
                for dyw in (-size, 0, size):
                    x0, y0 = cx + dxw, cy + dyw
                    if not (-20 < x0 < size + 20 and -20 < y0 < size + 20):
                        continue
                    dx, dy = xx - x0, yy - y0
                    r = np.hypot(dx, dy)
                    if r.min() > 16 * scale:
                        continue
                    ang = np.arctan2(dy, dx) - turn
                    for leaf in (0, 1):
                        la = turn + (2.4 if leaf else -.9)
                        lx, ly = x0 + np.cos(la) * 11 * scale, y0 + np.sin(la) * 11 * scale
                        lr = np.hypot((xx - lx) * np.cos(la) + (yy - ly) * np.sin(la), ((yy - ly) * np.cos(la) - (xx - lx) * np.sin(la)) * 2.2)
                        img[lr < 5.5 * scale] = (.28, .5, .24)
                    petal = r < (5.2 + 3.4 * np.cos(ang * 5) ** 2) * scale
                    img[petal & (r < 9.5 * scale)] = (.98, .97, .94)
                    img[r < 2.4 * scale] = (.72, .12, .12)
    im = bpy.data.images.new(name, size, size)
    im.pixels.foreach_set(np.concatenate([img, np.ones((size, size, 1), np.float32)], -1)[::-1].ravel())
    im.pack()
    return im


def floral_material(name, image):
    mat = mh.plain_material(name, (1, 1, 1, 1), .8, .15)
    nodes = mat.node_tree.nodes
    tex = nodes.new('ShaderNodeTexImage')
    tex.image = image
    mat.node_tree.links.new(tex.outputs['Color'], nodes['Principled BSDF'].inputs['Base Color'])
    return mat


print_cloth = floral_image('Thuan.FloralCotton', step=30, scale=.72)
# The body's UV layout gives the legs less of the texture, so the trousers print is finer.
leg_cloth = floral_image('Thuan.FloralCottonLegs', seed=1998, step=17, scale=.4)
top_mat = floral_material('Thuan.Top', print_cloth)
# The suit's skirt goes: the jacket is cut square a little below the waist into a top.
bm = bmesh.new()
bm.from_mesh(suit.data)
bmesh.ops.bisect_plane(bm, geom=list(bm.verts) + list(bm.edges) + list(bm.faces), plane_co=(0, 0, hip_z + .015), plane_no=(0, 0, 1), clear_inner=True)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
bm.to_mesh(suit.data)
bm.free()
suit.data.update()
suit.data.materials.clear()
suit.data.materials.append(top_mat)
# Her hair is built below, to her own head: MakeHuman's long01 is flat plates with no crown.
bpy.data.objects.remove(objs.pop('long01'), do_unlink=True)
limb_b = mh.dominant(body, bones)
frac_b = mh.along(pos, limb_b, segs)
bare = ((np.char.startswith(limb_b, 'fore') | np.char.startswith(limb_b, 'hand')) | (np.char.startswith(limb_b, 'arm') & (frac_b > .4)))
# Without the collar the neckline shows: keep all of the neck and head skin.
bare |= np.char.startswith(limb_b, 'neck') | (limb_b == 'head')
keep = np.zeros(len(pos), dtype=bool)
keep[body_verts] = visible_on_yui[body_verts] | bare[body_verts]
# The legs go under the trousers, from the waist to just above the ankle.
legs = (np.char.startswith(limb_b, 'thigh') | np.char.startswith(limb_b, 'shin') | (limb_b == 'torso')) & (pos[:, 2] < waist_z) & (pos[:, 2] > hem_z)
keep[legs] = False
keep[teeth] = True
keep[tongue] = True
body_mask = np.zeros(len(pos), dtype=bool)
body_mask[body_verts] = True

body.shape_key_add(name='Basis')
for name, delta in FACE.items():
    key = body.shape_key_add(name=name, from_mix=False)
    key.data.foreach_set('co', (pos + delta).ravel())
kind = np.zeros(len(pos), dtype=np.int32)
kind[teeth] = 1
kind[tongue] = 2
body.data.attributes.new('town_kind', 'INT', 'POINT').data.foreach_set('value', kind)
full = body.copy()
full.data = body.data.copy()
bpy.context.scene.collection.objects.link(full)
mh.delete_vertices(body, np.nonzero(~keep)[0])
for obj in (body, full):
    for g in list(obj.vertex_groups):
        if g.name not in bones:
            obj.vertex_groups.remove(g)
weight_tree = mh.tree(pos, body_verts)
vertex_weights = mh.bone_weights(full, bones)

skin_mat = yui_body.data.materials[0]
skin_mat.name = 'Thuan.Skin'
teeth_mat = mh.plain_material('Thuan.Teeth', (.9, .88, .82, 1), .35)
tongue_mat = mh.plain_material('Thuan.Tongue', (.7, .34, .34, 1), .45)
body.data.materials.clear()
for m in (skin_mat, teeth_mat, tongue_mat):
    body.data.materials.append(m)
kinds = np.zeros(len(body.data.vertices), dtype=np.int32)
body.data.attributes['town_kind'].data.foreach_get('value', kinds)
for poly in body.data.polygons:
    poly.material_index = int(np.bincount(kinds[list(poly.vertices)]).argmax())
    poly.use_smooth = True
body.data.attributes.remove(body.data.attributes['town_kind'])
bpy.data.objects.remove(yui_body, do_unlink=True)

# The long hair falls from a parting and leaves the crown bare under the beret; darken the
# scalp in the skin texture so the head reads as hair all round.
def in_scalp(c):
    """Where her hair grows: a hairline across the forehead and temples, behind the ears, down to the nape."""
    dz, dy, ax = c[2] - eye_mid[2], c[1] - eye_mid[1], abs(c[0])
    if dz < -.085 or ax > .12:
        return False
    ear = ax > .058 and -.05 < dz < .04 and dy < .075
    return not ear and (dz > .052 - .03 * min(1, max(0, ax - .03) / .04) or (dy > .045 and dz > -.075))


def paint_scalp():
    image = next((n.image for n in skin_mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image), None)
    if image is None:
        return
    W, H = image.size
    px = np.zeros(W * H * 4, dtype=np.float32)
    image.pixels.foreach_get(px)
    px = px.reshape(H, W, 4)
    mesh = full.data
    co = mh.coords(full)
    uv = np.zeros(len(mesh.loops) * 2)
    mesh.uv_layers.active.data.foreach_get('uv', uv)
    uv = uv.reshape(-1, 2) * [W, H]
    eye = (bones['eye.L'][0] + bones['eye.R'][0]) / 2
    mask = np.zeros((H, W), dtype=np.float32)
    for poly in mesh.polygons:
        if not in_scalp(co[list(poly.vertices)].mean(0)):
            continue
        pts = uv[list(poly.loop_indices)]
        for k in range(1, len(pts) - 1):
            raster_triangle(mask, pts[0], pts[k], pts[k + 1])
    soft = mask.copy()
    for _ in range(2):
        soft = (soft * 2 + np.roll(soft, 1, 0) + np.roll(soft, -1, 0) + np.roll(soft, 1, 1) + np.roll(soft, -1, 1)) / 6
    rng = np.random.default_rng(1997)
    strands = .06 + .05 * np.abs(np.sin(np.arange(W)[None, :] * .9 + rng.normal(0, .6, (H, 1))))
    hair = np.stack([strands * .8, strands * .72, strands * .7], -1)
    px[..., :3] = px[..., :3] * (1 - soft[..., None]) + hair * soft[..., None]
    image.pixels.foreach_set(px.ravel())
    image.pack()




def raster_triangle(mask, a, b, c):
    """Fill one UV triangle (pixel coordinates) into the mask."""
    H, W = mask.shape
    x0, y0 = np.maximum(np.floor(np.min([a, b, c], 0)).astype(int), 0)
    x1, y1 = np.minimum(np.ceil(np.max([a, b, c], 0)).astype(int), [W - 1, H - 1])
    if x1 < x0 or y1 < y0:
        return
    gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
    d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
    if abs(d) < 1e-9:
        return
    l1 = ((b[1] - c[1]) * (gx - c[0]) + (c[0] - b[0]) * (gy - c[1])) / d
    l2 = ((c[1] - a[1]) * (gx - c[0]) + (a[0] - c[0]) * (gy - c[1])) / d
    inside = (l1 >= -.02) & (l2 >= -.02) & (1 - l1 - l2 >= -.02)
    mask[y0:y1 + 1, x0:x1 + 1] = np.maximum(mask[y0:y1 + 1, x0:x1 + 1], inside)


def paint_face():
    """Rosier lips on the skin texture, and dark brown irises on the eyes."""
    image = next((n.image for n in skin_mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image), None)
    pucker = np.linalg.norm(unit_delta['mouth-pursing'], axis=1)
    lips = pucker > pucker.max() * .7
    if image is not None:
        W, H = image.size
        px = np.zeros(W * H * 4, dtype=np.float32)
        image.pixels.foreach_get(px)
        px = px.reshape(H, W, 4)
        mesh = full.data
        uv = np.zeros(len(mesh.loops) * 2)
        mesh.uv_layers.active.data.foreach_get('uv', uv)
        uv = uv.reshape(-1, 2) * [W, H]
        mask = np.zeros((H, W), dtype=np.float32)
        for poly in mesh.polygons:
            vs = list(poly.vertices)
            if not all(lips[v] for v in vs) or pos[vs, 2].mean() > eye_mid[2] - .04:
                continue
            pts = uv[list(poly.loop_indices)]
            for k in range(1, len(pts) - 1):
                raster_triangle(mask, pts[0], pts[k], pts[k + 1])
        for _ in range(6):
            mask = (mask * 2 + np.roll(mask, 1, 0) + np.roll(mask, -1, 0) + np.roll(mask, 1, 1) + np.roll(mask, -1, 1)) / 6
        rose = np.array([.74, .33, .35])
        px[..., :3] = px[..., :3] * (1 - .45 * mask[..., None]) + rose * .45 * mask[..., None]
        image.pixels.foreach_set(px.ravel())
        image.pack()
        print('LIPS painted', int(mask.sum()), flush=True)
    for mat in objs['low-poly'].data.materials:
        tex = next((n.image for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image), None) if mat and mat.node_tree else None
        if tex is None:
            continue
        W, H = tex.size
        px = np.zeros(W * H * 4, dtype=np.float32)
        tex.pixels.foreach_get(px)
        px = px.reshape(H, W, 4)
        rgb = px[..., :3]
        iris = (rgb.max(-1) - rgb.min(-1)) > .12
        brown = np.array([.16, .085, .05])
        lum = rgb.mean(-1, keepdims=True)
        px[..., :3] = np.where(iris[..., None], brown * (.8 + 1.2 * lum), rgb)
        tex.pixels.foreach_set(px.ravel())
        tex.pack()
        print('IRIS', tex.name, int(iris.sum()), flush=True)


paint_face()
# Brows carry the brow shapes; the skin under the clothes and the swimsuit for the bath.
brows = objs['eyebrow001']
brow_tree = mh.tree(pos, body_verts)
brow_co = mh.coords(brows)
brows.shape_key_add(name='Basis')
for name, delta in FACE.items():
    moved = brow_co.copy()
    for i, p in enumerate(brow_co):
        idx, w = mh.weighted(brow_tree, p)
        moved[i] = p + (w[:, None] * delta[idx]).sum(0)
    brows.shape_key_add(name=name, from_mix=False).data.foreach_set('co', moved.ravel())
full.data.attributes.remove(full.data.attributes['town_kind'])
from mathutils import Vector

# Her hair, built to her head: one continuous surface of strands from the crown, a soft
# hairline over the forehead and temples, behind the ears, and down her back to below the
# shoulder blades. Its UVs run along the strands, so a strand texture and a shine ring
# follow the hair the way they do on the real thing.
skin_tree = mh.tree(pos, body_verts)
from mathutils.bvhtree import BVHTree


def surface_of(obj):
    return BVHTree.FromPolygons([tuple(v) for v in mh.coords(obj)], [tuple(p.vertices) for p in obj.data.polygons])


# Distances to the actual surfaces, not the nearest vertex: the nearest vertex dips between
# vertices, and the hair came out hammered.
skin_bvh, suit_bvh = surface_of(body), surface_of(suit)
skin_dist = lambda p: skin_bvh.find_nearest(Vector(p))[3]
wear_dist = lambda p: min(skin_bvh.find_nearest(Vector(p))[3], suit_bvh.find_nearest(Vector(p))[3])
# What the falling hair must clear: the skin and the top she is wearing over it.
suit_co = mh.coords(suit)
wear_pts = np.concatenate([pos[body_verts], suit_co])
wear_tree = mh.tree(wear_pts, range(len(wear_pts)))
head_pts = pos[[i for i in body_verts if pos[i, 2] > eye_mid[2] - .09]]
HC = np.array([0., (head_pts[:, 1].min() + head_pts[:, 1].max()) / 2 + .004, eye_mid[2] + .018])
CLEAR = .011


# A smooth egg-shaped shell around the skull; the walk below only pushes out where the
# skull itself reaches further, so the crown reads as one smooth volume of hair.
top = head_pts[head_pts[:, 2] > eye_mid[2] - .02] - HC
RX = np.abs(top[:, 0]).max()
RYB, RYF = top[:, 1].max(), -top[:, 1].min()
RZ = top[:, 2].max()


def shell_radius(d):
    ry = RYB if d[1] > 0 else RYF
    return 1 / np.sqrt((d[0] / RX) ** 2 + (d[1] / ry) ** 2 + (max(d[2], 0) / RZ) ** 2) + CLEAR * 1.05


def onto(origin, direction, clear=CLEAR, reach=.32):
    """Walk in from outside along the ray until the skin is `clear` away; the hair's surface."""
    t = reach
    while t > 0:
        p = origin + direction * t
        if skin_dist(p) < clear:
            return origin + direction * (t + .002)
        t -= .002
    return origin


def body_axis_y(z):
    near = pos[[i for i in body_verts if abs(pos[i, 2] - z) < .012]]
    return (near[:, 1].min() + near[:, 1].max()) / 2 if len(near) else HC[1]


back_z = bones['spine03'][0][2]
shoulder_z = bones['clavicle.L'][1][2] + .035
nape_z = bones['neck01'][0][2] + .01
rng_h = np.random.default_rng(7)
N_AROUND, N_ALONG = 88, 46
curves = []
for k in range(N_AROUND):
    phi = -np.pi + 2 * np.pi * k / N_AROUND  # 0 is straight back, +-pi the middle of the forehead
    a = abs(phi)
    # How far down this lock falls: to the shoulder blades behind, the shoulders at the sides,
    # and only to the hairline over the face.
    if a < np.radians(62):
        z_end = back_z + rng_h.uniform(-.012, .012)
    elif a < np.radians(100):
        f = (a - np.radians(62)) / np.radians(38)
        z_end = back_z * (1 - f) + shoulder_z * f
    else:
        z_end = None
    hairline = eye_mid[2] + .02 + .03 * np.clip((a - np.radians(118)) / np.radians(62), 0, 1)
    pts = []
    for e in np.radians(np.linspace(84, -60, 90)):
        d = np.array([np.sin(phi) * np.cos(e), np.cos(phi) * np.cos(e), np.sin(e)])
        p = onto(HC, d)
        if e > 0:
            p = HC + d * max(np.linalg.norm(p - HC), shell_radius(d))
        if z_end is None and p[2] < hairline:
            break
        if z_end is not None and p[2] < nape_z:
            break
        pts.append(p)
    if z_end is not None and pts:
        # Below the skull the hair falls, gathering a little towards the middle of the back,
        # and is pushed back (not out) off the neck, shoulders and back. The side locks start
        # their fall behind the ear.
        x0, y0, z0 = pts[-1]
        tuck = .028 * np.clip((a - np.radians(55)) / np.radians(40), 0, 1)
        push = np.array([.3 * np.sin(phi), 1., 0.])
        push /= np.linalg.norm(push)
        levels = np.linspace(z0 - .012, z_end, 24)
        for j, z in enumerate(levels):
            f = (j + 1) / len(levels)
            p = np.array([x0 * (1 - .3 * f), y0 + tuck * min(1, 3 * f), z])
            # Beyond the furthest skin or cloth along the push line, not merely away from it.
            near = wear_pts[np.abs(wear_pts[:, 2] - z) < .02]
            rel = near - p
            ahead = rel @ push
            side = np.linalg.norm(rel - np.outer(ahead, push), axis=1)
            block = ahead[side < .03]
            if len(block) and block.max() > -CLEAR:
                p = p + push * (block.max() + CLEAR)
            pts.append(p)
    pts = np.array(pts)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)])
    at = np.linspace(0, arc[-1], N_ALONG)
    curves.append((np.array([np.interp(at, arc, pts[:, j]) for j in range(3)]).T, at))

# Smooth the sheet along and across the strands (the ray walk lands on single vertices,
# which reads as lumps), then lift anything the smoothing pulled into the skin.
G = np.array([c for c, _ in curves])
for _ in range(24):
    along = G.copy()
    along[:, 1:-1] = (G[:, :-2] + 2 * G[:, 1:-1] + G[:, 2:]) / 4
    across = (np.roll(along, 1, 0) + 2 * along + np.roll(along, -1, 0)) / 4
    across[:, 0] = along[:, 0]
    G = across
for k in range(N_AROUND):
    for i in range(N_ALONG):
        radial = G[k, i] - HC
        radial /= np.linalg.norm(radial)
        out = radial if G[k, i][2] > nape_z else np.array([.3 * radial[0], max(.2, radial[1]), 0.]) / np.linalg.norm([.3 * radial[0], max(.2, radial[1])])
        for _ in range(12):
            if wear_dist(G[k, i]) >= CLEAR - .0015:
                break
            G[k, i] = G[k, i] + out * .0015
curves = [(G[k], curves[k][1]) for k in range(N_AROUND)]
bm = bmesh.new()
uv_layer = bm.loops.layers.uv.new('UVMap')
grid = [[bm.verts.new(p) for p in c] for c, _ in curves]
crown = bm.verts.new(np.mean([c[0] for c, _ in curves], axis=0) + np.array([0, 0, .002]))
LEN = .62  # metres of strand per texture repeat
for k in range(N_AROUND):
    k2 = (k + 1) % N_AROUND
    (ca, la), (cb, lb) = curves[k], curves[k2]
    u0, u1 = k / N_AROUND * 6, (k + 1) / N_AROUND * 6
    f = bm.faces.new((crown, grid[k2][0], grid[k][0]))
    for loop, uv in zip(f.loops, [((u0 + u1) / 2, 0), (u1, lb[0] / LEN), (u0, la[0] / LEN)]):
        loop[uv_layer].uv = uv
    for i in range(N_ALONG - 1):
        f = bm.faces.new((grid[k][i], grid[k2][i], grid[k2][i + 1], grid[k][i + 1]))
        for loop, uv in zip(f.loops, [(u0, la[i] / LEN), (u1, lb[i] / LEN), (u1, lb[i + 1] / LEN), (u0, la[i + 1] / LEN)]):
            loop[uv_layer].uv = uv
# The two short front locks meet longer ones at the temples; weld nothing, just smooth.
for f in bm.faces:
    f.smooth = True
bm.normal_update()
# A side-swept fringe: from a side part over her left eye, across the forehead to her right
# temple, lying just off the skin and ending at the brow on the far side.
front_ends = sorted([c[-1] for c, _ in curves if c[-1][2] > eye_mid[2] and c[-1][1] < HC[1]], key=lambda q: q[0])
hl = np.array(front_ends)
part_x, temple_x = .028, -.068


def on_forehead(p, lift=.0055):
    loc, normal, _, _ = skin_bvh.find_nearest(Vector(p))
    return np.array(loc) + np.array(normal) * lift


N_FR, N_LEN = 26, 14
fringe = []
for j in range(N_FR):
    u = j / (N_FR - 1)
    x = part_x + (temple_x - part_x) * u
    # Start a little up under the hairline, at this x.
    idx = np.argmin(np.abs(hl[:, 0] - x))
    start = hl[idx] + np.array([0, .004, .012])
    sweep = .038 + .03 * (1 - u)
    drop = .058 + .026 * u - .02 * (1 - u) ** 2
    end = start + np.array([-sweep, 0, -drop])
    end[2] = max(end[2], eye_mid[2] + .024)
    strand = []
    for t in np.linspace(0, 1, N_LEN):
        q = start * (1 - t) + end * t + np.array([0, 0, .008 * np.sin(np.pi * t)])
        strand.append(on_forehead(q, .0045 + .004 * np.sin(np.pi * t) + .003 * (1 - t)))
    fringe.append(strand)
fgrid = [[bm.verts.new(p) for p in strand] for strand in fringe]
for j in range(N_FR - 1):
    for i in range(N_LEN - 1):
        f = bm.faces.new((fgrid[j][i], fgrid[j + 1][i], fgrid[j + 1][i + 1], fgrid[j][i + 1]))
        for loop, uv in zip(f.loops, [(j / 5, i / 30), ((j + 1) / 5, i / 30), ((j + 1) / 5, (i + 1) / 30), (j / 5, (i + 1) / 30)]):
            loop[uv_layer].uv = uv
        f.smooth = True
bm.normal_update()
hair_mesh = bpy.data.meshes.new('Thuan.Hair')
bm.to_mesh(hair_mesh)
bm.free()
hair = bpy.data.objects.new('Thuan.Hair', hair_mesh)
bpy.context.scene.collection.objects.link(hair)


def strand_image(size=512):
    rng = np.random.default_rng(1998)
    cols = np.cumsum(rng.normal(0, .5, size))
    cols = (cols - cols.min()) / (np.ptp(cols) + 1e-6)
    lum = .75 + .5 * cols[None, :] + .18 * rng.normal(0, 1, (1, size))
    v = np.linspace(0, 1, size)[:, None]
    shine = np.exp(-((v - .16) / .035) ** 2) * .9 + np.exp(-((v - .66) / .05) ** 2) * .35
    base = np.array([.036, .027, .022])
    img = base * np.clip(lum, .4, 1.6)[..., None] + np.array([.1, .085, .07]) * shine[..., None] * np.clip(lum, .6, 1.4)[..., None]
    im = bpy.data.images.new('Thuan.HairStrands', size, size)
    im.pixels.foreach_set(np.concatenate([img, np.ones((size, size, 1))], -1)[::-1].astype(np.float32).ravel())
    im.pack()
    return im


hair_mat = mh.plain_material('Thuan.Hair', (1, 1, 1, 1), .66, .14, double=True)
tex = hair_mat.node_tree.nodes.new('ShaderNodeTexImage')
tex.image = strand_image()
hair_mat.node_tree.links.new(tex.outputs['Color'], hair_mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
hair_mesh.materials.append(hair_mat)
objs['Hair'] = hair
print('HAIR', len(hair_mesh.vertices), 'verts', flush=True)
paint_scalp()
under = mh.complement(full, keep, body_mask, 'Thuan.SkinUnder', skin_mat)
armpit = bones['upperarm01.L'][0][2] - .05
hip_z = bones['upperleg01.L'][0][2]
coral = mh.plain_material('Thuan.Swimwear', (.78, .1, .14, 1), .45, .4, double=True)


def swim_face(c):
    # A 1997 one-piece: high on the hip, a scooped front, straps over the shoulders.
    leg_line = hip_z - .07 + max(0., abs(c.x) - .035) * 1.1
    torso = abs(c.x) < (.15 if c.z > armpit - .1 else .2) and leg_line < c.z < armpit - .015
    strap = armpit - .015 <= c.z < armpit + .15 and .045 < abs(c.x) < .085
    return torso or strap


swimsuit = mh.shell(under, 'Thuan.Swimsuit', swim_face, .005, coral)
# Loose cotton trousers over the skin under them, waistband tucked beneath the top.
trouser_mat = floral_material('Thuan.Trousers', leg_cloth)
trousers = mh.shell(under, 'Thuan.Trousers', lambda c: hem_z - .004 < c.z < waist_z + .03 and abs(c.x) < .25, .014, trouser_mat)
# Roomy over the hips, slimmer from mid-thigh down (her knees pass close by the chair's
# front edge as she turns to sit), and flared again at the hem over her shoes.
for v in trousers.data.vertices:
    slim = np.clip((hip_z - .06 - v.co.z) / .06, 0, 1) * np.clip((v.co.z - hem_z - .035) / .03, 0, 1)
    v.co -= v.normal * (.0075 * slim)
trousers.data.update()

# Skin everything from the body beneath it; the rigid bits ride the head or the eyes.
for name, obj in objs.items():
    if name == 'low-poly':
        mh.reweight(obj, rig, weight_tree, vertex_weights, rigid=lambda p: 'eye.L' if p[0] > 0 else 'eye.R')
    elif name.startswith(('Glasses', 'CreamBeret', 'Ribbon')):
        mh.reweight(obj, rig, weight_tree, vertex_weights, rigid=lambda p: 'head')
    else:
        mh.reweight(obj, rig, weight_tree, vertex_weights)
for obj in (body, under, swimsuit, trousers):
    obj.parent = rig
    for mod in list(obj.modifiers):
        if mod.type == 'ARMATURE':
            obj.modifiers.remove(mod)
    m = obj.modifiers.new('Armature', 'ARMATURE')
    m.object = rig
    for poly in obj.data.polygons:
        poly.use_smooth = True
for img in list(bpy.data.images):
    if img.users == 0:
        bpy.data.images.remove(img)

# Up to her real height, 1.64 m: meshes with their shape keys, and the bones with them.
from mathutils import Matrix
K = 1.64 / mh.coords(body)[:, 2].max()
for obj in [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('Thuan.')]:
    obj.data.transform(Matrix.Scale(K, 4), shape_keys=True)
    obj.data.update()
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
for eb in rig.data.edit_bones:
    eb.head *= K
    eb.tail *= K
bpy.ops.object.mode_set(mode='OBJECT')
print('HEIGHT', mh.coords(body)[:, 2].max(), 'BODY', len(body.data.vertices), 'UNDER', len(under.data.vertices),
      'SWIM', len(swimsuit.data.vertices), 'TROUSERS', len(trousers.data.vertices), 'OBJECTS', sorted(o.name for o in bpy.data.objects if o.name.startswith('Thuan.')), flush=True)
out_dir = root / 'art/characters/thuan'
out_dir.mkdir(parents=True, exist_ok=True)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(out_dir / 'thuan.blend'), compress=True)
print('SAVED', out_dir / 'thuan.blend', flush=True)
