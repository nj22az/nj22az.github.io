import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createTown} from '../src/world/town.js?snappy=1';
import {createTownSky} from '../src/render/sky.js';
import {installDOM} from './fixtures.mjs';
import {groundHeight,OUTER_PIER} from '../src/world/layout.js?snappy=1';

test('street has no transparent canopy sheets and phones retain bounded night lighting',()=>{
 installDOM();const scene=new THREE.Scene();
 const world=createTown({scene,sites:[],mobile:true,shadows:false,register(){},enter(){},onAction(){}});
 const pier=world.group.getObjectByName('pier-concrete-surface');
 assert.equal(groundHeight(0,-70),pier.position.y,'Physics and visible pier share the same height');
 assert.equal(world.people.find(p=>p.g.userData.name==='Harbour master').g.position.y,pier.position.y,'Initial standing resident is grounded before moving');
 assert.equal(groundHeight(0,-52),0,'Boardwalk remains flush');
 assert.equal(groundHeight(0,-60),0,'Approach is not raised with the pier');
 for(const z of [-64,-70,-78])assert.equal(groundHeight(2,z),OUTER_PIER.height);
 const barriers=[],lights=[];world.group.updateMatrixWorld(true);
 world.group.traverse(o=>{
  if(o.isPointLight&&o.userData.nightIntensity)lights.push(o);
  if(o.isMesh&&o.geometry.type==='CylinderGeometry'&&o.material.transparent){const b=new THREE.Box3().setFromObject(o);if(b.min.y<2&&b.max.x-b.min.x>5)barriers.push(o);}
 });
 assert.equal(barriers.length,0,'No street-wide vertical transparent surfaces');
 assert.equal(lights.length,4);assert.ok(lights.every(l=>!l.castShadow));
 world.update(0,0,0,1271);assert.ok(lights.every(l=>l.intensity===18));
 world.update(0,0,1,1002);assert.ok(lights.every(l=>l.intensity===0));
});
test('sky is one opaque backdrop, follows the camera and is hidden indoors',()=>{
 const scene=new THREE.Scene(),sky=createTownSky(scene),camera=new THREE.PerspectiveCamera();camera.position.set(4,2,-20);
 sky.update(camera,1,false,false);assert.equal(scene.children.length,1);assert.equal(sky.mesh.material.transparent,false);assert.equal(sky.mesh.material.depthWrite,false);assert.ok(sky.mesh.position.equals(camera.position));
 const day=sky.mesh.material.color.clone();sky.update(camera,0,true,false);assert.ok(sky.mesh.material.color.r<day.r);
 sky.update(camera,1,false,true);assert.equal(sky.mesh.visible,false);
});
