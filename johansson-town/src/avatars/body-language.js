import {personalityOf,dialStep,DIAL_STEPS} from './personality.js';

/**
 * How each of the sixteen island personalities carries itself (personality.js). Every
 * islander uses the same moves (animate.js); who they are decides which ones, and how
 * often:
 *
 *   feel   the move a feeling brings with it: a Festival friend kicks up a heel when
 *          she is happy, a Lighthouse keeper only nods.
 *   idle   what they do with themselves standing about: a stretch, a look round, hands
 *          on hips, a little heart for nobody in particular.
 *   talk   what their hands do as they start to say something.
 *
 * Moves are names from animate.js GESTURES. Lists repeat a move to make it likelier.
 */
const STYLE=Object.freeze({
 'Lighthouse keeper':{feel:{happy:'Nod',laugh:'Nod',shy:'Bow'},idle:['LookAround','LookAround','Think'],talk:['Nod','Think']},
 'Porch sitter':     {feel:{happy:'Nod',laugh:'Laugh',shy:'Fidget'},idle:['Stretch','LookAround'],talk:['Nod','Talk']},
 'Old storyteller':  {feel:{happy:'Clap',laugh:'Laugh',shy:'Fidget'},idle:['Think','LookAround'],talk:['Talk','Talk','Point','Clap']},
 'Cloud watcher':    {feel:{happy:'Heart',laugh:'Laugh',shy:'Coy'},idle:['Stretch','LookAround','Coy'],talk:['Coy','Heart','Talk']},
 'Quiet craftsman':  {feel:{happy:'Nod',laugh:'Nod',shy:'Shrug'},idle:['HandsOnHips','Think'],talk:['Nod','Shrug']},
 'Easy neighbour':   {feel:{happy:'Laugh',laugh:'Laugh',shy:'Shrug'},idle:['Stretch','HandsOnHips'],talk:['Shrug','Talk','Laugh']},
 'Big heart':        {feel:{happy:'Heart',laugh:'Laugh',shy:'Fidget',sad:'Slump'},idle:['Heart','Clap','HandsOnHips'],talk:['Heart','Talk','Laugh']},
 'Wanderer':         {feel:{happy:'Tada',laugh:'Laugh',shy:'Shrug'},idle:['Stretch','Kachashi','LookAround'],talk:['Shrug','Laugh','Peace']},
 'Timekeeper':       {feel:{happy:'Bow',laugh:'Nod',shy:'Bow'},idle:['HandsOnHips','LookAround'],talk:['Bow','Nod','Point']},
 'Helping hand':     {feel:{happy:'Clap',laugh:'Laugh',shy:'Fidget'},idle:['Wave','HandsOnHips'],talk:['Nod','Clap','Point']},
 'Rising star':      {feel:{happy:'Peace',laugh:'Laugh',shy:'Coy'},idle:['Peace','Coy','HeelKick'],talk:['Peace','Coy','Heart']},
 'Festival friend':  {feel:{happy:'HeelKick',laugh:'Laugh',shy:'Coy'},idle:['Heart','HeelKick','Kachashi'],talk:['Heart','Peace','Clap']},
 'Straight shooter': {feel:{happy:'Nod',laugh:'Laugh',shy:'HandsOnHips'},idle:['HandsOnHips','HandsOnHips','LookAround'],talk:['Point','HandsOnHips','Nod']},
 'Joker':            {feel:{happy:'Peace',laugh:'Laugh',shy:'Shrug'},idle:['Peace','Shrug','Coy'],talk:['Peace','Laugh','Shrug']},
 'Firecracker':      {feel:{happy:'Tada',laugh:'Laugh',shy:'HandsOnHips',angry:'Stomp'},idle:['HandsOnHips','Fist','Tada'],talk:['Point','Fist','HandsOnHips']},
 'Typhoon':          {feel:{happy:'Tada',laugh:'Laugh',shy:'Coy'},idle:['Tada','Kachashi','HeelKick','Cheer'],talk:['Tada','Peace','Laugh']},
});

const lively=p=>(dialStep(p.show)-1)/(DIAL_STEPS-1),brisk=p=>(dialStep(p.pace)-1)/(DIAL_STEPS-1),frank=p=>(dialStep(p.talk)-1)/(DIAL_STEPS-1);

/**
 * The body language of a profile.
 * @returns {{type:string,feel:object,idle:string[],talk:string[],idleEvery:[number,number],talkChance:number}}
 *   idleEvery: seconds between flourishes standing about (lively, brisk people fidget
 *   more); talkChance: how often a new line comes with a move.
 */
export function bodyLanguage(profile={}){
 const type=personalityOf(profile),style=STYLE[type.name],l=lively(profile),b=brisk(profile);
 const base=34-l*20-b*6;
 return {type:type.name,feel:style.feel,idle:style.idle,talk:style.talk,
  idleEvery:[base*.6,base*1.4],talkChance:Math.min(.85,.3+l*.4+frank(profile)*.15)};
}

/** Every move any personality uses, so a test can check animate.js knows them all. */
export const BODY_LANGUAGE_MOVES=Object.freeze([...new Set(Object.values(STYLE).flatMap(s=>[...Object.values(s.feel),...s.idle,...s.talk]))]);

/**
 * The feeling in a line of dialogue, from the words, or null when it is just talk. It
 * gives the speaker the face, and with it the move, their personality has for it.
 */
export function lineFeeling(text=''){
 const t=String(text).toLowerCase();
 if(/\b(ha){2,}|\bhehe|\bahaha|\blol\b|funny|joke|laugh/.test(t))return 'laugh';
 if(/\bsorry\b|\bsad\b|\bmiss (him|her|them|it)|lonely|\balas\b|passed away|can't sleep|worried/.test(t))return 'sad';
 if(/\?!|!\?|\breally\?|\bno way\b|\bwhat\?|goodness|\bwow\b/.test(t))return 'surprised';
 if(/\b(love|wonderful|lovely|great|welcome|thank(s| you)|congratulations|happy|delicious|perfect|yay)\b|!/.test(t))return 'happy';
 if(/\bhmm+\b|\bwell\.\.\.|let me think|i wonder/.test(t))return 'thinking';
 return null;
}
