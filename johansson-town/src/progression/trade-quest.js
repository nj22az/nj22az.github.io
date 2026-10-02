/**
 * Trade quests: a side story told through ten swaps, like the trading sequence in Zelda.
 *
 * A resident has a small trouble (a snapped sanshin string before a wedding, an empty
 * bottle of grandmother's chilli) and all they can offer is some odd thing from a
 * drawer. Somebody else in town wants that thing and swaps it for another, and so on
 * for ten swaps, until the last swap brings the very thing the story needed. Take it
 * back for the ending and a surprise.
 *
 * No two quests are alike: each one is drawn from its own random seed (the story, who
 * trades, what changes hands, the lines and the reward). The seed is kept in the save,
 * so a quest stays the same quest across reloads. When one ends, the next is offered
 * on the following town day, by somebody else.
 *
 * Every trade good carries a small true fact, so the swaps teach a little on the way.
 * Hints name the next person early in a quest and turn into riddles later, built from
 * what the residents are like (resident-personalities.js).
 *
 * Pure data and rules: no DOM, no three.js. activities.js runs the conversations and
 * game.js puts a card over whoever has a story to start.
 */
import {RESIDENT_PERSONALITIES} from '../people/resident-personalities.js';
import {bond} from '../people/friendship.js';

/** Swaps in a quest, from the starter's first item to the thing the story needs. */
export const QUEST_SWAPS=10;

/** The goods that change hands. `phrase` reads inside a sentence. */
export const TRADE_GOODS=Object.freeze([
 {name:'Tide table',phrase:'a dog-eared tide table for 1997',fact:'Spring tides come at full and new moon, when the sun and moon pull in line.'},
 {name:'Glass fishing float',phrase:'a green glass fishing float',fact:'Fishermen once kept nets afloat with hollow glass balls. Storms still wash old ones ashore.'},
 {name:'Brass spur gear',phrase:'a brass spur gear',fact:'Two meshing gears turn opposite ways. Count their teeth and you have the speed ratio.'},
 {name:'Radio valve',phrase:'an old radio valve',fact:'Before transistors, valves amplified the signal: a heated filament throws electrons across a vacuum.'},
 {name:'Sanshin pick',phrase:'a buffalo-horn sanshin pick',fact:'The sanshin is Okinawa’s three-string lute. Its body is covered in python skin.'},
 {name:'Clay shisa',phrase:'a little clay shisa',fact:'Shisa guard roofs in pairs: one with its mouth open to scare off evil, one closed to keep the luck in.'},
 {name:'Telephone card',phrase:'a used telephone card',fact:'The payphone reads the magnetic stripe and punches a hole to show how much is left.'},
 {name:'Tamagotchi',phrase:'a Tamagotchi with a flat battery',fact:'The little egg came out in late 1996 and sold out all over Japan.'},
 {name:'Katsuobushi',phrase:'a block of katsuobushi',fact:'Smoked, dried bonito goes so hard that it is shaved like wood.'},
 {name:'Ferry ticket stub',phrase:'an old ferry ticket stub',fact:'Island ferries sail by the tide table as much as by the clock.'},
 {name:'Sea salt',phrase:'a jar of island sea salt',fact:'Boil a litre of seawater dry and about 35 grams of salt is left.'},
 {name:'Cowrie shell',phrase:'a speckled cowrie shell',fact:'In parts of Asia and Africa, cowrie shells were once used as money.'},
 {name:'Bashōfu cloth',phrase:'a scrap of bashōfu cloth',fact:'Bashōfu is woven from banana-plant fibre, light and cool in an island summer.'},
 {name:'Spark plug',phrase:'a used spark plug',fact:'In a four-stroke engine each plug fires once every two turns of the crankshaft.'},
 {name:'Blown fuse',phrase:'a blown cartridge fuse',fact:'A fuse is a thin wire made to melt first, so the cable does not.'},
 {name:'Pocket compass',phrase:'a pocket compass',fact:'The needle points to magnetic north, a few degrees off true north here.'},
 {name:'Mixtape',phrase:'a mixtape cassette',fact:'One side of a C60 cassette plays for thirty minutes.'},
 {name:'Gōya seeds',phrase:'a packet of gōya seeds',fact:'Bitter melon climbs a trellis fast enough to shade a window by midsummer.'},
 {name:'Awamori cup',phrase:'a little awamori cup',fact:'Awamori is distilled from long-grain rice with black kōji mould.'},
 {name:'Ball bearing',phrase:'a steel ball bearing',fact:'Balls roll instead of sliding, so a bearing wastes far less to friction.'},
 {name:'9-volt battery',phrase:'a 9-volt battery',fact:'Inside a 9-volt battery are six small 1.5-volt cells in series.'},
 {name:'Shuri postcard',phrase:'a picture postcard of Shuri Castle',fact:'Shuri Castle’s main hall was rebuilt in 1992, after it was lost in the war.'},
 {name:'Squid jig',phrase:'a bright squid jig',fact:'Squid hunt by sight, so a jig is shaped and coloured like a little prawn.'},
 {name:'Hibiscus cutting',phrase:'a hibiscus cutting',fact:'Push a hibiscus cutting into damp soil and it roots in a few weeks.'},
 {name:'Glass thermometer',phrase:'a glass thermometer',fact:'Water boils at 100 °C at sea level, and a little lower up a mountain.'},
 {name:'Soroban',phrase:'a wooden soroban',fact:'A soroban bead above the bar counts five; each of the four below counts one.'},
 {name:'Kakeibo',phrase:'a blank kakeibo notebook',fact:'A kakeibo is a household account book: note what you spend, and at the month’s end ask how to save.'},
 {name:'Floppy disk',phrase:'a 3.5-inch floppy disk',fact:'A floppy holds 1.44 megabytes, a few hundred pages of plain text.'},
 {name:'Mooring line',phrase:'a coil of mooring line',fact:'A bowline makes a loop that will not slip and still unties easily.'},
 {name:'Multimeter probe',phrase:'a spare multimeter probe',fact:'Measure voltage across a part, but current through it.'},
 {name:'Ramune marble',phrase:'the marble from a Ramune bottle',fact:'The marble is the bottle’s stopper: the soda’s pressure holds it against the seal.'},
 {name:'Paper lantern',phrase:'a folded paper lantern',fact:'A paper lantern folds flat on a spiral of bamboo or wire.'},
]);

/**
 * The side stories. `trouble` is what the starter tells you, `goal` is what the tenth
 * swap brings, `ending` is what they say when you bring it back.
 */
export const TRADE_STORIES=Object.freeze([
 {id:'wedding',title:'A song for the wedding',goal:{name:'Sanshin strings',phrase:'a set of silk sanshin strings'},
  trouble:'My niece marries at the end of the month, and I promised to play at the party. Then a string snapped, and the shop in Naha has none.',
  ending:'Listen — it is in tune again. You must come to the party. And please, take this.'},
 {id:'obon',title:'A light for Obon',goal:{name:'Bon lantern',phrase:'a painted Bon lantern'},
  trouble:'Obon is coming, and our family lantern burned last summer. The ancestors need a light to find their way home.',
  ending:'It will hang by the family altar. My grandmother would have liked you. This is for you.'},
 {id:'brazil',title:'A letter to São Paulo',goal:{name:'Airmail stamps',phrase:'a sheet of airmail stamps'},
  trouble:'My uncle sailed for Brazil in 1958. I have finally written to him, but the post office has run out of airmail stamps.',
  ending:'It goes on Friday’s boat. Forty years, and one letter. Thank you — here, I want you to have this.'},
 {id:'clock',title:'The stopped clock',goal:{name:'Clock mainspring',phrase:'a new clock mainspring'},
  trouble:'My father’s clock stopped the night of the typhoon. It only needs a mainspring, but nobody sells them any more.',
  ending:'Hear that? Tick, tock. The house sounds like itself again. Take this, please.'},
 {id:'chilli',title:'Grandmother’s soba',goal:{name:'Kōrēgusu',phrase:'a bottle of kōrēgusu'},
  trouble:'Grandmother’s soki soba is not the same without kōrēgusu, the island chilli steeped in awamori. Her last bottle is empty.',
  ending:'Three drops, no more. Now it tastes like her kitchen. This is for you.'},
 {id:'kite',title:'The kite contest',goal:{name:'Kite paper',phrase:'a roll of washi kite paper'},
  trouble:'The children’s kite contest is on Sunday, and I promised to help my nephew. We have the bamboo, but no paper.',
  ending:'He will paint a shisa on it, I know he will. Thank you. Take this — you earned it.'},
 {id:'boat',title:'The little boat',goal:{name:'Boat varnish',phrase:'a tin of boat varnish'},
  trouble:'I have been restoring my late friend’s sabani, his little fishing boat. It is ready, all but the varnish, and the chandler is shut.',
  ending:'She will go in the water next spring, under his name. Here — for helping an old boat home.'},
]);

/** The surprises that stay with you. The golden shisa is the rare one. */
export const KEEPSAKES=Object.freeze([
 {name:'Golden shisa',rare:true,line:'A shisa covered in gold leaf. People say there is only one on the island.'},
 {name:'Ship in a bottle',line:'A three-masted ship, rigged with thread, inside an awamori bottle.'},
 {name:'Hand-dyed tenugui',line:'A cotton towel dyed with waves and plovers.'},
 {name:'Brass harbour bell',line:'A small bell from a boat that was broken up years ago.'},
 {name:'Ryukyu glass tumbler',line:'Blown from old bottles, full of tiny bubbles.'},
 {name:'Origami crane mobile',line:'Twelve paper cranes on threads that turn in a draught.'},
 {name:'Signed baseball',line:'Signed by a whole high-school team after the spring tournament.'},
 {name:'Model Harbour Line bus',line:'A tin model of the island bus, with doors that open.'},
 {name:'Pressed hibiscus',line:'A red hibiscus pressed flat in a little frame.'},
 {name:'Lighthouse lamp',line:'A paraffin lamp from the old lighthouse on the headland.'},
 {name:'Star sand',line:'A tiny jar of star-shaped sand. Each grain is the shell of a single-celled sea creature.'},
 {name:'Coral-stone paperweight',line:'A paperweight cut from the same coral stone as the old walls.'},
 {name:'Fūrin wind chime',line:'A glass wind chime with a paper strip that catches the breeze.'},
 {name:'Ship’s clock',line:'A brass ship’s clock that strikes the watches on a bell.'},
 {name:'Sanshin',line:'A real sanshin, a little worn on the neck where it was played.'},
 {name:'Johansson Co. pin',line:'An enamel pin with the Johansson Co. seal. Where did they get this?'},
]);

/** What each interest or accessory looks like to a neighbour, for riddle hints. */
const CLUES=Object.freeze({
 machine:'someone who is never far from a machine',read:'someone who always has their nose in a book',
 fish:'someone who knows the boats',office:'someone who keeps the harbour’s paperwork',
 radio:'someone who fiddles with radios',arcade:'someone who spends their breaks at the arcade',
 post:'someone who writes a lot of letters',phone:'someone who is always on the phone',
 shop:'someone who loves a bargain',seat:'someone who likes a good sit-down',inspect:'someone who notices everything',
 police:'the one in uniform',captain:'the one in the captain’s cap',apron:'someone in an apron',
 glasses:'someone in glasses','tool-pouch':'someone with a tool pouch',driver:'the one who drives the bus',
 headscarf:'someone in a headscarf',ponytail:'someone with a ponytail',
});
/** Accessories as a short second clue: "Ask someone who notices everything. Glasses, I think." */
const LOOKS=Object.freeze({police:'A uniform',captain:'A captain\u2019s cap',apron:'An apron',glasses:'Glasses','tool-pouch':'A tool pouch',driver:'A bus driver\u2019s cap',headscarf:'A headscarf',ponytail:'A ponytail'});
const ASK=Object.freeze([
 'Is that {item}? I have been after one of those for weeks!',
 'Where did you find {item}? Could I have it? I will give you something for it.',
 'Oh, {item}. That takes me back. Would you swap it?',
 'Now that is exactly what I needed. {Item}! Will you trade?',
]);
const OFFER=Object.freeze([
 'Here, take {item} in return.',
 'I can give you {item} for it.',
 'Have {item}. It deserves a new home.',
 'Let me give you {item}. Fair swap?',
]);
const NOT_ME=Object.freeze([
 '{Item}? Not for me, sorry.',
 'Hm. I have no use for {item}.',
 'That is a nice find, but it is not for me.',
]);
const FIRST=Object.freeze([
 'All I have to trade is {item}. Somebody in town must want it, and maybe what they give you leads somewhere.',
 'I have nothing to offer but {item}. Swap it around town. Things have a way of finding their people.',
 'Would you take {item}? Trade it on, and on again. Somewhere down the line someone has what I need.',
]);
const MIDWAY=Object.freeze([
 'You are the one helping {starter}, aren’t you? Everybody has heard. Keep going.',
 'For {starter}? Then it is for a good cause. You are halfway there, I would say.',
]);
const FOUND=Object.freeze([
 'And look what I have to give you for it: {item}. Is that not what {starter} has been looking for?',
 'Funny, I have no use for this any more: {item}. I heard {starter} needs one.',
]);

const cap=text=>text.charAt(0).toUpperCase()+text.slice(1);
/** A person in a sentence: "Aya", "Mrs Sato", but "the harbour master". */
export const personIn=name=>/^[A-Z][a-z]+ [a-z]+$/.test(name)?'the '+name.toLowerCase():name;
const fill=(template,phrase,starter='')=>template.replace('{item}',phrase).replace('{Item}',cap(phrase)).replace('{starter}',personIn(starter));
const goodNamed=name=>TRADE_GOODS.find(g=>g.name===name)||null;
const storyNamed=id=>TRADE_STORIES.find(s=>s.id===id)||null;
const dayOf=minutes=>Math.floor(minutes/1440);

/** A small deterministic generator, the same kind friendship.js uses for wants. */
function seeded(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const rngFor=(seed,salt=0)=>seeded((seed>>>0)+Math.imul(salt+1,2654435761));
const pick=(r,list)=>list[Math.floor(r()*list.length)];
const freshSeed=()=>Math.floor(Math.random()*2**32);

/** Who can trade: known residents in the pool, never Thuan, whose presents work their own way. */
export function tradePool(names){return [...new Set(names)].filter(n=>n!=='Thuan'&&RESIDENT_PERSONALITIES[n]).sort();}

/** The features a neighbour would describe someone by. */
function features(name){const p=RESIDENT_PERSONALITIES[name]||{};return [...(p.interests||[]),p.accessory].filter(f=>f&&CLUES[f]);}

/**
 * A hint at who wants the item next. Early swaps just say the name; later it is a
 * riddle of one or two clues that fits that person and nobody else in the pool, or
 * the name when no riddle is unique.
 */
export function hintFor(name,pool,{swap=0,rng=Math.random}={}){
 const named=`I think ${personIn(name)} was looking for something like that.`;
 if(swap<3||rng()<.3)return named;
 const others=pool.filter(o=>o!==name),mine=features(name);
 const fits=fs=>others.every(o=>{const f=features(o);return !fs.every(x=>f.includes(x));});
 const singles=mine.filter(f=>fits([f]));
 if(singles.length)return `Ask ${CLUES[pick(rng,singles)]}.`;
 for(let i=0;i<mine.length;i++)for(let j=i+1;j<mine.length;j++){
  const [a,b]=LOOKS[mine[i]]?[mine[j],mine[i]]:[mine[i],mine[j]];
  if(fits([a,b])&&!LOOKS[a])return `Ask ${CLUES[a]}`+(LOOKS[b]?`. ${LOOKS[b]}, I think.`:`, ${CLUES[b].replace(/^someone /,'')}.`);
 }
 return named;
}

/**
 * Plans a quest from its seed. people[0] is the starter, who gives goods[0];
 * people[i] (1–10) takes goods[i-1] and gives goods[i], and the tenth gives the story's
 * goal instead. Nobody trades twice in a row, the starter only begins and ends, and
 * nobody trades more than twice when the pool is big enough.
 * @returns {{seed:number,story:string,people:string[],goods:string[]}}
 */
export function planQuest(seed,pool,starter){
 const r=rngFor(seed),story=pick(r,TRADE_STORIES).id,people=[starter],count=new Map();
 const traders=pool.filter(p=>p!==starter);
 while(people.length<=QUEST_SWAPS){
  const prev=people.at(-1),ok=limit=>traders.filter(p=>p!==prev&&(count.get(p)||0)<limit);
  const choices=ok(2).length?ok(2):ok(Infinity).length?ok(Infinity):traders.length?traders:[starter];
  const next=pick(r,choices);people.push(next);count.set(next,(count.get(next)||0)+1);
 }
 const stock=TRADE_GOODS.map(g=>g.name),goods=[];
 for(let i=0;i<QUEST_SWAPS;i++)goods.push(stock.splice(Math.floor(r()*stock.length),1)[0]);
 return {seed:seed>>>0,story,people,goods};
}

/** A fresh trade record: no quest yet, nothing finished, and someone with a story to tell. */
export function newTrade(names=[]){return ensureStarter(blankTrade(),tradePool(names));}
const blankTrade=()=>({plan:null,at:0,starter:null,starterSeed:freshSeed(),started:0,finished:0,doneDay:-1,keepsakes:[]});

/**
 * Restores the saved record. A quest whose people have left the pool, or whose story
 * or goods are unknown, is dropped (the counts and keepsakes stay).
 */
export function restoreTrade(saved,names){
 const pool=tradePool(names),out=blankTrade();
 if(saved&&typeof saved==='object'){
  for(const k of ['started','finished'])if(Number.isSafeInteger(saved[k]))out[k]=Math.max(0,saved[k]);
  if(Number.isSafeInteger(saved.doneDay))out.doneDay=saved.doneDay;
  if(Number.isSafeInteger(saved.starterSeed))out.starterSeed=saved.starterSeed>>>0;
  out.keepsakes=Array.isArray(saved.keepsakes)?[...new Set(saved.keepsakes.filter(k=>KEEPSAKES.some(x=>x.name===k)))]:[];
  const plan=saved.plan;
  if(plan&&storyNamed(plan.story)&&Number.isSafeInteger(plan.seed)&&Array.isArray(plan.people)&&plan.people.length===QUEST_SWAPS+1
   &&plan.people.every(p=>pool.includes(p))&&Array.isArray(plan.goods)&&plan.goods.length===QUEST_SWAPS&&plan.goods.every(goodNamed)
   &&Number.isSafeInteger(saved.at)&&saved.at>=0&&saved.at<=QUEST_SWAPS){
   out.plan={seed:plan.seed>>>0,story:plan.story,people:[...plan.people],goods:[...plan.goods]};out.at=saved.at;
  }else if(typeof saved.starter==='string'&&pool.includes(saved.starter))out.starter=saved.starter;
 }
 return ensureStarter(out,pool);
}
function ensureStarter(trade,pool){
 if(!trade.plan&&!pool.includes(trade.starter))trade.starter=pool.length?pick(rngFor(trade.starterSeed),pool):null;
 return trade;
}

/** The running quest's story, or null. */
export function questStory(trade){return trade?.plan?storyNamed(trade.plan.story):null;}
/** What you are carrying: a trade good, or the goal after the tenth swap. */
export function heldGood(trade){
 if(!trade?.plan)return null;
 return trade.at>=QUEST_SWAPS?questStory(trade).goal:goodNamed(trade.plan.goods[trade.at]);
}
/** Who you need to find next: the next trader, or the starter once you hold the goal. */
export function tradeTarget(trade){return trade?.plan?trade.plan.people[trade.at>=QUEST_SWAPS?0:trade.at+1]:null;}
/** Who has a story to start today, when no quest is running. */
export function questStarter(trade,minutes){return !trade?.plan&&trade?.starter&&dayOf(minutes)>trade.doneDay?trade.starter:null;}

/** Starts a quest with `name`, who must be today's starter. `seed` makes it this quest. */
export function startQuest(trade,name,names,minutes,seed=freshSeed()){
 const pool=tradePool(names);
 if(questStarter(trade,minutes)!==name||!pool.includes(name))return {ok:false};
 trade.plan=planQuest(seed,pool,name);trade.at=0;trade.starter=null;trade.started++;
 const story=questStory(trade),good=heldGood(trade),r=rngFor(seed,1);
 return {ok:true,story,good,line:story.trouble+'\n\n'+fill(pick(r,FIRST),good.phrase)+'\n\n'+good.fact+'\n\n'+hintFor(tradeTarget(trade),pool,{swap:0,rng:r})};
}

/**
 * Showing what you carry to `name`. The right person swaps it (the tenth swap brings
 * the goal), the starter takes the goal for the ending and a surprise, and anybody else
 * turns it down and repeats the hint.
 * @returns {{kind:'none'}|{kind:'no',line:string}|{kind:'trade',took:object,good:object,line:string}|
 *   {kind:'finale',took:object,story:object,surprise:object,line:string}}
 */
export function offerGood(state,name,names,minutes){
 const trade=state.trade,pool=tradePool(names),good=heldGood(trade);
 if(!good)return {kind:'none'};
 const plan=trade.plan,starter=plan.people[0],story=questStory(trade),r=rngFor(plan.seed,10+trade.at);
 const hint=()=>trade.at>=QUEST_SWAPS?`${cap(personIn(starter))} is waiting for it.`:hintFor(tradeTarget(trade),pool,{swap:trade.at,rng:r});
 if(name!==tradeTarget(trade))return {kind:'no',line:fill(pick(r,NOT_ME),good.phrase)+' '+hint()};
 if(trade.at>=QUEST_SWAPS){
  const surprise=surpriseFor(state,plan.people,r);
  trade.plan=null;trade.at=0;trade.finished++;trade.doneDay=dayOf(minutes);trade.starterSeed=freshSeed();
  const others=pool.filter(p=>p!==starter);trade.starter=others.length?pick(r,others):starter;
  return {kind:'finale',took:good,story,surprise,line:story.ending+'\n\n'+surprise.line};
 }
 trade.at++;const next=heldGood(trade),ask=fill(pick(r,ASK),good.phrase);
 const midway=trade.at===Math.ceil(QUEST_SWAPS/2)?' '+fill(pick(r,MIDWAY),'',starter):'';
 if(trade.at>=QUEST_SWAPS)return {kind:'trade',took:good,good:next,line:ask+midway+'\n\n'+fill(pick(r,FOUND),next.phrase,starter)};
 return {kind:'trade',took:good,good:next,line:ask+midway+'\n\n'+fill(pick(r,OFFER),next.phrase)+'\n\n'+next.fact+'\n\n'+hint()};
}

/**
 * The surprise, applied to the state: a keepsake you do not have yet (rarely the golden
 * shisa), and with it either yen or the thanks of everyone in the chain. With the whole
 * collection, it is yen and thanks.
 */
function surpriseFor(state,people,r){
 const trade=state.trade,missing=KEEPSAKES.filter(k=>!trade.keepsakes.includes(k.name)),rare=missing.find(k=>k.rare),common=missing.filter(k=>!k.rare);
 const keepsake=rare&&(r()<.06||!common.length)?rare:common.length?pick(r,common):null;
 const lines=[];
 if(keepsake){trade.keepsakes.push(keepsake.name);lines.push(`Keepsake: ${keepsake.name}. ${keepsake.line}`);}
 let yen=0,thanks=false;
 if(!keepsake||r()<.5){yen=500+Math.floor(r()*6)*250;state.yen=Math.min(999999,(state.yen||0)+yen);lines.push(`And ¥${yen.toLocaleString('en-GB')} for your trouble.`);}
 if(!keepsake||!yen){thanks=true;for(const p of new Set(people))bond(state,p,6);lines.push('Everyone who passed the swap along has heard how it ended. You feel a little more at home with each of them.');}
 return {keepsake,yen,thanks,line:lines.join('\n\n')};
}

/** Lines for the Field book: the running story, what you carry, what you have collected. */
export function tradeSummary(trade,minutes){
 const story=questStory(trade),good=heldGood(trade),starter=questStarter(trade,minutes);
 const now=story?`Side story: ${story.title}. Carrying ${good.name} (swap ${Math.min(trade.at,QUEST_SWAPS)} of ${QUEST_SWAPS}${trade.at>=QUEST_SWAPS?', take it back to '+personIn(trade.plan.people[0]):''}).`
  :starter?`Side story: ${cap(personIn(starter))} seems troubled about something.`:'Side story: none today. Someone will need a hand tomorrow.';
 return `${now}\nKeepsakes: ${trade?.keepsakes.length||0} of ${KEEPSAKES.length} · Stories finished: ${trade?.finished||0}`;
}
