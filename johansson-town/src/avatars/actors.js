import * as THREE from '../../vendor/three.module.js';
import {buildAvatar,measure} from './build.js';
import {createAvatarAnimator,GESTURES} from './animate.js';
import {recipeFor,CAST_RECIPES} from './cast.js';
import {normalizeRecipe,decodeRecipe,encodeRecipe} from './recipe.js';

/**
 * Where the Shimanchu meet the town: everybody the character system attaches becomes one
 * (see models.js), and the player's own third-person body is one (see game.js). The town's
 * characters are driven by flags on their entity -- a seat height, a pose, a mood, whether
 * they are speaking -- so the avatars read the same flags, and nothing that moves people
 * about had to change.
 *
 * ?classic in the address brings back the old bodies, for comparison. Outside a browser
 * (the test suite) the old bodies stay the default so their own tests keep covering them;
 * configureAvatars(true) switches over.
 */
let enabled=typeof WebGLRenderingContext!=='undefined'&&typeof location!=='undefined'&&!new URLSearchParams(location.search).has('classic');
export const avatarsEnabled=()=>enabled;
export function configureAvatars(on){enabled=!!on;}

/** The player's own recipe, as the creator saved it; Johansson's until then. */
export const PLAYER_RECIPE_KEY='johansson-town-avatar';
export function playerRecipe(storage=globalThis.localStorage){
 try{const saved=storage?.getItem(PLAYER_RECIPE_KEY);if(saved){const r=decodeRecipe(saved);if(r)return r;}}catch{}
 return CAST_RECIPES.Johansson;
}
export function savePlayerRecipe(recipe,storage=globalThis.localStorage){
 const code=encodeRecipe(recipe);try{storage?.setItem(PLAYER_RECIPE_KEY,code);}catch{}return code;
}

/**
 * Behind a counter everyone stands on a step: a counter is built for grown-up bodies,
 * and a Shimanchu's shoulders would otherwise be under it with only the head showing.
 */
export const COUNTER_STEP=.2;

const SEATED=['Wake','Sit','Type','Eat','Drink','Sleep','Soak'];

/**
 * ?avatar=<code> in the address: somebody shared an islander. It becomes the player's,
 * and the code leaves the address so a reload does not undo a later change.
 */
export function importRecipeFromURL(){
 try{
  const url=new URL(location.href),code=url.searchParams.get('avatar');if(!code)return null;
  const recipe=decodeRecipe(code);url.searchParams.delete('avatar');history.replaceState(history.state,'',url.href);
  if(recipe)savePlayerRecipe(recipe);return recipe;
 }catch{return null;}
}

/** An actor for models.js: a body built from the resident's recipe. */
export function createAvatarActor(entity,name,{shadows=false}={}){
 const recipe=recipeFor(name);
 const avatar=buildAvatar(recipe,{shadows,faceSize:name==='Thuan'?512:256});
 for(const child of entity.children)child.visible=false;
 entity.add(avatar.root);
 entity.userData.visualReady=true;entity.userData.visualSource='Shimanchu · '+(recipe.name||name);
 return {isAvatar:true,avatar,animator:createAvatarAnimator(avatar),entity,model:avatar.root,mixer:null,actions:new Map(),
  current:null,last:entity.position.clone(),gestureTime:0,speed:0,moving:false,wasVisible:true,height:avatar.height,
  isThuan:name==='Thuan',outfit:'clothes'};
}

/** Once a frame: what the flags say, into the body. */
export function updateAvatarActor(actor,dt,now=performance.now()){
 const {entity,avatar}=actor,u=entity.userData;
 let visible=true;for(let p=entity;p;p=p.parent)if(!p.visible){visible=false;break;}
 if(!visible){actor.last.copy(entity.position);actor.speed=0;actor.moving=false;actor.wasVisible=false;return;}
 const distance=Math.hypot(entity.position.x-actor.last.x,entity.position.z-actor.last.z);actor.last.copy(entity.position);
 const relocated=!actor.wasVisible||distance>1;actor.wasVisible=true;
 const measured=relocated||Number.isFinite(u.chairBlend)?0:distance/Math.max(dt,.001);
 actor.speed=THREE.MathUtils.damp(actor.speed,measured,20,dt);
 actor.moving=actor.speed>(actor.moving?.03:.07);
 actor.gestureTime=Math.max(0,actor.gestureTime-dt);
 const outfit=u.outfit||'clothes';if(actor.outfit!==outfit){avatar.wear(outfit);actor.outfit=outfit;}
 const riding=!!(u.playerControlled&&actor.isThuan);
 const seated=!riding&&(Number.isFinite(u.seatHeight)&&SEATED.includes(u.socialPose)||Number.isFinite(u.chairBlend)&&u.chairBlend>.5);
 const mood=u.thuanMood,feeling=mood&&mood.until>now?mood.expression:null;
 const engaged=!!(u.playerConversation||u.chat||actor.gestureTime);
 const sleeping=Number(u.sleepBlend)>.28||(u.sleeping&&!u.roomTransition);
 actor.animator.update(dt,{
  speed:actor.moving?actor.speed:0,running:actor.speed>3.2,seated,seatHeight:u.seatHeight,floorHeight:(Number(u.floorHeight)||0)+(u.socialPose==='CounterIdle'?COUNTER_STEP:0),
  pose:u.socialPose,seat:u.socialPose,riding,ridePhase:u.bicyclePhase||0,carrying:!!u.carrying,
  waving:!!(u.chat?.greeting||actor.gestureTime>0&&!actor.waved),
  talking:!!(u.chat?.speaking||u.speakingUntil>now),
  expression:u.thuanExpression||feeling||(engaged?'smile':'neutral'),
  sleeping,gaze:Array.isArray(u.lookTarget)?u.lookTarget:null,
 });
 if(actor.gestureTime>0)actor.waved=true;else actor.waved=false;
}

/** Eye level, for the conversation camera. */
export function avatarConversationTarget(actor,target=new THREE.Vector3()){
 const head=actor.avatar.bones.head,m=actor.avatar.measure;
 head.getWorldPosition(target);target.y+=(m.headCentre-m.headY)*.95;return target;
}

/**
 * The player's body in the third-person view, with the interface game.js already uses
 * for Johansson: play a move, speak, look, sit, hold a drink, change for the bath.
 */
export function createAvatarJohansson({scene,recipe=playerRecipe()}={}){
 const root=new THREE.Group();root.name='Johansson (third person)';root.visible=false;scene.add(root);
 let avatar=buildAvatar(recipe,{shadows:true,faceSize:512}),animator=createAvatarAnimator(avatar);
 root.add(avatar.root);
 let expression='neutral',expressionUntil=0,speakUntil=0,time=0,seatMove='Sit',outfit='clothes',held=null,lookPoint=null,move=null;
 const hand=()=>avatar.bones.handR;
 const api={
  root,loading:Promise.resolve(true),
  get ready(){return true;},get move(){return move;},get expression(){return expression;},get weights(){return {};},
  get actions(){return [...Object.keys(GESTURES),'Idle','Walk','Run','Sit','SitEat','Soak','Fall'];},
  get avatar(){return avatar;},
  play(name,{face}={}){
   move=name;if(face)api.express(face,3);
   const map={Bow:'Bow',Wave:'Wave'};if(!animator.play(map[name]||name))animator.play('Nod');
   const faces={Wave:'happy',Clap:'happy',Kachashi:'laugh',Laugh:'laugh',Think:'thinking',Shrug:'worried',HeadShake:'grumpy',Bow:'content',Nod:'content',Stretch:'content',LookAround:'surprised',SitToast:'happy'};
   if(faces[name])api.express(faces[name],(GESTURES[name]===Infinity?4:GESTURES[name]||2)+.6);
  },
  express(name,seconds=3){expression=name;expressionUntil=seconds>0?time+seconds:0;},
  speak(seconds=2){speakUntil=Math.max(speakUntil,time+seconds);},
  lookAt(point){lookPoint=point?point.clone?.()||point:null;},
  seat(name='Sit'){seatMove=name;},
  wear(name){outfit=name==='swim'?'swim':'clothes';avatar.wear(outfit);},
  get outfit(){return outfit;},
  /** Where the third-person lens pivots: above the big head and clear of it to the right. */
  get lens(){const m=avatar.measure;return {eye:m.H+.14,side:m.Rh*m.headSX+.26,head:m.headCentre};},
  /** Hip height above the feet when seated, for game.js's seat fit. */
  get sitHip(){const m=avatar.measure;return m.hipY+.09-m.seatDrop;},
  hold(prop){if(held)held.removeFromParent();held=prop||null;if(held){held.position.set(0,-avatar.measure.hand*.4,avatar.measure.hand*.6);hand().add(held);}},
  jump(){animator.play('Jump');},
  stop(){animator.stop();move=null;},
  /** Swap to a new recipe (the creator's save), keeping everything else. */
  setRecipe(next){
   const r=normalizeRecipe(next);avatar.root.removeFromParent();avatar.dispose();
   avatar=buildAvatar(r,{shadows:true,faceSize:512});animator=createAvatarAnimator(avatar);root.add(avatar.root);
   avatar.wear(outfit);if(held)hand().add(held);
  },
  update(dt,state={}){
   time+=dt;root.visible=!!state.visible;
   if(expressionUntil&&time>expressionUntil){expression='neutral';expressionUntil=0;}
   if(!animator.gesture)move=null;
   // The root sits where game.js puts it; seated, it has already been lowered to the seat.
   animator.update(dt,{speed:state.speed||0,running:!!state.running,seated:!!state.seated,
    seatHeight:state.seated?avatar.measure.hipY-avatar.measure.seatDrop:undefined,seat:seatMove,airborne:!!state.airborne,
    talking:time<speakUntil,expression,gaze:lookPoint});
   if(state.seated)avatar.root.position.y=0;
  },
 };
 return api;
}

export {measure};
