import * as THREE from '../../../vendor/three.module.js';
import {GLTFLoader} from '../../../vendor/GLTFLoader.js';
import {assetURL} from '../../assets.js';
import {SHOP_STOCK} from '../../commerce/shop-stock.js';
import {shopProductTemplate,shopProductMaterials} from '../../commerce/shop-product.js';
import {createStoreAdvertising,getPosterMaterial} from './store-advertising.js';
import {createShopRefrigerator} from './shop-refrigerator.js';
import {SAKURA_LAYOUT,SAKURA_SHELVES,SHELF_ISLANDS,SHELF_SPAN,REMOVED_SHELVING} from './sakura-layout.js';
let model=null,pending=null;
// The middle gondola came out and the run that was left was split in two and turned a
// quarter turn (SHELF_ISLANDS in sakura-layout.js says where each half goes). The shop
// model batches every aisle into two merged meshes, so there is no object to move or
// hide: each half is lifted out as its own mesh over the same vertex buffer, and the
// shelving that went altogether is dropped the way the park drops its bushes, by
// leaving its triangles out of the index. Measured against the model, every box below
// holds whole triangles and cuts none of them, so nothing is left ragged.
const SHELF_MESHES=['sakura-shelf','sakura-shelf-ends'];
const within=(box,x,y,z)=>x>=box.minX&&x<=box.maxX&&y>=box.minY&&y<=box.maxY&&z>=box.minZ&&z<=box.maxZ;
export function rearrangeShelving(root){
 const counts={dropped:0};
 for(const name of SHELF_MESHES){
  const mesh=root.getObjectByName(name);if(!mesh)continue;
  const geometry=mesh.geometry,position=geometry.attributes.position;
  const indices=geometry.index?geometry.index.array:Array.from({length:position.count},(_,i)=>i);
  const kept=[],halves=Object.fromEntries(Object.keys(SHELF_ISLANDS).map(id=>[id,[]]));
  const at=i=>[position.getX(i),position.getY(i),position.getZ(i)];
  for(let i=0;i<indices.length;i+=3){
   const triangle=[indices[i],indices[i+1],indices[i+2]],corners=triangle.map(at);
   const holds=box=>corners.every(([x,y,z])=>within(box,x,y,z));
   const half=Object.keys(SHELF_ISLANDS).find(id=>holds({...SHELF_SPAN,...SHELF_ISLANDS[id].from}));
   if(half)halves[half].push(...triangle);
   else if(REMOVED_SHELVING.some(holds))counts.dropped++;
   else kept.push(...triangle);
  }
  for(const [id,triangles] of Object.entries(halves)){
   if(!triangles.length)continue;
   const site=SHELF_ISLANDS[id],moved=mesh.clone();
   moved.name=name+' '+id;moved.geometry=geometry.clone();moved.geometry.setIndex(triangles);
   moved.geometry.computeBoundingBox();moved.geometry.computeBoundingSphere();
   moved.position.set(site.offset[0],0,site.offset[1]);moved.rotation.y=site.yaw;
   root.add(moved);counts[id]=(counts[id]||0)+triangles.length/3;
  }
  geometry.setIndex(kept);geometry.computeBoundingBox();geometry.computeBoundingSphere();
 }
 return counts;
}
export function preloadSakuraInterior(){
 if(model)return Promise.resolve(true);if(pending)return pending;
 pending=(async()=>{const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),15000);try{
  const response=await fetch(assetURL('models/sakura-interior/sakura-interior.glb?fittings=2'),{signal:abort.signal});if(!response.ok)throw Error('HTTP '+response.status);
  model=(await new GLTFLoader().parseAsync(await response.arrayBuffer(),'')).scene;model.name='Supplied convenience-store interior';model.userData.sharedAsset=true;
  rearrangeShelving(model);
  // Kept out of the cel pass. These meshes carry vertex colours, and converting them
  // to MeshToonMaterial renders the whole shop black — verified by putting the
  // materials back one by one, and it happens with stock toon too, not just with the
  // shadow-tint patch. The shop still goes through the ink and the grade, so it sits
  // in the same picture; only its shading stays as the model authored it.
  model.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=false;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){m.roughness=.86;m.dithering=true;m.userData.keepPhysical=true;}}});return true;
 }catch(error){console.warn('Sakura interior unavailable:',error.message);return false;}finally{clearTimeout(timeout);pending=null;}})();return pending;
}
export function buildSakuraInterior({room,reg,action,exit}){
 const layout=SAKURA_LAYOUT,unitPositions=new Map(),unitApproaches=new Map(),batches=[],materials=shopProductMaterials(),dummy=new THREE.Object3D(),zero=new THREE.Matrix4().makeScale(0,0,0);
 const refrigerator=createShopRefrigerator(room,reg);
 const advertising=createStoreAdvertising({room,reg,action,posterSpecs:[]});
 const anchor=(pos,label,fn)=>{const o=new THREE.Object3D();o.position.set(...pos);room.add(o);reg(o,label,fn,true);return o;};
 for(const spec of SHOP_STOCK){const shelf=SAKURA_SHELVES[spec.id];if(!shelf)continue;
  const template=shopProductTemplate(spec.id),pair=[template.body,template.art].map((geometry,i)=>{const mesh=new THREE.InstancedMesh(geometry,materials[i],spec.capacity);mesh.name='Sakura '+spec.id+(i?' packaging':' goods');room.add(mesh);return mesh;});
  const matrices=[],perLevel=spec.capacity/shelf.levels.length,columns=shelf.columns||6,rows=perLevel/columns;
  for(let slot=0;slot<spec.capacity;slot++){
   const local=slot%perLevel,along=(local%columns-(columns-1)/2)*shelf.spacing,depth=(Math.floor(local/columns)-(rows-1)/2)*shelf.depth;
   const x=shelf.x+Math.cos(shelf.yaw)*along+Math.sin(shelf.yaw)*depth,z=shelf.z-Math.sin(shelf.yaw)*along+Math.cos(shelf.yaw)*depth;
   const y=shelf.levels[Math.floor(slot/perLevel)]+.002-template.bounds.min.y;
   dummy.position.set(x,y,z);dummy.rotation.set(0,shelf.yaw,0);dummy.updateMatrix();matrices.push(dummy.matrix.clone());pair.forEach(m=>m.setMatrixAt(slot,dummy.matrix));
   unitPositions.set(spec.id+':'+slot,[x,y+Math.min(.15,template.bounds.max.y*.6),z]);unitApproaches.set(spec.id+':'+slot,[shelf.stand[0]+Math.cos(shelf.yaw)*along,0,shelf.stand[2]-Math.sin(shelf.yaw)*along]);
  }
  pair.forEach(m=>m.computeBoundingSphere());batches.push({spec,pair,matrices});
  const front=new THREE.Vector3(Math.sin(shelf.yaw),0,Math.cos(shelf.yaw));
  for(const level of shelf.levels)advertising.label(spec.id==='bun'?'buns':spec.id,[shelf.x+front.x*(shelf.fridge!=null?.34:.12),level-.025,shelf.z+front.z*(shelf.fridge!=null?.34:.12)],.23,.075,{price:spec.id!=='bun',yaw:shelf.yaw});
  const o=anchor([shelf.x+front.x*.17,shelf.levels.at(-1)+.14,shelf.z+front.z*.17],'Examine '+(spec.brand||'SAKURA')+' · '+spec.name,()=>action('store-item',spec.name,{...spec,jp:spec.jp||'肉まん',text:spec.text||'A wrapped steamed bun to take away.'}));o.userData.storeItem=spec.id;
 }
 const ads=advertising.finish();
 for(const [id,file,x] of [['tea','nagi-tea.webp',-5.65],['coffee','port88-coffee.webp',-3.15],['biscuit','komorebi-biscuits.webp',3.10]]){
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.48),getPosterMaterial({id,file}));mesh.position.set(x,2.12,3.86);mesh.rotation.y=Math.PI;mesh.userData.sharedAsset=true;room.add(mesh);
  anchor([x,2.0,3.65],'Read '+id+' poster',()=>action('inspect','Sakura · '+id,'Original fictional packaging and shop posters.'));
 }
 const ledger=new THREE.Mesh(new THREE.BoxGeometry(.28,.025,.20),new THREE.MeshStandardMaterial({color:0x436454,roughness:.8}));ledger.position.set(4.77,1.025,1.7);room.add(ledger);
 anchor([4.50,1.24,1.7],'Read Sakura sales ledger',()=>action('shop-ledger'));
 anchor([4.50,1.2,.6],'Ring service bell',()=>action('resident','Thuan'));
 anchor([4.5,1.2,2.35],'Browse mail-order catalogue',()=>action('store-catalogue'));
 anchor(layout.exit,'Exit to street',exit);
 // Stock cartons carry the same generated Sakura label as delivered cartons.
 const carton=shopProductTemplate('stock');for(const z of [-5.95,-6.25])for(const x of [-4.6,-3.7,-2.8,-1.9]){const group=new THREE.Group();group.position.set(x,.25,z);room.add(group);group.add(new THREE.Mesh(carton.body,materials[0]),new THREE.Mesh(carton.art,materials[1]));}
 room.add(new THREE.HemisphereLight(0xfff1d3,0x66715c,1.2));
 let mounted=false,last='';
 return {layout,unitPositions,unitApproaches,refrigerator,accessShelf:id=>refrigerator.open(SAKURA_SHELVES[id]?.fridge),advertising:ads,ready:async()=>{const ok=await preloadSakuraInterior();if(ok&&!mounted){room.add(model.clone(true));mounted=true;}return ok;},
  updateStock(stock){const key=JSON.stringify(Object.values(stock).map(s=>s.shelf));if(last===key)return;last=key;for(const {spec,pair,matrices} of batches)for(const mesh of pair){for(let i=0;i<spec.capacity;i++)mesh.setMatrixAt(i,i<(stock[spec.id]?.shelf||0)?matrices[i]:zero);mesh.instanceMatrix.needsUpdate=true;}},
 };
}
