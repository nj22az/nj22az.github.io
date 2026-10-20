// The poses and faces the Studio offers come from World's own lists: animate.js (GESTURES, STORY_POSES), face.js
// (EXPRESSION_NAMES) and the moves menu (moves.js). A pose or face added to World appears here without a Studio change.
// The Studio adds only presentation: groups, short labels, and which of World's moves need a partner, a prop or their
// story, so are not offered on their own. A new World name the Studio does not know yet goes to the group "More".
import * as animate from '../johansson-town/src/avatars/animate.js';
import * as face from '../johansson-town/src/avatars/face.js';
import {MOVES} from '../johansson-town/src/avatars/moves.js';

/** Sitting poses: 'Sit' and World's seated moves, which World names Sit… (SitToast, SitEat…). */
export const seatedPose=name=>name==='SchoolRest'||name==='Sit'||/^Sit[A-Z]/.test(String(name));

const POSE_GROUP={
 everyday:['Walk','Run','Idle','Wave','Point','Bow','BowDeep','Nod','HeadShake','Shrug','Clap','Think','LookAround','Talk','Phone','Stretch','HandsOnHips','CheekRest','ScratchHead','HairTuck','ChinTap','CollarTug','HeelRock','Crouch','PickUp','Offer','Call'],
 funny:['SchoolEscape','ComicLeap','SchoolProtest','SchoolRun','LiftedBack','HoldBack','Laugh','Cheer','Tada','Heart','Peace','Coy','DoubleCheek','HeelKick','Kachashi','Fist','Hop','Gasp','Stomp','Slump','Fidget','EvilLaugh','WindUp','Sing','FanWild','FingerStop','BentStuck','CrabWalk','FrozenAbsurd','BasketHead','CordWrapped'],
};
/** World moves that do not stand on their own in a still: a fight's split second, work with a thing that is not in the
 *  picture (a shelf, a breaker, a rod, a dryer, a torch, a coin), or a body carried by others. */
const NEEDS_MORE=new Set(['Jab','JabL','Swipe','Hurt','Tackle','Jump','Drink','Eat','Shelve','HairDry','Switch','SwitchHigh',
 'FishIdle','Reel','Tape','HoldUp','HoldUpStraws','WriteAbove','PoleFlick','GrenadeCoin','CoinToCheek','CupHands','Reach','HoldOn',
 'Aim','LieKnead','KneelHug','BowWalk','Peek','BannerUp','TorchUp','TorchOff','ReachBack','ChairUncurl','CarriedBent',
 'CarriedPlank','CarryFurniture','CarryLegs']);
const POSE_LABEL={Idle:'Standing',BowDeep:'Deep bow',HeadShake:'Shake head',LookAround:'Look around',HandsOnHips:'Hands on hips',CheekRest:'Hand on cheek',
 ScratchHead:'Scratch head',HairTuck:'Tuck hair',ChinTap:'Tap chin',CollarTug:'Tug collar',HeelRock:'Rock on heels',Crouch:'Squat',
 PickUp:'Pick up',Talk:'Chat',Tada:'Ta-da!',DoubleCheek:'Both cheeks',HeelKick:'Heel kick',Kachashi:'Dance',EvilLaugh:'Evil laugh',
 WindUp:'Wind up',FanWild:'Wild fan',FingerStop:'Stop!',BentStuck:'Stuck back',CrabWalk:'Crab walk',FrozenAbsurd:'Teapot',
 BasketHead:'Basket head',CordWrapped:'Tangled',SitEnjoyFood:'Enjoy food',SitPresentFood:'Show food',SitToast:'Toast',
 SitPress:'Press',SitDrink:'Drink',SitEat:'Eat',SitRead:'Read paper'};
const EXPRESSION_GROUP={
 everyday:['neutral','smile','content','happy','laugh','calm','thinking','hope','relieved','shy','drowsy','sleep'],
 feelings:['sad','worried','dismay','angry','grumpy','embarrassed','pain','focus'],
 funny:['surprised','excited','shock','gobsmacked','starstruck','lovestruck','wink','smug','scheme','bleh','pouting','fuming','bawling','sweatdrop','blank','drooling','bliss','dizzy','daze','dry'],
};
const EXPRESSION_LABEL={neutral:'Neutral',smile:'Smile',content:'Content',happy:'Happy',laugh:'Laugh',calm:'Calm',thinking:'Thinking',
 hope:'Hopeful',relieved:'Relieved',shy:'Shy',sleep:'Asleep',sad:'Sad',worried:'Worried',dismay:'Dismayed',angry:'Angry',grumpy:'Grumpy',
 embarrassed:'Embarrassed',pain:'Ouch',focus:'Focused',surprised:'Surprised',excited:'Excited',shock:'Shocked',bliss:'Bliss',dizzy:'Dizzy',
 daze:'Dazed',scheme:'Scheming',dry:'Unimpressed'};
export const GROUP_TITLES=Object.freeze({everyday:'Everyday',funny:'Funny',sitting:'Sitting',feelings:'Feelings',more:'More'});

/** "EvilLaugh" → "Evil laugh": a readable name for a World pose the Studio has no label for yet. */
export const readable=name=>{const s=String(name).replace(/([a-z])([A-Z])/g,'$1 $2').replace(/_/g,' ').trim();return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase();};

/**
 * Groups of {name,label} from World's names. `poses` is every move World can play (gesture names; 'Idle' and 'Sit' are
 * added), `story` the story's held moves (shown only when the Studio knows they work alone), `menu` the moves menu's
 * [name,label] pairs (a label of last resort).
 */
export function poseGroups(poses,{story=new Set(),menu=[]}={}){
 const all=[...new Set(['Idle','Sit',...poses])],menuLabel=new Map(menu),known=new Set(Object.values(POSE_GROUP).flat());
 const label=n=>POSE_LABEL[n]||(menuLabel.get(n)&&menuLabel.get(n).split(' ').length<=2?menuLabel.get(n):null)||readable(n);
 const entry=n=>({name:n,label:label(n)});
 const groups={everyday:POSE_GROUP.everyday.filter(n=>all.includes(n)).map(entry),funny:POSE_GROUP.funny.filter(n=>all.includes(n)).map(entry),
  sitting:all.filter(seatedPose).map(entry),more:all.filter(n=>!known.has(n)&&!seatedPose(n)&&!NEEDS_MORE.has(n)&&!story.has(n)).map(entry)};
 return Object.entries(groups).filter(([,list])=>list.length).map(([id,list])=>({id,title:GROUP_TITLES[id],items:list}));
}
export function expressionGroups(names){
 const known=new Set(Object.values(EXPRESSION_GROUP).flat()),entry=n=>({name:n,label:EXPRESSION_LABEL[n]||readable(n)});
 const groups={...Object.fromEntries(Object.entries(EXPRESSION_GROUP).map(([id,list])=>[id,list.filter(n=>names.includes(n)).map(entry)])),more:names.filter(n=>!known.has(n)).map(entry)};
 return Object.entries(groups).filter(([,list])=>list.length).map(([id,list])=>({id,title:GROUP_TITLES[id],items:list}));
}

export const STUDIO_POSES=Object.freeze(['Walk','Run','SchoolEscape','ComicLeap','SchoolRest','SchoolProtest','SchoolRun','LiftedBack','HoldBack']);
const worldPoses=[...STUDIO_POSES,...Object.keys(animate.GESTURES||{})],worldStory=animate.STORY_POSES||new Set();
const worldFaces=[...(face.EXPRESSION_NAMES||['neutral','smile'])];
export const POSE_GROUPS=Object.freeze(poseGroups(worldPoses,{story:worldStory,menu:MOVES}));
export const EXPRESSION_GROUPS=Object.freeze(expressionGroups(worldFaces));
/** What the pickers offer, in their order. */
export const POSES=Object.freeze(POSE_GROUPS.flatMap(g=>g.items.map(i=>i.name)));
export const EXPRESSIONS=Object.freeze(EXPRESSION_GROUPS.flatMap(g=>g.items.map(i=>i.name)));
/** What a saved scene may hold: anything World can play or paint (a pose the picker no longer offers still loads). */
export const KNOWN_POSES=Object.freeze(new Set(['Idle','Sit',...worldPoses]));
export const KNOWN_EXPRESSIONS=Object.freeze(new Set(worldFaces));
export const poseLabel=name=>POSE_GROUPS.flatMap(g=>g.items).find(i=>i.name===name)?.label||POSE_LABEL[name]||readable(name);
export const expressionLabel=name=>EXPRESSION_LABEL[name]||readable(name);
