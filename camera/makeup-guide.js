/** Manual alignment for the approximate face mask. All stored points belong to the uncropped source photograph. */
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const clone=value=>JSON.parse(JSON.stringify(value));
const SVG='http://www.w3.org/2000/svg';
const defaults={eyes:[{x:.31,y:.4},{x:.69,y:.4}],mouth:{x:.5,y:.75,w:.36,h:.08}};

export function createMakeupGuide(frame,{edit,changed=()=>{}}){
 const layer=document.createElement('div');layer.id='makeupGuide';layer.className='makeup-guide';layer.hidden=true;
 layer.setAttribute('role','group');layer.setAttribute('aria-label','Align face, eyes and mouth');
 const svg=document.createElementNS(SVG,'svg');svg.classList.add('makeup-guide-svg');svg.setAttribute('aria-hidden','true');
 const outline=document.createElementNS(SVG,'path');outline.classList.add('makeup-guide-outline');
 const mouthOutline=document.createElementNS(SVG,'path');mouthOutline.classList.add('makeup-guide-outline','makeup-guide-mouth');mouthOutline.style.strokeDasharray='none';
 svg.append(outline,mouthOutline);layer.append(svg);
 const definitions=[
  ['face','Move face guide','M5 12h14M12 5v14M5 12l3-3M5 12l3 3M19 12l-3-3M19 12l-3 3M12 5l-3 3M12 5l3 3M12 19l-3-3M12 19l3-3'],
  ['resize','Resize face guide','M7 17 17 7M7 11v6h6M11 7h6v6'],
  ['left-eye','Align left eye','M3 12c5-7 13-7 18 0-5 7-13 7-18 0Z M12 9v6'],
  ['right-eye','Align right eye','M3 12c5-7 13-7 18 0-5 7-13 7-18 0Z M12 9v6'],
  ['mouth','Align mouth','M3 12c4-1 6-4 9-2 3-2 5 1 9 2-5 7-13 7-18 0Z M3 12h18'],
 ];
 const handles=new Map();
 for(const [name,label,path] of definitions){
  const b=document.createElement('button');b.type='button';b.className='makeup-guide-handle';b.dataset.handle=name;
  b.setAttribute('aria-label',label);b.title=label+'; drag or use arrow keys';
  const art=document.createElementNS(SVG,'svg');art.setAttribute('viewBox','0 0 24 24');art.setAttribute('aria-hidden','true');
  const p=document.createElementNS(SVG,'path');p.setAttribute('d',path);art.append(p);b.append(art);layer.append(b);handles.set(name,b);
 }
 frame.append(layer);
 let active=false,drag=null;
 const current=()=>{const e=edit();return e?.recipe?.makeup?.face?e:null;};
 const usable=()=>active&&!layer.hidden&&current()&&!current().saving;
 const crop=e=>e.recipe.crop||{x:0,y:0,w:1,h:1};
 function feature(f,name){
  if(name==='left-eye')return f.eyes?.[0]||defaults.eyes[0];
  if(name==='right-eye')return f.eyes?.[1]||defaults.eyes[1];
  if(name==='mouth')return f.mouth||defaults.mouth;
  return name==='resize'?{x:1,y:1}:{x:.5,y:.04};
 }
 function toSource(e,f,p){
  const a=(f.angle||0)*Math.PI/180,dx=(p.x-.5)*f.w*e.width,dy=(p.y-.5)*f.h*e.height;
  return {x:f.x+f.w/2+(dx*Math.cos(a)-dy*Math.sin(a))/e.width,y:f.y+f.h/2+(dx*Math.sin(a)+dy*Math.cos(a))/e.height};
 }
 function localDelta(e,f,dx,dy){
  const a=(f.angle||0)*Math.PI/180,x=dx*e.width,y=dy*e.height;
  return {x:(x*Math.cos(a)+y*Math.sin(a))/(f.w*e.width),y:(-x*Math.sin(a)+y*Math.cos(a))/(f.h*e.height)};
 }
 function at(event,e){
  const r=layer.getBoundingClientRect(),c=crop(e);
  return {x:c.x+(event.clientX-r.left)/Math.max(1,r.width)*c.w,y:c.y+(event.clientY-r.top)/Math.max(1,r.height)*c.h};
 }
 function save(e,f){
  if(edit()!==e||e.saving)return;
  e.recipe.makeup.face=f;changed(f);render();
 }
 function moveFace(f,dx,dy){
  f.x=clamp(f.x+dx,0,Math.max(0,1-f.w));f.y=clamp(f.y+dy,0,Math.max(0,1-f.h));
 }
 function resizeFace(f,scale){
  const cx=f.x+f.w/2,cy=f.y+f.h/2;
  const limit=Math.min(2*Math.min(cx,1-cx)/f.w,2*Math.min(cy,1-cy)/f.h);
  scale=clamp(scale,Math.min(1,Math.max(.06/f.w,.08/f.h)),Math.max(.01,limit));
  f.w*=scale;f.h*=scale;f.x=cx-f.w/2;f.y=cy-f.h/2;
 }
 function moveFeature(e,f,name,dx,dy){
  const d=localDelta(e,f,dx,dy),p=feature(f,name),point={...p,x:clamp(p.x+d.x,.02,.98),y:clamp(p.y+d.y,.02,.98)};
  if(name==='mouth')f.mouth={...defaults.mouth,...point};
  else{f.eyes=clone(f.eyes||defaults.eyes);f.eyes[name==='left-eye'?0:1]=point;}
 }
 function endDrag(){
  if(drag){try{drag.button.releasePointerCapture(drag.id);}catch{}drag=null;}
 }
 layer.addEventListener('pointerdown',event=>{
  const button=event.target.closest('button[data-handle]'),e=current();
  if(!button||!usable()||drag||event.button>0)return;
  event.preventDefault();event.stopPropagation();
  drag={id:event.pointerId,button,name:button.dataset.handle,e,picture:e.picture,from:at(event,e),face:clone(e.recipe.makeup.face)};
  try{button.setPointerCapture(event.pointerId);}catch{}
 });
 layer.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  event.preventDefault();event.stopPropagation();
  const d=drag;if(!usable()||edit()!==d.e||d.e.picture!==d.picture){endDrag();return;}
  const p=at(event,d.e),f=clone(d.face),dx=p.x-d.from.x,dy=p.y-d.from.y;
  if(d.name==='face')moveFace(f,dx,dy);
  else if(d.name==='resize'){
   const delta=localDelta(d.e,f,dx,dy),fw=f.w*d.e.width,fh=f.h*d.e.height;
   resizeFace(f,1+2*(delta.x*fw*fw+delta.y*fh*fh)/(fw*fw+fh*fh));
  }else moveFeature(d.e,f,d.name,dx,dy);
  save(d.e,f);
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])layer.addEventListener(type,event=>{
  if(drag&&event.pointerId===drag.id){event.preventDefault();event.stopPropagation();endDrag();}
 });
 layer.addEventListener('keydown',event=>{
  const button=event.target.closest('button[data-handle]'),e=current();
  if(!button||!usable())return;
  const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
  if(!delta)return;event.preventDefault();event.stopPropagation();
  const f=clone(e.recipe.makeup.face),step=event.shiftKey?.03:.005,c=crop(e),dx=delta[0]*step*c.w,dy=delta[1]*step*c.h,name=button.dataset.handle;
  if(name==='face')moveFace(f,dx,dy);
  else if(name==='resize')resizeFace(f,1+(delta[0]+delta[1])*(event.shiftKey?.1:.02));
  else moveFeature(e,f,name,dx,dy);
  save(e,f);
 });
 function render(){
  const e=current();layer.hidden=!active||!e;if(layer.hidden)return;
  const f=e.recipe.makeup.face,c=crop(e),w=Math.max(1,frame.clientWidth),h=Math.max(1,frame.clientHeight);
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  const view=p=>({x:(p.x-c.x)/c.w,y:(p.y-c.y)/c.h});
  const points=Array.from({length:65},(_,i)=>{
   const t=i/64*2*Math.PI,p=view(toSource(e,f,{x:.5+.5*Math.cos(t),y:.5+.5*Math.sin(t)}));
   return `${i?'L':'M'}${(p.x*w).toFixed(2)} ${(p.y*h).toFixed(2)}`;
  });outline.setAttribute('d',points.join(' ')+'Z');
  // Outline the tint's unfeathered lip shape, so width/height alignment is visible before applying colour.
  const mouth={...defaults.mouth,...f.mouth},lip=[];
  for(let side=0;side<2;side++)for(let i=0;i<=32;i++){
   const x=side?1-i/16:-1+i/16,shape=Math.max(0,1-x*x);
   const y=side?.55*shape:-.45*shape*(.65+.35*Math.sin(Math.abs(x)*Math.PI));
   const p=view(toSource(e,f,{x:mouth.x+x*mouth.w/2,y:mouth.y+y*mouth.h}));
   lip.push(`${lip.length?'L':'M'}${(p.x*w).toFixed(2)} ${(p.y*h).toFixed(2)}`);
  }
  mouthOutline.setAttribute('d',lip.join(' ')+'Z');
  for(const [name,b] of handles){
   const p=view(toSource(e,f,feature(f,name))),outside=p.x<0||p.x>1||p.y<0||p.y>1;
   // The move handle stays reachable if a new crop has moved the face outside the visible photograph.
   b.hidden=name!=='face'&&outside;b.style.left=`${clamp(p.x,.025,.975)*100}%`;b.style.top=`${clamp(p.y,.025,.975)*100}%`;
  }
 }
 return {
  set active(on){active=!!on;if(!active)endDrag();render();},
  get active(){return active;},
  render,
  reset(){active=false;endDrag();layer.hidden=true;},
 };
}
