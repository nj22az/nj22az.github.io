import * as THREE from '../../vendor/three.module.js';
import {waveHeight,SEA_LEVEL} from './ocean.js';
import {HARBOUR_LINE,BUS_DWELL,nextService} from '../people/commuter-schedule.js';
import {AIRPORT_FERRY,AIRPORT_FERRY_PORTS,AIRPORT_PASSAGES,airportFerryPose} from './airport-ferry.js';
import {PORT_BUILDING} from './port-building.js';
import {FERRY_DAY,rollPeriod,pitchPeriod} from './ferry-ship.js';
import {buildFerryModel,GANGWAY_Z,WL,FERRY_HULL,FERRY_RAMP} from './ferry-model.js';
import {MINATO_BERTH} from './minato-berth.js';
import {OUTER_PIER} from './layout.js';
import {BERTH_X,BERTH_Z,townArrival,townDeparture} from './ferry-paths.js';
import {lanternGlow,windowGlow} from '../render/dusk.js';

/**
 * One Minato–Kitano-jima ferry, the town's Minato Maru (ferry-ship.js, ferry-model.js), carries a hundred
 * passengers and ten cars. At Minato she lies port side to the outer pier on its fenders with her bow
 * ramp on the quay's landing plate and her gangway from the port casing's door to the pier; at
 * Kitano-jima she lands her ramp on the pier. The legacy
 * commuter timetable interface remains available for residents and old saved games.
 * A player-requested crossing holds a safe berth until vehicles finish boarding.
 */
export const FERRY=Object.freeze({length:FERRY_HULL.length,beam:FERRY_HULL.beam,freeboard:FERRY_HULL.freeboard,draft:FERRY_HULL.draft,waterline:WL});
/** The outer pier's west flank (layout.js OUTER_PIER: x 0, 8.2 m wide). */
const PIER_WEST=-4.1;

/** Where it lies: alongside the pier's open west flank, clear of the rails and bollards. */
export const FERRY_BERTH=Object.freeze({
 x:BERTH_X,z:BERTH_Z,
 /** The gangway, from the port casing's door to the pier, short of the pier's end. */
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

/**
 * Town minutes for each part of a call -- real minutes, since the clock is the one on your
 * wall (town-clock.js). She comes in off the sea, slows to a crawl inside the breakwater, pivots in
 * the western basin and is alongside four and a half minutes later; it loads for a quarter of an
 * hour (BUS_DWELL); getting out of port takes five minutes -- astern off the berth, a slow
 * swing in the basin, dead slow to the breakwater -- and only then does it open up and
 * go. Each part is a leg of the passage (ferry-paths.js townArrival, townDeparture).
 */
export const FERRY_TIMES=Object.freeze({sea:2,harbour:4.5,reverse:1.5,turn:1.5,leaveHarbour:2,leaveSea:2});
const ARRIVAL=townArrival(FERRY_TIMES),DEPARTURE=townDeparture(FERRY_TIMES);
/** The timetable's passages in and out of Minato, for the tests and the sounds. */
export const TOWN_PASSAGES=Object.freeze({arrival:ARRIVAL,departure:DEPARTURE});

/**
 * How she moves on the water, whatever she is doing: she heaves with the swell, rolls at her own
 * period (ferry-ship.js rollPeriod, about five and a half seconds) and pitches a little, more at sea
 * than in harbour, `exposure` 0 alongside and in the basin, 1 out in the strait. Roll and pitch are
 * a few degrees at most: ±0.35° in harbour, ±2° at sea (briefs/ferry-audit.md §7.2). Time is the
 * game's clock in seconds, so she rolls at her real period even when a crossing is shown faster.
 */
/** Her origin's height with her at rest in calm water (the waterline at sea level). */
const REST_Y=SEA_LEVEL+FERRY_HULL.origin;
/** The ramp's leaf, at rest on a landing at height `landing`: how far it drops from the car deck (radians below level). */
const rampSlope=landing=>Math.asin(Math.max(-1,Math.min(1,(REST_Y+FERRY_HULL.freeboard-landing-.05)/FERRY_RAMP.leaf)));
export function shipMotion(x,z,time,exposure=0){
 const e=Math.max(0,Math.min(1,exposure)),deg=Math.PI/180,Tr=rollPeriod(FERRY_HULL),Tp=pitchPeriod(FERRY_HULL),phase=x*.37+z*.21;
 const roll=(.35+1.65*e)*deg*(.85*Math.sin(2*Math.PI*time/Tr+phase)+.15*Math.sin(2*Math.PI*time/(Tr*1.61)+1.3*phase));
 const pitch=(.1+.4*e)*deg*Math.sin(2*Math.PI*time/Tp+.7*phase);
 const heave=(waveHeight(x,z,time)-SEA_LEVEL)*(.25+.55*e);
 return {y:REST_Y+heave,roll,pitch};
}

/** The ferry itself: the Minato Maru, modelled whole in ferry-model.js. */
export function buildFerry({shadows=false}={}){
 const ferry=buildFerryModel({shadows});ferry.name='Minato–Kitano-jima shared ferry';ferry.userData.dynamicProp=true;ferry.userData.walkSurface=false;
 // A ship on open water is seen from far off: drawn wherever she is in view, like the islands on the
 // horizon (render/town-sections.js), not only within the 54 m round the player that the streets
 // are, where she vanished at the harbour mouth while you watched her go from the pier.
 ferry.userData.horizon=true;
 // Heading first, then pitch about her own beam, then roll about her own length.
 ferry.rotation.order='YXZ';
 return ferry;
}

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @returns the run, with the bus's interface.
 */
export function createFerryRun({parent,shadows=false,colliders}={}){
 const ferry=buildFerry({shadows});parent.add(ferry);
 let phase='away',t=0,service=null,serviceAt=null,lastMinutes=null,clock=0,yaw=0,x=FERRY_BERTH.x,z=FERRY_BERTH.z,exposure=0,shipSeconds=null,plan=null;
 let berth='town',localService=false,crossing=null;
 const DOOR=[FERRY_TERMINAL.queue[0],FERRY_TERMINAL.queue[1]];
 // Her whistle: every signal she sounds, in order (the town's sound plays each one where she is).
 const whistle={count:0,kind:null,x,z,log:[]};
 const sound=kind=>{whistle.count++;whistle.kind=kind;whistle.x=x;whistle.z=z;whistle.log.push({n:whistle.count,kind,x,z});if(whistle.log.length>6)whistle.log.shift();};
 /** Signals of the passage she is on, sounded as her time passes each one. */
 const signalsBetween=(passage,from,to)=>{if(!passage||to<=from)return;for(const s of passage.signals)if(s.at>=from&&s.at<to)sound(s.kind);};
 const set=(nx,nz,nyaw)=>{x=nx;z=nz;yaw=nyaw;};
 const park=()=>{set(FERRY_BERTH.x,FERRY_BERTH.z,0);ferry.visible=true;};
 /** Her pose on the water, from the shared motion; alongside, the ramp's toe and the gangway's foot stay on the landing. */
 const pose=()=>{
  const m=shipMotion(x,z,clock,exposure);
  ferry.position.set(x,m.y,z);ferry.rotation.set(m.pitch,yaw,m.roll);ferry.updateMatrixWorld(true);
 };
 const place=()=>{
  const moored=phase==='waiting';
  pose();
  ferry.userData.gangway.visible=moored&&berth==='town';ferry.userData.setGate?.(moored&&berth==='town');
  // Down, the ramp rests on its landing: the steel plate in Minato's quay, Kitano-jima's pier.
  const landing=berth==='airport'?AIRPORT_FERRY_PORTS.airport.height:MINATO_BERTH.landing.top,down=run.rampDown;
  if(down>=1)ferry.userData.restRamp?.(landing);else ferry.userData.setRamp?.(down,rampSlope(landing));
  if(moored&&berth==='town')ferry.userData.restGangway?.(OUTER_PIER.height);
  // Her screws turn and the radar sweeps while she moves; alongside both are still.
  const moved=Math.hypot(x-last.x,z-last.z),dt=clock-last.t;last.x=x;last.z=z;last.t=clock;
  if(dt>0&&dt<1)ferry.userData.underway?.(dt,moored?0:Math.min(6,moved/dt));
 };
 const last={x,z,t:0};
 /**
  * Her lights, by the clock: the navigation lights (masthead, sidelights, stern light) whenever she
  * is under way between sunset and sunrise, and none alongside; the saloon and wheelhouse lit after
  * dark while she is in service (FERRY_DAY), and only the night watch's light after the last boat.
  */
  const lights=(minutes,underway)=>{
  const m=((minutes%1440)+1440)%1440,dark=lanternGlow(minutes)>=.5,inService=m>=FERRY_DAY.inService&&m<FERRY_DAY.shorePower;
  ferry.userData.setNavigationLights?.(underway&&dark);
  ferry.userData.setCabinLights?.(windowGlow(minutes)*(underway||inService?1:.12));
 };
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
   const p=AIRPORT_FERRY_PORTS[location];berth=location;localService=true;crossing=null;phase='waiting';exposure=0;
   serviceAt=lastMinutes??0;service=service??0;set(p.berth[0],p.berth[1],p.yaw);ferry.visible=true;place();trackSolid();
   if(lastMinutes!==null)lights(lastMinutes,false);
  },
  beginCrossing(destination,{automatic=false}={}){
   if(phase==='crossing'||!AIRPORT_FERRY_PORTS[destination]||destination===berth)return false;
   localService=true;phase='crossing';crossing={destination,progress:0,automatic:!!automatic,elapsed:0,seconds:null};ferry.userData.gangway.visible=false;ferry.userData.setGate?.(false);run.setCrossingProgress(0);trackSolid();return true;
  },
  /** The island simulation advances unaccompanied cargo runs without taking the camera. */
  advanceAutomaticCrossing(dt){
   if(!crossing?.automatic)return null;
   crossing.elapsed+=Number.isFinite(dt)?Math.max(0,dt):0;
   run.setCrossingProgress(crossing.elapsed/AIRPORT_FERRY.ride);
   if(crossing.progress<1)return null;
   const destination=crossing.destination;run.parkAt(destination);return destination;
  },
  setCrossingProgress(progress){
   if(!crossing)return false;crossing.progress=Math.max(0,Math.min(1,progress));
   const p=airportFerryPose(crossing.destination,crossing.progress),passage=AIRPORT_PASSAGES[crossing.destination];
   // Her whistle: the signals between where she was and where she is now (the first call sounds the one at the start).
   signalsBetween(passage,crossing.seconds===null?-1:crossing.seconds,p.seconds+(crossing.progress>=1?1e-6:0));crossing.seconds=p.seconds;
   set(p.x,p.z,p.yaw);exposure=p.exposure;pose();ferry.userData.setRamp(0);
   const moved=Math.hypot(p.x-last.x,p.z-last.z),dt=clock-last.t;last.x=p.x;last.z=p.z;last.t=clock;if(dt>0&&dt<1)ferry.userData.underway?.(dt,Math.min(6,moved/dt));
   if(lastMinutes!==null)lights(lastMinutes,true);
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
  /** What the town's sound needs: where she is, what she is doing, her engines and her whistle. */
  get audio(){
   const m=((lastMinutes??0)%1440+1440)%1440,underway=!['waiting','away'].includes(phase);
   const engines=!ferry.visible?'off':underway?(exposure>.5?'sea':'manoeuvring'):m>=FERRY_DAY.shorePower||m<FERRY_DAY.generators?'off':'idle';
   return {phase,x,z,engines,whistle:{count:whistle.count,kind:whistle.kind,x:whistle.x,z:whistle.z,log:[...whistle.log]}};
  },
  update(dt,minutes=0,time){
   if(!(dt>0))return;
   clock=Number.isFinite(time)?time:clock+dt;
   if(localService){lastMinutes=minutes;if(phase==='waiting'){place();lights(minutes,false);}trackSolid();return;}
   try{
    if(lastMinutes===null||minutes<lastMinutes||minutes-lastMinutes>dt+1){
     phase='away';service=null;serviceAt=null;ferry.visible=false;plan=null;shipSeconds=null;
     const day=Math.floor(minutes/1440),m=minutes-day*1440;
     const current=HARBOUR_LINE.find(s=>m>=s&&m<s+BUS_DWELL);
     if(current!==undefined){service=current;serviceAt=day*1440+current;park();phase='waiting';exposure=0;}
    }
    lastMinutes=minutes;
    run.step(dt,minutes);
    if(ferry.visible){place();lights(minutes,!['waiting','away'].includes(phase));}
   }finally{trackSolid();}
  },
  step(dt,minutes=0){
   // Everything is read off the clock rather than added up frame by frame, so the ferry is
   // where the timetable says whatever the frame rate or the clock's speed.
   const T=FERRY_TIMES,inbound=T.sea+T.harbour;
   const follow=(passage,seconds)=>{if(plan!==passage){plan=passage;shipSeconds=null;}signalsBetween(passage,shipSeconds===null?-1:shipSeconds,seconds);shipSeconds=seconds;const p=passage.pose(seconds);set(p.x,p.z,p.yaw);exposure=p.exposure;return p;};
   if(phase==='away'){
    const due=nextService(minutes);
    if(due.wait<=inbound){service=due.service;serviceAt=minutes+due.wait;phase='arriving';ferry.visible=true;}
    else return;
   }
   if(phase==='arriving'){
    const e=inbound-(serviceAt-minutes);
    if(e>=inbound){park();serviceAt=Math.max(serviceAt,minutes);phase='waiting';exposure=0;plan=null;return;}
    follow(ARRIVAL,Math.max(0,e)*60);
    return;
   }
   if(phase==='waiting'){
    if(minutes-serviceAt>=BUS_DWELL)phase='reversing';
    else return;
   }
   // Astern off the berth, the swing on the thruster, then ahead: the legs of the departure.
   const e=(minutes-(serviceAt+BUS_DWELL))*60;
   if(e>=DEPARTURE.duration){ferry.visible=false;phase='away';service=null;plan=null;ferry.userData.setNavigationLights?.(false);return;}
   const p=follow(DEPARTURE,e);
   phase=p.kind==='astern'?'reversing':p.kind==='swing'?'swinging':'leaving';
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
