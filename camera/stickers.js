/**
 * Die-cut stickers on the picture: the studio's sticker sheets of Johansson World's residents (Thuan, Fuji, Thuan &
 * Nils; nj22az/jojo art/stickers, made light by tools/build-camera-stickers.py). They sit on top of the Looks as real
 * stickers sit on a print, in the viewfinder and on a photo alike, and are kept in the recipe (where, how big, which
 * way round), so a photo can be opened again and its stickers moved.
 *
 * One finger moves a sticker, two pinch and turn it; the corner handle does both with a mouse, the wheel resizes and
 * Shift+wheel turns. A sticker is placed by its centre, its height as a share of the picture's height and its angle.
 */
const MANIFEST=new URL('./stickers/stickers.json',import.meta.url);
let loading;
const byId=new Map(),images=new Map();

/** The sticker sets, loaded once. */
export function loadStickerSets(){
 loading??=fetch(MANIFEST).then(r=>{if(!r.ok)throw new Error('No stickers');return r.json();}).then(m=>{
  for(const set of m.sets)for(const s of set.stickers){
   s.url=new URL(`./stickers/${s.src}`,import.meta.url).href;s.thumbUrl=new URL(`./stickers/${s.thumb}`,import.meta.url).href;s.set=set.name;byId.set(s.id,s);
  }
  return m;
 }).catch(err=>{loading=null;throw err;});
 return loading;
}
export const stickerById=id=>byId.get(id);
export const stickerLabel=s=>s?(s.gloss||s.line||'Sticker'):'Sticker';
/** A sticker's picture, decoded and ready to draw. */
export function stickerImage(id){
 const s=byId.get(id);if(!s)return Promise.reject(new Error(`Unknown sticker ${id}`));
 if(!images.has(id)){const img=new Image();img.decoding='async';img.src=s.url;images.set(id,img.decode().then(()=>img));}
 return images.get(id);
}

/** Prints the stickers onto a finished picture (w×h) in order, the last on top. */
export async function drawStickers(g,w,h,stickers){
 if(!stickers?.length)return;
 await loadStickerSets();
 const pictures=await Promise.all(stickers.map(s=>stickerImage(s.id).catch(()=>null)));
 stickers.forEach((s,i)=>{
  const img=pictures[i];if(!img)return;
  const height=s.size*h,width=height*img.naturalWidth/img.naturalHeight;
  g.save();g.translate(s.x*w,s.y*h);g.rotate(s.angle*Math.PI/180);if(s.flip)g.scale(-1,1);
  g.imageSmoothingQuality='high';g.drawImage(img,-width/2,-height/2,width,height);g.restore();
 });
}

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const SIZE=[.06,1.6];
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

/**
 * The stickers over one frame. `list()` is the recipe's array (changed in place); `changed()` is told after each change.
 */
export function createStickerLayer(frame,{list,changed}){
 const layer=document.createElement('div');layer.className='stickers';frame.append(layer);
 let selected=null,gesture=null;
 const els=[];

 function place(el,s){
  el.style.left=`${s.x*100}%`;el.style.top=`${s.y*100}%`;el.style.height=`${s.size*100}%`;
  el.style.transform=`translate(-50%,-50%) rotate(${s.angle}deg)`;el.classList.toggle('flipped',!!s.flip);
 }
 function render(){
  const items=list();
  while(els.length>items.length)els.pop().remove();
  items.forEach((s,i)=>{
   let el=els[i];
   if(!el){
    el=document.createElement('div');el.className='sticker';el.tabIndex=0;el.setAttribute('role','button');
    el.innerHTML=`<img alt="" draggable="false"><button type="button" class="sticker-remove" aria-label="Remove sticker">${icon('x')}</button>`
     +`<button type="button" class="sticker-flip" aria-label="Flip sticker">${icon('flip-h')}</button><span class="sticker-handle" aria-hidden="true">${icon('resize')}</span>`;
    el.addEventListener('focus',()=>select(els.indexOf(el)));
    layer.append(el);els[i]=el;
   }
   const info=byId.get(s.id),img=el.querySelector('img');
   if(info&&img.dataset.id!==s.id){img.src=info.url;img.dataset.id=s.id;el.style.aspectRatio=`${info.width}/${info.height}`;}
   el.setAttribute('aria-label',`Sticker: ${stickerLabel(info)}. Arrow keys move it, Delete removes it.`);
   el.classList.toggle('selected',i===selected);place(el,s);
  });
 }
 function select(i){
  const items=list();
  if(i!=null&&i>=0&&i<items.length-1){
   // The chosen sticker comes to the top, as one picked up from a pile would.
   const [s]=items.splice(i,1);items.push(s);const [el]=els.splice(i,1);els.push(el);layer.append(el);i=items.length-1;changed();
  }
  selected=i!=null&&i>=0?i:null;render();
 }
 function add(id){
  const items=list();
  items.push({id,x:.5,y:.56,size:.42,angle:Math.round((Math.random()*16-8)*10)/10,flip:false});
  selected=items.length-1;render();
  els[selected]?.animate?.([{scale:'.4',opacity:0},{scale:'1.08',opacity:1,offset:.7},{scale:'1'}],{duration:380,easing:'ease-out'});
  changed();
 }
 function remove(i=selected){
  if(i==null)return;const items=list();items.splice(i,1);els.splice(i,1)[0]?.remove();selected=null;render();changed();
 }
 function flip(i=selected){if(i==null)return;const s=list()[i];s.flip=!s.flip;render();changed();}
 function nudge(dx,dy){if(selected==null)return;const s=list()[selected];s.x=clamp(s.x+dx,-.2,1.2);s.y=clamp(s.y+dy,-.2,1.2);render();changed();}

 const point=e=>({x:e.clientX,y:e.clientY});
 function begin(e,i,mode){
  const s=list()[i],rect=frame.getBoundingClientRect();
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
  if(el){
   e.stopPropagation();e.preventDefault();
   if(els.indexOf(el)!==selected)select(els.indexOf(el));
   begin(e,selected,e.target.closest('.sticker-handle')?'handle':'move');
   return;
  }
  if(gesture&&gesture.pointers.size===1&&gesture.mode==='move'){e.stopPropagation();gesture.pointers.set(e.pointerId,point(e));restart();return;}
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
  place(els[gesture.i],s);
 });
 const end=e=>{
  if(!gesture||!gesture.pointers.has(e.pointerId))return;
  gesture.pointers.delete(e.pointerId);
  if(gesture.pointers.size)restart();else{gesture=null;changed();}
 };
 addEventListener('pointerup',end);addEventListener('pointercancel',end);
 frame.addEventListener('wheel',e=>{
  const el=e.target.closest('.sticker');if(!el)return;
  e.preventDefault();const i=els.indexOf(el);if(i!==selected)select(i);const s=list()[selected];
  if(e.shiftKey)s.angle+=e.deltaY*.15;else s.size=clamp(s.size*Math.exp(-e.deltaY*.0015),...SIZE);
  place(els[selected],s);changed();
 },{passive:false});

 return {
  render,add,remove,flip,nudge,select,
  get selected(){return selected;},
  get busy(){return !!gesture;},
  set hidden(v){layer.hidden=v;},
 };
}
