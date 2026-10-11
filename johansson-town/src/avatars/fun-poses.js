/**
 * Funny poses for comics, memes and the scene builders (the creator, 2026-10-11: "And add more poses and funny
 * expressions"): the body of a joke, held long enough to read. One list for the whole of Johansson World: the animator plays
 * them as moves (animate.js GESTURES), World's photo studio and Johansson Studio's Build scene offer them as poses (a still
 * taken at STILL_AT of the move, at its peak), and the storyteller picks them by `use`.
 *
 * Each pose: `label` (a short name for a menu), `use` (when to pick it: what has just happened in the story), `face` (the
 * expression it goes with: face.js EXPRESSION_NAMES), `d` (how long it lasts as a move, in seconds; held moves last until the
 * next), `ramp` (how long it takes to come and to go, in seconds, or [in, out]: half a second unless said), `airborne` (it
 * leaves the floor: the feet are not held to it) and its body (`play`). Each comes from however the body was standing (its
 * hands behind its back, in its pockets) and goes back to it. A hand that goes to the head (a cheek, the brow, the face, the
 * crown) is placed by the animator on this body's own head (`reach`: animate.js REACH, solved once per body: the whole mitten
 * clear of the head and the hair by `cover`; a big head on short arms is reached as near as they go, never into it); the
 * rest is written as joint angles (animate.js: x swings a limb forward when negative, a knee or elbow folds when positive; z
 * lifts a shoulder out to its side, left positive). Family-friendly and of the 1990s: no pose belongs to anyone's franchise.
 */
export const STILL_AT=.43;
const smooth=x=>{x=Math.min(1,Math.max(0,x));return x*x*(3-2*x);};
/** 0 → 1 between a and b, eased. */
const between=(t,a,b)=>smooth((t-a)/(b-a));
const clamp01=x=>Math.min(1,Math.max(0,x));

/** The legs a little bent and the knees turned in (weak at the knees; shy), written for both sides. */
const kneesIn=(P,w,bend=.22,inward=.07)=>{for(const [s,k] of [['L',1],['R',-1]]){P.toward('thigh'+s,-bend*.6,0,-k*inward,w);P.toward('knee'+s,bend,0,0,w);P.toward('foot'+s,-bend*.4,0,k*inward,w);}};
/** The left mitten on the hip, the elbow out (HandsOnHips' left arm). */
const handOnHip=(P,w)=>{P.toward('shoulderL',.15,0,.75,w);P.toward('elbowL',-.3,0,-1.5,w);};
/** Both hands where `reach` put them. */
const both=(P,A,w)=>{if(A.R)P.armTo('R',A.R,w,A.handR);if(A.L)P.armTo('L',A.L,w,A.handL);};

export const FUN_POSES=Object.freeze({
 JawDrop:Object.freeze({label:'Jaw drop',face:'gobsmacked',d:2.6,ramp:.8,
  use:'Shock at something unbelievable: both mittens on the cheeks, leaning back, the knees gone weak.',
  reach:{hair:true,head:[-.12,0,0],R:{cover:true,head:[-.82,-.38,.42,.035],seed:[-.55,.6,-1.58,-1.92,.6],hand:[0,0,0]}},
  play(P){const {w,t}=P;both(P,P.reach(),w);P.toward('chest',-.12,0,0,w);P.add('head',-.12*w+Math.sin(t*31)*.004*w);kneesIn(P,w,.24,.06);}}),
 Facepalm:Object.freeze({label:'Facepalm',face:'dry',d:2.6,ramp:.8,
  use:'Someone has done something silly (or you have): one mitten over the eyes, the head bowed into it, the other on the hip.',
  reach:{hair:true,head:[.26,0,-.1],only:'R',R:{cover:true,head:[-.12,.18,1,.035],seed:[-1.55,.72,-.72,-1.9,0],hand:[0,0,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);handOnHip(P,w);P.toward('chest',.1,0,0,w);P.add('head',.26*w,0,-.1*w);}}),
 OhNo:Object.freeze({label:'Oh no!',face:'shock',d:2.6,ramp:.8,
  use:'Disaster: both mittens clapped to the head, the elbows out, crouching a little: it has all gone wrong.',
  reach:{hair:true,head:[.1,0,0],R:{cover:.015,head:[-.7,.62,.12,.03],seed:[-2.4,.3,-.9,-1.4,0],hand:[0,0,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('chest',.08,0,0,w);P.add('head',.1*w);kneesIn(P,w,.3,0);}}),
 HideFace:Object.freeze({label:'Hide face',face:'embarrassed',d:2.8,ramp:.8,
  use:'Too embarrassed to look: both mittens over the face, the shoulders up, the knees turned in.',
  reach:{hair:true,head:[.14,0,0],R:{cover:true,head:[-.3,.02,1,.035],seed:[-1.55,.72,-.72,-1.9,0],hand:[0,0,0]}},
  play(P){const {w,t}=P;both(P,P.reach(),w);P.toward('chest',.06,0,0,w);P.add('head',.14*w);kneesIn(P,w,.2,.1);P.add('hips',0,Math.sin(t*2.2)*.05*w,0);}}),
 Shush:Object.freeze({label:'Shh!',face:'wink',d:2.6,ramp:.8,
  use:'A secret, or quiet please: a mitten held up before the lips, leaning in.',
  reach:{hair:true,head:[.06,0,0],only:'R',R:{cover:true,head:[-.04,-.4,1,.05],seed:[-1.3,.5,-.3,-2.1,0],hand:[0,-1.2,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('chest',.14,0,0,w);P.add('head',.06*w);}}),
 Salute:Object.freeze({label:'Salute',face:'focus',d:2.6,ramp:.8,
  use:'Yes, sir! Reporting for duty: the edge of the mitten at the brow, standing straight, the heels together.',
  reach:{hair:true,head:[-.05,0,0],only:'R',R:{cover:true,head:[-.6,.42,.62,.03],elbow:m=>[-(m.shoulderX+m.upper*.85),m.shoulderY,m.depth*.25],seed:[-1.1,.3,-1.3,-2.2,0],hand:[0,-1.3,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('chest',-.05,0,0,w);P.add('head',-.05*w);
   for(const s of ['L','R']){P.toward('thigh'+s,0,0,0,w);P.toward('knee'+s,0,0,0,w);P.toward('foot'+s,0,0,0,w);}}}),
 Swoon:Object.freeze({label:'Swoon',face:'daze',d:3,ramp:.8,
  use:'The dramatic swoon (oh my!): the back of a mitten to the brow, leaning back, the other arm flung out behind.',
  reach:{hair:true,head:[-.26,0,.14],only:'R',R:{cover:true,head:[-.25,.48,.85,.045],seed:[-2,.6,-.9,-1.9,0],hand:[0,1.6,0]}},
  play(P){const {w}=P;both(P,P.reach(),w);P.toward('shoulderL',.5,0,1.1,w);P.toward('elbowL',-.25,0,0,w);P.toward('chest',-.22,0,.06,w);P.add('head',-.26*w,0,.14*w);
   P.toward('thighR',-.25,0,0,w);P.toward('kneeR',.55,0,0,w);P.toward('footR',-.3,0,0,w);}}),
 Flex:Object.freeze({label:'Flex',face:'smug',d:2.6,
  use:'Showing off how strong you are: both arms up and bent, the fists by the ears, the chest out.',
  play(P){const {w,t}=P,pump=Math.sin(t*5)*.06*w;
   P.armTo('R',[-.25,0,-1.45,0],w);P.armTo('L',[-.25,0,-1.45,0],w);P.toward('elbowR',0,0,-1.9-pump,w);P.toward('elbowL',0,0,1.9+pump,w);
   P.toward('chest',-.12,0,0,w);P.add('head',-.08*w);for(const [s,k] of [['L',1],['R',-1]]){P.toward('thigh'+s,0,0,k*.12,w);P.toward('foot'+s,0,0,-k*.12,w);}}}),
 PointLaugh:Object.freeze({label:'Point and laugh',face:'laugh',d:2.8,
  use:'Somebody else’s mishap is just too funny: pointing at them, the other mitten on the belly, rocking back.',
  play(P){const {w,t}=P,rock=Math.abs(Math.sin(t*7))*w;
   P.armTo('R',[-1.45,0,-.12,-.05],w);P.armTo('L',[-.45,0,.25,-1.7],w);P.toward('handL',.2,0,0,w);
   P.toward('chest',-.16-.06*rock,0,0,w);P.add('head',(-.22-.06*rock)*w);P.toward('thighL',-.2,0,0,w);P.toward('kneeL',.4,0,0,w);P.toward('footL',-.2,0,0,w);
   return {root:.006*rock};}}),
 FistPump:Object.freeze({label:'Yes!',face:'excited',d:1.6,ramp:[.2,.7],
  use:'Victory, it worked: a fist punched up at the sky, the other pulled down to the hip, a knee up.',
  // (the fist up beside the head and above it, the arm clear of the head and its hair: big heads, short arms)
  reach:{hair:true,head:[-.16,0,0],only:'R',R:{at:m=>[-(m.Rh*m.headSX*.8+m.hand),m.headCentre+m.Rh*m.headSY*1.05,.04*m.k],upper:true,seed:[-2.9,.1,-.35,-.1,0],hand:[0,0,0]}},
  play(P){const {w,t}=P,wind=between(t,0,.25)*(1-between(t,.28,.64)),up=between(t,.28,.64),A=P.reach();
   P.armTo('R',[.3*wind,0,-.2,-1.5*wind,0].map((v,i)=>v+((A.R[i]??0)-v)*up),w);P.armTo('L',[.25*wind+.3*up,0,.25+.1*up,-1.2*wind-1.45*up],w);
   P.toward('chest',.15*wind-.12*up,0,0,w);P.add('head',(.05*wind-.16*up)*w);
   for(const s of ['L','R']){P.toward('thigh'+s,-.35*wind,0,0,w);P.toward('knee'+s,.6*wind,0,0,w);P.toward('foot'+s,-.25*wind,0,0,w);}
   P.toward('thighL',-.35*wind-1.1*up,0,0,w);P.toward('kneeL',.6*wind+1.5*up,0,0,w);P.toward('footL',-.25*wind+.3*up,0,0,w);}}),
 JumpForJoy:Object.freeze({label:'Jump for joy',face:'excited',d:1.3,airborne:true,
  use:'The good news lands: up in the air, both arms up, the heels kicked up behind.',
  play(P){const {t,m}=P,crouch=between(t,0,.22)*(1-between(t,.22,.32))+between(t,.84,.95)*(1-between(t,1,1.25)),air=between(t,.24,.44)*(1-between(t,.72,.9));
   const h=Math.max(0,Math.sin(Math.PI*clamp01((t-.3)/.55)))*.32*m.k;
   P.armTo('R',[.45*crouch-.2*air,0,-.2-2*air,-.3],1);P.armTo('L',[.45*crouch-.2*air,0,-.2-2*air,-.3],1);
   for(const s of ['L','R']){P.set('thigh'+s,-.45*crouch-.25*air);P.set('knee'+s,.85*crouch+1.5*air);P.set('foot'+s,-.4*crouch+.3*air);}
   P.add('chest',.2*crouch-.1*air);P.add('head',-.12*air);return {root:h};}}),
 StartledJump:Object.freeze({label:'Startled',face:'shock',d:1.4,airborne:true,
  use:'Boo! A jump off the ground, leaning back from the fright, the arms flung up, a knee up.',
  play(P){const {t,m}=P,up=between(t,0,.3)*(1-between(t,.95,1.3)),air=Math.max(0,Math.sin(Math.PI*clamp01((t-.08)/.85)));
   P.armTo('R',[-.7,0,-1.9,-.9],up);P.armTo('L',[-.7,0,-1.9,-.9],up);
   P.toward('chest',-.28,0,0,up);P.add('head',-.16*up);P.toward('thighL',-1,0,0,up);P.toward('kneeL',1.4,0,0,up);P.toward('footL',.3,0,0,up);
   return {root:air*.12*m.k};}}),
 Sneak:Object.freeze({label:'Sneak',face:'scheme',d:Infinity,
  use:'Tiptoeing past someone: crouched on the toes, the mittens up like paws, looking sideways.',
  play(P){const {w,t}=P,bob=Math.sin(t*3)*.03*w;
   P.armTo('R',[-1.15,0,-.22,-1.75],w,[.9,0,0]);P.armTo('L',[-1.15,0,-.22,-1.75],w,[.9,0,0]);
   P.toward('chest',.36,0,0,w);P.add('neck',-.14*w);P.add('head',-.1*w,.42*w,0);
   P.toward('thighL',-.8-bob,0,.04,w);P.toward('kneeL',1.1,0,0,w);P.toward('footL',.5,0,-.04,w);
   P.toward('thighR',-.2+bob,0,-.04,w);P.toward('kneeR',.95,0,0,w);P.toward('footR',.55,0,.04,w);}}),
});
