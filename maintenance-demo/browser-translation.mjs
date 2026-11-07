// Native page translation remains browser-controlled. Never rewrite stored records.
const TECHNICAL=/AFS\s*\d{4}:\d+|\b\d{4}\/\d+\/EU\b|\b(?:PS|TS|DN|PED|SEP|CLP|SDS)\b|[−-]?\d+(?:[.,]\d+)?\s*(?:bar(?:·L)?|kW|°C|m³\/h|mm|L)(?![\p{L}\p{N}])/gu;
export function translationSegments(text){
  const out=[];let start=0;
  for(const match of text.matchAll(TECHNICAL)){if(match.index>start)out.push({text:text.slice(start,match.index),protected:false});out.push({text:match[0],protected:true});start=match.index+match[0].length;}
  if(start<text.length)out.push({text:text.slice(start),protected:false});return out;
}
export function verbatim(value){return '<span translate="no">'+String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</span>';}
export function prepareTranslation(root){
  if(!root)return;
  root.querySelectorAll('input,textarea,code,pre,.kv b,.assessment-values dd').forEach(el=>el.setAttribute('translate','no'));
  const document=root.ownerDocument;
  const walker=document.createTreeWalker(root,4),nodes=[];
  while(walker.nextNode()){const node=walker.currentNode;if(!node.parentElement?.closest('[translate="no"],script,style,option'))nodes.push(node);}
  for(const node of nodes){const parts=translationSegments(node.data);if(!parts.some(p=>p.protected))continue;const fragment=document.createDocumentFragment();for(const part of parts){if(part.protected){const span=document.createElement('span');span.setAttribute('translate','no');span.textContent=part.text;fragment.append(span);}else fragment.append(document.createTextNode(part.text));}node.replaceWith(fragment);}
}
