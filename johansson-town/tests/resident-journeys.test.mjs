import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTown} from '../src/world/town.js';
import {createBusinesses} from '../src/world/businesses.js';
import {createNeighbours,NEIGHBOURS} from '../src/people/neighbours.js';
import {canonicalDay} from '../src/people/canonical-day.js';
import {activeResidentHome} from '../src/people/home-directory.js';
import {createColliderGrid} from '../src/world/collider-grid.js';
import {createWalkSurface} from '../src/world/walk-surface.js';
import {groundHeight,planHeight,setWalkSurface} from '../src/world/layout.js';
import {standingHitsRect,townBoundsBlocked} from '../physics.js';

installDOM();globalThis.self=globalThis;
const world=createTown({scene:new THREE.Scene(),sites:createBusinesses(),mobile:true,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
const surface=createWalkSurface({minX:-45,maxX:50,minZ:-72,maxZ:95,base:planHeight});surface.add(world.group);setWalkSurface(surface);
const grid=createColliderGrid(world.colliders),blocked=(x,z,r=.3)=>townBoundsBlocked(x,z,r)||grid.some(x,z,r,c=>standingHitsRect(x,z,r,groundHeight(x,z),c));
for(const spec of NEIGHBOURS)test(spec.name+' completes authored street journeys, sleeps and leaves next morning with town hidden',()=>{
 const parent=new THREE.Group();parent.visible=false;
 const system=createNeighbours({parent,blocked,register(o){o.userData.hit={inside:false};}});
 const person=system.people.find(p=>p.spec.name===spec.name);system.people.splice(0,system.people.length,person);
 const home=activeResidentHome(spec.name).target;person.g.position.set(home.x,groundHeight(home.x,home.z),home.z);person.initialised=true;
 let key=null;
 for(let m=0;m<=1440+720;m+=15){
  const plan=canonicalDay(spec.name,m),next=plan.place+':'+plan.target.join(',');if(next===key)continue;key=next;
  let arrived=false;
  // Hold each destination long enough to assess the actual route independently
  // of time compression. The postman's working round is tested separately.
  for(let i=0;i<9000;i++){
   const before=person.g.position.clone();system.update(.1,m);
   assert.ok(person.g.position.distanceTo(before)<.24,spec.name+' moves continuously');
   if(Math.hypot(person.g.position.x-plan.target[0],person.g.position.z-plan.target[1])<.35){arrived=true;break;}
   if(spec.walk&&plan.place==='main-street'){arrived=true;break;}
  }
  assert.ok(arrived,spec.name+' cannot reach '+plan.place+' at '+m+'; position '+person.g.position.toArray()+' target '+plan.target);
  if(plan.place==='home'){assert.equal(person.g.visible,false);assert.equal(person.g.userData.indoors,'home');if(plan.rest==='sleep')assert.equal(person.g.userData.sleeping,true);}
 }
 setWalkSurface(surface);
});

import {WORLD_CAST} from '../src/people/residents.js';
import {createCastAI} from '../src/people/schedules.js';
import {residentPlan} from '../src/people/social.js';
import {circleHitsRect} from '../physics.js';
for(const profile of WORLD_CAST.filter(p=>p.name!=='Barfly'))test(profile.name+' reaches home and daily indoor destinations against runtime street colliders',()=>{
 const parent=new THREE.Group();parent.visible=false;const g=new THREE.Group();g.userData={name:profile.name,hit:{inside:false}};parent.add(g);
 const person={g,profile},state={inventory:[],residentLocations:{[profile.name]:{position:profile.home,indoors:'home'}}};
 // This is the exact predicate used by game.js for the main schedule controller.
 const runtimeBlocked=(x,z,r)=>townBoundsBlocked(x,z,r)||grid.some(x,z,r,c=>circleHitsRect(x,z,r,c));
 const system=createCastAI({world:{people:[person],homes:new Map()},player:new THREE.Vector3(100,0,100),state:()=>state,paused:()=>false,collides:runtimeBlocked});
 let key=null;
 for(let m=0;m<=1440+720;m+=15){
  const plan=residentPlan(profile,m,false,state,false),next=plan.place+':'+plan.target.join(',');if(next===key)continue;key=next;
  const indoor=['home','bookshop','izakaya','ramen','market','onsen'].includes(plan.place)||plan.place==='work'&&profile.workSite;
  for(let i=0;i<9000;i++){
   system.update(.1,m,false);
   if(!indoor||g.userData.indoors===plan.place)break;
  }
  if(indoor)assert.equal(g.userData.indoors,plan.place,profile.name+' cannot reach '+plan.place+' at '+m+'; position '+g.position.toArray()+' target '+plan.target);
 }
});
