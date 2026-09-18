import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildSakuraInterior} from '../src/world/interiors/sakura-interior.js';
const SHELF_MESHES=['sakura-shelf','sakura-shelf-ends'];
import {SAKURA_LAYOUT,SHELF_ISLANDS,REMOVED_SHELVING} from '../src/world/interiors/sakura-layout.js';
import {SHOP_STOCK,restoreShopStock} from '../src/commerce/shop-stock.js';
import {shopProductTemplate} from '../src/commerce/shop-product.js';

test('all 360 stocked products stand on real shelves with clear space above and beside them',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});const old=fetch;
 globalThis.fetch=async input=>String(input).startsWith('blob:')?old(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const room=new T.Group(),display=buildSakuraInterior({room,reg(){},action(){},exit(){}});assert.ok(await display.ready());display.updateStock(restoreShopStock());room.updateMatrixWorld(true);
  const fixtures=[];for(const root of [room.getObjectByName('Supplied convenience-store interior'),display.refrigerator.group])root.traverse(o=>{if(o.isMesh&&!o.material.transparent)fixtures.push(o);});
  const matrix=new T.Matrix4(),ray=new T.Raycaster(),up=new T.Vector3(0,1,0),down=new T.Vector3(0,-1,0),boxes=[],failures=[];
  for(const spec of SHOP_STOCK){const mesh=room.getObjectByName('Sakura '+spec.id+' goods');assert.ok(mesh);const template=shopProductTemplate(spec.id);
   for(let i=0;i<spec.capacity;i++){
    mesh.getMatrixAt(i,matrix);const box=template.bounds.clone().applyMatrix4(matrix),c=box.getCenter(new T.Vector3());boxes.push({id:spec.id+':'+i,box});
    for(const [x,z] of [[c.x,c.z],[box.min.x+.003,box.min.z+.003],[box.max.x-.003,box.max.z-.003],[box.max.x-.003,box.min.z+.003],[box.min.x+.003,box.max.z-.003]]){
     ray.set(new T.Vector3(x,box.min.y+.008,z),down);ray.near=0;ray.far=.026;
     if(!ray.intersectObjects(fixtures,false).length)failures.push(spec.id+':'+i+' floats or overhangs at '+[x,box.min.y,z].map(n=>n.toFixed(3)));
     ray.set(new T.Vector3(x,box.min.y+.011,z),up);ray.far=box.max.y-box.min.y-.008;
     const hits=ray.intersectObjects(fixtures,false);if(hits.length)failures.push(spec.id+':'+i+' intersects fixture '+hits[0].object.name+' at '+hits[0].point.toArray().map(n=>n.toFixed(3)));
    }
   }
  }
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const overlap=boxes[i].box.clone().intersect(boxes[j].box).getSize(new T.Vector3());if(Math.min(overlap.x,overlap.y,overlap.z)>.003)failures.push(boxes[i].id+' overlaps '+boxes[j].id);}
  assert.equal(SHOP_STOCK.length,30);assert.equal(boxes.length,360);assert.deepEqual(failures,[]);
  display.refrigerator.open(0);display.refrigerator.update(1);assert.ok(display.refrigerator.doors[0].amount>.9);display.refrigerator.update(8);assert.ok(display.refrigerator.doors[0].amount<.01);
 }finally{globalThis.fetch=old;}
});

test('the run is split, turned and clear of the aisles it used to block',async()=>{
 installDOM();globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});const old=fetch;
 globalThis.fetch=async input=>String(input).startsWith('blob:')?old(input):new Response(await readFile(new URL('../assets/'+new URL(input).pathname.split('/assets/')[1],import.meta.url)));
 try{
  const room=new T.Group(),display=buildSakuraInterior({room,reg(){},action(){},exit(){}});assert.ok(await display.ready());room.updateMatrixWorld(true);
  const model=room.getObjectByName('Supplied convenience-store interior');
  const drawn=(mesh)=>{const position=mesh.geometry.attributes.position,index=mesh.geometry.index,points=[];
   assert.ok(index.count>0&&index.count%3===0,mesh.name+' keeps whole triangles');
   for(let i=0;i<index.count;i++)points.push(new T.Vector3().fromBufferAttribute(position,index.getX(i)).applyMatrix4(mesh.matrixWorld));
   return points;};
  // Nothing is left standing where the run that came out used to be. The islands are
  // their own meshes, so what they cover there is shelving that was moved, not missed.
  for(const name of SHELF_MESHES){const mesh=model.getObjectByName(name);assert.ok(mesh,name+' is still in the model');
   for(const box of REMOVED_SHELVING){const region=new T.Box3(new T.Vector3(box.minX,box.minY,box.minZ),new T.Vector3(box.maxX,box.maxY,box.maxZ));
    assert.equal(drawn(mesh).filter(p=>region.containsPoint(p)).length,0,name+' still stands in the run that was removed');}}
  // Each island stands inside the collider that was moved with it, so the shelving and
  // what stops you walking into it cannot drift apart.
  for(const [id,site] of Object.entries(SHELF_ISLANDS)){
   const footprint=new T.Box3();let triangles=0;
   for(const name of SHELF_MESHES){const mesh=model.getObjectByName(name+' '+id);assert.ok(mesh,name+' '+id+' was never lifted out');
    assert.equal(mesh.rotation.y,site.yaw,name+' '+id+' is not turned');triangles+=mesh.geometry.index.count/3;
    for(const p of drawn(mesh))footprint.expandByPoint(p);}
   assert.ok(triangles>100,id+' island is nearly empty at '+triangles+' triangles');
   const blocks=SAKURA_LAYOUT.colliders.filter(c=>c.x-c.w/2<=footprint.max.x+.01&&c.x+c.w/2>=footprint.min.x-.01&&c.z-c.d/2<=footprint.max.z+.01&&c.z+c.d/2>=footprint.min.z-.01);
   assert.ok(blocks.length,id+' island stands where nothing stops you walking into it');
   for(const axis of ['x','z'])for(const side of ['min','max'])
    assert.ok(blocks.some(c=>Math.abs((side==='min'?c[axis]-(axis==='x'?c.w:c.d)/2:c[axis]+(axis==='x'?c.w:c.d)/2)-footprint[side][axis])<.06),id+' island oversteps its collider in '+side+' '+axis);
  }
  const {circleHitsRect}=await import('../physics.js');
  const open=(x,z)=>!SAKURA_LAYOUT.colliders.some(c=>circleHitsRect(x,z,SAKURA_LAYOUT.clearance,c));
  // Each lane runs front to back until the fitting that closes it, and the widest of
  // them is on the door's own centre line.
  for(const [name,x,back,front] of [['west aisle',-2.72,-3.3,2.6],['door aisle',0,-2.7,2.9],['east aisle',2.72,-2.7,2.9]])
   for(let z=back;z<=front;z+=.17)assert.ok(open(x,z),name+' is blocked at z='+z.toFixed(2));
  // and they are joined at both ends, so neither island is a pocket.
  for(const [name,z,from,to] of [['front of the shop',2.6,-2.2,2.7],['back of the shop',-2.5,-2.2,2.7]])
   for(let x=from;x<=to;x+=.14)assert.ok(open(x,z),'The '+name+' is blocked at x='+x.toFixed(2));
 }finally{globalThis.fetch=old;}
});
