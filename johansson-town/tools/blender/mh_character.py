"""Shared steps for rebuilding a fitted MakeHuman character on MPFB's full skeleton.

Used by build-thuan.py (and the same steps, written inline, by build-johansson.py). Every
function takes what it works on; nothing here reads module globals of the caller.
"""
import os, shutil, importlib
from pathlib import Path
import numpy as np
import bpy, bmesh
from mathutils import kdtree


def load_mpfb(mpfb_src, repo_path='/tmp/town-blender-extensions'):
    os.makedirs(repo_path, exist_ok=True)
    if not os.path.exists(repo_path + '/mpfb'):
        shutil.copytree(mpfb_src, repo_path + '/mpfb')
    bpy.ops.preferences.extension_repo_add(name='town_authoring', use_custom_directory=True, custom_directory=repo_path, type='LOCAL')
    repo = next(r for r in bpy.context.preferences.extensions.repos if r.directory == repo_path)
    module = 'bl_ext.' + repo.module + '.mpfb'
    bpy.ops.preferences.addon_enable(module=module)
    hs = importlib.import_module(module + '.services.humanservice').HumanService
    ts = importlib.import_module(module + '.services.targetservice').TargetService
    return hs, ts, Path(repo_path) / 'mpfb/data/targets'


def coords(obj, key=None):
    a = np.zeros(len(obj.data.vertices) * 3)
    (obj.data.shape_keys.key_blocks[key].data if key else obj.data.vertices).foreach_get('co', a)
    return a.reshape(-1, 3)


def mixed(obj):
    obj.shape_key_add(name='__mix', from_mix=True)
    a = coords(obj, '__mix')
    obj.shape_key_remove(obj.data.shape_keys.key_blocks['__mix'])
    return a


def bake_shape(obj, positions):
    """Drop every shape key and make these positions the mesh."""
    if obj.data.shape_keys:
        obj.shape_key_add(name='__mix', from_mix=True)
        for block in list(obj.data.shape_keys.key_blocks):
            if block.name != '__mix':
                obj.shape_key_remove(block)
        obj.shape_key_remove(obj.data.shape_keys.key_blocks['__mix'])
    obj.data.vertices.foreach_set('co', positions.ravel())
    obj.data.update()


def group_members(obj, names):
    index = {obj.vertex_groups[n].index for n in names if n in obj.vertex_groups}
    return np.array([v.index for v in obj.data.vertices if any(g.group in index and g.weight > .5 for g in v.groups)], dtype=int)


def tree(points, indices):
    indices = list(indices)
    t = kdtree.KDTree(len(indices))
    for i in indices:
        t.insert(points[i], int(i))
    t.balance()
    return t


def weighted(t, p, k=6):
    found = t.find_n(p, k)
    w = np.array([1 / (d + 1e-4) ** 2 for _, _, d in found])
    return [i for _, i, _ in found], w / w.sum()


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


def dominant(obj, bones):
    names = {g.index: limb_name(g.name) for g in obj.vertex_groups if g.name in bones or '_' in g.name or g.name == 'Root'}
    out = []
    for v in obj.data.vertices:
        best = max(v.groups, key=lambda g: g.weight if g.group in names else -1, default=None)
        out.append(names.get(best.group, 'torso') if best else 'torso')
    return np.array(out)


def segments(bones):
    limbs = {
        'arm.L': ('upperarm01.L', 'upperarm02.L'), 'arm.R': ('upperarm01.R', 'upperarm02.R'),
        'fore.L': ('lowerarm01.L', 'wrist.L'), 'fore.R': ('lowerarm01.R', 'wrist.R'),
        'thigh.L': ('upperleg01.L', 'upperleg02.L'), 'thigh.R': ('upperleg01.R', 'upperleg02.R'),
        'shin.L': ('lowerleg01.L', 'lowerleg02.L'), 'shin.R': ('lowerleg01.R', 'lowerleg02.R'),
        'torso': ('spine05', 'spine01'), 'neck': ('neck01', 'head'),
    }
    return {k: (bones[a][0], bones[b][1]) for k, (a, b) in limbs.items()}


def along(points, limbs, segs):
    frac = np.zeros(len(points))
    for name in set(limbs):
        if name not in segs:
            continue
        a, b = segs[name]
        sel = limbs == name
        ab = b - a
        frac[sel] = np.clip(((points[sel] - a) @ ab) / (ab @ ab), 0, 1)
    return frac


def trim(obj, cuts, bones, segs):
    """Cut a garment square across a limb and drop everything beyond it."""
    limbs = dominant(obj, bones)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    layer = bm.verts.layers.int.new('limb')
    names = sorted(set(limbs))
    bm.verts.ensure_lookup_table()
    for v in bm.verts:
        v[layer] = names.index(limbs[v.index]) + 1
    for limb, (fraction, beyond) in cuts.items():
        group = {names.index(n) + 1 for n in [limb] + beyond if n in names} | {0}
        a, b = segs[limb]
        normal = (b - a) / np.linalg.norm(b - a)
        faces = [f for f in bm.faces if all(v[layer] in group for v in f.verts)]
        geom = list({e for f in faces for e in f.edges}) + faces + list({v for f in faces for v in f.verts})
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=a + fraction * (b - a), plane_no=normal, clear_outer=True)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


def delete_vertices(obj, doomed):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[bm.verts[i] for i in sorted(set(int(i) for i in doomed))], context='VERTS')
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()


def bone_weights(body, bones):
    groups = {g.index: g.name for g in body.vertex_groups if g.name in bones}
    return {v.index: [(groups[g.group], g.weight) for g in v.groups if g.group in groups and g.weight > 1e-3] for v in body.data.vertices}


def reweight(obj, rig, weight_tree, vertex_weights, rigid=None):
    """Skin a garment from the body under it, or to one bone."""
    obj.vertex_groups.clear()
    made = {}
    for i, p in enumerate(coords(obj)):
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
    for mod in list(obj.modifiers):
        if mod.type == 'ARMATURE':
            obj.modifiers.remove(mod)
    mod = obj.modifiers.new('Armature', 'ARMATURE')
    mod.object = rig


def shell(source, name, keep_face, lift, material, cuts=()):
    """A garment grown from the skin: the chosen faces, cut square, lifted off the body."""
    obj = source.copy()
    obj.data = source.data.copy()
    obj.name = obj.data.name = name
    bpy.context.scene.collection.objects.link(obj)
    if obj.data.shape_keys:
        obj.shape_key_clear()
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not keep_face(f.calc_center_median())], context='FACES')
    geom = lambda faces: list({e for f in faces for e in f.edges}) + faces + list({v for f in faces for v in f.verts})
    for co, no, side in cuts:
        faces = [f for f in bm.faces if side is None or side(f.calc_center_median())]
        bmesh.ops.bisect_plane(bm, geom=geom(faces), plane_co=co, plane_no=no, clear_outer=True)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.normal_update()
    for v in bm.verts:
        v.co += v.normal * lift
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.materials.clear()
    obj.data.materials.append(material)
    return obj


def complement(full, keep, body_mask, name, material):
    """The skin under the clothes: body faces not already in the visible body."""
    full.name = full.data.name = name
    if full.data.shape_keys:
        full.shape_key_clear()
    bm = bmesh.new()
    bm.from_mesh(full.data)
    bm.verts.ensure_lookup_table()
    doomed = [f for f in bm.faces if all(keep[v.index] for v in f.verts) or not all(body_mask[v.index] for v in f.verts)]
    bmesh.ops.delete(bm, geom=doomed, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(full.data)
    bm.free()
    full.data.materials.clear()
    full.data.materials.append(material)
    return full


def plain_material(name, colour, rough=.6, spec=.3, double=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = colour
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Specular IOR Level'].default_value = spec
    mat.use_backface_culling = not double
    return mat
