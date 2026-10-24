import * as THREE from '../johansson-town/vendor/three.module.js';
// The real west promenade bench at (-38.35, 4), framed from its sea-facing end.
const camera=new THREE.PerspectiveCamera(52,4/3,.05,250);camera.position.set(-40.6,2.15,9.0);camera.lookAt(-37.8,1.0,4.5);camera.updateMatrixWorld(true);
export const SEAWALL_VIEW={wide:{camera:{position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),fov:52,aspect:4/3},floor:0,spots:{stand:[[-37.2,0,4,.5,.78],[-37.2,0,5.1,.65,.78],[-37.2,0,6.3,.75,.78]]},seats:[]}};
