import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {CAST} from '../src/people/cast.js';
import {ISLAND_HOUSEHOLDS,homeForResident,homeUnits,householdAtHome,homeNameplate} from '../src/people/island-households.js';
import {HOUSEHOLDS,canonicalHomeId} from '../src/people/households.js';
import {residentCards,canonicalHomeSites,residentHome,activeResidentHome} from '../src/people/home-directory.js';
import {KITAHAMA,KITAHAMA_FLATS,kitahamaHomeFor,plotGate} from '../src/world/kitahama-layout.js';
import {buildIslandHomes} from '../src/world/island-homes.js';
import {buildResidentHome} from '../src/world/interiors/resident-home.js';
import {createKit} from '../src/world/okinawa/kit.js';
import {buildKitahamaQuarter} from '../src/world/okinawa/kitahama-quarter.js';
import {createWalkSurface} from '../src/world/walk-surface.js';
import {planHeight} from '../src/world/layout.js';
import {standingHitsRect,townBoundsBlocked,canStepBetween} from '../physics.js';
import {installDOM} from './fixtures.mjs';

test('all 31 cast members have one canonical primary home; shared and weekday households map once',()=>{
 const cards=residentCards(),targets=canonicalHomeSites(cards);
 assert.equal(cards.length,31);assert.deepEqual(cards.map(c=>c.name),CAST.map(c=>c.name));
 assert.equal(targets.length,24);assert.equal(new Set(targets.map(t=>t.homeId)).size,targets.length);
 for(const card of cards){
  assert.ok(card.home.residents.includes(card.name),card.name+' belongs to the listed home');
  assert.equal(card.home.id,homeForResident(card.name).home);
  for(const home of [card.home,...card.secondaryHomes]){
   assert.ok(home.target&&[home.target.x,home.target.y,home.target.z].every(Number.isFinite),card.name+' has an exterior target');
   assert.equal(home.target.id,householdAtHome(home.id).entranceSiteId);assert.equal(home.target.isResidence,true);
  }
 }
 assert.equal(residentHome('Thuan').id,'kitano-1');assert.equal(activeResidentHome('Thuan').id,'kitahama-1');
 assert.deepEqual(homeForResident('Vy').residents,['Thuan','Thao','Chin','Vy']);
 assert.deepEqual(kitahamaHomeFor('Vy').door,plotGate(KITAHAMA.plots[0]).door);
 assert.equal(residentHome('Mr Fujita').id,'fujita-houseboat');assert.equal(residentHome('Barfly').id,'izakaya');
 assert.equal(homeNameplate('kitahama-3').owners,'Kōji · Riku');assert.equal(homeNameplate('kitahama-11').owners,'To let');
 assert.deepEqual(homeUnits('kitahama-flats').map(h=>h.residents),[['Mr Higa Jr'],['Ms Ganaha'],[],[]]);
 assert.ok(HOUSEHOLDS.every(h=>!h.address.includes('Main Street')),'legacy street-entry numbers do not become displayed addresses');
 for(const id of ['resident-home-nao','resident-home-thao','resident-home-chin','yuri-home'])assert.equal(canonicalHomeId(id),'resident-home-thuan');
 for(const id of ['tamaki','kamiya']){const h=householdAtHome(id);assert.equal(h.status,'retired');assert.equal(h.toLet,false);assert.ok(!targets.some(t=>t.homeId===id));}
 for(const h of ISLAND_HOUSEHOLDS.filter(h=>h.district==='Fumoto'))assert.equal(h.toLet,true);
});

test('Find person uses live world transforms, exterior doors for indoor actors, and labelled schedule fallbacks',()=>{
 const scene=new THREE.Group(),indoor=new THREE.Group(),hidden=new THREE.Group();scene.add(indoor,hidden);hidden.visible=false;
 const thuan=new THREE.Group();thuan.userData={name:'Thuan',inMarket:true,activity:'Restocking the shelf'};thuan.position.set(1,0,1);indoor.add(thuan);
 const vy=new THREE.Group();vy.userData={name:'Vy',activity:'Walking with Mai'};vy.position.set(2,.2,3);scene.position.set(8,0,10);scene.add(vy);
 const mai=new THREE.Group();mai.userData={name:'Mai'};mai.position.set(1,0,1);hidden.add(mai);scene.updateMatrixWorld(true);
 const sites=[{id:'market',title:'Sakura Shōten',door:[-5.5,0,-28.5]},{id:'ferry-terminal',title:'Port Terminal',door:[-38,0,-50]}];
 const landmarks=[{id:'nakamura',title:'Nakamura · zenzai & Blue Coral',x:7.35,y:0,z:-10.55}];
 const cards=residentCards({sites,landmarks,people:[{g:thuan}],neighbours:[{g:vy},{g:mai}],minutes:960});
 const t=cards.find(c=>c.name==='Thuan');assert.equal(t.current.source,'live');assert.equal(t.current.locationLabel,'Sakura Shōten');assert.deepEqual(t.personTarget.door,sites[0].door);assert.equal(t.home.id,'kitano-1');
 const v=cards.find(c=>c.name==='Vy');assert.equal(v.current.source,'live');assert.deepEqual(v.personTarget.door,[10,.2,13]);
 const m=cards.find(c=>c.name==='Mai');assert.equal(m.current.source,'schedule');assert.equal(m.personTarget.id,'nakamura');assert.equal(m.current.locationLabel,landmarks[0].title);
 thuan.userData={name:'Thuan',inHome:true};
 const atHome=residentCards({sites,people:[{g:thuan}],minutes:1380}).find(c=>c.name==='Thuan');
 assert.equal(atHome.personTarget.homeId,'kitahama-1');assert.equal(atHome.homeTarget.homeId,'kitano-1');assert.notDeepEqual(atHome.personTarget.door,[1,0,1]);
 const aboard=new THREE.Group();aboard.userData={name:'Mr Higa Jr',ferryCrew:true};
 const crew=residentCards({sites,neighbours:[{g:aboard}],minutes:600}).find(c=>c.name==='Mr Higa Jr');
 assert.equal(crew.personTarget.id,'ferry-terminal');assert.equal(crew.current.aboard,true);assert.equal(crew.home.unitNumber,'1');
 vy.userData.scheduledAway=true;vy.visible=false;
 const pupil=residentCards({sites,neighbours:[{g:vy,spec:{name:'Vy',routine:[{from:495,away:true,role:'at school'}]}}],minutes:600}).find(c=>c.name==='Vy');
 assert.equal(pupil.current.source,'schedule');assert.equal(pupil.current.locationLabel,'At school');assert.equal(pupil.personTarget,null);assert.equal(pupil.homeTarget.homeId,'kitahama-1');
});

test('numbered flat approaches and the upper stair agree with the drawn surface and standing collisions',()=>{
 installDOM();const group=new THREE.Group(),kit=createKit(),colliders=[],anchors=[];
 const solid=cs=>colliders.push(...[].concat(cs).filter(Boolean));
 kit.at(0,0,0,()=>buildKitahamaQuarter(kit,solid,{anchor:(x,y,z,label)=>{anchors.push({x,y,z,label});return {userData:{}};},onAction(){},vending(){}}),KITAHAMA.y);
 kit.finish(group,'Kitahama quarter');
 const A=KITAHAMA.apartment;const surface=createWalkSurface({minX:A.minX-3,maxX:A.maxX+5,minZ:A.minZ-3,maxZ:A.maxZ+3,base:planHeight});surface.add(group);
 const height=(x,z)=>surface.level(x,z)??planHeight(x,z)+surface.lift(x,z);
 const check=([x,y,z])=>{
  assert.ok(Math.abs(height(x,z)-y)<.03,'route height matches floor at '+[x,z]);
  assert.equal(townBoundsBlocked(x,z,.28),false,'route stays on land');
  assert.ok(!colliders.some(c=>standingHitsRect(x,z,.28,height(x,z),c)),'route point is clear at '+[x,z]);
 };
 const world={group:new THREE.Group(),landmarks:[]},sites=[];buildIslandHomes(world,{sites});
 for(const unit of KITAHAMA_FLATS){
  const site=world.landmarks.find(s=>s.homeId===unit.id);assert.ok(site);
  assert.deepEqual(site.door,unit.approachPosition);assert.deepEqual(site.exitPosition,unit.approachPosition);assert.deepEqual(site.entrancePosition,unit.door);check(site.door);
  const ex=site.x+Math.sin(site.entryFacing)*.6,ez=site.z+Math.cos(site.entryFacing)*.6;check([ex,height(ex,ez),ez]);
  const plate=anchors.find(a=>a.label.startsWith('Flat '+unit.unitNumber+' · '));assert.ok(plate);
  assert.ok(Math.hypot(plate.x-site.x,plate.z-site.z)<2.7,'the real nameplate is within normal interaction range');
 }
 // Ground-floor markers never inherit the upper corridor's floor.
 assert.equal(height(...[KITAHAMA_FLATS[0].door[0],KITAHAMA_FLATS[0].door[2]]),KITAHAMA.y+2.88);
 for(const unit of KITAHAMA_FLATS.slice(0,2)){
  for(let x=(KITAHAMA.fukugiLane.minX+KITAHAMA.fukugiLane.maxX)/2;x>=unit.approachPosition[0];x-=.1)check([x,height(x,unit.door[2]),unit.door[2]]);
  const c=residentHome(unit.unitNumber==='1'?'Mr Higa Jr':'Ms Ganaha',{landmarks:world.landmarks});assert.deepEqual(c.target.entrancePosition,unit.door);assert.deepEqual(c.target.door,unit.approachPosition);
 }
 // An actual walk from the stair foot to both upper unit doors, with ordinary step heights.
 const route=[[A.minX+.9,A.minZ+.1],[A.maxX-1.3,A.minZ+.1],[A.maxX-1.3,A.minZ+7.8]];let previous=null;
 for(let i=1;i<route.length;i++){
  const [ax,az]=route[i-1],[bx,bz]=route[i],n=Math.ceil(Math.hypot(bx-ax,bz-az)/.09);
  for(let j=0;j<=n;j++){const x=ax+(bx-ax)*j/n,z=az+(bz-az)*j/n,y=height(x,z);check([x,y,z]);if(previous!==null)assert.ok(canStepBetween(previous,y),'each stair step is climbable');previous=y;}
 }
});

test('the real 1 Kitahama interior includes the four people identified at its entrance',()=>{
 installDOM();const world={group:new THREE.Group(),landmarks:[]},sites=[];buildIslandHomes(world,{sites});
 const site=sites.find(s=>s.id==='resident-home-thuan'),room=new THREE.Group();
 const layout=buildResidentHome({site,profile:{name:'Thuan'},room,reg(){},action(){},collider(){},exit(){}});
 assert.deepEqual(site.homeOwners,['Thuan','Thao','Chin','Vy']);
 for(const name of site.homeOwners){assert.ok(layout.homeLayouts[name],name+' has a real place in the household');assert.ok(room.getObjectByName('Futon '+name),name+' has their own bedding');assert.ok(room.getObjectByName('Photograph of '+name),name+' appears in the household photograph');}
 assert.notDeepEqual(layout.homeLayouts.Vy.bed,layout.homeLayouts.Thuan.bed,'the weekday guest does not replace the child’s bedroom');
});

test('Studio read tools report the same canonical primary and secondary residences',async()=>{
 const {context,callTool}=await import('../tools/studio/tools.mjs');const ctx=await context();
 try{
  const fujita=await callTool('character_get',{name:'Mr Fujita'},ctx);assert.equal(fujita.error,undefined);assert.equal(fujita.home.id,'fujita-houseboat');
  const thuan=await callTool('character_get',{name:'Thuan'},ctx);assert.equal(thuan.home.id,'kitano-1');assert.equal(thuan.secondaryHomes[0].id,'kitahama-1');
  const list=await callTool('character_list',{query:'Fujita'},ctx);assert.equal(list.characters[0].home.id,'fujita-houseboat');
 }finally{await ctx.close();}
});
