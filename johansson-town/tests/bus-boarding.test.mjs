import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBusRun} from '../src/world/bus.js';
import {HARBOUR_LINE} from '../src/people/commuter-schedule.js';
import {BUS_STATION} from '../src/world/bus-station.js';
import {MAIN_ROAD} from '../src/world/main-road.js';

/**
 * The boarding rule on its own, as schedules.js applies it: you go when a bus you
 * have stood beside has pulled away, and not before.
 */
function gate(run){
 const seen=new WeakSet();
 const atTheStop=()=>!run||run.phase==='waiting';
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

 // and where they step off is the door they would have got on by: beside the front of
 // the bus, clear of its flank, on the road it is standing on. The bus stands at the
 // arch now rather than at the shelter, so the old test -- step off inside the bus
 // station's footprint -- was asking for somewhere the bus no longer goes.
 assert.ok(until(run,'waiting',600),'The service never comes back');
 const step=run.door;
 assert.equal(step[1],run.doorway[1],'On and off happen at different ends of the bus');
 assert.ok(step[0]<run.doorway[0],'The door is on the far side of the bus from the kerb it opens onto');
 assert.ok(Math.abs(step[0]-run.bus.position.x)>1.2,'They step off into the side of the bus');
 assert.ok(step[1]<run.bus.position.z,'They step off at the back rather than the front');
 assert.ok(Math.abs(step[0]-MAIN_ROAD.x)<MAIN_ROAD.width/2,'They step off the edge of the road');
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
  // Three in the morning. Every shop worker went home hours ago, the last service was
  // at half past one and the next is at four, and the player has just opened the page.
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
  // BUS_STATION.exit, which is a waypoint at the far end of the bus road rather than
  // anywhere a person would stand, so this is where they all come back to.
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
  const working=['Officer Mori','Harbour master','Bus driver','Nao'];
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

test('they walk up the road and step into the bus, rather than ending at a kerb',async()=>{
 const {installDOM}=await import('./fixtures.mjs');
 const {configureTownMode,TOWN_MODES}=await import('../src/world/town-mode.js');
 installDOM();globalThis.self=globalThis;
 configureTownMode(TOWN_MODES.PENINSULA);
 const {createTown}=await import('../src/world/town.js?boarding-walk');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const {createCastAI}=await import('../src/people/schedules.js?boarding-walk');
 const {RESIDENTS}=await import('../src/people/residents.js');
 const {circleHitsRect}=await import('../physics.js?snappy=1');

 const scene=new THREE.Scene();
 const built=createTown({scene,sites:createBusinesses(),townMode:'peninsula',mobile:false,shadows:false,
  register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 const collides=(x,z,r=.32)=>built.colliders.some(c=>circleHitsRect(x,z,r,c));
 const profile=RESIDENTS.find(p=>p.name==='Thuan'),g=new THREE.Group();
 g.userData={name:'Thuan',visualReady:true};g.position.set(profile.work[0],0,profile.work[1]);scene.add(g);
 const player=new THREE.Group();player.position.set(0,0,-30);
 const world={people:[{g,profile}],homes:new Map(),bus:built.bus,busStation:built.busStation,
  staffBench:built.staffBench,townMode:'peninsula'};
 const ai=createCastAI({world,player,state:()=>({townMode:'peninsula',inventory:[],residentLocations:{}}),
  paused:()=>false,collides,getObserverPosition:()=>player.position});

 const bus=built.bus,door=bus.door;
 let walkedUp=false,stepped=false,inside=false,gone=false,stood=null;
 for(let m=1240;m<1345;m+=1/60){
  bus.update(1/60,m,g.visible&&g.userData.place==='bus'&&g.position.z>20);
  ai.update(1/60,m,false);
  if(bus.phase==='waiting')stood=bus.bus.position.z;
  if(g.visible&&Math.hypot(g.position.x-door[0],g.position.z-door[1])<.9)walkedUp=true;
  if(g.userData.boarding){
   stepped=true;
   // The step in is scripted rather than walked: the inside of a bus is inside the
   // bus's own collider, and the walker will not take a step into one.
   assert.equal(g.userData.usingTownObject,true,'Boarding leaves the walker in charge of her');
  }
  if(stepped&&g.visible&&collides(g.position.x,g.position.z,.2))inside=true;
  if(!g.visible&&g.userData.place==='away')gone=true;
 }
 assert.ok(walkedUp,'She never reached the bus door at the arch');
 assert.ok(stepped,'She never got on: she was written off at the kerb instead');
 assert.ok(inside,'She was taken off the street before she reached the inside of the bus');
 assert.ok(gone,'She stepped into the bus and stayed on the street');

 // And the door she uses is up at the arch, not down at the old shelter.
 assert.ok(door[1]>BUS_STATION.maxZ,'The bus is boarded back down at the terminus');
 assert.ok(Math.abs(door[1]-stood)<5,'The door is nowhere near the bus it belongs to');
});
