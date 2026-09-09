// Preserve the complete supplied scene, baking transforms and batching by material.
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {mergeVertices} from '../vendor/BufferGeometryUtils.js';
const input=process.argv[2];if(!input)throw Error('Pass japanese_town.glb');
const bytes=await readFile(input),size=bytes.readUInt32LE(12),source=JSON.parse(bytes.subarray(20,20+size));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
const folder=new URL('../assets/models/full-town/',import.meta.url);await mkdir(folder,{recursive:true});
const compress=spawnSync('python',['-c',`import sys,json,struct,io
from pathlib import Path
from PIL import Image
b=Path(sys.argv[1]).read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:];folder=Path(sys.argv[2])
for i,im in enumerate(d['images']):
 v=d['bufferViews'][im['bufferView']];a=Image.open(io.BytesIO(binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']]));a.thumbnail((1024,1024));a=a.convert('RGBA' if i==6 else 'RGB');a.save(folder/(str(i)+('.png' if i==6 else '.jpg')),**({'optimize':True} if i==6 else {'quality':88,'subsampling':0,'optimize':True}))
`,input,folder.pathname],{encoding:'utf8'});if(compress.status)throw Error(compress.stderr);
const out={asset:source.asset,scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:structuredClone(source.materials),textures:source.textures,samplers:source.samplers,images:[],accessors:[],bufferViews:[],buffers:[]};
out.materials.forEach(m=>{m.pbrMetallicRoughness.metallicFactor=0;if(m.alphaMode==='BLEND'){m.alphaMode='MASK';m.alphaCutoff=.4;}});
const chunks=[];let length=0;
function view(a){const b=Buffer.from(a.buffer,a.byteOffset,a.byteLength),i=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return i;}
function accessor(array,n,type=5126){const i=out.accessors.length,e={bufferView:view(array),componentType:type,count:array.length/n,type:n===1?'SCALAR':n===3?'VEC3':'VEC2'};if(n===3){e.min=[Infinity,Infinity,Infinity];e.max=[-Infinity,-Infinity,-Infinity];for(let j=0;j<array.length;j++){e.min[j%3]=Math.min(e.min[j%3],array[j]);e.max[j%3]=Math.max(e.max[j%3],array[j]);}}out.accessors.push(e);return i;}
for(let i=0;i<source.images.length;i++){const name=i+(i===6?'.png':'.jpg');out.images.push({mimeType:i===6?'image/png':'image/jpeg',bufferView:view(await readFile(new URL(name,folder)))});await unlink(new URL(name,folder));}
const floor=1.97839599,batches=new Map(),walk=[],colliders=[],doors=[];let triangles=0,pieces=0;
gltf.scene.traverse(mesh=>{if(!mesh.isMesh)return;pieces++;const id=gltf.parser.associations.get(mesh.material).materials;if(!batches.has(id))batches.set(id,{p:[],n:[],uv:[]});const b=batches.get(id),g=mesh.geometry,idx=g.index,nm=new T.Matrix3().getNormalMatrix(mesh.matrixWorld),box=new T.Box3().setFromObject(mesh),name=mesh.name;
 const ground=/^(Piso_|PisoRio_|Escaleras|Puente|Ruta|Ladrillo)/.test(name);
 if(/^(Pared|Puerta|Madera_Columna|Caja|Cajon|Maceta|Stop)/.test(name)&&box.min.y<floor+1.8&&box.max.y>floor+.25){const c=box.getCenter(new T.Vector3()),s=box.getSize(new T.Vector3());colliders.push({x:c.x,z:c.z,w:Math.max(.08,s.x),d:Math.max(.08,s.z),minY:box.min.y-floor,height:box.max.y-floor});}
 if(/^Puerta/.test(name))doors.push({name,min:box.min.toArray(),max:box.max.toArray()});
 for(let i=0;i<(idx?.count||g.attributes.position.count);i+=3){const tri=[];triangles++;for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j,p=new T.Vector3().fromBufferAttribute(g.attributes.position,k).applyMatrix4(mesh.matrixWorld);p.y-=floor;const n=new T.Vector3().fromBufferAttribute(g.attributes.normal,k).applyNormalMatrix(nm);b.p.push(p.x,p.y,p.z);b.n.push(n.x,n.y,n.z);b.uv.push(g.attributes.uv.getX(k),g.attributes.uv.getY(k));tri.push(p.toArray());}if(ground)walk.push(tri);}
});
for(const [material,b] of batches){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));const compact=mergeVertices(g,.00001),i=out.meshes.length;out.meshes.push({primitives:[{attributes:{POSITION:accessor(compact.attributes.position.array,3),NORMAL:accessor(compact.attributes.normal.array,3),TEXCOORD_0:accessor(compact.attributes.uv.array,2)},indices:accessor(new Uint32Array(compact.index.array),1,5125),material}]});out.scenes[0].nodes.push(i);out.nodes.push({name:source.materials[material].name,mesh:i});}
const grid={minX:-22,minZ:-14,step:.25,nx:169,nz:125,heights:Array(169*125).fill(null)};
for(const [a,b,c] of walk){const den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-8)continue;
 const ix0=Math.max(0,Math.ceil((Math.min(a[0],b[0],c[0])-grid.minX)/grid.step)),ix1=Math.min(grid.nx-1,Math.floor((Math.max(a[0],b[0],c[0])-grid.minX)/grid.step)),iz0=Math.max(0,Math.ceil((Math.min(a[2],b[2],c[2])-grid.minZ)/grid.step)),iz1=Math.min(grid.nz-1,Math.floor((Math.max(a[2],b[2],c[2])-grid.minZ)/grid.step));
 for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){const x=grid.minX+ix*grid.step,z=grid.minZ+iz*grid.step,u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den,w=1-u-v;if(u<-.0001||v<-.0001||w<-.0001)continue;const y=Math.round((a[1]*u+b[1]*v+c[1]*w)*10000)/10000,key=iz*grid.nx+ix;grid.heights[key]=Math.max(grid.heights[key]??-Infinity,y);}
}
await writeFile(new URL('navigation.json',folder),JSON.stringify({grid,colliders,doors}));
out.buffers=[{byteLength:length}];let json=Buffer.from(JSON.stringify(out));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);await writeFile(new URL('overworld.glb',folder),Buffer.concat([header,json,bh,binary]));
const manifest={source:source.asset.extras,pieces,triangles,draws:out.meshes.length,bytes:28+json.length+binary.length,floorOffset:floor,completeScene:true};await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest,null,2)+'\n');console.log(manifest);
