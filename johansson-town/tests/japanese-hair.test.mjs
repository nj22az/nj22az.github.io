import test from 'node:test';
import assert from 'node:assert/strict';
import {JAPANESE_HAIR} from '../src/avatars/japanese-hair-mesh.js';
import {PARTS,normalizeRecipe,encodeRecipe,decodeRecipe} from '../src/avatars/recipe.js';
import {buildAvatar} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {installDOM} from './fixtures.mjs';

test('twelve original styles have distinct topology and survive recipe sharing',()=>{
 const fingerprints=new Set();assert.equal(Object.keys(JAPANESE_HAIR).length,12);
 for(const [style,parts] of Object.entries(JAPANESE_HAIR)){
  assert.ok(PARTS.hair.includes(style));fingerprints.add(JSON.stringify(parts));
  for(const p of parts){assert.equal(p.indices.length%3,0);assert.ok(p.indices.every(i=>Number.isInteger(i)&&i>=0&&i<p.vertices.length));assert.ok(p.vertices.flat().every(Number.isFinite));}
  const r=normalizeRecipe({...recipeFor('Thuan'),hair:{style,colour:'#e0c078',flip:true}});assert.deepEqual(decodeRecipe(encodeRecipe(r)),r);
 }assert.equal(fingerprints.size,12);
});
test('Japanese hair fits all head forms, part directions and shared bodies; hanging locks animate',()=>{
 installDOM();
 for(const [style,parts] of Object.entries(JAPANESE_HAIR))for(const form of PARTS.head)for(const [name,flip] of [['Chin',false],['Thuan',true]]){
  const original=recipeFor(name),recipe=normalizeRecipe({...original,head:{...original.head,form},hair:{...original.hair,style,flip}});const a=buildAvatar(recipe,{faceSize:64});
  assert.ok(a.body.geometry.attributes.position.array.every(Number.isFinite));assert.deepEqual(a.recipe.eyes,original.eyes);assert.deepEqual(a.recipe.outfit,original.outfit);
  if(parts.some(p=>p.kind==='tail'))assert.ok(a.springSetup.chains.some(c=>c.kind==='hair'),style);
  a.dispose();
 }
});
test('Ruta retains the blonde visitor identity and Nhung has her requested straw hat',()=>{
 const ruta=recipeFor('Ruta'),legacy=recipeFor('Harbour visitor');assert.deepEqual(ruta,legacy);assert.equal(ruta.name,'Ruta');assert.equal(ruta.hair.style,'jplayered');assert.equal(ruta.eyes.style,'doe');assert.equal(ruta.hair.colour,'#caa568');assert.equal(recipeFor('Nhung').outfit.hat,'straw');assert.equal(recipeFor('Thuan').hair.style,'sweptponytail');
});
