import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';
import { createTown as createBaseTown } from './world.js?v=12-base';

// Johansson Town professionalisation layer.
// Resource discovery is guided by Fasani/three-js-resources (MIT), especially
// Poly Haven / Texture Haven for CC0 surfaces and Kenney for game-asset conventions.
// This module deliberately keeps runtime props procedural/local for reliable iOS loading.

const bands=new Uint8Array([40,40,40,255,96,96,96,255,158,158,158,255,216,216,216,255,255,255,255,255]);
const gradient=new THREE.DataTexture(bands,5,1,THREE.RGBAFormat);
gradient.needsUpdate=true;gradient.magFilter=THREE.NearestFilter;gradient.minFilter=THREE.NearestFilter;gradient.generateMipmaps=false;

function toon(color,emissive=0,emissiveIntensity=0){return new THREE.MeshToonMaterial({color,gradientMap:gradient,dithering:true,emissive,emissiveIntensity});}
function box(parent,size,pos,color,shadow=true,material=null){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material||toon(color));m.position.set(...pos);m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;}
function cylinder(parent,radius,height,pos,color,segments=10,shadow=true){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),toon(color));m.position.set(...pos);m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;}
function beam(parent,a,b,radius,color,segments=8,shadow=true){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(bv,av);const geo=new THREE.CylinderGeometry(radius,radius,d.length(),segments);const m=new THREE.Mesh(geo,toon(color));m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());m.castShadow=shadow;m.receiveShadow=shadow;parent.add(m);return m;}
function anchor(parent,pos,label,fn,register){const a=new THREE.Object3D();a.position.set(...pos);parent.add(a);register?.(a,label,fn);return a;}

function replaceCableLines(group,mobile){
  const lines=[];group.traverse(o=>{if(o.isLine&&o.geometry?.getAttribute('position'))lines.push(o);});if(!lines.length)return 0;
  const segments=[],a=new THREE.Vector3(),b=new THREE.Vector3();
  for(const line of lines){const pos=line.geometry.getAttribute('position');for(let i=0;i<pos.count-1;i++){a.fromBufferAttribute(pos,i);b.fromBufferAttribute(pos,i+1);line.localToWorld(a);line.localToWorld(b);group.worldToLocal(a);group.worldToLocal(b);segments.push({a:a.clone(),b:b.clone()});}}
  const unit=new THREE.CylinderGeometry(1,1,1,6,1,false),mat=new THREE.MeshBasicMaterial({color:0x20292b}),cables=new THREE.InstancedMesh(unit,mat,segments.length);cables.name='stable-overhead-cables';cables.castShadow=false;cables.receiveShadow=false;cables.frustumCulled=true;
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),mid=new THREE.Vector3(),dir=new THREE.Vector3(),radius=mobile?.021:.018;
  segments.forEach((s,i)=>{dir.subVectors(s.b,s.a);const len=dir.length();mid.copy(s.a).add(s.b).multiplyScalar(.5);dummy.position.copy(mid);dummy.quaternion.setFromUnitVectors(up,dir.normalize());dummy.scale.set(radius,len,radius);dummy.updateMatrix();cables.setMatrixAt(i,dummy.matrix);});
  cables.instanceMatrix.needsUpdate=true;group.add(cables);
  for(const line of lines){line.parent?.remove(line);line.geometry?.dispose();if(Array.isArray(line.material))line.material.forEach(m=>m.dispose?.());else line.material?.dispose?.();}
  return segments.length;
}

function addWalkablePier(world,options){
  const group=world.group,colliders=world.colliders,dark=0x354144,steel=0x4a595c,concrete=0x8c918b,warning=0xb79a55;
  box(group,[8.2,.38,15.3],[0,-.095,-71.3],concrete,options.shadows);box(group,[.34,.56,15.45],[-4.02,-.18,-71.3],dark,options.shadows);box(group,[.34,.56,15.45],[4.02,-.18,-71.3],dark,options.shadows);box(group,[8.2,.58,.42],[0,-.18,-78.84],dark,options.shadows);
  const posts=[];
  for(const side of [-1,1]){for(const z of [-65.1,-67.7,-76.2,-78.1])posts.push(cylinder(group,.065,1,[side*3.92,.62,z],steel,10,options.shadows));beam(group,[side*3.92,1.06,-65.1],[side*3.92,1.06,-67.7],.045,steel,8,options.shadows);beam(group,[side*3.92,1.06,-76.2],[side*3.92,1.06,-78.1],.045,steel,8,options.shadows);}
  for(const x of [-3.92,-1.3,1.3,3.92])cylinder(group,.065,1,[x,.62,-78.18],steel,10,options.shadows);for(const x of [-3.92,-1.3,1.3])beam(group,[x,1.06,-78.18],[x+2.62,1.06,-78.18],.045,steel,8,options.shadows);
  for(const [x,z] of [[-2.75,-69],[2.75,-69],[-2.75,-75],[2.75,-75]]){cylinder(group,.20,.43,[x,.32,z],dark,12,options.shadows);cylinder(group,.29,.11,[x,.57,z],dark,12,options.shadows);colliders.push({x,z,w:.46,d:.46});}
  beam(group,[3.86,.72,-72.1],[3.86,-.75,-72.1],.035,warning,8,false);beam(group,[3.86,.72,-72.7],[3.86,-.75,-72.7],.035,warning,8,false);for(let y=.55;y>-.65;y-=.23)beam(group,[3.86,y,-72.1],[3.86,y,-72.7],.028,warning,8,false);
  box(group,[1.05,1.25,.72],[-2.65,.71,-76.7],0x56686a,options.shadows);box(group,[.85,.07,.77],[-2.65,1.08,-76.32],0xb7aa7f,false);colliders.push({x:-2.65,z:-76.7,w:1.15,d:.85});
  for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.34+i*.06,.04,6,18),toon(0x9b825e));ring.rotation.x=Math.PI/2;ring.rotation.z=i*.17;ring.position.set(2.45,.16+i*.03,-76.6);ring.castShadow=false;group.add(ring);}
  cylinder(group,.07,3.1,[0,1.65,-77.25],steel,10,options.shadows);box(group,[.68,.12,.24],[0,3.05,-77.25],steel,options.shadows);const lampMat=toon(0xd9ad68,0xd9ad68,.28),lamp=new THREE.Mesh(new THREE.BoxGeometry(.42,.18,.20),lampMat);lamp.position.set(0,2.88,-77.25);lamp.castShadow=false;group.add(lamp);
  beam(group,[3.55,.43,-69.1],[7.45,.12,-68.7],.022,0x6f6049,6,false);beam(group,[3.55,.43,-74.8],[7.45,.12,-73.5],.022,0x6f6049,6,false);
  anchor(group,[0,1,-76.4],'Fish from the outer pier',()=>options.onAction?.('fishing'),options.register);
  anchor(group,[-2.65,1.2,-75.8],'Inspect harbour service box',()=>options.onAction?.('inspect','Harbour service box','A weathered electrical service cabinet feeds the pier lamps and refrigeration sockets. The inspection label is dated 1988.'),options.register);
  anchor(group,[2.45,.8,-75.9],'Inspect mooring rope',()=>options.onAction?.('inspect','Mooring rope','Heavy natural-fibre rope has been coiled neatly after the morning fishing boats departed.'),options.register);
  return {posts:posts.length,collidersAdded:5};
}

function addStreetLife(world,options){
  const group=world.group,colliders=world.colliders,lights=[];let interactions=0;
  const registerInspect=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('inspect',title,text),options.register);interactions++;};
  const registerSeat=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('seat',title,text),options.register);interactions++;};

  (options.sites||[]).forEach((s,i)=>{
    const side=s.side,x=side*6.93,z=s.z+2.5;
    box(group,[.72,.025,1.2],[x,.15,z],0x5e5549,false);
    const sign=box(group,[.12,1.25,.56],[side*7.03,2.1,s.z+.65],i%2?0xd7cfb7:0xc9d2c5,options.shadows);sign.rotation.z=side*.02;
    const lanternMat=toon(0xd7a45f,0xd7a45f,.24),lantern=box(group,[.22,.42,.22],[side*6.92,2.55,s.z+1.65],0xd7a45f,false,lanternMat);
    if(options.shadows&&!options.mobile){const l=new THREE.PointLight(0xffbd77,0,5.2,2);l.position.copy(lantern.position);group.add(l);lights.push(l);}
    const px=side*6.55,pz=s.z+3.75;cylinder(group,.23,.42,[px,.34,pz],0x8a6b55,10,options.shadows);const plant=new THREE.Mesh(new THREE.SphereGeometry(.34,9,7),toon(i%2?0x607958:0x6e815a));plant.scale.set(1,.9,1);plant.position.set(px,.82,pz);group.add(plant);colliders.push({x:px,z:pz,w:.52,d:.52});
    registerInspect([side*6.25,1,s.z+.7],`Inspect ${s.title} window`,`${s.title} display`,s.line+' The window display has been arranged by hand for the evening trade.');
  });

  const bench=(x,z,rot=0)=>{const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;group.add(g);box(g,[1.75,.12,.48],[0,.55,0],0x725a43,options.shadows);box(g,[1.75,.62,.10],[0,.90,.22],0x725a43,options.shadows);for(const dx of [-.68,.68])for(const dz of [-.16,.16])box(g,[.10,.52,.10],[dx,.28,dz],0x465052,options.shadows);colliders.push({x,z,w:1.9,d:.7});};
  bench(-5.9,25,0);registerSeat([-5.5,1,25.2],'Sit on neighbourhood bench','Neighbourhood bench','From here the shop signs, bicycles and overhead cables make the street feel almost domestic.');

  box(group,[.72,1.15,.62],[6.05,.72,11.2],0x9a483e,options.shadows);box(group,[.52,.08,.12],[6.05,1.02,10.86],0x2e3434,false);colliders.push({x:6.05,z:11.2,w:.78,d:.68});registerInspect([5.7,1,11.2],'Inspect post box','Post box','The collection plate lists two pickups: 10:30 and 16:30. A few handwritten postcards are visible through the slot.');

  box(group,[.86,1.08,.52],[-6.05,.66,-1.8],0x4c6368,options.shadows);for(let y=.44;y<1.05;y+=.2)box(group,[.70,.04,.42],[-6.05,y,-1.52],0xd7cfb8,false);colliders.push({x:-6.05,z:-1.8,w:.9,d:.6});registerInspect([-5.7,1,-1.8],'Read newspaper rack','Evening papers','Local headlines mention harbour maintenance, a school baseball result and tomorrow’s weather.');

  for(const [x,c] of [[5.72,0x4c6f62],[6.25,0x6a6651]]){cylinder(group,.25,.78,[x,.49,-23.6],c,10,options.shadows);box(group,[.54,.08,.54],[x,.91,-23.6],0x384547,false);}colliders.push({x:6,z:-23.6,w:1.1,d:.65});registerInspect([5.5,1,-23.1],'Inspect recycling bins','Neighbourhood recycling','Glass bottles are separated from steel cans. The labels are faded from sun and salt air.');

  box(group,[1.05,.09,.58],[-6.0,.35,-34.5],0x4b5553,options.shadows);for(const x of [-6.42,-5.58])cylinder(group,.09,.18,[x,.18,-34.5],0x24292a,10,false);box(group,[.58,.48,.46],[-6.12,.64,-34.5],0x9b7651,options.shadows);box(group,[.44,.32,.38],[-5.72,.55,-34.45],0x806344,options.shadows);colliders.push({x:-6,z:-34.5,w:1.2,d:.75});registerInspect([-5.55,1,-33.9],'Inspect delivery trolley','Delivery trolley','Cardboard parcels are addressed to several shops in the arcade. The handwriting and string ties suit the late-Showa setting.');

  for(const x of [5.55,6.75])cylinder(group,.06,2.2,[x,1.2,-49.5],0x58635f,8,options.shadows);box(group,[1.35,1.15,.10],[6.15,1.65,-49.5],0xcfc5a8,options.shadows);colliders.push({x:6.15,z:-49.5,w:1.4,d:.25});registerInspect([5.75,1,-48.8],'Read harbour notices','Harbour notice board','Notices cover tide times, a lost glove, fish-market hours and a warning about the outer pier after dark.');

  box(group,[.82,1.35,.55],[-6.05,.78,41.5],0x52676b,options.shadows);box(group,[.28,.42,.10],[-5.62,.92,41.5],0xa94f42,false);colliders.push({x:-6.05,z:41.5,w:.9,d:.65});registerInspect([-5.6,1,40.9],'Inspect utility cabinet','Street utility cabinet','Telephone and power distribution diagrams are tucked behind the inspection glass.');

  return {interactions,lights};
}

function findSea(group){let sea=null;group.traverse(o=>{const p=o.geometry?.parameters;if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&p?.width===160&&p?.height===86)sea=o;});return sea;}

export function createTown(options){
  const world=createBaseTown(options),cableSegments=replaceCableLines(world.group,options.mobile),pier=addWalkablePier(world,options),street=addStreetLife(world,options),sea=findSea(world.group);
  let normalTick=-1;
  if(sea?.material){sea.material.flatShading=true;sea.material.dithering=true;sea.material.needsUpdate=true;}
  const baseUpdate=world.update.bind(world);
  world.update=(dt,time,day)=>{
    baseUpdate(dt,time,day);
    for(const l of street.lights)l.intensity=THREE.MathUtils.damp(l.intensity,(1-day)*1.55,4,dt);
    if(sea){const tick=Math.floor(time*10);if(tick!==normalTick){normalTick=tick;sea.geometry.computeVertexNormals();sea.geometry.attributes.normal.needsUpdate=true;}}
  };
  world.quality={...(world.quality||{}),cableSegments,walkableOuterPier:true,pierPosts:pier.posts,streetInteractions:street.interactions,antiShimmerCables:true,animatedWaterNormals:!!sea,resourceCatalogue:'Fasani/three-js-resources'};
  return world;
}
