/** Share a compact result card through the device share sheet; no network call until the user chooses to share. */
export function shareMode(nav,file){
 if(typeof nav?.share!=='function')return 'download';
 try{if(file&&nav.canShare?.({files:[file]}))return 'image';}catch{}
 return 'text';
}
export function resultText({game,headline,detail}){
 return `${game} · ${headline}${detail?' · '+detail:''} — Pocket Camera`;
}
function makeResultImage({game,headline,detail}){
 return new Promise(resolve=>{
  try{
   const c=document.createElement('canvas');c.width=1080;c.height=1080;
   const g=c.getContext('2d');if(!g){resolve(null);return;}
   g.fillStyle='#e9dbb9';g.fillRect(0,0,1080,1080);
   g.fillStyle='#24483f';g.fillRect(52,52,976,976);
   g.fillStyle='#fff5dd';g.fillRect(66,66,948,948);
   g.fillStyle='#78ad9a';g.fillRect(91,91,898,214);
   g.fillStyle='#24483f';g.font='bold 32px sans-serif';g.textAlign='center';g.fillText('JOHANSSON WORLD  ·  POCKET CAMERA',540,143);
   g.font='bold 64px sans-serif';g.fillText('MINATO GAME ROOM',540,232);
   g.fillStyle='#d37a64';g.fillRect(153,367,774,5);
   g.fillStyle='#24483f';g.font='bold 68px sans-serif';g.fillText(game.toUpperCase(),540,470,800);
   g.font='bold 54px sans-serif';g.fillText(headline,540,580,800);
   g.fillStyle='#526c5c';g.font='38px sans-serif';g.fillText(detail||'',540,650,800);
   g.fillStyle='#e8bd70';g.fillRect(380,727,320,4);
   g.fillStyle='#355d50';g.font='bold 30px sans-serif';g.fillText('A little game from Minato',540,815);
   c.toBlob(blob=>resolve(blob||null),'image/png');
  }catch{resolve(null);}
 });
}
export function createResultShare(data){
 const root=document.createElement('div');root.className='result-share';
 const share=document.createElement('button');share.type='button';share.className='result-share-button';share.textContent='Share result';share.disabled=true;
 const save=document.createElement('button');save.type='button';save.className='result-share-button';save.textContent='Save result image';save.disabled=true;
 const message=document.createElement('span');message.className='result-share-message';message.setAttribute('role','status');message.setAttribute('aria-live','polite');
 root.append(share,save,message);
 let file=null;
 makeResultImage(data).then(blob=>{if(blob&&typeof File==='function'){file=new File([blob],'pocket-camera-result.png',{type:'image/png'});save.disabled=false;}}).catch(()=>{}).finally(()=>{share.disabled=false;const mode=shareMode(navigator,file);share.textContent=mode==='text'?'Share result text':mode==='download'?'Copy result text':'Share result';});
 share.addEventListener('click',()=>{
  const text=resultText(data),mode=shareMode(navigator,file);
  if(mode==='download'){
   if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>{message.textContent='Result copied. Save the image to share it in a social app.';}).catch(()=>{message.textContent='Save the result image, then share it in your social app.';});}
   else message.textContent='Save the result image, then share it in your social app.';
   return;
  }
  const payload=mode==='image'?{title:'Pocket Camera',text,files:[file]}:{title:'Pocket Camera',text};
  // The share call is made directly in the click handler so iOS retains user activation.
  navigator.share(payload).catch(err=>{if(err?.name!=='AbortError')message.textContent='Could not open sharing. Save the result image and share it from your device.';});
 });
 save.addEventListener('click',()=>{
  if(!file)return;const a=document.createElement('a'),url=URL.createObjectURL(file);a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);message.textContent='Result image saved. You can share it from your device.';
 });
 return root;
}
