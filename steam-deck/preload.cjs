const {contextBridge,ipcRenderer}=require('electron');
const snapshot=()=>Object.fromEntries(Object.keys(localStorage).filter(k=>/^(johansson[-:]|avatar[-:]|studio[-:])/.test(k)).map(k=>[k,localStorage.getItem(k)]));
try{const backup=ipcRenderer.sendSync('read-backup');for(const [key,value] of Object.entries(backup||{}))if(localStorage.getItem(key)===null)localStorage.setItem(key,value);}catch{}
let lastSnapshot='';
async function persist(){
 window.dispatchEvent(new Event('johansson-desktop-save'));
 window.dispatchEvent(new Event('johansson-save'));
 await new Promise(resolve=>setTimeout(resolve,0));
 const data=snapshot(),result=await ipcRenderer.invoke('save-backup',data);lastSnapshot=JSON.stringify(data);return result;
}
contextBridge.exposeInMainWorld('johanssonDesktop',{
 offline:true,version:ipcRenderer.sendSync('app-info').version,save:persist,
 performance:()=>ipcRenderer.invoke('performance-info'),
 checkUpdate:()=>ipcRenderer.invoke('check-update'),
 installUpdate:()=>ipcRenderer.invoke('install-update'),
 restartUpdate:async()=>{await persist();return ipcRenderer.invoke('restart-update');},
 quit:async()=>{await persist();return ipcRenderer.invoke('quit-world');},
});
ipcRenderer.on('save-before-close',async()=>{try{await persist();ipcRenderer.send('close-saved');}catch(error){window.dispatchEvent(new Event('johansson-save-failed'));}});
ipcRenderer.on('offline-link',()=>window.dispatchEvent(new Event('johansson-offline-link')));
window.addEventListener('DOMContentLoaded',()=>{
 setInterval(async()=>{try{const data=snapshot(),serial=JSON.stringify(data);if(serial!==lastSnapshot){await ipcRenderer.invoke('save-backup',data);lastSnapshot=serial;}}catch{}},3000);
});
