"""Pack the supplied merged Meshy model, retaining its mesh, rig and ten clips.

Usage: python tools/pack-merged-yuri.py source.glb
"""
import hashlib
import io
import json
import struct
import sys
from pathlib import Path
from PIL import Image

source = Path(sys.argv[1]).read_bytes()
assert struct.unpack_from('<III', source) == (0x46546C67, 2, len(source))
length = struct.unpack_from('<I', source, 12)[0]
gltf = json.loads(source[20:20 + length])
binary = source[28 + length:]
images = {image['bufferView']: image for image in gltf['images']}
packed = bytearray()
views = {}
for index, view in enumerate(gltf['bufferViews']):
    start = view.get('byteOffset', 0)
    data = binary[start:start + view['byteLength']]
    if index in images:
        image = Image.open(io.BytesIO(data)).convert('RGB')
        image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=90, subsampling=0, optimize=True)
        data = output.getvalue()
        images[index]['mimeType'] = 'image/jpeg'
    # Duplicate rest transforms and time channels share identical buffer bytes.
    if data not in views:
        packed.extend(b'\0' * (-len(packed) % 4))
        views[data] = len(packed)
        packed.extend(data)
    view['byteOffset'] = views[data]
    view['byteLength'] = len(data)
gltf['buffers'] = [{'byteLength': len(packed)}]
payload = json.dumps(gltf, separators=(',', ':')).encode()
payload += b' ' * (-len(payload) % 4)
packed.extend(b'\0' * (-len(packed) % 4))
result = (struct.pack('<III', 0x46546C67, 2, 28 + len(payload) + len(packed))
          + struct.pack('<II', len(payload), 0x4E4F534A) + payload
          + struct.pack('<II', len(packed), 0x004E4942) + packed)
folder = Path(__file__).resolve().parents[1] / 'assets/characters/yuri'
folder.mkdir(parents=True, exist_ok=True)
(folder / 'yuri-merged.glb').write_bytes(result)
report = {'source': 'Meshy_AI_Meshy_Merged_Animations.glb',
          'sourceSha256': hashlib.sha256(source).hexdigest(),
          'sha256': hashlib.sha256(result).hexdigest(),
          'sourceBytes': len(source), 'bytes': len(result),
          'triangles': sum(gltf['accessors'][p['indices']]['count'] // 3
                           for m in gltf['meshes'] for p in m['primitives']),
          'animations': [a['name'] for a in gltf['animations']],
          'notes': 'User-supplied Yuri replacement. Original geometry, skin, materials and all animation channels retained. Embedded maps resized to 1024 pixels; identical buffer payloads shared. No external dependencies.'}
(folder / 'provenance.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
