#!/usr/bin/env python3
"""Thuan's smartphone (the owner, 28 October 2026: "But bring an open source smartphone"): the CC0 "6.1 inch smartphone"
from 3DAssets.dev (assets/ATTRIBUTION.md), with its one fault taken out. As published, two slabs of its black body stand
up from the ends of the phone above the screen (to 21.8 mm, where the phone is 8 mm: side buttons put on the wrong axis).
This drops every triangle of the body that rises above the screen's top (y 14.6 mm in the model) and nothing else, and
writes the GLB again with the same buffers (only the body's index list is shorter).

    python3 tools/clean-smartphone-glb.py <downloaded model.glb> assets/models/props/smartphone-61.glb

Standard library only; prints the hash of what it read and wrote, and how many triangles went.
"""
import hashlib, json, struct, sys

ABOVE = 0.0150   # metres in the model: the screen's top is at 0.0146, the slab's at 0.0138


def read(path):
    data = open(path, 'rb').read()
    assert data[:4] == b'glTF', 'not a GLB'
    n = struct.unpack('<I', data[12:16])[0]
    doc = json.loads(data[20:20 + n])
    rest = data[20 + n:]
    bn = struct.unpack('<I', rest[:4])[0]
    assert rest[4:8] == b'BIN\x00'
    return data, doc, bytearray(rest[8:8 + bn])


def accessor(doc, binary, i):
    a = doc['accessors'][i]
    view = doc['bufferViews'][a['bufferView']]
    fmt = {5120: 'b', 5121: 'B', 5122: 'h', 5123: 'H', 5125: 'I', 5126: 'f'}[a['componentType']]
    comps = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    size = struct.calcsize(fmt)
    stride = view.get('byteStride') or size * comps
    start = view.get('byteOffset', 0) + a.get('byteOffset', 0)
    out = []
    for k in range(a['count']):
        vals = struct.unpack_from('<' + fmt * comps, binary, start + k * stride)
        if a.get('normalized'):
            top = {'b': 127, 'B': 255, 'h': 32767, 'H': 65535}[fmt]
            vals = tuple(max(v / top, -1.0) for v in vals)
        out.append(vals)
    return a, view, fmt, out


def main(src, dst):
    data, doc, binary = read(src)
    body = next(i for i, m in enumerate(doc['meshes']) if m.get('name', '').endswith('_0'))
    node = next(n for n in doc['nodes'] if n.get('mesh') == body)
    t = node.get('translation', [0, 0, 0])
    s = node.get('scale', [1, 1, 1])
    removed = 0
    for prim in doc['meshes'][body]['primitives']:
        _, _, _, pos = accessor(doc, binary, prim['attributes']['POSITION'])
        y = [p[1] * s[1] + t[1] for p in pos]
        a, view, fmt, idx = accessor(doc, binary, prim['indices'])
        flat = [v[0] for v in idx]
        keep = []
        for k in range(0, len(flat), 3):
            tri = flat[k:k + 3]
            if max(y[v] for v in tri) > ABOVE:
                removed += 1
                continue
            keep += tri
        start = view.get('byteOffset', 0) + a.get('byteOffset', 0)
        struct.pack_into('<' + fmt * len(keep), binary, start, *keep)
        # (what is left over at the end of the list is never read: the accessor's count stops before it)
        a['count'] = len(keep)
    doc.setdefault('extras', {})['johansson'] = (
        'Thuan’s smartphone: 3DAssets.dev "6.1 inch smartphone" (CC0 1.0), the two slabs that stood above the screen '
        'removed by tools/clean-smartphone-glb.py')
    js = json.dumps(doc, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    binary += b'\x00' * (-len(binary) % 4)
    out = (b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(binary)) +
           struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(binary)) + b'BIN\x00' + bytes(binary))
    open(dst, 'wb').write(out)
    print('read ', hashlib.sha256(data).hexdigest(), src)
    print('wrote', hashlib.sha256(out).hexdigest(), dst)
    print('triangles removed from the body:', removed)


if __name__ == '__main__':
    main(*sys.argv[1:3])
