import * as THREE from '../../vendor/three.module.js';

/**
 * The bench round the back of Sakura Shōten.
 *
 * Thuan opens at nine and closes at eight, alone, and until now the only thing she
 * could do between customers was stand. This is where she goes on her break: the
 * gravel yard behind the shop, out of sight of the pavement, with the back wall at her
 * shoulder and nothing to look at but the yard wall and a strip of sky. It is not
 * comfortable and it is not meant to be — she will have a house later. For now it is
 * somewhere to sit down and close her eyes for twenty minutes.
 *
 * The shop's footprint is 14.26 by 11.0 turned a quarter, so its back wall stands at
 * x -18.45 and the west yard runs on to -24.6. The bench sits a hand's width off the
 * wall with its back to it, facing out across the yard.
 *
 * It used to stand further down the wall with nothing but gravel leading to it, so the
 * only way to find it was to walk round the shop on the chance there was something
 * there. STAFF_YARD_ROUTE is the path that now goes to it: off the pavement at the
 * shop's north corner, down the back, and it stops at the bench. A dead end with one
 * thing at the end of it, which is what the back of a shop looks like.
 */
export const STAFF_BENCH=Object.freeze({
 x:-19.1,z:-23,
 /** Facing west, out into the yard, with the shop wall behind her. */
 yaw:-Math.PI/2,
 /** The seat, and where she stands up to. */
 seat:Object.freeze([-19.25,-23]),
 stand:Object.freeze([-20.5,-23]),
 eyeY:1.12,
});

/**
 * The path to it. Peninsula only, because the yard and the bench are.
 *
 * It runs clear of the shop's north wall by a hand's width, turns down the back at
 * x -20.4, and ends a foot past the bench. Nothing beyond it: the point of a service
 * path round the back is that it goes one place.
 */
export const STAFF_YARD_ROUTE=Object.freeze({
 id:'staff-yard',peninsula:true,width:2.6,surface:'stone',
 points:Object.freeze([[-8.6,-18.7],[-20.4,-18.7],[-20.4,STAFF_BENCH.z]]),
});

/**
 * @param {object} options
 * @param {THREE.Object3D} options.parent
 * @param {object} options.factory the town prop factory, for its bench
 * @param {Array} options.colliders
 * @returns {{group:THREE.Group,seat:THREE.Object3D}}
 */
export function buildStaffBench({parent,factory,colliders=[],shadows=false,register,onAction}={}){
 const {x,z,yaw}=STAFF_BENCH;
 const built=factory.bench(x,z,yaw);
 built.object.name='sakura-staff-bench';
 built.object.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=!!shadows;mesh.receiveShadow=true;}});
 parent.add(built.object);
 // The factory hands back an unrotated footprint. A quarter turn swaps its sides, and
 // a bench you can walk through is not a bench.
 const turned=Math.abs(Math.round(Math.cos(yaw)))===0;
 colliders.push({id:'sakura-staff-bench',x,z,
  w:turned?built.collider.d:built.collider.w,
  d:turned?built.collider.w:built.collider.d,height:.95});

 // A crate to put a cup on, because nobody drinks tea holding the cup the whole time.
 const crate=new THREE.Mesh(new THREE.BoxGeometry(.42,.34,.36),
  new THREE.MeshStandardMaterial({color:0x5a4a34,roughness:.95}));
 crate.position.set(x-.05,.17,z+1.35);crate.rotation.y=.12;
 crate.castShadow=!!shadows;crate.receiveShadow=true;crate.userData.staticProp=true;parent.add(crate);

 const seat=new THREE.Object3D();seat.name='sakura-staff-bench-seat';
 seat.position.set(STAFF_BENCH.seat[0],1.05,STAFF_BENCH.seat[1]);parent.add(seat);
 seat.userData.seat={position:[STAFF_BENCH.seat[0],0,STAFF_BENCH.seat[1]],
  stand:[STAFF_BENCH.stand[0],0,STAFF_BENCH.stand[1]],eyeY:STAFF_BENCH.eyeY,yaw,pitch:-.04};
 register?.(seat,'Sit on the staff bench',()=>onAction?.('seat','Staff bench',
  'Thuan’s bench, at the end of the path round the back. A wall, a strip of sky, and '+
  'twenty minutes of nobody wanting anything.'));
 return {group:built.object,seat};
}
