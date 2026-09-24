"""Thuan, the Sakura shopkeeper, rebuilt on the same skeleton as Johansson.

Blender 4.2 LTS. Stage one of two (animate-johansson.py --character thuan is the second):

  python tools/blender/build-thuan.py -- --mpfb /path/to/mpfb2/src/mpfb --root "$PWD"

She starts from the Yui source (art/characters/yui/yui.blend), the MakeHuman build of the
shopkeeper: phenotype, the fitted suit and loafers. Her head is a young woman's, soft and
friendly: big warm brown eyes, a small nose, rosy lips resting in a smile; her long dark
hair with a clear side part, in two plaits over her shoulders; a short-sleeved top and loose trousers in yellow cotton printed with
small white flowers. Underneath: MPFB's 163-bone default skeleton (fingers, toes, jaw,
eyes), face shapes named the ARKit way so her face controller drives them, and a one-piece
swimsuit over the skin the clothes cover, for the family bath at Umi-no-yu.
"""
import bpy, sys, argparse, json
from pathlib import Path
import numpy as np
from mathutils import Vector, Matrix

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
# Her face: a clean MakeHuman head for a young woman in her twenties, with ideal proportions,
# in place of Yui's teenage face (and the wide smile built into it). Only a few light touches
# on top: big, bright eyes, a smaller nose and mouth, softly full cheeks, a
# shorter rounder chin and the corners of her mouth turned up, so she rests with a smile.
# The head is built on a second human and carried over above the neck, so the body and
# clothes stay Yui's.
FACE_PHENOTYPE = {**construction['phenotype'], 'age': .5, 'proportions': 1.}
CUTE = {
    'eyes/l-eye-scale-incr': .6, 'eyes/r-eye-scale-incr': .6,
    'nose/nose-scale-horiz-decr': .2, 'nose/nose-volume-decr': .25, 'nose/nose-point-width-decr': .25,
    'mouth/mouth-scale-horiz-decr': .12, 'cheek/l-cheek-volume-incr': .12, 'cheek/r-cheek-volume-incr': .12,
    'chin/chin-prominent-decr': .15, 'chin/chin-width-decr': .15, 'chin/chin-height-decr': .25, 'head/head-oval': .3,
    'mouth/mouth-angles-up': .45, 'eyes/l-eye-height1-incr': .4, 'eyes/r-eye-height1-incr': .4,
    'expression/units/asian/mouth-corner-puller': .22, 'mouth/mouth-lowerlip-volume-decr': .2}
ref = HumanService.create_human(macro_detail_dict=FACE_PHENOTYPE)
for target, weight in CUTE.items():
    TargetService.load_target(ref, str(TARGETS / (target + '.target.gz')), weight=weight, name='cute.' + target.split('/')[-1])
pretty_delta = mh.mixed(ref) - pos
bpy.data.objects.remove(ref, do_unlink=True)
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
SMILE = unit_delta['mouth-corner-puller'] * .42 + unit_delta['mouth-compression'] * .3
FACE = {
    'eyeBlinkLeft': unit_delta['eye-left-closure'], 'eyeBlinkRight': unit_delta['eye-right-closure'],
    'eyeWideLeft': unit_delta['eye-left-opened-up'], 'eyeWideRight': unit_delta['eye-right-opened-up'],
    'eyeSquint': unit_delta['eye-left-slit'] + unit_delta['eye-right-slit'],
    'browOuterUpLeft': unit_delta['eyebrows-left-extern-up'], 'browOuterUpRight': unit_delta['eyebrows-right-extern-up'],
    'browInnerUp': unit_delta['eyebrows-left-inner-up'] + unit_delta['eyebrows-right-inner-up'],
    'browDown': unit_delta['eyebrows-left-down'] + unit_delta['eyebrows-right-down'],
    'jawOpen': unit_delta['mouth-open'],
    # A soft, closed smile: MakeHuman's full corner-puller is a wide grin that bares the gums.
    'mouthSmileLeft': side(SMILE, 1), 'mouthSmileRight': side(SMILE, -1),
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

# The whole head and neck take the fitted shape (her hair is built to it afterwards); below
# the neck nothing moves, so the fitted clothes still fit.
eye_mid = (bones['eye.L'][0] + bones['eye.R'][0]) / 2
neck = np.clip((pos[:, 2] - (bones['neck01'][0][2] - .04)) / .03, 0, 1)
# The new head sits where Yui's did: no step where the neck blends in.
band = (pos[:, 2] > bones['neck01'][0][2] - .045) & (pos[:, 2] < bones['neck01'][0][2] - .005)
pretty_delta = pretty_delta - pretty_delta[band].mean(0)
face_delta = pretty_delta * neck[:, None]
face_tree = mh.tree(pos, range(len(pos)))
old_pos = pos.copy()
pos = pos + face_delta
body.data.vertices.foreach_set('co', pos.ravel())
body.data.update()
print('FACE moved up to', float(np.linalg.norm(face_delta, axis=1).max()), flush=True)
# The head's bones follow the new head: eyes to their eyeballs, the rest with the skin around them.
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
for eb in rig.data.edit_bones:
    for end in ('head', 'tail'):
        p = np.array(getattr(eb, end))
        if p[2] < bones['neck01'][0][2] - .04:
            continue
        if eb.name in ('eye.L', 'eye.R'):
            shift = face_delta[eye_l if eb.name == 'eye.L' else eye_r].mean(0)
        else:
            idx, w = mh.weighted(face_tree, p, 6)
            shift = (w[:, None] * face_delta[idx]).sum(0)
        setattr(eb, end, Vector(p + shift))
bpy.ops.object.mode_set(mode='OBJECT')
bones = {b.name: (np.array(b.head_local), np.array(b.tail_local)) for b in rig.data.bones}
eye_mid = (bones['eye.L'][0] + bones['eye.R'][0]) / 2

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
    # Only the skin her hair actually covers: straight out from it, the hair is met within a
    # couple of centimetres (not over her ears, nor anywhere the hair does not reach).
    hair_bvh = surface_of(hair)
    nrm = np.array([v.normal for v in mesh.vertices])
    covered = np.array([c[2] > nape_z - .005 and hair_bvh.ray_cast(Vector(c), Vector(n), .022)[0] is not None
                        for c, n in zip(co, nrm)])
    mask = np.zeros((H, W), dtype=np.float32)
    for poly in mesh.polygons:
        if not covered[list(poly.vertices)].all():
            continue
        pts = uv[list(poly.loop_indices)]
        for k in range(1, len(pts) - 1):
            raster_triangle(mask, pts[0], pts[k], pts[k + 1])
    soft = mask.copy()
    for _ in range(2):
        soft = (soft * 2 + np.roll(soft, 1, 0) + np.roll(soft, -1, 0) + np.roll(soft, 1, 1) + np.roll(soft, -1, 1)) / 6
    # The side part shows her scalp: a fine line left unpainted.
    near_part = np.clip(1 - np.abs(co[:, 0] - PART_X) / .009, 0, 1) * np.array([in_part(c) for c in co])
    line = np.zeros((H, W), dtype=np.float32)
    for poly in mesh.polygons:
        vs = list(poly.vertices)
        if near_part[vs].max() <= 0:
            continue
        pts = uv[list(poly.loop_indices)]
        for k in range(1, len(pts) - 1):
            raster_weights(line, pts[0], pts[k], pts[k + 1], near_part[vs[0]], near_part[vs[k]], near_part[vs[k + 1]])
    soft *= 1 - np.clip((line - .5) / .25, 0, 1)
    rng = np.random.default_rng(1997)
    strands = .06 + .05 * np.abs(np.sin(np.arange(W)[None, :] * .9 + rng.normal(0, .6, (H, 1))))
    tint = np.stack([strands * .8, strands * .72, strands * .7], -1)
    px[..., :3] = px[..., :3] * (1 - soft[..., None]) + tint * soft[..., None]
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


def raster_weights(mask, a, b, c, wa, wb, wc):
    """Fill one UV triangle with its corner weights interpolated, keeping the larger value."""
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
    l3 = 1 - l1 - l2
    inside = (l1 >= -.02) & (l2 >= -.02) & (l3 >= -.02)
    val = np.where(inside, l1 * wa + l2 * wb + l3 * wc, 0)
    mask[y0:y1 + 1, x0:x1 + 1] = np.maximum(mask[y0:y1 + 1, x0:x1 + 1], val)


def paint_face():
    """Her makeup, painted into the skin texture: rose lips, blush, a soft warm eyeshadow and
    a fine eyeliner; and dark brown irises on the eyes."""
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
        head_polys = [poly for poly in mesh.polygons if pos[list(poly.vertices), 2].mean() > eye_mid[2] - .1]
        def layer(weight, colour, opacity, blur):
            mask = np.zeros((H, W), dtype=np.float32)
            for poly in head_polys:
                vs = list(poly.vertices)
                if weight[vs].max() <= 0:
                    continue
                pts = uv[list(poly.loop_indices)]
                for k in range(1, len(pts) - 1):
                    raster_weights(mask, pts[0], pts[k], pts[k + 1], weight[vs[0]], weight[vs[k]], weight[vs[k + 1]])
            for _ in range(blur):
                mask = (mask * 2 + np.roll(mask, 1, 0) + np.roll(mask, -1, 0) + np.roll(mask, 1, 1) + np.roll(mask, -1, 1)) / 6
            a = np.clip(mask, 0, 1)[..., None] * opacity
            px[..., :3] = px[..., :3] * (1 - a) + np.array(colour) * a

        low_face = pos[:, 2] < eye_mid[2] - .035
        lipw = np.clip((pucker / pucker.max() - .8) / .12, 0, 1) * low_face
        layer(lipw, (.72, .30, .36), .62, 1)
        for sign in (1, -1):
            apple = np.array([sign * .043, 0, eye_mid[2] - .036])
            near = [i for i in body_verts if abs(pos[i, 0] - apple[0]) < .01 and abs(pos[i, 2] - apple[2]) < .01]
            apple[1] = min(pos[i, 1] for i in near) if near else eye_mid[1]
            dist = np.linalg.norm(pos - apple, axis=1)
            layer(np.exp(-(dist / .02) ** 2) * (dist < .05), (.93, .5, .55), .32, 2)
            blink = np.maximum(np.linalg.norm(FACE['eyeBlinkLeft'], axis=1), np.linalg.norm(FACE['eyeBlinkRight'], axis=1))
            upper = (pos[:, 2] > eye_mid[2] - .003) & (np.sign(pos[:, 0]) == sign)
            skin_mask = np.zeros(len(pos))
            skin_mask[body_verts] = 1
            blink = blink * upper * skin_mask
            lid = np.clip(blink / blink.max(), 0, 1) * upper
            layer(lid ** .6, (.58, .36, .34), .38, 3)
            layer(np.clip((lid - .72) / .2, 0, 1), (.06, .04, .04), .88, 1)
        image.pixels.foreach_set(px.ravel())
        image.pack()
        print('MAKEUP painted', flush=True)
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
# Her brows, a little softer: the painted face underneath has her own brows too.
for mat in brows.data.materials:
    tex = next((n.image for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image), None) if mat and mat.node_tree else None
    if tex is not None:
        bp = np.zeros(tex.size[0] * tex.size[1] * 4, dtype=np.float32)
        tex.pixels.foreach_get(bp)
        bp = bp.reshape(-1, 4)
        bp[:, :3] = bp[:, :3] * .5 + np.array([.11, .075, .055]) * .5
        bp[:, 3] = np.clip(bp[:, 3] * 1.15, 0, 1)
        tex.pixels.foreach_set(bp.ravel())
        tex.pack()


def lashes():
    """Upper eyelashes along each lid margin, curling up and out, longest at the outer corner.
    They carry the face shapes, so they close with a blink."""
    bm = bmesh.new()
    both = np.maximum(np.linalg.norm(FACE['eyeBlinkLeft'], axis=1), np.linalg.norm(FACE['eyeBlinkRight'], axis=1))
    skin_only = np.zeros(len(pos))
    skin_only[body_verts] = 1
    both = both * skin_only
    for sign in (1, -1):
        blink = both * (np.sign(pos[:, 0]) == sign) * (pos[:, 2] > eye_mid[2] - .004)
        side = [i for i in body_verts if blink[i] > .85 * blink.max()]
        print('LID', sign, len(side), float(blink.max()), flush=True)
        centre = np.array(bones['eye.' + ('L' if sign > 0 else 'R')][0])
        xs = np.array([pos[i, 0] for i in side])
        lo, hi = xs.min(), xs.max()
        edge = []
        for b in range(14):
            sel = [i for i, x in zip(side, xs) if lo + (hi - lo) * b / 14 <= x <= lo + (hi - lo) * (b + 1) / 14]
            if sel:
                edge.append(pos[sel].mean(0))
        edge = sorted(edge, key=lambda q: sign * q[0])  # inner corner to outer corner
        rows = []
        for k, p in enumerate(edge):
            t = k / max(1, len(edge) - 1)
            out = p - centre
            out /= np.linalg.norm(out)
            d = out * .85 + np.array([0, 0, 1.]) * .3 + np.array([sign, 0, 0]) * .3 * t
            d /= np.linalg.norm(d)
            length = .0024 + .0022 * np.sin(np.pi * min(1, .25 + t * .85))
            rows.append((bm.verts.new(p - out * .0006), bm.verts.new(p + d * length)))
        for (a0, a1), (b0, b1) in zip(rows, rows[1:]):
            bm.faces.new((a0, b0, b1, a1))
    mesh = bpy.data.meshes.new('Thuan.Lashes')
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new('Thuan.Lashes', mesh)
    bpy.context.scene.collection.objects.link(obj)
    mesh.materials.append(mh.plain_material('Thuan.Lashes', (.02, .015, .015, 1), .6, .1, double=True))
    co = mh.coords(obj)
    obj.shape_key_add(name='Basis')
    for name, delta in FACE.items():
        moved = co.copy()
        for i, p in enumerate(co):
            idx, w = mh.weighted(brow_tree, p, 3)
            moved[i] = p + (w[:, None] * delta[idx]).sum(0)
        obj.shape_key_add(name=name, from_mix=False).data.foreach_set('co', moved.ravel())
    print('LASHES', len(mesh.vertices), flush=True)
    return obj


objs['Lashes'] = lashes()
full.data.attributes.remove(full.data.attributes['town_kind'])

# Her hair, built to her head: a close surface of strands from a side part, a soft hairline
# over the forehead and the tops of her ears, gathered behind them into two plaits. Its UVs
# run along the strands, so a strand texture and a shine ring follow the hair the way they
# do on the real thing.
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
CLEAR = .008


# A smooth egg-shaped shell around the skull; the walk below only pushes out where the
# skull itself reaches further, so the crown reads as one smooth volume of hair.
# Measured above the ears, or the sides stand out like a helmet.
top = head_pts[head_pts[:, 2] > eye_mid[2] + .03] - HC
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


nape_z = bones['neck01'][0][2] + .01
# The locks spring from a side part over her left brow, not from the top of her head, so they
# sweep off it the way combed hair does: the pole of the walk is tilted towards the part.
_pole = np.array([.42, -.2, 1.])
_pole /= np.linalg.norm(_pole)
_ax = np.cross([0, 0, 1.], _pole)
_ang = np.arcsin(np.linalg.norm(_ax))
_ax /= np.linalg.norm(_ax)
_K = np.array([[0, -_ax[2], _ax[1]], [_ax[2], 0, -_ax[0]], [-_ax[1], _ax[0], 0]])
PART_TILT = np.eye(3) + np.sin(_ang) * _K + (1 - np.cos(_ang)) * _K @ _K
N_AROUND, N_ALONG = 88, 44


def hairline_at(p):
    """How low her hair reaches at this point of the head: a soft line across the forehead,
    over the tops of her ears, down behind them to the nape, where it is gathered."""
    ab = abs(np.degrees(np.arctan2(p[0] - HC[0], p[1] - HC[1])))  # 0 behind, 180 the forehead
    temple = eye_mid[2] + .028
    if ab >= 118:
        f = min(1, (ab - 118) / 50)
        return eye_mid[2] + .032 + .034 * f * f * (3 - 2 * f)
    if ab >= 95:
        return temple
    if ab >= 82:
        f = (ab - 82) / 13
        return nape_z * (1 - f) + temple * f
    # Behind the ears it is gathered low, into the plaits.
    return nape_z


curves = []
for k in range(N_AROUND):
    phi = -np.pi + 2 * np.pi * k / N_AROUND
    pts = []
    for e in np.radians(np.linspace(84, -60, 90)):
        d = PART_TILT @ np.array([np.sin(phi) * np.cos(e), np.cos(phi) * np.cos(e), np.sin(e)])
        p = onto(HC, d)
        if e > 0:
            # A little more volume towards the crown.
            p = HC + d * max(np.linalg.norm(p - HC), shell_radius(d) + .003 * np.clip(e / np.radians(55), 0, 1))
        if p[2] < hairline_at(p):
            break
        pts.append(p)
    pts = np.array(pts)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    curves.append((pts, np.concatenate([[0], np.cumsum(seg)])))

# Every lock sampled at the same lengths from the crown, so neighbours match strand for strand;
# a short lock simply ends, and no sheet is stretched from the hairline to the shoulders.
S_AT = np.linspace(0, max(arc[-1] for _, arc in curves), N_ALONG)
G = np.zeros((N_AROUND, N_ALONG, 3))
valid = np.zeros((N_AROUND, N_ALONG), bool)
for k, (pts, arc) in enumerate(curves):
    at = np.minimum(S_AT, arc[-1])
    G[k] = np.array([np.interp(at, arc, pts[:, j]) for j in range(3)]).T
    valid[k] = np.concatenate([[True], S_AT[:-1] < arc[-1]])
last = valid.sum(1) - 1


def clamp_tails():
    for k in range(N_AROUND):
        G[k, last[k] + 1:] = G[k, last[k]]


# Smooth the sheet along and across the strands (the ray walk lands on single vertices,
# which reads as lumps), then lift anything the smoothing pulled into the skin.
inner = valid[:, 2:]
tip_rows = np.arange(N_ALONG)[None, :] >= last[:, None]
for _ in range(24):
    along = G.copy()
    along[:, 1:-1] = np.where(inner[..., None], (G[:, :-2] + 2 * G[:, 1:-1] + G[:, 2:]) / 4, G[:, 1:-1])
    wp, wn = np.roll(valid, 1, 0)[..., None] & valid[..., None], np.roll(valid, -1, 0)[..., None] & valid[..., None]
    across = (np.roll(along, 1, 0) * wp + 2 * along + np.roll(along, -1, 0) * wn) / (2 + wp + wn)
    across[:, 0] = along[:, 0]
    # The tips stay where their own lock ends, or the hairline bunches into steps.
    G = np.where(tip_rows[..., None], along, across)
    clamp_tails()
for k in range(N_AROUND):
    for i in range(last[k] + 1):
        radial = G[k, i] - HC
        radial /= np.linalg.norm(radial)
        out = radial if G[k, i][2] > nape_z else np.array([.3 * radial[0], max(.2, radial[1]), 0.]) / np.linalg.norm([.3 * radial[0], max(.2, radial[1])])
        for _ in range(12):
            if wear_dist(G[k, i]) >= CLEAR - .0015:
                break
            G[k, i] = G[k, i] + out * .0015
# Where the hair meets the skin it grows out of it: no rim, it thins to nothing.
for k in range(N_AROUND):
    for n in range(7):
        i = last[k] - n
        if i < 1:
            break
        loc, normal, _, _ = skin_bvh.find_nearest(Vector(G[k, i]))
        w = ((7 - n) / 7) ** 1.5
        G[k, i] = G[k, i] * (1 - w) + (np.array(loc) + np.array(normal) * .0012) * w
# A clear side part over her left brow, from the hairline back to the top of her head: the
# hair lies close to the scalp beside it and leaves a fine line of scalp between.
PART_X, PART_Y_END, PART_GAP = .03, HC[1] + .005, .0024


def in_part(p):
    return p[1] < PART_Y_END and p[2] > eye_mid[2] + .04


for k in range(N_AROUND):
    for i in range(last[k] + 1):
        p = G[k, i]
        if not in_part(p):
            continue
        dx = p[0] - PART_X
        w = np.clip(1 - abs(dx) / .018, 0, 1) * np.clip((PART_Y_END - p[1]) / .012, 0, 1)
        w = w * w * (3 - 2 * w)
        loc, normal, _, _ = skin_bvh.find_nearest(Vector(p))
        G[k, i] = p * (1 - w) + (np.array(loc) + np.array(normal) * .0016) * w
        if abs(dx) < PART_GAP * 2.8:
            G[k, i][0] = PART_X + (PART_GAP if dx >= 0 else -PART_GAP)
clamp_tails()


def across_part(vs):
    xs = [v.co.x - PART_X for v in vs]
    return min(xs) < 0 < max(xs) and all(in_part(np.array(v.co)) for v in vs)


bm = bmesh.new()
uv_layer = bm.loops.layers.uv.new('UVMap')
grid = [[bm.verts.new(G[k, i]) if valid[k, i] else None for i in range(N_ALONG)] for k in range(N_AROUND)]
crown = bm.verts.new(G[:, 0].mean(0) + np.array([0, 0, .002]))
LEN = .62  # metres of strand per texture repeat
for k in range(N_AROUND):
    k2 = (k + 1) % N_AROUND
    u0, u1 = k / N_AROUND * 6, (k + 1) / N_AROUND * 6
    if not across_part((crown, grid[k2][0], grid[k][0])):
        f = bm.faces.new((crown, grid[k2][0], grid[k][0]))
        for loop, uv in zip(f.loops, [((u0 + u1) / 2, 0), (u1, 0), (u0, 0)]):
            loop[uv_layer].uv = uv
    for i in range(N_ALONG - 1):
        a0, b0, b1, a1 = grid[k][i], grid[k2][i], grid[k2][i + 1], grid[k][i + 1]
        if a0 is None or b0 is None:
            break
        corners = [(v, uv) for v, uv in ((a0, (u0, S_AT[i] / LEN)), (b0, (u1, S_AT[i] / LEN)),
                                         (b1, (u1, S_AT[i + 1] / LEN)), (a1, (u0, S_AT[i + 1] / LEN))) if v is not None]
        if len(corners) < 3:
            break
        if across_part([v for v, _ in corners]):
            continue
        f = bm.faces.new([v for v, _ in corners])
        for loop, (_, uv) in zip(f.loops, corners):
            loop[uv_layer].uv = uv
    # Where a lock ends beside a longer one (along the hairline, and at the temples), a short
    # fan from its tip closes the notch; below that the longer lock hangs free.
    lo, hi = (k, k2) if last[k] < last[k2] else (k2, k)
    if last[hi] > last[lo]:
        tip, uo, uh = grid[lo][last[lo]], (u0 if lo == k else u1), (u0 if hi == k else u1)
        for i in range(last[lo] + 1, min(last[hi], last[lo] + 4)):
            tri = [tip, grid[hi][i], grid[hi][i + 1]] if hi == k2 else [tip, grid[hi][i + 1], grid[hi][i]]
            if across_part(tri):
                continue
            uvs = [(uo, S_AT[last[lo]] / LEN)] + ([(uh, S_AT[i] / LEN), (uh, S_AT[i + 1] / LEN)] if hi == k2 else [(uh, S_AT[i + 1] / LEN), (uh, S_AT[i] / LEN)])
            try:
                f = bm.faces.new(tri)
            except ValueError:
                continue
            for loop, uv in zip(f.loops, uvs):
                loop[uv_layer].uv = uv


# Two plaits, gathered behind her ears and brought forward over her shoulders, down the front
# of her top, tied in white with a short brushed end. Each is a column of plump, tilted lobes,
# alternating side to side the way the three strands cross, so the ink draws the chevrons of a
# real plait rather than a tangle of thin tubes.


def front_y(x, z, clear):
    near = wear_pts[(np.abs(wear_pts[:, 0] - x) < .02) & (np.abs(wear_pts[:, 2] - z) < .02)]
    return (near[:, 1].min() if len(near) else eye_mid[1]) - clear


def away_from_body(p):
    best = None
    for bvh in (skin_bvh, suit_bvh):
        loc, normal, _, d = bvh.find_nearest(Vector(p))
        if best is None or d < best[1]:
            best = (np.array(loc), d, np.array(normal))
    loc, d, normal = best
    out = (p - loc) / d if d > 1e-6 else normal
    return loc, d, out


def braid(sign):
    s_ = 'L' if sign > 0 else 'R'
    shoulder = bones['clavicle.' + s_][1]
    x = sign * .086
    ctrl = [np.array([sign * .052, HC[1] + .034, eye_mid[2] - .058]),
            np.array([sign * .068, HC[1] + .012, nape_z - .03]),
            np.array([x, bones['neck01'][0][1] - .005, shoulder[2] + .035]),
            np.array([x, front_y(x, shoulder[2] - .01, .018), shoulder[2] - .02])]
    # Down over her chest, drawing in a little towards the end.
    for j, z in enumerate(np.linspace(shoulder[2] - .06, waist_z + .11, 5)):
        xz = x - sign * .012 * j / 4
        ctrl.append(np.array([xz, front_y(xz, z, .02), z]))
    ctrl = np.array(ctrl)
    pts = []
    for i in range(len(ctrl) - 1):
        p0, p1, p2, p3 = ctrl[max(i - 1, 0)], ctrl[i], ctrl[i + 1], ctrl[min(i + 2, len(ctrl) - 1)]
        for t in np.linspace(0, 1, 12, endpoint=False):
            pts.append(.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    pts.append(ctrl[-1])
    pts = np.array(pts)
    arc = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])
    n = 140
    at = np.linspace(0, arc[-1], n)
    path = np.array([np.interp(at, arc, pts[:, k]) for k in range(3)]).T
    L = arc[-1]
    radius = lambda s: .0135 * (1 - .3 * s / L) * (.78 + .22 * min(1, s / .02))
    # Clear of her neck, shoulder and top by its own thickness, then smoothed.
    for _ in range(4):
        for i in range(n):
            loc, d, out = away_from_body(path[i])
            need = radius(at[i]) + .003
            if d < need:
                path[i] = loc + out * need
        path[1:-1] = (path[:-2] + 2 * path[1:-1] + path[2:]) / 4
    tangent = np.gradient(path, axis=0)
    tangent /= np.linalg.norm(tangent, axis=1)[:, None]
    point = lambda s: np.array([np.interp(s, at, path[:, k]) for k in range(3)])
    tang = lambda s: (lambda v: v / np.linalg.norm(v))(np.array([np.interp(s, at, tangent[:, k]) for k in range(3)]))

    def frame(s):
        t = tang(s)
        _, _, out = away_from_body(point(s))
        side = np.cross(t, out)
        side /= np.linalg.norm(side)
        return t, side, np.cross(side, t)

    def lobe(centre, axes, radii, segs=(10, 7)):
        # The axes are the columns of the 3x3 block.
        m3 = np.array([axes[0] * radii[0], axes[1] * radii[1], axes[2] * radii[2]]).T
        m = Matrix([list(m3[0]) + [centre[0]], list(m3[1]) + [centre[1]], list(m3[2]) + [centre[2]], [0, 0, 0, 1]])
        return bmesh.ops.create_uvsphere(bm, u_segments=segs[0], v_segments=segs[1], radius=1., matrix=m, calc_uvs=True)

    s_tie = L - .045
    # A rounder knot where the hair is gathered, over the join with the hair on her head.
    t, side, depth = frame(0.)
    lobe(point(0.) + t * .004, (side, depth, t), (radius(0) * 1.35, radius(0) * 1.05, radius(0) * 1.4))
    s, j = .008, 0
    while s < s_tie - .006:
        t, side, depth = frame(s)
        r = radius(s) * (1 - .3 * np.clip((s - (s_tie - .03)) / .03, 0, 1))
        alt = 1 if j % 2 else -1
        long = t - alt * .75 * side
        long /= np.linalg.norm(long)
        wide = np.cross(depth, long)
        wide /= np.linalg.norm(wide)
        # Lobes set well out to either side, so even far off the plait's edge is scalloped.
        lobe(point(s) + side * alt * .44 * r + depth * .12 * r, (wide, np.cross(long, wide), long), (.68 * r, .52 * r, 1.3 * r))
        s += .74 * r
        j += 1
    # The tie, and the brushed end below it.
    t, side, depth = frame(s_tie)
    rt = radius(s_tie) * .85
    ring = lambda c, rad: [bm.verts.new(c + rad * (np.cos(a) * side + np.sin(a) * depth)) for a in np.linspace(0, 2 * np.pi, 14, endpoint=False)]
    rings = [ring(point(s_tie) + t * dz, rt * f) for dz, f in ((-.005, .92), (0, 1.08), (.005, .92))]
    for ra, rb in zip(rings, rings[1:]):
        for q in range(14):
            f = bm.faces.new((ra[q], ra[(q + 1) % 14], rb[(q + 1) % 14], rb[q]))
            f.material_index = 1
    rng_b = np.random.default_rng(3 + sign)
    prof = [(.004, .75), (.012, 1.05), (.022, 1.12), (.032, .85), (.04, .4)]
    rings = [ring(point(s_tie + dz), rt * f) for dz, f in prof]
    tip = [bm.verts.new(point(s_tie + .044) + rt * .35 * (np.cos(a) * side + np.sin(a) * depth) * rng_b.uniform(.2, 1.4) + t * rng_b.uniform(-.004, .004))
           for a in np.linspace(0, 2 * np.pi, 14, endpoint=False)]
    rings.append(tip)
    for i, (ra, rb) in enumerate(zip(rings, rings[1:])):
        for q in range(14):
            f = bm.faces.new((ra[q], ra[(q + 1) % 14], rb[(q + 1) % 14], rb[q]))
            for loop, uv in zip(f.loops, [(q / 14, i / 12), ((q + 1) / 14, i / 12), ((q + 1) / 14, (i + 1) / 12), (q / 14, (i + 1) / 12)]):
                loop[uv_layer].uv = uv
    print('BRAID', s_, 'length', round(float(L), 3), 'lobes', j, flush=True)


braid(1)
braid(-1)
for f in bm.faces:
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
hair_mesh.materials.append(mh.plain_material('Thuan.HairTie', (.95, .94, .9, 1), .6))
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
