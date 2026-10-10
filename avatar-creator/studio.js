import {openCreator} from '../johansson-town/src/avatars/creator.js';
import {CAST_RECIPES,ORIGINAL_THUAN_RECIPE} from '../johansson-town/src/avatars/cast.js';
import {normalizeRecipe,decodeRecipe} from '../johansson-town/src/avatars/recipe.js';

// Independent of the town's player and all game save keys.
const SAVE_KEY='nj-avatar-studio-v1';
const templates=[['Johansson',CAST_RECIPES.Johansson],['Thuận',ORIGINAL_THUAN_RECIPE]];
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
const creator=openCreator({recipe:shared||restored||CAST_RECIPES.Johansson,templates,startAt:'look',keepOpenOnSave:true,saveLabel:'Save character',shareLink:code=>new URL('./?r='+code,location.href).href,onSave:save,onClose:()=>{location.href='/#projects';}});
document.getElementById('loading').remove();
creator.root.setAttribute('aria-label','Johansson Studio');
creator.root.querySelector('canvas').setAttribute('aria-label','Your character. Drag to turn.');
// Keep the original appearance controls while giving this independent studio its own title.
const heading=creator.root.querySelector('.shm-top h2');
const titleObserver=new MutationObserver(()=>{if(heading.textContent!=='Johansson Studio')heading.textContent='Johansson Studio';});titleObserver.observe(heading,{childList:true,subtree:true});heading.textContent='Johansson Studio';
const toolbar=document.createElement('div');toolbar.className='studio-tools';toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','Character files and templates');
const label=document.createElement('label');label.textContent='Template';
const select=document.createElement('select');select.setAttribute('aria-label','Starting template');
select.append(new Option('Choose…',''),...templates.map(([name],i)=>new Option(name,String(i))));
select.onchange=()=>{if(select.value==='')return;creator.setRecipe(templates[Number(select.value)][1]);status.textContent='Template loaded. Edit it, then save your character.';select.value='';};label.append(select);toolbar.append(label);
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
 catch{status.textContent='Unable to open this design. Choose an Avatar Creator JSON file.';}finally{input.value='';}
};
const openDesign=button('Open design',()=>input.click());
fileMenu.append(downloadDesign,openDesign);toolbar.append(status,files,input);
fileMenu.addEventListener('click',()=>{files.open=false;});
document.addEventListener('click',event=>{if(!files.contains(event.target))files.open=false;});
files.addEventListener('keydown',event=>{if(event.key==='Escape'){files.open=false;fileLabel.focus();}});
let noticeTimer;
const noticeObserver=new MutationObserver(()=>{clearTimeout(noticeTimer);if(status.textContent)noticeTimer=setTimeout(()=>{status.textContent='';},8000);});
noticeObserver.observe(status,{childList:true});creator.root.querySelector('.shm-top').after(toolbar);
window.addEventListener('pagehide',()=>{titleObserver.disconnect();noticeObserver.disconnect();clearTimeout(noticeTimer);},{once:true});
