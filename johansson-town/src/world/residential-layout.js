import {HOUSEHOLDS,householdFor} from '../people/households.js';
// The supplied frontage faces Main Street; all thresholds share the flat pavement.
export const RESIDENTIAL=Object.freeze({x:-19,z:5.574,yaw:0,minX:-29,maxX:-7,minZ:-19.352,maxZ:30.5,laneZ:31});
export const RESIDENTIAL_BUILDINGS=Object.freeze([{id:'main-street-row',x:-21.1,z:5.574,w:15.8,d:49.852,height:18.42}]);
const entry=(sourceZ,sourceX)=>{
 const z=6.1592-sourceZ*.022,x=-14.16-sourceX*.022;
 return Object.freeze({buildingId:'main-street-row',door:Object.freeze([x+.65,z]),facade:Object.freeze([x,z]),plate:Object.freeze([x+.04,z+.38]),angle:Math.PI/2});
};
// Measured ground-floor door panels in Street 2.
export const RESIDENTIAL_ENTRIES=Object.freeze({one:entry(-794,-58.36),two:entry(-356,-54.62),three:entry(-100,-55.01),four:entry(811,-55.68),five:entry(968,-50.33)});
export const RESIDENTIAL_ASSIGNMENTS=Object.freeze(Object.fromEntries(HOUSEHOLDS.flatMap(h=>h.residents.map(name=>[name,h.entry]))));
export function residentialHome(name){
 // Someone who lives where they drink (Minato's barfly) has no flat on the street.
 const household=householdFor(name),entrance=household&&RESIDENTIAL_ENTRIES[household.entry];
 if(!entrance)return {};
 return {home:[...entrance.door],house:{...RESIDENTIAL_BUILDINGS[0],angle:entrance.angle},homeEntry:household.entry,homeAddress:household.address,household:household.id};
}
export function inResidential(x,z){return x>=RESIDENTIAL.minX&&x<=RESIDENTIAL.maxX&&z>=RESIDENTIAL.minZ&&z<=RESIDENTIAL.maxZ;}
export function residentialContains(x,z,r=0){return x>=-13.35+r&&x<=-7&&z>=-20+r&&z<=31-r;}
export function residentialHeight(x,z){return inResidential(x,z)?.02:null;}
