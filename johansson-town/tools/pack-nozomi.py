"""Preserve Nozomi's skin and textures; combine the 57 pieces into four draws.

Usage: python tools/pack-nozomi.py supplied.glb output.glb
Then: node tools/animate-nozomi.mjs output.glb
"""
import copy, hashlib, json, re, struct, sys
from pathlib import Path
import numpy as np

source, destination = map(Path, sys.argv[1:3])
original = source.read_bytes()
length = struct.unpack_from('<I', original, 12)[0]
doc = json.loads(original[20:20+length]); binary = original[28+length:]
types = {5121: 'u1', 5123: '<u2', 5125: '<u4', 5126: '<f4'}
widths = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

def read(index):
    a = doc['accessors'][index]; v = doc['bufferViews'][a['bufferView']]
    dt = np.dtype(types[a['componentType']]); width = widths[a['type']]
    return np.ndarray((a['count'], width), dtype=dt, buffer=binary,
        offset=v.get('byteOffset', 0)+a.get('byteOffset', 0),
        strides=(v.get('byteStride', width*dt.itemsize), dt.itemsize)).copy()

out = copy.deepcopy(doc); out['accessors'] = []; out['bufferViews'] = []; out['meshes'] = []
out['asset']['generator'] = 'Johansson Town Nozomi packer'
out.pop('extensionsUsed', None); out.pop('extensionsRequired', None)
payload = bytearray()

def view(data):
    payload.extend(b'\0'*(-len(payload)%4))
    out['bufferViews'].append({'buffer': 0, 'byteOffset': len(payload), 'byteLength': len(data)})
    payload.extend(data); return len(out['bufferViews'])-1

def accessor(data, kind):
    data = np.ascontiguousarray(data)
    a = {'bufferView': view(data.tobytes()), 'componentType': 5126 if data.dtype.kind == 'f' else 5123 if data.dtype.itemsize == 2 else 5125,
         'count': len(data), 'type': kind}
    if kind == 'VEC3': a.update(min=data.min(0).tolist(), max=data.max(0).tolist())
    out['accessors'].append(a); return len(out['accessors'])-1

# The second skeleton is an unused FBX export artefact. Retain all weighted
# joints and their ancestors, including the rigid-piece helper joints.
parents = {child: i for i, n in enumerate(doc['nodes']) for child in n.get('children', [])}
skin = doc['skins'][0]; keep = {skin['skeleton']}
for mesh in doc['meshes']:
    for primitive in mesh['primitives']:
        attrs = primitive['attributes']; joints = read(attrs['JOINTS_0']); weights = read(attrs['WEIGHTS_0'])
        for old in np.unique(joints[weights > 0]):
            node = skin['joints'][int(old)]
            while node not in keep:
                keep.add(node)
                if node == skin['skeleton']: break
                node = parents[node]
indices = [i for i, node in enumerate(skin['joints']) if node in keep]
remap = np.zeros(len(skin['joints']), dtype='<u2')
for new, old in enumerate(indices): remap[old] = new
out['skins'] = [{**skin, 'joints': [skin['joints'][i] for i in indices],
    'inverseBindMatrices': accessor(read(skin['inverseBindMatrices'])[indices], 'MAT4')}]
for i, node in enumerate(out['nodes']):
    if i in keep:
        node['children'] = [child for child in node.get('children', []) if child in keep]
        match = re.fullmatch(r'mixamorig_(\w+?)_0\d+', node.get('name', ''))
        if match: node['name'] = match.group(1)
    node.pop('mesh', None); node.pop('skin', None)

for i, image in enumerate(doc['images']):
    v = doc['bufferViews'][image['bufferView']]; start = v.get('byteOffset', 0)
    out['images'][i] = {**image, 'bufferView': view(binary[start:start+v['byteLength']])}
for material in out['materials']:
    legacy = material.pop('extensions')['KHR_materials_pbrSpecularGlossiness']
    material['pbrMetallicRoughness'] = {'baseColorFactor': legacy['diffuseFactor'],
        'baseColorTexture': legacy['diffuseTexture'], 'metallicFactor': 0, 'roughnessFactor': .85}

parts = {}
for node in doc['nodes']:
    if 'mesh' not in node: continue
    assert node.get('skin') == 0 and not any(k in node for k in ['matrix', 'translation', 'rotation', 'scale'])
    for primitive in doc['meshes'][node['mesh']]['primitives']:
        attrs = {key: read(value) for key, value in primitive['attributes'].items()}
        attrs['JOINTS_0'] = remap[attrs['JOINTS_0']]
        parts.setdefault(primitive['material'], []).append((attrs, read(primitive['indices'])))

out['nodes'][4]['children'] = [skin['skeleton']]
triangles = 0
for material, pieces in parts.items():
    attrs = {key: [] for key in pieces[0][0]}; indices = []; count = 0
    for piece, ix in pieces:
        for key, value in piece.items(): attrs[key].append(value)
        indices.append(ix.astype('<u4')+count); count += len(piece['POSITION'])
    attrs = {key: np.concatenate(values) for key, values in attrs.items()}; ix = np.concatenate(indices)
    triangles += len(ix)//3
    primitive = {'attributes': {key: accessor(value, 'VEC'+str(value.shape[1])) for key, value in attrs.items()},
        'indices': accessor(ix, 'SCALAR'), 'material': material}
    out['meshes'].append({'name': 'Nozomi '+out['materials'][material]['name'], 'primitives': [primitive]})
    out['nodes'][4]['children'].append(len(out['nodes']))
    out['nodes'].append({'name': 'Nozomi '+out['materials'][material]['name'], 'mesh': len(out['meshes'])-1, 'skin': 0})

out['extras'] = {'identity': 'Nozomi model for Reiko', 'sourceSHA256': hashlib.sha256(original).hexdigest(),
    'sourceBytes': len(original), 'triangles': triangles, 'sourceDraws': len(doc['meshes']), 'draws': len(parts),
    'changes': ['Combined same-material skinned pieces', 'Removed unused second skeleton', 'Converted specular/glossiness textures to supported PBR materials', 'Original skin weights, UVs and embedded PNG textures preserved']}
out['buffers'] = [{'byteLength': len(payload)}]
encoded = json.dumps(out, separators=(',', ':')).encode(); encoded += b' '*(-len(encoded)%4); payload += b'\0'*(-len(payload)%4)
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_bytes(struct.pack('<III', 0x46546c67, 2, 28+len(encoded)+len(payload))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(payload),0x004e4942)+payload)
print(json.dumps({'bytes': destination.stat().st_size, 'triangles': triangles, 'draws': len(parts), 'joints': len(keep)}))
