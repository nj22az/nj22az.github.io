import * as THREE from '../../../vendor/three.module.js';
import {STORE_ITEMS} from '../../commerce/catalogue.js';
export function buildConvenienceStore({room,box,reg,collider,action,signTexture,clerk}){
 const productObjects=[];
 function item(size,pos,color,label,fn){const o=box(size,pos,color,room,false);reg(o,label,fn,true);return o;}
 function sign(jp,en,pos,w=1.4,h=.35){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:signTexture(jp,en,'#aa677e'),roughness:.9}));o.position.set(...pos);room.add(o);return o;}
 // Two stocked gondolas with open sight lines and wide circulation around the checkout.
 const frame=0xe2dfcf,trim=0xa84546;
 function rack(x,z){
  item([1.75,.16,.72],[x,.13,z],frame,'Read stock card',()=>action('inspect','Stock card','Morning delivery · rotate the oldest packets to the front.'));
  for(const dx of [-.84,.84])item([.045,1.9,.045],[x+dx,1.05,z-.25],0x939b93,'Inspect shelf upright',()=>action('inspect','Shelf upright','Paint rubbed away where the stock trolley catches it.'));
  for(const y of [.38,.83,1.28,1.73]){item([1.75,.055,.72],[x,y,z],frame,'Read shelf prices',()=>action('inspect','Shelf prices','Handwritten prices include tax. The smaller cards mark today’s deliveries.'));item([1.76,.07,.035],[x,y,z+.36],trim,'Read price strip',()=>action('inspect','Price strip','Tea ¥120 · coffee ¥120 · biscuits ¥100.'));}
  collider(x,z,1.85,.82);
 }
 rack(-4.4,-2.9);rack(-1.35,-2.9);rack(-4.4,.10);rack(-1.35,.10);
 function packetGeometry(spec){
  if(['tea','coffee'].includes(spec.id))return new THREE.CylinderGeometry(.065,.065,.24,20);
  const shape=new THREE.Shape();if(spec.id==='rice'){shape.moveTo(-.09,-.065);shape.lineTo(.09,-.065);shape.lineTo(0,.085);shape.closePath();}else{shape.moveTo(-.088,-.112);shape.lineTo(.088,-.112);shape.lineTo(.088,.112);shape.lineTo(-.088,.112);shape.closePath();}
  const g=new THREE.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelThickness:.005,bevelSize:.005,bevelSegments:2,steps:1});g.translate(0,0,-.045);return g;
 }

 const placements=[];
 STORE_ITEMS.forEach((spec,i)=>{
  const baseX=i<4?-4.4:-1.35,row=i%4,y=.38+row*.45+.15,positions=[];
  for(const z of [-2.60,.40])for(let n=0;n<6;n++)positions.push([baseX-.65+n*.26,y,z]);
  const material=new THREE.MeshStandardMaterial({color:spec.color,roughness:.62});const stock=new THREE.InstancedMesh(packetGeometry(spec),material,positions.length);stock.castShadow=true;stock.receiveShadow=true;room.add(stock);
  const labelMaterial=new THREE.MeshStandardMaterial({map:signTexture(spec.jp,spec.name,'#b3484e'),roughness:.88});
  const labels=new THREE.InstancedMesh(new THREE.PlaneGeometry(.15,.11),labelMaterial,positions.length);room.add(labels);
  positions.forEach((pos,n)=>{const matrix=new THREE.Matrix4().makeTranslation(...pos);stock.setMatrixAt(n,matrix);labels.setMatrixAt(n,new THREE.Matrix4().makeTranslation(pos[0],pos[1],pos[2]+.069));const anchor=new THREE.Object3D();anchor.position.set(...pos);anchor.userData.storeItem=spec.id;room.add(anchor);reg(anchor,'Examine '+spec.name,()=>action('store-item',spec.name,spec),true);placements.push(anchor);if(n===0)productObjects.push(anchor);});
  sign(spec.jp,'¥'+spec.cost,[baseX,.38+row*.45-.035,-2.50],.55,.12);
 });
 // Checker tiles and ceiling battens share geometry/materials across the whole room.
 for(const [parity,color] of [[0,0xe8e4d7],[1,0xc7d2cb]]){const floor=new THREE.InstancedMesh(new THREE.BoxGeometry(.495,.012,.495),new THREE.MeshStandardMaterial({color,roughness:.53}),288);let n=0;for(let x=0;x<24;x++)for(let z=0;z<24;z++)if((x+z)%2===parity)floor.setMatrixAt(n++,new THREE.Matrix4().makeTranslation(-5.75+x*.5,.075,-5.75+z*.5));room.add(floor);}
 for(const x of [-3.4,2.9])for(const z of [-3.0,1.4]){item([.55,.09,2.0],[x,3.95,z],0xa7aea8,'Inspect ceiling light',()=>action('inspect','Fluorescent fitting','A clean white light and the faintest electrical hum.'));const tube=item([.37,.035,1.78],[x,3.89,z],0xf7f4df,'Inspect light diffuser',()=>action('inspect','Light diffuser','The cover was washed before the shop opened.'));tube.material.emissive.set(0xfff7e2);tube.material.emissiveIntensity=.9;}
 const shopLight=new THREE.HemisphereLight(0xfff7e7,0xc4c8b5,.65);room.add(shopLight);
 item([3.1,.95,.8],[2.7,.475,-1],0x9c6c72,'Read counter note',()=>action('inspect','Counter note','桜商店 · Sakura Shōten\nYuri is here until 20:00. Leave a message with the delivery bell.'));collider(2.7,-1,3.2,.9);
 let tillOpen=false;const till=item([.65,.35,.5],[2.55,1.16,-.98],0xd7c8ad,'Open / close till drawer',()=>{tillOpen=!tillOpen;drawer.position.z=tillOpen?.42:.22;});
 for(const x of [-.24,-.12,0,.12,.24])for(const z of [-.07,.035,.14])box([.08,.025,.07],[x,.19,z],0x535854,till,false);box([.50,.10,.025],[0,.07,.263],0x3c4a46,till,false);
 const drawer=box([.55,.10,.38],[0,-.10,.22],0x6c6251,till,false);
 item([.32,.025,.4],[3.4,.98,-.75],0xc68da1,'Browse mail-order catalogue',()=>action('store-catalogue'));
 // A low back-wall display, magazines and notices make the stock area read as a working shop.
 for(const y of [.45,.9,1.35,1.8]){item([6,.045,.45],[-2.5,y,-5.85],0xe1ddca,'Browse household stock',()=>action('inspect','Household stock','Tissues, tea tins, sewing thread and notebooks. Ask Yuri if you need a particular size.'));for(let n=0;n<16;n++)item([.20,.25,.14],[-5.25+n*.35,y+.15,-5.72],[0xb8a173,0x859d85,0xb47e74,0xb2c1bf][n%4],'Inspect household packet',()=>action('inspect','Household packet','A price is pencilled on the underside of the wrapper.'));}
 collider(-2.5,-5.85,6.1,.60);
 sign('本日のおすすめ','COLD TEA · ¥120',[-3.8,2.8,-6.25],1.5,.9);sign('配達します','LOCAL DELIVERIES · ASK AT THE TILL',[-1.1,2.8,-6.25],1.8,.9);
 const cooler=item([1.35,2.2,.65],[4.8,1.1,-4.2],0xf3eedb,'Inspect cooler',()=>action('inspect','Drinks cooler','A steady compressor hum. The bottle caps point towards the door.'));collider(4.8,-4.2,1.45,.8);
 for(const y of [.45,.95,1.45,1.95])item([1.14,.04,.52],[4.8,y,-3.93],0xf2f2de,'Inspect cooler shelf',()=>action('inspect','Cooler shelf','Wipe dry before replacing the bottles.'));
 const hinge=new THREE.Group();hinge.position.set(4.14,0,-3.84);room.add(hinge);const door=box([1.30,2.05,.055],[.65,1.08,0],0xc6e0df,hinge,false);door.material.transparent=true;door.material.opacity=.18;door.material.depthWrite=false;for(const x of [.025,1.275])box([.045,2.10,.065],[x,1.08,0],0xabb6b2,hinge,false);for(const y of [.045,2.105])box([1.30,.045,.065],[.65,y,0],0xabb6b2,hinge,false);box([.035,.45,.10],[1.18,1.08,.06],0x545e5b,hinge,false);let open=false;reg(door,'Open / close drinks cooler',()=>{open=!open;hinge.rotation.y=open?-1.65:0;},true);
 for(let i=0;i<4;i++)item([.13,.32,.13],[4.35+i*.28,1.15,-3.83],STORE_ITEMS[i%2].color,'Choose '+STORE_ITEMS[i%2].name,()=>action('store-item',STORE_ITEMS[i%2].name,STORE_ITEMS[i%2]));
 sign('桜商店','SAKURA SHŌTEN · DAILY GOODS',[0,2.8,-6.25],3.6);
 item([.5,.28,.20],[1.35,1.1,-1],0x735344,'Tune counter radio',()=>action('radio','Yuri’s radio','The volume is low enough to hear the door bell.'));
 item([.25,.12,.25],[3.8,1.06,-.80],0xbda263,'Ring service bell',()=>action('resident','Yuri'));
 clerk.position.set(3.35,0,-1.95);clerk.rotation.y=Math.PI;clerk.visible=true;reg(clerk,'Say hello to Yuri',()=>action('resident','Yuri'),true);collider(3.35,-1.95,.75,.65);
 return {products:productObjects,placements,cooler,door};
}

export function buildStoreShell({room,box,reg,exit}){
 box([13,.18,13],[0,-.08,0],0xd9d7c7,room,false);
 for(const [size,pos] of [[[13,4.3,.20],[0,2.15,-6.45]],[[.20,4.3,13],[-6.45,2.15,0]],[[.20,4.3,13],[6.45,2.15,0]]])box(size,pos,0xf0ead9,room,false);
 for(const x of [-4.2,4.2]){const glass=box([5.0,3.0,.05],[x,1.6,6.4],0xc9dfdf,room,false);glass.material.transparent=true;glass.material.opacity=.20;glass.material.depthWrite=false;box([5.1,.20,.20],[x,3.2,6.4],0xa84d49,room,false);for(const dx of [-2.45,0,2.45])box([.055,3.2,.09],[x+dx,1.6,6.4],0x9aaba5,room,false);}
 const door=box([2.5,3.1,.045],[0,1.6,6.4],0xbcd4d4,room,false);door.material.transparent=true;door.material.opacity=.14;door.material.depthWrite=false;reg(door,'Exit to street',exit,true);
 for(const x of [-1.28,0,1.28])box([.055,3.2,.08],[x,1.6,6.4],0x879894,room,false);
 for(const x of [-.13,.13])box([.035,.55,.09],[x,1.35,6.31],0x4c5958,room,false);
 box([2.3,.025,1.0],[0,.10,5.6],0x786e64,room,false);
}
