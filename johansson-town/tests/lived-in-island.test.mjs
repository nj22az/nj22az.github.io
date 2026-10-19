import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {cargoVisit,buildCargoShipping,CARGO_CALLS} from '../src/world/cargo-shipping.js';
import {CARGO_BERTH} from '../src/world/minato-berth.js';
import {NEIGHBOURS} from '../src/people/neighbours.js';
import {recipeFor} from '../src/avatars/cast.js';
import {SHARED_DINING_BOUNDS as bounds,SHARED_DINING_FLOOR as floorPolygon,SHARED_DINING_COLLIDERS as colliders} from '../src/world/interiors/shared-dining-layout.js';
import {suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {circleHitsRect,sweepFraction} from '../physics.js';
import {SATO_COUNTER,SATO_LEDGE,SATO_CORNER} from '../src/world/sato-ramen-layout.js';
const blocked=(x,z)=>suppliedRoomBoundsBlocked({bounds,floorPolygon},x,z,.28)||colliders.some(c=>circleHitsRect(x,z,.28,c));
function reachable(from,to){const step=.15,q=[from],seen=new Set();for(let i=0;i<q.length&&i<30000;i++){const [x,z]=q[i];if(Math.hypot(x-to[0],z-to[1])<.22)return true;for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=+(x+dx).toFixed(3),nz=+(z+dz).toFixed(3),key=nx+','+nz;if(seen.has(key)||blocked(nx,nz))continue;seen.add(key);q.push([nx,nz]);}}return false;}
installDOM();
test('shared dining entrances reach both kitchens without crossing counters or solid walls',()=>{
 assert.equal(reachable([9.75,2.95],[8.6,-4.35]),true,'ramen east passage');
 assert.equal(reachable([0,5.4],[8.6,-4.35]),true,'Minato staff passage');
 assert.equal(reachable([9.75,2.95],[-.4,-4.8]),true,'shared kitchen connection');
 for(const s of [...SATO_COUNTER,...SATO_LEDGE,...SATO_CORNER])assert.equal(reachable([9.75,2.95],[s.stand[0],s.stand[2]]),true,'reachable '+s.stand);
 assert.equal(blocked(6.45,1),true,'the visible connecting wall is solid');assert.equal(blocked(8.4,-2.64),true,'counter solid');
 assert.ok(sweepFraction({x:8.4,z:-.7},{x:8.4,z:-4.3},(x,z)=>blocked(x,z))<1,'cannot glide through counter');
});
test('cargo ships arrive twice, stay alongside, depart continuously and reopen correctly',()=>{
 for(const c of CARGO_CALLS){assert.equal(cargoVisit(c.arrival).phase,'arriving');assert.equal(cargoVisit(c.alongside).phase,'alongside');assert.equal(cargoVisit(c.departure).phase,'departing');assert.equal(cargoVisit(c.gone).visible,false);}
 assert.equal(cargoVisit(720).visible,false);assert.notEqual(cargoVisit(480).name,cargoVisit(480+1440).name);
 const world={group:new THREE.Group()},service=buildCargoShipping(world);service.update(0,480);assert.equal(service.ship.visible,true);assert.equal(service.ship.position.z,CARGO_BERTH.z);service.update(0,CARGO_CALLS[0].arrival+.01);assert.ok(service.ship.position.z< -300,'She comes in from beyond sight');service.update(0,720);assert.equal(service.ship.visible,false);
});
test('the flower pavilion and its florist are gone (phase 4): no body, no builder; the bouquets are Sakura’s',async()=>{
 assert.equal(NEIGHBOURS.find(n=>n.name==='Mrs Kinjō'),undefined,'no florist body');
 await assert.rejects(import('../src/world/flower-shop.js'),'the pavilion has no builder any more');
 const {SAKURA_FLOWER_STAND}=await import('../src/world/okinawa/old-town.js');assert.ok(SAKURA_FLOWER_STAND.every(Number.isFinite));
 assert.equal(recipeFor('Hana').outfit.top,'sailor');assert.equal(recipeFor('Hana').outfit.bottom,'pleatedskirt');
});
