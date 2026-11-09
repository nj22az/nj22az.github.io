/** Share a compact result card through the device share sheet; no network call until the user chooses to share.
 * The card is Johansson World's: its ink, paper, gold and rust, the lockup over the Game Room's name, the camera's name
 * at the foot (camera-brand.css has the same lockup on the screens). */
export function shareMode(nav,file){
 if(typeof nav?.share!=='function')return 'download';
 try{if(file&&nav.canShare?.({files:[file]}))return 'image';}catch{}
 return 'text';
}
export function resultText({game,headline,detail}){
 return `${game} · ${headline}${detail?' · '+detail:''} — Pocket Camera · Johansson World`;
}
const INK='#142d37',PAPER='#ece3c9',CREAM='#fff8e9',GOLD='#e2b665',RUST='#b65940',MUTED='#4f6a62';
const BRAND='"Avenir Next","Yu Gothic",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif';
/** Tracked capitals, as the eyebrow on the screens is (letterSpacing where the canvas has it, else plain). */
function tracked(g,text,x,y,spacing){
 if('letterSpacing' in g){g.letterSpacing=`${spacing}px`;g.fillText(text,x,y);g.letterSpacing='0px';}
 else g.fillText(text,x,y);
}
function makeResultImage({game,headline,detail}){
 return new Promise(resolve=>{
  try{
   const c=document.createElement('canvas');c.width=1080;c.height=1080;
   const g=c.getContext('2d');if(!g){resolve(null);return;}
   g.fillStyle=PAPER;g.fillRect(0,0,1080,1080);
   g.fillStyle=INK;g.fillRect(52,52,976,976);
   g.fillStyle=CREAM;g.fillRect(66,66,948,948);
   // The header: the World's ink, the lockup in gold, the room's name in cream.
   g.fillStyle=INK;g.fillRect(91,91,898,214);
   g.textAlign='center';g.textBaseline='alphabetic';
   g.fillStyle=GOLD;g.font=`700 26px ${BRAND}`;tracked(g,'JOHANSSON WORLD  ·  MINATO MACHI',540,152,6);
   g.fillStyle=CREAM;g.font=`800 66px ${BRAND}`;tracked(g,'GAME ROOM',540,246,4);
   g.fillStyle=RUST;g.fillRect(153,367,774,5);
   g.fillStyle=INK;g.font=`800 68px ${BRAND}`;g.fillText(game.toUpperCase(),540,470,800);
   g.font=`700 54px ${BRAND}`;g.fillText(headline,540,580,800);
   g.fillStyle=MUTED;g.font=`500 38px ${BRAND}`;g.fillText(detail||'',540,650,800);
   g.fillStyle=GOLD;g.fillRect(380,727,320,4);
   g.fillStyle=INK;g.font=`700 28px ${BRAND}`;tracked(g,'POCKET CAMERA',540,808,5);
   g.fillStyle=MUTED;g.font=`500 28px ${BRAND}`;g.fillText('A little game from Minato Machi',540,856);
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
