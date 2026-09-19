import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBusRun} from '../src/world/bus.js';
import {HARBOUR_LINE} from '../src/people/commuter-schedule.js';
import {BUS_STATION} from '../src/world/bus-station.js';

/**
 * The boarding rule on its own, as schedules.js applies it: you go when a bus you
 * have stood beside has pulled away, and not before.
 */
function gate(run){
 const seen=new WeakSet();
 const atTheStop=()=>!run||['waiting','turning'].includes(run.phase);
 return {
  atTheStop,
  boarded(g){
   if(!run)return true;
   if(atTheStop()){seen.add(g);return false;}
   return seen.has(g);
  },
 };
}
// The bus is on the town clock now, and it runs at a minute a second, so the seconds
// wound on here are also the minutes. Each run gets its own clock, started a little
// before the first service so the bus comes in rather than being parked all day.
const clocks=new WeakMap();
const clockFor=run=>{if(!clocks.has(run))clocks.set(run,{minutes:HARBOUR_LINE[0]-12});return clocks.get(run);};
const step=(run,seconds,dt=1/30)=>{const c=clockFor(run);for(let t=0;t<seconds;t+=dt){c.minutes+=dt;run.update(dt,c.minutes);}};
const until=(run,phase,seconds=1600,dt=1/30)=>{const c=clockFor(run);for(let t=0;t<seconds;t+=dt){if(run.phase===phase)return true;c.minutes+=dt;run.update(dt,c.minutes);}return false;};

test('a resident leaves on the bus rather than at the kerb',()=>{
 const run=createBusRun({parent:new THREE.Group()}),g={};
 const {boarded}=gate(run);

 // The bus is at the terminus: they are queueing, not gone.
 assert.ok(until(run,'waiting'),'The bus never came in for its first service');
 assert.equal(boarded(g),false,'They vanished while the bus was still standing there');

 // It pulls out, and now they are on it.
 assert.ok(until(run,'leaving'),'The bus never leaves');
 assert.equal(boarded(g),true,'They are still on the platform after their bus has gone');

 // Somebody whose shift ends while the service is up the road waits for the next one
 // instead of blinking out, which is the whole point of the memory.
 const latecomer={};
 assert.equal(boarded(latecomer),false,'A latecomer left without a bus');
 assert.ok(until(run,'waiting',600),'The service never comes back');
 assert.equal(boarded(latecomer),false,'They went before the bus arrived');
 assert.ok(until(run,'leaving',600),'The bus never leaves again');
 assert.equal(boarded(latecomer),true,'They missed a bus they were standing at');
});

test('nobody is put down on the platform unless the bus is at it',()=>{
 const run=createBusRun({parent:new THREE.Group()});
 const {atTheStop}=gate(run);
 assert.ok(until(run,'waiting'),'The bus never came in for its first service');
 assert.equal(atTheStop(),true,'The bus starts away from its own terminus');
 assert.ok(until(run,'away'),'The bus never goes');
 assert.equal(atTheStop(),false,'A departed bus still counts as standing at the stop');

 // and where they step off is beside the bus, on the platform, not inside the bus.
 assert.ok(until(run,'waiting',600),'The service never comes back');
 const step=[run.bus.position.x-1.9,run.bus.position.z+1.2];
 assert.ok(Math.abs(step[0]-BUS_STATION.x)>1,'They step off into the carriageway');
 assert.ok(step[1]>run.bus.position.z,'They step off on the road side rather than the platform side');
 assert.ok(step[0]>=BUS_STATION.minX&&step[0]<=BUS_STATION.maxX,'They step off outside the station');
 assert.ok(step[1]>=BUS_STATION.minZ&&step[1]<=BUS_STATION.maxZ,'They step off outside the station');
});

test('with no bus modelled at all, people come and go as they always did',()=>{
 const {boarded,atTheStop}=gate(null);
 assert.equal(boarded({}),true,'A town without a service strands its commuters');
 assert.equal(atTheStop(),true);
});

test('nobody who was already away is left standing at the terminus',async()=>{
 const {configureTownMode,TOWN_MODES}=await import('../src/world/town-mode.js');
 const {createCastAI}=await import('../src/people/schedules.js');
 const {RESIDENTS,STREET_CAST_NAMES}=await import('../src/people/residents.js');

 configureTownMode(TOWN_MODES.PENINSULA);
 try{
  // Three in the morning. Day staff left on the evening service. Reiko and Tetsuo
  // have finished work and wait for the morning service alongside the night staff.
  const NIGHT=188;
  const parent=new THREE.Group();
  const people=STREET_CAST_NAMES.map(name=>{
   const profile=RESIDENTS.find(p=>p.name===name),g=new THREE.Group();
   g.userData={name,visualReady:true};g.position.set(profile.work[0],0,profile.work[1]);
   parent.add(g);return {g,profile};
  });
  const bus=createBusRun({parent:new THREE.Group()});
  const player=new THREE.Group();player.position.set(0,0,0);
  const world={people,homes:new Map(),bus};
  // The save the player actually reloads. snapshot() records an away resident at
  // BUS_STATION.exit (platform, clear of the painted tunnel mouth). They must not
  // reappear in a heap at the coyote arch or on the forest bus road.
  const residentLocations=Object.fromEntries(people.map(p=>
   [p.profile.name,{position:[...BUS_STATION.exit],indoors:null,place:'away'}]));
  const ai=createCastAI({world,player,state:()=>({townMode:'peninsula',inventory:[],residentLocations}),
   paused:()=>false,collides:()=>false});
  for(let i=0;i<180;i++){bus.update(1/60,NIGHT+i/60,false);ai.update(1/60,NIGHT+i/60,false);}

  // Anyone still on their feet is somebody with a reason to be out: the night patrol
  // and the harbour office. Everybody else went home hours ago.
  //
  // The hold rewrites their place to 'bus' while they queue, so asking whether they
  // are 'away' does not catch this -- what catches it is that they are drawn at all,
  // and that they are standing in a heap on one spot at the terminus.
  const out=people.filter(p=>p.g.visible!==false);
  const named=out.map(p=>p.profile.name+' ('+p.g.userData.place+')').join(', ');
  const working=['Officer Mori','Harbour master','Bus driver','Nao','Reiko','Tetsuo'];
  const loitering=out.filter(p=>!working.includes(p.profile.name))
   .map(p=>p.profile.name+' at '+p.g.position.x.toFixed(1)+','+p.g.position.z.toFixed(1));
  assert.deepEqual(loitering,[],'People are standing about in the middle of the night: '+named);
  // and nobody is stacked on top of anybody, which is what a queue for a bus that is
  // an hour away looks like.
  for(const a of out)for(const b of out){
   if(a===b)continue;
   assert.ok(a.g.position.distanceTo(b.g.position)>.6,
    a.profile.name+' and '+b.profile.name+' are standing in the same place');
  }
 }finally{configureTownMode(TOWN_MODES.LEGACY);}
});
