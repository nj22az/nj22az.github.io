/**
 * Pocket Camera: a camera and a photo editor for every Look in Johansson World (looks-gl.js), alone or stacked up to
 * three deep. Everything happens on this device: the camera picture never leaves it, and saved photos live in the
 * browser's own storage (album.js) until shared.
 */
import {createLookEngine,LOOKS,LOOK_NAMES,normalRecipe,exportSize} from './looks-gl.js?v=20261029';
import {listShots,getShot,addShot,updateShot,deleteShot,keepAlbum} from './album.js?v=20261029';
import {lookSwatch} from '../johansson-town/src/ui/look-picker.js?v=20261029-camera';
import {loadStickerSets,stickerLabel,createStickerLayer,drawStickers} from './stickers.js?v=20261029';

const $=id=>document.getElementById(id);
const coarse=matchMedia('(pointer:coarse)').matches;
const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
const SETTINGS_KEY='office-pocket-camera';
const MAX_LAYERS=3;
const RATIOS=['4:3','1:1','16:9'],TIMERS=[0,3,10],ZOOMS=[1,2,3];
// The second Look of a surprise mix: ones that read well over any other.
const FINISHERS=['crt','tilt','riso','pocket','snes','sepia','mono','print','manga','stamp','watercolour','crayon'];
const ADJUSTMENTS=[
 {key:'light',label:'Light',icon:'light'},{key:'contrast',label:'Contrast',icon:'contrast'},{key:'colour',label:'Colour',icon:'colour'},
 {key:'warmth',label:'Warmth',icon:'warmth'},{key:'pattern',label:'Pattern',icon:'pattern',hint:'The size of dots, strokes and lines'},
];
const THUMB=144;

const store={
 read(){try{return JSON.parse(localStorage.getItem(SETTINGS_KEY))||{};}catch{return {};}},
 write(v){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(v));}catch{}},
};
const saved=store.read();

const state={
 mode:'camera',
 camera:{recipe:normalRecipe(saved.recipe||{layers:[{look:'pocket',amount:1}]}),active:0,ratio:RATIOS.includes(saved.ratio)?saved.ratio:'4:3',
  timer:TIMERS.includes(saved.timer)?saved.timer:0,zoom:1,facing:saved.facing==='user'?'user':'environment',mirror:false,stream:null,running:false,busy:false},
 edit:null,
 shots:[],viewing:null,
};
state.camera.recipe.stamp=!!saved.stamp;
const current=()=>state.mode==='editor'?state.edit:state.camera;
function remember(){const c=state.camera;store.write({...store.read(),recipe:{layers:c.recipe.layers,stickers:c.recipe.stickers},ratio:c.ratio,timer:c.timer,stamp:c.recipe.stamp,facing:c.facing});}

// ---------- The engine and its canvas ----------
const canvas=document.createElement('canvas');
canvas.setAttribute('aria-label','Viewfinder');
let engine=null;
function startEngine(){
 try{engine=createLookEngine(canvas,{light:coarse});engine.warm(LOOK_NAMES);return true;}
 catch{engine=null;return false;}
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();$('shutter').disabled=true;$('saveEdit').disabled=true;toast('Graphics restarted');});
canvas.addEventListener('webglcontextrestored',()=>{
 startEngine();
 if(state.edit)engine?.setSource('edit',state.edit.picture,state.edit.width,state.edit.height);
 $('shutter').disabled=!state.camera.running;$('saveEdit').disabled=false;refreshThumbs(true);
 invalidate();
});

// ---------- Small helpers ----------
let toastTimer;
function toast(text,{look=false,ms=1400}={}){
 const t=$('toast');t.textContent=text;t.classList.toggle('look',look);t.classList.add('show');
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),ms);
}
const lookLabel=name=>LOOKS[name]?.short||name;
const mixLabel=recipe=>recipe.layers.map(l=>lookLabel(l.look)).join(' + ');
const offered=()=>LOOK_NAMES.filter(n=>!engine?.failed(n));
function icon(name){return `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const nextFrame=()=>new Promise(r=>requestAnimationFrame(()=>r()));
/** The date as an old film camera printed it, as the hotel photos show it: ’26 10 29. */
export function dateStamp(date){
 const yy=String(date.getFullYear()%100).padStart(2,'0'),mm=String(date.getMonth()+1).padStart(2,' '),dd=String(date.getDate()).padStart(2,' ');
 return `’${yy} ${mm} ${dd}`;
}

// Sound: a two-part mechanical shutter and a soft tick, made here rather than loaded.
let audio;
function sound(kind){
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume();
  const t=audio.currentTime;
  const burst=(at,length,freq,gain)=>{
   const b=audio.createBuffer(1,Math.ceil(audio.sampleRate*length),audio.sampleRate),d=b.getChannelData(0);
   for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**3;
   const s=audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain();
   s.buffer=b;f.type='bandpass';f.frequency.value=freq;f.Q.value=.9;g.gain.value=gain;
   s.connect(f).connect(g).connect(audio.destination);s.start(t+at);
  };
  if(kind==='shutter'){burst(0,.045,3200,.5);burst(.075,.06,1900,.38);}
  else if(kind==='tick')burst(0,.012,4200,.12);
  else if(kind==='count')burst(0,.02,2600,.18);
 }catch{}
 if(kind!=='tick')navigator.vibrate?.(kind==='shutter'?12:6);
}

// ---------- Laying out the picture ----------
/** Sizes the canvas's box to sit whole inside its stage at the picture's shape. */
function fitFrame(frame,stage,aspect){
 const r=stage.getBoundingClientRect(),cs=getComputedStyle(stage);
 const w=r.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),h=r.height-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
 let fw=w,fh=w/aspect;if(fh>h){fh=h;fw=h*aspect;}
 frame.style.width=`${Math.max(1,Math.floor(fw))}px`;frame.style.height=`${Math.max(1,Math.floor(fh))}px`;
 frame.style.fontSize=`${fh*.045}px`;
 return {width:fw,height:fh};
}
function setCanvasSize(w,h){w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
function placeCanvas(frame){if(canvas.parentElement!==frame)frame.prepend(canvas);}
function stampOverlay(frame,on,date){
 let el=frame.querySelector('.date-stamp');
 if(!on){el?.remove();return;}
 if(!el){el=document.createElement('time');el.className='date-stamp';frame.append(el);}
 el.textContent=dateStamp(date);el.dateTime=date.toISOString().slice(0,10);
}

// ---------- The Look tray ----------
const tray=$('tray'),strip=$('strip'),layersEl=$('layers');
const tiles=new Map();
function buildStrip(){
 strip.textContent='';tiles.clear();
 for(const name of offered()){
  const b=document.createElement('button');b.type='button';b.className='tile';b.setAttribute('role','radio');b.dataset.look=name;
  b.title=LOOKS[name].hint;b.setAttribute('aria-label',LOOKS[name].label);
  // World's own picture of the Look (the same little house in each style) until the live one is drawn.
  const face=document.createElement('span');face.className='face swatch';face.innerHTML=lookSwatch(name,`cam-${name}`);
  const c=document.createElement('canvas');c.width=c.height=THUMB;face.append(c);
  const s=document.createElement('span');s.className='name';s.textContent=lookLabel(name);
  b.append(face,s);strip.append(b);tiles.set(name,{button:b,canvas:c,drawn:false});
 }
}
function renderLayers(){
 const ctx=current(),{layers}=ctx.recipe;layersEl.textContent='';
 layers.forEach((layer,i)=>{
  if(i>0){const j=document.createElement('span');j.className='layer-join';j.textContent='+';j.setAttribute('aria-hidden','true');layersEl.append(j);}
  const wrap=document.createElement('span');wrap.className=`layer${i===ctx.active?' active':''}${layers.length>1?' removable':''}`;
  const pick=document.createElement('button');pick.type='button';pick.className='layer-pick';pick.textContent=lookLabel(layer.look);
  pick.setAttribute('aria-pressed',String(i===ctx.active));pick.setAttribute('aria-label',`Look ${i+1}: ${LOOKS[layer.look].label}${layer.amount<1?`, ${Math.round(layer.amount*100)}%`:''}`);
  pick.addEventListener('click',()=>{if(ctx.active===i){toggleAmount();return;}ctx.active=i;trayChanged({thumbs:true});});
  const remove=document.createElement('button');remove.type='button';remove.className='layer-remove';remove.innerHTML=icon('x');
  remove.setAttribute('aria-label',`Remove ${LOOKS[layer.look].label} from the mix`);
  remove.addEventListener('click',()=>removeLayer(i));
  wrap.append(pick,remove);layersEl.append(wrap);
 });
 if(layers.length<MAX_LAYERS){
  const add=document.createElement('button');add.type='button';add.className='add-layer';add.innerHTML=`${icon('plus')}<span>Mix</span>`;
  add.setAttribute('aria-label','Mix in another Look over this one');add.addEventListener('click',addLayer);layersEl.append(add);
 }
 const dice=document.createElement('button');dice.type='button';dice.className='shuffle';dice.innerHTML=icon('dice');
 dice.setAttribute('aria-label','Surprise me: a random mix');dice.title='Surprise me';
 dice.addEventListener('click',()=>{dice.classList.remove('roll-dice');void dice.offsetWidth;dice.classList.add('roll-dice');shuffle();});
 layersEl.append(dice);
 if(state.mode==='camera'){
  const sticker=document.createElement('button');sticker.type='button';sticker.className='shuffle sticker-button';sticker.innerHTML=icon('sticker');
  sticker.setAttribute('aria-label','Stickers');sticker.title='Stickers';sticker.addEventListener('click',openStickerSheet);layersEl.append(sticker);
 }
}
function renderStripSelection({scroll=true}={}){
 const ctx=current(),look=ctx.recipe.layers[ctx.active].look;
 for(const [name,t] of tiles){const on=name===look;t.button.setAttribute('aria-checked',String(on));t.button.tabIndex=on?0:-1;}
 if(scroll){const t=tiles.get(look)?.button;if(t)scrollTileIntoView(t);}
}
function scrollTileIntoView(t){
 const s=strip,left=t.offsetLeft-s.offsetLeft,target=left-(s.clientWidth-t.offsetWidth)/2;
 if(s.scrollWidth>s.clientWidth)s.scrollTo({left:target,behavior:reduceMotion?'auto':'smooth'});
}
function renderAmount(){
 const ctx=current(),layer=ctx.recipe.layers[ctx.active],v=Math.round(layer.amount*100);
 const a=$('amount');a.value=v;a.style.setProperty('--fillTo',`${v}%`);$('amountValue').textContent=v;
 a.setAttribute('aria-label',`${LOOKS[layer.look].label} intensity`);
 a.disabled=layer.look==='none';
}
function showAmountRow(show){$('amountRow').hidden=!show;}
function toggleAmount(){if(state.mode==='camera')showAmountRow($('amountRow').hidden);}
/** After any change to the mix: redraw the tray and the picture. */
function trayChanged({thumbs=false,announce=false,scroll=true}={}){
 renderLayers();renderStripSelection({scroll});renderAmount();
 if(announce)toast(mixLabel(current().recipe),{look:true,ms:900});
 if(state.mode==='camera')remember();
 if(thumbs)refreshThumbs(true);
 invalidate();
}
function chooseLook(name,{announce=true}={}){
 const ctx=current(),layer=ctx.recipe.layers[ctx.active];
 if(layer.look===name){toggleAmount();return;}
 layer.look=name;layer.amount=1;
 trayChanged({announce});
 // The Looks after this layer are drawn over it, so their thumbnails do not change; the ones before do not either.
}
function stepLook(dir){
 const names=offered(),ctx=current(),i=names.indexOf(ctx.recipe.layers[ctx.active].look);
 chooseLook(names[(i+dir+names.length)%names.length]);sound('tick');
}
function addLayer(){
 const ctx=current();if(ctx.recipe.layers.length>=MAX_LAYERS)return;
 const used=new Set(ctx.recipe.layers.map(l=>l.look));
 const next=FINISHERS.find(n=>!used.has(n)&&tiles.has(n))||'crt';
 ctx.recipe.layers.push({look:next,amount:1});ctx.active=ctx.recipe.layers.length-1;
 trayChanged({thumbs:true,announce:true});
 layersEl.querySelectorAll('.layer')[ctx.active]?.classList.add('enter');
}
function removeLayer(i){
 const ctx=current();if(ctx.recipe.layers.length<2)return;
 ctx.recipe.layers.splice(i,1);if(i<ctx.active)ctx.active--;ctx.active=Math.min(ctx.active,ctx.recipe.layers.length-1);
 trayChanged({thumbs:true,announce:true});
}
function shuffle(){
 const ctx=current(),names=offered().filter(n=>n!=='none'),pick=list=>list[Math.floor(Math.random()*list.length)];
 const first=pick(names),layers=[{look:first,amount:1}];
 if(Math.random()<.65){const second=pick(FINISHERS.filter(n=>n!==first&&tiles.has(n)));if(second)layers.push({look:second,amount:Math.round((.65+Math.random()*.35)*100)/100});}
 ctx.recipe.layers=layers;ctx.active=0;
 trayChanged({thumbs:true,announce:true});
}
strip.addEventListener('click',e=>{const t=e.target.closest('.tile');if(t)chooseLook(t.dataset.look);});
strip.addEventListener('keydown',e=>{
 if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
 e.preventDefault();e.stopPropagation();stepLook(e.key==='ArrowRight'?1:-1);
 tiles.get(current().recipe.layers[current().active].look)?.button.focus();
});
$('amount').addEventListener('input',e=>{
 const ctx=current();ctx.recipe.layers[ctx.active].amount=e.target.value/100;
 e.target.style.setProperty('--fillTo',`${e.target.value}%`);$('amountValue').textContent=e.target.value;
 if(state.mode==='camera')remember();
 invalidate();
});
$('amount').addEventListener('change',()=>renderLayers());

// Thumbnails: every Look drawn on the current picture, as the chosen layer would be.
const atlasCanvas=document.createElement('canvas'),atlas=atlasCanvas.getContext('2d');
let thumbsAt=0,thumbsDue=false;
function refreshThumbs(now=false){thumbsDue=true;if(now)thumbsAt=0;schedule();}
function drawThumbs(){
 if(!engine||!thumbsDue)return;
 const t=performance.now();
 const live=state.mode==='camera';
 if(t-thumbsAt<(live?700:120))return;
 const ctx=current(),source=live?'live':'edit';
 if(!engine.hasSource(source))return;
 const crop=squareCrop(live?cameraCrop():{x:0,y:0,w:1,h:1},live?videoSize():{width:state.edit.width,height:state.edit.height});
 const names=[...tiles.keys()];
 const out=engine.thumbnails(ctx.recipe,{source,crop,mirror:live&&state.camera.mirror,size:THUMB,names,layer:ctx.active});
 thumbsAt=t;
 if(!out)return;
 atlasCanvas.width=out.width;atlasCanvas.height=out.height;atlas.putImageData(new ImageData(out.data,out.width,out.height),0,0);
 names.forEach((name,i)=>{
  if(out.missing.includes(name))return;
  const tile=tiles.get(name);tile.canvas.getContext('2d').drawImage(atlasCanvas,i*THUMB,0,THUMB,THUMB,0,0,THUMB,THUMB);
  if(!tile.drawn){tile.drawn=true;tile.canvas.classList.add('drawn');}
 });
 for(const name of names)if(engine.failed(name)){buildStrip();renderStripSelection();break;}
 // Live pictures keep their thumbnails moving; a still is done once every Look has compiled.
 thumbsDue=live||out.missing.length>0;
 if(out.missing.length)thumbsAt=t-(live?500:0);
}
function squareCrop(crop,size){
 const pw=crop.w*size.width,ph=crop.h*size.height,s=Math.min(pw,ph);
 const w=crop.w*s/pw,h=crop.h*s/ph;
 return {x:crop.x+(crop.w-w)/2,y:crop.y+(crop.h-h)/2,w,h};
}

// ---------- Drawing loop ----------
let dirty=true,raf=0,lines=coarse?720:1080;
const frameTimes=[];
function invalidate(){dirty=true;schedule();}
function schedule(){if(!raf)raf=requestAnimationFrame(loop);}
let lastFrame=0,videoFresh=false,uploadedAt=-1;
function loop(t){
 raf=0;
 if(!engine)return;
 // Nothing can be drawn until the graphics come back (webglcontextrestored).
 if(engine.lost()){if(state.mode==='camera'||state.mode==='editor')setTimeout(schedule,250);return;}
 if(state.mode==='camera'&&state.camera.running){drawCamera(t);schedule();}
 else if(state.mode==='editor'&&state.edit){if(dirty)drawEditor();if(thumbsDue||dirty)schedule();}
 drawThumbs();
}
function videoSize(){const v=$('video');return {width:v.videoWidth||1,height:v.videoHeight||1};}
/** The part of the camera picture that is kept: the chosen shape, zoomed, centred. */
function cameraCrop(){
 const {width:vw,height:vh}=videoSize(),[a,b]=state.camera.ratio.split(':').map(Number);
 const long=a/b,target=vh>vw?1/long:long,va=vw/vh;
 let w=1,h=1;if(va>target)w=target/va;else h=va/target;
 w/=state.camera.zoom;h/=state.camera.zoom;
 return {x:(1-w)/2,y:(1-h)/2,w,h};
}
function drawCamera(t){
 const v=$('video');
 if(v.readyState<2)return;
 // A new frame when the video says so, or when its clock has moved (in case a browser never calls back for a video
 // that is not on screen).
 if(videoFresh||v.currentTime!==uploadedAt){engine.setSource('live',v,v.videoWidth,v.videoHeight);videoFresh=false;uploadedAt=v.currentTime;}
 const crop=cameraCrop(),pw=crop.w*v.videoWidth,ph=crop.h*v.videoHeight;
 const box=fitFrame($('cameraFrame'),$('cameraStage'),pw/ph);
 // The viewfinder is drawn at the screen's own detail, no finer than the camera and no finer than the device keeps up with.
 const dpr=Math.min(devicePixelRatio||1,3),h=Math.min(ph,box.height*dpr,lines);
 setCanvasSize(h*pw/ph,h);
 const drawn=engine.draw(state.camera.recipe,{source:'live',crop,mirror:state.camera.mirror});
 if(drawn)govern(t);
}
// Lower the viewfinder's detail when frames come slowly, raise it again when they come easily.
function govern(t){
 if(lastFrame){frameTimes.push(t-lastFrame);if(frameTimes.length>40)frameTimes.shift();}
 lastFrame=t;
 if(frameTimes.length<40)return;
 const mean=frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length;
 if(mean>45&&lines>360){lines=Math.max(360,Math.round(lines*.82));frameTimes.length=0;}
 else if(mean<22&&lines<(coarse?1080:1440)){lines=Math.round(lines*1.08);frameTimes.length=0;}
}
function drawEditor(){
 const e=state.edit;
 const box=fitFrame($('editFrame'),$('editStage'),e.width/e.height);
 const dpr=Math.min(devicePixelRatio||1,3),h=Math.min(e.height,box.height*dpr,2048/Math.max(1,e.width/e.height),2048);
 setCanvasSize(h*e.width/e.height,h);
 const recipe=e.comparing?normalRecipe():e.recipe;
 dirty=!engine.draw(recipe,{source:'edit'});
 stampOverlay($('editFrame'),e.recipe.stamp&&!e.comparing,e.taken);
}
addEventListener('resize',invalidate);

// ---------- Camera ----------
const video=$('video');
if('requestVideoFrameCallback' in video){const tick=()=>{videoFresh=true;video.requestVideoFrameCallback(tick);};video.requestVideoFrameCallback(tick);}
let cameraStarts=0;
async function startCamera(){
 const c=state.camera;
 if(!navigator.mediaDevices?.getUserMedia){showWelcome('This browser does not offer a camera here. You can still edit photos.');return;}
 stopCamera();
 const start=++cameraStarts;
 try{
  const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:c.facing},width:{ideal:1920},height:{ideal:1440}}});
  // A later start (a second tap of Flip, leaving the camera) wins; this camera is turned off again.
  if(start!==cameraStarts||state.mode!=='camera'){stream.getTracks().forEach(t=>t.stop());return;}
  c.stream=stream;video.srcObject=stream;await video.play().catch(()=>{});
  const settings=stream.getVideoTracks()[0]?.getSettings?.()||{};
  c.mirror=settings.facingMode?settings.facingMode==='user':c.facing==='user'||!coarse;
  c.running=true;$('welcome').hidden=true;$('shutter').disabled=false;$('zoom').hidden=false;
  store.write({...store.read(),cameraAllowed:true});
  navigator.mediaDevices.enumerateDevices?.().then(d=>{$('flip').hidden=d.filter(x=>x.kind==='videoinput').length<2;}).catch(()=>{});
  refreshThumbs(true);schedule();
 }catch(err){
  if(start!==cameraStarts)return;
  c.running=false;
  showWelcome(err?.name==='NotAllowedError'?'The camera is not allowed for this page. Allow it in the browser’s settings, or edit a photo instead.'
   :err?.name==='NotFoundError'||err?.name==='OverconstrainedError'?'No camera was found. You can still edit photos.':'The camera could not start. You can still edit photos.');
 }
}
function stopCamera(){
 const c=state.camera;c.running=false;cameraStarts++;
 c.stream?.getTracks().forEach(t=>t.stop());c.stream=null;video.srcObject=null;
 $('shutter').disabled=true;
}
function showWelcome(note){
 $('welcome').hidden=false;$('zoom').hidden=true;$('shutter').disabled=true;
 if(note)$('welcomeNote').textContent=note;
 fitFrame($('cameraFrame'),$('cameraStage'),3/4);
}
$('startCamera').addEventListener('click',startCamera);
$('flip').addEventListener('click',()=>{
 const c=state.camera;c.facing=c.facing==='user'?'environment':'user';remember();
 $('cameraFrame').animate?.([{transform:'rotateY(0)'},{transform:'rotateY(90deg)',opacity:.3},{transform:'rotateY(0)'}],{duration:reduceMotion?1:420,easing:'ease-in-out'});
 startCamera();
});
function renderCameraChips(){
 const c=state.camera;
 $('timer').querySelector('span').textContent=c.timer?`${c.timer}s`:'Off';$('timer').classList.toggle('on',c.timer>0);
 $('timer').setAttribute('aria-label',`Self-timer: ${c.timer?`${c.timer} seconds`:'off'}`);
 $('ratio').querySelector('span').textContent=c.ratio;$('ratio').setAttribute('aria-label',`Picture shape: ${c.ratio}`);
 $('stamp').setAttribute('aria-pressed',String(c.recipe.stamp));
 $('zoom').textContent=`${c.zoom}×`;$('zoom').setAttribute('aria-label',`Zoom ${c.zoom}×`);
 stampOverlay($('cameraFrame'),c.recipe.stamp,new Date());
}
$('timer').addEventListener('click',()=>{const c=state.camera;c.timer=TIMERS[(TIMERS.indexOf(c.timer)+1)%TIMERS.length];renderCameraChips();remember();});
$('ratio').addEventListener('click',()=>{const c=state.camera;c.ratio=RATIOS[(RATIOS.indexOf(c.ratio)+1)%RATIOS.length];renderCameraChips();remember();refreshThumbs(true);});
$('stamp').addEventListener('click',()=>{const c=state.camera;c.recipe.stamp=!c.recipe.stamp;renderCameraChips();remember();toast(c.recipe.stamp?'Date stamp on':'Date stamp off');});
$('zoom').addEventListener('click',()=>{const c=state.camera;c.zoom=ZOOMS[(ZOOMS.indexOf(c.zoom)+1)%ZOOMS.length];renderCameraChips();refreshThumbs(true);});

// Swipe across the picture for the next Look; tap twice to turn the camera round.
function gestures(stage,{onDoubleTap}={}){
 let start=null,lastTap=0;
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;start={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};});
 stage.addEventListener('pointerup',e=>{
  if(!start||e.pointerId!==start.id)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y,dt=performance.now()-start.t;start=null;
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4&&dt<700){stepLook(dx<0?1:-1);return;}
  if(Math.hypot(dx,dy)<10&&dt<300){
   const now=performance.now();
   if(now-lastTap<320){lastTap=0;onDoubleTap?.();}else{lastTap=now;if(state.mode==='camera')showAmountRow(false);}
  }
 });
 stage.addEventListener('pointercancel',()=>{start=null;});
}
gestures($('cameraStage'),{onDoubleTap:()=>{if(state.camera.running&&!$('flip').hidden)$('flip').click();}});

// Taking a photo: the frame as it is now, at the camera's full detail, through the whole recipe.
$('shutter').addEventListener('click',()=>takePhoto());
async function takePhoto(){
 const c=state.camera;if(!c.running||c.busy||!engine||engine.lost())return;
 c.busy=true;$('shutter').classList.toggle('waiting',c.timer>0);
 try{
  for(let s=c.timer;s>0;s--){$('count').innerHTML=`<span>${s}</span>`;sound('count');await wait(1000);if(!c.running)return;}
  $('count').textContent='';
  const v=video,crop=cameraCrop(),pw=crop.w*v.videoWidth,ph=crop.h*v.videoHeight,size=exportSize(pw,ph,Math.min(4096,engine.maxTexture));
  const still=document.createElement('canvas');still.width=size.width;still.height=size.height;
  const g=still.getContext('2d');
  if(c.mirror){g.translate(size.width,0);g.scale(-1,1);}
  g.drawImage(v,crop.x*v.videoWidth,crop.y*v.videoHeight,pw,ph,0,0,size.width,size.height);
  sound('shutter');flash();
  await nextFrame();
  const taken=new Date(),recipe=normalRecipe(c.recipe);
  engine.setSource('still',still,size.width,size.height);
  let finished;
  try{finished=await finishPhoto(engine.render(recipe,{source:'still',width:size.width,height:size.height}),recipe,taken);}
  finally{engine.dropSource('still');}
  const {photo,thumb}=finished,source=await toBlob(still,'image/jpeg',.92);still.width=still.height=0;
  flyToRoll(photo);
  await keep({photo,source,thumb,recipe,width:size.width,height:size.height,taken:taken.getTime()});
 }catch(err){console.error(err);toast('The photo could not be saved');}
 finally{c.busy=false;$('shutter').classList.remove('waiting');$('count').textContent='';}
}
function flash(){const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');}
function flyToRoll(blob){
 if(reduceMotion)return;
 const from=$('cameraFrame').getBoundingClientRect(),to=$('roll').getBoundingClientRect();
 const img=new Image();img.className='flyer';img.src=URL.createObjectURL(blob);
 Object.assign(img.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`});
 document.body.append(img);
 const a=img.animate([{transform:'none',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:.9}],{duration:520,easing:'cubic-bezier(.5,0,.2,1)'});
 a.onfinish=()=>{img.remove();URL.revokeObjectURL(img.src);};
}

// ---------- Finishing a photo ----------
const toBlob=(c,type,q)=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Encoding failed')),type,q));
/** Pixels from the engine to a JPEG and its album thumbnail: the stickers stuck on, then the date if asked. */
async function finishPhoto(pixels,recipe,date){
 const c=document.createElement('canvas');c.width=pixels.width;c.height=pixels.height;
 const g=c.getContext('2d');g.putImageData(new ImageData(pixels.data,pixels.width,pixels.height),0,0);
 const missing=await drawStickers(g,c.width,c.height,recipe.stickers);
 if(missing)toast(missing===1?'A sticker could not be loaded and is left off':`${missing} stickers could not be loaded and are left off`,{ms:2600});
 if(recipe.stamp)printStamp(g,c.width,c.height,date);
 try{
  const photo=await toBlob(c,'image/jpeg',.92);
  const s=Math.min(c.width,c.height),t=document.createElement('canvas');t.width=t.height=320;
  t.getContext('2d').drawImage(c,(c.width-s)/2,(c.height-s)/2,s,s,0,0,320,320);
  return {photo,thumb:await toBlob(t,'image/jpeg',.8)};
 }finally{c.width=c.height=0;}
}
function printStamp(g,w,h,date){
 const size=h*.045,text=dateStamp(date);
 g.save();g.font=`700 ${size}px "Courier New",ui-monospace,monospace`;g.textAlign='right';g.textBaseline='bottom';
 if('letterSpacing' in g)g.letterSpacing=`${size*.06}px`;
 const x=w-w*.035,y=h-h*.03;
 g.fillStyle='rgba(0,0,0,.75)';g.shadowColor='rgba(0,0,0,.85)';g.shadowBlur=size*.16;g.shadowOffsetY=size*.08;g.fillText(text,x,y);
 g.shadowColor='rgba(255,120,30,.55)';g.shadowBlur=size*.5;g.shadowOffsetY=0;g.fillStyle='#ff9a3c';g.fillText(text,x,y);
 g.restore();
}
/** Any picture file to something the engine can read, the right way up, no larger than a save may be. */
async function decode(blob){
 let picture,width,height;
 try{picture=await createImageBitmap(blob,{imageOrientation:'from-image'});width=picture.width;height=picture.height;}
 catch{
  const url=URL.createObjectURL(blob);
  try{
   // Drawn through a canvas, which applies the photo's orientation; the image itself might reach WebGL unturned.
   const img=new Image();img.src=url;await img.decode();width=img.naturalWidth;height=img.naturalHeight;
   picture=document.createElement('canvas');picture.width=width;picture.height=height;picture.getContext('2d').drawImage(img,0,0);
  }finally{URL.revokeObjectURL(url);}
 }
 const fit=exportSize(width,height,Math.min(4096,engine?.maxTexture||4096));
 if(fit.width!==width){
  const c=document.createElement('canvas');c.width=fit.width;c.height=fit.height;
  const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(picture,0,0,fit.width,fit.height);
  picture.close?.();picture=c;width=fit.width;height=fit.height;
 }
 return {picture,width,height,close:()=>picture.close?.()};
}

// ---------- Album ----------
let albumOK=true;
async function loadShots(){
 try{state.shots=await listShots();}catch{albumOK=false;state.shots=[];}
 if(state.shots.length)keepAlbum();
 renderRoll();
}
async function keep(shot){
 if(!albumOK){offerFile(shot.photo);return null;}
 try{const r=await addShot(shot);state.shots.unshift(r);renderRoll(true);keepAlbum();return r;}
 catch{albumOK=false;offerFile(shot.photo);return null;}
}
let rollURL;
function renderRoll(pop=false){
 const img=$('roll').querySelector('img'),latest=state.shots[0];
 if(rollURL)URL.revokeObjectURL(rollURL);rollURL=null;
 if(latest){rollURL=URL.createObjectURL(latest.thumb||latest.photo);img.src=rollURL;img.hidden=false;}else img.hidden=true;
 $('roll').setAttribute('aria-label',`Album, ${state.shots.length} ${state.shots.length===1?'photo':'photos'}`);
 if(pop){const r=$('roll');r.classList.remove('pop');void r.offsetWidth;r.classList.add('pop');}
}
let gridURLs=[];
function renderGrid(){
 gridURLs.forEach(u=>URL.revokeObjectURL(u));gridURLs=[];
 const grid=$('grid');grid.textContent='';
 for(const shot of state.shots){
  const b=document.createElement('button');b.type='button';b.dataset.id=shot.id;
  const url=URL.createObjectURL(shot.thumb||shot.photo);gridURLs.push(url);
  b.setAttribute('aria-label',`Photo, ${mixLabel(normalRecipe(shot.recipe))}, ${new Date(shot.taken||shot.created).toLocaleString()}`);
  b.innerHTML=`<img src="${url}" alt="" loading="lazy" decoding="async">`;grid.append(b);
 }
 $('albumEmpty').hidden=state.shots.length>0;
 $('albumNote').textContent=albumOK?(state.shots.length?`${state.shots.length} ${state.shots.length===1?'photo':'photos'} · kept in this browser on this device`:''):'This browser does not keep an album here; photos are offered as files instead.';
}
$('grid').addEventListener('click',e=>{const b=e.target.closest('button');if(b)openViewer(b.dataset.id);});

function show(mode){
 state.mode=mode;
 for(const id of ['camera','editor','album','viewer'])$(id).hidden=id!==mode;
 if(mode==='camera'){$('cameraDock').prepend(tray);placeCanvas($('cameraFrame'));}
 if(mode==='editor'){$('panelLooks').append(tray);placeCanvas($('editFrame'));$('panelStickers').append($('stickerPicker'));}
 if(mode==='camera'||mode==='editor'){buildTrayFor();}
 if(mode==='camera'){renderCameraChips();if(!state.camera.running)maybeStartCamera();else{refreshThumbs(true);schedule();}}
 else if(state.camera.running)stopCamera();
 invalidate();
}
function buildTrayFor(){
 showAmountRow(state.mode==='editor');
 for(const t of tiles.values()){t.drawn=false;t.canvas.classList.remove('drawn');}
 trayChanged({thumbs:true,scroll:false});requestAnimationFrame(()=>renderStripSelection());
}
async function maybeStartCamera(){
 let granted=false;
 try{granted=(await navigator.permissions?.query({name:'camera'}))?.state==='granted';}catch{}
 if(granted||store.read().cameraAllowed&&!coarse)startCamera();else showWelcome();
}
$('roll').addEventListener('click',openAlbum);
function openAlbum(){show('album');renderGrid();}
$('closeAlbum').addEventListener('click',()=>show('camera'));

let viewerURL;
async function openViewer(id){
 const shot=state.shots.find(s=>s.id===id)||await getShot(id).catch(()=>null);if(!shot)return;
 state.viewing=shot;show('viewer');
 if(viewerURL)URL.revokeObjectURL(viewerURL);viewerURL=URL.createObjectURL(shot.photo);
 const img=$('viewerImage');img.src=viewerURL;img.alt=`Photo in ${mixLabel(normalRecipe(shot.recipe))}`;
 $('viewerTitle').textContent=new Date(shot.taken||shot.created).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
 $('sharePhoto').querySelector('span').textContent=canShareFiles()?'Share':'Download';
 $('sharePhoto').querySelector('use').setAttribute('href',canShareFiles()?'#i-share':'#i-download');
}
$('closeViewer').addEventListener('click',openAlbum);
function canShareFiles(){try{return !!navigator.canShare?.({files:[new File([new Blob()],'x.jpg',{type:'image/jpeg'})]});}catch{return false;}}
function fileName(shot){const d=new Date(shot?.taken||Date.now());return `pocket-camera-${d.toISOString().slice(0,19).replace(/[:T]/g,'-')}.jpg`;}
async function sharePhoto(shot){
 const file=new File([shot.photo],fileName(shot),{type:'image/jpeg'});
 if(canShareFiles()){try{await navigator.share({files:[file],title:'Pocket Camera'});}catch(err){if(err?.name!=='AbortError')download(file);}return;}
 download(file);
}
function download(file){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
function offerFile(blob){download(new File([blob],fileName(),{type:'image/jpeg'}));toast('Saved as a file');}
$('sharePhoto').addEventListener('click',()=>state.viewing&&sharePhoto(state.viewing));
$('editPhoto').addEventListener('click',async()=>{
 const shot=state.viewing;if(!shot)return;
 const picture=await decode(shot.source||shot.photo);
 openEditor({...picture,recipe:shot.source?shot.recipe:normalRecipe(),shotId:shot.id,taken:new Date(shot.taken||shot.created),sourceBlob:shot.source||shot.photo});
});
$('deletePhoto').addEventListener('click',()=>{
 const sheet=$('deleteSheet');
 sheet.onclose=async()=>{
  if(sheet.returnValue!=='delete'||!state.viewing)return;
  const id=state.viewing.id;await deleteShot(id).catch(()=>{});
  state.shots=state.shots.filter(s=>s.id!==id);state.viewing=null;renderRoll();openAlbum();toast('Photo deleted');
 };
 sheet.returnValue='';sheet.showModal();
});

// ---------- Editor ----------
function pickPhoto(){$('picker').value='';$('picker').click();}
for(const id of ['import','welcomeImport','albumImport','emptyImport'])$(id).addEventListener('click',pickPhoto);
$('picker').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(file)await editFile(file);
});
async function editFile(file){
 if(!file.type.startsWith('image/')&&!/\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.name)){toast('That is not a picture');return;}
 try{
  const picture=await decode(file);
  const recipe=normalRecipe({layers:state.camera.recipe.layers,stamp:false});
  const sourceBlob=picture.picture instanceof HTMLCanvasElement?await toBlob(picture.picture,'image/jpeg',.92):file;
  openEditor({...picture,recipe,shotId:null,taken:new Date(file.lastModified||Date.now()),sourceBlob});
 }catch{toast('That picture could not be opened');}
}
function openEditor({picture,width,height,recipe,shotId,taken,sourceBlob}){
 if(!engine)return;
 state.edit?.picture?.close?.();
 state.edit={picture,width,height,recipe:normalRecipe(recipe),active:0,shotId,taken,sourceBlob,comparing:false,adjust:'light',from:state.mode};
 engine.setSource('edit',picture,width,height);
 show('editor');selectTab('looks');renderAdjusters();renderEditChips();editStickers.select(null);
 if(state.edit.recipe.stickers.length)loadStickerSets().then(()=>editStickers.render()).catch(()=>{});
}
function closeEditor(){
 if(state.edit?.saving)return;
 const from=state.edit?.from;engine?.dropSource('edit');state.edit?.picture?.close?.();state.edit=null;
 if(from==='viewer'&&state.viewing)openViewer(state.viewing.id);else if(from==='album')openAlbum();else show('camera');
}
$('cancelEdit').addEventListener('click',closeEditor);
function renderEditChips(){$('editStamp').setAttribute('aria-pressed',String(state.edit.recipe.stamp));}
$('editStamp').addEventListener('click',()=>{const e=state.edit;e.recipe.stamp=!e.recipe.stamp;renderEditChips();invalidate();});
$('saveEdit').addEventListener('click',async()=>{
 const e=state.edit;if(!e||e.saving)return;
 const button=$('saveEdit');e.saving=true;button.disabled=true;$('cancelEdit').disabled=true;button.textContent='Saving…';await nextFrame();
 try{
  const recipe=normalRecipe(e.recipe);
  const {photo,thumb}=await finishPhoto(engine.render(recipe,{source:'edit',width:e.width,height:e.height}),recipe,e.taken);
  let shot;
  if(e.shotId&&albumOK){shot=await updateShot(e.shotId,{photo,thumb,recipe});state.shots=state.shots.map(s=>s.id===shot.id?shot:s);renderRoll();}
  else shot=await keep({photo,source:e.sourceBlob,thumb,recipe,width:e.width,height:e.height,taken:e.taken.getTime()});
  engine.dropSource('edit');e.picture?.close?.();state.edit=null;
  if(shot){state.viewing=shot;openViewer(shot.id);toast('Saved to the album');}else show('camera');
 }catch(err){console.error(err);toast('The photo could not be saved');}
 finally{e.saving=false;button.disabled=false;$('cancelEdit').disabled=false;button.textContent='Save';}
});
// Hold the picture to see the original.
{
 const stage=$('editStage');let holding=null,at=null;
 const end=()=>{clearTimeout(holding);holding=null;if(state.edit?.comparing){state.edit.comparing=false;$('original').hidden=true;editStickers.hidden=false;invalidate();}};
 stage.addEventListener('pointerdown',e=>{
  if(!state.edit||e.target.closest('button'))return;
  at={x:e.clientX,y:e.clientY};
  holding=setTimeout(()=>{if(!state.edit)return;state.edit.comparing=true;$('original').hidden=false;editStickers.hidden=true;invalidate();},140);
 });
 // A swipe is not a hold.
 stage.addEventListener('pointermove',e=>{if(holding&&at&&Math.hypot(e.clientX-at.x,e.clientY-at.y)>10){clearTimeout(holding);holding=null;}});
 for(const type of ['pointerup','pointercancel','pointerleave'])stage.addEventListener(type,end);
 gestures(stage);
}
function selectTab(tab){
 for(const [id,panel,name] of [['tabLooks','panelLooks','looks'],['tabAdjust','panelAdjust','adjust'],['tabStickers','panelStickers','stickers']]){
  $(id).setAttribute('aria-selected',String(tab===name));$(panel).hidden=tab!==name;
 }
 if(tab==='looks')requestAnimationFrame(()=>renderStripSelection());
 if(tab==='stickers')renderStickerPicker();
}
$('tabLooks').addEventListener('click',()=>selectTab('looks'));
$('tabAdjust').addEventListener('click',()=>selectTab('adjust'));
$('tabStickers').addEventListener('click',()=>selectTab('stickers'));

// ---------- Stickers ----------
const cameraStickers=createStickerLayer($('cameraFrame'),{list:()=>state.camera.recipe.stickers,changed:remember});
const editStickers=createStickerLayer($('editFrame'),{list:()=>state.edit?.recipe.stickers||[],changed:()=>{}});
const stickerLayer=()=>state.mode==='editor'?editStickers:state.mode==='camera'?cameraStickers:null;
let stickerSet=0;
async function renderStickerPicker(){
 const grid=$('stickerGrid'),sets=$('stickerSets');
 let manifest;
 try{manifest=await loadStickerSets();}catch{grid.innerHTML='<p class="fine">The stickers could not be loaded.</p>';return;}
 sets.textContent='';
 manifest.sets.forEach((set,i)=>{
  const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=set.name;
  b.setAttribute('aria-selected',String(i===stickerSet));b.addEventListener('click',()=>{stickerSet=i;renderStickerPicker();grid.scrollTo?.({left:0,top:0});});
  sets.append(b);
 });
 grid.textContent='';
 for(const s of manifest.sets[stickerSet].stickers){
  const b=document.createElement('button');b.type='button';b.className='sticker-choice';b.dataset.id=s.id;
  b.setAttribute('aria-label',`${stickerLabel(s)}${s.line?` (${s.line})`:''}`);b.title=s.gloss?`${s.line} · ${s.gloss}`:s.line||'';
  b.innerHTML=`<img src="${s.thumbUrl}" alt="" loading="lazy" decoding="async" width="${Math.round(256*s.width/Math.max(s.width,s.height))}" height="${Math.round(256*s.height/Math.max(s.width,s.height))}">`;
  grid.append(b);
 }
}
$('stickerGrid').addEventListener('click',e=>{
 const b=e.target.closest('.sticker-choice');if(!b)return;
 sound('tick');stickerLayer()?.add(b.dataset.id);
 if(state.mode==='camera')$('stickerSheet').close();
});
function openStickerSheet(){
 const sheet=$('stickerSheet');sheet.append($('stickerPicker'));renderStickerPicker();sheet.showModal();
}
$('stickerSheet').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
function renderAdjusters(){
 const e=state.edit,box=$('adjusters');box.textContent='';
 for(const a of ADJUSTMENTS){
  const v=e.recipe.adjust[a.key],b=document.createElement('button');b.type='button';b.className=`adjuster${v<0?' neg':''}${v?' changed':''}`;b.dataset.key=a.key;
  b.setAttribute('role','radio');b.setAttribute('aria-checked',String(e.adjust===a.key));b.title=a.hint||a.label;
  b.style.setProperty('--v',String(Math.abs(v)*(v<0?-1:1)));
  b.innerHTML=`<i>${icon(a.icon)}</i><span>${a.label}</span>`;
  b.addEventListener('click',()=>{if(e.adjust===a.key&&v!==0){setAdjust(0);}else{e.adjust=a.key;renderAdjusters();}});
  box.append(b);
 }
 const s=$('adjustSlider'),v=Math.round(e.recipe.adjust[e.adjust]*100),info=ADJUSTMENTS.find(a=>a.key===e.adjust);
 s.value=v;s.setAttribute('aria-label',info.label);$('adjustValue').textContent=v>0?`+${v}`:v;
 s.classList.add('centred');s.style.setProperty('--from',`${Math.min(50,50+v/2)}%`);s.style.setProperty('--to',`${Math.max(50,50+v/2)}%`);
}
function setAdjust(value){const e=state.edit;e.recipe.adjust[e.adjust]=value;renderAdjusters();refreshThumbs();invalidate();}
$('adjustSlider').addEventListener('input',ev=>{
 let v=+ev.target.value;if(Math.abs(v)<3)v=0;
 state.edit.recipe.adjust[state.edit.adjust]=v/100;renderAdjusters();invalidate();
});
$('adjustSlider').addEventListener('change',()=>refreshThumbs(true));
$('adjustSlider').addEventListener('dblclick',()=>setAdjust(0));

// ---------- Keys, drops, the page coming and going ----------
addEventListener('keydown',e=>{
 if(e.target.closest?.('input,textarea,select,dialog'))return;
 const layer=stickerLayer();
 if(layer?.selected!=null){
  const step=e.shiftKey?.05:.01,move={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();layer.remove();return;}
  if(e.key==='Escape'){e.preventDefault();layer.select(null);return;}
  if(move){e.preventDefault();layer.nudge(...move);return;}
 }
 if(state.mode==='camera'){
  if((e.key===' '||e.key==='Enter')&&!e.target.closest?.('button,a')){e.preventDefault();takePhoto();}
  else if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.target.closest?.('.strip')){e.preventDefault();stepLook(e.key==='ArrowRight'?1:-1);}
 }else if(e.key==='Escape'){
  if(state.mode==='editor')closeEditor();else if(state.mode==='viewer')openAlbum();else if(state.mode==='album')show('camera');
 }else if(state.mode==='editor'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.target.closest?.('.strip')){e.preventDefault();stepLook(e.key==='ArrowRight'?1:-1);}
});
addEventListener('dragover',e=>{if([...e.dataTransfer?.items||[]].some(i=>i.kind==='file'))e.preventDefault();});
addEventListener('drop',e=>{const f=[...e.dataTransfer?.files||[]].find(f=>f.type.startsWith('image/'));if(f){e.preventDefault();editFile(f);}});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(state.camera.running){stopCamera();state.camera.resume=true;}}
 else if(state.camera.resume&&state.mode==='camera'){state.camera.resume=false;startCamera();}
});
new ResizeObserver(invalidate).observe(document.body);

// ---------- Start ----------
if(!startEngine()){
 showWelcome();
 $('welcome').querySelector('p').textContent='Pocket Camera needs WebGL 2, which this browser does not offer.';
 $('welcome').querySelector('.welcome-actions').hidden=true;$('welcomeNote').hidden=true;
}else{
 buildStrip();show('camera');loadShots();cameraStickers.render();
 // The camera's stickers need their pictures before they can show.
 if(state.camera.recipe.stickers.length)loadStickerSets().then(()=>cameraStickers.render()).catch(()=>{});
}
// For the browser checks (camera/tests/camera.browser.mjs).
window.pocketCamera={state,editFile,takePhoto,startCamera,get engine(){return engine;},chooseLook,addLayer,shuffle,cameraStickers,editStickers};
