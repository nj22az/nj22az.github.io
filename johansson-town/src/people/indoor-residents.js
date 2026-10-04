import {groundHeight} from '../world/layout.js?snappy=1';
import {STORE_CLERK_POSITION,STORE_SEATS} from '../world/interiors/store-layout.js';
import {residentPlan,RAMEN_DOOR,IZAKAYA_DOOR,IZAKAYA_SEATS} from './social.js';
import {createRoomWalk,atDestination} from './room-walk.js';
import {izakayaJob} from './izakaya-hours.js';
import {ONSEN_DOOR,ONSEN_ENTRY_RADIUS} from '../world/onsen-layout.js';
import {ONSEN_SEATS} from '../world/interiors/onsen.js';
import {SATO_GUEST_SEATS,SATO_COOK,SATO_ROOM} from '../world/sato-ramen-layout.js';

// One actor belongs to one location. New visitors cross the door and walk to a
// reserved place; changing the clock sends seated guests back to the exit.
export function createIndoorResidents({world,parent,place,getState=()=>({}),getPlayerSeat=()=>null,onBorrow=()=>{},canLeave=()=>true,getStandingVisit=()=>null,collides=()=>false,getRain=()=>false,layout=null}){
 const borrowed=new Map();let clock=0,walker=null;
 // On the island the ramen counter is Sato Ramen, beside Minato (world/sato-ramen-layout.js).
 const sato=(place==='ramen');
 const entrance=layout?.entrance|| (sato?[SATO_ROOM.spawn[0],0,SATO_ROOM.spawn[2]]:[0,0,5.2]);
 const door=p=>place==='ramen'?RAMEN_DOOR:place==='izakaya'?IZAKAYA_DOOR:place==='onsen'?ONSEN_DOOR:world.people.find(p=>p.profile.name==='Thuan').profile.work;
 const wanted=p=>residentPlan(p.profile,clock,getRain(),getState()).place===place&&!(p.profile.name==='Kenji'&&getState().kenjiEscort==='walking');
 function restore(p){
  const saved=borrowed.get(p);if(!saved)return;const g=p.g,point=door(p),remaining=wanted(p);
  saved.parent.add(g);g.position.set(point[0],groundHeight(...point),point[1]);g.quaternion.copy(saved.rotation);g.userData.hit.inside=saved.inside;
  for(const key of ['inMarket','inRamen','inIzakaya','inOnsen','outfit','indoors','socialPose','seatHeight','chairBlend','floorHeight','ramenSeat','storeSeatId','serving','heldItem','mealState','residentSpeech','roomTransition','carrying','carriedTray','shopGoods','shopReach','shopping','tool'])delete g.userData[key];
  if(remaining)g.userData.indoors=place;g.visible=!remaining;borrowed.delete(p);walker?.forget(p);
 }
 function seatFor(p){
  const name=p.profile.name;
  const standing=getStandingVisit(p,clock);if(standing)return {position:standing,stand:standing,yaw:0,managed:true};
  if(place==='market'&&name==='Thuan')return {position:layout?.staff||STORE_CLERK_POSITION,stand:layout?.staff||STORE_CLERK_POSITION,yaw:layout?.staffYaw??Math.PI,staff:true};
  if(sato&&name==='Mrs Sato')return {position:[...SATO_COOK.position],stand:[...SATO_COOK.position],yaw:SATO_COOK.yaw,staff:true};
  if(place==='izakaya'&&name==='Nao')return {position:[3.5,0,-3.8],stand:[3.5,0,-3.8],yaw:Math.PI,staff:true};
  // Umi-no-yu: into the rock bath by the sea wall, leaving the other side for the player.
  if(place==='onsen'){
   const seat=ONSEN_SEATS[getPlayerSeat()==='rockBeside'?'rock':'rockBeside'];
   return {id:seat.id,position:seat.position,stand:seat.stand,yaw:seat.yaw,height:seat.surfaceY,soak:true};
  }
  const seats=sato?SATO_GUEST_SEATS:place==='market'?STORE_SEATS:IZAKAYA_SEATS.map(([x,z],i)=>({position:[x,0,z],height:i<5?.71:.565,yaw:i===5||i===6?Math.PI:0,stand:i<5?[x,0,z+.8]:i<7?[x,0,z-.8]:[4.4,0,z]}));
  if(place==='izakaya'&&name==='Barfly'){
   // His own stool, at the kitchen end of the counter, where he sleeps when Minato is shut.
   const index=4;if([...borrowed.values()].some(v=>v.index===index&&!v.seat.staff))return null;
   return {...seats[index],index};
  }
  // A seat the player is sitting on is taken: at Minato they may have any free stool.
  const mine=getPlayerSeat(),taken=s=>Array.isArray(mine)&&Math.hypot(s.position[0]-mine[0],s.position[2]-mine[2])<.4;
  const index=seats.findIndex((s,i)=>(place!=='market'||i>=2&&s.id!==mine)&&!taken(s)&&![...borrowed.values()].some(v=>v.index===i&&!v.seat.staff));
  if(index<0)return null;const seat=seats[index];
  return {...seat,index,stand:seat.stand||[1.16,0,seat.position[2]]};
 }
 function moveAcrossSeat(g,from,to,amount){g.position.set(from[0]+(to[0]-from[0])*amount,0,from[2]+(to[2]-from[2])*amount);}
 function sync(minutes,dt=0){
  clock=minutes;
  // The shared Minato building runs on to x 11.4 (Sato Ramen): past the default bounds, a walker there had no route and stood at the door.
  walker??=createRoomWalk(collides,{bounds:{minX:-8,maxX:12,minZ:-8,maxZ:8}});
  for(const p of world.people){
   const g=p.g;let saved=borrowed.get(p);
   if(!saved){
    if(!wanted(p)||!atDestination(p,place,door(p),place==='onsen'?ONSEN_ENTRY_RADIUS:.85))continue;
    const seat=seatFor(p);if(!seat)continue;
    const settled=g.userData.indoors===place&&!g.userData.justArrived;
    walker.forget(p);onBorrow(p,minutes);saved={parent:g.parent,rotation:g.quaternion.clone(),inside:g.userData.hit.inside,seat,index:seat.index,phase:settled||seat.managed?'seated':'arriving',blend:settled?1:0};borrowed.set(p,saved);parent.add(g);
    // Face the path we will walk. Using seat.yaw at the door made visitors moonwalk
    // toward their stand (Walk clip forward, body aimed at the chair).
    if(settled||seat.managed){g.position.set(...seat.position);g.rotation.set(0,seat.yaw,0);}
    else{
     const stand=seat.stand||seat.position;
     g.position.set(...entrance);
     const dx=stand[0]-entrance[0],dz=stand[2]-entrance[2];
     g.rotation.set(0,Math.hypot(dx,dz)>.001?Math.atan2(-dx,-dz):seat.yaw,0);
    }
   }
   g.visible=true;g.userData.hit.inside=true;g.userData.indoors=place;
   g.userData[place==='ramen'?'inRamen':place==='market'?'inMarket':place==='onsen'?'inOnsen':'inIzakaya']=true;g.userData.place=place;
   // Changed at the lockers by the door: in and out of the bath in swimwear.
   if(place==='onsen')g.userData.outfit='swim';
   // Closed Minato: whoever is there works through their cleaning stations
   // (izakaya-hours.js), walking from one to the next; when the job ends they go back
   // to their own place (the Barfly to his stool).
   if(place==='izakaya'&&['seated','arriving'].includes(saved.phase)&&wanted(p)){
    const job=izakayaJob(p.profile.name,clock),key=job?.key||null;
    if(key!==(saved.jobKey??null)){
     saved.jobKey=key;
     const next=job?{position:[...job.at],stand:[...job.at],yaw:job.yaw,staff:true,job}:(saved.seat.job?seatFor(p):null);
     if(next){
      delete g.userData.socialPose;delete g.userData.tool;delete g.userData.seatHeight;
      // Off a seat first (seats sit inside their furniture), then walk to the next place.
      if(saved.phase==='seated'&&Number.isFinite(saved.seat.height)){saved.pending=next;saved.phase='standing';saved.blend=1;}
      else{saved.seat=next;saved.index=next.index;saved.phase='arriving';saved.blend=0;}
     }
    }
   }
   const seat=saved.seat;
   // Staff can be at a break chair or carrying an order when their shift ends.
   // Let the service finish standing/returning before the exit walker takes over.
   if(!wanted(p)&&!['standing','leaving'].includes(saved.phase)&&canLeave(p))saved.phase=saved.phase==='seated'&&Number.isFinite(seat.height)?'standing':'leaving';
   if(saved.phase!=='seated'){
    g.userData.roomTransition=true;
    for(const key of ['socialPose','seatHeight','storeSeatId','heldItem','mealState','serving','carrying','carriedTray','shopGoods','shopReach','shopping'])delete g.userData[key];
    g.userData.activity=saved.pending||saved.phase==='arriving'&&seat.job?'getting up to work':['standing','leaving'].includes(saved.phase)?'leaving '+place:'walking to '+(seat.staff?'work':'a seat');
    if(saved.phase==='standing'){
     saved.blend=Math.max(0,saved.blend-dt*2);moveAcrossSeat(g,seat.stand,seat.position,saved.blend);if(saved.blend===0){if(saved.pending){saved.seat=saved.pending;saved.index=saved.pending.index;delete saved.pending;saved.phase='arriving';}else saved.phase='leaving';}
    }else if(saved.phase==='leaving'){
     if(walker.move(p,entrance,dt))restore(p);
    }else if(saved.phase==='arriving'){
     if(walker.move(p,seat.stand,dt)){g.rotation.set(0,seat.yaw,0);saved.phase='sitting';}
    }else if(saved.phase==='sitting'){
     saved.blend=Math.min(1,saved.blend+dt*2);moveAcrossSeat(g,seat.stand,seat.position,saved.blend);if(saved.blend===1)saved.phase='seated';
    }
    continue;
   }
   delete g.userData.roomTransition;
   if(!seat.staff&&!seat.managed){g.position.set(...seat.position);g.rotation.set(0,seat.yaw,0);}
   if(Number.isFinite(seat.height)){g.userData.seatHeight=seat.height;if(!g.userData.mealState)g.userData.socialPose=seat.soak?'Soak':'Sit';}
   if(place==='market'&&!seat.staff&&!seat.managed)g.userData.storeSeatId=seat.id;
   if(place==='ramen')g.userData.ramenSeat=seat.index;
   if(seat.job){g.userData.socialPose=seat.job.pose;if(seat.job.tool)g.userData.tool=seat.job.tool;else delete g.userData.tool;g.userData.activity=seat.job.activity;continue;}
   // Mrs Sato's kitchen (people/ramen-kitchen.js) hands her a cloth or a glass itself.
   if(!g.userData.kitchen)delete g.userData.tool;
   if(!seat.managed&&!g.userData.mealState&&!(seat.staff&&g.userData.serving))g.userData.activity=seat.staff?p.profile.role:seat.soak?'soaking in the rock bath':'relaxing at '+place;
   const home=world.homes?.get(p.profile.name);if(home)home.occupied=false;
  }
  return [...borrowed.keys()].map(p=>p.profile.name);
 }
 return {sync,names:()=>[...borrowed.keys()].map(p=>p.profile.name),restore(){for(const p of [...borrowed.keys()])restore(p);walker?.clear();walker=null;}};
}
