import * as THREE from '../../vendor/three.module.js';
import {FERRY_SHIP} from './ferry-ship.js';

/**
 * How the Minato Maru moves in Minato harbour: where her centre goes, and which way her bow
 * points, which is not always the way she is going. A 22 m twin-screw ferry with a bow thruster
 * comes in round the breakwater's west end, swings in the basin and lays herself alongside the
 * pier; leaving, she goes astern off the berth, swings with the thruster and only then goes ahead.
 *
 * A path is a list of keys [x, z, yaw°|null]: the centre passes through every key; where a key
 * gives a yaw the bow points that way there (null: along the track, bow first), and between keys
 * it turns smoothly. The keys were chosen so that every point of the hull stays at least 0.15 m
 * off the outer pier (her moored clearance) and clear of the breakwater (tests/ferry.test.mjs).
 */
const PIER_WEST=-4.1;
/** Moored: port side to the outer pier's west flank, the bow 0.5 m off the quay wall at z -50. */
export const BERTH_X=PIER_WEST-FERRY_SHIP.beam/2-.15,BERTH_Z=-50.5-FERRY_SHIP.length/2;

export const TOWN_ARRIVAL_KEYS=Object.freeze([
 [-120,-205,null],[-82,-142,null],[-56,-100,null],[-44,-77,null],
 // Inside the breakwater: slowing, and swinging her bow to the north as she crosses the basin.
 [-30,-70,75],[-19,-67,45],[-12,-65.8,14],[-8.2,-64.2,2],[BERTH_X,BERTH_Z,0],
].map(k=>Object.freeze(k)));
export const TOWN_DEPARTURE_KEYS=Object.freeze([
 // Astern off the berth, straight, until her bow is clear of the quay corner...
 [BERTH_X,BERTH_Z,0],[BERTH_X-.05,-64,0],[-7.9,-66.5,-4],
 // ...the thruster pushes the bow west while she still drifts astern...
 [-12,-68.3,-35],[-19.5,-69.8,-82],
 // ...then ahead, out round the breakwater's west end.
 [-30,-73,-110],[-44,-79,null],[-56,-100,null],[-82,-142,null],[-120,-205,null],
].map(k=>Object.freeze(k)));

const wrap=d=>{while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;};

/** A keyed path: pose(u) for u 0–1 along it, and the share at which it passes a key or a point. */
export function keyedPath(keys){
 const curve=new THREE.CatmullRomCurve3(keys.map(([x,z])=>new THREE.Vector3(x,0,z)),false,'centripetal');
 const v=new THREE.Vector3(),t=new THREE.Vector3();
 const shareNear=(x,z)=>{let best=0,bestD=Infinity;for(let i=0;i<=1200;i++){curve.getPointAt(i/1200,v);const d=Math.hypot(v.x-x,v.z-z);if(d<bestD){bestD=d;best=i/1200;}}return best;};
 const at=keys.map(([x,z])=>shareNear(x,z));at[0]=0;at[at.length-1]=1;
 const tangentYaw=u=>{curve.getTangentAt(Math.max(.0005,Math.min(.9995,u)),t);return Math.atan2(t.x,t.z);};
 const yawOf=(i,u)=>keys[i][2]===null?tangentYaw(u):keys[i][2]*Math.PI/180;
 function pose(u){
  u=Math.max(0,Math.min(1,u));curve.getPointAt(u,v);
  let j=at.findIndex(a=>a>u);if(j===-1)j=at.length-1;if(j===0)j=1;
  const i=j-1,f=Math.max(0,Math.min(1,(u-at[i])/((at[j]-at[i])||1))),s=f*f*(3-2*f);
  const a=yawOf(i,u),b=yawOf(j,u);
  return {x:v.x,z:v.z,yaw:a+wrap(b-a)*s};
 }
 return {curve,pose,at,shareNear};
}
