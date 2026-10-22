import {MATERIAL_LIGHTING} from '../johansson-town/src/render/studio-lighting.js';

export function createMaterialPanel({creator,lightingSelect,status}){
 const box=document.createElement('fieldset');box.className='studio-material-study';
 const legend=document.createElement('legend');legend.textContent='Surfaces · prototype';box.append(legend);
 const note=document.createElement('p');note.textContent='Ordinary clothing preview and PNG. Designs keep their original finishes.';box.append(note);
 function select(label,choices,change){const row=document.createElement('label');row.append(label);const input=document.createElement('select');input.setAttribute('aria-label',label);input.append(...choices.map(([id,text])=>new Option(text,id)));input.onchange=()=>change(input.value);row.append(input);box.append(row);return input;}
 select('Surfaces',[['legacy','Before · original'],['enhanced','After · soft finish']],mode=>{const state=creator.setMaterialStudy({mode});status.textContent=mode==='legacy'?'Original surfaces restored.':state?.active?'Surface prototype applied. Use the same view and lighting to compare.':'Choose ordinary clothing to compare surfaces.';});
 select('Clothing finish',[['cotton','Cotton · matte'],['satin','Satin · soft sheen']],cloth=>creator.setMaterialStudy({cloth}));
 const light=select('Comparison lighting',Object.entries(MATERIAL_LIGHTING).map(([id,r])=>[id,r.label]),lighting=>{creator.setPreview({lighting});lightingSelect.value=lighting;});
 // Opening the panel does not change the legacy warm lighting. A deliberate light selection is required.
 light.prepend(new Option('Current preview',''));light.value='';
 lightingSelect.addEventListener('change',()=>{light.value=Object.hasOwn(MATERIAL_LIGHTING,lightingSelect.value)?lightingSelect.value:'';});
 const capture=document.createElement('button');capture.type='button';capture.textContent='Download comparison settings';capture.onclick=()=>{
  const controls={};for(const label of ['View','Framing','Preview expression','Preview pose'])controls[label]=creator.root.querySelector(`[aria-label="${label}"]`)?.value;
  const data={format:'johansson-material-study',version:1,recipe:creator.recipe,surfaces:creator.materialStudy,preview:controls,performance:creator.performance,export:{size:1024,framing:'full body',background:'transparent'},scope:'Ordinary-clothing preview and PNG only. 3D models, scenes and World use original finishes.'};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='johansson-material-study.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
 };box.append(capture);return box;
}
