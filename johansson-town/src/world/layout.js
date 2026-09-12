import {DINING,NIGHT_LANE,inDiningLane} from './dining-layout.js';
import {RESIDENTIAL,inResidential,residentialContains,residentialHeight} from './residential-layout.js';
import {FULL_TOWN,fullHeight,fullContains} from './full-town-state.js';
import {PARK,parkHeight} from './park-layout.js';
// Rendering, grounding and navigation use the same compact street network.
export const BOARDWALK=Object.freeze({minZ:-38,maxZ:8,width:14});
export const OUTER_PIER=Object.freeze({x:0,z:-57.3,width:8.2,length:15.3,height:.098});
const boardwalkRoute={id:'harbour-boardwalk',width:BOARDWALK.width,surface:'wood',points:[[0,BOARDWALK.maxZ],[0,BOARDWALK.minZ]]};
export const ROUTES = [
 {id:'shotengai',width:14,surface:'asphalt',points:[[0,31],[0,-38]]},
 {id:'quay',width:12,surface:'stone',points:[[-17,-44],[17,-44]]},
 {id:'outer-pier',width:8.2,surface:'wood',points:[[0,-44],[0,-64.5]]},
 {id:'east-alley',width:3.8,surface:'stone',points:[[0,4],[38,4],[38,31],[0,31]]},
 {id:'west-alley',width:3.6,surface:'stone',points:[[0,31],[-36,31],[-36,-44],[-18,-44]]},
 {id:'residential',width:3.4,surface:'stone',points:[[RESIDENTIAL.laneX,-20],[RESIDENTIAL.laneX,4]]},
 {id:'second-pier',width:4.6,surface:'wood',points:[[-36,-44],[-36,-62],[-26,-62]]},
 {id:'home-door',width:3,surface:'stone',points:[[28,31],[28,30]]},
 {id:'izakaya-door',width:4,surface:'asphalt',points:[[DINING.izakayaX,4],DINING.izakayaDoor]},
 {id:'ramen-door',width:4,surface:'stone',points:[[DINING.ramenDoor[0],4],DINING.ramenDoor]},
 {id:'crystal-door',width:2.4,surface:'stone',points:[[DINING.crystalDoor[0],4],DINING.crystalDoor]},
 {id:'bus-door',width:3,surface:'stone',points:[[-14,31],[-14,30]]},
 {id:'office-door',width:2.6,surface:'stone',points:[[13.3,-36],[13.3,-37.55]]},
 {id:'office-crossing',width:3,surface:'stone',points:[[0,-36],[18,-36]]},
 {id:'school-route',width:3,surface:'stone',points:[[38,24],[40,24]]},
 {id:'park-walk',width:4,surface:'stone',points:[[18,-44],[30,-44],[30,-36.8]]},
 {id:'park-approach',width:3,surface:'stone',points:[[16,-27],[22.2,-27]]},
 {id:'south-cut',width:3,surface:'stone',points:[[0,-36],[-36,-36]]},
 {id:'market-cut',width:3,surface:'stone',points:[[0,-20],[-36,-20]]},
 {id:'workshop-cut',width:3,surface:'stone',points:[[0,4],[-36,4]]},
 {id:'north-cut',width:3,surface:'stone',points:[[0,24],[-18,24]]},
 {id:'west-service',width:3,surface:'stone',points:[[-8.5,-20],[-8.5,4]]},
 {id:'east-service',width:3,surface:'stone',points:[[18,-44],[18,-36],[16,-36],[16,-2],[20.8,-2],[20.8,4]]},
 {id:'east-market-cut',width:3,surface:'stone',points:[[0,-20],[16,-20]]},
 {id:'bathhouse-door',width:3,surface:'stone',points:[[-28,31],[-28,28]]},
 {id:'shrine-slope',width:5,surface:'stone',points:[[20,31],[20,38],[26,41],[32,43]]},
];
export function nearestOnSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],q=dx*dx+dz*dz;const t=q?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/q)):0;return {x:a[0]+dx*t,z:a[1]+dz*t,t,d:Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};}
export const LANDINGS=[{id:"shrine-landing",x:32,z:47,w:8,d:8,height:6,surface:"stone"}];
export function routeAt(x,z,r=0){
 if(FULL_TOWN.active)return fullContains(x,z,r,parkHeight)?{id:'supplied-town',surface:'stone'}:null;
 if(inDiningLane(x,z))return {id:'dining-lane',surface:'asphalt'};
 if(inResidential(x,z))return residentialContains(x,z,r)?{id:'willow-alley',surface:'stone'}:null;
 if(Math.abs(x-PARK.x)<=PARK.half-r&&Math.abs(z-PARK.z)<=PARK.half-r)return PARK;
 // Match the ends of the actual decks, without round route caps over water.
 if(Math.abs(x)<=7-r&&z>=-38&&z<=34.2-r)return z<=BOARDWALK.maxZ?boardwalkRoute:ROUTES[0];
 if(Math.abs(x)<=19-r&&z>=-49.7&&z<=-38)return ROUTES[1];
 if(Math.abs(x)<=OUTER_PIER.width/2-r&&z>=OUTER_PIER.z-OUTER_PIER.length/2+r&&z<=-49.7)return ROUTES[2];
 return LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2-r&&Math.abs(z-p.z)<=p.d/2-r)||ROUTES.slice(3).find(route=>route.points.slice(1).some((b,i)=>nearestOnSegment(x,z,route.points[i],b).d<=route.width/2-r));
}
export function groundHeight(x,z){if(FULL_TOWN.active)return fullHeight(x,z,parkHeight);if(inDiningLane(x,z))return NIGHT_LANE.y;const rh=residentialHeight(x,z);if(rh!==null)return rh;if(x>=17.5&&x<22.2&&Math.abs(z+27)<=1.5)return (x-17.5)/4.7*parkHeight(22.2,z);const ph=parkHeight(x,z);if(ph!==null)return ph;if(Math.abs(x-30)<=2.1&&z>=-44&&z< -36.8)return (z+44)/7.2*parkHeight(30,-36.8);if(Math.abs(x-OUTER_PIER.x)<=OUTER_PIER.width/2&&Math.abs(z-OUTER_PIER.z)<=OUTER_PIER.length/2)return OUTER_PIER.height;const landing=LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2&&Math.abs(z-p.z)<=p.d/2);if(landing)return landing.height;const slope=ROUTES.find(r=>r.id==='shrine-slope');let best=null,done=0,total=0;for(let i=1;i<slope.points.length;i++)total+=Math.hypot(slope.points[i][0]-slope.points[i-1][0],slope.points[i][1]-slope.points[i-1][1]);for(let i=1;i<slope.points.length;i++){const a=slope.points[i-1],b=slope.points[i],n=nearestOnSegment(x,z,a,b),len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!best||n.d<best.d)best={...n,height:(done+n.t*len)/total*6};done+=len;}return best.d<4?best.height:0;}
export const MAP_BOUNDS={minX:-44,maxX:48,minZ:-72,maxZ:54};
