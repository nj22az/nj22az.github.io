import * as THREE from '../../../vendor/three.module.js';
import {STORE_ITEMS} from '../../commerce/catalogue.js';
export function buildConvenienceStore({room,box,reg,collider,action,signTexture,clerk}){
 const productObjects=[];
 function item(size,pos,color,label,fn){const o=box(size,pos,color,room,false);reg(o,label,fn,true);return o;}
 function sign(jp,en,pos,w=1.4){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,.35),new THREE.MeshStandardMaterial({map:signTexture(jp,en,'#aa677e'),roughness:.9}));o.position.set(...pos);room.add(o);return o;}
 // Open aisles to either side of the centre stand; the counter remains reachable from the door.
 for(const x of [-3.7,-1.4]){item([1.7,1.6,.55],[x,.8,-2.6],0xd8c3b0,'Inspect shelf',()=>action('inspect','Stock shelf','Yui marks each delivery with the date in blue pencil.'));collider(x,-2.6,1.8,.65);}
 STORE_ITEMS.forEach((spec,i)=>{const x=-3.7+Math.floor(i/4)*2.3+(i%2? .40:-.40),y=i%4<2?.60:1.22,z=-2.23;
  const o=item([.30,.27,.20],[x,y,z],spec.color,'Examine '+spec.name,()=>action('store-item',spec.name,spec));o.userData.storeItem=spec.id;productObjects.push(o);sign(spec.jp,'¥'+spec.cost,[x,y-.20,z+.12],.65);
 });
 item([3.1,.95,.8],[2.7,.475,-1],0x9c6c72,'Read counter note',()=>action('inspect','Counter note','桜商店 · Sakura Shōten\nYui is here until 20:00. Leave a message with the delivery bell.'));collider(2.7,-1,3.2,.9);
 let tillOpen=false;const till=item([.65,.35,.5],[2.55,1.16,-.98],0xd7c8ad,'Open / close till drawer',()=>{tillOpen=!tillOpen;drawer.position.z=tillOpen?.42:.22;});
 const drawer=box([.55,.10,.38],[0,-.10,.22],0x6c6251,till,false);
 item([.32,.025,.4],[3.4,.98,-.75],0xc68da1,'Browse mail-order catalogue',()=>action('store-catalogue'));
 const cooler=item([1.35,2.2,.65],[4.8,1.1,-4.2],0xd8d4bd,'Inspect cooler',()=>action('inspect','Drinks cooler','A steady compressor hum. The bottle caps point towards the door.'));collider(4.8,-4.2,1.45,.8);
 const hinge=new THREE.Group();hinge.position.set(4.14,0,-3.84);room.add(hinge);const door=box([1.30,2.05,.055],[.65,1.08,0],0x7d9d9a,hinge,false);let open=false;reg(door,'Open / close drinks cooler',()=>{open=!open;hinge.rotation.y=open?-1.65:0;},true);
 for(let i=0;i<4;i++)item([.13,.32,.13],[4.35+i*.28,1.15,-3.83],STORE_ITEMS[i%2].color,'Choose '+STORE_ITEMS[i%2].name,()=>action('store-item',STORE_ITEMS[i%2].name,STORE_ITEMS[i%2]));
 sign('桜商店','SAKURA SHŌTEN · DAILY GOODS',[0,2.8,-6.25],3.6);
 item([.5,.28,.20],[1.35,1.1,-1],0x735344,'Tune counter radio',()=>action('radio','Yui’s radio','The volume is low enough to hear the door bell.'));
 item([.25,.12,.25],[3.8,1.06,-.80],0xbda263,'Ring service bell',()=>action('resident','Yui'));
 clerk.position.set(2.7,0,-2.25);clerk.rotation.y=Math.PI;clerk.visible=true;reg(clerk,'Talk to Yui',()=>action('resident','Yui'),true);collider(2.7,-2.25,.6,.6);
 return {products:productObjects,cooler,door};
}
