import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildSakuraInterior} from '../src/world/interiors/sakura-interior.js';
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
