import {stickAxes} from './analogue.js';

export function createTouchSticks({canvas,movePad,lookPad,enabled,onDrag}){
 const pads=[movePad,lookPad],active=new Map(),axes=[{x:0,y:0},{x:0,y:0}];
 let drag=null,suppressClickUntil=0;
 function update(index,e){
  const rect=pads[index].getBoundingClientRect(),radius=rect.width*.34;
  const x=(e.clientX-rect.left-rect.width/2)/radius,y=(e.clientY-rect.top-rect.height/2)/radius;
  axes[index]=stickAxes(x,y,.08);
  const length=Math.max(1,Math.hypot(x,y));
  pads[index].querySelector('.stick-knob').style.transform=`translate(${x/length*radius}px,${y/length*radius}px)`;
 }
 function release(index){axes[index]={x:0,y:0};pads[index].classList.remove('active');pads[index].querySelector('.stick-knob').style.transform='translate(0,0)';}
 for(const [index,pad] of pads.entries()){
  pad.addEventListener('pointerdown',e=>{
   if(!enabled()||e.button>0||[...active.values()].includes(index))return;
   e.preventDefault();e.stopPropagation();active.set(e.pointerId,index);pad.setPointerCapture(e.pointerId);pad.classList.add('active');update(index,e);
  });
  pad.addEventListener('pointermove',e=>{if(active.get(e.pointerId)!==index)return;if(!enabled()){reset();return;}e.preventDefault();update(index,e);});
  const end=e=>{if(active.get(e.pointerId)!==index)return;active.delete(e.pointerId);release(index);};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,end);
  pad.addEventListener('contextmenu',e=>e.preventDefault());
 }
 // A swipe on the unobstructed view remains available for precise aiming.
 canvas.addEventListener('pointerdown',e=>{if(!enabled()||e.pointerType!=='touch'||drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,distance:0};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(!enabled()){reset();return;}
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.distance+=Math.hypot(dx,dy);drag.x=e.clientX;drag.y=e.clientY;
  onDrag(dx,dy);if(drag.distance>8)suppressClickUntil=performance.now()+500;
 });
 const endDrag=e=>{if(e.pointerId===drag?.id)drag=null;};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,endDrag);
 function reset(){
  for(const [id,index] of active){if(pads[index].hasPointerCapture?.(id))pads[index].releasePointerCapture(id);}
  active.clear();drag=null;pads.forEach((_,index)=>release(index));
 }
 return {get move(){return axes[0];},get look(){return axes[1];},reset,suppressClick:()=>performance.now()<suppressClickUntil};
}
