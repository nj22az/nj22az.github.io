/**
 * Pocket Camera: a camera and a photo editor for every Look in Johansson World (looks-gl.js), alone or stacked up to
 * three deep. Everything happens on this device: the camera picture never leaves it, and saved photos live in the
 * browser's own storage (album.js) until shared.
 */
import {createLookEngine,LOOKS,LOOK_NAMES,LOOK_STANDIN,TRICKS,normalRecipe,exportSize} from './looks-gl.js?v=20261030d';
import {createPersonMasker,recipeNeedsPerson} from './person-mask.js?v=20261030d';
import {listShots,getShot,addShot,updateShot,deleteShot,keepAlbum,ensureAlbumSamples,listMine,addMine,deleteMine} from './album.js?v=20261029c';
import {lookSwatch} from '../johansson-town/src/ui/look-picker.js?v=20261029-camera';
import {loadStickerSets,stickerLabel,stickerById,registerSticker,forgetSticker,createStickerLayer,drawStickers} from './stickers.js?v=20261029t';
import {makeSticker} from './cutout.js?v=20261029b';
import {FRAMES,drawFrame,frameInner} from './frames.js?v=20261029f';
import {BALLOONS,SOUND_EFFECTS,balloonCanvas,loadLetteringFont} from './lettering.js?v=20261029t';
import {EFFECTS,effectPreview} from './effects.js?v=20261029b';
import {createEraser} from './erase.js?v=20261029a';
import {createPrinter} from './printer.js?v=20261029e';
import {createMemory} from './memory.js?v=20261029q';
import {cardView,shuffleDeck} from './playing-cards.js?v=20261029b';
import {createBlackjack} from './blackjack.js?v=20261029b';
import {createSolitaire} from './solitaire.js?v=20261029c';

const $=id=>document.getElementById(id);
const coarse=matchMedia('(pointer:coarse)').matches;
const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)').matches;
const SETTINGS_KEY='office-pocket-camera';
const MAX_LAYERS=3;
const RATIOS=['4:3','1:1','16:9'],TIMERS=[0,3,10],ZOOMS=[1,2,3];
// The dice's mixes, chosen by eye on a real photo and on the town (as the hand-held cameras' lenses were chosen, not
// drawn at random): each a base and a Look over it, with its name. Pairs that came out as noise or mush were left out:
// Crayon or Riso over ink, Miniature over Pocket's pixels, Stamp over Sepia, Heavy brush through the TV.
const MIXES=[
 ['Ink & wash','watercolour','lines',.7],['Comic colour','watercolour','manga',.5],['Sunday comic','flat','manga',.45],
 ['Pencil & wash','watercolour','pencilManga',.5],['Inked oils','oil','manga',.4],['Line & colour','flat','lines',.6],
 ['Cartridge TV','snes','crt',1],['Hand-held TV','pocket','crt',1],['Late show','mono','crt',1],['Old reel','sepia','crt',.8],
 ['Toy town','print','tilt',1],['Model village','watercolour','tilt',1],['Diorama','oil','tilt',1],["Architect's model",'sketchbook','tilt',1],
 ['Two-colour print','lines','riso',1],['Poster','print','riso',.6],
 ['Home video','instant','camcorder',1],['Comic book','flat','halftone',1],["Engineer's plan",'lines','cyanotype',1],['Night watch','nightVision','crt',.8],
];
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

const state={
 mode:'camera',
 camera:{recipe:normalRecipe(saved.recipe||{layers:[{look:'pocket',amount:1}]}),active:0,ratio:RATIOS.includes(saved.ratio)?saved.ratio:'4:3',
  timer:TIMERS.includes(saved.timer)?saved.timer:0,zoom:1,facing:saved.facing==='user'?'user':'environment',mirror:false,stream:null,running:false,busy:false},
 edit:null,
 shots:[],viewing:null,
 sound:saved.sound!==false,
 // Every photo saved comes out of the printer first (printer.js); the settings row turns it off for quick shooting.
 printer:saved.printer!==false,
};
state.camera.recipe.stamp=!!saved.stamp;
const current=()=>state.mode==='editor'?state.edit:state.camera;
function remember(){
 const c=state.camera,r=c.recipe;
 store.write({...store.read(),recipe:{layers:r.layers,stickers:r.stickers,adjust:{light:r.adjust.light},frame:r.frame,trick:r.trick},ratio:c.ratio,timer:c.timer,stamp:r.stamp,facing:c.facing,sound:state.sound,printer:state.printer});
}

// ---------- The engine and its canvas ----------
const canvas=document.createElement('canvas');
canvas.setAttribute('aria-label','Viewfinder');
let engine=null;
const personMasker=createPersonMasker();
async function maskStill(source,picture,recipe,revision){
 if(!recipeNeedsPerson(recipe))return;
 const target=engine,mask=await personMasker.mask(picture);
 if(engine===target)target?.setPersonMask(source,mask,revision);
}
function ensureEditPerson(){
 const e=state.edit;if(!e||!recipeNeedsPerson(e.recipe))return Promise.resolve();
 if(e.personPromise)return e.personPromise;
 const target=engine,picture=e.picture,revision=e.revision;
 e.personPromise=personMasker.mask(picture).then(mask=>{
  if(state.edit!==e||e.picture!==picture||engine!==target||e.revision!==revision)return;
  target.setPersonMask('edit',mask,revision);refreshThumbs(true);invalidate();
 });
 return e.personPromise;
}
function startEngine(){
 try{engine=createLookEngine(canvas,{light:coarse});engine.warm(LOOK_NAMES);engine.loadLuts().then(()=>{refreshThumbs(true);invalidate();}).catch(()=>{toast('Film grades could not load');});return true;}
 catch{engine=null;return false;}
}
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();setShutter('off');$('saveEdit').disabled=true;toast('Graphics restarted');});
canvas.addEventListener('webglcontextrestored',()=>{
 startEngine();
 if(state.edit){state.edit.revision=engine?.setSource('edit',state.edit.picture,state.edit.width,state.edit.height);state.edit.personPromise=null;ensureEditPerson();}
 setShutter(state.camera.running?'shoot':$('welcome').hidden||!canStart()?'off':'start');$('saveEdit').disabled=false;refreshThumbs(true);
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
/*
 * The Looks in kinds, so the strip shows a few at a time (the owner, 29 October 2026: "make sub menu organisation so it
 * doesn't feel cluttered like game consoles can stay with each other and vhs for 80's or so"). A Look World adds later
 * and no kind names goes under More.
 */
const LOOK_GROUPS=(()=>{
 const groups=[
  {id:'photo',label:'Photo',looks:['none','mono','sepia','instant','colourFilm','disposable','warmSlide','softNegative','tilt','nightVision']},
  {id:'games',label:'Games',looks:['pocket','colourHandheld','redVisor','eightBit','snes','thirtyTwoBit','sixtyFourBit','macOneBit']},
  {id:'80s',label:'80s',looks:['crt','camcorder']},
  {id:'drawn',label:'Drawn',looks:['lines','sketchbook','crayon','pencilManga','manga','flat','adventureInk','halftone']},
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

// The printer every saved photo comes out of (printer.js).
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
/*
 * A short screen (a phone's browser with its toolbars, the owner's iPhone) gives the picture the whole width: the Looks
 * float over its foot, the strip folded behind the Look's name until it is asked for (swiping across the picture still
 * steps through the Looks). A tall one keeps the tray under the picture.
 */
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
/** Unfolds or folds the strip of Looks over the picture (a short screen only). */
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
 const art=frameArt(frame),w=frame.clientWidth,h=frame.clientHeight,dpr=Math.min(3,devicePixelRatio||1);
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
function buildGroups(){
 const row=$('lookGroups');row.textContent='';
 for(const g of LOOK_GROUPS){
  const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.dataset.group=g.id;b.textContent=g.label;
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
  // World's own picture of the Look (the same little house in each style) until the live one is drawn.
  const face=document.createElement('span');face.className='face swatch';face.innerHTML=lookSwatch(LOOK_STANDIN[name]||name,`cam-${name}`);
  const c=document.createElement('canvas');c.width=c.height=THUMB;face.append(c);
  const s=document.createElement('span');s.className='name';s.textContent=lookLabel(name);
  b.append(face,s);strip.append(b);tiles.set(name,{button:b,canvas:c,drawn:false});
 }
}
function renderLayers(){
 const ctx=current(),{layers}=ctx.recipe;layersEl.textContent='';
 // The Looks of one mix sit together in one capsule, as the segments of one control: the chosen one is lit.
 const mix=document.createElement('span');mix.className='mix';layersEl.append(mix);
 layers.forEach((layer,i)=>{
  const wrap=document.createElement('span');wrap.className=`layer${i===ctx.active?' active':''}${layers.length>1?' removable':''}`;
  const pick=document.createElement('button');pick.type='button';pick.className='layer-pick';pick.textContent=lookLabel(layer.look);
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
 const ctx=current(),look=ctx.recipe.layers[ctx.active].look,group=LOOK_GROUPS.find(g=>g.id===shownGroup)||groupOf(look);
 for(const b of $('lookGroups').children){const on=b.dataset.group===group.id;b.setAttribute('aria-selected',String(on));b.classList.toggle('has-look',groupOf(look).id===b.dataset.group);}
 for(const [name,t] of tiles){const on=name===look;t.button.setAttribute('aria-checked',String(on));t.button.tabIndex=on||(!group.looks.includes(look)&&name===group.looks[0])?0:-1;t.button.hidden=!group.looks.includes(name);}
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
 const ctx=current(),choices=MIXES.map((m,i)=>i).filter(i=>i!==lastMix&&tiles.has(MIXES[i][1])&&tiles.has(MIXES[i][2]));
 if(!choices.length)return;
 const i=choices[Math.floor(Math.random()*choices.length)],[name,base,over,amount]=MIXES[i];lastMix=i;
 ctx.recipe.layers=[{look:base,amount:1},{look:over,amount}];ctx.active=0;
 trayChanged({thumbs:true});
 toast(`${name} · ${mixLabel(ctx.recipe)}`,{look:true,ms:1300});sound('tick');
}
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
 const t=performance.now();
 const live=state.mode==='camera';
 if(t-thumbsAt<(live?700:120))return;
 const ctx=current(),source=live?'live':'edit';
 if(!engine.hasSource(source))return;
 const crop=squareCrop(live?cameraCrop():{x:0,y:0,w:1,h:1},live?videoSize():{width:state.edit.width,height:state.edit.height});
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
 const box=fitFrame($('cameraFrame'),$('cameraStage'),pw/ph);
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
 ensureEditPerson();
 const box=fitFrame($('editFrame'),$('editStage'),e.width/e.height);
 const dpr=Math.min(devicePixelRatio||1,3),h=Math.min(e.height,box.height*dpr,2048/Math.max(1,e.width/e.height),2048);
 setCanvasSize(h*e.width/e.height,h);
 // While erasing, the photo as it is under the Looks: no mirror trick, and no frame or date over its edges.
 const recipe=e.comparing?normalRecipe():e.erasing?{...e.recipe,trick:'none'}:e.recipe;
 dirty=!engine.draw(recipe,{source:'edit'});
 paintFrame($('editFrame'),e.recipe.frame,e.comparing||e.erasing);
 stampOverlay($('editFrame'),e.recipe.stamp&&!e.comparing&&!e.erasing,e.taken,e.recipe.frame);
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
 fitFrame($('cameraFrame'),$('cameraStage'),3/4);
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
 setting('timer',{label:c.timer?`${c.timer}s`:'Timer',on:c.timer>0,aria:`Self-timer: ${c.timer?`${c.timer} seconds`:'off'}`});
 setting('ratio',{label:c.ratio,aria:`Picture shape: ${c.ratio}`});
 setting('frameSetting',{label:r.frame==='none'?'Frame':frame.label,on:r.frame!=='none',aria:`Frame: ${frame.label}`});
 setting('mirrorSetting',{label:r.trick==='none'?'Mirror':TRICK_LABELS[r.trick],on:r.trick!=='none',aria:`Mirror lens: ${TRICK_LABELS[r.trick]}`});
 setting('stamp',{label:'Date',on:r.stamp,aria:`Date stamp: ${r.stamp?'on':'off'}`});
 setting('printSetting',{label:'Print',on:state.printer,aria:`Printer when saving: ${state.printer?'on':'off'}`});
 setting('soundSetting',{label:state.sound?'Sound':'Muted',icon:state.sound?'sound':'sound-off',aria:`Sounds: ${state.sound?'on':'off'}`});
 // What is switched on, beside the chevron, so it is never a surprise in the photo.
 const status=[c.timer&&'timer',r.frame!=='none'&&'frame',r.trick!=='none'&&'mirror',r.stamp&&'date'].filter(Boolean);
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
function showSettings(open){
 $('settings').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));$('settingsToggle').classList.toggle('open',open);
}
$('settingsToggle').addEventListener('click',()=>{sound('tick');showSettings($('settings').hidden);});
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
 openSheet($('frameSheet'));
 requestAnimationFrame(()=>$('cameraFrames').querySelector('[aria-checked="true"]')?.scrollIntoView({inline:'center',block:'nearest'}));
}
$('frameSheet').addEventListener('click',e=>{if(e.target===e.currentTarget)e.currentTarget.close();});
$('mirrorSetting').addEventListener('click',()=>changeSetting(()=>{const r=state.camera.recipe;r.trick=cycle(TRICKS,r.trick);refreshThumbs(true);}));
$('stamp').addEventListener('click',()=>changeSetting(()=>{const r=state.camera.recipe;r.stamp=!r.stamp;}));
$('soundSetting').addEventListener('click',()=>{state.sound=!state.sound;sound('tick');renderCameraChips();remember();});
$('printSetting').addEventListener('click',()=>{state.printer=!state.printer;sound('tick');renderCameraChips();remember();});
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
function gestures(stage,{onDoubleTap,onDrag,onTap}={}){
 let start=null,lastTap=0;
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('button,.settings,.erase-paint'))return;start={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId,dragging:false};});
 stage.addEventListener('pointermove',e=>{
  if(!start||e.pointerId!==start.id||!onDrag)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y;
  if(!start.dragging&&Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)*1.3){start.dragging=true;start.from=onDrag.begin();}
  if(start.dragging)onDrag.move(start.from,dy);
 });
 stage.addEventListener('pointerup',e=>{
  if(!start||e.pointerId!==start.id)return;
  const dx=e.clientX-start.x,dy=e.clientY-start.y,dt=performance.now()-start.t,dragged=start.dragging;start=null;
  if(dragged){onDrag.end?.();return;}
  if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4&&dt<700){stepLook(dx<0?1:-1);return;}
  if(Math.hypot(dx,dy)<10&&dt<300){
   const now=performance.now();
   if(now-lastTap<320){lastTap=0;onDoubleTap?.();}else{lastTap=now;onTap?.(e);if(state.mode==='camera'){showAmountRow(false);showSettings(false);showLooks(false);}}
  }
 });
 stage.addEventListener('pointercancel',()=>{start=null;});
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
gestures($('cameraStage'),{
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
  const revision=engine.setSource('still',still,size.width,size.height);
  let finished;
  try{await maskStill('still',still,recipe,revision);finished=await finishPhoto(engine.render(recipe,{source:'still',width:size.width,height:size.height}),recipe,taken);}
  finally{engine.dropSource('still');}
  const {photo,thumb}=finished,source=await toBlob(still,'image/jpeg',.92);still.width=still.height=0;
  // Printed, then into the album's thumbnail; the thumbnail changes when the print lands in it.
  const printing=printPhoto(photo,size.width,size.height,()=>$('roll').getBoundingClientRect());
  if(!printing)flyToRoll(photo);
  await keep({photo,source,thumb,recipe,width:size.width,height:size.height,taken:taken.getTime()},{roll:!printing});
  if(printing){await printing;renderRoll(true);}
 }catch(err){console.error(err);toast('The photo could not be saved');}
 finally{c.busy=false;$('shutter').classList.remove('waiting');$('count').textContent='';}
}
/** Plays the printer for a saved photo when it is on; a promise for its landing, or null when it does not play. */
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
/** Pixels from the engine to a JPEG and its album thumbnail: the stickers stuck on, then the date if asked. */
async function finishPhoto(pixels,recipe,date){
 const c=document.createElement('canvas');c.width=pixels.width;c.height=pixels.height;
 const g=c.getContext('2d');g.putImageData(new ImageData(pixels.data,pixels.width,pixels.height),0,0);
 drawFrame(g,recipe.frame,c.width,c.height);
 const missing=await drawStickers(g,c.width,c.height,recipe.stickers);
 if(missing)toast(missing===1?'A sticker could not be loaded and is left off':`${missing} stickers could not be loaded and are left off`,{ms:2600});
 if(recipe.stamp)printStamp(g,frameInner(recipe.frame,c.width,c.height),date);
 try{
  const photo=await toBlob(c,'image/jpeg',.92);
  const s=Math.min(c.width,c.height),t=document.createElement('canvas');t.width=t.height=320;
  t.getContext('2d').drawImage(c,(c.width-s)/2,(c.height-s)/2,s,s,0,0,320,320);
  return {photo,thumb:await toBlob(t,'image/jpeg',.8)};
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
async function keep(shot,{roll=true}={}){
 if(!albumOK){offerFile(shot.photo);return null;}
 try{const r=await addShot(shot);albumRevision++;state.shots.unshift(r);if(roll)renderRoll(true);keepAlbum();return r;}
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
  b.setAttribute('aria-label',shot.sampleLabel||`Photo, ${mixLabel(normalRecipe(shot.recipe))}, ${new Date(shot.taken||shot.created).toLocaleString()}`);
  b.innerHTML=`<img src="${url}" alt="" loading="lazy" decoding="async">`;grid.append(b);
 }
 $('albumEmpty').hidden=state.shots.length>0;
 $('albumNote').textContent=albumOK?(state.shots.length?`${state.shots.length} ${state.shots.length===1?'photo':'photos'} · kept in this browser on this device`:''):'This browser does not keep an album here; photos are offered as files instead.';
}
$('grid').addEventListener('click',e=>{const b=e.target.closest('button');if(b)openViewer(b.dataset.id);});

function show(mode){
 state.mode=mode;
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
function openAlbum(){show('album');renderGrid();}
$('closeAlbum').addEventListener('click',()=>show('camera'));


// ---------- Memory ----------
let stickerSheets=null;
/** The cards Memory can be played with: the album's photos, each of the residents' sheets, the photographer's own stickers. */
async function memorySources(){
 const manifest=stickerSheets||await loadStickerSets().catch(()=>null);
 const day=s=>new Date(s.taken||s.created).toLocaleDateString(undefined,{day:'numeric',month:'long'});
 return [
  {id:'photos',name:'Your photos',kind:'photo',items:state.shots.map(s=>({id:s.id,blob:s.thumb||s.photo,label:s.sampleLabel||`Your photo of ${day(s)}`}))},
  ...residentSets(manifest).map(set=>({id:`set:${set.name}`,name:set.name,kind:'sticker',items:set.stickers.map(s=>({id:s.id,url:s.url,label:`${set.name}: ${s.gloss||s.line}`}))})),
  {id:'mine',name:'Your stickers',kind:'sticker',items:mine.map(m=>stickerById(m.id)).filter(Boolean).map(s=>({id:s.id,url:s.url,label:'Your sticker'}))},
 ];
}
/** A resident sticker, any one, to cheer the last pair. */
function cheer(){
 const all=residentSets(stickerSheets).flatMap(set=>set.stickers),s=all[Math.floor(Math.random()*all.length)];
 return s?{url:s.url,alt:`${s.set}: ${s.gloss}`}:null;
}
const memory=createMemory($('memory'),{sources:memorySources,cheer,sound,store,onPlay:()=>{$('memoryNew').hidden=false;}});
let memoryReturnToGames=false;
async function openMemory(fromGames=false){memoryReturnToGames=fromGames;document.querySelector('#closeMemory span').textContent=fromGames?'Games':'Album';sound('tick');show('memory');$('memoryNew').hidden=true;await memory.open();}
$('playMemory').addEventListener('click',()=>openMemory());
$('emptyPlay').addEventListener('click',()=>openMemory());
$('closeMemory').addEventListener('click',()=>{memory.close();if(memoryReturnToGames)openCardsHub();else openAlbum();});
$('memoryNew').addEventListener('click',()=>{sound('tick');$('memoryNew').hidden=true;memory.showSetup();});

// A separate game room keeps the photo-based Memory flow intact.
let activeCardGame=null;
function openCardsHub(){activeCardGame?.destroy();activeCardGame=null;show('cardsHub');}
function openCardGame(kind){
 activeCardGame?.destroy();
 const root=$('cardGameContent');root.replaceChildren();
 $('cardGameTitle').textContent=kind==='blackjack'?'Blackjack':'Solitaire';
 show('cardGame');
 activeCardGame=(kind==='blackjack'?createBlackjack:createSolitaire)({root,cardView,shuffleDeck});
 activeCardGame.start();
}
$('openCardGames').addEventListener('click',openCardsHub);
$('closeCardsHub').addEventListener('click',openAlbum);
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
 $('viewerTitle').textContent=shot.sampleLabel||new Date(shot.taken||shot.created).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'});
 $('editPhoto').disabled=!engine||engine.lost();$('editPhoto').title=$('editPhoto').disabled?'Editing requires WebGL 2':'';
 const shareFile=new File([shot.photo],fileName(shot),{type:shot.photo.type||'image/jpeg'}),canShare=canShareFiles(shareFile);
 $('sharePhoto').querySelector('span').textContent=canShare?'Share':'Download';
 $('sharePhoto').querySelector('use').setAttribute('href',canShare?'#i-share':'#i-download');
}
$('closeViewer').addEventListener('click',openAlbum);
function canShareFiles(file){try{return !!navigator.share&&!!navigator.canShare?.({files:[file]});}catch{return false;}}
function fileName(shot){const d=new Date(shot?.taken||Date.now()),ext=shot?.photo?.type==='image/png'?'png':'jpg';return `pocket-camera-${d.toISOString().slice(0,19).replace(/[:T]/g,'-')}.${ext}`;}
async function sharePhoto(shot){
 const file=new File([shot.photo],fileName(shot),{type:shot.photo.type||'image/jpeg'});
 if(canShareFiles(file)){try{await navigator.share({files:[file],title:'Pocket Camera'});}catch(err){if(err?.name!=='AbortError')download(file);}return;}
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
const mainLook=()=>[{look:state.camera.recipe.layers[0]?.look||'none',amount:1}];
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
 const c=state.camera.recipe,recipe=normalRecipe({layers:mainLook(),frame:c.frame,stamp:c.stamp,adjust:{light:c.adjust.light}});
 let done=0,failed=0;
 try{
  for(const file of files){
   toast(`Adding ${done+failed+1} of ${files.length} in ${mixLabel(recipe)}…`,{ms:60000});
   try{
    const picture=await decode(file);
    const revision=engine.setSource('import',picture.picture,picture.width,picture.height);
    let finished;
    try{await maskStill('import',picture.picture,recipe,revision);finished=await finishPhoto(engine.render(recipe,{source:'import',width:picture.width,height:picture.height}),recipe,new Date(file.lastModified||Date.now()));}
    finally{engine.dropSource('import');}
    const source=picture.picture instanceof HTMLCanvasElement?await toBlob(picture.picture,'image/jpeg',.92):file;
    picture.close();
    await keep({...finished,source,recipe,width:picture.width,height:picture.height,taken:file.lastModified||Date.now()});done++;
   }catch(err){console.error(err);failed++;}
   await nextFrame();
  }
 }finally{importing=false;}
 toast(failed?`${done} added to the album; ${failed} could not be opened`:`${done} photos added to the album`,{ms:2600});
 openAlbum();
}
async function editFile(file){
 if(!isPicture(file)){toast('That is not a picture');return;}
 try{
  const picture=await decode(file);
  const recipe=normalRecipe({layers:mainLook(),stamp:false});
  const sourceBlob=picture.picture instanceof HTMLCanvasElement?await toBlob(picture.picture,'image/jpeg',.92):file;
  openEditor({...picture,recipe,shotId:null,taken:new Date(file.lastModified||Date.now()),sourceBlob});
 }catch{toast('That picture could not be opened');}
}
function openEditor({picture,width,height,recipe,shotId,taken,sourceBlob}){
 if(!engine)return;
 state.edit?.picture?.close?.();
 state.edit={picture,width,height,recipe:normalRecipe(recipe),active:0,shotId,taken,sourceBlob,comparing:false,adjust:'light',from:state.mode};
 state.edit.revision=engine.setSource('edit',picture,width,height);
 eraser.reset();$('eraseUndo').disabled=true;
 show('editor');selectTab('looks');renderAdjusters();renderFramePanel();editStickers.select(null);
 if(state.edit.recipe.stickers.length)loadStickerSets().then(()=>editStickers.render()).catch(()=>{});
}
function closeEditor(){
 if(state.edit?.saving)return;
 const from=state.edit?.from;engine?.dropSource('edit');state.edit?.picture?.close?.();state.edit=null;
 if(from==='viewer'&&state.viewing)openViewer(state.viewing.id);else if(from==='album')openAlbum();else show('camera');
}
$('cancelEdit').addEventListener('click',closeEditor);
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
 return lookPreview({source:'edit',recipe:e.recipe,crop:squareCrop({x:0,y:0,w:1,h:1},{width:e.width,height:e.height})},size);
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
}
$('mirrorChoices').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||!state.edit)return;sound('tick');state.edit.recipe.trick=b.dataset.trick;renderFramePanel();refreshThumbs(true);invalidate();});
$('editStamp').addEventListener('click',()=>{const e=state.edit;if(!e)return;sound('tick');e.recipe.stamp=!e.recipe.stamp;renderFramePanel();invalidate();});
$('saveEdit').addEventListener('click',async()=>{
 const e=state.edit;if(!e||e.saving)return;
 const button=$('saveEdit');e.saving=true;button.disabled=true;$('cancelEdit').disabled=true;button.textContent='Saving…';await nextFrame();
 try{
  const recipe=normalRecipe(e.recipe);
  await ensureEditPerson();
  // An erased photo keeps its erased picture as its source, so it opens again as it was left.
  if(e.erased)e.sourceBlob=await toBlob(e.picture,'image/jpeg',.95);
  const {photo,thumb}=await finishPhoto(engine.render(recipe,{source:'edit',width:e.width,height:e.height}),recipe,e.taken);
  const printing=printPhoto(photo,e.width,e.height,()=>fitInside($('viewerStage').getBoundingClientRect(),e.width/e.height,8));
  let shot;
  if(e.shotId&&albumOK){shot=await updateShot(e.shotId,{photo,thumb,recipe,...(e.erased?{source:e.sourceBlob}:{})});albumRevision++;state.shots=state.shots.map(s=>s.id===shot.id?shot:s);renderRoll();}
  else shot=await keep({photo,source:e.sourceBlob,thumb,recipe,width:e.width,height:e.height,taken:e.taken.getTime()});
  engine.dropSource('edit');e.picture?.close?.();state.edit=null;
  if(shot){state.viewing=shot;await openViewer(shot.id);}else show('camera');
  if(printing)await printing;
  if(shot)toast('Saved to the album');
 }catch(err){console.error(err);toast('The photo could not be saved');}
 finally{e.saving=false;button.disabled=false;$('cancelEdit').disabled=false;button.textContent='Save';}
});
// Hold the picture to see the original.
{
 const stage=$('editStage');let holding=null,at=null;
 const end=()=>{clearTimeout(holding);holding=null;if(state.edit?.comparing){state.edit.comparing=false;$('original').hidden=true;editStickers.hidden=false;invalidate();}};
 stage.addEventListener('pointerdown',e=>{
  if(!state.edit||e.target.closest('button')||state.edit.erasing)return;
  at={x:e.clientX,y:e.clientY};
  holding=setTimeout(()=>{if(!state.edit)return;state.edit.comparing=true;$('original').hidden=false;editStickers.hidden=true;invalidate();},140);
 });
 // A swipe is not a hold.
 stage.addEventListener('pointermove',e=>{if(holding&&at&&Math.hypot(e.clientX-at.x,e.clientY-at.y)>10){clearTimeout(holding);holding=null;}});
 for(const type of ['pointerup','pointercancel','pointerleave'])stage.addEventListener(type,end);
 gestures(stage,{onTap:e=>{if(state.edit&&!state.edit.erasing)focusTap(e,state.edit.recipe,'editFrame');}});
}
function selectTab(tab){
 for(const [id,panel,name] of [['tabLooks','panelLooks','looks'],['tabAdjust','panelAdjust','adjust'],['tabErase','panelErase','erase'],['tabStickers','panelStickers','stickers'],['tabFrame','panelFrame','frame']]){
  $(id).setAttribute('aria-selected',String(tab===name));$(panel).hidden=tab!==name;
 }
 // Erasing paints on the photo itself: the stickers step aside (they are not erased) and come back after.
 const erasing=tab==='erase';
 if(state.edit){state.edit.erasing=erasing;editStickers.hidden=erasing;if(erasing)editStickers.select(null);}
 eraser.active=erasing;invalidate();
 if(tab==='looks')requestAnimationFrame(()=>renderStripSelection());
 if(tab==='stickers')renderStickerPicker();
 if(tab==='frame')renderFramePanel();
}
$('tabLooks').addEventListener('click',()=>selectTab('looks'));
$('tabAdjust').addEventListener('click',()=>selectTab('adjust'));
$('tabErase').addEventListener('click',()=>selectTab('erase'));
$('tabStickers').addEventListener('click',()=>selectTab('stickers'));
$('tabFrame').addEventListener('click',()=>selectTab('frame'));

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
// Erase (erase.js): paint over what should go; the editor's picture changes, the Looks redraw over it.
const eraser=createEraser($('editFrame'),{
 edit:()=>state.edit,
 changed:picture=>{const e=state.edit;if(!e)return;e.erased=true;e.revision=engine.setSource('edit',picture,e.width,e.height);e.personPromise=null;ensureEditPerson();$('eraseUndo').disabled=!eraser.canUndo;refreshThumbs(true);invalidate();},
 busy:on=>{$('eraseHint').textContent=on?'Erasing…':'Paint over what should go.';$('saveEdit').disabled=on;$('cancelEdit').disabled=on;if(!on)sound('pop');},
 failed:()=>toast('That could not be erased'),
});
$('eraseSize').addEventListener('input',e=>{eraser.size=e.target.value;});
$('eraseUndo').addEventListener('click',()=>{if(eraser.working)return;sound('tick');eraser.undo();$('eraseUndo').disabled=!eraser.canUndo;});
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
 }catch(err){console.error(err);toast('That picture could not be made into a sticker');}
}
$('stickerFile').addEventListener('change',e=>{const f=e.target.files?.[0];e.target.value='';if(f)stickerFromPicture(f);});
async function pasteSticker(){
 try{
  for(const item of await navigator.clipboard.read()){
   const type=item.types.find(t=>t.startsWith('image/'));
   if(type){await stickerFromPicture(new File([await item.getType(type)],'pasted',{type}));return;}
  }
  toast('There is no picture to paste. Copy a photo, or a subject lifted from one, first.',{ms:2600});
 }catch{toast('Pasting was not allowed here.',{ms:2000});}
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
const residentSets=manifest=>(manifest?.sets||[]).filter(set=>set.kind!=='marks');
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
 // Text first (balloons, captions, words alone): a short name, so every tab fits across a phone.
 ['Text',...tabs.map(t=>t.name),'Mine'].forEach((name,i)=>{
  const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.textContent=name;
  b.setAttribute('aria-selected',String(i===stickerSet));b.addEventListener('click',()=>{sound('tick');stickerSet=i;renderStickerPicker();grid.scrollTo?.({left:0,top:0});});
  sets.append(b);
 });
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
new ResizeObserver(invalidate).observe(document.body);

// ---------- Start ----------
// On the Home Screen the camera is an app of its own: no way back to the website is needed, and it works offline (sw.js).
const standalone=navigator.standalone===true||matchMedia('(display-mode:standalone)').matches;
document.documentElement.classList.toggle('standalone',standalone);
if('serviceWorker' in navigator)navigator.serviceWorker.register(new URL('./sw.js',import.meta.url)).catch(()=>{});
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
  if(hello){const img=$('welcomeSticker');img.src=hello.url;img.alt=`${hello.set}: ${hello.gloss}`;img.hidden=false;}
  if(off){const img=$('emptySticker');img.src=off.url;img.alt=`${off.set}: ${off.gloss}`;img.hidden=false;}
 }).catch(()=>{});
 if(state.camera.recipe.stickers.some(s=>s.id.startsWith('balloon:')))loadLetteringFont().then(()=>cameraStickers.render());
}
// For the browser checks (camera/tests/camera.browser.mjs).
window.pocketCamera={state,editFile,useFiles,stickerFromPicture,takePhoto,startCamera,get engine(){return engine;},chooseLook,addLayer,shuffle,cameraStickers,editStickers,memory,printer,openMemory};
