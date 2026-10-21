import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installDOM} from './fixtures.mjs';
import {productSnapshot} from '../tools/studio/products-snapshot.mjs';

// Sakura's products moved out of eight modules into data/studio/products.json (Studio over MCP, stage 2, batch 2a).
// tests/fixtures/products-legacy.json is what those modules exported before the move; the views over the data must
// give back every value, in the same order where order means something (the atlas, the flavours, the floor walk, the
// catalogue, the stock), and build every pack's geometry to the same bytes. tools/studio/baselines.mjs checks the
// pixels in Chromium.
installDOM();
const legacy=JSON.parse(await readFile(new URL('./fixtures/products-legacy.json',import.meta.url),'utf8'));
const now=await productSnapshot();
// Since the snapshot was taken the cast has been consolidated (src/people/cast.js): a place cast.js marks closed no longer
// trades, so its accounts (the Fumoto co-op's Wednesday crates) are gone from ACCOUNTS. Everything else is unchanged.
const {PLACES}=await import('../src/people/cast.js');
const closed=new Set(Object.entries(PLACES).filter(([,p])=>p.closed).map(([id])=>id));
for(const accounts of Object.values(legacy.ACCOUNTS))for(const site of Object.keys(accounts))if(closed.has(site))delete accounts[site];
// And the people who left the island no longer buy anything: they leave every 'for' list and linesFor. Phase 5 of the
// consolidation (docs/CAST-CONSOLIDATION.md; data/studio/products.json) then gave the retired buyers' lines to live
// residents whose days fit them, so a 'for' list is the data's own where it names live cast only and keeps everyone of
// the snapshot's who stayed; linesFor follows for every live buyer.
const {castMember}=await import('../src/people/cast.js');
const live=n=>castMember(n)&&!castMember(n).supporting;
const leave=(o,key)=>{if(Array.isArray(o)){o.forEach(x=>leave(x));return;}if(!o||typeof o!=='object')return;
 // (A supporting crew name, Jun, was the airport clerk's who left; the cook-steward of that name is a different person the snapshot never had.)
 if(Array.isArray(o.for)){o.for=o.for.filter(live);const id=o.id||key,want=now.MERCHANDISING[id]?.for;
  if(want&&want.join()!==o.for.join()){assert.ok(want.every(n=>castMember(n)),id+' is for live residents');for(const n of o.for)assert.ok(want.includes(n),id+' keeps '+n);o.for=[...want];}}
 for(const [k,v] of Object.entries(o))if(k!=='for')leave(v,k);};
leave(legacy.MERCHANDISING);leave(legacy.GROCERY_ITEMS);leave(legacy.SHOP_STOCK);
// Phase 3 of the consolidation moved the florist's trade to Sakura (docs/CAST-CONSOLIDATION.md addendum 3): the Rainflower
// supplier and its accounts are gone, Sakura's supplier record carries the decorations, and the four businesses that took
// their decorations from Mrs Kinjō now take them on their Sakura account (decor, with the why and delivery extended). The
// shelf lines of those accounts, and everything else, are unchanged.
delete legacy.SUPPLIERS['rainflower-florist'];delete legacy.ACCOUNTS['rainflower-florist'];
legacy.SUPPLIERS.sakura={...legacy.SUPPLIERS.sakura,goods:now.SUPPLIERS.sakura.goods,decor:now.SUPPLIERS.sakura.decor};
// 21 October 2026 (briefs/town-hall-zone.md phase M): the mayor's office went, and its accounts with Sakura and Front-Row
// are the Community Hall's (the community kitchen's): the hall orders what the office ordered, as well as its own.
{const hall=now.ACCOUNTS.sakura['community-kitchen'],was=[legacy.ACCOUNTS.sakura['community-kitchen'],legacy.ACCOUNTS.sakura['mayor-office']];
 assert.deepEqual(hall.lines,was.flatMap(a=>a.lines),'the hall orders the kitchen\u2019s lines and the office\u2019s');
 assert.deepEqual(now.ACCOUNTS.frontrow['community-kitchen'].lines,legacy.ACCOUNTS.frontrow['mayor-office'].lines,'the hall\u2019s register takes the office\u2019s stationery');
 for(const supplier of ['sakura','frontrow']){assert.equal(now.ACCOUNTS[supplier]['mayor-office'],undefined);delete legacy.ACCOUNTS[supplier]['mayor-office'];legacy.ACCOUNTS[supplier]['community-kitchen']=now.ACCOUNTS[supplier]['community-kitchen'];}}
for(const site of ['izakaya','onsen','school']){const was=legacy.ACCOUNTS.sakura[site],is=now.ACCOUNTS.sakura[site];assert.deepEqual(is.lines,was.lines,site+' keeps its shelf lines');legacy.ACCOUNTS.sakura[site]={...was,why:is.why,delivery:is.delivery,decor:is.decor};}
// Phase 4 retired the people some accounts' deliveries named (Reiko's evening press): the data's delivery line is the
// one that reads, and it names a live resident; the lines and everything else about the account are unchanged.
const {isRetired}=await import('../src/people/roster.js');
const retiredName=text=>typeof text==='string'&&/Reiko|Tōma|Kinjō|Ōshiro|Shimabukuro|Sakurai|Barfly|Bus driver|Higa Jr|Grandmother Chinen/.test(text);
for(const [supplier,accounts] of Object.entries(legacy.ACCOUNTS))for(const [site,was] of Object.entries(accounts)){const is=now.ACCOUNTS[supplier]?.[site];if(is&&retiredName(was.delivery)&&is.delivery!==was.delivery){assert.ok(!retiredName(is.delivery),supplier+'/'+site+' names a live deliverer');assert.deepEqual(is.lines,was.lines);accounts[site]={...was,delivery:is.delivery};}}
// 21 October 2026 (the owner's decision; commerce/higa-liquor.js HIGA_ROUND): Higa Liquor's orders are Kōji's round on his
// weeks ashore, so its accounts' delivery lines say when and who carries them; what each account orders is unchanged.
for(const [site,was] of Object.entries(legacy.ACCOUNTS['higa-saketen'])){const is=now.ACCOUNTS['higa-saketen'][site];assert.deepEqual(is.lines,was.lines,site+' keeps its order');legacy.ACCOUNTS['higa-saketen'][site]={...was,delivery:is.delivery};}
for(const name of Object.keys(legacy.linesFor))if(!live(name))delete legacy.linesFor[name];
for(const [name,want] of Object.entries(now.linesFor)){assert.ok(castMember(name),name+' buys at Sakura but is not in the cast');for(const line of legacy.linesFor[name]||[])assert.ok(want.includes(line),name+' keeps the '+line);legacy.linesFor[name]=want;}

test('every legacy export, shelf, atlas cell and flavour shift comes back from the data unchanged',()=>{
 assert.deepEqual(Object.keys(now).sort(),Object.keys(legacy).sort());
 for(const key of Object.keys(legacy)){if(key==='geometry')continue;assert.deepStrictEqual(now[key],legacy[key],key);}
});

test('order is kept where World reads it in order',()=>{
 for(const key of ['STORE_BRANDS','PACKS','FLAVOURS','MERCHANDISING','SOURCED_FROM','SAKURA_SHELVES'])assert.deepEqual(Object.keys(now[key]),Object.keys(legacy[key]),key);
 for(const key of ['BRAND_ATLAS_KEYS','DRINKABLE'])assert.deepEqual(now[key],legacy[key],key);
 for(const key of ['STORE_ITEMS','GROCERY_ITEMS','SHOP_STOCK'])assert.deepEqual(now[key].map(i=>i.id),legacy[key].map(i=>i.id),key);
 for(const [id,list] of Object.entries(legacy.FLAVOURS))assert.deepEqual(now.FLAVOURS[id].map(f=>f[0]),list.map(f=>f[0]),id);
});

test('every pack is built to the same geometry, on the shelf, in the hand and as fresh food',()=>{
 assert.deepEqual(Object.keys(now.geometry).sort(),Object.keys(legacy.geometry).sort());
 for(const [id,g] of Object.entries(legacy.geometry))assert.deepStrictEqual(now.geometry[id],g,id);
});
