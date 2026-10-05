import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {AIRPORT_JETTY,buildAirportIsland} from '../src/world/airport-island.js';
import {airportWorld,airportLocal,airportSurface,AIRPORT_LANDING,AIRPORT_LANDING_HEIGHT,AIRPORT_PIER_HEIGHT} from '../src/world/airport-ground.js';
import {buildAirportVehicleYard} from '../src/world/airport-vehicle-yard.js';
import {AIRPORT_FERRY_PORTS,airportFerryPose} from '../src/world/airport-ferry.js';
import {createFerryRun,FERRY_BERTH} from '../src/world/ferry.js';
import {createIslandPlay} from '../src/island/play.js';
import {createTownTraffic} from '../src/world/town-traffic.js';
import {KITANO_ROAD_LENGTH,roadPoint,kitanoRoadAt} from '../src/world/kitano-link-plan.js';
import {buildKitanoLink} from '../src/world/kitano-link.js';

test('the former airport bridge has neither drawn structure nor walking support',()=>{
 const group=new THREE.Group(),colliders=[],link=buildKitanoLink({parent:group,colliders});
 assert.equal(link.bridge,null);assert.deepEqual(link.piers,[]);
 assert.ok(KITANO_ROAD_LENGTH<32);assert.ok(roadPoint(KITANO_ROAD_LENGTH)[0]<33);
 assert.ok(!group.getObjectByName('Kitano Bridge piers'));
 for(let x=48;x<100;x+=.25)assert.equal(kitanoRoadAt(x,3.3+(x-24)*(-14.05/76),.32),null,'Invisible bridge support at '+x);
 assert.ok(!colliders.some(c=>/kitano-causeway/.test(c.id||'')));
});

test('airport arrival feet match the drawn pier and connect to the public district',()=>{
 const parent=new THREE.Group(),island=buildAirportIsland({parent});buildAirportVehicleYard({airportIsland:island});parent.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(new THREE.Vector3(AIRPORT_LANDING[0],5,AIRPORT_LANDING[1]),new THREE.Vector3(0,-1,0));
 const hit=ray.intersectObject(island.group)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-AIRPORT_LANDING_HEIGHT)<1e-6);
 assert.equal(hit.object.name,'Connected airport cargo asphalt');assert.equal(airportSurface(...AIRPORT_LANDING,.32)?.id,'airport-cargo-court');
 const pierOnly=airportWorld(-54.5,33);ray.set(new THREE.Vector3(pierOnly[0],5,pierOnly[1]),new THREE.Vector3(0,-1,0));
 assert.ok(Math.abs(ray.intersectObject(island.group)[0].point.y-AIRPORT_PIER_HEIGHT)<1e-6);assert.equal(airportSurface(...pierOnly,.32)?.y,AIRPORT_PIER_HEIGHT);
 // Body-radius clearance all the way from ramp landing onto the open arrival plaza.
 for(let x=-54.8;x<=-40;x+=.1){const p=airportWorld(x,31);assert.ok(airportSurface(...p,.32),'Pier/plaza seam at local '+x);}
 const [x,z]=airportLocal(...AIRPORT_FERRY_PORTS.airport.berth);
 assert.ok(x+7.5<AIRPORT_JETTY.minX,'Hull overlaps the pier');
 assert.ok(x+7.5+2.4>AIRPORT_JETTY.minX,'Bow ramp does not reach the pier');
 assert.ok(Math.abs(z-31)<1e-7);
});

test('the shared ferry crosses around the harbour wall and stays off reclaimed land',()=>{
 const ports=AIRPORT_FERRY_PORTS;
 assert.deepEqual(ports.town.berth,[FERRY_BERTH.x,FERRY_BERTH.z]);
 for(const destination of ['airport','town'])for(let i=0;i<=1000;i++){
  const p=airportFerryPose(destination,i/1000);assert.ok(Object.values(p).every(Number.isFinite));
  const c=Math.cos(p.yaw),s=Math.sin(p.yaw);for(const dx of [-2.2,0,2.2])for(let dz=-7.5;dz<=7.5;dz+=.3){const x=p.x+c*dx+s*dz,z=p.z-s*dx+c*dz;assert.ok(!(Math.abs(z+83)<2&&Math.abs(x)<34),'Hull crosses breakwater at '+x+','+z);}
  for(const dx of [-2.2,0,2.2])for(let dz=-7.5;dz<=7.5;dz+=.3){const x=p.x+c*dx+s*dz,z=p.z-s*dx+c*dz;assert.ok(!(Math.abs(x)<4.1&&z> -64.95&&z< -49.65),'Hull crosses outer pier at '+x+','+z);}
  const [u,v]=airportLocal(p.x,p.z);
  assert.ok(!(u> -60&&u<178&&v>20&&v<132),'Hull sails over airport land');
 }
 for(const destination of ['airport','town']){
  const p=airportFerryPose(destination,1);assert.ok(Math.hypot(p.x-ports[destination].berth[0],p.z-ports[destination].berth[1])<1e-7);
 }
});

function playerService(){
 const group=new THREE.Group(),run=createFerryRun({parent:group,colliders:[]}),player=new THREE.Object3D(),camera=new THREE.PerspectiveCamera();
 const state={yen:1000,inventory:['Saved keepsake'],island:{v:1,projects:[],treasury:43210,repair:false,flights:0,visits:0,journey:{location:'town',roundTrip:false,ticket:null,checked:false}}};
 let menu=null,minutes=600;const arrivals=[],activities={state,save(){},close(){menu=null;},menu(title,text,buttons){menu={title,text,buttons};}};
 const world={group,people:[],ferry:run,colliders:[]};
 const play=createIslandPlay({world,player,camera,activities,getMinutes:()=>minutes,getRain:()=>false,passTime:m=>minutes+=m,place:(x,z,y)=>{arrivals.push({x,z,y});player.position.set(x,y,z);},enterNaha(){},leaveNaha(){}});
 const choose=prefix=>{const fn=menu.buttons.find(([label])=>label.startsWith(prefix))?.[1];assert.ok(fn,'Missing '+prefix);fn();};
 const complete=()=>{for(let i=0;i<100&&play.active;i++)play.tick(1);assert.equal(play.active,false);};
 return {group,world,run,player,camera,state,play,arrivals,choose,complete};
}

test('one hull carries the player both ways, preserves saves and returns at safe heights',()=>{
 const s=playerService();assert.equal(s.group.children.filter(o=>/ferry/i.test(o.name)&&o.isGroup).length,1);
 s.play.action('airport-ferry');s.choose('Buy return');s.choose('Board');s.play.tick(0);assert.equal(s.run.phase,'crossing');s.complete();
 assert.equal(s.run.berth,'airport');assert.equal(s.state.island.journey.location,'airport');assert.equal(s.state.island.visits,1);
 assert.equal(s.arrivals.at(-1).y,AIRPORT_LANDING_HEIGHT);assert.equal(s.state.yen,600);
 s.state.yen=0;s.state.island.journey.roundTrip=false; // Old save with a missing fare flag must still get home.
 s.play.action('airport-return');s.choose('Board');s.complete();
 assert.equal(s.run.berth,'town');assert.equal(s.state.island.journey.location,'town');assert.equal(s.arrivals.at(-1).y,AIRPORT_FERRY_PORTS.town.height);
 assert.equal(s.state.yen,0);assert.deepEqual(s.state.inventory,['Saved keepsake']);assert.equal(s.state.island.treasury,43210);
});

test('calling from the opposite shore brings the same empty hull before boarding',()=>{
 const s=playerService();s.run.parkAt('airport');s.player.position.set(...[AIRPORT_FERRY_PORTS.town.landing[0],.098,AIRPORT_FERRY_PORTS.town.landing[1]]);
 const before=s.run.ferry.position.clone(),playerBefore=s.player.position.clone();
 s.play.action('airport-ferry');s.choose('Buy return');s.choose('Board');s.play.tick(0);
 assert.equal(s.run.destination,'town');assert.ok(s.run.ferry.position.distanceTo(before)<.04,'Hull teleported to the passenger');
 s.play.tick(1);assert.deepEqual(s.player.position.toArray(),playerBefore.toArray(),'Passenger moved during empty pickup');
 s.complete();assert.equal(s.state.island.journey.location,'airport');assert.equal(s.state.island.visits,1);assert.equal(s.arrivals.at(-1).y,AIRPORT_LANDING_HEIGHT);
});

test('loading keeps passengers off vehicle lanes and waits for actual boarding readiness',()=>{
 const s=playerService(),shore=new THREE.Vector3(-3.2,.098,-56.4);s.player.position.copy(shore);
 let preparation=0;s.world.traffic={prepareCrossing(){return ++preparation>=4;}};
 s.play.action('airport-ferry');s.choose('Buy return');s.choose('Board');
 for(let i=0;i<3;i++){s.play.tick(1);assert.equal(s.run.phase,'waiting');assert.deepEqual(s.player.position.toArray(),shore.toArray());}
 s.play.tick(1);assert.equal(s.run.phase,'crossing');s.run.ferry.updateMatrixWorld(true);
 const local=s.player.position.clone().applyMatrix4(s.run.ferry.matrixWorld.clone().invert());
 assert.ok(Math.abs(local.x-1.3)<1e-7&&Math.abs(local.z-.2)<1e-7);
 assert.ok(local.z+.32<3.3-3.8/2,'Passenger overlaps foredeck car');
 assert.ok(local.z-.32> -1.6&&local.x+.32<2.04,'Passenger overlaps cabin or side wall');
 const [u,v]=airportLocal(...AIRPORT_LANDING);assert.ok(Math.abs(v-31)>1.5,'Airport waiting point blocks vehicle lane');
 assert.ok(airportSurface(...AIRPORT_LANDING,.32));
});

test('an owned car reaches the opposite shore with its existing driver without a player ferry ride',()=>{
 const s=playerService(),g=new THREE.Group();g.name='Chin';g.visible=false;g.userData.indoors='home';s.group.add(g);
 s.world.people.push({profile:{name:'Chin'},g});
 s.world.traffic=createTownTraffic({parent:s.group,colliders:s.world.colliders,ferry:s.run,people:()=>s.world.people});
 const car=s.world.traffic.fleet.find(v=>v.owner==='Chin'),playerBefore=s.player.position.clone(),cameraBefore=s.camera.matrixWorld.clone();
 let emptyPickup=false,loadedCrossing=false,boarding=false,unloading=false,parked=false;
 for(let i=0;i<72000;i++){
  s.play.tick(1/60);s.run.update(1/60,600);s.world.traffic.update(1/60,600);
  const at=s.world.traffic.snapshot().find(v=>v.owner==='Chin');
  boarding||=at.transfer==='on';unloading||=at.transfer==='off';
  if(s.run.automaticCrossing){
   emptyPickup||=s.run.destination==='airport'&&at.location!=='aboard';
   if(s.run.destination==='town'&&at.location==='aboard'){
    loadedCrossing=true;assert.equal(g.parent,car.g,'Driver was replaced rather than seated');assert.equal(g.userData.inVehicle,car.id);
   }
  }
  assert.equal(s.play.active,false,'Automatic cargo took control of the player');
  assert.deepEqual(s.player.position.toArray(),playerBefore.toArray());assert.deepEqual(s.camera.matrixWorld.elements,cameraBefore.elements);
  if(loadedCrossing&&at.location==='service'&&at.shore==='town'){parked=true;break;}
 }
 assert.ok(emptyPickup,'Remote cargo was never collected');assert.ok(boarding&&loadedCrossing&&unloading&&parked,'The car did not complete driving, loading, crossing and parking');
 assert.equal(s.group.children.filter(o=>/ferry/i.test(o.name)&&o.isGroup).length,1);
 assert.equal(s.state.island.journey.location,'town');assert.equal(s.state.island.visits,0);assert.equal(s.state.yen,1000);
});

test('automatic crossings wait for vehicle transfer, and passenger requests preserve their progress',()=>{
 const s=playerService();let transfer=true;
 s.world.traffic={pendingVehicleJourney:()=>({id:'car',origin:'town',destination:'airport'}),prepareCrossing:()=>true,get loadingVehicles(){return transfer;}};
 s.play.tick(1);assert.equal(s.run.phase,'waiting','Ferry departed during an unfinished car transfer');
 transfer=false;s.play.tick(0);assert.equal(s.run.automaticCrossing,true);
 s.play.tick(5);const progress=s.run.crossingProgress,position=s.run.ferry.position.clone(),cameraBefore=s.camera.position.clone();
 s.run.update(4,600);assert.equal(s.run.crossingProgress,progress,'World update advanced the same crossing twice');
 assert.equal(s.run.beginCrossing('town'),false,'Another request restarted the hull mid-crossing');
 s.play.action('airport-ferry');s.choose('Buy return');s.choose('Board');
 assert.equal(s.play.phase,'awaiting-boat');assert.equal(s.run.crossingProgress,progress);assert.equal(s.run.ferry.position.distanceTo(position),0);
 const waiting=s.player.position.clone();s.play.tick(1);
 assert.ok(s.run.crossingProgress>progress);assert.deepEqual(s.player.position.toArray(),waiting.toArray());assert.deepEqual(s.camera.position.toArray(),cameraBefore.toArray());
 // The cargo trip finishes at airport, so the same hull returns to collect this town passenger.
 s.world.traffic.pendingVehicleJourney=()=>null;s.complete();
 assert.equal(s.state.island.journey.location,'airport');assert.equal(s.run.berth,'airport');assert.equal(s.state.island.visits,1);
});
