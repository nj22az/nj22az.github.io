import {IZAKAYA_DOOR,IZAKAYA_SEATS,supperGuests} from './social.js';
// Reparent existing entities while inside; restore their exact street state on exit.
export function createIzakayaGuests({world,parent,register,onTalk}){
 const borrowed=new Map();
 function restore(person){const g=person.g,saved=borrowed.get(person);if(!saved)return;g.parent?.remove(g);saved.parent.add(g);g.position.copy(saved.position);g.quaternion.copy(saved.rotation);g.visible=saved.visible;g.userData.hit.inside=saved.inside;delete g.userData.socialPose;delete g.userData.inIzakaya;borrowed.delete(person);}
 function sync(minutes){
  const guests=supperGuests(minutes),names=['Nao',...guests.map(p=>p.name)];
  for(const person of [...borrowed.keys()])if(!names.includes(person.g.userData.name))restore(person);
  names.forEach((name,i)=>{const person=world.people.find(p=>p.g.userData.name===name);if(!person)return;const g=person.g;
   if(!borrowed.has(person)){borrowed.set(person,{parent:g.parent,position:g.position.clone(),rotation:g.quaternion.clone(),visible:g.visible,inside:g.userData.hit.inside});parent.add(g);}
   const seat=i===0?[3.5,-3.8]:IZAKAYA_SEATS[i-1];g.position.set(seat[0],0,seat[1]);g.rotation.set(0,i===0?Math.PI:i>5?Math.PI:0,0);g.visible=true;g.userData.hit.inside=true;g.userData.inIzakaya=true;g.userData.socialPose=i===0?'Idle_Neutral':Math.floor(minutes/3+i)%3===0?'Drink':Math.floor(minutes/3+i)%3===1?'Eat':'Sit';
  });return names;
 }
 return {sync,names:()=>[...borrowed.keys()].map(p=>p.g.userData.name),restore(){for(const p of [...borrowed.keys()])restore(p);}};
}
