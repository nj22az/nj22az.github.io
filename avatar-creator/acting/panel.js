import {createActingSession} from './session.mjs';
import {normalizeTake,readTakes,writeTakes} from './takes.mjs';
/** The same desk is used by the character preview and the selected scene actor. */
export function createActingPanel({onFrame,getControls=()=>({}),onAssign=null,onStop=()=>{},onStart=()=>{}}){
 const root=document.createElement('details');root.className='studio-acting';
 root.innerHTML=`<summary>Actor’s desk</summary><div class="studio-acting-body"><p>Perform with your face or voice, record a take, then reuse it with any character.</p>
 <video muted playsinline class="studio-actor-camera" aria-label="Camera preview" hidden></video>
 <div class="studio-acting-actions"><button type="button" data-act="camera">Start camera</button><button type="button" data-act="calibrate">Calibrate</button><button type="button" data-act="mic">Start microphone</button><button type="button" data-act="stop-devices">Stop devices</button></div>
 <label><input type="checkbox" data-option="mirror" checked> Mirror movement</label><label>Sensitivity<input type="range" data-option="sensitivity" min=".25" max="3" step=".25" value="1.5"></label><label>Smoothing<input type="range" data-option="smoothing" min="0" max="1" step=".05" value=".45"></label>
 <label>Voice or dialogue file<input type="file" data-audio accept="audio/*"></label><label>Take name<input type="text" data-name maxlength="60" placeholder="A surprised greeting"></label>
 <div class="studio-acting-actions"><button type="button" data-act="record">Record take</button><button type="button" data-act="save">Save take</button></div>
 <label>Saved takes<select data-takes><option value="">Choose a take…</option></select></label><label><input type="checkbox" data-loop> Loop take</label>
 <div class="studio-acting-actions"><button type="button" data-act="play">Play take</button><button type="button" data-act="stop">Stop & hold</button><button type="button" data-act="assign">Use for actor</button><button type="button" data-act="download">Download take</button><button type="button" data-act="import">Open take</button><button type="button" data-act="delete">Delete saved take</button></div>
 <input type="file" data-import accept=".json,application/json" hidden><p class="studio-acting-status" role="status" aria-live="polite"></p>
 <p class="studio-acting-note">Video stays on this device. Takes store movement and mouth timing; they do not contain camera images or sound. Keep dialogue audio separately.</p></div>`;
 const $=s=>root.querySelector(s),video=$('video'),picker=$('[data-takes]'),say=s=>{$('.studio-acting-status').textContent=s;};
 let takes=readTakes(),take=null,index=-1,devices={};
 function refresh(){picker.replaceChildren(new Option('Choose a take…',''),...takes.map((t,i)=>new Option(t.name+' · '+t.duration.toFixed(1)+' s',String(i))));picker.value=index<0?'':String(index);}
 function update(s=devices){$('[data-act="camera"]').textContent=s.camera?'Stop camera':'Start camera';video.hidden=!s.camera;$('[data-act="mic"]').textContent=s.microphone?'Stop microphone':'Start microphone';$('[data-act="record"]').textContent=s.recording?'Stop recording':'Record take';for(const n of ['save','play','download','assign'])$('[data-act="'+n+'"]').disabled=!take;$('[data-act="assign"]').hidden=!onAssign;$('[data-act="delete"]').disabled=index<0;}
 function accept(value){take=normalizeTake(value);index=-1;picker.value='';$('[data-name]').value=take.name;update();}
 const session=createActingSession({video,onFrame,getControls,onStatus:say,onTake:accept,onState:s=>{devices=s;update();}});
 picker.onchange=()=>{index=picker.value===''?-1:Number(picker.value);take=takes[index]||null;if(take)$('[data-name]').value=take.name;update();};
 const actions={camera:()=>devices.camera?session.stopCamera():session.startCamera(),calibrate:()=>session.calibrate(),mic:()=>devices.microphone?session.stopAudio():session.startMicrophone(),
  'stop-devices':()=>{session.stopCamera();session.stopAudio();onFrame(null);onStop();},record:()=>session.recording?session.stopRecording():session.startRecording($('[data-name]').value),
  save:()=>{if(!take)return;const value={...take,name:$('[data-name]').value.trim()||take.name},next=takes.slice();if(index>=0)next[index]=value;else{if(next.length>=12){say('Twelve takes are already saved. Download or delete one first.');return;}next.push(value);}if(!writeTakes(next)){say('Browser storage is full or unavailable. Download this take to keep it.');return;}takes=next;index=index<0?takes.length-1:index;take=value;refresh();update();say('Take saved in this browser. Download it for a portable copy.');},
  play:()=>{if(take)session.play(take,$('[data-loop]').checked);},stop:()=>{session.hold();onStop();say('Stopped. The actor holds the last frame.');},assign:()=>{if(take)onAssign?.(take,$('[data-loop]').checked);},
  download:()=>{if(!take)return;const url=URL.createObjectURL(new Blob([JSON.stringify({...take,name:$('[data-name]').value.trim()||take.name})],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=(take.name.replace(/[^a-z0-9_-]/gi,'-')||'actor')+'.actor.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},
  import:()=>$('[data-import]').click(),delete:()=>{if(index<0)return;const next=takes.filter((_,i)=>i!==index);if(!writeTakes(next)){say('Unable to remove the take from browser storage.');return;}takes=next;index=-1;take=null;refresh();update();say('Saved take removed.');}};
 for(const b of root.querySelectorAll('[data-act]'))b.onclick=()=>Promise.resolve().then(()=>{if(['camera','mic','record','play'].includes(b.dataset.act))onStart();return actions[b.dataset.act]();}).catch(()=>say('The action could not complete. Saved takes are unchanged.'));
 for(const el of root.querySelectorAll('[data-option]'))el.oninput=()=>session.configure({[el.dataset.option]:el.type==='checkbox'?el.checked:Number(el.value)});
 $('[data-audio]').onchange=e=>{const file=e.target.files[0];if(file){onStart();session.playAudio(file);}e.target.value='';};
 $('[data-import]').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>2e6)throw Error('size');accept(JSON.parse(await f.text()));say('Take opened. Play it or save it in this browser.');}catch{say('Choose a valid actor take JSON file smaller than 2 MB.');}finally{e.target.value='';}};
 refresh();update();return {root,session,get take(){return take;},dispose(){session.dispose();root.remove();}};
}
