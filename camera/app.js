/**
 * Pocket Camera: a camera and a photo editor for every Look in Johansson World (looks-gl.js), alone or stacked up to
 * three deep. Everything happens on this device: the camera picture never leaves it, and saved photos live in the
 * browser's own storage (album.js) until shared.
 */
import {createLookEngine,LOOKS,LOOK_NAMES,TRICKS,PAPERS,normalRecipe,exportSize,MAX_SIDE} from './looks-gl.js?v=20261110green1';
import {familyFor,hasScreen,hasLookSettings,variantFor,selectVariant,normalScreen,screenDefaults,familyTileVisible} from './look-settings.js?v=20261101screen1';
import {normalCrop,cropAtAspect,cropZoom,bindCropGestures} from './crop.js?v=20261030crop1';
import {listShots,getShot,addShot,deleteShot,keepAlbum,ensureAlbumSamples,listMine,addMine,deleteMine} from './album.js?v=20261102fun1';
import {lookIcon} from './look-icons.js?v=20261104fx1';
import {prepareOffline} from './offline.js?v=20261105games1';
import {MIXES,measureImage,photoCandidates,scorePhoto,choosePhotoCandidate} from './smart-shuffle.js?v=20261031retouch1';
import {loadStickerSets,stickerLabel,stickerById,registerSticker,forgetSticker,createStickerLayer,drawStickers} from './stickers.js?v=20261110green1';
import {makeSticker} from './cutout.js?v=20261031-contour1';
import {FRAMES,drawFrame,frameInner} from './frames.js?v=20261110green1';
import {BALLOONS,SOUND_EFFECTS,balloonCanvas,loadLetteringFont} from './lettering.js?v=20261029t';
import {EFFECTS,effectPreview} from './effects.js?v=20261029b';
import {createEraser} from './erase.js?v=20261104ui1';
import {normaliseMakeup,applyMakeup,makeupActive,makeupPixels,makeupFaces,faceCrop,facesInCrop,prepareMakeup,makeupSourcePixels,MAKEUP_LOOKS,MAKEUP_SHADES} from './makeup.js?v=20261104ui1';
import {createMakeupGuide} from './makeup-guide.js?v=20261104ui1';
import {createPrinter} from './printer.js?v=20261030share1';
import {normaliseStamps,stampsActive,stampsLabel,characterOf,characterStamps,CHARACTERS,drawFaceStamps,loadStampImages,stampImages,hatChoices,partPreview,moodLabel,BROW_STYLES,BROW_LABELS,BROW_COLOURS,EYE_STYLES,EYE_COLOURS} from './face-stamps.js?v=20261104ui1';
import {createMemory} from './memory.js?v=20261110green1';
import {cardView,shuffleDeck} from './playing-cards.js?v=20261029b';
import {createBlackjack} from './blackjack.js?v=20261110green1';
import {createSolitaire} from './solitaire.js?v=20261110green1';
import {makeBackup,restoreBackup,albumStorage,formatBytes} from './backup.js?v=20261102fun1';
import {createZoomView,viewZoom,viewDetail} from './zoom-view.js?v=20261104ui1';
import {findFaces,findPerson,guideFromFace,syncFaceToGuide,warmFacePack} from './face-pack.js?v=20261104ui1';
import {findBackground,applyMask,maskDataURL,maskFromBlob} from './background.js?v=20261110green1';
import {autoLevels} from './auto.js?v=20261104ui1';
import {recordWin,isUnlocked,unlockHint} from './unlocks.js?v=20261105fun1';
import {pocketFace,errorFace} from './pocket-faces.js?v=20261105fun1';

const $=id=>document.getElementById(id);
const coarse=matchMedia('(pointer:coarse)').matches;
const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
const SETTINGS_KEY='office-pocket-camera';
const MAX_LAYERS=3;
const RATIOS=['4:3','1:1','16:9'],TIMERS=[0,3,10],ZOOMS=[1,2,3];
// The dice's mixes, chosen by eye on a real photo and on the town (as the hand-held cameras' lenses were chosen, not
// drawn at random): each a base and a Look over it, with its name. Pairs that came out as noise or mush were left out:
// Crayon or Riso over ink, Miniature over Pocket's pixels, Stamp over Sepia, Heavy brush through the TV.
// What "Mix" puts over a Look first: its partner from a mix above, or one that reads well over most.
const FINISHERS=['crt','tilt','riso','manga','lines','sepia','mono','stamp'];
const ADJUSTMENTS=[
 {key:'light',label:'Light',icon:'light'},{key:'contrast',label:'Contrast',icon:'contrast'},{key:'colour',label:'Colour',icon:'colour'},
 {key:'warmth',label:'Warmth',icon:'warmth'},{key:'pattern',label:'Pattern',icon:'pattern',hint:'The size of dots, strokes and lines'},
 {key:'detail',label:'Detail',icon:'detail',hint:'How many lines the drawn Looks ink: fewer and bolder, or more'},
];
const TRICK_LABELS={none:'Off',twin:'Twin',quad:'Quad'};
const THUMB=144;

const store={
 read(){try{return JSON.parse(localStorage.getItem(SETTINGS_KEY))||{};}catch{return {};}},
 write(v){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(v));}catch{}},
};
const saved=store.read();

// The camera opens with no Look (the owner, 3 November 2026: "Default to no filter"). A Look chosen later is remembered
// (remember() marks the recipe as kept); the old default, Pocket, stored by an earlier release without that mark, is
// the default again.
const oldDefault=r=>r?.layers?.length===1&&r.layers[0]?.look==='pocket'&&!(r.stickers?.length);
const startRecipe=saved.recipe&&!(oldDefault(saved.recipe)&&!saved.kept)?saved.recipe:{layers:[{look:'none',amount:1}]};
const state={
 mode:'camera',
 camera:{recipe:normalRecipe(startRecipe),active:0,ratio:RATIOS.includes(saved.ratio)?saved.ratio:'4:3',
  timer:TIMERS.includes(saved.timer)?saved.timer:0,zoom:1,facing:saved.facing==='user'?'user':'environment',mirror:false,stream:null,running:false,busy:false},
 edit:null,
 shots:[],viewing:null,
 sound:saved.sound!==false,
 // Printing belongs to Share; saving a photo goes straight to the app's album.
 printer:saved.printer!==false,
 auto:saved.auto!==false,
 // Appearance: 'auto' follows the device's light or dark; 'light' and 'dark' are pinned.
 theme:saved.theme==='light'||saved.theme==='dark'?saved.theme:'auto',
};
state.camera.recipe.stamp=!!saved.stamp;
const current=()=>state.mode==='editor'?state.edit:state.camera;
function remember(){
 const c=state.camera,r=c.recipe;
 store.write({...store.read(),recipe:{layers:r.layers,stickers:r.stickers,adjust:{light:r.adjust.light},frame:r.frame,trick:r.trick,paper:r.paper},kept:true,ratio:c.ratio,timer:c.timer,stamp:r.stamp,facing:c.facing,sound:state.sound,auto:state.auto,printer:state.printer,theme:state.theme});
}

// ---------- The engine and its canvas ----------
const canvas=document.createElement('canvas');
canvas.setAttribute('aria-label','Viewfinder');
let engine=null;
let smartTask=null;
function startEngine(){
 try{engine=createLookEngine(canvas,{light:coarse});engine.warm(['instant','mono',...LOOK_NAMES]);return true;}
 catch{engine=null;return false;}
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();setShutter('off');$('saveEdit').disabled=true;toast('Graphics restarted',{face:errorFace(),ms:2200});});
canvas.addEventListener('webglcontextrestored',()=>{
 startEngine();
 if(state.edit){state.edit.makeupDirty=true;updateEditSource();}
 setShutter(state.camera.running?'shoot':$('welcome').hidden||!canStart()?'off':'start');$('saveEdit').disabled=false;refreshThumbs(true);
 invalidate();
});

// ---------- Small helpers ----------
let toastTimer,toastSerial=0;
/** A message for a moment; with `face`, one of the Pocket faces beside it (pocket-faces.js), as the Game Boy Camera met
 * an error with a scribbled face. */
function toast(text,{look=false,ms=1400,face=null}={}){
 // On the idle camera (the welcome) the dock is away, so the message sits at the top of the welcome.
 const t=$('toast'),screen=$(state.mode),host=state.mode==='editor'?$('editDock'):state.mode==='camera'?($('camera').classList.contains('idle')?$('welcome'):$('cameraDock')):screen;
 if(host&&t.parentElement!==host)host.prepend(t);
 t.textContent=text;t.classList.toggle('look',look);t.classList.toggle('has-face',!!face);t.classList.add('show');
 const serial=++toastSerial;
 if(face)pocketFace(face).then(f=>{if(!f||serial!==toastSerial)return;const img=document.createElement('img');img.className='toast-face';img.src=f.url;img.alt=f.alt;img.decoding='async';t.prepend(img);});
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),ms);
}
/** A Pocket face saying its own line. */
function sayFace(kind,{ms=2600}={}){pocketFace(kind).then(f=>{if(f)toast(f.line,{face:kind,ms});});}
const lookLabel=name=>LOOKS[name]?.short||name;
const mixLabel=recipe=>recipe.layers.map(l=>lookLabel(l.look)).join(' + ');
/*
 * The Looks in kinds, so the strip shows a few at a time (the owner, 29 October 2026: "make sub menu organisation so it
 * doesn't feel cluttered like game consoles can stay with each other and vhs for 80's or so"). A Look World adds later
 * and no kind names goes under More.
 */
const LOOK_GROUPS=(()=>{
 const groups=[
  {id:'photo',label:'Photo',looks:['none','mono','sepia','negative','instant','tilt','nightVision']},
  // Pop and Comic (the owner, 4 November 2026: Looks that make a picture "really funny or pop, or look like a real
  // manga or a cartoon or a comic book"); Comic dots moved from Drawn to sit with the comics.
  {id:'pop',label:'Pop',looks:['popArt','poster','neon','thermal','funhouse']},
  {id:'games',label:'Games',looks:['pocket','colourHandheld','redVisor','eightBit','snes','thirtyTwoBit','sixtyFourBit']},
  {id:'80s',label:'80s',looks:['crt','camcorder']},
  {id:'drawn',label:'Drawn',looks:['lines','sketchbook','crayon','pencilManga','manga','flat','adventureInk']},
  {id:'comic',label:'Comic',looks:['halftone','goldenAge','actionManga','oldCartoon']},
  {id:'painted',label:'Painted',looks:['watercolour','oil','brushOil']},
  {id:'print',label:'Print',looks:['print','stamp','cyanotype']},
  {id:'riso',label:'Riso',looks:['riso','risoPinkBlue','risoRedNavy','risoBlackPink','risoThree']},
 ].map(g=>({...g,looks:g.looks.filter(n=>LOOK_NAMES.includes(n))}));
 const placed=new Set(groups.flatMap(g=>g.looks)),more=LOOK_NAMES.filter(n=>!placed.has(n));
 if(more.length)groups.push({id:'more',label:'More',looks:more});
 return groups;
})();
const groupOf=name=>LOOK_GROUPS.find(g=>g.looks.includes(name))||LOOK_GROUPS[0];
/** Every Look in the order of its kind: the strip's order and a swipe's. */
const offered=()=>LOOK_GROUPS.flatMap(g=>g.looks).filter(n=>!engine?.failed(n));
// The kind the strip shows: the chosen Look's, until another kind is tapped.
let shownGroup=null;
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
 if(!state.sound)return;
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
  else if(kind==='flip')burst(0,.03,1500,.16);
  else if(kind==='feed'){burst(0,.035,1700,.07);const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=118;g.gain.setValueAtTime(.025,t);g.gain.exponentialRampToValueAtTime(.0001,t+.04);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.045);}
  else if(kind==='tear'){burst(0,.05,2400,.32);burst(.04,.08,1300,.28);}
  else if(kind==='nope'||kind==='win'){
   // A soft falling pair for a miss; a rising arpeggio for the last pair found.
   const notes=kind==='nope'?[[0,330],[.09,247]]:[[0,523],[.09,659],[.18,784],[.27,1047]];
   for(const [at,f] of notes){const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t+at);g.gain.exponentialRampToValueAtTime(kind==='nope'?.07:.12,t+at+.015);g.gain.exponentialRampToValueAtTime(.0001,t+at+(kind==='nope'?.16:.3));o.connect(g).connect(audio.destination);o.start(t+at);o.stop(t+at+.32);}
  }
  else if(kind==='pop'){
   // A small rising blip, for a sticker stuck on.
   const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(980,t+.07);
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.16,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.13);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.14);
  }
 }catch{}
 if(!['tick','feed','flip'].includes(kind))navigator.vibrate?.(kind==='shutter'?12:6);
}

// The optional printer animation accompanies Share, without delaying the phone's share sheet.
const printer=createPrinter({sound,reduceMotion});

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
/* Compact cameras fold the Look catalogue behind the selected icon. The rail and controls stay outside
 * the picture; wide windows keep the catalogue beside it. Rendering quality is shared by every layout. */
let trayBelow=139;
function compactCamera(aspect){
 const cam=$('camera'),stage=$('cameraStage');
 const on=state.mode==='camera'&&!wide.matches&&!cam.classList.contains('idle');
 if(on&&!cam.classList.contains('compact'))trayBelow=tray.offsetHeight||trayBelow;
 const full=stage.clientHeight+(cam.classList.contains('compact')?0:tray.offsetHeight);
 const compact=on&&full-trayBelow<stage.clientWidth/aspect-1;
 if(compact!==cam.classList.contains('compact')){cam.classList.toggle('compact',compact);if(!compact)showLooks(false);}
}
const isCompact=()=>$('camera').classList.contains('compact');
/** Unfolds or folds the compact camera catalogue. */
function showLooks(open){
 const cam=$('camera');if(cam.classList.contains('looks-open')===open)return;
 cam.classList.toggle('looks-open',open);
 if(open){showAmountRow(false);renderStripSelection();refreshThumbs(true);}
}
function setCanvasSize(w,h){w=Math.max(1,Math.round(w));h=Math.max(1,Math.round(h));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}}
function placeCanvas(frame){if(canvas.parentElement!==frame)frame.prepend(canvas);frameArt(frame).key='';}
/** The frame over the picture (frames.js), drawn at the screen's detail; only again when the frame or the size changes. */
function frameArt(frame){
 let art=frame.querySelector('canvas.frame-art');
 if(!art){art=document.createElement('canvas');art.className='frame-art';art.setAttribute('aria-hidden','true');}
 if(art.previousElementSibling!==canvas&&canvas.parentElement===frame)canvas.after(art);else if(!art.parentElement)frame.prepend(art);
 return art;
}
function paintFrame(frame,id,hide=false){
 const art=frameArt(frame),w=frame.clientWidth,h=frame.clientHeight,dpr=viewDetail(frame,Math.min(3,devicePixelRatio||1));
 art.hidden=hide||id==='none';
 const key=`${id}|${w}|${h}|${dpr}`;
 if(art.hidden||art.key===key)return;
 art.key=key;art.width=Math.max(1,Math.round(w*dpr));art.height=Math.max(1,Math.round(h*dpr));
 const g=art.getContext('2d');g.clearRect(0,0,art.width,art.height);drawFrame(g,id,art.width,art.height);
}
/** The date in the picture's own corner, inside any frame, the size the save prints it. */
function stampOverlay(frame,on,date,frameId='none'){
 let el=frame.querySelector('.date-stamp');
 if(!on){el?.remove();return;}
 if(!el){el=document.createElement('time');el.className='date-stamp';frame.append(el);}
 const w=frame.clientWidth,h=frame.clientHeight,inner=frameInner(frameId,w,h);
 el.style.right=`${w-inner.x-inner.w+inner.w*.035}px`;el.style.bottom=`${h-inner.y-inner.h+inner.h*.03}px`;el.style.fontSize=`${inner.h*.045}px`;
 el.textContent=dateStamp(date);el.dateTime=date.toISOString().slice(0,10);
}

// ---------- The Look tray ----------
const tray=$('tray'),strip=$('strip'),layersEl=$('layers');
const tiles=new Map();
const GROUP_GLYPHS={
 photo:'M4 6h4l2-2h4l2 2h4v14H4z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
 pop:'M22 12l-4 2.5 1.1 4.6-4.6-1.1L12 22l-2.5-4-4.6 1.1 1.1-4.6L2 12l4-2.5-1.1-4.6 4.6 1.1L12 2l2.5 4 4.6-1.1-1.1 4.6z',
 comic:'M3 4h18v12h-8l-5 4v-4H3z M8 10h.01M12 10h.01M16 10h.01',
 games:'M6 6h12l4 12-3 2-4-4H9l-4 4-3-2z M7 9v5M4.5 11.5h5M16 10h.01M18 13h.01',
 '80s':'M3 7h18v14H3z M7 2l5 5 5-5M7 11h7v6H7zM18 11h.01M18 16h.01',
 drawn:'m4 17 12-13 4 4L8 21H3z M13 7l4 4',
 painted:'m14 3 7 3-10 11-4-3z M7 15c-5-2-6 3-4 6 4 1 8-1 7-5',
 print:'M7 7V3h10v4M6 17H3V8h18v9h-3M7 14h10v7H7z',
 riso:'M14 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M20 15a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 15a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
 more:'M5 12h.01M12 12h.01M19 12h.01',
};
function groupIcon(id){return `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="${GROUP_GLYPHS[id]||GROUP_GLYPHS.more}"/></svg>`;}
function renderLookRail(ctx){
 const box=$(state.mode==='editor'?'editLookRail':'cameraLookRail');box.textContent='';
 ctx.recipe.layers.forEach((layer,i)=>{
  const b=document.createElement('button');b.type='button';b.className='rail-look swatch';b.setAttribute('aria-label',`Look ${i+1}: ${LOOKS[layer.look].label}`);b.setAttribute('aria-pressed',String(i===ctx.active));b.title=LOOKS[layer.look].label;
  b.innerHTML=lookIcon(layer.look);
  const label=document.createElement('span');label.textContent=lookLabel(layer.look);b.append(label);
  b.addEventListener('click',()=>{ctx.active=i;if(state.mode==='editor')selectTab('looks');else showLooks(true);trayChanged({thumbs:true});});box.append(b);
 });
 // Reveal the selected Look inside its rail; never scroll the photograph's stage.
 const rail=box.parentElement,active=box.children[ctx.active];
 if(active&&rail.clientHeight){const a=active.getBoundingClientRect(),r=rail.getBoundingClientRect();rail.scrollTop+=a.top<r.top?a.top-r.top:a.bottom>r.bottom?a.bottom-r.bottom:0;}
}
function buildGroups(){
 const row=$('lookGroups');row.textContent='';
 for(const g of LOOK_GROUPS){
  const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.dataset.group=g.id;b.innerHTML=`${groupIcon(g.id)}<span class="group-name">${g.label}</span>`;b.title=g.label;
  b.setAttribute('aria-label',`${g.label}: ${g.looks.map(n=>LOOKS[n].label).join(', ')}`);
  b.addEventListener('click',()=>{sound('tick');shownGroup=g.id;renderStripSelection();refreshThumbs(true);});
  row.append(b);
 }
}
function buildStrip(){
 buildGroups();
 strip.textContent='';tiles.clear();
 for(const name of offered()){
  const b=document.createElement('button');b.type='button';b.className='tile';b.setAttribute('role','radio');b.dataset.look=name;
  b.title=LOOKS[name].hint;b.setAttribute('aria-label',LOOKS[name].label);
  // A medium-specific symbol until the live photograph thumbnail is ready.
  const face=document.createElement('span');face.className='face swatch';face.innerHTML=lookIcon(name);
  const c=document.createElement('canvas');c.width=c.height=THUMB;face.append(c);
  const s=document.createElement('span');s.className='name';s.textContent=lookLabel(name);
  b.append(face,s);strip.append(b);tiles.set(name,{button:b,canvas:c,drawn:false});
 }
}
function renderLayers(){
 const ctx=current(),{layers}=ctx.recipe;layersEl.textContent='';renderLookRail(ctx);
 // The Looks of one mix sit together in one capsule, as the segments of one control: the chosen one is lit.
 const mix=document.createElement('span');mix.className='mix';layersEl.append(mix);
 layers.forEach((layer,i)=>{
  const wrap=document.createElement('span');wrap.className=`layer${i===ctx.active?' active':''}${layers.length>1?' removable':''}`;
  const pick=document.createElement('button');pick.type='button';pick.className='layer-pick swatch';pick.innerHTML=`${lookIcon(layer.look)}<span class="layer-name">${lookLabel(layer.look)}</span>`;
  pick.setAttribute('aria-pressed',String(i===ctx.active));pick.setAttribute('aria-label',`Look ${i+1}: ${LOOKS[layer.look].label}${layer.amount<1?`, ${Math.round(layer.amount*100)}%`:''}`);
  // On a short screen the Look's name unfolds the strip first; tapped again, its intensity.
  pick.addEventListener('click',()=>{
   if(state.mode==='camera'&&isCompact()&&!$('camera').classList.contains('looks-open')){ctx.active=i;showLooks(true);trayChanged({thumbs:true});return;}
   if(ctx.active===i){toggleAmount();return;}ctx.active=i;trayChanged({thumbs:true});
  });
  if(i===ctx.active)pick.insertAdjacentHTML('beforeend','<svg class="more" aria-hidden="true"><use href="#i-chevron"/></svg>');
  const remove=document.createElement('button');remove.type='button';remove.className='layer-remove';remove.innerHTML=icon('x');
  remove.setAttribute('aria-label',`Remove ${LOOKS[layer.look].label} from the mix`);
  remove.addEventListener('click',()=>removeLayer(i));
  wrap.append(pick,remove);mix.append(wrap);
 });
 const selected=layers[ctx.active];
 if(hasLookSettings(selected.look)){
  const settings=document.createElement('button');settings.type='button';settings.className='look-settings-button';settings.innerHTML=icon('settings');
  settings.setAttribute('aria-label','Look settings');settings.title='Look settings';settings.addEventListener('click',openLookSettings);layersEl.append(settings);
 }
 if(layers.length<MAX_LAYERS){
  const add=document.createElement('button');add.type='button';add.className='add-layer';add.innerHTML=`${icon('plus')}<span>Mix</span>`;
  add.setAttribute('aria-label','Mix in another Look over this one');add.addEventListener('click',addLayer);layersEl.append(add);
 }
 const dice=document.createElement('button');dice.type='button';dice.className='shuffle';dice.innerHTML=icon('dice');
 const matching=state.mode==='editor'&&smartTask?.ctx===ctx&&!smartTask.cancelled;
 dice.setAttribute('aria-label',state.mode==='editor'?'Surprise me: match this photo':'Surprise me: a random mix');dice.title='Surprise me';
 dice.disabled=!!matching;dice.setAttribute('aria-busy',String(!!matching));
 dice.addEventListener('click',()=>{dice.classList.remove('roll-dice');void dice.offsetWidth;dice.classList.add('roll-dice');shuffle();});
 layersEl.append(dice);
 if(state.mode==='editor'&&ctx.smartPrevious&&ctx.smartPicture===ctx.picture){
  const undo=document.createElement('button');undo.type='button';undo.className='undo-shuffle';undo.innerHTML=icon('undo');
  undo.setAttribute('aria-label','Undo Surprise');undo.title='Undo Surprise';undo.addEventListener('click',()=>{
   if(ctx!==current()||ctx.smartPicture!==ctx.picture||ctx.saving)return;
   if(smartTask?.ctx===ctx)smartTask.cancelled=true;
   ctx.recipe=normalRecipe({...ctx.recipe,...ctx.smartPrevious});ctx.smartPrevious=null;ctx.smartMatch=null;ctx.active=0;renderAdjusters();renderFramePanel();trayChanged({thumbs:true});
  });layersEl.append(undo);
 }
 if(state.mode==='camera'){
  const sticker=document.createElement('button');sticker.type='button';sticker.className='shuffle sticker-button';sticker.innerHTML=icon('sticker');
  sticker.setAttribute('aria-label','Stickers');sticker.title='Stickers';sticker.addEventListener('click',openStickerSheet);layersEl.append(sticker);
 }
}
function renderStripSelection({scroll=true}={}){
 const ctx=current(),look=ctx.recipe.layers[ctx.active].look,group=LOOK_GROUPS.find(g=>g.id===shownGroup)||groupOf(look);
 for(const b of $('lookGroups').children){const on=b.dataset.group===group.id;b.setAttribute('aria-selected',String(on));b.classList.toggle('has-look',groupOf(look).id===b.dataset.group);
  // Nine kinds are wider than a phone: the row scrolls, and the open kind is brought into it (never the page).
  if(on&&scroll){const row=b.parentElement;if(row.scrollWidth>row.clientWidth+1){const left=b.offsetLeft-row.offsetLeft,target=Math.max(0,left-(row.clientWidth-b.offsetWidth)/2);row.scrollTo({left:target,behavior:reduceMotion?'auto':'smooth'});}}}
 for(const [name,t] of tiles){const on=name===look;t.button.setAttribute('aria-checked',String(on));t.button.tabIndex=on||(!group.looks.includes(look)&&name===group.looks[0])?0:-1;t.button.hidden=!group.looks.includes(name)||!familyTileVisible(name,look);
  const family=familyFor(name);if(family){t.button.querySelector('.name').textContent=family.label;t.button.setAttribute('aria-label',`${family.label}: ${LOOKS[name].label}`);}}
 if(group.id!==strip.dataset.group){strip.dataset.group=group.id;strip.scrollLeft=0;}
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
// In the editor the intensity sits under the layers; in the camera it takes the strip's place at the strip's height,
// so it never covers the picture's own controls and the viewfinder does not change size.
const wide=matchMedia('(min-width:1000px) and (min-aspect-ratio:5/4)');
function showAmountRow(show){
 // Beside the picture (a wide window) there is room for both.
 const row=$('amountRow'),inCamera=state.mode==='camera'&&!wide.matches;
 if(inCamera&&show&&strip.offsetHeight)row.style.height=`${strip.offsetHeight}px`;else row.style.height='';
 row.hidden=!show;strip.hidden=inCamera&&show;$('lookGroups').hidden=inCamera&&show;
}
function toggleAmount(){if(state.mode==='camera')showAmountRow($('amountRow').hidden);}
$('amountDone').addEventListener('click',()=>{sound('tick');showAmountRow(false);});
/** After any change to the mix: redraw the tray and the picture. */
function trayChanged({thumbs=false,announce=false,scroll=true}={}){
 shownGroup=null;
 renderLayers();renderStripSelection({scroll});renderAmount();
 if(announce)toast(mixLabel(current().recipe),{look:true,ms:900});
 if(state.mode==='camera')remember();
 if(thumbs)refreshThumbs(true);
 invalidate();
}
function chooseLook(name,{announce=true}={}){
 const ctx=current(),layer=ctx.recipe.layers[ctx.active];
 if(layer.look===name){toggleAmount();return;}
 layer.look=name;layer.amount=1;delete layer.handheld;delete layer.screen;
 trayChanged({announce});
 // The Looks after this layer are drawn over it, so their thumbnails do not change; the ones before do not either.
}
function stepLook(dir){
 const names=offered(),ctx=current(),i=names.indexOf(ctx.recipe.layers[ctx.active].look);
 chooseLook(names[(i+dir+names.length)%names.length]);sound('tick');
}
function addLayer(){
 const ctx=current();if(ctx.recipe.layers.length>=MAX_LAYERS)return;
 const used=new Set(ctx.recipe.layers.map(l=>l.look)),top=ctx.recipe.layers.at(-1).look;
 const partner=MIXES.find(([,base,over])=>base===top&&!used.has(over)&&tiles.has(over));
 const next=partner?partner[2]:FINISHERS.find(n=>!used.has(n)&&tiles.has(n))||'crt';
 ctx.recipe.layers.push({look:next,amount:partner?partner[3]:1});ctx.active=ctx.recipe.layers.length-1;
 if(state.mode==='camera'&&isCompact())showLooks(true);
 trayChanged({thumbs:true,announce:true});
 layersEl.querySelectorAll('.layer')[ctx.active]?.classList.add('enter');
}
function removeLayer(i){
 const ctx=current();if(ctx.recipe.layers.length<2)return;
 ctx.recipe.layers.splice(i,1);if(i<ctx.active)ctx.active--;ctx.active=Math.min(ctx.active,ctx.recipe.layers.length-1);
 trayChanged({thumbs:true,announce:true});
}
let lastMix=-1;
function shuffle(){
 if(state.mode==='editor')return matchPhoto();
 const ctx=current(),choices=MIXES.map((m,i)=>i).filter(i=>i!==lastMix&&tiles.has(MIXES[i][1])&&tiles.has(MIXES[i][2]));
 if(!choices.length)return;
 const i=choices[Math.floor(Math.random()*choices.length)],[name,base,over,amount]=MIXES[i];lastMix=i;
 ctx.recipe.layers=[{look:base,amount:1},{look:over,amount}];ctx.active=0;
 trayChanged({thumbs:true});
 toast(`${name} · ${mixLabel(ctx.recipe)}`,{look:true,ms:1300});sound('tick');
}
/** Search from the current photo source, applying only one result after all work is still relevant. */
async function matchPhoto(){
 const ctx=state.edit,e=engine;if(!ctx||ctx.saving||!e||e.lost())return null;
 if(smartTask)smartTask.cancelled=true;
 const before=JSON.stringify(ctx.recipe),task={ctx,cancelled:false,picture:ctx.picture};smartTask=task;renderLayers();
 const valid=()=>!task.cancelled&&state.mode==='editor'&&state.edit===ctx&&engine===e&&!e.lost()&&!ctx.saving&&!ctx.erasing&&!ctx.cropping&&ctx.picture===task.picture&&JSON.stringify(ctx.recipe)===before;
 const started=performance.now(),original=normalRecipe(ctx.recipe),crop=original.crop,aspect=crop.w*ctx.width/(crop.h*ctx.height);
 const width=Math.max(1,Math.round(Math.min(128,128*aspect))),height=Math.max(1,Math.round(Math.min(128,128/aspect))),options={source:'edit',crop,width,height};
 try{
  await nextFrame();if(!valid())return null;
  const sample=e.sample(normalRecipe({trick:original.trick,paper:original.paper}),options);if(!sample)return null;
  const reference=measureImage(sample),plans=photoCandidates(reference,{previous:ctx.smartMatch,available:name=>tiles.has(name)&&!e.failed(name)}),queue=[...plans],scored=[];
  let attempts=0;
  while(queue.length&&attempts++<48&&performance.now()-started<1800){
   if(!valid())return null;
   const candidate=queue.shift(),recipe=normalRecipe({...original,...candidate}),pixels=e.sample(recipe,options);
   if(pixels&&!candidate.layers.some(l=>e.failed(l.look)))scored.push({...candidate,score:scorePhoto(reference,measureImage(pixels),candidate.layers)});
   else if(!candidate.layers.some(l=>e.failed(l.look)))queue.push(candidate);
   await nextFrame();
  }
  if(!valid())return null;
  const picked=choosePhotoCandidate(scored,{lastName:ctx.smartLastName});
  if(!picked){toast('The Looks are still getting ready. Try again.',{face:'wait',ms:2200});return null;}
  ctx.smartPrevious={layers:original.layers,adjust:original.adjust,enhance:original.enhance};ctx.smartPicture=ctx.picture;ctx.recipe=normalRecipe({...original,layers:picked.layers,adjust:picked.adjust,enhance:picked.enhance});ctx.active=0;ctx.smartLastName=picked.name;
  ctx.smartMatch={...picked,tested:scored.length,elapsedMs:performance.now()-started,candidates:scored};
  renderAdjusters();renderFramePanel();trayChanged({thumbs:true});toast(`${picked.name} · ${mixLabel(ctx.recipe)}`,{look:true,ms:1300});sound('tick');return ctx.smartMatch;
 }catch(error){if(valid()){console.error(error);toast('That mix could not be tried. Your edit is unchanged.',{face:errorFace(),ms:2400});}return null;}
 finally{if(smartTask===task){smartTask=null;if(state.edit===ctx&&state.mode==='editor')renderLayers();}invalidate();}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&smartTask){smartTask.cancelled=true;if(state.mode==='editor')renderLayers();}});
strip.addEventListener('click',e=>{const t=e.target.closest('.tile');if(t){sound('tick');chooseLook(t.dataset.look);}});
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
 if(state.mode==='editor')updateEditSource();
 const t=performance.now();
 const live=state.mode==='camera';
 if(t-thumbsAt<(live?700:120))return;
 const ctx=current(),source=live?'live':'edit';
 if(!engine.hasSource(source))return;
 const crop=squareCrop(live?cameraCrop():ctx.recipe.crop,live?videoSize():{width:state.edit.width,height:state.edit.height});
 // Only the kind on show: a few Looks at a time, which is also the phone's battery spared.
 // None at all while the strip is folded over the picture: it draws them when it unfolds.
 const folded=live&&isCompact()&&!$('camera').classList.contains('looks-open');
 const names=folded?[]:[...tiles.keys()].filter(n=>!tiles.get(n).button.hidden);
 if(!names.length)return;
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
// The most pixels the editor draws a zoomed photo at: twice a full-HD screen, a quarter of a 16 MP save's memory.
const VIEW_PIXELS=8e6;
const frameTimes=[];
function invalidate(){dirty=true;schedule();}
function schedule(){if(!raf)raf=requestAnimationFrame(loop);}
let lastFrame=0,videoFresh=false,uploadedAt=-1;
function loop(t){
 raf=0;
 if(!engine)return;
 // Nothing can be drawn until the graphics come back (webglcontextrestored).
 if(engine.lost()){if(state.mode==='camera'||state.mode==='editor')setTimeout(schedule,250);return;}
 // While the printer prints, the viewfinder (blurred behind it) holds still, so the print moves smoothly.
 if(state.mode==='camera'&&state.camera.running){if(!printer.busy)drawCamera(t);schedule();}
 else if(state.mode==='editor'&&state.edit){if(dirty)drawEditor();if(thumbsDue||dirty)schedule();}
 if(!printer.busy)drawThumbs();
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
 compactCamera(pw/ph);
 const box=fitFrame($('cameraFrame'),$('cameraPictureArea'),pw/ph);
 // The viewfinder is drawn at the screen's own detail, no finer than the camera and no finer than the device keeps up with.
 const dpr=Math.min(devicePixelRatio||1,3),h=Math.min(ph,box.height*dpr,lines);
 setCanvasSize(h*pw/ph,h);
 const drawn=engine.draw(state.camera.recipe,{source:'live',crop,mirror:state.camera.mirror});
 if(drawn)govern(t);
 paintFrame($('cameraFrame'),state.camera.recipe.frame);
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
 updateEditSource();
 const crop=e.recipe.crop,pw=crop.w*e.width,ph=crop.h*e.height,aspect=pw/ph;
 const box=fitFrame($('editFrame'),$('editPictureArea'),aspect);
 // Zoomed in (zoom-view.js), the photo is drawn again at the detail the zoom shows, once the fingers rest: up to the
 // photo's own pixels, within the renderer's largest side and VIEW_PIXELS; never less than unzoomed.
 const dpr=Math.min(devicePixelRatio||1,3),zoom=viewZoom($('editFrame')),fit=Math.min(ph,box.height*dpr,2048/Math.max(1,aspect),2048);
 const side=Math.min(MAX_SIDE,engine.maxTexture||MAX_SIDE),h=zoom>1?Math.max(fit,Math.min(ph,box.height*dpr*zoom,side/Math.max(1,aspect),side,Math.sqrt(VIEW_PIXELS/aspect))):fit;
 setCanvasSize(h*aspect,h);
 // While erasing, the photo as it is under the Looks: no mirror trick, and no frame or date over its edges.
 const plain=e.comparing||e.erasing||e.aligning;
 const recipe=plain?normalRecipe():e.recipe;
 dirty=!engine.draw(recipe,{source:e.makeupRendered&&(e.comparing||e.erasing)?'edit-original':'edit',crop});
 syncCutoutView(e,crop);
 makeupGuide.render();
 paintStamps();
 paintFrame($('editFrame'),e.recipe.frame,e.comparing||e.erasing||e.cropping);
 stampOverlay($('editFrame'),e.recipe.stamp&&!e.comparing&&!e.erasing&&!e.cropping,e.taken,e.recipe.frame);
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
  c.running=true;$('welcome').hidden=true;$('camera').classList.remove('idle');setShutter('shoot');$('zoom').hidden=false;
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
 setShutter('off');
}
const canStart=()=>!!navigator.mediaDevices?.getUserMedia&&!!engine;
/** The shutter takes the photo; before there is a picture it starts the camera, the one obvious thing to press. */
function setShutter(kind){
 const s=$('shutter');s.dataset.kind=kind;s.disabled=kind==='off';
 s.setAttribute('aria-label',kind==='start'?'Start camera':'Take photo');
}
/** The first screen: the greeting, without the Look tray (nothing to see it on yet), the shutter starting the camera. */
function showWelcome(note){
 $('welcome').hidden=false;$('zoom').hidden=true;$('camera').classList.remove('compact','looks-open');$('camera').classList.add('idle');setShutter(canStart()?'start':'off');
 if(note)$('welcomeNote').textContent=note;
 // A camera refused or missing is met by a Pocket face with its own line, before the explanation.
 const face=$('welcomeFace'),line=$('welcomeFaceLine');face.hidden=true;line.hidden=true;
 if(note)pocketFace('hide').then(f=>{if(!f||$('welcome').hidden)return;face.src=f.url;face.alt=f.alt;face.hidden=false;line.textContent=`“${f.line}”`;line.hidden=false;});
 fitFrame($('cameraFrame'),$('cameraPictureArea'),3/4);
}
// The greeter dances, as Mario did on the Game Boy Camera's title screen, faster with Up and slower with Down: a tap on
// the picture steps the tempo round, the arrow keys step it up and down. Reduced motion keeps the greeter still.
const DANCE_TEMPOS=[1.1,.72,.46];let danceTempo=0;
function setDance(i){danceTempo=Math.min(2,Math.max(0,i));$('welcomeSticker').style.setProperty('--dance',`${DANCE_TEMPOS[danceTempo]}s`);sound('tick');}
$('welcome').querySelector('.welcome-hero').addEventListener('click',()=>{if(!reduceMotion)setDance((danceTempo+1)%3);});
document.addEventListener('keydown',e=>{
 if($('welcome').hidden||state.mode!=='camera'||reduceMotion||e.target.closest('input,textarea,select,[contenteditable]'))return;
 if(e.key==='ArrowUp'){e.preventDefault();setDance(danceTempo+1);}else if(e.key==='ArrowDown'){e.preventDefault();setDance(danceTempo-1);}
});
/** A game won: the Game Boy Camera opened its last stamps by a score; here a win opens the secret sheet (unlocks.js). */
function gameWon(game){
 const {saved,unlocked}=recordWin(store.read(),game);store.write(saved);
 for(const id of unlocked)if(id==='pocket-faces')setTimeout(()=>sayFace('secret',{ms:4200}),900);
 if(unlocked.length&&$('stickerSheet').open)renderStickerPicker();
}
/** What of an edit the photographer can change, as a string: Cancel after a change is a "Run" (the Game Boy Camera's
 * "Who are you running from?"). The found faces, the makeup guide and a saved cut-out coming back are not changes. */
function editFingerprint(e){
 const r=e.recipe,m=r.makeup||{};
 return JSON.stringify({layers:r.layers,adjust:r.adjust,stickers:r.stickers,frame:r.frame,crop:r.crop,paper:r.paper,stamps:r.stamps,enhance:r.enhance,pop:r.pop,trick:r.trick,
  makeup:{look:m.look,strength:m.strength,shade:m.shade,tune:m.tune},cutout:e.cutout&&e.cutoutKind!=='saved'?'new':'',erased:!!e.erased});
}
$('startCamera').addEventListener('click',startCamera);
$('flip').addEventListener('click',()=>{
 const c=state.camera;c.facing=c.facing==='user'?'environment':'user';remember();
 $('cameraFrame').animate?.([{transform:'rotateY(0)'},{transform:'rotateY(90deg)',opacity:.3},{transform:'rotateY(0)'}],{duration:reduceMotion?1:420,easing:'ease-in-out'});
 startCamera();
});
// The settings row: each button shows its value, in yellow when it is switched on; a tap moves it to the next value.
function setting(id,{label,on,icon,aria}){
 const b=$(id);b.querySelector('span').textContent=label;b.classList.toggle('on',!!on);b.setAttribute('aria-label',aria);
 if(icon)b.querySelector('use').setAttribute('href',`#i-${icon}`);
}
function renderCameraChips(){
 const c=state.camera,r=c.recipe,frame=FRAMES.find(f=>f.id===r.frame);
 setting('timer',{label:c.timer?`${c.timer}s`:'Off',on:c.timer>0,aria:`Self-timer: ${c.timer?`${c.timer} seconds`:'off'}`});
 setting('ratio',{label:c.ratio,aria:`Picture shape: ${c.ratio}`});
 setting('frameSetting',{label:frame.label,on:r.frame!=='none'||r.paper!=='none',aria:`Frame: ${frame.label}; paper: ${PAPERS.find(p=>p.id===r.paper).label}`});
 setting('mirrorSetting',{label:TRICK_LABELS[r.trick],on:r.trick!=='none',aria:`Mirror lens: ${TRICK_LABELS[r.trick]}`});
 setting('stamp',{label:r.stamp?'On':'Off',on:r.stamp,aria:`Date stamp: ${r.stamp?'on':'off'}`});
 setting('autoSetting',{label:state.auto?'On':'Off',on:state.auto,aria:`Auto, the photo set right by itself: ${state.auto?'on':'off'}`});
 setting('printSetting',{label:state.printer?'On':'Off',on:state.printer,aria:`Printer when sharing: ${state.printer?'on':'off'}`});
 setting('soundSetting',{label:state.sound?'On':'Off',icon:state.sound?'sound':'sound-off',aria:`Sounds: ${state.sound?'on':'off'}`});
 setting('themeSetting',{label:THEME_LABELS[state.theme],on:state.theme!=='auto',aria:`Appearance: ${THEME_LABELS[state.theme]}${state.theme==='auto'?` (${resolvedTheme()}, as the device)`:''}`});
 // What is switched on, beside the chevron, so it is never a surprise in the photo.
 const status=[c.timer&&'timer',(r.frame!=='none'||r.paper!=='none')&&'frame',r.trick!=='none'&&'mirror',r.stamp&&'date'].filter(Boolean);
 $('settingsStatus').innerHTML=status.map(icon).join('');
 $('settingsToggle').classList.toggle('busy',status.length>0);
 $('zoom').textContent=`${c.zoom}×`;$('zoom').setAttribute('aria-label',`Zoom ${c.zoom}×`);
 renderExposure();
 stampOverlay($('cameraFrame'),r.stamp,new Date(),r.frame);
}
/** One panel at a time: a sheet coming up puts away the settings row, the intensity and the strip of Looks. */
function openSheet(sheet){
 showSettings(false);
 if(state.mode==='camera'){showAmountRow(false);showLooks(false);}
 sheet.showModal();
}
// A sheet edits the chosen layer in place. Ignore late events if its photo/layer has changed.
let lookSettingsTarget=null;
const SCREEN_CONTROLS=[['scanlines','Scanlines'],['glow','Glow'],['curve','Screen curve'],['mask','Pixel / phosphor grid']];
function settingsLayer(){
 const t=lookSettingsTarget;
 return t&&current()===t.ctx&&t.ctx.recipe.layers[t.index]===t.layer&&(!t.ctx.saving)?t.layer:null;
}
function updateLookSettings(){
 if(!settingsLayer())return;
 trayChanged({thumbs:true});
}
function renderLookSettings(){
 const layer=settingsLayer();if(!layer)return;
 const family=familyFor(layer.look),variant=$('lookVariant');
 $('lookSettingsTitle').textContent=family?.label||LOOKS[layer.look].short||LOOKS[layer.look].label;
 $('lookVariantRow').hidden=!family;variant.replaceChildren();
 if(family){
  $('lookVariantLabel').textContent=family.choice;
  for(const [value,label] of family.variants){const option=document.createElement('option');option.value=value;option.textContent=label;variant.append(option);}
  variant.value=variantFor(layer);
 }
 const screen=normalScreen(layer.screen),enabled=hasScreen(layer.look);
 $('lookScreenControls').hidden=!enabled;$('screenFinish').value=screen.mode;
 $('screenFinish').querySelector('[value="lcd"]').disabled=layer.look==='crt';
 for(const [key] of SCREEN_CONTROLS){
  const input=$(`screen-${key}`);input.value=Math.round(screen[key]*100);input.disabled=screen.mode==='none';
  $(`screen-${key}-value`).textContent=`${input.value}%`;
 }
 $('lookSettingsHint').textContent=family?.id==='riso'?'Choose the inks. Pattern and paper remain available in Adjust and Frame.':layer.look==='crt'?'Original keeps the Old TV finish. Custom CRT adjusts its screen.':'Choose a system, then its screen finish. These settings use no extra mix layer.';
}
function openLookSettings(){
 const ctx=current(),layer=ctx?.recipe.layers[ctx.active];if(!layer||!hasLookSettings(layer.look))return;
 lookSettingsTarget={ctx,index:ctx.active,layer};renderLookSettings();openSheet($('lookSettingsSheet'));
}
$('lookVariant').addEventListener('change',e=>{const layer=settingsLayer();if(layer&&selectVariant(layer,e.target.value)){renderLookSettings();updateLookSettings();}});
$('screenFinish').addEventListener('change',e=>{const layer=settingsLayer();if(!layer)return;layer.screen=screenDefaults(e.target.value);renderLookSettings();updateLookSettings();});
for(const [key,label] of SCREEN_CONTROLS){
 const row=document.createElement('label');row.className='screen-control';row.htmlFor=`screen-${key}`;
 row.innerHTML=`<span>${label}</span><output id="screen-${key}-value" for="screen-${key}"></output><input id="screen-${key}" type="range" min="0" max="100" step="1">`;
 row.querySelector('input').setAttribute('aria-label',label);
 row.querySelector('input').addEventListener('input',e=>{
  const layer=settingsLayer();if(!layer)return;
  layer.screen={...normalScreen(layer.screen),[key]:Number(e.target.value)/100};
  $(`screen-${key}-value`).textContent=`${e.target.value}%`;updateLookSettings();
 });$('screenSliders').append(row);
}
$('lookSettingsReset').addEventListener('click',()=>{const layer=settingsLayer();if(!layer)return;delete layer.screen;delete layer.handheld;renderLookSettings();updateLookSettings();});
$('lookSettingsSheet').addEventListener('close',()=>{lookSettingsTarget=null;});
$('lookSettingsSheet').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
function showSettings(open){
 $('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));$('settingsToggle').classList.toggle('open',open);
}
$('settingsToggle').addEventListener('click',()=>{sound('tick');showSettings($('settings').hidden);});
$('settingsDone').addEventListener('click',()=>{showSettings(false);$('settingsToggle').focus();});
const cycle=(list,value)=>list[(list.indexOf(value)+1)%list.length];
// The row shows each value as it changes, so a change needs no message of its own.
function changeSetting(fn){fn();sound('tick');renderCameraChips();remember();invalidate();}
$('timer').addEventListener('click',()=>changeSetting(()=>{state.camera.timer=cycle(TIMERS,state.camera.timer);}));
$('ratio').addEventListener('click',()=>changeSetting(()=>{state.camera.ratio=cycle(RATIOS,state.camera.ratio);refreshThumbs(true);}));
// Frame: a sheet with every frame on the picture as it is now (ten are too many to step through one tap at a time).
$('frameSetting').addEventListener('click',()=>{sound('tick');openFrameSheet();});
function openFrameSheet(){
 const c=state.camera,preview=c.running?lookPreview({source:'live',crop:squareCrop(cameraCrop(),videoSize()),mirror:c.mirror,recipe:c.recipe},132):null;
 renderFrameChoices($('cameraFrames'),c.recipe.frame,preview,id=>{changeSetting(()=>{c.recipe.frame=id;});$('frameSheet').close();});
 renderPaperChoices($('cameraPaperChoices'),c.recipe.paper,id=>{changeSetting(()=>{c.recipe.paper=id;refreshThumbs(true);});openFrameSheet();});
 openSheet($('frameSheet'));
 requestAnimationFrame(()=>$('cameraFrames').querySelector('[aria-checked="true"]')?.scrollIntoView({inline:'center',block:'nearest'}));
}
$('frameSheet').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
$('mirrorSetting').addEventListener('click',()=>changeSetting(()=>{const r=state.camera.recipe;r.trick=cycle(TRICKS,r.trick);refreshThumbs(true);}));
$('stamp').addEventListener('click',()=>changeSetting(()=>{const r=state.camera.recipe;r.stamp=!r.stamp;}));
$('soundSetting').addEventListener('click',()=>{state.sound=!state.sound;sound('tick');renderCameraChips();remember();});
$('printSetting').addEventListener('click',()=>{state.printer=!state.printer;sound('tick');renderCameraChips();remember();});
$('autoSetting').addEventListener('click',()=>{state.auto=!state.auto;sound('tick');renderCameraChips();remember();});
// Appearance (the owner, 3 November 2026: "I need Dark and Light mode"): Auto follows the device, Light and Dark are
// pinned. The page's head script sets the same attribute before the first paint, so a stored choice never flashes.
const THEMES=['auto','light','dark'],THEME_LABELS={auto:'Auto',light:'Light',dark:'Dark'};
const lightScheme=matchMedia('(prefers-color-scheme:light)');
function resolvedTheme(){return state.theme==='auto'?(lightScheme.matches?'light':'dark'):state.theme;}
function applyTheme(){
 const t=resolvedTheme();document.documentElement.dataset.theme=t;
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t==='light'?'#faf8f2':'#0d0e10';
}
lightScheme.addEventListener?.('change',()=>{if(state.theme==='auto'){applyTheme();renderCameraChips();}});
applyTheme();
$('themeSetting').addEventListener('click',()=>{state.theme=cycle(THEMES,state.theme);applyTheme();sound('tick');renderCameraChips();remember();});
$('zoom').addEventListener('click',()=>{const c=state.camera;c.zoom=cycle(ZOOMS,c.zoom);sound('tick');renderCameraChips();refreshThumbs(true);});

// Light, live, as the hand-held camera set brightness on its pad: drag up or down on the picture. The sun shows how far;
// the small sun chip, while it is not neutral, puts it back.
function renderExposure(){
 const v=state.camera.recipe.adjust.light,chip=$('exposureChip');
 chip.hidden=Math.abs(v)<.02;chip.querySelector('span').textContent=`${v>0?'+':''}${v.toFixed(1)}`;
 chip.setAttribute('aria-label',`Light ${v>0?'+':''}${v.toFixed(1)}: tap to put it back`);
 $('exposure').style.setProperty('--at',String(.5-v/2));
}
let exposureTimer;
function setExposure(v){
 state.camera.recipe.adjust.light=Math.round(Math.max(-1,Math.min(1,v))*20)/20;
 const e=$('exposure');e.classList.add('show');clearTimeout(exposureTimer);exposureTimer=setTimeout(()=>e.classList.remove('show'),900);
 renderExposure();refreshThumbs();invalidate();
}
$('exposureChip').addEventListener('click',()=>{sound('tick');setExposure(0);remember();});

// Swipe across the picture for the next Look; tap twice to turn the camera round; tap once to focus Miniature.
function gestures(stage,{onDoubleTap,onDrag,onTap,swipe=()=>true}={}){
 let start=null,lastTap=0;const down=new Set();
 stage.addEventListener('pointerdown',e=>{
  if(e.target.closest('button,.settings,.erase-paint'))return;
  // A second finger makes it a pinch: no swipe, tap or drag from this touch.
  down.add(e.pointerId);if(down.size>1){if(start?.dragging)onDrag?.end?.();start=null;return;}
  start={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId,dragging:false};
 });
 stage.addEventListener('pointermove',e=>{
  if(!start||e.pointerId!==start.id||!onDrag)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y;
  if(!start.dragging&&Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)*1.3){start.dragging=true;start.from=onDrag.begin();}
  if(start.dragging)onDrag.move(start.from,dy);
 });
 stage.addEventListener('pointerup',e=>{
  down.delete(e.pointerId);
  if(!start||e.pointerId!==start.id)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y,dt=performance.now()-start.t,dragged=start.dragging;start=null;
  if(dragged){onDrag.end?.();return;}
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4&&dt<700){if(swipe())stepLook(dx<0?1:-1);return;}
  if(Math.hypot(dx,dy)<10&&dt<300){
   const now=performance.now();
   if(now-lastTap<320){lastTap=0;onDoubleTap?.();}else{lastTap=now;onTap?.(e);if(state.mode==='camera'){showAmountRow(false);showSettings(false);showLooks(false);}}
  }
 });
 stage.addEventListener('pointercancel',e=>{down.delete(e.pointerId);start=null;});
}
/**
 * Miniature's plane of focus where the picture is tapped (the owner's judge for it, Olivo Barbieri: the band belongs on
 * the subject, not at a fixed height), while Miniature is in the recipe. Returns whether the tap was taken.
 */
function focusTap(e,recipe,frame){
 if(!recipe.layers.some(l=>l.look==='tilt'&&l.amount>0)||e.target.closest('.sticker'))return false;
 const r=$(frame).getBoundingClientRect();
 if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom||!r.height)return false;
 recipe.focus=Math.round((1-(e.clientY-r.top)/r.height)*100)/100;
 sound('tick');toast('Focus here');invalidate();
 return true;
}
gestures($('cameraPictureArea'),{
 onDoubleTap:()=>{if(state.camera.running&&!$('flip').hidden)$('flip').click();},
 onTap:e=>{if(focusTap(e,state.camera.recipe,'cameraFrame'))refreshThumbs();},
 // The whole height of the picture is the whole range of light.
 onDrag:{begin:()=>state.camera.recipe.adjust.light,move:(from,dy)=>setExposure(from-dy/($('cameraFrame').clientHeight||1)*2),end:remember},
});

// Taking a photo: the frame as it is now, at the camera's full detail, through the whole recipe.
$('shutter').addEventListener('click',()=>{if($('shutter').dataset.kind==='start')startCamera();else takePhoto();});
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
  if(state.auto&&!recipe.enhance&&!recipe.pop)Object.assign(recipe,pickLevels(autoLevels(still)));
  engine.setSource('still',still,size.width,size.height);
  let finished;
  const output=photoSize(size.width,size.height);
  try{finished=await finishPhoto(engine.render(recipe,{source:'still',...output}),recipe,taken);}
  finally{engine.dropSource('still');}
  const {photo,thumb}=finished,source=await toBlob(still,'image/jpeg',.92);still.width=still.height=0;
  await keep({photo,source,thumb,recipe,...output,taken:taken.getTime()});
  flyToRoll(photo);
 }catch(err){console.error(err);toast('The photo could not be saved to the app album',{face:errorFace(),ms:2400});}
 finally{c.busy=false;$('shutter').classList.remove('waiting');$('count').textContent='';}
}
/** Plays the printer during Share; its animation never delays navigator.share's user gesture. */
function printPhoto(blob,width,height,to){
 if(!state.printer||reduceMotion||printer.busy)return null;
 const url=URL.createObjectURL(blob);
 return printer.print(url,{width,height,to}).catch(()=>false).finally(()=>URL.revokeObjectURL(url));
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
// A detailed photo for Photos and sharing, without a 16 MP download. Source pictures keep their editing resolution.
const photoSize=(width,height)=>exportSize(width,height,Math.min(2560,engine.maxTexture));
/**
 * Pixels from the engine to a JPEG and its album thumbnail: the stickers stuck on, then the date if asked. With a
 * cut-out mask (Remove background) the background is see-through and the picture and its thumbnail are PNGs.
 */
async function finishPhoto(pixels,recipe,date,mask=null){
 const c=document.createElement('canvas');c.width=pixels.width;c.height=pixels.height;
 const g=c.getContext('2d');g.putImageData(new ImageData(pixels.data,pixels.width,pixels.height),0,0);
 if(mask)applyMask(g,mask,recipe.crop,c.width,c.height);
 drawFrame(g,recipe.frame,c.width,c.height);
 // Face stickers with the sticker finish sit on the Looks like the other stickers (drawn ones are in the source already).
 const stamps=normaliseStamps(recipe.stamps);
 if(recipe.makeup?.face&&stamps.finish==='sticker'&&stampsActive(stamps)){
  const images=await loadStampImages(stamps).catch(()=>stampImages),crop=recipe.crop||{x:0,y:0,w:1,h:1},sw=c.width/crop.w,sh=c.height/crop.h;
  g.save();g.translate(-crop.x*sw,-crop.y*sh);drawFaceStamps(g,stamps,recipe.makeup.face,sw,sh,{images,finish:'sticker',face:recipe.faces[0]});g.restore();
 }
 const missing=await drawStickers(g,c.width,c.height,recipe.stickers);
 if(missing)toast(missing===1?'A sticker could not be loaded and is left off':`${missing} stickers could not be loaded and are left off`,{ms:2600,face:errorFace()});
 if(recipe.stamp)printStamp(g,frameInner(recipe.frame,c.width,c.height),date);
 try{
  const photo=await toBlob(c,mask?'image/png':'image/jpeg',.88);
  const s=Math.min(c.width,c.height),t=document.createElement('canvas');t.width=t.height=320;
  t.getContext('2d').drawImage(c,(c.width-s)/2,(c.height-s)/2,s,s,0,0,320,320);
  return {photo,thumb:await toBlob(t,mask?'image/png':'image/jpeg',.8)};
 }finally{c.width=c.height=0;}
}
function printStamp(g,{x:left,y:top,w,h},date){
 const size=h*.045,text=dateStamp(date);
 g.save();g.font=`700 ${size}px "Courier New",ui-monospace,monospace`;g.textAlign='right';g.textBaseline='bottom';
 if('letterSpacing' in g)g.letterSpacing=`${size*.06}px`;
 const x=left+w-w*.035,y=top+h-h*.03;
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

/** The largest rectangle of shape `aspect` inside `r`, less `pad` all round, centred: where a photo shows. */
function fitInside(r,aspect,pad=0){
 const w0=r.width-2*pad,h0=r.height-2*pad;let w=w0,h=w0/aspect;if(h>h0){h=h0;w=h0*aspect;}
 return {left:r.left+(r.width-w)/2,top:r.top+(r.height-h)/2,width:w,height:h};
}

// ---------- Album ----------
let albumOK=true,albumRevision=0;
async function refreshShots(){
 let revision,shots;
 do{revision=albumRevision;shots=await listShots();}while(revision!==albumRevision);
 state.shots=shots;
 if(state.shots.length)keepAlbum();
 renderRoll();if(state.mode==='album')renderGrid();
}
async function loadShots(){
 try{await refreshShots();}catch{albumOK=false;state.shots=[];renderRoll();return;}
 // Do not hold up the album while samples download. An unavailable asset is retried on a later visit.
 try{await ensureAlbumSamples();await refreshShots();}catch{/* The owner's photos remain usable offline. */}
}
async function keep(shot){
 const r=await addShot(shot);albumOK=true;albumRevision++;state.shots.unshift(r);renderRoll(true);keepAlbum();
 // The thirtieth photo: a Game Boy Camera held thirty.
 if(state.shots.length===30)setTimeout(()=>sayFace('full',{ms:3600}),1600);
 return r;
}
let rollURL;
function renderRoll(pop=false){
 const img=$('roll').querySelector('img'),latest=state.shots[0];
 if(rollURL)URL.revokeObjectURL(rollURL);rollURL=null;
 if(latest){rollURL=URL.createObjectURL(latest.thumb||latest.photo);img.src=rollURL;img.hidden=false;}else img.hidden=true;
 const welcomeThumb=$('welcomeAlbumThumb');welcomeThumb.hidden=img.hidden;if(!img.hidden)welcomeThumb.src=img.src;else welcomeThumb.removeAttribute('src');
 $('welcomeAlbumCount').textContent=state.shots.length?`${state.shots.length} ${state.shots.length===1?'photo':'photos'}`:'No photos yet';
 $('roll').setAttribute('aria-label',`Album, ${state.shots.length} ${state.shots.length===1?'photo':'photos'}`);
 if(pop){const r=$('roll');r.classList.remove('pop');void r.offsetWidth;r.classList.add('pop');}
}
let gridURLs=[];
function renderGrid(){
 gridURLs.forEach(u=>URL.revokeObjectURL(u));gridURLs=[];
 const grid=$('grid');grid.textContent='';
 for(const id of [...album.selected])if(!state.shots.some(s=>s.id===id))album.selected.delete(id);
 for(const shot of state.shots){
  const b=document.createElement('button');b.type='button';b.dataset.id=shot.id;
  const url=URL.createObjectURL(shot.thumb||shot.photo);gridURLs.push(url);
  b.setAttribute('aria-label',shot.sampleLabel||`Photo, ${mixLabel(normalRecipe(shot.recipe))}, ${new Date(shot.taken||shot.created).toLocaleString()}`);
  b.innerHTML=`<img src="${url}" alt="" loading="lazy" decoding="async"><i class="pick" aria-hidden="true"><svg><use href="#i-check"/></svg></i>`;
  const label=document.createElement('strong');label.textContent=shot.sampleLabel||mixLabel(normalRecipe(shot.recipe));b.append(label);
  const detail=document.createElement('small');detail.textContent=shot.sampleLabel?'Sample photo':new Date(shot.taken||shot.created).toLocaleDateString();b.append(detail);grid.append(b);
 }
 $('albumEmpty').hidden=state.shots.length>0;
 $('albumNote').textContent=albumOK?(state.shots.length?`${state.shots.length} ${state.shots.length===1?'photo':'photos'} · kept in this browser on this device`:''):'This browser does not keep an album here; photos are offered as files instead.';
 renderSelection();
}
// Select (the owner, 4 November 2026: "there should be a way to manage, delete the photos too"): Select turns every
// photo into a tick box; the chosen ones are deleted together, after the same sheet as one photo.
const album={selecting:false,selected:new Set()};
function renderSelection(){
 const on=album.selecting,n=album.selected.size,all=state.shots.length>0&&n===state.shots.length;
 $('album').classList.toggle('selecting',on);$('albumSelect').textContent=on?'Done':'Select';$('albumSelect').setAttribute('aria-pressed',String(on));$('albumSelect').hidden=!state.shots.length&&!on;
 $('albumActions').hidden=!on;$('albumSelectAll').textContent=all?'Select none':'Select all';
 $('albumDeleteSelected').disabled=!n;$('albumDeleteSelected').textContent=n?`Delete ${n}`:'Delete';
 $('albumSelectedCount').textContent=n?`${n} ${n===1?'photo':'photos'} chosen`:'Tap the photos to delete';
 for(const b of $('grid').children){const picked=on&&album.selected.has(b.dataset.id);b.classList.toggle('picked',picked);if(on)b.setAttribute('aria-pressed',String(picked));else b.removeAttribute('aria-pressed');}
}
function selectPhotos(on){album.selecting=on;if(!on)album.selected.clear();renderSelection();}
$('albumSelect').addEventListener('click',()=>{sound('tick');selectPhotos(!album.selecting);});
$('albumSelectAll').addEventListener('click',()=>{sound('tick');if(album.selected.size===state.shots.length)album.selected.clear();else for(const s of state.shots)album.selected.add(s.id);renderSelection();});
$('albumDeleteSelected').addEventListener('click',()=>{
 const ids=[...album.selected];if(!ids.length)return;const n=ids.length;
 confirmDelete(n===1?'This photo will be deleted from this device.':`${n} photos will be deleted from this device.`,n===1?'Delete Photo':`Delete ${n} Photos`,async()=>{
  for(const id of ids)await deleteShot(id).catch(()=>{});albumRevision++;
  state.shots=state.shots.filter(s=>!ids.includes(s.id));selectPhotos(false);renderRoll();renderGrid();toast(n===1?'Photo deleted':`${n} photos deleted`);
 });
});
$('grid').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(album.selecting){sound('tick');album.selected.has(b.dataset.id)?album.selected.delete(b.dataset.id):album.selected.add(b.dataset.id);renderSelection();return;}
 openViewer(b.dataset.id);});

function show(mode){
 state.mode=mode;$('app').dataset.mode=mode;editZoom.reset();viewerZoom.reset();
 for(const id of ['camera','editor','album','viewer','memory','cardsHub','cardGame'])$(id).hidden=id!==mode;
 if(mode==='camera'){$('cameraDock').prepend(tray);placeCanvas($('cameraFrame'));}
 if(mode==='editor'){$('panelLooks').append(tray);placeCanvas($('editFrame'));$('panelStickers').append($('stickerPicker'));}
 if(mode==='camera'||mode==='editor'){buildTrayFor();}
 if(mode==='camera'){renderCameraChips();if(!state.camera.running)maybeStartCamera();else{refreshThumbs(true);schedule();}}
 else if(state.camera.running)stopCamera();
 if(mode!=='camera')showSettings(false);
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
$('welcomeAlbum').addEventListener('click',openAlbum);
function openAlbum(){show('album');selectPhotos(false);renderGrid();}
$('closeAlbum').addEventListener('click',()=>show('camera'));


// ---------- Memory ----------
let stickerSheets=null;
/** The cards Memory can be played with: the album's photos, each of the residents' sheets, the photographer's own stickers. */
async function memorySources(){
 const manifest=stickerSheets||await loadStickerSets().catch(()=>null);
 const day=s=>new Date(s.taken||s.created).toLocaleDateString(undefined,{day:'numeric',month:'long'});
 return [
  {id:'photos',name:'Your photos',kind:'photo',items:state.shots.map(s=>({id:s.id,blob:s.thumb||s.photo,label:s.sampleLabel||`Your photo of ${day(s)}`}))},
  ...[...residentSets(manifest),...secretSets(manifest)].map(set=>({id:`set:${set.name}`,name:set.name,kind:'sticker',items:set.stickers.map(s=>({id:s.id,url:s.url,label:`${set.name}: ${s.gloss||s.line}`}))})),
  {id:'mine',name:'Your stickers',kind:'sticker',items:mine.map(m=>stickerById(m.id)).filter(Boolean).map(s=>({id:s.id,url:s.url,label:'Your sticker'}))},
 ];
}
/** A resident sticker, any one, to cheer the last pair. */
function cheer(){
 const all=residentSets(stickerSheets).flatMap(set=>set.stickers),s=all[Math.floor(Math.random()*all.length)];
 return s?{url:s.url,alt:`${s.set}: ${s.gloss}`}:null;
}
const memory=createMemory($('memory'),{sources:memorySources,cheer,sound,store,onPlay:()=>{$('memoryNew').hidden=false;},onWin:()=>gameWon('memory')});
let memoryReturnToGames=false;
async function openMemory(fromGames=false){memoryReturnToGames=fromGames;document.querySelector('#closeMemory span').textContent=fromGames?'Games':'Album';sound('tick');show('memory');$('memoryNew').hidden=true;await memory.open();}
$('openGames').addEventListener('click',()=>enterGames(false));
$('emptyPlay').addEventListener('click',()=>openMemory());
$('closeMemory').addEventListener('click',()=>{memory.close();if(memoryReturnToGames)openCardsHub();else openAlbum();});
$('memoryNew').addEventListener('click',()=>{sound('tick');$('memoryNew').hidden=true;memory.showSetup();});

// A separate game room keeps the photo-based Memory flow intact.
let activeCardGame=null;
function openCardsHub(){activeCardGame?.destroy();activeCardGame=null;show('cardsHub');}
// The room has two doors: the album's, and the title screen's. Back leaves by the door one came in through, and says so.
let gamesFromCamera=false;
function enterGames(fromCamera){gamesFromCamera=fromCamera;document.querySelector('#closeCardsHub span').textContent=fromCamera?'Camera':'Album';sound('tick');openCardsHub();}
$('welcomeGames').addEventListener('click',()=>enterGames(true));
function openCardGame(kind){
 activeCardGame?.destroy();
 const root=$('cardGameContent');root.replaceChildren();
 $('cardGameTitle').textContent={blackjack:'Blackjack',solitaire:'Solitaire'}[kind];
 show('cardGame');
 activeCardGame=(kind==='blackjack'?createBlackjack:createSolitaire)({root,cardView,shuffleDeck,onWin:()=>gameWon(kind)});
 activeCardGame.start();
}
// Ball, the juggle with your own face, was here from 5 to 12 November 2026 and was removed (the owner: "remove the ball
// juggle game it didn't end up well"). A juggler saved as a sticker stays among the owner's own stickers.
$('openCardGames').addEventListener('click',()=>enterGames(false));

// ---------- Album backup (backup.js) ----------
// Two taps on purpose: packing a whole album takes longer than an iPhone keeps a tap's permission to open the share
// sheet, so Back up album prepares the file and Save backup shares (Save to Files) or downloads it at once.
let backupFile=null,backupBusy=false;
const backupDay=iso=>{try{return new Date(iso).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});}catch{return '';}};
function renderBackupSummary(){
 const last=store.read().lastBackup;
 $('backupSummary').textContent=last?`Last saved ${backupDay(last)} · save a new one, or restore`:'Save every photo and sticker to one file, or restore one';
}
function backupProgress(text,fraction=null){
 const status=$('backupStatus'),bar=$('backupProgress');
 status.textContent=text;status.classList.remove('error');bar.hidden=fraction==null;if(fraction!=null)bar.value=fraction;
}
function backupError(err){backupProgress('');$('backupStatus').textContent=err?.message||'The backup could not be made';$('backupStatus').classList.add('error');}
function setBackupBusy(on){backupBusy=on;for(const id of ['backupMake','backupSave','backupRestore','backupDone'])$(id).disabled=on;}
async function renderBackupInfo(){
 const info=await albumStorage().catch(()=>null);
 $('backupWhere').textContent=info?.standalone
  ?'This album is kept by the Pocket Camera app on your Home Screen. Safari keeps a separate album for this site.'
  :'This album is kept by this browser on this device. On an iPhone, the Home Screen app keeps a separate album.';
 const rows=[['Photos',info?String(info.photos):'–'],['Your stickers',info?String(info.stickers):'–'],
  ['Space used',info?.usage!=null?formatBytes(info.usage):'Not reported'],['Kept by the browser',info?.persisted===true?'Yes':info?.persisted===false?'Not guaranteed':'Not reported']];
 $('backupStats').replaceChildren(...rows.map(([k,v])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;row.append(dt,dd);return row;}));
}
function openBackup(){
 sound('tick');backupFile=null;$('backupSave').hidden=true;$('backupMake').hidden=false;backupProgress('');
 renderBackupInfo();openSheet($('backupSheet'));
}
function backupSaved(text){backupProgress(text);store.write({...store.read(),lastBackup:new Date().toISOString()});renderBackupSummary();}
$('openBackup').addEventListener('click',openBackup);
$('backupMake').addEventListener('click',async()=>{
 if(backupBusy)return;setBackupBusy(true);
 try{
  const made=await makeBackup({version:$('camera')?.querySelector('.camera-version')?.textContent||'',progress:backupProgress});
  backupFile=made.file;
  backupProgress(`Ready: ${made.photos} ${made.photos===1?'photo':'photos'} and ${made.stickers} ${made.stickers===1?'sticker':'stickers'}, ${formatBytes(backupFile.size)}.`);
  $('backupMake').hidden=true;$('backupSave').hidden=false;
  $('backupSave').textContent=canShareFiles(backupFile)?'Save backup…':'Download backup';
 }catch(err){backupError(err);}
 finally{setBackupBusy(false);if(!$('backupSave').hidden)$('backupSave').focus();}
});
$('backupSave').addEventListener('click',()=>{
 if(!backupFile||backupBusy)return;sound('tick');
 if(canShareFiles(backupFile))navigator.share({files:[backupFile],title:'Pocket Camera backup'}).then(()=>backupSaved('Backup saved.'))
  .catch(err=>{if(err?.name!=='AbortError'){download(backupFile);backupSaved('Backup downloaded.');}});
 else{download(backupFile);backupSaved('Backup downloaded. Keep it somewhere safe.');}
});
$('backupRestore').addEventListener('click',()=>{if(!backupBusy)$('backupFile').click();});
$('backupFile').addEventListener('change',async e=>{
 const file=e.target.files?.[0];e.target.value='';if(!file)return;
 setBackupBusy(true);
 try{
  const r=await restoreBackup(file,{progress:backupProgress});
  albumRevision++;await refreshShots();await loadMine();
  const parts=[r.photos&&`${r.photos} ${r.photos===1?'photo':'photos'}`,r.stickers&&`${r.stickers} ${r.stickers===1?'sticker':'stickers'}`].filter(Boolean);
  backupProgress(parts.length?`Restored ${parts.join(' and ')}${r.kept?`; ${r.kept} already in the album`:''}.`:'Everything in this backup is already in the album.');
  renderBackupInfo();sound('pop');
 }catch(err){backupError(err);}
 finally{setBackupBusy(false);}
});
$('backupSheet').addEventListener('click',e=>{if(e.target===e.currentTarget&&!backupBusy)e.currentTarget.close();});
$('backupSheet').addEventListener('cancel',e=>{if(backupBusy)e.preventDefault();});
renderBackupSummary();
$('closeCardsHub').addEventListener('click',()=>{if(gamesFromCamera)show('camera');else openAlbum();});
$('closeCardGame').addEventListener('click',openCardsHub);
$('chooseMemory').addEventListener('click',()=>openMemory(true));
$('chooseBlackjack').addEventListener('click',()=>openCardGame('blackjack'));
$('chooseSolitaire').addEventListener('click',()=>openCardGame('solitaire'));


let viewerURL;
async function openViewer(id){
 const shot=state.shots.find(s=>s.id===id)||await getShot(id).catch(()=>null);if(!shot)return;
 state.viewing=shot;show('viewer');
 if(viewerURL)URL.revokeObjectURL(viewerURL);viewerURL=URL.createObjectURL(shot.photo);
 const img=$('viewerImage');img.src=viewerURL;img.alt=shot.sampleLabel||`Photo in ${mixLabel(normalRecipe(shot.recipe))}`;
 // A see-through photo (Remove background) sits on a checkerboard, so its edge can be seen.
 $('viewerStage').classList.toggle('cutout',shot.photo?.type==='image/png');
 $('viewerTitle').textContent=shot.sampleLabel||new Date(shot.taken||shot.created).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
 $('editPhoto').disabled=!engine||engine.lost();$('editPhoto').title=$('editPhoto').disabled?'Editing requires WebGL 2':'';
 const shareFile=new File([shot.photo],fileName(shot),{type:shot.photo.type||'image/jpeg'}),canShare=canShareFiles(shareFile);
 $('sharePhoto').querySelector('span').textContent=canShare?'Share':'Download';
 $('sharePhoto').querySelector('use').setAttribute('href',canShare?'#i-share':'#i-download');
}
$('closeViewer').addEventListener('click',openAlbum);
function canShareFiles(file){try{return !!navigator.share&&!!navigator.canShare?.({files:[file]});}catch{return false;}}
function fileName(shot){const d=new Date(shot?.taken||Date.now()),ext=shot?.photo?.type==='image/png'?'png':'jpg';return `pocket-camera-${d.toISOString().slice(0,19).replace(/[:T]/g,'-')}.${ext}`;}
let sharing=false;
async function sharePhoto(shot){
 if(sharing)return;
 const file=new File([shot.photo],fileName(shot),{type:shot.photo.type||'image/jpeg'});
 sharing=true;$('sharePhoto').disabled=true;
 let printing;
 try{
  printing=printPhoto(file,shot.width,shot.height,()=>$('viewerImage').getBoundingClientRect());
  // Open within the original tap: waiting for the animation first can consume Safari's transient activation.
  if(canShareFiles(file))await navigator.share({files:[file],title:'Pocket Camera'});
  else download(file);
 }catch(err){if(err?.name!=='AbortError')toast('Sharing could not be opened. Please try again.',{face:errorFace(),ms:2400});}
 finally{
  printer.cancel();if(printing)await printing;
  sharing=false;$('sharePhoto').disabled=false;
 }
}
function download(file){const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
$('sharePhoto').addEventListener('click',()=>state.viewing&&sharePhoto(state.viewing));
$('editPhoto').addEventListener('click',async()=>{
 const shot=state.viewing;if(!shot)return;
 const picture=await decode(shot.source||shot.photo);
 openEditor({...picture,recipe:shot.source?shot.recipe:normalRecipe(),shotId:shot.id,taken:new Date(shot.taken||shot.created),sourceBlob:shot.source||shot.photo,mask:shot.source?shot.mask:null});
});
/** The action sheet for anything that cannot be undone. */
function confirmDelete(message,label,then){
 const sheet=$('deleteSheet');$('deleteMessage').textContent=message;$('deleteConfirm').textContent=label;
 sheet.onclose=()=>{if(sheet.returnValue==='delete')then();};
 sheet.returnValue='';openSheet(sheet);
}
$('deletePhoto').addEventListener('click',()=>confirmDelete('This photo will be deleted from this device.','Delete Photo',async()=>{
 if(!state.viewing)return;
 const id=state.viewing.id;await deleteShot(id).catch(()=>{});albumRevision++;
 state.shots=state.shots.filter(s=>s.id!==id);state.viewing=null;renderRoll();openAlbum();toast('Photo deleted');
}));

// ---------- Editor ----------
function pickPhoto(){$('picker').value='';$('picker').click();}
for(const id of ['import','welcomeImport','albumImport','emptyImport'])$(id).addEventListener('click',pickPhoto);
$('picker').addEventListener('change',e=>useFiles([...e.target.files||[]]));
const isPicture=file=>file.type.startsWith('image/')||/\.(jpe?g|png|webp|gif|avif|heic|heif)$/i.test(file.name);
/**
 * The photographer's own photos start with the camera's main Look only (its first layer, at full strength), not its
 * whole mix, which the dice make of two (the owner, 29 October 2026: "Why are two effects chosen at standard when I open
 * one of my photos?", then "main look and then we play with it in the app").
 */
const mainLook=()=>[{...state.camera.recipe.layers[0],look:state.camera.recipe.layers[0]?.look||'none',amount:1}];
/** The photographer's own photos: one opens in the editor; several go straight into the album, in the camera's main Look. */
async function useFiles(files){
 files=files.filter(isPicture);
 if(!files.length)return;
 if(files.length===1){await editFile(files[0]);return;}
 await addToAlbum(files);
}
let importing=false;
async function addToAlbum(files){
 if(importing||!engine)return;importing=true;
 const c=state.camera.recipe,recipe=normalRecipe({layers:mainLook(),frame:c.frame,paper:c.paper,stamp:c.stamp,adjust:{light:c.adjust.light}});
 let done=0,failed=0;
 try{
  for(const file of files){
   toast(`Adding ${done+failed+1} of ${files.length} in ${mixLabel(recipe)}…`,{ms:60000});
   try{
    const picture=await decode(file),own={...recipe,...(state.auto?pickLevels(autoLevels(picture.picture)):{})};
    engine.setSource('import',picture.picture,picture.width,picture.height);
    let finished;
    const output=photoSize(picture.width,picture.height);
    try{finished=await finishPhoto(engine.render(own,{source:'import',...output}),own,new Date(file.lastModified||Date.now()));}
    finally{engine.dropSource('import');}
    const source=file;
    picture.close();
    await keep({...finished,source,recipe:own,...output,taken:file.lastModified||Date.now()});done++;
   }catch(err){console.error(err);failed++;}
   await nextFrame();
  }
 }finally{importing=false;}
 toast(failed?`${done} added to the album; ${failed} could not be opened`:`${done} photos added to the album`,{ms:2600,...(failed?{face:errorFace()}:{})});
 openAlbum();
}
async function editFile(file){
 if(!isPicture(file)){toast('That is not a picture',{face:errorFace(),ms:2200});return;}
 try{
  const picture=await decode(file);
  const recipe=normalRecipe({layers:mainLook(),paper:state.camera.recipe.paper,stamp:false});
  const opened=state.auto?pickLevels(autoLevels(picture.picture)):null;if(opened)Object.assign(recipe,opened);
  const sourceBlob=file;
  openEditor({...picture,recipe,shotId:null,taken:new Date(file.lastModified||Date.now()),sourceBlob,autoLevels:opened});
 }catch{toast('That picture could not be opened',{face:errorFace(),ms:2200});}
}
function openEditor({picture,width,height,recipe,shotId,taken,sourceBlob,autoLevels:levels=null,mask=null}){
 if(!engine)return;
 makeupGuide.reset();
 state.edit?.picture?.close?.();
 state.edit={picture,width,height,recipe:normalRecipe(recipe),active:0,shotId,taken,sourceBlob,comparing:false,adjust:'light',from:state.mode,makeupDirty:true,aligning:false,faceStatus:'idle',finding:null,faceTapWanted:false,guideSynced:null,autoLevels:levels,cutout:null,cutoutKind:null,cuttingOut:false};
 state.edit.opened=editFingerprint(state.edit);
 $('editor').classList.remove('aligning');$('editFrame').classList.remove('finding');
 updateEditSource();
 eraser.reset();$('eraseUndo').disabled=true;renderCutout();
 // A saved cut-out (Remove background) comes back with its mask.
 if(mask){const opened=state.edit;maskFromBlob(mask,width,height).then(c=>{if(c&&state.edit===opened){opened.cutout=c;opened.cutoutKind='saved';renderCutout();invalidate();}});}
 $('makeupControls').hidden=true;$('makeupPhoto').setAttribute('aria-expanded','false');renderMakeup();
 $('funControls').hidden=true;$('funPhoto').setAttribute('aria-expanded','false');renderFun();
 const opened=state.edit;loadStampImages(opened.recipe.stamps).then(()=>{if(state.edit===opened){opened.stampsDirty=true;invalidate();}}).catch(()=>{});
 show('editor');showEnhanceStrength(false);selectFrameFinish('paper');$('compareOriginal').setAttribute('aria-pressed','false');$('original').hidden=true;selectTab('looks');renderAdjusters();renderFramePanel();editStickers.select(null);
 if(state.edit.recipe.stickers.length)loadStickerSets().then(()=>editStickers.render()).catch(()=>{});
 // A photo with its faces already in the recipe keeps them; any other is looked at now, in the background.
 if(state.edit.recipe.faces.length)state.edit.guideSynced=JSON.parse(JSON.stringify(state.edit.recipe.makeup.face));
 prepareFaces(state.edit);
}
function closeEditor(){
 if(state.edit?.saving)return;
 const from=state.edit?.from;eraser.reset();makeupGuide.reset();engine?.dropSource('edit');engine?.dropSource('edit-original');state.edit?.picture?.close?.();state.edit=null;cutoutView(null);
 if(from==='viewer'&&state.viewing)openViewer(state.viewing.id);else if(from==='album')openAlbum();else show('camera');
}
$('cancelEdit').addEventListener('click',()=>{const e=state.edit,changed=!!e&&!e.saving&&editFingerprint(e)!==e.opened;closeEditor();if(changed)sayFace('run',{ms:2400});});
// The Frame tab: the frames drawn over the photo itself, the mirror lens, the date stamp.
/** A picture through its recipe (no frame, date or stickers) as a square of `size` px, for the frame choices. */
function lookPreview({source,recipe,crop,mirror},size){
 if(!engine||engine.lost()||!engine.hasSource(source))return null;
 let px;try{px=engine.render({...normalRecipe(recipe),frame:'none',stamp:false,stickers:[]},{source,crop,mirror,width:size,height:size});}catch{return null;}
 const c=document.createElement('canvas');c.width=px.width;c.height=px.height;c.getContext('2d').putImageData(new ImageData(px.data,px.width,px.height),0,0);
 return c;
}
/** The photo being edited as it will be saved, squared from its middle. */
function editPreview(size){
 const e=state.edit;if(!e)return null;
 return lookPreview({source:'edit',recipe:e.recipe,crop:squareCrop(e.recipe.crop,{width:e.width,height:e.height})},size);
}
/** Every frame as a choice, drawn over `preview`; `pick(id)` when one is chosen. */
function renderFrameChoices(box,current,preview,pick){
 box.textContent='';
 for(const f of FRAMES){
  const b=document.createElement('button');b.type='button';b.className='frame-choice';b.setAttribute('role','radio');b.setAttribute('aria-checked',String(current===f.id));
  b.title=f.hint||'No frame';b.dataset.frame=f.id;
  const c=document.createElement('canvas');c.width=c.height=132;const g=c.getContext('2d');
  if(preview)g.drawImage(preview,0,0,132,132);else{g.fillStyle='#3a3a3c';g.fillRect(0,0,132,132);}
  drawFrame(g,f.id,132,132);
  const label=document.createElement('span');label.textContent=f.label;
  b.append(c,label);b.addEventListener('click',()=>{sound('tick');pick(f.id);});box.append(b);
 }
}
function renderFramePanel(){
 const e=state.edit;if(!e)return;
 renderFrameChoices($('frameChoices'),e.recipe.frame,$('panelFrame').hidden?null:editPreview(132),id=>{e.recipe.frame=id;renderFramePanel();invalidate();});
 const seg=$('mirrorChoices');seg.textContent='';
 for(const t of TRICKS){
  const b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.setAttribute('aria-checked',String(e.recipe.trick===t));b.dataset.trick=t;b.textContent=TRICK_LABELS[t];seg.append(b);
 }
 $('editStamp').setAttribute('aria-checked',String(e.recipe.stamp));
 renderPaperChoices($('paperChoices'),e.recipe.paper,id=>{if(e.saving)return;e.recipe.paper=id;renderFramePanel();refreshThumbs(true);invalidate();});
}
function renderPaperChoices(box,current,pick){
 box.textContent='';
 for(const p of PAPERS){const b=document.createElement('button');b.type='button';b.textContent=p.label;b.dataset.paper=p.id;b.setAttribute('role','radio');b.setAttribute('aria-checked',String(current===p.id));b.addEventListener('click',()=>{sound('tick');pick(p.id);});box.append(b);}
}
function selectFrameFinish(name){
 for(const [id,panel,kind] of [['framePaper','paperOptions','paper'],['frameMirror','mirrorOptions','mirror']]){
  $(id).setAttribute('aria-pressed',String(name===kind));$(panel).hidden=name!==kind;
 }
}
$('framePaper').addEventListener('click',()=>selectFrameFinish('paper'));
$('frameMirror').addEventListener('click',()=>selectFrameFinish('mirror'));
$('mirrorChoices').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||!state.edit)return;sound('tick');state.edit.recipe.trick=b.dataset.trick;renderFramePanel();refreshThumbs(true);invalidate();});
$('editStamp').addEventListener('click',()=>{const e=state.edit;if(!e)return;sound('tick');e.recipe.stamp=!e.recipe.stamp;renderFramePanel();invalidate();});
$('saveEdit').addEventListener('click',async()=>{
 const e=state.edit;if(!e||e.saving||eraser.working||eraser.analyzing||e.detecting)return;
 const button=$('saveEdit');e.saving=true;button.disabled=true;$('cancelEdit').disabled=true;button.textContent='Saving…';await nextFrame();
 try{
  setMakeupAlignment(false);
  const recipe=normalRecipe(e.recipe);
  // An erased photo keeps its erased picture as its source, so it opens again as it was left.
  if(e.erased)e.sourceBlob=await toBlob(e.picture,'image/jpeg',.95);
  const output=photoSize(recipe.crop.w*e.width,recipe.crop.h*e.height);
  await loadStampImages(recipe.stamps).catch(()=>{});e.stampsDirty=true;
  updateEditSource(true);
  const {photo,thumb}=await finishPhoto(engine.render(recipe,{source:'edit',crop:recipe.crop,...output}),recipe,e.taken,e.cutout);
  // A cut-out keeps its mask with the photo (a PNG of the alpha), so a re-edit opens with the background still gone.
  const mask=e.cutout?await toBlob(e.cutout,'image/png'):null;
  const shot=await keep({photo,source:e.sourceBlob,thumb,recipe,...output,taken:e.taken.getTime(),edited:Date.now(),...(mask?{mask}:{})});
  eraser.reset();makeupGuide.reset();engine.dropSource('edit');engine.dropSource('edit-original');e.picture?.close?.();state.edit=null;
  if(shot){state.viewing=shot;await openViewer(shot.id);}else show('camera');
  if(shot)toast('Saved to the app album');
 }catch(err){console.error(err);toast('The photo could not be saved to the app album',{face:errorFace(),ms:2400});}
 finally{e.saving=false;button.disabled=false;$('cancelEdit').disabled=false;button.textContent='Save copy';}
});
// Comparison state is shared by the labelled side button and the existing hold gesture.
function comparePhoto(on,pinned=false){
 const e=state.edit;if(!e)return;e.comparing=on;e.comparePinned=pinned;
 $('compareOriginal').setAttribute('aria-pressed',String(on));$('original').hidden=!on;
 editStickers.hidden=on||e.erasing||e.cropping||e.aligning;makeupGuide.active=e.aligning&&!on;invalidate();
}
$('compareOriginal').addEventListener('click',()=>{const on=!state.edit?.comparePinned;comparePhoto(on,on);});
// Hold the picture to see the original. Not while zoomed in, where a finger held still is the start of a drag (the
// Original button compares there); a second finger, a pinch, ends it.
{
 const stage=$('editPictureArea');let holding=null,at=null;const down=new Set();
 const end=e=>{if(e?.pointerId!=null)down.delete(e.pointerId);clearTimeout(holding);holding=null;if(state.edit?.comparing&&!state.edit.comparePinned)comparePhoto(false);};
 stage.addEventListener('pointerdown',e=>{
  if(!state.edit||e.target.closest('button')||state.edit.erasing||state.edit.cropping||state.edit.aligning)return;
  down.add(e.pointerId);if(down.size>1||editZoom.zoomed){end();return;}
  at={x:e.clientX,y:e.clientY};
  holding=setTimeout(()=>{if(!state.edit)return;comparePhoto(true);},140);
 });
 // A swipe is not a hold.
 stage.addEventListener('pointermove',e=>{if(holding&&at&&Math.hypot(e.clientX-at.x,e.clientY-at.y)>10){clearTimeout(holding);holding=null;}});
 for(const type of ['pointerup','pointercancel','pointerleave'])stage.addEventListener(type,end);
 gestures(stage,{onTap:e=>{if(!state.edit||state.edit.erasing||state.edit.cropping)return;if(state.edit.faceTapWanted){faceTap(e);return;}focusTap(e,state.edit.recipe,'editFrame');},swipe:()=>!editZoom.zoomed});
}
function selectTab(tab){
 if(state.edit&&tab!=='adjust'){state.edit.detecting=null;setMakeupAlignment(false);}
 if(tab!=='erase')eraser.clearSuggestions();
 for(const [id,panel,name] of [['tabLooks','panelLooks','looks'],['tabCrop','panelCrop','crop'],['tabAdjust','panelAdjust','adjust'],['tabErase','panelErase','erase'],['tabStickers','panelStickers','stickers'],['tabFrame','panelFrame','frame']]){
  $(id).setAttribute('aria-selected',String(tab===name));$(panel).hidden=tab!==name;
 }
 // Erasing paints on the photo itself: the stickers step aside (they are not erased) and come back after.
 const erasing=tab==='erase';
 const cropping=tab==='crop';
 // The Crop tab's pinch changes the crop itself, so it starts from the whole photo.
 if(cropping)editZoom.reset();
 if(state.edit){state.edit.erasing=erasing;state.edit.cropping=cropping;comparePhoto(false);editStickers.hidden=erasing||cropping;if(erasing||cropping)editStickers.select(null);}
 $('editFrame').classList.toggle('cropping',cropping);$('editFrame').tabIndex=cropping?0:-1;
 eraser.active=erasing;invalidate();
 if(tab==='looks')requestAnimationFrame(()=>renderStripSelection());
 if(tab==='stickers')renderStickerPicker();
 if(tab==='frame')renderFramePanel();
 if(tab==='adjust')renderMakeup();
 if(cropping)renderCropPanel();
}
$('tabLooks').addEventListener('click',()=>selectTab('looks'));
$('tabCrop').addEventListener('click',()=>selectTab('crop'));
$('tabAdjust').addEventListener('click',()=>selectTab('adjust'));
$('tabErase').addEventListener('click',()=>selectTab('erase'));
$('tabStickers').addEventListener('click',()=>selectTab('stickers'));
$('tabFrame').addEventListener('click',()=>selectTab('frame'));

// Crop stays in the recipe; changing shape or zoom always works from the whole source photo.
const CROP_SHAPES=['Original','1:1','4:3','3:4','16:9','9:16'];
function renderCropPanel(){
 const e=state.edit;if(!e)return;
 const c=e.recipe.crop,aspect=c.w*e.width/(c.h*e.height),choices=$('cropShapes');
 choices.textContent='';
 for(const shape of CROP_SHAPES){
  const [a,b]=shape.split(':').map(Number),ratio=shape==='Original'?e.width/e.height:a/b;
  const button=document.createElement('button');button.type='button';button.textContent=shape;button.dataset.shape=shape;button.setAttribute('role','radio');
  button.setAttribute('aria-checked',String(Math.abs(aspect-ratio)<.001&&(shape==='Original'||Math.abs(aspect-e.width/e.height)>=.001)));
  button.addEventListener('click',()=>{if(e.saving)return;setEditCrop(cropAtAspect(e.width,e.height,ratio,cropZoom(e.width,e.height,e.recipe.crop),e.recipe.crop.x+e.recipe.crop.w/2,e.recipe.crop.y+e.recipe.crop.h/2));renderCropPanel();});
  choices.append(button);
 }
 renderCropZoom();
}
function renderCropZoom(){
 const e=state.edit;if(!e)return;const zoom=cropZoom(e.width,e.height,e.recipe.crop);
 $('cropZoom').value=String(Math.round(zoom*100));$('cropZoomValue').textContent=`${zoom.toFixed(1)}×`;
}
function setEditCrop(crop){
 const e=state.edit;if(!e||e.saving)return;e.recipe.crop=normalCrop(crop);renderCropZoom();refreshThumbs(true);invalidate();
}
$('cropZoom').addEventListener('input',event=>{
 const e=state.edit;if(!e)return;const c=e.recipe.crop;
 setEditCrop(cropAtAspect(e.width,e.height,c.w*e.width/(c.h*e.height),+event.target.value/100,c.x+c.w/2,c.y+c.h/2));
});
$('cropReset').addEventListener('click',()=>{setEditCrop(normalCrop());renderCropPanel();});
bindCropGestures($('editFrame'),{edit:()=>state.edit,changed:setEditCrop});

// ---------- Stickers ----------
/**
 * Asks for the words and how they are lettered (a speech balloon, a shout, a thought, a caption, or words alone) in a
 * small sheet; resolves to {text, style}, or null if cancelled.
 */
function askLettering({text='',style='balloon:speech',title='What do they say?'}={}){
 const sheet=$('textSheet'),field=$('balloonText'),styles=$('letteringStyles');
 let chosen=BALLOONS.some(b=>b.id===style)?style:'balloon:speech';
 const sample=()=>BALLOONS.find(b=>b.id===chosen)?.sample||'';
 // A sound effect offers the manga's own: tap one to letter it, or write any.
 const presets=$('soundPresets');presets.textContent='';
 for(const fx of SOUND_EFFECTS){
  const b=document.createElement('button');b.type='button';b.textContent=fx.text;b.title=fx.means;b.setAttribute('aria-label',`${fx.text}: ${fx.means}`);
  b.addEventListener('click',()=>{sound('tick');field.value=fx.text;field.focus();});presets.append(b);
 }
 const paint=()=>{for(const b of styles.children)b.setAttribute('aria-checked',String(b.dataset.style===chosen));field.placeholder=sample();presets.hidden=chosen!=='balloon:sfx';};
 styles.textContent='';
 for(const b of BALLOONS){
  const button=document.createElement('button');button.type='button';button.setAttribute('role','radio');button.dataset.style=b.id;button.textContent=b.label;
  button.addEventListener('click',()=>{sound('tick');chosen=b.id;paint();field.focus();});styles.append(button);
 }
 $('textSheetTitle').textContent=title;field.value=text;sheet.returnValue='';paint();
 return new Promise(resolve=>{
  sheet.onclose=()=>resolve(sheet.returnValue==='ok'&&field.value.trim()?{text:field.value.trim(),style:chosen}:null);
  openSheet(sheet);requestAnimationFrame(()=>{field.focus();field.select();});
 });
}
// Return finishes the words (Shift+Return starts a new line).
$('balloonText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('textSheet').close('ok');}});
async function editBalloonText(layer,i,s){
 const answer=await askLettering({text:s.text,style:s.id});
 if(answer){layer.setText(i,answer.text);layer.setStyle(i,answer.style);}
}
/** A resident's sticker offers their own words (the sheets' lines), to letter as they are or change first. */
async function sayLettering(layer,i,info){
 if(!info?.line)return;
 const who=info.who||'they',answer=await askLettering({text:info.line,style:'balloon:speech',title:who==='they'?'What do they say?':`What does ${who} say?`});
 if(answer){await layer.sayAs(i,answer);sound('pop');}
}
const cameraStickers=createStickerLayer($('cameraFrame'),{list:()=>state.camera.recipe.stickers,changed:remember,editText:(i,s)=>editBalloonText(cameraStickers,i,s),say:(i,info)=>sayLettering(cameraStickers,i,info)});
const editStickers=createStickerLayer($('editFrame'),{list:()=>state.edit?.recipe.stickers||[],changed:()=>{},editText:(i,s)=>editBalloonText(editStickers,i,s),say:(i,info)=>sayLettering(editStickers,i,info)});
const stickerLayer=()=>state.mode==='editor'?editStickers:state.mode==='camera'?cameraStickers:null;
// Makeup is prepared once when its controls or the underlying photo change. The recipe retains the source and
// placement, so colour/smoothing remain reversible after saving and reopening a copy.
function updateEditSource(full=false){
 const e=state.edit;if(!e||!engine||engine.lost()||(!e.makeupDirty&&!e.stampsDirty&&e.makeupFull===full))return;
 const m=e.recipe.makeup,active=makeupActive(m,e.recipe.faces);
 // Face stickers drawn on the photo go in after the makeup, before the Looks; changing only them keeps the makeup pass.
 const stamps=normaliseStamps(e.recipe.stamps),drawn=!!m.face&&stamps.finish==='drawn'&&stampsActive(stamps);
 // (Turning drawn stickers on or off rebuilds the base: a large photo is previewed at 1,280 px while anything is drawn on it.)
 if(!e.makeupDirty&&e.makeupFull===full&&e.makeupBase&&e.baseDrawn===drawn){
  composeEditSource(e,stamps,drawn);e.stampsDirty=false;return;
 }
 let source=e.picture;
 if((active||drawn)&&!full&&Math.max(e.width,e.height)>1280){
  if(!e.makeupPreview||e.makeupPreviewDirty){
   const c=e.makeupPreview||document.createElement('canvas'),scale=1280/Math.max(e.width,e.height);
   c.width=Math.round(e.width*scale);c.height=Math.round(e.height*scale);c.getContext('2d').drawImage(e.picture,0,0,c.width,c.height);
   e.makeupPreview=c;e.makeupPreviewDirty=false;e.makeupCache=null;
  }
  source=e.makeupPreview;
 }
 const base=active?applyMakeup(source,m,e.makeupCanvas,e.recipe.faces,full?null:(e.makeupCache??={})):source;
 if(active)e.makeupCanvas=base;else if(e.makeupCanvas){e.makeupCanvas.width=e.makeupCanvas.height=1;e.makeupCanvas=null;}
 e.makeupBase=base;e.baseDrawn=drawn;e.makeupDirty=false;e.stampsDirty=false;e.makeupFull=full;
 composeEditSource(e,stamps,drawn);
}
/** The edit source from the makeup pass and the drawn face stickers; the original is kept beside it for comparing. */
function composeEditSource(e,stamps,drawn){
 let prepared=drawn?e.makeupBase:e.makeupCanvas||e.picture;
 if(drawn){
  const c=e.stampCanvas||(e.stampCanvas=document.createElement('canvas')),w=prepared.width,h=prepared.height;
  if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
  const g=c.getContext('2d');g.clearRect(0,0,w,h);g.drawImage(prepared,0,0,w,h);
  drawFaceStamps(g,stamps,e.recipe.makeup.face,w,h,{images:stampImages,finish:'drawn',face:e.recipe.faces[0]});   // a hat not loaded yet is drawn when it arrives (setStamps)
  prepared=c;
 }else if(e.stampCanvas){e.stampCanvas.width=e.stampCanvas.height=1;e.stampCanvas=null;}
 e.makeupRendered=prepared!==e.picture;
 if(e.makeupRendered){
  if(!engine.hasSource('edit-original')||e.originalRevision!==e.sourceRevision){engine.setSource('edit-original',e.picture,e.width,e.height);e.originalRevision=e.sourceRevision;}
 }else engine.dropSource('edit-original');
 engine.setSource('edit',prepared,prepared.width,prepared.height);
}
// Face stickers with the sticker finish: a layer over the photo in the editor, printed by finishPhoto on a save.
const stampsArt=document.createElement('canvas');stampsArt.className='stamps-art';stampsArt.setAttribute('aria-hidden','true');stampsArt.hidden=true;
$('editFrame').insertBefore(stampsArt,$('editFrame').querySelector('.stickers'));
function paintStamps(){
 const e=state.edit,art=stampsArt;if(!e){art.hidden=true;return;}
 const stamps=normaliseStamps(e.recipe.stamps),face=e.recipe.makeup.face;
 const show=!!face&&stamps.finish==='sticker'&&stampsActive(stamps)&&!e.comparing&&!e.erasing&&!e.cropping;
 art.hidden=!show;if(!show)return;
 const frame=$('editFrame'),dpr=viewDetail(frame,Math.min(3,devicePixelRatio||1)),w=Math.round(frame.clientWidth*dpr),h=Math.round(frame.clientHeight*dpr);
 if(!w||!h)return;
 if(art.width!==w||art.height!==h){art.width=w;art.height=h;}
 const g=art.getContext('2d'),crop=e.recipe.crop,sw=w/crop.w,sh=h/crop.h;
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,w,h);g.translate(-crop.x*sw,-crop.y*sh);
 drawFaceStamps(g,stamps,face,sw,sh,{images:stampImages,finish:'sticker',face:e.recipe.faces[0]});g.setTransform(1,0,0,1,0,0);
}
// A handle dragged (makeup-guide.js) moves the found face's own points with it (face-pack.js), so what is drawn from
// them follows; the guide is then derived again from the corrected face.
const makeupGuide=createMakeupGuide($('editFrame'),{edit:()=>state.edit,outline:e=>{const f=e?.recipe.faces[0];return f?{oval:f.oval,lips:f.lipsOuter}:null;},changed:(guide,from)=>{
 const e=state.edit;if(!e||e.saving)return;
 const face=e.recipe.faces[0];
 if(face&&from&&e.guideSynced){
  // One drag: measured from the guide it started with, applied to the face as it was then (not to the face corrected
  // and derived again after the last move, whose box and angle have moved with it).
  if(e.dragFrom?.from!==from)e.dragFrom={from,face};
  const next=syncFaceToGuide(e.dragFrom.face,from,guide,e.width,e.height);
  if(next){e.recipe.faces[0]=next;e.recipe.makeup.face=guideFromFace(next,e.width,e.height);}
 }
 e.guideSynced=JSON.parse(JSON.stringify(e.recipe.makeup.face));
 e.makeupDirty=true;e.stampsDirty=true;renderMakeup();refreshThumbs(true);invalidate();
}});
function renderMakeup(message){
 const e=state.edit;if(!e)return;
 const m=normaliseMakeup(e.recipe.makeup),faces=makeupFaces(m,e.recipe.faces),placed=faces.length>0,look=MAKEUP_LOOKS.find(l=>l.id===m.look);
 const shade=MAKEUP_SHADES.find(s=>s.id===m.shade);
 $('makeupSummary').textContent=m.look==='none'?'Off':(look?look.label:'Custom')+(shade?` · ${shade.label}`:'');
 const strip=$('makeupStrip');
 if(!strip.childElementCount)buildMakeupStrip();
 strip.hidden=!placed;
 for(const t of strip.children)t.setAttribute('aria-checked',String(t.dataset.look===m.look));
 $('makeupStrengthRow').hidden=!placed||m.look==='none';
 $('makeupStrength').value=Math.round(m.strength*100);$('makeupStrengthValue').textContent=Math.round(m.strength*100)+'%';
 for(const [name,key] of [['Skin','skin'],['Lips','lips'],['Blush','blush'],['Eyes','eyes'],['Teeth','teeth']]){
  const v=Math.round(m.tune[key]*100);$('makeup'+name).value=v;$('makeup'+name).disabled=!placed||e.saving||m.look==='none';$('makeup'+name+'Value').textContent=v+'%';
 }
 // Lip colour: a row of swatches under the strip (the owner, 3 November 2026: "I want to be able to choose more colors
 // in the lipstick"); the first is the look's own shade, the chosen one is named beside the row's title.
 const shades=document.querySelector('.makeup-shades');
 if(!shades.childElementCount){
  for(const sh of [{id:'auto',label:'As the look',colour:''},...MAKEUP_SHADES]){const b=document.createElement('button');b.type='button';b.dataset.shade=sh.id;b.setAttribute('aria-pressed','false');b.setAttribute('aria-label',sh.label);b.title=sh.label;b.innerHTML='<i></i>';if(sh.colour)b.firstChild.style.setProperty('--swatch',sh.colour);else b.firstChild.className='auto';shades.append(b);}
 }
 const lipsOn=placed&&m.look!=='none';
 for(const b of shades.children){b.setAttribute('aria-pressed',String(b.dataset.shade===m.shade));b.disabled=!lipsOn;}
 shades.hidden=!lipsOn;$('makeupColourRow').hidden=!lipsOn;$('makeupShadeName').textContent=shade?shade.label:'As the look';
 $('makeupFace').setAttribute('aria-pressed',String(!!e.aligning));$('makeupFace').hidden=!placed&&e.faceStatus!=='none'&&e.faceStatus!=='failed';
 $('makeupHint').textContent=message??(e.aligning?'Drag the handles onto the eyes and the lips.':faceStatusCopy(e));
 if(placed&&!$('makeupControls').hidden)drawMakeupThumbs();
}
/** The strip: Off, then every look; each tile shows this face wearing it (drawMakeupThumbs). */
function buildMakeupStrip(){
 const strip=$('makeupStrip');strip.textContent='';
 for(const l of [{id:'none',label:'Off'},...MAKEUP_LOOKS]){
  const b=document.createElement('button');b.type='button';b.className='tile';b.setAttribute('role','radio');b.dataset.look=l.id;b.setAttribute('aria-checked','false');
  const face=document.createElement('span');face.className='face';const c=document.createElement('canvas');c.width=c.height=THUMB;face.append(c);
  const name=document.createElement('span');name.className='name';name.textContent=l.label;b.append(face,name);strip.append(b);
 }
}
// The thumbnails are this face cut square from the preview picture, each look drawn on it once; drawn again only
// when the face or the picture changes.
let thumbTask=0;
function drawMakeupThumbs(){
 const e=state.edit;if(!e)return;
 const m=normaliseMakeup(e.recipe.makeup),faces=makeupFaces(m,e.recipe.faces);if(!faces.length)return;
 const picture=e.makeupPreview||e.picture,W=picture.width,H=picture.height,crop=faceCrop(faces[0],W,H);
 const key=JSON.stringify([faces[0],e.sourceRevision||0,crop]);
 if(e.thumbKey===key)return;e.thumbKey=key;
 const size=THUMB,c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d',{willReadFrequently:true});
 // the square crop drawn into the tile: the longer side fills it
 const sw=crop.w*W,sh=crop.h*H,k=size/Math.max(sw,sh),dw=sw*k,dh=sh*k;
 g.fillStyle='#000';g.fillRect(0,0,size,size);g.drawImage(picture,crop.x*W,crop.y*H,sw,sh,(size-dw)/2,(size-dh)/2,dw,dh);
 const plain=g.getImageData(0,0,size,size);
 const inCrop=facesInCrop(faces,{x:crop.x-((size-dw)/2)/k/W,y:crop.y-((size-dh)/2)/k/H,w:size/k/W,h:size/k/H});
 const tiles=[...$('makeupStrip').children],task=++thumbTask;
 let i=0;const step=()=>{
  if(task!==thumbTask||state.edit!==e)return;
  const t=tiles[i++];if(!t)return;
  const look=t.dataset.look,out=look==='none'?plain:makeupPixels(plain,{look,strength:1},inCrop);
  t.querySelector('canvas').getContext('2d').putImageData(out instanceof ImageData?out:new ImageData(out.data,size,size),0,0);t.querySelector('canvas').classList.add('drawn');
  requestAnimationFrame(step);
 };
 step();
}
function setMakeup(change){
 const e=state.edit;if(!e||e.saving)return;
 const m=normaliseMakeup(e.recipe.makeup);change(m);e.recipe.makeup=m;e.makeupDirty=true;renderMakeup();refreshThumbs(true);invalidate();
}
function setMakeupAlignment(on){
 const e=state.edit;if(!e)return;
 if(on&&!e.recipe.makeup.face){
  const c=e.recipe.crop;e.recipe.makeup.face=normaliseMakeup({face:{x:c.x+c.w*.25,y:c.y+c.h*.12,w:c.w*.5,h:c.h*.76}}).face;e.guideSynced=null;
 }
 const starting=!!on&&!e.aligning;
 e.aligning=!!on;makeupGuide.active=!!on;
 // The handles come on over the face up close (zoom-view.js), once the photo has its room.
 if(starting)requestAnimationFrame(()=>requestAnimationFrame(()=>{if(state.edit===e&&e.aligning)showFace();}));
 // While the guide is on, the panel gives the photo room to see a face by (camera-ui.css .editor.aligning).
 $('editor').classList.toggle('aligning',!!on);
 editStickers.hidden=!!on||e.comparing||e.erasing||e.cropping;
 renderMakeup();renderFun();invalidate();
}
/**
 * A face found is shown up close (zoom-view.js), to check the guide's eyes and lips against the photo's: the face
 * about two thirds of the photo area's height (and within its width), never closer than the photo allows, and not at
 * all when the face already fills that much.
 */
function showFace(){
 const e=state.edit,f=e?.recipe.makeup.face,frame=$('editFrame'),area=$('editPictureArea');if(!f||!frame.offsetHeight)return;
 const c=e.recipe.crop,fw=f.w/c.w*frame.offsetWidth,fh=f.h/c.h*frame.offsetHeight;
 const s=Math.min(3,area.clientHeight*.66/Math.max(1,fh),area.clientWidth*.8/Math.max(1,fw));
 if(s<1.2)return;
 editZoom.show(s,(f.x+f.w/2-c.x)/c.w,(f.y+f.h/2-c.y)/c.h);
}
/**
 * The faces of a photo are found by the app when the photo opens (face-pack.js, in a worker), never placed by hand:
 * the recipe keeps them, the guide (makeup.js's face) is derived from the largest, and Makeup, the Face stickers and
 * the handles work from it. "Tap the face?" looks again round a tap; failing that, the handles are placed there.
 */
function faceStatusCopy(e){
 if(!e)return '';
 if(e.faceStatus==='finding')return 'Looking for the face…';
 if(e.faceStatus==='none')return 'I can’t see a face here. Tap the face?';
 if(e.faceStatus==='failed')return 'The face finder isn’t available here. Tap the face?';
 return '';
}
function adoptGuide(e){
 const face=e.recipe.faces[0];if(!face)return;
 e.recipe.makeup.face=guideFromFace(face,e.width,e.height);e.guideSynced=JSON.parse(JSON.stringify(e.recipe.makeup.face));
 e.makeupDirty=true;e.stampsDirty=true;
}
function renderFaceStatus(){const e=state.edit;if(!e)return;$('editFrame').classList.toggle('finding',e.faceStatus==='finding');renderMakeup();renderFun();invalidate();}
function prepareFaces(e,{around=null}={}){
 if(!e||e.saving)return Promise.resolve([]);
 if(!around){
  if(e.recipe.faces.length){e.faceStatus='found';if(!e.recipe.makeup.face)adoptGuide(e);return Promise.resolve(e.recipe.faces);}
  if(e.finding)return e.finding;
  // Looked already and saw nothing: only a tap (around) looks again.
  if(e.faceStatus==='none'||e.faceStatus==='failed')return Promise.resolve([]);
 }
 const picture=e.picture;e.faceStatus='finding';e.faceTapWanted=false;renderFaceStatus();
 const task=findFaces(picture,{around}).then(faces=>{
  if(state.edit!==e||e.picture!==picture)return faces;
  if(faces.length){e.recipe.faces=faces;e.faceStatus='found';adoptGuide(e);refreshThumbs(true);sound('pop');warmMakeup(e);remeasureAuto(e);}
  else{e.faceStatus='none';e.faceTapWanted=true;}
  return faces;
 }).catch(error=>{console.warn('Face finder',error);if(state.edit===e&&e.picture===picture){e.faceStatus='failed';e.faceTapWanted=true;}return [];})
 .finally(()=>{if(state.edit===e){e.finding=null;renderFaceStatus();}});
 e.finding=task;return task;
}
/** The look-independent part of the makeup pass (masks, colour, blurs) done when the page is idle, so the first look
 *  tapped is drawn at once. On the picture the preview draws from (makeupPreview or the picture itself). */
function warmMakeup(e){
 const idle=globalThis.requestIdleCallback||(fn=>setTimeout(fn,120));
 idle(()=>{
  if(state.edit!==e||!e.recipe.faces.length||e.saving)return;
  try{
   if(Math.max(e.width,e.height)>1280&&(!e.makeupPreview||e.makeupPreviewDirty)){
    const c=e.makeupPreview||document.createElement('canvas'),scale=1280/Math.max(e.width,e.height);
    c.width=Math.round(e.width*scale);c.height=Math.round(e.height*scale);c.getContext('2d').drawImage(e.picture,0,0,c.width,c.height);
    e.makeupPreview=c;e.makeupPreviewDirty=false;e.makeupCache=null;
   }
   const source=Math.max(e.width,e.height)>1280?e.makeupPreview:e.picture;
   e.makeupCanvas??=document.createElement('canvas');
   prepareMakeup(makeupSourcePixels(source,e.makeupCanvas,e.makeupCache??={}),e.recipe.faces);
  }catch(error){console.warn('Makeup groundwork',error);}
 });
}
/** A tap on the photo while the face was not found: look again round it, or place the handles there. */
async function faceTap(event){
 const e=state.edit;if(!e||!e.faceTapWanted||e.saving)return false;
 const r=$('editFrame').getBoundingClientRect();if(!r.width||event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)return false;
 const c=e.recipe.crop,at={x:c.x+(event.clientX-r.left)/r.width*c.w,y:c.y+(event.clientY-r.top)/r.height*c.h};
 sound('tick');
 const faces=e.faceStatus==='failed'?[]:await prepareFaces(e,{around:at});
 if(state.edit!==e||faces.length)return true;
 // Nothing seen round the tap: the guide goes there, as big as a face at a tap would be, and the handles come on.
 const w=c.w*.36,h=c.h*.3;
 e.recipe.makeup.face=normaliseMakeup({face:{x:at.x-w/2,y:at.y-h*.45,w,h}}).face;e.guideSynced=null;e.faceTapWanted=false;e.makeupDirty=true;
 setMakeupAlignment(true);return true;
}
const findMakeupFace=()=>prepareFaces(state.edit);
$('makeupPhoto').addEventListener('click',()=>{
 const e=state.edit;if(!e||e.saving)return;
 const open=$('makeupControls').hidden;$('makeupControls').hidden=!open;$('makeupPhoto').setAttribute('aria-expanded',String(open));
 if(!open){e.detecting=null;setMakeupAlignment(false);}else renderMakeup();
});
$('makeupFace').addEventListener('click',()=>{if(state.edit&&!state.edit.saving){state.edit.detecting=null;setMakeupAlignment(!state.edit.aligning);}});
$('makeupStrip').addEventListener('click',ev=>{
 const t=ev.target.closest('.tile');if(!t||!state.edit)return;
 const look=t.dataset.look;sound(look==='none'?'tick':'pop');
 setMakeup(m=>{m.look=look;if(look!=='none'){m.strength=1;}});
});
$('makeupStrength').addEventListener('input',ev=>setMakeup(m=>{m.strength=ev.target.value/100;}));
for(const [name,key] of [['Skin','skin'],['Lips','lips'],['Blush','blush'],['Eyes','eyes'],['Teeth','teeth']])$('makeup'+name).addEventListener('input',ev=>{
 setMakeup(m=>{m.tune[key]=ev.target.value/100;});
});
document.querySelector('.makeup-shades').addEventListener('click',ev=>{
 const b=ev.target.closest('button');if(!b||!state.edit||b.disabled)return;sound('tick');
 setMakeup(m=>{m.shade=b.dataset.shade;});
});
/** One face guide, two sections: the face finder speaks in both. */
function faceMessage(text){renderMakeup(text);renderFun(text);}

// ---------- Face stickers (face-stamps.js) ----------
// The residents' brows and eyes and the Halloween headpieces, on the same face guide as Makeup. A style is chosen from
// small pictures drawn by World's own face painter; sliders change the recipe without rebuilding the row they sit in.
let funPart='brows',funTiles=[],funRender=0;
const FUN_SLIDERS={
 brows:[{key:'mood',label:'Mood',min:-150,max:190,step:5,get:s=>s.brows.mood*100,set:(s,v)=>{s.brows.mood=v/100;},text:v=>moodLabel(v/100)},
  {key:'size',label:'Size',min:50,max:180,step:1,get:s=>s.brows.size*100,set:(s,v)=>{s.brows.size=v/100;},text:v=>Math.round(v)+'%'},
  {key:'height',label:'Height',min:-100,max:100,step:1,get:s=>s.brows.height*100,set:(s,v)=>{s.brows.height=v/100;},text:v=>(v>0?'+':'')+Math.round(v)}],
 eyes:[{key:'size',label:'Size',min:60,max:160,step:1,get:s=>s.eyes.size*100,set:(s,v)=>{s.eyes.size=v/100;},text:v=>Math.round(v)+'%'}],
 shine:[{key:'shine',label:'Shine',min:0,max:100,step:1,get:s=>s.shine*100,set:(s,v)=>{s.shine=v/100;},text:v=>Math.round(v)+'%'}],
 hat:[{key:'size',label:'Size',min:60,max:160,step:1,get:s=>s.hat.size*100,set:(s,v)=>{s.hat.size=v/100;},text:v=>Math.round(v)+'%'},
  {key:'height',label:'Height',min:-100,max:100,step:1,get:s=>s.hat.height*100,set:(s,v)=>{s.hat.height=v/100;},text:v=>(v>0?'+':'')+Math.round(v)}],
};
const partOn=(s,part)=>part==='brows'?s.brows.style!=='none':part==='eyes'?s.eyes.style!=='none':part==='hat'?s.hat.id!=='none':true;
/** Changes the face stickers; the first one on a photo without a placed face looks for the face first. */
function setStamps(change,{rebuild=true}={}){
 const e=state.edit;if(!e||e.saving)return null;
 const s=normaliseStamps(e.recipe.stamps);change(s);e.recipe.stamps=s;e.stampsDirty=true;invalidate();
 if(!e.recipe.makeup.face&&stampsActive(s)&&!e.detecting)findMakeupFace();
 if(s.hat.id!=='none'&&!stampImages.has(s.hat.id))loadStampImages(s).then(()=>{if(state.edit===e){e.stampsDirty=true;invalidate();}}).catch(()=>toast('The hat could not be loaded',{face:errorFace(),ms:2200}));
 if(rebuild){renderFun();if(s.finish==='drawn')refreshThumbs(true);}
 else $('funSummary').textContent=stampsLabel(s);
 return s;
}
function renderFun(message){
 const e=state.edit;if(!e)return;
 const s=normaliseStamps(e.recipe.stamps),placed=!!e.recipe.makeup.face,who=characterOf(s);
 $('funSummary').textContent=stampsLabel(s);
 const strip=$('funStrip');if(!strip.childElementCount)buildFunStrip();
 strip.hidden=!placed;
 for(const t of strip.children)t.setAttribute('aria-checked',String(t.dataset.character===(who?who.id:stampsActive(s)?'custom':'none')));
 if(placed&&!$('funControls').hidden)drawFunThumbs();
 $('funAlign').setAttribute('aria-pressed',String(!!e.aligning));$('funAlign').hidden=!placed&&e.faceStatus!=='none'&&e.faceStatus!=='failed';
 for(const b of $('funParts').children)b.setAttribute('aria-checked',String(b.dataset.part===funPart));
 for(const b of $('funFinish').children)b.setAttribute('aria-checked',String(b.dataset.finish===s.finish));
 $('funHint').textContent=message??(e.aligning?'Drag the handles onto the eyes.':faceStatusCopy(e));
 if(!$('funControls').hidden)renderFunPart(s);
}
/** The strip: Off, then every character; each tile shows this face as that character (drawFunThumbs). */
function buildFunStrip(){
 const strip=$('funStrip');strip.textContent='';
 for(const c of [{id:'none',label:'Off'},...CHARACTERS]){
  const b=document.createElement('button');b.type='button';b.className='tile';b.setAttribute('role','radio');b.dataset.character=c.id;b.setAttribute('aria-checked','false');
  const face=document.createElement('span');face.className='face';const canvas=document.createElement('canvas');canvas.width=canvas.height=THUMB;face.append(canvas);
  const name=document.createElement('span');name.className='name';name.textContent=c.label;b.append(face,name);strip.append(b);
 }
}
let funThumbTask=0;
async function drawFunThumbs(){
 const e=state.edit;if(!e)return;
 const faces=makeupFaces(normaliseMakeup(e.recipe.makeup),e.recipe.faces);if(!faces.length)return;
 const picture=e.makeupPreview||e.picture,W=picture.width,H=picture.height,crop=faceCrop(faces[0],W,H);
 const key=JSON.stringify([faces[0],e.sourceRevision||0,crop]);
 if(e.funThumbKey===key)return;e.funThumbKey=key;
 const task=++funThumbTask,size=THUMB,sw=crop.w*W,sh=crop.h*H,k=size/Math.max(sw,sh),dw=sw*k,dh=sh*k;
 const inCrop=facesInCrop(faces,{x:crop.x-((size-dw)/2)/k/W,y:crop.y-((size-dh)/2)/k/H,w:size/k/W,h:size/k/H})[0],guide=guideFromFace(inCrop,size,size);
 // the hats first, so every tile is drawn whole
 try{await Promise.all(CHARACTERS.flatMap(c=>c.variants.map(v=>loadStampImages(v))));}catch{}
 if(task!==funThumbTask||state.edit!==e)return;
 for(const t of $('funStrip').children){
  const canvas=t.querySelector('canvas'),g=canvas.getContext('2d');
  g.fillStyle='#000';g.fillRect(0,0,size,size);g.drawImage(picture,crop.x*W,crop.y*H,sw,sh,(size-dw)/2,(size-dh)/2,dw,dh);
  const c=CHARACTERS.find(c=>c.id===t.dataset.character);
  if(c)drawFaceStamps(g,c.variants[0],guide,size,size,{images:stampImages,face:inCrop});
  canvas.classList.add('drawn');
 }
}
function funTile(id,label,selected){
 const b=document.createElement('button');b.type='button';b.className='fun-tile';b.setAttribute('role','radio');
 b.setAttribute('aria-checked',String(selected));b.dataset.id=id;b.setAttribute('aria-label',label);b.title=label;return b;
}
function funLabel(b,label){const t=document.createElement('span');t.textContent=label;b.append(t);return b;}
function noneTile(selected){const b=funTile('none','None',selected),n=document.createElement('span');n.className='none';n.setAttribute('aria-hidden','true');n.textContent='–';b.append(n);return funLabel(b,'None');}
function drawFunTiles(s){for(const {canvas,part,id} of funTiles)partPreview(canvas,part,{...s,[part]:{...s[part],style:id}});}
async function renderFunPart(s){
 const part=funPart,run=++funRender,tiles=$('funTiles'),colours=$('funColours'),sliders=$('funSliders');
 tiles.setAttribute('aria-label',{brows:'Brows',eyes:'Eyes',shine:'Shine',hat:'Hat'}[part]);
 tiles.textContent='';colours.textContent='';sliders.textContent='';funTiles=[];
 if(part==='brows'||part==='eyes'){
  const list=part==='brows'?BROW_STYLES.map(id=>({id,label:BROW_LABELS[id]})):EYE_STYLES.map(x=>({id:x.id,label:x.label}));
  tiles.append(noneTile(s[part].style==='none'));
  for(const {id,label} of list){const b=funTile(id,label,s[part].style===id),c=document.createElement('canvas');c.width=120;c.height=80;b.append(c);funLabel(b,label);tiles.append(b);funTiles.push({canvas:c,part,id});}
  drawFunTiles(s);
  for(const c of part==='brows'?BROW_COLOURS:EYE_COLOURS){
   const b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.dataset.colour=c.id;b.setAttribute('aria-label',c.label);b.title=c.label;
   b.setAttribute('aria-checked',String(s[part].colour===c.id));b.innerHTML='<i></i>';b.firstChild.style.setProperty('--swatch',c.colour);colours.append(b);
  }
  colours.setAttribute('aria-label',part==='brows'?'Brow colour':'Iris colour');
 }else if(part==='hat'){
  tiles.append(noneTile(s.hat.id==='none'));
  let hats=[];try{hats=await hatChoices();}catch{hats=[];}
  if(run!==funRender)return;
  for(const h of hats){const b=funTile(h.id,h.gloss,s.hat.id===h.id),img=document.createElement('img');img.alt='';img.src=h.thumbUrl;b.append(img);funLabel(b,h.gloss);tiles.append(b);}
  if(!hats.length){const p=document.createElement('p');p.className='fine';p.textContent='The hats could not be loaded.';tiles.append(p);}
 }
 for(const d of FUN_SLIDERS[part]){
  const label=document.createElement('label'),input=document.createElement('input'),out=document.createElement('output');
  input.type='range';input.min=d.min;input.max=d.max;input.step=d.step;input.value=Math.round(d.get(s));input.id='fun-'+part+'-'+d.key;input.dataset.key=d.key;
  input.disabled=!partOn(s,part)&&part!=='shine';out.textContent=d.text(+input.value);out.setAttribute('for',input.id);
  label.append(d.label,input,out);sliders.append(label);
 }
}
$('funPhoto').addEventListener('click',()=>{
 const e=state.edit;if(!e||e.saving)return;
 const open=$('funControls').hidden;$('funControls').hidden=!open;$('funPhoto').setAttribute('aria-expanded',String(open));sound('tick');
 if(open){renderFun();if(!e.recipe.makeup.face)findMakeupFace();}
 else if($('makeupControls').hidden){e.detecting=null;setMakeupAlignment(false);}
});
$('funAlign').addEventListener('click',()=>{if(state.edit&&!state.edit.saving){state.edit.detecting=null;setMakeupAlignment(!state.edit.aligning);}});
$('funReset').addEventListener('click',()=>{if(!state.edit||state.edit.saving)return;sound('tick');setStamps(s=>Object.assign(s,normaliseStamps({finish:s.finish})));});
$('funStrip').addEventListener('click',ev=>{
 const t=ev.target.closest('.tile');if(!t||!state.edit)return;const id=t.dataset.character;
 if(id==='none'){sound('tick');setStamps(s=>Object.assign(s,normaliseStamps({finish:s.finish})));return;}
 sound('pop');const next=characterStamps(id,state.edit.recipe.stamps);if(next)setStamps(s=>Object.assign(s,next));
});
$('funParts').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||!state.edit)return;sound('tick');funPart=b.dataset.part;renderFun();});
$('funFinish').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;sound('tick');setStamps(s=>{s.finish=b.dataset.finish;});refreshThumbs(true);});
$('funTiles').addEventListener('click',ev=>{
 const b=ev.target.closest('.fun-tile');if(!b)return;sound('tick');const id=b.dataset.id;
 setStamps(s=>{if(funPart==='hat')s.hat.id=id;else s[funPart].style=id;});
});
$('funColours').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;sound('tick');setStamps(s=>{s[funPart].colour=b.dataset.colour;});});
$('funSliders').addEventListener('input',ev=>{
 const input=ev.target;if(input.type!=='range')return;const d=FUN_SLIDERS[funPart].find(x=>x.key===input.dataset.key);if(!d)return;
 const s=setStamps(x=>d.set(x,+input.value),{rebuild:false});if(!s)return;
 input.nextElementSibling.textContent=d.text(+input.value);if(funPart==='brows')drawFunTiles(s);
});
$('funSliders').addEventListener('change',()=>{if(normaliseStamps(state.edit?.recipe.stamps).finish==='drawn')refreshThumbs(true);});
$('makeupReset').addEventListener('click',()=>{const e=state.edit;if(!e||e.saving)return;sound('tick');e.recipe.makeup=normaliseMakeup({look:'none',face:e.recipe.makeup.face});e.makeupDirty=true;setMakeupAlignment(false);renderMakeup();refreshThumbs(true);invalidate();});
// Erase (erase.js): paint over what should go; the editor's picture changes, the Looks redraw over it.
const eraser=createEraser($('editFrame'),{
 edit:()=>state.edit,
 changed:picture=>{const e=state.edit;if(!e)return;e.erased=true;e.detecting=null;e.sourceRevision=(e.sourceRevision||0)+1;e.makeupDirty=true;e.makeupPreviewDirty=true;updateEditSource();$('eraseUndo').disabled=!eraser.canUndo;refreshThumbs(true);invalidate();},
 suggestionsChanged:items=>{
  const list=$('eraseSuggestions');list.textContent='';$('eraseClear').hidden=!items.length;
  items.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.setAttribute('aria-label',`Heal suggested spot ${i+1}`);b.addEventListener('click',()=>eraser.healSuggestion(i));list.append(b);});
  $('eraseHint').textContent=items.length?'Tap a numbered spot to heal it, or paint over another area.':'Paint over what should go.';
 },
 busy:on=>{$('eraseHint').textContent=on?'Working…':$('eraseSuggestions').childElementCount?'Tap a numbered spot to heal it, or paint over another area.':'Paint over what should go.';$('saveEdit').disabled=on;$('cancelEdit').disabled=on;$('eraseSuggest').disabled=on;$('eraseUndo').disabled=on||!eraser.canUndo;for(const b of $('eraseSuggestions').children)b.disabled=on;if(!on)sound('pop');},
 failed:()=>toast('That could not be erased',{face:errorFace(),ms:2200}),
});
$('eraseSuggest').addEventListener('click',async()=>{
 if(!state.edit||state.edit.saving||eraser.working||eraser.analyzing)return;
 const e=state.edit,count=await eraser.analyze();
 if(state.edit===e&&!count)$('eraseHint').textContent='No isolated spots found. Paint over an area to remove it.';
});
$('eraseClear').addEventListener('click',()=>eraser.clearSuggestions());
$('eraseSize').addEventListener('input',e=>{eraser.size=e.target.value;});
$('eraseUndo').addEventListener('click',()=>{if(eraser.working)return;sound('tick');eraser.undo();$('eraseUndo').disabled=!eraser.canUndo;});
// Remove background (background.js; the owner, 3 November 2026): the subject kept, the rest see-through. The mask is
// kept beside the picture: shown as a CSS mask over the preview (cutoutView) and applied to the saved PNG (finishPhoto).
let cutoutKey='';
function cutoutView(url){
 if(cutoutKey===(url||''))return;cutoutKey=url||'';
 for(const k of ['webkitMaskImage','maskImage'])canvas.style[k]=url?`url("${url}")`:'';
 for(const k of ['webkitMaskSize','maskSize'])canvas.style[k]=url?'100% 100%':'';
 for(const k of ['webkitMaskRepeat','maskRepeat'])canvas.style[k]=url?'no-repeat':'';
}
/** The preview's mask for the current crop (an unchanged crop and mask cost nothing). */
function syncCutoutView(e,crop){
 if(!e.cutout||e.comparing){cutoutView(null);return;}
 const key=`${e.cutout.width}x${e.cutout.height}:${e.cutoutStamp||0}:${JSON.stringify(crop||null)}`;
 if(e.cutoutViewKey!==key){e.cutoutViewKey=key;e.cutoutViewURL=maskDataURL(e.cutout,crop);}
 cutoutView(e.cutoutViewURL);
}
function renderCutout(){
 const e=state.edit,on=!!e?.cutout;
 $('editFrame').classList.toggle('cutout',on);
 $('eraseBackground').hidden=on;$('eraseBackgroundUndo').hidden=!on;$('eraseBackground').disabled=!e||!!e.cuttingOut;
 if(!on)cutoutView(null);
}
$('eraseBackground').addEventListener('click',async()=>{
 const e=state.edit;if(!e||e.saving||eraser.working||eraser.analyzing||e.cuttingOut)return;
 e.cuttingOut=true;$('eraseBackground').disabled=true;$('eraseHint').textContent='Finding the background…';$('editFrame').classList.add('finding');sound('tick');
 try{
  const found=await findBackground(e.picture,{faces:e.recipe.faces,findPerson});
  if(state.edit!==e)return;
  if(!found){$('eraseHint').textContent='I can’t tell the background from the rest here.';return;}
  e.cutout=found.mask;e.cutoutKind=found.kind;e.cutoutRefined=!!found.refined;e.cutoutStamp=Date.now();renderCutout();invalidate();sound('pop');
  $('eraseHint').textContent=found.kind==='person'?'The person is kept; the rest is see-through.':'The background is see-through.';
 }catch{if(state.edit===e)$('eraseHint').textContent='The background could not be found.';}
 finally{if(state.edit===e){e.cuttingOut=false;$('editFrame').classList.remove('finding');renderCutout();}}
});
$('eraseBackgroundUndo').addEventListener('click',()=>{const e=state.edit;if(!e||!e.cutout)return;sound('tick');e.cutout=null;e.cutoutKind=null;renderCutout();invalidate();$('eraseHint').textContent='Paint over what should go.';});
// Zooming in on the photo with the fingers (zoom-view.js): the view only, never the photo or its recipe. In the editor
// a touch on a sticker or a button stays theirs; one finger on the face guide's handles drags them, two zoom (on a phone
// the handles cover a small face); in Erase one finger paints, so two move the photo about.
// The closest look puts two screen pixels on each of the photo's own, between 2 and 8 times.
const closest=(own,shown)=>Math.min(8,Math.max(2,2*own/Math.max(1,shown)));
const editZoom=createZoomView($('editPictureArea'),$('editFrame'),{
 enabled:()=>!!state.edit&&!state.edit.cropping&&!state.edit.saving,
 maxZoom:()=>{const e=state.edit;return e?closest(e.recipe.crop.h*e.height,$('editFrame').offsetHeight):1;},
 onePan:()=>!state.edit?.erasing,doubleTap:()=>!state.edit?.erasing,
 claims:el=>!!el?.closest?.('.sticker')||(!!el?.closest?.('button')&&!el.closest('.makeup-guide-handle')),
 yields:el=>!!el?.closest?.('.makeup-guide-handle'),pinched:()=>makeupGuide.cancelDrag(),
 // Resting at a new zoom: the photo and what is drawn over it again, at the detail it now shows.
 settled:()=>{invalidate();if(state.edit){editStickers.render();eraser.refresh();}},
});
const viewerZoom=createZoomView($('viewerStage'),$('viewerImage'),{
 maxZoom:()=>{const img=$('viewerImage');return closest(img.naturalHeight,img.offsetHeight);},
});
// The sheets: Lettering first (balloons and captions), then the residents' sheets, then the photographer's own.
let stickerSet=1,mine=[];
async function loadMine(){
 try{
  mine=await listMine();
  for(const m of mine)if(!stickerById(m.id))registerSticker({id:m.id,url:URL.createObjectURL(m.blob),thumbUrl:null,width:m.width,height:m.height});
 }catch{mine=[];}
}
/** A picture to a new own sticker, kept, and stuck on the picture at once. */
async function stickerFromPicture(file){
 const layer=stickerLayer();
 try{
  toast('Cutting your sticker…',{ms:8000});
  const made=await makeSticker(file);
  const record=await addMine({blob:made.blob,width:made.width,height:made.height,cut:made.cut});
  mine.push(record);registerSticker({id:record.id,url:URL.createObjectURL(made.blob),width:made.width,height:made.height});
  toast(made.cut==='outline'?'Cut round its outline':'A photo sticker',{ms:1400});
  if($('stickerSheet').open)$('stickerSheet').close();
  layer?.add(record.id);sound('pop');
  if(state.mode==='editor'&&!$('panelStickers').hidden)renderStickerPicker();
 }catch(err){console.error(err);toast('That picture could not be made into a sticker',{face:errorFace(),ms:2400});}
}
$('stickerFile').addEventListener('change',e=>{const f=e.target.files?.[0];e.target.value='';if(f)stickerFromPicture(f);});
async function pasteSticker(){
 try{
  for(const item of await navigator.clipboard.read()){
   const type=item.types.find(t=>t.startsWith('image/'));
   if(type){await stickerFromPicture(new File([await item.getType(type)],'pasted',{type}));return;}
  }
  toast('There is no picture to paste. Copy a photo, or a subject lifted from one, first.',{ms:2600});
 }catch{toast('Pasting was not allowed here.',{face:errorFace(),ms:2200});}
}
function removeMine(id){
 confirmDelete('This sticker will be deleted from this device. Photos already saved keep it.','Delete Sticker',async()=>{
  await deleteMine(id).catch(()=>{});
  const url=stickerById(id)?.url;forgetSticker(id);if(url)URL.revokeObjectURL(url);
  mine=mine.filter(m=>m.id!==id);
  // Off the viewfinder and the photo being edited too.
  for(const list of [state.camera.recipe.stickers,state.edit?.recipe.stickers].filter(Boolean))for(let i=list.length-1;i>=0;i--)if(list[i].id===id)list.splice(i,1);
  cameraStickers.select(null);editStickers.select(null);remember();renderStickerPicker();
 });
}
/** The residents' own sheets: Memory's decks and the greetings come from them, not from the manga marks. */
const residentSets=manifest=>(manifest?.sets||[]).filter(set=>set.kind!=='marks'&&set.kind!=='season'&&set.kind!=='secret');
/** The secret sheets that have been won (unlocks.js): a Memory deck too, never a greeter. */
const secretSets=manifest=>(manifest?.sets||[]).filter(set=>set.kind==='secret'&&isUnlocked(store.read(),set.id));
const tabLocked=tab=>tab.sets.length>0&&tab.sets.every(set=>set.locked&&!isUnlocked(store.read(),set.id));
/**
 * The sheets by tab: one tab a resident, their other sheets under theirs (the manifest's `tab`), then Manga: the lines
 * (effects.js) and the marks.
 */
function stickerTabs(manifest){
 const tabs=[];
 for(const set of manifest.sets){const name=set.tab||set.name,tab=tabs.find(t=>t.name===name);if(tab)tab.sets.push(set);else tabs.push({name,sets:[set]});}
 const manga=tabs.find(t=>t.name==='Manga');
 if(manga)tabs.push(...tabs.splice(tabs.indexOf(manga),1));else tabs.push({name:'Manga',sets:[]});
 return tabs;
}
async function renderStickerPicker(){
 const grid=$('stickerGrid'),sets=$('stickerSets');
 let manifest;
 try{manifest=await loadStickerSets();}catch{grid.innerHTML='<p class="fine">The stickers could not be loaded.</p>';return;}
 const tabs=stickerTabs(manifest);
 sets.textContent='';
 // One scrollable category row; reveal the selected category without scrolling the photo.
 ['Text',...tabs.map(t=>t.name),'Mine'].forEach((name,i)=>{
  const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=name;
  // A secret sheet shows its tab with a lock until a game opens it (unlocks.js).
  // A secret sheet's tab is a lock alone until a game opens it (unlocks.js): eight named tabs would not fit a phone.
  if(i>0&&i<=tabs.length&&tabLocked(tabs[i-1])){b.textContent='';b.classList.add('locked');b.innerHTML=icon('lock');b.title=name;b.setAttribute('aria-label',`${name} sheet, locked. ${unlockHint(tabs[i-1].sets[0].id)}`);}
  b.setAttribute('aria-selected',String(i===stickerSet));b.addEventListener('click',()=>{sound('tick');stickerSet=i;renderStickerPicker();grid.scrollTo?.({left:0,top:0});});
  sets.append(b);
 });
 const selected=sets.children[stickerSet];
 if(selected){const b=selected.getBoundingClientRect(),r=sets.getBoundingClientRect();sets.scrollLeft+=b.left<r.left?b.left-r.left:b.right>r.right?b.right-r.right:0;}
 grid.textContent='';
 if(stickerSet===0){
  await loadLetteringFont();
  for(const b of BALLOONS){
   const button=document.createElement('button');button.type='button';button.className='sticker-choice lettering';button.dataset.id=b.id;
   button.setAttribute('aria-label',`${b.label} balloon`);button.title=b.label;
   const art=balloonCanvas(b.id,b.sample,false,160);art.setAttribute('aria-hidden','true');
   const name=document.createElement('span');name.textContent=b.label;
   button.append(art,name);grid.append(button);
  }
  return;
 }
 if(stickerSet===tabs.length+1){
  const make=(label,glyph,fn,aria)=>{const b=document.createElement('button');b.type='button';b.className='sticker-choice make';b.innerHTML=`${icon(glyph)}<span>${label}</span>`;b.setAttribute('aria-label',aria);b.addEventListener('click',fn);grid.append(b);};
  make('From a photo','photo',()=>$('stickerFile').click(),'Make a sticker from one of your photos');
  if(navigator.clipboard?.read)make('Paste','paste',pasteSticker,'Paste a picture or a lifted subject as a sticker');
  for(const m of mine){
   const info=stickerById(m.id);if(!info)continue;
   const b=document.createElement('button');b.type='button';b.className='sticker-choice mine';b.dataset.id=m.id;b.setAttribute('aria-label','Your sticker');
   b.innerHTML=`<img src="${info.url}" alt="" decoding="async"><span class="mine-remove" role="button" aria-label="Delete this sticker">${icon('x')}</span>`;
   grid.append(b);
  }
  const note=document.createElement('p');note.className='sticker-note';
  note.textContent='Any photo becomes a die-cut sticker. On an iPhone, iPad or Mac, touch and hold the subject of a photo in Photos, choose Copy, then Paste here: it is cut round its outline.';
  grid.append(note);
  return;
 }
 if(tabs[stickerSet-1]?.name==='Manga'){
  for(const fx of EFFECTS){
   const b=document.createElement('button');b.type='button';b.className='sticker-choice effect';b.dataset.id=fx.id;b.title=fx.hint;b.setAttribute('aria-label',`${fx.label}: ${fx.hint}`);
   const name=document.createElement('span');name.textContent=fx.label;b.append(effectPreview(fx.id,96),name);grid.append(b);
  }
 }
 if(tabs[stickerSet-1]&&tabLocked(tabs[stickerSet-1])){
  const set=tabs[stickerSet-1].sets[0],note=document.createElement('div');note.className='sticker-locked';note.innerHTML=icon('lock');
  const what=document.createElement('p');what.textContent=set.note||'';const how=document.createElement('p');how.className='sticker-locked-how';how.textContent=unlockHint(set.id);
  note.append(what,how);grid.append(note);return;
 }
 (tabs[stickerSet-1]?.sets||[]).forEach((set,k)=>{
  // The resident's own sheet first; each of their other sheets under its name.
  if(k>0||tabs[stickerSet-1].name==='Manga'){const h=document.createElement('h3');h.className='sticker-heading';h.textContent=set.name;grid.append(h);}
  for(const s of set.stickers){
   const b=document.createElement('button');b.type='button';b.className='sticker-choice';b.dataset.id=s.id;
   b.setAttribute('aria-label',`${stickerLabel(s)}${s.line?` (${s.line})`:''}`);b.title=s.gloss?`${s.line} · ${s.gloss}`:s.line||'';
   b.innerHTML=`<img src="${s.thumbUrl}" alt="" loading="lazy" decoding="async" width="${Math.round(256*s.width/Math.max(s.width,s.height))}" height="${Math.round(256*s.height/Math.max(s.width,s.height))}">`;
   grid.append(b);
  }
 });
}
$('stickerGrid').addEventListener('click',async e=>{
 const gone=e.target.closest('.mine-remove');if(gone){e.stopPropagation();removeMine(gone.closest('.sticker-choice').dataset.id);return;}
 const b=e.target.closest('.sticker-choice');if(!b||b.classList.contains('make'))return;
 const layer=stickerLayer();if(!layer)return;
 if(state.mode==='camera')$('stickerSheet').close();
 if(b.classList.contains('lettering')){
  const answer=await askLettering({style:b.dataset.id});
  if(!answer)return;
  await loadLetteringFont();layer.add(answer.style,{text:answer.text});
 }else layer.add(b.dataset.id);
 sound('pop');
});
function openStickerSheet(){
 const sheet=$('stickerSheet');sheet.append($('stickerPicker'));renderStickerPicker();openSheet(sheet);
}
$('stickerSheet').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
function renderAdjusters(){
 const e=state.edit,box=$('adjusters');box.textContent='';
 renderEnhance();renderPop();renderAuto();
 for(const a of ADJUSTMENTS){
  const v=e.recipe.adjust[a.key],b=document.createElement('button');b.type='button';b.className=`adjuster${v<0?' neg':''}${v?' changed':''}`;b.dataset.key=a.key;
  b.setAttribute('role','radio');b.setAttribute('aria-checked',String(e.adjust===a.key));b.title=a.hint||a.label;
  b.style.setProperty('--v',String(Math.abs(v)*(v<0?-1:1)));
  b.innerHTML=`<i>${icon(a.icon)}</i><span>${a.label}</span>`;
  b.addEventListener('click',()=>{showEnhanceStrength(false);if(e.adjust===a.key&&v!==0){setAdjust(0);}else{e.adjust=a.key;renderAdjusters();}});
  box.append(b);
 }
 const s=$('adjustSlider'),v=Math.round(e.recipe.adjust[e.adjust]*100),info=ADJUSTMENTS.find(a=>a.key===e.adjust);
 s.value=v;s.setAttribute('aria-label',info.label);$('adjustLabel').textContent=info.label;$('adjustValue').textContent=v>0?`+${v}`:v;
 s.classList.add('centred');s.style.setProperty('--from',`${Math.min(50,50+v/2)}%`);s.style.setProperty('--to',`${Math.max(50,50+v/2)}%`);
}
function showEnhanceStrength(open,which='enhance'){
 // One strength open at a time (Enhance's or Pop's), in place of the adjustment's slider.
 for(const k of ['enhance','pop']){const on=open&&k===which;$(k+'StrengthRow').hidden=!on;$(k+'Amount').setAttribute('aria-expanded',String(on));}
 $('adjustmentSliderRow').hidden=open;invalidate();
}
$('enhanceAmount').addEventListener('click',()=>showEnhanceStrength($('enhanceStrengthRow').hidden));
$('popAmount').addEventListener('click',()=>showEnhanceStrength($('popStrengthRow').hidden,'pop'));
$('adjustReset').addEventListener('click',()=>{if(state.edit)setAdjust(0);});
function setAdjust(value){const e=state.edit;e.recipe.adjust[e.adjust]=value;renderAdjusters();refreshThumbs();invalidate();}
$('adjustSlider').addEventListener('input',ev=>{
 let v=+ev.target.value;if(Math.abs(v)<3)v=0;
 state.edit.recipe.adjust[state.edit.adjust]=v/100;renderAdjusters();invalidate();
});
$('adjustSlider').addEventListener('change',()=>refreshThumbs(true));
$('adjustSlider').addEventListener('dblclick',()=>setAdjust(0));

// Auto (auto.js): the levels this photo asks for, measured once per photo. On: the recipe holds exactly them; Adjusted:
// something else above zero; Off: both zero, the exact photo.
const pickLevels=l=>({enhance:l.enhance,pop:l.pop});
function photoLevels(e){
 if(!e.autoLevels){try{e.autoLevels=pickLevels(autoLevels(e.makeupPreview||e.picture,{faces:e.recipe.faces}));}catch{e.autoLevels={enhance:.35,pop:.3};}}
 return e.autoLevels;
}
/** A face found after the photo opened: Auto's levels, if they are still exactly the ones it set, are measured again
 *  with the face known (a portrait is held back). */
function remeasureAuto(e){
 const r=e.recipe,l=e.autoLevels;if(!l||!(r.enhance>0||r.pop>0))return;
 if(Math.abs(r.enhance-l.enhance)>.005||Math.abs(r.pop-l.pop)>.005)return;
 e.autoLevels=null;Object.assign(r,photoLevels(e));renderEnhance();renderPop();renderAuto();refreshThumbs(true);invalidate();
}
function renderAuto(){
 const e=state.edit;if(!e)return;
 const r=e.recipe,on=r.enhance>0||r.pop>0,l=on?photoLevels(e):null,exact=!!l&&Math.abs(r.enhance-l.enhance)<.005&&Math.abs(r.pop-l.pop)<.005;
 $('autoPhoto').setAttribute('aria-checked',String(on));$('autoValue').textContent=!on?'Off':exact?'On':'Adjusted';
}
$('autoPhoto').addEventListener('click',()=>{
 const e=state.edit;if(!e||e.saving)return;sound('tick');
 const on=e.recipe.enhance>0||e.recipe.pop>0;
 if(on){e.recipe.enhance=0;e.recipe.pop=0;}else Object.assign(e.recipe,photoLevels(e));
 renderEnhance();renderPop();renderAuto();refreshThumbs(true);invalidate();
});
// Optional correction belongs to the recipe, not the source: off restores it exactly, and re-edit never stacks it.
function renderEnhance(){
 const amount=Math.round((state.edit?.recipe.enhance||0)*100);
 $('enhancePhoto').setAttribute('aria-checked',String(amount>0));
 $('enhanceStrength').value=amount;$('enhanceValue').textContent=amount?`${amount}%`:'Off';
}
function setEnhance(amount){
 const e=state.edit;if(!e||e.saving)return;
 if(e.recipe.enhance)e.enhanceAmount=e.recipe.enhance;
 e.recipe.enhance=Math.max(0,Math.min(1,amount));if(amount>0)e.enhanceAmount=e.recipe.enhance;
 renderEnhance();renderAuto();invalidate();
}
$('enhancePhoto').addEventListener('click',()=>{
 const e=state.edit;if(!e||e.saving)return;
 setEnhance(e.recipe.enhance?0:e.enhanceAmount||.65);refreshThumbs(true);sound('tick');
});
$('enhanceStrength').addEventListener('input',ev=>setEnhance(+ev.target.value/100));
$('enhanceStrength').addEventListener('change',()=>refreshThumbs(true));
// Pop, the same way: in the recipe, off restores the photo exactly, the last strength comes back when switched on again.
function renderPop(){
 const amount=Math.round((state.edit?.recipe.pop||0)*100);
 $('popPhoto').setAttribute('aria-checked',String(amount>0));
 $('popStrength').value=amount;$('popValue').textContent=amount?`${amount}%`:'Off';
}
function setPop(amount){
 const e=state.edit;if(!e||e.saving)return;
 if(e.recipe.pop)e.popAmount=e.recipe.pop;
 e.recipe.pop=Math.max(0,Math.min(1,amount));if(amount>0)e.popAmount=e.recipe.pop;
 renderPop();renderAuto();invalidate();
}
$('popPhoto').addEventListener('click',()=>{
 const e=state.edit;if(!e||e.saving)return;
 setPop(e.recipe.pop?0:e.popAmount||.5);refreshThumbs(true);sound('tick');
});
$('popStrength').addEventListener('input',ev=>setPop(+ev.target.value/100));
$('popStrength').addEventListener('change',()=>refreshThumbs(true));

// ---------- Keys, drops, the page coming and going ----------
addEventListener('keydown',e=>{
 if(e.defaultPrevented)return;
 if(e.target.closest?.('input,textarea,select,dialog'))return;
 const layer=stickerLayer();
 if(layer?.selected!=null){
  const step=e.shiftKey?.05:.01,move={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
  if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();layer.remove();return;}
  if(e.key==='Escape'){e.preventDefault();layer.select(null);return;}
  if(move){e.preventDefault();layer.nudge(...move);return;}
 }
 if(state.mode==='camera'){
  if(e.key==='Escape'&&!$('settings').hidden){e.preventDefault();showSettings(false);return;}
  if(e.key==='Escape'&&$('camera').classList.contains('looks-open')){e.preventDefault();showLooks(false);return;}
  if((e.key===' '||e.key==='Enter')&&!e.target.closest?.('button,a')){e.preventDefault();takePhoto();}
  else if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.target.closest?.('.strip')){e.preventDefault();stepLook(e.key==='ArrowRight'?1:-1);}
 }else if(e.key==='Escape'){
  if(state.mode==='editor')closeEditor();else if(state.mode==='viewer')openAlbum();else if(state.mode==='album')show('camera');else if(state.mode==='memory'){memory.close();openAlbum();}
 }else if(state.mode==='editor'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')&&!e.target.closest?.('.strip')){e.preventDefault();stepLook(e.key==='ArrowRight'?1:-1);}
});
addEventListener('dragover',e=>{if([...e.dataTransfer?.items||[]].some(i=>i.kind==='file'))e.preventDefault();});
addEventListener('drop',e=>{const files=[...e.dataTransfer?.files||[]].filter(isPicture);if(files.length){e.preventDefault();useFiles(files);}});
// A pasted picture: a sticker while the stickers are open (a subject lifted in Photos is cut round its outline), else
// a photo to edit.
addEventListener('paste',e=>{
 if(e.target.closest?.('input,textarea'))return;
 const file=[...e.clipboardData?.files||[]].find(isPicture);if(!file)return;
 e.preventDefault();
 const stickersOpen=$('stickerSheet').open||(state.mode==='editor'&&!$('panelStickers').hidden);
 if(stickersOpen)stickerFromPicture(file);else useFiles([file]);
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){if(state.camera.running){stopCamera();state.camera.resume=true;}}
 else if(state.camera.resume&&state.mode==='camera'){state.camera.resume=false;startCamera();}
});
const layoutObserver=new ResizeObserver(invalidate);
for(const element of [document.body,$('cameraPictureArea'),$('editPictureArea')])layoutObserver.observe(element);

// ---------- Start ----------
// On the Home Screen the camera is an app of its own: no way back to the website is needed, and it works offline (sw.js).
const standalone=navigator.standalone===true||matchMedia('(display-mode:standalone)').matches;
document.documentElement.classList.toggle('standalone',standalone);
prepareOffline($('offlineSetting'),{canReload:()=>!state.edit&&!state.camera.busy&&!importing&&!sharing,
 // Idle: the first screen before the camera runs, or the album; never while shooting, editing, viewing or playing.
 autoReload:()=>(state.mode==='camera'&&!state.camera.running||state.mode==='album')&&!state.edit&&!state.camera.busy&&!importing&&!sharing});
// Back after an update's refresh: say so once.
try{if(sessionStorage.getItem('camera-updated')){sessionStorage.removeItem('camera-updated');toast(`Pocket Camera updated to ${document.querySelector('.camera-version')?.textContent||'the latest'}`,{ms:2400});}}catch{}
loadShots();
if(!startEngine()){
 showWelcome();
 $('welcome').querySelector('p').textContent='Pocket Camera needs WebGL 2, which this browser does not offer.';
 $('welcome').querySelector('.welcome-actions').hidden=true;$('welcomeNote').hidden=true;setShutter('off');
}else{
 buildStrip();show('camera');
 loadMine().then(()=>cameraStickers.render());
 // The camera's stickers need their pictures before they can show. The first screen greets with a sticker from the
 // residents' sheets, a different one each time (the owner, 29 October 2026: "Replace Fuji with a random sticker when
 // you start"), never the one shown last; Johansson, the chief engineer, salutes the empty album.
 loadStickerSets().then(manifest=>{
  stickerSheets=manifest;cameraStickers.render();
  const all=residentSets(manifest).flatMap(set=>set.stickers),last=store.read().greeting;
  const choices=all.length>1?all.filter(x=>x.id!==last):all,hello=choices[Math.floor(Math.random()*choices.length)],off=stickerById('johansson-pixar/Salute');
  if(hello)store.write({...store.read(),greeting:hello.id});
  // The stickers are figures without words; what they would say is their gloss, for whoever cannot see them.
  if(hello){const img=$('welcomeSticker');img.src=hello.url;img.alt=`${hello.set}: ${hello.gloss}`;img.hidden=false;img.classList.add('dancing');}
  if(off){const img=$('emptySticker');img.src=off.url;img.alt=`${off.set}: ${off.gloss}`;img.hidden=false;}
 }).catch(()=>{});
 if(state.camera.recipe.stickers.some(s=>s.id.startsWith('balloon:')))loadLetteringFont().then(()=>cameraStickers.render());
}
// For the browser checks (camera/tests/camera.browser.mjs).
window.pocketCamera={state,editFile,useFiles,stickerFromPicture,takePhoto,startCamera,get engine(){return engine;},chooseLook,addLayer,shuffle,cameraStickers,editStickers,memory,printer,openMemory,editZoom,viewerZoom,gameWon,setDance,get danceTempo(){return danceTempo;},openCardGame,get cardGame(){return activeCardGame;}};
