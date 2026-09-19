import * as THREE from '../../vendor/three.module.js';
import {createMaterials} from '../render/materials.js?snappy=1';
import {MAIN_ROAD} from './main-road.js';
import {buildShopDoor} from './shop-door.js';
import {BOOKSHOP_WORKSHOP_PLOT} from './bookshop-workshop-layout.js';
import {peninsulaActive} from './town-mode.js';
import {businessId} from './businesses.js';
import {GROUND_LAYER} from './ground-layers.js';

/** West-facing business row: the bookshop, press and workshop share one shell.
 * The interior dimensions fit this building and the lane beside Minato stays open.
 */

/** Front faces sit here, a hand's width clear of the west kerb. */
export const WEST_FRONT=-7.8;

export const WEST_SHOPS=Object.freeze({
 frontrow:BOOKSHOP_WORKSHOP_PLOT,
});

/**
 * Where a west-pavement shop's door lands, for anything that needs to know before the
 * building is built -- its staff's working day, the escort that walks you to it.
 *
 * Only the peninsula builds these, so elsewhere this says nothing and the alley kit's
 * own door stands.
 */
export function westShopDoor(id){
 const plot=peninsulaActive()&&WEST_SHOPS[businessId(id)];
 return plot?[MAIN_ROAD.pavementWest+.65,plot.z]:null;
}

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
 const HEIGHT=3.45,RISE=1.25,DOOR=1.6;
 const cedar=0x986b47,frame=0x513b2a,trim=0x6e4c32;
 group.userData.buildingStyle='cedar-timber';
 // The single-storey shell fits the open bookshop/workshop interior. Its long side
 // walls use horizontal cedar courses, with exposed posts supporting one tiled roof.
 const passage=solid([depth+2,.06,2.4],[(WEST_FRONT+back)/2,GROUND_LAYER.apron-.03,-4.6],'concrete',0x8e8a7c);
 passage.name='Bookshop–Minato passage';
 solid([depth,.18,width],[(WEST_FRONT+back)/2,.09,z],'concrete',0x777364).name='Stone foundation';
 solid([.22,HEIGHT,width],[back-.11,HEIGHT/2,z],'timber',cedar).name='Cedar rear wall';
 for(const side of [-1,1]){
  solid([depth,HEIGHT,.22],[(WEST_FRONT+back)/2,HEIGHT/2,z+side*(half+.11)],'timber',cedar).name='Cedar side wall';
  for(let y=.38;y<HEIGHT;y+=.32){
   solid([depth,.035,.035],[(WEST_FRONT+back)/2,y,z+side*(half+.235)],'timber',trim).name='Cedar plank joint';
  }
  for(const x of [back,back+depth/2,WEST_FRONT-.12]){
   solid([.20,HEIGHT,.28],[x,HEIGHT/2,z+side*(half+.10)],'timber',frame).name='Exposed timber post';
  }
  solid([depth+.36,.18,.32],[(WEST_FRONT+back)/2,HEIGHT-.03,z+side*(half+.10)],'timber',frame).name='Timber wall plate';
 }
 for(let y=.38;y<HEIGHT;y+=.32)solid([.035,.035,width],[back-.235,y,z],'timber',trim).name='Rear plank joint';
 // Timber closes both gables; the roof is a single continuous pitch over both uses.
 const gable=new THREE.Shape();gable.moveTo(-half,0);gable.lineTo(half,0);gable.lineTo(0,RISE);gable.closePath();
 const gableGeometry=new THREE.ShapeGeometry(gable);
 for(const [x,angle] of [[WEST_FRONT-.10,Math.PI/2],[back-.13,-Math.PI/2]]){
  const face=new THREE.Mesh(gableGeometry,surfaces.worldMaterial('timber',cedar));
  face.name='Cedar gable';face.position.set(x,HEIGHT,z);face.rotation.y=angle;face.castShadow=!!shadows;face.receiveShadow=true;face.userData.staticProp=true;group.add(face);
  solid([.20,RISE,.18],[x,HEIGHT+RISE/2,z],'timber',frame).name='Gable king post';
 }
 const shape=new THREE.Shape();
 shape.moveTo(-half-.42,0);shape.lineTo(0,RISE);shape.lineTo(half+.42,0);
 shape.lineTo(half+.42,-.18);shape.lineTo(0,RISE-.18);shape.lineTo(-half-.42,-.18);shape.closePath();
 const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:depth+.65,bevelEnabled:false}),surfaces.worldMaterial('roof',0x424d4b));
 roof.name='Shared tiled roof';roof.rotation.y=-Math.PI/2;roof.position.set(WEST_FRONT+.35,HEIGHT+.1,z);
 roof.castShadow=!!shadows;roof.receiveShadow=true;group.add(roof);
 solid([depth+.72,.16,.20],[(WEST_FRONT+back)/2+.02,HEIGHT+RISE+.16,z],'roof',0x3d4542).name='Roof ridge';
 // The frontage has one sign and one central doorway, framed by display windows.
 solid([.24,.70,width],[WEST_FRONT-.12,3.05,z],'timber',trim).name='Shared timber fascia';
 solid([.30,.16,width+.25],[WEST_FRONT-.03,HEIGHT-.02,z],'timber',frame).name='Front crossbeam';
 for(const side of [-1,1]){
  const outer=z+side*(half-.24),inner=z+side*(DOOR/2+.14),run=Math.abs(outer-inner),bay=(outer+inner)/2;
  // Join the outer window stile to the corner post with solid cedar. Without this
  // infill their different offsets leave a vertical slit through the frontage.
  solid([.22,2.70,.30],[WEST_FRONT-.11,1.35,z+side*(half-.10)],'timber',cedar).name='Cedar corner infill';
  solid([.16,.66,run],[WEST_FRONT-.08,.35,bay],'timber',cedar).name='Timber window apron';
  const recess=solid([.08,1.94,run],[WEST_FRONT-.12,1.65,bay],'timber',0x302c24);recess.name='Display window recess';
  for(const y of [.68,2.63])solid([.24,.12,run+.12],[WEST_FRONT+.01,y,bay],'timber',frame).name='Display window rail';
  for(const zz of [inner,outer])solid([.24,2.10,.12],[WEST_FRONT+.01,1.65,zz],'timber',frame).name='Display window stile';
  if(side<0){
   for(const y of [.92,1.70]){
    solid([.18,.06,run-.18],[WEST_FRONT+.01,y,bay],'timber',trim).name='Book display shelf';
    for(let i=0;i<9;i++)solid([.10,.36+(i%3)*.04,.17],[WEST_FRONT+.035,y+.23,bay-run/2+.25+i*(run-.5)/9],'timber',[0x884934,0x52655e,0xa18b57][i%3]).name='Book in street display';
   }
  }else{
   solid([.18,.08,run-.18],[WEST_FRONT+.01,1.06,bay],'timber',trim).name='Workshop display shelf';
   solid([.10,.46,.78],[WEST_FRONT+.035,1.33,bay-.55],'timber',0x654635).name='Restored radio display';
   for(let i=0;i<5;i++)solid([.025,.26,.04],[WEST_FRONT+.10,1.34,bay-.83+i*.10],'timber',0xc1a576).name='Radio display grille';
   solid([.10,.24,.38],[WEST_FRONT+.035,1.22,bay+.50],'timber',0xa99260).name='Workshop pattern display';
  }
  const pane=new THREE.Mesh(new THREE.PlaneGeometry(run-.13,1.82),new THREE.MeshStandardMaterial({color:0x91a79d,roughness:.3,transparent:true,opacity:.24,depthWrite:false}));
  pane.name=side<0?'Bookshop display glass':'Workshop display glass';pane.rotation.y=Math.PI/2;pane.position.set(WEST_FRONT+.12,1.65,bay);pane.userData.clearWindow=true;group.add(pane);
  solid([.08,1.90,.055],[WEST_FRONT+.15,1.65,bay],'timber',trim).name='Window mullion';
 }
 const doorway=new THREE.Group();doorway.position.set(WEST_FRONT-.16,0,z);doorway.rotation.y=Math.PI/2;group.add(doorway);
 const door=buildShopDoor(doorway,{name:site.id+'-west-door',width:DOOR,shadows});
 label(site.jp,site.title.toUpperCase(),[WEST_FRONT+.045,3.05,z],Math.min(width*.8,6.4),.52,Math.PI/2,'#efdfb9','#4c3525');

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
