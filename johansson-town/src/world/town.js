import {buildSeaCave} from './sea-cave.js';
import {buildPark} from './park.js';
import {buildIzakaya} from './izakaya.js';
import {batchStaticProps} from '../render/static-props.js';
import {RESIDENTS} from '../people/residents.js';
import {izakayaOpen} from '../people/social.js';
import {OUTER_PIER,groundHeight} from './layout.js';
import {buildDistricts} from './districts.js';
import * as THREE from '../../vendor/three.module.js';
import { createTown as createBaseTown } from './harbour.js?warehouse=1';
import { createPropFactory, createLivingProps } from '../../prop-factory.js';
import {buildStreetPlants} from './street-plants.js';
import {createMaterials} from '../render/materials.js';

// Johansson Town district composition and street interactions.
// Resource discovery is guided by Fasani/three-js-resources. Production runtime
// assets remain local and every sourced element has a deterministic procedural fallback.

function anchor(parent,pos,label,fn,register){
  const a=new THREE.Object3D();a.position.set(...pos);parent.add(a);register?.(a,label,fn);return a;
}

function replaceCableLines(group,mobile){
  const lines=[];group.traverse(o=>{if(o.isLine&&o.geometry?.getAttribute('position'))lines.push(o);});if(!lines.length)return 0;
  const segments=[],a=new THREE.Vector3(),b=new THREE.Vector3();
  for(const line of lines){
    const pos=line.geometry.getAttribute('position');
    for(let i=0;i<pos.count-1;i++){
      a.fromBufferAttribute(pos,i);b.fromBufferAttribute(pos,i+1);line.localToWorld(a);line.localToWorld(b);group.worldToLocal(a);group.worldToLocal(b);segments.push({a:a.clone(),b:b.clone()});
    }
  }
  const unit=new THREE.CylinderGeometry(1,1,1,6,1,false),mat=new THREE.MeshBasicMaterial({color:0x20292b}),cables=new THREE.InstancedMesh(unit,mat,segments.length);
  cables.name='stable-overhead-cables';cables.castShadow=false;cables.receiveShadow=false;cables.frustumCulled=true;
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),mid=new THREE.Vector3(),dir=new THREE.Vector3(),radius=mobile?.021:.018;
  segments.forEach((s,i)=>{dir.subVectors(s.b,s.a);const len=dir.length();mid.copy(s.a).add(s.b).multiplyScalar(.5);dummy.position.copy(mid);dummy.quaternion.setFromUnitVectors(up,dir.normalize());dummy.scale.set(radius,len,radius);dummy.updateMatrix();cables.setMatrixAt(i,dummy.matrix);});
  cables.instanceMatrix.needsUpdate=true;group.add(cables);
  for(const line of lines){line.parent?.remove(line);line.geometry?.dispose();if(Array.isArray(line.material))line.material.forEach(m=>m.dispose?.());else line.material?.dispose?.();}
  return segments.length;
}

function addWithCollider(group,colliders,entry){
  if(!entry)return null;group.add(entry.object);if(entry.collider){const bounds=new THREE.Box3().setFromObject(entry.object);entry.collider.height=bounds.max.y;entry.collider.minY=bounds.min.y;colliders.push(entry.collider);}return entry.object;
}

function addWalkablePier(world,options,factory){
  const group=world.group,colliders=world.colliders,dark=0x354144,steel=0x4a595c,concrete=0x8c918b,warning=0xb79a55;
  factory.box(group,[OUTER_PIER.width,.38,OUTER_PIER.length],[OUTER_PIER.x,OUTER_PIER.height-.003-.19,OUTER_PIER.z],concrete,null,options.shadows);
  factory.box(group,[.34,.56,15.45],[-4.02,-.18,-71.3],dark,null,options.shadows);
  factory.box(group,[.34,.56,15.45],[4.02,-.18,-71.3],dark,null,options.shadows);
  factory.box(group,[8.2,.58,.42],[0,-.18,-78.84],dark,null,options.shadows);
  const posts=[];
  for(const side of [-1,1]){
    for(const z of [-65.1,-67.7,-76.2,-78.1])posts.push(factory.cylinder(group,.065,1,[side*3.92,.62,z],steel,10));
    factory.beam(group,[side*3.92,1.06,-65.1],[side*3.92,1.06,-67.7],.045,steel);
    factory.beam(group,[side*3.92,1.06,-76.2],[side*3.92,1.06,-78.1],.045,steel);
  }
  for(const x of [-3.92,-1.3,1.3,3.92])factory.cylinder(group,.065,1,[x,.62,-78.18],steel,10);
  for(const x of [-3.92,-1.3,1.3])factory.beam(group,[x,1.06,-78.18],[x+2.62,1.06,-78.18],.045,steel);
  for(const [x,z] of [[-2.75,-69],[2.75,-69],[-2.75,-75],[2.75,-75]]){
    factory.cylinder(group,.20,.43,[x,.32,z],dark,12);factory.cylinder(group,.29,.11,[x,.57,z],dark,12);colliders.push({x,z,w:.46,d:.46});
  }
  factory.beam(group,[3.86,.72,-72.1],[3.86,-.75,-72.1],.035,warning,8,null,false);
  factory.beam(group,[3.86,.72,-72.7],[3.86,-.75,-72.7],.035,warning,8,null,false);
  for(let y=.55;y>-.65;y-=.23)factory.beam(group,[3.86,y,-72.1],[3.86,y,-72.7],.028,warning,8,null,false);

  addWithCollider(group,colliders,factory.baitStation(-2.45,-76.55,.03));
  addWithCollider(group,colliders,factory.pierWinch(2.35,-75.25,-.08));
  addWithCollider(group,colliders,factory.crateStack(-2.35,-72.8,.06));

  const ropeMat=factory.material(null,0x9b825e,.92,0);
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.34+i*.06,.04,6,18),ropeMat);ring.rotation.x=Math.PI/2;ring.rotation.z=i*.17;ring.position.set(2.45,.16+i*.03,-76.6);ring.castShadow=false;group.add(ring);
  }

  factory.cylinder(group,.07,3.1,[0,1.65,-77.25],steel,10);
  factory.box(group,[.68,.12,.24],[0,3.05,-77.25],steel);
  const lampMat=factory.material(null,0xd9ad68,.78,0,0xd9ad68,.32),lamp=new THREE.Mesh(new THREE.BoxGeometry(.42,.18,.20),lampMat);lamp.position.set(0,2.88,-77.25);lamp.castShadow=false;group.add(lamp);
  factory.beam(group,[3.55,.43,-69.1],[7.45,.12,-68.7],.022,0x6f6049,6,null,false);
  factory.beam(group,[3.55,.43,-74.8],[7.45,.12,-73.5],.022,0x6f6049,6,null,false);

  anchor(group,[0,1,-76.4],'Fish from the outer pier',()=>options.onAction?.('fishing'),options.register);
  anchor(group,[-2.45,1.1,-75.8],'Inspect bait station',()=>options.onAction?.('inspect','Harbour bait station','Ice, hooks, sinkers and bait tins are arranged for the evening fishermen. The counter is scarred by years of salt water.'),options.register);
  anchor(group,[2.3,1,-74.6],'Operate pier winch',()=>options.onAction?.('machine','Pier winch','A compact electric winch used to haul baskets and light gear from the quay. The guarded drum turns slowly during a test cycle.'),options.register);
  anchor(group,[2.45,.8,-76.0],'Inspect mooring rope',()=>options.onAction?.('inspect','Mooring rope','Heavy natural-fibre rope has been coiled neatly after the morning fishing boats departed.'),options.register);
  return {posts:posts.length,collidersAdded:7};
}

function addSiteFrontage(world,options,factory,lights){
  const group=world.group,colliders=world.colliders;let interactions=0;
  const inspect=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('inspect',title,text),options.register);interactions++;};
  (options.sites||[]).forEach((s,i)=>{
    if(s.id==='market'||world.harbourShops.some(shop=>shop.id===s.id))return;
    const side=s.side,x=side*6.88,z=s.z+2.55,frontRot=side<0?Math.PI/2:-Math.PI/2;
    factory.box(group,[.72,.025,1.2],[x,.15,z],0x5e5549,'timber',false);
    const awn=addWithCollider(group,colliders,factory.awning(side*6.95,s.z+1.2,frontRot,i%3===0?0x65766f:i%3===1?0x7b5e54:0x596b73));
    addWithCollider(group,colliders,factory.noren(side*6.90,s.z+2.08,frontRot,i%2?0x5c6571:0x78615c));
    if(i%2===0)addWithCollider(group,colliders,factory.airConditioner(side*7.15,s.z-1.25,frontRot));
    const px=side*6.48,pz=s.z+3.78;world.plantSites.push({x:px,z:pz,height:1.1});colliders.push({x:px,z:pz,w:.52,d:.52});
    const lantern=factory.box(group,[.24,.44,.24],[side*6.88,2.58,s.z+1.68],0xd7a45f,null,false);lantern.material=factory.material(null,0xd7a45f,.8,0,0xd7a45f,.28);
    if(options.shadows&&!options.mobile){const l=new THREE.PointLight(0xffbd77,0,5.2,2);l.position.copy(lantern.position);group.add(l);lights.push(l);}
    inspect([side*6.18,1,s.z+.72],`Inspect ${s.title} window`,`${s.title} display`,`${s.line} The display includes handwritten price cards, paper notices and period shop fittings.`);
    if(awn)awn.userData.site=s.id;
  });
  return interactions;
}

function addStreetLife(world,options,factory){
  const group=world.group,colliders=world.colliders,lights=[];let interactions=addSiteFrontage(world,options,factory,lights);
  const inspect=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('inspect',title,text),options.register);interactions++;};
  const read=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('read',title,text),options.register);interactions++;};
  const seat=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('seat',title,text),options.register);interactions++;};
  const machine=(pos,label,title,text)=>{anchor(group,pos,label,()=>options.onAction?.('machine',title,text),options.register);interactions++;};
  const buy=(pos,label,title,detail)=>{anchor(group,pos,label,()=>options.onAction?.('buy',title,detail),options.register);interactions++;};

  addWithCollider(group,colliders,factory.bench(-5.9,25,0));
  seat([-5.45,1,25.15],'Sit on neighbourhood bench','Neighbourhood bench','From here the shop signs, bicycles and overhead cables make the street feel almost domestic.');

  addWithCollider(group,colliders,factory.postbox(6.05,11.2,0));
  inspect([5.65,1,11.0],'Inspect post box','Post box','The collection plate lists two pickups: 10:30 and 16:30. A few handwritten postcards are visible through the slot.');

  addWithCollider(group,colliders,factory.newspaperRack(-6.05,-1.8,0));
  read([-5.65,1,-1.55],'Read evening papers','Evening papers','Local headlines mention harbour maintenance, a school baseball result and tomorrow’s weather.');
  buy([-5.65,1,-2.05],'Buy newspaper · ¥80','Evening newspaper',{cost:80,item:'Evening newspaper',text:'A folded local evening paper dated September 1988.'});

  addWithCollider(group,colliders,factory.deliveryTrolley(-6,-34.5,.02));
  inspect([-5.52,1,-33.95],'Inspect delivery trolley','Delivery trolley','Cardboard parcels are addressed to several shops in the arcade. The handwriting and string ties suit the late-Shōwa setting.');

  addWithCollider(group,colliders,factory.noticeBoard(6.15,-49.5,0));
  read([5.75,1,-48.8],'Read harbour notices','Harbour notice board','Notices cover tide times, a lost glove, fish-market hours and a warning about the outer pier after dark.');

  addWithCollider(group,colliders,factory.utilityCabinet(-6.05,41.5,0));
  inspect([-5.6,1,40.9],'Inspect utility cabinet','Street utility cabinet','Telephone and power distribution diagrams are tucked behind the inspection glass.');

  addWithCollider(group,colliders,factory.bicycleRack(5.95,31.7,0));
  inspect([5.55,1,31.1],'Inspect bicycle rack','Bicycle rack','Two empty loops are polished smooth by daily use. A bicycle pump has been chained to the end post.');

  addWithCollider(group,colliders,factory.convexMirror(-6.15,16.2,.02));
  inspect([-5.7,1,15.7],'Inspect traffic mirror','Convex traffic mirror','The mirror gives a broad view of the narrow side street and helps cyclists see around the corner.');


  addWithCollider(group,colliders,factory.crateStack(5.75,-7.4,.05));
  inspect([5.35,1,-6.75],'Inspect shop crates','Shop deliveries','Tea tins, paper goods and wrapped household stock are waiting to be carried inside.');

  const radio=factory.box(group,[.58,.34,.24],[5.9,.72,4.1],0x3e4b4c);factory.box(group,[.34,.12,.025],[5.9,.77,3.96],0xb6aa83,null,false);colliders.push({x:5.9,z:4.1,w:.65,d:.34});
  anchor(group,[5.55,1,4.0],'Tune street radio',()=>options.onAction?.('radio','Workshop radio','A small transistor radio on the sill carries harbour weather, baseball scores and light music.'),options.register);interactions++;

  const recycleGroup=new THREE.Group();recycleGroup.position.set(6,0,-23.6);group.add(recycleGroup);
  for(const [dx,c] of [[-.28,0x4c6f62],[.28,0x6a6651]]){factory.cylinder(recycleGroup,.25,.78,[dx,.49,0],c,10);factory.box(recycleGroup,[.54,.08,.54],[dx,.91,0],0x384547);}colliders.push({x:6,z:-23.6,w:1.1,d:.65});
  inspect([5.5,1,-23.1],'Inspect recycling bins','Neighbourhood recycling','Glass bottles are separated from steel cans. The labels are faded from sun and salt air.');

  const pump=factory.box(group,[.65,.85,.55],[-5.95,.52,-45.5],0x536568);factory.cylinder(group,.16,.45,[-5.95,1.12,-45.5],0x3d4c4e,12);colliders.push({x:-5.95,z:-45.5,w:.72,d:.62});
  machine([-5.55,1,-45.0],'Test hand pump','Harbour hand pump','A small utility pump used to rinse fish boxes and clean the pavement. The handle and check valve operate correctly.');

  return {interactions,lights};
}

function findSea(group){let sea=null;group.traverse(o=>{const p=o.geometry?.parameters;if(o.isMesh&&o.geometry?.type==='PlaneGeometry'&&p?.width===160&&p?.height===86)sea=o;});return sea;}

export function createTown(options){
  const world=createBaseTown(options);
  for(const [name,x,z] of [['Bus driver',-4.5,44]]){
    const g=new THREE.Group();g.position.set(x,0,z);g.userData.name=name;world.group.add(g);
    world.people.push({g,x,z,index:world.people.length,legs:[],arms:[]});
    options.register(g,'Talk to '+name,()=>options.onAction('resident',name));
  }
  const factory=createPropFactory({shadows:options.shadows,maxAnisotropy:options.maxAnisotropy});
  const cableSegments=replaceCableLines(world.group,options.mobile),pier=addWalkablePier(world,options,factory),street=addStreetLife(world,options,factory),sea=findSea(world.group);
  const originalSites=[...options.sites],districts=buildDistricts(world,options);
  const isOpen=(site,minutes)=>{if(!site)return false;const h=((minutes%1440)+1440)%1440;if(site.id==='izakaya')return izakayaOpen(h);const close=site.id==='market'?1200:site.id==='frontrow'?1110:site.id==='sento'||site.id==='ramen'?1260:site.id==='home'||site.id==='yuri-home'||site.id==='bus-hut'?1440:1140;return site.id==='home'||site.id==='yuri-home'||site.id==='bus-hut'||h>=540&&h<close;};
  for(const profile of RESIDENTS){let p=world.people.find(p=>p.g.userData.name===profile.name);if(!p){const g=new THREE.Group();g.userData.name=profile.name;g.position.set(profile.work[0],groundHeight(...profile.work),profile.work[1]);world.group.add(g);p={g,x:g.position.x,z:g.position.z,index:world.people.length,legs:[],arms:[]};world.people.push(p);options.register(g,'Talk to '+profile.name,()=>options.onAction('resident',profile.name));}p.profile=profile;p.g.position.set(profile.work[0],groundHeight(...profile.work),profile.work[1]);}
  for(const s of originalSites){if(world.harbourShops.some(shop=>shop.id===s.id))continue;const panel=new THREE.Mesh(new THREE.BoxGeometry(.16,2.5,1.4),factory.material(null,s.color,.9));panel.position.set(s.side*7.05,4.8,s.z+2.55);world.group.add(panel);districts.shutters.push({mesh:panel,id:s.id});}
  buildIzakaya(world,options);buildPark(world,options);buildSeaCave(world,options);
  const plants=buildStreetPlants(world.group,world.plantSites,options);
  // The quay's upper surface receives the same detailed concrete as its walls.
  const surfaces=createMaterials({mobile:options.mobile,anisotropy:options.maxAnisotropy});
  const pierSurface=new THREE.Mesh(new THREE.PlaneGeometry(OUTER_PIER.width-.05,OUTER_PIER.length-.05),surfaces.worldMaterial('concrete',0xc0beb5,2));
  pierSurface.name='pier-concrete-surface';pierSurface.rotation.x=-Math.PI/2; pierSurface.position.set(OUTER_PIER.x,OUTER_PIER.height,OUTER_PIER.z);pierSurface.receiveShadow=true;world.group.add(pierSurface);
  world.isOpen=isOpen;world.updateHours=minutes=>{for(const {mesh,id} of districts.shutters){const open=isOpen(options.sites.find(s=>s.id===id),minutes);mesh.position.y=1.3;mesh.visible=!open;mesh.userData.closed=!open;}for(const m of districts.windows)m.material.emissiveIntensity=minutes%1440>=1080? .8:.02;};
  let normalTick=-1;
  const staticProps=batchStaticProps(world.group);
  world.beats=createLivingProps(world,factory);
  if(sea?.material){sea.material.flatShading=false;sea.material.dithering=true;sea.material.needsUpdate=true;}
  const baseUpdate=world.update.bind(world);
  world.update=(dt,time,day,minutes=1002)=>{
    world.updateHours(minutes);
    for(const shop of world.harbourShops)shop.update(isOpen(options.sites.find(s=>s.id===shop.id),minutes),day);
    baseUpdate(dt,time,day);
    for(const l of street.lights)l.intensity=THREE.MathUtils.damp(l.intensity,(1-day)*1.55,4,dt);
    if(sea){const tick=Math.floor(time*10);if(tick!==normalTick){normalTick=tick;sea.geometry.computeVertexNormals();sea.geometry.attributes.normal.needsUpdate=true;}}
  };
  world.resources=factory.resources;
  world.quality={
    ...(world.quality||{}),
    cableSegments,
    harbourBlock:{shops:world.harbourShops.map(s=>s.id),nearTriangles:world.harbourShops.reduce((n,s)=>n+s.nearTriangles,0),farTriangles:world.harbourShops.reduce((n,s)=>n+s.farTriangles,0),boardwalk:true},
    staticProps,
    streetPlants:plants,
    walkableOuterPier:true,
    pierPosts:pier.posts,
    antiShimmerCables:true,
    animatedWaterNormals:!!sea,
    resourceBackedProps:true,
    streetInteractions:street.interactions,
    localRuntimeAssets:true,
    sourceCatalogue:factory.resources.catalogue
  };
  return world;
}
