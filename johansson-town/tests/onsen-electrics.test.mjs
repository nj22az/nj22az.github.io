import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildOnsenInterior,ONSEN_ROOM} from '../src/world/interiors/onsen.js';
import {ONSEN_CIRCUITS,ONSEN_BOARD,ONSEN_VOLTS,ONSEN_SCENARIOS,loadOf,wattsOf,overloaded,trip,reset,resetAll,isLive,isOn,isPowered,boardDoor,stageScenario} from '../src/world/interiors/onsen-electrics.js';
import {ONSEN_TOWELS,TOWEL_PRICE} from '../src/world/interiors/onsen-towels.js';
import {FEED_PLACES} from '../src/feed/places.js';
import {measure} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';

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

test('the cabinet hangs behind the bandai, its door shut, every lever in Mrs Higa\'s reach from her stool and nobody else\'s',()=>{
 resetAll();stageScenario('rest');const {room,layout}=build();
 const board=room.getObjectByName('Breaker board'),box=new THREE.Box3().setFromObject(board);
 // In the keeper's corner: over the bandai's raised floor, behind the counter, on the lobby's west wall.
 const platform=new THREE.Box3().setFromObject(room.getObjectByName('Bandai platform')),counter=new THREE.Box3().setFromObject(room.getObjectByName('Bandai counter'));
 assert.ok(box.min.z>ONSEN_ROOM.hall.front&&box.max.x<counter.min.x,'in the lobby, behind the counter');
 assert.ok(box.min.z>=counter.min.z&&box.max.z<=platform.max.z&&box.max.x<platform.max.x,'in the keeper\'s corner, over the bandai floor, the counter between it and the lobby');
 assert.ok(Math.abs(box.min.x-ONSEN_BOARD.wallX)<.002,'its back is on the wall face');
 assert.ok(box.max.y<1.95&&box.max.y>1.8,'its top where a Japanese board hangs: '+box.max.y.toFixed(3));
 // Shut at rest, with the staff-only card on it; open only while someone works inside it.
 assert.equal(boardDoor(),0);assert.equal(room.getObjectByName('Breaker board door').rotation.y,0,'the door is shut');
 assert.ok(room.getObjectByName('Staff only card'),'関係者以外 on the door');
 for(const name of ['isolated','fitting','fixed']){assert.equal(ONSEN_SCENARIOS[name].board,'open',name+' opens it');}
 for(const name of ['rest','quiet','rush','busy'])assert.ok(!ONSEN_SCENARIOS[name].board,name+' leaves it shut');
 // Mrs Higa reaches every lever from her stool: arm and a lean from the hip (ONSEN_BOARD.keeper), from the nearer shoulder.
 const K=ONSEN_BOARD.keeper,m=measure(recipeFor(K.who)),arm=m.upper+m.fore+m.hand/2,reach=arm+(m.shoulderY-m.hipY)*Math.sin(K.lean*Math.PI/180);
 const shoulderY=K.seat[1]+m.seatDrop+m.shoulderY-m.hipY,shoulders=[-1,1].map(s=>new THREE.Vector3(K.seat[0],shoulderY,K.seat[2]+s*m.shoulderX));
 const standing=[-1,1].map(s=>new THREE.Vector3(K.stand[0],K.stand[1]+m.shoulderY,K.stand[2]+s*m.shoulderX));
 const branches=[...ONSEN_CIRCUITS.map(c=>c.id),'vanity-2','vanity-3'],levers=['main','elcb',...branches];
 const lever=id=>room.getObjectByName('Breaker lever '+id).getWorldPosition(new THREE.Vector3());
 for(const id of branches){const d=Math.min(...shoulders.map(s=>s.distanceTo(lever(id))));
  assert.ok(d<=reach,`Mrs Higa reaches the ${id} lever from her stool: ${d.toFixed(2)} m (reach ${reach.toFixed(2)} m)`);}
 for(const id of levers){const d=Math.min(...standing.map(s=>s.distanceTo(lever(id))));
  assert.ok(d<=reach,`standing on the bandai floor she reaches the ${id} lever: ${d.toFixed(2)} m`);}
 // The board stands on the bandai floor's edge of the stool, not where she stands: her standing place is clear.
 assert.ok(!new THREE.Box3().setFromObject(room.getObjectByName('Attendant stool')).containsPoint(new THREE.Vector3(K.stand[0],K.stand[1]+.1,K.stand[2])),'she can stand beside her stool');
 // Nobody on the customer side can reach it: the counter is in the way.
 const customer=new THREE.Vector3(counter.max.x+.3,1.3,2.35),tall=measure(recipeFor('Tetsuo'));
 for(const id of levers)assert.ok(customer.distanceTo(room.getObjectByName('Breaker lever '+id).getWorldPosition(new THREE.Vector3()))>tall.upper+tall.fore+tall.hand+.35,'out of a customer\'s reach: '+id);
 // The shut cabinet, and the open one, touch nothing but the wall it hangs on (the levers stay inside the shut door).
 for(const state of ['shut','open']){boardDoor(state);
  const now=new THREE.Box3().setFromObject(board),own=new Set(meshes(board)),shrunk=now.clone().expandByScalar(-.002);
  // Mrs Higa is checked vertex by vertex below: her box is far bigger than she is.
  const higa=room.getObjectByName('Umi-no-yu attendant'),hers=new Set(higa?meshes(higa):[]);
  for(const o of meshes(room)){if(own.has(o)||hers.has(o)||/^(Umi-no-yu wall|Umi-no-yu floor)$/.test(o.name))continue;const ob=new THREE.Box3().setFromObject(o);if(ob.isEmpty())continue;
   assert.ok(!shrunk.intersectsBox(ob),state+': the board clips '+(o.name||o.type));}
  if(state==='shut'){const door=new THREE.Box3().setFromObject(room.getObjectByName('Breaker board door panel'));
   const tips=new THREE.Box3();for(const id of levers)tips.union(new THREE.Box3().setFromObject(room.getObjectByName('Breaker lever '+id)));
   assert.ok(tips.max.x<door.min.x,'the levers stay behind the shut door: '+tips.max.x.toFixed(3)+' < '+door.min.x.toFixed(3));}}
 boardDoor('shut');assert.throws(()=>boardDoor(200),/opens from 0/);
 // Her head and bun clear the board through her whole loop at the bandai (reading, then looking up), door shut or open.
 const higa=room.getObjectByName('Umi-no-yu attendant');
 if(higa&&meshes(higa).length)for(const state of ['shut','open']){boardDoor(state);room.updateMatrixWorld(true);const v=new THREE.Vector3();
  // Each part of the board on its own (the open door's box is a thin slab; the board's whole box would take in her shoulder).
  const parts=meshes(board).map(m=>new THREE.Box3().setFromObject(m).expandByScalar(-.001)).filter(b=>!b.isEmpty()),solid={containsPoint:p=>parts.some(b=>b.containsPoint(p))};
  for(let f=0;f<30*28;f++){layout.tick(1/30,1170);if(f%30)continue;room.updateMatrixWorld(true);
   for(const o of meshes(higa)){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);if(o.isSkinnedMesh)o.applyBoneTransform(i,v);v.applyMatrix4(o.matrixWorld);
    assert.ok(!solid.containsPoint(v),`Mrs Higa (${o.name}) passes into the board at ${v.toArray().map(n=>n.toFixed(3))}, door ${state}`);}}}}
 boardDoor('shut');
 layout.dispose();
});

test('dryers, chair and fan are plugged in, and the dryers carry legible ratings',()=>{
 resetAll();const {room,layout}=build();
 const all=meshes(room);
 for(let i=1;i<=3;i++){const d=room.getObjectByName('Hair dryer '+i);assert.ok(d,'dryer '+i);
  const bottom=new THREE.Box3().setFromObject(d).min.y;assert.ok(Math.abs(bottom-.81)<.003,'dryer '+i+' rests on the vanity at '+bottom.toFixed(3));
  assert.ok(room.getObjectByName('Vanity socket '+i));assert.ok(d.getObjectByName('Hair dryer rating sticker'));}
 const colours=new Set([1,2,3].map(i=>room.getObjectByName('Hair dryer '+i).children[0].material.color.getHex()));assert.equal(colours.size,3,'three different dryers');
 // Each dryer and its cord are named apart, so a film can hide one and keep the others.
 for(let i=1;i<=3;i++){assert.equal(all.filter(m=>m.name==='Hair dryer '+i+' cord').length,1,'dryer '+i+'’s cord');assert.ok(room.getObjectByName('Hair dryer '+i).isGroup,'dryer '+i+' is one object');}
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
 const blocked=(x,z,r)=>layout.colliders.some(c=>c.only!=='player'&&Math.abs(x-c.x)<c.w/2+r&&Math.abs(z-c.z)<c.d/2+r);
 for(const x of [-.45,.45])for(const z of [3,1.6,0,-1.2])assert.ok(!blocked(x,z,.25),'the way through each side stays open at '+x+', '+z);
 layout.dispose();
});

test('the storyteller knows the board and the towels',()=>{
 const onsen=FEED_PLACES.find(p=>p.id==='onsen');
 for(const thing of ['the breaker board','a stack of rental towels'])assert.ok(onsen.things.includes(thing),thing);
 assert.ok(onsen.doing.includes('resetting a tripped breaker'));
});

test('with the main off the lobby goes dark (only the dusk through the glass), and comes back exactly with the power',()=>{
 resetAll();const {room,layout}=build();
 let hemi;room.traverse(o=>{if(o.isHemisphereLight)hemi=o;});
 const look=z=>{const cam=new THREE.PerspectiveCamera();cam.position.set(0,1.6,z);cam.updateMatrixWorld();room.getObjectByName('Breaker board plate').onBeforeRender(null,null,cam);return hemi.intensity;};
 layout.tick(1/30,1170);
 const lit=look(4),glow=name=>room.getObjectByName(name).material.emissiveIntensity;
 let daylight;room.traverse(o=>{if(o.isDirectionalLight&&!daylight)daylight=o;});const sunLit=daylight.intensity;
 const before={andon:glow('Andon'),cooler:glow('Milk cooler light'),lamp:room.getObjectByName('Lobby light').intensity};
 assert.ok(before.andon>0&&before.cooler>0&&before.lamp>0);
 // The same frame the main goes down: lamps, andon, cooler and screen out, and the fill falls far below the lit house.
 assert.equal(layout.townFill(),1,'with the lamps on the town\'s indoor fill is untouched');
 trip('main');const dark=look(4);
 assert.ok(dark<lit*.3,`lobby fill ${dark.toFixed(3)} with the main off, ${lit.toFixed(3)} lit`);
 assert.ok(layout.townFill()<.3,`and only the daylight's share of the town's fill comes in: ${layout.townFill().toFixed(3)}`);
 assert.equal(glow('Andon'),0);assert.equal(glow('Milk cooler light'),0);assert.equal(room.getObjectByName('Lobby light').intensity,0);
 let screen;room.getObjectByName('Lobby CRT').traverse(o=>{if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&o.name!=='Lobby CRT glass'&&!screen)screen=o;});
 assert.ok(!screen||screen.visible===false,'the CRT shows dead glass');
 // Every lamp in the house is dead, so it is as dark seen from the changing room as from the lobby.
 assert.ok(Math.abs(look(.2)-dark)<1e-9,'the whole house is equally dark');
 layout.tick(1/30,1170);assert.ok(daylight.intensity<sunLit*.3,'the daylight in the house is only what comes through the glass');
 // Ticking does not bring anything back or flicker.
 for(let i=0;i<20;i++){layout.tick(1/30,1170);assert.equal(look(4),dark);assert.equal(glow('Andon'),0);}
 // Daylight still comes in through the shoji and the glass: noon in a dead house is brighter than dusk.
 layout.tick(1/30,720);const noon=look(4);assert.ok(noon>dark,'the windows still light it by day');
 layout.tick(1/30,1170);
 reset('main');layout.tick(1/30,1170);
 assert.equal(look(4),lit,'exactly as before');assert.equal(daylight.intensity,sunLit);assert.equal(layout.townFill(),1);
 assert.equal(glow('Andon'),before.andon);assert.equal(glow('Milk cooler light'),before.cooler);assert.equal(room.getObjectByName('Lobby light').intensity,before.lamp);
 layout.dispose();
});
