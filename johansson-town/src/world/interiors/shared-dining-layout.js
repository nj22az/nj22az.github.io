import {FURNITURE_HEIGHTS} from '../furniture-standards.js';
// Both street entrances lead to the same fitted room and kitchen. Johansson may
// walk the staff aisle; physical counters, cupboards, walls and stools stay solid.
export const SHARED_DINING_BOUNDS={minX:-6.2,maxX:11.2,minZ:-6.2,maxZ:6.2};
export const SHARED_DINING_FLOOR=[[-6.2,-6.2],[11.2,-6.2],[11.2,3.5],[6.2,3.5],[6.2,6.2],[-6.2,6.2]];
export const SHARED_DINING_COLLIDERS=[
 {id:'minato-counter',x:-.8,z:-2.34,w:8.4,d:.83,height:FURNITURE_HEIGHTS.serviceCounter},
 {id:'minato-worktop',x:-.8,z:-3.065,w:8.4,d:.62,height:.9175},
 {id:'back-kitchen-line',x:3.1,z:-5.95,w:16.9,d:.75,height:2.7},
 {id:'ramen-counter',x:8.4,z:-2.34,w:3.6,d:.83,height:FURNITURE_HEIGHTS.serviceCounter},
 {id:'ramen-worktop',x:8.4,z:-3.065,w:3.6,d:.62,height:.9175},
 {id:'connecting-wall',x:6.45,z:1.525,w:.3,d:9.75,height:3.8},
 {id:'drinks-fridge',x:-5.72,z:-5.0,w:.85,d:1.9,height:1.9},
 {id:'sake-barrels',x:-5.88,z:-.35,w:.7,d:1.5,height:.6},
 {id:'empty-crates',x:-5.35,z:5.75,w:1.05,d:.4,height:.62},
 {id:'umbrella-stand',x:-2.35,z:5.95,w:.3,d:.3,height:.6},
 {id:'koagari',x:5.3,z:1.8,w:2,d:5.4,height:.4},
 ...[-3.8,-2.3,-.8,.7,2.2].map(x=>({id:'minato-stool',x,z:-1.42,w:.6,d:.6,height:FURNITURE_HEIGHTS.seat})),
 ...[7.1,7.8,8.5,9.2,9.9].map(x=>({id:'ramen-stool',x,z:-1.42,w:.38,d:.38,height:FURNITURE_HEIGHTS.seat})),
 ...[[-3.5,2.2],[2.6,2]].flatMap(([x,z])=>[{id:'dining-table',x,z,w:2.5,d:1.35,height:FURNITURE_HEIGHTS.table},...[-1.08,1.08].map(dz=>({id:'dining-bench',x,z:z+dz,w:2.5,d:.5,height:x<0?.98:FURNITURE_HEIGHTS.seat}))]),
 {id:'wall-ledge',x:11.2,z:1.2,w:.4,d:2.4,height:FURNITURE_HEIGHTS.serviceCounter},
 ...[.3,1.2,2.1].map(z=>({id:'ledge-stool',x:10.65,z,w:.36,d:.36,height:FURNITURE_HEIGHTS.seat})),
 {id:'ramen-window-table',x:7.65,z:1.15,w:1.35,d:1.05,height:FURNITURE_HEIGHTS.table},
 ...[.35,1.95].map(z=>({id:'ramen-window-chair',x:7.65,z,w:.46,d:.46,height:.96})),
 {id:'ticket-machine',x:6.95,z:3.32,w:.75,d:.55,height:1.6},
 {id:'lounge-banquette',x:-5.62,z:4.6,w:.76,d:1.7,height:1.05},
 ...[4.15,5.0].map(z=>({id:'lounge-table',x:-4.6,z,w:.66,d:.66,height:FURNITURE_HEIGHTS.table})),
];
