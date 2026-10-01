import {GROCERY_ITEMS} from './catalogue.js';

export const SHOP_STOCK=Object.freeze([...GROCERY_ITEMS.map(item=>({...item,capacity:12,unitCost:Math.ceil(item.cost*55/100)})),{id:'bun',name:'Steamed pork bun',cost:150,unitCost:80,capacity:12}].map(Object.freeze));
export const stockSpec=id=>SHOP_STOCK.find(item=>item.id===id);
const count=(n,max,fallback=0)=>Number.isSafeInteger(n)&&n>=0?Math.min(n,max):fallback;
export function restoreShopStock(saved){return Object.fromEntries(SHOP_STOCK.map(item=>[item.id,{shelf:count(saved?.[item.id]?.shelf,item.capacity,saved?.[item.id]?0:item.capacity),reserve:count(saved?.[item.id]?.reserve,60,saved?.[item.id]?0:item.capacity*2)}]));}
export function shelfCount(state,id){return state.sakura.stock[id]?.shelf||0;}
export function takeShopStock(state,id){
 const stock=state.sakura.stock[id],spec=stockSpec(id);if(!stock?.shelf||!spec)return null;
 const slot=--stock.shelf;return {item:id,slot,unitCost:spec.unitCost};
}
export function returnShopStock(state,claim){
 if(!claim)return;const spec=stockSpec(claim.item),stock=state.sakura.stock[claim.item];if(!spec||!stock)return;
 if(stock.shelf<spec.capacity)stock.shelf++;else stock.reserve++;
}
export function restockItem(state,id,quantity){
 const stock=state.sakura.stock[id],spec=stockSpec(id);if(!stock||!spec||state.sakura.caveCartons?.includes(id))return 0;
 const moved=Math.min(Math.max(0,Math.floor(quantity)),stock.reserve,spec.capacity-stock.shelf);stock.reserve-=moved;stock.shelf+=moved;return moved;
}
export function depletedShelf(state){return SHOP_STOCK.find(item=>{const stock=state.sakura.stock[item.id];return !state.sakura.caveCartons?.includes(item.id)&&stock.reserve>0&&stock.shelf<item.capacity;});}
// Closing work belongs to the trading day that just ended, including work saved
// after midnight. Never replenish shelves during the 09:00–20:00 trading hours.
export function closingDay(minutes){const day=Math.floor(minutes/1440),m=((minutes%1440)+1440)%1440;return m>=1200?day:m<540?day-1:null;}
// Thuan starts making the next stock run visible shortly before closing, but
// shelves remain untouched until the trading day has ended.
export function closingPreparationOpen(minutes){const m=((minutes%1440)+1440)%1440;return m>=1170&&m<1200;}
export function closingStockPending(state,minutes){const day=closingDay(minutes);return day!==null&&day>=0&&(state?.sakura?.restockedDay??-1)<day;}
export function closingPreparationPending(state,minutes){const day=Math.floor(minutes/1440);return closingPreparationOpen(minutes)&&day>=0&&(state?.sakura?.restockedDay??-1)<day;}
export const SOLD_OUT='Sorry, we’ve sold out. Please come back tomorrow.';

const STORAGE_WON_KEY='johansson-town:storage-won';
/** Thuan's Storage cartons, as the Sakura goods they restock (thuans-storage/src/stockroom.js). */
export const STORAGE_GOODS=Object.freeze({tea:'tea',coffee:'coffee',onigiri:'rice',biscuits:'biscuit',soap:'soap',notebooks:'notebook',postcards:'postcard',batteries:'battery'});

/** True when any shelf can take units from its reserve. */
export function shelvesNeedRestock(state){
 return SHOP_STOCK.some(item=>{const stock=state?.sakura?.stock?.[item.id];return !!stock&&!state.sakura.caveCartons?.includes(item.id)&&stock.reserve>0&&stock.shelf<item.capacity;});
}

/**
 * Fill every shelf from its reserve and, when a closing restock is pending,
 * mark that trading day complete. Safe to call twice: a second pass moves
 * nothing and leaves restockedDay unchanged.
 */
export function applyStorageRestock(state,minutes,{lost=[]}={}){
 if(!state?.sakura?.stock)return {moved:0,dayMarked:false,short:[]};
 // What Bizarro Minato carried down the hole in the stockroom stays off the shelf until the next run.
 const shop=state.sakura;
 const stolen=new Set(lost.map(id=>STORAGE_GOODS[id]).filter(Boolean));
 shop.caveCartons??=[];shop.caveCartonUnits??={};
 for(const id of stolen){
  if(shop.caveCartons.includes(id))continue;
  const stock=shop.stock[id],spec=stockSpec(id);if(!stock||!spec)continue;
  // One carton is one shelf's capacity. Keep remaining units in reserve while
  // this product waits for its missing carton, rather than deleting extra goods.
  const total=stock.shelf+stock.reserve,units=Math.min(spec.capacity,total);
  stock.shelf=0;stock.reserve=total-units;
  shop.caveCartons.push(id);shop.caveCartonUnits[id]=units;
  if(Array.isArray(shop.journal))shop.journal.push({minute:minutes|0,kind:'Lost',item:spec.name,buyer:'Bizarro Minato',quantity:units,revenue:0,cost:0,profit:0,cash:shop.cash|0});
 }
 const skip=new Set(shop.caveCartons),short=[];
 let moved=0;
 for(const item of SHOP_STOCK){
  if(skip.has(item.id)){
   short.push(item.name);
   continue;
  }
  const count=restockItem(state,item.id,item.capacity);
  if(count){
   moved+=count;
   const shop=state.sakura;
   if(Array.isArray(shop.journal)){
    shop.journal.push({minute:minutes|0,kind:'Restocked',item:item.name,buyer:'Thuan',quantity:count,revenue:0,cost:0,profit:0,cash:shop.cash|0});
    shop.journal=shop.journal.slice(-400);
   }
  }
 }
 const day=closingDay(minutes);
 let dayMarked=false;
 if(day!==null&&day>=0&&(state.sakura.restockedDay??-1)<day){
  state.sakura.restockedDay=day;dayMarked=true;
 }
 return {moved,dayMarked,short};
}

/** Read and clear the storage-won handshake written by thuans-storage. */
export function consumeStorageWonHandshake(expectedPlayer=null){
 let raw=null;
 try{raw=localStorage.getItem(STORAGE_WON_KEY);}catch{return null;}
 if(!raw)return null;
 try{
  const payload=JSON.parse(raw);
  if(expectedPlayer&&payload?.player&&payload.player!==expectedPlayer)return null;
  try{localStorage.removeItem(STORAGE_WON_KEY);}catch{return null;}
  if(!payload||typeof payload!=='object')return null;
  return {
   day:Number.isSafeInteger(payload.day)&&payload.day>=0?payload.day:null,
   player:typeof payload.player==='string'?payload.player:null,
   assisted:payload.assisted===true,
   lost:Array.isArray(payload.lost)?payload.lost.filter(id=>typeof id==='string'&&Object.hasOwn(STORAGE_GOODS,id)):[],
   shooed:Number.isSafeInteger(payload.shooed)&&payload.shooed>0?Math.min(payload.shooed,3):0,
   // Cave coins: ¥50 a shooed visitor, never more than the visitors could have dropped.
   yen:Number.isSafeInteger(payload.yen)&&payload.yen>0?Math.min(payload.yen,50*(Number.isSafeInteger(payload.shooed)?Math.max(0,Math.min(payload.shooed,3)):0)):0,
   t:Number.isFinite(payload.t)?payload.t:Date.now(),
  };
 }catch{return null;}
}

export {STORAGE_WON_KEY};

/** Apply one nightly result once, including replays after reload/back navigation. */
export function applyStorageOutcome(state,minutes,outcome){
 const shop=state?.sakura;if(!shop)return {applied:false,short:[],yen:0};
 const day=outcome.day;
 if(Number.isSafeInteger(day)&&day<=(shop.storageRewardDay??-1))return {applied:false,short:[],yen:0};
 const result=applyStorageRestock(state,minutes,{lost:outcome.lost||[]});
 const shooed=Math.max(0,Math.min(3,Number.isSafeInteger(outcome.shooed)?outcome.shooed:0));
 const yen=Math.min(shooed*50,Number.isSafeInteger(outcome.yen)?Math.max(0,outcome.yen):0);
 state.yen=(state.yen||0)+yen;
 if(Number.isSafeInteger(day))shop.storageRewardDay=day;
 return {...result,applied:true,yen};
}
/** A recovered carton transfers its actual units once; other shelves are untouched. */
export function recoverStorageCarton(state,id){
 const shop=state?.sakura,stock=shop?.stock?.[id],spec=stockSpec(id);
 if(!stock||!spec||!shop.caveCartons?.includes(id))return 0;
 const units=shop.caveCartonUnits?.[id]??spec.capacity;
 const shelf=Math.min(units,spec.capacity-stock.shelf);
 stock.shelf+=shelf;stock.reserve+=units-shelf;
 shop.caveCartons=shop.caveCartons.filter(good=>good!==id);
 if(shop.caveCartonUnits)delete shop.caveCartonUnits[id];
 return units;
}
