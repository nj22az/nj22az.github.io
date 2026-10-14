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
// And the people who left the island no longer buy anything: they leave every 'for' list and linesFor. The tuna's three
// buyers all left; Mr Ōshiro and Barfly buy it now (products-data.js), so their lines gain the tuna.
const {castMember}=await import('../src/people/cast.js');
const TUNA_BUYERS=['Mr Ōshiro','Barfly'];
const leave=(o,key)=>{if(Array.isArray(o)){o.forEach(x=>leave(x));return;}if(!o||typeof o!=='object')return;
 if(Array.isArray(o.for)){o.for=o.for.filter(n=>castMember(n));if(!o.for.length&&(key==='tuna'||o.id==='tuna'))o.for=[...TUNA_BUYERS];}
 for(const [k,v] of Object.entries(o))if(k!=='for')leave(v,k);};
leave(legacy.MERCHANDISING);leave(legacy.GROCERY_ITEMS);leave(legacy.SHOP_STOCK);
for(const name of Object.keys(legacy.linesFor))if(!castMember(name))delete legacy.linesFor[name];
for(const name of TUNA_BUYERS){const want=now.linesFor[name];assert.deepEqual(want.filter(l=>l!=='tuna'),legacy.linesFor[name]);legacy.linesFor[name]=want;}

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
