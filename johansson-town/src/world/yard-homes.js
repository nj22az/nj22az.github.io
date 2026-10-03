import * as THREE from '../../vendor/three.module.js';
import {HOUSEHOLDS} from '../people/households.js';
import {windowGlow} from '../render/dusk.js';
import {YARD_HOMES} from './yard-homes-layout.js';
import {glazeWithRoom} from '../render/window-interior.js';

/**
 * The yard houses behind Front-Row Books & Workshop (yard-homes-layout.js).
 *
 * Two small Okinawan concrete-block houses: Aya and Reiko's with a red-tiled roof and
 * a shisa on the ridge, Kenji and Tetsuo's flat-roofed with a water tank and a TV
 * aerial. Each is a home site, so its door works like every other door in town — walk
 * in at any hour, including while the people who live there are asleep in bed
 * (home-residents.js puts them there). Windows light up in the evening.
 */
const MARU='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';

export function buildYardHomes(world,options){
 const group=new THREE.Group();group.name='Front-Row yard homes';world.group.add(group);
 const std=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
 const mesh=(g,m,x,y,z,name)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.name=name;o.castShadow=!!options.shadows;o.receiveShadow=true;group.add(o);return o;};
 const glass=[],homes=world.homes instanceof Map?world.homes:new Map();
 for(const household of HOUSEHOLDS){
  const spec=YARD_HOMES[household.id];if(!spec)continue;
  const {x,z,w,d,height:h}=spec,front=Math.sign(spec.doorFace-z);
  // Walls: a block of painted concrete on a low grey plinth.
  mesh(new THREE.BoxGeometry(w+.1,.18,d+.1),std(0x9a968c),x,.09,z,'Yard home plinth');
  mesh(new THREE.BoxGeometry(w,h,d),std(spec.walls),x,h/2+.18,z,'Yard home walls');
  // Roof: red tiles in a shallow hip with a shisa, or a flat slab with a water tank.
  if(spec.roof==='tile'){
   // The quarter turn is baked into the cone before it is stretched to the house's
   // depth: as a rotation on the mesh, the stretch ran along a diagonal and sheared the
   // roof into a skewed rhombus, crooked against the walls and the street grid.
   const roofGeometry=new THREE.ConeGeometry(Math.hypot(w,w)*.62,1.1,4,1);roofGeometry.rotateY(Math.PI/4);
   const roof=mesh(roofGeometry,std(0xc4553a,{roughness:.7}),x,h+.18+.55,z,'Yard home tiled roof');roof.scale.set(1,1,d/w);
   const shisa=new THREE.Group();shisa.position.set(x,h+.18+1.12,z);shisa.name='Shisa';group.add(shisa);
   const clay=std(0xd2804a,{roughness:.9});
   const body=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),clay);body.scale.set(1,.9,1.2);shisa.add(body);
   const head=new THREE.Mesh(new THREE.SphereGeometry(.11,10,8),clay);head.position.set(0,.13,.1*front);shisa.add(head);
   const mane=new THREE.Mesh(new THREE.TorusGeometry(.1,.035,6,12),std(0x9a4a2a));mane.position.copy(head.position);mane.rotation.x=Math.PI/2;shisa.add(mane);
  }else{
   mesh(new THREE.BoxGeometry(w+.3,.16,d+.3),std(0xcfc9bc),x,h+.26,z,'Yard home roof slab');
   mesh(new THREE.CylinderGeometry(.42,.42,.9,16),std(0x2a8fcc,{roughness:.5}),x-w*.25,h+.8,z-d*.2,'Yard home water tank');
   const mast=mesh(new THREE.CylinderGeometry(.02,.02,1.4,6),std(0x9aa3a0,{metalness:.4}),x+w*.3,h+1.05,z+d*.2,'Yard home aerial');void mast;
   for(let i=0;i<4;i++){const rod=mesh(new THREE.CylinderGeometry(.01,.01,.7-i*.12,4),std(0x9aa3a0),x+w*.3,h+1.5+i*.1,z+d*.2,'Yard home aerial rod');rod.rotation.z=Math.PI/2;}
  }
  // The front: a wooden door with a small canopy, two windows, a nameplate.
  const face=spec.doorFace+front*.01,doorX=spec.door[0];
  mesh(new THREE.BoxGeometry(.95,2.0,.06),std(0x8a5a36),doorX,1.18,face,'Yard home door');
  mesh(new THREE.BoxGeometry(1.3,.08,.6),std(spec.trim),doorX,2.36,face+front*.28,'Yard home canopy');
  for(const wx of [doorX-1.35,x-w/2+.55]){
   if(Math.abs(wx-doorX)<.8)continue;
   mesh(new THREE.BoxGeometry(.95,.8,.05),std(spec.trim),wx,1.55,face,'Yard home window frame');
   const pane=new THREE.MeshStandardMaterial({color:0x9fc4d6,emissive:0xffd89a,emissiveIntensity:0,roughness:.2});glass.push(pane);
   glazeWithRoom(mesh(new THREE.PlaneGeometry(.82,.66),pane,wx,1.55,face+front*.03,'Yard home window')).rotation.y=front>0?0:Math.PI;
  }
  const plate=document.createElement('canvas');plate.width=256;plate.height=96;const ctx=plate.getContext('2d');
  ctx.fillStyle='#f4e4c8';ctx.fillRect(0,0,256,96);ctx.strokeStyle='#6b4a1c';ctx.lineWidth=6;ctx.strokeRect(3,3,250,90);
  ctx.fillStyle='#3b3f55';ctx.font=`bold 30px ${MARU}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(household.residents.join(' · '),128,40);
  ctx.font=`18px ${MARU}`;ctx.fillText(spec.address,128,74);
  const tex=new THREE.CanvasTexture(plate);tex.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(.5,.19),new THREE.MeshStandardMaterial({map:tex,roughness:.8}),doorX+.75,1.55,face+front*.02,'Yard home nameplate').rotation.y=front>0?0:Math.PI;
  // A little of who lives there by the door.
  if(household.id==='resident-home-aya'){
   // Book crates and a sleeping cat on the step (Tama, from the shop window).
   for(let i=0;i<2;i++)mesh(new THREE.BoxGeometry(.45,.3,.35),std(0xb98a55),doorX-.95-i*.5,.33,face+front*.4,'Book crate');
   const cat=mesh(new THREE.SphereGeometry(.14,10,8),std(0xe8a050),doorX-.95,.62,face+front*.4,'Tama asleep on the crates');cat.scale.set(1.3,.7,1);
   mesh(new THREE.CylinderGeometry(.16,.12,.3,10),std(0xf06b9a),doorX+.9,.33,face+front*.45,'Geranium pot');
   mesh(new THREE.SphereGeometry(.2,8,6),std(0x3f8f46),doorX+.9,.62,face+front*.45,'Geranium');
  }else{
   // A surfboard against the wall and a crate of radio parts.
   const board=mesh(new THREE.CapsuleGeometry(.22,1.5,4,10),std(0xffc93c),x+w/2-.3,1.1,face+front*.25,'Kenji surfboard');board.scale.z=.18;board.rotation.z=.12;
   mesh(new THREE.BoxGeometry(.5,.32,.4),std(0x3b3f55),doorX-1.0,.34,face+front*.4,'Crate of radio parts');
   mesh(new THREE.BoxGeometry(.18,.12,.12),std(0x7a7f7a),doorX-1.0,.56,face+front*.4,'Old radio chassis');
  }
  world.colliders.push({x,z,w:w+.1,d:d+.1,height:h+.4,id:'yard-home'});
  // The home site: its door, who lives there, and the heading you walk in with.
  const profile={name:household.residents[0]};
  let site=options.sites.find(s=>s.id===household.id);
  if(!site){site={id:household.id,jp:"Home",sub:'FRONT-ROW YARD',color:0xd4c6ad,accent:'#776953'};options.sites.push(site);}
  Object.assign(site,{title:household.title,line:spec.address,homeOwner:profile.name,homeOwners:[...household.residents],homeEntry:'yard-'+spec.number,
   door:[spec.door[0],.02,spec.door[1]],entryFacing:spec.inward,x:spec.door[0],z:spec.door[1]});
  site.exitPosition=[...site.door];
  for(const name of household.residents)homes.set(name,{owner:name,household:household.id,address:spec.address,door:[...spec.door],building:'front-row-yard',occupied:false});
  const anchor=new THREE.Object3D();anchor.name='yard home entrance:'+household.id;anchor.position.set(spec.door[0],1.3,spec.door[1]);group.add(anchor);
  options.register?.(anchor,'Visit '+household.title,()=>options.enter(site));
 }
 world.homes=homes;
 const previous=world.updateHomes;
 world.updateHomes=minutes=>{previous?.(minutes);const glow=windowGlow(minutes);for(const pane of glass)pane.emissiveIntensity=glow*.7;};
 return group;
}
