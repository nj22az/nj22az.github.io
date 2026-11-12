"""The cast: the four Meshy characters with their skeletons and every clip, in one library file.

    blender -b -P cast.py -- --rigs <dir with <name>_rigged.glb and <name>_<clip>.glb> --out cast.blend

Each character becomes an armature named after it (jack, singer, dancer, constable) with its mesh as a child, standing
at the origin, facing -Y, 1 unit = 1 m. Each clip becomes an action named "<character>:<clip>".
"""
import bpy, sys, os, glob
argv = sys.argv[sys.argv.index('--') + 1:]
RIGS = argv[argv.index('--rigs') + 1]; OUT = argv[argv.index('--out') + 1]
CLIPS = {'walking': 'walk', 'running': 'run', 'a0': 'idle', 'a559': 'sneak', 'a563': 'strut', 'a42': 'bow', 'a219': 'slash',
         'a408': 'jazzhands', 'a55': 'stagewalk', 'a56': 'chat', 'a595': 'jazz', 'a41': 'bow', 'a78': 'rhythm', 'a298': 'cheer',
         'a215': 'kick', 'a378': 'stepkick', 'a414': 'doublekick', 'a218': 'stepinkick', 'a337': 'torch', 'a333': 'dumbfounded',
         'a341': 'search', 'a273': 'grab'}
bpy.ops.wm.read_factory_settings(use_empty=True)
D = bpy.data
for who in ('jack', 'singer', 'dancer', 'constable'):
    before = set(D.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(RIGS, who + '_rigged.glb'))
    new = [o for o in D.objects if o not in before]
    arm = next(o for o in new if o.type == 'ARMATURE')
    for o in new:
        if o.type == 'MESH' and not o.find_armature(): D.objects.remove(o)        # Meshy's stray icosphere
    for o in [o for o in D.objects if o not in before]:
        if o.type == 'MESH': o.name = who + '-mesh'; o.data.name = who + '-mesh'
        elif o.type == 'EMPTY': D.objects.remove(o)
    arm.name = who; arm.data.name = who
    if arm.animation_data and arm.animation_data.action: D.actions.remove(arm.animation_data.action)
    arm.animation_data_clear()
    for f in sorted(glob.glob(os.path.join(RIGS, who + '_*.glb'))):
        key = os.path.basename(f)[len(who) + 1:-4]
        if key == 'rigged': continue
        b2 = set(D.objects); a2 = set(D.actions); m2 = set(D.meshes); i2 = set(D.images); t2 = set(D.materials); r2 = set(D.armatures)
        bpy.ops.import_scene.gltf(filepath=f)
        act = next(a for a in D.actions if a not in a2)
        act.name = f'{who}:{CLIPS[key]}'; act.use_fake_user = True
        for o in [o for o in D.objects if o not in b2]: D.objects.remove(o)
        for coll, old in ((D.meshes, m2), (D.materials, t2), (D.images, i2), (D.armatures, r2)):
            for x in [x for x in coll if x not in old]: coll.remove(x)
        print(who, act.name, tuple(act.frame_range))
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print('cast built', [(o.name, o.type) for o in D.objects], len(D.actions))
