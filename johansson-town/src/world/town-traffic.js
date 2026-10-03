import {createVehicleDrivers} from '../people/vehicle-driver.js';
import * as THREE from '../../vendor/three.module.js';
import {createRoadNetwork,createTraffic,makeLane} from './road-network.js';
import {buildVehicle,VEHICLE_SIZE} from './road-vehicles.js';
import {KITANO_ROAD,KITANO_ROAD_LENGTH,KITANO_SURFACE_LIFT,roadPoint,roadHeight,leftOf} from './kitano-link-plan.js';
import {MAIN_ROAD} from './main-road.js';
import {FERRY,FERRY_BERTH} from './ferry.js';
import {AIRPORT_HEIGHT} from './airport-ground.js';

/**
 * The island's traffic on one road network (road-network.js), keeping to the left.
 *
 * Lanes: Main Street's two lanes between the quay and the Kitano Road junction; Kitano
 * Road's two lanes out over the bridge to the airport car park; a loop round the car park
 * with its bays; the quay to the car ferry's bow ramp; two parking bays on the quay.
 *
 * Every vehicle belongs to an existing resident. The island cars make one daily
 * parts/manifest errand; ferry vehicles collect freight on the morning call and
 * return on the afternoon/evening call. Trips advance through the real road network.
 */
const MAIN_NORTH_X=MAIN_ROAD.x+1.1,MAIN_SOUTH_X=MAIN_ROAD.x-1.1;
const JUNCTION=Object.freeze({x:MAIN_ROAD.x,z:KITANO_ROAD.corners[0][1],r:8});
/** Where Kitano Road's westbound traffic stops: before the zebra across its mouth. */
export const KITANO_STOP_S=5.2;
/** Two vehicle places on the car deck, bow first: far enough apart for the truck and a car. */
const DECK_Z=[4.2,-.6];
/** Town parking on the quay, nose north, east of Main Street's foot: staggered, so neither blocks the other's way out. */
export const QUAY_BAYS=Object.freeze([[.6,-43.6],[2.75,-41.2]].map(Object.freeze));
/** The airport car park, in Kitano Road's own frame past its end: a along, b to the left. */
export const CAR_PARK=Object.freeze({minA:-.5,maxA:23,halfB:7.7,loop:3,bays:Object.freeze([[3.5,6.3],[10,6.3],[16.5,6.3],[3.5,-6.3],[10,-6.3],[16.5,-6.3]].map(Object.freeze))});

const ROAD_END=(()=>{const [x,z,hx,hz]=roadPoint(KITANO_ROAD_LENGTH),[lx,lz]=leftOf(hx,hz);return {x,z,hx,hz,lx,lz};})();
/** A point in the car park frame, in the town's. */
export function carParkPoint(a,b){const E=ROAD_END;return [E.x+E.hx*a+E.lx*b,E.z+E.hz*a+E.lz*b];}
export const CAR_PARK_YAW=Math.atan2(ROAD_END.hx,ROAD_END.hz);

/** Rounds a polyline's corners (Chaikin), keeping its ends. */
function smooth(points,rounds=3){
 let p=points;
 for(let r=0;r<rounds;r++){const out=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];if(i>0)out.push(a.map((v,k)=>v*.75+b[k]*.25));if(i<p.length-2)out.push(a.map((v,k)=>v*.25+b[k]*.75));}out.push(p.at(-1));p=out;}
 return p;
}
const flat=(pts,y=0)=>pts.map(([x,z])=>[x,y,z]);

/** A run of Kitano Road at a lane offset, between two stations (either way round). */
function kitanoLane(from,to,offset){
 const pts=[],dir=Math.sign(to-from);
 for(let s=from;dir>0?s<=to:s>=to;s+=dir*.5){const [x,z,hx,hz]=roadPoint(s),[lx,lz]=leftOf(hx,hz);pts.push([x+lx*offset,roadHeight(s)+KITANO_SURFACE_LIFT,z+lz*offset]);}
 return pts;
}

export function buildTownNetwork(){
 const net=createRoadNetwork(),S=KITANO_ROAD.speed,half=KITANO_ROAD.lane/2,TOWN_END=32;
 net.add(makeLane('main-north',flat([[MAIN_NORTH_X,-38.6],[MAIN_NORTH_X,-1.4]]),{speed:S.town}));
 net.add(makeLane('main-south',flat([[MAIN_SOUTH_X,1.6],[MAIN_SOUTH_X,-38.6]]),{speed:S.town}));
 net.add(makeLane('kitano-east-town',kitanoLane(1.6,TOWN_END,half),{speed:S.town}));
 net.add(makeLane('kitano-east-bridge',kitanoLane(TOWN_END,KITANO_ROAD_LENGTH,half),{speed:S.bridge}));
 net.add(makeLane('kitano-west-bridge',kitanoLane(KITANO_ROAD_LENGTH,TOWN_END,-half),{speed:S.bridge}));
 net.add(makeLane('kitano-west-town',kitanoLane(TOWN_END,KITANO_STOP_S,-half),{speed:S.town,stopAtEnd:JUNCTION}));
 // The car park: in along the left, round the far end, back out along the other side.
 const y=AIRPORT_HEIGHT,L=CAR_PARK.loop,P=(a,b)=>carParkPoint(a,b);
 const far=[[2.5,L],[19.5,L],[22,0],[19.5,-L],[2.5,-L]];
 CAR_PARK.bays.forEach(([a,b],i)=>{
  const side=Math.sign(b),run=side>0?[[0,half],...far.filter(p=>p[1]>0&&p[0]<a-2),[a-3,L],[a,b]]:[[0,half],...far.filter(p=>p[0]>a+2||p[1]>=0),[a+3,-L],[a,b]];
  net.add(makeLane('park-in-'+i,flat(smooth(run.map(([u,v])=>P(u,v))),y),{speed:2.2}));
  const out=side>0?[[a,b],[a+3,L],...far.filter(p=>p[0]>a+2||p[1]<=0),[0,-half]]:[[a,b],[a-3,-L],...far.filter(p=>p[1]<0&&p[0]<a-2),[0,-half]];
  net.add(makeLane('park-out-'+i,flat(smooth(out.map(([u,v])=>P(u,v))),y),{speed:2.2}));
 });
 // Island cars' bays on the quay.
 QUAY_BAYS.forEach(([x,z],i)=>{
  net.add(makeLane('quay-out-'+i,flat(smooth([[x,z],[x,Math.min(-39.9,z+1.6)],[MAIN_NORTH_X+.3,-39.9],[MAIN_NORTH_X,-39]])),{speed:2.4}));
  net.add(makeLane('quay-in-'+i,flat(smooth([[MAIN_SOUTH_X,-39.4],[-2.7,-42.6],[-2.2,-45.6],[-.9,-47.2],[x,-46.2],[x,z]])),{speed:2.4}));
 });
 return net;
}

/** The ferry's bow ramp and the quay, laid from where the ferry lies now. */
export function ferryLanes(ferry,slot){
 ferry.updateMatrixWorld();
 const deck=new THREE.Vector3(0,ferry.userData.deckY,DECK_Z[slot]).applyMatrix4(ferry.matrixWorld);
 const bow=new THREE.Vector3(0,ferry.userData.deckY,FERRY.length/2).applyMatrix4(ferry.matrixWorld);
 const x=FERRY_BERTH.x,quayZ=bow.z+2.6;
 // Off: straight up from the ramp, east along the south side of the bench, north into Main Street.
 const off=[[deck.x,deck.y,deck.z],[bow.x,bow.y,bow.z],[x,0,quayZ],...flat(smooth([[x,quayZ+.5],[x,-45.6],[-5.2,-44.4],[-3,-44.3],[-2,-42.6],[MAIN_NORTH_X,-40.2]])),[MAIN_NORTH_X,0,-39]];
 // On: down Main Street's south lane, round the bench's east end and onto the ramp bow first.
 const on=[...flat(smooth([[MAIN_SOUTH_X,-39.4],[-2.75,-42.4],[-3.2,-44.9],[-5.6,-45.3],[x,-46.4],[x,quayZ+.5]])),[x,0,quayZ],[bow.x,bow.y,bow.z],[deck.x,deck.y,deck.z]];
 return {off:makeLane('ferry-off-'+slot,off,{speed:2.6}),on:makeLane('ferry-on-'+slot,on,{speed:2.6}),deck,yaw:ferry.rotation.y};
}

export function createTownTraffic({parent,colliders=null,ferry=null,getPlayerPosition=()=>null,people=()=>[],register=null,onAction=null}){
 const group=new THREE.Group();group.name='Road traffic';group.userData.dynamicProp=true;parent.add(group);
 const net=buildTownNetwork(),drivers=createVehicleDrivers({people});
 const obstacles=()=>{
  const out=[],p=getPlayerPosition?.();if(p)out.push({x:p.x,z:p.z,r:.4,player:true});
  for(const q of people()){const g=q?.g;if(g?.visible&&!g.userData.playerControlled&&!g.userData.inVehicle&&!g.userData.indoors)out.push({x:g.position.x,z:g.position.z,r:.35});}
  return out;
 };
 const traffic=createTraffic({obstacles});
 let serial=0;
 const make=(kind,colour,role,owner,purpose)=>{
  const g=buildVehicle(kind,colour);group.add(g);
  const v=traffic.add({g,kind,role,owner,driver:owner,purpose,id:'owned-car-'+(++serial),...VEHICLE_SIZE[kind]});Object.assign(g.userData,{owner,driver:owner,purpose,vehicleId:v.id});g.name=owner+' · '+kind;const anchor=new THREE.Object3D();anchor.position.y=1.2;g.add(anchor);register?.(anchor,'Inspect '+owner+'’s '+kind,()=>onAction?.('inspect',owner+'’s '+kind,'Owner and driver: '+owner+'. '+purpose+'.'));
  // Solid where it stands parked; out of the way while it drives (people it meets wait or it waits).
  v.solid={id:'parked-vehicle',x:1e6,z:1e6,w:v.width,d:v.length,yaw:0,height:2};colliders?.push(v.solid);
  return v;
 };
 const bayTaken=new Set();
 const parkAt=(v,where)=>{
  v.where=where.where;v.bay=where.bay;
  traffic.park(v,where);
  Object.assign(v.solid,{x:where.x,z:where.z,yaw:where.yaw,height:where.y+1.9});
 };
 const unpark=v=>{v.solid.x=v.solid.z=1e6;if(v.where==='airport')bayTaken.delete(v.bay);v.where='driving';};
 // Bays on the far side are reached round the loop, so a car stands in them facing back.
 const airportBay=i=>{const [a,b]=CAR_PARK.bays[i],[x,z]=carParkPoint(a,b);return {where:'airport',bay:i,x,y:AIRPORT_HEIGHT,z,yaw:CAR_PARK_YAW+(b<0?Math.PI:0)};};
 const freeBay=()=>{for(let i=0;i<CAR_PARK.bays.length;i++)if(!bayTaken.has(i)){bayTaken.add(i);return i;}return null;};
 const toAirport=(v,lanes)=>{
  if(!drivers.board(v))return false;const bay=freeBay();if(bay===null){drivers.release(v,{restore:true});return false;}unpark(v);v.bay=bay;
  traffic.drive(v,net.path([...lanes,'main-north','kitano-east-town','kitano-east-bridge','park-in-'+bay]),{onArrive:()=>parkAt(v,airportBay(bay))});
  bayTaken.add(bay);return true;
 };
 const fromAirport=(v,lanes,onArrive)=>{
  if(!drivers.board(v))return false;const bay=v.bay;unpark(v);
  traffic.drive(v,net.path(['park-out-'+bay,'kitano-west-bridge','kitano-west-town','main-south',...lanes]),{onArrive});return true;
 };

 // ---- Island cars: quay ↔ airport by day. ----
 const islanders=[make('kei truck',0x5f8f5a,'islander','Tetsuo','Collect workshop parts at airport cargo'),make('car',0xe9e6dc,'islander','Harbour master','Inspect airport cargo manifests')];
 const quayBay=i=>{const [x,z]=QUAY_BAYS[i];return {where:'quay',bay:i,x,y:0,z,yaw:0};};
 islanders.forEach((v,i)=>parkAt(v,quayBay(i)));
 // Fixed daily errands; a resident sets off once and returns after the appointment.
 const appointments=[{leave:525,back:660},{leave:780,back:930}];
 const islanderWants=(i,minutes)=>{const m=((minutes%1440)+1440)%1440,a=appointments[i];return m>=a.leave&&m<a.back?'airport':'quay';};

 // ---- The car ferry's four. ----
 const fleet=[make('kei truck',0xf2f0ea,'ferry','Kenji','Collect repair freight'),make('car',0x3f7fc0,'ferry','Reiko','Collect the airport newspaper delivery'),make('delivery truck',0x2f6f9f,'ferry','Mrs Sato','Collect kitchen supplies'),make('car',0xc8432f,'ferry','Aya','Collect book orders')];
 const OFF=[1.4,2.1],ON=[.6,1.2];
 fleet.slice(0,2).forEach((v,i)=>{v.where='aboard';v.slot=i;v.g.visible=false;});
 fleet.slice(2).forEach(v=>{const bay=freeBay();parkAt(v,airportBay(bay));});
 let service=null,aboardOff=[],goingOn=[];
 function sitOnDeck(v){
  const f=ferry.ferry;f.updateMatrixWorld();
  const p=new THREE.Vector3(0,f.userData.deckY,DECK_Z[v.slot]).applyMatrix4(f.matrixWorld);
  v.g.position.copy(p);v.g.rotation.set(0,f.rotation.y+(v.facingStern?Math.PI:0),0);v.g.visible=f.visible;
 }
 function updateFerry(){
  if(!ferry)return;
  const phase=ferry.phase,e=ferry.alongsideFor;
  if(phase!=='away'&&ferry.service!==service&&(phase==='arriving'||phase==='waiting')){
   // A new call: whoever is aboard drives off; two from the car park drive on.
   service=ferry.service;
   // Off from the front of the deck first; on, the first one aboard goes deepest.
   aboardOff=fleet.filter(v=>v.where==='aboard'&&ferry.service===510).sort((a,b)=>a.slot-b.slot);aboardOff.forEach(v=>{v.facingStern=false;v.started=false;});
   goingOn=fleet.filter(v=>v.where==='airport'&&ferry.service>=870).slice(0,2);goingOn.forEach((v,i)=>{v.slot=1-i;v.started=false;});
  }
  for(const v of fleet)if(v.where==='aboard')sitOnDeck(v);
  if(phase!=='waiting'){
   // Returning cars wait on land for the next open ramp; they never jump aboard.
   return;
  }
  aboardOff.forEach((v,i)=>{
   if(v.started||e<OFF[i])return;v.started=true;
   const lanes=ferryLanes(ferry.ferry,v.slot);
   v.where='aboard-leaving';v.ferryTrip=true;
   if(!toAirport(v,[lanes.off])){v.where='aboard';v.started=false;return;}
   v.trip.onArrive=()=>{v.ferryTrip=false;parkAt(v,airportBay(v.bay));};

  });
  goingOn.forEach((v,i)=>{
   if(v.started||e<ON[i]||v.where!=='airport')return;v.started=true;
   const lanes=ferryLanes(ferry.ferry,v.slot);v.ferryTrip=true;
   const departed=fromAirport(v,[lanes.on],()=>{v.ferryTrip=false;v.where='aboard';v.facingStern=true;v.solid.x=v.solid.z=1e6;sitOnDeck(v);});if(!departed){v.started=false;v.ferryTrip=false;}

  });
 }
 function updateIslanders(minutes){
  islanders.forEach((v,i)=>{
   const want=islanderWants(i,minutes);
   if(v.where==='driving'){return;}
   if(v.where===want)return;
   v.heading=want;
   if(want==='airport'){if(!toAirport(v,['quay-out-'+v.bay]))v.heading=null;}
   else{const home=i;fromAirport(v,['quay-in-'+home],()=>{parkAt(v,quayBay(home));drivers.release(v);});}
  });
 }
 return {group,network:net,traffic,fleet,islanders,appointments,drivers,
  snapshot:()=>traffic.vehicles.map(v=>({id:v.id,owner:v.owner,driver:v.driver,purpose:v.purpose,location:v.where,driving:!!v.trip,occupied:drivers.has(v),position:v.g.position.toArray()})),
  update(dt,minutes){
   if(Number.isFinite(minutes))updateIslanders(minutes);
   updateFerry();
   for(const v of fleet){v.hold=!!(v.ferryTrip&&v.trip&&v.trip.path.pts.at(-1).z<FERRY_BERTH.z+FERRY.length/2+1&&v.trip.path.length-v.s<22&&ferry?.phase!=='waiting');}
   traffic.update(dt);
   for(const v of traffic.vehicles)if(v.trip&&!drivers.has(v)){v.hold=true;v.speed=0;}
  }};
}
