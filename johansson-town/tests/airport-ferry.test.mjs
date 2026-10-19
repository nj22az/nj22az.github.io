import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {FERRY_FARE} from '../src/island/services.js';
import {AIRPORT_JETTY,buildAirportIsland} from '../src/world/airport-island.js';
import {airportWorld,airportLocal,airportSurface,AIRPORT_LANDING,AIRPORT_LANDING_HEIGHT,AIRPORT_PIER_HEIGHT} from '../src/world/airport-ground.js';
import {buildAirportVehicleYard} from '../src/world/airport-vehicle-yard.js';
import {AIRPORT_FERRY,AIRPORT_FERRY_PORTS,AIRPORT_PASSAGES,airportFerryPose} from '../src/world/airport-ferry.js';
import {TURN_LIMITS} from '../src/world/ferry-paths.js';
import {BREAKWATER,OUTER_PIER} from '../src/world/layout.js';
import {MINATO_BERTH} from '../src/world/minato-berth.js';
import {airportShoreDistance} from '../src/world/airport-island.js';
import {FERRY_RAMP,FERRY_DECKS} from '../src/world/ferry-model.js';
import {FERRY_BERTH} from '../src/world/ferry.js';
import {ferryServiceFixture} from './ferry-service-fixture.mjs';
import {createTownTraffic} from '../src/world/town-traffic.js';
import {KITANO_ROAD_LENGTH,roadPoint,kitanoRoadAt} from '../src/world/kitano-link-plan.js';
import {buildKitanoLink} from '../src/world/kitano-link.js';
import {QUICK_CROSSING,QUICK_SIGN} from '../src/world/ferry-quick-crossing.js';
import {HOUSE_HEAD} from '../src/world/house-walk.js';
import {standingHitsRect} from '../physics.js';

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
 const half=AIRPORT_FERRY.length/2;
 assert.ok(x+half<AIRPORT_JETTY.minX,'Hull overlaps the pier');
 assert.ok(x+half+FERRY_RAMP.length>AIRPORT_JETTY.minX,'Bow ramp does not reach the pier');
 assert.ok(Math.abs(z-31)<1e-7);
});

/** The harbour's solids a hull must keep off (layout.js, harbour.js, town.js): x0, x1, z0, z1. */
const HARBOUR_SOLIDS=Object.freeze({
 breakwater:[BREAKWATER.minX,BREAKWATER.maxX,BREAKWATER.z-BREAKWATER.thickness/2,BREAKWATER.z+BREAKWATER.thickness/2],outerPier:[-4.1,4.1,OUTER_PIER.z-OUTER_PIER.length/2,-49.65],quay:[-19,19,-49.65,-38],
 secondPier:[-38.3,-33.7,-64.3,-44],secondPierArm:[-38.3,-23.7,-64.3,-59.7],houseboat:[-42.05,-38.95,-59.9,-53.1],
 // The berth's fenders on the pier's west face (minato-berth.js): she lies on their faces, and slides off them.
 fenders:[MINATO_BERTH.line,-4.1,MINATO_BERTH.fenders.z.at(-1)-MINATO_BERTH.fenders.base/2,MINATO_BERTH.fenders.z[0]+MINATO_BERTH.fenders.base/2],
});
const rectGap=([x,z],[x0,x1,z0,z1])=>{const dx=Math.max(x0-x,0,x-x1),dz=Math.max(z0-z,0,z-z1);return dx||dz?Math.hypot(dx,dz):-Math.min(x-x0,x1-x,z-z0,z1-z);};
/** Points round the hull's outline at a pose, every 0.4 m along her sides and across her ends. */
const outline=(p,hb=AIRPORT_FERRY.beam/2,hl=AIRPORT_FERRY.length/2)=>{const c=Math.cos(p.yaw),s=Math.sin(p.yaw),out=[];
 for(let dx=-hb;dx<=hb+1e-9;dx+=hb/4)for(let dz=-hl;dz<=hl+1e-9;dz+=.4)out.push([p.x+c*dx+s*dz,p.z-s*dx+c*dz]);return out;};

test('the shared ferry crosses round the breakwater, a metre and more off every pier, wall and shore',()=>{
 const ports=AIRPORT_FERRY_PORTS;
 assert.deepEqual(ports.town.berth,[FERRY_BERTH.x,FERRY_BERTH.z]);
 for(const destination of ['airport','town']){
  const plan=AIRPORT_PASSAGES[destination];
  for(let t=0;t<=plan.duration;t+=.5){
   const p=plan.pose(t);for(const k of ['x','z','yaw','speed','turn','exposure'])assert.ok(Number.isFinite(p[k]),k);
   // Alongside at either end she lies where her berth is; between them, her hull keeps clear.
   const atTown=destination==='airport'?t<1:t>plan.duration-1,atKitano=destination==='airport'?t>plan.duration-1:t<1;
   for(const q of outline(p)){
    for(const [name,r] of Object.entries(HARBOUR_SOLIDS)){
     // Alongside the pier she backs off along its face, as close as she lies moored.
     const need=name==='fenders'?-.005:name==='outerPier'?.1:name==='quay'?.5:1;
     assert.ok(rectGap(q,r)>=need,`${destination} at ${t.toFixed(1)} s: hull ${rectGap(q,r).toFixed(2)} m off the ${name} at ${q.map(v=>v.toFixed(1))}`);
    }
    if(!atKitano)assert.ok(airportShoreDistance(...q)>2,`${destination} at ${t.toFixed(1)} s: hull within 2 m of Kitano-jima's shore at ${q.map(v=>v.toFixed(1))}`);
    // Over the island's reclaimed side only where her bow comes in beside the jetty.
    const [u,v]=airportLocal(...q);assert.ok(!(u> -60&&u<178&&v>20&&v<132)||(u<AIRPORT_JETTY.minX&&Math.abs(v-31)<=AIRPORT_FERRY.beam/2+.05),'Hull over airport land at local '+[u.toFixed(1),v.toFixed(1)]);
   }
  }
  for(const end of [0,1]){const p=airportFerryPose(destination,end),berth=end?ports[destination].berth:ports[destination==='airport'?'town':'airport'].berth;assert.ok(Math.hypot(p.x-berth[0],p.z-berth[1])<1e-6,'she starts and ends at the berths');}
 }
});

test('she moves like a ship: no snaps, her speed continuous, her turns within what she can make',()=>{
 for(const destination of ['airport','town']){
  const plan=AIRPORT_PASSAGES[destination];
  // The 34.5 m ship's harbour work at either end (astern, the pivot, out by the mouth; in, the pivot,
  // alongside) keeps its own minutes; the rest is the sea, which since Kitano-jima moved far across the
  // strait is most of the crossing, at her steady sea pace.
  assert.ok(Math.abs(plan.duration-AIRPORT_FERRY.duration*60)<1e-6);
  const minutes=kind=>plan.legs.filter(l=>l.kind===kind).reduce((sum,l)=>sum+(l.until-l.from)/60,0);
  for(const kind of ['astern','swing','approach','berthing'])assert.ok(minutes(kind)>=1,'the harbour legs keep their own times');
  assert.ok(minutes('sea')>8&&minutes('sea')<14,'the long strait is the sea leg, at her steady sea pace');
  const speed=kind=>{const l=plan.legs.find(l=>l.kind===kind);return (plan.pose(l.until).distance-plan.pose(l.from).distance)/(l.until-l.from);};
  for(const kind of ['astern','swing','manoeuvring','berthing'])assert.ok(speed('sea')>speed(kind),'faster at sea than '+kind);
  let prev=plan.pose(0);
  for(let t=.25;t<=plan.duration;t+=.25){
   const p=plan.pose(t);
   const limit=TURN_LIMITS[p.kind]*Math.PI/180;
   assert.ok(Math.abs(p.turn)<=limit*1.001,`${destination} ${p.kind} at ${t} s turns ${(Math.abs(p.turn)*180/Math.PI).toFixed(2)}°/s (limit ${TURN_LIMITS[p.kind]})`);
   // Heading and speed change smoothly: what she turns in a quarter second is what her rate of turn says.
   let dy=p.yaw-prev.yaw;while(dy>Math.PI)dy-=2*Math.PI;while(dy<-Math.PI)dy+=2*Math.PI;
   assert.ok(Math.abs(dy)<=limit*.25*1.05+1e-6,`${destination} snaps ${(dy*180/Math.PI).toFixed(2)}° at ${t} s`);
   // A small ferry gathers way at a tenth of a metre a second each second or less (0 to 11 knots in a minute).
   assert.ok(Math.abs(p.speed-prev.speed)<=.15*.25,`${destination} speed jumps at ${t} s`);
   assert.ok(p.speed>=0&&p.speed<1.5,'never faster than three knots through the World (the sea is compressed)');
   prev=p;
  }
  assert.equal(plan.pose(0).speed,0);assert.ok(plan.pose(plan.duration).speed<1e-9,'she comes to rest alongside');
  // She sounds a prolonged blast and three short (going astern) as she leaves her berth.
  assert.deepEqual(plan.signals.filter(s=>s.at===0).map(s=>s.kind),['prolonged','astern']);
 }
 // Passing the breakwater's end, each way: one prolonged blast (Rule 34(e)).
 const out=AIRPORT_PASSAGES.airport,inn=AIRPORT_PASSAGES.town,end=([x,z])=>Math.hypot(x-BREAKWATER.minX,z-BREAKWATER.z);
 for(const [plan,label] of [[out,'out'],[inn,'in']]){const s=plan.signals.find(s=>s.at>0);assert.ok(s&&s.kind==='prolonged',label);const p=plan.pose(s.at);assert.ok(end([p.x,p.z])<16,label+' blast is sounded at the breakwater’s end, not '+end([p.x,p.z]).toFixed(0)+' m away');}
});

function playerService(){
 const s=ferryServiceFixture(),q=QUICK_CROSSING.town;
 // A waiting observer stands on the pier, clear of the working passenger gangway.
 s.player.position.set(q.stand[0],q.ground,q.stand[1]);return s;
}
function trafficStub(s,values){const traffic={update(){}};Object.defineProperties(traffic,Object.getOwnPropertyDescriptors(values));s.world.traffic=traffic;s.run.bindVehicleController(traffic);return traffic;}

test('one hull carries the player both ways, preserves saves and returns at safe heights',()=>{
 const s=playerService();assert.equal(s.group.children.filter(o=>/ferry/i.test(o.name)&&o.isGroup).length,1);
 s.play.action('airport-ferry');s.chooseDeparture();s.tick(0);assert.equal(s.run.phase,'preparing');assert.equal(s.play.cinematic,false);s.complete();
 assert.equal(s.run.berth,'airport');assert.equal(s.state.island.journey.location,'airport');assert.equal(s.state.island.visits,1);
 assert.equal(s.aboard(),true,'He remains on the supported passenger deck to walk ashore');assert.equal(s.run.canUnload,true);assert.equal(s.state.yen,1000-FERRY_FARE);
 s.state.yen=0;s.state.island.journey.roundTrip=false; // Old save with a missing fare flag must still get home.
 s.play.action('airport-return');s.chooseDeparture();s.complete();
 assert.equal(s.run.berth,'town');assert.equal(s.state.island.journey.location,'town');assert.equal(s.aboard(),true);assert.equal(s.run.canUnload,true);
 assert.equal(s.state.yen,0);assert.deepEqual(s.state.inventory,['Saved keepsake']);assert.equal(s.state.island.treasury,43210);
});

test('calling from the opposite shore brings the same empty hull before boarding',()=>{
 const s=playerService();s.run.parkAt('airport');s.player.position.set(...[AIRPORT_FERRY_PORTS.town.landing[0],.098,AIRPORT_FERRY_PORTS.town.landing[1]]);
 const before=s.run.ferry.position.clone(),playerBefore=s.player.position.clone();
 s.play.action('airport-ferry');s.chooseDeparture();s.tick(0);
 assert.equal(s.run.destination,'town');assert.ok(s.run.ferry.position.distanceTo(before)<.04,'Hull teleported to the passenger');
 s.tick(1);assert.deepEqual(s.player.position.toArray(),playerBefore.toArray(),'Passenger moved during empty pickup');
 s.complete();assert.equal(s.state.island.journey.location,'airport');assert.equal(s.state.island.visits,1);assert.equal(s.aboard(),true);assert.equal(s.run.canUnload,true);
});

test('loading keeps passengers off vehicle lanes and waits for actual boarding readiness',()=>{
 const s=playerService(),berth=s.run.ferry.position.clone();let loading=true;
 trafficStub(s,{prepareCrossing:()=>!loading,get loadingVehicles(){return loading;}});
 s.play.action('airport-ferry');s.chooseDeparture();s.tick(0);
 s.until(()=>s.run.operation?.plant.ready&&s.run.operation.blocking==='Waiting for the vehicle on the loading route.');
 assert.equal(s.run.phase,'preparing');assert.ok(s.run.ferry.position.distanceTo(berth)<.04,'Readiness cannot move the hull during loading');s.run.ferry.updateMatrixWorld(true);
 const local=s.player.position.clone().applyMatrix4(s.run.ferry.matrixWorld.clone().invert());
 // Passengers ride on the open upper deck, never on the car deck among the cars.
 const [px,py,pz]=FERRY_DECKS.passenger;assert.ok(local.distanceTo(new THREE.Vector3(px,py,pz))<1e-6);
 assert.ok(Math.abs(local.y-FERRY_DECKS.upper.y)<1e-6,'Passenger is not on the upper deck');
 assert.ok(local.z+.32<FERRY_DECKS.upper.fore&&local.z-.32>FERRY_DECKS.upper.aft,'Passenger is off the upper deck');
 assert.ok(Math.abs(local.x)+.32<FERRY_DECKS.saloon.width/2-.08,'Passenger is outside the rails');
 // Clear of what stands on that deck: the funnel, the benches and the vents.
 assert.ok(local.z+.32< -6.9-.62*1.5,'Passenger stands in the funnel');
 assert.ok(Math.abs(local.x)+.32<1.75-.23,'Passenger stands on a bench');
 assert.ok(Math.abs(local.x)+.32<1.5-.28,'Passenger stands in a ventilator');
 const [u,v]=airportLocal(...AIRPORT_LANDING);assert.ok(Math.abs(v-31)>1.5,'Airport waiting point blocks vehicle lane');
 assert.ok(airportSurface(...AIRPORT_LANDING,.32));
 loading=false;s.until(()=>s.run.operation?.stage==='securing');assert.equal(s.run.phase,'preparing');
});

test('an owned car reaches the opposite shore with its existing driver without a player ferry ride',()=>{
 const s=playerService(),g=new THREE.Group();g.name='Chin';g.visible=false;g.userData.indoors='home';s.group.add(g);
 s.world.people.push({profile:{name:'Chin'},g});
 s.world.traffic=createTownTraffic({parent:s.group,colliders:s.world.colliders,ferry:s.run,people:()=>s.world.people});
 const car=s.world.traffic.fleet.find(v=>v.owner==='Chin'),playerBefore=s.player.position.clone(),cameraBefore=s.camera.matrixWorld.clone();
 let emptyPickup=false,loadedCrossing=false,boarding=false,unloading=false,parked=false;
 for(let i=0;i<24000;i++){
  s.tick(.1);
  const at=s.world.traffic.snapshot().find(v=>v.id===car.id);
  boarding||=at.transfer==='on';unloading||=at.transfer==='off';
  if(s.run.automaticCrossing){
   emptyPickup||=s.run.destination==='airport'&&at.location!=='aboard';
   if(s.run.destination==='town'&&at.location==='aboard'&&['passage','arriving'].includes(s.run.operation.stage)){
    loadedCrossing=true;assert.equal(g.parent,s.run.ferry,'The same driver walks to the passenger deck');assert.equal(g.userData.ferryPassenger,car.id);assert.equal(at.occupied,false);assert.equal(at.securing.progress,1);assert.equal(at.driverState.mode,'passenger');
   }
  }
  assert.equal(s.play.active,false,'Automatic cargo took control of the player');
  assert.deepEqual(s.player.position.toArray(),playerBefore.toArray());assert.deepEqual(s.camera.matrixWorld.elements,cameraBefore.elements);
  if(loadedCrossing&&at.location==='service'&&at.shore==='town'){parked=true;break;}
 }
 assert.ok(emptyPickup,'Remote cargo was never collected');assert.ok(boarding&&loadedCrossing&&unloading&&parked,'The car did not complete driving, loading, crossing and parking');
 assert.equal(s.group.children.filter(o=>/ferry/i.test(o.name)&&o.isGroup).length,1);
 assert.equal(s.state.island.journey.location,'town');assert.equal(s.state.island.visits,0);assert.equal(s.state.yen,1000);
 assert.deepEqual(s.timePasses,[],'An automatic car voyage does not jump the town clock');
});

test('automatic crossings wait for vehicle transfer, and passenger requests preserve their progress',()=>{
 const s=playerService();let transfer=true;
 trafficStub(s,{pendingVehicleJourney:()=>({id:'car',origin:'town',destination:'airport'}),prepareCrossing:()=>!transfer,get loadingVehicles(){return transfer;}});
 s.tick(1);assert.equal(s.run.phase,'preparing','An unfinished transfer remains in departure preparation');
 s.until(()=>s.run.operation?.plant.ready&&s.run.operation.blocking==='Waiting for the vehicle on the loading route.');
 assert.equal(s.run.crossingProgress,0);transfer=false;assert.equal(s.run.automaticCrossing,true);
 s.until(()=>s.run.operation?.stage==='passage');s.tick(5);const progress=s.run.crossingProgress,position=s.run.ferry.position.clone(),cameraBefore=s.camera.position.clone();
 s.play.tick(4);assert.equal(s.run.crossingProgress,progress,'The island observer does not advance the world clock a second time');
 assert.equal(s.run.beginCrossing('town'),false,'Another request restarted the hull mid-crossing');
 s.play.action('airport-ferry');s.chooseDeparture();
 assert.equal(s.play.phase,'awaiting-boat');assert.equal(s.run.crossingProgress,progress);assert.equal(s.run.ferry.position.distanceTo(position),0);
 const waiting=s.player.position.clone();s.tick(1);
 assert.ok(s.run.crossingProgress>progress);assert.deepEqual(s.player.position.toArray(),waiting.toArray());assert.deepEqual(s.camera.position.toArray(),cameraBefore.toArray());
 // The cargo trip finishes at airport, so the same hull returns to collect this town passenger.
 s.world.traffic.pendingVehicleJourney=()=>null;s.until(()=>!s.play.active,{seconds:3600});
 assert.equal(s.state.island.journey.location,'airport');assert.equal(s.run.berth,'airport');assert.equal(s.state.island.visits,1);
});

test('a landing sign at each end stands clear of her gangway, her lines, the queue and the cars’ lane',()=>{
 const s=playerService(),signs=s.anchors.filter(a=>/^Quick crossing to/.test(a.label));
 assert.deepEqual(signs.map(a=>a.label).sort(),['Quick crossing to Kitano-jima','Quick crossing to Minato']);
 s.group.updateMatrixWorld(true);
 // Minato: on the pier, in from the berthing face, off the gangway and the queue, between the springs' bitts.
 const [mx,mz]=QUICK_CROSSING.town.at,face=OUTER_PIER.x-OUTER_PIER.width/2;
 assert.ok(mx-face>.5&&mx-QUICK_SIGN.board.w/2-face>.2,'the sign stands over the berthing face');
 assert.ok(mz-(FERRY_BERTH.gangwayZ+.68)>.6,'the sign stands on the gangway');
 for(let place=0;place<8;place++){const [qx,qz]=s.run.queueSpot(place);assert.ok(Math.hypot(qx-mx,qz-mz)>1,'the sign stands in the queue');}
 const springs=MINATO_BERTH.bitts.filter(b=>/spring/.test(b.line)).map(b=>b.z);assert.ok(mz<Math.max(...springs)&&mz>Math.min(...springs),'a line leads across the sign');
 // Kitano-jima: in the north rail's shore stanchion, well off the cars’ lane (v 31) and the landing.
 const [u,v]=airportLocal(...QUICK_CROSSING.airport.at);
 assert.ok(Math.abs(u+49)<1e-9&&Math.abs(v-(AIRPORT_JETTY.maxZ-.12))<1e-9);assert.ok(v-31>2.5);
 // Both: the pole is a collider, the board is over a tall man's head, the prompt is reached from where he walks.
 const p=new THREE.Vector3();
 for(const a of signs){
  const q=Object.values(QUICK_CROSSING).find(q=>q.label===a.label);a.o.getWorldPosition(p);
  const c=s.world.colliders.find(c=>c.id===q.id);assert.ok(c&&standingHitsRect(q.at[0],q.at[1],.28,q.ground,c));
  assert.ok(QUICK_SIGN.board.bottom>HOUSE_HEAD+.15);
  const ground=a.label.endsWith('Minato')?airportSurface(p.x,p.z,.28):{y:OUTER_PIER.height};
  assert.ok(ground&&Math.abs(p.y-1-ground.y)<.01,a.label+' is not at hand height over a floor');
  assert.ok(!s.world.colliders.some(c=>standingHitsRect(p.x,p.z,.28,ground.y,c)),a.label+' cannot be stood at');
 }
});

test('the quick crossing is his alone: free, at once, sign to sign, and the ferry left to the residents',()=>{
 const s=playerService(),use=label=>s.anchors.find(a=>a.label===label).fn(),papers=()=>JSON.stringify(s.state.documentArchive??null);
 const ferry=()=>({berth:s.run.berth,phase:s.run.phase,destination:s.run.destination,progress:s.run.crossingProgress,at:s.run.ferry.position.toArray()});
 const before={minutes:s.minutes,yen:s.state.yen,papers:papers(),ferry:ferry(),visits:s.state.island.visits};
 use('Quick crossing to Kitano-jima');assert.equal(s.menu,null,'no menu: it is taken at once');
 assert.equal(s.play.active,false);assert.equal(s.state.island.journey.location,'airport');
 const K=QUICK_CROSSING.airport;assert.deepEqual(s.arrivals.at(-1),{x:K.stand[0],z:K.stand[1],y:K.ground});
 // He arrives on the jetty's side of its rail, clear of the pole, with the floor under him at the sign's foot.
 const [u,v]=airportLocal(...K.stand);assert.ok(Math.abs(u+49)<1e-9&&v<AIRPORT_JETTY.maxZ-.32&&v>AIRPORT_JETTY.minZ);
 assert.ok(Math.abs(airportSurface(...K.stand,.28).y-K.ground)<1e-9);
 assert.ok(!s.world.colliders.some(c=>standingHitsRect(K.stand[0],K.stand[1],.28,K.ground,c)),'he arrives in the pole');
 // Free, no time passes, nothing filed, and the ship has not moved.
 assert.equal(s.minutes,before.minutes);assert.equal(s.state.yen,before.yen);assert.equal(papers(),before.papers);assert.equal(s.state.island.visits,before.visits);
 assert.deepEqual(ferry(),before.ferry);
 use('Quick crossing to Minato');assert.equal(s.state.island.journey.location,'town');
 const T=QUICK_CROSSING.town;assert.deepEqual(s.arrivals.at(-1),{x:T.stand[0],z:T.stand[1],y:T.ground});
 assert.ok(!s.world.colliders.some(c=>standingHitsRect(T.stand[0],T.stand[1],.28,T.ground,c)),'he arrives in the pole or a bitt');
 assert.equal(s.minutes,before.minutes);assert.deepEqual(ferry(),before.ferry);
 // He faces inland on arriving: up the pier to its root, along the jetty to the shore.
 const ahead=yaw=>[-Math.sin(yaw),-Math.cos(yaw)];
 assert.ok(ahead(T.facing)[1]>.99);
 const [fu,fv]=airportLocal(K.stand[0]+ahead(K.facing)[0],K.stand[1]+ahead(K.facing)[1]);assert.ok(Math.abs(fu-(u+1))<1e-6&&Math.abs(fv-v)<1e-6);
});

test('her own crossings with cars go on untouched by his quick crossing, and a ride is never cut short by it',()=>{
 const s=playerService();let pending=true;
 trafficStub(s,{pendingVehicleJourney:()=>pending?{id:'car',origin:'town',destination:'airport'}:null,prepareCrossing:()=>true,loadingVehicles:0});
 s.tick(0);assert.equal(s.run.automaticCrossing,true);s.until(()=>s.run.operation?.stage==='passage');s.tick(5);pending=false;
 const progress=s.run.crossingProgress,at=s.run.ferry.position.clone();
 s.anchors.find(a=>a.label==='Quick crossing to Kitano-jima').fn();
 assert.equal(s.state.island.journey.location,'airport');assert.equal(s.run.automaticCrossing,true);
 assert.equal(s.run.crossingProgress,progress);assert.equal(s.run.ferry.position.distanceTo(at),0);
 s.tick(1);assert.ok(s.run.crossingProgress>progress,'her crossing stopped for him');
 // Riding her, the signs do nothing until he is ashore.
 const t=playerService();t.play.action('airport-ferry');t.chooseDeparture();t.tick(0);assert.equal(t.play.phase,'ferry');
 const where=t.state.island.journey.location;t.anchors.find(a=>a.label==='Quick crossing to Kitano-jima').fn();
 assert.equal(t.play.phase,'ferry');assert.equal(t.state.island.journey.location,where);
});
