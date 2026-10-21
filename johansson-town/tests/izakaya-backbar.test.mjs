import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {coplanarOverlaps} from '../tools/z-fighting.mjs';
import {FURNITURE_HEIGHTS} from '../src/world/furniture-standards.js';
import {SHARED_DINING_COLLIDERS} from '../src/world/interiors/shared-dining-layout.js';
import {IZAKAYA_PLAYER_SEATS} from '../src/people/izakaya-beer.js';

// Scan the actual exported furniture, in the room which uses it. A photo cannot catch
// every depth-buffer conflict: the owner's requirement is no flicker while moving,
// including the small bottle labels and the joins seen close up at a phone's size.
const NAMES=['Minato walnut back bar','Minato walnut counter'];
const FILES=['minato-walnut-backbar.glb','minato-walnut-counter.glb'];
const REGIONS=[
 {minX:-4.65,maxX:-1.10,minZ:-6.32,maxZ:-5.40,minY:.04,maxY:2.95},
 {minX:-5.05,maxX:3.45,minZ:-2.80,maxZ:-1.85,minY:.04,maxY:1.05},
];
const bytesByFile=new Map(),requests=[];
let room,display,api,models;
const bounds=o=>new THREE.Box3().setFromObject(o);
const scan=o=>coplanarOverlaps(o,{regions:REGIONS,tolerance:.002,minArea:.0005,keepIdentical:true});
const describe=f=>`${f.a} | ${f.b}: ${f.area.toFixed(5)} m², ${f.gap.toFixed(6)} m apart at ${f.at.join(', ')}`;
const down=(root,x,z,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,z),new THREE.Vector3(0,-1,0)).intersectObject(root,true)[0]?.point.y;

before(async()=>{
 installDOM();
 const previous={fetch:globalThis.fetch,self:globalThis.self,bitmap:globalThis.createImageBitmap};
 globalThis.self=globalThis;
 // Texture pixels are reviewed in the browser. Retain the loader's actual texture
 // objects/materials here, so the geometry scan still treats printed faces as such.
 globalThis.createImageBitmap=async()=>({width:2048,height:2048,close(){}});
 globalThis.fetch=async(input,options)=>{
  const url=new URL(typeof input==='string'?input:input.url);
  if(url.protocol==='blob:')return previous.fetch(input,options);
  assert.ok(url.pathname.startsWith('/johansson-town/assets/models/izakaya/'),'Unexpected fixture request '+url.href);
  const filename=url.pathname.split('/').at(-1);requests.push(filename);
  const bytes=await readFile(new URL('../assets/models/izakaya/'+filename,import.meta.url));bytesByFile.set(filename,bytes);
  return new Response(bytes,{headers:{'Content-Type':'model/gltf-binary'}});
 };
 try{
  api=await import('../src/world/izakaya.js');
  await api.preloadIzakaya(['interior']);
  assert.ok(api.izakayaReady('interior'),'The complete fitted interior must load');
  room=new THREE.Group();
  display=api.buildIzakayaRoom({room,
   box:(size,position,color,parent)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));mesh.position.set(...position);parent.add(mesh);return mesh;},
   reg(){},collider(){},action(){},exit(){},signTexture:()=>null});
  room.updateMatrixWorld(true);models=NAMES.map(name=>{const model=room.getObjectByName(name);assert.ok(model,name+' must be in the real room');return model;});
 }finally{globalThis.fetch=previous.fetch;globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
});
after(()=>{display?.dispose();display?.television?.dispose();});

test('both shared dining entrances clone one complete replacement from the same cached asset',async()=>{
 const other=new THREE.Group();assert.equal(api.addMinatoInterior(other),true);
 await api.preloadIzakaya(['interior']);
 assert.deepEqual(requests.sort(),['minato-interior-walnut.glb',...FILES].sort(),'All three pieces load once, before the interior is ready');
 for(const name of NAMES){
  let count=0;other.traverse(o=>{if(o.name===name)count++;});assert.equal(count,1,name+' is not duplicated on another entry');
  const clone=other.getObjectByName(name),original=room.getObjectByName(name);
  assert.notEqual(clone,original);assert.deepEqual(clone.position.toArray(),original.position.toArray());
  const firstMesh=o=>{let found;o.traverse(m=>{if(m.isMesh&&!found)found=m;});return found;};
  assert.equal(firstMesh(clone).geometry,firstMesh(original).geometry,'Repeated visits share immutable geometry');
 }
});

test('the runtime replacement keeps bounded geometry and opaque, front-sided finishes',()=>{
 let triangles=0,draws=0,totalBytes=0;
 for(let i=0;i<models.length;i++){
  const bytes=bytesByFile.get(FILES[i]);assert.ok(bytes,FILES[i]+' was loaded by the game');totalBytes+=bytes.length;
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
  assert.ok(!json.extensionsRequired?.length,'The standard GLTFLoader needs no optional decoder');
  let localDraws=0;
  models[i].traverse(o=>{if(!o.isMesh)return;
   const g=o.geometry;localDraws+=(g.groups.length||1);triangles+=(g.index?.count||g.attributes.position.count)/3;
   for(const [name,a] of Object.entries(g.attributes))assert.ok(a.array.every(Number.isFinite),o.name+' has finite '+name);
   if(g.index)assert.ok(g.index.array.every(k=>k<g.attributes.position.count),o.name+' has valid indices');
   for(const m of Array.isArray(o.material)?o.material:[o.material]){
    assert.equal(m.transparent,false,'Solid tinted glass avoids transparency sorting at '+o.name);
    assert.equal(m.opacity,1);assert.equal(m.side,THREE.FrontSide,'Closed cabinet and bottle surfaces have one visible side');
    assert.ok(!m.transmission,'No nested refractive shells');
    assert.ok(!m.polygonOffset,'Physical geometry resolves joins; no blanket depth offset');
    if(m.map)assert.equal(m.map.minFilter,THREE.LinearMipmapLinearFilter,'Fine labels and grain use mipmaps as the camera moves away');
   }
  });
  assert.ok(localDraws<=(i===0?10:6),FILES[i]+' draw budget: '+localDraws);draws+=localDraws;
 }
 assert.ok(triangles<=34000,'The two furniture assets use '+triangles+' triangles');
 assert.ok(draws<=16,'Fixed material batches bound the draw calls');
 assert.ok(totalBytes<=5*1024*1024,'The two runtime files use '+totalBytes+' bytes');
});

test('forty-two physical bottles carry the fourteen fictional brands recorded for Thao and Higa Liquor',()=>{
 const shelf=models[0],stock=shelf.getObjectByName('Backbar').userData,catalogue=api.MINATO_FICTIONAL_SPIRITS;
 assert.equal(stock.bottles.length,42);assert.equal(stock.brands.length,14);
 assert.equal(new Set(stock.bottles.map(b=>b.source)).size,42,'Each bottle has its own authored placement');
 assert.deepEqual([...new Set(stock.bottles.map(b=>b.brand))].sort(),catalogue.map(b=>b.name.toUpperCase()).sort());
 for(const brand of catalogue){assert.equal(brand.fictional,true);assert.equal(brand.owner,'Thao');assert.equal(brand.supplier,'Higa Liquor');assert.ok(brand.reason.length>20);}
 let bodies,labels;
 shelf.traverse(o=>{if(!o.isMesh)return;const parts=o.userData.mergedParts||[];
  if(parts.some(p=>p.where.endsWith('/ solid body and closure')))bodies=o;
  if(parts.some(p=>p.where.endsWith('/ integral paper faces')))labels=o;
 });
 assert.ok(bodies&&labels,'The data has both bottle and printed face geometry');
 for(const [mesh,suffix] of [[bodies,'solid body and closure'],[labels,'integral paper faces']]){
  const p=mesh.geometry.attributes.position,parts=mesh.userData.mergedParts;
  assert.equal(parts.length,42,'One physical '+suffix+' for each bottle');
  for(let i=0;i<parts.length;i++){
   const item=stock.bottles[i],start=parts[i].start,end=parts[i+1]?.start??p.count;
   assert.equal(parts[i].where,item.source+' / '+suffix);assert.ok(end>start);
   const b=new THREE.Box3();for(let k=start;k<end;k++)b.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,k));
   assert.ok(b.max.y>b.min.y+.05,'The named '+suffix+' is an actual three-dimensional bottle component');
   if(mesh===bodies){
    assert.ok(Math.abs(b.min.y-item.base_height)<.001,item.source+' base agrees with its authored position');
    const pos=new THREE.Vector3(...item.position).applyMatrix4(shelf.matrixWorld);
    const support=down(shelf,pos.x,pos.z,pos.y+.002);
    assert.ok(Math.abs(support-pos.y)<.002,item.source+' stands on its actual shelf');
   }
  }
 }
});

test('the new furniture stands on the floor, clears the back wall and fits the existing solids',()=>{
 const [shelf,counter]=models.map(bounds),solid=SHARED_DINING_COLLIDERS.find(c=>c.id==='minato-counter');
 assert.ok(Math.abs(shelf.min.y-.04)<.001,'Shelf feet meet the actual floorboards');
 assert.ok(Math.abs(counter.min.y-.04)<.001,'Counter plinth meets the actual floorboards');
 assert.ok(shelf.min.z>=-6.264,'Cabinet back clears the wainscot face by at least 6 mm');
 assert.ok(shelf.max.z<=-5.575,'Cabinet stays within the existing back-kitchen solid');
 assert.ok(shelf.min.x>=-4.60&&shelf.max.x<=-1.15,'The replacement fits the original cupboard bay');
 assert.ok(shelf.max.y<2.76,'Shelf cornice stays below the back-wall menu strips');
 assert.ok(counter.min.x>=solid.x-solid.w/2-.001&&counter.max.x<=solid.x+solid.w/2+.001,'Counter ends match the collision footprint');
 assert.ok(counter.min.z>=solid.z-solid.d/2-.001&&counter.max.z<=solid.z+solid.d/2+.001,'Counter and footrail fit inside the existing collision footprint');
 assert.ok(Math.abs(counter.max.y-FURNITURE_HEIGHTS.serviceCounter)<.001,'Counter retains the low serving height');
});

test('every counter drink and dish rests on the new slate at the unchanged serving height',()=>{
 const counter=models[1];
 for(const seat of Object.values(IZAKAYA_PLAYER_SEATS).filter(s=>s.counter))for(const [kind,point] of [['drink',seat.table],['dish',seat.dish]]){
  const [x,y,z]=point,actual=down(counter,x,z,y+.02);
  assert.ok(Number.isFinite(actual),seat.id+' '+kind+' has a real support surface');
  assert.ok(Math.abs(actual-y)<.001,seat.id+' '+kind+' must sit on the slate, at '+actual+' instead of '+y);
 }
 // The existing steel preparation surface remains separate and usable behind it.
 assert.ok(Math.abs(down(room,2.55,-3.06,.935)-.9175)<.001,'The kitchen worktop keeps its original height');
});

test('the old baked cupboard and counter bodies were removed rather than covered with new ones',()=>{
 const legacy=room.getObjectByName('Minato interior').clone(true);
 for(const name of NAMES)legacy.getObjectByName(name).removeFromParent();
 legacy.updateMatrixWorld(true);
 for(const [x,z] of [[-4.4,-2.2],[-3.25,-2.2],[-1.7,-2.2],[.1,-2.2],[1.5,-2.2],[2.8,-2.2],[-4,-5.85],[-3,-5.85],[-2,-5.85]]){
  const y=down(legacy,x,z,.77);
  assert.ok(Math.abs(y-.04)<.001,'Retired furniture still occupies '+[x,z]+' at '+y);
 }
 // The old five shelves and their bottles would intercept these rays before the
 // rear wall. The replacement is separate, so its absence reveals the bare bay.
 for(const x of [-4,-3,-2])for(const y of [.5,1.08,1.42,1.76,2.1,2.44]){
  const ray=new THREE.Raycaster(new THREE.Vector3(x,y,-5.5),new THREE.Vector3(0,0,-1));
  const hit=ray.intersectObject(legacy,true)[0];
  assert.ok(hit&&hit.point.z<=-6.25,'An old shelf or bottle remains at '+[x,y]+': '+hit?.point.z);
 }
});

test('the cabinet, labels, brasswork and counter contain no overlapping planes at phone viewing scale',()=>{
 const furniture=new THREE.Group();for(const model of models)furniture.add(model.clone(true));
 assert.deepEqual(scan(furniture).map(describe),[]);
});

test('the replacement shares no visible plane with the room, fitted props or runtime dressing',()=>{
 // Existing independent parts of the venue are covered by their own suites. This
 // check concerns every pair containing the new cabinet or counter, without hiding
 // any old mesh or excluding the small contact areas on its new surfaces.
 const concernsReplacement=f=>NAMES.some(name=>f.a.includes(name)||f.b.includes(name));
 assert.deepEqual(scan(room).filter(concernsReplacement).map(describe),[]);
});

test('the furniture scan detects an accidentally doubled counter finish',()=>{
 const group=new THREE.Group();group.add(models[1].clone(true));
 const sheet=new THREE.Mesh(new THREE.PlaneGeometry(1,.3).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xffffff}));
 sheet.name='Accidental extra counter finish';sheet.position.set(-.8,FURNITURE_HEIGHTS.serviceCounter+.0005,-2.2);group.add(sheet);
 assert.ok(scan(group).some(f=>(f.a+f.b).includes(sheet.name)&&f.area>.2),'A second surface half a millimetre above the slate must fail');
});
