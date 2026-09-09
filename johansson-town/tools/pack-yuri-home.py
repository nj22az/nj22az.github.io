"""Fit the owner-supplied Japanese Residential Home 02 as Yuri's canal house.

python tools/pack-yuri-home.py /path/to/japanese_residential_home_02.glb
Centimetres become metres, the door faces +Z, textures become portable JPEGs.
"""
import copy
import hashlib
import importlib.util
from io import BytesIO
import json
from pathlib import Path
import struct
import sys

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA = 'a23b6b235f8cf765019b245209aa40c0f0d06287957d94c798f9e6a04f9149a2'
spec = importlib.util.spec_from_file_location('room_packer', ROOT/'tools/pack-supplied-rooms.py')
room_packer = importlib.util.module_from_spec(spec)
sys.dont_write_bytecode = True
spec.loader.exec_module(room_packer)


def pack(path):
    original = path.read_bytes()
    assert hashlib.sha256(original).hexdigest() == SOURCE_SHA, 'Use the supplied Morrissey Alexander home; the fit is specific to it'
    length = struct.unpack_from('<I', original, 12)[0]
    source = json.loads(original[20:20+length])
    binary = original[28+length:]
    result = {'asset': {**source['asset'], 'generator': 'Johansson Town Yuri home packer'},
              'scene': 0, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [],
              'materials': [], 'textures': [], 'images': [], 'samplers': copy.deepcopy(source['samplers']),
              'accessors': [], 'bufferViews': []}
    output = bytearray()

    def view(data, target=None):
        output.extend(b'\0'*(-len(output) % 4))
        record = {'buffer': 0, 'byteOffset': len(output), 'byteLength': len(data)}
        if target:
            record['target'] = target
        result['bufferViews'].append(record)
        output.extend(data)
        return len(result['bufferViews'])-1

    def read(index):
        a = source['accessors'][index]
        v = source['bufferViews'][a['bufferView']]
        dtype = np.dtype(room_packer.DTYPES[a['componentType']])
        width = room_packer.WIDTHS[a['type']]
        return np.ndarray((a['count'], width), dtype=dtype, buffer=binary,
                          offset=v.get('byteOffset', 0)+a.get('byteOffset', 0),
                          strides=(v.get('byteStride', width*dtype.itemsize), dtype.itemsize)).copy()

    images = []
    image_receipts = []
    for image in source['images']:
        v = source['bufferViews'][image['bufferView']]
        raw = binary[v.get('byteOffset', 0):v.get('byteOffset', 0)+v['byteLength']]
        images.append(Image.open(BytesIO(raw)))
        image_receipts.append({'sourceSHA256': hashlib.sha256(raw).hexdigest(), 'sourceSize': list(images[-1].size)})

    def texture(image, limit):
        im = image.convert('RGB')
        im.thumbnail((limit, limit), Image.Resampling.LANCZOS)
        stream = BytesIO()
        im.save(stream, format='JPEG', quality=88, subsampling=0, optimize=True)
        raw = stream.getvalue()
        result['images'].append({'bufferView': view(raw), 'mimeType': 'image/jpeg'})
        result['textures'].append({'source': len(result['images'])-1, 'sampler': source['textures'][0].get('sampler', 0)})
        return len(result['textures'])-1

    # Base colour stays sharp; packed MR and normals drop to 1024px.
    texture(images[0], 2048)
    texture(images[1], 1024)
    texture(images[2], 1024)
    material = copy.deepcopy(source['materials'][0])
    material['alphaMode'] = 'OPAQUE'
    material['doubleSided'] = False
    material['name'] = 'Yuri home PBR'
    result['materials'].append(material)

    # Source is centimetres, door on +X. Rotate so the door faces local +Z.
    scale = .01
    attrs = {k: read(v).astype('<f4') for k, v in source['meshes'][0]['primitives'][0]['attributes'].items() if k != 'TANGENT'}
    src_pos = attrs['POSITION']
    # (x, y, z) cm -> (-z, y, x) m so +X becomes +Z.
    pos = np.column_stack([-src_pos[:, 2]*scale, src_pos[:, 1]*scale, src_pos[:, 0]*scale]).astype('<f4')
    pos[:, 1] -= pos[:, 1].min()
    attrs['POSITION'] = pos
    if 'NORMAL' in attrs:
        n = attrs['NORMAL']
        attrs['NORMAL'] = np.column_stack([-n[:, 2], n[:, 1], n[:, 0]]).astype('<f4')
    indices = read(source['meshes'][0]['primitives'][0]['indices']).astype('<u4')

    def accessor(values, name):
        values = np.ascontiguousarray(values)
        a = {'bufferView': view(values.tobytes(), 34963 if name == 'indices' else 34962),
             'componentType': 5123 if name == 'indices' else 5126, 'count': len(values),
             'type': {1: 'SCALAR', 2: 'VEC2', 3: 'VEC3', 4: 'VEC4'}[values.shape[1]]}
        if name == 'POSITION':
            a.update(min=values.min(axis=0).tolist(), max=values.max(axis=0).tolist())
        result['accessors'].append(a)
        return len(result['accessors'])-1

    attributes = {k: accessor(attrs[k], k) for k in attrs}
    assert len(pos) < 65536
    result['meshes'].append({'primitives': [{'attributes': attributes, 'indices': accessor(indices.astype('<u2'), 'indices'), 'material': 0}]})
    result['nodes'].append({'name': 'Yuri canal house', 'mesh': 0})
    result['scenes'][0]['nodes'].append(0)
    result['buffers'] = [{'byteLength': len(output)}]
    header = json.dumps(result, separators=(',', ':')).encode()
    header += b' '*(-len(header) % 4)
    output.extend(b'\0'*(-len(output) % 4))
    packed = struct.pack('<III', 0x46546c67, 2, 28+len(header)+len(output)) + struct.pack('<II', len(header), 0x4e4f534a) + header + struct.pack('<II', len(output), 0x004e4942) + output

    # Door band on the +Z facade at human height.
    tri = pos[indices.reshape(-1, 3)].mean(axis=1)
    nrm = attrs['NORMAL'][indices.reshape(-1, 3)].mean(axis=1) if 'NORMAL' in attrs else np.zeros_like(tri)
    door = tri[(tri[:, 2] > tri[:, 2].max()-.9) & (tri[:, 1] > .25) & (tri[:, 1] < 2.4) & (nrm[:, 2] > .45)]
    door_centre = (door.mean(axis=0) if len(door) else np.array([0, 1.2, float(pos[:, 2].max())])).tolist()

    folder = ROOT/'assets/models/yuri-home'
    folder.mkdir(parents=True, exist_ok=True)
    destination = folder/'yuri-home-exterior.glb'
    destination.write_bytes(packed)
    manifest = {
        'file': destination.name,
        'sourceFile': path.name,
        'sourceSHA256': SOURCE_SHA,
        'sourceBytes': len(original),
        'sourceMetadata': source['asset']['extras'],
        'sha256': hashlib.sha256(packed).hexdigest(),
        'bytes': len(packed),
        'triangles': len(indices)//3,
        'draws': 1,
        'bounds': {'min': pos.min(axis=0).tolist(), 'max': pos.max(axis=0).tolist()},
        'fit': {'scale': scale, 'rotationY': -np.pi/2, 'doorCentre': door_centre},
        'changes': [
            'Baked the Sketchfab hierarchy into one mesh',
            'Converted centimetres to metres',
            'Rotated the east door to local +Z',
            'Grounded the floor at Y=0',
            'Re-encoded base colour at 2048px JPEG and PBR maps at 1024px',
            'Opaque front-facing materials for the lit canal street',
        ],
        'sourceImages': image_receipts,
    }
    (folder/'exterior-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print(json.dumps({k: manifest[k] for k in ['file', 'bytes', 'triangles', 'draws', 'bounds', 'fit']}, indent=2))


if __name__ == '__main__':
    pack(Path(sys.argv[1]))
