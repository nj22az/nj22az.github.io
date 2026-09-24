"""Thuan, the Sakura shopkeeper, rebuilt on the same skeleton as Johansson.

Blender 4.2 LTS. Stage one of two (animate-johansson.py --character thuan is the second):

  python tools/blender/build-thuan.py -- --mpfb /path/to/mpfb2/src/mpfb --root "$PWD"

She starts from the Yui source (art/characters/yui/yui.blend), the MakeHuman build of the
shopkeeper: phenotype, face targets, the fitted suit and loafers. Her look follows a
reference photograph supplied by the user (nothing from it is embedded): a slimmer oval face
with a narrow chin, warm brown eyes and rosy lips; black hair pulled back into two long
three-strand braids with white ties, built here procedurally; a mustard-yellow short-sleeved
top over a navy skirt. Underneath: MPFB's 163-bone default skeleton (fingers, toes, jaw,
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
          'eyes/l-eye-scale-incr': .2, 'eyes/r-eye-scale-incr': .2, 'nose/nose-scale-horiz-decr': .22, 'nose/nose-point-width-decr': .3,
          'nose/nose-volume-decr': .18, 'mouth/mouth-upperlip-volume-incr': .4, 'mouth/mouth-lowerlip-volume-incr': .35,
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
# Her look now: no beret, glasses, collar or bow -- two braids with white ties instead.
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

# The suit becomes a yellow short-sleeved top over a navy skirt, split at the waist.
waist_z = (bones['spine04'][0][2] + bones['spine05'][0][2]) / 2
yellow = mh.plain_material('Thuan.Top', (.74, .63, .17, 1), .75, .2)
navy = mh.plain_material('Thuan.Skirt', (.1, .13, .24, 1), .75, .2)
suit.data.materials.clear()
suit.data.materials.append(yellow)
suit.data.materials.append(navy)
for poly in suit.data.polygons:
    poly.material_index = 1 if poly.center[2] < waist_z else 0

# Hair pulled back from the face into two braids: the long loose hair goes, and a close
# cap over the scalp (built below, once the skin is painted) carries the hairline.
bpy.data.objects.remove(objs.pop('long01'), do_unlink=True)
import bmesh


def surface_front(x, z, clearance):
    """The y just in front of the body skin at (x, z); Blender -Y is her front."""
    near = [i for i in body_verts if abs(pos[i, 0] - x) < .02 and abs(pos[i, 2] - z) < .02]
    return (min(pos[i, 1] for i in near) if near else eye_mid[1]) - clearance


def braid(sign, name):
    """A three-strand plait from behind the ear, over the front of the shoulder, down to the waist."""
    ear = np.array([sign * .062, eye_mid[1] + .07, eye_mid[2] - .035])
    shoulder = bones['clavicle.' + ('L' if sign > 0 else 'R')][1]
    x = sign * .085
    ctrl = [ear, np.array([sign * .075, eye_mid[1] + .06, bones['neck01'][0][2] + .01]),
            np.array([x, bones['neck01'][0][1] + .005, shoulder[2] + .045]),
            np.array([x, surface_front(x, shoulder[2] - .01, .02), shoulder[2] - .015])]
    for z in np.linspace(shoulder[2] - .06, waist_z + .02, 6):
        ctrl.append(np.array([x, surface_front(x, z, .02), z]))
    ctrl = np.array(ctrl)
    # Catmull-Rom through the control points, then resampled evenly.
    pts = []
    for i in range(len(ctrl) - 1):
        p0, p1, p2, p3 = ctrl[max(i - 1, 0)], ctrl[i], ctrl[i + 1], ctrl[min(i + 2, len(ctrl) - 1)]
        for t in np.linspace(0, 1, 12, endpoint=False):
            pts.append(.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    pts.append(ctrl[-1])
    pts = np.array(pts)
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    arc = np.concatenate([[0], np.cumsum(seg)])
    n = 150
    at = np.linspace(0, arc[-1], n)
    path = np.array([np.interp(at, arc, pts[:, k]) for k in range(3)]).T
    # Keep the whole plait clear of the skin under it.
    for i, p in enumerate(path):
        _, j, d = face_tree.find(p)
        if d < .016:
            path[i] = pos[j] + (p - pos[j]) / max(d, 1e-5) * .016
    tangent = np.gradient(path, axis=0)
    tangent /= np.linalg.norm(tangent, axis=1)[:, None]
    bm = bmesh.new()
    rings = []
    length = arc[-1]
    for k in range(3):
        strand = []
        for i, (p, t) in enumerate(zip(path, tangent)):
            u = i / (n - 1)
            side = np.cross(t, [0, 1, 0])
            side /= max(np.linalg.norm(side), 1e-6)
            depth = np.cross(side, t)
            phase = at[i] / .022 * np.pi + k * 2 * np.pi / 3
            width = .0062 * (1 - .4 * u) * (1 if u > .05 else .6 + 8 * u)
            centre = p + side * np.sin(phase) * width + depth * np.sin(2 * phase) * width * .3
            r = .0072 * (1 - .38 * u) * (1 if u > .04 else .5 + 12.5 * u)
            ring = [bm.verts.new(centre + r * (np.cos(a) * side + np.sin(a) * depth)) for a in np.linspace(0, 2 * np.pi, 7, endpoint=False)]
            strand.append(ring)
        for a, b in zip(strand, strand[1:]):
            for q in range(7):
                bm.faces.new((a[q], a[(q + 1) % 7], b[(q + 1) % 7], b[q]))
        rings.append(strand)
    # A white hair tie a little above the end, and a short loose brush below it.
    tie_at = int(n * .9)
    hair_faces = len(bm.faces)
    p, t = path[tie_at], tangent[tie_at]
    side = np.cross(t, [0, 1, 0]); side /= np.linalg.norm(side); depth = np.cross(side, t)
    tie = [[bm.verts.new(p + t * dz + .0085 * (np.cos(a) * side + np.sin(a) * depth)) for a in np.linspace(0, 2 * np.pi, 10, endpoint=False)] for dz in (-.006, .006)]
    for q in range(10):
        bm.faces.new((tie[0][q], tie[0][(q + 1) % 10], tie[1][(q + 1) % 10], tie[1][q]))
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    mesh.materials.append(braid_mat)
    mesh.materials.append(tie_mat)
    for poly in mesh.polygons:
        poly.material_index = 1 if poly.index >= hair_faces else 0
        poly.use_smooth = True
    print('BRAID', name, 'length', round(float(length), 3), 'verts', len(mesh.vertices), flush=True)
    return obj


braid_mat = mh.plain_material('Thuan.Braid', (.022, .018, .016, 1), .6, .25)
tie_mat = mh.plain_material('Thuan.HairTie', (.95, .94, .9, 1), .6)
objs['BraidL'] = braid(1, 'Thuan.BraidL')
objs['BraidR'] = braid(-1, 'Thuan.BraidR')
limb_b = mh.dominant(body, bones)
frac_b = mh.along(pos, limb_b, segs)
bare = ((np.char.startswith(limb_b, 'fore') | np.char.startswith(limb_b, 'hand')) | (np.char.startswith(limb_b, 'arm') & (frac_b > .4)))
# Without the collar the neckline shows: keep all of the neck and head skin.
bare |= np.char.startswith(limb_b, 'neck') | (limb_b == 'head')
keep = np.zeros(len(pos), dtype=bool)
keep[body_verts] = visible_on_yui[body_verts] | bare[body_verts]
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
    under_cap = np.array([cap_tree.find(p)[2] < .0085 for p in co])
    for poly in mesh.polygons:
        if not all(under_cap[v] for v in poly.vertices):
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
    lips = pucker > pucker.max() * .6
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
        rose = np.array([.74, .36, .38])
        px[..., :3] = px[..., :3] * (1 - .55 * mask[..., None]) + rose * .55 * mask[..., None]
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
hair_cap_mat = mh.plain_material('Thuan.Hair', (.02, .016, .014, 1), .72, .15)
# From the visible skin only: the full mesh also carries MakeHuman's hidden helper shells.
from mathutils import Vector


def scalp_broad(c):
    dz, dy, ax = c[2] - eye_mid[2], c[1] - eye_mid[1], abs(c[0])
    ear = ax > .058 and -.05 < dz < .04 and dy < .075
    return ax < .12 and not ear and ((dy > .07 and dz > -.085) or (dy > .03 and dz > -.04) or dz > .015)


E = Vector(eye_mid)
front = lambda c: c.y < E.y + .03
hairline = [(E + Vector((0, 0, .043)), Vector((0, -.3, -1)).normalized(), front)]
for sgn in (1, -1):
    hairline.append((E + Vector((sgn * .052, .012, .012)), Vector((sgn * .15, -1, -.55)).normalized(), lambda c, s=sgn: s * c.x > .035 and c.y < E.y + .06))
objs['HairCap'] = mh.shell(body, 'Thuan.HairCap', scalp_broad, .0055, hair_cap_mat, cuts=hairline)
# Darken only the skin the cap covers, so no painted edge shows below the hairline.
cap_co = mh.coords(objs['HairCap'])
cap_tree = mh.tree(cap_co, range(len(cap_co)))
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

# Skin everything from the body beneath it; the rigid bits ride the head or the eyes.
for name, obj in objs.items():
    if name == 'low-poly':
        mh.reweight(obj, rig, weight_tree, vertex_weights, rigid=lambda p: 'eye.L' if p[0] > 0 else 'eye.R')
    elif name.startswith(('Glasses', 'CreamBeret', 'Ribbon')):
        mh.reweight(obj, rig, weight_tree, vertex_weights, rigid=lambda p: 'head')
    else:
        mh.reweight(obj, rig, weight_tree, vertex_weights)
for obj in (body, under, swimsuit):
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
      'SWIM', len(swimsuit.data.vertices), 'OBJECTS', sorted(o.name for o in bpy.data.objects if o.name.startswith('Thuan.')), flush=True)
out_dir = root / 'art/characters/thuan'
out_dir.mkdir(parents=True, exist_ok=True)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(out_dir / 'thuan.blend'), compress=True)
print('SAVED', out_dir / 'thuan.blend', flush=True)
