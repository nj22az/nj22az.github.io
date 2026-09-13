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
 const stock=state.sakura.stock[id],spec=stockSpec(id);if(!stock||!spec)return 0;
 const moved=Math.min(Math.max(0,Math.floor(quantity)),stock.reserve,spec.capacity-stock.shelf);stock.reserve-=moved;stock.shelf+=moved;return moved;
}
export function depletedShelf(state){return SHOP_STOCK.find(item=>{const stock=state.sakura.stock[item.id];return stock.reserve>0&&stock.shelf<item.capacity;});}
// Closing work belongs to the trading day that just ended, including work saved
// after midnight. Never replenish shelves during the 09:00–20:00 trading hours.
export function closingDay(minutes){const day=Math.floor(minutes/1440),m=((minutes%1440)+1440)%1440;return m>=1200?day:m<540?day-1:null;}
export function closingStockPending(state,minutes){const day=closingDay(minutes);return day!==null&&day>=0&&(state?.sakura?.restockedDay??-1)<day;}
export const SOLD_OUT='Sorry, we’ve sold out. Please come back tomorrow.';
