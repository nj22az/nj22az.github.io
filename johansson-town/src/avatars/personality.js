/**
 * Who someone is, not only what they look like: four dials, a voice, a birthday, a
 * favourite colour and a catchphrase, kept in the recipe's `profile`.
 *
 * The four dials each run in eight steps. Which half of each dial you are on gives one
 * of sixteen island personalities. The names and lines are the town's own.
 */

/** The dials, in order, with what each end means. */
export const DIALS=Object.freeze([
 Object.freeze({key:'pace',label:'Pace',low:'Unhurried',high:'Brisk'}),
 Object.freeze({key:'talk',label:'Talk',low:'Careful',high:'Frank'}),
 Object.freeze({key:'show',label:'Feelings',low:'Calm',high:'Lively'}),
 Object.freeze({key:'outlook',label:'Outlook',low:'Serious',high:'Easygoing'}),
]);
export const DIAL_STEPS=8;

/** The sixteen, indexed pace·talk·feelings·outlook (high = 1). */
export const PERSONALITIES=Object.freeze([
 ['Lighthouse keeper','Steady and watchful. Keeps a promise to the letter.','#3d6a8a'],
 ['Porch sitter','In no hurry at all. Always has time to listen.','#8a5a2e'],
 ['Old storyteller','Slow to start, but tells it with all their heart.','#8a4ab8'],
 ['Cloud watcher','Drifts happily along with a head full of ideas.','#7fb0d8'],
 ['Quiet craftsman','Few words, all of them meant. Does things properly.','#6d7478'],
 ['Easy neighbour','Plain-spoken and relaxed. Will lend you a ladder.','#8fbf4a'],
 ['Big heart','Laughs loudest, cries at films, says how they feel.','#e98aa6'],
 ['Wanderer','Says what they like and goes where the day takes them.','#2a8a5a'],
 ['Timekeeper','Quick, polite and composed. Has a list for everything.','#2f5f9e'],
 ['Helping hand','First to help, and pleasant about it.','#3fa0c8'],
 ['Rising star','Polished, quick and fond of an audience.','#f4d23c'],
 ['Festival friend','Everywhere at once and friends with all of it.','#e8742a'],
 ['Straight shooter','Fast and blunt. Gets it done.','#27304d'],
 ['Joker','Quick, frank, and always up to something.','#d8342c'],
 ['Firecracker','Quick to flare up, quick to laugh. Big energy.','#c8402e'],
 ['Typhoon','Never still, says everything, enjoys every minute.','#45b7f0'],
].map(([name,line,colour])=>Object.freeze({name,line,colour})));

const clamp01=v=>Math.min(1,Math.max(0,Number.isFinite(+v)?+v:.5));
/** A dial's value (0–1) as a step, 1–8. */
export const dialStep=v=>Math.min(DIAL_STEPS,1+Math.floor(clamp01(v)*DIAL_STEPS*.9999));
/** A step (1–8) back to a dial value, at the middle of its step. */
export const stepValue=step=>(Math.min(DIAL_STEPS,Math.max(1,step))-.5)/DIAL_STEPS;

/** Which of the sixteen a profile is. */
export function personalityOf(profile={}){
 const bit=key=>dialStep(profile[key])>DIAL_STEPS/2?1:0;
 return PERSONALITIES[bit('pace')*8+bit('talk')*4+bit('show')*2+bit('outlook')];
}

/** The Ryukyu scale the town's voices are pitched in (dialogue-box.js uses it too). */
const RYUKYU=[261.6,329.6,349.2,392,493.9,523.3,659.3,698.5,784,987.8,1046.5];
/**
 * A voice from the profile: the note a blip is pitched at, its timbre and how fast the
 * letters come. Lively people sing a little; frank people sound a little brighter.
 */
export function voiceOf(profile={}){
 const pitch=clamp01(profile.pitch),speed=clamp01(profile.speed);
 return {
  freq:RYUKYU[Math.round(pitch*(RYUKYU.length-1))],
  type:clamp01(profile.talk)>.62?'triangle':'sine',
  letterMs:Math.round(34-speed*20),
  swing:clamp01(profile.show)>.5?1.0595:1,
 };
}

export const MONTHS=Object.freeze(['January','February','March','April','May','June','July','August','September','October','November','December']);
const DAYS_IN=[31,29,31,30,31,30,31,31,30,31,30,31];
export const daysIn=month=>DAYS_IN[Math.min(11,Math.max(0,month-1))];
export const birthdayText=profile=>`${clampDay(profile.month,profile.day)} ${MONTHS[(profile.month||1)-1]}`;
function clampDay(month,day){return Math.min(daysIn(month||1),Math.max(1,day|0||1));}

/** What they say when they first meet you. */
export function hello(recipe){
 const name=recipe.name||'your new islander',p=recipe.profile||{},type=personalityOf(p);
 const catch_=p.catchphrase?` ${p.catchphrase}`:'';
 const opener=dialStep(p.talk)>4?`Hey! I'm ${name}.`:`Hello. My name is ${name}.`;
 const middle=dialStep(p.show)>4?' I am so happy to be here!':' Nice to meet you.';
 return `${opener}${middle}${catch_}\n\n${type.name} · born ${birthdayText(p)}`;
}
