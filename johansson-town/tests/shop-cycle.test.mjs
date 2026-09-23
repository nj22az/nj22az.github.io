import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {RESIDENTS} from '../src/people/residents.js';
import {createResidentLedger,restoreResidentLife} from '../src/people/resident-personalities.js';
import {createSakuraShop} from '../src/people/sakura-shop.js';
import {restoreSakura,advanceDeliveries} from '../src/commerce/sakura-economy.js';
import {stockSpec,closingPreparationPending} from '../src/commerce/shop-stock.js';
import {elapsedTownAbsence} from '../src/people/town-absence.js';
import {createActivities} from '../activities.js';
import {SAVE_KEY} from '../src/save.js';

function fixture({visible=true,saved=null}={}){
 installDOM();const scene=new T.Scene(),street=new T.Group();scene.add(street);
 const state=saved||{yen:1200,inventory:[],sakura:restoreSakura()},world={people:[]};let minutes=600;
 for(const name of ['Thuan','Reiko']){const profile=RESIDENTS.find(p=>p.name===name),g=new T.Group();g.userData={name,hit:{inside:false},indoors:'market',justArrived:name==='Reiko',visualReady:false};g.position.set(...[profile.work[0],0,profile.work[1]]);street.add(g);world.people.push({profile,g});}
 const ledger=createResidentLedger(()=>state),hits=[];
 const shop=createSakuraShop({world,scene,state,ledger,register:(o,label,fn,inside)=>{o.userData.hit={inside,fn,label};hits.push({o,label,fn});},action(){},exit(){},getMinutes:()=>minutes,getPlayerSeat:()=>null,getPlayerPosition:()=>new T.Vector3(5,0,5),isInside:()=>visible,pay:()=>{throw Error('NPC must pay from their own wallet');},say(){}});
 shop.group.visible=visible;const step=(seconds,check=()=>{})=>{for(let f=0;f<seconds*30;f++){minutes+=1/30;shop.update(1/30);check();}};
 return {state,world,ledger,shop,hits,step,get minutes(){return minutes;},time(value){minutes=value;}};
}
function visibleInstances(group){let count=0;const matrix=new T.Matrix4();group.traverse(mesh=>{if(mesh.isInstancedMesh)for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);if(Math.abs(matrix.determinant())>1e-8)count++;}});return count;}

test('the town clock dims existing Sakura strip lights late at night without advancing staff jobs',()=>{
 const f=fixture();f.shop.street(f.shop.group.parent,{position:[0,0,0],yaw:0});
 const strip=f.shop.group.getObjectByName('Sakura shopfront strip lights');assert.equal(strip.children.length,2);
 const phase=f.shop.service.phase,position=f.world.people[0].g.position.clone();
 for(const [minutes,level] of [[540,1],[1110,1],[1243,1],[1380,.6],[1440,.6]]){
  f.time(minutes);for(const update of f.world.hourly)update(minutes);
  assert.deepEqual(strip.children.map(l=>l.intensity),[150*level,110*level]);
  for(const lamp of strip.children)assert.equal(lamp.color.getHex(),0xfff1ce);
 }
 assert.equal(f.shop.service.phase,phase);assert.ok(f.world.people[0].g.position.equals(position));
 f.shop.enter(f.shop.group.parent);assert.equal(f.shop.group.getObjectByName('Sakura shopfront strip lights'),undefined);
});

test('a customer picks visible goods, waits for the till, pays once and funds an actual delivery and restock',()=>{
 const f=fixture(),customer=f.world.people[1],clerk=f.world.people[0].g;
 // Reiko chooses a notebook; its next replacement must be bought, not created.
 f.state.sakura.stock.notebook.reserve=0;
 const capacity=stockSpec('notebook').capacity,original=visibleInstances(f.shop.group),phases=new Set();let picked=false,paid=false,hiddenLabels=false;
 const packaging=f.shop.group.getObjectByName('Sakura notebook packaging'),matrix=new T.Matrix4();const nonzero=()=>{let count=0;for(let i=0;i<packaging.count;i++){packaging.getMatrixAt(i,matrix);if(Math.abs(matrix.determinant())>1e-8)count++;}return count;},labelsBefore=nonzero();
 f.step(135,()=>{
  phases.add(f.shop.service.phase);const r=f.state.residentLife.Reiko?.shopping;
  if(r?.picked&&!r.paid){picked=true;assert.equal(f.state.sakura.stock.notebook.shelf,capacity-1);assert.equal(f.state.sakura.sales,0,'Taking an item is not yet a sale');assert.equal(customer.g.userData.heldItem,'shop-notebook');assert.ok(visibleInstances(f.shop.group)<original,'The actual instanced product disappears');hiddenLabels ||= nonzero()<labelsBefore;}
  if(r?.paid)paid=true;
  if(['checkout','stock-fetch','stock-carry','stock-place'].includes(f.shop.service.phase))assert.equal(f.shop.blocked(clerk.position.x,clerk.position.z,.25),false,'Work stays outside furniture at '+clerk.position.toArray()+' '+f.shop.service.phase);
  for(const item of Object.values(f.state.sakura.stock))assert.ok(item.shelf>=0&&item.reserve>=0);
 });
 const spec=stockSpec('notebook');assert.ok(picked&&paid&&hiddenLabels);assert.ok(f.state.residentLife.Reiko.shopping.finished);assert.equal(f.state.sakura.sales,spec.cost);assert.equal(f.state.sakura.profit,spec.cost-spec.unitCost);
 assert.equal(f.shop.service.phase,'counter');assert.equal(clerk.userData.socialPose,'CounterIdle','The actual retail controller selects the relaxed counter pose after serving');
 assert.equal(f.state.sakura.stockSpent,spec.unitCost);assert.equal(f.state.sakura.cash,spec.cost-spec.unitCost);assert.equal(f.ledger.account('Reiko',f.minutes).yen,2400-spec.cost);
 assert.equal(f.state.sakura.stock.notebook.shelf,capacity-1,'The shelf stays depleted during the day');assert.equal(f.state.sakura.stock.notebook.reserve,1);assert.ok(!f.state.sakura.journal.some(r=>r.kind==='Restocked'));
 f.time(1200);f.step(110,()=>{phases.add(f.shop.service.phase);if(['stock-fetch','stock-carry','stock-place'].includes(f.shop.service.phase)){assert.notEqual(clerk.userData.socialPose,'CounterIdle','Release the counter pose before walking or handling goods');assert.equal(f.shop.blocked(clerk.position.x,clerk.position.z,.25),false,'Restock route '+clerk.position.toArray());}});
 assert.equal(f.state.sakura.stock.notebook.shelf,capacity);assert.equal(f.state.sakura.stock.notebook.reserve,0);assert.equal(visibleInstances(f.shop.group),original);
 for(const phase of ['checkout','checkout-pay','stock-fetch','stock-collect','stock-carry','stock-place'])assert.ok(phases.has(phase),'Observe '+phase);
 const rows=f.state.sakura.journal;assert.equal(rows.filter(r=>r.kind==='Sale').length,1);for(const kind of ['Stock purchase','Delivery','Restocked'])assert.ok(rows.some(r=>r.kind===kind));
 assert.ok(f.hits.some(h=>h.label==='Read Sakura sales ledger'));
});

test('the same stock, purchases and restocking run with the shop hidden and models still loading',()=>{
 const a=fixture({visible:true}),b=fixture({visible:false});a.step(130);b.step(130);a.time(1200);b.time(1200);a.step(110);b.step(110);
 assert.deepEqual(b.state.sakura,a.state.sakura);assert.deepEqual(b.state.residentLife,a.state.residentLife);
 assert.ok(b.state.sakura.sales>0);assert.equal(b.shop.group.visible,false);
 const position=b.world.people[0].g.position.clone(),phase=b.shop.service.phase;b.shop.enter(b.shop.group.parent);b.shop.hide();
 assert.ok(b.world.people[0].g.position.equals(position));assert.equal(b.shop.service.phase,phase,'Entering and leaving do not reset the staff job');
});

test('an unpaid picked item survives a save and is paid once, while closing returns unpaid goods',()=>{
 const f=fixture();let record;for(let i=0;i<400&&!record?.picked;i++){f.step(.1);record=f.state.residentLife.Reiko?.shopping;}
 assert.ok(record.picked&&!record.paid);const saved=JSON.parse(JSON.stringify(f.state));saved.sakura=restoreSakura(saved.sakura);saved.residentLife=restoreResidentLife(saved.residentLife);
 const resumed=fixture({saved});resumed.time(f.minutes);resumed.world.people[1].g.userData.justArrived=false;resumed.step(100);
 assert.equal(resumed.state.sakura.journal.filter(r=>r.kind==='Sale').length,1);assert.equal(resumed.state.sakura.sales,stockSpec(record.item).cost);
 const closing=fixture();let r;for(let i=0;i<400&&!r?.picked;i++){closing.step(.1);r=closing.state.residentLife.Reiko?.shopping;}assert.ok(r.picked&&!r.paid);closing.time(1200);closing.step(2);
 assert.equal(closing.state.sakura.sales,0);assert.equal(closing.state.sakura.stock[r.item].shelf,stockSpec(r.item).capacity);
});

test('empty stock and an empty till cannot produce free deliveries; return time is bounded and consumed once',()=>{
 const f=fixture();f.state.sakura.cash=0;for(const stock of Object.values(f.state.sakura.stock)){stock.shelf=0;stock.reserve=0;}
 for(let t=600;t<1200;t++)advanceDeliveries(f.state,t);
 assert.equal(f.state.sakura.deliveries.length,0);assert.equal(f.state.sakura.journal.length,0);
 assert.equal(elapsedTownAbsence(1000,121000),120);assert.equal(elapsedTownAbsence(2000,1000),0);assert.equal(elapsedTownAbsence(1000,999999999),1440);assert.equal(elapsedTownAbsence(undefined),0);
 installDOM({[SAVE_KEY]:JSON.stringify({minutes:600,savedAt:Date.now()-90000,inventory:[],yen:1200})});const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>600});
 assert.ok(acts.takeAbsence()>=90);assert.equal(acts.takeAbsence(),0);
});

test('the readable spreadsheet shows actual sales and stock and updates while open',()=>{
 const f=fixture();f.step(80);const dom=installDOM({[SAVE_KEY]:JSON.stringify({...f.state,minutes:f.minutes})});
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>f.minutes,getSocialContext:()=>({inside:'market'})});acts.action('shop-ledger');
 const text=node=>[node.textContent||'',...node.children.map(text)].join(' ');const body=document.querySelector('#activityBody');
 assert.match(text(body),/Gross profit/);assert.match(text(body),/Reiko/);assert.match(text(body),/Pocket notebook/);
 const root=body.firstChild;root.children[1].children[1].onclick();assert.match(text(body),/On shelf/);assert.match(text(body),/Radio batteries/);
 acts.state.sakura.stock.battery.shelf=0;acts.tick(1/30);assert.match(text(body),/0 \/ 12/);dom.button('Close ledger');assert.equal(acts.paused,false);
});

test('sold-out goods get Thuan’s apology, no charge and no daytime refill, even with reserve stock',()=>{
 const f=fixture(),spec=stockSpec('notebook');f.state.sakura.stock.notebook.shelf=0;f.step(100);
 assert.equal(f.state.sakura.stock.notebook.shelf,0);assert.equal(f.state.sakura.stock.notebook.reserve,spec.capacity*2);assert.equal(f.state.sakura.sales,0);assert.ok(f.state.residentLife.Reiko.shopping.finished);
 assert.match(f.world.people[0].g.userData.residentSpeech?.text||'',/Please come back tomorrow/);
 f.time(1200);f.step(130);assert.equal(f.state.sakura.stock.notebook.shelf,spec.capacity);assert.equal(f.state.sakura.restockedDay,0);
 const rows=f.state.sakura.journal.filter(r=>r.kind==='Restocked');assert.equal(rows.length,1);assert.ok(rows.every(r=>r.minute>=1200));
 installDOM({[SAVE_KEY]:JSON.stringify({...f.state,minutes:600,sakura:{...f.state.sakura,stock:{...f.state.sakura.stock,notebook:{shelf:0,reserve:2}}}})});
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>600,getSocialContext:()=>({inside:'market'})});acts.action('store-item','notebook',{...spec,jp:'Notebook',text:'Pocket notebook'});
 assert.match(document.querySelector('#activityBody').children.map(n=>n.textContent||'').join(' '),/Please come back tomorrow/);
});

test('Thuan visibly prepares a closing carton without replenishing shelves early',()=>{
 const f=fixture(),stock=f.state.sakura.stock.notebook;stock.shelf=0;stock.reserve=2;
 f.time(1170);
 assert.equal(closingPreparationPending(f.state,f.minutes),true);
 const phases=new Set();let sawProductInHand=false;
 for(let i=0;i<500&&f.shop.service.phase!=='stock-place';i++){f.step(.1);phases.add(f.shop.service.phase);if(f.shop.service.phase==='stock-place')sawProductInHand=f.world.people[0].g.userData.heldItem==='shop-notebook'&&Array.isArray(f.world.people[0].g.userData.shopReach);}
 assert.ok(phases.has('stock-prep-fetch')||phases.has('stock-prep-carry')||phases.has('stock-prep-hold'));
 assert.equal(stock.shelf,0);
 assert.equal(f.state.sakura.restockedDay,-1);
 assert.equal(f.world.people[0].g.userData.restocking,true);
 assert.equal(sawProductInHand,true);
 f.time(1200);
 for(let i=0;i<100&&f.shop.service.phase!=='return';i++){f.step(.1);phases.add(f.shop.service.phase);}
 assert.ok(phases.has('stock-place'));
 assert.equal(stock.shelf,2);
 assert.equal(f.world.people[0].g.userData.heldItem,undefined);
 assert.equal(f.world.people[0].g.userData.shopReach,undefined);
});

test('all shelves are restocked after closing, then Thuan leaves and the completed shift survives a save',()=>{
 const f=fixture();for(const stock of Object.values(f.state.sakura.stock))stock.shelf=0;
 f.time(1200);f.step(660);
 for(const [id,stock] of Object.entries(f.state.sakura.stock))assert.equal(stock.shelf,stockSpec(id).capacity,'Replenished '+id+' at '+f.minutes+' '+f.shop.service.phase+' '+f.world.people[0].g.position.toArray());
 assert.equal(f.state.sakura.restockedDay,0);assert.equal(f.world.people[0].g.userData.inMarket,undefined,'Clerk leaves after replenishing the shop');
 const saved=restoreSakura(JSON.parse(JSON.stringify(f.state.sakura)));assert.equal(saved.restockedDay,0);assert.equal(saved.journal.filter(r=>r.kind==='Restocked').length,Object.keys(saved.stock).length);
});
