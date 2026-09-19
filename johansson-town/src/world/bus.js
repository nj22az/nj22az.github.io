import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {BUS_STATION} from './bus-station.js';
import {TUNNEL} from './coyote-tunnel.js';
import {HARBOUR_LINE,BUS_DWELL,nextService} from '../people/commuter-schedule.js';

/**
 * The Harbour Line bus, and the trick it does at the end of the road.
 *
 * The tunnel is a painting on a rock face. The bus goes through it twice a day anyway,
 * which is the joke, and the joke only works if you watch it happen: the bus drives up
 * the bus-only road, reaches the arch, and from there it is not driving any more — it
 * is being shrunk onto the painting's own vanishing point, which is the one place on a
 * flat picture that a thing can recede to without sliding sideways. By the time it is
 * small enough to be a speck it is over the painted daylight at the far end, and it
 * goes out.
 *
 * Coming back it does the same in reverse, so the town has one way in and one way out
 * and you can see both of them work.
 */
const BODY=Object.freeze({length:8.6,width:2.42,height:2.16,floor:.62});

/** Where the painting's perspective converges, in world metres. */
export function vanishingPoint(){
 const {u,v}=TUNNEL.vanish;
 return new THREE.Vector3(
  TUNNEL.x+(u-.5)*TUNNEL.archWidth,
  TUNNEL.base+v*TUNNEL.archHeight,
  TUNNEL.z-.06);
}

/** A 1988 single-decker, built the way the kei-truck on the quay is: boxes and paint. */
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
 box([width+.03,.46,length],[0,floor+.24,0],band);                 // the waistband
 box([width-.16,.24,length-.5],[0,floor+height+.09,0],paint);      // a shallow crown
 box([width+.02,.34,length+.02],[0,floor-.02,0],dark);             // the skirt
 // Glazing: one long strip a side, and a windscreen that wraps the front corners.
 for(const side of [-1,1])box([.06,.86,length-1.5],[side*(width/2+.01),floor+1.32,-.15],glass);
 box([width-.34,.92,.06],[0,floor+1.32,length/2+.02],glass);
 box([width-.5,.62,.06],[0,floor+1.24,-length/2-.02],glass);
 // Destination board over the windscreen, lit from inside the way they were.
 box([width-.9,.3,.05],[0,floor+1.94,length/2+.03],lamp);
 for(const side of [-1,1]){
  box([.26,.2,.06],[side*(width/2-.42),floor+.42,length/2+.03],lamp);   // headlamps
  box([.2,.16,.06],[side*(width/2-.36),floor+.5,-length/2-.03],dark);   // tail lamps
 }
 for(const side of [-1,1])for(const z of [length/2-1.5,-length/2+1.35]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.26,12),rubber);
  wheel.rotation.z=Math.PI/2;wheel.position.set(side*(width/2-.1),.44,z);
  wheel.castShadow=!!shadows;bus.add(wheel);
 }
 return bus;
}

/** Where the bus stands when it is waiting, and the two ends of its run. */
const STOP_Z=BUS_STATION.queue[1]-1.4,MOUTH_Z=TUNNEL.z-1.2;

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
 const vanish=vanishingPoint(),entry=new THREE.Vector3(MAIN_ROAD.x,0,MOUTH_Z);

 const SPEED=6.4,FADE=1.5,TURN=2.2;
 /**
  * How long the approach takes, in town minutes -- which is also seconds, because the
  * clock runs at one minute a second. The bus leaves the far end this far ahead of its
  * time so that it is standing at the terminus, turned and with its doors open, on the
  * minute the timetable says.
  */
 const DRIVE=(MOUTH_Z-STOP_Z)/SPEED,APPROACH=FADE+DRIVE+TURN;
 /**
  * The longest it will hold past its departure time for somebody still walking up.
  * A driver waits for a regular he can see coming; he does not wait all night for one
  * who has got himself stuck behind a bench.
  */
 const HOLD=8;
 let phase='away',fade=0,turn=0,service=null;
 const since=m=>((m-service)%1440+1440)%1440;

 /** Somewhere between the mouth of the tunnel and the painted daylight at its far end. */
 const recede=t=>{
  const eased=t*t;
  bus.position.lerpVectors(entry,vanish,eased);
  bus.scale.setScalar(Math.max(.012,1-eased*.99));
 };
 const park=()=>{
  bus.position.set(MAIN_ROAD.x,0,STOP_Z);bus.scale.setScalar(1);bus.visible=true;bus.rotation.y=0;
 };
 park();
 // It starts the day somewhere else, like a bus.
 bus.visible=false;

 // What stops you walking through it. The box follows the bus and turns with it — an
 // axis-aligned rect cannot rotate, so it takes the extent of the turned body instead,
 // which is exact at the two headings it spends all but two seconds at.
 //
 // It comes off the moment the bus starts shrinking onto the painting: by then it is
 // not a vehicle in the road any more, it is a picture of one, and a collider there
 // would be an invisible wall across the mouth of the tunnel.
 const solid=colliders?{id:'harbour-bus',x:bus.position.x,z:bus.position.z,w:BODY.width,d:BODY.length,height:BODY.floor+BODY.height}:null;
 if(solid)colliders.push(solid);
 const trackSolid=()=>{
  if(!solid)return;
  // Parked out of the world rather than shrunk to nothing where it stood. A zero-size
  // rect is not "no collider": circleHitsRect compares against half the width plus the
  // walker's radius, so a 0x0 box still stops anyone who comes within 0.36m of it, and
  // the bus left an invisible post at whatever spot it happened to fade out on.
  const away=!bus.visible||bus.scale.x<.98;
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
  /** Which service it is working, so a timetable can be read off the running game. */
  get service(){return service;},
  /**
   * @param {number} dt seconds
   * @param {number} minutes the town clock
   * @param {boolean} inbound whether anybody is still walking up to the stop
   */
  update(dt,minutes=0,inbound=false){
   if(!(dt>0))return;
   try{this.step(dt,minutes,inbound);}finally{trackSolid();}
  },
  step(dt,minutes=0,inbound=false){
   if(phase==='away'){
    const due=nextService(minutes);
    if(due.wait<=APPROACH){
     service=due.service;phase='arriving';fade=1;bus.visible=true;bus.rotation.y=Math.PI;
    }
    return;
   }
   if(phase==='waiting'){
    // It goes when its time is up, and not before. A passenger still on their way
    // holds it, up to a point: see HOLD.
    const waited=since(minutes);
    if(waited>=BUS_DWELL&&(!inbound||waited>=BUS_DWELL+HOLD))phase='leaving';
    return;
   }
   if(phase==='leaving'){
    bus.position.z+=SPEED*dt;
    if(bus.position.z>=MOUTH_Z){phase='vanishing';fade=0;}
    return;
   }
   if(phase==='vanishing'){
    fade+=dt/FADE;
    recede(Math.min(1,fade));
    if(fade>=1){bus.visible=false;phase='away';service=null;}
    return;
   }
   if(phase==='arriving'){
    fade-=dt/FADE;
    recede(Math.max(0,fade));
    if(fade<=0){phase='returning';}
    return;
   }
   if(phase==='returning'){
    // Back down the road to the stop, still facing the way it is going.
    bus.position.z-=SPEED*dt;
    if(bus.position.z<=STOP_Z){bus.position.z=STOP_Z;phase='turning';turn=0;}
    return;
   }
   // Turning at the terminus, because a bus that arrives facing south and leaves facing
   // north has to do it somewhere, and a snap at the stop is the one place you watch.
   turn+=dt/TURN;
   bus.rotation.y=Math.PI*(1-Math.min(1,turn));
   if(turn>=1){park();phase='waiting';}
  },
 };
}
