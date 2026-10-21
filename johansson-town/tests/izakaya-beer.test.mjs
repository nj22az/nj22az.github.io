import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBeerService,DRINKS,IZAKAYA_PLAYER_SEATS,NAO_STATION} from '../src/people/izakaya-beer.js';

test('Thao pours, walks the drink over, sets it down and goes back to the counter',()=>{
 const room=new THREE.Group(),nao=new THREE.Group(),said=[];nao.position.set(...NAO_STATION);
 const beer=createBeerService({room,getNao:()=>nao,blocked:()=>false,say:t=>said.push(t)});
 const seat=IZAKAYA_PLAYER_SEATS.table;
 assert.equal(beer.order('draft',seat),true);assert.equal(beer.order('can',seat),false,'one at a time');
 let carried=false,phases=new Set();
 for(let i=0;i<1200&&beer.pending;i++){beer.update(1/30);phases.add(beer.pending?.phase);if(nao.userData.heldItem==='beer')carried=true;}
 assert.ok(carried,'she carries it');assert.deepEqual([...phases].filter(Boolean),['pouring','carrying','placing','bowing','returning']);
 assert.ok(Math.hypot(nao.position.x-NAO_STATION[0],nao.position.z-NAO_STATION[2])<.05,'back at her station');
 assert.equal(nao.userData.playerService,undefined);
 assert.deepEqual(beer.drink,{kind:'draft',left:DRINKS.draft.sips,sips:DRINKS.draft.sips});
 assert.ok(said.some(t=>/Orion/.test(t)));
 let last;for(let i=0;i<DRINKS.draft.sips;i++)last=beer.sip();
 assert.equal(last.left,0);assert.ok(last.alcohol>0);
});

test('a dish is cooked at its station, carried across the counter, and eaten a bite at a time',async()=>{
 const {DISHES,KITCHEN_STATIONS,MINATO_MENU}=await import('../src/people/izakaya-beer.js');
 const room=new THREE.Group(),nao=new THREE.Group(),said=[];nao.position.set(...NAO_STATION);
 const service=createBeerService({room,getNao:()=>nao,blocked:()=>false,say:t=>said.push(t)});
 const seat=IZAKAYA_PLAYER_SEATS.counter2;
 assert.equal(service.order('karaage',seat),true);
 let atFryer=false;const phases=new Set();
 for(let i=0;i<3000&&service.pending;i++){service.update(1/30);phases.add(service.pending?.phase);
  const f=KITCHEN_STATIONS.fryer;if(Math.hypot(nao.position.x-f[0],nao.position.z-f[2])<.05&&nao.userData.socialPose==='Use')atFryer=true;}
 assert.ok(atFryer,'she fries it at the fryer');assert.deepEqual([...phases].filter(Boolean),['cooking','carrying','placing','bowing','returning']);
 assert.deepEqual(service.dish,{kind:'karaage',left:DISHES.karaage.bites,bites:DISHES.karaage.bites});
 assert.equal(service.drink,null,'food and drink have their own places on the table');
 let last;for(let i=0;i<DISHES.karaage.bites;i++)last=service.bite();assert.equal(last.left,0);
 assert.equal(MINATO_MENU.length,16,'everything on the wall can be ordered');
 service.clear();
});
