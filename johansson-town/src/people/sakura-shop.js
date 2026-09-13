import * as THREE from '../../vendor/three.module.js';
import {circleHitsRect} from '../../physics.js?snappy=1';
import {buildSakuraInterior} from '../world/interiors/sakura-interior.js';
import {SAKURA_LAYOUT} from '../world/interiors/sakura-layout.js';
import {suppliedRoomBoundsBlocked} from '../world/supplied-rooms.js?snappy=1';
import {createIndoorResidents} from './indoor-residents.js';
import {createRetailClerk} from './retail-clerk.js';
import {createShopAttention} from './shop-attention.js';
import {createShopRetail} from './shop-retail.js';
import {returnShopStock} from '../commerce/shop-stock.js';

// A single persistent shop owns stock, staff and customer jobs everywhere in town.
export function createSakuraShop({world,scene,state,ledger,register,action,exit,getMinutes,getPlayerPosition,isInside,onBorrow=()=>{},getRain=()=>false,save=()=>{}}){
 const group=new THREE.Group();group.name='Sakura Shōten continuous shop';group.userData.sharedAsset=true;group.visible=false;scene.add(group);
 if(state.sakura.playerClaim){returnShopStock(state,state.sakura.playerClaim);delete state.sakura.playerClaim;}
 for(const account of Object.values(state.residentLife||{})){
  const meal=account.meals?.market;if(meal?.stockClaim&&!meal.delivered){returnShopStock(state,meal.stockClaim);meal.stockClaim=null;}if(meal)meal.finished=true;
  if(account.day!==Math.floor(getMinutes()/1440)){const visit=account.shopping;if(visit?.picked&&!visit.paid){returnShopStock(state,{item:visit.item});visit.picked=false;}}
 }
 const layout=SAKURA_LAYOUT,colliders=layout.colliders,person=world.people.find(p=>p.profile.name==='Thuan');
 const reg=(object,label,fn,inside=true)=>{object.userData.persistentShop=true;register(object,label,fn,inside);};
 const blocked=(x,z,r=.3)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
 const display=buildSakuraInterior({room:group,reg,action,exit});display.updateStock(state.sakura.stock);
 const retail=createShopRetail({world,state,ledger,display,collides:blocked,getMinutes});
 const attention=createShopAttention({clerk:person.g,world,retail,colliders,isInside,getPlayerPosition});
 let service;
 const residents=createIndoorResidents({world,parent:group,layout,collides:blocked,place:'market',getState:()=>state,getRain,
  onBorrow:(p,time)=>{onBorrow(p,time);retail.arriving(p,time);},getStandingVisit:retail.standing,
  canLeave:p=>p!==person||service?.prepareToLeave()!==false});
 service=createRetailClerk({person,room:group,layout,collides:blocked,getWork:retail.work,completeWork:job=>{retail.complete(job);save();},cancelWork:retail.cancelWork,accessShelf:display.accessShelf,
  isBlocked:(x,z)=>isInside()&&Math.hypot(getPlayerPosition().x-x,getPlayerPosition().z-z)<.55});
 return {group,colliders,service,retail,display,blocked,layout,ready:display.ready,
  enter(parent){parent.add(group);group.visible=true;display.updateStock(state.sakura.stock);},
  hide(){scene.add(group);group.visible=false;},
  update(dt){residents.sync(getMinutes(),dt);retail.update(dt);service.update(dt);attention.update(dt);display.refrigerator.update(dt);display.updateStock(state.sakura.stock);},
 };
}
