import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {STREET_CAST} from '../src/people/residents.js';
import {residentPlan} from '../src/people/social.js';
import {commuterPhase} from '../src/people/commuter-schedule.js';
import {YARD_HOMES,YARD_RESIDENT_NAMES} from '../src/world/yard-homes-layout.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';
import {circleHitsRect,townBoundsBlocked} from '../physics.js?snappy=1';

test('the Front-Row staff live in the yard behind the shop and sleep at home, not on the bus',()=>{
 configureTownMode(TOWN_MODES.PENINSULA);
 try{
  for(const name of YARD_RESIDENT_NAMES){
   const p=STREET_CAST.find(r=>r.name===name);assert.ok(p,name+' is in the street cast');
   assert.ok(CAST_RECIPES[name],name+' has a drawn Shimanchu recipe');
   const home=Object.values(YARD_HOMES).find(h=>h.door[0]===p.home[0]&&h.door[1]===p.home[1]);
   assert.ok(home,name+' lives at a yard house door: '+p.home);assert.match(p.homeAddress,/Front-Row Yard/);
   assert.equal(commuterPhase(p,3*60),'town','never away on the Harbour Line');
   const night=residentPlan(p,3*60,false,{townMode:'peninsula'});
   assert.equal(night.place,'home',name+' is at home at three in the morning');
   assert.deepEqual(night.target,p.home);
  }
  const aya=STREET_CAST.find(r=>r.name==='Aya');
  assert.equal(residentPlan(aya,12*60,false,{townMode:'peninsula'}).place,'work','Aya works her shift');
 }finally{configureTownMode(TOWN_MODES.LEGACY);}
});

test('the yard houses are home sites you can walk up to and into, clear of the passage',async()=>{
 configureTownMode(TOWN_MODES.PENINSULA);installDOM();
 try{
  const {buildYardHomes}=await import('../src/world/yard-homes.js');
  const world={group:new THREE.Group(),colliders:[]},sites=[],doors=[];
  buildYardHomes(world,{sites,register:(o,label,fn)=>doors.push({label,fn}),enter:site=>doors.entered=site.id});
  assert.deepEqual(sites.map(s=>s.id).sort(),['resident-home-aya','resident-home-kenji']);
  for(const s of sites){
   assert.deepEqual(s.homeOwners.length,2);
   const [x,,z]=s.door;assert.equal(townBoundsBlocked(x,z,.32),false,s.id+' door is on walkable ground');
   assert.ok(!world.colliders.some(c=>circleHitsRect(x,z,.32,c)),s.id+' door is not inside a house');
  }
  // The path from the lane gap and the passage beside Minato stay open.
  for(const [x,z] of [[-23.8,1.6],[-19.6,1.6],[-16.2,1.6],[-18,-4.2]])
   assert.ok(!world.colliders.some(c=>circleHitsRect(x,z,.32,c)),'clear at '+[x,z]);
  assert.equal(world.homes.get('Reiko').household,'resident-home-aya');
  doors.find(d=>/Kenji/.test(d.label)).fn();assert.equal(doors.entered,'resident-home-kenji');
 }finally{configureTownMode(TOWN_MODES.LEGACY);}
});
