import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildSakuraRebuild} from '../src/world/interiors/sakura-rebuild.js';
import {buildSakuraRoof} from '../src/world/interiors/sakura-roof.js';
import {PRODUCTS} from '../src/commerce/products-data.js';
import DATA from '../src/world/interiors/sakura-atmosphere.json' with {type:'json'};

test('atmosphere preserves counted stock, rotates only three rice balls and restores those exact matrices',()=>{
 installDOM();const room=new THREE.Group(),d=buildSakuraRebuild({room,reg(){},action(){},exit(){}}),rice=room.getObjectByName('Sakura rice goods'),art=room.getObjectByName('Sakura rice packaging'),wrapper=room.getObjectByName('Sakura rice clear wrapper'),m=new THREE.Matrix4(),a=new THREE.Matrix4(),q=new THREE.Quaternion(),p=new THREE.Vector3(),s=new THREE.Vector3(),changed=[];
 assert.equal(d.unitPositions.size,780);assert.deepEqual(d.stock.records.map(r=>r.id).sort(),PRODUCTS.map(p=>p.id).sort());assert.equal(rice.count,36);
 for(let i=0;i<rice.count;i++){rice.getMatrixAt(i,m);m.decompose(p,q,s);const w=DATA.riceWobble.find(w=>(1*2+w.row)*6+w.column===i);if(w){const want=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2+w.degrees*Math.PI/180);assert.ok(q.angleTo(want)<1e-6);changed.push(i);}else assert.ok(q.angleTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2))<1e-6);art.getMatrixAt(i,a);assert.ok(m.equals(a));if(wrapper){wrapper.getMatrixAt(i,a);assert.ok(m.equals(a));}}
 assert.equal(DATA.counter.chopsticks.bottom,DATA.counter.top,'holder must touch the worktop');assert.equal(changed.length,3);rice.getMatrixAt(23,m);d.updateStock({rice:{shelf:22}});rice.getMatrixAt(23,a);assert.equal(new THREE.Vector3().setFromMatrixScale(a).length(),0);d.updateStock({rice:{shelf:24}});rice.getMatrixAt(23,a);assert.ok(m.equals(a));assert.ok(room.getObjectByName('Sakura hot oden crayon tag'));assert.equal(d.atmosphere.userData.stockChanges,false);
 const contacts=[];d.atmosphere.traverse(o=>{if(o.name==='Sakura soft contact footprints')contacts.push(o);});assert.equal(contacts.length,1);assert.equal(contacts[0].material.depthWrite,false);assert.equal(contacts[0].material.polygonOffset,true);assert.ok(contacts[0].material.opacity<.2);
});
test('roof maintenance pads and return crates follow audited schedule without new routes or lights',()=>{
 installDOM();const roof=buildSakuraRoof(new THREE.Group()),g=roof.getObjectByName('Sakura roof maintenance dressing');assert.ok(g);assert.equal(g.userData.crates.count,3);assert.equal(g.userData.routeChanges,false);assert.equal(g.userData.tiles,32);let lights=0;g.traverse(o=>{if(o.isLight)lights++;});assert.equal(lights,0);
 assert.deepEqual(DATA,JSON.parse(readFileSync(new URL('../docs/qa/sakura-atmosphere/schedule.json',import.meta.url))));
 const crateBox=new THREE.Box3();g.updateMatrixWorld(true);g.traverse(o=>{if(o.isMesh&&[0xc7aa4e,0x497f9d].includes(o.material.color?.getHex())){o.geometry.computeBoundingBox();crateBox.union(o.geometry.boundingBox);}});assert.ok(Math.abs(crateBox.min.y-.04)<1e-6);assert.ok(Math.abs(crateBox.max.y-.88)<1e-6);assert.ok(crateBox.min.x>=7.4399&&crateBox.max.x<=7.9001);assert.ok(crateBox.min.z>=-12.7001&&crateBox.max.z<=-12.2999);
});

test('operational counter props remain stock-free, supported and bounded by their corrected staff-side CAD',async()=>{
 installDOM();const {buildSakuraCounterOperations}=await import('../src/world/interiors/sakura-counter-operations.js'),{default:cad}=await import('../src/world/interiors/sakura-counter-operations.json',{with:{type:'json'}});
 assert.deepEqual(cad,JSON.parse(readFileSync(new URL('../docs/qa/sakura-counter-operations/schedule.json',import.meta.url))));
 const room=new THREE.Group(),g=buildSakuraCounterOperations(room);g.updateMatrixWorld(true);let meshes=0,triangles=0,lights=0;
 g.traverse(o=>{if(o.isLight)lights++;if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;assert.ok(b.min.y>=.7799);assert.ok(b.max.y<=.9401);assert.ok(b.min.x>=11.869&&b.max.x<=12.101);assert.ok(b.min.z>=-4.804&&b.max.z<=-3.819);}});
 assert.equal(meshes,3);assert.equal(lights,0);assert.ok(triangles<2500);assert.equal(g.userData.stockChanges,false);assert.equal(g.userData.newInteractions,false);assert.equal(g.userData.routeChanges,false);
});
