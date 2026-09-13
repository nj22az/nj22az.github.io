import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {getLabelMaterial} from '../world/interiors/store-advertising.js';
import {STORE_BRANDS} from './brands.js';
const templates=new Map(),bodyMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82});
const atlasOrder=['tea','coffee','rice','biscuit','soap','notebook','postcard','battery','cola','water','beer','noodles','milk','stock','bun'];
export function shopProductTemplate(id){
 if(templates.has(id))return templates.get(id);const parts=[],labels=[],brand=STORE_BRANDS[id==='bun'?'buns':id]||STORE_BRANDS.stock;
 const part=(g,color,pos=[0,0,0])=>{g.translate(...pos);const c=new THREE.Color(color),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3)a.set(c.toArray(),i);g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);};
 const box=(w,h,d,y,color)=>part(new THREE.BoxGeometry(w,h,d),color,[0,y,0]);
 const cyl=(r,h,y,color)=>part(new THREE.CylinderGeometry(r,r,h,16),color,[0,y,0]);
 const label=(g,y,z=0)=>{g.translate(0,y,z);const slot=atlasOrder.indexOf(id),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(slot%4+.025+uv.getX(i)*.95)/4,1-(Math.floor(slot/4)+.025+(1-uv.getY(i))*.95)/8);labels.push(g);};
 if(['tea','water','cola'].includes(id)){
  cyl(.049,.19,.095,brand.accent);cyl(.025,.065,.22,brand.ink);cyl(.026,.02,.26,brand.ink);label(new THREE.CylinderGeometry(.050,.050,.13,16,1,true,-Math.PI*.7,Math.PI*1.4),.105);
 }else if(['coffee','beer'].includes(id)){
  cyl(.048,.135,.0675,brand.paper);cyl(.049,.01,.136,0xc6c9c2);label(new THREE.CylinderGeometry(.049,.049,.11,16,1,true,-Math.PI*.75,Math.PI*1.5),.07);
 }else if(id==='noodles'){
  cyl(.068,.13,.065,brand.paper);cyl(.071,.009,.133,brand.ink);label(new THREE.CylinderGeometry(.069,.069,.105,16,1,true,-Math.PI*.7,Math.PI*1.4),.07);
 }else{
  const [w,h,d]=id==='stock'?[.32,.22,.25]:id==='biscuit'?[.18,.22,.07]:id==='milk'?[.09,.20,.09]:id==='rice'||id==='bun'?[.16,.13,.10]:id==='battery'?[.105,.15,.03]:id==='soap'?[.14,.08,.07]:[.15,.18,.025];
  box(w,h,d,h/2,brand.paper);label(new THREE.PlaneGeometry(w*.94,h*.87),h*.52,d/2+.001);label(new THREE.PlaneGeometry(w*.94,h*.87).rotateY(Math.PI),h*.52,-d/2-.001);
 }
 const body=mergeGeometries(parts),art=mergeGeometries(labels);[...parts,...labels].forEach(g=>g.dispose());const result={body,art};templates.set(id,result);return result;
}
export function createShopProduct(id){const t=shopProductTemplate(id),group=new THREE.Group();group.name='Branded '+id;group.userData.sharedAsset=true;group.add(new THREE.Mesh(t.body,bodyMaterial),new THREE.Mesh(t.art,getLabelMaterial()));return group;}
export function shopProductMaterials(){return [bodyMaterial,getLabelMaterial()];}
