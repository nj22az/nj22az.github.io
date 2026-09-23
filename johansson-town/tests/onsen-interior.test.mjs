import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildOnsenInterior,ONSEN_ROOM,ONSEN_SEATS} from '../src/world/interiors/onsen.js';
import {circleHitsRect} from '../physics.js';

const build=()=>{const room=new THREE.Group(),hits=[],actions=[];const layout=buildOnsenInterior({room,reg:(o,label,fn)=>hits.push({o,label,fn}),action:(...a)=>actions.push(a),exit(){}});return {room,hits,actions,layout};};
const blocked=(layout,x,z,r=.3)=>layout.colliders.some(c=>circleHitsRect(x,z,r,c));

test('Umi-no-yu is a room you walk through: bandai, lockers, washing places, two baths, the door',()=>{
 const {hits,layout}=build();
 const labels=hits.map(h=>h.label);
 for(const label of ['Pay at the bandai · ¥300','Change at the lockers','Wash at the tap','Get into the indoor bath','Get into the rock bath','Buy coffee milk · ¥100','Step outside'])assert.ok(labels.includes(label),label);
 assert.ok(!blocked(layout,...[ONSEN_ROOM.spawn[0],ONSEN_ROOM.spawn[2]]),'you arrive in the clear');
 // A walk from the door to the rock bath, down the middle of the building.
 for(const z of [4.2,3,1.6,0,-1.2,-2.5,-4.4,-4.75])assert.ok(!blocked(layout,0.2,z,.25),'the way through is open at z='+z);
});

test('every seat can be reached, and the baths put you in the water up to the chest',()=>{
 const {hits,layout}=build();
 for(const spec of Object.values(ONSEN_SEATS)){
  assert.ok(!blocked(layout,spec.stand[0],spec.stand[2],.25),spec.id+' stand point is clear');
  assert.ok(hits.some(h=>h.o.userData.seat?.id===spec.id),spec.id+' has a prompt');
 }
 for(const id of ['indoor','rock']){
  const s=ONSEN_SEATS[id],water=id==='indoor'?ONSEN_ROOM.tub.water:ONSEN_ROOM.pool.water;
  assert.ok(s.soak&&s.surfaceY<0,'sits below the floor, in the pool');
  assert.ok(s.eyeY>water&&s.eyeY-water<.45,id+': eyes just above the water');
 }
});

test('the rock bath lights its lantern and steams more after dark',()=>{
 const {room,layout}=build();
 layout.tick(.1,12*60);let lantern=null;room.traverse(o=>{if(o.name==='Lantern light')lantern=o;});
 const day=lantern.material.emissiveIntensity;layout.tick(.1,21*60+30);
 assert.ok(lantern.material.emissiveIntensity>day+.5);
});
