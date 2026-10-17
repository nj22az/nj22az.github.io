import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {poster} from './okinawa/signs.js';
import {HARBOUR_FLORIST} from './harbour-park-plan.js';
import {GROUND_LAYER} from './ground-layers.js';
export const FLOWER_SHOP=Object.freeze({...HARBOUR_FLORIST,staff:HARBOUR_FLORIST.owner});
export const flowerShopOpen=minutes=>{const m=((minutes%1440)+1440)%1440;return m>=FLOWER_SHOP.open&&m<FLOWER_SHOP.close;};
/** Mrs Kinjō's one open flower counter, beside the park entrance. */
export function buildFlowerShop({world,group=world.group,register,onAction}){
 const root=new THREE.Group();root.name=FLOWER_SHOP.name;group.add(root);const kit=createKit();
 const b=FLOWER_SHOP.bounds,base=GROUND_LAYER.apron;
 kit.box(b.maxX-b.minX,base,b.maxZ-b.minZ,FLOWER_SHOP.x,base/2,FLOWER_SHOP.z,0xcac2a9);
 const solid=(id,x,z,w,d,height,minY=0)=>world.colliders.push({id,x,z,w,d,height,minY,business:FLOWER_SHOP.id});
 // An open pavilion: a cedar back, roof and four visible posts; no invisible shop-sized box.
 kit.box(.14,2.5,3.2,b.maxX-.07,1.25,FLOWER_SHOP.z,0x9a8160);solid('florist-back',b.maxX-.07,FLOWER_SHOP.z,.14,3.2,2.5);
 for(const [x,z] of [[5.95,-18.25],[5.95,-15.35],[9.65,-18.25],[9.65,-15.35]]){kit.box(.12,2.5,.12,x,1.25,z,0x61745f);solid('florist-post',x,z,.12,.12,2.5);}
 kit.box(4.2,.12,3.35,FLOWER_SHOP.x,2.56,FLOWER_SHOP.z,0x476c58);
 kit.box(.7,.88,1.8,7.5,.44,-16.35,0x8e7150);solid('florist-counter',7.5,-16.35,.7,1.8,.88);
 kit.box(.73,.04,1.85,7.5,.9,-16.35,0xd8cbb0);kit.box(.28,.22,.3,7.5,1.02,-15.85,0x485f4d);
 for(const [x,z,tone] of [[6.35,-17.85,0xe9c969],[8.6,-17.85,0xcb748f],[6.35,-15.7,0xe7debf]]){
  kit.cyl(.22,.17,.43,x,.215,z,0x667a6d,{segments:9});solid('flower-bucket',x,z,.45,.45,.92);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,sx=x+Math.cos(a)*.11,sz=z+Math.sin(a)*.11;kit.cyl(.012,.012,.52,sx,.61,sz,0x547545,{segments:5});kit.sphere(.09,sx,.9+(i%2)*.07,sz,tone,{detail:0});}
 }
 kit.sign(poster({title:'雨花生花店',lines:['RAINFLOWER FLORIST','Mrs Kinjō · 09:00–18:00','Bouquets ¥250'],band:'#376a51',bg:'#efe7ce'}),2.5,.68,5.79,2.18,-16.8,{ry:-Math.PI/2,name:'Rainflower Florist park sign'});
 kit.finish(root,'Rainflower flower counter');
 let minutes=720;
 const buy=()=>flowerShopOpen(minutes)?onAction?.('buy','Rainflower bouquet',{cost:250,item:'Rainflower bouquet',text:'Mrs Kinjō wraps island-grown stems in brown paper at her Harbour Park counter. A little colour for a home, a dinner table or someone you care about.'}):onAction?.('read','Rainflower is closed','Mrs Kinjō serves flowers from 09:00 to 18:00. The flowers stay on display at the park entrance.');
 const anchor=(x,z,label,fn)=>{const a=new THREE.Object3D();a.position.set(x,1,z);a.userData.placeId=FLOWER_SHOP.id;root.add(a);register?.(a,label,fn);return a;};
 // Every purchase prompt shares the same clock-aware callback, including the street-facing one.
 anchor(5.0,-16.7,'Buy a Rainflower bouquet · ¥250',buy);
 anchor(6.45,-16.65,'Order flowers from Mrs Kinjō',buy);
 anchor(5.05,-17.7,'Browse Rainflower flowers',()=>onAction?.('read','Rainflower Florist','Fresh stems, potted greenery and hand-made wreaths from Mrs Kinjō. Her counter is beside Harbour Park and Nakamura’s dessert shop. She supplies flowers to Sakura, the izakaya, town office, school and Umi-no-yu. Open 09:00–18:00.'));
 const [x,z]=FLOWER_SHOP.approach;
 const landmark={id:FLOWER_SHOP.id,title:FLOWER_SHOP.name,owner:FLOWER_SHOP.owner,parentId:'harbour-park',sub:'HARBOUR PARK · FLOWERS',x,z,exitPosition:[x,0,z],entryFacing:Math.PI/2,line:'Mrs Kinjō’s flower counter at the park entrance · 09:00–18:00.'};
 if(!(world.landmarks??=[]).some(s=>s.id===landmark.id))world.landmarks.push(landmark);
 return {root,landmark,update(value){if(Number.isFinite(value))minutes=value;},isOpen(){return flowerShopOpen(minutes);}};
}
