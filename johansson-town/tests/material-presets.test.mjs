import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildAvatar} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {encodeRecipe,decodeRecipe,normalizeRecipe} from '../src/avatars/recipe.js';
import {createAvatarMaterialStudy,createPresetMaterial} from '../src/avatars/material-presets.js';
installDOM();

test('old designs retain one toon body, and study batches preserve every vertex, rig and hat draw range',()=>{
 for(const name of ['Thuan','Johansson','Officer Mori']){
  const recipe=decodeRecipe(encodeRecipe(recipeFor(name))),legacy=buildAvatar(recipe,{shadows:false}),a=buildAvatar(recipe,{shadows:false,materialStudy:true}),original=a.body.geometry,source=a.body.material;
  assert.equal(legacy.body.material.type,'MeshToonMaterial');assert.equal(legacy.body.userData.materialRegions,undefined);
  for(const key of ['position','normal','color','uv','skinIndex','skinWeight'])assert.deepEqual(original.attributes[key].array,legacy.body.geometry.attributes[key].array,key+' unchanged');
  const study=createAvatarMaterialStudy(a);study.set({mode:'enhanced'});
  assert.equal(a.body.geometry.attributes.position,original.attributes.position);assert.equal(a.body.geometry.attributes.skinWeight,original.attributes.skinWeight);
  assert.equal(a.body.geometry.index.count,original.attributes.position.count);
  assert.equal(new Set(a.body.geometry.index.array).size,original.attributes.position.count,'each triangle corner appears exactly once');
  assert.ok(a.body.geometry.groups.length<=5);assert.equal(a.body.material[1].type,'MeshPhysicalMaterial');
  if(a.hasHat){a.setHat(false);study.refresh();assert.equal(a.body.geometry.drawRange.count,original.drawRange.count);const hat=a.userData?.hatStart??a.body.userData.materialHatStart;for(let i=0;i<hat;i++)assert.ok(a.body.geometry.index.getX(i)<hat,'hidden hat stays at the end of the index');}
  study.set({mode:'legacy'});assert.equal(a.body.geometry,original);assert.equal(a.body.material,source);assert.deepEqual(a.recipe,recipe);
  study.dispose();a.dispose();legacy.dispose();
 }
});
test('skin, hair and cloth are semantic surfaces even when their colours match',()=>{
 const r=normalizeRecipe({...recipeFor('Thuan'),body:{skin:'#d8b591'},hair:{colour:'#d8b591'},outfit:{topColour:'#d8b591',bottomColour:'#d8b591'}}),a=buildAvatar(r,{materialStudy:true,shadows:false});
 const counts=new Map();for(const r of a.body.userData.materialRegions)counts.set(r.materialIndex,(counts.get(r.materialIndex)||0)+r.count);
 assert.ok(counts.get(1)>100);assert.ok(counts.get(2)>100);assert.ok(counts.get(3)>100);
 a.dispose();
});
test('finish changes are local, bounded, reversible and dispose only preview-owned materials',()=>{
 const a=buildAvatar(recipeFor('Thuan'),{materialStudy:true,shadows:false}),b=buildAvatar(recipeFor('Thuan'),{materialStudy:true,shadows:false}),study=createAvatarMaterialStudy(a),source=a.body.material,other=b.body.material;
 study.set({mode:'enhanced',cloth:'satin'});assert.ok(a.body.material[3].sheenColor.getHex()>0,'satin sheen is visible rather than the engine default black');a.body.material[1].color.set('#fae0aa');assert.equal(b.body.material,other);assert.notEqual(a.body.material[1].color.getHex(),other.color.getHex());
 let texturesDisposed=0;source.map.addEventListener('dispose',()=>texturesDisposed++);let materialDisposed=0;for(const m of a.body.material.slice(1))m.addEventListener('dispose',()=>materialDisposed++);
 a.wear('swim');study.refresh();assert.equal(a.body.material,source);assert.equal(study.state.active,false);
 a.wear('clothes');study.refresh();assert.equal(study.state.active,true);assert.equal(study.state.cloth,'satin');
 study.dispose();study.dispose();assert.equal(a.body.material,source);assert.equal(texturesDisposed,0);assert.equal(materialDisposed,3);
 assert.equal(createPresetMaterial(source,'skin',{roughness:-2}).roughness,.35);assert.equal(createPresetMaterial(source,'cotton',{roughness:5}).roughness,1);
 a.dispose();b.dispose();assert.equal(texturesDisposed,1);
});
test('avatar cleanup releases its shared skeleton texture as well as preview materials',()=>{
 const a=buildAvatar(recipeFor('Thuan'),{shadows:false});a.body.skeleton.computeBoneTexture();const texture=a.body.skeleton.boneTexture;let disposed=0;texture.addEventListener('dispose',()=>disposed++);a.dispose();assert.equal(disposed,1);assert.equal(a.body.skeleton.boneTexture,null);
});
