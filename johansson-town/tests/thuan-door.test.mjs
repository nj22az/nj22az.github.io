import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {RESIDENTS} from '../src/people/residents.js';
import {residentPlan} from '../src/people/social.js';
import {MARKET_DOOR,MARKET_THRESHOLD} from '../src/world/town-grid.js';
import {SAKURA_LAYOUT} from '../src/world/interiors/sakura-layout.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';

test('Thuan walks to the Konbini door instead of standing off and vanishing',()=>{
 const thuan=RESIDENTS.find(p=>p.name==='Thuan');
 const plan=residentPlan(thuan,600,false,{});
 assert.equal(plan.place,'market');
 assert.deepEqual(plan.target,[...MARKET_THRESHOLD]);
 const toDoor=Math.hypot(plan.target[0]-MARKET_DOOR[0],plan.target[1]-MARKET_DOOR[1]);
 const toStand=Math.hypot(thuan.work[0]-MARKET_DOOR[0],thuan.work[1]-MARKET_DOOR[1]);
 assert.ok(toDoor<toStand,'Commute ends at the opening, not the old stand-off');
 assert.ok(Math.hypot(thuan.work[0]-MARKET_DOOR[0],thuan.work[1]-MARKET_DOOR[1])>=1.35,'Outdoor work stand stays off the player door');
});

test('a newly arrived clerk starts at the shop door and walks to the till',()=>{
 const profile=RESIDENTS.find(p=>p.name==='Thuan');
 const g=new T.Group();g.userData={name:'Thuan',hit:{inside:false},indoors:'market',justArrived:true};
 g.position.set(MARKET_THRESHOLD[0],0,MARKET_THRESHOLD[1]);
 const parent=new T.Group();
 const world={people:[{profile,g}]};
 const indoor=createIndoorResidents({world,parent,place:'market',layout:SAKURA_LAYOUT,collides:()=>false});
 indoor.sync(600,0);
 assert.equal(g.parent,parent);
 assert.ok(Math.hypot(g.position.x-SAKURA_LAYOUT.entrance[0],g.position.z-SAKURA_LAYOUT.entrance[2])<.01,'Spawn on the interior side of the door');
 assert.ok(Math.hypot(g.position.x-SAKURA_LAYOUT.staff[0],g.position.z-SAKURA_LAYOUT.staff[2])>2,'Do not snap to the till');
 let crossed=false;
 for(let i=0;i<240;i++){
  indoor.sync(600,1/30);
  if(Math.hypot(g.position.x-SAKURA_LAYOUT.staff[0],g.position.z-SAKURA_LAYOUT.staff[2])<.2){crossed=true;break;}
 }
 assert.ok(crossed,'Walk from the door to the counter');
});
