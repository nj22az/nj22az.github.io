// Metres, shared by shop construction, the clerk schedule and clearance checks.
export const STORE_CLERK_POSITION=Object.freeze([1.6,0,-1.6]);
export const STOCKROOM_DOOR=Object.freeze({x:3.9,z:-2.4,width:1.5});
export const STORE_COUNTER=Object.freeze({x:1.3,z:-.5,w:3.8,d:.8});
export const STORE_PARTITIONS=Object.freeze([
 {x:-1.6,z:-2.4,w:9.5,d:.15},
 {x:5.5,z:-2.4,w:1.7,d:.15},
]);
export const STORE_TABLES=Object.freeze([{x:3.8,z:3.3},{x:-4.6,z:4.35}]);
// The first chair is always available to the player; Yuri and visitors use the others.
export const STORE_SEATS=Object.freeze([
 {id:'window-player',table:0,position:[3.8,0,4.3],stand:[2.8,0,4.3],yaw:0,height:.51,eyeY:1.2},
 {id:'window-yuri',table:0,position:[3.8,0,2.3],stand:[2.8,0,2.3],yaw:Math.PI,height:.51,eyeY:1.2},
 {id:'guest-north',table:1,position:[-4.6,0,3.35],stand:[-3.6,0,3.35],yaw:Math.PI,height:.51,eyeY:1.2},
 {id:'guest-south',table:1,position:[-4.6,0,5.35],stand:[-3.6,0,5.35],yaw:0,height:.51,eyeY:1.2},
].map(Object.freeze));
export const STORE_SERVICE_ROUTE=Object.freeze([[2.8,2.3],[2.8,1.1],[3.8,1.1],[3.8,-1.6],[1.6,-1.6]]);
