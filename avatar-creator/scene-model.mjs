import {normalLook} from '../johansson-town/src/render/looks.js?v=20261023-print-media';
import {normalizeTake} from './acting/takes.mjs';
import {KNOWN_POSES,KNOWN_EXPRESSIONS} from './scene-catalogue.mjs?v=20261020-acting';
import {SNAP} from './scene-snap.mjs?v=20261011-2';
export const SCENE_KEY='nj-studio-scene-v1';
export const MAX_ACTORS=6;
export const MAX_PANELS=4;
export const LOCATIONS=Object.freeze([
 ['fujita-shed','Fujita’s television shed'],['sakura','Sakura Shōten'],['sakura-street','Outside Sakura'],['minato','Minato Izakaya'],
 ['dock-workshop','Chin & Tetsuo Repairs'],['sato-ramen','Sato Ramen'],['books','Front-Row Books'],['onsen','Umi-no-yu lobby'],
 ['classroom','Island classroom'],['town-hall','Mayor’s office'],['harbour','Harbour'],['pier','Outer pier'],
 ['park','Harbour Park'],['garden','Japanese garden'],['rainflower','Rainflower Lane']
]);
// Poses and faces are World's own lists (scene-catalogue.mjs); a saved scene keeps any pose or face World knows.
export {POSES,EXPRESSIONS} from './scene-catalogue.mjs?v=20261020-acting';
const clamp=(v,lo,hi,fallback)=>Number.isFinite(Number(v))?Math.min(hi,Math.max(lo,Number(v))):fallback;
export const text=v=>Array.from(String(v??'').replace(/[\u0000-\u001f]/g,' ')).slice(0,120).join('');
export function emptyScene(){return {version:2,location:'harbour',format:'landscape',style:'photo',look:'none',top:'',bottom:'',camera:{orbit:0,elevation:0,zoom:1},actors:[]};}
export function normalizeScene(raw,normalizeRecipe=r=>structuredClone(r)){
 const out=emptyScene();if(!raw||![1,2].includes(raw.version))return out;
 out.location=LOCATIONS.some(([id])=>id===raw.location)?raw.location:out.location;
 out.look=normalLook(raw.look);
 out.format=['landscape','square','portrait'].includes(raw.format)?raw.format:out.format;
 out.style=['photo','meme','comic'].includes(raw.style)?raw.style:out.style;
 out.camera={orbit:clamp(raw.camera?.orbit,-180,180,0),elevation:clamp(raw.camera?.elevation,-25,40,0),zoom:clamp(raw.camera?.zoom,.55,1.8,1)};
 if(raw.exitLabel!==undefined)out.exitLabel=text(raw.exitLabel).slice(0,24);
 out.time=clamp(raw.time,0,60,0);if(['paper','hero'].includes(raw.backdrop))out.backdrop=raw.backdrop;if(raw.television==='football')out.television='football';
 out.top=text(raw.top);out.bottom=text(raw.bottom);
 if([raw.camera?.position,raw.camera?.target].every(v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=30))){out.camera.position=[...raw.camera.position];out.camera.target=[...raw.camera.target];out.camera.fov=clamp(raw.camera.fov,25,75,43);}
 if(['dash','chaos','escape'].includes(raw.effect))out.effect=raw.effect;
 if(raw.furniture&&typeof raw.furniture==='object'){out.furniture={};for(const id of ['desk','chair']){const r=raw.furniture[id];if(!r||typeof r!=='object')continue;const o={visible:r.visible!==false,size:clamp(r.size,.5,1.5,1)};for(const k of ['position','rotation'])if(Array.isArray(r[k])&&r[k].length===3&&r[k].every(Number.isFinite))o[k]=r[k].map(n=>clamp(n,k==='position'?-4:-Math.PI,k==='position'?4:Math.PI,0));out.furniture[id]=o;}}

 out.actors=(Array.isArray(raw.actors)?raw.actors:[]).slice(0,MAX_ACTORS).filter(a=>a&&a.recipe&&typeof a.recipe==='object'&&!Array.isArray(a.recipe)).map((a,i)=>({
  id:'actor-'+i,...(a.heldItem==='beer'?{heldItem:'beer'}:{}),name:text(a.name)||'Character',recipe:normalizeRecipe(a.recipe),
  y:clamp(a.y,0,1.5,0),liftedBy:typeof a.liftedBy==='string'?a.liftedBy:'',
  x:raw.version===2?clamp(a.x,-SNAP.bounds,SNAP.bounds,0):i*.65,z:raw.version===2?clamp(a.z,-SNAP.bounds,SNAP.bounds,0):0,size:raw.version===2?clamp(a.size,.6,1.4,1):1,seat:raw.version===2?text(a.seat):'',
  turn:clamp(a.turn,-180,180,0),pose:KNOWN_POSES.has(a.pose)?a.pose:'Idle',
  expression:KNOWN_EXPRESSIONS.has(a.expression)?a.expression:'smile',speech:text(a.speech),speechStyle:['shout','large'].includes(a.speechStyle)?a.speechStyle:'bubble',...a.take?{take:safeTake(a.take),takeLoop:a.takeLoop===true}:{}
 }));
 const source=(Array.isArray(raw.actors)?raw.actors:[]).filter(a=>a&&a.recipe&&typeof a.recipe==='object'&&!Array.isArray(a.recipe)).slice(0,MAX_ACTORS);
 const ids=new Map(source.map((a,i)=>[a.id,'actor-'+i])),used=new Set();
 for(const a of out.actors){a.liftedBy=ids.get(a.liftedBy)||'';if(a.liftedBy===a.id||used.has(a.liftedBy)||out.actors.find(b=>b.id===a.liftedBy)?.liftedBy){a.liftedBy='';}if(a.liftedBy)used.add(a.liftedBy);}
 return out;
}
export function addCharacter(state,recipe,name=recipe.name||'Character'){
 if(state.actors.length>=MAX_ACTORS)return null;
 const n=state.actors.length,actor={id:'actor-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name:text(name),recipe:structuredClone(recipe),x:(n%3)*.7,z:Math.floor(n/3)*.8,size:1,y:0,liftedBy:'',seat:'',turn:0,pose:'Idle',expression:'smile',speech:''};
 state.actors.push(actor);return actor;
}
/** Take a character out of the scene; returns what Undo needs ({actor,index}), or null. */
export function removeCharacter(state,id){
 const index=state.actors.findIndex(a=>a.id===id);if(index<0)return null;
 const [actor]=state.actors.splice(index,1);return {actor,index};
}
/** Undo a removal: the same character back in its place in the cast (its seat only if still free). */
export function restoreCharacter(state,removed){
 if(!removed?.actor||state.actors.length>=MAX_ACTORS||state.actors.some(a=>a.id===removed.actor.id))return null;
 const actor=removed.actor;if(actor.seat&&state.actors.some(a=>a.seat===actor.seat)){actor.seat='';if(actor.pose==='Sit')actor.pose='Idle';}
 state.actors.splice(Math.min(removed.index,state.actors.length),0,actor);return actor;
}
export function moveCharacter(actor,x,z){actor.x=clamp(x,-SNAP.bounds,SNAP.bounds,actor.x);actor.z=clamp(z,-SNAP.bounds,SNAP.bounds,actor.z);}
/** Where a character is and how they stand: what Undo puts back. */
export function placementOf(actor){return {x:actor.x,z:actor.z,seat:actor.seat||'',turn:actor.turn,pose:actor.pose,size:actor.size,...actor.y?{y:actor.y}:{},...actor.liftedBy?{liftedBy:actor.liftedBy}:{}};}
export function samePlacement(a,b){return !!a&&!!b&&['x','z','seat','turn','pose','size','y','liftedBy'].every(k=>a[k]===b[k]);}
/** Put a character back where `placement` says; their seat only if nobody has taken it since (then a Sit becomes Idle). */
export function applyPlacement(state,id,placement){
 const actor=state.actors.find(a=>a.id===id);if(!actor||!placement)return null;
 Object.assign(actor,{x:placement.x,z:placement.z,turn:placement.turn,pose:placement.pose,size:placement.size,y:placement.y||0,liftedBy:placement.liftedBy||'',seat:placement.seat||''});
 if(actor.seat&&state.actors.some(a=>a!==actor&&a.seat===actor.seat)){actor.seat='';if(actor.pose==='Sit')actor.pose='Idle';}
 return actor;
}
export function panelOrder(panels,index,delta){const to=index+delta;if(to<0||to>=panels.length)return;[panels[index],panels[to]]=[panels[to],panels[index]];}

function safeTake(raw){try{return normalizeTake(raw);}catch{return null;}}
