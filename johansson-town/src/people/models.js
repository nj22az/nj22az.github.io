import {prepareYuriAnimations} from './yuri-animation.js?konbini-1';
import {dressCharacter} from './surface.js';
import {residentPersonality} from './resident-personalities.js';
import {addResidentAccessories} from './resident-wardrobe.js';
import {createResidentHands} from './resident-props.js';
import {prepareResidentAnimations} from './resident-animation.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {clone} from '../../vendor/SkeletonUtils.js';
import {assetURL} from '../assets.js';
import {PROFILES} from './profiles.js';
const LOW_POLY=['worker','suit','casual_2','female_casual','female_formal'];
const SOURCES=LOW_POLY;
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
      const response=await fetch(assetURL(figurine?'characters/realistic/yuri-playful.glb?yuri-rig-2':'characters/residents/town-'+id+'.glb'),{signal:abort.signal});
      if(!response.ok)throw Error('Local character unavailable: '+id);
      const gltf=await loader.parseAsync(await response.arrayBuffer(),'');
      if(id==='yuri-playful')gltf.animations=prepareYuriAnimations(gltf);
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
  const root=new THREE.Group();root.add(group);root.name='Yuri soft figurine';root.userData.sharedAsset=true;root.userData.figurine=true;figurineTemplate=root;
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
    if(lowPoly)addResidentAccessories(model,style);
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
    const targetHeight=height||style.height||profile?.height||1.75,scale=targetHeight/size.y;
    model.scale.multiplyScalar(scale);model.position.y=-bounds.min.y*scale;model.rotation.y=Math.PI;
    if(lowPoly){model.scale.x*=style.width||1;model.scale.z*=Math.sqrt(style.width||1);}
    model.traverse(o=>{if(o.isMesh){o.castShadow=shadows;o.receiveShadow=shadows;o.frustumCulled=false;if(lowPoly)dressCharacter(o,profile?.top,style);}});
    for(const child of entity.children)child.visible=false;
    entity.add(model);entity.userData.visualReady=true;entity.userData.visualSource='PSX low-poly · '+(name==='Reiko'?'Nozomi (Reiko)':name);
    const mixer=new THREE.AnimationMixer(model),actions=new Map(asset.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
    {
      const wave=actions.get('Wave');if(wave){wave.setLoop(THREE.LoopOnce,1);wave.clampWhenFinished=true;}
    }
    const hands=createResidentHands(model),cup=hands?.holder||null;
    const motion=asset.parser.json.extras||{};
    const actor={cup,hands,lowPoly,walkSpeed:1.25,runSpeed:4,entity,model,mixer,actions,current:null,last:entity.position.clone(),gestureTime:0,speed:0,isYuri:name==='Yuri',isAya:name==='Aya'||name==='Aiko',isNozomi:name==='Reiko'||name==='Nozomi',moving:false,wasVisible:true,height:targetHeight,eyeCentres:motion.eyeCentres};
    // Measure the support surface of this rig's seated pelvis, in entity space.
    // Standing height alone cannot predict where different bodies sit.
    actor.floorOffset=model.position.y;actor.seatSupport=null;
    try{
    if(actions.has('Sit')){
      actions.get('Sit').play();mixer.update(0);entity.updateWorldMatrix(true,false);entity.updateMatrixWorld(true);
      const hips=model.getObjectByName('Hips');
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
    byEntity.set(entity,actor);actors.push(actor);return actor;
  }
  function update(dt){
    for(const actor of actors){const {entity,mixer,actions}=actor;
      let visible=true;for(let parent=entity;parent;parent=parent.parent)if(!parent.visible){visible=false;break;}
      if(!visible){actor.last.copy(entity.position);actor.speed=0;actor.moving=false;actor.gestureTime=0;actor.wasVisible=false;continue;}
      const distance=Math.hypot(entity.position.x-actor.last.x,entity.position.z-actor.last.z);actor.last.copy(entity.position);
      const relocated=!actor.wasVisible||distance>1;actor.wasVisible=true;
      if(relocated){
        // Streaming and room transfers are discontinuities, not footsteps.
        // Stop outgoing actions so their stale pose cannot bleed into arrival.
        mixer.stopAllAction();actor.current=null;actor.speed=0;actor.moving=false;actor.gestureTime=0;
      }
      const measured=relocated?0:distance/Math.max(dt,.001);
      actor.speed=THREE.MathUtils.damp(actor.speed,measured,12,dt);
      actor.moving=actor.speed>(actor.moving?.08:.18);
      actor.gestureTime=Math.max(0,actor.gestureTime-dt);
      actor.hands?.show(entity.userData.heldItem||(['Drink','DrinkStanding'].includes(entity.userData.socialPose)?'tea':null));
      if(actions.size===0)continue;
      const seated=actor.seatSupport&&Number.isFinite(entity.userData.seatHeight)&&['Sit','Eat','Drink'].includes(entity.userData.socialPose);
      actor.seatBlend=THREE.MathUtils.clamp((actor.seatBlend||0)+(seated?dt:-dt)/.35,0,1);
      if(seated)actor.lastSeatHeight=entity.userData.seatHeight;
      const blend=actor.seatBlend,support=actor.seatSupport;
      actor.model.position.set(support?-support.x*blend:0,actor.floorOffset+(support?(actor.lastSeatHeight-support.y)*blend||0:0),support?-support.z*blend:0);
      const requested=(actor.isYuri&&entity.userData.carrying?(actor.moving?'CarryWalk':'CarryIdle'):null)||entity.userData.socialPose|| (entity.userData.chat?.greeting?'Wave':null)|| (actor.gestureTime?'Wave':actor.speed>3.5?'Run':actor.moving?'Walk':'Idle_Neutral');
      const clip=[requested,seated?'Sit':null,'Idle_Neutral','Idle'].find(name=>actions.has(name));
      if(!clip)continue;
      if(actor.current!==clip){const previous=actions.get(actor.current),next=actions.get(clip);next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();if(previous)previous.crossFadeTo(next,.24,false);actor.current=clip;}
      const locomotion=actions.get(actor.current);
      const {walkSpeed,runSpeed}=actor;
      if(locomotion&&['Walk','CarryWalk'].includes(actor.current))locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/walkSpeed,.18,1.8);else if(locomotion&&actor.current==='Run')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/runSpeed,.5,2.2);
      mixer.update(dt);
      if(seated&&actor.seatBlend===1){
        entity.updateWorldMatrix(true,false);entity.updateMatrixWorld(true);let bottom=Infinity;
        for(const mesh of new Set(actor.seatVertices.map(v=>v.mesh)))mesh.skeleton.update();
        for(const {mesh,index} of actor.seatVertices){mesh.getVertexPosition(index,actor.seatPoint).applyMatrix4(mesh.matrixWorld);entity.worldToLocal(actor.seatPoint);bottom=Math.min(bottom,actor.seatPoint.y);}
        if(Number.isFinite(bottom))actor.model.position.y+=entity.userData.seatHeight-bottom;
      }
      actor.hands?.align();
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
      // Yuri's Head joint is at the base of her large head, not eye level.
      const crown=actor.model.getObjectByName('head_end');
      if(crown)return target.lerp(crown.getWorldPosition(new THREE.Vector3()),.65);
      target.y+=actor.height*.045;return target;
    }
    entity.getWorldPosition(target);target.y+=actor.height*.9;return target;
  }
  return {attach,update,actors,conversationTarget,gesture(entity){const actor=byEntity.get(entity);if(!actor)return false;if(actor.gestureTime>0)return true;actor.gestureTime=actor.actions.get('Wave')?.getClip().duration||1.2;return true;}};
}
