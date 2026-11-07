/**
 * Looking closer at a photo with the fingers, as the phone's own Photos does: pinch to zoom round the fingers, drag a
 * zoomed photo about (it springs back at its edges, and a flick carries on a little), double-tap to zoom in where
 * tapped and again to see it whole; on a computer a trackpad pinch, or the mouse wheel with ctrl. Only the view
 * changes: nothing about the photo or its recipe.
 *
 * `target` sits centred in `area`, which clips it once zoomed; it is moved with a CSS transform round its centre. Two
 * numbers are left on the target for what is drawn inside it:
 *  - the CSS variable --view-zoom, live, so that controls on the photo (a sticker's buttons, the face guide's handles)
 *    keep one finger's size: scale(calc(1 / var(--view-zoom, 1)));
 *  - data-view-zoom, the zoom once the fingers rest, for canvases to be drawn again at the detail it needs
 *    (viewDetail), once, not on every frame of a pinch.
 */
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const ease=t=>1-(1-t)**3;
const middle=p=>({x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2});
const apart=p=>Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y);
// Past an edge the photo follows the finger less and less, as a phone's scrolling does.
const band=(d,size)=>(1-1/(d*.55/Math.max(1,size)+1))*size;
const rubber=(v,[lo,hi],size)=>v<lo?lo-band(lo-v,size):v>hi?hi+band(v-hi,size):v;

/** The zoom a photo rests at (1 when it is not zoomed). */
export function viewZoom(el){const z=+el?.dataset?.viewZoom;return z>1?z:1;}
/**
 * Canvas pixels per CSS pixel for a layer drawn over a whole picture: the screen's own (`dpr`) times the resting zoom,
 * within `budget` pixels in all (a zoomed layer grows with the square of the zoom), and never fewer than unzoomed.
 */
export function viewDetail(frame,dpr,budget=4e6){
 const z=viewZoom(frame);if(z<=1)return dpr;
 const w=Math.max(1,frame.clientWidth),h=Math.max(1,frame.clientHeight);
 return Math.max(dpr,Math.min(dpr*z,Math.sqrt(budget/(w*h))));
}

/**
 * enabled(): whether the photo may be zoomed now (the Crop tab pinches the crop itself instead).
 * maxZoom(): the closest look, a few screen pixels to each of the photo's own.
 * onePan(): whether one finger moves a zoomed photo (not while it paints in Erase: two fingers do there).
 * doubleTap(): whether a double tap zooms.
 * claims(element): a touch that starts there belongs to something on the photo (a sticker, a button), pinch and all.
 * yields(element): one finger there drags it (the face guide's handles, which cover a small face), but two zoom:
 *   pinched() is told when a second finger turns its drag into a pinch.
 * settled(zoom): the fingers have rested at a new zoom.
 */
export function createZoomView(area,target,{enabled=()=>true,maxZoom=()=>4,onePan=()=>true,doubleTap=()=>true,claims=el=>!!el?.closest?.('button'),yields=()=>false,pinched=()=>{},settled=()=>{}}={}){
 let z=1,x=0,y=0,rested=1,anim=0,gesture=null,lastTap=null,wheelTimer=0,trackpad=null,pinchEnded=-1e9;
 const pointers=new Map();
 const fit=document.createElement('button');fit.type='button';fit.className='zoom-fit';fit.hidden=true;area.append(fit);
 fit.addEventListener('click',()=>animate(1,0,0));
 const shown=()=>target.offsetWidth>0&&target.offsetHeight>0;
 /** The area's box, the target's size, and its centre as laid out (without the zoom's move). */
 function box(){
  const a=area.getBoundingClientRect(),r=target.getBoundingClientRect();
  return {a,w:target.offsetWidth,h:target.offsetHeight,cx:(r.left+r.right)/2-x,cy:(r.top+r.bottom)/2-y};
 }
 /** How far the photo may move at a zoom: its edges never come inside the area, and one smaller than it stays centred. */
 function limits(g,s){
  const rx=s*g.w/2,ry=s*g.h/2;
  return {x:s*g.w>g.a.width+.5?[g.a.right-rx-g.cx,g.a.left+rx-g.cx]:[0,0],y:s*g.h>g.a.height+.5?[g.a.bottom-ry-g.cy,g.a.top+ry-g.cy]:[0,0]};
 }
 function apply(){
  const on=Math.abs(z-1)>.001||Math.abs(x)>.25||Math.abs(y)>.25;
  target.style.transform=on?`translate(${x}px,${y}px) scale(${z})`:'';
  target.style.setProperty('--view-zoom',String(z));
  area.classList.toggle('zoomed',on);
  fit.hidden=z<1.05;
  if(!fit.hidden){const label=z<9.95?z.toFixed(1):String(Math.round(z));fit.textContent=`${label}×`;fit.setAttribute('aria-label',`Zoomed ${label} times. Show the whole photo`);}
 }
 /** The zoom the fingers left it at: canvases are drawn again for it. */
 function rest(){
  if(z<1.001){z=1;x=0;y=0;apply();}
  if(Math.abs(z-rested)<.001)return;
  rested=z;if(z>1)target.dataset.viewZoom=z.toFixed(3);else delete target.dataset.viewZoom;
  settled(z);
 }
 function stop(){if(anim){cancelAnimationFrame(anim);anim=0;}}
 function animate(nz,nx,ny,duration=280){
  stop();const from={z,x,y},t0=performance.now();
  if(Math.abs(nz-z)<.001&&Math.abs(nx-x)<.5&&Math.abs(ny-y)<.5){z=nz;x=nx;y=ny;apply();rest();return;}
  const step=t=>{
   const k=ease(clamp((t-t0)/duration,0,1));
   z=from.z+(nz-from.z)*k;x=from.x+(nx-from.x)*k;y=from.y+(ny-from.y)*k;apply();
   if(k<1)anim=requestAnimationFrame(step);else{anim=0;rest();}
  };
  anim=requestAnimationFrame(step);
 }
 /** To zoom `s` round a point on the screen: the photo under it stays under it. */
 function about(s,at,g=box()){
  const lx=(at.x-g.cx-x)/z,ly=(at.y-g.cy-y)/z;
  return {x:at.x-g.cx-s*lx,y:at.y-g.cy-s*ly};
 }
 function zoomTo(s,at,{soft=false}={}){
  const g=box(),p=about(s,at,g),l=limits(g,s);z=s;
  x=soft?rubber(p.x,l.x,g.a.width):clamp(p.x,...l.x);y=soft?rubber(p.y,l.y,g.a.height):clamp(p.y,...l.y);apply();
 }
 /** Back inside the limits once the fingers are off, carried on by a flick. */
 function settle(focus,vx=0,vy=0){
  const g=box(),m=maxZoom(),nz=clamp(z,1,m);
  let p={x,y};
  if(nz!==z)p=focus?about(nz,focus,g):{x:x*nz/z,y:y*nz/z};
  const l=limits(g,nz),fling=Math.hypot(vx,vy)>.25&&nz===z;
  // An ease-out that starts at the finger's own speed covers a third of its time at that speed.
  const duration=fling?450:280,nx=nz<=1?0:clamp(p.x+(fling?vx*duration/3:0),...l.x),ny=nz<=1?0:clamp(p.y+(fling?vy*duration/3:0),...l.y);
  animate(nz<1.02?1:nz,nz<1.02?0:nx,nz<1.02?0:ny,duration);
 }
 function anchor(){
  const p=[...pointers.values()],g=box(),at=p.length>1?middle(p):p[0];
  gesture.from={z,x,y,at,d:p.length>1?apart(p):0,g,lx:(at.x-g.cx-x)/z,ly:(at.y-g.cy-y)/z};
  gesture.samples=[];
 }
 /** The finger's speed as it lifted (px per ms): over its last tenth of a second, or its last two moves if a busy page
  *  spaced them wider; nothing if it had stopped. */
 function velocity(){
  const s=gesture?.samples||[],now=performance.now();
  if(s.length<2||now-s.at(-1).t>80)return {x:0,y:0};
  const recent=s.filter(q=>now-q.t<100),[a,b]=recent.length>1?[recent[0],recent.at(-1)]:s.slice(-2),dt=Math.max(1,b.t-a.t);
  return {x:(b.x-a.x)/dt,y:(b.y-a.y)/dt};
 }

 // Every finger on the area is seen on its way down (capture), before a sticker or the eraser takes it.
 area.addEventListener('pointerdown',e=>{
  if(!enabled()||!shown()||(e.pointerType==='mouse'&&e.button!==0))return;
  if(!pointers.size){
   stop();
   const yielded=yields(e.target);
   gesture={claimed:!yielded&&claims(e.target),yielded,moved:false,multi:false,t:performance.now(),x:e.clientX,y:e.clientY,panned:false};
  }else if(!gesture)return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(gesture.claimed)return;
  // A second finger on a sticker or a handle while the first is on the photo is part of the pinch, not a new drag; one
  // that joins a handle's drag makes it a pinch, and the handle goes back to where its drag began.
  if(pointers.size>1){
   gesture.multi=true;if(gesture.yielded){gesture.yielded=false;pinched();}
   if(claims(e.target)||yields(e.target)){e.stopPropagation();e.preventDefault();}
  }
  anchor();
 },{capture:true});
 area.addEventListener('pointermove',e=>{
  if(!gesture||gesture.claimed||!pointers.has(e.pointerId))return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(!gesture.moved&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8)gesture.moved=true;
  const p=[...pointers.values()],f=gesture.from,g=f.g;
  if(p.length>1&&f.d>0){
   const m=maxZoom(),at=middle(p);let s=f.z*apart(p)/f.d;
   // A little way past the closest and the widest, with growing resistance; it springs back on release.
   s=s<1?Math.max(.6,1-(1-s)*.45):s>m?m+(s-m)*.3:s;
   const l=limits(g,s);z=s;x=rubber(at.x-g.cx-s*f.lx,l.x,g.a.width);y=rubber(at.y-g.cy-s*f.ly,l.y,g.a.height);
   gesture.focus=at;gesture.panned=true;apply();
  }else if(p.length===1&&z>1.001&&onePan()&&!gesture.yielded){
   const q=p[0],l=limits(g,z);x=rubber(f.x+q.x-f.at.x,l.x,g.a.width);y=rubber(f.y+q.y-f.at.y,l.y,g.a.height);
   gesture.samples.push({t:performance.now(),x,y});if(gesture.samples.length>12)gesture.samples.shift();
   gesture.panned=true;apply();
  }
 },{capture:true});
 const lift=e=>{
  if(!pointers.has(e.pointerId))return;
  pointers.delete(e.pointerId);
  if(!gesture)return;
  if(gesture.claimed){if(!pointers.size)gesture=null;return;}
  // A finger lifted from a pinch: the other carries on from where it is.
  if(pointers.size){anchor();return;}
  const g=gesture,v=velocity();gesture=null;if(g.multi)pinchEnded=performance.now();
  const tap=e.type==='pointerup'&&!g.moved&&!g.multi&&!g.yielded&&performance.now()-g.t<300;
  if(tap&&doubleTap()){
   const now=performance.now(),at={x:e.clientX,y:e.clientY};
   if(lastTap&&now-lastTap.t<320&&Math.hypot(at.x-lastTap.x,at.y-lastTap.y)<32){lastTap=null;toggle(at);return;}
   lastTap={t:now,...at};
  }else if(!tap)lastTap=null;
  if(g.panned)settle(g.focus,g.multi?0:v.x,g.multi?0:v.y);
 };
 // Heard on the whole window: a mouse let go outside the area still ends its drag.
 for(const type of ['pointerup','pointercancel'])addEventListener(type,lift,{capture:true});
 /** A double tap: in to where it was tapped, or out to the whole photo. */
 function toggle(at){
  if(z>1.05){animate(1,0,0);return;}
  const g=box(),s=Math.min(maxZoom(),2.5),p=about(s,at,g),l=limits(g,s);
  animate(s,clamp(p.x,...l.x),clamp(p.y,...l.y),300);
 }
 // A computer: a trackpad pinch arrives as the wheel with ctrl (or as Safari's gesture events); the wheel alone moves a
 // zoomed photo about.
 area.addEventListener('wheel',e=>{
  if(!enabled()||!shown()||e.defaultPrevented)return;
  const unit=e.deltaMode===1?16:e.deltaMode===2?area.clientHeight:1,dx=e.deltaX*unit,dy=e.deltaY*unit;
  if(e.ctrlKey||e.metaKey){e.preventDefault();stop();zoomTo(clamp(z*Math.exp(-dy*.01),1,maxZoom()),{x:e.clientX,y:e.clientY});}
  else if(z>1.001){e.preventDefault();stop();const g=box(),l=limits(g,z);x=clamp(x-dx,...l.x);y=clamp(y-dy,...l.y);apply();}
  else return;
  clearTimeout(wheelTimer);wheelTimer=setTimeout(rest,160);
 },{passive:false});
 area.addEventListener('gesturestart',e=>{if(!enabled())return;e.preventDefault();if(!pointers.size){stop();trackpad=z;}});
 area.addEventListener('gesturechange',e=>{if(trackpad==null)return;e.preventDefault();zoomTo(clamp(trackpad*e.scale,1,maxZoom()),{x:e.clientX,y:e.clientY});});
 area.addEventListener('gestureend',e=>{if(trackpad==null)return;e.preventDefault();trackpad=null;rest();});
 // The area or the photo changed size (a rotated phone, a taller panel): the photo stays inside its limits.
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{
  if(gesture||anim||z<=1||!shown())return;
  const g=box(),l=limits(g,z);x=clamp(x,...l.x);y=clamp(y,...l.y);apply();
 }).observe(area);

 return {
  get zoom(){return z;},
  /** Fingers on it, or easing to rest. */
  get moving(){return !!anim||!!gesture||trackpad!=null;},
  /**
   * Zoomed now, or a pinch under way or just ended: the photo's own one-finger gestures (a swipe to the next Look)
   * stand aside, also for a finger that came down second, on the photo, beside one on a handle.
   */
  get zoomed(){return z>1.001||!!gesture?.multi||performance.now()-pinchEnded<350;},
  /** Straight back to the whole photo (a new photo, another screen, the Crop tab). */
  reset(){stop();gesture=null;lastTap=null;pointers.clear();clearTimeout(wheelTimer);trackpad=null;z=1;x=0;y=0;apply();rest();},
  /** Zoomed to `s` with the photo's point (u, v), as shares of its width and height, in the middle of the area. */
  show(s,u,v){
   stop();const g=box(),n=clamp(s,1,maxZoom()),l=limits(g,n);
   const ax=g.a.left+g.a.width/2,ay=g.a.top+g.a.height/2;
   animate(n,n>1?clamp(ax-g.cx-n*(u-.5)*g.w,...l.x):0,n>1?clamp(ay-g.cy-n*(v-.5)*g.h,...l.y):0,360);
  },
  /** Zoomed in or out to `s` round the middle of the area, eased (keyboard and tests). */
  zoomTo(s,at){const a=area.getBoundingClientRect();at??={x:a.left+a.width/2,y:a.top+a.height/2};const g=box(),n=clamp(s,1,maxZoom()),p=about(n,at,g),l=limits(g,n);animate(n,n>1?clamp(p.x,...l.x):0,n>1?clamp(p.y,...l.y):0);},
 };
}
