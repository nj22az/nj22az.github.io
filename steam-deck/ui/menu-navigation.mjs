// Choose the nearest control in the requested direction, as it appears on screen.
export function directionalIndex(rects,index,direction){
 if(!rects.length)return -1;if(index<0||!rects[index])return 0;
 const horizontal=direction==='left'||direction==='right',sign=direction==='left'||direction==='up'?-1:1;
 const center=r=>({x:r.left+r.width/2,y:r.top+r.height/2}),from=center(rects[index]);
 let best=-1,score=Infinity;
 rects.forEach((r,i)=>{if(i===index)return;const to=center(r),along=(horizontal?to.x-from.x:to.y-from.y)*sign,across=Math.abs(horizontal?to.y-from.y:to.x-from.x);if(along<2)return;const cost=along+across*2.5;if(cost<score){score=cost;best=i;}});
 return best<0?index:best;
}
export const menuControls=root=>[...root.querySelectorAll('button,input,select,summary,a[href]')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');
export function moveMenuFocus(root,direction){
 if(!direction)return;
 const items=menuControls(root),selected=root.ownerDocument.activeElement,index=items.indexOf(selected);if(!items.length)return;
 if(index>=0&&(direction==='left'||direction==='right')){
  const sign=direction==='right'?1:-1;
  if(selected.type==='range'){selected.stepUp(sign);selected.dispatchEvent(new Event('input',{bubbles:true}));return;}
  if(selected.tagName==='SELECT'){selected.selectedIndex=Math.max(0,Math.min(selected.options.length-1,selected.selectedIndex+sign));selected.dispatchEvent(new Event('input',{bubbles:true}));return;}
 }
 const next=items[directionalIndex(items.map(el=>el.getBoundingClientRect()),index,direction)];next?.focus({preventScroll:true});next?.scrollIntoView({block:'nearest',inline:'nearest'});
}
