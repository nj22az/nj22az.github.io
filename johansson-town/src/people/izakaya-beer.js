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
 awamori:Object.freeze({id:'awamori',jp:'泡盛 ロック',en:'awamori on the rocks',price:250,sips:5,alcohol:1.6,pour:1.8,line:'泡盛です。 Slowly -- it is older than you think.'}),
 sake:Object.freeze({id:'sake',jp:'日本酒 一合',en:'a flask of warm sake',price:220,sips:5,alcohol:1.3,pour:2.4,line:'熱燗です。 Careful, the tokkuri is hot.'}),
 oolong:Object.freeze({id:'oolong',jp:'ウーロン茶',en:'Oolong tea over ice',price:150,sips:4,alcohol:0,pour:1.6,line:'ウーロン茶です。 Plenty of ice.'})
});
/**
 * The food on Minato's wall, each cooked where it would be: skewers and fish over the
 * charcoal at the counter, oden from its pot, the fryer, the range, or the prep bench
 * for the cold dishes. `cook` is how long Nao is at it; `bites` how long it lasts you.
 */
export const DISHES=Object.freeze({
 yakitori:Object.freeze({id:'yakitori',jp:'焼き鳥盛合せ',en:'a plate of yakitori',price:180,bites:4,station:'grill',cook:6,line:'焼き鳥です。 Two tare, two salt.'}),
 edamame:Object.freeze({id:'edamame',jp:'枝豆',en:'a bowl of edamame',price:120,bites:3,station:'prep',cook:2,line:'枝豆です。 Salted while they were hot.'}),
 oden:Object.freeze({id:'oden',jp:'おでん',en:'a bowl of oden',price:260,bites:4,station:'oden',cook:3,line:'おでんです。 The daikon has been in since four.'}),
 hiyayakko:Object.freeze({id:'hiyayakko',jp:'冷奴',en:'cold tofu with ginger',price:150,bites:3,station:'prep',cook:2,line:'冷奴です。 Ginger and a little soy.'}),
 dashimaki:Object.freeze({id:'dashimaki',jp:'だし巻き玉子',en:'a rolled dashi omelette',price:200,bites:3,station:'range',cook:5,line:'だし巻きです。 Still warm in the middle.'}),
 hokke:Object.freeze({id:'hokke',jp:'ほっけ焼き',en:'grilled hokke',price:280,bites:4,station:'grill',cook:7,line:'ほっけです。 Lemon on the side.'}),
 sashimi:Object.freeze({id:'sashimi',jp:'刺身盛合せ',en:'the sashimi plate',price:320,bites:4,station:'prep',cook:4,line:'刺身です。 Masaru brought the tuna this morning.'}),
 agedashi:Object.freeze({id:'agedashi',jp:'揚げ出し豆腐',en:'agedashi tofu',price:180,bites:3,station:'fryer',cook:5,line:'揚げ出しです。 Mind the broth, it is hot.'}),
 karaage:Object.freeze({id:'karaage',jp:'鶏の唐揚げ',en:'chicken karaage',price:220,bites:4,station:'fryer',cook:6,line:'唐揚げです。 Straight out of the oil.'}),
 ochazuke:Object.freeze({id:'ochazuke',jp:'お茶漬け',en:'ochazuke to finish',price:180,bites:3,station:'range',cook:4,line:'お茶漬けです。 The way to end an evening.'}),
});
export const MINATO_MENU=Object.freeze([...Object.values(DISHES),...Object.values(DRINKS)]);
export const menuItem=id=>DRINKS[id]||DISHES[id]||null;
/** Where Nao stands to cook each kind of dish (see tools/blender/build-minato-interior.py). */
export const KITCHEN_STATIONS=Object.freeze({grill:[1.7,0,-3.6],oden:[-4.2,0,-3.6],range:[1.4,0,-5.15],fryer:[2.75,0,-5.15],prep:[5.4,0,-5.15]});
export const NAO_STATION=Object.freeze([3.5,0,-3.8]);

/**
 * Where the player can sit, and where Nao stands to serve that seat. `table` is the spot
 * on the table in front of the player; `serve` is Nao's floor spot beside it.
 */
export const IZAKAYA_PLAYER_SEATS=Object.freeze({
 table:Object.freeze({id:'table',label:'Sit at the table',position:[3.3,0,.9],stand:[3.3,0,.25],eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],dish:[3.02,.945,1.5],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),
 window:Object.freeze({id:'window',label:'Sit and enjoy the evening',position:[4,0,2.7],stand:[2.95,0,2.7],eyeY:1.2,yaw:Math.PI/2,table:[3.62,.945,2.55],dish:[3.62,.945,2.3],serve:[4,0,1.6],route:[[3.95,-3.55],[3.95,.3],[4,1.6]]}),
 // The five counter stools, among the regulars. Nao serves these across the counter
 // from the kitchen side, so their route never leaves the working aisle.
 ...Object.fromEntries([-3.8,-2.3,-.8,.7,2.2].map((x,i)=>['counter'+i,Object.freeze({id:'counter'+i,label:'Sit at the counter',counter:true,
  position:[x,0,-1.42],stand:[x,0,-.72],eyeY:1.32,yaw:0,table:[x+.15,1.11,-2.2],dish:[x-.12,1.11,-2.24],serve:[x,0,-3.75],route:[[x,-3.75]]})])),
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
export function createDrinkProp(kind,{held=false}={}){
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
  pour(g,liquid,head,.12,.036);
  const handle=add(new THREE.TorusGeometry(.03,.007,8,16,Math.PI),glass,.08,.05);handle.rotation.z=-Math.PI/2;
 }else if(kind==='bottle'){
  const brown=new THREE.MeshStandardMaterial({color:0x5a2e10,roughness:.25,transparent:true,opacity:.48,depthWrite:false});
  if(!held){
   add(new THREE.CylinderGeometry(.038,.038,.2,18),brown,.1,-.06);add(new THREE.CylinderGeometry(.013,.036,.08,14),brown,.24,-.06);
   add(new THREE.CylinderGeometry(.034,.034,.05,18),new THREE.MeshStandardMaterial({color:0xf2f0e8,roughness:.6}),.1,-.06);
   const contents=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.185,18),beer);contents.position.set(-.06,.095,0);level.add(contents);
  }
  const x=held?0:.05;
  add(new THREE.CylinderGeometry(.03,.027,.09,16),glass,.045,x);
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.027,.025,.07,16),beer);liquid.position.set(x,.037,0);level.add(liquid);
  const head=new THREE.Mesh(new THREE.CylinderGeometry(.028,.027,.012,16),foam);head.position.set(x,.078,0);level.add(head);
  pour(g,liquid,head,.07,.022);
 }else if(kind==='can'){
  const can=add(new THREE.CylinderGeometry(.033,.033,.122,20),new THREE.MeshStandardMaterial({color:0xf2f2ee,roughness:.35,metalness:.55}),.061);
  add(new THREE.CylinderGeometry(.0335,.0335,.045,20),new THREE.MeshStandardMaterial({color:0x1e4f9c,roughness:.4,metalness:.4}),.07);
  add(new THREE.CylinderGeometry(.0336,.0336,.008,20),new THREE.MeshStandardMaterial({color:0xc8322a,roughness:.4}),.095);
  void can;
 }else if(kind==='coffee'){
  // Hot coffee at the ramen counter: a thick white cup, on a saucer when it is set down.
  const china=new THREE.MeshStandardMaterial({color:0xf4f1ea,roughness:.35});
  const cup=add(new THREE.CylinderGeometry(.036,.028,.07,20,1,true),new THREE.MeshStandardMaterial({color:0xf4f1ea,roughness:.35,side:THREE.DoubleSide}),.035);void cup;
  add(new THREE.CylinderGeometry(.028,.028,.004,20),china,.002);
  const handle=add(new THREE.TorusGeometry(.017,.005,8,14,Math.PI),china,.04,.038);handle.rotation.z=-Math.PI/2;
  if(!held)add(new THREE.CylinderGeometry(.062,.055,.008,24),china,-.004);
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.033,.028,.055,20),new THREE.MeshStandardMaterial({color:0x2b160a,roughness:.15}));liquid.position.y=.03;level.add(liquid);
 }else{
  // Oolong, and the ramen counter's cold barley tea (mugicha), paler, in the same tumbler.
  add(new THREE.CylinderGeometry(.036,.032,.11,18),glass,.055);
  const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.033,.03,.085,18),new THREE.MeshStandardMaterial({color:kind==='mugicha'?0xa8682a:0x7a3f18,roughness:.25,transparent:true,opacity:kind==='mugicha'?.78:.85}));liquid.position.y=.045;level.add(liquid);
  for(let i=0;i<3;i++){const ice=new THREE.Mesh(new THREE.BoxGeometry(.022,.022,.022),glass);ice.position.set((i-1)*.012,.08,(i%2)*.01);ice.rotation.set(i,i*.7,0);level.add(ice);}
 }
 g.userData.portion=1;g.userData.targetPortion=1;g.userData.consumable='drink';
 g.userData.rimHeight=kind==='draft'?.15:kind==='bottle'?.09:kind==='can'?.122:kind==='coffee'?.07:.11;
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 return g;
}

/** A dish as a small prop on its plate or in its bowl, with a `level` that empties as you eat. */
export function createDishProp(kind){
 const g=new THREE.Group();g.name='Minato dish · '+kind;
 const m=c=>new THREE.MeshStandardMaterial({color:c,roughness:.6});
 const add=(geo,mat,x=0,y=0,z=0,parent=g)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);parent.add(o);return o;};
 const level=new THREE.Group();g.add(level);g.userData.level=level;
 const plate=(w,d,c=0x2f5872)=>add(new THREE.BoxGeometry(w,.014,d),m(c),0,.007);
 const bowl=(r,h,c=0xf1ece0)=>add(new THREE.CylinderGeometry(r,r*.7,h,16,1,true),new THREE.MeshStandardMaterial({color:c,roughness:.35,side:THREE.DoubleSide}),0,h/2);
 if(kind==='yakitori'||kind==='hokke'){
  plate(.26,.12,0xf1ece0);
  if(kind==='yakitori')for(let k=0;k<4;k++){add(new THREE.BoxGeometry(.22,.006,.006),m(0xa06c42),0,.02,-.04+k*.027,level);for(let j=0;j<4;j++)add(new THREE.BoxGeometry(.03,.024,.024),m(k%2?0x7c3f1b:0xd9b27a),-.07+j*.045,.028,-.04+k*.027,level);}
  else{const fish=add(new THREE.BoxGeometry(.2,.025,.08),m(0xb07a45),0,.027,0,level);fish.rotation.y=.1;add(new THREE.SphereGeometry(.018,8,6),m(0xf2e35a),.09,.03,.04,level);}
 }else if(kind==='sashimi'){
  plate(.24,.16,0xf1ece0);for(let k=0;k<6;k++)add(new THREE.BoxGeometry(.04,.018,.1),m([0xea8a5c,0x9e2c35,0xefe3d2][k%3]),-.08+k*.032,.024,0,level).rotation.y=.25;
  add(new THREE.SphereGeometry(.015,8,6),m(0x7d9b45),.1,.025,.05,level);
 }else if(kind==='edamame'||kind==='karaage'){
  bowl(.07,.045,0x2f5872);
  for(let k=0;k<(kind==='edamame'?9:6);k++){const a=k*2.3,r=.035*((k%3)/2+.3);add(kind==='edamame'?new THREE.BoxGeometry(.045,.014,.018):new THREE.SphereGeometry(.022,8,6),m(kind==='edamame'?0x7d9b45:0xb8742e),Math.cos(a)*r,.045,Math.sin(a)*r,level).rotation.y=a;}
 }else if(kind==='oden'||kind==='agedashi'||kind==='ochazuke'||kind==='ramen'||kind==='rice'){
  bowl(.075,.06,kind==='ochazuke'?0x2f5872:0x8a5a3a);
  add(new THREE.CylinderGeometry(.068,.068,.004,16),m(kind==='ochazuke'?0xb7a35c:0xa8732f),0,.045,0,level);
  if(kind==='oden'){add(new THREE.CylinderGeometry(.025,.025,.03,12),m(0xe3d3a6),-.025,.05,0,level);add(new THREE.SphereGeometry(.02,8,6),m(0xb98a4a),.025,.052,.01,level);}
  else if(kind==='agedashi')for(let k=0;k<2;k++)add(new THREE.BoxGeometry(.04,.03,.04),m(0xd7a55a),-.02+k*.04,.05,0,level);
  else if(kind==='ramen'||kind==='rice'){
   for(let i=0;i<6;i++)add(new THREE.SphereGeometry(.016,8,6),m(0xe8cf7a),(i%3-1)*.025,.052,Math.floor(i/3)*.025-.012,level);
  }else add(new THREE.BoxGeometry(.05,.004,.05),m(0x1f2a22),0,.05,0,level);
 }else if(kind==='hiyayakko'){
  plate(.12,.12,0x2f5872);add(new THREE.BoxGeometry(.07,.04,.07),m(0xf1ece0),0,.035,0,level);add(new THREE.BoxGeometry(.02,.01,.02),m(0xd9b35a),0,.06,0,level);
 }else if(kind==='gyoza'){
  plate(.22,.12,0xf1ece0);for(let k=0;k<6;k++){const d=add(new THREE.SphereGeometry(.024,8,6),m(0xd9b27a),-.08+k*.032,.022,0,level);d.scale.set(.8,.6,1.4);}
 }else{ // dashimaki
  plate(.2,.1,0xf1ece0);for(let k=0;k<4;k++)add(new THREE.BoxGeometry(.035,.035,.06),m(0xf0c94a),-.06+k*.04,.03,0,level);
 }
 g.userData.portion=1;g.userData.targetPortion=1;g.userData.consumable='food';
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 return g;
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
export function createBiteProp(kind){
 const g=new THREE.Group();g.userData.food=true;g.userData.consumable='food';g.userData.portion=1;g.userData.targetPortion=1;
 const wood=new THREE.MeshStandardMaterial({color:0xc9a26b,roughness:.6});
 for(const x of [-.008,.008]){const stick=new THREE.Mesh(new THREE.BoxGeometry(.005,.005,.16),wood);stick.position.set(x,.02,.04);g.add(stick);}
 const level=new THREE.Group();g.add(level);g.userData.level=level;
 const food=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),new THREE.MeshStandardMaterial({color:kind==='edamame'?0x7d9b45:kind==='sashimi'?0xea8a5c:0xd9b27a,roughness:.6}));
 food.position.set(0,.04,.10);level.add(food);return g;
}
export function disposeServing(prop){
 if(!prop)return;prop.removeFromParent();const materials=new Set();
 prop.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
 materials.forEach(m=>m.dispose());
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.room
 * @param {()=>THREE.Object3D|null} options.getNao Nao's entity when she is working the room
 * @param {(x:number,z:number,r:number)=>boolean} options.blocked
 * @param {(text:string,seconds?:number)=>void} [options.say]
 */
export function createBeerService({room,getNao,blocked,say=()=>{}}){
 let order=null,drink=null,dish=null,served=0;
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
   * Ask for a drink or a dish at this seat. False if Nao is not here or something is
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
     say('Nao: '+spec.line,4);order.phase='bowing';order.timer=.9;
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
