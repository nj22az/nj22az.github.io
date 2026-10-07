import {createPlacements} from './placements.js';
import {createBuildMode} from './build-mode.js';
import * as THREE from '../../vendor/three.module.js';
import {HOME_CATALOGUE,homeFurnitureFactory,restoreHomeItems} from './home-furniture.js';

/**
 * Arranging furniture in Johansson's own rooms: the builder's rules and mouse, inside the home, saved with this player
 * (state.homeDecor.items). The room is seen from above like a dollhouse, the ceiling lifted off while you work.
 *
 * floor(x,z): true on the open floor of the main room (not the WC or the bath); keepClear: [[x,z,size]] squares kept
 * free (the genkan, and in front of the wardrobe, the bookshelf, the futon and the doors).
 */
const lookup=id=>HOME_CATALOGUE.find(f=>f.id===id)||null;

export function createHomeDecorating({group,colliders,state,save,canvas,camera,floor,keepClear,stage,ceilingAbove=2.5,onClose=()=>{}}){
 const factory=homeFurnitureFactory();
 let persist=false;
 const placements=createPlacements({group,colliders,factory,walkable:floor,heightAt:()=>0,doors:keepClear,lookup,needWhy:false,
  offGround:'Part of it is outside the open floor (a wall, the genkan step, the WC or the bath).',
  onChange:()=>{if(!persist)return;state.homeDecor={...(state.homeDecor||{}),items:placements.list().map(({id,kind,x,z,yaw})=>({id,kind,x:+x.toFixed(3),z:+z.toFixed(3),yaw:+yaw.toFixed(4)}))};save();}});
 const skipped=placements.load(restoreHomeItems(state.homeDecor?.items).map(p=>({...p,note:''})));persist=true;
 let bar=null,ceiling=[];
 const mode=createBuildMode({canvas,camera,group,placements,factory,heightAt:()=>0,lookup,stage,keep:()=>bar?[bar]:[],
  limits:{min:2.5,max:10,start:7},getStart:()=>({x:0,z:0})});

 function makeBar(){
  const el=document.createElement('div');el.id='decorBar';el.setAttribute('role','toolbar');el.setAttribute('aria-label','Arrange furniture');
  el.style.cssText='position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:8px;'
   +'max-width:min(920px,calc(100vw - 32px));padding:12px 14px;background:#fffdf8;color:#1f2a28;border-radius:14px;box-shadow:0 6px 24px rgba(0,0,0,.18);font:600 14px/1.3 "LINE Seed JP",system-ui,sans-serif';
  const row=(cls)=>{const r=document.createElement('div');r.style.cssText='display:flex;flex-wrap:wrap;gap:6px;align-items:center';if(cls)r.className=cls;el.append(r);return r;};
  const btn=(parent,label,fn,title='')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.title=title;
   b.style.cssText='font:inherit;padding:7px 11px;border-radius:9px;border:1px solid #d9d3c6;background:#f6f3ec;color:inherit;cursor:pointer';b.onclick=fn;parent.append(b);return b;};
  const pieces=row();
  const buttons=HOME_CATALOGUE.map(f=>{const b=btn(pieces,f.name,()=>{mode.choose(f.id);mark();},f.purpose);b.dataset.id=f.id;return b;});
  const tools=row();tools.style.flexWrap='nowrap';
  btn(tools,'Turn ⟲',()=>mode.turn(-1),'R');btn(tools,'Turn ⟳',()=>mode.turn(1),'Shift R');
  btn(tools,'Remove',()=>{const id=mode.status().picked;if(id)mode.remove(id);},'Delete');
  btn(tools,'Stop',()=>{mode.choose(null);mark();},'Esc');
  const spacer=document.createElement('span');spacer.style.flex='1';tools.append(spacer);
  const done=btn(tools,'Done',close);
  const status=document.createElement('div');status.style.cssText='font-weight:400;color:#5d6b67;min-height:1.3em';el.append(status);done.style.background='#2f7d6d';done.style.color='#fff';done.style.borderColor='#2f7d6d';
  function mark(){const k=mode.status().kind;for(const b of buttons){const on=b.dataset.id===k;b.style.background=on?'#2f7d6d':'#f6f3ec';b.style.color=on?'#fff':'inherit';}}
  const tick=()=>{if(!bar)return;const s=mode.status();
   status.textContent=s.picked?'Click to move it · R turns it · Remove takes it away':s.hover&&!s.hover.ok?s.hover.problems[0]:s.kind?'Click on the floor to place it':'Choose a piece, or click one in the room to move it';
   mark();requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
  return el;
 }
 function liftCeiling(on){
  if(on){ceiling=[];group.traverse(o=>{if(o.isMesh&&o.visible){o.updateWorldMatrix(true,false);const y=o.getWorldPosition(new THREE.Vector3()).y;if(y>ceilingAbove){ceiling.push(o);o.visible=false;}}});}
  else{ceiling.forEach(o=>o.visible=true);ceiling=[];}
 }
 function open(){
  if(bar)return;
  bar=makeBar();document.body.append(bar);liftCeiling(true);mode.enter();
 }
 function close(){
  if(!bar)return;
  mode.leave();liftCeiling(false);bar.remove();bar=null;onClose();
 }
 return {open,close,get open_(){return !!bar;},placements,mode,skipped,status:()=>mode.status()};
}
