import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createShopRefrigerator} from '../src/world/interiors/shop-refrigerator.js';

test('replacement deli bay keeps sliding doors inside the existing cooler footprint and glass out of picking',()=>{
 installDOM();const room=new THREE.Group(),targets=[];
 const cooler=createShopRefrigerator(room,(target,label,action)=>targets.push({target,label,action}));
 assert.match(targets[0].label,/deli/);assert.ok(cooler.group.getObjectByName('Sakura deli and beverage canopy'));
 let meshes=0;cooler.group.traverse(o=>{if(o.isMesh)meshes++;});assert.equal(meshes,18,'six fixed draws and three per door');
 for(const entry of cooler.doors){assert.equal(entry.door.children.length,3);const pane=entry.door.getObjectByName('Clear cooler glass');assert.equal(pane.material.depthWrite,false);assert.ok(pane.material.opacity<=.05);const hits=[];pane.raycast(new THREE.Raycaster(),hits);assert.deepEqual(hits,[]);}
 targets[0].action();for(let i=0;i<60;i++)cooler.update(1/60);assert.ok(cooler.doors[0].amount>.99);
 room.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(cooler.group);assert.ok(bounds.min.x>=-2.31&&bounds.max.x<=3.1);assert.ok(bounds.max.z<=-3.09,'handles stay within the original cooler depth');
 for(let i=0;i<600;i++)cooler.update(1/60);assert.ok(cooler.doors.every(d=>d.amount<.001));
 cooler.open(3);cooler.update(.5);assert.ok(cooler.doors[3].amount>.9);assert.equal(cooler.doors[0].timer,0);
});
