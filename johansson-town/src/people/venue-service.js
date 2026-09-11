import * as THREE from '../../vendor/three.module.js';
import {createResidentProp} from './resident-props.js';
import {createResidentLedger,residentPersonality} from './resident-personalities.js';

const LABELS={beer:'beer',tea:'green tea',rice:'rice',yakitori:'yakitori',fish:'grilled fish',ramen:'ramen'};
// Persistent meal records stop guests ordering again when the player re-enters.
// Only the currently occupied room owns table props; no offscreen room is loaded.
export function createVenueService({room,place,getCustomers,getMinutes,getStaff=()=>null,ledger=createResidentLedger()}){
 const settings=new Map();let serving=null,timer=0;
 function clear(person){for(const key of ['heldItem','mealState','residentSpeech'])delete person.g.userData[key];}
 function remove(person){const setting=settings.get(person);if(!setting)return;for(const prop of [setting.food,setting.drink]){prop.removeFromParent();prop.geometry.dispose();prop.material.dispose();}settings.delete(person);clear(person);if(serving===person){serving=null;timer=0;}}
 function table(person,prop,side){
  const g=person.g,forward=new THREE.Vector3(-Math.sin(g.rotation.y),0,-Math.cos(g.rotation.y)),right=new THREE.Vector3(Math.cos(g.rotation.y),0,-Math.sin(g.rotation.y));
  prop.position.copy(g.position).addScaledVector(forward,place==='ramen'?.40:g.userData.seatHeight>.65?.78:.60).addScaledVector(right,side*.15);
  prop.position.y=place==='ramen'?1.04:g.userData.seatHeight>.65?1.16:1.01;
 }
 return {update(dt){
  const minutes=getMinutes(),present=getCustomers().filter(p=>p.profile.name!=='Nao'&&p.g.visible&&p.g.userData.visualReady!==false);
  for(const p of [...settings.keys()])if(!present.includes(p))remove(p);
  for(const person of present){
   const name=person.profile.name,account=ledger.account(name,minutes),taste=residentPersonality(name);account.meals??={};
   const record=account.meals[place]??={item:place==='ramen'?'ramen':taste.meal,drink:place==='ramen'?'tea':taste.drink,delivered:false,eaten:0,finished:false};
   let setting=settings.get(person);if(setting&&setting.record!==record){remove(person);setting=null;}
   if(!setting){
    const food=createResidentProp(record.item),drink=createResidentProp(record.drink);food.visible=drink.visible=false;room.add(food,drink);setting={record,food,drink};settings.set(person,setting);
    if(!record.delivered&&!record.finished)person.g.userData.residentSpeech={text:place==='ramen'?'One ramen, please.':'A '+LABELS[record.drink]+' and '+LABELS[record.item]+', please, Nao.',until:minutes+5};
   }
   const data=person.g.userData,seated=Number.isFinite(data.seatHeight);
   if(record.finished){data.socialPose=seated?'Sit':'Idle_Neutral';delete data.heldItem;data.mealState='finished';data.activity='relaxing after '+LABELS[record.item];setting.food.visible=setting.drink.visible=false;continue;}
   if(!record.delivered){
    data.socialPose=seated?'Sit':'Idle_Neutral';data.mealState='ordered';data.activity='waiting for '+LABELS[record.item]+' and '+LABELS[record.drink];
    if(!serving){serving=person;timer=2.8;}
   }else{
    record.eaten+=dt;const phase=Math.floor(record.eaten/3)%4,drink=phase===0,eat=phase===2;
    data.mealState='eating';data.socialPose=drink?(seated?'Drink':'DrinkStanding'):eat?(seated?'Eat':'EatStanding'):seated?'Sit':'Idle_Neutral';data.heldItem=drink?record.drink:eat?record.item:null;
    data.activity=drink?'drinking '+LABELS[record.drink]+' at '+(place==='ramen'?'Inakaya':'Minato'):eat?'eating '+LABELS[record.item]:'enjoying supper';
    table(person,setting.food,-1);table(person,setting.drink,1);setting.food.visible=seated&&!eat;setting.drink.visible=seated&&!drink;
    if(record.eaten>=42){record.finished=true;ledger.record(name,minutes,'enjoyed '+LABELS[record.item]+' and '+LABELS[record.drink]+' at '+place);}
   }
  }
  const staff=getStaff();if(staff){staff.userData.serving=!!serving;staff.userData.socialPose=serving?'Use':'Idle_Neutral';staff.userData.activity=serving?'preparing '+settings.get(serving)?.record.drink+' for '+serving.profile.name:'welcoming the evening guests';}
  if(serving&&(timer-=dt)<=0){
   const {record}=settings.get(serving),cost=place==='ramen'?300:({yakitori:180,fish:260,rice:150}[record.item]||180)+(record.drink==='beer'?180:120);
   if(ledger.purchase(serving.profile.name,minutes,place+'-meal',record.item+' + '+record.drink,cost)){record.delivered=true;serving.g.userData.residentSpeech={text:place==='ramen'?'That smells wonderful.':'Thank you, Nao.',until:minutes+4};}
   else record.finished=true;
   serving=null;
  }
 },dispose(){for(const person of [...settings.keys()])remove(person);const staff=getStaff();if(staff){delete staff.userData.serving;delete staff.userData.socialPose;}}};
}
