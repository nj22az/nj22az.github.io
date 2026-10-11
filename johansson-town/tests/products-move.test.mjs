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
