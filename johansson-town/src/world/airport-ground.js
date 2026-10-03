import {AIRPORT_ISLAND} from './airport-island.js';
import {AIRPORT_DISTRICT,airportConstructionAt} from './airport-district-plan.js';
import {SEA_LEVEL} from './ocean.js';
export function airportWorld(x,z){const a=AIRPORT_ISLAND,c=Math.cos(a.yaw),s=Math.sin(a.yaw);return [a.x+c*x+s*z,a.z-s*x+c*z];}
export function airportLocal(x,z){const a=AIRPORT_ISLAND,dx=x-a.x,dz=z-a.z,c=Math.cos(a.yaw),s=Math.sin(a.yaw);return [c*dx-s*dz,s*dx+c*dz];}
export const AIRPORT_HEIGHT=SEA_LEVEL+1.1;
export const AIRPORT_LANDING=Object.freeze(airportWorld(-44,31));
export const AIRPORT_COUNTER=Object.freeze(airportWorld(-10,18.7));
/** Passenger side only: runway, apron, sewage works and hangar are fenced off. */
export function airportSurface(x,z,r=0){const [u,v]=airportLocal(x,z);if(airportConstructionAt(u,v,r))return null;if(u>=-46+r&&u<=-42-r&&v>=19&&v<=36-r)return {id:'airport-jetty',surface:'stone',y:SEA_LEVEL+1.15};const d=AIRPORT_DISTRICT;if(u>=d.minX+r&&u<=d.maxX-r&&v>=19.3+r&&v<=d.maxZ-r)return {id:'airport-district',surface:'stone',y:AIRPORT_HEIGHT};if(u>=-50+r&&u<=38-r&&v>=17+r&&v<=19.7-r)return {id:'airport-passenger-walk',surface:'stone',y:AIRPORT_HEIGHT};if(u>=-19+r&&u<=-1-r&&v>=16.5+r&&v<=19.7-r)return {id:'airport-terminal',surface:'stone',y:AIRPORT_HEIGHT};return null;}
