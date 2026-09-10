"""Prepare the supplied Inakaya pair for the east lane (NumPy and Pillow)."""
import copy, hashlib, importlib.util, io, json, struct, sys
from pathlib import Path
import numpy as np
from PIL import Image
spec=importlib.util.spec_from_file_location('rooms',Path(__file__).with_name('pack-supplied-rooms.py'))
rooms=importlib.util.module_from_spec(spec);spec.loader.exec_module(rooms)
source=Path(sys.argv[1]);original=source.read_bytes();length=struct.unpack_from('<I',original,12)[0]
j=json.loads(original[20:20+length]);binary=original[28+length:]
out=copy.deepcopy(j);out['asset']['generator']='Johansson Town Inakaya packer';out['bufferViews']=[];out['accessors']=[];out['nodes']=[];out['meshes']=[];out['scenes']=[{'nodes':[]}];out['scene']=0
payload=bytearray()
def view(data,target=None):
 payload.extend(b'\0'*(-len(payload)%4));v={'buffer':0,'byteOffset':len(payload),'byteLength':len(data)}
 if target:v['target']=target
 out['bufferViews'].append(v);payload.extend(data);return len(out['bufferViews'])-1
def acc(i):
 a=j['accessors'][i];v=j['bufferViews'][a['bufferView']];dt=np.dtype(rooms.DTYPES[a['componentType']]);w=rooms.WIDTHS[a['type']]
 return np.ndarray((a['count'],w),dtype=dt,buffer=binary,offset=v.get('byteOffset',0)+a.get('byteOffset',0),strides=(v.get('byteStride',w*dt.itemsize),dt.itemsize)).copy()
def writeacc(values,kind):
 values=np.ascontiguousarray(values);a={'bufferView':view(values.tobytes(),34963 if kind=='indices' else 34962),'componentType':5126 if values.dtype.kind=='f' else 5125,'count':len(values),'type':{1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4'}[values.shape[1]]}
 if kind=='POSITION':a.update(min=values.min(0).tolist(),max=values.max(0).tolist())
 out['accessors'].append(a);return len(out['accessors'])-1
textures=[]
for i,im in enumerate(j['images']):
 v=j['bufferViews'][im['bufferView']];image=Image.open(io.BytesIO(binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]))
 image.thumbnail((2048,2048) if i==0 else (1024,1024),Image.Resampling.LANCZOS);stream=io.BytesIO();alpha=i==3
 if alpha:image.save(stream,format='PNG',optimize=True)
 else:image.convert('RGB').save(stream,format='JPEG',quality=88,optimize=True)
 out['images'][i]={'bufferView':view(stream.getvalue()),'mimeType':'image/png' if alpha else 'image/jpeg'};textures.append(list(image.size))
parts=[];removed=0
fit=np.diag([.75,1,.8,1]);fit[2,3]=1

def visit(i,parent):
 global removed
 node=j['nodes'][i];world=parent@rooms.node_matrix(node)
 if 'mesh' in node:
  for pr in j['meshes'][node['mesh']]['primitives']:
   attrs={key:acc(ai) for key,ai in pr['attributes'].items()};ps=attrs['POSITION']@world[:3,:3].T+world[:3,3];ix=acc(pr['indices']).reshape(-1,3);tri=ps[ix]
   # Remove the source road, foreground poles and wires across the lane.
   keep=(tri[:,:,2].max(1)<=3.6)&(tri[:,:,1].max(1)>-.18);removed+=int((~keep).sum());ix=ix[keep]
   if not len(ix):continue
   used,inverse=np.unique(ix,return_inverse=True);attrs={k:v[used] for k,v in attrs.items()};matrix=fit@world;attrs['POSITION']=attrs['POSITION']@matrix[:3,:3].T+matrix[:3,3]
   for key in ['NORMAL','TANGENT']:
    if key in attrs:
     v=attrs[key][:,:3]@np.linalg.inv(matrix[:3,:3]);v/=np.maximum(np.linalg.norm(v,axis=1,keepdims=True),1e-10);attrs[key][:,:3]=v
   parts.append((attrs,inverse.astype('<u4').reshape(-1,1),pr['material']))
 for child in node.get('children',[]):visit(child,world)
for i in j['scenes'][j.get('scene',0)]['nodes']:visit(i,np.eye(4))
floor=min(a['POSITION'][:,1].min() for a,_,_ in parts);points=[];triangles=0
for i,(attrs,indices,material) in enumerate(parts):
 attrs['POSITION'][:,1]-=floor;points.append(attrs['POSITION']);triangles+=len(indices)//3
 primitive={'attributes':{k:writeacc(v.astype('<f4'),k) for k,v in attrs.items()},'indices':writeacc(indices,'indices'),'material':material}
 out['meshes'].append({'name':'Inakaya '+str(i),'primitives':[primitive]});out['nodes'].append({'name':'Inakaya '+str(i),'mesh':i});out['scenes'][0]['nodes'].append(i)
out['buffers']=[{'byteLength':len(payload)}];jb=json.dumps(out,separators=(',',':')).encode();jb+=b' '*(-len(jb)%4);payload+=b'\0'*(-len(payload)%4)
packed=struct.pack('<III',0x46546c67,2,28+len(jb)+len(payload))+struct.pack('<II',len(jb),0x4e4f534a)+jb+struct.pack('<II',len(payload),0x004e4942)+payload
folder=Path(__file__).resolve().parents[1]/'assets/models/ramen';(folder/'inakaya-exterior.glb').write_bytes(packed)
ps=np.concatenate(points);manifest={'file':'inakaya-exterior.glb','sourceFile':source.name,'sourceSHA256':hashlib.sha256(original).hexdigest(),'sourceMetadata':j['asset'].get('extras',{}),'sha256':hashlib.sha256(packed).hexdigest(),'sourceBytes':len(original),'bytes':len(packed),'triangles':triangles,'draws':len(parts),'removedTriangles':removed,'textures':textures,'bounds':{'min':ps.min(0).tolist(),'max':ps.max(0).tolist()},'fit':{'scale':[.75,1,.8],'translation':[0,float(-floor),1]},'changes':['Retained both adjoining buildings and their original materials','Removed foreground street geometry and poles','Compacted unused vertices and capped texture sizes; preserved alpha atlas','Fitted the east lane, facing +Z; grounded the geometry']}
(folder/'inakaya-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps(manifest,indent=2))
