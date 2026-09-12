"""Fit the owner-supplied Seinfeld apartment for Yuri's room.

Requires NumPy and Pillow. Usage:
  python tools/pack-yuri-apartment.py /path/to/seinfeld_apartment.glb
"""
import hashlib
import io
import json
import math
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE_SHA = '4242f8983d4b5c5445c2509760f491dd04315f6235497914eeaf81976027ccbf'
DTYPES = {5120: 'i1', 5121: 'u1', 5122: '<i2', 5123: '<u2', 5125: '<u4', 5126: '<f4'}
WIDTHS = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def node_matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix']).reshape(4, 4).T
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    result = np.eye(4)
    result[:3, :3] = [[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)],
                      [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)],
                      [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]]
    result[:3, :3] @= np.diag(node.get('scale', [1, 1, 1]))
    result[:3, 3] = node.get('translation', [0, 0, 0])
    return result


def resize_image(payload, mime):
    image = Image.open(io.BytesIO(payload))
    image = image.convert('RGB')
    longest = max(image.size)
    if longest > 1024:
        image = image.resize((round(image.width*1024/longest), round(image.height*1024/longest)), Image.Resampling.LANCZOS)
    out = io.BytesIO()
    image.save(out, format='JPEG', quality=80, optimize=True)
    return out.getvalue(), 'image/jpeg'


def floats(values):
    return [float(v) for v in np.asarray(values).reshape(-1)]


def pack(source):
    original = source.read_bytes()
    if hashlib.sha256(original).hexdigest() != SOURCE_SHA:
        raise ValueError('apartment: input differs from the supplied model')
    length = struct.unpack_from('<I', original, 12)[0]
    src = json.loads(original[20:20+length])
    binary = original[28+length:]

    def read_accessor(index):
        a = src['accessors'][index]
        v = src['bufferViews'][a['bufferView']]
        dtype = np.dtype(DTYPES[a['componentType']])
        width = WIDTHS[a['type']]
        return np.ndarray((a['count'], width), dtype=dtype, buffer=binary,
                          offset=v.get('byteOffset', 0)+a.get('byteOffset', 0),
                          strides=(v.get('byteStride', width*dtype.itemsize), dtype.itemsize)).copy()

    baked = []

    def collect(index, parent):
        node = src['nodes'][index]
        world = parent @ node_matrix(node)
        if 'mesh' in node:
            for primitive in src['meshes'][node['mesh']]['primitives']:
                if primitive.get('mode', 4) != 4:
                    continue
                attrs = {name: read_accessor(a).astype('<f4') for name, a in primitive['attributes'].items()}
                attrs['POSITION'] = (np.c_[attrs['POSITION'], np.ones(len(attrs['POSITION']))] @ world.T)[:, :3].astype('<f4')
                if 'NORMAL' in attrs:
                    normals = attrs['NORMAL'] @ np.linalg.inv(world[:3, :3])
                    attrs['NORMAL'] = (normals / np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)).astype('<f4')
                indices = read_accessor(primitive['indices']).astype('<u4').ravel()
                baked.append((attrs, indices, primitive['material'], src['meshes'][node['mesh']].get('name', '') or node.get('name', '')))
        for child in node.get('children', []):
            collect(child, world)

    for index in src['scenes'][src.get('scene', 0)]['nodes']:
        collect(index, np.eye(4))

    positions = np.concatenate([attrs['POSITION'] for attrs, _, _, _ in baked])
    lo, hi = positions.min(axis=0), positions.max(axis=0)
    scale = .65
    cx, cz = 0., 0.
    angle = 0.
    rot = np.array([[math.cos(angle), 0, math.sin(angle)], [0, 1, 0], [-math.sin(angle), 0, math.cos(angle)]])
    for attrs, _, _, _ in baked:
        shifted = attrs['POSITION'] - np.array([cx, 0., cz], dtype=np.float32)
        attrs['POSITION'] = ((shifted * scale) @ rot.T).astype('<f4')
        if 'NORMAL' in attrs:
            attrs['NORMAL'] = (attrs['NORMAL'] @ rot.T).astype('<f4')

    # Leave a comfortable route between the breakfast table and shelving.
    for attrs, _, _, name in baked:
        if name.startswith('table_'):
            attrs['POSITION'][:, 2] += .25

    furniture = {}
    for attrs, _, _, name in baked:
        key = name or 'unnamed'
        pos = attrs['POSITION']
        if key not in furniture:
            furniture[key] = {'min': pos.min(axis=0).copy(), 'max': pos.max(axis=0).copy()}
        else:
            furniture[key]['min'] = np.minimum(furniture[key]['min'], pos.min(axis=0))
            furniture[key]['max'] = np.maximum(furniture[key]['max'], pos.max(axis=0))
    furniture = {name: {'min': floats(box['min']), 'max': floats(box['max'])} for name, box in furniture.items()}

    result = {'asset': {**src.get('asset', {}), 'generator': 'Johansson Town apartment packer'},
              'scene': 0, 'scenes': [{'nodes': []}], 'nodes': [], 'meshes': [], 'materials': [],
              'accessors': [], 'bufferViews': [], 'images': [],
              'textures': [], 'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}],
              'extensionsUsed': ['KHR_materials_unlit']}
    output = bytearray()

    def view(data, target=None):
        output.extend(b'\0' * (-len(output) % 4))
        record = {'buffer': 0, 'byteOffset': len(output), 'byteLength': len(data)}
        if target:
            record['target'] = target
        result['bufferViews'].append(record)
        output.extend(data)
        return len(result['bufferViews'])-1

    def accessor(values, attribute):
        values = np.ascontiguousarray(values, dtype='<f4' if np.asarray(values).dtype.kind == 'f' else values.dtype)
        record = {'bufferView': view(values.tobytes(), 34963 if attribute == 'indices' else 34962),
                  'componentType': 5126 if values.dtype.kind == 'f' else (5123 if values.dtype.itemsize == 2 else 5125),
                  'count': len(values), 'type': {1: 'SCALAR', 2: 'VEC2', 3: 'VEC3', 4: 'VEC4'}[values.shape[1]]}
        if attribute == 'POSITION':
            record.update(min=floats(values.min(axis=0)), max=floats(values.max(axis=0)))
        result['accessors'].append(record)
        return len(result['accessors'])-1

    image_map = {}
    for i, image in enumerate(src.get('images', [])):
        v = src['bufferViews'][image['bufferView']]
        payload = binary[v.get('byteOffset', 0):v.get('byteOffset', 0)+v['byteLength']]
        payload, mime = resize_image(payload, image.get('mimeType', 'image/jpeg'))
        image_map[i] = len(result['images'])
        result['images'].append({'mimeType': mime, 'bufferView': view(payload)})

    for texture in src.get('textures', []):
        result['textures'].append({'sampler': 0, 'source': image_map.get(texture.get('source', 0), 0)})

    groups, seen, removed = {}, set(), 0
    for attrs, indices, material_index, mesh_name in baked:
        material = json.loads(json.dumps(src['materials'][material_index]))
        name = material.pop('name', mesh_name or 'bedroom')
        legacy = material.get('extensions', {}).get('KHR_materials_pbrSpecularGlossiness', {})
        if legacy:
            material['pbrMetallicRoughness'] = {'baseColorFactor': legacy.get('diffuseFactor', [1,1,1,1])}
            if 'diffuseTexture' in legacy:
                material['pbrMetallicRoughness']['baseColorTexture'] = legacy['diffuseTexture']
        material['extensions'] = {'KHR_materials_unlit': {}}
        material.pop('emissiveFactor', None)
        material.pop('emissiveTexture', None)
        pbr = material.setdefault('pbrMetallicRoughness', {})
        pbr['metallicFactor'] = 0
        pbr['roughnessFactor'] = 1
        if 'baseColorTexture' in pbr and 'index' in pbr['baseColorTexture']:
            pbr['baseColorTexture']['index'] = min(pbr['baseColorTexture']['index'], max(0, len(result['textures'])-1))
        material_key = json.dumps(material, sort_keys=True)
        digest = hashlib.sha256(material_key.encode())
        for attribute, values in sorted(attrs.items()):
            digest.update(attribute.encode())
            digest.update(np.round(values, 6).tobytes())
        digest.update(indices.tobytes())
        if digest.digest() in seen:
            removed += 1
            continue
        seen.add(digest.digest())
        key = (material_key, tuple(sorted(attrs)))
        if key not in groups:
            groups[key] = {'material': {**material, 'name': name}, 'attrs': [], 'indices': [], 'vertices': 0}
        group = groups[key]
        group['attrs'].append(attrs)
        group['indices'].append(indices + group['vertices'])
        group['vertices'] += len(attrs['POSITION'])

    packed_positions, triangles = [], 0
    for group in groups.values():
        attrs = {k: np.concatenate([a[k] for a in group['attrs']]) for k in group['attrs'][0]}
        indices = np.concatenate(group['indices']).astype('<u2' if group['vertices'] < 65536 else '<u4').reshape(-1, 1)
        packed_positions.append(attrs['POSITION'])
        triangles += len(indices) // 3
        result['materials'].append(group['material'])
        result['meshes'].append({'primitives': [{'attributes': {k: accessor(v, k) for k, v in attrs.items()},
                                                'indices': accessor(indices, 'indices'), 'material': len(result['materials'])-1}]})
        result['scenes'][0]['nodes'].append(len(result['nodes']))
        result['nodes'].append({'name': 'apartment:'+group['material']['name'], 'mesh': len(result['meshes'])-1})

    result['buffers'] = [{'byteLength': len(output)}]
    header = json.dumps(result, separators=(',', ':')).encode()
    header += b' ' * (-len(header) % 4)
    output.extend(b'\0' * (-len(output) % 4))
    packed = struct.pack('<III', 0x46546c67, 2, 28+len(header)+len(output)) + struct.pack('<II', len(header), 0x4e4f534a) + header + struct.pack('<II', len(output), 0x004e4942) + output
    folder = ROOT/'assets/models/yuri-home'
    folder.mkdir(parents=True, exist_ok=True)
    filename = 'seinfeld-apartment.glb'
    (folder/filename).write_bytes(packed)
    packed_positions = np.concatenate(packed_positions)
    manifest = {
        'file': filename, 'sourceFile': source.name, 'sourceSHA256': SOURCE_SHA,
        'sourceMetadata': src['asset'].get('extras', {}),
        'sha256': hashlib.sha256(packed).hexdigest(),
        'bytes': len(packed), 'triangles': int(triangles), 'draws': len(groups),
        'removedDuplicatePrimitives': removed,
        'bounds': {'min': floats(packed_positions.min(axis=0)), 'max': floats(packed_positions.max(axis=0))},
        'furniture': furniture,
        'fit': {'scale': scale, 'rotationY': float(angle), 'floorOffset': 0},
        'changes': [
            'Baked source hierarchy into vertices and centred the floor in metres',
            'Scaled the 3.33 source-unit front door to 2.16 metres',
            'Preserved apartment orientation and ground-floor elevation',
            'Downsampled embedded JPEG textures to 1024px',
            'Merged primitives sharing material and vertex attributes',
            'Unlit materials preserve baked lighting',
            'Moved the breakfast table 25 cm towards the sofa to clear the study passage',
        ],
    }
    (folder/'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
    print(json.dumps({k: manifest[k] for k in ['file', 'bytes', 'triangles', 'draws', 'removedDuplicatePrimitives', 'bounds', 'furniture']}, indent=2))


if __name__ == '__main__':
    pack(Path(sys.argv[1]))
