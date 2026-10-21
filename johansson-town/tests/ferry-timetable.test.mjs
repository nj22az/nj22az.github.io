import {createFerryRun} from '../src/world/ferry.js';
import {installDOM} from './fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {ferryServiceFixture} from './ferry-service-fixture.mjs';
import {FERRY_TIMETABLE,nextFerryDeparture,migrateFerryJourney} from '../src/people/ferry-timetable.js';
import {HARBOUR_LINE,BUS_DWELL,CROSSING_MINUTES} from '../src/people/commuter-schedule.js';
import {FERRY_DECKS,GANGWAY_LENGTH} from '../src/world/ferry-model.js';
import {AIRPORT_FERRY_PORTS} from '../src/world/airport-ferry.js';
import {restoreIsland} from '../src/island/services.js';

function board(s){s.play.action('airport-ferry');s.chooseDeparture();assert.ok(s.aboard());}
function at(s,local){s.run.ferry.updateMatrixWorld(true);s.player.position.copy(s.run.ferry.localToWorld(new THREE.Vector3(...local)));}

test('every sailing derives from the Harbour Line, including both shores and midnight',()=>{
 assert.equal(FERRY_TIMETABLE.length,HARBOUR_LINE.length*2);
 for(const t of HARBOUR_LINE){
  assert.ok(FERRY_TIMETABLE.some(s=>s.origin==='airport'&&s.departure===t-CROSSING_MINUTES&&s.arrival===t));
  assert.ok(FERRY_TIMETABLE.some(s=>s.origin==='town'&&s.departure===t+BUS_DWELL));
 }
 assert.equal(nextFerryDeparture(1336,'town').departure,1440+525);
 assert.equal(nextFerryDeparture(488,'airport').departure,488);
});

test('the warning sounds once at T−2 and offers a real choice without a departure request',()=>{
 const s=ferryServiceFixture();board(s);s.tick(.1);
 assert.equal(s.run.beginCrossing('airport'),false,'a passenger cannot dispatch the scheduled ship');
 s.setMinutes(522.99);s.tick(.1);assert.equal(s.run.audio.whistle.count,0);assert.equal(s.menu,null);
 s.setMinutes(523);s.tick(.1);assert.equal(s.run.departing,true);assert.equal(s.run.audio.whistle.count,1);
 assert.match(s.menu.title,/Departure warning/);assert.deepEqual(s.menu.buttons.map(b=>b[0]),['Go ashore','Stay aboard']);
 s.choose('Stay aboard');s.tick(1);assert.equal(s.run.audio.whistle.count,1);assert.equal(s.menu,null);
});

test('Go ashore walks from the passenger deck to a safe quay landing',()=>{
 const s=ferryServiceFixture();board(s);s.tick(.1);s.setMinutes(523);s.tick(.1);s.choose('Go ashore');
 const before=s.player.position.clone();s.tick(.1);assert.ok(s.player.position.distanceTo(before)<.2,'no teleport');
 s.until(()=>!s.play.snapshot().walkingAshore,{seconds:115});
 const p=AIRPORT_FERRY_PORTS.town;
 assert.ok(s.player.position.distanceTo(new THREE.Vector3(p.landing[0],p.height,p.landing[1]))<.03);
 assert.equal(s.aboard(),false);
});

for(const location of ['aboard','ashore','gangway'])test('departure closes access on time with player '+location,()=>{
 const s=ferryServiceFixture();if(location==='aboard')board(s);
 s.tick(.1);s.until(()=>s.run.operation?.stage==='boarding',{seconds:850});
 if(location==='gangway')s.player.position.copy(s.run.ferry.userData.gangway.localToWorld(new THREE.Vector3(GANGWAY_LENGTH*.8,.03,0)));
 s.setMinutes(525);s.tick(.1);assert.equal(s.run.accessOpen,false);
 if(location==='gangway'){const p=AIRPORT_FERRY_PORTS.town;assert.ok(Math.hypot(s.player.position.x-p.landing[0],s.player.position.z-p.landing[1])<.1);}
 s.until(()=>s.run.operation?.stage==='passage',{seconds:700});
 assert.equal(s.run.destination,'airport');assert.equal(s.run.gangwayOut,0);assert.equal(s.run.rampDown,0);
});

test('Stay aboard completes a physical crossing, keeps walking floors, and opens the destination ramp',()=>{
 const s=ferryServiceFixture();board(s);s.tick(.1);s.until(()=>s.run.operation?.stage==='boarding',{seconds:850});
 s.setMinutes(523);s.tick(.1);s.choose('Stay aboard');s.setMinutes(525);s.tick(.1);
 s.until(()=>s.run.operation?.stage==='passage',{seconds:700});
 const before=s.run.ferry.position.clone();s.tick(30);assert.ok(s.run.ferry.position.distanceTo(before)>.01);assert.ok(s.aboard());
 // The passenger can move on supported ship floors during passage; no cinematic owns the camera.
 assert.equal(s.play.cinematic,false);s.walk.update();
 const p=s.player.position.clone(),move=s.walk.move(p.x,p.y,p.z,p.x+.1,p.z,.32);assert.ok(move?.ok);
 s.player.position.x+=.1;s.player.position.y=move.y;
 s.until(()=>s.run.canUnload,{seconds:1900});s.tick(.1);
 assert.equal(s.run.berth,'airport');assert.ok(s.aboard());assert.equal(s.state.island.journey.location,'airport');assert.equal(s.state.island.visits,1);
 assert.ok(s.crew.snapshot().some(c=>c.name==='Mac'&&c.post==='chief'),'Mac keeps the working machinery watch');
 assert.equal(s.run.rampDown,1);assert.deepEqual(s.timePasses,[],'the crossing does not jump the clock');
});

test('a non-player passenger is cleared to the nearer gangway end before access closes',()=>{
 const s=ferryServiceFixture(),g=new THREE.Group();s.group.add(g);s.world.people.push({g,profile:{name:'Visitor'}});
 g.position.copy(s.run.ferry.userData.gangway.localToWorld(new THREE.Vector3(GANGWAY_LENGTH*.8,.03,0)));
 s.setMinutes(525);s.run.update(.1,525,1);const p=AIRPORT_FERRY_PORTS.town;
 assert.ok(g.position.distanceTo(new THREE.Vector3(p.landing[0],p.height,p.landing[1]))<.01);
});

test('old requested and held saves retain safe shores, tickets, belongings and finances',()=>{
 for(const location of ['town','airport','naha']){
  const journey={location,roundTrip:true,ticket:760,checked:true,held:true,requestedDestination:'airport'};
  const migrated=migrateFerryJourney(journey);assert.equal(migrated.location,location);assert.equal(migrated.roundTrip,true);assert.equal(migrated.ticket,760);
  assert.equal(migrated.held,undefined);assert.equal(migrated.requestedDestination,undefined);assert.deepEqual(migrateFerryJourney(migrated),migrated);
  assert.deepEqual(restoreIsland({journey}).journey,migrated);
 }
 const s=ferryServiceFixture();assert.equal(s.state.yen,1000);assert.deepEqual(s.state.inventory,['Saved keepsake']);assert.equal(s.state.island.treasury,43210);
});


test('the saved/selected clock resynchronises an idle ship before the first departure',()=>{
 const s=ferryServiceFixture({minute:600});assert.equal(s.run.berth,'airport');
 s.setMinutes(510);s.tick(.1);assert.equal(s.run.berth,'town');assert.equal(s.run.scheduledDeparture.departure,525);
 assert.equal(s.run.operation.stage,'preparing');
});


test('an unanswered warning expires at departure and cannot hold the ship',()=>{
 const s=ferryServiceFixture();board(s);s.tick(.1);s.setMinutes(523);s.tick(.1);assert.ok(s.menu);
 s.setMinutes(525);s.tick(.1);assert.equal(s.menu,null);assert.equal(s.run.accessOpen,false);assert.ok(s.aboard());
});

test('a passenger on the ramp is cleared to its nearby shore end rather than the midships landing',()=>{
 const s=ferryServiceFixture();at(s,[0,FERRY_DECKS.car.y-.4,22]);const before=s.player.position.clone();
 s.setMinutes(525);s.tick(.1);assert.ok(s.player.position.distanceTo(before)<4);
 assert.ok(Math.abs(s.player.position.z-AIRPORT_FERRY_PORTS.town.landing[1])>15,'the gangway landing is not the ramp landing');
 s.walk.update();assert.equal(s.walk.partOpen('ramp'),false);
});


test('the selected startup clock is applied even before the ferry has received its first frame',()=>{
 installDOM();const run=createFerryRun({parent:new THREE.Group(),colliders:[]});
 run.enableTimetable(20747*1440+1200);run.update(.1,20747*1440+510,0);
 assert.equal(run.scheduledDeparture.departure,20747*1440+525);assert.equal(run.berth,'town');assert.equal(run.operation.stage,'preparing');
});
