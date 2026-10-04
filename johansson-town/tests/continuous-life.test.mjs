import {householdFor} from '../src/people/households.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {RESIDENTS,HOME_OWNERS} from '../src/people/residents.js';
import {createCastAI,DIALOGUE} from '../src/people/schedules.js';
import {residentPlan,IZAKAYA_DOOR,RAMEN_DOOR,RAMEN_VISITS,GOSSIP} from '../src/people/social.js';
import {WORK_SITES} from '../src/people/workplaces.js';
import {sleepHours,homeRoutine,homeSiteId,homeLayoutFor} from '../src/people/home-life.js';
import {createHomeResidents} from '../src/people/home-residents.js';
import {createIndoorResidents} from '../src/people/indoor-residents.js';
import {buildResidentHome} from '../src/world/interiors/resident-home.js';
import {SUPPLIED_ROOM_LAYOUTS} from '../src/world/supplied-rooms.js';
import {circleHitsRect} from '../physics.js';
import {installDOM} from './fixtures.mjs';
import {MARKET_THRESHOLD} from '../src/world/town-grid.js';
import {buildHomes} from '../src/world/homes.js';
function person(name,parent){const profile=RESIDENTS.find(p=>p.name===name),g=new THREE.Group();g.userData={name,hit:{inside:false}};g.position.set(...[profile.home[0],0,profile.home[1]]);parent.add(g);return {profile,g};}
const tick=(fn,from,seconds)=>{for(let i=0;i<seconds*30;i++)fn(1/30,from+i/30);};
function roomFor(p){
 const room=new THREE.Group(),colliders=[];
 if(homeSiteId(p.profile.name)==='yuri-home')colliders.push(...SUPPLIED_ROOM_LAYOUTS['yuri-home'].colliders);
 else buildResidentHome({profile:p.profile,room,box:(size,pos,c,parent)=>{const g=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshBasicMaterial({color:c}));g.position.set(...pos);parent.add(g);return g;},reg(){},collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action(){},exit(){}});
 const b=homeSiteId(p.profile.name)==='yuri-home'?SUPPLIED_ROOM_LAYOUTS['yuri-home'].bounds:homeLayoutFor(p.profile.name).bounds;
 return {room,collides:(x,z,r=.32)=>x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r||colliders.some(c=>circleHitsRect(x,z,r,c))};
}
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
