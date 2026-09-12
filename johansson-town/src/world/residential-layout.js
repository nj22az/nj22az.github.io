import {RESIDENTIAL_BRIDGE} from './residential-surface.js';
// The supplied street stays together: seven buildings, one lane and its canal bridge.
export const RESIDENTIAL=Object.freeze({x:-21,z:3.75,yaw:Math.PI/2,minX:-32.02,maxX:-10.56,minZ:-3.71,maxZ:11.82,laneZ:4});
export const residentialPoint=(x,z)=>[RESIDENTIAL.x+z,RESIDENTIAL.z-x];
export const residentialLocal=(x,z)=>[RESIDENTIAL.z-z,x-RESIDENTIAL.x];
// Bounds of the supplied water surface, below the town base.
export const RESIDENTIAL_CANAL=Object.freeze({minX:-25.83,maxX:-20.75,minZ:-2.45,maxZ:10.65});
const building=(id,minX,maxX,minZ,maxZ,height)=>{const [x,z]=residentialPoint((minX+maxX)/2,(minZ+maxZ)/2);return Object.freeze({id,x,z,w:maxZ-minZ,d:maxX-minX,height});};
export const RESIDENTIAL_BUILDINGS=Object.freeze([
 building('DomekRdy_1',1.6,7,4.85,9.35,7.6),
 building('DomekRdy_2',1.85,6.4,.9,4.7,8.3),
 building('DomekRdy_Ksiegarnia',-7.2,-1.75,-10.7,-4.7,7.7),
 building('DomekRdy_Kwiaciarnia',-7.2,-2.25,-.75,3.65,6.4),
 building('DomekRdy_4',1.8,5.2,-6.25,-3.22,7.8),
 building('DomekRdy_5',1.45,4.65,-10.7,-6.55,5.8),
 building('DomekRdy_3',-7,-1.85,3.8,10.15,9.7),
]);
const entry=(buildingId,x,z,frontX)=>Object.freeze({buildingId,door:Object.freeze(residentialPoint(x,z)),facade:Object.freeze(residentialPoint(frontX,z)),plate:Object.freeze(residentialPoint(frontX,z+.62)),angle:(frontX<0?Math.PI/2:-Math.PI/2)+RESIDENTIAL.yaw});
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
// Six street doors; letters identify the separate flats behind a shared entrance.
const HOME_NUMBERS=Object.freeze({Nao:'1A',Yuri:'1B',Aya:'2A',Reiko:'2B','Mrs Sato':'3A',Tetsuo:'3B',Kenji:'4A','Officer Mori':'4B','Harbour master':'5','Bus driver':'6'});
export function residentialHome(name){
 const key=RESIDENTIAL_ASSIGNMENTS[name],entrance=RESIDENTIAL_ENTRIES[key],building=RESIDENTIAL_BUILDINGS.find(b=>b.id===entrance.buildingId);
 return {home:[...entrance.door],house:{...building,angle:entrance.angle},homeEntry:key,homeAddress:HOME_NUMBERS[name]+' Willow Alley'};
}
export function inResidential(x,z){return x>=RESIDENTIAL.minX&&x<=RESIDENTIAL.maxX&&z>=RESIDENTIAL.minZ&&z<=RESIDENTIAL.maxZ;}
export function residentialContains(x,z,r=0){
 const [lx,lz]=residentialLocal(x,z);
 // Keep pedestrians on the bridge deck where the canal crosses the lane.
 const half=lz>-4.85-r&&lz<1+r?1.1:1.7;
 return Math.abs(lx+.25)<=half-r;
}
export function residentialHeight(x,z){
 if(!inResidential(x,z))return null;
 const [lx,localZ]=residentialLocal(x,z),t=(localZ-RESIDENTIAL_BRIDGE.minZ)/RESIDENTIAL_BRIDGE.step,i=Math.floor(t),h=RESIDENTIAL_BRIDGE.heights;
 if(Math.abs(lx+.25)<=1.45&&i>=0&&i<h.length-1)return h[i]+(h[i+1]-h[i])*(t-i);
 return .02;
}
