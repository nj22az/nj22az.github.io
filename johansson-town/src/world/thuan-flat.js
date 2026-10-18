import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {SAKURA_OFFICE} from './interiors/sakura-office-room.js';

/** Historical module name retained; Sakura's upper floor now belongs to the business. */
export function buildThuanFlat(parent,{colliders=[],sites=[],register,enter}={}){
 const O=SAKURA_OFFICE,hw=O.width/2,D=O.depth,F=O.floor,kit=createKit({shadows:true});
 parent.updateWorldMatrix(true,false);
 const p=parent.getWorldPosition(new THREE.Vector3()),yaw=parent.rotation.y;
 // All solids and walking levels are emitted in the real storefront's world frame.
 kit.at(p.x,p.z,yaw,()=>{
  // A modest concrete shop building: the shop's warm plaster, bronze sashes and
  // red tile hood continue upstairs. All trim stays outside the existing room.
  const plaster=0xeee7d1,concrete=0xd5d0bd,frame=0x5b4a37,tile=0xb5523a,ridge=0x8f3c2a;
  kit.block(-hw,hw,F-.12,F,-D,-.95,concrete);
  kit.block(-hw,hw,F,F+2.8,-D-.12,-D,plaster);
  kit.block(-hw-.12,-hw,F,F+2.8,-D,-.95,plaster);
  kit.block(hw,hw+.12,F,F+2.8,-D,-6.85,plaster);
  for(const [a,b] of [[F,F+.9],[F+2.35,F+2.8]]){
   kit.block(-hw,hw,a,b,-1.07,-.95,plaster);
   kit.block(hw,hw+.12,a,b,-6.85,-.95,plaster);
  }
  // Projecting sills and thin sliding-sash divisions give the long windows scale.
  for(const y of [.9,2.35]){
   kit.box(O.width+.2,.075,.22,0,F+y,-.9,frame);
   kit.box(.22,.075,5.95,hw+.06,F+y,-3.9,frame);
  }
  for(let i=0;i<=8;i++)kit.box(i%2?.045:.075,1.45,.12,-hw+i*O.width/8,F+1.625,-.9,frame);
  for(const z of [-6.85,-5.425,-4,-2.575,-1.05])kit.box(.12,1.45,.06,hw+.06,F+1.625,z,frame);
  kit.box(O.width+.36,.1,.32,0,F+.84,-.88,concrete);
  kit.box(.32,.1,6.08,hw+.1,F+.84,-3.9,concrete);
  // A shallow red tile sun/rain hood repeats the shop's existing tile profile.
  // Geometry ribs remain crisp in the cel pass without another image texture.
  const hoodY=F+2.46;
  kit.box(O.width+.42,.07,.72,0,hoodY,-.72,tile,{rx:.18});
  for(let x=-hw-.12;x<=hw+.12;x+=.26)kit.cyl(.035,.035,.72,x,hoodY+.045,-.72,ridge,{segments:6,rx:Math.PI/2+.18});
  kit.box(O.width+.46,.1,.1,0,hoodY+.11,-1.06,ridge);
  kit.box(.65,.11,6.04,hw+.2,hoodY,-3.91,tile);
  for(let z=-6.8;z<-.95;z+=.26)kit.cyl(.035,.035,.65,hw+.2,hoodY+.07,z,ridge,{segments:6,rz:Math.PI/2});
  // The roof slab and low parapet belong to the same concrete structure below.
  kit.block(-hw-.22,hw+.22,F+2.8,F+2.98,-D-.2,-.78,concrete);
  for(const z of [-D-.12,-.88]){
   kit.box(O.width+.3,.3,.14,0,F+3.13,z,plaster);
   kit.box(O.width+.42,.055,.24,0,F+3.305,z,concrete);
  }
  for(const x of [-hw-.08,hw+.08]){
   kit.box(.14,.3,D-.88,x,F+3.13,(-D-.12-.88)/2,plaster);
   kit.box(.24,.055,D-.78,x,F+3.305,(-D-.12-.88)/2,concrete);
  }
  for(const x of [-hw-.06,hw+.06])kit.box(.16,2.8,.2,x,F+1.4,-1,concrete);
  // Drainage is at the service corner, clear of both outlooks and the stair door.
  kit.cyl(.045,.045,2.95,-hw-.17,F+1.48,-D+.16,0x7b8285,{segments:8});
  const glazing=new THREE.MeshStandardMaterial({color:0x92a9a5,roughness:.4,emissive:0xffd9a0,emissiveIntensity:0});
  glazing.userData.kitFinish='glow';
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(O.width,1.45),glazing);
  glass.name='Sakura main office glazing';glass.position.set(0,F+1.625,-.94);parent.add(glass);
  const sideGlass=new THREE.Mesh(new THREE.PlaneGeometry(5.9,1.45),glass.material);
  sideGlass.name='Sakura harbour office glazing';sideGlass.rotation.y=Math.PI/2;sideGlass.position.set(hw+.01,F+1.625,-3.9);parent.add(sideGlass);
 },0);
 const target=parent.parent;kit.finish(target,'Sakura office stair and upper shell');
 const door=new THREE.Vector3(-18.8,F,-26.66);
 // The office room's origin is the middle of the upper floor; portals identify the actual east/south openings.
 const origin=parent.localToWorld(new THREE.Vector3(0,F,-D/2));
 const portal=(local,interiorYaw,span)=>({position:parent.localToWorld(new THREE.Vector3(local[0],F,local[2]-D/2)).toArray(),yaw:yaw+interiorYaw,interiorOrigin:local,interiorYaw,span,hideGlazing:true});
 const site={id:'sakura-office',title:'Sakura main office & kitchenette',sub:'SAKURA · MAIN OFFICE',line:'Accounts and supplier orders upstairs; daily till administration remains downstairs.',
  x:door.x,z:door.z,door:door.toArray(),exitPosition:door.toArray(),approachPosition:door.toArray(),entryFacing:-Math.PI/2,opens:'00:00',
  officeOrigin:origin.toArray(),officePortals:[portal([0,0,O.front],0,{minX:-hw,maxX:hw,minY:.9,maxY:2.35}),portal([hw,0,1.5],Math.PI/2,{minX:-2.85,maxX:2.85,minY:.9,maxY:2.35})]};
 sites.push(site);const anchor=new THREE.Object3D();anchor.name='Sakura main office entrance';anchor.position.copy(door).add(new THREE.Vector3(0,1.1,0));target.add(anchor);register?.(anchor,'Enter Sakura main office',()=>enter(site));
 return {site};
}
