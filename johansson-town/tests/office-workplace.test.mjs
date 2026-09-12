import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createBusinesses} from '../src/world/businesses.js';
import {createTown} from '../src/world/town.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {buildSuppliedRoom,preloadSuppliedRooms,suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {OFFICE_DESK_SEAT} from '../src/world/interiors/office-workplace.js';
import {createWorkplaceResidents} from '../src/people/workplace-residents.js';
import {createResidentLedger} from '../src/people/resident-personalities.js';
import {circleHitsRect} from '../physics.js';
import {createNavigation} from '../src/people/navmesh.js';

test('one harbour clerk reaches the desk, types, files binders and leaves safely without player side effects',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:256,height:256,close(){}});
 const native=fetch;globalThis.fetch=async url=>String(url).startsWith('blob:')?native(url):new Response(await readFile(new URL('../assets/'+new URL(url).pathname.split('/assets/')[1],import.meta.url)));
 try{assert.deepEqual(await preloadSuppliedRooms(['office']),[true]);}finally{globalThis.fetch=native;}
 const sites=createBusinesses(),scene=new THREE.Scene(),targets=[],register=(o,label,fn,inside=false)=>{o.userData.hit={label,fn,inside};targets.push(o);};
 const world=createTown({scene,sites,mobile:true,shadows:false,register,enter(){},onAction(){}});assignWorkplaces(world,sites);
 const site=sites.find(s=>s.id==='office'),room=new THREE.Group();scene.add(room);const colliders=[];let playerActions=0;
 const layout=buildSuppliedRoom({site,room,reg:register,collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action(){playerActions++;},exit(){}});
 const blocked=(x,z,r=.32)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
 assert.ok(room.getObjectByName('Clerk CRT monitor'));assert.ok(room.getObjectByName('Visitor writing pad'));let binders=0;room.traverse(o=>{if(o.name==='Labelled service binder')binders++;});assert.equal(binders,21);
 const nav=createNavigation(blocked,{step:.16,heightAt:()=>0,bounds:layout.bounds});
 for(const stand of [OFFICE_DESK_SEAT.stand,...Object.values(layout.staff)]){assert.equal(blocked(stand[0],stand[2]),false);assert.ok(nav.path({x:layout.spawn[0],z:layout.spawn[2]},{x:stand[0],z:stand[2]}).length);}
 const staff=world.people.filter(p=>p.profile.workSite==='office');assert.deepEqual(staff.map(p=>p.profile.name),['Harbour master']);const clerk=staff[0];
 clerk.g.position.set(clerk.profile.work[0],0,clerk.profile.work[1]);clerk.g.userData.indoors='work';clerk.g.visible=false;const original=clerk.g.position.clone(),state={yen:987,inventory:['Sea bream']};
 const service=createWorkplaceResidents({world,parent:scene,getTargets:()=>targets,collides:blocked,getPlayerPosition:()=>null,getEntrance:()=>layout.spawn,getLayout:()=>layout,getState:()=>state,ledger:createResidentLedger(()=>state)});
 service.enter(site,720);assert.equal(clerk.g.userData.inWorkplace,'office');const poses=new Set();
 for(let n=0;n<2400;n++){
  service.update(.1,720+n*.04,false);poses.add(clerk.g.userData.socialPose);
  if(clerk.g.userData.socialPose==='Type'){assert.deepEqual(clerk.g.position.toArray(),OFFICE_DESK_SEAT.position);assert.equal(clerk.g.rotation.y,0);assert.equal(clerk.g.userData.heldItem,null);}
  else assert.equal(blocked(clerk.g.position.x,clerk.g.position.z,.28),false,'The clerk walks in the clear aisle');
 }
 assert.ok(poses.has('Type'),'Uses the computer');assert.ok(poses.has('Read'),'Files the binders');assert.equal(playerActions,0);assert.equal(state.yen,987);assert.deepEqual(state.inventory,['Sea bream']);
 assert.ok(state.residentLife['Harbour master'].activities.some(a=>JSON.stringify(a).includes('typing berth records')));
 for(let n=0;n<500;n++)service.update(.1,900,false);
 assert.equal(clerk.g.parent,world.group);assert.equal(clerk.g.userData.inWorkplace,undefined);assert.equal(clerk.g.userData.seatHeight,undefined);assert.ok(original.equals(clerk.g.position));assert.ok(!targets.some(o=>o.userData.reservedBy==='Harbour master'));service.restore();
});
