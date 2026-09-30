import * as THREE from '../../johansson-town/vendor/three.module.js';
import {buildAvatar} from './character/build.js';
import {ENGINEER} from './character/johansson.js';

// Scene presentation never calculates an electrical reading. Contacts belong to session.mjs.
export const CONTACTS={P:[-.22,1.15,-.94],A:[-.08,1.15,-.94],B:[.08,1.15,-.94],N:[.22,1.15,-.94],'Ref+':[-.08,1.15,-.72],'Ref−':[.08,1.15,-.72]};
const V=p=>new THREE.Vector3(...p);
// CCD operates the original shoulder/elbow/hand skeleton; no replacement character or stretched limbs.
export function reach(avatar,side,target){
  const b=avatar.bones,hand=b['hand'+side],elbow=b['elbow'+side],shoulder=b['shoulder'+side];
  shoulder.quaternion.identity();elbow.quaternion.identity();hand.quaternion.identity();avatar.root.updateMatrixWorld(true);
  for(let i=0;i<18;i++)for(const joint of [elbow,shoulder]){
    avatar.root.updateMatrixWorld(true);
    const at=joint.getWorldPosition(new THREE.Vector3()),end=hand.getWorldPosition(new THREE.Vector3());
    const from=end.sub(at),to=target.clone().sub(at);
    if(from.lengthSq()<1e-10||to.lengthSq()<1e-10)continue;
    const delta=new THREE.Quaternion().setFromUnitVectors(from.normalize(),to.normalize());
    const world=joint.getWorldQuaternion(new THREE.Quaternion());
    const parent=joint.parent.getWorldQuaternion(new THREE.Quaternion());
    joint.quaternion.copy(parent.invert().multiply(delta.multiply(world))).normalize();
  }
  avatar.root.updateMatrixWorld(true);
  return hand.getWorldPosition(new THREE.Vector3()).distanceTo(target);
}
export function mountRoom(container,{onPick=()=>{},onFailure=()=>{}}={}){
  const renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=false;
  const canvas=renderer.domElement;container.append(canvas);canvas.tabIndex=0;canvas.setAttribute('role','application');
  canvas.setAttribute('aria-label','Maskinrum. WASD eller piltangenter går i översiktsvyn. Vid bänken: välj hand och tryck på en märkt mätpunkt. Samma kontroller finns i formuläret.');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#d9e3e8');scene.fog=new THREE.Fog('#d9e3e8',14,32);
  const camera=new THREE.PerspectiveCamera(42,1,.05,60);
  scene.add(new THREE.HemisphereLight('#ffffff','#647d89',2.1));
  const light=new THREE.DirectionalLight('#fff6df',2.4);light.position.set(-3,8,5);scene.add(light);
  const materials=new Map(),geometries=new Set(),textures=new Set();
  const mat=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.7,metalness:.15}));return materials.get(c);};
  const add=(g,c,pos,parent=scene)=>{geometries.add(g);const m=new THREE.Mesh(g,mat(c));m.position.copy(V(pos));parent.add(m);return m;};
  const box=(w,h,d,c,x,y,z,parent)=>add(new THREE.BoxGeometry(w,h,d),c,[x,y,z],parent);
  const cyl=(r,h,c,x,y,z,parent)=>add(new THREE.CylinderGeometry(r,r,h,16),c,[x,y,z],parent);
  function label(text,pos,width=1,colour='#163248',background='#f4f7f5'){
    const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,128);ctx.fillStyle=colour;ctx.font='bold 38px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64,480);
    const texture=new THREE.CanvasTexture(c);textures.add(texture);const material=new THREE.SpriteMaterial({map:texture});materials.set('label-'+materials.size,material);
    const s=new THREE.Sprite(material);s.position.copy(V(pos));s.scale.set(width,width/4,1);scene.add(s);return s;
  }
  box(9,.12,8,'#94a6ab',0,-.06,0);box(9,3.8,.12,'#b9cbce',0,1.9,-4);box(.12,3.8,8,'#a9bec3',-4.5,1.9,0);
  for(let i=-4;i<=4;i++)box(.035,.012,8,'#7f959b',i,.008,0);
  for(let z=-3;z<=3;z+=1.5)box(9,.012,.025,'#7f959b',0,.009,z);
  // Green gangway and guarded machinery: walking collisions match the equipment footprints.
  box(1.4,.014,6.8,'#779b94',0,.015,0);for(const x of [-.77,.77])box(.04,.018,6.8,'#edd47b',x,.017,0);
  for(let z=-3.5;z<=3.5;z+=1.75)box(.12,.16,8,'#7c949d',z,3.5,0);
  for(const x of [-3.3,3.3]){const pipe=cyl(.09,7.5,'#b76355',x,2.95,0);pipe.rotation.x=Math.PI/2;}
  for(const z of [-2.7,0,2.7]){box(2.3,.04,.25,'#e9efdd',0,3.25,z);box(2.4,.08,.3,'#677a81',0,3.31,z);}
  const colliders=[[-3.9,-1.5,-2.7,1.4],[1.5,3.9,-3.45,-2.1],[1.9,3.8,.1,2.0],[-.72,.72,-1.38,-.63]];
  // Port generator set.
  box(2.1,.28,3.4,'#51636a',-2.7,.18,-.65);box(1.55,1.15,2.45,'#477d78',-2.7,.9,-.5);
  for(let z=-1.4;z<=.6;z+=.4){box(1.62,.07,.07,'#305855',-2.7,1.35,z);cyl(.13,.16,'#aab7b4',-2.7,1.57,z);}
  const alternator=cyl(.6,1.05,'#477d78',-2.7,.86,1);alternator.rotation.x=Math.PI/2;
  for(let x=-3.4;x<-2;x+=.18)box(.04,.5,.02,'#273f46',x,.9,1.55);
  box(.12,.8,.08,'#c7ab53',-1.5,.45,.6);box(2.6,.07,.07,'#c7ab53',-2.7,.85,.6);label('GENERATOR',[ -2.7,2,-.1],1.8);
  // Starboard distribution board and motor/pump.
  for(let x=1.7;x<=3.8;x+=.7){box(.65,2.2,.7,'#bdc7c8',x,1.12,-2.8);box(.54,1.8,.035,'#d7e1dd',x,1.19,-2.43);box(.14,.14,.025,'#253e49',x,1.75,-2.4);cyl(.045,.03,'#b64c40',x,1.38,-2.4).rotation.x=Math.PI/2;box(.025,.32,.03,'#677c83',x+.2,1.2,-2.38);}
  label('DISTRIBUTION',[2.7,2.55,-2.45],2);
  box(1.6,.16,1.55,'#5d6e72',2.8,.12,1);const pump=cyl(.4,.85,'#577b98',2.8,.65,1);pump.rotation.z=Math.PI/2;
  box(.6,.25,.5,'#829ea9',2.8,1.05,1);const out=cyl(.12,1.4,'#6c998c',3.4,1.1,1);box(.7,.15,.15,'#6c998c',3.1,1.8,1);label('PUMP & MOTOR',[2.8,2.1,1],1.8);
  label('ELVERKSTAD · SELV',[0,2,-1.4],2);label('MASKINRUM',[0,2.8,-3.9],2.6);
  // Bench surface, safe DC components and marked physical sockets.
  box(1.4,.09,.75,'#d4c5a7',0,1.02,-1);for(const x of [-.56,.56])box(.08,1,.08,'#5e7780',x,.5,-1);
  box(.64,.055,.43,'#edf2e8',0,1.095,-.87);
  box(.11,.045,.045,'#b79766',0,1.12,-.94);box(.10,.045,.045,'#b79766',.15,1.12,-.94);
  const contactMeshes=[];
  for(const [name,pos] of Object.entries(CONTACTS)){
    const socket=cyl(.022,.035,'#d5b663',...pos);socket.userData.contact=name;contactMeshes.push(socket);
    const ring=cyl(.047,.005,'#064f91',pos[0],pos[1]-.018,pos[2]);ring.userData.contact=name;contactMeshes.push(ring);
    const hit=add(new THREE.SphereGeometry(.048,8,6),'#064f91',[...pos]);hit.material=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});materials.set('hit-'+name,hit.material);hit.userData.contact=name;contactMeshes.push(hit);
    label(name,[pos[0],1.24,pos[2]-.035],.22);
  }
  label('R1 · 1 kΩ',[0,1.08,-1.29],.6);label('R2 · 2 kΩ',[.42,1.08,-1.05],.5);
  box(.20,.23,.11,'#e9bf45',-.48,1.19,-1.04);box(.14,.09,.008,'#dce5be',-.48,1.24,-.979);label('V Ω',[-.48,1.43,-1.04],.35);
  const supply=box(.22,.15,.17,'#365867',.48,1.14,-1.16);label('12 V DC',[.48,1.35,-1.16],.5);
  const linkMesh=box(.11,.01,.012,'#66848c',-.15,1.19,-.94);
  const avatar=buildAvatar(ENGINEER,{faceSize:256});scene.add(avatar.root);
  // Earmuffs are attached to the existing head bone, move with the actual avatar.
  const head=avatar.bones.head,m=avatar.measure;
  for(const x of [-1,1]){const muff=add(new THREE.SphereGeometry(.07,12,8),'#263c45',[x*m.Rh*m.headSX*.98,m.Rh*.87,0],head);muff.scale.set(.45,1,.8);}
  const headband=add(new THREE.TorusGeometry(m.Rh*1.02,.015,5,16,Math.PI),'#263c45',[0,m.Rh*.82,0],head);
  headband.rotation.z=0;
  const probeObjects={},leads={};
  for(const [side,c] of [['L','#242c32'],['R','#c54338']]){
    const group=new THREE.Group();scene.add(group);const handle=cyl(.018,.14,c,0,0,0,group);handle.rotation.x=Math.PI/2;handle.position.z=.07;const tip=cyl(.006,.06,'#c6d1cd',0,0,.17,group);tip.rotation.x=Math.PI/2;probeObjects[side]=group;
    const geometry=new THREE.BufferGeometry();geometries.add(geometry);const material=new THREE.LineBasicMaterial({color:c});materials.set('lead-'+side,material);const line=new THREE.Line(geometry,material);scene.add(line);leads[side]=line;
  }
  let view='bench',alternate=false,active='black',state={},disposed=false,frame=0,visible=true,moving=false;
  let contactsErrors={},walkPhase=0,lastTime=0;
  const pressed=new Set(),keys=new Map([['KeyW','forward'],['ArrowUp','forward'],['KeyS','back'],['ArrowDown','back'],['KeyA','left'],['ArrowLeft','left'],['KeyD','right'],['ArrowRight','right']]);
  function pose(){
    if(view!=='bench')return;
    const red=CONTACTS[state.red],black=CONTACTS[state.black];
    const centre=(red&&black)?(red[0]+black[0])/2:(red||black||[0])[0];
    avatar.root.position.set(centre,0,-.45);avatar.root.rotation.y=Math.PI;avatar.root.updateMatrixWorld(true);
    for(const [side,node,rest] of [['L',black,[-.22,1.13,-.58]],['R',red,[.22,1.13,-.58]]]){
      const tip=V(node||rest);const shoulder=avatar.bones['shoulder'+side].getWorldPosition(new THREE.Vector3());
      const target=tip.clone().add(shoulder.clone().sub(tip).normalize().multiplyScalar(.2));
      const error=reach(avatar,side,target);contactsErrors[side]=error;
      const hand=avatar.bones['hand'+side].getWorldPosition(new THREE.Vector3());
      const group=probeObjects[side];group.visible=true;group.position.copy(hand);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),tip.clone().sub(hand).normalize());
      const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.48,1.15,-.95),new THREE.Vector3(-.53,.89,-.56),new THREE.Vector3(hand.x,.94,-.41),hand]);
      leads[side].geometry.setFromPoints(curve.getPoints(24));leads[side].visible=true;
    }
  }
  function setState(s){state=s;pose();linkMesh.rotation.y=state.link?0:-.65;supply.material=mat(state.power?'#3b806f':'#365867');render();}
  function setView(value){view=value;pressed.clear();if(view==='bench'){avatar.bones.thighL.rotation.set(0,0,0);avatar.bones.thighR.rotation.set(0,0,0);pose();}else{avatar.root.position.set(0,0,1.25);avatar.root.rotation.y=Math.PI;for(const key of ['shoulderL','shoulderR','elbowL','elbowR','handL','handR'])avatar.bones[key].quaternion.identity();for(const key of ['L','R']){probeObjects[key].visible=false;leads[key].visible=false;}}render();}
  function move(dt){
    let x=(pressed.has('right')?1:0)-(pressed.has('left')?1:0),z=(pressed.has('back')?1:0)-(pressed.has('forward')?1:0);moving=Boolean(x||z);
    if(!moving){avatar.bones.thighL.rotation.x=0;avatar.bones.thighR.rotation.x=0;return;}
    const len=Math.hypot(x,z);x=x/len*dt*1.3;z=z/len*dt*1.3;
    const blocked=(nx,nz)=>Math.abs(nx)>4.15||Math.abs(nz)>3.65||colliders.some(([a,b,c,d])=>nx>a-.22&&nx<b+.22&&nz>c-.22&&nz<d+.22);
    const p=avatar.root.position;if(!blocked(p.x+x,p.z))p.x+=x;if(!blocked(p.x,p.z+z))p.z+=z;
    avatar.root.rotation.y=Math.atan2(x,z);walkPhase+=dt*8;avatar.bones.thighL.rotation.x=Math.sin(walkPhase)*.22;avatar.bones.thighR.rotation.x=-Math.sin(walkPhase)*.22;
  }
  function render(){
    if(disposed||!visible)return;
    const rect=container.getBoundingClientRect();if(!rect.width||!rect.height)return;
    if(canvas.width!==Math.round(rect.width*renderer.getPixelRatio())||canvas.height!==Math.round(rect.height*renderer.getPixelRatio()))renderer.setSize(rect.width,rect.height,false);
    camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();
    if(view==='bench'){camera.position.set(alternate?1.65:-1.65,2.5,alternate?1.05:-2.35);camera.lookAt(0,1.1,-.7);}
    else{camera.position.set(7.2,6.1,8.2);camera.lookAt(0,1,-.5);}
    for(const child of scene.children)if(child.isSprite&&child.scale.x>1.4)child.visible=view==='overview';
    renderer.render(scene,camera);
  }
  function animate(time){if(disposed)return;const dt=Math.min((time-lastTime)/1000||0,.04);lastTime=time;if(view==='overview'&&visible&&(pressed.size||moving)){move(dt);render();}frame=requestAnimationFrame(animate);}
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  const pointerDown=e=>{down=[e.clientX,e.clientY];canvas.focus();};
  const pointerUp=e=>{if(view!=='bench'||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>12)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(contactMeshes)[0];if(hit)onPick(active,hit.object.userData.contact);down=null;};
  const keyDown=e=>{if(view!=='overview'||!keys.has(e.code))return;e.preventDefault();pressed.add(keys.get(e.code));};
  const keyUp=e=>{if(keys.has(e.code))pressed.delete(keys.get(e.code));};
  const blur=()=>pressed.clear();const visibility=()=>{visible=!document.hidden;pressed.clear();};
  const lost=e=>{e.preventDefault();visible=false;onFailure();};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('keydown',keyDown);canvas.addEventListener('keyup',keyUp);canvas.addEventListener('blur',blur);canvas.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visibility);
  const observer=new ResizeObserver(render);observer.observe(container);setView('bench');frame=requestAnimationFrame(animate);
  return {
    setState,setView,setActive(value){active=value;},setAlternate(value){alternate=value;render();},setVisible(value){visible=value;pressed.clear();render();},
    move(direction,on){if(view!=='overview')return;on?pressed.add(direction):pressed.delete(direction);},
    inspect(){return {view,character:avatar.recipe.name,position:avatar.root.position.toArray(),handError:{...contactsErrors},drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,contacts:Object.keys(CONTACTS)};},
    contactScreen(name){render();const p=V(CONTACTS[name]).project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);avatar.dispose();for(const g of geometries)g.dispose();for(const m of materials.values())m.dispose();for(const t of textures)t.dispose();renderer.dispose();canvas.remove();},
  };
}
