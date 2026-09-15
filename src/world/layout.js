import {DINING,NIGHT_LANE,inDiningLane} from './dining-layout.js';
import {RESIDENTIAL,inResidential,residentialContains,residentialHeight} from './residential-layout.js';
import {FULL_TOWN,fullHeight,fullContains} from './full-town-state.js';
import {PARK,parkHeight} from './park-layout.js';
import {MAIN_ROAD,SHOP_CROSSING_Z} from './main-road.js';
import {BUS_STATION,BUS_STATION_ROUTES} from './bus-station.js';
import {shoppingDistrictActive} from './town-mode.js';
// Rendering, grounding and navigation use the same compact street network.
export const BOARDWALK=Object.freeze({x:MAIN_ROAD.x,minZ:-38,maxZ:8,width:MAIN_ROAD.width});
export const OUTER_PIER=Object.freeze({x:0,z:-57.3,width:8.2,length:15.3,height:.098});
const boardwalkRoute={id:'harbour-boardwalk',width:BOARDWALK.width,surface:'wood',points:[[BOARDWALK.x,BOARDWALK.maxZ],[BOARDWALK.x,BOARDWALK.minZ]]};
export const ROUTES = [
 {id:'shotengai',width:MAIN_ROAD.width,surface:'asphalt',points:[[MAIN_ROAD.x,31],[MAIN_ROAD.x,-38]]},
 {id:'quay',width:12,surface:'stone',points:[[-17,-44],[17,-44]]},
 {id:'outer-pier',width:8.2,surface:'wood',points:[[0,-44],[0,-64.5]]},
 ...BUS_STATION_ROUTES,
 {id:'east-alley',width:3,surface:'stone',points:[[0,SHOP_CROSSING_Z],[38,SHOP_CROSSING_Z],[38,31],[0,31]]},
 {id:'west-alley',width:3.6,surface:'stone',points:[[0,31],[-36,31],[-36,-44],[-18,-44]]},
 {id:'second-pier',width:4.6,surface:'wood',points:[[-36,-44],[-36,-62],[-26,-62]]},
 {id:'izakaya-door',width:3,surface:'asphalt',points:[[0,DINING.izakayaDoor[1]],DINING.izakayaDoor]},
 {id:'ramen-door',width:2.8,surface:'stone',points:[[0,DINING.ramenDoor[1]],DINING.ramenDoor]},
 {id:'crystal-door',width:2.4,surface:'stone',points:[[0,DINING.crystalDoor[1]],DINING.crystalDoor]},
 {id:'office-door',width:2.6,surface:'stone',points:[[13.3,-36],[13.3,-37.55]]},
 {id:'office-crossing',width:3,surface:'stone',points:[[0,-36],[18,-36]]},
 {id:'park-walk',width:4,surface:'stone',points:[[18,-44],[30,-44],[30,-36.8]]},
 {id:'park-approach',width:3,surface:'stone',points:[[16,-27],[22.2,-27]]},
 {id:'south-cut',width:3,surface:'stone',points:[[0,-36],[-36,-36]]},
 {id:'market-cut',width:3,surface:'stone',points:[[0,-20],[-36,-20]]},
 {id:'west-service',width:3,surface:'stone',points:[[-8.5,-20],[-8.5,31]]},
 {id:'east-service',width:3,surface:'stone',points:[[18,-44],[18,SHOP_CROSSING_Z]]},
 {id:'east-market-cut',width:3,surface:'stone',points:[[0,-20],[16,-20]]},
];
export function nearestOnSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],q=dx*dx+dz*dz;const t=q?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/q)):0;return {x:a[0]+dx*t,z:a[1]+dz*t,t,d:Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};}
export const LANDINGS=[];
export function routeAt(x,z,r=0){
 if(FULL_TOWN.active)return fullContains(x,z,r,parkHeight)?{id:'supplied-town',surface:'stone'}:null;
 if(inDiningLane(x,z))return {id:'shop-pavement',surface:'stone'};
 if(!shoppingDistrictActive()&&inResidential(x,z))return residentialContains(x,z,r)?{id:'main-street-homes',surface:'stone'}:null;
 if(x>=BUS_STATION.minX+r&&x<=BUS_STATION.maxX-r&&z>=BUS_STATION.minZ+r&&z<=BUS_STATION.maxZ-r)return {id:BUS_STATION.id,surface:'stone'};
 if(Math.abs(x-PARK.x)<=PARK.half-r&&Math.abs(z-PARK.z)<=PARK.half-r)return PARK;
 // Match the ends of the actual decks, without round route caps over water.
 if(x>=MAIN_ROAD.pavementWest&&x<=MAIN_ROAD.pavementEast-r&&z>=MAIN_ROAD.minZ&&z<=MAIN_ROAD.maxZ-r){
  if(x>=MAIN_ROAD.west&&x<=MAIN_ROAD.east)return z<=BOARDWALK.maxZ?boardwalkRoute:ROUTES[0];
  return {id:'main-street-pavement',surface:'stone'};
 }
 if(Math.abs(x)<=19-r&&z>=-49.7&&z<=-38)return ROUTES[1];
 if(Math.abs(x)<=OUTER_PIER.width/2-r&&z>=OUTER_PIER.z-OUTER_PIER.length/2+r&&z<=-49.7)return ROUTES[2];
 return LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2-r&&Math.abs(z-p.z)<=p.d/2-r)||ROUTES.slice(3).find(route=>route.points.slice(1).some((b,i)=>nearestOnSegment(x,z,route.points[i],b).d<=route.width/2-r));
}
export function groundHeight(x,z){if(FULL_TOWN.active)return fullHeight(x,z,parkHeight);if(inDiningLane(x,z))return NIGHT_LANE.y;const rh=!shoppingDistrictActive()?residentialHeight(x,z):null;if(rh!==null)return rh;if(x>=17.5&&x<22.2&&Math.abs(z+27)<=1.5)return (x-17.5)/4.7*parkHeight(22.2,z);const ph=parkHeight(x,z);if(ph!==null)return ph;if(Math.abs(x-30)<=2.1&&z>=-44&&z< -36.8)return (z+44)/7.2*parkHeight(30,-36.8);if(Math.abs(x-OUTER_PIER.x)<=OUTER_PIER.width/2&&Math.abs(z-OUTER_PIER.z)<=OUTER_PIER.length/2)return OUTER_PIER.height;return 0;}
export const MAP_BOUNDS={minX:-44,maxX:48,minZ:-72,maxZ:46};
