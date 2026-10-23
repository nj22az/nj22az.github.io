// Layout experiment only. Reuse World's product geometry, atlas and flavour code unchanged.
import * as THREE from '../../../vendor/three.module.js';
import {PRODUCTS,FINGERPRINT} from '../../../src/commerce/products-data.js';
import {sakuraProductTemplate} from '../../../src/world/interiors/sakura-food-products.js';
import {shopProductMaterials,shopProductTemplate} from '../../../src/commerce/shop-product.js';
import {shelfArtMaterial,flavouredArt,flavourForColumn,setFlavour,flavourTint} from '../../../src/world/interiors/shelf-flavours.js';

export function retainSakuraStock(root){
 const stock=new THREE.Group();stock.name='Retained Sakura products';root.add(stock);
 if(root.userData.groups.Stock)root.userData.groups.Stock.visible=false; // Replace the CAD's anonymous coloured blocks.
 const materials=shopProductMaterials(),wrap=new THREE.MeshStandardMaterial({color:0xf1f7ef,transparent:true,opacity:.09,roughness:.12,depthWrite:false,side:THREE.DoubleSide});
 const dummy=new THREE.Object3D(),records=[],envelopes=[];
 const bays=[];
 function bay(ids,x,z,yaw,span,levels,depth=.32){
  ids.forEach((id,i)=>bays.push({id,x:x+Math.cos(yaw)*((i+.5)/ids.length-.5)*span,z:z-Math.sin(yaw)*((i+.5)/ids.length-.5)*span,yaw,span:span/ids.length,levels,depth}));
 }
 const drinks=['tea','coffee','water','orange','cola','soda','beer'];
 drinks.forEach((id,i)=>bay([id],5.7+i*.6,-8.67,0,.56,[.328,.708,1.088],.60));
 ['rice','sandwich','bento','pudding','yogurt','milk'].forEach((id,i)=>bay([id],.37,-1.82-i*1.1,Math.PI/2,1.04,[.545,.895,1.245],.48));
 bay(['bread','soup','peaches'],2.04,-4.65,-Math.PI/2,3.45,[.344,.664,.984]);
 bay(['noodles','curry','soy','tuna'],2.56,-4.65,Math.PI/2,3.45,[.344,.664,.984]);
 bay(['chips','crackers','biscuit'],3.99,-4.65,-Math.PI/2,3.45,[.344,.664,.984]);
 bay(['chocolate','candy'],4.51,-4.65,Math.PI/2,3.45,[.344,.664,.984]);
 bay(['notebook','postcard','battery'],5.94,-4.65,-Math.PI/2,3.45,[.344,.664,.984]);
 let dailyStart=-4.65+3.45/2;
 for(const [id,width]of [['detergent',.82],['soap',.77],['tissues',1.0],['toothpaste',.86]]){bay([id],6.46,dailyStart-width/2,Math.PI/2,width,[.344,.664,.984]);dailyStart-=width;}
 bay(['bun'],11.86,-5.575,0,.34,[.81,1.00,1.19],.30);
 for(const b of bays){
  const p=PRODUCTS.find(p=>p.id===b.id),template=sakuraProductTemplate(b.id),size=template.bounds.getSize(new THREE.Vector3());
  // Preserve every counted unit. Additional facings use the old shop's display-only convention.
  const columns=Math.floor((b.span+.01)/(size.x+.01)),rows=2;
  if(columns*rows*b.levels.length<p.capacity||size.z*rows+.01>b.depth)throw Error('Product does not fit '+b.id);
  const count=columns*rows*b.levels.length,art=flavouredArt(template.art,count);
  const parts=[new THREE.InstancedMesh(template.body,materials[0],count),new THREE.InstancedMesh(art,shelfArtMaterial(),count)];
  if(template.glass)parts.push(new THREE.InstancedMesh(template.glass,wrap,count));
  for(const [i,m]of parts.entries()){m.name='Sakura '+b.id+(i===0?' goods':i===1?' packaging':' clear wrapper');m.castShadow=i===0;m.receiveShadow=true;stock.add(m);}
  let slot=0;
  for(const level of b.levels)for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){
   const along=(col-(columns-1)/2)*(size.x+.01),back=(row-.5)*(size.z+.01),x=b.x+Math.cos(b.yaw)*along+Math.sin(b.yaw)*back,z=b.z-Math.sin(b.yaw)*along+Math.cos(b.yaw)*back,y=level+.002-template.bounds.min.y;
   dummy.position.set(x,y,z);dummy.rotation.set(0,b.yaw,0);dummy.scale.set(1,1,1);dummy.updateMatrix();parts.forEach(m=>m.setMatrixAt(slot,dummy.matrix));
   const k=flavourForColumn(b.id,col,columns);setFlavour(art,slot,b.id,k);parts[0].setColorAt(slot,flavourTint(b.id,k));
   const bounds=template.bounds.clone().applyMatrix4(dummy.matrix);envelopes.push({id:b.id,min:bounds.min.toArray(),max:bounds.max.toArray(),level});slot++;
  }
  parts.forEach(m=>m.computeBoundingSphere());records.push({id:b.id,stockCapacity:p.capacity,displayInstances:count,fixture:b.x<1?'west fresh chiller':b.z<-8?'rear drinks cooler':b.id==='bun'?'counter steamer':'gondola',purpose:p.purpose});
 }
 // Existing printed delivery cartons and magazine templates, rather than replacement art.
 for(const [id,x,z,y,yaw]of [['stock',12.6,-10.25,0,0],['stock',13.0,-10.25,0,0],['magazine-sea',1.0,-.30,.94,0],['magazine-night',1.4,-.30,.94,0],['magazine-rod',1.8,-.30,.94,0],['newspaper',.4,-.30,.94,0]]){
  const t=shopProductTemplate(id),g=new THREE.Group();g.position.set(x,y-t.bounds.min.y,z);g.rotation.y=yaw;g.name='Retained '+id;g.add(new THREE.Mesh(t.body,materials[0]),new THREE.Mesh(t.art,materials[1]));stock.add(g);
 }
 const expected=PRODUCTS.map(p=>p.id).sort(),actual=records.map(p=>p.id).sort();
 if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error('Catalogue coverage changed');
 root.userData.retention={fingerprint:FINGERPRINT,records,envelopes,productLines:records.length,countedCapacity:records.reduce((n,r)=>n+r.stockCapacity,0),displayInstances:records.reduce((n,r)=>n+r.displayInstances,0)};
 return root.userData.retention;
}
