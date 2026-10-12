import {KITANO_HAMLET,hamletGate} from '../world/kitano-hamlet-layout.js';
import {airportWorld} from '../world/airport-ground.js';
/**
 * The walking residents who live in Kitano hamlet on Kitano-jima (batch 7b; docs/KITANO-JIMA.md §3), by plot, and the
 * home record their profiles read (residents.js), the way Kitahama's residents have theirs (kitahama-layout.js). They
 * cannot walk there from Minato: in town they are ferry commuters, away "at home on Kitano-jima" between the boats.
 * Thuan is Johansson's wife and lives with him at kitano-1 at the weekend; on weekdays she stays at 1 Kitahama, so
 * her weekday record stays Kitahama's (batch 7b-3 makes the weekend).
 */
// Nobody from the town's walking cast lives here now (the creator, 2026-10-12: "Only Johansson and Thuan live on the hamlet, the
// others live in the port"); Tetsuo's mother, a neighbour (people/neighbours.js), keeps the old Chinen house, kitano-3.
export const KITANO_RESIDENT_HOMES=Object.freeze({});
export const KITANO_RESIDENT_NAMES=Object.freeze(Object.values(KITANO_RESIDENT_HOMES).flat());
export const KITANO_ADDRESS='Kitano hamlet, Kitano-jima';
export function kitanoHomeFor(name){
 for(const [id,names] of Object.entries(KITANO_RESIDENT_HOMES))if(names.includes(name)){
  const p=KITANO_HAMLET.plots.find(q=>q.id===id),{door}=hamletGate(p),[x,z]=airportWorld(door[0],door[1]);
  return {door:[x,z],address:KITANO_ADDRESS,plot:id};
 }
 return null;
}
export const livesOnKitano=profile=>KITANO_RESIDENT_NAMES.includes(typeof profile==='string'?profile:profile?.name);
