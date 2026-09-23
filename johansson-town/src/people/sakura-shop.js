import * as THREE from '../../vendor/three.module.js';
import {circleHitsRect} from '../../physics.js?snappy=1';
import {buildSakuraInterior} from '../world/interiors/sakura-interior.js';
import {SAKURA_LAYOUT} from '../world/interiors/sakura-layout.js';
import {peninsulaActive} from '../world/town-mode.js';
import {suppliedRoomBoundsBlocked} from '../world/supplied-rooms.js?snappy=1';
import {createIndoorResidents} from './indoor-residents.js';
import {createRetailClerk} from './retail-clerk.js';
import {createShopAttention} from './shop-attention.js';
import {createShopRetail} from './shop-retail.js';
import {returnShopStock} from '../commerce/shop-stock.js';
import {PALETTE,fluorescent} from '../render/dusk.js';

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
 /**
  * The staff and customers, as distinct from the fittings. They are hidden while the
  * shop is only being looked at through its window: nothing drives their animation
  * from out there, and a person frozen mid-stride behind the glass reads worse than
  * an empty aisle.
  */
 const showPeople=on=>{
  // Staff are reparented in by the clerk service rather than added at the top, so this
  // has to look through the whole shop, not just its direct children. It does not look
  // inside the shop model: its meshes carry a name of their own from the file, and
  // taking that for a person hid every shelf, wall and fridge from the street, leaving
  // the goods hanging in the window with nothing under them.
  const visit=o=>{
   if(o!==group&&(o.userData?.name||o.userData?.character)){o.visible=on;return;}
   if(o.userData?.sharedAsset&&o!==group)return;
   for(const child of o.children)visit(child);
  };
  visit(group);
 };
 const UP=new THREE.Vector3(0,1,0);

 /**
  * The supplied interior brings its own walls, ceiling and floor. Seen from the street
  * they swallow the shopfront — they are taller than it, and unlit from outside they
  * read as a black mass over the fascia. The exterior already has a shell, so through
  * the window we show the fittings inside it and leave the building to the building.
  */
 const shell=()=>group.getObjectByName('sakura-building');
 /**
  * What the interior scales to behind the glass.
  *
  * One wherever the frontage is built to the interior's own measurements, so the shop
  * you look into is the shop you walk into. On the street proper the frontage is the
  * smaller one the shops either side of it leave room for, and the interior has to be
  * fitted to its own window: without that its ends stand outside the side walls, in
  * daylight, as two black slabs either side of the fascia.
  */
 const WINDOW_FIT=peninsulaActive()?1:.7;
 /**
  * Strip lights, so the aisles are legible from the pavement. A shop lit only by what
  * gets past its own ceiling is a dark hole, which is not what a konbini looks like
  * from the street at any hour.
  */
 let strip=null;
 const updateLighting=minutes=>{
  display.updateLighting(minutes);
  for(const lamp of strip?.children||[])lamp.intensity=lamp.userData.openIntensity*fluorescent(minutes);
 };
 (world.hourly||(world.hourly=[])).push(updateLighting);
 updateLighting(getMinutes());
 const lit=on=>{
  if(on&&!strip){
   strip=new THREE.Group();strip.name='Sakura shopfront strip lights';
   // Two, because one over the counter leaves the far aisle in the dark and a konbini
   // is evenly lit end to end. Distances are in room units, which the window fit scales
   // along with everything else.
   for(const [x,z,power] of [[1.2,1.1,150],[-3.2,-1.6,110]]){
    const lamp=new THREE.PointLight(PALETTE.sakuraTube,power,17,2);lamp.userData.openIntensity=power;
    lamp.position.set(x,2.6,z);strip.add(lamp);
   }
   group.add(strip);
  }else if(!on&&strip){strip.traverse(o=>o.dispose?.());strip.removeFromParent();strip=null;}
  updateLighting(getMinutes());
 };

 return {group,colliders,service,retail,display,blocked,layout,ready:display.ready,
  enter(parent){
   parent.add(group);group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.setScalar(1);
   const walls=shell();if(walls)walls.visible=true;
   lit(false);
   group.visible=true;showPeople(true);display.updateStock(state.sakura.stock);
  },
  /**
   * Parks the real interior behind the shop's own glazing, so the street looks in at
   * the shop the player will actually walk into rather than at a set of stand-in
   * shelves. The transform is the one shop-street-view.js uses to map the interior
   * camera out to the street, run the other way — which is what makes the view in and
   * the view out agree.
   *
   * @param {THREE.Object3D} parent the town group
   * @param {{position:number[],yaw:number}} frontage
   */
  street(parent,frontage){
   if(!parent||!frontage?.position)return false;
   parent.add(group);
   const fit=WINDOW_FIT;
   group.scale.setScalar(fit);
   group.rotation.set(0,frontage.yaw,0);
   group.position.set(...frontage.position)
    .add(new THREE.Vector3(0,0,-fit*(layout.frontZ??3.91)).applyAxisAngle(UP,frontage.yaw));
   const walls=shell();if(walls)walls.visible=false;
   lit(true);
   group.visible=true;showPeople(false);
   display.updateStock(state.sakura.stock);
   return true;
  },
  hide(){scene.add(group);group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.setScalar(1);group.visible=false;lit(false);const walls=shell();if(walls)walls.visible=true;showPeople(true);},
  update(dt){residents.sync(getMinutes(),dt);retail.update(dt);service.update(dt);attention.update(dt);display.refrigerator.update(dt);display.updateStock(state.sakura.stock);},
 };
}
