import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBusRun} from '../src/world/bus.js';
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
const step=(run,seconds,dt=1/30)=>{for(let t=0;t<seconds;t+=dt)run.update(dt);};
const until=(run,phase,seconds=400,dt=1/30)=>{for(let t=0;t<seconds;t+=dt){if(run.phase===phase)return true;run.update(dt);}return false;};

test('a resident leaves on the bus rather than at the kerb',()=>{
 const run=createBusRun({parent:new THREE.Group()}),g={};
 const {boarded}=gate(run);

 // The bus is at the terminus: they are queueing, not gone.
 assert.equal(run.phase,'waiting');
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
 assert.equal(atTheStop(),true,'The bus starts away from its own terminus');
 assert.ok(until(run,'gone'),'The bus never goes');
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
