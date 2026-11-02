/**
 * Face stickers (the owner, 2 November 2026: "Manga eyes, evil eyebrows, Halloween cute stickers … maybe things can be
 * brought from the avatar creator and Johansson World?", then "Imagine using stickers for the eyebrows from the avatar
 * creator"). The brows and eyes are the residents' own, drawn by World's face painter (johansson-town/src/avatars/face.js,
 * the avatar creator's faces), imported and never copied, so a brow redrawn in the Studio is redrawn here. They are
 * drawn as vectors at the photo's own size, so they are sharp in a 16 MP save. Hats are the Halloween sheet's headpieces,
 * modelled in Blender (stickers/halloween.json, the entries with `hat`).
 *
 * Everything sits on the face guide Makeup already uses (recipe.makeup.face): the brows and eyes on its two eye points
 * (the residents' face, laid so its eyes are the photo's eyes), a hat above them at the guide's angle. Find face or Align
 * face places it; nothing is guessed without a face.
 *
 * recipe.stamps (plain data, kept with the photo so it re-edits from the original):
 *   brows  {style, mood, colour, size, height}  one of World's brow styles or 'none'; mood −1.5 worried … 1.9 evil
 *                                               (face.js's own moods: angry 1.4, scheme 1.7, raging 1.9)
 *   eyes   {style, colour, size}                a resident's drawn eye over each eye, or 'none'
 *   shine  0 … 1                                manga catchlights on the photo's own eyes
 *   hat    {id, size, height}                   a headpiece sticker, or 'none'
 *   finish 'drawn' | 'sticker'                  drawn into the photo before the Looks (Manga inks it, Pocket prints it in
 *                                               four greens), or a die-cut sticker on top of them
 */
import {drawBrow,drawEye,faceLayout} from '../johansson-town/src/avatars/face.js?v=20261102fun1';
import {normaliseFace} from './makeup.js?v=20261031retouch1';

const TAU=Math.PI*2;
// The sticker sheets are loaded only when a hat is wanted, so the renderer (looks-gl.js, which normalises recipes here)
// stays free of the sticker layer and runs in Node's tests too.
const sheets=()=>import('./stickers.js?v=20261102fun1');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const number=(v,fallback)=>v!=null&&Number.isFinite(+v)?+v:fallback;

/** The residents' face with every slider in the middle: where face.js puts eyes and brows, in its 256-unit square. */
export const FACE=Object.freeze(faceLayout({eyes:{height:.5,spacing:.5,size:.5,width:.5,tilt:.5},brows:{height:.5,spacing:.5,size:.5,tilt:.5},
 nose:{height:.5,size:.5,x:.5},mouth:{height:.5,size:.5,width:.5,x:.5}}));
/**
 * A photographed brow is about twice as long as a resident's (two thirds of the span between the pupils, against a third),
 * and a long brow turned as far as a short one stands on end: on a photo the mood turns it a little over half as far
 * (evil about 30 degrees, not 52).
 */
const BROW_SCALE=1.8,MOOD_TURN=.55;

/** World's brow styles (johansson-town/src/avatars/recipe.js PARTS.brows, without 'none'). */
export const BROW_STYLES=Object.freeze(['straight','arched','thick','thin','worried','bushy','angled','short','rounded','tapered','feathered','maro']);
export const BROW_LABELS=Object.freeze({straight:'Straight',arched:'Arched',thick:'Thick',thin:'Thin',worried:'Worried',bushy:'Bushy',angled:'Angled',
 short:'Short',rounded:'Rounded',tapered:'Tapered',feathered:'Feathered',maro:'Maro'});
export const BROW_COLOURS=Object.freeze([
 Object.freeze({id:'ink',label:'Ink',colour:'#1c1714'}),Object.freeze({id:'brown',label:'Brown',colour:'#6b4429'}),
 Object.freeze({id:'ginger',label:'Ginger',colour:'#b4552a'}),Object.freeze({id:'blonde',label:'Blonde',colour:'#d9b86a'}),
 Object.freeze({id:'witch',label:'Witch',colour:'#7d4fa8'}),
]);
/** The residents' eyes that read on a photo: their own open eyes, and the symbol eyes of the funny faces. */
export const EYE_STYLES=Object.freeze([
 Object.freeze({id:'sparkle',label:'Sparkle',style:'sparkle',state:'open'}),Object.freeze({id:'doe',label:'Doe',style:'doe',state:'open'}),
 Object.freeze({id:'starry',label:'Starry',style:'starry',state:'open'}),Object.freeze({id:'heart',label:'Hearts',style:'round',state:'heart'}),
 Object.freeze({id:'star',label:'Stars',style:'round',state:'star'}),Object.freeze({id:'spiral',label:'Dizzy',style:'round',state:'spiral'}),
 Object.freeze({id:'shock',label:'Shock',style:'round',state:'shock'}),Object.freeze({id:'bawl',label:'Bawling',style:'round',state:'bawl'}),
]);
/** World's eye colours (recipe.js COLOURS.eyes). */
export const EYE_COLOURS=Object.freeze([
 Object.freeze({id:'brown',label:'Brown',colour:'#5a3a22'}),Object.freeze({id:'dark',label:'Dark',colour:'#2a1d16'}),
 Object.freeze({id:'blue',label:'Blue',colour:'#3d6a8a'}),Object.freeze({id:'green',label:'Green',colour:'#4a7a4a'}),
 Object.freeze({id:'violet',label:'Violet',colour:'#6a5a8a'}),
]);
/** What a mood looks like, in words. */
export const moodLabel=m=>m<-.4?'Worried':m<.5?'Calm':m<1.55?'Cross':'Evil';

export function normaliseStamps(value){
 const b=value?.brows||{},e=value?.eyes||{},h=value?.hat||{};
 return {
  brows:{style:BROW_STYLES.includes(b.style)?b.style:'none',mood:clamp(number(b.mood,1.7),-1.5,1.9),
   colour:BROW_COLOURS.some(c=>c.id===b.colour)?b.colour:'ink',size:clamp(number(b.size,1),.5,1.8),height:clamp(number(b.height,0),-1,1)},
  eyes:{style:EYE_STYLES.some(s=>s.id===e.style)?e.style:'none',colour:EYE_COLOURS.some(c=>c.id===e.colour)?e.colour:'brown',size:clamp(number(e.size,1),.6,1.6)},
  shine:clamp(number(value?.shine,0),0,1),
  hat:{id:typeof h.id==='string'&&/^[a-z0-9-]{1,40}\/[a-z0-9-]{1,40}$/.test(h.id)?h.id:'none',size:clamp(number(h.size,1),.6,1.6),height:clamp(number(h.height,0),-1,1)},
  finish:value?.finish==='sticker'?'sticker':'drawn',
 };
}
export const stampsActive=s=>s.brows.style!=='none'||s.eyes.style!=='none'||s.shine>0||s.hat.id!=='none';
/** Which parts are on, in words ("Brows · Hat"), or 'Off'. */
export function stampsSummary(value){
 const s=normaliseStamps(value),on=[s.brows.style!=='none'&&'Brows',s.eyes.style!=='none'&&'Eyes',s.shine>0&&'Shine',s.hat.id!=='none'&&'Hat'].filter(Boolean);
 return on.length?on.join(' · '):'Off';
}

/**
 * The face on a W × H picture, in its pixels: the two eyes (left and right as seen), the point between them, the span
 * between them, the eye line's angle, and where the head's crown is and how wide the head is (from the eyes: a head is
 * about 2.4 eye-spans wide and its crown about 1.75 above the eyes).
 */
export function faceSpace(faceValue,W,H){
 const f=normaliseFace(faceValue);if(!f||!(W>0&&H>0))return null;
 const fw=f.w*W,fh=f.h*H,cx=(f.x+f.w/2)*W,cy=(f.y+f.h/2)*H,a=f.angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
 const at=(u,v)=>{const lx=(u-.5)*fw,ly=(v-.5)*fh;return [cx+ca*lx-sa*ly,cy+sa*lx+ca*ly];};
 const [p,q]=f.eyes[0].x<=f.eyes[1].x?f.eyes:[f.eyes[1],f.eyes[0]],left=at(p.x,p.y),right=at(q.x,q.y);
 const dist=Math.max(1e-6,Math.hypot(right[0]-left[0],right[1]-left[1])),angle=Math.atan2(right[1]-left[1],right[0]-left[0]);
 const mid=[(left[0]+right[0])/2,(left[1]+right[1])/2],up=[Math.sin(angle),-Math.cos(angle)];
 return {left,right,mid,dist,angle,up,crown:[mid[0]+up[0]*dist*1.75,mid[1]+up[1]*dist*1.75],headWidth:dist*2.4};
}
/** Lays the residents' face (face.js's 256-unit square) over the photo, its two eyes on the photo's eyes. */
function onFace(g,space){
 const k=space.dist/(2*FACE.spread);
 g.translate(space.mid[0],space.mid[1]);g.rotate(space.angle);g.scale(k,k);g.translate(-128,-FACE.eyeY);
}
/** Where the brows sit, in the face's units: cross brows come down and worried ones go up, as face.js's moods move them. */
export const browY=b=>FACE.browY+(b.mood>0?4:3)*b.mood-b.height*14;

function drawBrows(g,s,space){
 const b=s.brows;if(b.style==='none')return;
 const brows={style:b.style,colour:BROW_COLOURS.find(c=>c.id===b.colour).colour};
 g.save();onFace(g,space);g.lineJoin='round';
 for(const side of [-1,1])drawBrow(g,128+side*FACE.browSpread,browY(b),FACE.browS*BROW_SCALE*b.size,side,brows,0,b.mood*MOOD_TURN);
 g.restore();
}
function drawEyes(g,s,space){
 const e=s.eyes;if(e.style==='none')return;
 const kind=EYE_STYLES.find(x=>x.id===e.style),eyes={style:kind.style,colour:EYE_COLOURS.find(c=>c.id===e.colour).colour};
 g.save();onFace(g,space);g.lineCap='round';g.lineJoin='round';
 for(const side of [-1,1])drawEye(g,128+side*FACE.spread,FACE.eyeY,FACE.eyeS*e.size,side,eyes,kind.state,[0,0],0,1);
 g.restore();
}
/**
 * Manga shine: a printed manga eye's catchlights on the photo's own eyes. The window's light is high on the iris and on
 * the same side in both eyes (one light), with its small reflection low on the other side; stronger, a little star.
 */
function drawShine(g,s,space){
 const k=s.shine;if(!(k>0))return;
 const r=space.dist*.085;   // the iris: about 11.7 mm across against 63 mm between the pupils
 g.save();g.fillStyle='#fff';
 for(const [x,y] of [space.left,space.right]){
  g.save();g.translate(x,y);g.rotate(space.angle);g.globalAlpha=.55+.4*k;
  g.shadowColor='rgba(255,255,255,.75)';g.shadowBlur=r*.18;
  const big=.7+.55*k;
  g.beginPath();g.ellipse(-r*.32,-r*.36,r*.34*big,r*.26*big,-.55,0,TAU);g.fill();
  g.beginPath();g.arc(r*.38,r*.34,r*.12*(.7+.6*k),0,TAU);g.fill();
  if(k>.6){const t=(k-.6)/.4,R=r*.42*t,cx=-r*.62,cy=-r*.92;g.globalAlpha=.9*t;g.beginPath();
   for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2,q=i%2?R*.22:R;g.lineTo(cx+Math.cos(a)*q,cy+Math.sin(a)*q);}g.closePath();g.fill();}
  g.restore();
 }
 g.restore();
}
/** A headpiece: its crown on the head's crown, as wide as the head, at the eyes' angle. Returns false if not loaded. */
function drawHat(g,s,space,images){
 const h=s.hat;if(h.id==='none')return true;
 const {img,hat}=images?.get(h.id)||{};
 if(!img||!hat)return false;
 const width=space.headWidth*h.size/hat.width,height=width*(img.naturalHeight||img.height)/(img.naturalWidth||img.width);
 g.save();g.translate(space.crown[0]+space.up[0]*h.height*space.dist*.6,space.crown[1]+space.up[1]*h.height*space.dist*.6);g.rotate(space.angle);
 g.imageSmoothingQuality='high';g.drawImage(img,-hat.crown[0]*width,-hat.crown[1]*height,width,height);g.restore();
 return true;
}

/** A thin white die-cut rim round whatever `draw(g)` paints, as the sheets' stickers have. */
function withRim(g,space,W,H,draw){
 const pad=space.dist*3.2,x0=Math.max(0,Math.floor(space.mid[0]-pad)),y0=Math.max(0,Math.floor(space.mid[1]-pad)),
  x1=Math.min(Math.ceil(W),Math.ceil(space.mid[0]+pad)),y1=Math.min(Math.ceil(H),Math.ceil(space.mid[1]+pad)),w=x1-x0,h=y1-y0;
 if(w<1||h<1)return;
 const art=document.createElement('canvas');art.width=w;art.height=h;
 const a=art.getContext('2d');a.translate(-x0,-y0);draw(a);
 const rim=document.createElement('canvas');rim.width=w;rim.height=h;
 const r=rim.getContext('2d'),edge=Math.max(1.5,space.dist*.028);
 for(let i=0;i<16;i++){const t=i/16*TAU;r.drawImage(art,Math.cos(t)*edge,Math.sin(t)*edge);}
 r.globalCompositeOperation='source-in';r.fillStyle='#fffdf8';r.fillRect(0,0,w,h);r.globalCompositeOperation='source-over';
 g.save();g.shadowColor='rgba(0,0,0,.22)';g.shadowBlur=edge*1.4;g.shadowOffsetY=edge*.5;g.drawImage(rim,x0,y0);g.restore();
 g.drawImage(art,x0,y0);
 art.width=art.height=rim.width=rim.height=0;
}

/**
 * Draws the stickers of `stampsValue` on the face of a W × H picture onto g, in that picture's pixels (a caller showing a
 * crop translates g first). `finish` draws only the stamps of that finish ('drawn' before the Looks, 'sticker' after).
 * Returns false if a hat's picture is not loaded yet (loadStampImages), true otherwise.
 */
export function drawFaceStamps(g,stampsValue,faceValue,W,H,{images=null,finish=null}={}){
 const s=normaliseStamps(stampsValue),space=faceSpace(faceValue,W,H);
 if(!space||!stampsActive(s)||(finish&&s.finish!==finish))return true;
 // The shine is the photo's own eyes catching the light: never rimmed, and under drawn eyes (which have their own).
 drawShine(g,s,space);
 const parts=a=>{drawEyes(a,s,space);drawBrows(a,s,space);};
 if(s.finish==='sticker'&&(s.brows.style!=='none'||s.eyes.style!=='none'))withRim(g,space,W,H,parts);
 else parts(g);
 return drawHat(g,s,space,images);
}

/** The pictures the stamps need (a hat's), decoded: resolves to a Map id → {img, hat}, shared by every call. */
const loaded=new Map();
export async function loadStampImages(stampsValue){
 const s=normaliseStamps(stampsValue);
 if(s.hat.id!=='none'&&!loaded.has(s.hat.id)){
  const {loadStickerSets,stickerById,stickerImage}=await sheets();
  await loadStickerSets();
  const hat=stickerById(s.hat.id)?.hat;
  if(hat)loaded.set(s.hat.id,{img:await stickerImage(s.hat.id),hat});
 }
 return loaded;
}
export const stampImages=loaded;

/** The headpieces on the sticker sheets (entries with `hat`): [{id, gloss, thumbUrl}]. */
export async function hatChoices(){
 const m=await(await sheets()).loadStickerSets();
 return m.sets.flatMap(set=>set.stickers.filter(s=>s.hat).map(s=>({id:s.id,gloss:s.gloss||'Hat',thumbUrl:s.thumbUrl})));
}

/** A small picture of a pair of brows or eyes for the style buttons, on light paper (the brows are dark ink). */
export function partPreview(canvas,part,value){
 const s=normaliseStamps(value),g=canvas.getContext('2d'),W=canvas.width,H=canvas.height;
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W,H);
 const k=W/(4*FACE.spread),y=part==='brows'?browY(s.brows):FACE.eyeY;
 g.setTransform(k,0,0,k,W/2-128*k,H/2-y*k);g.lineCap='round';g.lineJoin='round';
 if(part==='brows'&&s.brows.style!=='none'){
  const brows={style:s.brows.style,colour:BROW_COLOURS.find(c=>c.id===s.brows.colour).colour};
  for(const side of [-1,1])drawBrow(g,128+side*FACE.browSpread,y,FACE.browS*BROW_SCALE*.8,side,brows,0,s.brows.mood*MOOD_TURN);
 }
 if(part==='eyes'&&s.eyes.style!=='none'){
  const kind=EYE_STYLES.find(x=>x.id===s.eyes.style),eyes={style:kind.style,colour:EYE_COLOURS.find(c=>c.id===s.eyes.colour).colour};
  for(const side of [-1,1])drawEye(g,128+side*FACE.spread,y,FACE.eyeS*.8,side,eyes,kind.state,[0,0],0,1);
 }
 g.setTransform(1,0,0,1,0,0);
}
