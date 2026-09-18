import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {BUS_STATION} from './bus-station.js';
import {TUNNEL} from './coyote-tunnel.js';

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
 * @returns {{bus:THREE.Group,update:(dt:number)=>void,get phase:string}}
 */
export function createBusRun({parent,shadows=false}={}){
 const bus=buildBus({shadows});
 bus.position.set(MAIN_ROAD.x,0,STOP_Z);
 parent.add(bus);
 const vanish=vanishingPoint(),entry=new THREE.Vector3(MAIN_ROAD.x,0,MOUTH_Z);

 // Seconds. Long enough at the stop that catching it feels like catching it.
 const WAIT=26,GONE=15,SPEED=6.4,FADE=1.5,TURN=2.2;
 let phase='waiting',timer=WAIT,fade=0,turn=0;

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

 return {
  bus,
  get phase(){return phase;},
  update(dt){
   if(!(dt>0))return;
   if(phase==='waiting'){
    if((timer-=dt)<=0){phase='leaving';}
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
    if(fade>=1){bus.visible=false;phase='gone';timer=GONE;}
    return;
   }
   if(phase==='gone'){
    if((timer-=dt)<=0){phase='arriving';fade=1;bus.visible=true;bus.rotation.y=Math.PI;}
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
   if(turn>=1){park();phase='waiting';timer=WAIT;}
  },
 };
}
