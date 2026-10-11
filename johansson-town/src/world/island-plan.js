import {SHOPPING_LANE,SHOPPING_LANE_ROUTES} from './shopping-lane-plan.js';
import {GARDEN,GARDEN_PATHS,gardenHeight} from './garden-layout.js';
/**
 * Shared fictional island masterplan. Existing harbour addresses stay fixed.
 * Mount Aoba stands in the open uplands south-east of Aoba Radio, clear of the radio
 * station (built on the level), the cane fields, the coastal road and Hoshizaki: every
 * other thing on its slopes (trees, walking, the map) reads the same terrain grid. Its
 * flanks stay under 40° so the whole hill can be walked.
 */
export const ISLAND=Object.freeze({name:'Johansson Island',mountain:{name:'Mount Aoba',x:66,z:198,height:14,radiusX:30,radiusZ:28},pond:{...GARDEN.pond,radius:GARDEN.pond.rx},village:{name:'Hoshizaki Fishing Village',x:132,z:190},lighthouse:{x:-54,z:204},viewpoint:{x:40,z:158}});
/** Separate customer, shopkeeper and lunch queue positions outside the south wall. */
export const HOSHIZAKI_STORE=Object.freeze({
 customer:Object.freeze([126,207.3]),
 clerk:Object.freeze([126,205.65]),
 waiting:Object.freeze([127.25,207.3]),
 clerkFace:Object.freeze([0,1]),
 waitingFace:Object.freeze([-1.25,-1.65]),
});
export const ISLAND_COAST=[[-52,85],[-63,120],[-73,160],[-68,210],[-42,250],[0,280],[55,295],[110,280],[150,240],[162,190],[156,140],[135,98],[100,70],[70,60]];
// The coastal road leaves the existing Kitahama cross lane on solid land. Its old
// southern bend at [60,49] was outside the coastline and could never be walked.
export const COAST_ROAD=[[59,66],[63,68],[72,73],[111,105],[139,150],[142,190],[130,230],[100,264],[55,280],[5,265],[-34,240],[-55,200],[-57,150],[-47,110],[-38,82],[-37,48],[-37,30]];
export const COAST_CONNECTOR=[[-37,30],[-37,-42],[-18,-42],[0,-36],[17,-36],[31,-25],[43,1],[43,40]];
export const MOUNTAIN_TRAIL=[[23.5,94],[23.5,112],[24,134],[28,151],[40,158],[40,167]];
/**
 * From the end of the mountain trail at Aoba Radio, a footpath spirals once and a half round
 * Mount Aoba to the utaki on its summit, so it never climbs steeper than a person walks.
 */
export const AOBA_SUMMIT=Object.freeze({x:66,z:198});
export const SUMMIT_PATH=[[40,167],[48.6,177.3],[54.9,174.1],[61.5,172.7],[68.2,173],[74.4,175],[79.7,178.5],[83.8,183.1],[86.4,188.5],[87.6,194.2],[87.2,199.9],[85.4,205.1],[82.4,209.5],[78.4,212.8],[73.9,214.9],[69.1,215.8],[64.5,215.4],[60.3,213.8],[56.7,211.2],[54.1,208],[52.5,204.3],[52,200.5],[52.5,196.8],[53.8,193.6],[55.9,190.9],[58.5,189.1],[61.3,188],[64.2,187.8],[66.9,188.3],[69.1,189.4],[70.9,191.1],[72,193],[72.5,195],[72.5,196.9],[71.9,198.5],[71,199.8],[69.8,200.7],[68.6,201.1]];
export const ISLAND_ROUTES=[...GARDEN_PATHS,...SHOPPING_LANE_ROUTES,{id:'island-coastal-road',peninsula:true,width:5,segmentWidths:[2.6],surface:'asphalt',points:COAST_ROAD},{id:'island-mountain-trail',peninsula:true,width:2.3,surface:'gravel',points:MOUNTAIN_TRAIL},{id:'aoba-summit-path',peninsula:true,width:1.8,surface:'gravel',points:SUMMIT_PATH}].map(r=>({...r,terrain:true}));
export function nearestSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);}
export function islandRouteAt(x,z){return ISLAND_ROUTES.find(r=>r.points.slice(1).some((b,i)=>nearestSegment(x,z,r.points[i],b)<=(r.segmentWidths?.[i]??r.width)/2))||null;}
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
export const ISLAND_LANDMARKS=[
 {id:'aoba-viewpoint',title:'Aoba Radio Station & Lookout',x:40,z:158,line:'Island radio, a roof lookout and the coastal weather broadcast.'},
 {id:'aoba-utaki',title:'Mount Aoba Utaki',x:69,z:201,line:'The sacred grove on the summit, at the top of the spiral path from Aoba Radio.'},
 {id:'hoshizaki',title:'Hoshizaki Fishing Village',x:132,z:190,line:'Fishing families, a small general store and the far-coast pier.'},
 {id:'west-lighthouse',title:'West Cape Lighthouse',x:-54,z:204,line:'A quiet headland above the coastal road.'},
 {id:'rainflower-lane',title:'Rainflower Shopping Lane',x:SHOPPING_LANE.entry[0],z:SHOPPING_LANE.entry[1],line:'Weathered shop-houses on the walking grid between town, Aoba Garden and Kitahama.'},
 {id:'aoba-garden',title:'Aoba Traditional Garden',x:GARDEN.entry[0],z:GARDEN.entry[1],line:'The neighbourhood pond garden: stone gate, shrine and Umi-no-yu, a short stroll from town.'},
].map(s=>({...s,sub:'ISLAND COAST & NEIGHBOURHOODS',exitPosition:[s.x,islandTerrainHeight(s.x,s.z)??-.4,s.z],entryFacing:0}));
