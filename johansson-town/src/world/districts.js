import {buildLaneSurfaces} from './lane-surfaces.js?snappy=1';
import {buildHomes} from './homes.js';
import {buildRamenRestaurant} from './supplied-rooms.js?snappy=1';
import {buildTeaHouse} from './tea-house.js?snappy=1';
import * as THREE from '../../vendor/three.module.js';
import {ROUTES,groundHeight,nearestOnSegment} from './layout.js?snappy=1';
import {createMaterials} from '../render/materials.js?snappy=1';

// Modular timber, tiled roofs and open thresholds. Ground and collision share ROUTES.
export function buildDistricts(world,options){
  const {group,colliders}=world,library=createMaterials({mobile:options.mobile,anisotropy:options.maxAnisotropy}),batches=new Map(),shutters=[],windows=[],animators=[];
  const unit=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
  function box(size,pos,kind='concrete',colour=0xffffff,rotation=[0,0,0]){const mat=library.worldMaterial(kind,colour);const key=mat.uuid;if(!batches.has(key))batches.set(key,{mat,items:[]});dummy.position.set(...pos);dummy.rotation.set(...rotation);dummy.scale.set(...size);dummy.updateMatrix();batches.get(key).items.push(dummy.matrix.clone());}
  function verb(pos,label,kind,title,text){const a=new THREE.Object3D();a.position.set(...pos);group.add(a);options.register(a,label,()=>options.onAction(kind,title,text));return a;}
  function sign(text,sub,pos,w=2,h=.6,angle=0){const c=document.createElement('canvas');c.width=512;c.height=160;const x=c.getContext('2d');x.fillStyle='#dfd7bb';x.fillRect(0,0,512,160);x.fillStyle='#344e4a';x.textAlign='center';x.font='bold 64px serif';x.fillText(text,256,76,490);x.font='22px serif';x.fillText(sub,256,129,490);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.8,side:THREE.DoubleSide}));m.position.set(...pos);m.rotation.y=angle;group.add(m);return m;}
  buildLaneSurfaces(group,library);
  // Open-air shopping street. The former rotated transparent cylinder canopy
  // intersected the walking corridor and looked like vertical sheets of fog.
  function building({id,x,z,w=8,d=7,h=6,colour=0xbeb394,roof=0,angle=0,jp,title,frontZ=z+d/2}){
    box([w,h,.25],[x,h/2,z-d/2],'concrete',colour);for(const side of [-1,1])box([.25,h,d],[x+side*w/2,h/2,z],'concrete',colour);
    box([w,2.65,.3],[x,h-1.32,frontZ],'concrete',colour);for(const side of [-1,1])box([w/2-1.2,2.65,.3],[x+side*(w/4+.6),1.32,frontZ],'timber',0x8f866c);
    box([w,.18,d],[x,2.8,z],'timber',0x6d6453);
    if(roof===2){box([w+.65,.22,d+.65],[x,h+.15,z],'concrete',0x8e9487);box([1.7,1.5,1.8],[x+1.6,h+1,z],'concrete',0xa9a291);}
    else {const shape=new THREE.Shape();shape.moveTo(-w/2-.55,0);shape.lineTo(0,roof===1?.55:1.4);shape.lineTo(w/2+.55,0);shape.lineTo(w/2+.55,-.18);shape.lineTo(0,(roof===1?.55:1.4)-.18);shape.lineTo(-w/2-.55,-.18);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:d+1,bevelEnabled:false});const mesh=new THREE.Mesh(geo,library.worldMaterial('roof',roof===1?0x8c7c69:0x656f6a));mesh.position.set(x,h,z-d/2-.5);mesh.castShadow=options.shadows;group.add(mesh);}
    for(const side of [-1,1]){
      const sx=x+side*w*.29;box([1.7,1.45,.1],[sx,h-1.3,frontZ+.17],'timber',0x45594f);box([.06,1.52,.13],[sx,h-1.3,frontZ+.22],'concrete',0xb1b4a7);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.3),new THREE.MeshStandardMaterial({color:0x31443f,emissive:0xe4b573,emissiveIntensity:0,roughness:.4}));m.position.set(sx,h-1.3,frontZ+.24);windows.push(m);group.add(m);
    }
    for(const side of [-1,1])box([.06,2.6,.12],[x+side*1.05,1.3,frontZ+.2],'concrete',0xb5b6aa);
    const door=new THREE.Mesh(new THREE.BoxGeometry(2.1,2.6,.13),library.worldMaterial('bamboo',0x938c72,1.5));door.position.set(x,4,frontZ+.15);group.add(door);shutters.push({mesh:door,id});
    sign(jp,title.toUpperCase(),[x,3.13,frontZ+.22],w*.83,.65);
    const plate=sign('営業中','09:00 – 21:00',[x+.62,1.6,frontZ+.25],.7,.36);plate.userData.site=id;
    box([1.1,.65,.65],[x-w*.37,3.68,frontZ+.42],'concrete',0xb8b4a1);for(let n=0;n<4;n++)box([.85,.04,.04],[x-w*.37,3.49+n*.11,frontZ+.77],'roof',0x605f53);
    box([.35,.55,.22],[x+w*.43,1.8,frontZ+.22],'concrete',0x7e8176);
    world.plantSites.push({x:x-w*.42,z:frontZ+.65,height:1.1});
    verb([x-w*.42,1,frontZ+1],'Inspect potted camellia','inspect','Camellia','The owner turns the pot a little every morning. A saucer catches the excess water.');
    verb([x+w*.42,1.4,frontZ+.8],'Read meter','read','Electricity meter','A mechanical disc turns behind the glass. The last reading was entered in pencil.');
    colliders.push({x,z:z-d/2,w,d:.35,height:h},{x:x-w/2,z,w:.35,d,height:h},{x:x+w/2,z,w:.35,d,height:h});
    const s={id,x,z,title,jp,sub:'JOHANSSON町',color:colour,accent:'#4c655a',line:title+' · 14 September 1988',door:[x,0,frontZ+1],opens:'09:00'};
    if(id==='ramen'||id==='crystal-room'){options.sites.push(s);const a=new THREE.Object3D();a.position.set(x,1.3,frontZ+.65);group.add(a);options.register(a,'Enter '+title,()=>options.enter(s));}else{verb([x,1,frontZ+.8],'Read '+title+' notice','read',title,'The curtains are drawn. A paper sign gives the evening opening hours.');}
    return s;
  }
  building({id:'sento',x:-34,z:34,w:9,d:8,h:6,jp:'港の湯',title:'Minato Bathhouse',roof:2,colour:0x959f95});
  box([1.15,17,1.15],[-37,8.5,30],'concrete',0x8d8b7a);
  buildTeaHouse(world,options);
  if(!buildRamenRestaurant(world,options)){
    building({id:'ramen',x:24,z:10,w:4.5,d:7,h:4.1,jp:'中華そば 佐藤',title:'Sato Ramen',roof:1,colour:0xb6a98a});
    building({id:'crystal-room',x:20.5,z:12,w:2.4,d:3,h:4,jp:'木の家',title:'The Timber House',colour:0x89745b});
  }
  building({id:'bus-hut',x:-26,z:43,w:5,d:4,h:3.3,jp:'港線待合所',title:'Harbour Bus Hut',roof:1,colour:0x9ba69b});
  // River mouth, flood walls and an accessible timber jetty form the western loop.
  const water=new THREE.Mesh(new THREE.PlaneGeometry(12,72,4,24),new THREE.MeshStandardMaterial({color:0x537c79,roughness:.26,metalness:.23}));water.rotation.x=-Math.PI/2;water.position.set(-54,-.18,-24);group.add(water);
  for(const x of [-60,-48])box([.6,2,74],[x,-.7,-24],'concrete',0x808f83);
  for(const [x,z] of [[-51,-40],[-56,-22]]){const bird=new THREE.Group();bird.position.set(x,.18,z);const body=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshStandardMaterial({color:0xb8bcb0,roughness:1}));body.scale.set(1,1.6,1);bird.add(body);for(const dx of [-.08,.08])box([.025,.45,.025],[x+dx,.1,z],'timber',0x4e4d40);group.add(bird);verb([-45,1,-37],'Watch the heron','inspect','Grey heron','It waits for a fish to come to it. An admirable working arrangement.');}
  sign('小学校','GATE CLOSES AT 16:00',[44,2.2,33],3,.8);box([7,1.6,.12],[44,.8,32.5],'timber',0x687566);colliders.push({x:44,z:32.5,w:7,d:.12,height:1.6});verb([44,1,34],'Look through school gate','read','School gate','The last baseball practice has finished. Indoor shoes stand in neat rows beyond the locked gate.');
  // Shrine stair/approach culminates in a real raised landing.
  box([8,.4,8],[32,5.8,65],'concrete',0xa2a18c);for(const x of [29,35])box([.25,4,.25],[x,8,63],'timber',0x9b4833);box([8,.28,.45],[32,10,63],'timber',0x943d2a);verb([32,7.3,65],'Visit hillside shrine','shrine','Hillside shrine','The bay lies below the roofs.');
  for(const [x,z] of [[29,67],[32,67],[35,67]]){box([.65,1.4,.65],[x,6.7,z],'concrete',0x7f877a);colliders.push({x,z,w:.65,d:.65,minY:6,height:7.4});verb([x,7,z],'Read memorial stone','read','Family memorial','Fresh water, incense and a small bunch of autumn flowers.');}
  // Sparse bilingual junction signs, above eye level and outside the walking lane.
  for(const [x,z,jp,en] of [[5.9,18,'食堂通り','EAST → RAMEN · IZAKAYA'],[-5.9,29,'柳小路','WEST → HOMES · BATHHOUSE'],[5.9,-28,'桜商店','SAKURA ← · HARBOUR AHEAD'],[5.9,50,'北通り','TEA HOUSE → · BUS STOP ←']]){
    sign(jp,en,[x,2.7,z],3.1,.72);
    box([.09,2.35,.09],[x,1.175,z],'timber',0x655444);
  }
  buildHomes(world,options,box);
  for(const batch of batches.values()){const m=new THREE.InstancedMesh(unit,batch.mat,batch.items.length);batch.items.forEach((v,i)=>m.setMatrixAt(i,v));m.castShadow=options.shadows;m.receiveShadow=true;group.add(m);}
  return {shutters,windows,animators,sign,library};
}
