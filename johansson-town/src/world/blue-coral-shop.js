import * as THREE from '../../vendor/three.module.js';
import {nakamuraFrontage} from './okinawa/nakamura-dressing.js';
import {NAKAMURA_HOME_DOOR} from './nakamura-plan.js';
import {NAKAMURA_DESSERTS} from './harbour-park-plan.js';
export const BLUE_CORAL=NAKAMURA_DESSERTS;
/** What Mrs Nakamura sells, at what price: the order menu, and the wooden tags on her back wall (nakamura-dressing.js). */
export const NAKAMURA_MENU=Object.freeze([
 {title:'Zenzai',cost:250,item:'Zenzai',text:'Shaved ice over slow-cooked kintoki beans and white mochi, prepared by Mrs Nakamura.'},
 {title:'Sata andagi',cost:120,item:'Sata andagi',text:'Three freshly fried Okinawan doughnuts in a paper bag.'},
 {title:'Blue Coral island ice cream',cost:150,item:'Blue Coral ice cream',text:'A freshly scooped cone of beni-imo and island vanilla.'},
 {title:'Island tea',cost:120,item:'Green tea',text:'A chilled bottle of island tea.'},
 {title:'Cold island soda',cost:100,item:'Cold island soda',text:'A cold bottle from Nakamura’s ice case.'}
].map(Object.freeze));
export const dessertShopOpen=minutes=>{const m=((minutes%1440)+1440)%1440;return m>=BLUE_CORAL.open&&m<BLUE_CORAL.close;};
/** Blue Coral is a menu at Nakamura's existing shop, served by Mrs Nakamura. */
export function buildBlueCoralShop({world,group=world.group,register,onAction,shadows=false}){
 const root=new THREE.Group();root.name='Blue Coral at Nakamura';group.add(root);
 // The menu tags on the counter's back wall, the cider tin and the family's nameplate (one lettering sheet), and what
 // follows the hours: the noren, the lanterns' glow and the bench's parasol (nakamura-dressing.js NAKAMURA_OPEN_SIGNS).
 const frontage=nakamuraFrontage({menu:NAKAMURA_MENU,hours:BLUE_CORAL,shadows});root.add(frontage.group,frontage.world);
 (world.colliders??=[]).push(frontage.canopy);
 let minutes=720;frontage.update(minutes,dessertShopOpen(minutes));
 const anchor=(x,z,label,fn,place='nakamura')=>{const a=new THREE.Object3D();a.position.set(x,1.1,z);a.userData.placeId=place;root.add(a);register?.(a,label,fn);};
 anchor(5.1,-12.4,'Order at Nakamura · zenzai & ice cream',()=>dessertShopOpen(minutes)?onAction?.('dessert-menu','Nakamura · zenzai & Blue Coral',NAKAMURA_MENU.map(p=>({...p}))):onAction?.('read','Nakamura is closed','Open 10:00–19:00. Mrs Nakamura and Mai live upstairs; the separate family door is beside the counter.'));
 const [hx,,hz]=NAKAMURA_HOME_DOOR;
 anchor(hx-.25,hz,'Read the Nakamura family nameplate',()=>onAction?.('read','Nakamura family · upstairs','Mrs Nakamura and Mai live above the shop. The separate front door leads to their private stairwell. Mrs Nakamura closes the counter at 19:00 and walks upstairs.'),'home-nakamura');
 const home={id:'home-nakamura',title:'Nakamura family · upstairs',sub:'MAIN STREET · FAMILY HOME',homeId:'nakamura',isResidence:true,residents:['Mrs Nakamura','Mai'],x:hx,z:hz,exitPosition:[hx,0,hz],entryFacing:Math.PI/2,line:'Separate family entrance beside Nakamura’s dessert counter; stairs to the flat upstairs.'};
 if(!(world.landmarks??=[]).some(s=>s.id===home.id))world.landmarks.push(home);
 const [x,z]=BLUE_CORAL.approach,landmark={id:'nakamura',title:BLUE_CORAL.name,owner:BLUE_CORAL.owner,aliases:['blue-coral','zenzai'],sub:'MAIN STREET · DESSERTS',x,z,exitPosition:[x,0,z],entryFacing:Math.PI/2,line:'One counter for zenzai, sata andagi and Blue Coral island ice cream · Mrs Nakamura · 10:00–19:00.'};
 if(!(world.landmarks??=[]).some(s=>s.id===landmark.id))world.landmarks.push(landmark);
 return {root,landmark,merged:true,update(value){if(Number.isFinite(value))minutes=value;frontage.update(minutes,dessertShopOpen(minutes));},frontage,isOpen(){return dessertShopOpen(minutes);}};
}
