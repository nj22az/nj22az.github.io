import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {RESIDENTS} from '../src/people/residents.js';
import {HOUSEHOLDS} from '../src/people/households.js';
import {createHomeResidents} from '../src/people/home-residents.js';
import {suppliedRoomBoundsBlocked,buildSuppliedRoom,preloadSuppliedRooms} from '../src/world/supplied-rooms.js';
import {circleHitsRect} from '../physics.js';
import {readSave,SAVE_KEY} from '../src/save.js';
const native=globalThis.fetch;
function localAssets(){installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});globalThis.fetch=async u=>String(u).startsWith('blob:')?native(u):new Response(await readFile(new URL('../assets/'+new URL(u).pathname.split('/assets/')[1],import.meta.url)));}
test('Thuan and Nao occupy separate beds in the same furnished flat, then leave independently',async()=>{
 localAssets();try{
  await preloadSuppliedRooms(['yuri-home']);const street=new THREE.Group(),room=new THREE.Group(),colliders=[];
  const site={...HOUSEHOLDS[0],homeOwners:['Thuan','Nao']};const layout=buildSuppliedRoom({site,room,reg(){},action(){},exit(){},collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height})});
  assert.ok(room.getObjectByName('Thuan bed'));assert.ok(room.getObjectByName('Nao bed'));
  const people=site.homeOwners.map(name=>{const profile=RESIDENTS.find(p=>p.name===name),g=new THREE.Group();g.position.set(profile.home[0],0,profile.home[1]);g.userData={name,hit:{inside:false},indoors:'home'};street.add(g);return {profile,g};}),world={people,homes:new Map()};
  const blocked=(x,z,r=.32)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
  const service=createHomeResidents({world,parent:room,collides:blocked});service.enter(site,440);
  assert.equal(people.length,2);assert.ok(people.every(p=>p.g.parent===room&&p.g.userData.sleeping));assert.ok(people[0].g.position.distanceTo(people[1].g.position)>2);
  let covers=0;room.traverse(o=>{if(o.userData.animatedCover)covers++;});assert.equal(covers,2);
  for(let n=0;n<1000;n++)service.update(.05,511);
  assert.equal(people[0].g.parent,street,'Thuan leaves for Sakura');assert.equal(people[1].g.parent,room,'Nao stays asleep after her late shift');assert.equal(people[1].g.userData.sleeping,true);
  service.restore();assert.ok(people.every(p=>p.g.parent===street));assert.equal(people[1].g.visible,false);assert.equal(people[1].g.userData.indoors,'home');
 }finally{globalThis.fetch=native;}
});
test('old flat IDs migrate without changing individual schedules or belongings',()=>{
 const saved={visited:['resident-home-nao','yuri-home','resident-home-reiko','resident-home-tetsuo'],residentLocations:{Nao:{indoors:'home',position:[-24,10]}},residentLife:{Nao:{yen:800}}};
 const result=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify(saved):null});assert.deepEqual(result.visited,['yuri-home','resident-home-aya','resident-home-kenji']);assert.deepEqual(result.residentLocations,saved.residentLocations);assert.deepEqual(result.residentLife,saved.residentLife);
});
