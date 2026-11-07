/**
 * The face pack: where the features of every face in a photo are, found by the app, not placed by hand.
 *
 * MediaPipe's Face Landmarker (face-pack-worker.js) gives 478 points per face. The recipe keeps a compact face from
 * them, in source-normalised coordinates (shares of the uncropped photo's width and height, four decimals): the lip
 * loops (outer and inner), both eye loops, both brow loops, the face oval, the iris centres and radii, a few anchors
 * (nose tip and bridge, chin, forehead, cheeks, nostril wings) and the expression scores that matter (how open the
 * mouth is, the smile). About 130 points: a save and a re-edit draw exactly what was previewed, and the points can be
 * corrected with the guide (syncFaceToGuide).
 *
 * "Left" and "right" here are the photo's left and right, never the person's.
 */
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const num=(v,d=0)=>Number.isFinite(+v)?+v:d;
const r4=v=>Math.round(v*1e4)/1e4;

// MediaPipe face-mesh indices, as loops (derived from FaceLandmarker.FACE_LANDMARKS_* in the vendored runtime).
export const MESH=Object.freeze({
 lipsOuter:[61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],
 lipsInner:[78,191,80,81,82,13,312,311,310,415,308,324,318,402,317,14,87,178,88,95],
 // MediaPipe's "right eye" is the person's right: the photo's left in an unmirrored photo. Assigned by x below anyway.
 eyeA:[33,246,161,160,159,158,157,173,133,155,154,153,145,144,163,7],
 eyeB:[263,466,388,387,386,385,384,398,362,382,381,380,374,373,390,249],
 browA:[46,53,52,65,55,107,66,105,63,70],
 browB:[276,283,282,295,285,336,296,334,293,300],
 irisA:[469,470,471,472],irisB:[474,475,476,477],irisCentreA:468,irisCentreB:473,
 oval:[10,338,297,332,284,251,389,356,454,323,361,288,397,365,379,378,400,377,152,148,176,149,150,136,172,58,132,93,234,127,162,21,54,103,67,109],
 noseTip:1,noseBridge:6,chin:152,forehead:10,cheekA:50,cheekB:280,noseWingA:49,noseWingB:279,
});
const POINT_LOOPS=['lipsOuter','lipsInner','eyeL','eyeR','browL','browR','oval'];
const ANCHORS=['noseTip','noseBridge','chin','forehead','cheekL','cheekR','noseWingL','noseWingR'];

/** The compact face from 478 normalised points (x,y pairs) and the expression scores. */
export function compactFace(points,scores={}){
 const at=i=>[points[2*i],points[2*i+1]];
 const loop=ids=>ids.map(at);
 const centroid=ps=>ps.reduce((a,p)=>[a[0]+p[0]/ps.length,a[1]+p[1]/ps.length],[0,0]);
 const eyeA=loop(MESH.eyeA),eyeB=loop(MESH.eyeB),aLeft=centroid(eyeA)[0]<=centroid(eyeB)[0];
 const [eyeL,eyeR]=aLeft?[eyeA,eyeB]:[eyeB,eyeA],[browL,browR]=aLeft?[loop(MESH.browA),loop(MESH.browB)]:[loop(MESH.browB),loop(MESH.browA)];
 const iris=(centre,ring)=>{const c=at(centre),ps=loop(ring);return {x:c[0],y:c[1],r:ps.reduce((n,p)=>n+Math.hypot(p[0]-c[0],p[1]-c[1]),0)/ps.length};};
 const irisA=iris(MESH.irisCentreA,MESH.irisA),irisB=iris(MESH.irisCentreB,MESH.irisB);
 const face={
  lipsOuter:loop(MESH.lipsOuter),lipsInner:loop(MESH.lipsInner),eyeL,eyeR,browL,browR,oval:loop(MESH.oval),
  eyes:aLeft?[irisA,irisB]:[irisB,irisA],
  noseTip:at(MESH.noseTip),noseBridge:at(MESH.noseBridge),chin:at(MESH.chin),forehead:at(MESH.forehead),
  cheekL:at(aLeft?MESH.cheekA:MESH.cheekB),cheekR:at(aLeft?MESH.cheekB:MESH.cheekA),
  noseWingL:at(aLeft?MESH.noseWingA:MESH.noseWingB),noseWingR:at(aLeft?MESH.noseWingB:MESH.noseWingA),
  open:clamp(num(scores.jawOpen),0,1),smile:clamp((num(scores.mouthSmileLeft)+num(scores.mouthSmileRight))/2,0,1),
  blinkL:clamp(num(aLeft?scores.eyeBlinkRight:scores.eyeBlinkLeft),0,1),blinkR:clamp(num(aLeft?scores.eyeBlinkLeft:scores.eyeBlinkRight),0,1),
 };
 return normaliseFace(face);
}

/** A valid compact face from stored data, or null. */
export function normaliseFace(value){
 if(!value||typeof value!=='object')return null;
 const pair=p=>Array.isArray(p)&&p.length>=2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1])?[r4(clamp(+p[0],-.5,1.5)),r4(clamp(+p[1],-.5,1.5))]:null;
 const out={};
 for(const key of POINT_LOOPS){const ps=Array.isArray(value[key])?value[key].map(pair):[];if(ps.some(p=>!p)||ps.length<4)return null;out[key]=ps;}
 if(!Array.isArray(value.eyes)||value.eyes.length!==2)return null;
 out.eyes=value.eyes.map(e=>({x:r4(clamp(num(e?.x),-.5,1.5)),y:r4(clamp(num(e?.y),-.5,1.5)),r:r4(clamp(num(e?.r,.01),.001,.2))}));
 if(out.eyes[0].x>out.eyes[1].x){out.eyes.reverse();[out.eyeL,out.eyeR]=[out.eyeR,out.eyeL];[out.browL,out.browR]=[out.browR,out.browL];}
 for(const key of ANCHORS){const p=pair(value[key]);if(!p)return null;out[key]=p;}
 for(const key of ['open','smile','blinkL','blinkR'])out[key]=r4(clamp(num(value[key]),0,1));
 return out;
}
export function normaliseFaces(value){
 return (Array.isArray(value)?value:[]).map(normaliseFace).filter(Boolean).slice(0,6);
}

const bounds=ps=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [x,y] of ps){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}return {x:x0,y:y0,w:x1-x0,h:y1-y0};};
/** The face's size on the photo: the oval's area as a share of the photo. */
export const faceArea=face=>{const b=bounds(face.oval);return b.w*b.h;};
/** The angle of the eye line, degrees, clockwise positive as on the screen. */
export const faceAngle=face=>Math.atan2(face.eyes[1].y-face.eyes[0].y,face.eyes[1].x-face.eyes[0].x)*180/Math.PI;

/**
 * The guide (makeup.js's `face`: a box, an angle, two eyes and a mouth in box-local coordinates) from a compact face,
 * so the Makeup pass, the Face stickers and the alignment handles work from the found face without any change.
 */
export function guideFromFace(face,W=1,H=1){
 const angle=clamp(faceAngle(face)*(W/H>0?1:1),-45,45);
 // The box: the oval's bounds in the photo, as the template renderer expects (source-normalised, unrotated).
 const o=bounds(face.oval),pad=.04;
 const box={x:clamp(o.x-o.w*pad,0,1),y:clamp(o.y-o.h*pad,0,1),w:o.w*(1+2*pad),h:o.h*(1+2*pad)};
 box.w=Math.min(box.w,1-box.x);box.h=Math.min(box.h,1-box.y);
 const a=angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),cx=box.x+box.w/2,cy=box.y+box.h/2;
 // Box-local coordinates are measured in pixels then divided by the box in pixels, so the aspect matters.
 const local=(x,y)=>{const dx=(x-cx)*W,dy=(y-cy)*H;return {x:(ca*dx+sa*dy)/(box.w*W)+.5,y:(-sa*dx+ca*dy)/(box.h*H)+.5};};
 const lips=face.lipsOuter,lb=bounds(lips),mouthC=[lb.x+lb.w/2,lb.y+lb.h/2];
 // The lips' width and height along the face's own axes, as shares of the box.
 let mw=0,mh=0;for(const [x,y] of lips){const dx=(x-mouthC[0])*W,dy=(y-mouthC[1])*H;mw=Math.max(mw,Math.abs(ca*dx+sa*dy));mh=Math.max(mh,Math.abs(-sa*dx+ca*dy));}
 const mouth={...local(...mouthC),w:clamp(2*mw/(box.w*W),.12,.6),h:clamp(mh/(box.h*H),.025,.2)};
 return {...box,angle:Math.round(angle*10)/10,eyes:face.eyes.map(e=>local(e.x,e.y)),mouth};
}

/** Every point of a face through a function of [x,y] (the loops, the irises and the anchors). */
export function mapFace(face,fn){
 const out={...face};
 for(const key of POINT_LOOPS)out[key]=face[key].map(p=>fn(p));
 out.eyes=face.eyes.map(e=>{const [x,y]=fn([e.x,e.y]);return {...e,x,y};});
 for(const key of ANCHORS)out[key]=fn(face[key]);
 return normaliseFace(out);
}
/** A similarity transform of the face about a centre (source-normalised; scale and angle in degrees). */
export function transformFace(face,{dx=0,dy=0,scale=1,angle=0,cx,cy},W=1,H=1){
 const a=angle*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
 return mapFace(face,([x,y])=>{
  const px=(x-cx)*W*scale,py=(y-cy)*H*scale;
  return [cx+(ca*px-sa*py)/W+dx,cy+(sa*px+ca*py)/H+dy];
 });
}
/**
 * A correction made with the guide (makeup-guide.js moves the box, resizes it, or moves one eye or the mouth) applied
 * to the compact face, so what is drawn from the landmarks follows the handle. Returns the corrected face.
 */
export function syncFaceToGuide(face,before,after,W=1,H=1){
 if(!face||!before||!after)return face;
 let out=face;
 const bc={x:before.x+before.w/2,y:before.y+before.h/2},ac={x:after.x+after.w/2,y:after.y+after.h/2};
 const scale=before.w>0?after.w/before.w:1,dAngle=num(after.angle)-num(before.angle);
 if(Math.abs(ac.x-bc.x)>1e-6||Math.abs(ac.y-bc.y)>1e-6||Math.abs(scale-1)>1e-6||Math.abs(dAngle)>1e-6)
  out=transformFace(out,{dx:ac.x-bc.x,dy:ac.y-bc.y,scale,angle:dAngle,cx:bc.x,cy:bc.y},W,H);
 // A feature moved: its local delta in the box after the move, to source coordinates.
 const a=num(after.angle)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a);
 const toSource=(dxl,dyl)=>{const px=dxl*after.w*W,py=dyl*after.h*H;return [(ca*px-sa*py)/W,(sa*px+ca*py)/H];};
 const shift=(keys,dx,dy)=>{if(Math.abs(dx)<1e-7&&Math.abs(dy)<1e-7)return;const o={...out};for(const k of keys){if(k==='eyes0'){o.eyes=[{...o.eyes[0],x:o.eyes[0].x+dx,y:o.eyes[0].y+dy},o.eyes[1]];continue;}if(k==='eyes1'){o.eyes=[o.eyes[0],{...o.eyes[1],x:o.eyes[1].x+dx,y:o.eyes[1].y+dy}];continue;}o[k]=o[k].map(([x,y])=>[x+dx,y+dy]);}out=normaliseFace(o)||out;};
 for(let i=0;i<2;i++){
  const [dx,dy]=toSource(num(after.eyes?.[i]?.x)-num(before.eyes?.[i]?.x),num(after.eyes?.[i]?.y)-num(before.eyes?.[i]?.y));
  shift(i?['eyeR','browR','eyes1']:['eyeL','browL','eyes0'],dx,dy);
 }
 const [mx,my]=toSource(num(after.mouth?.x)-num(before.mouth?.x),num(after.mouth?.y)-num(before.mouth?.y));
 shift(['lipsOuter','lipsInner'],mx,my);
 return out;
}

// ---------- Finding faces ----------
let worker=null,seq=0;const pending=new Map();
function getWorker(){
 if(worker)return worker;
 worker=new Worker(new URL('./face-pack-worker.js?v=20261104ui1',import.meta.url));
 worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.type==='error'?p.reject(new Error(data.message)):p.resolve(data);};
 worker.onerror=e=>{for(const p of pending.values())p.reject(new Error(e.message||'The face finder could not start'));pending.clear();worker.terminate();worker=null;};
 return worker;
}
const ask=(message,transfer=[])=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});getWorker().postMessage({...message,id},transfer);});
/** Loads the runtime and the model ahead of the first photo. */
export function warmFacePack(){return ask({type:'warm'}).then(()=>true).catch(()=>false);}
/**
 * The person in a picture, from the Selfie Segmenter in the same worker: {mask: Float32Array (1 = person), width,
 * height, ms} at the model's own size (256 × 256), the right way round (the picture's corners are background).
 */
export async function findPerson(source,{longSide=512}={}){
 const {width:W,height:H}=size(source);if(!(W>0&&H>0))return null;
 const k=Math.min(1,longSide/Math.max(W,H)),rw=Math.max(1,Math.round(W*k)),rh=Math.max(1,Math.round(H*k));
 const bitmap=await createImageBitmap(source,0,0,W,H,{resizeWidth:rw,resizeHeight:rh,resizeQuality:'high'});
 const {mask,width,height,ms}=await ask({type:'segment',bitmap},[bitmap]);
 if(!mask?.length||!(width>0&&height>0))return null;
 const corners=[0,width-1,(height-1)*width,height*width-1].reduce((s,i)=>s+mask[i],0)/4;
 if(corners>.5)for(let i=0;i<mask.length;i++)mask[i]=1-mask[i];
 return {mask,width,height,ms};
}

const size=source=>({width:source.naturalWidth||source.videoWidth||source.width,height:source.naturalHeight||source.videoHeight||source.height});
/**
 * Every face in a picture (largest first), as compact faces, or []. `around` {x,y} (source-normalised) looks again in
 * a window round a tap, for a face the first pass missed; `longSide` is the working size (landmarks are normalised,
 * so this only bounds the work).
 */
export async function findFaces(source,{around=null,longSide=1280,max=6}={}){
 const {width:W,height:H}=size(source);if(!(W>0&&H>0))return [];
 let sx=0,sy=0,sw=W,sh=H;
 if(around){const side=Math.round(Math.min(W,H)*.6);sx=Math.round(clamp(around.x*W-side/2,0,W-side));sy=Math.round(clamp(around.y*H-side/2,0,H-side));sw=side;sh=side;}
 const k=Math.min(1,longSide/Math.max(sw,sh)),rw=Math.max(1,Math.round(sw*k)),rh=Math.max(1,Math.round(sh*k));
 const bitmap=await createImageBitmap(source,sx,sy,sw,sh,{resizeWidth:rw,resizeHeight:rh,resizeQuality:'high'});
 const {faces,ms}=await ask({type:'find',bitmap,max},[bitmap]);
 const out=faces.map(f=>{
  const points=f.points;
  // Back from the window to the whole photo.
  if(around)for(let i=0;i<points.length;i+=2){points[i]=(sx+points[i]*sw)/W;points[i+1]=(sy+points[i+1]*sh)/H;}
  return compactFace(points,f.scores);
 }).filter(Boolean).sort((a,b)=>faceArea(b)-faceArea(a)).slice(0,max);
 out.ms=ms;return out;
}
