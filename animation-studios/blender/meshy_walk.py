"""The owner's Meshy sailor, rigged by Meshy, walking and whistling in ink.

Input: the `walking.glb` of a Meshy rigging task run on the textured 'Sailor Character 3D' (reduced to
under 300,000 faces first). This script stands him at the sheet's size facing +X, cleans his paint as
blender/meshy_sailor.py does, paints a whistle and a blink on his face, and renders one phrase of the
tune (6 s, four walk cycles) as inked frames of him alone.

    /root/bl/bin/python blender/meshy_walk.py walking.glb --measure
    /root/bl/bin/python blender/meshy_walk.py walking.glb --still out.png 40
    /root/bl/bin/python blender/meshy_walk.py walking.glb --frames DIR [--part i/n]
"""
import json
import math
import sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Matrix, Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
import common
import meshy_sailor as ms
import tune

FPS = 60
CYCLE_SECONDS = 1.5           # the clip is retimed so that one step is one beat of the tune
LOOP = 360                    # frames: one phrase; every phrase has the same rhythm, so lips and steps loop
CELL = (1000, 720)
CELL_GROUND = (500, 670)
MOUTH = (0.0, 2.33)           # y, z of his lips on the model at rest
EYES_Z = (2.47, 2.675)
# the rolled cuff, measured on the model: the boot ends and the cuff begins at 0.37, the cuff ends and the
# trouser leg begins at 0.67. Each gets a line of ink.
CUFF_LINES = ((0.345, 0.395), (0.645, 0.695))


def load(path):
    bpy.ops.import_scene.gltf(filepath=str(path))
    sc = bpy.context.scene
    arm = next(o for o in sc.objects if o.type == 'ARMATURE')
    mesh = next(o for o in sc.objects if o.type == 'MESH' and o.parent == arm)
    for o in [o for o in sc.objects if o.type == 'MESH' and o is not mesh]:
        bpy.data.objects.remove(o)
    mesh.data.polygons.foreach_set('use_smooth', [True] * len(mesh.data.polygons))    # no facets from the reduction
    mesh.data.update()
    arm.data.pose_position = 'REST'
    bpy.context.view_layer.update()
    n = len(mesh.data.vertices)
    co = np.empty(n * 3); mesh.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    mw = np.array(mesh.matrix_world)
    raw = co @ mw[:3, :3].T + mw[:3, 3]
    lo, hi = raw.min(0), raw.max(0)
    k = ms.HEIGHT / (hi[2] - lo[2])
    c0 = Vector(((lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, lo[2]))
    stage = bpy.data.objects.new('stage', None)
    sc.collection.objects.link(stage)
    stage.matrix_world = Matrix.Rotation(math.radians(90), 4, 'Z') @ Matrix.Scale(k, 4) @ Matrix.Translation(-c0)
    arm_world = arm.matrix_world.copy()
    arm.parent = stage
    arm.matrix_parent_inverse = Matrix.Identity(4)
    arm.matrix_basis = arm_world
    bpy.context.view_layer.update()
    rest = np.stack([-(raw[:, 1] - c0[1]) * k, (raw[:, 0] - c0[0]) * k, (raw[:, 2] - c0[2]) * k], 1)
    arm.data.pose_position = 'POSE'
    return sc, arm, mesh, rest


def paint(mesh, rest):
    """The clean paint of meshy_sailor.clean, on the rigged mesh, plus where each point is at rest."""
    me = mesh.data
    lum = ms.texture_lum(mesh)
    co = rest
    grey = (lum > 0.3) & (lum < 0.75)
    hat = (co[:, 2] > ms.HAT_FROM) & grey
    hat |= co[:, 2] > 2.80
    peak = hat & (co[:, 0] > ms.PEAK['x_from']) & (co[:, 2] < ms.PEAK['z_to'])
    brim_front = (co[:, 0] > 0.25) & (co[:, 2] > 2.64) & (co[:, 2] < ms.PEAK['z_to'])
    peak |= brim_front; hat |= brim_front
    # the rig knows what is trunk: the points that follow the spine (not the arms, not the head and beard)
    trunk_bones = {g.index for g in mesh.vertex_groups if g.name in ('Hips', 'Spine02', 'Spine01', 'Spine', 'LeftShoulder', 'RightShoulder')}
    trunk = np.zeros(len(me.vertices))
    for v in me.vertices:
        trunk[v.index] = sum(g.weight for g in v.groups if g.group in trunk_bones)
    shirt = (co[:, 2] > ms.SHIRT[0]) & (co[:, 2] < ms.SHIRT[1]) & (trunk > 0.5)
    leg_bones = {g.index for g in mesh.vertex_groups if g.name.endswith(('UpLeg', 'Leg', 'Foot', 'ToeBase'))}
    legs = np.zeros(len(me.vertices))
    for v in me.vertices:
        legs[v.index] = sum(g.weight for g in v.groups if g.group in leg_bones)
    bands = ms.hoops(co, lum)
    for name, values in (('shirt', shirt), ('hat', hat), ('peak', peak), ('legs', legs > 0.5), ('rest_x', co[:, 0]), ('rest_y', co[:, 1]), ('rest_z', co[:, 2])):
        a = me.attributes.new(name, 'FLOAT', 'POINT')
        a.data.foreach_set('value', np.asarray(values, dtype=np.float32))
    return bands


def face_nodes(mesh):
    """Add the whistle and the blink to the material, as paint that numbers can move.
    Returns the value nodes: ring_out, ring_in, mouth_on, lid_edge, lid_on."""
    nt = mesh.data.materials[0].node_tree
    N, L = nt.nodes, nt.links
    comb = next(nd for nd in N if nd.type == 'COMBXYZ')
    blue = comb.inputs[2].links[0].from_socket               # depth * 0.45 + paint * 0.5
    add = blue.node                                          # ADD(depth part, paint part)
    paint_part = add.inputs[1].links[0].from_socket.node     # MULTIPLY(paint, 0.5)
    paint = paint_part.inputs[0].links[0].from_socket

    def val(name, v):
        nd = N.new('ShaderNodeValue'); nd.label = name; nd.outputs[0].default_value = v
        return nd

    def m(op, a, b=None):
        nd = N.new('ShaderNodeMath'); nd.operation = op
        for i, v in enumerate((a, b)):
            if v is None:
                continue
            if isinstance(v, (int, float)):
                nd.inputs[i].default_value = v
            else:
                L.new(v, nd.inputs[i])
        return nd.outputs[0]

    def attr(name):
        nd = N.new('ShaderNodeAttribute'); nd.attribute_name = name
        return nd.outputs['Fac']

    def pick(cond, a, b):
        """a where cond is 0, b where cond is 1"""
        nd = N.new('ShaderNodeMix'); L.new(cond, nd.inputs[0])
        for i, v in ((2, a), (3, b)):
            if isinstance(v, (int, float)):
                nd.inputs[i].default_value = v
            else:
                L.new(v, nd.inputs[i])
        return nd.outputs[0]

    x, y, z = attr('rest_x'), attr('rest_y'), attr('rest_z')
    front = m('GREATER_THAN', x, 0.15)
    V = {k: val(k, v) for k, v in (('ring_out', 0.08), ('ring_in', 0.04), ('mouth_on', 0.0), ('lid_edge', 2.7), ('lid_on', 0.0))}
    # where the trousers stop and the boots start: a line each side of the rolled cuff
    rings = None
    for a, b in CUFF_LINES:
        r = m('MULTIPLY', m('GREATER_THAN', z, a), m('LESS_THAN', z, b))
        rings = r if rings is None else m('MAXIMUM', rings, r)
    paint = pick(m('MULTIPLY', rings, m('GREATER_THAN', attr('legs'), 0.5)), paint, 0.0)
    # mouth: the grin is covered by beard, and a ring of pursed lips painted on it
    dz = m('SUBTRACT', z, MOUTH[1])
    d = m('SQRT', m('ADD', m('MULTIPLY', y, y), m('MULTIPLY', dz, dz)))
    cover = m('MULTIPLY', m('MULTIPLY', m('LESS_THAN', m('ABSOLUTE', y), 0.21), m('LESS_THAN', m('ABSOLUTE', m('SUBTRACT', z, MOUTH[1] - 0.01)), 0.10)), front)
    ring = m('MULTIPLY', m('LESS_THAN', d, V['ring_out'].outputs[0]), m('GREATER_THAN', d, V['ring_in'].outputs[0]))
    p1 = pick(m('MULTIPLY', cover, V['mouth_on'].outputs[0]), paint, ring)
    # eyes: a white lid comes down over each pupil, with its edge inked
    ay = m('ABSOLUTE', y)
    eye = m('MULTIPLY', m('MULTIPLY', m('GREATER_THAN', ay, 0.02), m('LESS_THAN', ay, 0.21)),
            m('MULTIPLY', m('MULTIPLY', m('GREATER_THAN', z, EYES_Z[0]), m('LESS_THAN', z, EYES_Z[1])), m('GREATER_THAN', x, 0.2)))
    eye_on = m('MULTIPLY', eye, V['lid_on'].outputs[0])
    lidded = m('GREATER_THAN', z, V['lid_edge'].outputs[0])
    edge = m('LESS_THAN', m('ABSOLUTE', m('SUBTRACT', z, V['lid_edge'].outputs[0])), 0.013)
    p2 = pick(m('MULTIPLY', eye_on, lidded), p1, 1.0)
    p3 = pick(m('MULTIPLY', eye_on, edge), p2, 0.0)
    L.new(p3, paint_part.inputs[0])
    return {k: v.outputs[0] for k, v in V.items()}


class Walk:
    def __init__(self, path):
        self.sc = common.reset()
        self.sc.render.image_settings.color_depth = '16'
        self.sc, self.arm, self.mesh, rest = load(path)
        self.stage = self.arm.parent
        self.stage_rest = self.stage.matrix_world.copy()
        bands = paint(self.mesh, rest)
        ms.material(self.mesh, bands, (50.0, 70.0))
        self.face = face_nodes(self.mesh)
        act = bpy.data.actions[0]
        self.action = act
        self.f0, self.f1 = act.frame_range
        self.phase0 = 0.0
        self.cam = common.camera(self.sc, *CELL, (0, 0, 0), CELL_GROUND, pitch=0.0)

    def bone(self, name):
        return self.arm.matrix_world @ self.arm.pose.bones[name].head

    def set_phase(self, ph):
        self.arm.animation_data.action = self.action          # the clip gives the pose; act() then takes it over
        f = self.f0 + ((ph + self.phase0) % 1.0) * (self.f1 - self.f0)
        self.sc.frame_set(int(math.floor(f)), subframe=f - math.floor(f))

    def measure(self, n=96):
        """How far he travels in a cycle (so the quay can move exactly under his boots) and when his
        right heel lands (so that it lands on the beat)."""
        self.phase0 = 0.0
        xs = {'RightFoot': [], 'LeftFoot': []}; zs = {'RightFoot': [], 'LeftFoot': []}
        for i in range(n):
            self.set_phase(i / n)
            hip = self.bone('Hips')
            for b in xs:
                p = self.bone(b)
                xs[b].append(p.x - hip.x); zs[b].append(p.z)
        out = {}
        speeds = []
        for b in xs:
            x, z = np.array(xs[b]), np.array(zs[b])
            dx = (np.roll(x, -1) - x) * n                       # per cycle
            down = (z < z.min() + 0.04) & (dx < 0)
            speeds.append(-np.median(dx[down]))
            out[b] = dict(strike=float(np.argmax(x) / n), reach=float(x.max() - x.min()))
        out['stride'] = float(np.mean(speeds))
        return out

    def set_face(self, pucker, lid):
        s = 0.45 + 0.55 * min(pucker, 1.0) + 0.6 * max(0.0, pucker - 1.0)
        self.face['ring_out'].default_value = 0.085 * s
        self.face['ring_in'].default_value = 0.040 * s
        self.face['mouth_on'].default_value = 1.0 if pucker > 0.02 else 0.0
        self.face['lid_on'].default_value = 1.0 if lid > 0.04 else 0.0
        self.face['lid_edge'].default_value = EYES_Z[1] - lid * (EYES_Z[1] - EYES_Z[0] - 0.03)

    def at_frame(self, n):
        t = (n % LOOP) / FPS
        self.set_phase(t / CYCLE_SECONDS)
        self.act((t / CYCLE_SECONDS) % 1.0, t)
        f = t * 24.0
        self.set_face(tune.pucker_at(f), tune.lid_at(f))

    def act(self, ph, t):
        """His performance, laid over the walking clip. The clip keeps his legs (and so his boots on the
        quay); everything above the hips is acted here, in the manner of the early sound cartoons:
        the whole body keeps the beat.

        World axes: he walks towards +X, his left is +Y, the camera stands at his front right (-Y)."""
        arm, W = self.arm, self.arm.matrix_world
        Wi = W.inverted()
        bpy.context.view_layer.update()
        new = {pb.name: pb.matrix.copy() for pb in arm.pose.bones}
        touched = []

        def below(name):
            out, stack = [], [arm.pose.bones[name]]
            while stack:
                b = stack.pop(); out.append(b.name); stack.extend(b.children)
            return out

        def turn(name, rot):
            """Turn a bone, and all that hangs on it, by a world rotation about the bone's joint."""
            joint = W @ new[name].translation
            d = Wi @ Matrix.Translation(joint) @ rot.to_4x4() @ Matrix.Translation(-joint) @ W
            for b in below(name):
                new[b] = d @ new[b]
            touched.append(name)

        def aim(name, to, direction):
            """Point the limb from joint `name` to joint `to` along a world direction."""
            now = ((W @ new[to].translation) - (W @ new[name].translation)).normalized()
            turn(name, now.rotation_difference(Vector(direction).normalized()).to_matrix())

        RX = lambda a: Matrix.Rotation(math.radians(a), 3, 'X')
        RY = lambda a: Matrix.Rotation(math.radians(a), 3, 'Y')
        RZ = lambda a: Matrix.Rotation(math.radians(a), 3, 'Z')
        c1, s1 = math.cos(2 * math.pi * ph), math.sin(2 * math.pi * ph)       # once a stride; his right heel lands at ph 0
        beat = t / (CYCLE_SECONDS / 2)                                        # one step, one beat of the tune
        ease = lambda x: max(0.0, min(1.0, x)) ** 2 * (3 - 2 * max(0.0, min(1.0, x)))

        # the look: as each phrase of the whistle ends he turns to us with his grin, then back to his walk
        q = (t * 24 / tune.QUAVER_FRAMES) % tune.PHRASE_QUAVERS
        look = ease((q - 12.6) / 0.9) * (1 - ease((q - 15.1) / 0.8))

        # hips: the swagger. They swing with the leading leg and drop a little as each heel lands
        turn('Hips', RZ(5.0 * c1))
        drop = Wi.to_3x3() @ Vector((0, 0, -0.03 * math.cos(4 * math.pi * (ph - 0.04))))
        for b in below('Hips'):
            new[b] = Matrix.Translation(drop) @ new[b]
        # chest: turns against the hips, rolls over the planted leg, leans into the walk, nods on the beat
        turn('Spine02', RZ(-5.0 * c1) @ RX(2.0 * s1) @ RY(3.0))
        turn('Spine01', RZ(-7.0 * c1) @ RX(2.5 * s1) @ RY(2.0 + 1.5 * math.cos(2 * math.pi * beat)))
        turn('Spine', RZ(-4.0 * c1 - 6.0 * look) @ RY(-3.0 * look))            # chest opens to us on the look
        # head: keeps time with the tune, tips from side to side, and stays on his road while the chest turns
        nod = 5.5 * math.cos(2 * math.pi * (beat - 0.06))
        turn('Head', RZ(11.0 * c1 * (1 - look) - 40.0 * look) @ RX(4.5 * math.sin(2 * math.pi * (ph + 0.1)) * (1 - 0.6 * look))
             @ RY(nod * (1 - look) - 6.0 * look))
        # arms: down by his sides, elbows bent, swinging against the legs; the forearm follows late
        for side, sy, sw, sw_late in (('Left', 1.0, math.cos(2 * math.pi * (ph - 0.04)), math.cos(2 * math.pi * (ph - 0.12))),
                                      ('Right', -1.0, -math.cos(2 * math.pi * (ph - 0.04)), -math.cos(2 * math.pi * (ph - 0.12)))):
            a = math.radians(2 + 17 * sw)
            aim(side + 'Arm', side + 'ForeArm', (math.sin(a), sy * 0.24, -math.cos(a)))
            e = a + math.radians(14 + 10 * sw_late)
            aim(side + 'ForeArm', side + 'Hand', (math.sin(e), sy * 0.12, -math.cos(e)))
        basis = {pb.name: pb.matrix_basis.copy() for pb in arm.pose.bones}
        for name in dict.fromkeys(touched):
            pb = arm.pose.bones[name]
            rest = pb.bone.matrix_local
            if pb.parent:
                basis[name] = (new[pb.parent.name] @ pb.parent.bone.matrix_local.inverted() @ rest).inverted() @ new[name]
            else:
                basis[name] = rest.inverted() @ new[name]
        # the render reads the clip again unless it is taken off: hold this pose by hand
        arm.animation_data.action = None
        for pb in arm.pose.bones:
            pb.matrix_basis = basis[pb.name]
        # squash and stretch: he lands a little squat and passes a little tall, his boots staying on the quay
        k = 0.028 * math.cos(4 * math.pi * (ph - 0.06))
        self.stage.matrix_world = Matrix.Diagonal((1 + k * 0.6, 1 + k * 0.6, 1 - k, 1)) @ self.stage_rest
        bpy.context.view_layer.update()

    def mouth_px(self):
        """Where his lips are in the cell picture, for the notes."""
        pb = self.arm.pose.bones['Head']
        rest_world = Vector((0.45, MOUTH[0], MOUTH[1]))
        aw = self.arm.matrix_world
        p = aw @ pb.matrix @ pb.bone.matrix_local.inverted() @ aw.inverted() @ rest_world
        right, up, _ = common.camera_axes(pitch=0.0)
        return [CELL_GROUND[0] + right.dot(p) * common.PX_PER_BU, CELL_GROUND[1] - up.dot(p) * common.PX_PER_BU]

    def render(self, tmp):
        return ms.render(self.sc, tmp)


if __name__ == '__main__':
    w = Walk(sys.argv[1])
    arg = lambda flag: sys.argv[sys.argv.index(flag) + 1]
    info = w.measure()
    w.phase0 = info['RightFoot']['strike']              # his right heel lands on the beat
    if '--measure' in sys.argv:
        print('MEASURE', json.dumps(info))
    if '--still' in sys.argv:
        w.at_frame(int(sys.argv[sys.argv.index('--still') + 2]))
        w.render(arg('--still') + '.raw.png').save(arg('--still'))
    if '--frames' in sys.argv:
        out = Path(arg('--frames')); out.mkdir(parents=True, exist_ok=True)
        part, parts = (int(v) for v in arg('--part').split('/')) if '--part' in sys.argv else (0, 1)
        mouths = {}
        for n in range(part, LOOP, parts):
            w.at_frame(n)
            w.render(out / f'raw.{part}.png').save(out / f'{n:04d}.png')
            mouths[n] = w.mouth_px()
        (out / f'meta.{part}.json').write_text(json.dumps(dict(stride=info['stride'], mouths=mouths)))
