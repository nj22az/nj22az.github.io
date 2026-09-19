import * as THREE from '../../../vendor/three.module.js';
import {GLTFLoader} from '../../../vendor/GLTFLoader.js';
import {assetURL} from '../../assets.js';
import {SHOP_STOCK} from '../../commerce/shop-stock.js';
import {shopProductTemplate,shopProductMaterials} from '../../commerce/shop-product.js';
import {createStoreAdvertising,getPosterMaterial,POSTER_SPECS} from './store-advertising.js';
import {createShopRefrigerator} from './shop-refrigerator.js';
import {SAKURA_LAYOUT,SAKURA_SHELVES,SAKURA_DRESSING,SAKURA_BACKBAR,SHELF_ISLANDS,REMOVED_SHELVING} from './sakura-layout.js';
import {PALETTE,fluorescent} from '../../render/dusk.js';
let model=null,pending=null;
// The gondolas were cut into three islands and each one turned a quarter turn
// (SHELF_ISLANDS in sakura-layout.js says where each one comes from and goes). The shop
// model batches every aisle into two merged meshes, so there is no object to move or
// hide: each half is lifted out as its own mesh over the same vertex buffer, and the
// shelving that was not kept is dropped the way the park drops its bushes, by
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
   const half=Object.keys(SHELF_ISLANDS).find(id=>holds(SHELF_ISLANDS[id].from));
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

/** Thin impulse wall behind Thuan at the till — props only, readable on approach. */
function dressBackbar(room,anchor,action,materials){
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.78});
 const box=(w,h,d,x,y,z,color)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.name='Sakura backbar';m.userData.sharedAsset=true;room.add(m);return m;};
 for(const prop of SAKURA_BACKBAR){
  const {id,x,y,z}=prop;
  if(id==='ferry-tickets'){for(let i=0;i<6;i++)box(.10,.003,.055,x,y+i*.004,z-i*.008,0xc45c48);}
  else if(id==='phone-cards'){for(let i=0;i<5;i++)box(.08,.003,.045,x,y+i*.0035,z,0x2f6f9a);}
  else if(id==='stamps'){for(let i=0;i<4;i++)box(.028,.002,.032,x,y,z+i*.038,i%2?0xd4a0b0:0xe8c96a);}
  else if(id==='gum'){box(.05,.04,.03,x,y,z,0x7aab6e);box(.05,.04,.03,x,y,z-.08,0xe8d48a);}
  else if(id==='matches'){box(.045,.014,.022,x,y,z,0x6b4030);box(.018,.048,.014,x,y+.01,z-.07,0xb8bec2);}
  else if(id==='osusume'){box(.15,.11,.006,x,y,z,0xf3e7cf);box(.12,.004,.004,x,y+.02,z+.004,0xc45c48);}
  else if(id==='postcard-stand'){
   const tpl=shopProductTemplate('postcard'),group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=-Math.PI/2;group.rotation.x=-.35;
   group.name='Sakura postcard stand';group.userData.sharedAsset=true;room.add(group);
   group.add(new THREE.Mesh(tpl.body,materials[0]),new THREE.Mesh(tpl.art,materials[1]));
   box(.12,.02,.06,x,y-.04,z,0x5a5044);
  }
  else if(id==='radio'){
   box(.13,.08,.07,x,y,z,0x3a3f42);box(.04,.015,.02,x,y+.05,z+.01,0x2a2e30);
   const ant=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.12,8),mat(0x9aa3a0));ant.position.set(x+.05,y+.12,z);ant.name='Sakura backbar';ant.userData.sharedAsset=true;room.add(ant);
  }
  else if(id==='batteries'){
   const tpl=shopProductTemplate('battery'),group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=-Math.PI/2;
   group.name='Sakura backbar batteries';group.userData.sharedAsset=true;room.add(group);
   group.add(new THREE.Mesh(tpl.body,materials[0]),new THREE.Mesh(tpl.art,materials[1]));
  }
 }
 const look=SAKURA_BACKBAR.find(p=>p.id==='osusume');
 if(look)anchor([look.x-.15,1.2,look.z],'Look over the till backbar',()=>action('inspect','Sakura · Till backbar',
  'Ferry cards, phone cards, stamps and gum on the eye-level strip. A postcard stand faces the queue. Thuan\u2019s radio sits low with spare batteries. The ledger and bell stay on the counter.'));
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
 // Fittings the model came with that nothing stood on (SAKURA_DRESSING). Instanced the
 // same way as the goods, but never restocked: none of it is for sale.
 for(const piece of SAKURA_DRESSING){
  const template=shopProductTemplate(piece.template),count=piece.levels.length*piece.columns*piece.rows;
  const pair=[template.body,template.art].map((geometry,i)=>{const mesh=new THREE.InstancedMesh(geometry,materials[i],count);mesh.name='Sakura '+piece.id+(i?' print':' display');room.add(mesh);return mesh;});
  let slot=0;
  for(const level of piece.levels)for(let column=0;column<piece.columns;column++)for(let row=0;row<piece.rows;row++){
   const along=(column-(piece.columns-1)/2)*piece.spacing,depth=(row-(piece.rows-1)/2)*piece.depth;
   dummy.position.set(piece.x+Math.cos(piece.yaw)*along+Math.sin(piece.yaw)*depth,level+.002-template.bounds.min.y,piece.z-Math.sin(piece.yaw)*along+Math.cos(piece.yaw)*depth);
   dummy.rotation.set(0,piece.yaw,0);dummy.updateMatrix();pair.forEach(m=>m.setMatrixAt(slot,dummy.matrix));slot++;
  }
  pair.forEach(m=>m.computeBoundingSphere());
  if(piece.look)anchor(piece.look,piece.title,()=>action('inspect',piece.title.replace(/^(Read|Look over) (the )?/,'Sakura · '),piece.text));
 }
 const ads=advertising.finish();
 // The three posters in the window wall. They take their art from the one poster list
 // rather than a second copy of it: this shop kept its own, so when the prints were
 // changed the wall it changed was somebody else's and the window still advertised the
 // packaging Sakura had stopped stocking.
 for(const [i,spec] of POSTER_SPECS.entries()){
  const x=[-5.65,-3.15,3.10][i];if(x===undefined)break;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.48),getPosterMaterial(spec));mesh.name=spec.title;
  mesh.position.set(x,2.12,3.86);mesh.rotation.y=Math.PI;mesh.userData.sharedAsset=true;room.add(mesh);
  const item=SHOP_STOCK.find(s=>s.id===spec.id);
  anchor([x,2.0,3.65],'Read '+spec.id+' poster',()=>action('inspect',spec.title,
   item?item.name+' · ¥'+item.cost+'\nThuan\u2019s own label, printed for the shop.':'Thuan\u2019s own label, printed for the shop.'));
 }
 const ledger=new THREE.Mesh(new THREE.BoxGeometry(.28,.025,.20),new THREE.MeshStandardMaterial({color:0x436454,roughness:.8}));ledger.position.set(4.77,1.025,1.7);room.add(ledger);
 anchor([4.50,1.24,1.7],'Read Sakura sales ledger',()=>action('shop-ledger'));
 anchor([4.50,1.2,.6],'Ring service bell',()=>action('resident','Thuan'));
 dressBackbar(room,anchor,action,materials);
 anchor([4.5,1.2,2.35],'Browse mail-order catalogue',()=>action('store-catalogue'));
 anchor(layout.exit,'Exit to street',exit);
 // Stock cartons carry the same generated Sakura label as delivered cartons.
 const carton=shopProductTemplate('stock');for(const z of [-5.95,-6.25])for(const x of [-4.6,-3.7,-2.8,-1.9]){const group=new THREE.Group();group.position.set(x,.25,z);room.add(group);group.add(new THREE.Mesh(carton.body,materials[0]),new THREE.Mesh(carton.art,materials[1]));}
 const fill=new THREE.HemisphereLight(PALETTE.sakuraTube,0x66715c,1.2);room.add(fill);
 let lightLevel=1;const tubes=[];
 const updateLighting=minutes=>{
  lightLevel=fluorescent(minutes);fill.intensity=1.2*lightLevel;
  for(const tube of tubes)for(const mat of Array.isArray(tube.material)?tube.material:[tube.material]){
   mat.emissive.set(PALETTE.sakuraTube);mat.emissiveIntensity=lightLevel;
  }
 };
 let mounted=false,last='';
 return {layout,unitPositions,unitApproaches,refrigerator,updateLighting,accessShelf:id=>refrigerator.open(SAKURA_SHELVES[id]?.fridge),advertising:ads,ready:async()=>{const ok=await preloadSakuraInterior();if(ok&&!mounted){
   const interior=model.clone(true);
   interior.traverse(o=>{if(o.isMesh&&o.name==='sakura-light'){
    const prepare=m=>{const mat=m.clone();mat.emissive.set(PALETTE.sakuraTube);mat.emissiveIntensity=lightLevel;return mat;};
    // The supplied model shares its material with stock and walls. Only the tubes glow.
    o.material=Array.isArray(o.material)?o.material.map(prepare):prepare(o.material);tubes.push(o);
   }});
   room.add(interior);mounted=true;
  }return ok;},
  updateStock(stock){const key=JSON.stringify(Object.values(stock).map(s=>s.shelf));if(last===key)return;last=key;for(const {spec,pair,matrices} of batches)for(const mesh of pair){for(let i=0;i<spec.capacity;i++)mesh.setMatrixAt(i,i<(stock[spec.id]?.shelf||0)?matrices[i]:zero);mesh.instanceMatrix.needsUpdate=true;}},
 };
}
