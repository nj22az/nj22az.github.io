import test from 'node:test';import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildSakuraRebuild} from '../src/world/interiors/sakura-rebuild.js';
import {circleHitsRect} from '../physics.js';
import {createRoomWalk} from '../src/people/room-walk.js';
import {PRODUCTS} from '../src/commerce/products-data.js';

test('candidate retains catalogue keys, counted slots and stock depletion; supports real room routes',async()=>{
 installDOM();const room=new THREE.Group(),display=buildSakuraRebuild({room,reg(){},action(){},exit(){}});
 assert.equal(display.unitPositions.size,780);assert.equal(display.unitApproaches.size,780);
 assert.deepEqual(display.stock.records.map(p=>p.id).sort(),PRODUCTS.map(p=>p.id).sort());
 const blocked=(x,z,r=.36)=>display.layout.colliders.some(c=>circleHitsRect(x,z,r,c));
 for(const p of [...display.layout.queue,...display.layout.browse])assert.equal(blocked(p.x,p.z),false,p.id+' is blocked');
 for(const id of PRODUCTS.map(p=>p.id)){
  const p=display.unitApproaches.get(id+':0');assert.equal(blocked(p[0],p[2]),false,id+' approach blocked');
 }
 for(const destination of [...display.layout.browse.map(p=>[p.x,0,p.z]),display.layout.staffApproach,display.layout.stockroom,...PRODUCTS.map(p=>display.unitApproaches.get(p.id+':0'))]){
  const person={g:new THREE.Group(),profile:{name:'probe',age:35}};person.g.position.set(...display.layout.entrance);
  const walk=createRoomWalk(blocked,{bounds:display.layout.bounds,radius:.36,smoothTurn:true});let arrived=false;
  for(let i=0;i<6000&&!arrived;i++)arrived=walk.move(person,destination,.05);
  assert.ok(arrived,'route to '+destination);assert.equal(blocked(person.g.position.x,person.g.position.z,.36),false);
 }
 const chips=room.getObjectByName('Sakura chips goods'),m=new THREE.Matrix4(),s=new THREE.Vector3();
 display.updateStock(Object.fromEntries(PRODUCTS.map(p=>[p.id,{shelf:0}])));let shown=0;
 for(let i=0;i<chips.count;i++){chips.getMatrixAt(i,m);s.setFromMatrixScale(m);if(s.x>0)shown++;}
 assert.equal(shown,chips.count-24);
 display.updateStock(Object.fromEntries(PRODUCTS.map(p=>[p.id,{shelf:p.capacity}])));
 chips.getMatrixAt(0,m);s.setFromMatrixScale(m);assert.equal(s.x,1);
 assert.equal(display.refrigerator.hold(7,1),true);assert.ok(display.refrigerator.doors[7].door.rotation.y<0);
 display.frontDoor.set(1);assert.equal(display.frontDoor.amount,1);display.frontDoor.set(null);
 assert.ok(room.getObjectByName('Sakura cash drawer'));assert.ok(display.layout.candidate);
});

test('candidate price tickets match catalogue, stay clear of products, and calendar refresh works',()=>{
 installDOM();const room=new THREE.Group(),display=buildSakuraRebuild({room,reg(){},action(){},exit(){}});
 const labels=display.advertising.labels,prices=labels.filter(l=>l.kind==='price'),cards=labels.filter(l=>l.kind!=='price');
 assert.equal(prices.length,96);assert.equal(cards.length,9);assert.equal(cards.filter(c=>c.kind==='starburst').length,6);
 for(const tag of cards.filter(c=>c.kind==='starburst'))assert.equal(tag.outline_mm.length,24);
 for(const tag of labels){
  const shelf=display.productShelves[tag.id];assert.ok(Math.abs(tag.along)+tag.width/2<=shelf.width/2,tag.id+' leaves its bay');
  assert.ok(tag.position[1]+tag.height/2<tag.level,tag.id+' rises over deck');
  const geometry=new THREE.PlaneGeometry(tag.width,tag.height);geometry.rotateY(tag.yaw);geometry.translate(...tag.position);geometry.computeBoundingBox();
  for(const e of display.stock.envelopes){
   const box=new THREE.Box3(new THREE.Vector3(...e.min).add(new THREE.Vector3(-6.95,0,3.91)),new THREE.Vector3(...e.max).add(new THREE.Vector3(-6.95,0,3.91)));
   assert.equal(geometry.boundingBox.intersectsBox(box),false,tag.id+' overlaps '+e.id);
  }
  geometry.dispose();
 }
 for(const p of PRODUCTS.filter(p=>p.cells.price!=null))assert.ok(prices.filter(l=>l.id===p.id).every(l=>l.price===p.price),p.id+' price differs');
 display.tick(0,295*1440+740);display.tick(0,0);display.tick(0);
});

test('wall dressing follows all 20 CAD placements and live shop/calendar data; gondolas retain datums',async()=>{
 installDOM();const {readFile}=await import('node:fs/promises');
 const cad=JSON.parse(await readFile(new URL('../docs/qa/sakura-wall-decoration/Sakura-Wall-Decoration-Schedule.json',import.meta.url),'utf8'));
 const room=new THREE.Group(),d=buildSakuraRebuild({room,reg(){},action(){},exit(){}});
 assert.equal(d.wallDressing.placements.length,20);
 for(const p of d.wallDressing.placements){const expected=cad.items.find(c=>c.id===p.id);assert.deepEqual(p.center,expected.three_center_m);assert.deepEqual(p.normal,expected.three_inward_normal);assert.equal(p.width_mm,expected.width_mm);assert.equal(p.height_mm,expected.height_mm);}
 assert.equal(d.shell.userData.groups.RoomLabels.children.filter(c=>c.visible).length,2);
 d.wallDressing.refresh(295*1440+740);const old=d.wallDressing.mesh.material.map.version;
 const hands=room.getObjectByName('Sakura receiving clock hands'),angle=hands.children[1].rotation.z;
 d.wallDressing.refresh(295*1440+741);assert.notEqual(hands.children[1].rotation.z,angle);assert.equal(d.wallDressing.mesh.material.map.version,old,'clock should not reupload wall atlas');
 assert.equal(d.wallDressing.state().hours,'9:00–20:30');assert.equal(d.wallDressing.state().till,'20:00');
 d.wallDressing.refresh(0);assert.equal(d.wallDressing.state().date.getMonth(),0);
 assert.deepEqual(d.gondolas.userData.tops,[.344,.664,.984]);assert.deepEqual(d.gondolas.userData.footprintMm,[900,4500]);assert.ok(d.gondolas.getObjectByName('Sakura gondola pet'));assert.ok(d.gondolas.getObjectByName('Sakura gondola timber'));
});

test('counter dressing stays within CAD work surfaces, below tobacco header, and clear of wall notices',async()=>{
 installDOM();const {readFile}=await import('node:fs/promises');
 const cad=JSON.parse(await readFile(new URL('../src/world/interiors/sakura-counter-density.json',import.meta.url),'utf8'));
 const room=new THREE.Group(),d=buildSakuraRebuild({room,reg(){},action(){},exit(){}}),detail=d.counterDensity;
 assert.equal(detail.userData.packFronts,48);assert.equal(detail.userData.stockChanges,false);assert.equal(detail.userData.newInteractions,false);
 const c=cad.cabinet;assert.equal(c.rows*c.columns,48);assert.equal(c.bottom-c.supportHeight,cad.counterTop,'cabinet supports must meet worktop');
 const {measure}=await import('../src/avatars/build.js'),{recipeFor}=await import('../src/avatars/cast.js');const m=measure(recipeFor('Thuan'));
 const high=(c.bottom+55+(c.rows-1)*c.rowPitch+c.packHeight/2)/1000;assert.ok(Math.hypot((c.x+18-13050)/1000,high-m.shoulderY)<m.upper+m.fore+m.hand*.55,'highest pack exceeds static reach');assert.ok(c.x>=13300&&c.x+c.width<=13900);assert.ok(c.depth>=1400&&c.depth+c.length<=6200);
 const header=d.wallDressing.placements.find(p=>p.id==='E04');assert.ok(c.bottom+c.height<(header.center[1]*1000-header.height_mm/2));
 for(const id of ['oden','impulse','ticketStand']){
  const p=cad[id];assert.equal(p.bottom,cad.counterTop);assert.ok(p.x>=11300&&p.x+p.width<=12100,id+' must stay on counter');assert.ok(p.depth>=1400&&p.depth+p.length<=6200);
 }
 assert.ok(room.getObjectByName('Sakura scanner coiled cord'));assert.ok(room.getObjectByName('Sakura cash drawer'));
 assert.ok(!d.shell.userData.solids.some(s=>s.g==='Fixtures'&&s.x===13500&&s.z===4800&&s.h===750),'old cabinet removed');
 // All stock and routes are exercised by the retained-catalogue test above.
 const bounds=new THREE.Box3().setFromObject(detail);assert.ok(bounds.min.x>4.35&&bounds.max.x<=6.951);assert.ok(bounds.max.y<2.3);
 for(const print of d.wallDressing.placements.filter(p=>p.normal[0]===-1&&p.id!=='E04')){
  const minDepth=(3.91-print.center[2])*1000-print.width_mm/2,maxDepth=minDepth+print.width_mm;
  const minY=print.center[1]*1000-print.height_mm/2,maxY=minY+print.height_mm;
  assert.ok(c.depth+c.length<=minDepth||c.depth>=maxDepth||c.bottom+c.height<=minY||c.bottom>=maxY,'cabinet hides '+print.id);
 }
});
