import {DINING_FOOTPRINTS} from './dining-footprints.js';
// Both restaurants frame the alley with short, direct Main Street approaches.
export const DINING=Object.freeze({izakayaX:12.5,izakayaZ:14,izakayaDoor:Object.freeze([12.5,9]),ramenX:13.5,ramenZ:-6,ramenDoor:Object.freeze([14.15,-1.3]),crystalDoor:Object.freeze([10.7,-1.3])});
export const NIGHT_LANE=Object.freeze({x:10.5,z:4,y:.05,angle:-Math.PI/2,minX:7.55,maxX:23.61,minZ:.54,maxZ:7.46});
export const diningPoint=(x,z)=>[NIGHT_LANE.x-z,NIGHT_LANE.z+x];
export function inDiningLane(x,z){return x>=NIGHT_LANE.minX&&x<=NIGHT_LANE.maxX&&z>=NIGHT_LANE.minZ&&z<=NIGHT_LANE.maxZ;}
export const DINING_COLLIDERS=Object.freeze(DINING_FOOTPRINTS.map(b=>{const [x,z]=diningPoint((b.min[0]+b.max[0])/2,(b.min[2]+b.max[2])/2);return Object.freeze({id:'dining-street:'+b.id,x,z,w:b.max[2]-b.min[2],d:b.max[0]-b.min[0],height:b.max[1]+NIGHT_LANE.y});}));
