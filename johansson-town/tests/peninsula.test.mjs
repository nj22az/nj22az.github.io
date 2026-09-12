import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildPeninsula} from '../src/world/peninsula.js';
import {RESIDENTIAL_CANAL} from '../src/world/residential-layout.js';
import {routeAt,groundHeight} from '../src/world/layout.js?snappy=1';
import {laneEdges,buildLaneSurfaces} from '../src/world/lane-surfaces.js';

test('peninsula ground leaves the surrounding sea and residential canal uncovered',()=>{
 const group=new THREE.Group(),ground=buildPeninsula(group);group.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(),hit=(x,z)=>{ray.set(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ground).length>0;};
 assert.ok(hit(0,0));assert.ok(hit(0,100),'Northern neck joins the mainland');
 for(const p of [[-55,0],[57,0],[0,-70],[30,95]])assert.equal(hit(...p),false,'Sea is exposed');
 const c=RESIDENTIAL_CANAL;assert.equal(hit((c.minX+c.maxX)/2,(c.minZ+c.maxZ)/2),false,'Canal remains open');
});

test('park shortcut has continuous walkable ground matching its visible ramp',()=>{
 const group=new THREE.Group();buildLaneSurfaces(group,{worldMaterial:()=>new THREE.MeshStandardMaterial()});group.updateMatrixWorld(true);
 const paving=group.children.filter(o=>o.name.startsWith('grid-lanes:')),ray=new THREE.Raycaster();
 for(let x=16;x<=21;x+=.1){assert.ok(routeAt(x,-38,.28));ray.set(new THREE.Vector3(x,10,-38),new THREE.Vector3(0,-1,0));const hit=ray.intersectObjects(paving)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-groundHeight(x,-38)-.04)<.06,'Ramp matches walking height at '+x);}
 assert.equal(groundHeight(17.5,-38),0);assert.ok(Math.abs(groundHeight(20.999,-38)-groundHeight(21,-38))<.002);
});

test('lane boundaries leave walking routes and junctions open',()=>{
 const edges=laneEdges();assert.ok(edges.length>0);
 for(const e of edges){assert.equal(routeAt(e.x,e.z),undefined);assert.ok(Number.isFinite(e.y));}
});
