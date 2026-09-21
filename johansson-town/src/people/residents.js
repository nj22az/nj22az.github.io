import {householdFor} from './households.js';
import {HARBOUR_OFFICE} from '../world/business-layout.js';
import {TOWN_DESTINATIONS} from '../world/town-grid.js';
import {DINING,restaurantApproach,IZAKAYA_DOOR} from '../world/dining-layout.js';
import {residentialHome} from '../world/residential-layout.js';
import {PROFILES} from './profiles.js';
// Thuan's saved home fields remain for compatibility with archived saves; the
// published shopping-district mode uses the Harbour Line commute instead.
export const THUAN_PROFILE={...residentialHome('Thuan'),"name":"Thuan","age":25,"role":"Sakura shopkeeper","height":1.64,"work":[-4,-25.5],"evening":restaurantApproach('izakaya'),"friend":"Nao","start":540,"close":1200,"retire":1410,"supperStart":null,"supperEnd":null};
export const ACTIVE_RESIDENT_NAMES=Object.freeze(['Aya','Kenji','Mrs Sato','Harbour master','Reiko','Tetsuo','Officer Mori','Bus driver','Nao','Thuan']);
const NEIGHBOURHOOD={
 Aya:{friend:'Reiko',gossip:'Reiko put Tama in the evening paper. He has been sitting on the entire edition ever since.',clue:'The books and evening papers share our counter now. Tama still prefers the window chair.'},
 'Mrs Sato':{friend:'Thuan',gossip:'Thuan calls her plant the assistant manager. I am still waiting for it to help with the stock.'},
 'Harbour master':{friend:'Bus driver',gossip:'The bus driver brings stories from the last stop. I check his timetable against the harbour clock.'},
 'Bus driver':{friend:'Harbour master',gossip:'The harbour master keeps the port records in order. I bring him a fresh story with the morning timetable.'},
 Nao:{friend:'Thuan',gossip:'Thuan and I arrive on the Harbour Line. She leaves breakfast ready when I return from my late shift.'},
 'Officer Mori':{clue:'Main Street leads straight to the harbour. I follow it on the night patrol.'},
 Reiko:{clue:'The evening papers are at Aya’s counter. My printing bench is at the back.'},
 Kenji:{clue:'Star Port is inside our repair shop. Beat my score and I will show you around.'},
};
// Existing identities and saved routines use the supplied street’s shared entrances.
export const RESIDENTS=ACTIVE_RESIDENT_NAMES.map(name=>{
 const source=name==='Thuan'?THUAN_PROFILE:PROFILES.find(p=>p.name===name);
 const diningPoint=point=>point&&point[0]===24&&point[1]>=18&&point[1]<=25?restaurantApproach('izakaya'):point;
 const shopFloor={Aya:'books',Reiko:'books',Kenji:'workshop',Tetsuo:'workshop'}[name];
 const profile={...source,...NEIGHBOURHOOD[name],work:({'Harbour master':[HARBOUR_OFFICE.door[0],HARBOUR_OFFICE.door[2]],'Bus driver':TOWN_DESTINATIONS.bus,'Officer Mori':[0,28],Nao:IZAKAYA_DOOR})[name]||diningPoint(source.work),evening:({Aya:[.15,18.7],Kenji:[.15,17.6], 'Mrs Sato':TOWN_DESTINATIONS.bus,'Harbour master':[0,-48],Reiko:[-4,4],Tetsuo:[.15,16.5],'Bus driver':TOWN_DESTINATIONS.bus,'Officer Mori':[0,28],Nao:IZAKAYA_DOOR})[name]||diningPoint(source.evening),...residentialHome(name)};
 // The shop staff stand at their own shop's door, and where that door is depends on
 // the layout, which is not known yet. Read it when somebody asks.
 if(shopFloor)Object.defineProperty(profile,'work',{get:()=>TOWN_DESTINATIONS[shopFloor],enumerable:true,configurable:true});
 return profile;
});
export function residentHomeDescription(name){
 const profile=RESIDENTS.find(p=>p.name===name);
 if(!profile)return '';
 const neighbour=RESIDENTS.find(p=>p.name!==name&&p.homeEntry===profile.homeEntry);
 const address=name==='Kenji'?'My place is at '+profile.homeAddress+', bro.':'I live at '+profile.homeAddress+'.';
 const roommates=householdFor(name).residents.filter(n=>n!==name);
 return address+(roommates.length?' I share the flat with '+roommates.join(' and ')+'.':neighbour?' '+neighbour.name+' has the other flat through our shared entrance.':'');
}
// Movement-isolation phase: publish Thuan alone until her locomotion is visually
// correct in every part of the town. The resident profiles remain intact above so
// neighbours can be reintroduced one at a time without reconstructing their lives.
// `?cast-preview=nao` is a non-published review surface for checking Nao before
// her staged reintroduction. The normal game, saved games and tests still get Thuan alone.
const CAST_PREVIEW=typeof location!=='undefined'&&new URLSearchParams(location.search).get('cast-preview');
export const STREET_CAST_NAMES=Object.freeze(CAST_PREVIEW==='nao'?['Thuan','Nao']:['Thuan']);
export const STREET_CAST=RESIDENTS.filter(p=>STREET_CAST_NAMES.includes(p.name));
