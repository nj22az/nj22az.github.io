import {PROFILES} from './profiles.js';
// Yuri shares the compact residential lanes and outdoor schedule.
export const YURI_PROFILE={"name":"Yuri","age":25,"role":"Sakura shopkeeper","height":1.88,"work":[-4,-25.5],"evening":[24,18],"home":[-29.0,25],"house":{"x":-31.6,"z":25,"angle":1.5707963267948966},"homeAddress":"22 Willow Alley","start":540,"close":1200,"retire":1410,"supperStart":null,"supperEnd":null};
export const RESIDENTS=[...PROFILES,YURI_PROFILE];
// Smaller street cast for the unique peninsula city. Everyone else still exists
// in RESIDENTS for the fallback harbour town and dialogue, but does not crowd doors.
export const STREET_CAST_NAMES=Object.freeze(['Yuri','Nao','Mrs Sato','Kenji','Aiko','Harbour master','Reiko','Tetsuo','Officer Mori']);
export const STREET_CAST=RESIDENTS.filter(p=>STREET_CAST_NAMES.includes(p.name));
