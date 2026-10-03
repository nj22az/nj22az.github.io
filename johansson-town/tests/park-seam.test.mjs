import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildPark} from '../src/world/park.js';
import {buildEastLawn} from '../src/world/east-lawn.js';
import {PARK} from '../src/world/park-layout.js';
import {groundHeight} from '../src/world/layout.js';

test('park and lawn share border positions, shading, texture scale and grass colour',()=>{
 installDOM();const world={group:new THREE.Group(),colliders:[]};
 const lawn=buildEastLawn({parent:world.group,heightAt:groundHeight}).lawn;
 buildPark(world,{register(){},onAction(){}});
 const mound=world.park.group.getObjectByName('Harbour Park ground');
 assert.equal(mound.material.map.image,lawn.material.map.image);
 const boundary=g=>{const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,result=new Map();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);
   if((Math.abs(Math.abs(x-PARK.x)-PARK.half)<.00001&&Math.abs(z-PARK.z)<=PARK.half+.00001)||
      (Math.abs(Math.abs(z-PARK.z)-PARK.half)<.00001&&Math.abs(x-PARK.x)<=PARK.half+.00001))result.set(x.toFixed(4)+','+z.toFixed(4),{y:p.getY(i),normal:[n.getX(i),n.getY(i),n.getZ(i)],uv:[uv.getX(i),uv.getY(i)]});}
  return result;};
 const outside=boundary(lawn.geometry),inside=boundary(mound.geometry);
 for(const [key,edge] of inside){const other=outside.get(key);assert.ok(other,'Lawn misses park edge at '+key);assert.ok(Math.abs(edge.y-other.y)<.0001,'Visible crack at '+key);
  edge.normal.forEach((n,i)=>assert.ok(Math.abs(n-other.normal[i])<.001,'Lighting seam at '+key));assert.deepEqual(edge.uv,other.uv);}
 const colors=mound.geometry.attributes.color,turf=new THREE.Color().setHex(lawn.material.color.getHex());
 assert.ok(Array.from({length:colors.count},(_,i)=>i).some(i=>Math.abs(colors.getX(i)-turf.r)<.00001&&Math.abs(colors.getY(i)-turf.g)<.00001&&Math.abs(colors.getZ(i)-turf.b)<.00001));
});
