import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {buildIslandCoast} from '../src/world/island-coast.js';
import {routeAt,groundHeight} from '../src/world/layout.js?snappy=1';
import {buildLaneSurfaces} from '../src/world/lane-surfaces.js';
import {buildPark} from '../src/world/park.js';
import {HARBOUR_PARK_PATHS} from '../src/world/harbour-park-plan.js';
import {GROUND_LAYER} from '../src/world/ground-layers.js';
import {circleHitsRect} from '../physics.js';
import {installDOM} from './fixtures.mjs';

test('island ground leaves the surrounding sea uncovered and supports the Main Street homes',()=>{
 const group=new THREE.Group(),ground=buildIslandCoast(group);group.updateMatrixWorld(true);
 const ray=new THREE.Raycaster(),hit=(x,z)=>{ray.set(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(ground).length>0;};
 assert.ok(hit(0,0));assert.equal(hit(0,315),false,'Sea separates the expanded northern coast from distant islands');
 for(const p of [[-55,0],[57,0],[0,-70],[30,320]])assert.equal(hit(...p),false,'Sea is exposed');
 for(const p of [[-12,24],[-12,4],[-12,-15]])assert.ok(hit(...p),'The new frontage has continuous land underneath');
});

test('park shortcut has continuous walkable ground matching its level paved approach',()=>{
 // The consolidated park paves the approach itself. Follow that actual route from
 // the street crossing to the onsen, including both usable edges of its paving.
 installDOM();
 const group=new THREE.Group();buildLaneSurfaces(group,{worldMaterial:()=>new THREE.MeshStandardMaterial()});
 const world={group,colliders:[],landmarks:[]};
 buildPark(world,{worldMaterial:()=>new THREE.MeshStandardMaterial(),register(){},onAction(){}});
 group.updateMatrixWorld(true);
 const paving=[];group.traverse(o=>{if(o.isMesh&&/^Harbour Park .* walks$/.test(o.name))paving.push(o);});
 assert.ok(paving.length,'The authored park walks are drawn');
 const ray=new THREE.Raycaster();
 for(const route of HARBOUR_PARK_PATHS.filter(r=>['park-approach','garden-onsen-approach'].includes(r.id)))for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),steps=Math.ceil(length/.1);
  for(const side of [-1,0,1]){
   let previous=null;
   for(let j=0;j<=steps;j++){
    const offset=side*(route.width/2-.32),x=a[0]+dx*j/steps-dz/length*offset,z=a[1]+dz*j/steps+dx/length*offset,where=route.id+' at '+[x.toFixed(2),z.toFixed(2)];
    assert.ok(routeAt(x,z,.28),'Walkable '+where);
    assert.equal(world.colliders.some(c=>circleHitsRect(x,z,.28,c)),false,'Clear '+where);
    ray.set(new THREE.Vector3(x,10,z),new THREE.Vector3(0,-1,0));
    const hit=ray.intersectObjects(paving)[0],height=groundHeight(x,z);
    assert.ok(hit,'Visible paving '+where);
    assert.ok(Math.abs(hit.point.y-height-GROUND_LAYER.lane)<.005,'Paving matches walking height '+where);
    assert.equal(height,0,'The regraded park stays level '+where);
    if(previous!==null)assert.ok(Math.abs(height-previous)<.05,'No hidden step '+where);
    previous=height;
   }
  }
 }
});

