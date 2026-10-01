/**
 * 立ち読み: standing at Sakura's rack, reading.
 *
 * First the rack itself, every title's issue on sale today as a cover you can pick;
 * then the issue, one page at a time. Japanese magazines open from the right, so the
 * next page is to the left: ◀, a swipe to the right, or the left arrow key turn
 * forward. Pages come from magazine-art.js — drawn on canvas, or loaded as the images
 * tools/magazines/draw_pages.py prints.
 */
import {rackIssues} from '../world/interiors/magazine-issues.js';
import {drawCover,pagesFor} from '../world/interiors/magazine-art.js';
import {assetURL} from '../assets.js';

const PAGE_W=600,PAGE_H=840;
const images=new Map();
function loadImage(path){
 if(!images.has(path))images.set(path,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=assetURL(path);}));
 return images.get(path);
}
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};

export function createMagazineReader({date}){
 const root=el('div','mag-reader'),{issues}=rackIssues(date);
 let view=null,keyHandler=null,disposed=false;
 function clearKeys(){if(keyHandler)document.removeEventListener('keydown',keyHandler);keyHandler=null;}

 function shelf(){
  clearKeys();root.replaceChildren();
  root.append(el('div','mag-hint','Today’s issues. Pick one up and read.'));
  const grid=el('div','mag-shelf');
  for(const {title,issue} of issues){
   const b=el('button','mag-cover');b.type='button';
   const c=el('canvas');c.width=160;c.height=220;drawCover(c.getContext('2d'),title,issue,160,220);
   b.append(c,el('span','mag-cover-name',title.name),el('span','mag-cover-issue',issue.dateLine));
   b.setAttribute('aria-label',`${title.name}, ${title.en}, ${issue.dateLine}: ${issue.head}`);
   b.onclick=()=>read(title,issue);grid.append(b);
  }
  root.append(grid);grid.querySelector('button')?.focus();
 }

 function read(title,issue){
  clearKeys();root.replaceChildren();
  const pages=pagesFor(title,issue);let index=0,token=0;
  const head=el('div','mag-head');
  const back=el('button','mag-back','‹ Rack');back.type='button';back.onclick=shelf;
  head.append(back,el('span','mag-title',`${title.name} · ${issue.dateLine}`));
  const stage=el('div','mag-stage'),canvas=el('canvas','mag-page');canvas.width=PAGE_W;canvas.height=PAGE_H;
  canvas.setAttribute('role','img');stage.append(canvas);
  const nav=el('div','mag-nav'),next=el('button','mag-turn','◀ 次へ'),prev=el('button','mag-turn','戻る ▶'),count=el('span','mag-count');
  next.type=prev.type='button';next.setAttribute('aria-label','Next page');prev.setAttribute('aria-label','Previous page');
  nav.append(next,count,prev);
  root.append(head,stage,nav,el('div','mag-hint','Read right to left: ◀ turns the page.'));
  const ctx=canvas.getContext('2d');
  async function render(dir=0){
   const mine=++token,page=pages[index];
   count.textContent=`${index+1} / ${pages.length}`;next.disabled=index>=pages.length-1;prev.disabled=index<=0;
   canvas.setAttribute('aria-label',`${title.name}, page ${index+1} of ${pages.length}`);
   if(dir){canvas.classList.remove('turn-next','turn-prev');void canvas.offsetWidth;canvas.classList.add(dir>0?'turn-next':'turn-prev');}
   ctx.fillStyle='#fbf8ee';ctx.fillRect(0,0,PAGE_W,PAGE_H);
   if(page.draw){page.draw(ctx,PAGE_W,PAGE_H);return;}
   ctx.fillStyle='#999';ctx.font='700 28px sans-serif';ctx.textAlign='center';ctx.fillText('…',PAGE_W/2,PAGE_H/2);
   try{const img=await loadImage(page.image);if(mine===token&&!disposed)ctx.drawImage(img,0,0,PAGE_W,PAGE_H);}
   catch{if(mine===token){ctx.fillStyle='#fbf8ee';ctx.fillRect(0,0,PAGE_W,PAGE_H);ctx.fillStyle='#777';ctx.fillText('This page is stuck together.',PAGE_W/2,PAGE_H/2);}}
  }
  const turn=d=>{const to=Math.max(0,Math.min(pages.length-1,index+d));if(to===index)return;index=to;render(d);};
  next.onclick=()=>turn(1);prev.onclick=()=>turn(-1);
  // A swipe to the right turns forward, as a right-to-left book does.
  let sx=null;
  canvas.addEventListener('pointerdown',e=>{sx=e.clientX;});
  canvas.addEventListener('pointerup',e=>{if(sx==null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)turn(dx>0?1:-1);else turn(e.offsetX<canvas.clientWidth/2?1:-1);});
  keyHandler=e=>{if(e.key==='ArrowLeft'){e.preventDefault();turn(1);}else if(e.key==='ArrowRight'){e.preventDefault();turn(-1);}};
  document.addEventListener('keydown',keyHandler);
  render();next.focus();
 }

 shelf();
 return {element:root,dispose(){disposed=true;clearKeys();}};
}
