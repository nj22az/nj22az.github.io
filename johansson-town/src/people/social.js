import {PROFILES} from './profiles.js';
export const IZAKAYA_DOOR=[24,20];
export const IZAKAYA_SEATS=[[-3.8,-1.42],[-2.3,-1.42],[-.8,-1.42],[.7,-1.42],[2.2,-1.42],[-4.1,1.12],[-2.9,1.12],[2,3.08]];
export function supperGuests(minutes){
 const minute=((minutes%1440)+1440)%1440;
 return PROFILES.filter(p=>p.name!=='Nao'&&p.supperStart!==null&&minute>=p.supperStart&&minute<p.supperEnd).slice(0,IZAKAYA_SEATS.length);
}
export function residentPlan(profile,minutes,rain=false){
 const m=((minutes%1440)+1440)%1440;
 if(profile.name==='Nao'&&m>=960&&m<1410)return {place:'izakaya',target:IZAKAYA_DOOR,activity:'welcoming guests'};
 if(supperGuests(minutes).some(p=>p.name===profile.name))return {place:'izakaya',target:IZAKAYA_DOOR,activity:'supper with the neighbours'};
 if(m<profile.start-30||m>=profile.retire)return {place:'home',target:profile.home,activity:'at home'};
 if(m<profile.close)return {place:'work',target:profile.work,activity:profile.role};
 return {place:rain?'home':'evening',target:rain?profile.home:profile.evening,activity:rain?'sheltering from rain':'taking an evening stroll'};
}
export const GOSSIP=[
 {id:'apron',a:'Aiko',b:'Emi',line:'Aiko: The cat apron needs bigger pockets.\nEmi: For what?\nAiko: His responsibilities.',clue:'Aiko is worried about Tama. Ask her by the bookshop.'},
 {id:'radio',a:'Kenji',b:'Tetsuo',line:'Kenji: I fixed the crackling.\nTetsuo: That was the music.\nKenji: Then I have improved it.',clue:'Find the street radio and try the other stations.'},
 {id:'fish',a:'Harbour master',b:'Mr Fujita',line:'Fujita: This big!\nHarbour master: Yesterday it was smaller.\nFujita: Yesterday you were sitting further away.',clue:'The outer pier has a bait station and a working winch.'},
 {id:'special',a:'Nao',b:'Masaru',line:'Masaru: Is my fish on the menu?\nNao: In very small writing.\nMasaru: Exclusive, then.',clue:'Try Nao’s supper special at the counter.'}
];
export function gossipAt(minutes,names){return GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b))[Math.floor(minutes/7)%Math.max(1,GOSSIP.filter(g=>names.includes(g.a)&&names.includes(g.b)).length)]||{id:'welcome',line:'Nao: Pull up a chair. Nobody leaves this table a stranger.\nA gull outside offers a surprisingly firm objection.',clue:'Neighbours arrive after their shifts. Visit again later for different conversations.'};}
