import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBusRun,TUNNEL_RUN} from '../src/world/bus.js';
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

test('the bus comes out of the tunnel to the stop and backs into it again',()=>{
 const parent=new THREE.Group(),run=createBusRun({parent});
 // It is not at the terminus all day. It comes for its service.
 assert.equal(run.phase,'away');
 assert.equal(run.bus.visible,false,'The bus stands at the stop between services');
 atTerminus(run);
 assert.equal(run.bus.scale.x,1);
 // It stands at the portal, which is where it is boarded, on the road.
 assert.ok(run.bus.position.z<TUNNEL.z,'The bus stands inside the hill');
 assert.ok(TUNNEL.z-run.bus.position.z<6,'The bus stops short of the tunnel it is meant to stand at');

 // It leaves by reversing into the tunnel: always the same size, always going further
 // in, and gone only once the dark inside has it.
 assert.ok(until(run,'leaving'),'The bus never leaves');
 let last=-Infinity;
 for(let t=0;t<30;t+=1/30){
  clock.minutes+=1/30;run.update(1/30,clock.minutes);
  if(run.phase!=='leaving')break;
  assert.ok(run.bus.position.z>=last-1e-6,'The bus is not going into the tunnel');
  assert.equal(run.bus.scale.x,1,'The bus changed size');
  if(run.bus.position.z<TUNNEL.z+10)assert.equal(run.bus.visible,true,'The bus vanished in plain sight');
  last=run.bus.position.z;
 }
 assert.equal(run.phase,'away');
 assert.equal(run.bus.visible,false,'The bus is still there once it has gone');
 assert.ok(last>TUNNEL.z+18,'The bus went out somewhere other than deep in the tunnel');
 assert.ok(last<=TUNNEL_RUN.deep+1e-6);

 // and the whole thing comes round again, on the next service rather than in a minute.
 const seen=until(run,'waiting',1500);
 assert.ok(seen,'The service never comes back');
 assert.ok(seen.includes('arriving'),'The bus skips arriving');
 assert.equal(run.bus.scale.x,1);
 // It used to swing through a hundred and eighty degrees in front of the shelter. It
 // has one heading now, from the moment it appears to the moment it goes.
 assert.equal(headings.size,1,'The bus turned somewhere in its run: '+[...headings].join(', '));
 assert.ok(Math.abs([...headings][0]-Math.PI)<1e-4,'The bus faces away from the town it has come to serve');
});

test('the bus is solid while it is on the road, and not once it is in the tunnel',()=>{
 const parent=new THREE.Group(),colliders=[],run=createBusRun({parent,colliders});
 const solid=colliders.find(c=>c.id==='harbour-bus');
 assert.ok(solid,'You walk through the bus at the stop');
 atTerminus(run);

 // Standing at the terminus it is eight and a half metres of vehicle across the road.
 const nose=run.bus.position.z+3.5;
 assert.ok(circleHitsRect(run.bus.position.x,nose,.36,solid),'You can walk into the side of the waiting bus');
 assert.ok(!circleHitsRect(run.bus.position.x+4,run.bus.position.z,.36,solid),'The bus stops you from the next lane');
 assert.ok(solid.d>solid.w,'The waiting bus is as wide as it is long');

 // Backing out of the stop it is still a bus in the road, and still in the way.
 assert.ok(until(run,'leaving'),'The bus never leaves');
 for(let t=0;t<2;t+=1/30){clock.minutes+=1/30;run.update(1/30,clock.minutes);if(run.phase!=='leaving')break;}
 assert.ok(solid.w>0,'The bus lost its box while it was still on the road');
 assert.ok(circleHitsRect(run.bus.position.x,run.bus.position.z-3.5,.36,solid),'You can walk through the reversing bus');

 // and drops it once it is in the tunnel, where nobody on foot can follow it. A
 // collider left behind would be an invisible wall across the mouth of the tunnel.
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

test('the Harbour Line runs three services daily and stops for fifteen minutes',async()=>{
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
 assert.deepEqual([...HARBOUR_LINE],[510,870,1320],'Only morning, afternoon and evening services');
 assert.equal(BUS_DWELL,15,'Each stop lasts fifteen town minutes');
 for(let i=0;i<HARBOUR_LINE.length;i++){
  const next=i===HARBOUR_LINE.length-1?HARBOUR_LINE[0]+1440:HARBOUR_LINE[i+1];
  assert.ok(next-HARBOUR_LINE[i]>=360,'Services must be at least six town hours apart');
 }

 // It works every service in the day, and is not at the stop the rest of the time.
 const run=createBusRun({parent:new THREE.Group()});
 const served=[],standing=[];
 let minutes=0,was='away';
 for(let i=0;i<1440*4*2;i++){
  minutes+=.25;run.update(.25,minutes,false);
  if(run.phase==='waiting'){standing.push(minuteOfDay(minutes));if(was!=='waiting')served.push(run.service);}
  was=run.phase;
 }
 assert.deepEqual(served,[...HARBOUR_LINE,...HARBOUR_LINE],'The bus missed or invented a service across midnight');
 // A branch line stands at its terminus for minutes a day, not hours.
 const dwellMinutes=standing.length*.25;
 assert.ok(dwellMinutes<2*HARBOUR_LINE.length*(BUS_DWELL+3),'The bus is parked at the stop all day: '+dwellMinutes.toFixed(0)+' min');

 // A passenger approaching does not change the fixed fifteen-minute stop.
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
 assert.equal(held.left,alone.left,'A passenger extended the scheduled stop');
 for(const trip of [alone,held]){
  assert.ok(trip.left-trip.arrived>=15,'The bus left before waiting fifteen minutes');
  assert.ok(trip.left-trip.arrived<15.25,'The bus waited longer than fifteen minutes');
 }
 assert.equal(nextService(HARBOUR_LINE.at(-1)+1).service,HARBOUR_LINE[0],'The last service does not roll round to the first');
});

test('loading during a service restores the stop and skips missed trips after a clock jump',()=>{
 const run=createBusRun({parent:new THREE.Group(),colliders:[]});
 const service=HARBOUR_LINE.find(m=>m===510),day=1440*3;
 run.update(1/60,day+service+2);
 assert.equal(run.phase,'waiting');assert.equal(run.service,service);
 assert.equal(run.bus.visible,true);assert.equal(run.bus.scale.x,1);
 for(let m=service+2;m<service+BUS_DWELL;m+=.05){
  run.update(.05,day+m);
  assert.equal(run.phase,'waiting','A scheduled stop departed early');
 }
 run.update(.05,day+service+BUS_DWELL);
 assert.equal(run.phase,'leaving');
 run.update(.05,day+800);
 assert.equal(run.phase,'away','An old service replayed after returning from an interior');
 assert.equal(run.bus.visible,false);
 run.update(.05,day+870+1);
 assert.equal(run.phase,'waiting');assert.equal(run.service,870);
 run.update(.05,day+100);
 assert.equal(run.phase,'away','Moving the clock backwards retained a later bus');
});

test('the stop notice shows the actual timetable, next arrival and midnight rollover',async()=>{
 const {harbourTimetable,serviceTime}=await import('../src/people/commuter-schedule.js');
 const {createActivities}=await import('../activities.js');
 const {installDOM}=await import('./fixtures.mjs');
 installDOM();let minutes=700;
 const activities=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>minutes});
 activities.action('bus');
 const text=document.querySelector('#activityBody').firstChild.textContent;
 assert.equal(text,harbourTimetable(minutes));
 for(const m of HARBOUR_LINE)assert.ok(text.includes(serviceTime(m)));
 assert.match(text,/08:30 → 08:45/);
 assert.match(text,/14:30 → 14:45/);
 assert.match(text,/22:00 → 22:15/);
 assert.match(text,/Next arrival: 14:30 · in 170 town minutes/);
 minutes=511;activities.action('bus');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/Scheduled stop: 08:30–08:45/);
 assert.match(harbourTimetable(1430),/Next arrival: 08:30 · in 520 town minutes/);
 assert.equal(harbourTimetable(1440+700),harbourTimetable(700));
});
