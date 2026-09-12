import {DINING} from '../world/dining-layout.js';
import {FULL_TOWN} from '../world/full-town-state.js';
import {PROFILES} from './profiles.js';
import {ACTIVE_RESIDENT_NAMES,RESIDENTS} from './residents.js';
export const IZAKAYA_DOOR=[...DINING.izakayaDoor];
export const RAMEN_DOOR=[...DINING.ramenDoor];
export const YURI_HOME_DOOR=[...RESIDENTS.find(p=>p.name==='Yuri').home];
export const minuteOfDay=m=>((m%1440)+1440)%1440;
export const inTimeRange=(m,start,end)=>start!=null&&end!=null&&minuteOfDay(m-start)<end-start;
export const izakayaOpen=m=>inTimeRange(m,960,1620);
export const NIGHT_PATROL=[[0,28],[0,4],[0,-16],[0,-36],[0,-44],[0,-36],[0,-16],[0,4],[DINING.izakayaX,4],[0,4]];
// A repeatable visit on alternate town days, with time to lock up and walk over.
// Keep the unwrapped saved clock so revisiting or reloading never rerolls her.
export function yuriVisitsIzakaya(minutes){
 const minute=((minutes%1440)+1440)%1440,day=Math.floor(minutes/1440);
 return day%2===0&&minute>=1220&&minute<1290;
}
export function yuriEveningPlace(minutes){
 const m=minuteOfDay(minutes);
 if(m<1200||m>=1370)return 'home';
 if(m<1260)return Math.floor(minutes/1440)%2===0?'stroll':'ramen';
 return m<1340?'evening':'stroll';
}
export const IZAKAYA_SEATS=[[-3.8,-1.42],[-2.3,-1.42],[-.8,-1.42],[.7,-1.42],[2.2,-1.42],[-4.1,1.12],[-2.9,1.12],[2,3.08]];
export function supperGuests(minutes){
 const minute=((minutes%1440)+1440)%1440;
 if(!izakayaOpen(minutes))return [];
 return PROFILES.filter(p=>ACTIVE_RESIDENT_NAMES.includes(p.name)&&p.name!=='Nao'&&inTimeRange(minute,p.supperStart,p.supperEnd)).slice(0,IZAKAYA_SEATS.length);
}
// Overlapping, repeatable visits by the active cast. At most two seated diners;
// Yuri retains her separate after-work stop and her standing/greeting animation.
export const RAMEN_VISITS=Object.freeze({
 Kenji:[555,660], 'Harbour master':[615,720], 'Mrs Sato':[675,780],
 Nao:[780,840], Tetsuo:[795,900], Aya:[855,960],
 Reiko:[915,1020], 'Bus driver':[975,1080], 'Officer Mori':[1140,1255],
});
export const MARKET_VISITS=Object.freeze({
 'Mrs Sato':[570,625],Aya:[660,715],Kenji:[870,925],Tetsuo:[930,985],
 Reiko:[1025,1080],'Harbour master':[1085,1140],'Bus driver':[1140,1190],
});
export function visitsMarket(profile,minutes){
 const visit=MARKET_VISITS[profile.name];
 return ACTIVE_RESIDENT_NAMES.includes(profile.name)&&!!visit&&inTimeRange(minutes,...visit);
}
export const ramenOpen=m=>inTimeRange(m,540,1260);
export function visitsRamen(profile,minutes){
 const visit=RAMEN_VISITS[profile.name];
 return ACTIVE_RESIDENT_NAMES.includes(profile.name)&&ramenOpen(minutes)&&!!visit&&inTimeRange(minutes,...visit);
}
export function residentPlan(profile,minutes,rain=false){
 const m=minuteOfDay(minutes);
 if(visitsRamen(profile,minutes))return {place:'ramen',target:RAMEN_DOOR,activity:'a bowl of ramen at Inakaya'};
 if(profile.name==='Officer Mori')return inTimeRange(m,1320,1800)?{place:'patrol',target:(FULL_TOWN.active?FULL_TOWN.patrol:NIGHT_PATROL)[0],activity:'night patrol'}:{place:'home',target:profile.home,activity:'resting after the night patrol'};
 if(profile.name==='Nao')return izakayaOpen(m)?{place:'izakaya',target:IZAKAYA_DOOR,activity:'welcoming guests'}:{place:'home',target:profile.home,activity:'going home after closing'};
 if(profile.name==='Yuri'){
  if(inTimeRange(m,profile.start-30,profile.close))return {place:'market',target:profile.work,activity:profile.role};
  if(rain||!inTimeRange(m,profile.close,profile.retire))return {place:'home',target:profile.home,activity:rain?'sheltering at home':'going home'};
  if(yuriVisitsIzakaya(minutes))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'supper with Nao'};
  const slot=yuriEveningPlace(minutes);
  if(slot==='home')return {place:'home',target:profile.home,activity:'settling in at home'};
  if(slot==='izakaya')return {place:'izakaya',target:IZAKAYA_DOOR,activity:'a drink after work'};
  if(slot==='ramen')return {place:'ramen',target:RAMEN_DOOR,activity:'a late bowl of ramen'};
  if(slot==='stroll')return {place:'stroll',target:profile.home,activity:'lingering near home'};
  return {place:'evening',target:profile.evening,activity:'walking the canal'};
 }
 if(supperGuests(minutes).some(p=>p.name===profile.name))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'supper with the neighbours'};
 if(visitsMarket(profile,minutes))return {place:'market',target:RESIDENTS.find(p=>p.name==='Yuri').work,activity:'a snack at Sakura'};
 if(inTimeRange(m,profile.start-30,profile.close))return {place:'work',target:profile.work,activity:profile.role};
 if(rain||!inTimeRange(m,profile.close,profile.retire))return {place:'home',target:profile.home,activity:rain?'sheltering at home':'going home'};
 return {place:'evening',target:profile.evening,activity:'taking an evening stroll'};
}
export const GOSSIP=[
 {id:'yuri-evening',a:'Yuri',b:'Nao',line:'Yuri: I told the assistant manager I would be home early.\nNao: The plant?\nYuri: He looked very disappointed. I watered him twice.',clue:'Yuri sometimes stops at Minato after locking Sakura. Look for her after 20:20, or around her room on the canal.'},
 {id:'apron',a:'Aya',b:'Reiko',line:'Aya: Tama needs his own column.\nReiko: What would he write?\nAya: Strong opinions about the window chair.',clue:'Aya and Reiko share Books & Press and the entrance at 2 Willow Alley.'},
 {id:'radio',a:'Kenji',b:'Tetsuo',line:'Kenji: Hey, bro, I fixed the crackling.\nTetsuo: That was the music.\nKenji: Totally improved it, then, dude.',clue:'Find the street radio and try the other stations.'},
 {id:'fish',a:'Harbour master',b:'Bus driver',line:'Bus driver: I arrived exactly on time.\nHarbour master: Which timetable?\nBus driver: The one I am writing now.',clue:'The harbour master keeps the office records; the bus driver works at the Main Street stop.'},
 {id:'special',a:'Nao',b:'Mrs Sato',line:'Mrs Sato: Is that a proper supper?\nNao: You taught me the portions.\nMrs Sato: Good. Then there will be seconds.',clue:'Try Nao’s supper special at the counter.'}
];
export function gossipAt(minutes,names){return GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b))[Math.floor(minutes/7)%Math.max(1,GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b)).length)]||{id:'welcome',line:'Nao: Pull up a chair. Nobody leaves this table a stranger.\nA gull outside offers a surprisingly firm objection.',clue:'Neighbours arrive after their shifts. Visit again later for different conversations.'};}
