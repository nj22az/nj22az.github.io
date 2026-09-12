import {DINING_FOOTPRINTS} from './dining-footprints.js';
// A walk from the main street through the supplied lane ends at both restaurants.
export const DINING=Object.freeze({izakayaX:25,izakayaZ:11,izakayaDoor:Object.freeze([25,6]),ramenX:26,ramenZ:-4,ramenDoor:Object.freeze([26.65,.7]),crystalDoor:Object.freeze([23.2,.7])});
export const NIGHT_LANE=Object.freeze({x:10.5,z:4,y:.05,angle:-Math.PI/2,minX:7.55,maxX:23.61,minZ:.54,maxZ:7.46});
export const diningPoint=(x,z)=>[NIGHT_LANE.x-z,NIGHT_LANE.z+x];
export function inDiningLane(x,z){return x>=NIGHT_LANE.minX&&x<=NIGHT_LANE.maxX&&z>=NIGHT_LANE.minZ&&z<=NIGHT_LANE.maxZ;}
export const DINING_COLLIDERS=Object.freeze(DINING_FOOTPRINTS.map(b=>{const [x,z]=diningPoint((b.min[0]+b.max[0])/2,(b.min[2]+b.max[2])/2);return Object.freeze({id:'dining-street:'+b.id,x,z,w:b.max[2]-b.min[2],d:b.max[0]-b.min[0],height:b.max[1]+NIGHT_LANE.y});}));
