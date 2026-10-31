// A truthful status in Settings; never covers the photograph or touches album storage.
export function prepareOffline(button){
 const set=(state,label)=>{button.dataset.state=state;button.disabled=state==='preparing'||state==='ready';button.title=label;button.setAttribute('aria-label',label);button.querySelector('use').setAttribute('href',state==='ready'?'#i-offline-ready':'#i-download');};
 if(!('serviceWorker' in navigator)){set('unavailable','Offline storage is unavailable in this browser');button.disabled=true;return;}
 const version=new URL(document.querySelector('script[src*="app.js"]').src).searchParams.get('v');
 let registration;
 const ask=()=>navigator.serviceWorker.controller?.postMessage({type:'CAMERA_OFFLINE_STATUS'});
 navigator.serviceWorker.addEventListener('message',event=>{const s=event.data;if(s?.type==='CAMERA_OFFLINE_STATUS'&&(s.version===version||s.ready===false))set(s.ready?'ready':'retry',s.ready?'Ready offline':'Retry offline download');});
 navigator.serviceWorker.addEventListener('controllerchange',ask);addEventListener('pageshow',ask);addEventListener('online',ask);
 const watch=worker=>worker?.addEventListener('statechange',()=>{if(worker.state==='redundant')set('retry','Retry offline download');if(worker.state==='activated')ask();});
 async function start(){
  set('preparing','Downloading offline files');
  try{registration=await navigator.serviceWorker.register(new URL('./sw.js',import.meta.url));watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));await navigator.serviceWorker.ready;ask();}
  catch{set('retry','Retry offline download');}
 }
 button.addEventListener('click',async()=>{if(registration){set('preparing','Downloading offline files');try{await registration.update();navigator.serviceWorker.controller?.postMessage({type:'CAMERA_OFFLINE_REPAIR'});}catch{set('retry','Retry offline download');}}else start();});
 start();
}
