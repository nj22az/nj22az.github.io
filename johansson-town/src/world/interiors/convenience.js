import {createStoreAdvertising} from './store-advertising.js';
import * as THREE from '../../../vendor/three.module.js';
import {STORE_ITEMS} from '../../commerce/catalogue.js';
import {STORE_CLERK_POSITION,STOCKROOM_DOOR,STORE_COUNTER,STORE_PARTITIONS} from './store-layout.js';

export function buildConvenienceStore({room,box,reg,collider,action,signTexture,clerk}){
 const cream=0xf0e8d7,red=0xc73d39,steel=0x999fa3,blue=0x3566b2;
 const batches=new Map(),geometries=new Map(),dummy=new THREE.Object3D();
 const products=[],placements=[],advertising=createStoreAdvertising({room,reg,action});
 function shape(kind,size,pos,color,rotation=0){
  if(!geometries.has(kind)){
   let g;
   if(kind==='cylinder')g=new THREE.CylinderGeometry(1,1,1,12);
   else if(kind==='sphere')g=new THREE.SphereGeometry(1,10,8);
   else if(kind==='rice'){
    const s=new THREE.Shape();s.moveTo(-.19,0);s.lineTo(.19,0);s.lineTo(0,.32);s.closePath();
    g=new THREE.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelThickness:.02,bevelSize:.025,bevelSegments:2});g.translate(0,0,-.08);
   }else g=new THREE.BoxGeometry(1,1,1);
   geometries.set(kind,g);
  }
  const key=kind+':'+color;
  if(!batches.has(key))batches.set(key,{geometry:geometries.get(kind),color,matrices:[]});
  dummy.position.set(...pos);dummy.rotation.set(0,rotation,0);dummy.scale.set(...size);dummy.updateMatrix();batches.get(key).matrices.push(dummy.matrix.clone());
 }
 const block=(size,pos,color)=>shape('box',size,pos,color);
 function anchor(pos,label,fn){const o=new THREE.Object3D();o.position.set(...pos);room.add(o);reg(o,label,fn,true);return o;}
 function inspect(pos,label,text){return anchor(pos,'Inspect '+label,()=>action('inspect',label,text));}
 function bottle(x,y,z,color,cap=red,brand='water'){
  shape('cylinder',[.11,.31,.11],[x,y+.155,z],color);
  shape('sphere',[.11,.09,.11],[x,y+.30,z],color);
  shape('cylinder',[.049,.13,.049],[x,y+.38,z],color);
  shape('cylinder',[.057,.05,.057],[x,y+.46,z],cap);
  shape('cylinder',[.113,.10,.113],[x,y+.17,z],0xf4e9d5);
  advertising.label(brand,[x,y+.17,z],.23,.10,{radius:.114});
 }
 function can(x,y,z,color,brand='coffee'){shape('cylinder',[.105,.26,.105],[x,y+.13,z],color);for(const h of [.014,.25])shape('cylinder',[.107,.025,.107],[x,y+h,z],0xd0d3d0);advertising.label(brand,[x,y+.13,z],.23,.20,{radius:.107});}
 function carton(x,y,z,w=.6,h=.45,d=.5){block([w,h,d],[x,y+h/2,z],0xc4a172);block([w+.01,.025,.10],[x,y+h+.013,z],0xddbd8c);block([.10,h+.015,.015],[x,y+h/2,z+d/2+.009],0xddbd8c);advertising.label('stock',[x,y+h*.6,z+d/2+.019],w*.68,h*.36);}
 function crate(x,y,z,color){
  block([.68,.07,.52],[x,y+.035,z],color);
  for(const side of [-1,1]){block([.065,.35,.52],[x+side*.31,y+.20,z],color);block([.68,.10,.045],[x,y+.31,z+side*.24],color);for(const dx of [-.24,0,.24])block([.06,.25,.04],[x+dx,y+.17,z+side*.24],color);}
 }
 function rack(x,z,w,h=1.8,depth=.65,warehouse=false){
  const frame=warehouse?steel:cream;
  for(const dx of [-w/2,w/2])for(const dz of [-depth/2,depth/2])block([.06,h,.06],[x+dx,h/2,z+dz],frame);
  const levels=warehouse?[.2,.9,1.6]:[.20,.75,1.30];
  for(const y of levels){block([w+.1,.065,depth],[x,y,z],frame);if(!warehouse)block([w+.12,.07,.055],[x,y,z+depth/2],red);}
  collider(x,z,w+.15,depth+.1,h);return levels;
 }
 // Quiet cream floor with narrow grout joints, one shared batch.
 for(let x=0;x<24;x++)for(let z=0;z<24;z++)block([.495,.025,.495],[-5.75+x*.5,.065,-5.75+z*.5],0xe6ded0);
 // The stockroom is a real part of this room, reached through the right-hand opening.
 for(const c of STORE_PARTITIONS){block([c.w,3.6,c.d],[c.x,1.8,c.z],cream);block([c.w,.20,.18],[c.x,2.98,c.z],red);collider(c.x,c.z,c.w,c.d,3.6);}
 block([1.5,.72,.17],[3.9,3.24,-2.4],cream);
 for(const x of [3.10,4.70])block([.10,2.86,.22],[x,1.43,-2.4],0xc8a16f);
 // Door stands open against the jamb, with a blue inset window.
 block([.07,2.72,1.28],[4.74,1.36,-3.02],0x6d737a);
 block([.08,.65,.49],[4.69,1.94,-2.95],0x82b8d2);
 collider(4.74,-3.02,.09,1.28,2.72);
 inspect([3.9,1.5,-2.15],'stockroom doorway','Deliveries are stored behind the shop. Keep this passage clear.');

 let cooler,door;
 for(const [i,x] of [-4.65,-3.10].entries()){
  const z=-1.40,c=i?blue:red;
  block([1.38,2.55,.85],[x,1.275,z],c);block([1.18,2.16,.08],[x,1.18,z+.43],0xdce9e8);
  for(const y of [.28,.87,1.46]){
   block([1.15,.055,.56],[x,y,z+.65],cream);
   for(let n=0;n<3;n++){const px=x-.36+n*.36;
    if(i&&y>.8)can(px,y+.035,z+.65,y>1?0x50342a:0xc4ac6a,y>1?'coffee':'beer');
    else if(i)bottle(px,y+.035,z+.65,0x91c1db,0x477c9b,'water');
    else bottle(px,y+.035,z+.65,y<.5?0x343639:0x64835b,y<.5?red:0x304c32,y<.5?'cola':'tea');
   }
  }
  const hinge=new THREE.Group();hinge.position.set(x-.64,0,z+.95);room.add(hinge);
  const panel=box([1.28,2.18,.035],[.64,1.19,0],0xc4e4e5,hinge,false);panel.material.transparent=true;panel.material.opacity=.13;panel.material.depthWrite=false;
  for(const px of [0,1.28])box([.045,2.25,.065],[px,1.19,0],steel,hinge,false);
  for(const y of [.065,2.31])box([1.3,.045,.065],[.64,y,0],steel,hinge,false);
  box([.05,.5,.09],[1.18,1.12,.06],steel,hinge,false);
  let open=false;reg(panel,'Open / close drinks cooler',()=>{open=!open;hinge.rotation.y=open?-1.48:0;},true);
  collider(x,z+.25,1.42,1.35,2.55);
  if(!i){cooler=hinge;door=panel;}
 }
 // Fewer, larger products with consistent fictional packaging and shelf prices.
 rack(-1.4,2.0,2.9,1.65,.8);
 rack(-1.35,-1.87,1.8,2.05,.55);
 const positions=[[-4.95,.95,-.65],[-2.75,1.54,-.65],[-2.30,.24,2.22],[-2.35,1.35,2.22],[-1.3,.81,2.22],[-.55,.25,2.22],[-1.05,1.35,2.22],[-.40,.81,2.22]];
 STORE_ITEMS.forEach((spec,i)=>{
  const [x,y,z]=positions[i];
  // Tea and coffee use the bottles/cans already in the refrigerator.
  if(i>1)for(let n=0;n<2;n++){
   const px=x+n*.32;
   if(spec.id==='rice'){
    shape('rice',[1,1,1],[px,y,z],0xf3ead6);block([.15,.18,.19],[px,y+.09,z+.005],0x28372f);
    advertising.label(spec.id,[px,y+.17,z+.106],.15,.09);
   }else if(spec.id==='biscuit'){
    block([.30,.42,.14],[px,y+.21,z],red);for(const h of [.02,.40])block([.31,.028,.15],[px,y+h,z],red);
    advertising.label(spec.id,[px,y+.23,z+.076],.28,.25);
   }else if(spec.id==='battery'){
    for(const dx of [-.055,.055]){
     shape('cylinder',[.045,.22,.045],[px+dx,y+.11,z],0x404442);
     shape('cylinder',[.047,.015,.047],[px+dx,y+.215,z],0xd0d3d0);
     advertising.label(spec.id,[px+dx,y+.11,z],.1,.17,{radius:.047});
    }
    advertising.label(spec.id,[px,y+.285,z+.052],.25,.10);
   }else{
    const depth=['notebook','postcard'].includes(spec.id)?.045:.12;
    block([.26,spec.id==='postcard'?.24:.27,depth],[px,y+.14,z],spec.color);
    advertising.label(spec.id,[px,y+.14,z+depth/2+.003],.245,.19);
   }

  }
  advertising.label(spec.id,[x+.13,y-.045,z+.22],.30,.13,{price:true});
  const o=anchor([x,y+.2,z],'Examine '+spec.brand+' · '+spec.name,()=>action('store-item',spec.name,spec));o.userData.storeItem=spec.id;products.push(o);placements.push(o);
 });
 for(let n=0;n<4;n++){
  const x=-2+n*.43;
  shape('cylinder',[.15,.30,.15],[x,1.52,-1.70],0xe3bc65);shape('cylinder',[.16,.035,.16],[x,1.685,-1.70],cream);advertising.label('noodles',[x,1.52,-1.70],.32,.22,{radius:.152});
  block([.29,.35,.18],[x,.97,-1.70],0xe8e3d5);advertising.label('milk',[x,.97,-1.605],.265,.27);
 }
 // Checkout with a clear staff aisle and an open route around its right end.
 const c=STORE_COUNTER;
 block([c.w,.98,c.d],[c.x,.49,c.z],cream);block([c.w+.12,.12,c.d+.08],[c.x,1.04,c.z],red);block([c.w+.05,.07,c.d],[c.x,1.135,c.z],cream);collider(c.x,c.z,c.w+.12,c.d+.08,1.18);
 const till=box([.58,.30,.45],[.50,1.31,-.50],0x565b60,room,false);
 box([.40,.33,.07],[0,.28,-.13],0x353c42,till,false);
 const drawer=box([.5,.08,.35],[0,-.12,.10],0x777b7b,till,false);let tillOpen=false;
 reg(till,'Open / close till drawer',()=>{tillOpen=!tillOpen;drawer.position.z=tillOpen?.32:.10;},true);
 block([.35,.025,.23],[1.25,1.19,-.24],blue);
 block([1.05,.10,.61],[2.55,1.20,-.50],steel);
 for(const y of [1.28,1.62])for(const x of [2.25,2.55,2.85])shape('sphere',[.12,.085,.105],[x,y,-.50],0xdca95a);
 const caseGlass=box([1.05,.70,.60],[2.55,1.56,-.50],0xcddedf,room,false);caseGlass.material.transparent=true;caseGlass.material.opacity=.16;caseGlass.material.depthWrite=false;
 for(const x of [2.02,3.08])block([.04,.72,.63],[x,1.54,-.50],steel);
 advertising.label('buns',[2.55,1.20,-.185],.65,.10);
 anchor([2.45,1.3,.02],'Browse steamed buns',()=>action('inspect','Steamed buns','Warm buns are kept ready beside the register.'));
 anchor([1.25,1.2,.05],'Browse mail-order catalogue',()=>action('store-catalogue'));
 anchor([.2,1.25,.05],'Ring service bell',()=>action('resident','Yuri'));
 anchor([-.35,1.3,-.45],'Tune counter radio',()=>action('radio','Yuri’s radio','A quiet radio behind the till.'));
 // Compact cash machine and two seats beside the front window.
 block([.88,1.55,.65],[5.05,.775,.10],0x80858b);block([.60,.46,.035],[5.05,1.23,.44],0x78aed0);block([.55,.08,.12],[5.05,.80,.45],0x41484f);collider(5.05,.10,.95,.72,1.55);
 inspect([4.9,1.2,.70],'cash machine','The local bank services this terminal on weekday mornings.');
 block([1.3,.10,.85],[3.8,.76,3.3],red);block([1.24,.04,.79],[3.8,.83,3.3],cream);shape('cylinder',[.10,.7,.10],[3.8,.35,3.3],steel);collider(3.8,3.3,1.35,.9,.86);
 for(const z of [2.3,4.3]){
  block([.58,.12,.58],[3.8,.45,z],red);block([.58,.58,.09],[3.8,.77,z+(z<3?- .28:.28)],red);
  for(const dx of [-.23,.23])for(const dz of [-.23,.23])block([.07,.4,.07],[3.8+dx,.2,z+dz],0xc6a170);
  collider(3.8,z,.65,.67,1.1);
  const seat=anchor([2.8,1,z],'Sit by the shop window',()=>action('seat','Sakura window seat','Watch the street with a drink.'));
  seat.userData.seat={position:[3.8,0,z],stand:[2.8,0,z],eyeY:1.2,yaw:z<3?Math.PI:0,pitch:0};
 }
 // Stockroom: steel racking, spare drinks, cardboard cartons and cleaning supplies.
 rack(-3.6,-5.00,2.8,2.25,.7,true);rack(.05,-5.00,2.4,2.25,.7,true);
 for(const x of [-4.45,-3.65,-2.85,-.70,.10,.90]){carton(x,.25,-5);carton(x,1.65,-5,.57,.45,.5);}
 for(const [x,color] of [[-4.3,red],[-3.4,0x43805b],[-.60,blue],[.3,0xdaa53c]]){crate(x,.94,-5,color);for(const dx of [-.17,.17])bottle(x+dx,1.04,-5,0x739ba2);}
 block([1.45,2.3,.78],[2.3,1.15,-5],0xc8cac7);for(const x of [1.94,2.66])block([.62,2.02,.035],[x,1.23,-4.59],0xe3e0d4);for(const x of [2.21,2.39])block([.04,.58,.08],[x,1.3,-4.53],0x6a7276);block([1.36,.23,.04],[2.3,.18,-4.59],0x666d72);collider(2.3,-5,1.5,.85,2.3);
 inspect([2.3,1.2,-4.1],'stockroom freezer','Reserve stock stays chilled until it is needed in the shop.');
 block([.8,.85,.65],[5,.425,-4.0],steel);block([.65,.05,.52],[5,.88,-4.0],0x59656b);block([.045,.38,.045],[5,1.04,-4.2],steel);block([.20,.045,.045],[4.92,1.22,-4.2],steel);collider(5,-4,.85,.75,1.25);
 block([.07,1.55,.07],[5.35,.86,-5.0],red);block([.38,.35,.35],[5.35,.18,-5.0],blue);
 block([.85,.10,.60],[-2.8,.16,-3.25],blue);carton(-2.8,.24,-3.25,.60,.50,.50);for(const x of [-3.12,-2.48])shape('cylinder',[.12,.10,.12],[x,.12,-3.25],0x434b51,Math.PI/2);block([.06,.95,.06],[-3.15,.56,-3.45],blue);block([.65,.06,.06],[-2.85,1.06,-3.45],blue);collider(-2.8,-3.25,.95,.72,1.1);
 inspect([-1.9,1,-3.2],'delivery trolley','Fresh deliveries are checked here before the shelves are restocked.');
 for(const x of [-4.85,-4.15])shape('cylinder',[.14,.31,.14],[x,2.16,-5],cream);
 // Soft, even light; no light is added per product or per shelf.
 room.add(new THREE.HemisphereLight(0xfff3dc,0xbfc8c5,1.25));
 for(const [x,z] of [[-2,1],[2,1],[0,-4]]){
  const lamp=box([.45,.07,1.8],[x,3.48,z],0xfff5dc,room,false);lamp.material.emissive.set(0xfff1ce);lamp.material.emissiveIntensity=.8;
 }
 clerk.position.set(...STORE_CLERK_POSITION);clerk.rotation.y=Math.PI;clerk.visible=true;reg(clerk,'Say hello to Yuri',()=>action('resident','Yuri'),true);
 for(const {geometry,color,matrices} of batches.values()){
  const m=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.74}),matrices.length);m.name='sakura-stock-batch';matrices.forEach((matrix,i)=>m.setMatrixAt(i,matrix));m.receiveShadow=true;m.castShadow=false;m.computeBoundingSphere();room.add(m);
 }
 return {products,placements,cooler,door,stockroomDoor:STOCKROOM_DOOR,advertising:advertising.finish()};
}

export function buildStoreShell({room,box,reg,exit}){
 const cream=0xf0e8d7,red=0xc73d39;
 box([13,.18,13],[0,-.08,0],0xb9b2a4,room,false);
 for(const [size,pos] of [[[13,3.6,.20],[0,1.8,-6.45]],[[.20,3.6,13],[-6.45,1.8,0]],[[.20,3.6,13],[6.45,1.8,0]]])box(size,pos,cream,room,false);
 box([13,.12,13],[0,3.66,0],cream,room,false);
 for(const x of [-6.32,6.32])box([.06,.20,12.8],[x,2.98,0],red,room,false);
 box([12.8,.20,.06],[0,2.98,-6.32],red,room,false);
 for(const x of [-4.0,4.0]){
  const pane=box([5.3,2.8,.05],[x,1.5,6.3],0xc7dddf,room,false);pane.material.transparent=true;pane.material.opacity=.16;pane.material.depthWrite=false;
  box([5.4,.20,.12],[x,3.0,6.3],red,room,false);
 }
 const door=box([2.5,2.9,.045],[0,1.5,6.3],0xc6dddd,room,false);door.material.transparent=true;door.material.opacity=.12;door.material.depthWrite=false;reg(door,'Exit to street',exit,true);
 for(const x of [-1.27,0,1.27])box([.05,3.0,.08],[x,1.5,6.3],0x969e9d,room,false);
 box([2.3,.025,.85],[0,.09,5.3],0x51545a,room,false);
}
