import assert from 'node:assert/strict';
import {test} from 'node:test';
import {normalRecipe} from '../looks-gl.js';
import {FAMILIES,familyFor,variantFor,selectVariant,normalScreen,screenActive,familyTileVisible} from '../look-settings.js';
test('legacy recipes keep their exact layer shape and do not gain a display pass',()=>{
 for(const look of ['pocket','crt','snes','riso','manga']){
  const layer=normalRecipe({layers:[{look,amount:.6}]}).layers[0];
  assert.deepEqual(layer,{look,amount:.6});assert.equal(screenActive(layer),false);
 }
});
test('every family variant round trips through saved recipe JSON, within a single layer',()=>{
 for(const family of FAMILIES)for(const [variant] of family.variants){
  const layer={look:family.looks[0],amount:.45};assert.ok(selectVariant(layer,variant));
  const r=normalRecipe(JSON.parse(JSON.stringify({layers:[layer]})));
  assert.equal(variantFor(r.layers[0]),variant);assert.equal(r.layers.length,1);assert.equal(r.layers[0].amount,.45);
 }
});
test('screen settings are bounded, finite, deep copied and limited to relevant Looks',()=>{
 const screen={mode:'crt',scanlines:2,glow:NaN,curve:-4,mask:Infinity};
 const r=normalRecipe({layers:[{look:'snes',screen},{look:'manga',screen,handheld:'light'}]});
 assert.deepEqual(r.layers[0].screen,{mode:'crt',scanlines:1,glow:0,curve:0,mask:0});assert.ok(screenActive(r.layers[0]));
 assert.deepEqual(r.layers[1],{look:'manga',amount:1});assert.equal(screen.scanlines,2);
 assert.deepEqual(normalScreen({mode:'invalid',glow:'1'}),{mode:'none',scanlines:0,glow:0,curve:0,mask:0});
 assert.equal(screenActive({look:'snes',screen:{mode:'crt'}}),false);
});
test('changing a model keeps its family screen, removes the previous palette and rejects foreign choices',()=>{
 const layer={look:'pocket',handheld:'light',screen:{mode:'lcd'},amount:1};
 assert.equal(selectVariant(layer,'snes'),false);assert.equal(layer.handheld,'light');
 assert.ok(selectVariant(layer,'colourHandheld'));assert.deepEqual(layer,{look:'colourHandheld',screen:{mode:'lcd'},amount:1});
});
test('each family offers one tile, including the actual selected variant',()=>{
 for(const family of FAMILIES)for(const selected of ['none',...family.looks]){
  const visible=family.looks.filter(name=>familyTileVisible(name,selected));
  assert.deepEqual(visible,[family.looks.includes(selected)?selected:family.looks[0]]);
 }
 assert.equal(familyFor('manga'),undefined);
});
