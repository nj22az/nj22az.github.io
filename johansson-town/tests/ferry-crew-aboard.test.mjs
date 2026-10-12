import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createFerryRun} from '../src/world/ferry.js';
import {createFerryWalk} from '../src/world/ferry-walk.js';
import {FERRY_WATCH,FERRY_CREW} from '../src/people/ferry-crew.js';
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
 for(const where of Object.keys(CREW_POSTS))assert.ok(Object.values(FERRY_WATCH).some(w=>Object.values(w).some(([at])=>at===where)),where+' is used by the watch');
});

test('alongside by day all four are aboard; at night only the chief, and the deck hand on her week on',()=>{
 const {run}=alongside();
 assert.equal(watchPhase(run,600),'waiting');assert.equal(watchPhase(run,23*60),'night');assert.equal(watchPhase(run,5*60),'night');
 assert.deepEqual(crewPlaces('waiting',600).map(c=>c.post),['master','chief','oiler','deck']);
 assert.deepEqual(crewPlaces('night',23*60).map(c=>c.post).sort(),['chief','deck']);
 assert.deepEqual(crewPlaces('crossing',700).map(c=>c.where),['wheelhouse','engine-room','engine-room','car-deck']);
});

test('the bodies ride with her and the bus driver’s town body is hidden while he is her master',()=>{
 const {run}=alongside();const attached=[];
 const town=new THREE.Group();town.visible=true;
 const crew=createFerryCrewAboard({run,characters:{attach:(g,name)=>attached.push(name)},register(){},onAction(){},townBody:name=>name==='Bus driver'?town:null});
 crew.update(1/60,600);
 assert.deepEqual(attached.sort(),FERRY_CREW.map(c=>c.name).sort());
 assert.equal(crew.snapshot().length,4);assert.equal(town.visible,false);assert.equal(town.userData.aboardFerry,true);
 const master=crew.bodies.get('Bus driver').g;assert.equal(master.parent,run.ferry,'a child of the ship');
 crew.update(1/60,23*60);
 assert.equal(crew.snapshot().length,2);assert.equal(town.userData.aboardFerry,false);
});
