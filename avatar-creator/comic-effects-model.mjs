import {isLook} from '../johansson-town/src/render/looks.js';
const num=(v,lo,hi,d)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Number(v))):d;
export const safeImage=s=>typeof s==='string'&&s.length<2800000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s)?s:'';
export function normalEffects(p={}){return {look:isLook(p?.look)?p.look:'none',assets:(Array.isArray(p?.assets)?p.assets:[]).slice(0,20).filter(a=>a&&['star','heart','arrow','image','text'].includes(a.kind)).map((a,i)=>({id:'asset-'+i,kind:a.kind,x:num(a.x,0,1,.5),y:num(a.y,0,1,.5),size:num(a.size,.03,.8,.18),rotation:num(a.rotation,-180,180,0),opacity:num(a.opacity,.05,1,1),text:String(a.text||'').slice(0,120),image:safeImage(a.image)})).filter(a=>a.kind!=='image'||a.image)};}
export function normalLayer(raw){if(!raw||!safeImage(raw.plate))return null;return {plate:raw.plate,.../^(fujita-tv|make-something):[0-2]$/.test(raw.ref)?{ref:raw.ref}:{},lettering:{bubbles:(Array.isArray(raw.lettering?.bubbles)?raw.lettering.bubbles:[]).slice(0,6).map((b,i)=>({id:String(b.id||'actor-'+i).slice(0,80),x:num(b.x,-2,3,.5),y:num(b.y,-2,3,.2),headTop:num(b.headTop,-2,3,.5),visible:b.visible!==false}))},post:normalEffects(raw.post)};}
const pairs=[['Fujita! Travel! Learn something! Live life to the full!','Fujita! Res! Lär dig något! Lev livet till fullo!'],["You're right! I'm going to make every minute count!",'Du har rätt! Jag ska ta vara på varje minut!'],['TV: “...and after the break, our samurai marathon continues!”','TV: ”…och efter pausen fortsätter vårt samurajmaraton!”']];
export function translateComic(scenes,language){const target=language==='sv'?1:0,lookup=new Map(pairs.flatMap(pair=>pair.map(text=>[text,pair[target]]))),fields=scenes.flatMap(s=>[[s,'top'],[s,'bottom'],...s.actors.map(a=>[a,'speech'])]);if(fields.some(([o,k])=>o[k]&&!lookup.has(o[k])))return false;for(const [o,k] of fields)if(o[k])o[k]=lookup.get(o[k]);return true;}

/** Immutable-call editing for MCP: panel numbers are one-based; assets replace that panel's asset list. */
export function editEffectsPanels(panels,{edits=[],language}={}){
 if(!Array.isArray(edits)||edits.length>16)throw Error('Give at most 16 panel edits.');
 const next=structuredClone(panels);
 if(language&&!['en','sv'].includes(language))throw Error('Original dialogue supports en or sv. Replace custom text explicitly.');
 if(language&&!translateComic(next.map(p=>p.scene),language))throw Error('Custom wording has no saved translation. Supply replacement dialogue or captions.');
 for(const e of edits){
  if(!e||!Number.isInteger(e.panel)||!next[e.panel-1])throw Error('Panel numbers start at 1 and must exist in this comic.');
  const p=next[e.panel-1];
  if(e.look!==undefined){if(!isLook(e.look))throw Error('Unknown shader look.');p.post.look=e.look;}
  for(const key of ['top','bottom'])if(e[key]!==undefined){if(typeof e[key]!=='string'||e[key].length>120)throw Error('Text must contain at most 120 characters.');p.scene[key]=e[key];if(key==='top')p.scene.style='meme';if(key==='bottom'&&p.scene.style!=='meme')p.scene.style='comic';}
  if(e.dialogue!==undefined){if(!Array.isArray(e.dialogue)||e.dialogue.length>6)throw Error('Give at most six dialogue replacements.');for(const line of e.dialogue){const actor=p.scene.actors.find(a=>a.id===line.actor);if(!actor)throw Error('Unknown speaker id. Inspect the project panelScenes actors.');if(typeof line.text!=='string'||line.text.length>120)throw Error('Dialogue must contain at most 120 characters.');actor.speech=line.text;}}
  if(e.assets!==undefined){if(!Array.isArray(e.assets)||e.assets.length>20)throw Error('Give at most 20 assets per panel.');const post=normalEffects({look:p.post.look,assets:e.assets});if(post.assets.length!==e.assets.length)throw Error('Assets must be star, heart, arrow, text or a PNG/JPEG/WebP data image.');p.post=post;}
 }
 for(let i=0;i<panels.length;i++){panels[i].scene=next[i].scene;panels[i].post=next[i].post;}
 return panels;
}
