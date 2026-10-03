import * as THREE from '../../vendor/three.module.js';
import {createKit,GRID,trs} from './okinawa/kit.js';
import {buildShopDoor} from './shop-door.js';

// Replaces the western fishing-gear shed. Source frontage is -Z; rotate it
// towards the main street (+X), with its roof clear of the west service lane.
export const WAREHOUSE=Object.freeze({x:-13.6,z:-42.4,scale:.55,yaw:-Math.PI/2,groundY:.095,sourceMinY:-.022709667682647705});
export const WAREHOUSE_PLACE=Object.freeze({
 id:'warehouse',title:'Harbour Warehouse',jp:"港倉庫",sub:'WESTERN QUAY',
 x:WAREHOUSE.x,z:WAREHOUSE.z,color:0x9a9588,accent:'#314d51',
 line:'Fishing gear, ice and quay stores · open at all hours.',
 door:Object.freeze([-8.6,0,-38.65]),exitPosition:Object.freeze([-8.6,0,-38.65]),entryFacing:Math.PI/2,
 directions:'Walk past Sakura Konbini towards the water. At the end of the main street, look left for the blue tin shed marked HARBOUR WAREHOUSE.',
});
export function warehouseColliders(){
 // Stable before and after streaming. Leave the main street, quay approach
 // and western service lane clear. The old imported loose props are gone;
 // their invisible colliders must not remain in front of the new kit shell.
 return [
  {x:-13.64,z:-42.44,w:6.14,d:11.03,height:5.9},
 ].map(c=>({...c,warehouse:true}));
}
/**
 * The warehouse itself, from the kit: a corrugated-tin shed on a block plinth, its
 * ridge along the quay, a roller shutter for the forklift and a person door, painted
 * the faded harbour blue that every tin shed on the island turns, with rust where the
 * sheets overlap. It replaces a photographed Sketchfab model that streamed in
 * (docs/AMPLIFY-AUDIT.md, B1/B3) and is built at once, so there is nothing to wait for.
 */
export function buildWarehouseShell({shadows=false}={}){
 const holder=new THREE.Group();holder.name='Harbour Warehouse kit exterior';
 const kit=createKit({shadows});
 const cx=WAREHOUSE.x,cz=WAREHOUSE.z,hw=3.07,hd=5.51,front=cx+hw,back=cx-hw,eave=4.2,rise=1.5;
 const tin=0x86a0aa,tinDark=0x6f8893,block=0xb9b5a8,rust=0x9a5a3a,trim=0x314d51,steel=0x8e979a;
 kit.block(back,front,0,1.0,cz-hd,cz+hd,block);
 kit.block(back+.06,front-.06,1.0,eave,cz-hd+.06,cz+hd-.06,tin);
 // Corrugation: a rib every 30 cm down the long walls and across the gable ends.
 for(let z=cz-hd+.15;z<cz+hd;z+=GRID.block)for(const x of [front+.01,back-.01])kit.box(.04,eave-1.0,.08,x,(eave+1.0)/2,z,tinDark);
 for(let x=back+.15;x<front;x+=GRID.block)for(const z of [cz+hd+.01,cz-hd-.01])kit.box(.08,eave-1.0,.04,x,(eave+1.0)/2,z,tinDark);
 // Gable ends, the roof (ridge along the quay) and its ribs.
 for(const z of [cz-hd,cz+hd-.1])kit.extrude([[-hw,0],[hw,0],[0,rise]],.1,trs(cx,eave,z),tin);
 kit.gableRoof(hd*2,hw*2,rise,cx,eave,cz,0x7a8c90,{ry:Math.PI/2,overhang:.22});
 for(let z=cz-hd;z<=cz+hd;z+=.9)for(const s of [-1,1])kit.rod([cx,eave+rise+.02,z],[cx+s*(hw+.3),eave-.1,z],.025,tinDark);
 kit.box(.2,.12,hd*2+.4,cx,eave+rise+.04,cz,trim);
 // The roller shutter for the forklift, its box, and a person door's frame.
 const sz=cz-.6;
 kit.box(.06,3.3,3.64,front+.04,1.65,sz,0xa9b2b4,{finish:'metal'});
 for(let y=.15;y<3.3;y+=.12)kit.box(.02,.02,3.6,front+.08,y,sz,0x8e9699,{finish:'metal'});
 kit.box(.4,.4,3.9,front+.2,3.5,sz,0x8e9699,{finish:'metal'});
 kit.box(.9,.1,4.4,front+.45,3.85,sz,0xc8c2b5);
 for(const z of [WAREHOUSE_PLACE.door[2]-.62,WAREHOUSE_PLACE.door[2]+.62])kit.box(.12,2.2,.1,front+.04,1.1,z,trim);
 kit.box(.12,.12,1.34,front+.04,2.24,WAREHOUSE_PLACE.door[2],trim);
 // Rust where sheets overlap and fixings bleed, and a wall lamp over the shutter.
 for(const z of [cz-4.4,cz-2.9,cz+.9,cz+3.6])kit.box(.02,1.3+(Math.abs(z)%1)*.6,.12,front+.05,eave-.8,z,rust);
 kit.box(.3,.18,.3,front+.2,3.95,sz+2.3,steel,{finish:'metal'});
 kit.box(.22,.12,.22,front+.24,3.82,sz+2.3,0xffe2a8,{finish:'lamp'});
 kit.finish(holder,'Harbour Warehouse shell');
 return holder;
}

function addStreetDoor(group){
 const {group:door}=buildShopDoor(group,{name:'warehouse-street-door',width:1.05,glass:false});
 door.position.set(-10.48,0,WAREHOUSE_PLACE.door[2]);door.rotation.y=Math.PI/2;return door;
}

export function buildWarehouse(world,options={}){
 const group=new THREE.Group();group.name='Harbour Warehouse';world.group.add(group);
 world.colliders.push(...warehouseColliders());
 const footing=new THREE.Mesh(new THREE.BoxGeometry(6.4,.6,11.35),new THREE.MeshStandardMaterial({color:0x999b94,roughness:.95}));
 // A centimetre and a half over the quay was not enough to keep the two apart on a
 // phone; three makes the plinth read as a plinth and settles the depth test with it.
 footing.name='Warehouse concrete footing';footing.position.set(WAREHOUSE.x,-.175,WAREHOUSE.z);footing.receiveShadow=true;group.add(footing);
 group.add(buildWarehouseShell({shadows:options.shadows}));
 addStreetDoor(group);
 options.label?.('入口','ENTRANCE',[-10.12,2.85,WAREHOUSE_PLACE.door[2]],1.05,.38,Math.PI/2);
 const marker=new THREE.Object3D();marker.name='warehouse-entrance';marker.position.set(-9.45,1.25,WAREHOUSE_PLACE.door[2]);group.add(marker);
 options.register?.(marker,'Enter Harbour Warehouse',()=>options.enter?.(WAREHOUSE_PLACE));
 // Built in code, so it is ready from the first frame; load() stays for the detail stream.
 const state={group,place:WAREHOUSE_PLACE,loaded:true,status:'ready',load(){return Promise.resolve(true);}};
 world.warehouse=state;return state;
}
