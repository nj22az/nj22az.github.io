"""The Johansson sailor in 3D: modelled from the owner's sheets, rigged, and walking.

    /root/bl/bin/python blender/sailor3d.py --still out.png [phase]     # one picture of the walk
    /root/bl/bin/python blender/sailor3d.py --frames DIR                # the 6 s walk-and-whistle cycle
    /root/bl/bin/python blender/sailor3d.py --blend sailor.blend        # the rigged model, to open in Blender

He faces +X. His right side (-Y) is the one nearest the camera.
"""
import math
import sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Matrix, Vector, Quaternion

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
import common
import tune

FPS = 60
CYCLE = 90                    # frames to two steps
LOOP = 360                    # one musical phrase: every phrase has the same rhythm, so the lips loop too
STRIDE = 2.2                  # Blender units travelled per cycle
CELL = (1000, 720)            # picture of him alone
CELL_GROUND = (500, 670)      # where the ground under his pelvis is in that picture

# ---- building blocks ---------------------------------------------------------------------------


def ball(name, at, radii, colour='white', rot=(0, 0, 0), seg=40, rings=20):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1)
    ob = bpy.context.object
    ob.name = name
    ob.matrix_world = Matrix.Translation(at) @ Matrix.Rotation(rot[2], 4, 'Z') @ Matrix.Rotation(rot[1], 4, 'Y') @ \
        Matrix.Rotation(rot[0], 4, 'X') @ Matrix.Diagonal((*radii, 1))
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(common.flat(colour))
    return ob


def box(name, at, half, colour='white', rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=2)
    ob = bpy.context.object
    ob.name = name
    ob.matrix_world = Matrix.Translation(at) @ Matrix.Rotation(rot[2], 4, 'Z') @ Matrix.Rotation(rot[1], 4, 'Y') @ \
        Matrix.Rotation(rot[0], 4, 'X') @ Matrix.Diagonal((*half, 1))
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    ob.data.materials.append(common.flat(colour))
    return ob


def barrel(ob, centre_z, half_height, power=3.0):
    """Square off a ball's sides so it stands like a barrel instead of an egg."""
    for v in ob.data.vertices:
        t = max(-1.0, min(1.0, (v.co.z - centre_z) / half_height))
        round_r = math.sqrt(max(1e-9, 1 - t * t))
        barrel_r = max(1e-9, 1 - abs(t) ** power) ** (1 / power)
        k = barrel_r / round_r if round_r > 0.05 else 1.0
        v.co.x *= k
        v.co.y *= k


def bands(ob, ranges, axis=2):
    """Paint black hoops on a white shape: faces whose centre lies in one of `ranges` along `axis`."""
    ob.data.materials.append(common.flat('black'))
    for p in ob.data.polygons:
        c = p.center[axis]
        if any(a <= c <= b for a, b in ranges):
            p.material_index = 1


def tube(name, a, b, radius, colour='white', rings=24, seg=32):
    """A hose from a to b (points), closed with round ends; returns the object and its axis points."""
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1)
    ob = bpy.context.object
    ob.name = name
    L = (b - a).length
    for v in ob.data.vertices:                    # stretch the sphere into a capsule along Z
        z = v.co.z
        v.co = Vector((v.co.x * radius, v.co.y * radius, z * radius + (L / 2 if z > 0 else -L / 2) + (0 if abs(z) > 1e-6 else 0)))
    rot = Vector((0, 0, 1)).rotation_difference((b - a).normalized()).to_matrix().to_4x4()
    ob.matrix_world = Matrix.Translation((a + b) / 2) @ rot
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.shade_smooth()
    ob.data.materials.append(common.flat(colour))
    return ob


def bind(ob, arm, weights):
    """Fasten a shape to the rig. weights: bone name (all of it), or a function vertex -> {bone: weight}."""
    for v in ob.data.vertices:
        w = {weights: 1.0} if isinstance(weights, str) else weights(v.co)
        for bone, x in w.items():
            if x > 0:
                g = ob.vertex_groups.get(bone) or ob.vertex_groups.new(name=bone)
                g.add([v.index], x, 'REPLACE')
    ob.parent = arm
    m = ob.modifiers.new('rig', 'ARMATURE')
    m.object = arm


# ---- measurements, from the turnaround sheet (Blender units = sheet pixels / 100) -------------------
HIP_Z, KNEE_Z, ANKLE_Z = 0.95, 0.715, 0.48
HIP_Y = 0.20
PELVIS = Vector((0.0, 0.0, 1.0))
WAIST = Vector((0.0, 0.0, 1.25))
NECK = Vector((0.03, 0.0, 2.02))
SHOULDER = Vector((0.0, -0.56, 1.86))
ELBOW = Vector((0.0, -0.66, 1.55))
WRIST = Vector((0.0, -0.68, 1.16))
MOUTH = Vector((0.56, 0.0, 2.12))
EYES = Vector((0.45, 0.0, 2.52))
HEEL_X, BALL_X, TOE_X = -0.27, 0.25, 0.55        # along the boot, from the ankle

BONES = {
    # name: (head, tail, parent)
    'root': ((0, 0, 0), (0, 0, 0.3), None),
    'pelvis': (tuple(PELVIS), tuple(WAIST), 'root'),
    'chest': (tuple(WAIST), (0, 0, 1.9), 'pelvis'),
    'head': (tuple(NECK), (0.03, 0, 2.7), 'chest'),
    'grin': (tuple(MOUTH), tuple(MOUTH + Vector((0.2, 0, 0))), 'head'),
    'lips': (tuple(MOUTH), tuple(MOUTH + Vector((0.2, 0, 0))), 'head'),
    'eyes': (tuple(EYES), tuple(EYES + Vector((0.2, 0, 0))), 'head'),
}
for side, s in (('R', 1), ('L', -1)):
    BONES[f'upper_arm.{side}'] = ((0, s * SHOULDER.y, SHOULDER.z), (0, s * ELBOW.y, ELBOW.z), 'chest')
    BONES[f'forearm.{side}'] = ((0, s * ELBOW.y, ELBOW.z), (0, s * WRIST.y, WRIST.z), f'upper_arm.{side}')
    BONES[f'thigh.{side}'] = ((0, -s * HIP_Y, HIP_Z), (0, -s * HIP_Y, KNEE_Z), None)
    BONES[f'shin.{side}'] = ((0, -s * HIP_Y, KNEE_Z), (0, -s * HIP_Y, ANKLE_Z), None)
    BONES[f'foot.{side}'] = ((0, -s * HIP_Y, ANKLE_Z), (0.5, -s * HIP_Y, ANKLE_Z), None)


def build():
    """The model and its rig, in the rest pose: standing, arms down. Returns the armature object."""
    ad = bpy.data.armatures.new('SailorRig')
    arm = bpy.data.objects.new('Sailor', ad)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    for name, (h, t, parent) in BONES.items():
        b = ad.edit_bones.new(name)
        b.head, b.tail = h, t
        b.roll = 0
        if parent:
            b.parent = ad.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')

    def add(ob, bone, group=None):
        bind(ob, arm, bone)
        common.assign(ob, group or ob.name)       # parts of one group are inked as one shape

    # seat and trousers
    add(ball('seat', (0, 0, 1.02), (0.40, 0.47, 0.27)), 'pelvis', 'seat')
    for side, s in (('R', 1), ('L', -1)):
        y = -s * HIP_Y
        leg = tube(f'leg.{side}', (0, y, HIP_Z), (0, y, ANKLE_Z), 0.205)

        def knee(co, side=side):
            t = min(1.0, max(0.0, (co.z - (KNEE_Z - 0.08)) / 0.16))
            t = t * t * (3 - 2 * t)
            return {f'thigh.{side}': t, f'shin.{side}': 1 - t}
        add(leg, knee, 'seat' if side == 'R' else 'leg.L')       # his near leg runs into the seat, as drawn
        add(ball(f'cuff.{side}', (0.01, y, 0.50), (0.30, 0.30, 0.135)), f'foot.{side}')
        boot = ball(f'boot.{side}', (0.17, y, 0.20), (0.40, 0.25, 0.22))
        heel = ball(f'heel.{side}', (-0.05, y, 0.21), (0.24, 0.235, 0.22))
        for o in (boot, heel):
            for v in o.data.vertices:              # a flat sole
                if v.co.z < 0.06:
                    v.co.z = 0.06
            add(o, f'foot.{side}', f'boot.{side}')
        add(ball(f'sole.{side}', (0.13, y, 0.05), (0.455, 0.265, 0.05), 'black'), f'foot.{side}', f'boot.{side}')

    # shirt: a barrel with black hoops, and the belt with its buckle
    shirt = ball('shirt', (0.02, 0, 1.63), (0.47, 0.54, 0.50), seg=48, rings=48)
    barrel(shirt, 1.63, 0.50)
    bands(shirt, [(1.97, 2.2), (1.72, 1.86), (1.47, 1.61), (1.14, 1.31)])
    add(shirt, 'chest')
    add(box('buckle', (0.46, -0.06, 1.225), (0.03, 0.115, 0.10)), 'chest')
    add(box('buckle_hole', (0.475, -0.06, 1.225), (0.03, 0.06, 0.05), 'black'), 'chest', 'buckle')

    # arms: puffed striped sleeve, big forearm, fist
    for side, s in (('R', 1), ('L', -1)):
        sh = Vector((0, s * SHOULDER.y, SHOULDER.z)); el = Vector((0, s * ELBOW.y, ELBOW.z)); wr = Vector((0, s * WRIST.y, WRIST.z))
        sleeve = ball(f'sleeve.{side}', (sh + el) / 2 + Vector((0, 0, 0.04)), (0.27, 0.27, 0.28), seg=40, rings=32)
        bands(sleeve, [(el.z + 0.02, el.z + 0.10), (el.z + 0.20, el.z + 0.28)])
        add(sleeve, f'upper_arm.{side}')
        add(ball(f'forearm.{side}', (el + wr) / 2 + Vector((0.01, 0, -0.03)), (0.265, 0.26, 0.34)), f'forearm.{side}', f'fore.{side}')
        add(ball(f'fist.{side}', wr + Vector((0.03, 0, -0.10)), (0.29, 0.26, 0.26)), f'forearm.{side}', f'fore.{side}')
        add(ball(f'thumb.{side}', wr + Vector((0.23, s * 0.07, -0.02)), (0.11, 0.10, 0.13)), f'forearm.{side}')

    # head: a big round face, the ear well back, black hair under the cap, the beard on the jaw
    add(tube('neck', (0.02, 0, 1.95), (0.04, 0, 2.15), 0.15), 'head', 'skull')
    add(ball('hair', (-0.14, 0, 2.38), (0.42, 0.455, 0.40), 'black'), 'head', 'skull')
    add(ball('skull', (0.05, 0, 2.44), (0.44, 0.45, 0.43)), 'head')
    add(ball('beard', (0.15, 0, 2.02), (0.44, 0.465, 0.33), 'black'), 'head', 'skull')
    add(ball('nose', (0.55, 0, 2.38), (0.19, 0.155, 0.14)), 'head')
    for side, s in (('R', 1), ('L', -1)):
        y = -s
        add(ball(f'ear.{side}', (-0.10, y * 0.455, 2.36), (0.13, 0.06, 0.15)), 'head')
        add(ball(f'eye.{side}', (0.445, y * 0.17, 2.56), (0.04, 0.075, 0.165), 'black', rot=(0, math.radians(-6), y * 0.37)), 'eyes', 'skull')
        add(ball(f'glint.{side}', (0.485, y * 0.135, 2.585), (0.02, 0.032, 0.05), rot=(0, 0, y * 0.37)), 'eyes', 'skull')
        add(ball(f'brow.{side}', (0.37, y * 0.21, 2.83), (0.03, 0.12, 0.022), 'black', rot=(y * 0.3, 0, y * 0.42)), 'head', 'skull')
    # cap: the band, the puffed crown thrown back, the black peak
    add(ball('cap_band', (-0.04, 0, 2.88), (0.46, 0.47, 0.10), rot=(0, math.radians(-24), 0)), 'head')
    add(ball('cap_crown', (-0.22, 0, 3.07), (0.55, 0.58, 0.26), rot=(0, math.radians(-30), 0)), 'head')
    add(ball('cap_peak', (0.38, 0, 2.90), (0.30, 0.40, 0.05), 'black', rot=(0, math.radians(-8), 0)), 'head', 'skull')
    # mouth: the grin with its teeth, and the pursed lips of the whistle (the rig shows one or the other)
    # the grin wraps round the front of the beard, wide and white, with the lines between the teeth
    add(ball('grin', MOUTH + Vector((-0.10, 0, 0.0)), (0.13, 0.28, 0.085)), 'grin', 'skull')
    for k in (-1.5, -0.5, 0.5, 1.5):
        add(box(f'tooth_line.{k}', MOUTH + Vector((-0.04, k * 0.10, 0)), (0.12, 0.011, 0.09), 'black'), 'grin', 'skull')
    bpy.ops.mesh.primitive_torus_add(major_radius=0.07, minor_radius=0.036, major_segments=32, minor_segments=12)
    lips = bpy.context.object
    lips.name = 'lips'
    lips.matrix_world = Matrix.Translation(MOUTH + Vector((0.045, 0, 0))) @ Matrix.Rotation(math.radians(90), 4, 'Y')
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.object.shade_smooth()
    lips.data.materials.append(common.flat('white'))
    add(lips, 'lips', 'skull')
    return arm


# ---- the walk ------------------------------------------------------------------------------------
STANCE, T_FLAT, T_OFF = 0.60, 0.085, 0.42
STRIKE, TOE_OFF = math.radians(-20), math.radians(50)
HEEL_X0 = 0.30               # where the heel lands, ahead of the pelvis
LEG = HIP_Z - ANKLE_Z


def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def swing(x):
    return (1 - math.cos(2 * math.pi * x)) / 2          # 0 back, 1 forward


def pitch(v, th):
    """Turn (x, z) so that a positive angle puts the toe down and the heel up."""
    c, s = math.cos(th), math.sin(th)
    return (v[0] * c + v[1] * s, -v[0] * s + v[1] * c)


def boot(p):
    """Ankle (x, z) and pitch of one boot. While it is down, the part on the quay moves with the quay."""
    p %= 1.0
    hx = HEEL_X0 - STRIDE * p
    ank = lambda pivot_x, pivot_at, th: tuple(a + b for a, b in zip(pivot_at, pitch((-pivot_x, ANKLE_Z), th)))
    if p < T_FLAT:
        th = STRIKE * (1 - smooth(p / T_FLAT))
        return ank(HEEL_X, (hx, 0), th), th
    if p < T_OFF:
        return (hx - HEEL_X, ANKLE_Z), 0.0
    if p < STANCE:
        th = TOE_OFF * smooth((p - T_OFF) / (STANCE - T_OFF)) ** 1.3
        return ank(BALL_X, (hx - HEEL_X + BALL_X, 0), th), th
    s = (p - STANCE) / (1 - STANCE)
    a0 = ank(BALL_X, (HEEL_X0 - STRIDE * STANCE - HEEL_X + BALL_X, 0), TOE_OFF)
    a1 = ank(HEEL_X, (HEEL_X0, 0), STRIKE)
    e = smooth(s)
    return (lerp(a0[0], a1[0], lerp(s, e, 0.65)), lerp(a0[1], a1[1], e) + 0.10 * math.sin(math.pi * s) ** 1.15), \
        lerp(TOE_OFF, STRIKE, smooth(s ** 0.8))


def about(point, rot):
    return Matrix.Translation(point) @ rot.to_4x4() @ Matrix.Translation(-Vector(point))


def RY(a):
    return Matrix.Rotation(a, 3, 'Y')


def RZ(a):
    return Matrix.Rotation(a, 3, 'Z')


def pose(arm, ph, pucker=0.0, lid=0.0, key=None):
    """Put the rig in the walk at phase ph (0..1 over two steps). `key` = frame number to keyframe."""
    rest = {b.name: b.matrix_local.copy() for b in arm.data.bones}
    D = {}
    lift = 0.012 - 0.030 * math.cos(4 * math.pi * (ph - 0.045))
    hip_turn = math.radians(6) * math.cos(2 * math.pi * ph)            # the hip of the leading leg comes forward
    D['root'] = Matrix.Identity(4)
    D['pelvis'] = Matrix.Translation((0, 0, lift)) @ about(PELVIS, RZ(hip_turn))
    chest_turn = math.radians(-13) * math.cos(2 * math.pi * (ph + 0.02))
    lean = math.radians(3.0 + 1.2 * math.sin(4 * math.pi * (ph - 0.02)))
    D['chest'] = D['pelvis'] @ about(WAIST, RZ(chest_turn - hip_turn) @ RY(lean))
    nod = math.radians(1.8 * math.sin(4 * math.pi * (ph - 0.12)))
    D['head'] = D['chest'] @ about(NECK, RZ(-chest_turn * 0.85) @ RY(nod - lean * 0.6))
    D['grin'] = D['head'] @ about(MOUTH, Matrix.Diagonal((1,) * 3) * (0.001 if pucker > 0.02 else 1.0))
    k = 0.001 if pucker <= 0.02 else 0.45 + 0.55 * min(pucker, 1.0) + 0.6 * max(0.0, pucker - 1.0)
    D['lips'] = D['head'] @ about(MOUTH, Matrix.Diagonal((1,) * 3) * k)
    D['eyes'] = D['head'] @ about(EYES, Matrix.Diagonal((1, 1, max(0.08, 1 - lid))))
    for side, s, x in (('R', 1, ph), ('L', -1, ph + 0.5)):
        sh = Vector((0, s * SHOULDER.y, SHOULDER.z)); el = Vector((0, s * ELBOW.y, ELBOW.z))
        up = math.radians(lerp(30, -34, swing(x - 0.05)))                # back ... forward
        bend = math.radians(lerp(-6, -46, swing(x - 0.12)))              # the forearm follows late and bends
        D[f'upper_arm.{side}'] = D['chest'] @ about(sh, RY(up))
        D[f'forearm.{side}'] = D[f'upper_arm.{side}'] @ about(el, RY(bend))
        # leg: hip rides on the pelvis, the boot is where the walk puts it, the hose joins them
        hip = D['pelvis'] @ Vector((0, -s * HIP_Y, HIP_Z))
        (ax, az), th = boot(x)
        ankle = Vector((ax, hip.y, az))
        d = ankle - hip
        dist = d.length
        half = LEG / 2
        if dist >= LEG:                                                  # rubber hose: it stretches straight
            knee = hip + d / 2
        else:                                                            # or the knee bends forward
            out = math.sqrt(max(0.0, half * half - (dist / 2) ** 2))
            fwd = Vector((-d.z, 0, d.x)).normalized()
            if fwd.x < 0:
                fwd = -fwd
            knee = hip + d / 2 + fwd * out
        for name, a, b in ((f'thigh.{side}', hip, knee), (f'shin.{side}', knee, ankle)):
            v = b - a
            ang = math.atan2(-v.x, -v.z)                                 # from straight down, about Y
            D[name] = Matrix.Translation(a) @ (RY(-ang) @ Matrix.Diagonal((1, 1, v.length / half))).to_4x4() @ \
                Matrix.Translation(-Vector(rest[name].translation))
        D[f'foot.{side}'] = Matrix.Translation(ankle) @ RY(th).to_4x4() @ Matrix.Translation(-Vector(rest[f'foot.{side}'].translation))
    for pb in arm.pose.bones:
        parent = D[pb.parent.name] if pb.parent else Matrix.Identity(4)
        pb.matrix_basis = rest[pb.name].inverted() @ parent.inverted() @ D[pb.name] @ rest[pb.name]
        if key is not None:
            pb.rotation_mode = 'QUATERNION'
            for path in ('location', 'rotation_quaternion', 'scale'):
                pb.keyframe_insert(path, frame=key)
    bpy.context.view_layer.update()


def at_frame(arm, n, key=None):
    f = (n % LOOP) * 24.0 / FPS
    pose(arm, (n % CYCLE) / CYCLE, tune.pucker_at(f), tune.lid_at(f), key)


if __name__ == '__main__':
    sc = common.reset()
    arm = build()
    arg = lambda flag: sys.argv[sys.argv.index(flag) + 1]
    common.camera(sc, *CELL, (0, 0, 0), CELL_GROUND, pitch=0.0)
    if '--model' in sys.argv:
        common.render(sc, arg('--model') + '.id.png').save(arg('--model'))
    if '--still' in sys.argv:
        at_frame(arm, int(sys.argv[sys.argv.index('--still') + 2]))
        common.render(sc, arg('--still') + '.id.png').save(arg('--still'))
    if '--frames' in sys.argv:
        out = Path(arg('--frames')); out.mkdir(parents=True, exist_ok=True)
        part, parts = (int(x) for x in arg('--part').split('/')) if '--part' in sys.argv else (0, 1)
        for n in range(part, LOOP, parts):
            at_frame(arm, n)
            common.render(sc, out / 'id.%d.png' % part).save(out / f'{n:04d}.png')
    if '--blend' in sys.argv:
        sc.render.fps = FPS
        sc.frame_start, sc.frame_end = 0, LOOP - 1
        for n in range(LOOP):
            at_frame(arm, n, key=n)
        bpy.ops.wm.save_as_mainfile(filepath=str(Path(arg('--blend')).resolve()))
