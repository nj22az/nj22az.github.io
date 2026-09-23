"""Johansson, the player: a bald, hairy Swede in a kariyushi shirt and khaki shorts.

Blender 4.2 LTS. Stage one of two: this builds the body, face shapes, clothes and skin and
saves art/characters/johansson/johansson.blend; animate-johansson.py adds the actions and
exports the runtime GLB.

  python tools/blender/build-johansson.py -- --mpfb /path/to/mpfb2/src/mpfb --root "$PWD"

The body is a fresh MakeHuman base (MPFB, CC0 assets) with the full 163-bone default skeleton:
five fingers with metacarpals, five toes, jaw, tongue, eyes, lids and lips. The expression
units become shape keys on the body and brows. Clothes and shoes are Kenji's already-fitted
CC0 garments (art/characters/kenji/kenji.blend), moved onto Johansson's frame, with the
sleeves cut short and the jeans cut to shorts so the arms and legs show. Body hair, beard and
the shaved horseshoe around the bald crown are painted into the skin texture stroke by stroke.
"""
import bpy, sys, os, shutil, importlib, argparse, math, random
from pathlib import Path
import numpy as np
from mathutils import Vector, kdtree

parser = argparse.ArgumentParser()
parser.add_argument('--mpfb', required=True)
parser.add_argument('--root', required=True)
parser.add_argument('--preview', default='')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
root = Path(args.root).resolve()
rng = np.random.default_rng(1997)
random.seed(1997)

# Kenji's source scene brings the fitted garments and their packed textures.
bpy.ops.wm.open_mainfile(filepath=str(root / 'art/characters/kenji/kenji.blend'))
KEEP = ['Kenji.male_casualsuit01', 'Kenji.shoes01', 'Kenji.low-poly', 'Kenji.eyebrow001', 'Kenji.Body']
for obj in list(bpy.data.objects):
    if obj.type == 'MESH' and obj.name in KEEP:
        obj.parent = None
        obj.matrix_world.identity()  # Kenji's objects carry a 1.174 scale; their mesh data is in MPFB space.
        for mod in list(obj.modifiers):
            if mod.type == 'ARMATURE':
                obj.modifiers.remove(mod)
    elif obj.type in ('MESH', 'ARMATURE'):
        bpy.data.objects.remove(obj, do_unlink=True)
for action in list(bpy.data.actions):
    bpy.data.actions.remove(action)

repo_path = '/tmp/town-blender-extensions'
os.makedirs(repo_path, exist_ok=True)
if not os.path.exists(repo_path + '/mpfb'):
    shutil.copytree(args.mpfb, repo_path + '/mpfb')
bpy.ops.preferences.extension_repo_add(name='town_authoring', use_custom_directory=True, custom_directory=repo_path, type='LOCAL')
repo = next(r for r in bpy.context.preferences.extensions.repos if r.directory == repo_path)
module = 'bl_ext.' + repo.module + '.mpfb'
bpy.ops.preferences.addon_enable(module=module)
HumanService = importlib.import_module(module + '.services.humanservice').HumanService
TargetService = importlib.import_module(module + '.services.targetservice').TargetService
UNITS = Path(repo_path) / 'mpfb/data/targets/expression/units/caucasian'


def coords(obj, key=None):
    n = len(obj.data.vertices)
    a = np.zeros(n * 3, dtype=np.float64)
    (obj.data.shape_keys.key_blocks[key].data if key else obj.data.vertices).foreach_get('co', a)
    return a.reshape(-1, 3)


def mixed(obj):
    obj.shape_key_add(name='__mix', from_mix=True)
    a = coords(obj, '__mix')
    obj.shape_key_remove(obj.data.shape_keys.key_blocks['__mix'])
    return a


def group_members(obj, names):
    index = {obj.vertex_groups[n].index for n in names if n in obj.vertex_groups}
    return np.array([v.index for v in obj.data.vertices if any(g.group in index and g.weight > .5 for g in v.groups)], dtype=int)


def tree(points, indices):
    t = kdtree.KDTree(len(indices))
    for i in indices:
        t.insert(points[i], int(i))
    t.balance()
    return t


def weighted(t, p, k=6):
    found = t.find_n(p, k)
    w = np.array([1 / (d + 1e-4) ** 2 for _, _, d in found])
    return [i for _, i, _ in found], w / w.sum()


# Kenji's frame, as MPFB builds it; the garments were fitted to exactly this shape.
KENJI = {'age': .35, 'gender': 1., 'height': .5, 'muscle': .56, 'weight': .47, 'proportions': .52, 'cupsize': .5, 'firmness': .5,
         'race': {'asian': 1., 'caucasian': 0., 'african': 0.}}
human_a = HumanService.create_human(macro_detail_dict=KENJI)
pos_a = mixed(human_a)
bpy.data.objects.remove(human_a, do_unlink=True)

# Johansson: a Swede in his sixties, tall, broad, soft round the middle.
JOHANSSON = {'age': .8, 'gender': 1., 'height': .56, 'muscle': .5, 'weight': .66, 'proportions': .55, 'cupsize': .5, 'firmness': .5,
             'race': {'asian': 0., 'caucasian': 1., 'african': 0.}}
body = HumanService.create_human(macro_detail_dict=JOHANSSON)
body.name = 'Johansson.Body'
FACE = {
    'blinkL': ['eye-left-closure'], 'blinkR': ['eye-right-closure'],
    'squint': ['eye-left-slit', 'eye-right-slit'], 'eyesWide': ['eye-left-opened-up', 'eye-right-opened-up'],
    'browUp': ['eyebrows-left-up', 'eyebrows-right-up'], 'browDown': ['eyebrows-left-down', 'eyebrows-right-down'],
    'browSad': ['eyebrows-left-inner-up', 'eyebrows-right-inner-up'],
    'jawOpen': ['mouth-open'], 'smile': ['mouth-corner-puller'], 'frown': ['mouth-depression'],
    'pucker': ['mouth-pursing'], 'mouthWide': ['mouth-retraction'], 'lipsPress': ['mouth-compression'],
    'sneer': ['nose-left-elevation', 'nose-right-elevation'], 'lipUp': ['mouth-elevation'],
}
unit_names = sorted({u for units in FACE.values() for u in units})
for unit in unit_names:
    TargetService.load_target(body, str(UNITS / (unit + '.target.gz')), weight=0.0, name='unit.' + unit)
keys = body.data.shape_keys.key_blocks
base_co = coords(body, keys[0].name)
unit_delta = {u: coords(body, 'unit.' + u) - base_co for u in unit_names}
for u in unit_names:
    body.shape_key_remove(keys['unit.' + u])
# His face, after the reference photograph: broad and round, full cheeks settling into jowls
# and a soft double chin, a big fleshy nose, thin lips turned down a touch, hooded deep-set
# eyes under a heavy brow, a high forehead.
FEATURES = {
    'head/head-round': .45, 'head/head-fat-incr': .55, 'head/head-scale-horiz-incr': .22, 'head/head-age-incr': .7,
    'cheek/l-cheek-volume-incr': .65, 'cheek/r-cheek-volume-incr': .65, 'cheek/l-cheek-trans-down': .45, 'cheek/r-cheek-trans-down': .45,
    'cheek/l-cheek-bones-decr': .3, 'cheek/r-cheek-bones-decr': .3,
    'chin/chin-width-incr': .45, 'chin/chin-prominent-decr': .25, 'chin/chin-height-decr': .15, 'neck/neck-double-incr': .8,
    'nose/nose-volume-incr': .5, 'nose/nose-scale-vert-incr': .3, 'nose/nose-point-width-incr': .55, 'nose/nose-flaring-incr': .35,
    'nose/nose-base-down': .2, 'nose/nose-hump-incr': .2,
    'mouth/mouth-upperlip-volume-decr': .5, 'mouth/mouth-lowerlip-volume-decr': .25, 'mouth/mouth-angles-up': .1,
    'mouth/mouth-laugh-lines-out': .6, 'mouth/mouth-scale-horiz-incr': .1,
    'eyes/l-eye-bag-incr': .55, 'eyes/r-eye-bag-incr': .55, 'eyes/l-eye-eyefold-down': .35, 'eyes/r-eye-eyefold-down': .35,
    'eyes/l-eye-scale-decr': .25, 'eyes/r-eye-scale-decr': .25, 'eyes/l-eye-height2-decr': .3, 'eyes/r-eye-height2-decr': .3,
    'eyebrows/eyebrows-trans-down': .3, 'eyebrows/eyebrows-trans-forward': .5, 'forehead/forehead-scale-vert-incr': .35,
    'ears/l-ear-scale-incr': .25, 'ears/r-ear-scale-incr': .25,
}
TARGETS = Path(repo_path) / 'mpfb/data/targets'
for target, weight in FEATURES.items():
    path = TARGETS / (target + '.target.gz')
    if path.exists():
        TargetService.load_target(body, str(path), weight=weight, name='feature.' + target.split('/')[-1])
    else:
        print('MISSING TARGET', target, flush=True)
pos_b = mixed(body)
# Bake the macro shape into the mesh; the face shapes stay as keys on top of it.
body.shape_key_add(name='__mix', from_mix=True)
for block in list(body.data.shape_keys.key_blocks):
    if block.name != '__mix':
        body.shape_key_remove(block)
body.shape_key_remove(body.data.shape_keys.key_blocks['__mix'])
body.data.vertices.foreach_set('co', pos_b.ravel())
body.data.update()
for mod in list(body.modifiers):
    body.modifiers.remove(mod)

rig = HumanService.add_builtin_rig(body, 'default')
rig.name = 'Johansson.Rig'
rig.data.name = 'Johansson.Skeleton'
bones = {b.name: (np.array(b.head_local), np.array(b.tail_local)) for b in rig.data.bones}
for mod in list(body.modifiers):
    if mod.type != 'ARMATURE':
        body.modifiers.remove(mod)

# --- Which parts of the base mesh survive -------------------------------------------------
groups = [g.name for g in body.vertex_groups]
body_verts = group_members(body, ['body'])
teeth = group_members(body, ['helper-upper-teeth', 'helper-lower-teeth'])
tongue = group_members(body, ['helper-tongue'])
tights = group_members(body, ['helper-tights'])
eye_l, eye_r = group_members(body, ['helper-l-eye']), group_members(body, ['helper-r-eye'])
kenji_body = bpy.data.objects['Kenji.Body']
kenji_tree = tree(coords(kenji_body), range(len(kenji_body.data.vertices)))
visible_on_kenji = np.array([kenji_tree.find(pos_a[i])[2] < 1e-4 for i in range(len(pos_a))])

LIMBS = {
    'arm.L': ('upperarm01.L', 'upperarm02.L'), 'arm.R': ('upperarm01.R', 'upperarm02.R'),
    'fore.L': ('lowerarm01.L', 'wrist.L'), 'fore.R': ('lowerarm01.R', 'wrist.R'),
    'thigh.L': ('upperleg01.L', 'upperleg02.L'), 'thigh.R': ('upperleg01.R', 'upperleg02.R'),
    'shin.L': ('lowerleg01.L', 'lowerleg02.L'), 'shin.R': ('lowerleg01.R', 'lowerleg02.R'),
    'torso': ('spine05', 'spine01'), 'neck': ('neck01', 'head'),
    'hand.L': ('wrist.L', 'finger3-3.L'), 'hand.R': ('wrist.R', 'finger3-3.R'),
    'foot.L': ('foot.L', 'toe3-3.L'), 'foot.R': ('foot.R', 'toe3-3.R'),
    'hip.L': ('pelvis.L', 'upperleg01.L'), 'hip.R': ('pelvis.R', 'upperleg01.R'),
    'shoulder.L': ('clavicle.L', 'upperarm01.L'), 'shoulder.R': ('clavicle.R', 'upperarm01.R'),
}
SEGMENTS = {k: (bones[a][0], bones[b][1]) for k, (a, b) in LIMBS.items()}
SEGMENTS['head'] = (bones['head'][0], bones['head'][1])


def limb_name(bone):
    side = '.L' if bone.endswith(('.L', '_l')) else '.R' if bone.endswith(('.R', '_r')) else ''
    for prefix, limb in (('upperarm', 'arm'), ('lowerarm', 'fore'), ('wrist', 'hand'), ('hand_', 'hand'), ('finger', 'hand'),
                         ('metacarpal', 'hand'), ('index', 'hand'), ('middle', 'hand'), ('ring', 'hand'), ('pinky', 'hand'),
                         ('thumb', 'hand'), ('upperleg', 'thigh'), ('thigh', 'thigh'), ('lowerleg', 'shin'), ('calf', 'shin'),
                         ('foot', 'foot'), ('toe', 'foot'), ('ball', 'foot'), ('neck', 'neck')):
        if bone.startswith(prefix):
            return limb + side
    if bone.startswith(('spine', 'pelvis', 'clavicle', 'shoulder', 'breast', 'root', 'Root')):
        return 'torso'
    return 'head'


def dominant(obj):
    """The limb each vertex mostly moves with, from its skin weights."""
    names = {g.index: limb_name(g.name) for g in obj.vertex_groups if g.name in bones or '_' in g.name or g.name == 'Root'}
    out = []
    for v in obj.data.vertices:
        best = max(v.groups, key=lambda g: g.weight if g.group in names else -1, default=None)
        out.append(names.get(best.group, 'torso') if best else 'torso')
    return np.array(out)


def along(points, limbs):
    """Fraction along each point's own limb segment."""
    frac = np.zeros(len(points))
    for name in set(limbs):
        if name not in SEGMENTS:
            continue
        a, b = SEGMENTS[name]
        sel = limbs == name
        ab = b - a
        frac[sel] = np.clip(((points[sel] - a) @ ab) / (ab @ ab), 0, 1)
    return frac


def trim(obj, cuts):
    """Cut a garment square across a limb and drop everything beyond: sleeves and shorts."""
    import bmesh
    limbs = dominant(obj)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    layer = bm.verts.layers.int.new('limb')
    names = sorted(set(limbs))
    bm.verts.ensure_lookup_table()
    for v in bm.verts:
        v[layer] = names.index(limbs[v.index]) + 1
    for limb, (fraction, beyond) in cuts.items():
        group = {names.index(n) + 1 for n in [limb] + beyond if n in names} | {0}
        a, b = SEGMENTS[limb]
        normal = (b - a) / np.linalg.norm(b - a)
        faces = [f for f in bm.faces if all(v[layer] in group for v in f.verts)]
        geom = list({e for f in faces for e in f.edges}) + faces + list({v for f in faces for v in f.verts})
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=a + fraction * (b - a), plane_no=normal, clear_outer=True)
        loose = [v for v in bm.verts if not v.link_faces]
        bmesh.ops.delete(bm, geom=loose, context='VERTS')
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


# Clothes move from Kenji's frame onto Johansson's, following the nearest base vertices.
fit_tree = tree(pos_a, np.concatenate([body_verts, tights]))
brow_tree = tree(pos_a, body_verts)
weight_tree = tree(pos_b, body_verts)
bone_groups = {g.index: g.name for g in body.vertex_groups if g.name in bones}
vertex_weights = {}
for v in body.data.vertices:
    vertex_weights[v.index] = [(bone_groups[g.group], g.weight) for g in v.groups if g.group in bone_groups and g.weight > 1e-3]


def refit(obj, fit=fit_tree, face_keys=False, eye=None):
    co = coords(obj)
    new = co.copy()
    face = {name: np.zeros_like(co) for name in FACE} if face_keys else None
    for i, p in enumerate(co):
        if eye is not None:
            continue
        idx, w = weighted(fit, p)
        new[i] = p + (w[:, None] * (pos_b[idx] - pos_a[idx])).sum(0)
        if face is not None:
            for name, units in FACE.items():
                face[name][i] = sum((w[:, None] * unit_delta[u][idx]).sum(0) for u in units)
    if eye is not None:
        for side, members in eye.items():
            sel = co[:, 0] > 0 if side == 'L' else co[:, 0] <= 0
            new[sel] = co[sel] + (pos_b[members] - pos_a[members]).mean(0)
    obj.data.vertices.foreach_set('co', new.ravel())
    obj.data.update()
    return new, face


def reweight(obj, rigid=None):
    obj.vertex_groups.clear()
    made = {}
    co = coords(obj)
    for i, p in enumerate(co):
        if rigid:
            mix = {rigid(p): 1.0}
        else:
            mix = {}
            for j, w in zip(*weighted(weight_tree, p, 4)):
                for bone, bw in vertex_weights[j]:
                    mix[bone] = mix.get(bone, 0) + w * bw
            top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
            total = sum(w for _, w in top) or 1
            mix = {b: w / total for b, w in top}
        for bone, w in mix.items():
            if bone not in made:
                made[bone] = obj.vertex_groups.new(name=bone)
            made[bone].add([i], w, 'REPLACE')
    obj.parent = rig
    mod = obj.modifiers.new('Armature', 'ARMATURE')
    mod.object = rig


def delete_vertices(obj, doomed):
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in sorted(set(int(i) for i in doomed))], context='VERTS')
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


suit = bpy.data.objects['Kenji.male_casualsuit01']
shoes = bpy.data.objects['Kenji.shoes01']
eyes = bpy.data.objects['Kenji.low-poly']
brows = bpy.data.objects['Kenji.eyebrow001']
for obj, name in [(suit, 'Johansson.Clothes'), (shoes, 'Johansson.Shoes'), (eyes, 'Johansson.Eyes'), (brows, 'Johansson.Brows')]:
    obj.name = name
suit_co, _ = refit(suit)
refit(shoes)
refit(eyes, eye={'L': eye_l, 'R': eye_r})
brow_co, brow_face = refit(brows, fit=brow_tree, face_keys=True)

# Short sleeves and shorts.
trim(suit, {'arm.' + s: (.5, ['fore.' + s, 'hand.' + s]) for s in 'LR'} | {'thigh.' + s: (.66, ['shin.' + s, 'foot.' + s]) for s in 'LR'})
shoe_top = coords(shoes)[:, 2].max()

# The body shows wherever Kenji's did, plus the arms and legs the new clothes leave bare.
limb_b = dominant(body)
frac_b = along(pos_b, limb_b)
bare = ((np.char.startswith(limb_b, 'fore') | np.char.startswith(limb_b, 'hand')) |
        (np.char.startswith(limb_b, 'arm') & (frac_b > .42)) |
        (np.char.startswith(limb_b, 'shin') & (pos_b[:, 2] > shoe_top - .045)) |
        (np.char.startswith(limb_b, 'thigh') & (frac_b > .58)))
keep = np.zeros(len(pos_b), dtype=bool)
keep[body_verts] = visible_on_kenji[body_verts] | bare[body_verts]
keep[teeth] = True
keep[tongue] = True
face_key_rows = {name: sum(unit_delta[u] for u in units) for name, units in FACE.items()}
body.shape_key_add(name='Basis')
for name, delta in face_key_rows.items():
    key = body.shape_key_add(name=name, from_mix=False)
    key.data.foreach_set('co', (pos_b + delta).ravel())
    key.value = 0
kind = np.full(len(pos_b), 'skin', dtype=object)
kind[teeth] = 'teeth'
kind[tongue] = 'tongue'
# Remember what each surviving vertex is before indices shift.
body['__kind'] = 0
kind_layer = body.data.attributes.new('town_kind', 'INT', 'POINT')
kind_layer.data.foreach_set('value', np.array([0 if k == 'skin' else 1 if k == 'teeth' else 2 for k in kind], dtype=np.int32))
delete_vertices(body, np.nonzero(~keep)[0])
for g in list(body.vertex_groups):
    if g.name not in bones:
        body.vertex_groups.remove(g)

# Brows get the same face shapes, carried from the skin beneath them.
brows.shape_key_add(name='Basis')
for name, delta in brow_face.items():
    key = brows.shape_key_add(name=name, from_mix=False)
    key.data.foreach_set('co', (brow_co + delta).ravel())
for obj in (suit, shoes, brows):
    reweight(obj)
reweight(eyes, rigid=lambda p: 'eye.L' if p[0] > 0 else 'eye.R')

# Kenji's decimation carries over to the garments; the body keeps full resolution for its shapes.
for mod in list(suit.modifiers):
    if mod.type == 'DECIMATE':
        suit.modifiers.remove(mod)
for obj in (suit, shoes):
    bpy.context.view_layer.objects.active = obj
    for mod in list(obj.modifiers):
        if mod.type == 'DECIMATE':
            mod.ratio = max(mod.ratio, .45)
            bpy.ops.object.modifier_apply(modifier=mod.name)
    for mod in list(obj.modifiers):
        if mod.type == 'ARMATURE':
            obj.modifiers.remove(mod)
    m = obj.modifiers.new('Armature', 'ARMATURE')
    m.object = rig
bpy.data.objects.remove(kenji_body, do_unlink=True)


# --- Textures ------------------------------------------------------------------------------
def pixels(image):
    w, h = image.size
    a = np.zeros(w * h * 4, dtype=np.float32)
    image.pixels.foreach_get(a)
    return a.reshape(h, w, 4)


def store(image, a, name):
    h, w = a.shape[:2]
    out = bpy.data.images.new(name, w, h, alpha=True)
    out.pixels.foreach_set(np.ascontiguousarray(a, dtype=np.float32).ravel())
    out.pack()
    return out


def lum(a):
    return a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722


def smooth(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0, 1)
    return t * t * (3 - 2 * t)


# The kariyushi shirt: faded sky blue with a cream hibiscus and leaf print, on the garment's folds.
suit_image = bpy.data.images['Town.male_casualsuit01_diffuse.png']
cloth = pixels(suit_image)
h, w = cloth.shape[:2]
shade = lum(cloth[..., :3])
v_, u_ = np.mgrid[0:h, 0:w]
u = u_ / w
shirt_area = (u < .355) | (u > .715)
fold = np.clip(shade / np.median(shade[shirt_area]), .45, 1.5) ** .85
ground = np.array([.56, .72, .80])
printed = np.zeros((h, w))
leaf = np.zeros((h, w))
cell = 34
for gy in range(0, h + cell, cell):
    for gx in range(0, w + cell, cell):
        cx, cy = gx + rng.uniform(-9, 9), gy + rng.uniform(-9, 9) + (cell / 2 if (gx // cell) % 2 else 0)
        r = rng.uniform(8, 12.5)
        rot = rng.uniform(0, math.tau)
        x0, x1, y0, y1 = int(max(0, cx - 22)), int(min(w, cx + 22)), int(max(0, cy - 22)), int(min(h, cy + 22))
        if x0 >= x1 or y0 >= y1:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1]
        dx, dy = xx - cx, yy - cy
        ang, dist = np.arctan2(dy, dx) - rot, np.hypot(dx, dy)
        petals = r * (.55 + .45 * np.abs(np.cos(2.5 * ang)))
        printed[y0:y1, x0:x1] = np.maximum(printed[y0:y1, x0:x1], smooth(petals + 1, petals - 1, dist) * (dist > r * .16))
        la = rot + math.pi * .8
        lx, ly = dx * math.cos(la) + dy * math.sin(la) - r * 1.25, -dx * math.sin(la) + dy * math.cos(la)
        blade = (lx / (r * .95)) ** 2 + (ly / (r * .38)) ** 2
        leaf[y0:y1, x0:x1] = np.maximum(leaf[y0:y1, x0:x1], smooth(1.1, .9, blade))
colour = ground[None, None, :] * np.ones((h, w, 1))
colour = colour * (1 - leaf[..., None] * .8) + np.array([.30, .50, .52]) * leaf[..., None] * .8
colour = colour * (1 - printed[..., None]) + np.array([.95, .92, .84]) * printed[..., None]
shirt = colour * fold[..., None]
# Khaki shorts; the dark leather belt stays as it is.
trouser_fold = np.clip(shade / np.median(shade[~shirt_area]), .5, 1.45) ** .9
khaki = np.array([.63, .56, .41])[None, None, :] * trouser_fold[..., None]
belt = (shade < .13) & ~shirt_area
out = cloth.copy()
out[..., :3] = np.where(shirt_area[..., None], shirt, np.where(belt[..., None], cloth[..., :3], khaki))
cloth_image = store(suit_image, np.clip(out, 0, 1), 'Johansson.cloth_diffuse')

# Blue-grey eyes.
eye_image = bpy.data.images['Town.brown_eye.png']
iris = pixels(eye_image)
r_, g_, b_ = iris[..., 0], iris[..., 1], iris[..., 2]
sat = (np.max(iris[..., :3], -1) - np.min(iris[..., :3], -1))
iris_mask = smooth(.06, .16, sat)[..., None]
brightness = lum(iris[..., :3])[..., None]
blue = np.clip(np.array([.34, .52, .66]) * (brightness / max(1e-3, np.median(brightness[iris_mask[..., 0] > .5]))) ** .8, 0, 1)
iris[..., :3] = iris[..., :3] * (1 - iris_mask) + iris[..., :3] * .7 * iris_mask  # deep-set and dark, as in the photograph
eye_out = store(eye_image, iris, 'Johansson.eye_diffuse')

# Skin: a bald, sun-caught crown; beard; hair on chest, arms and legs.
skin_image = bpy.data.images['Town.young_lightskinned_male_diffuse3.png']
skin = pixels(skin_image)
H, W = skin.shape[:2]
mesh = body.data
uv = mesh.uv_layers.active.data
co_b = coords(body)
kinds = np.zeros(len(mesh.vertices), dtype=np.int32)
mesh.attributes['town_kind'].data.foreach_get('value', kinds)
normals = np.zeros(len(mesh.vertices) * 3)
mesh.vertices.foreach_get('normal', normals)
normals = normals.reshape(-1, 3)
eye_c = (bones['eye.L'][0] + bones['eye.R'][0]) / 2
mouth_z = (bones['oris03.L'][0][2] + bones['oris03.R'][0][2]) / 2 if 'oris03.L' in bones else eye_c[2] - .075
limb_s = dominant(body)
print('LANDMARKS eye', eye_c, 'mouth', mouth_z, 'top', co_b[:, 2].max(), flush=True)


def fringe_top(dy):
    """The fringe rises from the temples towards the back of the head."""
    return .03 + .035 * smooth(.06, .15, dy)


def fringe_region(ax, dy, dz):
    ear = (ax > .064) & (dz > -.058) & (dz < .02) & (dy > .04) & (dy < .13)
    return (dy > .05) & (dz < fringe_top(dy)) & (dz > np.where(dy > .115, -.062, -.02)) & ~ear


def hair_field(p, n, limb, f):
    """Density (hairs per cm2), length (m), direction and colour set for each point."""
    x, y, z = p[:, 0], p[:, 1], p[:, 2]
    ax = np.abs(x)
    dz, dy = z - eye_c[2], y - eye_c[1]
    head = (limb == 'head') | (limb == 'neck')
    dens = np.zeros(len(p))
    length = np.zeros(len(p))
    dirn = np.tile([0., 0., -1.], (len(p), 1))
    tone = np.zeros(len(p), dtype=int)  # 0 body, 1 beard, 2 stubble
    # Beard: cheeks below a line falling from the ear to the mouth corner, round the chin, under the jaw.
    cheek_line = -.017 - .42 * np.clip(.066 - ax, 0, None)
    beard = head & (dz < cheek_line + .004) & (dy < .08) & (dz > -.18)
    beard &= ~((dy > .035) & (dz < -.135))
    lips = ((ax / .026) ** 2 + ((z - mouth_z) / .0105) ** 2 < 1) & (dy < .02)
    edge = smooth(-.004, .01, cheek_line - dz) * smooth(0, .018, .08 - dy) * smooth(-.18, -.15, dz)
    # Clean-shaven this morning: only the grey shadow of stubble.
    dens = np.where(beard & ~lips, 38 * edge, dens)
    length = np.where(beard, .0011, length)
    tone = np.where(beard, 1, tone)
    # The horseshoe: sides and back, well below the crown, and sideburns into the beard.
    ring = fringe_region(ax, dy, dz) & head & ~beard
    dens = np.where(ring, 70 * smooth(0, .02, fringe_top(dy) - dz) * smooth(-.062, -.04, dz), dens)
    length = np.where(ring, .004, length)
    tone = np.where(ring, 2, tone)
    dirn[ring] = np.stack([np.sign(x[ring]) * .3, np.full(ring.sum(), .7), np.full(ring.sum(), -1.)], 1)
    # Body hair.
    front = n[:, 1] < -.25
    chest = (limb == 'torso') & front & (z > eye_c[2] - .47) & (z < eye_c[2] - .2)
    chest_d = 20 * smooth(.16, .03, ax) + 10 * smooth(.035, .0, ax) * (z < eye_c[2] - .3)
    dens = np.where(chest, chest_d * .6, dens)
    length = np.where(chest, .011, length)
    # Brows: heavy, fair-to-mid brown, combed outward.
    brow_z = eye_c[2] + .017 - 7 * (ax - .03) ** 2
    brow = head & (ax > .008) & (ax < .062) & (np.abs(z - brow_z) < .0065) & (dy < .03)
    dens = np.where(brow, 62 * smooth(.0065, .003, np.abs(z - brow_z)) * smooth(.062, .05, ax), dens)
    length = np.where(brow, .0068, length)
    tone = np.where(brow, 3, tone)
    dirn[brow] = np.stack([np.sign(x[brow]), np.zeros(brow.sum()), np.full(brow.sum(), .3)], 1)
    for side, sgn in (('L', 1), ('R', -1)):
        fore = limb == 'fore.' + side
        a, b = SEGMENTS['fore.' + side]
        along = (b - a) / np.linalg.norm(b - a)
        outward = np.clip(n @ np.array([sgn * .7, .35, .6]), 0, 1)
        dens = np.where(fore, 3.5 + 6 * outward, dens)
        length = np.where(fore, .0085, length)
        dirn[fore] = along
        arm = limb == 'arm.' + side
        dens = np.where(arm, 1.5, dens)
        length = np.where(arm, .008, length)
        hand = limb == 'hand.' + side
        dens = np.where(hand & (outward > .3) & (f < .55), 3 * outward, dens)
        length = np.where(hand, .006, length)
        dirn[hand] = along
        for part, d, l in (('shin', 6.5, .010), ('thigh', 3, .009)):
            leg = limb == part + '.' + side
            dens = np.where(leg, d * (.55 + .45 * np.clip(n @ np.array([sgn * .5, -.8, 0]), 0, 1)), dens)
            length = np.where(leg, l, length)
            dirn[leg] = [sgn * .15, 0, -1]
    return dens, length, dirn, tone


tris = []
for poly in mesh.polygons:
    vs = list(poly.vertices)
    ls = list(poly.loop_indices)
    for k in range(1, len(vs) - 1):
        tris.append((vs[0], vs[k], vs[k + 1], ls[0], ls[k], ls[k + 1]))
tris = np.array(tris)
tris = tris[(kinds[tris[:, 0]] == 0)]
uvs = np.zeros(len(uv) * 2)
uv.foreach_get('uv', uvs)
uvs = uvs.reshape(-1, 2) * [W, H]
P0, P1, P2 = co_b[tris[:, 0]], co_b[tris[:, 1]], co_b[tris[:, 2]]
U0, U1, U2 = uvs[tris[:, 3]], uvs[tris[:, 4]], uvs[tris[:, 5]]
centre = (P0 + P1 + P2) / 3
normal = (normals[tris[:, 0]] + normals[tris[:, 1]] + normals[tris[:, 2]])
normal /= np.linalg.norm(normal, axis=1, keepdims=True)
tri_limb = limb_s[tris[:, 0]]
tri_frac = along(centre, tri_limb)
dens, length, dirn, tone = hair_field(centre, normal, tri_limb, tri_frac)
area_cm2 = np.linalg.norm(np.cross(P1 - P0, P2 - P0), axis=1) / 2 * 1e4

# The crown: repaint the source texture's scalp shading as bare, slightly sun-pinked skin.
dz_c, dy_c = centre[:, 2] - eye_c[2], centre[:, 1] - eye_c[1]
scalp = ((tri_limb == 'head') & ((dz_c > .042) | ((dy_c > .045) & (dz_c > -.09))))
forehead = (tri_limb == 'head') & (dz_c > .03) & (dz_c < .042) & (dy_c < -.0)


def raster(mask, weight_fn):
    field = np.zeros((H, W), dtype=np.float32)
    for t in np.nonzero(mask)[0]:
        u0, u1, u2 = U0[t], U1[t], U2[t]
        x0, x1 = int(max(0, min(u0[0], u1[0], u2[0]) - 1)), int(min(W - 1, max(u0[0], u1[0], u2[0]) + 1))
        y0, y1 = int(max(0, min(u0[1], u1[1], u2[1]) - 1)), int(min(H - 1, max(u0[1], u1[1], u2[1]) + 1))
        if x1 < x0 or y1 < y0:
            continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        d = (u1[1] - u2[1]) * (u0[0] - u2[0]) + (u2[0] - u1[0]) * (u0[1] - u2[1])
        if abs(d) < 1e-9:
            continue
        a = ((u1[1] - u2[1]) * (xx - u2[0]) + (u2[0] - u1[0]) * (yy - u2[1])) / d
        b = ((u2[1] - u0[1]) * (xx - u2[0]) + (u0[0] - u2[0]) * (yy - u2[1])) / d
        inside = (a >= -.02) & (b >= -.02) & (a + b <= 1.02)
        field[yy[inside], xx[inside]] = np.maximum(field[yy[inside], xx[inside]], weight_fn(t))
    return field


def raster_pos(mask):
    """Interpolated rest position of the body under every texel of the chosen triangles."""
    pos = np.zeros((H, W, 3), dtype=np.float32)
    cov = np.zeros((H, W), dtype=bool)
    for t in np.nonzero(mask)[0]:
        u0, u1, u2 = U0[t], U1[t], U2[t]
        x0, x1 = int(max(0, min(u0[0], u1[0], u2[0]) - 1)), int(min(W - 1, max(u0[0], u1[0], u2[0]) + 1))
        y0, y1 = int(max(0, min(u0[1], u1[1], u2[1]) - 1)), int(min(H - 1, max(u0[1], u1[1], u2[1]) + 1))
        if x1 < x0 or y1 < y0:
            continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        d = (u1[1] - u2[1]) * (u0[0] - u2[0]) + (u2[0] - u1[0]) * (u0[1] - u2[1])
        if abs(d) < 1e-9:
            continue
        a = ((u1[1] - u2[1]) * (xx - u2[0]) + (u2[0] - u1[0]) * (yy - u2[1])) / d
        b = ((u2[1] - u0[1]) * (xx - u2[0]) + (u0[0] - u2[0]) * (yy - u2[1])) / d
        inside = (a >= -.03) & (b >= -.03) & (a + b <= 1.03)
        p = a[..., None] * P0[t] + b[..., None] * P1[t] + (1 - a - b)[..., None] * P2[t]
        pos[yy[inside], xx[inside]] = p[inside]
        cov[yy[inside], xx[inside]] = True
    return pos, cov


def polyline_distance(px, pz, points):
    best = np.full(px.shape, np.inf)
    for (x0, z0), (x1, z1) in zip(points, points[1:]):
        dx, dz = x1 - x0, z1 - z0
        t = np.clip(((px - x0) * dx + (pz - z0) * dz) / (dx * dx + dz * dz), 0, 1)
        best = np.minimum(best, np.hypot(px - x0 - t * dx, pz - z0 - t * dz))
    return best


def age_face():
    """Sixty-odd years: forehead furrows, a frown line, crow's feet, laugh lines, bags, colour."""
    pos, cov = raster_pos(tri_limb == 'head')
    x, z, y = pos[..., 0], pos[..., 2], pos[..., 1]
    ax, dz, dy = np.abs(x), z - eye_c[2], y - eye_c[1]
    front = cov & (dy < .03)
    crease = np.zeros((H, W), dtype=np.float32)
    lift = np.zeros((H, W), dtype=np.float32)
    # Forehead: four long furrows bowing down at the temples, a little uneven.
    for k, level in enumerate((.043, .054, .066, .078)):
        line = level - .006 * (ax / .05) ** 2 + .0022 * np.sin(ax * 70 + k * 1.7) * (1 + .5 * np.sign(x))
        d = np.abs(dz - line)
        fade = np.exp(-(ax / (.052 - .004 * k)) ** 4) * front * (dy < 0)
        crease = np.maximum(crease, np.exp(-(d / .0011) ** 2) * fade * (.9 - .1 * k))
        lift = np.maximum(lift, np.exp(-((dz - line - .0024) / .0016) ** 2) * fade * .5)
    # Two short upright lines between the brows.
    for side in (-1, 1):
        d = np.hypot((x - side * .008) * 1.0, np.clip(np.abs(dz - .028) - .008, 0, None))
        crease = np.maximum(crease, np.exp(-(d / .0009) ** 2) * front * .55)
    # Crow's feet fanning from the outer corners.
    for ang in (-.45, -.1, .25):
        for side in (-1, 1):
            ex, ez = side * .052, -.002
            ux, uz = side * math.cos(ang), math.sin(ang)
            t = np.clip((x - ex) * ux + (dz - ez) * uz, 0, .014)
            d = np.hypot(x - ex - t * ux, dz - ez - t * uz)
            crease = np.maximum(crease, np.exp(-(d / .0008) ** 2) * cov * (t > .001) * .5)
    # Laugh lines from the nostril wings round past the mouth corners, and the jowl lines below.
    for side in (-1, 1):
        fold = polyline_distance(x * side, dz, [(.021, -.036), (.03, -.052), (.037, -.068), (.039, -.08)])
        crease = np.maximum(crease, np.exp(-(fold / .0017) ** 2) * front * .95)
        lift = np.maximum(lift, np.exp(-((fold - .004) / .003) ** 2) * front * (x * side > .03) * .35)
        jowl = polyline_distance(x * side, dz, [(.033, -.084), (.037, -.1), (.043, -.114)])
        crease = np.maximum(crease, np.exp(-(jowl / .0016) ** 2) * front * .45)
        bag = np.abs(np.hypot((x * side - .033) / .02, (dz + .012) / .0085) - 1)
        crease = np.maximum(crease, np.exp(-(bag / .08) ** 2) * front * (dz < -.013) * .3)
    rgb = skin[..., :3]
    rgb *= 1 - crease[..., None] * np.array([.30, .36, .38])
    rgb += lift[..., None] * np.array([.05, .04, .035])
    # Ruddy cheeks and nose; a few sun spots on the crown.
    ruddy = (np.exp(-((ax - .045) ** 2 + (dz + .03) ** 2) / .00035) + np.exp(-(ax ** 2 + (dz + .035) ** 2 + (dy + .03) ** 2) / .00012)) * cov
    rgb *= 1 - ruddy[..., None] * np.array([0, .10, .12])
    spots = np.zeros((H, W), dtype=np.float32)
    crown = cov & (dz > .06)
    for cx, cz, cy, r in zip(rng.uniform(-.06, .06, 26), rng.uniform(.07, .11, 26), rng.uniform(-.06, .12, 26), rng.uniform(.002, .0055, 26)):
        spots = np.maximum(spots, np.exp(-((x - cx) ** 2 + (dz - cz) ** 2 + (y - eye_c[1] - cy) ** 2) / r ** 2) * crown)
    rgb *= 1 - spots[..., None] * np.array([.10, .16, .2])
    skin[..., :3] = np.clip(rgb, 0, 1)


scalp_mask = raster(scalp, lambda t: 1.0)
fore_mask = raster(forehead, lambda t: 1.0)
if fore_mask.sum() > 10:
    tan = skin[..., :3][fore_mask > .5].mean(0)
else:
    tan = np.array([.86, .66, .55])
tan = tan * np.array([1.02, .97, .95])
skin_l = lum(skin[..., :3])
ref_l = max(1e-3, float(skin_l[fore_mask > .5].mean()) if fore_mask.sum() > 10 else .6)
# Soften the mask edge a few pixels so the old hairline melts away.
soft = scalp_mask.copy()
for _ in range(6):
    soft = np.maximum(soft, (np.roll(soft, 1, 0) + np.roll(soft, -1, 0) + np.roll(soft, 1, 1) + np.roll(soft, -1, 1)) / 4 * .92)
sv, su = np.mgrid[0:H, 0:W]
mottle = 1 + .035 * np.sin(su * .09) * np.cos(sv * .07) + rng.normal(0, .012, (H, W))
bald = np.clip(tan[None, None, :] * ((skin_l / ref_l) ** .25)[..., None] * mottle[..., None], 0, 1)
skin[..., :3] = skin[..., :3] * (1 - soft[..., None]) + bald * soft[..., None]
# A grey-blue shadow under the beard, as a full beard has at the skin.
beard_mask = raster(tone == 1, lambda t: min(1, dens[t] / 30))
skin[..., :3] *= 1 - beard_mask[..., None] * np.array([.07, .08, .07])
# Forty summers of sun: warmer and ruddier than the source skin.
skin[..., :3] *= np.array([1.0, .92, .84])
age_face()

# Hairs, stroke by stroke.
PALETTE = {0: ([.20, .15, .11], [.34, .26, .19]), 1: ([.30, .27, .25], [.46, .43, .40]), 2: ([.42, .40, .38], [.64, .62, .59]),
           3: ([.16, .13, .11], [.30, .27, .25])}
GREY_SHARE = {0: .3, 1: .5, 2: .45, 3: .35}
GREY = np.array([.72, .70, .67])


def strokes(select, dens, length, alpha_scale=1.0):
    """Ink coverage and colour from short curved strokes laid in UV space."""
    ink = np.zeros((H, W), dtype=np.float32)
    ink_rgb = np.zeros((H, W, 3), dtype=np.float32)
    pts_x, pts_y, pts_a, pts_c = [], [], [], []
    for t in np.nonzero(select & (dens > .05))[0]:
        count = rng.poisson(dens[t] * area_cm2[t])
        if count == 0:
            continue
        e1, e2 = P1[t] - P0[t], P2[t] - P0[t]
        G = np.array([[e1 @ e1, e1 @ e2], [e1 @ e2, e2 @ e2]])
        try:
            Ginv = np.linalg.inv(G)
        except np.linalg.LinAlgError:
            continue
        d3 = dirn[t] - normal[t] * (dirn[t] @ normal[t])
        if np.linalg.norm(d3) < 1e-6:
            continue
        d3 = d3 / np.linalg.norm(d3) * length[t]
        ab = Ginv @ np.array([d3 @ e1, d3 @ e2])
        duv = ab[0] * (U1[t] - U0[t]) + ab[1] * (U2[t] - U0[t])
        r1, r2 = rng.random(count), rng.random(count)
        flip = r1 + r2 > 1
        r1[flip], r2[flip] = 1 - r1[flip], 1 - r2[flip]
        start = U0[t] + r1[:, None] * (U1[t] - U0[t]) + r2[:, None] * (U2[t] - U0[t])
        ang = rng.normal(0, .35, count)
        scale = rng.uniform(.6, 1.15, count)
        c, s_ = np.cos(ang), np.sin(ang)
        vec = np.stack([duv[0] * c - duv[1] * s_, duv[0] * s_ + duv[1] * c], 1) * scale[:, None]
        curl = np.stack([-vec[:, 1], vec[:, 0]], 1) * rng.normal(0, .18, count)[:, None]
        dark, warm = PALETTE[int(tone[t])]
        mix = rng.random(count)
        cols = np.array(dark)[None] * (1 - mix[:, None]) + np.array(warm)[None] * mix[:, None]
        cols[rng.random(count) < GREY_SHARE[int(tone[t])]] = GREY
        alpha = rng.uniform(.25, .6, count) * {0: 1, 1: .55, 2: .9, 3: 1.3}[int(tone[t])] * alpha_scale
        steps = max(2, int(np.ceil(np.linalg.norm(duv) * 1.4)) + 1)
        for k in range(steps):
            q = k / (steps - 1)
            pos = start + vec * q + curl * (q * q)
            pts_x.append(pos[:, 0]); pts_y.append(pos[:, 1])
            pts_a.append(alpha * (1 - .45 * q)); pts_c.append(cols)
    if not pts_x:
        return ink, ink_rgb
    px = np.concatenate(pts_x); py = np.concatenate(pts_y); pa = np.concatenate(pts_a); pc = np.concatenate(pts_c)
    ix = np.clip(px.astype(int), 0, W - 1); iy = np.clip(py.astype(int), 0, H - 1)
    density = -np.log(np.clip(1 - pa * .7, .05, 1)).astype(np.float32)
    np.add.at(ink, (iy, ix), density)
    for ch in range(3):
        np.add.at(ink_rgb[..., ch], (iy, ix), (density * pc[:, ch]).astype(np.float32))
    print('STROKES', len(px), flush=True)
    return ink, ink_rgb


ink, ink_rgb = strokes(np.ones(len(dens), dtype=bool), dens, length)
cover = 1 - np.exp(-ink)
hair_col = ink_rgb / np.maximum(ink[..., None], 1e-6)
skin[..., :3] = skin[..., :3] * (1 - cover[..., None]) + hair_col * cover[..., None]

# The fringe itself stands a little off the scalp: longer grey hairs on a thin shell, so the
# silhouette has the soft fuzz of the photograph rather than a painted edge.
fringe_tris = tone == 2
fringe_len = np.where(fringe_tris, .0095, 0)
fringe_ink, fringe_rgb = strokes(fringe_tris, np.where(fringe_tris, dens * 1.1, 0), fringe_len, .75)
fringe_px = np.zeros((H, W, 4), dtype=np.float32)
fringe_px[..., :3] = fringe_rgb / np.maximum(fringe_ink[..., None], 1e-6)
fringe_px[..., 3] = np.clip((1 - np.exp(-fringe_ink)) * .95, 0, 1)
fringe_image = store(skin_image, fringe_px, 'Johansson.fringe_diffuse')
skin_out = store(skin_image, np.clip(skin, 0, 1), 'Johansson.skin_diffuse')


# --- Materials -------------------------------------------------------------------------------
def material(name, image=None, colour=(1, 1, 1, 1), rough=.7, spec=.3, double=False, normal_image=None, alpha=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Specular IOR Level'].default_value = spec
    bsdf.inputs['Base Color'].default_value = colour
    if image:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = image
        links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        if alpha:
            links.new(tex.outputs['Alpha'], bsdf.inputs['Alpha'])
            mat.blend_method = 'HASHED'
            mat.surface_render_method = 'DITHERED'
    if normal_image:
        nt = nodes.new('ShaderNodeTexImage')
        nt.image = normal_image
        normal_image.colorspace_settings.name = 'Non-Color'
        nm = nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = .6
        links.new(nt.outputs['Color'], nm.inputs['Color'])
        links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    mat.use_backface_culling = not double
    return mat


skin_mat = material('Johansson.Skin', skin_out, rough=.62, spec=.32)
teeth_mat = material('Johansson.Teeth', None, (.86, .83, .74, 1), rough=.35)
tongue_mat = material('Johansson.Tongue', None, (.62, .30, .29, 1), rough=.45)
body.data.materials.clear()
for m in (skin_mat, teeth_mat, tongue_mat):
    body.data.materials.append(m)
kinds = np.zeros(len(mesh.vertices), dtype=np.int32)
mesh.attributes['town_kind'].data.foreach_get('value', kinds)
for poly in mesh.polygons:
    poly.material_index = int(np.bincount(kinds[list(poly.vertices)]).argmax())
    poly.use_smooth = True
mesh.attributes.remove(mesh.attributes['town_kind'])
cloth_mat = material('Johansson.Cloth', cloth_image, rough=.86, spec=.2, double=True,
                     normal_image=bpy.data.images['Town.male_casualsuit01_normal.png'])
suit.data.materials.clear()
suit.data.materials.append(cloth_mat)
shoes.data.materials.clear()
shoes.data.materials.append(material('Johansson.Shoes', bpy.data.images['Town.shoes01_diffuse.png'], rough=.5, spec=.4,
                                     normal_image=bpy.data.images['Town.shoes01_normal.png']))
eyes.data.materials.clear()
eyes.data.materials.append(material('Johansson.Eyes', eye_out, rough=.08, spec=.6))
brow_image = bpy.data.images['Town.eyebrow001.png']
brow_px = pixels(brow_image)
brow_px[..., :3] = np.array([.36, .34, .32])
brow_px[..., 3] *= .7
brows.data.materials.clear()
brows.data.materials.append(material('Johansson.Brows', store(brow_image, brow_px, 'Johansson.brow_diffuse'), rough=.8, alpha=True))
# The fringe shell: the scalp faces round the sides and back, lifted a few millimetres.
import bmesh
fringe = body.copy()
fringe.data = body.data.copy()
fringe.name = fringe.data.name = 'Johansson.Fringe'
bpy.context.scene.collection.objects.link(fringe)
fringe.shape_key_clear()
bm = bmesh.new()
bm.from_mesh(fringe.data)
bm.normal_update()
limb_f = dominant(fringe)
doomed = []
for face in bm.faces:
    c = face.calc_center_median()
    ax, dy, dz = abs(c.x), c.y - eye_c[1], c.z - eye_c[2]
    head_face = all(limb_f[v.index] in ('head', 'neck') for v in face.verts)
    keep_face = head_face and face.material_index == 0 and dy > .042 and dz < fringe_top(dy) + .006 and dz > (-.068 if dy > .11 else -.03)
    keep_face = keep_face and not (ax > .064 and -.058 < dz < .02 and .04 < dy < .13)
    if not keep_face:
        doomed.append(face)
bmesh.ops.delete(bm, geom=doomed, context='FACES')
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
bm.normal_update()
for v in bm.verts:
    v.co += v.normal * .0045
bm.to_mesh(fringe.data)
bm.free()
fringe.data.materials.clear()
fringe_mat = material('Johansson.FringeHair', fringe_image, rough=.8, spec=.2, alpha=True, double=True)
fringe_mat.blend_method = 'BLEND'
fringe_mat.surface_render_method = 'BLENDED'
fringe.data.materials.append(fringe_mat)
print('FRINGE', len(fringe.data.vertices), flush=True)

for obj in (suit, shoes, eyes, brows, body, fringe):
    for poly in obj.data.polygons:
        poly.use_smooth = True
for img in list(bpy.data.images):
    if img.users == 0:
        bpy.data.images.remove(img)

height = max(coords(body)[:, 2].max(), 0)
print('HEIGHT', height, 'BODY', len(body.data.vertices), 'CLOTHES', len(suit.data.vertices), flush=True)
out_dir = root / 'art/characters/johansson'
out_dir.mkdir(parents=True, exist_ok=True)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(out_dir / 'johansson.blend'), compress=True)
print('SAVED', out_dir / 'johansson.blend', flush=True)
