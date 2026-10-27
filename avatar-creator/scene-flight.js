import {stepFreeCamera} from '../johansson-town/src/input/free-camera.js';

// Studio uses World's flight maths, but owns only its picture. Character drags and form controls remain editors.
export function cameraRecord(camera){
 const p=camera.position,d={x:-Math.sin(camera.rotation.y)*Math.cos(camera.rotation.x),y:Math.sin(camera.rotation.x),z:-Math.cos(camera.rotation.y)*Math.cos(camera.rotation.x)};
 return {orbit:0,elevation:0,zoom:1,position:[p.x,p.y,p.z],target:[p.x+d.x,p.y+d.y,p.z+d.z],fov:camera.fov};
}
export function nearbyPlacement({position,direction,origin,free,seen=()=>true}){
 const length=Math.hypot(direction.x,direction.z)||1,fx=direction.x/length,fz=direction.z/length;
 for(const distance of [2.5,3.5,1.8,4.5,5.5])for(const side of [0,.7,-.7,1.4,-1.4]){
  const x=position.x+fx*distance-fz*side,z=position.z+fz*distance+fx*side;
  if(Math.abs(x-origin[0])<=12&&Math.abs(z-origin[2])<=12&&free(x,z)&&seen(x,z))return {x,z};
 }
 return null;
}
export function createSceneFlight({canvas,enabled,camera,bounds,actorAt,onMove,onStop,win=globalThis}){
 const abort=new AbortController(),keys=new Set(),points=new Map();let frame=0,last=0,pose=null,busy=false,look={x:0,y:0},nudge={x:0,y:0,z:0},pinch=null;
 const listen=(target,type,fn,extra={})=>target.addEventListener(type,fn,{signal:abort.signal,...extra});
 function reset(){keys.clear();points.clear();pinch=null;pose=null;look={x:0,y:0};nudge={x:0,y:0,z:0};cancelAnimationFrame(frame);frame=0;last=0;}
 function finish(){pose=null;onStop?.();}
 function wake(){if(!frame)frame=requestAnimationFrame(tick);}
 async function tick(now){
  frame=0;if(!enabled()||!camera()){reset();return;}if(busy){wake();return;}
  const c=camera();c.rotation.reorder('YXZ');pose??={...c.position,yaw:c.rotation.y,pitch:c.rotation.x,velocity:{x:0,y:0,z:0}};
  const k=code=>keys.has(code)?1:0,dt=last?Math.min(.05,(now-last)/1000):1/60;last=now;
  const input={move:{x:k('KeyD')+k('ArrowRight')-k('KeyA')-k('ArrowLeft'),y:k('KeyE')+k('Space')-k('KeyQ')-k('KeyC'),z:k('KeyW')+k('ArrowUp')-k('KeyS')-k('ArrowDown')},look,nudge,fast:keys.has('ShiftLeft')||keys.has('ShiftRight'),slow:keys.has('AltLeft')||keys.has('AltRight')};
  pose=stepFreeCamera(pose,input,dt,bounds());look={x:0,y:0};nudge={x:0,y:0,z:0};
  c.position.set(pose.x,pose.y,pose.z);c.rotation.set(pose.pitch,pose.yaw,0,'YXZ');c.updateMatrixWorld(true);
  busy=true;try{await onMove(cameraRecord(c));}finally{busy=false;}
  if(!enabled()||!pose)return;
  if(keys.size||points.size||Math.hypot(...Object.values(pose.velocity))>.01)wake();else{last=0;finish();}
 }
 const consume=e=>{e.preventDefault();e.stopImmediatePropagation();};
 listen(canvas,'pointerdown',e=>{
  if(!enabled()||!camera()||(!points.size&&actorAt(e)))return;
  consume(e);canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});pinch=null;wake();
 },{capture:true});
 listen(canvas,'pointermove',e=>{
  if(!points.has(e.pointerId))return;consume(e);const p=points.get(e.pointerId),q={x:e.clientX,y:e.clientY};points.set(e.pointerId,q);
  if(points.size===1){look.x+=(q.x-p.x)*.0042;look.y+=(q.y-p.y)*.0042;}
  else{const [a,b]=[...points.values()],next={x:(a.x+b.x)/2,y:(a.y+b.y)/2,gap:Math.hypot(a.x-b.x,a.y-b.y)};
   if(pinch){nudge.x-=(next.x-pinch.x)*.01;nudge.y+=(next.y-pinch.y)*.01;nudge.z+=(next.gap-pinch.gap)*.012;}pinch=next;
  }wake();
 },{capture:true});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])listen(canvas,type,e=>{if(points.delete(e.pointerId)){consume(e);pinch=null;wake();}},{capture:true});
 listen(canvas,'wheel',e=>{if(!enabled()||!camera())return;consume(e);nudge.z-=Math.sign(e.deltaY)*Math.min(1.5,Math.abs(e.deltaY)/100);wake();},{passive:false});
 const codes=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyE','KeyQ','KeyC','Space','ShiftLeft','ShiftRight','AltLeft','AltRight']);
 listen(win,'keydown',e=>{if(!enabled()||win.document.activeElement!==canvas)return;if(e.code==='Escape'){consume(e);reset();onStop?.();return;}if(codes.has(e.code)&&!e.ctrlKey&&!e.metaKey){consume(e);keys.add(e.code);wake();}},{capture:true});
 listen(win,'keyup',e=>{if(keys.delete(e.code)){consume(e);wake();}},{capture:true});
 listen(canvas,'blur',()=>{reset();onStop?.();});listen(win,'blur',reset);
 return {reset,dispose(){reset();abort.abort();}};
}
