import * as THREE from '../../../vendor/three.module.js';
import {STORE_BRANDS} from '../../commerce/brands.js';
import {SAKURA_AGE_SIGN,SAKURA_FRIDGE_BACKING,SAKURA_STANDEE,SAKURA_TAPE} from './sakura-layout.js';

/**
 * Linger dressing for Sakura: the packed-fridge, red-tape, お惣菜-board feeling
 * from the Konbini lab, redrawn in the town's 1988 cream-and-vermillion ink.
 *
 * No PointLights. Extra lights add cel ramp bands (see dusk.js). Facings are
 * MeshBasicMaterial canvases so they read through the window at night-security
 * dim without a second light pass.
 */
function canvas(w,h,draw){
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const ctx=c.getContext('2d');draw(ctx,w,h);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;
 return tex;
}
function round(ctx,x,y,w,h,r){
 ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
 ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}

export function standeeTexture(){
 return canvas(768,1600,(ctx,w,h)=>{
  ctx.fillStyle='#a6333c';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#f6e8bb';ctx.fillRect(28,28,w-56,h-56);
  ctx.fillStyle='#a6333c';ctx.fillRect(28,28,w-56,168);
  ctx.fillStyle='#f6e8bb';ctx.textAlign='center';ctx.font='700 72px serif';
  ctx.fillText('桜商店',w/2,118);
  ctx.font='600 28px sans-serif';ctx.fillText('SAKURA SHŌTEN  ·  本日のおすすめ',w/2,168);
  ctx.fillStyle='#7a2a30';ctx.font='900 168px serif';ctx.fillText('お惣菜',w/2,390);
  ctx.fillStyle='#a6333c';ctx.font='700 36px sans-serif';ctx.fillText('ほかほか肉まん',w/2,470);
  const foods=['#d3934c','#ba3d39','#e8d7a8','#738c43'];
  foods.forEach((color,i)=>{
   const x=90+(i%2)*300,y=520+Math.floor(i/2)*170;
   ctx.fillStyle='#fff8e4';round(ctx,x,y,270,140,14);ctx.fill();
   ctx.fillStyle=color;round(ctx,x+16,y+16,238,108,10);ctx.fill();
  });
  ctx.fillStyle='#41362a';ctx.font='700 40px serif';ctx.fillText('2個で',w/2,920);
  ctx.fillStyle='#a6333c';ctx.font='900 140px serif';ctx.fillText('50円引き',w/2,1060);
  ctx.fillStyle='#41362a';ctx.font='700 40px serif';ctx.fillText('3個で',w/2,1180);
  ctx.fillStyle='#a6333c';ctx.font='900 140px serif';ctx.fillText('100円引き',w/2,1320);
  ctx.fillStyle='#7a2a30';ctx.font='600 32px sans-serif';ctx.fillText('温めます  ·  トゥアン',w/2,1480);
 });
}

export function ageSignTexture(){
 return canvas(640,360,(ctx,w,h)=>{
  ctx.fillStyle='#1a1a1a';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#f0c94a';ctx.fillRect(10,10,w-20,h-20);
  ctx.fillStyle='#1a1a1a';ctx.fillRect(20,20,w-40,h-40);
  ctx.fillStyle='#f0c94a';ctx.textAlign='center';ctx.font='700 36px sans-serif';
  ctx.fillText('20歳未満の方への',w/2,100);
  ctx.fillText('酒類の販売は',w/2,160);
  ctx.fillText('できません',w/2,220);
  ctx.font='600 22px sans-serif';ctx.fillStyle='#fff4c4';
  ctx.fillText('SAKURA  ·  ID CHECK',w/2,300);
 });
}

export function fridgeBackingTexture(){
 const columns=['coffee','tea','soda','milk','beer','cola','orange','yogurt'];
 return canvas(1024,512,(ctx,w,h)=>{
  ctx.fillStyle='#1a2420';ctx.fillRect(0,0,w,h);
  const colW=w/4;
  for(let col=0;col<4;col++){
   for(let row=0;row<5;row++){
    const id=columns[(col+row*2)%columns.length],b=STORE_BRANDS[id];
    const x=col*colW+18+ (row%2)*8,y=16+row*96,cw=colW-44,ch=88;
    ctx.fillStyle=b.paper;round(ctx,x,y,cw,ch,8);ctx.fill();
    ctx.strokeStyle=b.ink;ctx.lineWidth=2;round(ctx,x+4,y+4,cw-8,ch-8,6);ctx.stroke();
    ctx.fillStyle=b.ink;ctx.textAlign='center';ctx.font='700 22px serif';
    ctx.fillText(b.jp,x+cw/2,y+40,cw-16);
    ctx.font='600 14px sans-serif';ctx.fillText(b.line,x+cw/2,y+64,cw-16);
   }
  }
 });
}

export function dressSakuraLinger(room,anchor,action){
 const standee=SAKURA_STANDEE;
 const board=new THREE.Group();board.name='Sakura specials standee';board.position.set(standee.x,standee.h/2,standee.z);board.rotation.y=standee.yaw;
 board.userData.sharedAsset=true;room.add(board);
 const card=new THREE.Mesh(new THREE.BoxGeometry(standee.w,standee.h,standee.d),new THREE.MeshStandardMaterial({color:0xa6333c,roughness:.7}));
 board.add(card);
 const face=new THREE.MeshStandardMaterial({map:standeeTexture(),roughness:.45});
 for(const side of [1,-1]){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(standee.w-.02,standee.h-.02),face);
  m.position.z=side*(standee.d/2+.004);if(side<0)m.rotation.y=Math.PI;board.add(m);
 }
 const foot=new THREE.Mesh(new THREE.BoxGeometry(standee.w+.08,.03,.22),new THREE.MeshStandardMaterial({color:0x5a5044,roughness:.8}));
 foot.position.set(0,-standee.h/2+.015,0);board.add(foot);
 if(anchor)anchor([standee.x+.28,1.2,standee.z],'Read the specials board',()=>action('inspect','Sakura · お惣菜',
  'The red board Thuan put out this morning. Two steamed buns, fifty yen off. Three, a hundred. She will warm them if you ask at the till.'));

 const tapeMat=new THREE.MeshBasicMaterial({color:0xb84e45,toneMapped:false});
 for(const strip of SAKURA_TAPE){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(strip.w,strip.d),tapeMat);
  m.rotation.x=-Math.PI/2;m.position.set(strip.x,.004,strip.z);m.name='Sakura aisle tape '+strip.id;
  m.userData.sharedAsset=true;room.add(m);
 }

 const age=new THREE.Mesh(new THREE.PlaneGeometry(.78,.44),new THREE.MeshBasicMaterial({map:ageSignTexture(),toneMapped:false}));
 age.position.set(SAKURA_AGE_SIGN.x,SAKURA_AGE_SIGN.y,SAKURA_AGE_SIGN.z);age.name='Sakura age sign';
 age.userData.sharedAsset=true;room.add(age);
 if(anchor)anchor([SAKURA_AGE_SIGN.x,1.6,SAKURA_AGE_SIGN.z+.2],'Read the age restriction',()=>action('inspect','Sakura · 20歳未満',
  'The beer column. Thuan will not sell you a UMINEKO if you look like you still have homework.'));

 const back=SAKURA_FRIDGE_BACKING;
 const packed=new THREE.Mesh(new THREE.PlaneGeometry(back.w,back.h),new THREE.MeshBasicMaterial({map:fridgeBackingTexture(),toneMapped:false}));
 packed.position.set(back.x,back.y,back.z);packed.name='Sakura fridge facing';packed.userData.sharedAsset=true;room.add(packed);

 // Warm strip on the bun case — emissive mesh, not a light. Cel-safe.
 const glow=new THREE.Mesh(new THREE.BoxGeometry(.02,.9,.55),new THREE.MeshBasicMaterial({color:0xffc07a,toneMapped:false}));
 glow.position.set(-6.34,1.42,1.515);glow.name='Sakura bun warmer glow';glow.userData.sharedAsset=true;room.add(glow);
}
