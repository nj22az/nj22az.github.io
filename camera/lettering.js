/**
 * Lettering: speech balloons, shouts, thoughts and captions with the photographer's own words, placed like stickers
 * (stickers.js) and drawn as a letterer draws them: one closed outline round the balloon and its tail (no line across
 * the tail's mouth), the words in balanced lines inside an oval, a shout in capitals in a burst, a thought in a cloud
 * with a trail of bubbles, a caption in a box. Lettered in Baloo 2, the face the residents' die-cut stickers are
 * lettered in (fonts/OFL-Baloo2.txt); Japanese and other scripts fall back to the system's rounded face.
 *
 * Everything is drawn from paths at the size it is shown or saved, so a balloon is as sharp on a 12-megapixel save as
 * on the screen. Layout units: the lettering is 100 units tall.
 */
const FONT_URL=new URL('./fonts/baloo2.woff2',import.meta.url);
const FAMILY='"Pocket Baloo",ui-rounded,"Hiragino Maru Gothic ProN","Arial Rounded MT Bold",system-ui,sans-serif';
const F=100,INK='#16130f',PAPER='#fffefa';
let fontReady,measurer;

export const BALLOONS=Object.freeze([
 {id:'balloon:speech',label:'Speech',sample:'Hello!'},
 {id:'balloon:shout',label:'Shout',sample:'Whoa!'},
 {id:'balloon:think',label:'Thought',sample:'Hmm…'},
 {id:'balloon:caption',label:'Caption',sample:'Meanwhile, in Minato…'},
]);
export const isBalloon=id=>typeof id==='string'&&id.startsWith('balloon:');
const styleOf=id=>id.slice('balloon:'.length);

/** Loads the lettering face once; balloons wait for it so they are measured in the face they are drawn in. */
export function loadLetteringFont(){
 fontReady??=(async()=>{
  try{const face=new FontFace('Pocket Baloo',`url(${FONT_URL}) format("woff2")`,{weight:'400 800'});await face.load();document.fonts.add(face);}catch{}
 })();
 return fontReady;
}

function measure(){measurer??=document.createElement('canvas').getContext('2d');return measurer;}
/** Words into lines no wider than max, keeping the writer's own line breaks; a word too long is broken. */
function wrap(g,text,max){
 const lines=[];
 for(const para of text.split(/\n/)){
  let line='';
  for(const word of para.split(/\s+/).filter(Boolean)){
   const next=line?`${line} ${word}`:word;
   if(g.measureText(next).width<=max||!line){
    if(g.measureText(next).width<=max){line=next;continue;}
    // A single word wider than the balloon: split it.
    let part='';for(const ch of word){if(g.measureText(part+ch).width>max&&part){lines.push(part);part='';}part+=ch;}line=part;continue;
   }
   lines.push(line);line=word;
  }
  lines.push(line);
 }
 return lines.length?lines:[''];
}
// The same small irregularity every time for the same balloon.
const jitter=(i,k=1)=>{const v=Math.sin(i*12.9898+k*78.233)*43758.5453;return v-Math.floor(v);};

/**
 * Lays out a balloon: its size in layout units and a function drawing it centred at (cx, cy), `scale` pixels to a
 * unit. `flip` sends the tail to the right instead of the left.
 */
export function balloonLayout(id,text,flip=false){
 const style=styleOf(id),g=measure(),shout=style==='shout',caption=style==='caption';
 const words=(shout?String(text).toUpperCase():String(text)).trim()||'…';
 const weight=shout?800:caption?600:700;
 g.font=`${weight} ${F}px ${FAMILY}`;
 const total=g.measureText(words.replace(/\n/g,' ')).width;
 const widest=Math.max(...words.split(/\s+/).map(w=>g.measureText(w).width));
 // Balanced lines: a balloon somewhat wider than tall, never a ribbon of one long line, and never a word broken
 // unless it is wider than any balloon should be.
 const balanced=caption?Math.max(5*F,Math.min(13*F,Math.sqrt(total*F*3.2))):Math.max(3*F,Math.min(9*F,Math.sqrt(total*F*1.9)));
 const max=Math.max(balanced,Math.min(widest,caption?16*F:12*F));
 const lines=wrap(g,words,max),lh=F*1.06;
 const tw=Math.max(F,...lines.map(l=>g.measureText(l).width)),th=lines.length*lh;
 const L=F*(shout?.11:.085);
 let rx,ry,width,height,cy0;
 if(caption){rx=tw/2+.55*F;ry=th/2+.42*F;width=2*rx+2*L;height=2*ry+2*L;cy0=0;}
 else{
  // An oval that holds the block of words with room at its corners: √2 times its half-size is the least that does.
  rx=tw/2*1.42+.45*F;ry=th/2*1.42+.45*F;
  if(shout){rx*=1.12;ry*=1.16;}
  // The box round everything drawn: the cloud's bumps stand .64 out and its bubbles trail 1.51 below; the burst's
  // spikes reach 1.32 times out; the speech tail's point is 1.2 below the oval.
  const out=style==='think'?.64*F:0,reach=shout?1.32:1,below=style==='speech'?1.2*F:style==='think'?.87*F:0;
  width=2*(rx*reach+out)+2*L;height=2*(ry*reach+out)+below+2*L;
  cy0=-below/2;
 }
 function shape(g,cx,cy){
  const side=flip?1:-1;
  if(caption){g.rect(cx-rx,cy-ry,2*rx,2*ry);return;}
  if(style==='speech'){
   g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
   // The tail: a curved wedge from the lower part of the oval to a point below and to one side.
   const a0=Math.PI/2-side*.18,a1=Math.PI/2-side*.62;
   const p0=[cx+rx*Math.cos(a0),cy+ry*Math.sin(a0)],p1=[cx+rx*Math.cos(a1),cy+ry*Math.sin(a1)],tip=[cx+side*rx*.55,cy+ry+1.2*F];
   g.moveTo(...p0);g.quadraticCurveTo(cx+side*rx*.12,cy+ry+.45*F,...tip);g.quadraticCurveTo(cx+side*rx*.42,cy+ry+.2*F,...p1);g.closePath();
  }else if(style==='think'){
   g.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);
   const n=Math.max(9,Math.round(Math.PI*(rx+ry)/(1.25*F)));
   for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=(.5+.14*jitter(i))*F;g.moveTo(cx+rx*Math.cos(a)+r,cy+ry*Math.sin(a));g.arc(cx+rx*Math.cos(a),cy+ry*Math.sin(a),r,0,Math.PI*2);}
   [[.42,.3,.34],[.6,.9,.22],[.72,1.38,.13]].forEach(([dx,dy,r])=>{const x=cx+side*rx*dx,y=cy+ry+dy*F;g.moveTo(x+r*F,y);g.arc(x,y,r*F,0,Math.PI*2);});
  }else if(shout){
   const n=Math.max(14,Math.round(Math.PI*(rx+ry)/(1.05*F)));
   for(let i=0;i<=2*n;i++){
    const a=i/(2*n)*Math.PI*2,out=i%2===0,k=out?1.16+.16*jitter(i,3):.9+.04*jitter(i,5);
    const p=[cx+rx*k*Math.cos(a),cy+ry*k*Math.sin(a)];i?g.lineTo(...p):g.moveTo(...p);
   }
   g.closePath();
  }
 }
 function draw(g,cx,cy,scale){
  g.save();g.translate(cx,cy);g.scale(scale,scale);g.translate(0,cy0);
  // One outline round everything: stroke the shapes twice as wide as the line, then fill them, so only the outside
  // of their union keeps its ink.
  g.beginPath();shape(g,0,0);
  g.lineJoin=shout?'miter':'round';g.miterLimit=6;g.lineWidth=2*L;g.strokeStyle=INK;g.stroke();
  g.fillStyle=caption?'#fff1b8':PAPER;g.fill('nonzero');
  g.fillStyle=INK;g.font=`${weight} ${F}px ${FAMILY}`;g.textBaseline='middle';
  g.textAlign=caption?'left':'center';
  const x=caption?-tw/2:0;
  lines.forEach((l,i)=>g.fillText(l,x,(i-(lines.length-1)/2)*lh+F*.06));
  g.restore();
 }
 return {width,height,draw};
}

/** A balloon drawn into a canvas of the given height in pixels (the picker's tiles, the preview on the picture). */
export function balloonCanvas(id,text,flip,heightPx,canvas=document.createElement('canvas')){
 const layout=balloonLayout(id,text,flip),scale=heightPx/layout.height;
 canvas.width=Math.max(1,Math.round(layout.width*scale));canvas.height=Math.max(1,Math.round(heightPx));
 const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);
 layout.draw(g,canvas.width/2,canvas.height/2,scale);
 return canvas;
}
