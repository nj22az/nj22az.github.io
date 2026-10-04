import {KITAHAMA} from './kitahama-layout.js';
/** Rainflower links Main Street, Aoba Garden and Kitahama on the same street grid. */
export const SHOPPING_LANE_SCALE=.6;
export const SHOPPING_LANE=Object.freeze({minX:-4.5,maxX:11.1,minZ:30,maxZ:53.6,x:3.3,z:41.4,y:0,entry:Object.freeze([3.3,30]),exit:Object.freeze([3.3,53.2]),crosswalks:Object.freeze([36.9,44.7])});
// The existing shop composition keeps its full height, with the same compact plan
// scale as the adjacent garden. All geometry, collision and people use this frame.
export const shoppingLanePoint=(x,z)=>[SHOPPING_LANE.x+(x-90)*SHOPPING_LANE_SCALE,SHOPPING_LANE.z+(z-113)*SHOPPING_LANE_SCALE];
export function placeShoppingLaneGroup(group){const [x,z]=shoppingLanePoint(group.position.x,group.position.z);group.position.x=x;group.position.z=z;group.scale.x*=SHOPPING_LANE_SCALE;group.scale.z*=SHOPPING_LANE_SCALE;}
export function placeShoppingLaneColliders(colliders,start=0){for(const c of colliders.slice(start)){const [x,z]=shoppingLanePoint(c.x,c.z);Object.assign(c,{x,z,w:c.w*SHOPPING_LANE_SCALE,d:c.d*SHOPPING_LANE_SCALE,rainflower:true});}}
export const SHOPPING_LANE_ROWS=Object.freeze([99,112,125]);
export const SHOPPING_LANE_ROUTE=Object.freeze({id:'island-shopping-lane',peninsula:true,width:3.6,surface:'asphalt',points:[[0,27],[3.3,27],SHOPPING_LANE.entry,SHOPPING_LANE.exit]});
export const SHOPPING_LANE_ROUTES=[SHOPPING_LANE_ROUTE,...SHOPPING_LANE.crosswalks.map((z,i)=>({id:'rainflower-crosswalk-'+i,peninsula:true,width:2,surface:'stone',points:[[-5.4,z],[11.1,z]]})),{id:'rainflower-residential-walk',peninsula:true,width:1.8,surface:'stone',points:[SHOPPING_LANE.exit,[1.9,SHOPPING_LANE.exit[1]],[1.9,66]]}];
export const inShoppingLane=(x,z)=>x>=SHOPPING_LANE.minX&&x<=SHOPPING_LANE.maxX&&z>=SHOPPING_LANE.minZ&&z<=SHOPPING_LANE.maxZ;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
/** Grade the street's datum into the island, ending before Kitahama's pocket park. */
export function shoppingLaneGroundHeight(x,z){
 const L=SHOPPING_LANE,dx=Math.max(L.minX-x,0,x-L.maxX)/4,dz=Math.max(L.minZ-z,0)/4+Math.max(z-L.maxZ,0)/1.4,t=Math.hypot(dx,dz);
 let h=t<=1?-.4*smooth(t):null;
 if(z>=L.maxZ&&z<=58&&Math.abs(x-1.9)<=1.4){const ramp=-.4*smooth((z-L.maxZ)/(58-L.maxZ)),blend=1-smooth((Math.abs(x-1.9)-.6)/.8),base=h??-.4;h=base+(ramp-base)*blend;}
 // The service corner of Well Lane keeps its existing lower datum, including
 // the rubbish cage. Grade beyond the last roof and the edge of the roadway.
 const vergeX=L.x+6*SHOPPING_LANE_SCALE+.3,lastRoofZ=shoppingLanePoint(90,SHOPPING_LANE_ROWS.at(-1)+4.5)[1];
 if(h!==null&&x>vergeX&&z>lastRoofZ){const blend=smooth((x-vergeX)/(KITAHAMA.wellLane.minX-vergeX))*smooth((z-lastRoofZ)/(KITAHAMA.wellLane.minZ-lastRoofZ));h+=(KITAHAMA.y-h)*blend;}
 return h===0?0:h;
}
export const SHOPPING_LANE_OUTFIT=Object.freeze({top:'jacket',topColour:'#eee8da',pattern:'none',bottom:'skirt',bottomColour:'#9b2834',bottomPattern:'plaid',footwear:'boots',shoes:'#704431',accent:'#e7c887',hat:'none'});
