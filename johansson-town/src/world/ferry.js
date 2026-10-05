import * as THREE from '../../vendor/three.module.js';
import {waveHeight,SEA_LEVEL} from './ocean.js';
import {HARBOUR_LINE,BUS_DWELL,nextService} from '../people/commuter-schedule.js';
import {AIRPORT_FERRY,AIRPORT_FERRY_PORTS,airportFerryPose} from './airport-ferry.js';
import {PORT_BUILDING} from './port-building.js';

/**
 * One Minato–Kitano-jima ferry carries pedestrians and occasional resident vehicles.
 * It uses a side gangway at Minato and the bow ramp on the airport pier. The legacy
 * commuter timetable interface remains available for residents and old saved games.
 * A player-requested crossing holds a safe berth until vehicles finish boarding.
 */
export const FERRY=Object.freeze({length:15,beam:4.4,freeboard:.95,draft:.7});
/** The outer pier's west flank (layout.js OUTER_PIER: x 0, 8.2 m wide). */
const PIER_WEST=-4.1;

/** Where it lies: alongside the pier's open west flank, clear of the rails and bollards. */
export const FERRY_BERTH=Object.freeze({
 x:PIER_WEST-FERRY.beam/2-.15,z:-58,
 /** The gangway, between the mooring bollard and the crate stack on the pier. */
 gangwayZ:-57.3,
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
 /** Where the people it brought step onto the pier. */
 arrival:Object.freeze([PIER_WEST+.9,FERRY_BERTH.gangwayZ+.9]),
 driver:PORT_BUILDING.driver,
 exit:PORT_BUILDING.platform,
});

/** The way in: from the open sea round the breakwater's west end to the berth, bow first. */
const APPROACH=new THREE.CatmullRomCurve3([
 [-120,-205],[-82,-142],[-54,-97],[-45,-79],[-26,-71],[-11,-68.5],[FERRY_BERTH.x,-63.5],[FERRY_BERTH.x,FERRY_BERTH.z],
].map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
/** Backed straight off the berth into the basin, where it turns. */
const TURN_AT=Object.freeze([FERRY_BERTH.x,-70.5]);
/** And out again, bow first. */
const DEPARTURE=new THREE.CatmullRomCurve3([
 [TURN_AT[0],TURN_AT[1]],[-24,-73],[-45,-79.5],[-54,-97],[-82,-142],[-120,-205],
].map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');

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
export const HARBOUR_IN=shareAt(APPROACH,BREAKWATER_END),HARBOUR_OUT=shareAt(DEPARTURE,BREAKWATER_END);
/**
 * How far along (0–1) after `e` minutes of a leg with a speed change at a share `h`: the
 * arrival slows steadily across the sea and comes to rest at the berth; the departure
 * gathers way in the harbour and keeps accelerating at sea. Speeds match at the breakwater.
 */
export function inboundShare(e,T=FERRY_TIMES,h=HARBOUR_IN){
 const S=T.sea,H=T.harbour,v1=2*(1-h)/H,v0=2*h/S-v1;
 if(e<=0)return 0;if(e>=S+H)return 1;
 if(e<S)return v0*e+.5*(v1-v0)/S*e*e;
 const t=e-S;return h+v1*t-.5*v1/H*t*t;
}
export function outboundShare(e,T=FERRY_TIMES,h=HARBOUR_OUT){
 const H=T.leaveHarbour,S=T.leaveSea,v1=2*h/H,a=2*((1-h)-v1*S)/(S*S);
 if(e<=0)return 0;if(e>=H+S)return 1;
 if(e<H)return h*(e/H)**2;
 const t=e-H;return h+v1*t+.5*a*t*t;
}

/** A small white island ferry of the 1990s, built from boxes and one extruded hull. */
export function buildFerry({shadows=false}={}){
 const ferry=new THREE.Group();ferry.name='Minato–Kitano-jima shared ferry';ferry.userData.dynamicProp=true;ferry.userData.walkSurface=false;
 const white=new THREE.MeshStandardMaterial({color:0xeeeae0,roughness:.55});
 const hullBlue=new THREE.MeshStandardMaterial({color:0x2b5a78,roughness:.6});
 const boot=new THREE.MeshStandardMaterial({color:0x8e3a30,roughness:.7});
 const glass=new THREE.MeshStandardMaterial({color:0x2d4a55,roughness:.2,emissive:0xf0d8a0,emissiveIntensity:0});
 const deck=new THREE.MeshStandardMaterial({color:0x8c8f86,roughness:.9});
 const funnelRed=new THREE.MeshStandardMaterial({color:0xc2412f,roughness:.5});
 const orange=new THREE.MeshStandardMaterial({color:0xe0702a,roughness:.6});
 const rail=new THREE.MeshStandardMaterial({color:0xdedad0,roughness:.5});
 const {length,beam,freeboard,draft}=FERRY;
 const add=(mesh,pos)=>{mesh.position.set(...pos);mesh.castShadow=!!shadows;mesh.receiveShadow=!!shadows;ferry.add(mesh);return mesh;};
 const box=(size,pos,material)=>add(new THREE.Mesh(new THREE.BoxGeometry(...size),material),pos);
 // The hull, in plan: a square stern and a bow drawn to a point, extruded up from the keel.
 // Drawn with the bow toward -y, because standing the extrusion up turns the plan's y into
 // -z, and the bow has to finish at +z with the wheelhouse.
 const plan=new THREE.Shape(),h=length/2,b=beam/2;
 // A car ferry's bow is blunt: the vehicle deck runs right forward to the ramp.
 plan.moveTo(-b,h);plan.lineTo(-b,-h+1.4);plan.lineTo(-b*.82,-h);plan.lineTo(b*.82,-h);plan.lineTo(b,-h+1.4);plan.lineTo(b,h);plan.closePath();
 const hullShape=(material,from,to,inset=0)=>{
  const g=new THREE.ExtrudeGeometry(plan,{depth:to-from,bevelEnabled:false,curveSegments:10});
  g.rotateX(-Math.PI/2);g.translate(0,from,0);if(inset)g.scale(1-inset,1,1-inset*.4);
  return add(new THREE.Mesh(g,material),[0,0,0]);
 };
 hullShape(boot,-draft,-.05,.02);                 // below the waterline
 hullShape(hullBlue,-.05,freeboard*.62);          // the blue topsides
 hullShape(white,freeboard*.62,freeboard);        // a white sheer strake
 // A roll-on car ferry of the island run: the open vehicle deck forward, walled at the
 // sides, the passenger cabin and the bridge on top of it aft, and the bow ramp, which
 // comes down onto the quay at the berth so trucks and cars can drive off and on.
 const lane=new THREE.MeshStandardMaterial({color:0xe0b93a,roughness:.8});
 box([beam-.3,.06,length-.4],[0,freeboard+.03,0],deck);
 for(const x of [-.55,.55])box([.08,.012,8.4],[x,freeboard+.065,2.4],lane);
 for(const side of [-1,1]){box([.12,1.0,9.2],[side*(b-.1),freeboard+.5,2.6],hullBlue);box([.14,.06,9.2],[side*(b-.1),freeboard+1.02,2.6],white);}
 box([beam-.6,2.2,5.6],[0,freeboard+1.1,-4.4],white);
 for(const side of [-1,1])box([.05,.62,5],[side*(beam-.6)/2+side*.01,freeboard+1.45,-4.4],glass);
 box([beam-.4,.08,6],[0,freeboard+2.24,-4.4],hullBlue);
 box([3,1.05,2.2],[0,freeboard+2.8,-2.8],white);            // the bridge, looking over the deck
 box([3.02,.46,.05],[0,freeboard+2.92,-1.69],glass);
 for(const side of [-1,1])box([.05,.4,1.8],[side*1.51,freeboard+2.92,-2.8],glass);
 box([3.2,.08,2.4],[0,freeboard+3.35,-2.8],hullBlue);
 const funnel=add(new THREE.Mesh(new THREE.CylinderGeometry(.42,.5,1.5,12),white),[0,freeboard+3,-6.2]);
 funnel.scale.z=1.4;
 add(new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.34,12),funnelRed),[0,freeboard+3.4,-6.2]).scale.z=1.4;
 add(new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,2.2,6),rail),[0,freeboard+4.45,-2.8]);
 box([beam-.4,.04,.04],[0,freeboard+.95,-h+.25],rail);
 for(const side of [-1,1]){
  const ring=add(new THREE.Mesh(new THREE.TorusGeometry(.26,.07,8,16),orange),[side*((beam-.6)/2+.06),freeboard+1.45,-2.2]);
  ring.rotation.y=Math.PI/2;
 }
 // The bow ramp on its hinge: raised it closes the bow; lowered it lands on the quay.
 const ramp=new THREE.Group();ramp.name='Ferry bow ramp';ramp.position.set(0,freeboard+.05,h);ferry.add(ramp);
 {const plate=new THREE.Mesh(new THREE.BoxGeometry(beam*.78,.1,2.4),deck);plate.position.set(0,0,1.2);plate.castShadow=!!shadows;ramp.add(plate);
  for(let k=0;k<6;k++){const rib=new THREE.Mesh(new THREE.BoxGeometry(beam*.76,.04,.05),lane);rib.position.set(0,.07,.3+k*.36);ramp.add(rib);}
  for(const side of [-1,1]){const chain=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,2.6,4),rail);chain.position.set(side*beam*.36,1.1,.6);chain.rotation.x=.9;ramp.add(chain);}}
 ferry.userData.ramp=ramp;
 /** 0 raised and closed, 1 down on the quay. */
 ferry.userData.setRamp=(down,slope=.24)=>{ramp.rotation.x=-1.45*(1-down)+slope*down;};
 ferry.userData.setRamp(0);
 ferry.userData.deckY=freeboard+.06;
 // The gangway, run out to the pier while it is boarding.
 const gangway=new THREE.Group();gangway.name='Ferry gangway';gangway.visible=false;ferry.add(gangway);
 {const plank=new THREE.Mesh(new THREE.BoxGeometry(1.6,.06,.9),deck);plank.position.set(.8,0,0);gangway.add(plank);
  for(const dz of [-.43,.43]){const r=new THREE.Mesh(new THREE.BoxGeometry(1.6,.04,.04),rail);r.position.set(.8,.8,dz);gangway.add(r);}}
 // On the starboard side, which is the side that lies against the pier.
 gangway.position.set(b-.3,freeboard,FERRY_BERTH.gangwayZ-FERRY_BERTH.z);
 gangway.rotation.z=-.16;
 ferry.userData.gangway=gangway;
 ferry.userData.lights=on=>{glass.emissiveIntensity=on?.55:0;};
 return ferry;
}

/** Where along a curve a given share of the way is, and the heading there. */
function along(curve,u,point,tangent){
 curve.getPointAt(Math.max(0,Math.min(1,u)),point);curve.getTangentAt(Math.max(0,Math.min(.999,u)),tangent);
 return Math.atan2(tangent.x,tangent.z);
}
const turnBetween=(from,to,t)=>{let d=to-from;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return from+d*t;};

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @returns the run, with the bus's interface.
 */
export function createFerryRun({parent,shadows=false,colliders}={}){
 const ferry=buildFerry({shadows});parent.add(ferry);
 const point=new THREE.Vector3(),tangent=new THREE.Vector3();
 const departYaw=along(DEPARTURE,0,point,tangent);
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
 };
 // Nobody walks on the harbour, but the gangway's foot is on the pier: a collider for the
 // hull alongside stops the player stepping off the pier's open flank onto the water.
 const solid=colliders?{id:'ferry',x:FERRY_BERTH.x,z:FERRY_BERTH.z,w:FERRY.beam,d:FERRY.length,height:3}:null;
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
   const p=airportFerryPose(crossing.destination,crossing.progress);set(p.x,p.z,p.yaw);ferry.position.set(p.x,p.y,p.z);ferry.rotation.set(0,p.yaw,0);ferry.userData.setRamp(0);return true;
  },
  get door(){return [...DOOR];},
  /** A queue across the pier from the gangway, clear of the bollard and the crates. */
  queueSpot(place=0){return [DOOR[0]+place*.75,DOOR[1]+(place%2)*.35];},
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
    const heading=along(APPROACH,inboundShare(e),point,tangent);set(point.x,point.z,heading);
    return;
   }
   if(phase==='waiting'){
    if(minutes-serviceAt>=BUS_DWELL)phase='reversing';
    else return;
   }
   const e=minutes-(serviceAt+BUS_DWELL),k=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};
   if(e<T.reverse){phase='reversing';set(FERRY_BERTH.x,FERRY_BERTH.z+(TURN_AT[1]-FERRY_BERTH.z)*k(e/T.reverse),0);return;}
   if(e<T.reverse+T.turn){phase='swinging';set(TURN_AT[0],TURN_AT[1],turnBetween(0,departYaw,k((e-T.reverse)/T.turn)));return;}
   // Dead slow to the breakwater, then opening up at sea until it is out of sight.
   phase='leaving';
   const out=e-T.reverse-T.turn;
   if(out>=T.leaveHarbour+T.leaveSea){ferry.visible=false;phase='away';service=null;ferry.userData.lights?.(false);return;}
   const heading=along(DEPARTURE,outboundShare(out),point,tangent);set(point.x,point.z,heading);
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
