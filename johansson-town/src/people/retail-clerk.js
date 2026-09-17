import * as THREE from '../../vendor/three.module.js';
import {createRoomWalk} from './room-walk.js';
import {createShopProduct} from '../commerce/shop-product.js';
export function createRetailClerk({person,room,layout,collides,getWork,completeWork,cancelWork,accessShelf=()=>{},isBlocked=()=>false}){
 const clerk=person.g,walker=createRoomWalk(collides,{bounds:layout.bounds,smoothTurn:true,radius:layout.clearance??.3}),box=createShopProduct('stock');box.visible=false;room.add(box);
 let phase='counter',job=null,timer=0,cartonStops=0;
 const turn=(yaw,dt)=>{const a=Math.atan2(Math.sin(yaw-clerk.rotation.y),Math.cos(yaw-clerk.rotation.y));clerk.rotation.y+=THREE.MathUtils.clamp(a,-dt*2.6,dt*2.6);return Math.abs(a)<.025;};
 const walk=(point,dt)=>isBlocked(point[0],point[2])?false:walker.move(person,point,dt);
 const isStockJob=value=>value?.type==='restock'||value?.type==='restock-prep';
 const clearHandling=()=>{delete clerk.userData.shopReach;delete clerk.userData.heldItem;delete clerk.userData.shopGoods;delete clerk.userData.restocking;};
 const clerkTarget=point=>{if(!point)return null;const target=new THREE.Vector3(...point);room.updateWorldMatrix(true,false);clerk.updateWorldMatrix(true,false);room.localToWorld(target);clerk.worldToLocal(target);return target.toArray();};
 const beginPlacement=()=>{box.visible=false;delete clerk.userData.carriedTray;clerk.userData.carrying=false;clerk.userData.heldItem='shop-'+job.item;clerk.userData.shopGoods=true;const target=clerkTarget(job.reach||job.target);if(target)clerk.userData.shopReach=target;accessShelf(job.item);};
 const finish=()=>{const restocked=job?.type==='restock',stockJob=isStockJob(job);if(job&&(restocked||job.type==='checkout'))completeWork(job);job=null;clearHandling();box.visible=stockJob&&--cartonStops>0;phase=stockJob?'stock-next':'return';};
 return {get phase(){return phase;},get order(){return null;},cancel(){},occupied(){return false;},prepareToLeave(){if(phase==='counter')return true;if(job){cancelWork(job);job=null;}box.visible=false;delete clerk.userData.carriedTray;clearHandling();phase='return';return false;},
  update(dt){
   if(!clerk.userData.inMarket||clerk.userData.roomTransition)return;
   delete clerk.userData.socialPose;delete clerk.userData.seatHeight;delete clerk.userData.chairBlend;clerk.userData.floorHeight=0;clerk.userData.serving=phase!=='counter';clerk.userData.carrying=box.visible;
   if(job?.type==='checkout'&&job.record.finished){cancelWork(job);job=null;clearHandling();phase='return';}
   clerk.userData.restocking=phase.startsWith('stock')||isStockJob(job);
   if(phase==='counter'){
    if((job=getWork())){phase=job.type==='restock'?'stock-fetch':job.type==='restock-prep'?'stock-prep-fetch':'checkout';clerk.userData.serving=true;}
    else if(walk(layout.staff,dt)&&turn(layout.staffYaw,dt))clerk.userData.socialPose='CounterIdle';
   }else if(phase==='stock-next'){
    clerk.userData.activity='continuing the closing stock check';
    if((job=getWork()))phase=job.type==='restock'?(box.visible?'stock-carry':'stock-fetch'):job.type==='restock-prep'?(box.visible?'stock-prep-carry':'stock-prep-fetch'):'checkout';
    else{box.visible=false;phase='return';}
   }else if(phase==='return'){if(walk(layout.staff,dt)&&turn(layout.staffYaw,dt))phase='counter';}
   else if(phase==='checkout'){clerk.userData.activity='serving a customer at the till';if(walk(job.position,dt)&&turn(job.yaw,dt)){phase='checkout-pay';timer=2;}}
   else if(phase==='checkout-pay'){if(job.ready()){clerk.userData.shopReach=layout.register;if((timer-=dt)<=0)finish();}}
   else if(phase==='stock-fetch'){clerk.userData.activity='fetching stock from the back room';if(walk(job.pickup,dt)){phase='stock-collect';timer=1.3;}}
   else if(phase==='stock-collect'){clerk.userData.activity='opening a carton of '+(job.name||job.item).toLowerCase();if((timer-=dt)<=0){box.visible=true;cartonStops=3;phase='stock-carry';}}
   else if(phase==='stock-carry'){clerk.userData.activity='carrying '+(job.name||job.item).toLowerCase()+' to the shelf';if(walk(job.position,dt)&&turn(job.yaw,dt)){phase='stock-place';timer=1.8;beginPlacement();}}
   else if(phase==='stock-prep-fetch'){clerk.userData.activity='checking the back-room stock';if(walk(job.pickup,dt)){phase='stock-prep-collect';timer=1.3;}}
   else if(phase==='stock-prep-collect'){clerk.userData.activity='bringing out a closing carton';if((timer-=dt)<=0){box.visible=true;cartonStops=3;phase='stock-prep-carry';}}
   else if(phase==='stock-prep-carry'){clerk.userData.activity='bringing '+(job.name||job.item).toLowerCase()+' out before closing';if(walk(job.position,dt)&&turn(job.yaw,dt))phase='stock-prep-hold';}
   else if(phase==='stock-prep-hold'){clerk.userData.activity='waiting to place '+(job.name||job.item).toLowerCase()+' after closing';if(job.ready?.()){job.type='restock';phase='stock-place';timer=1.8;beginPlacement();}}
   else if(phase==='stock-place'){clerk.userData.activity='placing '+(job.name||job.item).toLowerCase()+' on the shelf';accessShelf(job.item);if((timer-=dt)<=0)finish();}
   if(box.visible){clerk.userData.carrying=true;clerk.userData.carriedTray=box;box.position.copy(clerk.position).add(new THREE.Vector3(0,.98,-.34).applyAxisAngle(new THREE.Vector3(0,1,0),clerk.rotation.y));box.rotation.y=clerk.rotation.y;}
   else{clerk.userData.carrying=false;delete clerk.userData.carriedTray;}
  }
 };
}
