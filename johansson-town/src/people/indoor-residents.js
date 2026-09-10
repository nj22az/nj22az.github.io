import {RAMEN_GUEST_SEATS,RAMEN_YURI_SPOT} from '../world/interiors/ramen-layout.js';
import {STORE_CLERK_POSITION} from '../world/interiors/store-layout.js';
import {residentPlan,RAMEN_DOOR,YURI_HOME_DOOR} from './social.js';
// Reuse the street actor in the small ramen room, behind Sakura's counter, or in Yuri's bedroom.
export function createIndoorResidents({world,parent,place,getState=()=>({})}){
 const borrowed=new Map();let clock=0;
 function restore(p){const saved=borrowed.get(p);if(!saved)return;const g=p.g;
  saved.parent.add(g);const door=place==='ramen'?RAMEN_DOOR:place==='home'?YURI_HOME_DOOR:p.profile.work;
  g.position.set(door[0]+(place==='ramen'?1.6:place==='home'?1.4:0),0,door[1]);g.quaternion.copy(saved.rotation);g.visible=false;g.userData.hit.inside=saved.inside;
  delete g.userData.inMarket;delete g.userData.inRamen;delete g.userData.inHome;delete g.userData.indoors;delete g.userData.socialPose;delete g.userData.seatHeight;delete g.userData.ramenSeat;
  if(place==='ramen'&&residentPlan(p.profile,clock).place==='ramen'&&!(p.profile.name==='Kenji'&&getState().kenjiEscort==='walking'))g.userData.indoors='ramen';
  borrowed.delete(p);
 }
 return {sync(minutes){
  clock=minutes;
  const people=world.people.filter(p=>{
   if(place==='ramen'&&p.profile.name==='Kenji'&&getState().kenjiEscort==='walking')return false;
   if(residentPlan(p.profile,minutes).place!==place)return false;
   if(place==='home')return p.profile.name==='Yuri';
   return true;
  });
  for(const p of [...borrowed.keys()])if(!people.includes(p))restore(p);
  for(const p of people){const g=p.g;if(!borrowed.has(p)){
    let seatIndex=null;
    if(place==='ramen'&&p.profile.name!=='Yuri'){
     seatIndex=RAMEN_GUEST_SEATS.findIndex((_,i)=>![...borrowed.values()].some(saved=>saved.seatIndex===i));
     if(seatIndex<0)continue;
    }
    borrowed.set(p,{parent:g.parent,rotation:g.quaternion.clone(),inside:g.userData.hit.inside,seatIndex});parent.add(g);
   }
   g.userData.hit.inside=true;g.userData.indoors=place;g.visible=true;
   if(place==='ramen'){
    g.userData.inRamen=true;g.userData.place='ramen';g.userData.activity='a bowl of ramen at Inakaya';
    if(p.profile.name==='Yuri'){
     delete g.userData.socialPose;delete g.userData.seatHeight;
     g.position.set(...RAMEN_YURI_SPOT.position);g.rotation.set(0,RAMEN_YURI_SPOT.yaw,0);
    }else {
     const index=borrowed.get(p).seatIndex,seat=RAMEN_GUEST_SEATS[index];
     g.userData.ramenSeat=index;g.userData.seatHeight=seat.height;
     g.userData.socialPose=['Eat','Sit','Drink'][Math.floor(minutes/4+index)%3];
     g.position.set(...seat.position);g.rotation.set(0,seat.yaw,0);
    }
   }else if(place==='home'){g.userData.inHome=true;delete g.userData.socialPose;delete g.userData.seatHeight;g.position.set(.05,0,.9);g.rotation.set(0,Math.PI/2,0);}
   else {g.userData.inMarket=true;g.position.set(...STORE_CLERK_POSITION);g.rotation.set(0,Math.PI,0);}
   const home=world.homes?.get(p.profile.name);if(home)home.occupied=place==='home';
  }return [...borrowed.keys()].map(p=>p.profile.name);
 },restore(){for(const p of [...borrowed.keys()])restore(p);}};
}
