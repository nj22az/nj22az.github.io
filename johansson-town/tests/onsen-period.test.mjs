import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {ceramicTileMaterial,sizeCeramic,wovenBasket} from '../src/world/interiors/onsen-period.js';
import {buildOnsenInterior,ONSEN_SEATS} from '../src/world/interiors/onsen.js';
import {circleHitsRect} from '../physics.js';
import {DAILY_BATH} from '../src/world/interiors/onsen-lobby.js';

test('wet-floor tile scale is constant across differently sized floor patches',()=>{
 const m=ceramicTileMaterial();for(const [w,d] of [[6.1,3.2],[3.9,.9],[3.9,.2]]){
  const p=sizeCeramic(m,w,d);
  for(const key of ['map','bumpMap','roughnessMap']){
   assert.equal(w/(p[key].repeat.x*4),.15);assert.ok(Math.abs(d/(p[key].repeat.y*4)-.15)<1e-10);
   assert.notEqual(p[key],m[key]);
  }
 }
 assert.equal(m.bumpScale,.003);assert.equal(m.map.colorSpace,THREE.SRGBColorSpace);assert.equal(m.bumpMap.colorSpace,THREE.NoColorSpace);
});
test('wicker baskets have an open top and rest on their shelf, with one draw per basket',()=>{
 const room=new THREE.Group(),g=wovenBasket(room,4.68,.365,.2),mesh=g.children[0],matrix=new THREE.Matrix4(),point=new THREE.Vector3(),scale=new THREE.Vector3(),q=new THREE.Quaternion();
 assert.equal(g.children.length,1);assert.ok(mesh.isInstancedMesh);let bottom=Infinity,top=-Infinity;
 for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);matrix.decompose(point,q,scale);bottom=Math.min(bottom,point.y-scale.y/2);top=Math.max(top,point.y+scale.y/2);
  // The top is hollow: high members must be against one of the side walls.
  if(point.y>.18)assert.ok(Math.abs(point.x)>.17||Math.abs(point.z)>.17);
 }
 assert.ok(bottom>=0);assert.ok(top<=.23);assert.ok(Math.abs(g.position.y+bottom-.368)<.005);
});
test('period fittings leave doors and all standing seat approaches clear',()=>{
 const room=new THREE.Group(),hits=[];
 const layout=buildOnsenInterior({room,reg:(o,label,fn)=>hits.push({o,label,fn}),action(){},exit(){}});
 for(const s of Object.values(ONSEN_SEATS))assert.ok(!layout.colliders.some(c=>circleHitsRect(s.stand[0],s.stand[2],.25,c)),s.id);
 // Both staff and customers need a usable service aisle beside the rental shelf.
 for(let z=2.2;z<=3.2;z+=.05)assert.ok(!layout.colliders.some(c=>circleHitsRect(-3.1,z,.35,c)),'bandai aisle '+z);
 for(let z=-4.75;z<4.3;z+=.05)assert.ok(!layout.colliders.some(c=>circleHitsRect(.2,z,.25,c)),z);
 assert.ok(room.getObjectByName('Wet threshold drain'));assert.ok(room.getObjectByName('Mineral waterline'));assert.ok(room.getObjectByName('Wet-room vent frame'));
 assert.ok(hits.some(h=>h.label==='Read the bath thermometer'));
 assert.ok(DAILY_BATH.every(([jp])=>/[^\x00-\x7f]/.test(jp)));
});
