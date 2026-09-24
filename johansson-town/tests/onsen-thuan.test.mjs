import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {RESIDENTS} from '../src/people/residents.js';
import {residentPlan,thuanAtOnsen,onsenInvitationDay} from '../src/people/social.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {ONSEN_DOOR} from '../src/world/onsen-layout.js';
import {ONSEN_ROOM,ONSEN_SEATS} from '../src/world/interiors/onsen.js';
import {createLocalCharacters,preloadCharacter} from '../src/people/models.js';
import {installDOM} from './fixtures.mjs';

const thuan=RESIDENTS.find(p=>p.name==='Thuan');
const commuter={townMode:'shopping-district'};

test('asked along, Thuan goes from locking up to Umi-no-yu, and still makes her bus',()=>{
 // 20:15 on day 3, the evening she said yes to.
 const evening=3*1440+1215,state={...commuter,onsenDate:3};
 assert.equal(residentPlan(thuan,evening,false,state).place,'onsen');
 assert.deepEqual(residentPlan(thuan,evening,false,state).target,ONSEN_DOOR);
 // Not asked, or asked for another evening: her usual hour.
 assert.notEqual(residentPlan(thuan,evening,false,commuter).place,'onsen');
 assert.notEqual(residentPlan(thuan,evening,false,{...commuter,onsenDate:2}).place,'onsen');
 // Never into her shift, and out in time for the last bus.
 assert.equal(thuanAtOnsen(thuan,3*1440+900,false,state),false);
 assert.equal(thuanAtOnsen(thuan,3*1440+1300,false,state),false);
 // Asking after her window has gone means tomorrow.
 assert.equal(onsenInvitationDay(thuan,3*1440+700,false,commuter),3);
 assert.equal(onsenInvitationDay(thuan,3*1440+1300,false,commuter),4);
 // The older, residential town has her soak straight after closing too.
 assert.equal(residentPlan(thuan,3*1440+thuan.close+20,false,{onsenDate:3},false).place,'onsen');
});

test('the bath borrows Thuan into the rock pool in swimwear and gives her back dressed',()=>{
 const street=new THREE.Group(),scene=new THREE.Group();scene.add(street);
 const world={people:RESIDENTS.map((profile,i)=>{const g=new THREE.Group();g.userData.name=profile.name;g.userData.hit={inside:false};g.position.set(i,0,i+1);street.add(g);return {g,profile};})};
 const person=world.people.find(p=>p.profile.name==='Thuan'),g=person.g,state={...commuter,onsenDate:0};
 let playerSeat=null;
 const guests=createIndoorResidents({world,parent:scene,place:'onsen',layout:{entrance:ONSEN_ROOM.spawn},getState:()=>state,getPlayerSeat:()=>playerSeat});
 g.position.set(ONSEN_DOOR[0],0,ONSEN_DOOR[1]);g.userData.indoors='onsen';
 assert.deepEqual(guests.sync(1215),['Thuan']);
 assert.equal(g.parent,scene);assert.equal(g.userData.inOnsen,true);assert.equal(g.userData.outfit,'swim');
 assert.equal(g.userData.socialPose,'Soak');assert.equal(g.userData.seatHeight,ONSEN_SEATS.rockBeside.surfaceY);
 assert.deepEqual(g.position.toArray(),ONSEN_SEATS.rockBeside.position);
 guests.restore();
 assert.equal(g.parent,street);assert.equal(g.userData.inOnsen,undefined);assert.equal(g.userData.outfit,undefined);
 // With the player already in her usual corner, she takes the other side of the pool.
 playerSeat='rockBeside';g.position.set(ONSEN_DOOR[0],0,ONSEN_DOOR[1]);g.userData.indoors='onsen';
 guests.sync(1215);assert.deepEqual(g.position.toArray(),ONSEN_SEATS.rock.position);guests.restore();
 // Nobody else is sent to the bath.
 assert.ok(world.people.filter(p=>p!==person).every(p=>!p.g.userData.inOnsen));
});

test('swimwear on the rebuilt Thuan replaces her top, skirt and shoes, and comes off again',async()=>{
 installDOM();const previous={fetch:globalThis.fetch,self:globalThis.self,bitmap:globalThis.createImageBitmap};
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 globalThis.fetch=async input=>String(input).startsWith('blob:')?previous.fetch(input):new Response(await readFile(new URL('../assets/'+new URL(String(input.url||input)).pathname.split('/assets/')[1],import.meta.url)));
 try{
  await preloadCharacter('Thuan');const models=createLocalCharacters(),entity=new THREE.Group();entity.userData.name='Thuan';
  const actor=models.attach(entity,'Thuan'),shown=pattern=>{const found=[];actor.model.traverse(o=>{if(o.isMesh&&pattern.test(o.name))found.push(o.visible);});assert.ok(found.length,String(pattern));return found.every(Boolean)?true:found.some(Boolean)?'mixed':false;};
  models.update(1/60);
  assert.equal(shown(/Swimsuit/),false);assert.equal(shown(/elegantsuit/),true);
  entity.userData.outfit='swim';models.update(1/60);
  assert.equal(shown(/Swimsuit/),true);assert.equal(shown(/SkinUnder/),true);
  assert.equal(shown(/elegantsuit/),false);assert.equal(shown(/shoes/),false);assert.equal(shown(/Braid/),true,'The braids stay in');
  delete entity.userData.outfit;models.update(1/60);
  assert.equal(shown(/Swimsuit/),false);assert.equal(shown(/elegantsuit/),true);assert.equal(shown(/shoes/),true);
 }finally{globalThis.fetch=previous.fetch;globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
});

test('the invitation survives a reload, so she is still expected at the bath',async()=>{
 const {SAVE_KEY}=await import('../src/save.js');
 installDOM({[SAVE_KEY]:JSON.stringify({yen:500,onsenDate:20719})});
 const {createActivities}=await import('../activities.js?onsen-date=1');
 const activities=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>20719*1440+700});
 assert.equal(activities.state.onsenDate,20719);
});
