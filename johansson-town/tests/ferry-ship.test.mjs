import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {FERRY_SHIP,FERRY_DECKS,FERRY_MACHINERY,FERRY_LOADS,FERRY_CONDITIONS,FERRY_SUPPLY,FERRY_SCENARIOS,FERRY_SAFETY,ferryDemand,ferrySupplyKW,afterPreferentialTrip,thrusterMayStart,emergencyHours} from '../src/world/ferry-ship.js';
import {buildFerryModel,halfBreadth,keelY,hullX,WL,FERRY_RAMP} from '../src/world/ferry-model.js';
import {FERRY_CREW,FERRY_SHORE,FERRY_WATCH,crewFor,crewDoing,crewOnDuty,deckHandFor,FERRY_PEOPLE} from '../src/people/ferry-crew.js';
import {ISLAND_HOUSEHOLDS} from '../src/people/island-households.js';
import {VEHICLE_SIZE} from '../src/world/road-vehicles.js';

test('she is a real small car ferry: the numbers agree with each other',()=>{
 const S=FERRY_SHIP;
 assert.ok(Math.abs(S.depth-(S.draft+S.freeboard))<.05,'depth is draft plus freeboard');
 assert.ok(S.length/S.beam>3&&S.length/S.beam<4.2,'a ferry’s proportions, not a barge’s or a launch’s');
 assert.ok(S.lengthBP<S.length);
 // Three cars fit the car deck in their two lanes, inside the walkways.
 const car=D=>D.car,laneEdge=Math.max(...FERRY_DECKS.car.lanes.map(Math.abs))+FERRY_DECKS.car.laneWidth/2;
 assert.ok(laneEdge<=S.beam/2-FERRY_DECKS.car.walkway,'lanes leave the walkways clear');
 assert.equal(FERRY_DECKS.car.slots.length,S.vehicles);
 const longest=VEHICLE_SIZE.car.length;
 for(const [x,z] of FERRY_DECKS.car.slots){assert.ok(z+longest/2<FERRY_DECKS.car.fore&&z-longest/2>FERRY_DECKS.car.aft,'car place '+z+' is on the car deck');assert.ok(FERRY_DECKS.car.lanes.includes(x));}
 // Places in the same lane do not overlap.
 // Two cars in one lane, with half a metre between them to lash; a delivery truck takes a lane alone.
 const lane=FERRY_DECKS.car.slots.filter(([x])=>x===FERRY_DECKS.car.slots[0][0]).map(([,z])=>z).sort((a,b)=>a-b);
 for(let i=1;i<lane.length;i++)assert.ok(lane[i]-lane[i-1]>=VEHICLE_SIZE.car.length+.5,'two cars in one lane overlap');
 assert.ok(FERRY_DECKS.car.fore-FERRY_DECKS.car.aft>VEHICLE_SIZE['delivery truck'].length+1,'a delivery truck fits a lane');
 assert.ok(FERRY_RAMP.width>2.2+.6,'the ramp takes a 4-tonne truck with room each side');
 assert.ok(FERRY_SAFETY.lifeJackets.adult>=S.passengers+S.crew,'a life jacket for everyone aboard');
 assert.ok(FERRY_SAFETY.lifeFloats.count*FERRY_SAFETY.lifeFloats.persons>=S.passengers+S.crew,'life floats for everyone aboard');
});

test('the switchboard: one generator at sea, both for the berth, shore power at night, the thruster interlocked',()=>{
 const M=FERRY_MACHINERY;
 assert.equal(M.generators.kW,M.generators.kVA*.8,'a generator’s kW is its kVA at 0.8 power factor');
 for(const c of FERRY_CONDITIONS){
  const use=ferryDemand(c)/ferrySupplyKW(c);
  assert.ok(use<=.85,`${c}: ${(use*100).toFixed(0)} % of the supply (no more than 85 %)`);
  assert.ok(use>=.25,`${c}: ${(use*100).toFixed(0)} % — the plant is too big for her`);
 }
 // On one generator she could not manoeuvre: that is why both are on the board, and the interlock.
 assert.ok(ferryDemand('manoeuvring')>M.generators.kW);
 assert.equal(thrusterMayStart(1),false);assert.equal(thrusterMayStart(2),true);
 // The preferential trip leaves her steering, lights and radio on one set at sea.
 assert.ok(afterPreferentialTrip('atSea')<M.generators.kW*.5);
 for(const id of ['steer-1','nav','lighting'])assert.ok(FERRY_LOADS.find(l=>l.id===id).essential,id+' is essential');
 for(const id of ['ac','galley'])assert.equal(FERRY_LOADS.find(l=>l.id===id).essential,false,id+' is shed first');
 // Every load says why it is there and runs in some condition (or stands by for an emergency).
 for(const l of FERRY_LOADS){assert.ok(l.why.length>10,l.id);for(const c of FERRY_CONDITIONS)assert.ok(l.duty[c]>=0&&l.duty[c]<=1,l.id+' '+c);}
 // The 24 V emergency bank holds the emergency loads for well over the three hours a passenger ship needs.
 assert.ok(emergencyHours()>=3,'emergency bank lasts '+emergencyHours().toFixed(1)+' h');
 assert.ok(FERRY_SUPPLY.night.shore);
});

test('the scenarios name real places on board and real posts',()=>{
 const posts=new Set([...FERRY_CREW.map(c=>c.post)]);
 const places=new Set(['wheelhouse','steering-gear','engine-room','car-deck','quay',...FERRY_DECKS.below.map(b=>b.id)]);
 for(const s of FERRY_SCENARIOS){assert.ok(s.steps.length>=2,s.id);for(const [post,where,what] of s.steps){assert.ok(posts.has(post),s.id+': '+post);assert.ok(places.has(where),s.id+': '+where);assert.ok(what.length>20);}}
});

test('the crew are islanders (and one new chief engineer), each with a home and a reason',()=>{
 const living=new Map(ISLAND_HOUSEHOLDS.flatMap(h=>h.members.map(m=>[m.name,h])));
 assert.equal(FERRY_CREW.length,FERRY_SHIP.crew);
 assert.deepEqual(FERRY_CREW.map(c=>c.post),['master','chief','oiler','deck']);
 assert.equal(FERRY_CREW.filter(c=>c.new).length,1,'one new resident: the chief engineer');
 for(const c of FERRY_CREW){assert.ok(c.why.length>60,c.name+' has a reason');assert.ok(c.lives,c.name+' lives somewhere');}
 for(const name of ['Mr Nakandakari','Mr Higa Jr','Ms Uezu','Kōji','Ms Ganaha','Mr Fujita'])assert.ok(living.has(name),name+' is on the island');
 assert.equal(living.get('Mr Nakandakari').home,'ferry');
 for(const name of ['Ms Uezu','Mr Higa Jr','Kōji','Mr Fujita'])assert.match(living.get(name).members.find(m=>m.name===name).purpose,/ferry|Minato Maru/);
 // Nobody holds two posts at once.
 for(const minutes of [0,7*1440]){const names=crewOnDuty(minutes).map(c=>c.name);assert.equal(new Set(names).size,names.length);}
 assert.ok(FERRY_PEOPLE.length>=8);
});

test('the deck hand works a week on and a week off, and Kōji covers her week',()=>{
 assert.equal(deckHandFor(0),'Ms Uezu');assert.equal(deckHandFor(6*1440+1439),'Ms Uezu');
 assert.equal(deckHandFor(7*1440),'Kōji');assert.equal(deckHandFor(14*1440),'Ms Uezu');
 assert.equal(crewFor('master'),'Bus driver');assert.equal(crewFor('linesman'),'Mr Fujita');
});

test('every phase of a call has the right people at their stations',()=>{
 for(const phase of ['arriving','waiting','reversing','swinging','leaving','crossing']){
  const posts=new Set(Object.keys(FERRY_WATCH[phase]));
  for(const p of ['master','chief','oiler','deck'])assert.ok(posts.has(p),phase+' has the '+p);
  for(const d of crewDoing(phase))assert.ok(d.name&&d.where&&d.doing.length>15,phase+' '+d.post);
 }
 // Lines need someone at each end, fore and aft, when she berths and when she leaves.
 for(const phase of ['arriving','reversing']){const w=FERRY_WATCH[phase];assert.equal(w.deck[0],'bow');assert.equal(w.oiler[0],'stern');assert.equal(w.linesman[0],'quay');}
 assert.equal(FERRY_WATCH.night.chief[0],'mess','the chief lives aboard');
 assert.throws(()=>crewDoing('dancing'));
});

test('the hull is a ship: closed, faired, with her underwater body, and light enough for a phone',()=>{
 const ferry=buildFerryModel();let tris=0,meshes=0;
 ferry.traverse(o=>{if(o.isMesh){meshes++;const g=o.geometry;tris+=(g.index?g.index.count:g.getAttribute('position').count)/3;}});
 assert.ok(meshes<40,meshes+' meshes');assert.ok(tris<30000,tris+' triangles');
 // The hull form: full amidships, drawn in at the bow, the keel rising fore and aft.
 assert.equal(halfBreadth(0),FERRY_SHIP.beam/2);assert.ok(halfBreadth(FERRY_SHIP.length/2)<halfBreadth(0)*.9);
 assert.ok(Math.abs(keelY(0)-(WL-FERRY_SHIP.draft))<1e-9,'the keel is at her draft');
 assert.ok(keelY(10.5)>keelY(0)+.8&&keelY(-10.5)>keelY(0)+1,'forefoot and counter rise');
 // The screws: inside the hull's breadth, above the keel line (so she sits on the blocks in dock), under the counter.
 for(const s of ferry.userData.screws){const r=FERRY_MACHINERY.propellers.diameter/2;
  assert.ok(s.position.y-r>keelY(0)-.1,'screw below the keel line');
  assert.ok(s.position.y+r<keelY(s.position.z)-.1,'screw tip within 0.1 m of the counter');
  assert.ok(Math.abs(s.position.x)+r<halfBreadth(s.position.z)-.3,'screw sticks out beyond the hull’s side');
  assert.ok(Math.abs(s.position.x)>r+.15,'the two screws are too close to the skeg');}
 assert.ok(ferry.getObjectByName('Radar scanner'));assert.ok(ferry.getObjectByName('Ferry bow ramp'));
 for(const n of ['Masthead light','Port sidelight','Starboard sidelight','Stern light'])assert.ok(ferry.getObjectByName(n),n);
 // Sidelights are the right way round: red to port (+x), green to starboard.
 assert.ok(ferry.getObjectByName('Port sidelight').position.x>0&&ferry.getObjectByName('Starboard sidelight').position.x<0);
 ferry.userData.lights(true);assert.equal(ferry.getObjectByName('Port sidelight').material.color.getHex(),0xff3a2a);
 // The rams follow the ramp: shorter raised than lowered.
 const rams=[];ferry.traverse(o=>{if(o.name==='Ramp ram'&&o.geometry.parameters.radiusTop<.06)rams.push(o);});
 ferry.userData.setRamp(0);const up=rams[0].scale.y;ferry.userData.setRamp(1);const down=rams[0].scale.y;assert.notEqual(up,down);
 // Every mesh is finite.
 ferry.traverse(o=>{if(o.isMesh){const p=o.geometry.getAttribute('position');for(let i=0;i<p.count;i+=97)assert.ok(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)),o.name);}});
 const box=new THREE.Box3().setFromObject(ferry);assert.ok(box.max.z-box.min.z<FERRY_SHIP.length+FERRY_RAMP.length+.6);
});
