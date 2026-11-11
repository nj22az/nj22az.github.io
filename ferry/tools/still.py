"""A quick still: blender -b file.blend -P look.py -- --out x.png --eye x,y,z --aim x,y,z [--lens 35] [--samples 24] [--hide a,b] [--size 1400x800]
Eye and aim in the SHIP's terms: (yard from transom, x to port, height above keel)."""
import sys, math, os
import bpy
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]
opt = dict(zip(argv[::2], argv[1::2]))
HALF, DRAFT = 34.2, 3.2
def P(s):
    yd, x, h = (float(v) for v in s.split(','))
    return Vector((yd - HALF, x, h - DRAFT))
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = int(opt.get('--samples', 24))
scene.cycles.use_denoising = False
w, h = (int(v) for v in opt.get('--size', '1400x800').split('x'))
scene.render.resolution_x, scene.render.resolution_y = w, h
scene.view_settings.view_transform = 'Standard'
world = bpy.data.worlds.new('w'); world.use_nodes = True
bg = world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.85, 0.9, 1.0, 1); bg.inputs['Strength'].default_value = float(opt.get('--sky', 0.9))
scene.world = world
sun = bpy.data.lights.new('sun', 'SUN'); sun.energy = 3.0; sun.angle = 0.05
so = bpy.data.objects.new('sun', sun); scene.collection.objects.link(so)
so.rotation_euler = (math.radians(50), math.radians(10), math.radians(float(opt.get('--sun', -60))))
if opt.get('--lamp'):
    lamp = bpy.data.lights.new('lamp', 'POINT'); lamp.energy = float(opt.get('--watts', 800))
    lo = bpy.data.objects.new('lamp', lamp); scene.collection.objects.link(lo); lo.location = P(opt['--lamp'])
if opt.get('--floor', '1') == '1':
    bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -DRAFT - 0.4))
for name in (opt.get('--hide') or '').split(','):
    c = bpy.data.collections.get(name)
    if c:
        for ob in c.all_objects: ob.hide_render = True
    for ob in bpy.data.objects:
        if name and ob.name.startswith(name): ob.hide_render = True
cam_data = bpy.data.cameras.new('c'); cam_data.lens = float(opt.get('--lens', 35)); cam_data.clip_start = 0.05; cam_data.clip_end = 500
cam = bpy.data.objects.new('c', cam_data); scene.collection.objects.link(cam)
eye, aim = P(opt['--eye']), P(opt['--aim'])
cam.location = eye
cam.rotation_euler = (aim - eye).to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = os.path.abspath(opt['--out'])
bpy.ops.render.render(write_still=True)
