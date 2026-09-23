import {createYuriFace} from './yuri-face.js';
import {createThuanFaceController} from './thuan-face-controller.js';
import {createOfficeHands} from './office-hands.js';
import {prepareYuriAnimations} from './yuri-animation.js?konbini-1';
import {prepareMergedYuriAnimations,poseThuanOnBicycle} from './yuri-merged-animation.js';
import {prepareNaoAnimations} from './nao-vrm-animation.js';
import {rigThuanFingers} from './thuan-fingers.js';
import {dressCharacter} from './surface.js';
import {residentPersonality} from './resident-personalities.js';
import {addResidentAccessories,addSleepEyes} from './resident-wardrobe.js';
import {createResidentHands} from './resident-props.js';
import {createCustomerGaze} from './shop-attention.js';
import {createMealMotion} from './meal-motion.js';
import {createThuanChairMotion} from './thuan-chair-motion.js';
import {createThuanSeatDrape} from './thuan-seat-drape.js';
import {prepareResidentAnimations} from './resident-animation.js';
import {sourceGait} from './gait.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {clone} from '../../vendor/SkeletonUtils.js';
import {assetURL} from '../assets.js';
import {PROFILES} from './profiles.js';
const LOW_POLY=['worker','suit','casual_2','female_casual','female_formal'];
/** Alternate takes of an idle, tried in order after the unsuffixed one. */
const IDLE_TAKES=Object.freeze(['','.1','.2']);
const SOURCES=[...LOW_POLY,'yuri-merged','nao-vrm'];
const loaded=new Map();let pending=null;
const modelPending=new Map();
export function preloadModel(id){
  if(!SOURCES.includes(id)&&id!=='yuri-playful')return Promise.resolve(false);
  if(loaded.has(id))return Promise.resolve(true);
  if(modelPending.has(id))return modelPending.get(id);
  const task=(async()=>{
    const loader=new GLTFLoader();
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),15000);
    try{
      const figurine=id==='yuri-playful';
      const path=id==='yuri-merged'?'characters/yuri/yuri-merged.glb':id==='nao-vrm'?'characters/nao/Nao.vrm':figurine?'characters/realistic/yuri-playful.glb?yuri-rig-2':'characters/residents/town-'+id+'.glb';
      const response=await fetch(assetURL(path),{signal:abort.signal});
      if(!response.ok)throw Error('Local character unavailable: '+id);
      const gltf=await loader.parseAsync(await response.arrayBuffer(),'');
      if(id==='yuri-merged'){rigThuanFingers(gltf);gltf.animations=prepareMergedYuriAnimations(gltf);}
      else if(id==='nao-vrm')gltf.animations=prepareNaoAnimations(gltf);
      else if(id==='yuri-playful')gltf.animations=prepareYuriAnimations(gltf);
      else{
        gltf.animations=prepareResidentAnimations(gltf);
        gltf.scene.traverse(o=>{if(o.isSkinnedMesh){o.material.flatShading=true;o.material.roughness=.9;o.material.dithering=true;}});
      }
      loaded.set(id,gltf);
    }catch(error){console.warn('Character awaiting its selected model: '+id,error.message);}
    finally{clearTimeout(timeout);}
    return loaded.has(id);
  })();
  modelPending.set(id,task);task.then(()=>modelPending.delete(id));return task;
}
export function preloadModels({onProgress}={}){
  if(pending)return pending;
  pending=(async()=>{let complete=0;for(const id of SOURCES){await preloadModel(id);onProgress?.(++complete/SOURCES.length,id,loaded.has(id));}return {ready:SOURCES.filter(id=>loaded.has(id)).length,total:SOURCES.length};})();
  return pending;
}
export function characterSource(name){
  if(name==='player'||name==='Johansson')return null;
  if(name==='Nao')return 'nao-vrm';
  if(residentPersonality(name).source)return residentPersonality(name).source;
  const profile=PROFILES.find(p=>p.name===name);
  if(name==='Yui'||profile?.female)return profile?.age>=50?'female_formal':'female_casual';
  if(name==='Harbour master'||profile?.role==='policeman'||profile?.role==='bus driver')return 'suit';
  return /repair|engineer|fish|ice/.test(profile?.role||'')?'worker':'casual_2';
}
export const preloadCharacter=name=>preloadModel(characterSource(name));
export const characterReady=name=>loaded.has(characterSource(name));
let figurineTemplate=null;
// The former shopkeeper is now a static collectible, requested only inside Sakura.
// Bake the original soft model's idle pose once, without keeping a second NPC/mixer.
export async function createYuriFigurine(){
 if(!await preloadModel('yuri-playful'))return null;
 if(!figurineTemplate){
  const asset=loaded.get('yuri-playful'),posed=clone(asset.scene),mixer=new THREE.AnimationMixer(posed);
  const idle=asset.animations.find(c=>c.name==='Idle_Neutral');if(idle){mixer.clipAction(idle).play();mixer.update(0);}
  posed.updateMatrixWorld(true);const group=new THREE.Group(),point=new THREE.Vector3();
  posed.traverse(mesh=>{if(!mesh.isMesh)return;const geometry=mesh.geometry.clone();
   if(mesh.isSkinnedMesh){mesh.skeleton.update();const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){mesh.getVertexPosition(i,point);positions.setXYZ(i,point.x,point.y,point.z);}
    geometry.deleteAttribute('skinIndex');geometry.deleteAttribute('skinWeight');geometry.computeVertexNormals();
   }
   geometry.applyMatrix4(mesh.matrixWorld);group.add(new THREE.Mesh(geometry,mesh.material));
  });
  mixer.stopAllAction();mixer.uncacheRoot(posed);
  const bounds=new THREE.Box3().setFromObject(group),centre=bounds.getCenter(new THREE.Vector3()),scale=.30/(bounds.max.y-bounds.min.y);
  group.scale.setScalar(scale);group.position.set(-centre.x*scale,-bounds.min.y*scale,-centre.z*scale);
  const root=new THREE.Group();root.add(group);root.name='Thuan soft figurine';root.userData.sharedAsset=true;root.userData.figurine=true;figurineTemplate=root;
 }
 return figurineTemplate.clone(true);
}
export function createLocalCharacters({shadows=false}={}){
  const actors=[],byEntity=new Map();
  function attach(entity,name,height){
    const profile=PROFILES.find(p=>p.name===name),source=characterSource(name),asset=loaded.get(source);
    if(!asset)return null;
    const model=clone(asset.scene);
    const lowPoly=LOW_POLY.includes(source),style=residentPersonality(name);
    // The procedural face only exists on the low-poly stand-in. The merged Meshy model
    // has neither it nor blendshapes, so the controller finds no rig there and idles;
    // it starts driving the moment an ARKit export supplies one.
    const face=lowPoly&&name==='Thuan'?createYuriFace(model):null;
    if(lowPoly)addResidentAccessories(model,style);
    const bedAccessories=[];
    model.traverse(o=>{if(/^resident-(glasses|captain|police|driver)$/.test(o.name))bedAccessories.push(o);});
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
    const targetHeight=height||style.height||profile?.height||1.75,scale=targetHeight/size.y;
    model.scale.multiplyScalar(scale);model.position.y=-bounds.min.y*scale+(source==='nao-vrm'?.018:0);model.rotation.y=Math.PI;
    if(lowPoly){model.scale.x*=style.width||1;model.scale.z*=Math.sqrt(style.width||1);}
    model.traverse(o=>{if(o.isMesh){o.castShadow=shadows;o.receiveShadow=shadows;o.frustumCulled=false;if(lowPoly&&!o.userData.facialFeatures)dressCharacter(o,profile?.top,style);}});
    for(const child of entity.children)child.visible=false;
    entity.add(model);entity.userData.visualReady=true;entity.userData.visualSource=source==='yuri-merged'?'Meshy merged · Thuan':source==='nao-vrm'?'VRoid · Nao':'PSX low-poly · '+(name==='Reiko'?'Nozomi (Reiko)':name);
    const mixer=new THREE.AnimationMixer(model),actions=new Map(asset.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
    {
      const wave=actions.get('Wave');if(wave){wave.setLoop(THREE.LoopOnce,1);wave.clampWhenFinished=true;}
    }
    const hands=createResidentHands(model),cup=hands?.holder||null;
    const motion=asset.parser.json.extras||{};
    const actor={cup,hands,lowPoly,style,face,officeHands:name==='Harbour master'?createOfficeHands(model):null,sleepEyes:null,bedAccessories,walkSpeed:1.25,runSpeed:4,entity,model,mixer,actions,current:null,last:entity.position.clone(),gestureTime:0,speed:0,isThuan:name==='Thuan',isAya:name==='Aya'||name==='Aiko',isNozomi:name==='Reiko'||name==='Nozomi',moving:false,wasVisible:true,height:targetHeight,eyeCentres:motion.eyeCentres};
    // What each locomotion clip is actually worth on the ground, in world metres per
    // second. Measured once per source model and scaled to this body: playing a walk
    // at a rate taken from a constant is what makes a character skate (see gait.js).
    {
      const forward=scale*(lowPoly?Math.sqrt(style.width||1):1);
      actor.gait={};
      for(const [name,speed] of Object.entries(sourceGait(asset)))actor.gait[name]=speed*forward;
      // The stroll and the walk hand over halfway between the two, so which one plays
      // follows how fast she is actually going rather than a number typed in here.
      actor.strollBelow=actor.gait.Stroll&&actor.gait.Walk?(actor.gait.Stroll+actor.gait.Walk)/2:0;
    }
    // Measure the support surface of this rig's seated pelvis, in entity space.
    // Standing height alone cannot predict where different bodies sit.
    // A cheap repeatable sequence per actor: idle variation is cosmetic, but two
    // people shifting their weight on the same frame is worse than neither doing it.
    {
      let seed=(Math.imul(actors.length+11,2654435761)^0x9e3779b9)>>>0;
      actor.idleNoise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      actor.idleFamily=null;actor.idleTake='';actor.idleHold=0;
    }
    actor.floorOffset=model.position.y;actor.seatSupport=null;
    try{
    if(actions.has('Sit')){
      actions.get('Sit').play();mixer.update(0);entity.updateWorldMatrix(true,false);entity.updateMatrixWorld(true);
      // Mixamo-style residents call this Hips; VRoid's VRM humanoid uses the
      // J_Bip_C_Hips node. Missing that alias disabled all measured chair support for
      // Nao, so a generic animation offset was mistaken for the actual seat surface.
      const hips=model.getObjectByName('Hips')||model.getObjectByName('J_Bip_C_Hips');
      if(hips){
      const hip=entity.worldToLocal(hips.getWorldPosition(new THREE.Vector3()));
      let bottom=hip.y;const point=new THREE.Vector3(),support=[];
      model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;mesh.skeleton.update();
        const read=mesh.getVertexPosition?mesh.getVertexPosition.bind(mesh):(i,t)=>{t.fromBufferAttribute(mesh.geometry.attributes.position,i);};
        for(let i=0;i<mesh.geometry.attributes.position.count;i++){
          read(i,point).applyMatrix4(mesh.matrixWorld);entity.worldToLocal(point);
          if(Math.hypot(point.x-hip.x,point.z-hip.z)<.25&&point.y>hip.y-.24&&point.y<hip.y){bottom=Math.min(bottom,point.y);support.push({mesh,index:i,y:point.y});}
        }
      });
      actor.seatSupport={x:hip.x,y:bottom,z:hip.z};actor.seatVertices=support.sort((a,b)=>a.y-b.y).slice(0,16);actor.seatPoint=new THREE.Vector3();mixer.stopAllAction();
      }
    }
    }catch{mixer.stopAllAction();}
    const idle=actions.get('Idle_Neutral');if(idle){idle.play();actor.current='Idle_Neutral';idle.time=(actors.length*.617)%idle.getClip().duration;mixer.update(0);}
    actor.faceController=name==='Thuan'?createThuanFaceController({model,face}):null;
    actor.chairMotion=createThuanChairMotion(model,entity);
    if(actor.chairMotion&&actor.seatSupport){
      const idleTime=idle.time;mixer.stopAllAction();actions.get('Sit').reset().play();mixer.update(0);
      model.position.set(-actor.seatSupport.x,actor.floorOffset+.51-actor.seatSupport.y,-actor.seatSupport.z);
      actor.chairMotion.update({seatHeight:.51,floorHeight:.078},1);
      actor.seatDrape=createThuanSeatDrape(model,entity,.51);
      actor.chairMotion.restore();mixer.stopAllAction();idle.reset().play();idle.time=idleTime;mixer.update(0);model.position.set(0,actor.floorOffset,0);
    }
    actor.customerGaze=name==='Thuan'?createCustomerGaze(model,entity):null;
    actor.mealMotion=createMealMotion(model,entity,targetHeight);actor.hands?.fit(actor.mealMotion);
    byEntity.set(entity,actor);actors.push(actor);return actor;
  }
  let faceClock=0;
  function update(dt){
    faceClock+=dt;
    for(const actor of actors){const {entity,mixer,actions}=actor;
      actor.customerGaze?.restore();
      actor.mealMotion?.restore();
      actor.chairMotion?.restore();
      const explicitSleep=Number(entity.userData.sleepBlend),sleepAmount=THREE.MathUtils.clamp(Number.isFinite(explicitSleep)?explicitSleep:(entity.userData.sleeping&&!entity.userData.roomTransition?1:0),0,1),eyesClosed=sleepAmount>.28;
      if(eyesClosed&&actor.lowPoly&&!actor.face&&!actor.sleepEyes)actor.sleepEyes=addSleepEyes(actor.model,actor.style);
      if(actor.sleepEyes)actor.sleepEyes.visible=eyesClosed;
      for(const accessory of actor.bedAccessories)accessory.visible=!eyesClosed&&!(entity.userData.inWorkplace==='office'&&accessory.name==='resident-captain');
      if(!eyesClosed&&actor.sleepEyes){actor.sleepEyes.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});actor.sleepEyes.removeFromParent();actor.sleepEyes=null;}
      let visible=true;for(let parent=entity;parent;parent=parent.parent)if(!parent.visible){visible=false;break;}
      if(!visible){actor.last.copy(entity.position);actor.speed=0;actor.moving=false;actor.gestureTime=0;actor.wasVisible=false;continue;}
      const distance=Math.hypot(entity.position.x-actor.last.x,entity.position.z-actor.last.z);actor.last.copy(entity.position);
      const relocated=!actor.wasVisible||distance>1;actor.wasVisible=true;
      if(relocated){
        // Streaming and room transfers are discontinuities, not footsteps.
        // Stop outgoing actions so their stale pose cannot bleed into arrival.
        mixer.stopAllAction();actor.current=null;actor.speed=0;actor.moving=false;actor.gestureTime=0;
      }
      // Moving the pelvis over a chair is weight transfer, not a walking step.
      const measured=relocated||actor.chairTransition||Number.isFinite(entity.userData.chairBlend)?0:distance/Math.max(dt,.001);
      // Track the measured speed closely and call almost any translation walking. The
      // old threshold let a person drift at up to 0.18 m/s in the idle pose, which is
      // moonwalking: the feet are planted and the body slides anyway.
      actor.speed=THREE.MathUtils.damp(actor.speed,measured,20,dt);
      actor.moving=actor.speed>(actor.moving?.03:.07);
      actor.gestureTime=Math.max(0,actor.gestureTime-dt);
      actor.hands?.show(entity.userData.heldItem||(['Drink','DrinkStanding'].includes(entity.userData.socialPose)?'tea':null));
      if(actions.size===0)continue;
      const seated=actor.seatSupport&&Number.isFinite(entity.userData.seatHeight)&&['Wake','Sit','Type','Eat','Drink','Sleep'].includes(entity.userData.socialPose);
      const chairTransition=actor.chairMotion&&Number.isFinite(entity.userData.chairBlend);
      actor.seatBlend=chairTransition?THREE.MathUtils.clamp(entity.userData.chairBlend,0,1):THREE.MathUtils.clamp((actor.seatBlend||0)+(seated?dt:-dt)/.35,0,1);
      if(seated)actor.lastSeatHeight=entity.userData.seatHeight;
      const blend=actor.seatBlend,support=actor.seatSupport;
      actor.seatDrape?.update(0);
      actor.model.position.set(support?-support.x*blend:0,actor.floorOffset+(Number(entity.userData.floorHeight)||0)*(1-blend)+(support?(actor.lastSeatHeight-support.y)*blend||0:0),support?-support.z*blend:0);
      // Clear the front edge before settling the pelvis onto the cushion.
      if(chairTransition)actor.model.position.y+=.075*Math.sin(Math.PI*blend)**2;
      const waving=!!(entity.userData.chat?.greeting||actor.gestureTime);
      const pose=entity.userData.socialPose;
      // A walk and a stroll are different motions, not the same motion at two rates.
      //
      // Hysteresis around the handover, or she flickers between them at the boundary,
      // and a dwell before taking it up: everybody is below a walking pace for the
      // first tenth of a second they move, and swapping gait for that moment puts a
      // visible jump through the arms on the way in and again on the way out. You
      // change gait because you are dawdling, not because you have just set off.
      if(actor.strollBelow){
        // Only time spent actually moving slowly counts. Standing still is below a
        // walking pace too, so counting it meant the dwell was always already spent
        // and the first few frames of setting off played as a stroll before snapping
        // to the walk -- the jump through the arms this was meant to prevent.
        const slow=actor.moving&&actor.speed<actor.strollBelow*(actor.strolling?1.15:.87);
        actor.strollFor=slow?(actor.strollFor||0)+dt:0;
        actor.strolling=actor.strolling?slow:actor.strollFor>.45;
      }
      const travelling=actor.speed>3.5?'Run':actor.moving?(actor.strolling&&actions.has('Stroll')?'Stroll':'Walk'):'Idle_Neutral';
      const requested=(actor.isThuan&&entity.userData.carrying?(actor.moving?'CarryWalk':'CarryIdle'):null)||(waving&&(!pose||pose==='CounterIdle')?'Wave':null)||pose||travelling;
      const family=[requested,seated?'Sit':null,'Idle_Neutral','Idle'].find(name=>actions.has(name));
      if(!family)continue;
      // Standing still is not one pose held for eleven hours.
      //
      // Where a rig carries alternate takes of an idle -- 'CounterIdle', 'CounterIdle.1',
      // 'CounterIdle.2' -- move between them every few seconds instead of looping the
      // first one all day. Each take stands with the weight somewhere else and breathes
      // on its own cadence, so the counter stops reading as a photograph of a shopkeeper.
      let clip=family;
      if(actions.has(family+'.1')){
        if(actor.idleFamily!==family){actor.idleFamily=family;actor.idleTake=family;actor.idleHold=6+actor.idleNoise()*7;}
        if((actor.idleHold-=dt)<=0){
          const takes=IDLE_TAKES.map(suffix=>family+suffix).filter(name=>actions.has(name)&&name!==actor.idleTake);
          actor.idleTake=takes[Math.floor(actor.idleNoise()*takes.length)]||family;
          actor.idleHold=7+actor.idleNoise()*9;
        }
        clip=actor.idleTake;
      }else actor.idleFamily=null;
      if(chairTransition){
        // The chair controller owns the weight transfer, including reversal
        // for standing. Do not run a second, shorter mixer fade over it.
        if(!actor.chairTransition){mixer.stopAllAction();actions.get('Sit').reset().play();actions.get('Idle_Neutral').reset().play();}
        actions.get('Sit').setEffectiveWeight(blend);actions.get('Idle_Neutral').setEffectiveWeight(1-blend);actor.current=blend>.5?'Sit':'Idle_Neutral';
      }else{
        if(actor.chairTransition){mixer.stopAllAction();actor.current=null;}
        if(actor.current!==clip){
          const previous=actions.get(actor.current),next=actions.get(clip);
          // Shifting weight takes longer than changing what you are doing, and a slow
          // fade is also what keeps the hands from stepping between the two takes.
          const settling=!!actor.idleFamily&&!!actor.current&&actor.current.startsWith(actor.idleFamily);
          next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
          if(previous)previous.crossFadeTo(next,settling?.6:.24,false);
          actor.current=clip;
        }
      }
      actor.chairTransition=chairTransition;
      const locomotion=actions.get(actor.current);
      const {walkSpeed,runSpeed}=actor;
      // Play the cycle at the rate the ground is passing. The measured speed is the
      // clip's own; the constants are the fallback for a rig we could not measure.
      const ground=actor.gait?.[actor.current];
      if(locomotion&&ground>0)locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/ground,.32,2.6);
      else if(locomotion&&['Walk','CarryWalk'].includes(actor.current))locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/walkSpeed,.18,1.8);
      else if(locomotion&&actor.current==='Run')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/runSpeed,.5,2.2);
      mixer.update(dt);
      if(actor.isThuan&&entity.userData.playerControlled)poseThuanOnBicycle(actor.model,entity,entity.userData.bicyclePhase||0);
      if(seated&&actor.seatBlend===1){
        entity.updateWorldMatrix(true,false);entity.updateMatrixWorld(true);let bottom=Infinity;
        for(const mesh of new Set(actor.seatVertices.map(v=>v.mesh)))mesh.skeleton.update();
        for(const {mesh,index} of actor.seatVertices){mesh.getVertexPosition(index,actor.seatPoint).applyMatrix4(mesh.matrixWorld);entity.worldToLocal(actor.seatPoint);bottom=Math.min(bottom,actor.seatPoint.y);}
        if(Number.isFinite(bottom))actor.model.position.y+=entity.userData.seatHeight-bottom;
      }
      if(actor.faceController){
        const engaged=!!(entity.userData.playerConversation||entity.userData.chat||actor.gestureTime);
        actor.faceController.setAsleep(eyesClosed);
        actor.faceController.setSpeaking(!!(entity.userData.chat?.speaking||entity.userData.speakingUntil>performance.now()));
        // A conversation may pin an expression; otherwise she warms up when engaged.
        actor.faceController.setExpression(entity.userData.thuanExpression||(engaged?'smile':'neutral'));
        actor.faceController.update(dt,faceClock);
      }
      if(entity.userData.inWorkplace==='office'&&entity.userData.socialPose==='Type')actor.officeHands?.update(dt);
      actor.seatDrape?.update(blend);
      actor.chairMotion?.update(entity.userData,actor.seatBlend);
      actor.mealMotion?.update(dt,{...entity.userData,heldItem:entity.userData.heldItem||(['Drink','DrinkStanding'].includes(entity.userData.socialPose)?'tea':null)});
      actor.hands?.align();
      actor.customerGaze?.update(dt,entity.userData,actor.moving);
      if(actor.lowPoly){
        const chat=entity.userData.chat,head=actor.model.getObjectByName('Head');
        if(chat&&head){const partner=chat.partner.getWorldPosition(new THREE.Vector3());entity.worldToLocal(partner);
          const yaw=THREE.MathUtils.clamp(Math.atan2(-partner.x,-partner.z),-.35,.35);
          const nod=Math.sin(chat.time*(chat.speaking?2.3:3.1))*(chat.speaking?.025:.055);
          head.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(nod,yaw,0)));
        }
      }
    }
  }
  function conversationTarget(entity,target=new THREE.Vector3()){
    const actor=byEntity.get(entity);if(!actor)return null;
    const head=actor.model.getObjectByName('Head');
    if(head){
      if(actor.eyeCentres){const [left,right]=actor.eyeCentres;target.fromArray(left).add(new THREE.Vector3(...right)).multiplyScalar(.5);return head.localToWorld(target);}
      head.getWorldPosition(target);
      // Thuan's Head joint is at the base of her large head, not eye level.
      const crown=actor.model.getObjectByName('head_end');
      if(crown)return target.lerp(crown.getWorldPosition(new THREE.Vector3()),.65);
      target.y+=actor.height*.045;return target;
    }
    entity.getWorldPosition(target);target.y+=actor.height*.9;return target;
  }
  return {attach,update,actors,conversationTarget,gesture(entity){const actor=byEntity.get(entity);if(!actor)return false;if(actor.gestureTime>0)return true;actor.gestureTime=actor.actions.get('Wave')?.getClip().duration||1.2;return true;}};
}
