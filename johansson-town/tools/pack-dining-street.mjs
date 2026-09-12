// node tools/pack-dining-street.mjs /path/to/japanese_street_at_night.glb
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {mergeGeometries,mergeVertices} from '../vendor/BufferGeometryUtils.js';
const input=process.argv[2];if(!input)throw Error('Pass Japanese street at night GLB');
const bytes=await readFile(input),source=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
const loaded=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');loaded.scene.updateMatrixWorld(true);
const batches=new Map(),footprints=new Map(),retained=[],removed=[];let sourceTriangles=0,triangles=0;
loaded.scene.traverse(o=>{
 if(!o.isMesh)return;const name=o.parent.name,g=o.geometry.clone().applyMatrix4(o.matrixWorld);sourceTriangles+=g.index.count/3;
 // The studio backdrop, closed terminal buildings and central pole would block
 // the connection to Minato and Inakaya. Their original facades finish this lane.
 if(/^BG_|^Build_[IJ]|^pole_/.test(name)){removed.push(name);return;}retained.push(name);
 for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);
 const id=loaded.parser.associations.get(o.material).materials;if(!batches.has(id))batches.set(id,[]);batches.get(id).push(g);triangles+=g.index.count/3;
 const key=name.match(/^Buil[td]_?([A-H])/)?.[1]||(/^ven_0[13]_/.test(name)?name:null);
 g.computeBoundingBox();const box=g.boundingBox;
 if(key&&box.min.y<1.85&&box.max.y>.14){if(!footprints.has(key))footprints.set(key,new THREE.Box3());footprints.get(key).union(box);}
});
const materialIds=[...batches.keys()],materials=materialIds.map(i=>structuredClone(source.materials[i])),textureIds=new Set();
for(const m of materials)for(const t of [m.pbrMetallicRoughness?.baseColorTexture,m.pbrMetallicRoughness?.metallicRoughnessTexture,m.normalTexture,m.occlusionTexture,m.emissiveTexture])if(t)textureIds.add(t.index);
const oldTextures=[...textureIds],imageIds=[...new Set(oldTextures.map(i=>source.textures[i].source))],textures=oldTextures.map(i=>({...source.textures[i],source:imageIds.indexOf(source.textures[i].source)}));
for(const m of materials)for(const t of [m.pbrMetallicRoughness?.baseColorTexture,m.pbrMetallicRoughness?.metallicRoughnessTexture,m.normalTexture,m.occlusionTexture,m.emissiveTexture])if(t)t.index=oldTextures.indexOf(t.index);
const folder=new URL('../assets/models/dining-street/',import.meta.url);await mkdir(folder,{recursive:true});const temporary=await mkdtemp(join(tmpdir(),'town-dining-'));
try{
 const result=spawnSync('python',['-c',`import sys,json,struct,io
from pathlib import Path
from PIL import Image
b=Path(sys.argv[1]).read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:];ids=json.loads(sys.argv[3]);colour=set();glow=set()
for m in d['materials']:
 t=m.get('pbrMetallicRoughness',{}).get('baseColorTexture');e=m.get('emissiveTexture')
 if t:colour.add(d['textures'][t['index']]['source'])
 if e:glow.add(d['textures'][e['index']]['source'])
for i in ids:
 v=d['bufferViews'][d['images'][i]['bufferView']];im=Image.open(io.BytesIO(binary[v.get('byteOffset',0):v.get('byteOffset',0)+v['byteLength']])).convert('RGB');size=768 if i in colour else 512 if i in glow else 256;im.thumbnail((size,size),Image.Resampling.LANCZOS);im.save(Path(sys.argv[2])/(str(i)+'.jpg'),quality=88 if i in colour or i in glow else 84,optimize=True)
`,input,temporary,JSON.stringify(imageIds)],{encoding:'utf8'});if(result.status)throw Error(result.stderr);
 const out={asset:{...source.asset,generator:'Johansson Town dining street packer'},extensionsUsed:source.extensionsUsed,scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials,textures,samplers:source.samplers,images:[],accessors:[],bufferViews:[],buffers:[]};
 const chunks=[];let length=0;
 function view(a){const b=Buffer.from(a.buffer,a.byteOffset,a.byteLength),i=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return i;}
 function attr(a,n,type=5126){const i=out.accessors.length,e={bufferView:view(a),componentType:type,count:a.length/n,type:n===1?'SCALAR':n===3?'VEC3':'VEC2'};if(n===3){e.min=[Infinity,Infinity,Infinity];e.max=[-Infinity,-Infinity,-Infinity];for(let j=0;j<a.length;j++){e.min[j%3]=Math.min(e.min[j%3],a[j]);e.max[j%3]=Math.max(e.max[j%3],a[j]);}}out.accessors.push(e);return i;}
 for(const id of imageIds)out.images.push({mimeType:'image/jpeg',bufferView:view(await readFile(join(temporary,id+'.jpg')))});
 for(const [id,pieces] of batches){const g=mergeVertices(mergeGeometries(pieces,false),1e-5),node=out.nodes.length,index=g.attributes.position.count<65536?new Uint16Array(g.index.array):new Uint32Array(g.index.array);out.nodes.push({name:'Dining street '+source.materials[id].name,mesh:node});out.scenes[0].nodes.push(node);out.meshes.push({primitives:[{attributes:{POSITION:attr(g.attributes.position.array,3),NORMAL:attr(g.attributes.normal.array,3),TEXCOORD_0:attr(g.attributes.uv.array,2)},indices:attr(index,1,index.BYTES_PER_ELEMENT===2?5123:5125),material:materialIds.indexOf(id)}]});}
 out.buffers=[{byteLength:length}];let json=Buffer.from(JSON.stringify(out));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+binary.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length);bh.writeUInt32LE(0x004e4942,4);const output=Buffer.concat([header,json,bh,binary]);await writeFile(new URL('night-lane.glb',folder),output);
 const boxes=[...footprints].map(([id,b])=>({id,min:b.min.toArray().map(v=>+v.toFixed(4)),max:b.max.toArray().map(v=>+v.toFixed(4))}));
 await writeFile(new URL('../src/world/dining-footprints.js',import.meta.url),'// Generated from pedestrian-height pieces by tools/pack-dining-street.mjs.\nexport const DINING_FOOTPRINTS='+JSON.stringify(boxes)+';\n');
 const manifest={source:source.asset.extras,sourceSha256:createHash('sha256').update(bytes).digest('hex'),sourceBytes:bytes.length,bytes:output.length,sourceTriangles,triangles,draws:out.meshes.length,buildingCount:8,textureCount:out.images.length,baseColourSize:768,emissiveSize:512,detailTextureSize:256,retained,removed,modifications:'Retained the eight approach shopfronts, lights, signs, vending machines and road. Removed studio backdrop, two terminal buildings and the central utility pole to open a connection to the existing restaurant facades. Baked transforms, merged static geometry by material, compacted identical vertices, and resized embedded JPEG textures. Original geometry and UVs of retained pieces are unchanged.'};
 await writeFile(new URL('manifest.json',folder),JSON.stringify(manifest,null,2)+'\n');console.log({bytes:output.length,triangles,draws:out.meshes.length,images:imageIds.length,footprints:boxes});
}finally{await rm(temporary,{recursive:true,force:true});}
