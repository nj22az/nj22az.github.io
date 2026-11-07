// Saving pictures, comics and projects from Johansson Studio, on an iPad first.
//
// iOS Safari honours a download or the share sheet only inside the tap that asked for it: anything started after an
// `await` (a PNG still being encoded, say) has lost the tap and is silently ignored. And a download on an iPad lands in
// the Files app, not Photos, so it looks as if nothing happened. So every file is built ahead of time, whenever what it
// shows changes, and the tap only hands it over: to the share sheet on a touch device that can share files (on an iPad
// it offers Save Image, into Photos), otherwise through a real <a download> link. A full-screen preview is always there
// too: press and hold the picture to save it.

/** A touch device (an iPad also when Safari asks for desktop sites, as it does by default). Decided once per page, so
 *  every save control and message agrees for the whole visit. */
let touchDevice;
export function touchFirst(win=globalThis){
 return win===globalThis?(touchDevice??=detectTouch(win)):detectTouch(win);
}
function detectTouch(win){
 try{const nav=win.navigator||{};return !!(win.matchMedia?.('(any-pointer: coarse)').matches||(nav.maxTouchPoints>1&&/Mac|iP(hone|ad|od)/.test(nav.platform||nav.userAgent||'')));}
 catch{return false;}
}
/** Whether the share sheet can take this file. */
export function canShareFile(file,nav=globalThis.navigator){
 try{return !!(nav&&typeof nav.share==='function'&&typeof nav.canShare==='function'&&nav.canShare({files:[file]}));}catch{return false;}
}
/** 'share' on a touch device that can share the file, else 'download'. */
export function saveRoute(file,{nav=globalThis.navigator,touch=touchFirst()}={}){return touch&&canShareFile(file,nav)?'share':'download';}

/** A data: URL as a Blob, synchronously (for a file made inside the tap). */
export function dataURLToBlob(url){
 const comma=url.indexOf(','),head=url.slice(5,comma),type=head.split(';')[0]||'application/octet-stream';
 if(!/;base64$/.test(head))return new Blob([decodeURIComponent(url.slice(comma+1))],{type});
 const bytes=atob(url.slice(comma+1)),out=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)out[i]=bytes.charCodeAt(i);
 return new Blob([out],{type});
}
export function canvasToBlob(canvas,type='image/png'){
 return new Promise((resolve,reject)=>{try{canvas.toBlob(blob=>blob?resolve(blob):reject(Error('The picture could not be encoded.')),type);}catch(e){reject(e);}});
}

/**
 * Hand a file over, synchronously, inside the tap: the share sheet or a download. `onResult` hears how it went
 * ({route, ok, cancelled, error}). Returns the route taken.
 */
export function deliverFile(file,{url,nav=globalThis.navigator,doc=globalThis.document,touch=touchFirst(),onResult=()=>{}}={}){
 if(saveRoute(file,{nav,touch})==='share'){
  let sharing;
  try{sharing=nav.share({files:[file]});}catch(error){onResult({route:'share',ok:false,error});return 'share';}
  Promise.resolve(sharing).then(()=>onResult({route:'share',ok:true}),error=>onResult({route:'share',ok:false,cancelled:error?.name==='AbortError',error}));
  return 'share';
 }
 let own='';if(!url){own=URL.createObjectURL(file);url=own;}
 const a=doc.createElement('a');a.href=url;a.download=file.name;a.rel='noopener';a.hidden=true;doc.body.append(a);a.click();a.remove();
 if(own)setTimeout(()=>URL.revokeObjectURL(own),60000);
 onResult({route:'download',ok:true});return 'download';
}

/**
 * A file kept ready for the next tap. `build()` makes its Blob (it may take its time); `schedule()` rebuilds it after a
 * pause (call it whenever what the file shows changes); `buildNow()` (optional) makes it synchronously when a tap comes
 * before it is ready. `onChange` hears every change of readiness.
 */
export function createReadyFile({name,type,build,buildNow=null,onChange=()=>{},delay=300}){
 let file=null,url='',token=0,timer=0;
 const clear=()=>{if(url)URL.revokeObjectURL(url);file=null;url='';};
 const api={
  get file(){return file;},get url(){return url;},get ready(){return !!file;},
  /** What it shows has changed: forget the old file and make a new one after a pause. */
  schedule(wait=delay){const t=++token;clearTimeout(timer);if(file){clear();onChange(api);}timer=setTimeout(()=>api.refresh(t),wait);},
  /** Forget the file without making another (nothing to save). */
  invalidate(){++token;clearTimeout(timer);if(file){clear();onChange(api);}},
  async refresh(t=++token){
   try{const blob=await build();if(t!==token||!blob)return;clear();file=new File([blob],typeof name==='function'?name():name,{type});url=URL.createObjectURL(file);onChange(api);}
   catch(error){if(t===token){console.warn('Johansson Studio: could not prepare '+(typeof name==='function'?name():name),error);onChange(api,error);}}
  },
  /** The file now: the ready one, or (when it is not ready and a synchronous builder exists) one made on the spot. */
  now(){if(file)return {file,url};if(!buildNow)return null;const blob=buildNow();if(!blob)return null;return {file:new File([blob],typeof name==='function'?name():name,{type}),url:''};},
  dispose(){++token;clearTimeout(timer);clear();}
 };
 return api;
}

/**
 * Make `link` (an <a>) the save control for `ready`: while the file is ready it is a real download link to it; a tap
 * on a touch device that can share the file opens the share sheet instead. A tap before the file is ready makes it on
 * the spot when it can (`ready.now()`), else says to wait. `disabled()` says when there is nothing to save; `say`
 * reports in words. Returns the function to call when the file's readiness changes.
 */
export function bindSaveLink(link,ready,{say=()=>{},disabled=()=>false,touch=()=>touchFirst(),nav=()=>globalThis.navigator,words={}}={}){
 const w={busy:'Preparing… try again in a moment.',shared:'Done.',cancelled:'Nothing was saved: the share sheet was closed.',download:'Saved to your downloads.',failed:'Sharing did not work here. Press and hold the picture in the preview to save it.',...words};
 // A button to people and assistive technology (it saves a file), whether or not its link is ready yet.
 link.tabIndex=0;link.setAttribute('role','button');
 const update=()=>{
  if(ready.ready){link.href=ready.url;link.download=ready.file.name;}else{link.removeAttribute('href');link.removeAttribute('download');}
  if(disabled())link.setAttribute('aria-disabled','true');else link.removeAttribute('aria-disabled');
 };
 link.addEventListener('keydown',event=>{if((event.key==='Enter'&&!link.hasAttribute('href'))||event.key===' '){event.preventDefault();link.click();}});
 link.addEventListener('click',event=>{
  if(disabled()){event.preventDefault();return;}
  const t=touch(),n=nav();
  let target=ready.ready?{file:ready.file,url:ready.url}:null;
  if(target&&saveRoute(target.file,{nav:n,touch:t})==='download'){say(w.download,'download');return;} // the link itself downloads it
  event.preventDefault();
  if(!target){try{target=ready.now?.()||null;}catch(error){console.warn('Johansson Studio: could not make the file',error);}}
  if(!target){say(w.busy,'busy');return;}
  deliverFile(target.file,{url:target.url,nav:n,touch:t,onResult:r=>{
   if(r.route==='download')say(w.download,'download');
   else if(r.ok)say(w.shared,'shared');
   else if(r.cancelled)say(w.cancelled,'cancelled');
   else{console.warn('Johansson Studio: sharing failed',r.error);say(w.failed,'failed');}
  }});
 });
 update();return update;
}

/**
 * The full-screen preview: the picture as large as the screen allows, to look at and to press and hold (Save to Photos),
 * with a save button and a close button. Returns {open({title,ready,alt}), close(), element}.
 */
export function createPreview({doc=globalThis.document,say=()=>{}}={}){
 const sheet=doc.createElement('div');sheet.className='studio-sheet';sheet.hidden=true;sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-labelledby','studio-sheet-title');
 sheet.innerHTML=`<div class="studio-sheet-bar"><h2 id="studio-sheet-title">Preview</h2><a class="studio-sheet-save">Save</a><button type="button" class="studio-sheet-close">Close</button></div><div class="studio-sheet-stage"><img class="studio-sheet-image" alt=""></div><p class="studio-sheet-tip"></p><p class="studio-sheet-status" role="status"></p>`;
 doc.body.append(sheet);
 const img=sheet.querySelector('img'),save=sheet.querySelector('.studio-sheet-save'),close=sheet.querySelector('.studio-sheet-close'),tip=sheet.querySelector('.studio-sheet-tip'),status=sheet.querySelector('.studio-sheet-status');
 let current=null,returnFocus=null,refresh=()=>{};
 const proxy={get ready(){return !!current?.ready;},get file(){return current?.file;},get url(){return current?.url;},now(){return current?.now();}};
 refresh=bindSaveLink(save,proxy,{say:text=>{status.textContent=text;say(text);},disabled:()=>!current});
 function shut(){if(sheet.hidden)return;sheet.hidden=true;img.removeAttribute('src');current=null;doc.removeEventListener('keydown',keys,true);returnFocus?.focus?.({preventScroll:true});}
 function keys(event){if(event.key==='Escape'){event.preventDefault();event.stopPropagation();shut();}
  if(event.key==='Tab'){const list=[save,close];const i=list.indexOf(doc.activeElement);if(i<0||(event.shiftKey&&i===0)||(!event.shiftKey&&i===list.length-1)){event.preventDefault();list[event.shiftKey?(i<=0?1:0):(i===1?0:1)].focus();}}}
 close.onclick=shut;
 sheet.addEventListener('click',event=>{if(event.target===sheet||event.target.classList.contains('studio-sheet-stage'))shut();});
 return {element:sheet,close:shut,
  open({title='Preview',ready,alt='',url=''}){
   current=ready;returnFocus=doc.activeElement;sheet.querySelector('h2').textContent=title;status.textContent='';
   const touch=touchFirst();tip.textContent=touch?'Press and hold the picture, then choose Save to Photos.':'Right-click the picture to copy it or save it.';
   img.alt=alt;img.src=ready?.url||url;refresh();sheet.hidden=false;doc.addEventListener('keydown',keys,true);close.focus({preventScroll:true});
  },
  /** The file behind an open preview became ready (or changed). */
  update(){if(sheet.hidden||!current)return;if(current.url)img.src=current.url;refresh();}
 };
}
