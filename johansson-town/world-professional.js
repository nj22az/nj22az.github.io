import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { createTown as createBaseTown } from './world.js?v=12-base';

// Professionalisation layer kept separate from the stable base world.
// It removes raster-thin cable lines, extends the harbour into a genuinely
// walkable pier, and improves the animated water normals without disturbing
// the established gameplay/collision APIs.

const bands=new Uint8Array([
  40,40,40,255,
  96,96,96,255,
  158,158,158,255,
  216,216,216,255,
  255,255,255,255
]);
const gradient=new THREE.DataTexture(bands,5,1,THREE.RGBAFormat);
gradient.needsUpdate=true;
gradient.magFilter=THREE.NearestFilter;
gradient.minFilter=THREE.NearestFilter;
gradient.generateMipmaps=false;

function toon(color){
  return new THREE.MeshToonMaterial({color,gradientMap:gradient,dithering:true});
}

function box(parent,size,pos,color,shadow=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(...size),toon(color));
  m.position.set(...pos);m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;
}

function cylinder(parent,radius,height,pos,color,segments=10,shadow=true){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),toon(color));
  m.position.set(...pos);m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;
}

function beam(parent,a,b,radius,color,segments=8,shadow=true){
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(bv,av);
  const geo=new THREE.CylinderGeometry(radius,radius,d.length(),segments);
  const m=new THREE.Mesh(geo,toon(color));
  m.position.copy(av).add(bv).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;
}

function replaceCableLines(group,mobile){
  const lines=[];
  group.traverse(o=>{if(o.isLine&&o.geometry?.getAttribute('position'))lines.push(o);});
  if(!lines.length)return 0;

  const segments=[];
  const a=new THREE.Vector3(),b=new THREE.Vector3();
  for(const line of lines){
    const pos=line.geometry.getAttribute('position');
    for(let i=0;i<pos.count-1;i++){
      a.fromBufferAttribute(pos,i);b.fromBufferAttribute(pos,i+1);
      line.localToWorld(a);line.localToWorld(b);group.worldToLocal(a);group.worldToLocal(b);
      segments.push({a:a.clone(),b:b.clone()});
    }
  }

  const unit=new THREE.CylinderGeometry(1,1,1,6,1,false);
  const mat=new THREE.MeshBasicMaterial({color:0x20292b});
  const cables=new THREE.InstancedMesh(unit,mat,segments.length);
  cables.name='stable-overhead-cables';
  cables.castShadow=false;cables.receiveShadow=false;cables.frustumCulled=true;
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),mid=new THREE.Vector3(),dir=new THREE.Vector3();
  const radius=mobile?.021:.018;
  segments.forEach((s,i)=>{
    dir.subVectors(s.b,s.a);const len=dir.length();mid.copy(s.a).add(s.b).multiplyScalar(.5);
    dummy.position.copy(mid);dummy.quaternion.setFromUnitVectors(up,dir.normalize());dummy.scale.set(radius,len,radius);dummy.updateMatrix();cables.setMatrixAt(i,dummy.matrix);
  });
  cables.instanceMatrix.needsUpdate=true;group.add(cables);

  for(const line of lines){
    line.parent?.remove(line);line.geometry?.dispose();
    if(Array.isArray(line.material))line.material.forEach(m=>m.dispose?.());else line.material?.dispose?.();
  }
  return segments.length;
}

function addWalkablePier(world,options){
  const group=world.group,colliders=world.colliders;
  const dark=0x354144,steel=0x4a595c,concrete=0x8c918b,wood=0x806b4e,warning=0xb79a55;

  // Quay top is about +0.095 m. The pier matches that elevation so movement
  // remains visually grounded without a step/teleport seam.
  box(group,[8.2,.38,15.3],[0,-.095,-71.3],concrete,options.shadows);
  box(group,[.34,.56,15.45],[-4.02,-.18,-71.3],dark,options.shadows);
  box(group,[.34,.56,15.45],[4.02,-.18,-71.3],dark,options.shadows);
  box(group,[8.2,.58,.42],[0,-.18,-78.84],dark,options.shadows);

  // Chunky anti-alias-safe edge furniture. No LineBasicMaterial and no
  // near-coplanar bright strips are used anywhere on the pier.
  const posts=[];
  for(const side of [-1,1]){
    for(const z of [-65.1,-67.7,-76.2,-78.1]){
      posts.push(cylinder(group,.065,1.0,[side*3.92,.62,z],steel,10,options.shadows));
    }
    beam(group,[side*3.92,1.06,-65.1],[side*3.92,1.06,-67.7],.045,steel,8,options.shadows);
    beam(group,[side*3.92,1.06,-76.2],[side*3.92,1.06,-78.1],.045,steel,8,options.shadows);
  }
  for(const x of [-3.92,-1.3,1.3,3.92])cylinder(group,.065,1.0,[x,.62,-78.18],steel,10,options.shadows);
  for(const x of [-3.92,-1.3,1.3])beam(group,[x,1.06,-78.18],[x+2.62,1.06,-78.18],.045,steel,8,options.shadows);

  // Mooring bollards and rope-safe working edge.
  for(const [x,z] of [[-2.75,-69.0],[2.75,-69.0],[-2.75,-75.0],[2.75,-75.0]]){
    cylinder(group,.20,.43,[x,.32,z],dark,12,options.shadows);
    cylinder(group,.29,.11,[x,.57,z],dark,12,options.shadows);
    colliders.push({x,z,w:.46,d:.46});
  }

  // Ladder down the starboard wall beside the fishing boat.
  beam(group,[3.86,.72,-72.1],[3.86,-.75,-72.1],.035,warning,8,false);
  beam(group,[3.86,.72,-72.7],[3.86,-.75,-72.7],.035,warning,8,false);
  for(let y=.55;y>-.65;y-=.23)beam(group,[3.86,y,-72.1],[3.86,y,-72.7],.028,warning,8,false);

  // End-of-pier service box, timber pallet and coiled rope add readable scale.
  box(group,[1.05,1.25,.72],[-2.65,.71,-76.7],0x56686a,options.shadows);
  box(group,[.85,.07,.77],[-2.65,1.08,-76.32],0xb7aa7f,false);
  colliders.push({x:-2.65,z:-76.7,w:1.15,d:.85});
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.34+i*.06,.04,6,18),toon(0x9b825e));
    ring.rotation.x=Math.PI/2;ring.rotation.z=i*.17;ring.position.set(2.45,.16+i*.03,-76.6);ring.castShadow=false;group.add(ring);
  }

  // Small harbour lamp with a restrained warm source on capable devices.
  cylinder(group,.07,3.1,[0,1.65,-77.25],steel,10,options.shadows);
  box(group,[.68,.12,.24],[0,3.05,-77.25],steel,options.shadows);
  const lampMat=new THREE.MeshToonMaterial({color:0xd9ad68,gradientMap:gradient,emissive:0xd9ad68,emissiveIntensity:.28});
  const lamp=new THREE.Mesh(new THREE.BoxGeometry(.42,.18,.20),lampMat);lamp.position.set(0,2.88,-77.25);lamp.castShadow=false;group.add(lamp);

  // Visual mooring ropes toward the existing fishing vessel. Cylinders avoid
  // the sub-pixel shimmer of line primitives.
  beam(group,[3.55,.43,-69.1],[7.45,.12,-68.7],.022,0x6f6049,6,false);
  beam(group,[3.55,.43,-74.8],[7.45,.12,-73.5],.022,0x6f6049,6,false);

  const a=new THREE.Object3D();a.position.set(0,1,-76.4);group.add(a);
  options.register?.(a,'Fish from the outer pier',()=>options.onAction?.('fishing'));

  return {posts:posts.length,collidersAdded:5};
}

function findSea(group){
  let sea=null;
  group.traverse(o=>{
    const p=o.geometry?.parameters;
    if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&p?.width===160&&p?.height===86)sea=o;
  });
  return sea;
}

export function createTown(options){
  const world=createBaseTown(options);
  const cableSegments=replaceCableLines(world.group,options.mobile);
  const pier=addWalkablePier(world,options);
  const sea=findSea(world.group);

  let normalTick=-1;
  if(sea?.material){sea.material.flatShading=true;sea.material.dithering=true;sea.material.needsUpdate=true;}
  const baseUpdate=world.update.bind(world);
  world.update=(dt,time,day)=>{
    baseUpdate(dt,time,day);
    if(sea){
      const tick=Math.floor(time*10);
      if(tick!==normalTick){normalTick=tick;sea.geometry.computeVertexNormals();sea.geometry.attributes.normal.needsUpdate=true;}
    }
  };

  world.quality={
    ...(world.quality||{}),
    cableSegments,
    walkableOuterPier:true,
    pierPosts:pier.posts,
    antiShimmerCables:true,
    animatedWaterNormals:!!sea
  };
  return world;
}
