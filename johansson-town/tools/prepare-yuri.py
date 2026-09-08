"""Pack the user-supplied walking/running GLBs into one local character asset.
Usage: python tools/prepare-yuri.py /path/to/extracted/archive
"""
import copy, glob, io, json, struct, sys
from pathlib import Path
from PIL import Image

def read(path):
    b=Path(path).read_bytes(); n=struct.unpack_from('<I',b,12)[0]
    return json.loads(b[20:20+n]), b[28+n:]

folder=sys.argv[1]
j,b=read(glob.glob(folder+'/**/*Walking*.glb',recursive=True)[0])
r,rb=read(glob.glob(folder+'/**/*Running*.glb',recursive=True)[0])
assert [n.get('name') for n in j['nodes']]==[n.get('name') for n in r['nodes']]
# Keep one copy of the mesh and textures; the export contains duplicate clips.
j['animations']=j['animations'][:1]; j['animations'][0]['name']='Walk'
run=copy.deepcopy(r['animations'][0]);run['name']='Run'
for sampler in run['samplers']:
    for key in ('input','output'):
        a=copy.deepcopy(r['accessors'][sampler[key]])
        v=copy.deepcopy(r['bufferViews'][a['bufferView']]); start=v.get('byteOffset',0)
        b+=b'\0'*((-len(b))%4); v['byteOffset']=len(b);b+=rb[start:start+v['byteLength']]
        a['bufferView']=len(j['bufferViews']);j['bufferViews'].append(v)
        sampler[key]=len(j['accessors']);j['accessors'].append(a)
j['animations'].append(run)
# Compact texture payload for mobile; preserve colour, normal and roughness maps.
images={im['bufferView']:im for im in j['images']}; packed=bytearray()
for i,v in enumerate(j['bufferViews']):
    start=v.get('byteOffset',0);data=b[start:start+v['byteLength']]
    if i in images:
        im=Image.open(io.BytesIO(data));im.thumbnail((1024,1024));out=io.BytesIO();im.save(out,format='JPEG',quality=88);data=out.getvalue()
    packed.extend(b'\0'*((-len(packed))%4));v['byteOffset']=len(packed);v['byteLength']=len(data);packed.extend(data)
j['buffers']=[{'byteLength':len(packed)}]
payload=json.dumps(j,separators=(',',':')).encode();payload+=b' '*((-len(payload))%4);packed.extend(b'\0'*((-len(packed))%4))
out=struct.pack('<III',0x46546c67,2,28+len(payload)+len(packed))+struct.pack('<II',len(payload),0x4e4f534a)+payload+struct.pack('<II',len(packed),0x004e4942)+packed
path=Path(__file__).resolve().parents[1]/'assets/characters/realistic/yuri-playful.glb';path.write_bytes(out);print(path.name,len(out))
