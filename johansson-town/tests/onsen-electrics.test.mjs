import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildOnsenInterior,ONSEN_ROOM} from '../src/world/interiors/onsen.js';
import {ONSEN_CIRCUITS,ONSEN_BOARD,ONSEN_VOLTS,loadOf,wattsOf,overloaded,trip,reset,resetAll,isLive,isOn,isPowered} from '../src/world/interiors/onsen-electrics.js';
import {ONSEN_TOWELS,TOWEL_PRICE} from '../src/world/interiors/onsen-towels.js';
import {FEED_PLACES} from '../src/feed/places.js';

const build=()=>{const room=new THREE.Group(),hits=[],actions=[];const layout=buildOnsenInterior({room,reg:(o,label,fn)=>hits.push({o,label,fn}),action:(...a)=>actions.push(a),exit(){}});room.updateMatrixWorld(true);return {room,hits,actions,layout};};
const circuit=id=>ONSEN_CIRCUITS.find(c=>c.id===id);
const meshes=room=>{const list=[];room.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)list.push(o);});return list;};

test('the busy evening: three dryers and the massage chair put 38 A on a 20 A circuit',()=>{
 const sockets=circuit('changing-sockets');
 assert.equal(ONSEN_VOLTS,100);
 assert.deepEqual(sockets.loads.map(l=>l.watts),[1200,1200,1200,200]);
 assert.equal(wattsOf('changing-sockets'),3800);
 assert.equal(loadOf('changing-sockets'),38);
 assert.equal(sockets.amps,20);assert.ok(overloaded('changing-sockets'),'38 A trips a 20 A breaker');
 // A quiet evening (one dryer and the chair) is fine on the same cable.
 assert.equal(loadOf('changing-sockets',sockets.normal),14);assert.ok(!overloaded('changing-sockets',sockets.normal));
 for(const c of ONSEN_CIRCUITS){
  assert.equal(c.volts,100,c.id);assert.equal(c.amps,20,c.id+' is a 20 A branch');
  assert.ok(loadOf(c.id,c.normal)<=c.amps,c.id+' within rating in normal use');
  if(c.id!=='changing-sockets')assert.ok(!overloaded(c.id),c.id+' within rating even with everything on');
  assert.ok(c.jp&&c.en&&c.why.length>30,c.id+' is labelled and explained');
  for(const l of c.loads){assert.ok(l.watts>0,l.id);assert.ok(typeof l.purpose==='string'&&l.purpose.length>20,l.id+' has a purpose');}
 }
 const total=ONSEN_CIRCUITS.reduce((s,c)=>s+wattsOf(c.id),0)/ONSEN_VOLTS;
 assert.ok(total<ONSEN_BOARD.main.amps,'the 60 A main holds when one branch trips: '+total+' A');
 const ids=ONSEN_CIRCUITS.flatMap(c=>c.loads.map(l=>l.id));assert.equal(new Set(ids).size,ids.length,'every load on one circuit');
});

test('tripping a breaker drops its lever and puts its lamps out at once; reset brings them back',()=>{
 resetAll();const {room,hits,layout}=build();
 const lamp=room.getObjectByName('Changing-room pendant lamp'),light=room.getObjectByName('Changing-room light');
 const lever=room.getObjectByName('Breaker lever changing-lights');
 assert.ok(lamp&&light?.isPointLight&&lever);
 const lit={emissive:lamp.material.emissiveIntensity,light:light.intensity,lever:lever.rotation.x};
 assert.ok(lit.emissive>0&&lit.light>0);
 const resetAnchor=hits.find(h=>h.label==='Reset the changing-room lights').o;assert.equal(resetAnchor.visible,false,'nothing to reset yet');
 assert.equal(trip('changing-lights'),true);
 assert.equal(isLive('changing-lights'),false);assert.equal(isLive('changing-sockets'),true,'only that circuit');
 assert.equal(lamp.material.emissiveIntensity,0);assert.equal(light.intensity,0);
 assert.ok(lever.rotation.x>Math.PI/2,'lever down');assert.equal(resetAnchor.visible,true);
 // Ticking the room does not bring a dead lamp back or make it flicker.
 for(let i=0;i<20;i++){layout.tick(1/30,1200+i);assert.equal(light.intensity,0);assert.equal(lamp.material.emissiveIntensity,0);}
 // Other areas stay lit.
 assert.ok(room.getObjectByName('Lobby light').intensity>0&&room.getObjectByName('Bath hall light west').intensity>0);
 // Seen from inside the changing room, the house fill drops too; from the lobby it hardly does.
 let hemi;room.traverse(o=>{if(o.isHemisphereLight)hemi=o;});
 const look=z=>{const cam=new THREE.PerspectiveCamera();cam.position.set(0,1.6,z);cam.updateMatrixWorld();room.getObjectByName('Breaker board plate').onBeforeRender(null,null,cam);return hemi.intensity;};
 const inside=look(.2),lobby=look(4);assert.ok(inside<lobby*.8,`changing room ${inside.toFixed(2)} darker than the lobby ${lobby.toFixed(2)}`);
 assert.ok(Math.abs(look(1.62)-look(1.58))<.05,'no step at the doorway');
 assert.equal(reset('changing-lights'),true);assert.equal(look(.2),look(4),'all lit again');
 assert.equal(lamp.material.emissiveIntensity,lit.emissive);assert.equal(light.intensity,lit.light);assert.equal(lever.rotation.x,lit.lever);assert.equal(resetAnchor.visible,false);
 layout.dispose();
});

test('the sockets trip: dryers and chair go dead, the reset prompt appears, and the main takes everything',()=>{
 resetAll();const {room,hits,actions,layout}=build();
 trip('changing-sockets');
 assert.equal(isPowered('dryer-1'),false);assert.equal(isPowered('massage-chair'),false);assert.equal(isPowered('fan'),true,'the fan is on the lobby circuit');
 const r=hits.find(h=>h.label==='Reset the changing-room sockets');assert.equal(r.o.visible,true);
 hits.find(h=>h.label==='Use a hair dryer').fn();assert.match(actions.at(-1)[2],/tripped/);
 r.fn();assert.equal(isLive('changing-sockets'),true);assert.match(actions.at(-1)[2],/3800 watts: 38 amps on a 20 amp breaker/);
 // The main breaker and the earth-leakage breaker cut every branch.
 trip('main');for(const c of ONSEN_CIRCUITS)assert.equal(isLive(c.id),false,c.id);
 for(const name of ['Lobby light','Changing-room light','Bath hall light west','Bath hall light east'])assert.equal(room.getObjectByName(name).intensity,0,name);
 assert.equal(room.getObjectByName('Spout water').visible,false,'no pump, no spout');
 assert.ok(isOn('changing-sockets'),'the branch lever itself is still up');
 reset('main');trip('elcb');assert.equal(isLive('pump'),false);reset('elcb');assert.equal(isLive('pump'),true);
 assert.equal(room.getObjectByName('Spout water').visible,true);
 // The fan is on the lobby circuit: it stops where it is and starts again from there.
 const fanHead=room.getObjectByName('Fan socket')&&(()=>{let blades;room.traverse(o=>{if(o.isMesh&&o.geometry?.type==='CircleGeometry'&&o.parent?.parent?.position?.x===3.85)blades=o;});return blades;})();
 assert.ok(fanHead,'fan blades');trip('lobby');const still=fanHead.rotation.z;layout.tick(.5,1200);assert.equal(fanHead.rotation.z,still);
 assert.equal(room.getObjectByName('Lobby light').intensity,0);reset('lobby');layout.tick(.5,1200);assert.notEqual(fanHead.rotation.z,still);
 assert.throws(()=>trip('sauna'),/No such breaker/);
 layout.dispose();
});

test('the board reads well: inspect text, labels in data, and the audit hook only when auditing',async()=>{
 resetAll();
 let {hits,actions,layout}=build();
 hits.find(h=>h.label==='Look at the breaker board').fn();
 const [kind,title,text]=actions.at(-1);
 assert.equal(kind,'inspect');assert.match(title,/Breaker board/);
 for(const phrase of [/60 A main/,/earth-leakage/,/protects the cable/,/never fit a bigger breaker/,/changing-room sockets/,/bath pump/])assert.match(text,phrase);
 layout.dispose();
 const {installDOM}=await import('./fixtures.mjs');installDOM();
 globalThis.window.__JOHANSSON_AUDIT__={};
 ({layout}=build());
 const hook=globalThis.window.__JOHANSSON_AUDIT__.onsenPower;
 assert.ok(hook&&typeof hook.trip==='function'&&typeof hook.isLive==='function'&&hook.circuits===ONSEN_CIRCUITS);
 hook.trip('changing-sockets');assert.equal(isLive('changing-sockets'),false);hook.reset('changing-sockets');
 layout.dispose();assert.equal(globalThis.window.__JOHANSSON_AUDIT__.onsenPower,undefined,'removed on leaving');
 delete globalThis.window.__JOHANSSON_AUDIT__;
 ({layout}=build());layout.dispose();
});

test('the cabinet hangs on the changing-room side of the bandai wall, in the room, clear of the lockers',()=>{
 resetAll();const {room,layout}=build();
 const board=room.getObjectByName('Breaker board'),box=new THREE.Box3().setFromObject(board);
 const B=ONSEN_ROOM.bounds;
 assert.ok(box.min.x>B.minX&&box.max.x<B.maxX&&box.min.z>ONSEN_ROOM.hall.changing&&box.max.z<=ONSEN_ROOM.hall.front);
 assert.ok(Math.abs(box.max.z-ONSEN_BOARD.wallZ)<.002,'its back is on the wall face');
 assert.ok(box.min.y>1.1&&box.max.y<2.1,'at a height you can reach and read');
 for(const o of meshes(room).filter(m=>m.name==='Locker'))assert.ok(!new THREE.Box3().setFromObject(o).intersectsBox(box),'clear of the lockers');
 layout.dispose();
});

test('dryers, chair and fan are plugged in, and the dryers carry legible ratings',()=>{
 resetAll();const {room,layout}=build();
 const all=meshes(room);
 for(let i=1;i<=3;i++){const d=room.getObjectByName('Hair dryer '+i);assert.ok(d,'dryer '+i);
  const bottom=new THREE.Box3().setFromObject(d).min.y;assert.ok(Math.abs(bottom-.81)<.003,'dryer '+i+' rests on the vanity at '+bottom.toFixed(3));
  assert.ok(room.getObjectByName('Vanity socket '+i));assert.ok(d.getObjectByName('Hair dryer rating sticker'));}
 const colours=new Set([1,2,3].map(i=>room.getObjectByName('Hair dryer '+i).children[0].material.color.getHex()));assert.equal(colours.size,3,'three different dryers');
 assert.equal(all.filter(m=>m.name==='Hair dryer cord').length,3);
 for(const name of ['Massage chair socket','Fan socket','Massage chair rating plate','Massage chair cord','Fan cord'])assert.ok(room.getObjectByName(name),name);
 // Every socket named by a load exists.
 for(const c of ONSEN_CIRCUITS)for(const l of c.loads)if(l.socket)assert.ok(room.getObjectByName(l.socket),l.socket);
 // Cords stay above the surfaces they cross.
 for(const cord of all.filter(m=>/cord$/i.test(m.name)&&m.geometry.type==='TubeGeometry')){const b=new THREE.Box3().setFromObject(cord);assert.ok(b.min.y>=-.001,cord.name+' above the floor');}
 layout.dispose();
});

test('towels: rental stacks by the bandai, a rail by the bath door, one on the bench; resting, not floating or clipping',()=>{
 resetAll();const {room,layout}=build();room.updateMatrixWorld(true);
 const all=meshes(room),B=ONSEN_ROOM.bounds,ray=new THREE.Raycaster();
 const towels=all.filter(m=>m.userData.restsOn||m.userData.hangsFrom);
 assert.ok(towels.length>=30,'stacks of towels, not one '+towels.length);
 const groups=new Set();room.traverse(o=>{if(o.userData.towel)groups.add(o.userData.towel);});
 for(const t of ONSEN_TOWELS){assert.ok(groups.has(t.id),t.id+' is in the room');assert.ok(t.why.length>30&&t.for.length>5,t.id+' has a reason');}
 assert.equal(TOWEL_PRICE,100);
 const itemOf=o=>{for(let p=o;p;p=p.parent)if(p.userData.towel)return p;return null;};
 for(const t of towels){
  const box=new THREE.Box3().setFromObject(t);
  assert.ok(box.min.x>B.minX&&box.max.x<B.maxX&&box.min.z>B.minZ&&box.max.z<B.maxZ&&box.min.y>0,t.name+' inside the room');
  if(t.userData.restsOn){
   const c=box.getCenter(new THREE.Vector3());ray.set(new THREE.Vector3(c.x,box.min.y+.001,c.z),new THREE.Vector3(0,-1,0));ray.far=.02;
   const hit=ray.intersectObjects(all.filter(m=>m!==t),false)[0];
   assert.ok(hit,`${t.name} (${t.parent.name}) rests on something`);assert.ok(hit.distance<.004,t.name+' sits on '+hit.object.name+' with a gap of '+hit.distance.toFixed(4));
   assert.equal(hit.object.name,t.userData.restsOn,t.name+' rests on '+t.userData.restsOn);
  }else{
   const bar=room.getObjectByName(t.userData.hangsFrom),bb=new THREE.Box3().setFromObject(bar),cloth=new THREE.Box3().setFromObject(itemOf(t));
   assert.ok(cloth.max.y>bb.max.y&&cloth.min.y<bb.min.y&&cloth.min.x>=bb.min.x&&cloth.max.x<=bb.max.x,'hangs over the rail, inside its length');
   assert.ok(box.max.y>=bb.min.y,t.name+' reaches up to the rail');
  }
  // Nothing else passes through it, apart from the cloth of the same towel and what it sits on.
  const own=itemOf(t),shrunk=box.clone().expandByScalar(-.002);
  for(const o of all){
   if(o===t||itemOf(o)===own||o.name===t.userData.restsOn||o.name===t.userData.hangsFrom||/floor|paving|ceiling|sea view/i.test(o.name))continue;
   const ob=new THREE.Box3().setFromObject(o);if(ob.isEmpty())continue;
   assert.ok(!shrunk.intersectsBox(ob),`${t.name} (${own?.userData.towel}) clips ${o.name||o.type}`);
  }
 }
 // The rental shelf and the rail do not block the way through or the bath door.
 const blocked=(x,z,r)=>layout.colliders.some(c=>Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r);
 for(const z of [3,1.6,0,-1.2])assert.ok(!blocked(.2,z,.25),'the middle stays open at '+z);
 layout.dispose();
});

test('the storyteller knows the board and the towels',()=>{
 const onsen=FEED_PLACES.find(p=>p.id==='onsen');
 for(const thing of ['the breaker board','a stack of rental towels'])assert.ok(onsen.things.includes(thing),thing);
 assert.ok(onsen.doing.includes('resetting a tripped breaker'));
});
