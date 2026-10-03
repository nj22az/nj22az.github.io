import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {circleHitsRect} from '../physics.js';
import {configureTownMode,TOWN_MODES} from '../src/world/town-mode.js';

test('you can walk from the quay yard onto the pier and into Mr Fujita’s shed',async()=>{
 installDOM();globalThis.self=globalThis;configureTownMode(TOWN_MODES.PENINSULA);
 const {createTown}=await import('../src/world/town.js?port-access');
 const {createBusinesses}=await import('../src/world/businesses.js');
 const {PORT_SHED,SHED_PIER}=await import('../src/world/port-shed.js');
 const world=createTown({scene:new THREE.Scene(),sites:createBusinesses().filter(s=>['market','frontrow'].includes(s.id)),townMode:'peninsula',mobile:false,shadows:false,register(){},enter(){},onAction(){},getPlayerPosition:()=>new THREE.Vector3()});
 const blocked=(x,z)=>world.colliders.some(c=>circleHitsRect(x,z,.3,c));
 // Onto the pier along its west side, past the cargo on the quay, to the shed's open end.
 const x=SHED_PIER.minX+.9;
 // From the yard, between the oil drums and the container, then out along the pier.
 for(const [px,pz] of [[-35,-44],[-35.7,-45.4],[-36.6,-46.2]])assert.ok(!blocked(px,pz),`the way from the yard is blocked at ${px},${pz}`);
 for(let z=-46.2;z>=PORT_SHED.z+PORT_SHED.width/2+.4;z-=.4)assert.ok(!blocked(x,z),`the pier is blocked at ${x.toFixed(2)},${z.toFixed(1)}`);
 // And in at the shed's open end.
 for(let z=PORT_SHED.z+PORT_SHED.width/2+.8;z>=PORT_SHED.z+.4;z-=.3)assert.ok(!blocked(PORT_SHED.x-.55,z),'the shed doorway is blocked at z='+z.toFixed(1));
});
