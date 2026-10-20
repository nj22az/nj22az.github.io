import * as THREE from '../../../vendor/three.module.js';
import {SAKURA_STOREY} from './sakura-stairs.js';

/**
 * What Sakura draws on each storey (sakura-stairs.js SAKURA_STOREY says which one the player is on).
 *
 * - 'office': the sales floor is put away: every part of the shop that lies wholly north of the partition (the shelves
 *   and their goods, the coolers, the counter and till, the hot case, the decorations, the small office, the restroom,
 *   the shop floor's own tiles and its sheen). What spans the partition stays (the building's walls, the ceiling, the
 *   tubes' one mesh) and so does everything south of it: the stockroom and the stairwell, which the stair's hole looks
 *   down into. The people are the shop's (people/sakura-shop.js), not this.
 * - 'shop': the upstairs rooms are put away (the office group inside the stairwell).
 * - 'stair': both are drawn.
 *
 * Which parts are the sales floor is worked out from where they are, not from a list of names, so a fitting added
 * later is put away with the rest; it is worked out again only when the shop has gained or lost a part. Each part's own
 * visibility is kept and given back exactly (a fridge's contents, a lamp's pool switched off).
 */
const KEEP=new Set(['Sakura internal stairwell']);
const NORTH=SAKURA_STOREY.salesFloorZ-.05,SOUTH=SAKURA_STOREY.salesFloorZ-.02;

/** An object's extent in the room's frame, instances included. */
export function extentIn(object,root,box=new THREE.Box3()){
 box.makeEmpty();root.updateMatrixWorld(true);
 const inverse=new THREE.Matrix4().copy(root.matrixWorld).invert(),m=new THREE.Matrix4(),i=new THREE.Matrix4(),b=new THREE.Box3();
 object.traverse(o=>{
  if(!o.isMesh||!o.geometry)return;
  if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
  m.multiplyMatrices(inverse,o.matrixWorld);
  if(o.isInstancedMesh){for(let k=0;k<o.count;k++){o.getMatrixAt(k,i);if(!i.elements[0]&&!i.elements[5]&&!i.elements[10])continue;b.copy(o.geometry.boundingBox).applyMatrix4(i.premultiply(m));box.union(b);}}
  else{b.copy(o.geometry.boundingBox).applyMatrix4(m);box.union(b);}
 });
 return box;
}

const person=o=>!!(o.userData?.name||o.userData?.character);
/** The parts of the shop that lie wholly on the sales floor: the largest such groups, not every mesh in them. */
export function salesFloorParts(room){
 const parts=[],box=new THREE.Box3();
 const visit=parent=>{
  for(const c of parent.children){
   if(KEEP.has(c.name)||c.isLight||person(c))continue;
   extentIn(c,room,box);if(box.isEmpty())continue;
   if(box.min.z>NORTH)parts.push(c);
   else if(box.max.z<SOUTH)continue;
   else if(c.children.length&&!c.isMesh)visit(c);
  }
 };
 visit(room);
 return parts;
}

export function createSakuraStoreyView(room,{upstairs=null}={}){
 let parts=null,count=-1,storey='stair';
 const kept=new Map();
 const size=()=>{let n=0;room.traverse(o=>{if(!person(o))n++;});return n;};
 const hide=o=>{if(!o||kept.has(o))return;kept.set(o,o.visible);o.visible=false;};
 const restore=()=>{for(const [o,v] of kept)o.visible=v;kept.clear();};
 return {
  get storey(){return storey;},
  /** The sales floor's parts as they stand now (worked out again when the shop has gained or lost a part). */
  salesFloor(){const n=size();if(!parts||n!==count){parts=salesFloorParts(room);count=n;}return parts;},
  /** Show one storey: 'office', 'shop' or 'stair' (both). */
  show(next){
   if(next===storey)return false;
   restore();storey=next;
   if(next==='office')for(const o of this.salesFloor())hide(o);
   if(next==='shop')hide(upstairs);
   return true;
  },
  /** Everything as it was, for the street's view through the window and for leaving. */
  reset(){restore();storey='stair';},
 };
}
