import * as THREE from '../../vendor/three.module.js';
import {createRoomWalk} from './room-walk.js';
import {createShopProduct} from '../commerce/shop-product.js';
export function createRetailClerk({person,room,layout,collides,getWork,completeWork,cancelWork,isBlocked=()=>false}){
 const clerk=person.g,walker=createRoomWalk(collides,{bounds:layout.bounds,smoothTurn:true}),box=createShopProduct('stock');box.visible=false;room.add(box);
 let phase='counter',job=null,timer=0;
 const turn=(yaw,dt)=>{const a=Math.atan2(Math.sin(yaw-clerk.rotation.y),Math.cos(yaw-clerk.rotation.y));clerk.rotation.y+=THREE.MathUtils.clamp(a,-dt*2.6,dt*2.6);return Math.abs(a)<.025;};
 const walk=(point,dt)=>isBlocked(point[0],point[2])?false:walker.move(person,point,dt);
 const finish=()=>{const restocked=job?.type==='restock';if(job)completeWork(job);job=null;box.visible=false;delete clerk.userData.shopReach;phase=restocked?'stock-next':'return';};
 return {get phase(){return phase;},get order(){return null;},cancel(){},occupied(){return false;},prepareToLeave(){if(phase==='counter')return true;if(job){cancelWork(job);job=null;}box.visible=false;phase='return';return false;},
  update(dt){
   if(!clerk.userData.inMarket||clerk.userData.roomTransition)return;
   delete clerk.userData.socialPose;delete clerk.userData.seatHeight;delete clerk.userData.chairBlend;clerk.userData.floorHeight=0;clerk.userData.serving=phase!=='counter';clerk.userData.carrying=box.visible;
   if(job?.type==='checkout'&&job.record.finished){cancelWork(job);job=null;delete clerk.userData.shopReach;phase='return';}
   if(phase==='counter'){
    if((job=getWork())){phase=job.type==='restock'?'stock-fetch':'checkout';clerk.userData.serving=true;}else turn(layout.staffYaw,dt);
   }else if(phase==='stock-next'){if((job=getWork()))phase=job.type==='restock'?'stock-fetch':'checkout';else phase='return';}
   else if(phase==='return'){if(walk(layout.staff,dt)&&turn(layout.staffYaw,dt))phase='counter';}
   else if(phase==='checkout'){clerk.userData.activity='serving a customer at the till';if(walk(job.position,dt)&&turn(job.yaw,dt)){phase='checkout-pay';timer=2;}}
   else if(phase==='checkout-pay'){if(job.ready()){clerk.userData.shopReach=layout.register;if((timer-=dt)<=0)finish();}}
   else if(phase==='stock-fetch'){clerk.userData.activity='fetching stock from the back room';if(walk(job.pickup,dt)){phase='stock-collect';timer=1.3;}}
   else if(phase==='stock-collect'){if((timer-=dt)<=0){box.visible=true;phase='stock-carry';}}
   else if(phase==='stock-carry'){clerk.userData.activity='restocking '+job.item+' after closing';if(walk(job.position,dt)&&turn(job.yaw,dt)){phase='stock-place';timer=1.8;}}
   else if(phase==='stock-place'){if((timer-=dt)<=0)finish();}
   if(box.visible){clerk.userData.carrying=true;clerk.userData.carriedTray=box;box.position.copy(clerk.position).add(new THREE.Vector3(0,.98,-.34).applyAxisAngle(new THREE.Vector3(0,1,0),clerk.rotation.y));box.rotation.y=clerk.rotation.y;}
   else{clerk.userData.carrying=false;delete clerk.userData.carriedTray;}
  }
 };
}
