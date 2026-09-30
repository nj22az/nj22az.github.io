import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {canvasRenderer} from './equipment-canvas.mjs';
import {subscribeEquipment,adjustEquipment} from './equipment-state.mjs';
import {markHtml,markText} from '../gemensamt/markering.mjs';
const VIEW_KEY='sjoskolan-ac-visning';
// Kopplingen i Hela bänken: uttagens lägen i varje instrument (lokala koordinater) och vilka uttag som förbinds.
// Sinus: mätarna och oscilloskopet parallellt över källan. Impedans: källa, strömmätare och komponentplatta i serie.
const UTTAG={source:{rod:[-.35,.64,.84],svart:[-.87,.64,.84]},meter:{rod:[.45,.39,.46],svart:[-.45,.39,.46]},scope:{rod:[-2.35,.36,.91],ch2:[-1.7,.36,.91],svart:[-1.05,.36,.91]},load:{rod:[-.72,.42,.49],svart:[.72,.42,.49]}};
const KOPPLING={
 sinus:[['source','rod','trms','rod','rod'],['source','svart','trms','svart','svart'],['source','rod','avg','rod','rod'],['source','svart','avg','svart','svart'],['source','rod','scope','rod','gul'],['source','svart','scope','svart','svart']],
 impedans:[['source','rod','trms','rod','rod'],['trms','svart','load','rod','rod'],['load','svart','source','svart','svart'],['source','rod','scope','rod','gul'],['source','svart','scope','svart','svart']],
};
const KOPPLING_TEXT={
 sinus:'Sladdarna: källan är kopplad till båda mätarna och oscilloskopet parallellt. Alla tre mäter samma spänning. Oscilloskopets svarta sladd (REF) är referensen, 0 V.',
 impedans:'Sladdarna: strömmätaren sitter i serie. Strömmen går från källans röda uttag genom mätaren, resistorn och spolen och tillbaka till det svarta uttaget, och samma ström går genom alla delar. Det är växelström: riktningen byter 100 gånger per sekund vid 50 Hz, därför pekar pilarna åt båda hållen. Oscilloskopets kanal 1 (gul) mäter källans spänning mot REF (svart). Kanal 2 (blå) får strömmen från strömproben runt returledaren.',
};
export function mountEquipment(root){
 root.innerHTML=`<header class="equipment-heading"><p class="equipment-eyebrow">LABBÄNKEN</p><h2 class="equipment-title" tabindex="-1">Instrumenten i uppgiften</h2></header><p class="equipment-instruction">Välj ett instrument eller hela bänken.<span class="equipment-scroll-note"> Du kan rulla sidan över bilden.</span></p><div class="equipment-row"><span class="equipment-row-label" aria-hidden="true">Visa:</span><div class="equipment-choices" role="group" aria-label="Visa"></div></div><div class="equipment-view-tools"><span class="equipment-row-label" aria-hidden="true">Bild:</span><div class="equipment-mode" role="group" aria-label="Bild"><button type="button" data-view="3d" aria-pressed="true">3D-bild</button><button type="button" data-view="flat" aria-pressed="false">Siffror</button></div><p class="equipment-status" role="status"></p></div><div class="equipment-view"><div class="equipment-flat" hidden></div></div><section class="equipment-detail" aria-label="Valt instrument"></section><p class="equipment-back"><a href="#guide-steg">Tillbaka till uppgiften</a></p><p class="equipment-footnote">Förenklade instrumentmodeller. Sladdarna i Hela bänken visar principen för kopplingen, inte den fysiska riggens kopplingsschema.</p>`;
 const $=q=>root.querySelector(q),view=$('.equipment-view'),flat=$('.equipment-flat');
 let shelf=null,base={},current=null,selected=null,closeup=true,flatMode=false,failed=false,renderer,observer,raf=0,choiceKey='';
 // Bildval (3D-bild eller Siffror) gäller under besöket. Smal skärm börjar med Siffror.
 let stored=null;try{stored=sessionStorage.getItem(VIEW_KEY);}catch{}
 flatMode=stored==='flat'||stored!=='3d'&&view.clientWidth<620;
 // Smal skärm, hela bänken: instrumenten ställs i två rader (en hylla ovanför bänken), så att de blir läsbara.
 const UPPER=4.7,WIDTH={source:3,meter:2.1,scope:5.8,power:3.7,load:2.6};
 const scene=new THREE.Scene();scene.background=new THREE.Color('#edf3f7');
 const camera=new THREE.OrthographicCamera(-9,9,5,-5,.1,100);camera.position.set(0,5.5,20);
 const models=new Map(),textures=new Set(),materials=new Set(),geometries=new Set();
 const material=(color,extra={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.08,...extra});materials.add(m);return m;};
 const wires=[],PIL=material('#1763a3',{emissive:'#0b3f73',emissiveIntensity:.5}),SLADD={rod:material('#c53d36'),svart:material('#1d2126'),gul:material('#d7a133'),bla:material('#479ed4')},PROB=material('#8fa6b6',{metalness:.3,roughness:.4});
 const rubber=material('#172a3b'),dial=material('#536674'),panel=material('#e3e8eb'),blue=material('#1763a3'),gold=material('#eeb441'),copper=material('#b96535',{metalness:.65,roughness:.3});
 function mesh(g,geometry,mat,x,y,z){geometries.add(geometry);const m=new THREE.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 const box=(g,w,h,d,x,y,z,mat,r=.08)=>mesh(g,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)),mat,x,y,z);
 function knob(g,x,y,z,r=.23){const k=mesh(g,new THREE.CylinderGeometry(r,r,.15,28),dial,x,y,z);k.rotation.x=Math.PI/2;box(g,.035,r*.9,.03,x,y+r*.18,z+.095,panel,.005);return k;}
 function jack(g,x,y,z,color){const m=mesh(g,new THREE.TorusGeometry(.085,.025,8,20),material(color),x,y,z);mesh(g,new THREE.CircleGeometry(.06,20),rubber,x,y,z-.004);return m;}
 function screen(g,w,h,x,y,z,cw=1024,ch=512){
  const canvas=document.createElement('canvas');canvas.width=cw;canvas.height=ch;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;textures.add(texture);
  const m=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});materials.add(m);const face=mesh(g,new THREE.PlaneGeometry(w,h),m,x,y,z);face.castShadow=false;
  return{canvas,ctx,texture};
 }
 function paintLabel(s,text,color,bg){let size=62;s.ctx.fillStyle=bg;s.ctx.fillRect(0,0,1024,100);s.ctx.fillStyle=color;s.ctx.textAlign='center';do{s.ctx.font=`bold ${size}px Arial`;size-=4;}while(size>30&&s.ctx.measureText?.(text)?.width>980);s.ctx.fillText(text,512,73);s.texture.needsUpdate=true;s.text=text;}
 function label(g,text,w,x,y,z,color='#163248',bg='#e3e8eb'){
  const s=screen(g,w,.23,x,y,z,1024,100);s.colors=[color,bg];paintLabel(s,text,color,bg);return s;
 }
 function feet(g,w,depth){for(const x of [-w*.32,w*.32])box(g,.38,.16,.5,x,.07,depth*.15,rubber,.035);}
 function instrument(id,type){
  const g=new THREE.Group();g.userData.instrument=id;scene.add(g);let display;
  let nameLabel=null;
  if(type==='meter'){
   box(g,2.1,3.55,.7,0,1.9,0,id==='avg'?gold:blue,.19);box(g,1.83,3.2,.11,0,1.9,.36,rubber,.09);
   display=screen(g,1.55,.76,0,2.8,.426);label(g,id==='avg'?'SINUSKALIBRERAD':'TRUE RMS',1.65,0,3.35,.43,'#ffffff','#172a3b');
   knob(g,0,1.65,.49,.49);label(g,'V~    A~',1.2,0,2.21,.431,'#ffffff','#172a3b');label(g,'COM        V / A',1.5,0,.67,.431,'#ffffff','#172a3b');jack(g,-.45,.39,.46,'#111111');jack(g,.45,.39,.46,'#c53d36');
   for(const x of [-.8,.8])box(g,.28,.58,.82,x,.6,-.03,rubber,.08);feet(g,1.5,.7);
  }else if(type==='source'){
   box(g,3,2.32,1.5,0,1.32,0,panel,.13);box(g,2.8,2.1,.1,0,1.32,.76,rubber,.07);display=screen(g,2.35,.86,0,1.75,.818);
   nameLabel=label(g,'AC-KÄLLA',2.3,0,2.27,.82,'#ffffff','#172a3b');knob(g,.88,.7,.88,.28);jack(g,-.87,.64,.84,'#141414');jack(g,-.35,.64,.84,'#c53d36');label(g,'UTGÅNG',1.2,-.61,.97,.82,'#ffffff','#172a3b');feet(g,2.8,1.4);
  }else if(type==='scope'){
   box(g,5.8,3.52,1.7,0,1.94,0,panel,.15);box(g,4.4,2.78,.1,-.55,1.99,.87,rubber,.07);display=screen(g,4.18,2.57,-.55,1.99,.933,1200,740);
   label(g,'OSCILLOSKOP',3.8,-.55,3.5,.868);for(const [y,t]of [[2.9,'TID'],[1.95,'V / DIV'],[.97,'TRIGG']]){knob(g,2.3,y,.94,.26);label(g,t,.91,2.28,y-.38,.87);}
   jack(g,-2.35,.36,.91,'#d7a133');jack(g,-1.7,.36,.91,'#479ed4');jack(g,-1.05,.36,.91,'#141414');label(g,'CH1    CH2    REF',2.1,-1.7,.61,.88);feet(g,5.3,1.7);
  }else if(type==='power'){
   box(g,3.7,3.43,1.3,0,1.87,0,panel,.13);box(g,3.35,2.72,.1,0,1.83,.67,rubber,.05);display=screen(g,3.13,2.52,0,1.83,.729,1024,800);label(g,'EFFEKTANALYSATOR',3.3,0,3.39,.665);feet(g,3.2,1.3);
  }else{
   box(g,2.6,3.55,.8,0,1.93,0,blue,.13);box(g,2.36,3.2,.1,0,1.93,.42,panel,.07);label(g,'KOMPONENTPLATTA',2.2,0,3.38,.481);
   box(g,1.4,.37,.3,0,2.83,.62,material('#ece4c5'),.04);label(g,'R',.3,-.9,2.83,.484);display=screen(g,1.95,1.04,0,1.15,.48,1024,550);
   class CoilCurve extends THREE.Curve{getPoint(t,target=new THREE.Vector3()){return target.set((t-.5)*1.4,.21*Math.cos(t*Math.PI*22),.21*Math.sin(t*Math.PI*22));}}
   const coil=mesh(g,new THREE.TubeGeometry(new CoilCurve(),180,.029,8,false),copper,0,2.15,.69);g.userData.coil=coil;const cap=mesh(g,new THREE.CylinderGeometry(.2,.2,.5,24),rubber,.82,2.12,.68);g.userData.capacitor=cap;label(g,'L',.3,-.9,2.13,.484);jack(g,-.72,.42,.49,'#c53d36');jack(g,.72,.42,.49,'#141414');label(g,'IN          UT',1.7,0,.2,.484);feet(g,2.4,.8);
  }
  const obj={id,type,g,display,nameLabel};models.set(id,obj);return obj;
 }
 // Skriv text med index (U_{RMS}) på en skärm: indexet ritas nedsänkt och mindre, aldrig som råtext.
 function subText(c,text,x,y,px){let pos=x;for(const [i,part]of String(text).split(/_\{([^{}]*)\}/).entries()){if(!part)continue;const sub=i%2===1;c.font=`${sub?Math.round(px*.7):px}px Arial`;c.fillText(part,pos,sub?y+px*.25:y);pos+=c.measureText?.(part)?.width||0;}}
 function drawScreen(obj,item){
  const{ctx:c,canvas,texture}=obj.display,w=canvas.width,h=canvas.height;c.clearRect(0,0,w,h);
  if(item.type==='scope'){
   c.fillStyle='#0d2030';c.fillRect(0,0,w,h);c.strokeStyle='#294456';c.lineWidth=2;
   const left=74,right=w-25,top=90,bottom=h-180;
   for(let i=0;i<=8;i++){const x=left+(right-left)*i/8;c.beginPath();c.moveTo(x,top);c.lineTo(x,bottom);c.stroke();}
   for(let i=0;i<=6;i++){const y=top+(bottom-top)*i/6;c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();}
   c.fillStyle='#d6e4ed';c.font='28px Arial';c.textAlign='left';c.fillText(current.second?(current.tab==='sinus'?'u: gul, heldragen  ·  B: blå, streckad':'u: gul, heldragen  ·  i: blå, streckad  ·  egna skalor'):'Spänning (V) över tid',left,46);
   if(current.locked){c.font='bold 56px Arial';c.fillText('Spara förutsägelsen först',120,300);}else{
    for(let j=0;j<(current.second?2:1);j++){c.strokeStyle=j?'#68bcf0':'#f2ce54';c.lineWidth=5;c.setLineDash(j?[16,10]:[]);c.beginPath();current.traces.forEach((v,i)=>{const x=left+(right-left)*i/(current.traces.length-1),y=(top+bottom)/2-v[j]*(bottom-top)*.42;i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();}c.setLineDash([]);
    c.font='26px Arial';c.fillStyle='#d6e4ed';c.fillText('0',left-35,(top+bottom)/2+9);
    c.fillText('0',left,bottom+38);c.textAlign='center';c.fillText((1000/current.f).toLocaleString('sv-SE',{maximumFractionDigits:2}), (left+right)/2,bottom+38);c.textAlign='right';c.fillText((2000/current.f).toLocaleString('sv-SE',{maximumFractionDigits:2})+' ms',right,bottom+38);
   }
   c.textAlign='left';c.font='bold 37px Arial';c.fillStyle='#f2ce54';c.fillText('T: '+item.rows[0][0],left,h-86);c.fillText('Topp: '+item.rows[1][0],w*.52,h-86);c.fillStyle='#d6e4ed';c.font='28px Arial';c.fillText(item.rows[2][0]+' · två perioder',left,h-28);
  }else if(item.type==='meter'){
   c.fillStyle='#d4dfbf';c.fillRect(0,0,w,h);c.fillStyle='#152722';c.textAlign='right';c.font='bold 180px monospace';c.fillText(item.rows[0][0],w-35,h*.53);c.font='44px Arial';c.fillText(item.rows[0][1],w-35,h*.81);
  }else{
   c.fillStyle=item.type==='load'?'#e3e8eb':'#102a3e';c.fillRect(0,0,w,h);c.textAlign='left';
   const rows=item.type==='load'?item.rows.slice(0,3):item.rows.filter(([v])=>v!=='—'),step=h/(rows.length+.3);
   rows.forEach(([value,label],i)=>{const y=step*(i+.82);c.fillStyle=item.type==='load'?'#163248':'#a5bdca';c.font=`${item.type==='power'?31:39}px Arial`;subText(c,label,30,y-step*.38,item.type==='power'?31:39);c.fillStyle=item.type==='load'?'#163248':'#e1f5f4';c.font=`bold ${item.type==='power'?49:64}px monospace`;c.fillText(value,30,y+step*.09);});
  }texture.needsUpdate=true;
 }
 function fallback(){failed=true;const b=$('[data-view="3d"]');if(b)b.disabled=true;setView('flat');}
 try{
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});}catch{renderer=canvasRenderer();}renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','Tredimensionell labbänk. Välj instrument med knapparna ovan.');renderer.domElement.setAttribute('role','img');view.prepend(renderer.domElement);root.dataset.renderer=renderer.isCanvasRenderer?'canvas3d':'three';
  scene.add(new THREE.HemisphereLight('#ffffff','#68859b',2.1));const light=new THREE.DirectionalLight('#fff5e2',2.6);light.position.set(-4,10,8);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-12,right:12,top:9,bottom:-9,near:.5,far:35});light.shadow.bias=-.0008;scene.add(light);
  box(scene,18,.18,4,0,-.12,0,material('#bdcbd5'),.05);shelf=box(scene,10,.18,2.2,0,UPPER-.12,-.2,material('#bdcbd5'),.05);shelf.visible=false;
  for(const [id,type]of [['source','source'],['trms','meter'],['avg','meter'],['scope','scope'],['load','load'],['power','power']])instrument(id,type);
  // Bilden roterar aldrig: ett finger över bilden rullar alltid sidan.
  renderer.domElement.style.touchAction='pan-y pinch-zoom';
  const ray=new THREE.Raycaster(),point=new THREE.Vector2();let down=null;
  renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointercancel',()=>{down=null;});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>7){down=null;return;}down=null;const r=renderer.domElement.getBoundingClientRect();point.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(point,camera);const hit=ray.intersectObjects([...models.values()].filter(m=>m.g.visible).map(m=>m.g),true)[0];if(hit){let o=hit.object;while(o&&!o.userData.instrument)o=o.parent;if(o)select(o.userData.instrument,true);}});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();});
 }catch{fallback();}
 function render(){if(renderer&&!failed&&!flatMode&&current)renderer.render(scene,camera);}
 function place(two){if(!current)return;if(shelf)shelf.visible=two;
  const list=current.instruments.map(i=>models.get(i.id)).filter(Boolean);
  if(!two){for(const m of list){m.g.position.set(base[m.id]||0,0,0);}return;}
  const upper=list.filter(m=>m.type!=='scope'),lower=list.filter(m=>m.type==='scope');
  for(const [row,y]of [[upper,UPPER],[lower,0]]){const total=row.reduce((a,m)=>a+WIDTH[m.type],0)+.5*(row.length-1);let x=-total/2;for(const m of row){m.g.position.set(x+WIDTH[m.type]/2,y,0);x+=WIDTH[m.type]+.5;}}}
 function frame(){
  if(!renderer||failed||flatMode)return;const w=Math.max(250,view.clientWidth),h=Math.max(200,view.clientHeight);renderer.setSize(w,h,false);
  const obj=models.get(selected),item=current?.instruments.find(i=>i.id===selected);let width=15.8,target=new THREE.Vector3(0,1.6,0);
  let tall=3.9;const two=!closeup&&current&&w/h<1.9;place(two);if(two){width=10.4;tall=UPPER+4.3;target=new THREE.Vector3(0,tall/2-.2,0);}
  // Närbild: instrumentet fyller bilden. Höjd och bredd per instrumenttyp (i scenens enheter, med lite marginal).
  if(closeup&&obj){const size={scope:[6.6,4.3],power:[4.4,4.3],source:[3.6,3.2],meter:[2.6,4],load:[3.1,4]}[item.type]||[4.1,3.9];width=size[0];tall=size[1];target=new THREE.Vector3(obj.g.position.x,tall/2+.05,.25);}
  const aspect=w/h,span=Math.max(width/aspect,closeup&&obj||two?tall:4.6);camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();
  camera.position.set(target.x+.5,target.y+3.1,19);camera.lookAt(target);sladdar();render();
 }
 function sladdar(){
  for(const m of wires){scene.remove(m);m.geometry.dispose();}wires.length=0;
  if(closeup||!current)return;
  const pos=(id,u)=>{const o=models.get(id);if(!o||!o.g.visible)return null;o.g.updateMatrixWorld(true);return o.g.localToWorld(new THREE.Vector3(...UTTAG[o.type][u]));};
  (KOPPLING[current.tab]||[]).forEach(([a,ua,b,ub,farg],k)=>{const p=pos(a,ua),q=pos(b,ub);if(!p||!q)return;
   // Sladden går fram från uttaget, ned mot hyllan eller bänken där instrumenten står och bort till nästa uttag.
   const golv=Math.min(models.get(a).g.position.y,models.get(b).g.position.y),fram=.5+.2*k,lag=Math.max(golv+.1,Math.min(p.y,q.y)-.3-.05*k);
   const bana=[p,p.clone().add(new THREE.Vector3(0,-.04,.3)),new THREE.Vector3(p.x,lag,p.z+fram),new THREE.Vector3((p.x+q.x)/2,lag-.04,Math.max(p.z,q.z)+fram+.1),new THREE.Vector3(q.x,lag,q.z+fram),q.clone().add(new THREE.Vector3(0,-.04,.3)),q];
   const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bana,false,'centripetal'),90,.065,8),SLADD[farg]);m.castShadow=true;scene.add(m);wires.push(m);
   // Seriekretsen: pilar visar strömmens väg (källans röda uttag, mätaren, plattan, tillbaka).
   if(current.tab==='impedans'&&k<3){   // bara seriekretsens tre sladdar, inte oscilloskopets
    const kurva=m.geometry.parameters.path;for(const s of [.35,.65]){const pt=kurva.getPointAt(s),dir=kurva.getTangentAt(s);
    for(const tecken of [1,-1]){const pil=new THREE.Mesh(new THREE.ConeGeometry(.15,.34,16),PIL);pil.position.copy(pt).addScaledVector(dir,.2*tecken);pil.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().multiplyScalar(tecken));scene.add(pil);wires.push(pil);}}}
   // Strömproben: en ring runt returledaren (plattan UT till källans svarta uttag), blå sladd till CH2.
   if(current.tab==='impedans'&&a==='load'&&b==='source'){const kurva=m.geometry.parameters.path,pt=kurva.getPointAt(.5),dir=kurva.getTangentAt(.5);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.3,.11,14,32),PROB);ring.position.copy(pt);ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);scene.add(ring);wires.push(ring);
    const q2=pos('scope','ch2'),sida=models.get('scope').g.position.x+3.35;   // runt oscilloskopets högra sida, inte över skärmen
    if(q2){const v=[pt.clone().add(new THREE.Vector3(0,-.25,.2)),new THREE.Vector3(sida,pt.y-.4,pt.z+.6),new THREE.Vector3(sida,q2.y-.1,q2.z+.8),new THREE.Vector3(q2.x+.6,q2.y-.22,q2.z+.8),q2.clone().add(new THREE.Vector3(0,-.04,.3)),q2];
     const s=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v,false,'centripetal'),80,.055,8),SLADD.bla);scene.add(s);wires.push(s);}}});
 }
 const shown=()=>current?(closeup?current.instruments.filter(i=>i.id===selected):current.instruments):[];
 // Siffror: vanliga kort med alla rader (inga knappar). Bara det valda instrumentet, eller alla när hela bänken visas.
 function paintFlat(){if(!current)return;flat.innerHTML=shown().map(i=>`<div class="equipment-flat-instrument equipment-${i.type}">${closeup?'':`<h3>${markHtml(i.name)}</h3>`}<dl>${i.rows.filter(([v])=>v!=='—').map(([v,l])=>`<div><dt>${markHtml(l)}</dt><dd>${markHtml(v)}</dd></div>`).join('')}</dl></div>`).join('');}
 function status(){const el=$('.equipment-status');if(!el||!current)return;
  const text=[failed?'3D-bilden kan inte visas på den här enheten. Siffrorna gäller.':'',current.locked?'Värdena visas när du har sparat din förutsägelse.':''].filter(Boolean).join(' ');
  // Skriv bara om texten ändras, så att skärmläsaren inte läser samma mening igen.
  if(el.textContent!==text)el.textContent=text;
  const title=$('.equipment-title'),t=current.editable?'Instrumenten':'Instrumenten i uppgiften';if(title.textContent!==t)title.textContent=t;
  const note=$('.equipment-scroll-note');if(note)note.hidden=flatMode;}
 function pressed(){$('.equipment-choices').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action==='overview'?!closeup:closeup&&b.dataset.instrument===selected)));
  root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.view==='flat')===flatMode)));}
 function detail(){
  if(!current)return;const box=$('.equipment-detail');
  // Hela bänken: inget instrument är valt, så panelen säger det i stället för att visa det senast valda.
  if(!closeup){box.setAttribute('aria-label','Hela bänken');box.innerHTML=`<div><h3>Hela bänken</h3><p>Här syns alla instrument i ${current.editable?'labbet':'uppgiften'}: ${current.instruments.map(i=>markHtml(i.name)).join(', ')}. Välj ett instrument ovan för att se det närmare.</p>${KOPPLING_TEXT[current.tab]?`<p class="equipment-koppling">${KOPPLING_TEXT[current.tab]}</p>`:''}</div>`;return;}
  box.setAttribute('aria-label','Valt instrument');
  // Fokus ska stanna kvar i formuläret när panelen byggs om (till exempel efter ”Använd inställningarna”).
  const active=box.contains(document.activeElement)?document.activeElement:null,keep=active?(active.name||(active.type==='submit'?'submit':'')):'';
  const item=current.instruments.find(i=>i.id===selected)||current.instruments[0],rows=item.rows.filter(([v])=>v!=='—');
  box.innerHTML=`<div><h3>${markHtml(item.name)}</h3><p>${markHtml(item.help)}</p>${item.caption?`<p class="equipment-caption">Bilden: ${markHtml(item.caption)}</p>`:''}</div>${flatMode?'':`<dl>${rows.map(([v,label])=>`<div><dt>${markHtml(label)}</dt><dd>${markHtml(v)}</dd></div>`).join('')}</dl>`}${current.editable&&item.id==='source'?`<form class="equipment-source-controls"><label>${markHtml('Effektivvärde U_{RMS}')} (V)<input name="U" type="number" min="${current.tab==='effekt'?12:1}" max="${current.tab==='impedans'?400:690}" step="0.1" value="${current.U}" required></label><label>Frekvens (Hz)${current.tab==='effekt'?`<select name="f"><option value="50"${current.f===50?' selected':''}>50</option><option value="60"${current.f===60?' selected':''}>60</option></select>`:`<input name="f" type="number" min="1" max="${current.tab==='impedans'?500:400}" step="1" value="${current.f}" required>`}</label><button class="primary" type="submit">Använd inställningarna</button></form>`:''}`;
  const form=$('.equipment-detail form');if(keep){const back=keep==='submit'?form?.querySelector('[type=submit]'):form?.elements[keep];back?.focus?.({preventScroll:true});}if(form)form.onsubmit=e=>{e.preventDefault();const U=Number(form.elements.U.value),f=Number(form.elements.f.value);adjustEquipment(current.tab==='sinus'?'urms':'U',U);adjustEquipment('f',f);};
 }
 function visibility(){for(const m of models.values())m.g.visible=Boolean(current?.instruments.find(i=>i.id===m.id))&&(!closeup||m.id===selected);}
 function select(id,zoom=true){selected=id;closeup=zoom;visibility();pressed();paintFlat();detail();frame();status();}
 function setView(v,user=false){const top=user?root.getBoundingClientRect().top:0;flatMode=failed||v==='flat';flat.hidden=!flatMode;if(renderer)renderer.domElement.hidden=flatMode;
  root.dataset.renderer=flatMode?'flat':renderer?.isCanvasRenderer?'canvas3d':'three';if(user){try{sessionStorage.setItem(VIEW_KEY,flatMode?'flat':'3d');}catch{}}
  pressed();paintFlat();detail();frame();status();
  // Bänken ska inte hoppa när bilden byter höjd.
  if(user){const d=root.getBoundingClientRect().top-top;if(Math.abs(d)>1)window.scrollBy?.(0,d);}}
 const unsubscribe=subscribeEquipment(data=>{
  const changed=!current||current.tab!==data.tab||current.taskId!==data.taskId;current=data;
  // Ny uppgift eller flik: börja alltid med närbild av uppgiftens instrument.
  if(changed||!data.instruments.some(i=>i.id===selected)){selected=data.focus;closeup=true;}
  base=data.tab==='effekt'?{source:-4.8,power:-.85,scope:4.5}:{source:-5.9,trms:-2.9,avg:-.3,load:-.1,scope:4.4};
  for(const m of models.values()){const i=data.instruments.find(i=>i.id===m.id);if(i){m.g.position.x=base[m.id]||0;m.g.position.y=0;if(m.id==='load'){m.g.userData.coil.visible=data.values.kind.includes('L');m.g.userData.capacitor.visible=data.values.kind.includes('C');}if(m.nameLabel){const t=i.name.toLocaleUpperCase('sv');if(m.nameLabel.text!==t)paintLabel(m.nameLabel,t,...m.nameLabel.colors);}drawScreen(m,i);}}
  visibility();
  // Uppgiftens instrument först, sedan de andra, sist hela bänken. Knapparna byggs bara om när instrumenten ändras.
  const order=[...data.instruments.filter(i=>i.id===data.focus),...data.instruments.filter(i=>i.id!==data.focus)],key=order.map(i=>i.id+':'+i.name).join('|');
  if(key!==choiceKey){choiceKey=key;$('.equipment-choices').innerHTML=order.map(i=>`<button type="button" data-instrument="${i.id}" aria-pressed="false">${markHtml(i.name)}</button>`).join('')+'<button type="button" data-action="overview" aria-pressed="false">Hela bänken</button>';}
  pressed();paintFlat();detail();frame();status();
 });
 root.addEventListener('click',e=>{const back=e.target.closest('.equipment-back a');if(back){const t=document.getElementById('guide-steg');if(t){e.preventDefault();t.scrollIntoView?.({block:'start'});t.focus?.({preventScroll:true});}return;}const instrument=e.target.closest('[data-instrument]');if(instrument){select(instrument.dataset.instrument,true);return;}const view3=e.target.closest('[data-view]');if(view3){if(!view3.disabled)setView(view3.dataset.view,true);return;}if(e.target.closest('[data-action=overview]'))select(selected,false);});
 if(failed)fallback();else setView(flatMode?'flat':'3d');
 observer=new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);});observer.observe(view);
 return{dispose(){unsubscribe();observer.disconnect();cancelAnimationFrame(raf);for(const t of textures)t.dispose();for(const m of materials)m.dispose();for(const g of geometries)g.dispose();renderer?.dispose();}};
}
