import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js';
import {createBusinesses} from '../src/world/businesses.js';
import {circleHitsRect} from '../physics.js';
import {buildFamilyHome} from '../src/world/interiors/family-home.js';
import {buildYardHomeInterior} from '../src/world/interiors/yard-home.js';
import {buildPortHall} from '../src/world/interiors/port-hall.js';
import {buildAirportArrivals} from '../src/world/interiors/airport-arrivals.js';
import {buildOfficeShell,buildOfficeWorkplace} from '../src/world/interiors/office-workplace.js';
import {buildMayorOffice,buildMayorHome} from '../src/world/interiors/town-hall.js';
import {PARK_BENCH,PARK_BENCH_FIT,benchPoint,activePark} from '../src/world/park-layout.js';

function validateSeats(root,targets,colliders,{streamed=new Set()}={}){
 root.updateMatrixWorld(true);
 const ray=new THREE.Raycaster();
 for(const {object,label} of targets){
  const seat=object.userData.seat;if(!seat)continue;
  assert.ok(Number.isFinite(seat.surfaceY),label+' has an authored support surface');
  assert.ok(seat.position.every(Number.isFinite)&&seat.stand.every(Number.isFinite),label+' has finite seat and stand positions');
  assert.ok(Number.isFinite(seat.yaw),label+' has an authored facing direction');
  const [x,y,z]=seat.stand;
  const blockers=colliders.filter(c=>(c.minY??0)<y+1.6&&(c.minY??0)+(c.height??10)>y+.2&&circleHitsRect(x,z,.25,c));
  assert.equal(blockers.length,0,label+' can stand clear of solid furniture');
  if(streamed.has(label))continue;
  ray.set(new THREE.Vector3(seat.position[0],seat.surfaceY+.025,seat.position[2]),new THREE.Vector3(0,-1,0));ray.far=.08;
  const hit=ray.intersectObject(root,true).find(h=>h.face?.normal.clone().transformDirection(h.object.matrixWorld).y>.65);
  assert.ok(hit,label+' sits over a physical surface');
  assert.ok(Math.abs(hit.point.y-seat.surfaceY)<.015,label+' support height matches the physical seat');
 }
}

function fixture(build){
 installDOM();const room=new THREE.Group(),targets=[],colliders=[];
 const reg=(object,label)=>targets.push({object,label});
 build({room,reg,action(){},onReturn(){},collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height})});
 return {room,targets,colliders};
}

test('every outdoor public seat has physical support and a clear standing point',()=>{
 installDOM();const targets=[];
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),mobile:true,shadows:false,register:(object,label)=>targets.push({object,label}),enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 const seats=targets.filter(t=>t.object.userData.seat);
 assert.ok(seats.length>=25,'Public benches and airport gates all offer usable seats');
 validateSeats(world.group,seats,world.colliders,{streamed:new Set(['Soak your feet in the footbath','Cool off on the bench'])});
 assert.equal(PARK_BENCH.yaw,Math.PI/2,'Harbour bench faces away from its east backrest');
 const p=activePark();assert.ok(Math.abs(PARK_BENCH.surfaceY-(p.lift+benchPoint(0,PARK_BENCH_FIT.seat,0)[1]*p.scale))<1e-9);
 const kitahama=seats.find(t=>t.object.userData.seat.id==='kitahama-park-bench');assert.equal(kitahama.object.userData.seat.yaw,Math.PI/2);
});

test('every ferry hall chair and arrivals bench is usable at its true surface',()=>{
 for(const [build,count] of [[buildPortHall,10],[buildAirportArrivals,2]]){
  const f=fixture(build),seats=f.targets.filter(t=>t.object.userData.seat);
  assert.equal(seats.length,count);
  validateSeats(f.room,seats,f.colliders);
 }
});

test('office chairs, visitor sofas and floor cushions have explicit physical seats',()=>{
 for(const build of [args=>{buildOfficeShell(args.room);buildOfficeWorkplace(args);},buildMayorOffice,buildMayorHome]){
  const f=fixture(build),seats=f.targets.filter(t=>t.object.userData.seat);
  assert.ok(seats.length>=3);
  validateSeats(f.room,seats,f.colliders);
 }
});


test('every household chair and tea cushion supports visitors with a clear stand point',()=>{
 for(const kind of ['concrete','red-tile'])for(const residents of [null,['Thuan','Thao']]){
  const f=fixture(args=>buildFamilyHome({...args,kind,residents,household:{members:[{name:'A',purpose:'farmer'}]}}));
  const seats=f.targets.filter(t=>t.object.userData.seat);assert.ok(seats.length>=4);
  validateSeats(f.room,seats,f.colliders);
  for(const {object} of seats){const [x,,z]=object.userData.seat.stand;assert.ok(x>=-2.9&&x<=2.9&&z>=-2.5&&z<=2.5,'Standing leaves space inside the house walls');}
 }
 for(const [id,homeOwner] of [['resident-home-aya','Nhung'],['resident-home-kenji','Chin']]){
  const f=fixture(args=>buildYardHomeInterior({...args,site:{id,homeOwner}}));
  validateSeats(f.room,f.targets,f.colliders);
 }
});
