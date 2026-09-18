import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildPeninsula} from '../src/world/peninsula.js';
import {routeAt,groundHeight} from '../src/world/layout.js?snappy=1';
import {laneEdges,buildLaneSurfaces} from '../src/world/lane-surfaces.js';
import {buildPark} from '../src/world/park.js';

test('peninsula ground leaves the surrounding sea uncovered and supports the Main Street homes',()=>{
 const group=new THREE.Group(),ground=buildPeninsula(group);group.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(),hit=(x,z)=>{ray.set(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ground).length>0;};
 assert.ok(hit(0,0));assert.equal(hit(0,100),false,'Sea separates the northern coast from the distant islands');
 for(const p of [[-55,0],[57,0],[0,-70],[30,95]])assert.equal(hit(...p),false,'Sea is exposed');
 for(const p of [[-12,24],[-12,4],[-12,-15]])assert.ok(hit(...p),'The new frontage has continuous land underneath');
});

test('park shortcut has continuous walkable ground matching its visible ramp',()=>{
 // The compact park paves its own ramp through buildPark rather than through the
 // lane surfaces, so both have to stand for the walkable ground to be visible.
 const group=new THREE.Group();buildLaneSurfaces(group,{worldMaterial:()=>new THREE.MeshStandardMaterial()});
 buildPark({group,colliders:[],landmarks:[]},{worldMaterial:()=>new THREE.MeshStandardMaterial(),register(){},onAction(){}});
 group.updateMatrixWorld(true);
 const paving=[];group.traverse(o=>{if(o.isMesh)paving.push(o);});
 const ray=new THREE.Raycaster();
 let previous=null;
 for(let x=16;x<=22.2;x+=.1){
  assert.ok(routeAt(x,-27,.28));
  ray.set(new THREE.Vector3(x,10,-27),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(paving)[0];
  assert.ok(hit,'visible ground at '+x.toFixed(1));
  assert.ok(Math.abs(hit.point.y-groundHeight(x,-27)-.04)<.06,'Ramp matches walking height at '+x.toFixed(1));
  // The compact park sits raised, so this stretch descends from the park rather
  // than starting at zero. What matters is that it descends without a step.
  const height=groundHeight(x,-27);
  if(previous!==null)assert.ok(Math.abs(height-previous)<.05,'Ramp has no step at '+x.toFixed(1));
  previous=height;
 }
 assert.ok(groundHeight(16,-27)>groundHeight(22.2,-27),'Shortcut falls away from the raised park');
 assert.ok(Math.abs(groundHeight(22.199,-27)-groundHeight(22.2,-27))<.002);
});

test('lane boundaries leave walking routes and junctions open',()=>{
 const edges=laneEdges();assert.ok(edges.length>0);
 for(const e of edges){assert.ok(!routeAt(e.x,e.z),'A lane boundary stands on walkable ground');assert.ok(Number.isFinite(e.y));}
});
