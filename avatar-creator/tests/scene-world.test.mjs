import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../../johansson-town/vendor/three.module.js';
import {installDOM} from '../../johansson-town/tests/fixtures.mjs';
import {buildSceneWorld} from '../scene-world.js';
import {SNAP,resolveSnap,edgeLine} from '../scene-snap.mjs';
import {seatedPose} from '../scene-catalogue.mjs';
installDOM();
const originalFetch=globalThis.fetch;globalThis.fetch=async url=>String(url).startsWith('blob:')?originalFetch(url):new Response(fs.readFileSync(new URL('../../johansson-town/assets/'+new URL(String(url)).pathname.split('/assets/')[1],import.meta.url)));
let townData;
const views=JSON.parse(fs.readFileSync(new URL('../../johansson-town/assets/images/feed/views.json',import.meta.url)));
// The picture as an iPad in landscape shows it: about 693 CSS px wide.
const W=693,H=W*3/4;
const projector=camera=>(p,clip=true)=>{const v=new THREE.Vector3(...p).project(camera);if(v.z>1||v.z<-1)return null;const x=(v.x+1)/2*W,y=(1-v.y)/2*H;return clip&&(x<8||y<8||x>W-8||y>H-8)?null:{x,y};};
const random=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const keysOf=w=>w.seats.map(s=>s.id).join('|');
const firstKeys={};

for(const id of ['harbour','sakura','books','town-hall','park','garden','pier','sakura-street','rainflower','onsen','minato','sato-ramen'])test(id+' uses real world geometry, safe ground placement and snap targets',async()=>{
 const w=await buildSceneWorld(id,views,townData);townData=w.townData||townData;
 try{assert.ok(w.meshes.length>20);for(const mesh of w.meshes){let p=mesh;while(p){assert.ok(p.visible,'hidden town characters do not obstruct picking');p=p.parent;}}assert.ok(w.camera.isPerspectiveCamera);if(['minato','sato-ramen'].includes(id))assert.ok(w.scene.getObjectByName('Minato interior'),'shipped dining geometry loaded');const actors=Array.from({length:6},(_,i)=>({id:String(i),x:0,z:0,size:1,seat:'',turn:0,pose:'Idle'}));w.settle(actors);for(let i=0;i<actors.length;i++){const p=w.place(actors[i]);assert.equal(w.blocked(p.x,p.z),false);for(let j=0;j<i;j++){const q=w.place(actors[j]);assert.ok(Math.hypot(p.x-q.x,p.z-q.z)>=.459,'characters do not overlap');}}const a={id:'a',x:0,z:0,size:1,seat:''};const p=w.place(a);assert.ok(Number.isFinite(p.y));assert.equal(w.blocked(p.x,p.z),false);assert.ok(w.camera.position.toArray().every(Number.isFinite));if(id==='town-hall'){assert.ok(w.seats.length>0);a.seat=w.seats[0].id;const seat=w.place(a);assert.deepEqual([seat.x,seat.y,seat.z],w.seats[0].position);assert.ok(seat.seat.surfaceY>seat.y);}
  // Seats: one stable key each (World's id or the seat's place), and a scene saved with the old walk-order ids finds its seat.
  assert.equal(new Set(w.seats.map(s=>s.id)).size,w.seats.length,'seat keys are unique');
  for(const s of w.seats){assert.ok(!/^seat-\d+$/.test(s.id),s.id+' is not a walk-order id');assert.equal(s.turn,((180+(s.yaw||0)*180/Math.PI)%360+540)%360-180===-180?180:s.turn);}
  w.seats.forEach((s,i)=>{const old={id:'old',x:0,z:0,size:1,seat:'seat-'+i};const at=w.place(old);assert.equal(at.seat,s,'seat-'+i+' is still '+s.label);assert.equal(old.seat,s.id,'and is saved with its key');});
  if(['minato','town-hall','harbour'].includes(id)){if(firstKeys[id])assert.equal(keysOf(w),firstKeys[id]);else firstKeys[id]=keysOf(w);}
  const menu=w.seats.filter(s=>Math.hypot(s.position[0]-w.origin[0],s.position[2]-w.origin[2])<12),labels=menu.map(s=>s.label);assert.equal(new Set(labels).size,labels.length,'the furniture menu never says the same thing twice');
  if(id==='sakura'){
   for(const x of [4.54,5.06]){const e=w.edges.find(e=>Math.abs(e.a[0]-x)<.005&&Math.abs(e.b[0]-x)<.005&&Math.abs(Math.abs(e.b[1]-e.a[1])-3.78)<.005);assert.ok(e,'the till has a face at x '+x);
    const line=edgeLine(e,1);assert.ok(Math.abs(Math.abs(line.a[0]-x)-.26)<1e-6,'people stand 0.26 m from it');assert.equal(e.turn,x<4.8?90:-90);
    const free=w.free({id:'clerk',size:1},[]);assert.ok([0,.25,.5,.75,1].some(t=>free(line.a[0],line.a[1]+(line.b[1]-line.a[1])*t)),'someone can stand there');}
  }
  if(['minato','sato-ramen'].includes(id)){const free=w.free({id:'guest',size:1},[]);
   assert.ok(w.edges.some(e=>{const l=edgeLine(e,1);for(let t=0;t<=1;t+=.05)if(free(l.a[0]+(l.b[0]-l.a[0])*t,l.a[1]+(l.b[1]-l.a[1])*t))return true;return false;}),'a counter someone can stand at');}
  // Every seat the wide picture shows, and the camera sees, catches a finger put on it.
  const project=projector(w.camera),solo={id:'solo',x:0,z:0,size:1,seat:'',turn:0,pose:'Idle'},ctx=w.snapTargets(solo,[solo],{project,seated:seatedPose});
  for(const t of ctx.targets.filter(t=>t.kind==='seat'&&t.ok())){const r=resolveSnap({x:t.point[0],y:t.point[1],z:t.point[2]},{...ctx,project,capturePx:44,floor:w.floor});assert.equal(r?.key,t.id,t.label+' catches');}
  // 200 drags anywhere within ±8 m, with the five others in the scene: wherever they land is free, seen and level, and
  // nothing has to move afterwards.
  const next=random(id.length*7919),dragged=actors[0],start={...dragged};
  for(let k=0;k<200;k++){
   const want={x:w.origin[0]+(next()*16-8),z:w.origin[2]+(next()*16-8)};want.y=w.floor(want.x,want.z);if(!Number.isFinite(want.y))want.y=w.origin[1];
   Object.assign(dragged,start);const c=w.snapTargets(dragged,actors,{project,seated:seatedPose});
   const r=resolveSnap(want,{...c,project,capturePx:44,floor:w.floor});if(!r)continue;
   if(r.kind==='seat'){assert.ok(c.free.people(r.x,r.z),'a seat clear of everyone');w.put(dragged,{x:r.x,z:r.z,seat:r.seat.id});}
   else{assert.ok(c.free(r.x,r.z),r.kind+' landing is free and level');assert.ok(c.view(r.x,r.z),r.kind+' landing is seen');w.put(dragged,r);}
   const before=JSON.stringify(actors.map(a=>[a.x,a.z,a.seat]));w.settle(actors);assert.equal(JSON.stringify(actors.map(a=>[a.x,a.z,a.seat])),before,'settle moves no one after a '+r.kind+' drop');
  }
  Object.assign(dragged,start);
 }
 finally{w.dispose();}
});
for(const id of ['minato','town-hall'])test(id+' gives every seat the same key when it is built again',async()=>{const w=await buildSceneWorld(id,views,townData);try{assert.equal(keysOf(w),firstKeys[id]);}finally{w.dispose();}});
test('harbour gives every seat the same key when it is built again',async()=>{const w=await buildSceneWorld('harbour',views,townData);try{assert.equal(keysOf(w),firstKeys.harbour);}finally{w.dispose();}});
