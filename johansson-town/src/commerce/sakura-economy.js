import {STORE_ITEMS} from './catalogue.js';
import {WORKSHOP_MODELS} from '../workshop/catalogue.js';

export const TOWN_FINDS=Object.freeze([
 {id:'bottle',name:'Returnable glass bottle',price:30},
 {id:'cans',name:'Bundle of empty cans',price:40},
 {id:'scrap',name:'Salvaged metal parts',price:70},
].map(Object.freeze));
const money=n=>Number.isSafeInteger(n)&&n>=0?Math.min(n,999999):0;
export function restoreSakura(saved){return {cash:money(saved?.cash),sales:money(saved?.sales),bought:money(saved?.bought),receipts:Array.isArray(saved?.receipts)?saved.receipts.filter(s=>typeof s==='string').slice(-128):[]};}
const till=state=>state.sakura??=restoreSakura();
export function recordSakuraSale(state,cost,receipt=null){
 if(!Number.isSafeInteger(cost)||cost<=0)return false;
 const shop=till(state);if(receipt&&shop.receipts.includes(receipt))return false;
 shop.cash=Math.min(999999,shop.cash+cost);shop.sales=Math.min(999999,shop.sales+cost);
 if(receipt){shop.receipts.push(receipt);shop.receipts=shop.receipts.slice(-128);}return true;
}
export function sakuraOffer(name){
 const model=WORKSHOP_MODELS.find(m=>m.name===name);if(model)return {name,price:model.price,model};
 const found=TOWN_FINDS.find(m=>m.name===name);if(found)return found;
 const stocked=STORE_ITEMS.find(m=>m.name===name);if(stocked)return {name,price:Math.floor(stocked.cost*.4)};
 if(name==='Sea bream')return {name,price:120};
 return null;
}
export function saleProblem(state,name){
 const offer=sakuraOffer(name);if(!offer)return 'Thuan keeps personal papers and quest items out of the shop.';
 if(!state.inventory.includes(name))return 'That item is no longer in your bag.';
 if(till(state).cash<offer.price)return 'I have ¥'+till(state).cash+' available. A few more shop sales will let me buy this for ¥'+offer.price+'.';
 if(state.yen+offer.price>999999)return 'Your wallet is full. Keep the item until there is room for the payment.';
 return null;
}
export function sellToSakura(state,name){
 const problem=saleProblem(state,name);if(problem)return {ok:false,message:problem};
 const offer=sakuraOffer(name),shop=till(state);state.inventory.splice(state.inventory.indexOf(name),1);state.yen+=offer.price;shop.cash-=offer.price;shop.bought=Math.min(999999,shop.bought+offer.price);return {ok:true,...offer};
}
export const sakuraStock=state=>[...new Set(state.inventory)].map(sakuraOffer).filter(Boolean);
