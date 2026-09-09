// Derive a small, reproducible removal manifest without repacking the supplied GLB.
// Weld positions only to identify whole connected components: never cut a wall or
// floor triangle merely because it passes through a prop's collision volume.
import {readFile,writeFile} from 'node:fs/promises';
const folder=new URL('../assets/models/full-town/',import.meta.url);
const bytes=await readFile(new URL('overworld.glb',folder));
const size=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+size)),binary=bytes.subarray(28+size);
const nav=JSON.parse(await readFile(new URL('navigation.json',folder)));
function attribute(id){
 const a=gltf.accessors[id],v=gltf.bufferViews[a.bufferView],types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array};
 const Type=types[a.componentType],width={SCALAR:1,VEC2:2,VEC3:3}[a.type];
 if(!Type||!width||v.byteStride)throw Error('Unsupported clearance accessor');
 return new Type(binary.buffer,binary.byteOffset+(v.byteOffset||0)+(a.byteOffset||0),a.count*width);
}
const isDoor=c=>nav.doors.some(d=>Math.abs((d.min[0]+d.max[0])/2-c.x)<.06&&Math.abs((d.min[2]+d.max[2])/2-c.z)<.06);
const removedColliders=nav.colliders.flatMap((c,i)=>!isDoor(c)&&c.height<2&&Math.max(c.w,c.d)<2?[i]:[]);
const volumes=removedColliders.map(i=>{const c=nav.colliders[i];return {lo:[c.x-c.w/2-.025,c.minY-.025,c.z-c.d/2-.025],hi:[c.x+c.w/2+.025,c.height+.025,c.z+c.d/2+.025]};});
const meshes=gltf.meshes.map((mesh,meshIndex)=>{
 const primitive=mesh.primitives[0],p=attribute(primitive.attributes.POSITION),index=attribute(primitive.indices),n=p.length/3;
 const parent=Int32Array.from({length:n},(_,i)=>i),welded=new Map();
 function find(i){while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;}
 function join(a,b){a=find(a);b=find(b);if(a!==b)parent[b]=a;}
 for(let i=0;i<n;i++){const key=[0,1,2].map(k=>Math.round(p[i*3+k]*10000)).join(',');if(welded.has(key))join(i,welded.get(key));else welded.set(key,i);}
 for(let i=0;i<index.length;i+=3){join(index[i],index[i+1]);join(index[i],index[i+2]);}
 const components=new Map();
 for(let i=0;i<n;i++){const root=find(i);if(!components.has(root))components.set(root,{lo:[Infinity,Infinity,Infinity],hi:[-Infinity,-Infinity,-Infinity]});const b=components.get(root);for(let k=0;k<3;k++){b.lo[k]=Math.min(b.lo[k],p[i*3+k]);b.hi[k]=Math.max(b.hi[k],p[i*3+k]);}}
 const removed=new Set();for(const [id,b] of components){
  if(b.hi[1]-b.lo[1]<.015&&b.lo[1]<.12)continue; // retain ground/decal surfaces
  if(volumes.some(v=>b.lo.every((x,k)=>x>=v.lo[k])&&b.hi.every((x,k)=>x<=v.hi[k])))removed.add(id);
 }
 const ranges=[];let start=null;
 for(let t=0;t<=index.length/3;t++){const remove=t<index.length/3&&removed.has(find(index[t*3]));if(remove&&start===null)start=t;if(!remove&&start!==null){ranges.push([start,t-start]);start=null;}}
 return {mesh:meshIndex,name:gltf.nodes[meshIndex].name,indexCount:index.length,remove:ranges,removedTriangles:ranges.reduce((sum,[,count])=>sum+count,0)};
});
const result={version:1,sourceBytes:bytes.length,sourceColliders:nav.colliders.length,removedColliders,meshes};
await writeFile(new URL('street-clearance.json',folder),JSON.stringify(result)+'\n');
console.log(JSON.stringify({removedColliders:removedColliders.length,removedTriangles:meshes.reduce((sum,m)=>sum+m.removedTriangles,0)}));
