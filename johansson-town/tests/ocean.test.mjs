import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {addHorizon} from '../src/world/horizon.js';
import {createHarbourBasin,createSurroundingOcean,isOceanMaterial,tickOcean} from '../src/world/ocean.js';
import {buildPeninsula} from '../src/world/peninsula.js';

test('surrounding sea is cel-shaded Gerstner water around the peninsula',()=>{
  const group=new THREE.Group();
  addHorizon(group);
  buildPeninsula(group);
  let sea=null;
  group.traverse(o=>{if(o.name==='Peninsula surrounding sea')sea=o;});
  assert.ok(sea);
  assert.ok(isOceanMaterial(sea.material));
  assert.equal(sea.position.y,-.56);
  const ray=new THREE.Raycaster();
  const hit=(x,z)=>{ray.set(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(sea,false).length>0;};
  assert.ok(hit(0,100),'Open water north of the coast');
  assert.ok(hit(-80,0),'Open water west of the headland');
  tickOcean(1.4);
  assert.equal(sea.material.uniforms.uTime.value,1.4);
});

test('harbour basin shares the same ocean material',()=>{
  const basin=createHarbourBasin();
  const surround=createSurroundingOcean();
  assert.equal(basin.material,surround.material);
  assert.equal(basin.geometry.parameters.width,160);
  assert.equal(basin.geometry.parameters.height,86);
});
