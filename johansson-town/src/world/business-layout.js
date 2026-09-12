import {DINING_FOOTPRINTS} from './dining-footprints.js';
import {diningPoint,NIGHT_LANE} from './dining-layout.js';
export const ALLEY_UNITS=Object.freeze({frontrow:['B','C'],form3d:['G','H']});
export function alleyBusinessLayout(id){
 const ids=ALLEY_UNITS[id];if(!ids)return null;
 const units=ids.map(id=>DINING_FOOTPRINTS.find(b=>b.id===id)),first=units[0];
 const minX=Math.min(...units.map(b=>b.min[0])),maxX=Math.max(...units.map(b=>b.max[0])),minZ=Math.min(...units.map(b=>b.min[2])),maxZ=Math.max(...units.map(b=>b.max[2]));
 const south=first.max[0]<0,front=south?first.max[0]:first.min[0],along=(first.min[2]+first.max[2])/2;
 const [x,z]=diningPoint(front,along),[dx,dz]=diningPoint(front+(south?.44:-.44),along);
 const width=maxZ-minZ-.22,depth=maxX-minX-.22,centre=NIGHT_LANE.x-(minZ+maxZ)/2;
 const doorX=(x-centre)*(south?1:-1),halfW=width/2,halfD=depth/2;
 return {building:ids[0],units:ids,x,z,yaw:south?0:Math.PI,door:[dx,NIGHT_LANE.y,dz],
  room:{width,depth,bounds:{minX:-halfW,maxX:halfW,minZ:-halfD,maxZ:halfD},doorX,spawn:[doorX,0,halfD-.48],exit:[doorX,1.1,halfD-.08],yaw:0,
   staff:id==='frontrow'?{Aya:[-1.9,0,0],Reiko:[1.65,0,0]}:{Kenji:[-1.25,0,.08],Tetsuo:[.75,0,.08]}}};
}
export const HARBOUR_OFFICE=Object.freeze({x:13.3,z:-42,width:7.2,depth:7.2,door:[13.3,0,-37.55],frontZ:-38.4});
export const ALLEY_BOOKS=alleyBusinessLayout('frontrow');
export const ALLEY_WORKSHOP=alleyBusinessLayout('form3d');
