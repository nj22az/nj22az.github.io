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
