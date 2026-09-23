import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {registerDetail} from './detail-stream.js';

/**
 * Umi-no-yu, the town's hot spring, on the flat of the east lawn below the park mound.
 *
 * The bathhouse faces the town with the footbath out front where anybody crossing the
 * park can sit and put their feet in; the rock bath is behind it inside a bamboo fence
 * that is kept low on the sea side, so from the water you look out over the seawall.
 * The building is a Blender model (tools/blender/build-park-onsen.py), authored facing
 * +Z; here it is turned so that +Z is west.
 *
 * Collision and prompts are in place from the start and the model streams in when you
 * come near, the way every other building here does: loading a model never moves a
 * wall. The noren, the signs and the steam are made here; the noren and the name
 * board go up with the building.
 */
export const ONSEN=Object.freeze({x:24.5,z:4.5,yaw:-Math.PI/2,opens:600,closes:1320,fee:300});

/** A point in the model's own frame, in the town's. */
export function onsenPoint(x,z){
 const c=Math.cos(ONSEN.yaw),s=Math.sin(ONSEN.yaw);
 return [ONSEN.x+x*c+z*s,ONSEN.z-x*s+z*c];
}
/** A rectangle in the model's frame; a quarter turn swaps its width and depth. */
function rect(x,z,w,d,height){const [wx,wz]=onsenPoint(x,z);return {id:'park-onsen',x:wx,z:wz,w:d,d:w,height};}

/** The model's own colliders: bathhouse, fenced bath, porch posts, fridge, bench, footbath. */
export const ONSEN_COLLIDERS=Object.freeze([
 rect(0,2.1,7.6,4.6,3.3),
 rect(0,-3.65,7.6,6.9,1.9),
 rect(-2.4,5.2,.22,.22,2.6),rect(-.4,5.2,.22,.22,2.6),
 rect(-3.0,4.65,.66,.54,1.25),
 rect(1.7,4.82,1.9,.44,.45),
 rect(1.9,7.1,3.0,1.4,.5),
 ...[[.15,6.15],[3.65,6.15],[.15,8.05],[3.65,8.05]].map(([x,z])=>rect(x,z,.2,.2,2.4)),
 rect(-2.9,6.6,.16,.16,1.8),
]);

export const onsenOpen=minutes=>{const m=((minutes%1440)+1440)%1440;return m>=ONSEN.opens&&m<ONSEN.closes;};

function canvasTexture(width,height,draw){
 const c=document.createElement('canvas');c.width=width;c.height=height;draw(c.getContext('2d'),width,height);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
const SERIF='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';

/** The indigo noren over the door, split in three, with ゆ across the middle. */
function noren(){
 const group=new THREE.Group();group.name='Umi-no-yu noren';
 const map=canvasTexture(384,256,(ctx,w,h)=>{
  ctx.fillStyle='#253a5e';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#f3efe4';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`bold 150px ${SERIF}`;ctx.fillText('ゆ',w/2,h*.55);
  ctx.font=`bold 30px ${SERIF}`;ctx.fillText('♨',w*.17,h*.2);ctx.fillText('♨',w*.83,h*.2);
 });
 const material=new THREE.MeshStandardMaterial({map,roughness:.9,side:THREE.DoubleSide});
 for(let k=0;k<3;k++){
  const geometry=new THREE.PlaneGeometry(.56,.72),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setX(i,(k+uv.getX(i))/3);
  const panel=new THREE.Mesh(geometry,material);panel.position.set(-1.96+k*.57,2.08,4.36);panel.rotation.x=.03;
  panel.name='Umi-no-yu noren';group.add(panel);
 }
 return group;
}

function signs(group){
 const board=canvasTexture(512,140,(ctx,w,h)=>{
  ctx.fillStyle='#3a2a1c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#c9a86a';ctx.lineWidth=5;ctx.strokeRect(8,8,w-16,h-16);
  ctx.fillStyle='#f1e2bd';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`bold 74px ${SERIF}`;ctx.fillText('♨ 海の湯',w/2,h*.44);
  ctx.font='bold 20px sans-serif';ctx.fillText('UMI-NO-YU · HOT SPRING',w/2,h*.82);
 });
 const kanban=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.41),new THREE.MeshStandardMaterial({map:board,roughness:.8}));
 kanban.position.set(-1.4,2.68,4.3);kanban.name='Umi-no-yu sign';
 // The notice by the path: hours, fee, and what is in the water.
 const notice=canvasTexture(256,320,(ctx,w,h)=>{
  ctx.fillStyle='#efe6cf';ctx.fillRect(0,0,w,h);ctx.fillStyle='#2b2520';ctx.textAlign='center';
  ctx.font=`bold 34px ${SERIF}`;ctx.fillText('海の湯',w/2,44);
  ctx.font='16px sans-serif';
  ['Harbour hot spring','','Bath 10:00 – 22:00','Adults ¥300 · Children ¥150','Footbath: free, any hour','','Sodium chloride spring','42°C at the spout','Towel ¥100 at the desk'].forEach((line,i)=>ctx.fillText(line,w/2,82+i*24));
  ctx.fillStyle='#b3382c';ctx.font='bold 15px sans-serif';ctx.fillText('Please wash before you bathe',w/2,h-18);
 });
 const post=new THREE.Mesh(new THREE.BoxGeometry(.08,1.6,.08),new THREE.MeshStandardMaterial({color:0x43301f,roughness:.85}));
 post.position.set(-2.9,.8,6.6);group.add(post);
 const face=new THREE.Mesh(new THREE.BoxGeometry(.62,.78,.04),[...Array(4).fill(new THREE.MeshStandardMaterial({color:0x43301f,roughness:.85})),
  new THREE.MeshStandardMaterial({map:notice,roughness:.85}),new THREE.MeshStandardMaterial({color:0x43301f,roughness:.85})]);
 face.position.set(-2.9,1.35,6.65);face.name='Umi-no-yu notice';group.add(face);
 const cap=new THREE.Mesh(new THREE.BoxGeometry(.78,.05,.2),new THREE.MeshStandardMaterial({color:0x4c5660,roughness:.6}));
 cap.position.set(-2.9,1.77,6.66);cap.rotation.x=-.15;group.add(cap);
 return {notice:face,kanban};
}

/** Soft rising steam: one draw per source, drifting up and thinning as it goes. */
function steam(group){
 const soft=canvasTexture(64,64,(ctx,w,h)=>{
  const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 });
 soft.colorSpace=THREE.NoColorSpace;
 const sources=[
  {count:26,centre:[.2,-3.9],spread:[2.0,1.5],base:.45,rise:2.4,size:1.7,opacity:.22},
  {count:10,centre:[1.9,7.1],spread:[1.1,.35],base:.35,rise:1.3,size:1.0,opacity:.2},
  {count:6,centre:[0,2.1],spread:[.9,.25],base:4.9,rise:1.6,size:1.5,opacity:.14},
 ];
 return sources.map(src=>{
  const seeds=Array.from({length:src.count},()=>[Math.random()*2-1,Math.random()*2-1,Math.random(),.6+Math.random()*.6]);
  const positions=new Float32Array(src.count*3),geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const points=new THREE.Points(geometry,new THREE.PointsMaterial({map:soft,size:src.size,sizeAttenuation:true,transparent:true,opacity:src.opacity,depthWrite:false,color:0xf4f1ea}));
  points.name='Umi-no-yu steam';points.frustumCulled=false;points.renderOrder=3;group.add(points);
  return {src,seeds,positions,geometry,points};
 });
}

/**
 * @param {object} world the town world (group, colliders, details)
 * @param {object} options register / onAction as the other buildings take them
 */
export function buildParkOnsen(world,{register,onAction,enter,sites,shadows=false}={}){
 const group=new THREE.Group();group.name='Umi-no-yu';group.position.set(ONSEN.x,0,ONSEN.z);group.rotation.y=ONSEN.yaw;world.group.add(group);
 world.colliders.push(...ONSEN_COLLIDERS.map(c=>({...c})));
 // The noren and the name board hang on the bathhouse, so they arrive with it.
 const {notice,kanban}=signs(group),curtain=noren(),plumes=steam(group);
 const anchor=(x,y,z,label,fn)=>{const o=new THREE.Object3D();o.position.set(x,y,z);group.add(o);register?.(o,label,fn);return o;};
 // Through the noren: the bathhouse is a room you walk into (interiors/onsen.js).
 const [doorX,doorZ]=onsenPoint(-1.4,4.5),[outX,outZ]=onsenPoint(-1.4,5.4);
 const site={id:'onsen',title:'Umi-no-yu',jp:'海の湯',sub:'HOT SPRING · FAMILY BATH',x:doorX,z:doorZ,color:0x3f5f7a,accent:'#253a5e',
  line:'Bath 10:00–22:00 · adults ¥300 · swimwear please',door:[doorX,0,doorZ],exitPosition:[outX,0,outZ],approachPosition:[outX,0,outZ],
  entryFacing:ONSEN.yaw,opens:'10:00'};
 sites?.push(site);
 anchor(-1.4,1.2,4.75,'Go into Umi-no-yu',()=>enter?enter(site):onAction?.('onsen'));
 register?.(notice,'Read the onsen notice',()=>onAction?.('read','Umi-no-yu notice',
  'Harbour hot spring. Bath 10:00–22:00, adults ¥300. The footbath is free and never closes. Sodium chloride spring, 42°C at the spout — good for cold hands and long shifts on the quay. Please wash before you bathe.'));
 // Sit on the footbath's rim with your feet in the water, looking across it.
 const [sx,sz]=onsenPoint(1.9,7.72),[tx,tz]=onsenPoint(1.9,8.5);
 const soak=anchor(1.9,.8,7.9,'Soak your feet in the footbath',()=>onAction?.('seat','Umi-no-yu footbath',
  'You slip off your shoes and put your feet in. It is hotter than you expect, then exactly right. Somebody has left a folded towel on the rim.'));
 soak.userData.seat={position:[sx,0,sz],stand:[tx,0,tz],eyeY:1.15,yaw:ONSEN.yaw,pitch:-.22};
 const [bx,bz]=onsenPoint(1.7,4.9),[bsx,bsz]=onsenPoint(1.7,5.5);
 const bench=anchor(1.7,.8,5.1,'Cool off on the bench',()=>onAction?.('seat','Umi-no-yu bench','The bench under the bathhouse windows, for sitting out the heat afterwards. The sea wind finds you here.'));
 bench.userData.seat={position:[bx,0,bz],stand:[bsx,0,bsz],eyeY:1.1,yaw:ONSEN.yaw+Math.PI,pitch:0};

 let model=null;
 registerDetail(world,{id:'park-onsen',x:ONSEN.x,z:ONSEN.z,radius:72,load:async()=>{
  const response=await fetch(assetURL('models/onsen/umi-no-yu.glb'));if(!response.ok)return false;
  const scene=(await new GLTFLoader().parseAsync(await response.arrayBuffer(),'')).scene;
  scene.name='Umi-no-yu bathhouse';scene.userData.sharedAsset=true;
  scene.traverse(o=>{if(o.isMesh){o.castShadow=!!shadows&&!o.material.transparent;o.receiveShadow=!!shadows;
   // The model's glass and water are its only see-through surfaces; drawn after the rest.
   if(o.material.transparent){o.material.depthWrite=false;o.renderOrder=2;}}});
  group.add(scene,kanban,curtain);model=scene;return true;
 }});

 function tick(time){
  for(const {src,seeds,positions,geometry} of plumes){
   for(let i=0;i<seeds.length;i++){
    const [ox,oz,phase,speed]=seeds[i],t=(time*.12*speed+phase)%1;
    positions[i*3]=src.centre[0]+ox*src.spread[0]+Math.sin(time*.4+i)*.15*t;
    positions[i*3+1]=src.base+t*src.rise;
    positions[i*3+2]=src.centre[1]+oz*src.spread[1]+t*.35;
   }
   geometry.attributes.position.needsUpdate=true;
  }
 }
 tick(0);
 return {group,tick,get model(){return model;}};
}
