import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';

test('Nozomi and Aya retain their identities on low-poly rigs, including retries and historical names',async()=>{
 installDOM();const previous=globalThis.fetch,requests=[];let failFormal=true;
 globalThis.fetch=async input=>{
  const url=String(input.url||input);requests.push(url);
  assert.doesNotMatch(url,/realistic|vroid/,'Superseded character assets cannot be requested');
  if(url.includes('town-female_formal')&&failFormal)return new Response('',{status:503});
  return new Response(await readFile(new URL('../assets/characters/'+new URL(url).pathname.split('/characters/')[1],import.meta.url)));
 };
 try{
  const {preloadModels,preloadModel,preloadCharacter,createLocalCharacters}=await import('../src/people/models.js?nozomi-low-poly=1');
  for(const id of ['aya','nozomi','vroid-bob'])assert.equal(await preloadModel(id),false);
  assert.equal(requests.length,0);
  assert.deepEqual(await preloadModels(),{ready:4,total:5});
  const scene=new THREE.Scene(),models=createLocalCharacters(),reikoEntity=new THREE.Group();reikoEntity.userData.name='Reiko';scene.add(reikoEntity);
  assert.equal(models.attach(reikoEntity,'Reiko'),null);assert.equal(reikoEntity.children.length,0);
  failFormal=false;assert.equal(await preloadCharacter('Nozomi'),true);
  const reiko=models.attach(reikoEntity,'Reiko');assert.ok(reiko.lowPoly&&reiko.isNozomi);assert.match(reikoEntity.userData.visualSource,/PSX low-poly.*Nozomi/);
  assert.ok(reiko.model.getObjectByName('resident-headband-scarf'));
  const body=actor=>{let skin;actor.model.traverse(o=>{if(o.isSkinnedMesh)skin=o;});return skin;};
  const attach=name=>{const entity=new THREE.Group();entity.userData.name=name;scene.add(entity);return models.attach(entity,name);};
  const nozomi=attach('Nozomi'),sato=attach('Mrs Sato'),aya=attach('Aya'),aiko=attach('Aiko'),yuri=attach('Yuri');
  for(const [a,b] of [[reiko,nozomi],[aya,aiko]]){
   assert.ok(a.lowPoly&&b.lowPoly);assert.equal(a.height,b.height);
   assert.equal(body(a).geometry.attributes.position,body(b).geometry.attributes.position);
   assert.notEqual(body(a).skeleton,body(b).skeleton);
   assert.deepEqual(body(a).geometry.attributes.color.array,body(b).geometry.attributes.color.array);
  }
  for(const [a,b] of [[reiko,sato],[aya,yuri]])assert.notDeepEqual(body(a).geometry.attributes.color.array,body(b).geometry.attributes.color.array,'Shared rigs keep distinct resident palettes');
  assert.ok(aya.isAya&&aiko.isAya);assert.ok(aya.model.getObjectByName('resident-ponytail-satchel'));
  assert.equal(requests.filter(url=>url.includes('town-female_formal')).length,2,'Only the failed shared body is retried');
  assert.equal(requests.filter(url=>url.includes('town-female_casual')).length,1,'Yuri and Aya share one asset download');
 }finally{globalThis.fetch=previous;}
});
