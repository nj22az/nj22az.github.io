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
 const dom=installDOM({[SAVE_KEY]:JSON.stringify(state)}),acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>600,getSocialContext:()=>({inside:'market',yuriAvailable:true})});
 recordSakuraSale(acts.state,150);acts.action('resident','Thuan');dom.button('Sell items from my bag');const sell=document.querySelector('#activityActions').children.find(b=>b.textContent==='Sell returnable glass bottle · +¥30'||b.textContent==='Sell Returnable glass bottle · +¥30');assert.ok(sell);sell.onclick();sell.onclick();assert.equal(acts.state.yen,1230);assert.equal(acts.state.sakura.cash,120);
 assert.equal(JSON.parse(localStorage.getItem(SAVE_KEY)).sakura.cash,120);
});

test('renaming Yuri preserves her saved life, home, player progress and workshop job',()=>{
 const old={yen:350,quest:2,inventory:['Sea bream'],notes:['Met Yuri at Sakura.'],residentLocations:{Yuri:{indoors:'home',position:[4,6]}},residentLife:{Yuri:{day:0,yen:2140,activities:['Yuri bought tea'],meals:{}}},workshop:{job:{id:'cable-ring',remaining:3}}};
 const saved=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify(old):null});assert.deepEqual(saved.residentLocations.Thuan,old.residentLocations.Yuri);assert.equal(saved.residentLife.Thuan.yen,2140);assert.equal(saved.residentLife.Yuri,undefined);assert.equal(saved.notes[0],'Met Thuan at Sakura.');assert.deepEqual(saved.workshop,old.workshop);assert.equal(saved.yen,350);assert.equal(saved.quest,2);
 const both=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify({...old,residentLocations:{...old.residentLocations,Thuan:{indoors:'market',position:[8,9]}}}):null});assert.equal(both.residentLocations.Thuan.indoors,'market');
});
