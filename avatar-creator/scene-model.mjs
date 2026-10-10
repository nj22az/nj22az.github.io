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
export function emptyScene(){return {version:1,location:'harbour',format:'landscape',style:'photo',top:'',bottom:'',actors:[]};}
export function normalizeScene(raw,normalizeRecipe=r=>structuredClone(r)){
 const out=emptyScene();if(!raw||raw.version!==1)return out;
 out.location=LOCATIONS.some(([id])=>id===raw.location)?raw.location:out.location;
 out.format=['landscape','square','portrait'].includes(raw.format)?raw.format:out.format;
 out.style=['photo','meme','comic'].includes(raw.style)?raw.style:out.style;
 out.top=text(raw.top);out.bottom=text(raw.bottom);
 out.actors=(Array.isArray(raw.actors)?raw.actors:[]).slice(0,MAX_ACTORS).filter(a=>a&&a.recipe&&typeof a.recipe==='object'&&!Array.isArray(a.recipe)).map((a,i)=>({
  id:'actor-'+i,name:text(a.name)||'Character',recipe:normalizeRecipe(a.recipe),
  x:clamp(a.x,.08,.92,.5),y:clamp(a.y,.35,.96,.9),size:clamp(a.size,.18,.75,.46),
  turn:clamp(a.turn,-180,180,0),pose:POSES.includes(a.pose)?a.pose:'Idle',
  expression:EXPRESSIONS.includes(a.expression)?a.expression:'smile',speech:text(a.speech)
 }));return out;
}
export function addCharacter(state,recipe,name=recipe.name||'Character'){
 if(state.actors.length>=MAX_ACTORS)return null;
 const n=state.actors.length,actor={id:'actor-'+Date.now()+'-'+n,name:text(name),recipe:structuredClone(recipe),x:Math.min(.85,.35+n*.12),y:.9,size:.46,turn:0,pose:'Idle',expression:'smile',speech:''};
 state.actors.push(actor);return actor;
}
export function moveCharacter(actor,x,y){actor.x=clamp(x,.08,.92,actor.x);actor.y=clamp(y,.35,.96,actor.y);}
export function panelOrder(panels,index,delta){const to=index+delta;if(to<0||to>=panels.length)return;[panels[index],panels[to]]=[panels[to],panels[index]];}
