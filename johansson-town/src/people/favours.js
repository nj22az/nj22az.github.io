/**
 * Favours: what a resident asks the mayor to do for them, written from who they are.
 *
 * A favour is an errand (people/errands.js) with its own story: who asks, who it is for,
 * the thing, and why. That why is the residents' own facts (profiles.json, the shops'
 * stock), so the story makes sense and the town remembers it. It starts with a letter in
 * the post (mail/post.js), plays out in conversations, and every step that matters is a
 * moment (progression/diary.js) that the diary and the evening news retell in their own
 * words. The next morning the asker writes to say thank you.
 *
 * Lines here are the favour's own; any step without one uses the shared errand lines in
 * the speaker's temperament. Cues are dialogue/markup.js's.
 */
import {offerErrand,answer,expire,visit,errandLine,restoreErrand} from './errands.js';
import {renderLine,seedOf} from '../dialogue/markup.js';

export const FAVOURS=Object.freeze([
 Object.freeze({
  id:'nhung-cookbook',kind:'deliver',from:'Nhung',to:'Thao',item:'Cookery book',at:'Front-Row Books',
  // The town's own facts, as the game shows them, which is why this favour exists.
  why:[
   'Thao (people/residents.js, her gossip): "Nhung says I am stubborn. I say I am right."',
   'Nhung (her name tab): "Playful mischief, the eldest sister"; the three sisters, Nhung, Thao and Thuan (people/neighbour-chats.js).',
   'Nhung (profiles.json, hello): she bookmarks the funny parts.',
   'Minato (people/izakaya-beer.js DISHES): Thao serves a rolled dashi omelette.',
   'Front-Row Books (world/interiors/bookshop-detail.js): a Cookery section on the east wall.',
  ],
  // Nhung works until 18:30 and Minato opens at 16:00 (profiles.json): it is asked by day,
  // handed over in the evening, and done by midnight.
  askBy:15*60,
  letter:'I have found something for my sister Thao, and it cannot come from me. Could you call in at Front-Row Books today? I am at the counter until half past six.',
  thanks:'Thank you for yesterday. Thao has not said a word about the book, which means she has read it. Not a word to her, please.',
  lines:Object.freeze({
   ask:'{face:scheme}Thao says her dashi omelette is perfect as it is.{p} This cookery book disagrees,{p} and I have bookmarked the page.{p:2} {face:smile}Take it to Minato for me?{p} From her big sister,{p} she would never open it.',
   accepted:'{face:happy}Thank you.{p} Say it was your idea.{p} Minato opens at four.',
   checkIn:'{face:smile}Minato opens at four.{p} She is the one behind the counter,{p} being right about everything.',
   handOver:'{face:surprised}A cookery book?{p} For me?{p:2} {face:dry}Bookmarked at the omelette page.{p} My sister sent this.{p:2} {face:pouting}Tell her I am still right.{p} Actually,{p} tell her nothing.',
   done:'{face:smug}So my sister has a new cookery book.{p} She will make the omelette my way by Friday and say it was her own idea.{p} Thank you,{p} {name}.',
   late:'{face:smile}Ah,{p} the day ran out.{p} Never mind.{p} Give it here.{p} I will leave it on her doorstep,{p} and she can think it was the wind.',
  }),
  moments:Object.freeze({
   accepted:{text:'Nhung gave me a cookery book to take to her sister Thao at Minato. It must not look as if it came from her.',kind:'friend'},
   declined:{text:'Nhung asked me to take a cookery book to her sister Thao. I said not today.',kind:'note'},
   done:{text:'Took the cookery book to Thao. She saw through it at once, and kept it anyway.',kind:'friend',
    news:'A cookery book has turned up at Minato, bookmarked at the page for a rolled dashi omelette. Owner Thao says her omelette was already perfect. Front-Row Books has no comment.'},
   late:{text:'I promised Nhung I would take the cookery book to Thao, and the day ran out.',kind:'note'},
  }),
  friendship:Object.freeze({Nhung:10,Thao:3}),
 }),
 Object.freeze({
  id:'harbour-timetable',kind:'deliver',from:'Harbour master',to:'Bus driver',item:'Bus timetable',at:'the harbour office',
  why:[
   'Harbour master (people/residents.js, his gossip): "The bus driver brings stories from the last stop. I check his timetable against the harbour clock."',
   'Bus driver (people/residents.js, his gossip): "I bring him a fresh story with the morning timetable."',
   'Harbour master (activities.js): "The harbour office is staffed around the clock. I stay on the quay." So he cannot take it himself.',
   'Hours (profiles.json): the harbour master 5:00 to 14:00, the bus driver 9:00 to 18:00 at the terminal.',
  ],
  // Asked before the harbour master goes off at two; handed over at the terminal before six.
  askBy:12*60+30,
  letter:'A small matter of time. The bus driver left his morning timetable on my desk. Call in at the harbour office before two, if you would.',
  thanks:'Thank you for taking the timetable back. He came by this morning with the next one, and a story to make up for yesterday. I have checked the timetable. I have not checked the story.',
  lines:Object.freeze({
   ask:'{face:dry}Every morning the bus driver brings me his timetable and a story.{p} I check the timetable.{p:2} Today he left it behind.{p} {face:smile}Would you take it to him at the terminal?{p} I do not leave the quay.',
   accepted:'{face:smile}Thank you.{p} Tell him the harbour clock agrees with him.{p} Today.',
   checkIn:'{face:dry}The terminal,{p} at the end of the line.{p} He will be telling somebody a story.',
   handOver:'{face:surprised}My timetable!{p} I wondered why the morning felt short.{p:2} {face:smile}Did he check it?{p} Of course he checked it.{p} Tell him the story was true.{p} Mostly.',
   done:'{face:smile}He has it back?{p} Good.{p} Tomorrow he will bring me two stories to make up for it.{p} Thank you,{p} {name}.',
   late:'{face:dry}The day ran out,{p} and so did the timetable.{p} Never mind.{p} I will give it to him in the morning,{p} with a story of my own for once.',
  }),
  moments:Object.freeze({
   accepted:{text:'The harbour master gave me the bus driver’s morning timetable to take back to him at the terminal.',kind:'friend'},
   declined:{text:'The harbour master asked me to take the timetable back to the bus driver. I said not today.',kind:'note'},
   done:{text:'Took the timetable back to the bus driver. The harbour clock agreed with him.',kind:'friend',
    news:'The bus driver has his timetable back, checked against the harbour clock. The harbour office says the two agree, for now.'},
   late:{text:'I promised the harbour master I would take the timetable to the bus driver, and the day ran out.',kind:'note'},
  }),
  friendship:Object.freeze({'Harbour master':10,'Bus driver':3}),
 }),
 Object.freeze({
  id:'nhung-rain-book',kind:'return',from:'Nhung',to:'Harbour master',item:'Rain-stained book',at:'Front-Row Books',
  why:[
   'Nhung (profiles.json, her clue): "A rain-stained book is drying at the harbour office."',
   'Nhung (profiles.json, hello): "I bookmark the funny parts — apparently that is not how a lending library works."',
   'Harbour master (profiles.json, hello): "I can predict rain by my knees."; he stays on the quay (activities.js).',
   'Hours (profiles.json): Nhung at the counter 9:00 to 18:30, the harbour master 5:00 to 14:00.',
  ],
  // The book is with the harbour master, who goes off at two: asked in the morning.
  askBy:12*60,
  letter:'A book of ours went out in the rain and ended up drying at the harbour office instead of coming home. Could you call in at Front-Row Books today? I will explain at the counter.',
  thanks:'Thank you for bringing the book home. It is drying on the window shelf, a little wavy and very proud of itself. I have put a card in it: reserved for the harbour master.',
  lines:Object.freeze({
   ask:'{face:sweatdrop}A customer read one of our books on the quay.{p} In the rain.{p:2} The harbour master took it in to dry.{p} {face:smile}Could you fetch it back for me?{p} He is at the office until two,{p} and I cannot leave the counter.',
   accepted:'{face:happy}Thank you.{p} Carry it flat.{p} It has been through enough.',
   checkIn:'{face:smile}The harbour office,{p} before two.{p} Ask nicely.{p} I think he has grown fond of it.',
   handBack:'{face:smile}The book?{p} Dry as a biscuit.{p} I turned the pages every hour.{p:2} {face:dry}Chapter six is very good.{p} Tell her I have not finished it.',
   done:'{face:happy}It is dry!{p} Wavy,{p} but dry.{p:2} {face:scheme}And somebody has bookmarked chapter six.{p} I will lend it to him properly.{p} Thank you,{p} {name}.',
   late:'{face:smile}The day ran out?{p} Never mind.{p} The book has been patient.{p} So can I.',
  }),
  moments:Object.freeze({
   accepted:{text:'Nhung asked me to fetch a rain-stained book back from the harbour office, where it has been drying.',kind:'friend'},
   declined:{text:'Nhung asked me to fetch a book back from the harbour office. I said not today.',kind:'note'},
   done:{text:'Brought the rain-stained book back to Front-Row Books. The harbour master had read half of it while it dried.',kind:'friend',
    news:'A book left out in the rain is back on the shelves of Front-Row Books, dried at the harbour office. Staff say it is wavy but readable.'},
   late:{text:'I promised Nhung I would fetch the book from the harbour office, and the day ran out.',kind:'note'},
  }),
  friendship:Object.freeze({Nhung:6,'Harbour master':3}),
 }),
]);
export const favourById=id=>FAVOURS.find(f=>f.id===id)||null;

const DAY=1440;
const dayOf=m=>Math.floor(m/DAY);
const minuteOf=m=>((m%DAY)+DAY)%DAY;

export const FAVOUR_TRIES=3;
const letterId=(f,day)=>`favour:${f.id}:${day}`;
const offerDay=(f,minutes)=>dayOf(minutes)+(minuteOf(minutes)<f.askBy?0:1);
const OPEN=['planned','asked','accepted'];
/**
 * The favour calendar: one favour a day at most, in the order of FAVOURS, and only one on at a time. A favour is
 * offered on a day with time left to do it (today if the morning is young enough, else tomorrow) and never on the
 * same day as the one before. One that was never taken up (he did not call, or did not answer) is offered again on
 * the next such day, up to FAVOUR_TRIES times, the way a neighbour asks again; then it lapses and the next one comes.
 * A favour he said no to, or let run late, is over. Returns the letters to post, each replacing any earlier one for
 * the same favour: [{id, day, occasion:'favour', from, place, body, replaces}].
 */
export function planFavours(state,minutes){
 state.favours||={};const today=dayOf(minutes);
 const letter=(f,day)=>({id:letterId(f,day),day,occasion:'favour',from:f.from,place:f.at,body:f.letter,replaces:`favour:${f.id}:`});
 // Untaken ones first: asked again, or lapsed.
 for(const f of FAVOURS){
  const r=state.favours[f.id];
  if(!(r&&['planned','asked'].includes(r.status)&&today>r.day&&state.errand?.favour!==f.id))continue;
  // It lets go: its last letter, if it has not come yet, is not sent.
  if((r.tries||1)>=FAVOUR_TRIES){r.status='lapsed';if(Array.isArray(state.post?.pending))state.post.pending=state.post.pending.filter(p=>!p.id.startsWith(`favour:${f.id}:`));continue;}
  const day=offerDay(f,minutes);state.favours[f.id]={day,status:'planned',tries:(r.tries||1)+1};
  return [letter(f,day)];
 }
 // One on at a time.
 if(FAVOURS.some(f=>OPEN.includes(state.favours[f.id]?.status))||state.errand?.favour&&OPEN.includes(state.errand.status))return [];
 const next=FAVOURS.find(f=>!state.favours[f.id]);if(!next)return [];
 const last=Math.max(-Infinity,...Object.values(state.favours).map(r=>r.day));
 const day=Math.max(offerDay(next,minutes),Number.isFinite(last)?last+1:-Infinity);
 state.favours[next.id]={day,status:'planned',tries:1};
 return [letter(next,day)];
}

/** The favour waiting to be asked by `name` today, once its letter has come: the "!" card's reason. */
export function favourWaiting(state,name,minutes){
 const f=FAVOURS.find(f=>{const r=state.favours?.[f.id];return f.from===name&&r?.status==='planned'&&r.day===dayOf(minutes)&&state.post?.sent?.includes(letterId(f,r.day));});
 return f&&!state.errand?f:null;
}

/** A favour's line at a step, rendered: its own words, or the shared errand line. */
export function favourLine(f,errand,step,{speaker,temper,playerName='Johansson'}={}){
 const own=f?.lines?.[step];
 if(own&&(!speaker||speaker===(['handOver','handBack'].includes(step)?f.to:f.from)))return renderLine(own,{name:playerName,speaker:speaker||f.from,seed:seedOf(f.id,step)});
 return errandLine(errand,step,{playerName,speaker,temper});
}

/** Starts the favour: the errand is offered. */
export function askFavour(state,f,{minutes,temper}){
 const errand=offerErrand({kind:f.kind,from:f.from,temper,item:f.item,to:f.to,minutes,reward:0});
 errand.favour=f.id;state.errand=errand;state.favours[f.id].status='asked';
 return errand;
}

/** Yes or no. Returns {step, moment} with the favour's own moment. */
export function replyFavour(state,yes){
 const e=state.errand,f=favourById(e?.favour);const r=answer(e,yes);if(!r)return null;
 state.favours[f.id].status=e.status;
 return {step:r.step,moment:{...f.moments[r.step],who:[f.from,f.to],id:`favour:${f.id}:${r.step}`}};
}

/**
 * Ends what the day has run out on, whoever he is talking to: an accepted favour is late
 * (a moment; the thing goes back when he next sees the asker), and an ask he never
 * answered goes back to be offered again (planFavours). Returns {moment} when it is late.
 */
export function favourExpire(state,minutes){
 const e=state.errand,f=favourById(e?.favour);if(!e||!f||!state.favours?.[f.id])return null;
 if(e.status==='offered'&&dayOf(minutes)>e.day){state.errand=null;state.favours[f.id].status='asked';return null;}
 if(!expire(e,minutes))return null;
 state.favours[f.id].status='late';
 return {moment:{...f.moments.late,who:[f.from,f.to],id:`favour:${f.id}:late`}};
}

/**
 * Johansson talks to `who` with a favour on (call favourExpire first). Returns null for
 * an ordinary chat, or {step, speaker, done?}: the hand-over is where a delivery is done.
 */
export function favourVisit(state,who,{minutes,bagFull=false}={}){
 const e=state.errand,f=favourById(e?.favour);if(!e||!f)return null;
 if(e.status==='late'){if(who===f.from&&!e.lateSaid){e.lateSaid=true;return {step:'late',speaker:who,item:f.item};}return null;}
 const r=visit(e,who,{minutes,bagFull});if(!r)return null;
 // The asker mentions it once a day; after that they talk about other things.
 if(r.step==='checkIn'){if(e.checkedDay===dayOf(minutes))return null;e.checkedDay=dayOf(minutes);}
 // Done at the hand-over for a delivery, back with the asker for a return.
 if(r.done||(r.step==='done'&&r.moment)){state.favours[f.id].status='done';return {...r,done:true,moment:{...f.moments.done,who:[f.from,f.to],id:`favour:${f.id}:done`}};}
 return r;
}

/** The saved favours and the errand on, cleaned. */
export function restoreFavours(saved){
 const out={};if(!saved||typeof saved!=='object')return out;
 for(const f of FAVOURS){const r=Object.hasOwn(saved,f.id)?saved[f.id]:null;if(r&&Number.isSafeInteger(r.day)&&['planned','asked','accepted','declined','done','late','lapsed'].includes(r.status))out[f.id]={day:r.day,status:r.status,tries:Math.max(1,Math.min(FAVOUR_TRIES,Number.isSafeInteger(r.tries)?r.tries:1))};}
 return out;
}
export function restoreFavourErrand(saved){
 const e=restoreErrand(saved);if(!e||!favourById(saved?.favour))return null;
 e.favour=saved.favour;e.lateSaid=saved.lateSaid===true;if(Number.isSafeInteger(saved.checkedDay))e.checkedDay=saved.checkedDay;return e;
}
