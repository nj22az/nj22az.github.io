import {prepareYuriAnimations} from './yuri-animation.js?yuri-greeting-1';
import {smoothCharacterNormals,dressCharacter} from './surface.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {clone} from '../../vendor/SkeletonUtils.js';
import {assetURL} from '../assets.js';
import {PROFILES} from './profiles.js';
import {VROID_BASES,vroidLook,styleVroid,updateVroidExpression} from './vroid.js?vroid-3';

const SOURCES=['suit','yui','yuri-playful',...VROID_BASES];
const loaded=new Map(),sharedTextures=new Map();let pending=null;
function reuseNeighbourTextures(gltf){
  gltf.scene.traverse(mesh=>{if(!mesh.isMesh)return;
    for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
      material.dithering=true;material.envMapIntensity=.48;
      for(const key of ['map','normalMap','roughnessMap','metalnessMap','aoMap']){
        const texture=material[key];if(!texture)continue;
        const index=gltf.parser.associations.get(texture)?.textures;
        const source=gltf.parser.json.textures[index]?.source,uri=gltf.parser.json.images[source]?.uri;
        if(!uri)continue;
        const signature=uri+'/'+texture.colorSpace+'/'+texture.flipY+'/'+texture.wrapS+'/'+texture.wrapT;
        if(sharedTextures.has(signature)){material[key]=sharedTextures.get(signature);if(texture!==material[key])texture.dispose();}
        else{texture.anisotropy=2;sharedTextures.set(signature,texture);}
      }
    }
  });
}
export function preloadModels({onProgress}={}){
  if(pending)return pending;
  const loader=new GLTFLoader();let complete=0;
  let at=0;
  async function loadOne(id){
    const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),15000);
    try{
      const neighbours=id.startsWith('vroid-');
      const response=await fetch(assetURL(neighbours?'characters/vroid/'+id+'.glb':['kenji','yui','yuri-playful'].includes(id)?'characters/realistic/'+id+'.glb'+(id==='yuri-playful'?'?yuri-rig-2':''):'characters/residents/town-'+id+'.glb'),{signal:abort.signal});
      if(!response.ok)throw Error('Local character unavailable: '+id);
      const data=await response.arrayBuffer();
      const gltf=await loader.parseAsync(data,neighbours?assetURL('characters/vroid/'):'' );gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&!neighbours&&!['kenji','yui','yuri-playful'].includes(id)){smoothCharacterNormals(o.geometry);o.material.flatShading=false;o.material.roughness=.78;o.material.dithering=true;}});if(id==='yuri-playful')gltf.animations=prepareYuriAnimations(gltf);if(neighbours)reuseNeighbourTextures(gltf);loaded.set(id,gltf);
    }catch(error){console.warn('Using procedural character fallback for '+id,error.message);}
    finally{clearTimeout(timeout);onProgress?.(++complete/SOURCES.length,id,loaded.has(id));}
  }
  // Limit simultaneous GLB parsing/image decoding on tablets.
  pending=Promise.allSettled(Array.from({length:3},async()=>{while(at<SOURCES.length)await loadOne(SOURCES[at++]);})).then(()=>({ready:loaded.size,total:SOURCES.length}));
  return pending;
}
function sourceFor(name,profile){
  if(name==='Yuri'&&loaded.has('yuri-playful'))return 'yuri-playful';
  if(name==='player'||name==='Johansson')return null;
  if(name==='Yui'||name==='Yuri')return loaded.has('yui')?'yui':'female_casual';
  const anime=vroidLook(profile);if(anime){const choices=[anime.base,...(profile.female?['vroid-bob','vroid-long','vroid-ponytail']:['vroid-casual','vroid-vest'])];const ready=choices.find(id=>loaded.has(id));if(ready)return ready;}
  if(profile?.female)return profile.age>=50?'female_formal':'female_casual';
  if(name==='Harbour master'||profile?.role==='policeman'||profile?.role==='bus driver')return 'suit';
  return /repair|engineer|fish|ice/.test(profile?.role||'')?'worker':'casual_2';
}
export function createLocalCharacters({shadows=false}={}){
  const actors=[],byEntity=new Map();
  function attach(entity,name,height){
    const profile=PROFILES.find(p=>p.name===name),source=sourceFor(name,profile),asset=loaded.get(source);
    if(!asset)return null;
    const model=clone(asset.scene),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
    const scale=(height||profile?.height||1.75)/size.y;
    model.scale.multiplyScalar(scale);model.position.y=-bounds.min.y*scale;model.rotation.y=Math.PI;
    const neighbour=source.startsWith('vroid-'),faces=neighbour?styleVroid(model,profile,asset.parser.json.extras.eyeCentres):[];
    model.traverse(o=>{if(o.isMesh){o.castShadow=shadows;o.receiveShadow=shadows;o.frustumCulled=false;if(!neighbour&&!['kenji','yui','yuri-playful'].includes(source))dressCharacter(o,profile?.top);}});
    for(const child of entity.children)child.visible=false;
    entity.add(model);entity.userData.visualSource=neighbour?'VRoid / anime neighbour · '+name:source==='yuri-playful'?'User-supplied Meshy · Yuri':['kenji','yui','yuri-playful'].includes(source)?'Blender / MakeHuman · '+name:'Quaternius / '+source;
    const mixer=new THREE.AnimationMixer(model),actions=new Map(asset.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
    {
      const wave=actions.get('Wave');if(wave){wave.setLoop(THREE.LoopOnce,1);wave.clampWhenFinished=true;}
    }
    let cup=null;
    if(neighbour){const hand=model.getObjectByName('J_Bip_R_Hand');if(hand){cup=new THREE.Mesh(new THREE.CylinderGeometry(.035,.027,.07,12),new THREE.MeshStandardMaterial({color:0xe8c79c,roughness:.42}));cup.position.set(.06,0,-.035);cup.visible=false;hand.add(cup);}}
    const motion=asset.parser.json.extras||{};
    const actor={cup,faces,look:vroidLook(profile),expressionTime:(actors.length*.731)+.3,walkSpeed:(motion.walkSpeed||1.25)*scale,runSpeed:(motion.runSpeed||4)*scale,entity,model,mixer,actions,current:null,last:entity.position.clone(),gestureTime:0,speed:0,isYuri:source==='yuri-playful',neighbour,moving:false,wasVisible:true,height:height||profile?.height||1.75,eyeCentres:motion.eyeCentres};
    // Measure the support surface of this rig's seated pelvis, in entity space.
    // Standing height alone cannot predict where different VRoid bodies sit.
    actor.floorOffset=model.position.y;actor.seatSupport=null;
    if(neighbour&&actions.has('Sit')){
      actions.get('Sit').play();mixer.update(0);entity.updateWorldMatrix(true,false);entity.updateMatrixWorld(true);
      const hip=entity.worldToLocal(model.getObjectByName('J_Bip_C_Hips').getWorldPosition(new THREE.Vector3()));
      let bottom=hip.y;const point=new THREE.Vector3(),support=[];
      model.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;mesh.skeleton.update();
        for(let i=0;i<mesh.geometry.attributes.position.count;i++){
          mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);entity.worldToLocal(point);
          if(Math.hypot(point.x-hip.x,point.z-hip.z)<.25&&point.y>hip.y-.24&&point.y<hip.y){bottom=Math.min(bottom,point.y);support.push({mesh,index:i,y:point.y});}
        }
      });
      actor.seatSupport={x:hip.x,y:bottom,z:hip.z};actor.seatVertices=support.sort((a,b)=>a.y-b.y).slice(0,16);actor.seatPoint=new THREE.Vector3();mixer.stopAllAction();
    }
    const idle=actions.get('Idle_Neutral');if(idle){idle.play();actor.current='Idle_Neutral';idle.time=(actors.length*.617)%idle.getClip().duration;mixer.update(0);}
    if(neighbour)updateVroidExpression(actor,0);
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
      if(actor.cup)actor.cup.visible=entity.userData.socialPose==='Drink';
      if(actions.size===0)continue;
      const seated=actor.seatSupport&&Number.isFinite(entity.userData.seatHeight)&&['Sit','Eat','Drink'].includes(entity.userData.socialPose);
      if(!!seated!==!!actor.seated){mixer.stopAllAction();actor.current=null;actor.seated=!!seated;}
      actor.model.position.set(seated?-actor.seatSupport.x:0,actor.floorOffset+(seated?entity.userData.seatHeight-actor.seatSupport.y:0),seated?-actor.seatSupport.z:0);
      const requested=entity.userData.socialPose|| (entity.userData.chat?.greeting?'Wave':null)|| (actor.gestureTime?'Wave':actor.speed>3.5?'Run':actor.moving?'Walk':'Idle_Neutral');
      const clip=[requested,'Idle_Neutral','Idle'].find(name=>actions.has(name));
      if(!clip)continue;
      if(actor.current!==clip){const previous=actions.get(actor.current),next=actions.get(clip);next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();if(previous)previous.crossFadeTo(next,.24,false);actor.current=clip;}
      const locomotion=actions.get(actor.current);
      const walkSpeed=actor.neighbour?actor.walkSpeed:1.25,runSpeed=actor.neighbour?actor.runSpeed:4;
      if(locomotion&&actor.current==='Walk')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/walkSpeed,.18,1.8);else if(locomotion&&actor.current==='Run')locomotion.timeScale=THREE.MathUtils.clamp(actor.speed/runSpeed,.5,2.2);
      mixer.update(dt);
      if(seated){
        entity.updateWorldMatrix(true,false);entity.updateMatrixWorld(true);let bottom=Infinity;
        for(const mesh of new Set(actor.seatVertices.map(v=>v.mesh)))mesh.skeleton.update();
        for(const {mesh,index} of actor.seatVertices){mesh.getVertexPosition(index,actor.seatPoint).applyMatrix4(mesh.matrixWorld);entity.worldToLocal(actor.seatPoint);bottom=Math.min(bottom,actor.seatPoint.y);}
        if(Number.isFinite(bottom))actor.model.position.y+=entity.userData.seatHeight-bottom;
      }
      if(actor.neighbour){
        updateVroidExpression(actor,dt);
        const chat=entity.userData.chat,head=actor.model.getObjectByName('J_Bip_C_Head');
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
    const head=actor.model.getObjectByName(actor.neighbour?'J_Bip_C_Head':'Head');
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
