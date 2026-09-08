// npm ci; python tools/prepare-harbour-block.py SOURCE.glb TEMP; node tools/compact-harbour-block.mjs TEMP
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {MeshoptSimplifier,MeshoptEncoder} from 'meshoptimizer';

await Promise.all([MeshoptSimplifier.ready,MeshoptEncoder.ready]);
const input=resolve(process.argv[2]);
const output=new URL('../assets/models/harbour-block/',import.meta.url);
await mkdir(output,{recursive:true});
const report=JSON.parse(await readFile(input+'/extraction.json','utf8'));
const doc={asset:{version:'2.0',generator:'Johansson Town harbour block pipeline · meshoptimizer 1.2.0'},scene:0,
 scenes:[{nodes:[]}],nodes:[],meshes:[],accessors:[],bufferViews:[],buffers:[{byteLength:0}],
 images:['colour','roughness-metallic','normal'].map(name=>({uri:name+'.jpg'})),
 samplers:[{magFilter:9729,minFilter:9987,wrapS:33071,wrapT:33071}],
 textures:[0,1,2].map(source=>({source,sampler:0})),
 materials:[{name:'Shared harbour buildings',doubleSided:false,
  pbrMetallicRoughness:{baseColorTexture:{index:0},metallicRoughnessTexture:{index:1},roughnessFactor:1,metallicFactor:.15},
  normalTexture:{index:2,scale:.65}}]};
let byteLength=0;const buffers=[];
function addBuffer(array,target){
 const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),padding=(4-bytes.length%4)%4;
 const index=doc.bufferViews.length;doc.bufferViews.push({buffer:0,byteOffset:byteLength,byteLength:bytes.length,...(target?{target}:{})});
 buffers.push(bytes,Buffer.alloc(padding));byteLength+=bytes.length+padding;return index;
}
function addAccessor(array,size,type,componentType,extra={}){
 const index=doc.accessors.length;doc.accessors.push({bufferView:addBuffer(array,type==='SCALAR'?34963:34962),componentType,count:array.length/size,type,...extra});return index;
}
function bounds(positions){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<positions.length;i++){
 const k=i%3;min[k]=Math.min(min[k],positions[i]);max[k]=Math.max(max[k],positions[i]);}return {min,max};}
async function floats(id,attribute){const b=await readFile(input+'/'+id+'-'+attribute+'.bin');return new Float32Array(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
report.nearTriangles=0;report.farTriangles=0;
for(const building of report.buildings){
 const {id,targetTriangles}=building;
 const p=await floats(id,'positions'),n=await floats(id,'normals'),uv=await floats(id,'uvs');
 const data=await readFile(input+'/'+id+'-indices.bin');const sourceIndices=new Uint32Array(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength));
 const attributes=new Float32Array(p.length/3*5);for(let i=0;i<p.length/3;i++){attributes.set(n.subarray(i*3,i*3+3),i*5);attributes.set(uv.subarray(i*2,i*2+2),i*5+3);}
 building.levels=[];
 for(const [level,target,error] of [['near',targetTriangles,.045],['far',6000,.20]]){
  const [simplified,actualError]=MeshoptSimplifier.simplifyWithAttributes(sourceIndices,p,3,attributes,5,[.1,.1,.1,4,4],null,target*3,error,['ErrorAbsolute','Prune']);
  const [remap,count]=MeshoptEncoder.reorderMesh(simplified,true,false);
  const positions=new Float32Array(count*3),normals=new Float32Array(count*3),texcoords=new Uint16Array(count*2);
  for(let i=0;i<remap.length;i++)if(remap[i]!==0xffffffff){const j=remap[i];positions.set(p.subarray(i*3,i*3+3),j*3);normals.set(n.subarray(i*3,i*3+3),j*3);for(let k=0;k<2;k++)texcoords[j*2+k]=Math.round(Math.max(0,Math.min(1,uv[i*2+k]))*65535);}
  const indexData=count<=65535?new Uint16Array(simplified):simplified;
  const mesh=doc.meshes.length,name=id+'-'+level;
  doc.meshes.push({name,primitives:[{attributes:{POSITION:addAccessor(positions,3,'VEC3',5126,bounds(positions)),NORMAL:addAccessor(normals,3,'VEC3',5126),TEXCOORD_0:addAccessor(texcoords,2,'VEC2',5123,{normalized:true})},indices:addAccessor(indexData,1,'SCALAR',count<=65535?5123:5125),material:0}]});
  doc.scenes[0].nodes.push(doc.nodes.length);doc.nodes.push({name,mesh});
  const row={level,triangles:simplified.length/3,vertices:count,maxSimplifierErrorMetres:actualError};building.levels.push(row);report[level+'Triangles']+=row.triangles;console.log(id,JSON.stringify(row));
 }
}
doc.buffers[0].byteLength=byteLength;
const json=Buffer.from(JSON.stringify(doc)),jsonPadding=(4-json.length%4)%4,header=Buffer.alloc(20),binHeader=Buffer.alloc(8);
header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+jsonPadding+byteLength,8);header.writeUInt32LE(json.length+jsonPadding,12);header.writeUInt32LE(0x4e4f534a,16);binHeader.writeUInt32LE(byteLength);binHeader.writeUInt32LE(0x004e4942,4);
const glb=Buffer.concat([header,json,Buffer.alloc(jsonPadding,32),binHeader,...buffers]);
await writeFile(new URL('harbour-shops.glb',output),glb);
report.geometryBytes=glb.length;report.textureBytes=0;
for(const file of ['colour.jpg','roughness-metallic.jpg','normal.jpg']){await copyFile(input+'/'+file,new URL(file,output));report.textureBytes+=(await readFile(new URL(file,output))).length;}
report.downloadBytes=report.geometryBytes+report.textureBytes;
report.nearTriangleReduction=1-report.nearTriangles/report.sourceTriangles;
report.downloadReduction=1-report.downloadBytes/report.sourceBytes;
report.notes=['Four independent buildings; supplied ground, trees and poles removed.', 'Near/far geometry shares three original 2048px PBR textures; JPEG encoding reduced.', 'Geometry errors are simplifier bounds, not a GPU or visual-quality benchmark.'];
await writeFile(new URL('manifest.json',output),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({nearTriangles:report.nearTriangles,farTriangles:report.farTriangles,downloadBytes:report.downloadBytes}));
