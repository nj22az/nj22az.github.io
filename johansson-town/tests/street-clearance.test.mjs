import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {applyStreetClearance} from '../src/world/street-clearance.js';
import {FULL_TOWN,CITY_SECTIONS,sourceHeight} from '../src/world/full-town-state.js';
import {drawTownMap} from '../src/world/map.js';
const folder=new URL('../assets/models/full-town/',import.meta.url);
const bytes=await readFile(new URL('overworld.glb',folder));
const navigation=JSON.parse(await readFile(new URL('navigation.json',folder)));
const manifest=JSON.parse(await readFile(new URL('street-clearance.json',folder)));
globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
const load=()=>new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');

test('Clearance removes whole props from rendering and physics while retaining source assets',async()=>{
 const {scene}=await load(),before=scene.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0);
 assert.equal(bytes.length,manifest.sourceBytes);assert.equal(before,96308);
 const cleaned=applyStreetClearance(scene,navigation,manifest);
 assert.equal(cleaned.removedColliders,40);assert.equal(cleaned.colliders.length,178);assert.equal(cleaned.removedTriangles,2532);
 assert.equal(scene.children.reduce((sum,m)=>sum+m.geometry.index.count/3,0),before-cleaned.removedTriangles);
 assert.equal(navigation.colliders.length,218,'Navigation source is immutable');
 for(const c of navigation.colliders)if(c.height>=2||Math.max(c.w,c.d)>=2)assert.ok(cleaned.colliders.includes(c),'Building walls and structure retained');
 for(const d of navigation.doors){const x=(d.min[0]+d.max[0])/2,z=(d.min[2]+d.max[2])/2;assert.ok(cleaned.colliders.some(c=>Math.abs(c.x-x)<.06&&Math.abs(c.z-z)<.06),'Original door retained: '+d.name);}
 for(const i of manifest.removedColliders)assert.ok(!cleaned.colliders.includes(navigation.colliders[i]),'No removed-prop collider survives');
 const leftover=[];scene.traverse(o=>{
  if(o.name!=='Atlas_03'||!o.isMesh)return;
  const g=o.geometry,p=g.attributes.position,idx=g.index,parent=Int32Array.from({length:p.count},(_,i)=>i);
  const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
  const join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};
  const welded=new Map();
  for(let i=0;i<idx.count;i++){
   const vi=idx.getX(i),k=[Math.round(p.getX(vi)*10000),Math.round(p.getY(vi)*10000),Math.round(p.getZ(vi)*10000)].join(',');
   if(welded.has(k))join(vi,welded.get(k));else welded.set(k,vi);
  }
  for(let i=0;i<idx.count;i+=3){join(idx.getX(i),idx.getX(i+1));join(idx.getX(i),idx.getX(i+2));}
  const box=new Map();
  for(let i=0;i<idx.count;i++){
   const vi=idx.getX(i),r=find(vi);if(!box.has(r))box.set(r,{lo:[Infinity,Infinity,Infinity],hi:[-Infinity,-Infinity,-Infinity]});
   const b=box.get(r),v=[p.getX(vi),p.getY(vi),p.getZ(vi)];for(let k=0;k<3;k++){b.lo[k]=Math.min(b.lo[k],v[k]);b.hi[k]=Math.max(b.hi[k],v[k]);}
  }
  for(const b of box.values()){const w=b.hi[0]-b.lo[0],h=b.hi[1]-b.lo[1],d=b.hi[2]-b.lo[2];if(b.lo[1]<.2&&h>=.55&&h<=1.1&&Math.min(w,d)>=.7&&Math.max(w,d)<=2.2)leftover.push(b);}
 });
 assert.equal(leftover.length,0,'Walking street has no remaining construction barricades');
});

test('Mismatched clearance manifests fail atomically without altering any geometry',async()=>{
 const {scene}=await load(),indices=scene.children.map(m=>m.geometry.index);
 const broken=structuredClone(manifest);broken.meshes.at(-1).name='wrong-source';
 assert.throws(()=>applyStreetClearance(scene,navigation,broken),/mismatch/);
 scene.children.forEach((m,i)=>assert.equal(m.geometry.index,indices[i]));
 const badRange=structuredClone(manifest);badRange.meshes[0].remove=[[999999,10]];
 assert.throws(()=>applyStreetClearance(scene,navigation,badRange),/Invalid/);
 scene.children.forEach((m,i)=>assert.equal(m.geometry.index,indices[i]));
});

test('The unique city keeps source heights and does not clone an east quarter',()=>{
 FULL_TOWN.grid=navigation.grid;
 for(const [x,z] of [[-18,0],[-5,-1],[0,0],[10,1],[17,0],[-5,-5]])assert.notEqual(sourceHeight(x,z),null);
 assert.equal(sourceHeight(0,-6),null);assert.equal(sourceHeight(44,-6),null);
 assert.equal(sourceHeight(44,0),null);assert.equal(sourceHeight(21,0),null,'No stretched source beyond the original east edge');
 assert.equal(CITY_SECTIONS.length,1);
});

test('Visitor map draws the unique city once',()=>{
 FULL_TOWN.active=true;FULL_TOWN.grid=navigation.grid;
 const ground=[],ctx=new Proxy({fillStyle:'',fillRect(x,y,w,h){if(this.fillStyle==='#a8997a')ground.push([x,y,w,h]);}},{get:(o,key)=>key in o?o[key]:(()=>{})});
 drawTownMap(ctx,680,640);
 const count=navigation.grid.heights.filter(h=>h!==null).length;
 assert.equal(ground.length,count);
 FULL_TOWN.active=false;
});
