import {residentPlan,RAMEN_DOOR,YURI_HOME_DOOR} from './social.js';
// Reuse the street actor in the small ramen room, behind Sakura's counter, or in Yuri's bedroom.
export function createIndoorResidents({world,parent,place}){
 const borrowed=new Map();
 function restore(p){const saved=borrowed.get(p);if(!saved)return;const g=p.g;
  saved.parent.add(g);const door=place==='ramen'?RAMEN_DOOR:place==='home'?YURI_HOME_DOOR:p.profile.work;
  g.position.set(door[0]+(place==='ramen'?1.6:place==='home'?1.4:0),0,door[1]);g.quaternion.copy(saved.rotation);g.visible=false;g.userData.hit.inside=saved.inside;
  delete g.userData.inMarket;delete g.userData.inRamen;delete g.userData.inHome;delete g.userData.indoors;delete g.userData.socialPose;delete g.userData.seatHeight;borrowed.delete(p);
 }
 return {sync(minutes){
  const people=world.people.filter(p=>{
   if(residentPlan(p.profile,minutes).place!==place)return false;
   if(place==='home')return p.profile.name==='Yuri';
   return true;
  });
  for(const p of [...borrowed.keys()])if(!people.includes(p))restore(p);
  for(const p of people){const g=p.g;if(!borrowed.has(p)){borrowed.set(p,{parent:g.parent,rotation:g.quaternion.clone(),inside:g.userData.hit.inside});parent.add(g);}
   g.userData.hit.inside=true;g.userData.indoors=place;g.visible=true;
   if(place==='ramen'){
    if(p.profile.name==='Yuri'){g.userData.inRamen=true;delete g.userData.socialPose;delete g.userData.seatHeight;g.position.set(.97,0,-1.36);g.rotation.set(0,Math.PI/2,0);}
    else {g.userData.inRamen=true;g.userData.socialPose='Eat';g.userData.seatHeight=.59;g.position.set(-.4,0,1.36);g.rotation.set(0,0,0);}
   }else if(place==='home'){g.userData.inHome=true;delete g.userData.socialPose;delete g.userData.seatHeight;g.position.set(.05,0,.9);g.rotation.set(0,Math.PI/2,0);}
   else {g.userData.inMarket=true;g.position.set(3.35,0,-1.95);g.rotation.set(0,Math.PI,0);}
   const home=world.homes?.get(p.profile.name);if(home)home.occupied=place==='home';
  }return people.map(p=>p.profile.name);
 },restore(){for(const p of [...borrowed.keys()])restore(p);}};
}