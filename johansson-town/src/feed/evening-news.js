import {townDate,townDay} from '../town-clock.js';
import {momentsOn} from '../progression/diary.js';

/**
 * The Minato Evening News, on the mayor's television from six in the evening.
 *
 * Tomodachi Life's nightly news reports what really happened on the island that day, and
 * it is a story the player did not have to write (docs/ANIMAL-CROSSING-STUDY.md, section 7).
 * Here the bulletin reads the day's moments (progression/diary.js): only the ones that
 * carry a `news` sentence, because the news speaks in its own voice, the heaviest first,
 * at most three. A day with no news gets one quiet-day item instead: small, true to the
 * town and a little absurd, and never the same one twice until they have all been used.
 *
 * Pure apart from remembering which quiet item each day used (state.news), so the same
 * evening reads the same however often the set is switched on.
 */
export const NEWS_FROM=18*60;
export const NEWS_ITEMS=3;

/** Quiet days. Each is about something that is really in the town. */
export const QUIET_NEWS=Object.freeze([
 'The harbour office reports that the tide came in this morning and went out again this afternoon. Both were on time.',
 'Tama, the cat from the quay, was seen leaving the market with a whole squid. The market says it is looking into it. Tama has not commented.',
 'Sakura Shōten’s radio played the same song twice before lunch. Staff deny singing along.',
 'A gull stood on the roof of the harbour office for most of the afternoon. Staff say it looked important.',
 'The ferry was late. Islanders were not surprised, and have asked us not to call this news.',
 'At Front-Row Books, a customer read a whole novel in the window seat without buying it. The shop is calling it a review copy.',
 'Blue Coral says its busiest hour was the one after school. The ice cream did not last.',
 'The steam from Umi-no-yu was seen from the ferry pier at dusk. Bathers report that the water was, once again, hot.',
]);

const WEEKDAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

/** Whether the set shows the news at this minute (from six until midnight). */
export const newsOn=minutes=>((minutes%1440)+1440)%1440>=NEWS_FROM;

function ensure(state){
 state.news||={days:{},quiet:[]};state.news.days||={};state.news.quiet||=[];return state.news;
}

/** Today's bulletin: {title, items:[string], quiet:boolean, text}. */
export function eveningNews(state,minutes){
 const day=townDay(minutes),{month,day:date,weekday}=townDate(minutes);
 const items=momentsOn(state,day).filter(m=>m.news).slice(0,NEWS_ITEMS).map(m=>m.news);
 let quiet=false;
 if(!items.length){
  quiet=true;
  const news=ensure(state);
  let pick=news.days[day];
  if(!QUIET_NEWS.includes(pick)){
   const fresh=QUIET_NEWS.filter(t=>!news.quiet.includes(t)),pool=fresh.length?fresh:QUIET_NEWS;
   pick=pool[day%pool.length];
   news.days[day]=pick;news.quiet=[...news.quiet.filter(t=>t!==pick),pick].slice(-QUIET_NEWS.length+1);
   for(const d of Object.keys(news.days))if(+d<day-14)delete news.days[d];
  }
  items.push(pick);
 }
 const title='Minato Evening News';
 const opening=`Good evening. This is the Minato Evening News for ${WEEKDAYS[weekday]} ${date} ${MONTHS[month-1]}.`;
 const text=[opening,...items,'That was the news. Goodnight from Minato.'].join('\n\n');
 return {title,items,quiet,text};
}

/** The saved record, cleaned: quiet items it knows, for the last fortnight of days. */
export function restoreNews(saved){
 const out={days:{},quiet:[]};if(!saved||typeof saved!=='object')return out;
 for(const [d,t] of Object.entries(saved.days||{}))if(/^\d+$/.test(d)&&QUIET_NEWS.includes(t))out.days[d]=t;
 if(Array.isArray(saved.quiet))out.quiet=saved.quiet.filter(t=>QUIET_NEWS.includes(t)).slice(-QUIET_NEWS.length);
 return out;
}
