import {normalizeHands,HAND_PRESETS,DIGITS} from './hands.js';
import {POSE_CONTROLS,normalizePose} from './pose.js';

export const POSE_CSS=`.shm-pose-editor{position:absolute;right:8px;top:8px;z-index:5;font-size:12px;max-width:calc(100% - 16px)}
.shm-pose-editor [hidden]{display:none!important}
.shm-pose-editor summary{cursor:pointer;padding:10px 12px;min-height:44px;box-sizing:border-box;border:1px solid #d5c6ac;border-radius:10px;background:#fffffff2}
.shm-pose-editor-body{position:absolute;right:0;top:calc(100% + 6px);width:min(280px,calc(100vw - 48px));max-height:min(360px,45dvh);overflow:auto;display:grid;gap:10px;padding:12px;box-sizing:border-box;background:#fff;border:1px solid #d5c6ac;border-radius:12px;box-shadow:0 6px 24px #20344422}
.shm-pose-editor:not([open])>.shm-pose-editor-body{display:none}
.shm-pose-sliders{display:grid;gap:8px}.shm-pose-sliders label{display:grid;gap:4px;font-size:12px}.shm-pose-sliders label[hidden]{display:none}
.shm-pose-sliders span{display:flex;justify-content:space-between;gap:8px}.shm-pose-sliders input{width:100%;min-height:32px;accent-color:var(--line-green,#cc7c23)}
.shm-pose-actions{display:flex;flex-wrap:wrap;gap:6px}
@media(max-width:600px){.shm-pose-editor-body{position:fixed;top:auto;bottom:12px;right:12px;width:min(320px,calc(100vw - 24px));max-height:38dvh;z-index:10}}

.shm-pose-inline{position:static;max-width:none}.shm-pose-inline>.shm-pose-editor-body{position:static;width:auto;max-height:40vh;box-shadow:none;margin-top:6px}
`;

/** One panel for World and Studio; all rig changes go through the creator. */
export function createPosePanel({getState,onAdjust,onHold,onResume,onReset,onUndo,onRedo,onOpen,onSave,onHands,onExport,inline=false}){
 if(!document.getElementById('shared-pose-css')){const style=document.createElement('style');style.id='shared-pose-css';style.textContent=POSE_CSS;document.head.append(style);}
 const el=(tag,props={},...children)=>{const e=Object.assign(document.createElement(tag),props);e.append(...children);return e;};
 const root=el('details',{className:'shm-pose-editor'+(inline?' shm-pose-inline':'')}),summary=el('summary',{textContent:'Pose adjustments'});
 const body=el('div',{className:'shm-pose-editor-body'}),status=el('p',{className:'shm-note',role:'status'});
 const hint=el('p',{className:'shm-note',textContent:'Hold a moment, then adjust it. Angles are offsets from that pose. Your character design stays separate.'});
 const group=el('select',{className:'shm-select',ariaLabel:'Pose body part'},...['Head','Torso','Left arm','Right arm','Left hand','Right hand'].map(name=>el('option',{textContent:name})));
 const mirror=el('input',{type:'checkbox',ariaLabel:'Mirror arm edits'}),mirrorLabel=el('label',{},mirror,' Mirror arm edits');
 const sliders=el('div',{className:'shm-pose-sliders'}),rows=[];let editing=false,disposed=false;
 for(const [id,label,part,,,min,max] of POSE_CONTROLS){
  const output=el('output',{textContent:'0°'}),input=el('input',{type:'range',min,max,step:1,value:0,ariaLabel:label});
  const row=el('label',{},el('span',{},label,output),input);rows.push({row,input,output,id,part});sliders.append(row);
  input.oninput=()=>{onAdjust(id,Number(input.value),!editing);if(mirror.checked&&/^[LR]/.test(id))onAdjust((id[0]==='L'?'R':'L')+id.slice(1),Number(input.value),false);editing=true;sync();};
  input.onchange=()=>{editing=false;};input.onblur=()=>{editing=false;};
 }
 const handControls=el('div',{className:'shm-pose-sliders'}),enabled=el('input',{type:'checkbox',ariaLabel:'Articulated bare hands'}),enabledRow=el('label',{},enabled,' Articulated bare hands');
 const gesture=el('select',{className:'shm-select',ariaLabel:'Hand gesture'},...Object.keys(HAND_PRESETS).map(value=>el('option',{value,textContent:({relaxed:'Relaxed',open:'Open hand',fist:'Closed fist',point:'Point',peace:'Peace sign',thumbsUp:'Thumb extended'})[value]})));
 const handSide=()=>group.value==='Left hand'?'L':'R';
 function changeHands(fn,record=true){const state=getState(),hands=normalizeHands(state.pose?.hands||state.hands);fn(hands,handSide());onHands?.(hands,record);sync();}
 enabled.onchange=()=>changeHands(h=>{h.enabled=enabled.checked;});
 gesture.onchange=()=>changeHands((h,s)=>{h.enabled=true;h[s]={preset:gesture.value,...structuredClone(HAND_PRESETS[gesture.value])};});
 const handRows=[];
 for(const [i,name] of [...DIGITS,'spread'].entries()){
  const label=name==='spread'?'Finger spread':({pinky:'Little finger',index:'Index finger',middle:'Middle finger',ring:'Ring finger',thumb:'Thumb'})[name]+' curl';
  const input=el('input',{type:'range',min:0,max:100,step:1,value:0,ariaLabel:label}),output=el('output'),row=el('label',{},el('span',{},label,output),input);handRows.push({input,output,i});
  input.oninput=()=>{const record=!editing;changeHands((h,s)=>{h.enabled=true;if(i===5)h[s].spread=Number(input.value)/100;else h[s].curl[i]=Number(input.value)/100;},record);editing=true;};input.onchange=input.onblur=()=>{editing=false;};handControls.append(row);
 }
 handControls.prepend(enabledRow,gesture);
 const actions=el('div' ,{className:'shm-pose-actions'});
 const button=(label,fn)=>{const b=el('button',{type:'button',className:'shm-pill',textContent:label});b.onclick=()=>{editing=false;const pending=fn();if(pending?.then){b.disabled=true;Promise.resolve(pending).finally(()=>sync());}else sync();};actions.append(b);return b;};
 button('Hold current pose',onHold);button('Return to animation',onResume);
 button('Reset adjustments',onReset);
 const undo=button('Undo pose',onUndo),redo=button('Redo pose',onRedo);
 button('Save pose',()=>{const pose=onSave(),url=URL.createObjectURL(new Blob([JSON.stringify(pose,null,2)],{type:'application/json'})),a=el('a',{href:url,download:'johansson.pose.json'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Pose downloaded. Open pose restores it on another character.';});
 if(onExport){const exportButton=button('Export posed GLB',async()=>{exportButton.disabled=true;try{const data=await onExport(),url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'})),a=el('a',{href:url,download:'johansson-posed.glb'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Posed GLB downloaded. Enabled finger joints remain editable.';}catch(e){status.textContent=e.message||'Export failed.';}finally{exportButton.disabled=false;}});}
 const file=el('input',{type:'file',accept:'.json',hidden:true,ariaLabel:'Open pose file'});
 button('Open pose',()=>file.click());
 file.onchange=async()=>{const selected=file.files[0];file.value='';if(!selected)return;try{if(selected.size>32000)throw Error('Choose a pose file smaller than 32 KB.');const pose=normalizePose(JSON.parse(await selected.text()));if(disposed)return;onOpen(pose);sync();status.textContent='Pose opened.';}catch(e){if(!disposed)status.textContent=e.message||'Unable to open this pose.';}};
 function sync(){const state=getState();mirrorLabel.hidden=!group.value.endsWith('arm');handControls.hidden=!group.value.endsWith('hand');const h=normalizeHands(state.pose?.hands||state.hands),hand=h[handSide()];enabled.checked=h.enabled;gesture.value=hand.preset;for(const r of handRows){r.input.value=Math.round((r.i===5?hand.spread:hand.curl[r.i])*100);r.output.value=r.input.value+'%';}for(const r of rows){r.row.hidden=r.part!==group.value;r.input.value=state.pose?.adjustments[r.id]||0;r.output.value=r.input.value+'°';}for(const input of root.querySelectorAll('input,select,button'))input.disabled=state.enabled===false;undo.disabled=state.enabled===false||!state.canUndo;redo.disabled=state.enabled===false||!state.canRedo;root.dataset.mode=state.pose?'manual':'normal';summary.textContent=state.pose?'Pose · held':'Pose';summary.setAttribute('aria-label','Pose adjustments');}
 group.onchange=sync;
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();root.open=false;summary.focus();}});
 const outside=e=>{if(!root.contains(e.target))root.open=false;};document.addEventListener('pointerdown',outside);
 body.append(hint,group,mirrorLabel,sliders,handControls,actions,file,status);root.append(summary,body);sync();
 return {root,sync,dispose(){disposed=true;document.removeEventListener('pointerdown',outside);root.remove();}};
}
