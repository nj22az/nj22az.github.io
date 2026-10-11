import test from 'node:test';
import assert from 'node:assert/strict';
import {PARTS,normalizeRecipe,encodeRecipe,decodeRecipe} from '../src/avatars/recipe.js';
import {ISLAND_OUTFITS,ISLAND_COSTUMES} from '../src/avatars/outfits.js';
import {CATALOGUE,SETS,SLOTS,SLOT_AT,ISLAND_HEX,entryFor,labelFor,wornSet,wornLine,searchWardrobe,fold} from '../src/avatars/wardrobe-catalogue.js';

const ALL_SETS=[...ISLAND_OUTFITS,...ISLAND_COSTUMES];
/** Batch 1 of the Minato Machi wardrobe plan (2026-10-11): eight sets from parts that already exist. */
const BATCH_1=['shop-counter-smock','morning-boats','post-round','ramen-kitchen','cold-store','gateball-afternoon','haarii-crew','walk-to-school'];

test('every wardrobe part and every set has a label, a category of its slot, who wears it and why',()=>{
 const parts=Object.keys(SLOTS).filter(s=>s!=='set');
 for(const slot of parts)for(const id of PARTS[slot]){
  const e=entryFor(slot,id);assert.ok(e,`${slot} ${id} is in the catalogue`);
 }
 assert.equal(SETS.length,ALL_SETS.length);
 for(const e of CATALOGUE){
  const what=`${e.slot} ${e.id}`;
  assert.ok(e.label&&e.label.length<=20,what+' has a short label: '+e.label);
  assert.ok(SLOTS[e.slot].categories.includes(e.category),what+' is filed under one of its tab’s chips: '+e.category);
  assert.ok(e.who?.length>3&&e.why?.length>3,what+' says who wears it and why');
  assert.ok(Array.isArray(e.tags),what+' has tags');
 }
 const keys=CATALOGUE.map(e=>e.slot+':'+e.id);assert.equal(new Set(keys).size,keys.length,'one entry per item');
});

test('labels are per slot: the police jacket and the police cap read apart',()=>{
 assert.equal(labelFor('top','police'),'Police jacket');assert.equal(labelFor('hat','police'),'Police cap');
 assert.equal(labelFor('top','nothing-yet'),'nothing-yet');
 assert.equal(SLOT_AT['outfit.hat'],'hat');assert.equal(SLOT_AT['accessories.neckwear'],'neckwear');
});

test('set ids are unique, never a part id, and every set survives normalizeRecipe with nothing dropped',()=>{
 const ids=ALL_SETS.map(s=>s.id),partIds=new Set(Object.values(PARTS).flat());
 assert.equal(new Set(ids).size,ids.length);
 for(const id of ids)assert.ok(/^[a-z][a-z0-9-]+$/.test(id)&&!partIds.has(id),id);
 for(const set of ALL_SETS){
  const worn=normalizeRecipe({outfit:set.outfit}).outfit;
  for(const [key,value] of Object.entries(set.outfit))assert.equal(worn[key],value,`${set.name}: ${key} survives`);
  for(const way of set.colourways||[]){
   const r=normalizeRecipe({outfit:{...set.outfit,...way.colours}});
   for(const [key,value] of Object.entries(way.colours))assert.equal(r.outfit[key],value,`${set.name} ${way.name}: ${key}`);
   assert.deepEqual(decodeRecipe(encodeRecipe(r)),r);
  }
 }
});

test('the eight batch-1 sets: island palette, a hat each, and the plan’s parts',()=>{
 for(const id of BATCH_1){
  const set=ALL_SETS.find(s=>s.id===id);assert.ok(set,id);
  for(const [key,value] of Object.entries(set.outfit))if(/^#/.test(value))assert.ok(ISLAND_HEX.has(value),`${id} ${key} ${value} is from the island palette`);
  for(const way of set.colourways||[])for(const value of Object.values(way.colours))assert.ok(ISLAND_HEX.has(value),`${id} ${way.name} ${value}`);
  assert.notEqual(set.outfit.hat,undefined,id+' puts on its hat');assert.equal(set.outfit.pattern,'none',id+' is plain');
 }
 const by=id=>ALL_SETS.find(s=>s.id===id).outfit;
 assert.deepEqual([by('shop-counter-smock').top,by('shop-counter-smock').bottom,by('shop-counter-smock').hat],['smock','widepants','kerchief']);
 assert.deepEqual([by('cold-store').top,by('cold-store').hat],['hoodie','beanie']);
 assert.deepEqual([by('haarii-crew').footwear,by('haarii-crew').hat,by('haarii-crew').hatColour],['barefoot','headband','#f4f1ea']);
 assert.deepEqual([by('walk-to-school').hat,by('walk-to-school').hatColour],['bucket','#e8b83e']);
 // A colourway set is put on in its first colourway.
 const haarii=ALL_SETS.find(s=>s.id==='haarii-crew');
 assert.deepEqual(haarii.colourways.map(w=>w.name),['Minato','Kitahama','Nishi-machi']);
 for(const [k,v] of Object.entries(haarii.colourways[0].colours))assert.equal(haarii.outfit[k],v);
});

test('the maker knows which set someone is wearing, and in which colourway',()=>{
 for(const set of SETS){
  const ways=set.colourways.length?set.colourways.map(w=>w.colours):[{}];
  for(const [i,colours] of ways.entries()){
   const outfit=normalizeRecipe({outfit:{...normalizeRecipe({}).outfit,...set.outfit,...colours}}).outfit,found=wornSet(outfit);
   assert.equal(found?.set.id,set.id,set.id+' is found by what it puts on');assert.equal(found.colourway,set.colourways.length?i:-1);
  }
 }
 assert.equal(wornSet(normalizeRecipe({}).outfit),null,'the base layer is no set');
 assert.match(wornLine(entryFor('set','ramen-kitchen')),/^Worn by Mrs Sato at Sato Ramen · Hair covered/);
});

test('search finds items by label, the names in who, places and occasions, ignoring accents, grouped by slot',()=>{
 const ids=q=>searchWardrobe(q).flatMap(g=>g.entries.map(e=>e.slot+':'+e.id));
 assert.equal(fold('Kōji Shōten'),'koji shoten');
 assert.ok(ids('Koji').includes('set:morning-boats')&&ids('Koji').includes('set:haarii-crew'),'Koji finds Kōji’s sets');
 assert.ok(ids('kōji').includes('set:morning-boats'));
 assert.ok(ids('school').includes('set:walk-to-school')&&ids('school').includes('top:sailor'));
 assert.ok(ids('eisa').includes('top:festival')&&ids('eisa').includes('set:festival-coat'));
 assert.ok(ids('rain').includes('set:raincloud-rambler'));
 assert.ok(ids('Thao').includes('top:tee'));
 assert.ok(ids('sato ramen').includes('set:ramen-kitchen'));
 assert.ok(ids('Sakura Shoten').includes('set:shop-counter-smock'));
 assert.ok(ids('haarii').includes('set:haarii-crew'));
 assert.deepEqual(ids(''),[]);assert.deepEqual(ids('zzzz'),[]);
 const groups=searchWardrobe('police');assert.deepEqual(groups.map(g=>g.slot),['set','top','hat'],'results come grouped by slot, in tab order');
});
