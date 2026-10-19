import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {createKit} from './okinawa/kit.js';
import {SAKURA_BACK} from './okinawa/old-town.js';
import {SAKURA_OFFICE,sakuraOfficePortals} from './interiors/sakura-office-room.js';

/**
 * The office storey's back wall over Nishi-machi, in the storefront's frame (x along the frontage, the back wall at
 * z -depth, heights above the office floor). Two sliding sashes light the back of the floor (since the upstairs replan
 * of 19 October, the archive: interiors/sakura-office-room.js SAKURA_UPSTAIRS); a small frosted pane
 * lights the inside stair, whose extract vent is over it; the fire door at the head
 * of the stair opens onto the fire escape (okinawa/old-town.js SAKURA_BACK.fireEscape, where it is placed in the town).
 */
export const SAKURA_OFFICE_BACK=Object.freeze({
 windows:Object.freeze([Object.freeze({x0:1.35,x1:3.15,sill:.9,head:2.35}),Object.freeze({x0:3.95,x1:5.75,sill:.9,head:2.35})]),
 frosted:Object.freeze({x0:-3.9,x1:-3.1,sill:1.25,head:2.05}),
 vent:Object.freeze({x:-3.5,y:2.5}),
 why:'Windows on the back, as the creator asked (2026-10-19): the office looks over Nishi-machi as well as the street and the harbour, its back half gets daylight and a through draught in summer, and the stair head and kitchenette their own light.',
 inside:'Replanned the same day (the owner: "maybe two windows you can look out from"): the shell keeps these sashes, but the floor behind them is now the archive, so they give it daylight and the through draught a paper store needs in the damp; you look out only from the office’s two windows, Main Street and the harbour.',
});

/** Historical module name retained; Sakura's upper floor now belongs to the business. */
export function buildThuanFlat(parent,{sites=[],shopDoor}={}){
 const O=SAKURA_OFFICE,B=SAKURA_OFFICE_BACK,hw=O.width/2,D=O.depth,F=O.floor,kit=createKit({shadows:true});
 parent.updateWorldMatrix(true,false);
 const p=parent.getWorldPosition(new THREE.Vector3()),yaw=parent.rotation.y;
 // The fire door, where the escape is placed in the town, in this frame.
 const E=SAKURA_BACK.fireEscape,fireX=parent.worldToLocal(new THREE.Vector3(SAKURA_BACK.upperWall,F,E.door.z)).x;
 const openings=[...B.windows,B.frosted,{x0:fireX-E.door.width/2,x1:fireX+E.door.width/2,sill:0,head:E.door.height}];
 // All solids and walking levels are emitted in the real storefront's world frame.
 kit.at(p.x,p.z,yaw,()=>{
  // A modest concrete shop building: the shop's warm plaster, bronze sashes and
  // red tile hood continue upstairs. All trim stays outside the existing room.
  // It stands on the shop's own roof slab (storefront.js), which is its floor.
  const plaster=0xeee7d1,concrete=0xd5d0bd,frame=0x5b4a37,tile=0xb5523a,ridge=0x8f3c2a;
  // The back wall, in strips between its openings.
  const xs=[...new Set([-hw,hw,...openings.flatMap(o=>[o.x0,o.x1])])].sort((a,b)=>a-b);
  for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i],o=openings.find(o=>o.x0<=a+1e-6&&o.x1>=b-1e-6);
   for(const [y0,y1] of o?[[0,o.sill],[o.head,2.8]]:[[0,2.8]])if(y1-y0>1e-6)kit.block(a,b,F+y0,F+y1,-D-.12,-D,plaster);}
  const back=-D-.12;
  for(const o of openings){const w=o.x1-o.x0,x=(o.x0+o.x1)/2,h=o.head-o.sill,y=F+(o.sill+o.head)/2;
   // A thin frame in the reveal, a cast sill under a window, a little concrete hood over it.
   for(const e of [o.x0+.03,o.x1-.03])kit.box(.06,h,.1,e,y,back+.07,frame);
   kit.box(w,.06,.1,x,F+o.head-.03,back+.07,frame);
   if(o.sill>0){kit.box(w,.06,.1,x,F+o.sill+.03,back+.07,frame);kit.box(w+.16,.07,.2,x,F+o.sill-.035,back-.06,concrete);}
   kit.box(w+.3,.07,.34,x,F+o.head+.12,back-.17,concrete);
  }
  // The sashes slide past each other at the middle of each window.
  for(const o of B.windows)kit.box(.05,o.head-o.sill,.06,(o.x0+o.x1)/2,F+(o.sill+o.head)/2,back+.09,frame);
  // The frosted pane takes the dusk glow like the clear glass; the kitchenette's vent cap is over it.
  {const f=B.frosted;kit.box(f.x1-f.x0-.06,f.head-f.sill-.06,.02,(f.x0+f.x1)/2,F+(f.sill+f.head)/2,back+.08,0xdfe3dc,{finish:'glow'});}
  kit.box(.3,.24,.12,B.vent.x,F+B.vent.y,back-.06,0xd9d6cc);kit.box(.34,.05,.18,B.vent.x,F+B.vent.y+.13,back-.08,0xc8c4b8,{rx:-.3});
  kit.box(.24,.03,.02,B.vent.x,F+B.vent.y-.06,back-.125,0x6f6f68);
  // The fire door: a steel leaf in its frame, a lever, and the sill it steps out over onto the landing.
  kit.box(E.door.width-.12,E.door.height-.06,.05,fireX,F+(E.door.height-.06)/2,back+.05,0x7e8a84);
  kit.box(.12,.025,.04,fireX+E.door.width/2-.2,F+1.02,back+.01,0xc9c9c0,{finish:'metal'});
  kit.box(E.door.width,.03,.12,fireX,F+.015,back+.06,concrete);
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
  // Drainage is at the service corner, clear of both outlooks and the back's windows and fire door.
  kit.cyl(.045,.045,2.95,-hw-.17,F+1.48,-D+.16,0x7b8285,{segments:8});
  const glazing=new THREE.MeshStandardMaterial({color:0x92a9a5,roughness:.4,emissive:0xffd9a0,emissiveIntensity:0});
  glazing.userData.kitFinish='glow';
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(O.width,1.45),glazing);
  glass.name='Sakura main office glazing';glass.position.set(0,F+1.625,-.94);parent.add(glass);
  const sideGlass=new THREE.Mesh(new THREE.PlaneGeometry(5.9,1.45),glass.material);
  sideGlass.name='Sakura harbour office glazing';sideGlass.rotation.y=Math.PI/2;sideGlass.position.set(hw+.01,F+1.625,-3.9);parent.add(sideGlass);
  // The back sashes share the outlooks' glass, so they light with them at dusk.
  const panes=B.windows.map(o=>new THREE.PlaneGeometry(o.x1-o.x0-.1,o.head-o.sill-.1).rotateY(Math.PI).translate((o.x0+o.x1)/2,F+(o.sill+o.head)/2,-D-.07));
  const backGlass=new THREE.Mesh(mergeGeometries(panes),glass.material);panes.forEach(g=>g.dispose());
  backGlass.name='Sakura rear office glazing';parent.add(backGlass);
 },0);
 const target=parent.parent;kit.finish(target,'Sakura office upper shell');
 // The office is entered through the shop and up its inside stair: its directory entry is the shop's own door.
 const door=new THREE.Vector3(...shopDoor);
 // The office room's origin is the middle of the upper floor; portals identify the actual east/south openings.
 const origin=parent.localToWorld(new THREE.Vector3(0,F,-D/2));
 const portal=(local,interiorYaw,span)=>({position:parent.localToWorld(new THREE.Vector3(local[0],F,local[2]-D/2)).toArray(),yaw:yaw+interiorYaw,interiorOrigin:local,interiorYaw,span,hideGlazing:true});
 const site={id:'sakura-office',title:'Sakura main office & kitchenette',sub:'SAKURA · MAIN OFFICE',line:'Accounts and supplier orders upstairs; daily till administration remains downstairs.',
  x:door.x,z:door.z,door:door.toArray(),exitPosition:door.toArray(),approachPosition:door.toArray(),entryFacing:yaw,opens:'00:00',
  officeOrigin:origin.toArray(),officePortals:sakuraOfficePortals().map(p=>({id:p.id,...portal(p.local,p.interiorYaw,p.span)}))};
 sites.push(site);
 return {site};
}
