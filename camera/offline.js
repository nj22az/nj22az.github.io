// A truthful status in Settings; never covers the photograph or touches album storage.
export function prepareOffline(button,{canReload=()=>{
 const state=window.pocketCamera?.state;return !state?.edit&&state?.mode!=='editor'&&!state?.camera?.busy;
}}={}){
 const set=(state,label)=>{button.dataset.state=state;button.disabled=state==='preparing'||state==='ready';button.title=label;button.setAttribute('aria-label',label);button.querySelector('use').setAttribute('href',state==='ready'?'#i-offline-ready':state==='update'?'#i-update':'#i-download');const caption=button.querySelector('.offline-label');if(caption)caption.hidden=state!=='update';};
 if(!('serviceWorker' in navigator)){set('unavailable','Offline storage is unavailable in this browser');button.disabled=true;return;}
 const version=new URL(document.querySelector('script[src*="app.js"]').src).searchParams.get('v');
 let registration,checking=null,lastCheck=null,updateAvailable=false;
 const ask=()=>navigator.serviceWorker.controller?.postMessage({type:'CAMERA_OFFLINE_STATUS'});
 navigator.serviceWorker.addEventListener('message',event=>{
  const s=event.data;if(s?.type!=='CAMERA_OFFLINE_STATUS')return;
  // Ignore a delayed reply from the worker that has just been replaced.
  if(event.source&&navigator.serviceWorker.controller&&event.source!==navigator.serviceWorker.controller)return;
  if(s.ready&&s.version!==version&&s.version){
   if(!registration||registration.installing){updateAvailable=false;set('preparing','Downloading offline update');return;}
   updateAvailable=true;set('update','Update available. Tap to refresh Pocket Camera');
  }else if(s.version===version||s.ready===false){
   updateAvailable=false;set(s.ready?'ready':'retry',s.ready?'Ready offline':'Retry offline download');
  }
 });
 async function checkUpdate(force=false){
  if(!registration||!navigator.onLine||document.hidden)return false;
  if(checking)return checking;
  const now=Date.now();if(!force&&lastCheck!==null&&now-lastCheck<60000)return false;
  lastCheck=now;
  checking=registration.update().then(()=>true,()=>false).finally(()=>{checking=null;});
  return checking;
 }
 const resume=()=>{ask();void checkUpdate();};
 navigator.serviceWorker.addEventListener('controllerchange',ask);
 addEventListener('pageshow',resume);addEventListener('online',resume);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume();});
 const watched=new WeakSet();
 function watch(worker){
  if(!worker||watched.has(worker))return;watched.add(worker);let activated=worker.state==='activated';
  if(!activated&&updateAvailable){updateAvailable=false;set('preparing','Downloading offline update');}
  worker.addEventListener('statechange',()=>{
   if(worker.state==='redundant'&&!activated){updateAvailable=false;set('retry','Retry offline download');}
   if(worker.state==='activated'){activated=true;ask();}
  });
 }
 async function start(){
  set('preparing','Downloading offline files');
  try{
   registration=await navigator.serviceWorker.register(new URL('./sw.js',import.meta.url),{updateViaCache:'none'});
   lastCheck=navigator.onLine?Date.now():null;watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));
   await navigator.serviceWorker.ready;ask();
  }catch{set('retry','Retry offline download');ask();}
 }
 button.addEventListener('click',async()=>{
  if(updateAvailable){
   let safe=false;try{safe=canReload()===true;}catch{}
   if(!safe){set('update','Save or close the photo before updating');return;}
   // An explicit user action only. A worker taking control never discards an open edit.
   location.reload();return;
  }
  if(!navigator.onLine){set('retry','Connect to download offline files');return;}
  if(!registration?.active){registration=null;start();return;}
  set('preparing','Downloading offline files');await checkUpdate(true);
  navigator.serviceWorker.controller?.postMessage({type:'CAMERA_OFFLINE_REPAIR'});
 });
 start();
}
