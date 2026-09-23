import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {BUS_STATION} from './bus-station.js';
import {TUNNEL} from './coyote-tunnel.js';
import {HARBOUR_LINE,BUS_DWELL,nextService} from '../people/commuter-schedule.js';

/**
 * The Harbour Line bus, and the tunnel it comes and goes by.
 *
 * The road ends at the Minato Tunnel, and the tunnel is the only way in or out of town.
 * Each service the bus drives out of the dark, slows, and stops with its tail at the
 * portal, facing the town; the people catching it walk up the road and get on. Then it
 * backs into the tunnel at walking pace with its reversing lamps on, the way a bus
 * leaves a dead-end terminus it cannot turn in, and the dark takes it.
 *
 * It never turns. It used to swing through a hundred and eighty degrees in front of the
 * shelter, and later it was shrunk onto a painted vanishing point; now it has one heading
 * from the moment it appears to the moment it goes, and it is a bus the whole time.
 */
const BODY=Object.freeze({length:8.6,width:2.42,height:2.16,floor:.62});

/** How far into the tunnel the bus starts and ends its run, and where the dark hides it. */
export const TUNNEL_RUN=Object.freeze({deep:TUNNEL.z+TUNNEL.bore.length-1.5,gone:TUNNEL.z+TUNNEL.bore.length-2.5});

/** A single-decker of the kind still running in 1997, built the way the kei-truck on the quay is: boxes and paint. */
export function buildBus({shadows=false}={}){
 const bus=new THREE.Group();bus.name='Harbour Line bus';
 const paint=new THREE.MeshStandardMaterial({color:0xdcd6c2,roughness:.62});
 const band=new THREE.MeshStandardMaterial({color:0x3f7f7c,roughness:.6});
 const dark=new THREE.MeshStandardMaterial({color:0x2c3336,roughness:.55});
 const glass=new THREE.MeshStandardMaterial({color:0x3d5a5f,roughness:.22,metalness:.05});
 const rubber=new THREE.MeshStandardMaterial({color:0x22282a,roughness:.9});
 const lamp=new THREE.MeshStandardMaterial({color:0xf2e2b4,roughness:.4,emissive:0xf2e2b4,emissiveIntensity:.35});
 const box=(size,pos,material)=>{
  const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
  m.position.set(...pos);m.castShadow=!!shadows;m.receiveShadow=!!shadows;bus.add(m);return m;
 };
 const {length,width,height,floor}=BODY;
 box([width,height,length],[0,floor+height/2,0],paint);
 // A hair longer than the body, or its ends share the body's end faces and flicker.
 box([width+.03,.46,length+.012],[0,floor+.24,0],band);            // the waistband
 box([width-.16,.24,length-.5],[0,floor+height+.09,0],paint);      // a shallow crown
 box([width+.02,.34,length+.02],[0,floor-.02,0],dark);             // the skirt
 // Glazing: one long strip a side, and a windscreen that wraps the front corners.
 for(const side of [-1,1])box([.06,.86,length-1.5],[side*(width/2+.01),floor+1.32,-.15],glass);
 box([width-.34,.92,.06],[0,floor+1.32,length/2+.02],glass);
 box([width-.5,.62,.06],[0,floor+1.24,-length/2-.02],glass);
 // Destination board over the windscreen, lit from inside the way they were.
 box([width-.9,.3,.05],[0,floor+1.94,length/2+.03],lamp);
 const reversing=new THREE.MeshStandardMaterial({color:0xe9ecef,roughness:.4,emissive:0xffffff,emissiveIntensity:0});
 for(const side of [-1,1]){
  box([.26,.2,.06],[side*(width/2-.42),floor+.42,length/2+.03],lamp);   // headlamps
  box([.2,.16,.06],[side*(width/2-.36),floor+.5,-length/2-.03],dark);   // tail lamps
  box([.12,.12,.06],[side*(width/2-.62),floor+.5,-length/2-.03],reversing);
 }
 const wheels=[];
 for(const side of [-1,1])for(const z of [length/2-1.5,-length/2+1.35]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.26,12),rubber);
  wheel.rotation.z=Math.PI/2;wheel.position.set(side*(width/2-.1),.44,z);
  wheel.castShadow=!!shadows;bus.add(wheel);wheels.push(wheel);
 }
 // Inside the tunnel it is lit by nothing but the lamps, so its paint goes dark with the
 // distance in. Lamps that are lit stay lit.
 const surfaces=[paint,band,dark,glass,rubber].map(m=>({m,base:m.color.clone()}));
 bus.userData.shade=k=>{for(const {m,base} of surfaces)m.color.copy(base).multiplyScalar(1-.9*k);};
 bus.userData.lamps=(head,back)=>{lamp.emissiveIntensity=head?1.1:.35;reversing.emissiveIntensity=back?1.4:0;};
 bus.userData.roll=distance=>{for(const w of wheels)w.rotateY(distance/.44);};
 return bus;
}

/**
 * Where it stands: out of the tunnel with its tail in the portal's arch, the whole of it
 * on the road the passengers walk up.
 */
const STOP_Z=TUNNEL.z-BODY.length/2-.7;
/** The door it is boarded through, and the step inside it, both in world metres. */
const DOOR_Z=STOP_Z-2.2,DOOR_X=MAIN_ROAD.x-BODY.width/2-.55;

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {Array} [options.colliders] the town's collider list. The bus is eight and a
 *   half metres of vehicle standing on a road you walk up, so it gets an entry like
 *   any other solid thing; without one you walked straight through it at the stop.
 * @returns {{bus:THREE.Group,update:(dt:number)=>void,get phase:string}}
 */
export function createBusRun({parent,shadows=false,colliders}={}){
 const bus=buildBus({shadows});
 bus.position.set(MAIN_ROAD.x,0,STOP_Z);
 parent.add(bus);
 /** Seconds to drive out to the stop, and to back in again. */
 const ARRIVE=10,LEAVE=18;
 /**
  * How long the approach takes, in town minutes -- which is also seconds, because the
  * clock runs at one minute a second. The bus sets off from inside the tunnel this far
  * ahead of its time so that it is standing at the terminus, with its doors open, on
  * the minute the timetable says.
  */
 const APPROACH=ARRIVE;
 let phase='away',fade=0,service=null,serviceAt=null,lastMinutes=null;
 const RUN=TUNNEL_RUN.deep-STOP_Z;

 /**
  * Where it is along the run: 0 at the stop, 1 thirty metres into the tunnel. It is
  * visible until the dark has it, darkening as it goes in, and its wheels turn with the
  * ground it covers.
  */
 const place=t=>{
  const z=STOP_Z+RUN*Math.max(0,Math.min(1,t)),moved=z-bus.position.z;
  bus.position.set(MAIN_ROAD.x,0,z);bus.scale.setScalar(1);
  bus.userData.roll?.(moved);
  bus.userData.shade?.(Math.max(0,Math.min(1,(z-BODY.length/2-(TUNNEL.z-1))/14)));
  bus.visible=z<TUNNEL_RUN.gone;
 };
 const park=()=>{
  // Facing south for the whole of its visit, which is the way it came out. Nothing
  // in the run changes its heading.
  bus.position.set(MAIN_ROAD.x,0,STOP_Z);bus.scale.setScalar(1);bus.visible=true;bus.rotation.y=Math.PI;
  bus.userData.shade?.(0);bus.userData.lamps?.(false,false);
 };
 park();
 // It starts the day somewhere else, like a bus.
 bus.visible=false;

 // What stops you walking through it. The box follows the bus and turns with it — an
 // axis-aligned rect cannot rotate, so it takes the extent of the turned body instead,
 // which is exact at the two headings it spends all but two seconds at.
 //
 // It comes off once the bus is into the tunnel, where nobody on foot can reach it.
 const solid=colliders?{id:'harbour-bus',x:bus.position.x,z:bus.position.z,w:BODY.width,d:BODY.length,height:BODY.floor+BODY.height}:null;
 if(solid)colliders.push(solid);
 const trackSolid=()=>{
  if(!solid)return;
  // Parked out of the world rather than shrunk to nothing where it stood. A zero-size
  // rect is not "no collider": circleHitsRect compares against half the width plus the
  // walker's radius, so a 0x0 box still stops anyone who comes within 0.36m of it, and
  // the bus left an invisible post at whatever spot it happened to fade out on.
  const away=!bus.visible||bus.position.z-BODY.length/2>TUNNEL.z-TUNNEL.portal;
  if(away){solid.w=0;solid.d=0;solid.x=1e6;solid.z=1e6;return;}
  const sin=Math.abs(Math.sin(bus.rotation.y)),cos=Math.abs(Math.cos(bus.rotation.y));
  solid.x=bus.position.x;solid.z=bus.position.z;
  solid.w=BODY.length*sin+BODY.width*cos;
  solid.d=BODY.length*cos+BODY.width*sin;
 };
 trackSolid();

 return {
  bus,
  get phase(){return phase;},
  /** Where somebody stands to get on: beside the front of the bus, off its flank. */
  get door(){return [DOOR_X,DOOR_Z];},
  /**
   * A place in the queue for the door, so that four people waiting for the same bus
   * are a queue along the kerb rather than four people in one another's coats.
   * @param {number} place 0 for the front of the queue
   */
  queueSpot(place=0){return [DOOR_X-(place%2)*.62,DOOR_Z-Math.floor(place/2)*.85];},
  /** And the step inside it, which is where they stop being on the street. */
  get doorway(){return [MAIN_ROAD.x,DOOR_Z];},
  /** True while it is standing at the arch with its doors open. */
  get boarding(){return phase==='waiting';},
  /** Which service it is working, so a timetable can be read off the running game. */
  get service(){return service;},
  /**
   * @param {number} dt seconds
   * @param {number} minutes the town clock
   */
  update(dt,minutes=0){
   if(!(dt>0))return;
   try{
    // Loading during a stop restores that service. Returning from an interior or
    // skipping time discards old trips instead of replaying them back to back.
    if(lastMinutes===null||minutes<lastMinutes||minutes-lastMinutes>dt+1){
     phase='away';service=null;serviceAt=null;bus.visible=false;
     const day=Math.floor(minutes/1440),m=minutes-day*1440;
     const current=HARBOUR_LINE.find(s=>m>=s&&m<s+BUS_DWELL);
     if(current!==undefined){service=current;serviceAt=day*1440+current;park();phase='waiting';}
    }
    lastMinutes=minutes;
    this.step(dt,minutes);
   }finally{trackSolid();}
  },
  step(dt,minutes=0){
   if(phase==='away'){
    const due=nextService(minutes);
    if(due.wait<=APPROACH){
     service=due.service;serviceAt=minutes+due.wait;phase='arriving';fade=0;
     bus.rotation.y=Math.PI;bus.position.z=TUNNEL_RUN.deep;place(1);bus.userData.lamps?.(true,false);
    }
    return;
   }
   if(phase==='waiting'){
    // Every service waits fifteen town minutes, without an extra passenger hold: the
    // people catching it set off for the door long before it shows up.
    const waited=minutes-serviceAt;
    // From nought, not from whatever the approach overshot to: a first frame that does
    // not move is a bus that hesitates before it goes.
    if(waited>=BUS_DWELL){phase='leaving';fade=0;bus.userData.lamps?.(true,true);}
    return;
   }
   if(phase==='arriving'){
    // Out of the dark, braking all the way to the stop.
    fade=Math.min(1,fade+dt/ARRIVE);
    place((1-fade)**2);
    // The fifteen minutes start when it is actually standing there, not when the
    // timetable said it would be.
    if(fade>=1){park();serviceAt=Math.max(serviceAt,minutes);phase='waiting';}
    return;
   }
   // Leaving: backing into the tunnel, slowly at first, until the dark has it.
   fade=Math.min(1,fade+dt/LEAVE);
   place(fade**2);
   if(fade>=1){bus.visible=false;phase='away';service=null;bus.userData.lamps?.(false,false);}
  },
 };
}
