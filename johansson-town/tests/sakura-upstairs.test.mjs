import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';
import {circleHitsRect} from '../physics.js';
import {SAKURA_UPSTAIRS as U,sakuraUpperFloor,overlapsHeight,buildSakuraUpstairs} from '../src/world/sakura-upstairs.js';
import {createKit} from '../src/world/okinawa/kit.js';
test('stair ascends and descends without lifting walkers underneath',()=>{
 let y=0;
 for(let z=U.from;z<=U.to+.001;z+=.025){const next=sakuraUpperFloor(U.stairX,z,y);assert.notEqual(next,null);assert.ok(Math.abs(next-y)<.03);y=next;}
 assert.ok(Math.abs(y-U.floor)<.02);
 for(let z=U.to;z>=U.from;z-=.025){const next=sakuraUpperFloor(U.stairX,z,y);assert.notEqual(next,null);y=next;}
 assert.ok(y<.02);
 assert.equal(sakuraUpperFloor(U.stairX,U.doorZ,0),null);
 assert.equal(sakuraUpperFloor(-14,-28,0),null);
 assert.equal(sakuraUpperFloor(-14,-28,U.floor),U.floor);
});
test('actual town allows the complete stair, doorway, home and terrace route',async()=>{
 installDOM();globalThis.self=globalThis;configureTownMode(TOWN_MODES.PENINSULA);
 const {createTown}=await import('../src/world/town.js?sakura-upper-test');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),townMode:'peninsula',mobile:true,shadows:false,register(){},enter(){},onAction(){}});
 const path=[[U.stairX,U.from],[U.stairX,U.to],[U.stairX,U.doorZ],[-16,U.doorZ],[-14,-27.3],[-8.2,-27.3],[-8.2,-24],[-8.2,-27.3],[-14,-27.3],[-16,U.doorZ],[U.stairX,U.doorZ],[U.stairX,U.to],[U.stairX,U.from]];
 let y=0;
 for(let j=1;j<path.length;j++){
  const a=path[j-1],b=path[j],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.025);
  for(let i=1;i<=n;i++){
   const x=a[0]+(b[0]-a[0])*i/n,z=a[1]+(b[1]-a[1])*i/n;
   y=sakuraUpperFloor(x,z,y)??0;
   const hits=world.colliders.filter(c=>overlapsHeight(c,y)&&circleHitsRect(x,z,.28,c));
   assert.deepEqual(hits,[],`Blocked at ${x},${y},${z}: ${hits.map(c=>c.id)}`);
  }
 }
 assert.ok(y<.01);
 const shell=world.colliders.find(c=>c.id==='sakura-shop-shell');
 assert.equal(shell.height,4.01);assert.ok(overlapsHeight(shell,0));assert.ok(!overlapsHeight(shell,U.floor));
});
test('furniture is grounded, finite, guarded and merged into few meshes',()=>{
 const kit=createKit(),group=new THREE.Group(),colliders=[];
 buildSakuraUpstairs(kit,c=>colliders.push(c));
 const {meshes}=kit.finish(group,'Sakura home');
 assert.ok(meshes.length<=10,`${meshes.length} meshes`);
 for(const mesh of meshes)for(const value of mesh.geometry.attributes.position.array)assert.ok(Number.isFinite(value));
 for(const c of colliders.filter(c=>/^sakura-upper-/.test(c.id)))assert.ok(c.minY>=U.floor&&c.height>0);
 for(const id of ['sakura-landing-rail','sakura-landing-end','sakura-terrace-front','sakura-terrace-end'])assert.ok(colliders.some(c=>c.id===id&&c.minY===U.floor));
 for(const c of colliders.filter(c=>/bed$|kitchen$|table$|sewing-desk$/.test(c.id)))assert.equal(c.minY,U.floor);
});
