"""A quick look at the built ship, drawn by Blender's own workbench in a second or two: for shape, not for light.

    blender -b built.blend -P ferry/tools/look.py -- --out folder [--views profile,plan,bow,stern,body] [--size 2400x900]
    blender -b built.blend -P ferry/tools/look.py -- --out x.png --eye 51.2,5.1,14.0 --aim 52.0,5.9,13.6 [--lens 35] [--hide Name,Name]

`profile` and `plan` are true views (no perspective), side-on from starboard and from above, for laying beside a drawing.
Eye and aim are in the ship's terms: (metres from the transom, metres to port, metres above the keel).
"""
import sys, os, math
import bpy
from mathutils import Vector
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'blender'))
import lines as L

argv = sys.argv[sys.argv.index('--') + 1:]
opt = dict(zip(argv[::2], argv[1::2]))


def P(yd, x, h):
    return Vector((yd - L.HALF, x, h - L.DRAFT))


scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
sh = scene.display.shading
sh.light = 'STUDIO'
sh.color_type = 'VERTEX'
sh.show_shadows = False
sh.show_cavity = True
sh.cavity_type = 'BOTH'
sh.show_object_outline = False
sh.show_backface_culling = True          # as the page draws her: a skin is seen from one side
scene.display.render_aa = '8'
scene.view_settings.view_transform = 'Standard'
world = bpy.data.worlds.new('w')
world.color = (0.92, 0.94, 0.96)
scene.world = world
scene.render.film_transparent = False
w, h = (int(v) for v in opt.get('--size', '2400x900').split('x'))
scene.render.image_settings.file_format = 'PNG'
for name in (opt.get('--hide') or '').split(','):
    for ob in bpy.data.objects:
        if name and ob.name.startswith(name):
            ob.hide_render = True
    c = bpy.data.collections.get(name)
    if c:
        for ob in c.all_objects:
            ob.hide_render = True
cam_data = bpy.data.cameras.new('c')
cam_data.clip_start, cam_data.clip_end = 0.05, 2000
cam = bpy.data.objects.new('c', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam


def shoot(path, eye, aim, lens=None, ortho=None, size=None, up='Y'):
    scene.render.resolution_x, scene.render.resolution_y = size or (w, h)
    if ortho:
        cam_data.type = 'ORTHO'
        cam_data.ortho_scale = ortho
    else:
        cam_data.type = 'PERSP'
        cam_data.lens = lens or 35
    cam.location = eye
    cam.rotation_euler = (aim - eye).to_track_quat('-Z', up).to_euler()
    scene.render.filepath = os.path.abspath(path)
    bpy.ops.render.render(write_still=True)
    print('wrote', path)


mid = P(L.LENGTH / 2, 0, 10.0)
VIEWS = dict(
    profile=lambda f: shoot(f, P(L.LENGTH / 2, -400, 12.0), P(L.LENGTH / 2, 0, 12.0), ortho=L.LENGTH * 1.06, size=(2600, 760)),
    plan=lambda f: shoot(f, P(L.LENGTH / 2, 0, 400), P(L.LENGTH / 2, 0, 0), ortho=L.LENGTH * 1.06, size=(2600, 520), up='X'),
    bow=lambda f: shoot(f, P(L.LENGTH + 70, -75, 38), P(L.LENGTH * 0.62, 0, 9), lens=38, size=(2000, 1200)),
    stern=lambda f: shoot(f, P(-70, -70, 34), P(L.LENGTH * 0.4, 0, 9), lens=38, size=(2000, 1200)),
    body=lambda f: shoot(f, P(L.LENGTH + 200, 0, 8.0), P(L.LENGTH / 2, 0, 8.0), ortho=26, size=(1400, 1200)),
    under=lambda f: shoot(f, P(L.LENGTH + 40, -45, -18), P(L.LENGTH * 0.7, 0, 3), lens=32, size=(2000, 1200)),
    aft_under=lambda f: shoot(f, P(-30, -32, -8), P(18, 0, 3), lens=32, size=(2000, 1200)),
)
if opt.get('--eye'):
    eye = P(*(float(v) for v in opt['--eye'].split(',')))
    aim = P(*(float(v) for v in opt['--aim'].split(',')))
    shoot(opt['--out'], eye, aim, lens=float(opt.get('--lens', 35)), size=(w, h))
else:
    os.makedirs(opt['--out'], exist_ok=True)
    for name in (opt.get('--views') or 'profile,plan,bow,stern').split(','):
        VIEWS[name](os.path.join(opt['--out'], name + '.png'))
