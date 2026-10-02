/**
 * The study viewer: one machine from the equipment library at a time, to turn, take apart
 * and label, in Swedish or English, and to save as a picture for study material.
 *
 * Everything you set is kept in the address, so a lesson, a document or the town can link
 * to (or embed, with &embed=1) exactly the same view:
 *   ?model=induction-motor&lang=sv&explode=0.6&cutaway=1&labels=1&part=rotor&connection=star
 */
import * as THREE from '../johansson-town/vendor/three.module.js';
import {EQUIPMENT,buildEquipment,setExplode,setCutaway,highlight} from './catalogue.js';

const UI={
 sv:{home:'Nils Johansson',heading:'Utrustning',hint:'Dra för att vrida · nyp eller rulla för att zooma · tryck på en del',
  nowebgl:'Den här webbläsaren kan inte visa 3D. Listan över delarna fungerar ändå.',explode:'Sprängskiss',cutaway:'Genomskärning',
  labels:'Etiketter',save:'Spara bild (PNG)',link:'Kopiera länk',copied:'Länken är kopierad',parts:'Delar',models:'Maskiner',
  pick:'Välj en del i listan eller tryck på modellen.',on:'På',off:'Av',file:'utrustning'},
 en:{home:'Nils Johansson',heading:'Equipment',hint:'Drag to turn · pinch or scroll to zoom · tap a part',
  nowebgl:'This browser cannot show 3D. The list of parts still works.',explode:'Exploded view',cutaway:'Cutaway',
  labels:'Labels',save:'Save picture (PNG)',link:'Copy link',copied:'Link copied',parts:'Parts',models:'Machines',
  pick:'Choose a part from the list, or tap the model.',on:'On',off:'Off',file:'equipment'},
};
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
const state={
 lang:params.get('lang')==='en'?'en':'sv',
 model:EQUIPMENT.some(e=>e.id===params.get('model'))?params.get('model'):EQUIPMENT[0].id,
 explode:Math.max(0,Math.min(1,Number(params.get('explode'))||0)),
 cutaway:params.get('cutaway')==='1',labels:params.get('labels')==='1',part:params.get('part')||null,
};
if(params.get('embed')==='1')document.body.classList.add('embed');

// Renderer, scene and light. A failed WebGL context leaves the part list working.
const canvas=$('#eq-canvas');
let renderer=null;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});}catch{$('.eq-fallback').hidden=false;}
renderer?.setPixelRatio(Math.min(2,devicePixelRatio||1));
if(renderer)renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene();scene.background=new THREE.Color(0xe9e5dc);
scene.add(new THREE.HemisphereLight(0xffffff,0x8d8778,1.4));
const sun=new THREE.DirectionalLight(0xffffff,1.6);sun.position.set(3,5,4);scene.add(sun);
const fill=new THREE.DirectionalLight(0xffffff,.5);fill.position.set(-4,2,-3);scene.add(fill);
const camera=new THREE.PerspectiveCamera(35,1,.01,100);

// Turning and zooming: drag to orbit, wheel or pinch to zoom. A short tap picks a part.
const view={theta:.75,phi:1.1,radius:3,target:new THREE.Vector3()};
function placeCamera(){
 const {theta,phi,radius,target}=view;
 camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));
 camera.lookAt(target);
}
const pointers=new Map();let pinch=0,downAt=null;
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);downAt=pointers.size===1?[e.clientX,e.clientY]:null;
 if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);}});
canvas.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;const [px,py]=pointers.get(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY]);
 if(pointers.size===1){view.theta-=(e.clientX-px)*.008;view.phi=Math.max(.15,Math.min(Math.PI-.15,view.phi-(e.clientY-py)*.008));}
 else if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch)zoom(pinch/d);pinch=d;}
});
const release=e=>{
 if(downAt&&pointers.size===1&&Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])<6)pick(e);
 pointers.delete(e.pointerId);if(pointers.size<2)pinch=0;downAt=null;
};
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);downAt=null;});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001));},{passive:false});
let fitRadius=3;
function zoom(k){view.radius=Math.max(fitRadius*.25,Math.min(fitRadius*3,view.radius*k));}

// The machine on show.
let model=null;
const raycaster=new THREE.Raycaster();
function pick(e){
 if(!model)return;const r=canvas.getBoundingClientRect();
 raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
 const hit=raycaster.intersectObject(model.group,true).find(h=>h.object.visible&&h.object.material.opacity>.5&&h.object.userData.part);
 select(hit?hit.object.userData.part.id:null);
}
function select(id){
 state.part=model.parts.some(p=>p.id===id)?id:null;
 highlight(model,state.part);render();sync();
}

function load(id){
 if(model){scene.remove(model.group);model.group.traverse(o=>{if(o.isMesh){o.geometry.dispose();}});}
 state.model=id;model=buildEquipment(THREE,id);scene.add(model.group);
 for(const c of model.controls){const v=params.get(c.id);if(v!==null&&id===params.get('model'))c.set(c.type==='toggle'?v==='1':c.type==='choice'?v:Number(v));}
 // Frame the machine as it is shown (assembled or exploded); zooming out always reaches
 // the whole exploded view.
 const sphereAt=t=>{setExplode(model,t);return new THREE.Box3().setFromObject(model.group).getBoundingSphere(new THREE.Sphere());};
 const fit=s=>s.radius/Math.tan(camera.fov*Math.PI/360)*1.05;
 const whole=sphereAt(1),shown=state.explode>0?whole:sphereAt(0);setExplode(model,0);
 fitRadius=fit(whole);view.target.copy(shown.center);view.radius=fit(shown)*(state.explode>0?.8:1);
 camera.near=fitRadius/100;camera.far=fitRadius*10;camera.updateProjectionMatrix();
 setExplode(model,state.explode);setCutaway(model,state.cutaway);
 if(!model.parts.some(p=>p.id===state.part))state.part=null;
 highlight(model,state.part);
 render();
}

// The panel: title, controls, the part list and the selected part's text.
function text(key){return UI[state.lang][key];}
function render(){
 document.documentElement.lang=state.lang;document.title=text('heading')+' · '+model.title[state.lang];
 for(const el of document.querySelectorAll('[data-text]'))el.textContent=text(el.dataset.text);
 for(const b of document.querySelectorAll('[data-lang]'))b.setAttribute('aria-pressed',String(b.dataset.lang===state.lang));
 $('.eq-models').setAttribute('aria-label',text('models'));
 const nav=$('.eq-models');nav.replaceChildren(...EQUIPMENT.map(e=>{const b=document.createElement('button');b.type='button';b.textContent=e.title[state.lang];
  b.setAttribute('aria-current',String(e.id===state.model));b.onclick=()=>{if(e.id!==state.model){state.part=null;load(e.id);}};return b;}));
 $('#eq-title').textContent=model.title[state.lang];$('#eq-summary').textContent=model.summary[state.lang];
 $('#eq-explode').value=state.explode;$('#eq-cutaway').checked=state.cutaway;$('#eq-labels').checked=state.labels;
 const box=$('#eq-model-controls');box.replaceChildren(...model.controls.map(controlFor));
 const list=$('#eq-parts');list.replaceChildren(...model.parts.map((p,i)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';
  const n=document.createElement('span');n.className='eq-num';n.textContent=String(i+1);b.append(n,p.name[state.lang]);
  b.dataset.part=p.id;b.setAttribute('aria-pressed',String(p.id===state.part));b.onclick=()=>select(p.id===state.part?null:p.id);li.append(b);return li;}));
 const part=model.parts.find(p=>p.id===state.part);
 $('#eq-part-name').textContent=part?part.name[state.lang]:model.title[state.lang];
 $('#eq-part-text').textContent=part?part.text[state.lang]:text('pick');
 buildMarkers();
}
function controlFor(c){
 const label=c.label[state.lang];
 if(c.type==='toggle'){const l=document.createElement('label');l.className='eq-check';const i=document.createElement('input');i.type='checkbox';i.checked=c.value;
  i.onchange=()=>{c.set(i.checked);sync();};const s=document.createElement('span');s.textContent=label;l.append(i,s);return l;}
 if(c.type==='choice'){const d=document.createElement('div');d.className='eq-choice';d.setAttribute('role','group');d.setAttribute('aria-label',label);const s=document.createElement('span');s.textContent=label;d.append(s);
  for(const o of c.options){const b=document.createElement('button');b.type='button';b.textContent=o.label[state.lang];b.setAttribute('aria-pressed',String(c.value===o.value));
   b.onclick=()=>{c.set(o.value);for(const x of d.querySelectorAll('button'))x.setAttribute('aria-pressed',String(x===b));sync();};d.append(b);}
  return d;}
 const l=document.createElement('label');l.className='eq-row';const s=document.createElement('span');s.textContent=label;
 const i=document.createElement('input');i.type='range';i.min=c.min;i.max=c.max;i.step=c.step||1;i.value=c.value;
 const out=document.createElement('output');const show=()=>{out.textContent=c.value+(c.unit||'');};show();
 i.oninput=()=>{c.set(Number(i.value));show();sync();};c.refresh=()=>{i.value=c.value;show();};l.append(s,i,out);return l;
}

// Numbered markers at the middle of each part, kept on the part as it moves.
let markers=[];
function buildMarkers(){
 const layer=$('.eq-markers');layer.replaceChildren();markers=[];
 if(!state.labels)return;
 model.parts.forEach((p,i)=>{const m=document.createElement('div');m.className='eq-marker'+(p.id===state.part?' selected':'');m.textContent=String(i+1);layer.append(m);markers.push({el:m,part:p});});
}
const centre=new THREE.Vector3(),box3=new THREE.Box3();
/** Where a part's marker goes on screen, or null when it is behind the camera or hidden. */
function markerAt(p,w,h){
 // Only the part's own meshes: a rotor's marker should not drift towards its shaft and bearings.
 box3.makeEmpty();p.object.traverse(o=>{if(o.isMesh&&o.visible&&o.userData.part===p)box3.expandByObject(o);});
 if(box3.isEmpty())return null;box3.getCenter(centre).project(camera);
 if(centre.z>1)return null;return [(centre.x+1)/2*w,(1-centre.y)/2*h];
}
function placeMarkers(){
 if(!markers.length)return;const r=canvas.getBoundingClientRect();
 for(const {el,part} of markers){const at=markerAt(part,r.width,r.height);el.style.display=at?'':'none';if(at){el.style.left=at[0]+'px';el.style.top=at[1]+'px';}}
}

// The address keeps the view, so it can be shared, linked from a lesson or embedded.
let syncTimer=0;
function sync(){
 clearTimeout(syncTimer);syncTimer=setTimeout(()=>{
  const q=new URLSearchParams({model:state.model,lang:state.lang});
  if(state.explode)q.set('explode',state.explode);if(state.cutaway)q.set('cutaway','1');if(state.labels)q.set('labels','1');if(state.part)q.set('part',state.part);
  for(const c of model.controls){const v=c.type==='toggle'?(c.value?'1':''):String(c.value);if(v)q.set(c.id,v);}
  if(document.body.classList.contains('embed'))q.set('embed','1');
  history.replaceState(null,'','?'+q);
 },150);
 for(const b of document.querySelectorAll('#eq-parts button'))b.setAttribute('aria-pressed',String(b.dataset.part===state.part));
 const part=model.parts.find(p=>p.id===state.part);
 $('#eq-part-name').textContent=part?part.name[state.lang]:model.title[state.lang];$('#eq-part-text').textContent=part?part.text[state.lang]:text('pick');
 markers.forEach(m=>m.el.classList.toggle('selected',m.part.id===state.part));
}

$('#eq-explode').addEventListener('input',e=>{state.explode=Number(e.target.value);setExplode(model,state.explode);sync();});
$('#eq-cutaway').addEventListener('change',e=>{state.cutaway=e.target.checked;setCutaway(model,state.cutaway);sync();});
$('#eq-labels').addEventListener('change',e=>{state.labels=e.target.checked;buildMarkers();sync();});
for(const b of document.querySelectorAll('[data-lang]'))b.addEventListener('click',()=>{state.lang=b.dataset.lang;render();sync();});
$('#eq-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);const b=$('#eq-link');b.textContent=text('copied');setTimeout(()=>{b.textContent=text('link');},1600);}catch{prompt(text('link'),location.href);}});

/**
 * A picture for study material: the machine on white, numbered markers when labels are on,
 * and the numbered part list beside it, at twice the screen's size.
 */
$('#eq-save').addEventListener('click',()=>{
 if(!renderer)return;
 const scale=2,w=canvas.clientWidth*scale,h=canvas.clientHeight*scale,legend=state.labels?Math.max(560,w*.32):0;
 const oldBg=scene.background;scene.background=new THREE.Color(0xffffff);
 renderer.setPixelRatio(scale);renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);renderer.render(scene,camera);
 const out=document.createElement('canvas');out.width=w+legend;out.height=Math.max(h,legend?120+model.parts.length*44:0);
 const x=out.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,out.width,out.height);x.drawImage(canvas,0,0,w,h);
 x.font=`600 ${28}px system-ui,sans-serif`;x.fillStyle='#2b2a27';x.fillText(model.title[state.lang],24,44);
 if(state.labels){
  model.parts.forEach((p,i)=>{const at=markerAt(p,w,h);if(!at)return;x.beginPath();x.arc(at[0],at[1],18,0,Math.PI*2);x.fillStyle=p.id===state.part?'#ff8a2a':'#2b2a27';x.fill();
   x.fillStyle='#fff';x.font='700 20px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(String(i+1),at[0],at[1]+1);});
  x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle='#2b2a27';x.font='600 24px system-ui,sans-serif';x.fillText(text('parts'),w+24,60);
  x.font='22px system-ui,sans-serif';model.parts.forEach((p,i)=>x.fillText(`${i+1}  ${p.name[state.lang]}`,w+24,104+i*44));
 }
 scene.background=oldBg;renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));resize(true);
 const a=document.createElement('a');a.download=`${text('file')}-${state.model}-${state.lang}.png`;a.href=out.toDataURL('image/png');a.click();
});

function resize(force){
 const w=canvas.clientWidth,h=canvas.clientHeight;if(!renderer||!w||!h)return;
 if(force||canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
}
let last=performance.now();
function frame(now){
 requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;
 model.update(dt);for(const c of model.controls)c.refresh?.();
 resize();placeCamera();if(renderer)renderer.render(scene,camera);placeMarkers();
}
load(state.model);requestAnimationFrame(frame);
