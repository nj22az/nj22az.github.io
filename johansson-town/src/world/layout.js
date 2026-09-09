import {PARK,parkHeight} from './park-layout.js';
// Street and surface data shared by the renderer, map and movement checks.
// Central harbour coordinates remain stable; peripheral lanes form a compact loop.
export const BOARDWALK=Object.freeze({minZ:-52,maxZ:8,width:14});
// Shared by the visible pier deck and actor/player grounding, in metres.
export const OUTER_PIER=Object.freeze({x:0,z:-71.3,width:8.2,length:15.3,height:.098});
const boardwalkRoute={id:'harbour-boardwalk',width:BOARDWALK.width,surface:'wood',points:[[0,BOARDWALK.maxZ],[0,BOARDWALK.minZ]]};
export const ROUTES = [
 {id:'shotengai',width:14,surface:'asphalt',points:[[0,58],[0,-52]]},
 {id:'quay',width:12,surface:'stone',points:[[-17,-58],[17,-58]]},
 {id:'outer-pier',width:8.2,surface:'wood',points:[[0,-58],[0,-79]]},
 {id:'east-alley',width:5.5,surface:'asphalt',points:[[0,18],[29,18],[38,30],[38,50],[20,50],[0,50]]},
 {id:'west-alley',width:5.5,surface:'stone',points:[[0,50],[-29,50],[-40,31],[-42,-5],[-30,-11],[0,-11]]},
 {id:'residential',width:6,surface:'asphalt',points:[[38,30],[48,30],[48,42],[38,42]]},
 {id:'river-walk',width:4,surface:'stone',points:[[-42,-5],[-45,-14],[-45,-37],[-38,-56],[-17,-58]]},
 {id:'second-pier',width:4.6,surface:'wood',points:[[-38,-56],[-38,-76],[-26,-76]]},
 {id:'home-door',width:4,surface:'stone',points:[[28,50],[28,48]]},
 {id:'izakaya-door',width:4,surface:'asphalt',points:[[24,18],[24,20.5]]},
 {id:'ramen-door',width:4,surface:'stone',points:[[24,18],[24,14]]},
 {id:'bus-door',width:4,surface:'stone',points:[[-26,50],[-26,46]]},
 {id:'school-route',width:6,surface:'asphalt',points:[[48,30],[48,36],[44,36]]},
 {id:'park-walk',width:4,surface:'stone',points:[[17,-58],[27,-58],[27,-52]]},
 {id:'home-lane',width:4.8,surface:'stone',points:[[-27,-51],[-27,29]]},
 {id:'home-quay',width:3,surface:'stone',points:[[-27,-51],[-27,-58],[-17,-58]]},
 {id:'south-cut',width:3,surface:'stone',points:[[0,-41],[-10,-41],[-18,-43],[-27,-43],[-43,-43]]},
 {id:'market-cut',width:3,surface:'stone',points:[[0,-18.5],[-10,-18.5],[-18,-16],[-27,-16],[-45,-16]]},
 {id:'workshop-cut',width:3,surface:'stone',points:[[0,9.5],[-10,9.5],[-18,7],[-27,7],[-41,7]]},
 {id:'north-cut',width:3,surface:'stone',points:[[0,29],[-27,29],[-40,29]]},
 {id:'shrine-slope',width:5,surface:'stone',points:[[20,50],[20,56],[26,59],[32,61]]},
];
export function nearestOnSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],q=dx*dx+dz*dz;const t=q?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/q)):0;return {x:a[0]+dx*t,z:a[1]+dz*t,t,d:Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)};}
export const LANDINGS=[{id:"shrine-landing",x:32,z:65,w:8,d:8,height:6,surface:"stone"}];
export function routeAt(x,z,r=0){if(Math.abs(x-PARK.x)<=14-r&&Math.abs(z-PARK.z)<=14-r)return PARK;const route=LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2-r&&Math.abs(z-p.z)<=p.d/2-r)||ROUTES.find(route=>route.points.slice(1).some((b,i)=>nearestOnSegment(x,z,route.points[i],b).d<=route.width/2-r));return route?.id==='shotengai'&&z>=BOARDWALK.minZ&&z<=BOARDWALK.maxZ?boardwalkRoute:route;}
export function groundHeight(x,z){const ph=parkHeight(x,z);if(ph!==null)return ph;if(Math.abs(x-27)<=2.1&&z>=-58&&z< -52)return (z+58)/6*parkHeight(27,-52);if(Math.abs(x-OUTER_PIER.x)<=OUTER_PIER.width/2&&Math.abs(z-OUTER_PIER.z)<=OUTER_PIER.length/2)return OUTER_PIER.height;const landing=LANDINGS.find(p=>Math.abs(x-p.x)<=p.w/2&&Math.abs(z-p.z)<=p.d/2);if(landing)return landing.height;const slope=ROUTES.find(r=>r.id==='shrine-slope');let best=null,done=0,total=0;for(let i=1;i<slope.points.length;i++)total+=Math.hypot(slope.points[i][0]-slope.points[i-1][0],slope.points[i][1]-slope.points[i-1][1]);for(let i=1;i<slope.points.length;i++){const a=slope.points[i-1],b=slope.points[i],n=nearestOnSegment(x,z,a,b),len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(!best||n.d<best.d)best={...n,height:(done+n.t*len)/total*6};done+=len;}return best.d<4?best.height:0;}
export const MAP_BOUNDS={minX:-64,maxX:56,minZ:-86,maxZ:70};
