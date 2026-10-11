import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createFerryRun,FERRY,FERRY_BERTH,FERRY_TERMINAL,FERRY_TIMES,TOWN_PASSAGES,shipMotion} from '../src/world/ferry.js';
import {FERRY_DAY,rollPeriod} from '../src/world/ferry-ship.js';
import {FERRY_RAMP} from '../src/world/ferry-model.js';
import {SEA_LEVEL} from '../src/world/ocean.js';
import {HARBOUR_LINE,BUS_DWELL} from '../src/people/commuter-schedule.js';
import {OUTER_PIER,BREAKWATER,routeAt} from '../src/world/layout.js';
import {transitStop} from '../src/world/transit.js';
import {BUS_STATION} from '../src/world/bus-station.js';
import {chooseOpening} from '../src/world/openings.js';
import {circleHitsRect} from '../physics.js';
import {TURN_LIMITS} from '../src/world/ferry-paths.js';

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
 // Her gangway lands on the pier, short of its end.
 assert.ok(FERRY_BERTH.gangwayZ>OUTER_PIER.z-OUTER_PIER.length/2+.5);
 // The gangway's foot and the queue are on the pier's deck, where people can stand.
 const {ferry}=run(0,1);
 for(let i=0;i<4;i++){const [x,z]=ferry.queueSpot(i);assert.equal(routeAt(x,z,.3)?.id,'outer-pier','Queue place '+i+' is off the pier');}
 assert.deepEqual(ferry.door,[...FERRY_TERMINAL.queue]);
 // And it goes away again: out of sight between sailings.
 assert.ok(seen.filter(s=>s.m<HARBOUR_LINE[0]-FERRY_TIMES.arrive-1).every(s=>!s.visible));
 assert.ok(seen.at(-1).phase==='away'&&!seen.at(-1).visible,'It never left');
});

/** Every point of the hull's outline at a pose (centre, yaw), on a 0.4 m grid. */
const hullPoints=({x,z,yaw})=>{const c=Math.cos(yaw),sn=Math.sin(yaw),out=[];
 for(let dx=-FERRY.beam/2;dx<=FERRY.beam/2+1e-9;dx+=FERRY.beam/8)for(let dz=-FERRY.length/2;dz<=FERRY.length/2+1e-9;dz+=.4)out.push([x+c*dx+sn*dz,z-sn*dx+c*dz]);return out;};
const inRect=([px,pz],x0,x1,z0,z1,m=0)=>px>x0-m&&px<x1+m&&pz>z0-m&&pz<z1+m;

test('it comes in round the breakwater, never through it, and keeps every part of the hull off the pier and the quay',()=>{
 const {seen}=run(HARBOUR_LINE[1]-80,HARBOUR_LINE[1]+BUS_DWELL+80,1/20);
 const pierW=OUTER_PIER.x-OUTER_PIER.width/2,pierE=OUTER_PIER.x+OUTER_PIER.width/2,pierS=OUTER_PIER.z-OUTER_PIER.length/2,pierN=OUTER_PIER.z+OUTER_PIER.length/2;
 for(const s of seen.filter(s=>s.visible))for(const p of hullPoints(s)){
  // The breakwater: a 68 m wall across the harbour mouth, 4 m thick (at z -106 since batch 3); a metre of water kept off it.
  assert.ok(!inRect(p,BREAKWATER.minX,BREAKWATER.maxX,BREAKWATER.z-2,BREAKWATER.z+2,1),'Hull within a metre of the breakwater at '+p.map(v=>v.toFixed(1)));
  // The outer pier and the second pier, its arm and Mr Fujita's houseboat beside it.
  assert.ok(!inRect(p,pierW,pierE,pierS,pierN,.1),'Hull touches the outer pier at '+p.map(v=>v.toFixed(1)));
  assert.ok(!inRect(p,-38.3,-33.7,-64.3,-44,1),'Hull touches the second pier at '+p.map(v=>v.toFixed(1)));
  assert.ok(!inRect(p,-38.3,-23.7,-64.3,-59.7,1),'Hull touches the second pier’s arm at '+p.map(v=>v.toFixed(1)));
  assert.ok(!inRect(p,-42.05,-38.95,-59.9,-53.1,1),'Hull touches the houseboat at '+p.map(v=>v.toFixed(1)));
  // And never over the quay.
  assert.ok(p[1]< -50,'Hull over the quay at '+p.map(v=>v.toFixed(1)));
 }
 // It turns before it sails away, rather than steaming out backwards or flipping round.
 const yaws=seen.filter(s=>s.visible).map(s=>s.yaw);
 for(let i=1;i<yaws.length;i++){let d=Math.abs(yaws[i]-yaws[i-1]);d=Math.min(d,Math.PI*2-d);assert.ok(d<.35,'It spun on the spot at step '+i);}
});

test('the ferry has a solid hull only while it is alongside',()=>{
 const {ferry,colliders}=run(HARBOUR_LINE[0]-FERRY_TIMES.sea-FERRY_TIMES.harbour-5,HARBOUR_LINE[0]+2);
 const hull=colliders.find(c=>c.id==='ferry');
 assert.equal(ferry.phase,'waiting');assert.ok(circleHitsRect(FERRY_BERTH.x,FERRY_BERTH.z,.3,hull));
 for(let m=HARBOUR_LINE[0]+2;m<HARBOUR_LINE[0]+BUS_DWELL+15;m+=.1)ferry.update(.1,m,m);
 assert.notEqual(ferry.phase,'waiting');assert.ok(!circleHitsRect(FERRY_BERTH.x,FERRY_BERTH.z,.3,hull));
});

test('on the island the stop is the ferry terminal and the game can start off the ferry',()=>{
 
 try{
  assert.equal(transitStop(),FERRY_TERMINAL);
  assert.equal(chooseOpening({minutes:600,force:'ferry',storage:null}).id,'ferry');
  assert.equal(chooseOpening({minutes:600,force:'bus-stop',storage:null}).id,'ferry','Old links to the bus stop go nowhere');
 }finally{}
});

test('the ferry keeps real time: in slowly, fifteen minutes alongside, five to clear the port, then away',()=>{
 const T=FERRY_TIMES,start=HARBOUR_LINE[0]-T.sea-T.harbour-2,{ferry}=run(start,start);
 const at={};let m=start;
 const go=until=>{for(;m<until;m+=1/60)ferry.update(1/60,m,m*60);return {phase:ferry.phase,x:ferry.ferry.position.x,z:ferry.ferry.position.z,visible:ferry.ferry.visible};};
 at.arriving=go(HARBOUR_LINE[0]-1);assert.equal(at.arriving.phase,'arriving');
 at.alongside=go(HARBOUR_LINE[0]+BUS_DWELL-.5);assert.equal(at.alongside.phase,'waiting','loading for a quarter of an hour');
 at.backing=go(HARBOUR_LINE[0]+BUS_DWELL+1);assert.equal(at.backing.phase,'reversing');
 at.inPort=go(HARBOUR_LINE[0]+BUS_DWELL+4);assert.equal(at.inPort.phase,'leaving');assert.equal(TOWN_PASSAGES.departure.pose(4*60).kind,'manoeuvring','still working out of the harbour four minutes after letting go');
 at.clear=go(HARBOUR_LINE[0]+BUS_DWELL+5.2);assert.equal(TOWN_PASSAGES.departure.pose(5.2*60).kind,'sea','clear of the port in five minutes');assert.ok(at.clear.x<BREAKWATER.minX,'out past the breakwater’s west end');
 at.gone=go(HARBOUR_LINE[0]+BUS_DWELL+T.reverse+T.turn+T.leaveHarbour+T.leaveSea+.2);assert.equal(at.gone.phase,'away');assert.equal(at.gone.visible,false);
 // Each way is a passage: in from sea making way and to rest alongside; out from rest, making way as she goes.
 // Faster at sea than in the harbour, her turns within what she can make, and no jumps.
 const {arrival,departure}=TOWN_PASSAGES;
 assert.ok(Math.abs(arrival.duration-(T.sea+T.harbour)*60)<1e-6&&Math.abs(departure.duration-(T.reverse+T.turn+T.leaveHarbour+T.leaveSea)*60)<1e-6);
 const speed=(plan,kind)=>{const l=plan.legs.find(l=>l.kind===kind);return plan.pose((l.from+l.until)/2).speed;};
 assert.ok(speed(arrival,'sea')>speed(arrival,'berthing')*2,'it slows inside the breakwater');assert.ok(speed(departure,'sea')>speed(departure,'astern')*2,'it opens up once it is out');
 for(const plan of [arrival,departure]){let prev=plan.pose(0);for(let t=.25;t<=plan.duration;t+=.25){const p=plan.pose(t);
  assert.ok(Math.abs(p.turn)<=TURN_LIMITS[p.kind]*Math.PI/180*1.001,p.kind+' turns too fast at '+t);assert.ok(Math.abs(p.speed-prev.speed)<=.15*.25,'speed jumps at '+t);prev=p;}}
 assert.equal(arrival.pose(arrival.duration).speed,0);assert.equal(departure.pose(0).speed,0);
});

test('she rides the water: rolls at her period, a little alongside and more at sea, and her ramp and gangway stay on their landings',()=>{
 assert.ok(rollPeriod()>5&&rollPeriod()<6.5,'a small stiff ferry rolls in five to six and a half seconds');
 const deg=Math.PI/180,most=e=>{let roll=0,pitch=0;for(let t=0;t<60;t+=.05){const m=shipMotion(-20,-120,t,e);roll=Math.max(roll,Math.abs(m.roll));pitch=Math.max(pitch,Math.abs(m.pitch));}return {roll,pitch};};
 const harbour=most(0),sea=most(1);
 assert.ok(harbour.roll<=.36*deg&&harbour.roll>.2*deg,'alongside she rolls a few tenths of a degree');
 assert.ok(sea.roll<=2.01*deg&&sea.roll>1.5*deg,'at sea about two degrees');assert.ok(sea.pitch<=.51*deg&&sea.pitch>harbour.pitch,'and pitches half a degree');
 // Her heading comes first, then pitch about her beam and roll about her length.
 const r=createFerryRun({parent:new THREE.Group(),colliders:[]});assert.equal(r.ferry.rotation.order,'YXZ');
 // Seen from the pier she does not vanish at the harbour mouth: she is drawn wherever she is in view.
 assert.equal(r.ferry.userData.horizon,true);
 r.parkAt('town');const toe=new THREE.Vector3(),foot=new THREE.Vector3();let low=Infinity,high=-Infinity,footLow=Infinity,footHigh=-Infinity,moved=0;
 for(let i=0;i<400;i++){r.update(.1,600,i*.1);r.ferry.userData.ramp.updateMatrixWorld(true);toe.set(0,0,FERRY_RAMP.length).applyMatrix4(r.ferry.userData.ramp.matrixWorld);
  r.ferry.userData.gangway.updateMatrixWorld(true);foot.set(1.7,0,0).applyMatrix4(r.ferry.userData.gangway.matrixWorld);
  low=Math.min(low,toe.y);high=Math.max(high,toe.y);footLow=Math.min(footLow,foot.y);footHigh=Math.max(footHigh,foot.y);moved=Math.max(moved,Math.abs(r.ferry.position.y-(SEA_LEVEL+.12)));}
 assert.ok(moved>.005,'she does heave alongside');assert.ok(high-low<.002,'the ramp toe rides up and down on the quay ('+(high-low).toFixed(3)+' m)');assert.ok(footHigh-footLow<.002,'the gangway foot rides on the pier');
 assert.ok(Math.abs(low-(.56-FERRY_RAMP.length*Math.sin(.24)))<.01,'and where it always lay');
});

test('her lights, engines and whistle: lit under way after dark, quiet on shore power at night, signals as she leaves and passes the breakwater',()=>{
 const r=createFerryRun({parent:new THREE.Group(),colliders:[]}),nav=()=>r.ferry.getObjectByName('Masthead light').material.color.getHex()!==0x333333;
 r.update(.1,21*60,0);r.parkAt('town');r.update(.1,21*60,.1);assert.equal(nav(),false,'no navigation lights alongside');
 assert.equal(r.audio.engines,'idle','in service at nine in the evening: a generator running');
 r.update(.1,23*60,.2);assert.equal(r.audio.engines,'off','after the last boat she lies on shore power');
 r.update(.1,21*60,.3);r.beginCrossing('airport');for(let i=1;i<=20;i++){r.update(.1,21*60,.3+i*.1);r.setCrossingProgress(i/40);}
 assert.equal(nav(),true,'navigation lights on under way at night');assert.equal(r.ferry.getObjectByName('Port sidelight').material.color.getHex(),0xff3a2a,'red to port');
 const w=r.audio.whistle;assert.deepEqual(w.log.map(s=>s.kind),['prolonged','astern','prolonged'],'a prolonged blast and three short leaving the berth, a prolonged blast at the breakwater');
 assert.ok(Math.hypot(w.log[2].x-BREAKWATER.minX,w.log[2].z-BREAKWATER.z)<16,'the breakwater signal is sounded at its end');
 assert.ok(['manoeuvring','sea'].includes(r.audio.engines));
 r.update(.1,12*60,5);r.setCrossingProgress(.5);assert.equal(nav(),false,'no navigation lights by day');assert.equal(r.audio.engines,'sea');
 // Her day: generators on before the first boat, shore power after the last.
 assert.ok(FERRY_DAY.generators<FERRY_DAY.inService&&FERRY_DAY.inService<FERRY_DAY.shorePower);
});
