import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createStandIn} from '../src/render/static-props.js';

test('a stand-in draws a room as a few meshes, and the real room comes back untouched',()=>{
 const room=new THREE.Group(),box=new THREE.BoxGeometry(.2,.2,.2);
 for(let i=0;i<40;i++){const m=new THREE.Mesh(box,new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(i/40,.5,.5)}));m.position.set(i*.3,0,0);room.add(m);}
 const shelf=new THREE.InstancedMesh(box,new THREE.MeshStandardMaterial(),6);
 for(let i=0;i<6;i++)shelf.setMatrixAt(i,new THREE.Matrix4().makeScale(i<4?1:0,i<4?1:0,i<4?1:0));
 room.add(shelf);
 const hidden=new THREE.Mesh(box,new THREE.MeshBasicMaterial());hidden.visible=false;room.add(hidden);
 room.position.set(5,0,2);room.scale.setScalar(.7);
 const standIn=createStandIn(room);room.add(standIn.group);
 assert.equal(standIn.sources,41,'every visible mesh and nothing hidden');
 assert.equal(standIn.meshes,1,'same look, one draw');
 const merged=standIn.group.children[0];
 assert.equal(merged.geometry.attributes.position.count,(40+4)*36,'empty stock slots are left out');
 const colours=merged.geometry.attributes.color;
 assert.notDeepEqual([colours.getX(0),colours.getY(0)],[colours.getX(36*20),colours.getY(36*20)],'each piece keeps its colour');
 standIn.show(true);
 assert.ok(room.children.slice(0,41).every(o=>!o.layers.isEnabled(0)));
 standIn.show(false);
 assert.ok(room.children.slice(0,41).every(o=>o.layers.isEnabled(0)));
 assert.equal(standIn.group.visible,false);
});
