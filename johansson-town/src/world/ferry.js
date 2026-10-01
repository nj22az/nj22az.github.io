import * as THREE from '../../vendor/three.module.js';
import {GROUND_LAYER} from './ground-layers.js';
import {waveHeight,SEA_LEVEL} from './ocean.js';
import {HARBOUR_LINE,BUS_DWELL,nextService} from '../people/commuter-schedule.js';

/**
 * The Minato ferry, and the terminal it calls at.
 *
 * Minato is an island: nobody drives in. Three times a day the ferry comes in round the
 * west end of the breakwater, runs up the harbour and lies alongside the west flank of
 * the outer pier, bow to the quay. The people catching it queue across the pier to the
 * gangway; the people it brought walk off it. After its fifteen minutes it backs off the
 * berth, turns in the basin and goes out the way it came, getting smaller until the sea
 * has it.
 *
 * The run keeps the interface the Harbour Line bus had -- door, queueSpot, doorway,
 * boarding, service, phase, update -- so the commuters' schedules board it exactly as
 * they boarded the bus. The timetable is the same three services.
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
 id:'ferry-terminal',x:-7.3,z:-44.2,
 minX:-8.4,maxX:-3.7,minZ:-48,maxZ:-42.8,
 /** The gangway's foot on the pier, which is where the queue starts. */
 queue:Object.freeze([PIER_WEST+.6,FERRY_BERTH.gangwayZ]),
 /** Where somebody waiting stands: by the quay bench beside the booth, off the pier. */
 platform:Object.freeze([-5.8,-44.8]),
 /** Where the people it brought step onto the pier. */
 arrival:Object.freeze([PIER_WEST+.9,FERRY_BERTH.gangwayZ+.9]),
 driver:Object.freeze([-6,-46.3]),
 exit:Object.freeze([-5.8,-44.8]),
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

/** Seconds (town minutes) for each part of a call. */
export const FERRY_TIMES=Object.freeze({arrive:55,reverse:9,turn:9,depart:45});

/** A small white island ferry of the 1990s, built from boxes and one extruded hull. */
export function buildFerry({shadows=false}={}){
 const ferry=new THREE.Group();ferry.name='Minato ferry';
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
 ferry.userData.setRamp=down=>{ramp.rotation.x=-1.45*(1-down)+.24*down;};
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
 const DOOR=[FERRY_TERMINAL.queue[0],FERRY_TERMINAL.queue[1]];
 const set=(nx,nz,nyaw)=>{x=nx;z=nz;yaw=nyaw;};
 const park=()=>{set(FERRY_BERTH.x,FERRY_BERTH.z,0);ferry.visible=true;};
 // It rides the swell, but moored it barely moves.
 const place=()=>{
  const moored=phase==='waiting',sea=waveHeight(x,z,clock)-SEA_LEVEL;
  ferry.position.set(x,SEA_LEVEL+.12+sea*(moored?.25:.8),z);
  ferry.rotation.set(Math.sin(clock*.7+x)*(moored?.004:.02),yaw,Math.sin(clock*.9)*(moored?.006:.03));
  ferry.userData.gangway.visible=moored;
  ferry.userData.setRamp?.(run.rampDown);
 };
 // Nobody walks on the harbour, but the gangway's foot is on the pier: a collider for the
 // hull alongside stops the player stepping off the pier's open flank onto the water.
 const solid=colliders?{id:'ferry',x:FERRY_BERTH.x,z:FERRY_BERTH.z,w:FERRY.beam,d:FERRY.length,height:3}:null;
 if(solid)colliders.push(solid);
 const trackSolid=()=>{if(!solid)return;const here=ferry.visible&&phase==='waiting';solid.x=here?FERRY_BERTH.x:1e6;solid.z=here?FERRY_BERTH.z:1e6;};
 park();ferry.visible=false;trackSolid();
 const run={
  ferry,
  /** Kept under the old name too: the debug readout and a few callers ask for `.bus`. */
  get bus(){return ferry;},
  get phase(){return phase;},
  get door(){return [...DOOR];},
  /** A queue across the pier from the gangway, clear of the bollard and the crates. */
  queueSpot(place=0){return [DOOR[0]+place*.75,DOOR[1]+(place%2)*.35];},
  /** On board: the deck beyond the gangway. */
  get doorway(){return [FERRY_BERTH.x+FERRY.beam/2-.9,FERRY_BERTH.gangwayZ];},
  get boarding(){return phase==='waiting';},
  /** Town minutes since it came alongside, while it is alongside. */
  get alongsideFor(){return phase==='waiting'&&Number.isFinite(serviceAt)?Math.max(0,lastMinutes-serviceAt):null;},
  /** The bow ramp: down a minute after it berths, up again a minute before it leaves. */
  get rampDown(){const e=run.alongsideFor;if(e===null)return 0;const s=u=>{u=Math.max(0,Math.min(1,u));return u*u*(3-2*u);};return Math.min(s(e-.2),s(BUS_DWELL-.4-e));},
  get service(){return service;},
  update(dt,minutes=0,time){
   if(!(dt>0))return;
   clock=Number.isFinite(time)?time:clock+dt;
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
   const T=FERRY_TIMES;
   if(phase==='away'){
    const due=nextService(minutes);
    if(due.wait<=T.arrive){service=due.service;serviceAt=minutes+due.wait;phase='arriving';t=0;ferry.visible=true;ferry.userData.lights?.(true);}
    else return;
   }
   if(phase==='arriving'){
    t=Math.min(1,t+dt/T.arrive);
    // Full ahead across the open water, easing down to a crawl alongside.
    const u=1-(1-t)**2;const heading=along(APPROACH,u,point,tangent);set(point.x,point.z,heading);
    if(t>=1){park();serviceAt=Math.max(serviceAt,minutes);phase='waiting';}
    return;
   }
   if(phase==='waiting'){
    if(minutes-serviceAt>=BUS_DWELL){phase='reversing';t=0;}
    return;
   }
   if(phase==='reversing'){
    t=Math.min(1,t+dt/T.reverse);const k=t*t*(3-2*t);
    set(FERRY_BERTH.x,FERRY_BERTH.z+(TURN_AT[1]-FERRY_BERTH.z)*k,0);
    if(t>=1){phase='swinging';t=0;}
    return;
   }
   if(phase==='swinging'){
    t=Math.min(1,t+dt/T.turn);set(TURN_AT[0],TURN_AT[1],turnBetween(0,departYaw,t*t*(3-2*t)));
    if(t>=1){phase='leaving';t=0;}
    return;
   }
   // Leaving: gathering way out of the basin and off round the breakwater.
   t=Math.min(1,t+dt/T.depart);
   const heading=along(DEPARTURE,t*t,point,tangent);set(point.x,point.z,heading);
   if(t>=1){ferry.visible=false;phase='away';service=null;ferry.userData.lights?.(false);}
  },
 };
 return run;
}

/**
 * The ferry terminal on the quay: a ticket booth, a sign and the timetable, with the quay
 * bench to wait on. It answers to the same calls the bus station did.
 */
export function buildFerryTerminal({parent,colliders,register=()=>{},onAction=()=>{},label=()=>{},shadows=false}={}){
 const group=new THREE.Group();group.name='Minato ferry terminal';parent.add(group);
 const T=FERRY_TERMINAL;
 const timber=new THREE.MeshStandardMaterial({color:0x625a4d,roughness:.88});
 const steel=new THREE.MeshStandardMaterial({color:0x405457,roughness:.7,metalness:.12});
 const cream=new THREE.MeshStandardMaterial({color:0xe6dfcc,roughness:.8});
 const teal=new THREE.MeshStandardMaterial({color:0x3f7f7c,roughness:.6});
 const glass=new THREE.MeshStandardMaterial({color:0x4c7074,roughness:.24,transparent:true,opacity:.72,emissive:0x1a3031,emissiveIntensity:.16});
 const lampMat=new THREE.MeshStandardMaterial({color:0xe6b46b,roughness:.55,emissive:0xe6b46b,emissiveIntensity:.08});
 const lamps=[];
 const box=(size,pos,material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=!!shadows;m.receiveShadow=!!shadows;group.add(m);return m;};
 const cyl=(r,hgt,pos,material)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,hgt,10),material);m.position.set(...pos);m.castShadow=!!shadows;group.add(m);return m;};
 const anchor=(pos,text,fn)=>{const a=new THREE.Object3D();a.position.set(...pos);group.add(a);register(a,text,fn);return a;};
 const y=GROUND_LAYER.apron;
 // The ticket booth: a cream box with a teal band and its window toward the pier. It
 // stands where the quay's crate stack stood; the quay bench beside it is the waiting room.
 const bx=T.x,bz=T.z;
 box([1.9,2.3,1.9],[bx,y+1.15,bz],cream);
 box([1.96,.3,1.96],[bx,y+2.1,bz],teal);
 box([2.3,.1,2.3],[bx,y+2.36,bz],timber);
 box([.05,.7,1.1],[bx+.96,y+1.35,bz],glass);
 box([.3,.06,1.1],[bx+1.1,y+.98,bz],timber);            // the ticket counter
 colliders.push({id:'ferry-booth',x:bx,z:bz,w:2,d:2,height:2.4});
 for(const dz of [-.8,.8]){const bulb=cyl(.09,.14,[bx+1.05,y+2.22,bz+dz],lampMat);lamps.push(bulb);}
 // The sign on its pole at the pier's root, where you turn onto it.
 cyl(.07,3,[-5.4,1.5,-47.6],steel);colliders.push({id:'ferry-sign',x:-5.4,z:-47.6,w:.16,d:.16,height:3});
 label('フェリー乗り場','MINATO FERRY · 3 SAILINGS DAILY',[-5.4,3.2,-47.5],3.4,.62,0,'#e5dcc0','#2b5a78',true);
 anchor([bx+1.2,1.1,bz],'Read the ferry timetable',()=>onAction('bus'));
 anchor([-4.7,1,-43.9],'Wait for the ferry',()=>onAction('bus'));
 anchor([-5.4,1,-47.1],'Look out for the ferry',()=>onAction('inspect','Minato ferry','The ferry is the only way on or off the island: three sailings a day, round the breakwater to the mainland and back. Tickets at the booth; the punch cards are sold at Sakura.'));
 const place={id:T.id,title:'Minato Ferry Terminal',jp:'フェリー乗り場',sub:'ARRIVALS · DEPARTURES',x:T.x,z:T.z,line:'Three sailings a day to the mainland from the outer pier.',
  door:[T.platform[0],0,T.platform[1]],exitPosition:[T.platform[0],0,T.platform[1]]};
 const departures=[];
 return {group,place,queue:[...T.queue],arrival:[...T.arrival],driver:[...T.driver],exit:[...T.exit],departures,
  board(name,minutes){departures.push({name,minutes});if(departures.length>24)departures.shift();},
  update(minutes=0,day=1){const night=day<.35;lamps.forEach(m=>{m.material.emissiveIntensity=night?.75:.08;});glass.emissiveIntensity=night?.3:.16;}};
}
