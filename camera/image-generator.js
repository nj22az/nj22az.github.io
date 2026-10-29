/** Optional Pocket Camera image generation client.
 * Backend must implement GET /v1/health and POST /v1/generate. The user supplies its URL;
 * credentials remain in the current page's memory and are never persisted.
 * createImageGenerator({onEdit}) returns {open,close}; onEdit receives an image File.
 */
export function backendURL(value){
 let url;try{url=new URL(value.trim());}catch{throw new Error('Enter the full address of your image server.');}
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&local))throw new Error('Use an HTTPS server address, or http://localhost on this device.');
 if(url.username||url.password||url.search||url.hash)throw new Error('Use a server address without a username, password, query or fragment.');
 url.pathname=url.pathname.replace(/\/+$/,'');
 return url.href.replace(/\/$/,'');
}
const URL_KEY='pocket-camera-image-server';
const readURL=()=>{try{return localStorage.getItem(URL_KEY)||'';}catch{return '';}};
const writeURL=value=>{try{localStorage.setItem(URL_KEY,value);}catch{}};
const byId=(root,id)=>root.querySelector(`[data-image-id="${id}"]`);
const asDataURL=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(new Error('The reference image could not be read.'));r.onload=()=>resolve(r.result);r.readAsDataURL(file);});

export function createImageGenerator({onEdit}){
 if(typeof onEdit!=='function')throw new TypeError('An image editor callback is required');
 const dialog=document.createElement('dialog');dialog.className='image-generator';dialog.setAttribute('aria-label','Create image');
 dialog.innerHTML=`<form method="dialog" class="ig-card"><header class="ig-header"><div><span class="ig-eyebrow">POCKET CAMERA</span><h2>Create image</h2></div><button type="button" class="ig-close" data-image-id="close" aria-label="Close">×</button></header>
 <div class="ig-content"><p class="ig-intro">Create an image from a description, or add a photo to transform it.</p>
 <label for="igPrompt">Describe your image</label><textarea id="igPrompt" data-image-id="prompt" rows="3" maxlength="1500" placeholder="A quiet harbour on a sunny afternoon"></textarea>
 <label class="ig-upload" for="igReference"><span>Reference photo <small>optional · PNG, JPEG or WebP, up to 8 MB</small></span><input id="igReference" data-image-id="reference" type="file" accept="image/png,image/jpeg,image/webp"></label>
 <details class="ig-connection" data-image-id="connection"><summary>Image server settings</summary><p>Connect your own image server to use this feature. Your prompt and reference photo are sent to that server.</p>
 <label for="igServer">Server address</label><input id="igServer" data-image-id="server" type="url" placeholder="https://your-image-server.example" autocomplete="url" spellcheck="false">
 <label for="igToken">Access token <small>if required</small></label><input id="igToken" data-image-id="token" type="password" autocomplete="off" spellcheck="false"><p class="ig-small">The address is remembered on this device. The token is sent to your server but is not saved.</p><button type="button" class="ig-secondary" data-image-id="test">Check connection</button></details>
 <p class="ig-status" data-image-id="status" role="status" aria-live="polite"></p>
 <button type="submit" class="ig-primary" data-image-id="generate">Generate image</button>
 <section class="ig-result" data-image-id="result" hidden aria-label="Generated image"><img data-image-id="preview" alt="Generated image"><div class="ig-actions"><button type="button" class="ig-secondary" data-image-id="edit">Edit in camera</button><a data-image-id="download" class="ig-secondary" download="pocket-creation.png">Download</a></div></section></div></form>`;
 document.body.append(dialog);
 const prompt=byId(dialog,'prompt'),server=byId(dialog,'server'),token=byId(dialog,'token'),reference=byId(dialog,'reference'),status=byId(dialog,'status'),generate=byId(dialog,'generate'),result=byId(dialog,'result'),preview=byId(dialog,'preview'),download=byId(dialog,'download');
 server.value=readURL();let controller=null,resultURL=null,resultBlob=null;
 const message=(text,error=false)=>{status.textContent=text;status.classList.toggle('error',error);};
 const connection=()=>{const base=backendURL(server.value);writeURL(base);const headers={};if(token.value.trim())headers.Authorization=`Bearer ${token.value.trim()}`;return {base,headers};};
 const busy=on=>{generate.disabled=on;byId(dialog,'test').disabled=on;generate.textContent=on?'Creating…':'Generate image';};
 const clearResult=()=>{if(resultURL)URL.revokeObjectURL(resultURL);resultURL=null;resultBlob=null;preview.removeAttribute('src');download.removeAttribute('href');result.hidden=true;};
 function close(){controller?.abort();controller=null;busy(false);if(dialog.open)dialog.close();}
 byId(dialog,'close').addEventListener('click',close);
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 byId(dialog,'test').addEventListener('click',async()=>{
  try{const {base,headers}=connection();message('Checking connection…');const response=await fetch(`${base}/v1/health`,{headers,cache:'no-store'});if(!response.ok)throw new Error(`Server returned ${response.status}.`);const data=await response.json();if(!data.ok)throw new Error('The server did not report a healthy connection.');message(data.ready?'Connected. The model is ready.':'Connected. The model will load on the first request.');}
  catch(err){message(err.message||'Connection failed.',true);}
 });
 dialog.querySelector('form').addEventListener('submit',async e=>{
  e.preventDefault();if(controller)return;
  let base,headers;try{({base,headers}=connection());}catch(err){byId(dialog,'connection').open=true;message(err.message||'Enter a valid server address.',true);return;}
  const text=prompt.value.trim();if(!text){message('Please describe the image you want.',true);prompt.focus();return;}
  const ref=reference.files?.[0];if(ref&&(!['image/png','image/jpeg','image/webp'].includes(ref.type)||ref.size>8*1024*1024)){message('Choose a PNG, JPEG or WebP no larger than 8 MB.',true);return;}
  const request={prompt:text,width:512,height:512};
  controller=new AbortController();const active=controller;busy(true);
  try{
   if(ref)request.image=await asDataURL(ref);
   if(active.signal.aborted)return;
   clearResult();message('Creating your image. The first request may take several minutes while the model loads.');
   const response=await fetch(`${base}/v1/generate`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(request),signal:active.signal,cache:'no-store'});
   if(!response.ok){let detail='';try{detail=(await response.json()).error||'';}catch{}throw new Error(detail||`The server returned ${response.status}.`);}
   const blob=await response.blob();if(!blob.type.startsWith('image/')||!blob.size)throw new Error('The server did not return an image.');
   resultBlob=blob;resultURL=URL.createObjectURL(blob);preview.src=resultURL;download.href=resultURL;result.hidden=false;message('Image ready. Open it in the editor or download it.');
  }catch(err){if(err.name!=='AbortError')message(err.message||'The image could not be generated.',true);}
  finally{if(controller===active){controller=null;busy(false);}}
 });
 byId(dialog,'edit').addEventListener('click',async()=>{if(!resultBlob)return;try{await onEdit(new File([resultBlob],'pocket-creation.png',{type:resultBlob.type}));close();}catch(err){message(err.message||'The image could not be opened in the editor. You can download it instead.',true);}});
 return {open(){message('');if(!server.value)byId(dialog,'connection').open=true;dialog.showModal();prompt.focus();},close};
}
