/**
 * Die-cut stickers on the picture: the studio's sticker sheets of Johansson World's residents (Thuan, Johansson and
 * Thao in their Pixar bodies, the cartoon Thuan, Thuan & Nils; nj22az/jojo art/stickers, made light by
 * tools/build-camera-stickers.py). They sit on top of the Looks as real stickers sit on a print, in the viewfinder and on a photo alike, and are kept in the recipe (where, how big, which
 * way round), so a photo can be opened again and its stickers moved.
 *
 * One finger moves a sticker, two pinch and turn it; the corner handle does both with a mouse, the wheel resizes and
 * Shift+wheel turns. A sticker is placed by its centre, its height as a share of the picture's height and its angle.
 * Balloons and captions (lettering.js) are placed the same way and keep their words; flipping one sends its tail the
 * other way rather than mirroring its letters.
 *
 * The residents' stickers are the figures alone; their words are a sticker of their own (the owner, 29 October 2026:
 * "Make the stickers without text and we can add any text as another sticker"). A resident's sticker, chosen, offers its
 * own line as a speech balloon beside it, which can then be moved, changed or taken off like any other.
 */
import {isBalloon,balloonLayout,balloonCanvas,loadLetteringFont,BALLOONS} from './lettering.js?v=20261029t';
import {isEffect,drawEffect,effectLabel} from './effects.js?v=20261029b';

const MANIFEST=new URL('./stickers/stickers.json',import.meta.url);
// The camera's own sheet of manga marks (tools/draw-manga-marks.py): under the Manga tab with the lines, never a deck
// for Memory or a greeting (its `kind`).
const MARKS=new URL('./stickers/marks.json',import.meta.url);
let loading;
const byId=new Map(),images=new Map();

/** The sticker sets, loaded once. */
export function loadStickerSets(){
 loading??=Promise.all([fetch(MANIFEST).then(r=>{if(!r.ok)throw new Error('No stickers');return r.json();}),
  fetch(MARKS).then(r=>r.ok?r.json():null).catch(()=>null)]).then(([m,own])=>{
  if(own?.stickers?.length)m.sets.push(own);
  for(const set of m.sets)for(const s of set.stickers){
   s.url=new URL(`./stickers/${s.src}`,import.meta.url).href;s.thumbUrl=new URL(`./stickers/${s.thumb}`,import.meta.url).href;s.set=set.name;s.who=set.who??set.name;byId.set(s.id,s);
  }
  return m;
 }).catch(err=>{loading=null;throw err;});
 return loading;
}
export const stickerById=id=>byId.get(id);
/** The photographer's own stickers (cutout.js, kept in album.js) join the sheets: {id, url, width, height}. */
export function registerSticker(entry){byId.set(entry.id,{set:'Mine',gloss:'Your sticker',line:'',...entry});images.delete(entry.id);}
export function forgetSticker(id){byId.delete(id);images.delete(id);}
export const stickerLabel=s=>s?(s.gloss||s.line||'Sticker'):'Sticker';
const balloonName=id=>BALLOONS.find(b=>b.id===id)?.label||'Balloon';
/** A placed sticker's own shape: a sheet sticker's picture, a balloon laid out round its words, or the lines' clear circle. */
function shapeOf(s){
 if(isEffect(s.id))return {width:1,height:1};
 if(isBalloon(s.id)){const l=balloonLayout(s.id,s.text??'',s.flip);return {width:l.width,height:l.height};}
 return byId.get(s.id);
}
/** A sticker's picture, decoded and ready to draw. */
export function stickerImage(id){
 const s=byId.get(id);if(!s)return Promise.reject(new Error(`Unknown sticker ${id}`));
 if(!images.has(id)){
  const img=new Image();img.decoding='async';img.src=s.url;
  // A failed load is not remembered, so the next save tries again.
  images.set(id,img.decode().then(()=>img,err=>{images.delete(id);throw err;}));
 }
 return images.get(id);
}

/**
 * Prints the stickers onto a finished picture (w×h): the lines first, under everything, then the others in order, the
 * last on top; returns how many could not be loaded.
 */
export async function drawStickers(g,w,h,stickers){
 if(!stickers?.length)return 0;
 stickers=[...stickers.filter(s=>isEffect(s.id)),...stickers.filter(s=>!isEffect(s.id))];
 const sheets=stickers.some(s=>!isBalloon(s.id)&&!isEffect(s.id)),lettered=stickers.some(s=>isBalloon(s.id));
 if(sheets)await loadStickerSets();
 if(lettered)await loadLetteringFont();
 const pictures=await Promise.all(stickers.map(s=>isEffect(s.id)?'effect':isBalloon(s.id)?'balloon':stickerImage(s.id).catch(()=>null)));
 stickers.forEach((s,i)=>{
  const img=pictures[i];if(!img)return;
  if(img==='effect'){drawEffect(g,s,w,h);return;}
  if(img==='balloon'){
   const l=balloonLayout(s.id,s.text??'',s.flip);
   g.save();g.translate(s.x*w,s.y*h);g.rotate(s.angle*Math.PI/180);l.draw(g,0,0,s.size*h/l.height);g.restore();return;
  }
  const height=s.size*h,width=height*img.naturalWidth/img.naturalHeight;
  g.save();g.translate(s.x*w,s.y*h);g.rotate(s.angle*Math.PI/180);if(s.flip)g.scale(-1,1);
  g.imageSmoothingQuality='high';g.drawImage(img,-width/2,-height/2,width,height);g.restore();
 });
 return pictures.filter(p=>!p).length;
}

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const SIZE=[.06,1.6];
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

/**
 * The stickers over one frame. `list()` is the recipe's array (changed in place); `changed()` is told after each change.
 */
export function createStickerLayer(frame,{list,changed,editText=()=>{},say=null}){
 const layer=document.createElement('div');layer.className='stickers';frame.append(layer);
 // The lines are painted on one canvas over the whole picture, under every sticker; each has a clear circle to hold.
 const art=document.createElement('canvas');art.className='effects-art';art.setAttribute('aria-hidden','true');layer.append(art);
 let selected=null,gesture=null;
 const els=[];
 function paintEffects(){
  const items=list(),dpr=Math.min(3,devicePixelRatio||1),w=Math.round(frame.clientWidth*dpr),h=Math.round(frame.clientHeight*dpr);
  const any=items.some(s=>isEffect(s.id));art.hidden=!any;if(!any||!w||!h)return;
  if(art.width!==w||art.height!==h){art.width=w;art.height=h;}
  const g=art.getContext('2d');g.clearRect(0,0,w,h);for(const s of items)if(isEffect(s.id))drawEffect(g,s,w,h);
 }
 new ResizeObserver(()=>paintEffects()).observe(frame);

 function place(el,s){
  el.style.left=`${s.x*100}%`;el.style.top=`${s.y*100}%`;el.style.height=`${s.size*100}%`;
  el.style.transform=`translate(-50%,-50%) rotate(${s.angle}deg)`;el.classList.toggle('flipped',!!s.flip&&!isBalloon(s.id));
 }
 // A balloon is drawn at the size it is shown, so its letters stay sharp; again after every change of size or words.
 function paintBalloon(el,s){
  const art=el.querySelector('canvas'),px=Math.min(2048,Math.round(s.size*frame.clientHeight*Math.min(3,devicePixelRatio||1)));
  const key=`${s.id}|${s.text}|${s.flip}|${px}`;
  if(!px||art.dataset.key===key)return;
  art.dataset.key=key;balloonCanvas(s.id,s.text??'',s.flip,px,art);
 }
 function render(){
  const items=list();
  while(els.length>items.length)els.pop().remove();
  items.forEach((s,i)=>{
   const balloon=isBalloon(s.id),effect=isEffect(s.id),kind=effect?'effect':balloon?'balloon':'picture';
   let el=els[i];
   let stale=null;if(el&&el.dataset.kind!==kind){stale=el;el=null;}
   if(!el){
    el=document.createElement('div');el.className=`sticker${balloon?' balloon':effect?' effect':''}`;el.dataset.kind=kind;el.tabIndex=0;el.setAttribute('role','button');
    el.innerHTML=`${balloon?'<canvas aria-hidden="true"></canvas>':effect?'':'<img alt="" draggable="false">'}<button type="button" class="sticker-remove" aria-label="Remove">${icon('x')}</button>`
     +`<button type="button" class="sticker-flip" aria-label="${balloon?'Turn the tail the other way':effect?'White lines or black':'Flip sticker'}">${icon('flip-h')}</button><span class="sticker-handle" aria-hidden="true">${icon('resize')}</span>`
     +(balloon?`<button type="button" class="sticker-text" aria-label="Change the words">${icon('text')}</button>`:effect?'':`<button type="button" class="sticker-say">${icon('say')}<span>Say</span></button>`);
    el.addEventListener('focus',()=>select(els.indexOf(el)));
    if(balloon)el.addEventListener('dblclick',()=>{const k=els.indexOf(el);if(k>=0)editText(k,list()[k]);});
    // The lines' circle stays under the stickers, so a resident stuck in the clear space is still the one picked up.
    if(stale)stale.replaceWith(el);else if(effect)art.after(el);else layer.append(el);
    els[i]=el;
   }
   const info=shapeOf(s);
   if(effect){el.style.aspectRatio='1/1';}
   else if(balloon){el.style.aspectRatio=`${info.width}/${info.height}`;paintBalloon(el,s);}
   else{
    const img=el.querySelector('img');if(info&&img.dataset.id!==s.id){img.src=info.url;img.dataset.id=s.id;el.style.aspectRatio=`${info.width}/${info.height}`;}
    const words=el.querySelector('.sticker-say');words.hidden=!info?.line;if(info?.line)words.setAttribute('aria-label',`Their words: “${info.line}”`);
   }
   // Words alone have no tail to turn.
   el.querySelector('.sticker-flip').hidden=s.id==='balloon:words';
   el.setAttribute('aria-label',effect?`${effectLabel(s.id)}: drag to move the centre, pinch for the clear space. Arrow keys move them, Delete removes them.`
    :balloon?`${balloonName(s.id)}: ${s.text||'no words yet'}. Arrow keys move it, Delete removes it, double-click changes the words.`:`Sticker: ${stickerLabel(info)}. Arrow keys move it, Delete removes it.`);
   el.classList.toggle('selected',i===selected);place(el,s);
  });
  paintEffects();
 }
 function select(i){
  const items=list();
  if(i!=null&&i>=0&&i<items.length-1&&!isEffect(items[i].id)){
   // The chosen sticker comes to the top, as one picked up from a pile would.
   const [s]=items.splice(i,1);items.push(s);const [el]=els.splice(i,1);els.push(el);layer.append(el);i=items.length-1;changed();
  }
  selected=i!=null&&i>=0?i:null;render();
 }
 function add(id,{text=''}={}){
  const items=list();
  if(isBalloon(id)){
   // Lettered at about a twentieth of the picture's height, in the upper part, where a letterer puts balloons first.
   const l=balloonLayout(id,text,false);
   // Words alone go low, as a caption under a picture; a balloon high, where a letterer puts them first.
   const sfx=id==='balloon:sfx';
   items.push({id,text,x:.5,y:id==='balloon:caption'?.12:id==='balloon:words'?.8:sfx?.22:.28,size:Math.min(.9,l.height/100*(sfx?.08:.05)),angle:0,flip:false});
  }else if(isEffect(id)){
   // Focus lines look at the upper middle, where a face usually is; speed lines streak across the middle.
   items.push({id,x:.5,y:id==='effect:focus'?.42:.5,size:id==='effect:focus'?.36:.3,angle:0,flip:false});
  }else if(id.startsWith('marks/')){
   // A mark is small and goes by a face, high and to one side, as a manga draws it.
   items.push({id,x:.64,y:.3,size:.13,angle:0,flip:false});
  }else items.push({id,x:.5,y:.56,size:.42,angle:Math.round((Math.random()*16-8)*10)/10,flip:false});
  selected=items.length-1;render();
  els[selected]?.animate?.([{scale:'.4',opacity:0},{scale:'1.08',opacity:1,offset:.7},{scale:'1'}],{duration:380,easing:'ease-out'});
  changed();
 }
 function remove(i=selected){
  if(i==null)return;const items=list();items.splice(i,1);els.splice(i,1)[0]?.remove();selected=null;render();changed();
 }
 function flip(i=selected){if(i==null)return;const s=list()[i];s.flip=!s.flip;render();changed();}
 /**
  * A resident's words as lettering of their own beside them: words alone under their feet, where the stickers used to
  * carry them; a balloon beside their head, on the side with more room, its tail towards them.
  */
 async function sayAs(i,{text,style='balloon:speech'}){
  const s=list()[i],info=byId.get(s?.id);if(!s||!text)return;
  await loadLetteringFont();
  const items=list(),l=balloonLayout(style,text,false),size=Math.min(.9,l.height/100*.05);
  const W=frame.clientWidth||1,H=frame.clientHeight||1,aspect=info?info.width/info.height:1;
  // As shares of the picture's width: half the sticker, and the whole lettering.
  const half=s.size*H*aspect/W/2,bw=size*H*l.width/l.height/W,right=s.x<.5;
  const inX=v=>clamp(v,Math.min(.5,bw/2),Math.max(.5,1-bw/2)),inY=v=>clamp(v,Math.min(.5,size/2),Math.max(.5,1-size/2));
  const placed=style==='balloon:words'?{x:inX(s.x),y:inY(s.y+s.size/2+size*.25),flip:false}
   :{x:inX(s.x+(right?1:-1)*(half*.55+bw/2)),y:inY(s.y-s.size/2+size*.15),flip:!right};
  items.push({id:style,text,...placed,size,angle:0});
  selected=items.length-1;render();
  els[selected]?.animate?.([{scale:'.4',opacity:0},{scale:'1.08',opacity:1,offset:.7},{scale:'1'}],{duration:380,easing:'ease-out'});
  changed();
 }
 function setText(i,text){const s=list()[i];if(!s||!isBalloon(s.id))return;s.text=String(text).slice(0,140);render();changed();}
 /** Another style of lettering for the same words (a speech balloon to a shout, to words alone …). */
 function setStyle(i,id){const s=list()[i];if(!s||!isBalloon(s.id)||!isBalloon(id)||s.id===id)return;s.id=id;if(id==='balloon:words')s.flip=false;render();changed();}
 function nudge(dx,dy){if(selected==null)return;const s=list()[selected];s.x=clamp(s.x+dx,-.2,1.2);s.y=clamp(s.y+dy,-.2,1.2);render();changed();}

 const point=e=>({x:e.clientX,y:e.clientY});
 function begin(e,i,mode){
  const s=list()[i],rect=frame.getBoundingClientRect();
  // The sticker keeps the pointer even when it leaves the window.
  try{els[i]?.setPointerCapture(e.pointerId);}catch{}
  gesture={i,mode,rect,pointers:new Map([[e.pointerId,point(e)]]),from:{...s},start:new Map([[e.pointerId,point(e)]])};
 }
 function restart(){
  // A finger added or lifted: measure the gesture again from here.
  if(!gesture)return;const s=list()[gesture.i];gesture.from={...s};gesture.start=new Map(gesture.pointers);
 }
 frame.addEventListener('pointerdown',e=>{
  const el=e.target.closest('.sticker');
  if(e.target.closest('.sticker-remove')){e.stopPropagation();e.preventDefault();remove(els.indexOf(el));return;}
  if(e.target.closest('.sticker-flip')){e.stopPropagation();e.preventDefault();flip(els.indexOf(el));return;}
  if(e.target.closest('.sticker-text')){e.stopPropagation();e.preventDefault();const k=els.indexOf(el);editText(k,list()[k]);return;}
  if(e.target.closest('.sticker-say')){
   e.stopPropagation();e.preventDefault();const k=els.indexOf(el),info=byId.get(list()[k]?.id);
   if(say)say(k,info);else sayAs(k,{text:info?.line});return;
  }
  // A second finger, on the sticker or beside it, turns a drag into a pinch.
  if(gesture&&gesture.pointers.size===1&&gesture.mode==='move'&&(!el||els.indexOf(el)===gesture.i)){
   e.stopPropagation();e.preventDefault();gesture.pointers.set(e.pointerId,point(e));restart();return;
  }
  if(el){
   e.stopPropagation();e.preventDefault();
   if(els.indexOf(el)!==selected)select(els.indexOf(el));
   begin(e,selected,e.target.closest('.sticker-handle')?'handle':'move');
   return;
  }
  if(selected!=null){selected=null;render();}
 });
 addEventListener('pointermove',e=>{
  if(!gesture||!gesture.pointers.has(e.pointerId))return;
  gesture.pointers.set(e.pointerId,point(e));
  const s=list()[gesture.i],{rect,from,start}=gesture;if(!s)return;
  const now=[...gesture.pointers.values()],was=[...gesture.pointers.keys()].map(id=>start.get(id));
  if(gesture.mode==='handle'){
   const c={x:rect.left+from.x*rect.width,y:rect.top+from.y*rect.height},p=now[0],q=was[0];
   const d0=Math.hypot(q.x-c.x,q.y-c.y)||1,d=Math.hypot(p.x-c.x,p.y-c.y);
   s.size=clamp(from.size*d/d0,...SIZE);
   s.angle=from.angle+(Math.atan2(p.y-c.y,p.x-c.x)-Math.atan2(q.y-c.y,q.x-c.x))*180/Math.PI;
  }else if(now.length>=2){
   const [a,b]=now,[a0,b0]=was;
   const d0=Math.hypot(b0.x-a0.x,b0.y-a0.y)||1,d=Math.hypot(b.x-a.x,b.y-a.y);
   s.size=clamp(from.size*d/d0,...SIZE);
   s.angle=from.angle+(Math.atan2(b.y-a.y,b.x-a.x)-Math.atan2(b0.y-a0.y,b0.x-a0.x))*180/Math.PI;
   s.x=clamp(from.x+((a.x+b.x)-(a0.x+b0.x))/2/rect.width,-.2,1.2);s.y=clamp(from.y+((a.y+b.y)-(a0.y+b0.y))/2/rect.height,-.2,1.2);
  }else{
   s.x=clamp(from.x+(now[0].x-was[0].x)/rect.width,-.2,1.2);s.y=clamp(from.y+(now[0].y-was[0].y)/rect.height,-.2,1.2);
  }
  place(els[gesture.i],s);if(isEffect(s.id))paintEffects();
 });
 const end=e=>{
  if(!gesture||!gesture.pointers.has(e.pointerId))return;
  gesture.pointers.delete(e.pointerId);
  if(gesture.pointers.size)restart();else{const s=list()[gesture.i];if(s&&isBalloon(s.id))paintBalloon(els[gesture.i],s);gesture=null;changed();}
 };
 addEventListener('pointerup',end);addEventListener('pointercancel',end);
 frame.addEventListener('wheel',e=>{
  const el=e.target.closest('.sticker');if(!el)return;
  e.preventDefault();const i=els.indexOf(el);if(i!==selected)select(i);const s=list()[selected];
  if(e.shiftKey)s.angle+=e.deltaY*.15;else s.size=clamp(s.size*Math.exp(-e.deltaY*.0015),...SIZE);
  place(els[selected],s);if(isBalloon(s.id))paintBalloon(els[selected],s);if(isEffect(s.id))paintEffects();changed();
 },{passive:false});

 return {
  render,add,remove,flip,nudge,select,setText,setStyle,sayAs,
  get selected(){return selected;},
  get busy(){return !!gesture;},
  set hidden(v){layer.hidden=v;},
 };
}
