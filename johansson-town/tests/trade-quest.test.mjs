import test from 'node:test';
import assert from 'node:assert/strict';
import {QUEST_SWAPS,TRADE_GOODS,TRADE_STORIES,KEEPSAKES,tradePool,planQuest,newTrade,restoreTrade,startQuest,offerGood,
 heldGood,tradeTarget,questStarter,questStory,hintFor,tradeSummary} from '../src/progression/trade-quest.js';
import {STREET_CAST_NAMES} from '../src/people/residents.js';

const names=[...STREET_CAST_NAMES];
const pool=tradePool(names);
const DAY=1440;

/** Plays a quest from start to finish, returning every result along the way. */
function play(state,minutes,seed){
 const starter=questStarter(state.trade,minutes);
 const start=startQuest(state.trade,starter,names,minutes,seed);
 const steps=[];
 while(state.trade.plan)steps.push(offerGood(state,tradeTarget(state.trade),names,minutes));
 return {starter,start,steps};
}

test('Thuan never trades, and everyone who does is a known resident',()=>{
 assert.ok(!pool.includes('Thuan'));assert.ok(pool.length>=4);
 assert.deepEqual(tradePool(['Aya','Thuan','Nobody','Aya']),['Aya']);
});

test('a quest is ten swaps, then the goal goes back to whoever started it',()=>{
 const plan=planQuest(1234,pool,pool[0]);
 assert.equal(plan.people.length,QUEST_SWAPS+1);assert.equal(plan.goods.length,QUEST_SWAPS);
 assert.equal(new Set(plan.goods).size,QUEST_SWAPS,'a good came round twice');
 assert.ok(plan.people.slice(1).every(p=>p!==plan.people[0]),'the starter traded in the middle');
 for(let i=1;i<plan.people.length;i++)assert.notEqual(plan.people[i],plan.people[i-1],'someone traded with themselves');
 const counts=plan.people.slice(1).reduce((m,p)=>m.set(p,(m.get(p)||0)+1),new Map());
 assert.ok([...counts.values()].every(n=>n<=2),'someone traded more than twice');

 const state={yen:0,trade:newTrade(names)},minutes=3*DAY+600;
 const {starter,start,steps}=play(state,minutes,99);
 assert.ok(start.ok);assert.ok(start.line.includes(start.story.trouble));
 assert.equal(steps.length,QUEST_SWAPS+1);
 assert.ok(steps.slice(0,QUEST_SWAPS).every(s=>s.kind==='trade'));
 assert.equal(steps[QUEST_SWAPS-1].good.name,start.story.goal.name,'the tenth swap did not bring the goal');
 const finale=steps.at(-1);
 assert.equal(finale.kind,'finale');assert.ok(finale.line.startsWith(start.story.ending));
 assert.ok(finale.surprise.keepsake,'the first story gave no keepsake');
 assert.deepEqual(state.trade.keepsakes,[finale.surprise.keepsake.name]);
 assert.equal(state.trade.finished,1);assert.equal(heldGood(state.trade),null);
 assert.notEqual(state.trade.starter,starter,'the same person asked again');
});

test('every quest is different: story, people, goods and lines',()=>{
 const plans=Array.from({length:12},(_,i)=>planQuest(1000+i*7919,pool,pool[i%pool.length]));
 assert.ok(new Set(plans.map(p=>p.story)).size>=4,'the stories hardly vary');
 assert.ok(new Set(plans.map(p=>p.goods.join())).size===plans.length,'two quests traded the same goods');
 assert.ok(new Set(plans.map(p=>p.people.join())).size===plans.length,'two quests went round the same people');
 assert.deepEqual(planQuest(42,pool,pool[0]),planQuest(42,pool,pool[0]),'a seed is not repeatable');
 assert.ok(TRADE_STORIES.length>=6&&TRADE_GOODS.length>=QUEST_SWAPS*2&&KEEPSAKES.length>=12);
});

test('the wrong person turns it down and hints again; nothing changes hands',()=>{
 const state={yen:0,trade:newTrade(names)},minutes=600;
 const starter=questStarter(state.trade,minutes);startQuest(state.trade,starter,names,minutes,5);
 const before=JSON.stringify(state.trade),wrong=pool.find(p=>p!==tradeTarget(state.trade));
 const result=offerGood(state,wrong,names,minutes);
 assert.equal(result.kind,'no');assert.ok(result.line.length>20);
 assert.equal(JSON.stringify(state.trade),before);
});

test('one quest a day: the next story waits for tomorrow, with someone else',()=>{
 const state={yen:0,trade:newTrade(names)},minutes=5*DAY+700;
 play(state,minutes,7);
 assert.equal(questStarter(state.trade,minutes+60),null,'a new story started the same day');
 const next=questStarter(state.trade,minutes+DAY);assert.ok(next);
 assert.equal(startQuest(state.trade,pool.find(p=>p!==next),names,minutes+DAY).ok,false,'the wrong person started a story');
 assert.ok(startQuest(state.trade,next,names,minutes+DAY,8).ok);
});

test('the collection fills without repeats, and the golden shisa can turn up',()=>{
 const state={yen:0,trade:newTrade(names)};let day=1;
 for(let i=0;i<KEEPSAKES.length+3;i++){play(state,day*DAY+600,500+i*31);day++;}
 assert.equal(new Set(state.trade.keepsakes).size,state.trade.keepsakes.length);
 assert.equal(state.trade.keepsakes.length,KEEPSAKES.length,'the collection never finished');
 assert.ok(state.trade.keepsakes.includes('Golden shisa'));
 assert.ok(state.yen>0,'a full collection paid nothing');
});

test('hints name people early and use riddles that fit only one person later',()=>{
 for(const name of pool)assert.match(hintFor(name,pool,{swap:0}),new RegExp(`I think (the )?${name} was looking for something like that`,"i"));
 let riddles=0;
 for(const name of pool)for(let i=0;i<20;i++){
  const hint=hintFor(name,pool,{swap:8,rng:(()=>{let x=i;return ()=>((x=x*9301+49297)%233280)/233280;})()});
  if(!hint.includes(name))riddles++;
 }
 assert.ok(riddles>0,'no riddles were ever given');
});

test('the save keeps a quest only while it still makes sense',()=>{
 const state={yen:0,trade:newTrade(names)},minutes=600,starter=questStarter(state.trade,minutes);
 startQuest(state.trade,starter,names,minutes,77);offerGood(state,tradeTarget(state.trade),names,minutes);
 const saved=JSON.parse(JSON.stringify(state.trade));
 const restored=restoreTrade(saved,names);
 assert.equal(restored.at,1);assert.deepEqual(restored.plan,saved.plan);assert.equal(questStory(restored).id,saved.plan.story);
 const gone=restoreTrade(saved,names.filter(n=>n!==saved.plan.people[2]));
 assert.equal(gone.plan,null,'a quest kept someone who left town');assert.ok(gone.starter);
 const junk=restoreTrade({plan:{story:'nope'},keepsakes:['Golden shisa','Fake'],finished:-4},names);
 assert.equal(junk.plan,null);assert.deepEqual(junk.keepsakes,['Golden shisa']);assert.equal(junk.finished,0);
 assert.ok(restoreTrade(null,names).starter);
 assert.match(tradeSummary(restored,minutes),/swap 1 of 10/);
});

test('a whole side story plays through the real conversations and survives a reload',async()=>{
 const {installDOM}=await import('./fixtures.mjs');
 const {createActivities}=await import('../activities.js?trade=1');
 const dom=installDOM(),minutes=2*DAY+11*60;
 const acts=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>minutes});
 const trade=acts.state.trade,starter=questStarter(trade,minutes);
 assert.ok(starter,'nobody has a story on a new save');
 acts.action('resident',pool.find(p=>p!==starter));
 assert.ok(!dom.has('Is something the matter?'),'the wrong person offered the story');acts.close();
 acts.action('resident',starter);dom.button('Is something the matter?');dom.button('I will see what I can do');
 const story=questStory(acts.state.trade);assert.ok(story);
 const label=()=>'Show them the '+heldGood(acts.state.trade).name.charAt(0).toLowerCase()+heldGood(acts.state.trade).name.slice(1);
 // Mid-quest, the save keeps the quest exactly.
 acts.action('resident',tradeTarget(acts.state.trade));dom.button(label());dom.button('Swap');
 const reloaded=createActivities({say(){},onWeather(){},onTime(){},getMinutes:()=>minutes});
 assert.deepEqual(reloaded.state.trade.plan,acts.state.trade.plan);assert.equal(reloaded.state.trade.at,1);
 for(let i=1;i<QUEST_SWAPS;i++){acts.action('resident',tradeTarget(acts.state.trade));dom.button(label());dom.button('Swap');}
 assert.equal(heldGood(acts.state.trade).name,story.goal.name);
 acts.action('resident',starter);dom.button(label());dom.button('Thank you');
 assert.equal(acts.state.trade.finished,1);assert.equal(acts.state.trade.keepsakes.length,1);
 assert.ok(acts.state.notes.some(n=>n.startsWith('Side story finished: '+story.title)));
 acts.inventory();dom.button('Keepsakes');assert.ok(dom.has('Back to the field book'));acts.close();
});
