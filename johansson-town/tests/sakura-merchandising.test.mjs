import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MERCHANDISING,ZONES,ZONE_OF_SHELF,linesFor} from '../src/commerce/merchandising.js';
import {SHOP_STOCK} from '../src/commerce/shop-stock.js';
import {SAKURA_SHELVES} from '../src/world/interiors/sakura-layout.js';

const residents=new Set(JSON.parse(await readFile(new URL('../guide/residents.json',import.meta.url))).map(r=>r.name));

test('every line in Sakura is there for somebody, for a reason, in its place',()=>{
 for(const item of SHOP_STOCK){
  const m=MERCHANDISING[item.id];assert.ok(m,item.id+' has a reason to be stocked');
  assert.ok(ZONES[m.zone],item.id+' belongs to a zone of the floor');
  assert.ok(m.why.length>20&&m.placed.length>20,item.id+' says why it is bought and why it stands there');
  assert.ok(m.for.length>=1&&m.for.every(n=>residents.has(n)),item.id+' is bought by people who live here: '+m.for.join(', '));
  const shelf=SAKURA_SHELVES[item.id];assert.ok(shelf,item.id+' is on a shelf');
  assert.equal(ZONE_OF_SHELF[shelf.fitting],m.zone,item.id+' stands in the '+m.zone+' zone');
 }
 assert.deepEqual(Object.keys(MERCHANDISING).sort(),SHOP_STOCK.map(i=>i.id).sort(),'Nothing is stocked without a line, and no line without stock');
});

test('the floor follows its philosophy',()=>{
 const level=id=>Math.min(...SAKURA_SHELVES[id].levels);
 // Children's sweets low, a grown-up's snacks higher.
 assert.ok(level('candy')<level('chips'),'Sweets for children sit below the crisps');
 // Beer in the column nearest the till; the bestselling drink first.
 assert.equal(SAKURA_SHELVES.beer.fridge,3);assert.equal(SAKURA_SHELVES.tea.fridge,0);
 // The heaviest thing in the shop goes low.
 assert.equal(level('detergent'),Math.min(...Object.values(SAKURA_SHELVES).filter(s=>s.fitting==='east').map(s=>Math.min(...s.levels))));
 // Most people in town have a reason to come in.
 const shoppers=[...residents].filter(n=>linesFor(n).length);assert.ok(shoppers.length>=residents.size*.75,'Most of the town shops here: '+shoppers.length+'/'+residents.size);
});
