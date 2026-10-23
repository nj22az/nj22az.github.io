import {isLook,normalLook,retiredLook} from '../johansson-town/src/render/looks.js?v=20261023-recovery';
const num=(v,lo,hi,d)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Number(v))):d;
export const safeImage=s=>typeof s==='string'&&s.length<2800000&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s)?s:'';
export function normalEffects(p={}){return {look:normalLook(p?.look),...p?.focus?{focus:{mode:p.focus.mode==='tilt'?'tilt':'depth',distance:num(p.focus.distance,.1,2000,6),range:num(p.focus.range,.1,1000,3)}}:{},assets:(Array.isArray(p?.assets)?p.assets:[]).slice(0,20).filter(a=>a&&['star','heart','arrow','image','text'].includes(a.kind)).map((a,i)=>({id:'asset-'+i,kind:a.kind,x:num(a.x,0,1,.5),y:num(a.y,0,1,.5),size:num(a.size,.03,.8,.18),rotation:num(a.rotation,-180,180,0),opacity:num(a.opacity,.05,1,1),text:String(a.text||'').slice(0,120),image:safeImage(a.image)})).filter(a=>a.kind!=='image'||a.image)};}
export function normalCapture(raw){
 if(!raw||raw.version!==1||raw.encoding!=='rgb24-depth'||!Number.isInteger(raw.width)||!Number.isInteger(raw.height)||raw.width<1||raw.height<1||raw.width>4096||raw.height>4096||raw.width*raw.height>8000000)return null;
 if(![raw.depth,raw.normal].every(x=>safeImage(x)&&x.startsWith('data:image/png;base64,iVBORw0KGgo')))return null;
 for(const image of [raw.depth,raw.normal]){let bytes;try{bytes=Uint8Array.from(atob(image.split(',')[1].slice(0,44)),c=>c.charCodeAt(0));}catch{return null;}const view=new DataView(bytes.buffer);if(bytes.length<24||view.getUint32(16)!==raw.width||view.getUint32(20)!==raw.height)return null;}
 if(![raw.projectionInverse,raw.cameraWorld].every(m=>Array.isArray(m)&&m.length===16&&m.every(n=>Number.isFinite(n)&&Math.abs(n)<1000000)))return null;
 if(!Number.isFinite(raw.near)||!Number.isFinite(raw.far))return null;
 if(!(raw.near>0&&raw.far>raw.near&&raw.far<=2000))return null;
 return {version:1,encoding:'rgb24-depth',width:raw.width,height:raw.height,depth:raw.depth,normal:raw.normal,near:raw.near,far:raw.far,projectionInverse:[...raw.projectionInverse],cameraWorld:[...raw.cameraWorld],focusMode:raw.focusMode==='tilt'?'tilt':'depth',focusDistance:num(raw.focusDistance,.1,2000,6),focusRange:num(raw.focusRange,.1,1000,3),skyDepth:num(raw.skyDepth,1,1000000,120)};
}
export function normalLayer(raw){if(!raw||!safeImage(raw.plate)||raw.capture!=null&&!normalCapture(raw.capture))return null;return {plate:raw.plate,baseLook:isLook(raw.baseLook)||retiredLook(raw.baseLook)?raw.baseLook:'none',...normalCapture(raw.capture)?{capture:normalCapture(raw.capture)}:{},.../^(fujita-tv|make-something):[0-2]$/.test(raw.ref)?{ref:raw.ref}:{},lettering:{bubbles:(Array.isArray(raw.lettering?.bubbles)?raw.lettering.bubbles:[]).slice(0,6).map((b,i)=>({id:String(b.id||'actor-'+i).slice(0,80),x:num(b.x,-2,3,.5),y:num(b.y,-2,3,.2),headTop:num(b.headTop,-2,3,.5),visible:b.visible!==false}))},post:normalEffects(raw.post)};}
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
  if(e.focus!==undefined)p.post=normalEffects({...p.post,focus:e.focus});
  if(e.look!==undefined){if(!isLook(e.look))throw Error('Unknown shader look.');p.post.look=e.look;}
  for(const key of ['top','bottom'])if(e[key]!==undefined){if(typeof e[key]!=='string'||e[key].length>120)throw Error('Text must contain at most 120 characters.');p.scene[key]=e[key];if(key==='top')p.scene.style='meme';if(key==='bottom'&&p.scene.style!=='meme')p.scene.style='comic';}
  if(e.dialogue!==undefined){if(!Array.isArray(e.dialogue)||e.dialogue.length>6)throw Error('Give at most six dialogue replacements.');for(const line of e.dialogue){const actor=p.scene.actors.find(a=>a.id===line.actor);if(!actor)throw Error('Unknown speaker id. Inspect the project panelScenes actors.');if(typeof line.text!=='string'||line.text.length>120)throw Error('Dialogue must contain at most 120 characters.');actor.speech=line.text;}}
  if(e.assets!==undefined){if(!Array.isArray(e.assets)||e.assets.length>20)throw Error('Give at most 20 assets per panel.');const post=normalEffects({...p.post,assets:e.assets});if(post.assets.length!==e.assets.length)throw Error('Assets must be star, heart, arrow, text or a PNG/JPEG/WebP data image.');p.post=post;}
 }
 for(let i=0;i<panels.length;i++){panels[i].scene=next[i].scene;panels[i].post=next[i].post;}
 return panels;
}
