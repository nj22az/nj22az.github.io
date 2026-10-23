/**
 * The Look picker: one small picture per look, the same little house drawn in each style, and a one-word name
 * (the owner, 22 October 2026: "The menus are too text heavy, can they be more icon based?"). A tap draws the town in
 * that look at once and the sheet stays open, so looks can be compared against the town behind it; ×, Escape or a
 * tap above the sheet closes it. While it is open it keeps every key and pointer from reaching the town, as the free
 * camera does.
 */
import {svg as icon} from './icons.js';

const PALETTES={
 none:{sky:'#8fc9ef',ground:'#7fbf5a',wall:'#f4ead3',roof:'#d8342c',door:'#7a5236',sun:'#ffd447'},
 mono:{sky:'#c9c9c9',ground:'#7a7a7a',wall:'#efefef',roof:'#4a4a4a',door:'#2e2e2e',sun:'#ffffff'},
 sepia:{sky:'#e4cfa3',ground:'#8f6d42',wall:'#f3e6c8',roof:'#6e4a2a',door:'#4a321c',sun:'#fff3d4'},
 pocket:{sky:'#c8d48a',ground:'#3e6238',wall:'#829e4c',roof:'#183020',door:'#183020',sun:'#c8d48a'},
 snes:{sky:'#58a8f8',ground:'#38b838',wall:'#f8e8b8',roof:'#e83820',door:'#885028',sun:'#f8d838'},
 lines:{sky:'#faf8f2',ground:'#faf8f2',wall:'#faf8f2',roof:'#faf8f2',door:'#faf8f2',sun:'#faf8f2'},
 crt:{sky:'#7fb4d6',ground:'#6aa152',wall:'#e8dcc0',roof:'#c0392b',door:'#6a4a32',sun:'#f2cf55'},
 manga:{sky:'#f7f6f2',ground:'#f7f6f2',wall:'#f7f6f2',roof:'#141418',door:'#141418',sun:'#f7f6f2'},
 crayon:{sky:'#cfe6f5',ground:'#cfe8bf',wall:'#fbf3e2',roof:'#f2a99b',door:'#c9a184',sun:'#ffe9a0'},
 tilt:{sky:'#7cc4f5',ground:'#5fc24a',wall:'#fff1d0',roof:'#ec3b2a',door:'#7a4a2a',sun:'#ffd23f'},
 print:{sky:'#2e5c8a',ground:'#7d9a6a',wall:'#f1e6cc',roof:'#c8452e',door:'#2a2420',sun:'#f1e6cc'},
 watercolour:{sky:'#bcdcf0',ground:'#bfe0a8',wall:'#fbf4e6',roof:'#f08a7a',door:'#c49a7c',sun:'#ffe08a'},
 flat:{sky:'#6fc3ff',ground:'#7ed957',wall:'#fff6d8',roof:'#ff5a3c',door:'#8a5a2b',sun:'#ffd93b'},
 sketchbook:{sky:'#dce6df',ground:'#b9c6a1',wall:'#f5ead5',roof:'#c8a191',door:'#958778',sun:'#f2e6bd'},
 oil:{sky:'#5e8fc4',ground:'#4f8a3a',wall:'#e9d3a8',roof:'#a8321f',door:'#4a2c18',sun:'#f2b632'},
};

/** The little scene in one look, as an SVG string (48×48). Every swatch is the same house, so the style is the difference. */
export function lookSwatch(id,uid=id){
 const media={sketchbook:'crayon'}[id]||id;
 const p=PALETTES[id]||PALETTES.none,pixel=media==='pocket'||media==='snes';
 const ink=media==='lines'?'#2b2b33':media==='flat'?'#2b2121':media==='manga'||media==='print'?'#141418':media==='crayon'?'#6c6670':media==='watercolour'?'#9a8f88':null;
 const line=ink?` stroke="${ink}" stroke-width="${media==='flat'?2.6:media==='manga'||media==='print'?2:media==='crayon'||media==='watercolour'?1.2:1.5}" stroke-linejoin="round"${media==='watercolour'?' stroke-opacity=".55"':''}`:'';
 const defs=[],over=[];
 if(media==='manga'){
  defs.push(`<pattern id="d${uid}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="2" cy="2" r="1.05" fill="#141418"/></pattern>`,
   `<pattern id="h${uid}" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1" height="3" fill="#141418"/></pattern>`);
  over.push(`<rect width="48" height="30" fill="url(#d${uid})"/>`,`<rect y="30" width="48" height="18" fill="url(#h${uid})"/>`);
 }
 if(media==='crayon'){
  defs.push(`<pattern id="c${uid}" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="1.1" height="3.2" fill="#ffffff" opacity=".55"/></pattern>`);
 }
 if(media==='print'){
  // The printed sky: Prussian blue at the top, fading to paper at the horizon.
  defs.push(`<linearGradient id="b${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3a5f"/><stop offset="1" stop-color="#f1e6cc"/></linearGradient>`);
  over.push(`<rect width="48" height="30" fill="url(#b${uid})"/>`);
 }
 if(media==='watercolour')defs.push(`<filter id="w${uid}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence baseFrequency=".08" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.5"/></filter>`);
 if(media==='oil')defs.push(`<pattern id="o${uid}" width="6" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><path d="M0 2h4" stroke="#fff" stroke-opacity=".28" stroke-width="1.4" stroke-linecap="round"/></pattern>`);
 if(media==='crt')defs.push(`<pattern id="s${uid}" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="1" fill="#000" opacity=".28"/></pattern>`);
 // The pixel looks get a stepped roof and a square sun, on whole pixels.
 const roof=pixel?`<path d="M12 22h24v-3h-3v-3h-3v-3h-3v-3h-6v3h-3v3h-3v3h-3z" fill="${p.roof}"/>`
  :`<path d="M11 22L24 10L37 22Z" fill="${p.roof}"${line}/>`;
 const sun=pixel?`<rect x="34" y="5" width="8" height="8" fill="${p.sun}"/>`:`<circle cx="38" cy="9" r="5" fill="${p.sun}"${line}/>`;
 const scene=[
  `<rect width="48" height="30" fill="${p.sky}"/>`,`<rect y="30" width="48" height="18" fill="${p.ground}"/>`,
  media==='lines'?'<path d="M0 30H48" stroke="#2b2b33" stroke-width="1.2"/>':'',
  ...over,sun,
  `<rect x="14" y="21" width="20" height="16" fill="${p.wall}"${line}/>`,roof,
  `<rect x="22" y="28" width="5" height="9" fill="${p.door}"${line}/>`,
  media==='crayon'?`<rect width="48" height="48" fill="url(#c${uid})"/>`:'',
  media==='oil'?`<rect width="48" height="48" fill="url(#o${uid})"/>`:'',
  // Tilt-shift: the top and bottom of the picture go soft.
  media==='tilt'?`<rect width="48" height="13" fill="#fff" opacity=".55"/><rect y="38" width="48" height="10" fill="#fff" opacity=".55"/>`:'',
  media==='crt'?`<rect width="48" height="48" fill="url(#s${uid})"/><rect x="1" y="1" width="46" height="46" rx="9" fill="none" stroke="#101418" stroke-width="3"/>`:'',
 ].join('');
 const body=media==='watercolour'?`<g filter="url(#w${uid})">${scene}</g>`:scene;
 return `<svg viewBox="0 0 48 48" aria-hidden="true"${pixel?' shape-rendering="crispEdges"':''}><defs>${defs.join('')}</defs>${body}</svg>`;
}

const STYLE=`
#lookPicker{position:fixed;inset:0;z-index:62;display:flex;align-items:flex-end;justify-content:center;background:linear-gradient(transparent 40%,rgba(10,16,16,.35))}
#lookPicker[hidden]{display:none}
#lookPicker .look-sheet{width:min(400px,calc(100% - 16px));margin:0 0 max(12px,env(safe-area-inset-bottom));padding:14px 14px 16px;border-radius:18px;
 background:#fbf9f3;color:#1d2825;box-shadow:0 10px 40px rgba(0,0,0,.25);font:700 12px/1.2 system-ui,sans-serif}
#lookPicker .look-head{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px}
#lookPicker .look-head svg{width:22px;height:22px}
#lookPicker .look-close{display:grid;place-items:center;width:40px;height:40px;padding:0;border:0;border-radius:50%;background:#eceee6;color:inherit}
#lookPicker .look-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
#lookPicker .look-grid button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:6px 4px 8px;border:2px solid transparent;
 border-radius:14px;background:none;color:inherit;font:inherit;letter-spacing:0}
#lookPicker .look-grid button svg{display:block;width:60px;height:60px;border-radius:12px;box-shadow:0 1px 0 rgba(0,0,0,.08),0 0 0 1px rgba(0,0,0,.08)}
#lookPicker .look-grid button[aria-pressed="true"]{border-color:#2f8a5f;background:#e6f3ea}
#lookPicker .look-grid button:focus-visible{outline:3px solid #2f8a5f;outline-offset:2px}
`;

/**
 * @param {object} o
 * @param {Record<string,{label:string,short?:string}>} o.looks the catalogue (render/looks.js LOOKS)
 * @param {()=>string[]} o.available the looks this device can draw, in order
 * @param {()=>string} o.current
 * @param {(id:string)=>void} o.choose
 */
export function createLookPicker({looks,available,current,choose,doc=globalThis.document,win=globalThis,onOpen=()=>{},onClose=()=>{}}){
 let root=null,grid=null,open=false,focusBefore=null;
 function build(){
  const style=doc.createElement('style');style.textContent=STYLE;doc.head.append(style);
  root=doc.createElement('div');root.id='lookPicker';root.hidden=true;
  root.innerHTML=`<div class="look-sheet" role="dialog" aria-modal="true" aria-label="Look: how the town is drawn"><div class="look-head">${icon('camera')}<button type="button" class="look-close" aria-label="Close">${icon('close')}</button></div><div class="look-grid"></div></div>`;
  grid=root.querySelector('.look-grid');
  root.querySelector('.look-close').onclick=close;
  // A tap on the town above the sheet closes it; taps inside the sheet do not.
  root.addEventListener('pointerdown',e=>{if(e.target===root){e.preventDefault();close();}});
  // Drags and taps on the sheet are its own: the game's look-around listeners on the document never see them.
  const sheet=root.querySelector('.look-sheet');
  for(const type of ['pointerdown','pointermove','pointerup','touchstart','touchmove','mousedown','mousemove','wheel'])sheet.addEventListener(type,e=>e.stopPropagation());
  doc.body.append(root);
 }
 function render(){
  const now=current();
  grid.replaceChildren(...available().map(id=>{
   const b=doc.createElement('button');b.type='button';b.dataset.look=id;
   b.setAttribute('aria-pressed',String(id===now));b.setAttribute('aria-label',looks[id].label);b.title=looks[id].label;
   b.innerHTML=lookSwatch(id,'p'+id)+`<span>${looks[id].short||looks[id].label}</span>`;
   b.onclick=()=>{choose(id);render();grid.querySelector(`[data-look="${id}"]`)?.focus();};
   return b;
  }));
 }
 function show(){
  if(!root)build();
  if(open)return;
  open=true;focusBefore=doc.activeElement;doc.exitPointerLock?.();render();root.hidden=false;onOpen();
  (grid.querySelector('[aria-pressed="true"]')||grid.firstElementChild)?.focus();
 }
 function close(){
  if(!open)return;
  open=false;root.hidden=true;onClose();
  if(focusBefore?.getClientRects?.().length)focusBefore.focus();
 }
 // Keys stay in the sheet: Escape closes, arrows move between pictures, Enter/Space choose, the rest never reach the town.
 win.addEventListener('keydown',e=>{
  if(!open)return;
  e.stopImmediatePropagation();
  if(e.code==='Escape'){e.preventDefault();close();return;}
  const items=[...grid.children],at=items.indexOf(doc.activeElement);
  const cols=Math.max(1,Math.round(grid.clientWidth/Math.max(1,items[0]?.offsetWidth||1)));
  const step={ArrowRight:1,ArrowLeft:-1,ArrowDown:cols,ArrowUp:-cols}[e.code];
  if(step){e.preventDefault();items[Math.max(0,Math.min(items.length-1,(at<0?0:at)+step))]?.focus();return;}
  if(!['Enter','Space','NumpadEnter','Tab'].includes(e.code))e.preventDefault();
 },true);
 for(const type of ['keyup','wheel'])win.addEventListener(type,e=>{if(open)e.stopImmediatePropagation();},true);
 return {show,close,get open(){return open;}};
}
