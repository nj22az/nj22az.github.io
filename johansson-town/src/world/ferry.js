import * as THREE from '../../vendor/three.module.js';
import {waveHeight,SEA_LEVEL} from './ocean.js';
import {HARBOUR_LINE,BUS_DWELL,nextService} from '../people/commuter-schedule.js';
import {AIRPORT_FERRY,AIRPORT_FERRY_PORTS,airportFerryPose} from './airport-ferry.js';
import {PORT_BUILDING} from './port-building.js';
import {FERRY_SHIP} from './ferry-ship.js';
import {buildFerryModel,GANGWAY_Z,WL} from './ferry-model.js';
import {BERTH_X,BERTH_Z,TOWN_ARRIVAL_KEYS,TOWN_DEPARTURE_KEYS,keyedPath} from './ferry-paths.js';

/**
 * One Minato–Kitano-jima ferry, the town's Minato Maru (ferry-ship.js), carries passengers and up
 * to three cars. At Minato she lies port side to the outer pier with her bow ramp on the quay and
 * her gangway from the deckhouse door to the pier; at Kitano-jima she uses the bow ramp. The legacy
 * commuter timetable interface remains available for residents and old saved games.
 * A player-requested crossing holds a safe berth until vehicles finish boarding.
 */
export const FERRY=Object.freeze({length:FERRY_SHIP.length,beam:FERRY_SHIP.beam,freeboard:FERRY_SHIP.freeboard,draft:FERRY_SHIP.draft,waterline:WL});
/** The outer pier's west flank (layout.js OUTER_PIER: x 0, 8.2 m wide). */
const PIER_WEST=-4.1;

/** Where it lies: alongside the pier's open west flank, clear of the rails and bollards. */
export const FERRY_BERTH=Object.freeze({
 x:BERTH_X,z:BERTH_Z,
 /** The gangway, from the deckhouse's port door to the pier, short of the pier's end. */
 gangwayZ:BERTH_Z+GANGWAY_Z,
});

/**
 * The terminal: a ticket booth and a shelter on the quay at the root of the pier. It
 * takes over from the bus station's points -- queue, platform, arrival, exit -- so the
 * schedules that walked people to the bus walk them here.
 */
export const FERRY_TERMINAL=Object.freeze({
 // The waiting hall of the Minato Port Building (port-building.js), on the quay at the
 // pier's root. It used to be a booth of its own beside the harbour office.
 id:'ferry-terminal',x:(PORT_BUILDING.hall.minX+PORT_BUILDING.hall.maxX)/2,z:(PORT_BUILDING.hall.minZ+PORT_BUILDING.hall.maxZ)/2,
 minX:PORT_BUILDING.hall.minX,maxX:PORT_BUILDING.hall.maxX,minZ:PORT_BUILDING.hall.minZ,maxZ:PORT_BUILDING.hall.maxZ,
 /** The gangway's foot on the pier, which is where the queue starts. */
 queue:Object.freeze([PIER_WEST+.6,FERRY_BERTH.gangwayZ]),
 /** Where somebody waiting stands: under the hall's canopy, off the pier. */
 platform:PORT_BUILDING.platform,
 /** Where the people it brought step onto the pier: the open pier end, clear of the crate stack. */
 arrival:Object.freeze([PIER_WEST+.9,FERRY_BERTH.gangwayZ-.7]),
 driver:PORT_BUILDING.driver,
 exit:PORT_BUILDING.platform,
});

/** The way in and the way out (ferry-paths.js): the centre's track, and where the bow points. */
const ARRIVAL=keyedPath(TOWN_ARRIVAL_KEYS),DEPARTURE_PATH=keyedPath(TOWN_DEPARTURE_KEYS);
const APPROACH=ARRIVAL.curve,DEPARTURE=DEPARTURE_PATH.curve;
/** Astern off the berth ends at the third key; the swing at the fifth; then she goes ahead. */
const ASTERN_END=DEPARTURE_PATH.at[2],SWING_END=DEPARTURE_PATH.at[4];

/**
 * Town minutes for each part of a call -- real minutes, since the clock is the one on your
 * wall (town-clock.js). A small ferry comes in off the sea, slows to a crawl inside the
 * breakwater and is alongside four and a half minutes later; it loads for a quarter of an
 * hour (BUS_DWELL); getting out of port takes five minutes -- astern off the berth, a slow
 * swing in the basin, dead slow to the breakwater -- and only then does it open up and
 * go. These used to be seconds, from when a town minute passed every second, which made
 * the whole manoeuvre sixty times too quick.
 */
export const FERRY_TIMES=Object.freeze({sea:1,harbour:3.5,reverse:1.5,turn:1.5,leaveHarbour:2,leaveSea:1.5});
/** Where along a curve it passes the breakwater's end: the harbour is the rest of the way. */
function shareAt(curve,[px,pz]){
 let best=0,bestD=Infinity;const v=new THREE.Vector3();
 for(let i=0;i<=400;i++){curve.getPointAt(i/400,v);const d=Math.hypot(v.x-px,v.z-pz);if(d<bestD){bestD=d;best=i/400;}}
 return best;
}
const BREAKWATER_END=[-45,-79];
export const HARBOUR_IN=shareAt(APPROACH,BREAKWATER_END);
/** On the ahead part of the departure (after the swing), the share at which she passes the breakwater. */
export const HARBOUR_OUT=(shareAt(DEPARTURE,BREAKWATER_END)-SWING_END)/(1-SWING_END);
/**
 * How far along (0–1) after `e` minutes of a leg with a speed change at a share `h`: the
 * arrival slows steadily across the sea and comes to rest at the berth; the departure
 * gathers way in the harbour and keeps accelerating at sea. Speeds match at the breakwater.
 */
export function inboundShare(e,T=FERRY_TIMES,h=HARBOUR_IN){
 const S=T.sea,H=T.harbour,v1=2*(1-h)/H,v0=2*h/S-v1;
 if(e<=0)return 0;if(e>=S+H)return 1;
 if(e<S)return v0*e+.5*(v1-v0)/S*e*e;
 const t=e-S;return Math.min(1,h+v1*t-.5*v1/H*t*t);
}
export function outboundShare(e,T=FERRY_TIMES,h=HARBOUR_OUT){
 const H=T.leaveHarbour,S=T.leaveSea,v1=2*h/H,a=2*((1-h)-v1*S)/(S*S);
 if(e<=0)return 0;if(e>=H+S)return 1;
 if(e<H)return h*(e/H)**2;
 const t=e-H;return h+v1*t+.5*a*t*t;
}

/** The ferry itself: the Minato Maru, modelled whole in ferry-model.js. */
export function buildFerry({shadows=false}={}){
 const ferry=buildFerryModel({shadows});ferry.name='Minato–Kitano-jima shared ferry';ferry.userData.dynamicProp=true;ferry.userData.walkSurface=false;
 return ferry;
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @returns the run, with the bus's interface.
 */
export function createFerryRun({parent,shadows=false,colliders}={}){
 const ferry=buildFerry({shadows});parent.add(ferry);
 let phase='away',t=0,service=null,serviceAt=null,lastMinutes=null,clock=0,yaw=0,x=FERRY_BERTH.x,z=FERRY_BERTH.z;
 let berth='town',localService=false,crossing=null;
 const DOOR=[FERRY_TERMINAL.queue[0],FERRY_TERMINAL.queue[1]];
 const set=(nx,nz,nyaw)=>{x=nx;z=nz;yaw=nyaw;};
 const park=()=>{set(FERRY_BERTH.x,FERRY_BERTH.z,0);ferry.visible=true;};
 // It rides the swell, but moored it barely moves.
 const place=()=>{
  const moored=phase==='waiting',sea=waveHeight(x,z,clock)-SEA_LEVEL;
  ferry.position.set(x,SEA_LEVEL+.12+sea*(moored?.25:.8),z);
  ferry.rotation.set(Math.sin(clock*.7+x)*(moored?.004:.02),yaw,Math.sin(clock*.9)*(moored?.006:.03));
  ferry.userData.gangway.visible=moored&&berth==='town';
  ferry.userData.setRamp?.(run.rampDown,berth==='airport'?-.008:.24);
  // Her screws turn and the radar sweeps while she moves; alongside both are still.
  const moved=Math.hypot(x-last.x,z-last.z),dt=clock-last.t;last.x=x;last.z=z;last.t=clock;
  if(dt>0&&dt<1)ferry.userData.underway?.(dt,moored?0:Math.min(6,moved/dt));
 };
 const last={x,z,t:0};
 // Nobody walks on the harbour, but the gangway's foot is on the pier: a collider for the
 // hull alongside stops the player stepping off the pier's open flank onto the water.
 const solid=colliders?{id:'ferry',moving:true,x:FERRY_BERTH.x,z:FERRY_BERTH.z,w:FERRY.beam,d:FERRY.length,height:3}:null;
 if(solid)colliders.push(solid);
 const trackSolid=()=>{if(!solid)return;const here=ferry.visible&&phase==='waiting';solid.x=here?x:1e6;solid.z=here?z:1e6;solid.yaw=yaw;};
 park();ferry.visible=false;trackSolid();
 const run={
  ferry,
  /** Kept under the old name too: the debug readout and a few callers ask for `.bus`. */
  get bus(){return ferry;},
  get phase(){return phase;},
  get berth(){return berth;},
  get destination(){return crossing?.destination||null;},
  get crossingProgress(){return crossing?.progress??null;},
  get automaticCrossing(){return crossing?.automatic===true;},
  /** Both passengers and vehicles use this single ferry group and these ports. */
  parkAt(location){
   if(!AIRPORT_FERRY_PORTS[location])throw new RangeError('Unknown ferry berth');
   const p=AIRPORT_FERRY_PORTS[location];berth=location;localService=true;crossing=null;phase='waiting';
   serviceAt=lastMinutes??0;service=service??0;set(p.berth[0],p.berth[1],p.yaw);ferry.visible=true;place();trackSolid();
  },
  beginCrossing(destination,{automatic=false}={}){
   if(phase==='crossing'||!AIRPORT_FERRY_PORTS[destination]||destination===berth)return false;
   localService=true;phase='crossing';crossing={destination,progress:0,automatic:!!automatic,elapsed:0};ferry.userData.gangway.visible=false;run.setCrossingProgress(0);trackSolid();return true;
  },
  /** The island simulation advances unaccompanied cargo runs without taking the camera. */
  advanceAutomaticCrossing(dt){
   if(!crossing?.automatic)return null;
   crossing.elapsed+=Number.isFinite(dt)?Math.max(0,dt):0;
   run.setCrossingProgress(crossing.elapsed/AIRPORT_FERRY.duration);
   if(crossing.progress<1)return null;
   const destination=crossing.destination;run.parkAt(destination);return destination;
  },
  setCrossingProgress(progress){
   if(!crossing)return false;crossing.progress=Math.max(0,Math.min(1,progress));
   const p=airportFerryPose(crossing.destination,crossing.progress);set(p.x,p.z,p.yaw);ferry.position.set(p.x,p.y,p.z);ferry.rotation.set(0,p.yaw,0);ferry.userData.setRamp(0);
   const moved=Math.hypot(p.x-last.x,p.z-last.z),dt=clock-last.t;last.x=p.x;last.z=p.z;last.t=clock;if(dt>0&&dt<1)ferry.userData.underway?.(dt,Math.min(6,moved/dt));
   return true;
  },
  get door(){return [...DOOR];},
  /** A queue across the pier end from the gangway, south of the crate stack and clear of the bollards. */
  queueSpot(place=0){return [DOOR[0]+place*.75,DOOR[1]-.35-(place%2)*.3];},
  /** On board: the deck beyond the gangway. */
  get doorway(){return [FERRY_BERTH.x+FERRY.beam/2-.9,FERRY_BERTH.gangwayZ];},
  get boarding(){return phase==='waiting'&&berth==='town';},
  /** Town minutes since it came alongside, while it is alongside. */
  get alongsideFor(){return phase==='waiting'&&Number.isFinite(serviceAt)?Math.max(0,lastMinutes-serviceAt):null;},
  /** The bow ramp: down a minute after it berths, up again a minute before it leaves. */
  get rampDown(){if(localService)return phase==='waiting'?1:0;const e=run.alongsideFor;if(e===null)return 0;const s=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};return Math.min(s(e-.2),s(BUS_DWELL-.4-e));},
  get service(){return service;},
  update(dt,minutes=0,time){
   if(!(dt>0))return;
   clock=Number.isFinite(time)?time:clock+dt;
   if(localService){lastMinutes=minutes;if(phase==='waiting')place();trackSolid();return;}
   try{
    if(lastMinutes===null||minutes<lastMinutes||minutes-lastMinutes>dt+1){
     phase='away';service=null;serviceAt=null;ferry.visible=false;
     const day=Math.floor(minutes/1440),m=minutes-day*1440;
     const current=HARBOUR_LINE.find(s=>m>=s&&m<s+BUS_DWELL);
     if(current!==undefined){service=current;serviceAt=day*1440+current;park();phase='waiting';}
    }
    lastMinutes=minutes;
    run.step(dt,minutes);
    if(ferry.visible)place();
   }finally{trackSolid();}
  },
  step(dt,minutes=0){
   // Everything is read off the clock rather than added up frame by frame, so the ferry is
   // where the timetable says whatever the frame rate or the clock's speed.
   const T=FERRY_TIMES,inbound=T.sea+T.harbour;
   if(phase==='away'){
    const due=nextService(minutes);
    if(due.wait<=inbound){service=due.service;serviceAt=minutes+due.wait;phase='arriving';ferry.visible=true;ferry.userData.lights?.(true);}
    else return;
   }
   if(phase==='arriving'){
    const e=inbound-(serviceAt-minutes);
    if(e>=inbound){park();serviceAt=Math.max(serviceAt,minutes);phase='waiting';return;}
    const p=ARRIVAL.pose(inboundShare(e));set(p.x,p.z,p.yaw);
    return;
   }
   if(phase==='waiting'){
    if(minutes-serviceAt>=BUS_DWELL)phase='reversing';
    else return;
   }
   const e=minutes-(serviceAt+BUS_DWELL),k=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
   // Astern off the berth, a pause as the screws reverse, the swing on the thruster, then ahead.
   const go=u=>{const p=DEPARTURE_PATH.pose(u);set(p.x,p.z,p.yaw);};
   if(e<T.reverse){phase='reversing';go(ASTERN_END*k(e/T.reverse));return;}
   if(e<T.reverse+T.turn){phase='swinging';go(ASTERN_END+(SWING_END-ASTERN_END)*k((e-T.reverse)/T.turn));return;}
   // Dead slow to the breakwater, then opening up at sea until it is out of sight.
   phase='leaving';
   const out=e-T.reverse-T.turn;
   if(out>=T.leaveHarbour+T.leaveSea){ferry.visible=false;phase='away';service=null;ferry.userData.lights?.(false);return;}
   go(SWING_END+(1-SWING_END)*outboundShare(out));
  },
 };
 return run;
}

/**
 * The ferry's stop: the prompts at the Port Building's waiting hall (port-building.js)
 * and the place the map and the schedules use. It answers the calls the bus station did.
 */
export function buildFerryTerminal({parent,colliders,register=()=>{},onAction=()=>{},enter=()=>{},label=()=>{},shadows=false}={}){
 const group=new THREE.Group();group.name='Minato ferry terminal';parent.add(group);
 const T=FERRY_TERMINAL;
 const anchor=(pos,text,fn)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);register(a,text,fn);return a;};
 // The Port Building owns the waiting hall and its supported canopy.
 const [px,pz]=T.platform;
 anchor([T.minX-.5,1.3,-44.95],'Read the shared ferry timetable',()=>onAction('read','Minato–Kitano-jima ferry','The combined passenger and vehicle ferry connects Minato and Kitano-jima. Buy passenger tickets inside the waiting hall, then board at the outer pier. Cars join crossings when their drivers have an island errand.'));
 anchor([px,1,pz+1.1],'Board the Kitano-jima ferry',()=>onAction('airport-ferry'));
 anchor([-4.5,1,-47.1],'Look out for the ferry',()=>onAction('inspect','Minato ferry','The shared ferry runs between Minato and Kitano-jima. Passengers use it every day; some crossings also carry island cars and service trucks. Return passenger tickets are sold at this terminal.'));
 const [hx,,hz]=PORT_BUILDING.hallDoor,outside=[hx-.7,0,hz];
 const place={id:T.id,title:'Minato Port Terminal',jp:'Minato Port Terminal',sub:'TICKETS · WAITING HALL',x:T.x,z:T.z,line:'The shared passenger and vehicle ferry to Kitano-jima, and the evening boat to Naha.',
  door:outside,exitPosition:outside,entryFacing:-Math.PI/2};
 anchor([hx-.45,1.3,hz],'Enter '+place.title,()=>enter(place));

 const departures=[];
 return {group,place,queue:[...T.queue],arrival:[...T.arrival],driver:[...T.driver],exit:[...T.exit],departures,
  board(name,minutes){departures.push({name,minutes});if(departures.length>24)departures.shift();},
  update(){}};
}
