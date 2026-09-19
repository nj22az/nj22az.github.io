import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js?snappy=1';
import {MAIN_ROAD} from './main-road.js';
import {buildShopDoor} from './shop-door.js';

/**
 * The shops on the west pavement.
 *
 * The peninsula switched every shop off while the core was sorted out, and they were
 * meant to come back one at a time. The konbini came back first and grew to fourteen
 * metres; the izakaya came back next, two doors up. This is the third: the bookshop
 * that stands between them, so that Thuan walks out of her own shop, past Aya's, and
 * into Minato for a beer — and so that "next to the bookshop" means something again.
 *
 * The old street built it as an alley shop, a recessed door in the side of the
 * supplied night-market kit. That kit is not here, so it gets a building of its own:
 * plastered flank walls, a tiled pitch, a glazed frontage onto the pavement and the
 * same sliding door the alley units use. The interior is untouched — Aya's shelves,
 * Reiko's press and the reading chair are built by buildCompactShop from the room in
 * business-layout.js, which is a set of dimensions and does not care where the
 * building stands.
 */

/** Front faces sit here, a hand's width clear of the west kerb. */
export const WEST_FRONT=-7.8;

export const WEST_SHOPS=Object.freeze({
 // On its own door, which the alley layout already put on this pavement at z -2.89.
 // Minato's north gable stops at -6.10, half a metre short of this frontage.
 frontrow:Object.freeze({z:-2.89,width:6.2,depth:4.6}),
});

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {object} options.site the business, which is given its door and frontage here
 * @param {Array} options.colliders the town's collider list
 * @returns {{group:THREE.Group,update:(dt:number,bodies:Array)=>void}|null}
 */
export function buildWestShop({parent,site,register,enter,label,colliders,shadows=false}){
 const plot=WEST_SHOPS[site.id];if(!plot)return null;
 const {z,width,depth}=plot,half=width/2,back=WEST_FRONT-depth;
 const surfaces=createMaterials();
 const group=new THREE.Group();group.name='west-shop:'+site.id;parent.add(group);
 const shade=new Map();
 const solid=(size,pos,kind,colour)=>{
  const key=kind+':'+colour;
  if(!shade.has(key))shade.set(key,surfaces.worldMaterial(kind,colour));
  const m=new THREE.Mesh(new THREE.BoxGeometry(...size),shade.get(key));
  m.position.set(...pos);m.castShadow=!!shadows;m.receiveShadow=true;m.userData.staticProp=true;group.add(m);return m;
 };
 const HEIGHT=5.2;
 // Shell. The frontage faces east onto the pavement, so the building runs back in -x.
 //
 // Everything here is darker than the colour it stands for. This town's sun and grade
 // together push a light wall past white over an area this size: the first pass used
 // 0xe4dcc6 for the plaster and the whole building rendered as a flat cream slab with
 // no corners in it. Tone down, do not brighten.
 solid([depth,.2,width],[(WEST_FRONT+back)/2,.1,z],'concrete',0x9a927f);
 solid([.22,HEIGHT,width],[back-.11,HEIGHT/2,z],'plaster',0xa79d85);
 for(const side of [-1,1])solid([depth,HEIGHT,.22],[(WEST_FRONT+back)/2,HEIGHT/2,z+side*(half+.11)],'plaster',0x9e9580);
 solid([depth,.2,width+.5],[(WEST_FRONT+back)/2,HEIGHT,z],'concrete',0x8a8374);
 // A tiled pitch, ridged along the street the way the district's roofs are.
 {
  const shape=new THREE.Shape();
  shape.moveTo(-half-.42,0);shape.lineTo(0,1.15);shape.lineTo(half+.42,0);
  shape.lineTo(half+.42,-.2);shape.lineTo(0,.95);shape.lineTo(-half-.42,-.2);shape.closePath();
  const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:depth+.5,bevelEnabled:false}),
   surfaces.worldMaterial('roof',0x5c625c));
  // Extruded back over the building, not forward over the road. A quarter turn the
  // other way ran the whole pitch out across the pavement and the carriageway, where
  // it hung in the air with nothing under it -- five metres of roof over the street
  // and none over the shop.
  roof.rotation.y=-Math.PI/2;roof.position.set(WEST_FRONT+.25,HEIGHT+.1,z);
  roof.castShadow=!!shadows;roof.receiveShadow=true;group.add(roof);
 }
 // Frontage: a glazed bay each side of the doorway, under a painted fascia.
 const DOOR=1.6;
 solid([.26,1.5,width],[WEST_FRONT-.13,HEIGHT-1.0,z],'plaster',0x74412f);
 for(const side of [-1,1]){
  const outer=z+side*(half-.2),inner=z+side*DOOR/2,run=Math.abs(outer-inner);
  if(run<.6)continue;
  const bay=(outer+inner)/2;
  solid([.14,2.9,run],[WEST_FRONT-.07,1.45,bay],'timber',0x54462f);
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(run-.18,2.1),
   new THREE.MeshStandardMaterial({color:0x53665f,emissive:0xc7ae76,emissiveIntensity:.18,roughness:.45,transparent:true,opacity:.62}));
  pane.rotation.y=Math.PI/2;pane.position.set(WEST_FRONT+.01,1.62,bay);pane.userData.clearWindow=true;group.add(pane);
 }
 // The doorway, with the same sliding leaf the alley units carry.
 const doorway=new THREE.Group();doorway.position.set(WEST_FRONT-.16,0,z);doorway.rotation.y=Math.PI/2;group.add(doorway);
 const door=buildShopDoor(doorway,{name:site.id+'-west-door',width:DOOR,shadows});
 label(site.jp,site.title.toUpperCase(),[WEST_FRONT+.06,HEIGHT-1.0,z],Math.min(width*.8,5.6),.58,Math.PI/2,'#efe3c2','#5d3b32');

 // Walls stop you; the doorway does not.
 const cheek=(width-DOOR)/2-.1;
 for(const side of [-1,1])colliders.push({id:'west-shop:'+site.id+(side<0?':south':':north'),
  x:(WEST_FRONT+back)/2,z:z+side*(DOOR/2+cheek/2+.05),w:depth,d:cheek,height:HEIGHT});
 colliders.push({id:'west-shop:'+site.id+':back',x:back,z,w:.4,d:width,height:HEIGHT});

 // The door point, on the pavement, and the way in.
 const doorPoint=[MAIN_ROAD.pavementWest+.65,0,z];
 site.x=WEST_FRONT;site.z=z;
 site.door=[...doorPoint];site.exitPosition=[...doorPoint];site.entryFacing=Math.PI/2;
 site.approachPosition=[doorPoint[0]+.55,0,z];
 site.streetFrontage={position:[WEST_FRONT,0,z],yaw:Math.PI/2};
 const entrance=new THREE.Object3D();entrance.name=site.id+'-west-entrance';
 entrance.position.set(doorPoint[0],1.25,z);parent.add(entrance);
 register?.(entrance,'Enter '+site.title,()=>enter(site));
 return {id:site.id,group,entrance,update:door.update};
}
