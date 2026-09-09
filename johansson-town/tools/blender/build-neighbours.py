"""Rebuild the named residents from the project's CC0 MakeHuman system assets.

Blender 4.2 LTS; requires the pinned MPFB revision in realistic/provenance.json.
blender -b -t 4 --python tools/blender/build-neighbours.py -- \
  --root /path/to/game --mpfb /path/to/mpfb/src/mpfb --assets /path/to/system-assets

Uses real fitted, blended skin weights, independent macro/face fitting and seven
in-place actions. No franchise models, runtime services or motion-capture claims.
"""
import argparse, hashlib, importlib, json, math, shutil, sys
from pathlib import Path
import bpy
from mathutils import Vector, Quaternion

p = argparse.ArgumentParser()
p.add_argument('--root', required=True)
p.add_argument('--mpfb', required=True)
p.add_argument('--assets', required=True)
p.add_argument('--only', default='')
p.add_argument('--review', default='')
a = p.parse_args(sys.argv[sys.argv.index('--') + 1:])
root, assets, mpfb = Path(a.root), Path(a.assets), Path(a.mpfb)
out = root / 'assets/characters/neighbours'
out.mkdir(parents=True, exist_ok=True)
profiles = json.loads((root / 'src/people/profiles.json').read_text())
extension = Path('/tmp/town-blender-extensions')
extension.mkdir(exist_ok=True)
if not (extension / 'mpfb').exists(): shutil.copytree(mpfb, extension / 'mpfb')
if not any(r.directory == str(extension) for r in bpy.context.preferences.extensions.repos):
    bpy.ops.preferences.extension_repo_add(name='town_authoring', use_custom_directory=True,
        custom_directory=str(extension), type='LOCAL')
repo = next(r for r in bpy.context.preferences.extensions.repos if r.directory == str(extension))
module = 'bl_ext.' + repo.module + '.mpfb'
bpy.ops.preferences.addon_enable(module=module)
HumanService = importlib.import_module(module + '.services.humanservice').HumanService
TargetService = importlib.import_module(module + '.services.targetservice').TargetService
used = {}

def record(path):
    used[str(path.relative_to(assets) if path.is_relative_to(assets) else path.relative_to(mpfb))] = hashlib.sha256(path.read_bytes()).hexdigest()

def fitted_material(obj, path, skin=False, alpha=False):
    record(path)
    values = {}
    for line in path.read_text().splitlines():
        words = line.strip().split(maxsplit=1)
        if len(words) == 2 and not words[0].startswith('#'): values[words[0]] = words[1]
    mat = bpy.data.materials.new(obj.name + '.PBR')
    mat.use_nodes = True
    bs = mat.node_tree.nodes['Principled BSDF']
    bs.inputs['Roughness'].default_value = .72 if skin else .88
    bs.inputs['Specular IOR Level'].default_value = .24
    # Shared original texture filenames become shared content-addressed files at packing.
    # Normal maps are retained for tailoring; skin stays diffuse, without waxy highlights.
    for field, socket in [('diffuseTexture', 'Base Color'), ('normalmapTexture', 'Normal')]:
        if field not in values: continue
        source = (path.parent / values[field]).resolve()
        if not source.exists(): continue
        record(source)
        image = bpy.data.images.load(str(source), check_existing=True)
        tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
        tex.image = image
        if socket == 'Normal':
            image.colorspace_settings.name = 'Non-Color'
            normal = mat.node_tree.nodes.new('ShaderNodeNormalMap')
            normal.inputs['Strength'].default_value = .38
            mat.node_tree.links.new(tex.outputs['Color'], normal.inputs['Color'])
            mat.node_tree.links.new(normal.outputs['Normal'], bs.inputs['Normal'])
        else:
            mat.node_tree.links.new(tex.outputs['Color'], bs.inputs['Base Color'])
            if alpha:
                mat.node_tree.links.new(tex.outputs['Alpha'], bs.inputs['Alpha'])
                mat.surface_render_method = 'DITHERED'
    obj.data.materials.clear()
    obj.data.materials.append(mat)

# Deliberately varied, everyday silhouettes: denim, cotton, workwear and tailoring.
# Avoid the sports kits and avoid giving the whole cast one shared outfit/face.
wardrobes = ['male_casualsuit05', 'male_casualsuit01', 'female_elegantsuit01',
 'male_casualsuit05', 'male_elegantsuit01', 'male_worksuit01', 'male_elegantsuit01',
 'female_elegantsuit01', 'male_casualsuit03', 'male_casualsuit03',
 'male_worksuit01', 'female_elegantsuit01', 'female_elegantsuit01',
 'male_casualsuit05', 'female_elegantsuit01', 'male_casualsuit03',
 'male_casualsuit05', 'male_casualsuit01', 'female_elegantsuit01',
 'male_casualsuit01', 'female_elegantsuit01']
haircuts = ['braid01', 'short01', 'ponytail01', 'short04', 'short02', 'short03',
 'short02', 'bob01', 'short04', 'short04', 'short01', 'ponytail01', 'bob02',
 'short04', 'ponytail01', 'short04', 'ponytail01', 'short03', 'bob01',
 'short03', 'ponytail01']
reports = []

for index, profile in enumerate(profiles):
    if a.only and profile['model'] not in a.only.split(','): continue
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for action in list(bpy.data.actions): bpy.data.actions.remove(action)
    for image in list(bpy.data.images): bpy.data.images.remove(image)
    female = profile['female']
    macro = {'age': min(.95, max(.17, profile['age'] / 90)), 'gender': 0. if female else 1.,
      'height': .5, 'muscle': .36 if female else .48 + (index % 3) * .04,
      'weight': .40 + (index % 4) * .06, 'proportions': .45 + (index % 3) * .035,
      'cupsize': .28, 'firmness': .5, 'race': {'asian': 1., 'caucasian': 0., 'african': 0.}}
    base = HumanService.create_human(macro_detail_dict=macro)
    base.name = profile['model'] + '.Body'
    targets = {'nose/nose-scale-depth-decr': .16 + (index % 4) * .045,
      'chin/chin-height-decr': .1 + (index % 3) * .055,
      'mouth/mouth-upperlip-volume-decr': .22,
      'mouth/mouth-lowerlip-volume-decr': .17,
      'cheek/l-cheek-volume-incr': .06 + (index % 3) * .055,
      'cheek/r-cheek-volume-incr': .06 + (index % 3) * .055,
      'expression/units/asian/mouth-corner-puller': .16}
    for fragment, weight in targets.items():
        target = mpfb / 'data/targets' / (fragment + '.target.gz')
        record(target)
        TargetService.load_target(base, str(target), weight=weight)
    rig = HumanService.add_builtin_rig(base, 'game_engine')
    rig.name = profile['model'] + '.Rig'
    age = 'old' if profile['age'] >= 60 else 'middleage' if profile['age'] >= 40 else 'young'
    gender = 'female' if female else 'male'
    skin = f'{age}_asian_{gender}'
    fitted_material(base, assets / 'skins' / skin / (skin + '.mhmat'), skin=True)
    clothes = wardrobes[index]
    shoes = 'shoes02' if female else 'shoes01'
    meshes = [base]
    for folder, name, kind in [('clothes', clothes, 'Clothes'), ('clothes', shoes, 'Clothes'),
      ('hair', haircuts[index], 'Hair'), ('eyes', 'low-poly', 'Eyes'), ('eyebrows', 'eyebrow001', 'Eyebrows')]:
        path = assets / folder / name / (name + '.mhclo')
        record(path)
        obj = HumanService.add_mhclo_asset(str(path), base, asset_type=kind, subdiv_levels=0, material_type='NONE')
        obj.name = profile['model'] + '.' + name
        material_file = next(line.split(maxsplit=1)[1] for line in path.read_text().splitlines() if line.startswith('material '))
        fitted_material(obj, (path.parent / material_file).resolve(), alpha=kind in ['Hair', 'Eyebrows'])
        meshes.append(obj)
    for obj in meshes:
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        if obj.data.shape_keys: bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
        for mod in list(obj.modifiers):
            if mod.type == 'MASK': bpy.ops.object.modifier_apply(modifier=mod.name)
        for face in obj.data.polygons: face.use_smooth = True
        world = obj.matrix_world.copy()
        obj.parent = rig
        obj.matrix_world = world
    # Delete covered sock cuffs that otherwise protrude through trouser legs.
    import bmesh
    if clothes == 'female_elegantsuit01':
        # Mask the upper thighs beneath the fitted skirt. The source garment's
        # static mask leaves them exposed when the two legs stride independently.
        garment = next(o for o in meshes if '.female_elegantsuit01' in o.name)
        hem = min((garment.matrix_world @ v.co).z for v in garment.data.vertices)
        waist = (rig.matrix_world @ rig.pose.bones['pelvis'].head).z + .06
        # A little hem ease prevents the blended skirt from cutting into the
        # leading knee. Preserve the blouse and the fitted waist above it.
        for v in garment.data.vertices:
            co = garment.matrix_world @ v.co
            ease = min(1., max(0., (waist - co.z) / (waist - hem)))
            co.x += math.copysign(.035 * ease, co.x)
            co.y += math.copysign(.040 * ease, co.y)
            co.z -= .025 * ease ** 3
            v.co = garment.matrix_world.inverted() @ co
        bm = bmesh.new(); bm.from_mesh(base.data)
        covered = [v for v in bm.verts if hem + .045 < (base.matrix_world @ v.co).z < waist
                   and abs((base.matrix_world @ v.co).x) < .32]
        bmesh.ops.delete(bm, geom=covered, context='VERTS')
        bm.to_mesh(base.data); bm.free()
    shoe = next(o for o in meshes if '.shoes' in o.name)
    if shoes == 'shoes01':
        bm = bmesh.new(); bm.from_mesh(shoe.data)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if (shoe.matrix_world @ v.co).z > .15], context='VERTS')
        bm.to_mesh(shoe.data); bm.free()
    for bone in rig.pose.bones: bone.rotation_mode = 'QUATERNION'
    if profile['name'] in ['Aiko','Reiko','Tetsuo','Fumiko']:
        # Fine fitted spectacles, weighted to the actual head rather than floating
        # beside the face. No opaque lenses obscure the resident's eyes.
        eye=next(o for o in meshes if '.low-poly' in o.name)
        points=[eye.matrix_world @ v.co for v in eye.data.vertices]
        ex=(max(v.x for v in points)-min(v.x for v in points))/4
        ey=min(v.y for v in points)-.006
        ez=(max(v.z for v in points)+min(v.z for v in points))/2
        curves=bpy.data.curves.new('Spectacle frames','CURVE');curves.dimensions='3D';curves.bevel_depth=.0014;curves.bevel_resolution=1
        for side in [-1,1]:
            ring=curves.splines.new('POLY');ring.points.add(23);ring.use_cyclic_u=True
            for i,point in enumerate(ring.points):
                angle=i*math.tau/24;point.co=(side*ex+math.cos(angle)*ex*.84,ey,ez+math.sin(angle)*ex*.62,1)
        bridge=curves.splines.new('POLY');bridge.points.add(1);bridge.points[0].co=(-ex*.18,ey,ez+.004,1);bridge.points[1].co=(ex*.18,ey,ez+.004,1)
        frame=bpy.data.objects.new(profile['model']+'.Spectacles',curves);bpy.context.collection.objects.link(frame)
        bpy.ops.object.select_all(action='DESELECT');frame.select_set(True);bpy.context.view_layer.objects.active=frame;bpy.ops.object.convert(target='MESH');frame=bpy.context.object
        group=frame.vertex_groups.new(name='head');group.add(list(range(len(frame.data.vertices))),1,'REPLACE')
        frame.parent=rig;modifier=frame.modifiers.new('Head binding','ARMATURE');modifier.object=rig
        mat=bpy.data.materials.new('Bronze frames');mat.diffuse_color=(.22,.15,.07,1);mat.use_nodes=True;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.22,.15,.07,1);bs.inputs['Metallic'].default_value=.5;bs.inputs['Roughness'].default_value=.5;frame.data.materials.append(mat);meshes.append(frame)
    bpy.context.view_layer.update()
    bounds = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    rig.scale *= profile['height'] / (max(v.z for v in bounds) - min(v.z for v in bounds))

    def aim(name, direction):
        bone = rig.pose.bones[name]
        delta = (bone.tail - bone.head).normalized().rotation_difference(Vector(direction).normalized())
        matrix = delta.to_matrix().to_4x4() @ bone.matrix
        matrix.translation = bone.matrix.translation
        bone.matrix = matrix
        bpy.context.view_layer.update()

    def leg(side, foot_y, lift):
        thigh = rig.pose.bones['thigh_' + side]
        calf = rig.pose.bones['calf_' + side]
        foot = rig.pose.bones['foot_' + side]
        hip = thigh.head.copy()
        target = foot.bone.head_local.copy() + Vector((0, foot_y, lift))
        delta = target - hip
        l1, l2 = thigh.bone.length, calf.bone.length
        distance = min(delta.length, l1 + l2 - .001)
        direction = delta.normalized()
        along = (l1*l1 - l2*l2 + distance*distance) / (2*distance)
        bend = Vector((0, -1, 0))
        bend = (bend - direction * bend.dot(direction)).normalized()
        knee = hip + direction * along + bend * math.sqrt(max(0, l1*l1 - along*along))
        aim(thigh.name, knee - hip)
        aim(calf.name, target - calf.head)
        # Sole remains horizontal; the knee bends forward and the foot never flips.
        matrix = foot.bone.matrix_local.copy()
        matrix.translation = foot.matrix.translation
        foot.matrix = matrix
        bpy.context.view_layer.update()

    def pose(t, clip):
        for bone in rig.pose.bones:
            bone.rotation_quaternion = Quaternion()
            bone.location = (0, 0, 0)
        seated = clip in ['Sit', 'Eat', 'Drink']
        moving = clip in ['Walk', 'Run']
        phase = t * math.tau
        pelvis = rig.pose.bones['pelvis']
        matrix = pelvis.bone.matrix_local.copy()
        matrix.translation.z -= .40 if seated else .032 if moving else .009
        if moving: matrix.translation.z += .008 * math.cos(phase * 2)
        pelvis.matrix = matrix
        bpy.context.view_layer.update()
        for side, offset, sign in [('l', 0, 1), ('r', .5, -1)]:
            u = (t + offset) % 1
            foot_y, lift = (-.30, .006) if seated else (0, .003)
            stride = .56 if clip == 'Walk' else .88
            if moving:
                if u < .6:
                    foot_y = -stride/2 + stride * u/.6
                    lift = .003
                else:
                    swing = (u-.6)/.4
                    foot_y = stride/2 - stride * (swing*swing*(3-2*swing))
                    lift = .003 + (.095 if clip == 'Walk' else .15)*math.sin(math.pi*swing)
            leg(side, foot_y, lift)
            swing = math.sin(phase + offset*math.tau) * (.15 if clip=='Walk' else .24 if clip=='Run' else .006)
            aim('upperarm_'+side, (sign*.14, swing-.02 if not seated else -.34, -1))
            aim('lowerarm_'+side, (sign*.03, swing-.12 if not seated else -.65, -1))
            aim('hand_'+side, (sign*.02, swing-.12 if not seated else -.65, -1))
        if clip == 'Wave':
            envelope = math.sin(math.pi*t)**2
            aim('upperarm_r', (-.14-.35*envelope, -.04-.24*envelope, -1+.8*envelope))
            aim('lowerarm_r', (-.03-.18*envelope+math.sin(phase*2)*.045*envelope, -.12-.48*envelope, -1+2.35*envelope))
            aim('hand_r', (math.sin(phase*2)*.12*envelope, -.12-.12*envelope, -1+2.35*envelope))
        if clip in ['Eat', 'Drink']:
            amount = .5-.5*math.cos(phase)
            aim('upperarm_r', (-.12, -.45, -.65))
            aim('lowerarm_r', (.18, -.48, -.28 + .9*amount))
            aim('hand_r', (.10, -.25, -.1 + .6*amount))
        rig.pose.bones['head'].rotation_quaternion = Quaternion((1, 0, 0), math.sin(phase)*.007)
        bpy.context.view_layer.update()
        # Correct the actual deformed sole, not an assumed ankle height.
        evaluated = shoe.evaluated_get(bpy.context.evaluated_depsgraph_get())
        floor = min((evaluated.matrix_world @ v.co).z for v in evaluated.data.vertices)
        matrix = pelvis.matrix.copy()
        matrix.translation.z -= floor / rig.scale.z
        pelvis.matrix = matrix
        bpy.context.view_layer.update()

    rig.animation_data_create()
    bpy.context.scene.render.fps = 24
    for clip, frames in [('Idle_Neutral',96), ('Walk',24), ('Run',18), ('Wave',48), ('Sit',96), ('Eat',96), ('Drink',96)]:
        action = bpy.data.actions.new(clip)
        rig.animation_data.action = action
        for frame in range(0, frames+1, 1 if clip in ['Walk','Run'] else 2 if clip=='Wave' else 8):
            pose(frame/frames, clip)
            for bone in rig.pose.bones:
                bone.keyframe_insert('rotation_quaternion', frame=frame, group=bone.name)
                bone.keyframe_insert('location', frame=frame, group=bone.name)
        for curve in action.fcurves:
            for key in curve.keyframe_points: key.interpolation = 'LINEAR'
        action.use_fake_user = True
    rig.animation_data.action = bpy.data.actions['Idle_Neutral']
    bpy.context.scene.frame_set(0)
    # Portable geometry at a similar triangle budget to the former segmented bodies.
    for obj in meshes:
        ratio = .40 if obj == base else .30 if '.male_' in obj.name or '.female_' in obj.name else .5
        if 'low-poly' in obj.name or 'eyebrow' in obj.name or 'Spectacles' in obj.name: continue
        mod = obj.modifiers.new('Browser reduction', 'DECIMATE')
        mod.ratio = ratio; mod.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_move_up(modifier=mod.name)
        bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.select_all(action='DESELECT')
    rig.select_set(True)
    for obj in meshes: obj.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=str(out / (profile['model']+'.glb')), export_format='GLB',
      use_selection=True, export_animations=True, export_animation_mode='ACTIONS',
      export_nla_strips=False, export_force_sampling=True, export_frame_range=False,
      export_skins=True, export_morph=False, export_cameras=False, export_lights=False)
    report = {'name':profile['name'], 'model':profile['model'], 'age':profile['age'],
      'height':profile['height'], 'macro':macro, 'faceTargets':targets, 'clothes':clothes,
      'hair':haircuts[index], 'skin':skin, 'triangles':sum(sum(len(f.vertices)-2 for f in obj.data.polygons) for obj in meshes),
      'files':dict(used)}
    (out / (profile['model']+'.source.json')).write_text(json.dumps(report, indent=2)+'\n')
    reports.append(report)
    print('NEIGHBOUR_COMPLETE', profile['name'], report['triangles'], flush=True)
    if a.review:
        review = Path(a.review); review.mkdir(parents=True, exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(review/(profile['model']+'.blend')), compress=True)

print('NEIGHBOURS_COMPLETE', len(reports), flush=True)
