import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createKit} from '../src/world/okinawa/kit.js';
import {shopHouse} from '../src/world/okinawa/houses.js';
import {EAST_ROW} from '../src/world/okinawa/layout.js';
import {standingHitsRect,sweepFraction} from '../physics.js';

installDOM();
const plot=EAST_ROW.plots.find(p=>p.id==='nakamura'),kit=createKit(),group=new THREE.Group();
let colliders;
kit.at((EAST_ROW.minX+EAST_ROW.maxX)/2,(plot.minZ+plot.maxZ)/2,-Math.PI/2,()=>{
 colliders=shopHouse(kit,{w:plot.maxZ-plot.minZ-.1,d:EAST_ROW.maxX-EAST_ROW.minX,interior:'zenzai',seed:plot.minZ*7|0});
});
kit.finish(group);group.updateMatrixWorld(true);

test('Blue Coral’s compact display fits the former table corner and has visible matching collision',()=>{
 const display=colliders.find(c=>c.id==='ice-cream-display');
 assert.ok(display);
 assert.ok(Math.hypot(display.x-7.1,display.z+9.61)<.03,'the existing table corner is reused');
 assert.ok(display.w<=.55&&display.d<=.75,'it stays inside the former table and stool area');
 const ray=new THREE.Raycaster(new THREE.Vector3(display.x,2,display.z),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(group,true)[0];
 assert.ok(hit&&Math.abs(hit.point.y-display.height)<.01,'collision height matches the drawn display');
 assert.equal(standingHitsRect(display.x,display.z,.28,0,display),true);
});

test('the clerk and all pavement customers retain clear standing and walking space',()=>{
 const display=colliders.find(c=>c.id==='ice-cream-display');
 assert.equal(standingHitsRect(7.35,-10.55,.32,0,display),false,'the existing clerk remains clear');
 const blocked=(x,z)=>colliders.some(c=>standingHitsRect(x,z,.28,0,c));
 for(const [x,z] of [[4.5,-9.55],[4.8,-10.9],[4.8,-9.6]])assert.equal(blocked(x,z),false,'customer prompt is clear');
 assert.equal(sweepFraction({x:4.5,z:-12},{x:4.5,z:-8.5},blocked,.04),1,'the pavement remains continuous');
});
