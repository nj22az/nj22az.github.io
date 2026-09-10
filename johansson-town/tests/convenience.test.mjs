import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {STORE_ITEMS} from '../src/commerce/catalogue.js';
import {createShopify} from '../src/commerce/shopify.js';
import {buildConvenienceStore} from '../src/world/interiors/convenience.js';

test('convenience store registers eight distinct goods and a physical cooler door',()=>{
 const room=new THREE.Group(),clerk=new THREE.Group(),hits=[],colliders=[],calls=[];
 const box=(size,pos,color,parent)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));o.position.set(...pos);parent.add(o);return o;};
 const store=buildConvenienceStore({room,clerk,box,reg:(o,label,fn,inside)=>hits.push({o,label,fn,inside}),collider:(...c)=>colliders.push(c),action:(...a)=>calls.push(a),signTexture:()=>new THREE.Texture()});
 assert.equal(store.products.length,8);assert.equal(new Set(store.products.map(o=>o.userData.storeItem)).size,8);
 for(const o of store.products){const hit=hits.find(h=>h.o===o);assert.ok(hit.inside);hit.fn();}
 assert.deepEqual(calls.map(a=>a[2].id),STORE_ITEMS.map(i=>i.id));
 const door=hits.find(h=>h.o===store.door);door.fn();assert.ok(Math.abs(store.door.parent.rotation.y)>1);door.fn();assert.equal(store.door.parent.rotation.y,0);
 assert.ok(hits.find(h=>h.o===clerk));assert.ok(colliders.length>=4);
});
test('Shopify stays offline when disabled and maps only configured variants',async()=>{
 let calls=0;const offline=createShopify({enabled:false},{fetchImpl:()=>{calls++;throw Error('network');}});
 await assert.rejects(()=>offline.checkout('gid://shopify/ProductVariant/1'),/not open/);assert.equal(calls,0);
 const config={enabled:true,domain:'sakura-test.myshopify.com',apiVersion:'2026-07',products:{postcard:{handle:'postcard',variantId:'gid://shopify/ProductVariant/8'}}};
 const requests=[],client=createShopify(config,{fetchImpl:async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>requests.length===1?{data:{product:{title:'Print',variants:{nodes:[{id:'gid://shopify/ProductVariant/8',availableForSale:true,price:{amount:'12.00',currencyCode:'USD'}}]}}}}:{data:{cartCreate:{cart:{checkoutUrl:'https://sakura-test.myshopify.com/checkouts/test'},userErrors:[]}}}};}});
 assert.equal(await client.product('unknown'),null);assert.equal(requests.length,0);
 const product=await client.product('postcard');assert.equal(product.price.currencyCode,'USD');assert.equal(await client.checkout(product.id),'https://sakura-test.myshopify.com/checkouts/test');assert.equal(requests[1].variables.input.lines[0].quantity,1);
 const failed=createShopify(config,{fetchImpl:async()=>({ok:true,json:async()=>({data:{cartCreate:{cart:null,userErrors:[{message:'Sold out'}]}}})})});await assert.rejects(()=>failed.checkout(product.id),/Sold out/);
 const hostile=createShopify(config,{fetchImpl:async()=>({ok:true,json:async()=>({data:{cartCreate:{cart:{checkoutUrl:'https://evil.example/'},userErrors:[]}}})})});await assert.rejects(()=>hostile.checkout(product.id),/Unexpected/);
});

test('store purchases charge once, stack goods, survive reload and honour closing time',async()=>{
 const {installDOM}=await import('./fixtures.mjs'),{createActivities}=await import('../activities.js');
 const dom=installDOM();let minutes=1002;const options={say(){},onWeather(){},onTime(){},getMinutes:()=>minutes};const acts=createActivities(options),item=STORE_ITEMS[4],start=acts.state.yen;
 for(let i=0;i<2;i++){acts.action('store-item',item.name,item);dom.button('Buy in town · ¥90');}
 assert.equal(acts.state.yen,start-180);assert.equal(acts.state.inventory.filter(n=>n===item.name).length,2);
 const restored=createActivities(options);assert.equal(restored.state.yen,start-180);assert.equal(restored.state.inventory.filter(n=>n===item.name).length,2);
 restored.action('store-item',item.name,item);minutes=1200;dom.button('Buy in town · ¥90');assert.equal(restored.state.yen,start-180);
 minutes=1002;restored.state.yen=0;restored.action('store-item',item.name,item);dom.button('Buy in town · ¥90');assert.equal(restored.state.yen,0);assert.equal(restored.state.inventory.filter(n=>n===item.name).length,2);
 restored.close();acts.close();
});

test('fog stays disabled in daylight, night, rain and interiors',async()=>{
 const {atmosphere}=await import('../src/render/atmosphere.js');
 for(const day of [0,.4,1])for(const rain of [false,true])for(const inside of [false,true])assert.equal(atmosphere(day,rain,inside).fog,null);
 assert.ok(atmosphere(1,false,true).ambient>=1);
});
test('stocked shop has a walkable approach to every shelf item',()=>{
 const room=new THREE.Group(),clerk=new THREE.Group(),colliders=[];
 const box=(size,pos,color,parent)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));o.position.set(...pos);parent.add(o);return o;};
 const store=buildConvenienceStore({room,clerk,box,reg(){},collider:(...c)=>colliders.push(c),action(){},signTexture:()=>new THREE.Texture()});
 assert.equal(store.placements.length,8);
 const free=(x,z)=>colliders.every(([cx,cz,w,d])=>Math.hypot(Math.max(Math.abs(x-cx)-w/2,0),Math.max(Math.abs(z-cz)-d/2,0))>.34);
 const reached=new Set(),queue=[[24,41]];while(queue.length){const [i,j]=queue.shift(),key=i+','+j;if(i<1||j<1||i>47||j>47||reached.has(key)||!free(-6+i*.25,-6+j*.25))continue;reached.add(key);for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([i+di,j+dj]);}
 for(const anchor of store.placements){const i=Math.round((anchor.position.x+6)/.25),j=Math.round((anchor.position.z+.85+6)/.25);assert.ok(reached.has(i+','+j),'Shelf item has a reachable approach: '+anchor.userData.storeItem);}
});

test('looking up selects the upper shelf rather than the closest lower packet',async()=>{
 const {shelfAimScore}=await import('../src/interact/aim.js');const origin=new THREE.Vector3(0,1.7,1),upper=new THREE.Vector3(0,1.9,0),lower=new THREE.Vector3(0,1.1,0),direction=upper.clone().sub(origin).normalize();
 assert.ok(Number.isFinite(shelfAimScore(origin,direction,upper)));assert.equal(shelfAimScore(origin,direction,lower),Infinity);
});

test('stockroom and clerk aisle connect to the entrance without crossing a counter or wall',()=>{
 const room=new THREE.Group(),clerk=new THREE.Group(),colliders=[],hits=[];
 const box=(size,pos,color,parent)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color}));o.position.set(...pos);parent.add(o);return o;};
 const store=buildConvenienceStore({room,clerk,box,reg:(o,label)=>hits.push({o,label}),collider:(...c)=>colliders.push(c),action(){},signTexture:()=>new THREE.Texture()});
 const free=(x,z)=>x>=-5.25&&x<=5.25&&z>=-5.15&&z<=5.35&&colliders.every(([cx,cz,w,d])=>Math.abs(x-cx)>=w/2+.32||Math.abs(z-cz)>=d/2+.32);
 const reached=new Set(),queue=[[0,43]];
 for(let at=0;at<queue.length;at++){
  const [i,j]=queue[at],key=i+','+j;if(reached.has(key)||!free(i/10,j/10))continue;reached.add(key);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]])queue.push([i+dx,j+dz]);
 }
 for(const [x,z] of [[store.stockroomDoor.x,store.stockroomDoor.z],[3.9,-3.5],[0,-3.5],[-4.5,-3.5],[clerk.position.x,clerk.position.z]])assert.ok(reached.has(Math.round(x*10)+','+Math.round(z*10)),[x,z]+' must be reachable');
 assert.equal(free(0,-2.4),false,'The partition is solid outside the doorway');
 room.updateMatrixWorld(true);let draws=0,lights=0;
 room.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite));if(o.isMesh)draws++;if(o.isLight)lights++;});
 assert.ok(draws<90,'Stock and fittings stay batched: '+draws);assert.equal(lights,1);
});
