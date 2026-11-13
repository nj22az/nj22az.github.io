"""Jack the Ripper (a killer is loose): the photography.

    blender -b stage.blend -P film.py -- --cast cast.blend --out <dir> [--shots a03,c1a] [--pass fg|bg|preview|qc]
                                         [--every N] [--only-frame K]

One timeline: the song's own seconds. `pose(shot, t)` puts every actor, light and the camera where they are at
second t and nothing else decides a picture, so any frame can be rendered alone, in any order, and comes out the same.

The singer is the star (the owner, 13 November 2026: "we should see the singer from dramatic angles, she is the
star, Jack the Ripper and London is the backdrop"). Her mouth makes the sung words (face_rig.py, lipsync.py).

Each shot is photographed in two passes that Remotion lays over each other:
  bg  the set without the cast, one still (or two, where the light changes), 1280 x 720;
  fg  the cast alone on a transparent film, cropped to where they stand, 960 x 540 before the crop,
      12 pictures a second (24 where the shot says so).
`manifest.json` says when each shot runs, where the crop sits and where Jack's head and right hand are.
`--pass qc` renders nothing: it walks every shot at 24 a second and measures feet that slide, feet under or over
the street, joints that jump and actors who stand in each other.
"""
import bpy, sys, os, math, json, time
from mathutils import Vector, Quaternion, Matrix
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:]
def arg(n, d=None): return argv[argv.index(n) + 1] if n in argv else d
CAST, OUT = arg('--cast'), arg('--out')
PASS = arg('--pass', 'preview'); ONLY = arg('--shots'); EVERY = int(arg('--every', '1')); ONE = arg('--only-frame')
FRACS = [float(v) for v in arg('--fracs').split(',')] if arg('--fracs') else None
SPAN = [float(v) for v in arg('--span').split(',')] if arg('--span') else None      # only pictures between these seconds
D = bpy.data; scene = bpy.context.scene
HERE = os.path.dirname(os.path.abspath(__file__))
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
BEATS = json.load(open(os.path.join(HERE, 'beats.json')))['beats']
LIPS = json.load(open(os.path.join(HERE, 'lipsync.json')))


def beat(t):
    """The song's beat as a running number: whole at each beat, with the fraction between them."""
    b = BEATS
    if t <= b[0]: return (t - b[0]) / (b[1] - b[0])
    for i in range(len(b) - 1):
        if t < b[i + 1]: return i + (t - b[i]) / (b[i + 1] - b[i])
    return len(b) - 1 + (t - b[-1]) / (b[-1] - b[-2])


def ease(u): u = max(0.0, min(1.0, u)); return u * u * (3 - 2 * u)
def lerp(a, b, u): return a + (b - a) * u
def span(t, a, b): return max(0.0, min(1.0, (t - a) / (b - a)))
def bump(t, a, b, fin=0.4, fout=0.4): return min(ease(span(t, a, a + fin)), 1 - ease(span(t, b - fout, b)))
def lip(name, t):
    v = LIPS[name]; x = t * LIPS['rate']; i = int(x)
    if i < 0 or i >= len(v) - 1: return 0.0
    return v[i] + (v[i + 1] - v[i]) * (x - i)


# ------------------------------------------------------------------ the cast
with D.libraries.load(CAST, link=False) as (src, dst):
    dst.objects = list(src.objects); dst.actions = list(src.actions)
cast_coll = D.collections.new('cast'); scene.collection.children.link(cast_coll)
for o in dst.objects: cast_coll.objects.link(o)
bpy.context.view_layer.update()


class Actor:
    def __init__(self, name, source=None):
        if source:                                   # a double: its own skeleton and object, the same mesh
            arm = source.arm.copy(); arm.data = source.arm.data; cast_coll.objects.link(arm)
            mesh = source.mesh.copy(); cast_coll.objects.link(mesh); mesh.parent = arm
            for m in mesh.modifiers:
                if m.type == 'ARMATURE': m.object = arm
            arm.name = name; mesh.name = name + '-mesh'; who = source.who
            bpy.context.view_layer.update()
        else:
            arm = D.objects[name]; mesh = D.objects[name + '-mesh']; who = name
        self.name, self.who, self.arm, self.mesh = name, who, arm, mesh
        self.parts = [c for c in arm.children]
        arm.rotation_mode = 'QUATERNION'
        self.q0 = source.q0.copy() if source else arm.rotation_quaternion.copy()
        self.rest = {b.name: (self.q0 @ b.matrix_local.to_quaternion()) for b in arm.data.bones}
        w = lambda n: arm.matrix_world @ arm.data.bones[n].head_local
        self.thigh = (w('LeftUpLeg') - w('LeftLeg')).length; self.shin = (w('LeftLeg') - w('LeftFoot')).length
        self.height = max((mesh.matrix_world @ Vector(c)).z for c in mesh.bound_box); self.ankle = w('LeftFoot').z
        self.cache = {}; self.pace = {}; self.veil = None
        self.hide()

    # -- where
    def hide(self):
        self.arm.hide_render = True; self.on = False
        for p in self.parts: p.hide_render = True
    def place(self, x, y, face=0.0, z=0.0):
        """face: degrees turned to the actor's own left from facing the audience (-Y)."""
        self.arm.hide_render = False; self.on = True
        for p in self.parts: p.hide_render = False
        self.arm.location = (x, y, z)
        self.arm.rotation_quaternion = Quaternion(Z, math.radians(face)) @ self.q0
        self.face = face

    # -- clips from Meshy
    def _curves(self, clip):
        act = D.actions[f'{self.who}:{clip}']
        if act.name not in self.cache:
            c = {}
            for fc in act.fcurves:
                bone = fc.data_path.split('"')[1]; prop = fc.data_path.rsplit('.', 1)[1]
                c.setdefault(bone, {}).setdefault(prop, {})[fc.array_index] = fc
            self.cache[act.name] = (act, c)
        return self.cache[act.name]

    def length(self, clip):
        a, _ = self._curves(clip); return (a.frame_range[1] - a.frame_range[0]) / 24.0

    def speed(self, clip):
        """Metres a second the clip walks at, measured on the clip itself: how fast the foot that is down goes back
        under the hips. Walking the actor at this speed is what keeps the feet from sliding."""
        if clip not in self.pace:
            keep = (self.arm.location.copy(), self.arm.rotation_quaternion.copy())
            self.arm.location = (0, 0, 0); self.arm.rotation_quaternion = self.q0
            n = 48; L = self.length(clip); pts = []
            for i in range(n + 1):
                self.set(self.sample(clip, L * i / n, True, True)); bpy.context.view_layer.update()
                pts.append((self.world('LeftFoot').copy(), self.world('RightFoot').copy()))
            v = []
            for i in range(n):
                k = 0 if pts[i][0].z < pts[i][1].z else 1            # the lower foot carries the weight
                v.append((pts[i + 1][k].y - pts[i][k].y) / (L / n))  # it goes back: +Y for an actor facing -Y
            v.sort(); self.pace[clip] = max(0.2, sum(v[n // 3:]) / len(v[n // 3:]))
            low = [0 if pts[i][0].z < pts[i][1].z else 1 for i in range(n)]
            self.strike_at = getattr(self, 'strike_at', {}); self.strike_at[clip] = next((i / n for i in range(1, n) if low[i] != low[i - 1]), 0.0)
            self.arm.location, self.arm.rotation_quaternion = keep
        return self.pace[clip]

    def travel(self, clip):
        """Where a clip played once leaves the hips, from where it began: metres in the character's own axes."""
        a, c = self._curves(clip); f = c['Hips']['location']
        v = lambda fr: Vector((f[0].evaluate(fr), f[1].evaluate(fr), f[2].evaluate(fr)))
        d = self.rest['Hips'] @ (v(a.frame_range[1]) - v(a.frame_range[0])) * 0.01; d.z = 0
        return d

    def sample(self, clip, sec, loop=True, inplace=None):
        a, c = self._curves(clip); f0, f1 = a.frame_range; n = f1 - f0
        u = (sec * 24.0) / n
        u = u % 1.0 if loop else max(0.0, min(1.0, u))
        fr = f0 + u * n; out = {}
        if inplace is None: inplace = loop
        for bone, props in c.items():
            q = l = None
            if 'rotation_quaternion' in props:
                r = props['rotation_quaternion']; q = Quaternion([r[i].evaluate(fr) for i in range(4)]); q.normalize()
            if 'location' in props:
                p = props['location']; l = Vector([p[i].evaluate(fr) for i in range(3)])
                if bone == 'Hips' and inplace:       # take the clip's travel out: the actor is moved by place()
                    a0 = Vector([p[i].evaluate(f0) for i in range(3)]); a1 = Vector([p[i].evaluate(f1) for i in range(3)])
                    drift = self.rest['Hips'] @ ((a1 - a0) * u); drift.z = 0
                    l = l - self.rest['Hips'].inverted() @ drift
            out[bone] = (q, l)
        return out

    def set(self, pose_a, pose_b=None, w=0.0):
        for pb in self.arm.pose.bones:
            q, l = pose_a.get(pb.name, (None, None))
            if pose_b and w > 0:
                q2, l2 = pose_b.get(pb.name, (None, None))
                if q is not None and q2 is not None: q = q.slerp(q2, w)
                if l is not None and l2 is not None: l = l.lerp(l2, w)
            pb.rotation_mode = 'QUATERNION'
            pb.rotation_quaternion = q if q is not None else Quaternion()
            pb.location = l if l is not None else Vector()

    def clip(self, name, sec, loop=True, inplace=None, into=None, w=0.0, seam=0.16):
        """Pose from a clip; `into` and `w` cross-fade to a second (clip, seconds, loop). A looped clip whose end
        does not meet its beginning (most of Meshy's do not) is led back into its first pose over its last part,
        so that the loop never jumps."""
        a = self.sample(name, sec, loop, inplace)
        if loop and seam and name not in ('walk', 'run'):          # Meshy's own walk and run close on themselves
            n = self.length(name); u = (sec / n) % 1.0
            if u > 1 - seam:
                first = self.sample(name, 0.0, loop, inplace); k = ease((u - (1 - seam)) / seam)
                a = {b: ((q.slerp(first[b][0], k) if q is not None and first.get(b, (None,))[0] is not None else q),
                         (l.lerp(first[b][1], k) if l is not None and first.get(b, (None, None))[1] is not None else l)) for b, (q, l) in a.items()}
        b = self.sample(into[0], into[1], into[2] if len(into) > 2 else True) if into else None
        self.set(a, b, w)

    # -- by hand: turns about the character's own axes (X its left, -Y its front, Z up), on top of what is set
    def rest_pose(self):
        for pb in self.arm.pose.bones:
            pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = Quaternion(); pb.location = Vector()

    def turn(self, bone, axis, deg):
        if not deg: return
        m = self.rest[bone]; pb = self.arm.pose.bones[bone]
        pb.rotation_quaternion = (m.inverted() @ Quaternion(axis, math.radians(deg)) @ m) @ pb.rotation_quaternion

    def shift(self, v):
        """Move the hips by v metres in the character's own axes."""
        pb = self.arm.pose.bones['Hips']
        pb.location = pb.location + self.rest['Hips'].inverted() @ (self.q0 @ Vector(v)) * 100.0

    def squat(self, a, splay=1.0):
        """Bend both knees by a degrees with the knees turned out (splay 1) or forward (splay 0); the hips come
        down by what the legs lose, so the feet stay on the street."""
        if not a: return
        for side, s in (('Left', 1), ('Right', -1)):
            ax = (Y * (-s * splay) + X * (-(1 - splay))).normalized()
            self.turn(side + 'UpLeg', ax, a); self.turn(side + 'Leg', ax, -2 * a); self.turn(side + 'Foot', ax, a)
        self.shift((0, 0, -(self.thigh + self.shin) * (1 - math.cos(math.radians(a)))))

    def world(self, bone):
        return self.arm.matrix_world @ self.arm.pose.bones[bone].head


ACT = {}
for n in ('jack', 'singer', 'dancer', 'constable', 'flowerwoman', 'gent', 'workman'): ACT[n] = Actor(n)
for i in (2, 3, 4): ACT[f'dancer{i}'] = Actor(f'dancer{i}', ACT['dancer'])
JACK, STAR, COP = ACT['jack'], ACT['singer'], ACT['constable']
GIRLS = [ACT['dancer'], ACT['dancer2'], ACT['dancer3'], ACT['dancer4']]
FOLK = [ACT['flowerwoman'], ACT['gent'], ACT['workman']]
JACKS = [JACK]

cam = D.objects['camera']; aim = D.objects['aim']

# Where a foot stands, the street is darker under it. The lamps here are many and soft and throw little shadow of
# their own, and a figure with no dark under its feet floats (the owner: "now he sort of floats"); so every foot
# carries a soft patch of shade on the stones, strongest when the foot is down and gone when it is lifted.
def shade_material():
    m = D.materials.new('foot-shade'); m.use_nodes = True; nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = nt.nodes.new('ShaderNodeTexCoord'); g = nt.nodes.new('ShaderNodeTexGradient'); g.gradient_type = 'SPHERICAL'
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Location'].default_value = (-1, -1, 0); mp.inputs['Scale'].default_value = (2, 2, 1)
    r = nt.nodes.new('ShaderNodeMapRange'); r.inputs['From Max'].default_value = 0.7; r.inputs['To Max'].default_value = 0.78; r.interpolation_type = 'SMOOTHSTEP'
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (0, 0, 0, 1)
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader'); L_ = nt.links.new
    L_(tc.outputs['UV'], mp.inputs[0]); L_(mp.outputs[0], g.inputs[0]); L_(g.outputs['Fac'], r.inputs['Value'])
    L_(r.outputs['Result'], mix.inputs['Fac']); L_(tr.outputs[0], mix.inputs[1]); L_(em.outputs[0], mix.inputs[2])
    L_(mix.outputs[0], nt.nodes['Material Output'].inputs['Surface']); return m
SHADE = shade_material()
for a_ in ACT.values():
    a_.shade = []
    for k in range(2):
        bpy.ops.mesh.primitive_plane_add(size=1); o = bpy.context.object; o.name = f'{a_.name}-shade-{k}'
        for c in list(o.users_collection): c.objects.unlink(o)
        cast_coll.objects.link(o); o.data.materials.append(SHADE)
        o.visible_shadow = False; o.visible_diffuse = False; o.visible_glossy = False; a_.shade.append(o)


def foot_shade():
    for a_ in ACT.values():
        for k, (ankle, toe) in enumerate((('LeftFoot', 'LeftToeBase'), ('RightFoot', 'RightToeBase'))):
            o = a_.shade[k]; o.hide_render = not a_.on
            if not a_.on: continue
            p, q = a_.world(ankle), a_.world(toe); up = max(0.0, p.z - a_.ankle)
            f = max(0.0, 1.0 - up / 0.22)
            if f <= 0.02 or p.z > 0.6: o.hide_render = True; continue
            mid = p.lerp(q, 0.55); o.location = (mid.x, mid.y, 0.006 + 0.002 * k)          # 6 and 8 mm over the street: never in its plane
            o.rotation_euler = (0, 0, math.atan2(q.y - p.y, q.x - p.x))
            s_ = a_.height / 1.7; o.scale = (0.42 * s_ * (0.6 + 0.4 * f), 0.24 * s_ * (0.6 + 0.4 * f) * f ** 0.5, 1)

# The fog is one even haze (the owner: "the fog should be uniform, now it looks painted"): the banks on the set
# lose their clouding, and so does the bank that rides in front of Jack's face, which is never to be seen.
FOG = (0.30, 0.37, 0.48)
FOG_CARDS = [o for o in D.objects if o.name.startswith(('fog-', 'ext-fog-'))]      # the painted banks: never rendered now


def veil_material():
    m = D.materials.new('veil'); m.use_nodes = True; nt = m.node_tree; nt.nodes.remove(nt.nodes['Principled BSDF'])
    tc = nt.nodes.new('ShaderNodeTexCoord'); g = nt.nodes.new('ShaderNodeTexGradient'); g.gradient_type = 'SPHERICAL'
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Location'].default_value = (-1, -1, 0); mp.inputs['Scale'].default_value = (2, 2, 1)
    r = nt.nodes.new('ShaderNodeMapRange'); r.inputs['From Min'].default_value = 0.0; r.inputs['From Max'].default_value = 0.5
    r.interpolation_type = 'SMOOTHSTEP'
    em = nt.nodes.new('ShaderNodeEmission'); em.inputs['Color'].default_value = (*FOG, 1); em.inputs['Strength'].default_value = 0.42
    tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mix = nt.nodes.new('ShaderNodeMixShader')
    L_ = nt.links.new
    L_(tc.outputs['UV'], mp.inputs[0]); L_(mp.outputs[0], g.inputs[0]); L_(g.outputs['Fac'], r.inputs['Value'])
    L_(r.outputs['Result'], mix.inputs['Fac']); L_(tr.outputs[0], mix.inputs[1]); L_(em.outputs[0], mix.inputs[2])
    L_(mix.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m
VEIL = veil_material()
bpy.ops.mesh.primitive_plane_add(size=1); JACK.veil = bpy.context.object; JACK.veil.name = 'jack-veil'
for c in list(JACK.veil.users_collection): c.objects.unlink(JACK.veil)
cast_coll.objects.link(JACK.veil); JACK.veil.data.materials.append(VEIL)
JACK.veil.visible_shadow = False; JACK.veil.visible_diffuse = False; JACK.veil.visible_glossy = False


def veils(t):
    j = JACK; v = j.veil; v.hide_render = not j.on
    if not j.on: return
    head = j.world('Head'); top = j.world('head_end'); front = j.world('headfront')
    face = head.lerp(top, 0.30) + (front - head) * 0.6
    to_cam = (cam.matrix_world.translation - face).normalized()
    v.location = face + to_cam * 0.30
    v.rotation_euler = to_cam.to_track_quat('Z', 'Y').to_euler()
    s = j.height * 0.5; v.scale = (s * 1.15, s, s)


def sing(t, amount=1.0):
    """The star's face at second t, and the breath and lift of the head that go with a sung note."""
    o, w, p, b = lip('open', t) * amount, lip('wide', t) * amount, lip('pucker', t) * amount, lip('blink', t)
    for ob in STAR.parts:
        if not ob.data.shape_keys: continue
        for k in ob.data.shape_keys.key_blocks:
            if k.name == 'open': k.value = o
            elif k.name == 'wide': k.value = w
            elif k.name == 'pucker': k.value = p
            elif k.name == 'blink': k.value = 1.0 if b >= 0.5 else 0.0      # a blink is shut or open: no half-drawn lid
        if ob.name.startswith('singer-lid'): ob.hide_render = b < 0.5 or not STAR.on           # a lid exists only while it is closing
        if ob.name == 'singer-mouth': ob.hide_render = (o < 0.02 and p < 0.02 and w < 0.02) or not STAR.on
    held = lip('open', t - 0.12)                                  # the body answers the voice a little late
    STAR.turn('Head', X, -7 * held); STAR.turn('Spine02', X, -3.5 * held); STAR.turn('neck', X, -3 * held)


# ------------------------------------------------------------------ light and set
def L(name): return D.objects[name].data
rim_l = D.lights.new('rim', 'SPOT'); rim_l.spot_size = math.radians(40); rim_l.spot_blend = 0.6; rim_l.shadow_soft_size = 0.3
rim = D.objects.new('rim', rim_l); D.collections['lights'].objects.link(rim)
rim_t = D.objects.new('rim-target', None); D.collections['lights'].objects.link(rim_t)
c_ = rim.constraints.new('TRACK_TO'); c_.target = rim_t; c_.track_axis = 'TRACK_NEGATIVE_Z'; c_.up_axis = 'UP_Y'


def lights(foot=300, front=0, wash=0, moon=1.6, gas=(520, 520, 520), spots=(), wash_col=(1.0, 0.05, 0.04), world=1.0, back=None):
    L('footlight').energy = foot; L('front').energy = front; L('wash').energy = wash; L('wash').color = wash_col
    L('moonlight').energy = moon
    for i in range(3):
        L(f'gas-{i}').energy = gas[i]
        D.objects[f'gas-glow-{i}'].data.materials[0].node_tree.nodes['level'].inputs[1].default_value = min(1.0, gas[i] / 520.0)
        L(f'spot-{i}').energy = 0
        D.objects[f'beam-{i}'].data.materials[0].node_tree.nodes['level'].inputs[1].default_value = 0.0
    for i, (target, energy, *rest) in enumerate(spots):
        s = D.objects[f'spot-{i}']; L(f'spot-{i}').energy = energy
        L(f'spot-{i}').spot_size = math.radians(rest[0] if rest else 13)
        L(f'spot-{i}').color = rest[1] if len(rest) > 1 else (1.0, 0.94, 0.82)
        D.objects[f'spot-target-{i}'].location = target
        b = D.objects[f'beam-{i}']; piv = D.objects[f'beam-pivot-{i}']
        src = Vector((s.location.x * 0.75, 1.0, 12.8)); piv.location = src
        d = Vector(target) - src; b.scale = (1, d.length / 13.0 * 1.1, 1)
        piv.rotation_euler = (-d.normalized()).to_track_quat('Z', 'Y').to_euler()
        b.data.materials[0].node_tree.nodes['level'].inputs[1].default_value = min(0.3, energy / 90000.0)
    rim_l.energy = 0
    if back:                                   # a light from behind and above: the edge of light that lifts her off the street
        target, energy, *rest = back
        rim_l.energy = energy; rim_l.color = rest[0] if rest else (0.62, 0.78, 1.0)
        rim_t.location = target; rim.location = (target[0] - 1.6, target[1] + 3.8, target[2] + 2.6)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = world


def star_light(x, y, key=24000, cone=11, rim_e=9000, **kw):
    """The star's light: a warm key from the front, a cool edge from behind."""
    kw.setdefault('front', 500); key *= 0.62                 # a soft light from the house, so that her face is not cut in two by the key
    lights(spots=[((x, y, 1.35), key, cone)] + list(kw.pop('more', [])), back=((x, y, 1.45), rim_e), **kw)


def curtains(open_):
    for n in ('curtain-L', 'curtain-R'): D.objects[n].scale.x = lerp(1.0, 0.10, open_)


def camera(pos, look, lens=35):
    cam.location = pos; aim.location = look; cam.data.lens = lens


# ------------------------------------------------------------------ the dance, pose to pose
# Jack's dance is animated as a hand animator would: a few strong poses, each hit on the beat and held a moment,
# a quick eased move to the next, the hands and the head arriving a little after the body, and a small breath of
# the beat while a pose is held. It is funny because it is absurd (a murderer on tiptoe, in a pirouette, doing the
# can-can) and done with complete elegance. Every character has Meshy's same skeleton, so anyone can dance it.
#
# A pose is a set of controls, in degrees unless said: sq (knee bend) and splay (1 knees out, 0 forward);
# lean (forward), side (to its left), twist; nod, tilt, look (the head); for each arm l_/r_: up (raised sideways from
# the rest), fwd, elbow (bent in the plane of the body), bend (bent forward), hand; for each leg l_/r_: lift
# (thigh forward), out (thigh sideways), knee (shin back); x, y, z (metres) and spin of the whole figure.
LATE = {'hand': 0.16, 'elbow': 0.10, 'bend': 0.10, 'nod': 0.12, 'tilt': 0.12, 'look': 0.08, 'up': 0.04, 'fwd': 0.04}
HOLD = 0.34                                   # the part of each step a pose is held before it moves on


def pose_at(fig, b):
    """The controls of a figure (a list of (beat, pose)) at beat b, each control arriving with its own lateness."""
    names = set(k for _, p in fig for k in p)
    out = {}
    for name in names:
        bb = b - LATE.get(name.split('_')[-1], 0.0)
        k = 0
        while k + 1 < len(fig) and fig[k + 1][0] <= bb: k += 1
        b0, p0 = fig[k]; v0 = p0.get(name, 0.0)
        if k + 1 >= len(fig): out[name] = v0; continue
        b1, p1 = fig[k + 1]; v1 = p1.get(name, 0.0); d = b1 - b0
        u = ease(span(bb, b0 + HOLD * d, b1)) if name != 'spin' else span(bb, b0, b1)
        if name in ('x', 'y'): u = ease(span(bb, b0 + 0.1 * d, b1))
        out[name] = v0 + (v1 - v0) * u
    return out


def strike(a, c, hit=0.0, mirror=False):
    """Put a figure's controls on an actor. `hit` is the breath of the beat while a pose is held."""
    g = lambda k: c.get(k, 0.0)
    a.rest_pose()
    a.squat(g('sq') + 4.0 * hit, c.get('splay', 1.0))
    a.turn('Spine', X, g('lean') * 0.5 + 1.5 * hit); a.turn('Spine01', X, g('lean') * 0.5)
    a.turn('Spine', Y, g('side') * 0.5); a.turn('Spine02', Y, g('side') * 0.5)
    a.turn('Spine01', Z, g('twist') * 0.6); a.turn('Spine02', Z, g('twist') * 0.4)
    a.turn('Head', X, g('nod') - 2.0 * hit); a.turn('Head', Y, g('tilt')); a.turn('Head', Z, g('look'))
    for sd, s, p in (('Left', 1, 'l_'), ('Right', -1, 'r_')):
        a.turn(sd + 'Arm', Y, -s * g(p + 'up')); a.turn(sd + 'Arm', X, -g(p + 'fwd'))
        a.turn(sd + 'ForeArm', Y, -s * g(p + 'elbow')); a.turn(sd + 'ForeArm', X, -g(p + 'bend'))
        a.turn(sd + 'Hand', X, g(p + 'hand'))
        a.turn(sd + 'UpLeg', X, -g(p + 'lift')); a.turn(sd + 'UpLeg', Y, -s * g(p + 'out')); a.turn(sd + 'Leg', X, g(p + 'knee'))
    a.shift((0, 0, g('z')))
    return g('x'), g('y'), g('spin')


def both(**kw):
    """The same control on both sides: both(up=40) is l_up and r_up."""
    out = {}
    for k, v in kw.items(): out['l_' + k] = v; out['r_' + k] = v
    return out


PAWS = both(fwd=42, bend=105, hand=55)                                           # the hands of a cartoon sneak
def sneak(side):
    hi = {'lift': 78, 'knee': 100}
    p = {'lean': 24, 'z': 0.035, 'look': -42 * side, 'tilt': 8 * side, **PAWS}
    p.update({('l_' if side > 0 else 'r_') + k: v for k, v in hi.items()})
    return p
DOWN = {'sq': 16, 'splay': 0.2, 'lean': 28, **PAWS}
F_SNEAK = [(0, sneak(1)), (0.5, DOWN), (1, sneak(-1)), (1.5, DOWN), (2, sneak(1)), (2.5, DOWN), (3, sneak(-1)), (3.5, {**DOWN, 'look': 0}), (4, {})]

def rattle(s): return {'sq': 42, 'splay': 1, 'side': 9 * s, 'tilt': -14 * s, **both(up=40), 'l_elbow': 82 * s, 'r_elbow': -82 * s, 'l_hand': 30 * s, 'r_hand': -30 * s}
UP_ = {'sq': 12, 'splay': 1, **both(up=42)}
F_RATTLE = [(0, rattle(1)), (0.5, UP_), (1, rattle(-1)), (1.5, UP_), (2, rattle(1)), (2.5, UP_), (3, rattle(-1)), (3.5, UP_), (4, {})]

F_PIROUETTE = [
    (0, {'sq': 30, 'splay': 1, **both(up=28, elbow=28), 'nod': 8}),                                   # the plié
    (1, {'z': 0.07, 'spin': 0, **both(up=128, elbow=42), 'r_out': 62, 'r_knee': 118, 'nod': -12}),     # up, one foot to the knee
    (3, {'z': 0.07, 'spin': 720, **both(up=128, elbow=42), 'r_out': 62, 'r_knee': 118, 'nod': -12}),   # two whole turns
    (3.5, {'sq': 38, 'splay': 1, 'spin': 720, **both(up=46), 'l_hand': -30, 'r_hand': -30, 'nod': 10}),
    (4, {'spin': 720})]

def slide(s): return {'x': 0.55 * s, 'side': -12 * s, 'sq': 8, 'splay': 0.3, 'tilt': 10 * s, ('l_' if s > 0 else 'r_') + 'up': 52,
                      ('r_' if s > 0 else 'l_') + 'fwd': 30, ('r_' if s > 0 else 'l_') + 'bend': 95, 'look': 20 * s}
F_SOFTSHOE = [(0, slide(-1)), (1, slide(1)), (2, slide(-1)),
              (3, {'lean': 42, 'sq': 10, 'splay': 0.2, 'l_up': 30, 'l_fwd': -35, 'r_fwd': 50, 'r_bend': 80, 'nod': 14}), (4, {})]   # and a bow

def kick(side):
    p = {'lean': -14, 'sq': 6, 'splay': 0.2, 'z': 0.02, **both(up=4, bend=62), 'nod': -6}
    p[('l_' if side > 0 else 'r_') + 'lift'] = 104
    return p
SET_ = {'sq': 14, 'splay': 0.2, **both(up=4, bend=62)}
F_CANCAN = [(0, kick(-1)), (0.5, SET_), (1, kick(1)), (1.5, SET_), (2, kick(-1)), (2.5, SET_),
            (3, {'z': 0.2, **both(up=132, lift=30, knee=70), 'nod': -14}), (3.5, {'sq': 30, 'splay': 1, **both(up=60)}), (4, {})]

def shim(s, d): return {'sq': d, 'splay': 1, 'twist': 13 * s, **both(up=44), 'l_fwd': 10 * s, 'r_fwd': -10 * s, 'l_hand': 25 * s, 'r_hand': -25 * s}
F_SHIMMY = [(i * 0.25, shim(1 if i % 2 == 0 else -1, 10 + 46 * math.sin(math.pi * i / 16) ** 2)) for i in range(16)] + [(4, {})]

ROUTINE = [F_RATTLE, F_SNEAK, F_PIROUETTE, F_SOFTSHOE, F_CANCAN, F_SHIMMY, F_SNEAK, F_PIROUETTE, F_RATTLE]
T_CH1, T_CH2 = 41.73, 98.30


def dance(a, t, t0, lead=0.0, start=0, figure=None):
    """Dance the routine from its chorus's first beat; `lead` beats behind (a canon), `start` bars in.
    Returns the figure's sideways and forward travel and its turn, for place()."""
    b = beat(t) - beat(t0) - lead
    if b < 0: b = 0.0
    k = (int(b // 4) + start) % len(ROUTINE)
    fig = figure or ROUTINE[k]; nxt = figure or ROUTINE[(k + 1) % len(ROUTINE)]
    # a figure ends by going into the first pose of the next, keeping whatever turn it has made
    last = dict(nxt[0][1]); last['spin'] = fig[-2][1].get('spin', 0.0) if len(fig) > 1 else 0.0
    fig = fig[:-1] + [(4, last)]
    hit = (0.5 + 0.5 * math.cos(2 * math.pi * (b % 1.0))) ** 2
    return strike(a, pose_at(fig, b % 4.0), hit)


def dance_at(a, t, t0, x, y, face=0.0, **kw):
    dx, dy, spin = dance(a, t, t0, **kw)
    c, s = math.cos(math.radians(face)), math.sin(math.radians(face))
    a.place(x + dx * c + dy * s, y + dx * s - dy * c, face + spin)


def polly(t, x, y, face=0.0, **gesture):
    """Polly standing and singing: a stance posed by hand (Meshy's idle looks away over its shoulder, which no
    close-up survives): arms down and a little forward, the weight going slowly from foot to foot, the chest
    breathing. A shot adds its own gesture as controls (l_up, r_fwd, look, nod ...), then her face sings."""
    sway = math.sin(t * 0.9); br = math.sin(t * 1.7)
    c = {'l_up': -34, 'r_up': -36, 'l_bend': 16 + 3 * br, 'r_bend': 20 - 3 * br, 'l_fwd': 4, 'r_fwd': 6, 'l_hand': 8, 'r_hand': 8,
         'side': 2.2 * sway, 'tilt': -2.5 * sway, 'twist': 2.0 * math.sin(t * 0.6), 'lean': -2 + 1.0 * br, 'sq': 2.5 + 1.5 * abs(sway), 'splay': 0.3}
    g = gesture.pop('groove', 0.0)
    if g:                                                            # the chorus: hips and shoulders go with the beat
        b = beat(t); sw = math.sin(math.pi * b)
        c['side'] += 7 * g * sw; c['tilt'] -= 6 * g * sw; c['twist'] += 9 * g * math.sin(math.pi * b + 0.6)
        c['sq'] += 5 * g * (0.5 + 0.5 * math.cos(2 * math.pi * b)); c['l_up'] += 10 * g * sw; c['r_up'] -= 10 * g * sw
    for k, v in gesture.items(): c[k] = c.get(k, 0.0) + v
    ph = beat(t) % 1.0; hit = (0.5 + 0.5 * math.cos(2 * math.pi * ph)) ** 2
    STAR.place(x, y, face); strike(STAR, c, hit * 0.5); sing(t)


def to_lens(x, y):
    """The turn that faces an actor at (x, y) straight to the camera."""
    c = cam.location; return math.degrees(math.atan2(c.x - x, -(c.y - y)))


def bob(a, t, amt=1.0):
    """A small breath of the beat on top of a clip, so that nobody stands outside the music."""
    ph = beat(t) % 1.0; hit = (0.5 + 0.5 * math.cos(2 * math.pi * ph)) ** 2
    a.turn('Spine01', X, 2.5 * hit * amt); a.turn('Head', X, -3 * hit * amt)


def walk(a, clip, t, t0, x0, y0, x1, y1, face=None, rate=1.0, arrive=None):
    """Walk from one mark towards another at the clip's own measured speed, so that the feet do not slide; the
    actor stops on the second mark. Returns how far along (0 to 1)."""
    v = a.speed(clip) * rate
    dist = math.hypot(x1 - x0, y1 - y0)
    if arrive is not None: t0 = arrive - dist / v                 # set off so as to be there at that second
    u = max(0.0, min(1.0, (t - t0) * v / max(0.01, dist)))
    f = math.degrees(math.atan2((x1 - x0), -(y1 - y0))) if face is None else face
    a.place(lerp(x0, x1, u), lerp(y0, y1, u), f)
    if u < 1.0 or clip == 'run': a.clip(clip, (t - t0) * rate)
    else:                                                         # arrived: the walk settles into standing
        k = ease(span(t, t0 + dist / v, t0 + dist / v + 0.45)); a.clip(clip, (t0 + dist / v - t0) * rate)
        for pb in a.arm.pose.bones:
            pb.rotation_quaternion = pb.rotation_quaternion.slerp(Quaternion(), k)
            if pb.name != 'Hips': pb.location = pb.location.lerp(Vector(), k)
    return u


def stalk(a, t, t_ref, x0, y0, x1, y1, lean=10.0):
    """Jack's walk in the opening: slow and heavy, one step to a beat of the song, each heel coming down on the
    beat, the body sinking into every step. He covers a stride for every step, so nothing slides."""
    v = a.speed('walk'); L = a.length('walk'); ph0 = a.strike_at['walk']
    cyc = (beat(t) - beat(t_ref)) * 0.5                               # two steps to a cycle of the clip
    dist = math.hypot(x1 - x0, y1 - y0); u = cyc * v * L / dist
    a.place(lerp(x0, x1, u), lerp(y0, y1, u), math.degrees(math.atan2((x1 - x0), -(y1 - y0))))
    a.clip('walk', ((cyc + ph0) % 1.0) * L)
    hit = (0.5 + 0.5 * math.cos(2 * math.pi * (beat(t) % 1.0))) ** 3  # 1 as the heel lands
    a.shift((0, 0, -0.035 * hit)); a.turn('Spine', X, lean + 3 * hit); a.turn('Spine02', X, lean * 0.5); a.turn('Head', X, 8)
    a.turn('LeftArm', Y, 12); a.turn('RightArm', Y, -12)                                            # the arms hang close, under the cloak


def passer(a, t, t0, y, direction=1, x0=-10.5, rate=1.0):
    """One of the ordinary people of Whitechapel, crossing the street on their own business."""
    walk(a, 'walk', t, t0, x0 * direction, y, -x0 * direction, y + 0.3, rate=rate)


# ------------------------------------------------------------------ the shots
SHOTS = []
def shot(name, t0, t1, plates=None, fps=12):
    def deco(fn): SHOTS.append(dict(name=name, t0=t0, t1=t1, fn=fn, plates=plates or [t0], fps=fps)); return fn
    return deco


def line(n, width, y, i): return (-width / 2 + width * i / (n - 1), y)
EXTERIOR = ('s00_pub', 's12_skyline')


@shot('s00_pub', 0.0, 6.0)
def s00(t):   # the house: the pub on its corner under the moon
    camera((-2.5, -86, 1.5), (0.5, -60, 7.0), 30)


@shot('s12_skyline', 63.59, 68.3)
def s12(t):   # "The air smells sharp, like iron and rain": the roofs, the tower and the dome
    camera((-9, -90, 10), (0, -40, 17.5), 38)


@shot('a01_wide', 4.5, 8.3)
def a01(t):   # the curtain parts on Whitechapel: people about their evening, and she comes down the street. "Footsteps..."
    camera((0, -15.5, 3.3), (0, 4, 3.9), 30)
    star_light(0, lerp(8.2, 5.2, span(t, 5.0, 8.3)), key=30000, cone=9, foot=260, moon=1.8)
    walk(STAR, 'walk', t, 4.6, 0, 8.6, 0, 3.0, face=0); sing(t)
    passer(FOLK[0], t, 1.0, 6.4, 1); passer(FOLK[1], t, 0.0, 7.6, -1); passer(FOLK[2], t, 3.0, 9.4, 1)


@shot('a02_feet', 8.3, 10.3, fps=24)
def a02(t):   # "Footsteps echo...": the song says footsteps, so the picture is footsteps: one pair of boots, alone, on the wet stones
    camera((-0.7, 1.9, 0.09), (0.35, 3.5, 0.2), 50)
    lights(foot=30, moon=2.6, gas=(700, 520, 520), spots=[((0.2, 3.5, 0), 16000, 26, (0.6, 0.75, 1.0))], back=((0.2, 3.5, 0.2), 14000))
    stalk(JACK, t, 9.3, 0.9, 3.55, -7.0, 3.4)


@shot('a02b_cobblestone', 10.3, 12.29)
def a02b(t):  # "...on the cobblestone": from the cobbles, looking up at her as she comes
    camera((0.8, -0.3, 0.32), (0.0, 3.4, 1.3), 30)
    star_light(0, 3.4, foot=120, moon=2.2)
    walk(STAR, 'walk', t, 4.6, 0, 8.6, 0, 3.0, face=0); sing(t)
    passer(FOLK[1], t, 0.0, 7.6, -1); passer(FOLK[2], t, 3.0, 9.4, 1)


@shot('a03_shadow', 12.29, 18.75, plates=[12.29, 18.0])
def a03(t):   # "A shadow slips where the gaslight's blown": her face near, the shadow passing far behind her shoulder
    camera((1.5, 1.2, 1.5), (-0.5, 2.9, 1.5), 55)
    out = span(t, 16.2, 16.9); fl = 1.0 - out * (0.86 + 0.14 * math.sin(t * 60))
    star_light(-0.5, 2.9, key=20000, foot=40, moon=2.4, gas=(620 * max(0.0, fl), 520, 520))
    polly(t, -0.5, 2.9, to_lens(-0.5, 2.9) - 26, look=lerp(8, -58, ease(span(t, 15.6, 17.0))), r_fwd=22 * bump(t, 13.0, 15.5), r_bend=50 * bump(t, 13.0, 15.5))   # she feels him pass and looks round
    stalk(JACK, t, 13.2, -1.2, 7.6, -9.5, 6.6, lean=16)


@shot('a04_moon', 18.75, 24.65)
def a04(t):   # "Fog whispers secrets to the moon": from her feet, the moon over her shoulder
    camera((1.1, 3.2, 0.5), (1.7, 5.2, 1.7), 35)
    star_light(1.6, 5.0, key=26000, cone=12, foot=60, moon=2.4)
    k = bump(t, 20.2, 24.6, 1.4, 0.9)
    polly(t, 1.6, 5.0, to_lens(1.6, 5.0) + 14, r_up=118 * k, r_elbow=18 * k, r_hand=-20 * k, nod=-20 * k, look=-22 * k, lean=-6 * k)   # she lifts a hand to the moon


@shot('a05_alone', 24.65, 27.6, fps=24)
def a05(t):   # "Alone": her face, and nothing else
    camera((0.22, 1.95, 1.5), (0.0, 3.2, 1.5), 85)
    star_light(0, 3.2, key=22000, cone=7, rim_e=14000, foot=20, moon=1.0, gas=(160, 160, 160))
    k = ease(span(t, 25.6, 27.2)); polly(t, 0, 3.2, to_lens(0, 3.2), nod=10 * k, tilt=7 * k, look=-6 * k)


@shot('a06_scream', 27.6, 33.67)
def a06(t):   # "A scream gets swallowed by the night": from high above; the street empties round her
    camera((0.4, 0.0, 5.4), (0, 3.5, 1.0), 32)
    star_light(0, 3.4, key=34000, cone=10, foot=140, moon=1.8)
    k = bump(t, 27.7, 32.6, 0.5, 1.2)
    polly(t, 0, 3.4, 0, l_up=88 * k, r_up=88 * k, l_elbow=20 * k, r_elbow=20 * k, nod=-30 * k, lean=-8 * k)        # arms thrown wide, face to the flies
    for i, g in enumerate(GIRLS[:3]):                                              # the dancers scatter
        ang = math.radians(-50 + 100 * i / 2); x0, y0 = 2.2 * math.sin(ang), 5.6 + 1.0 * math.cos(ang)
        if t < 28.4 + i * 0.15: g.place(x0, y0, 180 - math.degrees(ang)); g.clip('idle', t + i)
        else:
            st = 28.4 + i * 0.15; walk(g, 'run', t, st, x0, y0, x0 + 12 * math.sin(ang), y0 + 7 * math.cos(ang))
            if t < st + 0.35: g.clip('run', t - st, into=('idle', t + i), w=1 - ease(span(t, st, st + 0.35)))       # she starts from standing, not from mid-stride
    if walk(COP, 'run', t, 0, 9.5, 2.6, 3.0, 2.6, arrive=31.0) >= 1.0:
        COP.clip('run', 0.0, into=('torch', t - 31.0), w=ease(span(t, 31.0, 31.5)))
    passer(FOLK[1], t, 21.0, 7.9, 1, rate=1.25)


@shot('a07_blade', 33.67, 36.5)
def a07(t):   # "A blade gleams silver": over her shoulder, the figure under the moon
    camera((0.6, 0.3, 1.55), (-0.6, 8.0, 1.7), 40)
    star_light(-0.3, 1.9, key=7000, rim_e=5000, foot=14, moon=3.2, gas=(240, 240, 400), more=[((0.3, 8.4, 1.0), 15000, 22, (0.6, 0.75, 1.0))])
    polly(t, -0.3, 1.9, 172, look=-10)
    JACK.place(0.3, 8.4, 10); JACK.clip('idle', t - 33, into=('slash', max(0.0, (t - 34.3) * 0.6), False), w=ease(span(t, 34.1, 34.6)), seam=0)


@shot('a08_light', 36.5, 41.73)
def a08(t):   # "Catches light": she turns to us, and the light finds her
    camera((-1.4, -0.5, 1.2), (-0.3, 1.9, 1.42), 50)
    star_light(-0.3, 1.9, key=lerp(9000, 30000, ease(span(t, 36.6, 38.0))), rim_e=10000, foot=60, moon=2.6)
    k = bump(t, 37.4, 40.4, 0.7, 0.8)
    polly(t, -0.3, 1.9, lerp(172, to_lens(-0.3, 1.9) - 10, ease(span(t, 36.5, 37.7))), l_fwd=40 * k, l_bend=70 * k, nod=-10 * ease(span(t, 39.8, 41.4)))


def backdrop_dance(t, T, where=((1.4, 7.0), (-1.2, 7.8), (3.4, 8.2)), who=None, face=0.0):
    """Jack and those who have fallen in with him, dancing the same dance upstage, the others a quarter-beat behind
    each other like a row of skeletons."""
    dance_at(JACK, t, T, *where[0], face)
    for i, a in enumerate(who or []):
        dance_at(a, t, T, *where[1 + i], face, lead=0.25 * (i + 1))


@shot('c1a_dance', 41.73, 44.0, fps=24)
def c1a(t):   # "Jack the Ripper": he dances, alone, in the mist
    camera((0, -1.4, 0.9), (0, 4.6, 1.2), 30)
    lights(foot=90, moon=3.0, wash=2500, wash_col=(0.25, 0.5, 1.0), gas=(300, 300, 300), spots=[((0, 4.6, 0.9), 15000, 20, (0.7, 0.85, 1.0))], back=((0, 4.6, 1.2), 8000))
    dance_at(JACK, t, T_CH1, 0, 4.6)


@shot('c1b_demon', 44.0, 47.07)
def c1b(t):   # "The demon of Whitechapel": she sings it from below; behind her he dances on
    camera((-0.1, 0.5, 0.55), (0.1, 3.6, 1.5), 32)
    star_light(-0.5, 2.6, foot=90, moon=3.0, wash=2500, wash_col=(0.25, 0.5, 1.0), more=[((1.4, 7.0, 0.9), 12000, 22, (0.7, 0.85, 1.0))])
    k = bump(t, 44.0, 47.07, 0.5, 0.4); polly(t, -0.5, 2.6, to_lens(-0.5, 2.6) + 8, groove=1, l_up=74 * k, l_elbow=30 * k, l_hand=-25 * k, nod=-8 * k)
    backdrop_dance(t, T_CH1)


@shot('c1c_smoke', 47.07, 52.34)
def c1c(t):   # "He moves like smoke / his steps unravel": the constable has caught the dance instead of the man
    camera((-3.3, 1.2, 1.25), (0.5, 4.3, 1.3), 35)
    star_light(-0.7, 3.0, foot=90, moon=3.0, wash=2500, wash_col=(0.25, 0.5, 1.0), more=[((1.6, 6.0, 0.9), 12000, 26, (0.7, 0.85, 1.0))])
    k = bump(t, 48.9, 52.3, 0.6, 0.5); polly(t, -0.7, 3.0, to_lens(-0.7, 3.0) + 30, groove=1, look=-24, r_fwd=50 * k, r_bend=30 * k, r_up=30 * k)   # a hand drawn through the air, like smoke
    backdrop_dance(t, T_CH1, where=((1.4, 5.6), (3.0, 6.6)), who=[COP], face=-50)


def blood(t, T):   # "Blood on the streets / the devil's chapel": the whole house in red, and she at the front of it
    camera((0.0, -1.0, 0.42), (0, 3.0, 1.55), 26)
    star_light(0, 1.9, key=26000, cone=13, foot=520, moon=2.4, wash=9000, gas=(200, 200, 200))
    STAR.place(0, 1.9, 0); STAR.clip('jazz', (t - T) * 0.92, into=('cheer', (t - T) * 0.8), w=0.35); sing(t)
    for i, g in enumerate(GIRLS):
        x0, y0 = line(4, 7.2, 5.0, i); per = (BEATS[60] - BEATS[56]) / 2.0
        g.place(x0, y0, 0); g.clip('kick', (t - T) / per * g.length('kick'))
    dance_at(JACK, t, T, 0, 7.8, start=4)                                          # his own can-can, behind theirs


@shot('c1d_blood', 52.34, 57.85)
def c1d(t): blood(t, T_CH1)


@shot('c1e_grapple', 57.85, 60.0)
def c1e(t):   # "Jack the Ripper": the constable runs at him, and closes his arms on smoke
    camera((0.5, -3.0, 1.5), (0.4, 4.2, 1.3), 30)
    lights(foot=160, moon=2.6, wash=3000, wash_col=(0.25, 0.5, 1.0), gas=(420, 420, 420), spots=[((0, 4.2, 1.0), 16000, 20)], back=((0, 4.2, 1.2), 7000))
    if t < 59.55: dance_at(JACK, t, T_CH1, 0, 4.2)
    grab = 59.2
    if walk(COP, 'run', t, 0, 9.0, 4.3, 1.25, 4.3, arrive=grab) >= 1.0:
        COP.clip('run', 0.0, into=('grab', (t - grab) / 1.2, False), w=ease(span(t, grab, grab + 0.25)))


@shot('c1f_noone', 60.0, 63.59)
def c1f(t):   # "No one to grapple": she knows it, and smiles
    camera((-1.0, 1.0, 1.3), (0.15, 3.0, 1.47), 60)
    star_light(0.2, 3.0, foot=120, moon=2.6, wash=2000, wash_col=(0.25, 0.5, 1.0))
    polly(t, 0.2, 3.0, to_lens(0.2, 3.0) - 12, tilt=8 * math.sin((t - 60.0) * 1.9), look=6, l_up=26 * bump(t, 60.2, 62.6), r_up=26 * bump(t, 60.2, 62.6), l_hand=-30, r_hand=-30)   # a small shrug
    COP.place(2.6, 6.2, -30); COP.clip('dumbfounded', t - 60.0)


@shot('v2a_city', 68.3, 76.28)
def v2a(t):   # "The city hides its darkest stain": she walks through the people of Whitechapel, who look at nothing
    camera((0.2, 0.0, 1.35), (0.0, 3.2, 1.2), 34)
    v = STAR.speed('walk') * 0.8; x = -3.4 + (t - 68.0) * v
    star_light(x, 3.2, key=22000, cone=12, foot=200, moon=2.0)
    cam.location.x = x + 0.4; aim.location.x = x                                   # the camera travels beside her
    STAR.place(x, 3.2, 90); STAR.clip('walk', (t - 68.0) * 0.8); sing(t); STAR.turn('Head', Z, -52); STAR.turn('Spine02', Z, -16)
    passer(FOLK[0], t, 60.0, 5.4, -1); passer(FOLK[1], t, 62.5, 6.6, -1); passer(FOLK[2], t, 65.0, 7.7, 1)
    walk(COP, 'search', t, 60.0, -9.5, 8.6, 9.5, 8.8)


@shot('v2b_hats', 76.28, 79.0)
def v2b(t):   # "Hats pulled low": they pass him in the street, and he lifts his hat to them
    camera((4.2, -0.4, 1.3), (0.3, 5.6, 1.35), 38)
    lights(foot=60, moon=2.6, gas=(520, 640, 520), spots=[((0.5, 5.4, 1.0), 9000, 30)], back=((0.5, 5.6, 1.2), 5000))
    passer(FOLK[1], t, 70.6, 4.6, 1); passer(FOLK[2], t, 70.0, 5.6, 1); passer(FOLK[0], t, 69.5, 7.6, -1)
    walk(JACK, 'strut', t, 72.6, 8.5, 6.5, -8.5, 6.6)
    k = bump(t, 76.9, 78.6, 0.5, 0.5)
    JACK.turn('RightArm', Y, 62 * k); JACK.turn('RightForeArm', Y, 96 * k); JACK.turn('Head', X, 14 * k)


@shot('v2c_name', 79.0, 84.5)
def v2c(t):   # "No one speaks his name": close, from below, half a whisper
    camera((-0.75, 1.5, 1.15), (0.2, 3.0, 1.49), 62)
    star_light(0.2, 3.0, key=18000, cone=8, rim_e=12000, foot=40, moon=2.4)
    polly(t, 0.2, 3.0, to_lens(0.2, 3.0) - 8, look=11 * math.sin((t - 79.0) * 2.3) * bump(t, 80.2, 83.6, 0.4, 0.8), nod=6, r_fwd=40 * bump(t, 79.4, 82.5), r_bend=95 * bump(t, 79.4, 82.5))   # a hand comes up towards her lips


@shot('v2d_knives', 84.5, 91.2)
def v2d(t):   # "Knives carve stories in the dark": she in front; behind her his arm, and the silver it draws in the air
    camera((0.1, 0.2, 1.42), (-0.2, 6.2, 1.5), 40)
    star_light(-0.75, 2.1, key=20000, foot=14, moon=3.4, gas=(160, 160, 300), more=[((1.0, 6.4, 1.0), 26000, 18, (0.6, 0.75, 1.0))])
    polly(t, -0.75, 2.1, to_lens(-0.75, 2.1) + 16, l_fwd=30 * bump(t, 85.2, 90.6), l_bend=60 * bump(t, 85.2, 90.6), tilt=-6)
    k = max(0.0, (t - 84.9) * 0.7); n = JACK.length('slash'); cyc = k % n; turn = int(k // n) % 2
    side = lerp(-25 + 50 * (1 - turn), -25 + 50 * turn, ease(span(cyc, 0.0, 0.3))) if k >= n else -25
    JACK.place(1.0, 6.4, side); JACK.clip('idle', t, into=('slash', cyc, False), w=bump(cyc, 0.0, n, 0.3, 0.35) * ease(span(t, 84.7, 85.1)))


@shot('v2e_art', 91.2, 98.3)
def v2e(t):   # "Each cut a twisted work of art": from the flies; she turns at the centre of the ring
    camera((0, 0.6, 7.6), (0, 4.0, 0.8), 28)
    star_light(0, 4.0, key=34000, cone=10, foot=260, moon=2.2, wash=5000)
    turn = 300 * ease(span(t, 91.6, 97.6))
    k = bump(t, 91.6, 98.3, 1.0, 0.8)
    polly(t, 0, 4.0, turn, l_up=80 * k, r_up=80 * k, l_elbow=16 * k, r_elbow=16 * k, nod=-26, lean=-6)
    for i, g in enumerate(GIRLS):
        ang = math.radians(45 + 90 * i)
        g.place(2.7 * math.sin(ang), 4.0 + 2.7 * math.cos(ang), 180 - math.degrees(ang)); g.clip('jazz', (t - 91.2) * 0.92)
    JACK.place(0, 8.2, 0); JACK.clip('bow', (t - 92.2) * 0.95, loop=False, inplace=False)


@shot('c2a_dance', 98.3, 100.9, fps=24)
def c2a(t):   # "Jack the Ripper": the dance again, from the cobbles, and now he is not alone in it
    camera((1.5, -1.0, 0.34), (0, 4.6, 1.4), 28)
    lights(foot=90, moon=3.0, wash=2500, wash_col=(0.25, 0.5, 1.0), gas=(300, 300, 300), spots=[((0, 4.6, 0.9), 15000, 24, (0.7, 0.85, 1.0))], back=((0, 4.6, 1.2), 8000))
    dance_at(JACK, t, T_CH2, 0, 4.4, start=2)
    dance_at(COP, t, T_CH2, -2.3, 5.6, start=2, lead=0.25); dance_at(FOLK[1], t, T_CH2, 2.3, 5.6, start=2, lead=0.5)


@shot('c2b_demon', 100.9, 103.95)
def c2b(t):   # "The demon of Whitechapel": her face from under the chin, the dancers a blur of limbs behind
    camera((0.85, 1.3, 0.85), (-0.2, 2.9, 1.5), 45)
    star_light(-0.2, 2.9, foot=90, moon=3.0, wash=2500, wash_col=(0.25, 0.5, 1.0), more=[((-1.6, 7.0, 0.9), 12000, 26, (0.7, 0.85, 1.0))])
    k = bump(t, 100.9, 103.95, 0.5, 0.4); polly(t, -0.2, 2.9, to_lens(-0.2, 2.9) - 14, groove=1, r_up=82 * k, r_elbow=24 * k, r_hand=-25 * k, nod=-10 * k)
    backdrop_dance(t, T_CH2, where=((-1.6, 7.0), (-3.6, 7.8), (0.4, 8.0)), who=[COP, FOLK[1]])


@shot('c2c_smoke', 103.95, 109.15)
def c2c(t):   # "He moves like smoke / his steps unravel": the street has joined: constable, clerk, flower seller
    camera((-1.3, -0.9, 1.05), (0.5, 3.6, 1.25), 34)
    star_light(0, 3.0, foot=90, moon=3.0, wash=2500, wash_col=(0.25, 0.5, 1.0), more=[((1.6, 5.4, 0.9), 14000, 30, (0.7, 0.85, 1.0))])
    k = bump(t, 105.6, 109.1, 0.6, 0.5); polly(t, 0, 3.0, to_lens(0, 3.0) + 6, groove=1.2, l_up=40 * k, r_up=40 * k, l_bend=40 * k, r_bend=40 * k)
    backdrop_dance(t, T_CH2, where=((1.5, 5.2), (3.4, 6.2), (-0.4, 6.6), (5.0, 7.4)), who=[COP, FOLK[1], FOLK[0]])


# 109.15 to 114.6, the second "Blood on the streets", is c1d's photography again, mirrored in the edit.


@shot('c2e_finale', 114.6, 119.6)
def c2e(t):   # "Jack the Ripper / no one to grapple": the last of the song is hers
    camera((0.3, 1.0, 1.05), (0, 3.0, 1.5), 50)
    star_light(0, 3.0, key=30000, cone=9, rim_e=13000, foot=160, moon=2.6, wash=2500, wash_col=(0.25, 0.5, 1.0))
    k = ease(span(t, 116.2, 118.4))
    polly(t, 0, 3.0, to_lens(0, 3.0), l_up=96 * k, r_up=96 * k, l_elbow=22 * k, r_elbow=22 * k, nod=-14 * k, lean=-5 * k)                # the last note: arms rising
    dance_at(JACK, t, T_CH2, 1.6, 7.4, start=2)


@shot('c2f_bow', 119.6, 126.7)
def c2f(t):   # he bows and goes out like smoke; the constable closes his arms on nothing; she takes the house's bow
    camera((0.0, -3.7, 1.6), (0, 4.0, 1.35), 28)
    star_light(0, 2.6, key=28000, cone=12, foot=220, moon=2.8, wash=2500, wash_col=(0.25, 0.5, 1.0), more=[((1.8, 6.4, 1.0), 14000, 16)])
    k = bump(t, 121.3, 124.6, 0.9, 0.9)
    polly(t, 0, 2.6, 0, lean=46 * k, nod=18 * k, sq=14 * k, l_up=30 * k, r_up=30 * k, l_fwd=-20 * k, r_fwd=-20 * k)                  # her bow to the house
    if t < 122.9: JACK.place(1.8, 6.4, 0); JACK.clip('idle', t, into=('bow', (t - 119.9) * 1.25, False), w=ease(span(t, 119.7, 120.2)))
    a0 = 120.6; grab = 123.1
    if True:
        if walk(COP, 'run', t, 0, -9.5, 6.5, 0.75, 6.5, arrive=grab) >= 1.0:
            end = grab + COP.length('grab') * 1.2
            COP.clip('run', 0.0, into=('grab', (t - grab) / 1.2, False), w=ease(span(t, grab, grab + 0.25)))
            if t > end - 0.3:                                                      # he straightens up where the grab left him, and looks about
                COP.clip('grab', 99, loop=False, inplace=True, into=('dumbfounded', t - end), w=ease(span(t, end - 0.3, end + 0.5)))


# ------------------------------------------------------------------ rendering
def pose(sh, t):
    ext = sh['name'] in EXTERIOR
    for o in D.collections['exterior'].objects: o.hide_render = not ext
    for cn in ('set', 'lights'):
        for o in D.collections[cn].objects: o.hide_render = ext
    for o in D.collections['fx'].objects: o.hide_render = ext or scene.render.film_transparent or o.name.startswith('petal')
    for o in FOG_CARDS: o.hide_render = True
    for a in ACT.values(): a.hide()
    curtains(1.0)
    sh['fn'](t)
    bpy.context.view_layer.update()
    veils(t); foot_shade()
    bpy.context.view_layer.update()


def settings(kind):
    r = scene.render; c = scene.cycles
    r.engine = 'CYCLES'; c.use_denoising = True; c.use_adaptive_sampling = True; c.adaptive_threshold = 0.05
    c.max_bounces = 4; c.diffuse_bounces = 1; c.glossy_bounces = 2; c.transparent_max_bounces = 16; c.transmission_bounces = 2
    c.caustics_reflective = c.caustics_refractive = False; c.sample_clamp_indirect = 4
    r.use_persistent_data = True; r.image_settings.file_format = 'PNG'; r.image_settings.compression = 30
    scene.view_settings.view_transform = 'AgX'; scene.view_settings.look = 'AgX - Medium High Contrast'
    setc = D.collections['set'].objects; fx = D.collections['fx'].objects
    fg = kind == 'fg'
    r.film_transparent = fg; r.image_settings.color_mode = 'RGBA' if fg else 'RGB'
    for o in setc:
        # in the cast's pass the street catches the cast's shadows only: the set still hides the cast where it stands
        # in front of them, but throws no shadow of its own there (its shade is already in the plate)
        o.is_shadow_catcher = fg and o.name in ('street', 'apron'); o.is_holdout = fg and o.name not in ('street', 'apron')
        o.visible_shadow = not fg or o.name in ('street', 'apron')
    for o in fx: o.hide_render = fg or o.name.startswith('petal')
    haze(kind != 'fg')
    if kind == 'fg': r.resolution_x, r.resolution_y, c.samples = 960, 540, 5
    elif kind == 'bg': r.resolution_x, r.resolution_y, c.samples = 1280, 720, 20
    else: r.resolution_x, r.resolution_y, c.samples = 960, 540, 8
    r.resolution_percentage = 100


def haze(on):
    """One even fog: the plate is mixed towards the fog's colour by how far each thing is from the lens, in the
    compositor, from the mist pass. No cloud, no brushwork; what is far is paler, and that is all."""
    scene.use_nodes = on; bpy.context.view_layer.use_pass_mist = on
    if not on: return
    ms = scene.world.mist_settings; ms.start = 1.5; ms.depth = 26.0; ms.falloff = 'LINEAR'
    nt = scene.node_tree; nt.nodes.clear()
    rl = nt.nodes.new('CompositorNodeRLayers'); mix = nt.nodes.new('CompositorNodeMixRGB'); out = nt.nodes.new('CompositorNodeComposite')
    k = nt.nodes.new('CompositorNodeMath'); k.operation = 'MULTIPLY'; k.inputs[1].default_value = 0.62
    mix.inputs[2].default_value = (*[v * 0.55 for v in FOG], 1)
    nt.links.new(rl.outputs['Mist'], k.inputs[0]); nt.links.new(k.outputs[0], mix.inputs[0])
    nt.links.new(rl.outputs['Image'], mix.inputs[1]); nt.links.new(mix.outputs[0], out.inputs['Image'])


def region():
    """The part of the picture the cast and their shadows can be in: only that is rendered in the cast's pass."""
    xs, ys = [], []
    for a in ACT.values():
        if not a.on: continue
        for b in a.arm.pose.bones:
            p = a.world(b.name)                       # heads only: the imported bones' tails are not the joints
            for dx, dz in ((0, 0), (0.5, 0), (-0.5, 0), (0, 0.55), (0, -0.25)):
                q = world_to_camera_view(scene, cam, p + Vector((dx, 0, dz)))
                if q.z > 0: xs.append(q.x); ys.append(q.y)
        g = a.arm.matrix_world.translation
        for dx, dy in ((0.8, 0.3), (-0.8, 0.3), (0, 1.2), (0, -0.3)):                       # where its shadow can fall
            q = world_to_camera_view(scene, cam, Vector((g.x + dx, g.y + dy, 0)))
            if q.z > 0: xs.append(q.x); ys.append(q.y)
    if not xs: return None
    x0, x1, y0, y1 = max(0, min(xs) - 0.02), min(1, max(xs) + 0.02), max(0, min(ys) - 0.02), min(1, max(ys) + 0.02)
    if x1 - x0 < 0.01 or y1 - y0 < 0.01: return None
    return x0, x1, y0, y1


def track(a, bone):
    p = world_to_camera_view(scene, cam, a.world(bone)); return [round(p.x, 4), round(1 - p.y, 4)]


def qc(todo):
    """Quality control without a render: every shot walked at 24 a second and measured."""
    print('QC  shot           actor        slide m/s  under m  over m   jump deg  crowding', flush=True)
    for sh in todo:
        if sh['name'] in EXTERIOR: continue
        n = int((sh['t1'] - sh['t0']) * 24); prev = {}; worst = {}
        for f in range(n + 1):
            t = sh['t0'] + f / 24.0; pose(sh, t)
            here = {}
            for a in ACT.values():
                if not a.on: continue
                feet = [a.world('LeftToeBase').copy(), a.world('RightToeBase').copy(), a.world('LeftFoot').copy(), a.world('RightFoot').copy()]
                rot = {b: (a.arm.matrix_world.to_quaternion() @ a.arm.pose.bones[b].matrix.to_quaternion()) for b in ('LeftForeArm', 'RightForeArm', 'Head', 'LeftLeg', 'RightLeg', 'Spine02')}
                here[a.name] = (feet, rot, a.world('Hips').copy())
                w = worst.setdefault(a.name, dict(slide=0.0, under=0.0, over=9.0, jump=0.0, near=9.0, at=0))
                low = min(p.z for p in feet[:2]); w['under'] = min(w['under'], low - 0.04); w['over'] = min(w['over'], low - 0.04)
                if a.name in prev:
                    pf, pr, ph = prev[a.name]
                    # whoever stands has a foot that stays where it is: the slower ankle, if it is down, should not move
                    sp = [math.hypot(feet[i].x - pf[i].x, feet[i].y - pf[i].y) * 24 for i in (2, 3)]
                    k = 0 if sp[0] < sp[1] else 1
                    if feet[2 + k].z < a.ankle + 0.035 and sp[k] > w['slide']: w['slide'] = sp[k]; w['at'] = t
                    j = max(min(x, 360 - x) for x in (math.degrees(rot[b].rotation_difference(pr[b]).angle) for b in rot))
                    w['jump'] = max(w['jump'], j)
            names = list(here)
            for i in range(len(names)):
                for k in range(i + 1, len(names)):
                    d = (here[names[i]][2] - here[names[k]][2]); d.z = 0
                    for nm in (names[i], names[k]): worst[nm]['near'] = min(worst[nm]['near'], d.length)
            prev = here
        for nm, w in worst.items():
            flag = ' '.join(x for x, bad in (('SLIDE', w['slide'] > 0.45), ('UNDER', w['under'] < -0.05), ('FLOAT', w['over'] > 0.06), ('JUMP', w['jump'] > 38), ('CROWD', w['near'] < 0.38)) if bad)
            print(f"QC  {sh['name']:<14} {nm:<12} {w['slide']:8.2f}  {w['under']:7.3f}  {w['over']:6.3f}  {w['jump']:8.1f}  {w['near']:6.2f}  {flag}  {('@%.2f' % w['at']) if 'SLIDE' in flag else ''}", flush=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    todo = [s for s in SHOTS if not ONLY or s['name'].split('_')[0] in ONLY.split(',') or s['name'] in ONLY.split(',')]
    settings(PASS if PASS != 'qc' else 'preview')
    if PASS == 'qc': return qc(todo)
    man_path = os.path.join(OUT, 'manifest.json')
    man = json.load(open(man_path)) if os.path.exists(man_path) else {'shots': {}}
    for sh in todo:
        d = os.path.join(OUT, sh['name']); os.makedirs(d, exist_ok=True)
        fps = sh['fps']; n = int(round((sh['t1'] - sh['t0']) * fps))
        if PASS != 'bg' and sh['name'] in EXTERIOR: continue
        if PASS == 'bg':
            for k, tp in enumerate(sh['plates']):
                scene.render.filepath = os.path.join(d, f'bg_{k}.png')
                if os.path.exists(scene.render.filepath): continue                     # resumable
                pose(sh, tp)
                for a in ACT.values():
                    a.hide()
                    for o in a.shade: o.hide_render = True
                JACK.veil.hide_render = True
                t = time.time(); bpy.ops.render.render(write_still=True); print(f'BG {sh["name"]} {k} {time.time() - t:.1f}s', flush=True)
            continue
        tracks = []
        for f in range(n):
            t = sh['t0'] + f / fps
            if ONE is not None and f != int(ONE): continue
            if SPAN and not (SPAN[0] <= t <= SPAN[1]): continue
            if FRACS:                                              # storyboard pictures: at these parts of the shot
                if f not in [min(n - 1, int(n * v)) for v in FRACS]: continue
            elif EVERY == 999:
                if f != n // 2: continue
            elif f % EVERY: continue
            pose(sh, t)
            tracks.append({'f': f, 'jacks': [{'head': track(j, 'Head'), 'hand': track(j, 'RightHand'), 'feet': [track(j, 'LeftToeBase') + [round(j.world('LeftToeBase').z, 3)], track(j, 'RightToeBase') + [round(j.world('RightToeBase').z, 3)]]} for j in JACKS if j.on]})
            fp = os.path.join(d, f'{"fg" if PASS == "fg" else "pv"}_{f:04d}.png')
            if PASS == 'fg':
                rg = region(); tracks[-1]['box'] = [round(v, 5) for v in rg] if rg else None
                if rg is None or (os.path.exists(fp) and ONE is None): continue          # resumable
                r = scene.render; r.use_border = True; r.use_crop_to_border = True
                r.border_min_x, r.border_max_x, r.border_min_y, r.border_max_y = rg
            scene.render.filepath = fp
            tt = time.time(); bpy.ops.render.render(write_still=True); print(f'{PASS} {sh["name"]} {f}/{n} {time.time() - tt:.1f}s', flush=True)
        if PASS == 'fg' and ONE is None and EVERY == 1:
            man['shots'][sh['name']] = {'t0': sh['t0'], 't1': sh['t1'], 'fps': fps, 'frames': n, 'plates': sh['plates'], 'tracks': tracks}
            json.dump(man, open(man_path, 'w'))


main()
