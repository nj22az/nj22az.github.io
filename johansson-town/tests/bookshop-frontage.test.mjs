import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildJapaneseShop,preloadJapaneseTown} from '../src/world/japanese-town.js';
import {buildBicycle,BOOKSHOP_BICYCLE} from '../src/world/bicycle.js';
import {circleHitsRect} from '../physics.js?snappy=1';

test('the bookshop has one visible doorway and the bicycle leaves its approach clear',async()=>{
 installDOM();const original=globalThis.fetch;globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>{const url=String(input.url||input);return url.startsWith('blob:')?original(input):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));};
 try{
  assert.equal(await preloadJapaneseTown(),true);
  const parent=new THREE.Group(),site={id:'frontrow',side:1,z:30,title:'Front-Row Books',jp:'前列書房'};let entered;
  const shop=buildJapaneseShop({parent,site,label(){},register(o,label,fn){o.userData.hit=fn;},enter:s=>{entered=s.id;}});parent.updateMatrixWorld(true);
  const shoot=(x,y)=>{const origin=shop.lod.localToWorld(new THREE.Vector3(x,y,2)),direction=new THREE.Vector3(0,0,-1).transformDirection(shop.lod.matrixWorld);return new THREE.Raycaster(origin,direction).intersectObjects(shop.lod.children,true)[0]?.object;};
  for(const x of [1,1.45,2.1])for(const y of [.4,1.4,2.1])assert.equal(shoot(x,y)?.name,'frontrow-facade-infill','Original sliding door is covered at '+x+', '+y);
  let door=shoot(0,1.3);while(door&&door.name!=='frontrow-street-door')door=door.parent;assert.ok(door,'Centre entrance remains visible');
  shop.entrance.userData.hit();assert.equal(entered,'frontrow');
  const bike=buildBicycle(BOOKSHOP_BICYCLE);parent.add(bike.object);parent.updateMatrixWorld(true);
  assert.equal(bike.object.children.length,1,'Bicycle geometry is one render mesh');
  const bounds=new THREE.Box3().setFromObject(bike.object),size=bounds.getSize(new THREE.Vector3());assert.ok(bounds.min.y>-.001&&bounds.min.y<.025,'Tyres touch the pavement');
  assert.ok(size.y>.95&&size.y<1.15&&size.z>1.7&&size.z<1.95,'Adult commuter bicycle proportions');
  for(let x=4.4;x<=7.0;x+=.1)assert.equal(circleHitsRect(x,30,.32,bike.collider),false,'Bookshop entrance approach stays clear');
 }finally{globalThis.fetch=original;}
});
