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
export function createEraser(frame,{edit,changed,busy=()=>{},failed=()=>{}}){
 const art=document.createElement('canvas');art.className='erase-paint';art.hidden=true;art.setAttribute('aria-label','Paint over what should go');frame.append(art);
 let size=8,stroke=null,working=false,undo=[];
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
  if(stroke)strokePath(g,stroke.points.map(p=>[p.x*art.width,p.y*art.height]),stroke.r*Math.min(art.width,art.height),'rgba(255,69,58,.55)');
 }
 const at=e=>{const r=art.getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};};
 art.addEventListener('pointerdown',e=>{
  if(working||!edit())return;e.preventDefault();e.stopPropagation();
  try{art.setPointerCapture(e.pointerId);}catch{}
  stroke={id:e.pointerId,points:[at(e)],r:radius()};paint();
 });
 art.addEventListener('pointermove',e=>{
  if(!stroke||e.pointerId!==stroke.id)return;
  const p=at(e),q=stroke.points.at(-1);
  if(Math.hypot((p.x-q.x)*art.width,(p.y-q.y)*art.height)>2){stroke.points.push(p);paint();}
 });
 const lift=async e=>{
  if(!stroke||e.pointerId!==stroke.id)return;
  const s=stroke;working=true;art.classList.add('working');busy(true);
  try{await fill(s);}
  catch(err){console.error(err);failed(err);}
  finally{stroke=null;working=false;art.classList.remove('working');paint();busy(false);}
 };
 art.addEventListener('pointerup',lift);art.addEventListener('pointercancel',()=>{if(!working){stroke=null;paint();}});

 async function fill(s){
  const e=edit(),W=e.width,H=e.height,r=Math.max(2,s.r*Math.min(W,H)),pts=s.points.map(p=>[p.x*W,p.y*H]);
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for(const [x,y] of pts){x0=Math.min(x0,x-r);y0=Math.min(y0,y-r);x1=Math.max(x1,x+r);y1=Math.max(y1,y+r);}
  x0=Math.max(0,Math.floor(x0));y0=Math.max(0,Math.floor(y0));x1=Math.min(W,Math.ceil(x1));y1=Math.min(H,Math.ceil(y1));
  if(x1<=x0||y1<=y0)return;
  // The window PhotoCraft samples from, kept inside the picture; at a working size when it is big.
  const bw=x1-x0,bh=y1-y0,side=Math.max(200,4*Math.sqrt(Math.max(bw,50)*Math.max(bh,50)));
  const ww=Math.min(W,Math.max(bw,Math.round(side))),wh=Math.min(H,Math.max(bh,Math.round(side)));
  const wx=Math.round(clamp((x0+x1)/2-ww/2,0,W-ww)),wy=Math.round(clamp((y0+y1)/2-wh/2,0,H-wh));
  const k=Math.min(1,Math.sqrt(MAX_WORK/(ww*wh))),tw=Math.max(1,Math.round(ww*k)),th=Math.max(1,Math.round(wh*k));
  const pic=pictureCanvas(),pg=pic.getContext('2d',{willReadFrequently:true});
  const wc=document.createElement('canvas');wc.width=tw;wc.height=th;
  const wg=wc.getContext('2d',{willReadFrequently:true});wg.imageSmoothingQuality='high';wg.drawImage(pic,wx,wy,ww,wh,0,0,tw,th);
  // The mask at the same size, the stroke a hair wider than painted so the edge of what goes goes with it.
  const mc=document.createElement('canvas');mc.width=tw;mc.height=th;
  const mg=mc.getContext('2d',{willReadFrequently:true});
  strokePath(mg,pts.map(([x,y])=>[(x-wx)*k,(y-wy)*k]),r*k+Math.max(1.5,2*k),'#fff');
  const md=mg.getImageData(0,0,tw,th).data,mask=new Uint8Array(tw*th);
  for(let i=0;i<mask.length;i++)mask[i]=md[i*4+3];
  const before=pg.getImageData(wx,wy,ww,wh);
  const out=await fillWindow(wg.getImageData(0,0,tw,th).data,tw,th,mask);
  // Back onto the picture through the painted mask: only what was painted changes.
  const fc=document.createElement('canvas');fc.width=tw;fc.height=th;
  const fg=fc.getContext('2d');fg.putImageData(new ImageData(out.rgba,tw,th),0,0);fg.globalCompositeOperation='destination-in';fg.drawImage(mc,0,0);
  pg.imageSmoothingQuality='high';pg.drawImage(fc,0,0,tw,th,wx,wy,ww,wh);
  undo.push({x:wx,y:wy,data:before});
  while(undo.length>1&&undo.reduce((n,u)=>n+u.data.data.length,0)>UNDO_BYTES)undo.shift();
  changed(pic);
 }

 return {
  set active(on){art.hidden=!on;stroke=null;if(on)paint();},
  set size(v){size=+v||8;},
  get canUndo(){return undo.length>0;},
  get working(){return working;},
  /** Takes back the last erase. */
  undo(){
   const u=undo.pop();if(!u)return false;
   pictureCanvas().getContext('2d').putImageData(u.data,u.x,u.y);changed(edit().picture);return true;
  },
  /** A new photo in the editor: nothing to take back. */
  reset(){undo=[];stroke=null;},
 };
}
