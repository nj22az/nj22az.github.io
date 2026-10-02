import {SHOPPING_LANE,SHOPPING_LANE_ROUTE} from './shopping-lane-plan.js';
import {GARDEN,GARDEN_PATHS,inGarden,gardenHeight} from './garden-layout.js';
/** Shared fictional island masterplan. Existing harbour addresses stay fixed. */
export const ISLAND=Object.freeze({name:'Johansson Island',mountain:{name:'Mount Aoba',x:40,z:175,height:42,radiusX:76,radiusZ:76},pond:{x:-34,z:132,radius:6},village:{name:'Hoshizaki Fishing Village',x:132,z:190},lighthouse:{x:-54,z:204},viewpoint:{x:24,z:145}});
export const ISLAND_COAST=[[-52,85],[-63,120],[-73,160],[-68,210],[-42,250],[0,280],[55,295],[110,280],[150,240],[162,190],[156,140],[135,98],[100,70],[70,60]];
export const COAST_ROAD=[[43,40],[60,49],[72,73],[111,105],[139,150],[142,190],[130,230],[100,264],[55,280],[5,265],[-34,240],[-55,200],[-57,150],[-47,110],[-38,82],[-37,48],[-37,30]];
export const COAST_CONNECTOR=[[-37,30],[-37,-42],[-18,-42],[0,-36],[17,-36],[31,-25],[43,1],[43,40]];
export const MOUNTAIN_TRAIL=[[-47,110],[-27,117],[-8,127],[24,145],[7,159],[32,171],[19,187],[40,175]];
export const ISLAND_ROUTES=[...GARDEN_PATHS,SHOPPING_LANE_ROUTE,{id:'island-coastal-road',peninsula:true,width:5,surface:'asphalt',points:COAST_ROAD},{id:'island-mountain-trail',peninsula:true,width:2.3,surface:'gravel',points:MOUNTAIN_TRAIL}].map(r=>({...r,terrain:true}));
export function nearestSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
export function islandRouteAt(x,z){return ISLAND_ROUTES.find(r=>r.points.slice(1).some((b,i)=>nearestSegment(x,z,r.points[i],b)<=r.width/2))||null;}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export const TERRAIN_GRID=Object.freeze({minX:-53,maxX:118,minZ:97,maxZ:268,step:3});
function authoredHeight(x,z){const m=ISLAND.mountain,r=Math.hypot((x-m.x)/m.radiusX,(z-m.z)/m.radiusZ);let h=-.4+m.height*(1-smooth(r));
 const lane=SHOPPING_LANE,ldx=Math.max(lane.minX-x,0,x-lane.maxX),ldz=Math.max(lane.minZ-z,0,z-lane.maxZ);h*=smooth(Math.hypot(ldx,ldz)/5);
 const dx=Math.max(GARDEN.minX-3-x,0,x-GARDEN.maxX-3),dz=Math.max(GARDEN.minZ-3-z,0,z-GARDEN.maxZ-3),blend=1-smooth(Math.hypot(dx,dz)/8);h=h*(1-blend)+(gardenHeight(x,z)??0)*blend;
 return h;
}
const G=TERRAIN_GRID,nx=Math.round((G.maxX-G.minX)/G.step)+1,nz=Math.round((G.maxZ-G.minZ)/G.step)+1;
export const MOUNTAIN_VERTICES=Array.from({length:nx*nz},(_,i)=>authoredHeight(G.minX+i%nx*G.step,G.minZ+Math.floor(i/nx)*G.step));
/** Match the rendered triangles exactly, including pond basin and trail grounding. */
export function islandTerrainHeight(x,z){if(x<G.minX||x>G.maxX||z<G.minZ||z>G.maxZ)return null;const fx=(x-G.minX)/G.step,fz=(z-G.minZ)/G.step,ix=Math.min(nx-2,Math.floor(fx)),iz=Math.min(nz-2,Math.floor(fz)),u=fx-ix,v=fz-iz,a=MOUNTAIN_VERTICES[iz*nx+ix],b=MOUNTAIN_VERTICES[iz*nx+ix+1],c=MOUNTAIN_VERTICES[(iz+1)*nx+ix],d=MOUNTAIN_VERTICES[(iz+1)*nx+ix+1];return u+v<=1?a+(b-a)*u+(c-a)*v:d+(c-d)*(1-u)+(b-d)*(1-v);}
export function islandPondAt(x,z,r=0){return Math.hypot(x-ISLAND.pond.x,z-ISLAND.pond.z)<ISLAND.pond.radius+r;}
export const ISLAND_LANDMARKS=[
 {id:'aoba-viewpoint',title:'Mount Aoba Viewpoint',x:24,z:145,line:'The harbour, coastal villages and airport strait below the green mountain.'},
 {id:'hoshizaki',title:'Hoshizaki Fishing Village',x:132,z:190,line:'Fishing families, a small general store and the far-coast pier.'},
 {id:'west-lighthouse',title:'West Cape Lighthouse',x:-54,z:204,line:'A quiet headland above the coastal road.'},
 {id:'rainflower-lane',title:'Rainflower Shopping Lane',x:90,z:96,line:'Weathered shop-houses, flowers, cold drinks and overhead wires.'},
 {id:'aoba-garden',title:'Aoba Traditional Garden',x:-28,z:108,line:'A walkable pond garden, stone gate, shrine and Umi-no-yu at the foothills.'},
].map(s=>({...s,sub:'ISLAND COAST & MOUNTAIN',exitPosition:[s.x,islandTerrainHeight(s.x,s.z)??-.4,s.z],entryFacing:0}));
