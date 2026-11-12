"""Jack the Ripper (a killer is loose): the photography.

    blender -b stage.blend -P film.py -- --cast cast.blend --out <dir> [--shots s03,s08] [--pass fg|bg|preview]
                                         [--every N] [--only-frame K]

One timeline: the song's own seconds. `pose(shot, t)` puts every actor, light and the camera where they are at
second t and nothing else decides a picture, so any frame can be rendered alone, in any order, and comes out the same.

Each shot is photographed in two passes that Remotion lays over each other:
  bg  the set without the cast, one still (or a few, where the light changes), 1920 x 1080;
  fg  the cast alone on a transparent film, their shadows caught on the street, 12 pictures a second
      (animated on twos), 1280 x 720.
`manifest.json` says when each shot runs and where Jack's head and right hand are in every picture.
"""
import bpy, sys, os, math, json, time
from mathutils import Vector, Quaternion, Matrix
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index('--') + 1:]
def arg(n, d=None): return argv[argv.index(n) + 1] if n in argv else d
CAST, OUT = arg('--cast'), arg('--out')
PASS = arg('--pass', 'preview'); ONLY = arg('--shots'); EVERY = int(arg('--every', '1')); ONE = arg('--only-frame')
D = bpy.data; scene = bpy.context.scene
FPS = 12                                    # the cast is drawn on twos; the edit runs at 24
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
BEATS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'beats.json')))['beats']


def beat(t):
    """The song's beat as a running number: whole at each beat, with the fraction between them."""
    b = BEATS
    if t <= b[0]: return (t - b[0]) / (b[1] - b[0])
    for i in range(len(b) - 1):
        if t < b[i + 1]: return i + (t - b[i]) / (b[i + 1] - b[i])
    return len(b) - 1 + (t - b[-1]) / (b[-1] - b[-2])


def ease(u): u = max(0.0, min(1.0, u)); return u * u * (3 - 2 * u)
def snap(u, k=3.0): u = max(0.0, min(1.0, u)); return u ** k / (u ** k + (1 - u) ** k)       # a quick, held change
def lerp(a, b, u): return a + (b - a) * u
def span(t, a, b): return max(0.0, min(1.0, (t - a) / (b - a)))


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
            arm = D.objects[name]; mesh = arm.children[0]; who = name
        self.name, self.who, self.arm, self.mesh = name, who, arm, mesh
        arm.rotation_mode = 'QUATERNION'
        self.q0 = source.q0.copy() if source else arm.rotation_quaternion.copy()
        self.rest = {b.name: (self.q0 @ b.matrix_local.to_quaternion()) for b in arm.data.bones}
        w = lambda n: arm.matrix_world @ arm.data.bones[n].head_local
        self.thigh = (w('LeftUpLeg') - w('LeftLeg')).length; self.shin = (w('LeftLeg') - w('LeftFoot')).length
        self.height = max((mesh.matrix_world @ Vector(c)).z for c in mesh.bound_box)
        self.cache = {}; self.veil = None
        self.hide()

    # -- where
    def hide(self): self.arm.hide_render = self.mesh.hide_render = True; self.on = False
    def place(self, x, y, face=0.0, z=0.0):
        """face: degrees turned to the actor's own left from facing the audience (-Y)."""
        self.arm.hide_render = self.mesh.hide_render = False; self.on = True
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

    def stride(self, clip):
        """Metres the clip carries the hips forward in one pass (0 for a clip that stays where it is)."""
        a, c = self._curves(clip); f = c['Hips']['location']
        v = lambda fr: Vector((f[0].evaluate(fr), f[1].evaluate(fr), f[2].evaluate(fr)))
        d = self.rest['Hips'] @ (v(a.frame_range[1]) - v(a.frame_range[0])) * 0.01
        return math.hypot(d.x, d.y)

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

    def clip(self, name, sec, loop=True, inplace=None, into=None, w=0.0):
        """Pose from a clip; `into` and `w` cross-fade to a second (clip, seconds, loop)."""
        a = self.sample(name, sec, loop, inplace)
        b = self.sample(into[0], into[1], into[2] if len(into) > 2 else True) if into else None
        self.set(a, b, w)

    # -- by hand: turns about the character's own axes (X its left, -Y its front, Z up), on top of what is set
    def rest_pose(self):
        for pb in self.arm.pose.bones:
            pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = Quaternion(); pb.location = Vector()

    def turn(self, bone, axis, deg):
        m = self.rest[bone]; pb = self.arm.pose.bones[bone]
        pb.rotation_quaternion = (m.inverted() @ Quaternion(axis, math.radians(deg)) @ m) @ pb.rotation_quaternion

    def shift(self, v):
        """Move the hips by v metres in the character's own axes."""
        pb = self.arm.pose.bones['Hips']
        pb.location = pb.location + self.rest['Hips'].inverted() @ (self.q0 @ Vector(v)) * 100.0

    def squat(self, a, splay=1.0):
        """Bend both knees by a degrees with the knees turned out (splay 1) or forward (splay 0); the hips come
        down by what the legs lose, so the feet stay on the street."""
        for side, s in (('Left', 1), ('Right', -1)):
            ax = (Y * (-s * splay) + X * (-(1 - splay))).normalized()
            self.turn(side + 'UpLeg', ax, a); self.turn(side + 'Leg', ax, -2 * a); self.turn(side + 'Foot', ax, a)
        self.shift((0, 0, -(self.thigh + self.shin) * (1 - math.cos(math.radians(a)))))

    def world(self, bone, tail=False):
        b = self.arm.pose.bones[bone]
        return self.arm.matrix_world @ (b.tail if tail else b.head)


ACT = {}
for n in ('jack', 'singer', 'dancer', 'constable'): ACT[n] = Actor(n)
for i in (2, 3, 4): ACT[f'dancer{i}'] = Actor(f'dancer{i}', ACT['dancer'])
JACKS = [ACT['jack']]
GIRLS = [ACT['dancer'], ACT['dancer2'], ACT['dancer3'], ACT['dancer4']]

# The owner: "we shouldn't see his face, it should be covered by the fog even if his face is animated and there."
# A bank of mist rides in front of each Jack's face, always turned to the lens. It is its own object in the cast.
def veil_material():
    m = D.materials['fog-0'].copy(); m.name = 'veil'; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'TEX_COORD': tc = n
    # a round bank, not a beam: replace the beam's profile by a soft disc
    g = nt.nodes.new('ShaderNodeTexGradient'); g.gradient_type = 'SPHERICAL'
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Location'].default_value = (-1, -1, 0); mp.inputs['Scale'].default_value = (2, 2, 1)
    nt.links.new(tc.outputs['UV'], mp.inputs[0]); nt.links.new(mp.outputs[0], g.inputs[0])
    r = nt.nodes.new('ShaderNodeMapRange'); r.inputs['From Min'].default_value = 0.0; r.inputs['From Max'].default_value = 0.38
    nt.links.new(g.outputs['Fac'], r.inputs['Value'])
    lvl = nt.nodes['level']; lvl.inputs[1].default_value = 1.0
    nz = nt.nodes['drift']; nz.inputs['Scale'].default_value = 2.2
    cr = nt.nodes.new('ShaderNodeMapRange'); cr.inputs['From Min'].default_value = 0.25; cr.inputs['From Max'].default_value = 0.6
    cr.inputs['To Min'].default_value = 0.93; cr.inputs['To Max'].default_value = 1.0
    nt.links.new(nz.outputs['Fac'], cr.inputs['Value'])
    mu = nt.nodes.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'
    nt.links.new(r.outputs['Result'], mu.inputs[0]); nt.links.new(cr.outputs['Result'], mu.inputs[1])
    nt.links.new(mu.outputs[0], lvl.inputs[0])
    nt.nodes['glow'].inputs['Color'].default_value = (0.085, 0.12, 0.19, 1); nt.nodes['glow'].inputs['Strength'].default_value = 0.45
    return m
VEIL = veil_material()
for j in JACKS:
    bpy.ops.mesh.primitive_plane_add(size=1); v = bpy.context.object; v.name = j.name + '-veil'
    for c in list(v.users_collection): c.objects.unlink(v)
    cast_coll.objects.link(v); v.data.materials.append(VEIL)
    v.visible_shadow = False; v.visible_diffuse = False; v.visible_glossy = False
    j.veil = v

cam = D.objects['camera']; aim = D.objects['aim']


def veils(t):
    for j in JACKS:
        v = j.veil; v.hide_render = not j.on
        if not j.on: continue
        head = j.world('Head'); top = j.world('head_end'); front = j.world('headfront')
        face = head.lerp(top, 0.30) + (front - head) * 0.6
        to_cam = (cam.matrix_world.translation - face).normalized()
        v.location = face + to_cam * 0.30
        v.rotation_euler = to_cam.to_track_quat('Z', 'Y').to_euler()
        s = j.height * 0.44; v.scale = (s * 1.2, s, s)
    VEIL.node_tree.nodes['driftmap'].inputs['Location'].default_value = (t * 0.11, t * 0.05, t * 0.07)


# ------------------------------------------------------------------ light and set
def L(name): return D.objects[name].data
def lights(foot=300, front=0, wash=0, moon=1.6, gas=(520, 520, 520), spots=(), wash_col=(1.0, 0.05, 0.04), world=1.0):
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
        # the visible beam: a card from the lamp to the target, turned to the lens
        b = D.objects[f'beam-{i}']; piv = D.objects[f'beam-pivot-{i}']
        src = Vector((s.location.x * 0.75, 1.0, 12.8)); piv.location = src
        d = Vector(target) - src; b.scale = (1, d.length / 13.0 * 1.1, 1)
        piv.rotation_euler = (-d.normalized()).to_track_quat('Z', 'Y').to_euler()
        b.data.materials[0].node_tree.nodes['level'].inputs[1].default_value = min(0.3, energy / 90000.0)
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value = world


def curtains(open_):
    for n in ('curtain-L', 'curtain-R'): D.objects[n].scale.x = lerp(1.0, 0.10, open_)


def camera(pos, look, lens=35):
    cam.location = pos; aim.location = look; cam.data.lens = lens


# ------------------------------------------------------------------ the dance in the mist
def skeleton_dance(a, t, i=0, lead=0.0):
    """Jack's chorus dance: knees out and bouncing on the beat, elbows up, forearms snapping up and down, the spine
    swaying against the hips: the loose, jointed, rubber-limbed dancing of the old graveyard cartoons, built by hand
    on the rig. i is the dancer's place in the line (0..3); the bar (four beats) chooses the figure."""
    b = beat(t) - lead; bar = int(b // 4) % 4; ph = b % 1.0; n = int(b // 1); odd = 1 if n % 2 else -1
    hit = (0.5 + 0.5 * math.cos(2 * math.pi * ph)) ** 2            # 1 on the beat, 0 between
    half = (0.5 + 0.5 * math.cos(4 * math.pi * ph)) ** 2           # twice a beat
    sw = snap(ph, 4) * 2 - 1                                       # -1 → 1 across the beat, held at each end
    side = odd * sw                                                # swings one way, then the other
    a.rest_pose()
    x = y = z = 0.0; spin = 0.0
    if bar == 0:      # the rattle: deep bow-legged bounce, elbows out, forearms see-saw
        a.squat(14 + 30 * hit, 1.0)
        for s, sd in ((1, 'Left'), (-1, 'Right')):
            a.turn(sd + 'Arm', Y, -s * (38 + 8 * hit)); a.turn(sd + 'ForeArm', Y, -s * 80 * (side * s))
            a.turn(sd + 'Hand', Y, -s * 35 * (side * s))
        a.turn('Spine', Y, 9 * side); a.turn('Spine01', Y, 5 * side); a.turn('Head', Y, -14 * side)
    elif bar == 1:    # the shuffle: the whole line side-steps, arms swinging over the head, knees double-time
        step = (n % 4 < 2) and 1 or -1
        x = step * 0.55 * (sw * 0.5 + 0.5 if n % 2 == 0 else 1.0) - step * 0.275
        x = step * (ease(ph) * 0.5 + (0.5 if n % 2 else 0.0)) * 0.9 - step * 0.45
        z = 0.10 * math.sin(math.pi * ph)
        a.squat(10 + 22 * half, 0.8)
        for s, sd in ((1, 'Left'), (-1, 'Right')):
            up = 70 + 55 * side * s
            a.turn(sd + 'Arm', Y, -s * up); a.turn(sd + 'ForeArm', Y, -s * 35); a.turn(sd + 'Hand', X, 40 * half - 20)
        a.turn('Spine', Y, -12 * side); a.turn('Spine02', Y, -8 * side); a.turn('Head', Y, 12 * side)
        a.turn('Hips', Z, 10 * side)
    elif bar == 2:    # the knock-knees: knees in and out, body low, hands shaking by the ears
        knee = 24 * side
        a.squat(26 + 10 * hit, 0.0)
        for s, sd in ((1, 'Left'), (-1, 'Right')):
            a.turn(sd + 'UpLeg', Z, s * knee + s * 10); a.turn(sd + 'Arm', Y, -s * 45); a.turn(sd + 'ForeArm', Y, -s * 110)
            a.turn(sd + 'Hand', Y, s * 40 * (half * 2 - 1))
        a.turn('Spine01', X, 10); a.turn('Head', Z, 18 * side); a.turn('Spine02', Z, -12 * side)
    else:             # the turn: two beats of wind-up, a leap with a whole turn, and a landing in a deep squat
        bb = b % 4
        if bb < 1.5:
            a.squat(18 + 26 * ease(bb / 1.5), 1.0)
            for s, sd in ((1, 'Left'), (-1, 'Right')): a.turn(sd + 'Arm', Y, s * 10); a.turn(sd + 'ForeArm', X, -50 * ease(bb / 1.5))
            a.turn('Spine', Z, -35 * ease(bb / 1.5))
        elif bb < 2.5:
            u = bb - 1.5; z = 0.75 * 4 * u * (1 - u); spin = 360 * ease(u)
            a.squat(8, 1.0)
            for s, sd in ((1, 'Left'), (-1, 'Right')): a.turn(sd + 'Arm', Y, -s * 120); a.turn(sd + 'ForeArm', Y, -s * 20)
            for sd in ('Left', 'Right'): a.turn(sd + 'UpLeg', X, -35 * math.sin(math.pi * u)); a.turn(sd + 'Leg', X, 70 * math.sin(math.pi * u))
        else:
            u = bb - 2.5; d = math.exp(-3.5 * u) * math.cos(9 * u)
            a.squat(20 + 30 * d, 1.0)
            for s, sd in ((1, 'Left'), (-1, 'Right')):
                a.turn(sd + 'Arm', Y, -s * (60 + 30 * d)); a.turn(sd + 'ForeArm', Y, -s * 70); a.turn(sd + 'Hand', Y, -s * 40 * math.sin(14 * u))
            a.turn('Head', Y, 12 * math.sin(7 * u) * math.exp(-2 * u))
    return x, y, z, spin


def bob(a, t, amt=1.0):
    """A small breath of the beat on top of a clip, so that nobody stands outside the music."""
    ph = beat(t) % 1.0; hit = (0.5 + 0.5 * math.cos(2 * math.pi * ph)) ** 2
    a.turn('Spine01', X, 2.5 * hit * amt); a.turn('Head', X, -3 * hit * amt)


def walk(a, clip, t, t0, x0, y0, x1, y1, t1=None, speed=None, face=None):
    """Walk from one mark to another on the clip's own stride, so that the feet do not slide."""
    st = a.stride(clip) or 1.25 * a.height / 1.7 * a.length(clip)
    v = st / a.length(clip)
    dist = math.hypot(x1 - x0, y1 - y0)
    rate = 1.0
    if t1 is not None: rate = (dist / max(0.01, t1 - t0)) / v
    u = max(0.0, min(1.0, (t - t0) * v * rate / max(0.01, dist)))
    f = math.degrees(math.atan2((x1 - x0), -(y1 - y0))) if face is None else face
    a.place(lerp(x0, x1, u), lerp(y0, y1, u), f)
    a.clip(clip, (t - t0) * rate)
    return u


# ------------------------------------------------------------------ the shots
SHOTS = []
def shot(name, t0, t1, plates=None):
    def deco(fn): SHOTS.append(dict(name=name, t0=t0, t1=t1, fn=fn, plates=plates or [t0])); return fn
    return deco


def line(n, width, y, i): return (-width / 2 + width * i / (n - 1), y)


EXTERIOR = ('s00_pub', 's12_skyline')
@shot('s00_pub', 0.0, 6.0)
def s00(t):   # the house: the pub on its corner under the moon
    camera((-2.5, -86, 1.5), (0.5, -60, 7.0), 30)


@shot('s12_skyline', 63.59, 68.3)
def s12(t):   # "The air smells sharp, like iron and rain": the roofs, the tower and the dome
    camera((-9, -90, 10), (0, -40, 17.5), 38)


@shot('s01_wide', 4.5, 8.3)
def s01(t):   # the curtain parts (in the edit) on the empty street
    camera((0, -15.5, 3.3), (0, 4, 3.9), 30)
    lights(foot=260, moon=1.8, spots=[((0, 6.5, 0), 9000, 26, (0.6, 0.75, 1.0))])


@shot('s02_boots', 8.3, 12.29)
def s02(t):   # "Footsteps echo on the cobblestone"
    camera((-1.6, 0.5, 0.16), (0.5, 3.4, 0.42), 35)
    lights(foot=40, moon=2.2, gas=(700, 520, 520), spots=[((1.0, 3.4, 0), 6000, 30, (0.6, 0.75, 1.0))])
    walk(ACT['jack'], 'walk', t, 8.3, 5.6, 3.5, -4.6, 3.3, t1=13.4)


@shot('s03_shadow', 12.29, 18.75, plates=[12.29, 18.0])
def s03(t):   # "A shadow slips where the gaslight's blown"
    camera((-2.0, 1.0, 1.2), (-5.4, 7.0, 1.9), 32)
    out = span(t, 16.2, 16.9); fl = 1.0 - out * (0.86 + 0.14 * math.sin(t * 60))
    lights(foot=30, moon=2.4, gas=(620 * max(0.0, fl), 520, 520), spots=[((-4, 7.6, 0), 5000, 34, (0.6, 0.75, 1.0))])
    walk(ACT['jack'], 'sneak', t, 12.0, -0.6, 8.2, -9.4, 6.9, t1=19.2)


@shot('s04_moon', 18.75, 24.65)
def s04(t):   # "Fog whispers secrets to the moon"
    camera((-1.3, -0.5, 0.65), (0.9, 4.2, 2.3), 28)
    lights(foot=120, moon=2.0, spots=[((0.4, 3.6, 1.2), 26000, 12)])
    s = ACT['singer']; u = walk(s, 'stagewalk', t, 18.4, 1.0, 6.6, 0.3, 3.4, t1=22.0, face=0)
    if u >= 1.0: s.clip('stagewalk', 3.6, into=('chat', t - 22.0), w=ease((t - 22.0) / 0.5))
    s.turn('Head', X, -14 * ease(span(t, 21.5, 23.0))); s.turn('RightArm', Y, 55 * ease(span(t, 22.2, 23.6))); bob(s, t)


@shot('s05_alone', 24.65, 27.6)
def s05(t):   # "Alone"
    camera((1.0, -1.9, 1.4), (0.3, 3.4, 1.28), 50)
    lights(foot=30, moon=1.2, gas=(200, 200, 200), spots=[((0.3, 3.4, 1.2), 30000, 7)])
    s = ACT['singer']; s.place(0.3, 3.4, 0); s.clip('idle', t - 24.0)
    s.turn('Head', X, 12 * ease(span(t, 25.2, 26.8))); s.turn('Spine02', X, 5 * ease(span(t, 25.2, 26.8)))


@shot('s06_scream', 27.6, 33.67)
def s06(t):   # "A scream gets swallowed by the night"
    camera((1.9, -0.7, 1.35), (-0.5, 4.6, 1.25), 30)
    lights(foot=260, front=2500, moon=1.8, spots=[((-2.2, 3.2, 1.0), 14000, 16)])
    c = ACT['constable']; c.place(-2.2, 3.2, -20); c.clip('torch', t - 27.6)
    for i, g in enumerate(GIRLS[:3]):
        gx, gy = (0.9 + i * 0.85, 6.6 + (i % 2) * 0.6)
        back = ease(span(t, 28.6 + i * 0.12, 29.4 + i * 0.12))
        g.place(gx + back * 0.5, gy + back * 0.7, 28 - i * 6)
        g.clip('idle', t - 27 + i * 0.7, into=('jazzhands', (t - 28.6 - i * 0.12), False), w=ease(span(t, 28.5 + i * 0.12, 28.9 + i * 0.12)) * (1 - ease(span(t, 31.0, 32.0))))
        g.turn('Spine01', X, -8 * back)


@shot('s07_blade', 33.67, 41.73)
def s07(t):   # "A blade gleams silver / catches light"
    camera((0.4, -0.3, 0.6), (-0.2, 7.0, 1.9), 38)
    lights(foot=18, moon=3.2, gas=(260, 260, 420), spots=[((-0.2, 7.2, 1.0), 16000, 24, (0.6, 0.75, 1.0))])
    j = ACT['jack']
    if t < 37.6:
        j.place(-0.3, 8.6, 12); sl = (t - 34.6) * 0.55
        j.clip('idle', t - 33, into=('slash', max(0.0, sl), False), w=ease(span(t, 34.4, 34.9)) * (1 - ease(span(t, 37.0, 37.6))))
    else:
        walk(j, 'strut', t, 37.6, -0.3, 8.6, -0.1, 3.6, t1=42.4, face=0)


def chorus_line(t, lead_t, y=4.6, width=7.5, canon=0.0, jacks=1):   # the owner: "He shouldn't be four, he is just one"
    for i, j in enumerate(JACKS[:jacks]):
        x0, y0 = line(4, width, y, i) if jacks == 4 else (0, y)
        dx, dy, dz, spin = skeleton_dance(j, t, i, lead=canon * i)
        j.place(x0 + dx, y0 + dy, spin, dz)


def kick_line(t, t0, y=2.2, width=6.4, girls=4, clip='kick'):
    for i, g in enumerate(GIRLS[:girls]):
        x0, y0 = line(4, width, y, i)
        per = (BEATS[60] - BEATS[56]) / 2.0                           # one kick to two beats
        g.place(x0, y0, 0); sec = (t - t0) / per * g.length(clip)
        g.clip(clip, sec, loop=True, inplace=True)


CH1, CH2 = 41.73, 98.30
def chorus_a(t, T, cam_=0):   # "Jack the Ripper / the demon of Whitechapel"
    if cam_ == 0: camera((0, -1.6, 0.95), (0, 4.6, 1.25), 30)
    else: camera((-3.9, 0.6, 0.6), (0.3, 4.7, 1.2), 30)
    lights(foot=90, moon=3.0, front=0, wash=2500, wash_col=(0.25, 0.5, 1.0), gas=(300, 300, 300),
           spots=[((0, 4.6, 0.9), 14000, 20, (0.7, 0.85, 1.0))])
    chorus_line(t, T)


@shot('s08_dance', 41.73, 47.07)
def s08(t): chorus_a(t, CH1, 0)
@shot('s09_smoke', 47.07, 52.34)
def s09(t): chorus_a(t, CH1, 1)       # "He moves like smoke / his steps unravel"


def chorus_b(t, T):                   # "Blood on the streets / the devil's chapel"
    camera((1.7, -2.6, 0.9), (0, 3.6, 1.5), 26)
    lights(foot=520, moon=2.4, wash=9000, gas=(200, 200, 200), spots=[((0, 2.4, 1.0), 12000, 30, (1.0, 0.5, 0.4))])
    chorus_line(t, T, y=6.0, width=8.4)
    kick_line(t, T)
    s = ACT['singer']; s.place(0, 0.6, 0); s.clip('jazz', (t - T) * 0.92)


@shot('s10_blood', 52.34, 57.85)
def s10(t): chorus_b(t, CH1)


def chorus_c(t, T, a0, hold):         # "Jack the Ripper / no one to grapple"
    camera((0.5, -3.2, 1.5), (0.2, 4.2, 1.3), 30)
    lights(foot=160, moon=2.6, wash=3000, wash_col=(0.25, 0.5, 1.0), gas=(420, 420, 420), spots=[((0, 4.2, 1.0), 16000, 20)])
    c = ACT['constable']; j = ACT['jack']
    # Jack dances at the centre; the constable runs in and grabs at the place where he was
    gone = span(t, a0 + 2.55, a0 + 2.75)
    if gone < 1: dx, dy, dz, spin = skeleton_dance(j, t); j.place(dx * 0.5, 4.2, spin, dz)
    else: j.hide()
    run_end = a0 + 2.3
    if t < run_end:
        u = span(t, a0, run_end); c.place(lerp(8.6, 1.3, u), 4.3, 90); c.clip('run', t - a0)
    elif t < run_end + c.length('grab') * 1.25:
        c.place(1.3, 4.3, 90); c.clip('grab', (t - run_end) / 1.25, loop=False, inplace=False)
    else:
        c.place(0.2, 4.3, 0); k = t - run_end - c.length('grab') * 1.25
        c.clip('dumbfounded', k, loop=True, inplace=True)
    return gone


@shot('s11_grapple', 57.85, 63.59)
def s11(t): chorus_c(t, CH1, 57.85, 0)


@shot('s13_stain', 68.3, 76.28)
def s13(t):   # "The city hides its darkest stain"
    camera((-3.2, -1.7, 1.55), (-1.1, 3.4, 1.35), 32)
    lights(foot=320, front=1500, moon=2.0, spots=[((-1.6, 2.6, 1.1), 22000, 12)])
    s = ACT['singer']; s.place(-1.6, 2.6, -14); s.clip('chat', t - 68, into=('rhythm', t - 68), w=0.25); bob(s, t)
    for i, g in enumerate(GIRLS[:2]):
        walk(g, 'walk', t, 67.0 + i * 1.4, 8.5, 7.4 + i * 0.8, -9.0, 7.0 + i * 0.8, t1=79.5 + i * 1.4)
    walk(ACT['constable'], 'search', t, 66.0, -8.8, 5.6, 2.5, 5.9, t1=80.0)


@shot('s14_hats', 76.28, 84.5)
def s14(t):   # "Hats pulled low / no one speaks his name"
    camera((5.4, -3.4, 1.35), (0.2, 4.8, 1.5), 40)
    lights(foot=60, moon=2.6, gas=(520, 640, 520), spots=[((1.6, 3.0, 1.0), 20000, 16)])
    c = ACT['constable']; c.place(1.6, 3.0, 35); c.clip('search', 9.0 + (t - 76.28) * 0.0, into=('torch', t - 76.28), w=1.0)
    j = ACT['jack']; walk(j, 'strut', t, 76.0, -8.5, 6.6, 8.0, 7.2, t1=85.5)
    j.turn('RightArm', Y, 60 * ease(span(t, 79.5, 80.3)) * (1 - ease(span(t, 81.6, 82.4))))
    j.turn('RightForeArm', Y, 95 * ease(span(t, 79.5, 80.3)) * (1 - ease(span(t, 81.6, 82.4))))
    j.turn('Head', X, 14 * ease(span(t, 79.8, 80.6)) * (1 - ease(span(t, 81.6, 82.4))))


@shot('s15_knives', 84.5, 91.2)
def s15(t):   # "Knives carve stories in the dark"
    camera((-1.0, -0.3, 0.5), (0, 4.6, 1.55), 32)
    lights(foot=14, moon=3.4, gas=(160, 160, 300), spots=[((0, 4.6, 1.0), 30000, 18, (0.6, 0.75, 1.0))])
    j = ACT['jack']; j.place(0, 4.6, 0)
    k = (t - 84.9) * 0.7; n = j.length('slash')
    j.clip('idle', t, into=('slash', k % n, False), w=ease(span(t, 84.7, 85.1)))
    j.arm.rotation_quaternion = Quaternion(Z, math.radians(-25 + 50 * (int(max(0, k) // n) % 2))) @ j.q0


@shot('s16_art', 91.2, 98.3)
def s16(t):   # "Each cut a twisted work of art"
    camera((2.1, -2.7, 1.1), (0, 3.8, 1.45), 28)
    lights(foot=260, moon=2.2, wash=6000, spots=[((0, 5.2, 1.0), 18000, 16)])
    j = ACT['jack']; j.place(0, 5.2, 0); j.clip('bow', (t - 91.6) * 0.95, loop=False, inplace=False)
    for i, g in enumerate(GIRLS):
        gx, gy = line(4, 7.6, 2.6 + (0.5 if i in (1, 2) else 0), i)
        g.place(gx, gy, (-1 if i < 2 else 1) * -20); g.clip('jazz', (t - 91.2) * 0.92 + (0.0 if i % 2 else 0.0))


@shot('s17_dance', 98.3, 103.95)
def s17(t): chorus_a(t, CH2, 1)
@shot('s18_smoke', 103.95, 109.15)
def s18(t):
    camera((1.4, -0.9, 0.35), (0, 4.6, 1.45), 28)
    lights(foot=90, moon=3.0, wash=2500, wash_col=(0.25, 0.5, 1.0), gas=(300, 300, 300),
           spots=[((0, 4.6, 0.9), 14000, 20, (0.7, 0.85, 1.0))])
    chorus_line(t, CH2)
# 109.15 to 114.6, the second "Blood on the streets", is s10's photography again, mirrored in the edit.


@shot('s20_grapple', 114.6, 126.7)
def s20(t):   # the last "Jack the Ripper / no one to grapple": he bows, and goes out like smoke
    camera((0.0, -3.7, 1.6), (0, 4.0, 1.35), 28)
    lights(foot=200, moon=2.8, wash=2500, wash_col=(0.25, 0.5, 1.0), gas=(460, 460, 460), spots=[((0, 3.6, 1.0), 20000, 16)])
    j = ACT['jack']
    if t < 118.4: dx, dy, dz, spin = skeleton_dance(j, t); j.place(dx * 0.4, 3.6, spin, dz)
    elif t < 123.3: j.place(0, 3.6, 0); j.clip('idle', t, into=('bow', (t - 118.5) * 1.3, False), w=ease(span(t, 118.4, 118.9)))
    else: j.hide()
    c = ACT['constable']; a0 = 119.6; run_end = 123.0
    if t >= a0:
        if t < run_end: u = span(t, a0, run_end); c.place(lerp(-9.5, -1.2, u), 3.7, -90); c.clip('run', t - a0)
        elif t < run_end + c.length('grab') * 1.2: c.place(-1.2, 3.7, -90); c.clip('grab', (t - run_end) / 1.2, loop=False, inplace=False)
        else: c.place(-0.2, 3.7, 0); c.clip('dumbfounded', t - run_end - c.length('grab') * 1.2)


# ------------------------------------------------------------------ rendering
def pose(sh, t):
    ext = sh['name'] in EXTERIOR
    for o in D.collections['exterior'].objects: o.hide_render = not ext
    for cn in ('set', 'lights'):
        for o in D.collections[cn].objects: o.hide_render = ext
    for o in D.collections['fx'].objects: o.hide_render = ext or scene.render.film_transparent or o.name.startswith('petal')
    for a in ACT.values(): a.hide()
    curtains(1.0)
    sh['fn'](t)
    bpy.context.view_layer.update()
    veils(t)
    for i in range(5):
        D.objects[f'fog-{i}'].data.materials[0].node_tree.nodes['driftmap'].inputs['Location'].default_value = (t * 0.02 * (i + 1), 0, t * 0.01)
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
        o.is_shadow_catcher = fg and o.name in ('street', 'apron'); o.is_holdout = fg and o.name not in ('street', 'apron')
    for o in fx: o.hide_render = fg or o.name.startswith('petal')
    for o in cast_coll.objects: o.hide_viewport = False
    if kind == 'fg': r.resolution_x, r.resolution_y, c.samples = 1280, 720, 6
    elif kind == 'bg': r.resolution_x, r.resolution_y, c.samples = 1280, 720, 20
    else: r.resolution_x, r.resolution_y, c.samples = 800, 450, 6; c.use_denoising = True
    r.resolution_percentage = 100


def region():
    """The part of the picture the cast and their shadows can be in: only that is rendered in the cast's pass."""
    xs, ys = [], []
    for a in ACT.values():
        if not a.on: continue
        for b in a.arm.pose.bones:
            for p in (a.world(b.name),):              # heads only: the imported bones' tails are not the joints
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


def main():
    os.makedirs(OUT, exist_ok=True)
    todo = [s for s in SHOTS if not ONLY or s['name'].split('_')[0] in ONLY.split(',') or s['name'] in ONLY.split(',')]
    settings(PASS)
    man_path = os.path.join(OUT, 'manifest.json')
    man = json.load(open(man_path)) if os.path.exists(man_path) else {'fps': FPS, 'shots': {}}
    for sh in todo:
        d = os.path.join(OUT, sh['name']); os.makedirs(d, exist_ok=True)
        n = int(round((sh['t1'] - sh['t0']) * FPS))
        if PASS != 'bg' and sh['name'] in EXTERIOR: continue
        if PASS == 'bg':
            for k, tp in enumerate(sh['plates']):
                pose(sh, tp)
                for a in ACT.values(): a.hide()
                for j in JACKS: j.veil.hide_render = True
                scene.render.filepath = os.path.join(d, f'bg_{k}.png')
                if os.path.exists(scene.render.filepath): continue                     # resumable
                t = time.time(); bpy.ops.render.render(write_still=True); print(f'BG {sh["name"]} {k} {time.time() - t:.1f}s', flush=True)
            continue
        tracks = []
        for f in range(n):
            t = sh['t0'] + f / FPS
            if ONE is not None and f != int(ONE): continue
            if f % EVERY and not (EVERY == 999 and f == n // 2): continue
            if EVERY == 999 and f != n // 2: continue
            pose(sh, t)
            tracks.append({'f': f, 'jacks': [{'head': track(j, 'Head'), 'hand': track(j, 'RightHand')} for j in JACKS if j.on]})
            fp = os.path.join(d, f'{"fg" if PASS == "fg" else "pv"}_{f:04d}.png')
            if PASS == 'fg' and os.path.exists(fp) and ONE is None:                            # resumable
                rg = region(); tracks[-1]['box'] = [round(v, 5) for v in rg] if rg else None; continue
            if PASS == 'fg':
                rg = region()
                if rg is None: tracks[-1]['empty'] = True; continue
                r = scene.render; r.use_border = True; r.use_crop_to_border = True; tracks[-1]['box'] = [round(v, 5) for v in rg]
                r.border_min_x, r.border_max_x, r.border_min_y, r.border_max_y = rg
            scene.render.filepath = fp
            tt = time.time(); bpy.ops.render.render(write_still=True); print(f'{PASS} {sh["name"]} {f}/{n} {time.time() - tt:.1f}s', flush=True)
        if PASS == 'fg' and ONE is None and EVERY == 1:
            json.dump({'shots': [{'name': x['name'], 't0': x['t0'], 't1': x['t1'], 'plates': x['plates']} for x in SHOTS]}, open(os.path.join(OUT, 'shots.json'), 'w'))
            man['shots'][sh['name']] = {'t0': sh['t0'], 't1': sh['t1'], 'frames': n, 'plates': sh['plates'], 'tracks': tracks}
            json.dump(man, open(man_path, 'w'))


main()
