import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createBeerService,DRINKS,IZAKAYA_PLAYER_SEATS,NAO_STATION} from '../src/people/izakaya-beer.js';

test('Nao pours, walks the drink over, sets it down and goes back to the counter',()=>{
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
 assert.ok(said.some(t=>/オリオン/.test(t)));
 let last;for(let i=0;i<DRINKS.draft.sips;i++)last=beer.sip();
 assert.equal(last.left,0);assert.ok(last.alcohol>0);
});

test('the route Nao walks stays out of the counter and the koagari',()=>{
 // Colliders from world/izakaya.js: the counter and the raised tatami.
 const counter={x:-.8,z:-2.64,w:8.4,d:1.43},koagari={x:5.3,z:1.8,w:2,d:5.4};
 const hit=(c,x,z,r=.25)=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r;
 for(const seat of Object.values(IZAKAYA_PLAYER_SEATS)){
  const pts=[[NAO_STATION[0],NAO_STATION[2]],...seat.route];
  for(let i=1;i<pts.length;i++)for(let k=0;k<=20;k++){const x=pts[i-1][0]+(pts[i][0]-pts[i-1][0])*k/20,z=pts[i-1][1]+(pts[i][1]-pts[i-1][1])*k/20;
   assert.ok(!hit(counter,x,z)&&!hit(koagari,x,z),`${seat.id} route clear at ${x.toFixed(2)},${z.toFixed(2)}`);}
 }
});
