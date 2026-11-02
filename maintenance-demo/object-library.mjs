import {OBJECT_MODELS} from './object-catalogue.mjs?v=2026.11.02.8';
export {OBJECT_MODELS};
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DEMO_MODELS={'demo-pump':'pump','demo-compressor':'compressor','demo-generator':'generator','demo-sensor':'probe'};
export const modelById=id=>OBJECT_MODELS.find(m=>m.id===id);
export function modelFor(a){return modelById(a?.visualModelId===undefined&&a?.demo?DEMO_MODELS[a.id]:a?.visualModelId);}
export function objectVisual(a,large=false){const m=modelFor(a);return m?`<figure class="object-visual ${large?'object-visual-large':''}"><img src="${m.image}" alt="Illustrative ${escape(m.label.toLowerCase())} model" width="896" height="672" loading="lazy" decoding="async"><figcaption>Illustrative model</figcaption></figure>`:'';}
export function modelPicker(a,select){const m=modelFor(a);return `<div class="field full object-picker" onchange="previewObjectModel(event.target.value)">${select('Visual model (optional)','visualModelId',[['','No illustration'],...OBJECT_MODELS.map(m=>[m.id,m.label]),...(a?.visualModelId&&!modelById(a.visualModelId)?[[a.visualModelId,'Previously selected model · currently unavailable']]:[])],a?.visualModelId??m?.id??'')}<div id="object-model-preview">${objectVisual(a)}</div><p>A visual aid for identifying an object. Enter its actual specifications and assessment separately.</p></div>`;}
export function validVisuals(d){return d.assets.every(a=>a&&(a.visualModelId===undefined||typeof a.visualModelId==='string'&&(a.visualModelId===''||/^[a-z][a-z0-9-]{0,63}$/.test(a.visualModelId))));}
export function initObjectLibrary(api){
 const {heading,card,e,btn}=api;
 api.titles.objects='Object library';api.NAV_NAMES.objects='Objects';api.nav.splice(2,0,['objects','▧','Object library']);
 api.pages.objects=()=>heading('EQUIPMENT MODELS','Object library','Choose a Blender-built illustration, then register your physical item with its own identity and documented data.',btn('Add a different object','assetForm()','primary'))+
  `<div class="object-library-grid">${OBJECT_MODELS.map(m=>`<article class="card object-library-card">${objectVisual({visualModelId:m.id},true)}<div class="card-body"><h2>${e(m.label)}</h2><p>Reusable equipment illustration</p><button type="button" class="primary" onclick="assetForm('','${m.id}')">Add to inventory</button><details><summary>3D model and source</summary><p><a href="${m.model}" download>Download 3D model (.glb)</a></p><p><a href="./blender/equipment-library.blend" download>Download editable Blender library</a></p></details></div></article>`).join('')}</div>`+
  card('Add another model','Extend the library in Blender.',`<div class="card-body"><p>Each model is a named Blender collection. Add a collection and a catalogue entry, then export the updated library. It will appear here and in the asset form.</p><p><a href="./blender/README.md">Model authoring instructions</a></p><p>Visual selection does not assign a product category, use class, inspection interval or safe-use decision.</p></div>`);
}
