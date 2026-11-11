"""Shared by the Blender scripts: the ink look and the camera.

Everything is flat white or flat black, and the outlines are inked afterwards wherever two parts meet
(tools/inkpaint.py), in the line weight of the owner's sheets. The camera is orthographic, looking from his front right
and slightly down, so the picture is as flat as a drawing: nothing shrinks with distance.

Units: 1 Blender unit = 100 pixels of the reference sheet. +X is the way he walks, +Z is up.
"""
import math
import bpy
from mathutils import Matrix, Vector

PX_PER_BU = 200.0          # film pixels per Blender unit (2 film pixels per sheet pixel)
INK_PX = 10.5              # line weight in film pixels
YAW = math.radians(46)     # how far round to his front the camera stands
PITCH = math.radians(11)   # how far it looks down


SCALE = 3                  # rendered this many times larger than the film, then inked and reduced


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.samples = 1                      # one clean sample per pixel: every pixel is exactly one part
    sc.cycles.use_denoising = False
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.max_bounces = 0
    sc.cycles.pixel_filter_type = 'BOX'
    sc.cycles.filter_width = 0.01
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.color_depth = '8'
    sc.display_settings.display_device = 'sRGB'
    sc.view_settings.view_transform = 'Raw'
    sc.render.use_freestyle = False
    sc.render.dither_intensity = 0.0           # the code colours must arrive exactly
    return sc


_mats = {}
_groups = {}


def paint(group, colour):
    """The material of one part: `group` names the parts that are inked as one shape, `colour` is
    'white' or 'black'. It renders as a code colour that tools/inkpaint.py turns into ink and paint."""
    gid = _groups.setdefault(group, len(_groups) + 1)
    assert gid < 225, 'too many parts'
    key = (gid, colour)
    if key not in _mats:
        m = bpy.data.materials.new(f'{group}:{colour}')
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.clear()
        e = nt.nodes.new('ShaderNodeEmission')
        e.inputs['Color'].default_value = ((gid % 15 + 1) * 16 / 255.0, (gid // 15) * 16 / 255.0, 1.0 if colour == 'white' else 0.0, 1)
        o = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(e.outputs[0], o.inputs[0])
        _mats[key] = m
    return _mats[key]


def flat(colour):
    """A placeholder material, replaced by `assign`."""
    if colour not in bpy.data.materials:
        bpy.data.materials.new(colour)
    return bpy.data.materials[colour]


def assign(ob, group):
    for i, m in enumerate(ob.data.materials):
        ob.data.materials[i] = paint(group, m.name.split(':')[-1])


def render(sc, path):
    """Render the code picture at SCALE and return it inked and painted at film size."""
    import sys
    from pathlib import Path
    from PIL import Image
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
    import inkpaint
    sc.render.resolution_percentage = 100 * SCALE
    sc.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    return inkpaint.inked(Image.open(path), SCALE, INK_PX)


def camera_axes(yaw=YAW, pitch=PITCH):
    """Unit vectors of the camera in the world: right, up, and the way it looks."""
    look = Vector((-math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), -math.sin(pitch)))
    right = Vector((math.cos(yaw), math.sin(yaw), 0.0))
    up = right.cross(look)
    return right, up, look


def camera(sc, width, height, ground_point, ground_px, yaw=YAW, pitch=PITCH):
    """An orthographic camera that puts the world point `ground_point` at pixel `ground_px` (x from the
    left, y from the top) of a width x height picture, at PX_PER_BU."""
    right, up, look = camera_axes(yaw, pitch)
    cam = bpy.data.cameras.new('camera')
    cam.type = 'ORTHO'
    cam.ortho_scale = max(width, height) / PX_PER_BU
    cam.clip_start, cam.clip_end = 0.1, 400
    ob = bpy.data.objects.new('camera', cam)
    sc.collection.objects.link(ob)
    centre = Vector(ground_point) + right * ((width / 2 - ground_px[0]) / PX_PER_BU) + up * ((ground_px[1] - height / 2) / PX_PER_BU)
    ob.matrix_world = Matrix.Translation(centre - look * 60) @ Matrix((right, up, -look)).transposed().to_4x4()
    sc.camera = ob
    sc.render.resolution_x, sc.render.resolution_y = width, height
    sc.render.resolution_percentage = 100
    return ob


def screen_x_per_world_x():
    """How many film pixels one Blender unit along his path covers on the screen."""
    return PX_PER_BU * math.cos(YAW)
