/**
 * Reversible, on-device portrait colour. A detected face is only a placement hint: the editor also supplies a
 * movable face guide. Eye and mouth anchors are face-local coordinates, while the face box is source-normalised.
 * No facial geometry, complexion or identity is changed. No pixels are uploaded and no remote model is fetched.
 */
import {detectLocalFace} from './face-detect.js?v=20261031retouch1';

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const number=(v,fallback)=>v!=null&&Number.isFinite(+v)?+v:fallback;
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const point=(p,x,y)=>({x:clamp(number(p?.x,x),.08,.92),y:clamp(number(p?.y,y),.08,.92)});
const luma=(r,g,b)=>.2126*r+.7152*g+.0722*b;
export const MAKEUP_SHADES=Object.freeze([
 Object.freeze({id:'rose',label:'Rose',colour:'#bf425f',rgb:Object.freeze([191,66,95])}),
 Object.freeze({id:'peach',label:'Peach',colour:'#c87050',rgb:Object.freeze([200,112,80])}),
 Object.freeze({id:'berry',label:'Berry',colour:'#9e3c77',rgb:Object.freeze([158,60,119])}),
]);

export function normaliseFace(value){
 if(!value||typeof value!=='object')return null;
 const w=clamp(number(value.w,.3),.025,1),h=clamp(number(value.h,.4),.025,1);
 return {x:clamp(number(value.x,.5-w/2),0,1-w),y:clamp(number(value.y,.5-h/2),0,1-h),w,h,
  angle:clamp(number(value.angle,0),-45,45),
  eyes:[point(value.eyes?.[0],.31,.4),point(value.eyes?.[1],.69,.4)],
  mouth:{...point(value.mouth,.5,.75),w:clamp(number(value.mouth?.w,.36),.12,.6),h:clamp(number(value.mouth?.h,.08),.025,.2)}};
}
export function normaliseMakeup(value){
 return {skin:clamp(number(value?.skin,0),0,1),blush:clamp(number(value?.blush,0),0,1),lips:clamp(number(value?.lips,0),0,1),
  shade:MAKEUP_SHADES.some(s=>s.id===value?.shade)?value.shade:'rose',face:normaliseFace(value?.face)};
}
const active=m=>m.face&&(m.skin>0||m.blush>0||m.lips>0);
const ellipse=(u,v,x,y,rx,ry)=>Math.hypot((u-x)/rx,(v-y)/ry);

/** Pure renderer, preserving source bytes and alpha. Smoothing samples only similar neighbouring colours. */
export function makeupPixels(image,value){
 const {data,width:W,height:H}=image;
 if(!Number.isInteger(W)||!Number.isInteger(H)||W<1||H<1||data?.length!==W*H*4)throw new TypeError('Complete RGBA pixels are required');
 const m=normaliseMakeup(value);
 if(!active(m))return image;
 const out=new Uint8ClampedArray(data),f=m.face,fw=f.w*W,fh=f.h*H,cx=(f.x+f.w/2)*W,cy=(f.y+f.h/2)*H;
 const a=f.angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),rx=(Math.abs(ca)*fw+Math.abs(sa)*fh)/2,ry=(Math.abs(sa)*fw+Math.abs(ca)*fh)/2;
 const x0=Math.max(0,Math.floor(cx-rx)),x1=Math.min(W,Math.ceil(cx+rx)),y0=Math.max(0,Math.floor(cy-ry)),y1=Math.min(H,Math.ceil(cy+ry));
 const shade=MAKEUP_SHADES.find(s=>s.id===m.shade).rgb,neutral=luma(...shade),chroma=shade.map(v=>v-neutral);
 const step=Math.max(1,Math.round(Math.min(fw,fh)*.006)),mouth=f.mouth;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const dx=x+.5-cx,dy=y+.5-cy,u=(ca*dx+sa*dy)/fw+.5,v=(-sa*dx+ca*dy)/fh+.5;
  const edge=1-smooth(.82,1,ellipse(u,v,.5,.51,.48,.49));
  if(edge<=0)continue;
  const i=(y*W+x)*4;if(data[i+3]===0)continue;
  let r=data[i],g=data[i+1],b=data[i+2];
  if(m.skin>0){
   let protectedFeature=1;
   for(const eye of f.eyes)protectedFeature*=smooth(.9,1.5,ellipse(u,v,eye.x,eye.y,.115,.075));
   protectedFeature*=smooth(.85,1.4,ellipse(u,v,mouth.x,mouth.y,mouth.w*.62,mouth.h*1.6));
   protectedFeature*=smooth(.65,1.4,ellipse(u,v,.5,.61,.09,.10));
   const amount=m.skin*.52*edge*protectedFeature;
   if(amount>.001){
    let sr=r*2,sg=g*2,sb=b*2,weight=2;
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
     if(!ox&&!oy)continue;
     const sx=x+ox*step,sy=y+oy*step;if(sx<0||sy<0||sx>=W||sy>=H)continue;
     const j=(sy*W+sx)*4,dr=data[j]-r,dg=data[j+1]-g,db=data[j+2]-b;
     const w=Math.exp(-(dr*dr+dg*dg+db*db)/(3*24*24))*(data[j+3]/255);
     sr+=data[j]*w;sg+=data[j+1]*w;sb+=data[j+2]*w;weight+=w;
    }
    r+=(sr/weight-r)*amount;g+=(sg/weight-g)*amount;b+=(sb/weight-b)*amount;
   }
  }
  // Two feathered cheek ovals, below the eyes. The source's luminance and fine texture remain visible.
  const cheekY=clamp((f.eyes[0].y+f.eyes[1].y)/2+.19,.4,.72);
  const cheeks=Math.max(1-smooth(.12,1,ellipse(u,v,.25,cheekY,.16,.105)),1-smooth(.12,1,ellipse(u,v,.75,cheekY,.16,.105)));
  let tint=m.blush*.24*cheeks*edge;
  if(m.lips>0){
   const lx=(u-mouth.x)/(mouth.w/2),shape=Math.max(0,1-lx*lx),my=(v-mouth.y)/mouth.h;
   const upper=-.45*shape*(.65+.35*Math.sin(Math.abs(lx)*Math.PI)),lower=.55*shape;
   const feather=.065,inside=smooth(upper-feather,upper+feather,my)*(1-smooth(lower-feather,lower+feather,my));
   const aperture=smooth(.035,.105,Math.abs(my)/Math.max(.1,shape));
   const light=luma(r,g,b),range=Math.max(r,g,b)-Math.min(r,g,b);
   const teeth=1-smooth(165,215,light)*(1-smooth(12,35,range));
   tint+=m.lips*.72*inside*(1-smooth(.82,1,Math.abs(lx)))*aperture*teeth*smooth(8,30,light)*edge;
  }
  out[i]=clamp(r+chroma[0]*tint,0,255);out[i+1]=clamp(g+chroma[1]*tint,0,255);out[i+2]=clamp(b+chroma[2]*tint,0,255);
 }
 return {data:out,width:W,height:H};
}

const dimensions=source=>({width:source.naturalWidth||source.videoWidth||source.width,height:source.naturalHeight||source.videoHeight||source.height});
/** Returns source itself for the exact off path; otherwise a new/reused, full-size canvas. */
export function applyMakeup(source,value,canvas){
 const m=normaliseMakeup(value);if(!active(m))return source;
 const {width,height}=dimensions(source);if(!width||!height)throw new TypeError('A ready photo is required');
 if(canvas===source)canvas=null;
 canvas??=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(source,0,0,width,height);
 const original=g.getImageData(0,0,width,height),result=makeupPixels(original,m);
 g.putImageData(new ImageData(result.data,width,height),0,0);return canvas;
}

/** Native detection, then the bundled offline classifier. A result is a guide, never a semantic lip mask. */
export async function detectMakeupFace(source){
 const {width,height}=dimensions(source);if(!width||!height)return {face:null,status:'manual'};
 if(typeof globalThis.FaceDetector==='function')try{
  let timer;let faces;
  try{faces=await Promise.race([new globalThis.FaceDetector({fastMode:false,maxDetectedFaces:8}).detect(source),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Native detection timed out')),1500);})]);}
  finally{clearTimeout(timer);}
  const candidates=faces.filter(f=>f.boundingBox?.width>0&&f.boundingBox?.height>0).sort((a,b)=>b.boundingBox.width*b.boundingBox.height-a.boundingBox.width*a.boundingBox.height);
  if(candidates.length){
   const found=candidates[0],box=found.boundingBox,face=normaliseFace({x:box.x/width,y:box.y/height,w:box.width/width,h:box.height/height});
   const landmarks=Array.isArray(found.landmarks)?found.landmarks:[],centre=l=>{const p=l.locations?.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));return p?.length?{x:p.reduce((n,p)=>n+p.x,0)/p.length,y:p.reduce((n,p)=>n+p.y,0)/p.length}:null;};
   const eyes=landmarks.filter(l=>l.type==='eye').map(centre).filter(Boolean).sort((a,b)=>a.x-b.x);
   if(eyes.length>=2)face.angle=clamp(Math.atan2(eyes[1].y-eyes[0].y,eyes[1].x-eyes[0].x)*180/Math.PI,-45,45);
   const angle=face.angle*Math.PI/180,ca=Math.cos(angle),sa=Math.sin(angle),cx=(face.x+face.w/2)*width,cy=(face.y+face.h/2)*height;
   const local=p=>({x:(ca*(p.x-cx)+sa*(p.y-cy))/(face.w*width)+.5,y:(-sa*(p.x-cx)+ca*(p.y-cy))/(face.h*height)+.5});
   if(eyes.length>=2)face.eyes=eyes.slice(0,2).map(local);
   const mouth=landmarks.filter(l=>l.type==='mouth').map(centre).find(Boolean);if(mouth)face.mouth={...face.mouth,...local(mouth)};
   return {face:normaliseFace(face),status:'detected'};
  }
 }catch{/* The offline detector/manual guide works when an OS detector is absent or rejects this source. */}
 try{const face=await detectLocalFace(source);if(face)return {face:normaliseFace(face),status:'detected'};}catch{}
 return {face:null,status:'manual'};
}
