// Usage: node tools/pack-sea-cave.mjs /absolute/path/to/umanosehorseback_sea_cave.glb
import {readFile,writeFile,mkdir,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {mergeGeometries,mergeVertices} from '../vendor/BufferGeometryUtils.js';
import {MeshoptSimplifier} from 'meshoptimizer';
const input=process.argv[2];if(!input)throw Error('Pass the supplied sea-cave GLB');
const bytes=await readFile(input),jsonLength=bytes.readUInt32LE(12),source=JSON.parse(bytes.subarray(20,20+jsonLength));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
const folder=new URL('../assets/models/sea-cave/',import.meta.url);await mkdir(folder,{recursive:true});
const compressed=spawnSync('python',['-c',`import sys,json,struct,io
from pathlib import Path
from PIL import Image
b=Path(sys.argv[1]).read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:]
for i,img in enumerate(d['images']):
 v=d['bufferViews'][img['bufferView']];im=Image.open(io.BytesIO(binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB');im.thumbnail((2048,2048),Image.Resampling.LANCZOS);im.save(Path(sys.argv[2])/(str(i)+'.jpg'),quality=88,optimize=True)
`,input,folder.pathname],{encoding:'utf8'});if(compressed.status)throw Error(compressed.stderr);
const batches=new Map();let sourceTriangles=0,sourceDraws=0;
gltf.scene.traverse(m=>{if(!m.isMesh)return;sourceDraws++;const id=gltf.parser.associations.get(m.material).materials;const g=m.geometry.clone().applyMatrix4(m.matrixWorld);sourceTriangles+=g.index.count/3;if(!batches.has(id))batches.set(id,[]);batches.get(id).push(g);});
await MeshoptSimplifier.ready;
const out={asset:{...source.asset,generator:'Johansson Town texture-aware sea cave packer'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:structuredClone(source.materials),textures:source.textures,samplers:source.samplers,images:[],accessors:[],bufferViews:[],buffers:[]};
// The original unlit scan would stay bright at night. Use the town lighting.
out.materials.forEach(m=>{delete m.extensions;m.doubleSided=true;m.pbrMetallicRoughness.metallicFactor=0;m.pbrMetallicRoughness.roughnessFactor=1;});
const chunks=[];let length=0;
function view(a){const b=Buffer.from(a.buffer,a.byteOffset,a.byteLength),i=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return i;}
function attr(a,n,type=5126){const i=out.accessors.length,e={bufferView:view(a),componentType:type,count:a.length/n,type:n===1?'SCALAR':n===3?'VEC3':'VEC2'};if(n===3){e.min=[Infinity,Infinity,Infinity];e.max=[-Infinity,-Infinity,-Infinity];for(let j=0;j<a.length;j++){e.min[j%3]=Math.min(e.min[j%3],a[j]);e.max[j%3]=Math.max(e.max[j%3],a[j]);}}out.accessors.push(e);return i;}
for(let i=0;i<source.images.length;i++){const path=new URL(i+'.jpg',folder);out.images.push({mimeType:'image/jpeg',bufferView:view(await readFile(path))});await unlink(path);}
const errors=[];let triangles=0;
for(const [material,pieces] of batches){
 const g=mergeVertices(mergeGeometries(pieces,false),1e-5),pos=g.attributes.position.array,uv=g.attributes.uv.array;
 const [indices,error]=MeshoptSimplifier.simplifyWithAttributes(new Uint32Array(g.index.array),pos,3,uv,2,[.1,.1],null,Math.floor(g.index.count*.065/3)*3,.003,['Permissive']);
 const [remap,count]=MeshoptSimplifier.compactMesh(indices);const arrays={};
 for(const [name,a] of Object.entries(g.attributes)){if(!['position','normal','uv'].includes(name))continue;const dest=new Float32Array(count*a.itemSize);for(let k=0;k<remap.length;k++)if(remap[k]!==0xffffffff)for(let j=0;j<a.itemSize;j++)dest[remap[k]*a.itemSize+j]=a.array[k*a.itemSize+j];arrays[name]=dest;}
 const id=out.meshes.length;out.nodes.push({name:'Umanose coastal rock '+material,mesh:id});out.scenes[0].nodes.push(id);out.meshes.push({primitives:[{attributes:{POSITION:attr(arrays.position,3),NORMAL:attr(arrays.normal,3),TEXCOORD_0:attr(arrays.uv,2)},indices:attr(indices,1,5125),material}]});triangles+=indices.length/3;errors.push(error);
}
out.buffers=[{byteLength:length}];let json=Buffer.from(JSON.stringify(out));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),h=Buffer.alloc(20),bh=Buffer.alloc(8);h.writeUInt32LE(0x46546c67);h.writeUInt32LE(2,4);h.writeUInt32LE(28+json.length+binary.length,8);h.writeUInt32LE(json.length,12);h.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);const output=Buffer.concat([h,json,bh,binary]);await writeFile(new URL('umanose.glb',folder),output);
const manifest={source:source.asset.extras,sourceDriveId:'1AIIH1Sry55ovfU_zo0lpG8UKicr12V16',sourceSha256:createHash('sha256').update(bytes).digest('hex'),sourceBytes:bytes.length,sourceTriangles,sourceDraws,bytes:output.length,triangles,draws:out.meshes.length,textureSize:2048,relativeErrors:errors,modifications:'Baked original transforms; texture-aware simplification; two 2K JPEG textures; lit rough rock materials. Complete scan retained.'};
await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest,null,2)+'\n');console.log(manifest);
