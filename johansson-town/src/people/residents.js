import {HARBOUR_OFFICE} from '../world/business-layout.js';
import {TOWN_DESTINATIONS} from '../world/town-grid.js';
import {DINING} from '../world/dining-layout.js';
import {residentialHome} from '../world/residential-layout.js';
import {PROFILES} from './profiles.js';
// Yuri shares the compact residential lanes and outdoor schedule.
export const YURI_PROFILE={...residentialHome('Yuri'),"name":"Yuri","age":25,"role":"Sakura shopkeeper","height":1.64,"work":[-4,-25.5],"evening":[DINING.izakayaX,DINING.izakayaDoor[1]-.6],"friend":"Nao","start":540,"close":1200,"retire":1410,"supperStart":null,"supperEnd":null};
export const ACTIVE_RESIDENT_NAMES=Object.freeze(['Aya','Kenji','Mrs Sato','Harbour master','Reiko','Tetsuo','Officer Mori','Bus driver','Nao','Yuri']);
const NEIGHBOURHOOD={
 Aya:{friend:'Reiko',gossip:'Reiko put Tama in the evening paper. He has been sitting on the entire edition ever since.',clue:'The books and evening papers share our counter now. Tama still prefers the window chair.'},
 'Mrs Sato':{friend:'Yuri',gossip:'Yuri calls her plant the assistant manager. I am still waiting for it to help with the stock.'},
 'Harbour master':{friend:'Bus driver',gossip:'The bus driver brings stories from the last stop. I check his timetable against the harbour clock.'},
 'Bus driver':{friend:'Harbour master',gossip:'The harbour master keeps the port records in order. I bring him a fresh story with the morning timetable.'},
 Nao:{friend:'Yuri',gossip:'Yuri has the other flat through our entrance. We compare our days over supper before my late shift ends.'},
 'Officer Mori':{clue:'Main Street leads straight to the harbour. I follow it on the night patrol.'},
 Reiko:{clue:'The evening papers are at Aya’s counter. My printing bench is at the back.'},
 Kenji:{clue:'Star Port is inside our repair shop. Beat my score and I will show you around.'},
};
// Existing identities and saved routines use the supplied street’s shared entrances.
export const RESIDENTS=ACTIVE_RESIDENT_NAMES.map(name=>{
 const source=name==='Yuri'?YURI_PROFILE:PROFILES.find(p=>p.name===name);
 const diningPoint=point=>point&&point[0]===24&&point[1]>=18&&point[1]<=25?[DINING.izakayaX,DINING.izakayaDoor[1]-.6]:point;
 return {...source,...NEIGHBOURHOOD[name],work:({Aya:TOWN_DESTINATIONS.books,Kenji:TOWN_DESTINATIONS.workshop,Reiko:TOWN_DESTINATIONS.books,Tetsuo:TOWN_DESTINATIONS.workshop,'Harbour master':[HARBOUR_OFFICE.door[0],HARBOUR_OFFICE.door[2]],'Bus driver':TOWN_DESTINATIONS.bus,'Officer Mori':[0,28],Nao:DINING.izakayaDoor})[name]||diningPoint(source.work),evening:({Aya:[9.5,8.65],Kenji:[7,8.65], 'Mrs Sato':TOWN_DESTINATIONS.bus,'Harbour master':[0,-48],Reiko:[-4,4],Tetsuo:[11,8.65],'Bus driver':TOWN_DESTINATIONS.bus,'Officer Mori':[0,28],Nao:DINING.izakayaDoor})[name]||diningPoint(source.evening),...residentialHome(name)};
});
export function residentHomeDescription(name){
 const profile=RESIDENTS.find(p=>p.name===name);
 if(!profile)return '';
 const neighbour=RESIDENTS.find(p=>p.name!==name&&p.homeEntry===profile.homeEntry);
 const address=name==='Kenji'?'My place is at '+profile.homeAddress+', bro.':'I live at '+profile.homeAddress+'.';
 return address+(neighbour?' '+neighbour.name+' has the other flat through our shared entrance.':'');
}
// The peninsula scene uses the same active roster, without the bus driver.
export const STREET_CAST_NAMES=Object.freeze(['Yuri','Nao','Mrs Sato','Kenji','Aya','Harbour master','Reiko','Tetsuo','Officer Mori']);
export const STREET_CAST=RESIDENTS.filter(p=>STREET_CAST_NAMES.includes(p.name));
