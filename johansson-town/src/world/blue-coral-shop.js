import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {poster} from './okinawa/signs.js';
import {NAKAMURA_DESSERTS} from './harbour-park-plan.js';
export const BLUE_CORAL=NAKAMURA_DESSERTS;
export const dessertShopOpen=minutes=>{const m=((minutes%1440)+1440)%1440;return m>=BLUE_CORAL.open&&m<BLUE_CORAL.close;};
/** Blue Coral is a menu at Nakamura's existing shop, served by Mrs Nakamura. */
export function buildBlueCoralShop({world,group=world.group,register,onAction}){
 const root=new THREE.Group();root.name='Blue Coral at Nakamura';group.add(root);const kit=createKit();
 // The shop-house builder owns its ice display and physical counter; this is one fascia menu.
 kit.sign(poster({title:'BLUE CORAL',lines:['at Nakamura’s','Island scoops ¥150','Tea ¥120 · soda ¥100','10:00–19:00'],band:'#376f87',bg:'#f2ebd6'}),1.55,1.0,5.64,2.2,-9.55,{ry:-Math.PI/2,name:'Nakamura Blue Coral menu'});
 kit.finish(root,'Nakamura dessert menu');
 let minutes=720;
 const sell=(title,cost,item,text)=>()=>dessertShopOpen(minutes)?onAction?.('buy',title,{cost,item,text}):onAction?.('read','Nakamura is closed','Mrs Nakamura serves zenzai and Blue Coral ice cream here from 10:00 to 19:00. Her family lives upstairs.');
 const anchor=(z,label,fn)=>{const a=new THREE.Object3D();a.position.set(4.45,1.1,z);a.userData.placeId='nakamura';root.add(a);register?.(a,label,fn);};
 anchor(-8.7,'Buy Blue Coral island ice cream · ¥150',sell('Blue Coral island ice cream',150,'Blue Coral ice cream','A freshly scooped cone: ube and island vanilla. Mrs Nakamura serves Blue Coral beside her zenzai counter, at the edge of Harbour Park.'));
 anchor(-7.85,'Buy Blue Coral island tea · ¥120',sell('Blue Coral island tea',120,'Green tea','A chilled bottle of island tea from Nakamura’s shared dessert counter.'));
 anchor(-11.9,'Buy a cold island soda · ¥100',sell('Cold island soda',100,'Cold island soda','A cold bottle of island soda from Nakamura’s shared ice case.'));
 const [x,z]=BLUE_CORAL.approach,landmark={id:'nakamura',title:BLUE_CORAL.name,owner:BLUE_CORAL.owner,aliases:['blue-coral','zenzai'],sub:'MAIN STREET · DESSERTS',x,z,exitPosition:[x,0,z],entryFacing:Math.PI/2,line:'One counter for zenzai, sata andagi and Blue Coral island ice cream · Mrs Nakamura · 10:00–19:00.'};
 if(!(world.landmarks??=[]).some(s=>s.id===landmark.id))world.landmarks.push(landmark);
 return {root,landmark,merged:true,update(value){if(Number.isFinite(value))minutes=value;},isOpen(){return dessertShopOpen(minutes);}};
}
