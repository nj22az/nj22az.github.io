const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('johanssonDesktop',{offline:true,version:'0.2.0'});
const snapshot=()=>Object.fromEntries(Object.keys(localStorage).filter(k=>/^(johansson[-:]|avatar[-:]|studio[-:])/.test(k)).map(k=>[k,localStorage.getItem(k)]));
try{const backup=ipcRenderer.sendSync('read-backup');for(const [key,value] of Object.entries(backup||{}))if(localStorage.getItem(key)===null)localStorage.setItem(key,value);}catch{}
let panel,status,updateButton,updateAction='check',held=[],cursor=0,nextDirection=0,lastSnapshot='';
function note(text){if(status)status.textContent=text;}
async function persist(){
 window.dispatchEvent(new Event('johansson-desktop-save'));
 window.dispatchEvent(new Event('johansson-save'));
 await new Promise(resolve=>setTimeout(resolve,0));
 const data=snapshot(),result=await ipcRenderer.invoke('save-backup',data);lastSnapshot=JSON.stringify(data);return result;
}
function openMenu(on=true){
 if(!panel)return;
 panel.hidden=!on;document.documentElement.dataset.desktopMenu=on?'open':'closed';
 window.dispatchEvent(new Event(on?'johansson-desktop-pause':'johansson-desktop-resume'));
 if(on){document.exitPointerLock?.();cursor=0;panel.querySelector('button')?.focus();}
}
function toggleHUD(){
 const hidden=document.documentElement.classList.toggle('desktop-hide-hud');
 try{localStorage.setItem('johansson-desktop-hide-hud',String(hidden));}catch{}
 note(hidden?'HUD hidden. Press L3 to restore it.':'HUD visible. Press L3 to hide it.');
}
ipcRenderer.on('save-before-close',async()=>{try{await persist();ipcRenderer.send('close-saved');}catch(error){note('Could not save: '+error.message);}});
ipcRenderer.on('offline-link',()=>{openMenu();note('That link needs the internet. The installed island remains available offline.');});
window.addEventListener('DOMContentLoaded',()=>{
 const style=document.createElement('style');style.textContent='#desktopMenu[hidden]{display:none!important}#desktopMenu{position:fixed;inset:0;z-index:100000;background:#102830d9;display:grid;place-items:center;padding:20px;color:#193b38;font:17px/1.5 system-ui}#desktopMenu section{width:min(560px,100%);max-height:94vh;overflow:auto;background:#faf5e6;border-radius:22px;padding:26px}#desktopMenu h2{font-size:28px;margin:0 0 4px}#desktopMenu p{font-size:15px}#desktopMenu button{display:block;width:100%;min-height:48px;margin:8px 0;border:1px solid #6a8473;border-radius:10px;background:#e1ecdc;color:#173c33;font:700 17px system-ui;padding:10px}#desktopMenu button:focus{outline:4px solid #b76a28;outline-offset:2px}#desktopMenu button:disabled{opacity:.5}.desktop-hide-hud #hud,.desktop-hide-hud #mobile,.desktop-hide-hud .timecard,.desktop-hide-hud #festivalHUD{visibility:hidden!important}';document.head.append(style);
 panel=document.createElement('div');panel.id='desktopMenu';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Johansson World pause menu');
 panel.innerHTML='<section><h2>Johansson World</h2><p>Offline Linux edition · Menu: Start · Back: B · Hide HUD: L3</p><button data-action="resume">Resume the island</button><button data-action="save">Save progress</button><button data-action="hud">Show / hide HUD</button><button data-action="festival">Harbour Festival side quest</button><button data-action="update">Check for updates</button><button data-action="quit">Save &amp; quit to Steam</button><p id="desktopStatus" role="status" aria-live="polite">Your saves stay on this device when the game updates.</p></section>';
 document.body.append(panel);status=panel.querySelector('#desktopStatus');updateButton=panel.querySelector('[data-action=update]');
 try{document.documentElement.classList.toggle('desktop-hide-hud',localStorage.getItem('johansson-desktop-hide-hud')==='true');}catch{}
 panel.addEventListener('click',async event=>{
  const action=event.target.closest('button')?.dataset.action;if(!action)return;
  try{
   if(action==='resume')openMenu(false);
   if(action==='hud')toggleHUD();
   if(action==='festival'){openMenu(false);window.dispatchEvent(new Event('johansson-festival-menu'));}
   if(action==='save'){await persist();note('Progress saved to disk.');}
   if(action==='quit'){await persist();await ipcRenderer.invoke('quit-world');}
   if(action==='update'){
    updateButton.disabled=true;
    if(updateAction==='restart'){await persist();await ipcRenderer.invoke('restart-update');}
    else if(updateAction==='install'){note('Downloading and verifying the update…');const result=await ipcRenderer.invoke('install-update');if(result.ready){updateAction='restart';updateButton.textContent='Save & restart into '+result.version;note('Update verified. Your existing version and saves are retained.');}}
    else{note('Checking the GitHub release channel…');const result=await ipcRenderer.invoke('check-update');if(result.available&&result.canInstall){updateAction='install';updateButton.textContent='Download update '+result.next;note('Update available. Download it when you are ready.');}else note(result.available?'An update exists. Install with the Linux installer to enable in-game updating.':'This is the current release. You can continue playing offline.');}
   }
  }catch(error){note(error.message||'The operation could not finish. Your existing game is unchanged.');}
  finally{updateButton.disabled=false;}
 });
 document.addEventListener('keydown',event=>{
  if(event.code==='F10'){event.preventDefault();openMenu(panel.hidden);return;}
  if(event.code==='F8'){event.preventDefault();toggleHUD();}
  if(!panel.hidden&&event.code==='Escape'){event.preventDefault();event.stopImmediatePropagation();openMenu(false);}
 },true);
 setInterval(async()=>{try{const data=snapshot(),serial=JSON.stringify(data);if(serial!==lastSnapshot){await ipcRenderer.invoke('save-backup',data);lastSnapshot=serial;}}catch{}},3000);
 function pads(){
  const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected&&p.mapping==='standard');
  const now=pad?pad.buttons.map(b=>b.pressed):[],edge=i=>now[i]&&!held[i];
  const playing=document.getElementById('start')?.classList.contains('hidden');
  if(playing&&edge(9))openMenu(panel.hidden);
  if(playing&&edge(10))toggleHUD();
  if(!panel.hidden&&pad){
   const buttons=Array.from(panel.querySelectorAll('button:not(:disabled)'));
   const direction=now[12]||pad.axes[1]<-.55?-1:now[13]||pad.axes[1]>.55?1:0;
   if(direction&&performance.now()>nextDirection){cursor=(cursor+direction+buttons.length)%buttons.length;buttons[cursor]?.focus();nextDirection=performance.now()+220;}
   if(edge(0))document.activeElement?.click();if(edge(1))openMenu(false);
  }
  held=now;requestAnimationFrame(pads);
 }
 requestAnimationFrame(pads);
});
