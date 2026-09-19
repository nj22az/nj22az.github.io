import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildJapaneseShop,preloadJapaneseTown} from '../src/world/japanese-town.js';
import {buildBicycle,BOOKSHOP_BICYCLE} from '../src/world/bicycle.js';
import {circleHitsRect} from '../physics.js?snappy=1';
import {buildWestShop,WEST_SHOPS,WEST_FRONT} from '../src/world/west-shops.js';

test('the wooden frontage is closed between each display window and corner post',()=>{
 installDOM();
 const parent=new THREE.Group();
 buildWestShop({parent,site:{id:'frontrow',title:'Front-Row Books & Workshop',jp:'前列書房・工房'},colliders:[],register(){},enter(){},label(){}});
 parent.updateMatrixWorld(true);
 for(const side of [-1,1])for(const y of [.3,.75,1.5,2.5])for(let edge=4.18;edge<=4.42;edge+=.02){
  const origin=new THREE.Vector3(WEST_FRONT+2,y,WEST_SHOPS.frontrow.z+side*edge);
  const hits=new THREE.Raycaster(origin,new THREE.Vector3(-1,0,0)).intersectObject(parent,true);
  const opaque=hits.find(hit=>!hit.object.material.transparent);
  assert.ok(opaque&&opaque.point.x>=WEST_FRONT-.25,'Solid frontage at side '+side+', height '+y+', edge '+edge);
 }
});

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

test('the bookshop roof sits on the bookshop rather than over the road',async()=>{
 installDOM();globalThis.self=globalThis;
 const THREE=await import('../vendor/three.module.js');
 const {configureTownMode,TOWN_MODES}=await import('../src/world/town-mode.js');
 const {buildWestShop,WEST_SHOPS,WEST_FRONT}=await import('../src/world/west-shops.js?roof');
 configureTownMode(TOWN_MODES.PENINSULA);
 try{
  const parent=new THREE.Group(),colliders=[];
  buildWestShop({parent,site:{id:'frontrow',title:'Front-Row Books',jp:'前列書房'},
   colliders,register(){},enter(){},label(){}});
  parent.updateMatrixWorld(true);
  const plot=WEST_SHOPS.frontrow,back=WEST_FRONT-plot.depth;
  const roofs=[];
  parent.traverse(o=>{if(o.isMesh&&o.geometry?.type==='ExtrudeGeometry')roofs.push(o);});
  assert.equal(roofs.length,1,'The bookshop has '+roofs.length+' pitched roofs');
  const box=new THREE.Box3().setFromObject(roofs[0]);
  // A pitch is extruded along one axis and it is easy to send it along the wrong one.
  // Turned the wrong quarter, this one ran five metres out across the pavement and the
  // carriageway and hung there with nothing under it, while the shop stood bare.
  assert.ok(box.min.x<WEST_FRONT,'The roof starts in front of the shop it belongs to');
  assert.ok(box.max.x<=WEST_FRONT+.6,'The roof hangs out over the road');
  assert.ok(box.min.x>=back-.6,'The roof runs out past the back wall');
  // and it covers the building rather than clipping a corner of it.
  const covered=Math.min(box.max.x,WEST_FRONT)-Math.max(box.min.x,back);
  assert.ok(covered>plot.depth*.9,'The roof covers only '+covered.toFixed(1)+'m of a '+plot.depth+'m building');
  assert.ok(box.min.y>2,'The roof is on the floor');
 }finally{configureTownMode(TOWN_MODES.LEGACY);}
});
