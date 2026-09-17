import test from 'node:test';
import assert from 'node:assert/strict';
import {restoreSakura} from '../src/commerce/sakura-economy.js';
import {konbiniItem,defaultKonbini,restoreKonbini,addToBasket,removeFromBasket,basketLines,basketTotal,
 warmableInBasket,checkoutQuote,checkout,receiptText,tenderFor,STAMP_PER_YEN,CARD_STAMPS,WARMABLE} from '../src/commerce/konbini.js';

/** A shopper standing in Sakura at 10:00 with a full shelf and money. */
const shopper=({yen=5000,stamps=0}={})=>{
 const state={yen,inventory:[],konbini:{...defaultKonbini(),stamps},sakura:restoreSakura()};
 return state;
};
const fill=state=>{for(const id of Object.keys(state.sakura.stock))state.sakura.stock[id].shelf=Math.max(state.sakura.stock[id].shelf,6);};

test('the basket takes what is on the shelf and refuses what is not',()=>{
 const state=shopper();fill(state);
 assert.equal(addToBasket(state,'tea').ok,true);
 assert.equal(addToBasket(state,konbiniItem('rice')).ok,true,'An item object works as well as an id');
 assert.deepEqual(basketLines(state).map(l=>l.id),['tea','rice']);
 assert.equal(basketTotal(state),konbiniItem('tea').cost+konbiniItem('rice').cost);
 addToBasket(state,'tea');
 assert.deepEqual(basketLines(state).map(l=>l.count),[2,1],'A second tea is a count, not a second line');
 assert.equal(addToBasket(state,'nothing-like-this').ok,false);
 // The shelf is the limit: you cannot basket more than she has.
 state.sakura.stock.soap.shelf=1;
 assert.equal(addToBasket(state,'soap').ok,true);
 const second=addToBasket(state,'soap');
 assert.equal(second.ok,false);
 assert.match(second.message,/sold out/);
 assert.equal(removeFromBasket(state,'soap'),true);
 assert.equal(removeFromBasket(state,'soap'),false,'Removing what is not there is not an error');
});

test('she offers to warm only what a microwave would take',()=>{
 const state=shopper();fill(state);
 addToBasket(state,'soap');addToBasket(state,'notebook');
 assert.deepEqual(warmableInBasket(state),[],'Soap is not offered warm');
 addToBasket(state,'rice');
 assert.deepEqual(warmableInBasket(state).map(l=>l.id),['rice']);
 for(const id of WARMABLE)assert.ok(konbiniItem(id),'Every warmable id is a real item: '+id);
});

test('the quote is the counter speaking before any money moves',()=>{
 const state=shopper();fill(state);
 for(let i=0;i<4;i++)addToBasket(state,'battery');   // 4 x 180 = 720
 const quote=checkoutQuote(state,{warm:false,bag:true});
 assert.equal(quote.total,720);
 assert.equal(quote.stampsEarned,Math.floor(720/STAMP_PER_YEN));
 assert.equal(quote.tendered,1000,'You would hand over a thousand-yen note');
 assert.equal(quote.change,280);
 // Nothing has been taken: asking is free.
 assert.equal(state.yen,5000);
 assert.equal(basketTotal(state),720);
 assert.equal(tenderFor(500),500);
 assert.equal(tenderFor(501),1000);
 assert.equal(tenderFor(12000),20000,'Beyond the biggest note it rounds up in ten-thousands');
});

test('checkout takes the money, the stock and the basket exactly once',()=>{
 const state=shopper();fill(state);
 const teaShelf=state.sakura.stock.tea.shelf;
 addToBasket(state,'tea');addToBasket(state,'tea');addToBasket(state,'rice');
 const total=basketTotal(state);
 const result=checkout(state,{warm:true,bag:true},600);
 assert.equal(result.ok,true);
 assert.equal(state.yen,5000-total,'Paid once, in full');
 assert.deepEqual(state.inventory,['Green tea','Green tea','Plum rice ball']);
 assert.equal(state.sakura.stock.tea.shelf,teaShelf-2,'Two teas left the shelf');
 assert.equal(basketTotal(state),0,'The basket is emptied');
 assert.equal(state.konbini.visits,1);
 assert.deepEqual(result.receipt.warmed,['Plum rice ball'],'Only the rice ball was warmed');
 assert.deepEqual([...state.konbini.tried].sort(),['rice','tea'],'Both are recorded as tried');
 // The shop ledger saw real sales, not a lump.
 const sales=state.sakura.journal.filter(row=>row.kind==='Sale');
 assert.equal(sales.length,3);
 assert.equal(sales.reduce((sum,row)=>sum+row.revenue,0),total);
 assert.equal(state.sakura.cash>0,true);
});

test('a checkout that cannot complete puts every item back',()=>{
 const state=shopper();fill(state);
 addToBasket(state,'tea');addToBasket(state,'rice');addToBasket(state,'soap');
 const before={tea:state.sakura.stock.tea.shelf,rice:state.sakura.stock.rice.shelf,soap:state.sakura.stock.soap.shelf};
 // The soap sells out between picking it up and reaching the counter.
 state.sakura.stock.soap.shelf=0;
 const result=checkout(state,{},600);
 assert.equal(result.ok,false);
 assert.match(result.message,/sold out/);
 assert.equal(state.yen,5000,'No money moved');
 assert.deepEqual(state.inventory,[],'Nothing entered the bag');
 assert.equal(state.sakura.stock.tea.shelf,before.tea,'The tea went back on the shelf');
 assert.equal(state.sakura.stock.rice.shelf,before.rice);
 assert.equal(basketTotal(state)>0,true,'The basket is still yours to put back');
});

test('the till is shut outside trading hours and short money is refused',()=>{
 const shut=shopper();fill(shut);addToBasket(shut,'tea');
 assert.match(checkout(shut,{},1300).message,/till is closed/);
 assert.match(checkout(shut,{},300).message,/till is closed/);
 assert.equal(shut.yen,5000);
 const broke=shopper({yen:50});fill(broke);addToBasket(broke,'battery');
 assert.match(checkout(broke,{},600).message,/enough yen/);
 assert.equal(broke.sakura.stock.battery.shelf>0,true,'and the battery stays on the shelf');
 const empty=shopper();
 assert.match(checkout(empty,{},600).message,/basket is empty/);
});

test('stamps accumulate across visits and a full card is spent at once',()=>{
 // One short of a card, then a visit that tips it over.
 const state=shopper({yen:99999,stamps:CARD_STAMPS-1});fill(state);
 for(let i=0;i<3;i++)addToBasket(state,'battery');   // 540 yen -> 1 stamp
 const result=checkout(state,{},600);
 assert.equal(result.ok,true);
 assert.equal(result.receipt.stampsEarned,1);
 assert.equal(result.receipt.gift,'Green tea','A filled card puts a tea on the counter');
 assert.equal(state.konbini.cards,1,'The card is counted and taken back');
 assert.equal(state.konbini.stamps,0,'and the next card starts empty');
 assert.ok(state.inventory.includes('Green tea'));
 // The giveaway is in the book as a giveaway, not a sale.
 const gift=state.sakura.journal.find(row=>row.kind==='Stamp card');
 assert.ok(gift&&gift.revenue===0&&gift.cost>0,'It earned nothing and cost her the goods');
 assert.equal(state.konbini.stamps<CARD_STAMPS,true);
});

test('a hand-edited save cannot mint stamps, items or a full card',()=>{
 assert.deepEqual(restoreKonbini(undefined),defaultKonbini());
 assert.deepEqual(restoreKonbini({basket:['tea','not-real','rice']}).basket,['tea','rice']);
 assert.deepEqual(restoreKonbini({tried:['tea','tea','nope']}).tried,['tea'],'Duplicates and inventions are dropped');
 assert.equal(restoreKonbini({stamps:1e9}).stamps,CARD_STAMPS-1,'Stamps cannot exceed a card');
 assert.equal(restoreKonbini({stamps:CARD_STAMPS}).stamps,CARD_STAMPS-1,'A stored card is never already full');
 assert.equal(restoreKonbini({visits:-5}).visits,0);
 assert.equal(restoreKonbini({ownBag:'yes'}).ownBag,false);
 assert.deepEqual(Object.keys(restoreKonbini({})),Object.keys(defaultKonbini()));
});

test('the receipt reads like something the till printed',()=>{
 const state=shopper();fill(state);
 addToBasket(state,'rice');addToBasket(state,'rice');addToBasket(state,'tea');
 const {receipt}=checkout(state,{warm:true,bag:false},610);
 const text=receiptText(receipt);
 assert.match(text,/桜商店 SAKURA SHŌTEN/);
 assert.match(text,/10:10/,'It carries the hour of the visit');
 assert.match(text,/おにぎり Plum rice ball ×2/,'Two of a thing is one line');
 assert.match(text,/合計 TOTAL/);
 assert.match(text,/おつり  CHANGE/);
 assert.match(text,/温め済 WARMED · Plum rice ball/);
 assert.match(text,/袋辞退 · own bag/,'Declining a bag is noted, never charged');
 assert.doesNotMatch(text,/¥3|bag fee/i,'Bags were free in 1988');
 assert.match(text,/ありがとうございました/);
 assert.equal(receiptText(null),'');
});

// ---- the ritual as the player meets it ------------------------------------------
import {installDOM} from './fixtures.mjs';
import {SAVE_KEY} from '../src/save.js';
import {STORE_ITEMS} from '../src/commerce/catalogue.js';

const counter=async()=>{
 const dom=installDOM();
 const {createActivities}=await import('../activities.js?konbini='+Math.random());
 let minutes=600;
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>minutes,
  getSocialContext:()=>({inside:'market',thuanAvailable:true})});
 for(const id of Object.keys(acts.state.sakura.stock))acts.state.sakura.stock[id].shelf=6;
 return {dom,acts,setMinutes:v=>{minutes=v;}};
};
const body=()=>document.querySelector('#activityBody').firstChild.textContent;
const title=()=>document.querySelector('#activityTitle').textContent;
const pick=(acts,dom,id)=>{const item=STORE_ITEMS.find(i=>i.id===id)||{id};
 acts.action('store-item',item.name,item);dom.button(`Into the basket · ¥${item.cost}`);};

test('the shelf fills a basket and the counter runs the whole exchange',async()=>{
 const {dom,acts}=await counter();
 const start=acts.state.yen;
 pick(acts,dom,'rice');pick(acts,dom,'tea');
 assert.equal(acts.state.yen,start,'Nothing is paid for at the shelf');
 acts.konbiniCounter();
 // Warming is offered because a rice ball is in the basket.
 assert.match(body(),/温めますか/,'She offers to warm it');
 dom.button('Yes, please');
 assert.match(body(),/袋はご利用ですか/,'then asks about a bag');
 dom.button('I have my own');
 assert.match(body(),/合計 ¥200/,'then reads out the total');
 assert.match(body(),/スタンプカード/,'and mentions the stamp card');
 dom.button('Pay ¥200 in cash');
 assert.match(body(),/レシート|SAKURA SHŌTEN/,'A receipt is printed');
 assert.match(body(),/温め済 WARMED · Plum rice ball/);
 assert.match(body(),/袋辞退/,'Declining the bag is on it');
 assert.equal(acts.state.yen,start-200);
 assert.deepEqual(acts.state.inventory.sort(),['Green tea','Plum rice ball']);
 assert.equal(acts.state.konbini.basket.length,0);
});

test('soap is never offered warm, and the basket can be put back',async()=>{
 const {dom,acts}=await counter();
 pick(acts,dom,'soap');
 acts.konbiniCounter();
 assert.doesNotMatch(body(),/温めますか/,'A bar of soap is not microwaved');
 assert.match(body(),/袋はご利用ですか/);
 dom.button('Put something back');
 assert.match(title(),/かご · Basket/,'The basket opens for a rethink');
 assert.match(body(),/1 item\(s\) · ¥90/);
 dom.button('Put back Sakura soap');
 assert.match(body(),/empty/,'An emptied basket says so');
 assert.equal(acts.state.konbini.basket.length,0);
});

test('the passport records the visit, the card and the last receipt',async()=>{
 const {dom,acts}=await counter();
 pick(acts,dom,'tea');
 acts.konbiniCounter();dom.button('Yes, please');dom.button('Pay ¥120 in cash');
 acts.close();
 acts.inventory();
 dom.button('Konbini passport');
 assert.match(body(),/Visits: 1/);
 assert.match(body(),/スタンプカード/);
 assert.match(body(),/Tried 1 of/);
 assert.match(body(),/Green tea/);
 dom.button('Last receipt');
 assert.match(body(),/ありがとうございました/,'The kept receipt is still readable');
 // and it survives a reload
 acts.save();
 const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
 assert.equal(saved.konbini.visits,1);
 assert.deepEqual(saved.konbini.tried,['tea']);
});
