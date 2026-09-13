import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {RESIDENTS} from '../src/people/residents.js';
import {HOUSEHOLDS} from '../src/people/households.js';
import {createHomeResidents} from '../src/people/home-residents.js';
import {SUPPLIED_ROOM_LAYOUTS,suppliedRoomBoundsBlocked,buildSuppliedRoom,preloadSuppliedRooms} from '../src/world/supplied-rooms.js';
import {circleHitsRect} from '../physics.js';
import {readSave,SAVE_KEY} from '../src/save.js';
import {preloadCharacter,createLocalCharacters} from '../src/people/models.js';
import {OFFICE_DESK_SEAT} from '../src/world/interiors/office-workplace.js';
const native=globalThis.fetch;
function localAssets(){installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});globalThis.fetch=async u=>String(u).startsWith('blob:')?native(u):new Response(await readFile(new URL('../assets/'+new URL(u).pathname.split('/assets/')[1],import.meta.url)));}
test('Yuri and Nao occupy separate beds in the same furnished flat, then leave independently',async()=>{
 localAssets();try{
  await preloadSuppliedRooms(['yuri-home']);const street=new THREE.Group(),room=new THREE.Group(),colliders=[];
  const site={...HOUSEHOLDS[0],homeOwners:['Yuri','Nao']};const layout=buildSuppliedRoom({site,room,reg(){},action(){},exit(){},collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height})});
  assert.ok(room.getObjectByName('Yuri bed'));assert.ok(room.getObjectByName('Nao bed'));
  const people=site.homeOwners.map(name=>{const profile=RESIDENTS.find(p=>p.name===name),g=new THREE.Group();g.position.set(profile.home[0],0,profile.home[1]);g.userData={name,hit:{inside:false},indoors:'home'};street.add(g);return {profile,g};}),world={people,homes:new Map()};
  const blocked=(x,z,r=.32)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
  const service=createHomeResidents({world,parent:room,collides:blocked});service.enter(site,440);
  assert.equal(people.length,2);assert.ok(people.every(p=>p.g.parent===room&&p.g.userData.sleeping));assert.ok(people[0].g.position.distanceTo(people[1].g.position)>2);
  let covers=0;room.traverse(o=>{if(o.userData.animatedCover)covers++;});assert.equal(covers,2);
  for(let n=0;n<1000;n++)service.update(.05,511);
  assert.equal(people[0].g.parent,street,'Yuri leaves for Sakura');assert.equal(people[1].g.parent,room,'Nao stays asleep after her late shift');assert.equal(people[1].g.userData.sleeping,true);
  service.restore();assert.ok(people.every(p=>p.g.parent===street));assert.equal(people[1].g.visible,false);assert.equal(people[1].g.userData.indoors,'home');
 }finally{globalThis.fetch=native;}
});
test('old flat IDs migrate without changing individual schedules or belongings',()=>{
 const saved={visited:['resident-home-nao','yuri-home','resident-home-reiko','resident-home-tetsuo'],residentLocations:{Nao:{indoors:'home',position:[-24,10]}},residentLife:{Nao:{yen:800}}};
 const result=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify(saved):null});assert.deepEqual(result.visited,['yuri-home','resident-home-aya','resident-home-kenji']);assert.deepEqual(result.residentLocations,saved.residentLocations);assert.deepEqual(result.residentLife,saved.residentLife);
});
test('Yuri keeps her supplied appearance and typing wrists meet the fitted keyboard',async()=>{
 localAssets();try{
  await Promise.all(['Yuri','Harbour master'].map(preloadCharacter));const models=createLocalCharacters(),scene=new THREE.Scene();
  const y=new THREE.Group();y.userData.name='Yuri';scene.add(y);const yuri=models.attach(y,'Yuri',1.64);assert.equal(yuri.face,null);assert.equal(yuri.model.getObjectByName('resident-ribbon-apron-uniform'),undefined);
  const body=yuri.model.getObjectByName('output_unwrapped');assert.ok(body.isSkinnedMesh&&body.material.map);const neutral=body.geometry.attributes.position.array.slice();
  models.gesture(y);models.update(.1);assert.equal(yuri.current,'Wave');assert.deepEqual(body.geometry.attributes.position.array,neutral,'Keep the supplied face and body vertices');
  y.userData.sleepBlend=1;y.userData.socialPose='Sleep';models.update(.4);assert.equal(yuri.current,'Sleep');assert.equal(yuri.sleepEyes,null,'Do not fit the old low-poly eye plaques to the new face');
  const g=new THREE.Group();g.userData={name:'Harbour master',inWorkplace:'office',socialPose:'Type',seatHeight:.54};g.position.set(...OFFICE_DESK_SEAT.position);scene.add(g);const clerk=models.attach(g,'Harbour master',1.74);
  for(let n=0;n<40;n++)models.update(.025);scene.updateMatrixWorld(true);
  for(const side of ['L','R']){const wrist=clerk.model.getObjectByName('Wrist'+side).getWorldPosition(new THREE.Vector3());assert.ok(Math.abs(wrist.y-.948)<.006);assert.ok(Math.abs(wrist.z+2.31)<.005);assert.ok(Math.abs(wrist.x-(-2.52+(side==='L'?-.15:.15)))<.005);}
  assert.equal(models.actors.length,2);
 }finally{globalThis.fetch=native;}
});
