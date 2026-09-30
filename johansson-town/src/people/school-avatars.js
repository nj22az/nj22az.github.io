import * as THREE from '../../vendor/three.module.js';
import {buildAvatar} from '../avatars/build.js';
import {createAvatarAnimator} from '../avatars/animate.js';
import {normalizeRecipe} from '../avatars/recipe.js';

/**
 * The children of the 5・6年 class and their teacher, as Shimanchu like everyone else in
 * town -- built from recipes, animated by the same animator -- behind the interface the
 * classroom already used for its placeholder figures: buildFigure, setPose and
 * animateFigure. A figure faces +z in its own frame; the classroom turns it.
 *
 * Each person is one avatar, used for both sitting and standing: the pose decides
 * whether it sits. The lunch squad's smock and cap are a second recipe.
 */
const hex=n=>'#'+(n>>>0).toString(16).padStart(6,'0').slice(-6);
const seeded=text=>{let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>((h=Math.imul(h^h>>>15,2246822507)^Math.imul(h^h>>>13,3266489909))>>>0)/4294967296;};
const pick=(r,list)=>list[Math.floor(r()*list.length)];

/** A child's recipe from their line on the class list: small, round-headed, bright. */
export function pupilRecipe({name='',girl=false,shirt=0x5f86b5,bottom=0x2d3a52,hair=0x1c1714,skin=0xd9a57c,toe=0x3f6fb0,smock=false}){
 const r=seeded(name);
 return normalizeRecipe({name,
  body:{height:.02+r()*.1,build:.3+r()*.25,skin:hex(skin)},
  head:{size:.62+r()*.12,shape:.45+r()*.2,form:pick(r,['round','oval','heart']),jaw:.25+r()*.2,cheeks:.55+r()*.3},
  hair:{style:girl?pick(r,['bob','ponytail','braids','bun']):pick(r,['crop','spiky','sidepart','buzz']),colour:hex(hair),flip:r()<.5},
  eyes:{style:pick(r,['round','sparkle','gentle','dot']),colour:'#2a1d16',size:.55+r()*.25},
  brows:{style:pick(r,['straight','arched','thin']),colour:hex(hair),size:.4},
  nose:{style:pick(r,['button','dot']),size:.3},
  mouth:{style:pick(r,['smile','grin','small']),colour:'#b8544a',size:.45},
  blush:.35+r()*.2,
  outfit:{top:smock?'smock':'tee',topColour:smock?'#f6f5f0':hex(shirt),bottom:girl&&r()<.5?'skirt':'shorts',bottomColour:hex(bottom),
   shoes:'#f1efe8',hat:smock?'kerchief':'none',hatColour:'#f6f5f0',accent:hex(toe)},
 });
}
/** Yonamine-sensei: the fifth-and-sixth-grade teacher, in a cream blouse and a navy skirt. */
export const TEACHER_RECIPE=normalizeRecipe({name:'Yonamine-sensei',body:{height:.36,build:.45,skin:'#d6a07a'},head:{size:.5,shape:.48,form:'oval',jaw:.4,cheeks:.45},
 hair:{style:'bob',colour:'#241a14'},eyes:{style:'gentle',colour:'#2a1d16',size:.5},brows:{style:'arched',colour:'#241a14',size:.45},
 nose:{style:'line',size:.4},mouth:{style:'smile',colour:'#b8544a',size:.45},glasses:{style:'square',colour:'#3b3f45'},blush:.2,
 outfit:{top:'blouse',topColour:'#e9e4d6',bottom:'longskirt',bottomColour:'#3a4a5e',shoes:'#3a2a1e',accent:'#f4f1ea'}});

// Sitting at the desk, eating, drinking; ladling and sweeping; pointing at the board.
const SEATED=new Set(['desk','eat','drink']);
const POSE={desk:'Type',eat:'Eat',drink:'Drink',serve:'Interact',sweep:'Interact',point:null,stand:null};

/**
 * @param {object} spec as the placeholder figures took it: pose, shirt, bottom, hair,
 * skin, girl, adult, smock, toe, name.
 */
export function buildFigure(spec={}){
 const root=new THREE.Group();root.name=spec.name||'Pupil';root.userData.dynamicProp=true;
 // Faces are painted on a canvas, so without a page (the room tests) the figure is empty.
 if(typeof document!=='undefined'&&document.createElement){
  const avatar=buildAvatar(spec.adult?TEACHER_RECIPE:pupilRecipe(spec),{shadows:true,faceSize:128});
  avatar.root.rotation.y=0; // face +z, as the classroom expects
  root.add(avatar.root);
  root.userData.figure={avatar,animator:createAvatarAnimator(avatar),pose:spec.pose==='standing'?'stand':'desk',last:null,pointAt:0};
 }
 return root;
}

export function setPose(figure,pose){const f=figure.userData.figure;if(f)f.pose=pose;}

/** Once a frame: into the pose, with the small life the animator gives everybody. */
export function animateFigure(figure,time,seed=0){
 const f=figure.userData.figure;if(!f)return;
 const dt=f.last==null?0:Math.max(0,Math.min(.1,time-f.last));f.last=time;if(!dt&&f.started)return;f.started=true;
 if(f.pose==='point'&&time>f.pointAt){f.animator.play('Point');f.pointAt=time+6+(seed%3);}
 f.animator.update(dt,{speed:0,seated:SEATED.has(f.pose),seatHeight:f.avatar.recipe.name==='Yonamine-sensei'?.42:.4,pose:POSE[f.pose]??undefined,
  expression:f.pose==='eat'?'smile':'neutral'});
}
