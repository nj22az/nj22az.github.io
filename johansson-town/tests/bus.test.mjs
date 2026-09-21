import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBusRun,vanishingPoint} from '../src/world/bus.js';
import {TUNNEL} from '../src/world/coyote-tunnel.js';
import {circleHitsRect} from '../physics.js';
import {HARBOUR_LINE,BUS_DWELL} from '../src/people/commuter-schedule.js';

/**
 * Runs the service until it reaches a phase, or gives up.
 *
 * The bus is on the town clock now rather than a stopwatch, and the clock runs at a
 * minute a second, so the seconds fed to update are also the minutes fed with them.
 */
/** Every heading the bus is drawn at, so a turn anywhere in the run shows up. */
const headings=new Set();
function until(run,phase,seconds=200,dt=1/30,inbound=false){
 const seen=[];
 for(let t=0;t<seconds;t+=dt){
  if(run.phase!==seen.at(-1))seen.push(run.phase);
  if(run.bus.visible)headings.add(+run.bus.rotation.y.toFixed(6));
  if(run.phase===phase)return seen;
  clock.minutes+=dt;run.update(dt,clock.minutes,inbound);
 }
 return null;
}
/** The town clock the tests wind on. Starts a few minutes before the first service. */
const clock={minutes:0};
function atTerminus(run,service=HARBOUR_LINE[0]){
 clock.minutes=service-12;
 assert.ok(until(run,'waiting',60),'The bus never reached the terminus for '+service);
 return run;
}

test('the bus leaves by being shrunk onto the painting, and comes back the same way',()=>{
 const parent=new THREE.Group(),run=createBusRun({parent});
 const vanish=vanishingPoint();
 // It is not at the terminus all day any more. It comes for its service.
 assert.equal(run.phase,'away');
 assert.equal(run.bus.visible,false,'The bus stands at the stop between services');
 atTerminus(run);
 assert.equal(run.bus.scale.x,1);
 // It stands at the arch, which is where it is boarded, and the whole of it is on the
 // road: a bus with its back end inside the rock is a bus drawn through the painting.
 assert.ok(run.bus.position.z<TUNNEL.z,'The bus stands inside the rock');
 assert.ok(TUNNEL.z-run.bus.position.z<6,'The bus stops short of the arch it is meant to stand at');

 assert.ok(until(run,'leaving'),'The bus never leaves');
 // Through the vanish it converges on the painting's own vanishing point. Anything
 // else and it slides off the picture as it recedes, which is the whole illusion.
 let last=Infinity;
 for(let t=0;t<4;t+=1/30){
  run.update(1/30);
  if(run.phase!=='leaving')break;
  const gap=run.bus.position.distanceTo(vanish);
  assert.ok(gap<=last+1e-6,'The bus is not closing on the vanishing point');
  assert.ok(run.bus.scale.x<1,'The bus is not shrinking');
  last=gap;
 }
 assert.equal(run.phase,'away');
 assert.equal(run.bus.visible,false,'The bus is still there once it has gone');
 assert.ok(run.bus.scale.x<.05,'The bus goes out at a size you would still see');
 assert.ok(run.bus.position.distanceTo(vanish)<.4,'The bus goes out somewhere other than the far end');

 // and the whole thing comes round again, on the next service rather than in a minute.
 const seen=until(run,'waiting',1500);
 assert.ok(seen,'The service never comes back');
 assert.ok(seen.includes('arriving'),'The bus skips arriving');
 assert.equal(run.bus.scale.x,1);
 // It used to drive down to the terminus and swing through a hundred and eighty
 // degrees in front of the shelter, which is the one place you are certainly watching.
 // It has one heading now, from the moment it appears to the moment it goes.
 assert.equal(headings.size,1,'The bus turned somewhere in its run: '+[...headings].join(', '));
 assert.ok(Math.abs([...headings][0]-Math.PI)<1e-4,'The bus faces away from the town it has come to serve');
});

test('the bus is solid while it is a bus, and not once it is a picture of one',()=>{
 const parent=new THREE.Group(),colliders=[],run=createBusRun({parent,colliders});
 const solid=colliders.find(c=>c.id==='harbour-bus');
 assert.ok(solid,'You walk through the bus at the stop');
 atTerminus(run);

 // Standing at the terminus it is eight and a half metres of vehicle across the road.
 const nose=run.bus.position.z+3.5;
 assert.ok(circleHitsRect(run.bus.position.x,nose,.36,solid),'You can walk into the side of the waiting bus');
 assert.ok(!circleHitsRect(run.bus.position.x+4,run.bus.position.z,.36,solid),'The bus stops you from the next lane');
 assert.ok(solid.d>solid.w,'The waiting bus is as wide as it is long');

 // The box comes off as soon as it starts shrinking, which is the first frame of
 // leaving: from there it is a picture of a bus, not a bus.
 assert.ok(until(run,'leaving'),'The bus never leaves');
 for(let t=0;t<2;t+=1/30){clock.minutes+=1/30;run.update(1/30,clock.minutes);if(run.phase!=='leaving')break;}
 assert.equal(solid.w,0,'The shrinking bus keeps a box across the mouth of the tunnel');

 // and drops it the moment it stops being a vehicle in the road. A collider left on
 // the shrinking bus is an invisible wall across the mouth of the tunnel.
 assert.ok(until(run,'away'),'The bus never goes');
 assert.equal(solid.w,0);assert.equal(solid.d,0);
 assert.ok(!circleHitsRect(TUNNEL.x,TUNNEL.z-2,.36,solid),'The departed bus still blocks the tunnel mouth');
 // and it is parked out of the world rather than shrunk to nothing where it stood.
 // A 0x0 rect is not "no collider": circleHitsRect compares against half the width
 // plus the walker's radius, so a zero box still stops anyone who comes within 0.36m
 // of its centre — an invisible post at whatever spot the bus faded out on.
 assert.ok(Math.hypot(solid.x,solid.z)>1e5,'The departed bus left an invisible post behind it');
 assert.ok(circleHitsRect(solid.x,solid.z,.36,{x:solid.x,z:solid.z,w:0,d:0}),'A zero-size rect does not stop anyone, so parking it away is pointless');

});

test('the Harbour Line runs to a timetable, and holds for somebody still walking up',async()=>{
 const {COMMUTER_SHIFTS,departureFor,nextService}=await import('../src/people/commuter-schedule.js');
 const minuteOfDay=m=>((m%1440)+1440)%1440;

 // Every shift change has a bus. Nobody in this town can be left at the terminus
 // because the timetable and the rota were written by different hands.
 const stranded=[];
 for(const [name,shift] of Object.entries(COMMUTER_SHIFTS)){
  if(shift.permanent)continue;
  const wanted=[shift.arrival,shift.departure,shift.lateDeparture].filter(Number.isFinite);
  for(const minute of wanted)if(!HARBOUR_LINE.includes(minuteOfDay(minute)))stranded.push(name+' at '+minute);
 }
 assert.deepEqual(stranded,[],'No service for these shift changes');
 assert.deepEqual([...HARBOUR_LINE].sort((a,b)=>a-b),[...HARBOUR_LINE],'The timetable is out of order');
 assert.equal(new Set(HARBOUR_LINE).size,HARBOUR_LINE.length,'The timetable runs the same service twice');

 // It works every service in the day, and is not at the stop the rest of the time.
 const run=createBusRun({parent:new THREE.Group()});
 const served=[],standing=[];
 let minutes=0,was='away';
 for(let i=0;i<1440*4;i++){
  minutes+=.25;run.update(.25,minutes,false);
  if(run.phase==='waiting'){standing.push(minuteOfDay(minutes));if(was!=='waiting')served.push(run.service);}
  was=run.phase;
 }
 assert.deepEqual(served,[...HARBOUR_LINE],'The bus missed or invented a service');
 // A branch line stands at its terminus for minutes a day, not hours.
 const dwellMinutes=standing.length*.25;
 assert.ok(dwellMinutes<HARBOUR_LINE.length*(BUS_DWELL+3),'The bus is parked at the stop all day: '+dwellMinutes.toFixed(0)+' min');

 // And it waits for a regular the driver can see coming, but not forever.
 const timed=inbound=>{
  const service=HARBOUR_LINE[0],r=createBusRun({parent:new THREE.Group()});
  let m=service-12,arrived=null;
  for(let i=0;i<600*4;i++){
   m+=.25;r.update(.25,m,inbound);
   if(r.phase==='waiting'&&arrived===null)arrived=m;
   if(arrived!==null&&r.phase==='leaving')return {arrived,left:m};
  }
  return null;
 };
 const alone=timed(false),held=timed(true);
 assert.ok(alone&&held,'The bus never pulled away');
 assert.ok(held.left>alone.left+3,'The bus pulls away from somebody still walking to it');
 assert.ok(held.left-held.arrived<30,'The bus waits all night for one passenger');
 assert.equal(nextService(HARBOUR_LINE.at(-1)+1).service,HARBOUR_LINE[0],'The last service does not roll round to the first');
});
