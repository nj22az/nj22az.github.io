import {groundHeight} from '../world/layout.js?snappy=1';
import {RAMEN_GUEST_SEATS,RAMEN_YURI_SPOT,RAMEN_LAYOUT} from '../world/interiors/ramen-layout.js';
import {STORE_CLERK_POSITION,STORE_SEATS} from '../world/interiors/store-layout.js';
import {residentPlan,RAMEN_DOOR,IZAKAYA_DOOR,IZAKAYA_SEATS} from './social.js';
import {createRoomWalk,atDestination} from './room-walk.js';

// One actor belongs to one location. New visitors cross the door and walk to a
// reserved place; changing the clock sends seated guests back to the exit.
export function createIndoorResidents({world,parent,place,getState=()=>({}),getPlayerSeat=()=>null,onBorrow=()=>{},collides=()=>false,getRain=()=>false}){
 const borrowed=new Map();let clock=0,walker=null;
 const entrance=place==='ramen'?[RAMEN_LAYOUT.spawn[0],0,3.2]:place==='izakaya'?[0,0,5.2]:[0,0,5.2];
 const door=p=>place==='ramen'?RAMEN_DOOR:place==='izakaya'?IZAKAYA_DOOR:world.people.find(p=>p.profile.name==='Yuri').profile.work;
 const wanted=p=>residentPlan(p.profile,clock,getRain()).place===place&&!(p.profile.name==='Kenji'&&getState().kenjiEscort==='walking');
 function restore(p){
  const saved=borrowed.get(p);if(!saved)return;const g=p.g,point=door(p),remaining=wanted(p);
  saved.parent.add(g);g.position.set(point[0],groundHeight(...point),point[1]);g.quaternion.copy(saved.rotation);g.userData.hit.inside=saved.inside;
  for(const key of ['inMarket','inRamen','inIzakaya','indoors','socialPose','seatHeight','ramenSeat','storeSeatId','serving','heldItem','mealState','residentSpeech','roomTransition','carrying'])delete g.userData[key];
  if(remaining)g.userData.indoors=place;g.visible=!remaining;borrowed.delete(p);
 }
 function seatFor(p){
  const name=p.profile.name;
  if(place==='market'&&name==='Yuri')return {position:STORE_CLERK_POSITION,stand:STORE_CLERK_POSITION,yaw:Math.PI,staff:true};
  if(place==='ramen'&&name==='Yuri')return {...RAMEN_YURI_SPOT,stand:[RAMEN_LAYOUT.spawn[0],0,2.9]};
  if(place==='izakaya'&&name==='Nao')return {position:[3.5,0,-3.8],stand:[3.5,0,-3.8],yaw:Math.PI,staff:true};
  const seats=place==='ramen'?RAMEN_GUEST_SEATS:place==='market'?STORE_SEATS:IZAKAYA_SEATS.map(([x,z],i)=>({position:[x,0,z],height:i<5?.71:.565,yaw:i===5||i===6?Math.PI:0,stand:i<5?[x,0,z+.8]:i<7?[x,0,z-.8]:[4.4,0,z]}));
  const index=seats.findIndex((s,i)=>(place!=='market'||i>=2&&s.id!==getPlayerSeat())&&![...borrowed.values()].some(v=>v.index===i&&!v.seat.staff));
  if(index<0)return null;const seat=seats[index];
  return {...seat,index,stand:seat.stand||[1.16,0,seat.position[2]]};
 }
 function moveAcrossSeat(g,from,to,amount){g.position.set(from[0]+(to[0]-from[0])*amount,0,from[2]+(to[2]-from[2])*amount);}
 function sync(minutes,dt=0){
  clock=minutes;walker??=createRoomWalk(collides);
  for(const p of world.people){
   const g=p.g;let saved=borrowed.get(p);
   if(!saved){
    if(!wanted(p)||!atDestination(p,place,door(p)))continue;
    const seat=seatFor(p);if(!seat)continue;
    const settled=g.userData.indoors===place&&!g.userData.justArrived;
    onBorrow(p,minutes);saved={parent:g.parent,rotation:g.quaternion.clone(),inside:g.userData.hit.inside,seat,index:seat.index,phase:settled?'seated':'arriving',blend:settled?1:0};borrowed.set(p,saved);parent.add(g);
    g.position.set(...(settled?seat.position:entrance));g.rotation.set(0,seat.yaw,0);
   }
   g.visible=true;g.userData.hit.inside=true;g.userData.indoors=place;
   g.userData[place==='ramen'?'inRamen':place==='market'?'inMarket':'inIzakaya']=true;g.userData.place=place;
   if(!wanted(p)&&!['standing','leaving'].includes(saved.phase))saved.phase=saved.phase==='seated'?'standing':'leaving';
   const seat=saved.seat;
   if(saved.phase!=='seated'){
    g.userData.roomTransition=true;
    for(const key of ['socialPose','seatHeight','storeSeatId','heldItem','mealState','serving','carrying'])delete g.userData[key];
    g.userData.activity=['standing','leaving'].includes(saved.phase)?'leaving '+place:'walking to '+(seat.staff?'work':'a seat');
    if(saved.phase==='standing'){
     saved.blend=Math.max(0,saved.blend-dt*2);moveAcrossSeat(g,seat.stand,seat.position,saved.blend);if(saved.blend===0)saved.phase='leaving';
    }else if(saved.phase==='leaving'){
     if(walker.move(p,entrance,dt))restore(p);
    }else if(saved.phase==='arriving'){
     if(walker.move(p,seat.stand,dt))saved.phase='sitting';
    }else if(saved.phase==='sitting'){
     saved.blend=Math.min(1,saved.blend+dt*2);moveAcrossSeat(g,seat.stand,seat.position,saved.blend);if(saved.blend===1)saved.phase='seated';
    }
    continue;
   }
   delete g.userData.roomTransition;
   if(!seat.staff){g.position.set(...seat.position);g.rotation.set(0,seat.yaw,0);}
   if(Number.isFinite(seat.height)){g.userData.seatHeight=seat.height;if(!g.userData.mealState)g.userData.socialPose='Sit';}
   if(place==='market'&&!seat.staff)g.userData.storeSeatId=seat.id;
   if(place==='ramen')g.userData.ramenSeat=seat.index;
   if(!g.userData.mealState)g.userData.activity=seat.staff?p.profile.role:'relaxing at '+place;
   const home=world.homes?.get(p.profile.name);if(home)home.occupied=false;
  }
  return [...borrowed.keys()].map(p=>p.profile.name);
 }
 return {sync,names:()=>[...borrowed.keys()].map(p=>p.profile.name),restore(){for(const p of [...borrowed.keys()])restore(p);walker?.clear();walker=null;}};
}
