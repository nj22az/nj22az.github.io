/**
 * Mr Fujita's day in his shed, as a pure function of the town clock: what is on the
 * set, whether he is laughing at it, and where he is with the beer.
 *
 * The television. He has the remote and no patience: every few minutes he flips to
 * another channel, from what is on at that hour (the ballgame only in the afternoon,
 * which he keeps coming back to; the news at noon and at seven; the cartoons in the
 * morning; the variety shows, the period drama, the cooking and the sumo the rest of
 * the day). Where he lands is seeded by the day and the minute, so it is the same for
 * everybody who walks past, and testable.
 *
 * The laughing. A variety show or a cartoon gets a laugh out of him every half a minute
 * or so; the ballgame now and then (a home run, a bad call); the news and the drama
 * hardly ever. The more he has had, the easier he laughs.
 *
 * The beer. Umineko lager in the large returnable bottles, from Higa Liquor (see
 * commerce/merchandising.js ACCOUNTS['higa-saketen']['fujita-shed']): the Higas' van stops at the
 * pier root at six every morning, leaves the day's crates and takes yesterday's empties
 * back, so the pile round his chair is gone when he sits down at half past six and grows
 * all day: he never puts an empty back in the crate, he stands it on the floor, or lays
 * it down when the floor gets full. He drinks between 24 and 49 bottles a day (the day
 * decides), from a small glass he fills three times a bottle, pouring with his left hand
 * without getting out of the chair. A glass goes down sip by sip; when it is empty he
 * pours the next. After the set goes off at half past eleven he dozes among the empties
 * until the van comes.
 */

export const FUJITA_DAY=Object.freeze({
 start:6*60+30,           // he sits down with the first bottle
 end:23*60+30,            // the set goes off; he dozes
 collect:6*60,            // the Higas' van: yesterday's empties go, the day's crates come
 min:24,max:49,           // bottles a day
 glassesPerBottle:3,      // a large bottle fills his small glass three times
 pour:.1,                 // minutes a pour takes (six seconds)
 crate:20,                // large bottles to a crate
});

/** A repeatable number in [0, 1) for any whole numbers. */
export function seeded(...keys){
 let h=2166136261;
 for(const k of keys){h^=(k|0)+0x9e3779b9;h=Math.imul(h,16777619);h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;}
 return (h>>>0)/4294967296;
}

const local=m=>((m%1440)+1440)%1440,dayOf=m=>Math.floor(m/1440);

/** How many bottles he gets through on a given day (24 to 49). */
export function bottlesFor(day){const D=FUJITA_DAY;return D.min+Math.floor(seeded(day,7)*(D.max-D.min+1));}

/** What is on at this hour, and how much he likes coming back to it. */
function channelsAt(m){
 const h=m/60,list=[['variety',3],['drama',2],['cooking',1]];
 if(h<10)list.push(['cartoon',3],['weather',1]);
 if(h>=12&&h<12.4)list.push(['news',3]);
 if(h>=13&&h<18)list.push(['baseball',6]);
 if(h>=15&&h<18)list.push(['sumo',2]);
 if(h>=19&&h<19.75)list.push(['news',4]);
 return list;
}

/**
 * The channel on the set at `minutes` ('off' at night, 'snow' late, when the last station
 * has signed off and he has not noticed). Each stay lasts 3 to 12 minutes.
 */
export function tvProgramme(minutes){
 const m=local(minutes),day=dayOf(minutes);
 if(m<FUJITA_DAY.start||m>=FUJITA_DAY.end)return 'off';
 if(m>=22*60+50)return 'snow';
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
 *   phase   'doze' (night), 'waiting' (the van has been; he has not sat down), 'pour', 'drink'
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
 return {phase:pouring!==null?'pour':'drink',glass,bottle,pouring,empties,full:n-empties-(bottle===null?0:1),bottles:n,tipsy:Math.min(3,empties/14)};
}
