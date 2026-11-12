/**
 * Frames: the border a photo is printed in, as every photo from the hand-held cameras was. Drawn over the picture's
 * edges (the picture keeps its size), the same way in the viewfinder and in the save, so what is framed is what is kept.
 * Stickers and balloons are stuck on after the frame and may cross it, as a balloon breaks a comic panel's border; the
 * date stamp goes inside, in the picture's own corner.
 *
 * Every frame is drawn in Python. The drawn frames (tools/draw-camera-cute-frames.py, frames/cute.json; the owner,
 * 12 November 2026: "Redraw the frames too, in python, make them more playful and cute, similar style to the icons")
 * are descriptions in units of a hundredth of the picture's shorter side: a border's widths, a window's corners, shapes
 * repeated along the sides and shapes set against a corner, drawn here at the picture's own size, so a frame is the
 * same on a thumbnail and on sixteen megapixels. The pixel frames are sheets of pieces, below.
 */
const NONE=Object.freeze({id:'none',label:'None'});
async function loadDrawnFrames(){
 try{
  const data=await (await fetch(new URL('./frames/cute.json',import.meta.url))).json();
  return data.frames.map(f=>({id:f.id,label:f.label,hint:f.hint,drawn:f}));
 }catch{return [];}
}

/*
 * The pixel frames, drawn in Python (tools/draw-camera-frames.py) as the hand-held camera's frames were drawn: four
 * shades, a 16-pixel border at a scale where the photo's short side is 144 pixels. Each is a sheet of pieces (corners,
 * an edge piece per side that repeats along it, small scenes set against an edge), laid out here for the photo's own
 * shape and enlarged with hard pixel edges, so the viewfinder, the thumbnail and the save show the same frame.
 * Loaded once before the camera starts (a few kilobytes); without them the camera has its drawn frames only.
 */
async function loadPixelFrames(){
 try{
  const manifest=await (await fetch(new URL('./frames/frames.json',import.meta.url))).json();
  return (await Promise.all(manifest.frames.map(async meta=>{
   const img=new Image();img.src=new URL(`./frames/${meta.id}.png`,import.meta.url).href;
   try{await img.decode();}catch{return null;}
   // Kept so a photo framed in one still shows it; no longer offered (`old`: the owner, 12 November 2026, of the frames:
   // "walk away from the Gameboy arts, but keep the playfulness from Gameboy Camera").
   return {id:meta.id,label:meta.label,hint:meta.hint,old:true,pixel:{meta,sheet:img}};
  }))).filter(Boolean);
 }catch{return [];}
}
const late=()=>new Promise(r=>setTimeout(()=>r([]),5000));
const [drawnFrames,pixelFrames]=await Promise.all([Promise.race([loadDrawnFrames(),late()]),Promise.race([loadPixelFrames(),late()])]);
export const FRAMES=Object.freeze([NONE,...drawnFrames,...pixelFrames]);
const drawnOf=id=>drawnFrames.find(f=>f.id===id)?.drawn||null;
const pixelOf=id=>pixelFrames.find(f=>f.id===id)?.pixel||null;
/** The frame's own grid for a picture of shape `aspect`: its short side 144 frame pixels. */
function grid(meta,aspect){return aspect>=1?[Math.round(meta.short*aspect),meta.short]:[meta.short,Math.round(meta.short/aspect)];}
const composed=new Map();
/** A pixel frame laid out at its own size for the picture's shape, as the Python preview lays it out. */
function compose({meta,sheet},lw,lh){
 const key=`${meta.id}|${lw}|${lh}`;if(composed.has(key))return composed.get(key);
 const c=document.createElement('canvas');c.width=lw;c.height=lh;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const b=meta.border,p=meta.pieces;
 const piece=(k,x,y)=>{const [sx,sy,w,h]=p[k];g.drawImage(sheet,sx,sy,w,h,x,y,w,h);};
 // The edges, repeated from the middle outwards so a pattern is centred, kept between the corners.
 const run=(k,horizontal,at)=>{
  const [,,tw,th]=p[k],tile=horizontal?tw:th,span=(horizontal?lw:lh)-2*b,n=Math.ceil(span/tile)+1,start=b+Math.floor((span-n*tile)/2);
  g.save();g.beginPath();horizontal?g.rect(b,at,lw-2*b,th):g.rect(at,b,tw,lh-2*b);g.clip();
  for(let i=0;i<n;i++)horizontal?piece(k,start+i*tile,at):piece(k,at,start+i*tile);
  g.restore();
 };
 run('top',true,0);run('bottom',true,lh-p.bottom[3]);run('left',false,0);run('right',false,lw-p.right[2]);
 piece('tl',0,0);piece('tr',lw-b,0);piece('bl',0,lh-b);piece('br',lw-b,lh-b);
 for(const f of meta.features){
  const [sx,sy,fw,fh]=f.rect,ax={l:0,c:.5,r:1}[f.anchor[1]],ay={t:0,m:.5,b:1}[f.anchor[0]];
  g.drawImage(sheet,sx,sy,fw,fh,Math.round(ax*lw-ax*fw+f.dx),Math.round(ay*lh-ay*fh+f.dy),fw,fh);
 }
 if(composed.size>24)composed.delete(composed.keys().next().value);
 composed.set(key,c);return c;
}
export const isFrame=id=>FRAMES.some(f=>f.id===id);

/** A drawn frame's border widths for a picture's shape: a frame that turns (Film) keeps its bands along the longer sides. */
function insets(f,w,h){const [t,r,b,l]=f.inset;return f.turn&&h>w?[l,t,r,b]:[t,r,b,l];}
const turned=(f,w,h,sides)=>f.turn&&h>w?[...sides].map(s=>({t:'l',b:'r',l:'t',r:'b'})[s]).join(''):sides;
/** The part of a w×h picture a frame leaves showing. */
export function frameInner(id,w,h){
 const m=Math.min(w,h),px=pixelOf(id),f=drawnOf(id);
 if(px){const [lw,lh]=grid(px.meta,w/h),kx=w/lw,ky=h/lh,b=px.meta.border;return {x:b*kx,y:b*ky,w:w-2*b*kx,h:h-2*b*ky};}
 if(f){const u=m/100,[t,r,b,l]=insets(f,w,h);return {x:l*u,y:t*u,w:w-(l+r)*u,h:h-(t+b)*u};}
 return {x:0,y:0,w,h};
}

const paths=new Map();
const path=d=>{let p=paths.get(d);if(!p){p=new Path2D(d);paths.set(d,p);}return p;};
function paint(g,shape,u){
 g.globalAlpha=shape.opacity??1;
 if(shape.fill){g.fillStyle=shape.fill;g.fill(path(shape.d));}
 if(shape.stroke){g.strokeStyle=shape.stroke;g.lineWidth=shape.width||1;g.lineCap=g.lineJoin='round';g.stroke(path(shape.d));}
}
/** A drawn frame (frames/cute.json) at the picture's size. */
function drawDrawn(g,f,w,h){
 const u=Math.min(w,h)/100,[t,r,b,l]=insets(f,w,h),x=l*u,y=t*u,iw=w-(l+r)*u,ih=h-(t+b)*u,radius=(f.radius||0)*u;
 g.save();
 g.beginPath();g.rect(0,0,w,h);g.roundRect(x,y,iw,ih,radius);g.fillStyle=f.ground;g.fill('evenodd');
 // A side of the picture (outer) or of the window (inner): where it starts, how long it is, and the matrix that
 // lays a shape along it with y toward the middle of the picture.
 const side=(s,at)=>{
  const o=at==='inner'?{x,y,w:iw,h:ih}:{x:0,y:0,w,h};
  // k widens a shape along the side (a run that must meet its neighbours).
  return s==='t'?{len:o.w,m:(off,k=1)=>[u*k,0,0,u,o.x+off,o.y]}:s==='b'?{len:o.w,m:(off,k=1)=>[u*k,0,0,-u,o.x+off,o.y+o.h]}
   :s==='l'?{len:o.h,m:(off,k=1)=>[0,u*k,u,0,o.x,o.y+off]}:{len:o.h,m:(off,k=1)=>[0,u*k,-u,0,o.x+o.w,o.y+off]};
 };
 // Shapes repeated along a side, as many as fill it evenly.
 const along=(spec,each)=>{
  for(const s of turned(f,w,h,spec.sides)){
   const {len,m}=side(s,spec.at||'outer'),pad=(spec.pad||0)*u,span=len-2*pad,count=Math.max(1,Math.round(span/(spec.tile*u))),step=span/count;
   for(let i=0;i<count;i++)each(s,m,pad+i*step,step);
  }
 };
 for(const run of f.runs||[])along(run,(s,m,off,step)=>{g.save();g.transform(...(run.stretch?m(off,step/(run.tile*u)):m(off+(step-run.tile*u)/2)));paint(g,run,u);g.restore();});
 for(const motif of f.motifs||[])along(motif,(s,m,off,step)=>{
  // Upright whatever the side: only its place is turned.
  const [a,b2,c,d,e,k]=m(off+step*(.5+(motif.shift||0))),depth=motif.depth||0,cx=e+c*depth,cy=k+d*depth;
  g.save();g.transform(u,0,0,u,cx,cy);paint(g,motif,u);g.restore();
 });
 if(f.rim){g.beginPath();g.roundRect(x,y,iw,ih,radius);g.strokeStyle=f.rim.colour;g.lineWidth=f.rim.width*u;g.lineJoin='round';g.stroke();}
 // Film's edge print, along its bands (the photo's longer sides): the one lettering on a frame.
 if(f.print){
  const across=!(f.turn&&h>w),length=across?w:h,depth=across?h:w;
  g.fillStyle=f.print.colour;g.font=`700 ${f.print.size*u}px "Helvetica Neue",Arial,sans-serif`;g.textBaseline='middle';
  for(const word of f.print.words){
   const along=length*word.at,away=word.edge==='far'?depth-f.print.away*u:f.print.away*u;
   g.save();if(across)g.translate(along,away);else{g.translate(away,along);g.rotate(Math.PI/2);}
   g.textAlign=word.align;g.fillText(word.text,0,0);g.restore();
  }
 }
 for(const mark of f.marks||[]){
  g.save();g.translate(mark.at[0]*w+(mark.dx||0)*u,mark.at[1]*h+(mark.dy||0)*u);g.rotate((mark.rotate||0)*Math.PI/180);g.scale(u,u);paint(g,mark,u);g.restore();
 }
 g.restore();
}

/** Draws a frame over a w×h picture. */
export function drawFrame(g,id,w,h){
 if(!isFrame(id)||id==='none')return;
 const px=pixelOf(id);
 if(px){
  const [lw,lh]=grid(px.meta,w/h);
  // Enlarged with hard pixel edges; made smaller (a thumbnail) it is smoothed, so no row of pixels is dropped.
  g.save();g.imageSmoothingEnabled=w<lw;g.imageSmoothingQuality='high';g.drawImage(compose(px,lw,lh),0,0,lw,lh,0,0,w,h);g.restore();
  return;
 }
 const f=drawnOf(id);if(f)drawDrawn(g,f,w,h);
}
