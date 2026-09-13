import {DINING_FOOTPRINTS} from './dining-footprints.js';
// Unfold the two sides of the supplied alley into two Main Street shop rows.
// A–D turn through 180 degrees; E–H retain their authored orientation.
export const DINING_ROWS=Object.freeze([
 Object.freeze({id:'north',units:Object.freeze(['A','B','C','D']),x:1.2,z:8.8,yaw:Math.PI}),
 Object.freeze({id:'south',units:Object.freeze(['E','F','G','H']),x:1.1,z:1,yaw:0}),
]);
export const diningRow=x=>DINING_ROWS[x<0?0:1];
export function diningPoint(x,z){const r=diningRow(x),sign=x<0?-1:1;return [r.x+sign*x,r.z+sign*z];}
export const NIGHT_LANE=Object.freeze({x:1.2,z:5.1,y:0,minX:-.5,maxX:5.2,minZ:-18,maxZ:27});
export function inDiningLane(x,z){return x>=NIGHT_LANE.minX&&x<=NIGHT_LANE.maxX&&z>=NIGHT_LANE.minZ&&z<=NIGHT_LANE.maxZ;}
export const DINING_COLLIDERS=Object.freeze(DINING_FOOTPRINTS.map(b=>{const [x,z]=diningPoint((b.min[0]+b.max[0])/2,(b.min[2]+b.max[2])/2);return Object.freeze({id:'dining-street:'+b.id,x,z,w:b.max[0]-b.min[0],d:b.max[2]-b.min[2],height:b.max[1]+NIGHT_LANE.y});}));

export const DINING=Object.freeze({
 izakayaX:6.9,izakayaZ:25,izakayaYaw:-Math.PI/2,izakayaDoor:Object.freeze([1.9,25]),
 ramenX:6.55,ramenZ:-10.7,ramenYaw:-Math.PI/2,ramenDoor:Object.freeze([1.85,-10.05]),crystalDoor:Object.freeze([1.85,-13.5]),
});
export const restaurantPoint=(kind,x,z)=>[DINING[kind+'X']-z,DINING[kind+'Z']+x];
export const restaurantCollider=(kind,{x,z,w,d,...rest})=>{const [wx,wz]=restaurantPoint(kind,x,z);return {x:wx,z:wz,w:d,d:w,...rest};};
