/**
 * Sato Ramen: the corner shop on Minato's alley flank, open at lunch while Minato is shut.
 * Mrs Sato cooks it from the east end of Minato's own kitchen line. Coordinates are the
 * room frame of the shared interior (tools/blender/build-minato-interior.py): the shop
 * is x 6.5 to 11.4, its door at the front (+z), its kitchen behind the counter (-z).
 */
export const SATO_RAMEN=Object.freeze({id:'ramen',title:'Sato Ramen',jp:'中華そば さとう',open:660,close:840});
/** 11:00 to 14:00: a lunch counter. */
export const satoRamenOpen=minutes=>{const m=((minutes%1440)+1440)%1440;return m>=SATO_RAMEN.open&&m<SATO_RAMEN.close;};

export const SATO_ROOM=Object.freeze({
 bounds:Object.freeze({minX:6.7,maxX:11.2,minZ:-1.9,maxZ:3.45}),
 spawn:Object.freeze([9.75,0,2.95]),exit:Object.freeze([9.75,1.1,3.45]),yaw:0,
});
/** The five chrome stools at the counter, and the three at the wall ledge. */
export const SATO_COUNTER=Object.freeze([7.2,8.1,9.0,9.9,10.8].map(x=>Object.freeze({position:[x,0,-1.42],height:.76,yaw:0,stand:[x,0,-.72],table:[x,1.11,-2.2]})));
export const SATO_LEDGE=Object.freeze([.3,1.2,2.1].map(z=>Object.freeze({position:[10.65,0,z],height:.735,yaw:-Math.PI/2,stand:[10.0,0,z],table:[11.02,1.08,z]})));
/** Where the lunch regulars sit: every other stool and the ledge, so there is always room at the counter. */
export const SATO_GUEST_SEATS=Object.freeze([SATO_COUNTER[0],SATO_COUNTER[2],SATO_COUNTER[4],...SATO_LEDGE]);
export const SATO_PLAYER_SEATS=Object.freeze([...SATO_COUNTER,...SATO_LEDGE]);
/** Mrs Sato at the stock pots, between the counter and the line. */
export const SATO_COOK=Object.freeze({position:Object.freeze([8.6,0,-4.35]),yaw:0});
export const SATO_COLLIDERS=Object.freeze([
 {x:8.95,z:-2.55,w:4.7,d:.8,height:1.1},     // the counter
 {x:11.2,z:1.2,w:.4,d:2.4,height:1.05},      // the wall ledge
 {x:6.95,z:3.32,w:.75,d:.55,height:1.6},     // the ticket machine by the door
]);
/**
 * What the ticket machine sells, at 1997 lunch prices. `prop` is what arrives on the
 * counter (people/resident-props.js, or the dish props in people/izakaya-beer.js).
 */
export const SATO_MENU=Object.freeze([
 {id:'shoyu',name:'Shoyu ramen',jp:'醤油ラーメン',cost:450,prop:'ramen'},
 {id:'miso',name:'Miso ramen',jp:'味噌ラーメン',cost:500,prop:'ramen'},
 {id:'shio',name:'Shio ramen',jp:'塩ラーメン',cost:450,prop:'ramen'},
 {id:'chashu',name:'Chashu-men',jp:'チャーシュー麺',cost:650,prop:'ramen'},
 {id:'gyoza',name:'Gyoza, six',jp:'餃子',cost:250,prop:'gyoza'},
 {id:'rice',name:'A bowl of rice',jp:'ライス',cost:100,prop:'rice'},
 {id:'beer',name:'Orion, a bottle',jp:'瓶ビール',cost:400,prop:'beer'},
 {id:'tea',name:'Oolong tea',jp:'ウーロン茶',cost:120,prop:'tea'},
].map(item=>Object.freeze(item)));
/**
 * Lunch at Sato Ramen for the people who live and work on the street, in minutes. Each
 * visit is inside the lunch hours; the shift workers take it as their lunch break.
 */
export const SATO_LUNCH=Object.freeze({
 Kenji:Object.freeze([690,735]),Reiko:Object.freeze([725,760]),Aya:Object.freeze([745,790]),
 Tetsuo:Object.freeze([700,745]),'Harbour master':Object.freeze([720,765]),
});
