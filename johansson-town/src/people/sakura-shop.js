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
import {PALETTE,fluorescent} from '../render/dusk.js';
import {createStandIn} from '../render/static-props.js';
import {townAudio} from '../audio/town-audio.js?snappy=1';

// A single persistent shop owns stock, staff and customer jobs everywhere in town.
export function createSakuraShop({world,scene,state,ledger,register,action,exit,getMinutes,getPlayerPosition,isInside,onBorrow=()=>{},getRain=()=>false,save=()=>{}}){
 // Re-checked twice a second too: the interior's lights arrive when its model loads.
 let lightsInside=null,lightCheck=0;
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

 // Keep the real walls and partitions in both views. Only the duplicate facade
 // frame is hidden outside, where the storefront already supplies it.
 const frontFrame=()=>group.getObjectByName('sakura-front-frame');
 /**
  * What the interior scales to behind the glass.
  *
  * One wherever the frontage is built to the interior's own measurements, so the shop
  * you look into is the shop you walk into. On the street proper the frontage is the
  * smaller one the shops either side of it leave room for, and the interior has to be
  * fitted to its own window: without that its ends stand outside the side walls, in
  * daylight, as two black slabs either side of the fascia.
  */
 const WINDOW_FIT=1;
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

 // Rooms behind the shop floor: nobody sees them through the front windows, so from the
 // street they are not drawn (about 200 draw calls on a phone). Inside, they are.
 const BEHIND=new Set(['Sakura back room stock','Sakura restroom','Sakura office life']);
 const backRooms=on=>group.traverse(o=>{if(BEHIND.has(o.name))o.visible=on;});
 /**
  * From the street the shop floor is a stand-in: the same shelves merged into a few
  * dozen meshes instead of about five hundred. It is rebuilt when the stock changes or
  * a new day restocks the racks, and the real room comes back the moment you go in.
  */
 let standIn=null,standKey='';
 const windowView=on=>{
  if(on){
   const key=JSON.stringify(state.sakura.stock)+'/'+Math.floor(getMinutes()/1440);
   if(key!==standKey||!standIn){standIn?.dispose();standIn=createStandIn(group,{name:'Sakura window stand-in'});group.add(standIn.group);standKey=key;}
   standIn.show(true);
  }else standIn?.show(false);
 };
 return {group,colliders,service,retail,display,blocked,layout,ready:display.ready,
  enter(parent){
   parent.add(group);group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.setScalar(1);
   const frame=frontFrame();if(frame)frame.visible=true;
   windowView(false);lit(false);backRooms(true);
   group.visible=true;showPeople(true);display.updateStock(state.sakura.stock);
   // The door chime: a bright little arpeggio of our own as the automatic door opens.
   townAudio.bells([[1319,0],[1568,.13],[2093,.26],[1760,.44],[2093,.57],[2637,.72]],.32);
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
   const frame=frontFrame();if(frame)frame.visible=false;
   lit(true);backRooms(false);
   group.visible=true;showPeople(false);
   display.updateStock(state.sakura.stock);
   windowView(true);
   return true;
  },
  hide(){windowView(false);scene.add(group);group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.setScalar(1);group.visible=false;lit(false);backRooms(true);const frame=frontFrame();if(frame)frame.visible=true;showPeople(true);},
  update(dt){
   // The shop's lights are for the inside of the shop. The interior stays in the street
   // scene so you can see it through the glass, but a light has no walls: left on, its
   // hemisphere fill brightened the whole town and its tubes threw a 17 m halo over the
   // roof and the road. Outside, the shop shows through the window by its own glow.
   {const inside=!!isInside();lightCheck-=dt;if(inside!==lightsInside||lightCheck<=0){lightsInside=inside;lightCheck=.5;group.traverse(o=>{if(o.isLight)o.visible=inside;});}}
   display.tick?.(performance.now()/1000);if(!person.g.userData.playerControlled){residents.sync(getMinutes(),dt);retail.update(dt);service.update(dt);attention.update(dt);}display.refrigerator.update(dt);display.updateStock(state.sakura.stock);},
 };
}
