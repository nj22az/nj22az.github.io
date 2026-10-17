import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {routeAt,groundHeight} from '../src/world/layout.js';
import {standingHitsRect} from '../physics.js';
import {createFerryShoreCrew} from '../src/people/ferry-shore-crew.js';
import {PORT_SHED} from '../src/world/port-shed.js';
import {FERRY_MOORINGS} from '../src/world/ferry.js';
installDOM();globalThis.self=globalThis;
const {createTown}=await import('../src/world/town.js');
const {createBusinesses}=await import('../src/world/businesses.js');
const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),mobile:false,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
const shed=world.portShed;world.group.updateMatrixWorld(true);shed.tick(0,600);
const attached=[];
const shore=createFerryShoreCrew({portShed:shed,shoreParent:world.group,shoreColliders:world.colliders,characters:{attach(g,name){attached.push(name);}},register(){},onAction(){}});
const position=g=>g.getWorldPosition(new THREE.Vector3());
const ownChair=c=>c.portShed&&Math.abs(c.x-PORT_SHED.chair[0])<.01&&Math.abs(c.z-PORT_SHED.chair[1])<.01;

function perform(port,line){
 const task={id:port+':'+line.id,post:'shore',station:'shore-'+port,action:'Handle '+line.name,seconds:2,target:line.shoreTarget};
 shore.update(.1,[task]);const b=shore.bodies.get(port);assert.ok(b);
 assert.equal(shore.taskReady(task.id),false,'travel cannot complete the task on assignment');
 let working=false,moved=false;
 for(let i=0;i<4000&&!shore.taskReady(task.id);i++){
  const p=position(b.g);shore.update(.2,[task]);const q=position(b.g);
  assert.ok(p.distanceTo(q)<.31,'bounded shore walking, including a normal ground step');moved||=p.distanceTo(q)>.005;
  assert.ok(routeAt(q.x,q.z,.18),'feet remain over actual shore');
  assert.ok(Math.abs(q.y-groundHeight(q.x,q.z))<.05,'feet follow the authored ground');
  assert.ok(!world.colliders.some(c=>!c.disabled&&c.walk!==false&&c.walkSolid!==false&&!ownChair(c)&&standingHitsRect(q.x,q.z,.18,q.y,c)),'shore hands clear the real built props at '+q.toArray());
  if(i%100===0&&port==='town'){
   const before=position(b.g);shed.tick(.01,600);assert.ok(position(b.g).distanceTo(before)<.001,'the TV routine yields while Fujita works the lines');
  }
  if(shore.taskAtStation(task.id)&&!shore.taskReady(task.id))working=true;
  if(b.blocked)assert.fail(port+': '+b.blocked+' '+JSON.stringify(shore.snapshot()));
 }
 assert.ok(moved,'the shore hand walked to the bitt');assert.ok(working,'arrival precedes completed line handling');
 assert.equal(shore.taskReady(task.id),true,JSON.stringify(shore.snapshot()));
 assert.equal(b.g.userData.socialPose,'Interact');
 return b;
}

test('the actual Mr Fujita walks to all four Minato bitts, works, and returns before his shed routine resumes',()=>{
 const actual=shed.fujita,home=position(actual);
 for(const line of FERRY_MOORINGS.town){const b=perform('town',line);assert.equal(b.g,actual);assert.equal(b.actor,shed.actor);}
 assert.ok(!attached.includes('Mr Fujita'),'no second Fujita avatar was created');
 for(let i=0;i<4000&&actual.userData.ferryShoreTask;i++)shore.update(.2,[]);
 assert.equal(actual.userData.ferryShoreTask,false,JSON.stringify(shore.snapshot()));
 assert.ok(position(actual).distanceTo(home)<.04,'returns to his established chair');
 shed.tick(.1,600);assert.equal(shed.routine.state,'watching');assert.ok(Number.isFinite(actual.userData.seatHeight));
});

test('Kitano has one job-role line hand who walks between its real pier bitts',()=>{
 for(const line of FERRY_MOORINGS.airport)perform('airport',line);
 assert.deepEqual(attached,['Kitano line hand']);
 assert.equal(shore.bodies.get('airport').g.parent,world.group);
 const snap=shore.snapshot().find(b=>b.where==='shore-airport');assert.equal(snap.existingResident,false);assert.equal(snap.space,'world');
});

test('a shore hand can acknowledge arrival but waits without a gesture or work credit for the ship hand',()=>{
 const line=FERRY_MOORINGS.town[0],task={id:'wait-for-ship',post:'shore',station:'shore-town',action:'Return the head line eye',seconds:2,target:line.shoreTarget};
 for(let i=0;i<4000&&!shore.taskAtStation(task.id);i++)shore.update(.2,[task],false);
 assert.equal(shore.taskAtStation(task.id),true,'arrival does not depend on permission to begin work');
 for(let i=0;i<15;i++)shore.update(.2,[task],false);
 assert.equal(shore.taskReady(task.id),false);assert.equal(shore.bodies.get('town').g.userData.socialPose,'Idle');
 assert.equal(shore.snapshot().find(b=>b.task===task.id).progress,0,'waiting longer than the work duration earns no work credit');
 shore.update(.1,[task],true);assert.equal(shore.bodies.get('town').g.userData.socialPose,'Interact');
 assert.equal(shore.taskReady(task.id),false);
 for(let i=0;i<20&&!shore.taskReady(task.id);i++)shore.update(.2,[task],true);
 assert.equal(shore.taskReady(task.id),true);
});
