import {IZAKAYA_SEATS,IZAKAYA_DOOR,izakayaOpen,supperGuests,yuriVisitsIzakaya} from './social.js';
// Borrow the existing cast indoors; departures resume at the restaurant door.
export function createIzakayaGuests({world,parent,getYuri=()=>null}){
 const borrowed=new Map();
 let yuriPerson=null;
 function restore(person){const g=person.g,saved=borrowed.get(person);if(!saved)return;g.parent?.remove(g);saved.parent.add(g);g.position.set(IZAKAYA_DOOR[0],0,IZAKAYA_DOOR[1]);g.quaternion.copy(saved.rotation);g.visible=saved.visible;g.userData.hit.inside=saved.inside;delete g.userData.socialPose;delete g.userData.inIzakaya;borrowed.delete(person);}
 function sync(minutes){
  const guests=supperGuests(minutes),names=izakayaOpen(minutes)?['Nao',...guests.map(p=>p.name)]:[];
  if(yuriVisitsIzakaya(minutes)){const g=getYuri();if(g){yuriPerson??={g};names.push('Yuri');}}
  for(const person of [...borrowed.keys()])if(!names.includes(person.g.userData.name))restore(person);
  names.forEach((name,i)=>{const person=name==='Yuri'?yuriPerson:world.people.find(p=>p.g.userData.name===name);if(!person)return;const g=person.g;
   if(!borrowed.has(person)){borrowed.set(person,{parent:g.parent,position:g.position.clone(),rotation:g.quaternion.clone(),visible:g.visible,inside:g.userData.hit.inside});parent.add(g);}
   const seat=name==='Yuri'?[4.5,1.3]:i===0?[3.5,-3.8]:IZAKAYA_SEATS[i-1];g.position.set(seat[0],0,seat[1]);g.rotation.set(0,name==='Yuri'?Math.PI/2:i===0?Math.PI:i>5?Math.PI:0,0);g.visible=true;g.userData.hit.inside=true;g.userData.inIzakaya=true;g.userData.indoors='izakaya';const home=world.homes?.get(name);if(home)home.occupied=false;
   // Yuri keeps her own idle/greeting clips and proportions, standing by the table.
   if(name==='Yuri')delete g.userData.socialPose;
   else g.userData.socialPose=i===0?'Idle_Neutral':Math.floor(minutes/3+i)%3===0?'Drink':Math.floor(minutes/3+i)%3===1?'Eat':'Sit';
  });return names;
 }
 return {sync,names:()=>[...borrowed.keys()].map(p=>p.g.userData.name),restore(){for(const p of [...borrowed.keys()])restore(p);}};
}
