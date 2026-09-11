import {IZAKAYA_SEATS,IZAKAYA_DOOR,izakayaOpen,supperGuests,residentPlan} from './social.js';
import {YURI_PROFILE} from './residents.js';

// Borrow the same actors indoors and reserve their chairs until they depart.
export function createIzakayaGuests({world,parent,getYuri=()=>null,getState=()=>({}),onBorrow=()=>{}}){
 const borrowed=new Map();let yuriPerson=null;
 function restore(person){
  const g=person.g,saved=borrowed.get(person);if(!saved)return;const n=borrowed.size-1;
  saved.parent.add(g);g.position.set(IZAKAYA_DOOR[0]+1.6+(n%3)*.45,0,IZAKAYA_DOOR[1]+(Math.floor(n/3)-1)*.55);g.quaternion.copy(saved.rotation);g.visible=saved.visible;g.userData.hit.inside=saved.inside;
  for(const key of ['socialPose','seatHeight','inIzakaya','indoors','heldItem','mealState','residentSpeech'])delete g.userData[key];borrowed.delete(person);
 }
 function sync(minutes){
  const names=izakayaOpen(minutes)?['Nao',...supperGuests(minutes).filter(p=>!(p.name==='Kenji'&&getState().kenjiEscort==='walking')).map(p=>p.name)]:[];
  if(residentPlan(YURI_PROFILE,minutes).place==='izakaya'){
   const g=getYuri();if(g){yuriPerson=world.people.find(p=>p.g===g)||{g,profile:YURI_PROFILE};names.push('Yuri');}
  }
  for(const person of [...borrowed.keys()])if(!names.includes(person.g.userData.name))restore(person);
  for(const name of names){
   const person=name==='Yuri'?yuriPerson:world.people.find(p=>p.g.userData.name===name);if(!person)continue;const g=person.g;
   if(!borrowed.has(person)){
    const seatIndex=name==='Nao'?-1:IZAKAYA_SEATS.findIndex((_,i)=>![...borrowed.values()].some(saved=>saved.seatIndex===i));
    if(seatIndex<0&&name!=='Nao'&&name!=='Yuri')continue;
    onBorrow(person,minutes);borrowed.set(person,{parent:g.parent,rotation:g.quaternion.clone(),visible:g.visible,inside:g.userData.hit.inside,seatIndex});parent.add(g);
   }
   const index=borrowed.get(person).seatIndex,seat=name==='Nao'?[3.5,-3.8]:index>=0?IZAKAYA_SEATS[index]:[4.5,1.3];
   g.position.set(seat[0],0,seat[1]);g.rotation.set(0,name==='Nao'?Math.PI:index<0?Math.PI/2:index===5||index===6?Math.PI:0,0);
   g.visible=true;g.userData.hit.inside=true;g.userData.inIzakaya=true;g.userData.indoors='izakaya';g.userData.place='izakaya';
   if(index<0){delete g.userData.seatHeight;if(!g.userData.mealState)g.userData.socialPose='Idle_Neutral';}
   else {g.userData.seatHeight=index<5?.71:.565;if(!g.userData.mealState)g.userData.socialPose='Sit';}
   const home=world.homes?.get(name);if(home)home.occupied=false;
  }
  return [...borrowed.keys()].map(p=>p.g.userData.name);
 }
 return {sync,names:()=>[...borrowed.keys()].map(p=>p.g.userData.name),restore(){for(const p of [...borrowed.keys()])restore(p);}};
}
