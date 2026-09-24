"""Thuan, the Sakura shopkeeper, rebuilt on the same skeleton as Johansson.

Blender 4.2 LTS. Stage one of two (animate-johansson.py --character thuan is the second):

  python tools/blender/build-thuan.py -- --mpfb /path/to/mpfb2/src/mpfb --root "$PWD"

Her look comes from the Yui source (art/characters/yui/yui.blend), the MakeHuman build of
the same pink-and-cream shopkeeper: her phenotype and face targets, the fitted suit and
skirt, loafers, long black hair, rose glasses, cream beret, collar, tie and ribbons. What
changes is underneath: MPFB's 163-bone default skeleton (fingers, toes, jaw, eyes) in place
of the 53-bone game rig, face shapes named the ARKit way so her face controller drives
them, puff-short sleeves, and a one-piece swimsuit over the skin the clothes cover, for the
family bath at Umi-no-yu.
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

objs = {o.name[4:]: o for o in bpy.data.objects if o.name.startswith('Yui.') and o.name != 'Yui.Body'}
for name, obj in objs.items():
    obj.name = 'Thuan.' + name
suit = objs['female_elegantsuit01']
for obj in objs.values():
    bpy.context.view_layer.objects.active = obj
    for mod in list(obj.modifiers):
        if mod.type == 'DECIMATE':
            bpy.ops.object.modifier_apply(modifier=mod.name)

# Puff sleeves: the jacket cut a little above the elbow; the arms show below.
mh.trim(suit, {'arm.' + s: (.46, ['fore.' + s, 'hand.' + s]) for s in 'LR'}, bones, segs)
limb_b = mh.dominant(body, bones)
frac_b = mh.along(pos, limb_b, segs)
bare = ((np.char.startswith(limb_b, 'fore') | np.char.startswith(limb_b, 'hand')) | (np.char.startswith(limb_b, 'arm') & (frac_b > .4)))
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
        c = co[list(poly.vertices)].mean(0)
        dz, dy = c[2] - eye[2], c[1] - eye[1]
        if not ((dz > .045) or (dy > .04 and dz > -.07)) or abs(c[0]) > .11 or dz < -.09:
            continue
        pts = uv[list(poly.loop_indices)]
        x0, y0 = np.floor(pts.min(0)).astype(int)
        x1, y1 = np.ceil(pts.max(0)).astype(int)
        mask[max(0, y0):min(H, y1 + 1), max(0, x0):min(W, x1 + 1)] = 1
    soft = mask.copy()
    for _ in range(3):
        soft = np.maximum(soft, (np.roll(soft, 1, 0) + np.roll(soft, -1, 0) + np.roll(soft, 1, 1) + np.roll(soft, -1, 1)) / 4 * .9)
    rng = np.random.default_rng(1997)
    strands = .06 + .05 * np.abs(np.sin(np.arange(W)[None, :] * .9 + rng.normal(0, .6, (H, 1))))
    hair = np.stack([strands * .8, strands * .72, strands * .7], -1)
    px[..., :3] = px[..., :3] * (1 - soft[..., None]) + hair * soft[..., None]
    image.pixels.foreach_set(px.ravel())
    image.pack()


paint_scalp()
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
