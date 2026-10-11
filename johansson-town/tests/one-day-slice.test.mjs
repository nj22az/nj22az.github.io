import test from 'node:test';
import assert from 'node:assert/strict';
import {recordMoment,momentsOn,restoreDiary,diaryPage} from '../src/progression/diary.js';
import {eveningNews,newsOn,restoreNews,QUIET_NEWS,NEWS_ITEMS} from '../src/feed/evening-news.js';

const DAY=1440;

test('a moment can say who it is about and carry its own news line; an id records a step once',()=>{
 const state={},m=DAY*20+600;
 recordMoment(state,m,{text:'I took Nhung her satchel.',kind:'friend',who:['Emi','Nhung'],news:'Nhung has her satchel back.',id:'favour:emi-satchel:done'});
 recordMoment(state,m+5,{text:'Different words, same step.',kind:'friend',id:'favour:emi-satchel:done'});
 const [moment,...rest]=momentsOn(state,20);
 assert.equal(rest.length,0,'the same step twice');
 assert.deepEqual(moment.who,['Emi','Nhung']);assert.equal(moment.news,'Nhung has her satchel back.');
 // Readers get a copy: changing it does not change the record.
 moment.who.push('X');assert.deepEqual(momentsOn(state,20)[0].who,['Emi','Nhung']);
 // The diary still reads the first-person text, not the news.
 assert.match(diaryPage(state,m),/I took Nhung her satchel\./);
});

test('old saves load, and new fields survive a save but are bounded',()=>{
 const old=restoreDiary({moments:{5:[{text:'Old moment',kind:'note',weight:1}]}});
 assert.deepEqual(old.moments[5],[{text:'Old moment',kind:'note',weight:1}]);
 const fresh=restoreDiary(JSON.parse(JSON.stringify({moments:{6:[{text:'x',kind:'friend',weight:4,who:['A','B','C','D','E',7],news:'n'.repeat(400),id:'i'}]}})));
 assert.deepEqual(fresh.moments[6][0].who,['A','B','C','D']);assert.equal(fresh.moments[6][0].news.length,280);assert.equal(fresh.moments[6][0].id,'i');
});

test('the evening news: from six, the day’s news lines heaviest first, at most three',()=>{
 const state={},m=DAY*30+19*60;
 assert.equal(newsOn(DAY*30+17*60+59),false);assert.equal(newsOn(m),true);
 recordMoment(state,m,{text:'a',kind:'note',news:'Small item.'});
 recordMoment(state,m,{text:'b',kind:'happening',news:'Big item.'});
 recordMoment(state,m,{text:'c',kind:'friend',news:'Middle item.'});
 recordMoment(state,m,{text:'d',kind:'gift',news:'Fourth item.'});
 recordMoment(state,m,{text:'not news',kind:'happening'});
 const n=eveningNews(state,m);
 assert.deepEqual(n.items,['Big item.','Middle item.','Fourth item.']);assert.equal(n.items.length,NEWS_ITEMS);
 assert.equal(n.quiet,false);assert.match(n.text,/^Good evening\. This is the Minato Evening News for \w+day \d+ \w+\./);
 assert.match(n.text,/Goodnight from Minato\.$/);
});

test('quiet days: one item, the same all evening, and none repeats until all are used',()=>{
 const state={},seen=[];
 for(let d=0;d<QUIET_NEWS.length;d++){
  const a=eveningNews(state,DAY*(100+d)+19*60),b=eveningNews(state,DAY*(100+d)+23*60);
  assert.equal(a.quiet,true);assert.deepEqual(a.items,b.items,'the same evening changed its news');
  seen.push(a.items[0]);
 }
 assert.equal(new Set(seen).size,QUIET_NEWS.length,'a quiet item repeated before all were used');
 const restored=restoreNews(JSON.parse(JSON.stringify(state.news)));
 assert.deepEqual(restored.days,state.news.days);
 assert.deepEqual(restoreNews({days:{1:'made up'},quiet:['nope']}),{days:{},quiet:[]});
});

import {sendLetter,postRound,restorePost,ensurePost,dueBy,ROUND} from '../src/mail/post.js';
import {MAILBOX_SIZE} from '../src/mail/letters.js';
const senders={Emi:{name:'Emi',temper:'easy',favourite:'Plum rice ball',clue:'Thuan has postcards by the biscuits.'}};
const senderOf=n=>senders[n]||null;

test('the post: a letter comes with Tōma’s 10:30 round on its day, once, written when it arrives',()=>{
 const state={},day=40;
 assert.ok(sendLetter(state,{id:'helped:emi-satchel',day,occasion:'helped',from:'Emi'}));
 assert.equal(sendLetter(state,{id:'helped:emi-satchel',day,occasion:'helped',from:'Emi'}),false,'sent twice');
 assert.deepEqual(postRound(state,DAY*day+ROUND-1,{senderOf}),[],'before the round');
 assert.equal(dueBy(day,DAY*day+ROUND),true);assert.equal(dueBy(day,DAY*(day-1)+23*60),false);
 const [letter]=postRound(state,DAY*day+ROUND,{senderOf,playerName:'Johansson'});
 assert.equal(letter.from,'Emi');assert.equal(letter.gift,'Plum rice ball');assert.equal(letter.ps,'P.S. Thuan has postcards by the biscuits.');
 assert.deepEqual(postRound(state,DAY*day+ROUND+60,{senderOf}),[],'delivered twice');
 assert.equal(sendLetter(state,{id:'helped:emi-satchel',day:day+3,occasion:'helped',from:'Emi'}),false,'the same letter after it was delivered');
 // A second letter from her does not repeat the clue.
 sendLetter(state,{id:'thanks:emi:41',day:41,occasion:'thanks',from:'Emi'});
 const [second]=postRound(state,DAY*41+ROUND,{senderOf});
 assert.notEqual(second.ps,letter.ps);assert.match(second.ps,/^P\.S\. /);
 // A sender the town no longer knows: the letter is dropped, not kept forever.
 sendLetter(state,{id:'x',day,occasion:'missed',from:'Nobody'});assert.deepEqual(postRound(state,DAY*(day+1),{senderOf}),[]);
 assert.equal(ensurePost(state).pending.length,0);
});

test('the post: a full box of unread letters makes the next one wait, not vanish; a save keeps it all',()=>{
 const state={};
 for(let d=0;d<MAILBOX_SIZE;d++)sendLetter(state,{id:'m'+d,day:d,occasion:'missed',from:'Emi'});
 sendLetter(state,{id:'late',day:5,occasion:'missed',from:'Emi'});
 postRound(state,DAY*20,{senderOf});
 const post=ensurePost(state);
 // Earlier days first, so the newest letter is the one that waits.
 assert.equal(post.box.length,MAILBOX_SIZE);assert.deepEqual(post.pending.map(p=>p.id),['m9']);
 post.box[0].read=true;postRound(state,DAY*20+1,{senderOf});
 assert.ok(post.box.some(l=>l.id==='m9'));assert.equal(post.pending.length,0);
 const restored=restorePost(JSON.parse(JSON.stringify(post)));
 assert.equal(restored.box.length,MAILBOX_SIZE);assert.deepEqual(restored.sent,post.sent);
 assert.deepEqual(restorePost({pending:[{id:'a',day:1,occasion:'bogus',from:'Emi'},{id:'b',day:1.5,occasion:'missed',from:'Emi'}]}).pending,[]);
});

import {FAVOURS,planFavours,favourWaiting,favourLine,askFavour,replyFavour,favourExpire,favourVisit,restoreFavours,restoreFavourErrand} from '../src/people/favours.js';
import {RESIDENTS} from '../src/people/residents.js';
import {PROFILES} from '../src/people/profiles.js';
import {EXPRESSION_NAMES} from '../src/avatars/face.js';
import {lintLine} from '../src/dialogue/markup.js';

test('every favour is between residents who are really in the town, and its lines are clean',()=>{
 const active=RESIDENTS.map(r=>r.name);
 for(const f of FAVOURS){
  assert.ok(active.includes(f.from)&&active.includes(f.to),`${f.id}: ${f.from} → ${f.to} must both be active residents`);
  assert.ok(f.why.length>=2,'a favour says why it exists');
  // Nobody who is not in the game is named: not in its lines, its letter, its thanks or its news.
  const words=[...Object.values(f.lines),f.letter,f.thanks,...Object.values(f.moments).map(m=>m.text+' '+(m.news||''))].join(' ');
  for(const p of PROFILES)if(!active.includes(p.name))assert.ok(!new RegExp('\\b'+p.name+'\\b').test(words),`${f.id} names ${p.name}, who is not in the town`);
  for(const [step,line] of Object.entries(f.lines)){
   assert.deepEqual(lintLine(line,{name:'Johansson',speaker:f.from}),[],`${f.id}/${step}`);
   for(const [,face] of line.matchAll(/\{face:([a-z]+)\}/g))assert.ok(EXPRESSION_NAMES.includes(face),`${f.id}/${step}: ${face}`);
  }
 }
});

const postFavourLetter=(state,minutes)=>{for(const {replaces,...l} of planFavours(state,minutes)){const post=ensurePost(state);post.pending=post.pending.filter(p=>!p.id.startsWith(replaces));sendLetter(state,l);}};

test('the favour from the letter to the thanks: asked, accepted, the wrong person, handed over',()=>{
 const state={},morning=DAY*50+9*60;
 const [letter]=planFavours(state,morning);
 assert.equal(letter.day,50);assert.equal(letter.from,'Nhung');assert.equal(letter.occasion,'favour');assert.equal(letter.id,'favour:nhung-cookbook:50');
 assert.deepEqual(planFavours(state,morning+60),[],'planned once');
 sendLetter(state,letter);
 assert.equal(favourWaiting(state,'Nhung',morning),null,'no "!" before her letter has come');
 postRound(state,DAY*50+ROUND,{senderOf:n=>({name:n,temper:'easy'})});
 assert.equal(favourWaiting(state,'Thao',DAY*50+ROUND),null);assert.equal(favourWaiting(state,'Nhung',DAY*50+ROUND).id,'nhung-cookbook');
 const f=FAVOURS[0],e=askFavour(state,f,{minutes:morning,temper:'easy'});
 assert.equal(favourWaiting(state,'Nhung',DAY*50+ROUND),null,'no card once asked');
 assert.match(favourLine(f,e,'ask',{speaker:'Nhung'}).text,/dashi omelette/);
 const yes=replyFavour(state,true);
 assert.equal(yes.step,'accepted');assert.deepEqual(yes.moment.who,['Nhung','Thao']);assert.equal(yes.moment.news,undefined,'an errand begun is not news');
 assert.equal(favourVisit(state,'Mrs Sato',{minutes:morning+30}).step,'wrongPerson');
 assert.match(favourLine(f,e,'wrongPerson',{speaker:'Mrs Sato',temper:'dramatic'}).text,/Thao/);
 assert.equal(favourVisit(state,'Nhung',{minutes:morning+40}).step,'checkIn');
 assert.equal(favourVisit(state,'Nhung',{minutes:morning+45}),null,'she mentions it once a day, then talks about other things');
 const done=favourVisit(state,'Thao',{minutes:DAY*50+17*60});
 assert.equal(done.step,'handOver');assert.equal(done.done,true);assert.match(done.moment.news,/cookery book/);
 assert.match(favourLine(f,e,'handOver',{speaker:'Thao'}).text,/My sister sent this/);
 assert.equal(favourVisit(state,'Nhung',{minutes:DAY*51+600}).step,'done');assert.equal(favourVisit(state,'Nhung',{minutes:DAY*51+610}),null);
 assert.doesNotMatch(favourLine(f,e,'done',{speaker:'Nhung'}).text,/\?/,'her thanks is not a question: the letter may have come first');
 assert.equal(state.favours['nhung-cookbook'].status,'done');
 const saved=JSON.parse(JSON.stringify(state));
 assert.deepEqual(restoreFavours(saved.favours),state.favours);assert.equal(restoreFavourErrand(saved.errand).favour,'nhung-cookbook');
});

test('a favour he never took up is asked again, its old letter replaced, and in the end lets go',()=>{
 const state={};
 postFavourLetter(state,DAY*10+16*60+42);
 assert.equal(state.favours['nhung-cookbook'].day,11,'too late in the day: tomorrow');
 // He comes back four days later: the old letter must not arrive as if it were today's.
 postFavourLetter(state,DAY*14+9*60);
 const post=ensurePost(state);
 assert.deepEqual(post.pending.map(p=>p.id),['favour:nhung-cookbook:14'],'the stale letter is replaced');
 assert.equal(state.favours['nhung-cookbook'].tries,2);
 postFavourLetter(state,DAY*15+9*60);assert.equal(state.favours['nhung-cookbook'].tries,3);
 postFavourLetter(state,DAY*16+9*60);assert.equal(state.favours['nhung-cookbook'].status,'lapsed');assert.deepEqual(planFavours(state,DAY*17+9*60),[]);
 // An ask he closed without answering goes back to be asked another day.
 const asked={};postFavourLetter(asked,DAY*30+9*60);askFavour(asked,FAVOURS[0],{minutes:DAY*30+11*60,temper:'easy'});
 assert.equal(favourExpire(asked,DAY*31+9*60),null);assert.equal(asked.errand,null);
 postFavourLetter(asked,DAY*31+9*60);assert.equal(asked.favours['nhung-cookbook'].day,31);assert.equal(asked.favours['nhung-cookbook'].status,'planned');
});

test('a missed day ends it kindly: a moment, and the book goes back when he sees her',()=>{
 const state={},m=DAY*70+10*60;planFavours(state,m);askFavour(state,FAVOURS[0],{minutes:m,temper:'easy'});replyFavour(state,true);
 assert.equal(favourExpire(state,m+60),null);
 const ended=favourExpire(state,DAY*71+8*60);
 assert.match(ended.moment.text,/day ran out\.$/);assert.equal(ended.item,undefined,'the book stays in the bag until he sees her');
 assert.equal(favourVisit(state,'Thao',{minutes:DAY*71+9*60}),null,'too late to hand over');
 const late=favourVisit(state,'Nhung',{minutes:DAY*71+9*60});
 assert.equal(late.step,'late');assert.equal(late.item,'Cookery book');assert.equal(favourVisit(state,'Nhung',{minutes:DAY*71+9*60+5}),null);
});

test('crafted saves cannot reach Object’s own methods through a letter or a favour',()=>{
 assert.deepEqual(restorePost({box:[{id:'x',occasion:'toString',from:'Emi',day:1}],pending:[{id:'y',day:1,occasion:'constructor',from:'Emi'}]}),{box:[],pending:[],sent:[]});
 assert.equal(sendLetter({},{id:'z',day:1,occasion:'toString',from:'Emi'}),false);
 assert.deepEqual(restoreFavours(JSON.parse('{"__proto__":{"day":1,"status":"done"}}')),{});
});
