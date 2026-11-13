/** Photo crops use source coordinates, measured from the top left; the source is never cut down. */
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const number=(v,fallback)=>v!=null&&Number.isFinite(+v)?+v:fallback;
export function normalCrop(value){
 const w=clamp(number(value?.w,1),.001,1),h=clamp(number(value?.h,1),.001,1);
 return {x:clamp(number(value?.x,0),0,1-w),y:clamp(number(value?.y,0),0,1-h),w,h};
}
/** Largest rectangle of the requested shape, zoomed round a source point and kept inside the photo. */
export function cropAtAspect(width,height,aspect,zoom=1,cx=.5,cy=.5){
 const source=width/height;
 let w=1,h=1;if(source>aspect)w=aspect/source;else h=source/aspect;
 zoom=clamp(number(zoom,1),1,4);w/=zoom;h/=zoom;
 return normalCrop({x:cx-w/2,y:cy-h/2,w,h});
}
export function cropZoom(width,height,crop){
 const c=normalCrop(crop),base=cropAtAspect(width,height,c.w*width/(c.h*height));
 return base.w/c.w;
}

/**
 * The crop of the same shape that brings a face to a window. `face` is a box in shares of the photo (the face's oval);
 * `win` is a box in shares of the cropped picture (a face cutout's hole: frames.js frameWindow). The face is 86% of the
 * window's height and no wider than the window. A face too big for that (a close portrait: the crop cannot be more
 * than the whole photo) is centred first: the crop comes in as far as centring needs, while brows, eyes and mouth
 * (the middle half of a face's height, three quarters of its width) still fit the window. A face that was not measured
 * (a tap said where it is; its size is a guess) is centred whatever that takes. Within the zoom the Crop tab allows;
 * where the photo ends, the crop stops.
 */
export function cropFaceToWindow(width,height,crop,face,win,{measured=true}={}){
 const c=normalCrop(crop),base=cropAtAspect(width,height,c.w*width/(c.h*height));
 const fx=face.x+face.w/2,fy=face.y+face.h/2,hx=win.x+win.w/2,hy=win.y+win.h/2;
 // The zoom at which the face is a given share of the window: of its height, of its width.
 const tall=share=>share*win.h*base.h/face.h,wide=share=>share*win.w*base.w/face.w;
 const fit=Math.min(tall(.86),wide(.94)),most=measured?Math.min(tall(1.5),wide(1.25)):Infinity;
 // The least zoom at which the photo reaches far enough on every side for the face to be at the window's middle.
 const centred=Math.max(base.w/Math.min(fx/hx,(1-fx)/(1-hx)),base.h/Math.min(fy/hy,(1-fy)/(1-hy)));
 const zoom=clamp(Math.max(fit,Math.min(centred,most)),1,4),w=base.w/zoom,h=base.h/zoom;
 return normalCrop({x:fx-hx*w,y:fy-hy*h,w,h});
}

/** Mouse drag/wheel and touch drag/pinch share the same source rectangle. Only active in the Crop tab. */
export function bindCropGestures(frame,{edit,changed}){
 const points=new Map();let start;
 const begin=()=>{
  const e=edit();if(!e?.cropping||!points.size){start=null;return;}
  const p=[...points.values()].slice(0,2),r=frame.getBoundingClientRect(),c=normalCrop(e.recipe.crop);
  const x=p.reduce((n,p)=>n+p.x,0)/p.length,y=p.reduce((n,p)=>n+p.y,0)/p.length;
  start={crop:c,r,x,y,zoom:cropZoom(e.width,e.height,c),distance:p.length===2?Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y):0};
 };
 const consume=e=>{e.preventDefault();e.stopPropagation();};
 frame.addEventListener('pointerdown',e=>{
  if(!edit()?.cropping||e.button>0)return;
  consume(e);frame.focus({preventScroll:true});points.set(e.pointerId,{x:e.clientX,y:e.clientY});
  frame.setPointerCapture(e.pointerId);begin();
 });
 frame.addEventListener('pointermove',e=>{
  if(!edit()?.cropping||!points.has(e.pointerId)||!start)return;
  consume(e);points.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const p=[...points.values()].slice(0,2),s=start,c=s.crop;
  const x=p.reduce((n,p)=>n+p.x,0)/p.length,y=p.reduce((n,p)=>n+p.y,0)/p.length;
  if(p.length===2&&s.distance>0){
   const photo=edit(),distance=Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);
   const next=cropAtAspect(photo.width,photo.height,c.w*photo.width/(c.h*photo.height),s.zoom*distance/s.distance);
   const ax=(s.x-s.r.left)/s.r.width,ay=(s.y-s.r.top)/s.r.height;
   next.x=c.x+ax*c.w-(x-s.r.left)/s.r.width*next.w;next.y=c.y+ay*c.h-(y-s.r.top)/s.r.height*next.h;
   changed(normalCrop(next));
  }else changed(normalCrop({...c,x:c.x-(x-s.x)/s.r.width*c.w,y:c.y-(y-s.y)/s.r.height*c.h}));
 });
 const end=e=>{if(!points.has(e.pointerId))return;consume(e);points.delete(e.pointerId);begin();};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])frame.addEventListener(type,end);
 frame.addEventListener('wheel',e=>{
  const photo=edit();if(!photo?.cropping)return;consume(e);
  const c=normalCrop(photo.recipe.crop),r=frame.getBoundingClientRect(),ax=clamp((e.clientX-r.left)/r.width,0,1),ay=clamp((e.clientY-r.top)/r.height,0,1);
  const next=cropAtAspect(photo.width,photo.height,c.w*photo.width/(c.h*photo.height),cropZoom(photo.width,photo.height,c)*Math.exp(-e.deltaY*.002));
  next.x=c.x+ax*c.w-ax*next.w;next.y=c.y+ay*c.h-ay*next.h;changed(normalCrop(next));
 },{passive:false});
 frame.addEventListener('keydown',e=>{
  if(!edit()?.cropping||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  consume(e);const c=normalCrop(edit().recipe.crop),step=e.shiftKey ? .05 : .01;
  changed(normalCrop({...c,x:c.x+({'ArrowLeft':-1,'ArrowRight':1}[e.key]||0)*c.w*step,y:c.y+({'ArrowUp':-1,'ArrowDown':1}[e.key]||0)*c.h*step}));
 });
}
