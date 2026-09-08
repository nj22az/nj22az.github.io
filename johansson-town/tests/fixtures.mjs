export class Element {
  constructor(){this.children=[];this.style={};this.listeners={};this.dataset={};this.hidden=false;this.value='';const classes=new Set(['hidden']);this.classList={add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:(k,v)=>v?classes.add(k):classes.delete(k)};}
  append(...items){this.children.push(...items);}appendChild(e){this.append(e);}replaceChildren(){this.children=[];}focus(){}setAttribute(){}querySelectorAll(){return this.children;}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}removeEventListener(){}
  get firstChild(){return this.children[0];}get lastChild(){return this.children.at(-1);}
  getContext(){return new Proxy({fillRect(){},strokeRect(){},fillText(){},measureText:s=>({width:s.length*17})},{get:(o,k)=>o[k]||(()=>{})});}
}
export function installDOM(saved={}){
 const elements=new Map(),storage=new Map(Object.entries(saved));
 globalThis.document={createElement:()=>new Element(),createElementNS:()=>new Element(),querySelector:s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s);},addEventListener(){},exitPointerLock(){},activeElement:new Element(),documentElement:new Element(),body:new Element()};
 globalThis.window={};globalThis.location={href:'https://nj22az.github.io/johansson-town/'};
 globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 globalThis.innerWidth=1024;navigator.vibrate=()=>{};
 return {elements,storage,button(label){const b=document.querySelector('#activityActions').children.find(x=>x.textContent===label);if(!b)throw Error('Missing action: '+label);b.onclick();}};
}
