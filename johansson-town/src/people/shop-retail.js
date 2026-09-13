import * as THREE from '../../vendor/three.module.js';

import {SHOP_STOCK,stockSpec,takeShopStock,returnShopStock,restockItem,depletedShelf,closingDay,closingStockPending,SOLD_OUT} from '../commerce/shop-stock.js';
import {recordSakuraSale,shopEntry,advanceDeliveries} from '../commerce/sakura-economy.js';
import {createRoomWalk} from './room-walk.js';
import {marketVisitPurpose} from './market-visits.js';
import {SAKURA_SHELVES} from '../world/interiors/sakura-layout.js';


export function createShopRetail({world,state,ledger,display,collides,getMinutes}){
 const layout=display.layout,COUNTER=layout.checkout,STOCKROOM=layout.stockroom,walker=createRoomWalk(collides,{bounds:layout.bounds,smoothTurn:true}),customers=new Map();let activeJob=null;
 function visit(person,minutes){
  if(person.profile.name==='Thuan'||marketVisitPurpose(person.profile.name,minutes,state)!=='goods')return null;
  const account=ledger.account(person.profile.name,minutes);
  return account.shopping??={phase:'browse',started:minutes,finished:false,item:null,picked:false,paid:false,timer:0,position:[...layout.entrance]};
 }
 function arriving(person,minutes){return visit(person,minutes);}
 function point(item,slot){return display.unitPositions.get(item+':'+slot)||[0,1,0];}
 function stand(item,slot=Math.max(0,state.sakura.stock[item].shelf-1)){return display.unitApproaches.get(item+':'+slot)||SAKURA_SHELVES[item].stand;}
 function face(g,yaw,dt){const angle=Math.atan2(Math.sin(yaw-g.rotation.y),Math.cos(yaw-g.rotation.y));g.rotation.y+=THREE.MathUtils.clamp(angle,-dt*2.6,dt*2.6);return Math.abs(angle)<.025;}
 function clear(person){for(const key of ['heldItem','shopGoods','shopReach','shopping'])delete person.g.userData[key];}
 function finish(person,record){
  if(record.picked&&!record.paid){returnShopStock(state,{item:record.item});record.picked=false;}
  record.finished=true;record.phase='finished';clear(person);customers.delete(person);walker.forget(person);
 }
 function choices(person){
  const start=(Math.floor(getMinutes()/1440)+person.profile.name.length)%SHOP_STOCK.length;
  return Array.from({length:SHOP_STOCK.length},(_,i)=>SHOP_STOCK[(start+i)%SHOP_STOCK.length]).filter(item=>ledger.account(person.profile.name,getMinutes()).yen>=item.cost);
 }
 function soldOut(person,record){finish(person,record);const clerk=world.people.find(p=>p.profile.name==='Thuan');if(clerk)clerk.g.userData.residentSpeech={text:SOLD_OUT,until:getMinutes()+5};}
 function update(dt){
  const minutes=getMinutes(),open=minutes%1440>=540&&minutes%1440<1200;advanceDeliveries(state,minutes);
  for(const person of world.people){
   if(person.profile.name==='Thuan')continue;const account=ledger.account(person.profile.name,minutes),record=account.shopping,previous=customers.get(person);
   if(previous&&previous!==record)finish(person,previous);
   if(!person.g.userData.inMarket||person.g.userData.roomTransition||!record||record.finished){if(customers.has(person))finish(person,record);continue;}
   customers.set(person,record);const g=person.g;g.userData.shopping=true;g.userData.floorHeight=0;
   if(!open){finish(person,record);continue;}
   if(record.phase==='browse'){
    if(!record.item){const item=choices(person)[0];if(!item){finish(person,record);continue;}record.item=item.id;}
    g.userData.activity='choosing '+stockSpec(record.item).name.toLowerCase();
    if(walker.move(person,stand(record.item),dt)){record.phase='pickup';record.timer=1.2;}
   }else if(record.phase==='pickup'){
    const count=state.sakura.stock[record.item].shelf;if(!count){soldOut(person,record);continue;}
    if(!face(g,SAKURA_SHELVES[record.item].yaw,dt))continue;display.accessShelf(record.item);g.userData.shopReach=point(record.item,count-1);record.timer-=dt;
    if(record.timer<=0){const claim=takeShopStock(state,record.item);delete g.userData.shopReach;if(!claim){record.item=null;record.phase='browse';continue;}record.picked=true;record.phase='queue';}
   }else if(record.phase==='queue'){
    const line=[...customers].filter(([,r])=>r.phase==='queue'),index=line.findIndex(([p])=>p===person),target=[COUNTER[0],0,COUNTER[2]+Math.max(0,index)*.85];
    g.userData.activity='waiting to pay for '+stockSpec(record.item).name.toLowerCase();
    record.atCounter=walker.move(person,target,dt)&&face(g,-Math.PI/2,dt);
   }else if(record.phase==='paid'){
    g.userData.activity='putting a purchase away';record.timer-=dt;if(record.timer<=0)finish(person,record);
   }
   if(record.picked&&!record.finished){g.userData.heldItem='shop-'+record.item;g.userData.shopGoods=true;}
   record.position=g.position.toArray();
  }
  display.updateStock(state.sakura.stock);
 }
 function work(){
  if(activeJob)return activeJob;
  const minutes=getMinutes(),minute=minutes%1440,open=minute>=540&&minute<1200;
  const waiting=open&&[...customers].find(([,record])=>record.phase==='queue'&&!record.paid);
  if(waiting){const [customer,record]=waiting;activeJob={type:'checkout',customer,record,ready:()=>record.atCounter,position:layout.staff,yaw:layout.staffYaw};return activeJob;}
  if(!closingStockPending(state,minutes))return null;
  const item=depletedShelf(state);
  if(!item){
   const expected=state.sakura.deliveries.some(d=>state.sakura.stock[d.item].shelf<stockSpec(d.item).capacity);
   if(!expected)state.sakura.restockedDay=closingDay(minutes);
   return null;
  }
  activeJob={type:'restock',item:item.id,quantity:Math.min(item.capacity-state.sakura.stock[item.id].shelf,state.sakura.stock[item.id].reserve),position:stand(item.id),pickup:STOCKROOM,target:point(item.id,0),yaw:SAKURA_SHELVES[item.id].yaw};return activeJob;
 }
 function complete(job){
  if(job!==activeJob)return;const minutes=getMinutes();
  if(job.type==='checkout'){
   const {customer,record}=job,item=stockSpec(record.item);
   if(!record.finished&&record.picked&&!record.paid&&customer.g.userData.inMarket&&minutes%1440<1200&&ledger.purchase(customer.profile.name,minutes,'shop-goods',item.id,item.cost)){
    record.paid=true;record.phase='paid';record.timer=2;
    recordSakuraSale(state,item.cost,'goods-'+Math.floor(minutes/1440)+'-'+customer.profile.name,{minute:minutes,item:item.name,buyer:customer.profile.name,unitCost:item.unitCost});
    customer.g.userData.residentSpeech={text:'Thank you, Thuan.',until:minutes+3};
   }else if(!record.paid)finish(customer,record);
  }else if(closingStockPending(state,minutes)){
   const count=restockItem(state,job.item,job.quantity);if(count)shopEntry(state,{minute:minutes,kind:'Restocked',item:stockSpec(job.item).name,buyer:'Thuan',quantity:count});
  }
  activeJob=null;display.updateStock(state.sakura.stock);
 }
 return {update,work,complete,cancelWork(){activeJob=null;},arriving,standing(person,minutes){const record=visit(person,minutes);return record&&!record.finished?record.position:null;},get customers(){return customers;}};
}
