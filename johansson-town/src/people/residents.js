import {KITAHAMA_FLATS} from '../world/kitahama-layout.js';
import {householdFor} from './households.js';
import {ISLAND_RESIDENT_NAMES,kitahamaHomeFor} from '../world/kitahama-layout.js';
import {KITANO_RESIDENT_NAMES,kitanoHomeFor} from './kitano-residents.js';
import {HARBOUR_OFFICE} from '../world/business-layout.js';
import {TOWN_DESTINATIONS} from '../world/town-grid.js';
import {restaurantApproach,IZAKAYA_DOOR} from '../world/dining-layout.js';
import {residentialHome} from '../world/residential-layout.js';
import {PROFILES} from './profiles.js';
import {YARD_RESIDENT_NAMES,YARD_HOMES} from '../world/yard-homes-layout.js';
import {KOBAN} from '../world/koban-layout.js';
import {activeHomeForResident,homeForResident} from './island-households.js';
/**
 * On the island two people live where they work: the harbour master in a bed nook in
 * his office, Officer Mori in the tatami room behind the police box.
 */
const WORKPLACE_HOMES={
 'Harbour master':()=>({door:[HARBOUR_OFFICE.door[0],HARBOUR_OFFICE.door[2]],address:'Johansson Harbour Office (the bed behind the screen)'}),
 'Officer Mori':()=>({door:[...KOBAN.door],address:KOBAN.address}),
 Barfly:()=>({door:[-17.65,-9],address:'Private room, Minato Izakaya'}),
};
// Thuan's saved home fields remain for compatibility with archived saves; the
// published shopping-district mode uses the Harbour Line commute instead.
export const THUAN_PROFILE={...residentialHome('Thuan'),"name":"Thuan","age":25,"role":"Sakura shopkeeper","height":1.64,"work":[-4,-25.5],"evening":restaurantApproach('izakaya'),"friend":"Thao","start":540,"close":1200,"retire":1410,"supperStart":null,"supperEnd":null};
export const ACTIVE_RESIDENT_NAMES=Object.freeze(['Nhung','Chin','Mrs Sato','Harbour master','Reiko','Tetsuo','Officer Mori','Bus driver','Thao','Thuan','Barfly','Grandmother Sakurai']);
const NEIGHBOURHOOD={
 Nhung:{friend:'Reiko',gossip:'Reiko put Tama in the evening paper. He has been sitting on the entire edition ever since.',clue:'The books and evening papers share our counter now. Tama still prefers the window chair.'},
 'Mrs Sato':{friend:'Thuan',gossip:'Thuan calls her plant the assistant manager. I am still waiting for it to help with the stock.'},
 'Harbour master':{friend:'Bus driver',gossip:'The bus driver brings stories from the last stop. I check his timetable against the harbour clock.'},
 'Bus driver':{friend:'Harbour master',gossip:'The harbour master keeps the port records in order. I bring him a fresh story with the morning timetable.'},
 Thao:{friend:'Thuan',gossip:'Thuan is my little sister; we share the house in Kitahama. She leaves breakfast ready when I come home from my late shift. Nhung says I am stubborn. I say I am right.'},
 'Officer Mori':{clue:'Main Street leads straight to the harbour. I follow it on the night patrol.'},
 Reiko:{clue:'The evening papers are at Nhung’s counter. My printing bench is at the back.'},
 Chin:{clue:'Star Port is inside our repair shop. Beat my score and I will show you around.'},
};
// Locations stay live when the town layout changes.
const live=(profile,key,get)=>Object.defineProperty(profile,key,{get,enumerable:true,configurable:true});
// Existing identities and saved routines use the supplied street’s shared entrances.
export const RESIDENTS=ACTIVE_RESIDENT_NAMES.map(name=>{
 const source=name==='Thuan'?THUAN_PROFILE:name==='Grandmother Sakurai'?{name,age:74,role:'Sakura owner',height:1.52,home:KITAHAMA_FLATS[1].approachPosition.filter((_,i)=>i!==1),homeAddress:'Flat 2, Kitahama Heights',homeEntry:'flat-2',work:[-5.5,-26.8],start:360,close:1020,retire:1260,canonicalDay:true,hello:'The books must balance to the yen.',gossip:'Thuan keeps the shop; I keep its accounts.',clue:'The main office and kitchenette are upstairs, the till office is downstairs.'}:PROFILES.find(p=>p.name===name);
 const diningPoint=point=>point&&point[0]===24&&point[1]>=18&&point[1]<=25?restaurantApproach('izakaya'):point;
 const shopFloor={Nhung:'books',Reiko:'books',Chin:'workshop',Tetsuo:'workshop'}[name];
 const profile={...source,...NEIGHBOURHOOD[name],work:({'Harbour master':[HARBOUR_OFFICE.door[0],HARBOUR_OFFICE.door[2]],'Bus driver':TOWN_DESTINATIONS.bus,'Officer Mori':[0,28],Thao:IZAKAYA_DOOR})[name]||diningPoint(source.work),evening:({Nhung:[.15,18.7],Chin:[.15,17.6], 'Mrs Sato':TOWN_DESTINATIONS.bus,'Harbour master':[0,-48],Reiko:[-4,4],Tetsuo:[.15,16.5],'Bus driver':TOWN_DESTINATIONS.bus,'Officer Mori':[0,28],Thao:IZAKAYA_DOOR})[name]||diningPoint(source.evening||source.home),...residentialHome(name)};
 // The shop staff stand at their own shop's door, and where that door is depends on
 // the layout, which is not known yet. Read it when somebody asks.
 if(shopFloor)live(profile,'work',()=>TOWN_DESTINATIONS[shopFloor]);
 // The same for home: on the island the shop's staff live in the yard houses behind
 // Front-Row (yard-homes-layout.js); elsewhere, the Main Street flats they always had.
 if(YARD_RESIDENT_NAMES.includes(name)||WORKPLACE_HOMES[name]||kitahamaHomeFor(name)||KITANO_RESIDENT_NAMES.includes(name)){
  const yard=()=>(WORKPLACE_HOMES[name]?.()||kitahamaHomeFor(name)||kitanoHomeFor(name)||YARD_HOMES[householdFor(name)?.id]),street={home:profile.home,homeAddress:profile.homeAddress};
  live(profile,'home',()=>{const h=yard();return h?[...h.door]:street.home;});
  live(profile,'homeAddress',()=>yard()?.address||street.homeAddress);
 }
 if(name==='Barfly')profile.homeEntry='izakaya-private';
 return profile;
});
export function residentHomeDescription(name){
 const h=activeHomeForResident(name),primary=homeForResident(name);if(!h)return '';
 if(name==='Tetsuo')return 'I live at '+h.address+', behind the shop. My mother lives at 5 Kitahama; I walk over from the workshop to see her.';
 if(name==='Thuan')return 'On weekdays I stay at '+h.address+' with Thao, Chin and Vy, near the shop. My home is '+primary.address+', with my husband Johansson.';
 if(name==='Chin')return 'My place is at '+h.address+', bro, with my wife Thao and our daughter Vy. Thuan has the other room on weekdays.';
 if(name==='Barfly')return 'Minato is home. I sleep here after closing and help Thao clean and set up in the morning.';
 const roommates=h.members.filter(m=>m.name!==name&&!m.secondary).map(m=>m.name),guests=h.members.filter(m=>m.secondary&&m.name!==name).map(m=>m.name);
 return 'I live at '+h.address+'.'+(roommates.length?' I share my home with '+roommates.join(' and ')+'.':'')+(guests.length?' '+guests.join(' and ')+' stays here on weekdays.':'');
}
/** Residents with an authored playable home. The retired driver flat is kept in
 * profile/save history, but has no door in the unified town. */
export const HOME_OWNERS=RESIDENTS.filter(p=>p.homeEntry&&p.name!=='Bus driver');
// Reintroduce residents deliberately, one at a time. Thao was the first neighbour back;
// the Front-Row staff followed with their own homes in the yard behind the shop, then
// the harbour master and Officer Mori, who live at the office and the police box, and
// Mrs Sato, who comes in on the morning bus to cook the lunch ramen.
export const STREET_CAST_NAMES=Object.freeze(['Thuan','Thao','Nhung','Reiko','Chin','Tetsuo','Harbour master','Officer Mori','Mrs Sato','Grandmother Sakurai']);
export const STREET_CAST=RESIDENTS.filter(p=>STREET_CAST_NAMES.includes(p.name));
/** Everybody the town builds: the street cast, and Minato's regular, who lives in the izakaya and has no street of his own. */
export const WORLD_CAST=[...STREET_CAST,...RESIDENTS.filter(p=>p.name==='Barfly')];
