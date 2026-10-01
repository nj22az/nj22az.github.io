import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {FERRY,FERRY_BERTH} from './ferry.js';
import {MAIN_ROAD} from './main-road.js';

/**
 * What the car ferry carries: on every call two vehicles drive off down the bow ramp,
 * across the quay past the terminal and up Main Street out of town, and two more come
 * down Main Street and drive aboard before the ramp goes up. Between calls the ones
 * aboard ride out with it. They wait for anybody standing in their way.
 *
 * Each has its own small kit mesh and moves as one object; nothing here is batched.
 */
const deckZ=[3.6,.4];
/** Down the ramp, round the terminal and up the main road to its north end. */
function routeFor(i){
 const x=FERRY_BERTH.x,bow=FERRY_BERTH.z+FERRY.length/2;
 return new THREE.CatmullRomCurve3([
  [x,FERRY_BERTH.z+deckZ[i]],[x,bow],[x,bow+2.6],[x+1.2,-46.5],[MAIN_ROAD.x+(i?.9:-.9),-43],[MAIN_ROAD.x+(i?.9:-.9),-38],[MAIN_ROAD.x+(i?.9:-.9),MAIN_ROAD.maxZ-1],
 ].map(([px,pz])=>new THREE.Vector3(px,0,pz)),false,'centripetal');
}

function vehicle(kind,colour){
 const kit=createKit({}),g=new THREE.Group();g.name='Ferry '+kind;
 const wheel=(x,z,r=.27)=>kit.cyl(r,r,.2,x,r,z,0x1f2124,{rz:Math.PI/2,segments:10});
 if(kind==='kei truck'){
  kit.box(1.4,1.15,1.1,0,.78,.95,colour);kit.box(1.36,.42,.04,0,1.05,1.51,0x5d7a84);
  kit.box(1.4,.45,2,0,.55,-.6,colour);kit.box(1.3,.04,1.9,0,.8,-.6,0x5d6265);
  kit.box(1.1,.5,1.2,0,1.05,-.7,0x2f6fb8);
  for(const [x,z] of [[-.66,.9],[.66,.9],[-.66,-1.1],[.66,-1.1]])wheel(x,z);
 }else if(kind==='car'){
  kit.box(1.6,.7,3.6,0,.6,0,colour);kit.box(1.44,.55,1.9,0,1.2,-.2,colour);
  kit.box(1.4,.44,.04,0,1.22,.76,0x5d7a84);kit.box(1.4,.4,.04,0,1.2,-1.16,0x5d7a84);
  for(const [x,z] of [[-.76,1.15],[.76,1.15],[-.76,-1.15],[.76,-1.15]])wheel(x,z,.3);
 }else{
  // A two-tonne delivery truck with a box body.
  kit.box(1.8,1.4,1.5,0,1.0,1.9,colour);kit.box(1.76,.5,.04,0,1.35,2.66,0x5d7a84);
  kit.box(1.9,2,3.4,0,1.5,-.6,0xeeece4);kit.box(1.92,.4,3.42,0,2.2,-.6,colour);
  for(const [x,z] of [[-.8,1.9],[.8,1.9],[-.8,-1.4],[.8,-1.4],[-.8,-.5],[.8,-.5]])wheel(x,z,.38);
 }
 kit.finish(g,kind);g.visible=false;g.userData.dynamicProp=true;
 return g;
}

export function createFerryVehicles({parent,run,getPlayerPosition=()=>null}){
 const routes=[routeFor(0),routeFor(1)],length=routes.map(r=>r.getLength());
 const group=new THREE.Group();group.name='Ferry vehicles';group.userData.dynamicProp=true;parent.add(group);
 // Off: a kei truck of the day's freight and a car. On: the fish truck and a car leaving.
 const fleet=[
  {g:vehicle('kei truck',0xf2f0ea),lane:0,off:true,start:1.4},
  {g:vehicle('car',0x3f7fc0),lane:1,off:true,start:2.1},
  {g:vehicle('delivery truck',0x2f6f9f),lane:0,off:false,start:10.2},
  {g:vehicle('car',0xc8432f),lane:1,off:false,start:11},
 ];
 for(const v of fleet){group.add(v.g);v.p=0;v.service=null;}
 const p=new THREE.Vector3(),t=new THREE.Vector3(),m4=new THREE.Matrix4(),onDeck=new THREE.Vector3();
 const SPEED=3.2;// metres per second, real time
 let lastPhase=null;
 function sitOnDeck(v){
  const f=run.ferry;f.updateMatrixWorld();
  onDeck.set(0,f.userData.deckY,deckZ[v.lane]).applyMatrix4(f.matrixWorld);
  v.g.position.copy(onDeck);v.g.rotation.set(0,f.rotation.y+(v.off?0:Math.PI),0);v.g.visible=f.visible;
 }
 function place(v,u){
  const r=routes[v.lane];u=Math.max(0,Math.min(1,u));
  r.getPointAt(u,p);r.getTangentAt(Math.min(.999,u),t);
  const along=u*length[v.lane],deckLen=Math.abs(deckZ[v.lane]-FERRY.length/2),f=run.ferry,deckY=f.position.y+f.userData.deckY;
  let y=0;if(along<deckLen)y=deckY;else if(along<deckLen+2.6)y=deckY*(1-(along-deckLen)/2.6);
  v.g.position.set(p.x,y,p.z);
  let heading=Math.atan2(t.x,t.z);if(!v.off)heading+=Math.PI;
  v.g.rotation.set(0,heading,0);v.g.visible=true;
 }
 return {group,fleet,update(dt,minutes){
  const phase=run.phase,e=run.alongsideFor,svc=run.service;
  const player=getPlayerPosition?.();
  for(const v of fleet){
   if(v.service!==svc&&phase==='arriving'){v.service=svc;v.p=0;}
   if(phase==='away'){v.g.visible=false;v.p=0;continue;}
   if(phase==='arriving'){if(v.off)sitOnDeck(v);else v.g.visible=false;continue;}
   if(phase==='waiting'){
    if(e<v.start){if(v.off)sitOnDeck(v);else v.g.visible=false;continue;}
    if(v.p>=1){if(v.off)v.g.visible=false;else sitOnDeck(v);continue;}
    // Wait for anybody standing just ahead.
    const blocked=player&&v.g.visible&&Math.hypot(player.x-v.g.position.x,player.z-v.g.position.z)<2.6&&
     ((player.x-v.g.position.x)*Math.sin(v.g.rotation.y)+(player.z-v.g.position.z)*Math.cos(v.g.rotation.y))>0;
    if(!blocked)v.p=Math.min(1,v.p+dt*SPEED/length[v.lane]);
    // A vehicle that had no time (the town clock jumped) is simply where it ends up.
    if(e>v.start+3)v.p=1;
    place(v,v.off?v.p:1-v.p);continue;
   }
   // Reversing, swinging, leaving: whoever drove on rides out with it.
   if(v.off)v.g.visible=false;else sitOnDeck(v);
  }
  lastPhase=phase;
 }};
}
