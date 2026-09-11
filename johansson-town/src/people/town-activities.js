import * as THREE from '../../vendor/three.module.js';
import {residentPersonality,createResidentLedger} from './resident-personalities.js';
import {groundHeight} from '../world/layout.js?snappy=1';

// Interpret affordances, never player callbacks: NPCs must not open the player's
// menus, spend their money, remove quest items or trigger a journey on their behalf.
export function townAffordance(object){
 const label=object.userData.hit?.label||'',lower=label.toLowerCase();
 if(!label||object.userData.npcInteraction===false||object.userData.name||/^(talk|catch up|say hello|enter|exit|step outside|travel|board|return|take|pick up|ring service)/i.test(label))return null;
 let kind;
 if(/fish from|fishing/.test(lower))kind='fish';
 else if(/phone|telephone|call/.test(lower))kind='phone';
 else if(/arcade|star port|play/.test(lower))kind='arcade';
 else if(/radio|music|tune/.test(lower))kind='radio';
 else if(/post ?box|postcard|mail/.test(lower))kind='post';
 else if(/recycl|rubbish|bin/.test(lower))kind='recycle';
 else if(/^(buy|order)|vending/.test(lower))kind='shop';
 else if(/sit|rest on|bench/.test(lower))kind='seat';
 else if(/read|browse|ledger|notice|newspaper|book/.test(lower))kind='read';
 else if(/operate|use|test|switch|open|close/.test(lower))kind='machine';
 else if(/inspect|admire|look|listen|check/.test(lower))kind='inspect';
 else return null;
 const cost=Number(label.match(/[¥￥]\s*(\d+)/)?.[1]||(['shop','arcade','phone'].includes(kind)?kind==='phone'?10:kind==='arcade'?100:120:0));
 const item=/newspaper|book|postcard/.test(lower)?'paper':/rice|onigiri/.test(lower)?'rice':/bun/.test(lower)?'bun':/tea/.test(lower)?'tea':/beer/.test(lower)?'beer':'can';
 return {kind,label,cost,object,item};
}

const POSE={read:'Read',inspect:'Use',machine:'Use',radio:'Use',post:'Use',recycle:'Use',arcade:'Use',phone:'Phone',fish:'Fish',seat:'Sit',shop:'Use'};
const VERB={read:'reading',inspect:'examining',machine:'using',radio:'listening to',post:'posting a letter at',recycle:'sorting recycling at',arcade:'playing',phone:'making a call at',fish:'fishing at',seat:'resting at',shop:'buying a snack at'};
const eligible=place=>['work','evening','stroll','patrol'].includes(place);

export function createTownActivities({getTargets,collides,getPlayerPosition=()=>null,ledger=createResidentLedger(),getState=()=>({}),inside=false}){
 const active=new Map(),nextScan=new Map(),recent=new Map(),reservations=new Map();let serial=0;
 const point=new THREE.Vector3();
 function release(person,minutes,delay=25){
  const use=active.get(person);if(!use)return;
  reservations.delete(use.object);if(use.object.userData.reservedBy===person.profile.name)delete use.object.userData.reservedBy;
  if(use.kind==='seat'&&use.phase==='using')person.g.position.set(use.target[0],inside?0:groundHeight(...use.target),use.target[1]);
  for(const key of ['usingTownObject','heldItem','socialPose','seatHeight'])delete person.g.userData[key];
  recent.set(person,use.id);active.delete(person);nextScan.set(person,minutes+delay);
 }
 function approach(object,person){
  const seat=object.userData.seat;
  if(seat?.stand){const [x,,z]=seat.stand;if(!collides(x,z,.32))return [x,z];}
  object.getWorldPosition(point);const origin=point.clone(),angle=Math.atan2(person.g.position.z-origin.z,person.g.position.x-origin.x);
  for(const radius of [.8,1.1,1.45])for(const offset of [0,.65,-.65,1.3,-1.3,Math.PI]){
   const a=angle+offset,x=origin.x+Math.cos(a)*radius,z=origin.z+Math.sin(a)*radius;
   if(!collides(x,z,.32))return [x,z];
  }return null;
 }
 function start(person,base,minutes){
  const taste=residentPersonality(person.profile.name),range=base.place==='work'?7:18,player=getPlayerPosition();
  const candidates=[];
  for(const object of getTargets()){
   const affordance=townAffordance(object);if(!affordance||!!object.userData.hit.inside!==inside||!object.parent||!object.visible||reservations.has(object))continue;
   object.getWorldPosition(point);const distance=person.g.position.distanceTo(point);if(distance>range||Math.abs(point.y-person.g.position.y)>2.8||player&&point.distanceTo(player)<1.6)continue;
   if([...reservations.values()].some(use=>Math.hypot(use.location.x-point.x,use.location.z-point.z)<1.6))continue;
   const preference=taste.interests.indexOf(affordance.kind),id=affordance.kind+':'+Math.round(point.x*10)+':'+Math.round(point.z*10);
   if(base.place==='patrol'&&!['read','inspect','phone','post'].includes(affordance.kind))continue;
   if(affordance.cost>ledger.account(person.profile.name,minutes).yen)continue;
   candidates.push({...affordance,id,location:point.clone(),score:distance+(preference<0?5:preference)-((person.profile.name.length+Math.floor(minutes/30))%3)*.2+(recent.get(person)===id?20:0)});
  }
  candidates.sort((a,b)=>a.score-b.score);
  // Bound work per scan. Navigation handles the selected approach; a timeout
  // releases inaccessible objects without holding a chair or retrying each frame.
  for(const candidate of candidates.slice(0,5)){
   const target=approach(candidate.object,person);if(!target)continue;
   const use={...candidate,target,base:base.place,phase:'walking',remaining:candidate.kind==='fish'?22:candidate.kind==='seat'?18:10,deadline:minutes+36,paid:false,transaction:'errand-'+(++serial)+'-'+Math.floor(minutes)};
   active.set(person,use);reservations.set(candidate.object,use);candidate.object.userData.reservedBy=person.profile.name;return use;
  }return null;
 }
 function plan(person,base,minutes,rain,dt){
  const g=person.g;
  const interrupted=!eligible(base.place)||rain&&!inside||g.userData.chatHold||g.userData.facePlayerUntil>performance.now()||person.profile.name==='Kenji'&&getState().kenjiEscort==='walking';
  if(interrupted){release(person,minutes);return base;}
  let use=active.get(person);
  if(use&&(use.base!==base.place||!use.object.parent||!use.object.visible||minutes>use.deadline)){release(person,minutes);use=null;}
  const player=getPlayerPosition();
  if(use&&player&&player.distanceTo(use.location)<1.1){release(person,minutes,18);return base;}
  if(!use){
   if(!nextScan.has(person)){nextScan.set(person,minutes+3+(person.profile.name.length%5)*1.4);return base;}
   if(minutes<nextScan.get(person))return base;nextScan.set(person,minutes+15);
   use=start(person,base,minutes);if(!use)return base;
  }
  const arrived=Math.hypot(g.position.x-use.target[0],g.position.z-use.target[1])<.95;
  if(use.phase==='walking'&&arrived){
   if(!ledger.purchase(person.profile.name,minutes,use.transaction,use.label,use.cost)){release(person,minutes);return base;}
   use.paid=true;use.phase='using';use.deadline=minutes+use.remaining+2;g.userData.usingTownObject=true;
   if(use.kind==='seat'){
    const seat=use.object.userData.seat;
    if(seat?.position)g.position.set(...seat.position);
    g.userData.seatHeight=seat?Math.max(.35,(seat.eyeY||1.15)-.64):.51;
    if(Number.isFinite(seat?.yaw))g.rotation.y=seat.yaw;
   }
  }
  if(use.phase==='using'){
   use.remaining-=dt;
   if(use.kind!=='seat')g.rotation.y=Math.atan2(g.position.x-use.location.x,g.position.z-use.location.z);
   const shopping=use.kind==='shop'&&use.remaining<7;
   g.userData.socialPose=shopping?(use.item==='paper'?'Read':['rice','bun'].includes(use.item)?'EatStanding':'DrinkStanding'):POSE[use.kind];
   g.userData.heldItem=shopping?use.item:use.kind==='phone'?'phone':use.kind==='fish'?'rod':use.kind==='read'?'paper':null;
   if(use.remaining<=0){ledger.record(person.profile.name,minutes,VERB[use.kind]+' '+use.label);release(person,minutes,35);return base;}
  }
  return {place:'town-activity-'+use.id,target:use.target,activity:(use.phase==='walking'?'going to ':VERB[use.kind]+' ')+use.label};
 }
 return {plan,release,stateFor:person=>active.get(person),dispose(){for(const person of [...active.keys()])release(person,0);nextScan.clear();recent.clear();}};
}
