import {DINING_FOOTPRINTS} from './dining-footprints.js';
// Unfold the two sides of the supplied alley into two Main Street shop rows.
// A–D form the west block facing east; E–H form the east block facing west.
export const DINING_ROWS=Object.freeze([
 Object.freeze({id:'north',units:Object.freeze(['A','B','C','D']),x:-6.8,z:-.5,yaw:0}),
 Object.freeze({id:'south',units:Object.freeze(['E','F','G','H']),x:.1,z:-2.8,yaw:0}),
]);
export const diningRow=x=>DINING_ROWS[x<0?0:1];
export function diningPoint(x,z){const r=diningRow(x),sign=Math.cos(r.yaw);return [r.x+sign*x,r.z+sign*z];}
export const NIGHT_LANE=Object.freeze({x:.1,z:.9,y:0,minX:-.5,maxX:4.8,minZ:-13,maxZ:14.5});
export function inDiningLane(x,z){return x>=NIGHT_LANE.minX&&x<=NIGHT_LANE.maxX&&z>=NIGHT_LANE.minZ&&z<=NIGHT_LANE.maxZ;}
export const DINING_COLLIDERS=Object.freeze(DINING_FOOTPRINTS.map(b=>{const [x,z]=diningPoint((b.min[0]+b.max[0])/2,(b.min[2]+b.max[2])/2);return Object.freeze({id:'dining-street:'+b.id,x,z,w:b.max[0]-b.min[0],d:b.max[2]-b.min[2],height:b.max[1]+NIGHT_LANE.y});}));

export const DINING=Object.freeze({
 // Next to Sakura's north wall; retain the full-size konbini and clear footway.
 // Set back from the west pavement: at -11.97 the east face landed at -7.45,
 // 0.10 inside the pavement edge, which blocked the south shop crossing.
 izakayaX:-12.5,izakayaZ:-20.4,izakayaYaw:Math.PI/2,izakayaDoor:Object.freeze([-7.05,-20.4]),
 ramenX:5.45,ramenZ:-12.8,ramenYaw:-Math.PI/2,ramenDoor:Object.freeze([.75,-12.15]),crystalDoor:Object.freeze([.75,-15.6]),
});
// Cardinal rotations are exact so entrance and collision coordinates agree.
const restaurantRotation=kind=>{const yaw=DINING[kind+'Yaw'];return [Math.round(Math.cos(yaw)),Math.round(Math.sin(yaw))];};
export const restaurantPoint=(kind,x,z)=>{const [c,s]=restaurantRotation(kind);return [DINING[kind+'X']+x*c+z*s,DINING[kind+'Z']-x*s+z*c];};
export const restaurantCollider=(kind,{x,z,w,d,...rest})=>{const [wx,wz]=restaurantPoint(kind,x,z),[c,s]=restaurantRotation(kind);return {x:wx,z:wz,w:Math.abs(c)*w+Math.abs(s)*d,d:Math.abs(s)*w+Math.abs(c)*d,...rest};};
export const restaurantApproach=kind=>{const [x,z]=DINING[kind+'Door'],[c,s]=restaurantRotation(kind);return [x+.7*s,z+.7*c];};
