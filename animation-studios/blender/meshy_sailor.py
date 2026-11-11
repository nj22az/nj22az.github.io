"""The owner's Meshy sailor, cleaned up for ink and paint.

The model (Meshy image-to-3d, 'Sailor Character 3D') is sculpted and textured in black, white and
grey. Cleaning it up means:
  - grey (skin, clothes, boots, hat) becomes the white of the drawings;
  - the shirt's hoops are drawn again by height, clean all the way round (the texture smears them at
    the sides and under the arms);
  - the hat becomes the sailor's cap of the sheets: white crown and band, black peak in front.
Nothing is sculpted again: the changes are paint, stored on the model's points.

    /root/bl/bin/python blender/meshy_sailor.py MODEL.glb --views out.png
"""
import math
import sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
import common

HEIGHT = 3.09                 # Blender units: the sheet's 309 pixels
HAT_FROM = 2.63               # above this, whatever the texture paints grey is hat
PEAK = dict(x_from=0.13, z_to=2.80)
SHIRT = (1.47, 2.24)          # between the belt and the collar
SHIRT_HALF_WIDTH = 0.50       # the trunk itself; beyond it the texture says where the sleeves' hoops are


def load(path):
    """Import the model, stand it on z = 0 facing +X at HEIGHT, and return the mesh object."""
    bpy.ops.import_scene.gltf(filepath=str(path))
    ob = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
    for o in list(bpy.context.scene.objects):
        if o is not ob and o.type == 'EMPTY':
            pass
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    world = ob.matrix_world.copy()
    ob.parent = None
    ob.matrix_world = world
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    n = len(ob.data.vertices)
    co = np.empty(n * 3); ob.data.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    lo, hi = co.min(0), co.max(0)
    k = HEIGHT / (hi[2] - lo[2]); c = (lo + hi) / 2
    new = np.stack([-(co[:, 1] - c[1]) * k, (co[:, 0] - c[0]) * k, (co[:, 2] - lo[2]) * k], 1)   # he faced -Y
    ob.data.vertices.foreach_set('co', new.ravel())
    ob.data.update()
    ob.name = 'Sailor'
    return ob


def texture_lum(ob):
    """How light the texture is at every point of the model (0 black .. 1 white)."""
    me = ob.data
    img = next(nd.image for nd in me.materials[0].node_tree.nodes if nd.type == 'TEX_IMAGE' and nd.image)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[..., :3].mean(-1)
    uv = np.empty(len(me.loops) * 2, dtype=np.float32); me.uv_layers[0].data.foreach_get('uv', uv); uv = uv.reshape(-1, 2)
    vi = np.empty(len(me.loops), dtype=np.int32); me.loops.foreach_get('vertex_index', vi)
    x = np.clip((uv[:, 0] % 1.0 * w).astype(int), 0, w - 1); y = np.clip((uv[:, 1] % 1.0 * h).astype(int), 0, h - 1)
    lum = np.zeros(len(me.vertices)); cnt = np.zeros(len(me.vertices))
    np.add.at(lum, vi, px[y, x]); np.add.at(cnt, vi, 1)
    return lum / np.maximum(cnt, 1)


def hoops(co, lum):
    """The heights of the shirt's black hoops, read down the middle of his back where the texture is clean."""
    back = (co[:, 0] < -0.1) & (np.abs(co[:, 1]) < 0.18) & (co[:, 2] > SHIRT[0]) & (co[:, 2] < SHIRT[1])
    step = 0.01
    edges = np.arange(SHIRT[0], SHIRT[1] + step, step)
    dark = []
    for a in edges[:-1]:
        m = back & (co[:, 2] >= a) & (co[:, 2] < a + step)
        dark.append(m.sum() > 0 and lum[m].mean() < 0.3)
    bands, start = [], None
    for a, d in zip(edges[:-1], dark):
        if d and start is None:
            start = a
        if not d and start is not None:
            bands.append((round(start, 3), round(a, 3))); start = None
    if start is not None:
        bands.append((round(start, 3), round(SHIRT[1], 3)))
    return [b for b in bands if b[1] - b[0] > 0.03]


def clean(ob):
    """Store the clean paint on the model's points: attributes `shirt`, `hat`, `peak`, `rest_z`."""
    me = ob.data
    n = len(me.vertices)
    co = np.empty(n * 3); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    lum = texture_lum(ob)
    grey = (lum > 0.3) & (lum < 0.75)
    hat = (co[:, 2] > HAT_FROM) & grey                        # his forehead under the brim is white: not hat
    hat |= co[:, 2] > 2.80                                   # the crown, whatever the texture says
    peak = hat & (co[:, 0] > PEAK['x_from']) & (co[:, 2] < PEAK['z_to'])
    brim_front = (co[:, 0] > 0.25) & (co[:, 2] > 2.64) & (co[:, 2] < PEAK['z_to'])   # further forward than his forehead
    peak |= brim_front
    hat |= brim_front
    in_height = (co[:, 2] > SHIRT[0]) & (co[:, 2] < SHIRT[1])
    under_beard = (co[:, 0] > 0.0) & (co[:, 2] > 1.95) & (np.abs(co[:, 1]) < 0.42)   # there the texture is clean: keep it
    shirt = in_height & ~under_beard & ((np.abs(co[:, 1]) < SHIRT_HALF_WIDTH) | ~grey)
    bands = hoops(co, lum)
    for name, values in (('shirt', shirt), ('hat', hat), ('peak', peak), ('rest_z', co[:, 2])):
        a = me.attributes.new(name, 'FLOAT', 'POINT')
        a.data.foreach_set('value', np.asarray(values, dtype=np.float32))
    return bands


def material(ob, bands, depth_range):
    """One flat material that packs everything the inker needs into one picture:
    red and green = which way the surface faces the camera, blue = depth and paint together."""
    m = ob.data.materials[0]
    nt = m.node_tree
    N = nt.nodes
    L = nt.links
    tex = next(nd for nd in N if nd.type == 'TEX_IMAGE' and nd.image)

    def math_(op, a, b=None, clamp=False):
        nd = N.new('ShaderNodeMath'); nd.operation = op; nd.use_clamp = clamp
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

    bw = N.new('ShaderNodeRGBToBW'); L.new(tex.outputs['Color'], bw.inputs[0])
    tex_white = math_('GREATER_THAN', bw.outputs[0], 0.06)       # the shader sees linear light: grey is 0.21, black 0.005
    z = attr('rest_z')
    in_band = None
    for a, b in bands:
        inside = math_('MULTIPLY', math_('GREATER_THAN', z, a), math_('LESS_THAN', z, b))
        in_band = inside if in_band is None else math_('MAXIMUM', in_band, inside)
    shirt_white = math_('SUBTRACT', 1.0, in_band) if in_band is not None else 1.0
    hat_white = math_('SUBTRACT', 1.0, math_('GREATER_THAN', attr('peak'), 0.5))
    mix1 = N.new('ShaderNodeMix'); L.new(math_('GREATER_THAN', attr('shirt'), 0.5), mix1.inputs[0])
    L.new(tex_white, mix1.inputs[2])
    if isinstance(shirt_white, float):
        mix1.inputs[3].default_value = shirt_white
    else:
        L.new(shirt_white, mix1.inputs[3])
    mix2 = N.new('ShaderNodeMix'); L.new(math_('GREATER_THAN', attr('hat'), 0.5), mix2.inputs[0])
    L.new(mix1.outputs[0], mix2.inputs[2]); L.new(hat_white, mix2.inputs[3])
    paint = mix2.outputs[0]
    geo = N.new('ShaderNodeNewGeometry')
    vt = N.new('ShaderNodeVectorTransform'); vt.vector_type = 'NORMAL'; vt.convert_from = 'WORLD'; vt.convert_to = 'CAMERA'
    L.new(geo.outputs['Normal'], vt.inputs[0])
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(vt.outputs[0], sep.inputs[0])
    nx = math_('MULTIPLY_ADD', sep.outputs[0], 0.5, False); 
    r = math_('ADD', math_('MULTIPLY', sep.outputs[0], 0.5), 0.5)
    g = math_('ADD', math_('MULTIPLY', sep.outputs[1], 0.5), 0.5)
    cam = N.new('ShaderNodeCameraData')
    d = math_('DIVIDE', math_('SUBTRACT', cam.outputs['View Z Depth'], depth_range[0]), depth_range[1] - depth_range[0], clamp=True)
    b = math_('ADD', math_('MULTIPLY', d, 0.45), math_('MULTIPLY', paint, 0.5))     # depth in 0..0.45, +0.5 if white
    comb = N.new('ShaderNodeCombineXYZ'); L.new(r, comb.inputs[0]); L.new(g, comb.inputs[1]); L.new(b, comb.inputs[2])
    e = N.new('ShaderNodeEmission'); L.new(comb.outputs[0], e.inputs['Color'])
    L.new(e.outputs[0], next(nd for nd in N if nd.type == 'OUTPUT_MATERIAL').inputs[0])


def setup(path):
    sc = common.reset()
    sc.render.image_settings.color_depth = '16'
    ob = load(path)
    bands = clean(ob)
    print('hoops', bands)
    material(ob, bands, (50.0, 70.0))
    return sc, ob


def render(sc, tmp):
    from PIL import Image
    import inkpaint
    sc.render.resolution_percentage = 100 * common.SCALE
    sc.render.filepath = str(tmp)
    bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(str(tmp), check_existing=False)
    img.colorspace_settings.name = 'Non-Color'            # the numbers as written, not as a picture
    w, h = img.size
    a = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[::-1]
    bpy.data.images.remove(img)
    return inkpaint.inked_surface(a, common.SCALE, common.INK_PX, depth_span=20.0, turn=0.75)


if __name__ == '__main__':
    from PIL import Image
    sc, ob = setup(sys.argv[1])
    if '--views' in sys.argv:
        out = sys.argv[sys.argv.index('--views') + 1]
        shots = []
        for yaw in (0, 46, 90, 150):
            for o in [o for o in sc.objects if o.type == 'CAMERA']:
                bpy.data.objects.remove(o)
            common.camera(sc, 700, 720, (0, 0, 0), (350, 690), yaw=math.radians(yaw), pitch=0.0)
            shots.append(render(sc, out + '.raw.png'))
        sheet = Image.new('RGB', (700 * len(shots), 720), 'white')
        for i, s in enumerate(shots):
            sheet.paste(s, (i * 700, 0), s)
        sheet.save(out)
