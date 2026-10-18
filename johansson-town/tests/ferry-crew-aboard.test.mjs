import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createFerryRun} from '../src/world/ferry.js';
import {createFerryWalk} from '../src/world/ferry-walk.js';
import {FERRY_WATCH,FERRY_CREW} from '../src/people/ferry-crew.js';
import {FERRY_MANNING} from '../src/world/ferry-ship.js';
import {crewPlaces,createFerryCrewAboard,watchPhase,CREW_POSTS} from '../src/people/ferry-crew-aboard.js';

function alongside(berth='town'){
 const parent=new THREE.Group(),colliders=[];
 const run=createFerryRun({parent,colliders});run.parkAt(berth);run.update(1/60,600,0);
 const walk=createFerryWalk(run);walk.update();
 return {run,walk};
}

test('every post of every phase stands on one of her floors, facing its work',()=>{
 const {run,walk}=alongside();run.ferry.updateMatrixWorld(true);
 for(const phase of Object.keys(FERRY_WATCH)){
  for(const c of crewPlaces(phase,0)){
   const p=new THREE.Vector3(...c.pos).applyMatrix4(run.ferry.matrixWorld),f=walk.floorAt(p.x,p.z,p.y,.3);
   assert.ok(f,`${phase}: ${c.name} at ${c.where} stands on a floor (${c.pos})`);
   assert.ok(Math.abs(f.y-p.y)<.3,`${phase}: ${c.name} at ${c.where} is at the floor's height`);
   assert.ok(!walk.blocked(p.x,f.y,p.z,.2),`${phase}: ${c.name} at ${c.where} is not inside a wall`);
  }
 }
 for(const [where,at] of Object.entries(CREW_POSTS)){
  const p=new THREE.Vector3(...at.pos).applyMatrix4(run.ferry.matrixWorld),f=walk.floorAt(p.x,p.z,p.y,.3);
  assert.ok(f&&!walk.blocked(p.x,f.y,p.z,.2),where+' is a usable watch or operation station');
 }
});

test('all eight declared posts are aboard by day; the established overnight residents remain aboard',()=>{
 const {run}=alongside();
 assert.equal(watchPhase(run,600),'waiting');assert.equal(watchPhase(run,23*60),'night');assert.equal(watchPhase(run,5*60),'night');
 assert.deepEqual(crewPlaces('waiting',600).map(c=>c.post),FERRY_MANNING.map(c=>c.post));
 assert.deepEqual(crewPlaces('night',23*60).map(c=>c.post).sort(),['bosun','chief']);
 for(const phase of ['waiting','arriving','crossing']){
  const places=crewPlaces(phase,700);assert.equal(places.length,8);
  for(let i=0;i<places.length;i++)for(let j=i+1;j<places.length;j++)assert.ok(new THREE.Vector3(...places[i].pos).distanceTo(new THREE.Vector3(...places[j].pos))>.4,phase+': distinct physical posts');
 }
});

test('the bodies ride with her and the bus driver’s town body is hidden while he is her master',()=>{
 const {run}=alongside();const attached=[];
 const town=new THREE.Group();town.visible=true;
 const crew=createFerryCrewAboard({run,characters:{attach:(g,name)=>attached.push(name)},register(){},onAction(){},townBody:name=>name==='Bus driver'?town:null});
 crew.update(1/60,600);
 assert.deepEqual(attached.sort(),FERRY_CREW.map(c=>c.name).sort());
 assert.equal(crew.snapshot().length,8);assert.equal(town.visible,false);assert.equal(town.userData.aboardFerry,true);
 const master=crew.bodies.get('Bus driver').g;assert.equal(master.parent,run.ferry,'a child of the ship');
 crew.update(1/60,23*60);
 assert.equal(crew.snapshot().length,2);assert.equal(town.userData.aboardFerry,false);
});


test('Johansson as player is never duplicated: Nakandakari keeps the day watch and returns ashore at night',()=>{
 const {run}=alongside(),shore=new THREE.Group();
 const crew=createFerryCrewAboard({run,playerIdentity:()=> 'Johansson',townBody:name=>name==='Mr Nakandakari'?shore:null,characters:{attach(){}},register(){},onAction(){}});
 crew.update(1/60,600);
 assert.equal(crew.snapshot().length,8);assert.ok(!crew.snapshot().some(p=>p.name==='Johansson'));
 assert.equal(crew.snapshot().find(p=>p.post==='chief').name,'Mr Nakandakari');assert.equal(shore.userData.aboardFerry,true);
 crew.update(1/60,1380);assert.equal(shore.userData.aboardFerry,false);
});
