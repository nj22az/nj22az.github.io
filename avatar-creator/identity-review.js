import * as T from '../johansson-town/vendor/three.module.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {recipeFor} from '../johansson-town/src/avatars/cast.js';
import {createAvatarAnimator} from '../johansson-town/src/avatars/animate.js';
import {fitAvatarHeldProp} from '../johansson-town/src/avatars/consume.js';
import {seeded} from '../johansson-town/src/avatars/recipe.js';

const $=id=>document.getElementById(id),status=$('status');
let renderer,subjects=[],playing=false,frame=0,last=0;
const scene=new T.Scene();scene.background=new T.Color('#eee8dc');
scene.add(new T.HemisphereLight(0xffffff,0x8b8d83,2.2));
const key=new T.DirectionalLight(0xffffff,2.5);key.position.set(-3,5,6);scene.add(key);
const fill=new T.DirectionalLight(0xffffff,.6);fill.position.set(4,3,-4);scene.add(fill);
const camera=new T.OrthographicCamera(-.65,.65,.85,-.85,.05,20);
const baseline=!!new URLSearchParams(location.search).get('baseline');
function dispose(){for(const s of subjects){scene.remove(s.group);s.avatar.dispose();s.tea.geometry.dispose();s.tea.material.dispose();s.seat.geometry.dispose();s.seat.material.dispose();}subjects=[];}
function build(){
 dispose();const recipe=recipeFor($('person').value);
 for(let i=0;i<2;i++){
  const avatar=buildAvatar(recipe,{shadows:false,faceSize:512,...(i&&!baseline?{renderStyle:'island-storybook-v1'}:{})});
  const group=new T.Group();group.add(avatar.root);scene.add(group);avatar.root.rotation.y=0;
  // The same simple ceramic tea cup on each side: original review geometry, no imported art.
  const tea=new T.Mesh(new T.CylinderGeometry(.034,.026,.075,24),new T.MeshToonMaterial({color:0xc5d7c4}));tea.geometry.translate(0,.0375,0);tea.userData={grip:{radius:.034,height:.04},rimHeight:.075,portion:1};avatar.bones.handR.add(tea);
  const seat=new T.Mesh(new T.BoxGeometry(.5,.04,.38),new T.MeshToonMaterial({color:0xa98b65}));seat.position.set(0,.43,0);group.add(seat);
  subjects.push({avatar,group,tea,seat,rest:Object.fromEntries(Object.entries(avatar.bones).map(([name,b])=>[name,{position:b.position.clone(),quaternion:b.quaternion.clone(),scale:b.scale.clone()}]))});
 }
 return renderAt(0);
}
// Recreate animators and replay fixed steps: seeking does not depend on earlier frames.
function renderAt(seconds=0){
 const action=$('action').value,view=$('view').value,body=view==='body'||['walk','sit','hold','sip'].includes(action);
 for(const s of subjects){
  const {avatar,tea,seat}=s;avatar.root.position.set(0,0,0);avatar.root.rotation.y=0;
  for(const [name,b] of Object.entries(avatar.bones)){b.position.copy(s.rest[name].position);b.quaternion.copy(s.rest[name].quaternion);b.scale.copy(s.rest[name].scale);}
  const previousRandom=Math.random;Math.random=seeded('identity-review');
  try{
  const anim=createAvatarAnimator(avatar,{random:seeded('identity-review'),initialTime:0});
  const n=90+Math.round(seconds*30);
  for(let f=0;f<n;f++)anim.update(1/30,{speed:action==='walk'?.7:0,seated:action==='sit',seatHeight:.45,seatFront:.19,pose:['hold','sip'].includes(action)?'DrinkStanding':null,consumeElapsed:action==='hold'?0:action==='sip'?(f<90?0:((f-89)/30)%2.4):undefined,heldProp:['hold','sip'].includes(action)?tea:null});
  avatar.paintFace({expression:action==='smile'?'happy':action==='surprise'?'surprised':'neutral',blink:0,talk:0,look:[0,0]});
  tea.visible=['hold','sip'].includes(action);seat.visible=action==='sit';
  if(tea.visible)fitAvatarHeldProp(avatar,tea,action==='sip'?anim.consumption?.lift??0:0);
  }finally{Math.random=previousRandom;}
 }
 const base=subjects[0].avatar.measure;
 const half=body?1.18:.48,cy=body?1.0:base.headCentre;
 camera.left=-half;camera.right=half;camera.top=half*.88;camera.bottom=-half*.88;
 const angle=view==='profile'?Math.PI/2:view==='quarter'?.65:0;
 camera.position.set(Math.sin(angle)*5,cy,Math.cos(angle)*5);camera.lookAt(0,cy,0);camera.updateProjectionMatrix();
 renderer.setScissorTest(true);
 for(let i=0;i<2;i++){
  subjects.forEach((s,j)=>s.group.visible=i===j);
  renderer.setViewport(i*640,0,640,564);renderer.setScissor(i*640,0,640,564);renderer.render(scene,camera);
 }
 subjects.forEach(s=>s.group.visible=true);renderer.setScissorTest(false);
 return {person:$('person').value,action,view,seconds,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,heights:subjects.map(s=>s.avatar.measure.H)};
}
function refresh(){try{const data=renderAt(+$('time').value);status.textContent=`${$('person').selectedOptions[0].text} · ${$('action').selectedOptions[0].text} · ${data.seconds.toFixed(2)} s`;return data;}catch(e){fail(e);}}
function fail(e){playing=false;status.textContent='Character renderer could not start. Reload this page to retry. '+e.message;status.setAttribute('role','alert');console.error(e);}
try{
 renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1280,564,false);renderer.outputColorSpace=T.SRGBColorSpace;$('stage').append(renderer.domElement);
 build();refresh();
 for(const id of ['view','action','time'])$(id).addEventListener('input',refresh);
 $('person').addEventListener('change',()=>{build();refresh();});
 $('play').onclick=()=>{playing=!playing;$('play').setAttribute('aria-pressed',String(playing));$('play').textContent=playing?'Pause sequence':'Play sequence';last=performance.now();if(playing)requestAnimationFrame(tick);};
 function tick(now){if(!playing)return;frame=(frame+(now-last)/1000)%4;last=now;$('time').value=frame;refresh();requestAnimationFrame(tick);}
 window.identityReview={capture({person='Johansson',view='front',action='neutral',time=0}={}){playing=false;const changed=$('person').value!==person;$('person').value=person;$('view').value=view;$('action').value=action;$('time').value=time;if(changed)build();return refresh();},get subjects(){return subjects;},renderAt};
}catch(e){fail(e);}
