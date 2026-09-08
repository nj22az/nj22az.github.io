import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {smoothCharacterNormals} from '../src/people/surface.js';
import {merchantRoofGeometry} from '../src/world/merchant-roofs.js';
import {batchStaticProps} from '../src/render/static-props.js';

test('normal smoothing retains geometry and sharp corners',()=>{
 const rounded=new THREE.IcosahedronGeometry(1,1);rounded.computeVertexNormals();const positions=rounded.attributes.position.array.slice(),triangles=positions.length/9;
 const result=smoothCharacterNormals(rounded);assert.ok(result.changed>0);assert.deepEqual(rounded.attributes.position.array,positions);assert.equal(rounded.attributes.position.count/3,triangles);
 const n=rounded.attributes.normal;for(let i=0;i<n.count;i++)assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-6);
 const cube=new THREE.BoxGeometry(1,1,1),before=cube.attributes.normal.array.slice();smoothCharacterNormals(cube);assert.deepEqual(cube.attributes.normal.array,before);
});
test('merchant roofs have finite geometry and distinct bounded silhouettes',()=>{
 const counts=[];for(const kind of ['hipped','curved-gable','low-gable']){const geometry=merchantRoofGeometry(kind);geometry.computeBoundingBox();assert.ok(geometry.attributes.position.array.every(Number.isFinite));assert.ok(geometry.attributes.normal.array.every(Number.isFinite));assert.ok(geometry.boundingBox.min.x>=-4.61&&geometry.boundingBox.max.x<=4.61);assert.ok(geometry.boundingBox.min.z>=-5.41&&geometry.boundingBox.max.z<=5.41);assert.ok(geometry.boundingBox.max.y<=1.53);counts.push(geometry.attributes.position.count);}assert.equal(new Set(counts).size,3);
});
test('static batching preserves transformed vertices and interaction anchors; trolley stays live',()=>{
 const root=new THREE.Group();root.position.set(3,0,2);const prop=new THREE.Group();prop.position.set(2,0,2);prop.rotation.y=.4;root.add(prop);const material=new THREE.MeshStandardMaterial({color:0x887766}),objects=[],expected=[];
 for(let i=0;i<3;i++){const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,.5,.5),material);mesh.userData.staticProp=true;mesh.userData.hit={label:'Inspect',fn(){}};mesh.position.set(i,1,0);mesh.scale.set(1,1.2,1);prop.add(mesh);objects.push(mesh);}
 const trolley=new THREE.Group();trolley.name='prop:delivery-trolley';root.add(trolley);const moving=objects[0].clone();moving.userData.staticProp=true;trolley.add(moving);
 root.updateMatrixWorld(true);for(const mesh of objects){const geometry=mesh.geometry.toNonIndexed(),p=geometry.attributes.position;for(let i=0;i<p.count;i++)expected.push(root.worldToLocal(mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(p,i))));}
 const report=batchStaticProps(root);assert.equal(report.sourceMeshes,3);assert.equal(report.drawsSaved,2);assert.ok(moving.layers.test(new THREE.Layers()));
 for(const o of objects){assert.equal(o.visible,true);assert.equal(o.userData.hit.label,'Inspect');assert.equal(o.layers.test(new THREE.Layers()),false);}
 const merged=root.children.find(o=>o.name.startsWith('static-props:'));assert.ok(merged);const p=merged.geometry.attributes.position;assert.equal(p.count,expected.length);for(let i=0;i<p.count;i++)assert.ok(new THREE.Vector3().fromBufferAttribute(p,i).distanceTo(expected[i])<1e-5);
});
