import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';

/**
 * The island's road vehicles, as models: a kei truck, a car and a two-tonne delivery
 * truck. Each is a small kit mesh that moves as one object (town-traffic.js drives them).
 * Wheels sit on y = 0 and the nose points along +z.
 */
export const VEHICLE_SIZE=Object.freeze({'kei truck':Object.freeze({length:3.4,width:1.48}),car:Object.freeze({length:3.9,width:1.62}),'delivery truck':Object.freeze({length:4.9,width:1.95})});
export function buildVehicle(kind,colour){
 const kit=createKit({}),g=new THREE.Group();g.name='Road '+kind;
 const wheel=(x,z,r=.27)=>kit.cyl(r,r,.2,x,r,z,0x1f2124,{rz:Math.PI/2,segments:10});
 if(kind==='kei truck'){
  kit.box(1.4,1.15,1.1,0,.78,.95,colour);kit.box(1.36,.42,.04,0,1.05,1.51,0x5d7a84);
  kit.box(1.4,.45,2,0,.55,-.6,colour);kit.box(1.3,.04,1.9,0,.8,-.6,0x5d6265);
  kit.box(1.1,.5,1.2,0,1.05,-.7,0x2f6fb8);
  for(const [x,z] of [[-.66,.9],[.66,.9],[-.66,-1.1],[.66,-1.1]])wheel(x,z);
 }else if(kind==='car'){
  kit.box(1.6,.7,3.6,0,.6,0,colour);kit.box(1.44,.55,1.9,0,1.2,-.2,colour);
  kit.box(1.4,.44,.04,0,1.22,.76,0x5d7a84);kit.box(1.4,.4,.04,0,1.2,-1.16,0x5d7a84);
  for(const [x,z] of [[-.76,1.15],[.76,1.15],[-.76,-1.15],[.76,-1.15]])wheel(x,z,.3);
 }else{
  // A two-tonne delivery truck with a box body.
  kit.box(1.8,1.4,1.5,0,1.0,1.9,colour);kit.box(1.76,.5,.04,0,1.35,2.66,0x5d7a84);
  kit.box(1.9,2,3.4,0,1.5,-.6,0xeeece4);kit.box(1.92,.4,3.42,0,2.2,-.6,colour);
  for(const [x,z] of [[-.8,1.9],[.8,1.9],[-.8,-1.4],[.8,-1.4],[-.8,-.5],[.8,-.5]])wheel(x,z,.38);
 }
 kit.finish(g,kind);g.visible=false;g.userData.dynamicProp=true;g.userData.walkSurface=false;
 return g;
}
