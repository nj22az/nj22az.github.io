import * as THREE from '../johansson-town/vendor/three.module.js';
import {loadModel,exportModel,inspectModel,disposeModel,snapGrid,snapConnector,MAX_GLB_BYTES} from '../johansson-town/src/studio/model-workbench.js';
import {createHeroStage,renderHero} from '../johansson-town/src/studio/modeller/look.js';
import {bindSaveLink} from './studio-share.mjs';

/** A draft copy only: this workspace never writes the catalogue, placements or player save. */
export function createModelWorkshop({onClose}){
 const root=document.createElement('section');root.className='model-workshop';root.hidden=true;
 const inputs=(prefix,label,step)=>['x','y','z'].map(a=>`<label>${a.toUpperCase()}<input data-${prefix}${a} aria-label="${label} ${a.toUpperCase()}" type="number" value="0" step="${step}"></label>`).join('');
 root.innerHTML=`<div class="scene-heading"><div><h2>GLB workshop</h2><p>Prepare a static model in metres, check its surfaces and export an adjusted copy.</p></div><button data-close>Back to library</button></div>
 <div class="scene-layout"><section class="scene-picture"><img class="model-import-preview" alt="Imported model in Studio lighting" hidden><p data-status role="status" aria-live="polite"></p><div data-report></div></section>
 <aside class="scene-controls" aria-label="Imported model adjustments">
 <label>Model name<input data-name maxlength="80"></label><label>Scale multiplier<input data-scale type="number" value="1" min="0.000001" max="1000" step="0.01"></label>
 <p>Rotation in degrees</p><div class="model-vector">${inputs('r','Rotation',15)}</div><p>Position in metres</p><div class="model-vector">${inputs('p','Position',.05)}</div>
 <label class="scene-snap"><input data-ground type="checkbox" checked> Centre on floor before positioning</label>
 <label>Grid spacing (metres)<input data-grid type="number" value="0.05" min="0.001" max="10" step="0.01"></label>
 <div class="scene-save-row"><button data-grid-snap>Snap to grid</button><button data-undo disabled>Undo adjustment</button></div>
 <details><summary>Connector snap</summary><p>Source points use the original model frame; targets use the destination frame. Joining turns floor centring off.</p>
 ${[['source-point','Source point','[0,0,0]'],['source-normal','Source normal','[0,-1,0]'],['source-up','Source up','[0,0,1]'],['target-point','Target point','[0,0,0]'],['target-normal','Target normal','[0,1,0]'],['target-up','Target up','[0,0,1]']].map(([key,label,value])=>`<label>${label} [x,y,z]<input data-${key} value="${value}"></label>`).join('')}
 <label>Clearance (metres)<input data-clearance type="number" min="-1" max="1" step="0.001" value="0"></label><button data-join>Join connectors</button></details>
 <h2>Export</h2><div class="model-exports"><a class="scene-save scene-primary" data-save-glb>Export GLB</a><a class="scene-save" data-save-report>Save preparation report</a></div>
 <p>Keep the exported GLB. This copy lasts only while Studio is open. Export does not publish or replace a town object. Static models only; rigs and animation are not converted.</p></aside></div>`;
 const $=s=>root.querySelector(s),say=s=>{$('[data-status]').textContent=s;};
 let source,stem='model',stage,token=0,timer,queue=Promise.resolve(),last,disposed=false;const history=[],files={glb:null,report:null},refresh={};
 for(const k of ['glb','report'])refresh[k]=bindSaveLink($(`[data-save-${k}]`),{get ready(){return !!files[k];},get file(){return files[k]?.file;},get url(){return files[k]?.url;},now:()=>files[k]},
  {disabled:()=>!files[k],say,words:{busy:'The model is still being prepared.',download:'Prepared file downloaded.',shared:'Prepared file handed to the share sheet.'}});
 const settings=()=>({name:$('[data-name]').value,scale:Number($('[data-scale]').value),rotation:['x','y','z'].map(a=>Number($(`[data-r${a}]`).value)),position:['x','y','z'].map(a=>Number($(`[data-p${a}]`).value)),ground:$('[data-ground]').checked});
 function set(o){$('[data-name]').value=o.name;$('[data-scale]').value=o.scale;$('[data-ground]').checked=o.ground;for(let i=0;i<3;i++){const a=['x','y','z'][i];$(`[data-r${a}]`).value=o.rotation[i];$(`[data-p${a}]`).value=o.position[i];}}
 function remember(){if(last){history.push(structuredClone(last));if(history.length>30)history.shift();}$('[data-undo]').disabled=!history.length;}
 function clear(){for(const k of ['glb','report']){if(files[k])URL.revokeObjectURL(files[k].url);files[k]=null;refresh[k]();}}
 function ready(k,bytes,name,type){const file=new File([bytes],name,{type});files[k]={file,url:URL.createObjectURL(file)};refresh[k]();}
 function schedule(){
  clearTimeout(timer);const mine=++token,options=settings(),bytes=source;last=structuredClone(options);clear();say('Preparing model and checking surfaces…');
  timer=setTimeout(()=>{queue=queue.catch(()=>{}).then(async()=>{
   if(mine!==token||disposed)return;let model;
   try{
    model=await loadModel(bytes,options);const report=inspectModel(model),glb=await exportModel(model);if(mine!==token||disposed)return;
    ready('glb',glb,stem+'.prepared.glb','model/gltf-binary');ready('report',JSON.stringify({format:'johansson-model-preparation',version:1,transform:options,report},null,1),stem+'.preparation.json','application/json');
    const el=$('[data-report]');el.replaceChildren();
    for(const text of [`${report.metres.map(n=>n.toFixed(3)).join(' × ')} m · ${report.meshes} meshes · ${report.materials} materials`,'Surface scan: this model, with a 1 mm overlap tolerance. Full results are in the preparation report.',...report.surfaces.findings.slice(0,8).map(f=>`Possible overlap: ${f.a.mesh} (triangle ${f.a.triangle}) / ${f.b.mesh} (triangle ${f.b.triangle})${f.depthBias?' — depth bias present':''}.`)]){const p=document.createElement('p');p.textContent=text;el.append(p);}
    say(`${report.surfaces.findings.length} possible surface conflicts. ${report.surfaces.complete?'Model scan complete.':'Scan limit reached; report is partial.'} GLB ready.`);
    stage??=createHeroStage();const png=await renderHero(model,{size:700,stage});if(mine!==token||disposed)return;
    const img=$('img');if(img.dataset.url)URL.revokeObjectURL(img.dataset.url);img.src=img.dataset.url=URL.createObjectURL(new Blob([png],{type:'image/png'}));img.hidden=false;
   }catch(e){if(mine===token){say(e.message);clear();}}
   finally{disposeModel(model);}
  });},200);
 }
 for(const input of root.querySelectorAll('[data-name],[data-scale],[data-ground],.model-vector input'))input.onchange=()=>{remember();schedule();};
 $('[data-grid-snap]').onclick=()=>{try{const o=settings();o.position=snapGrid({position:o.position,step:Number($('[data-grid]').value)});remember();set(o);schedule();}catch(e){say(e.message);}};
 $('[data-join]').onclick=()=>{try{
  const read=n=>JSON.parse($(`[data-${n}]`).value),o=settings(),snap=snapConnector({source:{point:read('source-point'),normal:read('source-normal'),up:read('source-up')},target:{point:read('target-point'),normal:read('target-normal'),up:read('target-up')},scale:o.scale,clearance:Number($('[data-clearance]').value)});
  const e=new THREE.Euler().setFromQuaternion(new THREE.Quaternion(...snap.quaternion));remember();set({...o,position:snap.position,rotation:[e.x,e.y,e.z].map(n=>+THREE.MathUtils.radToDeg(n).toFixed(4)),ground:false});schedule();
 }catch(e){say(e.message);}};
 $('[data-undo]').onclick=()=>{const o=history.pop();if(o){set(o);$('[data-undo]').disabled=!history.length;schedule();}};
 $('[data-close]').onclick=()=>{root.hidden=true;onClose();};
 return {root,open(bytes,name='model.glb'){
  if(bytes.length>MAX_GLB_BYTES)throw Error('Choose a GLB smaller than 24 MiB.');
  source=bytes;stem=name.replace(/\.glb$/i,'').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,60)||'model';history.length=0;last=null;$('[data-undo]').disabled=true;
  const img=$('img');img.hidden=true;$('[data-report]').replaceChildren();
  set({name:name.replace(/\.glb$/i,''),scale:1,rotation:[0,0,0],position:[0,0,0],ground:true});root.hidden=false;schedule();
 },dispose(){disposed=true;++token;clearTimeout(timer);clear();if($('img').dataset.url)URL.revokeObjectURL($('img').dataset.url);queue.finally(()=>stage?.dispose());root.remove();}};
}
