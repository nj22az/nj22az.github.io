// Rebuild the modular street kit from the user-supplied Japanese Town GLB.
// Node + Python/Pillow. Source authorship is retained in the exported asset.
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
const input=process.argv[2];if(!input)throw Error('Pass japanese_town.glb');
const bytes=await readFile(input),size=bytes.readUInt32LE(12),source=JSON.parse(bytes.subarray(20,20+size));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
const folder=new URL('../assets/models/japanese-town/',import.meta.url);await mkdir(folder,{recursive:true});
const compress=spawnSync('python',['-c',`import sys,json,struct,io
from pathlib import Path
from PIL import Image
b=Path(sys.argv[1]).read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:];folder=Path(sys.argv[2])
for name,ti in [('colour',3),('surface',4),('normal',5)]:
 v=d['bufferViews'][d['images'][d['textures'][ti]['source']]['bufferView']];im=Image.open(io.BytesIO(binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB');im.thumbnail((1024,1024));im.save(folder/(name+'.jpg'),quality=90,subsampling=0,optimize=True)
`,input,folder.pathname],{encoding:'utf8'});if(compress.status)throw Error(compress.stderr);
const out={asset:source.asset,scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[{name:'Japanese town timber, plaster and tile',doubleSided:true,pbrMetallicRoughness:{baseColorTexture:{index:0},metallicRoughnessTexture:{index:1},metallicFactor:0,roughnessFactor:1},normalTexture:{index:2,scale:.65},occlusionTexture:{index:1,strength:.65}}],images:[],textures:[{source:0},{source:1},{source:2}],accessors:[],bufferViews:[],buffers:[]};
const chunks=[];let length=0;
function view(a){const b=Buffer.from(a.buffer,a.byteOffset,a.byteLength),i=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return i;}
function attr(values,n){const a=new Float32Array(values),i=out.accessors.length,e={bufferView:view(a),componentType:5126,count:a.length/n,type:n===3?'VEC3':'VEC2'};if(n===3){e.min=[Infinity,Infinity,Infinity];e.max=[-Infinity,-Infinity,-Infinity];for(let j=0;j<a.length;j++){e.min[j%3]=Math.min(e.min[j%3],a[j]);e.max[j%3]=Math.max(e.max[j%3],a[j]);}}out.accessors.push(e);return i;}
for(const name of ['colour','surface','normal'])out.images.push({mimeType:'image/jpeg',bufferView:view(await readFile(new URL(name+'.jpg',folder)))});
const modules=[{name:'hipped',rect:[-13.6,-6.6,2.5,9.2],origin:[-10.12,2,3.9],angle:Math.PI,width:5.6,depth:4.5},{name:'gable',rect:[-10,-4,9.2,15.8],origin:[-4.88,2,12.33],angle:-Math.PI/2,width:5.5,depth:4.75}];
const manifest={source:source.asset.extras,modules:[],textureSize:1024};
for(const module of modules)for(const home of [false,true]){
 const p=[],n=[],uv=[],rotation=new T.Matrix4().makeRotationY(module.angle),normalRotation=new T.Matrix3().setFromMatrix4(rotation),bounds=new T.Box3();let pieces=0;
 gltf.scene.traverse(mesh=>{
  if(!mesh.isMesh||mesh.material.name!=='Atlas02'||! /^(Pared|Madera|Techo|Casa_4_Techo|Puerta|Lampara)/.test(mesh.name))return;
  bounds.setFromObject(mesh);const center=bounds.getCenter(new T.Vector3()),[x0,x1,z0,z1]=module.rect;
  if(center.x<x0||center.x>x1||center.z<z0||center.z>z1)return;
  // Exclude the neighbouring lean-to, and low projecting eaves on narrow homes.
  if(module.name==='hipped'&&center.x>-7.2&&!mesh.name.startsWith('Techo_low72'))return;
  if(home&&(/^Lampara/.test(mesh.name)||(/^Techo/.test(mesh.name)&&bounds.max.y<6)))return;
  const g=mesh.geometry,idx=g.index,normalMatrix=new T.Matrix3().getNormalMatrix(mesh.matrixWorld);pieces++;
  for(let i=0;i<(idx?.count||g.attributes.position.count);i++){
   const k=idx?idx.getX(i):i,v=new T.Vector3().fromBufferAttribute(g.attributes.position,k).applyMatrix4(mesh.matrixWorld).sub(new T.Vector3(...module.origin)).applyMatrix4(rotation);
   const norm=new T.Vector3().fromBufferAttribute(g.attributes.normal,k).applyNormalMatrix(normalMatrix).applyMatrix3(normalRotation);
   p.push(v.x,Math.max(0,v.y),v.z);n.push(norm.x,norm.y,norm.z);uv.push(g.attributes.uv.getX(k),g.attributes.uv.getY(k));
  }
 });
 const floor=Math.min(...p.filter((_,i)=>i%3===1));for(let i=1;i<p.length;i+=3)p[i]-=floor;
 const name=module.name+(home?'-home':'-shop'),i=out.meshes.length;out.meshes.push({primitives:[{attributes:{POSITION:attr(p,3),NORMAL:attr(n,3),TEXCOORD_0:attr(uv,2)},material:0}]});out.scenes[0].nodes.push(out.nodes.length);out.nodes.push({name,mesh:i,extras:{width:module.width,depth:module.depth}});manifest.modules.push({name,pieces,triangles:p.length/9,width:module.width,depth:module.depth});
}
out.buffers=[{byteLength:length}];let json=Buffer.from(JSON.stringify(out));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);
await writeFile(new URL('street-kit.glb',folder),Buffer.concat([header,json,bh,binary]));manifest.bytes=28+json.length+binary.length;await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest,null,2)+'\n');console.log(manifest);

for(const name of ["colour","surface","normal"])await unlink(new URL(name+".jpg",folder));
