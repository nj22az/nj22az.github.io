"""Extract the supplied Meshy block. Requires numpy, scipy and Pillow.

python tools/prepare-harbour-block.py SOURCE.glb TEMP_DIRECTORY
node tools/compact-harbour-block.mjs TEMP_DIRECTORY

The original remains in the user's Drive; intermediate geometry is not shipped.
"""
import hashlib
import io
import json
import struct
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components

source, destination = map(Path, sys.argv[1:3])
destination.mkdir(parents=True, exist_ok=True)
data = source.read_bytes()
assert struct.unpack_from('<4sI', data) == (b'glTF', 2)
json_size = struct.unpack_from('<I', data, 12)[0]
document = json.loads(data[20:20 + json_size])
binary_start = 28 + json_size


def accessor(index):
    a = document['accessors'][index]
    v = document['bufferViews'][a['bufferView']]
    dtype = np.dtype({5126: '<f4', 5125: '<u4', 5123: '<u2'}[a['componentType']])
    columns = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]
    return np.ndarray((a['count'], columns), dtype=dtype, buffer=data,
                      offset=binary_start + v.get('byteOffset', 0) + a.get('byteOffset', 0),
                      strides=(v.get('byteStride', dtype.itemsize * columns), dtype.itemsize)).copy()


primitive = document['meshes'][0]['primitives'][0]
positions = accessor(primitive['attributes']['POSITION'])
normals = accessor(primitive['attributes']['NORMAL'])
uvs = accessor(primitive['attributes']['TEXCOORD_0'])
indices = accessor(primitive['indices']).reshape(-1, 3)
centres = positions[indices].mean(axis=1)
# Measured footprint bounds, excluding the frontage poles and surrounding roads.
regions = [
    ('market', -.830, -.282, -.475, .112, .024, 25000),
    ('journal', -.277, .050, -.350, .132, .064, 40000),
    ('electronics', .053, .351, -.233, .126, .056, 20000),
    ('career', .343, .711, -.178, .239, .190, 25000),
]
report = {'source': source.name, 'sourceDriveId': '1n-K5OgB0sRO5Ve4Z82Uf-wP-nDythdoN',
          'sourceSha256': hashlib.sha256(data).hexdigest(), 'sourceBytes': len(data),
          'sourceTriangles': len(indices), 'metresPerSourceUnit': 20, 'buildings': []}

image_view = document['bufferViews'][document['images'][0]['bufferView']]
image_start = binary_start + image_view.get('byteOffset', 0)
colour = np.asarray(Image.open(io.BytesIO(data[image_start:image_start + image_view['byteLength']])).convert('RGB'))

for name, x0, x1, z0, z1, facade_z, target in regions:
    mask = ((centres[:, 0] > x0) & (centres[:, 0] < x1) &
            (centres[:, 2] > z0) & (centres[:, 2] < z1) & (centres[:, 1] > -.230))
    if name == 'market':
        # The rear tree touches the shop in the generated mesh. Remove its crown
        # above the parapet; all detached poles/branches are removed below.
        mask &= ~((centres[:, 0] < -.650) & (centres[:, 2] < -.250) & (centres[:, 1] > .012))
    if name in ('market', 'career'):
        # Fused leaves at two corners survive connected-component separation.
        # Classify only these measured tree regions, leaving shop glazing intact.
        candidates = np.flatnonzero(mask)
        tree_region = ((centres[candidates, 0] < -.640) & (centres[candidates, 2] < -.200)) if name == 'market' else ((centres[candidates, 0] > .675) & (centres[candidates, 2] > .100))
        candidates = candidates[tree_region]
        sample_uv = uvs[indices[candidates]].mean(axis=1)
        pixels = colour[np.clip((sample_uv[:, 1] * colour.shape[0]).astype(int), 0, colour.shape[0] - 1), np.clip((sample_uv[:, 0] * colour.shape[1]).astype(int), 0, colour.shape[1] - 1)].astype(float)
        leaf = (pixels[:, 1] > pixels[:, 0] * 1.06) & (pixels[:, 1] > pixels[:, 2] * 1.06)
        mask[candidates[leaf]] = False
    source_vertices, inverse = np.unique(indices[mask], return_inverse=True)
    p = positions[source_vertices]
    welded, weld = np.unique(p, axis=0, return_inverse=True)
    triangles = weld[inverse].reshape(-1, 3)
    edges = np.concatenate([triangles[:, :2], triangles[:, 1:], triangles[:, [2, 0]]])
    graph = coo_matrix((np.ones(len(edges), dtype=bool), (edges[:, 0], edges[:, 1])),
                       shape=(len(welded), len(welded))).tocsr()
    _, labels = connected_components(graph, directed=False)
    triangle_labels = labels[triangles[:, 0]]
    main = np.bincount(triangle_labels).argmax()
    selected = indices[mask][triangle_labels == main]
    used, remapped = np.unique(selected, return_inverse=True)
    p = positions[used].copy()
    vertex_normals = normals[used].copy()
    vertex_uvs = uvs[used].copy()
    if name == 'career':
        # The generated tree shares a small patch of the side wall. Seal behind
        # the trimmed foliage using the adjacent stone colour from this atlas.
        adjacent = np.linalg.norm(positions[used] - [.686, -.12, .075], axis=1)
        wall_uv = vertex_uvs[adjacent.argmin()]
        patch = np.array([[.678, -.14, .09], [.678, .01, .09],
                          [.678, .01, .21], [.678, -.14, .21]], dtype='<f4')
        remapped = np.concatenate([remapped.ravel(), np.array([0, 1, 2, 0, 2, 3]) + len(p)])
        p = np.concatenate([p, patch])
        vertex_normals = np.concatenate([vertex_normals, np.tile([1, 0, 0], (4, 1))])
        vertex_uvs = np.concatenate([vertex_uvs, np.tile(wall_uv, (4, 1))])
    # Consistent frame: front faces +Z, floor is Y=0, X is centred on the building.
    p[:, 0] -= (p[:, 0].min() + p[:, 0].max()) / 2
    p[:, 1] += .230
    # Use the actual ground-floor doorway plane, not the projecting roof/steps.
    # This keeps runtime signs and entry frames attached to the building.
    p[:, 2] -= facade_z
    p *= 20
    p.astype('<f4').tofile(destination / (name + '-positions.bin'))
    vertex_normals.astype('<f4').tofile(destination / (name + '-normals.bin'))
    vertex_uvs.astype('<f4').tofile(destination / (name + '-uvs.bin'))
    remapped.astype('<u4').tofile(destination / (name + '-indices.bin'))
    row = {'id': name, 'sourceTriangles': len(selected), 'targetTriangles': target,
           'bounds': {'min': p.min(axis=0).tolist(), 'max': p.max(axis=0).tolist()}}
    report['buildings'].append(row)
    print(json.dumps(row), flush=True)

# Keep the original 2048px image content; remove the oversized JPEG export encoding.
# All four buildings and their LODs share these three images, loaded once.
for image, name in zip(document['images'], ['colour', 'roughness-metallic', 'normal']):
    v = document['bufferViews'][image['bufferView']]
    start = binary_start + v.get('byteOffset', 0)
    im = Image.open(io.BytesIO(data[start:start + v['byteLength']])).convert('RGB')
    im.save(destination / (name + '.jpg'), quality=90 if name == 'normal' else 86,
            subsampling=0 if name == 'normal' else 2, optimize=True)
(destination / 'extraction.json').write_text(json.dumps(report, indent=2) + '\n')
