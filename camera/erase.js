/**
 * Erase (the owner, 29 October 2026, of PhotoCraft's tools: "The eraser works better than the cutouts"): paint over
 * what should go, and when the finger lifts it is filled from the picture round it, by PhotoCraft's Content-Aware Fill
 * (storytold/photocraft, MIT OR Apache-2.0; erase-worker.js runs pocket-algo.wasm off the page's thread).
 *
 * It changes the photo's own picture: the Looks, stickers and frames are drawn over it as before, and a save keeps the
 * erased picture as the photo's source. Only a window round the stroke is sent, sized as PhotoCraft samples (a square
 * of 4·√(w·h) round the hole, 200 px at least), and at a working size on a big photo; the fill comes back through the
 * painted mask, so nothing outside it changes. Undo takes back the last few, within what a phone can hold.
 */
import {findSpots} from './retouch-analysis.js?v=20261031retouch1';

const MAX_WORK=1.6e6,UNDO_BYTES=64e6;
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));

let worker,seq=0;
const pending=new Map();
function fillWindow(rgba,width,height,mask){
 if(!worker){
  worker=new Worker(new URL('./erase-worker.js?v=20261029a',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error?p.reject(new Error(data.error)):p.resolve(data);};
  worker.onerror=e=>{for(const p of pending.values())p.reject(new Error(e.message||'Erase could not start'));pending.clear();worker=null;};
 }
 return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});worker.postMessage({id,rgba,width,height,mask},[rgba.buffer,mask.buffer]);});
}

/** A round-ended stroke through points (or a dot for one), `r` its half-width. */
function strokePath(g,pts,r,colour){
 g.save();g.strokeStyle=g.fillStyle=colour;g.lineWidth=2*r;g.lineCap='round';g.lineJoin='round';
 if(pts.length===1){g.beginPath();g.arc(pts[0][0],pts[0][1],r,0,Math.PI*2);g.fill();}
 else{g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1))g.lineTo(...p);g.stroke();}
 g.restore();
}

/**
 * The eraser over one frame. `edit()` is the editor's state ({picture, width, height}); `changed(canvas)` is told the
 * picture changed; `busy(on)` while a fill runs.
 */
export function createEraser(frame,{edit,changed,busy=()=>{},failed=()=>{},suggestionsChanged=()=>{}}){
 const art=document.createElement('canvas');art.className='erase-paint';art.hidden=true;art.setAttribute('aria-label','Paint over what should go');frame.append(art);
 let size=8,stroke=null,operation=null,undo=[],generation=0,scan=0,spots=[],spotSource=null,multitouch=false;
 const pointers=new Set();
 const working=()=>operation!==null;
 const cropKey=e=>JSON.stringify(e?.recipe?.crop);
 function clearSuggestions(){scan++;spots=[];spotSource=null;suggestionsChanged([]);paint();}
 function currentSuggestions(){
  const e=edit();
  if(spotSource&&(spotSource.edit!==e||spotSource.picture!==e?.picture||spotSource.crop!==cropKey(e))){spots=[];spotSource=null;suggestionsChanged([]);}
  return spots;
 }
 function begin(kind){const e=edit(),task={kind,generation,edit:e,crop:cropKey(e),width:e?.width,height:e?.height};operation=task;art.classList.add('working');busy(true);return task;}
 const current=task=>operation===task&&task.generation===generation&&edit()===task.edit&&cropKey(task.edit)===task.crop&&task.edit?.width===task.width&&task.edit?.height===task.height&&(task.kind!=='analysis'||task.scan===scan);
 function finish(task){if(operation!==task)return;operation=null;stroke=null;art.classList.remove('working');paint();busy(false);}
 async function runFill(s){
  if(working()||!edit())return false;
  const task=begin('fill');
  try{return await fill(s,task);}
  catch(err){if(current(task)){console.error(err);failed(err);}return false;}
  finally{finish(task);}
 }
 // The picture as a canvas to draw on (an ImageBitmap is turned into one the first time).
 function pictureCanvas(){
  const e=edit();
  if(!(e.picture instanceof HTMLCanvasElement)){
   const c=document.createElement('canvas');c.width=e.width;c.height=e.height;c.getContext('2d').drawImage(e.picture,0,0,e.width,e.height);
   e.picture.close?.();e.picture=c;
  }
  return e.picture;
 }
 const radius=()=>size/200;   // a share of the picture's shorter side
 function paint(){
  const dpr=Math.min(2,devicePixelRatio||1),w=Math.round(frame.clientWidth*dpr),h=Math.round(frame.clientHeight*dpr);
  if(art.width!==w||art.height!==h){art.width=w;art.height=h;}
  const g=art.getContext('2d');g.clearRect(0,0,art.width,art.height);
  const candidates=currentSuggestions(),m=Math.min(art.width,art.height);
  g.lineWidth=2*dpr;g.strokeStyle='#fff';g.font=`bold ${12*dpr}px system-ui`;g.textAlign='center';g.textBaseline='middle';
  for(let i=0;i<candidates.length;i++){
   const p=candidates[i],x=p.x*art.width,y=p.y*art.height,r=Math.max(p.r*m+3*dpr,13*dpr);
   g.save();g.shadowColor='#000';g.shadowBlur=3*dpr;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();
   g.fillStyle='rgba(0,0,0,.65)';g.beginPath();g.arc(x,y,8*dpr,0,Math.PI*2);g.fill();g.shadowBlur=0;g.fillStyle='#fff';g.fillText(String(i+1),x,y);g.restore();
  }
  if(stroke)strokePath(g,stroke.points.map(p=>[p.x*art.width,p.y*art.height]),stroke.r*Math.min(art.width,art.height),'rgba(255,69,58,.55)');
 }
 const at=e=>{const r=art.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};};
 const hit=p=>{
  const m=Math.min(frame.clientWidth,frame.clientHeight),candidates=currentSuggestions();
  return candidates.findIndex(q=>Math.hypot((p.x-q.x)*frame.clientWidth,(p.y-q.y)*frame.clientHeight)<=Math.max(q.r*m+4,18));
 };
 art.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();e.stopPropagation();pointers.add(e.pointerId);
  try{art.setPointerCapture(e.pointerId);}catch{}
  if(pointers.size>1){multitouch=true;stroke=null;paint();return;}
  if(working()||!edit()||multitouch)return;
  const p=at(e),suggestion=hit(p);stroke={id:e.pointerId,points:[p],r:suggestion>=0?spots[suggestion].r:radius(),suggestion};paint();
 });
 art.addEventListener('pointermove',e=>{
  if(!stroke||e.pointerId!==stroke.id||multitouch)return;
  const p=at(e),q=stroke.points.at(-1);
  if(Math.hypot((p.x-q.x)*art.width,(p.y-q.y)*art.height)>2){
   stroke.points.push(p);const first=stroke.points[0];
   if(Math.hypot((p.x-first.x)*frame.clientWidth,(p.y-first.y)*frame.clientHeight)>10){stroke.suggestion=-1;stroke.r=radius();}
   paint();
  }
 });
 const lift=async e=>{
  pointers.delete(e.pointerId);
  if(multitouch){if(!pointers.size)multitouch=false;return;}
  if(!stroke||e.pointerId!==stroke.id)return;
  const s=stroke;stroke=null;
  if(s.suggestion>=0)await healSuggestion(s.suggestion);else await runFill(s);
 };
 art.addEventListener('pointerup',lift);
 const cancel=e=>{pointers.delete(e.pointerId);if(!pointers.size)multitouch=false;if(stroke?.id===e.pointerId){stroke=null;paint();}};
 art.addEventListener('pointercancel',cancel);
 art.addEventListener('lostpointercapture',cancel);
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{if(!art.hidden)paint();}).observe(frame);

 /** Scans the current crop. Suggestions do not mutate the photo. */
 async function analyze(){
  if(working()||!edit())return 0;
  const task=begin('analysis'),e=task.edit,picture=e.picture,c={...e.recipe.crop},key=cropKey(e);
  clearSuggestions();task.scan=scan;
  try{
   // Let the status and spinner paint before bounded pixel analysis.
   await new Promise(resolve=>setTimeout(resolve,0));
   if(!current(task)||e.picture!==picture||cropKey(e)!==key)return 0;
   const W=e.width*c.w,H=e.height*c.h,k=Math.min(1,512/Math.max(W,H));
   const sample=document.createElement('canvas');sample.width=Math.max(1,Math.round(W*k));sample.height=Math.max(1,Math.round(H*k));
   const g=sample.getContext('2d',{willReadFrequently:true});g.drawImage(picture,c.x*e.width,c.y*e.height,W,H,0,0,sample.width,sample.height);
   const found=findSpots(g.getImageData(0,0,sample.width,sample.height));
   if(!current(task)||e.picture!==picture||cropKey(e)!==key)return 0;
   spots=found;spotSource={edit:e,picture,crop:key};suggestionsChanged(spots.map(s=>({...s})));paint();return spots.length;
  }catch(err){if(current(task))failed(err);return 0;}
  finally{finish(task);}
 }
 async function healSuggestion(index){
  const s=currentSuggestions()[index];if(!s||working())return false;
  return runFill({points:[{x:s.x,y:s.y}],r:s.r});
 }

 async function fill(s,task){
  const e=task.edit,W=e.width,H=e.height,c={...e.recipe.crop};
  const r=Math.max(2,s.r*Math.min(c.w*W,c.h*H)),pts=s.points.map(p=>[(c.x+p.x*c.w)*W,(c.y+p.y*c.h)*H]);
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for(const [x,y] of pts){x0=Math.min(x0,x-r);y0=Math.min(y0,y-r);x1=Math.max(x1,x+r);y1=Math.max(y1,y+r);}
  x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(W,Math.ceil(x1));y1=Math.min(H,Math.ceil(y1));
  if(x1<=x0||y1<=y0)return;
  // The window PhotoCraft samples from, kept inside the picture; at a working size when it is big.
  const bw=x1-x0,bh=y1-y0,side=Math.max(200,4*Math.sqrt(Math.max(bw,50)*Math.max(bh,50)));
  const ww=Math.min(W,Math.max(bw,Math.round(side))),wh=Math.min(H,Math.max(bh,Math.round(side)));
  const wx=Math.round(clamp((x0+x1)/2-ww/2,0,W-ww)),wy=Math.round(clamp((y0+y1)/2-wh/2,0,H-wh));
  const k=Math.min(1,Math.sqrt(MAX_WORK/(ww*wh))),tw=Math.max(1,Math.round(ww*k)),th=Math.max(1,Math.round(wh*k));
  const original=e.picture;let pic=original;
  if(!(pic instanceof HTMLCanvasElement)){pic=document.createElement('canvas');pic.width=W;pic.height=H;pic.getContext('2d').drawImage(original,0,0,W,H);}
  const pg=pic.getContext('2d',{willReadFrequently:true});
  const wc=document.createElement('canvas');wc.width=tw;wc.height=th;
  const wg=wc.getContext('2d',{willReadFrequently:true});wg.imageSmoothingQuality='high';wg.drawImage(pic,wx,wy,ww,wh,0,0,tw,th);
  // The mask at the same size, the stroke a hair wider than painted so the edge of what goes goes with it.
  const mc=document.createElement('canvas');mc.width=tw;mc.height=th;
  const mg=mc.getContext('2d',{willReadFrequently:true});
  strokePath(mg,pts.map(([x,y])=>[(x-wx)*k,(y-wy)*k]),r*k+Math.max(1.5,2*k),'#fff');
  const md=mg.getImageData(0,0,tw,th).data,mask=new Uint8Array(tw*th);
  let covered=0;for(let i=0;i<mask.length;i++){mask[i]=md[i*4+3];if(mask[i]>127)covered++;}
  if(!covered||mask.length-covered<Math.max(16,Math.ceil(mask.length*.08)))throw new Error('Leave more surrounding picture for the fill');
  // Store only the changed bounds, including the mask's antialiased rim. Exact undo stays within a phone budget.
  const rim=Math.ceil(5/k),ux=Math.max(wx,x0-rim),uy=Math.max(wy,y0-rim),uw=Math.min(wx+ww,x1+rim)-ux,uh=Math.min(wy+wh,y1+rim)-uy;
  if(uw*uh*4>UNDO_BYTES)throw new Error('Use a smaller erase stroke');
  const before=pg.getImageData(ux,uy,uw,uh);
  const out=await fillWindow(wg.getImageData(0,0,tw,th).data,tw,th,mask);
  if(!current(task)||e.picture!==original)return false;
  if(out.filled!==covered||out.rgba?.length!==tw*th*4)throw new Error('The selected area could not be filled');
  // Back onto the picture through the painted mask: only what was painted changes.
  const fc=document.createElement('canvas');fc.width=tw;fc.height=th;
  const fg=fc.getContext('2d');fg.putImageData(new ImageData(out.rgba,tw,th),0,0);fg.globalCompositeOperation='destination-in';fg.drawImage(mc,0,0);
  pg.imageSmoothingQuality='high';pg.drawImage(fc,0,0,tw,th,wx,wy,ww,wh);
  e.picture=pic;undo.push({x:ux,y:uy,data:before,picture:pic,edit:e});
  while(undo.length>1&&undo.reduce((n,u)=>n+u.data.data.length,0)>UNDO_BYTES)undo.shift();
  clearSuggestions();changed(pic);if(original!==pic)original.close?.();return true;
 }

 return {
  set active(on){art.hidden=!on;stroke=null;pointers.clear();multitouch=false;if(on)paint();},
  set size(v){size=clamp(+v||8,1,40);},
  get canUndo(){return undo.length>0;},
  get working(){return working();},
  get analyzing(){return operation?.kind==='analysis';},
  get suggestions(){return currentSuggestions().map(s=>({...s}));},
  analyze,clearSuggestions,healSuggestion,
  /** Takes back the last erase. */
  undo(){
   if(working())return false;
   const u=undo.pop();if(!u||u.edit!==edit()||u.picture!==edit()?.picture)return false;
   pictureCanvas().getContext('2d').putImageData(u.data,u.x,u.y);clearSuggestions();changed(edit().picture);return true;
  },
  /** A new photo in the editor: nothing to take back. */
  reset(){generation++;undo=[];stroke=null;pointers.clear();multitouch=false;const wasBusy=working();operation=null;art.classList.remove('working');clearSuggestions();if(wasBusy)busy(false);},
 };
}
