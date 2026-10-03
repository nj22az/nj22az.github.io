import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTownTraffic} from '../src/world/town-traffic.js';
import {buildVehicle,DRIVER_SEATS} from '../src/world/road-vehicles.js';
import {createVehicleDrivers} from '../src/people/vehicle-driver.js';
import {buildAvatar} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
function fixture(){installDOM();const parent=new T.Group(),people=['Tetsuo','Harbour master','Kenji','Reiko','Mrs Sato','Aya'].map(name=>{const g=new T.Group();g.userData.name=name;parent.add(g);return {g,profile:{name}};});const cars=createTownTraffic({parent,people:()=>people});return {parent,people,cars};}
test('all cars have distinct existing owners, drivers and purposes; cars stay parked without their driver',()=>{
 const {cars,people}=fixture();assert.equal(cars.snapshot().length,6);
 for(const v of cars.snapshot()){assert.ok(people.some(p=>p.profile.name===v.owner));assert.equal(v.driver,v.owner);assert.ok(v.purpose);}
 people[0].g.userData.indoors='workshop';cars.update(.1,525);
 assert.equal(cars.islanders[0].trip,null);assert.equal(cars.islanders[0].where,'quay');
});
test('daily appointments replace repeating laps and keep the real driver in the car',()=>{
 const {cars,people}=fixture();const v=cars.islanders[0];cars.update(.1,510);assert.equal(v.trip,null);
 cars.update(.1,525);assert.ok(v.trip);assert.equal(people[0].g.parent,v.g);assert.equal(people[0].g.userData.inVehicle,v.id);
 const first=v.trip;cars.update(.1,534);assert.equal(v.trip,first,'No new eight-minute lap');
 const position=v.g.position.clone();cars.update(.1,800);assert.equal(v.trip,first);assert.ok(position.distanceTo(v.g.position)<1,'A changed clock cannot teleport the trip');
 cars.traffic.finish(v);assert.equal(v.where,'airport');cars.update(.1,800);assert.ok(v.trip);
 cars.traffic.finish(v);assert.equal(v.where,'quay');assert.equal(people[0].g.parent,cars.group.parent);assert.equal(people[0].g.userData.inVehicle,undefined);
 cars.update(.1,900);assert.equal(v.trip,null,'One completed errand stays parked');
});
test('borrowing and releasing preserves the existing resident and restores occupied-driver exclusions',()=>{
 installDOM();const parent=new T.Group(),g=new T.Group();parent.add(g);g.position.set(4,0,5);g.userData.socialPose='Idle';const people=[{profile:{name:'Kenji'},g}],drivers=createVehicleDrivers({people:()=>people}),v={id:'test-car',driver:'Kenji',purpose:'Repair parts',width:1.62,g:buildVehicle('car',0xffffff)};
 assert.ok(drivers.board(v));assert.equal(drivers.board({...v,id:'other'}),false);assert.equal(v.g.children.filter(o=>o===g).length,1);
 drivers.release(v,{restore:true});assert.deepEqual(g.position.toArray(),[4,0,5]);assert.equal(g.userData.socialPose,'Idle');assert.equal(g.parent,parent);
});
test('seated adult heads and shoulders fit within every hollow cabin',()=>{
 installDOM();for(const kind of Object.keys(DRIVER_SEATS)){
 const v=buildVehicle(kind,0xffffff),seat=DRIVER_SEATS[kind],a=buildAvatar(recipeFor('Tetsuo'),{shadows:false}),anim=createAvatarAnimator(a);v.add(a.root);a.root.position.set(seat.x,0,seat.z);a.root.rotation.y=0;
 for(let i=0;i<90;i++)anim.update(1/60,{seated:true,seatHeight:seat.y,driving:true});v.updateMatrixWorld(true);
 const m=a.measure,top=a.root.position.y+m.headCentre+m.Rh*m.headSY;
 assert.ok(top<seat.roof-.03,kind+' has adult headroom: '+top);assert.ok(m.width<.62);
 const panes=v.getObjectByName('Clear vehicle windows');assert.equal(panes.children.length,4);for(const p of panes.children)assert.equal(p.material.depthWrite,false);
 }
});
