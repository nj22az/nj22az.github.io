import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {subscribeEquipment,adjustEquipment} from './equipment-state.mjs';
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function mountEquipment(root){
 root.innerHTML=`<header class="equipment-heading"><div><p class="equipment-eyebrow">DEN SIMULERADE LABBÄNKEN</p><h2>Det här mäter vi med</h2></div><button type="button" data-action="overview">Visa hela bänken</button></header><p class="equipment-instruction">Välj ett instrument för att förstora det och läsa vad det visar.</p><div class="equipment-choices" role="group" aria-label="Välj instrument"></div><div class="equipment-view"><div class="equipment-flat" hidden></div></div><div class="equipment-view-tools"><button type="button" data-action="rotate" aria-pressed="false">Vrid bänken</button><button type="button" data-action="flat" aria-pressed="false">Enkel vy</button><span class="equipment-status" role="status"></span></div><section class="equipment-detail" aria-label="Valt instrument"></section><p class="equipment-footnote">Förenklade instrumentmodeller. Bänken visar mätprinciper; den är inte ett kopplingsschema för den fysiska riggen.</p>`;
 const $=q=>root.querySelector(q),view=$('.equipment-view'),flat=$('.equipment-flat');
 let current=null,selected=null,closeup=false,rotate=false,flatMode=false,failed=false,renderer,controls,observer,raf=0;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#edf3f7');
 const camera=new THREE.OrthographicCamera(-9,9,5,-5,.1,100);camera.position.set(0,5.5,20);
 const models=new Map(),textures=new Set(),materials=new Set(),geometries=new Set();
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.08,...extra});materials.add(m);return m;};
 const rubber=material('#172a3b'),panel=material('#e3e8eb'),blue=material('#1763a3'),gold=material('#eeb441'),copper=material('#b96535',{metalness:.65,roughness:.3});
 function mesh(g,geometry,mat,x,y,z){geometries.add(geometry);const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 const box=(g,w,h,d,x,y,z,mat,r=.08)=>mesh(g,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)),mat,x,y,z);
 function knob(g,x,y,z,r=.23){const k=mesh(g,new THREE.CylinderGeometry(r,r,.15,28),rubber,x,y,z);k.rotation.x=Math.PI/2;box(g,.035,r*.9,.03,x,y+r*.18,z+.095,panel,.005);return k;}
 function jack(g,x,y,z,color){const m=mesh(g,new THREE.TorusGeometry(.085,.025,8,20),material(color),x,y,z);mesh(g,new THREE.CircleGeometry(.06,20),rubber,x,y,z-.004);return m;}
 function screen(g,w,h,x,y,z,cw=1024,ch=512){
  const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;textures.add(texture);
  const m=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});materials.add(m);const face=mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z);face.castShadow=false;
  return{canvas,ctx,texture};
 }
 function label(g,text,w,x,y,z,color='#163248',bg='#e3e8eb'){
  const s=screen(g,w,.23,x,y,z,1024,100);s.ctx.fillStyle=bg;s.ctx.fillRect(0,0,1024,100);s.ctx.fillStyle=color;s.ctx.font='bold 62px Arial';s.ctx.textAlign='center';s.ctx.fillText(text,512,73);s.texture.needsUpdate=true;return s;
 }
 function feet(g,w,depth){for(const x of [-w*.32,w*.32])box(g,.38,.16,.5,x,.07,depth*.15,rubber,.035);}
 function instrument(id,type){
  const g=new THREE.Group();g.userData.instrument=id;scene.add(g);let display;
  if(type==='meter'){
   box(g,2.1,3.55,.7,0,1.9,0,id==='avg'?gold:blue,.19);box(g,1.83,3.2,.11,0,1.9,.36,rubber,.09);
   display=screen(g,1.55,.76,0,2.8,.426);label(g,id==='avg'?'SINUSKALIBRERAD':'TRUE RMS',1.65,0,3.35,.43,'#ffffff','#172a3b');
   knob(g,0,1.65,.49,.49);label(g,'V~    A~',1.2,0,2.21,.431,'#ffffff','#172a3b');label(g,'COM        V / A',1.5,0,.67,.431,'#ffffff','#172a3b');jack(g,-.45,.39,.46,'#111111');jack(g,.45,.39,.46,'#c53d36');
   for(const x of [-.8,.8])box(g,.28,.58,.82,x,.6,-.03,rubber,.08);feet(g,1.5,.7);
  }else if(type==='source'){
   box(g,3,2.32,1.5,0,1.32,0,panel,.13);box(g,2.8,2.1,.1,0,1.32,.76,rubber,.07);display=screen(g,2.35,.86,0,1.75,.818);
   label(g,'AC-KÄLLA',2.3,0,2.27,.82,'#ffffff','#172a3b');knob(g,.88,.7,.88,.28);jack(g,-.87,.64,.84,'#141414');jack(g,-.35,.64,.84,'#c53d36');label(g,'UTGÅNG',1.2,-.61,.97,.82,'#ffffff','#172a3b');feet(g,2.8,1.4);
  }else if(type==='scope'){
   box(g,5.8,3.52,1.7,0,1.94,0,panel,.15);box(g,4.4,2.78,.1,-.55,1.99,.87,rubber,.07);display=screen(g,4.18,2.57,-.55,1.99,.933,1200,740);
   label(g,'OSCILLOSKOP',3.8,-.55,3.5,.868);for(const [y,t]of [[2.9,'TID'],[1.95,'V / DIV'],[.97,'TRIGG']]){knob(g,2.3,y,.94,.26);label(g,t,.91,2.28,y-.38,.87);}
   jack(g,-2.35,.36,.91,'#d7a133');jack(g,-1.7,.36,.91,'#479ed4');label(g,'CH1    CH2',1.4,-1.99,.61,.88);feet(g,5.3,1.7);
  }else if(type==='power'){
   box(g,3.7,3.43,1.3,0,1.87,0,panel,.13);box(g,3.35,2.72,.1,0,1.83,.67,rubber,.05);display=screen(g,3.13,2.52,0,1.83,.729,1024,800);label(g,'EFFEKTANALYSATOR',3.3,0,3.39,.665);feet(g,3.2,1.3);
  }else{
   box(g,2.6,3.55,.8,0,1.93,0,blue,.13);box(g,2.36,3.2,.1,0,1.93,.42,panel,.07);label(g,'KOMPONENTPLATTA',2.2,0,3.38,.481);
   box(g,1.4,.37,.3,0,2.83,.62,material('#ece4c5'),.04);label(g,'R',.3,-.9,2.83,.484);display=screen(g,1.95,1.04,0,1.15,.48,1024,550);
   class CoilCurve extends THREE.Curve{getPoint(t,target=new THREE.Vector3()){return target.set((t-.5)*1.4,.21*Math.cos(t*Math.PI*22),.21*Math.sin(t*Math.PI*22));}}
   const coil=mesh(g,new THREE.TubeGeometry(new CoilCurve(),180,.029,8,false),copper,0,2.15,.69);g.userData.coil=coil;const cap=mesh(g,new THREE.CylinderGeometry(.2,.2,.5,24),rubber,.82,2.12,.68);g.userData.capacitor=cap;label(g,'L',.3,-.9,2.13,.484);feet(g,2.4,.8);
  }
  const obj={id,type,g,display};models.set(id,obj);return obj;
 }
 function drawScreen(obj,item){
  const{ctx:c,canvas,texture}=obj.display,w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
  if(item.type==='scope'){
   c.fillStyle='#0d2030';c.fillRect(0,0,w,h);c.strokeStyle='#294456';c.lineWidth=2;
   const left=74,right=w-25,top=90,bottom=h-180;
   for(let i=0;i<=8;i++){const x=left+(right-left)*i/8;c.beginPath();c.moveTo(x,top);c.lineTo(x,bottom);c.stroke();}
   for(let i=0;i<=6;i++){const y=top+(bottom-top)*i/6;c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();}
   c.fillStyle='#d6e4ed';c.font='28px Arial';c.textAlign='left';c.fillText(current.second?'u: gul  ·  i/B: blå, streckad  ·  egna skalor':'Spänning (V) över tid',left,46);
   if(current.locked){c.font='bold 56px Arial';c.fillText('Förutsäg först',230,300);}else{
    for(let j=0;j<(current.second?2:1);j++){c.strokeStyle=j?'#68bcf0':'#f2ce54';c.lineWidth=5;c.setLineDash(j?[16,10]:[]);c.beginPath();current.traces.forEach((v,i)=>{const x=left+(right-left)*i/(current.traces.length-1),y=(top+bottom)/2-v[j]*(bottom-top)*.42;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();}c.setLineDash([]);
    c.font='26px Arial';c.fillStyle='#d6e4ed';c.fillText('0',left-35,(top+bottom)/2+9);
    c.fillText('0',left,bottom+38);c.textAlign='center';c.fillText((1000/current.f).toLocaleString('sv-SE',{maximumFractionDigits:2}), (left+right)/2,bottom+38);c.textAlign='right';c.fillText((2000/current.f).toLocaleString('sv-SE',{maximumFractionDigits:2})+' ms',right,bottom+38);
   }
   c.textAlign='left';c.font='bold 37px Arial';c.fillStyle='#f2ce54';c.fillText('T: '+item.rows[0][0],left,h-86);c.fillText('Topp: '+item.rows[1][0],w*.52,h-86);c.fillStyle='#d6e4ed';c.font='28px Arial';c.fillText(item.rows[2][0]+' · två perioder',left,h-28);
  }else if(item.type==='meter'){
   c.fillStyle='#d4dfbf';c.fillRect(0,0,w,h);c.fillStyle='#152722';c.textAlign='right';c.font='bold 180px monospace';c.fillText(item.rows[0][0],w-35,h*.53);c.font='44px Arial';c.fillText(item.rows[0][1],w-35,h*.81);
  }else{
   c.fillStyle=item.type==='load'?'#e3e8eb':'#102a3e';c.fillRect(0,0,w,h);c.textAlign='left';
   const rows=item.type==='load'?item.rows.slice(0,3):item.rows,step=h/(rows.length+.3);
   rows.forEach(([value,label],i)=>{const y=step*(i+.82);c.fillStyle=item.type==='load'?'#163248':'#a5bdca';c.font=`${item.type==='power'?31:39}px Arial`;c.fillText(label,30,y-step*.38);c.fillStyle=item.type==='load'?'#163248':'#e1f5f4';c.font=`bold ${item.type==='power'?49:64}px monospace`;c.fillText(value,30,y+step*.09);});
  }texture.needsUpdate=true;
 }
 function fallback(){failed=true;flatMode=true;root.dataset.renderer='flat';if(renderer)renderer.domElement.hidden=true;flat.hidden=false;$('.equipment-status').textContent='Enkel instrumentvy. Avläsningar och uppgifter fungerar även utan 3D.';$('[data-action=rotate]').disabled=true;paintFlat();}
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','Tredimensionell labbänk. Välj instrument med knapparna ovan.');renderer.domElement.setAttribute('role','img');view.prepend(renderer.domElement);root.dataset.renderer='three';
  scene.add(new THREE.HemisphereLight('#ffffff','#68859b',2.1));const light=new THREE.DirectionalLight('#fff5e2',2.6);light.position.set(-4,10,8);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-12,right:12,top:9,bottom:-9,near:.5,far:35});light.shadow.bias=-.0008;scene.add(light);
  box(scene,18,.18,4,0,-.12,0,material('#bdcbd5'),.05);
  for(const [id,type]of [['source','source'],['trms','meter'],['avg','meter'],['scope','scope'],['load','load'],['power','power']])instrument(id,type);
  controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enabled=false;controls.minPolarAngle=Math.PI*.32;controls.maxPolarAngle=Math.PI*.49;controls.minAzimuthAngle=-.5;controls.maxAzimuthAngle=.5;controls.addEventListener('change',render);
  renderer.domElement.style.touchAction='pan-y';
  const ray=new THREE.Raycaster(),point=new THREE.Vector2();let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7)return;const r=renderer.domElement.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(point,camera);const hit=ray.intersectObjects([...models.values()].filter(m=>m.g.visible).map(m=>m.g),true)[0];if(hit){let o=hit.object;while(o&&!o.userData.instrument)o=o.parent;if(o)select(o.userData.instrument,true);}});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();});
 }catch{fallback();}
 function render(){if(renderer&&!failed&&!flatMode&&current)renderer.render(scene,camera);}
 function frame(){
  if(!renderer||failed||flatMode)return;const w=Math.max(250,view.clientWidth),h=Math.max(300,view.clientHeight);renderer.setSize(w,h,false);
  const obj=models.get(selected),item=current?.instruments.find(i=>i.id===selected);let width=17.6,target=new THREE.Vector3(0,1.6,0);
  if(closeup&&obj){width=item.type==='scope'?7.3:item.type==='power'?5:4.1;target=new THREE.Vector3(obj.g.position.x,1.9,.25);}
  const aspect=w/h,span=Math.max(width/aspect,closeup?4.65:5.3);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();
  camera.position.set(target.x+.5,target.y+3.1,19);controls.target.copy(target);controls.update();render();
 }
 function paintFlat(){if(!current)return;flat.innerHTML=current.instruments.map(i=>`<button class="equipment-flat-instrument equipment-${i.type}" type="button" data-instrument="${i.id}"><span>${esc(i.name)}</span><strong>${esc(i.rows[0][0])}</strong><small>${esc(i.rows[0][1])}</small></button>`).join('');}
 function detail(){
  if(!current)return;const item=current.instruments.find(i=>i.id===selected)||current.instruments[0];
  $('.equipment-detail').innerHTML=`<div><h3>${esc(item.name)}</h3><p>${esc(item.help)}</p>${current.locked?'<p class="equipment-predict-note">Avläsningarna visas när du har sparat din förutsägelse.</p>':''}</div><dl>${item.rows.filter(([v])=>v!=='—').map(([v,label])=>`<div><dt>${esc(label)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>${current.editable&&item.id==='source'?`<form class="equipment-source-controls"><label>Spänning RMS (V)<input name="U" type="number" min="${current.tab==='effekt'?12:1}" max="${current.tab==='impedans'?400:690}" step="0.1" value="${current.U}" required></label><label>Frekvens (Hz)${current.tab==='effekt'?`<select name="f"><option value="50"${current.f===50?' selected':''}>50</option><option value="60"${current.f===60?' selected':''}>60</option></select>`:`<input name="f" type="number" min="1" max="${current.tab==='impedans'?500:400}" step="1" value="${current.f}" required>`}</label><button class="primary" type="submit">Använd inställningarna</button></form>`:''}`;
  const form=$('form');if(form)form.onsubmit=e=>{e.preventDefault();const U=Number(form.elements.U.value),f=Number(form.elements.f.value);adjustEquipment(current.tab==='sinus'?'urms':'U',U);adjustEquipment('f',f);};
  $('.equipment-choices').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.instrument===selected)));
 }
 function select(id,zoom=true){selected=id;closeup=zoom;rotate=false;if(controls)controls.enabled=false;$('[data-action=rotate]').setAttribute('aria-pressed','false');if(renderer)renderer.domElement.style.touchAction='pan-y';for(const m of models.values())m.g.visible=Boolean(current?.instruments.find(i=>i.id===m.id))&&(!closeup||m.id===selected);detail();frame();}
 const unsubscribe=subscribeEquipment(data=>{
  const changed=!current||current.tab!==data.tab||current.taskId!==data.taskId;current=data;
  if(changed||!data.instruments.some(i=>i.id===selected)){selected=data.focus;closeup=view.clientWidth<620;}
  const positions=data.tab==='effekt'?{source:-4.8,power:-.85,scope:4.5}:{source:-5.9,trms:-2.9,avg:-.3,load:-.1,scope:4.4};
  for(const m of models.values()){const i=data.instruments.find(i=>i.id===m.id);m.g.visible=Boolean(i)&&(!closeup||m.id===selected);if(i){m.g.position.x=positions[m.id]||0;if(m.id==='load'){m.g.userData.coil.visible=data.values.kind.includes('L');m.g.userData.capacitor.visible=data.values.kind.includes('C');}drawScreen(m,i);}}
  $('.equipment-choices').innerHTML=data.instruments.map(i=>`<button type="button" data-instrument="${i.id}" aria-pressed="${i.id===selected}">${esc(i.name)}</button>`).join('');paintFlat();detail();frame();
 });
 root.addEventListener('click',e=>{const instrument=e.target.closest('[data-instrument]');if(instrument){select(instrument.dataset.instrument);return;}const action=e.target.closest('[data-action]')?.dataset.action;if(action==='overview'){closeup=false;select(selected,false);}if(action==='rotate'&&!failed){rotate=!rotate;controls.enabled=rotate;renderer.domElement.style.touchAction=rotate?'none':'pan-y';$('[data-action=rotate]').setAttribute('aria-pressed',String(rotate));$('.equipment-status').textContent=rotate?'Dra för att vrida. Stäng av för att rulla sidan.':'';}if(action==='flat'){flatMode=failed||!flatMode;flat.hidden=!flatMode;if(renderer)renderer.domElement.hidden=flatMode;$('[data-action=flat]').setAttribute('aria-pressed',String(flatMode));$('[data-action=rotate]').disabled=flatMode;root.dataset.renderer=flatMode?'flat':'three';frame();}});
 observer=new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);});observer.observe(view);
 return{dispose(){unsubscribe();observer.disconnect();cancelAnimationFrame(raf);controls?.dispose();for(const t of textures)t.dispose();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();renderer?.dispose();}};
}
