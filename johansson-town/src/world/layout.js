import {DINING,NIGHT_LANE,inDiningLane,IZAKAYA_LANE} from './dining-layout.js';
import {RESIDENTIAL,inResidential,residentialContains,residentialHeight} from './residential-layout.js';
import {FULL_TOWN,fullHeight,fullContains} from './full-town-state.js';
import {PARK,parkHeight,parkApproachHeight,parkSkirtHeight} from './park-layout.js';
import {MAIN_ROAD,SHOP_CROSSING_Z} from './main-road.js';
import {BUS_STATION,BUS_STATION_ROUTES} from './bus-station.js';
import {FOREST_EDGE} from './forest-edge.js';
import {TUNNEL} from './coyote-tunnel.js';
import {shoppingDistrictActive,peninsulaActive} from './town-mode.js';
import {EAST_LAWN,eastLawnAt} from './east-lawn.js';
import {WEST_YARD,westYardAt} from './west-yard.js';
// Rendering, grounding and navigation use the same compact street network.
export const BOARDWALK=Object.freeze({x:MAIN_ROAD.x,minZ:-38,maxZ:8,width:MAIN_ROAD.width});
export const OUTER_PIER=Object.freeze({x:0,z:-57.3,width:8.2,length:15.3,height:.098});
const boardwalkRoute={id:'harbour-boardwalk',width:BOARDWALK.width,surface:'wood',points:[[BOARDWALK.x,BOARDWALK.maxZ],[BOARDWALK.x,BOARDWALK.minZ]]};
export const ROUTES = [
 {id:'shotengai',width:MAIN_ROAD.width,surface:'asphalt',points:[[MAIN_ROAD.x,MAIN_ROAD.maxZ],[MAIN_ROAD.x,MAIN_ROAD.minZ]]},
 {id:'quay',width:12,surface:'stone',points:[[-17,-44],[17,-44]]},
 {id:'outer-pier',width:8.2,surface:'wood',points:[[0,-44],[0,-64.5]]},
 ...BUS_STATION_ROUTES,
 {id:'shop-crossing',width:3,surface:'stone',points:[[MAIN_ROAD.pavementWest,SHOP_CROSSING_Z],[MAIN_ROAD.pavementEast,SHOP_CROSSING_Z]]},
 {id:'south-shop-crossing',width:3,surface:'stone',points:[[MAIN_ROAD.pavementWest,-18],[MAIN_ROAD.pavementEast,-18]]},
 {id:'east-alley',width:3,surface:'stone',points:[[0,18.4],[8.4,18.4]]},
 {id:'west-alley',legacy:true,width:3.6,surface:'stone',points:[[0,31],[-36,31],[-36,-44],[-18,-44]]},
 {id:'second-pier',width:4.6,surface:'wood',points:[[-36,-44],[-36,-62],[-26,-62]]},
 {id:'izakaya-door',width:3,surface:'asphalt',points:IZAKAYA_LANE},
 {id:'ramen-door',width:2.8,surface:'stone',points:[[0,DINING.ramenDoor[1]],DINING.ramenDoor]},
 {id:'crystal-door',legacy:true,width:2.4,surface:'stone',points:[[0,DINING.crystalDoor[1]],DINING.crystalDoor]},
 {id:'office-door',width:2.6,surface:'stone',points:[[13.3,-36],[13.3,-37.55]]},
 {id:'office-crossing',width:3,surface:'stone',points:[[0,-36],[18,-36]]},
 {id:'park-walk',width:4,surface:'stone',points:[[0,-36],[4.6,-36],[4.6,PARK.z]]},
 {id:'park-approach',width:3,surface:'stone',points:[[4.6,PARK.z],[PARK.x-PARK.half+.35,PARK.z]]},
 // The pavement stops two metres short of the park, so the lawn could only be reached
 // through one slot halfway along it and the rest read as an invisible wall. This is
 // the apron between the two: ground you can actually walk along beside the grass.
 // The pavement stopped two metres short of the park, so the lawn could only be
 // reached through one slot halfway along it and the rest read as an invisible wall.
 // This is the apron between them. It stops at the plinth on purpose: the park is
 // raised by up to 1.2m and only the approach ramps up to it, so running the apron
 // over the edge would pop the player up the side of it.
 {id:'park-edge',width:3.4,surface:'stone',points:[[PARK.x-PARK.half-1.65,PARK.z-PARK.half+.8],[PARK.x-PARK.half-1.65,PARK.z+PARK.half-.8]]},
 {id:'south-cut',width:3,surface:'stone',points:[[0,-36],[-12,-36]]},
 {id:'market-cut',width:3,surface:'stone',points:[[0,-26],[-5.5,-26]]},
 {id:'west-service',legacy:true,width:3,surface:'stone',points:[[-8.5,-20],[-8.5,31]]},
 {id:'east-service',legacy:true,width:3,surface:'stone',points:[[26,-44],[26,SHOP_CROSSING_Z]]},
 {id:'east-market-cut',legacy:true,width:3,surface:'stone',points:[[0,-33.5],[16,-33.5]]},
];
export function activeRoutes(){return ROUTES.filter(route=>!shoppingDistrictActive()||!route.legacy);}
export function nearestOnSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],q=dx*dx+dz*dz;const t=q?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/q)):0;return {x:a[0]+dx*t,z:a[1]+dz*t,t,d:Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};}
export const LANDINGS=[];
export function routeAt(x,z,r=0){
 if(FULL_TOWN.active)return fullContains(x,z,r,parkHeight)?{id:'supplied-town',surface:'stone'}:null;
 if(inDiningLane(x,z))return {id:'shop-pavement',surface:'stone'};
 if(!shoppingDistrictActive()&&inResidential(x,z))return residentialContains(x,z,r)?{id:'main-street-homes',surface:'stone'}:null;
 if(x>=BUS_STATION.minX+r&&x<=BUS_STATION.maxX-r&&z>=BUS_STATION.minZ+r&&z<=BUS_STATION.maxZ-r)return {id:BUS_STATION.id,surface:'stone'};
 // The bus-only road past the terminal. It is signed for buses and there is a painted
 // tunnel at the end of it, so of course people walk up it to look: leaving it off the
 // walkable set meant you were stopped by nothing at all, thirty metres short of the
 // one thing out here worth walking to. It ends at the rock, because the rock is where
 // it ends — running the road through the arch gives the joke away before you get to it.
 if(peninsulaActive()&&Math.abs(x-FOREST_EDGE.roadX)<=MAIN_ROAD.width/2-r
  &&z>=MAIN_ROAD.maxZ&&z<=FOREST_EDGE.roadEndZ+3.4-r)return {id:'bus-forest-road',surface:'asphalt'};
 if(Math.abs(x-PARK.x)<=PARK.half-r&&Math.abs(z-PARK.z)<=PARK.half-r)return PARK;
 // The park is asked first, so the lawn is the ground around its mound rather than a
 // lid over it, and its ramp keeps its own paving where the two overlap. Only the
 // peninsula has an east side clear enough to stand on.
 // Match the ends of the actual decks, without round route caps over water.
 if(x>=MAIN_ROAD.pavementWest&&x<=MAIN_ROAD.pavementEast-r&&z>=MAIN_ROAD.minZ&&z<=MAIN_ROAD.maxZ-r){
  if(x>=MAIN_ROAD.west&&x<=MAIN_ROAD.east)return z<=BOARDWALK.maxZ?boardwalkRoute:ROUTES[0];
  return {id:'main-street-pavement',surface:'stone'};
 }
 if(Math.abs(x)<=19-r&&z>=-49.7&&z<=-38)return ROUTES[1];
 if(Math.abs(x)<=OUTER_PIER.width/2-r&&z>=OUTER_PIER.z-OUTER_PIER.length/2+r&&z<=-49.7)return ROUTES[2];
 const route=LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2-r&&Math.abs(z-p.z)<=p.d/2-r)||activeRoutes().slice(3).find(route=>route.points.slice(1).some((b,i)=>nearestOnSegment(x,z,route.points[i],b).d<=route.width/2-r));
 if(route)return route;
 // The lawn is asked last, so the park's mound, its ramp and every authored path keep
 // their own surface and the green is simply whatever is left over. Asking it earlier
 // cut holes it then had to patch: each one left a dead band a body wide where neither
 // the lawn nor what it deferred to would have you, and on open grass that is an
 // invisible wall.
 if(peninsulaActive()&&eastLawnAt(x,z,r))return EAST_LAWN;
 // ...and the same on the shop side, where the konbini stood in an invisible box with
 // only its frontage on ground you could stand on.
 if(peninsulaActive()&&westYardAt(x,z,r))return WEST_YARD;
 return null;
}
export function groundHeight(x,z){if(FULL_TOWN.active)return fullHeight(x,z,parkHeight);if(inDiningLane(x,z))return NIGHT_LANE.y;const rh=!shoppingDistrictActive()?residentialHeight(x,z):null;if(rh!==null)return rh;const ramp=parkApproachHeight(x,z);if(ramp!==null)return ramp;const ph=parkHeight(x,z);if(ph!==null)return ph;const skirt=parkSkirtHeight(x,z);if(skirt!==null)return skirt;if(Math.abs(x-OUTER_PIER.x)<=OUTER_PIER.width/2&&Math.abs(z-OUTER_PIER.z)<=OUTER_PIER.length/2)return OUTER_PIER.height;return 0;}
export const MAP_BOUNDS={minX:-44,maxX:48,minZ:-72,maxZ:TUNNEL.z+TUNNEL.depth+1};
