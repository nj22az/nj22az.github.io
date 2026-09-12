import * as THREE from '../../vendor/three.module.js';
import {residentPlan} from './social.js';
import {homeRoutine,homeOwner,HOME_LAYOUT,YURI_HOME_LAYOUT} from './home-life.js';
import {groundHeight} from '../world/layout.js?snappy=1';
import {createRoomWalk,atDestination} from './room-walk.js';

export function createHomeResidents({world,parent,collides=()=>false,onBorrow=()=>{},getRain=()=>false}){
 let site=null,person=null,saved=null,layout=null,walker=null,clock=0,rest=0,sleepBlend=0;
 function restore(){
  if(!saved)return;
  const g=person.g,stillHome=residentPlan(person.profile,clock,getRain()).place==='home';
  saved.parent.add(g);g.position.set(person.profile.home[0],groundHeight(...person.profile.home),person.profile.home[1]);g.quaternion.copy(saved.rotation);g.userData.hit.inside=saved.inside;
  for(const key of ['inHome','socialPose','seatHeight','heldItem','sleeping','waking','roomTransition','facePlayerUntil','chatHold'])delete g.userData[key];
  if(stillHome){g.userData.indoors='home';g.visible=false;}else{delete g.userData.indoors;g.visible=true;}
  saved=null;rest=0;sleepBlend=0;
 }
 function update(dt,minutes){
  clock=minutes;if(!site)return;
  const plan=residentPlan(person.profile,minutes,getRain()),g=person.g;
  if(!saved){
   if(plan.place!=='home'||!atDestination(person,'home',person.profile.home))return;
   const alreadyHome=g.userData.indoors==='home'&&!g.userData.justArrived;
   onBorrow(person,minutes);saved={parent:g.parent,rotation:g.quaternion.clone(),inside:g.userData.hit.inside};parent.add(g);
   g.position.set(...layout.door);g.rotation.set(0,0,0);g.userData.inHome=true;g.userData.indoors='home';g.userData.hit.inside=true;g.visible=true;
   if(alreadyHome){sleepBlend=homeRoutine(person.profile,minutes).id==='sleep'?1:0;g.position.set(...layout.bedside);rest=['sleep','wake','bedtime'].includes(homeRoutine(person.profile,minutes).id)?1:0;}
  }
  const routine=homeRoutine(person.profile,minutes),bedtime=plan.place==='home'&&['sleep','wake','bedtime'].includes(routine.id);
  g.userData.place=site.id;g.userData.activity=plan.place==='home'?routine.activity:'leaving home';
  g.userData.sleeping=bedtime&&routine.id==='sleep';g.userData.waking=bedtime&&routine.id==='wake';
  delete g.userData.socialPose;delete g.userData.seatHeight;delete g.userData.heldItem;
  if(!bedtime&&rest>0){
   sleepBlend=Math.max(0,sleepBlend-dt*1.5);rest=Math.max(0,rest-dt*1.5);setRest(g,rest,false);g.userData.roomTransition=true;return;
  }
  const target=plan.place!=='home'?layout.door:bedtime?layout.bedside:layout.table;
  if(rest===0&&!walker.move(person,target,dt)){g.userData.roomTransition=true;return;}
  delete g.userData.roomTransition;
  if(plan.place!=='home'){restore();return;}
  if(bedtime){rest=Math.min(1,rest+dt*1.5);sleepBlend=Math.max(0,Math.min(1,sleepBlend+(routine.id==='sleep'?dt:-dt)*1.5));setRest(g,rest,routine.id==='sleep');}
  else {g.rotation.set(0,0,0);g.userData.socialPose=routine.pose;g.userData.heldItem=routine.item;if(['Eat','Drink'].includes(routine.pose))g.userData.seatHeight=.42;}
  const home=world.homes?.get(person.profile.name);if(home)home.occupied=true;
 }
 function setRest(g,amount,asleep){
  const from=layout.bedside,to=layout.bed;
  g.position.set(...from).lerp({x:to[0],y:to[1]*sleepBlend,z:to[2]},amount);
  const lying=layout.bedAxis==='x'?new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,Math.PI/2)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-Math.PI/2,0))):new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,Math.PI,0));
  g.quaternion.identity().slerp(lying,sleepBlend*amount);
  g.userData.socialPose=asleep||sleepBlend>.01?'Sleep':'Wake';if(!asleep&&sleepBlend<=.01)g.userData.seatHeight=to[1];
 }
 return {enter(next,minutes){restore();site=next;person=world.people.find(p=>p.profile.name===homeOwner(next));if(!person){site=null;return;}layout=person.profile.name==='Yuri'?YURI_HOME_LAYOUT:HOME_LAYOUT;walker=createRoomWalk(collides);update(0,minutes);},update,restore(){restore();site=null;walker?.clear();}};
}
