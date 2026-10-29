/**
 * Manga's lines over a picture (the owner, 29 October 2026: "Can make the pictures look like they are from a manga"):
 * focus lines (集中線), closing in on one point from every edge, and speed lines, streaking past whatever moves. Each is
 * a sticker of its own (stickers.js): its centre and the clear space round it are dragged and pinched like any sticker,
 * two fingers turn it (the direction of speed lines), and flipped its lines are white, for a dark picture. They are
 * drawn under the other stickers and balloons, from paths at the picture's own size, and the same lines every time, so
 * the viewfinder, a thumbnail and a 12-megapixel save show the same.
 */
export const EFFECTS=Object.freeze([
 {id:'effect:focus',label:'Focus lines',hint:'Lines closing in on one point: drag the centre onto a face, pinch for the clear space round it'},
 {id:'effect:speed',label:'Speed lines',hint:'Lines streaking past: drag them onto what moves, turn them with two fingers'},
]);
export const isEffect=id=>typeof id==='string'&&id.startsWith('effect:');
export const effectLabel=id=>EFFECTS.find(e=>e.id===id)?.label||'Lines';

// The same lines every time: a small fixed sequence, not Math.random.
function sequence(seed){let s=seed>>>0;return()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296;}

/** Draws one effect sticker `s` (centre x, y and size as shares of the picture, angle in degrees) over a w×h picture. */
export function drawEffect(g,s,w,h){
 const cx=s.x*w,cy=s.y*h,m=Math.min(w,h),r=Math.max(2,s.size*h/2),turn=(s.angle||0)*Math.PI/180;
 g.save();g.fillStyle=s.flip?'#ffffff':'#100f13';g.beginPath();
 if(s.id==='effect:speed')speedLines(g,cx,cy,r,w,h,m,turn);else focusLines(g,cx,cy,r,w,h,m,turn);
 g.fill();g.restore();
}

// Thin wedges from beyond the picture's corners to points round the clear circle, each its own width and reach.
function focusLines(g,cx,cy,r,w,h,m,turn){
 const next=sequence(7),far=Math.hypot(Math.max(cx,w-cx),Math.max(cy,h-cy))*1.06+m*.05,n=300;
 for(let i=0;i<n;i++){
  const a=(i+next()*.85)/n*Math.PI*2+turn,width=(.004+.017*next()**2)*m,inner=r*(1+.75*next()**1.4),half=width/2/far;
  g.moveTo(cx+Math.cos(a-half)*far,cy+Math.sin(a-half)*far);
  g.lineTo(cx+Math.cos(a)*inner,cy+Math.sin(a)*inner);
  g.lineTo(cx+Math.cos(a+half)*far,cy+Math.sin(a+half)*far);
  g.closePath();
 }
}

// Long spindles along the direction of travel across the whole picture, most of them behind what moves, none through
// the clear oval round it (as long as the oval is tall, more than twice as long).
function speedLines(g,cx,cy,r,w,h,m,turn){
 const next=sequence(11),D=Math.hypot(w,h),n=170,rx=r*2.3,ry=r;
 const along=Math.cos(turn),across=Math.sin(turn);
 const at=(x,y)=>[cx+x*along-y*across,cy+x*across+y*along];
 for(let i=0;i<n;i++){
  const y=(next()*2-1)*D/2,thick=(.004+.014*next()**2)*m,len=(.22+.55*next())*D/2;
  const gap=Math.abs(y)<ry?rx*Math.sqrt(1-(y/ry)**2):0;
  // Behind what moves (x < 0) twice as often as ahead of it.
  const behind=next()<.68,from=behind?-D/2:gap,to=behind?-gap:D/2;
  if(to-from<len*.3)continue;
  const x0=from+next()*Math.max(0,to-from-len),x1=Math.min(to,x0+len),xm=(x0+x1)/2;
  g.moveTo(...at(x0,y));g.lineTo(...at(xm,y-thick/2));g.lineTo(...at(x1,y));g.lineTo(...at(xm,y+thick/2));g.closePath();
 }
}

/** A small picture of an effect for the sticker sheet: its lines over the sheet's paper. */
export function effectPreview(id,size=96,canvas=document.createElement('canvas')){
 canvas.width=canvas.height=size;const g=canvas.getContext('2d');
 g.fillStyle='#f4f1e8';g.fillRect(0,0,size,size);
 drawEffect(g,{id,x:.5,y:.5,size:.34,angle:0,flip:false},size,size);
 return canvas;
}
