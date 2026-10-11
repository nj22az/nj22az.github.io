import {PRODUCTS,RETIRED} from './products-data.js';
// What the town's drinks machines sell: a 1997 Okinawan line-up, under the town's own
// placeholder brands. inventoryName is what goes in the bag and stays stable for saved
// games (Green tea and Canned coffee were the first two). `container` decides what is
// left in your pocket when it is finished; `hot` drinks sit behind a red button.
export const VENDING_PRODUCTS=Object.freeze([
  {id:'harbour-tea',brand:'HARBOUR TEA',subtitle:'Green tea',buttonLabel:'Harbour Tea · Green tea · ¥120',mark:'茶',color:'#366451',price:120,inventoryName:'Green tea',container:'can'},
  {id:'dockside-coffee',brand:'DOCKSIDE',subtitle:'Canned coffee',buttonLabel:'Dockside Coffee · ¥120',mark:'珈',color:'#784632',price:120,inventoryName:'Canned coffee',container:'can'},
  {id:'sanpin',brand:'SANPIN',subtitle:'Jasmine tea',mark:'花',color:'#c9a33a',price:120,inventoryName:'Sanpin jasmine tea',container:'can'},
  {id:'shikuwasa',brand:'SHIKUWASA',subtitle:'Citrus soda',mark:'柑',color:'#7bb342',price:120,inventoryName:'Shikuwasa soda',container:'can'},
  {id:'ryukyu-cola',brand:'RYUKYU COLA',subtitle:'Cola',mark:'C',color:'#b3262e',price:120,inventoryName:'Ryukyu cola',container:'can'},
  {id:'corn-soup',brand:'CORN SOUP',subtitle:'Hot · creamy',mark:'温',color:'#e8b030',price:120,inventoryName:'Hot corn soup',container:'can',hot:true},
].map(p=>Object.freeze({...p,label:p.buttonLabel||`${p.brand[0]+p.brand.slice(1).toLowerCase()} · ${p.subtitle}${p.hot?' (hot)':''} · ¥${p.price}`})));
export const VENDING_AD=Object.freeze({brand:'MINATO DRINKS',tagline:'A break at the port',background:'#244b4a',foreground:'#f4e8cb'});

/**
 * Everything you can drink from your bag, and what it leaves you holding: the machines' cans, and Sakura's products
 * that are drinks of their own (`drink` in data/studio/products.json: Sakura's beer), and the drinks of lines retired
 * since, so a can bought before still drinks.
 */
const SHOP_DRINKS=[...PRODUCTS,...RETIRED].filter(p=>p.drink);
const shopDrink=name=>SHOP_DRINKS.find(p=>p.inventoryName===name);
export const EMPTY_CAN='Empty can';
export const DRINKABLE=Object.freeze(new Set([...VENDING_PRODUCTS.map(p=>p.inventoryName),...SHOP_DRINKS.map(p=>p.inventoryName)]));
export const emptyFor=name=>{const p=VENDING_PRODUCTS.find(x=>x.inventoryName===name)||shopDrink(name)?.drink;return p?.container==='bottle'?'Returnable glass bottle':EMPTY_CAN;};
/** The can's colour in your hand. */
export const canColour=name=>{const p=VENDING_PRODUCTS.find(x=>x.inventoryName===name),own=shopDrink(name);return p?parseInt(p.color.slice(1),16):own?parseInt(own.drink.handColour.slice(1),16):0x91734e;};
/** What Thuan gives back for each empty can in the recycling box by the door. */
export const CAN_REFUND=10;
