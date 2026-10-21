// The ferry takes one car at a time, so only one car is ever in her hands (town-traffic.js mayStage). On 21 October
// Tetsuo's 11:30 cargo run waited at the town stage, on the off-ramp's way up the quay, while Thao's late truck came off
// the ramp behind it: each waited for the other all afternoon and Tetsuo never got to Higa Liquor's bench.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {createTownTraffic} from '../src/world/town-traffic.js';
import {ferryServiceFixture} from './ferry-service-fixture.mjs';
import {QUICK_CROSSING} from '../src/world/ferry-quick-crossing.js';

const inHands=v=>v.location==='aboard'||!!v.transfer||v.location==='waiting-ferry'||v.location==='driving'&&!!v.destination;

test('a day of errands: never two cars in the ferry’s hands, and every car home with its driver before the evening',()=>{
 // From just before Thao's dry-goods run (10:00), through Tetsuo's cargo run (11:30–12:30), Mrs Sato's and Nhung's.
 const s=ferryServiceFixture({minute:598}),q=QUICK_CROSSING.town;
 s.player.position.set(q.stand[0],q.ground,q.stand[1]);
 const people=['Tetsuo','Harbour master','Thao','Mrs Sato','Nhung'].map(name=>{const g=new T.Group();g.userData.name=name;g.position.set(-30,0,30);s.group.add(g);return {g,profile:{name}};});
 s.world.people.push(...people);
 const cars=createTownTraffic({parent:s.group,colliders:s.world.colliders,ferry:s.run,people:()=>s.world.people,getPlayerPosition:()=>s.player.position});
 s.world.traffic=cars;
 const crossed=new Set();let most=0;
 while(s.minutes<18*60){
  s.tick(1);
  const snap=cars.snapshot(),busy=snap.filter(inHands);most=Math.max(most,busy.length);
  assert.ok(busy.length<=1,'two cars in the ferry’s hands at '+s.minutes.toFixed(1)+': '+JSON.stringify(busy.map(v=>[v.owner,v.location,v.transfer])));
  for(const v of snap)if(v.location==='aboard')crossed.add(v.owner);
 }
 assert.equal(most,1,'the errands used the ferry');
 for(const name of ['Thao','Tetsuo','Mrs Sato','Nhung'])assert.ok(crossed.has(name),name+'’s errand crossed');
 // The harbour agent works Minato's lines (ferry-shore-crew.js): his car never takes him aboard.
 assert.ok(!crossed.has('Harbour master'),'the line hand stays on the quay');
 const snap=cars.snapshot();
 for(const v of snap){
  assert.equal(v.location,cars.islanders.some(i=>i.id===v.id)?'quay':'airport',v.owner+' is parked at home, not '+v.location);
  assert.equal(v.occupied,false,v.owner+'’s driver is out of the cab');
 }
 assert.equal(cars.drivers.has(cars.islanders[0]),false,'Tetsuo is his own man again, free for the bench at half past six');
});
