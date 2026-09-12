// node tools/pack-residential-street.mjs /absolute/path/to/stylized_little_japanese_town_street.glb
// Keeps the complete supplied street; original UVs, colours and authorship survive packing.
import {readFile,writeFile,mkdir,rm,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import * as THREE from '../vendor/three.module.js';
import {MeshoptSimplifier} from 'meshoptimizer';
const input=process.argv[2];if(!input)throw Error('Pass the supplied residential street GLB');
const bytes=await readFile(input),source=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
const folder=new URL('../assets/models/residential-street/',import.meta.url);await mkdir(folder,{recursive:true});
const temporary=await mkdtemp(join(tmpdir(),'town-residential-'));
try{
 const result=spawnSync('python',['-c',`import sys,json,struct,io
from pathlib import Path
from PIL import Image
b=Path(sys.argv[1]).read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:]
colour={d['textures'][m['pbrMetallicRoughness']['baseColorTexture']['index']]['source'] for m in d['materials']}
for i,img in enumerate(d['images']):
 v=d['bufferViews'][img['bufferView']];im=Image.open(io.BytesIO(binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB');size=1024 if i in colour else 512;im.thumbnail((size,size),Image.Resampling.LANCZOS);im.save(Path(sys.argv[2])/(str(i)+'.jpg'),quality=87 if i in colour else 84,optimize=True)
`,input,temporary],{encoding:'utf8'});if(result.status)throw Error(result.stderr);
 await MeshoptSimplifier.ready;
 const out={asset:{...source.asset,generator:'Johansson Town residential street packer'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],extensionsUsed:['KHR_mesh_quantization'],extensionsRequired:['KHR_mesh_quantization'],materials:structuredClone(source.materials),textures:source.textures,samplers:source.samplers,images:[],accessors:[],bufferViews:[],buffers:[]};
 const chunks=[];let length=0,sourceTriangles=0,triangles=0;const modules=[],bridgeScene=new THREE.Group();
 function view(a){const b=Buffer.from(a.buffer,a.byteOffset,a.byteLength),i=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return i;}
 function attr(a,n,type=5126,normalized=false){const i=out.accessors.length,e={bufferView:view(a),componentType:type,count:a.length/n,type:n===1?'SCALAR':n===3?'VEC3':'VEC2'};if(n===3){e.min=[Infinity,Infinity,Infinity];e.max=[-Infinity,-Infinity,-Infinity];for(let j=0;j<a.length;j++){e.min[j%3]=Math.min(e.min[j%3],a[j]);e.max[j%3]=Math.max(e.max[j%3],a[j]);}}if(normalized)e.normalized=true;out.accessors.push(e);return i;}
 for(let i=0;i<source.images.length;i++)out.images.push({mimeType:'image/jpeg',bufferView:view(await readFile(join(temporary,i+'.jpg')))});
 gltf.scene.traverse(m=>{
  if(!m.isMesh)return;const g=m.geometry.clone().applyMatrix4(m.matrixWorld),p=g.attributes.position.array,uv=g.attributes.uv.array;
  // Source is centimetre scale. Metres and a flush pavement make the placement reproducible.
  for(let i=0;i<p.length;i++)p[i]=p[i]*.015+(i%3===1?.21:0);
  if(m.parent.name==='DomekRdy_Ziemia')bridgeScene.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})));
  const original=new Uint32Array(g.index.array);sourceTriangles+=original.length/3;
  const [indices,error]=original.length>300?MeshoptSimplifier.simplifyWithAttributes(original,p,3,uv,2,[.15,.15],null,Math.floor(original.length*.24/3)*3,.018,['ErrorAbsolute','Permissive']):[original,0];
  const [remap,count]=MeshoptSimplifier.compactMesh(indices),arrays={};
  for(const name of ['position','normal','uv']){const a=g.attributes[name],dest=new Float32Array(count*a.itemSize);for(let k=0;k<remap.length;k++)if(remap[k]!==0xffffffff)for(let j=0;j<a.itemSize;j++)dest[remap[k]*a.itemSize+j]=a.array[k*a.itemSize+j];arrays[name]=dest;}
  const id=out.meshes.length,material=gltf.parser.associations.get(m.material).materials,name=m.parent.name+(id===4?'-plants':'');
  const indexData=count<65536?new Uint16Array(indices):indices;
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let k=0;k<arrays.position.length;k++){min[k%3]=Math.min(min[k%3],arrays.position[k]);max[k%3]=Math.max(max[k%3],arrays.position[k]);}
  // Uniform decoding scale preserves normal directions. 16-bit positions retain sub-mm accuracy.
  const span=Math.max(...max.map((v,i)=>v-min[i])),positions=new Uint16Array(arrays.position.length),normals=new Int8Array(count*4);
  for(let k=0;k<positions.length;k++){positions[k]=Math.round((arrays.position[k]-min[k%3])/span*65535);normals[Math.floor(k/3)*4+k%3]=Math.round(Math.max(-1,Math.min(1,arrays.normal[k]))*127);}
  const normalView=view(normals);out.bufferViews[normalView].byteStride=4;const normalAccessor=out.accessors.length;out.accessors.push({bufferView:normalView,componentType:5120,count,type:'VEC3',normalized:true});
  // VEC3 unsigned shorts have a padded 8-byte stride, as required by glTF vertex alignment.
  const packedPositions=new Uint16Array(count*4);for(let k=0;k<positions.length;k++)packedPositions[Math.floor(k/3)*4+k%3]=positions[k];
  const positionView=view(packedPositions);out.bufferViews[positionView].byteStride=8;const positionAccessor=out.accessors.length;out.accessors.push({bufferView:positionView,componentType:5123,count,type:'VEC3',normalized:true,min:[0,0,0],max:max.map((v,i)=>Math.round((v-min[i])/span*65535))});
  const attributes={POSITION:positionAccessor,NORMAL:normalAccessor,TEXCOORD_0:attr(arrays.uv,2)};
  out.nodes.push({name,mesh:id,translation:min,scale:[span,span,span]});out.scenes[0].nodes.push(id);out.meshes.push({name,primitives:[{attributes,indices:attr(indexData,1,count<65536?5123:5125),material}]});triangles+=indices.length/3;
  modules.push({name,triangles:indices.length/3,vertices:count,errorMetres:error,min,max});
 });
 out.buffers=[{byteLength:length}];let json=Buffer.from(JSON.stringify(out));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);const output=Buffer.concat([header,json,bh,binary]);
 await writeFile(new URL('willow-street.glb',folder),output);
 const manifest={source:source.asset.extras,sourceSha256:createHash('sha256').update(bytes).digest('hex'),sourceBytes:bytes.length,sourceTriangles,bytes:output.length,triangles,draws:out.meshes.length,buildingCount:7,baseColourSize:1024,detailTextureSize:512,scale:.015,groundOffset:.21,modules,modifications:'Complete seven-building street retained. Baked transforms at 0.015 scale with ground offset 0.21 m; UV-aware simplification with maximum 0.018 m error; 1K colour and 512px PBR JPEG textures; quantised positions and normals. No external runtime decoder.'};
 // Sample the arched deck, bridging the small decorative gaps between its planks.
 bridgeScene.updateMatrixWorld(true);const ray=new THREE.Raycaster(),profile=[];
 for(let i=0;i<=68;i++){const z=-5.5+i*.1,hits=[];for(const x of [-.5,-.25,0]){ray.set(new THREE.Vector3(x,.9,z),new THREE.Vector3(0,-1,0));ray.far=1;const hit=ray.intersectObjects(bridgeScene.children,true)[0];if(hit&&hit.point.y>.1)hits.push(hit.point.y);}profile.push(hits.length?Math.max(...hits):null);}
 for(let i=0;i<profile.length;i++)if(profile[i]===null){let a=i-1,b=i+1;while(a>=0&&profile[a]===null)a--;while(b<profile.length&&profile[b]===null)b++;profile[i]=a>=0&&b<profile.length&&b-a<5?profile[a]+(profile[b]-profile[a])*(i-a)/(b-a):.02;}
 const surface={minZ:-5.5,step:.1,heights:profile.map(h=>+h.toFixed(3))};
 await writeFile(new URL('../src/world/residential-surface.js',import.meta.url),'// Generated by tools/pack-residential-street.mjs from the supplied bridge geometry.\nexport const RESIDENTIAL_BRIDGE='+JSON.stringify(surface)+';\n');
 await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
}finally{await rm(temporary,{recursive:true,force:true});}
