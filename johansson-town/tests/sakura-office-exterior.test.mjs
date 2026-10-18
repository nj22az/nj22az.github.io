import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildThuanFlat} from '../src/world/thuan-flat.js';

function office(){
 const town=new THREE.Group(),store=new THREE.Group(),sites=[],colliders=[];
 store.position.set(-7.45,0,-27.3);store.rotation.y=Math.PI/2;town.add(store);
 const {site}=buildThuanFlat(store,{sites,colliders});town.updateMatrixWorld(true);
 return {town,store,site,colliders};
}

test('exterior trim leaves seated town and harbour sightlines open',()=>{
 const {town,store,site,colliders}=office();
 const solid=[];town.traverse(o=>{if(o.isMesh&&!/glazing/.test(o.name))solid.push(o);});
 for(const [from,to] of [[[.8,5.51,-3],[.8,5.51,0]],[[4.1,5.13,-2.3],[7,5.13,-2.3]]]){
  const a=store.localToWorld(new THREE.Vector3(...from)),b=store.localToWorld(new THREE.Vector3(...to));
  const ray=new THREE.Raycaster(a,b.clone().sub(a).normalize(),0,a.distanceTo(b));
  assert.equal(ray.intersectObjects(solid).length,0,'window must remain clear at seated eye height');
 }
 assert.deepEqual(site.door,[-18.8,4.01,-26.66]);assert.equal(site.officePortals.length,2);
 assert.equal(colliders.length,0,'facade adds no obstacles to the working stairs');
});

test('upper facade uses batched geometry and the existing dusk circuit',()=>{
 const {town}=office();let meshes=0,vertices=0,lights=0;const panes=[];
 town.traverse(o=>{if(o.isLight)lights++;if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;if(/glazing/.test(o.name))panes.push(o);}});
 assert.ok(meshes<=8,`${meshes} exterior draw meshes`);assert.ok(vertices<16000,`${vertices} vertices`);assert.equal(lights,0);
 assert.equal(panes.length,2);assert.equal(panes[0].material,panes[1].material);
 assert.equal(panes[0].material.userData.kitFinish,'glow','both outlooks join the existing window dusk updates');
 assert.ok(panes[0].material.emissive.getHex()>0);
});
