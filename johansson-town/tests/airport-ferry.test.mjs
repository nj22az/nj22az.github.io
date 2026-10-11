import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {AIRPORT_JETTY,buildAirportIsland} from '../src/world/airport-island.js';
import {airportWorld,airportLocal,airportSurface,AIRPORT_LANDING,AIRPORT_LANDING_HEIGHT,AIRPORT_PIER_HEIGHT} from '../src/world/airport-ground.js';
import {buildAirportVehicleYard} from '../src/world/airport-vehicle-yard.js';
import {AIRPORT_FERRY,AIRPORT_FERRY_PORTS,AIRPORT_PASSAGES,airportFerryPose} from '../src/world/airport-ferry.js';
import {TURN_LIMITS} from '../src/world/ferry-paths.js';
import {BREAKWATER,OUTER_PIER} from '../src/world/layout.js';
import {MINATO_BERTH} from '../src/world/minato-berth.js';
import {airportShoreDistance} from '../src/world/airport-island.js';
import {FERRY_RAMP,FERRY_DECKS} from '../src/world/ferry-model.js';
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
 const s=playerService(),shore=new THREE.Vector3(AIRPORT_FERRY_PORTS.town.landing[0],AIRPORT_FERRY_PORTS.town.height,AIRPORT_FERRY_PORTS.town.landing[1]);s.player.position.copy(shore);
 let preparation=0;s.world.traffic={prepareCrossing(){return ++preparation>=4;}};
 s.play.action('airport-ferry');s.choose('Buy return');s.choose('Board');
 for(let i=0;i<3;i++){s.play.tick(1);assert.equal(s.run.phase,'waiting');assert.deepEqual(s.player.position.toArray(),shore.toArray());}
 s.play.tick(1);assert.equal(s.run.phase,'crossing');s.run.ferry.updateMatrixWorld(true);
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
