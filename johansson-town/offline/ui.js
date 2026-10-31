export function mountOffline(registration){
 const dialog=document.getElementById('offlineIsland');if(!dialog)return;
 const status=document.getElementById('offlineStatus'),meter=document.getElementById('offlineProgress'),detail=document.getElementById('offlineDetail');
 const action=document.getElementById('offlineDownload'),pause=document.getElementById('offlinePause');
 const openers=[...document.querySelectorAll('[data-offline-open]')];let last=null,opener=null,poll=null;
 const mib=bytes=>(bytes/1048576).toFixed(1)+' MB';
 function draw(value){
  last=value;dialog.dataset.stage=value.stage;
  const running=value.stage==='downloading',ready=value.stage==='ready';
  meter.value=value.bytes;meter.max=value.totalBytes||1;meter.hidden=!running&&value.stage!=='paused';
  status.textContent=ready?'Ready offline':running?'Downloading the island…':value.stage==='paused'?'Download paused':value.stage==='error'?'Download needs attention':'Your whole island, offline';
  detail.textContent=value.error||(ready?'The streets, rooms, residents and sounds are saved on this device.':running||value.stage==='paused'?`${mib(value.bytes)} of ${mib(value.totalBytes)} · ${value.done} of ${value.total} files`:`${mib(value.totalBytes)} · Download once while connected.`);
  action.hidden=running||ready;action.disabled=false;action.textContent=value.stage==='error'?'Retry download':value.stage==='paused'?'Resume download':'Download for offline';
  pause.hidden=!running;
  for(const button of openers){button.dataset.ready=String(ready);button.setAttribute('aria-label',ready?'Offline island: ready on this device':'Download the island for offline');button.querySelector('[data-offline-label]')?.replaceChildren(ready?'Offline ready':'Offline');}
 }
 async function send(type){
  const worker=navigator.serviceWorker.controller||registration.active;
  if(!worker)throw Error('The island is still preparing. Please retry in a moment.');
  return new Promise((resolve,reject)=>{
   const channel=new MessageChannel(),timeout=setTimeout(()=>{channel.port1.close();reject(Error('The download did not respond. Keep this app open and retry.'));},45000);
   channel.port1.onmessage=event=>{clearTimeout(timeout);channel.port1.close();resolve(event.data.status);};
   worker.postMessage({type},[channel.port2]);
  });
 }
 const failure=error=>{if(last)draw({...last,stage:'error',error:error.message});else{status.textContent='Offline download is unavailable';detail.textContent=error.message;action.disabled=true;}};
 const refresh=()=>send('TOWN_OFFLINE_STATUS').then(draw).catch(failure);
 for(const button of openers)button.addEventListener('click',()=>{opener=button;dialog.showModal();refresh();poll=setInterval(refresh,5000);});
 document.getElementById('offlineClose').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{clearInterval(poll);opener?.focus();});
 dialog.addEventListener('keydown',event=>event.stopPropagation());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 action.addEventListener('click',async()=>{
  action.disabled=true;
  // A user gesture may let Safari retain this app's storage. Refusal never prevents the download.
  navigator.storage?.persist?.().catch(()=>{});
  try{draw(await send('TOWN_OFFLINE_START'));}catch(error){failure(error);}
 });
 pause.addEventListener('click',()=>send('TOWN_OFFLINE_PAUSE').then(draw).catch(failure));
 navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='TOWN_OFFLINE_STATUS')draw(event.data.status);});
 navigator.serviceWorker.addEventListener('controllerchange',refresh);
 addEventListener('online',refresh);addEventListener('focus',()=>{if(dialog.open)refresh();});
 refresh();
}
