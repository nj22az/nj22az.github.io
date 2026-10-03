import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {circleHitsRect} from '../physics.js';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';

async function town(){
 installDOM();globalThis.self=globalThis;
 configureTownMode(TOWN_MODES.PENINSULA);
 const {createTown}=await import('../src/world/town.js?quarter');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const labels=[];
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses().filter(s=>['market','frontrow'].includes(s.id)),townMode:'peninsula',
  mobile:false,shadows:false,register:(o,label,fn)=>labels.push({label,fn,o}),enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 return {world,labels};
}

test('the residential quarter: lanes you can walk, every gate on a lane, a park, flats and a rubbish point',async()=>{
 const {world,labels}=await town();
 const {KITAHAMA,KITAHAMA_LANES,kitahamaLaneAt,plotGate}=await import('../src/world/kitahama-layout.js');
 const {groundHeight}=await import('../src/world/layout.js');
 const blocked=(x,z,r=.3)=>world.colliders.some(c=>circleHitsRect(x,z,r,c));
 // Ten to twelve homes and more: the five old plots, seven new ones and the flats.
 assert.ok(KITAHAMA.plots.length>=12);
 // Down the middle of every lane, nothing in the way, and the ground is the lane's.
 for(const L of KITAHAMA_LANES){
  const alongZ=L.maxZ-L.minZ>L.maxX-L.minX,mid=alongZ?(L.minX+L.maxX)/2:(L.minZ+L.maxZ)/2;
  // Well Lane ends at the rubbish point, which closes off its last metre and a half.
  const start=(alongZ?L.minZ:L.minX)+(L===KITAHAMA.wellLane?1.6:.6);
  for(let t=start;t<(alongZ?L.maxZ:L.maxX)-.6;t+=.8){
   // Somewhere across the lane there is room to walk past (a parked truck takes half).
   const across=[-.75,-.35,0,.35,.75].map(o=>alongZ?[mid+o,t]:[t,mid+o]);
   assert.ok(across.some(([x,z])=>!blocked(x,z,.25)),`lane blocked across at ${t.toFixed(1)}`);
   const [x,z]=alongZ?[mid,t]:[t,mid];
   assert.ok(Math.abs(groundHeight(x,z)-(KITAHAMA.y+.04))<.2,`lane ground at ${x.toFixed(1)},${z.toFixed(1)} is ${groundHeight(x,z)}`);
  }
 }
 // Every house's gate opens onto a lane, and the step outside it is clear.
 for(const p of KITAHAMA.plots){
  const {door}=plotGate(p);
  assert.ok(kitahamaLaneAt(door[0],door[1]),p.id+' gate opens onto a lane');
  assert.ok(!blocked(door[0],door[1],.3),p.id+' gate is clear');
 }
 // No plot overlaps another, or a lane.
 const over=(a,b)=>a.minX<b.maxX&&b.minX<a.maxX&&a.minZ<b.maxZ&&b.minZ<a.maxZ;
 const areas=[...KITAHAMA.plots,KITAHAMA.apartment,KITAHAMA.park];
 for(let i=0;i<areas.length;i++){for(let j=i+1;j<areas.length;j++)assert.ok(!over(areas[i],areas[j]),'overlap '+i+' '+j);for(const L of KITAHAMA_LANES)assert.ok(!over(areas[i],L),'on a lane: '+(areas[i].id||i));}
 // The shared places are there to use.
 for(const label of ['Read the Kitahama Heights mailboxes','Sit on the park bench','Push the swing','Read the Kitahama notice board','Read the Gushiken nameplate'])
  assert.ok(labels.some(l=>l.label===label),label);
 const bench=labels.find(l=>l.label==='Sit on the park bench').o.userData.seat;
 assert.ok(bench&&!blocked(bench.stand[0],bench.stand[2],.25),'the bench can be reached');
});

test('the anchored cast: everybody who walks has a home, a job, an evening, a day off and somewhere to go',async()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 const {anchoredCast,CAST_TIERS}=await import('../src/people/anchored-cast.js');
 const cast=anchoredCast();
 assert.ok(cast.some(c=>c.name==='Thuan'&&c.tier==='core'));
 for(const c of cast){
  assert.ok(c.tier,c.name+' has a tier');
  assert.ok(c.home.door.every(Number.isFinite)&&c.home.address,c.name+' has a home');
  assert.ok(c.work.at.every(Number.isFinite)&&c.work.until>c.work.from,c.name+' has a job and hours');
  assert.ok(c.evening.at.every(Number.isFinite),c.name+' has an evening');
  assert.ok(c.dayOff&&c.leisure?.length,c.name+' has a day off and a leisure place');
  assert.ok(c.bed>=c.work.until||c.bed>=1440||c.name==='Harbour master',c.name+' goes to bed after work');
 }
 // Fewer, anchored people: the walking cast stays small until the core is right.
 assert.ok(cast.length<=10);
 assert.deepEqual([...CAST_TIERS.core],['Johansson','Thuan']);
});
