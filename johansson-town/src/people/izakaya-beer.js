import * as THREE from '../../vendor/three.module.js';

/**
 * Beer at Minato: order it at your table, Nao pours it and brings it over, you drink it
 * a sip at a time.
 *
 * Okinawa in 1997 drinks Orion. Minato keeps it three ways -- on draught in a frosted
 * mug, in the big brown 633 ml bottle with a small glass to pour into, and in the can --
 * and oolong tea for anyone who is not drinking.
 */
export const DRINKS=Object.freeze({
 draft:Object.freeze({id:'draft',jp:'オリオン生 中ジョッキ',en:'Orion draught, a frosted mug',price:450,sips:6,alcohol:1,pour:4.2,line:'はい、オリオン生です！ Cold from the tap.'}),
 bottle:Object.freeze({id:'bottle',jp:'オリオン 大瓶',en:'Orion large bottle and a small glass',price:600,sips:8,alcohol:1.4,pour:2,line:'大瓶ね。 Pour for yourself -- or I pour the first one.'}),
 can:Object.freeze({id:'can',jp:'オリオン 缶',en:'Orion can, 350 ml',price:300,sips:4,alcohol:.8,pour:1.2,line:'缶のまま？ Straight from the can, then.'}),
 oolong:Object.freeze({id:'oolong',jp:'ウーロン茶',en:'Oolong tea over ice',price:150,sips:4,alcohol:0,pour:1.6,line:'ウーロン茶です。 Plenty of ice.'})
});
export const NAO_STATION=Object.freeze([3.5,0,-3.8]);

/**
 * Where the player can sit, and where Nao stands to serve that seat. `table` is the spot
 * on the table in front of the player; `serve` is Nao's floor spot beside it.
 */
export const IZAKAYA_PLAYER_SEATS=Object.freeze({
 table:Object.freeze({id:'table',label:'Sit at the table',position:[3.3,0,.9],stand:[3.3,0,.25],eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),
 window:Object.freeze({id:'window',label:'Sit and enjoy the evening',position:[4,0,2.7],stand:[2.95,0,2.7],eyeY:1.2,yaw:Math.PI/2,table:[3.62,.945,2.55],serve:[4,0,1.6],route:[[3.95,-3.55],[3.95,.3],[4,1.6]]})
});

/** A drink as a small prop: a mug with a head, a brown bottle and glass, a can, a tumbler. */
export function createDrinkProp(kind){
 const g=new THREE.Group();g.name='Minato drink · '+kind;
 const glass=new THREE.MeshStandardMaterial({color:0xdfe8e4,roughness:.08,metalness:0,transparent:true,opacity:.42,depthWrite:false});
 const beer=new THREE.MeshStandardMaterial({color:0xd9941e,roughness:.3,emissive:0x4a2a02,emissiveIntensity:.25});
 const foam=new THREE.MeshStandardMaterial({color:0xfbf5e6,roughness:.9});
 const add=(geo,mat,y=0,x=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;};
 const level=new THREE.Group();g.add(level);g.userData.level=level;
 if(kind==='draft'){
  add(new THREE.CylinderGeometry(.045,.042,.15,20),glass,.075);
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.041,.039,.12,20),beer);liquid.position.y=.063;level.add(liquid);
  const head=new THREE.Mesh(new THREE.CylinderGeometry(.043,.041,.025,20),foam);head.position.y=.135;level.add(head);
  const handle=add(new THREE.TorusGeometry(.03,.007,8,16,Math.PI),glass,.08,.05);handle.rotation.z=-Math.PI/2;
 }else if(kind==='bottle'){
  const brown=new THREE.MeshStandardMaterial({color:0x5a2e10,roughness:.25,transparent:true,opacity:.92});
  add(new THREE.CylinderGeometry(.038,.038,.2,18),brown,.1,-.06);add(new THREE.CylinderGeometry(.013,.036,.08,14),brown,.24,-.06);
  add(new THREE.CylinderGeometry(.034,.034,.05,18),new THREE.MeshStandardMaterial({color:0xf2f0e8,roughness:.6}),.1,-.06);
  add(new THREE.CylinderGeometry(.03,.027,.09,16),glass,.045,.05);
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.027,.025,.07,16),beer);liquid.position.set(.05,.037,0);level.add(liquid);
  const head=new THREE.Mesh(new THREE.CylinderGeometry(.028,.027,.012,16),foam);head.position.set(.05,.078,0);level.add(head);
 }else if(kind==='can'){
  const can=add(new THREE.CylinderGeometry(.033,.033,.122,20),new THREE.MeshStandardMaterial({color:0xf2f2ee,roughness:.35,metalness:.55}),.061);
  add(new THREE.CylinderGeometry(.0335,.0335,.045,20),new THREE.MeshStandardMaterial({color:0x1e4f9c,roughness:.4,metalness:.4}),.07);
  add(new THREE.CylinderGeometry(.0336,.0336,.008,20),new THREE.MeshStandardMaterial({color:0xc8322a,roughness:.4}),.095);
  void can;
 }else{
  add(new THREE.CylinderGeometry(.036,.032,.11,18),glass,.055);
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.033,.03,.085,18),new THREE.MeshStandardMaterial({color:0x7a3f18,roughness:.25,transparent:true,opacity:.85}));liquid.position.y=.045;level.add(liquid);
  for(let i=0;i<3;i++){const ice=new THREE.Mesh(new THREE.BoxGeometry(.022,.022,.022),glass);ice.position.set((i-1)*.012,.08,(i%2)*.01);ice.rotation.set(i,i*.7,0);level.add(ice);}
 }
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 return g;
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.room
 * @param {()=>THREE.Object3D|null} options.getNao Nao's entity when she is working the room
 * @param {(x:number,z:number,r:number)=>boolean} options.blocked
 * @param {(text:string,seconds?:number)=>void} [options.say]
 */
export function createBeerService({room,getNao,blocked,say=()=>{}}){
 let order=null,drink=null,served=0;
 void blocked;
 function release(g){if(!g)return;for(const key of ['playerService','heldItem','socialPose','carrying'])delete g.userData[key];}
 /**
  * Walk Nao along the seat's route: round the end of the counter and down the aisle.
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
 function clearDrink(){if(drink){drink.prop.removeFromParent();drink=null;}}
 const face=(g,x,z)=>{g.rotation.y=Math.atan2(-(x-g.position.x),-(z-g.position.z));};
 return {
  /** The drink on its way, if any. */
  get pending(){return order?{kind:order.kind,phase:order.phase}:null;},
  get drink(){return drink?{kind:drink.kind,left:drink.left,sips:DRINKS[drink.kind].sips}:null;},
  get served(){return served;},
  /** Ask for a drink at this seat. False if Nao is not here or one is already coming. */
  order(kind,seat){
   const spec=DRINKS[kind],nao=getNao();
   if(!spec||!seat||order||!nao)return false;
   order={kind,seat,phase:'pouring',timer:spec.pour};
   nao.userData.playerService=true;nao.userData.socialPose='Use';nao.userData.activity='pouring '+spec.en.toLowerCase()+' for you';
   return true;
  },
  /** One sip. Returns what is left, or null with nothing on the table. */
  sip(){
   if(!drink)return null;
   drink.left=Math.max(0,drink.left-1);const spec=DRINKS[drink.kind],level=drink.prop.userData.level;
   if(level)level.scale.y=Math.max(.04,drink.left/spec.sips);
   if(drink.kind==='draft'&&level?.children[1])level.children[1].visible=drink.left>spec.sips*.5;
   const result={kind:drink.kind,left:drink.left,alcohol:spec.alcohol/spec.sips};
   if(drink.left===0)setTimeout(clearDrink,1500);
   return result;
  },
  update(dt){
   if(!order)return;
   const nao=getNao();
   if(!nao){order=null;return;}
   const spec=DRINKS[order.kind],{seat}=order;
   if(order.phase==='pouring'){
    nao.userData.socialPose='Use';
    if((order.timer-=dt)<=0){order.path=seat.route.map(p=>[...p]);order.phase='carrying';nao.userData.heldItem=order.kind==='oolong'?'tea':'beer';delete nao.userData.socialPose;nao.userData.carrying=true;nao.userData.activity='bringing your drink';}
   }else if(order.phase==='carrying'){
    delete nao.userData.socialPose;
    if(walk(nao,order.path,dt)){face(nao,seat.table[0],seat.table[2]);order.phase='placing';order.timer=1.1;nao.userData.socialPose='CarryIdle';}
   }else if(order.phase==='placing'){
    if((order.timer-=dt)<=0){
     clearDrink();const prop=createDrinkProp(order.kind);prop.position.set(...seat.table);room.add(prop);
     drink={kind:order.kind,left:spec.sips,prop};served++;
     delete nao.userData.heldItem;delete nao.userData.carrying;nao.userData.socialPose='Greet';
     say('Nao: '+spec.line,4);order.phase='bowing';order.timer=.9;
    }
   }else if(order.phase==='bowing'){
    if((order.timer-=dt)<=0){delete nao.userData.socialPose;order.path=[...seat.route.slice(0,-1).reverse(),[NAO_STATION[0],NAO_STATION[2]]].map(p=>[...p]);order.phase='returning';nao.userData.activity='back to the counter';}
   }else if(order.phase==='returning'){
    delete nao.userData.socialPose;
    if(walk(nao,order.path,dt)){nao.rotation.set(0,Math.PI,0);release(nao);order=null;}
   }
  },
  /** Leaving the room: drop the order and anything on the table. */
  clear(){const nao=getNao();if(order&&nao){nao.position.set(...NAO_STATION);nao.rotation.set(0,Math.PI,0);release(nao);}order=null;clearDrink();},
  /** Only for tests and a room rebuild: put a served drink straight on the table. */
  place(kind,seat){clearDrink();const prop=createDrinkProp(kind);prop.position.set(...seat.table);room.add(prop);drink={kind,left:DRINKS[kind].sips,prop};}
 };
}
