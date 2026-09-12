import {createRoomWalk,atDestination} from './room-walk.js';
import {residentPlan} from './social.js';
import {createTownActivities} from './town-activities.js';

// Workplaces are assigned to people, so two residents can share one real room.
export function createWorkplaceResidents({world,parent,getTargets,collides,getPlayerPosition,getState,ledger,onBorrow=()=>{},getEntrance=()=>[0,0,5.2],getLayout=()=>null}){
 const borrowed=new Map();let site=null,interactions=null,walker=null,clock=0;
 const occupied=(x,z,person)=>{
  const player=getPlayerPosition();if(player&&Math.hypot(player.x-x,player.z-z)<.72)return true;
  return [...borrowed.keys()].some(other=>other!==person&&Math.hypot(other.g.position.x-x,other.g.position.z-z)<.68);
 };
 function restore(person){
  const saved=borrowed.get(person);if(!saved)return;interactions?.release(person,clock);
  const g=person.g;saved.parent.add(g);g.position.copy(saved.position);g.quaternion.copy(saved.rotation);g.visible=true;g.userData.hit.inside=saved.inside;
  for(const key of ['inWorkplace','indoors','usingTownObject','socialPose','seatHeight','heldItem','roomTransition'])delete g.userData[key];
  if(residentPlan(person.profile,clock).place==='work'&&person.profile.workSite){g.userData.indoors='work';g.visible=false;}
  borrowed.delete(person);
 }
 function walk(person,target,dt){
  const before=person.g.position.clone(),arrived=walker.move(person,target,dt);
  if(occupied(person.g.position.x,person.g.position.z,person)){person.g.position.copy(before);return false;}
  return arrived;
 }
 function update(dt,minutes,rain,initial=false){
  clock=minutes;if(!site)return;
  const working=p=>residentPlan(p.profile,minutes,rain).place==='work'&&!(p.profile.name==='Kenji'&&getState().kenjiEscort==='walking');
  for(const person of [...borrowed.keys()])if(!working(person)){
   interactions.release(person,minutes);person.g.userData.roomTransition=true;person.g.userData.activity='leaving work';
   if(walk(person,getEntrance(),dt))restore(person);
  }
  const staff=world.people.filter(p=>p.profile.workSite===site.id),layout=getLayout();
  for(const worker of staff){
   if(borrowed.has(worker)||!working(worker)||!atDestination(worker,'work',worker.profile.work))continue;
   const preferred=layout?.staff?.[worker.profile.name];
   const choices=preferred?[preferred]:[[-.9,0,1.5],[1.4,0,1.5],[0,0,.3],[-1.2,0,-.3],[1.2,0,-.3]];
   const stand=choices.find(([x,,z])=>!collides(x,z,.35)&&!occupied(x,z,worker));if(!stand)continue;
   const alreadyInside=initial&&worker.g.userData.indoors==='work',entrance=getEntrance();
   if(!alreadyInside&&occupied(entrance[0],entrance[2],worker))continue;
   const g=worker.g;onBorrow(worker,minutes);borrowed.set(worker,{parent:g.parent,position:g.position.clone(),rotation:g.quaternion.clone(),inside:g.userData.hit.inside,stand,arriving:!alreadyInside});
   parent.add(g);g.position.set(...(alreadyInside?stand:entrance));g.userData.hit.inside=true;g.userData.inWorkplace=site.id;g.userData.indoors='work';g.userData.place=site.id;g.visible=true;
   if(alreadyInside)g.rotation.y=0;
  }
  for(const [person,saved] of borrowed){
   if(!working(person))continue;
   const g=person.g;
   if(saved.arriving){g.userData.roomTransition=true;g.userData.activity='walking to work';if(!walk(person,saved.stand,dt))continue;saved.arriving=false;delete g.userData.roomTransition;}
   const base={place:'work',target:[saved.stand[0],saved.stand[2]],activity:'working at '+site.title},plan=interactions.plan(person,base,minutes,rain,dt);
   g.userData.place=site.id;g.userData.activity=plan.activity;
   if(g.userData.usingTownObject||g.userData.chatHold||g.userData.facePlayerUntil>performance.now())continue;
   walk(person,[plan.target[0],0,plan.target[1]],dt);
  }
 }
 function leave(){for(const person of [...borrowed.keys()])restore(person);interactions?.dispose();interactions=null;walker?.clear();walker=null;site=null;}
 return {enter(next,minutes){leave();if(!world.people.some(p=>p.profile.workSite===next.id))return;site=next;
  walker=createRoomWalk(collides,{bounds:getLayout()?.bounds});
  interactions=createTownActivities({getTargets,collides,getPlayerPosition,getState,ledger,inside:true});update(0,minutes,false,true);
 },update,restore:leave};
}
