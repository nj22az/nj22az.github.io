// Station B i maskinrummet: elverkstadens växelströmsbänk (SELV) och landströmmens lastbank, med Erik som visar
// och Johansson som tittar på. Scenen visar bara läget och texterna den får; värdena kommer från session.mjs.
import * as THREE from '../../../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../character/build.js';
import {ENGINEER} from '../character/johansson.js';
import {ERIK} from '../character/erik.js';
import {buildRoom} from '../rum.mjs?v=20261003-erik';
import {createDemonstrator} from '../erik-visar.mjs?v=20261003-erik';

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const TOP=1.065; // bänkskivans ovansida

// Kameravinklar: från höger, längs bänken. Erik står till vänster om apparaten (bortom den), så han syns men skymmer inte.
export const SHOTS={
  bank:[[1.35,1.70,-0.35],[-0.15,1.1,-0.9]],
  kalibrator:[[0.58,1.65,-0.59],[-0.5,1.09,-0.96]],
  kalla:[[0.82,1.68,-0.66],[-0.22,1.12,-1.0]],
  scope:[[.46,1.5,-.3],[.12,1.16,-.99]],
  platta:[[0.95,1.73,-0.45],[-0.04,1.08,-0.74]],
  matare:[[.95,1.45,-.3],[.5,1.12,-.84]],
  last:[[2.05,1.3,-1.22],[2.3,.76,-1.8]],
};

function canvasDisplay(w,h,{bg='#c9d5b6',fg='#17240f',px=256}={}){
  const c=document.createElement('canvas');c.width=px;c.height=Math.round(px*h/w);const g=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));
  let last=null;
  mesh.userData.set=(lines,{size=.38}={})=>{const key=JSON.stringify(lines);if(key===last)return;last=key;
    g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle=fg;g.textAlign='right';g.textBaseline='middle';
    const rows=[].concat(lines),lh=c.height/rows.length;
    rows.forEach((t,i)=>{g.font=`700 ${Math.round(lh*(rows.length>1?.62:size*2))}px "Courier New",monospace`;g.fillText(String(t),c.width-10,lh*(i+.55),c.width-16);});
    tex.needsUpdate=true;};
  mesh.userData.canvas=c;mesh.userData.ctx=g;mesh.userData.tex=tex;
  return mesh;
}

export function mountStationB(container,{onFailure=()=>{}}={}){
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const canvas=renderer.domElement;container.append(canvas);canvas.tabIndex=0;canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label','Maskinrummets växelströmsbänk. Erik visar mätningen, Johansson står bredvid. Samma avläsningar står i listan bredvid bilden.');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#d9e3e8');scene.fog=new THREE.Fog('#d9e3e8',14,32);
  const camera=new THREE.PerspectiveCamera(44,1,.03,60);
  scene.add(new THREE.HemisphereLight('#ffffff','#647d89',2.1));
  const light=new THREE.DirectionalLight('#fff6df',2.4);light.position.set(-3,8,5);scene.add(light);
  const materials=new Map(),geometries=new Set(),textures=new Set();
  const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.65,metalness:.15}));return materials.get(c);};
  const add=(g,c,pos,parent=scene)=>{geometries.add(g);const m=new THREE.Mesh(g,mat(c));m.position.copy(V(...pos));parent.add(m);return m;};
  const box=(w,h,d,c,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),c,[x,y,z],parent);
  const cyl=(r,h,c,x,y,z,parent,seg=16)=>add(new THREE.CylinderGeometry(r,r,h,seg),c,[x,y,z],parent);
  function label(text,pos,width=1,colour='#163248',background='#f4f7f5'){
    const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,128);ctx.fillStyle=colour;ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64,480);
    const texture=new THREE.CanvasTexture(c);textures.add(texture);const material=new THREE.SpriteMaterial({map:texture});materials.set('label-'+materials.size,material);
    const s=new THREE.Sprite(material);s.position.copy(V(...pos));s.scale.set(width,width/4,1);scene.add(s);return s;
  }
  buildRoom({box,cyl,label});
  for(const child of scene.children)if(child.isSprite&&child.scale.x>1.4)child.visible=false;
  label('ELVERKSTAD · SELV ~',[0,1.95,-1.4],1.0);

  // ---------- bänken: uttag och kontaktpunkter som händer och sladdar går till ----------
  const P={};
  const jack=(name,x,y,z,c)=>{cyl(.007,.012,c,x,y,z).rotation.x=Math.PI/2;P[name]=V(x,y,z+.008);};
  // Kalibrator 10 V ~ (känd referens)
  box(.15,.06,.11,'#e3b232',-.5,TOP+.03,-0.97);box(.15,.012,.11,'#2b3a40',-.5,TOP+.066,-0.97);
  const calDisp=canvasDisplay(.1,.03);calDisp.rotation.x=-Math.PI/2;calDisp.position.set(-.5,TOP+.073,-0.99);scene.add(calDisp);
  jack('cal+',-.47,TOP+.03,-0.913,'#c54338');jack('cal−',-.53,TOP+.03,-0.913,'#232a30');label('KALIBRATOR',[-.5,TOP+.11,-0.97],.13);
  // SELV-växelspänningskälla
  box(.22,.11,.17,'#3f5a68',-.22,TOP+.055,-1.06);
  const srcDisp=canvasDisplay(.13,.04);srcDisp.position.set(-.24,TOP+.075,-0.974);scene.add(srcDisp);
  jack('src+',-.16,TOP+.028,-0.974,'#c54338');jack('src−',-.28,TOP+.028,-0.974,'#232a30');
  cyl(.014,.02,'#d5dde0',-.12,TOP+.075,-0.97).rotation.x=Math.PI/2;P.srcKnob=V(-.12,TOP+.075,-0.955);
  label('SELV ~ KÄLLA',[-.22,TOP+.15,-1.1],.13);
  // Oscilloskop
  box(.3,.17,.2,'#d3dadd',.16,TOP+.085,-1.06);box(.31,.18,.01,'#9aa7ad',.16,TOP+.085,-0.958);
  const screen=canvasDisplay(.17,.11,{bg:'#0e1b16',fg:'#7cf29b',px:340});screen.position.set(.12,TOP+.1,-0.952);scene.add(screen);
  for(let k=0;k<3;k++)cyl(.011,.012,'#4a565c',.25,TOP+.135-k*.04,-0.952).rotation.x=Math.PI/2;
  jack('scope',.28,TOP+.028,-0.952,'#26507a');P.scopeKnob=V(.25,TOP+.135,-0.94);label('OSCILLOSKOP',[.16,TOP+.2,-1.1],.13);
  // Komponentplatta: R (motstånd) och L (spole med järnkärna) i serie, uttagen A, B och C
  box(.32,.014,.15,'#ece6d6',-.05,TOP+.007,-.76);
  const res=cyl(.011,.075,'#d8c49a',-.11,TOP+.03,-.77);res.rotation.z=Math.PI/2;
  for(const [dx,c] of [[-.02,'#7a3b16'],[0,'#1c1c1c'],[.02,'#c54338']])cyl(.0115,.006,c,-.11+dx,TOP+.03,-.77).rotation.z=Math.PI/2;
  box(.05,.05,.04,'#5c6468',.045,TOP+.04,-.77);const coil=cyl(.022,.034,'#b5652b',.045,TOP+.04,-.87,undefined,24);coil.rotation.z=Math.PI/2;
  jack('A',-.18,TOP+.02,-.705,'#d5b663');jack('B',-.03,TOP+.02,-.705,'#d5b663');jack('C',.11,TOP+.02,-.705,'#d5b663');
  for(const [t,x] of [['A',-.18],['B',-.03],['C',.11]])label(t,[x,TOP+.055,-.69],.07);
  label('R',[-.11,TOP+.06,-.78],.045);label('L',[.045,TOP+.085,-.78],.045);
  // M1 (True RMS) och M2 (sinuskalibrerad, medelvärdesvisande)
  const meter=(name,x,colour)=>{
    const g=new THREE.Group();g.position.set(x,TOP,-.84);g.rotation.x=-.45;scene.add(g);
    box(.09,.17,.035,colour,0,.085,0,g);box(.07,.035,.004,'#2a3236',0,.15,.019,g);
    const d=canvasDisplay(.066,.03);d.position.set(0,.15,.0215);g.add(d);
    cyl(.016,.008,'#20282d',0,.1,.02,g).rotation.x=Math.PI/2;
    const jacks={};for(const [k,dx,c] of [['A',-.026,'#c54338'],['COM',0,'#232a30'],['V',.026,'#c54338']]){const j=cyl(.005,.01,c,dx,.03,.02,g);j.rotation.x=Math.PI/2;jacks[k]=j;}
    g.updateMatrixWorld(true);for(const [k,j] of Object.entries(jacks))P[`${name}.${k}`]=j.getWorldPosition(new THREE.Vector3()).add(V(0,0,.01));
    P[name]=V(x,TOP+.13,-.81);
    label(name==='M1'?'M1 · TRUE RMS':'M2 · SINUS',[x,TOP+.21,-.86],.1);
    return d;
  };
  const m1Disp=meter('M1',.42,'#e7b923'),m2Disp=meter('M2',.6,'#e08a2c');
  // ---------- landström vid kaj: uttag, effektanalysator och lastbank (bara Erik) ----------
  box(.14,.18,.08,'#2f62b5',1.78,1.05,-2.39);cyl(.035,.04,'#2f62b5',1.78,1.03,-2.33).rotation.x=Math.PI/2;P.socket=V(1.78,1.03,-2.31);
  label('LANDSTRÖM 230 V ~ 50 Hz',[1.78,1.3,-2.38],.62,'#ffffff','#2f62b5');
  box(.56,.62,.4,'#7c8b90',2.3,.39,-1.78);for(const x of [2.08,2.52])for(const z of [-1.62,-1.94])cyl(.04,.04,'#202a2f',x,.04,z).rotation.z=Math.PI/2;
  box(.5,.3,.006,'#5b686d',2.3,.42,-1.577);for(let k=0;k<8;k++)box(.4,.006,.008,'#3f4a4e',2.3,.3+k*.03,-1.572);
  const switches={};for(const [k,x] of [['R',2.16],['L',2.3],['till',2.44]]){const s=box(.03,.05,.03,k==='till'?'#c54338':'#20282d',x,.64,-1.575);switches[k]=s;P['lastbank.'+k]=V(x,.64,-1.56);}
  label('LASTBANK R / L',[2.3,.13,-1.56],.2);
  box(.22,.08,.15,'#d9b23a',2.3,.74,-1.8);const anaDisp=canvasDisplay(.18,.06,{px:300});anaDisp.rotation.x=-Math.PI/2+.45;anaDisp.position.set(2.3,.812,-1.77);scene.add(anaDisp);
  P.analysator=V(2.3,.79,-1.72);label('EFFEKTANALYSATOR',[2.3,.98,-1.9],.2);
  const cableMat=new THREE.MeshStandardMaterial({color:'#20282d',roughness:.6});materials.set('kabel',cableMat);
  const tube=(pts,r,matl)=>{const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,r,6,false);geometries.add(g);const m=new THREE.Mesh(g,matl);scene.add(m);return m;};
  const landKablar=[tube([P.socket,V(1.8,.6,-2.2),V(2.05,.75,-1.85),V(2.2,.76,-1.8)],.008,cableMat),tube([V(2.4,.76,-1.8),V(2.55,.7,-1.6),V(2.5,.55,-1.57)],.008,cableMat)];

  // ---------- personerna ----------
  const erik=buildAvatar(ERIK,{faceSize:256});scene.add(erik.root);
  const johansson=buildAvatar(ENGINEER,{faceSize:128});scene.add(johansson.root);
  johansson.root.position.set(-1.12,0,-.55);johansson.root.rotation.y=Math.atan2(.9,-.35);
  const HOME={at:[-.05,-.47],face:Math.PI};
  const demo=createDemonstrator(erik,HOME);
  // Erik håller mätspetsar när han kopplar.
  const probes={};for(const [side,c] of [['R','#c54338'],['L','#232a30']]){const g=new THREE.Group();scene.add(g);const h=cyl(.012,.09,c,0,0,0,g);h.rotation.x=Math.PI/2;h.position.z=.045;const tip=cyl(.004,.04,'#c6d1cd',0,0,.11,g);tip.rotation.x=Math.PI/2;g.visible=false;probes[side]=g;}

  // ---------- sladdar ----------
  const leadMats={r:new THREE.MeshStandardMaterial({color:'#c54338',roughness:.5}),s:new THREE.MeshStandardMaterial({color:'#232a30',roughness:.5}),b:new THREE.MeshStandardMaterial({color:'#26507a',roughness:.5})};
  for(const [k,v] of Object.entries(leadMats))materials.set('lead-'+k,v);
  const leadGroup=new THREE.Group();scene.add(leadGroup);
  function setLeads(list){
    for(const m of [...leadGroup.children]){m.geometry.dispose();leadGroup.remove(m);}
    for(const [a,b,c] of list){const A=P[a],Bp=P[b];if(!A||!Bp)continue;const mid=A.clone().add(Bp).multiplyScalar(.5);mid.y=Math.min(A.y,Bp.y)-.035;
      const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([A,mid,Bp]),24,.0035,5,false);leadGroup.add(new THREE.Mesh(g,leadMats[c]||leadMats.s));}
  }

  // ---------- displayerna ----------
  function drawScope(s){
    const {canvas:c,ctx:g,tex}=screen.userData,W=c.width,H=c.height;g.fillStyle='#0e1b16';g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(124,242,155,.18)';g.lineWidth=1;for(let i=1;i<10;i++){g.beginPath();g.moveTo(i*W/10,0);g.lineTo(i*W/10,H);g.stroke();}for(let j=1;j<8;j++){g.beginPath();g.moveTo(0,j*H/8);g.lineTo(W,j*H/8);g.stroke();}
    if(!s){g.fillStyle='#7cf29b';g.font='600 18px monospace';g.textAlign='center';g.fillText('väntar på mätning',W/2,H/2);tex.needsUpdate=true;return;}
    // 5 ms/ruta, 10 rutor; skalan väljs så att toppen hamnar på ungefär tre rutor
    const msDiv=5,vDiv=[2,5,10,20][[2,5,10,20].findIndex(v=>s.peak/v<=3.6)]??20,y0=H/2,px=t=>t/(10*msDiv)*W,py=u=>y0-u/vDiv*H/8;
    g.strokeStyle='#7cf29b';g.lineWidth=2;g.beginPath();for(let x=0;x<=W;x++){const t=x/W*10*msDiv/1000,u=s.peak*Math.sin(2*Math.PI*s.f*t);x?g.lineTo(x,py(u)):g.moveTo(x,py(u));}g.stroke();
    g.fillStyle='#d6f5df';g.font='600 13px monospace';g.textAlign='left';g.fillText(`CH1 ${vDiv} V/ruta  ${msDiv} ms/ruta`,6,15);
    g.strokeStyle='#f4c542';g.setLineDash([5,4]);g.lineWidth=1.5;g.textAlign='right';
    if(s.markor==='T'){const x1=px(0),x2=px(s.T);for(const x of [x1+1,x2]){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}g.fillStyle='#f4c542';g.fillText(`Δt = ${s.T.toLocaleString('sv-SE',{minimumFractionDigits:1,maximumFractionDigits:1})} ms`,W-6,H-8);}
    else{for(const y of [py(0),py(s.peak)]){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}g.fillStyle='#f4c542';g.fillText(`ΔU = ${s.peak.toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})} V`,W-6,H-8);}
    g.setLineDash([]);tex.needsUpdate=true;
  }
  let shown=null,visning={};
  function setDisplays(v,revealed){
    visning=v;shown=revealed;
    calDisp.userData.set(v.kalibrator||'');srcDisp.userData.set(v.kalla||'');
    const hid=['—'];
    m1Disp.userData.set(v.M1?(revealed?[v.M1[0],v.M1[1]]:[v.M1[0],'—']):hid);
    m2Disp.userData.set(v.M2?(revealed?[v.M2[0],v.M2[1]]:[v.M2[0],'—']):hid);
    drawScope(v.scope&&revealed?v.scope:null);
    anaDisp.userData.set(v.analysator?(revealed?[`U ${v.analysator.U}`,`I ${v.analysator.I}`,`P ${v.analysator.P}  PF ${v.analysator.PF}`]:[`U ${v.analysator.U}`,'I —','P —']):['—']);
    for(const k of ['R','L'])switches[k].material=mat(v.lastbank&&revealed&&v.lastbank.includes(k)?'#3b8a5a':'#20282d');
    render();
  }

  // ---------- kamera och ritning ----------
  let shot='bank',camPos=V(...SHOTS.bank[0]),camAt=V(...SHOTS.bank[1]),disposed=false,visible=true,frame=0,last=0;
  const bubble=document.createElement('div');bubble.className='erik-bubble';bubble.hidden=true;container.append(bubble);
  function setShot(name,now=false){if(!SHOTS[name])return;shot=name;if(now){camPos.set(...SHOTS[name][0]);camAt.set(...SHOTS[name][1]);render();}}
  function render(){
    if(disposed||!visible)return;const r=container.getBoundingClientRect();if(!r.width||!r.height)return;
    const pr=renderer.getPixelRatio();if(canvas.width!==Math.round(r.width*pr)||canvas.height!==Math.round(r.height*pr))renderer.setSize(r.width,r.height,false);
    camera.aspect=r.width/r.height;camera.updateProjectionMatrix();camera.position.copy(camPos);camera.lookAt(camAt);
    renderer.render(scene,camera);
  }
  function placeProbes(){
    const b=demo.beat;
    for(const side of ['R','L']){const target=demo.playing&&b?.[side]&&b.probe!==false?b[side]:null,g=probes[side];g.visible=Boolean(target);
      if(target){g.position.copy(demo.hand[side]);g.quaternion.setFromUnitVectors(V(0,0,1),target.clone().sub(demo.hand[side]).normalize());}}
  }
  function tick(time){
    if(disposed)return;const dt=Math.min((time-last)/1000||0,.05);last=time;
    const moving=demo.update(dt);
    const [p,a]=SHOTS[shot];const k=1-Math.exp(-dt*2.5);const before=camPos.distanceTo(V(...p))+camAt.distanceTo(V(...a));
    camPos.lerp(V(...p),k);camAt.lerp(V(...a),k);
    placeProbes();
    if(moving||before>.002)render();
    frame=requestAnimationFrame(tick);
  }
  const lost=e=>{e.preventDefault();visible=false;onFailure();};canvas.addEventListener('webglcontextlost',lost);
  const observer=new ResizeObserver(render);observer.observe(container);frame=requestAnimationFrame(tick);
  setDisplays({},false);

  return {
    points:P,shots:SHOTS,home:HOME,
    get demoPlaying(){return demo.playing;},
    setDisplays,setLeads,setShot,
    /** Spela Eriks takter. Takter med show:true visar avläsningen; connect lägger till sladdar. */
    play(beats,{onDone,onSay}={}){
      let leads=[];setLeads(leads);
      demo.play(beats,{onBeat(b){if(b.cam)setShot(b.cam);if(b.connect){leads=[...leads,...b.connect];setLeads(leads);}if(b.show)setDisplays(visning,true);
        bubble.hidden=!b.say;bubble.textContent=b.say?`Erik: ${b.say}`:'';onSay?.(b.say||'');},
        onDone(){bubble.hidden=true;onDone?.();}});
    },
    snap(){setShot(shot,true);},
    skip(){demo.finish();bubble.hidden=true;placeProbes();render();},
    goHome(){demo.goHome();bubble.hidden=true;},
    setVisible(v){visible=v;render();},
    inspect(){return {character:erik.recipe.name,student:johansson.recipe.name,erik:demo.position,handError:{...demo.error},shot,shown,drawCalls:renderer.info.render.calls};},
    screenPoint(name){render();const p=(P[name]||V(0,0,0)).clone().project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();erik.dispose();johansson.dispose();for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();for(const t of textures)t.dispose();renderer.dispose();canvas.remove();bubble.remove();},
  };
}
