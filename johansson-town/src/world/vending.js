import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {assetURL} from '../assets.js';
import {VENDING_AD,VENDING_PRODUCTS} from '../commerce/vending-catalogue.js';

let template;
// Source colours are baked into one opaque mesh. Omit the source glass so the
// small display stays clear on phones and adds no transparency sorting cost.
export function prepareVendingModel(source){
  source.updateMatrixWorld(true);
  const parts=[];
  source.traverse(node=>{
    if(!node.isMesh||node.material.transparent)return;
    const geometry=node.geometry.clone().applyMatrix4(node.matrixWorld);
    for(const key of Object.keys(geometry.attributes))if(!['position','normal'].includes(key))geometry.deleteAttribute(key);
    if(!geometry.attributes.normal)geometry.computeVertexNormals();
    const colors=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)node.material.color.toArray(colors,i);
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(geometry);
  });
  if(!parts.length)throw new Error('Vending model has no opaque geometry');
  const geometry=mergeGeometries(parts,false);parts.forEach(part=>part.dispose());
  geometry.rotateY(Math.PI);geometry.computeBoundingBox();
  const bounds=geometry.boundingBox,center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
  const scale=Math.min(1.3/size.x,2.25/size.y,1/size.z);
  geometry.translate(-center.x,-bounds.min.y,-center.z);geometry.scale(scale,scale,scale);
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.68,metalness:.16}));
}
export async function preloadVending(){
  try{const gltf=await new GLTFLoader().loadAsync(assetURL('models/props/vending-machine.glb'));template=prepareVendingModel(gltf.scene);gltf.scene.traverse(node=>{if(node.isMesh){node.geometry.dispose();node.material.dispose();}});}
  catch(error){console.warn('Vending model unavailable; using local fallback.',error);}
}
function panel(width,height,position,paint){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const ctx=canvas.getContext('2d');paint(ctx,canvas.width,canvas.height);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:texture}));
  mesh.position.set(...position);return mesh;
}
export function createVendingMachine({shadows=false}={}){
  const group=new THREE.Group();group.name='Harbour vending machine';
  const machine=template?template.clone():new THREE.Mesh(new THREE.BoxGeometry(1.1,2.1,.8).translate(0,1.05,0),new THREE.MeshStandardMaterial({color:0x963b31,roughness:.65}));
  machine.castShadow=shadows;machine.receiveShadow=true;group.add(machine);
  group.add(panel(1.02,.27,[0,1.99,.43],(ctx,w,h)=>{
    ctx.fillStyle=VENDING_AD.background;ctx.fillRect(0,0,w,h);ctx.fillStyle=VENDING_AD.foreground;ctx.textAlign='center';
    ctx.font='bold 116px sans-serif';ctx.fillText(VENDING_AD.brand,w/2,190);ctx.font='58px sans-serif';ctx.fillText(VENDING_AD.tagline,w/2,340);
  }));
  group.add(panel(.9,.36,[0,.35,.43],(ctx,w,h)=>{
    ctx.fillStyle='#efe6cf';ctx.fillRect(0,0,w,h);ctx.textAlign='center';
    VENDING_PRODUCTS.forEach((product,i)=>{
      const x=(i+.5)*w/2;ctx.fillStyle=product.color;ctx.fillRect(x-65,35,130,185);
      ctx.fillStyle='#fff8e8';ctx.font='bold 54px sans-serif';ctx.fillText(product.mark,x,140);
      ctx.fillStyle='#202c2a';ctx.font='bold 42px sans-serif';ctx.fillText(product.brand,x,300);
      ctx.font='36px sans-serif';ctx.fillText(product.subtitle,x,365);ctx.fillText(`¥${product.price}`,x,440);
    });
  }));
  return group;
}
