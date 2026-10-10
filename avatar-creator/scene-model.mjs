export const SCENE_KEY='nj-studio-scene-v1';
export const MAX_ACTORS=6;
export const MAX_PANELS=4;
export const LOCATIONS=Object.freeze([
 ['sakura','Sakura Shōten'],['sakura-street','Outside Sakura'],['minato','Minato Izakaya'],
 ['sato-ramen','Sato Ramen'],['books','Front-Row Books'],['onsen','Umi-no-yu lobby'],
 ['town-hall','Mayor’s office'],['harbour','Harbour'],['pier','Outer pier'],
 ['park','Harbour Park'],['garden','Japanese garden'],['rainflower','Rainflower Lane']
]);
export const POSES=Object.freeze(['Idle','Wave','Cheer','Point','Shrug','Laugh','Think','Bow','Clap','Kachashi','Crouch','Sit','Heart','Peace','Coy','Tada','HandsOnHips','HeelKick','CheekRest','DoubleCheek']);
export const EXPRESSIONS=Object.freeze(['neutral','happy','laugh','smile','sad','angry','shy','surprised','worried','thinking','grumpy','content','sleep']);
const clamp=(v,lo,hi,fallback)=>Number.isFinite(Number(v))?Math.min(hi,Math.max(lo,Number(v))):fallback;
export const text=v=>Array.from(String(v??'').replace(/[\u0000-\u001f]/g,' ')).slice(0,120).join('');
export function emptyScene(){return {version:2,location:'harbour',format:'landscape',style:'photo',top:'',bottom:'',camera:{orbit:0,elevation:0,zoom:1},actors:[]};}
export function normalizeScene(raw,normalizeRecipe=r=>structuredClone(r)){
 const out=emptyScene();if(!raw||![1,2].includes(raw.version))return out;
 out.location=LOCATIONS.some(([id])=>id===raw.location)?raw.location:out.location;
 out.format=['landscape','square','portrait'].includes(raw.format)?raw.format:out.format;
 out.style=['photo','meme','comic'].includes(raw.style)?raw.style:out.style;
 out.camera={orbit:clamp(raw.camera?.orbit,-180,180,0),elevation:clamp(raw.camera?.elevation,-25,40,0),zoom:clamp(raw.camera?.zoom,.55,1.8,1)};
 out.top=text(raw.top);out.bottom=text(raw.bottom);
 out.actors=(Array.isArray(raw.actors)?raw.actors:[]).slice(0,MAX_ACTORS).filter(a=>a&&a.recipe&&typeof a.recipe==='object'&&!Array.isArray(a.recipe)).map((a,i)=>({
  id:'actor-'+i,name:text(a.name)||'Character',recipe:normalizeRecipe(a.recipe),
  x:raw.version===2?clamp(a.x,-8,8,0):i*.65,z:raw.version===2?clamp(a.z,-8,8,0):0,size:raw.version===2?clamp(a.size,.6,1.4,1):1,seat:raw.version===2?text(a.seat):'',
  turn:clamp(a.turn,-180,180,0),pose:POSES.includes(a.pose)?a.pose:'Idle',
  expression:EXPRESSIONS.includes(a.expression)?a.expression:'smile',speech:text(a.speech)
 }));return out;
}
export function addCharacter(state,recipe,name=recipe.name||'Character'){
 if(state.actors.length>=MAX_ACTORS)return null;
 const n=state.actors.length,actor={id:'actor-'+Date.now()+'-'+n,name:text(name),recipe:structuredClone(recipe),x:(n%3)*.7,z:Math.floor(n/3)*.8,size:1,seat:'',turn:0,pose:'Idle',expression:'smile',speech:''};
 state.actors.push(actor);return actor;
}
export function moveCharacter(actor,x,z){actor.x=clamp(x,-8,8,actor.x);actor.z=clamp(z,-8,8,actor.z);}
export function panelOrder(panels,index,delta){const to=index+delta;if(to<0||to>=panels.length)return;[panels[index],panels[to]]=[panels[to],panels[index]];}
