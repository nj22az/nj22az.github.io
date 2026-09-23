"""Johansson's movements, and the runtime export.

Blender 4.2 LTS. Stage two of two, after build-johansson.py:

  python tools/blender/animate-johansson.py -- --root "$PWD"

Every action is keyed pose by pose on the 163-bone MakeHuman skeleton. Poses are written in
plain body terms -- lift the arm forward, bend the elbow, curl the fingers, bend the knee --
and turned into bone rotations here, so the whole set reads like a choreography sheet. The
face (blinks, gaze, speech, expressions) is driven at runtime from the shape keys and eye
bones; these actions carry the body.

Axes: Blender Z up, the character faces -Y, his left is +X.
"""
import bpy, sys, math, argparse, json
from pathlib import Path
from mathutils import Matrix, Vector, Euler

parser = argparse.ArgumentParser()
parser.add_argument('--root', required=True)
parser.add_argument('--no-export', action='store_true')
parser.add_argument('--test', default='')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
root = Path(args.root).resolve()
bpy.ops.wm.open_mainfile(filepath=str(root / 'art/characters/johansson/johansson.blend'))
scene = bpy.context.scene
FPS = 30
scene.render.fps = FPS
rig = bpy.data.objects['Johansson.Rig']
bones = rig.data.bones
for pb in rig.pose.bones:
    pb.rotation_mode = 'QUATERNION'
REST = {b.name: b.matrix_local.to_3x3() for b in bones}
HEAD = {b.name: b.head_local.copy() for b in bones}
TAIL = {b.name: b.tail_local.copy() for b in bones}
SIDES = {'L': 1, 'R': -1}
rad = math.radians


def E(x=0, y=0, z=0):
    return Euler((rad(x), rad(y), rad(z)), 'XYZ').to_matrix()


def A(axis, deg):
    return Matrix.Rotation(rad(deg), 3, Vector(axis).normalized())


def unit(v):
    return Vector(v).normalized()


# Rest geometry the poses are measured against.
GEO = {}
for s, sign in SIDES.items():
    u = unit(TAIL['upperarm02.' + s] - HEAD['upperarm01.' + s])
    f = unit(HEAD['wrist.' + s] - HEAD['lowerarm01.' + s])
    knuckles = HEAD['finger2-1.' + s] - HEAD['finger5-1.' + s]
    d = unit(TAIL['finger3-3.' + s] - HEAD['finger3-1.' + s])
    palm = unit(d.cross(knuckles) if s == 'L' else knuckles.cross(d))
    down = unit((sign * .13, .02, -1))
    GEO[s] = {
        'u': u, 'f': f, 'palm': palm, 'hand': d,
        'elbow_axis': unit(u.cross(f)), 'elbow_rest': math.degrees(u.angle(f)),
        'down': u.rotation_difference(down).to_matrix(),
        'fingers': {i: unit(TAIL[f'finger{i}-3.{s}'] - HEAD[f'finger{i}-1.{s}']) for i in range(1, 6)},
    }
    GEO[s]['wrist_axis'] = unit(d.cross(palm))
    GEO[s]['curl_axis'] = {i: unit(GEO[s]['fingers'][i].cross(palm)) for i in range(1, 6)}
    GEO[s]['toe_axis'] = Vector((1, 0, 0))

# The MakeHuman rest hand is flexed down from the forearm and its thumb sits open; these
# carry the hand into line and fold the thumb over the fingers when it curls.
THUMB_CURL, THUMB_OPP, WRIST_REST = -1, -1, -25
SPINE = [('spine05', .14), ('spine04', .2), ('spine03', .24), ('spine02', .22), ('spine01', .2)]
NECK = [('neck01', .4), ('neck02', .35), ('neck03', .25)]
FINGER_ANGLES = {1: (15, 30, 45), 2: (62, 90, 55), 3: (66, 92, 55), 4: (70, 92, 55), 5: (74, 90, 55)}


def arm_rot(s, fwd=0., raise_=0., twist=0.):
    sign = SIDES[s]
    return E(-fwd, 0, 0) @ E(0, -sign * raise_, 0) @ GEO[s]['down'] @ A(GEO[s]['u'], sign * twist)


def build(p):
    """Pose description -> {bone: armature-axes rotation}, root offset."""
    R = {}
    loc = Vector(p.get('root', (0, 0, 0)))
    R['root'] = E(*p.get('hips', (0, 0, 0)))
    sx, sy, sz = p.get('spine', (0, 0, 0))
    for name, w in SPINE:
        R[name] = E(sx * w, sy * w, sz * w)
    nx, ny, nz = p.get('neck', (0, 0, 0))
    for name, w in NECK:
        R[name] = E(nx * w, ny * w, nz * w)
    R['head'] = E(*p.get('head', (0, 0, 0)))
    for s, sign in SIDES.items():
        arm = {'fwd': 0, 'raise': 0, 'twist': 0, 'elbow': 14, 'pron': 0, 'wrist': 0, 'dev': 0, 'shrug': 0, 'reach': 0}
        arm.update(p.get('arm' + s, {}))
        g = GEO[s]
        R['clavicle.' + s] = E(0, -sign * arm['shrug'], -sign * arm['reach'])
        R['upperarm01.' + s] = arm_rot(s, arm['fwd'], arm['raise'], arm['twist'])
        R['lowerarm01.' + s] = A(g['elbow_axis'], arm['elbow'] - g['elbow_rest'])
        R['lowerarm02.' + s] = A(g['f'], sign * arm['pron'])
        R['wrist.' + s] = A(g['wrist_axis'], arm['wrist'] + WRIST_REST) @ A(g['palm'], sign * arm['dev'])
        hand = {'curl': .22, 'thumb': .2, 'spread': 0}
        hand.update(p.get('hand' + s, {}))
        for i in range(1, 6):
            c = hand.get(i, hand['thumb'] if i == 1 else hand['curl'])
            for j, angle in enumerate(FINGER_ANGLES[i]):
                rot = A(g['curl_axis'][i], angle * c * (THUMB_CURL if i == 1 else 1))
                if j == 0:
                    rot = A(g['palm'], sign * hand['spread'] * (i - 3) * 6) @ rot
                    if i == 1:
                        rot = A(g['hand'], THUMB_OPP * sign * 35 * hand['thumb']) @ rot
                R[f'finger{i}-{j + 1}.{s}'] = rot
        leg = {'fwd': 0, 'spread': 0, 'twist': 0, 'knee': 3, 'ankle': 0, 'toes': 0}
        leg.update(p.get('leg' + s, {}))
        R['upperleg01.' + s] = E(-leg['fwd'], -sign * leg['spread'], sign * leg['twist'])
        R['lowerleg01.' + s] = E(leg['knee'], 0, 0)
        R['foot.' + s] = E(leg['ankle'], 0, 0)
        for t in range(1, 6):
            R[f'toe{t}-1.{s}'] = E(leg['toes'], 0, 0)
    ex, ez = p.get('eyes', (0, 0))
    for s in SIDES:
        R['eye.' + s] = E(ex, 0, ez)
    R['jaw'] = E(-p.get('jaw', 0), 0, 0)
    return R, loc


def apply(p):
    R, loc = build(p)
    for name, rot in R.items():
        pb = rig.pose.bones.get(name)
        if pb is None:
            continue
        B = REST[name]
        pb.rotation_quaternion = (B.inverted() @ rot @ B).to_quaternion()
    rig.pose.bones['root'].location = REST['root'].inverted() @ loc


def merge(base, **over):
    out = {k: (dict(v) if isinstance(v, dict) else v) for k, v in base.items()}
    for k, v in over.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict):
            out[k] = {**out[k], **v}
        else:
            out[k] = v
    return out


def stand(**over):
    base = {'armL': {'fwd': 2, 'raise': 3, 'elbow': 14}, 'armR': {'fwd': 2, 'raise': 3, 'elbow': 14},
            'legL': {'spread': -2.5, 'twist': 5}, 'legR': {'spread': -2.5, 'twist': 5}}
    return merge(base, **over)


ACTIONS = []


def action(name, keys, loop=False):
    """keys: [(seconds, pose)]. Every bone the skeleton moves is keyed at every key."""
    act = bpy.data.actions.new(name)
    act.use_fake_user = True
    rig.animation_data_create()
    rig.animation_data.action = act
    moved = set()
    for _, pose in keys:
        moved |= set(build(pose)[0])
    for t, pose in keys:
        frame = 1 + round(t * FPS)
        for pb in rig.pose.bones:
            pb.rotation_quaternion = (1, 0, 0, 0)
            pb.location = (0, 0, 0)
        apply(pose)
        for name in moved:
            pb = rig.pose.bones.get(name)
            if pb:
                pb.keyframe_insert('rotation_quaternion', frame=frame, group=name)
        rig.pose.bones['root'].keyframe_insert('location', frame=frame, group='root')
    # A bone that sits at rest for the whole action needs no channel at all.
    by_bone = {}
    for fc in act.fcurves:
        by_bone.setdefault(fc.group.name if fc.group else fc.data_path, []).append(fc)
    for name, curves in by_bone.items():
        still = True
        for fc in curves:
            rest = 1.0 if fc.data_path.endswith('rotation_quaternion') and fc.array_index == 0 else 0.0
            if any(abs(k.co[1] - rest) > 1e-4 for k in fc.keyframe_points):
                still = False
        if still and name != 'root':
            for fc in curves:
                act.fcurves.remove(fc)
    # Quaternion keys between poses need to take the short way round.
    for fc in act.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
            kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'
    ACTIONS.append({'name': name, 'seconds': round(keys[-1][0], 3), 'loop': loop})
    return act


def cycle(name, period, pose_at, samples=16):
    action(name, [(period * i / samples, pose_at(i / samples % 1.0)) for i in range(samples + 1)], loop=True)


def bump(x, centre, width):
    d = (x - centre + .5) % 1.0 - .5
    return math.exp(-(d / width) ** 2)


wave = lambda x: math.cos(math.tau * x)

# --- Locomotion -------------------------------------------------------------------------------


def walk(ph):
    p = {'legL': {}, 'legR': {}, 'armL': {}, 'armR': {}}
    for s, off in (('L', 0), ('R', .5)):
        x = (ph + off) % 1
        p['leg' + s] = {'fwd': 27 * wave(x) + 3, 'spread': 1.5, 'twist': 3,
                        'knee': 4 + 62 * bump(x, .72, .12) + 14 * bump(x, .1, .07),
                        'ankle': -9 * bump(x, .02, .06) + 20 * bump(x, .56, .07) - 8 * bump(x, .8, .09),
                        'toes': -28 * bump(x, .52, .05)}
        a = wave(x + .5)
        p['arm' + s] = {'fwd': 20 * a, 'raise': 5, 'elbow': 16 + 14 * max(0, a), 'pron': 10}
        p['hand' + s] = {'curl': .32, 'thumb': .3}
    p['root'] = (.014 * math.sin(math.tau * ph), 0, -.018 - .016 * math.cos(2 * math.tau * ph))
    p['hips'] = (0, 1.5 * math.sin(math.tau * ph), -5 * wave(ph))
    p['spine'] = (4, 0, 8 * wave(ph))
    p['neck'] = (-2, 0, -2 * wave(ph))
    p['head'] = (1, 0, -1 * wave(ph))
    return p


def run(ph):
    p = {}
    for s, off in (('L', 0), ('R', .5)):
        x = (ph + off) % 1
        p['leg' + s] = {'fwd': 40 * wave(x) + 12, 'spread': 1, 'twist': 2,
                        'knee': 12 + 105 * bump(x, .7, .14) + 28 * bump(x, .12, .08),
                        'ankle': -10 * bump(x, .02, .06) + 30 * bump(x, .5, .08),
                        'toes': -30 * bump(x, .47, .05)}
        a = wave(x + .5)
        p['arm' + s] = {'fwd': 12 + 38 * a, 'raise': 10, 'elbow': 88 + 10 * a, 'pron': 25, 'twist': -10}
        p['hand' + s] = {'curl': .65, 'thumb': .6}
    p['root'] = (0, -.02, -.035 + .03 * math.cos(2 * math.tau * (ph - .2)))
    p['hips'] = (0, 0, -8 * wave(ph))
    p['spine'] = (12, 0, 12 * wave(ph))
    p['neck'] = (-8, 0, -4 * wave(ph))
    p['head'] = (-2, 0, -2 * wave(ph))
    return p


cycle('Walk', .76, walk)
cycle('Run', .6, run)


def ground_speed(name, period):
    """Metres the body travels per cycle, measured from the planted foot sliding back."""
    rig.animation_data.action = bpy.data.actions[name]
    frames = range(1, round(period * FPS) + 1)
    track = []
    for f in frames:
        scene.frame_set(f)
        track.append((f, (rig.matrix_world @ rig.pose.bones['foot.L'].tail).copy()))
    low = min(p.z for _, p in track)
    planted = [(f, p.y) for f, p in track if p.z < low + .025]
    if len(planted) < 3:
        return 0
    n = len(planted)
    mf = sum(f for f, _ in planted) / n
    my = sum(y for _, y in planted) / n
    slope = sum((f - mf) * (y - my) for f, y in planted) / sum((f - mf) ** 2 for f, _ in planted)
    return round(abs(slope) * FPS * period, 3)


WALK_METRES_PER_CYCLE = ground_speed('Walk', .76)
RUN_METRES_PER_CYCLE = ground_speed('Run', .6)
print('STRIDE walk', WALK_METRES_PER_CYCLE, 'run', RUN_METRES_PER_CYCLE, flush=True)


def idle(ph):
    breath = math.sin(math.tau * ph * 2)
    sway = math.sin(math.tau * ph)
    return stand(root=(.01 * sway, 0, .002 * breath), hips=(0, .8 * sway, 0), spine=(-1.2 * breath, -.6 * sway, 0),
                 neck=(1, 0, 3 * math.sin(math.tau * ph + 1)), head=(1.5 * breath, 0, 2 * math.sin(math.tau * ph + 1)),
                 armL={'fwd': 2 + 1.5 * breath, 'raise': 4 + .5 * breath, 'elbow': 15}, armR={'fwd': 2 - 1.5 * breath, 'raise': 4, 'elbow': 15},
                 legL={'knee': 3 + 3 * max(0, -sway)}, legR={'knee': 3 + 3 * max(0, sway)})


cycle('Idle', 5.0, idle, 10)


def seated(**over):
    base = {'root': (0, 0, -.35), 'spine': (4, 0, 0), 'neck': (2, 0, 0),
            'legL': {'fwd': 88, 'knee': 88, 'spread': 6, 'ankle': -2}, 'legR': {'fwd': 88, 'knee': 88, 'spread': 6, 'ankle': -2},
            'armL': {'fwd': 16, 'raise': 4, 'elbow': 42, 'pron': 70, 'wrist': 15}, 'armR': {'fwd': 16, 'raise': 4, 'elbow': 42, 'pron': 70, 'wrist': 15},
            'handL': {'curl': .3}, 'handR': {'curl': .3}}
    return merge(base, **over)


cycle('Sit', 5.0, lambda ph: seated(spine=(4 - 1.2 * math.sin(math.tau * ph * 2), 0, 0), head=(2, 0, 3 * math.sin(math.tau * ph))), 10)


def sit_eat(ph):
    lift = max(0., math.sin(math.tau * ph)) ** .8
    return seated(armR={'fwd': 30 + 45 * lift, 'raise': 10, 'elbow': 60 + 75 * lift, 'pron': 70, 'wrist': -10 * lift},
                  handR={'curl': .45, 1: .5, 2: .15, 3: .2},
                  armL={'fwd': 40, 'raise': 6, 'elbow': 75, 'pron': 80}, handL={'curl': .6},
                  spine=(10 + 4 * lift, 0, 0), head=(6 - 10 * lift, 0, 0), jaw=4 * lift)


cycle('SitEat', 2.6, sit_eat, 12)
cycle('Soak', 6.0, lambda ph: seated(root=(0, .06, -.47), spine=(-8, 0, 0), neck=(-6, 0, 0), head=(-10 + 3 * math.sin(math.tau * ph), 0, 0),
                                      armL={'raise': 55, 'fwd': -12, 'elbow': 30, 'pron': 0}, armR={'raise': 55, 'fwd': -12, 'elbow': 30, 'pron': 0},
                                      legL={'fwd': 55, 'knee': 35}, legR={'fwd': 55, 'knee': 35},
                                      handL={'curl': .15}, handR={'curl': .15}), 6)

# --- Jumping -------------------------------------------------------------------------------------
crouch = stand(root=(0, .02, -.14), spine=(18, 0, 0), legL={'fwd': 38, 'knee': 70, 'ankle': -28}, legR={'fwd': 38, 'knee': 70, 'ankle': -28},
               armL={'fwd': -35, 'elbow': 25}, armR={'fwd': -35, 'elbow': 25})
air = stand(root=(0, 0, .02), spine=(-4, 0, 0), legL={'fwd': 30, 'knee': 55, 'ankle': 25, 'toes': 10}, legR={'fwd': 12, 'knee': 30, 'ankle': 30},
            armL={'fwd': 60, 'raise': 30, 'elbow': 40}, armR={'fwd': 45, 'raise': 35, 'elbow': 30}, handL={'curl': .1, 'spread': 1}, handR={'curl': .1, 'spread': 1})
land = stand(root=(0, 0, -.1), spine=(14, 0, 0), legL={'fwd': 30, 'knee': 55, 'ankle': -22}, legR={'fwd': 30, 'knee': 55, 'ankle': -22},
             armL={'fwd': 25, 'raise': 20, 'elbow': 30}, armR={'fwd': 25, 'raise': 20, 'elbow': 30})
action('Jump', [(0, stand()), (.12, crouch), (.26, merge(air, legL={'fwd': 5, 'knee': 5, 'ankle': 35}, legR={'fwd': 0, 'knee': 5, 'ankle': 40})),
                (.46, air), (.7, air), (.82, land), (1.05, stand())])
cycle('Fall', 1.0, lambda ph: merge(air, armL={'fwd': 70 + 8 * math.sin(math.tau * ph), 'raise': 40}, armR={'fwd': 60 - 8 * math.sin(math.tau * ph), 'raise': 45}), 4)

# --- Gestures and errands -------------------------------------------------------------------------
wave_up = stand(armR={'fwd': 10, 'raise': 95, 'twist': -90, 'elbow': 95, 'pron': 0}, handR={'curl': .05, 'thumb': 0, 'spread': 1}, head=(0, -3, -4))
action('Wave', [(0, stand()), (.35, wave_up)] + [(.35 + .22 * (i + 1), merge(wave_up, armR={'elbow': 95 + (18 if i % 2 == 0 else -18), 'dev': 12 if i % 2 else -12}))
                                                  for i in range(6)] + [(2.0, wave_up), (2.4, stand())])
bow = stand(hips=(4, 0, 0), spine=(34, 0, 0), neck=(8, 0, 0), head=(6, 0, 0), eyes=(8, 0),
            armL={'fwd': 4, 'raise': 0, 'elbow': 8}, armR={'fwd': 4, 'raise': 0, 'elbow': 8}, handL={'curl': .08}, handR={'curl': .08})
action('Bow', [(0, stand()), (.55, bow), (1.35, bow), (2.0, stand())])
action('Nod', [(0, stand()), (.2, stand(neck=(10, 0, 0), head=(8, 0, 0))), (.42, stand(neck=(-2, 0, 0))), (.62, stand(neck=(9, 0, 0), head=(6, 0, 0))), (.9, stand())])
action('HeadShake', [(0, stand())] + [(.18 * (i + 1), stand(neck=(2, 0, 16 * (-1) ** i), head=(0, 0, 8 * (-1) ** i))) for i in range(4)] + [(1.0, stand())])
point = stand(armR={'fwd': 82, 'raise': 12, 'twist': 0, 'elbow': 6, 'pron': -15}, handR={'curl': .85, 2: 0, 1: .6}, spine=(0, 0, -6), head=(0, 0, -4))
action('Point', [(0, stand()), (.4, point), (1.4, point), (1.9, stand())])
shrug = stand(armL={'shrug': 14, 'fwd': 16, 'raise': 22, 'elbow': 80, 'pron': -60}, armR={'shrug': 14, 'fwd': 16, 'raise': 22, 'elbow': 80, 'pron': -60},
              handL={'curl': .05, 'spread': 1}, handR={'curl': .05, 'spread': 1}, head=(0, 8, 0), neck=(-3, 0, 0))
action('Shrug', [(0, stand()), (.35, shrug), (.9, shrug), (1.4, stand())])


def talk(ph):
    a, b = math.sin(math.tau * ph), math.sin(math.tau * ph * 2 + 1)
    return stand(armR={'fwd': 28 + 12 * a, 'raise': 10 + 6 * b, 'elbow': 72 + 14 * b, 'pron': -40 + 20 * a},
                 armL={'fwd': 18 + 8 * b, 'raise': 8, 'elbow': 55 + 10 * a, 'pron': -20},
                 handR={'curl': .15 + .1 * a, 'spread': .6}, handL={'curl': .25},
                 spine=(2, 0, 3 * a), neck=(2 * b, 0, 4 * a), head=(2 * a, 2 * b, 0))


cycle('Talk', 3.0, talk, 12)
reach = stand(root=(0, -.04, -.3), hips=(0, 0, 0), spine=(46, 0, -8), neck=(-8, 0, 0), head=(-6, 0, 0),
              legL={'fwd': 62, 'knee': 95, 'ankle': -30}, legR={'fwd': 30, 'knee': 90, 'ankle': -40, 'spread': 6},
              armR={'fwd': 62, 'raise': 4, 'elbow': 10, 'pron': 20}, armL={'fwd': 30, 'raise': 12, 'elbow': 60, 'pron': 50},
              handR={'curl': .1, 'spread': .8})
grab = merge(reach, handR={'curl': .8, 'thumb': .7, 'spread': 0})
action('PickUp', [(0, stand()), (.55, reach), (.8, grab), (1.5, stand(armR={'fwd': 30, 'elbow': 90, 'pron': 40}, handR={'curl': .8, 'thumb': .7})), (1.9, stand())])
hold_can = {'curl': .75, 'thumb': .6}
lift = stand(armR={'fwd': 35, 'raise': 22, 'elbow': 132, 'pron': 75, 'wrist': 10}, handR=hold_can, neck=(-4, 0, 0), head=(-6, 0, 0))
sip = merge(lift, armR={'fwd': 42, 'raise': 30, 'elbow': 138, 'wrist': -20}, neck=(-12, 0, 0), head=(-14, 0, 0), jaw=5)
action('Drink', [(0, stand(armR={'fwd': 30, 'elbow': 88, 'pron': 50}, handR=hold_can)), (.6, lift), (.9, sip), (1.8, sip), (2.2, lift),
                 (2.7, stand(armR={'fwd': 30, 'elbow': 88, 'pron': 50}, handR=hold_can))])
to_mouth = stand(armR={'fwd': 40, 'raise': 20, 'elbow': 138, 'pron': 70}, handR={'curl': .55, 1: .5, 2: .2}, head=(4, 0, 0), jaw=8)
action('Eat', [(0, stand()), (.5, to_mouth), (.9, merge(to_mouth, armR={'elbow': 110, 'fwd': 32}, jaw=0)), (1.3, to_mouth),
               (1.7, merge(to_mouth, armR={'elbow': 110, 'fwd': 32}, jaw=0)), (2.2, stand())])
offer = stand(armR={'fwd': 55, 'raise': 6, 'elbow': 30, 'pron': -80}, handR={'curl': .12, 'thumb': .1}, spine=(6, 0, 0), head=(6, 0, 0))
action('Give', [(0, stand()), (.45, offer), (1.1, offer), (1.6, stand())])
clap_open = stand(armL={'fwd': 45, 'raise': 5, 'elbow': 80, 'pron': -10, 'twist': 30}, armR={'fwd': 45, 'raise': 5, 'elbow': 80, 'pron': -10, 'twist': 30},
                  handL={'curl': .05}, handR={'curl': .05})
clap_shut = merge(clap_open, armL={'raise': -6, 'twist': 38}, armR={'raise': -6, 'twist': 38})
action('Clap', [(0, stand()), (.3, clap_open)] + [(.3 + .16 * (i + 1), clap_shut if i % 2 == 0 else clap_open) for i in range(8)] + [(2.0, stand())])
reach_up = stand(armL={'raise': 160, 'fwd': 10, 'elbow': 25, 'twist': 40}, armR={'raise': 160, 'fwd': 10, 'elbow': 25, 'twist': 40},
                 handL={'curl': .5}, handR={'curl': .5}, spine=(-10, 0, 0), neck=(-8, 0, 0), head=(-10, 0, 0), jaw=12, root=(0, 0, .02),
                 legL={'ankle': 12}, legR={'ankle': 12})
action('Stretch', [(0, stand()), (.8, reach_up), (1.9, merge(reach_up, spine=(-12, 8, 0))), (2.4, reach_up), (3.2, stand())])
shade = stand(armR={'fwd': 100, 'raise': 22, 'twist': -25, 'elbow': 128, 'pron': -60, 'wrist': 5}, handR={'curl': .05, 'thumb': 0})
action('LookAround', [(0, stand()), (.7, merge(shade, spine=(0, 0, 20), neck=(0, 0, 30), head=(-3, 0, 10), eyes=(0, 10))),
                      (1.9, merge(shade, spine=(0, 0, 18), neck=(0, 0, 28), head=(-3, 0, 12), eyes=(0, 10))),
                      (2.8, merge(shade, spine=(0, 0, -20), neck=(0, 0, -30), head=(-3, 0, -10), eyes=(0, -10))),
                      (3.8, merge(shade, spine=(0, 0, -18), neck=(0, 0, -26), head=(-3, 0, -12))), (4.6, stand())])
think = stand(armR={'fwd': 50, 'raise': 10, 'elbow': 142, 'pron': 10, 'wrist': 30}, handR={'curl': .55, 2: .3, 1: .2},
              armL={'fwd': 30, 'raise': 2, 'elbow': 95, 'pron': 70}, handL={'curl': .5},
              head=(4, 6, -6), eyes=(-10, 12))
action('Think', [(0, stand()), (.6, think), (2.4, merge(think, head=(5, 7, -2), eyes=(-12, -6))), (3.2, stand())])
laugh = lambda k: stand(spine=(-8 + 4 * k, 0, 0), neck=(-8, 0, 0), head=(-10 + 5 * k, 0, 0), armL={'shrug': 6 * k}, armR={'shrug': 6 * k}, jaw=10 + 6 * k)
action('Laugh', [(0, stand())] + [(.25 + .16 * i, laugh(i % 2)) for i in range(10)] + [(2.1, stand())])
phone = stand(armR={'fwd': 30, 'raise': 32, 'elbow': 148, 'pron': -20, 'wrist': 10}, handR={'curl': .6, 'thumb': .5}, head=(4, 6, 0))
action('Phone', [(0, stand()), (.5, phone), (3.5, merge(phone, head=(6, 4, 8))), (4.0, stand())])
squat = stand(root=(0, .06, -.47), spine=(30, 0, 0), neck=(-12, 0, 0), legL={'fwd': 100, 'knee': 140, 'spread': 16, 'twist': 18, 'ankle': -30},
              legR={'fwd': 100, 'knee': 140, 'spread': 16, 'twist': 18, 'ankle': -30}, armL={'fwd': 60, 'elbow': 40, 'raise': 5}, armR={'fwd': 60, 'elbow': 40, 'raise': 5})
cycle('Crouch', 4.0, lambda ph: merge(squat, head=(0, 0, 6 * math.sin(math.tau * ph))), 4)

# Fishing: Tama's harbour. The rod is in both hands, right over left.
rod_hold = stand(armR={'fwd': 45, 'raise': 12, 'elbow': 75, 'pron': 30}, armL={'fwd': 55, 'raise': -4, 'elbow': 65, 'pron': 60},
                 handR={'curl': .8, 'thumb': .7}, handL={'curl': .8, 'thumb': .7}, spine=(4, 0, -6), legL={'fwd': 8}, legR={'fwd': -8})
back = merge(rod_hold, armR={'fwd': 130, 'raise': 20, 'elbow': 95}, armL={'fwd': 100, 'elbow': 90}, spine=(-8, 0, 16), head=(-4, 0, -6))
throw = merge(rod_hold, armR={'fwd': 75, 'elbow': 20}, armL={'fwd': 70, 'elbow': 25}, spine=(12, 0, -10))
action('Cast', [(0, rod_hold), (.5, back), (.72, throw), (1.2, rod_hold)])
cycle('FishIdle', 4.0, lambda ph: merge(rod_hold, spine=(4, 0, -6 + 2 * math.sin(math.tau * ph)), head=(6 + 2 * math.sin(math.tau * ph * 2), 0, 0)), 8)
cycle('Reel', .8, lambda ph: merge(rod_hold, armL={'fwd': 55 + 8 * math.cos(math.tau * ph), 'elbow': 70 + 12 * math.sin(math.tau * ph), 'pron': 60},
                                   spine=(6, 0, -6)), 8)


def kachashi(ph):
    """Kachāshī: the free Okinawan hand-dance at the end of every party."""
    a, flick = math.sin(math.tau * ph), math.sin(math.tau * ph * 4)
    step = math.sin(math.tau * ph * 2)
    return stand(armL={'fwd': 15, 'raise': 100 + 12 * a, 'twist': -90, 'elbow': 70, 'wrist': 28 * flick, 'pron': 30},
                 armR={'fwd': 15, 'raise': 100 - 12 * a, 'twist': -90, 'elbow': 70, 'wrist': -28 * flick, 'pron': 30},
                 handL={'curl': .15, 'spread': .6}, handR={'curl': .15, 'spread': .6},
                 root=(.03 * a, 0, -.03 - .015 * abs(step)), hips=(0, 3 * a, 6 * a), spine=(0, -4 * a, -6 * a), head=(0, 4 * a, 8 * a),
                 legL={'fwd': 10 * max(0, step), 'knee': 14 + 22 * max(0, step), 'ankle': 10 * max(0, step)},
                 legR={'fwd': 10 * max(0, -step), 'knee': 14 + 22 * max(0, -step), 'ankle': 10 * max(0, -step)})


cycle('Kachashi', 2.4, kachashi, 16)
fist = {'curl': 1, 'thumb': .9}
action('Fist', [(0, stand()), (.3, stand(handL=fist, handR=fist, armR={'fwd': 60, 'elbow': 100, 'pron': 40})), (.9, stand(handL=fist, handR=fist, armR={'fwd': 60, 'elbow': 100, 'pron': 40})), (1.2, stand())])

if args.test:
    for n, over in enumerate(json.loads(args.test)):
        action(f'T{n}', [(0, stand(**over)), (1, stand(**over))])

# Rest and bind: glTF wants the rest pose on frame 0 of no action; leave the armature neutral.
rig.animation_data.action = None
for pb in rig.pose.bones:
    pb.rotation_quaternion = (1, 0, 0, 0)
    pb.location = (0, 0, 0)

out_dir = root / 'art/characters/johansson'
bpy.ops.wm.save_as_mainfile(filepath=str(out_dir / 'johansson-animated.blend'), compress=True)
(out_dir / 'actions.json').write_text(json.dumps({'fps': FPS, 'walkMetresPerCycle': WALK_METRES_PER_CYCLE,
                                                  'runMetresPerCycle': RUN_METRES_PER_CYCLE, 'actions': ACTIONS}, indent=1) + '\n')
print('ACTIONS', [a['name'] for a in ACTIONS], flush=True)
if args.no_export:
    sys.exit(0)

# --- Export ------------------------------------------------------------------------------------------
target = root / 'assets/characters/johansson'
target.mkdir(parents=True, exist_ok=True)
for img in bpy.data.images:
    if img.size[0] > 1024 and not img.name.startswith('Johansson.skin'):
        img.scale(1024, 1024)
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if obj.name.startswith('Johansson.'):
        obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(target / 'johansson.glb'), export_format='GLB', use_selection=True, export_yup=True,
                          export_animations=True, export_animation_mode='ACTIONS', export_nla_strips=False, export_force_sampling=True,
                          export_frame_range=False, export_skins=True, export_morph=True, export_morph_normal=False,
                          export_try_sparse_sk=True, export_def_bones=False, export_cameras=False, export_lights=False,
                          export_image_format='JPEG', export_jpeg_quality=86, export_apply=False,
                          export_optimize_animation_size=True, export_optimize_animation_keep_anim_armature=False)
print('EXPORTED', (target / 'johansson.glb').stat().st_size, flush=True)
