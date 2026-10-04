import {createVehicleDrivers} from '../people/vehicle-driver.js';
import * as THREE from '../../vendor/three.module.js';
import {createRoadNetwork,createTraffic,makeLane} from './road-network.js';
import {buildVehicle,VEHICLE_SIZE} from './road-vehicles.js';
import {MAIN_ROAD,MAIN_SERVICE_COURT} from './main-road.js';
import {FERRY,FERRY_BERTH} from './ferry.js';
import {AIRPORT_ISLAND} from './airport-island.js';
import {AIRPORT_HEIGHT,airportWorld} from './airport-ground.js';
import {AIRPORT_VEHICLE_YARD as Y,airportVehiclePoint,airportVehicleBay} from './airport-vehicle-yard.js';

/** Owned vehicles travel on Main Street, the quay and the airport cargo court.
 * A single car shares the ferry's open foredeck with its existing resident driver.
 */
const MAIN_NORTH_X=MAIN_ROAD.x+1.1,MAIN_SOUTH_X=MAIN_ROAD.x-1.1;
export const KITANO_STOP_S=5.2;
export const FERRY_VEHICLE_DECK_Z=3.3;
export const QUAY_BAYS=Object.freeze([[.3,-40.9],[2.25,-40.3]].map(Object.freeze));
export const SERVICE_BAYS=Object.freeze([[-5.8,10],[-5.8,4.5]].map(Object.freeze));
export const TOWN_FERRY_STAGE=Object.freeze([FERRY_BERTH.x,0,-45.3]);
function smooth(points,rounds=3){let p=points;for(let r=0;r<rounds;r++){const out=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];if(i>0)out.push(a.map((v,k)=>v*.75+b[k]*.25));if(i<p.length-2)out.push(a.map((v,k)=>v*.25+b[k]*.75));}out.push(p.at(-1));p=out;}return p;}
const flat=(pts,y=0)=>pts.map(([x,z])=>[x,y,z]);
const airportPts=pts=>pts.map(([u,v])=>airportVehiclePoint(u,v));
export function buildTownNetwork(){
 const net=createRoadNetwork();
 net.add(makeLane('main-north',flat([[MAIN_NORTH_X,-33.5],[MAIN_NORTH_X,13.3]]),{speed:3.8}));
 net.add(makeLane('main-south',flat([[MAIN_SOUTH_X,-2],[MAIN_SOUTH_X,-38.6]]),{speed:3.8}));
 const turn=[];for(let i=0;i<=32;i++){const a=i*Math.PI/32;turn.push([MAIN_ROAD.x+Math.cos(a)*1.1,.04,16.5+Math.sin(a)*1.1]);}
 SERVICE_BAYS.forEach(([x,z],i)=>{const entry=smooth([[MAIN_SOUTH_X,16.5],[MAIN_SOUTH_X,z+(i?5.6:5.5)],[x,z+(i?4.8:4.7)],[x,z]]);net.add(makeLane('service-in-'+i,[[MAIN_NORTH_X,0,13.3],...turn,...flat(entry)],{speed:1.5}));net.add(makeLane('service-out-'+i,flat(smooth([[x,z],[x,z-(i?3.3:1)],[MAIN_SOUTH_X,z-(i?4.5:2.3)],[MAIN_SOUTH_X,-2]])),{speed:2.2}));});
 QUAY_BAYS.forEach(([x,z],i)=>{
  net.add(makeLane('quay-out-'+i,flat(smooth([[x,z],[x,-34.8],[MAIN_NORTH_X+.3,-34.8],[MAIN_NORTH_X,-33.5]])),{speed:2}));
  net.add(makeLane('quay-in-'+i,flat(smooth([[MAIN_SOUTH_X,-39.4],[-2.7,-42.6],[-2.2,-45.6],[-.9,-46.7],[x,-45.7],[x,z]])),{speed:1.8}));
 });
 const townStage=[...flat(smooth([[MAIN_SOUTH_X,-39.4],[-4.25,-42],[-4.25,-45.3]]))];
 for(let i=0;i<=32;i++){const a=-i*Math.PI/32;townStage.push([-5.35+Math.cos(a)*1.1,0,-45.3+Math.sin(a)*1.1]);}
 net.add(makeLane('town-ferry-stage',townStage,{speed:1.3}));
 const enter=[[-47,31],[-44,28.5],[-18,28.5]],far=[[-16,28.5],[-14.5,30],[-16,31.5]];
 Y.bays.forEach(([u,v],i)=>{
  const south=i<3;
  const incoming=south?[[-47,31],[-44,28.5],[u-5,28.5],[u-3,25],[u,25]]:[...enter,...far,[u+4,31.5],[u+3,v],[u,v]];
  const out=south?[[u,v],[u+2,25],[u+4,28.5],[-18,28.5],...far,[-43,31.5]]:[[u,v],[u-2.5,v],[u-4.5,31.5],[-43,31.5],[-44.5,32.5],[-46.5,32.5]];
  const path=smooth(out);if(south)path.push([-46.5,32.5]);
  // A half turn on the plaza leaves the nose towards shore; the car can reverse aboard.
  for(let j=0;j<=32;j++){const a=Math.PI/2+j*Math.PI/32;path.push([-46.5+Math.cos(a)*1.5,31+Math.sin(a)*1.5]);}
  net.add(makeLane('airport-in-'+i,airportPts(smooth(incoming)),{speed:1.7}));
  net.add(makeLane('airport-stage-'+i,airportPts(path),{speed:1.2}));
 });
 return net;
}

/** Actual hull transform supplies the deck, hinge and lowered ramp at either shore. */
export function ferryLanes(ferry,slot=0,berth='town'){
 ferry.updateMatrixWorld();const world=p=>new THREE.Vector3(...p).applyMatrix4(ferry.matrixWorld);
 const deck=world([0,ferry.userData.deckY,FERRY_VEHICLE_DECK_Z]),bow=world([0,ferry.userData.deckY,FERRY.length/2]);
 const slope=berth==='airport'?-.008:.24,ramp=world([0,ferry.userData.deckY-2.4*Math.sin(slope),FERRY.length/2+2.4*Math.cos(slope)]);
 const deckPts=[deck.toArray(),bow.toArray(),ramp.toArray()];
 if(berth==='airport'){
  const lead=airportPts(smooth([Y.stage,[-50,29.5],[-52.5,31],[-54.5,31]]));
  return {on:makeLane('airport-ferry-on',[...lead,ramp.toArray(),bow.toArray(),deck.toArray()],{speed:1}),off:makeLane('airport-ferry-off',[...deckPts,...airportPts([[-51,31],[-47,31]])],{speed:1.4}),deck,ramp,yaw:ferry.rotation.y};
 }
 const x=FERRY_BERTH.x;
 const off=[...deckPts,[x,0,-47.9],...flat(smooth([[x,-47.4],[x,-45.6],[-5.2,-44.4],[-3,-44.3],[-2,-42.6],[MAIN_NORTH_X,-40.2]])),[MAIN_NORTH_X,0,-39]];
 return {on:makeLane('town-ferry-on',[TOWN_FERRY_STAGE,ramp.toArray(),bow.toArray(),deck.toArray()],{speed:1}),off:makeLane('town-ferry-off',off,{speed:1.5}),deck,ramp,yaw:ferry.rotation.y};
}

export function createTownTraffic({parent,colliders=null,ferry=null,getPlayerPosition=()=>null,people=()=>[],register=null,onAction=null}){
 const group=new THREE.Group();group.name='Road traffic';parent.add(group);
 const net=buildTownNetwork(),drivers=createVehicleDrivers({people});
 const obstacles=()=>{const out=[],p=getPlayerPosition?.();if(p)out.push({x:p.x,z:p.z,r:.4,player:true});for(const q of people()){const g=q?.g;if(g?.visible&&!g.userData.playerControlled&&!g.userData.inVehicle&&!g.userData.indoors)out.push({x:g.position.x,z:g.position.z,r:.35});}return out;};
 const traffic=createTraffic({obstacles});let serial=0,requestedCrossing=null;
 const make=(kind,colour,role,owner,purpose)=>{const g=buildVehicle(kind,colour);group.add(g);const v=traffic.add({g,kind,role,owner,driver:owner,purpose,id:'owned-car-'+(++serial),...VEHICLE_SIZE[kind]});Object.assign(g.userData,{owner,driver:owner,purpose,vehicleId:v.id});g.name=owner+' · '+kind;const a=new THREE.Object3D();a.position.y=1.2;g.add(a);register?.(a,'Inspect '+owner+'’s '+kind,()=>onAction?.('inspect',owner+'’s '+kind,'Owner and driver: '+owner+'. '+purpose+'.'));v.solid={id:'parked-vehicle',x:1e6,z:1e6,w:v.width,d:v.length,yaw:0,height:2};colliders?.push(v.solid);return v;};
 const airportTaken=new Set(),townTaken=new Set();
 const parkAt=(v,p)=>{v.where=p.where;v.bay=p.bay;v.shore=p.where==='airport'?'airport':'town';delete v.stageOrigin;traffic.park(v,p);Object.assign(v.solid,{x:p.x,z:p.z,yaw:p.yaw,height:p.y+1.9});};
 const unpark=v=>{v.solid.x=v.solid.z=1e6;if(v.where==='airport')airportTaken.delete(v.bay);if(v.where==='service')townTaken.delete(v.bay);v.where='driving';};
 const reserve=(shore)=>{const set=shore==='airport'?airportTaken:townTaken,order=shore==='airport'?[0,1,2,3,4,5]:[1,0];for(const i of order)if(!set.has(i)){set.add(i);return i;}return null;};
 const quayBay=i=>{const [x,z]=QUAY_BAYS[i];return {where:'quay',bay:i,x,y:0,z,yaw:0};};
 const serviceBay=i=>{const [x,z]=SERVICE_BAYS[i];return {where:'service',bay:i,x,y:0,z,yaw:Math.PI};};
 const islanders=[make('kei truck',0x5f8f5a,'islander','Tetsuo','Collect airport cargo for the workshop'),make('car',0xe9e6dc,'islander','Harbour master','Inspect airport cargo manifests')];
 const appointments=[{leave:690,back:750},{leave:960,back:1020}];islanders.forEach((v,i)=>{v.home='town';v.homeBay=i;v.appointment=appointments[i];parkAt(v,quayBay(i));});
 const fleet=[make('kei truck',0xf2f0ea,'ferry','Kenji','Deliver airport repair freight to Main Street'),make('car',0x3f7fc0,'ferry','Reiko','Deliver airport newspapers to Main Street'),make('kei truck',0x2f6f9f,'ferry','Mrs Sato','Deliver airport kitchen supplies to Main Street'),make('car',0xc8432f,'ferry','Aya','Deliver airport book orders to Main Street')];
 fleet.forEach((v,i)=>{v.home='airport';v.appointment={leave:600+i*180,back:690+i*180};const bay=reserve('airport');v.homeBay=bay;parkAt(v,airportVehicleBay(bay));});
 const all=[...islanders,...fleet];
 const wantedShore=(v,minutes)=>{const m=((minutes%1440)+1440)%1440,a=v.appointment;return m>=a.leave&&m<a.back?(v.home==='town'?'airport':'town'):v.home;};
 function stage(v,destination){
  if(!drivers.board(v))return false;const shore=v.shore,bay=v.bay;unpark(v);v.shipDestination=destination;v.stageOrigin=shore;
  const path=shore==='airport'?net.path(['airport-stage-'+bay]):net.path([...(v.role==='islander'?['quay-out-'+v.homeBay,'main-north','service-in-1','service-out-1']:['service-out-'+bay]),'main-south','town-ferry-stage']);
  traffic.drive(v,path,{onArrive:()=>{v.where='waiting-ferry';v.stageOrigin=shore;}});return true;
 }
 function sitOnDeck(v){ferry.ferry.updateMatrixWorld();const p=new THREE.Vector3(0,ferry.ferry.userData.deckY,FERRY_VEHICLE_DECK_Z).applyMatrix4(ferry.ferry.matrixWorld);v.g.position.copy(p);v.g.quaternion.copy(ferry.ferry.quaternion);v.g.visible=ferry.ferry.visible&&drivers.has(v);}
 function unload(v){
  const shore=ferry.berth,directHome=shore==='town'&&v.role==='islander';const bay=directHome?v.homeBay:reserve(shore);if(bay===null)return false;
  const lanes=ferryLanes(ferry.ferry,0,shore);v.where='driving';v.transfer='off';v.shore=shore;v.bay=bay;
  const tail=shore==='airport'?['airport-in-'+bay]:directHome?['main-north','service-in-1','service-out-1','main-south','quay-in-'+bay]:['main-north','service-in-'+bay];
  traffic.drive(v,net.path([lanes.off,...tail]),{onArrive:()=>{v.transfer=null;v.shipDestination=null;parkAt(v,shore==='airport'?airportVehicleBay(bay):directHome?quayBay(bay):serviceBay(bay));if(shore===v.home)drivers.release(v,{restore:v.home==='airport'});}});return true;
 }
 function updateFerry(){
  if(!ferry)return;
  for(const v of all)if(v.where==='aboard')sitOnDeck(v);
  if(ferry.phase!=='waiting'){requestedCrossing=null;return;}
  const aboard=all.find(v=>v.where==='aboard');if(aboard&&aboard.shipDestination===ferry.berth){unload(aboard);return;}
  if(aboard||all.some(v=>v.transfer))return;
  const next=all.find(v=>v.where==='waiting-ferry'&&v.stageOrigin===ferry.berth&&v.shipDestination===requestedCrossing);
  if(!next||!drivers.has(next)||ferry.rampDown<.95)return;
  const lanes=ferryLanes(ferry.ferry,0,ferry.berth);next.where='driving';next.transfer='on';
  traffic.drive(next,net.path([lanes.on]),{reverse:true,onArrive:()=>{next.transfer=null;next.where='aboard';sitOnDeck(next);}});
 }
 const loadingCount=()=>all.filter(v=>v.transfer).length;
 return {group,network:net,traffic,fleet,islanders,appointments,drivers,serviceCourt:MAIN_SERVICE_COURT,
  prepareCrossing(destination){requestedCrossing=destination;updateFerry();if(all.some(v=>v.where==='aboard'&&v.shipDestination===destination)&&!loadingCount())return true;const active=all.some(v=>v.transfer||v.where==='driving'&&v.stageOrigin===ferry?.berth&&v.shipDestination===destination);const waiting=all.some(v=>v.where==='waiting-ferry'&&v.stageOrigin===ferry?.berth&&v.shipDestination===destination);return !active&&!waiting;},
  pendingVehicleJourney(){const v=all.find(v=>v.where==='aboard'||v.transfer==='on')||all.find(v=>v.where==='waiting-ferry');return v?.shipDestination?{id:v.id,origin:v.stageOrigin||v.shore,destination:v.shipDestination}:null;},
  /** Offline time settles the errands and returns each borrowed resident to town life. */
  reconcileAbsent(){
   requestedCrossing=null;airportTaken.clear();townTaken.clear();
   for(const v of all){drivers.release(v,{restore:true});v.transfer=null;v.shipDestination=null;v.hold=false;v.blocker=null;v.waited=0;v.personWait=0;
    if(v.home==='airport'){airportTaken.add(v.homeBay);parkAt(v,airportVehicleBay(v.homeBay));}else parkAt(v,quayBay(v.homeBay));
   }
   if(ferry)ferry.loadingVehicles=0;
  },
  get loadingVehicles(){return loadingCount();},
  snapshot:()=>all.map(v=>({id:v.id,owner:v.owner,driver:v.driver,purpose:v.purpose,location:v.where,shore:v.shore,destination:v.shipDestination??null,driving:!!v.trip,occupied:drivers.has(v),transfer:v.transfer??null,position:v.g.position.toArray()})),
  update(dt,minutes){if(Number.isFinite(minutes))for(const v of all){if(!['quay','service','airport'].includes(v.where))continue;const want=wantedShore(v,minutes);if(want!==v.shore)stage(v,want);}updateFerry();if(ferry)ferry.loadingVehicles=loadingCount();traffic.update(dt);for(const v of all)if(v.trip&&!drivers.has(v)){v.hold=true;v.speed=0;}}
 };
}
