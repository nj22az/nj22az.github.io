import {SHARED_DINING_BOUNDS,SHARED_DINING_FLOOR,SHARED_DINING_COLLIDERS} from './interiors/shared-dining-layout.js';
/**
 * Sato Ramen: the corner shop on Minato's alley flank, open at lunch while Minato is shut.
 * Mrs Sato cooks it from the east end of Minato's own kitchen line. Coordinates are the
 * room frame of the shared interior (tools/blender/build-minato-interior.py): the shop
 * is x 6.5 to 11.4, its door at the front (+z), its kitchen behind the counter (-z).
 */
export const SATO_RAMEN=Object.freeze({id:'ramen',title:'Sato Ramen',jp:"らーめん佐藤",open:660,close:840});
/** 11:00 to 14:00: a lunch counter. */
export const satoRamenOpen=minutes=>{const m=((minutes%1440)+1440)%1440;return m>=SATO_RAMEN.open&&m<SATO_RAMEN.close;};

export const SATO_ROOM=Object.freeze({
 bounds:SHARED_DINING_BOUNDS,floorPolygon:SHARED_DINING_FLOOR,
 spawn:Object.freeze([9.75,0,2.95]),exit:Object.freeze([9.75,1.1,3.45]),yaw:0,
});
/** The five chrome stools at the counter, and the three at the wall ledge. */
export const SATO_COUNTER=Object.freeze([7.1,7.8,8.5,9.2,9.9].map(x=>Object.freeze({position:[x,0,-1.42],height:.76,surfaceY:.76,yaw:0,stand:[x,0,-.72],table:[x,1.11,-2.2]})));
export const SATO_LEDGE=Object.freeze([.3,1.2,2.1].map(z=>Object.freeze({position:[10.65,0,z],height:.735,surfaceY:.735,yaw:-Math.PI/2,stand:[10.0,0,z],table:[11.02,1.08,z]})));
export const SATO_CORNER=Object.freeze([.35,1.95].map(z=>Object.freeze({position:[7.65,0,z],height:.495,surfaceY:.495,yaw:z<1?Math.PI:0,stand:[8.65,0,z],table:[7.65,.80,z<1?.85:1.45]})));
/**
 * Where the lunch regulars sit: every other stool first, so there is room for you, then
 * one more stool, and the ledge last -- Mrs Sato serves the counter across it.
 */
export const SATO_GUEST_SEATS=Object.freeze([SATO_COUNTER[0],SATO_COUNTER[2],SATO_COUNTER[4],SATO_COUNTER[1],...SATO_LEDGE]);
export const SATO_COOK=Object.freeze({position:Object.freeze([8.6,0,-4.35]),yaw:0});
/**
 * Where she works, on the floor of the kitchen aisle (z -5.2 to -3.6): the prep board,
 * the noodle boiler, the stock pots and the topping tray along the back line (facing it,
 * yaw 0), the coffee urn and barley-tea jug on the back counter, and the pass, where a
 * bowl goes over the counter to a stool (facing the room, yaw π).
 */
export const SATO_KITCHEN=Object.freeze({
 prep:Object.freeze([6.95,-4.95]),boiler:Object.freeze([7.7,-4.95]),pots:Object.freeze([8.6,-4.95]),toppings:Object.freeze([9.8,-4.95]),
 drinks:Object.freeze([10.7,-3.72]),aisleZ:-4.35,passZ:-3.72,minX:6.9,maxX:10.9,
});
export const SATO_COLLIDERS=Object.freeze(SHARED_DINING_COLLIDERS);
/**
 * What the ticket machine sells, at 1997 lunch prices. `prop` is what arrives on the
 * counter (people/resident-props.js, or the dish props in people/izakaya-beer.js).
 */
export const SATO_MENU=Object.freeze([
 {id:'shoyu',name:'Shoyu ramen',jp:"醤油らーめん",cost:450,prop:'ramen'},
 {id:'miso',name:'Miso ramen',jp:"味噌らーめん",cost:500,prop:'ramen'},
 {id:'shio',name:'Shio ramen',jp:"塩らーめん",cost:450,prop:'ramen'},
 {id:'chashu',name:'Chashu-men',jp:"チャーシュー麺",cost:650,prop:'ramen'},
 {id:'gyoza',name:'Gyoza, six',jp:"餃子",cost:250,prop:'gyoza'},
 {id:'rice',name:'A bowl of rice',jp:"ご飯",cost:100,prop:'rice'},
 {id:'beer',name:'Orion, a bottle',jp:"瓶ビール",cost:400,prop:'beer'},
 {id:'tea',name:'Oolong tea',jp:"烏龍茶",cost:120,prop:'tea'},
 {id:'mugicha',name:'Cold barley tea',jp:"冷たい麦茶",cost:100,prop:'mugicha'},
 {id:'coffee',name:'Hot coffee',jp:"珈琲",cost:200,prop:'coffee'},
].map(item=>Object.freeze(item)));
/**
 * Lunch at Sato Ramen for the people who live and work on the street, in minutes. Each
 * visit is inside the lunch hours; the shift workers take it as their lunch break.
 */
export const SATO_LUNCH=Object.freeze({
 Thuan:Object.freeze([780,830]),Chin:Object.freeze([690,735]),Reiko:Object.freeze([725,760]),Nhung:Object.freeze([745,790]),
 Tetsuo:Object.freeze([700,745]),'Harbour master':Object.freeze([720,765]),
});
/** What each regular drinks with lunch: a hot coffee or a glass of cold barley tea. */
export const SATO_LUNCH_DRINK=Object.freeze({Thuan:'mugicha',Chin:'mugicha',Reiko:'coffee',Nhung:'mugicha',Tetsuo:'coffee','Harbour master':'coffee'});
