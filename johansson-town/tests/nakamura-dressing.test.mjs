import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {standingHitsRect,circleHitsRect} from '../physics.js';

/**
 * Nakamura Zenzai's makeover (the owner, 21 October 2026: "the ice cream shop looks abhorrent as it is"): every new thing
 * has its who and why, the signs are Japanese and come from the game's own names and menu, what follows the hours does,
 * and nothing new stands in anybody's way.
 */
installDOM();globalThis.self=globalThis;
const {NAKAMURA_DRESSING,NAKAMURA_LEFT_OUT,NAKAMURA_OPEN_SIGNS,NAKAMURA_TABLE,NAKAMURA_PARASOL,kanjiPrice,nakamuraFrontage}=await import('../src/world/okinawa/nakamura-dressing.js');
const {NAKAMURA_MENU,BLUE_CORAL,dessertShopOpen}=await import('../src/world/blue-coral-shop.js');
const {japaneseSign}=await import('../src/world/okinawa/signs.js');
const {nakamuraPoint,NAKAMURA_GO_HOME}=await import('../src/world/nakamura-plan.js');
const {HARBOUR_PARK_PATHS,parkPathAt}=await import('../src/world/harbour-park-plan.js');

test('every new thing says who it is for, why it is there and what period it is true to',()=>{
 const ids=new Set();
 for(const d of NAKAMURA_DRESSING){
  assert.ok(!ids.has(d.id),d.id);ids.add(d.id);
  for(const key of ['who','why','period'])assert.ok(typeof d[key]==='string'&&d[key].length>=(key==='who'?3:20),`${d.id} ${key}`);
  assert.ok(['building','prop','open-hours'].includes(d.build),d.id);assert.equal(d.at.length,3,d.id);
 }
 for(const id of ['noren','lanterns','parasol'])assert.equal(NAKAMURA_DRESSING.find(d=>d.id===id).build,'open-hours');
 assert.deepEqual(Object.keys(NAKAMURA_OPEN_SIGNS).sort(),['lanterns','noren','parasol']);
 for(const l of NAKAMURA_LEFT_OUT)assert.ok(l.suggestion&&l.why.length>20,l.suggestion);
});

test('the shop’s signs are Japanese, from the names and the menu the game already has',()=>{
 assert.equal(japaneseSign('Nakamura Zenzai'),'中村ぜんざい');
 assert.equal(japaneseSign('Zenzai'),'ぜんざい');
 assert.equal(japaneseSign('Nakamura'),'中村');
 for(const p of NAKAMURA_MENU)assert.notEqual(japaneseSign(p.item),p.item,`${p.item} has a tag`);
 assert.equal(kanjiPrice(250),'二五〇円');assert.equal(kanjiPrice(100),'一〇〇円');
 assert.deepEqual(NAKAMURA_MENU.map(p=>p.cost),[250,120,150,120,100],'the prices are the game’s');
});

test('the noren, the lanterns and the parasol follow the counter’s hours',()=>{
 const f=nakamuraFrontage({menu:NAKAMURA_MENU,hours:BLUE_CORAL});
 const at=minutes=>{f.update(minutes,dessertShopOpen(minutes));return {noren:f.noren.visible,parasol:f.parasol.visible,lamp:f.lanterns.emissiveIntensity,canopyMinY:f.canopy.minY};};
 assert.deepEqual(at(9*60),{noren:false,parasol:false,lamp:0,canopyMinY:1e3},'not yet open');
 assert.deepEqual(at(12*60),{noren:true,parasol:true,lamp:0,canopyMinY:NAKAMURA_PARASOL.rim},'open at noon, lanterns dark by day');
 const dusk=at(18*60+30);assert.equal(dusk.noren,true);assert.ok(dusk.lamp>.5,'lit at dusk while she is serving');
 assert.deepEqual(at(19*60+30),{noren:false,parasol:false,lamp:0,canopyMinY:1e3},'closed: taken in and dark');
 // People walk under the canopy; the camera does not go through it.
 const c={...f.canopy,minY:NAKAMURA_PARASOL.rim};
 assert.equal(standingHitsRect(c.x,c.z,.3,0,c),false,'a person stands under the parasol');
 assert.ok(c.minY>1.9,'its rim is over anyone’s head');
});

test('the parasol table is at the dessert bench’s shop end, and the bench is still free to sit at',()=>{
 const [x,,z]=nakamuraPoint(...NAKAMURA_TABLE);
 assert.ok(Math.abs(x-7.3)<.01&&Math.abs(z+16.25)<.01,'world 7.3, -16.25');
 const bench={x:7.3,z:-17.6,w:.44,d:1.4};
 assert.ok(z-.28>bench.z+bench.d/2+.3,'a clear gap between table and bench');
});

test('nothing new stands in a route, a prompt, the family’s way home or a park path',async()=>{
 const {createTown}=await import('../src/world/town.js');
 const {createIslandBusinesses}=await import('../src/world/businesses.js');
 const prompts=[],world=createTown({scene:new THREE.Scene(),sites:createIslandBusinesses(),mobile:true,shadows:false,kitano:'distant',register:(o,label)=>prompts.push({o,label}),enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 const mine=world.colliders.filter(c=>/^nakamura-(planter|crates|hibiscus|back-step|gas|bench-table)$/.test(c.id));
 assert.equal(mine.length,6);
 for(const v of NAKAMURA_GO_HOME)assert.equal(mine.some(c=>standingHitsRect(v[0],v[2],.30,v[1],c)),false,'way home '+v);
 for(const p of prompts){const v=p.o.getWorldPosition(new THREE.Vector3());if(Math.hypot(v.x-9.5,v.z+12)>14)continue;
  assert.equal(mine.some(c=>standingHitsRect(v.x,v.z,.30,0,c)),false,p.label);}
 // The bench's own stand point (quarters.js) and the park's paths.
 assert.equal(mine.some(c=>standingHitsRect(6.5,-17.6,.30,0,c)),false,'the bench stand point');
 for(const c of mine)for(const [dx,dz] of [[0,0],[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]){
  const x=c.x+dx*c.w,z=c.z+dz*c.d;assert.equal(parkPathAt(x,z),null,`${c.id} on ${parkPathAt(x,z)?.id}`);
 }
 assert.ok(HARBOUR_PARK_PATHS.length>0);
 // The street's own: the pavement in front of the counter stays clear (tests/nakamura-display.test.mjs's sweep line).
 for(let z=-12;z<=-8.5;z+=.1)assert.equal(mine.some(c=>circleHitsRect(4.5,z,.28,c)),false,'pavement '+z.toFixed(1));
 // The canopy is a camera-only collider while the parasol is up.
 assert.ok(world.colliders.some(c=>c.id==='nakamura-parasol-canopy'));
});
