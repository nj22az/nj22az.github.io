import {PROFILES} from './profiles.js';
export const IZAKAYA_DOOR=[24,20];
export const RAMEN_DOOR=[24.65,14.7];
export const minuteOfDay=m=>((m%1440)+1440)%1440;
export const inTimeRange=(m,start,end)=>start!=null&&end!=null&&minuteOfDay(m-start)<end-start;
export const izakayaOpen=m=>inTimeRange(m,960,1620);
export const NIGHT_PATROL=[[0,46],[0,18],[0,-10],[0,-46],[0,-50],[0,-46],[0,-10],[0,18],[24,18],[0,18]];
// A repeatable visit on alternate town days, with time to lock up and walk over.
// Keep the unwrapped saved clock so revisiting or reloading never rerolls her.
export function yuriVisitsIzakaya(minutes){
 const minute=((minutes%1440)+1440)%1440,day=Math.floor(minutes/1440);
 return day%2===0&&minute>=1220&&minute<1290;
}
export const IZAKAYA_SEATS=[[-3.8,-1.42],[-2.3,-1.42],[-.8,-1.42],[.7,-1.42],[2.2,-1.42],[-4.1,1.12],[-2.9,1.12],[2,3.08]];
export function supperGuests(minutes){
 const minute=((minutes%1440)+1440)%1440;
 if(!izakayaOpen(minutes))return [];
 return PROFILES.filter(p=>p.name!=='Nao'&&inTimeRange(minute,p.supperStart,p.supperEnd)).slice(0,IZAKAYA_SEATS.length);
}
export function residentPlan(profile,minutes,rain=false){
 const m=minuteOfDay(minutes);
 if(profile.name==='Officer Mori')return inTimeRange(m,1320,1800)?{place:'patrol',target:NIGHT_PATROL[0],activity:'night patrol'}:{place:'home',target:profile.home,activity:'resting after the night patrol'};
 if(profile.name==='Nao')return izakayaOpen(m)?{place:'izakaya',target:IZAKAYA_DOOR,activity:'welcoming guests'}:{place:'home',target:profile.home,activity:'going home after closing'};
 if(profile.name==='Yuri'&&yuriVisitsIzakaya(minutes))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'supper with Nao'};
 if(supperGuests(minutes).some(p=>p.name===profile.name))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'supper with the neighbours'};
 if(inTimeRange(m,profile.start-30,profile.close))return {place:profile.name==='Yuri'?'market':'work',target:profile.work,activity:profile.role};
 // Stagger noodle visits so the small counter seats only one neighbour at a time.
 const ramenStart=profile.close+(profile.name==='Hana'?5:profile.name==='Daichi'?40:75);
 if(['Hana','Daichi','Cold-storage kid'].includes(profile.name)&&inTimeRange(m,ramenStart,ramenStart+30)&&m<1260)return {place:'ramen',target:RAMEN_DOOR,activity:'a bowl of ramen'};
 if(rain||!inTimeRange(m,profile.close,profile.retire))return {place:'home',target:profile.home,activity:rain?'sheltering at home':'going home'};
 return {place:'evening',target:profile.evening,activity:'taking an evening stroll'};
}
export const GOSSIP=[
 {id:'yuri-evening',a:'Yuri',b:'Nao',line:'Yuri: I told the assistant manager I would be home early.\nNao: The plant?\nYuri: He looked very disappointed. I watered him twice.',clue:'Yuri sometimes stops at Minato after locking Sakura. Look for her after 20:20.'},
 {id:'apron',a:'Aiko',b:'Emi',line:'Aiko: The cat apron needs bigger pockets.\nEmi: For what?\nAiko: His responsibilities.',clue:'Aiko is worried about Tama. Ask her by the bookshop.'},
 {id:'radio',a:'Kenji',b:'Tetsuo',line:'Kenji: I fixed the crackling.\nTetsuo: That was the music.\nKenji: Then I have improved it.',clue:'Find the street radio and try the other stations.'},
 {id:'fish',a:'Harbour master',b:'Mr Fujita',line:'Fujita: This big!\nHarbour master: Yesterday it was smaller.\nFujita: Yesterday you were sitting further away.',clue:'The outer pier has a bait station and a working winch.'},
 {id:'special',a:'Nao',b:'Masaru',line:'Masaru: Is my fish on the menu?\nNao: In very small writing.\nMasaru: Exclusive, then.',clue:'Try Nao’s supper special at the counter.'}
];
export function gossipAt(minutes,names){return GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b))[Math.floor(minutes/7)%Math.max(1,GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b)).length)]||{id:'welcome',line:'Nao: Pull up a chair. Nobody leaves this table a stranger.\nA gull outside offers a surprisingly firm objection.',clue:'Neighbours arrive after their shifts. Visit again later for different conversations.'};}
