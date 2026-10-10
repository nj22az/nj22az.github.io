import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createFerryRun,FERRY,FERRY_BERTH,FERRY_TERMINAL,FERRY_TIMES,inboundShare,outboundShare} from '../src/world/ferry.js';
import {HARBOUR_LINE,BUS_DWELL} from '../src/people/commuter-schedule.js';
import {OUTER_PIER,routeAt} from '../src/world/layout.js';
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
  // The breakwater: a 68 m wall across the harbour mouth at z -83, 4 m thick; a metre of water kept off it.
  assert.ok(!inRect(p,-34,34,-85,-81,1),'Hull within a metre of the breakwater at '+p.map(v=>v.toFixed(1)));
  // The outer pier and the second pier: never closer than her moored clearance.
  assert.ok(!inRect(p,pierW,pierE,pierS,pierN,.1),'Hull touches the outer pier at '+p.map(v=>v.toFixed(1)));
  assert.ok(!inRect(p,-38.3,-33.7,-62,-44,.5),'Hull touches the second pier at '+p.map(v=>v.toFixed(1)));
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
 at.inPort=go(HARBOUR_LINE[0]+BUS_DWELL+4);assert.equal(at.inPort.phase,'leaving');assert.ok(at.inPort.z>-80,'still inside the breakwater four minutes after letting go');
 at.clear=go(HARBOUR_LINE[0]+BUS_DWELL+5.2);assert.ok(at.clear.z<-79,'clear of the port in five minutes');
 at.gone=go(HARBOUR_LINE[0]+BUS_DWELL+T.reverse+T.turn+T.leaveHarbour+T.leaveSea+.2);assert.equal(at.gone.phase,'away');assert.equal(at.gone.visible,false);
 // Faster at sea than in the harbour, and it never jumps.
 const harbour=outboundShare(T.leaveHarbour)-outboundShare(T.leaveHarbour-.25),sea=outboundShare(T.leaveHarbour+T.leaveSea)-outboundShare(T.leaveHarbour+T.leaveSea-.25);
 assert.ok(sea>harbour*3,'it opens up once it is out');
 for(let e=0;e<T.sea+T.harbour;e+=.05)assert.ok(inboundShare(e+.05)>=inboundShare(e));
});
