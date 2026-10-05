import {townDate,townDay} from '../town-clock.js';
import {IZAKAYA_DOOR} from '../world/dining-layout.js';
import {MARKET_THRESHOLD,TOWN_DESTINATIONS} from '../world/town-grid.js';
import {PARK_BENCH} from '../world/park-layout.js';

/**
 * Happenings: what makes today not yesterday.
 *
 * A happening is a dated or weekly moment in the town's 1997: the Sunday fish auction, the
 * Haarii boat races, the last night of Obon with eisa drummers in the street. Like the
 * events of a summer-holiday game, a happening does not need any new behaviour: it puts
 * the people it names somewhere for a while (residentPlan reads `happeningPlan` before
 * anything else) and gives them something to say that day (`happeningLine`).
 *
 *   id       stable name, used to remember a line was heard
 *   title    what the town calls it, for notices and the diary to come
 *   on       when: {date:'MM-DD'}, {dates:[...]}, {weekday:0–6} (0 is Sunday), {weekdays:[...]}
 *   hours    [from, to) in minutes of the day, while the cast is placed
 *   dry      called off in the rain (outdoor things)
 *   cast     name -> {place, target, activity}, or a function (profile) -> that
 *   lines    name -> what they say about it, all that day
 *
 * The lunar dates (Haarii, Obon, the old New Year) are 1997's: the lunar calendar moves
 * every year, and the town lives in that one.
 */
const P=PARK_BENCH.stand,park=(dx,dz)=>[P[0]+dx,P[2]+dz];
const quay=[[0,-44],[1.6,-44.6],[3.2,-44],[-1.2,-45],[4.6,-45.2]];
const street=(dx,dz)=>[MARKET_THRESHOLD[0]+dx,MARKET_THRESHOLD[1]+dz];
const at=(place,target,activity)=>({place,target,activity});

export const HAPPENINGS=Object.freeze([
 // ---- Every week -----------------------------------------------------------------
 {id:'fish-auction',title:'The Sunday fish auction',on:{weekday:0},hours:[540,615],
  cast:{'Mrs Sato':at('stroll',quay[0],'bidding at the Sunday fish auction'),'Harbour master':at('stroll',quay[2],'keeping an eye on the Sunday fish auction')},
  lines:{'Mrs Sato':'Sunday auction. The man from Itoman bids with his eyebrows. I bid with my purse, and my purse wins.','Harbour master':'Auction at nine, every Sunday since before the war. The gulls know it better than the fishermen.'}},
 {id:'ballgame',title:'The ballgame on the radio',on:{weekday:0},hours:[840,960],
  cast:{'Harbour master':at('stroll',[TOWN_DESTINATIONS.pier[0],TOWN_DESTINATIONS.pier[1]+2],'listening to the ballgame in Mr Fujita’s shed on the pier'),Tetsuo:at('stroll',[TOWN_DESTINATIONS.pier[0]+1.2,TOWN_DESTINATIONS.pier[1]+2.4],'arguing with the ballgame on the radio')},
  lines:{Tetsuo:'The radio says the Hawks are winning. My radio has been wrong before. I built it.'}},
 {id:'morning-market',title:'Thao’s Monday market',on:{weekday:1},hours:[510,600],
  cast:{Thao:at('market',MARKET_THRESHOLD,'her day off: the Monday shop at Sakura, a list as long as her arm')},
  lines:{Thao:'Monday is my day off. I spend it buying things for Minato, which is not a day off, but do not tell me that.'}},
 {id:'nhung-day-off',title:'Nhung’s day off',on:{weekday:2},hours:[600,720],
  cast:{Nhung:at('stroll',[31.6,1.5],'reading on the sea wall on her day off')},
  lines:{Nhung:'Tuesday. Reiko has the shop, and I have a book I am not selling to anybody.'}},
 {id:'star-port-night',title:'High-score night at Star Port',on:{weekday:6},hours:[1140,1230],
  cast:{Chin:profile=>at('work',profile.work,'Saturday night: chasing his own high score at Star Port')},
  lines:{Chin:'Saturday night, bro. Star Port, me and the machine. One of us goes home a legend.'}},

 // ---- The year -----------------------------------------------------------------
 {id:'new-year',title:'New Year’s Day',on:{date:'01-01'},hours:[540,630],dry:true,
  cast:{Thao:at('stroll',street(1.6,1.2),'wishing the street a happy new year'),Nhung:at('stroll',street(1.6,-.4),'out in her new year clothes with her sisters'),Chin:at('stroll',street(2.8,.5),'handing out mikan for the new year')},
  lines:{Thao:'Akemashite omedetō. Eat something. It is the first day, it counts double.',Nhung:'New year, and Thuan has already lost her new hair ribbon.',Chin:'Happy new year, bro! First repair of the year: my own bicycle.'}},
 {id:'kyu-shogatsu',title:'The old New Year',on:{date:'02-07'},hours:[0,0],
  lines:{'Mrs Sato':'Kyū-shōgatsu: the old new year, by the moon. My mother kept this one, so I keep it too.',Tetsuo:'Second new year in six weeks. Okinawa likes a celebration so much it has two.'}},
 {id:'hinamatsuri',title:'Hinamatsuri',on:{date:'03-03'},hours:[0,0],
  lines:{Nhung:'Girls’ Day. Our mother set out the dolls for three daughters. We fought over the little drum every year.',Thao:'Hina dolls at Sakura? Thuan put them next to the batteries. That is her idea of a display.'}},
 {id:'shiimii',title:'Shiimii',on:{date:'04-05'},hours:[0,0],
  lines:{'Mrs Sato':'Shiimii. Families picnic at the family tomb and share the food with the ancestors. They eat less than you would think.'}},
 {id:'kodomo-no-hi',title:'Children’s Day',on:{date:'05-05'},hours:[0,0],
  lines:{Chin:'Carp streamers on the workshop roof. Tetsuo says they make it look like a fish shop. That is the point, bro.'}},
 {id:'haarii',title:'Haarii, the dragon-boat races',on:{date:'06-09'},hours:[600,780],dry:true,
  cast:{Chin:at('stroll',quay[1],'cheering the Haarii boats from the quay'),Tetsuo:at('stroll',quay[3],'timing the Haarii boats with his watch'),Reiko:at('stroll',quay[4],'photographing the Haarii boats for the paper'),'Harbour master':at('stroll',quay[2],'clearing the harbour for the Haarii races')},
  lines:{Chin:'Haarii, bro! The boat that tips over on purpose gets the biggest cheer.',Tetsuo:'Fourth of the fifth moon. They race for the fishing year. I race for a seat in the shade.','Harbour master':'Every boat off the slipway by ten. The dragons have the harbour until one.'}},
 {id:'irei-no-hi',title:'Irei no Hi',on:{date:'06-23'},hours:[0,0],
  lines:{'Officer Mori':'Irei no Hi. At noon the island stops for a minute of silence. You will hear it: even the gulls seem to.','Mrs Sato':'The rainy season usually ends about now. My mother said the dead take the rain with them.'}},
 {id:'tanabata',title:'Tanabata',on:{date:'07-07'},hours:[1140,1260],dry:true,
  cast:{Nhung:at('stroll',street(1.4,-1.1),'tying a wish to the bamboo outside Sakura')},
  lines:{Nhung:'Tanabata. I wished for a quiet bookshop. Thuan wished I would stop reading her wish.',Thao:'Wishes on paper strips. Mine says “more staff”. Every year.'}},
 {id:'obon',title:'Obon',on:{dates:['08-15','08-16']},hours:[0,0],
  lines:{Thao:'Obon. The ancestors come home for three days, and they expect to be fed. So do I.',Nhung:'Our grandmother’s photograph gets the best seat at Obon. She would have liked that.'}},
 {id:'eisa',title:'Ukui: the last night of Obon, and the eisa',on:{date:'08-17'},hours:[1170,1290],dry:true,
  cast:{Thao:at('stroll',street(1.8,1.6),'watching the eisa drummers from Minato’s doorway'),Nhung:at('stroll',street(1.8,-1.6),'clapping along to the eisa drummers'),Chin:at('stroll',street(3,.6),'following the eisa drummers down the street'),Tetsuo:at('stroll',street(3,-1.2),'covering his ears at the eisa, smiling'),Reiko:at('stroll',street(1.2,0),'photographing the eisa for the paper')},
  lines:{Thao:'Ukui, the last night of Obon. The drums walk the ancestors home. Stand back, they do not stop for anyone.',Chin:'Eisa, bro! The big drum is in my chest, not my ears.',Tetsuo:'Too loud. Every year, too loud. Every year I come anyway.'}},
 {id:'keiro-no-hi',title:'Respect for the Aged Day',on:{date:'09-15'},hours:[0,0],
  lines:{Tetsuo:'Respect for the Aged Day. Chin bought me a cushion. I am choosing to find this respectful.','Mrs Sato':'At my age the whole town is respectful for one day. The other three hundred and sixty-four I manage by myself.'}},
 {id:'tsunahiki',title:'The town tug-of-war',on:{date:'10-12'},hours:[900,990],dry:true,
  cast:{Chin:at('park',park(-1.4,1.2),'pulling the east rope in the town tug-of-war'),Tetsuo:at('park',park(-1.4,-1.2),'pulling the east rope, mostly with his voice'),Reiko:at('park',park(1.4,1.2),'pulling the west rope in the town tug-of-war'),Nhung:at('park',park(1.4,-1.2),'pulling the west rope with her whole weight'),'Harbour master':at('park',park(0,2.2),'refereeing the town tug-of-war')},
  lines:{Chin:'Naha has the giant rope today. We have a small one and the same amount of shouting.',Nhung:'West wins the tug-of-war, and the harvest is good. I am on west. So, you are welcome.','Harbour master':'The rope is a mooring line from the ferry. Nobody tell the ferry.'}},
 {id:'christmas',title:'Christmas Eve',on:{date:'12-24'},hours:[0,0],
  lines:{Nhung:'Christmas cake from Sakura: strawberries, cream, and Thuan’s handwriting on the box saying “do not shake”.',Chin:'Christmas Eve, bro. I fixed the lights on the workshop tree. Half of them. The festive half.'}},
 {id:'omisoka',title:'Ōmisoka',on:{date:'12-31'},hours:[1080,1230],
  cast:{Thao:at('izakaya',IZAKAYA_DOOR,'serving toshikoshi soba for the last night of the year')},
  lines:{Thao:'Toshikoshi soba: long noodles for a long life. Do not bite them in half. I am watching.',Tetsuo:'Last night of the year. I will be asleep by the bells, as tradition demands. My tradition.'}},
].map(Object.freeze));

const matches=(on,{key,weekday})=>on.date===key||on.dates?.includes(key)||on.weekday===weekday||!!on.weekdays?.includes(weekday);
const minuteOf=m=>((m%1440)+1440)%1440;

/** The happenings of the day `minutes` falls on. */
export function happeningsOn(minutes){
 const date=townDate(minutes);
 return HAPPENINGS.filter(h=>matches(h.on,date));
}
/**
 * Where a resident is because of a happening, or null. Placed only for the happening's
 * hours, and not in the rain when it is an outdoor thing.
 */
export function happeningPlan(profile,minutes,rain=false){
 const name=profile?.name;if(!name)return null;
 const m=minuteOf(minutes);
 for(const h of happeningsOn(minutes)){
  if(!h.cast?.[name]||(h.dry&&rain)||m<h.hours[0]||m>=h.hours[1])continue;
  const spot=typeof h.cast[name]==='function'?h.cast[name](profile):h.cast[name];
  if(spot?.target)return {...spot,happening:h.id};
 }
 return null;
}
/** What a resident has to say about today, all day: {id, title, text, key} or null. */
export function happeningLine(name,minutes){
 const h=happeningsOn(minutes).find(h=>h.lines?.[name]);
 return h?{id:h.id,title:h.title,text:h.lines[name],key:h.id+'@'+townDay(minutes)}:null;
}
