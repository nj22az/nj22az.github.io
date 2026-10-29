/**
 * Minato: World's own places and residents in front of Pocket Camera. The owner (29 October 2026) asked for Johansson
 * Studio to be "reworked into the Johansson Office Camera or at least what's useful", easy to use in a browser, and chose
 * for the camera to take Studio's free camera: shoot in World's real places with residents you pose, in any Look.
 *
 * Nothing here is a copy. The places are built by World's own builder (johansson-town/src/scene/scene-world.js, the one
 * Studio and the comics use), seen from the angles the storyteller's backdrops were photographed from
 * (assets/images/feed/views.json). The residents are World's own (avatars/build.js, cast.js), posed and given their
 * faces by Studio's code (scene-avatar.js, scene-face.js), and a Moment is Studio's (scene-moments.mjs): a small
 * situation with a reason, its poses, faces, lines and caption. The set draws into its own canvas; the camera's Look
 * engine reads that canvas as it reads the camera, so every Look, mix, sticker and frame works on it unchanged.
 */
import * as THREE from '../johansson-town/vendor/three.module.js';
import {buildSceneWorld} from '../johansson-town/src/scene/scene-world.js';
import {buildAvatar} from '../johansson-town/src/avatars/build.js';
import {recipeFor,RESIDENT_NAMES} from '../johansson-town/src/avatars/cast.js';
import {loadHatModels} from '../johansson-town/src/catalog/hat-models.js';
import {loadPixarBodies} from '../johansson-town/src/avatars/pixar.js';
import {poseSceneAvatar,placeSceneAvatar} from '../avatar-creator/scene-avatar.js';
import {createSceneFacePainter} from '../avatar-creator/scene-face.js';
import {POSE_GROUPS,EXPRESSION_GROUPS,seatedPose,poseLabel,expressionLabel} from '../avatar-creator/scene-catalogue.mjs';
import {pickMoment,applyMoment,aim,fitGroup,arrange} from '../avatar-creator/scene-moments.mjs';
import {turnToward,nearestSeat} from '../avatar-creator/scene-controls.mjs';

export {RESIDENT_NAMES,poseLabel,expressionLabel,seatedPose};
/** The places, each with the backdrop the storyteller already photographed there (its tile in the place sheet). */
export const PLACES=Object.freeze([
 ['sakura','Sakura Shōten'],['sakura-street','Outside Sakura'],['minato','Minato Izakaya'],['sato-ramen','Sato Ramen'],
 ['books','Front-Row Books'],['onsen','Umi-no-yu lobby'],['dock-workshop','Chin & Tetsuo Repairs'],['town-hall','Community kitchen'],
 ['harbour','Harbour'],['pier','Outer pier'],['park','Harbour Park'],['garden','Japanese garden'],['rainflower','Rainflower Lane'],
].map(([id,label])=>Object.freeze({id,label,backdrop:new URL(`../johansson-town/assets/images/feed/${id}.webp`,import.meta.url).href})));
/** The angles a place was photographed from, in the names a photographer would use. */
export const ANGLES=Object.freeze({wide:'Wide',push:'Close',low:'Low',high:'High'});
export const MAX_CAST=4;
// Moves that need a partner, a prop or a desk the camera does not stage: lifted by someone, a beer in hand, a school desk.
const STAGED_ELSEWHERE=new Set(['LiftedBack','HoldBack','SitBeer','SchoolRest']);
export const POSES=Object.freeze(POSE_GROUPS.map(g=>({...g,items:g.items.filter(i=>!STAGED_ELSEWHERE.has(i.name))})).filter(g=>g.items.length));
export const FACES=EXPRESSION_GROUPS;
const DEG=Math.PI/180,clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const VIEWS_URL=new URL('../johansson-town/assets/images/feed/views.json',import.meta.url);

export function createMinato(){
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const canvas=renderer.domElement;
 let views=null,world=null,placeId='',townData=null,building=null,angle='wide',base=null,serial=0,lastMoment='',lost=false;
 const view={orbit:0,tilt:0,zoom:1},actors=[],avatars=new Map(),heads=new Map(),portraits=new Map();
 // Everything World draws with must be in hand before the first person is: the catalogue's hats, Thuan's Pixar body.
 const ready=Promise.all([loadHatModels().catch(()=>{}),loadPixarBodies().catch(()=>{}),
  fetch(VIEWS_URL).then(r=>{if(!r.ok)throw Error('Places unavailable');return r.json();}).then(v=>{views=v;})]);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;});
 canvas.addEventListener('webglcontextrestored',()=>{lost=false;});

 const origin=()=>world.origin;
 function preset(name=angle){
  const v=views?.[placeId]?.[name]?.camera;
  return name==='wide'||!v?base:{position:v.position,quaternion:v.quaternion,fov:v.fov||base.fov};
 }
 function angles(){return world?Object.keys(ANGLES).filter(k=>k==='wide'||views?.[placeId]?.[k]?.camera):[];}

 /** Builds a place (once per visit) and stages the cast in it. */
 async function open(id){
  if(!PLACES.some(p=>p.id===id))id='sakura';
  if(world&&placeId===id)return;
  building=(async()=>{
   await ready;
   // World's builder adds the town's own views for a few rooms itself; it is given a copy so the feed's stay as they are.
   const next=await buildSceneWorld(id,{...views},townData);
   for(const e of avatars.values())e.avatar.root.removeFromParent();
   townData=next.townData||townData;world?.dispose();world=next;placeId=id;renderer.renderLists.dispose();
   const c=world.camera;base={position:c.position.toArray(),quaternion:c.quaternion.toArray(),fov:c.fov};
   angle='wide';resetView();
   // Everyone comes along, stood afresh in the new place.
   const cast=actors.splice(0);for(const a of cast){a.seat='';if(seatedPose(a.pose))a.pose='Idle';actors.push(a);standNew(a);}
  })();
  try{await building;}finally{building=null;}
 }

 // ---- The camera: the angle's own position, then orbited round what it looks at, never through a wall ----
 function frameCamera(aspect){
  const cam=world.camera,p=preset();
  cam.position.fromArray(p.position);cam.quaternion.fromArray(p.quaternion);
  // A tall picture keeps the angle's width of view, within reason: its height of view grows with it.
  const vertical=p.fov||55,across=2*Math.atan(Math.tan(vertical*DEG/2)*4/3);
  cam.fov=aspect<1?Math.min(78,2*Math.atan(Math.tan(across/2)/aspect)/DEG*.72):vertical;
  cam.aspect=aspect;cam.updateProjectionMatrix();cam.updateMatrixWorld(true);
  if(!view.orbit&&!view.tilt&&view.zoom===1)return;
  const forward=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion),o=new THREE.Vector3(...origin());
  const target=cam.position.clone().addScaledVector(forward,Math.max(1.5,o.sub(cam.position).dot(forward)));
  const s=new THREE.Spherical().setFromVector3(cam.position.clone().sub(target));
  s.theta+=view.orbit*DEG;s.phi=clamp(s.phi-view.tilt*DEG,.25,Math.PI*.56);s.radius*=view.zoom;
  cam.position.copy(target).add(new THREE.Vector3().setFromSpherical(s));cam.lookAt(target);
  const away=cam.position.clone().sub(target),length=away.length(),ray=new THREE.Raycaster(target,away.normalize(),.15,length);
  const hit=ray.intersectObjects(world.meshes,false).find(h=>h.object.visible&&h.object.material?.depthWrite!==false);
  if(hit)cam.position.copy(target).addScaledVector(away,Math.max(.3,hit.distance-.15));
  cam.updateMatrixWorld(true);
 }
 function resetView(){view.orbit=0;view.tilt=0;view.zoom=1;}
 /** Where the camera stands, from the place's origin, on the ground: what Studio's moments arrange a group across. */
 function cameraFrom(){const c=world.camera.position,o=origin();return {x:c.x-o[0],z:c.z-o[2]};}

 // ---- Who is where ----
 const at=a=>({x:origin()[0]+a.x,z:origin()[2]+a.z});
 /** Feet and head both on the picture, the head not behind anything solid. */
 function onPicture(x,z,size=1){
  const y=world.floor(x,z);if(!Number.isFinite(y))return false;
  const v=new THREE.Vector3(),cam=world.camera,inside=(p,m)=>p.z>-1&&p.z<1&&Math.abs(p.x)<m&&Math.abs(p.y)<m;
  return inside(v.set(x,y,z).project(cam),.9)&&inside(v.set(x,y+1.45*size,z).project(cam),.88)&&world.seen(x,y+1.45*size,z);
 }
 /** Open, level floor at (x, z) from the origin: no wall or counter, nobody else, inside the place's square. */
 function openFloor(actor){const free=world.free(actor,actors);return (x,z)=>free(origin()[0]+x,origin()[2]+z);}
 function standNew(actor){
  const cam=cameraFrom(),i=actors.indexOf(actor),spot=arrange(actors.length,'face',cam)[i],free=openFloor(actor);
  const seen=(x,z)=>free(x,z)&&onPicture(origin()[0]+x,origin()[2]+z,actor.size);
  frameCamera(4/3);
  const shift=fitGroup([spot],seen,{reach:4,step:.25})||fitGroup([spot],free,{reach:5,step:.3});
  if(shift){actor.x=spot.x+shift.dx;actor.z=spot.z+shift.dz;}else world.settle(actors);
  actor.turn=turnToward({x:actor.x,z:actor.z},cam);
 }
 function add(name){
  if(!world||actors.length>=MAX_CAST||!RESIDENT_NAMES.includes(name))return null;
  const actor={id:`m${++serial}`,name,recipe:recipeFor(name),x:0,z:0,size:1,y:0,liftedBy:'',seat:'',turn:0,pose:'Idle',expression:'smile',speech:''};
  actors.push(actor);standNew(actor);return actor;
 }
 function remove(id){
  const i=actors.findIndex(a=>a.id===id);if(i<0)return;
  actors.splice(i,1);const e=avatars.get(id);if(e){clearAvatar(e);avatars.delete(id);}heads.delete(id);
 }
 const actor=id=>actors.find(a=>a.id===id);
 /** Free seats within reach of a resident (a sitting pose needs one: nobody sits on air). */
 function seatFor(a){
  const taken=new Set(actors.filter(o=>o!==a&&o.seat).map(o=>o.seat));
  return nearestSeat(world.seats,at(a),taken,3)||null;
 }
 function setPose(id,pose){
  const a=actor(id);if(!a)return false;
  if(seatedPose(pose)){
   const seat=a.seat?world.seats.find(s=>s.id===a.seat):seatFor(a);if(!seat)return false;
   world.put(a,{x:seat.position[0],z:seat.position[2],seat:seat.id});a.turn=seat.turn;
  }else if(a.seat){
   const seat=world.seats.find(s=>s.id===a.seat);if(seat?.stand){a.x=seat.stand[0]-origin()[0];a.z=seat.stand[2]-origin()[2];}a.seat='';
  }
  a.pose=pose;return true;
 }
 function setFace(id,expression){const a=actor(id);if(a)a.expression=expression;}
 /** Turn a resident towards the camera, or by `degrees`. */
 function turn(id,degrees=null){const a=actor(id);if(!a||a.seat)return;a.turn=degrees==null?turnToward({x:a.x,z:a.z},cameraFrom()):((a.turn+degrees+540)%360)-180;}

 // ---- Picking and moving on the picture: (nx, ny) from the picture's top left, 0 to 1 ----
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 function aimRay(nx,ny){ndc.set(nx*2-1,1-ny*2);ray.setFromCamera(ndc,world.camera);return ray;}
 function pick(nx,ny){
  if(!world||!actors.length)return null;
  aimRay(nx,ny);let best=null;
  for(const a of actors){const e=avatars.get(a.id);if(!e)continue;const hit=ray.intersectObject(e.avatar.root,true)[0];if(hit&&(!best||hit.distance<best.distance))best={id:a.id,distance:hit.distance};}
  return best?.id||null;
 }
 /** Walks a resident towards the floor under the pointer, sliding along whatever stops them. */
 function moveTo(id,nx,ny){
  const a=actor(id);if(!a)return;
  const p=world.place(a),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-p.y),point=new THREE.Vector3();
  if(!aimRay(nx,ny).ray.intersectPlane(plane,point))return;
  if(a.seat||seatedPose(a.pose))a.pose='Idle';
  world.move(a,point.x,point.z,actors);
 }

 // ---- Drawing ----
 function clearAvatar(e){e.avatar.body?.skeleton?.dispose();e.avatar.dispose();e.avatar.root.removeFromParent();}
 const headCentre=(avatar,v=new THREE.Vector3())=>avatar.bones.head.localToWorld(v.set(0,avatar.measure.Rh*avatar.measure.headSY*.94,0));
 function stage(){
  for(const [id,e] of avatars)if(!actors.some(a=>a.id===id)){clearAvatar(e);avatars.delete(id);}
  for(const e of avatars.values())e.avatar.root.removeFromParent();
  for(const a of actors){
   const position=world.place(a),seatShape=position.seat?[Math.round((position.seat.surfaceY-position.y)*100)/100,position.seat.yaw||0,position.seat.front]:0;
   const key=JSON.stringify([a.recipe,a.pose,a.expression,a.turn,a.size,seatShape]);let e=avatars.get(a.id);
   const fresh=!e||e.key!==key;
   if(fresh){
    if(e)clearAvatar(e);
    e={key,avatar:buildAvatar(a.recipe,{shadows:true,faceSize:256})};const avatar=e.avatar;
    avatar.paintFace=createSceneFacePainter(avatar,a.recipe,()=>a.pose);avatar.root.userData.studioActor=true;avatars.set(a.id,e);
   }
   const avatar=e.avatar;world.scene.add(avatar.root);
   if(fresh){
    avatar.root.position.set(0,0,0);avatar.root.scale.setScalar(a.size);
    poseSceneAvatar(avatar,{...a,seatFront:position.seat?.front,seatHeight:position.seat?(position.seat.surfaceY-position.y)/a.size:0});
    avatar.paintFace({expression:a.expression,blink:0,talk:0,look:[0,0],actingBrow:0,actingSmile:0});
    e.rest=avatar.root.position.clone();e.restTurn=avatar.root.rotation.y;
   }else{avatar.root.position.copy(e.rest);avatar.root.rotation.y=e.restTurn;}
   if(position.seat)avatar.root.rotation.y=Math.PI+(position.seat.yaw||0);
   placeSceneAvatar(avatar,position,a.size);
  }
 }
 /** Where each head is on the picture, for the balloons: the top of the head, and whether it can be seen. */
 function measureHeads(){
  heads.clear();
  for(const a of actors){
   const e=avatars.get(a.id);if(!e)continue;
   const avatar=e.avatar,head=headCentre(avatar),top=new THREE.Box3().setFromObject(avatar.root).max.y;
   const c=head.clone().project(world.camera),t=new THREE.Vector3(head.x,top,head.z).project(world.camera);
   heads.set(a.id,{x:(c.x+1)/2,y:(1-t.y)/2,face:(1-c.y)/2,visible:c.z>-1&&c.z<1&&Math.abs(c.x)<1&&Math.abs(c.y)<1&&world.seen(head.x,head.y,head.z)});
  }
 }
 /** Draws the set at width × height into the canvas and returns it. */
 function render(width,height){
  if(!world||lost)return null;
  width=Math.max(2,Math.round(width));height=Math.max(2,Math.round(height));
  renderer.setSize(width,height,false);frameCamera(width/height);stage();
  world.sky?.update(world.camera,1,false,false);
  renderer.render(world.scene,world.camera);
  measureHeads();
  return canvas;
 }

 // ---- A Moment: Studio's "give me a story", staged here with its lines ----
 function moment(){
  if(!world||!actors.length)return null;
  const m=pickMoment(actors.length,{last:lastMoment});if(!m)return null;lastMoment=m.id;
  frameCamera(4/3);
  const o=origin(),size=Math.max(...actors.map(a=>a.size));
  const open=(x,z)=>{const X=o[0]+x,Z=o[2]+z;return Number.isFinite(world.floor(X,Z))&&!world.blocked(X,Z,.25*size);};
  const state={actors};
  applyMoment(state,m,{camera:cameraFrom(),free:[(x,z)=>open(x,z)&&onPicture(o[0]+x,o[2]+z,size),open]});
  // Anyone the room nudged (a counter, a wall) turns again from where they really stand.
  world.settle(actors);
  const turns=aim(actors.map(a=>({x:a.x,z:a.z})),m.layout,cameraFrom());actors.forEach((a,i)=>{a.turn=turns[i];});
  return {title:m.title,caption:m.caption,lines:actors.filter(a=>a.speech).map(a=>({id:a.id,text:a.speech}))};
 }

 // ---- Portraits for the cast sheet: head and shoulders, each drawn once ----
 const portraitScene=new THREE.Scene();portraitScene.background=new THREE.Color(0xe9eef0);
 portraitScene.add(new THREE.HemisphereLight(0xffffff,0x8a9aa0,2.3));
 const key=new THREE.DirectionalLight(0xffffff,1.7);key.position.set(1.2,2.2,4);portraitScene.add(key);
 const portraitCamera=new THREE.PerspectiveCamera(28,1,.05,20);
 async function portrait(name,size=128){
  if(portraits.has(name))return portraits.get(name);
  await ready;
  const avatar=buildAvatar(recipeFor(name),{shadows:false,faceSize:128});
  try{
   poseSceneAvatar(avatar,{pose:'Idle',expression:'smile',turn:0});portraitScene.add(avatar.root);avatar.root.updateMatrixWorld(true);
   const m=avatar.measure,c=headCentre(avatar),r=m.Rh*Math.max(m.headSX,m.headSY),d=r*1.5/Math.tan(14*DEG);
   portraitCamera.position.set(c.x,c.y+r*.1,c.z+d);portraitCamera.lookAt(c.x,c.y-r*.15,c.z);portraitCamera.updateMatrixWorld(true);
   renderer.setSize(size,size,false);renderer.render(portraitScene,portraitCamera);
   const url=canvas.toDataURL('image/webp',.85);portraits.set(name,url);return url;
  }finally{avatar.root.removeFromParent();avatar.body?.skeleton?.dispose();avatar.dispose();}
 }

 return {
  canvas,ready,
  get place(){return placeId;},get building(){return !!building;},get angle(){return angle;},get lost(){return lost;},
  get cast(){return actors;},view,
  open,angles,
  setAngle(name){if(angles().includes(name)){angle=name;resetView();}},
  orbit(dx,dy){view.orbit=clamp(view.orbit+dx,-80,80);view.tilt=clamp(view.tilt+dy,-18,30);},
  zoom(k){view.zoom=clamp(view.zoom*k,.45,1.6);},
  resetView,add,remove,setPose,setFace,turn,seatFor:id=>{const a=actor(id);return a?(a.seat?world.seats.find(s=>s.id===a.seat):seatFor(a)):null;},
  pick,moveTo,moment,render,portrait,head:id=>heads.get(id)||null,
  dispose(){for(const e of avatars.values())clearAvatar(e);avatars.clear();world?.dispose();world=null;renderer.dispose();renderer.forceContextLoss();},
 };
}
