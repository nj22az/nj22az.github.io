import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {RESIDENTS,HOME_OWNERS} from '../src/people/residents.js';
import {createCastAI,DIALOGUE} from '../src/people/schedules.js';
import {residentPlan,IZAKAYA_DOOR,RAMEN_DOOR,RAMEN_VISITS} from '../src/people/social.js';
import {WORK_SITES} from '../src/people/workplaces.js';
import {sleepHours,homeRoutine,homeLayoutFor,homeSiteId} from '../src/people/home-life.js';
import {createHomeResidents} from '../src/people/home-residents.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {buildResidentHome} from '../src/world/interiors/resident-home.js';
import {buildKobanInterior} from '../src/world/interiors/koban.js';
import {buildSuppliedRoom} from '../src/world/supplied-rooms.js';
import {createTown} from '../src/world/town.js';
import {createBusinesses} from '../src/world/businesses.js';
import {circleHitsRect} from '../physics.js';
import {installDOM} from './fixtures.mjs';
import {MARKET_THRESHOLD} from '../src/world/town-grid.js';

installDOM();globalThis.self=globalThis;
const actualSites=createBusinesses(),actualWorld=createTown({scene:new THREE.Scene(),sites:actualSites,mobile:true,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>null});
function person(name,parent){const profile=RESIDENTS.find(p=>p.name===name),g=new THREE.Group();g.userData={name,hit:{inside:false}};g.position.set(...[profile.home[0],0,profile.home[1]]);parent.add(g);return {profile,g};}
const departureFor=profile=>{const wake=sleepHours(profile).wake;for(let offset=40;offset<1440;offset++){const m=wake+offset;if(residentPlan(profile,m).place!=='home')return m;}throw new Error(profile.name+' never leaves home');};
const tick=(fn,from,seconds)=>{for(let i=0;i<seconds*60;i++)fn(1/60,from+i/60);};
function roomFor(p){
 const room=new THREE.Group(),colliders=[],site=[...actualSites,...actualWorld.landmarks].find(s=>s.homeOwners?.includes(p.profile.name)||s.homeOwner===p.profile.name);
 assert.ok(site,p.profile.name+' has an actual live home site');
 const shared={site,room,box:(size,pos,c,parent)=>{const g=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshBasicMaterial({color:c}));g.position.set(...pos);parent.add(g);return g;},reg(){},collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action(){},exit(){}};
 const built=site.id==='koban'?buildKobanInterior(shared):site.id==='office'?buildSuppliedRoom(shared):buildResidentHome({...shared,profile:p.profile});
 const metadata={...site,...built,homeLayouts:{...site.homeLayouts,...built.homeLayouts}},b=metadata.bounds;
 return {room,metadata,collides:(x,z,r=.32)=>x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r||colliders.some(c=>circleHitsRect(x,z,r,c))};
}
test('two complete days give every resident work, meals and uninterrupted sleep at their own home',()=>{
 for(const profile of HOME_OWNERS){
  const places=new Set();
  for(const rain of [false,true])for(let minutes=0;minutes<2880;minutes++){
   const plan=residentPlan(profile,minutes,rain);places.add(plan.place);
   assert.ok(plan.activity&&plan.target.length===2&&plan.target.every(Number.isFinite),profile.name+' has a destination at '+minutes);
   if(plan.place==='home')assert.deepEqual(plan.target,profile.home);
   if(homeRoutine(profile,minutes).id==='sleep')assert.equal(plan.place,'home',profile.name+' must not be called out during sleep at '+minutes);
  }
  assert.ok(places.has('home'),profile.name+' returns to their home each day');
  const work=profile.name==='Nao'?'izakaya':profile.name==='Thuan'?'market':profile.name==='Officer Mori'?'patrol':profile.name==='Mrs Sato'?'ramen':profile.name==='Bus driver'?'station':'work';
  assert.ok(places.has(work),profile.name+' retains their job');
 }
 const nao=RESIDENTS.find(p=>p.name==='Nao'),freeTime=[850,880,910].map(m=>homeRoutine(nao,m).activity);
 assert.equal(new Set(freeTime).size,3,'Free time changes with the saved clock');
 assert.deepEqual(freeTime,[850,880,910].map(m=>homeRoutine(nao,m+1440).activity));
});
test('indoor saves follow moved homes and venues, then depart from that same door when the schedule changes',()=>{
 const cases=HOME_OWNERS.flatMap(p=>[[p.name,'home',(sleepHours(p).sleep+5)%1440,p.home,true],[p.name,'home',departureFor(p),p.home,false]]);
 const market=[...MARKET_THRESHOLD];
 for(const [name,place,door] of [['Kenji','ramen',RAMEN_DOOR],['Nao','izakaya',IZAKAYA_DOOR],['Reiko','market',market]]){
  const profile=RESIDENTS.find(p=>p.name===name),inside=Array.from({length:1440},(_,m)=>m).find(m=>residentPlan(profile,m).place===place),outside=Array.from({length:1440},(_,offset)=>(inside+offset+1)%1440).find(m=>residentPlan(profile,m).place!==place);
  assert.ok(inside!==undefined&&outside!==undefined,name+' has an actual '+place+' visit');cases.push([name,place,inside,door,true],[name,place,outside,door,false]);
 }
 for(const name of Object.keys(WORK_SITES)){
  const p={...RESIDENTS.find(p=>p.name===name),workSite:WORK_SITES[name]},atWork=Array.from({length:1440},(_,m)=>m).find(m=>residentPlan(p,m).place==='work'),away=Array.from({length:1440},(_,offset)=>(atWork+offset+1)%1440).find(m=>residentPlan(p,m).place!=='work');
  assert.ok(atWork!==undefined,name+' has an actual work shift');cases.push([name,'work',atWork,p.work,true],[name,'work',away,p.work,residentPlan(p,away).place==='work']);
 }
 for(const [name,indoors,minutes,door,remaining] of cases){
  const street=new THREE.Group(),p=person(name,street);p.profile={...p.profile,workSite:WORK_SITES[name]};
  const saved={inventory:[],residentLocations:{[name]:{position:[75,75],indoors}}};
  const ai=createCastAI({world:{people:[p]},player:new THREE.Group(),state:()=>saved,paused:()=>false,collides:()=>false});
  ai.update(0,minutes,false);
  assert.deepEqual([p.g.position.x,p.g.position.z],door,name+' uses the current '+indoors+' threshold');
  const next=residentPlan(p.profile,minutes),sameThreshold=Math.hypot(next.target[0]-door[0],next.target[1]-door[1])<.85,nextIndoor=['home','market','ramen','izakaya','onsen','bookshop'].includes(next.place)||next.place==='work'&&p.profile.workSite;
  const expected=remaining?indoors:sameThreshold&&nextIndoor?next.place:undefined;
  assert.equal(p.g.userData.indoors,expected,name+' indoor ownership follows the current schedule');
  assert.equal(p.g.visible,!expected);assert.deepEqual(ai.snapshot()[name].position,door);
 }
});
test('every resident sleeps, wakes, eats breakfast and leaves their actual furnished home',()=>{
 for(const profile of HOME_OWNERS){
  const street=new THREE.Group(),parent=new THREE.Group(),p=person(profile.name,street),world={people:[p],homes:new Map()},room=roomFor(p);
  const {sleep,wake}=sleepHours(profile),beforeWake=wake<sleep?wake+1440:wake;
  assert.equal(homeRoutine(profile,beforeWake-2).id,'sleep');
  p.g.userData.indoors='home';const residents=createHomeResidents({world,parent,collides:room.collides});
  residents.enter(room.metadata,beforeWake-2);
  assert.equal(p.g.parent,parent,profile.name);assert.equal(p.g.userData.sleeping,true,profile.name);
  const cover=parent.getObjectByName('animated sleep cover');assert.ok(cover?.visible,profile.name+' has a blanket');assert.equal(cover.userData.animatedCover,true);
  const coverBefore=cover.geometry.attributes.position.array.slice();residents.update(1/60,beforeWake-2);
  assert.notDeepEqual(cover.geometry.attributes.position.array,coverBefore,profile.name+' blanket breathes');assert.ok(p.g.position.y>=(room.metadata.homeLayouts?.[profile.name]||room.metadata).bed[1]-.01,profile.name+' rests on the sleeping surface');
  tick((dt,m)=>residents.update(dt,m),beforeWake-2,4);
  assert.equal(p.g.parent,parent);assert.equal(p.g.userData.waking,true,profile.name);assert.equal(p.g.userData.sleeping,false);
  tick((dt,m)=>residents.update(dt,m),beforeWake+16,12);
  assert.equal(p.g.userData.activity,'having breakfast',profile.name);assert.equal(p.g.userData.roomTransition,undefined,profile.name+' reaches table');
  const departure=departureFor(profile);
  residents.update(1/60,departure);assert.equal(p.g.parent,parent,profile.name+' must not vanish at schedule change');
  tick((dt,m)=>residents.update(dt,m),departure,20);
  assert.ok(p.g.parent===street,profile.name+' reaches exit');assert.equal(p.g.userData.inHome,undefined);assert.ok(Math.hypot(p.g.position.x-profile.home[0],p.g.position.z-profile.home[1])<.01);
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
test('camera rank cannot remove a visible street resident',()=>{
 const street=new THREE.Group(),player=new THREE.Group(),world={people:RESIDENTS.map(p=>person(p.name,street))},saved={inventory:[]};
 for(const p of world.people){p.profile={...p.profile,name:p.profile.name==='Thuan'?'Extra':p.profile.name,start:540,close:1080};}
 const ai=createCastAI({world,player,state:()=>saved,paused:()=>false,collides:()=>false});ai.update(0,1002,false);
 // Use ten ordinary outdoor workers, regardless of their observer distance.
 for(const p of world.people){p.profile={...p.profile,name:'Worker '+p.profile.name};delete p.g.userData.indoors;}
 ai.update(0,1002,false);assert.equal(world.people.filter(p=>p.g.visible).length,world.people.length);
});
test('Kenji retains quest dialogue with his own 1980s American slang',()=>{
 assert.match(DIALOGUE.Kenji.find(r=>r[0]==='hello')[1],/Yo, bro/);assert.ok(DIALOGUE.Kenji.some(r=>r[2]==='book'));assert.ok(DIALOGUE.Kenji.some(r=>r[2]==='keychain'));
 assert.ok(DIALOGUE.Kenji.every(r=>!r[3]),'Old spoken recordings must not contradict new lines');
});
