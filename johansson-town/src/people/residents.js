import {PROFILES} from './profiles.js';
// Yuri shares the compact residential lanes and outdoor schedule.
export const YURI_PROFILE={"name":"Yuri","age":25,"role":"Sakura shopkeeper","height":1.88,"work":[-4,-25.5],"evening":[24,18],"home":[-29.0,25],"house":{"x":-31.6,"z":25,"angle":1.5707963267948966},"homeAddress":"22 Willow Alley","start":540,"close":1200,"retire":1410,"supperStart":null,"supperEnd":null};
export const ACTIVE_RESIDENT_NAMES=Object.freeze(['Aya','Kenji','Mrs Sato','Harbour master','Reiko','Tetsuo','Officer Mori','Bus driver','Nao','Yuri']);
// Five pairs of homes with garden gaps. Preserve identities, dialogue and saves.
const rows=[-39,-25,-5,12,25];
export const RESIDENTS=ACTIVE_RESIDENT_NAMES.map((name,i)=>{
 const source=name==='Yuri'?YURI_PROFILE:PROFILES.find(p=>p.name===name);
 const house={x:i%2?-31.6:-22.4,z:rows[Math.floor(i/2)],angle:i%2?Math.PI/2:-Math.PI/2};
 return {...source,house,home:[i%2?-29:-25,house.z]};
});
// The peninsula scene uses the same active roster, without the bus driver.
export const STREET_CAST_NAMES=Object.freeze(['Yuri','Nao','Mrs Sato','Kenji','Aya','Harbour master','Reiko','Tetsuo','Officer Mori']);
export const STREET_CAST=RESIDENTS.filter(p=>STREET_CAST_NAMES.includes(p.name));
