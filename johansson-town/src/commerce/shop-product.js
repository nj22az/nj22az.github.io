import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {getLabelMaterial,packagingSlot,ATLAS_COLS,ATLAS_ROWS} from '../world/interiors/store-advertising.js';
import {STORE_BRANDS} from './brands.js';
const templates=new Map(),bodyMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.62});
export function shopProductTemplate(id){
 if(templates.has(id))return templates.get(id);
 const parts=[],labels=[],brand=STORE_BRANDS[id==='bun'?'buns':id]||STORE_BRANDS.stock;
 const part=(g,color,pos=[0,0,0])=>{g.translate(...pos);const c=new THREE.Color(color),a=new Float32Array(g.attributes.position.count*3);for(let i=0;i<a.length;i+=3)a.set(c.toArray(),i);g.setAttribute('color',new THREE.BufferAttribute(a,3));parts.push(g);};
 const box=(w,h,d,y,color)=>part(new THREE.BoxGeometry(w,h,d),color,[0,y,0]);
 const cyl=(r,h,y,color,rb=r)=>part(new THREE.CylinderGeometry(r,rb,h,20),color,[0,y,0]);
 const label=(g,y,z=0)=>{g.translate(0,y,z);const slot=packagingSlot(id),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(slot%ATLAS_COLS+.025+uv.getX(i)*.95)/ATLAS_COLS,1-(Math.floor(slot/ATLAS_COLS)+.025+(1-uv.getY(i))*.95)/ATLAS_ROWS);labels.push(g);};
 const fronts=(w,h,d,y)=>{label(new THREE.PlaneGeometry(w,h),y,d/2+.001);label(new THREE.PlaneGeometry(w,h).rotateY(Math.PI),y,-d/2-.001);};
 if(['tea','water','cola','orange','soy','soda'].includes(id)){
  const color=({tea:0x657d3c,water:0xafd5d4,cola:0x443126,orange:0xe6a038,soy:0x392d23,soda:0xafd6da})[id],r=id==='soda'?.037:.046;
  cyl(r,.16,.08,color);cyl(.023,.035,.1775,color,r);cyl(.023,.05,.22,color);cyl(.025,.018,.254,brand.ink);
  if(id==='soda'){cyl(.031,.026,.185,0xc4e1dc,.034);cyl(.025,.012,.245,0xe9e8d8);}
  label(new THREE.CylinderGeometry(r+.001,r+.001,.123,20,1,true,-Math.PI*.76,Math.PI*1.52),.085);
 }else if(['coffee','beer','tuna','peaches'].includes(id)){
  const r=id==='tuna'?.051:id==='peaches'?.053:.047,h=id==='tuna'?.046:id==='peaches'?.095:.135;
  cyl(r,h,h/2,brand.paper);cyl(r+.0015,.004,.004,0xa8b3ad);cyl(r+.0015,.004,h,0xcad0c8);
  part(new THREE.TorusGeometry(r*.79,.0014,4,20).rotateX(Math.PI/2),0x88958c,[0,h+.002,0]);
  label(new THREE.CylinderGeometry(r+.001,r+.001,h*.87,20,1,true,-Math.PI*.8,Math.PI*1.6),h/2);
 }else if(['noodles','yogurt'].includes(id)){
  const yogurt=id==='yogurt',r=yogurt?.048:.068,h=yogurt?.078:.13;
  cyl(r,h,h/2,brand.paper,r*.76);cyl(r+.003,.005,h+.002,brand.ink);
  label(new THREE.CylinderGeometry(r+.001,r*.76+.001,h*.9,20,1,true,-Math.PI*.7,Math.PI*1.4),h/2);
 }else if(id.startsWith('magazine')){
  const w=.21,h=.245,d=.013;box(w,h,d,h/2,brand.paper);fronts(w*.97,h*.95,d,h/2);
 }else if(id==='newspaper'){
  const w=.285,h=.021,d=.205;box(w,h,d,h/2,brand.paper);
  label(new THREE.PlaneGeometry(w*.95,d*.95).rotateX(-Math.PI/2),h+.001);
 }else if(id==='milk'){
  box(.093,.177,.093,.0885,brand.paper);
  part(new THREE.CylinderGeometry(0,.066,.055,4).rotateY(Math.PI/4),brand.paper,[0,.2045,0]);box(.082,.013,.006,.237,brand.ink);fronts(.086,.157,.093,.09);
 }else if(['chips','crackers','candy','bread','bun','rice'].includes(id)){
  const bread=id==='bread',small=id==='rice'||id==='bun',w=small?.15:bread?.19:.16,h=small?.12:bread?.235:.22,d=small?.09:bread?.12:.07;
  const g=new THREE.BoxGeometry(w,h,d,1,4,1),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const t=Math.abs(p.getY(i))/(h/2);p.setX(i,p.getX(i)*(1-.08*t));p.setZ(i,p.getZ(i)*(1-.60*t**4));}g.computeVertexNormals();part(g,brand.paper,[0,h/2,0]);
  box(w*.90,.009,d*.42,h-.002,brand.accent);box(w*.90,.009,d*.42,.004,brand.accent);fronts(w*.88,h*.72,d,h/2);
 }else{
  const [w,h,d]=id==='stock'?[.32,.22,.25]:id==='biscuit'?[.18,.22,.075]:id==='detergent'?[.18,.255,.095]:id==='tissues'?[.22,.075,.11]:id==='toothpaste'?[.205,.05,.045]:id==='curry'?[.16,.13,.045]:id==='soup'?[.14,.17,.05]:id==='chocolate'?[.17,.10,.018]:id==='battery'?[.105,.15,.03]:id==='soap'?[.14,.08,.07]:[.15,.18,.025];
  box(w,h,d,h/2,brand.paper);fronts(w*.95,h*.89,d,h*.5);
  if(['notebook','postcard'].includes(id))box(w*.92,.004,d+.001,h*.92,0xeee8d7);
  if(id==='tissues')box(.105,.002,.018,h+.001,0xf9f7ec);
 }
 const body=mergeGeometries(parts),art=mergeGeometries(labels);[...parts,...labels].forEach(g=>g.dispose());body.computeBoundingBox();art.computeBoundingBox();
 const bounds=body.boundingBox.clone().union(art.boundingBox),result={body,art,bounds};templates.set(id,result);return result;
}
export function createShopProduct(id){const t=shopProductTemplate(id),group=new THREE.Group();group.name='Branded '+id;group.userData.sharedAsset=true;group.add(new THREE.Mesh(t.body,bodyMaterial),new THREE.Mesh(t.art,getLabelMaterial()));return group;}
export function shopProductMaterials(){return [bodyMaterial,getLabelMaterial()];}
