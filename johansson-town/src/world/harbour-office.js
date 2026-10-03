import * as THREE from '../../vendor/three.module.js';
import {createKit,GRID} from './okinawa/kit.js';
import {buildShopDoor} from './shop-door.js';
import {HARBOUR_OFFICE as O} from './business-layout.js';
import {peninsulaActive} from './town-mode.js';
import {OFFICE_HOME_LAYOUT} from './interiors/office-workplace.js';
// A single quay office replaces the old cold-store box and both office addresses.
export function buildHarbourOffice({parent,site,register,enter,label,shadows}){
 const group=new THREE.Group();group.name='Consolidated harbour office';group.position.set(O.x,0,O.frontZ);parent.add(group);
 // The harbour co-op office as Okinawa built them after reversion: a single-storey
 // reinforced-concrete box on the town grid with a parapet, a black tank on a stand,
 // a radio mast for the boats and a concrete hood over the door. It replaces a timber
 // shed under a photographed tile gable (docs/AMPLIFY-AUDIT.md, B3); the footprint,
 // the door and the windows the interior expects are unchanged. Local frame: the
 // front is z=0, the building runs back to z=-7.2.
 const kit=createKit({shadows});
 const H=GRID.storey.shop+.25,wall=0xdfe3d6,plinth=0xa9aa9c,trim=0x2f5f6a,alu=0xb8bec0,slab=0xc8c2b5,steel=0x8e979a;
 kit.block(-3.7,3.7,0,.16,-7.3,.1,0x9e9e8d);
 kit.block(-3.6,3.6,0,.32,-7.2,.02,plinth);
 kit.block(-3.6,3.6,0,H,-7.2,-7.0,wall);
 for(const x of [-3.6,3.4])kit.block(x,x+.2,0,H,-7.2,0,wall);
 // Front wall either side of the door, the band over it, and the window openings cut
 // as separate piers so the glass sits in real reveals.
 for(const [x0,x1] of [[-3.6,-3.05],[-1.35,-.75],[.75,1.35],[3.05,3.6]])kit.block(x0,x1,0,H,-.15,0,wall);
 for(const [x0,x1] of [[-3.05,-1.35],[1.35,3.05]]){kit.block(x0,x1,0,1.15,-.15,0,wall);kit.block(x0,x1,2.65,H,-.15,0,wall);}
 kit.block(-.75,.75,2.2,H,-.15,0,wall);
 kit.block(-3.6,3.6,H,H+GRID.slab,-7.2,0,slab);
 for(const [x0,x1,z0,z1] of [[-3.6,3.6,-.14,0],[-3.6,3.6,-7.2,-7.06],[-3.6,-3.46,-7.2,0],[3.46,3.6,-7.2,0]])kit.block(x0,x1,H+GRID.slab,H+GRID.slab+GRID.parapet,z0,z1,wall);
 kit.block(-3.64,3.64,H+GRID.slab+GRID.parapet,H+GRID.slab+GRID.parapet+.08,-.18,.04,trim);
 kit.block(-1.05,1.05,2.28,2.38,0,GRID.eave.canopy,slab);
 kit.block(-3.6,3.6,.32,.42,0,.03,trim);
 // Windows: aluminium sliders in the reveals.
 for(const x of [-2.2,2.2]){
  kit.box(1.7,1.5,.05,x,1.9,-.08,0x425755,{finish:'window'});
  for(const dx of [-.85,0,.85])kit.box(.05,1.5,.08,x+dx,1.9,-.03,alu,{finish:'metal'});
  for(const y of [1.15,2.65])kit.box(1.75,.06,.08,x,y,-.03,alu,{finish:'metal'});
  kit.box(1.85,.07,.2,x,1.1,.06,slab);
 }
 // Roof: the tank on its stand, the VHF mast with its stays, and the rebar stubs.
 for(const [dx,dz] of [[-.45,-.45],[.45,-.45],[.45,.45],[-.45,.45]])kit.box(.07,.9,.07,-1.6+dx,H+.6,-4.8+dz,steel,{finish:'metal'});
 kit.box(1.1,.08,1.1,-1.6,H+1.08,-4.8,steel,{finish:'metal'});
 kit.cyl(.6,.6,1.25,-1.6,H+1.74,-4.8,0x2b2d2f,{segments:14,finish:'gloss'});
 kit.rod([2.4,H,-5.2],[2.4,H+5.2,-5.2],.04,steel);
 for(const y of [H+2.8,H+4.2])kit.rod([2.1,y,-5.2],[2.7,y,-5.2],.02,steel);
 for(const [ax,az] of [[.6,-3.6],[3.3,-6.9],[3.3,-3.6]])kit.rod([2.4,H+4.6,-5.2],[ax,H+.2,az],.008,0x2b2a30);
 for(const [dx,dz] of [[-3.2,-6.8],[-3.2,-6.2],[-2.6,-6.8]])kit.rod([dx,H+.15,dz],[dx,H+.65,dz],.018,0x7a4a32);
 // A wall air conditioner and the mould and rust the sea air leaves.
 kit.box(.8,.55,.3,3.85,1.9,-3.6,0xe2e0d8,{ry:Math.PI/2});
 kit.box(7.1,.3,.02,0,H-.1,.018,0xbdb4a2);
 for(const x of [-3.3,1.5])kit.box(.05,1.0,.02,x,H-.55,.008,0x9d8f78);
 kit.finish(group,'Harbour office shell');
 const door=buildShopDoor(group,{name:'office-quay-door',width:1.4,shadows});door.group.position.z=.13;
 label(site.jp,'HARBOUR OFFICE · 24 HOUR MARINE SERVICE',[O.x,3.04,O.frontZ+.2],4.6,.45,0,'#e7dcc0','#3e463f',true);
 const entrance=new THREE.Object3D();entrance.name='office-quay-entrance';entrance.position.set(O.x,1.25,O.frontZ+.65);parent.add(entrance);register(entrance,'Enter '+site.title,()=>enter(site));
 Object.assign(site,{x:O.x,z:O.z,door:[...O.door],exitPosition:[...O.door],entryFacing:0,streetFrontage:{position:[O.x,0,O.frontZ],yaw:0}});
 // On the peninsula it is also the harbour master's home: he sleeps behind the screen
 // (office-workplace.js), and walking in at night finds him there.
 if(peninsulaActive())Object.assign(site,{homeOwner:'Harbour master',homeOwners:['Harbour master'],ownRoom:true,homeLayouts:{'Harbour master':OFFICE_HOME_LAYOUT}});
 return {id:site.id,lod:group,entrance,shutter:door.pane,source:'Quay office',nearTriangles:0,farTriangles:0,collider:{x:O.x,z:O.z,w:O.width,d:O.depth,height:4.5},update:door.update};
}
