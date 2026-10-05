import {buildServingDish,buildServingDrink,buildServingBite} from './izakaya-serving-visuals.js';
import * as THREE from '../../vendor/three.module.js';

/**
 * Beer at Minato: order it at your table, Thao pours it and brings it over, you drink it
 * a sip at a time.
 *
 * Okinawa in 1997 drinks Orion. Minato keeps it three ways -- on draught in a frosted
 * mug, in the big brown 633 ml bottle with a small glass to pour into, and in the can --
 * and oolong tea for anyone who is not drinking.
 */
export const DRINKS=Object.freeze({
 draft:Object.freeze({id:'draft',jp:"Orion draught, medium mug",en:'Orion draught, a frosted mug',price:450,sips:6,alcohol:1,pour:4.2,line:"One Orion draught! Cold from the tap."}),
 bottle:Object.freeze({id:'bottle',jp:"Orion Large bottle",en:'Orion large bottle and a small glass',price:600,sips:8,alcohol:1.4,pour:2,line:"It's a big bottle. Pour for yourself -- or I pour the first one."}),
 can:Object.freeze({id:'can',jp:"Orion Can",en:'Orion can, 350 ml',price:300,sips:4,alcohol:.8,pour:1.2,line:"Still in the can? Straight from the can, then."}),
 awamori:Object.freeze({id:'awamori',jp:"Awamori on the rocks",en:'awamori on the rocks',price:250,sips:5,alcohol:1.6,pour:1.8,line:"Awamori. Slowly -- it is older than you think."}),
 sake:Object.freeze({id:'sake',jp:"Warm sake, one flask",en:'a flask of warm sake',price:220,sips:5,alcohol:1.3,pour:2.4,line:"Hot sake. Careful, the tokkuri is hot."}),
 oolong:Object.freeze({id:'oolong',jp:"Oolong tea",en:'Oolong tea over ice',price:150,sips:4,alcohol:0,pour:1.6,line:"Oolong tea. Plenty of ice."})
});
/**
 * The food on Minato's wall, each cooked where it would be: skewers and fish over the
 * charcoal at the counter, oden from its pot, the fryer, the range, or the prep bench
 * for the cold dishes. `cook` is how long Thao is at it; `bites` how long it lasts you.
 */
export const DISHES=Object.freeze({
 yakitori:Object.freeze({id:'yakitori',jp:"Assorted Yakitori",en:'a plate of yakitori',price:180,bites:4,station:'grill',cook:6,line:"Yakitori. Two tare, two salt."}),
 edamame:Object.freeze({id:'edamame',jp:"Edamame",en:'a bowl of edamame',price:120,bites:3,station:'prep',cook:2,line:"Edamame. Salted while they were hot."}),
 oden:Object.freeze({id:'oden',jp:"Oden",en:'a bowl of oden',price:260,bites:4,station:'oden',cook:3,line:"Oden. The daikon has been in since four."}),
 hiyayakko:Object.freeze({id:'hiyayakko',jp:"Cold tofu",en:'cold tofu with ginger',price:150,bites:3,station:'prep',cook:2,line:"It's cold tofu. Ginger and a little soy."}),
 dashimaki:Object.freeze({id:'dashimaki',jp:"Dashi-rolled egg",en:'a rolled dashi omelette',price:200,bites:3,station:'range',cook:5,line:"Dashi roll. Still warm in the middle."}),
 hokke:Object.freeze({id:'hokke',jp:"Grilled Atka mackerel",en:'grilled hokke',price:280,bites:4,station:'grill',cook:7,line:"It's Hokke. Lemon on the side."}),
 sashimi:Object.freeze({id:'sashimi',jp:"Assorted sashimi",en:'the sashimi plate',price:320,bites:4,station:'prep',cook:4,line:"Sashimi. Masaru brought the tuna this morning."}),
 agedashi:Object.freeze({id:'agedashi',jp:"Fried tofu",en:'agedashi tofu',price:180,bites:3,station:'fryer',cook:5,line:"It's fried. Mind the broth, it is hot."}),
 karaage:Object.freeze({id:'karaage',jp:"Fried chicken",en:'chicken karaage',price:220,bites:4,station:'fryer',cook:6,line:"It's fried chicken. Straight out of the oil."}),
 ochazuke:Object.freeze({id:'ochazuke',jp:"Ochazuke",en:'ochazuke to finish',price:180,bites:3,station:'range',cook:4,line:"Ochazuke. The way to end an evening."}),
});
export const MINATO_MENU=Object.freeze([...Object.values(DISHES),...Object.values(DRINKS)]);
export const menuItem=id=>DRINKS[id]||DISHES[id]||null;
/** Where Thao stands to cook each kind of dish (see tools/blender/build-minato-interior.py). */
export const KITCHEN_STATIONS=Object.freeze({grill:[1.7,0,-3.6],oden:[-4.2,0,-3.6],range:[1.4,0,-5.15],fryer:[2.75,0,-5.15],prep:[5.4,0,-5.15]});
export const NAO_STATION=Object.freeze([3.5,0,-3.8]);

/**
 * Where the player can sit, and where Thao stands to serve that seat. `table` is the spot
 * on the table in front of the player; `serve` is Thao's floor spot beside it.
 */
export const IZAKAYA_PLAYER_SEATS=Object.freeze({
 table:Object.freeze({id:'table',label:'Sit at the table',position:[3.3,0,.92],stand:[3.3,0,.25],surfaceY:.56,eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],dish:[3.02,.945,1.5],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),
 window:Object.freeze({id:'window',label:'Sit and enjoy the evening',position:[3.4,0,3.08],stand:[4.35,0,3.08],surfaceY:.56,eyeY:1.2,yaw:0,table:[3.4,.945,2.55],dish:[3.15,.945,2.55],serve:[4.1,0,2.7],route:[[3.95,-3.55],[3.95,.3],[4.1,2.7]]}),
 // The five counter stools, among the regulars. Thao serves these across the counter
 // from the kitchen side, so their route never leaves the working aisle.
 ...Object.fromEntries([-3.8,-2.3,-.8,.7,2.2].map((x,i)=>['counter'+i,Object.freeze({id:'counter'+i,label:'Sit at the counter',counter:true,
  position:[x,0,-1.42],stand:[x,0,-.72],surfaceY:.71,eyeY:1.32,yaw:0,table:[x+.15,1.11,-2.2],dish:[x-.12,1.11,-2.24],serve:[x,0,-3.75],route:[[x,-3.75]]})])),
});

/** A drink as a small prop: a mug with a head, a brown bottle and glass, a can, a tumbler. */
/**
 * A poured beer: the liquid empties from the top down, its head of foam stays a collar
 * on whatever is left (thinning a little) and goes when the glass is drained, and a few
 * bubbles keep rising from the bottom to the current level. Without this the whole
 * level, foam and all, was squashed flat.
 */
function pour(g,liquid,head,height,radius){
 const bottom=liquid.position.y-height/2,points=10,positions=new Float32Array(points*3),rise=[];
 for(let i=0;i<points;i++){const a=i*2.4,r=radius*(.25+.7*((i*37)%10)/10);positions[i*3]=liquid.position.x+Math.cos(a)*r;positions[i*3+1]=bottom+((i*0.31)%1)*height;positions[i*3+2]=Math.sin(a)*r;rise.push(.012+((i*13)%7)*.004);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const bubbles=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xfff2c4,size:.0035,transparent:true,opacity:.8,depthWrite:false}));bubbles.name='Beer bubbles';
 g.add(bubbles);
 g.userData.pour={liquid,head,bottom,height,headHeight:head.geometry.parameters.height,bubbles,rise};
}
function settlePour(u,dt){
 const p=u.pour,left=u.portion,top=p.bottom+p.height*left;
 p.liquid.scale.y=Math.max(.001,left);p.liquid.position.y=p.bottom+p.height*left/2;
 p.head.visible=left>.03;p.head.scale.y=.55+.45*left;p.head.position.y=top+p.headHeight*p.head.scale.y/2;
 const pos=p.bubbles.geometry.attributes.position;p.bubbles.visible=left>.05;
 for(let i=0;i<pos.count;i++){let y=pos.getY(i)+p.rise[i]*dt*(left>.1?1:.3);if(y>top)y=p.bottom+(y-top)%Math.max(.005,top-p.bottom);pos.setY(i,y);}
 pos.needsUpdate=true;
}
export function createDrinkProp(kind,options={}){
 const {group,liquid,head,height,radius}=buildServingDrink(kind,options);
 if(head)pour(group,liquid,head,height,radius);
 group.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 return group;
}

/** Real turned dishes and separate edible portions, visible from every seat. */
export function createDishProp(kind){
 const group=buildServingDish(kind);
 group.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 return group;
}

/** Smooth liquid levels; remove food portions in sequence rather than flattening a dish. */
export function setPropPortion(prop,fraction,{immediate=false}={}){
 const value=THREE.MathUtils.clamp(Number(fraction)||0,0,1);
 prop.userData.targetPortion=value;
 if(immediate){prop.userData.portion=value;updatePropPortion(prop,0);}
}
export function updatePropPortion(prop,dt){
 const u=prop.userData,level=u.level;if(!level)return;
 const target=u.targetPortion??1,current=u.portion??1;
 u.portion=Math.abs(current-target)<.001?target:THREE.MathUtils.damp(current,target,7,Math.max(0,dt));
 level.visible=u.portion>0;
 if(u.consumable==='food'){
  const amount=level.children.length*u.portion;
  level.children.forEach((piece,i)=>{piece.visible=i<Math.ceil(amount);piece.scale.setScalar(Math.min(1,Math.max(0,amount-i)));});
 }else if(u.pour){
  // The glass empties from the top; anything else poured (the bottle) empties with it.
  level.scale.y=1;settlePour(u,dt);
  for(const piece of level.children)if(piece!==u.pour.liquid&&piece!==u.pour.head){piece.userData.baseY??=piece.position.y;piece.scale.y=Math.max(.001,u.portion);piece.position.y=piece.userData.baseY*u.portion;}
 }else level.scale.y=Math.max(.001,u.portion);
}
export function createBiteProp(kind){return buildServingBite(kind);}
export function disposeServing(prop){
 if(!prop)return;prop.removeFromParent();const materials=new Set();
 prop.traverse(o=>{if(o.isMesh||o.isSprite){if(o.isMesh)o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
 materials.forEach(m=>m.dispose());
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.room
 * @param {()=>THREE.Object3D|null} options.getNao Thao's entity when she is working the room
 * @param {(x:number,z:number,r:number)=>boolean} options.blocked
 * @param {(text:string,seconds?:number)=>void} [options.say]
 */
export function createBeerService({room,getNao,blocked,say=()=>{}}){
 let order=null,drink=null,dish=null,served=0;
 void blocked;
 function release(g){if(!g)return;for(const key of ['playerService','heldItem','socialPose','carrying'])delete g.userData[key];}
 /**
  * Walk Thao along the seat's route: round the end of the counter and down the aisle.
  * The route is laid through the gap the colliders leave, so no path search is needed.
  * True once she is at the last point.
  */
 function walk(g,points,dt){
  while(points.length){
   const [x,z]=points[0],dx=x-g.position.x,dz=z-g.position.z,d=Math.hypot(dx,dz);
   if(d<.03){points.shift();continue;}
   const want=Math.atan2(-dx,-dz),turn=Math.atan2(Math.sin(want-g.rotation.y),Math.cos(want-g.rotation.y));
   g.rotation.y+=Math.max(-dt*5,Math.min(dt*5,turn));
   if(Math.abs(turn)<.9){const step=Math.min(d,dt*1.15*(1-Math.abs(turn)/1.2));g.position.x+=dx/d*step;g.position.z+=dz/d*step;}
   return false;
  }
  return true;
 }
 const clearProp=slot=>{if(slot){slot.prop.removeFromParent();slot.prop.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose?.();}});}};
 function clearDrink(){clearProp(drink);drink=null;}
 function clearDish(){clearProp(dish);dish=null;}
 const face=(g,x,z)=>{g.rotation.y=Math.atan2(-(x-g.position.x),-(z-g.position.z));};
 const station=()=>[NAO_STATION[0],NAO_STATION[2]];
 function serve(kind,seat){
  if(DRINKS[kind]){clearDrink();const prop=createDrinkProp(kind);prop.position.set(...seat.table);room.add(prop);drink={kind,left:DRINKS[kind].sips,prop};}
  else{clearDish();const prop=createDishProp(kind);prop.position.set(...(seat.dish||seat.table));room.add(prop);dish={kind,left:DISHES[kind].bites,prop};}
  served++;
 }
 function eatFrom(slot,total){
  slot.left=Math.max(0,slot.left-1);setPropPortion(slot.prop,slot.left/total);
 }
 return {
  /** The drink or dish on its way, if any. */
  get pending(){return order?{kind:order.kind,phase:order.phase}:null;},
  get drink(){return drink?{kind:drink.kind,left:drink.left,sips:DRINKS[drink.kind].sips}:null;},
  get dish(){return dish?{kind:dish.kind,left:dish.left,bites:DISHES[dish.kind].bites}:null;},
  get served(){return served;},
  /**
   * Ask for a drink or a dish at this seat. False if Thao is not here or something is
   * already on its way. A drink she pours where she stands; a dish she cooks at its
   * station in the kitchen first.
   */
  order(kind,seat){
   const spec=menuItem(kind),nao=getNao();
   if(!spec||!seat||order||!nao)return false;
   const dishOrder=!!DISHES[kind];
   order={kind,seat,phase:dishOrder?'cooking':'pouring',timer:dishOrder?spec.cook:spec.pour,path:dishOrder?[[KITCHEN_STATIONS[spec.station][0],KITCHEN_STATIONS[spec.station][2]]]:null};
   nao.userData.playerService=true;nao.userData.socialPose='Use';
   nao.userData.activity=dishOrder?'cooking '+spec.en+' for you':'pouring '+spec.en.toLowerCase()+' for you';
   return true;
  },
  /** One sip. Returns what is left, or null with nothing on the table. */
  sip(){
   if(!drink||drink.left<=0)return null;
   drink.left=Math.max(0,drink.left-1);const spec=DRINKS[drink.kind],level=drink.prop.userData.level;
   setPropPortion(drink.prop,drink.left/spec.sips);
   const result={kind:drink.kind,left:drink.left,alcohol:spec.alcohol/spec.sips};
   if(drink.left===0){const finished=drink;setTimeout(()=>{if(drink===finished)clearDrink();},1500);}
   return result;
  },
  /** One mouthful of the dish. Returns what is left, or null with nothing on the plate. */
  bite(){
   if(!dish||dish.left<=0)return null;
   eatFrom(dish,DISHES[dish.kind].bites);const result={kind:dish.kind,left:dish.left};
   if(dish.left===0){const finished=dish;setTimeout(()=>{if(dish===finished)clearDish();},2500);}
   return result;
  },
  /** A drink already on the table at this seat -- the evening you walk into, not one you ordered. */
  serveNow(kind,seat){if(!menuItem(kind)||!seat?.table)return false;serve(kind,seat);return true;},
  update(dt){
   if(drink)updatePropPortion(drink.prop,dt);if(dish)updatePropPortion(dish.prop,dt);
   if(!order)return;
   const nao=getNao();
   if(!nao){order=null;return;}
   const spec=menuItem(order.kind),{seat}=order;
   if(order.phase==='cooking'){
    // To the station, then the dish itself: the fire, the pot, the knife.
    if(order.path.length){delete nao.userData.socialPose;walk(nao,order.path,dt);return;}
    nao.userData.socialPose='Use';
    if((order.timer-=dt)<=0){order.path=[...(seat.counter?[]:[station()]),...seat.route].map(p=>[...p]);order.phase='carrying';nao.userData.heldItem='tray';delete nao.userData.socialPose;nao.userData.carrying=true;nao.userData.activity='bringing your '+spec.en.replace(/^(a|an|the) /,'');}
   }else if(order.phase==='pouring'){
    nao.userData.socialPose='Use';
    if((order.timer-=dt)<=0){order.path=seat.route.map(p=>[...p]);order.phase='carrying';nao.userData.heldItem=order.kind==='oolong'?'tea':'beer';delete nao.userData.socialPose;nao.userData.carrying=true;nao.userData.activity='bringing your drink';}
   }else if(order.phase==='carrying'){
    delete nao.userData.socialPose;
    const to=DRINKS[order.kind]?seat.table:(seat.dish||seat.table);
    if(walk(nao,order.path,dt)){face(nao,to[0],to[2]);order.phase='placing';order.timer=1.1;nao.userData.socialPose='CarryIdle';}
   }else if(order.phase==='placing'){
    if((order.timer-=dt)<=0){
     serve(order.kind,seat);
     delete nao.userData.heldItem;delete nao.userData.carrying;nao.userData.socialPose='Greet';
     say('Thao: '+spec.line,4);order.phase='bowing';order.timer=.9;
    }
   }else if(order.phase==='bowing'){
    if((order.timer-=dt)<=0){delete nao.userData.socialPose;order.path=[...seat.route.slice(0,-1).reverse(),station()].map(p=>[...p]);order.phase='returning';nao.userData.activity='back to the counter';}
   }else if(order.phase==='returning'){
    delete nao.userData.socialPose;
    if(walk(nao,order.path,dt)){nao.rotation.set(0,Math.PI,0);release(nao);order=null;}
   }
  },
  /** Leaving the room: drop the order and anything on the table. */
  clear(){const nao=getNao();if(order&&nao){nao.position.set(...NAO_STATION);nao.rotation.set(0,Math.PI,0);release(nao);}order=null;clearDrink();clearDish();},
  /** Only for tests and a room rebuild: put a served drink straight on the table. */
  place(kind,seat){serve(kind,seat);}
 };
}
