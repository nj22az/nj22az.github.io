import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {cargoVisit,buildCargoShipping,CARGO_CALLS} from '../src/world/cargo-shipping.js';
import {buildFlowerShop,FLOWER_SHOP} from '../src/world/flower-shop.js';
import {shoppingLanePoint,SHOPPING_LANE_ROWS} from '../src/world/shopping-lane-plan.js';
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
 const world={group:new THREE.Group()},service=buildCargoShipping(world);service.update(0,480);assert.equal(service.ship.visible,true);assert.equal(service.ship.position.z,-56);service.update(0,420);assert.equal(service.ship.position.z,-146);service.update(0,720);assert.equal(service.ship.visible,false);
});
test('flower shop uses the existing Mrs Kinjō actor and preserves a walkable shop entrance',()=>{
 const world={colliders:[]},group=new THREE.Group(),prompts=[],actions=[];buildFlowerShop({world,group,register:(o,label,fn)=>prompts.push({label,fn}),onAction:(...args)=>actions.push(args)});
 const staff=NEIGHBOURS.filter(n=>n.name===FLOWER_SHOP.staff);assert.equal(staff.length,1);assert.deepEqual(staff[0].at,FLOWER_SHOP.staffAt);assert.match(staff[0].role,/flowers/);
 for(let x=94;x<=100.2;x+=.25){const [px,pz]=shoppingLanePoint(x,SHOPPING_LANE_ROWS[0]);assert.ok(!world.colliders.some(c=>circleHitsRect(px,pz,.32,c)),'walkable at '+px);}
 prompts.find(p=>p.label==='Buy a Rainflower bouquet · ¥250').fn();assert.equal(actions.at(-1)[2].cost,250);
 assert.equal(recipeFor('Hana').outfit.top,'sailor');assert.equal(recipeFor('Hana').outfit.bottom,'pleatedskirt');
});
