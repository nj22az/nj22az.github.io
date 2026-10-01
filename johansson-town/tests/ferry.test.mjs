import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createFerryRun,FERRY,FERRY_BERTH,FERRY_TERMINAL,FERRY_TIMES} from '../src/world/ferry.js';
import {HARBOUR_LINE,BUS_DWELL} from '../src/people/commuter-schedule.js';
import {OUTER_PIER,routeAt} from '../src/world/layout.js';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {transitStop} from '../src/world/transit.js';
import {BUS_STATION} from '../src/world/bus-station.js';
import {chooseOpening} from '../src/world/openings.js';
import {circleHitsRect} from '../physics.js';

const run=(from,to,step=1/10)=>{const colliders=[],ferry=createFerryRun({parent:new THREE.Group(),colliders});const seen=[];
 for(let m=from;m<to;m+=step){ferry.update(step,m,m);seen.push({m,phase:ferry.phase,x:ferry.ferry.position.x,z:ferry.ferry.position.z,visible:ferry.ferry.visible,yaw:ferry.ferry.rotation.y});}
 return {ferry,seen,colliders};};

test('the ferry lies alongside the pier for each sailing, boarded from the pier by its gangway',()=>{
 const {seen}=run(HARBOUR_LINE[0]-90,HARBOUR_LINE[0]+BUS_DWELL+80);
 const alongside=seen.filter(s=>s.phase==='waiting');
 assert.ok(alongside.length,'It never came alongside');
 assert.ok(alongside[0].m>=HARBOUR_LINE[0]-.5&&alongside[0].m<=HARBOUR_LINE[0]+1,'It is not alongside when the timetable says');
 const last=alongside.at(-1).m;assert.ok(Math.abs(last-(HARBOUR_LINE[0]+BUS_DWELL))<1,'It does not stand its fifteen minutes');
 for(const s of alongside){assert.ok(Math.abs(s.x-FERRY_BERTH.x)<.01&&Math.abs(s.z-FERRY_BERTH.z)<.01);}
 // Beside the pier, not in it: the hull stops short of the pier's west flank and the quay.
 assert.ok(FERRY_BERTH.x+FERRY.beam/2<OUTER_PIER.x-OUTER_PIER.width/2);
 assert.ok(FERRY_BERTH.z+FERRY.length/2< -50,'The bow runs into the quay wall');
 // The gangway's foot and the queue are on the pier's deck, where people can stand.
 const {ferry}=run(0,1);
 for(let i=0;i<4;i++){const [x,z]=ferry.queueSpot(i);assert.equal(routeAt(x,z,.3)?.id,'outer-pier','Queue place '+i+' is off the pier');}
 assert.deepEqual(ferry.door,[...FERRY_TERMINAL.queue]);
 // And it goes away again: out of sight between sailings.
 assert.ok(seen.filter(s=>s.m<HARBOUR_LINE[0]-FERRY_TIMES.arrive-1).every(s=>!s.visible));
 assert.ok(seen.at(-1).phase==='away'&&!seen.at(-1).visible,'It never left');
});

test('it comes in round the breakwater, never through it, and stays in open water',()=>{
 const {seen}=run(HARBOUR_LINE[1]-80,HARBOUR_LINE[1]+BUS_DWELL+80,1/20);
 for(const s of seen.filter(s=>s.visible)){
  // The breakwater: a 68 m wall across the harbour mouth at z -83.
  assert.ok(!(Math.abs(s.z+83)<2+FERRY.beam&&Math.abs(s.x)<34+FERRY.beam),'Through the breakwater at '+[s.x.toFixed(1),s.z.toFixed(1)]);
  // Never on the land or the quay.
  assert.ok(s.z< -50+.01||Math.abs(s.x-FERRY_BERTH.x)<.01,'Onto the quay at '+[s.x,s.z]);
 }
 // It turns before it sails away, rather than steaming out backwards or flipping round.
 const yaws=seen.filter(s=>s.visible).map(s=>s.yaw);
 for(let i=1;i<yaws.length;i++){let d=Math.abs(yaws[i]-yaws[i-1]);d=Math.min(d,Math.PI*2-d);assert.ok(d<.35,'It spun on the spot at step '+i);}
});

test('the ferry has a solid hull only while it is alongside',()=>{
 const {ferry,colliders}=run(HARBOUR_LINE[0]-FERRY_TIMES.arrive-5,HARBOUR_LINE[0]+2);
 const hull=colliders.find(c=>c.id==='ferry');
 assert.equal(ferry.phase,'waiting');assert.ok(circleHitsRect(FERRY_BERTH.x,FERRY_BERTH.z,.3,hull));
 for(let m=HARBOUR_LINE[0]+2;m<HARBOUR_LINE[0]+BUS_DWELL+15;m+=.1)ferry.update(.1,m,m);
 assert.notEqual(ferry.phase,'waiting');assert.ok(!circleHitsRect(FERRY_BERTH.x,FERRY_BERTH.z,.3,hull));
});

test('on the island the stop is the ferry terminal and the game can start off the ferry',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 try{
  assert.equal(transitStop(),FERRY_TERMINAL);
  assert.equal(chooseOpening({minutes:600,force:'ferry',storage:null}).id,'ferry');
  assert.equal(chooseOpening({minutes:600,force:'bus-stop',storage:null}).id,'ferry','Old links to the bus stop go nowhere');
 }finally{configureTownMode(TOWN_MODES.LEGACY);}
 assert.equal(transitStop(),BUS_STATION,'The older layouts keep their bus');
});
