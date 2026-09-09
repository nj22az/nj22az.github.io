import {PROFILES} from './profiles.js';
// Yuri uses her supplied rig but shares the same outdoor schedule and housing.
export const YURI_PROFILE={"name":"Yuri","age":25,"role":"Sakura shopkeeper","height":1.88,"work":[-4,-25.5],"evening":[24,18],"home":[60.1,59.0],"house":{"x":62.7,"z":59.0,"angle":-1.5707963267948966},"homeAddress":"22 Shiomi Lane","start":540,"close":1200,"retire":1290,"supperStart":null,"supperEnd":null};
export const RESIDENTS=[...PROFILES,YURI_PROFILE];
