import {DINING_FOOTPRINTS} from './dining-footprints.js';
import {peninsulaActive} from './town-mode.js';
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
 // See IZAKAYA_PLOTS below: the peninsula stands it further up the same pavement.
 izakayaX:-12.5,izakayaZ:-20.4,izakayaYaw:Math.PI/2,izakayaDoor:Object.freeze([-7.05,-20.4]),
 ramenX:5.45,ramenZ:-12.8,ramenYaw:-Math.PI/2,ramenDoor:Object.freeze([.75,-12.15]),crystalDoor:Object.freeze([.75,-15.6]),
});
/**
 * The izakaya's plot, which is not in the same place in every layout.
 *
 * On the old street it stands against Sakura's north wall, where the konbini is ten
 * metres wide. The peninsula's konbini is fourteen and it grew northward — its north
 * wall is at z -19.67 — so -20.4 is now three metres inside the shop.
 *
 * On the peninsula it stands next to the bookshop instead, which is where it was asked
 * for: Minato's north gable is at z -6.10 and the relocated bookshop's
 * south wall is at -3.02, leaving a walkable passage between them. Thuan comes out of Sakura, up the west pavement past Aya's window, and
 * in.
 *
 * The door, its approach and the lane to it are live arrays rather than copies:
 * Thuan's evening, Nao's shift and the walkable route all hold these exact arrays, so
 * moving the plot moves them too. Anything that reads the plot syncs them on the way
 * past, and createTown asks for it once as soon as the layout is chosen.
 */
const IZAKAYA_PLOTS=Object.freeze({
 street:Object.freeze([-12.5,-20.4]),
 // North gable at -6.10; the bookshop is separated by a three-metre passage.
 peninsula:Object.freeze([-12.5,-10.43]),
});
export const IZAKAYA_DOOR=[-7.05,-20.4];
export const IZAKAYA_APPROACH=[-6.35,-20.4];
export const IZAKAYA_LANE=[[0,-20.4],IZAKAYA_DOOR];
export function izakayaPlot(){
 const [x,z]=IZAKAYA_PLOTS[peninsulaActive()?'peninsula':'street'];
 IZAKAYA_DOOR[1]=z;IZAKAYA_APPROACH[1]=z;IZAKAYA_LANE[0][1]=z;
 return {x,z,yaw:DINING.izakayaYaw,door:IZAKAYA_DOOR};
}
const restaurantPlot=kind=>kind==='izakaya'?izakayaPlot()
 :{x:DINING[kind+'X'],z:DINING[kind+'Z'],yaw:DINING[kind+'Yaw'],door:DINING[kind+'Door']};
// Cardinal rotations are exact so entrance and collision coordinates agree.
const restaurantRotation=kind=>{const yaw=restaurantPlot(kind).yaw;return [Math.round(Math.cos(yaw)),Math.round(Math.sin(yaw))];};
export const restaurantPoint=(kind,x,z)=>{const p=restaurantPlot(kind),[c,s]=restaurantRotation(kind);return [p.x+x*c+z*s,p.z-x*s+z*c];};
export const restaurantCollider=(kind,{x,z,w,d,...rest})=>{const [wx,wz]=restaurantPoint(kind,x,z),[c,s]=restaurantRotation(kind);return {x:wx,z:wz,w:Math.abs(c)*w+Math.abs(s)*d,d:Math.abs(s)*w+Math.abs(c)*d,...rest};};
export const restaurantApproach=kind=>{
 const p=restaurantPlot(kind),[c,s]=restaurantRotation(kind),[x,z]=p.door;
 if(kind!=='izakaya')return [x+.7*s,z+.7*c];
 IZAKAYA_APPROACH[0]=x+.7*s;IZAKAYA_APPROACH[1]=z+.7*c;return IZAKAYA_APPROACH;
};
