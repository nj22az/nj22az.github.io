import * as THREE from '../../vendor/three.module.js';
import {AIRPORT_ISLAND} from './airport-island.js';
import {AIRPORT_LANDING,AIRPORT_LANDING_HEIGHT,airportWorld} from './airport-ground.js';
import {SEA_LEVEL} from './ocean.js';

/** Shared passenger and occasional vehicle route on the town ferry. */
export const AIRPORT_FERRY=Object.freeze({length:15,beam:4.4,deck:1.01,duration:18});
export const AIRPORT_FERRY_PORTS=Object.freeze({
 town:Object.freeze({title:'Minato–Kitano-jima shared ferry',landing:Object.freeze([-3.2,-56.4]),height:.098,berth:Object.freeze([-6.45,-58]),yaw:0}),
 airport:Object.freeze({title:'Kitano-jima shared ferry pier',landing:AIRPORT_LANDING,height:AIRPORT_LANDING_HEIGHT,berth:Object.freeze(airportWorld(-64.6,31)),yaw:AIRPORT_ISLAND.yaw+Math.PI/2}),
});
// Round the harbour breakwater's west end, then approach outside the reclaimed
// foundation. The old straight line crossed the wall and finished on dry land.
const ROUTE=new THREE.CatmullRomCurve3([
 [-6.45,-73],[-24,-73],[-45,-79.5],[-54,-97],[-42,-130],[48,-130],airportWorld(-90,31),AIRPORT_FERRY_PORTS.airport.berth,
].map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
const turn=(a,b,t)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d< -Math.PI)d+=2*Math.PI;return a+d*t;};

/** A bounded physical crossing pose, shared by the game and movement regressions. */
export function airportFerryPose(destination,progress){
 if(!['town','airport'].includes(destination))throw new RangeError('Unknown airport ferry destination');
 const t=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0)),k=t*t*(3-2*t),u=destination==='airport'?k:1-k;
 let p,yaw;
 if(u<.08){const q=u/.08,port=AIRPORT_FERRY_PORTS.town;p=new THREE.Vector3(port.berth[0],0,port.berth[1]+(-73-port.berth[1])*q);yaw=0;}
 else if(u<.1){p=new THREE.Vector3(-6.45,0,-73);const q=(u-.08)/.02;yaw=(destination==='airport'?-1:1)*Math.PI/2*q;}
 else {const v=(u-.1)/.9;p=ROUTE.getPointAt(v);const d=ROUTE.getTangentAt(Math.max(.0001,Math.min(.9999,v)));if(destination==='town')d.negate();yaw=Math.atan2(d.x,d.z);
  if(u>.9)yaw=turn(yaw,AIRPORT_FERRY_PORTS.airport.yaw,Math.min(1,(u-.9)/.04));}
 return {x:p.x,y:SEA_LEVEL+.12,z:p.z,yaw,deckY:SEA_LEVEL+.12+AIRPORT_FERRY.deck,progress:t};
}

/** A boarding anchor on the public pier, clear of its bollards and winch. */
export function registerAirportFerryPier({parent,register=()=>{},onBoard=()=>{}}){
 const p=AIRPORT_FERRY_PORTS.town,a=new THREE.Object3D();a.name='Shared ferry boarding point';a.position.set(p.landing[0],p.height+1,p.landing[1]);parent.add(a);
 register(a,'Board the Minato–Kitano-jima ferry',onBoard);
 return a;
}
