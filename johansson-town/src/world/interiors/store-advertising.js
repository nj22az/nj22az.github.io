import * as THREE from '../../../vendor/three.module.js';
import {assetURL} from '../../assets.js';
import {STORE_BRANDS} from '../../commerce/brands.js';
import {STORE_ITEMS} from '../../commerce/catalogue.js';

export const POSTER_SPECS=Object.freeze([
 {id:'tea',file:'nagi-tea.webp',title:'NAGI · お茶のひととき',position:[-6.325,2.02,1.3],yaw:Math.PI/2,approach:[-5.15,1.55,1.3]},
 {id:'coffee',file:'port88-coffee.webp',title:'PORT 88 · 港の朝に、一杯。',position:[-6.325,2.02,3.8],yaw:Math.PI/2,approach:[-5.15,1.55,3.8]},
 {id:'biscuit',file:'komorebi-biscuits.webp',title:'KOMOREBI · 午後のおともに。',position:[6.325,2.02,2.8],yaw:-Math.PI/2,approach:[5.1,1.55,2.8]},
]);
const COLS=4,ROWS=8,TW=256,TH=128;
const brandKeys=Object.keys(STORE_BRANDS),slots=new Map(brandKeys.map((id,i)=>[id,i]));
const priceSlot=id=>brandKeys.length+STORE_ITEMS.findIndex(item=>item.id===id);
const posterGeometry=new THREE.PlaneGeometry(1.06,1.59);
let labelMaterial=null;const posterMaterials=new Map();

function emblem(ctx,kind,x,y,r,color){
 ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=2.5;
 if(kind==='leaf'){
  for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(side*r*.32,0,r*.38,r*.82,side*.6,0,Math.PI*2);ctx.fill();}
 }else if(kind==='gull'){
  ctx.beginPath();ctx.moveTo(-r,r*.25);ctx.quadraticCurveTo(-r*.45,-r*.55,0,r*.02);ctx.quadraticCurveTo(r*.45,-r*.55,r,r*.25);ctx.stroke();
 }else if(kind==='wave'){
  for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(-r,k*5);ctx.bezierCurveTo(-r*.3,k*5-6,r*.3,k*5+6,r,k*5);ctx.stroke();}
 }else if(kind==='rice'){
  ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r,r*.8);ctx.lineTo(-r,r*.8);ctx.closePath();ctx.fill();
 }else if(kind==='flower'){
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.arc(Math.cos(a)*r*.5,Math.sin(a)*r*.5,r*.42,0,Math.PI*2);ctx.fill();}
 }else if(kind==='star'){
  ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.43:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();
 }else{
  ctx.beginPath();ctx.arc(0,0,r*.5,0,Math.PI*2);ctx.fill();
  for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.65,Math.sin(a)*r*.65);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}
 }
 ctx.restore();
}
export function createLabelAtlas(){
 const canvas=document.createElement('canvas');canvas.width=COLS*TW;canvas.height=ROWS*TH;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#f0e5ca';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(const [id,index] of slots){
  const b=STORE_BRANDS[id],x=index%COLS*TW,y=Math.floor(index/COLS)*TH;
  ctx.save();ctx.translate(x,y);ctx.fillStyle=b.paper;ctx.fillRect(0,0,TW,TH);
  ctx.strokeStyle=b.ink;ctx.lineWidth=2;ctx.strokeRect(6,6,TW-12,TH-12);
  ctx.fillStyle=b.accent;ctx.fillRect(8,90,TW-16,30);
  emblem(ctx,b.symbol,25,31,12,b.ink);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=b.ink;
  ctx.font=`${id==='coffee'?'italic ':''}bold ${b.name.length>8?26:34}px Georgia,serif`;
  ctx.fillText(b.name,143,34,194);ctx.font='bold 23px serif';ctx.fillText(b.jp,128,70,228);
  ctx.fillStyle=['water','cola','biscuit','buns','milk'].includes(id)?b.ink:'#fff2d4';
  ctx.font='bold 16px sans-serif';ctx.fillText(b.line,128,105,226);ctx.restore();
 }
 for(const item of STORE_ITEMS){
  const index=priceSlot(item.id),x=index%COLS*TW,y=Math.floor(index/COLS)*TH,b=STORE_BRANDS[item.id];
  ctx.save();ctx.translate(x,y);ctx.fillStyle='#fff4d9';ctx.fillRect(0,0,TW,TH);ctx.fillStyle='#b63831';ctx.fillRect(0,0,TW,8);
  ctx.textAlign='left';ctx.fillStyle='#41362a';ctx.font='bold 23px serif';ctx.fillText(b.name,10,37,236);
  ctx.font='17px sans-serif';ctx.fillText(item.jp,10,63,236);ctx.textAlign='right';ctx.fillStyle='#a62e28';ctx.font='bold 45px sans-serif';ctx.fillText('¥'+item.cost,244,112,230);ctx.restore();
 }
 return canvas;
}
function getLabelMaterial(){
 if(!labelMaterial){const texture=new THREE.CanvasTexture(createLabelAtlas());texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
  labelMaterial=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});labelMaterial.name='Sakura fictional packaging atlas';}
 return labelMaterial;
}
function fallbackPoster(id){
 const b=STORE_BRANDS[id],c=document.createElement('canvas');c.width=256;c.height=384;const x=c.getContext('2d');
 x.fillStyle=b.paper;x.fillRect(0,0,256,384);x.fillStyle=b.ink;x.textAlign='center';x.font='bold 36px serif';x.fillText(b.name,128,78,235);
 emblem(x,b.symbol,128,185,55,b.ink);x.font='bold 28px serif';x.fillText(b.line,128,288,230);x.font='20px serif';x.fillText('さくら商店',128,350);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function getPosterMaterial(spec){
 if(!posterMaterials.has(spec.id)){
  const material=new THREE.MeshBasicMaterial({map:fallbackPoster(spec.id),toneMapped:false});
  material.name='Sakura advertisement '+spec.id;posterMaterials.set(spec.id,material);
  new THREE.TextureLoader().load(assetURL('graphics/konbini/'+spec.file),texture=>{
   texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;
   const placeholder=material.map;material.map=texture;material.needsUpdate=true;placeholder.dispose();
  },undefined,()=>{console.warn('Sakura poster unavailable: '+spec.file+'; retaining the printed brand panel.');});
 }
 return posterMaterials.get(spec.id);
}

// One static textured draw for all shelf labels and curved bottle/can wrappers.
// Each room owns its geometry; material/texture caches survive room changes.
export function createStoreAdvertising({room,reg,action}){
 const positions=[],normals=[],uvs=[],indices=[];let count=0;const labels=[];
 function append(geometry,pos,yaw,slot){
  const matrix=new THREE.Matrix4().makeRotationY(yaw);matrix.setPosition(...pos);geometry.applyMatrix4(matrix);
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv,offset=positions.length/3;
  for(let i=0;i<p.count;i++){
   positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));
   // Pixel gutters avoid sampling neighbouring labels through the mip chain.
   uvs.push((slot%COLS+(2+uv.getX(i)*(TW-4))/TW)/COLS,1-(Math.floor(slot/COLS)+(2+(1-uv.getY(i))*(TH-4))/TH)/ROWS);
  }
  for(const i of geometry.index.array)indices.push(offset+i);geometry.dispose();count++;
 }
 function label(id,pos,width,height,{yaw=0,radius=null,price=false}={}){
  const slot=price?priceSlot(id):slots.get(id);if(slot==null||slot<0)throw Error('Unknown Sakura label: '+id);
  const g=radius?new THREE.CylinderGeometry(radius,radius,height,16,1,true,-1.3,2.6):new THREE.PlaneGeometry(width,height);
  append(g,pos,yaw,slot);labels.push({id,price,position:[...pos],width,height});
 }
 function finish(){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeBoundingSphere();
  const mesh=new THREE.Mesh(geometry,getLabelMaterial());mesh.name='Sakura branded packaging and shelf prices';
  // clearRoom disposes owned geometry but must preserve this shared material.
  mesh.userData.preserveMaterial=true;mesh.userData.labelCount=count;mesh.userData.labels=labels;room.add(mesh);
  const posterGroup=new THREE.Group();posterGroup.name='Sakura Showa advertisements';posterGroup.userData.sharedAsset=true;
  // The small paper meshes also persist with the cached materials.
  for(const spec of POSTER_SPECS){
   const poster=new THREE.Mesh(posterGeometry,getPosterMaterial(spec));poster.name=spec.title;poster.position.set(...spec.position);poster.rotation.y=spec.yaw;posterGroup.add(poster);
   const target=new THREE.Object3D();target.position.set(...spec.approach);target.name='Read '+spec.title;room.add(target);
   const item=STORE_ITEMS.find(i=>i.id===spec.id);
   reg(target,target.name,()=>action('inspect',spec.title,STORE_BRANDS[spec.id].line+' · '+item.name+' · ¥'+item.cost+'\nAvailable here at Sakura. '+item.text),true);
  }
  room.add(posterGroup);return {mesh,posters:posterGroup,labels};
 }
 return {label,finish};
}
