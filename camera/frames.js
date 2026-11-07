/**
 * Frames: the border a photo is printed in, as every photo from the hand-held cameras was. Drawn over the picture's
 * edges (the picture keeps its size), the same way in the viewfinder and in the save, so what is framed is what is kept.
 * Stickers and balloons are stuck on after the frame and may cross it, as a balloon breaks a comic panel's border; the
 * date stamp goes inside, in the picture's own corner.
 *
 * Every measure is a share of the picture's shorter side, so a frame looks the same on a thumbnail and on 12 megapixels.
 * Besides the drawn frames there are pixel frames, drawn in Python, below.
 */
const DRAWN=[
 {id:'none',label:'None'},
 {id:'print',label:'Print',hint:'An instant print: a white border with a deeper foot'},
 {id:'panel',label:'Panel',hint:'A comic panel: a hand-inked border on white paper'},
 {id:'film',label:'Film',hint:'A frame of 35 mm film, with its sprocket holes and edge print'},
];

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
   return {id:meta.id,label:meta.label,hint:meta.hint,pixel:{meta,sheet:img}};
  }))).filter(Boolean);
 }catch{return [];}
}
const pixelFrames=await Promise.race([loadPixelFrames(),new Promise(r=>setTimeout(()=>r([]),5000))]);
export const FRAMES=Object.freeze([...DRAWN,...pixelFrames]);
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

/** The part of a w×h picture a frame leaves showing. */
export function frameInner(id,w,h){
 const m=Math.min(w,h),px=pixelOf(id);
 if(px){const [lw,lh]=grid(px.meta,w/h),kx=w/lw,ky=h/lh,b=px.meta.border;return {x:b*kx,y:b*ky,w:w-2*b*kx,h:h-2*b*ky};}
 if(id==='print'){const s=.055*m;return {x:s,y:s,w:w-2*s,h:h-s-.19*m};}
 if(id==='panel'){const s=.045*m;return {x:s,y:s,w:w-2*s,h:h-2*s};}
 if(id==='film'){const band=.12*m,gap=.018*m;return w>=h?{x:gap,y:band,w:w-2*gap,h:h-2*band}:{x:band,y:gap,w:w-2*band,h:h-2*gap};}
 return {x:0,y:0,w,h};
}

// A pen's small wobble, the same every time for the same picture: a ruled line inked by hand.
function inkedRect(g,{x,y,w,h},m){
 const wobble=(i,j)=>Math.sin(i*12.9898+j*78.233)*.0011*m;
 const side=(x0,y0,x1,y1,k)=>{
  const n=Math.max(3,Math.round(Math.hypot(x1-x0,y1-y0)/(.08*m)));
  for(let i=1;i<=n;i++){const t=i/n,ox=wobble(k,i),oy=wobble(i,k);g.lineTo(x0+(x1-x0)*t+(y0===y1?0:ox),y0+(y1-y0)*t+(x0===x1?0:oy));}
 };
 g.beginPath();g.moveTo(x,y);side(x,y,x+w,y,1);side(x+w,y,x+w,y+h,2);side(x+w,y+h,x,y+h,3);side(x,y+h,x,y,4);g.closePath();
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
 const m=Math.min(w,h),inner=frameInner(id,w,h);
 const ring=fill=>{g.save();g.beginPath();g.rect(0,0,w,h);g.rect(inner.x,inner.y,inner.w,inner.h);g.fillStyle=fill;g.fill('evenodd');g.restore();};
 if(id==='print'){
  ring('#fbf9f3');
  // The faint step where the picture is set into the card, and the card's own grain.
  g.save();g.strokeStyle='rgba(60,50,40,.16)';g.lineWidth=Math.max(1,.0016*m);g.strokeRect(inner.x,inner.y,inner.w,inner.h);g.restore();
  g.save();g.beginPath();g.rect(0,0,w,h);g.rect(inner.x,inner.y,inner.w,inner.h);g.clip('evenodd');
  for(let i=0;i<220;i++){const a=Math.sin(i*91.7)*43758.5,b=Math.sin(i*27.3)*12345.6;g.fillStyle=`rgba(120,105,85,${.035+.03*(i%3)})`;g.fillRect((a-Math.floor(a))*w,(b-Math.floor(b))*h,.003*m,.003*m);}
  g.restore();
 }else if(id==='panel'){
  ring('#fffdf6');
  g.save();g.strokeStyle='#15120f';g.lineWidth=.0105*m;g.lineJoin='miter';inkedRect(g,inner,m);g.stroke();g.restore();
 }else if(id==='film'){
  ring('#121110');
  // Perforations a little longer along the strip than across it, evenly spaced and centred on its length.
  const across=w>=h,band=.12*m,hole={along:.05*m,across:.038*m,r:.009*m},pitch=.088*m,length=across?w:h;
  const count=Math.max(1,Math.floor((length-hole.along)/pitch)+1),first=(length-(count-1)*pitch-hole.along)/2;
  g.save();g.fillStyle='#ece6d6';
  for(const edge of [0,1])for(let i=0;i<count;i++){
   const along=first+i*pitch,away=edge?(across?h:w)-band*.4:band*.4;
   const [x,y,hw,hh]=across?[along,away-hole.across/2,hole.along,hole.across]:[away-hole.across/2,along,hole.across,hole.along];
   g.beginPath();g.roundRect(x,y,hw,hh,hole.r);g.fill();
  }
  // The edge print: the stock's name and the frame number, in the amber the film's edge is exposed with.
  g.fillStyle='#e7a23b';g.font=`700 ${.024*m}px "Helvetica Neue",Arial,sans-serif`;g.textBaseline='middle';
  const label=(text,along,away,align)=>{g.save();if(across)g.translate(along,away);else{g.translate(away,along);g.rotate(Math.PI/2);}g.textAlign=align;g.fillText(text,0,0);g.restore();};
  // Between the holes and the picture.
  const edgeAt=band*.86;
  label('MINATO 400',length*.06,edgeAt,'left');label('▶ 12',length*.94,edgeAt,'right');
  label('12A',length*.5,(across?h:w)-edgeAt,'center');
  g.restore();
 }
}
