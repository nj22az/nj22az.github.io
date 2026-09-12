import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {RESIDENTS} from '../src/people/residents.js';
import {createCastAI,DIALOGUE} from '../src/people/schedules.js';
import {residentPlan,IZAKAYA_DOOR,RAMEN_DOOR,RAMEN_VISITS,GOSSIP} from '../src/people/social.js';
import {WORK_SITES} from '../src/people/workplaces.js';
import {sleepHours,homeRoutine,homeSiteId,HOME_LAYOUT} from '../src/people/home-life.js';
import {createHomeResidents} from '../src/people/home-residents.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {buildResidentHome} from '../src/world/interiors/resident-home.js';
import {SUPPLIED_ROOM_LAYOUTS} from '../src/world/supplied-rooms.js';
import {circleHitsRect} from '../physics.js';
import {installDOM} from './fixtures.mjs';
import {buildHomes} from '../src/world/homes.js';
function person(name,parent){const profile=RESIDENTS.find(p=>p.name===name),g=new THREE.Group();g.userData={name,hit:{inside:false}};g.position.set(...[profile.home[0],0,profile.home[1]]);parent.add(g);return {profile,g};}
const tick=(fn,from,seconds)=>{for(let i=0;i<seconds*30;i++)fn(1/30,from+i/30);};
function roomFor(p){
 const room=new THREE.Group(),colliders=[];
 if(p.profile.name==='Yuri')colliders.push(...SUPPLIED_ROOM_LAYOUTS['yuri-home'].colliders);
 else buildResidentHome({profile:p.profile,room,box:(size,pos,c,parent)=>{const g=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshBasicMaterial({color:c}));g.position.set(...pos);parent.add(g);return g;},reg(){},collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action(){},exit(){}});
 const b=p.profile.name==='Yuri'?SUPPLIED_ROOM_LAYOUTS['yuri-home'].bounds:HOME_LAYOUT.bounds;
 return {room,collides:(x,z,r=.32)=>x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r||colliders.some(c=>circleHitsRect(x,z,r,c))};
}
test('all ten home owners can be selected even where their building entrance is shared',()=>{
 installDOM();const world={group:new THREE.Group(),colliders:[]},sites=[],anchors=[],menus=[];let entered;
 buildHomes(world,{sites,shadows:false,register:(o,label,fn)=>anchors.push({o,label,fn}),enter:s=>entered=s,onAction:(k,n,detail)=>menus.push(detail)});
 assert.equal(new Set(sites.map(s=>s.id)).size,10);assert.equal(anchors.length,6);
 assert.equal(new Set(RESIDENTS.map(p=>p.homeAddress)).size,10);
 for(const p of RESIDENTS){assert.equal(sites.find(s=>s.homeOwner===p.name).line,p.homeAddress);assert.equal(world.homes.get(p.name).address,p.homeAddress);}
 const selected=new Set();for(const a of anchors){entered=null;menus.length=0;a.fn();if(entered)selected.add(entered.homeOwner);for(const menu of menus)for(const item of menu){item.enter();selected.add(entered.homeOwner);}}
 assert.deepEqual([...selected].sort(),RESIDENTS.map(p=>p.name).sort());
});
test('every current resident gives their actual address and knows a neighbour who is still in town',async()=>{
 const dom=installDOM(),{createActivities}=await import('../activities.js?snappy=1');
 const acts=createActivities({say(){},onWeather(){},onTime(){}});
 for(const p of RESIDENTS){
  assert.ok(RESIDENTS.some(friend=>friend.name===p.friend),p.name+' has a current friend');
  assert.ok(DIALOGUE[p.name].find(r=>r[0]==='home')[1].includes(p.homeAddress));
  acts.action('resident',p.name);dom.button('Where do you live?');
  const answer=document.querySelector('#activityBody').firstChild.textContent;
  assert.ok(answer.includes(p.homeAddress),p.name+' gives the address shown on the door');
  const neighbour=RESIDENTS.find(n=>n.name!==p.name&&n.homeEntry===p.homeEntry);
  if(neighbour){assert.ok(answer.includes(neighbour.name));assert.match(answer,/other flat/);}
  acts.close();
  if(p.name!=='Yuri'){
   acts.action('resident',p.name);dom.button('How is '+p.friend+'?');
   assert.equal(document.querySelector('#activityBody').firstChild.textContent,p.gossip);acts.close();
  }
 }
 for(const pair of GOSSIP)for(const name of [pair.a,pair.b])assert.ok(RESIDENTS.some(p=>p.name===name),'Overheard conversations use the existing cast');
});
test('two complete days give every resident work, meals and uninterrupted sleep at their own home',()=>{
 for(const profile of RESIDENTS){
  const places=new Set();
  for(const rain of [false,true])for(let minutes=0;minutes<2880;minutes++){
   const plan=residentPlan(profile,minutes,rain);places.add(plan.place);
   assert.ok(plan.activity&&plan.target.length===2&&plan.target.every(Number.isFinite),profile.name+' has a destination at '+minutes);
   if(plan.place==='home')assert.deepEqual(plan.target,profile.home);
   if(homeRoutine(profile,minutes).id==='sleep')assert.equal(plan.place,'home',profile.name+' must not be called out during sleep at '+minutes);
  }
  assert.ok(places.has('home')&&places.has('ramen'));
  const work=profile.name==='Nao'?'izakaya':profile.name==='Yuri'?'market':profile.name==='Officer Mori'?'patrol':'work';
  assert.ok(places.has(work),profile.name+' retains their job');
 }
 const nao=RESIDENTS.find(p=>p.name==='Nao'),freeTime=[850,880,910].map(m=>homeRoutine(nao,m).activity);
 assert.equal(new Set(freeTime).size,3,'Free time changes with the saved clock');
 assert.deepEqual(freeTime,[850,880,910].map(m=>homeRoutine(nao,m+1440).activity));
});
test('indoor saves follow moved homes and venues, then depart from that same door when the schedule changes',()=>{
 const cases=RESIDENTS.flatMap(p=>[[p.name,'home',(sleepHours(p).sleep+5)%1440,p.home,true],[p.name,'home',p.name==='Officer Mori'?1320:p.name==='Nao'?960:p.start-30,p.home,false]]);
 const market=RESIDENTS.find(p=>p.name==='Yuri').work;
 cases.push(['Kenji','ramen',600,RAMEN_DOOR,true],['Kenji','ramen',800,RAMEN_DOOR,false],['Nao','izakaya',1100,IZAKAYA_DOOR,true],['Nao','izakaya',800,IZAKAYA_DOOR,false],['Mrs Sato','market',600,market,true],['Mrs Sato','market',800,market,false]);
 for(const name of Object.keys(WORK_SITES)){
  const p=RESIDENTS.find(p=>p.name===name);cases.push([name,'work',730,p.work,true],[name,'work',1300,p.work,false]);
 }
 for(const [name,indoors,minutes,door,remaining] of cases){
  const street=new THREE.Group(),p=person(name,street);p.profile={...p.profile,workSite:WORK_SITES[name]};
  const saved={inventory:[],residentLocations:{[name]:{position:[75,75],indoors}}};
  const ai=createCastAI({world:{people:[p]},player:new THREE.Group(),state:()=>saved,paused:()=>false,collides:()=>false});
  ai.update(0,minutes,false);
  assert.deepEqual([p.g.position.x,p.g.position.z],door,name+' uses the current '+indoors+' threshold');
  assert.equal(p.g.userData.indoors,remaining?indoors:undefined,name+' indoor ownership follows the current schedule');
  assert.equal(p.g.visible,!remaining);assert.deepEqual(ai.snapshot()[name].position,door);
 }
});
test('every resident sleeps, wakes, eats breakfast and leaves their actual furnished home',()=>{
 for(const profile of RESIDENTS){
  const street=new THREE.Group(),parent=new THREE.Group(),p=person(profile.name,street),world={people:[p],homes:new Map()},room=roomFor(p);
  const {sleep,wake}=sleepHours(profile),beforeWake=wake<sleep?wake+1440:wake;
  assert.equal(homeRoutine(profile,beforeWake-2).id,'sleep');
  p.g.userData.indoors='home';const residents=createHomeResidents({world,parent,collides:room.collides});
  residents.enter({id:homeSiteId(profile.name),homeOwner:profile.name},beforeWake-2);
  assert.equal(p.g.parent,parent,profile.name);assert.equal(p.g.userData.sleeping,true,profile.name);
  const cover=parent.getObjectByName('animated sleep cover');assert.ok(cover?.visible,profile.name+' has a blanket');assert.equal(cover.userData.animatedCover,true);
  const coverBefore=cover.geometry.attributes.position.array.slice();residents.update(1/30,beforeWake-2);
  assert.notDeepEqual(cover.geometry.attributes.position.array,coverBefore,profile.name+' blanket breathes');assert.ok(p.g.position.y>=(profile.name==='Yuri'?.47:.57),profile.name+' rests on the sleeping surface');
  tick((dt,m)=>residents.update(dt,m),beforeWake-2,4);
  assert.equal(p.g.parent,parent);assert.equal(p.g.userData.waking,true,profile.name);assert.equal(p.g.userData.sleeping,false);
  tick((dt,m)=>residents.update(dt,m),beforeWake+16,12);
  assert.equal(p.g.userData.activity,'having breakfast',profile.name);assert.equal(p.g.userData.roomTransition,undefined,profile.name+' reaches table');
  const departure=profile.name==='Officer Mori'?1320:profile.name==='Nao'?960:profile.start-30;
  residents.update(1/30,departure);assert.equal(p.g.parent,parent,profile.name+' must not vanish at schedule change');
  tick((dt,m)=>residents.update(dt,m),departure,20);
  assert.equal(p.g.parent,street,profile.name+' reaches exit');assert.equal(p.g.userData.inHome,undefined);assert.ok(Math.hypot(p.g.position.x-profile.home[0],p.g.position.z-profile.home[1])<.01);
  assert.equal(parent.getObjectByName('animated sleep cover'),undefined,profile.name+' blanket is room-local');
  residents.restore();
 }
});
test('residents travelling home cannot be teleported into a visited apartment',()=>{
 const street=new THREE.Group(),parent=new THREE.Group(),p=person('Kenji',street);p.g.position.set(0,0,40);
 const homes=createHomeResidents({world:{people:[p]},parent});homes.enter({homeOwner:'Kenji'},1300);
 assert.equal(p.g.parent,street);assert.equal(p.g.visible,true);
 p.g.position.set(p.profile.home[0],0,p.profile.home[1]);homes.update(1/30,1301);assert.equal(p.g.parent,parent);assert.equal(p.g.userData.roomTransition,true);
});
test('venue visitors arrive at the door, keep their seat, walk out, and remain indoors when the player leaves first',()=>{
 for(const [place,name,minutes,door,end] of [['market','Kenji',880,RESIDENTS.at(-1).work,925],['ramen','Kenji',RAMEN_VISITS.Kenji[0]+25,RAMEN_DOOR,RAMEN_VISITS.Kenji[1]],['izakaya','Nao',1100,IZAKAYA_DOOR,1620]]){
  const street=new THREE.Group(),parent=new THREE.Group(),p=person(name,street),yuri=person('Yuri',street),world={people:[p,yuri]};p.g.position.set(0,0,40);
  const service=createIndoorResidents({world,parent,place});service.sync(minutes);assert.equal(p.g.parent,street,place+' cannot pull someone from the street');
  p.g.position.set(door[0],0,door[1]);service.sync(minutes);assert.equal(p.g.parent,parent);assert.equal(p.g.userData.roomTransition,true);
  tick((dt,m)=>service.sync(m,dt),minutes,18);assert.equal(p.g.userData.roomTransition,undefined,place+' reaches seat');
  service.restore();assert.equal(p.g.userData.indoors,place);assert.equal(p.g.visible,false,'Exiting a room does not eject its residents');
  service.sync(minutes+20);service.sync(end,1/30);assert.equal(p.g.parent,parent,'Departure crosses the room');
  tick((dt,m)=>service.sync(m,dt),end,25);assert.equal(p.g.parent,street);assert.equal(p.g.userData.indoors,undefined);
 }
});
test('camera rank cannot remove a visible street resident, and saves preserve a walk in progress',()=>{
 const street=new THREE.Group(),player=new THREE.Group(),world={people:RESIDENTS.map(p=>person(p.name,street))},saved={inventory:[]};
 for(const p of world.people){p.profile={...p.profile,name:p.profile.name==='Yuri'?'Extra':p.profile.name,start:540,close:1080};}
 const ai=createCastAI({world,player,state:()=>saved,paused:()=>false,collides:()=>false});ai.update(0,1002,false);
 // Use ten ordinary outdoor workers, regardless of their observer distance.
 for(const p of world.people){p.profile={...p.profile,name:'Worker '+p.profile.name};delete p.g.userData.indoors;}
 ai.update(0,1002,false);assert.equal(world.people.filter(p=>p.g.visible).length,10);
 const kenji=world.people[1];kenji.g.position.set(2,0,20);saved.residentLocations=ai.snapshot();
 const other={people:world.people.map(p=>({profile:p.profile,g:p.g.clone()}))};other.people.forEach(p=>street.add(p.g));
 createCastAI({world:other,player,state:()=>saved,paused:()=>false,collides:()=>false}).update(0,1002,false);
 assert.equal(other.people[1].g.position.x,2);assert.equal(other.people[1].g.position.z,20);
});
test('Kenji retains quest dialogue with his own 1980s American slang',()=>{
 assert.match(DIALOGUE.Kenji.find(r=>r[0]==='hello')[1],/Yo, bro/);assert.ok(DIALOGUE.Kenji.some(r=>r[2]==='book'));assert.ok(DIALOGUE.Kenji.some(r=>r[2]==='keychain'));
 assert.ok(DIALOGUE.Kenji.every(r=>!r[3]),'Old spoken recordings must not contradict new lines');
});
