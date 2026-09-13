import {SHOP_STOCK,restoreShopStock,takeShopStock,closingStockPending,SOLD_OUT} from './shop-stock.js';
import {GROCERY_ITEMS} from './catalogue.js';
import {WORKSHOP_MODELS} from '../workshop/catalogue.js';

export const TOWN_FINDS=Object.freeze([
 {id:'bottle',name:'Returnable glass bottle',price:30},
 {id:'cans',name:'Bundle of empty cans',price:40},
 {id:'scrap',name:'Salvaged metal parts',price:70},
].map(Object.freeze));
const money=n=>Number.isSafeInteger(n)&&n>=0?Math.min(n,999999):0;
export function restoreSakura(saved){
 const rows=Array.isArray(saved?.journal)?saved.journal.filter(r=>r&&Number.isFinite(r.minute)&&typeof r.kind==='string'&&typeof r.item==='string'&&[r.quantity,r.revenue,r.cost,r.cash].every(n=>Number.isSafeInteger(n)&&n>=0)).slice(-400).map(r=>({...r,buyer:String(r.buyer||'').slice(0,80),item:r.item.slice(0,120),profit:Number.isSafeInteger(r.profit)?r.profit:0})):[];
 return {restockedDay:Number.isSafeInteger(saved?.restockedDay)?saved.restockedDay:-1,playerClaim:saved?.playerClaim&&['bun','rice','tea'].includes(saved.playerClaim.item)?{item:saved.playerClaim.item}:null,cash:money(saved?.cash),sales:money(saved?.sales),bought:money(saved?.bought),profit:Number.isSafeInteger(saved?.profit)?saved.profit:0,stockSpent:money(saved?.stockSpent),openingSales:money(saved?.openingSales??(saved?.journal?saved?.openingSales:saved?.sales)),receipts:Array.isArray(saved?.receipts)?saved.receipts.filter(s=>typeof s==='string').slice(-128):[],stock:restoreShopStock(saved?.stock),journal:rows,deliveries:Array.isArray(saved?.deliveries)?saved.deliveries.filter(d=>SHOP_STOCK.some(i=>i.id===d.item)&&Number.isFinite(d.due)&&Number.isSafeInteger(d.quantity)&&d.quantity>0&&d.quantity<=12).map(d=>({...d})):[],nextDelivery:Number.isFinite(saved?.nextDelivery)?saved.nextDelivery:0};
}
const till=state=>state.sakura??=restoreSakura();
export function shopEntry(state,{minute=state.minutes||0,kind,item,buyer='',quantity=1,revenue=0,cost=0,profit=0}){
 const shop=till(state);shop.journal.push({minute,kind,item,buyer,quantity,revenue,cost,profit,cash:shop.cash});shop.journal=shop.journal.slice(-400);
}
export function recordSakuraSale(state,cost,receipt=null,details={}){
 if(!Number.isSafeInteger(cost)||cost<=0)return false;
 const shop=till(state);if(receipt&&shop.receipts.includes(receipt))return false;
 const goodsCost=money(details.unitCost),profit=cost-goodsCost;
 shop.cash=Math.min(999999,shop.cash+cost);shop.sales=Math.min(999999,shop.sales+cost);shop.profit+=profit;
 if(receipt){shop.receipts.push(receipt);shop.receipts=shop.receipts.slice(-128);}
 shopEntry(state,{minute:details.minute??state.minutes??0,kind:'Sale',item:details.item||'Counter sale',buyer:details.buyer||'Customer',quantity:1,revenue:cost,cost:goodsCost,profit});return true;
}
export function buySakuraItem(state,item,minutes){
 const m=((minutes%1440)+1440)%1440;
 if(m<540||m>=1200)return {ok:false,message:'The till is closed. Thuan returns at 09:00.'};
 if(state.inventory.length>=100)return {ok:false,message:'Your bag is full.'};
 if(state.yen<item.cost)return {ok:false,message:'You do not have enough yen.'};
 const claim=takeShopStock(state,item.id);if(!claim)return {ok:false,message:'Thuan: '+SOLD_OUT};
 state.yen-=item.cost;state.inventory.push(item.name);recordSakuraSale(state,item.cost,null,{minute:minutes,item:item.name,buyer:'Johansson',unitCost:claim.unitCost});return {ok:true};
}
export function advanceDeliveries(state,minutes){
 const shop=till(state);
 for(const delivery of [...shop.deliveries])if(minutes>=delivery.due){
  shop.stock[delivery.item].reserve+=delivery.quantity;shop.deliveries.splice(shop.deliveries.indexOf(delivery),1);
  shopEntry(state,{minute:minutes,kind:'Delivery',item:SHOP_STOCK.find(i=>i.id===delivery.item).name,buyer:'Wholesaler',quantity:delivery.quantity});
 }
 const m=((minutes%1440)+1440)%1440;if((m<510||m>=1200)&&!closingStockPending(state,minutes)||minutes<shop.nextDelivery)return;
 const item=SHOP_STOCK.find(i=>shop.stock[i.id].shelf+shop.stock[i.id].reserve<i.capacity&&!shop.deliveries.some(d=>d.item===i.id)&&shop.cash>=i.unitCost);
 if(!item)return;
 const quantity=Math.min(item.capacity*2,Math.floor(shop.cash/item.unitCost)),cost=quantity*item.unitCost;
 shop.cash-=cost;shop.stockSpent+=cost;shop.deliveries.push({item:item.id,quantity,due:minutes+30});shop.nextDelivery=minutes+8;
 shopEntry(state,{minute:minutes,kind:'Stock purchase',item:item.name,buyer:'Wholesaler',quantity,cost});
}
export function sakuraOffer(name){
 const model=WORKSHOP_MODELS.find(m=>m.name===name);if(model)return {name,price:model.price,model};
 const found=TOWN_FINDS.find(m=>m.name===name);if(found)return found;
 const stocked=GROCERY_ITEMS.find(m=>m.name===name);if(stocked)return {name,price:Math.floor(stocked.cost*.4)};
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
export function sellToSakura(state,name,minutes=state.minutes||0){
 const problem=saleProblem(state,name);if(problem)return {ok:false,message:problem};
 const offer=sakuraOffer(name),shop=till(state);state.inventory.splice(state.inventory.indexOf(name),1);state.yen+=offer.price;shop.cash-=offer.price;shop.bought=Math.min(999999,shop.bought+offer.price);shopEntry(state,{minute:minutes,kind:'Bought from player',item:name,buyer:'Johansson',quantity:1,cost:offer.price});return {ok:true,...offer};
}
export const sakuraStock=state=>[...new Set(state.inventory)].map(sakuraOffer).filter(Boolean);
