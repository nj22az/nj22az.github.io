import {residentPlan,RAMEN_DOOR} from './social.js';
// Reuse the street actor in the small ramen room or behind Sakura's counter.
export function createIndoorResidents({world,parent,place}){
 const borrowed=new Map();
 function restore(p){const saved=borrowed.get(p);if(!saved)return;const g=p.g;
  saved.parent.add(g);const door=place==='ramen'?RAMEN_DOOR:p.profile.work;
  g.position.set(door[0],0,door[1]);g.quaternion.copy(saved.rotation);g.visible=false;g.userData.hit.inside=saved.inside;
  delete g.userData.inMarket;delete g.userData.inRamen;delete g.userData.socialPose;delete g.userData.seatHeight;borrowed.delete(p);
 }
 return {sync(minutes){
  const people=world.people.filter(p=>residentPlan(p.profile,minutes).place===place);
  for(const p of [...borrowed.keys()])if(!people.includes(p))restore(p);
  for(const p of people){const g=p.g;if(!borrowed.has(p)){borrowed.set(p,{parent:g.parent,rotation:g.quaternion.clone(),inside:g.userData.hit.inside});parent.add(g);}
   g.userData.hit.inside=true;g.userData.indoors=place;g.visible=true;
   if(place==='ramen'){g.userData.inRamen=true;g.userData.socialPose='Eat';g.userData.seatHeight=.59;g.position.set(-.4,0,1.36);g.rotation.set(0,0,0);}
   else {g.userData.inMarket=true;g.position.set(3.35,0,-1.95);g.rotation.set(0,Math.PI,0);}
   const home=world.homes?.get(p.profile.name);if(home)home.occupied=false;
  }return people.map(p=>p.profile.name);
 },restore(){for(const p of [...borrowed.keys()])restore(p);}};
}
