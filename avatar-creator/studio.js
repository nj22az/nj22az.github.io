import {createMaterialPanel} from './material-panel.js';
import {createActingPanel} from './acting/panel.js?v=20261016-1';
import {createPerformancePanel} from './performance-panel.js?v=20261017-1';
import {openCreator} from '../johansson-town/src/avatars/creator.js?v=20261023-materials';
import {ORIGINAL_THUAN_RECIPE,recipeFor,RESIDENT_NAMES} from '../johansson-town/src/avatars/cast.js';
import {STUDIO_CHARACTERS} from '../johansson-town/src/studio/characters-data.js';
import {normalizeRecipe,decodeRecipe} from '../johansson-town/src/avatars/recipe.js';
import {createSceneWorkspace} from './scene.js?v=20261020-vi';
import {createWorldPanel} from './world-panel.js?v=20261011-1';
import {createHomeWorkspace} from './home.js?v=20261011-1';
import {createModelWorkspace} from './model.js?v=20261020-workshop';
import {createWorldLibrary} from './world-library.js?v=20261020-2';
import {createRoomWorkspace} from './room-editor.js?v=20261020-integrated';
import {loadHatModels} from '../johansson-town/src/catalog/hat-models.js';

// The hats that are models in World's asset catalogue (Johansson's trucker cap, sold at Sakura Shōten) are in hand before anyone
// is drawn, so the maker's pictures, its preview, scenes and portraits show them and not their stand-in.
await loadHatModels();

// Studio's own working copy of the character. What goes into Johansson World is sent with "Use in Johansson World",
// which writes World's own keys (../johansson-town/src/studio-handoff.js): all customisation is Studio's.
const SAVE_KEY='nj-avatar-studio-v1';
// The maker's two starting points (its Start step): Johansson as World draws him, and the original Thuận design.
const templates=[['Johansson',recipeFor('Johansson')],['Thuận · original',ORIGINAL_THUAN_RECIPE]];
// The Template picker: the original Thuận design, every resident of World as World draws them (Johansson and World's
// Thuan among them, with any look published from Studio), then the characters made in Studio (World does not place them).
const designs=templates.slice(1),residents=RESIDENT_NAMES.map(n=>[n,recipeFor(n)]),studioOnly=Object.values(STUDIO_CHARACTERS).map(c=>[c.name,normalizeRecipe(c.recipe)]),choices=[...designs,...residents,...studioOnly];
const initialNote='';
const status=document.createElement('span');status.className='studio-status';status.setAttribute('role','status');status.textContent=initialNote;
let restored=null;
try{const stored=JSON.parse(localStorage.getItem(SAVE_KEY));if(stored?.format==='nj-avatar-studio'&&stored.recipe)restored=normalizeRecipe(stored.recipe);}catch{}
const code=new URLSearchParams(location.search).get('r');
const shared=code?decodeRecipe(code):null;
function save(recipe){
 try{localStorage.setItem(SAVE_KEY,JSON.stringify({format:'nj-avatar-studio',version:1,recipe}));status.textContent='Character saved in this browser. Download a design for a portable copy.';}
 catch{status.textContent='Browser storage is unavailable. Use Download design to save your character.';}
}

let currentRecipe=shared||restored||recipeFor('Johansson'),editor=null,workspace=null,home=null,model=null,rooms=null,worldLibrary=null,switching=false,editingId=null;
const modes=document.createElement('nav');modes.className='studio-modes';modes.setAttribute('aria-label','Johansson Studio modes');
for(const [id,label] of [['character','Edit character'],['home','Decorate home'],['scene','Build scene'],['comic','Make comic'],['model','Make model'],['rooms','Edit room'],['library','World library']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.mode=id;b.onclick=()=>switchMode(id);modes.append(b);}
document.body.prepend(modes);
function switchMode(mode,{focus=true}={}){
 if(mode!=='rooms')rooms?.hide();
 if(mode!=='library')worldLibrary?.hide();
 if(editor&&mode==='character'){editor.creator.goTo('look');return;}
 if(editor){currentRecipe=editor.creator.recipe;switching=true;editor.cleanup();editor.creator.close();editor=null;switching=false;}
 if(mode==='character'){workspace?.hide();home?.hide();model?.hide();editor=createCharacterEditor();}
 else if(mode==='home'){workspace?.hide();model?.hide();home??=createHomeWorkspace();home.show();}
 // Make model: every asset in a library, checked and saved for World, a printer or a picture; the Lathe maker (model.js)
 else if(mode==='model'){workspace?.hide();home?.hide();model??=createModelWorkspace();model.show();}
 else if(mode==='library'){workspace?.hide();home?.hide();model?.hide();rooms?.hide();worldLibrary??=createWorldLibrary({onOpen:async e=>{if(e.access==='model'){if(e.id.startsWith('home:')){switchMode('rooms');await rooms.show();await rooms.addWorldAsset(e);}else{switchMode('model');await model.open(e.id);}}else{switchMode('scene');if(e.access==='character')workspace.useCharacter(recipeFor(e.name),null);else workspace.setLocation(e.id.slice(9));}},onRoomModel:async e=>{switchMode('rooms');await rooms.show();await rooms.addWorldAsset(e);}});worldLibrary.show();}
 else if(mode==='rooms'){workspace?.hide();home?.hide();model?.hide();rooms??=createRoomWorkspace({onScene:async id=>{switchMode('scene');workspace.setLocation(id);}});rooms.show();}
 else{home?.hide();model?.hide();workspace??=createSceneWorkspace({getCharacter:()=>currentRecipe,onMode:switchMode,onEdit:(recipe,id)=>{currentRecipe=recipe;editingId=id;switchMode('character');}});if(editingId){workspace.useCharacter(currentRecipe,editingId);editingId=null;}workspace.show(mode);}
 for(const b of modes.children)b.setAttribute('aria-pressed',String(b.dataset.mode===mode));
 if(focus)modes.querySelector(`[data-mode="${mode}"]`)?.focus({preventScroll:true});
}
function createCharacterEditor(){
const creator=openCreator({materialStudy:true,recipe:currentRecipe,templates,startAt:'look',keepOpenOnSave:true,saveLabel:'Save character',shareLink:code=>new URL('./?r='+code,location.href).href,onSave:save,onClose:recipe=>{currentRecipe=recipe;if(!switching)location.href='/#projects';}});
document.getElementById('loading')?.remove();
creator.root.setAttribute('aria-label','Johansson Studio');
creator.root.querySelector('canvas').setAttribute('aria-label','Your character. Drag to turn.');
// Keep the original appearance controls while giving this independent studio its own title.
const heading=creator.root.querySelector('.shm-top h2');
const lockup=()=>{heading.innerHTML='<span class="sr-only">Johansson Studio</span><span class="studio-mark" aria-hidden="true"><b>JOHANSSON</b><i>STUDIO</i></span>';};
const titleObserver=new MutationObserver(()=>{if(!heading.querySelector('.studio-mark')){titleObserver.disconnect();lockup();titleObserver.observe(heading,{childList:true,subtree:true});}});lockup();titleObserver.observe(heading,{childList:true,subtree:true});
const toolbar=document.createElement('div');toolbar.className='studio-tools';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Character files and templates');
const label=document.createElement('label');label.textContent='Template';
const select=document.createElement('select');select.setAttribute('aria-label','Starting template');
const group=(label,list,from)=>{const g=document.createElement('optgroup');g.label=label;g.append(...list.map(([name],i)=>new Option(name,String(from+i))));return g;};
select.append(new Option('Choose…',''),...designs.map(([name],i)=>new Option(name,String(i))),group('Residents of Johansson World',residents,designs.length),...studioOnly.length?[group('Studio characters',studioOnly,designs.length+residents.length)]:[]);
select.onchange=()=>{if(select.value==='')return;creator.setRecipe(choices[Number(select.value)][1]);status.textContent='Template loaded. Edit it, then save your character.';select.value='';};label.append(select);toolbar.append(label);
const files=document.createElement('details');files.className='studio-files';
const fileLabel=document.createElement('summary');fileLabel.textContent='Files';files.append(fileLabel);
const fileMenu=document.createElement('div');fileMenu.className='studio-file-menu';files.append(fileMenu);
const filename=()=> (creator.recipe.name||'character').normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,60)||'character';
function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();}
function button(label,action,primary=false){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;if(primary)b.dataset.primary='';toolbar.append(b);return b;}
const saveButton=button('Save',()=>creator.save());saveButton.setAttribute('aria-label','Save character');
button('Export PNG',()=>{
 try{download(creator.exportPNG(1024),filename()+'.png');status.textContent='PNG exported: 1024 × 1024, transparent background.';}
 catch{status.textContent='PNG export failed. Please try again.';}
},true);
const downloadDesign=button('Download design',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'nj-avatar-studio',version:1,recipe:creator.recipe},null,2)],{type:'application/json'}));download(url,filename()+'.avatar.json');setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Editable design downloaded. Use Open design to restore it.';});
const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;
input.onchange=async()=>{
 try{const file=input.files[0];if(!file)return;if(file.size>1000000)throw new Error('size');const design=JSON.parse(await file.text());if(design.format!=='nj-avatar-studio'||design.version!==1||!design.recipe||typeof design.recipe!=='object'||Array.isArray(design.recipe))throw new Error('format');creator.setRecipe(normalizeRecipe(design.recipe));status.textContent='Design opened. Save character to keep it in this browser.';}
 catch{status.textContent='Unable to open this design. Choose a Johansson Studio design file (.avatar.json).';}finally{input.value='';}
};
const openDesign=button('Open design',()=>input.click());
const shareCharacter=creator.root.querySelector('.shm-top button');if(shareCharacter){shareCharacter.textContent='Share character link';fileMenu.append(shareCharacter);}
label.className='studio-template';fileMenu.append(label,downloadDesign,openDesign);const world=createWorldPanel({creator,status});toolbar.append(status,world,files,input);
fileMenu.addEventListener('click',event=>{if(event.target.closest('button'))files.open=false;});
select.addEventListener('change',()=>{files.open=false;});
const closeFiles=event=>{if(!files.contains(event.target))files.open=false;if(!world.contains(event.target))world.open=false;};document.addEventListener('click',closeFiles);
files.addEventListener('keydown',event=>{if(event.key==='Escape'){files.open=false;fileLabel.focus();}});
let noticeTimer;
const noticeObserver=new MutationObserver(()=>{clearTimeout(noticeTimer);if(status.textContent)noticeTimer=setTimeout(()=>{status.textContent='';},8000);});
noticeObserver.observe(status,{childList:true});creator.root.querySelector('.shm-top').after(toolbar);
function cleanup(){profileObserver.disconnect();acting.dispose();performancePanel.dispose();titleObserver.disconnect();noticeObserver.disconnect();clearTimeout(noticeTimer);document.removeEventListener('click',closeFiles);}

// Inspect the same character in several views without changing its design.
const preview=document.createElement('details');preview.className='studio-preview';
const previewTitle=document.createElement('summary');previewTitle.textContent='Preview & surfaces';preview.append(previewTitle);
const previewMenu=document.createElement('div');previewMenu.className='studio-preview-menu';preview.append(previewMenu);
function previewSelect(label,options,action){
 const row=document.createElement('label');row.append(label);
 const select=document.createElement('select');select.setAttribute('aria-label',label);select.append(...options.map(([value,text])=>new Option(text,value)));select.onchange=()=>action(select.value);row.append(select);previewMenu.append(row);return select;
}
previewSelect('View',[['front','Front'],['quarter','Three-quarter'],['left','Left profile'],['right','Right profile'],['back','Back']],angle=>creator.setPreview({angle}));
previewSelect('Framing',[['auto','Automatic'],['face','Face detail'],['full','Full body']],framing=>creator.setPreview({framing}));
const lightingSelect=previewSelect('Lighting',[['warm','Warm'],['neutral','Neutral studio'],['contour','Side light'],['daylight','Daylight'],['interior','Warm interior']],lighting=>creator.setPreview({lighting}));
const materialPanel=createMaterialPanel({creator,lightingSelect,status});previewMenu.append(materialPanel);
// Reuse the creator's expression catalogue and pose controls on phones as well.
const expression=creator.root.querySelector('[aria-label="Preview expression"]');
const expressionRow=document.createElement('label');expressionRow.append('Expression',expression);previewMenu.append(expressionRow);
const pose=creator.root.querySelector('[aria-label="Preview pose"]');
const poseRow=document.createElement('label');poseRow.append('Pose',pose);previewMenu.append(poseRow);
const previewOutfit=creator.root.querySelector('[aria-label="Preview outfit"]');const outfitRow=document.createElement('label');outfitRow.append('Preview outfit',previewOutfit);previewMenu.append(outfitRow);
const performancePanel=createPerformancePanel({creator,expression,pose,status});
expressionRow.remove();poseRow.remove();
const acting=createActingPanel({onStart:()=>creator.setPerformance({frozen:false}),onFrame:frame=>creator.setActingFrame(frame),getControls:()=>({expression:expression.value==='auto'?'neutral':expression.value,pose:pose.value,strength:creator.performance.strength}),onStop:()=>creator.setPerformance({frozen:true})});
performancePanel.root.append(acting.root);
previewMenu.prepend(materialPanel,performancePanel.root);
creator.root.querySelector('.shm-side').append(preview);
const featureReset=document.createElement('button');featureReset.type='button';featureReset.className='studio-reset-feature';featureReset.textContent='Reset feature';featureReset.title='Restore this feature to the loaded template or design. Undo remains available.';
featureReset.onclick=()=>{creator.resetFeature();status.textContent='Selected feature restored. Undo reverses this change.';};
creator.root.querySelector('.shm-panel').append(featureReset);
preview.addEventListener('keydown',event=>{if(event.key==='Escape'&&preview.open){event.preventDefault();event.stopPropagation();preview.open=false;previewTitle.focus();}});
creator.root.addEventListener('pointerdown',event=>{if(!preview.contains(event.target))preview.open=false;});


// Model export is an advanced file action; composition stays prominent.
const modelExport=creator.root.querySelector('.shm-poses button');
if(modelExport){modelExport.textContent='Download 3D model (.glb)';fileMenu.append(modelExport);}
const addToScene=button(editingId?'Apply to scene':'Use in scene',()=>{const recipe=creator.recipe;const id=editingId;switchMode('scene');workspace.useCharacter(recipe,id);editingId=null;},true);
// Studio hides the maker's four-step footer; personality needs an explicit, visible route here.
const profileButton=button('Personality & voice',()=>creator.goTo(creator.root.dataset.step==='profile'?'look':'profile'));
const syncProfile=()=>{const active=creator.root.dataset.step==='profile';profileButton.textContent=active?'Appearance':'Personality & voice';profileButton.setAttribute('aria-pressed',String(active));featureReset.hidden=active;if(active)creator.root.querySelector('.shm-part-title').textContent='Personality & voice';};
const profileObserver=new MutationObserver(syncProfile);profileObserver.observe(creator.root,{attributes:true,attributeFilter:['data-step']});syncProfile();

creator.root.setAttribute('role','region');creator.root.removeAttribute('aria-modal');
creator.root.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||creator.root.querySelector('.shm-share'))return;
 const controls=[...creator.root.querySelectorAll('button:not(:disabled),input,select,textarea,summary,[tabindex="0"]')].filter(e=>e.getClientRects().length);
 if((event.shiftKey&&document.activeElement===controls[0])||(!event.shiftKey&&document.activeElement===controls.at(-1))){event.preventDefault();event.stopImmediatePropagation();modes.querySelector('[data-mode="character"]').focus();}
},true);

return {creator,cleanup};
}

switchMode('character',{focus:false});
// For agents only (the johansson-studio MCP server's page): ?agent adds window.__JOHANSSON_STUDIO__ (studio-api.js).
if(new URLSearchParams(location.search).has('agent'))import('./studio-api.js?v=20261014-1').catch(e=>console.warn('Johansson Studio: agent API',e));
// The maker focuses its close button on open; on first load nothing should wear a focus ring until the user acts.
requestAnimationFrame(()=>requestAnimationFrame(()=>{const a=document.activeElement;if(a&&a!==document.body&&a.closest('.shm'))a.blur();}));
window.addEventListener('pagehide',()=>{editor?.cleanup();workspace?.dispose();home?.dispose();model?.dispose();rooms?.dispose();worldLibrary?.dispose();},{once:true});
// For tests: the Make model workspace once opened.
if(new URLSearchParams(location.search).has('agent'))Object.defineProperty(window,'__studioCharacter',{get:()=>editor?.creator,configurable:true});
Object.defineProperty(window,'__studioModel',{get:()=>model,configurable:true});

