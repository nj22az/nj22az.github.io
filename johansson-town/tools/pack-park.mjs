// Bake the supplied skinned diorama into a static, cropped park; retain CC-BY credit.
import {readFile,writeFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
const input=process.argv[2];if(!input)throw Error('Pass park_spring.glb');
const bytes=await readFile(input),jsonSize=bytes.readUInt32LE(12),source=JSON.parse(bytes.subarray(20,20+jsonSize)),bin=bytes.subarray(28+jsonSize);
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');gltf.scene.updateMatrixWorld(true);
const out={asset:source.asset,scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:source.materials,textures:source.textures,samplers:source.samplers,images:[],accessors:[],bufferViews:[],buffers:[],extensionsUsed:source.extensionsUsed?.filter(e=>!e.includes('lights'))};let length=0;const chunks=[];
function view(data){const b=Buffer.from(data.buffer,data.byteOffset,data.byteLength);const index=out.bufferViews.length;out.bufferViews.push({buffer:0,byteOffset:length,byteLength:b.length});chunks.push(b);length+=b.length;const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}return index;}
function attr(values,size){const a=new Float32Array(values),index=out.accessors.length,entry={bufferView:view(a),componentType:5126,count:a.length/size,type:size===3?'VEC3':'VEC2'};if(size===3){entry.min=[Infinity,Infinity,Infinity];entry.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.length;i++) {const k=i%3;entry.min[k]=Math.min(entry.min[k],a[i]);entry.max[k]=Math.max(entry.max[k],a[i]);}}out.accessors.push(entry);return index;}
for(const img of source.images){const v=source.bufferViews[img.bufferView];out.images.push({...img,bufferView:view(bin.subarray(v.byteOffset||0,(v.byteOffset||0)+v.byteLength))});}
const ground=[],batches=new Map();
function clip(poly,axis,edge,sign){const result=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a.p[axis]-edge)*sign,db=(b.p[axis]-edge)*sign;if(da>=0)result.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);result.push({p:a.p.map((v,k)=>v+(b.p[k]-v)*t),n:a.n.map((v,k)=>v+(b.n[k]-v)*t),uv:a.uv.map((v,k)=>v+(b.uv[k]-v)*t)});}}return result;}
gltf.scene.traverse(mesh=>{if(!mesh.isMesh)return;const name=mesh.material.name;
 if(/Sky|Shadow|LampLight|TreePlane00t1/.test(name))return;
 const bounds=new T.Box3().setFromObject(mesh,true);if(bounds.min.x>14||bounds.max.x< -14||bounds.min.z>14||bounds.max.z< -14)return;
 const geometry=mesh.geometry,position=geometry.attributes.position,normal=geometry.attributes.normal,uv=geometry.attributes.uv,index=geometry.index,mat=gltf.parser.associations.get(mesh.material).materials;mesh.skeleton?.update();
 if(!batches.has(mat))batches.set(mat,{p:[],n:[],uv:[]});const batch=batches.get(mat),normalMatrix=new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
 for(let i=0;i<(index?.count||position.count);i+=3){let poly=[];for(let j=0;j<3;j++){const k=index?index.getX(i+j):i+j,p=mesh.getVertexPosition(k,new T.Vector3()).applyMatrix4(mesh.matrixWorld),n=new T.Vector3().fromBufferAttribute(normal,k).applyNormalMatrix(normalMatrix);poly.push({p:p.toArray(),n:n.toArray(),uv:uv?[uv.getX(k),uv.getY(k)]:[0,0]});}
  for(const [axis,edge,sign] of [[0,-14,1],[0,14,-1],[2,-14,1],[2,14,-1]]){poly=clip(poly,axis,edge,sign);if(!poly.length)break;}
  for(let j=1;j<poly.length-1;j++){const tri=[poly[0],poly[j],poly[j+1]];for(const v of tri){batch.p.push(...v.p);batch.n.push(...v.n);batch.uv.push(...v.uv);}if(/mtParkGround0[0-3]t/.test(name))ground.push(tri.map(v=>v.p));}
 }
});
for(const [material,b] of batches){if(!b.p.length)continue;const mesh=out.meshes.length;out.meshes.push({primitives:[{attributes:{POSITION:attr(b.p,3),NORMAL:attr(b.n,3),TEXCOORD_0:attr(b.uv,2)},material}]});out.scenes[0].nodes.push(out.nodes.length);out.nodes.push({mesh,name:out.materials[material].name});}
function height(x,z){let h=-Infinity;for(const t of ground){const [a,b,c]=t,den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-8)continue;const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den;if(u>=-1e-5&&v>=-1e-5&&u+v<=1.00001)h=Math.max(h,u*a[1]+v*b[1]+(1-u-v)*c[1]);}return Number.isFinite(h)?Math.round(h*10000)/10000:0;}
const heights=[];for(let z=-14;z<=14;z+=.5)for(let x=-14;x<=14;x+=.5)heights.push(height(x,z));
await writeFile(new URL('../src/world/park-height.js',import.meta.url),'// Sampled from the supplied park ground, 0.5 m grid.\nexport const PARK_HEIGHTS='+JSON.stringify(heights)+';\n');
out.buffers=[{byteLength:length}];let j=Buffer.from(JSON.stringify(out));j=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);const b=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(28+j.length+b.length,8);header.writeUInt32LE(j.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(b.length,0);bh.writeUInt32LE(0x004e4942,4);
await writeFile(new URL('../assets/models/park/park-spring.glb',import.meta.url),Buffer.concat([header,j,bh,b]));console.log({draws:out.meshes.length,bytes:28+j.length+b.length,triangles:out.accessors.filter(a=>a.type==='VEC3').reduce((n,a)=>n+a.count,0)/6,benchGround:height(2.1,0),entry:height(-8,-14)});
