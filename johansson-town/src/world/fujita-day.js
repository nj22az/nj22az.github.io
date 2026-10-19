import {FERRY_WORKING_DAY} from '../people/ferry-crew.js';

/**
 * Mr Fujita's evening in his shed, as a pure function of the town clock: what is on the
 * set, whether he is laughing at it, and where he is with the beer.
 *
 * He is the Minato Maru's master (docs/CAST-CONSOLIDATION.md §3; people/ferry-crew.js), on the bridge from
 * the generators at ten past six to the shore power at a quarter past ten, sober the whole watch:
 * the set is off and the crate is full until he signs off at twenty past ten
 * (FERRY_WORKING_DAY.signOff, which is FUJITA_DAY.start). The evening is his.
 *
 * The television. He has the remote and no patience: every few minutes he flips to
 * another channel, from what is on at that hour (the night game's last innings and the
 * baseball news, which he keeps coming back to; the late news; the variety shows, the
 * period drama and the cooking; snow after the last station signs off at twenty past
 * eleven). Where he lands is seeded by the day and the minute, so it is the same for
 * everybody who walks past, and testable.
 *
 * The laughing. A variety show gets a laugh out of him every half a minute or so; the
 * ballgame now and then (a home run, a bad call); the news and the drama hardly ever.
 * The more he has had, the easier he laughs.
 *
 * The beer. Umineko lager in the large returnable bottles, from Higa Liquor (see
 * commerce/merchandising.js ACCOUNTS['higa-saketen']['fujita-shed']): the Higas' van stops at the
 * pier root at six every morning, leaves a crate and takes last night's empties back, so
 * the floor round his chair is clear when he comes in from the boat. He drinks between
 * three and six bottles an evening (the day decides), from a small glass he fills three
 * times a bottle, pouring with his left hand without getting out of the chair. A glass
 * goes down sip by sip; when it is empty he pours the next; he never puts an empty back
 * in the crate, he stands it on the floor. After the set goes off at half past eleven he
 * walks aboard Shiosai and sleeps it off, and signs on sober at five past six.
 */

export const FUJITA_DAY=Object.freeze({
 start:FERRY_WORKING_DAY.signOff, // signed off from the last boat: he sits down with the first bottle (22:20)
 end:23*60+30,            // the set goes off; he goes aboard Shiosai
 collect:6*60,            // the Higas' van: last night's empties go, a crate comes
 min:3,max:6,             // bottles an evening
 glassesPerBottle:3,      // a large bottle fills his small glass three times
 pour:.1,                 // minutes a pour takes (six seconds)
 crate:20,                // large bottles to a crate
 signOff:23*60+20,        // the last station signs off; snow after
});

/** A repeatable number in [0, 1) for any whole numbers. */
export function seeded(...keys){
 let h=2166136261;
 for(const k of keys){h^=(k|0)+0x9e3779b9;h=Math.imul(h,16777619);h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;}
 return (h>>>0)/4294967296;
}

const local=m=>((m%1440)+1440)%1440,dayOf=m=>Math.floor(m/1440);

/** How many bottles he gets through on a given evening (three to six). */
export function bottlesFor(day){const D=FUJITA_DAY;return D.min+Math.floor(seeded(day,7)*(D.max-D.min+1));}

/** What is on at this hour of the evening, and how much he likes coming back to it (1997's late schedules). */
function channelsAt(m){
 const h=m/60,list=[['variety',3],['drama',2],['cooking',1]];
 if(h<23)list.push(['baseball',6]);   // the night game's last innings, then the baseball news
 if(h>=22.5&&h<23.25)list.push(['news',3]);   // the late news
 if(h>=23)list.push(['weather',1]);   // tomorrow's weather, the last thing on
 return list;
}

/**
 * The channel on the set at `minutes` ('off' while he is on the bridge and at night, 'snow' late, when the last
 * station has signed off and he has not noticed). Each stay lasts 3 to 12 minutes.
 */
export function tvProgramme(minutes){
 const m=local(minutes),day=dayOf(minutes);
 if(m<FUJITA_DAY.start||m>=FUJITA_DAY.end)return 'off';
 if(m>=FUJITA_DAY.signOff)return 'snow';
 // Walk the day's stays from the first: each is 3 to 12 minutes long.
 let at=FUJITA_DAY.start,k=0,last='';
 for(;;){
  const len=3+Math.floor(seeded(day,k,1)*10),list=channelsAt(at).filter(([c])=>c!==last);
  let total=0;for(const [,w] of list)total+=w;
  let pick=seeded(day,k,2)*total,channel=list[0][0];
  for(const [c,w] of list){if((pick-=w)<0){channel=c;break;}}
  if(m<at+len)return channel;
  at+=len;k++;last=channel;
 }
}

/** How likely a 30-second stretch of each channel is to get a laugh out of him. */
const FUNNY=Object.freeze({variety:.6,cartoon:.65,baseball:.22,sumo:.15,cooking:.12,drama:.06,weather:.04,news:.03,snow:0,off:0});

/** Is he laughing at `minutes`? Laughs last two seconds and land somewhere in each half-minute. */
export function laughingAt(minutes,tipsy=0){
 const programme=tvProgramme(minutes);if(programme==='off')return false;
 const s=minutes*60,slot=Math.floor(s/30),day=dayOf(minutes);
 const chance=Math.min(.9,FUNNY[programme]*(1+tipsy*.15));
 if(seeded(day,slot,3)>=chance)return false;
 const at=slot*30+seeded(day,slot,4)*27;
 return s>=at&&s<at+2.2;
}

/**
 * Where he is with the beer at `minutes`.
 *   phase   'doze' (night), 'waiting' (the van has been; he is sober, on the bridge or about to be), 'pour', 'drink'
 *   glass   how full his glass is, 0..1
 *   bottle  how much is left in the bottle he is on, 0..1 (null when he has none open)
 *   pouring how far through a pour, 0..1 (null otherwise)
 *   empties bottles on the floor round him
 *   full    bottles still in the crates
 *   bottles the day's number
 *   tipsy   0..3, how merry he is
 */
export function fujitaBeer(minutes){
 const D=FUJITA_DAY,m=local(minutes),day=dayOf(minutes);
 // After midnight: yesterday's pile is still round him until the van comes at six.
 if(m<D.collect){const n=bottlesFor(day-1);return {phase:'doze',glass:0,bottle:null,pouring:null,empties:n,full:0,bottles:n,tipsy:3};}
 const n=bottlesFor(day),glasses=n*D.glassesPerBottle;
 if(m<D.start)return {phase:'waiting',glass:0,bottle:null,pouring:null,empties:0,full:n,bottles:n,tipsy:0};
 if(m>=D.end)return {phase:'doze',glass:0,bottle:null,pouring:null,empties:n,full:0,bottles:n,tipsy:3};
 const slot=(D.end-D.start)/glasses,k=Math.min(glasses-1,Math.floor((m-D.start)/slot)),t=m-D.start-k*slot;
 const pouring=t<D.pour?t/D.pour:null,poured=k+(pouring===null?1:pouring);
 // The glass: filling while he pours, then down sip by sip, empty a little before the next pour.
 const glass=pouring!==null?pouring:Math.max(0,1-(t-D.pour)/((slot-D.pour)*.85));
 // A bottle goes to the floor the moment its third glass is poured.
 const empties=Math.floor(poured/D.glassesPerBottle+1e-9),open=Math.floor(k/D.glassesPerBottle);
 const bottle=empties>open?null:1-(poured-open*D.glassesPerBottle)/D.glassesPerBottle;
 return {phase:pouring!==null?'pour':'drink',glass,bottle,pouring,empties,full:n-empties-(bottle===null?0:1),bottles:n,tipsy:Math.min(3,empties/2)};
}
