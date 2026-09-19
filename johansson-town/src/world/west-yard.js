import * as THREE from '../../vendor/three.module.js';
import {MAIN_ROAD} from './main-road.js';
import {groundTexture} from './east-lawn.js';
import {GROUND_LAYER} from './ground-layers.js';

/**
 * The yard on the shop side of the street.
 *
 * The konbini stood in an invisible box: only its frontage met walkable ground, and
 * its ends and back were nothing you could stand on, so the one building the town is
 * really about could not be walked round. The east of the town is a green; this is
 * what the west is — the working side, gravel rather than grass, with the shop and the
 * warehouse standing on it and room to get behind them.
 *
 * It reaches the quay at its south end and the pavement along its whole east edge, so
 * it joins the town rather than being a second island. The other two edges are closed
 * by a wall you can see, because ground that simply stops is the same invisible wall
 * this was built to remove.
 */
export const WEST_YARD=Object.freeze({
 id:'west-yard',surface:'gravel',
 minX:-24.6,maxX:MAIN_ROAD.pavementWest,minZ:-38,maxZ:MAIN_ROAD.maxZ,
 /** Where the quay takes over along the south edge, and the bus station along the north. */
 quayFrom:-19,stationFrom:-10.6,
 wall:Object.freeze({height:.72,thickness:.5}),
});

export const westYardAt=(x,z,r=0)=>
 x>=WEST_YARD.minX+r&&x<=WEST_YARD.maxX&&z>=WEST_YARD.minZ+r&&z<=WEST_YARD.maxZ-r;

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {Array} options.colliders  the boundary wall is solid.
 */
export function buildWestYard({parent,colliders=[],shadows=false}={}){
 const group=new THREE.Group();group.name='West yard and its boundary';parent.add(group);
 const width=WEST_YARD.maxX-WEST_YARD.minX,depth=WEST_YARD.maxZ-WEST_YARD.minZ;
 const grit=groundTexture('#b2ab98',[['#bbb4a1',300,7],['#a7a08e',260,8],['#c3bca9',150,5]],'#9b947f');
 if(grit)grit.repeat.set(width/2.6,depth/2.6);
 const ground=new THREE.Mesh(new THREE.BoxGeometry(width,.06,depth),
  // Brought down the way the park's grass is: this town's sun, its 1.75 fill and the
  // grade's exposure together push a mid grey past white, and a yard this size came out
  // as a sheet of paper.
  new THREE.MeshStandardMaterial({color:grit?0x8a8576:0x6f6a5d,roughness:1,map:grit}));
 ground.name='west-yard-gravel';
 // Two centimetres under the paved routes, the same clearance the east lawn keeps.
 // The yard used to sit at exactly the height the lane surfacing draws at, so gravel
 // and pavement shared a plane the whole length of the shop frontage and the two
 // flickered against each other wherever they met.
 ground.position.set((WEST_YARD.minX+WEST_YARD.maxX)/2,GROUND_LAYER.gravel-.03,(WEST_YARD.minZ+WEST_YARD.maxZ)/2);
 ground.receiveShadow=!!shadows;group.add(ground);

 const stone=new THREE.MeshStandardMaterial({color:0x8b8779,roughness:.94});
 const cap=new THREE.MeshStandardMaterial({color:0x757165,roughness:.9});
 const {height,thickness}=WEST_YARD.wall;
 const wall=(w,d,x,z)=>{
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,height,d),stone);
  body.position.set(x,height/2,z);body.castShadow=!!shadows;body.receiveShadow=!!shadows;group.add(body);
  const coping=new THREE.Mesh(new THREE.BoxGeometry(w+.12,.09,d+.12),cap);
  coping.position.set(x,height+.045,z);coping.receiveShadow=!!shadows;group.add(coping);
  colliders.push({id:'west-yard-wall',x,z,w:w+.12,d:d+.12,height:height+.09});
 };
 // The long side, then the two returns that close the corners the quay and the bus
 // station do not already close.
 wall(thickness,depth+thickness,WEST_YARD.minX-thickness/2,(WEST_YARD.minZ+WEST_YARD.maxZ)/2);
 wall(WEST_YARD.quayFrom-WEST_YARD.minX,thickness,(WEST_YARD.minX+WEST_YARD.quayFrom)/2,WEST_YARD.minZ-thickness/2);
 wall(WEST_YARD.stationFrom-WEST_YARD.minX,thickness,(WEST_YARD.minX+WEST_YARD.stationFrom)/2,WEST_YARD.maxZ+thickness/2);
 return {group,ground};
}
