// "Make model" without its page (model-assets.mjs): the library lists World's catalogue and every registry prop, ids
// are checked against everything World and Studio use, and a registry prop's card passes the card checks. The page
// itself (the views, the exports on an iPad) is avatar-creator/tests/model.browser.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

// World's assetURL reads the page's base; files Studio fetches (rules.json, brand-rules.json) come from disk here.
globalThis.document??={baseURI:'http://127.0.0.1/johansson-town/'};
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,...rest)=>{const u=String(url);if(u.startsWith('file:'))return new Response(await readFile(fileURLToPath(u)));return realFetch(url,...rest);};
const A=await import('../model-assets.mjs');
const {catalogIds}=await import('../../johansson-town/src/catalog/catalog-cards.js');
const {PROP_REGISTRY}=await import('../../johansson-town/src/studio/prop-registry.js');
const {cardChecks}=await import('../../johansson-town/src/studio/modeller/card-checks.js');

test('the library has every catalogue asset and every registry prop, each once',()=>{
 const items=A.libraryItems({made:{}}),keys=items.map(i=>i.key);
 assert.deepEqual(keys,[...catalogIds().map(id=>'catalogue:'+id),...PROP_REGISTRY.map(e=>'registry:'+e.id)]);
 assert.equal(new Set(keys).size,keys.length);
 for(const i of items){assert.ok(i.name&&i.kind&&typeof i.build==='function'&&typeof i.card==='function',i.key);}
 assert.ok(items.filter(i=>i.source==='catalogue').every(i=>i.picture?.endsWith('/hero.png')),'catalogue tiles show their published hero');
});

test('ids are checked against World’s build catalogue, home furniture, code props, catalogue and Studio’s own',()=>{
 const taken=A.takenIds(null,{'my-lantern':{card:{}}});
 assert.equal(taken.bench,'World’s build catalogue');assert.match(taken['vending-machine'],/^World’s code/);
 assert.equal(taken['massage-chair'],'catalogue:johansson-studio');assert.equal(taken['my-lantern'],'Studio');
 assert.equal(A.takenIds({id:'vending-machine',source:'registry'})['vending-machine'],undefined,'an asset never clashes with itself');
 assert.equal(A.takenIds({id:'my-lantern',source:'lathe'},{'my-lantern':{card:{}}})['my-lantern'],undefined,'saving a design again updates it');
});

test('every registry prop’s card passes the card checks (complete, purpose, no brands, its own id)',async()=>{
 const rules=await A.loadRules(),extra=await A.loadExtraBrands();
 for(const e of PROP_REGISTRY){
  const card=await A.registryCard(e),checks=cardChecks(card,rules,{assetId:e.id,taken:A.takenIds({id:e.id,source:'registry'}),extraBrands:extra});
  assert.deepEqual(checks.filter(c=>!c.ok).map(c=>c.detail),[],e.id);
  assert.deepEqual(card.size,[...e.size]);assert.equal(card.model,'model.glb');
 }
});

test('Make model is a workspace in Studio’s top bar, with its own styles',async()=>{
 const studio=await readFile(new URL('../studio.js',import.meta.url),'utf8'),page=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(studio,/\['model','Make model'\]/);assert.match(studio,/createModelWorkspace/);
 assert.match(page,/\/avatar-creator\/model\.css/);
});
