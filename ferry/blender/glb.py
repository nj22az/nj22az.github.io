"""
A reader for a glTF binary file (.glb), with numpy only: what the yard needs to take a finished model aboard.

It reads the nodes with their names, parents and places, each node's triangles with the material they are drawn in, and
each material's colour and finish. No pictures, skins or animations: a model that carries them is read without them.

    doc = read(path)
    doc['nodes']       [dict(name, parent, world (4 x 4), mesh, extras)]
    doc['meshes']      [[dict(pos (n, 3), nor (n, 3) or None, idx (m, 3), material)]]      a mesh's primitives
    doc['materials']   [dict(name, colour (r, g, b, linear), metallic, roughness, emissive (r, g, b), strength, transmission)]

Positions are the file's own (glTF: x to the right, y up, z toward the one who looks at the front), in a node's own frame;
`placed(doc, node)` gives them in the model's frame.
"""
import json
import struct
import numpy as np

_TYPE = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
_SIZE = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def _matrix(node):
    if 'matrix' in node:
        return np.array(node['matrix'], dtype=np.float64).reshape(4, 4).T
    m = np.eye(4)
    if 'scale' in node:
        m[:3, :3] *= np.array(node['scale'], dtype=np.float64)
    if 'rotation' in node:
        x, y, z, w = node['rotation']
        r = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                      [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                      [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
        m[:3, :3] = r @ m[:3, :3]
    if 'translation' in node:
        m[:3, 3] = node['translation']
    return m


def read(path):
    with open(path, 'rb') as f:
        magic, version, _ = struct.unpack('<4sII', f.read(12))
        if magic != b'glTF' or version != 2:
            raise ValueError(f'{path}: not a glTF 2 binary file')
        n, kind = struct.unpack('<I4s', f.read(8))
        j = json.loads(f.read(n))
        n, kind = struct.unpack('<I4s', f.read(8))
        blob = f.read(n)

    def accessor(k):
        a = j['accessors'][k]
        v = j['bufferViews'][a['bufferView']]
        size, dtype = _SIZE[a['type']], np.dtype(_TYPE[a['componentType']])
        start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
        stride = v.get('byteStride') or dtype.itemsize * size
        if stride == dtype.itemsize * size:
            out = np.frombuffer(blob, dtype=dtype, count=a['count'] * size, offset=start)
        else:
            out = np.concatenate([np.frombuffer(blob, dtype=dtype, count=size, offset=start + i * stride) for i in range(a['count'])])
        return out.reshape(a['count'], size) if size > 1 else out

    meshes = []
    for m in j.get('meshes', []):
        prims = []
        for p in m['primitives']:
            if p.get('mode', 4) != 4:
                continue
            pos = accessor(p['attributes']['POSITION']).astype(np.float64)
            nor = accessor(p['attributes']['NORMAL']).astype(np.float64) if 'NORMAL' in p['attributes'] else None
            idx = accessor(p['indices']).astype(np.int64) if 'indices' in p else np.arange(len(pos))
            prims.append(dict(pos=pos, nor=nor, idx=idx.reshape(-1, 3), material=p.get('material')))
        meshes.append(prims)

    materials = []
    for m in j.get('materials', []):
        pbr, ext = m.get('pbrMetallicRoughness', {}), m.get('extensions', {})
        materials.append(dict(name=m.get('name', ''), colour=tuple(pbr.get('baseColorFactor', [1, 1, 1, 1])[:3]),
                              metallic=pbr.get('metallicFactor', 1.0), roughness=pbr.get('roughnessFactor', 1.0),
                              emissive=tuple(m.get('emissiveFactor', [0, 0, 0])),
                              strength=ext.get('KHR_materials_emissive_strength', {}).get('emissiveStrength', 1.0),
                              transmission=ext.get('KHR_materials_transmission', {}).get('transmissionFactor', 0.0)))

    nodes = [dict(name=n.get('name', ''), parent=None, local=_matrix(n), mesh=n.get('mesh'), extras=n.get('extras') or {},
                  children=n.get('children', [])) for n in j.get('nodes', [])]
    for i, n in enumerate(nodes):
        for c in n['children']:
            nodes[c]['parent'] = i

    def world(i):
        n = nodes[i]
        if 'world' not in n:
            n['world'] = n['local'] if n['parent'] is None else world(n['parent']) @ n['local']
        return n['world']

    for i in range(len(nodes)):
        world(i)
    return dict(nodes=nodes, meshes=meshes, materials=materials, by_name={n['name']: i for i, n in enumerate(nodes)})


def placed(doc, node):
    """The triangles of a node in the model's frame: a list of (positions, normals, corners, material)."""
    n = doc['nodes'][node] if isinstance(node, int) else doc['nodes'][doc['by_name'][node]]
    if n['mesh'] is None:
        return []
    w = n['world']
    r = np.linalg.inv(w[:3, :3]).T                      # normals turn with the inverse transpose
    out = []
    for p in doc['meshes'][n['mesh']]:
        pos = p['pos'] @ w[:3, :3].T + w[:3, 3]
        nor = None
        if p['nor'] is not None:
            nor = p['nor'] @ r.T
            nor /= np.maximum(np.linalg.norm(nor, axis=1, keepdims=True), 1e-12)
        idx = p['idx'] if np.linalg.det(w[:3, :3]) > 0 else p['idx'][:, ::-1]
        out.append((pos, nor, idx, p['material']))
    return out


def lineage(doc, node):
    """The names of a node's parents, nearest first."""
    out, i = [], doc['nodes'][node]['parent']
    while i is not None:
        out.append(doc['nodes'][i]['name'])
        i = doc['nodes'][i]['parent']
    return out
