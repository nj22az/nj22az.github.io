import {svg,actionFor,itemIcon} from './icons.js';
/** One icon vocabulary for controls, with words retained for ambiguous choices. */
export function controlIcon(label=''){
 const value=String(label).trim();
 for(const [pattern,icon] of [[/^(close|cancel|done|dismiss|×)/i,'close'],[/^(back|return)/i,'exit'],[/^(remove|delete|discard)/i,'trash'],[/^(save|download|export|capture|photo)/i,'camera'],[/^(location|place|travel|visit|map|directions)/i,'map'],[/^(wardrobe|clothes|outfit|shirt|trousers|skirt|hat|hair)/i,'shirt'],[/^(settings|controls|options)/i,'gear'],[/^(add|choose|select)/i,'plus'],[/^(continue|next|start|enter)/i,'door']])if(pattern.test(value))return icon;
 const action=actionFor(value);return action.icon==='eye'?itemIcon(value):action.icon;
}
export function installIconControls(root=document.body){
 const targets='#activity button,#directory button,.shm-pill,.shm-next,.shm-pages button,#photoStudio button,#cameraPanel button,#qte button,.modal-card button';
 const apply=(nodes=[root])=>{const buttons=new Set();for(const node of nodes){if(node.nodeType!==1)continue;if(node.matches?.(targets))buttons.add(node);for(const button of node.querySelectorAll(targets))buttons.add(button);}for(const button of buttons){
  if(button.querySelector('svg')||button.classList.contains('icon-btn')||button.dataset.icon)continue;
  const label=button.textContent.trim();if(!label||label.length>75)continue;
  const span=document.createElement('span');span.textContent=label.replace(/\s*×$/,'')||label;if(label==='×')span.className='sr-only';const glyph=document.createElement('span');glyph.innerHTML=svg(({viewButton:'eye',timeButton:'clock',weatherButton:'sun',soundButton:'music',fullscreenButton:'screen',closeActivity:'close',closeDirectory:'close'})[button.id]||controlIcon(label));button.replaceChildren(glyph.firstElementChild,span);button.classList.add('icon-control');if(!button.title)button.title=button.getAttribute('aria-label')||label;
 }};
 apply();const observer=new MutationObserver(records=>apply(records.flatMap(record=>[record.target.closest?.('button'),...record.addedNodes]).filter(Boolean)));observer.observe(root,{subtree:true,childList:true});return ()=>observer.disconnect();
}
