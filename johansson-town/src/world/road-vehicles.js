import * as THREE from '../../vendor/three.module.js';
import {createKit} from './okinawa/kit.js';
import {createShopGlass} from './shop-glass.js';

/**
 * The island's road vehicles, as models: a kei truck, a car and a two-tonne delivery
 * truck. Each is a small kit mesh that moves as one object (town-traffic.js drives them).
 * Wheels sit on y = 0 and the nose points along +z.
 */
export const VEHICLE_SIZE=Object.freeze({'kei truck':Object.freeze({length:3.4,width:1.48}),car:Object.freeze({length:3.9,width:1.62}),'delivery truck':Object.freeze({length:4.9,width:1.95})});
export const DRIVER_SEATS=Object.freeze({car:{x:-.34,y:.64,z:.05,roof:2.05},'kei truck':{x:-.32,y:.62,z:.8,roof:2.05},'delivery truck':{x:-.38,y:.8,z:1.65,roof:2.3}});
export function buildVehicle(kind,colour){
 const kit=createKit({}),g=new THREE.Group();g.name='Road '+kind;
 const wheel=(x,z,r=.27)=>kit.cyl(r,r,.2,x,r,z,0x1f2124,{rz:Math.PI/2,segments:10});
 if(kind==='kei truck'){
  kit.box(1.4,.55,1.1,0,.58,.95,colour);
  kit.box(1.4,.45,2,0,.55,-.6,colour);kit.box(1.3,.04,1.9,0,.8,-.6,0x5d6265);
  kit.box(1.1,.5,1.2,0,1.05,-.7,0x2f6fb8);
  for(const [x,z] of [[-.66,.9],[.66,.9],[-.66,-1.1],[.66,-1.1]])wheel(x,z);
 }else if(kind==='car'){
  kit.box(1.6,.55,3.6,0,.5,0,colour);
  for(const [x,z] of [[-.76,1.15],[.76,1.15],[-.76,-1.15],[.76,-1.15]])wheel(x,z,.3);
 }else{
  // A two-tonne delivery truck with a box body.
  kit.box(1.8,.65,1.5,0,.65,1.9,colour);
  kit.box(1.9,2,3.4,0,1.5,-.6,0xeeece4);kit.box(1.92,.4,3.42,0,2.2,-.6,colour);
  for(const [x,z] of [[-.8,1.9],[.8,1.9],[-.8,-1.4],[.8,-1.4],[-.8,-.5],[.8,-.5]])wheel(x,z,.38);
 }
 // A hollow right-hand-drive cabin, with enough headroom for the town's seated adults.
 const seat=DRIVER_SEATS[kind],w=kind==='delivery truck'?1.8:kind==='car'?1.44:1.4,d=kind==='car'?1.9:kind==='delivery truck'?1.5:1.1,cz=kind==='car'?-.2:kind==='delivery truck'?1.9:.95;
 kit.box(w+.06,.08,d+.08,0,seat.roof,cz,colour);
 for(const x of [-w/2,w/2])for(const z of [cz-d/2,cz+d/2])kit.box(.065,seat.roof-.82,.065,x,(seat.roof+.82)/2,z,colour);
 for(const x of [-w/2,w/2])kit.box(.045,.2,d,x,.87,cz,colour);
 for(const x of [-.34,.34]){kit.box(.5,.1,.5,x,seat.y-.05,seat.z,0x424b50);kit.box(.5,.48,.09,x,seat.y+.2,seat.z-.28,0x424b50);}
 kit.box(w-.12,.15,.2,0,1,cz+d/2-.15,0x3c464c);
 const panes=new THREE.Group();panes.name='Clear vehicle windows';g.add(panes);const glass=createShopGlass();
 const pane=(width,height,x,y,z,ry=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),glass);m.position.set(x,y,z);m.rotation.y=ry;panes.add(m);};
 const h=seat.roof-1.02,y=(seat.roof+1.02)/2;
 for(const z of [cz-d/2,cz+d/2])pane(w-.1,h,0,y,z);
 for(const x of [-w/2,w/2])pane(d-.1,h,x,y,cz,Math.PI/2);
 const steering=new THREE.Mesh(new THREE.TorusGeometry(.14,.025,6,12),new THREE.MeshStandardMaterial({color:0x252c30}));steering.rotation.x=.6;steering.position.set(seat.x,1.12,seat.z+.35);steering.name='Steering wheel';g.add(steering);
 g.userData.driverSeat={...seat};
 kit.finish(g,kind);g.visible=false;g.userData.dynamicProp=true;g.userData.walkSurface=false;
 return g;
}
