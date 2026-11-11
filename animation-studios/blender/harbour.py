"""Minato harbour from Johansson World, in ink.

The set is the one the homepage's "Explore harbour" viewer loads: assets/office-port/harbour.scene.gz,
baked from the World by tools/office-port/bake.mjs (three.js geometry in world space, metres, Y up).
Here it is rebuilt as Blender meshes (X east, Y = -Z of the World, Z up) and painted for ink: light
surfaces white, dark ones black, every edge inked by tools/inkpaint.py.

    /root/bl/bin/python blender/harbour.py --overview out.png
"""
import gzip
import json
import math
import struct
import sys
from pathlib import Path
import bpy
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'tools'))
import common

SCENE = Path(__file__).resolve().parents[2] / 'assets' / 'office-port' / 'harbour.scene.gz'
TYPES = dict(Float32Array='<f4', Uint32Array='<u4', Uint16Array='<u2', Uint8Array='u1', Int8Array='i1', Int16Array='<i2')
DARK = 0.22          # surfaces darker than this are painted black
QUAY_Y = 50.0        # the quay's edge runs east-west here; the water, pier and ferry are north of it
# the backdrop: the harbour seen from the quay looking north, from open water in the west to open water in
# the east, so that its two ends join and it can go round and round behind him
BACKDROP = dict(west=-58.0, east=72.0, width=3840, height=760, waterline_row=640, pitch=8.0, ink=4.5)


def decode():
    """Yield (positions (n,3) in Blender axes, triangles (m,3), lightness per point 0..1) for every mesh."""
    d = gzip.open(SCENE).read()
    n = struct.unpack('<I', d[:4])[0]
    j = json.loads(d[4:4 + n])
    base = 4 + n + (4 - n % 4) % 4
    geo = {g['uuid']: g for g in j['geometries']}
    mats = {m['uuid']: m for m in j['materials']}

    def array(a):
        v = a['bufferView']
        x = np.frombuffer(d, dtype=TYPES[a['type']], count=v['length'] // np.dtype(TYPES[a['type']]).itemsize, offset=base + v['offset'])
        return x

    for ob in j['object']['children']:
        g = geo[ob['geometry']]['data']
        pa = g['attributes']['position']
        p = array(pa).reshape(-1, 3).astype(np.float64)
        if 'quantization' in pa:
            q = pa['quantization']
            p = np.array(q['min']) + p / 65535.0 * np.array(q['range'])
        if 'matrix' in ob:
            m = np.array(ob['matrix']).reshape(4, 4).T
            p = p @ m[:3, :3].T + m[:3, 3]
        idx = array(g['index']).reshape(-1, 3).astype(np.int64) if g.get('index') else np.arange(len(p)).reshape(-1, 3)
        mat = mats[ob['material']] if isinstance(ob['material'], str) else mats[ob['material'][0]]
        c = mat.get('color', 0xffffff)
        rgb = np.array([(c >> 16) & 255, (c >> 8) & 255, c & 255]) / 255.0
        lum = np.full(len(p), float(rgb @ (0.299, 0.587, 0.114)))
        if 'color' in g['attributes'] and mat.get('vertexColors'):
            vc = array(g['attributes']['color']).reshape(len(p), -1)[:, :3].astype(np.float64) / 255.0
            lum = (vc * rgb) @ (0.299, 0.587, 0.114)
        yield np.stack([p[:, 0], -p[:, 2], p[:, 1]], 1), idx, lum, mat.get('transparent', False), mat.get('opacity', 1.0)


def material(depth_range):
    """The same packed picture as the sailor's: normal in red and green, depth and paint in blue."""
    m = bpy.data.materials.new('harbour')
    m.use_nodes = True
    nt = m.node_tree
    N, L = nt.nodes, nt.links
    N.clear()

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

    at = N.new('ShaderNodeAttribute'); at.attribute_name = 'white'
    paint = math_('GREATER_THAN', at.outputs['Fac'], 0.5)
    geo = N.new('ShaderNodeNewGeometry')
    vt = N.new('ShaderNodeVectorTransform'); vt.vector_type = 'NORMAL'; vt.convert_from = 'WORLD'; vt.convert_to = 'CAMERA'
    L.new(geo.outputs['Normal'], vt.inputs[0])
    sep = N.new('ShaderNodeSeparateXYZ'); L.new(vt.outputs[0], sep.inputs[0])
    r = math_('ADD', math_('MULTIPLY', sep.outputs[0], 0.5), 0.5)
    g = math_('ADD', math_('MULTIPLY', sep.outputs[1], 0.5), 0.5)
    cam = N.new('ShaderNodeCameraData')
    d = math_('DIVIDE', math_('SUBTRACT', cam.outputs['View Z Depth'], depth_range[0]), depth_range[1] - depth_range[0], clamp=True)
    b = math_('ADD', math_('MULTIPLY', d, 0.45), math_('MULTIPLY', paint, 0.5))
    comb = N.new('ShaderNodeCombineXYZ'); L.new(r, comb.inputs[0]); L.new(g, comb.inputs[1]); L.new(b, comb.inputs[2])
    e = N.new('ShaderNodeEmission'); L.new(comb.outputs[0], e.inputs['Color'])
    o = N.new('ShaderNodeOutputMaterial'); L.new(e.outputs[0], o.inputs[0])
    return m


def build(scale=1.0, depth_range=(1.0, 400.0), north_of=None):
    """Build the harbour, `scale` Blender units to the metre. Returns the objects.
    north_of: keep only what lies beyond this line (the water side of the quay)."""
    mat = material(depth_range)
    obs = []
    for i, (p, idx, lum, transparent, opacity) in enumerate(decode()):
        if transparent and opacity < 0.5:
            continue                                        # glass and glows: not for ink
        if north_of is not None:
            keep = (p[idx][:, :, 1] > north_of).all(1)
            idx = idx[keep]
            if not len(idx):
                continue
        me = bpy.data.meshes.new(f'harbour.{i:03d}')
        me.from_pydata((p * scale).tolist(), [], idx.tolist())
        me.update()
        a = me.attributes.new('white', 'FLOAT', 'POINT')
        a.data.foreach_set('value', (lum > DARK).astype(np.float32))
        me.materials.append(mat)
        ob = bpy.data.objects.new(me.name, me)
        bpy.context.scene.collection.objects.link(ob)
        obs.append(ob)
    return obs


def shot(sc, tmp, depth_span, **kw):
    """Render what the scene's camera sees, inked."""
    import inkpaint
    sc.render.resolution_percentage = 100 * common.SCALE
    sc.render.filepath = str(tmp)
    bpy.ops.render.render(write_still=True)
    img = bpy.data.images.load(str(tmp), check_existing=False)
    img.colorspace_settings.name = 'Non-Color'
    w, h = img.size
    a = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)[::-1]
    bpy.data.images.remove(img)
    return inkpaint.inked_surface(a, common.SCALE, kw.pop('ink', common.INK_PX), depth_span=depth_span, **kw)


if __name__ == '__main__':
    from PIL import Image
    sc = common.reset()
    sc.render.image_settings.color_depth = '16'
    water_side = '--backdrop' in sys.argv
    obs = build(depth_range=(1.0, 401.0), north_of=QUAY_Y + 0.3 if water_side else None)
    allp = np.concatenate([np.array([v.co for v in o.data.vertices]) for o in obs])
    print('BOUNDS', allp.min(0).round(1), allp.max(0).round(1), 'meshes', len(obs))
    if '--overview' in sys.argv:
        out = sys.argv[sys.argv.index('--overview') + 1]
        common.PX_PER_BU = 9.0
        shots = []
        for yaw, pitch, at in ((0, 89.0, (5, 22, 0)), (0, 20.0, (0, 57, 2)), (90, 20.0, (0, 57, 2))):
            for o in [o for o in sc.objects if o.type == 'CAMERA']:
                bpy.data.objects.remove(o)
            common.camera(sc, 1400, 1000, at, (700, 560), yaw=math.radians(yaw), pitch=math.radians(pitch))
            shots.append(shot(sc, out + '.raw.png', 400.0, ink=3.0, depth_step=1.2, turn=0.9))
        sheet = Image.new('RGB', (1400 * 3, 1000), 'white')
        for i, s in enumerate(shots):
            sheet.paste(s, (i * 1400, 0), s)
        sheet.save(out)
    if '--backdrop' in sys.argv:
        out = sys.argv[sys.argv.index('--backdrop') + 1]
        B = BACKDROP
        common.PX_PER_BU = B['width'] / (B['east'] - B['west'])
        common.camera(sc, B['width'], B['height'], ((B['west'] + B['east']) / 2, QUAY_Y, 0.0), (B['width'] / 2, B['waterline_row']),
                      yaw=0.0, pitch=math.radians(B['pitch']))
        shot(sc, out + '.raw.png', 400.0, ink=B['ink'], depth_step=0.7, turn=0.85).save(out)
