import * as THREE from '../../vendor/three.module.js';
import {assetURL} from '../assets.js';

// Add further supplied clips here. Each cycle uses every clip once, with no
// immediate repeat between cycles when the playlist contains multiple clips.
export const ADVERTISING_CLIPS=[{file:'video/izakaya-ad.mp4',poster:'video/izakaya-ad.jpg',aspect:1}];
export function shuffledPlaylist(length,previous=-1,random=Math.random){
 const order=Array.from({length},(_,i)=>i);
 for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 if(order.length>1&&order[0]===previous)[order[0],order[1]]=[order[1],order[0]];
 return order;
}

export function createAdvertisingBillboard({parent,position,yaw=Math.PI,clips=ADVERTISING_CLIPS,video=document.createElement('video')}){
 const group=new THREE.Group();group.name='Street advertising billboard';group.position.set(...position);group.rotation.y=yaw;parent.add(group);
 const metal=new THREE.MeshStandardMaterial({color:0x303c3c,roughness:.72});
 const frame=new THREE.Mesh(new THREE.BoxGeometry(2.9,2.9,.22),metal);group.add(frame);
 for(const x of [-1.05,1.05]){const post=new THREE.Mesh(new THREE.BoxGeometry(.12,1.4,.12),metal);post.position.set(x,-1.8,-.04);group.add(post);}
 const material=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.65,2.65),material);screen.position.z=.121;screen.name='Advertising video screen';screen.userData.dynamic=true;group.add(screen);
 const texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
 video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='none';video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 let order=[],current=-1,visible=false,playingRequest=false,blocked=false,disposed=false,poster=null,failed=new Set();
 const frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),centre=new THREE.Vector3(),normal=new THREE.Vector3(),toward=new THREE.Vector3();
 function play(){
  if(disposed||!visible||blocked||playingRequest||!video.paused||current<0)return;
  playingRequest=true;
  Promise.resolve(video.play?.()).catch(()=>{blocked=true;}).finally(()=>{playingRequest=false;if(!visible)video.pause?.();});
 }
 function select(){
  if(!clips.length||failed.size===clips.length)return;
  if(!order.length)order=shuffledPlaylist(clips.length,current);
  let next=order.shift();while(failed.has(next)){if(!order.length)order=shuffledPlaylist(clips.length,current);next=order.shift();}
  current=next;blocked=false;
  const clip=clips[current];video.loop=clips.length===1;video.src=assetURL(clip.file);
  poster?.dispose();poster=null;material.map=null;material.color.set(0x1b2727);
  if(clip.poster){poster=new THREE.TextureLoader().load(assetURL(clip.poster));poster.colorSpace=THREE.SRGBColorSpace;material.map=poster;material.color.set(0xffffff);}
  material.needsUpdate=true;
  const aspect=clip.aspect||1;screen.scale.set(aspect>1?1:aspect,aspect>1?1/aspect:1,1);
  video.load?.();play();
 }
 function loaded(){material.map=texture;material.color.set(0xffffff);material.needsUpdate=true;play();}
 function ended(){select();}
 function error(){failed.add(current);select();}
 function gesture(){blocked=false;play();}
 function hide(){visible=false;video.pause?.();}
 function visibility(){if(document.hidden)hide();}
 video.addEventListener('loadeddata',loaded);video.addEventListener('ended',ended);video.addEventListener('error',error);
 document.addEventListener('pointerdown',gesture);document.addEventListener('keydown',gesture);document.addEventListener('visibilitychange',visibility);
 return {group,video,update({camera,inside=false,paused=false}){
  if(disposed)return;
  group.updateWorldMatrix(true,false);camera.updateMatrixWorld();screen.getWorldPosition(centre);
  normal.set(0,0,1).transformDirection(group.matrixWorld);toward.copy(camera.position).sub(centre);
  matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(matrix);
  visible=!inside&&!paused&&!document.hidden&&toward.lengthSq()<32*32&&normal.dot(toward)>0&&frustum.intersectsSphere(new THREE.Sphere(centre,1.9));
  if(!visible){video.pause?.();return;}
  if(current<0)select();else play();
 },dispose(){disposed=true;hide();video.removeAttribute?.('src');video.load?.();
  video.removeEventListener('loadeddata',loaded);video.removeEventListener('ended',ended);video.removeEventListener('error',error);
  document.removeEventListener?.('pointerdown',gesture);document.removeEventListener?.('keydown',gesture);document.removeEventListener?.('visibilitychange',visibility);
  texture.dispose();poster?.dispose();material.dispose();metal.dispose();group.traverse(o=>o.geometry?.dispose());group.removeFromParent();
 }};
}
