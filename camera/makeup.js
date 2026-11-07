/**
 * Makeup that the app puts on: named looks, drawn from the face the face pack found (face-pack.js), on the face's own
 * masks: the lips (outer loop minus inner), the cheeks, the band under each eye, the whites and irises of the eyes,
 * the teeth when the mouth is open, the brows, the eyeliner (a tapered line along the upper lash line, with a wing
 * when the look asks), the eyeshadow (a feathered wash over the lid toward the brow) and the skin (the oval less the
 * features, gated by the skin's own colour so hair and glasses are left alone). Every colour comes from the person:
 * the lip, blush and shadow shades are the own lip and skin colours moved toward a look's shade in OKLab, never a flat
 * paint. Skin is evened by splitting its frequencies: the fine texture (pores, hairs) is kept, the mid-scale blotches
 * are calmed, the large shapes stay.
 *
 * Reversible and on the device: the source bytes are never changed; the recipe keeps `look`, `strength`, a `shade`
 * override, the fine-tune multipliers and the guide (`face`, makeup-guide.js). A photo whose face was placed with the
 * guide alone (no landmarks) gets masks synthesised from it (faceFromGuide).
 */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const number=(v,fallback)=>v!=null&&Number.isFinite(+v)?+v:fallback;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const point=(p,x,y)=>({x:clamp(number(p?.x,x),.08,.92),y:clamp(number(p?.y,y),.08,.92)});

// ---------- Colour: sRGB <-> OKLab ----------
const LIN=new Float32Array(256);for(let i=0;i<256;i++){const c=i/255;LIN[i]=c<=.04045?c/12.92:((c+.055)/1.055)**2.4;}
const GAM=new Float32Array(4097);for(let i=0;i<=4096;i++){const v=i/4096;GAM[i]=(v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055)*255;}
const gam=v=>{if(v<=0)return 0;if(v>=1)return 255;const t=v*4096,i=t|0;return GAM[i]+(GAM[i+1]-GAM[i])*(t-i);};
function toLab(r,g,b,out,o=0){
 const lr=LIN[r],lg=LIN[g],lb=LIN[b];
 const l=Math.cbrt(.4122214708*lr+.5363325363*lg+.0514459929*lb),m=Math.cbrt(.2119034982*lr+.6806995451*lg+.1073969566*lb),s=Math.cbrt(.0883024619*lr+.2817188376*lg+.6299787005*lb);
 out[o]=.2104542553*l+.793617785*m-.0040720468*s;out[o+1]=1.9779984951*l-2.428592205*m+.4505937099*s;out[o+2]=.0259040371*l+.7827717662*m-.808675766*s;
}
function toRgb(L,a,b,out,o){
 const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
 out[o]=gam(4.0767416621*l-3.3077115913*m+.2309699292*s);out[o+1]=gam(-1.2684380046*l+2.6097574011*m-.3413193965*s);out[o+2]=gam(-.0041960863*l-.7034186147*m+1.707614701*s);
}
const hexLab=hex=>{const n=parseInt(hex.slice(1),16),o=new Float32Array(3);toLab(n>>16&255,n>>8&255,n&255,o);return {L:o[0],a:o[1],b:o[2]};};

// ---------- The looks and the shades ----------
/**
 * The lip colours (the owner, 3 November 2026: "I want to be able to choose more colors in the lipstick"): the first
 * eight are the ones the looks name; the rest are for choosing by hand, from a nude to a black and two for fun. A
 * colour chosen by hand is put on fully (makeupPixels: nine tenths of the way, the lip's own light kept), where a look's
 * own shade is only moved toward. `blush:false` keeps the blush at the look's tone (a blue or a black cheek is no blush).
 */
export const MAKEUP_SHADES=Object.freeze([
 {id:'rose',label:'Rose',colour:'#bf425f'},{id:'peach',label:'Peach',colour:'#d9775a'},{id:'berry',label:'Berry',colour:'#8f2f4f'},
 {id:'red',label:'Red',colour:'#c81e3a'},{id:'coral',label:'Coral',colour:'#e4654f'},{id:'plum',label:'Plum',colour:'#7d3b63'},
 {id:'nude',label:'Nude',colour:'#c48a78'},{id:'bronze',label:'Bronze',colour:'#b5653a'},
 {id:'cherry',label:'Cherry',colour:'#d8102c'},{id:'hotpink',label:'Hot pink',colour:'#f0338f'},{id:'fuchsia',label:'Fuchsia',colour:'#c0177c'},
 {id:'orange',label:'Orange',colour:'#f2591f'},{id:'brick',label:'Brick',colour:'#a8392b'},{id:'mauve',label:'Mauve',colour:'#a3698d'},
 {id:'wine',label:'Wine',colour:'#5a1430',blush:false},{id:'chocolate',label:'Chocolate',colour:'#5e3327',blush:false},
 {id:'violet',label:'Violet',colour:'#7a3ab8',blush:false},{id:'blue',label:'Blue',colour:'#2c4fd0',blush:false},{id:'black',label:'Black',colour:'#241a22',blush:false},
].map(s=>Object.freeze({...s,lab:hexLab(s.colour)})));
const shadeLab=id=>MAKEUP_SHADES.find(s=>s.id===id)?.lab;
const shadeBlushes=id=>MAKEUP_SHADES.find(s=>s.id===id)?.blush!==false;
/**
 * The eyeshadow tones, as moves from the person's own skin colour in OKLab (a: toward red, b: toward yellow) with how
 * much the lid darkens (k) or lightens (lift): a tone is the same wash on every skin, never one flat colour.
 */
export const SHADOW_TONES=Object.freeze({
 taupe:{a:-.02,b:-.02,k:.22},smoke:{a:-.02,b:-.035,k:.4},bronze:{a:.02,b:.06,k:.18},rose:{a:.08,b:-.01,k:.12},
 plum:{a:.07,b:-.07,k:.3},gold:{a:0,b:.08,k:0,lift:.06},peach:{a:.05,b:.04,k:.06},
});
/** The eyeliner tones: the lash line drawn toward one colour. */
export const LINER_TONES=Object.freeze({black:{L:.12,a:0,b:0},brown:{L:.25,a:.03,b:.05}});
/**
 * A look is the whole face at once: amounts 0–1 for each part at Strength 100%, tuned to read as natural on a
 * photograph; the lips name a shade (or 'own', the lips' own colour deepened), how far toward it (mix), the chroma gain,
 * a lightness factor and a gloss; the blush a tone and whether it goes across the nose (a day in the sun); the liner
 * a tone and how far its wing goes (0: none, 1: a full cat eye); the shadow a tone.
 */
export const MAKEUP_LOOKS=Object.freeze([
 {id:'natural',label:'Natural',skin:.5,under:.5,lips:{shade:'own',mix:.3,gain:1.15,light:.98,gloss:.3},blush:{amount:.3,tone:'own'},eyes:.35,teeth:.35,brows:.2,liner:{amount:.25,tone:'brown',wing:0},shadow:{amount:.25,tone:'taupe'}},
 {id:'fresh',label:'Fresh',skin:.55,under:.6,lips:{shade:'peach',mix:.45,gain:1.25,light:.97,gloss:.7},blush:{amount:.5,tone:'peach'},eyes:.45,teeth:.5,brows:.2,liner:{amount:.2,tone:'brown',wing:0},shadow:{amount:.3,tone:'peach'}},
 {id:'clean',label:'Clean',skin:.75,under:.75,lips:{shade:'own',mix:0,gain:1,light:1,gloss:0},blush:{amount:0,tone:'own'},eyes:.4,teeth:.6,brows:.1,liner:{amount:0,tone:'brown',wing:0},shadow:{amount:0,tone:'taupe'}},
 {id:'soft',label:'Soft glam',skin:.6,under:.55,lips:{shade:'rose',mix:.5,gain:1.2,light:.95,gloss:.4},blush:{amount:.45,tone:'rose'},eyes:.4,teeth:.4,brows:.35,liner:{amount:.5,tone:'black',wing:.35},shadow:{amount:.45,tone:'rose'}},
 {id:'evening',label:'Evening',skin:.6,under:.6,lips:{shade:'berry',mix:.6,gain:1.2,light:.9,gloss:.35},blush:{amount:.3,tone:'rose'},eyes:.5,teeth:.5,brows:.45,liner:{amount:.7,tone:'black',wing:.6},shadow:{amount:.6,tone:'smoke'}},
 {id:'bold',label:'Bold lip',skin:.5,under:.5,lips:{shade:'red',mix:.8,gain:1.3,light:.88,gloss:.25},blush:{amount:.2,tone:'own'},eyes:.4,teeth:.6,brows:.35,liner:{amount:.55,tone:'black',wing:.45},shadow:{amount:.3,tone:'taupe'}},
 {id:'sun',label:'Sun-kissed',skin:.45,under:.5,lips:{shade:'coral',mix:.35,gain:1.2,light:.97,gloss:.6},blush:{amount:.55,tone:'bronze',wide:true},eyes:.3,teeth:.4,brows:.15,warmth:.4,liner:{amount:.2,tone:'brown',wing:0},shadow:{amount:.4,tone:'bronze'}},
 {id:'rose',label:'Rose',skin:.5,under:.5,lips:{shade:'rose',mix:.6,gain:1.25,light:.94,gloss:.4},blush:{amount:.5,tone:'rose'},eyes:.35,teeth:.4,brows:.3,liner:{amount:.4,tone:'brown',wing:.2},shadow:{amount:.45,tone:'rose'}},
].map(Object.freeze));
const lookById=id=>MAKEUP_LOOKS.find(l=>l.id===id)||null;
const TUNE=['skin','lips','blush','eyes','teeth'];

// ---------- The recipe ----------
export function normaliseFace(value){
 if(!value||typeof value!=='object')return null;
 const w=clamp(number(value.w,.3),.025,1),h=clamp(number(value.h,.4),.025,1);
 return {x:clamp(number(value.x,.5-w/2),0,1-w),y:clamp(number(value.y,.5-h/2),0,1-h),w,h,
  angle:clamp(number(value.angle,0),-45,45),
  eyes:[point(value.eyes?.[0],.31,.4),point(value.eyes?.[1],.69,.4)],
  mouth:{...point(value.mouth,.5,.75),w:clamp(number(value.mouth?.w,.36),.12,.6),h:clamp(number(value.mouth?.h,.08),.025,.2)}};
}
/**
 * {look, strength, shade ('auto' = the look's own), tune {skin, lips, blush, eyes, teeth} (0–1.5, 1 = as the look),
 * face}. An older recipe with Skin/Lips/Blush amounts and no look becomes the 'custom' look: those amounts, as they
 * were, on the new masks.
 */
export function normaliseMakeup(value){
 const v=value&&typeof value==='object'?value:{};
 let look=typeof v.look==='string'&&(v.look==='none'||v.look==='custom'||lookById(v.look))?v.look:null;
 const tune={};
 if(!look){
  const legacy={skin:clamp(number(v.skin,0),0,1),lips:clamp(number(v.lips,0),0,1),blush:clamp(number(v.blush,0),0,1)};
  if(legacy.skin||legacy.lips||legacy.blush){look='custom';Object.assign(tune,{skin:legacy.skin,lips:legacy.lips,blush:legacy.blush,eyes:0,teeth:0});}
  else{look='none';for(const k of TUNE)tune[k]=1;}
 }else for(const k of TUNE)tune[k]=clamp(number(v.tune?.[k],look==='custom'?0:1),0,1.5);
 return {look,strength:clamp(number(v.strength,1),0,1),shade:MAKEUP_SHADES.some(s=>s.id===v.shade)?v.shade:'auto',tune,face:normaliseFace(v.face)};
}
/** The effective amounts of a recipe: the look's, by Strength, by the fine-tune. */
export function makeupAmounts(m){
 const z={skin:0,under:0,lips:{shade:'own',mix:0,gain:1,light:1,gloss:0},lipsAmount:0,blush:{amount:0,tone:'own'},eyes:0,teeth:0,brows:0,warmth:0,liner:{amount:0,tone:'brown',wing:0},shadow:{amount:0,tone:'taupe'}};
 if(m.look==='none')return z;
 const s=m.strength,t=m.tune;
 // A lip colour chosen by hand goes on fully; the blush follows it only when it is a blush colour.
 const chosen=m.shade!=='auto',blushTone=own=>chosen&&shadeBlushes(m.shade)?m.shade:own;
 if(m.look==='custom')return {...z,skin:t.skin*s,under:t.skin*s*.6,lips:{shade:chosen?m.shade:'rose',mix:chosen?.92:.6,gain:1.25,light:.95,gloss:.3,chosen},lipsAmount:t.lips*s,blush:{amount:t.blush*s,tone:blushTone('rose')},eyes:t.eyes*s,teeth:t.teeth*s,brows:0};
 const l=lookById(m.look);
 // The liner and the shadow go with the Eyes fine-tune, as the whites and irises do.
 return {skin:l.skin*s*t.skin,under:l.under*s*t.skin,lips:{...l.lips,shade:chosen?m.shade:l.lips.shade,mix:chosen?.92:l.lips.mix,chosen},lipsAmount:s*t.lips,
  blush:{...l.blush,amount:l.blush.amount*s*t.blush,tone:blushTone(l.blush.tone)},eyes:l.eyes*s*t.eyes,teeth:l.teeth*s*t.teeth,brows:(l.brows||0)*s,warmth:(l.warmth||0)*s,
  liner:{tone:LINER_TONES[l.liner?.tone]?l.liner.tone:'brown',wing:clamp(number(l.liner?.wing,0),0,1),amount:clamp(number(l.liner?.amount,0),0,1)*s*t.eyes},
  shadow:{tone:SHADOW_TONES[l.shadow?.tone]?l.shadow.tone:'taupe',amount:clamp(number(l.shadow?.amount,0),0,1)*s*t.eyes}};
}
export const makeupActive=(m,faces=[])=>m.look!=='none'&&(faces.length>0||!!m.face);

// ---------- Faces ----------
/** Masks need a compact face (face-pack.js); a guide placed by hand (no landmarks) gets one synthesised from it. */
export function faceFromGuide(g){
 const f=normaliseFace(g);if(!f)return null;
 const a=f.angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),cx=f.x+f.w/2,cy=f.y+f.h/2;
 const at=(u,v)=>{const dx=(u-.5)*f.w,dy=(v-.5)*f.h;return [cx+ca*dx-sa*dy,cy+sa*dx+ca*dy];};
 const ring=(u,v,rx,ry,n,from=0,to=2*Math.PI)=>Array.from({length:n},(_,i)=>{const t=from+(to-from)*i/(n-1);return at(u+rx*Math.cos(t),v+ry*Math.sin(t));});
 const [e0,e1]=f.eyes,m=f.mouth,ew=Math.abs(e1.x-e0.x)*.28||.08;
 const eye=e=>[...ring(e.x,e.y,ew,ew*.45,9,Math.PI,2*Math.PI),...ring(e.x,e.y,ew,ew*.4,7,0,Math.PI).slice(1,-1).reverse(),...[[0,0]]].slice(0,16).map((p,i,arr)=>p);
 const eyeLoop=e=>{const up=ring(e.x,e.y,ew,ew*.45,9,Math.PI,2*Math.PI),lo=ring(e.x,e.y,ew,ew*.4,9,0,Math.PI);return [...up,...lo.slice(1,-1).reverse()].slice(0,16);};
 const brow=e=>{const up=ring(e.x,e.y-ew*.9,ew*1.15,ew*.3,5,Math.PI,2*Math.PI),lo=ring(e.x,e.y-ew*.75,ew*1.15,ew*.2,5,Math.PI,2*Math.PI).reverse();return [...up,...lo];};
 const lipsOuter=[...ring(m.x,m.y,m.w/2,m.h*.45,11,Math.PI,2*Math.PI),...ring(m.x,m.y,m.w/2,m.h*.55,11,0,Math.PI).slice(1,-1).reverse()].slice(0,20);
 const lipsInner=[...ring(m.x,m.y,m.w*.42,m.h*.12,11,Math.PI,2*Math.PI),...ring(m.x,m.y,m.w*.42,m.h*.12,11,0,Math.PI).slice(1,-1).reverse()].slice(0,20);
 const oval=ring(.5,.51,.48,.49,36);
 const r=ew*.3;
 return {lipsOuter,lipsInner,eyeL:eyeLoop(e0),eyeR:eyeLoop(e1),browL:brow(e0),browR:brow(e1),oval,
  eyes:[{...Object.fromEntries([['x',at(e0.x,e0.y)[0]],['y',at(e0.x,e0.y)[1]]]),r},{...Object.fromEntries([['x',at(e1.x,e1.y)[0]],['y',at(e1.x,e1.y)[1]]]),r}],
  noseTip:at(.5,.6),noseBridge:at(.5,.42),chin:at(.5,.98),forehead:at(.5,.04),cheekL:at(.26,.62),cheekR:at(.74,.62),noseWingL:at(.42,.62),noseWingR:at(.58,.62),open:0,smile:0,blinkL:0,blinkR:0};
}
/** The faces a makeup pass draws on: the found ones, else the guide's. */
export function makeupFaces(m,faces){return faces?.length?faces:m.face?[faceFromGuide(m.face)].filter(Boolean):[];}

// ---------- Masks ----------
function boxBlur(src,w,h,r){
 if(r<1)return src;
 const tmp=new Float32Array(src.length),out=new Float32Array(src.length);
 for(let pass=0;pass<2;pass++){
  const from=pass?out:src;
  for(let y=0;y<h;y++){let acc=0;const row=y*w;for(let x=-r;x<=r;x++)acc+=from[row+clamp(x,0,w-1)];for(let x=0;x<w;x++){tmp[row+x]=acc/(2*r+1);acc+=from[row+clamp(x+r+1,0,w-1)]-from[row+clamp(x-r,0,w-1)];}}
  for(let x=0;x<w;x++){let acc=0;for(let y=-r;y<=r;y++)acc+=tmp[clamp(y,0,h-1)*w+x];for(let y=0;y<h;y++){out[y*w+x]=acc/(2*r+1);acc+=tmp[clamp(y+r+1,0,h-1)*w+x]-tmp[clamp(y-r,0,h-1)*w+x];}}
 }
 return out;
}
/** A region of the image round one face, with its masks (Float32 0–1) rasterised at the image's resolution. */
function faceMasks(face,W,H){
 const xs=face.oval.map(p=>p[0]*W),ys=face.oval.map(p=>p[1]*H);
 const ox=Math.min(...xs),oy=Math.min(...ys),ow=Math.max(...xs)-ox,oh=Math.max(...ys)-oy;
 if(!(ow>4&&oh>4))return null;
 const x0=Math.max(0,Math.floor(ox-ow*.3)),y0=Math.max(0,Math.floor(oy-oh*.25)),x1=Math.min(W,Math.ceil(ox+ow*1.3)),y1=Math.min(H,Math.ceil(oy+oh*1.25));
 const w=x1-x0,h=y1-y0;if(w<4||h<4)return null;
 const canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});
 const g=canvas.getContext('2d',{willReadFrequently:true});
 const P=p=>[p[0]*W-x0,p[1]*H-y0];
 // A loop of source-normalised points filled (with a hole, a stroke), or, with `px`, of points already in the region's pixels.
 const poly=(ps,{stroke=0,hole=null,px:inPixels=false}={})=>{
  const Q=inPixels?(p=>p):P;
  g.clearRect(0,0,w,h);g.fillStyle='#fff';g.strokeStyle='#fff';g.lineJoin='round';g.lineCap='round';
  g.beginPath();ps.forEach((p,i)=>{const [x,y]=Q(p);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();
  if(hole){hole.forEach((p,i)=>{const [x,y]=Q(p);i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.fill('evenodd');}else g.fill();
  if(stroke>0){g.lineWidth=stroke;g.stroke();}
  const d=g.getImageData(0,0,w,h).data,m=new Float32Array(w*h);for(let i=0;i<m.length;i++)m[i]=d[4*i+3]/255;return m;
 };
 const ellipse=(c,rx,ry,angle)=>{g.clearRect(0,0,w,h);g.fillStyle='#fff';g.beginPath();const [x,y]=P(c);g.ellipse(x,y,rx,ry,angle,0,Math.PI*2);g.fill();const d=g.getImageData(0,0,w,h).data,m=new Float32Array(w*h);for(let i=0;i<m.length;i++)m[i]=d[4*i+3]/255;return m;};
 const eyeW=Math.hypot((face.eyes[1].x-face.eyes[0].x)*W,(face.eyes[1].y-face.eyes[0].y)*H)||ow*.4;
 const angle=Math.atan2((face.eyes[1].y-face.eyes[0].y)*H,(face.eyes[1].x-face.eyes[0].x)*W);
 const down=[-Math.sin(angle),Math.cos(angle)];
 const lipB=face.lipsOuter.map(P),lipW=Math.max(...lipB.map(p=>p[0]))-Math.min(...lipB.map(p=>p[0]))||eyeW*.6,lipH=Math.max(...lipB.map(p=>p[1]))-Math.min(...lipB.map(p=>p[1]))||eyeW*.25;
 const px=v=>Math.max(1,Math.round(v));
 const lips=boxBlur(poly(face.lipsOuter,{hole:face.lipsInner}),w,h,px(lipW*.03));
 const inner=boxBlur(poly(face.lipsInner),w,h,px(lipW*.015));
 const eyeMask=loop=>boxBlur(poly(loop),w,h,px(eyeW*.01));
 const eyeL=eyeMask(face.eyeL),eyeR=eyeMask(face.eyeR);
 const iris=e=>boxBlur(ellipse([e.x,e.y],e.r*W*1.08,e.r*W*1.08,0),w,h,px(e.r*W*.1));
 const irisL=iris(face.eyes[0]),irisR=iris(face.eyes[1]);
 const browMask=loop=>boxBlur(poly(loop,{stroke:eyeW*.08}),w,h,px(eyeW*.03));
 const browL=browMask(face.browL),browR=browMask(face.browR);
 // The band under each eye: the lower lid (the loop's second half) and the same points a little down the face.
 const under=loop=>{const lid=loop.slice(8).concat([loop[0]]);const far=lid.map(([x,y])=>[x+down[0]*eyeW*.42/W,y+down[1]*eyeW*.42/H]).reverse();return boxBlur(poly([...lid,...far]),w,h,px(eyeW*.09));};
 const underL=under(face.eyeL),underR=under(face.eyeR);
 const cheek=(c,wide)=>boxBlur(ellipse([c[0]+down[0]*eyeW*.1/W,c[1]+down[1]*eyeW*.1/H],eyeW*(wide?.75:.62),eyeW*(wide?.42:.3),angle),w,h,px(eyeW*.22));
 // Skin: the oval, less the eyes, brows, lips and nostrils, each with room round it.
 const cut=new Float32Array(w*h);
 for(const m of [poly(face.eyeL,{stroke:eyeW*.14}),poly(face.eyeR,{stroke:eyeW*.14}),poly(face.browL,{stroke:eyeW*.1}),poly(face.browR,{stroke:eyeW*.1}),poly(face.lipsOuter,{stroke:lipH*.35}),ellipse(face.noseWingL,eyeW*.07,eyeW*.05,0),ellipse(face.noseWingR,eyeW*.07,eyeW*.05,0)])for(let i=0;i<cut.length;i++)cut[i]=Math.max(cut[i],m[i]);
 const cutS=boxBlur(cut,w,h,px(eyeW*.03)),ovalM=boxBlur(poly(face.oval),w,h,px(ow*.03));
 const skin=new Float32Array(w*h);for(let i=0;i<skin.length;i++)skin[i]=ovalM[i]*(1-cutS[i]);
 const merge=(p,q)=>{const o=new Float32Array(w*h);for(let i=0;i<o.length;i++)o[i]=Math.max(p[i],q[i]);return o;};
 const eyeM=merge(eyeL,eyeR),irisM=merge(irisL,irisR),browM=merge(browL,browR),underM=merge(underL,underR),cheekM=merge(cheek(face.cheekL,false),cheek(face.cheekR,false));
 // The upper lid of an eye loop (its first nine points), in pixels, the outer corner first: the landmarker's loops start
 // at the outer corner, a loop drawn from the guide at the photo's left, so the corner further from the nose is taken.
 const up=[-down[0],-down[1]];
 const upperLid=(loop,left)=>{const lid=loop.slice(0,9).map(P);const outerFirst=left?lid[0][0]<=lid[8][0]:lid[0][0]>=lid[8][0];return outerFirst?lid:lid.reverse();};
 const temple=lid=>{const d=[lid[0][0]-lid[8][0],lid[0][1]-lid[8][1]],n=Math.hypot(d[0],d[1])||eyeW*.3;return [d[0]/n,d[1]/n];};
 // Eyeliner: a line on the lash line, thin at the inner corner and fuller at the outer, carried past the corner and
 // lifted toward the brow as a wing (0: none, 1: a full cat eye); never on the eye itself.
 const linerOf=(loop,left,wing)=>{
  const lid=upperLid(loop,left),outer=lid[0],d=temple(lid),t=k=>eyeW*(.036-.022*k/8);
  const top=lid.map((p,k)=>[p[0]+up[0]*t(k),p[1]+up[1]*t(k)]);
  const past=[top[0][0]+d[0]*eyeW*.03,top[0][1]+d[1]*eyeW*.03];
  const wx=d[0]+up[0]*.55,wy=d[1]+up[1]*.55,wn=Math.hypot(wx,wy),tip=[outer[0]+wx/wn*eyeW*.13*wing,outer[1]+wy/wn*eyeW*.13*wing];
  // The canvas's own anti-aliasing softens the edge; a line this thin takes a blur only on a large face.
  return boxBlur(poly([...lid,...top.slice(1).reverse(),past,tip],{px:true}),w,h,Math.round(eyeW*.004));
 };
 // Eyeshadow: a wash from the lash line up over the lid, highest over its middle, a little past the outer corner,
 // feathered toward the brow; the eye, the brow and the band under the eye are kept out of it.
 const shadowOf=(loop,left)=>{
  const lid=upperLid(loop,left),outer=lid[0],d=temple(lid),hgt=k=>eyeW*(.1+.17*Math.sin(Math.PI*k/8));
  const base=[[outer[0]+d[0]*eyeW*.07,outer[1]+d[1]*eyeW*.07],...lid];
  const top=[...lid.map((p,k)=>[p[0]+up[0]*hgt(k),p[1]+up[1]*hgt(k)]).reverse(),[outer[0]+(d[0]*.6+up[0]*.8)*eyeW*.16,outer[1]+(d[1]*.6+up[1]*.8)*eyeW*.16]];
  return boxBlur(poly([...base,...top],{px:true}),w,h,px(eyeW*.07));
 };
 let wideM=null,shadowM=null;const liners=new Map();
 return {x0,y0,w,h,eyeW,angle,lips,inner,eye:eyeM,iris:irisM,brow:browM,under:underM,skin,cheek:cheekM,
  // The sun's blush, across the cheeks and the nose, only when a look asks for it.
  get wide(){return wideM??=(()=>{const m=merge(merge(cheek(face.cheekL,true),cheek(face.cheekR,true)),boxBlur(ellipse([(face.noseBridge[0]+face.noseTip[0])/2,(face.noseBridge[1]+face.noseTip[1])/2],eyeW*.16,eyeW*.3,angle),w,h,px(eyeW*.12)));return m;})();},
  liner(wing){const key=Math.round(clamp(wing,0,1)*10)/10;let m=liners.get(key);if(!m){m=merge(linerOf(face.eyeL,true,key),linerOf(face.eyeR,false,key));for(let i=0;i<m.length;i++)m[i]*=1-eyeM[i];liners.set(key,m);}return m;},
  get shadow(){return shadowM??=(()=>{const m=merge(shadowOf(face.eyeL,true),shadowOf(face.eyeR,false));for(let i=0;i<m.length;i++)m[i]*=(1-eyeM[i])*(1-browM[i])*(1-underM[i]);return m;})();},
  open:face.open,blink:(face.blinkL+face.blinkR)/2};
}

// ---------- The pass ----------
/** Median of a channel over the pixels a mask holds: a 512-bin histogram over OKLab's range (L 0–1, a and b ±0.4). */
function medianWhere(lab,mask,n,ch,min=.6){
 const lo=ch?-.4:0,span=ch?.8:1,bins=new Uint32Array(512);let count=0;
 for(let i=0;i<n;i+=2)if(mask[i]>min){bins[clamp(Math.round((lab[3*i+ch]-lo)/span*511),0,511)]++;count++;}
 if(!count)return null;let acc=0;for(let k=0;k<512;k++){acc+=bins[k];if(acc*2>=count)return lo+(k+.5)/512*span;}return null;
}

/** What a face's pass needs that does not depend on the look: its masks, the region in OKLab, the blurs, the medians. */
function prepareFace(data,W,H,face){
 const M=faceMasks(face,W,H);if(!M)return null;
 const {x0,y0,w,h}=M,n=w*h;
 const lab=new Float32Array(n*3);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=((y0+y)*W+x0+x)*4,k=(y*w+x)*3;toLab(data[i],data[i+1],data[i+2],lab,k);}
 const chan=c=>{const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=lab[3*i+c];return o;};
 const L=chan(0),a=chan(1),b=chan(2);
 const rS=Math.max(1,Math.round(M.eyeW*.012)),rL=Math.max(2,Math.round(M.eyeW*.085));
 const Ls=boxBlur(L,w,h,rS),as=boxBlur(a,w,h,rS),bs=boxBlur(b,w,h,rS),Ll=boxBlur(L,w,h,rL),al=boxBlur(a,w,h,rL),bl=boxBlur(b,w,h,rL);
 const skinL=medianWhere(lab,M.skin,n,0)??.7,skinA=medianWhere(lab,M.skin,n,1)??.04,skinB=medianWhere(lab,M.skin,n,2)??.06;
 const lipL=medianWhere(lab,M.lips,n,0)??.5,lipA=medianWhere(lab,M.lips,n,1)??.1,lipB=medianWhere(lab,M.lips,n,2)??.04;
 const irisL=medianWhere(lab,M.iris,n,0,.5)??.35;
 // The skin's own colour, as a weight per pixel over the whole region (the lids take shadow, hair and lashes do not):
 // hair, lashes and glasses are not skin.
 const own=new Float32Array(n);
 for(let i=0;i<n;i++){const dL=(L[i]-skinL)/.2,da=(a[i]-skinA)/.07,db=(b[i]-skinB)/.07;own[i]=1-smooth(.9,1.8,Math.sqrt(dL*dL+da*da+db*db));}
 return {M,n,L,a,b,Ls,as,bs,Ll,al,bl,skinL,skinA,skinB,lipL,lipA,lipB,irisL,own};
}
const PREP=new WeakMap();
/** Pure renderer over RGBA pixels: the same bytes out where nothing is drawn, alpha kept. */
export function makeupPixels(image,value,faces=[]){
 const {data,width:W,height:H}=image;
 if(!Number.isInteger(W)||!Number.isInteger(H)||W<1||H<1||data?.length!==W*H*4)throw new TypeError('Complete RGBA pixels are required');
 const m=normaliseMakeup(value),list=makeupFaces(m,faces);
 if(!makeupActive(m,list))return image;
 const A=makeupAmounts(m);
 if(!(A.skin||A.under||A.lipsAmount||A.blush.amount||A.eyes||A.teeth||A.brows||A.liner.amount||A.shadow.amount))return image;
 const out=new Uint8ClampedArray(data);
 // Prepared faces are kept with the pixels they were measured on (a preview the editor holds), by face.
 let prepared=PREP.get(data);if(!prepared){prepared=new Map();PREP.set(data,prepared);}
 for(const face of list){
  const key=JSON.stringify(face);
  let P=prepared.get(key);if(!P){P=prepareFace(data,W,H,face);if(!P)continue;if(prepared.size>6)prepared.clear();prepared.set(key,P);}
  const {M,n,L,a,b,Ls,as,bs,Ll,al,bl,skinL,skinA,skinB,lipL,lipA,lipB,irisL,own}=P,{x0,y0,w,h}=M;
  const needSkin=A.skin>0||A.under>0;
  // Targets: the lips moved toward the look's shade (or their own colour deepened); the blush from the skin's colour.
  const shade=A.lips.shade==='own'?{L:lipL*.9,a:lipA*1.25,b:lipB*1.1}:shadeLab(A.lips.shade)||{L:lipL,a:lipA,b:lipB};
  const tA=lipA+(shade.a-lipA)*A.lips.mix,tB=lipB+(shade.b-lipB)*A.lips.mix;
  const tone=A.blush.tone==='own'?{a:skinA+.07,b:skinB+.02}:(t=>({a:skinA+(t.a-skinA)*.45+.02,b:skinB+(t.b-skinB)*.35}))(shadeLab(A.blush.tone)||{a:skinA+.1,b:skinB+.03});
  const teethGate=M.open>.08?1:smooth(.02,.08,M.open);
  const wide=!!A.blush.wide,cheekMask=wide?M.wide:M.cheek,skinM=M.skin,underM=M.under,lipsM=M.lips,innerM=M.inner,eyeM=M.eye,irisM=M.iris,browM=M.brow;
  const aSkin=A.skin,aUnder=A.under,aWarm=A.warmth,aBlush=A.blush.amount,aLips=A.lipsAmount,gain=A.lips.gain-1,lightK=1-A.lips.light,gloss=A.lips.gloss*.35,aTeeth=A.teeth,aEyes=A.eyes*(1-M.blink),aBrows=A.brows;
  // A chosen colour also sets the lip's lightness (a black darkens, a nude lightens); a look's shade keeps the lip's own.
  const toneA=(tone.a-skinA)*.85,toneB=(tone.b-skinB)*.85,dA=tA-lipA,dB=tB-lipB,lipRef=A.lips.chosen?lipL+(shade.L-lipL)*.7:lipL*A.lips.light;
  // The eyeshadow (a tone's move from the skin's own colour, on skin-coloured pixels of the lid) and the liner (the
  // lash line drawn toward its tone); the masks are drawn only when a look asks for them.
  const aShadow=A.shadow.amount,shadowM=aShadow>0?M.shadow:null,sh=SHADOW_TONES[A.shadow.tone],shA=sh.a*.9,shB=sh.b*.9,shK=sh.k,shLift=sh.lift||0;
  const aLiner=A.liner.amount,linerM=aLiner>0?M.liner(A.liner.wing):null,lt=LINER_TONES[A.liner.tone];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=y*w+x,o=((y0+y)*W+x0+x)*4;
   if(data[o+3]===0)continue;
   let Lp=L[i],ap=a[i],bp=b[i];
   const sk=skinM[i],ow=own[i];
   // Skin: the person's own skin evened, the fine texture kept; hair, lashes and glasses are not skin.
   if(needSkin&&sk>0&&ow>0){
    const ws=sk*ow*aSkin;
    if(ws>0){const ev=.85*ws,ev2=ev*1.05;Lp=Ll[i]+(Ls[i]-Ll[i])*(1-ev)+(Lp-Ls[i]);ap=al[i]+(as[i]-al[i])*(1-ev2)+(ap-as[i]);bp=bl[i]+(bs[i]-bl[i])*(1-ev2)+(bp-bs[i]);}
    const wu=underM[i]*ow*aUnder;
    if(wu>0){const lift=skinL-Lp;if(lift>0)Lp+=wu*.55*lift;ap+=wu*.5*(skinA-ap);bp+=wu*.5*(skinB-bp);}
    if(aWarm>0&&ws>0){ap+=ws*aWarm*.012;bp+=ws*aWarm*.03;}
   }
   // Blush: colour on the cheeks (and across the nose for the sun), the skin's own texture kept.
   if(aBlush>0&&sk>0){const wb=cheekMask[i]*sk*aBlush;if(wb>0){ap+=wb*toneA;bp+=wb*toneB;Lp-=wb*.015;}}
   // Lips: inside the lip loop, never on the teeth.
   const lp=lipsM[i];
   if(aLips>0&&lp>0){
    const chroma=Math.sqrt(ap*ap+bp*bp),teeth=teethGate*innerM[i]*smooth(.62,.8,Lp)*(1-smooth(.04,.1,chroma)),wl=lp*(1-teeth)*aLips;
    if(wl>0){
     // Colour on a surface follows its light: the shade's shift is fuller where the lip is lit, less in its shadow.
     const lit=Math.min(1.3,Math.max(.45,Lp/lipL));
     ap+=wl*(dA*lit+(ap-lipA)*gain);bp+=wl*(dB*lit+(bp-lipB)*gain);
     // Darkened as the look asks, with the lip's own shading kept (a little more, for gloss).
     Lp=lipRef+(Lp-lipL)*(1+gloss)*wl+(Lp-lipRef)*(1-wl);
    }
   }
   // Teeth: a yellow cast taken out when the mouth is open; the lips and tongue in the opening are left alone.
   const inn=innerM[i];
   if(aTeeth>0&&teethGate>0&&inn>0){
    const wt=inn*teethGate*aTeeth*smooth(.55,.72,Lp)*(1-smooth(.06,.13,Math.sqrt(ap*ap+bp*bp)));
    if(wt>0){if(bp>0)bp-=wt*bp*.8;if(ap>0)ap-=wt*ap*.5;Lp+=wt*.05*(1-Lp);}
   }
   // Eyes: the whites a little brighter and cleaner, the irises a little more alive.
   if(aEyes>0){
    const em=eyeM[i];
    if(em>0){
     const im=irisM[i],ws=(em-im)*aEyes;
     if(ws>0&&Lp>.45){Lp+=ws*.1*(1-Lp);ap*=1-ws*.4;bp*=1-ws*.4;}
     const wi=im*aEyes;
     if(wi>0){Lp=irisL+(Lp-irisL)*(1+.3*wi);ap*=1+.2*wi;bp*=1+.2*wi;if(Lp>.72)Lp+=wi*.08*(1-Lp);}
    }
   }
   // Brows: tidied, a touch fuller.
   if(aBrows>0){const wbr=browM[i]*aBrows;if(wbr>0){Lp-=wbr*.07*Lp;ap*=1-.3*wbr;bp*=1-.3*wbr;}}
   // Eyeshadow: the lid's own skin and shading, moved toward the tone and deepened (or lifted, for gold).
   if(shadowM){const wsd=shadowM[i]*ow*aShadow;if(wsd>0){ap+=wsd*shA;bp+=wsd*shB;Lp*=1-wsd*shK;if(shLift)Lp+=wsd*shLift*(1-Lp);}}
   // Eyeliner: the lash line, over everything else on the lid.
   if(linerM){const wl=linerM[i]*aLiner*.9;if(wl>0){Lp+=wl*(lt.L-Lp);ap+=wl*(lt.a-ap);bp+=wl*(lt.b-bp);}}
   if(Lp===L[i]&&ap===a[i]&&bp===b[i])continue;
   toRgb(Lp,ap,bp,out,o);
  }
 }
 return {data:out,width:W,height:H};
}

/** Does a face's look-independent work ahead of the first tap (an idle moment after the faces are found). */
export function prepareMakeup(image,faces){
 const {data,width:W,height:H}=image;if(!faces?.length||data?.length!==W*H*4)return;
 let prepared=PREP.get(data);if(!prepared){prepared=new Map();PREP.set(data,prepared);}
 for(const face of faces){const key=JSON.stringify(face);if(!prepared.has(key)){const P=prepareFace(data,W,H,face);if(P)prepared.set(key,P);}}
}
/** The source's pixels for a cache (see applyMakeup), read once. */
export function makeupSourcePixels(source,canvas,cache){
 const {width,height}=dimensions(source);
 if(cache&&cache.source===source&&cache.width===width&&cache.height===height)return cache.image;
 canvas.width=width;canvas.height=height;const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,width,height);
 const image=g.getImageData(0,0,width,height);if(cache){cache.source=source;cache.width=width;cache.height=height;cache.image=image;}return image;
}
const dimensions=source=>({width:source.naturalWidth||source.videoWidth||source.width,height:source.naturalHeight||source.videoHeight||source.height});
/** Returns source itself for the exact off path; otherwise a new/reused, full-size canvas. */
export function applyMakeup(source,value,canvas,faces=[],cache=null){
 const m=normaliseMakeup(value);if(!makeupActive(m,makeupFaces(m,faces)))return source;
 const {width,height}=dimensions(source);if(!width||!height)throw new TypeError('A ready photo is required');
 if(canvas===source)canvas=null;
 canvas??=document.createElement('canvas');
 // `cache` (an object the caller keeps per picture) holds the source's pixels, so a change of look or strength does
 // not read them again and the prepared faces are found again.
 const original=makeupSourcePixels(source,canvas,cache),g=canvas.getContext('2d',{willReadFrequently:true});
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const result=makeupPixels(original,m,faces);
 if(result===original)return source;
 g.putImageData(new ImageData(result.data,width,height),0,0);return canvas;
}
/**
 * A square round a face (source-normalised crop {x,y,w,h}) for a thumbnail of a look on that face, and the faces
 * re-measured inside it (makeupPixels on the crop's pixels).
 */
export function faceCrop(face,W,H){
 const xs=face.oval.map(p=>p[0]),ys=face.oval.map(p=>p[1]);
 const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 const side=Math.max((Math.max(...xs)-Math.min(...xs))*W,(Math.max(...ys)-Math.min(...ys))*H)*1.5;
 const w=clamp(side/W,.05,1),h=clamp(side/H,.05,1);
 return {x:clamp(cx-w/2,0,1-w),y:clamp(cy-h/2,0,1-h),w,h};
}
export function facesInCrop(faces,crop){
 const map=([x,y])=>[(x-crop.x)/crop.w,(y-crop.y)/crop.h];
 return faces.map(f=>{const o={...f};for(const k of ['lipsOuter','lipsInner','eyeL','eyeR','browL','browR','oval'])o[k]=f[k].map(map);o.eyes=f.eyes.map(e=>({x:(e.x-crop.x)/crop.w,y:(e.y-crop.y)/crop.h,r:e.r/crop.w}));for(const k of ['noseTip','noseBridge','chin','forehead','cheekL','cheekR','noseWingL','noseWingR'])o[k]=map(f[k]);return o;});
}
