import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
/** Weathered freight equipment, all kept off the dispatch, workshop and crew paths. */
export function addDocklandsDetail(world,group,{register,onAction}={}){
 const geos=new Map(),put=(geo,c)=>{if(!geos.has(c))geos.set(c,[]);geos.get(c).push(geo);};
 const box=(s,p,c)=>{const g=new THREE.BoxGeometry(...s);g.translate(...p);put(g,c);};
 const cylinder=(r,h,p,c)=>{const g=new THREE.CylinderGeometry(r,r,h,12);g.translate(...p);put(g,c);};
 const solid=(id,x,z,w,d,height)=>world.colliders.push({id,x,z,w,d,height});
 // Stacked cargo uses the existing container footprint, preserving the walking lane.
 box([4.6,2.15,2.4],[-33.5,3.24,-47.9],0x405c69);
 for(const y of [1.08,3.24])for(let i=0;i<20;i++){
  box([.045,1.98,.045],[-35.68+i*.228,y,-46.67],y<2?0x536b69:0x526f7a);
  const ry=.18+(i%5)*.29;box([.07,.20+(i%3)*.09,.008],[-35.63+i*.226,y-.65+ry,-46.64],0x8d6041);
 }
 // Moved east off the root of the timber pier, so the way onto it (and to Mr Fujita's shed) is open.
 solid('stacked-island-container',-33.5,-47.9,4.6,2.4,4.32);
 // Empty drums go back on the cargo boat. They wait against the Dock Electrical wall on the
 // hoist's side of the yard, south of the lane to the hoist; they used to stand at the root
 // of Mr Fujita's pier, where the way onto it was 1.2 m between them and the container.
 for(const [x,z] of [[-29.7,-42.1],[-29.7,-41.5],[-30.25,-41.8]]){
  cylinder(.26,.82,[x,.41,z],0x657779);for(const y of [.1,.72])cylinder(.275,.025,[x,y,z],0x424f50);
  for(let k=0;k<4;k++)box([.12,.15,.016],[x-.15+k*.09,.19+k%2*.33,z+.26],0x986341);
  solid('rusted-empty-drum',x,z,.56,.56,.85);
 }
 // A pallet with a box of net floats on it, beside the drum bay, against the same wall.
 const PX=-29.98,PZ=-40.55;
 for(let i=0;i<6;i++)box([.12,.045,.85],[PX-.45+i*.17,.12,PZ],0x897459);
 for(const dx of [-.3,.15])box([.11,.12,.85],[PX+dx,.06,PZ],0x594b3a);
 solid('dock-pallet-stack',PX,PZ,1.1,.9,.2);
 box([.85,.5,.6],[PX,.39,PZ],0x677d68);
 for(let i=0;i<6;i++){const g=new THREE.SphereGeometry(.08,8,4);g.translate(PX-.3+i*.11,.67,PZ);put(g,0xc39852);}
 // Drainage channels and tire scuffs lie flush with the concrete.
 for(const z of [-41.2,-43.2,-45.2])for(let i=0;i<10;i++)box([.025,.008,.32],[-28.7+i*.045,.012,z],0x4b5351);
 for(let i=0;i<5;i++)box([.035,.003,1.5],[-21.7+i*.14,.014,-45.2],0x62675e);
 // A mug, radio and manifest tray make the existing dispatch desk a workplace.
 box([.40,.035,.29],[-20.65,.94,-34.5],0xe8dfc2);box([.38,.012,.27],[-20.65,.967,-34.5],0xd3c7a3);
 box([.3,.18,.16],[-21.45,1.00,-34.5],0x3d4a44);cylinder(.045,.09,[-21.12,.98,-34.3],0xe8e4ce);
 for(const [c,list] of geos){const m=new THREE.Mesh(mergeGeometries(list,false),new THREE.MeshStandardMaterial({color:c,roughness:.94}));m.name='Weathered dock finish';m.receiveShadow=true;group.add(m);list.forEach(g=>g.dispose());}
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#cbbd92';ctx.fillRect(0,0,512,256);ctx.fillStyle='#354e54';ctx.font='bold 48px monospace';ctx.fillText('KITANO CARGO',30,70);ctx.font='25px monospace';ctx.fillText('JT-047 · ISLAND SUPPLIES',30,120);ctx.fillText('RICE / MAIL / REPAIR PARTS',30,160);ctx.fillText('RETURN EMPTY TO WEST QUAY',30,210);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;const label=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.8),new THREE.MeshStandardMaterial({map:t,roughness:1}));label.position.set(-33.5,2.65,-46.65);group.add(label);
 const a=new THREE.Object3D();a.position.set(-30.7,1,-41.2);group.add(a);register?.(a,'Inspect the cargo staging bay',()=>onAction?.('inspect','West quay cargo staging','The containers carry rice, shop stock, letters and electrical spares. Empty drums wait against the workshop wall for the hoist to swing them back aboard. Riku checks the load; Emi Kado keeps the manifest and the evening dispatch copies.'));
}
