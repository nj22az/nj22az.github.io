import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createTownTraffic,FERRY_VEHICLE_DECK_Z} from '../src/world/town-traffic.js';
import {createFerryRun} from '../src/world/ferry.js';
import {airportVehicleBay} from '../src/world/airport-vehicle-yard.js';
import {buildVehicle,DRIVER_SEATS} from '../src/world/road-vehicles.js';
import {createVehicleDrivers} from '../src/people/vehicle-driver.js';
import {buildAvatar} from '../src/avatars/build.js';
import {recipeFor} from '../src/avatars/cast.js';
import {createAvatarAnimator} from '../src/avatars/animate.js';
import {createTownSections} from '../src/render/town-sections.js';
function fixture(){installDOM();const parent=new T.Group(),people=['Tetsuo','Harbour master','Kenji','Reiko','Mrs Sato','Aya'].map(name=>{const g=new T.Group();g.userData.name=name;parent.add(g);return {g,profile:{name}};});const ferry=createFerryRun({parent});ferry.parkAt('town');const cars=createTownTraffic({parent,ferry,people:()=>people});return {parent,people,cars,ferry};}
test('all cars have distinct existing owners, drivers and purposes; cars stay parked without their driver',()=>{
 const {cars,people}=fixture();assert.equal(cars.snapshot().length,6);
 for(const v of cars.snapshot()){assert.ok(people.some(p=>p.profile.name===v.owner));assert.equal(v.driver,v.owner);assert.ok(v.purpose);}
 people[0].g.userData.indoors='workshop';cars.update(.1,690);
 assert.equal(cars.islanders[0].trip,null);assert.equal(cars.islanders[0].where,'quay');
});
test('section rendering follows each moving car at the airport and out on the ferry route',()=>{
 const {parent,cars}=fixture(),v=cars.fleet[0],body=v.g.getObjectByName('Sculpted vehicle body, cabin and wheels'),camera=new T.PerspectiveCamera(),sections=createTownSections();
 const draw=()=>{parent.updateMatrixWorld(true);camera.position.copy(v.g.position).add(new T.Vector3(0,5,10));camera.lookAt(v.g.position);camera.updateMatrixWorld(true);sections.render({renderer:{render(){assert.equal(body.visible,true,'The car is visible near its own position');}},scene:parent,town:parent,camera,position:v.g.position});};
 draw();v.g.position.set(-100,.6,-140);draw();
});
test('a purposeful errand stages, reverses aboard with its resident driver, sails and drives off at both shores',()=>{
 const {cars,people,ferry}=fixture(),v=cars.islanders[0];cars.update(.1,510);assert.equal(v.trip,null);
 cars.update(.1,690);assert.ok(v.trip);assert.equal(people[0].g.parent,v.g);assert.equal(people[0].g.userData.inVehicle,v.id);
 const first=v.trip;cars.update(.1,700);assert.equal(v.trip,first);const position=v.g.position.clone();cars.update(.1,800);assert.equal(v.trip,first);assert.ok(position.distanceTo(v.g.position)<1,'Clock jumps cannot teleport a car');
 cars.traffic.finish(v);assert.equal(v.where,'waiting-ferry');assert.equal(cars.prepareCrossing('airport'),false);assert.equal(v.trip.reverse,true);
 const start=v.g.position.clone();for(let i=0;i<20;i++)cars.update(.1,720);assert.ok(v.g.position.distanceTo(start)>.1,'Actually drives along the ramp');assert.ok(v.g.position.distanceTo(start)<3,'No jump from shore to deck');
 cars.traffic.finish(v);assert.equal(v.where,'aboard');assert.equal(cars.prepareCrossing('airport'),true);assert.ok(cars.drivers.has(v));
 const local=v.g.position.clone();ferry.ferry.worldToLocal(local);assert.ok(Math.abs(local.z-FERRY_VEHICLE_DECK_Z)<.01);assert.ok(local.z-v.length/2>-1.6,'Clear of the passenger cabin');
 ferry.beginCrossing('airport');ferry.setCrossingProgress(.5);cars.update(.1,720);assert.ok(v.g.position.distanceTo(start)>40);assert.equal(people[0].g.parent,v.g);
 ferry.parkAt('airport');cars.update(.1,720);assert.equal(v.transfer,'off');cars.traffic.finish(v);assert.equal(v.where,'airport');assert.equal(v.stageOrigin,undefined);
 cars.update(.1,800);cars.traffic.finish(v);assert.equal(v.where,'waiting-ferry');cars.prepareCrossing('town');cars.traffic.finish(v);assert.equal(v.where,'aboard');assert.equal(cars.prepareCrossing('town'),true);
 ferry.parkAt('town');cars.update(.1,800);cars.traffic.finish(v);assert.equal(v.where,'quay');assert.equal(people[0].g.parent,cars.group.parent);assert.equal(people[0].g.userData.inVehicle,undefined);
 cars.update(.1,900);assert.equal(v.trip,null,'The completed job stays parked');
});
test('the complete combined-ferry cargo round trip finishes by ordinary timesteps without teleporting endpoints',()=>{
 const {cars,people,ferry}=fixture(),v=cars.islanders[0];for(const p of people)p.g.position.set(-30,0,30);
 const stepUntil=(condition,minutes,destination=null)=>{for(let i=0;i<10000;i++){cars.update(1/60,minutes);if(destination)cars.prepareCrossing(destination);if(condition())return;}assert.fail(`${v.where} did not finish: ${v.blocker?.owner||v.blocker}`);};
 stepUntil(()=>v.where==='aboard',690,'airport');assert.ok(cars.prepareCrossing('airport'));
 ferry.beginCrossing('airport');for(let i=1;i<=36;i++){ferry.setCrossingProgress(i/36);cars.update(.1,720);assert.ok(cars.drivers.has(v));}ferry.parkAt('airport');stepUntil(()=>v.where==='airport',720);
 stepUntil(()=>v.where==='aboard',800,'town');assert.ok(cars.prepareCrossing('town'));ferry.beginCrossing('town');ferry.setCrossingProgress(1);ferry.parkAt('town');stepUntil(()=>v.where==='quay',800);
 assert.equal(cars.drivers.has(v),false);assert.equal(cars.loadingVehicles,0);
});
test('airport couriers stage through a clear aisle with the complete parked fleet present',()=>{
 for(const owner of ['Kenji','Reiko','Mrs Sato','Aya']){
  const {cars,people}=fixture(),v=cars.fleet.find(v=>v.owner===owner);for(const p of people)p.g.position.set(-30,0,30);
  for(let i=0;i<9000&&v.where!=='waiting-ferry';i++)cars.update(1/60,v.appointment.leave);
  assert.equal(v.where,'waiting-ferry',`${owner} cannot leave its bay: ${v.blocker?.owner||v.blocker}`);
  assert.ok(cars.drivers.has(v));
 }
});
test('every airport bay has clear entry and departure paths when the other five bays are occupied',()=>{
 for(let bay=0;bay<6;bay++){
  const {cars,people}=fixture(),all=[...cars.islanders,...cars.fleet],v=all[bay];for(const p of people)p.g.position.set(-30,0,30);
  all.forEach((other,i)=>cars.traffic.park(other,airportVehicleBay(i)));assert.ok(cars.drivers.board(v));
  const drive=lane=>{cars.traffic.drive(v,cars.network.path([lane]));for(let i=0;i<9000&&v.trip;i++)cars.traffic.update(1/60);assert.equal(v.trip,null,`${lane} blocked by ${v.blocker?.owner||v.blocker}`);};
  drive('airport-stage-'+bay);drive('airport-in-'+bay);
 }
});
test('both quay bays and their exits clear the other parked car and the port canopy',async()=>{
 const {portBuildingColliders}=await import('../src/world/port-building.js');
 const {circleHitsRect}=await import('../physics.js');
 const solids=portBuildingColliders();
 for(let bay=0;bay<2;bay++){
  const {cars,people}=fixture(),v=cars.islanders[bay];for(const p of people)p.g.position.set(-30,0,30);
  assert.ok(cars.drivers.board(v));
  for(const lane of ['quay-out-'+bay,'main-south','quay-in-'+bay]){
   const path=cars.network.path([lane]);cars.traffic.drive(v,path);
   for(let i=0;i<9000&&v.trip;i++){
    cars.traffic.update(1/60);
    for(let along=-v.length/2;along<=v.length/2+.01;along+=.3){
     const x=v.g.position.x+Math.sin(v.g.rotation.y)*along,z=v.g.position.z+Math.cos(v.g.rotation.y)*along;
     assert.ok(!solids.some(c=>circleHitsRect(x,z,v.width/2,c)),lane+' car body intersects the Port Building');
    }
   }
   assert.equal(v.trip,null,lane+' cannot clear '+(v.blocker?.owner||v.blocker));
  }
 }
});
test('one car can sail while a second matching car waits for the next deck space',()=>{
 const {cars,ferry}=fixture();for(const [i,v] of cars.islanders.entries()){assert.ok(cars.drivers.board(v));v.where='waiting-ferry';v.stageOrigin='town';v.shipDestination='airport';v.g.position.set(-6.45,0,-45.3+i*5);}
 assert.equal(cars.prepareCrossing('airport'),false);cars.traffic.finish(cars.islanders[0]);
 assert.equal(cars.islanders[0].where,'aboard');assert.equal(cars.islanders[1].where,'waiting-ferry');assert.equal(cars.prepareCrossing('airport'),true,'Capacity is one; the second car must not deadlock departure');
 ferry.beginCrossing('airport');cars.update(.1,700);assert.equal(cars.islanders[1].where,'waiting-ferry');
});
test('borrowing and releasing preserves the existing resident and restores occupied-driver exclusions',()=>{
 installDOM();const parent=new T.Group(),g=new T.Group();parent.add(g);g.position.set(4,0,5);g.userData.socialPose='Idle';const people=[{profile:{name:'Kenji'},g}],drivers=createVehicleDrivers({people:()=>people}),v={id:'test-car',driver:'Kenji',purpose:'Repair parts',width:1.62,g:buildVehicle('car',0xffffff)};
 assert.ok(drivers.board(v));assert.equal(drivers.board({...v,id:'other'}),false);assert.equal(v.g.children.filter(o=>o===g).length,1);
 drivers.release(v,{restore:true});assert.deepEqual(g.position.toArray(),[4,0,5]);assert.equal(g.userData.socialPose,'Idle');assert.equal(g.parent,parent);
});
test('a scheduled offscreen worker can drive the errand while active interiors retain their resident',()=>{
 const {cars,people}=fixture(),v=cars.fleet[0],person=people.find(p=>p.profile.name==='Kenji');person.g.visible=false;person.g.userData.indoors='work';
 cars.update(.1,630);assert.ok(v.trip);assert.equal(person.g.parent,v.g);assert.equal(person.g.visible,true);assert.equal(person.g.userData.inVehicle,v.id);
 cars.drivers.release(v,{restore:true});assert.equal(person.g.visible,false);assert.equal(person.g.userData.indoors,'work');
 person.g.userData.inWorkplace=true;assert.equal(cars.drivers.board(v),false,'An active room keeps its avatar');delete person.g.userData.inWorkplace;person.g.visible=true;assert.equal(cars.drivers.board(v),false,'Visible indoor activity is not interrupted');
});
test('absence releases the same borrowed residents and settles cars in their connected home bays',()=>{
 const {cars,people}=fixture(),islander=cars.islanders[0],courier=cars.fleet[0];
 const originals=people.map(p=>({g:p.g,parent:p.g.parent,position:p.g.position.clone(),visible:p.g.visible}));
 cars.update(.1,630);cars.update(.1,690);cars.traffic.finish(islander);cars.prepareCrossing('airport');cars.traffic.finish(islander);assert.equal(islander.where,'aboard');assert.ok(cars.drivers.has(courier));
 cars.reconcileAbsent(800);
 for(const v of [...cars.islanders,...cars.fleet]){assert.equal(v.trip,null);assert.equal(v.transfer,null);assert.equal(v.shipDestination,null);assert.equal(v.stageOrigin,undefined);assert.equal(cars.drivers.has(v),false);assert.equal(v.shore,v.home);assert.equal(v.solid.x,v.g.position.x);assert.equal(v.solid.z,v.g.position.z);}
 for(const before of originals){assert.equal(before.g.parent,before.parent);assert.deepEqual(before.g.position.toArray(),before.position.toArray());assert.equal(before.g.visible,before.visible);assert.equal(before.g.userData.inVehicle,undefined);}
 assert.equal(cars.pendingVehicleJourney(),null);assert.equal(cars.loadingVehicles,0);
 cars.update(.1,690);assert.ok(islander.trip,'An eligible errand can resume after offline reconciliation');assert.ok(cars.drivers.has(islander));
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
