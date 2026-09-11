import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';

test('Nozomi replaces only Reiko and remains grounded and seated through every clip',async()=>{
 installDOM();const previous={fetch:globalThis.fetch,bitmap:globalThis.createImageBitmap,self:globalThis.self};
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:512,height:512,close(){}});
 globalThis.fetch=async url=>{
  if(String(url).startsWith('blob:'))return previous.fetch(url);
  const name=new URL(url).pathname.split('/characters/')[1];assert.ok(name);
  return new Response(await readFile(new URL('../assets/characters/'+name,import.meta.url)));
 };
 try{
  const bytes=await readFile(new URL('../assets/characters/realistic/nozomi.glb',import.meta.url)),doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
  assert.ok(bytes.length<600000);assert.equal(doc.extras.triangles,1688);assert.equal(doc.extras.sourceDraws,57);assert.equal(doc.extras.draws,4);
  assert.equal(doc.meshes.length,4);assert.equal(doc.skins.length,1);assert.equal(doc.skins[0].joints.length,82);
  assert.equal(doc.asset.extras.author,'Kiklox (https://sketchfab.com/kiklox)');assert.match(doc.extras.sourceSHA256,/^[a-f0-9]{64}$/);
  for(const m of doc.materials){assert.ok(m.pbrMetallicRoughness.baseColorTexture);assert.equal(m.pbrMetallicRoughness.metallicFactor,0);}
  for(const image of doc.images){assert.ok(Number.isInteger(image.bufferView));assert.equal(image.uri,undefined);}
  const {preloadModels,createLocalCharacters}=await import('../src/people/models.js?snappy=1');
  assert.deepEqual(await preloadModels(),{ready:10,total:10});const models=createLocalCharacters(),scene=new THREE.Scene();
  const attach=name=>{const e=new THREE.Group();e.userData.name=name;scene.add(e);return models.attach(e,name);};
  const reiko=attach('Reiko'),sato=attach('Mrs Sato'),yuri=attach('Yuri');
  assert.ok(reiko.isNozomi);assert.equal(reiko.entity.userData.name,'Reiko');assert.ok(sato.neighbour);assert.ok(yuri.isYuri);
  assert.match(reiko.entity.userData.visualSource,/Nozomi/);assert.ok(reiko.cup);assert.ok(reiko.seatSupport);
  const point=new THREE.Vector3();
  for(const name of ['Idle_Neutral','Walk','Run','Wave','Sit','Eat','Drink']){
   assert.ok(reiko.actions.has(name));const action=reiko.actions.get(name);reiko.mixer.stopAllAction();action.reset().play();
   for(const fraction of [0,.125,.25,.5,.75,1]){
    reiko.mixer.setTime(action.getClip().duration*fraction);scene.updateMatrixWorld(true);let bottom=Infinity,top=-Infinity;
    reiko.model.traverse(m=>{if(!m.isSkinnedMesh)return;m.skeleton.update();
     const ids=m.geometry.attributes.skinIndex,weights=m.geometry.attributes.skinWeight;
     for(let i=0;i<m.geometry.attributes.position.count;i++){
      m.getVertexPosition(i,point).applyMatrix4(m.matrixWorld);assert.ok(point.toArray().every(Number.isFinite));assert.ok(Math.abs(point.x)<.8&&Math.abs(point.z)<1.1,'Bounded limb deformation');bottom=Math.min(bottom,point.y);top=Math.max(top,point.y);
      for(let k=0;k<4;k++)if(weights.array[i*4+k]>0)assert.ok(ids.array[i*4+k]<m.skeleton.bones.length);
     }
    });
    assert.ok(top>1.4&&top<1.9);
    if(!['Sit','Eat','Drink'].includes(name))assert.ok(Math.abs(bottom)<.008,`${name} floor contact: ${bottom}`);
   }
  }
  reiko.mixer.stopAllAction();reiko.current=null;reiko.entity.userData.seatHeight=.51;reiko.entity.userData.socialPose='Sit';models.update(.4);scene.updateMatrixWorld(true);
  const foot=reiko.entity.worldToLocal(reiko.model.getObjectByName('LeftFoot').getWorldPosition(point));assert.ok(foot.y>.05&&foot.y<.15);assert.ok(foot.z<-.3);
  let support=Infinity;for(const {mesh,index} of reiko.seatVertices){mesh.skeleton.update();mesh.getVertexPosition(index,point).applyMatrix4(mesh.matrixWorld);reiko.entity.worldToLocal(point);support=Math.min(support,point.y);}
  assert.ok(Math.abs(support-.51)<.005,'Seated skin rests on the chair');
  reiko.entity.userData.socialPose='Drink';models.update(.4);assert.ok(reiko.cup.visible);
  assert.ok(reiko.cup.getWorldQuaternion(new THREE.Quaternion()).angleTo(new THREE.Quaternion())<.001);
  delete reiko.entity.userData.seatHeight;delete reiko.entity.userData.socialPose;models.update(.4);assert.equal(reiko.model.position.y,reiko.floorOffset);
  // An unavailable optional appearance must preserve the established actor.
  const fetchReady=globalThis.fetch;globalThis.fetch=url=>String(url).includes('nozomi.glb')?Promise.resolve(new Response('',{status:503})):fetchReady(url);
  const fallback=await import('../src/people/models.js?fallback-nozomi=1');assert.deepEqual(await fallback.preloadModels(),{ready:9,total:10});
  const e=new THREE.Group();e.userData.name='Reiko';assert.ok(fallback.createLocalCharacters().attach(e,'Reiko').neighbour);
 }finally{globalThis.fetch=previous.fetch;globalThis.createImageBitmap=previous.bitmap;globalThis.self=previous.self;}
});
