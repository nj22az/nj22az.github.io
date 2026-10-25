import {blankFabric,normalizeFabric,FABRIC_SIZE,fillFabric,strokeFabric} from './fabric.js';

/** A small, touch-first repeating-fabric painter. Changes preview after a gesture;
 * Cancel restores the complete opening recipe. Only bounded tile data is saved. */
export function openFabricEditor({recipe,target='top',onPreview,getPreview}){
 const opening=structuredClone(recipe),focus=document.activeElement;
 let current=structuredClone(recipe),tile,tool='pencil',colour='2',history=[],stroke=null,revision=0,closed=false;
 const dialog=document.createElement('dialog');dialog.className='fabric-editor';dialog.setAttribute('aria-labelledby','fabric-title');
 dialog.innerHTML=`<header><div><h2 id="fabric-title">Design fabric</h2><p>A repeating 16 × 16 tile, previewed on your character.</p></div><button type="button" data-action="cancel" aria-label="Cancel fabric changes">×</button></header>
 <label>Garment<select data-target aria-label="Fabric garment"><option value="top">Top and sleeves</option><option value="skirt">Panel / pressed skirt</option></select></label>
 <div class="fabric-tools" role="group" aria-label="Drawing tools"><button type="button" data-tool="pencil">Pencil</button><button type="button" data-tool="fill">Fill</button><button type="button" data-tool="eraser">Eraser</button></div>
 <div class="fabric-working"><canvas width="320" height="320" tabindex="0" aria-label="Fabric tile. Arrow keys move; Space paints." role="img"></canvas><figure><img data-preview alt="Current character wearing the fabric"><figcaption>Character preview</figcaption></figure></div>
 <div class="fabric-swatches" role="group" aria-label="Fabric colours"></div>
 <label>Repeat across garment<select data-repeat aria-label="Fabric repeat"><option value="2">Large · 2 repeats</option><option value="3">3 repeats</option><option value="4">Medium · 4 repeats</option><option value="5">5 repeats</option><option value="6">6 repeats</option><option value="7">7 repeats</option><option value="8">Small · 8 repeats</option></select></label>
 <div class="fabric-tools"><button type="button" data-action="undo">Undo stroke</button><button type="button" data-action="clear">Clear tile</button><button type="button" data-action="checks">Checks</button><button type="button" data-action="stripes">Stripes</button></div>
 <div class="fabric-tools"><button type="button" data-action="import">Import image</button><button type="button" data-action="export">Export tile PNG</button><input type="file" accept="image/png,image/jpeg,image/webp" hidden></div>
 <p class="fabric-note">Image import reduces the picture to 16 colours. The tile repeats; it is not a garment cutting pattern. Choosing skirt fabric enables its panel or pressed construction.</p>
 <p role="status" data-status aria-live="polite"></p>
 <footer><button type="button" data-action="cancel">Cancel</button><button type="button" data-action="apply">Keep fabric</button></footer>`;
 const q=s=>dialog.querySelector(s),canvas=q('canvas'),ctx=canvas.getContext('2d'),select=q('[data-target]'),repeat=q('[data-repeat]'),status=q('[data-status]');
 select.value=target;
 let cursor=0;
 const field=()=>target==='top'?'topFabric':'skirtFabric';
 const base=()=>target==='top'?current.outfit.topColour:current.outfit.bottomColour;
 function preview(){
  if(closed)return;
  current.outfit[field()]=/[^.]/.test(tile.pixels)?normalizeFabric(tile):null;
  if(target==='top')current.outfit.pattern='none';
  else{current.outfit.bottomPattern='none';if(current.outfit.bottom==='pleatedskirt')current.outfit.skirtCut='pressed';else{current.outfit.bottom='skirt';current.outfit.skirtCut='panel';}}
  onPreview(structuredClone(current));
  updatePicture();
  status.textContent='Preview updated. Keep fabric, then Save character to retain it.';
 }
 function updatePicture(){
  const img=q('[data-preview]');img.closest('figure').hidden=!getPreview;if(getPreview)img.src=getPreview();
 }
 function draw(){
  const cell=canvas.width/FABRIC_SIZE;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=0;i<256;i++){
   ctx.fillStyle=tile.pixels[i]==='.'?base():tile.palette[parseInt(tile.pixels[i],16)];ctx.fillRect(i%16*cell,Math.floor(i/16)*cell,cell,cell);
  }
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1;
  for(let i=0;i<=16;i++){ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,320);ctx.moveTo(0,i*cell);ctx.lineTo(320,i*cell);ctx.stroke();}
  if(document.activeElement===canvas){ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.strokeRect(cursor%16*cell+2,Math.floor(cursor/16)*cell+2,cell-4,cell-4);}
  repeat.value=String(tile.repeat);q('[data-action="undo"]').disabled=!history.length;
 }
 function swatches(){
  q('.fabric-swatches').replaceChildren(...tile.palette.map((hex,i)=>{
   const b=document.createElement('button');b.type='button';b.style.background=hex;b.setAttribute('aria-label','Fabric colour '+(i+1)+' '+hex);b.setAttribute('aria-pressed',String(colour===i.toString(16)));b.onclick=()=>{colour=i.toString(16);swatches();};return b;
  }));
 }
 function load(){tile=normalizeFabric(current.outfit[field()])||blankFabric();colour=[1,3,5].reduce((sum,i)=>sum+parseInt(base().slice(i,i+2),16),0)>384&&tile.palette.length>1?'1':'0';history=[];revision++;draw();swatches();}
 function remember(){history.push(structuredClone(tile));if(history.length>40)history.shift();revision++;}
 function edit(fn){remember();fn();draw();swatches();preview();}
 function index(e){const r=canvas.getBoundingClientRect(),x=Math.max(0,Math.min(15,Math.floor((e.clientX-r.left)/r.width*16))),y=Math.max(0,Math.min(15,Math.floor((e.clientY-r.top)/r.height*16)));return y*16+x;}
 function paint(i,from=i){const c=tool==='eraser'?'.':colour;tile.pixels=tool==='fill'?fillFabric(tile.pixels,i,c):strokeFabric(tile.pixels,from,i,c);cursor=i;draw();}
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0||stroke)return;e.preventDefault();canvas.focus();remember();stroke={id:e.pointerId,last:index(e)};canvas.setPointerCapture(e.pointerId);paint(stroke.last);});
 canvas.addEventListener('pointermove',e=>{if(stroke?.id!==e.pointerId||tool==='fill')return;const i=index(e);paint(i,stroke.last);stroke.last=i;});
 const end=e=>{if(stroke?.id!==e.pointerId)return;stroke=null;preview();};
 canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);
 canvas.addEventListener('focus',draw);canvas.addEventListener('blur',draw);
 canvas.addEventListener('keydown',e=>{const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-16,ArrowDown:16};if(e.key in offsets){e.preventDefault();cursor=Math.max(0,Math.min(255,cursor+offsets[e.key]));draw();}else if(e.key===' '||e.key==='Enter'){e.preventDefault();edit(()=>paint(cursor));}});
 for(const b of dialog.querySelectorAll('[data-tool]')){b.onclick=()=>{tool=b.dataset.tool;for(const c of dialog.querySelectorAll('[data-tool]'))c.setAttribute('aria-pressed',String(c===b));};b.setAttribute('aria-pressed',String(b.dataset.tool===tool));}
 select.onchange=()=>{target=select.value;load();status.textContent='Draw a tile or choose Checks / Stripes to preview.';};
 repeat.onchange=()=>edit(()=>{tile.repeat=Number(repeat.value);});
 function close(keep){if(closed)return;closed=true;revision++;if(!keep)onPreview(opening);dialog.close();dialog.remove();focus?.focus();}
 dialog.addEventListener('cancel',e=>{e.preventDefault();close(false);});
 dialog.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='cancel')close(false);
  if(action==='apply'){preview();close(true);}
  if(action==='undo'&&history.length){tile=history.pop();revision++;draw();swatches();preview();}
  if(action==='clear')edit(()=>{tile.pixels='.'.repeat(256);});
  if(action==='checks'||action==='stripes')edit(()=>{tile.pixels=Array.from({length:256},(_,i)=>{const x=i%16,y=Math.floor(i/16);return action==='checks'?(x<4||y<4?colour:'.'):(x<4?colour:'.');}).join('');});
  if(action==='import')q('input[type=file]').click();
  if(action==='export'){
   const out=document.createElement('canvas');out.width=out.height=16;const c=out.getContext('2d');
   for(let i=0;i<256;i++){if(tile.pixels[i]==='.')continue;c.fillStyle=tile.palette[parseInt(tile.pixels[i],16)];c.fillRect(i%16,Math.floor(i/16),1,1);}
   const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='Johansson-fabric-tile.png';a.click();status.textContent='Tile exported. Transparent squares use the garment colour.';
  }
 });
 q('input[type=file]').onchange=async e=>{
  const file=e.target.files[0],ticket=++revision,garment=target;e.target.value='';if(!file)return;
  if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){status.textContent='Choose a PNG, JPEG or WebP image under 5 MB.';return;}
  try{
   const bitmap=await createImageBitmap(file,{resizeWidth:16,resizeHeight:16,resizeQuality:'high'});
   if(closed||ticket!==revision||garment!==target){bitmap.close();return;}
   const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');g.drawImage(bitmap,0,0,16,16);bitmap.close();
   const data=g.getImageData(0,0,16,16).data,counts=new Map();
   const key=i=>'#'+[data[i],data[i+1],data[i+2]].map(v=>(Math.round(v/51)*51).toString(16).padStart(2,'0')).join('');
   for(let i=0;i<data.length;i+=4)if(data[i+3]>=128){const hex=key(i);counts.set(hex,(counts.get(hex)||0)+1);}
   const palette=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,16).map(x=>x[0]);if(!palette.length)palette.push(base());
   const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
   const pixels=Array.from({length:256},(_,i)=>{if(data[i*4+3]<128)return '.';const p=rgb(key(i*4));let best=0,distance=Infinity;palette.forEach((hex,j)=>{const d=rgb(hex).reduce((s,v,k)=>s+(v-p[k])**2,0);if(d<distance){distance=d;best=j;}});return best.toString(16);}).join('');
   edit(()=>{tile={palette,pixels,repeat:tile.repeat};colour='0';});status.textContent='Image converted to a 16 × 16 fabric tile and previewed.';
  }catch{if(!closed)status.textContent='The image could not be opened. Choose a different PNG, JPEG or WebP.';}
 };
 document.body.append(dialog);load();updatePicture();dialog.showModal();q('[data-action="cancel"]').focus();return {close:()=>close(false)};
}
