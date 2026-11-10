"""
A still of the Christina's hull from the file build.py wrote, in Cycles: the hull standing on the slip in daylight.

    blender -b christina.blend -P ferry/blender/render.py -- --out hull-stern.png [--view stern|bow|inside] [--samples 96]

It adds a sky, a sun, a floor and a camera to the scene for the picture and saves nothing back to the file.
"""
import sys, math, os
import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
opt = dict(zip(argv[::2], argv[1::2]))
view = opt.get('--view', 'stern')
scene = bpy.context.scene

# Blender's X is her length (forward), Y her breadth (to port), Z up from the laden waterline.
VIEWS = {
    # where the eye stands, what it looks at, the lens
    'stern': ((-27.0, -13.5, 0.4), (-11.0, -0.6, -0.4), 42),
    'bow': ((30.0, -15.0, 1.6), (9.0, 0.0, 0.2), 45),
    'inside': ((-9.0, -10.5, 11.0), (0.5, 0.3, -1.2), 32),
}
eye, aim, lens = VIEWS[view]

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = int(opt.get('--samples', 96))
scene.cycles.use_denoising = bool(getattr(bpy.app.build_options, 'openimagedenoise', False))
scene.render.resolution_x, scene.render.resolution_y = 1920, 1080
scene.render.film_transparent = False
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'

world = bpy.data.worlds.new('Slip daylight')
world.use_nodes = True
nt = world.node_tree
sky = nt.nodes.new('ShaderNodeTexSky')
sky.sky_type = 'NISHITA'
sky.sun_elevation = math.radians(38)
sky.sun_rotation = math.radians(-125 if view != 'bow' else -60)
sky.sun_intensity = 0.2
sky.air_density, sky.dust_density, sky.ozone_density = 1.0, 0.6, 1.0
bg = nt.nodes['Background']
bg.inputs['Strength'].default_value = 0.15
nt.links.new(sky.outputs['Color'], bg.inputs['Color'])
scene.world = world

# The slip: pale concrete, a little rough.
bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -1.99))
floor = bpy.context.active_object
m = bpy.data.materials.new('Slip')
m.use_nodes = True
p = m.node_tree.nodes['Principled BSDF']
p.inputs['Base Color'].default_value = (0.55, 0.55, 0.53, 1)
p.inputs['Roughness'].default_value = 0.85
floor.data.materials.append(m)

cam_data = bpy.data.cameras.new('Camera')
cam_data.lens = lens
cam_data.dof.use_dof = False
cam = bpy.data.objects.new('Camera', cam_data)
scene.collection.objects.link(cam)
cam.location = eye
cam.rotation_euler = (Vector(aim) - Vector(eye)).to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam

if view == 'inside':
    # Looking down into her: only the hull, without the tank top that lifts with the machinery spaces.
    c = bpy.data.collections.get('machinery')
    if c:
        for ob in c.all_objects:
            ob.hide_render = True

out = os.path.abspath(opt.get('--out', f'christina-hull-{view}.png'))
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print('rendered', out)
