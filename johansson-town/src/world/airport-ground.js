import {AIRPORT_ISLAND,AIRPORT_JETTY} from './airport-island.js';
import {AIRPORT_DISTRICT,AIRPORT_TERMINALS,airportConstructionAt} from './airport-district-plan.js';
import {SEA_LEVEL} from './ocean.js';
import {GROUND_LAYER} from './ground-layers.js';
export function airportWorld(x,z){const a=AIRPORT_ISLAND,c=Math.cos(a.yaw),s=Math.sin(a.yaw);return [a.x+c*x+s*z,a.z-s*x+c*z];}
export function airportLocal(x,z){const a=AIRPORT_ISLAND,dx=x-a.x,dz=z-a.z,c=Math.cos(a.yaw),s=Math.sin(a.yaw);return [c*dx-s*dz,s*dx+c*dz];}
export const AIRPORT_HEIGHT=SEA_LEVEL+1.1;
export const AIRPORT_PAVEMENT_HEIGHT=AIRPORT_HEIGHT+GROUND_LAYER.grass;
/** The drawn cargo slab overlaps the shoreward pier and is the highest floor there. */
export const AIRPORT_CARGO_SURFACE=Object.freeze({minX:-52,maxX:-11,minZ:21,maxZ:35,y:AIRPORT_HEIGHT+.12});
export const AIRPORT_PIER_HEIGHT=SEA_LEVEL+AIRPORT_JETTY.top;
// Match the raised slabs in airport-district.js, highest first at their overlaps.
export const AIRPORT_PUBLIC_FLOORS=Object.freeze([
 ...AIRPORT_TERMINALS.filter(t=>!t.construction).map(t=>({id:'airport-terminal-'+t.id,minX:t.x-30,maxX:t.x+30,minZ:t.z-11,maxZ:t.z+11,y:AIRPORT_HEIGHT+.06+GROUND_LAYER.grass*2})),
 {id:'airport-arrival-plaza',minX:-52,maxX:-14,minZ:21,maxZ:39,y:AIRPORT_HEIGHT+.06+GROUND_LAYER.grass},
 {id:'airport-promenade',minX:-48,maxX:170,minZ:59,maxZ:69,y:AIRPORT_HEIGHT+.06+GROUND_LAYER.grass},
 {id:'airport-transfer-boulevard',minX:-4,maxX:4,minZ:28,maxZ:128,y:AIRPORT_HEIGHT+.06},
].map(Object.freeze));
export const AIRPORT_LANDING=Object.freeze(airportWorld(...AIRPORT_JETTY.landing));
export const AIRPORT_LANDING_HEIGHT=airportSurface(...AIRPORT_LANDING)?.y??AIRPORT_PIER_HEIGHT;
export const AIRPORT_COUNTER=Object.freeze(airportWorld(-10,18.7));
/** Passenger side only: runway, apron, sewage works and hangar are fenced off. */
export function airportSurface(x,z,r=0){
 const [u,v]=airportLocal(x,z);if(airportConstructionAt(u,v,r))return null;
 const within=s=>u>=s.minX+r&&u<=s.maxX-r&&v>=s.minZ+r&&v<=s.maxZ-r;
 const cargo=AIRPORT_CARGO_SURFACE;if(within(cargo))return {id:'airport-cargo-court',surface:'asphalt',y:cargo.y};
 const floor=AIRPORT_PUBLIC_FLOORS.find(within);if(floor)return {id:floor.id,surface:'stone',y:floor.y};
 if(within(AIRPORT_JETTY))return {id:'airport-jetty',surface:'stone',y:AIRPORT_PIER_HEIGHT};
 if(within({minX:-44,maxX:44,minZ:19.4,maxZ:20.8}))return {id:'airport-terminal-approach',surface:'stone',y:SEA_LEVEL+1.14};
 if(within(AIRPORT_DISTRICT))return {id:'airport-district',surface:'stone',y:AIRPORT_HEIGHT};
 if(within({minX:-44,maxX:44,minZ:17,maxZ:19.7}))return {id:'airport-passenger-walk',surface:'stone',y:AIRPORT_PAVEMENT_HEIGHT};
 if(within({minX:-19,maxX:-1,minZ:16.5,maxZ:19.7}))return {id:'airport-terminal',surface:'stone',y:AIRPORT_PAVEMENT_HEIGHT};
 return null;
}
