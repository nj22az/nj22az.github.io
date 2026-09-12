import {RESIDENTIAL_BRIDGE} from './residential-surface.js';
// The supplied street stays together: seven buildings, one lane and its canal bridge.
export const RESIDENTIAL=Object.freeze({x:-25.5,z:-8,minX:-33.57,maxX:-18.04,minZ:-19.02,maxZ:2.44,laneX:-25.75});
// Bounds of the supplied water surface, below the town base.
export const RESIDENTIAL_CANAL=Object.freeze({minX:-32.4,maxX:-19.3,minZ:-12.83,maxZ:-7.75});
const building=(id,minX,maxX,minZ,maxZ,height)=>Object.freeze({id,x:RESIDENTIAL.x+(minX+maxX)/2,z:RESIDENTIAL.z+(minZ+maxZ)/2,w:maxX-minX,d:maxZ-minZ,height});
export const RESIDENTIAL_BUILDINGS=Object.freeze([
 building('DomekRdy_1',1.6,7,4.85,9.35,7.6),
 building('DomekRdy_2',1.85,6.4,.9,4.7,8.3),
 building('DomekRdy_Ksiegarnia',-7.2,-1.75,-10.7,-4.7,7.7),
 building('DomekRdy_Kwiaciarnia',-7.2,-2.25,-.75,3.65,6.4),
 building('DomekRdy_4',1.8,5.2,-6.25,-3.22,7.8),
 building('DomekRdy_5',1.45,4.65,-10.7,-6.55,5.8),
 building('DomekRdy_3',-7,-1.85,3.8,10.15,9.7),
]);
const entry=(buildingId,x,z,frontX)=>Object.freeze({buildingId,door:Object.freeze([RESIDENTIAL.x+x,RESIDENTIAL.z+z]),facade:Object.freeze([RESIDENTIAL.x+frontX,RESIDENTIAL.z+z]),angle:frontX<0?Math.PI/2:-Math.PI/2});
// The blue workshop shares the adjoining peach building's entrance. Apartments
// above the bookshop and florist retain their residents and individual nameplates.
export const RESIDENTIAL_ENTRIES=Object.freeze({
 north:entry('DomekRdy_1',.65,8.1,2.17),
 florist:entry('DomekRdy_Kwiaciarnia',-1.2,2,-3.35),
 books:entry('DomekRdy_Ksiegarnia',-1.05,-8.35,-2.02),
 peach:entry('DomekRdy_4',.85,-5.65,2.18),
 garage:entry('DomekRdy_5',.65,-8.65,1.50),
 plum:entry('DomekRdy_3',-1.15,5.4,-2.70),
});
export const RESIDENTIAL_ASSIGNMENTS=Object.freeze({Aya:'plum',Kenji:'peach','Mrs Sato':'florist','Harbour master':'garage',Reiko:'plum',Tetsuo:'florist','Officer Mori':'peach','Bus driver':'books',Nao:'north',Yuri:'north'});
export function residentialHome(name){
 const key=RESIDENTIAL_ASSIGNMENTS[name],entrance=RESIDENTIAL_ENTRIES[key],building=RESIDENTIAL_BUILDINGS.find(b=>b.id===entrance.buildingId);
 return {home:[...entrance.door],house:{...building,angle:entrance.angle},homeEntry:key};
}
export function inResidential(x,z){return x>=RESIDENTIAL.minX&&x<=RESIDENTIAL.maxX&&z>=RESIDENTIAL.minZ&&z<=RESIDENTIAL.maxZ;}
export function residentialContains(x,z,r=0){
 const lx=x-RESIDENTIAL.x,lz=z-RESIDENTIAL.z;
 // Keep pedestrians on the bridge deck where the canal crosses the lane.
 const half=lz>-4.85-r&&lz<1+r?1.1:1.7;
 return Math.abs(lx+.25)<=half-r;
}
export function residentialHeight(x,z){
 if(!inResidential(x,z))return null;
 const localZ=z-RESIDENTIAL.z,t=(localZ-RESIDENTIAL_BRIDGE.minZ)/RESIDENTIAL_BRIDGE.step,i=Math.floor(t),h=RESIDENTIAL_BRIDGE.heights;
 if(Math.abs(x-RESIDENTIAL.laneX)<=1.45&&i>=0&&i<h.length-1)return h[i]+(h[i+1]-h[i])*(t-i);
 return .02;
}
