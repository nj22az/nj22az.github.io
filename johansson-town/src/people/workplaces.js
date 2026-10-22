import {businessId} from '../world/businesses.js';
// Nhung's is the clinic since she became the island doctor (22 October 2026); the room draws her at her desk itself
// (town-hall.js buildClinic), so her walking body stays indoors there and is never borrowed into it (OWN_STAFF_ROOMS).
export const WORK_SITES=Object.freeze({Nhung:'clinic',Chin:'form3d',Tetsuo:'form3d','Harbour master':'office'});
export const OWN_STAFF_ROOMS=Object.freeze(['clinic']);
/** Workplaces only the island builds: Sato Ramen for Mrs Sato, the police box for Officer Mori. */
const ISLAND_WORK_SITES=Object.freeze({'Mrs Sato':'ramen','Officer Mori':'koban'});
export function assignWorkplaces(world,sites){
 for(const person of world.people){const id=businessId(ISLAND_WORK_SITES[person.profile.name]||WORK_SITES[person.profile.name]),site=[...sites,...(world.landmarks||[])].find(s=>s.id===id);if(!site?.door)continue;
  person.profile={...person.profile,work:[site.door[0],site.door[2]],workSite:id};
 }
}
