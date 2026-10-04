import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildCountryside,FIELDS,STEADS} from '../src/world/countryside.js';
import {routeAt} from '../src/world/layout.js';

// The open grass of the island is farmed now (sugar cane, vegetable plots, a farmstead,
// tombs), and none of it lands on a road, a path, a garden or another building.
test('the countryside fills the open grass and keeps off roads, paths and buildings',async()=>{
 installDOM();
 const world={group:new THREE.Group(),colliders:[{id:'house',x:-20,z:90,w:4,d:4,height:3}],islandTrees:[[10,0,240]]};
 const {placed,group}=buildCountryside({world});
 assert.ok(placed.cane>1500,'there is sugar cane: '+placed.cane);
 assert.ok(placed.crops>200,'there are vegetable plots: '+placed.crops);
 for(const kind of ['farmhouse','pen','tomb','trellis'])assert.ok(placed.steads.includes(kind),'no '+kind+' was placed');
 const p=new THREE.Vector3();let checked=0;
 group.traverse(o=>{
  if(o.name==='Field earth'){const m=new THREE.Matrix4();for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);p.setFromMatrixPosition(m);const r=routeAt(p.x,p.z);
   assert.ok(r?.surface==='grass'&&['peninsula-ground','island-uplands'].includes(r.id),`a field lies on ${r?.id} at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);
   assert.ok(!(Math.abs(p.x+20)<3&&Math.abs(p.z-90)<3),'a field lies on a building');
   assert.ok(Math.hypot(p.x-10,p.z-240)>2.4,'a field lies under a tree');checked++;}}
 });
 assert.ok(checked>500);
 for(const c of world.colliders.filter(c=>c.id==='countryside')){const r=routeAt(c.x,c.z);assert.ok(r?.surface==='grass','a countryside building stands on '+r?.id);}
 assert.ok(FIELDS.length>=5&&STEADS.length>=8);
});
