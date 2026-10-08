import {readPlayers,switchPlayer,addPlayer,slotKey,SAVE_KEY,LEGACY_KEYS} from './src/save.js';
import {heartsFor} from './src/people/friendship.js';
import {decoratorEnabled} from './src/features.js';

/**
 * The title screen's choices: EXPLORE or BUILD with the active save, LOAD another save, start a NEW GAME, or import a
 * save file. The game reads the chosen mode from window.__JOHANSSON_MODE__ when it starts.
 */
const storage=globalThis.localStorage;
const $=id=>document.getElementById(id);

function savedState(id){
 for(const key of slotKey(id)===SAVE_KEY?[SAVE_KEY,...LEGACY_KEYS]:[slotKey(id)]){
  try{const value=JSON.parse(storage.getItem(key));if(value&&typeof value==='object')return value;}catch{}
 }
 return null;
}
const when=ms=>ms?new Date(ms).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
/** "¥3,400 · 4 friends · last played 6 Oct, 21:14", or null for a slot nobody has played yet. */
export function describeSave(state,lastPlayed){
 if(!state)return null;
 const friends=Object.values(state.friendship||{}).filter(f=>heartsFor(f?.points)>=1).length;
 const parts=['¥'+Number(state.yen??0).toLocaleString('en-GB'),friends===1?'1 friend':friends+' friends'];
 if(state.loops>0)parts.push('year '+(state.loops+1)+' of 1997');
 const last=lastPlayed||state.savedAt;if(last)parts.push('last played '+when(last));
 return parts.join(' · ');
}

export function createTitleMenu({launch}){
 const enter=$('enter'),build=$('enterBuild'),dialog=$('titleSlots'),list=$('titleSlotList'),form=$('titleNewForm'),name=$('titleNewName');
 const summary=$('titleSave');
 let opener=null;

 function refresh(){
  const roster=readPlayers(storage),me=roster.players.find(p=>p.id===roster.active),text=describeSave(savedState(me.id),me.lastPlayed);
  summary.textContent=text?`${me.name} · ${text}`:`${me.name} · a new game: you arrive on the island today`;
 }
 function close(){dialog.classList.add('hidden');form.classList.add('hidden');(opener||enter).focus();}
 function open(newGame=false){
  opener=document.activeElement;
  const roster=readPlayers(storage);
  list.replaceChildren(...roster.players.sort((a,b)=>b.lastPlayed-a.lastPlayed).map(p=>{
   const li=document.createElement('li'),b=document.createElement('button');b.type='button';
   const text=describeSave(savedState(p.id),p.lastPlayed);
   b.innerHTML='<b></b><span></span>';b.querySelector('b').textContent=p.name+(p.id===roster.active?' · current':'');
   b.querySelector('span').textContent=text||'Not played yet';
   b.onclick=()=>{switchPlayer(storage,p.id);refresh();close();};
   li.append(b);return li;
  }));
  dialog.classList.remove('hidden');
  if(newGame){form.classList.remove('hidden');name.value='';name.focus();}
  else list.querySelector('button')?.focus();
 }

 // EXPLORE is the original START button; BUILD sets the mode first and starts the same way.
 enter.addEventListener('click',()=>{if(!window.__JOHANSSON_MODE__)window.__JOHANSSON_MODE__='explore';},{capture:true});
 // The decorator is off on the live site (src/features.js): no BUILD button there.
 if(!decoratorEnabled())build.remove();
 else build.addEventListener('click',()=>{window.__JOHANSSON_MODE__='build';launch();});
 $('titleLoad').addEventListener('click',()=>open(false));
 $('titleNew').addEventListener('click',()=>open(true));
 $('titleSlotsClose').addEventListener('click',close);
 form.addEventListener('submit',e=>{e.preventDefault();addPlayer(storage,name.value||'Visitor');refresh();close();});
 dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close();}});
 dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 const file=$('titleImportFile');
 $('titleImport').addEventListener('click',()=>file.click());
 file.addEventListener('change',async()=>{
  const f=file.files?.[0];if(!f)return;
  try{
   const data=JSON.parse(await f.text());
   if(!['johansson-town','johansson-world'].includes(data?.game)||!data.state||typeof data.state!=='object')throw Error('not a save');
   const id=addPlayer(storage,data.player||f.name.replace(/\.json$/,''));storage.setItem(slotKey(id),JSON.stringify(data.state));
   refresh();open(false);
  }catch{summary.textContent='That file is not a Johansson World save.';}
  file.value='';
 });
 refresh();
 return {refresh,open,close};
}
