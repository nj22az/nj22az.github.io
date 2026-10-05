import * as THREE from '../../vendor/three.module.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {createShopGlass} from './shop-glass.js';

// Original 1990s Japanese compact, cab-over kei and local delivery truck silhouettes.
// Hollow cabins retain the actual resident drivers; the nose points along +z.
export const VEHICLE_SIZE=Object.freeze({'kei truck':Object.freeze({length:3.4,width:1.48}),car:Object.freeze({length:3.9,width:1.62}),'delivery truck':Object.freeze({length:4.9,width:1.95})});
export const DRIVER_SEATS=Object.freeze({car:{x:-.34,y:.46,z:.05,roof:1.78},'kei truck':{x:-.32,y:.56,z:.8,roof:1.91},'delivery truck':{x:-.38,y:.72,z:1.65,roof:2.22}});

export function buildVehicle(kind,colour){
 const g=new THREE.Group();g.name='Road '+kind;
 const opaque=[],lamps=[],color=new THREE.Color(),trim=0x30393d,metal=0xb2b9ba;
 function add(geometry,hex,target=opaque){
  const geo=geometry.index?geometry.toNonIndexed():geometry;geo.deleteAttribute('uv');color.set(hex);
  const c=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<c.length;i+=3)c.set([color.r,color.g,color.b],i);
  geo.setAttribute('color',new THREE.BufferAttribute(c,3));target.push(geo);
 }
 function box(w,h,d,x,y,z,c=colour,target=opaque){const geo=new THREE.BoxGeometry(w,h,d);geo.translate(x,y,z);add(geo,c,target);}
 function rod(a,b,r,c=colour){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),delta=B.clone().sub(A),geo=new THREE.CylinderGeometry(r,r,delta.length(),8);geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));geo.translate(...A.add(B).multiplyScalar(.5).toArray());add(geo,c);}
 function profile(points,width,x=0,c=colour){const shape=new THREE.Shape();points.forEach(([z,y],i)=>shape[i?'lineTo':'moveTo'](-z,y));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,steps:1});geo.rotateY(Math.PI/2);geo.translate(x-width/2,0,0);add(geo,c);}
 function wheel(x,z,r){
  // Rounded tyre shoulders, silver steel wheel, dark centre and four lug nuts.
  const tyre=new THREE.CylinderGeometry(r*.91,r*.91,.17,16);tyre.rotateZ(Math.PI/2);tyre.translate(x,r,z);add(tyre,0x22272b);
  for(const dx of [-.075,.075]){const shoulder=new THREE.TorusGeometry(r*.78,r*.22,6,16);shoulder.rotateY(Math.PI/2);shoulder.translate(x+dx,r,z);add(shoulder,0x22272b);}
  const side=Math.sign(x),face=x+side*.092,rim=new THREE.CylinderGeometry(r*.57,r*.57,.025,12);rim.rotateZ(Math.PI/2);rim.translate(face,r,z);add(rim,metal);
  const hub=new THREE.CylinderGeometry(r*.21,r*.21,.036,10);hub.rotateZ(Math.PI/2);hub.translate(face+side*.015,r,z);add(hub,trim);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;box(.012,.024,.024,face+side*.016,r+Math.cos(a)*r*.34,z+Math.sin(a)*r*.34,0xe0e3df);}
 }
 const car=kind==='car',delivery=kind==='delivery truck',seat=DRIVER_SEATS[kind],size=VEHICLE_SIZE[kind];
 const w=car?1.6:delivery?1.86:1.42,r=delivery?.36:car?.3:.275;
 const frontWheel=delivery?1.8:car?1.18:1.06,rearWheel=delivery?-1.47:car?-1.18:-1.06;
 const front=car?1.9:delivery?2.4:1.64,back=car?-1.9:delivery?-2.4:-1.64;
 // Side body skins have real wheel openings, rather than solid boxes over the tyres.
 for(const side of [-1,1]){
  const shape=new THREE.Shape();const top=car?[[back,.32],[-1.87,.76],[-1.24,.89],[.95,.87],[1.78,.74],[front,.51]]:[[back,.3],[back,.7],[front,.7],[front,.3]];
  top.forEach(([z,y],i)=>shape[i?'lineTo':'moveTo'](-z,y));shape.lineTo(-front,.25);
  for(const z of [frontWheel,rearWheel]){shape.lineTo(-(z+r+.06),r);shape.absarc(-z,r,r+.06,Math.PI,0,true);shape.lineTo(-(z-r-.06),.25);}
  shape.lineTo(-back,.25);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:false});geo.rotateY(Math.PI/2);geo.translate(side*w/2-(side>0?.045:0),0,0);add(geo,colour);
  for(const z of [frontWheel,rearWheel])wheel(side*(size.width/2-.095),z,r);
 }
 box(w-.1,.07,front-back-.2,0,.23,(front+back)/2,trim);
 let belt,frontBottom,frontTop,rearBottom,rearTop,roofW;
 if(car){
  belt=.89;frontBottom=.94;frontTop=.57;rearBottom=-1.24;rearTop=-.76;roofW=1.30;
  profile([[.94,.83],[1.80,.72],[1.88,.57],[1.88,.52],[.94,.59]],w);
  profile([[-1.9,.57],[-1.85,.76],[-1.24,.87],[-1.24,.57]],w);
  // Narrow door skins leave the footwell and cabin open for seated residents.
  for(const side of [-1,1]){box(.055,.13,2.12,side*(w/2-.025),.815,-.15);box(.027,.018,2.18,side*(w/2+.007),.90,-.15,trim);}
  box(w,.09,.065,0,.78,rearBottom,colour);
 }else if(delivery){
  belt=.96;frontBottom=2.38;frontTop=2.13;rearBottom=.9;rearTop=.99;roofW=1.7;
  for(const side of [-1,1])profile([[.9,.70],[.9,.96],[2.30,.96],[2.4,.70]],.045,side*(w/2-.025));
  box(w,.30,.055,0,.50,2.37);
  // The cab's front skin and engine cover stop ahead of the driver's knees.
  box(w,.19,.09,0,.93,2.35);box(w-.08,.08,.38,0,.91,2.17);
  // Hollow corrugated freight box with double rear doors and latch bars.
  box(1.86,1.84,.065,0,1.38,.79,0xeeeadd);
  for(const side of [-1,1]){box(.055,1.84,3.15,side*.92,1.38,-.82,0xeeeadd);for(let z=-2.33;z<.7;z+=.18)box(.018,1.70,.025,side*.956,1.38,z,0xcccfc7);}
  box(1.91,.085,3.25,0,2.34,-.83,0xeeeadd);box(1.85,.1,3.18,0,.47,-.82,trim);
  for(const x of [-.46,.46]){box(.88,1.80,.055,x,1.38,-2.43,0xe5e4db);rod([x-.15,.6,-2.468],[x-.15,2.12,-2.468],.02,metal);box(.15,.05,.06,x-.1,1.15,-2.475,trim);}
 }else{
  belt=.94;frontBottom=1.62;frontTop=1.39;rearBottom=.20;rearTop=.29;roofW=1.27;
  box(w,.19,.065,0,.88,1.59);box(w-.08,.065,.3,0,.91,1.45);
  // Cab-over utility truck: a visible load bed, tailgate, hinges and blue parts boxes.
  box(1.32,.065,1.8,0,.65,-.71,0x767e7f);
  for(const side of [-1,1])box(.045,.30,1.82,side*.685,.82,-.71);
  box(1.40,.30,.05,0,.82,-1.62);for(const x of [-.5,.5])box(.12,.04,.045,x,.69,-1.66,metal);
  box(1.1,.44,1.2,0,.905,-.7,0x3479ac);for(const z of [-1.15,-.3])box(1.12,.018,.018,0,1.12,z,0x5c9bc3);
 }
 // Tapered cabin with a slightly crowned roof and inclined front/rear glazing.
 const roofY=seat.roof,sideX=w/2-.025;
 const panes=new THREE.Group();panes.name='Clear vehicle windows';g.add(panes);
 const glass=createShopGlass();glass.opacity=.10;glass.color.setHex(0xc5e0e5);
 function pane(name,points){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,glass);mesh.name=name;panes.add(mesh);}
 const fb=[[-sideX,belt,frontBottom],[sideX,belt,frontBottom],[roofW/2,roofY-.075,frontTop],[-roofW/2,roofY-.075,frontTop]],rb=[[-sideX,belt,rearBottom],[sideX,belt,rearBottom],[roofW/2,roofY-.075,rearTop],[-roofW/2,roofY-.075,rearTop]];
 pane('Sloping windshield',fb);pane('Rear window',rb);
 for(const side of [-1,1]){
  const lowerFront=[side*sideX,belt,frontBottom],upperFront=[side*roofW/2,roofY-.075,frontTop],lowerRear=[side*sideX,belt,rearBottom],upperRear=[side*roofW/2,roofY-.075,rearTop];
  pane('Side door windows',[lowerRear,lowerFront,upperFront,upperRear]);rod(lowerFront,upperFront,.04);rod(lowerRear,upperRear,.055);rod(upperRear,upperFront,.027,trim);
  box(.05,.15,frontBottom-rearBottom,side*sideX,belt-.10,(frontBottom+rearBottom)/2);
  // Door seam, chrome handle, and mirrors on short stalks.
  const seam=car?-.42:rearBottom+.1;rod([side*(sideX+.025),.4,seam],[side*(sideX+.025),belt,seam],.006,trim);
  box(.025,.035,.15,side*(sideX+.04),belt-.15,seam+.18,metal);
  rod([side*sideX,1.10,frontBottom-.05],[side*(size.width/2-.02),1.12,frontBottom-.13],.023,trim);
  box(.11,.105,.17,side*(size.width/2-.04),1.15,frontBottom-.14,trim);box(.015,.075,.13,side*(size.width/2+.017),1.15,frontBottom-.14,metal);
  if(car){const z=-.40;rod([side*sideX,belt,z],[side*roofW/2,roofY-.08,z],.022,trim);}
 }
 // Curved, closed roof surface: this remains opaque when seen from above or behind.
 const roofProfile=[[rearTop-.08,roofY-.08],[rearTop,roofY-.01],[(rearTop+frontTop)/2,roofY+.025],[frontTop,roofY-.01],[frontTop+.06,roofY-.08]];
 profile(roofProfile,roofW+.10);
 for(const pts of [fb,rb])rod(pts[0],pts[1],.027,trim);
 // Separate seats, rear seat for the hatchback, instrument dash and steering wheel.
 for(const x of [-.34,.34]){box(.49,.11,.46,x,seat.y-.055,seat.z,0x4d555b);box(.47,.43,.09,x,seat.y+.21,seat.z-.28,0x4d555b);box(.25,.17,.12,x,seat.y+.48,seat.z-.29,0x4d555b);}
 if(car){box(1.15,.09,.36,0,.46,-.90,0x4d555b);box(1.15,.35,.09,0,.65,-1.08,0x4d555b);}
 box(w-.14,.12,.17,0,belt-.05,frontBottom-.12,trim);
 const steering=new THREE.TorusGeometry(.13,.022,6,12);steering.rotateX(.6);steering.translate(seat.x,belt+.10,seat.z+.32);add(steering,trim);
 rod([seat.x,belt+.10,seat.z+.32],[seat.x,belt-.13,seat.z+.46],.025,trim);
 // Black bumpers, grille, paired lights and readable Japanese-sized registration plates.
 for(const end of [-1,1]){const z=end>0?front:back;box(w+.025,.16,.085,0,.43,z,trim);box(.32,.11,.012,0,.46,z+end*.049,0xf3efda);}
 box(w*.42,.105,.025,0,delivery?.86:.63,front+.015,trim);
 for(let i=0;i<5;i++)box(w*.40,.013,.012,0,(delivery?.82:.59)+i*.017,front+.031,metal);
 for(const side of [-1,1]){const x=side*w*.34;box(car?.32:.24,.15,.025,x,delivery?.84:.64,front+.024,0xf7ead0,lamps);box(.07,.15,.027,x+side*.17,delivery?.84:.64,front+.025,0xdd9e42,lamps);box(.24,.11,.027,side*w*.34,.64,back-.036,0xb83d32,lamps);}
 // Windshield wipers and the small exhaust pipe below the rear bumper.
 for(const x of [-w*.22,w*.22])rod([x,belt+.035,frontBottom+.014],[x+.14,belt+.19,frontBottom-.02],.009,trim);
 rod([w*.3,.27,back+.15],[w*.3,.27,back-.06],.035,0x727b7e);
 function finish(parts,name,material){const geo=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());geo.computeBoundingSphere();const m=new THREE.Mesh(geo,material);m.name=name;m.castShadow=true;m.receiveShadow=true;g.add(m);}
 finish(opaque,'Sculpted vehicle body, cabin and wheels',new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6}));
 finish(lamps,'Vehicle lamps',new THREE.MeshStandardMaterial({vertexColors:true,roughness:.35}));
 g.userData.driverSeat={...seat};
 // Where the driver's hands go (people/vehicle-driver.js): the rim at nine and three.
 g.userData.steeringWheel={x:seat.x,y:belt+.10,z:seat.z+.32,r:.13};g.userData.vehicleStyle=car?'1990s Japanese compact hatchback':delivery?'1990s Japanese cab-over delivery truck':'1990s Japanese kei pickup';
 g.visible=false;g.userData.dynamicProp=true;g.userData.walkSurface=false;return g;
}
