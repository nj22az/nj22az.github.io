import {GROCERY_ITEMS} from './catalogue.js';
import {takeShopStock,returnShopStock,SOLD_OUT} from './shop-stock.js';
import {recordSakuraSale,shopEntry} from './sakura-economy.js';

/**
 * The counter ritual at Sakura Shōten.
 *
 * Buying used to be one button on a shelf: tap, money gone, item in bag. A konbini does
 * not work like that. You pick things up, you carry them to the counter, and the clerk
 * rings them through — asking whether to warm anything, whether you want a bag, whether
 * you have your card. That exchange is the thing worth having, so it is what this is.
 *
 * The shape of the ritual is borrowed from Yorimichi by emaxsaun (MIT), and adapted to
 * 1988. Its IC card and QR payments have no place here: Suica is thirteen years away, so
 * the counter takes cash and counts out change. Carrier bags were free in Japan until
 * 2020, so Thuan asks about a bag but never charges for one, and the point card is the
 * paper stamp card a 1988 shop would actually have kept under the till.
 *
 * @typedef {object} BasketLine
 * @property {string} id
 * @property {string} name
 * @property {string} jp
 * @property {number} cost   unit price in yen
 * @property {number} count
 * @typedef {object} Receipt
 * @property {number} minute
 * @property {BasketLine[]} lines
 * @property {number} total
 * @property {number} tendered
 * @property {number} change
 * @property {string[]} warmed
 * @property {boolean} bag
 * @property {number} stampsEarned
 * @property {number} stampsAfter
 * @property {string|null} gift  item given for a completed card
 */

const BY_ID=new Map(GROCERY_ITEMS.map(item=>[item.id,item]));

/** Things a konbini microwave would take. Thuan only offers when one is in the basket. */
export const WARMABLE=Object.freeze(['rice','noodles','curry','bread','soup']);
/** One stamp per this much spent, rounded down over the whole visit. */
export const STAMP_PER_YEN=300;
export const CARD_STAMPS=10;
/** What a filled card is worth: she puts one of these on the counter and says nothing. */
export const CARD_GIFT='tea';
const BASKET_LIMIT=12;
/** Notes and coins a 1988 wallet would actually hand over. */
const DENOMINATIONS=[500,1000,5000,10000];

export const konbiniItem=id=>BY_ID.get(id)||null;

export function defaultKonbini(){
 return {basket:[],stamps:0,cards:0,tried:[],visits:0,ownBag:false,lastReceipt:null};
}

/** Only known shapes survive a load; a hand-edited save cannot mint stamps or items. */
export function restoreKonbini(saved){
 const state=defaultKonbini();
 if(!saved||typeof saved!=='object'||Array.isArray(saved))return state;
 if(Array.isArray(saved.basket))state.basket=saved.basket.filter(id=>BY_ID.has(id)).slice(0,BASKET_LIMIT);
 if(Array.isArray(saved.tried))state.tried=[...new Set(saved.tried.filter(id=>BY_ID.has(id)))].slice(0,200);
 for(const key of ['stamps','cards','visits']){
  const value=saved[key];
  if(Number.isFinite(value))state[key]=Math.max(0,Math.min(9999,Math.trunc(value)));
 }
 state.stamps=Math.min(state.stamps,CARD_STAMPS-1);   // a full card is redeemed, never stored full
 state.ownBag=saved.ownBag===true;
 return state;
}

const shelf=(state,id)=>state.sakura?.stock?.[id]?.shelf||0;

/**
 * @returns {{ok:boolean,message:string}}
 */
export function addToBasket(state,item){
 const spec=typeof item==='string'?BY_ID.get(item):item&&BY_ID.get(item.id);
 if(!spec)return {ok:false,message:'Sakura does not carry that.'};
 const konbini=state.konbini;
 if(konbini.basket.length>=BASKET_LIMIT)return {ok:false,message:'The basket is full. Take it to the counter.'};
 const held=konbini.basket.filter(id=>id===spec.id).length;
 if(held>=shelf(state,spec.id))return {ok:false,message:'Thuan: '+SOLD_OUT};
 konbini.basket.push(spec.id);
 return {ok:true,message:spec.name+' is in your basket.'};
}

export function removeFromBasket(state,id){
 const index=state.konbini.basket.indexOf(id);
 if(index<0)return false;
 state.konbini.basket.splice(index,1);
 return true;
}

export function clearBasket(state){state.konbini.basket.length=0;}

/** The basket grouped for a counter display, in the order things were picked up. */
export function basketLines(state){
 /** @type {BasketLine[]} */
 const lines=[];
 for(const id of state.konbini.basket){
  const spec=BY_ID.get(id);if(!spec)continue;
  const line=lines.find(l=>l.id===id);
  if(line)line.count++;
  else lines.push({id,name:spec.name,jp:spec.jp,cost:spec.cost,count:1});
 }
 return lines;
}

export const basketTotal=state=>basketLines(state).reduce((sum,line)=>sum+line.cost*line.count,0);

/** Which items in the basket she would offer to warm. */
export const warmableInBasket=state=>basketLines(state).filter(line=>WARMABLE.includes(line.id));

/** The smallest note that covers the total: what you would actually put on the counter. */
export function tenderFor(total){
 return DENOMINATIONS.find(note=>note>=total)??Math.ceil(total/10000)*10000;
}

/**
 * What the counter would say before anything is paid. Pure: safe to call while the
 * player is still deciding about the bag.
 */
export function checkoutQuote(state,{warm=false,bag=true}={}){
 const lines=basketLines(state),total=basketTotal(state);
 const stampsEarned=Math.floor(total/STAMP_PER_YEN);
 const stampsAfter=state.konbini.stamps+stampsEarned;
 return {
  lines,total,
  tendered:tenderFor(total),
  change:tenderFor(total)-total,
  warmed:warm?warmableInBasket(state).map(line=>line.name):[],
  bag,stampsEarned,
  cardFull:stampsAfter>=CARD_STAMPS,
  stampsAfter:stampsAfter%CARD_STAMPS
 };
}

/**
 * Rings the basket through. Either the whole basket goes, or nothing does: a claim that
 * cannot be met puts every earlier claim back on the shelf.
 * @returns {{ok:true,receipt:Receipt}|{ok:false,message:string}}
 */
export function checkout(state,{warm=false,bag=true}={},minutes=0){
 const konbini=state.konbini;
 const m=((minutes%1440)+1440)%1440;
 const lines=basketLines(state),total=basketTotal(state);
 if(!lines.length)return {ok:false,message:'Your basket is empty.'};
 if(m<540||m>=1200)return {ok:false,message:'The till is closed. Thuan returns at 09:00.'};
 if(state.yen<total)return {ok:false,message:'You do not have enough yen for all of that.'};
 if(state.inventory.length+konbini.basket.length>100)return {ok:false,message:'Your bag is full.'};

 const claims=[];
 for(const id of konbini.basket){
  const claim=takeShopStock(state,id);
  if(!claim){for(const held of claims)returnShopStock(state,held.claim);return {ok:false,message:'Thuan: '+SOLD_OUT};}
  claims.push({id,claim});
 }

 const quote=checkoutQuote(state,{warm,bag});
 state.yen-=total;
 for(const {id,claim} of claims){
  const spec=BY_ID.get(id);
  state.inventory.push(spec.name);
  recordSakuraSale(state,spec.cost,null,{minute:minutes,item:spec.name,buyer:'Johansson',unitCost:claim.unitCost});
  if(!konbini.tried.includes(id))konbini.tried.push(id);
 }

 // A filled card is spent at once: she takes it back and puts a tea on the counter.
 let gift=null;
 const stampsAfter=konbini.stamps+quote.stampsEarned;
 if(stampsAfter>=CARD_STAMPS){
  const giftClaim=takeShopStock(state,CARD_GIFT);
  if(giftClaim){
   const spec=BY_ID.get(CARD_GIFT);
   gift=spec.name;
   state.inventory.push(spec.name);
   if(!konbini.tried.includes(CARD_GIFT))konbini.tried.push(CARD_GIFT);
   // Given away, not sold: it earns nothing and costs the shop what it cost to stock.
   shopEntry(state,{minute:minutes,kind:'Stamp card',item:spec.name,buyer:'Johansson',quantity:1,cost:giftClaim.unitCost});
   state.sakura.profit-=giftClaim.unitCost;
   konbini.cards++;
  }
 }

 konbini.stamps=stampsAfter%CARD_STAMPS;
 konbini.visits++;
 konbini.ownBag=!bag;
 /** @type {Receipt} */
 const receipt={
  minute:m,lines,total,
  tendered:quote.tendered,change:quote.change,
  warmed:quote.warmed,bag,
  stampsEarned:quote.stampsEarned,stampsAfter:konbini.stamps,gift
 };
 konbini.lastReceipt=receipt;
 clearBasket(state);
 return {ok:true,receipt};
}

/** The receipt as Thuan's till would print it. */
export function receiptText(receipt){
 if(!receipt)return '';
 const yen=n=>'¥'+n.toLocaleString('en-GB');
 const clock=String(Math.floor(receipt.minute/60)).padStart(2,'0')+':'+String(receipt.minute%60).padStart(2,'0');
 const rows=receipt.lines.map(line=>
  `${line.jp} ${line.name}${line.count>1?' ×'+line.count:''}   ${yen(line.cost*line.count)}`);
 const tail=[
  '',
  `合計 TOTAL        ${yen(receipt.total)}`,
  `お預り  CASH      ${yen(receipt.tendered)}`,
  `おつり  CHANGE    ${yen(receipt.change)}`
 ];
 if(receipt.warmed.length)tail.push('',`温め済 WARMED · ${receipt.warmed.join(', ')}`);
 if(!receipt.bag)tail.push('袋辞退 · own bag');
 if(receipt.stampsEarned)tail.push('',`スタンプ +${receipt.stampsEarned} (${receipt.stampsAfter}/${CARD_STAMPS})`);
 if(receipt.gift)tail.push(`カード満了 · ${receipt.gift}, on the house`);
 return ['桜商店 SAKURA SHŌTEN',`昭和63年 ${clock}`,'','—————————————',...rows,...tail,'','ありがとうございました'].join('\n');
}
