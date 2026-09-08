import * as THREE from './vendor/three.module.js';
import {makeContentObject} from './content-items.js';
import {ITEMS} from './content-data.js';

export function createInspector({scene,camera,renderer,canvas,onInspect,onReturn=()=>{},onLink,onContact,resetInput}){
  let held=null,item=null,saved=null,drag=null,zoom=1.9,pan=new THREE.Vector2();
  const overlayCamera=new THREE.PerspectiveCamera(40,camera.aspect,.01,240);
  const tray=new THREE.Group();scene.add(tray);tray.visible=false;
  const light=new THREE.PointLight(0xffeed1,4,5);light.position.set(0,1,2);tray.add(light);
  const caption=document.createElement('section');caption.id='inspect-caption';caption.hidden=true;caption.setAttribute('aria-label','Object inspection controls');
  const title=document.createElement('span');title.setAttribute('aria-live','polite');caption.append(title);
  const controls=document.createElement('div');caption.append(controls);document.body.append(caption);
  const button=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=fn;controls.append(b);return b;};
  button('↶',()=>held.rotation.y-=.2);button('↷',()=>held.rotation.y+=.2);button('−',()=>zoom=Math.min(3.5,zoom+.15));button('+',()=>zoom=Math.max(.8,zoom-.15));
  button('← Page',()=>held?.userData.reader.next(-1));button('Page →',()=>held?.userData.reader.next(1));button('FLIP / OPEN',()=>held?.userData.reader.flip());button('RESET',reset);
  const secondary=button('CLOSE',close);
  const volume=button('NEXT VOLUME',()=>{const books=ITEMS.filter(i=>i.kind==='book');open(books[(books.findIndex(i=>i.id===item.id)+1)%books.length]);});
  function reset(){if(!held)return;held.rotation.set(0,0,0);zoom=1.9;pan.set(0,0);held.userData.reader.open();}
  function close(){if(!held)return;onReturn(item);tray.remove(held);held.traverse(o=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material])){m?.map?.dispose();m?.dispose();}});held=null;item=null;tray.visible=false;caption.hidden=true;renderer.setPixelRatio(saved.dpr);document.documentElement.classList.remove('inspecting');window.__JOHANSSON_INSPECTING__=false;resetInput();saved.focus?.focus?.();}
  function open(data){if(held)close();saved={dpr:renderer.getPixelRatio(),focus:document.activeElement};document.exitPointerLock?.();resetInput();item=data;held=makeContentObject(item);held.traverse(o=>{if(o.isMesh){o.renderOrder=1000;for(const m of (Array.isArray(o.material)?o.material:[o.material])){m.depthTest=false;m.depthWrite=false;}}});tray.add(held);volume.hidden=item.kind!=='book';tray.position.copy(camera.position);tray.quaternion.copy(camera.quaternion);overlayCamera.position.copy(camera.position);overlayCamera.quaternion.copy(camera.quaternion);tray.visible=true;caption.hidden=false;document.documentElement.classList.add('inspecting');window.__JOHANSSON_INSPECTING__=true;renderer.setPixelRatio(Math.max(.8,saved.dpr-.35));reset();onInspect(item);secondary.focus();}
  function stop(e){e.preventDefault();e.stopImmediatePropagation();}
  canvas.addEventListener('pointerdown',e=>{if(!held)return;stop(e);drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,pan:e.button===2||e.altKey};canvas.setPointerCapture(e.pointerId);},{capture:true});
  canvas.addEventListener('pointermove',e=>{if(!held||!drag)return;stop(e);const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.pan){pan.x+=dx*.002;pan.y-=dy*.002;}else{held.rotation.y+=dx*.008;held.rotation.x+=dy*.008;}drag.x=e.clientX;drag.y=e.clientY;},{capture:true});
  canvas.addEventListener('pointerup',e=>{if(!held)return;stop(e);if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<6){if(e.clientX>innerWidth*.7)held.userData.reader.next(1);else if(e.clientX<innerWidth*.3)held.userData.reader.next(-1);}drag=null;},{capture:true});
  canvas.addEventListener('pointercancel',()=>drag=null);
  for(const name of ['click','contextmenu','touchstart','touchmove','touchend'])canvas.addEventListener(name,e=>{if(held)stop(e);},{capture:true,passive:false});
  canvas.addEventListener('wheel',e=>{if(!held)return;stop(e);zoom=THREE.MathUtils.clamp(zoom+e.deltaY*.002,.8,3.5);},{capture:true,passive:false});
  // Q tap closes. Shift+Q zooms out; E zooms in. I/J/K/L orbit while arrows turn pages.
  document.addEventListener('keydown',e=>{if(!held)return;if(e.key==='Tab'){const buttons=[...controls.children].filter(b=>!b.hidden);const n=buttons.indexOf(document.activeElement);stop(e);buttons[(n+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();return;}stop(e);switch(e.code){case 'Escape':close();break;case 'KeyQ':if(e.shiftKey)zoom=Math.min(3.5,zoom+.12);else close();break;case 'KeyE':zoom=Math.max(.8,zoom-.12);break;case 'KeyR':reset();break;case 'KeyF':held.userData.reader.flip();break;case 'ArrowLeft':held.userData.reader.next(-1);break;case 'ArrowRight':held.userData.reader.next(1);break;case 'KeyJ':held.rotation.y-=.12;break;case 'KeyL':held.rotation.y+=.12;break;case 'KeyI':held.rotation.x-=.12;break;case 'KeyK':held.rotation.x+=.12;break;}},{capture:true});
  return {open,close,get active(){return !!held;},render(dt){if(!held)return;overlayCamera.aspect=camera.aspect;overlayCamera.updateProjectionMatrix();held.position.set(pan.x,pan.y,-zoom);light.position.set(0,1,-zoom+1);held.userData.reader.update(dt);title.textContent=item.title+' · '+held.userData.reader.page+'/'+item.pages.length+' · Drag rotate · Right-drag pan · IJKL orbit · E / Shift+Q zoom · Q close';renderer.render(scene,overlayCamera);}};
}
