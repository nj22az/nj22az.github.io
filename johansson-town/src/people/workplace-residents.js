import * as THREE from '../../vendor/three.module.js';
import {residentPlan} from './social.js';
import {createTownActivities} from './town-activities.js';
import {createNavigation} from './navmesh.js?snappy=1';

const WORKERS={frontrow:'Aya',form3d:'Kenji',stepwise:'Kenji',electronics:'Tetsuo',journal:'Reiko',career:'Harbour master',office:'Harbour master',warehouse:'Harbour master','bus-hut':'Bus driver'};

// The same resident works at the room's shelves, desk and equipment. Room-local
// navigation uses its actual collision layout, and only exists while it is open.
export function createWorkplaceResidents({world,parent,getTargets,collides,getPlayerPosition,getState,ledger,onBorrow=()=>{}}){
 const borrowed=new Map(),routes=new Map();let site=null,interactions=null,navigation=null;
 function restore(person){
  const saved=borrowed.get(person);if(!saved)return;interactions?.release(person,0);
  const g=person.g;saved.parent.add(g);g.position.copy(saved.position);g.quaternion.copy(saved.rotation);g.visible=false;g.userData.hit.inside=saved.inside;
  for(const key of ['inWorkplace','indoors','usingTownObject','socialPose','seatHeight','heldItem'])delete g.userData[key];borrowed.delete(person);routes.delete(person);
 }
 function update(dt,minutes,rain){
  if(!site)return;
  const worker=world.people.find(p=>p.profile.name===WORKERS[site.id]);
  for(const person of [...borrowed.keys()])if(residentPlan(person.profile,minutes,rain).place!=='work'||person.profile.name==='Kenji'&&getState().kenjiEscort==='walking')restore(person);
  if(worker&&!borrowed.has(worker)&&residentPlan(worker.profile,minutes,rain).place==='work'&&!(worker.profile.name==='Kenji'&&getState().kenjiEscort==='walking')){
   const spawn=[[-.9,1.5],[1.4,1.5],[0,.3],[-1.2,-.3],[1.2,-.3]].find(([x,z])=>!collides(x,z,.35)&&getPlayerPosition().distanceTo(new THREE.Vector3(x,0,z))>1.1);
   if(spawn){const g=worker.g;onBorrow(worker,minutes);borrowed.set(worker,{parent:g.parent,position:g.position.clone(),rotation:g.quaternion.clone(),inside:g.userData.hit.inside,stand:spawn});parent.add(g);g.position.set(spawn[0],0,spawn[1]);g.userData.hit.inside=true;g.userData.inWorkplace=site.id;g.userData.indoors=site.id;g.visible=true;}
  }
  for(const [person,saved] of borrowed){
   const g=person.g,base={place:'work',target:saved.stand,activity:'working at '+site.title},plan=interactions.plan(person,base,minutes,rain,dt);
   g.userData.place=site.id;g.userData.activity=plan.activity;
   if(g.userData.usingTownObject||g.userData.chatHold||g.userData.facePlayerUntil>performance.now())continue;
   let route=routes.get(person);
   if(!route||route.tag!==plan.place){const points=navigation.path(g.position,{x:plan.target[0],z:plan.target[1]});if(points.length)points.push(plan.target);route={tag:plan.place,points};routes.set(person,route);}
   const target=route.points[0];if(!target)continue;
   const dx=target[0]-g.position.x,dz=target[1]-g.position.z,d=Math.hypot(dx,dz);if(d<.10){route.points.shift();continue;}
   const step=Math.min(d,dt*(person.profile.age>65?.7:1.0)),x=g.position.x+dx/d*step,z=g.position.z+dz/d*step;
   if(collides(x,z,.32)||Math.hypot(getPlayerPosition().x-x,getPlayerPosition().z-z)<.75)continue;
   g.position.set(x,0,z);const heading=Math.atan2(-dx,-dz),delta=Math.atan2(Math.sin(heading-g.rotation.y),Math.cos(heading-g.rotation.y));g.rotation.y+=delta*Math.min(1,dt*7);
  }
 }
 function leave(){for(const p of [...borrowed.keys()])restore(p);interactions?.dispose();interactions=null;navigation=null;site=null;}
 return {enter(next,minutes){leave();if(!WORKERS[next.id])return;site=next;
  interactions=createTownActivities({getTargets,collides,getPlayerPosition,getState,ledger,inside:true});
  navigation=createNavigation(collides,{step:.4,heightAt:()=>0,bounds:{minX:-6.2,maxX:6.2,minZ:-6.2,maxZ:6.2}});update(0,minutes,false);
 },update,restore:leave};
}
