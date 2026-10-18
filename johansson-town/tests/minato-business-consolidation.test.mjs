import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildFlowerShop,FLOWER_SHOP,flowerShopOpen} from '../src/world/flower-shop.js';
import {buildBlueCoralShop,dessertShopOpen} from '../src/world/blue-coral-shop.js';
import {NEIGHBOURS,createNeighbours} from '../src/people/neighbours.js';
import {kitahamaHomeFor} from '../src/world/kitahama-layout.js';
import {HARBOUR_PARK_STUDY,NAKAMURA_DESSERTS} from '../src/world/harbour-park-plan.js';
import {circleHitsRect} from '../physics.js';

test('every florist purchase uses the same opening hours and the public counter stays clear',()=>{
 installDOM();const world={group:new THREE.Group(),colliders:[]},prompts=[],actions=[];
 const shop=buildFlowerShop({world,register:(object,label,run)=>prompts.push({object,label,run}),onAction:(...args)=>actions.push(args)});
 const orders=prompts.filter(p=>/Buy|Order/.test(p.label));assert.equal(orders.length,2);
 for(const [minute,kind] of [[539,'read'],[540,'buy'],[1079,'buy'],[1080,'read'],[1980,'buy']]){shop.update(minute);for(const p of orders){p.run();assert.equal(actions.at(-1)[0],kind,p.label+' at '+minute);if(kind==='buy')assert.equal(actions.at(-1)[2].cost,250);}}
 assert.equal(flowerShopOpen(-1),false);assert.equal(world.landmarks[0].id,'rainflower-florist');assert.equal(world.landmarks[0].owner,'Mrs Kinjō');
 for(const p of prompts)assert.equal(world.colliders.some(c=>circleHitsRect(p.object.position.x,p.object.position.z,.32,c)),false,'Accessible prompt '+p.label);
 assert.equal(world.colliders.some(c=>circleHitsRect(...FLOWER_SHOP.staffAt,.32,c)),false,'Owner stands behind a visible clear counter');
});

test('Nakamura serves the preserved Blue Coral items and soda through one hours-aware menu',()=>{
 installDOM();const world={group:new THREE.Group(),colliders:[]},prompts=[],actions=[];
 const shop=buildBlueCoralShop({world,register:(object,label,run)=>prompts.push({object,label,run}),onAction:(...args)=>actions.push(args)});
 assert.equal(prompts.length,2);assert.equal(shop.merged,true);assert.equal(world.colliders.length,0);assert.ok(world.landmarks.some(p=>p.id==='nakamura'));assert.ok(world.landmarks.some(p=>p.id==='home-nakamura'));
 shop.update(600);prompts[0].run();assert.equal(actions[0][0],'dessert-menu');assert.deepEqual(actions[0][2].map(p=>[p.item,p.cost]),[['Zenzai',250],['Sata andagi',120],['Blue Coral ice cream',150],['Green tea',120],['Cold island soda',100]]);
 shop.update(1140);for(const p of prompts){p.run();assert.equal(actions.at(-1)[0],'read');}assert.equal(dessertShopOpen(1139),true);assert.equal(dessertShopOpen(1140),false);
 assert.equal(NEIGHBOURS.filter(n=>n.name==='Mrs Nakamura').length,1);assert.deepEqual(NEIGHBOURS.find(n=>n.name==='Mrs Nakamura').at,NAKAMURA_DESSERTS.staffAt);
});

test('Vy and Riku have their canonical homes, scheduled school absences and real park destinations',()=>{
 installDOM();const attached=[],neighbours=createNeighbours({parent:new THREE.Group(),characters:{attach:(g,look,height)=>attached.push({name:g.name,look,height})}});
 for(const name of ['Vy','Riku']){const person=neighbours.people.find(p=>p.spec.name===name);assert.deepEqual(person.spec.home,kitahamaHomeFor(name).door);assert.ok(person.spec.routine.some(r=>r.away&&r.role==='at school'));}
 neighbours.update(.016,720);for(const name of ['Vy','Riku']){const g=neighbours.people.find(p=>p.spec.name===name).g;assert.equal(g.visible,false);assert.equal(g.userData.scheduledAway,true);assert.equal(g.userData.activity,'at school');}
 neighbours.update(.016,980);const vy=neighbours.people.find(p=>p.spec.name==='Vy');assert.deepEqual(vy.routine.at,HARBOUR_PARK_STUDY[0]);assert.equal(vy.g.userData.scheduledAway,false);
 const riku=attached.find(p=>p.name==='Riku');assert.equal(riku.look,'Riku');assert.equal(riku.height,1.32);assert.equal(NEIGHBOURS.find(n=>n.name==='Riku').walk,undefined,'A nine-year-old is not the adult cargo-route worker');
});

test('the original Nakamura zenzai and sata-andagi prompts obey the same shared-counter hours',async()=>{
 installDOM();const {buildOkinawaQuarters}=await import('../src/world/okinawa/quarters.js');
 const world={group:new THREE.Group(),colliders:[],minutes:720},prompts=[],actions=[];
 buildOkinawaQuarters(world,{register:(object,label,run)=>prompts.push({label,run}),onAction:(...args)=>actions.push(args)});
 const orders=prompts.filter(p=>['Buy a zenzai','Buy sata andagi'].includes(p.label));assert.equal(orders.length,0,'The unified counter owns orders; no overlapping legacy prompts');
 for(const [minutes,kind] of [[599,'read'],[600,'buy'],[1139,'buy'],[1140,'read']]){world.minutes=minutes;for(const p of orders){p.run();assert.equal(actions.at(-1)[0],kind,p.label+' at '+minutes);}}
});
