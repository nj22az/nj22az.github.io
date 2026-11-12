"""A still of the deck fittings' demonstration quay (or of anything build.py saved), with its moving parts put where one says.

    blender -b /tmp/chisum-f.blend -P ferry/tools/fitting_still.py -- --out x.png --eye x,y,z --aim x,y,z
        [--lens 35] [--samples 48] [--size 1600x1000] [--part /tmp/chisum-f.npz] [--set LB1-davit=46,LB1-lower=6]
        [--sun 135,48] [--hide name,name] [--sea 0|1] [--cpu 1]

Eye and aim are in the SHIP's axes, as the fittings are drawn: x to port, y up, z forward (metres). `--set` puts the file's
inputs at values and moves every part as the page would (the file format's movers: turn, slide, carry, aim, extend, `on`);
the motions are read from the part file written beside the .blend. Several stills in one run: give --shots a file of lines
`out.png | eye | aim | lens | set | sun`, and the scene is set up once (`sun` = azimuth,elevation for that still).
"""
import sys, math, os, json
import bpy
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index('--') + 1:]
opt = dict(zip(argv[::2], argv[1::2]))
scene = bpy.context.scene

B = lambda p: Vector((p[2], p[0], p[1]))                       # ship (x port, y up, z forward) -> Blender (X forward, Y port, Z up)
C = Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1)))


def turn_about(pivot, axis, angle):
    return Matrix.Translation(pivot) @ Matrix.Rotation(angle, 4, axis) @ Matrix.Translation(-Vector(pivot))


def pose(values):
    """Every moving part where its input says, as ferry/app.js moveParts does it."""
    meta = json.loads(bytes(__import__('numpy').load(opt.get('--part', '/tmp/chisum-f.npz'))['meta']).decode())
    own = {}
    order = []
    for m in meta['movers']:
        v = values.get(m['input'], 0.0)
        angle = math.radians(v) * m.get('ratio', 1)
        axis = Vector(m['axis']).normalized()
        pivot = Vector(m.get('pivot', (0, 0, 0)))
        kind = m['kind']
        if kind == 'turn':
            M = turn_about(pivot, axis, angle)
        elif kind == 'slide':
            M = Matrix.Translation(axis * (v * m.get('ratio', 1)))
        elif kind == 'carry':
            arm = Vector(m['point']) - pivot
            M = Matrix.Translation(Matrix.Rotation(angle, 3, axis) @ arm - arm)
        elif kind == 'aim':
            anchor = Vector(m['anchor'])
            now = Matrix.Rotation(angle, 3, axis) @ (Vector(m['pin']) - pivot) + pivot - anchor
            rest = Vector(m['pin']) - anchor
            now -= axis * now.dot(axis)
            rest -= axis * rest.dot(axis)
            swing = math.atan2(rest.cross(now).dot(axis), rest.dot(now))
            M = turn_about(anchor, axis, swing)
            if m.get('extend'):
                M = Matrix.Translation(now.normalized() * (now.length - rest.length)) @ M
        else:
            M = Matrix.Identity(4)
        own[m['id']] = M
        order.append(m)
    for m in order:                                             # a part that rides on another goes with it, after its own motion
        if m.get('on') in own:
            own[m['id']] = own[m['on']] @ own[m['id']]
    moved = 0
    for ob in bpy.data.objects:
        mid = ob.get('mover')
        if mid in own:
            ob.matrix_world = C @ own[mid] @ C.inverted()
            moved += 1
    return moved


def stand_sun(so, az, el):
    """The sun at azimuth az (from forward toward port) and elevation el; its lamp looks the other way."""
    d = Vector((math.cos(math.radians(el)) * math.cos(math.radians(az)), math.cos(math.radians(el)) * math.sin(math.radians(az)), math.sin(math.radians(el))))
    so.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()


def setup():
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = int(opt.get('--samples', 48))
    scene.cycles.use_denoising = True
    scene.cycles.device = 'CPU'
    if not opt.get('--cpu'):
        try:
            prefs = bpy.context.preferences.addons['cycles'].preferences
            prefs.compute_device_type = 'METAL'
            prefs.get_devices()
            for d in prefs.devices:
                d.use = True
            scene.cycles.device = 'GPU'
        except Exception as e:                                  # no graphics card to be had: the processor draws it
            print('no GPU for Cycles:', e)
    w, h = (int(v) for v in opt.get('--size', '1600x1000').split('x'))
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    for vt in ('AgX', 'Filmic', 'Standard'):
        try:
            scene.view_settings.view_transform = vt
            break
        except TypeError:
            continue
    world = bpy.data.worlds.new('quay sky')
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes['Background']
    # a plain sky: paler toward the horizon
    coord, grad, ramp = nt.nodes.new('ShaderNodeTexCoord'), nt.nodes.new('ShaderNodeSeparateXYZ'), nt.nodes.new('ShaderNodeValToRGB')
    nt.links.new(coord.outputs['Generated'], grad.inputs['Vector'])
    nt.links.new(grad.outputs['Z'], ramp.inputs['Fac'])
    ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[0].color = 0.0, (0.75, 0.84, 0.93, 1)
    ramp.color_ramp.elements[1].position, ramp.color_ramp.elements[1].color = 0.6, (0.28, 0.50, 0.85, 1)
    nt.links.new(ramp.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = float(opt.get('--sky', 1.0))
    scene.world = world
    az, el = (float(v) for v in opt.get('--sun', '135,46').split(','))
    sun = bpy.data.lights.new('sun', 'SUN')
    sun.energy, sun.angle = 4.2, math.radians(1.2)
    so = bpy.data.objects.new('sun', sun)
    scene.collection.objects.link(so)
    stand_sun(so, az, el)
    if opt.get('--sea', '1') == '1':
        bpy.ops.mesh.primitive_plane_add(size=900, location=(0, 0, 0))
        sea = bpy.context.active_object
        m = bpy.data.materials.new('sea')
        m.use_nodes = True
        p = m.node_tree.nodes['Principled BSDF']
        p.inputs['Base Color'].default_value = (0.03, 0.10, 0.13, 1)
        p.inputs['Roughness'].default_value = 0.18
        noise, bump = m.node_tree.nodes.new('ShaderNodeTexNoise'), m.node_tree.nodes.new('ShaderNodeBump')
        noise.inputs['Scale'].default_value = 0.6
        noise.inputs['Detail'].default_value = 6.0
        bump.inputs['Strength'].default_value = 0.35
        m.node_tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
        m.node_tree.links.new(bump.outputs['Normal'], p.inputs['Normal'])
        sea.data.materials.append(m)
    for name in (opt.get('--hide') or '').split(','):
        for ob in bpy.data.objects:
            if name and ob.name.startswith(name):
                ob.hide_render = True
    cam_data = bpy.data.cameras.new('c')
    cam_data.clip_start, cam_data.clip_end = 0.03, 800
    cam = bpy.data.objects.new('c', cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    scene.render.image_settings.file_format = 'PNG'
    return cam


def shoot(cam, out, eye, aim, lens, sets, sun=''):
    if sun:
        stand_sun(bpy.data.objects['sun'], *(float(v) for v in sun.split(',')))
    values = {}
    for item in (sets or '').split(','):
        if '=' in item:
            k, v = item.split('=')
            values[k.strip()] = float(v)
    moved = pose(values)
    e, a = B([float(v) for v in eye.split(',')]), B([float(v) for v in aim.split(',')])
    cam.location = e
    cam.rotation_euler = (a - e).to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = float(lens)
    scene.render.filepath = os.path.abspath(out)
    os.makedirs(os.path.dirname(scene.render.filepath), exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print('still:', out, f'({moved} moving objects posed)')


cam = setup()
if '--shots' in opt:
    for line in open(opt['--shots']):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        f = [s.strip() for s in line.split('|')] + ['', '', '']
        shoot(cam, f[0], f[1], f[2], f[3] or 35, f[4], f[5])
else:
    shoot(cam, opt['--out'], opt['--eye'], opt['--aim'], opt.get('--lens', 35), opt.get('--set', ''))
