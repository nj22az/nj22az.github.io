/**
 * Lettering: speech balloons, shouts, thoughts and captions with the photographer's own words, placed like stickers
 * (stickers.js) and drawn as a letterer draws them: one closed outline round the balloon and its tail (no line across
 * the tail's mouth), the words in balanced lines inside an oval, a shout in capitals in a burst, a thought in a cloud
 * with a trail of bubbles, a caption in a box. Lettered in Baloo 2, the face the residents' die-cut stickers are
 * lettered in (fonts/OFL-Baloo2.txt); Japanese and other scripts fall back to the system's rounded face.
 *
 * And Words: the words alone, with no balloon, lettered as the residents' stickers were (ink with a thick white die-cut
 * edge, its grey cut line and a soft shadow), a sticker of their own (the owner, 29 October 2026: "Or without the
 * balloon too").
 *
 * Everything is drawn from paths at the size it is shown or saved, so a balloon is as sharp on a 12-megapixel save as
 * on the screen. Layout units: the lettering is 100 units tall.
 */
const FONT_URL=new URL('./fonts/baloo2.woff2',import.meta.url);
const FAMILY='"Pocket Baloo",ui-rounded,"Hiragino Maru Gothic ProN","Arial Rounded MT Bold",system-ui,sans-serif';
// Sound effects (ドーン, ゴゴゴ, BOOM): Rounded Mplus 1c Black, cut down to kana, punctuation and Latin
// (fonts/OFL-MPLUSRounded1c.txt), so they letter the same on every phone and in every save.
const KANA_URL=new URL('./fonts/mplus-rounded-black-kana.woff2',import.meta.url);
const SFX_FAMILY='"Pocket Kana","Pocket Baloo","Hiragino Maru Gothic ProN",system-ui,sans-serif';
const F=100,INK='#16130f',PAPER='#fffefa';
let fontReady,measurer;

export const BALLOONS=Object.freeze([
 {id:'balloon:speech',label:'Speech',sample:'Hello!'},
 {id:'balloon:shout',label:'Shout',sample:'Whoa!'},
 {id:'balloon:think',label:'Thought',sample:'Hmm…'},
 {id:'balloon:caption',label:'Caption',sample:'Meanwhile, in Minato…'},
 {id:'balloon:words',label:'Words',sample:'Nankurunaisa!'},
 // A manga's sound effect (the owner, 29 October 2026: "Can make the pictures look like they are from a manga").
 {id:'balloon:sfx',label:'Sound',sample:'ドーン!'},
]);
/**
 * Sound effects ready to letter, each with what it means: the manga's own words for a sound or a feeling.
 * The Japanese is as it is printed in manga; the English for whoever reads the photo in English.
 */
export const SOUND_EFFECTS=Object.freeze([
 {text:'ドーン!',means:'Boom: a dramatic entrance'},{text:'ゴゴゴ',means:'A menacing rumble'},{text:'ドキドキ',means:'A pounding heart'},
 {text:'ガーン',means:'Shock: a blow to the heart'},{text:'ジャーン!',means:'Ta-da!'},{text:'バーン!',means:'Bang!'},
 {text:'キラキラ',means:'Sparkle'},{text:'シーン',means:'Dead silence'},{text:'ザワザワ',means:'An uneasy murmur'},
 {text:'ゴクリ',means:'A gulp'},{text:'BOOM!',means:'Boom!'},{text:'WHAM!',means:'Wham!'},
]);
export const isBalloon=id=>typeof id==='string'&&id.startsWith('balloon:');
const styleOf=id=>id.slice('balloon:'.length);

/** Loads the lettering face once; balloons wait for it so they are measured in the face they are drawn in. */
export function loadLetteringFont(){
 fontReady??=(async()=>{
  const load=async(name,url,weight)=>{try{const face=new FontFace(name,`url(${url}) format("woff2")`,{weight});await face.load();document.fonts.add(face);}catch{}};
  await Promise.all([load('Pocket Baloo',FONT_URL,'400 800'),load('Pocket Kana',KANA_URL,'900')]);
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
 if(styleOf(id)==='sfx')return soundLayout(text,flip);
 const style=styleOf(id),g=measure(),shout=style==='shout',caption=style==='caption',bare=style==='words';
 const words=(shout?String(text).toUpperCase():String(text)).trim()||'…';
 const weight=shout||bare?800:caption?600:700;
 g.font=`${weight} ${F}px ${FAMILY}`;
 const total=g.measureText(words.replace(/\n/g,' ')).width;
 const widest=Math.max(...words.split(/\s+/).map(w=>g.measureText(w).width));
 // Balanced lines: a balloon somewhat wider than tall, never a ribbon of one long line, and never a word broken
 // unless it is wider than any balloon should be.
 const balanced=caption||bare?Math.max(5*F,Math.min(13*F,Math.sqrt(total*F*3.2))):Math.max(3*F,Math.min(9*F,Math.sqrt(total*F*1.9)));
 const max=Math.max(balanced,Math.min(widest,caption||bare?16*F:12*F));
 const lines=wrap(g,words,max),lh=F*1.06;
 const tw=Math.max(F,...lines.map(l=>g.measureText(l).width)),th=lines.length*lh;
 const L=F*(shout?.11:.085);
 let rx,ry,width,height,cy0;
 // Words: the die-cut round the letters is .34 of their height, the cut line .05 outside it, and room for the shadow.
 const CUT=.34*F,EDGE=.05*F,DROP=.12*F;
 if(bare){rx=tw/2;ry=th/2;width=tw+2*(CUT+EDGE)+DROP;height=th+2*(CUT+EDGE)+DROP;cy0=-DROP/2;}
 else if(caption){rx=tw/2+.55*F;ry=th/2+.42*F;width=2*rx+2*L;height=2*ry+2*L;cy0=0;}
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
  if(bare){
   // The sticker's own cut: a soft shadow under the grey cut line, the white edge over it, then the ink.
   g.font=`${weight} ${F}px ${FAMILY}`;g.textBaseline='middle';g.textAlign='center';g.lineJoin='round';g.miterLimit=2;
   const lines_=(l,i)=>[l,0,(i-(lines.length-1)/2)*lh+F*.06];
   g.save();g.shadowColor='rgba(0,0,0,.28)';g.shadowBlur=DROP*scale;g.shadowOffsetY=DROP*.45*scale;
   g.strokeStyle='#b2aaa0';g.lineWidth=2*(CUT+EDGE);lines.forEach((l,i)=>g.strokeText(...lines_(l,i)));g.restore();
   g.strokeStyle='#ffffff';g.lineWidth=2*CUT;lines.forEach((l,i)=>g.strokeText(...lines_(l,i)));
   g.fillStyle=INK;lines.forEach((l,i)=>g.fillText(...lines_(l,i)));
   g.restore();return;
  }
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

/**
 * A sound effect as a manga letters one: no balloon, the letters in the heaviest rounded face along a rising line, each
 * a little turned and sized its own way (the same way every time for the same words), black with a white edge and a
 * thin black line round that, so it reads over any picture. `flip` rises the other way.
 */
function soundLayout(text,flip){
 const g=measure(),chars=Array.from(String(text).replace(/\s+/g,' ').trim()||'…');
 g.font=`900 ${F}px ${SFX_FAMILY}`;
 const WHITE=.15*F,LINE=.05*F,rise=(flip?1:-1)*.11*F;
 const glyphs=[];let x=0;
 chars.forEach((ch,i)=>{
  const k=1+.2*(jitter(i,7)-.35)+(i===0?.12:0),w=g.measureText(ch).width*k;
  glyphs.push({ch,k,turn:(jitter(i,11)-.5)*.3+(flip?.06:-.06),x:x+w/2,y:i*rise+(jitter(i,13)-.5)*.12*F});
  x+=w*.9;
 });
 const pad=WHITE+LINE+.25*F,half=F*.62;
 const xs=glyphs.map(c=>c.x),ys=glyphs.map(c=>c.y);
 const minX=Math.min(...xs)-half*1.25,maxX=Math.max(...xs)+half*1.25,minY=Math.min(...ys)-half*1.3,maxY=Math.max(...ys)+half*1.3;
 const width=maxX-minX+2*pad,height=maxY-minY+2*pad,ox=-(minX+maxX)/2,oy=-(minY+maxY)/2;
 function draw(g,cx,cy,scale){
  g.save();g.translate(cx,cy);g.scale(scale,scale);g.translate(ox,oy);
  g.font=`900 ${F}px ${SFX_FAMILY}`;g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.miterLimit=2;
  // Every letter's outer line first, then every white edge, then the ink, so no edge cuts into a neighbour's letter.
  const pass=fn=>glyphs.forEach(c=>{g.save();g.translate(c.x,c.y);g.rotate(c.turn);g.scale(c.k,c.k);fn(c.ch);g.restore();});
  g.strokeStyle=INK;g.lineWidth=2*(WHITE+LINE);pass(ch=>g.strokeText(ch,0,0));
  g.strokeStyle='#ffffff';g.lineWidth=2*WHITE;pass(ch=>g.strokeText(ch,0,0));
  g.fillStyle=INK;pass(ch=>g.fillText(ch,0,0));
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
