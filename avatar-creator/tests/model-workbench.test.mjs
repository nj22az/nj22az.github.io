import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../../johansson-town/vendor/three.module.js';
import {auditSurfaces,snapConnector,snapGrid,glbDocument,loadModel,disposeModel} from '../../johansson-town/src/studio/model-workbench.js';

const triangle=(points,name='face')=>{const mesh=new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3)),new THREE.MeshBasicMaterial());mesh.name=name;return mesh;};
const near=(a,b,e=1e-5)=>assert.ok(Math.abs(a-b)<e,`${a} ≠ ${b}`);
test('connector snapping aligns the scaled source point and opposed normals, including a wall attachment',()=>{
 for(const normal of [[0,1,0],[1,0,0],[0,0,-1],[1,2,3]]){
  const source={point:[.2,.4,-.1],normal:[0,-1,0]},target={point:[3,2,-5],normal},r=snapConnector({source,target,scale:2,clearance:.002});
  const q=new THREE.Quaternion(...r.quaternion),n=new THREE.Vector3(...normal).normalize();
  const p=new THREE.Vector3(...source.point).multiplyScalar(2).applyQuaternion(q).add(new THREE.Vector3(...r.position));
  const expected=new THREE.Vector3(...target.point).addScaledVector(n,.002);near(p.distanceTo(expected),0);
  near(new THREE.Vector3(...source.normal).applyQuaternion(q).dot(n),-1);
 }
 assert.throws(()=>snapConnector({source:{point:[0,0,0],normal:[0,0,0]},target:{point:[0,0,0],normal:[0,1,0]}}),/cannot be zero/);
});
test('grid snapping honours a non-zero origin and validates inputs',()=>{
 assert.deepEqual(snapGrid({position:[.123,-.06,2.01],step:.05}),[.1,-.05,2]);
 assert.deepEqual(snapGrid({position:[.123,0,0],step:.05,origin:[.02,0,0]}),[.12,0,0]);
 assert.throws(()=>snapGrid({position:[NaN,0,0]}),/finite/);assert.throws(()=>snapGrid({position:[0,0,0],step:0}),/Grid step/);
});
test('connector up vectors preserve the intended roll rather than choosing a different turn at each join',()=>{
 const source={point:[0,0,0],normal:[0,0,1],up:[0,1,0]},target={point:[0,0,0],normal:[0,0,-1],up:[1,0,0]};
 const r=snapConnector({source,target}),q=new THREE.Quaternion(...r.quaternion);
 near(new THREE.Vector3(...source.up).applyQuaternion(q).distanceTo(new THREE.Vector3(...target.up)),0);
 assert.throws(()=>snapConnector({source:{...source,up:[0,0,1]},target}),/parallel/);
});
test('surface scan finds true coplanar overlap in transformed meshes but ignores shared edges',()=>{
 const root=new THREE.Group();root.add(triangle([[0,0,0],[1,0,0],[0,1,0]],'a'),triangle([[1,0,0],[1,1,0],[0,1,0]],'adjacent'));
 assert.equal(auditSurfaces(root).ok,true);
 const overlap=triangle([[0,0,0],[.5,0,0],[0,.5,0]],'overlap');overlap.position.z=.0005;root.add(overlap);
 const report=auditSurfaces(root);assert.equal(report.ok,false);assert.equal(report.complete,true);assert.equal(report.findings.length,1);
 overlap.position.z=.01;assert.equal(auditSurfaces(root).ok,true);
 root.rotation.y=.8;overlap.position.z=.0005;assert.equal(auditSurfaces(root).findings.length,1);
});
test('broad-phase box intersection alone does not report a triangle overlap',()=>{
 const root=new THREE.Group();root.add(triangle([[0,0,0],[1,0,0],[0,1,0]]),triangle([[.8,.8,0],[1.8,.8,0],[.8,1.8,0]]));
 assert.equal(auditSurfaces(root).ok,true);
});
test('surface scan flags incomplete budgets and unsupported meshes, and reports biased overlap',()=>{
 const root=new THREE.Group(),a=triangle([[0,0,0],[1,0,0],[0,1,0]]),b=a.clone();b.material=a.material.clone();b.material.polygonOffset=true;root.add(a,b);
 assert.equal(auditSurfaces(root).findings[0].depthBias,true);assert.equal(auditSurfaces(root,{maxTriangles:1}).complete,false);
 b.visible=false;assert.equal(auditSurfaces(root).ok,true);b.visible=true;b.material.depthWrite=false;assert.equal(auditSurfaces(root).ok,true);
 const instanced=new THREE.InstancedMesh(a.geometry,a.material,1);root.add(instanced);assert.equal(auditSurfaces(root).complete,false);
});
export function fixtureGLB(extra={}){
 const data=new Float32Array([0,0,0,1,0,0,0,1,0]),doc={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name:'Fixture triangle'}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],buffers:[{byteLength:data.byteLength}],bufferViews:[{buffer:0,byteLength:data.byteLength}],accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[0,0,0],max:[1,1,0]}],...extra};
 let json=JSON.stringify(doc);while(json.length%4)json+=' ';
 const out=new Uint8Array(12+8+json.length+8+data.byteLength),view=new DataView(out.buffer);view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,out.length,true);view.setUint32(12,json.length,true);view.setUint32(16,0x4e4f534a,true);out.set(new TextEncoder().encode(json),20);view.setUint32(20+json.length,data.byteLength,true);view.setUint32(24+json.length,0x004e4942,true);out.set(new Uint8Array(data.buffer),28+json.length);return out;
}
test('GLB input checks refuse external resources and animated/rigged files explicitly',()=>{
 assert.equal(glbDocument(fixtureGLB()).asset.version,'2.0');
 for(const extra of [{images:[{uri:'https://example.com/a.png'}]},{skins:[{}]},{animations:[{}]},{extensionsRequired:['KHR_draco_mesh_compression']}])assert.throws(()=>glbDocument(fixtureGLB(extra)));
 const invalid=fixtureGLB();new DataView(invalid.buffer).setUint32(8,20,true);assert.throws(()=>glbDocument(invalid),/length/);
});
test('model preparation applies metre scale, floor origin and requested offset without altering source bytes',async()=>{
 const bytes=fixtureGLB(),copy=bytes.slice(),root=await loadModel(bytes,{scale:2,position:[3,4,5],ground:true});
 try{const b=new THREE.Box3().setFromObject(root);near(b.min.y,4);near(b.min.x,2);near(b.max.x,4);near(b.min.z,5);assert.deepEqual(bytes,copy);}finally{disposeModel(root);}
});
