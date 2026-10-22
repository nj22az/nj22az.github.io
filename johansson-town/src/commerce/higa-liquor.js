import {townCalendarAt} from '../town-clock.js';
import {rotaWeek} from '../people/ferry-crew.js';
import {ACCOUNTS,SUPPLIERS} from './merchandising.js';

/**
 * Higa Liquor (比嘉酒店), Grandmother Higa's: who keeps it, when it is open, who carries its orders and what is in it
 * that is not for sale. The owner, 21 October 2026 ("who should work in the liquor store, do we have enough people";
 * the plan approved: "Yes go on"): no new people. Grandmother Higa keeps the counter round her afternoon at the bandai,
 * Yui (Miss Higa, her granddaughter) minds it on Saturdays, and Kōji drives its orders round in his white kei truck on
 * his weeks ashore, as paid work. Everything here is data first, so the world, the stories, the film and the tests ask
 * the same questions.
 */
const minute=m=>((m%1440)+1440)%1440;
const DAY=1440;

/**
 * The hours, in minutes of the day. Grandmother Higa opens at nine, shuts for lunch and the bandai at noon (Umi-no-yu,
 * 13:00–17:00), and opens again from five to eight for the evening trade: the beer for supper, the bottle for a visit.
 */
export const HIGA_LIQUOR_HOURS=Object.freeze({morning:Object.freeze([540,720]),evening:Object.freeze([1020,1200])});
/** The hours as the shop's own card writes them. */
export const HIGA_LIQUOR_HOURS_TEXT='9:00–12:00 · 17:00–20:00';

/**
 * The card on the door between the openings: hand-written on the back of a calendar page, hung on a string from the door's
 * handle while she is at the bath. Japanese on the card (the World's signs are), English for the player.
 */
export const HIGA_RUSU_CARD=Object.freeze({jp:'留守',jpLine:'5時に戻ります',en:'Out. Back at five.',
 who:'Grandmother Higa',why:'She is at the bandai at Umi-no-yu, up Kitano Road, from one to five: the shop is shut, and the regulars know where to find her.',
 period:'A 留守 (“out”) card on a shop door, with the time of return, is how a one-person shop in Shōwa Japan said “back soon”.'});

/**
 * How the front moves with the hours, in town minutes (town-clock.js: one town minute is a real minute at speed 1). The
 * roller shutter is up from just before nine to just after eight; the glass doors slide open for each opening and shut
 * `after` it, by which time the keeper has walked out through them; each takes `roll` or `slide` to move.
 */
export const HIGA_FRONT=Object.freeze({roll:.15,slide:.08,after:1});

/** 'open', 'away' (the 留守 card: shut between the openings) or 'shut' (the night, the shutter down). */
export function higaLiquorState(minutes){
 const m=minute(minutes),{morning,evening}=HIGA_LIQUOR_HOURS;
 if(m>=morning[0]&&m<morning[1]||m>=evening[0]&&m<evening[1])return 'open';
 if(m>=morning[1]&&m<evening[0])return 'away';
 return 'shut';
}
export const higaLiquorOpen=minutes=>higaLiquorState(minutes)==='open';
const isSaturday=minutes=>townCalendarAt(minutes).weekday===6;

/**
 * Who keeps the counter at this minute, or null while it is shut: Grandmother Higa, or Yui on a Saturday (the owner's
 * decision of 21 October 2026). On Saturdays Grandmother Higa keeps her mornings for the garden and the verandah and
 * stays on at the bandai until eight; Yui takes the bandai from eight to ten (people/higa-liquor-day.js).
 */
export function higaLiquorKeeper(minutes){
 if(!higaLiquorOpen(minutes))return null;
 return isSaturday(minutes)?'Miss Higa':'Grandmother Higa';
}

/** How far the roller shutter is down at this minute: 0 up in its box, 1 down to the floor. */
export function higaShutterDown(minutes,{roll,after}=HIGA_FRONT){
 const m=minute(minutes),up=HIGA_LIQUOR_HOURS.morning[0]-roll,down=HIGA_LIQUOR_HOURS.evening[1]+after;
 if(m>=up&&m<up+roll)return 1-(m-up)/roll;
 if(m>=up+roll&&m<down)return 0;
 if(m>=down&&m<down+roll)return (m-down)/roll;
 return 1;
}
/** How far shut the sliding glass doors are: 0 slid open behind the fixed panes, 1 shut. */
export function higaDoorsShut(minutes,{slide,after}=HIGA_FRONT){
 const m=minute(minutes);
 for(const [open,close] of Object.values(HIGA_LIQUOR_HOURS)){
  if(m>=open&&m<open+slide)return 1-(m-open)/slide;
  if(m>=open+slide&&m<close+after)return 0;
  if(m>=close+after&&m<close+after+slide)return (m-close-after)/slide;
 }
 return 1;
}
/** Whether the 留守 card hangs on the door: from when the doors have shut at noon until they open at five. */
export const higaRusuCard=minutes=>{const m=minute(minutes);return m>=HIGA_LIQUOR_HOURS.morning[1]+HIGA_FRONT.after&&m<HIGA_LIQUOR_HOURS.evening[0];};

/**
 * What the counter sells to the player: the shop's own goods (merchandising.js SUPPLIERS['higa-saketen']), priced as an
 * Okinawan liquor shop priced them in 1997. Prices on the labels; the web edition's purse never runs out (edition.js).
 */
export const HIGA_COUNTER=Object.freeze([
 Object.freeze({id:'awamori-mini',name:'Awamori miniature (180 ml)',cost:600,item:'Awamori miniature',text:'A little 180 ml bottle of island awamori, 30 per cent, wrapped in newspaper. Keep it for a guest, she says.'}),
 Object.freeze({id:'umineko-large',name:'Umineko lager, large bottle',cost:330,item:'Umineko lager',text:'A large returnable bottle from the cold case, ¥5 back on the empty. Bring the bottle back, she says; they all come back here.'}),
 Object.freeze({id:'sake-cup',name:'One-cup sake',cost:220,item:'One-cup sake',text:'A glass cup of sake with a ring-pull lid, the kind a man takes to the bench outside. She will warm it in the pot if you ask.'}),
]);

/**
 * The family kusu (古酒): aged awamori in a clay jar behind the counter, the one thing in the shop that is never sold. A
 * story hook, and why the jar has no price.
 */
export const HIGA_KUSU=Object.freeze({id:'higa-kusu',jp:'古酒',name:'The Higa family kusu',
 vessel:'a three-shō (5.4 litre) jar of unglazed nanban-yaki clay, its wooden lid tied down with hemp cord and a paper seal',
 laidDown:1968,by:'Grandmother Higa’s late husband, who drove the island bus and did the shop’s rounds on the black bicycle',
 why:'Laid down the year Yui was born, to be opened at her wedding. Every New Year a cup is drawn for the family altar and the jar is topped up from the next-oldest bottle (shitsugi), so it is older than any bottle in the shop and gets better every year it waits.',
 neverSold:'Not for sale at any price: it is the family’s, not the shop’s. Grandmother Higa says so to everyone who asks, and looks at Yui when she says it.',
 hooks:Object.freeze(['Grandmother wants Yui married, and the jar is waiting (cast.js RELATIONSHIPS: the granddaughter and the grandmother).',
  'Tetsuo is always offered a cup at New Year and never takes it (the slow spark with Miss Higa).',
  'A typhoon year the jar was carried into the bath house for safety, and the whole bath smelled of it.']),
 period:'Okinawan families laid down kusu for a child’s birth and opened it at a wedding or a sixtieth birthday; the shitsugi topping-up is the island’s own way of ageing awamori.'});

/**
 * Higa Liquor's round (the owner's decision of 21 October 2026): Kōji, in his own white kei truck (the Kitahama monthly
 * parking's bay 1), on the days of his weeks ashore that have a drop, between the ice plant and his sleep. Grandmother
 * Higa pays him by the round. His weeks aboard as the bosun's relief (people/ferry-crew.js rotaWeek 1) are not broken:
 * on those, the customers collect, as the `aboard` line of each drop says.
 *
 * Each drop is one of the shop's accounts (merchandising.js ACCOUNTS['higa-saketen']): the four the shop delivers to
 * (Sakura, Minato, Sato Ramen and the Coral Bay Bar on Kitano-jima, whose ice boxes go up the ferry's ramp). Mr Fujita's
 * six o'clock crate at the pier root is a standing order of its own (ACCOUNTS['higa-saketen']['fujita-shed']), not part
 * of the round: at six Kōji is at the auction on his weeks ashore and signing on aboard on the others.
 */
export const HIGA_ROUND=Object.freeze({
 driver:'Kōji',vehicle:'Kōji’s white kei truck (Kitahama monthly parking, bay 1)',
 pay:1500,payText:'¥1,500 a round, cash from the till, written in the delivery book',
 days:Object.freeze([2,5,6]),start:630,end:705,
 why:'Kōji is on the quay from half past four and asleep from noon: the round fits between the ice for the boats and his sleep, on his weeks ashore, and the truck he already has for the ice chests carries twenty crates.',
 // Where he loads and where he leaves the empties: Higa's own front, and the crate yard across Main Street (lots.js).
 load:Object.freeze({at:Object.freeze([4.6,7.15]),what:'loading the round from the crates by the door'}),
 stops:Object.freeze([
  Object.freeze({account:'izakaya',days:Object.freeze([2,5]),at:'10:42',where:'Minato’s door',place:'izakaya',
   aboard:'Thao fetches it herself in Minato’s white kei truck on the way back from the market.'}),
  Object.freeze({account:'ramen',days:Object.freeze([2,5]),at:'10:50',where:'Sato Ramen’s door',place:'sato-ramen',
   aboard:'It rides in Thao’s truck with the Minato order, one crate left at the back door.'}),
  Object.freeze({account:'coral-bay-bar',days:Object.freeze([2,5]),at:'10:58',where:'the ferry ramp, for the Kitano-jima crossing',place:'ferry',
   aboard:'Thao leaves the ice boxes at the ramp, and Kōji, the bosun that week, stows them on the car deck himself.'}),
  Object.freeze({account:'market',days:Object.freeze([6]),at:'10:42',where:'Sakura’s door',place:'market',
   aboard:'Thuan wheels the cases across Main Street herself on Sakura’s trolley.'}),
 ]),
 empties:Object.freeze({at:'11:30',where:'Higa Liquor’s crate yard, across Main Street',point:Object.freeze([-7.2,12.4])}),
 standing:'fujita-shed',
});
const hm=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};

/** Whether Kōji is ashore this week (his weeks as the bosun's relief are rota week 1). */
export const kojiAshore=minutes=>rotaWeek(minutes)===0;
/** The drops of the day's round: [] on a day with none or a week he is aboard. */
export function higaDropsOn(minutes){
 const w=townCalendarAt(minutes).weekday;
 return HIGA_ROUND.stops.filter(s=>s.days.includes(w));
}
/** Whether Kōji drives the round today. */
export const higaRoundToday=minutes=>kojiAshore(minutes)&&higaDropsOn(minutes).length>0;
/**
 * Where Kōji is on the round at this minute, or null outside it: loading at the shop, at a drop (`place`, a canonical
 * place of people/canonical-day.js), or the empties back to the crate yard (`point`, world metres). Each leg is held
 * from its time to the next's.
 */
export function higaRoundAt(minutes){
 if(!higaRoundToday(minutes))return null;
 const m=minute(minutes);if(m<HIGA_ROUND.start||m>=HIGA_ROUND.end)return null;
 const legs=[{from:HIGA_ROUND.start,point:HIGA_ROUND.load.at,activity:HIGA_ROUND.load.what,account:null},
  ...higaDropsOn(minutes).map(s=>({from:hm(s.at),place:s.place,activity:'the Higa Liquor round: '+ACCOUNTS['higa-saketen'][s.account].name+', '+s.where,account:s.account})),
  {from:hm(HIGA_ROUND.empties.at),point:HIGA_ROUND.empties.point,activity:'the empties back to Higa Liquor’s crate yard',account:null}];
 return legs.filter(l=>l.from<=m).at(-1);
}

/**
 * The delivery book on Grandmother Higa's counter: who orders what (merchandising.js), on which days, who carries it this
 * week, and the round's pay. A plain-text page, as the counter's ledger reads it; `minutes` decides the week.
 */
export function higaDeliveryBook(minutes){
 const accounts=ACCOUNTS['higa-saketen'],ashore=kojiAshore(minutes),days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 const lines=[`${SUPPLIERS['higa-saketen'].name} · delivery book`,
  ashore?`This week: Kōji’s truck, Tue · Fri · Sat from 10:30 (${HIGA_ROUND.payText}).`:'This week Kōji is at sea as the bosun’s relief: the customers collect.',''];
 for(const s of HIGA_ROUND.stops){
  const a=accounts[s.account];
  lines.push(`${a.name} (${s.days.map(d=>days[d]).join(' · ')}, ${s.at})`,'  '+a.lines.join('; '),'  '+(ashore?'Kōji, to '+s.where+'.':s.aboard));
 }
 const f=accounts[HIGA_ROUND.standing];
 lines.push(`${f.name} (daily)`,'  '+f.lines.join('; '),'  '+f.delivery);
 return lines.join('\n');
}

/**
 * The yuntaku bench (ゆんたく: Okinawan for sitting and talking) in front of the shop: a timber bench against the
 * police-station end of the front and two upturned beer crates for stools, where men sit with a bottle from the counter
 * while the shop's evening opening lasts. Who sits there comes from their own days (people/cast.js): Tetsuo between the
 * bath's boiler checks, Mac after the ship's engine room and before his one beer at Minato. Mr Fujita's crate is the
 * empty one: the owner's ruling of 19 October 2026 has him sober on the bridge until 23:15, and the shop shuts at eight,
 * so his stool waits for a day the ship does not sail (none is modelled).
 *
 * Seats are world positions: `at` is where the sitter sits, `stand` where they stand up to (clear of every solid), and
 * `yaw` the way they face as the town measures it (stand-points.js yawFacing).
 */
export const YUNTAKU=Object.freeze({
 bench:Object.freeze({x:5.32,z0:9.38,z1:10.78,depth:.42,height:.44}),
 crates:Object.freeze([Object.freeze({id:'mac',x:4.0,z:9.75}),Object.freeze({id:'fuji',x:4.0,z:10.45})]),
 // (`front`: how far ahead of the mark the seat's front edge is, seat-slots.js: the bench's at x 5.11, the crates .36 deep)
 seats:Object.freeze({
  tetsuo:Object.freeze({at:Object.freeze([5.3,9.75]),stand:Object.freeze([4.72,9.2]),height:.44,yaw:Math.PI/2,front:.19}),
  player:Object.freeze({at:Object.freeze([5.3,10.45]),stand:Object.freeze([4.75,11.2]),height:.44,yaw:Math.PI/2,front:.19}),
  mac:Object.freeze({at:Object.freeze([4.0,9.75]),stand:Object.freeze([3.3,9.75]),height:.31,yaw:-Math.PI/2,front:.18}),
  fuji:Object.freeze({at:Object.freeze([4.0,10.45]),stand:Object.freeze([3.3,10.45]),height:.31,yaw:-Math.PI/2,front:.18}),
 }),
 sitters:Object.freeze([
  Object.freeze({name:'Tetsuo',seat:'tetsuo',from:1110,to:1200,
   why:'The bath’s boiler is lit for the evening by half past six and holds by itself for an hour and a half; the shop is at the foot of Kitano Road, under Umi-no-yu, so he sits out with a bottle where he can hear the burner, and goes back up when Grandmother Higa takes the crates in.'}),
  Object.freeze({name:'Mac',seat:'mac',from:1170,to:1200,
   why:'Off the ship at half past seven, he walks up Main Street and stops for half an hour on a crate with whoever is there; his one beer is still Minato’s, at eight.'}),
 ]),
 absent:Object.freeze({name:'Mr Fujita',seat:'fuji',why:'Sober on the bridge until he signs off at 23:15 (AGENTS.md, the consolidation’s ruling and the timetable of 21 October 2026), three hours after the shop shuts: his crate is kept for him and stands empty.'}),
});
/** The yuntaku seat a resident is on at this minute, or null. */
export function yuntakuSeatAt(name,minutes){
 const m=minute(minutes),s=YUNTAKU.sitters.find(s=>s.name===name);
 if(!s||m<s.from||m>=s.to||!higaLiquorOpen(minutes))return null;
 return {...YUNTAKU.seats[s.seat],id:s.seat,why:s.why};
}

/** The day's minutes at which a round leg starts, for tests and the film: [hm('10:30'), ...]. */
export const higaRoundTimes=minutes=>higaRoundToday(minutes)?[HIGA_ROUND.start,...higaDropsOn(minutes).map(s=>hm(s.at)),hm(HIGA_ROUND.empties.at)]:[];
export const HIGA_DAY_MINUTES=DAY;
