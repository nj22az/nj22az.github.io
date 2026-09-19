import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {recordSakuraSale,restoreSakura,sellToSakura,TOWN_FINDS} from '../src/commerce/sakura-economy.js';
import {collectTownFind,restoreTownCleanup,CLEANUP_SPOTS} from '../src/commerce/town-cleanup.js';
import {marketVisitsForDay,residentPlan} from '../src/people/social.js';
import {RESIDENTS} from '../src/people/residents.js';
import {createResidentLedger} from '../src/people/resident-personalities.js';
import {createStoreService} from '../src/people/store-service.js';
import {advanceShopBusiness} from '../src/people/shop-business.js';
import {STORE_SEATS,STORE_CLERK_POSITION} from '../src/world/interiors/store-layout.js';
import {readSave,SAVE_KEY} from '../src/save.js';
import {installDOM} from './fixtures.mjs';
import {createActivities} from '../activities.js';
const fresh=()=>({yen:1200,inventory:[],sakura:restoreSakura(),townCleanup:restoreTownCleanup()});

test('sparse customer visits change each day, survive reloads and leave Thuan at work',()=>{
 const thuan=RESIDENTS.find(p=>p.name==='Thuan'),patterns=[];
 for(let day=0;day<6;day++){
  const visits=marketVisitsForDay(day*1440);patterns.push(JSON.stringify(visits));assert.equal(Object.keys(visits).length,5);
  const windows=Object.entries(visits).sort((a,b)=>a[1][0]-b[1][0]);
  for(let i=0;i<windows.length;i++){const [name,[start,end]]=windows[i],profile=RESIDENTS.find(p=>p.name===name);assert.ok(start>=540&&end<1200);if(i)assert.ok(start-windows[i-1][1][0]>=97,'Customers do not arrive in a stream');
   assert.equal(residentPlan(profile,day*1440+start+10).place,'market');
   const state={residentLife:{[name]:{day,meals:{market:{finished:true}}}}};assert.notEqual(residentPlan(profile,day*1440+start+10,false,state).place,'market','Finished diners leave');
  }
  for(let minute=540;minute<1200;minute+=15)assert.equal(residentPlan(thuan,day*1440+minute,true).place,'market');
  assert.equal(residentPlan(thuan,day*1440+1170,false,fresh()).activity,'checking closing stock');
  assert.equal(residentPlan(thuan,day*1440+1200,false,fresh()).activity,'restocking after closing');
 }
 assert.equal(new Set(patterns).size,6);assert.equal(JSON.stringify(marketVisitsForDay(0)),patterns[0],'The bounded cache can recreate the same day');
});

test('Thuan visits the table, asks, fetches, delivers and credits one paid NPC meal',()=>{
 const state=fresh(),ledger=createResidentLedger(()=>state),room=new T.Group(),clerk=new T.Group();clerk.position.set(...STORE_CLERK_POSITION);clerk.userData.inMarket=true;room.add(clerk);
 const customer={profile:RESIDENTS.find(p=>p.name==='Kenji'),g:new T.Group()};customer.g.position.set(...STORE_SEATS[2].position);customer.g.userData={inMarket:true,storeSeatId:STORE_SEATS[2].id};room.add(customer.g);
 let minutes=900;const phases=[],service=createStoreService({clerk,room,ledger,getMinutes:()=>minutes,getSeat:()=>null,getBalance:()=>state.yen,pay:()=>{throw Error('NPC cannot charge the player');},say(){},getCustomers:()=>[customer],onSale:(cost,id)=>recordSakuraSale(state,cost,id)});
 for(let frame=0;frame<120*60;frame++){minutes+=1/60;service.update(1/60);if(phases.at(-1)!==service.phase)phases.push(service.phase);if(service.phase==='ask'){assert.ok(clerk.position.distanceTo(customer.g.position)<1.1);assert.equal(state.sakura.cash,0);assert.match(clerk.userData.residentSpeech.text,/order/);}}
 const sequence=phases.filter(p=>['approach','ask','answer','return','prepare','deliver','served'].includes(p));assert.deepEqual(sequence.slice(0,7),['approach','ask','answer','return','prepare','deliver','served']);
 assert.equal(state.sakura.cash,150);assert.equal(state.sakura.sales,150);assert.equal(state.yen,1200);assert.equal(ledger.account('Kenji',minutes).yen,2250);assert.equal(ledger.account('Kenji',minutes).meals.market.finished,true);
 service.dispose();advanceShopBusiness({world:{people:[{profile:{name:'Thuan'},g:clerk},customer]},ledger,state,minutes,dt:100});assert.equal(state.sakura.cash,150,'Leaving the room cannot credit the same delivery twice');
});

test('offscreen orders need real arrivals and persist into the visible shop',()=>{
 const state=fresh(),ledger=createResidentLedger(()=>state),clerk={profile:{name:'Thuan'},g:new T.Group()},customer={profile:{name:'Aya'},g:new T.Group()},world={people:[clerk,customer]};
 const step=(dt,visible=false)=>advanceShopBusiness({world,ledger,state,minutes:700,dt,visible});
 step(50);assert.equal(state.sakura.cash,0);clerk.g.userData.indoors='market';customer.g.userData.indoors='market';step(44);assert.equal(state.sakura.cash,0);step(1,true);assert.equal(state.sakura.cash,0);step(1);assert.equal(state.sakura.cash,120);
 step(18);step(100);assert.equal(state.sakura.cash,120);assert.equal(ledger.account('Aya',700).meals.market.finished,true);
 state.sakura=restoreSakura(JSON.parse(JSON.stringify(state.sakura)));assert.equal(recordSakuraSale(state,120,'meal-0-Aya'),false);assert.equal(state.sakura.cash,120);
});

test('sales fund inventory purchases, with no free money or lost items when the till is empty',()=>{
 const state=fresh(),bottle=TOWN_FINDS[0].name;state.inventory.push(bottle,'Sea bream','Johansson cable ring','Waterlogged page · Kings of Ben…');
 assert.equal(sellToSakura(state,bottle).ok,false);assert.equal(state.inventory.length,4);assert.equal(state.yen,1200);
 assert.equal(recordSakuraSale(state,150,'customer-1'),true);assert.equal(recordSakuraSale(state,150,'customer-1'),false);
 assert.equal(sellToSakura(state,bottle).ok,true);assert.equal(state.sakura.cash,120);assert.equal(state.yen,1230);assert.equal(sellToSakura(state,bottle).ok,false);
 assert.equal(sellToSakura(state,'Johansson cable ring').ok,true);assert.equal(state.sakura.cash,0);assert.equal(state.yen,1350);
 assert.equal(sellToSakura(state,'Sea bream').ok,false);assert.equal(sellToSakura(state,'Waterlogged page · Kings of Ben…').ok,false);assert.equal(state.inventory.length,2);
 for(const amount of [NaN,-1,0,Infinity,1.5])assert.equal(recordSakuraSale(state,amount),false);
 assert.deepEqual(restoreSakura({cash:-20,sales:'10',bought:Infinity,receipts:null}),restoreSakura());
});

test('town clean-up can be collected once, survives saves and never discards a full-bag find',()=>{
 const state=fresh();state.inventory=Array(100).fill('Sea bream');assert.equal(collectTownFind(state,CLEANUP_SPOTS[0].id).ok,false);assert.equal(state.townCleanup.collected.length,0);state.inventory=[];
 for(const spot of CLEANUP_SPOTS){assert.equal(collectTownFind(state,spot.id).ok,true);assert.equal(collectTownFind(state,spot.id).ok,false);}
 assert.equal(state.inventory.length,6);assert.deepEqual(restoreTownCleanup(JSON.parse(JSON.stringify(state.townCleanup))),state.townCleanup);
 const dom=installDOM({[SAVE_KEY]:JSON.stringify(state)}),acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>600,getSocialContext:()=>({inside:'market',thuanAvailable:true})});
 recordSakuraSale(acts.state,150);acts.action('resident','Thuan');dom.button('The shop side of things');dom.button('Sell items from my bag');const sell=document.querySelector('#activityActions').children.find(b=>b.textContent==='Sell returnable glass bottle · +¥30'||b.textContent==='Sell Returnable glass bottle · +¥30');assert.ok(sell);sell.onclick();sell.onclick();assert.equal(acts.state.yen,1230);assert.equal(acts.state.sakura.cash,120);
 assert.equal(JSON.parse(localStorage.getItem(SAVE_KEY)).sakura.cash,120);
});

test('renaming Yuri preserves her saved life, home, player progress and workshop job',()=>{
 const old={yen:350,quest:2,inventory:['Sea bream'],notes:['Met Yuri at Sakura.'],residentLocations:{Yuri:{indoors:'home',position:[4,6]}},residentLife:{Yuri:{day:0,yen:2140,activities:['Yuri bought tea'],meals:{}}},workshop:{job:{id:'cable-ring',remaining:3}}};
 const saved=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify(old):null});assert.deepEqual(saved.residentLocations.Thuan,old.residentLocations.Yuri);assert.equal(saved.residentLife.Thuan.yen,2140);assert.equal(saved.residentLife.Yuri,undefined);assert.equal(saved.notes[0],'Met Thuan at Sakura.');assert.deepEqual(saved.workshop,old.workshop);assert.equal(saved.yen,350);assert.equal(saved.quest,2);
 const both=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify({...old,residentLocations:{...old.residentLocations,Thuan:{indoors:'market',position:[8,9]}}}):null});assert.equal(both.residentLocations.Thuan.indoors,'market');
});

test('the shop has a meter running, and Thuan draws only what it can spare',async()=>{
 const {settleTradingDay,SHOP_OVERHEADS,SHOP_DRAWING,SHOP_FLOAT}=await import('../src/commerce/sakura-economy.js');
 const {SHOP_STOCK}=await import('../src/commerce/shop-stock.js');
 const day=minutes=>Math.floor(minutes/1440);

 // Nothing is billed until a trading day has actually closed at 20:00.
 const state={...fresh()};state.sakura.cash=3000;
 settleTradingDay(state,600);
 assert.equal(state.sakura.overheads,0,'The day was billed before it had finished');
 assert.equal(state.sakura.journal.length,0);

 settleTradingDay(state,1260);
 assert.equal(state.sakura.overheads,SHOP_OVERHEADS);
 assert.equal(state.sakura.drawings,SHOP_DRAWING);
 assert.deepEqual(state.sakura.journal.map(r=>r.kind),['Overheads','Drawing']);
 assert.equal(state.sakura.cash,3000-SHOP_OVERHEADS-SHOP_DRAWING);
 assert.equal(state.sakura.settledDay,0);

 // Settling again must not bill the same day twice, however often it is asked.
 const settled=JSON.stringify(state.sakura);
 for(const at of [1300,1400,1439])settleTradingDay(state,at);
 assert.equal(JSON.stringify(state.sakura),settled,'A closed day was billed more than once');

 // The float is the wholesaler's money. She never draws on it, so the till cannot be
 // emptied by her own pay and the shop can always reorder.
 const thin={...fresh()};thin.sakura.cash=SHOP_FLOAT+SHOP_OVERHEADS+40;
 settleTradingDay(thin,1260);
 assert.equal(thin.sakura.drawings,40,'She drew into the float');
 assert.equal(thin.sakura.cash,SHOP_FLOAT);

 // And a shop with nothing in the drawer is not billed into a negative till.
 const broke={...fresh()};broke.sakura.cash=40;
 settleTradingDay(broke,1260);
 assert.equal(broke.sakura.cash,0);
 assert.equal(broke.sakura.overheads,40,'Billed more than ever left the drawer');
 assert.equal(broke.sakura.drawings,0);

 // A long absence catches up, but posts a week rather than a year of entries.
 const away={...fresh()};away.sakura.cash=200000;
 settleTradingDay(away,400*1440+1260);
 assert.equal(away.sakura.overheads,SHOP_OVERHEADS*7,'A year away posted a year of bills');
 assert.equal(away.sakura.settledDay,400);

 // The books balance: gross profit less what was billed is the shop's result, and the
 // till is the opening drawer plus sales less the bills and her drawings.
 const books={...fresh()},opening=3000;books.sakura.cash=opening;
 const line=SHOP_STOCK[0];
 for(let d=0;d<5;d++){
  for(let c=0;c<5;c++)recordSakuraSale(books,line.cost,null,{minute:d*1440+600+c*60,item:line.name,buyer:'Neighbour',unitCost:line.unitCost});
  settleTradingDay(books,d*1440+1260);
 }
 const rows=books.sakura.journal;
 const sum=(kind,field)=>rows.filter(r=>r.kind===kind).reduce((total,r)=>total+r[field],0);
 assert.equal(sum('Sale','profit')-sum('Overheads','cost'),books.sakura.profit,'Gross less costs is not the result');
 assert.equal(opening+books.sakura.sales-sum('Overheads','cost')-sum('Drawing','cost'),books.sakura.cash,'The till does not reconcile');
 assert.equal(day(rows.at(-1).minute),4);

 // The running costs are set against the shop's own trade: five neighbours a day earn
 // it a little more than it costs to open, and not much more.
 const daily=SHOP_STOCK.reduce((t,i)=>t+(i.cost-i.unitCost),0)/SHOP_STOCK.length*5;
 assert.ok(SHOP_OVERHEADS<daily,'The shop cannot cover its own day: '+SHOP_OVERHEADS+' vs '+daily.toFixed(0));
 assert.ok(SHOP_OVERHEADS>daily*.8,'The running costs are too small to be a question');
});

test('the ledger shows what the day cost as well as what it took',async()=>{
 installDOM();globalThis.self=globalThis;
 const {settleTradingDay}=await import('../src/commerce/sakura-economy.js');
 const {SHOP_STOCK}=await import('../src/commerce/shop-stock.js');
 const {createShopLedgerView}=await import('../src/commerce/shop-ledger.js');
 const state={...fresh()};state.sakura.cash=3000;
 const line=SHOP_STOCK[0];
 for(let d=0;d<3;d++){
  for(let c=0;c<5;c++)recordSakuraSale(state,line.cost,null,{minute:d*1440+600+c*60,item:line.name,buyer:'Mrs Sato',unitCost:line.unitCost});
  settleTradingDay(state,d*1440+1260);
 }
 state.minutes=3*1440+600;
 const view=createShopLedgerView(state,()=>state.minutes);
 const find=(node,match,out=[])=>{if(match(node))out.push(node);for(const child of node.children||[])find(child,match,out);return out;};
 const summary=find(view.element,n=>n.className==='sakura-ledger-summary')[0];
 const figures=Object.fromEntries(summary.children.map(box=>[box.children[0].textContent,box.children[1].textContent]));
 // Gross profit is what the goods made, the result is what survived the meter, and
 // the gap between them is the whole reason for the change.
 assert.ok('Running costs' in figures&&'Shop result' in figures&&'Thuan’s drawings' in figures,
  'The ledger still only reports takings: '+Object.keys(figures).join(', '));
 assert.notEqual(figures['Gross profit'],figures['Shop result'],'The running costs never reached the result');
 assert.equal(figures['Running costs'],'¥900');
 assert.equal(figures['Cash in till'],'¥'+state.sakura.cash.toLocaleString('en-GB'));
 // A loss is shown as -¥300, not ¥-300, and is marked so it reads at a glance.
 const rows=find(view.element,n=>(n.children||[]).length>=8&&(n.children||[]).every(c=>typeof c.textContent==='string'));
 const overhead=rows.find(r=>r.children[1].textContent==='Overheads');
 assert.ok(overhead,'No running-cost entry reached the sales sheet');
 assert.equal(overhead.children[7].textContent,'-¥300');
 assert.ok(rows.some(r=>r.children[1].textContent==='Drawing'),'Thuan’s own pay is not in the book');
 const loss={...fresh()};loss.sakura.cash=300;settleTradingDay(loss,1260);
 const lossView=createShopLedgerView(loss,()=>1440);
 const lossBox=find(lossView.element,n=>n.className==='sakura-ledger-loss');
 assert.equal(lossBox.length,1,'A shop in the red does not say so');
});
